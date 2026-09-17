# BlindSpot — AI Competitive-Programming Coach (Person A Pipeline)

BlindSpot analyzes a competitive programmer's LeetCode and Codeforces submission history, identifies recurring algorithmic failure patterns, pinpoints weak topics, and recommends targeted practice via spaced repetition.

---

## 🏗️ Architecture & Responsibilities

| Person | Responsibilities | Technologies |
| :--- | :--- | :--- |
| **Person A** *(This Subsystem)* | Data Ingestion, Normalization, OpenSearch, Spaced Repetition, Frontend & Backend APIs | TypeScript, Express, Next.js, Zod, OpenSearch |
| **Person B** *(AI Teammate)* | Strands Agent, Prompting, Root-Cause AI Reasoning, Recommendation Engine | Python/Strands, Local LLM |

---

## 📁 Monorepo Structure

```text
d:/BlindSpot/
├── backend/                             # Backend API, Ingestion, OpenSearch & Scheduler
│   ├── data/
│   │   ├── mock-submissions.json        # 37 realistic mock submissions across 7 topics
│   │   └── mock-analysis.json           # Person B AI analysis mock output
│   ├── schemas/
│   │   ├── submission.schema.ts         # Canonical submission schema (Zod + TS types)
│   │   └── analysis.schema.ts           # AI analysis output schema (Zod + TS types)
│   ├── services/
│   │   ├── ingestion/
│   │   │   ├── config.ts                # Configured profile IDs (LeetCode & Codeforces)
│   │   │   ├── live-fetcher.ts          # Real API integration (alfa-leetcode-api & Codeforces)
│   │   │   ├── leetcode.ts              # LeetCode raw response parser
│   │   │   └── codeforces.ts            # Codeforces API response parser
│   │   ├── normalization.ts             # Unified normalization gateway
│   │   ├── opensearch.ts                # OpenSearch storage & search service
│   │   └── analysis.ts                  # Person B analysis consumer
│   ├── scheduler/
│   │   └── spaced-repetition.ts         # Spaced-repetition interval engine (Day 0, 1, 3, 7, 14)
│   ├── src/
│   │   └── server.ts                    # Express API server (Port 5000)
│   ├── scripts/
│   │   └── validate-mock-data.ts        # Data verification script
│   ├── tests/
│   │   └── pipeline.test.ts             # Automated unit tests
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/                            # Next.js 15 App Router Frontend (Port 3000)
│   ├── app/
│   │   ├── globals.css                  # Dark mode design tokens & glassmorphism
│   │   ├── layout.tsx                   # Main layout
│   │   └── page.tsx                     # Dashboard UI
│   ├── components/
│   │   ├── Navbar.tsx                   # Header with status & actions
│   │   ├── StatsOverview.tsx            # KPI metric cards
│   │   ├── WeaknessSection.tsx          # Blind spot failure mode cards
│   │   ├── EvidenceModal.tsx            # Code inspector & failure diagnostics
│   │   ├── RecommendationsSection.tsx   # Curated problem recommendations
│   │   ├── PracticeSchedulerSection.tsx # Spaced repetition practice board
│   │   ├── SubmissionsExplorer.tsx      # OpenSearch search & filter table
│   │   ├── IngestModal.tsx              # Interactive raw payload ingestion test modal
│   │   └── SyncProfileModal.tsx         # Account connection & sync modal
│   ├── next.config.ts                   # Proxies /api/* to Backend (http://localhost:5000)
│   ├── package.json
│   └── tsconfig.json
│
├── package.json                         # Root orchestration scripts
└── README.md
```

---

## ⚡ Live API Integrations (Configured in Code)

Your profile credentials are configured in [`backend/services/ingestion/config.ts`](./backend/services/ingestion/config.ts):

* **LeetCode**: `@pragatighosh25` &rarr; queried via [alfa-leetcode-api](https://github.com/alfaarghya/alfa-leetcode-api) & LeetCode GraphQL
* **Codeforces**: `@pragati25` &rarr; queried via [Codeforces API](https://codeforces.com/apiHelp)

On server startup, real submissions are fetched automatically, normalized into the canonical schema, indexed in OpenSearch, diagnosed for recurring failure modes, and populated in your review schedule.

---

## 🚀 Running the Project

```bash
# Start BOTH Backend (port 5000) and Frontend (port 3000)
npm run dev
```

* **Frontend Dashboard**: `http://localhost:3000`
* **Backend API**: `http://localhost:5000`

---

## 🧪 Testing

```bash
# Run all 15 automated unit tests
npm test

# Run mock dataset verification
npm run validate:data
```
