"use client";
import SearchLocationInput from "@/components/google/locationInput";
import InputField from "@/components/ui/inputField";
import TagInput from "@/components/ui/tagInput";
import TextBox from "@/components/ui/textarea";
import { NextPage } from "next";
import {
  Dispatch,
  MutableRefObject,
  SetStateAction,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { useForm } from "react-hook-form";
import DatePicker from "@/components/ui/datePicker";
import StartRating from "@/components/ui/starRating";
import { useUI } from "@/components/uiProvider";
import { useUploadModal } from "../uploadModal";

type InfoType = {
  tag: string[];
  comment: string;
  date: Date | null;
  mapData: MapDataType;
  score: number;
};

const SecondPage = () => {
  const { register, setValue, reset } = useForm();
  const { state, dispatch } = useUploadModal();
  const { openModal } = useUI();
  useEffect(() => {
    if (state.info.mode == "create") {
      dispatch({ type: "CLEAR_INFO" });
    }
  }, [state.fileItem]);
  const updateInfo = useCallback((props: Partial<InfoType>) => {
    dispatch({ type: "SET_INFO", payload: props });
  }, []);

  return (
    <div className="w-full h-full z-50">
      <div className="flex gap-3 flex-col">
        <div className="dark:text-darkText-2 text-lightText-2 font-semibold">
          촬영 날짜
        </div>
        <div className="w-full h-[54px]">
          <DatePicker
            defaultDate={state.info.date}
            callback={(date) => {
              updateInfo({ date });
              return true;
            }}
          />
        </div>

        <div className="dark:text-darkText-2 text-lightText-2 font-semibold">
          태그
        </div>
        <div className="w-full">
          <TagInput
            register={{ ...register("tag") }}
            defaultValue={state.info.tag}
            callback={(tags) => {
              updateInfo({ tag: tags });
            }}
          />
        </div>
        <div className="dark:text-darkText-2 text-lightText-2 font-semibold">
          위치
        </div>
        <div className="w-full h-[54px]">
          <InputField
            onClick={async () => {
              const result = await openModal("MAP");
              if (result) {
                updateInfo({ mapData: result });
              }
            }}
            value={state.info.mapData.placeAddress}
            readOnly={true}
            placeholder="위치를 입력해보세요."
          />
        </div>
        <div className="dark:text-darkText-2 text-lightText-2 font-semibold">
          코멘트
        </div>
        <div className="w-full h-[64px]">
          <TextBox
            defaultValue={state.info.comment}
            register={{
              ...register("comment", {
                onChange: (event) => {
                  updateInfo({ comment: event.target.value });
                },
              }),
            }}
            placeholder="코멘트를 작성 해보세요."
          />
        </div>
        <div className="dark:text-darkText-2 text-lightText-2 font-semibold">
          별점
        </div>
        <StartRating
          defaultValue={state.info.score}
          readonly={false}
          callback={(score) => {
            updateInfo({ score });
          }}
        />
      </div>
    </div>
  );
};

export default SecondPage;
