import { DetailedHTMLProps, HTMLAttributes, Suspense } from "react";
import { Loading } from "../common/Loading";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/shadcn/ui/button";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";

interface InlayContainerProps {
  routes: InlayContainerRoutes[];
}

export function InlayContainer({ routes }: InlayContainerProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const itemSelected = routes.some(({ href }) => href === location.pathname);

  return (
    <div className="flex justify-center gap-4 p-4 md:p-8">
      <div
        className={cn(
          "flex h-fit w-full shrink-0 flex-col gap-2 rounded-lg bg-base-2 p-2 md:w-72 xl:w-80",
          { "hidden md:flex": itemSelected },
        )}
      >
        {routes.map(({ href, icon, label }) => (
          <Button
            key={href + label}
            asChild
            className="gap-4 px-4 justify-start"
            size="lg"
            variant={href === location.pathname ? "default" : "ghost"}
          >
            <Link to={href}>
              <div className={icon} />
              {label}
            </Link>
          </Button>
        ))}
      </div>
      <div
        className={cn("hidden w-full max-w-(--breakpoint-lg) md:block", {
          "flex flex-col gap-4": itemSelected,
        })}
      >
        <div className="flex w-full flex-row items-center rounded-lg bg-base-2 p-2 md:hidden">
          <Button
            size="lg"
            variant="link"
            className="w-12 justify-start px-2"
            onClick={() => navigate(-1)}
          >
            <div className="i-heroicons:chevron-left" />
          </Button>
          <h2 className="flex-1 text-center text-lg font-semibold mr-12 md:text-2xl">
            {routes.find(({ href }) => href === location.pathname)?.label}
          </h2>
        </div>
        <div className="w-full rounded-lg p-2 md:p-4 bg-baseA-2 xl:p-8">
          <Suspense fallback={<Loading size="xl" />}>
            <Outlet />
          </Suspense>
        </div>
        <div className="block w-full rounded-lg bg-base-2 p-2 md:hidden">
          <Button
            size="lg"
            variant="link"
            className="w-full justify-start px-2"
            onClick={() => navigate(-1)}
          >
            <div className="i-heroicons:chevron-left" />
            {t("component.mainNav.back")}
          </Button>
        </div>
      </div>
    </div>
  );
}

export interface InlayContainerRoutes {
  icon: DetailedHTMLProps<
    HTMLAttributes<HTMLDivElement>,
    HTMLDivElement
  >["className"];
  label: string;
  href: string;
}
