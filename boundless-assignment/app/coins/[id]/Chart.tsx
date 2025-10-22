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
  const [data, setData] = useState(initialData);

  useEffect(() => {
    if (!containerRef.current) return;

    chartRef.current = initChart(containerRef.current, initialData);

    return () => {
      chartRef.current?.destroy();
    };
  }, [initialData]);

  // Refresh data every 30 seconds if someone is on it
  useEffect(() => {
    const fetchData = async () => {
      const res = await fetch(`https://fullstack-take-home-assignment.vercel.app/coins/ethereum/api/chart?coin=${coinId}&days=1`);
      const newData = await res.json();
      setData(newData);
      chartRef.current?.series?.setData?.(newData);
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

  return <div ref={containerRef} className="w-full h-[300px]" />;
}
