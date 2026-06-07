<script setup lang="ts">
import {
  coreFiles,
  cssOverrideFiles,
  customFiles,
  eventsFiles,
  headlessFiles,
  helperFiles,
  loadingFiles,
  queueFiles,
  randomFeedFiles,
  themeFiles,
} from "@/data/repl-examples";

type LiveExample = {
  title: string;
  description: string;
  files: Record<string, string>;
  height: number;
};

const examples: LiveExample[] = [
  {
    title: "Create methods and update",
    description:
      "Use payload objects, title + options calls, typed helpers, then patch the last toast by id.",
    files: helperFiles,
    height: 1100,
  },
  {
    title: "Loading workflow",
    description:
      "One toast id transitions through loading, success, and error states.",
    files: loadingFiles,
    height: 1000,
  },
  {
    title: "Theming and HTML",
    description:
      "Use theme classes, inline CSS overrides, trusted HTML, and action buttons.",
    files: themeFiles,
    height: 1000,
  },
  {
    title: "Custom toast variants",
    description:
      "Use type: custom with a theme class, inline accent color, or hidden icon.",
    files: customFiles,
    height: 1000,
  },
  {
    title: "CSS override layers",
    description:
      "Compare global variables, type presets, theme classes, and inline CSS.",
    files: cssOverrideFiles,
    height: 1000,
  },
  {
    title: "Headless rendering",
    description:
      "Trigger different workflows and render each toast through the ToastContainer slot.",
    files: headlessFiles,
    height: 1000,
  },
  {
    title: "State and events",
    description:
      "Observe getState(), subscribe(), and subscribeEvents() in a Vue app.",
    files: eventsFiles,
    height: 1000,
  },
  {
    title: "Random feed with Toast",
    description:
      "Send runtime toasts, save copies, and render the saved list with the Toast component.",
    files: randomFeedFiles,
    height: 1000,
  },
  {
    title: "Queue and backpressure",
    description:
      "Push batches, inspect visible and queued counts, then pause or resume the queue.",
    files: queueFiles,
    height: 1100,
  },
  {
    title: "Core store only",
    description:
      "Use createToastStore directly without the Vue plugin or default renderer.",
    files: coreFiles,
    height: 1000,
  },
];
</script>

<template>
  <div class="tf-live-examples">
    <ToastflowRepl
      v-for="example in examples"
      :key="example.title"
      :files="example.files"
      main-file="main.ts"
      layout="vertical"
      :title="example.title"
      :description="example.description"
      :height="example.height"
    />
  </div>
</template>

<style scoped>
.tf-live-examples {
  display: grid;
  gap: 2rem;
}
</style>
