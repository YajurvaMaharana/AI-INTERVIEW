import { Text, View } from "react-native";
import { User } from "@ai-platform/shared-types";

const user: User = {
  id: "1",
  name: "Mobile User",
  email: "mobile@example.com",
  createdAt: new Date()
};

export default function App() {
  return (
    <View>
      <Text>AI Interview Platform</Text>
      <Text>{user.name}</Text>
    </View>
  );
}
