<script setup lang="ts">
import {computed, ref} from "vue";
import {type ToastContext, useToast} from "vue-toastflow";
import type {
  PauseStrategy,
  ToastId,
  ToastOptions,
  ToastOrder,
  ToastPosition,
  ToastType,
} from "toastflow-core";
import {
  ArrowDown,
  ArrowDownLeft,
  ArrowDownRight,
  ArrowUp,
  ArrowUpLeft,
  ArrowUpRight,
} from "lucide-vue-next";

const {show, update, dismissAll} = useToast();

/* ----- options / enums ----- */

const positionOptions: {
  value: ToastPosition;
  label: string;
  icon: string;
  short: string;
}[] = [
  {value: "top-left", label: "Top left", icon: "↖", short: "TL"},
  {value: "top-center", label: "Top center", icon: "↑", short: "TC"},
  {value: "top-right", label: "Top right", icon: "↗", short: "TR"},
  {value: "bottom-left", label: "Bottom left", icon: "↙", short: "BL"},
  {value: "bottom-center", label: "Bottom center", icon: "↓", short: "BC"},
  {value: "bottom-right", label: "Bottom right", icon: "↘", short: "BR"},
];

function iconForPosition(position: ToastPosition) {
  if (position === "top-left") {
    return ArrowUpLeft;
  }
  if (position === "top-center") {
    return ArrowUp;
  }
  if (position === "top-right") {
    return ArrowUpRight;
  }
  if (position === "bottom-left") {
    return ArrowDownLeft;
  }
  if (position === "bottom-center") {
    return ArrowDown;
  }
  return ArrowDownRight;
}

const typeOptions: { value: ToastType; label: string }[] = [
  {value: "default", label: "Default"},
  {value: "success", label: "Success"},
  {value: "error", label: "Error"},
  {value: "warning", label: "Warning"},
  {value: "info", label: "Info"},
];

const orderOptions: { value: ToastOrder; label: string }[] = [
  {value: "newest", label: "Newest"},
  {value: "oldest", label: "Oldest"},
];

const pauseStrategyOptions: { value: PauseStrategy; label: string }[] = [
  {value: "resume", label: "Resume"},
  {value: "reset", label: "Reset"},
];

/* ----- reactive state ----- */

const position = ref<ToastPosition>("top-right");
const type = ref<ToastType>("success");

const offset = ref("16px");
const gap = ref("8px");
const zIndex = ref(9999);
const width = ref("350px");

const duration = ref(5000);
const maxVisible = ref(5);

const preventDuplicates = ref(false);
const order = ref<ToastOrder>("newest");

const progressBar = ref(true);
const pauseOnHover = ref(true);
const pauseStrategy = ref<PauseStrategy>("resume");

const closeButton = ref(true);
const closeOnClick = ref(false);

const useOnMount = ref(false);
const useOnUnmount = ref(false);
const useOnClick = ref(false);
const useOnClose = ref(false);

const title = ref("Saved");
const description = ref("Your changes have been stored.");

const lastId = ref<ToastId | null>(null);

/* ----- helpers ----- */

function defaultTitleForType(t: ToastType): string {
  if (t === "success") {
    return "Saved";
  }
  if (t === "error") {
    return "Something went wrong";
  }
  if (t === "warning") {
    return "Heads up";
  }
  return "Information";
}

function defaultDescriptionForType(t: ToastType): string {
  if (t === "success") {
    return "Your changes have been stored.";
  }
  if (t === "error") {
    return "Check the console for more details.";
  }
  if (t === "warning") {
    return "Please double-check your input.";
  }
  return "This is just an informational toast.";
}

/* ----- computed config for show() ----- */

