import Navbar from "@/components/Navbar";
import DetectionsTable from "@/components/DetectionsTable";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import useDetections from "@/hooks/use-detections";

const DashboardLogs = () => {
  const { detections, isLoadingDetections, detectionsError, refreshDetections } = useDetections({
    limit: 100,
    stream: false,
  });

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="max-w-7xl mx-auto px-6 py-8 space-y-6">
        <Card className="border border-border">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-foreground">Dashboard Logs</CardTitle>
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

export default DashboardLogs;
