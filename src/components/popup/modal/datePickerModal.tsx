"use client";
import { formateDate, formatSringDate } from "@/hooks/useUtil";
import { Datepicker } from "flowbite-react";
import { useEffect } from "react";

interface DatePickerModalProps {
  onClose: (result: any) => void;
  date: string | null;
}
export default function DatePickerModal({
  onClose,
  date,
}: DatePickerModalProps) {
  useEffect(() => {
    console.log(`modal! ${date}`);
  }, [date]);
  return (
    <div
      id="datePickerModal"
      className="overflow-y-auto overflow-x-hidden fixed flex
      top-0 right-0 left-0 z-50 justify-center items-center w-full md:inset-0 h-full"
    >
      <div
        onClick={(e) => {
          onClose(0);
          e.isPropagationStopped();
        }}
        id="datepickerPanel"
        className="absolute top-0 w-full h-full bg-panel"
      />
      <Datepicker
        inline
        value={date ? new Date(formatSringDate(date, "-")) : null}
        theme={{}}
        onChange={(date: Date | null) => {
          let isStateChange = true;
          onClose(date);
        }}
      />
    </div>
  );
}
