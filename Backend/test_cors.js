import express from 'express';
import http from 'http';
import { Server } from 'socket.io';

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: (origin, callback) => {
        const allowedOrigins = ["*"];
        if (!origin || allowedOrigins.includes(origin) || allowedOrigins.includes("*")) {
            callback(null, true);
        } else {
            callback(new Error("CORS blocked"));
        }
    },
    credentials: true
  }
});

server.listen(8001, async () => {
  try {
    const res = await fetch('http://localhost:8001/socket.io/?EIO=4&transport=polling', {
      headers: { 'Origin': 'http://localhost:4000' }
    });
    console.log("Headers:", res.headers.get('access-control-allow-origin'));
  } catch (err) {
    console.error(err);
  }
  process.exit(0);
});
