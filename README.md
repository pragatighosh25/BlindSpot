# BlindSpot — AI Competitive-Programming Coach (Person A Pipeline)

BlindSpot is an intelligent competitive-programming coach that analyzes a developer's LeetCode and Codeforces submission history, identifies recurring algorithmic failure patterns (e.g. boundary-condition errors in Binary Search, visited-state mistakes in BFS/DFS, unmemoized recursions in Dynamic Programming), and schedules targeted practice via spaced repetition.

---

## 🏗️ Architecture & Responsibilities

| Person | Responsibilities | Technologies |
| :--- | :--- | :--- |
| **Person A** *(This Subsystem)* | Data Ingestion, Canonical Normalization, S3 Raw Storage, DynamoDB Core, OpenSearch Indexing, Spaced Repetition Engine, Next.js Dashboard, AWS Lambda & SAM Infrastructure | TypeScript, Next.js 15, Node.js, DynamoDB, S3, OpenSearch, AWS Lambda, AWS SAM |
| **Person B** *(AI Teammate)* | Strands Agent, LLM Prompting & Reasoning (Bedrock / Local LLM), Root-Cause Diagnostic Inference, Recommendation Engine | Python/Strands, Bedrock / Local LLM |

```
                                    ┌────────────────────────┐
                                    │    LeetCode API        │
                                    │    Codeforces API      │
                                    └───────────┬────────────┘
                                                │
                                                ▼
                                   [ Ingestion & Normalizer ]
                                                │
                     ┌──────────────────────────┼──────────────────────────┐
                     ▼                          ▼                          ▼
            [ S3 Raw Storage ]         [ DynamoDB Core ]         [ OpenSearch Service ]
         (JSON payload audit logs)    (Profiles, Weaknesses,     (Submissions & Mistake
                                         Schedules, Analytics)      Similarity Search)
                                                ▲                          ▲
                                                │                          │
                                    [ AWS Lambda / Express ] ◄─────────────┘
                                                │
                                    [ HTTP API Gateway v2 ]
                                                │
                                                ▼
                                     [ Next.js 15 Dashboard ]
```

---

## 📁 Monorepo Structure

```text
d:/BlindSpot/
├── template.yaml                        # AWS SAM Infrastructure-as-Code Template
├── backend/                             # Backend API, Ingestion, OpenSearch & Lambda Handlers
│   ├── data/
│   │   ├── mock-submissions.json        # 37 realistic mock submissions across 7 topics
│   │   └── mock-analysis.json           # Person B AI analysis mock output
│   ├── schemas/
│   │   ├── submission.schema.ts         # Canonical submission schema (Zod + TS types)
│   │   └── analysis.schema.ts           # AI analysis output schema (Zod + TS types)
│   ├── services/
│   │   ├── ingestion/
│   │   │   ├── config.ts                # Configured profile IDs (@pragatighosh25, @pragati25)
│   │   │   ├── live-fetcher.ts          # Real API integration (alfa-leetcode-api & Codeforces)
│   │   │   ├── leetcode.ts              # LeetCode raw response parser
│   │   │   └── codeforces.ts            # Codeforces API response parser
│   │   ├── normalization.ts             # Unified normalization gateway
│   │   ├── opensearch.ts                # OpenSearch storage & semantic search client
│   │   ├── analysis.ts                  # Person B analysis consumer
│   │   └── storage/
│   │       ├── dynamodb.ts              # DynamoDB Single-Table Service (+ In-Memory Fallback)
│   │       └── s3.ts                    # S3 Raw Payload Storage Service (+ Disk Fallback)
│   ├── scheduler/
│   │   └── spaced-repetition.ts         # Spaced-repetition interval engine (Day 0, 1, 3, 7, 14)
│   ├── src/
│   │   ├── handlers/                    # AWS Lambda Function Handlers
│   │   │   ├── syncSubmissions.ts       # POST /api/sync
│   │   │   ├── getSubmissions.ts        # GET /api/submissions & /api/submissions/{id}
│   │   │   ├── getWeaknesses.ts         # GET /api/weaknesses
│   │   │   ├── getRecommendations.ts    # GET /api/recommendations
│   │   │   ├── schedule.ts              # GET /api/schedule & POST /api/schedule
│   │   │   ├── triggerAnalysis.ts       # POST /api/analyze & GET /api/analysis
│   │   │   ├── response.ts              # Standard CORS & HTTP formatting
│   │   │   └── index.ts                 # Handler barrel export
│   │   └── server.ts                    # Local Express API server (Port 5000)
│   ├── scripts/
│   │   └── validate-mock-data.ts        # Data verification script
│   ├── tests/
│   │   └── pipeline.test.ts             # 15 automated unit tests
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
│   ├── next.config.ts                   # Proxies /api/* to Backend / API Gateway
│   ├── package.json
│   └── tsconfig.json
│
├── package.json                         # Root orchestration scripts
└── README.md
```

