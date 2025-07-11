import { Toolbar } from "@/components/multiview/Toolbar";
import { Helmet } from "@dr.pogodin/react-helmet";

// multiview skeleton
// selection bar at the top to change between orgs and allow url insertion
// grid page for drag and drop

export function Multiview() {
  return (
    <>
      <Helmet>
        <title>Multiview - Holodex</title>
      </Helmet>
      <div className="relative">
        <StickyBar />
      </div>
    </>
  );
}

function StickyBar() {
  const { t } = useTranslation();
  const [open] = useAtom(isSidebarOpenAtom);
  const [isFullScreen] = useAtom(sidebarShouldBeFullscreenAtom);
  const [isBarActive] = useAtom(multiViewPanelOpenAtom);
  const openPanel = useSetAtom(openMultiViewPanelAtom);

  return (
    <>
      <div
        className={cn(
          "top-0 z-20 flex max-w-full items-stretch justify-start overflow-x-auto rounded-none bg-base-2 p-2 transition-all md:px-10",
          //isStuckAtTop && "rounded-lg md:mx-8 md:px-2",
          !open ? "sticky" : isFullScreen ? "" : "sticky",
          isBarActive ? "visible" : "hidden",
        )}
      >
        <div className="flex w-full max-w-full flex-nowrap justify-between bg-base-2">
          <div className="mr-2 w-3/5 shrink-0 grow-0 basis-auto">
            <Selector />
          </div>
          <div className="ml-2 flex h-full w-2/5 shrink-0 grow-0 basis-auto items-center justify-end">
            <ToolButtonContainer />
          </div>
        </div>
      </div>
      <ToolButton
        className={cn(
          "right-2 top-0 z-20 rounded-none bg-base-2 p-1 transition-all md:px-5",
          // !open ? "sticky" : isFullScreen ? "" : "sticky",
          "absolute",
          isBarActive ? "hidden" : "visible",
        )}
        icon={{
          path: mdiChevronDown,
          tooltip: "Open Panel",
          onClick: openPanel,
        }}
      />
    </>
  );
}
