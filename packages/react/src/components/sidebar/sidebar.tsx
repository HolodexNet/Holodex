import { cn } from "@/lib/utils"
import { Button } from "@/shadcn/ui/button"
import { ScrollArea } from "@/shadcn/ui/scroll-area"
import { HiOutlineHome, HiUserGroup } from "react-icons/hi"
import { HiRectangleGroup, HiOutlineQueueList, HiOutlineMusicalNote, HiOutlineInformationCircle } from "react-icons/hi2"

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {
}

export function Sidebar({ className }: SidebarProps) {
  return (
    <div className={cn("pb-12", className)}>
      <div className="space-y-4 py-4">
        <div className="px-3 py-2">
          <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">
            Hololive
          </h2>
          <div className="space-y-1">
            <Button variant="secondary" className="w-full justify-start">
              <HiOutlineHome /> Home
            </Button>
            <Button variant="ghost" className="w-full justify-start">
              <HiUserGroup /> Channels
            </Button>
            {/* <Button variant="ghost" className="w-full justify-start">
              Radio
            </Button> */}
          </div>
        </div>
        <div className="px-3 py-2">
          <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">
            Holodex
          </h2>
          <div className="space-y-1">
            <Button variant="ghost" className="w-full justify-start">
              <HiRectangleGroup />
              Multiview
            </Button>
            <Button variant="ghost" className="w-full justify-start">
              <HiOutlineQueueList />
              Playlist
            </Button>
            <Button variant="ghost" className="w-full justify-start">
              <HiOutlineMusicalNote />
              Music
            </Button>
            <Button variant="ghost" className="w-full justify-start">
              <HiOutlineInformationCircle />
              Artists
            </Button>
            <Button variant="ghost" className="w-full justify-start">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="mr-2 h-4 w-4"
              >
                <path d="m16 6 4 14" />
                <path d="M12 6v14" />
                <path d="M8 8v12" />
                <path d="M4 4v16" />
              </svg>
              Albums
            </Button>
          </div>
        </div>
        <div className="py-2">
          <h2 className="relative px-7 text-lg font-semibold tracking-tight">
            Playlists
          </h2>
          <ScrollArea className="h-[300px] px-1">
            <div className="space-y-1 p-2">
              {/* {playlists?.map((playlist, i) => (
                <Button
                  key={`${playlist}-${i}`}
                  variant="ghost"
                  className="w-full justify-start font-normal"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="mr-2 h-4 w-4"
                  >
                    <path d="M21 15V6" />
                    <path d="M18.5 18a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z" />
                    <path d="M12 12H3" />
                    <path d="M16 6H3" />
                    <path d="M12 18H3" />
                  </svg>
                  {playlist}
                </Button>
              ))} */}
            </div>
          </ScrollArea>
        </div>
      </div>
    </div>
  )
}