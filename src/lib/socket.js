"use client";

const socket = new WebSocket(
  "wss://stream.binance.com:9443/ws/btcusdt@kline_1m"
);

socket.addEventListener("open", () => {
  console.log("Connected to Binance WebSocket");
});

socket.addEventListener("message", (event) => {
  JSON.parse(event.data);
});

socket.addEventListener("close", () => {
  console.log("Disconnected from Binance WebSocket");
});

export { socket };
