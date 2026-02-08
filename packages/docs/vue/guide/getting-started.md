---
title: Getting Started
outline: deep
---

# Getting Started

## Install

```bash
pnpm add vue-toastflow
# npm i vue-toastflow
# yarn add vue-toastflow
# bun add vue-toastflow
```

## 1. Install The Plugin

```ts
// main.ts
import { createApp } from "vue";
import App from "./App.vue";
import { createToastflow } from "vue-toastflow";

const app = createApp(App);

app.use(
  createToastflow({
    position: "top-right",
    duration: 5000,
    maxVisible: 5,
  }),
);

app.mount("#app");
```

::: tip Reference
Need all plugin options and defaults? See [Configuration](/api/configuration).
:::

## 2. Render A Container

Render one container near app root.

```vue
<!-- App.vue -->
<template>
  <ToastContainer/>
  <RouterView/>
</template>

<script setup lang="ts">
  import { ToastContainer } from "vue-toastflow";
</script>
```

::: tip Reference
Container behavior and slot contract: [ToastContainer](/components/toast-container) and [Slots](/api/slots).
:::

## 3. Fire Toasts Anywhere

```ts
import { toast } from "vue-toastflow";

toast.success({
  title: "Saved",
  description: "Your changes are live.",
});

const id = toast.error("Network error", {
  description: "Retrying request...",
});

toast.update(id, {
  title: "Recovered",
  description: "Connection restored.",
  type: "success",
});
```

::: tip Reference
Method-by-method details: [Actions](/api/actions).  
Payload rules and per-toast fields: [Toasts](/guide/toasts).
:::

## 4. Async Flows With `loading`

```ts
const request = toast.loading(() => fetch("/api/save").then((r) => r.json()), {
  loading: { title: "Saving", description: "Please wait" },
  success: (data) => ({
    title: "Saved",
    description: `Record ${data.id} stored`,
  }),
  error: (error) => ({
    title: "Failed",
    description: error instanceof Error ? error.message : "Unknown error",
  }),
});

await request;
console.log(request.toastId);
```

::: tip Reference
Timer behavior and progress rendering: [Timers and Progress](/guide/timers-and-progress).  
Emitted runtime events (`update`, `timer-reset`, `duplicate`): [Events](/api/events).
:::

## 5. Optional Core-Only Usage

If you want to use Toastflow without Vue rendering:

```ts
import { createToastStore } from "toastflow-core";

const store = createToastStore({ position: "bottom-right" });

store.subscribe((state) => {
  console.log(state.toasts, state.queue);
});

store.show({
  type: "info",
  title: "Core store active",
});
```

::: tip Reference
Headless/controlled integration patterns: [Controlled Store](/guide/controlled-store).  
State shape and event payloads: [State](/api/state) and [Events](/api/events).
:::

## Common Setup Notes

- `toast` helper requires an initialized store. The store is initialized by `createToastflow(...)`.
- You can mount multiple containers, but one root container is the normal and recommended setup.
- Keep `supportHtml` disabled unless the content is trusted. You can ensure that the content is trusted by sanitizing
  it, for example.

## Next

- Styling and token customization: [Theming](/guide/theming)
- Toast payload model: [Toasts](/guide/toasts)
- Runtime controls: [Programmatic API](/guide/programmatic-api)
- Library positioning: [Comparisons](/comparisons/overview)
- Run interactive examples: [Live Examples](/guide/live-examples)
