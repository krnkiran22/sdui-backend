import mongoose, { Document, Schema } from 'mongoose';
import { PageJSON } from '../types/page.types';

export interface ITemplate extends Document {
  name: string;
  description: string;
  category: string;
  thumbnail: string;
  jsonConfig: PageJSON;
  isPublic: boolean;
  createdBy?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const TemplateSchema = new Schema<ITemplate>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: '',
    },
    category: {
      type: String,
      required: true,
      enum: ['homepage', 'about', 'courses', 'departments', 'contact', 'blog', 'events', 'custom'],
    },
    thumbnail: {
      type: String,
      default: '',
    },
    jsonConfig: {
      type: Schema.Types.Mixed,
      required: true,
    },
    isPublic: {
      type: Boolean,
      default: true,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
TemplateSchema.index({ category: 1 });
TemplateSchema.index({ isPublic: 1 });

export const Template = mongoose.model<ITemplate>('Template', TemplateSchema);
