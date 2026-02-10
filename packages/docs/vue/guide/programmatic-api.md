---
title: Programmatic API
outline: deep
---

# Programmatic API

The `toast` helper is globally callable after store initialization.

```ts
import { toast } from "vue-toastflow";
```

## Available Methods

- `getState()`
- `subscribe(listener)`
- `subscribeEvents(listener)`
- `show(...)`
- `loading(input, config)`
- `update(id, options)`
- `dismiss(id)`
- `dismissAll()`
- `pause(id)`
- `resume(id)`
- `pauseQueue()`
- `resumeQueue()`
- `getConfig()`
- typed wrappers: `default`, `success`, `error`, `info`, `warning`

::: tip Reference
Detailed signatures and behavior for each action method: [Actions](/api/actions).  
State and event payload models: [State](/api/state) and [Events](/api/events).
:::

## Typed Wrappers

```ts
toast.success({ title: "Saved" });
toast.error("Request failed", { description: "Try again" });
```

Typed wrappers pin `type` automatically and keep the same overload style as `show`.

## Initialization Model

`createToastflow(config)` creates a core store and registers it for injection and global usage.

```ts
import { createToastflow } from "vue-toastflow";

app.use(createToastflow({ position: "top-right" }));
```

If no store exists yet, helper calls throw:

```text
[vue-toastflow] Toast store not initialized. Did you install the plugin?
```

::: tip Reference
Plugin bootstrap walkthrough: [Getting Started](/guide/getting-started).  
Config defaults at initialization: [Configuration](/api/configuration).
:::

## Subscribing To State

```ts
const unsubscribe = toast.subscribe((state) => {
  console.log("visible", state.toasts.length);
  console.log("queued", state.queue.length);
});

unsubscribe();
```

State subscription calls listener immediately with the current snapshot.

::: tip Reference
Full state schema: [State](/api/state).
:::

## Subscribing To Events

```ts
const stop = toast.subscribeEvents((event) => {
  console.log(event.id, event.kind);
});

stop();
```

Event kinds:

- `duplicate`
- `timer-reset`
- `update`

::: tip Reference
Event payload details and semantics: [Events](/api/events).
:::

## Service Layer Example

```ts
// notifications.ts
import { toast } from "vue-toastflow";

export async function saveSettings(payload: unknown) {
  return toast.loading(
    () =>
      fetch("/api/settings", { method: "POST", body: JSON.stringify(payload) }),
    {
      loading: { title: "Saving settings" },
      success: {
        title: "Settings saved",
        description: "Everything is up to date",
      },
      error: (err) => ({
        title: "Save failed",
        description: err instanceof Error ? err.message : "Unknown error",
      }),
    },
  );
}
```

## Next

- Core-store-only integration: [Controlled Store](/guide/controlled-store)
- Action method details: [Actions](/api/actions)
