import { and, desc, eq, inArray } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { randomUUID } from "node:crypto";
import { notificationPreferences, practiceSessions, sessionMetrics, type InsertUser, type UserProfile, userProfiles, users } from "../drizzle/schema";
import { ENV } from "./_core/env";

let database: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!database && process.env.DATABASE_URL) {
    database = drizzle(process.env.DATABASE_URL);
  }
  return database;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) throw new Error("User openId is required");
  const db = await getDb();
  if (!db) return;
  await db.insert(users).values({
    openId: user.openId,
    name: user.name ?? null,
    email: user.email ?? null,
    loginMethod: user.loginMethod ?? null,
    role: user.role ?? (user.openId === ENV.ownerOpenId ? "admin" : "user"),
    lastSignedIn: user.lastSignedIn ?? new Date(),
  }).onDuplicateKeyUpdate({
    set: { name: user.name ?? null, email: user.email ?? null, loginMethod: user.loginMethod ?? null, lastSignedIn: new Date() },
  });
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result[0];
}

export async function getOrCreateProfile(userId: number): Promise<UserProfile | null> {
  const db = await getDb();
  if (!db) return null;
  const existing = await db.select().from(userProfiles).where(eq(userProfiles.userId, userId)).limit(1);
  if (existing[0]) return existing[0];
  await db.insert(userProfiles).values({ userId });
  const created = await db.select().from(userProfiles).where(eq(userProfiles.userId, userId)).limit(1);
  return created[0] ?? null;
}

export async function saveBaseline(userId: number, input: { lowMidi: number; highMidi: number; rhythmBaseline: number }) {
  const db = await getDb();
  if (!db) throw new Error("Database unavailable");
  await getOrCreateProfile(userId);
  await db.update(userProfiles).set({
    hasCompletedBaseline: true,
    comfortableLowMidi: input.lowMidi,
    comfortableHighMidi: input.highMidi,
    rhythmBaseline: input.rhythmBaseline,
  }).where(eq(userProfiles.userId, userId));
  return getOrCreateProfile(userId);
}

export async function recordPracticeSession(userId: number, input: {
  idempotencyKey: string;
  category: "warmup" | "pitch" | "rhythm";
  exerciseKey: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  tempo: "slow" | "normal" | "fast";
  plannedDurationSeconds: number;
  actualDurationSeconds: number;
  pitchStability?: number;
  rhythmAccuracy?: number;
  completionCount: number;
  nextStep: string;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database unavailable");
  const existing = await db.select().from(practiceSessions).where(eq(practiceSessions.idempotencyKey, input.idempotencyKey)).limit(1);
  if (existing[0]) return existing[0];
  const id = randomUUID();
  await db.insert(practiceSessions).values({
    id, userId, category: input.category, exerciseKey: input.exerciseKey, difficulty: input.difficulty,
    tempo: input.tempo, plannedDurationSeconds: input.plannedDurationSeconds,
    actualDurationSeconds: input.actualDurationSeconds, idempotencyKey: input.idempotencyKey,
  });
  await db.insert(sessionMetrics).values({
    sessionId: id, pitchStability: input.pitchStability, rhythmAccuracy: input.rhythmAccuracy,
    completionCount: input.completionCount, nextStep: input.nextStep,
  });
  return (await db.select().from(practiceSessions).where(and(eq(practiceSessions.id, id), eq(practiceSessions.userId, userId))).limit(1))[0];
}

export async function getRecentPractice(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(practiceSessions).where(eq(practiceSessions.userId, userId)).orderBy(desc(practiceSessions.completedAt)).limit(60);
}

export async function getPracticeDashboard(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select({
    category: practiceSessions.category,
    completedAt: practiceSessions.completedAt,
    pitchStability: sessionMetrics.pitchStability,
    rhythmAccuracy: sessionMetrics.rhythmAccuracy,
    completionCount: sessionMetrics.completionCount,
  }).from(practiceSessions).leftJoin(sessionMetrics, eq(sessionMetrics.sessionId, practiceSessions.id))
    .where(eq(practiceSessions.userId, userId)).orderBy(desc(practiceSessions.completedAt)).limit(120);
}

export async function updateGentleReminder(userId: number, enabled: boolean) {
  const db = await getDb();
  if (!db) throw new Error("Database unavailable");
  await db.insert(notificationPreferences).values({ userId, gentleReminderEnabled: enabled })
    .onDuplicateKeyUpdate({ set: { gentleReminderEnabled: enabled } });
  return (await db.select().from(notificationPreferences).where(eq(notificationPreferences.userId, userId)).limit(1))[0] ?? null;
}

export async function deleteUserData(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database unavailable");
  const sessions = await db.select({ id: practiceSessions.id }).from(practiceSessions).where(eq(practiceSessions.userId, userId));
  if (sessions.length) await db.delete(sessionMetrics).where(inArray(sessionMetrics.sessionId, sessions.map((session) => session.id)));
  await db.delete(practiceSessions).where(eq(practiceSessions.userId, userId));
  await db.delete(notificationPreferences).where(eq(notificationPreferences.userId, userId));
  await db.delete(userProfiles).where(eq(userProfiles.userId, userId));
  await db.delete(users).where(eq(users.id, userId));
  return { success: true } as const;
}
