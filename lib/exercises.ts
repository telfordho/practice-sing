import type { ExerciseDefinition, PracticeCategory } from "@/shared/types";

export const EXERCISES: ExerciseDefinition[] = [
  { key: "warmup-glide", category: "warmup", title: "輕柔滑音", subtitle: "由舒服音域慢慢滑上去", goal: "先放鬆，再慢慢打開把聲。", accent: "coral", durations: { beginner: 180, intermediate: 300, advanced: 420 } },
  { key: "warmup-five-note", category: "warmup", title: "五音階", subtitle: "穩穩地走過五個音", goal: "保持呼吸流動，唔使迫。", accent: "coral", durations: { beginner: 180, intermediate: 360, advanced: 540 } },
  { key: "warmup-range", category: "warmup", title: "音域熱身", subtitle: "在你舒服範圍內伸展", goal: "跟住自己舒服音域，逐步擴闊。", accent: "coral", durations: { beginner: 240, intermediate: 420, advanced: 600 } },
  { key: "pitch-single", category: "pitch", title: "單音跟唱", subtitle: "聽一次鋼琴，再跟住唱", goal: "留意自己條線慢慢靠近目標。", accent: "blue", durations: { beginner: 180, intermediate: 300, advanced: 420 } },
  { key: "pitch-scale", category: "pitch", title: "上下行音階", subtitle: "一級一級，唱得穩就得", goal: "每一個音都清楚落腳。", accent: "blue", durations: { beginner: 240, intermediate: 420, advanced: 600 } },
  { key: "pitch-leap", category: "pitch", title: "簡短跳音", subtitle: "練習聽清楚音與音之間", goal: "先喺慢速保持準確。", accent: "blue", durations: { beginner: 180, intermediate: 360, advanced: 540 } },
  { key: "rhythm-steady", category: "rhythm", title: "穩定跟拍", subtitle: "每一下都撳得穩", goal: "先找到舒服又一致嘅拍子。", accent: "gold", durations: { beginner: 180, intermediate: 300, advanced: 420 } },
  { key: "rhythm-return", category: "rhythm", title: "停拍後再入拍", subtitle: "聽住空白位，再準時返嚟", goal: "聽住內心節拍，唔好急。", accent: "gold", durations: { beginner: 180, intermediate: 360, advanced: 540 } },
  { key: "rhythm-pattern", category: "rhythm", title: "簡短節奏型", subtitle: "由簡單組合開始", goal: "先慢後快，拍子會更踏實。", accent: "gold", durations: { beginner: 240, intermediate: 420, advanced: 600 } },
];

export const CATEGORY_META: Record<PracticeCategory, { title: string; kicker: string; color: string; pale: string; icon: string }> = {
  warmup: { title: "開聲", kicker: "先喚醒把聲", color: "#EF6257", pale: "#F9DDD3", icon: "〰" },
  pitch: { title: "音準", kicker: "跟住條線，唱得更穩", color: "#2C62B8", pale: "#DCE7F7", icon: "⌁" },
  rhythm: { title: "拍子", kicker: "撳住節奏，練出穩定感", color: "#B9831E", pale: "#F8E8BB", icon: "●" },
};

export function firstExercise(category: PracticeCategory) {
  return EXERCISES.find((exercise) => exercise.category === category) ?? EXERCISES[0];
}
