import { useRef, useState } from "react";
import Navbar from "@/components/Navbar";
import WebcamPreview from "@/components/WebcamPreview";
import DetectionPanel from "@/components/DetectionPanel";
import DetectionsTable from "@/components/DetectionsTable";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { uploadImage } from "@/lib/api";
import useDetections from "@/hooks/use-detections";

const LiveDetection = () => {
  const {
    summary,
    detections,
    latestDetection,
    isLoadingDetections,
    detectionsError,
    refreshDetections,
  } = useDetections({ limit: 50 });

  const [capturedFrame, setCapturedFrame] = useState<string | null>(null);
  const [manualUploadState, setManualUploadState] = useState<"idle" | "uploading" | "success" | "error">("idle");
  const [manualUploadMessage, setManualUploadMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleManualUpload = async (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;
    const file = fileList[0];
    setManualUploadState("uploading");
    setManualUploadMessage(null);
    try {
      const dataUrl = await fileToDataUrl(file);
      await uploadImage(file.name, dataUrl, file.type);
      setManualUploadState("success");
      setManualUploadMessage("Upload complete.");
      refreshDetections();
    } catch (err) {
      console.error("Failed to upload media", err);
      setManualUploadState("error");
      setManualUploadMessage("Failed to upload file. Please try again.");
    } finally {
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="max-w-7xl mx-auto px-6 py-8 space-y-6">
        <Card className="border border-border">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-foreground">Live Detection Mode</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <WebcamPreview
                  autoStart
                  enableUpload
                  cameraStatus={summary?.cameraStatus}
                  onCapture={(dataUrl) => setCapturedFrame(dataUrl)}
                />
              </div>
              <div className="space-y-6">
                <DetectionPanel detection={latestDetection} />
                <Card className="border border-dashed border-border">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base font-semibold text-foreground">Upload Detection Image</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                      Upload an existing image (JPG, PNG, MP4) to run it through the detection pipeline. Captured frames
                      from the live feed are automatically sent when you click “Send to server”.
                    </p>
                    <Input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*,video/*"
                      onChange={(event) => handleManualUpload(event.target.files)}
                    />
                    <Button variant="secondary" onClick={() => fileInputRef.current?.click()}>
                      Browse Files
                    </Button>
                    {manualUploadMessage && (
                      <p
                        className={`text-sm ${
                          manualUploadState === "error" ? "text-destructive" : "text-success"
                        }`}
                      >
                        {manualUploadMessage}
                      </p>
                    )}
                    {capturedFrame && (
                      <div className="space-y-2">
                        <p className="text-xs text-muted-foreground uppercase tracking-wide">Last captured frame</p>
                        <div className="aspect-video overflow-hidden rounded-lg border border-border bg-muted">
                          <img src={capturedFrame} alt="Captured frame from webcam" className="h-full w-full object-cover" />
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-border">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-foreground">Recent Live Detections</CardTitle>
          </CardHeader>
          <CardContent>
            <DetectionsTable
              detections={detections}
              isLoading={isLoadingDetections}
              error={detectionsError}
              onRefresh={refreshDetections}
            />
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

const fileToDataUrl = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      resolve(reader.result as string);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

export default LiveDetection;
