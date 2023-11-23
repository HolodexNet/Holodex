import { FallbackProps } from "react-error-boundary";
import { Trans, useTranslation } from "react-i18next";
import { TwitterFeed } from "./TwitterFeed";
import { useRouteError } from "react-router-dom";
import { Button } from "@/shadcn/ui/button";
import { useAuth } from "@/hooks/useAuth";

export function ErrorFallback(props?: Partial<FallbackProps>) {
  const routeError = useRouteError() as Error | null;
  const { t } = useTranslation();
  const { logout } = useAuth();

  const error = routeError ?? (props?.error as Error | null);

  return (
    <div className="h-full w-full overflow-y-auto p-8">
      <div className="mx-auto flex h-full w-full max-w-screen-lg flex-col items-center gap-4">
        <h2 className="text-3xl font-bold">{t("component.apiError.title")}</h2>
        <p>
          <Trans
            i18nKey="component.apiError.text"
            components={{
              twitter: (
                <a
                  className="text-blue-500 underline"
                  href="https://x.com/holodex"
                >
                  Twitter
                </a>
              ),
              discord: (
                <a
                  className="text-blue-500 underline"
                  href="https://discord.gg/jctkgHBt4b"
                >
                  Discord
                </a>
              ),
            }}
          />
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <Button size="lg" onClick={() => window.location.reload()}>
            {t("component.apiError.reload")}
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
            {t("component.apiError.logoutAndClearCache")}
          </Button>
        </div>
        <code className="max-w-full shrink-0 overflow-x-auto whitespace-pre-wrap rounded-md bg-black/10 px-2 py-0 text-sm">
          {error?.message}
        </code>
        <code className="max-w-full shrink-0 overflow-x-auto whitespace-pre-wrap rounded-md bg-black/10 p-2 text-xs">
          {error?.stack}
        </code>
        <TwitterFeed className="flex h-[400px] w-[min(800px,calc(100vw-40px))] justify-center" />
      </div>
    </div>
  );
}
