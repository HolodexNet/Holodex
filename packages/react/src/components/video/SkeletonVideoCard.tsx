import { Skeleton } from "@/shadcn/ui/skeleton";

export function SkeletonVideoCard() {
  return (
    <div className="w-full flex flex-col gap-4">
      <Skeleton className="w-full aspect-video rounded-md" />
      <div className="flex gap-2">
        <Skeleton className="w-8 h-8 shrink-0 rounded-full" />
        <div className="w-full flex flex-col gap-2">
          <Skeleton className="w-2/3 h-4 rounded-md" />
          <Skeleton className="w-1/3 h-4 rounded-md" />
        </div>
      </div>
    </div>
  );
}