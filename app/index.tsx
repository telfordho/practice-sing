import { ActivityIndicator, Text, View } from "react-native";
import { useEffect } from "react";
import { router } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { useAuth } from "@/hooks/use-auth";

export default function IndexRoute() {
  const { loading, isAuthenticated } = useAuth();
  useEffect(() => {
    if (!loading) router.replace((isAuthenticated ? "/(tabs)" : "/login") as never);
  }, [isAuthenticated, loading]);
  return <ScreenContainer className="items-center justify-center"><View className="items-center gap-3"><ActivityIndicator color="#EF6257" /><Text className="text-muted">準備練吓聲⋯</Text></View></ScreenContainer>;
}
