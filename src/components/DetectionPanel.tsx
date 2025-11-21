import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, Hash, Percent, Image, MapPin } from "lucide-react";
import type { Detection } from "@/lib/api";

interface DetectionPanelProps {
  detection?: Detection | null;
}

const DetectionPanel = ({ detection }: DetectionPanelProps) => {
  const confidenceLabel = (() => {
    if (!detection) return "Pending";
    if (detection.confidence >= 90) return "High";
    if (detection.confidence >= 70) return "Medium";
    return "Low";
  })();

  const confidenceBadgeClass = detection
    ? detection.confidence >= 90
      ? "bg-success/15 text-success"
      : detection.confidence >= 70
        ? "bg-secondary text-secondary-foreground"
        : "bg-destructive/10 text-destructive"
    : "bg-secondary text-secondary-foreground";

  const timestamp = detection
    ? new Date(detection.capturedAt).toLocaleString(undefined, {
        hour12: true,
        hour: "numeric",
        minute: "2-digit",
        month: "short",
        day: "numeric",
      })
    : "Not available";

  return (
    <Card className="h-full border border-border">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Latest Detection</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Thumbnail */}
        <div className="aspect-video bg-muted rounded-lg overflow-hidden relative">
          {detection?.imageUrl ? (
            <img src={detection.imageUrl} alt={`Detection ${detection.plate}`} className="w-full h-full object-cover" />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <Image className="w-12 h-12 text-muted-foreground opacity-40" />
            </div>
          )}
        </div>
        
        {/* Detection details */}
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Hash className="w-4 h-4 text-primary" />
            </div>
            <div className="flex-1">
              <p className="text-xs text-muted-foreground mb-1">License Plate</p>
              <p className="text-xl font-bold text-foreground font-mono">
                {detection ? detection.plate : "N/A"}
              </p>
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <div className="p-2 bg-success/10 rounded-lg">
              <Percent className="w-4 h-4 text-success" />
            </div>
            <div className="flex-1">
              <p className="text-xs text-muted-foreground mb-1">Confidence Score</p>
              <div className="flex items-center gap-2">
                <p className="text-lg font-semibold text-foreground">
                  {detection ? `${detection.confidence}%` : "N/A"}
                </p>
                <Badge className={confidenceBadgeClass}>{confidenceLabel}</Badge>
              </div>
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <div className="p-2 bg-accent/10 rounded-lg">
              <Clock className="w-4 h-4 text-accent" />
            </div>
            <div className="flex-1">
              <p className="text-xs text-muted-foreground mb-1">Timestamp</p>
              <p className="text-sm font-medium text-foreground">{timestamp}</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="p-2 bg-secondary/20 rounded-lg">
              <MapPin className="w-4 h-4 text-secondary-foreground" />
            </div>
            <div className="flex-1">
              <p className="text-xs text-muted-foreground mb-1">Source</p>
              <p className="text-sm font-medium text-foreground">
                {detection ? detection.source : "No source"}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default DetectionPanel;
