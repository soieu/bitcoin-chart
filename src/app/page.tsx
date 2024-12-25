"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { socket } from "../lib/socket";
import { KlineData, TradeData } from "./type/binance";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

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
          updatedKlines[updatedKlines.length - 1] = newKline;
        } else {
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
      <Card>
        <CardHeader>
          <CardTitle>Bitcoin</CardTitle>
          <CardDescription>Price: {tradeData?.k.c}</CardDescription>
        </CardHeader>
        <CardContent>
          <Chart
            options={{
              chart: {
                type: "candlestick",
              },
              xaxis: {
                type: "category",
                labels: {
                  formatter: function (val, timestamp, opts) {
                    const kline = klines.find((k) => k[0] === timestamp);
                    return kline ? kline[4] : val; // Close price
                  },
                },
              },
            }}
            series={[
              {
                data: klines.map((k) => ({
                  x: k[0], // Open time
                  y: [
                    parseFloat(k[1]), // Open
                    parseFloat(k[2]), // High
                    parseFloat(k[3]), // Low
                    parseFloat(k[4]), // Close
                  ],
                })),
              },
            ]}
            type="candlestick"
            height={350}
          />
        </CardContent>
        <CardFooter>
          <p>Card Footer</p>
        </CardFooter>
      </Card>
    </div>
  );
}
