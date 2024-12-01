"use client";
import React, { Dispatch, FC, SetStateAction, useEffect } from "react";
import { GoogleMap, LoadScript, MarkerF } from "@react-google-maps/api";
import { Wrapper, Status } from "@googlemaps/react-wrapper";

const GMap = ({
  location,
  setPlaceAddress,
}: {
  location: google.maps.LatLngLiteral;
  setPlaceAddress?: Dispatch<SetStateAction<string>>;
}) => {
  const render = (status: Status) => {
    return <h1>{status}</h1>;
  };

  const [clicks, setClicks] = React.useState<google.maps.LatLngLiteral>();
  const [zoom, setZoom] = React.useState(15); // initial zoom
  const [center, setCenter] =
    React.useState<google.maps.LatLngLiteral>(location);
  useEffect(() => {
    setCenter({ lat: location.lat, lng: location.lng });
    setClicks({ lat: location.lat, lng: location.lng });
  }, [location]);

  const onClick = async (e: google.maps.MapMouseEvent) => {
    //클릭시 마커 생성
    setClicks({ lat: e.latLng?.lat()!, lng: e.latLng?.lng()! });
    //@ts-ignore
    const response = await fetch(`/api/google/${e.placeId}`, {
      method: "GET",
    });
    const jsonData = await response.json();
    if (jsonData.data.status == "OK") {
      if (setPlaceAddress)
        setPlaceAddress(jsonData.data.result.formatted_address);
    }
  };
  //게속 실행되는 함수
  const onIdle = (m: google.maps.Map) => {
    setZoom(m.getZoom()!);
    setCenter(m.getCenter()!.toJSON());
  };

  return (
    <Wrapper apiKey={process.env.NEXT_PUBLIC_GOOGLE_API_KEY!} render={render}>
      <Map
        center={center}
        zoom={zoom}
        onIdle={onIdle}
        onClick={onClick}
        style={{ height: "100%", position: "relative" }}
      >
        <Marker position={clicks} />
      </Map>
    </Wrapper>
  );
};

interface MapProps extends google.maps.MapOptions {
  style: { [key: string]: string };
  onClick?: (e: google.maps.MapMouseEvent) => void;
  onIdle?: (map: google.maps.Map) => void;
  children?: React.ReactNode;
}

const Map: React.FC<MapProps> = ({
  onIdle,
  onClick,
  children,
  style,
  ...options
}) => {
  // [START maps_react_map_component_add_map_hooks]
  const ref = React.useRef<HTMLDivElement>(null);
  const [map, setMap] = React.useState<google.maps.Map>();

  React.useEffect(() => {
    if (ref.current && !map) {
      setMap(new window.google.maps.Map(ref.current, {}));
    }
  }, [ref, map]);
  useEffect(() => {
    if (map) {
      map.setOptions(options);
    }
  }, [map, options]);

  useEffect(() => {
    if (map) {
      ["click", "idle"].forEach((eventName) =>
        google.maps.event.clearListeners(map, eventName)
      );

      if (onClick) {
        map.addListener("click", onClick);
      }

      if (onIdle) {
        map.addListener("idle", () => onIdle(map));
      }
    }
  }, [map, onIdle, onClick]);
  // [END maps_react_map_component_event_hooks]

  // [START maps_react_map_component_return]
  return (
    <>
      <div ref={ref} style={style} />
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          // set the map prop on the child component
          // @ts-ignore
          return React.cloneElement(child, { map });
        }
      })}
    </>
  );
  // [END maps_react_map_component_return]
};

const Marker: React.FC<google.maps.MarkerOptions> = (options) => {
  const [marker, setMarker] = React.useState<google.maps.Marker>();

  React.useEffect(() => {
    if (!marker) {
      setMarker(new google.maps.Marker());
    }

    // remove marker from map on unmount
    return () => {
      if (marker) {
        marker.setMap(null);
      }
    };
  }, [marker]);

  React.useEffect(() => {
    if (marker) {
      marker.setOptions(options);
    }
  }, [marker, options]);

  return null;
};

export default GMap;
