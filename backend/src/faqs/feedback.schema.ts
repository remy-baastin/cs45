import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type FeedbackDocument = Feedback & Document;

@Schema({ timestamps: true })
export class Feedback {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: false, default: null })
  userId: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Faq', required: true, index: true })
  faqId: string;

  @Prop({ required: true })
  queryText: string;

  @Prop({ required: true })
  isHelpful: boolean;

  @Prop({ default: '' })
  comments: string;

  @Prop({ required: true, default: 0 })
  confidenceScore: number;
}

export const FeedbackSchema = SchemaFactory.createForClass(Feedback);
