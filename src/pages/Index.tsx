import { useCallback, useEffect, useMemo, useState } from "react";
import Navbar from "@/components/Navbar";
import StatCard from "@/components/StatCard";
import WebcamPreview from "@/components/WebcamPreview";
import DetectionPanel from "@/components/DetectionPanel";
import DetectionsTable from "@/components/DetectionsTable";
import { LogIn, LogOut, Shield, Camera } from "lucide-react";
import {
  getSummary,
  listDetections,
  openDetectionsStream,
  type Detection,
  type SummaryResponse,
} from "@/lib/api";

const Index = () => {
  const [summary, setSummary] = useState<SummaryResponse | null>(null);
  const [detections, setDetections] = useState<Detection[]>([]);
  const [isLoadingSummary, setIsLoadingSummary] = useState(false);
  const [isLoadingDetections, setIsLoadingDetections] = useState(false);
  const [summaryError, setSummaryError] = useState<string | null>(null);
  const [detectionsError, setDetectionsError] = useState<string | null>(null);

  const refreshSummary = useCallback(
    (withLoading = false) => {
      if (withLoading) {
        setIsLoadingSummary(true);
      }
      getSummary()
        .then((data) => {
          setSummary(data);
          setSummaryError(null);
        })
        .catch((error: Error) => {
          console.error("Failed to load summary", error);
          setSummaryError("Failed to load summary data.");
        })
        .finally(() => {
          if (withLoading) {
            setIsLoadingSummary(false);
          }
        });
    },
    [],
  );

  const refreshDetections = useCallback(() => {
    setIsLoadingDetections(true);
    listDetections({ limit: 20 })
      .then((response) => {
        setDetections(response.data);
        setDetectionsError(null);
      })
      .catch((error: Error) => {
        console.error("Failed to load detections", error);
        setDetectionsError("Failed to load detections.");
      })
      .finally(() => setIsLoadingDetections(false));
  }, []);

  useEffect(() => {
    refreshSummary(true);
  }, [refreshSummary]);

  useEffect(() => {
    refreshDetections();
  }, [refreshDetections]);

  useEffect(() => {
    const stream = openDetectionsStream((incoming) => {
      setDetections((prev) => {
        const filtered = prev.filter((existing) => existing.id !== incoming.id);
        return [incoming, ...filtered].slice(0, 20);
      });
      refreshSummary();
    });

    return () => {
      stream?.close();
    };
  }, [refreshSummary]);

  const latestDetection = detections[0] ?? null;
  const webcamModeValue = useMemo(() => {
    if (isLoadingSummary) return "Loading...";
    return summary ? summary.cameraStatus.mode.toUpperCase() : "Unknown";
  }, [summary, isLoadingSummary]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        {(summaryError || detectionsError) && (
          <div className="rounded-md border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive space-y-1">
            {summaryError && <p>{summaryError}</p>}
            {detectionsError && <p>{detectionsError}</p>}
          </div>
        )}

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Entry Today"
            value={isLoadingSummary ? "--" : summary?.entryCount ?? "--"}
            icon={LogIn}
            iconColor="text-primary"
          />
          <StatCard
            title="Exit Today"
            value={isLoadingSummary ? "--" : summary?.exitCount ?? "--"}
            icon={LogOut}
            iconColor="text-primary"
          />
          <StatCard
            title="Unique License Plates"
            value={isLoadingSummary ? "--" : summary?.uniquePlates ?? "--"}
            icon={Shield}
            iconColor="text-primary"
          />
          <StatCard
            title="Webcam Mode"
            value={webcamModeValue}
            icon={Camera}
            iconColor="text-success"
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <WebcamPreview cameraStatus={summary?.cameraStatus} />
          </div>
          <div>
            <DetectionPanel detection={latestDetection} />
          </div>
        </div>

        {/* Recent Detections Table */}
        <DetectionsTable
          detections={detections}
          isLoading={isLoadingDetections}
          onRefresh={refreshDetections}
          error={detectionsError}
        />
      </main>
    </div>
  );
};

export default Index;
