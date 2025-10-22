export interface ChartPoint {
  time: number;
  value: number;
}

export interface CoinDetails {
  id: string;
  symbol: string;
  name: string;
  market_cap_rank: number;
  market_data: MarketData;
}

export interface MarketData {
  current_price: { [currency: string]: number};
  market_cap: { [currency: string]: number };
  total_volume: { [currency: string]: number };
  circulating_supply: number;
  total_supply: number | null;
  ath: { [currency: string]: number };
  atl: { [currency: string]: number };
  price_change_percentage_24h_in_currency: { [currency: string]: number };
}

export async function fetchMarketChart(coinId: string, vsCurrency = "usd", days = 1) {
  const url = `https://api.coingecko.com/api/v3/coins/${coinId}/market_chart?vs_currency=${vsCurrency}&days=${days}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to fetch market chart");
  const data = await res.json();

  return data.prices.map(([timestamp, price]: [number, number]) => ({
    time: Math.floor(timestamp / 1000),
    value: price,
  }));
}

export async function fetchCoinDetails(coinId: string, vsCurrency = "usd"): Promise<CoinDetails> {
  const url = `https://api.coingecko.com/api/v3/coins/${coinId}?localization=false&tickers=false&community_data=false&developer_data=false&sparkline=false`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to fetch coin details");
  return res.json();
}
