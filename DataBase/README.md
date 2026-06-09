# Samagama — MongoDB Database

Complete MongoDB + Express backend for the Samagama FAQ System.

---

## Project Structure

```
samagama-db/
├── config/
│   └── db.js              ← MongoDB connection
├── models/
│   ├── User.js            ← Users (students, mods, admins)
│   ├── Question.js        ← User queries
│   ├── Answer.js          ← Community answers + upvotes
│   ├── FaqElement.js      ← AI-generated FAQs (source of truth)
│   └── Feedback.js        ← Yaksha helpful/not-helpful signals
├── routes/
│   ├── users.js           ← register, login, block, leaderboard
│   ├── questions.js       ← CRUD + bookmark + community board
│   ├── answers.js         ← CRUD + upvote
│   ├── faqs.js            ← CRUD + publish + tag filter
│   └── feedback.js        ← POST /feedback (Riddhima's endpoint)
├── seeds/
│   └── seed.js            ← Populate DB with sample data
├── .env.example           ← Copy to .env and fill in
├── package.json
└── server.js              ← Express entry point
```

---

## Setup

### 1. Install dependencies
```bash
npm install
```

### 2. Create .env file
```bash
cp .env.example .env
```
Edit `.env` and set your MongoDB URI:
```
MONGO_URI=mongodb://localhost:27017/samagama
PORT=3000
```

### 3. Seed the database (optional — for testing)
```bash
npm run seed
```
This creates sample users, questions, answers, FAQs, and feedback.

Test login credentials after seeding:
| Role      | Email                          | Password   |
|-----------|-------------------------------|------------|
| Admin     | admin@samagama.in             | admin123   |
| Moderator | mod@samagama.in               | mod123     |
| Student   | er.gurnoorsingh@gmail.com     | student123 |

### 4. Start the server
```bash
npm run dev      # development (auto-restart)
npm start        # production
```

Server runs at: `http://localhost:3000`

---

## API Routes

### Users
| Method | URL | Description |
|--------|-----|-------------|
| POST | /users/register | Create account |
| POST | /users/login | Login |
| GET | /users/:id | Get user profile |
| PATCH | /users/:id/block | Block/unblock user (admin) |
| GET | /users/leaderboard/top | Top SP scorers |

### Questions
| Method | URL | Description |
|--------|-----|-------------|
| POST | /questions | Raise a query |
| GET | /questions | Community board (filter: sort, tag, page) |
| GET | /questions/:id | Single question + answers |
| PATCH | /questions/:id | Update classification/routing (AI internal) |
| DELETE | /questions/:id | Delete question + answers (admin) |
| POST | /questions/:id/bookmark | Bookmark toggle |

### Answers
| Method | URL | Description |
|--------|-----|-------------|
| POST | /answers | Submit an answer |
| GET | /answers/question/:id | All answers for a question |
| POST | /answers/:id/upvote | Upvote toggle |
| PATCH | /answers/:id | Update moderation/accepted status |
| DELETE | /answers/:id | Delete answer (admin) |

### FAQs
| Method | URL | Description |
|--------|-----|-------------|
| POST | /faqs | Create FAQ entry (AI internal) |
| GET | /faqs | Published FAQ list |
| GET | /faqs/:id | Single FAQ (increments view_count) |
| PATCH | /faqs/:id | Update (used by all AI routes) |
| DELETE | /faqs/:id | Delete FAQ (admin) |
| GET | /faqs/tags/all | All unique tags |

### Feedback (POST /feedback — Riddhima)
| Method | URL | Description |
|--------|-----|-------------|
| POST | /feedback | Store helpful/not_helpful signal |
| GET | /feedback/faq/:faq_id | All feedback for a FAQ (admin) |

---

## How it maps to your AI endpoints

| AI Endpoint | DB interaction |
|-------------|---------------|
| POST /ai/search | Reads `FaqElement.embedding` + `ai_faq_question` |
| POST /ai/suggest | Same as search, lower threshold |
| POST /ai/classify | Writes `Question.classification` + `Question.routing` |
| POST /ai/moderate | Writes `Question.moderation_status` or `Answer.moderation_status` |
| POST /ai/generate-faq | Creates `FaqElement`, writes `ai_faq_question` + `ai_faq_answer` |
| POST /ai/generate-tags | Writes `FaqElement.tags` |
| POST /ai/review-faq | Writes `FaqElement.quality_score` |
| POST /feedback | Creates `Feedback`, updates `FaqElement.helpful_count` |

---

## SP Points System

| Action | SP Earned |
|--------|-----------|
| Ask a question | +2 |
| Submit an answer | +5 |
| Your answer gets upvoted | +3 |
| Bookmark a question | +1 |
| Give feedback to Yaksha | +1 |
