import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type FaqDocument = Faq & Document;

@Schema({ timestamps: true })
export class Faq {
  @Prop({ required: true, index: true })
  question: string;

  @Prop({ required: true })
  answer: string;

  @Prop({ type: [Number], required: true })
  embedding: number[];

  @Prop({ default: false })
  isGenerated: boolean;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', default: null })
  approvedBy: string;

  @Prop({ default: 0 })
  viewCount: number;

  @Prop({ default: 0 })
  useCount: number; // Incremented when marked helpful from search confidence >= 80%
}

export const FaqSchema = SchemaFactory.createForClass(Faq);
FaqSchema.index({ question: 'text' });
