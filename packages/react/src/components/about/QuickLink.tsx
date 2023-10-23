import { Button } from "@/shadcn/ui/button";
import { DetailedHTMLProps, HTMLAttributes } from "react";
import { Link } from "react-router-dom";

export interface QuickLinkProps {
  className?: DetailedHTMLProps<
    HTMLAttributes<HTMLButtonElement>,
    HTMLButtonElement
  >["className"];
  icon: DetailedHTMLProps<
    HTMLAttributes<HTMLDivElement>,
    HTMLDivElement
  >["className"];
  label: string;
  href: string;
}

export function QuickLink({ className, icon, label, href }: QuickLinkProps) {
  return (
    <Button className={className} size="lg" variant="outline" asChild>
      <Link to={href} target="_blank">
        <div className={icon} />
        {label}
      </Link>
    </Button>
  );
}
