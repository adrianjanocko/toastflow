declare const __VUE_TOASTFLOW_VERSION__: string;

const VUE_TOASTFLOW_VERSION =
  typeof __VUE_TOASTFLOW_VERSION__ === "string"
    ? __VUE_TOASTFLOW_VERSION__
    : "latest";
const VUE_TOASTFLOW_CSS_URL = `https://cdn.jsdelivr.net/npm/vue-toastflow@${VUE_TOASTFLOW_VERSION}/dist/vue-toastflow.css`;

export const helperFiles: Record<string, string> = {
  "main.ts": `import { createApp } from "vue";
import App from "./App.vue";
import { createToastflow } from "vue-toastflow";

createApp(App)
  .use(
    createToastflow({
      position: "top-right",
      duration: 3800,
      maxVisible: 4,
    }),
  )
  .mount("#app");
`,
  "App.vue": `<script setup lang="ts">
import { ref } from "vue";
import {
  toast,
  ToastContainer,
  type ToastId,
  type ToastShowInput,
  type ToastShowOptions,
  type ToastTextInput,
  type ToastUpdateInput,
} from "vue-toastflow";

const lastId = ref<ToastId | null>(null);

const showObjectVariant: ToastShowInput = {
  type: "success",
  title: "Object payload",
  description: "toast.show({ type, title, description })",
};

const showTextVariant: ToastTextInput = {
  title: "Text payload",
  description: "toast.show(textObject, options)",
};

const showTextOptions: ToastShowOptions = {
  type: "success",
  duration: 6500,
};

function pushShowObject() {
  lastId.value = toast.show(showObjectVariant);
}

function pushShowStringAndOptions() {
  lastId.value = toast.show("String title", {
    type: "info",
    description: "toast.show(string, options) with explicit type",
    duration: 5600,
  });
}

function pushShowTextAndOptions() {
  lastId.value = toast.show(showTextVariant, showTextOptions);
}

function pushSuccess() {
  lastId.value = toast.success({
    title: "Saved",
    description: "Your profile was updated.",
  });
}

function pushWarning() {
  lastId.value = toast.warning({
    title: "Unsaved draft",
    description: "You have local changes.",
  });
}

function pushError() {
  lastId.value = toast.error({
    title: "Request failed",
    description: "Try again in a few seconds.",
  });
}

function updateLast() {
  if (!lastId.value) {
    return;
  }

  const patch: ToastUpdateInput = {
    title: "Updated",
    description: "This toast was patched with toast.update().",
    type: "info",
  };

  toast.update(lastId.value, patch);
}

function dismissLast() {
  if (!lastId.value) {
    return;
  }
  toast.dismiss(lastId.value);
}
</script>

<template>
  <main style="padding: 24px; font-family: Inter, system-ui, sans-serif; display: grid; gap: 12px;">
    <h3 style="margin: 0;">show overloads + typed helpers</h3>
    <p style="margin: 0; color: #64748b;">Use object, string + options, text + options, then patch by id.</p>

    <div style="display: grid; gap: 8px; max-width: 150px;">
      <button @click="pushShowObject">show object</button>
      <button @click="pushShowStringAndOptions">show string + options</button>
      <button @click="pushShowTextAndOptions">show text + options</button>
      <button @click="pushSuccess">toast.success</button>
      <button @click="pushWarning">toast.warning</button>
      <button @click="pushError">toast.error</button>
      <button @click="updateLast">update last</button>
      <button @click="dismissLast">dismiss last</button>
      <button @click="toast.dismissAll()">dismiss all</button>
    </div>
  </main>

  <ToastContainer />
</template>

<style>
@import url("${VUE_TOASTFLOW_CSS_URL}");

button {
  border: 1px solid #cbd5e1;
  background: #ffffff;
  color: #0f172a;
  border-radius: 8px;
  padding: 8px 12px;
  font-size: 13px;
  cursor: pointer;
}
button:hover {
  background: #f8fafc;
}
</style>
`,
};

