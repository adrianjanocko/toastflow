<script setup lang="ts">
import type { Ref } from "vue";
import {
  computed,
  type CSSProperties,
  inject,
  onUnmounted,
  ref,
  toRefs,
  watch,
} from "vue";
import ToastProgress from "./ToastProgress.vue";
import ToastButtonsGroup from "./ToastButtonsGroup.vue";
import type {
  ToastButton,
  ToastButtonsLayout,
  ToastContext,
  ToastId,
  ToastInstance,
  ToastStandaloneInstance,
  ToastStore,
  ToastType,
} from "toastflow-core";
import { toastStoreKey } from "../symbols";
import { getToastStore } from "../toast";
import CheckCircle from "./icons/CheckCircle.vue";
import XCircle from "./icons/XCircle.vue";
import Bell from "./icons/Bell.vue";
import InfoCircle from "./icons/InfoCircle.vue";
import QuestionMarkCircle from "./icons/QuestionMarkCircle.vue";
import ArrowPath from "./icons/ArrowPath.vue";
import XMark from "./icons/XMark.vue";
import { isNumberFinite } from "toastflow-core/src/util";

const props = defineProps<{
  toast: ToastStandaloneInstance | ToastInstance;
  progressResetKey?: number;
  duplicateKey?: number;
  updateKey?: number;
  bumpAnimationClass?: string;
  clearAllAnimationClass?: string;
  updateAnimationClass?: string;
}>();

const {
  toast: toastProp,
  progressResetKey,
  duplicateKey,
  updateKey,
  bumpAnimationClass,
  clearAllAnimationClass,
  updateAnimationClass,
} = toRefs(props);

const emit = defineEmits<{
  (e: "dismiss", id: ToastId): void;
}>();

const injectedStore = inject<ToastStore | null>(toastStoreKey, null);
const store: ToastStore = injectedStore ?? getToastStore();

const VALID_TOAST_TYPES = new Set<ToastType>([
  "loading",
  "default",
  "success",
  "error",
  "info",
  "warning",
]);

function resolveToastType(value: unknown): ToastType {
  if (typeof value === "string" && VALID_TOAST_TYPES.has(value as ToastType)) {
    return value as ToastType;
  }
  return "default";
}

function defaultCreatedAtFormatter(createdAt: number): string {
  try {
    return new Date(createdAt).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return new Date(createdAt).toISOString();
  }
}

const toast = computed<ToastInstance>(function () {
  const createdAt = isNumberFinite(toastProp.value.createdAt)
    ? toastProp.value.createdAt
    : Date.now();
  const baseConfig = store.getConfig();

  return {
    ...baseConfig,
    ...toastProp.value,
    createdAt,
    id: toastProp.value.id ?? `toast-${createdAt}`,
    type: resolveToastType(toastProp.value.type),
    title: toastProp.value.title ?? "",
    description: toastProp.value.description ?? "",
    progressBar: toastProp.value.progressBar ?? false,
    duration: toastProp.value.duration ?? Infinity,
  } as ToastInstance;
});

const typeMeta: Record<
  ToastType,
  {
    accent: string;
    icon: string;
    close: string;
    component: any;
  }
> = {
  success: {
    accent: "tf-toast-accent--success",
    icon: "tf-toast-icon--success",
    close: "tf-toast-close--success",
    component: CheckCircle,
  },
  error: {
    accent: "tf-toast-accent--error",
    icon: "tf-toast-icon--error",
    close: "tf-toast-close--error",
    component: XCircle,
  },
  warning: {
    accent: "tf-toast-accent--warning",
    icon: "tf-toast-icon--warning",
    close: "tf-toast-close--warning",
    component: Bell,
  },
  info: {
    accent: "tf-toast-accent--info",
    icon: "tf-toast-icon--info",
    close: "tf-toast-close--info",
    component: InfoCircle,
  },
  default: {
    accent: "tf-toast-accent--default",
    icon: "tf-toast-icon--default",
    close: "tf-toast-close--default",
    component: QuestionMarkCircle,
  },
  loading: {
    accent: "tf-toast-accent--loading",
    icon: "tf-toast-icon--loading",
    close: "tf-toast-close--loading",
    component: ArrowPath,
  },
};

const assertiveTypes = new Set<ToastType>(["error", "warning"]);
const SWIPE_START_DISTANCE = 8;
const SWIPE_DISMISS_THRESHOLD_RATIO = 0.35;
const SWIPE_DISMISS_THRESHOLD_MIN = 96;
const SWIPE_SNAP_DURATION = 160;
const SWIPE_DISMISS_DURATION = 140;

const {
  accentClass,
  iconWrapperClass,
  closeWrapperClass,
  defaultIconComponent,
} = useTypeMeta(toast);
const {
  role,
  ariaLive,
  hasCreatedAt,
  createdAtText,
  createdAtAriaLabel,
  titleAriaLabel,
  descriptionAriaLabel,
  toastAriaLabel,
} = useAria(toast);
const { duration, progressStyle, showProgressBar, progressKeyLocal } =
  useProgress(toast, progressResetKey, duplicateKey);
