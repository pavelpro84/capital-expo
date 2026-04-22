import { useColorScheme } from "@/hooks/use-color-scheme";
import { DarkTheme, DefaultTheme, ThemeProvider } from "@react-navigation/native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "react-native-get-random-values";
import "react-native-reanimated";

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <Stack screenOptions={{ headerShown: false, animation: "none" }}>
        <Stack.Screen name="login" />
        <Stack.Screen name="webview" />
        <Stack.Screen name="browser" options={{ animation: "slide_from_bottom" }} />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