export const loadingFiles: Record<string, string> = {
  "main.ts": `import { createApp } from "vue";
import App from "./App.vue";
import { createToastflow } from "vue-toastflow";

createApp(App)
  .use(
    createToastflow({
      position: "bottom-right",
      duration: 5000,
      progressBar: true,
      pauseOnHover: true,
    }),
  )
  .mount("#app");
`,
  "App.vue": `<script setup lang="ts">
import {
  toast,
  ToastContainer,
  type ToastLoadingConfig,
  type ToastLoadingResult,
} from "vue-toastflow";

type SaveResponse = { id: number };

const runSaveRequest = (): Promise<SaveResponse> =>
  new Promise((resolve, reject) => {
    setTimeout(() => {
      if (Math.random() > 0.3) {
        resolve({ id: 42 });
      } else {
        reject(new Error("Network timeout"));
      }
    }, 1400);
  });

const loadingConfig: ToastLoadingConfig<SaveResponse> = {
  loading: {
    title: "Saving record",
    description: "Please wait...",
  },
  success: (data) => ({
    title: "Saved",
    description: "Record " + data.id + " persisted.",
    type: "success",
  }),
  error: (error: unknown) => ({
    title: "Save failed",
    description: error instanceof Error ? error.message : "Unknown error",
    type: "error",
    duration: 9000,
  }),
};

async function runLoadingFlow() {
  const request: ToastLoadingResult<SaveResponse> = toast.loading(
    runSaveRequest,
    loadingConfig,
  );

  try {
    await request;
  } catch {
    // handled by toast.error state
  }
}

function pushManualInfo() {
  toast.info({
    title: "Background sync",
    description: "This one uses default timer + progress bar.",
  });
}
</script>

<template>
  <main style="padding: 24px; font-family: Inter, system-ui, sans-serif; display: grid; gap: 12px;">
    <h3 style="margin: 0;">Async loading workflow</h3>
    <p style="margin: 0; color: #64748b;">One toast id transitions from loading to success/error.</p>

    <div style="display: grid; gap: 8px; max-width: 150px;">
      <button @click="runLoadingFlow">run loading flow</button>
      <button @click="pushManualInfo">push info toast</button>
      <button @click="toast.dismissAll()">dismiss all</button>
    </div>
  </main>

  <ToastContainer />
</template>

<style>
@import url("${VUE_TOASTFLOW_CSS_URL}");

button {
  border: 1px solid #cbd5e1;
  background: #ffffff;
  color: #0f172a;
  border-radius: 8px;
  padding: 8px 12px;
  font-size: 13px;
  cursor: pointer;
}
button:hover {
  background: #f8fafc;
}
</style>
`,
};

export const themeFiles: Record<string, string> = {
  "main.ts": `import { createApp } from "vue";
import App from "./App.vue";
import { createToastflow } from "vue-toastflow";

createApp(App)
  .use(
    createToastflow({
      supportHtml: true,
      showCreatedAt: true,
      position: "top-center",
      closeOnClick: false,
    }),
  )
  .mount("#app");
`,
  "App.vue": `<script setup lang="ts">
import {
  toast,
  ToastContainer,
  type ToastButtonsConfig,
  type ToastContentInput,
} from "vue-toastflow";

const brandedButtons: ToastButtonsConfig = {
  alignment: "bottom-right",
  buttons: [
    {
      label: "Open",
      onClick() {
        toast.success({
          title: "Action",
          description: "You clicked Open.",
        });
      },
    },
    {
      label: "Dismiss",
      onClick(ctx) {
        toast.dismiss(ctx.id);
      },
    },
  ],
};

const brandedToast: ToastContentInput = {
  title: "<strong>Release 1.2.0</strong>",
  description: "Open <a href='#'>changelog</a> for details.",
  theme: "docs-brand",
  supportHtml: true,
  showCreatedAt: true,
  buttons: brandedButtons,
};

const warningHtmlToast: ToastContentInput = {
  title: "<strong>Policy update</strong>",
  description: "Please review <em>Terms of Service</em>.",
  supportHtml: true,
};

function pushBranded() {
  toast.info(brandedToast);
}

function pushHtmlWarning() {
  toast.warning(warningHtmlToast);
}
</script>

<template>
  <main style="padding: 24px; font-family: Inter, system-ui, sans-serif; display: grid; gap: 12px;">
    <h3 style="margin: 0;">Theming + HTML + buttons</h3>
    <p style="margin: 0; color: #64748b;">Use custom accent classes and inline action buttons.</p>

    <div style="display: grid; gap: 8px; max-width: 150px;">
      <button @click="pushBranded">push branded toast</button>
      <button @click="pushHtmlWarning">push html warning</button>
      <button @click="toast.dismissAll()">dismiss all</button>
    </div>
  </main>

  <ToastContainer />
</template>

<style>
@import url("${VUE_TOASTFLOW_CSS_URL}");

button {
  border: 1px solid #cbd5e1;
  background: #ffffff;
  color: #0f172a;
  border-radius: 8px;
  padding: 8px 12px;
  font-size: 13px;
  cursor: pointer;
}
button:hover {
  background: #f8fafc;
}

.tf-toast-accent--docs-brand {
  --tf-toast-bg: #0f172a;
  --tf-toast-color: #e2e8f0;
  --tf-toast-border-color: #334155;
  --tf-toast-title-color: #f8fafc;
  --tf-toast-description-color: #cbd5e1;
  --tf-toast-progress-bg: color-mix(in srgb, #cbd5e1 25%, transparent);
  --tf-toast-progress-bar-bg: #38bdf8;
}
</style>
`,
};

