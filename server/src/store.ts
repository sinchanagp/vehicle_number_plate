import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import { join } from "path";
import type { CameraStatusRecord, DetectionRecord, DetectionDirection } from "./types";

const dataDir = join(process.cwd(), "data");
const storeFile = join(dataDir, "store.json");

interface StoreState {
  lastDetectionId: number;
  detections: DetectionRecord[];
  cameraStatus: CameraStatusRecord;
}

function ensureStore(): void {
  mkdirSync(dataDir, { recursive: true });
  if (!existsSync(storeFile)) {
    const now = new Date();
    const detections: DetectionRecord[] = [];
    const sources = ["North Gate", "South Gate", "Lot A", "Lot B"];
    const directions: DetectionDirection[] = ["entry", "exit"];

    for (let i = 0; i < 8; i += 1) {
      const capturedAt = new Date(now.getTime() - i * 15 * 60 * 1000).toISOString();
      detections.push({
        id: i + 1,
        plate: `ABC-${100 + i}`,
        confidence: 80 + (i % 4) * 5,
        source: sources[i % sources.length],
        direction: directions[i % directions.length],
        imageUrl: null,
        capturedAt,
        createdAt: capturedAt,
      });
    }

    const initialState: StoreState = {
      lastDetectionId: detections.length,
      detections,
      cameraStatus: {
        id: 1,
        status: "idle",
        mode: "webcam",
        fps: 0,
        resolution: "1920x1080",
        lastHeartbeat: now.toISOString(),
      },
    };
    writeFileSync(storeFile, JSON.stringify(initialState, null, 2));
  }
}

ensureStore();

function readState(): StoreState {
  const file = readFileSync(storeFile, "utf-8");
  return JSON.parse(file) as StoreState;
}

function writeState(state: StoreState): void {
  writeFileSync(storeFile, JSON.stringify(state, null, 2));
}

export function listDetections(): DetectionRecord[] {
  return readState().detections;
}

export function addDetection(record: Omit<DetectionRecord, "id" | "createdAt">): DetectionRecord {
  const state = readState();
  const newRecord: DetectionRecord = {
    ...record,
    id: state.lastDetectionId + 1,
    createdAt: new Date().toISOString(),
  };
  state.detections.unshift(newRecord);
  state.lastDetectionId = newRecord.id;
  writeState(state);
  return newRecord;
}

export function getDetectionById(id: number): DetectionRecord | undefined {
  return readState().detections.find((det) => det.id === id);
}

export function readCameraStatus(): CameraStatusRecord {
  return readState().cameraStatus;
}

export function updateCameraStatus(partial: Omit<CameraStatusRecord, "id" | "lastHeartbeat"> & { status: CameraStatusRecord["status"] }): CameraStatusRecord {
  const state = readState();
  state.cameraStatus = {
    ...state.cameraStatus,
    ...partial,
    id: 1,
    lastHeartbeat: new Date().toISOString(),
  };
  writeState(state);
  return state.cameraStatus;
}

