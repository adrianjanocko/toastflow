<script setup lang="ts">
import {
  computed,
  inject,
  onBeforeUpdate,
  onMounted,
  onUnmounted,
  onUpdated,
  ref,
  watch,
} from "vue";
import Toast from "./Toast.vue";
import ToastSlotProvider from "./ToastSlotProvider.vue";
import type {
  ToastAnimation,
  ToastConfig,
  ToastId,
  ToastInstance,
  ToastPosition,
  ToastStore,
} from "toastflow-core";
import { toastStoreKey } from "../symbols";
import { getToastStore } from "../toast";
import {
  registerContainer,
  unregisterContainer,
  warnUnmountedTargets,
} from "../container-registry";

const props = defineProps<{
  /**
   * Container identifier. Toasts render here when their `containerId` option
   * matches this id; omit both for the single default container.
   */
  id?: string;
}>();

const positions: ToastPosition[] = [
  "top-left",
  "top-center",
  "top-right",
  "bottom-left",
  "bottom-center",
  "bottom-right",
];

const injectedStore = inject<ToastStore | null>(toastStoreKey, null);
const store: ToastStore = injectedStore ?? getToastStore();

const rootEl = ref<HTMLElement | null>(null);
const toasts = ref<ToastInstance[]>([]);

const DEFAULT_ENTER_DURATION = 260;
const DEFAULT_LEAVE_DURATION = 220;
const transitionDurations = ref<{ enter: number; leave: number }>({
  enter: DEFAULT_ENTER_DURATION,
  leave: DEFAULT_LEAVE_DURATION,
});

// event-driven keys
const progressResetMap = ref<Record<ToastId, number>>({});
const duplicateMap = ref<Record<ToastId, number>>({});
const updateMap = ref<Record<ToastId, number>>({});

let unsubscribeState: (() => void) | null = null;
let unsubscribeEvents: (() => void) | null = null;

// Deferred so sibling containers mounting in the same tick are registered
// before toast targets are validated.
let targetCheckHandle: ReturnType<typeof setTimeout> | null = null;

function scheduleTargetCheck(): void {
  if (typeof window === "undefined" || targetCheckHandle !== null) {
    return;
  }
  targetCheckHandle = setTimeout(function () {
    targetCheckHandle = null;
    warnUnmountedTargets(toasts.value);
  }, 0);
}

onMounted(function () {
  registerContainer(props.id);

  unsubscribeState = store.subscribe(function (state) {
    toasts.value = state.toasts;
    scheduleTargetCheck();
  });

  unsubscribeEvents = store.subscribeEvents(function (event) {
    if (event.kind === "timer-reset") {
      progressResetMap.value[event.id] = Math.random();
    }

    if (event.kind === "duplicate") {
      duplicateMap.value[event.id] = Math.random();
    }

    if (event.kind === "update") {
      updateMap.value[event.id] = Math.random();
    }
  });

  refreshTransitionDurations();
  updateStackMetrics();

  if (typeof window !== "undefined") {
    window.addEventListener("resize", updateStackMetrics);
  }
});

onUnmounted(function () {
  if (unsubscribeState) {
    unsubscribeState();
  }
  if (unsubscribeEvents) {
    unsubscribeEvents();
  }
  if (targetCheckHandle !== null) {
    clearTimeout(targetCheckHandle);
    targetCheckHandle = null;
  }
  if (typeof window !== "undefined") {
    window.removeEventListener("resize", updateStackMetrics);
  }
  unregisterContainer(props.id);
});

function getProgressResetKey(id: ToastId): number {
  return progressResetMap.value[id] ?? 0;
}

function getDuplicateKey(id: ToastId): number {
  return duplicateMap.value[id] ?? 0;
}

function getUpdateKey(id: ToastId): number {
  return updateMap.value[id] ?? 0;
}

const grouped = computed(function () {
  const byPos: Record<ToastPosition, ToastInstance[]> = {
    "top-left": [],
    "top-center": [],
    "top-right": [],
    "bottom-left": [],
    "bottom-center": [],
    "bottom-right": [],
  };

  for (const toast of toasts.value) {
    // Strict match: toasts without a containerId belong to the default
    // (id-less) container only.
    if (toast.containerId !== props.id) {
      continue;
    }
    byPos[toast.position].push(toast);
  }

  return byPos;
});

