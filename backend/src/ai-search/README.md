# AI FAQ Search & Suggestions Module

This module implements the **D-01 Semantic FAQ Search** and **D-02 Live Suggestions** features for the Crowd-Sourced FAQ Platform. It is fully integrated with the shared backend layout and MongoDB schema.

## Features

1. **Semantic FAQ Search (`POST /ai/search`)**
   - Matches queries semantically using MiniMax `embo-01` embeddings (1536 dimensions).
   - Confident match serving (default threshold `0.78`).
   - In-memory cache scan for ultra-low latency (~5ms matching).

2. **Live Suggestions (`POST /ai/suggest`)**
   - Autocomplete matching on keystrokes.
   - Low confidence threshold (`0.65`) to maximize recall and prevent duplicate query submissions.
   - Question-only return list for UI space efficiency.

3. **Offline / Mock Mode**
   - Runs **API-keyless** out of the box. If no `MINIMAX_API_KEY` is present in `.env`, it falls back to a deterministic 1536-dimensional L2-normalized word-hashing embedding generator.

4. **Self-contained Caching & Indexing**
   - In-memory caching loads all published FAQs at boot time.
   - Exposes refresh and indexing endpoints to update cache on-demand.

---

## Folder Structure

```
src/ai-search/
├── dto/
│   └── search.dto.ts           # Input validators for search/suggest/indexing
├── test/
│   └── cosine.spec.ts          # Unit tests for the similarity calculations
├── ai-search.controller.ts     # REST Endpoints
├── ai-search.module.ts         # Module bootstrap and mongoose linking
├── ai-search.service.ts        # Search & suggestions core service
├── embedding-cache.service.ts  # In-memory document indexing & caching
└── minimax-embedding.client.ts # MiniMax API Client & mock vector generator
```

---

## API Endpoints

### 1. Semantic FAQ Search
`POST /ai/search`

#### Request
```json
{
  "query": "how do I reset my password",
  "topN": 5,          
  "threshold": 0.78   
}
```

#### Response
```json
{
  "results": [
    {
      "faqId": "64f1a2b3c4d5e6f7a8b9c0d1",
      "question": "How do I recover my account password?",
      "answer": "Go to the login page and click 'Forgot Password'. Enter your registered email...",
      "confidence": 0.923,
      "category": "account",
      "tags": ["password", "account", "login"]
    }
  ],
  "confidence": 0.923,
  "query": "how do i reset my password",
  "latencyMs": 8
}
```

---

### 2. Live Suggestions
`POST /ai/suggest`

#### Request
```json
{
  "query": "reset pass"
}
```

#### Response
```json
{
  "suggestions": [
    {
      "faqId": "64f1a2b3c4d5e6f7a8b9c0d1",
      "question": "How do I recover my account password?",
      "confidence": 0.812
    }
  ],
  "latencyMs": 4
}
```

---

### 3. Index/Bulk-Index (Admin/Internal)
- `POST /ai/index/:faqId`: Generates an embedding for a specific FAQ and indexes it. (Called by Negha's FAQ generation module on approval).
- `POST /ai/index/bulk`: Bulk indexes all database FAQs lacking embeddings.
- `POST /ai/cache/refresh`: Reloads all published embeddings from the database.
- `GET /ai/cache/status`: Returns cache health status, load count, and last refresh timestamp.

---

## Setup & Execution

### 1. Seeding the Database
Download the latest IIT Ropar FAQ dataset and load it into your local MongoDB:
```bash
npm run seed
```

### 2. Running Unit Tests
Validate the cosine similarity, L2 normalizations, and ranking engine:
```bash
npm run test
```

### 3. Start Development Server
```bash
npm run start:dev
```
The server runs on port `5000` by default.
