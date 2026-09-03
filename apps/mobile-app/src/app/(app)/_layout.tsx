import { Redirect, Slot } from "expo-router";
import { useAuth } from "@/providers/AuthProvider";
import { ActivityIndicator, View, StyleSheet } from "react-native";

/**
 * Auth-gated layout for the main app.
 * Redirects unauthenticated users to the login screen.
 */
export default function AppLayout() {
  const { session, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#6C63FF" />
      </View>
    );
  }

  if (!session) {
    return <Redirect href="/(auth)/login" />;
  }

  return <Slot />;
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#0F0D23",
  },
});
