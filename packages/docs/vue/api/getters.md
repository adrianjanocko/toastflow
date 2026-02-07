---
title: Getters
outline: deep
---

# Getters

Toastflow exposes two direct getters on store/helper.

## `getState()`

```ts
const state = toast.getState();
console.log(state.toasts);
console.log(state.queue);
```

Returns current snapshot:

- `toasts`
- `queue`

Use it for read-on-demand checks. For reactivity, prefer `subscribe(...)`.

## `getConfig()`

```ts
const config = toast.getConfig();
console.log(config.position, config.duration);
```

Returns resolved global config:

- internal defaults
- merged with config passed to store/plugin creation

Per-toast overrides are not included because this getter is global-config scoped.

## Related Read APIs

- `subscribe(listener)` for continuous state updates.
- `subscribeEvents(listener)` for one-off event stream.
- `loading(...).toastId` for getting id from async helper result.

## Related

- Event stream details: [Events](/api/events)
- Mutations and side effects: [Actions](/api/actions)
