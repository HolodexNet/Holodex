import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Skeleton } from "@/components/ui/skeleton";
import { SearchIcon, RefreshIcon } from "@/components/icons";
import { avatar } from "@/lib/api";
import { channelName } from "@/lib/preferences";
import type { Channel } from "@/lib/types";

export function Choice({
  value,
  onChange,
  options,
  label,
  className,
}: {
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  label: string;
  className?: string;
}) {
  return (
    <Select
      value={value}
      onValueChange={(value) => {
        if (value !== null) onChange(value);
      }}
      items={options}
    >
      <SelectTrigger aria-label={label} className={className}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent alignItemWithTrigger={false}>
        {options.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
export function IconButton({
  label,
  children,
  className,
  ...props
}: React.ComponentProps<typeof Button> & { label: string }) {
  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <Button
            variant="ghost"
            size="icon"
            aria-label={label}
            className={className}
            {...props}
          />
        }
      >
        {children}
      </TooltipTrigger>
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  );
}
export function Avatar({
  channel,
  className = "size-9",
}: {
  channel: Channel;
  className?: string;
}) {
  return (
    <span
      className={`relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-muted text-xs font-semibold ${className}`}
    >
      <span aria-hidden>{channelName(channel).slice(0, 1)}</span>
      <img
        className="absolute inset-0 size-full object-cover"
        src={avatar(channel)}
        alt=""
        loading="lazy"
        referrerPolicy="no-referrer"
        onError={(e) => {
          e.currentTarget.hidden = true;
        }}
      />
    </span>
  );
}
export function EmptyState({
  title,
  description,
  children,
  icon = <SearchIcon />,
}: {
  title: string;
  description: string;
  children?: ReactNode;
  icon?: ReactNode;
}) {
  return (
    <div className="flex min-h-64 flex-col items-center justify-center rounded-2xl border border-dashed bg-card/50 px-6 py-12 text-center">
      <span className="mb-4 flex size-12 items-center justify-center rounded-2xl bg-muted text-muted-foreground [&_svg]:size-6">
        {icon}
      </span>
      <h3 className="mb-2 text-base font-semibold">{title}</h3>
      <p className="mb-5 max-w-sm text-sm leading-6 text-muted-foreground">
        {description}
      </p>
      {children}
    </div>
  );
}
export function ErrorState({
  error,
  retry,
}: {
  error: Error;
  retry: () => void;
}) {
  return (
    <div
      role="alert"
      className="my-6 rounded-2xl border border-destructive/20 bg-destructive/5 p-6"
    >
      <h3 className="font-semibold">Unable to load this page</h3>
      <p className="my-2 text-sm text-muted-foreground">{error.message}</p>
      <Button variant="outline" onClick={retry}>
        <RefreshIcon />
        Try again
      </Button>
    </div>
  );
}
export function LoadingCards() {
  return (
    <div className="video-grid" aria-label="Loading videos" role="status">
      {Array.from({ length: 6 }, (_, i) => (
        <div key={i} className="space-y-3">
          <Skeleton className="aspect-video w-full rounded-xl" />
          <Skeleton className="h-4 w-4/5" />
          <Skeleton className="h-3 w-1/2" />
        </div>
      ))}
    </div>
  );
}
export function PageHeading({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children?: ReactNode;
}) {
  return (
    <div className="mb-7 flex flex-wrap items-center justify-between gap-4">
      <div className="min-w-0 flex-1">
        <h1 className="text-2xl font-semibold tracking-[-.035em] sm:text-[28px]">
          {title}
        </h1>
        <p className="mt-1.5 text-sm text-muted-foreground">{description}</p>
      </div>
      {children}
    </div>
  );
}
export const BrowseChannels = () => (
  <Button render={<Link to="/channels" />}>Browse channels</Button>
);
export const languages = [
  { value: "all", label: "All languages" },
  { value: "en", label: "English" },
  { value: "ja", label: "Japanese" },
  { value: "id", label: "Indonesian" },
  { value: "ko", label: "Korean" },
  { value: "zh", label: "Chinese" },
  { value: "es", label: "Spanish" },
];
