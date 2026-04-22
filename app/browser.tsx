import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useRef, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { WebView } from "react-native-webview";

export default function BrowserScreen() {
  const router = useRouter();
  const { url } = useLocalSearchParams<{ url: string }>();
  const webViewRef = useRef<WebView>(null);
  const [currentUrl, setCurrentUrl] = useState(url ?? "");
  const [canGoBack, setCanGoBack] = useState(false);

  if (!url) return null;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.headerButton}>
          <Ionicons name="close" size={24} color="#111" />
        </Pressable>

        <Text style={styles.headerTitle} numberOfLines={1}>
          {currentUrl}
        </Text>

        <View style={styles.headerRight}>
          {canGoBack && (
            <Pressable
              onPress={() => webViewRef.current?.goBack()}
              style={styles.headerButton}
            >
              <Ionicons name="chevron-back" size={22} color="#111" />
            </Pressable>
          )}
          <Pressable
            onPress={() => webViewRef.current?.reload()}
            style={styles.headerButton}
          >
            <Ionicons name="refresh" size={20} color="#111" />
          </Pressable>
        </View>
      </View>

      <WebView
        ref={webViewRef}
        source={{ uri: url }}
        style={styles.webview}
        onNavigationStateChange={(navState) => {
          setCurrentUrl(navState.url);
          setCanGoBack(navState.canGoBack);
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  header: {
    height: 48,
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
    paddingHorizontal: 8,
  },
  headerButton: {
    padding: 8,
  },
  headerTitle: {
    flex: 1,
    fontSize: 13,
    color: "#6b7280",
    marginHorizontal: 4,
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
  },
  webview: { flex: 1 },
});