const { isBumped, isUpdated } = useAnimations(duplicateKey, updateKey);
const {
  isHovered,
  handleMouseEnter,
  handleMouseLeave,
  handlePointerDown: handlePausePointerDown,
  handlePointerUp: handlePausePointerUp,
} = useHoverPause(toast, store, duration);
const {
  isSwipeEnabled,
  swipeStyle,
  handlePointerDown: handleSwipePointerDown,
  handlePointerMove: handleSwipePointerMove,
  handlePointerUp: handleSwipePointerUp,
  handlePointerCancel: handleSwipePointerCancel,
  consumeSuppressedClick,
} = useSwipeDismiss(toast, emit);
const { handleClick, handleCloseClick } = useClickHandlers(
  toast,
  emit,
  consumeSuppressedClick,
);
const {
  hasButtons,
  buttons,
  buttonsPlacement,
  buttonsClasses,
  buttonsVarsStyle,
  handleButtonClick,
} = useButtons(toast);

const toastStyle = computed<CSSProperties>(function () {
  return {
    ...buttonsVarsStyle.value,
  };
});

function handlePointerDown(event: PointerEvent) {
  handlePausePointerDown(event);
  handleSwipePointerDown(event);
}

function handlePointerMove(event: PointerEvent) {
  handleSwipePointerMove(event);
}

function handlePointerUp(event: PointerEvent) {
  handleSwipePointerUp(event);
  handlePausePointerUp(event);
}

function handlePointerCancel(event: PointerEvent) {
  handleSwipePointerCancel(event);
  handlePausePointerUp(event);
}

const showMetaLeft = computed(function () {
  return hasButtons.value && buttonsPlacement.value === "left";
});

const showMetaRight = computed(function () {
  return hasButtons.value && buttonsPlacement.value === "right";
});

const showMetaTop = computed(function () {
  return hasButtons.value && buttonsPlacement.value === "top";
});

const showMetaBottom = computed(function () {
  return hasButtons.value && buttonsPlacement.value === "bottom";
});

const hasOutsideButtons = computed(function () {
  return showMetaTop.value || showMetaBottom.value;
});

const showInlineCreatedAt = computed(function () {
  return hasCreatedAt.value && !hasButtons.value;
});

const showFloatingCreatedAt = computed(function () {
  return hasCreatedAt.value && hasButtons.value;
});

function useTypeMeta(toast: Ref<ToastInstance>) {
  const accentClass = computed(function () {
    if (toast.value.theme) {
      return toast.value.theme.startsWith("tf-toast-accent--")
        ? toast.value.theme
        : `tf-toast-accent--${toast.value.theme}`;
    }
    return typeMeta[toast.value.type].accent;
  });

  const iconWrapperClass = computed(function () {
    return typeMeta[toast.value.type].icon;
  });

  const closeWrapperClass = computed(function () {
    return typeMeta[toast.value.type].close;
  });

  const defaultIconComponent = computed(function () {
    return typeMeta[toast.value.type].component;
  });

  return {
    accentClass,
    iconWrapperClass,
    closeWrapperClass,
    defaultIconComponent,
  };
}

function useAria(toast: Ref<ToastInstance>) {
  const role = computed(function () {
    return assertiveTypes.has(toast.value.type) ? "alert" : "status";
  });

  const ariaLive = computed(function () {
    return assertiveTypes.has(toast.value.type) ? "assertive" : "polite";
  });

  const hasCreatedAt = computed(function () {
    return Boolean(
      toast.value.showCreatedAt && isNumberFinite(toast.value.createdAt),
    );
  });

  const createdAtText = computed(function () {
    if (!hasCreatedAt.value) {
      return "";
    }

    const formatter = toast.value.createdAtFormatter;

    if (typeof formatter !== "function") {
      return defaultCreatedAtFormatter(toast.value.createdAt);
    }

    try {
      return formatter(toast.value.createdAt);
    } catch (error) {
      console.error(
        "[vue-toastflow] Something failed in createdAtFormatter",
        error,
      );
    }

    return defaultCreatedAtFormatter(toast.value.createdAt);
  });

  const createdAtAriaLabel = computed(function () {
    if (!createdAtText.value) {
      return "";
    }
    return `Sent at ${createdAtText.value}`;
  });

  const titleAriaLabel = computed(function () {
    return stripHtmlToText(toast.value.title);
  });

  const descriptionAriaLabel = computed(function () {
    return stripHtmlToText(toast.value.description);
  });

  const toastAriaLabel = computed(function () {
    const parts = [];

    if (titleAriaLabel.value) {
      parts.push(titleAriaLabel.value);
    }

    if (descriptionAriaLabel.value) {
      parts.push(descriptionAriaLabel.value);
    }

    if (hasCreatedAt.value && createdAtAriaLabel.value) {
      parts.push(createdAtAriaLabel.value);
    }

    if (!parts.length) {
      parts.push(`${toast.value.type} notification`);
    }

    return parts.join(". ");
  });

  return {
    role,
    ariaLive,
    hasCreatedAt,
    createdAtText,
    createdAtAriaLabel,
    titleAriaLabel,
    descriptionAriaLabel,
    toastAriaLabel,
  };
}

