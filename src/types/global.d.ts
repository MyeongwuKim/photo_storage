// declare interface Posts {
//   tag: string[];
//   comment: string;
//   date: Date;
//   mapData: MapDataType;
//   score: number;
//   _count: {
//     files: number;
//   };
//   files: PostSFileType[];
// }

declare interface GlobalResProps extends Response {
  ok: boolean;
  error: string;
}
declare type FileType = {
  url: string;
  type: string;
  width?: number;
  height?: number;
  duration?: number;
  createdAt?: Date;
};
declare type InfoType = {
  tag: string[];
  comment: string;
  date: Date;
  mapData: MapDataType;
  score: number;
};

type MapDataType = {
  placeAddress: string;
  location: google.maps.LatLngLiteral;
};
