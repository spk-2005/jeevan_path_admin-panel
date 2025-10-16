import mongoose, { Schema, Model } from 'mongoose';

export interface IUser {
  _id?: string;
  firebaseUid: string;
  name?: string;
  phone?: string;
  language?: string;
  createdAt: Date;
}

const UserSchema = new Schema<IUser>({
  firebaseUid: {
    type: String,
    required: true,
    unique: true,
  },
  name: String,
  phone: String,
  language: {
    type: String,
    default: 'en',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const User = mongoose.models.User ? (mongoose.models.User as any) : mongoose.model<IUser>('User', UserSchema);

export default User;
