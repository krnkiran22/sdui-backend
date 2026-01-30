import mongoose, { Document, Schema } from 'mongoose';

export interface IInstitution extends Document {
  name: string;
  email: string;
  passwordHash: string;
  domain?: string;
  subdomain: string;
  settings: {
    logo?: string;
    colors: {
      primary: string;
      secondary: string;
      accent: string;
    };
    fonts: {
      heading: string;
      body: string;
    };
  };
  createdAt: Date;
  updatedAt: Date;
}

const InstitutionSchema = new Schema<IInstitution>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    passwordHash: {
      type: String,
      required: true,
    },
    domain: {
      type: String,
      trim: true,
    },
    subdomain: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    settings: {
      logo: String,
      colors: {
        primary: {
          type: String,
          default: '#3B82F6',
        },
        secondary: {
          type: String,
          default: '#10B981',
        },
        accent: {
          type: String,
          default: '#F59E0B',
        },
      },
      fonts: {
        heading: {
          type: String,
          default: 'Inter',
        },
        body: {
          type: String,
          default: 'Inter',
        },
      },
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
InstitutionSchema.index({ email: 1 });
InstitutionSchema.index({ subdomain: 1 });

export const Institution = mongoose.model<IInstitution>('Institution', InstitutionSchema);
