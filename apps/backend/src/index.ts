import express from "express";
import dotenv from "dotenv";
import type { User } from "@ai-platform/shared-types";
import { supabase } from "./supabase";

dotenv.config();

const app = express();

app.use(express.json());

const sampleUser: User = {
  id: "backend-1",
  name: "Backend Admin",
  email: "admin@example.com",
  createdAt: new Date(),
};

app.get("/", (_req, res) => {
  res.json({
    message: "AI Interview Platform Backend Running",
    sampleUser,
  });
});

app.get("/health", (_req, res) => {
  res.json({
    status: "ok",
    supabaseConfigured: !!supabase,
  });
});

const PORT = Number(process.env.PORT) || 4000;

app.listen(PORT, () => {
  console.log(`AI Interview Platform Backend running on port ${PORT}`);
});
