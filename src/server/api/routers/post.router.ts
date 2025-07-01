import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { posts } from "@/server/db/schema";
import { db } from "@/server/db";
import { desc, count } from "drizzle-orm";

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

      const [items, total] = await Promise.all([
        db
          .select()
          .from(posts)
          .orderBy(desc(posts.createdAt))
          .limit(input.limit)
          .offset(offset),

        db
          .select({ count: count() })
          .from(posts)
          .then((res) => res[0]?.count ?? 0),
      ]);

      return {
        items,
        total,
        page: input.page,
        totalPages: Math.ceil(total / input.limit),
      };
    }),
});
