import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { Institution } from '../models/Institution.model';
import { User } from '../models/User.model';
import { hashPassword } from '../utils/bcrypt.util';

dotenv.config({ path: path.join(__dirname, '../../.env') });

const seed = async () => {
    try {
        const mongoUri = process.env.MONGODB_URI;
        if (!mongoUri) {
            throw new Error('MONGODB_URI not found in environment');
        }

        await mongoose.connect(mongoUri);
        console.log('Connected to MongoDB');

        // Create or find default institution
        let institution = await Institution.findOne({ subdomain: 'demo' });
        if (!institution) {
            const passwordHash = await hashPassword('password123');
            institution = await Institution.create({
                name: 'Demo University',
                email: 'admin@demo.edu',
                passwordHash,
                subdomain: 'demo',
                settings: {
                    colors: { primary: '#3B82F6', secondary: '#10B981', accent: '#F59E0B' },
                    fonts: { heading: 'Inter', body: 'Inter' }
                }
            });
            console.log('Created default institution');
        }

        // Create Admin User
        const adminEmail = 'admin@gmail.com';
        const existingAdmin = await User.findOne({ email: adminEmail });
        if (!existingAdmin) {
            const passwordHash = await hashPassword('password123');
            await User.create({
                institutionId: institution._id,
                name: 'Admin User',
                email: adminEmail,
                passwordHash,
                role: 'super-admin',
                isActive: true
            });
            console.log('Created admin user: admin@gmail.com');
        } else {
            console.log('Admin user already exists');
        }

        // Create Regular User
        const userEmail = 'user@gmail.com';
        const existingUser = await User.findOne({ email: userEmail });
        if (!existingUser) {
            const passwordHash = await hashPassword('password123');
            await User.create({
                institutionId: institution._id,
                name: 'Regular User',
                email: userEmail,
                passwordHash,
                role: 'viewer',
                isActive: true
            });
            console.log('Created regular user: user@gmail.com');
        } else {
            console.log('Regular user already exists');
        }

        console.log('Seed completed successfully');
        process.exit(0);
    } catch (error) {
        console.error('Seed failed:', error);
        process.exit(1);
    }
};

seed();
