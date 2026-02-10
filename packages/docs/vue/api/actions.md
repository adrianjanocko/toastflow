---
title: Actions
outline: deep
---

# Actions

Actions are the mutating methods on `ToastStore` and `toast` helper.

## Method Reference

| Method                   | Purpose                                                |
| ------------------------ | ------------------------------------------------------ |
| `show(...)`              | Create toast and return `ToastId`                      |
| `loading(input, config)` | Bind async flow to loading/success/error toast updates |
| `update(id, options)`    | Patch existing toast and resolve config again          |
| `dismiss(id)`            | Dismiss one toast                                      |
| `dismissAll()`           | Dismiss all visible and queued toasts                  |
| `pause(id)`              | Pause timer for one toast                              |
| `resume(id)`             | Resume timer using `pauseStrategy`                     |
| `pauseQueue()`           | Pause queue processing globally                        |
| `resumeQueue()`          | Resume queue processing globally                       |

## `show` Signatures

```ts
show(options: ToastShowInput): ToastId;
show(content: string | ToastTextInput, options?: ToastShowOptions): ToastId;
```

Validation rules:

- `type` must be one of the six valid toast types.
- `title` or `description` must be non-empty.

## `loading` Signature

```ts
loading<T>(
  input: Promise<T> | (() => Promise<T>),
  config: {
    loading: ToastContentInput;
    success: ToastContentInput | ((value: T) => ToastContentInput);
    error: ToastContentInput | ((error: unknown) => ToastContentInput);
  },
): Promise<T> & { toastId: ToastId };
```

Behavior:

- Creates a `loading` toast with `duration: Infinity` and `progressBar: false`.
- On resolve/reject, updates same toast id to `success` or `error`.
- Uses internal run token to avoid stale async race updates.

## `update` Rules

```ts
update(id: ToastId, options: ToastUpdateInput): void;
```

- Requires non-empty `title` or `description` in update payload.
- If toast is visible, timer is re-scheduled.
- If toast is queued, queued instance is replaced.
- Emits `update`; visible timer resets also emit `timer-reset`.

## `dismiss` And `dismissAll`

```ts
dismiss(id: ToastId): void;
dismissAll(): void;
```

`dismiss(id)`:

- Calls `onClose` before leaving.
- Marks visible toast as `leaving`, then removes it after leave delay.
- Removes queued toast immediately.

`dismissAll()`:

- Calls `onClose` for visible and queued toasts.
- Marks visible toasts as `clear-all` before removing.
- Calls `onUnmount` for visible toasts once removed.

## Queue Controls

```ts
pauseQueue(): void;
resumeQueue(): void;
```

Queue control affects all positions and only controls processing, not existing visible toasts.

## Timer Controls

```ts
pause(id: ToastId): void;
resume(id: ToastId): void;
```

- `pause` stores remaining time.
- `resume` applies `pauseStrategy` from the toast instance.

## Related

- Data model behind these methods: [State](/api/state)
- Option defaults and behavior knobs: [Configuration](/api/configuration)
