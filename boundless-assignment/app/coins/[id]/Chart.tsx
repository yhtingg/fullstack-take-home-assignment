"use client";

import { useEffect, useRef, useState } from "react";
import { LineData } from "lightweight-charts";
import { initChart } from "@/lib/initChart";

interface Props {
  coinId: string;
  initialData: LineData[];
}

export default function ChartClient({ coinId, initialData }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<ReturnType<typeof initChart> | null>(null);
  const [range, setRange] = useState<"1h" | "1w" | "1m" | "3m" | "6m" | "1y" | "all">("1h");

  const rangeToDays: Record<string, string> = {
    "1h": "0.0417",
    "1d": "1",
    "1w": "7",
    "1m": "30",
    "3m": "90",
    "6m": "180",
    "1y": "365",
    "all": "max",
  };

  useEffect(() => {
    if (!containerRef.current) return;

    chartRef.current = initChart(containerRef.current, initialData);

    return () => {
      chartRef.current?.destroy();
    };
  }, [initialData]);

  const handleRangeChange = async (newRange: typeof range) => {
    setRange(newRange);
    const res = await fetch(`/api/chart?coin=${coinId}&days=${rangeToDays[newRange]}`);
    if (!res.ok) return;
    const json = await res.json();
    chartRef.current?.updateData(json.chart);
  };

  // Refresh data every 30 seconds if someone is on it
  useEffect(() => {
    const fetchData = async () => {
      const res = await fetch(`/api/chart?coin=${coinId}&days=1`);
      const json = await res.json();
      chartRef.current?.updateData(json.chart);
    };

    let interval: NodeJS.Timeout | null = null;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        if (interval) clearInterval(interval);
      } else {
        fetchData();
        interval = setInterval(fetchData, 30000);
      }
    };

    handleVisibilityChange();
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      if (interval) clearInterval(interval);
    };
  }, [coinId]);

  return (
    <div className="flex flex-col gap-3">
      <div ref={containerRef} className="w-full h-[300px]" />
      <div className="flex gap-2 mb-2">
        {Object.keys(rangeToDays).map((r) => (
          <button
            key={r}
            onClick={() => handleRangeChange(r as typeof range)}
            className={`px-3 py-1 cursor-pointer rounded ${
              range === r ?
                "bg-blue-600 hover:bg-blue-700 text-white"
                : "bg-gray-200 hover:bg-gray-300 text-black"
            }`}
          >
            {r.toUpperCase()}
          </button>
        ))}
      </div>
    </div>
  );
}
