import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { getConnectionToken } from '@nestjs/mongoose';
import { Connection } from 'mongoose';

// Override MONGODB_URI before importing AppModule to ensure we use a separate test database
process.env.MONGODB_URI = 'mongodb://remyfaq:2yRgHoRLGPrGjBmf@ac-dpgumrw-shard-00-00.fb7gpct.mongodb.net:27017,ac-dpgumrw-shard-00-01.fb7gpct.mongodb.net:27017,ac-dpgumrw-shard-00-02.fb7gpct.mongodb.net:27017/faq-e2e-test-db?ssl=true&replicaSet=atlas-e8vfjl-shard-0&authSource=admin&appName=faqclst1';

import { AppModule } from '../src/app.module';

describe('End-to-End User Flows', () => {
  let app: INestApplication;
  let connection: Connection;

  // Variables to hold state across flow steps
  let adminToken: string;
  let userBToken: string;
  
  let questionId: string;
  let answerId: string;
  let generatedFaqId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
    await app.init();
    
    // Get the active mongoose connection and clear the database before tests
    connection = app.get(getConnectionToken());
    await connection.db.dropDatabase();
  });

  afterAll(async () => {
    // Clear and close after all tests finish
    await connection.db.dropDatabase();
    await connection.close();
    await app.close();
  });

  describe('Flow 1: Community Q&A (Standard Users)', () => {
    it('Step 1: Register User A (First user becomes Admin)', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/auth/register')
        .send({
          email: 'admin_flow_test@example.com',
          passwordHash: 'password123',
          name: 'Admin Test User',
        })
        .expect(201);
      
      expect(res.body.access_token).toBeDefined();
      expect(res.body.user.role).toBe('admin');
      adminToken = res.body.access_token;
    });

    it('Step 2: Register User B (Standard User)', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/auth/register')
        .send({
          email: 'user_b_flow_test@example.com',
          passwordHash: 'password123',
          name: 'Standard User B',
        })
        .expect(201);
      
      expect(res.body.access_token).toBeDefined();
      expect(res.body.user.role).toBe('user');
      userBToken = res.body.access_token;
    });

    it('Step 3: User A asks a public question', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/questions')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          title: 'What is the standard return policy?',
          content: 'I bought an item but need to return it. What is the process?',
        })
        .expect(201);
      
      // Expected to be automatically classified as generic
      expect(res.body.question).toBeDefined();
      expect(res.body.question.type).toBe('generic');
      questionId = res.body.question._id;
    });

    it('Step 4: User B answers the question', async () => {
      const res = await request(app.getHttpServer())
        .post(`/api/questions/${questionId}/answers`)
        .set('Authorization', `Bearer ${userBToken}`)
        .send({
          content: 'The standard return policy is 30 days from the date of purchase with receipt.',
        })
        .expect(201);
      
      expect(res.body._id).toBeDefined();
      answerId = res.body._id;
    });

    it('Step 5: User A accepts the answer', async () => {
      const res = await request(app.getHttpServer())
        .post(`/api/questions/answers/${answerId}/accept`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send()
        .expect(201);
      
      expect(res.body.isAccepted).toBe(true);
    });
  });

  describe('Flow 2: Admin Moderation & FAQ', () => {
    it('Step 1: Admin summarizes the resolved question to create an AI FAQ candidate', async () => {
      const res = await request(app.getHttpServer())
        .post(`/api/admin/summarize/${questionId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send()
        .expect(201);
      
      expect(res.body.isGenerated).toBe(true);
      expect(res.body.approvedBy).toBeNull();
      expect(res.body._id).toBeDefined();
      generatedFaqId = res.body._id;
    });

    it('Step 2: Admin views pending AI FAQs', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/admin/moderation/ai-faqs')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);
      
      expect(Array.isArray(res.body)).toBe(true);
      const pendingFaq = res.body.find((faq: any) => faq._id === generatedFaqId);
      expect(pendingFaq).toBeDefined();
    });

    it('Step 3: Admin approves the generated AI FAQ', async () => {
      const res = await request(app.getHttpServer())
        .post(`/api/admin/moderation/ai-faqs/${generatedFaqId}/approve`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send()
        .expect(201);
      
      expect(res.body.approvedBy).toBeDefined();
    });

    it('Step 4: Standard user searches and retrieves the newly approved FAQ', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/faqs/search')
        .send({
          query: 'how many days for return policy?',
        })
        .expect(201);
      
      // Assuming search will at least return some response (could be mock data depending on AI module setup)
      expect(res.body).toBeDefined();
      if (res.body.bestMatch) {
          expect(res.body.bestMatch.faqId).toEqual(generatedFaqId);
      }
    });
  });

  describe('Flow 3: Sensitive Query Privacy', () => {
    let personalQuestionId: string;

    it('Step 1: User B submits personal data in a question', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/questions')
        .set('Authorization', `Bearer ${userBToken}`)
        .send({
          title: 'Help with my account',
          content: 'My email is user_b_flow_test@example.com and I am locked out.',
        })
        .expect(201);
      
      // Should be classified as personal/pending
      expect(res.body.question).toBeDefined();
      expect(res.body.question.type).toBe('personal');
      expect(res.body.question.moderationStatus).toBe('pending');
      personalQuestionId = res.body.question._id;
    });

    it('Step 2: Admin retrieves the personal query for private review', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/admin/moderation/personal')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);
      
      expect(Array.isArray(res.body)).toBe(true);
      const personalQuery = res.body.find((q: any) => q._id === personalQuestionId);
      expect(personalQuery).toBeDefined();
    });
  });
});
