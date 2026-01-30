import mongoose, { Document, Schema } from 'mongoose';
import { PageJSON } from '../types/page.types';

export interface IVersion extends Document {
  pageId: mongoose.Types.ObjectId;
  versionNumber: number;
  jsonConfig: PageJSON;
  changes: string;
  createdAt: Date;
  createdBy: mongoose.Types.ObjectId;
}

const VersionSchema = new Schema<IVersion>(
  {
    pageId: {
      type: Schema.Types.ObjectId,
      ref: 'Page',
      required: true,
      index: true,
    },
    versionNumber: {
      type: Number,
      required: true,
    },
    jsonConfig: {
      type: Schema.Types.Mixed,
      required: true,
    },
    changes: {
      type: String,
      default: '',
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

// Compound index for unique version numbers per page
VersionSchema.index({ pageId: 1, versionNumber: 1 }, { unique: true });

export const Version = mongoose.model<IVersion>('Version', VersionSchema);
