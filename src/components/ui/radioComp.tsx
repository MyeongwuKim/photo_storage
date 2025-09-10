"use client";

import { Label, Radio } from "flowbite-react";

type RadioValue = string | number | boolean;

interface RadioCompProps {
  dir: "row" | "col";
  items: { name: string; selectValue: RadioValue }[];
  groupname: string;
  callback?: (selectData: RadioValue) => void;
  defaultSelect: RadioValue;
  disableSelect?: RadioValue | null;
}

export default function RadioComp({
  dir,
  items,
  groupname,
  callback,
  defaultSelect,
  disableSelect,
}: RadioCompProps) {
  return (
    <fieldset
      className={`flex gap-4 ${dir === "row" ? "flex-row" : "flex-col"}`}
    >
      {items.map((v, i) => {
        const isDisabled = disableSelect === v.selectValue;
        const isChecked = v.selectValue === defaultSelect;

        return (
          <div key={i} className="flex items-center gap-2">
            <Radio
              theme={{
                root: {
                  base: `h-4 w-4 border border-gray-300 text-cyan-600 focus:ring-offset-0 focus:ring-0 
                         dark:border-gray-600 dark:bg-gray-700 dark:focus:bg-cyan-600 dark:focus:ring-cyan-600`,
                },
              }}
              id={`${groupname}-${v.name}`}
              name={groupname}
              value={String(v.selectValue)}
              defaultChecked={isChecked}
              onClick={() => callback?.(v.selectValue)}
              disabled={isDisabled}
            />
            <Label
              className="md:text-lg"
              htmlFor={`${groupname}-${v.name}`}
              disabled={isDisabled}
            >
              {v.name}
            </Label>
          </div>
        );
      })}
    </fieldset>
  );
}
