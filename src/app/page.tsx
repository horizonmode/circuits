"use client";
import { KeepAwake } from "@capacitor-community/keep-awake";
import { useEffect, useState } from "react";
import {
  HubConnectionBuilder,
  LogLevel,
  HubConnectionState,
} from "@microsoft/signalr";

export default function Home() {
  const [message, setMessage] = useState("this week 20% off protein shakes");
  const [time, setTime] = useState(0);
  const [mode, setMode] = useState("active");
  useEffect(() => {
    const initKeepAwake = async () => {
      const result = await KeepAwake.isSupported();
      if (result) {
        console.log("setting keep awake");
        await KeepAwake.keepAwake();
      }
    };

    initKeepAwake();

    const connection = new HubConnectionBuilder()
      .withUrl(`${process.env.NEXT_PUBLIC_API_URL}/api`)
      .configureLogging(LogLevel.Information)
      .build();
    connection.on("newMessage", (message, mode) => {
      setTime(parseInt(message, 10));
      setMode(mode);
    });

    connection.start();

    return () => {
      if (connection.state === HubConnectionState.Connected) connection.stop();
    };
  }, []);

  return (
    <main className="flex min-h-screen max-h-screen flex-col items-center align-middle justify-center bg-gradient-to-r from-gray-200">
      <div className="fixed z-10 flex flex-col justify-center items-right top-0 w-screen">
        <h2
          className={`pr-3 pt-3 text-6xl font-semibold text-center w-full text-slate-500`}
        >
          Back and Shoulders Stretch
        </h2>
      </div>
      <div
        data-tap-disable="true"
        className="w-screen flex flex-row items-center justify-center"
      >
        <video
          className="h-screen outline-none"
          style={{ clipPath: "inset(1px 1px);" }}
          src="https://tiktokvideos.blob.core.windows.net/videos/Back and Shoulders Stretch_female_1_1.mp4"
          autoPlay
          playsInline
          muted
          loop
        />
      </div>

      <div className="fixed flex flex-row bottom-0 w-screen ">
        <div className="grow flex-col flex align-middle justify-center bg-gradient-to-r from-indigo-500">
          <div className="relative flex overflow-hidden w-full">
            <div className="animate-marquee whitespace-nowrap">
              <span className="text-4xl mx-4">{message}</span>
            </div>
          </div>
        </div>
        <div className="relative w-40 flex-none">
          {mode === "rest" && (
            <aside className="absolute -top-4 left-1/2 -translate-x-1/2 text-blue-700 text-sm text-left">
              rest
            </aside>
          )}
          <div
            className={`text-9xl font-semibold text-center ${
              mode === "active" ? "text-green-700" : "text-blue-700"
            }`}
          >
            {time}
          </div>
        </div>
      </div>
    </main>
  );
}
