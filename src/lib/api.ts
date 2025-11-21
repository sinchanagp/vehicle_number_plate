const rawBase = (import.meta.env.VITE_API_URL as string | undefined)?.trim() ?? "";
const API_BASE = rawBase.endsWith("/") ? rawBase.slice(0, -1) : rawBase;

const buildUrl = (path: string) => {
  if (!path.startsWith("/")) {
    throw new Error(`API path must start with "/". Received: ${path}`);
  }
  return API_BASE ? `${API_BASE}${path}` : path;
};

export interface CameraStatus {
  id: number;
  status: "idle" | "live" | "offline";
  mode: "webcam" | "rtsp" | "upload";
  fps: number;
  resolution: string;
  lastHeartbeat: string;
}

export type DetectionDirection = "entry" | "exit";

export interface Detection {
  id: number;
  plate: string;
  confidence: number;
  source: string;
  direction: DetectionDirection;
  imageUrl: string | null;
  capturedAt: string;
  createdAt: string;
}

export interface SummaryResponse {
  entryCount: number;
  exitCount: number;
  uniquePlates: number;
  cameraStatus: CameraStatus;
}

export interface PaginatedDetections {
  data: Detection[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(buildUrl(path), {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || `Request to ${path} failed with status ${response.status}`);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}

export interface ListDetectionsParams {
  page?: number;
  limit?: number;
  search?: string;
  source?: string;
  direction?: DetectionDirection;
}

export const getSummary = () => request<SummaryResponse>("/api/summary");

export const listDetections = (params: ListDetectionsParams = {}) => {
  const query = new URLSearchParams();
  if (params.page) query.set("page", String(params.page));
  if (params.limit) query.set("limit", String(params.limit));
  if (params.search) query.set("search", params.search);
  if (params.source) query.set("source", params.source);
  if (params.direction) query.set("direction", params.direction);
  const suffix = query.toString() ? `?${query.toString()}` : "";
  return request<PaginatedDetections>(`/api/detections${suffix}`);
};

export const openDetectionsStream = (onDetection: (detection: Detection) => void) => {
  if (typeof window === "undefined" || typeof EventSource === "undefined") {
    return null;
  }

  const source = new EventSource(buildUrl("/api/detections/stream/sse"));
  source.addEventListener("detection", (event) => {
    try {
      const payload = JSON.parse((event as MessageEvent).data) as Detection;
      onDetection(payload);
    } catch (err) {
      console.error("Failed to parse detection event", err);
    }
  });
  source.onerror = (err) => {
    console.error("Detection SSE connection error", err);
  };
  return source;
};

export interface UploadRecord {
  fileName: string;
  size: number;
  uploadedAt: string;
  contentType?: string;
}

export const uploadImage = (fileName: string, dataUrl: string, contentType?: string) =>
  request<UploadRecord>("/api/uploads", {
    method: "POST",
    body: JSON.stringify({
      fileName,
      dataUrl,
      contentType,
    }),
  });

export const listUploads = () => request<UploadRecord[]>("/api/uploads");

