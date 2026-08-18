import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { usePractice } from "@/contexts/practice-context";
import { trpc } from "@/lib/trpc";
import { summarisePractice } from "@/lib/progress";
import { useAuth } from "@/hooks/use-auth";

export default function ProgressScreen() {
  const { state } = usePractice();
  const { user } = useAuth();
  const dashboard = trpc.practice.dashboard.useQuery(undefined, { enabled: Boolean(user), retry: false });
  const summary = summarisePractice(dashboard.data ?? []);
  const hasPractice = summary.totalSessions > 0 || state.completedToday > 0;
  if (dashboard.isLoading) return <ScreenContainer className="items-center justify-center"><ActivityIndicator color="#EF6257" /></ScreenContainer>;
  return <ScreenContainer className="px-5"><ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
    <Text style={styles.eyebrow}>進度</Text><Text style={styles.title}>慢慢變穩，{`\n`}都算進步。</Text>
    <View style={styles.hero}><Text style={styles.heroLabel}>今個星期</Text><Text style={styles.heroValue}>{hasPractice ? `${summary.weekDays} 日` : "未開始"}</Text><Text style={styles.heroBody}>{hasPractice ? `今個月已練咗 ${summary.monthDays} 日。保持自己舒服嘅節奏就得。` : "完成第一個練習後，呢度會記低你嘅節奏。"}</Text></View>
    <Text style={styles.section}>三個練習方向</Text>
    <View style={styles.metrics}><Metric name="音準穩定度" value={summary.pitchAverage === null ? "完成音準練習後顯示" : `${Math.round(summary.pitchAverage * 100)}%`} /><Metric name="拍子跟隨" value={summary.rhythmAverage === null ? "完成拍子練習後顯示" : `${Math.round(summary.rhythmAverage * 100)}%`} /><Metric name="完成次數" value={hasPractice ? `累積完成 ${summary.completionCount + state.completedToday} 次` : "完成練習後顯示"} /></View>
    <View style={styles.footer}><Text style={styles.footerTitle}>無總分，得下一步。</Text><Text style={styles.footerBody}>每次練習後，我會分開講音準、拍子同完成次數，等你知道下一步應該點練。</Text></View>
  </ScrollView></ScreenContainer>;
}
function Metric({ name, value }: { name: string; value: string }) { return <View style={styles.metric}><Text style={styles.metricName}>{name}</Text><Text style={styles.metricDescription}>{value}</Text><View style={styles.placeholder}><View style={[styles.placeholderFill, value.includes("顯示") && { width: "12%" }]} /></View></View>; }
const styles = StyleSheet.create({ content: { paddingTop: 18, paddingBottom: 30, gap: 18 }, eyebrow: { color: "#EF6257", fontSize: 14, fontWeight: "800", letterSpacing: 1 }, title: { color: "#172B4D", fontSize: 32, lineHeight: 39, fontWeight: "800", letterSpacing: -0.6 }, hero: { marginTop: 8, padding: 22, borderRadius: 26, backgroundColor: "#172B4D" }, heroLabel: { color: "#E6B84A", fontWeight: "800", fontSize: 13 }, heroValue: { color: "#FFF9F0", fontSize: 35, fontWeight: "800", marginTop: 8 }, heroBody: { color: "#DCE7F7", fontSize: 14, marginTop: 4 }, section: { color: "#172B4D", fontWeight: "800", fontSize: 18, marginTop: 6 }, metrics: { gap: 10 }, metric: { borderRadius: 18, backgroundColor: "#FFF9F0", padding: 17, borderWidth: 1, borderColor: "#E7D9C6" }, metricName: { color: "#172B4D", fontWeight: "800", fontSize: 16 }, metricDescription: { color: "#62718A", fontSize: 13, marginTop: 4 }, placeholder: { height: 7, backgroundColor: "#F3E8D9", borderRadius: 8, marginTop: 14 }, placeholderFill: { height: 7, width: "35%", backgroundColor: "#EF6257", borderRadius: 8 }, footer: { borderTopWidth: 1, borderTopColor: "#E7D9C6", paddingTop: 18, marginTop: 6 }, footerTitle: { color: "#172B4D", fontWeight: "800", fontSize: 16 }, footerBody: { color: "#62718A", fontSize: 14, lineHeight: 21, marginTop: 4 } });
