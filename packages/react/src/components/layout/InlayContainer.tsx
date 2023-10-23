import {
  DetailedHTMLProps,
  HTMLAttributes,
  ReactNode,
  Suspense,
  useState,
} from "react";
import { Loading } from "../common/Loading";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/shadcn/ui/button";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";

interface InlayContainerProps {
  children: ReactNode;
}

export function InlayContainer({ children }: InlayContainerProps) {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [itemSelected, setItemSelected] = useState(false);

  return (
    <div className="flex justify-center gap-4 p-4 md:p-8">
      <div
        className={cn(
          "bg-base-3 flex h-fit w-full md:w-80 shrink-0 flex-col gap-2 rounded-lg px-2 py-4",
          { "hidden md:block": itemSelected },
        )}
        onClick={() => setItemSelected(true)}
      >
        {children}
      </div>
      <div
        className={cn("hidden md:block w-full max-w-screen-lg", {
          "flex flex-col gap-4": itemSelected,
        })}
      >
        <div className="bg-base-3 block w-full rounded-lg p-2 md:hidden">
          <Button
            size="lg"
            variant="link"
            className="w-full justify-start px-2"
            onClick={() => {
              navigate(-1);
              setItemSelected(false);
            }}
          >
            <div className="i-heroicons:chevron-left" />
            {t("component.mainNav.back")}
          </Button>
        </div>
        <div className="bg-base-3 w-full rounded-lg p-2 md:p-4">
          <Suspense fallback={<Loading size="xl" />}>
            <Outlet />
          </Suspense>
        </div>
      </div>
    </div>
  );
}

export interface InlayContainerTabItemProps {
  icon: DetailedHTMLProps<
    HTMLAttributes<HTMLDivElement>,
    HTMLDivElement
  >["className"];
  label: string;
  href: string;
}

export function InlayContainerTabItem({
  icon,
  label,
  href,
}: InlayContainerTabItemProps) {
  const location = useLocation();

  return (
    <Button
      asChild
      className="justify-start"
      size="lg"
      variant={href === location.pathname ? "secondary" : "ghost"}
    >
      <Link to={href}>
        <div className={icon} />
        {label}
      </Link>
    </Button>
  );
}
