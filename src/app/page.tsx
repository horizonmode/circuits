"use client";
import { useEffect, useState } from "react";
import { Programme } from "./types";
import Arrow from "../assets/arrow.svg";
import Icon from "@/components/icon";
import Modal from "@/components/modal";
import { useRouter } from "next/navigation";
import Loader from "@/components/loader";
import { Badge, Card, Title } from "@tremor/react";
import { WifiIcon } from "@heroicons/react/24/outline";
import { Icon as TremorIcon } from "@tremor/react";

export default function Admin() {
  const [programmes, setProgrammes] = useState<Programme[]>([]);
  const [activeProgramme, setActiveProgramme] = useState<string>("");
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchProgrammes = async () => {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/programme?code=${process.env.NEXT_PUBLIC_API_KEY}`
    );
    const data = await res.json();
    setProgrammes(data);
  };

  const fetchActiveProgramme = async () => {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/programme/getActive?code=${process.env.NEXT_PUBLIC_API_KEY}`
    );
    if (!res.ok) return;
    const data = await res.json();
    setActiveProgramme(data.sourceWorkoutId);
    setIsPlaying(data.isPlaying);
  };

  useEffect(() => {
    setLoading(true);
    fetchProgrammes();
    fetchActiveProgramme();
    setLoading(false);
  }, []);

  const setNewActive = (workoutId: string, isPlaying: boolean) => {
    if (!workoutId) return;
    const send = async () => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/programme/setActive/${workoutId}?code=${process.env.NEXT_PUBLIC_API_KEY}&isPlaying=${isPlaying}`
      );
      const data = await res.json();
      const programme = programmes.find((p) => p.id === workoutId);
      if (programme) {
        setIsPlaying(isPlaying);
        setActiveProgramme(programme.id);
      }
    };

    send();
  };

  const deleteProgramme = async (id: string) => {
    await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/programme/${id}?code=${process.env.NEXT_PUBLIC_API_KEY}`,
      {
        method: "DELETE",
      }
    );
    await fetchProgrammes();
    await fetchActiveProgramme();
  };

  const [showModal, setShowModal] = useState<boolean>(false);
  const [selectedProgrammeId, setSelectedProgrammeId] = useState<string>("");

  const selectForDelete = (id: string) => {
    setSelectedProgrammeId(id);
    setShowModal(true);
  };

  const router = useRouter();
  console.log(activeProgramme);
  return (
    <main className="flex flex-col items-left align-left bg-tremor-background-muted">
      {loading ? (
        <Loader />
      ) : (
        <div className="flex flex-col gap-5 ">
          {programmes
            .filter((p) => p.id !== "active")
            .map((p: Programme, i: number) => (
              <Card
                decoration="left"
                decorationColor={`${
                  activeProgramme === p.id ? "indigo" : "slate"
                }`}
                key={`programme-${i}`}
                className={`shadow-md w-full relative lg:w-1/2 h-20 bg-gradient-to-r flex align-middle items-center justify-start p-10 rounded-md ${
                  activeProgramme === p.id
                    ? " from-powder to-powder-300"
                    : " from-gray-400 to-gray-50"
                }`}
              >
                <Title className="flex-1">{p.name}</Title>
                <div className="flex flex-row justify-start gap-2">
                  {activeProgramme === p.id && (
                    <Badge icon={WifiIcon}>live</Badge>
                  )}

                  <Icon
                    type={`${
                      activeProgramme === p.id && isPlaying ? "pause" : "play"
                    }`}
                    onClick={() =>
                      setNewActive(
                        p.id,
                        p.id === activeProgramme ? !isPlaying : true
                      )
                    }
                  />
                  <Icon
                    type="edit"
                    onClick={() => router.push(`/programmes/edit/?id=${p.id}`)}
                  />
                  <Icon type="del" onClick={() => selectForDelete(p.id)} />
                </div>
              </Card>
            ))}
          <div className="w-full relative lg:w-1/2 h-20 flex align-middle justify-center">
            <Icon
              type="add"
              onClick={() => router.push(`/programmes/create`)}
            />
          </div>
        </div>
      )}
      {showModal && (
        <Modal
          happy={false}
          title="are you sure"
          okText="Yes"
          showCancel={true}
          onAccept={() => {
            deleteProgramme(selectedProgrammeId);
            setShowModal(false);
          }}
          onCancel={() => {
            setShowModal(false);
            setSelectedProgrammeId("");
          }}
        >
          <div>Are you sure you want to delete this programme?</div>
        </Modal>
      )}
    </main>
  );
}
