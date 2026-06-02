# Backend Analysis for FAQ-project

This document provides a comprehensive analysis of the `backend` folder, including its structure, the functionality of each file along with its important functions, and instructions on how to run the application.

## Folder Structure

```text
backend/
├── dist/                     # Compiled JavaScript output
├── node_modules/             # Project dependencies
├── src/                      # Source code
│   ├── admin/                # Admin-related functionalities
│   ├── ai/                   # AI and NLP services (embeddings, toxicity, etc.)
│   ├── auth/                 # Authentication and authorization
│   ├── faqs/                 # FAQ management and feedback
│   ├── questions/            # User questions, answers, and voting
│   ├── users/                # User profiles, notifications, and leaderboards
│   ├── app.module.ts         # Main application module
│   └── main.ts               # Application entry point
├── nest-cli.json             # NestJS CLI configuration
├── package.json              # Project metadata, scripts, and dependencies
├── package-lock.json         # Dependency tree lockfile
├── tsconfig.json             # TypeScript compiler configuration
└── tsconfig.build.json       # TypeScript build configuration
```

## Functionalities of Each File & Important Functions

### 1. Root Files
- **`main.ts`**: The entry point of the NestJS application. It bootstraps the application and starts the server.
  - Important Functions: `bootstrap()`
- **`app.module.ts`**: The root module that imports all other modules (Admin, AI, Auth, FAQs, Questions, Users) and configures global settings (like Mongoose connections).
- **`package.json`**: Defines scripts for building, formatting, testing, and running the application, and lists all dependencies.

### 2. `src/admin` (Admin Module)
Handles administrative actions such as user management, analytics, and content moderation.
- **`admin.controller.ts`**: Exposes REST endpoints for admin operations.
  - `getAnalytics()`: Retrieves platform analytics.
  - `getUsers()`: Lists registered users.
  - `toggleBan()`: Bans or unbans a user.
  - `getPersonalQueries()`: Fetches queries marked as personal.
  - `reviewPersonal()`: Reviews and updates the status of personal queries.
  - `summarizeDiscussion()`: Generates a summary for a discussion thread.
  - `getGeneratedCandidates()`: Gets AI-generated FAQ candidates.
  - `approveFaq()`, `rejectFaq()`: Approves or rejects FAQ candidates.
- **`admin.service.ts`**: Contains the business logic for the admin endpoints.
- **`admin.module.ts`**: Packages the admin controller and service.
- **`moderation-log.schema.ts`**: Mongoose schema for logging moderation actions.

### 3. `src/ai` (AI Module)
Handles AI-driven operations like text embeddings, toxicity analysis, and query classification.
- **`ai.service.ts`**: Core logic for AI features.
  - `generateEmbeddings(text)`: Converts text into vector embeddings.
  - `analyzeToxicity()`: Checks content for toxic language.
  - `classifyQuery()`: Classifies a user query to determine its intent or category.
  - `generateFaqFromDiscussion()`: Automatically generates an FAQ from a discussion thread.
- **`vector-store.service.ts`**: Manages vector storage for similarity searches.
  - `addDocument(id, vector, metadata)`: Adds a vector embedding to the store.
  - `searchSimilar()`: Finds similar documents using vector search.
  - `removeDocument(id)`: Removes a document from the store.
  - `clear()`: Clears the vector store.
- **`ai.module.ts`**: Packages AI services.

### 4. `src/auth` (Authentication Module)
Handles user authentication (login/register) and JWT-based authorization.
- **`auth.controller.ts`**: Exposes authentication endpoints.
  - `register()`: Registers a new user.
  - `login()`: Authenticates a user and returns a token.
  - `getMe()`: Retrieves the current authenticated user's profile.
- **`auth.service.ts`**: Contains the authentication business logic.
  - `register(registerDto)`: Creates a new user in the database.
  - `login(loginDto)`: Validates credentials and generates a JWT.
- **`jwt.strategy.ts` & `jwt-auth.guard.ts`**: Configures Passport JWT strategy and route guarding.
- **`roles.guard.ts` & `roles.decorator.ts`**: Manages Role-Based Access Control (RBAC).

