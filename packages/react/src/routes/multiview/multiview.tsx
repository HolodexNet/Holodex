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
      <StickyBar />
    </>
  );
}

function StickyBar() {
  const { t } = useTranslation();
  const [open] = useAtom(isSidebarOpenAtom);
  const [isFullScreen] = useAtom(sidebarShouldBeFullscreenAtom);

  return (
    <div
      className={cn(
        "top-0 z-20 flex items-stretch justify-start overflow-x-auto rounded-none bg-base-2 p-2 transition-all md:px-10",
        //isStuckAtTop && "rounded-lg md:mx-8 md:px-2",
        !open ? "sticky" : isFullScreen ? "" : "sticky",
      )}
    >
      <div className="flex w-full max-w-full flex-nowrap justify-between bg-base-2">
        <div className="mr-2 w-3/5 shrink-0 grow-0 basis-auto">
          <Selector />
        </div>
        <div className="ml-2 w-2/5 shrink-0 grow-0 basis-auto">
          <ToolButtonContainer />
        </div>
      </div>
    </div>
  );
}
