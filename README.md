Title: AI Interview Practice Platform
Overview: A 4-person team project building a Web and Mobile MVP over a 4-week sprint with Week 5 held as a buffer
## 🚀 Proposed Tech Stack

| Layer | Choice | Why |
|--------|--------|-----|
| **Web** | Next.js 14 (App Router) + TypeScript + Tailwind CSS + shadcn/ui | Fast development, modern React features, excellent DX |
| **Mobile** | React Native (Expo) + TypeScript | Share business logic with web, fast mobile development |
| **Backend** | Node.js + Express (or Next.js API Routes) + TypeScript | One language across the stack |
| **Database** | PostgreSQL (Supabase) | Managed database with built-in authentication |
| **Authentication** | Supabase Auth | Secure authentication without building from scratch |
| **AI Engine** | Claude API / OpenAI API | AI-powered features and structured responses |
| **Hosting** | Vercel (Web), Supabase (DB), Expo EAS (Mobile) | Easy deployment and scaling |

## 👥 Team Split

<ul>
  <li><strong>Member A:</strong> Backend & AI Interview Engine (40% focus)</li>
  <li><strong>Member B:</strong> Web Application (20% focus)</li>
  <li><strong>Member C:</strong> Mobile Application (20% focus)</li>
  <li><strong>Member D:</strong> Authentication, Infrastructure, DevOps & QA (20% focus)</li>
</ul>

## 🎯 MVP Scope

- **In Scope:** Signup/Login for web and mobile.
- **In Scope:** Interview setup to choose **type, role/domain, and difficulty**.
- **In Scope:** Text-based chat interview with an AI interviewer for **5–8 turns**.
- **In Scope:** AI-generated feedback report after each session.
- **In Scope:** History dashboard to list past sessions and revisit feedback.
- **Out of Scope (Phase 2):** Voice input/output, resume uploads, payments, admin panel, push notifications, and adaptive difficulty.
