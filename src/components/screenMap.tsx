import { ScreenMapping } from "@/app/types";
import DropDown, { DropDownOption } from "./dropdown";
import Icon from "./icon";
import { Card, Divider } from "@tremor/react";

export interface ScreenMapProps {
  screenMap: ScreenMapping;
  index: number;
  exerciseOptions: DropDownOption[];
  onChange: (name: string, e: string | boolean) => void;
  onDelete: () => void;
  showDelete?: boolean;
  onExerciseEdit?: (ex: number) => void;
  selectedEx: number | null;
}

export default function ScreenMap({
  screenMap,
  exerciseOptions,
  onChange,
  index,
  onDelete,
  showDelete = false,
  onExerciseEdit,
  selectedEx,
}: ScreenMapProps) {
  return (
    <Card
      decoration="left"
      decorationColor="indigo"
      className=" ring-1 ring-black w-full relative mb-5 bg-gradient-to-r from-powder to-powder-300 grid grid-cols-7 gap-2 p-5 rounded-md shadow-md"
    >
      <span className="text-lg col-span-2 md:col-span-1 flex flex-col align-middle justify-center">
        {screenMap.screen.tag}
      </span>

      <div className="relative flex gap-x-3 col-span-3 md:col-span-1 items-center">
        <div>
          <div className="flex h-6 items-center">
            <input
              id={`split-screen-${index}`}
              name={`split-screen-${index}`}
              type="checkbox"
              checked={screenMap.splitScreen}
              className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600"
              onChange={(e) => {
                onChange("split-screen", !screenMap.splitScreen);
              }}
            />
          </div>
          <div className="text-sm leading-6 flex align-middle justify-center">
            <label
              htmlFor={`split-screen-${index}`}
              className="font-medium text-gray-900 flex align-middle justify-center"
            >
              Split Screen
            </label>
          </div>
        </div>
        <div>
          <div className="flex h-6 items-center">
            <input
              id={`show-timer-${index}`}
              name={`show-timer-${index}`}
              type="checkbox"
              checked={screenMap.showTimer}
              className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600"
              onChange={(e) => {
                onChange("show-timer", !screenMap.showTimer);
              }}
            />
          </div>
          <div className="text-sm leading-6 flex align-middle justify-center">
            <label
              htmlFor={`show-timer-${index}`}
              className="font-medium text-gray-900 flex align-middle justify-center"
            >
              Show Timer
            </label>
          </div>
        </div>
      </div>

      <div className="col-span-7 md:col-span-3 lg:col-span-2 flex flex-col gap-3">
        <div className="flex flex-col items-stretch justify-start  ring-1 ring-blue-900 p-3 rounded-md">
          <label
            htmlFor="title"
            className="block text-sm font-medium leading-6 "
          >
            Screen Title
          </label>
          <div className="mt-2">
            <input
              id="title"
              name="title"
              type="text"
              value={screenMap.screenTitle1 ?? ""}
              className="block w-full rounded-md border-0 py-1.5 px-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
              onChange={(e) => onChange("screen-title-1", e.target.value)}
            />
          </div>
          <p className="mt-3 text-sm leading-6 ">
            Write a label for the screen.
          </p>
        </div>

        <div
          className={`w-full relative ring-1 ring-green-400 flex align-middle items-center justify-start p-3 rounded-md ${
            selectedEx === 1 && "bg-gray-800 outline-dashed outline-black"
          }`}
        >
          <div className={`w-full flex flex-col gap-5`}>
            <div className="flex flex-row">
              <span className="text-md w-100  flex-1">
                {screenMap.exercise1?.name.toLowerCase()}
              </span>
              <Icon
                type="edit"
                onClick={() => {
                  onExerciseEdit && onExerciseEdit(1);
                }}
              />
            </div>
            <video
              controls
              src={screenMap.exercise1?.videoUrl}
              preload="thumbnail"
              playsInline
              muted
            ></video>
          </div>
          {(selectedEx === 1 || screenMap.exercise1 === null) && (
            <div className="absolute left-0 top-0 bg-black  outine-3  bottom-0 right-0 flex align-middle content-center z-2 justify-center items-center">
              <Icon
                invert={true}
                type="edit"
                onClick={() => {
                  onExerciseEdit && onExerciseEdit(1);
                }}
              ></Icon>
            </div>
          )}
        </div>
      </div>

      {screenMap.splitScreen && (
        <div className="col-span-7 md:col-span-3 lg:col-span-2 flex gap-3 flex-col">
          <div className="flex flex-col items-stretch justify-start ring-1 ring-blue-800 p-3 rounded-md">
            <label
              htmlFor="title"
              className="block text-sm font-medium leading-6 "
            >
              Screen Title
            </label>
            <div className="mt-2">
              <input
                id="title"
                name="title"
                type="text"
                value={screenMap.screenTitle2 ?? ""}
                className="block w-full rounded-md border-0 py-1.5 px-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                onChange={(e) => onChange("screen-title-2", e.target.value)}
              />
            </div>
            <p className="mt-3 text-sm leading-6 ">
              Write a label for the screen.
            </p>
          </div>

          <div
            className={`w-full relative  ring-1 ring-green-400 flex align-middle items-center justify-start p-3 rounded-md`}
          >
            <div className={`w-full flex flex-col gap-5`}>
              <div className="flex flex-row">
                <span className="text-md w-100 flex-1">
                  {screenMap.exercise2?.name.toLowerCase()}
                </span>
                <Icon
                  type="edit"
                  onClick={() => {
                    onExerciseEdit && onExerciseEdit(2);
                  }}
                />
              </div>
              <video
                controls
                src={screenMap.exercise2?.videoUrl}
                preload="thumbnail"
                playsInline
                muted
              ></video>
            </div>
            {(selectedEx === 2 || screenMap.exercise2 === null) && (
              <div className="absolute left-0 bg-black outline-2 outline-dashed top-0 bottom-0 right-0 flex align-middle content-center z-2 justify-center items-center">
                <Icon
                  invert={true}
                  type="edit"
                  onClick={() => {
                    onExerciseEdit && onExerciseEdit(2);
                  }}
                ></Icon>
              </div>
            )}
          </div>
        </div>
      )}
      {showDelete && (
        <div className="col-span-7 md:col-span-2 lg:col-span-1  flex align-middle justify-center md:justify-end">
          <Icon
            type="del"
            onClick={() => {
              onDelete();
            }}
          />
        </div>
      )}
    </Card>
  );
}