---

## ⚡ Live API Integrations (Configured in Code)

Your profile handles are configured in [`backend/services/ingestion/config.ts`](./backend/services/ingestion/config.ts):

* **LeetCode**: `@pragatighosh25` &rarr; queried via [alfa-leetcode-api](https://github.com/alfaarghya/alfa-leetcode-api) & LeetCode GraphQL
* **Codeforces**: `@pragati25` &rarr; queried via [Codeforces API](https://codeforces.com/apiHelp)

On server startup or sync trigger, real submissions are fetched automatically, normalized into the canonical schema, indexed in OpenSearch, diagnosed for recurring failure modes, and populated in your review schedule.

---

## ☁️ AWS Cloud Architecture & Resources

The backend is built with AWS Serverless best practices defined in [`template.yaml`](./template.yaml):

1. **Amazon DynamoDB (`blindspot-core-{env}`)**:
   - Single-table design (`PK`, `SK`) with On-Demand capacity (`PAY_PER_REQUEST`).
   - Stores user profiles (`USER#<id>`), detected weaknesses (`WEAKNESS#<id>`), spaced repetition schedules (`SCHEDULE#<id>`), and analysis run history.
2. **Amazon S3 (`blindspot-raw-submissions-{account}-{env}`)**:
   - Encrypted (SSE-S3) raw data lake.
   - Preserves original JSON payloads under `raw/{userId}/{platform}/{timestamp}.json` for auditing and agent re-processing.
3. **Amazon OpenSearch Service / Serverless**:
   - Indexes canonical submissions with full-text search over source code, topics, error messages, and failure modes.
4. **AWS Lambda & API Gateway (HTTP API v2)**:
   - 6 purpose-built, least-privilege TypeScript Lambda handlers built with `esbuild`.

### 🔄 Dual-Mode Architecture (Local vs AWS Cloud)
Every storage and search service automatically detects whether AWS environment variables (`AWS_REGION`, `DYNAMODB_TABLE`, `S3_BUCKET`, `OPENSEARCH_URL`) are present:
- **In Local Development (`npm run dev`)**: Falls back seamlessly to in-memory indexes and local disk storage without requiring AWS credentials or local emulation.
- **In AWS Lambda Deployment**: Automatically switches to native AWS SDK v3 clients (DynamoDB DocumentClient, S3, OpenSearch).

---

## 🚀 Deployment to AWS via SAM

### Prerequisites
1. [AWS CLI](https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html) configured (`aws configure`)
2. [AWS SAM CLI](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/install-sam-cli.html) installed

### Build & Deploy
```bash
# 1. Build the Lambda functions and SAM resources
sam build

# 2. Deploy to your AWS account (interactive setup for the first time)
sam deploy --guided
```

Once deployment completes, SAM outputs the `HttpApiUrl`. Set this in your frontend environment:
```bash
# In frontend/.env.local:
BACKEND_URL=https://<api-id>.execute-api.<region>.amazonaws.com/dev
```

---

## 💻 Running Locally

```bash
# 1. Start BOTH Backend (port 5000) and Frontend (port 3000)
npm run dev

# Or run separately:
# Backend
npm --prefix backend run dev

# Frontend
npm --prefix frontend run dev
```

* **Frontend Dashboard**: `http://localhost:3000`
* **Backend API**: `http://localhost:5000`

---

## 🧪 Testing & Validation

```bash
# Run all 15 automated unit tests
npm test

# Typecheck both frontend and backend
npm --prefix backend run typecheck
npm --prefix frontend run build

# Run mock dataset verification
npm run validate:data
```

---

## 📡 API Endpoints Reference

| Method | Route | Description |
| :--- | :--- | :--- |
| `POST` | `/api/sync` | Ingests LeetCode & Codeforces submissions, stores raw JSON in S3, indexes in OpenSearch, updates DynamoDB |
| `GET` | `/api/submissions` | Queries OpenSearch for submissions (supports `?platform=`, `?topic=`, `?verdict=`, `?search=`) |
| `GET` | `/api/submissions/{id}` | Fetches detailed submission record with source code and failure analysis |
| `GET` | `/api/weaknesses` | Returns aggregated weakness patterns and failure diagnostic summaries |
| `GET` | `/api/recommendations` | Returns targeted problem recommendations tailored to detected weaknesses |
| `GET` | `/api/schedule` | Retrieves spaced-repetition practice cards (due, upcoming, completed) |
| `POST` | `/api/schedule` | Updates review intervals or marks a practice item complete |
| `POST` | `/api/analyze` | Triggers Person B weakness analysis across unanalyzed submissions |
| `GET` | `/api/analysis` | Retrieves stored AI analysis result |
