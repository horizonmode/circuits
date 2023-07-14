"use client";
import { KeepAwake } from "@capacitor-community/keep-awake";
import { useEffect, useState } from "react";
import {
  HubConnectionBuilder,
  LogLevel,
  HubConnectionState,
} from "@microsoft/signalr";
import { Exercise, Programme } from "./types";
import { Preferences } from "@capacitor/preferences";
import Modal from "@/components/modal";
import Loader from "@/components/loader";

export default function Home() {
  const [message, setMessage] = useState("this week 20% off protein shakes");
  const [time, setTime] = useState(0);
  const [mode, setMode] = useState("active");
  const [programme, setProgramme] = useState<Programme | null>(null);
  const [programmeId, setProgrammeId] = useState<string>("");
  const [workout, setWorkout] = useState<Exercise | null>(null);
  const [screen, setScreen] = useState<string>("");

  useEffect(() => {
    const initKeepAwake = async () => {
      const result = await KeepAwake.isSupported();
      if (result) {
        console.log("setting keep awake");
        await KeepAwake.keepAwake();
      }
    };

    initKeepAwake();
  }, []);

  useEffect(() => {
    const connection = new HubConnectionBuilder()
      .withUrl(`${process.env.NEXT_PUBLIC_API_URL}/api`)
      .configureLogging(LogLevel.Information)
      .build();
    connection.on("newMessage", (message, mode, workoutId) => {
      setTime(parseInt(message, 10));
      setMode(mode);
      setProgrammeId(workoutId);
      console.log(message, mode, workoutId);
    });

    connection.start();

    return () => {
      if (connection.state === HubConnectionState.Connected) connection.stop();
    };
  }, [setProgrammeId, setMode, setTime]);

  useEffect(() => {
    if (programme && programmeId) {
      if (programmeId !== programme.sourceWorkoutId) {
        console.log(programmeId, programme.sourceWorkoutId);
        fetchProgramme();
      }
    }
  }, [programmeId, programme]);

  const SetScreenStore = async (screenTag: string) => {
    await Preferences.set({
      key: "screen",
      value: screenTag,
    });
  };

  const GetScreen = async () => {
    const ret = await Preferences.get({ key: "screen" });
    return ret.value;
  };

  useEffect(() => {
    if (programme) {
      const workout = programme.mappings.find((m) => m.screen.tag === screen);
      if (workout) setWorkout(workout.exercise1);
    }
  }, [screen]);

  useEffect(() => {
    const setupScreen = async () => {
      let screen = await GetScreen();
      if (!screen) {
        screen = "screen1";
        await SetScreenStore(screen);
      }
      setScreen(screen);
    };
    if (programme) setupScreen();
  }, [programme]);

  const fetchProgramme = async () => {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/programme/getActive?code=${process.env.NEXT_PUBLIC_API_KEY}`
    );
    const progJson = (await res.json()) as Programme;
    setProgramme(progJson);
  };

  useEffect(() => {
    fetchProgramme();
  }, []);

  const [showModal, setShowModal] = useState<boolean>(false);

  return !workout ? (
    <Loader />
  ) : (
    <main className="flex min-h-screen max-h-screen flex-col items-center align-middle justify-center bg-gradient-to-r from-gray-200">
      <input
        className="fixed top-2 right-2 w-10 h-10 cursor-pointer z-20"
        onClick={() => setShowModal(true)}
        type="button"
      ></input>
      <div className="fixed z-10 flex flex-col justify-center items-right top-0 w-screen">
        <h2
          className={`pr-3 pt-3 text-6xl font-semibold text-center w-full text-slate-500`}
        >
          {workout?.name}
        </h2>
      </div>
      <div
        data-tap-disable="true"
        className="w-screen flex flex-row items-center justify-center"
      >
        <video
          className="h-screen outline-none"
          src={workout?.videoUrl}
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
      {showModal && (
        <Modal
          happy={true}
          title="Select Screen"
          onAccept={() => setShowModal(false)}
          onCancel={() => setShowModal(false)}
        >
          <select
            name="screen"
            onChange={(e) => {
              console.log(e.target.value);
              setScreen(e.target.value);
            }}
          >
            <option>screen1</option>
            <option>screen2</option>
            <option>screen3</option>
            <option>screen4</option>
            <option>screen5</option>
          </select>
        </Modal>
      )}
    </main>
  );
}