function useProgress(
  toast: Ref<ToastInstance>,
  progressResetKey?: Ref<number | undefined>,
  duplicateKey?: Ref<number | undefined>,
) {
  const duration = computed<number | undefined>(function () {
    if (!isNumberFinite(toast.value.duration)) {
      return undefined;
    }
    return toast.value.duration;
  });

  const progressStyle = computed(function (): CSSProperties {
    if (!duration.value) {
      return {};
    }
    return {
      "--tf-toast-progress-duration": `${duration.value}ms`,
    };
  });

  const showProgressBar = computed(function () {
    return toast.value.progressBar && Boolean(duration.value);
  });

  const progressKeyLocal = ref(0);

  watch(
    () => progressResetKey?.value,
    function (value) {
      if (value == null) {
        return;
      }
      progressKeyLocal.value += 1;
    },
  );

  watch(
    () => duplicateKey?.value,
    function (value) {
      if (value == null) {
        return;
      }
      progressKeyLocal.value += 1;
    },
  );

  return {
    duration,
    progressStyle,
    showProgressBar,
    progressKeyLocal,
  };
}

function useAnimations(
  duplicateKey?: Ref<number | undefined>,
  updateKey?: Ref<number | undefined>,
) {
  const isBumped = ref(false);
  const isUpdated = ref(false);

  function triggerBump() {
    isBumped.value = false;
    requestAnimationFrame(function () {
      isBumped.value = true;
    });
  }

  function triggerUpdate() {
    isUpdated.value = false;
    requestAnimationFrame(function () {
      isUpdated.value = true;
    });
  }

  watch(
    () => duplicateKey?.value,
    function (value) {
      if (value == null) {
        return;
      }
      triggerBump();
    },
  );

  watch(
    () => updateKey?.value,
    function (value) {
      if (value == null) {
        return;
      }
      triggerUpdate();
    },
  );

  return {
    isBumped,
    isUpdated,
  };
}

function useHoverPause(
  toast: Ref<ToastInstance>,
  store: ToastStore,
  duration: Ref<number | undefined>,
) {
  const isHovered = ref(false);

  function handleMouseEnter() {
    if (!canPause()) {
      return;
    }
    pause();
  }

  function handleMouseLeave() {
    if (!canPause()) {
      return;
    }
    resume();
  }

  function handlePointerDown(event: PointerEvent) {
    if (!canPause(event, true)) {
      return;
    }
    pause();
  }

  function handlePointerUp(event: PointerEvent) {
    if (!canPause(event, true)) {
      return;
    }
    resume();
  }

  // -> Helpers
  function canPause(event?: PointerEvent, requireTouch = false) {
    if (!duration.value) {
      return false;
    }
    if (!toast.value.pauseOnHover) {
      return false;
    }
    return !(requireTouch && event && !isTouchLike(event));
  }

  function isTouchLike(event: PointerEvent) {
    return event.pointerType === "touch" || event.pointerType === "pen";
  }

  function pause() {
    isHovered.value = true;
    store.pause(toast.value.id);
  }

  function resume() {
    isHovered.value = false;
    store.resume(toast.value.id);
  }

  return {
    isHovered,
    handleMouseEnter,
    handleMouseLeave,
    handlePointerDown,
    handlePointerUp,
  };
}

