---
title: Timers and Progress
outline: deep
---

# Timers and Progress

Toastflow timer behavior is deterministic and controlled by `duration`, `pauseOnHover`, and `pauseStrategy`.

## Duration Rules

- Finite number `> 0`: auto-dismiss is scheduled.
- `Infinity`: no auto-dismiss.
- `0`: no auto-dismiss (treated as non-finite for scheduling).

When duration is not finite, progress bar is disabled automatically.

::: tip Reference
`duration`, `progressBar`, and queue defaults are configurable globally: [Configuration](/api/configuration).
:::

## Progress Bar

- Controlled by `progressBar`.
- Rendered only when `progressBar: true` and duration is finite.
- Alignment options:
  - `right-to-left` (default)
  - `left-to-right`

```ts
toast.show({
  type: "info",
  title: "Uploading",
  duration: 8000,
  progressBar: true,
  progressAlignment: "left-to-right",
});
```

## Pause On Hover

With `pauseOnHover: true`, hover and touch/pen interactions pause timer and resume on leave/up.

```ts
createToastflow({
  pauseOnHover: true,
  pauseStrategy: "resume", // or "reset"
});
```

`pauseStrategy`:

- `resume`: continue with remaining time.
- `reset`: restart full duration and emit `timer-reset` event.

::: tip Reference
`timer-reset` and other runtime events: [Events](/api/events).
:::

## Manual Pause And Resume

```ts
const id = toast.info({
  title: "Session expires soon",
  duration: 10000,
});

toast.pause(id);
// ...
toast.resume(id);
```

## Queueing And Capacity

Queue behavior depends on:

- `maxVisible`
- `queue`

When capacity is full:

- `queue: false`: one visible toast is evicted by order strategy.
- `queue: true`: toast is queued and shown later when slot is free.

Queue control methods:

```ts
toast.pauseQueue();
// queued toasts stay pending

toast.resumeQueue();
// queued toasts are processed again
```

Queue is managed per position internally.

::: tip Reference
Queue-related methods and signatures: [Actions](/api/actions).
:::

## Loading Helper

`loading` wraps async work and updates the same toast id.

```ts
const result = toast.loading(() => fetch("/api/import").then((r) => r.json()), {
  loading: { title: "Importing", description: "Processing file" },
  success: (data) => ({
    title: "Import complete",
    description: `${data.count} records saved`,
    duration: 6000,
  }),
  error: (error) => ({
    title: "Import failed",
    description: error instanceof Error ? error.message : "Unknown error",
    duration: 10000,
  }),
});

await result;
console.log(result.toastId);
```

The core guards against stale async runs by tracking a token per loading toast id.

::: tip Reference
`loading`/`update` method details: [Actions](/api/actions).  
State snapshot shape used by timers and queue: [State](/api/state).
:::

## Next

- User interactions inside toast body: [Buttons and Actions](/guide/buttons-and-actions)
- Event payloads for timers and updates: [Events](/api/events)
