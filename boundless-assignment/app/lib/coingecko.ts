import { LineData } from "lightweight-charts";

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

function buildHeaders() {
  const headers: Record<string, string> = {
    Accept: "application/json",
  };
  const key = process.env.COINGECKO_API_KEY;
  if (key) {
    headers["X-CG-PRO-API-KEY"] = key;
  }
  return headers;
}

async function retryFetch(input: RequestInfo | URL, init?: RequestInit, attempts = 3, baseDelay = 500) {
  let lastError: unknown;
  for (let i = 0; i < attempts; i++) {
    try {
      const res = await fetch(input, init);
      if (res.ok) return res;

      // If rate limited or server error, retry
      if (res.status === 429 || (res.status >= 500 && res.status < 600)) {
        const wait = baseDelay * Math.pow(2, i); // exponential backoff
        await new Promise((r) => setTimeout(r, wait));
        lastError = new Error(`Fetch returned ${res.status}`);
        continue;
      }

      const text = await res.text();
      throw new Error(`Request failed ${res.status}: ${text}`);
    } catch (err) {
      lastError = err;
      const wait = baseDelay * Math.pow(2, i);
      await new Promise((r) => setTimeout(r, wait));
    }
  }
  throw lastError;
}

export async function fetchMarketChart(coinId: string, vsCurrency = "usd", days: number | "max" = 1): Promise<LineData[]> {
  const url = `https://api.coingecko.com/api/v3/coins/${coinId}/market_chart?vs_currency=${vsCurrency}&days=${days}`;
  const res = await retryFetch(url, { headers: buildHeaders() }, 4, 500);
  if (!res.ok) console.log("market chart", res)
  if (!res.ok) throw new Error("Failed to fetch market chart");
  const data = await res.json();

  return data.prices.map(([timestamp, price]: [number, number]) => ({
    time: Math.floor(timestamp / 1000),
    value: price,
  }));
}

export async function fetchCoinDetails(coinId: string, vsCurrency = "usd"): Promise<CoinDetails> {
  const url = `https://api.coingecko.com/api/v3/coins/${coinId}?localization=false&tickers=false&community_data=false&developer_data=false&sparkline=false`;
  const res = await retryFetch(url, { headers: buildHeaders() }, 4, 500);
  if (!res.ok) console.log("coin details", res)
  if (!res.ok) throw new Error("Failed to fetch coin details");
  const json = await res.json();
  
  if (!json.market_data) {
    throw new Error("CoinGecko response missing market_data");
  }
  if (!json.market_data.price_change_percentage_24h_in_currency) {
    json.market_data.price_change_percentage_24h_in_currency = { [vsCurrency]: 0 };
  } else if (json.market_data.price_change_percentage_24h_in_currency[vsCurrency] == null) {
    json.market_data.price_change_percentage_24h_in_currency[vsCurrency] = 0;
  }
  return json as CoinDetails;
}