function useSwipeDismiss(
  toast: Ref<ToastInstance>,
  emit: (e: "dismiss", id: ToastId) => void,
) {
  const isSwipeEnabled = computed(function () {
    return Boolean(toast.value.swipeToDismiss);
  });
  const swipeOffsetX = ref(0);
  const swipeOpacity = ref(1);
  const isDragging = ref(false);
  const suppressClick = ref(false);
  const activePointerId = ref<number | null>(null);
  const startX = ref(0);
  const startY = ref(0);
  const toastWidth = ref(0);
  const axisLocked = ref(false);
  const blockedByDirection = ref(false);
  const hasMoved = ref(false);

  let dismissTimer: ReturnType<typeof setTimeout> | null = null;

  const swipeStyle = computed<CSSProperties>(function () {
    if (
      !isSwipeEnabled.value &&
      swipeOffsetX.value === 0 &&
      swipeOpacity.value === 1
    ) {
      return {};
    }

    return {
      transform: `translate3d(${swipeOffsetX.value}px, 0, 0)`,
      opacity: swipeOpacity.value,
      transition: isDragging.value
        ? "none"
        : `transform ${SWIPE_SNAP_DURATION}ms ease, opacity ${SWIPE_SNAP_DURATION}ms ease`,
    };
  });

  function clearTimers() {
    if (dismissTimer) {
      clearTimeout(dismissTimer);
      dismissTimer = null;
    }
  }

  function resetPointerState() {
    activePointerId.value = null;
    axisLocked.value = false;
    blockedByDirection.value = false;
    hasMoved.value = false;
    toastWidth.value = 0;
  }

  function restorePosition() {
    isDragging.value = false;

    if (swipeOffsetX.value === 0 && swipeOpacity.value === 1) {
      return;
    }

    swipeOffsetX.value = 0;
    swipeOpacity.value = 1;
  }

  function pointerMatches(event: PointerEvent): boolean {
    return (
      activePointerId.value !== null &&
      activePointerId.value === event.pointerId
    );
  }

  function releaseCapture(event: PointerEvent) {
    const element = event.currentTarget as HTMLElement | null;
    if (!element?.releasePointerCapture) {
      return;
    }

    try {
      element.releasePointerCapture(event.pointerId);
    } catch {}
  }

  function shouldStart(event: PointerEvent): boolean {
    if (!isSwipeEnabled.value) {
      return false;
    }
    if (event.button !== undefined && event.button !== 0) {
      return false;
    }
    return !isInteractiveTarget(event.target);
  }

  function handlePointerDown(event: PointerEvent) {
    if (!shouldStart(event)) {
      return;
    }

    clearTimers();
    suppressClick.value = false;
    isDragging.value = false;
    activePointerId.value = event.pointerId;
    startX.value = event.clientX;
    startY.value = event.clientY;

    const element = event.currentTarget as HTMLElement | null;
    toastWidth.value = element?.getBoundingClientRect().width ?? 0;

    if (element?.setPointerCapture) {
      try {
        element.setPointerCapture(event.pointerId);
      } catch {}
    }
  }

  function handlePointerMove(event: PointerEvent) {
    if (!pointerMatches(event) || blockedByDirection.value) {
      return;
    }

    const deltaX = event.clientX - startX.value;
    const deltaY = event.clientY - startY.value;
    const absX = Math.abs(deltaX);
    const absY = Math.abs(deltaY);

    if (!axisLocked.value) {
      if (absX < SWIPE_START_DISTANCE && absY < SWIPE_START_DISTANCE) {
        return;
      }

      if (deltaX <= 0 || absY > absX) {
        blockedByDirection.value = true;
        restorePosition();
        return;
      }

      axisLocked.value = true;
    }

    event.preventDefault();
    isDragging.value = true;
    hasMoved.value = true;

    const nextOffset = Math.max(0, deltaX);
    const width = toastWidth.value > 0 ? toastWidth.value : 1;
    const progress = Math.min(nextOffset / width, 1);

    swipeOffsetX.value = nextOffset;
    swipeOpacity.value = Math.max(1 - progress * 0.85, 0.15);
  }

  function handlePointerUp(event: PointerEvent) {
    if (!pointerMatches(event)) {
      return;
    }

    releaseCapture(event);

    if (!axisLocked.value || blockedByDirection.value || !hasMoved.value) {
      restorePosition();
      resetPointerState();
      return;
    }

    const width = toastWidth.value > 0 ? toastWidth.value : 1;
    const threshold = Math.max(
      width * SWIPE_DISMISS_THRESHOLD_RATIO,
      SWIPE_DISMISS_THRESHOLD_MIN,
    );

    if (swipeOffsetX.value >= threshold) {
      isDragging.value = false;
      suppressClick.value = true;
      swipeOffsetX.value = width + 24;
      swipeOpacity.value = 0;

      dismissTimer = setTimeout(function () {
        emit("dismiss", toast.value.id);
        dismissTimer = null;
      }, SWIPE_DISMISS_DURATION);
    } else {
      if (swipeOffsetX.value > SWIPE_START_DISTANCE) {
        suppressClick.value = true;
      }
      restorePosition();
    }

    resetPointerState();
  }

  function handlePointerCancel(event: PointerEvent) {
    if (!pointerMatches(event)) {
      return;
    }

    releaseCapture(event);
    restorePosition();
    resetPointerState();
  }

  function consumeSuppressedClick(): boolean {
    if (!suppressClick.value) {
      return false;
    }

    suppressClick.value = false;
    return true;
  }

  watch(isSwipeEnabled, function (enabled) {
    if (enabled) {
      return;
    }

    clearTimers();
    restorePosition();
    resetPointerState();
  });

  onUnmounted(function () {
    clearTimers();
  });

  return {
    isSwipeEnabled,
    swipeStyle,
    handlePointerDown,
    handlePointerMove,
    handlePointerUp,
    handlePointerCancel,
    consumeSuppressedClick,
  };
}

function useClickHandlers(
  toast: Ref<ToastInstance>,
  emit: (e: "dismiss", id: ToastId) => void,
  shouldIgnoreClick?: () => boolean,
) {
  function handleClick(event: MouseEvent) {
    if (shouldIgnoreClick && shouldIgnoreClick()) {
      return;
    }

    const context = toToastContext(toast.value);

    if (toast.value.onClick) {
      toast.value.onClick(context, event);
    }

    if (toast.value.closeOnClick) {
      handleCloseClick();
    }
  }

  function handleCloseClick() {
    emit("dismiss", toast.value.id);
  }

  return {
    handleClick,
    handleCloseClick,
  };
}

