import React, { ReactNode, useEffect, useState } from "react";
import { useOrgs } from "@/services/orgs.service";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { Props as DndContextProps } from "@dnd-kit/core/dist/components/DndContext/DndContext.d.ts";
import { ScrollArea } from "@/shadcn/ui/scroll-area";

export const OrgReranker = ({
  rankedOrgs,
  setRankedOrgs,
}: {
  rankedOrgs: Org[];
  setRankedOrgs: (orgs: Org[]) => void;
}) => {
  const { data: allOrgs } = useOrgs();
  const [starredOrgs, setStarredOrgs] = useState<Org[]>([]);
  const [unstarredOrgs, setUnstarredOrgs] = useState<Org[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  useEffect(() => {
    if (allOrgs) {
      const starred = rankedOrgs.filter((org) =>
        allOrgs.some((allOrg) => allOrg.name === org.name),
      );
      const unstarred = allOrgs.filter(
        (org) => !rankedOrgs.some((rankedOrg) => rankedOrg.name === org.name),
      );
      setStarredOrgs(starred);
      setUnstarredOrgs(unstarred);
    }
  }, [allOrgs, rankedOrgs]);

  const handleDragEnd: DndContextProps["onDragEnd"] = (event) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      setStarredOrgs((items) => {
        const oldIndex = items.findIndex((item) => item.name === active.id);
        const newIndex = items.findIndex((item) => item.name === over?.id);

        const newItems = arrayMove(items, oldIndex, newIndex);
        setRankedOrgs([...newItems]);
        return newItems;
      });
    }
  };

  const toggleStar = (org: Org, remove?: boolean) => {
    if (remove) {
      setRankedOrgs(
        starredOrgs.filter((starredOrg) => starredOrg.name !== org.name),
      );
    } else {
      setRankedOrgs([...starredOrgs, org]);
    }
  };

  const filteredUnstarredOrgs = unstarredOrgs.filter((org) =>
    org.name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="grid gap-4 grid-cols-1 min-w-72 lg:grid-cols-2">
      <div>
        <div>
          <h3 className="mb-2 font-semibold text-lg text-center">Starred</h3>
        </div>
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={starredOrgs.map((org) => org.name)}
            strategy={verticalListSortingStrategy}
          >
            {starredOrgs.map((org) => (
              <SortableItem key={"draggable" + org.name} id={org.name}>
                <div className="flex h-10 items-center justify-between my-1 p-2 rounded cursor-grab">
                  <div className="mr-1 i-mdi:drag"></div>
                  <span className="grow">{org.name}</span>
                  <button
                    onClick={() => toggleStar(org, true)}
                    className="text-yellow-500 hover:text-yellow-600"
                  >
                    <div className="text-lg i-fluent:star-off-16-regular" />
                  </button>
                </div>
              </SortableItem>
            ))}
          </SortableContext>
        </DndContext>
      </div>

      <div className="">
        <h3 className="mb-2 text-center text-lg font-semibold">
          Other Organizations
        </h3>
        <div className="flex w-full text-sm h-9 rounded-md border border-base px-3 focus-within: bg-transparent shadow-xs rounded-b-none transition-colors focus-within:ring-2 focus-within:outline-hidden">
          <input
            type="text"
            placeholder="Filter organizations..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-transparent placeholder: border-none outline-hidden border-0 border-transparent"
          />
        </div>
        <ScrollArea className="rounded-md border px-1 h-60 rounded-b rounded-t-none md:h-80">
          {filteredUnstarredOrgs.map((org) => (
            <div
              key={"unstarred-" + org.name}
              className="my-1 flex items-center justify-between rounded p-2"
            >
              <span>{org.name}</span>
              <button
                onClick={() => toggleStar(org)}
                className="text-gray-500 hover:text-gray-600"
              >
                <div className="text-lg i-heroicons:star" />
              </button>
            </div>
          ))}{" "}
        </ScrollArea>
      </div>
    </div>
  );
};

export function SortableItem({
  id,
  children,
}: {
  id: string;
  children: ReactNode;
}) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({
      id: id,
      strategy: verticalListSortingStrategy,
    });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      {children}
    </div>
  );
}
