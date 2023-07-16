"use client";
import { KeepAwake } from "@capacitor-community/keep-awake";
import { useEffect, useState } from "react";
import {
  HubConnectionBuilder,
  LogLevel,
  HubConnectionState,
} from "@microsoft/signalr";
import { Exercise, Programme, ScreenMapping } from "./types";
import { Preferences } from "@capacitor/preferences";
import Modal from "@/components/modal";
import Loader from "@/components/loader";

export default function Home() {
  const [message, setMessage] = useState("this week 20% off protein shakes");
  const [time, setTime] = useState(0);
  const [mode, setMode] = useState("active");
  const [programme, setProgramme] = useState<Programme | null>(null);
  const [programmeId, setProgrammeId] = useState<string>("");
  const [workout, setWorkout] = useState<ScreenMapping | null>(null);
  const [screen, setScreen] = useState<string>("");
  const [updated, setUpdated] = useState<Date | null>(null);

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
    connection.on("newMessage", (message, mode, workoutId, timeUpdated) => {
      setTime(parseInt(message, 10));
      setMode(mode);
      setProgrammeId(workoutId);
      setUpdated(timeUpdated);
    });

    connection.start();

    return () => {
      if (connection.state === HubConnectionState.Connected) connection.stop();
    };
  }, [setProgrammeId, setMode, setTime, setUpdated]);

  useEffect(() => {
    if (programme && programmeId) {
      if (programmeId !== programme.sourceWorkoutId) {
        fetchProgramme();
      }
    }
  }, [programmeId, programme]);

  useEffect(() => {
    console.log(updated, programme?.lastUpdated);
    if (updated !== programme?.lastUpdated) {
      fetchProgramme();
    }
  }, [updated]);

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
      if (workout) {
        setWorkout(workout);
      }
    }
  }, [screen, programme]);

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
    <main className="h-screen w-screen flex flex-col overflow-hidden bg-gradient-to-r from-gray-200">
      <input
        className="fixed top-2 left-2 w-10 h-10 cursor-pointer z-20"
        onClick={() => setShowModal(true)}
        type="button"
      ></input>
      <div className="grow-0 shrink-0 h-[5vh] ">
        {!workout.splitScreen ? (
          <div className="flex flex-row justify-end items-right w-screen">
            <h2
              className={`text-7xl px-4 leading-1 italic font-hurlant text-black text-center `}
            >
              {workout?.exercise1?.title}
            </h2>
          </div>
        ) : (
          <div className="flex flex-row justify-evenly w-screen">
            <h2
              className={`text-7xl px-4 leading-1 italic font-hurlant text-black text-center `}
            >
              {workout?.exercise1?.title}
            </h2>
            <h2
              className={`text-7xl px-4 leading-1 italic font-hurlant text-black text-center `}
            >
              {workout?.exercise2?.title}
            </h2>
          </div>
        )}
      </div>
      {!workout?.splitScreen ? (
        <div className="grow p-12">
          <div
            data-tap-disable="true"
            className="relative w-full h-full picborder bg-white"
          >
            <video
              className="outline-none p-2 absolute top-1.2 left-1/2 h-full -translate-x-1/2"
              src={workout?.exercise1?.videoUrl}
              autoPlay
              playsInline
              muted
              loop
            />
          </div>
        </div>
      ) : (
        <div className="grow p-12 flex flex-row">
          <div
            data-tap-disable="true"
            className="relative w-1/2 h-full picborder bg-white"
          >
            <video
              className="outline-none p-2 absolute top-1.2 left-1/2 h-full -translate-x-1/2"
              src={workout?.exercise1?.videoUrl}
              autoPlay
              playsInline
              muted
              loop
            />
          </div>
          <div
            data-tap-disable="true"
            className="relative w-1/2 h-full picborder bg-white"
          >
            <video
              className="outline-none p-2 absolute top-1.2 left-1/2 h-full -translate-x-1/2"
              src={workout.exercise2?.videoUrl}
              autoPlay
              playsInline
              muted
              loop
            />
          </div>
        </div>
      )}
      <div className="grow-0 h-[10vh] shrink-0 ">
        <div className="flex flex-row w-full h-full">
          <article className="flex whitespace-no-wrap overflow-x-hidden overflow-y-hidden grow">
            <div className="relative">
              <ul className="flex animate-marquee whitespace-nowrap">
                <li className=" font-extrabold italic  text-bluemain text-6xl mr-10">
                  {programme?.message}
                </li>
                <li className=" font-extrabold italic  text-bluemain text-6xl mr-10">
                  {programme?.message}
                </li>
                <li className=" font-extrabold italic  text-bluemain text-6xl mr-10">
                  {programme?.message}
                </li>
                <li className=" font-extrabold italic  text-bluemain text-6xl mr-10">
                  {programme?.message}
                </li>
                <li className=" font-extrabold italic  text-bluemain text-6xl mr-10">
                  {programme?.message}
                </li>
                <li className=" font-extrabold italic  text-bluemain text-6xl mr-10">
                  {programme?.message}
                </li>
              </ul>
              <ul className="flex absolute top-0 animate-marquee2">
                <li className=" font-extrabold italic  text-bluemain text-6xl mr-10">
                  {programme?.message}
                </li>
                <li className=" font-extrabold italic  text-bluemain text-6xl mr-10">
                  {programme?.message}
                </li>
                <li className=" font-extrabold italic  text-bluemain text-6xl mr-10">
                  {programme?.message}
                </li>
                <li className=" font-extrabold italic  text-bluemain text-6xl mr-10">
                  {programme?.message}
                </li>
                <li className=" font-extrabold italic  text-bluemain text-6xl mr-10">
                  {programme?.message}
                </li>
                <li className=" font-extrabold italic  text-bluemain text-6xl mr-10">
                  {programme?.message}
                </li>
              </ul>
            </div>
          </article>
          <div className="relative w-40 shrink-0 grow-0">
            {mode === "rest" && (
              <aside className="absolute -top-20 left-1/2 -translate-x-1/2 text-blue-700 text-sm text-left">
                rest
              </aside>
            )}
            <div
              className={`text-9xl font-semibold text-center absolute bottom-0 w-full ${
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
      </div>
    </main>
  );
}
