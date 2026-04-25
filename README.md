# ⚡ AWS Pulse

> AI-powered AWS updates platform — personalized for your role, in your language.

## 🚀 Overview

AWS Pulse is a real-time AWS updates aggregator that simplifies technical announcements using AI, filters them by engineer role, and delivers them in English, Hindi, or Hinglish.

## 🧠 Problem Statement

AWS releases 100+ updates every month. Engineers miss critical deprecations and breaking changes buried in technical jargon — leading to production outages.

## ✅ Solution

- **Role-based feed** — DevOps, Developer, Architect, Data Engineer
- **AI-simplified summaries** — powered by Google Gemini
- **Multilingual** — English, Hindi, Hinglish
- **Critical alerts** — deprecation warnings before they break production
- **AI Chat assistant** — ask anything about any AWS update

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14, TypeScript, Tailwind CSS |
| AI Chat | Google Gemini 2.5 Flash |
| 3D Visuals | React Three Fiber, Three.js |
| Styling | Glassmorphism, CSS animations |
| Auth | JWT (prototype) |

## 📁 Project Structure

```
aws-pulse/
├── app/
│   ├── (auth)/          # Login, Register, Onboarding
│   ├── (app)/           # Dashboard, Search, Timeline, Profile
│   └── api/chat/        # Gemini AI endpoint
├── components/
│   ├── dashboard/       # UpdateCard, TrendingCard, AlertPopup
│   ├── layout/          # Sidebar, Header, MobileNav
│   ├── ui/              # Badge, Toast, Skeleton
│   └── chat/            # AI ChatWidget
└── lib/
    └── data.ts          # 20 real AWS updates
```

## 🏃 Run Locally

```bash
git clone https://github.com/YOUR_USERNAME/aws-pulse.git
cd aws-pulse
npm install

# Create .env.local
echo "GEMINI_API_KEY=your_key_here" > .env.local

npm run dev
# Open http://localhost:3000
```

## 👥 Team

| Member | Role | Contribution |
|--------|------|-------------|
| Rahul Sharma | Team Lead | Architecture, Login, Layout, AI Integration |
| [Member 2] | Frontend Dev | Dashboard, Update Cards, Alerts |
| [Member 3] | Frontend Dev | Search, Timeline, Admin Analytics |

## 🌟 Features

- ✅ 10 pages fully built
- ✅ 20 real AWS updates with AI summaries
- ✅ Gemini AI chat assistant
- ✅ Mobile-first responsive design
- ✅ Critical alert system
- ✅ Role-based filtering
- ✅ Multilingual (EN/HI/HG)
- ✅ Premium 3D login page

## 📸 Screenshots

> Dashboard, Login, Search, Timeline, Profile

## 🔗 Live Demo

> [Deploy link here]

---

Built with ❤️ for [Hackathon Name] 2026
