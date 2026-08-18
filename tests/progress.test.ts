import { describe, expect, it } from "vitest";
import { summarisePractice } from "../lib/progress";

describe("進度彙總", () => {
  it("將 session 轉成週／月日數與分項平均", () => {
    const now = new Date("2026-08-18T12:00:00+08:00");
    const summary = summarisePractice([
      { category: "pitch", completedAt: "2026-08-18T10:00:00+08:00", pitchStability: 0.8, rhythmAccuracy: null, completionCount: 1 },
      { category: "rhythm", completedAt: "2026-08-16T10:00:00+08:00", pitchStability: null, rhythmAccuracy: 0.6, completionCount: 4 },
      { category: "pitch", completedAt: "2026-08-16T15:00:00+08:00", pitchStability: 0.6, rhythmAccuracy: null, completionCount: 1 },
    ], now);
    expect(summary.weekDays).toBe(2);
    expect(summary.monthDays).toBe(2);
    expect(summary.totalSessions).toBe(3);
    expect(summary.pitchAverage).toBeCloseTo(0.7, 5);
    expect(summary.rhythmAverage).toBeCloseTo(0.6, 5);
    expect(summary.completionCount).toBe(6);
  });
});
