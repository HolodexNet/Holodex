import { HTTPError } from "@/lib/fetch";
import { Button } from "@/shadcn/ui/button";
import { TypographyH3 } from "@/shadcn/ui/typography";
import { useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";

export function ApiError({ error }: { error: HTTPError }) {
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  return (
    <div className="flex grow flex-col items-center justify-center gap-4">
      <div className="i-heroicons:exclamation-circle text-4xl" />
      <TypographyH3>{t("component.apiError.title")}</TypographyH3>
      <code>{error.message}</code>
      <Button
        onClick={() =>
          queryClient.refetchQueries({ stale: true, type: "active" })
        }
      >
        <div className="i-heroicons:arrow-path" />
        Retry
      </Button>
    </div>
  );
}
