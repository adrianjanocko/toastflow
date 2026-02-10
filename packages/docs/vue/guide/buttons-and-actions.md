---
title: Buttons and Actions
outline: deep
---

# Buttons and Actions

Toastflow supports inline action buttons through the `buttons` config.

## Basic Button Group

```ts
toast.info({
  title: "Changes saved",
  description: "Undo this action?",
  buttons: {
    alignment: "bottom-right",
    buttons: [
      {
        id: "undo",
        label: "Undo",
        onClick(ctx) {
          console.log("Undo", ctx.id, ctx.type);
        },
      },
      {
        id: "details",
        html: "<strong>Details</strong>",
        ariaLabel: "Open details",
        onClick(ctx) {
          window.location.href = `/activity/${ctx.id}`;
        },
      },
    ],
  },
});
```

::: tip Reference
Button payload types and contracts: [Configuration](/api/configuration).  
Rendered structure and classes: [Toast](/components/toast).
:::

## Button Config

```ts
type ToastButtonsAlignment =
  | "top-left"
  | "top-right"
  | "center-left"
  | "center-right"
  | "bottom-left"
  | "bottom-right";
```

`ToastButtonsConfig` fields:

- `alignment` (optional, defaults to `"bottom-right"`)
- `layout` (`"row"` default, or `"column"`)
- `buttons` (optional, defaults to no buttons)
- `gap` (optional, defaults to half toast gap)
- `contentGap` (optional, defaults to half toast gap)

Each button can use either:

- `label`
- `html`

Both button types support:

- `id`
- `ariaLabel`
- `className`
- `onClick(ctx, event)`

::: tip Reference
Headless rendering with custom markup: [Controlled Store](/guide/controlled-store) and [Slots](/api/slots).
:::

## Alignment Behavior With Right Text Layout

If toast `alignment` is `right`, left and right button alignments are mirrored so visual flow stays consistent.

## Layout Direction

Use `buttons.layout` to control how the action group is positioned around toast content.

```ts
toast.info({
  title: "Release 1.2.0",
  description: "Pick an action",
  buttons: {
    alignment: "bottom-right",
    layout: "column",
    buttons: [{ label: "Open changelog" }, { label: "Remind me later" }],
  },
});
```

- `layout: "row"` keeps the current side-by-side action flow.
- `layout: "column"` places the action group in column flow (top/bottom for `top-*`/`bottom-*`, side for `center-*`),
  while buttons stay side-by-side.

## Close Interactions

- `closeButton`: show or hide floating close button.
- `closeOnClick`: dismiss when clicking the toast body.
- `onClick`: custom body click callback.
- `onClose`: callback fired right before toast starts leaving.

```ts
toast.warning({
  title: "Action required",
  description: "Click to dismiss",
  closeOnClick: true,
  onClick(ctx) {
    console.log("Clicked", ctx.id);
  },
  onClose(ctx) {
    console.log("Closing", ctx.id);
  },
});
```

::: tip Reference
Action methods (`dismiss`, `dismissAll`, `update`) are documented in [Actions](/api/actions).
:::

## Created-At Badge

```ts
toast.default({
  title: "Background sync",
  description: "Started now",
  showCreatedAt: true,
  createdAtFormatter(ts) {
    return new Date(ts).toLocaleTimeString();
  },
});
```

If formatter throws (or is missing), the Vue renderer falls back to the default time formatter.

::: tip Reference
Toast payload fields including `showCreatedAt` and formatter behavior: [Toasts](/guide/toasts).
:::

## Next

- Global helper and subscriptions: [Programmatic API](/guide/programmatic-api)
- Renderer customization via slots: [Slots](/api/slots)
