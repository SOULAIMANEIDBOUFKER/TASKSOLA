import "dotenv/config";
import express from "express";
import connectDB from "./db/connectDatabase.js";
import userRoutes from "./routes/userRoutes.js";
import cookieParser from "cookie-parser";
import cors from "cors";
import taskRoutes from "./routes/taskRoutes.js";

const app = express();

const PORT = process.env.PORT || 3000;
const secret = process.env.COOKIE_SECRET || "dev_secret";
const frontendBaseURL = process.env.FRONTEND_BASE_URL || "";

// مهم في Render/Reverse Proxy (cookies + https)
app.set("trust proxy", 1);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser(secret));

/**
 * CORS: يدعم عدة Origins
 * FRONTEND_BASE_URL يمكن تكون:
 * - رابط واحد: https://abc.vercel.app
 * - أو عدة روابط مفصولين بفاصلة:
 *   https://abc.vercel.app,http://localhost:5173
 */
const allowedOrigins = frontendBaseURL
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // يسمح للـ Postman/Server-to-server requests اللي ما عندهمش origin
      if (!origin) return callback(null, true);

      // يسمح للـ localhost دائماً (للتطوير)
      const isLocalhost =
        origin.startsWith("http://localhost:") ||
        origin.startsWith("http://127.0.0.1:");

      if (isLocalhost) return callback(null, true);

      // يسمح للروابط اللي ف env
      if (allowedOrigins.includes(origin)) return callback(null, true);

      return callback(new Error(`CORS blocked for origin: ${origin}`));
    },
    credentials: true,
  })
);

// Routes
app.use("/api/v1/user", userRoutes);
app.use("/api/v1/tasks", taskRoutes);

// Health check (مفيد للـ hosting)
app.get("/health", (req, res) => {
  res.json({ ok: true, status: "healthy" });
});

app.get("/", (req, res) => {
  res.json({ message: "Backend is running ✅" });
});

// شغل السيرفر فقط بعد نجاح DB
const startServer = async () => {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`Server started on PORT: ${PORT}`);
      console.log("Allowed origins:", allowedOrigins);
    });
  } catch (err) {
    console.error("Failed to start server:", err.message);
    process.exit(1);
  }
};

startServer();
