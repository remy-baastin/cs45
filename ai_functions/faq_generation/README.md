# FAQ Generation — Knowledge Creation Layer

**AI Member 4: Negha**  
**Module**: `ai_functions/faq_generation`  
**Sprint**: Crowd-Sourced FAQ Generation Platform — VINS AI Team

---

## What This Module Does

This module is the **Knowledge Creation Layer** of the VINS platform. Its job is to take raw, unstructured community inputs and convert them into clean, validated, professional-grade FAQ entries that get stored in the database.

It handles two distinct input sources:

1. **Community Q&A** — When users ask questions and others answer them on the platform, this module watches for when a question accumulates enough answers (≥ 2), then automatically generates a polished FAQ from those answers.

2. **Zoom Meeting Transcripts** — When a mentor or TA runs a Zoom session and interns ask questions, the raw meeting transcript can be processed through this module to extract reusable FAQ entries directly from the conversation.

Both sources go through the same quality pipeline: AI generation → schema validation → tag normalization → quality scoring → auto-approval decision.

---

## Files

| File | Description |
|---|---|
| `knowledge-creation.service.ts` | Core service class — the main contribution. Contains all trigger logic, validation, tag normalization, quality review, and auto-approval |
| `ai-service.interface.ts` | Interface contract defining what the AI service layer must provide (`IAIService`, `FAQOutput`, `QualityOutput`, `TagsOutput`) |
| `zoom-transcription-processor.ts` | Extends `KnowledgeCreationService` to handle Zoom meeting transcript processing |
| `run_pipeline.ts` | Development runner — simulates the community Q&A pipeline end-to-end using Samarpit's real AI functions |
| `run_zoom_pipeline.ts` | Interactive CLI — manually test the Zoom transcript pipeline with sample or custom transcripts |
| `package.json` | npm scripts to run the pipelines locally |
| `tsconfig.json` | TypeScript compiler configuration |

---

## How to Run Locally

```bash
npm install
npm run pipeline    # Run community Q&A pipeline
npm run zoom        # Launch interactive Zoom transcript CLI
```

---

## Architecture

### Core Service: `KnowledgeCreationService`

```
                    ┌─────────────────────────────────────┐
                    │       KnowledgeCreationService       │
                    │                                     │
  question +  ──►  │  1. checkFAQGenerationTrigger()      │
  answers          │     └─ fires only if answers >= 2    │
                    │                                     │
                    │  2. aiService.generateFAQ()          │ ──► IAIService
                    │     └─ Samarpit's MiniMax call       │     (Samarpit)
                    │                                     │
                    │  3. validateFAQSchema()              │
                    │     └─ checks all required fields    │
                    │                                     │
                    │  4. normalizeTags()                  │
                    │     └─ lowercase, dedup, 3-5 range   │
                    │                                     │
                    │  5. aiService.reviewFAQQuality()     │ ──► IAIService
                    │     └─ scores 0.0 to 1.0            │     (Samarpit)
                    │                                     │
                    │  6. Auto-approval decision           │
                    │     score >= 0.70 → "published"     │
                    │     score <  0.70 → "pending_review" │
                    │                                     │
                    │  7. Personal query check             │
                    │     type=personal → escalation      │
                    │     disclaimer appended             │
                    └─────────────────────────────────────┘
                                    │
                                    ▼
                            FAQDocument output
                        (written to MongoDB by backend)
```

### Zoom Extension: `ZoomTranscriptionProcessor`

```
  Raw Zoom          ┌───────────────────────────────────────┐
  transcript  ──►   │     ZoomTranscriptionProcessor        │
  (plain text)      │   extends KnowledgeCreationService    │
                    │                                       │
                    │  1. extractFAQsFromTranscription()    │
                    │     └─ AI scans transcript for        │
                    │        question/answer patterns       │
                    │                                       │
                    │  2–7. Same pipeline as above          │
                    │       (validate, normalize, review,   │
                    │        approve, route)                │
                    └───────────────────────────────────────┘
                                    │
                                    ▼
                         FAQDocument[] output
                     (written to MongoDB FAQ collection)
```

---

## Key Design Decisions

### Trigger Rules
- **Generic questions** — fire as soon as **1 peer answer** exists. A single community answer is enough to reframe into a polished, professional FAQ. The AI service handles the quality lift.
- **Personal questions** — **never auto-generated**. These are questions involving billing, personal data, or sensitive account issues. They are routed directly to an admin for individual resolution and are never published as public FAQs.

### Auto-Approval at 0.70
The quality review returns a score from 0.0 to 1.0. Any FAQ scoring 0.70 or above is automatically published. Below 0.70, it is flagged as `pending_review` for a human admin to check. This threshold was chosen to balance automation speed with quality assurance.

### Personal Query Routing
When a question is classified as `type: personal` (by Vishal's classification layer), this module automatically appends an escalation disclaimer to the answer directing the user to raise a formal ticket rather than rely on a generic FAQ response.

### IAIService Interface (ai-service.interface.ts)
This file defines the contract between this module and the AI service layer (Samarpit's module). It specifies exactly what functions are required and what shape their responses must take. This decouples the two modules completely — this module does not care how Samarpit implements the AI calls, only that the response matches the interface.

---

## Integration Points

| Dependency | From | What is needed |
|---|---|---|
| `generateFAQ()`, `generateTags()`, `reviewFAQQuality()` | **Samarpit** (faq_ai_service) | Real MiniMax API implementation of `IAIService` |
| Trigger hook on answer submission | **Backend team** | Call `processCommunityQuestion()` when `answerCount >= 2` |
| Zoom transcript upload endpoint | **Backend team** | `POST /admin/process-transcript` calling `processZoomTranscription()` |
| Question `type` field | **Vishal** (query_classification) | Each Question document must have `type: 'generic' \| 'personal'` set before this module runs |

---

## Data Flow (Production)

```
User submits question   ──►   MongoDB Question collection
User submits answer     ──►   MongoDB Answer collection
                               │
                               ▼ (when answerCount >= 2)
              KnowledgeCreationService.processCommunityQuestion()
                               │
                               ▼
                        MongoDB FAQ collection
                        { question, answer, tags, quality_score,
                          status, approved, type }
```
