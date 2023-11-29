import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";
import { DetailedHTMLProps, HTMLAttributes } from "react";
import { ApiError } from "./ApiError";
import { HTTPError } from "@/lib/fetch";
import { Button } from "@/shadcn/ui/button";
import { useTranslation } from "react-i18next";

interface LoadingProps {
  size: "sm" | "md" | "lg" | "xl";
  error?: HTTPError | null;
}

export function Loading(
  props: DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement> &
    LoadingProps,
) {
  const sizeCN = cn({
    "text-sm": props.size === "sm",
    "text-lg": props.size === "md",
    "text-2xl": props.size === "lg",
    "text-4xl": props.size === "xl",
  });

  if (props.error) return <ApiError error={props.error} />;

  // I can't use a UNOCSS icon here because it doesn't work in Firefox...
  // shows a weird white border around the icon
  // https://bugzilla.mozilla.org/show_bug.cgi?id=1671784 wow it's fixed on firefox NEXT version...
  return (
    <div
      {...props}
      className={cn(
        "flex w-full h-full justify-center items-center",
        props.className,
      )}
    >
      <Loader2 className="animate-spin" />
    </div>
  );
}

export function VirtuosoLoadingFooter({
  context,
}: {
  context?: {
    size: "sm" | "md" | "lg" | "xl";
    isLoading: boolean;
    hasNextPage: boolean;
    loadMore?: () => void;
  } & DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement>;
}) {
  const { t } = useTranslation();

  return context?.isLoading ? (
    <Loading {...context} />
  ) : context?.hasNextPage ? (
    <Button
      variant="outline"
      className="mt-4 w-full"
      onClick={context.loadMore}
    >
      {t("component.channelList.loadMore")}
    </Button>
  ) : undefined;
}

export function GlobalLoading() {
  return (
    <div className="fixed left-0 top-0 h-full w-full">
      <Loading size="xl" />
    </div>
  );
}
