import Navbar from "@/components/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload } from "lucide-react";

const UploadMedia = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-6 py-8 space-y-6">
        <Card className="border border-border">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-foreground">Upload Media</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center py-16 border-2 border-dashed border-border rounded-lg hover:border-primary transition-colors">
              <Upload className="w-16 h-16 text-muted-foreground mb-4" />
              <p className="text-lg font-medium text-foreground mb-2">Upload images or videos</p>
              <p className="text-sm text-muted-foreground">Drag and drop or click to browse</p>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default UploadMedia;
