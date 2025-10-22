"use client";

import { useState } from "react";
import Stat from "./Stat";
import { CoinDetails } from "@/lib/coingecko";

export default function Client({ details }: { details: CoinDetails }) {
  const [data, setData] = useState(details);

  return (
    <div className="mt-5">
      <h1 className="text-xl">Market data</h1>
      <div className="flex flex-wrap gap-6 mt-4">
    
        <Stat label="Market cap" value={`$${(data.market_data.market_cap.usd / 1e9).toFixed(2)}B`} />
        <Stat label="Rank" value={`#${data.market_cap_rank}`} />
        <Stat label="24H Volume" value={`$${(data.market_data.total_volume.usd / 1e9).toFixed(2)}B`} />
        <Stat label="Circulating supply" value={`${(data.market_data.circulating_supply / 1e6).toFixed(1)}M ${details.symbol.toUpperCase()}`} />
        <Stat label="All-time high" value={`$${data.market_data.ath.usd.toLocaleString()}`} />
        <Stat label="All-time low" value={`$${data.market_data.atl.usd.toLocaleString()}`} />
        <Stat label="Total supply" value={
          data.market_data.total_supply
            ? `${(data.market_data.total_supply / 1e6).toFixed(1)}M ${details.symbol.toUpperCase()}`
            : "—"
        } />
      </div>
    </div>
  );
}
