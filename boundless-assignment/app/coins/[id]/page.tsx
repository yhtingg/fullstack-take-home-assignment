import { fetchCoinDetails, fetchMarketChart } from "@/lib/coingecko";
import Chart from "./Chart";
import Client from "./Client";

export const dynamic = "force-dynamic";

export default async function CoinPage({ params }: { params: { id: string } }) {
  const { id } = await params;

  const [details, chartData] = await Promise.all([
    fetchCoinDetails(id),
    fetchMarketChart(id, "usd", 1),
  ]);

  const percentageDiff = details.market_data.price_change_percentage_24h_in_currency.usd;

  return (
    <div className="mt-4">
      <h1 className="text-xl mb-2">{details.name} ({details.symbol.toUpperCase()})</h1>
      <h1 className="text-2xl">${details.market_data.current_price.usd.toLocaleString()}</h1>
      <h3 className={percentageDiff >= 0 ? "text-green-700" : "text-red-700"}>
        {percentageDiff >= 0 ? "+" : ""}
        {percentageDiff.toFixed(2)}%</h3>

      <Chart coinId={params.id} initialData={chartData} />
      <Client details={details} />
    </div>
  );
}
