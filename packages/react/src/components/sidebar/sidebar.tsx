import { darkAtom } from "@/hooks/useTheme";
import { cn } from "@/lib/utils";
import { Button } from "@/shadcn/ui/button";
import { useAtom } from "jotai";
import { OrgSelectorCombobox } from "../org/OrgPicker";
import { useTranslation } from "react-i18next";
// import { ScrollArea } from "@/shadcn/ui/scroll-area"

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {
  onClose: () => void;
}

export function Sidebar({ className, id, onClose }: SidebarProps) {
  const { t } = useTranslation();
  const [dark, toggle] = useAtom(darkAtom);

  return (
    <div className={cn("pb-12 border-r-base-5 border-r", className)} id={id}>
      <div className="bg-base-2 min-h-[100dvh] space-y-2 py-2">
        <div className="flex gap-2 items-center px-4 pt-4 pb-2">
          <img src="/icons/uetchy_logo.png" className="ml-1.5 w-6 h-6" />
          <h2 className="text-2xl font-semibold tracking-tight">Holodex</h2>
          <div className="flex flex-grow" />
          <Button
            variant="ghost"
            className="md:hidden i-heroicons:x-mark p-4"
            onClick={onClose}
          />
        </div>
        <div className="px-3 py-2">
          <OrgSelectorCombobox />
          <h2 className="mb-2 px-4 font-semibold tracking-tight">Hololive</h2>
          <div className="space-y-1">
            <Button className="w-full justify-start" variant="default">
              <div className="i-heroicons:home"></div>
              {t("Home")}
            </Button>
            <Button className="w-full justify-start" variant="ghost">
              <span className="i-heroicons:user-group"></span>
              {t("Channels")}
            </Button>
          </div>
        </div>
        {/* <hr className="border-base" /> */}
        <div className="px-3 py-2">
          {/* <h2 className="mb-2 px-4 font-semibold tracking-tight">Holodex</h2> */}
          <div className="space-y-2">
            <Button className="w-full justify-start" variant="ghost">
              <span className="i-heroicons:heart"></span>
              {t("Favorites")}
            </Button>
            <Button className="w-full justify-start" variant="ghost">
              <span className="i-heroicons:rectangle-group"></span>
              {t("Multiview")}
            </Button>
            <Button className="w-full justify-start" variant="ghost">
              <span className="i-heroicons:musical-note"></span>
              {t("Musicdex")}
            </Button>
            <hr className="border-base" />
            <Button
              className="w-full justify-start text-base-11"
              variant="ghost"
            >
              <span className="i-heroicons:queue-list"></span>
              {t("Playlist")}
            </Button>
            <Button
              className="w-full justify-start text-base-11"
              variant="ghost"
            >
              <span className="i-heroicons:cog-6-tooth"></span>
              {t("Settings")}
            </Button>
            <Button
              className="w-full justify-start text-base-11"
              variant="ghost"
            >
              <span className="i-heroicons:information-circle"></span>
              {t("About")}
            </Button>
          </div>
        </div>
        <div className="py-2">
          {/* <h2 className="relative px-7 text-lg font-semibold tracking-tight">
            Favorites
          </h2> */}
          {/* <ScrollArea className="h-[300px] px-1">
            <div className="space-y-1 p-2">
              {playlists?.map((playlist, i) => (
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
              ))}
            </div>
          </ScrollArea> */}
        </div>
        {/* <div className="relative bottom-0">
          <Button
            size="icon"
            className="w-20 h-20"
            onClick={() => toggle(!dark)}
          >
            <div className="i-heroicons:sun-20-solid w-20 h-20 text-4xl" />
          </Button>
        </div> */}
      </div>
    </div>
  );
}
