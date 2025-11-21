import { Router } from "express";
import { z } from "zod";
import { readCameraStatus, updateCameraStatus } from "../store";

const router = Router();

router.get("/", (_req, res) => {
  res.json(readCameraStatus());
});

const heartbeatSchema = z.object({
  status: z.enum(["idle", "live", "offline"]),
  mode: z.enum(["webcam", "rtsp", "upload"]),
  fps: z.number().min(0).max(120),
  resolution: z.string().regex(/^\d{3,4}x\d{3,4}$/),
});

router.post("/heartbeat", (req, res) => {
  const payload = heartbeatSchema.parse(req.body);
  const updated = updateCameraStatus(payload);
  res.json(updated);
});

export default router;

