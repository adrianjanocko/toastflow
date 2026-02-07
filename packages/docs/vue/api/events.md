---
title: Events
outline: deep
---

# Events

Toastflow emits lightweight events through `subscribeEvents`.

```ts
interface ToastEvent {
  id: ToastId;
  kind: "duplicate" | "timer-reset" | "update";
}
```

## Subscribe

```ts
const off = toast.subscribeEvents((event) => {
  console.log(event.kind, event.id);
});

off();
```

## Event Kinds

| Kind | Emitted when |
| --- | --- |
| `duplicate` | `show(...)` found an existing matching toast while `preventDuplicates: true` |
| `timer-reset` | visible toast timer was reset (`update` on visible toast, or `resume` with `pauseStrategy: "reset"`) |
| `update` | `update(id, options)` succeeded |

## Important Behavior Notes

- `duplicate` and `update` can both happen in duplicate handling flows depending on action path.
- Updating a queued toast emits `update` but does not emit `timer-reset` because no active timer exists.
- Event stream is separate from state stream and does not emit current state snapshot.

## Typical Use Cases

- Trigger CSS bumps or progress resets.
- Telemetry and analytics for user notification flows.
- Debugging queue/timer behavior during development.

## Related

- Full state subscription: [State](/api/state)
- Timer controls and reset semantics: [Timers and Progress](/guide/timers-and-progress)
