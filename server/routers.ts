import { z } from "zod";
import { COOKIE_NAME } from "../shared/const.js";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";
import * as db from "./db";

const level = z.enum(["beginner", "intermediate", "advanced"]);
const tempo = z.enum(["slow", "normal", "fast"]);

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      ctx.res.clearCookie(COOKIE_NAME, { ...getSessionCookieOptions(ctx.req), maxAge: -1 });
      return { success: true } as const;
    }),
  }),
  profile: router({
    get: protectedProcedure.query(({ ctx }) => db.getOrCreateProfile(ctx.user.id)),
    saveBaseline: protectedProcedure.input(z.object({ lowMidi: z.number().int().min(24).max(84), highMidi: z.number().int().min(24).max(96), rhythmBaseline: z.number().min(0).max(1) }))
      .mutation(({ ctx, input }) => db.saveBaseline(ctx.user.id, input)),
  }),
  practice: router({
    recent: protectedProcedure.query(({ ctx }) => db.getRecentPractice(ctx.user.id)),
    dashboard: protectedProcedure.query(({ ctx }) => db.getPracticeDashboard(ctx.user.id)),
    complete: protectedProcedure.input(z.object({
      idempotencyKey: z.string().uuid(), category: z.enum(["warmup", "pitch", "rhythm"]), exerciseKey: z.string().min(1).max(96),
      difficulty: level, tempo, plannedDurationSeconds: z.number().int().min(60).max(1800), actualDurationSeconds: z.number().int().min(0).max(3600),
      pitchStability: z.number().min(0).max(1).optional(), rhythmAccuracy: z.number().min(0).max(1).optional(),
      completionCount: z.number().int().min(0).max(200), nextStep: z.string().min(1).max(280),
    })).mutation(({ ctx, input }) => db.recordPracticeSession(ctx.user.id, input)),
  }),
  notifications: router({
    setGentleReminder: protectedProcedure.input(z.object({ enabled: z.boolean() }))
      .mutation(({ ctx, input }) => db.updateGentleReminder(ctx.user.id, input.enabled)),
  }),
  privacy: router({
    deleteAllData: protectedProcedure.mutation(({ ctx }) => db.deleteUserData(ctx.user.id)),
  }),
});

export type AppRouter = typeof appRouter;
