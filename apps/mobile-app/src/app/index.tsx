import { Redirect } from "expo-router";
import { useAuth } from "@/providers/AuthProvider";
import { ActivityIndicator, View, StyleSheet } from "react-native";

/**
 * Root index – redirects to the appropriate route group based on auth state.
 */
export default function Index() {
  const { session, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#6C63FF" />
      </View>
    );
  }

  if (session) {
    return <Redirect href="/(app)/(tabs)" />;
  }

  return <Redirect href="/(auth)/login" />;
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#0F0D23",
  },
});
