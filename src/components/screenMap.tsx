import { ScreenMapping } from "@/app/types";
import DropDown, { DropDownOption } from "./dropdown";
import Icon from "./icon";

export interface ScreenMapProps {
  screenMap: ScreenMapping;
  exerciseOptions: DropDownOption[];
  onChange: (name: string, e: string | boolean) => void;
}
export default function ScreenMap({
  screenMap,
  exerciseOptions,
  onChange,
}: ScreenMapProps) {
  console.log(screenMap);
  return (
    <div className="w-full relative mb-5 bg-gradient-to-r from-powder to-powder-300 grid grid-cols-7 gap-2 p-5 rounded-md">
      <span className="text-lg col-span-2 md:col-span-1 flex flex-col align-middle justify-center">
        {screenMap.screen.tag}
      </span>

      <div className="relative flex gap-x-3 col-span-3 md:col-span-1 items-center">
        <div className="flex h-6 items-center">
          <input
            id="split-screen"
            name="split-screen"
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
            htmlFor="split-screen"
            className="font-medium text-gray-900 flex align-middle justify-center"
          >
            Split Screen
          </label>
        </div>
      </div>

      <div className="col-span-5 md:col-span-4 lg:col-span-2">
        <DropDown
          onChange={(e) => {
            onChange("exercise-1", e.target.value);
          }}
          value={screenMap.exercise1?.id}
          label="exercise 1"
          options={exerciseOptions}
        />
      </div>

      <div className="col-span-5 md:col-span-4 lg:col-span-2">
        <DropDown
          onChange={(e) => {
            onChange("exercise-2", e.target.value);
          }}
          value={screenMap.exercise2?.id}
          label="exercise 2"
          options={exerciseOptions}
        />
      </div>
      <div className="col-span-2 lg:col-span-1">
        <Icon type="del" />
      </div>
    </div>
  );
}
