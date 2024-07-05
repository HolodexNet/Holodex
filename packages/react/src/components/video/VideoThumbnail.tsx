import React, { Suspense } from "react";
import { Img, ImgProps } from "react-image";

type ImageRendererProps = {
  src: string[] | string | undefined;
};

export function VideoThumbnail({
  src,
  ...rest
}: ImageRendererProps & Omit<ImgProps, "src">) {
  return (
    <Suspense>
      <Img
        src={src || ""}
        loader={
          <div className="flex aspect-video h-full w-full items-center justify-center opacity-50">
            <div
              className="i-svg-spinners:3-dots-scale"
              style={{ lineHeight: "50px", fontSize: "50px" }}
            ></div>
          </div>
        }
        {...rest}
      />
    </Suspense>
  );
}
