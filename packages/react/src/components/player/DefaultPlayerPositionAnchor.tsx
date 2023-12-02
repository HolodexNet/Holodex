import { playerLocationRefAtom } from "@/store/player";
import { useSetAtom } from "jotai/react";
import type { DetailedHTMLProps, HTMLAttributes } from "react";

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
  const setRef = useSetAtom(playerLocationRefAtom);

  return <div {...props} ref={setRef}></div>;
}
