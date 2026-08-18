import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from "react-native";
import { useEffect } from "react";
import { router } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { EditorCard } from "@/components/editor-card";
import { useAuth } from "@/hooks/use-auth";
import { trpc } from "@/lib/trpc";
import { usePractice } from "@/contexts/practice-context";
import type { PracticeCategory } from "@/shared/types";
import { flushPracticeOutbox } from "@/lib/sync-outbox";

export default function HomeScreen() {
  const { user, loading } = useAuth();
  const profile = trpc.profile.get.useQuery(undefined, { enabled: Boolean(user), retry: false });
  const dashboard = trpc.practice.dashboard.useQuery(undefined, { enabled: Boolean(user), retry: false });
  const complete = trpc.practice.complete.useMutation({ onSuccess: () => dashboard.refetch() });
  const { state } = usePractice();
  useEffect(() => {
    if (!loading && !user) router.replace("/login" as never);
    if (profile.data && !profile.data.hasCompletedBaseline) router.replace("/onboarding" as never);
  }, [loading, user, profile.data]);
  // complete 與 dashboard 由 tRPC hook 管理；只在帳戶身分變更時重放一次離線 outbox。
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { if (user) flushPracticeOutbox((entry) => complete.mutateAsync(entry)).then(() => dashboard.refetch()).catch(() => undefined); }, [user?.id]);
  const openPractice = (category: PracticeCategory) => router.push({ pathname: "/practice/[category]" as never, params: { category } } as never);
  if (loading || profile.isLoading) return <ScreenContainer className="items-center justify-center"><ActivityIndicator color="#EF6257" /></ScreenContainer>;
  return <ScreenContainer className="px-5" containerClassName="bg-background"><ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
    <View style={styles.header}><View><Text style={styles.eyebrow}>練吓聲</Text><Text style={styles.headline}>今日想練邊樣？</Text></View><View style={styles.avatar}><Text style={styles.avatarText}>{user?.name?.slice(0, 1) ?? "聲"}</Text></View></View>
    <Text style={styles.intro}>由你自己揀。慢慢嚟，練得舒服先最緊要。</Text>
    <View style={styles.cards}><EditorCard category="warmup" onPress={() => openPractice("warmup")} /><EditorCard category="pitch" onPress={() => openPractice("pitch")} /><EditorCard category="rhythm" onPress={() => openPractice("rhythm")} /></View>
    <View style={styles.note}><View style={styles.noteLine} /><View><Text style={styles.noteTitle}>{state.completedToday > 0 ? "今日已經練咗一段。" : dashboard.data?.length ? "你已經有練習紀錄。" : "今日未有練習紀錄。"}</Text><Text style={styles.noteBody}>{state.currentStreak > 1 ? `你已經連續練咗 ${state.currentStreak} 日。` : "揀一個短練習，由最自然嘅節奏開始。"}</Text></View></View>
  </ScrollView></ScreenContainer>;
}

const styles = StyleSheet.create({ content: { paddingTop: 16, paddingBottom: 28, gap: 20 }, header: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" }, eyebrow: { color: "#EF6257", fontSize: 14, fontWeight: "800", letterSpacing: 1.1 }, headline: { marginTop: 6, color: "#172B4D", fontSize: 31, fontWeight: "800", letterSpacing: -0.6 }, avatar: { height: 42, width: 42, borderRadius: 21, alignItems: "center", justifyContent: "center", backgroundColor: "#172B4D" }, avatarText: { color: "#FFF9F0", fontWeight: "800", fontSize: 16 }, intro: { color: "#62718A", fontSize: 15, lineHeight: 23, maxWidth: 280 }, cards: { gap: 14 }, note: { flexDirection: "row", gap: 14, backgroundColor: "#FFF9F0", padding: 18, borderRadius: 18, borderWidth: 1, borderColor: "#E7D9C6" }, noteLine: { width: 4, borderRadius: 4, backgroundColor: "#EF6257" }, noteTitle: { color: "#172B4D", fontWeight: "800", fontSize: 15 }, noteBody: { color: "#62718A", fontSize: 13, lineHeight: 20, marginTop: 3, maxWidth: 260 } });
