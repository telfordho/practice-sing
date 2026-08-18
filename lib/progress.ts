export type DashboardRecord = {
  category: "warmup" | "pitch" | "rhythm";
  completedAt: Date | string;
  pitchStability: number | null;
  rhythmAccuracy: number | null;
  completionCount: number | null;
};

const dayKey = (date: Date) => `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;

export function summarisePractice(records: DashboardRecord[], now = new Date()) {
  const sinceWeek = new Date(now); sinceWeek.setDate(now.getDate() - 6); sinceWeek.setHours(0, 0, 0, 0);
  const sinceMonth = new Date(now); sinceMonth.setDate(now.getDate() - 29); sinceMonth.setHours(0, 0, 0, 0);
  const dated = records.map((record) => ({ ...record, date: new Date(record.completedAt) }));
  const weekly = dated.filter((record) => record.date >= sinceWeek);
  const monthly = dated.filter((record) => record.date >= sinceMonth);
  const pitch = records.map((record) => record.pitchStability).filter((value): value is number => typeof value === "number");
  const rhythm = records.map((record) => record.rhythmAccuracy).filter((value): value is number => typeof value === "number");
  return {
    weekDays: new Set(weekly.map((record) => dayKey(record.date))).size,
    monthDays: new Set(monthly.map((record) => dayKey(record.date))).size,
    totalSessions: records.length,
    pitchAverage: pitch.length ? pitch.reduce((sum, value) => sum + value, 0) / pitch.length : null,
    rhythmAverage: rhythm.length ? rhythm.reduce((sum, value) => sum + value, 0) / rhythm.length : null,
    completionCount: records.reduce((sum, record) => sum + (record.completionCount ?? 0), 0),
  };
}
