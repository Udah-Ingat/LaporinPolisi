import { relations, sql } from "drizzle-orm";
import {
  index,
  integer,
  pgTableCreator,
  primaryKey,
  text,
  timestamp,
  varchar,
  boolean,
  jsonb,
} from "drizzle-orm/pg-core";
import { type AdapterAccount } from "next-auth/adapters";

/**
 * This is an example of how to use the multi-project schema feature of Drizzle ORM. Use the same
 * database instance for multiple projects.
 *
 * @see https://orm.drizzle.team/docs/goodies#multi-project-schema
 */
export const createTable = pgTableCreator((name) => `laporinpolisi_${name}`);

// Users table
export const users = createTable("user", (d) => ({
  id: d
    .varchar({ length: 255 })
    .notNull()
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: d.varchar({ length: 255 }),
  email: d.varchar({ length: 255 }).notNull(),
  emailVerified: d
    .timestamp({
      mode: "date",
      withTimezone: true,
    })
    .default(sql`CURRENT_TIMESTAMP`),
  image: d.varchar({ length: 255 }),
  bio: d.text(),
  location: d.varchar({ length: 255 }),
  joinedAt: d
    .timestamp({ withTimezone: true })
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  isAdmin: d.boolean().default(false).notNull(),
}));

// User profiles (extended info)
export const userProfiles = createTable("user_profile", (d) => ({
  id: d.integer().primaryKey().generatedByDefaultAsIdentity(),
  userId: d
    .varchar({ length: 255 })
    .notNull()
    .unique()
    .references(() => users.id, { onDelete: "cascade" }),
  communities: d.jsonb().$type<string[]>().default([]).notNull(),
  notes: d.text(),
  createdAt: d
    .timestamp({ withTimezone: true })
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  updatedAt: d.timestamp({ withTimezone: true }).$onUpdate(() => new Date()),
}));

