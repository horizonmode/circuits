"use client";
import { useEffect, useState } from "react";
import { Programme } from "../types";
import FileUploadSingle from "@/components/upload";

export default function Admin() {
  const [programmes, setProgrammes] = useState<Programme[]>([]);
  const [activeProgramme, setActiveProgramme] = useState<string>("");
  useEffect(() => {
    const fetchProgrammes = async () => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/programme`
      );
      const data = await res.json();
      setProgrammes(data);
    };

    const fetchActiveProgramme = async () => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/programme/getActive`
      );
      const data = await res.json();
      setActiveProgramme(data.sourceWorkoutId);
    };

    fetchProgrammes();
    fetchActiveProgramme();
  }, []);

  const setNewActive = (workoutId: string) => {
    const send = async () => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/programme/setActive/${workoutId}`
      );
      const data = await res.json();
      console.log(workoutId);
      setActiveProgramme(workoutId);
    };

    send();
  };

  return (
    <main className="flex flex-col items-left align-left bg-gradient-to-r from-gray-200">
      <h1>Programmes</h1>
      <div className="flex flex-col gap-5">
        {programmes.map((p: Programme, i: number) => {
          return (
            <div
              className="w-40 h-10 bg-gray-400"
              onClick={() => setNewActive(p.id)}
            >
              {p.name}
              {p.id === activeProgramme && <div>ACTIVE</div>}
            </div>
          );
        })}
      </div>
      <FileUploadSingle />
    </main>
  );
}
