---
title: State
outline: deep
---

# State

Toastflow state is intentionally small.

```ts
interface ToastState {
  toasts: ToastInstance[];
  queue: ToastInstance[];
}
```

- `toasts`: currently visible (including transitional phases).
- `queue`: queued toasts waiting for capacity when `queue: true`.

## `ToastInstance`

`ToastInstance` is the resolved runtime object:

- Includes full `ToastOptions`.
- Adds `id`, `createdAt`, and optional `phase`.

```ts
interface ToastInstance extends ToastOptions {
  id: string;
  createdAt: number;
  phase?: "enter" | "leaving" | "clear-all";
}
```

## Lifecycle Phase Meaning

- `enter`: new toast just inserted.
- `leaving`: dismiss animation in progress for a single toast.
- `clear-all`: clear-all animation for batch dismiss.

## State Transition Example

1. `show(...)`
   - state inserts toast with `phase: "enter"`
2. `dismiss(id)`
   - toast becomes `phase: "leaving"`
3. after leave timeout
   - toast removed from `state.toasts`

## Queue Model

Queue is internally grouped by position but exposed as a flattened array in `state.queue`.

- If queue is paused (`pauseQueue`), queued toasts stay pending.
- `resumeQueue` processes queued items until each position reaches capacity.

## `ToastContext`

Callbacks receive a minimal immutable snapshot:

```ts
interface ToastContext {
  id: string;
  position: ToastPosition;
  type: ToastType;
  title: string;
  description: string;
  createdAt: number;
}
```

Used by lifecycle hooks and action buttons.

## `ToastStandaloneInstance`

`<Toast />` also accepts a standalone shape for direct component usage.

```ts
type ToastStandaloneInstance = {
  id?: string;
  type?: ToastType;
  createdAt?: number;
} & ToastTextInput &
  Partial<...ToastInstanceFields>;
```

If fields are missing, Toast component applies safe defaults from store config.

## State Subscription

```ts
const stop = toast.subscribe((state) => {
  console.log(state.toasts);
  console.log(state.queue);
});

stop();
```

State listener is called immediately upon subscribe.

## Related

- Event stream for important state transitions: [Events](/api/events)
- Store actions that mutate state: [Actions](/api/actions)
