const VUE_TOASTFLOW_VERSION = __VUE_TOASTFLOW_VERSION__ || "latest";
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

// tracks the most recent toast so we can update/dismiss it
const lastId = ref<ToastId | null>(null);

// full object payload with type included
const showObjectVariant: ToastShowInput = {
  type: "success",
  title: "Object payload",
  description: "toast.show({ type, title, description })",
};

// text-only payload, type comes from options
const showTextVariant: ToastTextInput = {
  title: "Text payload",
  description: "toast.show(textObject, options)",
};

const showTextOptions: ToastShowOptions = {
  type: "success",
  duration: 6500,
};

// each push* shows a different overload of toast.show

function pushShowObject() {
  lastId.value = toast.show(showObjectVariant);
}

function pushTitleAndOptions() {
  lastId.value = toast.show("Title only", {
    type: "info",
    description: "toast.show(title, options) with explicit type",
    duration: 5600,
  });
}

function pushTextObjectAndOptions() {
  lastId.value = toast.show(showTextVariant, showTextOptions);
}

// typed helpers: success / warning / error

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

// patches the last toast in-place
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
  <main class="demo-shell">
    <div>
      <h3>Create methods + typed helpers</h3>
      <p>Use payload object, title + options, text object + options, then patch by id.</p>
    </div>

    <div class="controls-grid">
      <section class="control-column">
        <span class="control-label">Toasts</span>
        <button @click="pushShowObject">show object</button>
        <button @click="pushTitleAndOptions">title + options</button>
        <button @click="pushTextObjectAndOptions">text object + options</button>
        <button @click="pushSuccess">toast.success</button>
        <button @click="pushWarning">toast.warning</button>
        <button @click="pushError">toast.error</button>
      </section>

      <section class="control-column">
        <span class="control-label">Actions</span>
        <button @click="updateLast">update last</button>
        <button @click="dismissLast">dismiss last</button>
        <button @click="toast.dismissAll()">dismiss all</button>
      </section>
    </div>
  </main>

  <ToastContainer />
</template>

<style>
@import url("${VUE_TOASTFLOW_CSS_URL}");

.demo-shell {
  display: grid;
  gap: 12px;
  padding: 24px;
  color: #0f172a;
  font-family: Inter, system-ui, sans-serif;
}
.demo-shell h3 {
  margin: 0;
}
.demo-shell p {
  margin: 0;
  color: #64748b;
}
.controls-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 180px));
  gap: 12px;
  align-items: start;
  max-width: 390px;
}
.control-column {
  display: grid;
  gap: 8px;
}
.control-label {
  color: #475569;
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
}
button {
  border: 1px solid #cbd5e1;
  background: #ffffff;
  color: #0f172a;
  border-radius: 8px;
  padding: 8px 12px;
  font-size: 13px;
  cursor: pointer;
  text-align: left;
}
button:hover {
  background: #f8fafc;
}
@media (max-width: 520px) {
  .controls-grid {
    grid-template-columns: 1fr;
  }
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
      position: "top-right",
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

// fake API - resolves ~70% of the time, rejects otherwise
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

// loading -> success/error toast config
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

// kicks off the loading flow, toast handles the rest
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

// plain info toast to compare with loading behavior
function pushManualInfo() {
  toast.info({
    title: "Background sync",
    description: "This one uses default timer + progress bar.",
  });
}
</script>

<template>
  <main class="demo-shell">
    <div>
      <h3>Async loading workflow</h3>
      <p>One toast id transitions from loading to success/error.</p>
    </div>

    <div class="controls-grid">
      <section class="control-column">
        <span class="control-label">Toasts</span>
        <button @click="runLoadingFlow">run loading flow</button>
        <button @click="pushManualInfo">push info toast</button>
      </section>

      <section class="control-column">
        <span class="control-label">Actions</span>
        <button @click="toast.dismissAll()">dismiss all</button>
      </section>
    </div>
  </main>

  <ToastContainer />
</template>

<style>
@import url("${VUE_TOASTFLOW_CSS_URL}");

.demo-shell {
  display: grid;
  gap: 12px;
  padding: 24px;
  color: #0f172a;
  font-family: Inter, system-ui, sans-serif;
}
.demo-shell h3 {
  margin: 0;
}
.demo-shell p {
  margin: 0;
  color: #64748b;
}
.controls-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 180px));
  gap: 12px;
  align-items: start;
  max-width: 390px;
}
.control-column {
  display: grid;
  gap: 8px;
}
.control-label {
  color: #475569;
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
}
button {
  border: 1px solid #cbd5e1;
  background: #ffffff;
  color: #0f172a;
  border-radius: 8px;
  padding: 8px 12px;
  font-size: 13px;
  cursor: pointer;
  text-align: left;
}
button:hover {
  background: #f8fafc;
}
@media (max-width: 520px) {
  .controls-grid {
    grid-template-columns: 1fr;
  }
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
      position: "top-right",
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

// action buttons attached to the branded toast
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

// dark-themed toast with HTML content and action buttons
const brandedToast: ToastContentInput = {
  title: "<strong>Release 1.2.0</strong>",
  description: "Open <a href='#'>changelog</a> for details.",
  theme: "docs-brand",
  supportHtml: true,
  showCreatedAt: true,
  buttons: brandedButtons,
};

// simple HTML warning without extra theming
const warningHtmlToast: ToastContentInput = {
  title: "<strong>Policy update</strong>",
  description: "Please review <em>Terms of Service</em>.",
  supportHtml: true,
};

// same visual as docs-brand, but using inline css overrides instead of a CSS class
const cssOverridesToast: ToastContentInput = {
  title: "Inline CSS overrides",
  description: "No CSS class needed — styled entirely from code.",
  showCreatedAt: true,
  css: {
    bg: "#c33232",
    borderColor: "#f7ede2",
    color: "#fff7f2",
    descriptionColor: "#fdeae2",
    progressBg: "color-mix(in srgb, #f7ede2 20%, transparent)",
    progressBarBg: "#f7ede2",
    iconColor: "#fff",
  },
};

function pushBranded() {
  toast.info(brandedToast);
}

function pushHtmlWarning() {
  toast.warning(warningHtmlToast);
}

function pushCssOverrides() {
  toast.info(cssOverridesToast);
}
</script>

<template>
  <main class="demo-shell">
    <div>
      <h3>Theming + HTML + CSS overrides</h3>
      <p>Custom accent classes, inline css overrides, and HTML content.</p>
    </div>

    <div class="controls-grid">
      <section class="control-column">
        <span class="control-label">Toasts</span>
        <button @click="pushBranded">push branded (theme)</button>
        <button @click="pushCssOverrides">push css overrides</button>
        <button @click="pushHtmlWarning">push html warning</button>
      </section>

      <section class="control-column">
        <span class="control-label">Actions</span>
        <button @click="toast.dismissAll()">dismiss all</button>
      </section>
    </div>
  </main>

  <ToastContainer />
</template>

<style>
@import url("${VUE_TOASTFLOW_CSS_URL}");

.demo-shell {
  display: grid;
  gap: 12px;
  padding: 24px;
  color: #0f172a;
  font-family: Inter, system-ui, sans-serif;
}
.demo-shell h3 {
  margin: 0;
}
.demo-shell p {
  margin: 0;
  color: #64748b;
}
.controls-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 180px));
  gap: 12px;
  align-items: start;
  max-width: 390px;
}
.control-column {
  display: grid;
  gap: 8px;
}
.control-label {
  color: #475569;
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
}
button {
  border: 1px solid #cbd5e1;
  background: #ffffff;
  color: #0f172a;
  border-radius: 8px;
  padding: 8px 12px;
  font-size: 13px;
  cursor: pointer;
  text-align: left;
}
button:hover {
  background: #f8fafc;
}
@media (max-width: 520px) {
  .controls-grid {
    grid-template-columns: 1fr;
  }
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
      position: "top-right",
      duration: 5000,
      maxVisible: 4,
      progressBar: true,
      width: "420px",
    }),
  )
  .mount("#app");
