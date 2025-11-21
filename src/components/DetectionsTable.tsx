import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Eye, RefreshCw } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { Detection } from "@/lib/api";

interface DetectionsTableProps {
  detections: Detection[];
  isLoading?: boolean;
  onRefresh?: () => void;
  error?: string | null;
}

const formatTimestamp = (timestamp: string) =>
  new Date(timestamp).toLocaleString(undefined, {
    hour12: true,
    hour: "2-digit",
    minute: "2-digit",
    month: "short",
    day: "numeric",
  });

const DetectionsTable = ({ detections, isLoading, onRefresh, error }: DetectionsTableProps) => {
  return (
    <Card className="border border-border">
      <CardHeader>
        <div className="flex items-center justify-between gap-3">
          <CardTitle className="text-lg">Recent Detections</CardTitle>
          {onRefresh && (
            <Button variant="ghost" size="sm" onClick={onRefresh} className="gap-2">
              <RefreshCw className="w-4 h-4" />
              Refresh
            </Button>
          )}
        </div>
        {error && <p className="text-sm text-destructive">{error}</p>}
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="font-semibold">Plate Number</TableHead>
              <TableHead className="font-semibold">Confidence</TableHead>
              <TableHead className="font-semibold">Date & Time</TableHead>
              <TableHead className="font-semibold">Source</TableHead>
              <TableHead className="text-right font-semibold">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="py-8 text-center text-sm text-muted-foreground">
                  Loading detections...
                </TableCell>
              </TableRow>
            ) : detections.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="py-8 text-center text-sm text-muted-foreground">
                  No detections available.
                </TableCell>
              </TableRow>
            ) : (
              detections.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-mono font-semibold">{item.plate}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{item.confidence}%</span>
                      <Badge
                        variant={item.confidence >= 90 ? "default" : "secondary"}
                        className={
                          item.confidence >= 90
                            ? "bg-success hover:bg-success/90"
                            : item.confidence >= 70
                              ? "bg-secondary text-secondary-foreground"
                              : "bg-destructive/10 text-destructive"
                        }
                      >
                        {item.confidence >= 90 ? "High" : item.confidence >= 70 ? "Medium" : "Low"}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {formatTimestamp(item.capturedAt)}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1">
                      <Badge variant="outline" className="font-medium w-fit">
                        {item.source}
                      </Badge>
                      <Badge
                        variant="secondary"
                        className={`w-fit ${
                          item.direction === "entry"
                            ? "bg-success/15 text-success"
                            : "bg-primary/10 text-primary"
                        }`}
                      >
                        {item.direction.toUpperCase()}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" className="gap-2">
                      <Eye className="w-4 h-4" />
                      View
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default DetectionsTable;
