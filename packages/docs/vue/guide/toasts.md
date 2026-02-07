---
title: Toasts
outline: deep
---

# Toasts

This page explains the toast payload model and show/update semantics.

## Supported Types

- `loading`
- `default`
- `success`
- `error`
- `info`
- `warning`

## Required Content Rule

`show` and `update` require at least one non-empty field:

- `title`
- `description`

Passing both as empty strings throws an error.

## `show` Overloads

```ts
toast.show({
  type: "success",
  title: "Saved",
  description: "Done",
});

toast.show("Saved", {
  type: "success",
  description: "Done",
});

toast.success({
  title: "Saved",
  description: "Done",
});
```

::: tip Reference
All callable methods and signatures: [Actions](/api/actions) and [Programmatic API](/guide/programmatic-api).
:::

## Per-Toast Overrides

Any `ToastConfig` field can be overridden per toast.

```ts
toast.info({
  title: "Maintenance",
  description: "At 22:00 UTC",
  position: "bottom-center",
  duration: 15000,
  closeOnClick: true,
  progressAlignment: "left-to-right",
});
```

::: tip Reference
Complete config key list with defaults: [Configuration](/api/configuration).
:::

## Positions

- `top-left`
- `top-center`
- `top-right`
- `bottom-left`
- `bottom-center`
- `bottom-right`

## Ordering

`order` controls how new toasts are inserted and which overflow toast gets evicted.

- `newest` (default)
- `oldest`

When stack capacity is exceeded and queue is disabled, Toastflow evicts one toast from that position.

## Duplicate Prevention

Enable `preventDuplicates: true` to avoid re-adding identical visible/queued toasts.

Duplicate matching uses:

- `position`
- `type`
- `title`
- `description`

Behavior when duplicate is found:

1. Existing toast is updated with new incoming overrides.
2. Existing toast id is reused.
3. Timer is restarted for visible toast.
4. `duplicate` event is emitted.

::: tip Reference
Duplicate event payload and related events: [Events](/api/events).
:::

## Update And Dismiss

```ts
const id = toast.warning({
  title: "Low disk space",
  description: "Only 1 GB left",
});

toast.update(id, {
  title: "Disk space restored",
  description: "Cleanup complete",
  type: "success",
});

toast.dismiss(id);
toast.dismissAll();
```

## Lifecycle Hooks

Hooks can be set globally or per toast:

- `onMount`
- `onUnmount`
- `onClick`
- `onClose`

Each hook receives `ToastContext` (`id`, `position`, `type`, `title`, `description`, `createdAt`).

::: tip Reference
Renderer-level handling of these fields: [Toast](/components/toast) and [Slots](/api/slots).
:::

## Next

- Timer behavior and loading helper: [Timers and Progress](/guide/timers-and-progress)
- Full action methods: [Actions](/api/actions)
