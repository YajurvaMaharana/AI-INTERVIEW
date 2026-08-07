import type { User } from "@ai-platform/shared-types";

const demoUser: User = {
  id: "web-1",
  name: "Web Candidate",
  email: "candidate@example.com",
  createdAt: new Date(),
};

export default function Home() {
  return (
    <main>
      <h1>AI Interview Platform</h1>
      <p>Practice interviews with AI-powered feedback.</p>
      <p>User ID: {demoUser.id}</p>
      <p>User Name: {demoUser.name}</p>
      <p>User Email: {demoUser.email}</p>
    </main>
  );
}
