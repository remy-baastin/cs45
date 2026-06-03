import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { Connection } from 'mongoose';
import { getConnectionToken } from '@nestjs/mongoose';

describe('Advanced Features (E2E)', () => {
  let app: INestApplication;
  let connection: Connection;
  let adminToken: string;
  let userId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
    connection = await moduleFixture.get(getConnectionToken());
    
    // Clear collections for clean test
    await connection.collection('users').deleteMany({});
    await connection.collection('faqs').deleteMany({});
    await connection.collection('questions').deleteMany({});

    // 1. Register Admin
    const regRes = await request(app.getHttpServer())
      .post('/api/auth/register')
      .send({
        email: 'admin-features@example.com',
        passwordHash: 'Password123!',
        name: 'Admin Tester',
      });
    adminToken = regRes.body.access_token;
    userId = regRes.body.user.id;
  });

  afterAll(async () => {
    await connection.close();
    await app.close();
  });

  describe('FAQ Seeding', () => {
    it('should seed FAQs from JSON file', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/admin/seed-faqs')
        .set('Authorization', `Bearer ${adminToken}`);
      
      expect(res.status).toBe(201);
      expect(res.body.seededCount).toBeGreaterThan(0);
      
      const faqsCount = await connection.collection('faqs').countDocuments();
      expect(faqsCount).toBeGreaterThan(0);
    });
  });

  describe('Smart Search Routing', () => {
    it('should route to FAQ for high similarity match', async () => {
      // "What is VINS?" is in the seeded FAQs
      const res = await request(app.getHttpServer())
        .post('/api/faqs/smart-search')
        .send({ query: 'What is VINS?' });
      
      expect(res.status).toBe(201);
      expect(res.body.routing).toBe('faq');
      expect(res.body.data.question).toContain('VINS');
    });

    it('should route to RAG for community question match', async () => {
      // Post a community question first
      await request(app.getHttpServer())
        .post('/api/questions')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ 
          title: 'How to use Rosetta Journal?', 
          content: 'I want to know the rules for Rosetta.' 
        });

      // Answer it to make it a RAG candidate (requires answers)
      const q = await connection.collection('questions').findOne({ title: 'How to use Rosetta Journal?' });
      await request(app.getHttpServer())
        .post(`/api/questions/${q._id}/answers`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ content: 'You should write in it daily.' });

      const res = await request(app.getHttpServer())
        .post('/api/faqs/smart-search')
        .send({ query: 'How to use my Rosetta Journal?' });
      
      expect(res.status).toBe(201);
      expect(res.body.routing).toBe('rag');
      expect(res.body.data.originalQuestion).toBe('How to use Rosetta Journal?');
    });

    it('should route to LLM for unknown complex query', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/faqs/smart-search')
        .send({ query: 'What is the philosophy of education design at IIT Ropar?' });
      
      expect(res.status).toBe(201);
      expect(res.body.routing).toBe('llm');
      expect(res.body.data.synthesizedAnswer).toBeDefined();
    });
  });

  describe('Question Clustering', () => {
    it('should group similar questions into clusters', async () => {
      // Add similar questions
      await request(app.getHttpServer())
        .post('/api/questions')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ title: 'NOC signature issue', content: 'My dean is not signing the NOC.' });
      
      await request(app.getHttpServer())
        .post('/api/questions')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ title: 'NOC signature problem', content: 'What if the dean does not sign?' });

      const res = await request(app.getHttpServer())
        .get('/api/questions/clusters')
        .query({ threshold: 0.5 });
      
      expect(res.status).toBe(200);
      expect(res.body.length).toBeGreaterThan(0);
      
      // Find the cluster containing NOC questions
      const nocCluster = res.body.find(c => c.headline.includes('NOC'));
      expect(nocCluster).toBeDefined();
      expect(nocCluster.questions.length).toBeGreaterThanOrEqual(2);
    });
  });
});
