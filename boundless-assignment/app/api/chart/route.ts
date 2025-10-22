import { NextResponse } from "next/server";
import { fetchMarketChart, fetchCoinDetails } from "@/lib/coingecko";

export const revalidate = 30;

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const coin = searchParams.get("coin") || "ethereum";
  const daysParam = searchParams.get("days") || "1";
  const vs_currency = searchParams.get("vs_currency") || "usd";

  const days: number | "max" = daysParam === "max" ? "max" : Number(daysParam);

  try {
    const [details, chart] = await Promise.all([
      fetchCoinDetails(coin, vs_currency),
      fetchMarketChart(coin, vs_currency, days),
    ]);

    return NextResponse.json({ details, chart }, {
      headers: {
        "Cache-Control": "s-maxage=30, stale-while-revalidate=15",
      },
    });
  } catch (err) {
    return NextResponse.json({ error: "Failed to fetch coin data" }, { status: 500 });
  }
}
