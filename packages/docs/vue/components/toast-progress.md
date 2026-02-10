---
title: ToastProgress
outline: deep
---

# ToastProgress

`<ToastProgress />` renders toast progress bar animation.

## Props

| Prop                | Type                                 | Default           | Description              |
| ------------------- | ------------------------------------ | ----------------- | ------------------------ |
| `type`              | `ToastType`                          | required          | Type-based style context |
| `progressAlignment` | `"left-to-right" \| "right-to-left"` | `"right-to-left"` | Progress direction       |

## Behavior

- Duration is controlled by CSS variable `--tf-toast-progress-duration`.
- Container sets this variable from toast duration.
- Animation fills or drains based on alignment.

## Example Override

```vue
<ToastContainer v-slot="{ toast }">
  <Toast :toast="toast">
    <template #progress>
      <ToastProgress :type="toast.type" progress-alignment="left-to-right" />
    </template>
  </Toast>
</ToastContainer>
```

## Styling Tokens

- `--tf-toast-progress-height`
- `--tf-toast-progress-bg`
- `--tf-toast-progress-bar-bg`
- `--tf-toast-progress-duration`

## Related

- Timer rules and pause behavior: [Timers and Progress](/guide/timers-and-progress)
- Card component integration: [Toast](/components/toast)
