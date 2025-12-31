import { useSessionStore } from "@/store/session";
import AsyncStorage from "@react-native-async-storage/async-storage";
import NetInfo from "@react-native-community/netinfo";
import { router } from "expo-router";
import { useState } from "react";
import { ActivityIndicator, Alert, Button, StyleSheet, TextInput, View } from "react-native";

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

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const setToken = useSessionStore((s) => s.setToken);

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
      setToken(jwt);
      router.replace("/webview");
      setLoading(false);
    } catch (error) {
      alert("Lỗi tạo JWT: " + (error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <TextInput value={email} onChangeText={setEmail} style={styles.input} placeholder="Enter email" />
      <Button title="Login" onPress={handleLogin} />
      {loading && <ActivityIndicator />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", padding: 16, backgroundColor: "#fff" },
  input: { borderWidth: 1, padding: 12, marginBottom: 12, borderRadius: 4, borderColor: "#ccc" },
});
