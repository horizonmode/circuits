"use client";
import { useEffect, useState } from "react";
import { Programme } from "../types";
import FileUploadSingle from "@/components/upload";
import Arrow from "../../assets/arrow.svg";
import EditIcon from "../../assets/edit.svg";
import Icon from "@/components/icon";

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
    <main className="flex flex-col items-left align-left ">
      <div className="flex flex-col gap-5 ">
        {programmes.map((p: Programme, i: number) => {
          return activeProgramme === p.id ? (
            <div
              key={`programme-${i}`}
              className="w-full relative lg:w-1/2 h-20 bg-gradient-to-r from-powder to-powder-300 flex align-middle items-center justify-start p-10 rounded-md"
              onClick={() => setNewActive(p.id)}
            >
              <span className="text-lg w-4/5">{p.name}</span>
              <div
                className={`absolute -left-20 bg-no-repeat bg-contain w-20 h-20 top-1/2 -translate-y-1/2 sm:none flex align-middle`}
              >
                <Arrow />
              </div>
              <div className="flex flex-row justify-start gap-2">
                <Icon type="edit" />
                <Icon type="del" />
              </div>
            </div>
          ) : (
            <div
              key={`programme-${i}`}
              className="w-full lg:w-1/2 h-20 bg-gradient-to-r from-gray-400 to-gray-50 flex align-middle items-center justify-start p-10  hover:outline rounded-md"
              onClick={() => setNewActive(p.id)}
            >
              <span className="text-lg w-4/5">{p.name}</span>
              <div className="flex flex-row justify-start gap-2">
                <Icon type="edit" />
                <Icon type="del" />
              </div>
            </div>
          );
        })}
        <div className="w-full relative lg:w-1/2 h-20 flex align-middle justify-center">
          <Icon type="add" />
        </div>
      </div>
    </main>
  );
}
