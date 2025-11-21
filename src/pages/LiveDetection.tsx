import Navbar from "@/components/Navbar";
import WebcamPreview from "@/components/WebcamPreview";
import DetectionPanel from "@/components/DetectionPanel";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const LiveDetection = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-6 py-8 space-y-6">
        <Card className="border border-border">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-foreground">Live Detection Mode</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <WebcamPreview />
              </div>
              <div>
                <DetectionPanel />
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default LiveDetection;
