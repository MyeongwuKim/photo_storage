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
  useEffect,
  useRef,
  useState,
} from "react";
import { useForm } from "react-hook-form";
import DatePicker from "@/components/ui/datePicker";
import StartRating from "@/components/ui/starRating";
import { useUI } from "@/components/uiProvider";
import { useUploadModal } from "../uploadModal";

interface SecondPageProps {
  valueRef: MutableRefObject<{
    tag: string[];
    comment: string;
    date: Date;
    mapData: MapDataTyhpe;
    score: number;
  }>;
}

type MapDataTyhpe = {
  placeAddress: string;
  location: google.maps.LatLngLiteral;
};

type DateStateType = {
  setDateState: Dispatch<SetStateAction<Date>>;
  date: Date;
};

const SecondPage: NextPage<SecondPageProps> = ({ valueRef }) => {
  const { register, setValue } = useForm();
  const { state } = useUploadModal();
  const { openModal } = useUI();
  const [defScore, setDefScore] = useState<number>(5);
  const [mapData, setMapData] = useState<{
    placeAddress: string;
    location: google.maps.LatLngLiteral;
  }>({ location: { lat: 0, lng: 0 }, placeAddress: "" });

  useEffect(() => {
    setMapData(valueRef.current.mapData);
  }, [valueRef.current.mapData]);
  useEffect(() => {
    //파일 날렸을때 comment만 따로 초기화
    if (state.fileItem.length <= 0) {
      setValue("comment", "");
      setDefScore(5);
    }
  }, [state.fileItem]);

  return (
    <div className="w-full h-full z-50">
      <div className="flex gap-3 flex-col">
        <div className="dark:text-darkText-2 text-lightText-2 font-semibold">
          촬영 날짜
        </div>
        <div className="w-full h-[54px]">
          <DatePicker
            defaultDate={valueRef.current.date}
            callback={(date) => {
              if (date) valueRef.current.date = date;
              return true;
            }}
          />
        </div>

        <div className="dark:text-darkText-2 text-lightText-2 font-semibold">
          태그
        </div>
        <div className="w-full h-auto">
          <TagInput
            defaultValue={valueRef.current.tag}
            callback={(tags) => {
              valueRef.current.tag = tags;
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
                valueRef.current.mapData = result;
                setMapData(valueRef.current.mapData);
              }
            }}
            value={mapData.placeAddress}
            readOnly={true}
            placeholder="위치를 입력해보세요."
          />
        </div>
        <div className="dark:text-darkText-2 text-lightText-2 font-semibold">
          코멘트
        </div>
        <div className="w-full h-[64px]">
          <TextBox
            register={{
              ...register("comment", {
                onChange: (event) => {
                  valueRef.current.comment = event.target.value;
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
          defaultValue={defScore}
          readonly={false}
          callback={(score) => {
            valueRef.current.score = score;
            setDefScore(score);
          }}
        />
      </div>
    </div>
  );
};

export default SecondPage;
