<script setup lang="ts">
import { computed, type CSSProperties, inject, ref, watch } from "vue";
import ToastProgress from "./ToastProgress.vue";
import type {
  ToastContext,
  ToastId,
  ToastInstance,
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

const {
  toast,
  progressResetKey,
  duplicateKey,
  updateKey,
  bumpAnimationClass,
  clearAllAnimationClass,
  updateAnimationClass,
} = defineProps<{
  toast: ToastInstance;
  progressResetKey?: number;
  duplicateKey?: number;
  updateKey?: number;
  bumpAnimationClass?: string;
  clearAllAnimationClass?: string;
  updateAnimationClass?: string;
}>();

const emit = defineEmits<{
  (e: "dismiss", id: ToastId): void;
}>();

const injectedStore = inject<ToastStore | null>(toastStoreKey, null);
const store: ToastStore = injectedStore ?? getToastStore();

const isHovered = ref(false);
const isBumped = ref(false);
const isUpdated = ref(false);

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

const role = computed(function () {
  return assertiveTypes.has(toast.type) ? "alert" : "status";
});

const ariaLive = computed(function () {
  return assertiveTypes.has(toast.type) ? "assertive" : "polite";
});

const accentClass = computed(function () {
  return typeMeta[toast.type].accent;
});

const iconWrapperClass = computed(function () {
  return typeMeta[toast.type].icon;
});

const closeWrapperClass = computed(function () {
  return typeMeta[toast.type].close;
});

const defaultIconComponent = computed(function () {
  return typeMeta[toast.type].component;
});

const assertiveTypes = new Set<ToastType>(["error", "warning"]);

const progressStyle = computed(function (): CSSProperties {
  return {
    "--tf-toast-progress-duration": `${toast.duration}ms`,
  };
});

const defaultCreatedAtFormatter = function (createdAt: number): string {
  return new Date(createdAt).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
};

const hasCreatedAt = computed(function () {
  return Boolean(toast.showCreatedAt && Number.isFinite(toast.createdAt));
});

const createdAtText = computed(function () {
  if (!hasCreatedAt.value) {
    return "";
  }

  const formatter =
    typeof toast.createdAtFormatter === "function"
      ? toast.createdAtFormatter
      : defaultCreatedAtFormatter;

  try {
    return formatter(toast.createdAt);
  } catch (error) {
    return defaultCreatedAtFormatter(toast.createdAt);
  }
});

const createdAtAriaLabel = computed(function () {
  if (!createdAtText.value) {
    return "";
  }
  return `Sent at ${createdAtText.value}`;
});

const titleAriaLabel = computed(function () {
  return toAriaText(toast.title);
});

const descriptionAriaLabel = computed(function () {
  return toAriaText(toast.description);
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
    parts.push(`${toast.type} notification`);
  }

  return parts.join(". ");
});

function toAriaText(value: string): string {
  if (!value) {
    return "";
  }
  return stripHtmlToText(value);
}

function stripHtmlToText(value: string): string {
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

function normalizeWhitespace(value: string): string {
  return value.replace(/\s+/g, " ").trim();
}

function createContext(): ToastContext {
  return {
    id: toast.id,
    position: toast.position,
    type: toast.type,
    title: toast.title,
    description: toast.description,
    createdAt: toast.createdAt,
  };
}

function handleClick(event: MouseEvent) {
  const context = createContext();

  if (toast.onClick) {
    toast.onClick(context, event);
  }

  if (toast.closeOnClick) {
    emit("dismiss", toast.id);
  }
}

function handleCloseClick() {
  emit("dismiss", toast.id);
}

function handleMouseEnter() {
  if (!toast.pauseOnHover) {
    return;
  }
  isHovered.value = true;
  store.pause(toast.id);
}

function handleMouseLeave() {
  if (!toast.pauseOnHover) {
    return;
  }
  isHovered.value = false;
  store.resume(toast.id);
}

const progressKeyLocal = ref(0);

watch(
  () => progressResetKey,
  function () {
    if (progressResetKey == null) {
      return;
    }
    progressKeyLocal.value += 1;
  },
);

watch(
  () => duplicateKey,
  function () {
    if (duplicateKey == null) {
      return;
    }

    progressKeyLocal.value += 1;

    triggerBump();
  },
);

watch(
  () => updateKey,
  function () {
    if (updateKey == null) {
      return;
    }

    triggerUpdate();
  },
);

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
          <div class="tf-toast-body">
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
          v-if="toast.progressBar"
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

.tf-toast-created-at {
  position: absolute;
  bottom: 0;
  right: 0;
  color: var(--tf-toast-description-color);
  font-size: var(--tf-toast-created-at-font-size);
  font-style: italic;
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
