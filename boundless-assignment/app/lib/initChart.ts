import {
    createChart,
    ISeriesApi,
    LineData,
    LineSeries,
    UTCTimestamp,
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
  chart.timeScale().fitContent();

  let userInteracted = false;
  let externalRangeChange = false;

  // Track if user zooms/pans
  chart.timeScale().subscribeVisibleTimeRangeChange(() => {
    if (!externalRangeChange) userInteracted = true;
  });

  // lockEdges();

  function updateData(newData: LineData[], shouldFitContent = false) {
    series.setData(newData);
    chart.priceScale('right').applyOptions({ autoScale: true });

    if (shouldFitContent) {
      externalRangeChange = true;
      setTimeout(() => {
        chart.timeScale().fitContent();
        userInteracted = false;
        externalRangeChange = false;
      }, 0);
    }
  }

  function handleResize() {
    chart.applyOptions({ width: container.clientWidth, height: container.clientHeight });
    if (!userInteracted) {
      chart.timeScale().fitContent();
    }
  }

  function lockEdges() {
    const data = series.data();
    if (!data.length) return;

    const firstTime = data[0].time as number;
    const lastTime = data[data.length - 1].time as number;

    const timeScale = chart.timeScale();

    timeScale.subscribeVisibleTimeRangeChange((newRange) => {
      if (!newRange) return;

      let { from, to } = newRange;

      // Prevent scrolling before first point
      if ((from as UTCTimestamp) < firstTime) {
        from = firstTime as UTCTimestamp;
        to = (firstTime + ((to as UTCTimestamp) - (from as UTCTimestamp))) as UTCTimestamp;
      }

      // Prevent scrolling after last point
      if ((to as UTCTimestamp) > lastTime) {
        to = lastTime as UTCTimestamp;
        from = (lastTime - ((to as UTCTimestamp) - (from as UTCTimestamp))) as UTCTimestamp;
      }

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
