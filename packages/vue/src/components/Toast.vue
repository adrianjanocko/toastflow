<script setup lang="ts">
import {computed, type CSSProperties, inject, ref, watch} from "vue";
import ToastProgress from "./ToastProgress.vue";
import type {ToastContext, ToastId, ToastInstance, ToastStore, ToastType,} from "toastflow-core";
import {toastStoreKey} from "../symbols";

import {AlertTriangle, BadgeInfo, CheckCircle2, Info, X as XIcon, XCircle,} from "lucide-vue-next";

const {toast, progressResetKey, duplicateKey, clearAllClass} = defineProps<{
  toast: ToastInstance;
  progressResetKey?: number;
  duplicateKey?: number;
  clearAllClass?: string;
}>();

const emit = defineEmits<{
  (e: "dismiss", id: ToastId): void;
}>();

const injectedStore = inject<ToastStore | null>(toastStoreKey, null);
if (!injectedStore) {
  throw new Error("[vue-toastflow] Plugin not installed");
}
const store: ToastStore = injectedStore;

const isHovered = ref(false);
const isBumped = ref(false);

const typeMeta: Record<ToastType, {
  accent: string;
  icon: string;
  close: string;
  component: typeof CheckCircle2;
}> = {
  success: {
    accent: "tf-toast-accent--success",
    icon: "tf-toast-icon--success",
    close: "tf-toast-close--success",
    component: CheckCircle2,
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
    component: AlertTriangle,
  },
  info: {
    accent: "tf-toast-accent--info",
    icon: "tf-toast-icon--info",
    close: "tf-toast-close--info",
    component: Info,
  },
  default: {
    accent: "tf-toast-accent--default",
    icon: "tf-toast-icon--default",
    close: "tf-toast-close--default",
    component: BadgeInfo,
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

function createContext(): ToastContext {
  return {
    id: toast.id,
    position: toast.position,
    type: toast.type,
    title: toast.title,
    description: toast.description,
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

      isBumped.value = false;
      requestAnimationFrame(function () {
        isBumped.value = true;
      });
    },
);
</script>

<template>
  <div
      :role="role"
      :aria-live="ariaLive"
      class="tf-toast-wrapper"
  >
    <div
        class="tf-toast"
        :data-position="toast.position"
        :class="[
        accentClass,
        toast.phase === 'clear-all' ? clearAllClass : null,
        {
          'tf-toast--paused': isHovered,
          'tf-toast--bump':
            isBumped &&
            toast.phase !== 'leaving' &&
            toast.phase !== 'clear-all',
        },
      ]"
        @click="handleClick"
        @mouseenter="handleMouseEnter"
        @mouseleave="handleMouseLeave"
    >
      <div class="tf-toast-surface">
        <!-- main row -->
        <div class="tf-toast-main">
          <!-- icon (slot + lucide defaults) -->
          <div class="tf-toast-icon" :class="iconWrapperClass">
            <slot name="icon" :toast="toast">
              <component
                  :is="defaultIconComponent"
                  class="tf-toast-icon-svg"
                  aria-hidden="true"
              />
            </slot>
          </div>

          <!-- content -->
          <div class="tf-toast-body">
            <div class="tf-toast-text">
              <p class="tf-toast-title">
                {{ toast.title }}
              </p>
              <p
                  v-if="toast.description"
                  class="tf-toast-description"
              >
                {{ toast.description }}
              </p>
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
            <ToastProgress :key="progressKeyLocal" :type="toast.type"/>
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
          <XIcon class="tf-toast-close-icon" aria-hidden="true"/>
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

.tf-toast-accent--default {
  --tf-toast-bg: var(--normal-bg);
  --tf-toast-border-color: var(--normal-border);
  --tf-toast-color: var(--normal-text);
  --tf-toast-description-color: var(--normal-text);
  --tf-toast-progress-bg: color-mix(in srgb, var(--normal-text) 15%, transparent);
}

.tf-toast-accent--success {
  --tf-toast-bg: var(--success-bg);
  --tf-toast-border-color: var(--success-border);
  --tf-toast-color: var(--success-text);
  --tf-toast-description-color: var(--success-text);
  --tf-toast-progress-bg: color-mix(in srgb, var(--success-text) 18%, transparent);
}

.tf-toast-accent--error {
  --tf-toast-bg: var(--error-bg);
  --tf-toast-border-color: var(--error-border);
  --tf-toast-color: var(--error-text);
  --tf-toast-description-color: var(--error-text);
  --tf-toast-progress-bg: color-mix(in srgb, var(--error-text) 18%, transparent);
}

.tf-toast-accent--warning {
  --tf-toast-bg: var(--warning-bg);
  --tf-toast-border-color: var(--warning-border);
  --tf-toast-color: var(--warning-text);
  --tf-toast-description-color: var(--warning-text);
  --tf-toast-progress-bg: color-mix(in srgb, var(--warning-text) 18%, transparent);
}

.tf-toast-accent--info {
  --tf-toast-bg: var(--info-bg);
  --tf-toast-border-color: var(--info-border);
  --tf-toast-color: var(--info-text);
  --tf-toast-description-color: var(--info-text);
  --tf-toast-progress-bg: color-mix(in srgb, var(--info-text) 18%, transparent);
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
  align-items: flex-start;
  gap: var(--tf-toast-gap);
}

/* icon - no bubble bg, just lucide */

.tf-toast-icon-svg {
  width: var(--tf-toast-icon-size);
  height: var(--tf-toast-icon-size);
}

/* per-type icon color */

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

.tf-toast-icon--default .tf-toast-icon-svg {
  color: var(--tf-toast-icon-default);
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

/* bump animation flag already tied to class tf-toast--bump */
</style>
