import mongoose, { Schema, Model } from 'mongoose';

export interface IResource {
  _id?: string;
  name: string;
  type: 'clinic' | 'pharmacy' | 'blood';
  address?: string;
  contact?: string;
  location: {
    type: 'Point';
    coordinates: [number, number];
  };
  openTime?: string;
  closeTime?: string;
  rating?: number;
  services?: string[];
  languages?: string[];
  insuranceAccepted?: string[];
  transportation?: string[];
  wheelchairAccessible?: boolean;
}

const ResourceSchema = new Schema<IResource>({
  name: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    required: true,
    enum: ['clinic', 'pharmacy', 'blood'],
  },
  address: String,
  contact: String,
  location: {
    type: {
      type: String,
      enum: ['Point'],
      required: true,
    },
    coordinates: {
      type: [Number],
      required: true,
    },
  },
  openTime: String,
  closeTime: String,
  rating: {
    type: Number,
    default: 0,
  },
  services: [String],
  languages: [String],
  insuranceAccepted: [String],
  transportation: [String],
  wheelchairAccessible: {
    type: Boolean,
    default: false,
  },
});

ResourceSchema.index({ location: '2dsphere' });

const Resource = mongoose.models.Resource ? (mongoose.models.Resource as any) : mongoose.model<IResource>('Resource', ResourceSchema);

export default Resource;
