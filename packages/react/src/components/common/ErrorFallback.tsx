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
    <div className=" h-full w-full overflow-y-auto p-8">
      <div className="mx-auto flex h-full w-full max-w-screen-lg flex-col items-center gap-4">
        <h2 className="text-3xl font-bold">{t("Gomenasorry!")}</h2>
        <p>
          <Trans>
            There was an error retrieving content, please check{" "}
            <a className="text-blue-500 underline" href="https://x.com/holodex">
              Twitter
            </a>{" "}
            or report an error through the{" "}
            <a
              className="text-blue-500 underline"
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
        <code className="max-w-full shrink-0 overflow-x-auto whitespace-pre rounded-md bg-black/10 px-2 py-0 text-sm">
          {error?.message}
        </code>
        <code className="max-w-full shrink-0 overflow-x-auto whitespace-pre rounded-md bg-black/10 p-2 text-xs">
          {error?.stack}
        </code>
        <TwitterFeed className="w-[min(800px, calc(100vw - 40px))] flex h-[400px] justify-center" />
      </div>
    </div>
  );
}
