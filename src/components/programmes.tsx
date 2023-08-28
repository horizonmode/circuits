import {
  ChangeEvent,
  FormEvent,
  useCallback,
  useEffect,
  useState,
} from "react";
import Modal from "./modal";
import {
  Exercise,
  ExerciseResult,
  Programme,
  ScreenMapping,
} from "@/app/types";
import Loader from "./loader";
import Link from "next/link";
import Icon from "./icon";
import ScreenMap from "./screenMap";
import { useRouter } from "next/navigation";
import DropDown, { DropDownOption } from "./dropdown";
import { Card } from "@tremor/react";

export type SubmitStatus = "success" | "failed" | "waiting" | "submitting";

export interface ProgrammeFormProps {
  programmeId: string | null;
}
export default function ProgrammeForm({ programmeId }: ProgrammeFormProps) {
  const [showFormModal, setFormShowModal] = useState<boolean>(false);
  const [showDeleteModal, setDeleteShowModal] = useState<boolean>(false);
  const [name, setName] = useState<string>("");
  const [activeTime, setActiveTime] = useState<number>(0);
  const [restTime, setRestTime] = useState<number>(0);
  const [message, setMessage] = useState<string>("");
  const mode = programmeId ? "edit" : "create";

  const [submitStatus, setSubmitStatus] = useState<SubmitStatus>("waiting");
  const [loading, setLoading] = useState<boolean>(true);

  const [programme, setProgramme] = useState<Programme | null>(null);

  const [page, setPage] = useState<number>(0);
  const num = 10;
  const [search, setSearch] = useState<string>("");
  const [totalCount, setTotalCount] = useState<number>(0);

  useEffect(() => {
    const fetchProgramme = async () => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/programme/${programmeId}?code=${process.env.NEXT_PUBLIC_API_KEY}`
      );
      const data = await res.json();
      setProgramme(data);
      setLoading(false);
    };

    if (programmeId) {
      fetchProgramme();
    } else {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (programme) {
      setName(programme.name);
      setActiveTime(programme.activeTime);
      setRestTime(programme.restTime);
      setMessage(programme.message || "");
      setScreenMaps(programme.mappings);
    }
  }, [programme, setActiveTime]);

  const submitData = async (values: Programme) => {
    const url =
      `${process.env.NEXT_PUBLIC_API_URL}/api/programme` +
      (mode === "edit" ? `/${values.id}` : "") +
      `?code=${process.env.NEXT_PUBLIC_API_KEY}`;
    const res = await fetch(url, {
      method: mode === "create" ? "POST" : "PUT",
      body: JSON.stringify(values),
    });
    if (!res.ok) {
      setSubmitStatus("failed");
    } else {
      setSubmitStatus("success");
    }
  };

  const onSubmitForm = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitStatus("submitting");

    const values: Programme = {
      name,
      activeTime,
      restTime,
      message,
      id: programmeId || "",
      sourceWorkoutId: "",
      mappings: screenMaps,
      lastUpdated: new Date(),
      isPlaying: true,
    };

    await submitData(values);
  };

  useEffect(() => {
    if (submitStatus === "success" || submitStatus === "failed") {
      setFormShowModal(true);
    }
  }, [submitStatus]);

  const onInputChange = (
    name: string,
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    switch (name) {
      case "name":
        setName((e.target as any).value);
        break;
      case "activeTime":
        setActiveTime((e.target as any).value);
        break;
      case "restTime":
        setRestTime((e.target as any).value);
        break;
      case "message": {
        setMessage((e.target as any).value);
        break;
      }
    }
  };

  const [screenMaps, setScreenMaps] = useState<ScreenMapping[]>([]);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [selectedScreenMapId, setselectedScreenMapId] = useState<number>(-1);

  const onScreenMapChange = useCallback(
    (index: number, name: string, e: string | boolean) => {
      switch (name) {
        case "split-screen":
          {
            setScreenMaps((s) => {
              const newMaps = [...s];
              newMaps[index].splitScreen = e as boolean;
              return newMaps;
            });
          }

          break;
        case "exercise-1":
          setScreenMaps((s) => {
            const newMaps = [...s];
            newMaps[index].exercise1 =
              exercises.find((ex) => ex.id === e) || null;
            return newMaps;
          });
          break;
        case "exercise-2": {
          setScreenMaps((s) => {
            const newMaps = [...s];
            newMaps[index].exercise2 =
              exercises.find((ex) => ex.id === e) || null;
            return newMaps;
          });
          break;
        }
        case "show-timer": {
          setScreenMaps((s) => {
            const newMaps = [...s];
            newMaps[index].showTimer = e as boolean;
            return newMaps;
          });
          break;
        }
        case "screen-title-1": {
          setScreenMaps((s) => {
            const newMaps = [...s];
            newMaps[index].screenTitle1 = e as string;
            return newMaps;
          });
          break;
        }
        case "screen-title-2": {
          setScreenMaps((s) => {
            const newMaps = [...s];
            newMaps[index].screenTitle2 = e as string;
            return newMaps;
          });
          break;
        }
      }
    },
    [exercises, setScreenMaps]
  );

  const submitting = submitStatus === "submitting";

  const addScreen = () => {
    setScreenMaps((s: ScreenMapping[]) => [
      ...s,
      {
        screen: {
          tag: `screen${s.length + 1}`,
        },
        splitScreen: false,
        exercise1: null,
        exercise2: null,
      } as ScreenMapping,
    ]);
  };

  const [category, setCategory] = useState<string>("back");

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
    setPage(0);
  }, [category, search]);

  useEffect(() => {
    fetchExercises();
  }, [num, page, category]);

  const exerciseOptions = exercises
    ?.sort((a: Exercise, b: Exercise) =>
      a.name.toLowerCase() > b.name.toLowerCase() ? 1 : -1
    )
    .map((e) => ({
      value: e.id,
      label: e.name.toLowerCase(),
    }));

  const router = useRouter();

  const selectForDelete = (index: number) => {
    setselectedScreenMapId(index);
    setDeleteShowModal(true);
  };

  const deleteScreenMap = (index: number) => {
    setScreenMaps((s) => s.filter((_, i) => i !== index));
  };

  const [showExDrawer, setShowExDrawer] = useState(false);

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
    {
      value: "biceps",
      label: "biceps",
    },
    {
      value: "cardio",
      label: "cardio",
    },
    {
      value: "chest",
      label: "chest",
    },
    {
      value: "forearms",
      label: "forearms",
    },
    {
      value: "powerlifting",
      label: "powerlifting",
    },
    {
      value: "shoulders",
      label: "shoulders",
    },
    {
      value: "stretching",
      label: "stretching",
    },
    {
      value: "triceps",
      label: "triceps",
    },
  ];

  const OnFilterDropdownChange = useCallback(
    (e: string) => {
      setCategory(e);
    },
    [exercises]
  );

  interface selectedEx {
    screenMapIndex: number;
    exIndex: number;
  }

  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(
    null
  );

  const [selectedExerciseForEdit, setSelectedExerciseForEdit] =
    useState<selectedEx | null>(null);

  const OnScreenMapExEdit = (screenMapIndex: number, exIndex: number) => {
    setSelectedExerciseForEdit({ screenMapIndex, exIndex });
    setShowExDrawer(true);
  };

  useEffect(() => {
    if (showExDrawer) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
  }, [showExDrawer]);

  const updateExercise = () => {
    if (selectedExerciseForEdit) {
      const newMaps = [...screenMaps];
      const map = newMaps[selectedExerciseForEdit?.screenMapIndex];
      if (selectedExerciseForEdit.exIndex === 1) {
        map.exercise1 = selectedExercise;
      } else {
        map.exercise2 = selectedExercise;
      }
      setScreenMaps(newMaps);
    }
  };

  useEffect(() => {
    setPage(0);
  }, [category]);

  return loading ? (
    <Loader />
  ) : (
    <form onSubmit={(e) => onSubmitForm(e)}>
      <div
        className={`space-y-12 ${showExDrawer && "pointer-events-none filter"}`}
        style={{ filter: showExDrawer ? "blur(1px)" : "none" }}
      >
        <div className="border-b border-gray-900/10 pb-12">
          <div className="grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
            <Card className="col-span-6 lg:col-span-3">
              <label
                htmlFor="name"
                className="block text-sm font-medium leading-6 text-gray-900"
              >
                Name
              </label>
              <div className="mt-2">
                <div className="flex rounded-md shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-600 sm:max-w-md">
                  <span className="flex select-none items-center pl-3 text-gray-500 sm:text-sm"></span>
                  <input
                    type="text"
                    name="name"
                    id="name"
                    autoComplete="name"
                    className="block flex-1 border-0 bg-transparent py-1.5 pl-1 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm sm:leading-6"
                    placeholder="workout name"
                    required
                    value={name}
                    onChange={(e) => onInputChange("name", e)}
                  />
                </div>
              </div>
              <div className="col-span-6 lg:col-span-3">
                <label
                  htmlFor="name"
                  className="block text-sm font-medium leading-6 text-gray-900"
                >
                  Active Time
                </label>
                <div className="mt-2">
                  <div className="flex rounded-md shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-600 sm:max-w-md">
                    <span className="flex select-none items-center pl-3 text-gray-500 sm:text-sm"></span>
                    <input
                      type="number"
                      name="activeTime"
                      id="activeTime"
                      autoComplete="activeTime"
                      className="block flex-1 border-0 bg-transparent py-1.5 pl-1 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm sm:leading-6"
                      placeholder="0"
                      required
                      value={activeTime}
                      onChange={(e) => onInputChange("activeTime", e)}
                    />
                  </div>
                </div>
              </div>
              <div className="col-span-6 lg:col-span-3">
                <label
                  htmlFor="name"
                  className="block text-sm font-medium leading-6 text-gray-900"
                >
                  Rest Time
                </label>
                <div className="mt-2">
                  <div className="flex rounded-md shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-600 sm:max-w-md">
                    <span className="flex select-none items-center pl-3 text-gray-500 sm:text-sm"></span>
                    <input
                      type="number"
                      name="restTime"
                      id="restTime"
                      autoComplete="restTime"
                      className="block flex-1 border-0 bg-transparent py-1.5 pl-1 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm sm:leading-6"
                      placeholder="0"
                      required
                      value={restTime}
                      onChange={(e) => onInputChange("restTime", e)}
                    />
                  </div>
                </div>
              </div>
            </Card>
            <Card className="col-span-6 lg:col-span-3">
              <label
                htmlFor="about"
                className="block text-sm font-medium leading-6 text-gray-900"
              >
                Message
              </label>
              <div className="mt-2">
                <textarea
                  id="message"
                  name="message"
                  value={message}
                  rows={3}
                  className="block w-full rounded-md border-0 py-1.5 px-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                  onChange={(e) => onInputChange("message", e)}
                />
              </div>
              <p className="mt-3 text-sm leading-6 text-gray-600">
                Write a message to run across the banner.
              </p>
            </Card>
            <div className="col-span-6">
              <label className="block text-sm font-medium leading-6 text-gray-900">
                Screens
              </label>
              {screenMaps.map((s, i) => (
                <ScreenMap
                  index={i}
                  key={`screenmap-${i}`}
                  screenMap={s}
                  exerciseOptions={exerciseOptions}
                  onChange={(name, e) => {
                    onScreenMapChange(i, name, e);
                  }}
                  onDelete={() => selectForDelete(i)}
                  showDelete={i === screenMaps.length - 1}
                  onExerciseEdit={(ex) => OnScreenMapExEdit(i, ex)}
                  selectedEx={
                    selectedExerciseForEdit?.screenMapIndex === i
                      ? selectedExerciseForEdit.exIndex
                      : null
                  }
                />
              ))}
              <div className="w-full relative h-20 flex align-middle justify-center">
                <Icon
                  type="add"
                  onClick={() => {
                    addScreen();
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 flex items-center justify-end gap-x-6">
        {submitting && <Loader />}
        <Link
          href="/"
          className="text-sm font-semibold leading-6 text-gray-900"
        >
          Back
        </Link>

        <button
          disabled={submitting}
          type="submit"
          className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
        >
          Save
        </button>
      </div>
      {showFormModal && (
        <Modal
          title="Form Result"
          onAccept={() => {
            setFormShowModal(false);
            submitStatus === "success" && router.push("/");
          }}
          onCancel={() => setFormShowModal(false)}
          happy={submitStatus === "success"}
        >
          <div>
            {submitStatus === "success" ? "Submit Success" : "Submit Failed"}
          </div>
        </Modal>
      )}
      {showDeleteModal && (
        <Modal
          happy={false}
          title="are you sure"
          okText="Yes"
          showCancel={true}
          onAccept={() => {
            deleteScreenMap(selectedScreenMapId);
            setDeleteShowModal(false);
          }}
          onCancel={() => {
            setDeleteShowModal(false);
            setselectedScreenMapId(-1);
          }}
        >
          <div>Are you sure you want to delete this exercise?</div>
        </Modal>
      )}
      <div className="flex">
        <div
          className={`fixed top-0 right-0 z-20 w-80 h-full transition-all duration-500 transform bg-white shadow-lg flex flex-col ${
            !showExDrawer && "translate-x-full"
          }`}
        >
          <div className="sticky self-start top-0 bg-white z-20 flex flex-col gap-2 p-3">
            <h2 className="text-lg font-semibold">Exercises</h2>
            <form
              id="search"
              name="search"
              className="flex items-center"
              onSubmit={(e) => {
                e.preventDefault();
                e.stopPropagation();
                fetchExercises();
              }}
            >
              <label htmlFor="simple-search" className="sr-only">
                Search
              </label>
              <div className="relative w-full">
                <input
                  form="search"
                  type="text"
                  id="simple-search"
                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full pl-2 p-2.5 "
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
                form="search"
                onClick={(e) => {
                  e.preventDefault();
                  fetchExercises();
                }}
                className="p-2.5 ml-2 text-sm font-medium text-white bg-blue-700 rounded-lg border border-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300"
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
            <div className="flex flex-1 justify-between gap-2">
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
              <span className="text-xs">
                Showing <span className="text-xs">{page * num}</span> to{" "}
                <span className="text-xs">
                  {Math.min(page * num + num, totalCount)}
                </span>{" "}
                of <span className="text-xs">{totalCount}</span> results
              </span>
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
            <button
              onClick={() => {
                updateExercise();
                setShowExDrawer(false);
                setSelectedExerciseForEdit(null);
                setSelectedExercise(null);
              }}
              type="button"
              className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            >
              Save
            </button>
            <button
              onClick={() => {
                setShowExDrawer(false);
                setSelectedExerciseForEdit(null);
                setSelectedExercise(null);
              }}
              type="button"
              className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
            >
              Cancel
            </button>
          </div>
          <div className="p-1 overflow-y-auto overflow-x-hidden max-h-full m-4 flex flex-col gap-2 ">
            {exercises
              ?.sort((a: Exercise, b: Exercise) => (a.name > b.name ? 1 : -1))
              .map((p: Exercise, i: number) => (
                <Card
                  key={`exercise-${i}`}
                  className={`w-full relative bg-gradient-to-r from-powder to-powder-300 flex align-middle items-center justify-start p-3 rounded-md ${
                    selectedExercise?.id === p.id
                      ? "outline outline-3 outline-blue-700"
                      : ""
                  }`}
                  onClick={() => {
                    setSelectedExercise(p);
                  }}
                >
                  <div className={`w-full flex flex-col gap-5`}>
                    <span className="text-md w-100">
                      {p.name.toLowerCase()}
                    </span>
                    <video
                      controls
                      src={p.videoUrl}
                      preload="metadata"
                      playsInline
                      muted
                    ></video>
                  </div>
                </Card>
              ))}
          </div>
        </div>
      </div>
    </form>
  );
}
