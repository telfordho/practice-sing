import { Pressable, StyleSheet, Text, View } from "react-native";
import type { PracticeCategory } from "@/shared/types";
import { CATEGORY_META } from "@/lib/exercises";

export function EditorCard({ category, onPress }: { category: PracticeCategory; onPress: () => void }) {
  const meta = CATEGORY_META[category];
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.card, { backgroundColor: meta.pale }, pressed && styles.pressed]}>
      <View style={styles.topline}><Text style={[styles.kicker, { color: meta.color }]}>{meta.kicker}</Text><Text style={[styles.mark, { color: meta.color }]}>{meta.icon}</Text></View>
      <View><Text style={styles.title}>{meta.title}</Text><Text style={styles.cta}>揀一個練習 →</Text></View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: { minHeight: 156, borderRadius: 24, padding: 20, justifyContent: "space-between", overflow: "hidden" },
  pressed: { opacity: 0.76, transform: [{ scale: 0.985 }] },
  topline: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  kicker: { fontSize: 12, lineHeight: 17, fontWeight: "800", maxWidth: 190 },
  mark: { fontSize: 41, lineHeight: 42, fontWeight: "700" },
  title: { fontSize: 29, color: "#172B4D", fontWeight: "800", letterSpacing: -0.5 },
  cta: { marginTop: 6, color: "#172B4D", fontSize: 14, fontWeight: "700" },
});