### 5. `src/faqs` (FAQs Module)
Manages the core FAQs, bookmarks, and user feedback.
- **`faqs.controller.ts`**: Endpoints for FAQ management.
  - `getApproved()`: Fetches all approved FAQs.
  - `search()`: Searches for FAQs.
  - `submitFeedback()`: Submits user feedback on an FAQ.
  - `toggleBookmark()`, `checkBookmark()`: Manages user bookmarks for FAQs.
  - `createFaq()`: Creates a new FAQ entry.
- **`faqs.service.ts`**: Business logic for FAQs.
  - `onApplicationBootstrap()`: Initialization tasks for FAQs.
  - `getAllApprovedFaqs()`
  - `searchSimilarFaqs(queryText)`: Uses vector search to find relevant FAQs.
  - `createFaq(faqDto)`
  - `submitFeedback(feedbackDto)`
  - `toggleBookmark(userId, faqId)`
  - `isBookmarked(userId, faqId)`
- **`faq.schema.ts`**: Mongoose schema for FAQs.
- **`feedback.schema.ts`**: Mongoose schema for FAQ feedback.

### 6. `src/questions` (Questions Module)
Handles user queries, answers, and the upvote/downvote system.
- **`questions.controller.ts`**: Endpoints for the QA system.
  - `getQuestions()`: Retrieves a list of user questions.
  - `getUserVotes()`: Gets the current user's voting history.
  - `getDetails()`: Retrieves details of a specific question.
  - `raiseQuery()`: Posts a new question.
  - `submitAnswer()`: Submits an answer to a question.
  - `voteQuestion()`, `voteAnswer()`: Upvotes or downvotes content.
  - `acceptAnswer()`: Marks an answer as accepted.
  - `toggleBookmark()`: Bookmarks a question.
- **`questions.service.ts`**: Business logic for questions and answers.
- **Schemas (`question.schema.ts`, `answer.schema.ts`, `vote.schema.ts`, `bookmark.schema.ts`)**: Database models for QA entities.

### 7. `src/users` (Users Module)
Manages user profiles, leaderboards, and notifications.
- **`users.controller.ts`**: Endpoints for user management.
  - `getLeaderboard()`: Retrieves the top contributors.
  - `getUserProfile()`: Fetches a user's profile information.
  - `getNotifications()`: Gets the current user's notifications.
  - `markAsRead()`: Marks a notification as read.
  - `getBookmarks()`: Retrieves the user's bookmarked items.
- **`users.service.ts`**: Business logic for user data and notifications.
- **Schemas (`user.schema.ts`, `notification.schema.ts`)**: Database models for users and notifications.

## How to Run the Folder (Backend)

The backend is built with [NestJS](https://nestjs.com/) and requires Node.js and a MongoDB instance to run.

### 1. Prerequisites
- **Node.js** (v16 or higher recommended)
- **MongoDB** (Local instance or MongoDB Atlas)

### 2. Setup Environment Variables
Create a `.env` file in the root of the `backend` folder and add your configuration (e.g., MongoDB URI, JWT Secret, AI API keys). Example:
```env
MONGODB_URI=mongodb://localhost:27017/faq-platform
JWT_SECRET=your_super_secret_key
```

### 3. Install Dependencies
Open a terminal in the `backend` folder and run:
```bash
npm install
```

### 4. Running the Application
You can run the application using the scripts defined in `package.json`:

- **Development Mode (with auto-reload):**
  ```bash
  npm run start:dev
  ```

- **Standard Start:**
  ```bash
  npm run start
  ```

- **Production Build:**
  ```bash
  npm run build
  npm run start:prod
  ```

### 5. Running Tests
- **Unit Tests:** `npm run test`
- **Watch Mode:** `npm run test:watch`
- **Coverage:** `npm run test:cov`

---
*Note: Ensure your MongoDB server is running before starting the application, otherwise the Mongoose connection will fail.*
