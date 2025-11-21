import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Camera } from "lucide-react";
import type { CameraStatus } from "@/lib/api";

interface WebcamPreviewProps {
  cameraStatus?: CameraStatus | null;
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

const WebcamPreview = ({ cameraStatus }: WebcamPreviewProps) => {
  const statusKey = cameraStatus?.status ?? "unknown";
  const style = statusStyles[statusKey];

  return (
    <Card className="h-full border border-border">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Camera className="w-5 h-5 text-primary" />
          Live Camera Feed
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative aspect-video bg-muted rounded-lg overflow-hidden">
          {/* Placeholder for webcam feed */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <Camera className="w-16 h-16 text-muted-foreground mx-auto mb-3 opacity-40" />
              <p className="text-sm text-muted-foreground">Camera feed will appear here</p>
            </div>
          </div>
          
          {/* Status indicator */}
          <div
            className={`absolute top-4 right-4 flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold ${style.pill}`}
          >
            <div className={`w-2 h-2 rounded-full ${style.dot}`} />
            {style.label}
          </div>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wide">Mode</p>
            <p className="font-semibold text-foreground">
              {cameraStatus ? cameraStatus.mode.toUpperCase() : "UNKNOWN"}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wide">Resolution</p>
            <p className="font-semibold text-foreground">
              {cameraStatus ? cameraStatus.resolution : "—"}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wide">Frame Rate</p>
            <p className="font-semibold text-foreground">
              {cameraStatus ? `${cameraStatus.fps} fps` : "—"}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wide">Last Heartbeat</p>
            <p className="font-semibold text-foreground">
              {cameraStatus
                ? new Date(cameraStatus.lastHeartbeat).toLocaleTimeString(undefined, {
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                : "—"}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default WebcamPreview;
