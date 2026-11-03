import dotenv from 'dotenv';
import mongoose from 'mongoose';
import User from '../models/User.js';

dotenv.config();

const email = process.argv[2];

if (!email) {
  console.error('Usage: node scripts/makeAdmin.js <user-email>');
  process.exit(1);
}

const makeAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    const targetEmail = email.trim().toLowerCase();
    const user = await User.findOne({ email: targetEmail });

    if (!user) {
      console.error(`User with email "${targetEmail}" not found.`);
      await mongoose.disconnect();
      process.exit(1);
    }

    if (user.role === 'admin') {
      console.log(`User "${targetEmail}" is already an admin.`);
      await mongoose.disconnect();
      process.exit(0);
    }

    user.role = 'admin';
    await user.save();

    console.log(`Success: User "${targetEmail}" has been promoted to admin.`);
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error(`Error updating user role: ${error.message}`);
    await mongoose.disconnect();
    process.exit(1);
  }
};

makeAdmin();
