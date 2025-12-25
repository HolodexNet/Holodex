import { Toolbar } from "@/components/multiview/Toolbar";
import { MultiviewGrid } from "@/components/multiview/MultiviewGrid";
import { Helmet } from "@dr.pogodin/react-helmet";
import { AutoLayoutProvider, useAutoLayout } from "@/hooks/useAutoLayout";
import { useSetAtom, useAtomValue } from "jotai";
import { aspectClassAtom, editModeAtom } from "@/store/multiview";
import { getAspectClass } from "@/lib/multiview-utils";
import { useEffect, useCallback } from "react";
import { useParams } from "react-router-dom";
import { decodeLayout } from "@/lib/multiview-utils";
import { cellQueueAtom, contentMapAtom } from "@/store/multiview";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/shadcn/ui/alert-dialog";
import { headerHiddenAtom } from "@/hooks/useFrame";

function MultiviewContent() {
  const { layout: layoutParam } = useParams<{ layout?: string }>();
  const setAspectClass = useSetAtom(aspectClassAtom);
  const setCells = useSetAtom(cellQueueAtom);
  const setContentMap = useSetAtom(contentMapAtom);
  const editMode = useAtomValue(editModeAtom);
  const makeHeaderHide = useSetAtom(headerHiddenAtom);

  useEffect(() => {
    makeHeaderHide(true);
    return () => makeHeaderHide(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const { showPrompt, confirmAutoLayout, cancelAutoLayout } = useAutoLayout();

  // Update aspect class based on viewport
  const updateAspectClass = useCallback(() => {
    const aspectClass = getAspectClass(window.innerWidth, window.innerHeight);
    setAspectClass(aspectClass);
  }, [setAspectClass]);

  useEffect(() => {
    updateAspectClass();
    window.addEventListener("resize", updateAspectClass);
    return () => window.removeEventListener("resize", updateAspectClass);
  }, [updateAspectClass]);

  // Load layout from URL param
  useEffect(() => {
    if (layoutParam) {
      try {
        const decoded = decodeLayout(layoutParam);
        setCells(decoded.cells);

        const newContentMap: Record<string, { videoCellIndex: number }> = {};
        decoded.cells.forEach((cell, index) => {
          if (cell.type === "video" && cell.videoId) {
            newContentMap[cell.videoId] = { videoCellIndex: index };
          }
        });
        setContentMap(newContentMap);
      } catch (e) {
        console.error("Failed to decode layout:", e);
      }
    }
  }, [layoutParam, setCells, setContentMap]);

  return (
    <div className="flex flex-col overflow-hidden select-none h-screen w-screen">
      <Helmet>
        <title>Multiview - Holodex</title>
      </Helmet>

      {/* Toolbar - fixed height */}
      <div
        id="multiview-banner"
        className="flex shrink-0 z-20 justify-start bg-background/80"
      >
        <Toolbar />
      </div>

      {/* Main grid area - fills remaining space */}
      <div className="relative flex-1 min-h-0">
        <MultiviewGrid className="h-full w-full" />
      </div>

      {/* Auto-layout confirmation dialog */}
      <AlertDialog open={showPrompt}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Apply Auto-Layout?</AlertDialogTitle>
            <AlertDialogDescription>
              You've made manual edits to the layout. Would you like to switch
              to a preset layout to fit the new video?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={cancelAutoLayout}>
              Keep Current Layout
            </AlertDialogCancel>
            <AlertDialogAction onClick={confirmAutoLayout}>
              Apply Auto-Layout
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Keyboard shortcut hint */}
      {editMode && (
        <div className="text-xs text-muted-foreground fixed bottom-4 right-4">
          Press ESC to exit edit mode
        </div>
      )}
    </div>
  );
}

export function Multiview() {
  return (
    <AutoLayoutProvider>
      <MultiviewContent />
    </AutoLayoutProvider>
  );
}
