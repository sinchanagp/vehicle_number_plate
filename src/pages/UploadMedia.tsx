import { useCallback, useEffect, useRef, useState } from "react";
import Navbar from "@/components/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Upload, Loader2 } from "lucide-react";
import { listUploads, uploadImage, type UploadRecord } from "@/lib/api";

const UploadMedia = () => {
  const [uploads, setUploads] = useState<UploadRecord[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadUploads = useCallback(() => {
    listUploads()
      .then((data) => {
        setUploads(data.sort((a, b) => b.fileName.localeCompare(a.fileName)));
        setError(null);
      })
      .catch((err: Error) => {
        console.error("Failed to load uploads", err);
        setError("Unable to load uploaded files.");
      });
  }, []);

  useEffect(() => {
    loadUploads();
  }, [loadUploads]);

  const handleFiles = async (files: FileList | File[] | null) => {
    const items = files ? Array.from(files) : [];
    if (!items.length) return;
    setIsUploading(true);
    setError(null);
    try {
      const results: UploadRecord[] = [];
      for (const file of items) {
        const dataUrl = await fileToDataUrl(file);
        const uploaded = await uploadImage(file.name, dataUrl, file.type);
        results.push(uploaded);
      }
      setUploads((prev) => [...results, ...prev]);
    } catch (err) {
      console.error("Failed to upload files", err);
      setError("One or more files could not be uploaded.");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);
    handleFiles(event.dataTransfer.files);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="max-w-7xl mx-auto px-6 py-8 space-y-6">
        <Card className="border border-border">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-foreground">Upload Media</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div
              className={`flex flex-col items-center justify-center py-16 border-2 border-dashed rounded-lg transition-colors ${
                isDragging ? "border-primary bg-primary/5" : "border-border hover:border-primary"
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <Upload className="w-16 h-16 text-muted-foreground mb-4" />
              <p className="text-lg font-medium text-foreground mb-2">Upload images or videos</p>
              <p className="text-sm text-muted-foreground">
                Drag and drop files here, or click the button below to browse.
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,video/*"
                multiple
                className="hidden"
                onChange={(event) => handleFiles(event.target.files)}
              />
              <Button
                className="mt-6"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
              >
                {isUploading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isUploading ? "Uploading..." : "Browse Files"}
              </Button>
            </div>

            {error && (
              <div className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {error}
              </div>
            )}

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-muted-foreground">
                  Uploaded Files ({uploads.length})
                </p>
                <Button variant="ghost" size="sm" onClick={loadUploads} disabled={isUploading}>
                  Refresh
                </Button>
              </div>
              {uploads.length === 0 ? (
                <p className="text-sm text-muted-foreground">No files uploaded yet.</p>
              ) : (
                <div className="rounded-lg border border-border overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>File name</TableHead>
                        <TableHead>Size</TableHead>
                        <TableHead>Uploaded at</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {uploads.map((item) => (
                        <TableRow key={item.fileName}>
                          <TableCell className="font-mono text-sm">{item.fileName}</TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {formatBytes(item.size)}
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {new Date(item.uploadedAt).toLocaleString()}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

const fileToDataUrl = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

const formatBytes = (bytes: number) => {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / k ** i).toFixed(1)} ${sizes[i]}`;
};

export default UploadMedia;