const baseConfig: ToastConfig = store.getConfig();
const stackConfigs = ref<Record<ToastPosition, ToastConfig>>({
  "top-left": { ...baseConfig, position: "top-left" },
  "top-center": { ...baseConfig, position: "top-center" },
  "top-right": { ...baseConfig, position: "top-right" },
  "bottom-left": { ...baseConfig, position: "bottom-left" },
  "bottom-center": { ...baseConfig, position: "bottom-center" },
  "bottom-right": { ...baseConfig, position: "bottom-right" },
});

const globalZIndex = computed(function () {
  if (!toasts.value.length) {
    return baseConfig.zIndex;
  }
  let max = -Infinity;
  for (const toast of toasts.value) {
    if (toast.zIndex > max) {
      max = toast.zIndex;
    }
  }
  return max;
});

function stackConfig(position: ToastPosition): ToastConfig {
  return stackConfigs.value[position] ?? { ...baseConfig, position };
}

function stackStyle(position: ToastPosition): Record<string, string> {
  const { offset, width } = stackConfig(position);
  const responsiveMaxWidth = `calc(100vw - (${offset}) - (${offset}))`;
  // Lock the stack width, so it doesn't collapse when leaving items get absolute-positioned
  const style: Record<string, string> = {
    width,
    maxWidth: responsiveMaxWidth,
    // Scroll padding mirrors the offset onto the pinned (0) edge so both
    // ends of a fully scrolled stack keep the same visual gap.
    "--tf-toast-stack-offset": offset,
  };

  // The opposite edge is pinned to the viewport so a scrollable stack (and
  // its scrollbar) stays fully on screen.
  if (position.startsWith("top-")) {
    style.top = offset;
    style.bottom = "0";
  }
  if (position.startsWith("bottom-")) {
    style.bottom = offset;
    style.top = "0";
  }

  if (position.endsWith("left")) {
    style.left = offset;
  } else if (position.endsWith("right")) {
    style.right = offset;
  } else if (position.endsWith("center")) {
    style.left = "50%";
    style.transform = "translateX(-50%)";
  }

  return style;
}

function stackAlignClass(position: ToastPosition): string {
  if (position.endsWith("left")) {
    return "tf-toast-stack--left";
  }
  if (position.endsWith("center")) {
    return "tf-toast-stack--center";
  }
  return "tf-toast-stack--right";
}

function stackAxisClass(position: ToastPosition): string | null {
  if (!position.startsWith("bottom-")) {
    return null;
  }
  // Scrollable bottom stacks pin to the edge via the outer
  // .tf-toast-stack--bottom instead of justify-content: flex-end, which
  // would make the overflowing top items unreachable.
  return allowOverflowScroll(position)
    ? "tf-toast-stack-inner--bottom tf-toast-stack-inner--bottom-scroll"
    : "tf-toast-stack-inner--bottom";
}

// Scroll mode is activated per position only once the stack content really
// outgrows the viewport — otherwise the scrollbar (and its layout shift)
// would flash on every enter/leave animation.
const scrollActiveByPosition = ref<Partial<Record<ToastPosition, boolean>>>({});
// Deactivating needs slack for the scroll padding the class adds (base
// padding plus the offset mirrored onto the pinned edge), plus a hysteresis
// band so the boundary doesn't flap.
const SCROLL_PADDING_BASE = 16;
const SCROLL_HYSTERESIS = 8;

function measureStackContentHeight(inner: HTMLElement, gapPx: number): number {
  let content = 0;
  let count = 0;
  for (const child of Array.from(inner.children) as HTMLElement[]) {
    if (!child.classList.contains("tf-toast-item")) {
      continue;
    }
    // Leave-pinned items are out of flow and must not count.
    if (child.style.position === "absolute") {
      continue;
    }
    content += child.offsetHeight;
    count++;
  }
  return content + gapPx * Math.max(count - 1, 0);
}

