import { Toolbar } from "@/components/multiview/Toolbar";
import { SyncToolbar } from "@/components/multiview/SyncToolbar";
import { MultiviewGrid } from "@/components/multiview/MultiviewGrid";
import { MultiviewFrames } from "@/components/multiview/MultiviewFrames";
import { Helmet } from "@dr.pogodin/react-helmet";
import { AutoLayoutProvider, useAutoLayout } from "@/hooks/useAutoLayout";
import { useSetAtom, useAtomValue } from "jotai";
import {
  aspectClassAtom,
  editModeAtom,
  syncToolbarOpenAtom,
} from "@/store/multiview";
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
  const syncToolbarOpen = useAtomValue(syncToolbarOpenAtom);
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
    <div className="flex h-screen w-screen flex-col overflow-hidden select-none">
      <Helmet>
        <title>Multiview - Holodex</title>
      </Helmet>

      {/* Toolbar - fixed height */}
      <div
        id="multiview-banner"
        className="z-20 flex shrink-0 justify-start bg-background/80"
      >
        <Toolbar />
      </div>

      {/* Main grid area - fills remaining space */}
      <div className="relative min-h-0 flex-1">
        {/* Stable iframe layer - renders all frames using CSS Grid */}
        <MultiviewFrames />
        {/* Edit/control layer - uses react-grid-layout */}
        <MultiviewGrid className="h-full w-full" />
      </div>

      {/* Sync toolbar - appears at bottom when active */}
      {syncToolbarOpen && (
        <div className="z-20 shrink-0">
          <SyncToolbar />
        </div>
      )}

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
        <div className="fixed right-4 bottom-4 text-xs text-muted-foreground">
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
