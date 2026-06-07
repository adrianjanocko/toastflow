<script setup lang="ts">
import { headlessFiles } from "@/data/repl-examples";
</script>

<template>
  <ToastflowRepl
    :files="headlessFiles"
    main-file="main.ts"
    layout="vertical"
    title="Headless rendering"
    description="Trigger six different Toastflow workflows and render each toast through the ToastContainer slot."
    :height="1200"
  />
</template>
