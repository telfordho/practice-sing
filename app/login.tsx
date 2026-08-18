import { Pressable, StyleSheet, Text, View } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { startOAuthLogin } from "@/constants/oauth";

export default function LoginScreen() {
  const login = async () => { await startOAuthLogin(); };
  return (
    <ScreenContainer className="px-6 pb-8" edges={["top", "bottom", "left", "right"]}>
      <View style={styles.container}>
        <View style={styles.art}><View style={styles.waveA} /><View style={styles.waveB} /><View style={styles.dot} /></View>
        <View style={styles.copy}><Text style={styles.brand}>練吓聲</Text><Text style={styles.headline}>每天花少少時間，{`\n`}聽清楚自己把聲。</Text><Text style={styles.body}>開聲、音準、拍子。唔使同人比較，只係慢慢唱得更穩。</Text></View>
        <View style={styles.actions}>
          <Pressable style={styles.primaryButton} onPress={login}><Text style={styles.primaryText}>登入開始練習</Text></Pressable>
          <Text style={styles.hint}>登入後可保留進度，並在 iPhone 與 Android 同步。</Text>
        </View>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "space-between", paddingVertical: 28 },
  art: { height: 210, backgroundColor: "#DCE7F7", borderRadius: 32, overflow: "hidden", position: "relative" },
  waveA: { position: "absolute", width: 280, height: 280, borderWidth: 22, borderColor: "#EF6257", borderRadius: 150, right: -70, bottom: -135 },
  waveB: { position: "absolute", width: 190, height: 190, borderWidth: 18, borderColor: "#2C62B8", borderRadius: 100, left: 34, top: 34 },
  dot: { width: 28, height: 28, borderRadius: 14, backgroundColor: "#E6B84A", position: "absolute", left: 38, bottom: 36 },
  copy: { gap: 15 }, brand: { fontSize: 19, fontWeight: "800", color: "#EF6257", letterSpacing: 1 },
  headline: { fontSize: 34, lineHeight: 42, color: "#172B4D", fontWeight: "800", letterSpacing: -0.8 },
  body: { fontSize: 16, lineHeight: 25, color: "#62718A", maxWidth: 330 },
  actions: { gap: 14 }, primaryButton: { minHeight: 54, backgroundColor: "#172B4D", borderRadius: 16, alignItems: "center", justifyContent: "center" },
  primaryText: { color: "#FFF9F0", fontSize: 16, fontWeight: "800" }, hint: { color: "#62718A", textAlign: "center", fontSize: 12, lineHeight: 18 },
});
