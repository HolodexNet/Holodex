import { DetailedHTMLProps, HTMLAttributes, useEffect, useRef } from "react";
import { useScript } from "usehooks-ts";

declare global {
  // eslint-disable-next-line
  var twttr: any;
}

const html = `<a class="twitter-timeline" data-dnt="true" data-height="400" data-width="${Math.min(
  window.innerWidth - 40,
  800,
)}" href="https://twitter.com/holodex?ref_src=twsrc%5Etfw">Tweets by Holodex</a>`;

export function TwitterFeed(
  props: DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement>,
) {
  const ref = useRef<HTMLDivElement>(null);
  const status = useScript("https://platform.twitter.com/widgets.js");

  useEffect(() => {
    if (status === "ready") window.twttr?.widgets.load();
  }, [status]);

  return (
    <div {...props} ref={ref} dangerouslySetInnerHTML={{ __html: html }} />
  );
}
