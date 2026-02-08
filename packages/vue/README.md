![Toastflow showcase](../../images/banner.png)

# @vue-toastflow

Vue 3 package for Toastflow

## 📚 Documentation

- Docs: https://docs.toastflow.top/
- Comparisons (Vue toasts): https://docs.toastflow.top/comparisons/overview
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
import { createApp } from "vue";
import App from "./App.vue";
import { createToastflow } from "vue-toastflow";

createApp(App).use(createToastflow()).mount("#app");
```

```vue

<template>
  <ToastContainer/>
</template>

<script setup lang="ts">
  import { ToastContainer, toast } from "vue-toastflow";

  toast.success({ title: "Saved", description: "Your changes are live." });
</script>
```

## 📄 License

MIT

