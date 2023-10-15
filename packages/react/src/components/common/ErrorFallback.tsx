import { FallbackProps } from "react-error-boundary";
import { Trans, useTranslation } from "react-i18next";
import { TwitterFeed } from "./TwitterFeed";
import { useRouteError } from "react-router-dom";
import { Button } from "@/shadcn/ui/button";
import { useAuth } from "@/hooks/useAuth";

export function ErrorFallback(props?: FallbackProps | {}) {
  const routeError = useRouteError() as Error | null;
  const { t } = useTranslation();
  const { logout } = useAuth();

  // @ts-ignore
  const error = routeError ?? (props?.error as Error | null);

  return (
    <div className=" w-full h-full p-8 overflow-y-auto">
      <div className="mx-auto w-full h-full max-w-screen-lg flex flex-col items-center gap-4">
        <h2 className="font-bold text-3xl">{t("Gomenasorry!")}</h2>
        <p>
          <Trans>
            There was an error retrieving content, please check{" "}
            <a className="underline text-blue-500" href="https://x.com/holodex">
              Twitter
            </a>{" "}
            or report an error through the{" "}
            <a
              className="underline text-blue-500"
              href="https://discord.gg/jctkgHBt4b"
            >
              Discord
            </a>
            .
          </Trans>
        </p>
        <div className="flex gap-4">
          <Button size="lg" onClick={() => window.location.reload()}>
            {t("Reload")}
          </Button>
          <Button
            size="lg"
            variant="secondary"
            onClick={() => {
              logout();
              window.localStorage.clear();
              window.location.assign("/");
            }}
          >
            {t("Logout / Clear cache")}
          </Button>
        </div>
        <code className="max-w-full px-2 py-0 shrink-0 bg-black/10 rounded-md text-sm whitespace-pre overflow-x-auto">
          {error?.message}
        </code>
        <code className="max-w-full shrink-0 p-2 bg-black/10 rounded-md text-xs whitespace-pre overflow-x-auto">
          {error?.stack}
        </code>
        <TwitterFeed className="flex justify-center w-[min(800px, calc(100vw - 40px))] h-[400px]" />
      </div>
    </div>
  );
}
