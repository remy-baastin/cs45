import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type VoteDocument = Vote & Document;

@Schema({ timestamps: true })
export class Vote {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  userId: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, required: true })
  targetId: string;

  @Prop({ required: true, enum: ['question', 'answer'] })
  targetType: 'question' | 'answer';

  @Prop({ required: true, enum: [1, -1] })
  value: number; // 1 for upvote, -1 for downvote
}

export const VoteSchema = SchemaFactory.createForClass(Vote);
VoteSchema.index({ userId: 1, targetId: 1 }, { unique: true });
