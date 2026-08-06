import express from "express";
import { User } from "@ai-platform/shared-types";

const app = express();

const exampleUser: User = {
  id: "1",
  name: "Demo User",
  email: "demo@example.com",
  createdAt: new Date()
};

app.get("/", (_req, res) => {
  res.json({
    message: "Backend running",
    user: exampleUser
  });
});

app.listen(4000, () => {
  console.log("Backend running on port 4000");
});
