import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { posts, users, votes } from "@/server/db/schema";
import { db } from "@/server/db";
import { desc, count, eq, sql, or, ilike } from "drizzle-orm";
import { uploadBase64Image } from "@/lib/fileHelper";

export const postRouter = createTRPCRouter({
  create: protectedProcedure
    .input(
      z.object({
        title: z.string().min(1),
        content: z.string().optional(),
        status: z.enum([
          "",
          "belum dilaporkan",
          "sudah dilaporkan",
          "sudah diselesaikan",
          "laporan ditolak",
        ]),
        city: z.string().optional(),
        imgBase64: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;
      let imgUrl = null;
      if (input.imgBase64) {
        imgUrl = await uploadBase64Image(input.imgBase64);
      }

      await db.insert(posts).values({
        title: input.title,
        content: input.content,
        status: input.status,
        city: input.city,
        imgUrl,
        createdById: userId,
      });
    }),

  getFilteredPaginated: protectedProcedure
    .input(
      z.object({
        filter: z.string().optional().default(""),
        page: z.number().min(1).default(1),
        limit: z.number().min(1).max(100).default(10),
      }),
    )
    .query(async ({ input }) => {
      const offset = (input.page - 1) * input.limit;

      const [items, totalResult] = await Promise.all([
        db
          .select({
            id: posts.id,
            title: posts.title,
            content: posts.content,
            city: posts.city,
            imgUrl: posts.imgUrl,
            createdAt: posts.createdAt,
            updatedAt: posts.updatedAt,
            isVerified: posts.isVerified,
            userImage: users.image,
            username: users.name,
            upVoteCount: sql<number>`
                COALESCE(
                    SUM(CASE 
                    WHEN ${votes.isUpVote} IS TRUE THEN 1
                    WHEN ${votes.isUpVote} IS FALSE THEN -1
                    ELSE 0
                    END), 
                    0
                )
                `.as("upVoteCount"),
          })
          .from(posts)
          .leftJoin(users, eq(posts.createdById, users.id))
          .leftJoin(votes, eq(votes.postId, posts.id))
          .where(
            or(
              ilike(posts.title, `%${input.filter ?? ""}%`),
              ilike(posts.content, `%${input.filter ?? ""}%`),
              ilike(posts.city, `%${input.filter ?? ""}%`),
              ilike(users.name, `%${input.filter ?? ""}%`),
              //   ilike(sql`posts.created_at::text`, `%${input.filter ?? ""}%`),
            ),
          )
          .groupBy(posts.id, users.id)
          .orderBy(
            desc(
              sql`COALESCE(SUM(CASE WHEN ${votes.isUpVote} THEN 1 ELSE -1 END), 0)`,
            ),
            desc(posts.createdAt),
          )
          .limit(input.limit)
          .offset(offset),

        db.select({ count: count() }).from(posts),
      ]);

      const total = Number(totalResult[0]?.count ?? 0);

      return {
        items: items.map((item) => ({
          id: item.id,
          title: item.title,
          content: item.content,
          city: item.city,
          imgUrl: item.imgUrl,
          updatedAt: (() => {
            const d = new Date(item.updatedAt ?? item.createdAt);
            const day = d.getDate().toString().padStart(2, "0");
            const month = (d.getMonth() + 1).toString().padStart(2, "0");
            const year = d.getFullYear();
            const hour = d.getHours().toString().padStart(2, "0");
            const minute = d.getMinutes().toString().padStart(2, "0");
            return `${day}-${month}-${year} : ${hour}.${minute}`;
          })(),
          isVerified: item.isVerified,
          profileImgUrl: item.userImage ?? "",
          username: item.username ?? "Unknown",
          upVoteCount: item.upVoteCount ?? 0,
        })),
        total,
        page: input.page,
        totalPages: Math.ceil(total / input.limit),
      };
    }),

  addPostVote: protectedProcedure
    .input(
      z.object({
        postId: z.string(),
        isUpVote: z.boolean(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;
      await db
        .insert(votes)
        .values({
          userId,
          postId: input.postId,
          isUpVote: input.isUpVote,
        })
        .onConflictDoUpdate({
          target: [votes.userId, votes.postId],
          set: { isUpVote: input.isUpVote, updatedAt: new Date() },
        });
    }),
});
