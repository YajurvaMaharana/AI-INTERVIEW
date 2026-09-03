import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useAuth } from "@/providers/AuthProvider";
import { useRouter } from "expo-router";

/**
 * Home screen – displays a welcome message with the authenticated user's email.
 */
export default function HomeScreen() {
  const { user } = useAuth();
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Text style={styles.greeting}>👋</Text>
      <Text style={styles.title}>Welcome!</Text>
      <Text style={styles.subtitle}>
        Signed in as{"\n"}
        <Text style={styles.email}>{user?.email}</Text>
      </Text>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Ready to Practice?</Text>
        <Text style={styles.cardBody}>
          Start an AI-powered mock interview to sharpen your skills and get
          instant feedback.
        </Text>
        <TouchableOpacity 
          style={styles.startButton}
          onPress={() => router.push('/interview-config')}
        >
          <Text style={styles.startButtonText}>Configure Interview</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0F0D23",
    paddingHorizontal: 24,
    paddingTop: 32,
    alignItems: "center",
  },
  greeting: {
    fontSize: 48,
    marginBottom: 12,
  },
  title: {
    fontSize: 26,
    fontWeight: "700",
    color: "#FFFFFF",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: "#9D9DB8",
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 32,
  },
  email: {
    color: "#6C63FF",
    fontWeight: "600",
  },
  card: {
    backgroundColor: "#1A1832",
    borderRadius: 16,
    padding: 24,
    width: "100%",
    borderWidth: 1,
    borderColor: "#2A2850",
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#FFFFFF",
    marginBottom: 8,
  },
  cardBody: {
    fontSize: 14,
    color: "#9D9DB8",
    lineHeight: 22,
    marginBottom: 20,
  },
  startButton: {
    backgroundColor: "#6C63FF",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  startButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
});
