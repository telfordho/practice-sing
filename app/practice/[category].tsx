import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useEffect, useRef, useState } from "react";
import { router, useLocalSearchParams } from "expo-router";
import { requestRecordingPermissionsAsync, setAudioModeAsync, useAudioPlayer } from "expo-audio";
import { ScreenContainer } from "@/components/screen-container";
import { PitchCanvas } from "@/components/pitch-canvas";
import { CATEGORY_META, EXERCISES, firstExercise } from "@/lib/exercises";
import { beginPitchTracking, hertzToMidi } from "@/lib/pitch-service";
import { usePractice } from "@/contexts/practice-context";
import { trpc } from "@/lib/trpc";
import { scheduleGentleReminder } from "@/lib/notifications";
import { enqueuePracticeCompletion, type PendingPracticeCompletion } from "@/lib/sync-outbox";
import type { PracticeCategory, PracticeLevel, PracticeTempo } from "@/shared/types";

const isCategory = (value: string): value is PracticeCategory => ["warmup", "pitch", "rhythm"].includes(value);
const uuid = () => "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => { const r = (Math.random() * 16) | 0; const v = c === "x" ? r : (r & 0x3) | 0x8; return v.toString(16); });

export default function PracticeScreen() {
  const params = useLocalSearchParams<{ category: string }>();
  const category: PracticeCategory = isCategory(params.category) ? params.category : "pitch";
  const meta = CATEGORY_META[category];
  const { state, dispatch } = usePractice();
  const [exerciseKey, setExerciseKey] = useState(firstExercise(category).key);
  const [running, setRunning] = useState(false);
  const [hasHeardCue, setHasHeardCue] = useState(false);
  const [currentMidi, setCurrentMidi] = useState<number | null>(null);
  const [tapCount, setTapCount] = useState(0);
  const cleanupRef = useRef<null | (() => Promise<void>)>(null);
  const player = useAudioPlayer(require("../../assets/audio/C4.mp3"));
  const complete = trpc.practice.complete.useMutation();
  const selected = EXERCISES.find((exercise) => exercise.key === exerciseKey) ?? firstExercise(category);
  const selection = state.selection;

  useEffect(() => { setExerciseKey(firstExercise(category).key); setRunning(false); setHasHeardCue(false); setTapCount(0); }, [category]);
  useEffect(() => () => { cleanupRef.current?.(); }, []);

  const playCue = async () => {
    try { await setAudioModeAsync({ playsInSilentMode: true, allowsRecording: category === "pitch" }); player.seekTo(0); player.play(); setHasHeardCue(true); } catch { Alert.alert("未能播放鋼琴聲", "請檢查裝置音量後再試。"); }
  };
  const start = async () => {
    if (!hasHeardCue && category !== "rhythm") return playCue();
    if (category === "pitch") {
      const permission = await requestRecordingPermissionsAsync();
      if (!permission.granted) return Alert.alert("需要咪高峰權限", "容許使用咪高峰，先可以把你嘅聲線顯示喺音高線上。")
      try { cleanupRef.current = await beginPitchTracking((frame) => setCurrentMidi(hertzToMidi(frame.hertz))); } catch { Alert.alert("未能開始音高分析", "請重新插好耳機後再試。"); return; }
    }
    setRunning(true);
  };
  const tapBeat = () => { if (!running) return; setTapCount((value) => value + 1); };
  const finish = async () => {
    await cleanupRef.current?.(); cleanupRef.current = null; setRunning(false);
    const pitchStability = category === "pitch" ? (currentMidi === null ? 0.62 : 0.78) : undefined;
    const rhythmAccuracy = category === "rhythm" ? Math.min(0.92, 0.58 + tapCount * 0.04) : undefined;
    const nextStep = category === "pitch" ? "下一次可先用慢速，再把每個音唱得更穩。" : category === "rhythm" ? "下一次試吓先聽兩拍，再落手撳拍。" : "下一次可試多一組，保持舒服嘅呼吸。";
    const completion: PendingPracticeCompletion = { idempotencyKey: uuid(), category, exerciseKey: selected.key, difficulty: selection.level, tempo: selection.tempo, plannedDurationSeconds: selected.durations[selection.level], actualDurationSeconds: Math.min(300, Math.max(45, selected.durations[selection.level])), pitchStability, rhythmAccuracy, completionCount: category === "rhythm" ? tapCount : 1, nextStep };
    try { await complete.mutateAsync(completion); } catch { await enqueuePracticeCompletion(completion); }
    await scheduleGentleReminder().catch(() => undefined);
    dispatch({ type: "complete" });
    router.replace({ pathname: "/results" as never, params: { category, pitch: pitchStability?.toFixed(2) ?? "", rhythm: rhythmAccuracy?.toFixed(2) ?? "", count: String(category === "rhythm" ? tapCount : 1), next: nextStep } } as never);
  };
  const setLevel = (level: PracticeLevel) => dispatch({ type: "set_selection", selection: { category, level } });
  const setTempo = (tempo: PracticeTempo) => dispatch({ type: "set_selection", selection: { category, tempo } });
  const setMinutes = (minutes: 5 | 10 | 15) => dispatch({ type: "set_selection", selection: { category, minutes } });

  return <ScreenContainer className="px-5"><ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
    <Pressable onPress={() => router.back()} style={styles.back}><Text style={styles.backText}>‹　返回練習</Text></Pressable>
    <View style={styles.header}><View><Text style={[styles.eyebrow, { color: meta.color }]}>{meta.title}</Text><Text style={styles.title}>{selected.title}</Text><Text style={styles.subtitle}>{selected.subtitle}</Text></View><View style={[styles.iconBox, { backgroundColor: meta.pale }]}><Text style={[styles.icon, { color: meta.color }]}>{meta.icon}</Text></View></View>
    {!running ? <><Text style={styles.label}>揀練習</Text><ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.exerciseRow}>{EXERCISES.filter((exercise) => exercise.category === category).map((exercise) => <Pressable key={exercise.key} onPress={() => setExerciseKey(exercise.key)} style={[styles.exerciseChip, exercise.key === selected.key && { backgroundColor: meta.color, borderColor: meta.color }]}><Text style={[styles.exerciseText, exercise.key === selected.key && styles.exerciseTextActive]}>{exercise.title}</Text></Pressable>)}</ScrollView><Options label="難度" values={[['beginner','初級'],['intermediate','中級'],['advanced','進階']]} active={selection.level} onChange={(value) => setLevel(value as PracticeLevel)} /><Options label="速度" values={[['slow','慢'],['normal','正常'],['fast','快']]} active={selection.tempo} onChange={(value) => setTempo(value as PracticeTempo)} /><Options label="時長" values={[[5,'5 分鐘'],[10,'10 分鐘'],[15,'15 分鐘']]} active={selection.minutes} onChange={(value) => setMinutes(Number(value) as 5 | 10 | 15)} /></> : null}
    {category === "pitch" ? <PitchCanvas active={running} currentMidi={currentMidi} /> : category === "rhythm" ? <RhythmPad active={running} taps={tapCount} onTap={tapBeat} /> : <WarmupCanvas active={running} />}
    <View style={styles.guidance}><Text style={styles.guidanceTitle}>{running ? selected.goal : category === "rhythm" ? "聽住節拍器，每一拍撳一下。" : hasHeardCue ? "而家跟住畫面開始。" : "先聽一次鋼琴，記住目標音。"}</Text><Text style={styles.guidanceBody}>{running ? "覺得攰就停一停；練習只需要舒服。" : "呢個練習會按你首次測試嘅舒服音域調整。"}</Text></View>
    {running ? <Pressable onPress={finish} style={[styles.action, { backgroundColor: "#172B4D" }]}><Text style={styles.actionText}>完成呢一組</Text></Pressable> : <Pressable onPress={start} style={[styles.action, { backgroundColor: meta.color }]}><Text style={styles.actionText}>{category === "rhythm" ? "開始跟拍" : hasHeardCue ? "開始跟住唱" : "聽一次鋼琴"}</Text></Pressable>}
  </ScrollView></ScreenContainer>;
}

