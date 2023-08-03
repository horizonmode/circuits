"use client";
import { useCallback, useEffect, useState } from "react";
import Icon from "@/components/icon";
import { Exercise } from "@/app/types";
import Modal from "@/components/modal";
import { useRouter } from "next/navigation";
import DropDown, { DropDownOption } from "@/components/dropdown";

export default function Admin() {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [selectedExerciseId, setSelectedExerciseId] = useState<string>("");
  const fetchExercises = async () => {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/exercise?code=${process.env.NEXT_PUBLIC_API_KEY}`
    );
    const data = await res.json();
    setExercises(data);
  };
  useEffect(() => {
    fetchExercises();
  }, []);

  const deleteExercise = async (id: string) => {
    await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/exercise/${id}?code=${process.env.NEXT_PUBLIC_API_KEY}`,
      {
        method: "DELETE",
      }
    );
    await fetchExercises();
  };

  const selectForDelete = (id: string) => {
    setSelectedExerciseId(id);
    setShowModal(true);
  };

  const router = useRouter();

  const OnFilterDropdownChange = useCallback(
    (e: string) => {
      setCategory(e);
    },
    [exercises]
  );

  const [category, setCategory] = useState<string>("back");

  const categoryOptions: DropDownOption[] = [
    {
      value: "back",
      label: "back",
    },
    {
      value: "legs",
      label: "legs",
    },
    {
      value: "abs",
      label: "abs",
    },
  ];

  return (
    <main className="flex flex-col items-left align-left ">
      <div className="flex flex-col gap-5 ">
        <div className=" w-full md:w-1/2 ">
          <DropDown
            onChange={(e) => {
              OnFilterDropdownChange(e.target.value);
            }}
            value={category}
            label="Category Filter"
            options={categoryOptions}
            id="category"
            showDefault={false}
          />
        </div>
        {exercises
          .filter((e) => category === "none" || e.category === category)
          ?.sort((a: Exercise, b: Exercise) => (a.name > b.name ? 1 : -1))
          .map((p: Exercise, i: number) => (
            <div
              key={`exercise-${i}`}
              className="w-full relative lg:w-1/2 bg-gradient-to-r from-powder to-powder-300 flex align-middle items-center justify-start p-5 rounded-md"
            >
              <div className={`w-full flex flex-col pr-5 gap-5`}>
                <span className="text-lg w-100">{p.name.toLowerCase()}</span>
                <video controls src={p.videoUrl} preload="thumbnail"></video>
              </div>
              <div className="flex flex-row justify-start gap-2">
                <Icon type="open" onClick={() => window.open(p.videoUrl)} />
                <Icon
                  type="edit"
                  onClick={() => router.push(`/exercises/edit/${p.id}`)}
                />
                <Icon type="del" onClick={() => selectForDelete(p.id)} />
              </div>
            </div>
          ))}
        <div className="w-full relative lg:w-1/2 h-20 flex align-middle justify-center">
          <Icon type="add" onClick={() => router.push(`/exercises/create`)} />
        </div>
      </div>
      {showModal && (
        <Modal
          happy={false}
          title="are you sure"
          okText="Yes"
          showCancel={true}
          onAccept={() => {
            deleteExercise(selectedExerciseId);
            setShowModal(false);
          }}
          onCancel={() => {
            setShowModal(false);
            setSelectedExerciseId("");
          }}
        >
          <div>Are you sure you want to delete this exercise?</div>
        </Modal>
      )}
    </main>
  );
}
