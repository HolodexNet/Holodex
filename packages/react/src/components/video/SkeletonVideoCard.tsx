import { Skeleton } from "@/shadcn/ui/skeleton";

export function SkeletonVideoCard() {
  return (
    <div className="w-full flex flex-col gap-4">
      <Skeleton className="w-full aspect-video rounded-md" />
      <div className="flex gap-2">
        <Skeleton className="w-6 h-6 rounded-full" />
        <div className="flex flex-col gap-0">
          <Skeleton className="w-2/3 h-2 rounded-md" />
          <Skeleton className="w-1/3 h-2 rounded-md" />
        </div>
      </div>
    </div>
  );
}
