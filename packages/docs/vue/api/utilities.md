---
title: Utilities
outline: deep
---

# Utilities

This page lists useful exports and integration utilities.

## Package Exports

## `toastflow-core`

```ts
export * from "./types";
export * from "./store";
```

Main public entry points:

- `createToastStore`
- all core types (`ToastConfig`, `ToastStore`, `ToastState`, `ToastInstance`, etc.)

## `vue-toastflow`

Public exports include:

- everything from `toastflow-core`
- `createToastflow`
- `toast` helper
- components:
  - `ToastContainer`
  - `Toast`
  - `ToastProgress`
- icons:
  - `ArrowPath`
  - `Bell`
  - `CheckCircle`
  - `InfoCircle`
  - `QuestionMarkCircle`
  - `XCircle`
  - `XMark`

## Create Store Utility

Use `createToastStore` directly for non-Vue integration or custom renderer pipelines.

```ts
import { createToastStore } from "toastflow-core";

const store = createToastStore({ queue: true });
```

## Vue Plugin Utility

Use `createToastflow` to create and provide store in Vue app.

```ts
import { createToastflow } from "vue-toastflow";

app.use(createToastflow({ preventDuplicates: true }));
```

## Global Helper Utility

`toast` provides globally callable methods wired to active store instance.

```ts
import { toast } from "vue-toastflow";

toast.info({ title: "Ready" });
```

## Internal Utilities Warning

Avoid importing private internals like `toastflow-core/src/*` in app code.

Stick to package root exports for forward compatibility.

## Related

- Full runtime contracts: [Configuration](/api/configuration), [Actions](/api/actions)
- Component surface: [Components](/components/toast-container)
