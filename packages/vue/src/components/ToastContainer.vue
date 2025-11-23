<script setup lang="ts">
import { computed, inject, onMounted, onUnmounted, ref, watch } from "vue";
import Toast from "./Toast.vue";
import { toastStoreKey } from "../symbols";
import {
  defaults,
  ToastConfig,
  ToastId,
  ToastInstance,
  ToastPosition,
  ToastStore,
} from "toastflow-core";

const positions: ToastPosition[] = [
  "top-left",
  "top-center",
  "top-right",
  "bottom-left",
  "bottom-center",
  "bottom-right",
];

const injectedStore = inject<ToastStore | null>(toastStoreKey, null);
if (!injectedStore) {
  throw new Error("[vue-toastflow] Plugin not installed");
}
const store: ToastStore = injectedStore;

const toasts = ref<ToastInstance[]>([]);
const animationByPosition = ref<
  Record<ToastPosition, ToastInstance["animation"] | null>
>(
  Object.fromEntries(
    positions.map(function (position) {
      return [position, null];
    }),
  ) as Record<ToastPosition, ToastInstance["animation"] | null>,
);

// event-driven keys
const progressResetMap = ref<Record<ToastId, number>>({});
const duplicateMap = ref<Record<ToastId, number>>({});

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

const config = ref<ToastConfig>({ ...defaults });

function stackStyle(position: ToastPosition): Record<string, string> {
  const { offset, width } = config.value;
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

function handleDismiss(id: ToastId) {
  store.dismiss(id);
}

function animationConfig(position: ToastPosition) {
  return animationByPosition.value[position] ?? null;
}

function beforeLeave(el: Element) {
  const element = el as HTMLElement;
  const parent = element.parentElement;
  if (!parent || parent.children.length <= 1) {
    return;
  }

  const top = element.offsetTop;
  const parentWidth = parent.clientWidth;

  element.style.position = "absolute";
  element.style.width = `${parentWidth}px`;
  element.style.left = "0";
  element.style.right = "0";
  element.style.top = `${top}px`;
  element.style.pointerEvents = "none";
}

function afterLeave(el: Element) {
  const element = el as HTMLElement;
  element.style.position = "";
  element.style.width = "";
  element.style.left = "";
  element.style.right = "";
  element.style.top = "";
  element.style.pointerEvents = "";
}

watch(
  grouped,
  function (next) {
    for (const position of positions) {
      const first = next[position]?.[0];
      animationByPosition.value[position] = first?.animation ?? null;
    }
  },
  { immediate: true },
);

watch(
  toasts,
  function (current) {
    const head = current[0];
    if (head) {
      config.value = {
        ...config.value,
        offset: head.offset ?? defaults.offset,
        gap: head.gap ?? defaults.gap,
        zIndex: head.zIndex ?? defaults.zIndex,
        width: head.width ?? defaults.width,
      };
    }

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
  },
  { deep: false },
);
</script>

<template>
  <div class="tf-toast-root" :style="{ zIndex: String(config.zIndex) }">
    <div
      v-for="position in positions"
      :key="position"
      class="tf-toast-stack"
      :class="stackAlignClass(position)"
      :style="stackStyle(position)"
    >
      <TransitionGroup
        :enter-active-class="
          animationConfig(position)?.enter ?? 'Toastflow__animation-enter'
        "
        :leave-active-class="
          animationConfig(position)?.leave ?? 'Toastflow__animation-leave'
        "
        :move-class="
          animationConfig(position)?.move ?? 'Toastflow__animation-move'
        "
        @before-leave="beforeLeave"
        @after-leave="afterLeave"
        tag="div"
        class="tf-toast-stack-inner"
        :style="{ gap: config.gap }"
      >
        <div
          v-for="toast in grouped[position]"
          :key="toast.id"
          class="tf-toast-item"
          :style="{ width: config.width, maxWidth: '100%' }"
        >
          <slot
            v-if="$slots.default"
            :toast="toast"
            :progressResetKey="getProgressResetKey(toast.id)"
            :duplicateKey="getDuplicateKey(toast.id)"
            :clearAllClass="
              animationConfig(position)?.clearAll ??
              'Toastflow__animation-clearAll'
            "
            :dismiss="handleDismiss"
          />

          <Toast
            v-else
            :toast="toast"
            :progressResetKey="getProgressResetKey(toast.id)"
            :duplicateKey="getDuplicateKey(toast.id)"
            :clearAllClass="
              animationConfig(position)?.clearAll ??
              'Toastflow__animation-clearAll'
            "
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
}

.tf-toast-stack-inner {
  display: flex;
  flex-direction: column;
  position: relative;
  width: 100%;
}

.tf-toast-stack--left {
  align-items: flex-start;
}

.tf-toast-stack--center {
  align-items: center;
}

.tf-toast-stack--right {
  align-items: flex-end;
}

.tf-toast-item {
  width: 100%;
}
</style>