function updateStackMetrics(): void {
  if (!rootEl.value) {
    return;
  }

  const nextActive: Partial<Record<ToastPosition, boolean>> = {};

  for (const position of positions) {
    const inner = innerElFor(position);
    const stack = inner?.parentElement;
    if (!inner || !stack) {
      continue;
    }

    const cfg = stackConfig(position);
    if (!cfg.overflowScroll) {
      continue;
    }

    const content = measureStackContentHeight(inner, toPx(cfg.gap, 8));
    const available = stack.clientHeight;
    const slack =
      SCROLL_PADDING_BASE + toPx(cfg.offset, 16) + SCROLL_HYSTERESIS;
    const wasActive = scrollActiveByPosition.value[position] === true;
    nextActive[position] = wasActive
      ? content > available - slack
      : content > available;
  }

  if (
    JSON.stringify(nextActive) !== JSON.stringify(scrollActiveByPosition.value)
  ) {
    scrollActiveByPosition.value = nextActive;
  }
}

function allowOverflowScroll(position: ToastPosition): boolean {
  if (!stackConfig(position).overflowScroll) {
    return false;
  }
  return scrollActiveByPosition.value[position] === true;
}

function handleDismiss(id: ToastId) {
  store.dismiss(id);
}

function toPx(value: string, fallback: number): number {
  const trimmed = value.trim();
  if (!trimmed) {
    return fallback;
  }
  const numeric = parseFloat(trimmed);
  if (!Number.isFinite(numeric)) {
    return fallback;
  }
  if (trimmed.endsWith("rem") || trimmed.endsWith("em")) {
    const rootSize =
      typeof window === "undefined"
        ? 16
        : parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
    return numeric * rootSize;
  }
  return numeric;
}

function stackInnerStyle(position: ToastPosition): Record<string, string> {
  return { gap: stackConfig(position).gap };
}

function itemStyle(toast: ToastInstance): Record<string, string> {
  return {
    width: toast.width,
    maxWidth: "100%",
  };
}

function innerElFor(position: ToastPosition): HTMLElement | null {
  const root = rootEl.value;
  if (!root) {
    return null;
  }
  return root.querySelector<HTMLElement>(
    `.tf-toast-stack-inner[data-position="${position}"]`,
  );
}

function parseDurationVariable(value: string, fallback: number): number {
  const trimmed = value.trim().toLowerCase();
  if (!trimmed) {
    return fallback;
  }

  if (trimmed.endsWith("ms")) {
    const numeric = Number(trimmed.slice(0, -2));
    return Number.isFinite(numeric) ? numeric : fallback;
  }

  if (trimmed.endsWith("s")) {
    const numeric = Number(trimmed.slice(0, -1));
    return Number.isFinite(numeric) ? numeric * 1000 : fallback;
  }

  const numeric = Number(trimmed);
  return Number.isFinite(numeric) ? numeric : fallback;
}

function refreshTransitionDurations() {
  if (typeof window === "undefined") {
    return;
  }

  const style = getComputedStyle(document.documentElement);

  transitionDurations.value = {
    enter: parseDurationVariable(
      style.getPropertyValue("--tf-toast-animation-in-duration"),
      DEFAULT_ENTER_DURATION,
    ),
    leave: parseDurationVariable(
      style.getPropertyValue("--tf-toast-animation-out-duration"),
      DEFAULT_LEAVE_DURATION,
    ),
  };
}

// Vue's TransitionGroup FLIP measures positions while previously started
// move transitions are still running (removing the move class does not
// cancel a running CSS transition), so interrupted moves teleport and
// leaving elements get spurious offsets. The move handling is therefore
// done here: Vue's own move logic is disabled via a no-op move-class
// (hasCSSTransform check fails), positions are snapshotted visually in
// onBeforeUpdate, in-flight transforms are neutralized before measuring
// the new layout, and the FLIP delta is animated with the move class.
interface CachedPosition {
  layoutTop: number;
  height: number;
  parentHeight: number;
  parentWidth: number;
  viewportTop: number;
  viewportLeft: number;
}

const positionCache = new WeakMap<Element, CachedPosition>();
const moveCleanup = new WeakMap<Element, () => void>();

