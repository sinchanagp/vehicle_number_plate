import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Camera, Download, ImageOff, UploadCloud } from "lucide-react";
import type { CameraStatus } from "@/lib/api";
import { uploadImage } from "@/lib/api";

interface WebcamPreviewProps {
  cameraStatus?: CameraStatus | null;
  autoStart?: boolean;
  enableUpload?: boolean;
  onCapture?: (dataUrl: string) => void;
}

const statusStyles: Record<CameraStatus["status"] | "unknown", { dot: string; pill: string; label: string }> = {
  live: { dot: "bg-success", pill: "bg-success/15 text-success border border-success/30", label: "LIVE" },
  idle: {
    dot: "bg-secondary-foreground",
    pill: "bg-secondary/90 text-secondary-foreground",
    label: "IDLE",
  },
  offline: { dot: "bg-destructive", pill: "bg-destructive/10 text-destructive", label: "OFFLINE" },
  unknown: { dot: "bg-muted-foreground", pill: "bg-muted text-muted-foreground", label: "UNKNOWN" },
};

const WebcamPreview = ({ cameraStatus, autoStart = false, enableUpload = false, onCapture }: WebcamPreviewProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [isStarting, setIsStarting] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [snapshot, setSnapshot] = useState<string | null>(null);
  const [uploadState, setUploadState] = useState<"idle" | "uploading" | "success" | "error">("idle");
  const supportsCamera =
    typeof navigator !== "undefined" &&
    typeof window !== "undefined" &&
    Boolean(navigator.mediaDevices?.getUserMedia);

  const statusKey = cameraStatus?.status ?? (isStreaming ? "live" : "unknown");
  const style = statusStyles[statusKey];

  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsStreaming(false);
  }, []);

  const startCamera = useCallback(async () => {
    if (!supportsCamera || isStarting || isStreaming) {
      return;
    }
    setIsStarting(true);
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setIsStreaming(true);
    } catch (err) {
      console.error("Unable to start camera", err);
      setError(
        err instanceof Error
          ? err.message
          : "Unable to access camera. Please ensure permissions are granted.",
      );
    } finally {
      setIsStarting(false);
    }
  }, [supportsCamera, isStarting, isStreaming]);

  const capturePhoto = useCallback(() => {
    if (!videoRef.current) {
      setError("Camera stream is not active.");
      return;
    }
    const canvas = document.createElement("canvas");
    canvas.width = videoRef.current.videoWidth || 1280;
    canvas.height = videoRef.current.videoHeight || 720;
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      setError("Unable to capture video frame.");
      return;
    }
    ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL("image/png");
    setSnapshot(dataUrl);
    onCapture?.(dataUrl);
    setUploadState("idle");
  }, [onCapture]);

  const downloadSnapshot = () => {
    if (!snapshot) return;
    const link = document.createElement("a");
    link.href = snapshot;
    link.download = `snapshot-${Date.now()}.png`;
    link.click();
  };

  const uploadSnapshot = async () => {
    if (!snapshot || !enableUpload) return;
    try {
      setUploadState("uploading");
      await uploadImage(`capture-${Date.now()}.png`, snapshot, "image/png");
      setUploadState("success");
    } catch (err) {
      console.error("Failed to upload capture", err);
      setUploadState("error");
    }
  };

  useEffect(() => {
    if (autoStart && supportsCamera) {
      startCamera().catch(() => {
        // errors handled inside startCamera
      });
    }
    return () => {
      stopCamera();
    };
  }, [autoStart, startCamera, stopCamera, supportsCamera]);

  const statusDetails = useMemo(
    () => [
      {
        label: "Mode",
        value: cameraStatus ? cameraStatus.mode.toUpperCase() : isStreaming ? "CAMERA" : "UNKNOWN",
      },
      {
        label: "Resolution",
        value: cameraStatus ? cameraStatus.resolution : isStreaming ? "Auto" : "—",
      },
      {
        label: "Frame Rate",
        value: cameraStatus ? `${cameraStatus.fps} fps` : isStreaming ? "Live" : "—",
      },
      {
        label: "Last Heartbeat",
        value: cameraStatus
          ? new Date(cameraStatus.lastHeartbeat).toLocaleTimeString(undefined, {
              hour: "2-digit",
              minute: "2-digit",
            })
          : "—",
      },
    ],
    [cameraStatus, isStreaming],
  );

  return (
    <Card className="h-full border border-border">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Camera className="w-5 h-5 text-primary" />
          Live Camera Feed
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="relative aspect-video bg-muted rounded-lg overflow-hidden">
          <video
            ref={videoRef}
            className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-200 ${
              isStreaming ? "opacity-100" : "opacity-0"
            }`}
            playsInline
            muted
            autoPlay
          />

          {!isStreaming && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <Camera className="w-16 h-16 text-muted-foreground mx-auto mb-3 opacity-40" />
                <p className="text-sm text-muted-foreground">Camera feed will appear here</p>
              </div>
            </div>
          )}

          {/* Status indicator */}
          <div
            className={`absolute top-4 right-4 flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold ${style.pill}`}
          >
            <div className={`w-2 h-2 rounded-full ${style.dot}`} />
            {style.label}
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <Button onClick={startCamera} disabled={!supportsCamera || isStarting || isStreaming}>
            {isStarting ? "Starting..." : "Start Camera"}
          </Button>
          <Button variant="secondary" onClick={capturePhoto} disabled={!isStreaming}>
            Capture Frame
          </Button>
          <Button variant="outline" onClick={stopCamera} disabled={!isStreaming}>
            Stop Camera
          </Button>
        </div>

        {error && (
          <div className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {error}
          </div>
        )}

        {snapshot && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-foreground">Last capture preview</p>
              <div className="flex gap-2">
                <Button variant="ghost" size="sm" onClick={downloadSnapshot}>
                  <Download className="h-4 w-4" />
                  Download
                </Button>
                {enableUpload && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={uploadSnapshot}
                    disabled={uploadState === "uploading"}
                  >
                    <UploadCloud className="h-4 w-4" />
                    {uploadState === "uploading" ? "Uploading..." : "Send to server"}
                  </Button>
                )}
              </div>
            </div>
            <div className="relative aspect-video overflow-hidden rounded-lg border border-border bg-muted">
              <img src={snapshot} alt="Captured frame" className="h-full w-full object-cover" />
              {uploadState === "success" && (
                <Badge className="absolute top-4 right-4 bg-success/90 text-white">Uploaded</Badge>
              )}
              {uploadState === "error" && (
                <Badge className="absolute top-4 right-4 bg-destructive text-white flex items-center gap-1">
                  <ImageOff className="w-3 h-3" />
                  Failed
                </Badge>
              )}
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4 text-sm">
          {statusDetails.map((item) => (
            <div key={item.label}>
              <p className="text-xs text-muted-foreground uppercase tracking-wide">{item.label}</p>
              <p className="font-semibold text-foreground">{item.value}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default WebcamPreview;
