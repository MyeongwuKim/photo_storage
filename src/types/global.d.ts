import { Prisma, File, Post, Tag, Favorite } from "@prisma/client";

declare global {
  // ✅ PostType
  type PostType = Prisma.PostGetPayload<{
    include: {
      files: true;
      tags: true;
      _count: { select: { files: true } };
    };
  }>;

  // ✅ TagType
  type TagType = Prisma.TagGetPayload<{
    include: {
      posts: {
        include: {
          files: true;
          _count: { select: { files: true } };
        };
      };
    };
  }>;

  // ✅ FavType
  // Favorite 모델 기반, file 포함해서 가져올 때
  type FavType = Prisma.FavoriteGetPayload<{
    include: {
      file: true;
    };
  }>;

  declare interface GlobalResProps extends Response {
    ok: boolean;
    error: string;
  }

  declare interface InfidataResponse<T = any[]> {
    data: T;
    ok: boolean;
    error: string;
  }

  declare type FileType = {
    fileId: string;
    url: string;
    type: string;
    width?: number;
    height?: number;
    duration?: number;
    createdAt?: Date;
    thumbnail: string | null;
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
}
