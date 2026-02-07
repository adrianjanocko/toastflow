---
title: Slots
outline: deep
---

# Slots

Toastflow provides slot APIs on `<ToastContainer />` and `<Toast />`.

## `ToastContainer` Default Slot

When you provide default slot content to `<ToastContainer>`, you switch to headless card rendering while keeping Toastflow store logic.

Slot props:

| Prop | Type | Meaning |
| --- | --- | --- |
| `toast` | `ToastInstance` | Current toast item |
| `progressResetKey` | `number` | Changes when timer/progress should restart |
| `duplicateKey` | `number` | Changes when duplicate event is emitted |
| `updateKey` | `number` | Changes when update event is emitted |
| `bumpAnimationClass` | `string` | Class name for duplicate bump animation |
| `clearAllAnimationClass` | `string` | Class name for clear-all animation |
| `updateAnimationClass` | `string` | Class name for update animation |
| `dismiss` | `(id: ToastId) => void` | Dismiss helper |

Example:

```vue
<ToastContainer v-slot="{ toast, dismiss, bumpAnimationClass }">
  <article :class="['my-toast', toast.type, bumpAnimationClass]">
    <h4>{{ toast.title }}</h4>
    <p v-if="toast.description">{{ toast.description }}</p>
    <button @click="dismiss(toast.id)">Close</button>
  </article>
</ToastContainer>
```

## `Toast` Slots

`<Toast />` exposes named slots for local customization.

| Slot | Slot props | Purpose |
| --- | --- | --- |
| `default` | `{ toast }` | Add extra content inside body |
| `icon` | `{ toast }` | Replace default icon component |
| `progress` | `{ toast }` | Replace progress renderer |
| `created-at` | `{ toast, formatted }` | Customize created-at rendering |
| `close-icon` | `{ toast }` | Replace close button icon |

## `Toast` Event

`<Toast />` emits:

- `dismiss` with `ToastId`

Used by container to call store dismiss action.

## Related

- Headless usage pattern: [Controlled Store](/guide/controlled-store)
- Component prop contracts: [ToastContainer](/components/toast-container), [Toast](/components/toast)
