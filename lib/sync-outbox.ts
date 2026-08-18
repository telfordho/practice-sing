import AsyncStorage from "@react-native-async-storage/async-storage";

const OUTBOX_KEY = "lienghaaseng.practice-outbox.v1";

export type PendingPracticeCompletion = {
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
};

async function readOutbox(): Promise<PendingPracticeCompletion[]> {
  const raw = await AsyncStorage.getItem(OUTBOX_KEY);
  if (!raw) return [];
  try { return JSON.parse(raw) as PendingPracticeCompletion[]; } catch { return []; }
}

export async function enqueuePracticeCompletion(item: PendingPracticeCompletion) {
  const existing = await readOutbox();
  if (existing.some((entry) => entry.idempotencyKey === item.idempotencyKey)) return;
  await AsyncStorage.setItem(OUTBOX_KEY, JSON.stringify([...existing, item]));
}

export async function flushPracticeOutbox(send: (item: PendingPracticeCompletion) => Promise<unknown>) {
  const pending = await readOutbox();
  const remaining: PendingPracticeCompletion[] = [];
  for (const item of pending) {
    try { await send(item); } catch { remaining.push(item); }
  }
  await AsyncStorage.setItem(OUTBOX_KEY, JSON.stringify(remaining));
  return { sent: pending.length - remaining.length, pending: remaining.length };
}
