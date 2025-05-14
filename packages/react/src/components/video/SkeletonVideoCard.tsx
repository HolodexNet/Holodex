import { Skeleton } from "@/shadcn/ui/skeleton";

export function SkeletonVideoCard() {
  return (
    <div className="flex w-full flex-col gap-4">
      <Skeleton className="aspect-video w-full rounded-md" />
      <div className="flex gap-2">
        <Skeleton className="h-8 w-8 shrink-0 rounded-full" />
        <div className="flex w-full flex-col gap-2">
          <Skeleton className="h-4 rounded-md w-2/3" />
          <Skeleton className="h-4 rounded-md w-1/3" />
        </div>
      </div>
    </div>
  );
}
