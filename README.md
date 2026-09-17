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

The project is cleanly split into independent **Frontend** and **Backend** directories:

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
│   │   └── IngestModal.tsx              # Interactive raw payload ingestion test modal
│   ├── next.config.ts                   # Proxies /api/* to Backend (http://localhost:5000)
│   ├── package.json
│   └── tsconfig.json
│
├── package.json                         # Root orchestration scripts
└── README.md
```

---

## 📐 Shared Data Contracts (A ⇄ B Interface)

### 1. Ingestion → AI Contract: `CanonicalSubmission`
File: [`backend/schemas/submission.schema.ts`](./backend/schemas/submission.schema.ts)

```typescript
export interface CanonicalSubmission {
  submission_id: string;
  user_id?: string;
  platform: "leetcode" | "codeforces";
  problem: {
    id: string;
    title: string;
    difficulty?: string;
    topic_tags: string[];
    url?: string;
  };
  submission: {
    language: string;
    verdict: "AC" | "WA" | "TLE" | "MLE" | "RE" | "CE" | "OTHER";
    runtime_ms?: number;
    memory_mb?: number;
    timestamp: number;
    code: string;
    error_message?: string;
  };
}
```

### 2. AI → Scheduler / Dashboard Contract: `AnalysisOutput`
File: [`backend/schemas/analysis.schema.ts`](./backend/schemas/analysis.schema.ts)

```typescript
export interface AnalysisOutput {
  user_id?: string;
  analyzed_at?: number;
  summary?: string;
  weak_topics: Array<{
    topic: string;
    failure_mode: string;
    confidence: number;
    evidence_count: number;
    example_submissions: string[];
    description?: string;
  }>;
  recommended_problems: Array<{
    platform: "leetcode" | "codeforces";
    problem_id: string;
    title?: string;
    difficulty?: string;
    reason: string;
    url?: string;
  }>;
}
```

---

## 🚀 Running the Project

### 1. Install All Dependencies
```bash
# In the root folder:
npm install
npm --prefix backend install
npm --prefix frontend install
```

### 2. Run Both Backend & Frontend Concurrently
```bash
npm run dev
```
* **Backend API**: `http://localhost:5000`
* **Frontend Dashboard**: `http://localhost:3000`

### 3. Run Backend Only
```bash
npm run dev:backend
```

### 4. Run Frontend Only
```bash
npm run dev:frontend
```

### 5. Run Unit Tests & Data Validation
```bash
npm test
npm run validate:data
```

---

## 📡 Backend API Endpoints (Port 5000)

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/health` | Backend service health check |
| `GET` | `/api/submissions` | Search and filter OpenSearch submissions (`?q=`, `?platform=`, `?verdict=`, `?topic=`) |
| `POST` | `/api/submissions` | Ingest raw payload, normalize to `CanonicalSubmission`, index to OpenSearch |
| `GET` | `/api/analysis` | Retrieve AI weakness analysis & recommendations (Person B contract) |
| `GET` | `/api/schedule` | Get upcoming spaced repetition practice problems |
| `POST` | `/api/schedule` | Schedule problem or mark review step completed |
