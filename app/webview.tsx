import { useSessionStore } from "@/store/session";
import { useRouter } from "expo-router";
import { useEffect, useRef } from "react";
import {
  Animated,
  Easing,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { WebView, type WebViewNavigation } from "react-native-webview";

export default function WebviewScreen() {
  const { token, url, setUrl } = useSessionStore();
  const router = useRouter();
  const webViewRef = useRef<WebView>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    fadeAnim.setValue(0);
  }, [url]);

  const handleNavigationRequest = (request: WebViewNavigation) => {
    const { url: navUrl, navigationType } = request;
    // Allow navigation within the Capital app
    if (navUrl.includes("test.capital.glasshouseventure.studio")) {
      return true;
    }
    // Intercept explicit user link clicks (including links inside iframes like
    // YouTube embeds) and route them to the in-app browser.
    if (navigationType === "click") {
      router.push({ pathname: "/browser" as any, params: { url: navUrl } });
      return false;
    }
    // Allow everything else: programmatic loads, iframe sources, media, etc.
    return true;
  };

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
          onShouldStartLoadWithRequest={handleNavigationRequest}
          setSupportMultipleWindows={true}
          onOpenWindow={(event) => {
            const { targetUrl } = event.nativeEvent;
            if (!targetUrl) return;
            // target="_blank" links (e.g., YouTube logo inside its iframe)
            // end up here — always route them to the in-app browser.
            router.push({
              pathname: "/browser" as any,
              params: { url: targetUrl },
            });
          }}
          allowsInlineMediaPlayback={true}
          mediaPlaybackRequiresUserAction={false}
          mediaCapturePermissionGrantType="grant"
          allowsProtectedMedia={true}
        />
      </Animated.View>

      {/* Footer Tabs */}
      <View style={styles.footer}>
        <Pressable
          style={[styles.tabItem, url.includes("/prism") && styles.tabActive]}
          onPress={() =>
            setUrl("https://test.capital.glasshouseventure.studio/api/prism")
          }
        >
          <Text style={styles.tabText}>Prism</Text>
        </Pressable>

        <Pressable
          style={[styles.tabItem, url.includes("/feed") && styles.tabActive]}
          onPress={() =>
            setUrl("https://test.capital.glasshouseventure.studio/api/feed")
          }
        >
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
