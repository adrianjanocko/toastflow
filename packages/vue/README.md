![Toastflow showcase](../../images/banner.png)

# vue-toastflow

Vue 3 package for Toastflow - if you are using Nuxt, install [
`nuxt-toastflow`](https://www.npmjs.com/package/nuxt-toastflow) (wrapper around
`vue-toastflow`)

## 📚 Documentation

- Docs: https://docs.toastflow.top/
- Comparisons (Vue ecosystem toasts): https://docs.toastflow.top/comparisons/overview
- Playground: https://toastflow.top/
- npm: https://www.npmjs.com/package/vue-toastflow

## 📦 Includes

- `createToastflow` plugin
- `toast` programmatic API
- `<ToastContainer />`, `<Toast />`, `<ToastProgress />`
- default styles and icon components

## 🚀 Quick Start

```bash
pnpm add vue-toastflow
```

```ts
// main.ts
import { createApp } from "vue";
import App from "./App.vue";
import { createToastflow } from "vue-toastflow";

createApp(App).use(createToastflow()).mount("#app");
```

```vue
<!-- App.vue -->
<script setup lang="ts">
import { ToastContainer, toast } from "vue-toastflow";

toast.success({ title: "Saved", description: "Your changes are live." });
</script>

<template>
  <ToastContainer />
</template>
```

## 📄 License

MIT
