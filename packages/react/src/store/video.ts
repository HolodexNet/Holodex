import { useAtom } from "jotai/react";
import { atomWithStorage } from "jotai/utils";

export const videoCardSizeAtom = atomWithStorage<VideoCardSize>(
  "videocard-size",
  "lg",
);

export function useVideoCardSizes(allowedCardSizes: VideoCardSize[]) {
  const [size, setSize] = useAtom(videoCardSizeAtom);

  const setNextSize = () => {
    const currentIndex = allowedCardSizes.indexOf(size);
    const nextIndex = (currentIndex + 1) % allowedCardSizes.length;
    setSize(allowedCardSizes[nextIndex]);
  };

  // Assuming the next size is immediately after the current size in the array
  const nextSize =
    allowedCardSizes[
      (allowedCardSizes.indexOf(size) + 1) % allowedCardSizes.length
    ];

  return { size, setSize, nextSize, setNextSize };
}
