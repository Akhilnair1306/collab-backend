import dotenv from "dotenv";
dotenv.config();

import app from "./app.js";
import http from "http";
import { Server } from "socket.io";
import { initSockets } from "./sockets/index.js";


const PORT = process.env.PORT || 5000;

const server = http.createServer(app);

const io = new Server(server, {
  cors: { origin: "*" },
});

// ✅ initialize sockets AFTER io exists
initSockets(io);

server.listen(PORT, () => {
  console.log(`Server running on PORT ${PORT}`);
});
