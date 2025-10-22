import {
    createChart,
    ISeriesApi,
    LineData,
    LineSeries,
} from 'lightweight-charts';

type ChartSeries = ISeriesApi<'Line'>;

export function initChart(container: HTMLElement, initialData: LineData[]) {
  const chart = createChart(container, {
    width: container.clientWidth,
    height: container.clientHeight,
    rightPriceScale: { autoScale: true },
    timeScale: { timeVisible: true },
  });

  const series: ChartSeries = chart.addSeries(LineSeries);
  series.setData(initialData);
  lockEdges(series);

  let userInteracted = false;

  // Track if user zooms/pans
  chart.timeScale().subscribeVisibleTimeRangeChange(() => {
    userInteracted = true;
  });

  function updateData(newData: LineData[]) {
    series.setData(newData);
    lockEdges(series);

    // Auto-scale y-axis based on visible data
    chart.priceScale('right').applyOptions({ autoScale: true });

    // Lock x-axis if user hasn't interacted
    if (!userInteracted) {
      const visibleRange = chart.timeScale().getVisibleRange();
      if (visibleRange) {
        chart.timeScale().setVisibleRange(visibleRange);
      }
    }
  }

  // Handle window resize
  function handleResize() {
    chart.applyOptions({ width: container.clientWidth, height: container.clientHeight });

    // Lock x-axis if user hasn't interacted
    if (!userInteracted) {
      const visibleRange = chart.timeScale().getVisibleRange();
      if (visibleRange) {
        chart.timeScale().setVisibleRange(visibleRange);
      }
    }
  }

  function lockEdges(series: ChartSeries) {
    const data = series.data(); // get current series data
    if (!data.length) return;

    const firstTime = data[0].time as number; // assuming UTCTimestamp
    const lastTime = data[data.length - 1].time as number;

    const timeScale = chart.timeScale();

    timeScale.subscribeVisibleTimeRangeChange((newRange) => {
      if (!newRange) return;

      let { from, to } = newRange;

      // Prevent scrolling before first point
      if (from < firstTime) {
        from = firstTime;
        to = from + (newRange.to - newRange.from);
      }

      // Prevent scrolling after last point
      if (to > lastTime) {
        to = lastTime;
        from = to - (newRange.to - newRange.from);
      }

      // Apply adjusted range
      timeScale.setVisibleRange({ from, to });
    });
  }


  window.addEventListener('resize', handleResize);

  return {
      chart,
      series,
      updateData,
      destroy: () => {
          window.removeEventListener('resize', handleResize);
          chart.remove();
      },
  };
}