`,
  "App.vue": `<script setup lang="ts">
import { onBeforeUnmount, ref } from "vue";
import {
  toast,
  ToastContainer,
  type ToastId,
} from "vue-toastflow";

type PreviewVariant =
  | "deploy"
  | "app-notice"
  | "undo-action"
  | "activity-row"
  | "async-upload"
  | "mindblowing";

const toastVariants = ref<Record<string, PreviewVariant>>({});

function rememberVariant(id: ToastId, variant: PreviewVariant) {
  toastVariants.value = {
    ...toastVariants.value,
    [String(id)]: variant,
  };
}

function variantForToast(id: ToastId): PreviewVariant {
  return toastVariants.value[String(id)] ?? "deploy";
}

type MindblowingSignal = "nominal" | "surge" | "recovery";

type MindblowingState = {
  signal: MindblowingSignal;
  latency: number;
  slo: string;
  edge: string;
  actions: number;
  confidence: number;
  region: string;
  intent: string;
  stageIndex: number;
  telemetry: number[];
  stream: string[];
};

const mindblowingStages = [
  "Detect anomaly",
  "Generate rollback",
  "Validate impact",
  "Route operator action",
];

const mindblowingRegions = ["iad-1", "fra-2", "sin-1", "sfo-3"];
const mindblowingIntents = [
  "Rollback ready",
  "Traffic shifting",
  "Cache warming",
  "Policy replay",
];
const mindblowingEvents = [
  "Latency spike isolated",
  "Synthetic probe passed",
  "Rollback diff generated",
  "Edge route rebalanced",
  "Operator action queued",
  "Snapshot signed",
];

const mindblowingInitialState: MindblowingState = {
  signal: "nominal",
  latency: 12,
  slo: "99.98%",
  edge: "Edge",
  actions: 4,
  confidence: 96,
  region: "iad-1",
  intent: "Rollback ready",
  stageIndex: 0,
  telemetry: [82, 46, 94, 64, 76],
  stream: [
    "Live telemetry connected",
    "Recovery plan generated",
    "Operator controls mounted",
  ],
};

const mindblowingStates = ref<Record<string, MindblowingState>>({});
const mindblowingTimers = new Map<string, number>();
const mindblowingTimeouts = new Map<string, number>();

function randomItem<T>(items: readonly T[]): T {
  return items[Math.floor(Math.random() * items.length)] as T;
}

function nextTelemetry(values: number[]) {
  return values.map(function (value, index) {
    const drift = Math.round(Math.random() * 30) - 14;
    const bias = index % 2 === 0 ? 5 : -2;

    return Math.min(96, Math.max(28, value + drift + bias));
  });
}

function nextMindblowingState(previous: MindblowingState): MindblowingState {
  const signalRoll = Math.random();
  const signal =
    signalRoll > 0.78 ? "surge" : signalRoll < 0.26 ? "recovery" : "nominal";
  const latency =
    signal === "surge"
      ? 28 + Math.round(Math.random() * 42)
      : 8 + Math.round(Math.random() * 20);
  const slo =
    signal === "surge"
      ? (99.8 + Math.random() * 0.18).toFixed(2) + "%"
      : (99.95 + Math.random() * 0.04).toFixed(2) + "%";

  return {
    signal,
    latency,
    slo,
    edge: signal === "surge" ? "Surge" : "Edge",
    actions: Math.min(
      9,
      Math.max(1, previous.actions + Math.round(Math.random() * 2) - 1),
    ),
    confidence: Math.min(
      99,
      Math.max(82, previous.confidence + Math.round(Math.random() * 6) - 3),
    ),
    region: randomItem(mindblowingRegions),
    intent: randomItem(mindblowingIntents),
    stageIndex: (previous.stageIndex + 1) % mindblowingStages.length,
    telemetry: nextTelemetry(previous.telemetry),
    stream: [randomItem(mindblowingEvents), ...previous.stream].slice(0, 3),
  };
}

function mindblowingForToast(id: ToastId): MindblowingState {
  return mindblowingStates.value[String(id)] ?? mindblowingInitialState;
}

function stopMindblowingFeed(key: string) {
  const timer = mindblowingTimers.get(key);
  const timeout = mindblowingTimeouts.get(key);

  if (timer !== undefined) {
    window.clearInterval(timer);
    mindblowingTimers.delete(key);
  }

  if (timeout !== undefined) {
    window.clearTimeout(timeout);
    mindblowingTimeouts.delete(key);
  }

  const nextStates = { ...mindblowingStates.value };
  delete nextStates[key];
  mindblowingStates.value = nextStates;
}

function startMindblowingFeed(id: ToastId, seed?: Partial<MindblowingState>) {
  const key = String(id);

  stopMindblowingFeed(key);

  mindblowingStates.value = {
    ...mindblowingStates.value,
    [key]: {
      ...mindblowingInitialState,
      ...seed,
    },
  };

  const timer = window.setInterval(function () {
    const current = mindblowingStates.value[key];

    if (!current) {
      return;
    }

    mindblowingStates.value = {
      ...mindblowingStates.value,
      [key]: nextMindblowingState(current),
    };
  }, 620);

  const timeout = window.setTimeout(function () {
    stopMindblowingFeed(key);
  }, 16000);

  mindblowingTimers.set(key, timer);
  mindblowingTimeouts.set(key, timeout);
}

function amplifyMindblowing(id: ToastId) {
  const key = String(id);
  const current = mindblowingForToast(id);

  mindblowingStates.value = {
    ...mindblowingStates.value,
    [key]: {
      ...current,
      signal: "surge",
      latency: Math.min(88, current.latency + 24),
      actions: Math.min(9, current.actions + 3),
      confidence: Math.min(99, current.confidence + 4),
      intent: "Simulation branch",
      stageIndex: (current.stageIndex + 1) % mindblowingStages.length,
      telemetry: current.telemetry.map(function (level) {
        return Math.min(98, level + 18);
      }),
      stream: ["Simulation branch forked", ...current.stream].slice(0, 3),
    },
  };
}

onBeforeUnmount(function () {
  mindblowingTimers.forEach(function (timer) {
    window.clearInterval(timer);
  });
  mindblowingTimeouts.forEach(function (timeout) {
    window.clearTimeout(timeout);
  });
});

function showDeployToast() {
  const id = toast.success({
    title: "Deploy approved",
    description: "Build #4821 is ready for production.",
    duration: 7000,
    progressBar: true,
    buttons: {
      alignment: "bottom-right",
      buttons: [
        {
          id: "details",
          label: "View details",
          dismissAfterClick: true,
        },
      ],
    },
  });

  rememberVariant(id, "deploy");
}

function showAppNoticeToast() {
  const id = toast.error({
    title: "Payment failed",
    description: "The design-system notice keeps the product UI language.",
    duration: 9000,
    progressBar: false,
  });

  rememberVariant(id, "app-notice");
}

function showUndoActionToast() {
  const id = toast.info({
    title: "Project archived",
    description: "Undo the archive action or open the project history.",
    duration: 8000,
    buttons: {
      alignment: "bottom-right",
      buttons: [
        {
          id: "undo",
          label: "Undo",
          dismissAfterClick: true,
          onClick() {
            const restoredId = toast.success({
              title: "Archive reverted",
              description: "The action panel rendered the follow-up state.",
            });

            rememberVariant(restoredId, "undo-action");
          },
        },
        {
          id: "history",
          label: "History",
          dismissAfterClick: true,
        },
      ],
    },
  });

  rememberVariant(id, "undo-action");
}

function showActivityRowToast() {
  const id = toast.warning({
    title: "Reviewer mentioned you",
    description: "Open the pull request or mark the notification as done.",
    showCreatedAt: true,
    duration: 10000,
    buttons: {
      alignment: "bottom-left",
      buttons: [
        {
          id: "open",
          label: "Open PR",
          dismissAfterClick: true,
        },
        {
          id: "done",
          label: "Mark done",
          dismissAfterClick: true,
        },
      ],
    },
  });

  rememberVariant(id, "activity-row");
}