function useButtons(toast: Ref<ToastInstance>) {
  const buttons = computed<ToastButton[]>(function () {
    return toast.value.buttons?.buttons ?? [];
  });

  const buttonsLayout = computed<ToastButtonsLayout>(function () {
    return toast.value.buttons?.layout ?? "row";
  });

  const buttonsAlignment = computed<string>(function () {
    const alignment = toast.value.buttons?.alignment ?? "bottom-right";

    if (toast.value.alignment !== "right") {
      return alignment;
    }

    if (alignment.endsWith("-left")) {
      return alignment.replace(/-left$/, "-right");
    }

    if (alignment.endsWith("-right")) {
      return alignment.replace(/-right$/, "-left");
    }

    return alignment;
  });

  const hasButtons = computed(function () {
    return buttons.value.length > 0;
  });

  type ButtonsSide = "left" | "right";
  type ButtonsVertical = "top" | "center" | "bottom";
  type ButtonsPlacement = "left" | "right" | "top" | "bottom";

  const buttonsSide = computed<ButtonsSide>(function () {
    const alignment = buttonsAlignment.value;
    if (alignment.endsWith("-left")) {
      return "left";
    }
    return "right";
  });

  const buttonsVertical = computed<ButtonsVertical>(function () {
    const alignment = buttonsAlignment.value;
    if (alignment.startsWith("top-")) {
      return "top";
    }
    if (alignment.startsWith("bottom-")) {
      return "bottom";
    }
    return "center";
  });

  const buttonsPlacement = computed<ButtonsPlacement>(function () {
    if (buttonsLayout.value === "row") {
      return buttonsSide.value;
    }

    const vertical = buttonsVertical.value;
    if (vertical === "top") {
      return "top";
    }
    if (vertical === "bottom") {
      return "bottom";
    }
    return buttonsSide.value;
  });

  const isSidePlacement = computed(function () {
    return (
      buttonsPlacement.value === "left" || buttonsPlacement.value === "right"
    );
  });

  const buttonsJustifyClass = computed(function () {
    if (buttonsSide.value === "left") {
      return "tf-toast-actions--start";
    }
    return "tf-toast-actions--end";
  });

  const buttonsVarsStyle = computed<CSSProperties>(function () {
    return {
      "--tf-toast-buttons-gap": toast.value.buttons?.gap,
      "--tf-toast-buttons-content-gap": toast.value.buttons?.contentGap,
    } as CSSProperties;
  });

  const buttonsVerticalClass = computed(function () {
    if (!isSidePlacement.value) {
      return undefined;
    }

    const vertical = buttonsVertical.value;
    if (vertical === "bottom") {
      return "tf-toast-buttons--bottom";
    }
    if (vertical === "center") {
      return "tf-toast-buttons--center";
    }
    return undefined;
  });

  const buttonsClasses = computed(function () {
    return [
      "tf-toast-actions",
      buttonsJustifyClass.value,
      buttonsVerticalClass.value,
    ];
  });

  function handleButtonClick(button: ToastButton, event: MouseEvent) {
    const context = toToastContext(toast.value);

    if (button.onClick) {
      button.onClick(context, event);
    }
  }

  return {
    hasButtons,
    buttons,
    buttonsPlacement,
    buttonsClasses,
    buttonsVarsStyle,
    handleButtonClick,
  };
}

// -> Helpers

function isInteractiveTarget(target: EventTarget | null): boolean {
  if (!(target instanceof Element)) {
    return false;
  }

  return Boolean(
    target.closest(
      "button, a, input, textarea, select, option, [role='button'], [contenteditable='true']",
    ),
  );
}

function toToastContext(toast: ToastInstance): ToastContext {
  return {
    id: toast.id,
    position: toast.position,
    type: toast.type,
    title: toast.title,
    description: toast.description,
    createdAt: toast.createdAt,
  };
}

function normalizeWhitespace(value: string): string {
  return value.replace(/\s+/g, " ").trim();
}

function stripHtmlToText(value: string): string {
  if (!value) {
    return "";
  }

  const fallback = normalizeWhitespace(value.replace(/<[^>]*>/g, " "));

  if (typeof window === "undefined" || !window.document) {
    return fallback;
  }

  try {
    const container = window.document.createElement("div");
    container.innerHTML = value;
    return normalizeWhitespace(container.textContent ?? "");
  } catch (error) {
    return fallback;
  }
}
</script>

