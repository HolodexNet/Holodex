import { Badge } from "@/shadcn/ui/badge";
import { Link } from "react-router-dom";

export function TopicBadge({
  topic,
  size = "default",
  link,
}: {
  topic: string;
  size?: "default" | "sm" | "lg";
  link?: string;
}) {
  return (
    <Badge
      asChild={!!link}
      size={size}
      variant="outline"
      className="capitalize"
    >
      {link ? <Link to={link}>{topic}</Link> : topic}
    </Badge>
  );
}
