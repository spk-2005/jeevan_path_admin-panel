import mongoose, { Schema, Model, Types } from 'mongoose';

export interface IFeedback {
  _id?: string;
  userId: Types.ObjectId;
  resourceId: Types.ObjectId;
  rating: number;
  comment?: string;
  createdAt: Date;
}

const FeedbackSchema = new Schema<IFeedback>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  resourceId: {
    type: Schema.Types.ObjectId,
    ref: 'Resource',
    required: true,
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5,
  },
  comment: String,
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Feedback = mongoose.models.Feedback ? (mongoose.models.Feedback as any) : mongoose.model<IFeedback>('Feedback', FeedbackSchema);

export default Feedback;
