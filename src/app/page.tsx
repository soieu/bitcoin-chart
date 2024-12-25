"use client";

import { useEffect, useState } from "react";
import { socket } from "../socket";

export default function Home() {
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    function onOpen() {
      setIsConnected(true);
    }

    function onClose() {
      setIsConnected(false);
    }

    socket.addEventListener("open", onOpen);
    socket.addEventListener("close", onClose);

    return () => {
      socket.removeEventListener("open", onOpen);
      socket.removeEventListener("close", onClose);
    };
  }, []);

  return (
    <div>
      <p>Status: {isConnected ? "connected" : "disconnected"}</p>
    </div>
  );
}