function showAsyncUploadToast() {
  const upload = toast.loading(
    new Promise<string>(function (resolve) {
      setTimeout(function () {
        resolve("asset-banner.png");
      }, 1400);
    }),
    {
      loading: {
        title: "Uploading asset",
        description: "Preparing the custom notification payload.",
        progressBar: false,
      },
      success(fileName) {
        return {
          title: "Upload complete",
          description: fileName,
          progressBar: true,
        };
      },
      error(error) {
        return {
          title: "Upload failed",
          description: error instanceof Error ? error.message : "Try again.",
          progressBar: true,
        };
      },
    },
  );

  rememberVariant(upload.toastId, "async-upload");
  void upload.catch(function () {});
}

function showMindblowingToast() {
  let id: ToastId;

  id = toast.show({
    type: "custom",
    title: "Autonomous launch matrix",
    description: "Live telemetry, generated recovery plan, and operator controls in one toast.",
    duration: 14000,
    progressBar: true,
    showCreatedAt: true,
    buttons: {
      alignment: "bottom-right",
      buttons: [
        {
          id: "simulate",
          label: "Simulate",
          dismissAfterClick: false,
          onClick() {
            amplifyMindblowing(id);

            const followUpId = toast.success({
              title: "Simulation complete",
              description: "The toast forked a new recovery stream from the action button.",
              duration: 9000,
              progressBar: true,
              showCreatedAt: true,
            });

            rememberVariant(followUpId, "mindblowing");
            startMindblowingFeed(followUpId, {
              signal: "recovery",
              intent: "Rollback replay",
              stageIndex: 2,
              stream: [
                "Simulation branch forked",
                "Rollback replay running",
                "Blast radius reduced",
              ],
            });
          },
        },
        {
          id: "snapshot",
          label: "Snapshot",
          dismissAfterClick: true,
          onClick() {
            const snapshotId = toast.info({
              title: "Snapshot exported",
              description: "A second headless toast picked up the live command state.",
              duration: 9000,
              progressBar: true,
              showCreatedAt: true,
            });

            rememberVariant(snapshotId, "mindblowing");
            startMindblowingFeed(snapshotId, {
              signal: "recovery",
              intent: "Audit replay",
              actions: 2,
              confidence: 99,
              stream: [
                "Snapshot exported",
                "Audit trail sealed",
                "Replay controls mounted",
              ],
            });
            stopMindblowingFeed(String(id));
          },
        },
      ],
    },
  });

  rememberVariant(id, "mindblowing");
  startMindblowingFeed(id);
}
</script>

<template>
  <main class="demo-shell">
    <div>
      <h3>Headless slot rendering</h3>
      <p>Each button sends a Toastflow toast, while the slot renders a different notification UI.</p>
    </div>

    <div class="controls-grid">
      <section class="control-column">
        <span class="control-label">Toasts</span>
        <button @click="showActivityRowToast">Activity row</button>
        <button @click="showAppNoticeToast">App notice</button>
        <button @click="showAsyncUploadToast">Async upload</button>
        <button @click="showMindblowingToast">Mindblowing</button>
        <button @click="showDeployToast">Deploy</button>
        <button @click="showUndoActionToast">Undo action</button>
      </section>

      <section class="control-column">
        <span class="control-label">Actions</span>
        <button @click="toast.dismissAll()">Dismiss all</button>
      </section>
    </div>
  </main>

  <ToastContainer v-slot="{ toast: item, ui }">
    <div v-bind="ui.getWrapperProps()">
      <article
        v-if="variantForToast(item.id) === 'deploy'"
        v-bind="ui.getRootProps({ class: 'deploy-toast' })"
      >
        <header class="deploy-toast__header">
          <span class="deploy-toast__badge">
            <span aria-hidden="true">R</span>
            Production
          </span>

          <button
            v-bind="
              ui.getCloseProps({
                class: 'icon-button deploy-toast__close',
                'aria-label': 'Close toast',
              })
            "
          >
            X
          </button>
        </header>

        <div class="deploy-toast__title-row">
          <strong>{{ item.title }}</strong>
          <span>v2.7.4</span>
        </div>

        <p v-if="item.description">{{ item.description }}</p>

        <ol class="deploy-toast__pipeline" aria-hidden="true">
          <li>Build</li>
          <li>Tests</li>
          <li>Deploy</li>
        </ol>

        <div
          v-if="ui.buttons.has"
          v-bind="ui.buttons.getGroupProps({ class: 'deploy-toast__actions' })"
        >
          <button
            v-for="button in ui.buttons.items"
            :key="button.id"
            v-bind="ui.getButtonProps(button, { class: 'deploy-toast__button' })"
          >
            {{ button.label }}
          </button>
        </div>

        <div
          v-if="ui.progress.show"
          v-bind="ui.progress.getTrackProps({ class: 'deploy-toast__progress' })"
        >
          <div v-bind="ui.progress.getBarProps({ class: 'deploy-toast__bar' })" />
        </div>
      </article>

      <section
        v-else-if="variantForToast(item.id) === 'app-notice'"
        v-bind="
          ui.getRootProps({
            class: ['app-notice', 'app-notice--' + item.type],
          })
        "
      >
        <div
          v-if="ui.icon.show"
          v-bind="ui.icon.wrapperProps"
          class="app-notice__icon"
        >
          <component :is="ui.icon.component" v-bind="ui.icon.componentProps" />
        </div>

        <div class="app-notice__content">
          <strong>{{ item.title }}</strong>
          <p v-if="item.description">{{ item.description }}</p>
        </div>

        <button
          v-bind="
            ui.getCloseProps({
              class: 'icon-button app-notice__close',
              'aria-label': 'Close toast',
            })
          "
        >
          X
        </button>
      </section>

      <article
        v-else-if="variantForToast(item.id) === 'undo-action'"
        v-bind="ui.getRootProps({ class: 'undo-toast' })"
      >
        <button
          v-bind="
            ui.getCloseProps({
              class: 'icon-button undo-toast__close',
              'aria-label': 'Close toast',
            })
          "
        >
          X
        </button>

        <div class="undo-toast__icon" aria-hidden="true">A</div>

        <div class="undo-toast__content">
          <span>Reversible action</span>
          <strong>{{ item.title }}</strong>
          <p v-if="item.description">{{ item.description }}</p>

          <div
            v-if="ui.buttons.has"
            v-bind="ui.buttons.getGroupProps({ class: 'undo-toast__actions' })"
          >
            <button
              v-for="(button, index) in ui.buttons.items"
              :key="button.id"
              v-bind="
                ui.getButtonProps(button, {
                  class: [
                    'undo-toast__button',
                    index === 0 && 'undo-toast__button--primary',
                  ],
                })
              "
            >
              {{ button.label }}
            </button>
          </div>
        </div>
      </article>

      <article
        v-else-if="variantForToast(item.id) === 'activity-row'"
        v-bind="ui.getRootProps({ class: 'activity-toast' })"
      >
        <div class="activity-toast__timeline" aria-hidden="true">
          <span></span>
        </div>

        <div class="activity-toast__body">
          <header>
            <span>Review queue</span>
            <time
              v-if="ui.createdAt.show"
              :aria-label="ui.createdAt.ariaLabel || undefined"
            >
              {{ ui.createdAt.formatted }}
            </time>
            <button
              v-bind="
                ui.getCloseProps({
                  class: 'icon-button activity-toast__close',
                  'aria-label': 'Close toast',
                })
              "
            >
              X
            </button>
          </header>

          <strong>{{ item.title }}</strong>
          <p v-if="item.description">{{ item.description }}</p>

          <nav
            v-if="ui.buttons.has"
            v-bind="
              ui.buttons.getGroupProps({
                class: 'activity-toast__actions',
              })
            "
          >
            <button
              v-for="button in ui.buttons.items"
              :key="button.id"
              v-bind="
                ui.getButtonProps(button, {
                  class: 'activity-toast__button',
                })
              "
            >
              {{ button.label }}
            </button>
          </nav>
        </div>
      </article>

      <article
        v-else-if="variantForToast(item.id) === 'mindblowing'"
        v-bind="ui.getRootProps({ class: 'mindblowing-toast' })"
        :data-signal="mindblowingForToast(item.id).signal"
      >
        <div class="mindblowing-toast__grid" aria-hidden="true">
          <span></span>
          <span></span>
          <span></span>
        </div>

        <header class="mindblowing-toast__header">
          <div class="mindblowing-toast__orb" aria-hidden="true">
            <span class="mindblowing-toast__orbit mindblowing-toast__orbit--one"></span>
            <span class="mindblowing-toast__orbit mindblowing-toast__orbit--two"></span>
            <span class="mindblowing-toast__core">TF</span>
          </div>

          <div class="mindblowing-toast__headline">
            <span>{{ mindblowingForToast(item.id).intent }}</span>
            <strong>{{ item.title }}</strong>
            <time
              v-if="ui.createdAt.show"
              :aria-label="ui.createdAt.ariaLabel || undefined"
            >
              {{ ui.createdAt.formatted }}
            </time>
          </div>

          <button
            @click="stopMindblowingFeed(String(item.id))"
            v-bind="
              ui.getCloseProps({
                class: 'icon-button mindblowing-toast__close',
                'aria-label': 'Close toast',
              })
            "
          >
            X
          </button>
        </header>

        <p v-if="item.description">{{ item.description }}</p>

        <div class="mindblowing-toast__signal">
          <span>{{ mindblowingForToast(item.id).signal }}</span>
          <span>{{ mindblowingForToast(item.id).region }}</span>
          <span>{{ mindblowingForToast(item.id).confidence }}% confidence</span>
        </div>

        <div class="mindblowing-toast__telemetry" aria-hidden="true">
          <span
            v-for="(level, index) in mindblowingForToast(item.id).telemetry"
            :key="index"
            :style="{ '--level': level + '%' }"
          ></span>
        </div>

        <div class="mindblowing-toast__metrics">
          <span><strong>{{ mindblowingForToast(item.id).slo }}</strong> SLO</span>
          <span>
            <strong>{{ mindblowingForToast(item.id).latency }}ms</strong>
            {{ mindblowingForToast(item.id).edge }}
          </span>
          <span>
            <strong>{{ mindblowingForToast(item.id).actions }}</strong>
            Actions
          </span>
        </div>

        <ol class="mindblowing-toast__plan">
          <li
            v-for="(stage, index) in mindblowingStages"
            :key="stage"
            :class="{
              'is-active': index === mindblowingForToast(item.id).stageIndex,
              'is-done': index < mindblowingForToast(item.id).stageIndex,
            }"
          >
            {{ stage }}
          </li>
        </ol>

        <ul class="mindblowing-toast__stream">
          <li
            v-for="(event, index) in mindblowingForToast(item.id).stream"
            :key="event + index"
          >
            {{ event }}
          </li>
        </ul>

        <div
          v-if="ui.buttons.has"
          v-bind="ui.buttons.getGroupProps({ class: 'mindblowing-toast__actions' })"
        >
          <button
            v-for="button in ui.buttons.items"
            :key="button.id"
            v-bind="
              ui.getButtonProps(button, {
                class: 'mindblowing-toast__button',
              })
            "
          >
            {{ button.label }}
          </button>
        </div>

        <div
          v-if="ui.progress.show"
          v-bind="ui.progress.getTrackProps({ class: 'mindblowing-toast__progress' })"
        >
          <div
            v-bind="ui.progress.getBarProps({ class: 'mindblowing-toast__bar' })"
          />
        </div>
      </article>

      <article
        v-else
        v-bind="ui.getRootProps({ class: 'upload-toast' })"
        :data-state="item.type"
      >
        <header class="upload-toast__header">
          <div class="upload-toast__file" aria-hidden="true">
            {{ item.type === "loading" ? "..." : "OK" }}
          </div>

          <div class="upload-toast__meta">
            <span>Asset pipeline</span>
            <strong>{{ item.description || item.title }}</strong>
          </div>

          <button
            v-bind="
              ui.getCloseProps({
                class: 'icon-button upload-toast__close',
                'aria-label': 'Close toast',
              })
            "
          >
            X
          </button>
        </header>

        <p>
          {{
            item.type === "loading"
              ? item.title
              : "Ready for publishing and CDN invalidation."
          }}
        </p>

        <div
          v-if="item.type === 'loading'"
          class="upload-toast__indeterminate"
          aria-hidden="true"
        >
          <span></span>
        </div>

        <div
          v-else-if="ui.progress.show"
          v-bind="ui.progress.getTrackProps({ class: 'upload-toast__progress' })"
        >
          <div v-bind="ui.progress.getBarProps({ class: 'upload-toast__bar' })" />
        </div>
      </article>
    </div>
  </ToastContainer>