<template>
  <div
    :role="role"
    :aria-live="ariaLive"
    class="tf-toast-wrapper"
    :style="swipeStyle"
  >
    <div
      class="tf-toast"
      :aria-label="toastAriaLabel || undefined"
      :class="[
        accentClass,
        isBumped &&
          toast.phase !== 'leaving' &&
          toast.phase !== 'clear-all' &&
          bumpAnimationClass,
        isUpdated &&
          toast.phase !== 'leaving' &&
          toast.phase !== 'clear-all' &&
          updateAnimationClass,
        toast.phase === 'clear-all' && clearAllAnimationClass,
        isHovered && 'tf-toast--paused',
        isSwipeEnabled && 'tf-toast--swipe-enabled',
      ]"
      :data-align="toast.alignment"
      :style="toastStyle"
      @click="handleClick"
      @mouseenter="handleMouseEnter"
      @mouseleave="handleMouseLeave"
      @pointerdown="handlePointerDown"
      @pointermove="handlePointerMove"
      @pointerup="handlePointerUp"
      @pointercancel="handlePointerCancel"
    >
      <div class="tf-toast-surface">
        <div
          v-if="showMetaTop"
          class="tf-toast-meta-row tf-toast-meta-row--top"
        >
          <ToastButtonsGroup
            :buttons="buttons"
            :classes="buttonsClasses"
            :on-button-click="handleButtonClick"
          />
        </div>

        <!-- main row -->
        <div
          class="tf-toast-main"
          :class="[
            hasOutsideButtons && 'tf-toast-main--full',
            showMetaLeft && 'tf-toast-main--content-end',
          ]"
        >
          <div v-if="showMetaLeft" class="tf-toast-meta tf-toast-meta--left">
            <ToastButtonsGroup
              :buttons="buttons"
              :classes="buttonsClasses"
              :on-button-click="handleButtonClick"
            />
          </div>

          <div class="tf-toast-main-content">
            <!-- icon (slot + lucide defaults) -->
            <div
              class="tf-toast-icon"
              :class="iconWrapperClass"
              aria-hidden="true"
            >
              <slot name="icon" :toast="toast">
                <component
                  :is="defaultIconComponent"
                  class="tf-toast-icon-svg"
                  :class="[toast.type === 'loading' && 'tf-toast-icon-spin']"
                  aria-hidden="true"
                />
              </slot>
            </div>

            <!-- content -->
            <div
              class="tf-toast-body"
              :class="[showInlineCreatedAt && 'tf-toast-body--has-created-at']"
            >
              <div class="tf-toast-text">
                <p
                  v-if="toast.title && !toast.supportHtml"
                  :aria-label="titleAriaLabel || undefined"
                  class="tf-toast-title"
                >
                  {{ toast.title }}
                </p>
                <p
                  v-else-if="toast.title && toast.supportHtml"
                  class="tf-toast-title"
                  :aria-label="titleAriaLabel || undefined"
                  v-html="toast.title"
                ></p>

                <p
                  v-if="toast.description && !toast.supportHtml"
                  :aria-label="descriptionAriaLabel || undefined"
                  class="tf-toast-description"
                >
                  {{ toast.description }}
                </p>
                <p
                  v-else-if="toast.description && toast.supportHtml"
                  class="tf-toast-description"
                  :aria-label="descriptionAriaLabel || undefined"
                  v-html="toast.description"
                ></p>
              </div>

              <slot :toast="toast" />

              <div v-if="showInlineCreatedAt" class="tf-toast-created-at">
                <slot
                  name="created-at"
                  :toast="toast"
                  :formatted="createdAtText"
                >
                  <span :aria-label="createdAtAriaLabel || undefined">
                    {{ createdAtText }}
                  </span>
                </slot>
              </div>
            </div>
          </div>

          <div v-if="showMetaRight" class="tf-toast-meta tf-toast-meta--right">
            <ToastButtonsGroup
              :buttons="buttons"
              :classes="buttonsClasses"
              :on-button-click="handleButtonClick"
            />
          </div>
        </div>

        <div
          v-if="showMetaBottom"
          class="tf-toast-meta-row tf-toast-meta-row--bottom"
        >
          <ToastButtonsGroup
            :buttons="buttons"
            :classes="buttonsClasses"
            :on-button-click="handleButtonClick"
          />
        </div>

        <!-- bottom progress -->
        <div
          v-if="showProgressBar"
          class="tf-toast-progress-wrapper"
          :style="progressStyle"
        >
          <slot name="progress" :toast="toast">
            <ToastProgress
              :key="progressKeyLocal"
              :type="toast.type"
              :progress-alignment="toast.progressAlignment"
            />
          </slot>
        </div>
      </div>

      <div
        v-if="showFloatingCreatedAt || toast.closeButton"
        class="tf-toast-floating-bar"
      >
        <div v-if="showFloatingCreatedAt" class="tf-toast-created-at-float">
          <slot name="created-at" :toast="toast" :formatted="createdAtText">
            <span :aria-label="createdAtAriaLabel || undefined">
              {{ createdAtText }}
            </span>
          </slot>
        </div>

        <!-- close button floating top-right -->
        <button
          v-if="toast.closeButton"
          type="button"
          class="tf-toast-close"
          :class="closeWrapperClass"
          aria-label="Close notification"
          @click.stop="handleCloseClick"
        >
          <slot name="close-icon" :toast="toast">
            <XMark class="tf-toast-close-icon" aria-hidden="true" />
          </slot>
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* wrappers */
.tf-toast-wrapper {
  pointer-events: auto;
  width: 100%;
}

.tf-toast {
  cursor: pointer;
  position: relative;
  width: 100%;
  --tf-toast-button-color: var(--tf-toast-color);
  --tf-toast-button-border-color: var(--tf-toast-border-color);
  --tf-toast-button-border-width: var(--tf-toast-border-width);
  --tf-toast-button-bg: var(--tf-toast-bg);
  --tf-toast-close-color: var(--tf-toast-color);
  --tf-toast-close-border-color: var(--tf-toast-border-color);
  --tf-toast-close-bg: var(--tf-toast-bg);
  --tf-toast-close-ring-color: var(--tf-toast-close-border-color);
  --tf-toast-created-at-color: var(--tf-toast-description-color);
  --tf-toast-created-at-border-color: var(--tf-toast-border-color);
  --tf-toast-created-at-bg: var(--tf-toast-bg);
}

.tf-toast--swipe-enabled {
  touch-action: pan-y;
  -webkit-user-select: none;
  user-select: none;
  cursor: grab;
}

.tf-toast--swipe-enabled:active {
  cursor: grabbing;
}

.tf-toast[data-align="right"] .tf-toast-main-content {
  flex-direction: row-reverse;
}

.tf-toast[data-align="right"] .tf-toast-text {
  text-align: right;
}

/* accent themes */
.tf-toast-accent--default {
  --tf-toast-color: var(--tf-toast-normal-color-default);
  --tf-toast-bg: var(--tf-toast-normal-bg-default);
  --tf-toast-border-color: var(--tf-toast-normal-border-default);
  --tf-toast-title-color: var(--tf-toast-normal-title-color-default);
  --tf-toast-description-color: var(
    --tf-toast-normal-description-color-default
  );
  --tf-toast-progress-bg: var(--tf-toast-normal-progress-bg-default);
  --tf-toast-progress-bar-bg: var(--tf-toast-normal-progress-bar-bg-default);
}

