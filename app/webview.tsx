import { useSessionStore } from "@/store/session";
import { useEffect, useRef } from "react";
import { Animated, Easing, Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { WebView } from "react-native-webview";

export default function WebviewScreen() {
  const { token, url, setUrl } = useSessionStore();
  const webViewRef = useRef<WebView>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    fadeAnim.setValue(0);
  }, [url]);

  if (!token) return null;

  return (
    <SafeAreaView style={styles.container}>
      <Animated.View style={[styles.webviewWrapper, { opacity: fadeAnim }]}>
        <WebView
          ref={webViewRef}
          source={{ uri: `${url}?token=${token}` }}
          style={styles.webview}
          onLoadEnd={() =>
            Animated.timing(fadeAnim, {
              toValue: 1,
              duration: 250,
              easing: Easing.out(Easing.ease),
              useNativeDriver: true,
            }).start()
          }
          allowsInlineMediaPlayback={true}
          mediaPlaybackRequiresUserAction={false}
        />
      </Animated.View>

      {/* Footer Tabs */}
      <View style={styles.footer}>
        <Pressable style={[styles.tabItem, url.includes("/prism") && styles.tabActive]} onPress={() => setUrl("https://test.capital.glasshouseventure.studio/api/prism")}>
          <Text style={styles.tabText}>Prism</Text>
        </Pressable>

        <Pressable style={[styles.tabItem, url.includes("/feed") && styles.tabActive]} onPress={() => setUrl("https://test.capital.glasshouseventure.studio/api/feed")}>
          <Text style={styles.tabText}>Feed</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  webviewWrapper: { flex: 1 },
  webview: { flex: 1, backgroundColor: "#fff" },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
  },
  footer: {
    height: 56,
    flexDirection: "row",
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
    backgroundColor: "#fff",
  },
  tabItem: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  tabActive: {
    backgroundColor: "#f3f4f6",
  },
  tabText: {
    fontSize: 14,
    fontWeight: "600",
  },
});
