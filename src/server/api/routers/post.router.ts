import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { posts, users, votes } from "@/server/db/schema";
import { db } from "@/server/db";
import { desc, count, eq, sql } from "drizzle-orm";

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
        imgUrl: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;
      await db.insert(posts).values({
        title: input.title,
        content: input.content,
        status: input.status,
        city: input.city,
        imgUrl: input.imgUrl,
        createdById: userId,
      });
    }),

  getAllPaginated: protectedProcedure
    .input(
      z.object({
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
          .groupBy(posts.id, users.id)
          .orderBy(desc(posts.createdAt))
          .limit(input.limit)
          .offset(offset),

        db.select({ count: count() }).from(posts),
      ]);

      const total = Number(totalResult[0]?.count ?? 0);

      return {
        items: items.map((item) => ({
          id: item.id,
          title: item.title,
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
});
