"use client";

import {
  type Announcements,
  closestCenter,
  closestCorners,
  DndContext,
  type DndContextProps,
  type DragEndEvent,
  type DraggableAttributes,
  type DraggableSyntheticListeners,
  DragOverlay,
  type DragStartEvent,
  type DropAnimation,
  defaultDropAnimationSideEffects,
  KeyboardSensor,
  MouseSensor,
  type ScreenReaderInstructions,
  TouchSensor,
  type UniqueIdentifier,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  restrictToHorizontalAxis,
  restrictToParentElement,
  restrictToVerticalAxis,
} from "@dnd-kit/modifiers";
import {
  arrayMove,
  horizontalListSortingStrategy,
  SortableContext,
  type SortableContextProps,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Slot } from "@radix-ui/react-slot";
import * as React from "react";
import * as ReactDOM from "react-dom";
import { useComposedRefs } from "@/lib/compose-refs";
import { cn } from "@/lib/utils";

const orientationConfig = {
  vertical: {
    modifiers: [restrictToVerticalAxis, restrictToParentElement],
    strategy: verticalListSortingStrategy,
    collisionDetection: closestCenter,
  },
  horizontal: {
    modifiers: [restrictToHorizontalAxis, restrictToParentElement],
    strategy: horizontalListSortingStrategy,
    collisionDetection: closestCenter,
  },
  mixed: {
    modifiers: [restrictToParentElement],
    strategy: undefined,
    collisionDetection: closestCorners,
  },
};

const ROOT_NAME = "Sortable";
const CONTENT_NAME = "SortableContent";
const ITEM_NAME = "SortableItem";
const ITEM_HANDLE_NAME = "SortableItemHandle";
const OVERLAY_NAME = "SortableOverlay";

interface SortableRootContextValue<T> {
  id: string;
  items: UniqueIdentifier[];
  modifiers: DndContextProps["modifiers"];
  strategy: SortableContextProps["strategy"];
  activeId: UniqueIdentifier | null;
  setActiveId: (id: UniqueIdentifier | null) => void;
  getItemValue: (item: T) => UniqueIdentifier;
  flatCursor: boolean;
}

interface GetItemValue<T> {
  /**
   * Callback that returns a unique identifier for each sortable item. Required for array of objects.
   * @example getItemValue={(item) => item.id}
   */
  getItemValue: (item: T) => UniqueIdentifier;
}

type SortableRootProps<T> = DndContextProps &
  (T extends object ? GetItemValue<T> : Partial<GetItemValue<T>>) & {
    value: T[];
    onValueChange?: (items: T[]) => void;
    onMove?: (
      event: DragEndEvent & { activeIndex: number; overIndex: number },
    ) => void;
    strategy?: SortableContextProps["strategy"];
    orientation?: "vertical" | "horizontal" | "mixed";
    flatCursor?: boolean;
  };

const SortableRootPropsContext =
  React.createContext<SortableRootProps<unknown> | null>(null);
const SortableRootIdContext = React.createContext<string | null>(null);
const SortableRootActiveIdContext =
  React.createContext<UniqueIdentifier | null | undefined>(undefined);
const SortableRootSetActiveIdContext = React.createContext<
  React.Dispatch<React.SetStateAction<UniqueIdentifier | null>> | undefined
>(undefined);

function useSortableContext(consumerName: string) {
  const props = React.useContext(SortableRootPropsContext);
  const id = React.useContext(SortableRootIdContext);
  const activeId = React.useContext(SortableRootActiveIdContext);
  const setActiveId = React.useContext(SortableRootSetActiveIdContext);

  if (
    props === null ||
    id === null ||
    activeId === undefined ||
    setActiveId === undefined
  ) {
    throw new Error(`\`${consumerName}\` must be used within \`${ROOT_NAME}\``);
  }

  const orientation = props.orientation ?? "vertical";
  const config = orientationConfig[orientation];
  const getItemValue = (item: unknown): UniqueIdentifier => {
    if (typeof item === "object" && !props.getItemValue) {
      throw new Error("`getItemValue` is required when using array of objects");
    }
    return props.getItemValue
      ? props.getItemValue(item)
      : (item as UniqueIdentifier);
  };

  return {
    id,
    items: props.value.map((item) => getItemValue(item)),
    modifiers: props.modifiers ?? config.modifiers,
    strategy: props.strategy ?? config.strategy,
    activeId,
    setActiveId,
    getItemValue,
    flatCursor: props.flatCursor ?? false,
  } satisfies SortableRootContextValue<unknown>;
}

