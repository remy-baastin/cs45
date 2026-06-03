# Changelog

## Step 1
**Filename:** `src/admin/admin.module.ts`

**Why was change made:** The `AdminService` was failing to inject its dependencies because the names provided in the `MongooseModule.forFeature()` array within `AdminModule` contained typos and mismatched the exact model names requested by the service (e.g., `'NotificationAnswer'` instead of `'Answer'`).

**Code Before:**
```typescript
      { name: 'Question', schema: QuestionSchema },
      { name: 'ck', schema: FeedbackSchema },
      { name: 'NotificationAnswer', schema: AnswerSchema },
      { name: 'Feedba', schema: NotificationSchema },
      { name: 'ModerationLog', schema: ModerationLogSchema },
```

**Code After:**
```typescript
      { name: 'Question', schema: QuestionSchema },
      { name: 'Feedback', schema: FeedbackSchema },
      { name: 'Answer', schema: AnswerSchema },
      { name: 'Notification', schema: NotificationSchema },
      { name: 'ModerationLog', schema: ModerationLogSchema },
```

## Step 2
**Filename:** `src/app.module.ts`

**Why was change made:** The application was failing to connect to the MongoDB Atlas cluster because the `.env` variables were not being loaded. NestJS requires the `@nestjs/config` package and `ConfigModule.forRoot()` to parse and load the `.env` file into `process.env`. Without this, it fell back to the default local MongoDB URI (`127.0.0.1:27017`), which was refused.

**Code Before:**
```typescript
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

...

@Module({
  imports: [
    // Configure Mongoose to connect to our dynamic/local MongoDB URI
    MongooseModule.forRoot(
```

**Code After:**
```typescript
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';

...

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    // Configure Mongoose to connect to our dynamic/local MongoDB URI
    MongooseModule.forRoot(
```
## Step 3 *(User change)*
**Filename:** `.env`

**Why was change made:** The SRV connection string was switched off and a new MongoDB Atlas connection string was configured.

---

## Step 4
**Files changed:** `src/main.ts`, `src/auth/auth.controller.ts`, `src/users/users.controller.ts`, `src/faqs/faqs.controller.ts`, `src/questions/questions.controller.ts`, `src/admin/admin.controller.ts`

**Why was change made:** To provide a full interactive Swagger UI at `http://localhost:5000/api/docs`, allowing all API endpoints to be tested directly from the browser, including JWT-authenticated and admin-only routes.

**`src/main.ts` — Code Before:**
```typescript
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
// ... no Swagger setup
```

**`src/main.ts` — Code After:**
```typescript
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

// Inside bootstrap():
const swaggerConfig = new DocumentBuilder()
  .setTitle('FAQ Platform API')
  .setVersion('1.0.0')
  .addBearerAuth({ ... }, 'JWT-auth')
  .addTag('Auth') .addTag('Users') .addTag('FAQs') .addTag('Questions') .addTag('Admin')
  .build();
const document = SwaggerModule.createDocument(app, swaggerConfig);
SwaggerModule.setup('api/docs', app, document, { ... });
```

**All 5 controllers — Code Before (example from auth.controller.ts):**
```typescript
@Controller('api/auth')
export class AuthController {
  @Post('register')
  async register(...) { ... }
```

**All 5 controllers — Code After (example from auth.controller.ts):**
```typescript
@ApiTags('Auth')
@Controller('api/auth')
export class AuthController {
  @Post('register')
  @ApiOperation({ summary: 'Register a new user account' })
  @ApiBody({ schema: { example: { email: '...', passwordHash: '...', name: '...' } } })
  @ApiResponse({ status: 201, description: 'User registered successfully.' })
  async register(...) { ... }
```

---

## Step 5
**Filename:** `src/questions/questions.service.ts`

**Why was change made:** API testing revealed that `POST /api/questions/answers/:id/accept` always returned 403 Forbidden even when the correct question author called it. The bug was a type mismatch — `question.author` is a Mongoose `ObjectId` object, and `userId` from the JWT is also an `ObjectId`. Comparing an ObjectId `.toString()` result against a raw ObjectId with strict `!==` always returned `true` (not equal), so the guard always fired incorrectly.

**Code Before:**
```typescript
if (question.author.toString() !== userId) {
```

**Code After:**
```typescript
if (question.author.toString() !== userId.toString()) {
```

---

## Step 6
**Filename:** `src/admin/admin.service.ts`

**Why was change made:** API testing revealed that the self-ban protection guard in `toggleUserBan` never triggered. `adminId` comes from `req.user._id` (a Mongoose `ObjectId` object), while `userId` comes from the URL route param (a plain `string`). A strict `===` between an ObjectId object and a string always returns `false` in JavaScript regardless of value, so the guard was silently bypassed — allowing an admin to ban themselves.

**Code Before:**
```typescript
if (adminId === userId) {
```

**Code After:**
```typescript
if (adminId.toString() === userId.toString()) {
```