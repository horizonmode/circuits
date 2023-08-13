import { ChangeEventHandler, Fragment } from "react";
import { Menu, Transition } from "@headlessui/react";
import { ChevronDownIcon } from "@heroicons/react/20/solid";

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(" ");
}

export interface DropDownOption {
  value: string;
  label: string;
}
export interface DropDownProps {
  options: DropDownOption[];
  label: string;
  value: string | undefined;
  onChange: ChangeEventHandler<HTMLSelectElement>;
  id: string;
  defaultOption?: string;
  showDefault?: boolean;
}

export default function DropDown({
  options,
  label,
  onChange,
  value,
  id,
  defaultOption,
  showDefault = true,
}: DropDownProps) {
  return (
    <div className="relative flex gap-x-3 w-full items-left">
      <label
        htmlFor={id}
        className="block mb-2 text-xs font-medium text-gray-900 "
      >
        {label}
      </label>
      <select
        id={id}
        value={value || "none"}
        onChange={onChange}
        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
      >
        {showDefault && <option value="none">{defaultOption}</option>}
        {options.map((o, i) => (
          <option key={`option-${i}`} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}
