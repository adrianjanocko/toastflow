<script setup lang="ts">
import type { Ref } from "vue";
import { computed, type CSSProperties, inject, ref, toRefs, watch } from "vue";
import ToastProgress from "./ToastProgress.vue";
import type {
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

const toast = computed<ToastInstance>(function () {
  const createdAt = Number.isFinite(toastProp.value.createdAt)
    ? toastProp.value.createdAt
    : Date.now();
  const baseConfig = store.getConfig();

  return {
    ...baseConfig,
    ...toastProp.value,
    createdAt,
    id: toastProp.value.id ?? `toast-${createdAt}`,
    type: toastProp.value.type ?? "default",
    title: toastProp.value.title,
    description: toastProp.value.description,
    progressBar: toastProp.value.progressBar ?? false,
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
  handlePointerDown,
  handlePointerUp,
} = useHoverPause(toast, store);
const { handleClick, handleCloseClick } = useClickHandlers(toast, emit);

function useTypeMeta(toast: Ref<ToastInstance>) {
  const accentClass = computed(function () {
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
      toast.value.showCreatedAt && Number.isFinite(toast.value.createdAt),
    );
  });

  const createdAtText = computed(function () {
    if (!hasCreatedAt.value) {
      return "";
    }

    try {
      return toast.value.createdAtFormatter(toast.value.createdAt);
    } catch (error) {
      console.error(
        "[vue-toastflow] Something failed in createdAtFormatter",
        error,
      );
    }
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

function useHoverPause(toast: Ref<ToastInstance>, store: ToastStore) {
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

  /* HELPERS */
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

function useClickHandlers(
  toast: Ref<ToastInstance>,
  emit: (e: "dismiss", id: ToastId) => void,
) {
  function createContext(): ToastContext {
    return {
      id: toast.value.id,
      position: toast.value.position,
      type: toast.value.type,
      title: toast.value.title,
      description: toast.value.description,
      createdAt: toast.value.createdAt,
    };
  }

  function handleClick(event: MouseEvent) {
    const context = createContext();

    if (toast.value.onClick) {
      toast.value.onClick(context, event);
    }

    if (toast.value.closeOnClick) {
      emit("dismiss", toast.value.id);
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

// -> Helpers

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
  <div :role="role" :aria-live="ariaLive" class="tf-toast-wrapper">
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
      ]"
      @click="handleClick"
      @mouseenter="handleMouseEnter"
      @mouseleave="handleMouseLeave"
      @pointerdown="handlePointerDown"
      @pointerup="handlePointerUp"
      @pointercancel="handlePointerUp"
    >
      <div class="tf-toast-surface">
        <!-- main row -->
        <div class="tf-toast-main">
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
            :class="[hasCreatedAt && 'tf-toast-body--has-created-at']"
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

            <div v-if="hasCreatedAt" class="tf-toast-created-at">
              <slot name="created-at" :toast="toast" :formatted="createdAtText">
                <span :aria-label="createdAtAriaLabel || undefined">
                  {{ createdAtText }}
                </span>
              </slot>
            </div>
          </div>
        </div>

        <!-- bottom progress -->
        <div
          v-if="showProgressBar"
          class="tf-toast-progress-wrapper"
          :style="progressStyle"
        >
          <slot name="progress" :toast="toast">
            <ToastProgress :key="progressKeyLocal" :type="toast.type" />
          </slot>
        </div>
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
</template>

<style scoped>
.tf-toast-wrapper {
  pointer-events: auto;
  width: 100%;
}

.tf-toast {
  cursor: pointer;
  position: relative;
  width: 100%;
  --tf-toast-close-bg: var(--tf-toast-bg);
  --tf-toast-close-color: var(--tf-toast-color);
  --tf-toast-close-border-color: var(--tf-toast-border-color);
}

.tf-toast-accent--loading {
  --tf-toast-bg: var(--loading-bg);
  --tf-toast-border-color: var(--loading-border);
  --tf-toast-color: var(--loading-text);
  --tf-toast-description-color: var(--loading-text);
  --tf-toast-progress-bg: color-mix(
    in srgb,
    var(--loading-text) 20%,
    transparent
  );
}

.tf-toast-accent--default {
  --tf-toast-bg: var(--normal-bg);
  --tf-toast-border-color: var(--normal-border);
  --tf-toast-color: var(--normal-text);
  --tf-toast-description-color: var(--normal-text);
  --tf-toast-progress-bg: color-mix(
    in srgb,
    var(--normal-text) 20%,
    transparent
  );
}

.tf-toast-accent--success {
  --tf-toast-bg: var(--success-bg);
  --tf-toast-border-color: var(--success-border);
  --tf-toast-color: var(--success-text);
  --tf-toast-description-color: var(--success-text);
  --tf-toast-progress-bg: color-mix(
    in srgb,
    var(--success-text) 20%,
    transparent
  );
}

.tf-toast-accent--error {
  --tf-toast-bg: var(--error-bg);
  --tf-toast-border-color: var(--error-border);
  --tf-toast-color: var(--error-text);
  --tf-toast-description-color: var(--error-text);
  --tf-toast-progress-bg: color-mix(
    in srgb,
    var(--error-text) 20%,
    transparent
  );
}

.tf-toast-accent--warning {
  --tf-toast-bg: var(--warning-bg);
  --tf-toast-border-color: var(--warning-border);
  --tf-toast-color: var(--warning-text);
  --tf-toast-description-color: var(--warning-text);
  --tf-toast-progress-bg: color-mix(
    in srgb,
    var(--warning-text) 20%,
    transparent
  );
}

.tf-toast-accent--info {
  --tf-toast-bg: var(--info-bg);
  --tf-toast-border-color: var(--info-border);
  --tf-toast-color: var(--info-text);
  --tf-toast-description-color: var(--info-text);
  --tf-toast-progress-bg: color-mix(in srgb, var(--info-text) 20%, transparent);
}

/* card */

.tf-toast-surface {
  position: relative;
  display: block;
  min-width: 0;
  padding: var(--tf-toast-padding);
  border-radius: var(--tf-toast-radius);
  background-color: var(--tf-toast-bg);
  color: var(--tf-toast-color);
  border: 1px solid var(--tf-toast-border-color);
  font-family: var(--tf-toast-font-family);
  overflow: hidden;
}

.tf-toast-main {
  display: flex;
  align-items: center;
  gap: var(--tf-toast-gap);
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
  color: var(--tf-toast-description-color);
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

.tf-toast-title {
  margin: 0;
  font-size: var(--tf-toast-title-font-size);
  font-weight: var(--tf-toast-title-font-weight);
  line-height: 1.25;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
}

.tf-toast-description {
  margin: 0;
  font-size: var(--tf-toast-description-font-size);
  color: var(--tf-toast-description-color);
}

/* floating close button */

.tf-toast-close {
  position: absolute;
  top: 0;
  right: 0;
  transform: translate(40%, -40%);
  height: var(--tf-toast-close-size);
  width: var(--tf-toast-close-size);
  border-radius: 999px;
  border: 1px solid var(--tf-toast-close-border-color);
  background: var(--tf-toast-close-bg);
  color: var(--tf-toast-close-color);
  font-size: 11px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  cursor: pointer;
  z-index: 2;
}

.tf-toast-close-icon {
  width: 12px;
  height: 12px;
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