// layoutTop/height (offset-based, ignores transforms) anchor the leave pin;
// viewportTop/Left (visual, includes in-flight transforms) feed the FLIP.
function measurePosition(el: HTMLElement, parent: HTMLElement): CachedPosition {
  const rect = el.getBoundingClientRect();
  return {
    layoutTop: el.offsetTop,
    height: el.offsetHeight,
    parentHeight: parent.clientHeight,
    parentWidth: parent.clientWidth,
    viewportTop: rect.top,
    viewportLeft: rect.left,
  };
}

// Cancel a running move transition so the element sits at its layout
// position and subsequent measurements are transform-free.
function cancelMove(element: HTMLElement) {
  const cleanup = moveCleanup.get(element);
  if (cleanup) {
    cleanup();
  }
  element.style.transition = "none";
  element.style.transform = "";
}

function moveClassFor(element: HTMLElement): string {
  const position = (element.dataset.position ?? "") as ToastPosition;
  const name =
    stackConfigs.value[position]?.animation.name ?? baseConfig.animation.name;
  return `${name}-move`;
}

function collectItems(): HTMLElement[] {
  const root = rootEl.value;
  if (!root) {
    return [];
  }
  return Array.from(root.querySelectorAll<HTMLElement>(".tf-toast-item"));
}

// Scrollable bottom stacks are kept pinned to the newest toast (at the
// bottom edge) unless the user scrolled away. Recorded before the update,
// re-applied before the FLIP measures so the jump rides the move animation.
const scrollPinState = new Map<HTMLElement, boolean>();

function collectScrollStacks(): HTMLElement[] {
  const root = rootEl.value;
  if (!root) {
    return [];
  }
  return Array.from(
    root.querySelectorAll<HTMLElement>(".tf-toast-stack-inner--scroll"),
  );
}

onBeforeUpdate(function () {
  scrollPinState.clear();
  for (const el of collectScrollStacks()) {
    if (!(el.dataset.position ?? "").startsWith("bottom-")) {
      continue;
    }
    scrollPinState.set(
      el,
      el.scrollHeight - el.scrollTop - el.clientHeight < 4,
    );
  }

  for (const el of collectItems()) {
    const parent = el.parentElement;
    if (!parent) {
      continue;
    }
    positionCache.set(el, measurePosition(el, parent));
  }
});

function restorePinnedScrollStacks(): void {
  for (const el of collectScrollStacks()) {
    if (!(el.dataset.position ?? "").startsWith("bottom-")) {
      continue;
    }
    // Stacks not seen before the update just became scrollable — the user
    // cannot have scrolled them away, so they start pinned too.
    if (scrollPinState.get(el) ?? true) {
      el.scrollTop = el.scrollHeight;
    }
  }
  scrollPinState.clear();
}

// Leaving items are pinned in content coordinates, but when the pinned-to-
// newest scroll position jumps (the content shrank by the leaver's slot),
// they would visibly teleport by that delta — shift them back so they stay
// glued to their neighbours while fading out.
function repositionLeaversInScrollStacks(): void {
  for (const stack of collectScrollStacks()) {
    for (const el of Array.from(
      stack.querySelectorAll<HTMLElement>(":scope > .tf-toast-item"),
    )) {
      if (el.style.position !== "absolute") {
        continue;
      }
      const cached = positionCache.get(el);
      if (!cached) {
        continue;
      }
      const dy = cached.viewportTop - el.getBoundingClientRect().top;
      if (Math.abs(dy) < 0.5) {
        continue;
      }
      el.style.top = `${el.offsetTop + dy}px`;
    }
  }
}

function collectMovedItems(): Array<{
  el: HTMLElement;
  dx: number;
  dy: number;
}> {
  const moved: Array<{ el: HTMLElement; dx: number; dy: number }> = [];

  for (const el of collectItems()) {
    // Leaving elements are pinned absolutely by beforeLeave.
    if (el.style.position === "absolute") {
      continue;
    }
    const old = positionCache.get(el);
    if (!old) {
      continue;
    }
    cancelMove(el);
    const rect = el.getBoundingClientRect();
    const dx = old.viewportLeft - rect.left;
    const dy = old.viewportTop - rect.top;
    if (Math.abs(dx) < 0.5 && Math.abs(dy) < 0.5) {
      el.style.transition = "";
      continue;
    }
    el.style.transform = `translate(${dx}px, ${dy}px)`;
    moved.push({ el, dx, dy });
  }

  return moved;
}