</template>

<style>
@import url("${VUE_TOASTFLOW_CSS_URL}");

.demo-shell {
  display: grid;
  gap: 12px;
  padding: 24px;
  color: #0f172a;
  font-family: Inter, system-ui, sans-serif;
}

.demo-shell h3 {
  margin: 0;
}

.demo-shell p {
  margin: 0;
  color: #64748b;
}

.controls-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 180px));
  gap: 12px;
  align-items: start;
  max-width: 390px;
}

.control-column {
  display: grid;
  gap: 8px;
}

.control-label {
  color: #475569;
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
}

.controls-grid button {
  border: 1px solid #cbd5e1;
  background: #ffffff;
  color: #0f172a;
  border-radius: 8px;
  padding: 8px 12px;
  font-size: 13px;
  cursor: pointer;
  text-align: left;
}

.controls-grid button:hover {
  background: #f8fafc;
}

.deploy-toast,
.app-notice,
.undo-toast,
.activity-toast,
.mindblowing-toast,
.upload-toast {
  width: 100%;
  box-sizing: border-box;
  color: #111827;
  font-family: inherit;
  pointer-events: auto;
}

.icon-button {
  display: grid;
  width: 28px;
  height: 28px;
  place-items: center;
  border: 0;
  background: transparent;
  color: inherit;
  cursor: pointer;
  font-size: 12px;
  font-weight: 800;
}

.deploy-toast {
  display: grid;
  gap: 12px;
  border: 1px solid #bbf7d0;
  border-radius: 8px;
  background: #ffffff;
  box-shadow: 0 18px 42px rgb(15 23 42 / 14%);
  padding: 14px;
}

.deploy-toast__header,
.deploy-toast__title-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.deploy-toast__badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  border-radius: 999px;
  background: #dcfce7;
  color: #166534;
  font-size: 12px;
  font-weight: 700;
  line-height: 1;
  padding: 6px 9px;
}

.deploy-toast__badge span {
  display: grid;
  width: 16px;
  height: 16px;
  place-items: center;
  border-radius: 999px;
  background: #166534;
  color: #ffffff;
  font-size: 10px;
}

.deploy-toast__title-row strong {
  font-size: 15px;
  line-height: 1.25;
}

.deploy-toast__title-row span {
  color: #16a34a;
  font-size: 12px;
  font-weight: 700;
}

.deploy-toast p,
.app-notice p,
.undo-toast p,
.activity-toast p,
.mindblowing-toast p,
.upload-toast p {
  margin: 0;
  font-size: 13px;
  line-height: 1.4;
}

.deploy-toast p {
  color: #4b5563;
}

