import { Redirect, Stack } from "expo-router";
import { useAuth } from "@/providers/AuthProvider";
import { ActivityIndicator, View, StyleSheet } from "react-native";

/**
 * Layout for authentication screens (login, signup).
 * Redirects authenticated users away to the main app.
 */
export default function AuthLayout() {
  const { session, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#6C63FF" />
      </View>
    );
  }

  // If the user is already authenticated, redirect them to the app.
  if (session) {
    return <Redirect href="/(app)/(tabs)" />;
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: "#0F0D23" },
        animation: "fade",
      }}
    />
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#0F0D23",
  },
});
