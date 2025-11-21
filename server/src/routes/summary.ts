import { Router } from "express";
import { listDetections, readCameraStatus } from "../store";

const router = Router();

router.get("/", (_req, res) => {
  const today = new Date().toISOString().slice(0, 10);
  const todaysDetections = listDetections().filter((det) => det.capturedAt.startsWith(today));

  const entryCount = todaysDetections.filter((det) => det.direction === "entry").length;
  const exitCount = todaysDetections.filter((det) => det.direction === "exit").length;
  const uniquePlates = new Set(todaysDetections.map((det) => det.plate)).size;

  const cameraStatus = readCameraStatus();

  res.json({
    entryCount,
    exitCount,
    uniquePlates,
    cameraStatus,
  });
});

export default router;

