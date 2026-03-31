import { m as createLucideIcon, n as createContextScope, R as React2, o as useComposedRefs, j as jsxRuntimeExports, p as createSlot, r as reactExports, q as useId, P as Primitive, s as composeEventHandlers, t as useControllableState, v as useCallbackRef, w as Presence, x as cn, y as useLayoutEffect2, A as useUpdateMission, D as Dialog, C as DialogContent, E as DialogHeader, G as CircleAlert, H as DialogTitle, J as DialogDescription, K as DialogFooter, B as Button, k as ue, c as useDeleteNotes, N as FolderInput, T as Target, O as Download, Q as Share2, U as Trash2, V as downloadNoteAsText, W as shareNote, e as useBackendActor, X as useQueryClient, Y as useGetMission, Z as useGetFilesForMission, _ as useGetNotesForMission, $ as useToggleTaskCompletion, a0 as useAddTaskToMission, b as useDeleteFiles, I as Input, a1 as StickyNote, F as FullScreenViewer, S as SendToFolderDialog, M as MoveToMissionDialog, a2 as openExternally, d as FileText, a3 as useCreateMission, a4 as X, a5 as useListMissions, a6 as useDeleteMission } from "./index-D6ylm2dv.js";
import { u as useDirection, S as ScrollArea, A as ArrowLeft, j as Pen, P as Plus, C as CircleCheck, a as AlertDialog, b as AlertDialogContent, c as AlertDialogHeader, d as AlertDialogTitle, e as AlertDialogDescription, f as AlertDialogFooter, g as AlertDialogCancel, h as AlertDialogAction, i as SwipeActionsRow } from "./SwipeActionsRow-DWSekxyM.js";
/**
 * @license lucide-react v0.511.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode$7 = [["path", { d: "M20 6 9 17l-5-5", key: "1gmf2c" }]];
const Check = createLucideIcon("check", __iconNode$7);
/**
 * @license lucide-react v0.511.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode$6 = [
  ["rect", { width: "14", height: "14", x: "8", y: "8", rx: "2", ry: "2", key: "17jyea" }],
  ["path", { d: "M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2", key: "zix9uf" }]
];
const Copy = createLucideIcon("copy", __iconNode$6);
/**
 * @license lucide-react v0.511.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode$5 = [
  ["path", { d: "M15 3h6v6", key: "1q9fwt" }],
  ["path", { d: "M10 14 21 3", key: "gplh6r" }],
  ["path", { d: "M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6", key: "a6xqqp" }]
];
const ExternalLink = createLucideIcon("external-link", __iconNode$5);
/**
 * @license lucide-react v0.511.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode$4 = [
  ["path", { d: "M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z", key: "1rqfz7" }],
  ["path", { d: "M14 2v4a2 2 0 0 0 2 2h4", key: "tnqrlb" }],
  ["circle", { cx: "10", cy: "12", r: "2", key: "737tya" }],
  ["path", { d: "m20 17-1.296-1.296a2.41 2.41 0 0 0-3.408 0L9 22", key: "wt3hpn" }]
];
const FileImage = createLucideIcon("file-image", __iconNode$4);
/**
 * @license lucide-react v0.511.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode$3 = [
  ["path", { d: "M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z", key: "1rqfz7" }],
  ["path", { d: "M14 2v4a2 2 0 0 0 2 2h4", key: "tnqrlb" }],
  ["path", { d: "M8 13h2", key: "yr2amv" }],
  ["path", { d: "M14 13h2", key: "un5t4a" }],
  ["path", { d: "M8 17h2", key: "2yhykz" }],
  ["path", { d: "M14 17h2", key: "10kma7" }]
];
const FileSpreadsheet = createLucideIcon("file-spreadsheet", __iconNode$3);
/**
 * @license lucide-react v0.511.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode$2 = [
  ["path", { d: "M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z", key: "1rqfz7" }],
  ["path", { d: "M14 2v4a2 2 0 0 0 2 2h4", key: "tnqrlb" }],
  ["path", { d: "m10 11 5 3-5 3v-6Z", key: "7ntvm4" }]
];
const FileVideo = createLucideIcon("file-video", __iconNode$2);
/**
 * @license lucide-react v0.511.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode$1 = [
  ["path", { d: "M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z", key: "1rqfz7" }],
  ["path", { d: "M14 2v4a2 2 0 0 0 2 2h4", key: "tnqrlb" }]
];
const File = createLucideIcon("file", __iconNode$1);
/**
 * @license lucide-react v0.511.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode = [
  [
    "path",
    {
      d: "M15.2 3a2 2 0 0 1 1.4.6l3.8 3.8a2 2 0 0 1 .6 1.4V19a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z",
      key: "1c8476"
    }
  ],
  ["path", { d: "M17 21v-7a1 1 0 0 0-1-1H8a1 1 0 0 0-1 1v7", key: "1ydtos" }],
  ["path", { d: "M7 3v4a1 1 0 0 0 1 1h7", key: "t51u73" }]
];
const Save = createLucideIcon("save", __iconNode);
function createCollection(name) {
  const PROVIDER_NAME = name + "CollectionProvider";
  const [createCollectionContext, createCollectionScope2] = createContextScope(PROVIDER_NAME);
  const [CollectionProviderImpl, useCollectionContext] = createCollectionContext(
    PROVIDER_NAME,
    { collectionRef: { current: null }, itemMap: /* @__PURE__ */ new Map() }
  );
  const CollectionProvider = (props) => {
    const { scope, children } = props;
    const ref = React2.useRef(null);
    const itemMap = React2.useRef(/* @__PURE__ */ new Map()).current;
    return /* @__PURE__ */ jsxRuntimeExports.jsx(CollectionProviderImpl, { scope, itemMap, collectionRef: ref, children });
  };
  CollectionProvider.displayName = PROVIDER_NAME;
  const COLLECTION_SLOT_NAME = name + "CollectionSlot";
  const CollectionSlotImpl = createSlot(COLLECTION_SLOT_NAME);
  const CollectionSlot = React2.forwardRef(
    (props, forwardedRef) => {
      const { scope, children } = props;
      const context = useCollectionContext(COLLECTION_SLOT_NAME, scope);
      const composedRefs = useComposedRefs(forwardedRef, context.collectionRef);
      return /* @__PURE__ */ jsxRuntimeExports.jsx(CollectionSlotImpl, { ref: composedRefs, children });
    }
  );
  CollectionSlot.displayName = COLLECTION_SLOT_NAME;
  const ITEM_SLOT_NAME = name + "CollectionItemSlot";
  const ITEM_DATA_ATTR = "data-radix-collection-item";
  const CollectionItemSlotImpl = createSlot(ITEM_SLOT_NAME);
  const CollectionItemSlot = React2.forwardRef(
    (props, forwardedRef) => {
      const { scope, children, ...itemData } = props;
      const ref = React2.useRef(null);
      const composedRefs = useComposedRefs(forwardedRef, ref);
      const context = useCollectionContext(ITEM_SLOT_NAME, scope);
      React2.useEffect(() => {
        context.itemMap.set(ref, { ref, ...itemData });
        return () => void context.itemMap.delete(ref);
      });
      return /* @__PURE__ */ jsxRuntimeExports.jsx(CollectionItemSlotImpl, { ...{ [ITEM_DATA_ATTR]: "" }, ref: composedRefs, children });
    }
  );
  CollectionItemSlot.displayName = ITEM_SLOT_NAME;
  function useCollection2(scope) {
    const context = useCollectionContext(name + "CollectionConsumer", scope);
    const getItems = React2.useCallback(() => {
      const collectionNode = context.collectionRef.current;
      if (!collectionNode) return [];
      const orderedNodes = Array.from(collectionNode.querySelectorAll(`[${ITEM_DATA_ATTR}]`));
      const items = Array.from(context.itemMap.values());
      const orderedItems = items.sort(
        (a, b) => orderedNodes.indexOf(a.ref.current) - orderedNodes.indexOf(b.ref.current)
      );
      return orderedItems;
    }, [context.collectionRef, context.itemMap]);
    return getItems;
  }
  return [
    { Provider: CollectionProvider, Slot: CollectionSlot, ItemSlot: CollectionItemSlot },
    useCollection2,
    createCollectionScope2
  ];
}
var ENTRY_FOCUS = "rovingFocusGroup.onEntryFocus";
var EVENT_OPTIONS = { bubbles: false, cancelable: true };
var GROUP_NAME = "RovingFocusGroup";
var [Collection, useCollection, createCollectionScope] = createCollection(GROUP_NAME);
var [createRovingFocusGroupContext, createRovingFocusGroupScope] = createContextScope(
  GROUP_NAME,
  [createCollectionScope]
);
var [RovingFocusProvider, useRovingFocusContext] = createRovingFocusGroupContext(GROUP_NAME);
var RovingFocusGroup = reactExports.forwardRef(
  (props, forwardedRef) => {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(Collection.Provider, { scope: props.__scopeRovingFocusGroup, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Collection.Slot, { scope: props.__scopeRovingFocusGroup, children: /* @__PURE__ */ jsxRuntimeExports.jsx(RovingFocusGroupImpl, { ...props, ref: forwardedRef }) }) });
  }
);
RovingFocusGroup.displayName = GROUP_NAME;
var RovingFocusGroupImpl = reactExports.forwardRef((props, forwardedRef) => {
  const {
    __scopeRovingFocusGroup,
    orientation,
    loop = false,
    dir,
    currentTabStopId: currentTabStopIdProp,
    defaultCurrentTabStopId,
    onCurrentTabStopIdChange,
    onEntryFocus,
    preventScrollOnEntryFocus = false,
    ...groupProps
  } = props;
  const ref = reactExports.useRef(null);
  const composedRefs = useComposedRefs(forwardedRef, ref);
  const direction = useDirection(dir);
  const [currentTabStopId, setCurrentTabStopId] = useControllableState({
    prop: currentTabStopIdProp,
    defaultProp: defaultCurrentTabStopId ?? null,
    onChange: onCurrentTabStopIdChange,
    caller: GROUP_NAME
  });
  const [isTabbingBackOut, setIsTabbingBackOut] = reactExports.useState(false);
  const handleEntryFocus = useCallbackRef(onEntryFocus);
  const getItems = useCollection(__scopeRovingFocusGroup);
  const isClickFocusRef = reactExports.useRef(false);
  const [focusableItemsCount, setFocusableItemsCount] = reactExports.useState(0);
  reactExports.useEffect(() => {
    const node = ref.current;
    if (node) {
      node.addEventListener(ENTRY_FOCUS, handleEntryFocus);
      return () => node.removeEventListener(ENTRY_FOCUS, handleEntryFocus);
    }
  }, [handleEntryFocus]);
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    RovingFocusProvider,
    {
      scope: __scopeRovingFocusGroup,
      orientation,
      dir: direction,
      loop,
      currentTabStopId,
      onItemFocus: reactExports.useCallback(
        (tabStopId) => setCurrentTabStopId(tabStopId),
        [setCurrentTabStopId]
      ),
      onItemShiftTab: reactExports.useCallback(() => setIsTabbingBackOut(true), []),
      onFocusableItemAdd: reactExports.useCallback(
        () => setFocusableItemsCount((prevCount) => prevCount + 1),
        []
      ),
      onFocusableItemRemove: reactExports.useCallback(
        () => setFocusableItemsCount((prevCount) => prevCount - 1),
        []
      ),
      children: /* @__PURE__ */ jsxRuntimeExports.jsx(
        Primitive.div,
        {
          tabIndex: isTabbingBackOut || focusableItemsCount === 0 ? -1 : 0,
          "data-orientation": orientation,
          ...groupProps,
          ref: composedRefs,
          style: { outline: "none", ...props.style },
          onMouseDown: composeEventHandlers(props.onMouseDown, () => {
            isClickFocusRef.current = true;
          }),
          onFocus: composeEventHandlers(props.onFocus, (event) => {
            const isKeyboardFocus = !isClickFocusRef.current;
            if (event.target === event.currentTarget && isKeyboardFocus && !isTabbingBackOut) {
              const entryFocusEvent = new CustomEvent(ENTRY_FOCUS, EVENT_OPTIONS);
              event.currentTarget.dispatchEvent(entryFocusEvent);
              if (!entryFocusEvent.defaultPrevented) {
                const items = getItems().filter((item) => item.focusable);
                const activeItem = items.find((item) => item.active);
                const currentItem = items.find((item) => item.id === currentTabStopId);
                const candidateItems = [activeItem, currentItem, ...items].filter(
                  Boolean
                );
                const candidateNodes = candidateItems.map((item) => item.ref.current);
                focusFirst(candidateNodes, preventScrollOnEntryFocus);
              }
            }
            isClickFocusRef.current = false;
          }),
          onBlur: composeEventHandlers(props.onBlur, () => setIsTabbingBackOut(false))
        }
      )
    }
  );
});
var ITEM_NAME = "RovingFocusGroupItem";
var RovingFocusGroupItem = reactExports.forwardRef(
  (props, forwardedRef) => {
    const {
      __scopeRovingFocusGroup,
      focusable = true,
      active = false,
      tabStopId,
      children,
      ...itemProps
    } = props;
    const autoId = useId();
    const id = tabStopId || autoId;
    const context = useRovingFocusContext(ITEM_NAME, __scopeRovingFocusGroup);
    const isCurrentTabStop = context.currentTabStopId === id;
    const getItems = useCollection(__scopeRovingFocusGroup);
    const { onFocusableItemAdd, onFocusableItemRemove, currentTabStopId } = context;
    reactExports.useEffect(() => {
      if (focusable) {
        onFocusableItemAdd();
        return () => onFocusableItemRemove();
      }
    }, [focusable, onFocusableItemAdd, onFocusableItemRemove]);
    return /* @__PURE__ */ jsxRuntimeExports.jsx(
      Collection.ItemSlot,
      {
        scope: __scopeRovingFocusGroup,
        id,
        focusable,
        active,
        children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          Primitive.span,
          {
            tabIndex: isCurrentTabStop ? 0 : -1,
            "data-orientation": context.orientation,
            ...itemProps,
            ref: forwardedRef,
            onMouseDown: composeEventHandlers(props.onMouseDown, (event) => {
              if (!focusable) event.preventDefault();
              else context.onItemFocus(id);
            }),
            onFocus: composeEventHandlers(props.onFocus, () => context.onItemFocus(id)),
            onKeyDown: composeEventHandlers(props.onKeyDown, (event) => {
              if (event.key === "Tab" && event.shiftKey) {
                context.onItemShiftTab();
                return;
              }
              if (event.target !== event.currentTarget) return;
              const focusIntent = getFocusIntent(event, context.orientation, context.dir);
              if (focusIntent !== void 0) {
                if (event.metaKey || event.ctrlKey || event.altKey || event.shiftKey) return;
                event.preventDefault();
                const items = getItems().filter((item) => item.focusable);
                let candidateNodes = items.map((item) => item.ref.current);
                if (focusIntent === "last") candidateNodes.reverse();
                else if (focusIntent === "prev" || focusIntent === "next") {
                  if (focusIntent === "prev") candidateNodes.reverse();
                  const currentIndex = candidateNodes.indexOf(event.currentTarget);
                  candidateNodes = context.loop ? wrapArray(candidateNodes, currentIndex + 1) : candidateNodes.slice(currentIndex + 1);
                }
                setTimeout(() => focusFirst(candidateNodes));
              }
            }),
            children: typeof children === "function" ? children({ isCurrentTabStop, hasTabStop: currentTabStopId != null }) : children
          }
        )
      }
    );
  }
);
RovingFocusGroupItem.displayName = ITEM_NAME;
var MAP_KEY_TO_FOCUS_INTENT = {
  ArrowLeft: "prev",
  ArrowUp: "prev",
  ArrowRight: "next",
  ArrowDown: "next",
  PageUp: "first",
  Home: "first",
  PageDown: "last",
  End: "last"
};
function getDirectionAwareKey(key, dir) {
  if (dir !== "rtl") return key;
  return key === "ArrowLeft" ? "ArrowRight" : key === "ArrowRight" ? "ArrowLeft" : key;
}
function getFocusIntent(event, orientation, dir) {
  const key = getDirectionAwareKey(event.key, dir);
  if (orientation === "vertical" && ["ArrowLeft", "ArrowRight"].includes(key)) return void 0;
  if (orientation === "horizontal" && ["ArrowUp", "ArrowDown"].includes(key)) return void 0;
  return MAP_KEY_TO_FOCUS_INTENT[key];
}
function focusFirst(candidates, preventScroll = false) {
  const PREVIOUSLY_FOCUSED_ELEMENT = document.activeElement;
  for (const candidate of candidates) {
    if (candidate === PREVIOUSLY_FOCUSED_ELEMENT) return;
    candidate.focus({ preventScroll });
    if (document.activeElement !== PREVIOUSLY_FOCUSED_ELEMENT) return;
  }
}
function wrapArray(array, startIndex) {
  return array.map((_, index) => array[(startIndex + index) % array.length]);
}
var Root$1 = RovingFocusGroup;
var Item = RovingFocusGroupItem;
var TABS_NAME = "Tabs";
var [createTabsContext] = createContextScope(TABS_NAME, [
  createRovingFocusGroupScope
]);
var useRovingFocusGroupScope = createRovingFocusGroupScope();
var [TabsProvider, useTabsContext] = createTabsContext(TABS_NAME);
var Tabs$1 = reactExports.forwardRef(
  (props, forwardedRef) => {
    const {
      __scopeTabs,
      value: valueProp,
      onValueChange,
      defaultValue,
      orientation = "horizontal",
      dir,
      activationMode = "automatic",
      ...tabsProps
    } = props;
    const direction = useDirection(dir);
    const [value, setValue] = useControllableState({
      prop: valueProp,
      onChange: onValueChange,
      defaultProp: defaultValue ?? "",
      caller: TABS_NAME
    });
    return /* @__PURE__ */ jsxRuntimeExports.jsx(
      TabsProvider,
      {
        scope: __scopeTabs,
        baseId: useId(),
        value,
        onValueChange: setValue,
        orientation,
        dir: direction,
        activationMode,
        children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          Primitive.div,
          {
            dir: direction,
            "data-orientation": orientation,
            ...tabsProps,
            ref: forwardedRef
          }
        )
      }
    );
  }
);
Tabs$1.displayName = TABS_NAME;
var TAB_LIST_NAME = "TabsList";
var TabsList$1 = reactExports.forwardRef(
  (props, forwardedRef) => {
    const { __scopeTabs, loop = true, ...listProps } = props;
    const context = useTabsContext(TAB_LIST_NAME, __scopeTabs);
    const rovingFocusGroupScope = useRovingFocusGroupScope(__scopeTabs);
    return /* @__PURE__ */ jsxRuntimeExports.jsx(
      Root$1,
      {
        asChild: true,
        ...rovingFocusGroupScope,
        orientation: context.orientation,
        dir: context.dir,
        loop,
        children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          Primitive.div,
          {
            role: "tablist",
            "aria-orientation": context.orientation,
            ...listProps,
            ref: forwardedRef
          }
        )
      }
    );
  }
);
TabsList$1.displayName = TAB_LIST_NAME;
var TRIGGER_NAME$1 = "TabsTrigger";
var TabsTrigger$1 = reactExports.forwardRef(
  (props, forwardedRef) => {
    const { __scopeTabs, value, disabled = false, ...triggerProps } = props;
    const context = useTabsContext(TRIGGER_NAME$1, __scopeTabs);
    const rovingFocusGroupScope = useRovingFocusGroupScope(__scopeTabs);
    const triggerId = makeTriggerId(context.baseId, value);
    const contentId = makeContentId(context.baseId, value);
    const isSelected = value === context.value;
    return /* @__PURE__ */ jsxRuntimeExports.jsx(
      Item,
      {
        asChild: true,
        ...rovingFocusGroupScope,
        focusable: !disabled,
        active: isSelected,
        children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          Primitive.button,
          {
            type: "button",
            role: "tab",
            "aria-selected": isSelected,
            "aria-controls": contentId,
            "data-state": isSelected ? "active" : "inactive",
            "data-disabled": disabled ? "" : void 0,
            disabled,
            id: triggerId,
            ...triggerProps,
            ref: forwardedRef,
            onMouseDown: composeEventHandlers(props.onMouseDown, (event) => {
              if (!disabled && event.button === 0 && event.ctrlKey === false) {
                context.onValueChange(value);
              } else {
                event.preventDefault();
              }
            }),
            onKeyDown: composeEventHandlers(props.onKeyDown, (event) => {
              if ([" ", "Enter"].includes(event.key)) context.onValueChange(value);
            }),
            onFocus: composeEventHandlers(props.onFocus, () => {
              const isAutomaticActivation = context.activationMode !== "manual";
              if (!isSelected && !disabled && isAutomaticActivation) {
                context.onValueChange(value);
              }
            })
          }
        )
      }
    );
  }
);
TabsTrigger$1.displayName = TRIGGER_NAME$1;
var CONTENT_NAME = "TabsContent";
var TabsContent$1 = reactExports.forwardRef(
  (props, forwardedRef) => {
    const { __scopeTabs, value, forceMount, children, ...contentProps } = props;
    const context = useTabsContext(CONTENT_NAME, __scopeTabs);
    const triggerId = makeTriggerId(context.baseId, value);
    const contentId = makeContentId(context.baseId, value);
    const isSelected = value === context.value;
    const isMountAnimationPreventedRef = reactExports.useRef(isSelected);
    reactExports.useEffect(() => {
      const rAF = requestAnimationFrame(() => isMountAnimationPreventedRef.current = false);
      return () => cancelAnimationFrame(rAF);
    }, []);
    return /* @__PURE__ */ jsxRuntimeExports.jsx(Presence, { present: forceMount || isSelected, children: ({ present }) => /* @__PURE__ */ jsxRuntimeExports.jsx(
      Primitive.div,
      {
        "data-state": isSelected ? "active" : "inactive",
        "data-orientation": context.orientation,
        role: "tabpanel",
        "aria-labelledby": triggerId,
        hidden: !present,
        id: contentId,
        tabIndex: 0,
        ...contentProps,
        ref: forwardedRef,
        style: {
          ...props.style,
          animationDuration: isMountAnimationPreventedRef.current ? "0s" : void 0
        },
        children: present && children
      }
    ) });
  }
);
TabsContent$1.displayName = CONTENT_NAME;
function makeTriggerId(baseId, value) {
  return `${baseId}-trigger-${value}`;
}
function makeContentId(baseId, value) {
  return `${baseId}-content-${value}`;
}
var Root2 = Tabs$1;
var List = TabsList$1;
var Trigger = TabsTrigger$1;
var Content = TabsContent$1;
function Tabs({
  className,
  ...props
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    Root2,
    {
      "data-slot": "tabs",
      className: cn("flex flex-col gap-2", className),
      ...props
    }
  );
}
function TabsList({
  className,
  ...props
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    List,
    {
      "data-slot": "tabs-list",
      className: cn(
        "bg-muted text-muted-foreground inline-flex h-9 w-fit items-center justify-center rounded-lg p-[3px]",
        className
      ),
      ...props
    }
  );
}
function TabsTrigger({
  className,
  ...props
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    Trigger,
    {
      "data-slot": "tabs-trigger",
      className: cn(
        "data-[state=active]:bg-background dark:data-[state=active]:text-foreground focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:outline-ring dark:data-[state=active]:border-input dark:data-[state=active]:bg-input/30 text-foreground dark:text-muted-foreground inline-flex h-[calc(100%-1px)] flex-1 items-center justify-center gap-1.5 rounded-md border border-transparent px-2 py-1 text-sm font-medium whitespace-nowrap transition-[color,box-shadow] focus-visible:ring-[3px] focus-visible:outline-1 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:shadow-sm [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className
      ),
      ...props
    }
  );
}
function TabsContent({
  className,
  ...props
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    Content,
    {
      "data-slot": "tabs-content",
      className: cn("flex-1 outline-none", className),
      ...props
    }
  );
}
function calculateMissionProgress(tasks) {
  if (tasks.length === 0) return 0;
  const completed = tasks.filter((t) => t.completed).length;
  return completed / tasks.length * 100;
}
function isMissionCompleted(mission) {
  if (mission.tasks.length === 0) return false;
  const progress = calculateMissionProgress(mission.tasks);
  return progress === 100;
}
function splitMissionsByCompletion(missions) {
  const incomplete = [];
  const completed = [];
  for (const mission of missions) {
    if (isMissionCompleted(mission)) {
      completed.push(mission);
    } else {
      incomplete.push(mission);
    }
  }
  return { incomplete, completed };
}
function usePrevious(value) {
  const ref = reactExports.useRef({ value, previous: value });
  return reactExports.useMemo(() => {
    if (ref.current.value !== value) {
      ref.current.previous = ref.current.value;
      ref.current.value = value;
    }
    return ref.current.previous;
  }, [value]);
}
function useSize(element) {
  const [size, setSize] = reactExports.useState(void 0);
  useLayoutEffect2(() => {
    if (element) {
      setSize({ width: element.offsetWidth, height: element.offsetHeight });
      const resizeObserver = new ResizeObserver((entries) => {
        if (!Array.isArray(entries)) {
          return;
        }
        if (!entries.length) {
          return;
        }
        const entry = entries[0];
        let width;
        let height;
        if ("borderBoxSize" in entry) {
          const borderSizeEntry = entry["borderBoxSize"];
          const borderSize = Array.isArray(borderSizeEntry) ? borderSizeEntry[0] : borderSizeEntry;
          width = borderSize["inlineSize"];
          height = borderSize["blockSize"];
        } else {
          width = element.offsetWidth;
          height = element.offsetHeight;
        }
        setSize({ width, height });
      });
      resizeObserver.observe(element, { box: "border-box" });
      return () => resizeObserver.unobserve(element);
    } else {
      setSize(void 0);
    }
  }, [element]);
  return size;
}
var CHECKBOX_NAME = "Checkbox";
var [createCheckboxContext] = createContextScope(CHECKBOX_NAME);
var [CheckboxProviderImpl, useCheckboxContext] = createCheckboxContext(CHECKBOX_NAME);
function CheckboxProvider(props) {
  const {
    __scopeCheckbox,
    checked: checkedProp,
    children,
    defaultChecked,
    disabled,
    form,
    name,
    onCheckedChange,
    required,
    value = "on",
    // @ts-expect-error
    internal_do_not_use_render
  } = props;
  const [checked, setChecked] = useControllableState({
    prop: checkedProp,
    defaultProp: defaultChecked ?? false,
    onChange: onCheckedChange,
    caller: CHECKBOX_NAME
  });
  const [control, setControl] = reactExports.useState(null);
  const [bubbleInput, setBubbleInput] = reactExports.useState(null);
  const hasConsumerStoppedPropagationRef = reactExports.useRef(false);
  const isFormControl = control ? !!form || !!control.closest("form") : (
    // We set this to true by default so that events bubble to forms without JS (SSR)
    true
  );
  const context = {
    checked,
    disabled,
    setChecked,
    control,
    setControl,
    name,
    form,
    value,
    hasConsumerStoppedPropagationRef,
    required,
    defaultChecked: isIndeterminate(defaultChecked) ? false : defaultChecked,
    isFormControl,
    bubbleInput,
    setBubbleInput
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    CheckboxProviderImpl,
    {
      scope: __scopeCheckbox,
      ...context,
      children: isFunction(internal_do_not_use_render) ? internal_do_not_use_render(context) : children
    }
  );
}
var TRIGGER_NAME = "CheckboxTrigger";
var CheckboxTrigger = reactExports.forwardRef(
  ({ __scopeCheckbox, onKeyDown, onClick, ...checkboxProps }, forwardedRef) => {
    const {
      control,
      value,
      disabled,
      checked,
      required,
      setControl,
      setChecked,
      hasConsumerStoppedPropagationRef,
      isFormControl,
      bubbleInput
    } = useCheckboxContext(TRIGGER_NAME, __scopeCheckbox);
    const composedRefs = useComposedRefs(forwardedRef, setControl);
    const initialCheckedStateRef = reactExports.useRef(checked);
    reactExports.useEffect(() => {
      const form = control == null ? void 0 : control.form;
      if (form) {
        const reset = () => setChecked(initialCheckedStateRef.current);
        form.addEventListener("reset", reset);
        return () => form.removeEventListener("reset", reset);
      }
    }, [control, setChecked]);
    return /* @__PURE__ */ jsxRuntimeExports.jsx(
      Primitive.button,
      {
        type: "button",
        role: "checkbox",
        "aria-checked": isIndeterminate(checked) ? "mixed" : checked,
        "aria-required": required,
        "data-state": getState(checked),
        "data-disabled": disabled ? "" : void 0,
        disabled,
        value,
        ...checkboxProps,
        ref: composedRefs,
        onKeyDown: composeEventHandlers(onKeyDown, (event) => {
          if (event.key === "Enter") event.preventDefault();
        }),
        onClick: composeEventHandlers(onClick, (event) => {
          setChecked((prevChecked) => isIndeterminate(prevChecked) ? true : !prevChecked);
          if (bubbleInput && isFormControl) {
            hasConsumerStoppedPropagationRef.current = event.isPropagationStopped();
            if (!hasConsumerStoppedPropagationRef.current) event.stopPropagation();
          }
        })
      }
    );
  }
);
CheckboxTrigger.displayName = TRIGGER_NAME;
var Checkbox$1 = reactExports.forwardRef(
  (props, forwardedRef) => {
    const {
      __scopeCheckbox,
      name,
      checked,
      defaultChecked,
      required,
      disabled,
      value,
      onCheckedChange,
      form,
      ...checkboxProps
    } = props;
    return /* @__PURE__ */ jsxRuntimeExports.jsx(
      CheckboxProvider,
      {
        __scopeCheckbox,
        checked,
        defaultChecked,
        disabled,
        required,
        onCheckedChange,
        name,
        form,
        value,
        internal_do_not_use_render: ({ isFormControl }) => /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            CheckboxTrigger,
            {
              ...checkboxProps,
              ref: forwardedRef,
              __scopeCheckbox
            }
          ),
          isFormControl && /* @__PURE__ */ jsxRuntimeExports.jsx(
            CheckboxBubbleInput,
            {
              __scopeCheckbox
            }
          )
        ] })
      }
    );
  }
);
Checkbox$1.displayName = CHECKBOX_NAME;
var INDICATOR_NAME$1 = "CheckboxIndicator";
var CheckboxIndicator = reactExports.forwardRef(
  (props, forwardedRef) => {
    const { __scopeCheckbox, forceMount, ...indicatorProps } = props;
    const context = useCheckboxContext(INDICATOR_NAME$1, __scopeCheckbox);
    return /* @__PURE__ */ jsxRuntimeExports.jsx(
      Presence,
      {
        present: forceMount || isIndeterminate(context.checked) || context.checked === true,
        children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          Primitive.span,
          {
            "data-state": getState(context.checked),
            "data-disabled": context.disabled ? "" : void 0,
            ...indicatorProps,
            ref: forwardedRef,
            style: { pointerEvents: "none", ...props.style }
          }
        )
      }
    );
  }
);
CheckboxIndicator.displayName = INDICATOR_NAME$1;
var BUBBLE_INPUT_NAME = "CheckboxBubbleInput";
var CheckboxBubbleInput = reactExports.forwardRef(
  ({ __scopeCheckbox, ...props }, forwardedRef) => {
    const {
      control,
      hasConsumerStoppedPropagationRef,
      checked,
      defaultChecked,
      required,
      disabled,
      name,
      value,
      form,
      bubbleInput,
      setBubbleInput
    } = useCheckboxContext(BUBBLE_INPUT_NAME, __scopeCheckbox);
    const composedRefs = useComposedRefs(forwardedRef, setBubbleInput);
    const prevChecked = usePrevious(checked);
    const controlSize = useSize(control);
    reactExports.useEffect(() => {
      const input = bubbleInput;
      if (!input) return;
      const inputProto = window.HTMLInputElement.prototype;
      const descriptor = Object.getOwnPropertyDescriptor(
        inputProto,
        "checked"
      );
      const setChecked = descriptor.set;
      const bubbles = !hasConsumerStoppedPropagationRef.current;
      if (prevChecked !== checked && setChecked) {
        const event = new Event("click", { bubbles });
        input.indeterminate = isIndeterminate(checked);
        setChecked.call(input, isIndeterminate(checked) ? false : checked);
        input.dispatchEvent(event);
      }
    }, [bubbleInput, prevChecked, checked, hasConsumerStoppedPropagationRef]);
    const defaultCheckedRef = reactExports.useRef(isIndeterminate(checked) ? false : checked);
    return /* @__PURE__ */ jsxRuntimeExports.jsx(
      Primitive.input,
      {
        type: "checkbox",
        "aria-hidden": true,
        defaultChecked: defaultChecked ?? defaultCheckedRef.current,
        required,
        disabled,
        name,
        value,
        form,
        ...props,
        tabIndex: -1,
        ref: composedRefs,
        style: {
          ...props.style,
          ...controlSize,
          position: "absolute",
          pointerEvents: "none",
          opacity: 0,
          margin: 0,
          // We transform because the input is absolutely positioned but we have
          // rendered it **after** the button. This pulls it back to sit on top
          // of the button.
          transform: "translateX(-100%)"
        }
      }
    );
  }
);
CheckboxBubbleInput.displayName = BUBBLE_INPUT_NAME;
function isFunction(value) {
  return typeof value === "function";
}
function isIndeterminate(checked) {
  return checked === "indeterminate";
}
function getState(checked) {
  return isIndeterminate(checked) ? "indeterminate" : checked ? "checked" : "unchecked";
}
function Checkbox({
  className,
  ...props
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    Checkbox$1,
    {
      "data-slot": "checkbox",
      className: cn(
        "peer border-input dark:bg-input/30 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground dark:data-[state=checked]:bg-primary data-[state=checked]:border-primary focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive size-4 shrink-0 rounded-[4px] border shadow-xs transition-shadow outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50",
        className
      ),
      ...props,
      children: /* @__PURE__ */ jsxRuntimeExports.jsx(
        CheckboxIndicator,
        {
          "data-slot": "checkbox-indicator",
          className: "flex items-center justify-center text-current transition-none",
          children: /* @__PURE__ */ jsxRuntimeExports.jsx(Check, { className: "size-3.5" })
        }
      )
    }
  );
}
var PROGRESS_NAME = "Progress";
var DEFAULT_MAX = 100;
var [createProgressContext] = createContextScope(PROGRESS_NAME);
var [ProgressProvider, useProgressContext] = createProgressContext(PROGRESS_NAME);
var Progress$1 = reactExports.forwardRef(
  (props, forwardedRef) => {
    const {
      __scopeProgress,
      value: valueProp = null,
      max: maxProp,
      getValueLabel = defaultGetValueLabel,
      ...progressProps
    } = props;
    if ((maxProp || maxProp === 0) && !isValidMaxNumber(maxProp)) {
      console.error(getInvalidMaxError(`${maxProp}`, "Progress"));
    }
    const max = isValidMaxNumber(maxProp) ? maxProp : DEFAULT_MAX;
    if (valueProp !== null && !isValidValueNumber(valueProp, max)) {
      console.error(getInvalidValueError(`${valueProp}`, "Progress"));
    }
    const value = isValidValueNumber(valueProp, max) ? valueProp : null;
    const valueLabel = isNumber(value) ? getValueLabel(value, max) : void 0;
    return /* @__PURE__ */ jsxRuntimeExports.jsx(ProgressProvider, { scope: __scopeProgress, value, max, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
      Primitive.div,
      {
        "aria-valuemax": max,
        "aria-valuemin": 0,
        "aria-valuenow": isNumber(value) ? value : void 0,
        "aria-valuetext": valueLabel,
        role: "progressbar",
        "data-state": getProgressState(value, max),
        "data-value": value ?? void 0,
        "data-max": max,
        ...progressProps,
        ref: forwardedRef
      }
    ) });
  }
);
Progress$1.displayName = PROGRESS_NAME;
var INDICATOR_NAME = "ProgressIndicator";
var ProgressIndicator = reactExports.forwardRef(
  (props, forwardedRef) => {
    const { __scopeProgress, ...indicatorProps } = props;
    const context = useProgressContext(INDICATOR_NAME, __scopeProgress);
    return /* @__PURE__ */ jsxRuntimeExports.jsx(
      Primitive.div,
      {
        "data-state": getProgressState(context.value, context.max),
        "data-value": context.value ?? void 0,
        "data-max": context.max,
        ...indicatorProps,
        ref: forwardedRef
      }
    );
  }
);
ProgressIndicator.displayName = INDICATOR_NAME;
function defaultGetValueLabel(value, max) {
  return `${Math.round(value / max * 100)}%`;
}
function getProgressState(value, maxValue) {
  return value == null ? "indeterminate" : value === maxValue ? "complete" : "loading";
}
function isNumber(value) {
  return typeof value === "number";
}
function isValidMaxNumber(max) {
  return isNumber(max) && !isNaN(max) && max > 0;
}
function isValidValueNumber(value, max) {
  return isNumber(value) && !isNaN(value) && value <= max && value >= 0;
}
function getInvalidMaxError(propValue, componentName) {
  return `Invalid prop \`max\` of value \`${propValue}\` supplied to \`${componentName}\`. Only numbers greater than 0 are valid max values. Defaulting to \`${DEFAULT_MAX}\`.`;
}
function getInvalidValueError(propValue, componentName) {
  return `Invalid prop \`value\` of value \`${propValue}\` supplied to \`${componentName}\`. The \`value\` prop must be:
  - a positive number
  - less than the value passed to \`max\` (or ${DEFAULT_MAX} if no \`max\` prop is set)
  - \`null\` or \`undefined\` if the progress is indeterminate.

Defaulting to \`null\`.`;
}
var Root = Progress$1;
var Indicator = ProgressIndicator;
function Progress({
  className,
  value,
  ...props
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    Root,
    {
      "data-slot": "progress",
      className: cn(
        "bg-primary/20 relative h-2 w-full overflow-hidden rounded-full",
        className
      ),
      ...props,
      children: /* @__PURE__ */ jsxRuntimeExports.jsx(
        Indicator,
        {
          "data-slot": "progress-indicator",
          className: "bg-primary h-full w-full flex-1 transition-all",
          style: { transform: `translateX(-${100 - (value || 0)}%)` }
        }
      )
    }
  );
}
function areTaskArraysEqual(a, b) {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    const taskA = a[i];
    const taskB = b[i];
    if (taskA.taskId.toString() !== taskB.taskId.toString()) return false;
    if (taskA.task !== taskB.task) return false;
    if (taskA.completed !== taskB.completed) return false;
  }
  return true;
}
function useMissionAutosave({
  missionId,
  title,
  tasks,
  debounceMs = 1e3,
  enabled = true
}) {
  const updateMutation = useUpdateMission();
  const timeoutRef = reactExports.useRef(null);
  const pendingUpdateRef = reactExports.useRef(
    null
  );
  const isSavingRef = reactExports.useRef(false);
  const lastHydratedStateRef = reactExports.useRef(null);
  const currentMissionIdRef = reactExports.useRef(missionId.toString());
  reactExports.useEffect(() => {
    const newMissionId = missionId.toString();
    if (currentMissionIdRef.current !== newMissionId) {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      pendingUpdateRef.current = null;
      isSavingRef.current = false;
      lastHydratedStateRef.current = null;
      currentMissionIdRef.current = newMissionId;
    }
  }, [missionId]);
  reactExports.useEffect(() => {
    if (!enabled && timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, [enabled]);
  const performSave = reactExports.useCallback(
    async (saveTitle, saveTasks) => {
      if (isSavingRef.current) {
        pendingUpdateRef.current = { title: saveTitle, tasks: saveTasks };
        return;
      }
      isSavingRef.current = true;
      try {
        await updateMutation.mutateAsync({
          missionId,
          title: saveTitle,
          tasks: saveTasks
        });
        lastHydratedStateRef.current = {
          title: saveTitle,
          tasks: saveTasks.map((t) => ({ ...t })),
          missionId: missionId.toString()
        };
        if (pendingUpdateRef.current) {
          const pending = pendingUpdateRef.current;
          pendingUpdateRef.current = null;
          isSavingRef.current = false;
          await performSave(pending.title, pending.tasks);
        } else {
          isSavingRef.current = false;
        }
      } catch (error) {
        console.error("[useMissionAutosave] Save failed:", error);
        isSavingRef.current = false;
        pendingUpdateRef.current = null;
      }
    },
    [missionId, updateMutation]
  );
  reactExports.useEffect(() => {
    if (!enabled) return;
    if (!lastHydratedStateRef.current) {
      return;
    }
    const hasChanged = lastHydratedStateRef.current.title !== title || !areTaskArraysEqual(lastHydratedStateRef.current.tasks, tasks);
    if (!hasChanged) {
      return;
    }
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => {
      performSave(title, tasks);
    }, debounceMs);
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [title, tasks, enabled, debounceMs, performSave]);
  const markAsHydrated = reactExports.useCallback(
    (initialTitle, initialTasks) => {
      lastHydratedStateRef.current = {
        title: initialTitle,
        tasks: initialTasks.map((t) => ({ ...t })),
        missionId: missionId.toString()
      };
    },
    [missionId]
  );
  const syncBaseline = reactExports.useCallback(
    (newTitle, newTasks) => {
      lastHydratedStateRef.current = {
        title: newTitle,
        tasks: newTasks.map((t) => ({ ...t })),
        missionId: missionId.toString()
      };
    },
    [missionId]
  );
  const flushPendingSave = reactExports.useCallback(
    async (currentTitle, currentTasks) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      if (!enabled || !lastHydratedStateRef.current) {
        return;
      }
      const hasChanged = lastHydratedStateRef.current.title !== currentTitle || !areTaskArraysEqual(lastHydratedStateRef.current.tasks, currentTasks);
      if (!hasChanged) {
        return;
      }
      await performSave(currentTitle, currentTasks);
    },
    [enabled, performSave]
  );
  return {
    isSaving: isSavingRef.current || updateMutation.isPending,
    markAsHydrated,
    syncBaseline,
    flushPendingSave
  };
}
function LinkOpenFallbackDialog({
  open,
  onOpenChange,
  linkUrl,
  onRetryOpen,
  onCopyLink
}) {
  const handleCopy = async () => {
    await onCopyLink();
    ue.success("Link copied to clipboard");
    onOpenChange(false);
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open, onOpenChange, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "sm:max-w-md", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogHeader, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-full bg-warning/10 p-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx(CircleAlert, { className: "h-5 w-5 text-warning" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "Unable to Open Link" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogDescription, { className: "pt-2", children: "Your browser blocked opening this link in a new window. You can try again or copy the link to open it manually." })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-md bg-muted p-3 text-sm break-all", children: linkUrl }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { className: "flex-col sm:flex-row gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        Button,
        {
          variant: "outline",
          onClick: () => {
            onRetryOpen();
            onOpenChange(false);
          },
          className: "w-full sm:w-auto",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(ExternalLink, { className: "mr-2 h-4 w-4" }),
            "Try Again"
          ]
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: handleCopy, className: "w-full sm:w-auto", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Copy, { className: "mr-2 h-4 w-4" }),
        "Copy Link"
      ] })
    ] })
  ] }) });
}
function NoteViewerDialog({
  note,
  open,
  onOpenChange,
  onSendToFolder,
  onSendToMission
}) {
  const [isSharing, setIsSharing] = reactExports.useState(false);
  const deleteNotes = useDeleteNotes();
  const handleDownload = () => {
    downloadNoteAsText(note.title, note.body);
    ue.success("Note downloaded");
  };
  const handleShare = async () => {
    setIsSharing(true);
    try {
      const shared = await shareNote(note.title, note.body);
      if (!shared) {
        ue.error("Sharing not supported on this device");
      }
    } catch (error) {
      console.error("Share error:", error);
      ue.error("Failed to share note");
    } finally {
      setIsSharing(false);
    }
  };
  const handleDelete = async () => {
    try {
      await deleteNotes.mutateAsync([BigInt(note.id)]);
      ue.success("Note deleted");
      onOpenChange(false);
    } catch (error) {
      console.error("Delete error:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to delete note";
      ue.error(errorMessage);
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open, onOpenChange, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-2xl max-h-[80vh] flex flex-col", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { className: "text-xl", children: note.title }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(ScrollArea, { className: "flex-1 pr-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "whitespace-pre-wrap text-sm text-foreground", children: note.body || /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground italic", children: "No content" }) }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap gap-2 pt-4 border-t", children: [
      onSendToFolder && /* @__PURE__ */ jsxRuntimeExports.jsxs(
        Button,
        {
          variant: "outline",
          size: "sm",
          onClick: onSendToFolder,
          className: "flex-1",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(FolderInput, { className: "mr-2 h-4 w-4" }),
            "Send to Folder"
          ]
        }
      ),
      onSendToMission && /* @__PURE__ */ jsxRuntimeExports.jsxs(
        Button,
        {
          variant: "outline",
          size: "sm",
          onClick: onSendToMission,
          className: "flex-1",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Target, { className: "mr-2 h-4 w-4" }),
            "Send to Mission"
          ]
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        Button,
        {
          variant: "outline",
          size: "sm",
          onClick: handleDownload,
          className: "flex-1",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Download, { className: "mr-2 h-4 w-4" }),
            "Download"
          ]
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        Button,
        {
          variant: "outline",
          size: "sm",
          onClick: handleShare,
          disabled: isSharing,
          className: "flex-1",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Share2, { className: "mr-2 h-4 w-4" }),
            "Share"
          ]
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        Button,
        {
          variant: "destructive",
          size: "sm",
          onClick: handleDelete,
          disabled: deleteNotes.isPending,
          className: "flex-1",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "mr-2 h-4 w-4" }),
            "Delete"
          ]
        }
      )
    ] })
  ] }) });
}
function MissionDetailFullScreenView({
  missionId,
  onBack
}) {
  const [missionTitle, setMissionTitle] = reactExports.useState("");
  const [newTaskText, setNewTaskText] = reactExports.useState("");
  const [isEditingTitle, setIsEditingTitle] = reactExports.useState(false);
  const [viewerOpen, setViewerOpen] = reactExports.useState(false);
  const [noteViewerOpen, setNoteViewerOpen] = reactExports.useState(false);
  const [selectedFileIndex, setSelectedFileIndex] = reactExports.useState(0);
  const [selectedNote, setSelectedNote] = reactExports.useState(null);
  const [linkFallbackOpen, setLinkFallbackOpen] = reactExports.useState(false);
  const [currentLinkUrl, setCurrentLinkUrl] = reactExports.useState("");
  const [isHydrated, setIsHydrated] = reactExports.useState(false);
  const [selectionMode, setSelectionMode] = reactExports.useState(false);
  const [selectedFileIds, setSelectedFileIds] = reactExports.useState(
    /* @__PURE__ */ new Set()
  );
  const [selectedNoteIds, setSelectedNoteIds] = reactExports.useState(
    /* @__PURE__ */ new Set()
  );
  const [folderDialogOpen, setFolderDialogOpen] = reactExports.useState(false);
  const [missionDialogOpen, setMissionDialogOpen] = reactExports.useState(false);
  const { status } = useBackendActor();
  const queryClient = useQueryClient();
  const { data: selectedMission, isLoading: isLoadingMission } = useGetMission(missionId);
  const {
    data: attachedFiles,
    isLoading: isLoadingFiles,
    refetch: refetchFiles
  } = useGetFilesForMission(missionId);
  const {
    data: attachedNotes,
    isLoading: isLoadingNotes,
    refetch: refetchNotes
  } = useGetNotesForMission(missionId);
  const toggleTaskMutation = useToggleTaskCompletion();
  const addTaskMutation = useAddTaskToMission();
  const deleteFilesMutation = useDeleteFiles();
  const deleteNotesMutation = useDeleteNotes();
  const isActorReady = status === "ready";
  const tasks = (selectedMission == null ? void 0 : selectedMission.tasks) ?? [];
  const autosaveEnabled = isHydrated && isActorReady && !addTaskMutation.isPending && !toggleTaskMutation.isPending;
  const { isSaving, markAsHydrated, syncBaseline, flushPendingSave } = useMissionAutosave({
    missionId,
    title: missionTitle,
    tasks,
    enabled: autosaveEnabled
  });
  reactExports.useEffect(() => {
    if (selectedMission) {
      setMissionTitle(selectedMission.title);
      setIsHydrated(false);
      setTimeout(() => {
        markAsHydrated(selectedMission.title, selectedMission.tasks);
        setIsHydrated(true);
      }, 100);
    }
  }, [selectedMission, markAsHydrated]);
  const handleBack = async () => {
    await flushPendingSave(missionTitle, tasks);
    onBack();
  };
  const handleAddTask = async () => {
    const taskTextToAdd = newTaskText.trim();
    if (!taskTextToAdd || !isActorReady) return;
    try {
      await addTaskMutation.mutateAsync({
        missionId,
        task: taskTextToAdd
      });
      setNewTaskText("");
      setTimeout(() => {
        const latestMission = queryClient.getQueryData([
          "missions",
          "detail",
          missionId.toString()
        ]);
        if (latestMission) {
          syncBaseline(missionTitle, latestMission.tasks);
        }
      }, 0);
    } catch (error) {
      console.error("Failed to add task:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to add task";
      ue.error(errorMessage);
    }
  };
  const handleToggleTask = async (taskId, newCompleted) => {
    if (!isActorReady) return;
    try {
      await toggleTaskMutation.mutateAsync({
        missionId,
        taskId,
        completed: newCompleted
      });
      setTimeout(() => {
        const latestMission = queryClient.getQueryData([
          "missions",
          "detail",
          missionId.toString()
        ]);
        if (latestMission) {
          syncBaseline(missionTitle, latestMission.tasks);
        }
      }, 0);
    } catch (error) {
      console.error("Failed to toggle task:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to update task";
      ue.error(errorMessage);
    }
  };
  const handleFileClick = (index) => {
    if (selectionMode) {
      const file2 = attachedFiles == null ? void 0 : attachedFiles[index];
      if (!file2) return;
      setSelectedFileIds((prev) => {
        const next = new Set(prev);
        if (next.has(file2.id)) next.delete(file2.id);
        else next.add(file2.id);
        return next;
      });
      return;
    }
    const file = attachedFiles == null ? void 0 : attachedFiles[index];
    if (!file) return;
    if (file.link) {
      const url = file.link;
      openExternally(url).then((opened) => {
        if (!opened) {
          setCurrentLinkUrl(url);
          setLinkFallbackOpen(true);
        }
      }).catch((error) => {
        console.error("Failed to open link:", error);
        setCurrentLinkUrl(url);
        setLinkFallbackOpen(true);
      });
    } else {
      setSelectedFileIndex(index);
      setViewerOpen(true);
    }
  };
  const handleNoteClick = (note) => {
    if (selectionMode) {
      setSelectedNoteIds((prev) => {
        const next = new Set(prev);
        if (next.has(note.id)) next.delete(note.id);
        else next.add(note.id);
        return next;
      });
      return;
    }
    setSelectedNote(note);
    setNoteViewerOpen(true);
  };
  const makeLongPressHandlers = (onLongPress, onClick) => {
    const touchMoved = { current: false };
    const touchStarted = { current: false };
    const longPressTimer = {
      current: null
    };
    const didLongPress = { current: false };
    return {
      onTouchStart: () => {
        touchMoved.current = false;
        touchStarted.current = true;
        didLongPress.current = false;
        longPressTimer.current = setTimeout(() => {
          didLongPress.current = true;
          onLongPress();
        }, 500);
      },
      onTouchMove: () => {
        touchMoved.current = true;
        if (longPressTimer.current) {
          clearTimeout(longPressTimer.current);
          longPressTimer.current = null;
        }
      },
      onTouchEnd: () => {
        if (longPressTimer.current) {
          clearTimeout(longPressTimer.current);
          longPressTimer.current = null;
        }
        if (!touchMoved.current && touchStarted.current && !didLongPress.current) {
          onClick();
        }
        touchStarted.current = false;
      },
      onTouchCancel: () => {
        if (longPressTimer.current) {
          clearTimeout(longPressTimer.current);
          longPressTimer.current = null;
        }
        touchStarted.current = false;
      },
      onContextMenu: (e) => e.preventDefault()
    };
  };
  const handleRetryOpenLink = async () => {
    if (currentLinkUrl) {
      await openExternally(currentLinkUrl);
    }
  };
  const handleCopyLink = async () => {
    if (currentLinkUrl) {
      try {
        await navigator.clipboard.writeText(currentLinkUrl);
      } catch (error) {
        console.error("Failed to copy link:", error);
        ue.error("Failed to copy link");
      }
    }
  };
  const getFileIcon = (mimeType) => {
    if (mimeType.startsWith("image/")) return FileImage;
    if (mimeType.startsWith("video/")) return FileVideo;
    if (mimeType === "application/pdf") return FileText;
    if (mimeType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" || mimeType === "application/msword")
      return FileText;
    if (mimeType === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" || mimeType === "application/vnd.ms-excel")
      return FileSpreadsheet;
    return File;
  };
  const completedTasks = tasks.filter((t) => t.completed).length;
  const totalTasks = tasks.length;
  const progressPercentage = totalTasks > 0 ? Math.round(completedTasks / totalTasks * 100) : 0;
  const isLoading = isLoadingMission || isLoadingFiles || isLoadingNotes;
  const totalSelected = selectedFileIds.size + selectedNoteIds.size;
  const allFiles = attachedFiles ?? [];
  const allNotes = attachedNotes ?? [];
  const allAttachments = allFiles.length + allNotes.length;
  const allSelected = allAttachments > 0 && totalSelected === allAttachments;
  const handleSelectAll = () => {
    if (allSelected) {
      setSelectedFileIds(/* @__PURE__ */ new Set());
      setSelectedNoteIds(/* @__PURE__ */ new Set());
    } else {
      setSelectedFileIds(new Set(allFiles.map((f) => f.id)));
      setSelectedNoteIds(new Set(allNotes.map((n) => n.id)));
    }
  };
  const handleCancelSelection = () => {
    setSelectionMode(false);
    setSelectedFileIds(/* @__PURE__ */ new Set());
    setSelectedNoteIds(/* @__PURE__ */ new Set());
  };
  const handleDeleteSelected = async () => {
    const fileIds = Array.from(selectedFileIds);
    const noteIds = Array.from(selectedNoteIds).map((id) => BigInt(id));
    await Promise.all([
      fileIds.length > 0 ? deleteFilesMutation.mutateAsync(fileIds) : Promise.resolve(),
      noteIds.length > 0 ? deleteNotesMutation.mutateAsync(noteIds) : Promise.resolve()
    ]);
    handleCancelSelection();
    refetchFiles();
    refetchNotes();
  };
  const handleShareSelected = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: `${totalSelected} item(s) from MYL` });
      } catch {
      }
    }
  };
  const handleMoveComplete = () => {
    handleCancelSelection();
    refetchFiles();
    refetchNotes();
  };
  const startFileSelection = (file) => {
    setSelectionMode(true);
    setSelectedFileIds(/* @__PURE__ */ new Set([file.id]));
    setSelectedNoteIds(/* @__PURE__ */ new Set());
  };
  const startNoteSelection = (note) => {
    setSelectionMode(true);
    setSelectedNoteIds(/* @__PURE__ */ new Set([note.id]));
    setSelectedFileIds(/* @__PURE__ */ new Set());
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex min-h-screen flex-col bg-background", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("header", { className: "sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "container flex h-14 items-center px-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Button,
        {
          variant: "ghost",
          size: "icon",
          onClick: handleBack,
          className: "mr-2",
          children: /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowLeft, { className: "h-5 w-5" })
        }
      ),
      isEditingTitle ? /* @__PURE__ */ jsxRuntimeExports.jsx(
        Input,
        {
          value: missionTitle,
          onChange: (e) => setMissionTitle(e.target.value),
          onBlur: () => setIsEditingTitle(false),
          onKeyDown: (e) => {
            if (e.key === "Enter") {
              setIsEditingTitle(false);
            }
          },
          autoFocus: true,
          className: "flex-1 text-lg font-semibold",
          disabled: !isActorReady
        }
      ) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-1 items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-lg font-semibold truncate", children: missionTitle || "Untitled Mission" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Button,
          {
            variant: "ghost",
            size: "icon",
            onClick: () => setIsEditingTitle(true),
            disabled: !isActorReady,
            className: "h-8 w-8",
            children: /* @__PURE__ */ jsxRuntimeExports.jsx(Pen, { className: "h-4 w-4" })
          }
        ),
        isSaving && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-muted-foreground", children: "Saving..." })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("main", { className: "flex-1 container mx-auto px-4 py-6 pb-24", children: isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center justify-center py-12", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mb-4 inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground", children: "Loading mission..." })
    ] }) }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6", children: [
      totalTasks > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between text-sm", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium", children: "Progress" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-muted-foreground", children: [
            completedTasks,
            " / ",
            totalTasks,
            " tasks"
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Progress, { value: progressPercentage, className: "h-2" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-sm font-semibold text-muted-foreground uppercase tracking-wide", children: "Tasks" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Input,
            {
              placeholder: "Add a new task...",
              value: newTaskText,
              onChange: (e) => setNewTaskText(e.target.value),
              onKeyDown: (e) => {
                if (e.key === "Enter") {
                  handleAddTask();
                }
              },
              disabled: !isActorReady || addTaskMutation.isPending,
              className: "flex-1"
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Button,
            {
              onClick: handleAddTask,
              disabled: !isActorReady || !newTaskText.trim() || addTaskMutation.isPending,
              size: "icon",
              children: /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-4 w-4" })
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(ScrollArea, { className: "h-[300px] rounded-md border p-4", children: tasks.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-center text-muted-foreground py-8", children: "No tasks yet. Add one above!" }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-3", children: tasks.map((task) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "div",
          {
            className: "flex items-start gap-3 group",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Checkbox,
                {
                  checked: task.completed,
                  onCheckedChange: (checked) => {
                    const newCompleted = checked === true;
                    handleToggleTask(task.taskId, newCompleted);
                  },
                  disabled: !isActorReady,
                  className: "mt-1"
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "span",
                {
                  className: `flex-1 ${task.completed ? "line-through text-muted-foreground" : ""}`,
                  children: task.task
                }
              )
            ]
          },
          task.taskId.toString()
        )) }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-sm font-semibold text-muted-foreground uppercase tracking-wide", children: "Attachments" }),
          allAttachments > 0 && !selectionMode && /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              type: "button",
              onClick: () => setSelectionMode(true),
              className: "text-xs font-medium",
              style: { color: "#7C3AED" },
              "data-ocid": "mission.selection.select_button",
              children: "Select"
            }
          )
        ] }),
        attachedFiles && attachedFiles.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-xs font-medium text-muted-foreground mb-2", children: "Files & Links" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-3 gap-3", children: attachedFiles.map((file, index) => {
            const isLink = !!file.link;
            const Icon = isLink ? ExternalLink : getFileIcon(file.mimeType);
            const isImage = !isLink && file.mimeType.startsWith("image/");
            const isVideo = !isLink && file.mimeType.startsWith("video/");
            const isSelected = selectedFileIds.has(file.id);
            const lp = makeLongPressHandlers(
              () => startFileSelection(file),
              () => handleFileClick(index)
            );
            return /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "button",
              {
                type: "button",
                onClick: () => handleFileClick(index),
                onKeyDown: (e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    handleFileClick(index);
                  }
                },
                onTouchStart: lp.onTouchStart,
                onTouchMove: lp.onTouchMove,
                onTouchEnd: lp.onTouchEnd,
                onTouchCancel: lp.onTouchCancel,
                onContextMenu: lp.onContextMenu,
                className: "group cursor-pointer relative text-left bg-transparent border-0 p-0 w-full",
                style: {
                  userSelect: "none",
                  WebkitUserSelect: "none"
                },
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs(
                    "div",
                    {
                      className: "relative w-full aspect-square overflow-hidden rounded-lg bg-muted transition-all duration-150 hover:shadow-lg hover:scale-[1.02]",
                      style: {
                        outline: isSelected ? "2px solid #7C3AED" : "none",
                        outlineOffset: 2
                      },
                      children: [
                        isLink ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex h-full w-full items-center justify-center bg-gradient-to-br from-blue-500/10 to-purple-500/10", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { className: "h-10 w-10 text-blue-600 dark:text-blue-400" }) }) : isImage && file.blob ? /* @__PURE__ */ jsxRuntimeExports.jsx(
                          "img",
                          {
                            src: file.blob.getDirectURL(),
                            alt: file.name,
                            className: "h-full w-full object-cover",
                            loading: "lazy",
                            draggable: false
                          }
                        ) : isVideo && file.blob ? /* @__PURE__ */ jsxRuntimeExports.jsx(
                          "video",
                          {
                            src: file.blob.getDirectURL(),
                            className: "h-full w-full object-cover",
                            preload: "metadata",
                            children: /* @__PURE__ */ jsxRuntimeExports.jsx("track", { kind: "captions" })
                          }
                        ) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex h-full w-full items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { className: "h-10 w-10 text-muted-foreground" }) }),
                        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-150" }),
                        isLink && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute top-2 right-2 bg-blue-600 text-white rounded-full p-1 shadow-md", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ExternalLink, { className: "h-3 w-3" }) }),
                        isSelected && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute top-1 right-1", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                          CircleCheck,
                          {
                            size: 18,
                            color: "#7C3AED",
                            fill: "white"
                          }
                        ) })
                      ]
                    }
                  ),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "p",
                    {
                      className: "mt-1.5 text-xs truncate",
                      title: file.name,
                      children: file.name
                    }
                  )
                ]
              },
              file.id
            );
          }) })
        ] }),
        attachedNotes && attachedNotes.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-xs font-medium text-muted-foreground mb-2", children: "Notes" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-3 gap-3", children: attachedNotes.map((note) => {
            const isSelected = selectedNoteIds.has(note.id);
            const lp = makeLongPressHandlers(
              () => startNoteSelection(note),
              () => handleNoteClick(note)
            );
            return /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "button",
              {
                type: "button",
                onClick: () => handleNoteClick(note),
                onKeyDown: (e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    handleNoteClick(note);
                  }
                },
                onTouchStart: lp.onTouchStart,
                onTouchMove: lp.onTouchMove,
                onTouchEnd: lp.onTouchEnd,
                onTouchCancel: lp.onTouchCancel,
                onContextMenu: lp.onContextMenu,
                className: "group cursor-pointer relative text-left bg-transparent border-0 p-0 w-full",
                style: {
                  userSelect: "none",
                  WebkitUserSelect: "none"
                },
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs(
                    "div",
                    {
                      className: "relative w-full aspect-square overflow-hidden rounded-lg bg-amber-50 dark:bg-amber-950/20 transition-all duration-150 hover:shadow-lg hover:scale-[1.02] border border-amber-200 dark:border-amber-800",
                      style: {
                        outline: isSelected ? "2px solid #7C3AED" : "none",
                        outlineOffset: 2
                      },
                      children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex h-full w-full items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(StickyNote, { className: "h-10 w-10 text-amber-600 dark:text-amber-400" }) }),
                        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-150" }),
                        isSelected && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute top-1 right-1", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                          CircleCheck,
                          {
                            size: 18,
                            color: "#7C3AED",
                            fill: "white"
                          }
                        ) })
                      ]
                    }
                  ),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "p",
                    {
                      className: "mt-1.5 text-xs truncate",
                      title: note.title,
                      children: note.title
                    }
                  )
                ]
              },
              note.id.toString()
            );
          }) })
        ] }),
        (!attachedFiles || attachedFiles.length === 0) && (!attachedNotes || attachedNotes.length === 0) && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-center text-muted-foreground py-8", children: "No attachments yet" })
      ] })
    ] }) }),
    selectionMode && /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "div",
      {
        className: "fixed left-0 right-0 z-[70] flex flex-col",
        style: {
          bottom: 0,
          background: "var(--background)",
          borderTop: "1px solid var(--border)",
          paddingBottom: "env(safe-area-inset-bottom)"
        },
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "div",
            {
              className: "flex items-center justify-between px-4 py-2",
              style: { borderBottom: "1px solid var(--border)" },
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "button",
                  {
                    type: "button",
                    onClick: handleSelectAll,
                    className: "text-sm font-semibold",
                    style: { color: "#7C3AED" },
                    "data-ocid": "mission.select_all.button",
                    children: allSelected ? "Deselect All" : "Select All"
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-sm text-muted-foreground", children: [
                  totalSelected,
                  " selected"
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "button",
                  {
                    type: "button",
                    onClick: handleCancelSelection,
                    className: "text-sm text-muted-foreground",
                    "data-ocid": "mission.selection.cancel_button",
                    children: "Cancel"
                  }
                )
              ]
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-around px-4 py-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "button",
              {
                type: "button",
                disabled: totalSelected === 0,
                onClick: () => setMissionDialogOpen(true),
                className: "flex flex-col items-center gap-1 disabled:opacity-40",
                "data-ocid": "mission.selection.mission_button",
                children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "span",
                  {
                    className: "text-xs font-semibold",
                    style: { color: "#7C3AED" },
                    children: "Mission"
                  }
                )
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "button",
              {
                type: "button",
                disabled: totalSelected === 0,
                onClick: () => setFolderDialogOpen(true),
                className: "flex flex-col items-center gap-1 disabled:opacity-40",
                "data-ocid": "mission.selection.folder_button",
                children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "span",
                  {
                    className: "text-xs font-semibold",
                    style: { color: "#0D9488" },
                    children: "Folder"
                  }
                )
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "button",
              {
                type: "button",
                disabled: totalSelected === 0,
                onClick: handleShareSelected,
                className: "flex flex-col items-center gap-1 disabled:opacity-40",
                "data-ocid": "mission.selection.share_button",
                children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "span",
                  {
                    className: "text-xs font-semibold",
                    style: { color: "#2563EB" },
                    children: "Share"
                  }
                )
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "button",
              {
                type: "button",
                disabled: totalSelected === 0,
                onClick: handleDeleteSelected,
                className: "flex flex-col items-center gap-1 disabled:opacity-40",
                "data-ocid": "mission.selection.delete_button",
                children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "span",
                  {
                    className: "text-xs font-semibold",
                    style: { color: "#EF4444" },
                    children: "Delete"
                  }
                )
              }
            )
          ] })
        ]
      }
    ),
    viewerOpen && attachedFiles && attachedFiles.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx(
      FullScreenViewer,
      {
        files: attachedFiles,
        initialIndex: selectedFileIndex,
        open: viewerOpen,
        onOpenChange: setViewerOpen
      }
    ),
    noteViewerOpen && selectedNote && /* @__PURE__ */ jsxRuntimeExports.jsx(
      NoteViewerDialog,
      {
        note: selectedNote,
        open: noteViewerOpen,
        onOpenChange: (open) => {
          setNoteViewerOpen(open);
          if (!open) {
            setSelectedNote(null);
          }
        }
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      LinkOpenFallbackDialog,
      {
        open: linkFallbackOpen,
        onOpenChange: setLinkFallbackOpen,
        linkUrl: currentLinkUrl,
        onRetryOpen: handleRetryOpenLink,
        onCopyLink: handleCopyLink
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      SendToFolderDialog,
      {
        open: folderDialogOpen,
        onOpenChange: setFolderDialogOpen,
        fileIds: Array.from(selectedFileIds),
        noteIds: Array.from(selectedNoteIds).map((id) => BigInt(id)),
        onMoveComplete: handleMoveComplete
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      MoveToMissionDialog,
      {
        open: missionDialogOpen,
        onOpenChange: setMissionDialogOpen,
        fileIds: Array.from(selectedFileIds),
        noteIds: Array.from(selectedNoteIds).map((id) => BigInt(id)),
        onMoveComplete: handleMoveComplete
      }
    )
  ] });
}
function MissionEditorDialog({
  open,
  onOpenChange,
  missionId: _missionId,
  isCreating
}) {
  const [missionTitle, setMissionTitle] = reactExports.useState("");
  const [tasks, setTasks] = reactExports.useState([]);
  const [newTaskText, setNewTaskText] = reactExports.useState("");
  const { status } = useBackendActor();
  const createMissionMutation = useCreateMission();
  const isActorReady = status === "ready";
  reactExports.useEffect(() => {
    if (isCreating && open) {
      setMissionTitle("");
      setTasks([]);
      setNewTaskText("");
    }
  }, [isCreating, open]);
  reactExports.useEffect(() => {
    if (!open) {
      setMissionTitle("");
      setTasks([]);
      setNewTaskText("");
    }
  }, [open]);
  const handleCreateMission = async () => {
    if (!isActorReady) {
      ue.error("Please wait for the application to initialize");
      return;
    }
    if (!missionTitle.trim()) {
      ue.error("Please enter a mission title");
      return;
    }
    try {
      const tasksCopy = tasks.map((t) => ({
        taskId: t.taskId,
        task: t.task,
        completed: t.completed
      }));
      await createMissionMutation.mutateAsync({
        title: missionTitle.trim(),
        tasks: tasksCopy
      });
      ue.success("Mission created successfully");
      onOpenChange(false);
    } catch (error) {
      console.error("Failed to create mission:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to create mission";
      ue.error(errorMessage);
    }
  };
  const handleAddTask = () => {
    if (!newTaskText.trim()) return;
    const collisionResistantId = BigInt(
      `${Date.now()}${Math.random().toString().slice(2, 8)}`
    );
    const newTask = {
      taskId: collisionResistantId,
      task: newTaskText.trim(),
      completed: false
    };
    setTasks([...tasks, newTask]);
    setNewTaskText("");
  };
  const handleToggleTask = (taskId) => {
    setTasks(
      tasks.map(
        (t) => t.taskId.toString() === taskId.toString() ? { ...t, completed: !t.completed } : t
      )
    );
  };
  const handleRemoveTask = (taskId) => {
    setTasks(tasks.filter((t) => t.taskId.toString() !== taskId.toString()));
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open, onOpenChange, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-[95vw] w-full h-[85dvh] flex flex-col p-0 gap-0", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogHeader, { className: "px-6 pt-4 pb-3 border-b shrink-0", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { className: "sr-only", children: "Create New Mission" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Input,
        {
          placeholder: "Mission title...",
          value: missionTitle,
          onChange: (e) => setMissionTitle(e.target.value),
          disabled: !isActorReady,
          className: "text-xl font-bold border-0 focus-visible:ring-1 shadow-none px-0",
          autoFocus: true
        }
      )
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "px-6 pt-3 pb-2 border-b shrink-0 bg-background", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Input,
        {
          placeholder: "Add a new task...",
          value: newTaskText,
          onChange: (e) => setNewTaskText(e.target.value),
          onKeyDown: (e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleAddTask();
            }
          },
          disabled: !isActorReady
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Button,
        {
          onClick: handleAddTask,
          disabled: !isActorReady || !newTaskText.trim(),
          className: "bg-[#7C3AED] hover:bg-[#6D28D9] text-white dark:bg-[#A78BFA] dark:hover:bg-[#C4B5FD] dark:text-[#1a1040] shrink-0",
          children: /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-4 w-4" })
        }
      )
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex-1 overflow-hidden px-6 min-h-0", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ScrollArea, { className: "h-full pr-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-2 py-3", children: tasks.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-center py-6 text-muted-foreground", children: /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm", children: "No tasks yet. Add tasks above to get started!" }) }) : tasks.map((task, index) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "div",
      {
        className: "flex items-start gap-3 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors group",
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Checkbox,
            {
              checked: task.completed,
              onCheckedChange: () => handleToggleTask(task.taskId),
              disabled: !isActorReady,
              className: "mt-0.5"
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-sm font-medium", children: [
              index + 1,
              "."
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "span",
              {
                className: `ml-2 ${task.completed ? "line-through text-muted-foreground" : ""}`,
                children: task.task
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Button,
            {
              variant: "ghost",
              size: "icon",
              className: "h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity",
              onClick: () => handleRemoveTask(task.taskId),
              disabled: !isActorReady,
              children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "h-4 w-4 text-destructive" })
            }
          )
        ]
      },
      task.taskId.toString()
    )) }) }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "px-6 pb-4 pt-3 border-t shrink-0 bg-background", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-end gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Button,
        {
          variant: "outline",
          onClick: () => onOpenChange(false),
          disabled: createMissionMutation.isPending,
          children: "Cancel"
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Button,
        {
          onClick: handleCreateMission,
          disabled: !isActorReady || !missionTitle.trim() || createMissionMutation.isPending,
          className: "bg-[#7C3AED] hover:bg-[#6D28D9] text-white dark:bg-[#A78BFA] dark:hover:bg-[#C4B5FD] dark:text-[#1a1040]",
          children: createMissionMutation.isPending ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-4 w-4 mr-2 animate-spin rounded-full border-2 border-solid border-white border-r-transparent" }),
            "Creating..."
          ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Save, { className: "h-4 w-4 mr-2" }),
            "Create Mission"
          ] })
        }
      )
    ] }) })
  ] }) });
}
function MissionsFullScreenView({
  onClose
}) {
  const [isCreating, setIsCreating] = reactExports.useState(false);
  const [selectedMissionId, setSelectedMissionId] = reactExports.useState(
    null
  );
  const [openSwipeRowId, setOpenSwipeRowId] = reactExports.useState(null);
  const [deleteConfirmMissionId, setDeleteConfirmMissionId] = reactExports.useState(null);
  const [activeTab, setActiveTab] = reactExports.useState(
    "incomplete"
  );
  const swipeStartX = reactExports.useRef(null);
  const swipeStartY = reactExports.useRef(null);
  const { status } = useBackendActor();
  const { data: missions = [], isLoading } = useListMissions();
  const deleteMissionMutation = useDeleteMission();
  const isActorReady = status === "ready";
  const { incomplete, completed } = splitMissionsByCompletion(missions);
  reactExports.useEffect(() => {
  }, [selectedMissionId]);
  const handleSwipeTouchStart = (e) => {
    swipeStartX.current = e.touches[0].clientX;
    swipeStartY.current = e.touches[0].clientY;
  };
  const handleSwipeTouchEnd = (e) => {
    if (swipeStartX.current === null || swipeStartY.current === null) return;
    const dx = e.changedTouches[0].clientX - swipeStartX.current;
    const dy = e.changedTouches[0].clientY - swipeStartY.current;
    swipeStartX.current = null;
    swipeStartY.current = null;
    if (Math.abs(dx) < 50 || Math.abs(dy) > Math.abs(dx)) return;
    if (dx < 0) {
      setActiveTab("completed");
    } else {
      setActiveTab("incomplete");
    }
  };
  const handleOpenDeleteConfirm = (missionId) => {
    setOpenSwipeRowId(null);
    setDeleteConfirmMissionId(missionId);
  };
  const handleDeleteMission = async (missionId) => {
    if (!isActorReady) {
      ue.error("Please wait for the application to initialize");
      return;
    }
    try {
      await deleteMissionMutation.mutateAsync(missionId);
      setDeleteConfirmMissionId(null);
      setOpenSwipeRowId(null);
    } catch (error) {
      console.error("Failed to delete mission:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to delete mission";
      ue.error(errorMessage);
    }
  };
  const handleMissionSelect = (mission) => {
    setSelectedMissionId(mission.id);
  };
  const handleBackFromDetail = () => {
    setSelectedMissionId(null);
  };
  const renderMissionRow = (mission) => {
    const missionId = mission.id.toString();
    const totalTasks = mission.tasks.length;
    const completedTasks = mission.tasks.filter((t) => t.completed).length;
    const missionContent = /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center gap-2 p-2 rounded-lg hover:bg-muted/50 transition-colors", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
      Button,
      {
        variant: "ghost",
        className: "flex-1 justify-start text-left",
        onClick: () => handleMissionSelect(mission),
        children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-medium", children: mission.title }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-sm text-muted-foreground", children: [
            completedTasks,
            "/",
            totalTasks,
            " tasks completed"
          ] })
        ] })
      }
    ) });
    return /* @__PURE__ */ jsxRuntimeExports.jsx(
      SwipeActionsRow,
      {
        onEdit: () => {
        },
        onDelete: () => handleOpenDeleteConfirm(mission.id),
        isOpen: openSwipeRowId === missionId,
        onOpenChange: (open) => {
          setOpenSwipeRowId(open ? missionId : null);
        },
        disabled: !isActorReady,
        children: missionContent
      },
      missionId
    );
  };
  if (selectedMissionId !== null) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(
      MissionDetailFullScreenView,
      {
        missionId: selectedMissionId,
        onBack: handleBackFromDetail
      }
    );
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "fixed inset-0 z-50 bg-background flex flex-col animate-page-scale-in", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "div",
        {
          className: "flex items-center gap-4 p-4 border-b border-border",
          "data-transition-target": "missions",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Button,
              {
                variant: "ghost",
                size: "icon",
                onClick: onClose,
                className: "shrink-0",
                children: /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowLeft, { className: "h-5 w-5" })
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-xl font-semibold flex-1", children: "Missions" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Button,
              {
                size: "icon",
                onClick: () => setIsCreating(true),
                disabled: !isActorReady,
                "data-ocid": "missions.create.primary_button",
                className: "shrink-0 bg-[#7C3AED] hover:bg-[#6D28D9] text-white dark:bg-[#A78BFA] dark:hover:bg-[#C4B5FD] dark:text-[#1a1040]",
                children: /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-4 w-4" })
              }
            )
          ]
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        Tabs,
        {
          value: activeTab,
          onValueChange: (v) => setActiveTab(v),
          className: "flex-1 flex flex-col",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsList, { className: "w-full rounded-none border-b", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsTrigger, { value: "incomplete", className: "flex-1", children: [
                "Active (",
                incomplete.length,
                ")"
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsTrigger, { value: "completed", className: "flex-1", children: [
                "Completed (",
                completed.length,
                ")"
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "div",
              {
                className: "flex-1 overflow-hidden",
                onTouchStart: handleSwipeTouchStart,
                onTouchEnd: handleSwipeTouchEnd,
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "incomplete", className: "h-full mt-0", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ScrollArea, { className: "h-full", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-4 space-y-2", children: isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-center py-8 text-muted-foreground", children: "Loading missions..." }) : incomplete.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center py-8 text-muted-foreground", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium mb-2", children: "No active missions" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm", children: "Tap + to create a new mission!" })
                  ] }) : incomplete.map(renderMissionRow) }) }) }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "completed", className: "h-full mt-0", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ScrollArea, { className: "h-full", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-4 space-y-2", children: isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-center py-8 text-muted-foreground", children: "Loading missions..." }) : completed.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center py-8 text-muted-foreground", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium mb-2", children: "No completed missions" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm", children: "Complete a mission to see it here." })
                  ] }) : completed.map(renderMissionRow) }) }) })
                ]
              }
            )
          ]
        }
      )
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      MissionEditorDialog,
      {
        open: isCreating,
        onOpenChange: setIsCreating,
        missionId: null,
        isCreating: true
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      AlertDialog,
      {
        open: deleteConfirmMissionId !== null,
        onOpenChange: (open) => !open && setDeleteConfirmMissionId(null),
        children: /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDialogContent, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDialogHeader, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDialogTitle, { children: "Delete Mission" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDialogDescription, { children: "Are you sure you want to delete this mission? This action cannot be undone." })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDialogFooter, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDialogCancel, { children: "Cancel" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              AlertDialogAction,
              {
                onClick: () => deleteConfirmMissionId !== null && handleDeleteMission(deleteConfirmMissionId),
                className: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
                children: "OK"
              }
            )
          ] })
        ] })
      }
    )
  ] });
}
export {
  MissionsFullScreenView as default
};
