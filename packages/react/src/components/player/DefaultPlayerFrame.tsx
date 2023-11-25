import { playerLocationAtom } from "@/store/player";
import { useSetAtom } from "jotai/react";
import { DetailedHTMLProps, HTMLAttributes, useEffect } from "react";

import useMeasure from "react-use-measure";

export function DefaultPlayerFrame(
  props: DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement>,
) {
  const [ref, bounds] = useMeasure({ scroll: true });
  const setPlayerLocation = useSetAtom(playerLocationAtom);

  useEffect(() => {
    setPlayerLocation(bounds);
  }, [bounds, setPlayerLocation]);

  return <div ref={ref} {...props}></div>;
}
