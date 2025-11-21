import Navbar from "@/components/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";

const Settings = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-6 py-8 space-y-6">
        <Card className="border border-border">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-foreground">Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="notifications" className="text-foreground">Enable Notifications</Label>
                <Switch id="notifications" />
              </div>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="auto-save" className="text-foreground">Auto-save Detections</Label>
                <Switch id="auto-save" />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="confidence" className="text-foreground">Detection Confidence Threshold</Label>
                <Slider id="confidence" defaultValue={[75]} max={100} step={1} />
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Settings;
