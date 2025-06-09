import { z } from "zod";
import { eq, desc, like, or, and, sql, inArray } from "drizzle-orm";
import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "@/server/api/trpc";
import {
  reports,
  tags,
  reportTags,
  likes,
  comments,
  shares,
  reportViolations,
  users,
} from "@/server/db/schema";
import { TRPCError } from "@trpc/server";

export const reportRouter = createTRPCRouter({
  // Create a new report
  create: protectedProcedure
    .input(
      z.object({
        title: z.string().min(1).max(256),
        description: z.string().min(1),
        imageUrl: z.string().url().optional(),
        location: z.string().min(1).max(256),
        tags: z.array(z.string()).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const reportId = await ctx.db.transaction(async (tx) => {
        // Insert report
        const [report] = await tx
          .insert(reports)
          .values({
            title: input.title,
            description: input.description,
            imageUrl: input.imageUrl,
            location: input.location,
            createdById: ctx.session.user.id,
          })
          .returning({ id: reports.id });

        if (!report) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

        // Handle tags if provided
        if (input.tags && input.tags.length > 0) {
          // Get or create tags
          const tagPromises = input.tags.map(async (tagName) => {
            const [existingTag] = await tx
              .select()
              .from(tags)
              .where(eq(tags.name, tagName.toLowerCase()));

            if (existingTag) {
              return existingTag;
            }

            const [newTag] = await tx
              .insert(tags)
              .values({ name: tagName.toLowerCase() })
              .returning();

            return newTag;
          });

          const resolvedTags = await Promise.all(tagPromises);

          // Create report-tag relationships
          if (resolvedTags.length > 0) {
            await tx.insert(reportTags).values(
              resolvedTags.map((tag) => ({
                reportId: report.id,
                tagId: tag!.id,
              })),
            );
          }
        }

        return report.id;
      });

      return { id: reportId };
    }),

  // Get all reports with filters
  getAll: publicProcedure
    .input(
        z.object({
        limit: z.number().min(1).max(100).default(20),
        offset: z.number().default(0),
        search: z.string().optional(),
        location: z.string().optional(),
        tags: z.array(z.string()).optional(),
        sortBy: z.enum(["latest", "popular"]).default("latest"),
        }),
    )
    .query(async ({ ctx, input }) => {
        let reportIds: number[] | undefined;
        if (input.tags && input.tags.length > 0) {
        const reportsWithTags = await ctx.db
            .selectDistinct({ reportId: reportTags.reportId })
            .from(reportTags)
            .innerJoin(tags, eq(reportTags.tagId, tags.id))
            .where(
            inArray(
                tags.name, 
                input.tags.map(t => t.toLowerCase())
            )
            );
        
        reportIds = reportsWithTags.map(r => r.reportId);
        if (reportIds.length === 0) return [];
        }

        // Build conditions
        const conditions = [
        eq(reports.status, "active"),
        input.search
            ? or(
                like(reports.title, `%${input.search}%`),
                like(reports.description, `%${input.search}%`),
            )
            : undefined,
        input.location
            ? like(reports.location, `%${input.location}%`)
            : undefined,
        reportIds ? inArray(reports.id, reportIds) : undefined,
        ].filter(Boolean);

        // Execute query
        const results = await ctx.db
        .select({
            report: reports,
            user: {
            id: users.id,
            name: users.name,
            image: users.image,
            },
            likesCount: sql<number>`count(distinct ${likes.userId})`,
            commentsCount: sql<number>`count(distinct ${comments.id})`,
            likedByUser: ctx.session?.user
            ? sql<boolean>`coalesce(bool_or(${likes.userId} = ${ctx.session.user.id}), false)`
            : sql<boolean>`false`,
        })
        .from(reports)
        .leftJoin(users, eq(reports.createdById, users.id))
        .leftJoin(likes, eq(reports.id, likes.reportId))
        .leftJoin(comments, eq(reports.id, comments.reportId))
        .where(and(...conditions))
        .groupBy(reports.id, users.id)
        .orderBy(
            input.sortBy === "popular"
            ? desc(sql`count(distinct ${likes.userId})`)
            : desc(reports.createdAt)
        )
        .limit(input.limit)
        .offset(input.offset);

        // Get report IDs from results
        const resultReportIds = results.map(r => r.report.id);

        // Get tags for reports in current page
        const reportTagsData = await ctx.db
        .select({
            reportId: reportTags.reportId,
            tag: tags,
        })
        .from(reportTags)
        .innerJoin(tags, eq(reportTags.tagId, tags.id))
        .where(inArray(reportTags.reportId, resultReportIds));

        // Group tags by report ID
        const tagsByReport = reportTagsData.reduce(
        (acc, rt) => {
            acc[rt.reportId] ??= [];
            acc[rt.reportId]!.push(rt.tag);
            return acc;
        },
        {} as Record<number, (typeof tags.$inferSelect)[]>
        );

        return results.map(r => ({
        ...r.report,
        user: r.user,
        likesCount: Number(r.likesCount),
        commentsCount: Number(r.commentsCount),
        likedByUser: r.likedByUser,
        tags: tagsByReport[r.report.id] ?? [],
        }));
    }),

  // Get single report by ID
  getById: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      const [result] = await ctx.db
        .select({
          report: reports,
          user: {
            id: users.id,
            name: users.name,
            image: users.image,
            location: users.location,
          },
          likesCount: sql<number>`count(distinct ${likes.userId})`,
          commentsCount: sql<number>`count(distinct ${comments.id})`,
          sharesCount: sql<number>`count(distinct ${shares.id})`,
          likedByUser: ctx.session?.user
            ? sql<boolean>`bool_or(${likes.userId} = ${ctx.session.user.id})`
            : sql<boolean>`false`,
        })
        .from(reports)
        .leftJoin(users, eq(reports.createdById, users.id))
        .leftJoin(likes, eq(reports.id, likes.reportId))
        .leftJoin(comments, eq(reports.id, comments.reportId))
        .leftJoin(shares, eq(reports.id, shares.reportId))
        .where(eq(reports.id, input.id))
        .groupBy(reports.id, users.id);

      if (!result) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      // Get tags
      const reportTagsData = await ctx.db
        .select({ tag: tags })
        .from(reportTags)
        .innerJoin(tags, eq(reportTags.tagId, tags.id))
        .where(eq(reportTags.reportId, input.id));

      return {
        ...result.report,
        user: result.user,
        likesCount: Number(result.likesCount),
        commentsCount: Number(result.commentsCount),
        sharesCount: Number(result.sharesCount),
        likedByUser: result.likedByUser,
        tags: reportTagsData.map((rt) => rt.tag),
      };
    }),

  // Toggle like
  toggleLike: protectedProcedure
    .input(z.object({ reportId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const existingLike = await ctx.db
        .select()
        .from(likes)
        .where(
          and(
            eq(likes.reportId, input.reportId),
            eq(likes.userId, ctx.session.user.id),
          ),
        );

      if (existingLike.length > 0) {
        await ctx.db
          .delete(likes)
          .where(
            and(
              eq(likes.reportId, input.reportId),
              eq(likes.userId, ctx.session.user.id),
            ),
          );
        return { liked: false };
      } else {
        await ctx.db.insert(likes).values({
          reportId: input.reportId,
          userId: ctx.session.user.id,
        });
        return { liked: true };
      }
    }),

  // Add comment
  addComment: protectedProcedure
    .input(
      z.object({
        reportId: z.number(),
        content: z.string().min(1),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const [comment] = await ctx.db
        .insert(comments)
        .values({
          reportId: input.reportId,
          userId: ctx.session.user.id,
          content: input.content,
        })
        .returning();

      return comment;
    }),

  // Get comments for a report
  getComments: publicProcedure
    .input(
      z.object({
        reportId: z.number(),
        limit: z.number().min(1).max(50).default(20),
        offset: z.number().default(0),
      }),
    )
    .query(async ({ ctx, input }) => {
      const results = await ctx.db
        .select({
          comment: comments,
          user: {
            id: users.id,
            name: users.name,
            image: users.image,
          },
        })
        .from(comments)
        .leftJoin(users, eq(comments.userId, users.id))
        .where(eq(comments.reportId, input.reportId))
        .orderBy(desc(comments.createdAt))
        .limit(input.limit)
        .offset(input.offset);

      return results.map((r) => ({
        ...r.comment,
        user: r.user,
      }));
    }),

  // Share report
  share: protectedProcedure
    .input(
      z.object({
        reportId: z.number(),
        platform: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      await ctx.db.insert(shares).values({
        reportId: input.reportId,
        userId: ctx.session.user.id,
        platform: input.platform,
      });

      return { success: true };
    }),

  // Report a violation
  reportViolation: protectedProcedure
    .input(
      z.object({
        reportId: z.number(),
        reason: z.string().min(1),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // Check if user already reported this
      const existing = await ctx.db
        .select()
        .from(reportViolations)
        .where(
          and(
            eq(reportViolations.reportId, input.reportId),
            eq(reportViolations.reportedBy, ctx.session.user.id),
          ),
        );

      if (existing.length > 0) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "You have already reported this post",
        });
      }

      await ctx.db.insert(reportViolations).values({
        reportId: input.reportId,
        reportedBy: ctx.session.user.id,
        reason: input.reason,
      });

      return { success: true };
    }),

  // Get user's reports
  getUserReports: publicProcedure
    .input(
      z.object({
        userId: z.string(),
        limit: z.number().min(1).max(50).default(20),
        offset: z.number().default(0),
      }),
    )
    .query(async ({ ctx, input }) => {
      const results = await ctx.db
        .select({
          report: reports,
          likesCount: sql<number>`count(distinct ${likes.userId})`,
          commentsCount: sql<number>`count(distinct ${comments.id})`,
        })
        .from(reports)
        .leftJoin(likes, eq(reports.id, likes.reportId))
        .leftJoin(comments, eq(reports.id, comments.reportId))
        .where(
          and(
            eq(reports.createdById, input.userId),
            eq(reports.status, "active"),
          ),
        )
        .groupBy(reports.id)
        .orderBy(desc(reports.createdAt))
        .limit(input.limit)
        .offset(input.offset);

      return results.map((r) => ({
        ...r.report,
        likesCount: Number(r.likesCount),
        commentsCount: Number(r.commentsCount),
      }));
    }),
});