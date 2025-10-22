"use client";

import { useEffect, useRef, useState } from "react";
import { createChart, LineSeries, Time } from "lightweight-charts";

interface Props {
  coinId: string;
  initialData: { time: Time; value: number }[];
}

export default function ChartClient({ coinId, initialData }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [data, setData] = useState(initialData);
  const chartRef = useRef<ReturnType<typeof createChart> | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const chart = createChart(containerRef.current, { height: 300, timeScale: { timeVisible: true } });
    const line = chart.addSeries(LineSeries);
    line.setData(initialData);
    chartRef.current = chart;

    return () => chart.remove();
  }, []);

  return <div ref={containerRef} className="w-full h-[300px]" />;
}
