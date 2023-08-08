import {
  ChangeEvent,
  FormEvent,
  useCallback,
  useEffect,
  useState,
} from "react";
import Modal from "./modal";
import { Exercise, Programme, ScreenMapping } from "@/app/types";
import Loader from "./loader";
import Link from "next/link";
import Icon from "./icon";
import ScreenMap from "./screenMap";
import { useRouter } from "next/navigation";
import DropDown, { DropDownOption } from "./dropdown";

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
    };

    console.log(values);

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
    console.log(selectedExerciseForEdit);
    if (selectedExerciseForEdit) {
      const newMaps = [...screenMaps];
      const map = newMaps[selectedExerciseForEdit?.screenMapIndex];
      if (selectedExerciseForEdit.exIndex === 1) {
        map.exercise1 = selectedExercise;
      } else {
        map.exercise2 = selectedExercise;
      }
      console.log(screenMaps);
      setScreenMaps(newMaps);
    }
  };

  return loading ? (
    <Loader />
  ) : (
    <form onSubmit={(e) => onSubmitForm(e)}>
      <div
        className={`space-y-12 ${showExDrawer && "pointer-events-none filter"}`}
        style={{ filter: showExDrawer ? "blur(1px)" : "none" }}
      >
        <div className="border-b border-gray-900/10 pb-12">
          <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
            <div className="col-span-6 lg:col-span-3">
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
            <div className="col-span-6 lg:col-span-3">
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
            </div>
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
      <div className="flex ">
        <div
          className={`fixed top-0 right-0 z-20 w-80 h-full transition-all duration-500 transform bg-white shadow-lg ${
            !showExDrawer && "translate-x-full"
          }`}
        >
          <div className="p-1 overflow-y-auto overflow-x-hidden max-h-full m-4 flex flex-col gap-2">
            <h2 className="text-lg font-semibold">Exercises</h2>
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
            <button
              onClick={() => {
                updateExercise();
                setShowExDrawer(false);
                setSelectedExerciseForEdit(null);
                setSelectedExercise(null);
              }}
              disabled={selectedExercise == null}
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
            {exercises
              .filter((e) => category === "none" || e.category === category)
              ?.sort((a: Exercise, b: Exercise) => (a.name > b.name ? 1 : -1))
              .map((p: Exercise, i: number) => (
                <div
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
                    <video controls src={p.videoUrl} preload="metadata"></video>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>
    </form>
  );
}