.tf-toast-accent--loading {
  --tf-toast-color: var(--tf-toast-loading-color-default);
  --tf-toast-bg: var(--tf-toast-loading-bg-default);
  --tf-toast-border-color: var(--tf-toast-loading-border-default);
  --tf-toast-title-color: var(--tf-toast-loading-title-color-default);
  --tf-toast-description-color: var(
    --tf-toast-loading-description-color-default
  );
  --tf-toast-progress-bg: var(--tf-toast-loading-progress-bg-default);
  --tf-toast-progress-bar-bg: var(--tf-toast-loading-progress-bar-bg-default);
}

.tf-toast-accent--success {
  --tf-toast-color: var(--tf-toast-success-color-default);
  --tf-toast-bg: var(--tf-toast-success-bg-default);
  --tf-toast-border-color: var(--tf-toast-success-border-default);
  --tf-toast-title-color: var(--tf-toast-success-title-color-default);
  --tf-toast-description-color: var(
    --tf-toast-success-description-color-default
  );
  --tf-toast-progress-bg: var(--tf-toast-success-progress-bg-default);
  --tf-toast-progress-bar-bg: var(--tf-toast-success-progress-bar-bg-default);
}

.tf-toast-accent--error {
  --tf-toast-color: var(--tf-toast-error-color-default);
  --tf-toast-bg: var(--tf-toast-error-bg-default);
  --tf-toast-border-color: var(--tf-toast-error-border-default);
  --tf-toast-title-color: var(--tf-toast-error-title-color-default);
  --tf-toast-description-color: var(--tf-toast-error-description-color-default);
  --tf-toast-progress-bg: var(--tf-toast-error-progress-bg-default);
  --tf-toast-progress-bar-bg: var(--tf-toast-error-progress-bar-bg-default);
}

.tf-toast-accent--warning {
  --tf-toast-color: var(--tf-toast-warning-color-default);
  --tf-toast-bg: var(--tf-toast-warning-bg-default);
  --tf-toast-border-color: var(--tf-toast-warning-border-default);
  --tf-toast-title-color: var(--tf-toast-warning-title-color-default);
  --tf-toast-description-color: var(
    --tf-toast-warning-description-color-default
  );
  --tf-toast-progress-bg: var(--tf-toast-warning-progress-bg-default);
  --tf-toast-progress-bar-bg: var(--tf-toast-warning-progress-bar-bg-default);
}

.tf-toast-accent--info {
  --tf-toast-color: var(--tf-toast-info-color-default);
  --tf-toast-bg: var(--tf-toast-info-bg-default);
  --tf-toast-border-color: var(--tf-toast-info-border-default);
  --tf-toast-title-color: var(--tf-toast-info-title-color-default);
  --tf-toast-description-color: var(--tf-toast-info-description-color-default);
  --tf-toast-progress-bg: var(--tf-toast-info-progress-bg-default);
  --tf-toast-progress-bar-bg: var(--tf-toast-info-progress-bar-bg-default);
}

/* layout + card */
.tf-toast-surface {
  position: relative;
  display: block;
  min-width: 0;
  padding: var(--tf-toast-padding);
  border-radius: var(--tf-toast-border-radius);
  background-color: var(--tf-toast-bg);
  color: var(--tf-toast-color);
  border: var(--tf-toast-border-width) solid var(--tf-toast-border-color);
  font-family: var(--tf-toast-font-family), sans-serif;
  overflow: hidden;
}

.tf-toast-main {
  display: flex;
  align-items: stretch;
  gap: var(--tf-toast-buttons-content-gap);
  width: 100%;
}

.tf-toast-main--full > .tf-toast-main-content {
  width: 100%;
  min-width: 0;
  flex: 1 1 100%;
}

.tf-toast-main--content-end > .tf-toast-main-content {
  margin-left: auto;
  max-width: 100%;
  flex: 0 1 auto;
}

.tf-toast-main--content-end > .tf-toast-main-content > .tf-toast-body {
  flex: 0 1 auto;
  min-width: 0;
}

.tf-toast-main-content {
  display: flex;
  align-items: center;
  gap: var(--tf-toast-gap);
  min-width: 0;
  flex: 1 1 auto;
}

.tf-toast-meta {
  display: flex;
  flex-direction: column;
  gap: calc(var(--tf-toast-gap) / 2);
  min-width: 0;
  flex-shrink: 0;
}

.tf-toast-meta--left {
  align-items: flex-start;
}

.tf-toast-meta--right {
  align-items: flex-end;
}

.tf-toast-meta-row {
  display: flex;
  min-width: 0;
}

.tf-toast-meta-row--top {
  margin-bottom: var(--tf-toast-buttons-content-gap);
}

.tf-toast-meta-row--bottom {
  margin-top: var(--tf-toast-buttons-content-gap);
}

.tf-toast-meta-row :deep(.tf-toast-actions--start) {
  margin-right: auto;
}

.tf-toast-meta-row :deep(.tf-toast-actions--end) {
  margin-left: auto;
}

/* actions */
:deep(.tf-toast-actions) {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  gap: var(--tf-toast-buttons-gap);
}

:deep(.tf-toast-buttons--center) {
  margin-top: auto;
  margin-bottom: auto;
}

:deep(.tf-toast-buttons--bottom) {
  margin-top: auto;
}

:deep(.tf-toast-actions--start) {
  justify-content: flex-start;
}

:deep(.tf-toast-actions--end) {
  justify-content: flex-end;
}

