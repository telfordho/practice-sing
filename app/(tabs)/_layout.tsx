import { Tabs } from "expo-router";
import { Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { IconSymbol } from "@/components/ui/icon-symbol";

export default function TabLayout() {
  const insets = useSafeAreaInsets();
  const bottomPadding = Platform.OS === "web" ? 10 : Math.max(insets.bottom, 10);
  return <Tabs screenOptions={{ headerShown: false, tabBarActiveTintColor: "#EF6257", tabBarInactiveTintColor: "#62718A", tabBarStyle: { height: 58 + bottomPadding, paddingTop: 8, paddingBottom: bottomPadding, borderTopColor: "#E7D9C6", backgroundColor: "#FFF9F0" }, tabBarLabelStyle: { fontSize: 11, fontWeight: "700" } }}>
    <Tabs.Screen name="index" options={{ title: "練習", tabBarIcon: ({ color }) => <IconSymbol size={24} name="waveform.path.ecg" color={color} /> }} />
    <Tabs.Screen name="progress" options={{ title: "進度", tabBarIcon: ({ color }) => <IconSymbol size={24} name="chart.line.uptrend.xyaxis" color={color} /> }} />
    <Tabs.Screen name="settings" options={{ title: "設定", tabBarIcon: ({ color }) => <IconSymbol size={23} name="gearshape" color={color} /> }} />
  </Tabs>;
}