.deploy-toast__pipeline {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 6px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.deploy-toast__pipeline li {
  border-radius: 6px;
  background: #f0fdf4;
  color: #15803d;
  font-size: 11px;
  font-weight: 700;
  padding: 7px 8px;
  text-align: center;
}

.deploy-toast__actions,
.undo-toast__actions,
.activity-toast__actions,
.mindblowing-toast__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.deploy-toast__actions {
  justify-content: flex-end;
}

.deploy-toast__button {
  border: 0;
  border-radius: 6px;
  background: #166534;
  color: #ffffff;
  cursor: pointer;
  font-size: 12px;
  font-weight: 700;
  padding: 8px 10px;
}

.deploy-toast__progress,
.upload-toast__progress {
  height: 4px;
  border-radius: 999px;
  background: #dcfce7;
  overflow: hidden;
}

.deploy-toast__bar {
  height: 100%;
  background: #22c55e;
}

.app-notice {
  display: grid;
  grid-template-columns: 38px minmax(0, 1fr) auto;
  gap: 12px;
  align-items: start;
  border: 1px solid #fecaca;
  border-left: 4px solid #dc2626;
  border-radius: 8px;
  background: #ffffff;
  box-shadow: 0 16px 36px rgb(127 29 29 / 16%);
  padding: 14px;
}

.app-notice--success {
  border-color: #86efac;
  border-left-color: #16a34a;
}

.app-notice__icon {
  display: grid;
  width: 38px;
  height: 38px;
  place-items: center;
  border-radius: 8px;
  background: #fee2e2;
  color: #dc2626;
  font-size: 22px;
}

.app-notice--success .app-notice__icon {
  background: #dcfce7;
  color: #16a34a;
}

.app-notice__content {
  min-width: 0;
}

.app-notice__content strong {
  display: block;
  font-size: 15px;
  line-height: 1.25;
}

.app-notice__content p {
  margin-top: 5px;
  color: #4b5563;
}

.app-notice__close {
  color: #991b1b;
}

.undo-toast {
  position: relative;
  display: grid;
  grid-template-columns: 52px minmax(0, 1fr);
  gap: 12px;
  border: 1px solid #fed7aa;
  border-radius: 8px;
  background: #fff7ed;
  box-shadow: 0 14px 34px rgb(124 45 18 / 16%);
  padding: 14px;
}

.undo-toast__close {
  position: absolute;
  top: 8px;
  right: 8px;
  color: #9a3412;
}

.undo-toast__icon {
  display: grid;
  width: 52px;
  height: 52px;
  place-items: center;
  border-radius: 8px;
  background: #9a3412;
  color: #ffffff;
  font-size: 22px;
  font-weight: 800;
}

.undo-toast__content {
  min-width: 0;
  padding-right: 28px;
}

.undo-toast__content > span {
  color: #c2410c;
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.04em;
  line-height: 1;
  text-transform: uppercase;
}

.undo-toast__content strong {
  display: block;
  margin-top: 5px;
  font-size: 16px;
  line-height: 1.2;
}

.undo-toast__content p {
  margin-top: 5px;
  color: #7c2d12;
}

.undo-toast__actions {
  margin-top: 12px;
}

.undo-toast__button {
  border: 1px solid #fdba74;
  border-radius: 6px;
  background: #ffffff;
  color: #9a3412;
  cursor: pointer;
  font-size: 12px;
  font-weight: 700;
  padding: 7px 10px;
}

.undo-toast__button--primary {
  border-color: #9a3412;
  background: #9a3412;
  color: #ffffff;
}

.activity-toast {
  display: grid;
  grid-template-columns: 18px minmax(0, 1fr);
  gap: 12px;
  border: 1px solid #374151;
  border-radius: 8px;
  background: #111827;
  color: #f9fafb;
  box-shadow: 0 18px 40px rgb(0 0 0 / 24%);
  padding: 12px;
}

.activity-toast__timeline {
  position: relative;
  display: flex;
  justify-content: center;
}

.activity-toast__timeline::before {
  position: absolute;
  top: 18px;
  bottom: 0;
  width: 1px;
  background: #4b5563;
  content: "";
}

.activity-toast__timeline span {
  position: relative;
  width: 10px;
  height: 10px;
  margin-top: 5px;
  border-radius: 999px;
  background: #f59e0b;
  box-shadow: 0 0 0 4px rgb(245 158 11 / 18%);
}

.activity-toast__body {
  min-width: 0;
}

.activity-toast__body header {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #9ca3af;
  font-size: 11px;
  line-height: 1;
}

.activity-toast__body header > span {
  color: #fbbf24;
  font-weight: 800;
  text-transform: uppercase;
}

.activity-toast__close {
  width: 22px;
  height: 22px;
  margin-left: auto;
  color: #9ca3af;
}

.activity-toast strong {
  display: block;
  margin-top: 8px;
  font-size: 15px;
  line-height: 1.25;
}

.activity-toast p {
  margin-top: 5px;
  color: #d1d5db;
}

.activity-toast__actions {
  margin-top: 12px;
}

.activity-toast__button {
  border: 1px solid #4b5563;
  border-radius: 6px;
  background: #1f2937;
  color: #f9fafb;
  cursor: pointer;
  font-size: 12px;
  font-weight: 700;
  padding: 7px 9px;
}

.mindblowing-toast {
  position: relative;
  display: grid;
  gap: 13px;
  overflow: hidden;
  border: 1px solid rgb(125 211 252 / 48%);
  border-radius: 8px;
  background:
    radial-gradient(circle at 16% 18%, rgb(56 189 248 / 36%), transparent 26%),
    radial-gradient(circle at 92% 8%, rgb(244 114 182 / 34%), transparent 30%),
    linear-gradient(135deg, #020617 0%, #111827 48%, #172554 100%);
  color: #e0f2fe;
  box-shadow:
    0 22px 56px rgb(2 6 23 / 34%),
    inset 0 0 0 1px rgb(255 255 255 / 8%);
  padding: 14px;
  transition:
    border-color 180ms ease,
    box-shadow 180ms ease;
}

.mindblowing-toast[data-signal="surge"] {
  border-color: rgb(251 113 133 / 72%);
  box-shadow:
    0 24px 62px rgb(244 63 94 / 24%),
    inset 0 0 0 1px rgb(255 255 255 / 10%);
}

.mindblowing-toast[data-signal="recovery"] {
  border-color: rgb(52 211 153 / 66%);
  box-shadow:
    0 24px 62px rgb(16 185 129 / 20%),
    inset 0 0 0 1px rgb(255 255 255 / 10%);
}

.mindblowing-toast__grid {
  position: absolute;
  inset: 0;
  opacity: 0.5;
  pointer-events: none;
  background-image:
    linear-gradient(rgb(125 211 252 / 14%) 1px, transparent 1px),
    linear-gradient(90deg, rgb(125 211 252 / 12%) 1px, transparent 1px);
  background-size: 24px 24px;
  mask-image: linear-gradient(to bottom, #000, transparent 84%);
}

.mindblowing-toast__grid span {
  position: absolute;
  width: 90px;
  height: 1px;
  background: linear-gradient(90deg, transparent, #67e8f9, transparent);
  animation: mindblowing-scan 2.7s linear infinite;
}

.mindblowing-toast__grid span:nth-child(1) {
  top: 28px;
  left: -90px;
}

.mindblowing-toast__grid span:nth-child(2) {
  top: 96px;
  left: -120px;
  animation-delay: 0.55s;
}

.mindblowing-toast__grid span:nth-child(3) {
  top: 164px;
  left: -150px;
  animation-delay: 1.1s;
}

.mindblowing-toast__header,
.mindblowing-toast__signal,
.mindblowing-toast__metrics,
.mindblowing-toast__plan,
.mindblowing-toast__stream,
.mindblowing-toast__actions,
.mindblowing-toast__progress,
.mindblowing-toast p {
  position: relative;
  z-index: 1;
}

.mindblowing-toast__header {
  display: grid;
  grid-template-columns: 62px minmax(0, 1fr) auto;
  gap: 12px;
  align-items: center;
}

.mindblowing-toast__orb {
  position: relative;
  display: grid;
  width: 62px;
  height: 62px;
  place-items: center;
}

.mindblowing-toast__core {
  display: grid;
  width: 34px;
  height: 34px;
  place-items: center;
  border-radius: 999px;
  background: linear-gradient(135deg, #22d3ee, #a78bfa 55%, #f472b6);
  color: #020617;
  font-size: 11px;
  font-weight: 900;
  box-shadow: 0 0 28px rgb(34 211 238 / 72%);
}

.mindblowing-toast__orbit {
  position: absolute;
  border: 1px solid rgb(125 211 252 / 52%);
  border-radius: 999px;
}

.mindblowing-toast__orbit--one {
  width: 58px;
  height: 36px;
  transform: rotate(24deg);
  animation: mindblowing-orbit-one 5s linear infinite;
}

.mindblowing-toast__orbit--two {
  width: 36px;
  height: 58px;
  transform: rotate(-28deg);
  animation: mindblowing-orbit-two 4s linear infinite;
}

.mindblowing-toast__headline {
  min-width: 0;
}

.mindblowing-toast__headline > span {
  color: #67e8f9;
  font-size: 11px;
  font-weight: 900;
  letter-spacing: 0;
  text-transform: uppercase;
}

.mindblowing-toast__headline strong {
  display: block;
  margin-top: 4px;
  overflow: hidden;
  color: #ffffff;
  font-size: 15px;
  line-height: 1.2;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.mindblowing-toast__headline time {
  display: block;
  margin-top: 5px;
  color: #bae6fd;
  font-size: 11px;
}

.mindblowing-toast__close {
  color: #e0f2fe;
}

.mindblowing-toast p {
  color: #bae6fd;
}

.mindblowing-toast__signal {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 7px;
}

.mindblowing-toast__signal span {
  overflow: hidden;
  border: 1px solid rgb(125 211 252 / 26%);
  border-radius: 999px;
  background: rgb(2 6 23 / 42%);
  color: #e0f2fe;
  font-size: 10px;
  font-weight: 800;
  padding: 6px 8px;
  text-align: center;
  text-overflow: ellipsis;
  text-transform: uppercase;
  white-space: nowrap;
}

.mindblowing-toast__telemetry {
  position: relative;
  z-index: 1;
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 7px;
  height: 36px;
  align-items: end;
}

.mindblowing-toast__telemetry span {
  display: block;
  height: var(--level);
  border-radius: 999px 999px 4px 4px;
  background: linear-gradient(180deg, #f0abfc, #22d3ee);
  box-shadow: 0 0 18px rgb(34 211 238 / 42%);
  animation: mindblowing-pulse 1.6s ease-in-out infinite alternate;
  transition: height 220ms ease;
}

.mindblowing-toast__telemetry span:nth-child(2n) {
  animation-delay: 0.22s;
}

.mindblowing-toast__metrics {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 7px;
}

.mindblowing-toast__metrics span {
  display: grid;
  gap: 2px;
  border: 1px solid rgb(125 211 252 / 24%);
  border-radius: 7px;
  background: rgb(15 23 42 / 68%);
  color: #bae6fd;
  font-size: 10px;
  padding: 8px;
}

.mindblowing-toast__metrics strong {
  color: #ffffff;
  font-size: 14px;
  line-height: 1;
}

.mindblowing-toast__plan {
  display: grid;
  gap: 6px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.mindblowing-toast__plan li {
  border-radius: 6px;
  background: rgb(15 23 42 / 62%);
  color: #dbeafe;
  font-size: 11px;
  font-weight: 700;
  padding: 7px 9px;
  transition:
    background 180ms ease,
    color 180ms ease,
    transform 180ms ease;
}

.mindblowing-toast__plan li::before {
  margin-right: 7px;
  color: #67e8f9;
  content: ">";
}

.mindblowing-toast__plan li.is-done {
  color: #a7f3d0;
}

.mindblowing-toast__plan li.is-active {
  background: linear-gradient(135deg, rgb(14 165 233 / 36%), rgb(217 70 239 / 26%));
  color: #ffffff;
  transform: translateX(3px);
}

.mindblowing-toast__stream {
  display: grid;
  gap: 5px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.mindblowing-toast__stream li {
  overflow: hidden;
  border-left: 2px solid rgb(103 232 249 / 74%);
  color: #dbeafe;
  font-size: 11px;
  font-weight: 700;
  line-height: 1.25;
  padding-left: 8px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.mindblowing-toast[data-signal="surge"] .mindblowing-toast__stream li {
  border-left-color: #fb7185;
}

.mindblowing-toast[data-signal="recovery"] .mindblowing-toast__stream li {
  border-left-color: #34d399;
}

.mindblowing-toast__actions {
  justify-content: flex-end;
}

.mindblowing-toast__button {
  border: 1px solid rgb(125 211 252 / 32%);
  border-radius: 6px;
  background: rgb(14 165 233 / 16%);
  color: #e0f2fe;
  cursor: pointer;
  font-size: 12px;
  font-weight: 800;
  padding: 8px 10px;
}

.mindblowing-toast__button:hover {
  background: rgb(14 165 233 / 26%);
}

.mindblowing-toast__progress {
  height: 4px;
  border-radius: 999px;
  background: rgb(125 211 252 / 18%);
  overflow: hidden;
}

.mindblowing-toast__bar {
  height: 100%;
  background: linear-gradient(90deg, #22d3ee, #a78bfa, #f472b6);
}

.upload-toast {
  display: grid;
  gap: 12px;
  border: 1px solid #bfdbfe;
  border-radius: 8px;
  background: #eff6ff;
  box-shadow: 0 14px 34px rgb(30 64 175 / 16%);
  padding: 14px;
}

.upload-toast[data-state="success"] {
  border-color: #a7f3d0;
  background: #ecfdf5;
}

.upload-toast__header {
  display: grid;
  grid-template-columns: 46px minmax(0, 1fr) auto;
  gap: 10px;
  align-items: center;
}

.upload-toast__file {
  display: grid;
  width: 46px;
  height: 46px;
  place-items: center;
  border-radius: 8px;
  background: #1d4ed8;
  color: #ffffff;
  font-size: 12px;
  font-weight: 800;
}

.upload-toast[data-state="success"] .upload-toast__file {
  background: #047857;
}

.upload-toast__meta {
  min-width: 0;
}

.upload-toast__meta span {
  color: #1d4ed8;
  font-size: 11px;
  font-weight: 800;
  text-transform: uppercase;
}

.upload-toast[data-state="success"] .upload-toast__meta span {
  color: #047857;
}

.upload-toast__meta strong {
  display: block;
  overflow: hidden;
  color: #111827;
  font-size: 14px;
  line-height: 1.25;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.upload-toast p {
  color: #1e3a8a;
}

.upload-toast[data-state="success"] p {
  color: #065f46;
}

.upload-toast__close {
  color: #1d4ed8;
}

.upload-toast__indeterminate {
  height: 5px;
  border-radius: 999px;
  background: #dbeafe;
  overflow: hidden;
}

.upload-toast__indeterminate span {
  display: block;
  width: 42%;
  height: 100%;
  border-radius: inherit;
  background: #2563eb;
  animation: upload-slide 1.1s ease-in-out infinite;
}

.upload-toast__progress {
  background: #a7f3d0;
}

.upload-toast__bar {
  height: 100%;
  background: #10b981;
}

@keyframes upload-slide {
  0% {
    transform: translateX(-110%);
  }
  100% {
    transform: translateX(250%);
  }
}

@keyframes mindblowing-scan {
  to {
    transform: translateX(620px);
  }
}

@keyframes mindblowing-orbit-one {
  to {
    transform: rotate(384deg);
  }
}

@keyframes mindblowing-orbit-two {
  to {
    transform: rotate(-388deg);
  }
}

@keyframes mindblowing-pulse {
  from {
    filter: saturate(0.9);
    transform: scaleY(0.72);
  }
  to {
    filter: saturate(1.35);
    transform: scaleY(1);
  }
}

@media (max-width: 520px) {
  .controls-grid {
    grid-template-columns: 1fr;
  }
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

// reactive counters for the UI
const visibleCount = ref(0);
const queuedCount = ref(0);
const eventLog = ref<string[]>([]);

// cleanup handles
let offState: (() => void) | null = null;
let offEvents: (() => void) | null = null;

// simple HH:MM:SS for the event log
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

// prepend to log, keep last 10 entries
function addLog(line: string) {
  const outputLine = "[" + formatTimestamp() + "] " + line;
  eventLog.value = [outputLine, ...eventLog.value].slice(0, 10);
}

// subscribe on mount, clean up on unmount
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

// same payload every time so preventDuplicates can kick in
function pushDuplicate() {
  toast.info({
    title: "Sync finished",
    description: "The same payload triggers duplicate logic.",
  });
}

// show a warning then patch it to success after 900ms
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
  <main class="demo-shell">
    <div>
      <h3>State + events subscriptions</h3>
      <p>Recommended Vue usage with toast.getState(), subscribe(), and subscribeEvents().</p>
    </div>

    <div class="controls-grid">
      <section class="control-column">
        <span class="control-label">Toasts</span>
        <button @click="pushDuplicate">push duplicate candidate</button>
        <button @click="pushUpdateTarget">push + update</button>
      </section>

      <section class="control-column">
        <span class="control-label">Actions</span>
        <button @click="toast.dismissAll()">dismiss all</button>
      </section>
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

.demo-shell {
  display: grid;
  gap: 12px;
  padding: 24px;
  color: #0f172a;
  font-family: Inter, system-ui, sans-serif;
}
.demo-shell h3 {
  margin: 0;
}
.demo-shell p {
  margin: 0;
  color: #64748b;
}
.controls-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 180px));
  gap: 12px;
  align-items: start;
  max-width: 390px;
}
.control-column {
  display: grid;
  gap: 8px;
}
.control-label {
  color: #475569;
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
}
button {
  border: 1px solid #cbd5e1;
  background: #ffffff;
  color: #0f172a;
  border-radius: 8px;
  padding: 8px 12px;
  font-size: 13px;
  cursor: pointer;
  text-align: left;
}
button:hover {
  background: #f8fafc;
}
@media (max-width: 520px) {
  .controls-grid {
    grid-template-columns: 1fr;
  }
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

// pool of random toast payloads
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

// saved copies rendered below buttons via <Toast />
const savedToasts = ref<ToastStandaloneInstance[]>([]);
let sequence = 0;

function randomTemplate(): RandomToastTemplate {
  const index = Math.floor(Math.random() * templates.length);
  return templates[index];
}

// fire a runtime toast and save a copy for the list
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

  // keep max 6 saved items
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
  <main class="demo-shell">
    <div>
      <h3>Random toast feed via Toast component</h3>
      <p>Send random runtime toasts and keep a saved preview list below the buttons.</p>
    </div>

    <div class="controls-grid">
      <section class="control-column">
        <span class="control-label">Toasts</span>
        <button @click="sendToast">send toast</button>
      </section>

      <section class="control-column">
        <span class="control-label">Actions</span>
        <button @click="clearSaved">clear saved + dismiss all</button>
      </section>
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

.demo-shell {
  display: grid;
  gap: 12px;
  padding: 24px;
  color: #0f172a;
  font-family: Inter, system-ui, sans-serif;
}
.demo-shell h3 {
  margin: 0;
}
.demo-shell p {
  margin: 0;
  color: #64748b;
}
.controls-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 180px));
  gap: 12px;
  align-items: start;
  max-width: 390px;
}
.control-column {
  display: grid;
  gap: 8px;
}
.control-label {
  color: #475569;
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
}
button {
  border: 1px solid #cbd5e1;
  background: #ffffff;
  color: #0f172a;
  border-radius: 8px;
  padding: 8px 12px;
  font-size: 13px;
  cursor: pointer;
  text-align: left;
}
button:hover {
  background: #f8fafc;
}
@media (max-width: 520px) {
  .controls-grid {
    grid-template-columns: 1fr;
  }
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

// mix of types to make the queue more interesting
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

// prefix title with a sequence number so each toast is unique
function pushOne() {
  const base = randomTemplate();
  toast.show({
    ...base,
    title: "#" + String(seq.value++) + " " + base.title,
  });
}

// push 6 at once to demonstrate overflow into the queue
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
  <main class="demo-shell">
    <div>
      <h3>Queue mode and backpressure</h3>
      <p>Keep max 2 visible while overflow stays in queue.</p>
    </div>

    <div class="controls-grid">
      <section class="control-column">
        <span class="control-label">Toasts</span>
        <button @click="pushOne">push one</button>
        <button @click="pushBatch">push batch (6)</button>
      </section>

      <section class="control-column">
        <span class="control-label">Actions</span>
        <button @click="dismissFirstVisible">dismiss first visible</button>
        <button @click="pauseQueueFlow">pause queue</button>
        <button @click="resumeQueueFlow">resume queue</button>
        <button @click="toast.dismissAll()">dismiss all</button>
      </section>
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

.demo-shell {
  display: grid;
  gap: 12px;
  padding: 24px;
  color: #0f172a;
  font-family: Inter, system-ui, sans-serif;
}
.demo-shell h3 {
  margin: 0;
}
.demo-shell p {
  margin: 0;
  color: #64748b;
}
.controls-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 180px));
  gap: 12px;
  align-items: start;
  max-width: 390px;
}
.control-column {
  display: grid;
  gap: 8px;
}
.control-label {
  color: #475569;
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
}
button {
  border: 1px solid #cbd5e1;
  background: #ffffff;
  color: #0f172a;
  border-radius: 8px;
  padding: 8px 12px;
  font-size: 13px;
  cursor: pointer;
  text-align: left;
}
button:hover {
  background: #f8fafc;
}
@media (max-width: 520px) {
  .controls-grid {
    grid-template-columns: 1fr;
  }
}
</style>
`,
};

export const customFiles: Record<string, string> = {
  "main.ts": `import { createApp } from "vue";
import App from "./App.vue";
import { createToastflow } from "vue-toastflow";

createApp(App)
  .use(
    createToastflow({
      position: "top-right",
      duration: 6000,
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
  type ToastContentInput,
} from "vue-toastflow";

// themed via a CSS accent class (see styles below)
const spotifyToast: ToastContentInput = {
  title: "Now Playing",
  description: "Blinding Lights — The Weeknd",
  theme: "spotify",
};

// inline color overrides, no custom CSS needed
const paymentToast: ToastContentInput = {
  title: "Payment received",
  description: "$49.00 — Invoice #1042 has been paid.",
  css: {
    accentColor: "#7c3aed",
    iconColor: "#7c3aed",
  },
};

// icon hidden, uses a CSS theme for the rest
const systemToast: ToastContentInput = {
  title: "Maintenance scheduled",
  description: "The system will be down on Sunday 02:00–04:00 UTC.",
  showIcon: false,
  theme: "system",
};

function pushSpotify() {
  toast.show(spotifyToast, { type: "custom" });
}

function pushPayment() {
  toast.show(paymentToast, { type: "custom" });
}

function pushSystem() {
  toast.show(systemToast, { type: "custom" });
}
</script>

<template>
  <main class="demo-shell">
    <div>
      <h3>Custom toast variants</h3>
      <p>Theme class, inline accent/icon color, and hidden icon.</p>
    </div>

    <div class="controls-grid">
      <section class="control-column">
        <span class="control-label">Toasts</span>
      <button @click="pushSpotify">🎵 Spotify theme</button>
      <button @click="pushPayment">💜 Inline accent color</button>
      <button @click="pushSystem">🔧 No icon / system</button>
      </section>

      <section class="control-column">
        <span class="control-label">Actions</span>
        <button @click="toast.dismissAll()">dismiss all</button>
      </section>
    </div>
  </main>

  <ToastContainer />
</template>

<style>
@import url("${VUE_TOASTFLOW_CSS_URL}");

.demo-shell {
  display: grid;
  gap: 12px;
  padding: 24px;
  color: #0f172a;
  font-family: Inter, system-ui, sans-serif;
}
.demo-shell h3 {
  margin: 0;
}
.demo-shell p {
  margin: 0;
  color: #64748b;
}
.controls-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 180px));
  gap: 12px;
  align-items: start;
  max-width: 390px;
}
.control-column {
  display: grid;
  gap: 8px;
}
.control-label {
  color: #475569;
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
}
button {
  border: 1px solid #cbd5e1;
  background: #ffffff;
  color: #0f172a;
  border-radius: 8px;
  padding: 8px 12px;
  font-size: 13px;
  cursor: pointer;
  text-align: left;
}
button:hover {
  background: #f8fafc;
}
@media (max-width: 520px) {
  .controls-grid {
    grid-template-columns: 1fr;
  }
}

/* Spotify-inspired custom theme */
.tf-toast-accent--spotify {
  --tf-toast-bg: #191414;
  --tf-toast-color: #b3b3b3;
  --tf-toast-border-color: #282828;
  --tf-toast-title-color: #ffffff;
  --tf-toast-description-color: #b3b3b3;
  --tf-toast-progress-bg: color-mix(in srgb, #1db954 20%, transparent);
  --tf-toast-progress-bar-bg: #1db954;
  --tf-toast-icon-custom: #1db954;
  --tf-toast-close-bg: #282828;
  --tf-toast-close-color: #b3b3b3;
  --tf-toast-close-border-color: #333333;
}

/* Minimal system / maintenance theme */
.tf-toast-accent--system {
  --tf-toast-bg: #fefce8;
  --tf-toast-color: #854d0e;
  --tf-toast-border-color: #fde68a;
  --tf-toast-title-color: #713f12;
  --tf-toast-description-color: #a16207;
  --tf-toast-progress-bg: color-mix(in srgb, #facc15 25%, transparent);
  --tf-toast-progress-bar-bg: #eab308;
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

// standalone store, no Vue plugin needed
const store = createToastStore({
  duration: 5000,
  maxVisible: 3,
  position: "top-right",
});

const state = ref<ToastState>(store.getState());
const lastId = ref<ToastId | null>(null);

let stop: (() => void) | null = null;

// sync reactive state on every store change
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
  <main class="demo-shell">
    <div>
      <h3>Core store only</h3>
      <p>No Vue plugin helper required, only createToastStore API.</p>
    </div>

    <div class="controls-grid">
      <section class="control-column">
        <span class="control-label">Toasts</span>
        <button @click="pushCore">store.show</button>
      </section>

      <section class="control-column">
        <span class="control-label">Actions</span>
        <button @click="updateLast">store.update</button>
        <button @click="pauseLast">store.pause</button>
        <button @click="resumeLast">store.resume</button>
        <button @click="store.dismissAll()">store.dismissAll</button>
      </section>
    </div>

    <p style="margin: 0; color: #334155; font-size: 13px;">
      Visible: <strong>{{ visibleCount }}</strong>
    </p>

    <pre style="margin: 0; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px; background: #f8fafc; color: #0f172a; font-size: 12px; overflow-x: auto; white-space: pre-wrap; word-break: break-word;">{{ JSON.stringify(state, null, 2) }}</pre>
  </main>
</template>

<style>
.demo-shell {
  display: grid;
  gap: 12px;
  padding: 24px;
  color: #0f172a;
  font-family: Inter, system-ui, sans-serif;
}
.demo-shell h3 {
  margin: 0;
}
.demo-shell p {
  margin: 0;
  color: #64748b;
}
.controls-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 180px));
  gap: 12px;
  align-items: start;
  max-width: 390px;
}
.control-column {
  display: grid;
  gap: 8px;
}
.control-label {
  color: #475569;
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
}
button {
  border: 1px solid #cbd5e1;
  background: #ffffff;
  color: #0f172a;
  border-radius: 8px;
  padding: 8px 12px;
  font-size: 13px;
  cursor: pointer;
  text-align: left;
}
button:hover {
  background: #f8fafc;
}
@media (max-width: 520px) {
  .controls-grid {
    grid-template-columns: 1fr;
  }
}
</style>
`,
};

export const cssOverrideFiles: Record<string, string> = {
  "main.ts": `import { createApp } from "vue";
import App from "./App.vue";
import { createToastflow } from "vue-toastflow";

createApp(App)
  .use(
    createToastflow({
      position: "top-right",
      duration: 5000,
      progressBar: true,
      pauseOnHover: true,
    }),
  )
  .mount("#app");
`,
  "App.vue": `<script setup lang="ts">
import { toast, ToastContainer } from "vue-toastflow";

// 1. Per-type preset — error type gets a custom purple palette via :root preset tokens.
//    These change the default colors for all error toasts.
function pushPresetOverride() {
  toast.error({ title: "Preset override", description: "Custom error palette from :root preset tokens." });
}

// 2. Structural overrides — border-radius + padding changed globally via :root.
//    Color stays default because no color vars are overridden globally.
function pushStructural() {
  toast.success({ title: "Structural override", description: "Rounder corners + more padding from :root." });
}

// 3. Per-toast inline css prop — highest priority, overrides everything for this toast.
function pushInlineCss() {
  toast.info({
    title: "Inline css prop",
    description: "Orange accent set entirely from code.",
    css: {
      bg: "#431407",
      accentColor: "#fb923c",
      borderColor: "#9a3412",
      iconColor: "#fdba74",
    },
  });
}

// 4. Custom theme class — .tf-toast-accent--mint defines a full color set.
function pushTheme() {
  toast.show({
    type: "custom",
    title: "Theme class",
    description: "Mint theme via .tf-toast-accent--mint CSS class.",
    theme: "mint",
  });
}

// 5. Default toast — no type accent, inherits whatever :root defaults are.
function pushDefault() {
  toast.show({ type: "default", title: "Default toast", description: "Uses the base normal palette." });
}
</script>

<template>
  <main class="demo-shell">
    <div>
      <h3>CSS Override Layers</h3>
      <p>Each button shows a different override layer without conflicts.</p>
    </div>

    <div class="controls-grid">
      <section class="control-column">
        <span class="control-label">Toasts</span>
        <button @click="pushPresetOverride">preset (error)</button>
        <button @click="pushStructural">structural (:root)</button>
        <button @click="pushInlineCss">inline css prop</button>
        <button @click="pushTheme">theme class (mint)</button>
        <button @click="pushDefault">default</button>
      </section>

      <section class="control-column">
        <span class="control-label">Actions</span>
        <button @click="toast.dismissAll()">dismiss all</button>
      </section>
    </div>
  </main>

  <ToastContainer />
</template>

<style>
@import url("${VUE_TOASTFLOW_CSS_URL}");

/* Structural overrides — apply to all toasts, no color conflicts */
:root {
  --tf-toast-border-radius: 14px;
  --tf-toast-padding: 14px;
}

/* Per-type preset override — only changes the error type defaults */
:root {
  --tf-toast-error-bg-default: #3b0764;
  --tf-toast-error-border-default: #7e22ce;
  --tf-toast-error-text-default: #e9d5ff;
}

/* Custom theme class — full color set for a mint accent */
.tf-toast-accent--mint {
  --tf-toast-bg: #042f2e;
  --tf-toast-color: #ccfbf1;
  --tf-toast-border-color: #115e59;
  --tf-toast-title-color: #f0fdfa;
  --tf-toast-description-color: #99f6e4;
  --tf-toast-icon-color: #2dd4bf;
  --tf-toast-progress-bg: color-mix(in srgb, #2dd4bf 20%, transparent);
  --tf-toast-progress-bar-bg: #2dd4bf;
}

.demo-shell {
  display: grid;
  gap: 12px;
  padding: 24px;
  color: #0f172a;
  font-family: Inter, system-ui, sans-serif;
}
.demo-shell h3 {
  margin: 0;
}
.demo-shell p {
  margin: 0;
  color: #64748b;
}
.controls-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 180px));
  gap: 12px;
  align-items: start;
  max-width: 390px;
}
.control-column {
  display: grid;
  gap: 8px;
}
.control-label {
  color: #475569;
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
}

button {
  border: 1px solid #cbd5e1;
  background: #ffffff;
  color: #0f172a;
  border-radius: 8px;
  padding: 8px 12px;
  font-size: 13px;
  cursor: pointer;
  text-align: left;
}
button:hover {
  background: #f8fafc;
}
@media (max-width: 520px) {
  .controls-grid {
    grid-template-columns: 1fr;
  }
}
</style>
`,
};
