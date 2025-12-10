<script setup lang="ts">
import { computed, inject, onMounted, onUnmounted, ref, watch } from "vue";
import Toast from "./Toast.vue";
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

const toasts = ref<ToastInstance[]>([]);

// event-driven keys
const progressResetMap = ref<Record<ToastId, number>>({});
const duplicateMap = ref<Record<ToastId, number>>({});
const updateMap = ref<Record<ToastId, number>>({});

let unsubscribeState: (() => void) | null = null;
let unsubscribeEvents: (() => void) | null = null;

onMounted(function () {
  unsubscribeState = store.subscribe(function (state) {
    toasts.value = state.toasts;
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
});

onUnmounted(function () {
  if (unsubscribeState) {
    unsubscribeState();
  }
  if (unsubscribeEvents) {
    unsubscribeEvents();
  }
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
  return Math.max(...toasts.value.map((toast) => toast.zIndex));
});

function stackConfig(position: ToastPosition): ToastConfig {
  return stackConfigs.value[position] ?? { ...baseConfig, position };
}

function stackStyle(position: ToastPosition): Record<string, string> {
  const { offset, width } = stackConfig(position);
  // Lock the stack width, so it doesn't collapse when leaving items get absolute-positioned
  const style: Record<string, string> = { width, maxWidth: "100%" };

  if (position.startsWith("top-")) {
    style.top = offset;
  }
  if (position.startsWith("bottom-")) {
    style.bottom = offset;
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
  if (position.startsWith("bottom-")) {
    return "tf-toast-stack-inner--bottom";
  }
  return null;
}

function allowOverflowScroll(position: ToastPosition): boolean {
  return stackConfig(position).overflowScroll && position.startsWith("top-");
}

function handleDismiss(id: ToastId) {
  store.dismiss(id);
}

function beforeLeave(el: Element) {
  const element = el as HTMLElement;
  const parent = element.parentElement;
  if (!parent || parent.children.length <= 1) {
    return;
  }

  const top = element.offsetTop;
  const parentHeight = parent.clientHeight;
  const parentWidth = parent.clientWidth;

  parent.style.minHeight = `${parentHeight}px`;
  element.style.position = "absolute";
  element.style.width = `${parentWidth}px`;
  element.style.left = "0";
  element.style.right = "0";
  element.style.top = `${top}px`;
}

function afterLeave(el: Element) {
  const element = el as HTMLElement;
  const parent = element.parentElement;
  if (parent) {
    parent.style.minHeight = "";
  }

  element.style.position = "";
  element.style.width = "";
  element.style.left = "";
  element.style.right = "";
  element.style.top = "";
}

watch(
  toasts,
  function (current) {
    const ids = new Set(
      current.map(function (toast) {
        return toast.id;
      }),
    );

    for (const key of Object.keys(progressResetMap.value)) {
      if (!ids.has(key as ToastId)) {
        delete progressResetMap.value[key as ToastId];
      }
    }

    for (const key of Object.keys(duplicateMap.value)) {
      if (!ids.has(key as ToastId)) {
        delete duplicateMap.value[key as ToastId];
      }
    }

    for (const key of Object.keys(updateMap.value)) {
      if (!ids.has(key as ToastId)) {
        delete updateMap.value[key as ToastId];
      }
    }
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
      const first = byPos[position][0];
      if (first) {
        next[position] = {
          ...baseConfig,
          ...first,
          position,
          animation: {
            ...baseConfig.animation,
            ...first.animation,
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
  <div class="tf-toast-root" :style="{ zIndex: globalZIndex }">
    <div
      v-for="position in positions"
      :key="position"
      class="tf-toast-stack"
      :class="stackAlignClass(position)"
      :style="stackStyle(position)"
    >
      <TransitionGroup
        :name="stackConfig(position).animation.name"
        @before-leave="beforeLeave"
        @after-leave="afterLeave"
        tag="div"
        :class="[
          'tf-toast-stack-inner',
          stackAxisClass(position),
          allowOverflowScroll(position) && 'tf-toast-stack-inner--scroll',
        ]"
        :style="{ gap: stackConfig(position).gap }"
      >
        <div
          v-for="toast in grouped[position]"
          :key="toast.id"
          class="tf-toast-item"
          :style="{ width: toast.width, maxWidth: '100%' }"
          :data-position="toast.position"
        >
          <slot
            v-if="$slots.default"
            :toast="toast"
            :progressResetKey="getProgressResetKey(toast.id)"
            :duplicateKey="getDuplicateKey(toast.id)"
            :updateKey="getUpdateKey(toast.id)"
            :bumpAnimationClass="animationForToast(toast).bump"
            :clearAllAnimationClass="animationForToast(toast).clearAll"
            :updateAnimationClass="animationForToast(toast).update"
            :dismiss="handleDismiss"
          />

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
      </TransitionGroup>
    </div>
  </div>
</template>

<style scoped>
.tf-toast-root {
  pointer-events: none;
  position: fixed;
  inset: 0;
}

.tf-toast-stack {
  position: absolute;
  height: 100%;
  display: flex;
  align-items: flex-start;
}

.tf-toast-stack-inner {
  display: flex;
  flex-direction: column;
  position: relative;
  width: 100%;
  box-sizing: border-box;
}

.tf-toast-stack-inner--scroll {
  max-height: 100%;
  overflow-y: auto;
  overflow-x: hidden;
  overscroll-behavior: contain;
  padding-top: var(--tf-toast-stack-padding-top);
  padding-right: var(--tf-toast-stack-padding-right);
  padding-bottom: var(--tf-toast-stack-padding-bottom);
  padding-left: var(--tf-toast-stack-padding-left);
  scroll-padding: var(--tf-toast-stack-padding-top)
    var(--tf-toast-stack-padding-right) var(--tf-toast-stack-padding-bottom)
    var(--tf-toast-stack-padding-left);
}

.tf-toast-stack-inner--bottom {
  min-height: 100%;
  justify-content: flex-end;
}

.tf-toast-stack--left {
  justify-content: flex-start;
}

.tf-toast-stack--center {
  justify-content: center;
}

.tf-toast-stack--right {
  justify-content: flex-end;
}

.tf-toast-item {
  pointer-events: auto;
  width: 100%;
}
</style>