const baseConfig = computed<Partial<ToastOptions>>(function () {
  const config: Partial<ToastOptions> = {
    offset: offset.value,
    gap: gap.value,
    zIndex: zIndex.value,
    width: width.value,

    duration: duration.value,
    maxVisible: maxVisible.value,
    position: position.value,

    preventDuplicates: preventDuplicates.value,
    order: order.value,

    progressBar: progressBar.value,
    pauseOnHover: pauseOnHover.value,
    pauseStrategy: pauseStrategy.value,

    animation: {
      enter: "Toastflow__animation-enter",
      leave: "Toastflow__animation-leave",
      move: "Toastflow__animation-move",
      clearAll: "Toastflow__animation-clearAll",
    },

    closeButton: closeButton.value,
    closeOnClick: closeOnClick.value,
  };

  if (useOnMount.value) {
    config.onMount = function (ctx: ToastContext) {
      console.log("[toastflow] onMount", ctx);
    };
  }

  if (useOnUnmount.value) {
    config.onUnmount = function (ctx: ToastContext) {
      console.log("[toastflow] onUnmount", ctx);
    };
  }

  if (useOnClick.value) {
    config.onClick = function (ctx: ToastContext, event: MouseEvent) {
      console.log("[toastflow] onClick", ctx, event);
    };
  }

  if (useOnClose.value) {
    config.onClose = function (ctx: ToastContext) {
      console.log("[toastflow] onClose", ctx);
    };
  }

  return config;
});

/* ----- actions ----- */

function push(typeOverride?: ToastType) {
  const toastType = typeOverride ?? type.value;

  lastId.value = show({
    ...baseConfig.value,
    type: toastType,
    title: title.value || defaultTitleForType(toastType),
    description: description.value || defaultDescriptionForType(toastType),
  });
}

function pushBurst() {
  for (let i = 0; i < 5; i += 1) {
    push(type.value);
  }
}

function updateLast() {
  if (!lastId.value) {
    return;
  }

  update(lastId.value, {
    title: (title.value || "Updated toast") + " (updated)",
    description:
      description.value ||
      "This toast was updated from the Toastflow playground.",
  });
}

function resetToDefaults() {
  position.value = "top-right";
  type.value = "success";

  offset.value = "16px";
  gap.value = "8px";
  zIndex.value = 9999;
  width.value = "350px";

  duration.value = 5000;
  maxVisible.value = 5;

  preventDuplicates.value = true;
  order.value = "newest";

  progressBar.value = true;
  pauseOnHover.value = true;
  pauseStrategy.value = "resume";

  closeButton.value = true;
  closeOnClick.value = false;

  useOnMount.value = false;
  useOnUnmount.value = false;
  useOnClick.value = false;
  useOnClose.value = false;

  title.value = "Saved";
  description.value = "Your changes have been stored.";
}
</script>

