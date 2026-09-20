# 🎯 BlindSpot - AI Competitive-Programming Coach & Algorithmic Diagnostic Engine

> **AWS Hackathon Submission**  
> *Transforming competitive programming from mindless grinding into precision algorithmic mastery using AWS Serverless, Amazon OpenSearch, and Strands AI Agents.*

---

## Executive Summary

Competitive programmers and software engineering candidates frequently hit plateaus where they solve hundreds of problems on LeetCode and Codeforces yet repeat the exact same subtle algorithmic blind spots:
- **Boundary Condition Errors** (e.g., `while (left < right)` vs `while (left <= right)` in binary search)
- **Visited State Errors** (e.g., marking graph nodes visited *after* dequeue instead of *upon* enqueue in BFS)
- **State Transition Flaws** (e.g., adjacent state overlaps in House Robber dynamic programming)
- **Unmemoized Recursion & Edge Overlooks** (e.g., integer overflow, $O(2^N)$ branches)

**BlindSpot** is an end-to-end intelligent coaching pipeline that connects directly to a user's LeetCode and Codeforces profiles, ingests and normalizes their real submission histories, indexes mistakes in **Amazon OpenSearch**, diagnoses recurring failure patterns using a **Strands AI Agent with Gemini**, and schedules deliberate, targeted practice using a **SuperMemo SM-2 Spaced Repetition Engine** backed by **Amazon DynamoDB**.

---

## Architecture Overview

```
                               ┌────────────────────────┐
                               │   LeetCode GraphQL     │
                               │   Codeforces REST API  │
                               └───────────┬────────────┘
                                           │
                                           ▼
                              [ Ingestion & Normalizer ]
                             (Zod Schema & Canonical AST)
                                           │
                 ┌─────────────────────────┼─────────────────────────┐
                 ▼                         ▼                         ▼
        [ Amazon S3 ]            [ Amazon DynamoDB ]      [ Amazon OpenSearch ]
   (Raw Ingestion Payloads)      (Profiles, Weaknesses,    (Submission Indexing &
                                 Schedules, Audit Logs)    Mistake Similarity)
                 │                         │                         │
                 │                         │                         │
                 └─────────────────────────┼─────────────────────────┘
                                           │
                                           ▼
                             [ Strands AI Agent Engine ]
                               (Pre-Aggregated Evidence)
                                           │
                                           ▼
                          [ Consolidated 1-Call LLM Request ]
                                (Gemini 3.1 Flash-Lite)
                                           │
                                           ▼
                              [ SuperMemo SM-2 Scheduler ]
                                           │
                                           ▼
                            [ AWS Lambda / Express API ]
                                           │
                                           ▼
                            [ Amazon API Gateway HTTP API ]
                                           │
                                           ▼
                             [ Next.js 15 Dashboard UI ]
```

---

## AWS Cloud Stack & Deep Dive

BlindSpot is architected from the ground up to take full advantage of the **AWS Serverless and Managed Data Ecosystem**:

| AWS Service | Role in BlindSpot | Implementation Details |
| :--- | :--- | :--- |
| **Amazon DynamoDB** | **Core State & Persistence** | **Single-Table Design (`BlindSpot-Core`)**: Stores user profiles, historical analysis snapshots, diagnosed weaknesses (`weak_topics`), and spaced-repetition schedules using composite partition/sort keys (`PK`/`SK`) with Point-in-Time Recovery and Server-Side Encryption. |
| **Amazon OpenSearch Service** | **Mistake Indexing & Similarity Search** | Stores indexed submission documents with canonical code, judge execution feedback, and tags. Powers fast similarity queries (`searchPastMistakes`) to correlate current failures against historical patterns. |
| **Amazon S3** | **Raw Ingestion & Audit Storage** | `blindspot-raw-submissions-{accountId}-{env}` bucket stores immutable raw JSON response payloads from LeetCode/Codeforces for data integrity and replayability. |
| **AWS Lambda** | **Serverless Compute Handlers** | Microservices for `/api/sync`, `/api/analyze`, `/api/submissions`, `/api/weaknesses`, `/api/recommendations`, and `/api/schedule` written in TypeScript with sub-second execution. |
| **Amazon API Gateway** | **HTTP API v2 Layer** | Provides secure, managed HTTP routing, CORS headers, payload compression, and request throttling. |
| **AWS SAM (Serverless Application Model)** | **Infrastructure as Code** | Full `template.yaml` defining all DynamoDB tables, S3 buckets, Lambda functions, IAM roles, and API Gateway routes for reproducible 1-click cloud deployments. |

