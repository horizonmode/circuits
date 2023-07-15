import {
  ChangeEvent,
  FormEvent,
  useCallback,
  useEffect,
  useState,
} from "react";
import Modal from "./modal";
import { Exercise } from "@/app/types";
import Loader from "./loader";
import Link from "next/link";
import axios, { AxiosProgressEvent } from "axios";
import Icon from "./icon";

export type SubmitStatus = "success" | "failed" | "waiting" | "submitting";

export interface ExerciseFormProps {
  exerciseId: string | null;
}
export default function ExerciseForm({ exerciseId }: ExerciseFormProps) {
  const [showModal, setShowModal] = useState<boolean>(false);
  const [name, setName] = useState<string>("");
  const [title, setTitle] = useState<string>("");
  const [videoUrl, setVideoUrl] = useState<string>("");
  const [videoFileName, setVideoFileName] = useState<string>("");
  const [file, setFile] = useState<File | null>(null);
  const mode = exerciseId ? "edit" : "create";

  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [submitStatus, setSubmitStatus] = useState<SubmitStatus>("waiting");
  const [loading, setLoading] = useState<boolean>(true);

  const [exercise, setExercise] = useState<Exercise | null>(null);
  useEffect(() => {
    const fetchExercise = async () => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/exercise/${exerciseId}?code=${process.env.NEXT_PUBLIC_API_KEY}`
      );
      const data = await res.json();
      setExercise(data);
      setLoading(false);
    };

    if (exerciseId) {
      fetchExercise();
    } else {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (exercise) {
      setName(exercise.name);
      setTitle(exercise.title);
      setVideoUrl(exercise.videoUrl);
      setVideoFileName(exercise.videoFileName);
    }
  }, [exercise]);

  const onUploadProgress = (event: AxiosProgressEvent) => {
    const percentCompleted = Math.round(
      (event.loaded * 100) / (event.total || 100)
    );
    setUploadProgress(percentCompleted);
  };
  const uploadFile = useCallback(async (file: File) => {
    const upload = async (file: File) => {
      const data = new FormData();
      data.append("file", file);

      try {
        await axios.put(
          `https://signalromm3467ae.blob.core.windows.net/videos/${file.name}?sp=racw&st=2023-07-10T13:56:59Z&se=2024-01-01T22:56:59Z&spr=https&sv=2022-11-02&sr=c&sig=Bw%2BFHaT69BHnjJSgVjc37Cqh7qfSv6XS7ExiiWDJ4lQ%3D`,
          file,
          {
            onUploadProgress,
            headers: {
              "x-ms-blob-type": "BlockBlob",
              "Content-Type": "video/mp4",
            },
          }
        );

        return `https://signalromm3467ae.blob.core.windows.net/videos/${file.name}?sp=racw&st=2023-07-10T13:56:59Z&se=2024-01-01T22:56:59Z&spr=https&sv=2022-11-02&sr=c&sig=Bw%2BFHaT69BHnjJSgVjc37Cqh7qfSv6XS7ExiiWDJ4lQ%3D`;
      } catch (error) {
        setSubmitStatus("failed");
      } finally {
        console.log("Upload complete");
      }
    };

    return await upload(file);
  }, []);

  const submitData = useCallback(
    async (values: Exercise) => {
      const url =
        `${process.env.NEXT_PUBLIC_API_URL}/api/exercise` +
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

    let newVideoUrl = videoUrl;
    if (file) {
      newVideoUrl = (await uploadFile(file)) || "";
      setVideoUrl(newVideoUrl);
      setFile(null);
    }

    const values: Exercise = {
      name,
      title,
      videoUrl: newVideoUrl,
      videoFileName,
      id: exerciseId || "",
    };

    await submitData(values);
  };

  useEffect(() => {
    if (submitStatus === "success" || submitStatus === "failed") {
      setShowModal(true);
    }
  }, [submitStatus]);

  useEffect(() => {
    if (file) {
      setVideoUrl("");
      setVideoFileName(file?.name || "");
    }
  }, [file]);

  const onInputChange = (name: string, e: ChangeEvent<HTMLInputElement>) => {
    switch (name) {
      case "name":
        setName((e.target as any).value);
        break;
      case "title":
        setTitle((e.target as any).value);
        break;
      case "file": {
        setFile((e.target as any).files[0]);
        break;
      }
    }
  };

  const submitting = submitStatus === "submitting";

  return loading ? (
    <Loader />
  ) : (
    <form onSubmit={(e) => onSubmitForm(e)}>
      <div className="space-y-12">
        <div className="border-b border-gray-900/10 pb-12">
          <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
            <div className="sm:col-span-4">
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
            <div className="sm:col-span-4">
              <label
                htmlFor="name"
                className="block text-sm font-medium leading-6 text-gray-900"
              >
                Title
              </label>
              <div className="mt-2">
                <div className="flex rounded-md shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-600 sm:max-w-md">
                  <span className="flex select-none items-center pl-3 text-gray-500 sm:text-sm"></span>
                  <input
                    type="text"
                    name="title"
                    id="title"
                    autoComplete="title"
                    className="block flex-1 border-0 bg-transparent py-1.5 pl-1 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm sm:leading-6"
                    placeholder="workout title"
                    required
                    value={title}
                    onChange={(e) => onInputChange("title", e)}
                  />
                </div>
              </div>
            </div>

            <div className="col-span-full">
              {videoUrl ? (
                <div>
                  <a
                    className="underline text-blue-600 hover:text-blue-800 visited:text-purple-600"
                    target="_blank"
                    href={videoUrl}
                  >
                    {videoFileName}
                  </a>
                  <Icon type="del" onClick={() => setVideoUrl("")} />
                </div>
              ) : (
                <div className="mb-3">
                  <label
                    htmlFor="formFile"
                    className="mb-2 inline-block text-neutral-700 dark:text-neutral-200"
                  >
                    Video File
                  </label>
                  <input
                    className="relative m-0 block w-full min-w-0 flex-auto rounded border border-solid border-neutral-300 bg-clip-padding px-3 py-[0.32rem] text-base font-normal text-neutral-700 transition duration-300 ease-in-out file:-mx-3 file:-my-[0.32rem] file:overflow-hidden file:rounded-none file:border-0 file:border-solid file:border-inherit file:bg-neutral-100 file:px-3 file:py-[0.32rem] file:text-neutral-700 file:transition file:duration-150 file:ease-in-out file:[border-inline-end-width:1px] file:[margin-inline-end:0.75rem] hover:file:bg-neutral-200 focus:border-primary focus:text-neutral-700 focus:shadow-te-primary focus:outline-none dark:border-neutral-600 dark:text-neutral-200 dark:file:bg-neutral-700 dark:file:text-neutral-100 dark:focus:border-primary"
                    type="file"
                    id="formFile"
                    required={!videoUrl}
                    onChange={(e) => onInputChange("file", e)}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 flex items-center justify-end gap-x-6">
        {submitting && (
          <div className="w-1/4 bg-neutral-200 dark:bg-neutral-600">
            <div
              className="bg-green-300 p-0.5 text-center text-xs font-medium leading-none text-primary-100"
              style={{ width: `${uploadProgress}%` }}
            >
              {`${uploadProgress}%`}
            </div>
          </div>
        )}
        {submitting && <Loader />}
        <Link
          href="/admin/exercises"
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
          title="Form Success"
          onAccept={() => setShowModal(false)}
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
