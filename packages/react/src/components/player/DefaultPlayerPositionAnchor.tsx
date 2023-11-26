import { playerLocationAtom } from "@/store/player";
import { useSetAtom } from "jotai/react";
import { DetailedHTMLProps, HTMLAttributes, useEffect } from "react";

import useMeasure from "react-use-measure";

/**
 * Renders a box that anchors to the hovering iframe to atop its location. Normally just a empty div without styling.
 *
 * @param props - The props for the anchoring div
 * @return {JSX.Element} The rendered anchor element.
 */
export function DefaultPlayerPositionAnchor(
  props: Omit<
    DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement>,
    "ref"
  >,
) {
  const [ref, bounds] = useMeasure({ scroll: true });
  const setPlayerLocation = useSetAtom(playerLocationAtom);

  useEffect(() => {
    setPlayerLocation(bounds);
  }, [bounds, setPlayerLocation]);

  return <div {...props} ref={ref}></div>;
}