export const headlessFiles: Record<string, string> = {
  "main.ts": `import { createApp } from "vue";
import App from "./App.vue";
import { createToastflow } from "vue-toastflow";

createApp(App)
  .use(
    createToastflow({
      position: "bottom-left",
      duration: 4200,
      closeButton: false,
      closeOnClick: false,
    }),
  )
  .mount("#app");
`,
  "App.vue": `<script setup lang="ts">
import {
  toast,
  ToastContainer,
  type ToastContentInput,
} from "vue-toastflow";

type DemoType = "success" | "error" | "info";

function pushCustom(type: DemoType) {
  const payload: ToastContentInput = {
    title: "Headless " + type,
    description: "Rendered via ToastContainer slot.",
    closeOnClick: false,
  };

  toast.show(payload, { type });
}
</script>

<template>
  <main style="padding: 24px; font-family: Inter, system-ui, sans-serif; display: grid; gap: 12px;">
    <h3 style="margin: 0;">Headless slot rendering</h3>
    <p style="margin: 0; color: #64748b;">Custom toast card while keeping Toastflow store/runtime.</p>

    <div style="display: grid; gap: 8px; max-width: 150px;">
      <button @click="pushCustom('success')">success</button>
      <button @click="pushCustom('error')">error</button>
      <button @click="pushCustom('info')">info</button>
      <button @click="toast.dismissAll()">dismiss all</button>
    </div>
  </main>

  <ToastContainer
    v-slot="{ toast: item, dismiss, bumpAnimationClass, clearAllAnimationClass, updateAnimationClass }"
  >
    <article
      class="demo-card"
      :class="[
        item.type,
        bumpAnimationClass,
        item.phase === 'clear-all' && clearAllAnimationClass,
        updateAnimationClass,
      ]"
    >
      <div class="demo-card-top">
        <strong>{{ item.title }}</strong>
        <button class="demo-close" @click.stop="dismiss(item.id)">x</button>
      </div>
      <p v-if="item.description" class="demo-desc">{{ item.description }}</p>
    </article>
  </ToastContainer>
</template>

<style>
@import url("${VUE_TOASTFLOW_CSS_URL}");

button {
  border: 1px solid #cbd5e1;
  background: #ffffff;
  color: #0f172a;
  border-radius: 8px;
  padding: 8px 12px;
  font-size: 13px;
  cursor: pointer;
}
button:hover {
  background: #f8fafc;
}

.demo-card {
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  background: #ffffff;
  color: #0f172a;
  padding: 12px;
  box-shadow: 0 8px 30px rgba(2, 6, 23, 0.1);
}

.demo-card.success {
  border-color: #86efac;
}

.demo-card.error {
  border-color: #fca5a5;
}

.demo-card.info {
  border-color: #93c5fd;
}

.demo-card-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}

.demo-desc {
  margin: 8px 0 0;
  color: #334155;
}

.demo-close {
  width: 24px;
  height: 24px;
  padding: 0;
  border-radius: 999px;
}
</style>
`,
};

