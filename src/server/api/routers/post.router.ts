import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { posts } from "@/server/db/schema";
import { db } from "@/server/db";

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
});
