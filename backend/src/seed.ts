import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { getModelToken } from '@nestjs/mongoose';
import { Faq } from './faqs/faq.schema';
import { Model } from 'mongoose';
import * as fs from 'fs';
import * as path from 'path';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const faqModel = app.get<Model<any>>(getModelToken(Faq.name));

  // Check if file exists in project root first, otherwise try to download or read from a local path
  const faqPath = path.join(__dirname, '..', 'vicharanashala_faq.json');
  
  if (!fs.existsSync(faqPath)) {
    console.log('vicharanashala_faq.json not found in root. Downloading FAQ database...');
    try {
      const response = await fetch('https://raw.githubusercontent.com/vicharanashala/cs45/main/vicharanashala_faq.json');
      const data = await response.json();
      fs.writeFileSync(faqPath, JSON.stringify(data, null, 2));
      console.log('Downloaded and saved to vicharanashala_faq.json');
    } catch (err) {
      console.error('Failed to download FAQ database:', err);
      await app.close();
      process.exit(1);
    }
  }

  const rawData = fs.readFileSync(faqPath, 'utf8');
  const parsed = JSON.parse(rawData);
  const entries = parsed.entries ?? [];

  console.log(`Found ${entries.length} entries in FAQ database. Seeding MongoDB...`);

  let seededCount = 0;
  for (const entry of entries) {
    const existing = await faqModel.findOne({ question: entry.question });
    if (!existing) {
      await faqModel.create({
        question: entry.question,
        answer: entry.answer,
        category: entry.intent_category ?? 'general',
        tags: entry.keywords ?? [],
        status: 'published',
        embeddingReady: false,
        embedding: [],
      });
      seededCount++;
    }
  }

  console.log(`Successfully seeded ${seededCount} new FAQs into MongoDB!`);
  await app.close();
}

bootstrap()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Error seeding database:', err);
    process.exit(1);
  });
