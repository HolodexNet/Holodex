import React from "react";
import { Img, ImgProps } from "react-image";

type ImageRendererProps = {
  src: string[] | string | undefined;
};

export function VideoThumbnail({
  src,
  ...rest
}: ImageRendererProps & Omit<ImgProps, "src">) {
  return (
    <Img
      src={src || ""}
      loader={
        <div className="flex aspect-video h-full w-full items-center justify-center ">
          <div className="i-eos-icons:bubble-loading"></div>
        </div>
      }
      {...rest}
    />
  );
}
