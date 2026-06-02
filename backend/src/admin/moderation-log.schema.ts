import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type ModerationLogDocument = ModerationLog & Document;

@Schema({ timestamps: true })
export class ModerationLog {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  moderatorId: string;

  @Prop({
    required: true,
    enum: [
      'ban_user',
      'unban_user',
      'delete_question',
      'approve_faq',
      'reject_faq',
      'moderate_answer',
    ],
  })
  action: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, required: true })
  targetId: string;

  @Prop({ required: true })
  reason: string;
}

export const ModerationLogSchema = SchemaFactory.createForClass(ModerationLog);
