import { DetailedHTMLProps, HTMLAttributes, ReactNode, Suspense } from "react";
import { Loading } from "../common/Loading";
import { Link, Outlet, useLocation } from "react-router-dom";
import { Button } from "@/shadcn/ui/button";

interface InlayContainerProps {
  children: ReactNode;
}

export function InlayContainer({ children }: InlayContainerProps) {
  return (
    <div className="flex justify-center gap-4 p-4 md:p-8">
      <div className="flex h-fit w-80 shrink-0 flex-col gap-2 rounded-lg bg-base-3 px-2 py-4">
        {children}
      </div>
      <div className="w-full max-w-screen-lg rounded-lg bg-base-3 p-2 md:p-4">
        <Suspense fallback={<Loading size="xl" />}>
          <Outlet />
        </Suspense>
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