export const eventsFiles: Record<string, string> = {
  "main.ts": `import { createApp } from "vue";
import App from "./App.vue";
import { createToastflow } from "vue-toastflow";

createApp(App)
  .use(
    createToastflow({
      position: "top-right",
      duration: 3600,
      preventDuplicates: true,
    }),
  )
  .mount("#app");
`,
  "App.vue": `<script setup lang="ts">
import { onMounted, onUnmounted, ref } from "vue";
import {
  toast,
  ToastContainer,
  type ToastEvent,
  type ToastState,
} from "vue-toastflow";

const visibleCount = ref(0);
const queuedCount = ref(0);
const eventLog = ref<string[]>([]);

let offState: (() => void) | null = null;
let offEvents: (() => void) | null = null;

function formatTimestamp(): string {
  const now = new Date();
  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");
  const seconds = String(now.getSeconds()).padStart(2, "0");
  return hours + ":" + minutes + ":" + seconds;
}

function applyState(state: ToastState) {
  visibleCount.value = state.toasts.length;
  queuedCount.value = state.queue.length;
}

function addLog(line: string) {
  const outputLine = "[" + formatTimestamp() + "] " + line;
  eventLog.value = [outputLine, ...eventLog.value].slice(0, 10);
}

onMounted(() => {
  applyState(toast.getState());

  offState = toast.subscribe((state) => {
    applyState(state);
  });

  offEvents = toast.subscribeEvents((event: ToastEvent) => {
    addLog(event.kind + " -> " + event.id);
  });
});

onUnmounted(() => {
  offState?.();
  offEvents?.();
});

function pushDuplicate() {
  toast.info({
    title: "Sync finished",
    description: "The same payload triggers duplicate logic.",
  });
}

function pushUpdateTarget() {
  const id = toast.warning({
    title: "Updating soon",
    description: "Wait for patch",
  });

  setTimeout(() => {
    toast.update(id, {
      type: "success",
      title: "Updated",
      description: "toast.update() emitted update event.",
    });
  }, 900);
}
</script>

<template>
  <main style="padding: 24px; font-family: Inter, system-ui, sans-serif; display: grid; gap: 12px;">
    <h3 style="margin: 0;">State + events subscriptions</h3>
    <p style="margin: 0; color: #64748b;">Recommended Vue usage with toast.getState(), subscribe(), and subscribeEvents().</p>

    <div style="display: grid; gap: 8px; max-width: 150px;">
      <button @click="pushDuplicate">push duplicate candidate</button>
      <button @click="pushUpdateTarget">push + update</button>
      <button @click="toast.dismissAll()">dismiss all</button>
    </div>

    <p style="margin: 0; color: #334155; font-size: 13px;">
      Visible: <strong>{{ visibleCount }}</strong> |
      Queued: <strong>{{ queuedCount }}</strong>
    </p>

    <pre style="margin: 0; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px; background: #f8fafc; color: #0f172a; font-size: 12px; overflow-x: auto; white-space: pre-wrap; word-break: break-word;">{{ eventLog.join("\\n") || "No events yet" }}</pre>
  </main>

  <ToastContainer />
</template>

<style>
@import url("${VUE_TOASTFLOW_CSS_URL}");

button {
  border: 1px solid #cbd5e1;
  background: #ffffff;
  color: #0f172a;
  border-radius: 8px;
  padding: 8px 12px;
  font-size: 13px;
  cursor: pointer;
}
button:hover {
  background: #f8fafc;
}
</style>
`,
};

