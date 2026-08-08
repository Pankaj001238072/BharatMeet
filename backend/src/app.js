// DNS fix: Force Google DNS so MongoDB SRV records resolve correctly
import dns from "node:dns";
dns.setServers(["8.8.8.8", "8.8.4.4"]);

import dotenv from "dotenv";
dotenv.config();

import express from "express";
import { createServer } from "node:http"; //socket aur express dono ka instance alag h jise connect krta h createserver

import { Server } from "socket.io";

import mongoose from "mongoose";
import { connectToSocket } from "./controllers/socketManager.js"; //socket aur express dono ka instance alag h jise connect krta h createserver

import cors from "cors";   //it is use to allow cross-origin requests from different domains or ports.
import userRoutes from "./routes/users.routes.js"; //import the userRoutes module from the specified file path. This module contains the route definitions for handling user-related requests.

const app = express();
const server = createServer(app); //socket aur express dono ka instance alag h jise connect krta h createserver
// const io = new Server(server);           //pehle dono ko connect krke app create hua fir ek naya server create kiya us app pe fir usko server se connect kiya socket.io se
const io = connectToSocket(server); //socket aur express dono ka instance alag h jise connect krta h createserver

app.set("port", process.env.PORT || 8000);

app.use(cors());    //it is use to allow cross-origin requests from different domains or ports.
app.use(express.json({limit: "40kb"})); //it is use limit so that the server can handle large JSON payloads without running into memory issues or performance degradation or handle missuse.
app.use(express.urlencoded({ extended: true, limit: "40kb" })); //it is use limit so that the server can handle large JSON payloads without running into memory issues or performance degradation or handle missuse.


app.use("/api/v1/users", userRoutes); //API versioning use karte hain taaki naye updates ke baad bhi purani API chalti rahe (backward compatibility) agr kal ko username,password k alava email add karna h toh vo v2 mein add hoga json k through.
/* 
app.use("/api/v2/users", userRoutes); //API versioning use karte hain taaki naye updates ke baad bhi purani API chalti rahe (backward compatibility).
 */


/* app.get("/home", (req, res) => {
  return res.json({ Hello: "backend" });
}); */

const start = async () => {
  app.set("mongo_user");
  const connectionDb = await mongoose.connect(process.env.MONGO_URI);

  console.log(
    `Mongo Connected DB Host: ${connectionDb.connection.host}`,
  );
  server.listen(app.get("port"), () => {
    console.log("Listing on port 8000");
  });
};

start();

/* short diagram of how socket.io is connected to express app 
 Express App
     │
     ▼
createServer(app)
     │
     ▼
HTTP Server
     │
     ▼
new Server(server)
     │
     ▼
Socket.io */