function releaseMovedItem(el: HTMLElement): void {
  const moveClass = moveClassFor(el);
  el.style.transition = "";
  el.classList.add(moveClass);
  el.style.transform = "";

  if (!parseFloat(getComputedStyle(el).transitionDuration)) {
    // Transition disabled (e.g. prefers-reduced-motion) — snap.
    el.classList.remove(moveClass);
    return;
  }

  const done = function () {
    el.removeEventListener("transitionend", onEnd);
    el.classList.remove(moveClass);
    moveCleanup.delete(el);
  };
  const onEnd = function (event: TransitionEvent) {
    if (event.target === el && event.propertyName.endsWith("transform")) {
      done();
    }
  };
  el.addEventListener("transitionend", onEnd);
  moveCleanup.set(el, done);
}

onUpdated(function () {
  restorePinnedScrollStacks();
  repositionLeaversInScrollStacks();
  updateStackMetrics();

  const moved = collectMovedItems();
  if (!moved.length) {
    return;
  }

  // Commit the offsets in one reflow, then release them so the move
  // transition animates each element back to its layout position.
  void document.body.offsetHeight;

  for (const { el } of moved) {
    releaseMovedItem(el);
  }
});

const FOCUSABLE_SELECTOR =
  "button, a[href], input, select, textarea, [tabindex]:not([tabindex='-1'])";

// When the dismissed toast holds keyboard focus, hand it to the nearest
// remaining toast instead of letting it fall back to <body>.
function moveFocusToNeighbour(element: HTMLElement, parent: HTMLElement) {
  const active = document.activeElement;
  if (!(active instanceof HTMLElement) || !element.contains(active)) {
    return;
  }

  const siblings = Array.from(
    parent.querySelectorAll<HTMLElement>(".tf-toast-item"),
  ).filter(function (item) {
    return item !== element && item.style.position !== "absolute";
  });

  const following = siblings.filter(function (item) {
    return Boolean(
      element.compareDocumentPosition(item) & Node.DOCUMENT_POSITION_FOLLOWING,
    );
  });
  const preceding = siblings
    .filter(function (item) {
      return !following.includes(item);
    })
    .reverse();

  for (const candidate of [...following, ...preceding]) {
    const focusable = candidate.querySelector<HTMLElement>(FOCUSABLE_SELECTOR);
    if (focusable) {
      focusable.focus({ preventScroll: true });
      return;
    }
  }

  active.blur();
}

function beforeLeave(el: Element) {
  const element = el as HTMLElement;
  const parent = element.parentElement;
  if (!parent || parent.children.length <= 1) {
    return;
  }

  moveFocusToNeighbour(element, parent);

  const cached = positionCache.get(element) ?? measurePosition(element, parent);

  const position = element.dataset.position ?? "";
  // Scroll containers must pin from the top: `bottom` would be resolved
  // against the padding box (clientHeight), not the scrollable extent, and
  // teleport the leaving toast out of the visible scroll window.
  const isBottom =
    !parent.classList.contains("tf-toast-stack-inner--scroll") &&
    (position.startsWith("bottom-") ||
      parent.classList.contains("tf-toast-stack-inner--bottom"));

  const { layoutTop: top, height, parentHeight, parentWidth } = cached;

  // Pin at the layout position (one slot past the visible window when the
  // removal follows an eviction insert) and keep any in-flight move
  // transition running: the leaving toast glides out past the stack edge
  // instead of freezing under the neighbour that shifts into its place.
  element.style.position = "absolute";
  element.style.zIndex = "0";
  element.style.width = `${parentWidth}px`;
  element.style.left = "0";
  element.style.right = "0";

  if (isBottom) {
    const bottom = parentHeight - (top + height);
    element.style.bottom = `${bottom}px`;
    element.style.top = "auto";
  } else {
    element.style.top = `${top}px`;
    element.style.bottom = "auto";
  }
}

