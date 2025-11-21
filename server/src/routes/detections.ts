import { Router } from "express";
import { EventEmitter } from "events";
import { z } from "zod";
import type { DetectionRecord } from "../types";
import { addDetection, getDetectionById, listDetections } from "../store";

const router = Router();
const detectionEvents = new EventEmitter();

detectionEvents.setMaxListeners(0);

const createDetectionSchema = z.object({
  plate: z
    .string()
    .min(4)
    .max(12)
    .regex(/^[A-Z0-9\- ]+$/, "Plate should contain only uppercase letters, digits, spaces, or hyphen"),
  confidence: z.number().min(0).max(100),
  source: z.string().min(2).max(64),
  direction: z.enum(["entry", "exit"]).default("entry"),
  imageUrl: z.string().url().optional().nullable(),
  capturedAt: z.string().datetime().optional(),
});

const listQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().trim().optional(),
  source: z.string().trim().optional(),
  direction: z.enum(["entry", "exit"]).optional(),
});

router.get("/", (req, res) => {
  const { page, limit, search, source, direction } = listQuerySchema.parse(req.query);
  let rows = listDetections();

  if (search) {
    const needle = search.toUpperCase();
    rows = rows.filter((row) => row.plate.includes(needle));
  }
  if (source) {
    rows = rows.filter((row) => row.source === source);
  }
  if (direction) {
    rows = rows.filter((row) => row.direction === direction);
  }

  rows = [...rows].sort((a, b) => b.capturedAt.localeCompare(a.capturedAt));

  const total = rows.length;
  const start = (page - 1) * limit;
  const data = rows.slice(start, start + limit);

  res.json({
    data,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  });
});

router.get("/stream/sse", (req, res) => {
  res.writeHead(200, {
    "Content-Type": "text/event-stream",
    Connection: "keep-alive",
    "Cache-Control": "no-cache",
  });
  const listener = (record: DetectionRecord) => {
    res.write(`event: detection\n`);
    res.write(`data: ${JSON.stringify(record)}\n\n`);
  };
  detectionEvents.on("new-detection", listener);

  req.on("close", () => {
    detectionEvents.off("new-detection", listener);
  });
});

router.get("/:id", (req, res) => {
  const detection = getDetectionById(Number(req.params.id));

  if (!detection) {
    res.status(404).json({ error: "Detection not found" });
    return;
  }

  res.json(detection);
});

router.post("/", (req, res) => {
  const payload = createDetectionSchema.parse(req.body);

  const capturedAt = payload.capturedAt ?? new Date().toISOString();
  const record = addDetection({
    plate: payload.plate.toUpperCase(),
    confidence: payload.confidence,
    source: payload.source,
    direction: payload.direction,
    imageUrl: payload.imageUrl ?? null,
    capturedAt,
  });

  detectionEvents.emit("new-detection", record);
  res.status(201).json(record);
});

export default router;

