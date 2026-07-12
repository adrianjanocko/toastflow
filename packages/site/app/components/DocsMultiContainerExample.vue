<script setup lang="ts">
import { multiContainerFiles } from "@/data/repl-examples";
</script>

<template>
  <ToastflowRepl
    :files="multiContainerFiles"
    main-file="main.ts"
    layout="vertical"
    title="Multiple containers"
    description="Route toasts between the default container and a named container, then dismiss each scope separately."
    :height="1000"
  />
</template>
