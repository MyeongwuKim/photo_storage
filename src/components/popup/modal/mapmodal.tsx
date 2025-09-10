import { CheckIcon } from "@heroicons/react/24/solid";
import { Dispatch, ReactNode, SetStateAction, useState } from "react";
import SearchLocationInput from "../../google/locationInput";
import NormalBtn from "../../ui/normalBtn";
import GMap from "../../google/gMap";

type MapDateType = {
  placeAddress: string;
  location: google.maps.LatLngLiteral;
};
interface MapModalProps {
  onClose: (result?: any) => void;
}

const MapModal = ({ onClose }: MapModalProps) => {
  const [selectedLocation, setSelectedLocation] =
    useState<google.maps.LatLngLiteral>({ lat: 0, lng: 0 });
  const [placeAddress, setPlaceAddress] = useState<string>("");

  const removeEvt = () => {
    onClose();
  };
  return (
    <div
      id="mapModal"
      className="overflow-y-auto overflow-x-hidden fixed flex
      top-0 right-0 left-0 z-50 justify-center items-center w-full md:inset-0 h-[calc(100%-1rem)] max-h-full"
    >
      <div
        className="z-[1] relative p-4 w-full h-auto
      max-w-md max-h-full justify-center items-center bg-white rounded-lg shadow-md dark:bg-gray-700"
      >
        <div className="w-full h-[44px] flex gap-2">
          <SearchLocationInput
            setSelectedLocation={setSelectedLocation}
            setPlaceAddress={setPlaceAddress}
            placeAddress={placeAddress}
          />

          <NormalBtn
            className="w-[64px] rounded-lg border  dark:!text-darkText-2  border-gray-300 dark:border-gray-600 dark:bg-gray-800"
            entity={<CheckIcon className="w-5 h-5" />}
            clickEvt={() => {
              if (!placeAddress) return;
              onClose({ location: selectedLocation, placeAddress });
            }}
          />
        </div>
        <div className="w-full h-[460px] relative mt-2">
          <GMap location={selectedLocation} setPlaceAddress={setPlaceAddress} />
        </div>
      </div>
      <div
        onClick={removeEvt}
        id="mapPannel"
        className="absolute top-0 w-full h-full bg-[rgba(0,0,0,0.5)] "
      />
    </div>
  );
};

export default MapModal;
