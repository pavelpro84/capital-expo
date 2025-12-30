import AsyncStorage from "@react-native-async-storage/async-storage";
import NetInfo from "@react-native-community/netinfo";
import { useEffect, useRef, useState } from "react";
import { ActivityIndicator, Alert, Animated, Button, Easing, StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { WebView } from "react-native-webview";

// Simple UUID generator
function generateUuid(): string {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

// Generate unsigned JWT
function generateJwt(email: string): string {
  const header = {
    alg: "RS256",
    typ: "JWT",
    kid: "demo-cognito-kid-001",
  };

  const now = Math.floor(Date.now() / 1000);
  const uuid = generateUuid();
  const payload = {
    sub: uuid,
    email_verified: true,
    iss: "https://cognito-idp.ap-southeast-2.amazonaws.com/ap-southeast-X",
    phone_number_verified: false,
    "cognito:username": uuid,
    origin_jti: generateUuid(),
    aud: "x",
    event_id: generateUuid(),
    token_use: "id",
    auth_time: now,
    phone_number: "+6140x",
    exp: now + 60 * 60,
    iat: now,
    jti: generateUuid(),
    email,
  };

  const headerEncoded = btoa(JSON.stringify(header)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");

  const payloadEncoded = btoa(JSON.stringify(payload)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");

  const fakeSignature = btoa("fake-rsa256-signature").replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");

  return `${headerEncoded}.${payloadEncoded}.${fakeSignature}`;
}

export default function WebviewScreen() {
  const [email, setEmail] = useState("");
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const webViewRef = useRef<WebView>(null);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const [webLoading, setWebLoading] = useState(false);

  // Check network status on mount and subscribe to changes
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      const online = state.isConnected === true;
      setIsOnline(online);
      console.log("[Network] Status:", online ? "online" : "offline");
    });

    return () => unsubscribe();
  }, []);

  const handleLogin = async () => {
    if (!email) {
      alert("Vui lòng nhập email");
      return;
    }

    // Check network before login
    const netState = await NetInfo.fetch();
    if (!netState.isConnected) {
      Alert.alert("No Connection", "Please connect to internet to login");
      return;
    }

    setLoading(true);
    try {
      const jwt = generateJwt(email);
      await AsyncStorage.setItem("authToken", jwt);
      await AsyncStorage.setItem("userEmail", email);
      setWebLoading(true);
      fadeAnim.setValue(0);
      setToken(jwt);
    } catch (error) {
      alert("Lỗi tạo JWT: " + (error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleWebViewError = () => {
    console.log("[WebView] Error loading page");
    if (!isOnline) {
      Alert.alert("Offline", "You are offline. The page may not load correctly. Check your connection and try again.");
    } else {
      Alert.alert("Error", "Failed to load page. Try refreshing.");
    }
  };

  console.log("`https://test.capital.glasshouseventure.studio/api/prism?token=${token}`", `https://test.capital.glasshouseventure.studio/api/prism?token=${token}`);

  return (
    <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
      {!token && (
        <View style={styles.form}>
          <TextInput
            value={email}
            onChangeText={setEmail}
            style={styles.input}
            placeholder="Enter email"
            placeholderTextColor="#999"
            editable={!loading && isOnline}
          />
          {!isOnline && <Text style={styles.offlineText}>Please connect to internet to login</Text>}
          <Button title={loading ? "Đang xử lý..." : "Login"} onPress={handleLogin} disabled={loading || !isOnline} />
          {loading && <ActivityIndicator size="large" color="#000" />}
        </View>
      )}

      <Animated.View style={[styles.webviewWrapper, { opacity: fadeAnim }]}>
        <WebView
          ref={webViewRef}
          source={
            token
              ? { uri: `https://test.capital.glasshouseventure.studio/api/prism?token=${token}` }
              : { html: "" }
          }
          style={styles.webview}
          containerStyle={styles.webviewContainer}
          originWhitelist={["*"]}
          cacheMode="LOAD_CACHE_ELSE_NETWORK"
          cacheEnabled
          domStorageEnabled
          javaScriptEnabled
          onLoadStart={() => setWebLoading(true)}
          onLoadEnd={() => {
            setWebLoading(false);
            Animated.timing(fadeAnim, {
              toValue: 1,
              duration: 250,
              easing: Easing.out(Easing.ease),
              useNativeDriver: true,
            }).start();
          }}
          onError={handleWebViewError}
        />
      </Animated.View>

      {webLoading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#000" />
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  webview: {
    flex: 1,
    backgroundColor: "#fff",
  },
  form: {
    flex: 1,
    backgroundColor: "white",
    padding: 16,
    gap: 16,
    justifyContent: "center",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 12,
    borderRadius: 4,
    fontSize: 16,
  },
  offlineBanner: {
    backgroundColor: "#FFA500",
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  offlineBannerText: {
    color: "white",
    textAlign: "center",
    fontWeight: "bold",
  },
  offlineText: {
    color: "#FF6B6B",
    textAlign: "center",
    fontSize: 14,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  webviewWrapper: {
    flex: 1,
    backgroundColor: "#fff",
  },
  webviewContainer: {
    backgroundColor: "#fff",
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 20,
  },
});
