"use client";
import { useEffect, useState } from "react";
import Icon from "@/components/icon";
import { Exercise } from "@/app/types";
import Link from "next/link";
import Modal from "@/components/modal";

export default function Admin() {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [selectedExerciseId, setSelectedExerciseId] = useState<string>("");
  const fetchExercises = async () => {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/exercise`);
    const data = await res.json();
    setExercises(data);
  };
  useEffect(() => {
    fetchExercises();
  }, []);

  const deleteExercise = async (id: string) => {
    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/exercise/${id}`, {
      method: "DELETE",
    });
    await fetchExercises();
  };

  const selectForDelete = (id: string) => {
    setSelectedExerciseId(id);
    setShowModal(true);
  };

  return (
    <main className="flex flex-col items-left align-left ">
      <div className="flex flex-col gap-5 ">
        {exercises.map((p: Exercise, i: number) => (
          <div
            key={`exercise-${i}`}
            className="w-full relative lg:w-1/2 h-20 bg-gradient-to-r from-powder to-powder-300 flex align-middle items-center justify-start p-10 rounded-md"
          >
            <span className="text-lg w-4/5">{p.name}</span>
            <div
              className={`absolute -left-20 bg-no-repeat bg-contain w-20 h-20 top-1/2 -translate-y-1/2 sm:none flex align-middle`}
            ></div>
            <div className="flex flex-row justify-start gap-2">
              <Link
                href={{
                  pathname: `/admin/exercises/edit/${p.id}`,
                }}
              >
                <Icon type="edit" />
              </Link>
              <Icon type="del" onClick={() => selectForDelete(p.id)} />
            </div>
          </div>
        ))}
        <div className="w-full relative lg:w-1/2 h-20 flex align-middle justify-center">
          <Link
            href={{
              pathname: `/admin/exercises/create`,
            }}
          >
            <Icon type="add" />
          </Link>
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
