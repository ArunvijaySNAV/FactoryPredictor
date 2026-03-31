import { useEffect, useState } from "react";

export function usePolling<T>(load: () => Promise<T>, intervalMs = 10000) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    const run = async () => {
      try {
        const result = await load();
        if (active) {
          setData(result);
          setError(null);
        }
      } catch (loadError) {
        if (active) {
          setError(loadError instanceof Error ? loadError.message : "Polling failed");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    void run();
    const timer = window.setInterval(() => void run(), intervalMs);

    return () => {
      active = false;
      window.clearInterval(timer);
    };
  }, [intervalMs, load]);

  return { data, loading, error, setData };
}

