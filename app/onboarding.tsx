import { Alert, Pressable, StyleSheet, Text, View } from "react-native";
import { useEffect, useRef, useState } from "react";
import { router } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { trpc } from "@/lib/trpc";
import { requestRecordingPermissionsAsync, setAudioModeAsync, useAudioPlayer } from "expo-audio";
import { beginPitchTracking, hertzToMidi } from "@/lib/pitch-service";

const steps = [
  { eyebrow: "開始前", title: "戴好耳機先。", body: "鋼琴聲唔會走入咪高峰，音高線先會更準。", action: "我戴好耳機喇" },
  { eyebrow: "音高測試", title: "跟住舒服咁唱。", body: "唔需要唱到最高；我哋只會記低你而家唱得最舒服嘅範圍。", action: "完成音高測試" },
  { eyebrow: "拍子測試", title: "跟住拍子撳一下。", body: "呢個小測試會幫你揀啱開始難度。", action: "完成拍子測試" },
];

export default function OnboardingScreen() {
  const [step, setStep] = useState(0);
  const [testingPitch, setTestingPitch] = useState(false);
  const [pitchFrames, setPitchFrames] = useState(0);
  const [tapTimes, setTapTimes] = useState<number[]>([]);
  const saveBaseline = trpc.profile.saveBaseline.useMutation();
  const pitchValues = useRef<number[]>([]);
  const stopTracking = useRef<null | (() => Promise<void>)>(null);
  const player = useAudioPlayer(require("../assets/audio/C4.mp3"));
  useEffect(() => () => { stopTracking.current?.(); }, []);
  useEffect(() => {
    if (step !== 2 || tapTimes.length >= 8) return;
    const timer = setInterval(() => { player.seekTo(0); player.play(); }, 900);
    return () => clearInterval(timer);
  }, [player, step, tapTimes.length]);

  const startPitchTest = async () => {
    const permission = await requestRecordingPermissionsAsync();
    if (!permission.granted) return Alert.alert("需要咪高峰權限", "容許使用咪高峰，先可以用你嘅聲音找出舒服音域。");
    pitchValues.current = [];
    try {
      await setAudioModeAsync({ playsInSilentMode: true, allowsRecording: true });
      stopTracking.current = await beginPitchTracking((frame) => {
        if (frame.confidence >= 0.55) pitchValues.current.push(hertzToMidi(frame.hertz));
        setPitchFrames(pitchValues.current.length);
      });
      setTestingPitch(true);
      setTimeout(async () => {
        await stopTracking.current?.(); stopTracking.current = null; setTestingPitch(false);
        if (pitchValues.current.length < 4) return Alert.alert("未能聽清楚", "請確認耳機同咪高峰，然後用舒服音量再試一次。");
        setStep(2);
      }, 4500);
    } catch { Alert.alert("未能開始測試", "請重新插好耳機後再試。"); }
  };

  const recordTap = () => {
    if (step !== 2 || tapTimes.length >= 8) return;
    setTapTimes((times) => [...times, Date.now()]);
  };
  const saveAndFinish = async () => {
    if (pitchValues.current.length < 4 || tapTimes.length < 8) return;
    const lowMidi = Math.round(Math.min(...pitchValues.current));
    const highMidi = Math.round(Math.max(...pitchValues.current));
    const intervals = tapTimes.slice(1).map((value, index) => value - tapTimes[index]);
    const average = intervals.reduce((sum, value) => sum + value, 0) / intervals.length;
    const deviation = intervals.reduce((sum, value) => sum + Math.abs(value - average), 0) / intervals.length;
    const rhythmBaseline = Math.max(0, Math.min(1, 1 - deviation / average));
    try { await saveBaseline.mutateAsync({ lowMidi, highMidi, rhythmBaseline }); router.replace("/(tabs)" as never); } catch { Alert.alert("未能儲存結果", "請檢查網絡後再試。") }
  };
  const proceed = async () => {
    if (step === 0) return setStep(1);
    if (step === 1) return startPitchTest();
    return saveAndFinish();
  };
  const item = steps[step];
  const finalAction = tapTimes.length < 8 ? `跟住節拍撳一下（${tapTimes.length}/8）` : "儲存並開始練習";
  return <ScreenContainer className="p-6" edges={["top", "bottom", "left", "right"]}><View style={styles.page}><Text style={styles.progress}>0{step + 1} — 0{steps.length}</Text><View style={styles.center}><View style={[styles.symbol, testingPitch && styles.symbolActive]}>{step === 0 ? "◒" : step === 1 ? "⌁" : "●"}</View><Text style={styles.eyebrow}>{item.eyebrow}</Text><Text style={styles.title}>{item.title}</Text><Text style={styles.body}>{testingPitch ? `聽緊你把聲⋯ 已收到 ${pitchFrames} 個音高位置` : item.body}</Text></View><View style={styles.footer}><View style={styles.dots}>{steps.map((_, index) => <View key={index} style={[styles.dot, index === step && styles.dotActive]} />)}</View><Pressable style={[styles.button, testingPitch && styles.disabled]} onPress={step === 2 && tapTimes.length < 8 ? recordTap : proceed} disabled={testingPitch || saveBaseline.isPending}><Text style={styles.buttonText}>{step === 2 ? finalAction : testingPitch ? "測試進行中⋯" : item.action}</Text></Pressable></View></View></ScreenContainer>;
}
const styles = StyleSheet.create({ page: { flex: 1, justifyContent: "space-between", paddingVertical: 18 }, progress: { color: "#EF6257", fontSize: 13, fontWeight: "800", letterSpacing: 1.4 }, center: { alignItems: "center", gap: 16, paddingHorizontal: 20 }, symbol: { width: 112, height: 112, borderRadius: 56, backgroundColor: "#DCE7F7", textAlign: "center", textAlignVertical: "center", color: "#2C62B8", fontSize: 56, marginBottom: 12 }, symbolActive: { backgroundColor: "#F9DDD3", color: "#EF6257", transform: [{ scale: 1.05 }] }, eyebrow: { color: "#EF6257", fontSize: 15, fontWeight: "800" }, title: { color: "#172B4D", fontSize: 31, lineHeight: 39, fontWeight: "800", textAlign: "center" }, body: { color: "#62718A", fontSize: 16, lineHeight: 25, textAlign: "center" }, footer: { gap: 18 }, dots: { flexDirection: "row", justifyContent: "center", gap: 8 }, dot: { height: 6, width: 6, borderRadius: 4, backgroundColor: "#E7D9C6" }, dotActive: { width: 26, backgroundColor: "#EF6257" }, button: { backgroundColor: "#172B4D", borderRadius: 16, minHeight: 55, alignItems: "center", justifyContent: "center" }, disabled: { opacity: 0.55 }, buttonText: { color: "#FFF9F0", fontWeight: "800", fontSize: 16 } });
