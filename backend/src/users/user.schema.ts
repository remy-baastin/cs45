import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserDocument = User & Document;

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true, unique: true, index: true })
  email: string;

  @Prop({ required: true })
  passwordHash: string;

  @Prop({ required: true })
  name: string;

  @Prop({ default: 'user' })
  role: 'user' | 'moderator' | 'admin';

  @Prop({ default: 0 })
  reputationPoints: number;

  @Prop({ default: false })
  isBanned: boolean;

  @Prop({ default: '' })
  bio: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
