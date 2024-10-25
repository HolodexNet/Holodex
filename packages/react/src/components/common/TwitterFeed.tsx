import { cn } from "@/lib/utils";
import {
  DetailedHTMLProps,
  HTMLAttributes,
  useEffect,
  useRef,
  useState,
} from "react";
import { useScript } from "usehooks-ts";

declare global {
  // eslint-disable-next-line
  var twttr: any;
}

export function TwitterFeed(
  props: DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement>,
) {
  const ref = useRef<HTMLDivElement>(null);
  const status = useScript("https://platform.twitter.com/widgets.js");

  const html = `<a class="twitter-timeline" data-dnt="true" data-height="400" data-width="700" href="https://twitter.com/holodex?ref_src=twsrc%5Etfw"></a>`;
  useEffect(() => {
    if (status === "ready") window.twttr?.widgets.load();
  }, [status]);

  return (
    <div {...props} ref={ref} dangerouslySetInnerHTML={{ __html: html }} />
  );
}

export function StatusTweetEmbed({
  ...props
}: DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement>) {
  const ref = useRef<HTMLDivElement>(null);
  const [tweetUrl, setTweetUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const status = useScript("https://platform.twitter.com/widgets.js");

  // Fetch the latest status
  useEffect(() => {
    fetch("https://ext.holodex.net/api/status")
      .then((res) => res.text())
      .then((url) => setTweetUrl(url.trim()))
      .catch(() => setError("Failed to load status"));
  }, []);

  // Create tweet embed when both tweet URL and Twitter script are ready
  useEffect(() => {
    if (status === "ready" && tweetUrl && window.twttr && ref.current) {
      // Clear previous content
      ref.current.innerHTML = "";

      window.twttr.widgets
        .createTweet(
          // Extract tweet ID from URL
          tweetUrl.split("/").pop()!,
          ref.current,
          {
            theme: "light",
            width: 550,
            align: "center",
            conversation: "none", // Hide replies
          },
        )
        .catch(() => setError("Failed to load tweet"));
    }
  }, [status, tweetUrl]);

  if (error) {
    return (
      <TwitterFeed className="flex h-[900px] max-w-[min(500px,calc(100vw-40px))] justify-center" />
    );
  }

  // if (!tweetUrl || status !== "ready") {
  //   return (
  //     <div {...props} className="p-4 text-gray-500">
  //       Loading status...
  //     </div>
  //   );
  // }

  return (
    <div
      {...props}
      className={cn("p-4 text-base-8 ", props.className)}
      style={{ minWidth: "min(500px, 100vw)" }}
      ref={ref}
    >
      Loading...
    </div>
  );
}
