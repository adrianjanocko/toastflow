<script setup lang="ts">
import { computed, onErrorCaptured, onMounted, ref, shallowRef } from "vue";

type ReplFiles = Record<string, string>;

const TOASTFLOW_CORE_VERSION = __TOASTFLOW_CORE_VERSION__ || "latest";
const VUE_TOASTFLOW_VERSION = __VUE_TOASTFLOW_VERSION__ || "latest";
const IS_LOCAL_DEV = __TOASTFLOW_LOCAL_DEV__;

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

/**
 * In local dev mode, rewrite CDN CSS URLs in repl file contents
 * so the iframe loads styles from the local dist/ build.
 */
const CDN_CSS_PATTERN =
  /https:\/\/cdn\.jsdelivr\.net\/npm\/vue-toastflow@[^"'\s)]+\/dist\/vue-toastflow\.css/g;

function patchFilesForLocalDev(files: ReplFiles): ReplFiles {
  if (typeof window === "undefined") {
    return files;
  }

  const localCssUrl = `${window.location.origin}/@toastflow-local/vue/vue-toastflow.css`;

  return Object.fromEntries(
    Object.entries(files).map(([name, content]) => [
      name,
      content.replace(CDN_CSS_PATTERN, localCssUrl),
    ]),
  );
}

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

    await localStore.setFiles(
      IS_LOCAL_DEV ? patchFilesForLocalDev(props.files) : props.files,
      props.mainFile,
    );

    localStore.setImportMap(
      {
        imports: IS_LOCAL_DEV
          ? {
              "toastflow-core": `${window.location.origin}/@toastflow-local/core/index.mjs`,
              "vue-toastflow": `${window.location.origin}/@toastflow-local/vue/toastflow.es.js`,
            }
          : {
              "toastflow-core": `https://cdn.jsdelivr.net/npm/toastflow-core@${TOASTFLOW_CORE_VERSION}/dist/index.mjs`,
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
