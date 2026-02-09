<script setup lang="ts">
import { computed, onErrorCaptured, onMounted, ref, shallowRef } from "vue";

type ReplFiles = Record<string, string>;
declare const __TOASTFLOW_CORE_VERSION__: string;
declare const __VUE_TOASTFLOW_VERSION__: string;

const TOASTFLOW_CORE_VERSION =
  typeof __TOASTFLOW_CORE_VERSION__ === "string"
    ? __TOASTFLOW_CORE_VERSION__
    : "latest";
const VUE_TOASTFLOW_VERSION =
  typeof __VUE_TOASTFLOW_VERSION__ === "string"
    ? __VUE_TOASTFLOW_VERSION__
    : "latest";

const props = withDefaults(
  defineProps<{
    title?: string;
    description?: string;
    files: ReplFiles;
    mainFile?: string;
    height?: number;
    layout?: "horizontal" | "vertical";
    showImportMap?: boolean;
  }>(),
  {
    mainFile: "App.vue",
    height: 760,
    layout: "vertical",
    showImportMap: false,
  },
);

const ready = ref(false);
const errorMessage = ref("");
const runtimeError = ref("");
const replComponent = shallowRef<any>(null);
const editorComponent = shallowRef<any>(null);
const store = shallowRef<any>(null);

const statusLabel = computed(function () {
  if (runtimeError.value) {
    return "runtime-error";
  }
  if (errorMessage.value) {
    return "init-error";
  }
  if (ready.value) {
    return "ready";
  }
  return "loading";
});

onErrorCaptured(function (error) {
  runtimeError.value =
    error instanceof Error
      ? `Vue REPL runtime error: ${error.message}`
      : "Vue REPL runtime error.";

  console.error("[toastflow-docs] Vue REPL runtime error", error);
  return false;
});

onMounted(async function () {
  if (ready.value) {
    return;
  }

  try {
    const replModule = await import("@vue/repl");
    const codeMirrorModule = await import("@vue/repl/codemirror-editor");

    const { useStore, useVueImportMap, Repl } = replModule;
    const { importMap: builtinImportMap, vueVersion } = useVueImportMap();

    const localStore = useStore({
      builtinImportMap,
      vueVersion,
      showOutput: ref(true),
      outputMode: ref("preview"),
    });

    await localStore.setFiles(props.files, props.mainFile);

    localStore.setImportMap(
      {
        imports: {
          "toastflow-core": `https://esm.sh/toastflow-core@${TOASTFLOW_CORE_VERSION}?bundle`,
          "vue-toastflow": `https://cdn.jsdelivr.net/npm/vue-toastflow@${VUE_TOASTFLOW_VERSION}/dist/toastflow.es.js`,
        },
      },
      true,
    );

    // Keep preview pane visible and selected after file/import-map setup.
    localStore.showOutput = true;
    localStore.outputMode = "preview";

    replComponent.value = Repl;
    editorComponent.value = codeMirrorModule.default;
    store.value = localStore;
    ready.value = true;
  } catch (error) {
    errorMessage.value =
      error instanceof Error
        ? `Failed to initialize Vue REPL: ${error.message}`
        : "Failed to initialize Vue REPL.";
    console.error("[toastflow-docs] Vue REPL init error", error);
  }
});
</script>

<template>
  <div class="tf-repl-shell">
    <div v-if="title || description" class="tf-repl-header">
      <p v-if="title" class="tf-repl-title">{{ title }}</p>
      <p v-if="description" class="tf-repl-description">{{ description }}</p>
    </div>

    <ClientOnly>
      <div
        class="tf-repl-body"
        :data-repl-state="statusLabel"
        :style="{
          '--tf-repl-height': `${height}px`,
          '--tf-repl-height-mobile': `${Math.max(height - 80, 420)}px`,
        }"
      >
        <component
          :is="replComponent"
          v-if="
            ready && replComponent && editorComponent && store && !runtimeError
          "
          :editor="editorComponent"
          :store="store"
          theme="dark"
          :preview-theme="true"
          :layout="layout"
          :layout-reverse="false"
          :show-import-map="showImportMap"
          :show-ts-config="false"
          :show-ssr-output="false"
          :show-open-source-map="false"
          :show-compile-output="false"
          :clear-console="true"
          :auto-resize="true"
          :split-pane-options="{
            codeTogglerText: 'Code',
            outputTogglerText: 'Preview',
          }"
        />

        <div v-else class="tf-repl-fallback">
          {{ runtimeError || errorMessage || "Loading Vue REPL..." }}
        </div>
      </div>

      <template #fallback>
        <div class="tf-repl-fallback">Loading Vue REPL...</div>
      </template>
    </ClientOnly>
  </div>
</template>
