import { Tabs } from "expo-router";
import { Text, StyleSheet } from "react-native";

/**
 * Tab navigator for the authenticated section of the app.
 */
export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerStyle: { backgroundColor: "#0F0D23" },
        headerTintColor: "#FFFFFF",
        headerTitleStyle: { fontWeight: "700" },
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: "#6C63FF",
        tabBarInactiveTintColor: "#6B6B8D",
        tabBarLabelStyle: styles.tabBarLabel,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color }) => (
            <Text style={[styles.tabIcon, { color }]}>🏠</Text>
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color }) => (
            <Text style={[styles.tabIcon, { color }]}>👤</Text>
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: "#0F0D23",
    borderTopColor: "#1A1832",
    borderTopWidth: 1,
    paddingTop: 4,
    height: 60,
  },
  tabBarLabel: {
    fontSize: 12,
    fontWeight: "600",
    marginBottom: 4,
  },
  tabIcon: {
    fontSize: 20,
  },
});
