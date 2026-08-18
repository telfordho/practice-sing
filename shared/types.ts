export const PRACTICE_CATEGORIES = ["warmup", "pitch", "rhythm"] as const;
export type PracticeCategory = (typeof PRACTICE_CATEGORIES)[number];

export const PRACTICE_LEVELS = ["beginner", "intermediate", "advanced"] as const;
export type PracticeLevel = (typeof PRACTICE_LEVELS)[number];

export const PRACTICE_TEMPOS = ["slow", "normal", "fast"] as const;
export type PracticeTempo = (typeof PRACTICE_TEMPOS)[number];

export interface ExerciseDefinition {
  key: string;
  category: PracticeCategory;
  title: string;
  subtitle: string;
  goal: string;
  accent: "coral" | "blue" | "gold";
  durations: Record<PracticeLevel, number>;
}

export interface BaselineResult {
  lowMidi: number;
  highMidi: number;
  rhythmBaseline: number;
}

export interface PracticeMetricsInput {
  pitchStability?: number;
  rhythmAccuracy?: number;
  completionCount: number;
  nextStep: string;
}
