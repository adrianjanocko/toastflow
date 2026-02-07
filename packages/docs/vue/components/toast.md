---
title: Toast
outline: deep
---

# Toast

`<Toast />` renders a single toast card.

It is used internally by `<ToastContainer />`, but can also be used standalone.

## Props

| Prop | Type | Required | Description |
| --- | --- | --- | --- |
| `toast` | `ToastStandaloneInstance \| ToastInstance` | yes | Toast payload |
| `progressResetKey` | `number` | no | Changes restart progress animation |
| `duplicateKey` | `number` | no | Changes trigger bump animation |
| `updateKey` | `number` | no | Changes trigger update animation |
| `bumpAnimationClass` | `string` | no | Duplicate animation class |
| `clearAllAnimationClass` | `string` | no | Clear-all animation class |
| `updateAnimationClass` | `string` | no | Update animation class |

## Events

| Event | Payload | Meaning |
| --- | --- | --- |
| `dismiss` | `ToastId` | Request dismissal |

## Slot Support

Named slots:

- `icon`
- `progress`
- `created-at`
- `close-icon`
- default slot for body extension

See [Slots](/api/slots) for details.

## Accessibility Behavior

- Role is `alert` for `error` and `warning`, otherwise `status`.
- `aria-live` is `assertive` for `error` and `warning`, otherwise `polite`.
- ARIA labels are generated from title, description, and created-at text.

## Standalone Mode

When using `<Toast />` directly with partial data:

- missing `id` is auto-generated from timestamp
- missing `type` defaults to `default`
- missing `createdAt` defaults to `Date.now()`
- `progressBar` defaults to `false`
- `duration` defaults to `Infinity`

## Click And Interaction Rules

- Body click calls `onClick` if provided.
- If `closeOnClick` is true, body click also dismisses.
- Hover or touch pause uses `pauseOnHover` and finite `duration`.

## Related

- Container behavior and transitions: [ToastContainer](/components/toast-container)
- Progress renderer: [ToastProgress](/components/toast-progress)