function afterLeave(el: Element) {
  const element = el as HTMLElement;

  element.style.position = "";
  element.style.zIndex = "";
  element.style.width = "";
  element.style.left = "";
  element.style.right = "";
  element.style.top = "";
  element.style.bottom = "";
  element.style.transition = "";
  element.style.transform = "";
}

function pruneByToastIds(
  record: Record<ToastId, unknown>,
  ids: Set<ToastId>,
): void {
  for (const key of Object.keys(record)) {
    if (!ids.has(key as ToastId)) {
      delete record[key as ToastId];
    }
  }
}

// Drop per-toast bookkeeping once a toast leaves the state entirely.
watch(
  toasts,
  function (current) {
    const ids = new Set(
      current.map(function (toast) {
        return toast.id;
      }),
    );

    pruneByToastIds(progressResetMap.value, ids);
    pruneByToastIds(duplicateMap.value, ids);
    pruneByToastIds(updateMap.value, ids);
  },
  { deep: false },
);

function animationForToast(toast: ToastInstance): Partial<ToastAnimation> {
  return {
    ...baseConfig.animation,
    ...toast.animation,
  };
}

watch(
  grouped,
  function (byPos) {
    const next = { ...stackConfigs.value };

    (Object.keys(byPos) as ToastPosition[]).forEach(function (position) {
      // The newest toast drives the stack config — render order would pick
      // the oldest for bottom-* stacks, keeping stale per-stack config
      // alive until the old toasts expire.
      let newest: ToastInstance | undefined;
      for (const candidate of byPos[position]) {
        if (!newest || candidate.createdAt > newest.createdAt) {
          newest = candidate;
        }
      }
      if (newest) {
        next[position] = {
          ...baseConfig,
          ...newest,
          position,
          animation: {
            ...baseConfig.animation,
            ...newest.animation,
          },
        };
      }
    });

    stackConfigs.value = next;
  },
  { deep: false },
);
</script>

<template>
  <div ref="rootEl" class="tf-toast-root" :style="{ zIndex: globalZIndex }">
    <div
      v-for="position in positions"
      :key="position"
      class="tf-toast-stack"
      :class="[
        stackAlignClass(position),
        position.startsWith('bottom-') && 'tf-toast-stack--bottom',
      ]"
      :style="stackStyle(position)"
    >
      <TransitionGroup
        appear
        :duration="transitionDurations"
        :name="stackConfig(position).animation.name"
        move-class="tf-toast-move-noop"
        @before-leave="beforeLeave"
        @after-leave="afterLeave"
        tag="div"
        :class="[
          'tf-toast-stack-inner',
          stackAxisClass(position),
          allowOverflowScroll(position) && 'tf-toast-stack-inner--scroll',
        ]"
        :style="stackInnerStyle(position)"
        :data-position="position"
      >
        <div
          v-for="(toast, i) in grouped[position]"
          :key="toast.id"
          class="tf-toast-item"
          :style="itemStyle(toast)"
          :data-position="toast.position"
          :data-id="toast.id"
        >
          <div class="tf-toast-motion" :style="{ '--tf-toast-index': i }">
            <ToastSlotProvider
              v-if="$slots.default"
              :toast="toast"
              :progressResetKey="getProgressResetKey(toast.id)"
              :duplicateKey="getDuplicateKey(toast.id)"
              :updateKey="getUpdateKey(toast.id)"
              :bumpAnimationClass="animationForToast(toast).bump"
              :clearAllAnimationClass="animationForToast(toast).clearAll"
              :updateAnimationClass="animationForToast(toast).update"
            >
              <template #default="slotProps">
                <slot v-bind="slotProps" />
              </template>
            </ToastSlotProvider>

            <Toast
              v-else
              :toast="toast"
              :progressResetKey="getProgressResetKey(toast.id)"
              :duplicateKey="getDuplicateKey(toast.id)"
              :updateKey="getUpdateKey(toast.id)"
              :bumpAnimationClass="animationForToast(toast).bump"
              :clearAllAnimationClass="animationForToast(toast).clearAll"
              :updateAnimationClass="animationForToast(toast).update"
              @dismiss="handleDismiss"
            />
          </div>
        </div>
      </TransitionGroup>
    </div>
  </div>
</template>