// Reports (main posts)
export const reports = createTable(
  "report",
  (d) => ({
    id: d.integer().primaryKey().generatedByDefaultAsIdentity(),
    title: d.varchar({ length: 256 }).notNull(),
    description: d.text().notNull(),
    imageUrl: d.varchar({ length: 512 }),
    location: d.varchar({ length: 256 }).notNull(),
    status: d.varchar({ length: 50 }).default("active").notNull(), // active, resolved, deleted
    isValid: d.boolean().default(true).notNull(),
    createdById: d
      .varchar({ length: 255 })
      .notNull()
      .references(() => users.id),
    createdAt: d
      .timestamp({ withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: d.timestamp({ withTimezone: true }).$onUpdate(() => new Date()),
  }),
  (t) => [
    index("report_created_by_idx").on(t.createdById),
    index("report_location_idx").on(t.location),
    index("report_status_idx").on(t.status),
  ],
);

// Tags
export const tags = createTable(
  "tag",
  (d) => ({
    id: d.integer().primaryKey().generatedByDefaultAsIdentity(),
    name: d.varchar({ length: 50 }).notNull().unique(),
    createdAt: d
      .timestamp({ withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
  }),
  (t) => [index("tag_name_idx").on(t.name)],
);

// Report Tags (many-to-many)
export const reportTags = createTable(
  "report_tag",
  (d) => ({
    reportId: d
      .integer()
      .notNull()
      .references(() => reports.id, { onDelete: "cascade" }),
    tagId: d
      .integer()
      .notNull()
      .references(() => tags.id, { onDelete: "cascade" }),
  }),
  (t) => [
    primaryKey({ columns: [t.reportId, t.tagId] }),
    index("report_tag_report_idx").on(t.reportId),
    index("report_tag_tag_idx").on(t.tagId),
  ],
);

// Comments
export const comments = createTable(
  "comment",
  (d) => ({
    id: d.integer().primaryKey().generatedByDefaultAsIdentity(),
    content: d.text().notNull(),
    reportId: d
      .integer()
      .notNull()
      .references(() => reports.id, { onDelete: "cascade" }),
    userId: d
      .varchar({ length: 255 })
      .notNull()
      .references(() => users.id),
    createdAt: d
      .timestamp({ withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
  }),
  (t) => [
    index("comment_report_idx").on(t.reportId),
    index("comment_user_idx").on(t.userId),
  ],
);

// Likes
export const likes = createTable(
  "like",
  (d) => ({
    reportId: d
      .integer()
      .notNull()
      .references(() => reports.id, { onDelete: "cascade" }),
    userId: d
      .varchar({ length: 255 })
      .notNull()
      .references(() => users.id),
    createdAt: d
      .timestamp({ withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
  }),
  (t) => [
    primaryKey({ columns: [t.reportId, t.userId] }),
    index("like_report_idx").on(t.reportId),
    index("like_user_idx").on(t.userId),
  ],
);

// Shares
export const shares = createTable(
  "share",
  (d) => ({
    id: d.integer().primaryKey().generatedByDefaultAsIdentity(),
    reportId: d
      .integer()
      .notNull()
      .references(() => reports.id, { onDelete: "cascade" }),
    userId: d
      .varchar({ length: 255 })
      .notNull()
      .references(() => users.id),
    platform: d.varchar({ length: 50 }), // whatsapp, telegram, etc
    createdAt: d
      .timestamp({ withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
  }),
  (t) => [
    index("share_report_idx").on(t.reportId),
    index("share_user_idx").on(t.userId),
  ],
);

// Report Violations (users reporting posts)
export const reportViolations = createTable(
  "report_violation",
  (d) => ({
    id: d.integer().primaryKey().generatedByDefaultAsIdentity(),
    reportId: d
      .integer()
      .notNull()
      .references(() => reports.id, { onDelete: "cascade" }),
    reportedBy: d
      .varchar({ length: 255 })
      .notNull()
      .references(() => users.id),
    reason: d.text().notNull(),
    status: d.varchar({ length: 50 }).default("pending").notNull(), // pending, reviewed, resolved
    reviewedBy: d.varchar({ length: 255 }).references(() => users.id),
    reviewedAt: d.timestamp({ withTimezone: true }),
    createdAt: d
      .timestamp({ withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
  }),
  (t) => [
    index("violation_report_idx").on(t.reportId),
    index("violation_status_idx").on(t.status),
  ],
);

// Auth tables (keeping existing structure)
export const accounts = createTable(
  "account",
  (d) => ({
    userId: d
      .varchar({ length: 255 })
      .notNull()
      .references(() => users.id),
    type: d.varchar({ length: 255 }).$type<AdapterAccount["type"]>().notNull(),
    provider: d.varchar({ length: 255 }).notNull(),
    providerAccountId: d.varchar({ length: 255 }).notNull(),
    refresh_token: d.text(),
    access_token: d.text(),
    expires_at: d.integer(),
    token_type: d.varchar({ length: 255 }),
    scope: d.varchar({ length: 255 }),
    id_token: d.text(),
    session_state: d.varchar({ length: 255 }),
  }),
  (t) => [
    primaryKey({ columns: [t.provider, t.providerAccountId] }),
    index("account_user_id_idx").on(t.userId),
  ],
);

export const sessions = createTable(
  "session",
  (d) => ({
    sessionToken: d.varchar({ length: 255 }).notNull().primaryKey(),
    userId: d
      .varchar({ length: 255 })
      .notNull()
      .references(() => users.id),
    expires: d.timestamp({ mode: "date", withTimezone: true }).notNull(),
  }),
  (t) => [index("session_user_id_idx").on(t.userId)],
);

export const verificationTokens = createTable(
  "verification_token",
  (d) => ({
    identifier: d.varchar({ length: 255 }).notNull(),
    token: d.varchar({ length: 255 }).notNull(),
    expires: d.timestamp({ mode: "date", withTimezone: true }).notNull(),
  }),
  (t) => [primaryKey({ columns: [t.identifier, t.token] })],
);

// Relations
export const usersRelations = relations(users, ({ many, one }) => ({
  accounts: many(accounts),
  reports: many(reports),
  comments: many(comments),
  likes: many(likes),
  shares: many(shares),
  profile: one(userProfiles),
}));

export const userProfilesRelations = relations(userProfiles, ({ one }) => ({
  user: one(users, {
    fields: [userProfiles.userId],
    references: [users.id],
  }),
}));

export const reportsRelations = relations(reports, ({ one, many }) => ({
  createdBy: one(users, {
    fields: [reports.createdById],
    references: [users.id],
  }),
  comments: many(comments),
  likes: many(likes),
  shares: many(shares),
  tags: many(reportTags),
  violations: many(reportViolations),
}));

export const tagsRelations = relations(tags, ({ many }) => ({
  reports: many(reportTags),
}));

export const reportTagsRelations = relations(reportTags, ({ one }) => ({
  report: one(reports, {
    fields: [reportTags.reportId],
    references: [reports.id],
  }),
  tag: one(tags, {
    fields: [reportTags.tagId],
    references: [tags.id],
  }),
}));

export const commentsRelations = relations(comments, ({ one }) => ({
  report: one(reports, {
    fields: [comments.reportId],
    references: [reports.id],
  }),
  user: one(users, {
    fields: [comments.userId],
    references: [users.id],
  }),
}));

export const likesRelations = relations(likes, ({ one }) => ({
  report: one(reports, {
    fields: [likes.reportId],
    references: [reports.id],
  }),
  user: one(users, {
    fields: [likes.userId],
    references: [users.id],
  }),
}));

export const sharesRelations = relations(shares, ({ one }) => ({
  report: one(reports, {
    fields: [shares.reportId],
    references: [reports.id],
  }),
  user: one(users, {
    fields: [shares.userId],
    references: [users.id],
  }),
}));

export const reportViolationsRelations = relations(
  reportViolations,
  ({ one }) => ({
    report: one(reports, {
      fields: [reportViolations.reportId],
      references: [reports.id],
    }),
    reportedBy: one(users, {
      fields: [reportViolations.reportedBy],
      references: [users.id],
    }),
    reviewer: one(users, {
      fields: [reportViolations.reviewedBy],
      references: [users.id],
    }),
  }),
);

export const accountsRelations = relations(accounts, ({ one }) => ({
  user: one(users, { fields: [accounts.userId], references: [users.id] }),
}));

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, { fields: [sessions.userId], references: [users.id] }),
}));