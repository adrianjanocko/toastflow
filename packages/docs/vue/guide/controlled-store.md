---
title: Controlled Store
outline: deep
---

# Controlled Store

Use this mode if you want full rendering control while keeping Toastflow's core behavior.

## Create Store Directly

```ts
import { createToastStore } from "toastflow-core";

const store = createToastStore({
  position: "bottom-right",
  maxVisible: 3,
  queue: true,
});
```

::: tip Reference
All store configuration options and defaults: [Configuration](/api/configuration).
:::

## Drive Your Own Renderer

```ts
const stop = store.subscribe((state) => {
  renderToasts(state.toasts);
  renderQueueCount(state.queue.length);
});

const id = store.show({
  type: "info",
  title: "Renderer connected",
});

store.update(id, {
  title: "Renderer updated",
  description: "State changed",
});
```

::: tip Reference
State structure and lifecycle fields used by custom renderers: [State](/api/state).
:::

## Vue Headless Mode With `<ToastContainer>` Slot

```vue
<ToastContainer
  v-slot="{
    toast,
    dismiss,
    bumpAnimationClass,
    clearAllAnimationClass,
    updateAnimationClass,
  }"
>
  <div
    class="custom-toast"
    :class="[
      toast.type,
      bumpAnimationClass,
      toast.phase === 'clear-all' && clearAllAnimationClass,
      updateAnimationClass,
    ]"
    @click="toast.closeOnClick && dismiss(toast.id)"
  >
    <strong>{{ toast.title }}</strong>
    <p v-if="toast.description">{{ toast.description }}</p>
    <button @click.stop="dismiss(toast.id)">Close</button>
  </div>
</ToastContainer>
```

::: tip Reference
Slot payload contract and available utilities: [Slots](/api/slots).  
Default rendered component behavior: [ToastContainer](/components/toast-container).
:::

## Queue Control For Deterministic UX

Pause queue processing during critical UI flows:

```ts
store.pauseQueue();

// run guarded workflow, modal, transition, etc.

store.resumeQueue();
```

::: tip Reference
Queue methods and side-effects: [Actions](/api/actions) and [Events](/api/events).
:::

## Recommended Pattern

- Keep behavior in store config and action methods.
- Keep visuals in renderer layer (slots or custom components).
- Use state and event subscriptions for analytics or telemetry.

## Next

- Store shape and toast lifecycle fields: [State](/api/state)
- Slot payload contracts: [Slots](/api/slots)
