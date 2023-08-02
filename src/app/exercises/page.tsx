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

  const [category, setCategory] = useState<string>("none");

  const categoryOptions: DropDownOption[] = [
    {
      value: "0",
      label: "back",
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
            defaultOption="All"
          />
        </div>
        {exercises
          .filter((e) => category === "none" || e.category === category)
          .map((p: Exercise, i: number) => (
            <div
              key={`exercise-${i}`}
              className="w-full relative lg:w-1/2 h-20 bg-gradient-to-r from-powder to-powder-300 flex align-middle items-center justify-start p-10 rounded-md"
            >
              <span className="text-lg w-4/5">{p.name}</span>
              <div
                className={`absolute -left-20 bg-no-repeat bg-contain w-20 h-20 top-1/2 -translate-y-1/2 sm:none flex align-middle`}
              ></div>
              <div className="flex flex-row justify-start gap-2">
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
