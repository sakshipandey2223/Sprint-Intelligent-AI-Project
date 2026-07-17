# AG-UC-0010 · Sprint Intelligence & KPI Tracking Agent

> Enterprise-grade AI dashboard for engineering managers to monitor sprint health using intelligent analytics.

![Next.js](https://img.shields.io/badge/Next.js-16.2-black?logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue?logo=typescript)
![SQLite](https://img.shields.io/badge/SQLite-native-green?logo=sqlite)
![Framer Motion](https://img.shields.io/badge/Framer_Motion-11-purple)
![Recharts](https://img.shields.io/badge/Recharts-2.x-orange)

---

## 🎯 Project Goal

A production-quality AI-powered sprint intelligence platform that helps engineering managers:

- **Monitor sprint health** via animated KPI dashboards
- **Track velocity & burndown** with real-time Recharts visualizations
- **Identify blockers & high-risk tickets** using an AI risk scoring engine
- **Explore issues** with full filter, pagination, and detail drawer
- **Analyse developer capacity** and team utilization
- **Generate AI reports** via a built-in AI Copilot (LLM-backed)

Inspired by: Microsoft Fabric · Azure AI · Linear · Vercel · Datadog · Grafana · Stripe Dashboard

---

## ✨ Features

| Feature | Details |
|---------|---------|
| 📊 **Executive Dashboard** | KPI Bento Grid, SVG gauge dial, burndown chart, velocity history, capacity radar |
| 🗂 **Sprint Board** | 4-column Kanban with inline state transitions (Start → Review → Done), blocker management |
| 🔍 **Issue Explorer** | Sortable table, 5-axis filtering, paginated (14/page), slide-in detail drawer |
| 👥 **Developer Insights** | Team roster, utilization bars, skill matrix |
| 📈 **Analytics Deep Dive** | Lead time, cycle time, flow charts |
| 🤖 **AI Copilot** | Streaming LLM-backed analysis drawer |
| 💾 **SQLite Persistence** | Native `node:sqlite` — all Kanban moves and blocker resolutions persist |
| 🎨 **UI UX Pro Max** | Bento Grid style, `#020617` deep dark, `#22C55E` green accent, Plus Jakarta Sans + Fira Code |

---

## 🏗 Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16.2 (Turbopack, App Router) |
| Language | TypeScript 5 |
| Styling | Tailwind CSS v4 + Custom CSS Design System |
| Animation | Framer Motion 11 |
| Charts | Recharts 2 |
| Database | SQLite via native `node:sqlite` (Node 26+) |
| State | Zustand |
| Data Fetching | TanStack Query (React Query) v5 |
| Icons | Lucide React |
| UI Skill | [UI UX Pro Max](https://github.com/nextlevelbuilder/ui-ux-pro-max-skill) |

---

## 🚀 Getting Started

### Prerequisites
- Node.js 22+ (for native `node:sqlite`)
- npm or pnpm

### Install & Run

```bash
# Clone the repository
git clone https://github.com/sakshipandey2223/ag-uc-0010-sprint-intelligence.git
cd ag-uc-0010-sprint-intelligence

# Install dependencies
npm install

# Start development server (SQLite DB auto-seeded on first run)
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — you will be redirected to `/dashboard`.

### Build for Production

```bash
npm run build
npm run start
```

---

## 📁 Project Structure

```
src/
├── app/
│   ├── dashboard/      # Executive KPI dashboard (Bento Grid)
│   ├── sprints/        # Kanban sprint board
│   ├── issues/         # Issue explorer table + detail drawer
│   ├── developers/     # Team insights & capacity
│   ├── analytics/      # Deep dive charts
│   ├── reports/        # AI-generated reports
│   ├── settings/       # Configuration
│   └── api/
│       ├── data/       # GET sprint/issue/developer data
│       ├── issues/     # PATCH issue status & blocker state
│       └── copilot/    # POST AI analysis (streaming)
├── components/
│   ├── navigation.tsx        # Sidebar with grouped nav items
│   ├── dashboard-layout.tsx  # Shell: sidebar + topbar
│   └── copilot-drawer.tsx    # AI assistant slide-in panel
└── lib/
    ├── db.ts           # SQLite schema, seed data, query helpers
    ├── ai-engine.ts    # LLM-backed sprint analysis
    └── store.ts        # Zustand global state
```

---

## 🎨 Design System (UI UX Pro Max Skill)

Applied from the [UI UX Pro Max Skill](https://github.com/nextlevelbuilder/ui-ux-pro-max-skill) with:

```
--variant 8 --motion 9 --density 8
```

| Token | Value | Use |
|-------|-------|-----|
| Background | `#020617` | App background |
| Primary | `#0F172A` | Cards & panels |
| Accent | `#22C55E` | Live indicators, health scores |
| Highlight | `#6366f1` | Charts, active nav |
| Foreground | `#F8FAFC` | Primary text |
| Border | `#334155` | Card borders |
| UI Font | Plus Jakarta Sans | All UI text |
| Data Font | Fira Code | Metrics, IDs, badges |

**Style**: Bento Grid — modular, Apple-style, 48px grid texture  
**Motion**: 600ms `cubic-bezier(0.16, 1, 0.3, 1)` stagger entrances  
**Charts**: Bullet Track (Skill spec) + SVG Gauge dials  

---

## 📸 Pages

- `/dashboard` — Executive overview with KPI bento grid
- `/sprints` — Kanban board with real state transitions
- `/issues` — Issue explorer with filter bar & detail drawer
- `/developers` — Team capacity & developer profiles
- `/analytics` — Historical velocity & flow metrics
- `/reports` — AI-generated sprint summaries

---

## 🔌 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/data?sprintId=N` | Full sprint data, developers, epics, issues, burndown |
| `PATCH` | `/api/issues` | Update issue status, blocker state |
| `POST` | `/api/copilot` | Stream AI analysis response |

---

## 👩‍💻 Author

**Sakshi Pandey** · Engineering Manager  
GitHub: [@sakshipandey2223](https://github.com/sakshipandey2223)

---

## 📄 License

MIT — feel free to fork and extend.
