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

export type SubmitStatus = "success" | "failed" | "waiting" | "submitting";

export interface ProgrammeFormProps {
  programmeId: string | null;
}
export default function ProgrammeForm({ programmeId }: ProgrammeFormProps) {
  const [showModal, setShowModal] = useState<boolean>(false);
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
  }, [programme]);

  const submitData = useCallback(
    async (values: Programme) => {
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
    },
    [mode]
  );

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
    };

    await submitData(values);
  };

  useEffect(() => {
    if (submitStatus === "success" || submitStatus === "failed") {
      setShowModal(true);
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

  const exerciseOptions = exercises?.map((e) => ({
    value: e.id,
    label: e.name,
  }));

  const router = useRouter();

  return loading ? (
    <Loader />
  ) : (
    <form onSubmit={(e) => onSubmitForm(e)}>
      <div className="space-y-12">
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
                  key={`screenmap-${i}`}
                  screenMap={s}
                  exerciseOptions={exerciseOptions}
                  onChange={(name, e) => {
                    console.log("screenmapchange", name, e);
                    onScreenMapChange(i, name, e);
                  }}
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
          href="/admin"
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
      {showModal && (
        <Modal
          title="Form Result"
          onAccept={() => {
            setShowModal(false);
            submitStatus === "success" && router.push("/admin");
          }}
          onCancel={() => setShowModal(false)}
          happy={submitStatus === "success"}
        >
          <div>
            {submitStatus === "success" ? "Submit Success" : "Submit Failed"}
          </div>
        </Modal>
      )}
    </form>
  );
}
