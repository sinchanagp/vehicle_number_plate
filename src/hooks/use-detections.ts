import { useCallback, useEffect, useMemo, useState } from "react";
import {
  getSummary,
  listDetections,
  openDetectionsStream,
  type Detection,
  type SummaryResponse,
} from "@/lib/api";

interface UseDetectionsOptions {
  limit?: number;
  stream?: boolean;
}

interface UseDetectionsResult {
  summary: SummaryResponse | null;
  detections: Detection[];
  latestDetection: Detection | null;
  isLoadingSummary: boolean;
  isLoadingDetections: boolean;
  summaryError: string | null;
  detectionsError: string | null;
  refreshSummary: (withLoading?: boolean) => void;
  refreshDetections: () => void;
}

export const useDetections = (options: UseDetectionsOptions = {}): UseDetectionsResult => {
  const { limit = 20, stream = true } = options;

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
    listDetections({ limit })
      .then((response) => {
        setDetections(response.data);
        setDetectionsError(null);
      })
      .catch((error: Error) => {
        console.error("Failed to load detections", error);
        setDetectionsError("Failed to load detections.");
      })
      .finally(() => setIsLoadingDetections(false));
  }, [limit]);

  useEffect(() => {
    refreshSummary(true);
  }, [refreshSummary]);

  useEffect(() => {
    refreshDetections();
  }, [refreshDetections]);

  useEffect(() => {
    if (!stream) {
      return;
    }

    const eventSource = openDetectionsStream((incoming) => {
      setDetections((prev) => {
        const filtered = prev.filter((existing) => existing.id !== incoming.id);
        return [incoming, ...filtered].slice(0, limit);
      });
      refreshSummary();
    });

    return () => {
      eventSource?.close();
    };
  }, [limit, refreshSummary, stream]);

  const latestDetection = useMemo(() => detections[0] ?? null, [detections]);

  return {
    summary,
    detections,
    latestDetection,
    isLoadingSummary,
    isLoadingDetections,
    summaryError,
    detectionsError,
    refreshSummary,
    refreshDetections,
  };
};

export default useDetections;

