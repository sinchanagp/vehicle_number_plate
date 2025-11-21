import Navbar from "@/components/Navbar";
import StatCard from "@/components/StatCard";
import WebcamPreview from "@/components/WebcamPreview";
import DetectionPanel from "@/components/DetectionPanel";
import DetectionsTable from "@/components/DetectionsTable";
import { LogIn, LogOut, Shield, Camera } from "lucide-react";
import { useMemo } from "react";
import useDetections from "@/hooks/use-detections";

const Index = () => {
  const {
    summary,
    detections,
    latestDetection,
    isLoadingSummary,
    isLoadingDetections,
    summaryError,
    detectionsError,
    refreshDetections,
  } = useDetections();

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
