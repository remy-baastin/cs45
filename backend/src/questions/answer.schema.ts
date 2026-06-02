import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type AnswerDocument = Answer & Document;

@Schema({ timestamps: true })
export class Answer {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Question', required: true, index: true })
  questionId: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  author: string;

  @Prop({ required: true })
  content: string;

  @Prop({ default: 0 })
  upvotes: number;

  @Prop({ default: false })
  isAccepted: boolean;

  @Prop({ default: false })
  isModerated: boolean;
}

export const AnswerSchema = SchemaFactory.createForClass(Answer);
