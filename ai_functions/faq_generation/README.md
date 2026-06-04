# FAQ Generation — Knowledge Creation Layer
**AI Member 4: Negha**

This module implements the **Knowledge Creation Layer** of the VINS Crowd-Sourced FAQ Generation Platform. It is responsible for transforming raw community Q&A discussions and Zoom meeting transcripts into professional, validated, and auto-approved FAQ entries.

---

## Files

| File | Description |
|---|---|
| `knowledge-creation.service.ts` | Core service — trigger check, schema validation, tag normalization, quality review, auto-approval |
| `samarpit-ai.interface.ts` | Shared interface contract for Samarpit's AI service layer |
| `zoom-transcription-processor.ts` | Extends KnowledgeCreationService to process Zoom meeting transcripts |
| `run_pipeline.ts` | Runner for the community Q&A → FAQ pipeline (uses Samarpit's real adapter) |
| `run_zoom_pipeline.ts` | Interactive CLI for the Zoom transcript → FAQ pipeline |
| `run_sample_demo.ts` | Phase-by-phase demo of both pipelines with explanations |
| `peer_questions.json` | 42 sample community Q&A entries used for testing |
| `professional_faqs.json` | Pipeline output — 36 auto-approved professionalized FAQs |

---

## How to Run

```bash
npm install
npm run demo        # Phase-by-phase walkthrough of both pipelines
npm run pipeline    # Community Q&A pipeline
npm run zoom        # Interactive Zoom transcript pipeline
```

---

## Pipeline Overview

### Pipeline A — Community Q&A → FAQ
1. **Trigger check** — fires only when a question has ≥ 2 community answers
2. **generateFAQ()** — calls Samarpit's AI service to build a structured FAQ
3. **normalizeTags()** — cleans, deduplicates, enforces 3–5 tags
4. **reviewFAQQuality()** — scores the FAQ (0.0–1.0)
5. **Auto-approval** — score ≥ 0.70 → `published`, else → `pending_review`
6. **Personal routing** — appends escalation disclaimer for personal queries

### Pipeline B — Zoom Transcript → FAQ
1. Receives raw Zoom meeting transcript text
2. Extracts FAQ candidates using topic detection
3. Runs the same validate → normalize → review → approve flow

---

## Integration Points

| Needs from | What |
|---|---|
| **Samarpit** | Real MiniMax API calls in `generateFAQ`, `generateTags`, `reviewFAQQuality` |
| **Backend team** | Call `processCommunityQuestion()` when `answerCount >= 2` |
| **Backend team** | Expose `POST /admin/process-transcript` calling `processZoomTranscription()` |
