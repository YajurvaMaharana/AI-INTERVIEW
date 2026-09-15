import { View, Text, TouchableOpacity, StyleSheet, Alert } from "react-native";
import { useAuth } from "@/providers/AuthProvider";

/**
 * Profile screen – shows user information and a sign out button.
 */
export default function ProfileScreen() {
  const { user, signOut } = useAuth();

  const handleSignOut = () => {
    Alert.alert("Sign Out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Sign Out",
        style: "destructive",
        onPress: signOut,
      },
    ]);
  };

  return (
    <View style={styles.container}>
      {/* Avatar placeholder */}
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>
          {user?.email?.charAt(0).toUpperCase() ?? "?"}
        </Text>
      </View>

      <Text style={styles.email}>{user?.email}</Text>
      <Text style={styles.userId}>ID: {user?.id}</Text>

      {/* Info card */}
      <View style={styles.card}>
        <View style={styles.cardRow}>
          <Text style={styles.cardLabel}>Provider</Text>
          <Text style={styles.cardValue}>
            {user?.app_metadata?.provider ?? "email"}
          </Text>
        </View>
        <View style={styles.separator} />
        <View style={styles.cardRow}>
          <Text style={styles.cardLabel}>Created</Text>
          <Text style={styles.cardValue}>
            {user?.created_at
              ? new Date(user.created_at).toLocaleDateString()
              : "—"}
          </Text>
        </View>
      </View>

      {/* Sign out */}
      <TouchableOpacity
        style={styles.signOutButton}
        onPress={handleSignOut}
        activeOpacity={0.8}
      >
        <Text style={styles.signOutText}>Sign Out</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0F0D23",
    paddingHorizontal: 24,
    paddingTop: 40,
    alignItems: "center",
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#6C63FF",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  email: {
    fontSize: 18,
    fontWeight: "600",
    color: "#FFFFFF",
    marginBottom: 4,
  },
  userId: {
    fontSize: 12,
    color: "#6B6B8D",
    marginBottom: 32,
  },
  card: {
    backgroundColor: "#1A1832",
    borderRadius: 16,
    padding: 20,
    width: "100%",
    borderWidth: 1,
    borderColor: "#2A2850",
    marginBottom: 32,
  },
  cardRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
  },
  cardLabel: {
    fontSize: 14,
    color: "#9D9DB8",
  },
  cardValue: {
    fontSize: 14,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  separator: {
    height: 1,
    backgroundColor: "#2A2850",
    marginVertical: 4,
  },
  signOutButton: {
    backgroundColor: "#2A2850",
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 32,
    width: "100%",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#FF6B6B",
  },
  signOutText: {
    color: "#FF6B6B",
    fontSize: 16,
    fontWeight: "700",
  },
});
