"use client";
import { useCallback, useEffect, useState } from "react";
import Icon from "@/components/icon";
import { Exercise, ExerciseResult } from "@/app/types";
import Modal from "@/components/modal";
import { useRouter } from "next/navigation";
import DropDown, { DropDownOption } from "@/components/dropdown";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/20/solid";

export default function Admin() {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [selectedExerciseId, setSelectedExerciseId] = useState<string>("");
  const [page, setPage] = useState<number>(0);
  const num = 10;
  const [search, setSearch] = useState<string>("");
  const [category, setCategory] = useState<string>("back");
  const [totalCount, setTotalCount] = useState<number>(0);

  const fetchExercises = async () => {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/${
        search ? "searchEx" : "exercise"
      }?code=${
        process.env.NEXT_PUBLIC_API_KEY
      }&num=${num}&page=${page}&category=${category}${
        search && "&search=" + encodeURIComponent(search)
      }`
    );
    const data = (await res.json()) as ExerciseResult;
    setExercises(data.results);
    setTotalCount(data.count);
  };
  useEffect(() => {
    fetchExercises();
  }, [num, page, category]);

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
        <form
          className="flex items-center"
          onSubmit={(e) => {
            e.preventDefault();
            fetchExercises();
          }}
        >
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
              value={search}
              onChange={(e) => {
                e.preventDefault();
                setSearch(e.target.value);
              }}
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
        <div className="w-full md:w-1/2 ">
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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          {exercises
            .sort((a: Exercise, b: Exercise) => (a.name > b.name ? 1 : -1))
            .map((p: Exercise, i: number) => (
              <div
                key={`exercise-${i}`}
                className="shadow-md w-full relative bg-gradient-to-r from-powder to-powder-300 flex align-middle items-center justify-start p-5 rounded-md"
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
        </div>
        <div className="w-full relative h-20 flex align-middle justify-center">
          <Icon type="add" onClick={() => router.push(`/exercises/create`)} />
        </div>
        <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6">
          <div className="flex flex-1 justify-between sm:hidden">
            <button
              disabled={page === 0}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                if (page === 0) return;
                setPage((p) => p - 1);
              }}
              className="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Previous
            </button>
            <button
              disabled={page + 1 >= Math.ceil(totalCount / num)}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                if (page + 1 < Math.ceil(totalCount / num))
                  setPage((p) => p + 1);
              }}
              className="relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Next
            </button>
          </div>
          <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Showing <span className="font-medium">{page * num}</span> to{" "}
                <span className="font-medium">{page * num + num}</span> of{" "}
                <span className="font-medium">{totalCount}</span> results
              </p>
            </div>
            <div>
              <nav
                className="isolate inline-flex -space-x-px rounded-md shadow-sm"
                aria-label="Pagination"
              >
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();

                    if (page > 0) setPage((p) => p - 1);
                  }}
                  className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0"
                >
                  <span className="sr-only">Previous</span>
                  <ChevronLeftIcon className="h-5 w-5" aria-hidden="true" />
                </button>
                {[
                  ...Array(Math.max(Math.ceil(totalCount / num), 1)).keys(),
                ].map((k: number, i: number) => (
                  <button
                    key={`page-${i}`}
                    aria-current="page"
                    onClick={(e) => {
                      e.preventDefault();
                      setPage(k);
                    }}
                    className={
                      page === k
                        ? "relative z-10 inline-flex items-center bg-indigo-600 px-4 py-2 text-sm font-semibold text-white focus:z-20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                        : "relative inline-flex items-center px-4 py-2 text-sm font-semibold text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0"
                    }
                  >
                    {k}
                  </button>
                ))}
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    if (page + 1 < Math.ceil(totalCount / num))
                      setPage((p) => p + 1);
                  }}
                  className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0"
                >
                  <span className="sr-only">Next</span>
                  <ChevronRightIcon className="h-5 w-5" aria-hidden="true" />
                </button>
              </nav>
            </div>
          </div>
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
