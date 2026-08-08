import { io } from "socket.io-client";

const socket = io("http://localhost:8000");

socket.on("connect", () => {
    console.log("Connected with id:", socket.id);
    
    // Join a room
    socket.emit("join-call", "/testroom");
    
    // Listen for messages
    socket.on("chat-message", (data, sender, socketIdSender) => {
        console.log(`[CHAT] ${sender} (${socketIdSender}): ${data}`);
    });

    socket.on("user-joined", (id, clients) => {
        console.log(`[JOIN] ${id} joined. Clients in room:`, clients);
    });

    socket.on("user-left", (id) => {
        console.log(`[LEFT] ${id}`);
    });

    // Send a message after 1 second
    setTimeout(() => {
        console.log("Sending chat message...");
        socket.emit("chat-message", "Hello world!", "TestUser");
    }, 1000);

    // Disconnect after 3 seconds
    setTimeout(() => {
        socket.disconnect();
        process.exit(0);
    }, 3000);
});
