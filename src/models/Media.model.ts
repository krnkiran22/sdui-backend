import mongoose, { Document, Schema } from 'mongoose';

export type MediaType = 'image' | 'video' | 'document';

export interface IMedia extends Document {
  institutionId: mongoose.Types.ObjectId;
  filename: string;
  cloudinaryUrl: string;
  cloudinaryPublicId: string;
  type: MediaType;
  size: number;
  uploadedAt: Date;
  uploadedBy: mongoose.Types.ObjectId;
}

const MediaSchema = new Schema<IMedia>(
  {
    institutionId: {
      type: Schema.Types.ObjectId,
      ref: 'Institution',
      required: true,
      index: true,
    },
    filename: {
      type: String,
      required: true,
    },
    cloudinaryUrl: {
      type: String,
      required: true,
    },
    cloudinaryPublicId: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ['image', 'video', 'document'],
      required: true,
    },
    size: {
      type: Number,
      required: true,
    },
    uploadedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: { createdAt: 'uploadedAt', updatedAt: false },
  }
);

// Indexes
MediaSchema.index({ institutionId: 1, uploadedAt: -1 });

export const Media = mongoose.model<IMedia>('Media', MediaSchema);
