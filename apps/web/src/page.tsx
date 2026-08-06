import { User } from "@ai-platform/shared-types";

const user: User = {
  id: "1",
  name: "Web User",
  email: "web@example.com",
  createdAt: new Date()
};

export default function Home() {
  return (
    <main>
      <h1>AI Interview Platform</h1>
      <p>{user.name}</p>
    </main>
  );
}
