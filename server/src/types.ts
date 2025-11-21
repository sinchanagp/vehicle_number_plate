export type DetectionDirection = "entry" | "exit";

export interface DetectionRecord {
  id: number;
  plate: string;
  confidence: number;
  source: string;
  direction: DetectionDirection;
  imageUrl: string | null;
  capturedAt: string;
  createdAt: string;
}

export interface CameraStatusRecord {
  id: number;
  status: "idle" | "live" | "offline";
  mode: "webcam" | "rtsp" | "upload";
  fps: number;
  resolution: string;
  lastHeartbeat: string;
}