:deep(.tf-toast-button) {
  appearance: none;
  border: var(--tf-toast-button-border-width) solid
    var(--tf-toast-button-border-color);
  background: var(--tf-toast-button-bg);
  color: var(--tf-toast-button-color);
  border-radius: var(--tf-toast-button-border-radius);
  font-size: var(--tf-toast-button-font-size);
  line-height: var(--tf-toast-button-line-height);
  padding: var(--tf-toast-button-padding-y) var(--tf-toast-button-padding-x);
  cursor: pointer;
  user-select: none;
  font-family: inherit;
}

/* icon */
.tf-toast-icon-spin {
  display: inline-block;
  animation: tf-toast-spin 0.8s linear infinite;
  transform-origin: center;
}

@keyframes tf-toast-spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.tf-toast-icon-svg {
  width: var(--tf-toast-icon-size);
  height: var(--tf-toast-icon-size);
}

/* per-type icon color */
.tf-toast-icon--loading .tf-toast-icon-svg {
  color: var(--tf-toast-icon-loading);
}

.tf-toast-icon--default .tf-toast-icon-svg {
  color: var(--tf-toast-icon-default);
}

.tf-toast-icon--success .tf-toast-icon-svg {
  color: var(--tf-toast-icon-success);
}

.tf-toast-icon--error .tf-toast-icon-svg {
  color: var(--tf-toast-icon-error);
}

.tf-toast-icon--warning .tf-toast-icon-svg {
  color: var(--tf-toast-icon-warning);
}

.tf-toast-icon--info .tf-toast-icon-svg {
  color: var(--tf-toast-icon-info);
}

/* body */
.tf-toast-body {
  position: relative;
  z-index: 1;
  min-width: 0;
  flex: 1 1 auto;
  display: flex;
  flex-direction: column;
}

.tf-toast-body--has-created-at {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  column-gap: calc(var(--tf-toast-gap) / 2);
  grid-auto-flow: row;
}

.tf-toast-body--has-created-at > :not(.tf-toast-created-at) {
  grid-column: 1;
}

.tf-toast-text {
  min-width: 0;
}

.tf-toast-created-at {
  color: var(--tf-toast-created-at-color);
  font-size: var(--tf-toast-created-at-font-size);
  font-style: italic;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  align-self: end;
  justify-self: end;
  grid-column: 2;
  grid-row: 1;
}

.tf-toast[data-align="right"] .tf-toast-created-at {
  text-align: right;
  width: 100%;
  display: flex;
  justify-content: flex-end;
}

.tf-toast[data-align="right"] .tf-toast-body--has-created-at {
  grid-template-columns: auto minmax(0, 1fr);
}

.tf-toast[data-align="right"]
  .tf-toast-body--has-created-at
  > .tf-toast-created-at {
  grid-column: 1;
  justify-self: start;
}

.tf-toast[data-align="right"]
  .tf-toast-body--has-created-at
  > :not(.tf-toast-created-at) {
  grid-column: 2;
}

.tf-toast-floating-bar {
  position: absolute;
  top: 0;
  right: 0;
  transform: translate(
    calc(var(--tf-toast-close-size) * var(--tf-toast-float-x)),
    calc(var(--tf-toast-close-size) * var(--tf-toast-float-y))
  );
  display: inline-flex;
  align-items: center;
  gap: var(--tf-toast-created-at-offset);
  height: var(--tf-toast-close-size);
  pointer-events: auto;
  z-index: 2;
}

.tf-toast-created-at-float {
  display: inline-flex;
  align-items: center;
  height: var(--tf-toast-close-size);
  padding: 0 var(--tf-toast-created-at-padding-x);
  border-radius: var(--tf-toast-created-at-border-radius);
  border: var(--tf-toast-close-border-width) solid
    var(--tf-toast-created-at-border-color);
  background: var(--tf-toast-created-at-bg);
  color: var(--tf-toast-created-at-color);
  font-size: var(--tf-toast-created-at-font-size);
  font-style: italic;
  white-space: nowrap;
  pointer-events: none;
}

.tf-toast-title {
  margin: 0;
  font-size: var(--tf-toast-title-font-size);
  font-weight: var(--tf-toast-title-font-weight);
  line-height: var(--tf-toast-title-line-height);
  color: var(--tf-toast-title-color);
  word-wrap: break-word;
}

.tf-toast-description {
  margin: 0;
  font-size: var(--tf-toast-description-font-size);
  line-height: var(--tf-toast-description-line-height);
  color: var(--tf-toast-description-color);
  word-wrap: break-word;
}

/* floating close button */
.tf-toast-close {
  position: relative;
  height: var(--tf-toast-close-size);
  width: var(--tf-toast-close-size);
  border-radius: var(--tf-toast-close-border-radius);
  border: var(--tf-toast-close-border-width) solid
    var(--tf-toast-close-border-color);
  background: var(--tf-toast-close-bg);
  color: var(--tf-toast-close-color);
  font-size: var(--tf-toast-close-font-size);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  cursor: pointer;
  flex-shrink: 0;
  pointer-events: auto;
  z-index: 2;
}

.tf-toast-close-icon {
  width: var(--tf-toast-close-icon-size);
  height: var(--tf-toast-close-icon-size);
}

.tf-toast-close:focus-visible {
  outline: 2px solid var(--tf-toast-close-ring-color);
  outline-offset: 2px;
}

/* bottom progress wrapper */
.tf-toast-progress-wrapper {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  margin: 0;
}
</style>
