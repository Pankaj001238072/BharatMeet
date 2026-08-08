import dotenv from 'dotenv';
dotenv.config();
import dns from "node:dns";
dns.setServers(["8.8.8.8", "8.8.4.4"]);
import mongoose from 'mongoose';
import { User } from './src/models/user.model.js';
import { Meeting } from './src/models/meeting.model.js';

const start = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  const users = await User.find({});
  console.log("Users:", users.map(u => u.username));
  
  // Find naman if exists
  const naman = users.find(u => u.username.toLowerCase() === 'naman');
  if (naman) {
    console.log("Found user:", naman.username);
    const del = await Meeting.deleteMany({ user_id: naman.username });
    console.log("Deleted:", del);
  } else {
    console.log("User naman not found");
  }
  process.exit(0);
};
start();
