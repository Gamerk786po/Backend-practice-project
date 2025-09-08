import express from "express";
import cors from "cors";

const app = express();

app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  })
);

app.use(express.json({ limit: "16kb" }));

app.use(express.urlencoded({ extended: true, limit: "16kb" }));

// Routers import
import userRouter from "./routes/user.route.js";

// Routers declaration
app.use("/api/v1/user", userRouter);

export { app };