function SortableRoot<T>(props: SortableRootProps<T>) {
  const {
    value,
    onValueChange,
    collisionDetection,
    modifiers,
    onMove,
    orientation = "vertical",
    getItemValue: getItemValueProp,
    accessibility,
    ...sortableProps
  } = props;

  const id = React.useId();
  const [activeId, setActiveId] = React.useState<UniqueIdentifier | null>(null);

  const sensors = useSensors(
    useSensor(MouseSensor),
    useSensor(TouchSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );
  const config = orientationConfig[orientation];

  const getItemValue = (item: T): UniqueIdentifier => {
    if (typeof item === "object" && !getItemValueProp) {
      throw new Error("`getItemValue` is required when using array of objects");
    }
    return getItemValueProp
      ? getItemValueProp(item)
      : (item as UniqueIdentifier);
  };

  const onDragStart = (event: DragStartEvent) => {
    sortableProps.onDragStart?.(event);

    if (event.activatorEvent.defaultPrevented) return;

    setActiveId(event.active.id);
  };

  const onDragEnd = (event: DragEndEvent) => {
    sortableProps.onDragEnd?.(event);

    if (event.activatorEvent.defaultPrevented) return;

    const { active, over } = event;
    if (over && active.id !== over?.id) {
      const activeIndex = value.findIndex(
        (item) => getItemValue(item) === active.id,
      );
      const overIndex = value.findIndex(
        (item) => getItemValue(item) === over.id,
      );

      if (onMove) {
        onMove({ ...event, activeIndex, overIndex });
      } else {
        onValueChange?.(arrayMove(value, activeIndex, overIndex));
      }
    }
    setActiveId(null);
  };

  const onDragCancel = (event: DragEndEvent) => {
    sortableProps.onDragCancel?.(event);

    if (event.activatorEvent.defaultPrevented) return;

    setActiveId(null);
  };

  const announcements: Announcements = {
    onDragStart({ active }) {
      const activeValue = active.id.toString();
      return `Grabbed sortable item "${activeValue}". Current position is ${active.data.current?.sortable.index + 1} of ${value.length}. Use arrow keys to move, space to drop.`;
    },

    onDragOver({ active, over }) {
      if (over) {
        const overIndex = over.data.current?.sortable.index ?? 0;
        const activeIndex = active.data.current?.sortable.index ?? 0;
        const moveDirection = overIndex > activeIndex ? "down" : "up";
        const activeValue = active.id.toString();
        return `Sortable item "${activeValue}" moved ${moveDirection} to position ${overIndex + 1} of ${value.length}.`;
      }
      return "Sortable item is no longer over a droppable area. Press escape to cancel.";
    },

    onDragEnd({ active, over }) {
      const activeValue = active.id.toString();
      if (over) {
        const overIndex = over.data.current?.sortable.index ?? 0;
        return `Sortable item "${activeValue}" dropped at position ${overIndex + 1} of ${value.length}.`;
      }
      return `Sortable item "${activeValue}" dropped. No changes were made.`;
    },

    onDragCancel({ active }) {
      const activeIndex = active.data.current?.sortable.index ?? 0;
      const activeValue = active.id.toString();
      return `Sorting cancelled. Sortable item "${activeValue}" returned to position ${activeIndex + 1} of ${value.length}.`;
    },

    onDragMove({ active, over }) {
      if (over) {
        const overIndex = over.data.current?.sortable.index ?? 0;
        const activeIndex = active.data.current?.sortable.index ?? 0;
        const moveDirection = overIndex > activeIndex ? "down" : "up";
        const activeValue = active.id.toString();
        return `Sortable item "${activeValue}" is moving ${moveDirection} to position ${overIndex + 1} of ${value.length}.`;
      }
      return "Sortable item is no longer over a droppable area. Press escape to cancel.";
    },
  };

  const screenReaderInstructions: ScreenReaderInstructions = {
    draggable: `
      To pick up a sortable item, press space or enter.
      While dragging, use the ${orientation === "vertical" ? "up and down" : orientation === "horizontal" ? "left and right" : "arrow"} keys to move the item.
      Press space or enter again to drop the item in its new position, or press escape to cancel.
    `,
  };

  const resolvedModifiers = modifiers ?? config.modifiers;

  return (
    <SortableRootPropsContext.Provider
      value={props as SortableRootProps<unknown>}
    >
      <SortableRootIdContext.Provider value={id}>
        <SortableRootActiveIdContext.Provider value={activeId}>
          <SortableRootSetActiveIdContext.Provider value={setActiveId}>
            <DndContext
              collisionDetection={
                collisionDetection ?? config.collisionDetection
              }
              modifiers={resolvedModifiers}
              sensors={sensors}
              {...sortableProps}
              id={id}
              onDragStart={onDragStart}
              onDragEnd={onDragEnd}
              onDragCancel={onDragCancel}
              accessibility={{
                announcements,
                screenReaderInstructions,
                ...accessibility,
              }}
            />
          </SortableRootSetActiveIdContext.Provider>
        </SortableRootActiveIdContext.Provider>
      </SortableRootIdContext.Provider>
    </SortableRootPropsContext.Provider>
  );
}

const SortableContentContext = React.createContext<boolean>(false);

interface SortableContentProps extends React.ComponentProps<"div"> {
  strategy?: SortableContextProps["strategy"];
  children: React.ReactNode;
  asChild?: boolean;
  withoutSlot?: boolean;
}

function SortableContent(props: SortableContentProps) {
  const {
    strategy: strategyProp,
    asChild,
    withoutSlot,
    children,
    ref,
    ...contentProps
  } = props;

  const context = useSortableContext(CONTENT_NAME);

  const ContentPrimitive = asChild ? Slot : "div";

  return (
    <SortableContentContext.Provider value={true}>
      <SortableContext
        items={context.items}
        strategy={strategyProp ?? context.strategy}
      >
        {withoutSlot ? (
          children
        ) : (
          <ContentPrimitive
            data-slot="sortable-content"
            {...contentProps}
            ref={ref}
          >
            {children}
          </ContentPrimitive>
        )}
      </SortableContext>
    </SortableContentContext.Provider>
  );
}

interface SortableItemContextValue {
  id: string;
  attributes: DraggableAttributes;
  listeners: DraggableSyntheticListeners | undefined;
  setActivatorNodeRef: (node: HTMLElement | null) => void;
  isDragging?: boolean;
  disabled?: boolean;
}

interface SortableItemProps extends React.ComponentProps<"div"> {
  value: UniqueIdentifier;
  asHandle?: boolean;
  asChild?: boolean;
  disabled?: boolean;
}

const SortableItemPropsContext =
  React.createContext<SortableItemProps | null>(null);
const SortableItemHookContext =
  React.createContext<ReturnType<typeof useSortable> | null>(null);
const SortableItemIdContext = React.createContext<string | null>(null);

function useSortableItemContext(consumerName: string) {
  const props = React.useContext(SortableItemPropsContext);
  const sortable = React.useContext(SortableItemHookContext);
  const id = React.useContext(SortableItemIdContext);

  if (!props || !sortable || !id) {
    throw new Error(`\`${consumerName}\` must be used within \`${ITEM_NAME}\``);
  }

  return {
    id,
    attributes: sortable.attributes,
    listeners: sortable.listeners,
    setActivatorNodeRef: sortable.setActivatorNodeRef,
    isDragging: sortable.isDragging,
    disabled: props.disabled,
  } satisfies SortableItemContextValue;
}

function SortableItem(props: SortableItemProps) {
  const {
    value,
    style,
    asHandle,
    asChild,
    disabled,
    className,
    ref,
    ...itemProps
  } = props;

  const inSortableContent = React.useContext(SortableContentContext);
  const inSortableOverlay = React.useContext(SortableOverlayContext);

  if (!inSortableContent && !inSortableOverlay) {
    throw new Error(
      `\`${ITEM_NAME}\` must be used within \`${CONTENT_NAME}\` or \`${OVERLAY_NAME}\``,
    );
  }

  if (value === "") {
    throw new Error(`\`${ITEM_NAME}\` value cannot be an empty string`);
  }

  const context = useSortableContext(ITEM_NAME);
  const id = React.useId();
  const sortable = useSortable({ id: value, disabled });
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = sortable;

  const composedRef = useComposedRefs(ref, (node) => {
    if (disabled) return;
    setNodeRef(node);
    if (asHandle) setActivatorNodeRef(node);
  });

  const composedStyle = (() => {
    return {
      transform: CSS.Translate.toString(transform),
      transition,
      ...style,
    };
  })();

  const ItemPrimitive = asChild ? Slot : "div";

  return (
    <SortableItemPropsContext.Provider value={props}>
      <SortableItemHookContext.Provider value={sortable}>
        <SortableItemIdContext.Provider value={id}>
          <ItemPrimitive
            id={id}
            data-disabled={disabled}
            data-dragging={isDragging ? "" : undefined}
            data-slot="sortable-item"
            {...itemProps}
            {...(asHandle && !disabled ? attributes : {})}
            {...(asHandle && !disabled ? listeners : {})}
            ref={composedRef}
            style={composedStyle}
            className={cn(
              "focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-1",
              {
                "touch-none select-none": asHandle,
                "cursor-default": context.flatCursor,
                "data-dragging:cursor-grabbing": !context.flatCursor,
                "cursor-grab": !isDragging && asHandle && !context.flatCursor,
                "opacity-50": isDragging,
                "pointer-events-none opacity-50": disabled,
              },
              className,
            )}
          />
        </SortableItemIdContext.Provider>
      </SortableItemHookContext.Provider>
    </SortableItemPropsContext.Provider>
  );
}

interface SortableItemHandleProps extends React.ComponentProps<"button"> {
  asChild?: boolean;
}

function SortableItemHandle(props: SortableItemHandleProps) {
  const { asChild, disabled, className, ref, ...itemHandleProps } = props;

  const context = useSortableContext(ITEM_HANDLE_NAME);
  const itemContext = useSortableItemContext(ITEM_HANDLE_NAME);

  const isDisabled = disabled ?? itemContext.disabled;

  const composedRef = useComposedRefs(ref, (node) => {
    if (!isDisabled) return;
    itemContext.setActivatorNodeRef(node);
  });

  const HandlePrimitive = asChild ? Slot : "button";

  return (
    <HandlePrimitive
      type="button"
      aria-controls={itemContext.id}
      data-disabled={isDisabled}
      data-dragging={itemContext.isDragging ? "" : undefined}
      data-slot="sortable-item-handle"
      {...itemHandleProps}
      {...(isDisabled ? {} : itemContext.attributes)}
      {...(isDisabled ? {} : itemContext.listeners)}
      ref={composedRef}
      className={cn(
        "select-none disabled:pointer-events-none disabled:opacity-50",
        context.flatCursor
          ? "cursor-default"
          : "cursor-grab data-dragging:cursor-grabbing",
        className,
      )}
      disabled={isDisabled}
    />
  );
}

const SortableOverlayContext = React.createContext(false);

const dropAnimation: DropAnimation = {
  sideEffects: defaultDropAnimationSideEffects({
    styles: {
      active: {
        opacity: "0.4",
      },
    },
  }),
};

interface SortableOverlayProps extends Omit<
  React.ComponentProps<typeof DragOverlay>,
  "children"
> {
  container?: Element | DocumentFragment | null;
  children?:
    | ((params: { value: UniqueIdentifier }) => React.ReactNode)
    | React.ReactNode;
}

function SortableOverlay(props: SortableOverlayProps) {
  const { container: containerProp, children, ...overlayProps } = props;

  const context = useSortableContext(OVERLAY_NAME);

  const mounted = React.useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );

  const container =
    containerProp ?? (mounted ? globalThis.document?.body : null);

  if (!container) return null;

  return ReactDOM.createPortal(
    <DragOverlay
      dropAnimation={dropAnimation}
      modifiers={context.modifiers}
      className={cn(!context.flatCursor && "cursor-grabbing")}
      {...overlayProps}
    >
      <SortableOverlayContext.Provider value={true}>
        {context.activeId
          ? typeof children === "function"
            ? children({ value: context.activeId })
            : children
          : null}
      </SortableOverlayContext.Provider>
    </DragOverlay>,
    container,
  );
}

export {
  SortableRoot as Sortable,
  SortableContent,
  SortableItem,
  SortableItemHandle,
  SortableOverlay,
};
