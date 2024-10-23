import { FallbackProps } from "react-error-boundary";
import { Trans, useTranslation } from "react-i18next";
import { StatusTweetEmbed } from "./TwitterFeed";
import { Button } from "@/shadcn/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/shadcn/ui/card";
import { Alert, AlertDescription } from "@/shadcn/ui/alert";
import { userAtom, tokenAtom } from "@/store/auth";
import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from "@/shadcn/ui/collapsible";
import { useSetAtom, useAtom } from "jotai";
import { useState, useCallback, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";

export function ErrorFallback({
  error,
  resetErrorBoundary,
}: Partial<FallbackProps>) {
  const { t } = useTranslation();
  const setUser = useSetAtom(userAtom);
  const [token, setToken] = useAtom(tokenAtom);
  const [isDebugOpen, setIsDebugOpen] = useState(false);

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
  }, [setToken, setUser]);

  // Error fallback releases if you navigate away.
  const location = useLocation();
  const flag = useRef(0); // ← the "flag"
  useEffect(() => {
    if (flag.current) {
      console.log("Releasing Error Fallback");
      resetErrorBoundary?.();
    } else
      setTimeout(() => {
        flag.current += 1;
      }, 500);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  return (
    <div className="p-4 sm:p-8">
      <Card className="mx-auto max-w-2xl bg-base-4">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold text-secondary">
            {t("component.apiError.title")}
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          <Alert>
            <AlertDescription className="text-center text-base">
              <Trans
                i18nKey="component.apiError.text"
                components={{
                  twitter: (
                    <a
                      key="twitterlink"
                      className="font-medium text-primary hover:underline"
                      href="https://x.com/holodex"
                      target="_blank"
                      rel="noopener noreferrer"
                    ></a>
                  ),
                  discord: (
                    <a
                      className="font-medium text-primary hover:underline"
                      href="https://discord.gg/jctkgHBt4b"
                      target="_blank"
                      rel="noopener noreferrer"
                    ></a>
                  ),
                }}
              />
            </AlertDescription>
          </Alert>

          <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
            <Button
              size="lg"
              variant="primary"
              onClick={() => window.location.reload()}
              className="gap-2"
            >
              <div className="i-lucide:refresh-ccw h-4 w-4" />
              {t("component.apiError.reload")}
            </Button>
            <Button
              size="lg"
              variant="ghost-secondary"
              onClick={() => {
                logout();
                window.localStorage.clear();
                window.location.assign("/");
              }}
              className="gap-2"
            >
              <div className="i-lucide:log-out h-4 w-4" />
              {t("component.apiError.logoutAndClearCache")}
            </Button>
          </div>

          <Collapsible
            open={isDebugOpen}
            onOpenChange={setIsDebugOpen}
            className=""
          >
            <CollapsibleTrigger className="flex w-full items-center justify-between rounded-lg border border-base-6 p-4 font-medium hover:bg-muted">
              Debug Information
              <div
                className={`i-lucide:chevron-down h-4 w-4 transition-transform duration-200 ${
                  isDebugOpen ? "rotate-180" : ""
                }`}
              />
            </CollapsibleTrigger>
            <CollapsibleContent className="">
              <code className="bg-muted/50 my-2 block w-full overflow-x-auto rounded-lg px-4">
                {error?.message}
              </code>
              <code className="bg-muted/50 block w-full overflow-x-auto rounded-lg px-4 text-xs">
                {error?.stack}
              </code>
            </CollapsibleContent>
          </Collapsible>

          <div className="mx-auto max-w-md">
            <StatusTweetEmbed />
          </div>
        </CardContent>

        <CardFooter className="justify-center text-sm text-base-8">
          © Holodex
        </CardFooter>
      </Card>
    </div>
  );
}
