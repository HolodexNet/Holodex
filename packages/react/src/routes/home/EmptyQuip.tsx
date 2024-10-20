// EmptyQuip.tsx
import { useState } from "react";
import { useTranslation } from "react-i18next";

export function EmptyQuip() {
  const { t } = useTranslation();
  const [randN] = useState(Math.floor(Math.random() * 100));
  const emptyTranslations = (
    t("views.home.noLiveStreams", { returnObjects: true }) as string[]
  ).filter((x) => !!x);

  if (!emptyTranslations) return null;

  return (
    <div className="p-4 text-base-11 md:px-8">
      {emptyTranslations[randN % emptyTranslations.length]}
    </div>
  );
}
