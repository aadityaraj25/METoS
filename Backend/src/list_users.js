import connectDB from './config/db.js';
import { User } from './models/user.models.js';
import dotenv from 'dotenv';
dotenv.config();

connectDB().then(async () => {
  const users = await User.find({}).limit(5);
  console.log("Users found:");
  users.forEach(u => console.log(`- ${u.email}`));
  process.exit(0);
});
