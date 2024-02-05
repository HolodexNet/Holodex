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
      loader={<div className="i-eos-icons:bubble-loading"></div>}
      {...rest}
    />
  );
}
