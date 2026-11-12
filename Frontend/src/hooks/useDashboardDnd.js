import { useState } from "react";
import {
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";

export default function useDashboardDnd({
  selectedCollection,
  myCollections,
  customDishes,
  onEditDish,
  onDeleteDish,
  onEditCollection,
  onDeleteCollection,
}) {
  const [activeDragId, setActiveDragId] = useState(null);
  const [activeDragType, setActiveDragType] = useState(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 200, tolerance: 8 },
    }),
  );

  const activeDragDish = activeDragId
    ? selectedCollection?.dishes?.find((d) => d.id === activeDragId) ||
      customDishes?.find((d) => d.id === activeDragId)
    : null;

  const activeDragCollection =
    activeDragId && activeDragType === "collection"
      ? myCollections?.find((c) => `col-${c.id}` === activeDragId)
      : null;

  const isDropZoneVisible = Boolean(
    (activeDragType === "dish" && activeDragDish && !activeDragDish.isCustom) ||
    (activeDragType === "collection" && activeDragCollection)
  );

  const handleDragStart = (event) => {
    setActiveDragId(event.active.id);
    setActiveDragType(event.active.data.current?.type);
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    setActiveDragId(null);
    setActiveDragType(null);

    if (over && active.data.current) {
      const { type, dish, collection } = active.data.current;

      if (type === "dish" && !dish.isCustom) {
        if (over.id === "edit-drop") onEditDish?.(dish);
        else if (over.id === "delete-drop") onDeleteDish?.(dish);
      } else if (type === "collection") {
        if (over.id === "edit-drop") onEditCollection?.(collection);
        else if (over.id === "delete-drop") onDeleteCollection?.(collection);
      }
    }
  };

  const handleDragCancel = () => {
    setActiveDragId(null);
    setActiveDragType(null);
  };

  return {
    sensors,
    activeDragId,
    activeDragType,
    activeDragDish,
    activeDragCollection,
    isDropZoneVisible,
    handleDragStart,
    handleDragEnd,
    handleDragCancel,
  };
}
