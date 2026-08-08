import dotenv from 'dotenv';
dotenv.config();
import mongoose from 'mongoose';
import { User } from './src/models/user.model.js';
import dns from "node:dns";
dns.setServers(["8.8.8.8", "8.8.4.4"]);

const start = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  const users = await User.find({});
  console.log("Users in DB:", users);
  process.exit(0);
};
start();