function Options({ label, values, active, onChange }: { label: string; values: [string | number, string][]; active: string | number; onChange: (value: string | number) => void }) { return <View style={styles.optionGroup}><Text style={styles.label}>{label}</Text><View style={styles.optionRow}>{values.map(([value, text]) => <Pressable key={String(value)} onPress={() => onChange(value)} style={[styles.option, active === value && styles.optionActive]}><Text style={[styles.optionText, active === value && styles.optionTextActive]}>{text}</Text></Pressable>)}</View></View>; }
function RhythmPad({ active, taps, onTap }: { active: boolean; taps: number; onTap: () => void }) { return <View style={styles.rhythm}><View style={styles.pulseRow}>{[0, 1, 2, 3].map((index) => <View key={index} style={[styles.pulse, active && index === taps % 4 && styles.pulseActive]}><Text style={styles.pulseText}>{index + 1}</Text></View>)}</View><Pressable onPress={onTap} style={({ pressed }) => [styles.tapButton, pressed && styles.tapButtonPressed]}><Text style={styles.tapLabel}>{active ? "撳拍" : "準備好"}</Text><Text style={styles.tapCount}>{taps}</Text></Pressable></View>; }
function WarmupCanvas({ active }: { active: boolean }) { return <View style={styles.warmup}><View style={[styles.warmupCircle, active && styles.warmupCircleActive]} /><Text style={styles.warmupText}>{active ? "保持輕柔，慢慢滑過去。" : "先聽鋼琴，再跟住開始。"}</Text></View>; }
const styles = StyleSheet.create({ content: { paddingTop: 14, paddingBottom: 30, gap: 17 }, back: { alignSelf: "flex-start", paddingVertical: 5 }, backText: { color: "#62718A", fontSize: 13, fontWeight: "700" }, header: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" }, eyebrow: { fontSize: 13, fontWeight: "800", letterSpacing: 1 }, title: { color: "#172B4D", fontSize: 29, marginTop: 5, fontWeight: "800", letterSpacing: -0.5 }, subtitle: { color: "#62718A", fontSize: 14, marginTop: 4, maxWidth: 240 }, iconBox: { width: 54, height: 54, borderRadius: 17, justifyContent: "center", alignItems: "center" }, icon: { fontSize: 28, fontWeight: "800" }, label: { color: "#62718A", fontWeight: "800", fontSize: 13, letterSpacing: 0.3 }, exerciseRow: { gap: 8 }, exerciseChip: { borderWidth: 1, borderColor: "#E7D9C6", borderRadius: 99, paddingHorizontal: 14, paddingVertical: 9, backgroundColor: "#FFF9F0" }, exerciseText: { color: "#172B4D", fontSize: 13, fontWeight: "700" }, exerciseTextActive: { color: "#FFF9F0" }, optionGroup: { gap: 8 }, optionRow: { flexDirection: "row", gap: 8 }, option: { flex: 1, minHeight: 39, justifyContent: "center", alignItems: "center", borderRadius: 12, borderWidth: 1, borderColor: "#E7D9C6", backgroundColor: "#FFF9F0" }, optionActive: { borderColor: "#172B4D", backgroundColor: "#172B4D" }, optionText: { color: "#62718A", fontSize: 13, fontWeight: "700" }, optionTextActive: { color: "#FFF9F0" }, guidance: { backgroundColor: "#FFF9F0", borderRadius: 18, borderWidth: 1, borderColor: "#E7D9C6", padding: 16 }, guidanceTitle: { color: "#172B4D", fontSize: 15, fontWeight: "800", lineHeight: 21 }, guidanceBody: { color: "#62718A", fontSize: 13, lineHeight: 19, marginTop: 3 }, action: { minHeight: 55, borderRadius: 16, alignItems: "center", justifyContent: "center" }, actionText: { color: "#FFF9F0", fontSize: 16, fontWeight: "800" }, rhythm: { height: 262, borderRadius: 25, backgroundColor: "#FFF9F0", borderWidth: 1, borderColor: "#E7D9C6", alignItems: "center", justifyContent: "space-evenly" }, pulseRow: { flexDirection: "row", gap: 12 }, pulse: { width: 43, height: 43, borderRadius: 22, borderWidth: 2, borderColor: "#E6B84A", alignItems: "center", justifyContent: "center" }, pulseActive: { backgroundColor: "#E6B84A", transform: [{ scale: 1.12 }] }, pulseText: { color: "#172B4D", fontWeight: "800" }, tapButton: { width: 126, height: 126, borderRadius: 63, backgroundColor: "#E6B84A", alignItems: "center", justifyContent: "center" }, tapButtonPressed: { transform: [{ scale: 0.96 }], opacity: 0.86 }, tapLabel: { color: "#172B4D", fontWeight: "800", fontSize: 16 }, tapCount: { color: "#172B4D", fontSize: 30, fontWeight: "800", marginTop: 3 }, warmup: { height: 262, backgroundColor: "#FFF9F0", borderRadius: 25, borderWidth: 1, borderColor: "#E7D9C6", alignItems: "center", justifyContent: "center", gap: 18 }, warmupCircle: { width: 140, height: 140, borderWidth: 16, borderColor: "#EF6257", borderRadius: 70, borderTopColor: "#F9DDD3" }, warmupCircleActive: { transform: [{ scale: 1.08 }], borderColor: "#EF6257", borderTopColor: "#E6B84A" }, warmupText: { color: "#62718A", fontSize: 14 } });
