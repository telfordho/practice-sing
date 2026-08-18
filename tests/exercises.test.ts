import { describe, expect, it } from "vitest";
import { EXERCISES, firstExercise } from "../lib/exercises";
import { practiceReducer } from "../contexts/practice-context";
import { hertzToMidi } from "../lib/music";

describe("練吓聲第一階段練習內容", () => {
  it("提供三類各三個核心練習", () => {
    expect(EXERCISES).toHaveLength(9);
    expect(EXERCISES.filter((exercise) => exercise.category === "warmup")).toHaveLength(3);
    expect(EXERCISES.filter((exercise) => exercise.category === "pitch")).toHaveLength(3);
    expect(EXERCISES.filter((exercise) => exercise.category === "rhythm")).toHaveLength(3);
  });

  it("每一類都有可直接開始的預設練習", () => {
    expect(firstExercise("warmup").key).toBe("warmup-glide");
    expect(firstExercise("pitch").key).toBe("pitch-single");
    expect(firstExercise("rhythm").key).toBe("rhythm-steady");
  });

  it("完成一組後只增加本日與連續練習狀態", () => {
    const next = practiceReducer({ selection: { category: "pitch", level: "beginner", tempo: "normal", minutes: 5 }, completedToday: 0, currentStreak: 0 }, { type: "complete" });
    expect(next.completedToday).toBe(1);
    expect(next.currentStreak).toBe(1);
  });

  it("可將標準鋼琴頻率換成目標音高線的 MIDI 座標", () => {
    expect(hertzToMidi(440)).toBeCloseTo(69, 5);
    expect(hertzToMidi(261.625565)).toBeCloseTo(60, 4);
  });
});
