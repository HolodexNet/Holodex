import { Button } from "@/shadcn/ui/button";
import { Helmet } from "react-helmet-async";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

export default function NotFound() {
  const { t } = useTranslation();

  return (
    <>
      <Helmet>
        <title>{t("views.notFound.title")} - Holodex</title>
      </Helmet>
      <div className="text-center">
        <h1 className="my-10 text-xl font-bold">{t("views.notFound.title")}</h1>
        <Button asChild variant="secondary">
          <Link to="/">{t("views.notFound.back")}</Link>
        </Button>
      </div>
    </>
  );
}
