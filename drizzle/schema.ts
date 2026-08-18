import { boolean, float, int, mysqlEnum, mysqlTable, text, timestamp, uniqueIndex, varchar } from "drizzle-orm/mysql-core";

export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export const userProfiles = mysqlTable("user_profiles", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  locale: varchar("locale", { length: 16 }).notNull().default("zh-HK"),
  timezone: varchar("timezone", { length: 64 }).notNull().default("Asia/Hong_Kong"),
  hasCompletedBaseline: boolean("hasCompletedBaseline").notNull().default(false),
  comfortableLowMidi: int("comfortableLowMidi"),
  comfortableHighMidi: int("comfortableHighMidi"),
  rhythmBaseline: float("rhythmBaseline"),
  preferredDifficulty: mysqlEnum("preferredDifficulty", ["beginner", "intermediate", "advanced"]).notNull().default("beginner"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => [uniqueIndex("user_profiles_user_id_unique").on(table.userId)]);

export const practiceSessions = mysqlTable("practice_sessions", {
  id: varchar("id", { length: 36 }).primaryKey(),
  userId: int("userId").notNull(),
  category: mysqlEnum("category", ["warmup", "pitch", "rhythm"]).notNull(),
  exerciseKey: varchar("exerciseKey", { length: 96 }).notNull(),
  difficulty: mysqlEnum("difficulty", ["beginner", "intermediate", "advanced"]).notNull(),
  tempo: mysqlEnum("tempo", ["slow", "normal", "fast"]).notNull(),
  plannedDurationSeconds: int("plannedDurationSeconds").notNull(),
  actualDurationSeconds: int("actualDurationSeconds").notNull().default(0),
  completedAt: timestamp("completedAt").defaultNow().notNull(),
  idempotencyKey: varchar("idempotencyKey", { length: 64 }).notNull(),
}, (table) => [uniqueIndex("practice_sessions_idempotency_unique").on(table.idempotencyKey)]);

export const sessionMetrics = mysqlTable("session_metrics", {
  id: int("id").autoincrement().primaryKey(),
  sessionId: varchar("sessionId", { length: 36 }).notNull(),
  pitchStability: float("pitchStability"),
  rhythmAccuracy: float("rhythmAccuracy"),
  completionCount: int("completionCount").notNull().default(0),
  nextStep: varchar("nextStep", { length: 280 }).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => [uniqueIndex("session_metrics_session_id_unique").on(table.sessionId)]);

export const notificationPreferences = mysqlTable("notification_preferences", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  gentleReminderEnabled: boolean("gentleReminderEnabled").notNull().default(true),
  daysUntilGentleReminder: int("daysUntilGentleReminder").notNull().default(3),
  lastReminderAt: timestamp("lastReminderAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => [uniqueIndex("notification_preferences_user_id_unique").on(table.userId)]);

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type UserProfile = typeof userProfiles.$inferSelect;
export type PracticeSession = typeof practiceSessions.$inferSelect;
