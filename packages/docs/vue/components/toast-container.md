---
title: ToastContainer
outline: deep
---

# ToastContainer

`<ToastContainer />` is the renderer root for Toastflow in Vue.

## Responsibilities

- Subscribes to toast store state and events.
- Renders stacks for all six positions.
- Runs transition-group animations.
- Passes event-driven keys to toasts (duplicate/update/progress reset).
- Supports headless rendering through default slot.

## Basic Usage

```vue
<template>
  <ToastContainer />
  <RouterView />
</template>

<script setup lang="ts">
import { ToastContainer } from "vue-toastflow";
</script>
```

## Props

`ToastContainer` currently has no props.

Configuration is store-driven (global config + per-toast overrides).

## Slot API

See full slot contract in [Slots](/api/slots). The default slot receives the current toast and helper metadata.

## Store Resolution

Container resolves store in this order:

1. `inject(toastStoreKey)` from plugin.
2. fallback `getToastStore()` global store.

This allows plugin-driven and global helper-driven setups.

## Stack Behavior Notes

- Internal positions are fixed to all six anchors.
- `overflowScroll` applies only to `top-*` positions in renderer.
- Global root z-index follows highest visible toast z-index.
- Stack width uses configured `width`, but is clamped responsively to `calc(100vw - offset - offset)` so toasts do not overflow narrow screens.
- Stack-level visual config (`offset`, `gap`, etc.) is derived from first toast in each position when present.

## Transition Durations

Container reads CSS vars at runtime:

- `--tf-toast-animation-in-duration`
- `--tf-toast-animation-out-duration`

Used to configure transition timings.

## Related

- Visual card component: [Toast](/components/toast)
- Headless slot rendering: [Slots](/api/slots)
