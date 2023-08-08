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
        <form className="flex items-center">
          <label htmlFor="simple-search" className="sr-only">
            Search
          </label>
          <div className="relative w-full">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-6 h-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
                />
              </svg>
            </div>
            <input
              type="text"
              id="simple-search"
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 p-2.5  dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
              placeholder="Search exercise name..."
              required
            />
          </div>
          <button
            type="submit"
            className="p-2.5 ml-2 text-sm font-medium text-white bg-blue-700 rounded-lg border border-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
          >
            <svg
              className="w-4 h-4"
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 20 20"
            >
              <path
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"
              />
            </svg>
            <span className="sr-only">Search</span>
          </button>
        </form>
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
                  onClick={() => router.push(`/exercises/edit?id=${p.id}`)}
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
