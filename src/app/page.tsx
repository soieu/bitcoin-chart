"use client";

import { useEffect, useState } from "react";
import { socket } from "../lib/socket";
import { KlineData, TradeData } from "./type/binance";
import Chart from "react-apexcharts";

export default function Home() {
  const [isConnected, setIsConnected] = useState(false);
  const [tradeData, setTradeData] = useState<TradeData | null>(null);
  const [klines, setKlines] = useState<KlineData[]>([]);

  useEffect(() => {
    async function fetchData() {
      const params = new URLSearchParams({
        symbol: "BTCUSDT",
        interval: "1m",
      });

      const response = await fetch(
        `https://api.binance.com/api/v3/klines?${params}`,
        {
          method: "GET",
        }
      );
      setKlines(await response.json());
    }

    fetchData();

    function onOpen() {
      setIsConnected(true);
    }

    function onClose() {
      setIsConnected(false);
    }

    function onMessage(event) {
      const data: TradeData = JSON.parse(event.data);
      setTradeData(data);

      const newKline: KlineData = [
        data.k.t,
        data.k.o,
        data.k.h,
        data.k.l,
        data.k.c,
        data.k.v,
        data.k.T,
        data.k.q,
        data.k.n,
      ];

      setKlines((prevKlines) => {
        const updatedKlines = [...prevKlines];
        if (
          updatedKlines.length > 0 &&
          updatedKlines[updatedKlines.length - 1][0] === newKline[0]
        ) {
          // 마지막 캔들을 업데이트
          updatedKlines[updatedKlines.length - 1] = newKline;
        } else {
          // 새로운 캔들을 추가
          updatedKlines.push(newKline);
        }
        return updatedKlines;
      });
    }

    socket.addEventListener("open", onOpen);
    socket.addEventListener("close", onClose);
    socket.addEventListener("message", onMessage);

    return () => {
      socket.removeEventListener("open", onOpen);
      socket.removeEventListener("close", onClose);
      socket.removeEventListener("message", onMessage);
    };
  }, []);

  return (
    <div>
      <p>Status: {isConnected ? "connected" : "disconnected"}</p>
      {tradeData && (
        <div>
          <p>Event Time: {new Date(tradeData.E).toLocaleString()}</p>
          <p>Symbol: {tradeData.s}</p>
          <p>Price: {tradeData.k.c}</p>
          <div id="chart">
            <Chart
              options={{
                chart: {
                  type: "candlestick",
                },
                xaxis: {
                  type: "datetime",
                },
              }}
              series={[
                {
                  data: klines.map((k) => ({
                    x: new Date(k[0]),
                    y: [
                      parseFloat(k[1]),
                      parseFloat(k[2]),
                      parseFloat(k[3]),
                      parseFloat(k[4]),
                    ],
                  })),
                },
              ]}
              type="candlestick"
              height={350}
            />
          </div>
          <div id="html-dist"></div>
        </div>
      )}
    </div>
  );
}
