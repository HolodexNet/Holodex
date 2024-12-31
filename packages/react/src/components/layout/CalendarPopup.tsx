import { calendarDialogAtom } from "@/hooks/useFrame";
import { Dialog, DialogClose, DialogContent } from "@/shadcn/ui/dialog";
import { useAtom } from "jotai";
import React from "react";

const LazyCalendarContent = React.lazy(
  () => import("@/components/header/calendarDialog"),
);
export function CalendarGeneratorPopup() {
  const [{ open, initialQuery }, setDialog] = useAtom(calendarDialogAtom);

  return (
    <Dialog open={open}>
      <DialogContent>
        <DialogClose
          onClick={() => setDialog((x) => ({ ...x, open: false }))}
        />

        {open && <LazyCalendarContent initialQuery={initialQuery} />}
      </DialogContent>
    </Dialog>
  );
}
