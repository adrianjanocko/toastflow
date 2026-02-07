---
title: Theming
outline: deep
---

# Theming

Toastflow ships with CSS variables in `vue-toastflow/src/styles.css` (auto-imported by the package).

## Theme Layers

1. Global tokens (`--tf-toast-*`) control spacing, typography, borders, and motion.
2. Type presets (`default`, `loading`, `success`, `error`, `info`, `warning`) define colors.
3. Per-toast custom theme class via `theme` field can override token set on a single toast.

## Quick Global Override

```css
:root {
  --tf-toast-font-family: "Plus Jakarta Sans", sans-serif;
  --tf-toast-border-radius: 14px;
  --tf-toast-padding: 14px;
  --tf-toast-progress-height: 3px;

  --tf-toast-success-bg-default: #e8fff1;
  --tf-toast-success-border-default: #b8f4cf;
  --tf-toast-success-text-default: #0a7a43;
}
```

::: tip Reference
Global defaults that can also be configured in code: [Configuration](/api/configuration).
:::

## Custom Accent Theme Per Toast

When `theme` is set, Toastflow resolves it to `tf-toast-accent--${theme}` unless you already pass a full class name.

```ts
toast.show({
  type: "info",
  title: "New release",
  description: "v1.2.0 is out now",
  theme: "brand", // => tf-toast-accent--brand
});
```

```css
.tf-toast-accent--brand {
  --tf-toast-bg: #091a14;
  --tf-toast-color: #d9fff0;
  --tf-toast-border-color: #165f45;
  --tf-toast-title-color: #d9fff0;
  --tf-toast-description-color: #9bd9bf;
  --tf-toast-progress-bg: color-mix(in srgb, #34d399 25%, transparent);
  --tf-toast-progress-bar-bg: #34d399;
}
```

::: tip Reference
`theme` is a per-toast field on `show`/typed helpers. See [Toasts](/guide/toasts).
:::

## Animation Classes

You can override animation class names globally or per toast.

```ts
createToastflow({
  animation: {
    name: "MyToastMotion",
    bump: "MyToastBump",
    clearAll: "MyToastClearAll",
    update: "MyToastUpdate",
  },
});
```

Toastflow defaults:

- `Toastflow__animation`
- `Toastflow__animation-bump`
- `Toastflow__animation-clearAll`
- `Toastflow__animation-update`

::: tip Reference
Runtime behavior around duplicate/update transitions: [Events](/api/events).
:::

## Important Token Groups

| Group | Examples |
| --- | --- |
| Layout | `--tf-toast-padding`, `--tf-toast-gap`, `--tf-toast-border-radius` |
| Stack | `--tf-toast-stack-padding-top`, `--tf-toast-stack-padding-right` |
| Typography | `--tf-toast-title-font-size`, `--tf-toast-description-line-height` |
| Close button | `--tf-toast-close-size`, `--tf-toast-close-icon-size` |
| Action buttons | `--tf-toast-button-*` |
| Progress | `--tf-toast-progress-height`, `--tf-toast-progress-duration` |
| Motion | `--tf-toast-animation-in-duration`, `--tf-toast-animation-out-duration` |

## HTML Support

`supportHtml: true` allows HTML in `title` and `description`.

```ts
toast.info({
  title: "<strong>Release</strong>",
  description: "Read <a href='/changelog'>changelog</a>",
  supportHtml: true,
});
```

Use only trusted content. Toastflow does not sanitize HTML.

## Next

- Toast payload and rendering behavior: [Toasts](/guide/toasts)
- Full option reference: [Configuration](/api/configuration)
