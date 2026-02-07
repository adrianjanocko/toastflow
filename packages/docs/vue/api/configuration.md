---
title: Configuration
outline: deep
---

# Configuration

Toastflow resolves config in this order:

1. Internal defaults (`toastflow-core`).
2. Global config passed to `createToastflow(...)` or `createToastStore(...)`.
3. Per-toast overrides in `show`, typed helpers, `loading`, or `update`.

## Full Option Reference

| Option | Type | Default | Notes |
| --- | --- | --- | --- |
| `offset` | `string` | `"16px"` | Distance of stack from viewport edge. |
| `gap` | `string` | `"8px"` | Gap between toasts in the same stack. |
| `zIndex` | `number` | `9999` | Applied to root container layer. |
| `width` | `string` | `"350px"` | Default toast width. |
| `overflowScroll` | `boolean` | `false` | Enables stack scroll on overflow. Vue renderer supports it on top positions only. |
| `duration` | `number` | `5000` | Auto-dismiss delay in ms. `Infinity` or `0` disables scheduling. |
| `maxVisible` | `number` | `5` | Max visible toasts per position. `<= 0` means no cap. |
| `queue` | `boolean` | `false` | Queue overflowed toasts instead of evicting visible ones. |
| `position` | `ToastPosition` | `"top-right"` | One of six viewport anchors. |
| `alignment` | `"left" \| "right"` | `"left"` | Text/content direction inside toast body. |
| `progressAlignment` | `"left-to-right" \| "right-to-left"` | `"right-to-left"` | Progress animation direction. |
| `preventDuplicates` | `boolean` | `false` | De-duplicates by `position + type + title + description`. |
| `order` | `"newest" \| "oldest"` | `"newest"` | Controls insert order and eviction target. |
| `progressBar` | `boolean` | `true` | Progress bar for finite durations. |
| `pauseOnHover` | `boolean` | `true` | Pause timer while hovered or touch-held. |
| `pauseStrategy` | `"resume" \| "reset"` | `"resume"` | Resume with remaining time or restart full duration. |
| `animation` | `Partial<ToastAnimation>` | See below | CSS classes for transitions and bump/update effects. |
| `closeButton` | `boolean` | `true` | Show floating close button. |
| `closeOnClick` | `boolean` | `false` | Dismiss when clicking toast body. |
| `buttons` | `ToastButtonsConfig` | `undefined` | Inline action buttons config. |
| `supportHtml` | `boolean` | `false` | Allows HTML in `title` and `description`. |
| `showCreatedAt` | `boolean` | `false` | Shows created-at text badge. |
| `createdAtFormatter` | `(createdAt: number) => string` | locale time formatter | Formatter for created-at display text. |
| `onMount` | `(ctx) => void` | `undefined` | Called after toast enters state. |
| `onUnmount` | `(ctx) => void` | `undefined` | Called after toast is removed from state. |
| `onClick` | `(ctx, event) => void` | `undefined` | Called when toast body is clicked. |
| `onClose` | `(ctx) => void` | `undefined` | Called right before leaving phase starts. |

Default `animation` object:

```ts
{
  name: "Toastflow__animation",
  bump: "Toastflow__animation-bump",
  clearAll: "Toastflow__animation-clearAll",
  update: "Toastflow__animation-update"
}
```

## Buttons Config

```ts
interface ToastButtonsConfig {
  alignment:
    | "top-left"
    | "top-right"
    | "center-left"
    | "center-right"
    | "bottom-left"
    | "bottom-right";
  buttons: ToastButton[];
  gap?: string;
  contentGap?: string;
}
```

`ToastButton` supports either `label` or `html`, plus optional `id`, `ariaLabel`, `className`, and `onClick(ctx, event)`.

## Example Global Config

```ts
import { createToastflow } from "vue-toastflow";

app.use(
  createToastflow({
    position: "top-right",
    duration: 5000,
    maxVisible: 4,
    queue: true,
    pauseStrategy: "resume",
    preventDuplicates: true,
    closeButton: true,
    supportHtml: false,
    animation: {
      name: "Toastflow__animation",
    },
  }),
);
```

## Example Per-Toast Overrides

```ts
toast.warning({
  title: "Server maintenance",
  position: "bottom-center",
  duration: 15000,
  closeOnClick: true,
  buttons: {
    alignment: "bottom-right",
    buttons: [{ label: "Dismiss" }],
  },
});
```

## Related

- Runtime shape and lifecycle markers: [State](/api/state)
- Mutating methods and validation rules: [Actions](/api/actions)