---

## Key Features

### 1. Multi-Platform Automated Ingestion & Bio-Token Verification
- Ingests real submission histories from both **LeetCode** and **Codeforces**.
- Offers interactive proof-of-ownership via biometric profile bio-token verification (`blindspot-verify-{token}`).
- Seamless normalization of judge verdicts (`AC`, `WA`, `TLE`, `MLE`, `RE`, `CE`) into a strict **Canonical Submission Schema**.

### 2. Strands AI Agent with 1-Call Optimized Architecture
- **Consolidated Reasoning**: Pre-aggregates all failed submissions, error outputs, test case mismatches, and OpenSearch similarity patterns before invoking the LLM.
- **Strict Free-Tier Rate-Limit Protection**: Executes **exactly ONE Gemini API call per complete analysis run** (avoiding `429 RESOURCE_EXHAUSTED`).
- **High-Density Pedagogical Output**: Produces structured root-cause explanations, variable/loop bug locations, correct invariant reasoning, and side-by-side code comparisons.

### 3. Deterministic Offline Expert Fallback
- If the AI API experiences network issues or rate limits, BlindSpot's built-in **Deterministic AST Heuristic Engine** automatically generates structured algorithmic diagnoses and problem recommendations with zero downtime.

### 4. SuperMemo SM-2 Spaced Repetition Practice Board
- Converts diagnosed weaknesses into active practice queues across **Day 0, Day 1, Day 3, Day 7, and Day 14+**.
- Automatically schedules targeted LeetCode / Codeforces problems specifically chosen to fix the user's diagnosed failure modes.

### 5. OpenSearch Submissions Explorer
- Real-time search, platform filtering, and verdict breakdown across all historical user submissions.
- Direct code inspector modal with execution feedback and syntax highlighting.

### 6. Seamless Session & Profile Persistence
- Instant session restoration via `localStorage` with zero landing page flash on refresh.
- Quick toggle between live verified accounts and built-in interactive demo mode.

---

## Technology Stack

```text
├── Frontend
│   ├── Next.js 15 (App Router)
│   ├── React 19 & TypeScript 5.8
│   ├── Tailwind CSS v4
│   ├── Lucide Icons & Akar Icons
│   └── Framer Motion & GSAP
│
├── Backend & Compute
│   ├── Node.js 20.x & TypeScript
│   ├── Express 4.x (Local Dev Adapter)
│   ├── AWS Lambda (nodejs20.x runtime)
│   └── Zod Schema Validation
│
├── AI & Diagnostics
│   ├── Strands Agent Orchestration
│   ├── Google Gemini API (gemini-3.1-flash-lite)
│   └── Offline Rule-Based AST Engine
│
└── AWS Cloud Infrastructure
    ├── Amazon DynamoDB (Single-Table Core)
    ├── Amazon OpenSearch Service
    ├── Amazon S3 (Raw Submissions Bucket)
    ├── Amazon API Gateway (HTTP API v2)
    └── AWS SAM (Serverless Application Model)
```

---

## Local Setup & Quickstart