export const randomFeedFiles: Record<string, string> = {
  "main.ts": `import { createApp } from "vue";
import App from "./App.vue";
import { createToastflow } from "vue-toastflow";

createApp(App)
  .use(
    createToastflow({
      position: "top-right",
      duration: 4200,
      maxVisible: 4,
      showCreatedAt: true,
    }),
  )
  .mount("#app");
`,
  "App.vue": `<script setup lang="ts">
import { ref } from "vue";
import {
  toast,
  Toast,
  ToastContainer,
  type ToastId,
  type ToastShowInput,
  type ToastStandaloneInstance,
} from "vue-toastflow";

type FeedType = "default" | "success" | "error" | "info" | "warning";

type RandomToastTemplate = {
  type: FeedType;
  title: string;
  description: string;
};

const templates: RandomToastTemplate[] = [
  {
    type: "success",
    title: "Order confirmed",
    description: "Your checkout finished successfully.",
  },
  {
    type: "error",
    title: "Payment failed",
    description: "Card provider rejected this transaction.",
  },
  {
    type: "warning",
    title: "Session expiring",
    description: "Please save your draft in the next minute.",
  },
  {
    type: "info",
    title: "Sync complete",
    description: "Background sync has just finished.",
  },
  {
    type: "default",
    title: "New message",
    description: "You received a new inbox notification.",
  },
];

const savedToasts = ref<ToastStandaloneInstance[]>([]);
let sequence = 0;

function randomTemplate(): RandomToastTemplate {
  const index = Math.floor(Math.random() * templates.length);
  return templates[index];
}

function sendToast() {
  const next = randomTemplate();

  const payload: ToastShowInput = {
    type: next.type,
    title: next.title,
    description: next.description,
  };

  const runtimeId = toast.show(payload);

  const saved: ToastStandaloneInstance = {
    id: "saved-" + String(sequence++),
    type: next.type,
    title: next.title,
    description: next.description + " (runtime id: " + runtimeId.slice(0, 8) + ")",
    createdAt: Date.now(),
    duration: Infinity,
    progressBar: false,
    closeOnClick: false,
    closeButton: true,
    showCreatedAt: true,
  };

  savedToasts.value = [saved, ...savedToasts.value].slice(0, 6);
}

function dismissSaved(id: ToastId) {
  savedToasts.value = savedToasts.value.filter((item) => item.id !== id);
}

function clearSaved() {
  savedToasts.value = [];
  toast.dismissAll();
}
</script>

<template>
  <main style="padding: 24px; font-family: Inter, system-ui, sans-serif; display: grid; gap: 12px;">
    <h3 style="margin: 0;">Random toast feed via Toast component</h3>
    <p style="margin: 0; color: #64748b;">Send random runtime toasts and keep a saved preview list below the buttons.</p>

    <div style="display: grid; gap: 8px; max-width: 150px;">
      <button @click="sendToast">send toast</button>
      <button @click="clearSaved">clear saved + dismiss all</button>
    </div>

    <div v-if="savedToasts.length" style="display: grid; gap: 8px; max-width: 460px;">
      <Toast
        v-for="item in savedToasts"
        :key="item.id"
        :toast="item"
        @dismiss="dismissSaved"
      />
    </div>
    <p v-else style="margin: 0; color: #64748b; font-size: 13px;">
      No saved toasts yet.
    </p>
  </main>

  <ToastContainer />
</template>

<style>
@import url("${VUE_TOASTFLOW_CSS_URL}");

button {
  border: 1px solid #cbd5e1;
  background: #ffffff;
  color: #0f172a;
  border-radius: 8px;
  padding: 8px 12px;
  font-size: 13px;
  cursor: pointer;
}
button:hover {
  background: #f8fafc;
}
</style>
`,
};

export const queueFiles: Record<string, string> = {
  "main.ts": `import { createApp } from "vue";
import App from "./App.vue";
import { createToastflow } from "vue-toastflow";

createApp(App)
  .use(
    createToastflow({
      position: "top-right",
      duration: 5200,
      maxVisible: 2,
      queue: true,
      order: "newest",
    }),
  )
  .mount("#app");
`,
  "App.vue": `<script setup lang="ts">
import { onMounted, onUnmounted, ref } from "vue";
import {
  toast,
  ToastContainer,
  type ToastShowInput,
  type ToastState,
} from "vue-toastflow";

const state = ref<ToastState>(toast.getState());
const seq = ref(1);
let off: (() => void) | null = null;

const templates: ToastShowInput[] = [
  { type: "success", title: "Saved", description: "Project settings updated." },
  { type: "info", title: "Build queued", description: "Runner will start soon." },
  { type: "warning", title: "Low credits", description: "Usage is near plan limit." },
  { type: "error", title: "Webhook failed", description: "Delivery endpoint timed out." },
  { type: "default", title: "New message", description: "You have unread notifications." },
];

function sync(next: ToastState) {
  state.value = next;
}

onMounted(() => {
  off = toast.subscribe(sync);
});

onUnmounted(() => {
  off?.();
});

function randomTemplate(): ToastShowInput {
  const index = Math.floor(Math.random() * templates.length);
  return templates[index];
}

function pushOne() {
  const base = randomTemplate();
  toast.show({
    ...base,
    title: "#" + String(seq.value++) + " " + base.title,
  });
}

function pushBatch() {
  for (let i = 0; i < 6; i += 1) {
    pushOne();
  }
}

function dismissFirstVisible() {
  const first = state.value.toasts[0];
  if (first) {
    toast.dismiss(first.id);
  }
}

function pauseQueueFlow() {
  toast.pauseQueue();
}

function resumeQueueFlow() {
  toast.resumeQueue();
}
</script>

<template>
  <main style="padding: 24px; font-family: Inter, system-ui, sans-serif; display: grid; gap: 12px;">
    <h3 style="margin: 0;">Queue mode and backpressure</h3>
    <p style="margin: 0; color: #64748b;">Keep max 2 visible while overflow stays in queue.</p>

    <div style="display: grid; gap: 8px; max-width: 150px;">
      <button @click="pushOne">push one</button>
      <button @click="pushBatch">push batch (6)</button>
      <button @click="dismissFirstVisible">dismiss first visible</button>
      <button @click="pauseQueueFlow">pause queue</button>
      <button @click="resumeQueueFlow">resume queue</button>
      <button @click="toast.dismissAll()">dismiss all</button>
    </div>

    <p style="margin: 0; color: #334155; font-size: 13px;">
      Visible: <strong>{{ state.toasts.length }}</strong> |
      Queued: <strong>{{ state.queue.length }}</strong>
    </p>

    <pre style="margin: 0; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px; background: #f8fafc; color: #0f172a; font-size: 12px; overflow-x: auto; white-space: pre-wrap; word-break: break-word;">{{ JSON.stringify(state, null, 2) }}</pre>
  </main>

  <ToastContainer />
</template>

<style>
@import url("${VUE_TOASTFLOW_CSS_URL}");

button {
  border: 1px solid #cbd5e1;
  background: #ffffff;
  color: #0f172a;
  border-radius: 8px;
  padding: 8px 12px;
  font-size: 13px;
  cursor: pointer;
}
button:hover {
  background: #f8fafc;
}
</style>
`,
};

