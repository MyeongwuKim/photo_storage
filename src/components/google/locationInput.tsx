import React, {
  Dispatch,
  SetStateAction,
  useEffect,
  useRef,
  useState,
} from "react";
import InputField from "../ui/inputField";

let autoComplete: any;

const SearchLocationInput = ({
  setSelectedLocation,
  setPlaceAddress,
  placeAddress,
  placeholder,
}: {
  setSelectedLocation: Dispatch<SetStateAction<google.maps.LatLngLiteral>>;
  setPlaceAddress: Dispatch<SetStateAction<string>>;
  placeAddress: string;
  placeholder?: string;
}) => {
  const autoCompleteRef = useRef(null);

  const handleScriptLoad = (
    updateQuery: Dispatch<SetStateAction<string>>,
    autoCompleteRef: React.RefObject<any>
  ) => {
    autoComplete = new window.google.maps.places.Autocomplete(
      autoCompleteRef.current,
      {
        //types: ["(cities)"],
        types: ["establishment", "geocode"],
        fields: ["place_id", "geometry", "formatted_address", "name"],

        //componentRestrictions: { country: "US" },
      }
    );

    autoComplete.addListener("place_changed", () => {
      handlePlaceSelect(updateQuery);
    });
  };

  const handlePlaceSelect = async (
    updateQuery: Dispatch<SetStateAction<string>>
  ) => {
    const addressObject = await autoComplete.getPlace();
    const query = addressObject.formatted_address;

    updateQuery(query);

    const latLng = {
      lat: addressObject?.geometry?.location?.lat(),
      lng: addressObject?.geometry?.location?.lng(),
    };

    setSelectedLocation(latLng);
  };

  useEffect(() => {
    handleScriptLoad(setPlaceAddress, autoCompleteRef);
  }, []);

  return (
    <InputField
      ref={autoCompleteRef}
      onChange={(event) => setPlaceAddress(event.target.value)}
      value={placeAddress}
      placeholder={placeholder}
      onClick={(event) => (event.target as HTMLElement).focus()}
    />
  );
};

export default SearchLocationInput;
