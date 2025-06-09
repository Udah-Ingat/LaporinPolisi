// Note: Save this code in src/server/api/routers/user.ts
import { z } from "zod";
import { eq, sql } from "drizzle-orm";
import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "@/server/api/trpc";
import { users, userProfiles, reports } from "@/server/db/schema";
import { TRPCError } from "@trpc/server";

export const userRouter = createTRPCRouter({
  // Get user profile
  getProfile: publicProcedure
    .input(z.object({ userId: z.string() }))
    .query(async ({ ctx, input }) => {
      const [user] = await ctx.db
        .select({
          user: users,
          profile: userProfiles,
          reportCount: sql<number>`count(distinct ${reports.id})`,
        })
        .from(users)
        .leftJoin(userProfiles, eq(users.id, userProfiles.userId))
        .leftJoin(reports, eq(users.id, reports.createdById))
        .where(eq(users.id, input.userId))
        .groupBy(users.id, userProfiles.id);

      if (!user) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      return {
        ...user.user,
        profile: user.profile,
        reportCount: Number(user.reportCount),
      };
    }),

  // Update profile
  updateProfile: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1).max(255).optional(),
        bio: z.string().max(500).optional(),
        location: z.string().max(255).optional(),
        communities: z.array(z.string()).optional(),
        notes: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      // Update user table
      if (input.name !== undefined || input.bio !== undefined || input.location !== undefined) {
        await ctx.db
          .update(users)
          .set({
            name: input.name,
            bio: input.bio,
            location: input.location,
          })
          .where(eq(users.id, userId));
      }

      // Update or create user profile
      if (input.communities !== undefined || input.notes !== undefined) {
        const [existingProfile] = await ctx.db
          .select()
          .from(userProfiles)
          .where(eq(userProfiles.userId, userId));

        if (existingProfile) {
          await ctx.db
            .update(userProfiles)
            .set({
              communities: input.communities,
              notes: input.notes,
            })
            .where(eq(userProfiles.userId, userId));
        } else {
          await ctx.db.insert(userProfiles).values({
            userId,
            communities: input.communities ?? [],
            notes: input.notes,
          });
        }
      }

      return { success: true };
    }),

  // Get current user
  getCurrentUser: protectedProcedure.query(async ({ ctx }) => {
    const [user] = await ctx.db
      .select({
        user: users,
        profile: userProfiles,
      })
      .from(users)
      .leftJoin(userProfiles, eq(users.id, userProfiles.userId))
      .where(eq(users.id, ctx.session.user.id));

    if (!user) {
      throw new TRPCError({ code: "NOT_FOUND" });
    }

    return {
      ...user.user,
      profile: user.profile,
    };
  }),

  // Search users
  search: publicProcedure
    .input(
      z.object({
        query: z.string().min(1),
        limit: z.number().min(1).max(20).default(10),
      }),
    )
    .query(async ({ ctx, input }) => {
      const results = await ctx.db
        .select({
          id: users.id,
          name: users.name,
          image: users.image,
          location: users.location,
        })
        .from(users)
        .where(sql`${users.name} ILIKE ${'%' + input.query + '%'}`)
        .limit(input.limit);

      return results;
    }),
});