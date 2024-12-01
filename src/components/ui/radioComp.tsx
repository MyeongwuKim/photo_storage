"use client";

import { Label, Radio } from "flowbite-react";

interface RadioCompProps<T> {
  dir: "row" | "col";
  items: { name: string; selectValue: T }[];
  groupname: string;
  callback?: (selectData: T) => void;
  defaultSelect: T;
  disableSelect?: T | null;
}

export default function RadioComp<T>({
  dir,
  items,
  groupname,
  callback,
  defaultSelect,
  disableSelect,
}: RadioCompProps<T>) {
  return (
    <fieldset
      className={`flex gap-4 ${dir == "row" ? "flex-row" : "flex-col"}`}
    >
      {items.map((v, i) => {
        return (
          <div key={i} className="flex items-center gap-2">
            <Radio
              theme={{
                root: {
                  base: `h-4 w-4 border border-gray-300 text-cyan-600 focus:ring-offset-0 focus:ring-0 disabled:
                  focus: ring-cyan-500 dark:border-gray-600 dark:bg-gray-700 dark:focus:bg-cyan-600 dark:focus:ring-cyan-600`,
                },
              }}
              id={v.name}
              name={groupname}
              value={v.name}
              defaultChecked={v.selectValue == defaultSelect}
              onClick={() => {
                if (callback) callback(v.selectValue);
              }}
              disabled={
                disableSelect
                  ? disableSelect == v.selectValue
                    ? true
                    : false
                  : false
              }
            />
            <Label
              className="md:text-lg"
              htmlFor={v.name}
              disabled={
                disableSelect
                  ? disableSelect == v.selectValue
                    ? true
                    : false
                  : false
              }
            >
              {v.name}
            </Label>
          </div>
        );
      })}
      {/* <div className="flex items-center gap-2">
        <Radio id="united-state" name="countries" value="USA" defaultChecked />
        <Label htmlFor="united-state">United States</Label>
      </div>
      <div className="flex items-center gap-2">
        <Radio id="germany" name="countries" value="Germany" />
        <Label htmlFor="germany">Germany</Label>
      </div>
      */}
    </fieldset>
  );
}