<template>
  <div
    class="w-full max-w-5xl rounded-3xl bg-white/90 p-6 shadow-2xl ring-1 ring-slate-200 backdrop-blur-md"
  >
    <div class="mb-6 flex flex-wrap items-center justify-between gap-3">
      <div class="flex items-center gap-3">
        <p class="ml-2 hidden text-xs text-slate-500 md:inline">
          Configure options and push toasts to see them in action.
        </p>
      </div>

      <div
        class="flex items-center gap-2 rounded-full bg-slate-50 px-3 py-1 text-[0.7rem] text-slate-500"
      >
        <span>Last toast ID:</span>
        <span class="font-mono text-[0.7rem] text-slate-700">
          {{ lastId ?? "—" }}
        </span>
      </div>
    </div>

    <div class="grid gap-5 md:grid-cols-4 text-xs md:text-sm">
      <!-- POSITION + TYPE -->
      <section
        class="space-y-4 rounded-2xl bg-white p-4 ring-1 ring-slate-100"
      >
        <div>
          <h2
            class="mb-3 text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-slate-400"
          >
            Position
          </h2>

          <div class="grid grid-cols-3 gap-3">
            <button
              v-for="pos in positionOptions"
              :key="pos.value"
              type="button"
              class="group flex flex-col items-center justify-center rounded-2xl border px-2 py-2 text-[0.7rem] font-medium transition-all"
              :class="
                position === pos.value
                  ? 'border-slate-900 bg-slate-900 text-white'
                  : 'border-slate-200 bg-slate-50 text-slate-600 hover:border-slate-300 hover:bg-slate-100'
              "
              @click="position = pos.value"
            >
              <component
                :is="iconForPosition(pos.value)"
                class="mb-1 h-4 w-4 group-hover:scale-105"
              />
              <span class="text-[0.6rem] uppercase tracking-[0.16em]">
          {{ pos.label.split(' ')[1] }}
        </span>
            </button>
          </div>
        </div>

        <div>
          <h2
            class="mb-3 text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-slate-400"
          >
            Type
          </h2>
          <div class="flex flex-wrap gap-2">
            <button
              v-for="t in typeOptions"
              :key="t.value"
              type="button"
              class="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium transition-all"
              :class="
                type === t.value
                  ? 'border-slate-900 bg-slate-900 text-white'
                  : 'border-slate-200 bg-slate-50 text-slate-600 hover:border-slate-300 hover:bg-slate-100'
              "
              @click="type = t.value"
            >
              <span
                class="h-1.5 w-1.5 rounded-full"
                :class="{
                  'bg-gray-600': t.value === 'default',
                  'bg-emerald-600': t.value === 'success',
                  'bg-rose-600': t.value === 'error',
                  'bg-amber-600': t.value === 'warning',
                  'bg-sky-600': t.value === 'info',
                }"
              />
              <span>{{ t.label }}</span>
            </button>
          </div>
        </div>
      </section>

      <!-- CONFIG TOGGLES -->
      <section
        class="space-y-4 rounded-2xl bg-white p-4 ring-1 ring-slate-100"
      >
        <div>
          <h2
            class="mb-3 text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-slate-400"
          >
            Behavior
          </h2>
          <div class="flex flex-col gap-2">
            <button
              type="button"
              class="inline-flex items-center justify-between rounded-xl border px-3 py-1.5 text-xs font-medium transition-all"
              :class="
                preventDuplicates
                  ? 'border-slate-900 bg-slate-900 text-white'
                  : 'border-slate-200 bg-slate-50 text-slate-600 hover:border-slate-300 hover:bg-slate-100'
              "
              @click="preventDuplicates = !preventDuplicates"
            >
              <span>No duplicates</span>
            </button>

            <button
              type="button"
              class="inline-flex items-center justify-between rounded-xl border px-3 py-1.5 text-xs font-medium transition-all"
              :class="
                progressBar
                  ? 'border-slate-900 bg-slate-900 text-white'
                  : 'border-slate-200 bg-slate-50 text-slate-600 hover:border-slate-300 hover:bg-slate-100'
              "
              @click="progressBar = !progressBar"
            >
              <span>Progress bar</span>
            </button>

            <button
              type="button"
              class="inline-flex items-center justify-between rounded-xl border px-3 py-1.5 text-xs font-medium transition-all"
              :class="
                pauseOnHover
                  ? 'border-slate-900 bg-slate-900 text-white'
                  : 'border-slate-200 bg-slate-50 text-slate-600 hover:border-slate-300 hover:bg-slate-100'
              "
              @click="pauseOnHover = !pauseOnHover"
            >
              <span>Pause on hover</span>
            </button>

            <button
              type="button"
              class="inline-flex items-center justify-between rounded-xl border px-3 py-1.5 text-xs font-medium transition-all"
              :class="
                closeButton
                  ? 'border-slate-900 bg-slate-900 text-white'
                  : 'border-slate-200 bg-slate-50 text-slate-600 hover:border-slate-300 hover:bg-slate-100'
              "
              @click="closeButton = !closeButton"
            >
              <span>Close button</span>
            </button>

            <button
              type="button"
              class="inline-flex items-center justify-between rounded-xl border px-3 py-1.5 text-xs font-medium transition-all"
              :class="
                closeOnClick
                  ? 'border-slate-900 bg-slate-900 text-white'
                  : 'border-slate-200 bg-slate-50 text-slate-600 hover:border-slate-300 hover:bg-slate-100'
              "
              @click="closeOnClick = !closeOnClick"
            >
              <span>Close on click</span>
            </button>
          </div>
        </div>

        <div>
          <h2
            class="mb-3 text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-slate-400"
          >
            Order &amp; Pause
          </h2>
          <div class="flex flex-wrap gap-2">
            <button
              v-for="o in orderOptions"
              :key="o.value"
              type="button"
              class="rounded-full border px-3 py-1 text-xs font-medium transition-all"
              :class="
                order === o.value
                  ? 'border-slate-900 bg-slate-900 text-white'
                  : 'border-slate-200 bg-slate-50 text-slate-600 hover:border-slate-300 hover:bg-slate-100'
              "
              @click="order = o.value"
            >
              {{ o.label }}
            </button>

            <button
              v-for="ps in pauseStrategyOptions"
              :key="ps.value"
              type="button"
              class="rounded-full border px-3 py-1 text-xs font-medium transition-all"
              :class="
                pauseStrategy === ps.value
                  ? 'border-slate-900 bg-slate-900 text-white'
                  : 'border-slate-200 bg-slate-50 text-slate-600 hover:border-slate-300 hover:bg-slate-100'
              "
              @click="pauseStrategy = ps.value"
            >
              Pause: {{ ps.label }}
            </button>
          </div>
        </div>
      </section>

      <!-- TIMING + LAYOUT -->
      <section
        class="space-y-4 rounded-2xl bg-white p-4 ring-1 ring-slate-100"
      >
        <div>
          <h2
            class="mb-3 text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-slate-400"
          >
            Timing &amp; limits
          </h2>
          <div class="space-y-2">
            <label class="flex flex-col gap-1">
              <span class="text-[0.7rem] text-slate-500">Duration (ms)</span>
              <input
                v-model.number="duration"
                type="number"
                class="w-full rounded-lg border border-slate-200 bg-slate-50 px-2 py-1 text-xs outline-none transition focus:border-slate-400 focus:bg-white"
                min="0"
                step="250"
              />
            </label>

            <label class="flex flex-col gap-1">
              <span class="text-[0.7rem] text-slate-500">Max visible</span>
              <input
                v-model.number="maxVisible"
                type="number"
                class="w-full rounded-lg border border-slate-200 bg-slate-50 px-2 py-1 text-xs outline-none transition focus:border-slate-400 focus:bg-white"
                min="1"
              />
            </label>
          </div>
        </div>

        <div>
          <h2
            class="mb-3 text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-slate-400"
          >
            Layout
          </h2>
          <div class="space-y-2">
            <label class="flex flex-col gap-1">
              <span class="text-[0.7rem] text-slate-500">Offset</span>
              <input
                v-model="offset"
                type="text"
                class="w-full rounded-lg border border-slate-200 bg-slate-50 px-2 py-1 text-xs outline-none transition focus:border-slate-400 focus:bg-white"
                placeholder="16px"
              />
            </label>

            <label class="flex flex-col gap-1">
              <span class="text-[0.7rem] text-slate-500">Gap</span>
              <input
                v-model="gap"
                type="text"
                class="w-full rounded-lg border border-slate-200 bg-slate-50 px-2 py-1 text-xs outline-none transition focus:border-slate-400 focus:bg-white"
                placeholder="8px"
              />
            </label>

            <label class="flex flex-col gap-1">
              <span class="text-[0.7rem] text-slate-500">Width</span>
              <input
                v-model="width"
                type="text"
                class="w-full rounded-lg border border-slate-200 bg-slate-50 px-2 py-1 text-xs outline-none transition focus:border-slate-400 focus:bg-white"
                placeholder="350px"
              />
            </label>

            <label class="flex flex-col gap-1">
              <span class="text-[0.7rem] text-slate-500">z-index</span>
              <input
                v-model.number="zIndex"
                type="number"
                class="w-full rounded-lg border border-slate-200 bg-slate-50 px-2 py-1 text-xs outline-none transition focus:border-slate-400 focus:bg-white"
              />
            </label>
          </div>
        </div>
      </section>

      <!-- EVENTS + CONTENT -->
      <section
        class="space-y-4 rounded-2xl bg-white p-4 ring-1 ring-slate-100"
      >
        <div>
          <h2
            class="mb-3 text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-slate-400"
          >
            Events (console.log)
          </h2>
          <div class="flex flex-wrap gap-2">
            <button
              type="button"
              class="rounded-full border px-3 py-1 text-xs font-medium transition-all"
              :class="
                useOnMount
                  ? 'border-slate-900 bg-slate-900 text-white'
                  : 'border-slate-200 bg-slate-50 text-slate-600 hover:border-slate-300 hover:bg-slate-100'
              "
              @click="useOnMount = !useOnMount"
            >
              onMount
            </button>

            <button
              type="button"
              class="rounded-full border px-3 py-1 text-xs font-medium transition-all"
              :class="
                useOnUnmount
                  ? 'border-slate-900 bg-slate-900 text-white'
                  : 'border-slate-200 bg-slate-50 text-slate-600 hover:border-slate-300 hover:bg-slate-100'
              "
              @click="useOnUnmount = !useOnUnmount"
            >
              onUnmount
            </button>

            <button
              type="button"
              class="rounded-full border px-3 py-1 text-xs font-medium transition-all"
              :class="
                useOnClick
                  ? 'border-slate-900 bg-slate-900 text-white'
                  : 'border-slate-200 bg-slate-50 text-slate-600 hover:border-slate-300 hover:bg-slate-100'
              "
              @click="useOnClick = !useOnClick"
            >
              onClick
            </button>

            <button
              type="button"
              class="rounded-full border px-3 py-1 text-xs font-medium transition-all"
              :class="
                useOnClose
                  ? 'border-slate-900 bg-slate-900 text-white'
                  : 'border-slate-200 bg-slate-50 text-slate-600 hover:border-slate-300 hover:bg-slate-100'
              "
              @click="useOnClose = !useOnClose"
            >
              onClose
            </button>
          </div>
        </div>

        <div>
          <h2
            class="mb-3 text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-slate-400"
          >
            Content
          </h2>
          <div class="space-y-2">
            <label class="flex flex-col gap-1">
              <span class="text-[0.7rem] text-slate-500">Title</span>
              <input
                v-model="title"
                type="text"
                class="w-full rounded-lg border border-slate-200 bg-slate-50 px-2 py-1 text-xs outline-none transition focus:border-slate-400 focus:bg-white"
                placeholder="Saved"
              />
            </label>

            <label class="flex flex-col gap-1">
              <span class="text-[0.7rem] text-slate-500">Description</span>
              <input
                v-model="description"
                type="text"
                class="w-full rounded-lg border border-slate-200 bg-slate-50 px-2 py-1 text-xs outline-none transition focus:border-slate-400 focus:bg-white"
                placeholder="Your changes have been stored."
              />
            </label>
          </div>
        </div>
      </section>
    </div>

    <!-- bottom actions -->
    <div
      class="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 pt-4 text-xs md:text-sm"
    >
      <div class="flex flex-wrap gap-2">
        <button
          type="button"
          class="rounded-2xl bg-slate-900 px-4 py-1.5 text-xs font-medium text-white transition hover:bg-slate-800"
          @click="push()"
        >
          Push toast
        </button>

        <button
          type="button"
          class="rounded-2xl bg-slate-900/90 px-4 py-1.5 text-xs font-medium text-white transition hover:bg-slate-900"
          @click="pushBurst"
        >
          Push 5
        </button>

        <button
          type="button"
          class="rounded-2xl border border-slate-300 bg-white px-4 py-1.5 text-xs font-medium text-slate-700 transition hover:border-slate-400 hover:bg-slate-50"
          @click="updateLast"
        >
          Update last
        </button>
      </div>

      <div class="flex flex-wrap gap-2">
        <button
          type="button"
          class="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-1.5 text-xs font-medium text-rose-700 transition hover:border-rose-300 hover:bg-rose-100"
          @click="dismissAll"
        >
          Dismiss all
        </button>

        <button
          type="button"
          class="rounded-2xl border border-slate-300 bg-white px-4 py-1.5 text-xs font-medium text-slate-700 transition hover:border-slate-400 hover:bg-slate-50"
          @click="resetToDefaults"
        >
          Reset config
        </button>
      </div>
    </div>
  </div>
</template>