### Prerequisites
- **Node.js 20.x+** installed ([Download Node.js](https://nodejs.org/))
- **npm** (comes with Node.js)
- **Git**

---

### Step 1: Clone Repository & Install Dependencies

```bash
# Clone the repository
git clone https://github.com/your-username/BlindSpot.git
cd BlindSpot

# Install root, backend, and frontend dependencies
npm run install:all
```

---

### Step 2: Configure Environment Variables

Create or verify `backend/.env`:

```ini
# Backend Port
PORT=5000

# Gemini LLM Configuration
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=gemini-3.1-flash-lite

# AWS Configuration (Defaults to local mock fallbacks if credentials are not provided)
AWS_REGION=ap-south-1
DYNAMODB_TABLE=BlindSpot-Core

# Optional Email / Notification Service
RESEND_API_KEY=your_resend_api_key
EMAIL_FROM=verify@yourdomain.com
```

Create `frontend/.env.local` (optional for local proxy):
```ini
NEXT_PUBLIC_API_URL=http://localhost:5000
```

---

### Step 3: Run Monorepo Locally

Start both the backend API server (`http://localhost:5000`) and the Next.js frontend (`http://localhost:3000`) with a single command:

```bash
npm run dev
```

Open **[http://localhost:3000](http://localhost:3000)** in your browser!

---

### Step 4: Run Automated Test Suite

BlindSpot comes with an automated test suite verifying schemas, data normalization, OpenSearch operations, DynamoDB persistence, and single-call LLM orchestration:

```bash
cd backend
npm test
```

Expected Output:
```text
✔ Test 1 - House Robber: Diagnoses adjacent state overlap and correct recurrence
✔ Test 2 - Binary Search: Diagnoses while (left < right) premature loop termination
✔ Test 3 - Graph: Diagnoses post-dequeue visited marking and BFS queue inflation
✔ Test 4 - TLE: Distinguishes unmemoized exponential recursion from logical WA
✔ Test 5 - AC: Accepted submission reports clean verdict with no false failure
✔ Test 6 - History: Aggregates recurring weaknesses with root-cause summaries
✔ Test 7 - Helpers: getWeaknessProfile and getRecommendations return typed arrays
✔ Test 8 - Empty History: Gracefully handles user with no submissions
✔ Test 9 - All-AC: Gracefully handles user with only Accepted submissions
✔ Test 10 - Agent Tools: getUserSubmissions, getFailedSubmissions, searchSimilarMistakes
✔ Test 11 - Persistence: Saves and verifies analysis in DynamoDB
✔ Test 12 - Gemini: Correctly extracts and parses Gemini completion response structure
✔ Test 13 - Telemetry: Verifies provider telemetry tracking and key sanitization
✔ Test 14 - Single LLM Invocation: Analysis run performs exactly one consolidated LLM request
✔ CanonicalSubmissionSchema validates a well-formed submission
✔ CanonicalSubmissionSchema rejects invalid verdict or missing fields
✔ AnalysisOutputSchema validates contract payload
✔ normalizeSubmission normalizes LeetCode raw payload correctly
✔ normalizeSubmission normalizes Codeforces raw payload correctly
✔ OpenSearch service saves and searches submissions and similar mistakes
✔ Spaced-repetition scheduler manages intervals and progression
✔ Person B analysis service returns validated analysis output
ℹ tests 22 | pass 22 | fail 0
```

---

## Deploying to AWS via SAM

Deploy the complete serverless backend, DynamoDB tables, S3 buckets, and API Gateway directly to AWS:

```bash
# Build SAM application
sam build

# Deploy to AWS with guided configuration
sam deploy --guided
```

SAM will automatically provision:
1. **`BlindSpotHttpApi`** (API Gateway HTTP API)
2. **`BlindSpotCoreTable`** (DynamoDB Single-Table Core)
3. **`RawSubmissionsBucket`** (S3 Storage)
4. **Lambda Functions**: `SyncSubmissionsFunction`, `GetSubmissionsFunction`, `GetWeaknessesFunction`, `GetRecommendationsFunction`, `ScheduleFunction`, `TriggerAnalysisFunction`.

---

## API Reference

| Method | Endpoint | Description | Query / Body Params |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/sync` | Syncs live submissions from LeetCode and Codeforces | `{ "userId", "leetcodeUsername", "codeforcesHandle" }` |
| `GET` | `/api/submissions` | Searches indexed submissions via OpenSearch | `?q=search&platform=leetcode&verdict=WA` |
| `GET` | `/api/analysis` | Retrieves persisted AI analysis from DynamoDB | `?userId=user_demo` |
| `POST` | `/api/analyze` | Triggers a fresh Strands AI Agent analysis run | `{ "userId": "user_demo" }` |
| `GET` | `/api/weaknesses` | Gets diagnosed algorithmic blind spots | `?userId=user_demo` |
| `GET` | `/api/recommendations`| Gets targeted problem recommendations | `?userId=user_demo` |
| `GET` | `/api/schedule` | Retrieves spaced-repetition practice review queues | `?userId=user_demo` |
| `POST` | `/api/schedule` | Schedules a recommended problem into SM-2 queue | `{ "action": "schedule", "problem_id": "704", ... }` |
| `POST` | `/api/schedule/complete` | Marks a review problem completed and updates interval | `{ "id": "schedule_id", "action": "complete" }` |
| `POST` | `/api/auth/verify-email` | Sends or validates email OTP verification | `{ "email", "code", "action" }` |
| `POST` | `/api/auth/verify-handle` | Validates profile ownership token on LeetCode/Codeforces | `{ "platform", "handle", "token" }` |

---
