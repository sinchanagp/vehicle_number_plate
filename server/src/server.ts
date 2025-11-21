import "dotenv/config";
import express, { type Request, type Response, type NextFunction } from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import detectionsRouter from "./routes/detections";
import summaryRouter from "./routes/summary";
import cameraRouter from "./routes/camera";

const app = express();

app.use(helmet());
app.use(
  cors({
    origin: process.env.CORS_ORIGIN ?? "*",
  }),
);
app.use(express.json({ limit: "5mb" }));
app.use(morgan("dev"));

app.get("/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.use("/api/detections", detectionsRouter);
app.use("/api/summary", summaryRouter);
app.use("/api/camera", cameraRouter);

app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error(err);
  res.status(500).json({ error: err.message });
});

const port = Number(process.env.PORT) || 4000;
app.listen(port, () => {
  console.log(`Campus Plate Watch API listening on http://localhost:${port}`);
});

