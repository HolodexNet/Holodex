import { AboutDescription } from "@/components/about/Description";
import { AboutHeading } from "@/components/about/Heading";
import { localeAtom } from "@/store/i18n";
import { useAtomValue } from "jotai";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

export function AboutPrivacy() {
  const { dayjs } = useAtomValue(localeAtom);
  const { t } = useTranslation();

  return (
    <div>
      <AboutHeading>{t("about.privacy.heading.top")}</AboutHeading>
      <AboutDescription>
        {t("about.privacy.lastUpdated", {
          date: dayjs("2023-04-29").format("LL"),
        })}
      </AboutDescription>
      <AboutHeading>{t("about.privacy.heading.1")}</AboutHeading>
      <AboutDescription>{t("about.privacy.text.1-1")}</AboutDescription>
      <AboutDescription>{t("about.privacy.text.1-2")}</AboutDescription>
      <AboutHeading>{t("about.privacy.heading.2")}</AboutHeading>
      <AboutDescription>{t("about.privacy.text.2-1")}</AboutDescription>
      <AboutDescription>{t("about.privacy.text.2-2")}</AboutDescription>
      <AboutHeading>{t("about.privacy.heading.3")}</AboutHeading>
      <AboutDescription>{t("about.privacy.text.3-1")}</AboutDescription>
      <AboutHeading>{t("about.privacy.heading.4")}</AboutHeading>
      <AboutDescription>{t("about.privacy.text.4-1")}</AboutDescription>
      <AboutHeading>{t("about.privacy.heading.5")}</AboutHeading>
      <AboutDescription>
        {t("about.privacy.text.5-1")}{" "}
        <Link className="text-secondary-11 hover:underline" to="/about/contact">
          {t("about.privacy.text.5-2")}
        </Link>
      </AboutDescription>
    </div>
  );
}
