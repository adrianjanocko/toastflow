---
title: Icons
outline: deep
---

# Icons

`vue-toastflow` exports icon components used by default toast types.

## Exported Icons

- `ArrowPath`
- `Bell`
- `CheckCircle`
- `InfoCircle`
- `QuestionMarkCircle`
- `XCircle`
- `XMark`

## Default Type Mapping

| Toast type | Default icon         |
| ---------- | -------------------- |
| `loading`  | `ArrowPath`          |
| `default`  | `QuestionMarkCircle` |
| `success`  | `CheckCircle`        |
| `error`    | `XCircle`            |
| `warning`  | `Bell`               |
| `info`     | `InfoCircle`         |

## Replace Icons

Use `Toast` `icon` slot:

```vue
<ToastContainer v-slot="{ toast, dismiss }">
  <Toast :toast="toast" @dismiss="dismiss">
    <template #icon>
      <MyIcon class="my-icon" aria-hidden="true" />
    </template>
  </Toast>
</ToastContainer>
```

Use `close-icon` slot to replace the close glyph.

## Related

- Card slots and component behavior: [Toast](/components/toast)
- CSS token system for icon colors: [Theming](/guide/theming)
