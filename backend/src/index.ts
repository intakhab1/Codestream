import express from "express";
import cors from "cors";
import { createServer } from "http";
import { Server } from "socket.io";
import dotenv from "dotenv";
import { connectMongo } from "./mongo";
import roomRoutes from "./routes/rooms";
import messageRoutes from "./routes/messages";
import { setupSocketHandlers } from "./socket";
import executeRoutes from "./routes/execute";

dotenv.config();

const app = express();
const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// ✅ CORS and body parser FIRST
app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:3000",
  credentials: true,
}));
app.use(express.json());

// ✅ Routes AFTER
app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/rooms", roomRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/execute", executeRoutes);

setupSocketHandlers(io);

const PORT = parseInt(process.env.PORT || "4000");

// Connect MongoDB first, then start server
connectMongo()
  .then(() => {
    httpServer.listen(PORT, () => {
      console.log(`🚀 Codestream server running on port ${PORT}`);
    });

    // Keep-alive ping for Render free tier (prevents sleep after 15min inactivity)
    if (process.env.NODE_ENV === "production") {
      setInterval(() => {
        fetch(`http://localhost:${PORT}/health`).catch(() => {});
      }, 14 * 60 * 1000);
    }
  })
  .catch((err) => {
    console.error("❌ Failed to connect to MongoDB:", err);
    process.exit(1);
  });



// import express from "express";
// import cors from "cors";
// import { createServer } from "http";
// import { Server } from "socket.io";
// import dotenv from "dotenv";
// import roomRoutes from "./routes/rooms";
// import messageRoutes from "./routes/messages";
// import { setupSocketHandlers } from "./socket";
// import executeRoutes from "./routes/execute";

// dotenv.config();

// const app = express();
// const httpServer = createServer(app);

// const io = new Server(httpServer, {
//   cors: {
//     origin: process.env.CLIENT_URL || "http://localhost:3000",
//     methods: ["GET", "POST"],
//     credentials: true,
//   },
// });

// // ✅ CORS and body parser FIRST
// app.use(cors({
//   origin: process.env.CLIENT_URL || "http://localhost:3000",
//   credentials: true,
// }));
// app.use(express.json());

// // ✅ Routes AFTER
// app.get("/health", (_req, res) => {
//   res.json({ status: "ok" });
// });

// app.use("/api/rooms", roomRoutes);
// app.use("/api/messages", messageRoutes);
// app.use("/api/execute", executeRoutes);  // ✅ now gets CORS headers

// setupSocketHandlers(io);

// const PORT = parseInt(process.env.PORT || "4000");
// httpServer.listen(PORT, () => {
//   console.log(`🚀 Codestream server running on port ${PORT}`);
// });