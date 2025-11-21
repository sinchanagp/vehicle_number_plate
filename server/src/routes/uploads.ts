import { Router } from "express";
import { mkdirSync, readdirSync, statSync, writeFileSync } from "fs";
import { join } from "path";
import { z } from "zod";

const router = Router();
const uploadDir = join(process.cwd(), "data", "uploads");
mkdirSync(uploadDir, { recursive: true });

const uploadSchema = z.object({
  fileName: z.string().min(1),
  contentType: z.string().optional().default("application/octet-stream"),
  dataUrl: z
    .string()
    .min(16)
    .regex(/^data:.+;base64,/, "Expected a base64 data URL"),
});

router.get("/", (_req, res) => {
  const files = readdirSync(uploadDir).map((name) => {
    const filePath = join(uploadDir, name);
    const stats = statSync(filePath);
    return {
      fileName: name,
      size: stats.size,
      uploadedAt: stats.birthtime.toISOString(),
    };
  });

  res.json(files);
});

router.post("/", (req, res) => {
  const payload = uploadSchema.parse(req.body);
  const [, , base64Data] = payload.dataUrl.match(/^data:(.+);base64,(.*)$/) ?? [];

  if (!base64Data) {
    res.status(400).json({ error: "Invalid data URL payload." });
    return;
  }

  const buffer = Buffer.from(base64Data, "base64");
  const sanitized = payload.fileName.replace(/[^a-zA-Z0-9._-]/g, "_");
  const fileName = `${Date.now()}-${sanitized || "upload"}`;
  const filePath = join(uploadDir, fileName);

  writeFileSync(filePath, buffer);

  res.status(201).json({
    fileName,
    size: buffer.length,
    uploadedAt: new Date().toISOString(),
    contentType: payload.contentType,
  });
});

export default router;

