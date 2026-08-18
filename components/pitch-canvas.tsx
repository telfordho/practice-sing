import { StyleSheet, Text, View } from "react-native";
import { useMemo } from "react";

export function PitchCanvas({ currentMidi, active }: { currentMidi: number | null; active: boolean }) {
  const lineTop = useMemo(() => {
    if (currentMidi === null) return 52;
    return Math.max(12, Math.min(88, 52 - (currentMidi - 60) * 5));
  }, [currentMidi]);
  return <View style={styles.canvas}><View style={styles.grid}>{[0, 1, 2, 3, 4].map((line) => <View key={line} style={styles.gridLine} />)}</View><View style={styles.target}><View style={styles.targetDot} /><Text style={styles.targetText}>目標音</Text></View>{active && currentMidi !== null ? <View style={[styles.voice, { top: `${lineTop}%` }]}><View style={styles.voiceDot} /><Text style={styles.voiceText}>你嘅聲線</Text></View> : <Text style={styles.empty}>{active ? "聽緊你把聲⋯" : "鋼琴示範後，跟住條線唱。"}</Text>}</View>;
}
const styles = StyleSheet.create({ canvas: { height: 262, backgroundColor: "#FFF9F0", borderRadius: 25, borderWidth: 1, borderColor: "#E7D9C6", overflow: "hidden", justifyContent: "center" }, grid: { ...StyleSheet.absoluteFillObject, justifyContent: "space-around", paddingVertical: 28 }, gridLine: { height: 1, backgroundColor: "#E9DDCC" }, target: { flexDirection: "row", alignItems: "center", gap: 8, position: "absolute", top: "50%", left: 18, right: 18 }, targetDot: { height: 11, width: 11, borderRadius: 6, backgroundColor: "#2C62B8" }, targetText: { color: "#2C62B8", fontSize: 12, fontWeight: "800" }, voice: { position: "absolute", flexDirection: "row", alignItems: "center", gap: 8, left: 18, right: 18 }, voiceDot: { height: 13, width: 13, borderRadius: 7, backgroundColor: "#EF6257" }, voiceText: { color: "#EF6257", fontSize: 12, fontWeight: "800" }, empty: { textAlign: "center", color: "#62718A", fontSize: 14 } });
