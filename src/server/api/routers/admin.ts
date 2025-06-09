import { z } from "zod";
import { eq, desc, and, sql } from "drizzle-orm";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { reports, reportViolations, users } from "@/server/db/schema";
import { TRPCError } from "@trpc/server";

export const adminRouter = createTRPCRouter({
  // Get all report violations
  getViolations: protectedProcedure
    .input(
      z.object({
        status: z.enum(["pending", "reviewed", "resolved"]).optional(),
        limit: z.number().min(1).max(50).default(20),
        offset: z.number().default(0),
      }),
    )
    .query(async ({ ctx, input }) => {
      // Check if user is admin
      if (!ctx.session.user.isAdmin) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }

      const conditions = [];
      if (input.status) {
        conditions.push(eq(reportViolations.status, input.status));
      }

      const results = await ctx.db
        .select({
          violation: reportViolations,
          report: reports,
          reportedBy: {
            id: users.id,
            name: users.name,
            image: users.image,
          },
          reportCreator: {
            id: users.id,
            name: users.name,
            image: users.image,
          },
        })
        .from(reportViolations)
        .leftJoin(reports, eq(reportViolations.reportId, reports.id))
        .leftJoin(
          users,
          eq(reportViolations.reportedBy, users.id),
        )
        .leftJoin(
          users,
          eq(reports.createdById, users.id),
        )
        .where(conditions.length > 0 ? and(...conditions) : undefined)
        .orderBy(desc(reportViolations.createdAt))
        .limit(input.limit)
        .offset(input.offset);

      return results.map((r) => ({
        ...r.violation,
        report: r.report,
        reportedBy: r.reportedBy,
        reportCreator: r.reportCreator,
      }));
    }),

  // Review a violation
  reviewViolation: protectedProcedure
    .input(
      z.object({
        violationId: z.number(),
        action: z.enum(["delete_post", "dismiss", "warn_user"]),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // Check if user is admin
      if (!ctx.session.user.isAdmin) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }

      await ctx.db.transaction(async (tx) => {
        // Update violation status
        const [violation] = await tx
          .update(reportViolations)
          .set({
            status: "reviewed",
            reviewedBy: ctx.session.user.id,
            reviewedAt: new Date(),
          })
          .where(eq(reportViolations.id, input.violationId))
          .returning();

        if (!violation) {
          throw new TRPCError({ code: "NOT_FOUND" });
        }

        // Take action based on admin decision
        if (input.action === "delete_post") {
          await tx
            .update(reports)
            .set({ status: "deleted" })
            .where(eq(reports.id, violation.reportId));
        }
      });

      return { success: true };
    }),

  // Get admin statistics
  getStats: protectedProcedure.query(async ({ ctx }) => {
    // Check if user is admin
    if (!ctx.session.user.isAdmin) {
      throw new TRPCError({ code: "FORBIDDEN" });
    }

    const [stats] = await ctx.db
      .select({
        totalReports: sql<number>`count(distinct ${reports.id})`,
        activeReports: sql<number>`count(distinct case when ${reports.status} = 'active' then ${reports.id} end)`,
        deletedReports: sql<number>`count(distinct case when ${reports.status} = 'deleted' then ${reports.id} end)`,
        totalUsers: sql<number>`count(distinct ${users.id})`,
        pendingViolations: sql<number>`count(case when ${reportViolations.status} = 'pending' then 1 end)`,
      })
      .from(reports)
      .leftJoin(users, eq(reports.createdById, users.id))
      .leftJoin(reportViolations, eq(reports.id, reportViolations.reportId));

    return {
      totalReports: Number(stats?.totalReports ?? 0),
      activeReports: Number(stats?.activeReports ?? 0),
      deletedReports: Number(stats?.deletedReports ?? 0),
      totalUsers: Number(stats?.totalUsers ?? 0),
      pendingViolations: Number(stats?.pendingViolations ?? 0),
    };
  }),

  // Toggle user admin status
  toggleAdminStatus: protectedProcedure
    .input(z.object({ userId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // Check if current user is admin
      if (!ctx.session.user.isAdmin) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }

      // Prevent self-demotion
      if (input.userId === ctx.session.user.id) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Cannot change your own admin status",
        });
      }

      const [user] = await ctx.db
        .select({ isAdmin: users.isAdmin })
        .from(users)
        .where(eq(users.id, input.userId));

      if (!user) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      await ctx.db
        .update(users)
        .set({ isAdmin: !user.isAdmin })
        .where(eq(users.id, input.userId));

      return { isAdmin: !user.isAdmin };
    }),
});