export const coreFiles: Record<string, string> = {
  "main.ts": `import { createApp } from "vue";
import App from "./App.vue";

createApp(App).mount("#app");
`,
  "App.vue": `<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from "vue";
import {
  createToastStore,
  type ToastId,
  type ToastState,
  type ToastUpdateInput,
} from "toastflow-core";

const store = createToastStore({
  duration: 5000,
  maxVisible: 3,
  position: "top-right",
});

const state = ref<ToastState>(store.getState());
const lastId = ref<ToastId | null>(null);

let stop: (() => void) | null = null;

onMounted(() => {
  stop = store.subscribe((next) => {
    state.value = next;
  });
});

onUnmounted(() => {
  stop?.();
});

const visibleCount = computed(() => state.value.toasts.length);

function pushCore() {
  lastId.value = store.show({
    type: "default",
    title: "Core toast",
    description: "Created by createToastStore",
  });
}

function updateLast() {
  if (!lastId.value) {
    return;
  }

  const patch: ToastUpdateInput = {
    type: "success",
    title: "Core updated",
    description: "Updated through core API",
  };

  store.update(lastId.value, patch);
}

function pauseLast() {
  if (!lastId.value) {
    return;
  }
  store.pause(lastId.value);
}

function resumeLast() {
  if (!lastId.value) {
    return;
  }
  store.resume(lastId.value);
}
</script>

<template>
  <main style="padding: 24px; font-family: Inter, system-ui, sans-serif; display: grid; gap: 12px;">
    <h3 style="margin: 0;">Core store only</h3>
    <p style="margin: 0; color: #64748b;">No Vue plugin helper required, only createToastStore API.</p>

    <div style="display: flex; gap: 8px; flex-wrap: wrap;">
      <button @click="pushCore">store.show</button>
      <button @click="updateLast">store.update</button>
      <button @click="pauseLast">store.pause</button>
      <button @click="resumeLast">store.resume</button>
      <button @click="store.dismissAll()">store.dismissAll</button>
    </div>

    <p style="margin: 0; color: #334155; font-size: 13px;">
      Visible: <strong>{{ visibleCount }}</strong>
    </p>

    <pre style="margin: 0; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px; background: #f8fafc; color: #0f172a; font-size: 12px; overflow-x: auto; white-space: pre-wrap; word-break: break-word;">{{ JSON.stringify(state, null, 2) }}</pre>
  </main>
</template>

<style>
button {
  border: 1px solid #cbd5e1;
  background: #ffffff;
  color: #0f172a;
  border-radius: 8px;
  padding: 8px 12px;
  font-size: 13px;
  cursor: pointer;
}
button:hover {
  background: #f8fafc;
}
</style>
`,
};
