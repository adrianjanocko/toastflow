---
title: Theming
description: Customize toast appearance with CSS variables, accent themes, and per-toast style overrides.
outline: deep
---

# Theming

Toastflow ships with CSS variables (auto-imported by the `vue-toastflow` package entry).

## Theme Layers

1. Global tokens (`--tf-toast-*`) control spacing, typography, borders, and motion.
2. Type presets (`default`, `loading`, `success`, `error`, `info`, `warning`, `custom`) define colors.
3. Per-toast custom theme class via `theme` field can override token set on a single toast.
4. Per-toast `css` object for inline CSS variable overrides from code.

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

## Inline CSS Overrides

Use the `css` object to override any visual token per toast — no CSS file needed.

```ts
toast.custom({
  title: "Custom accent",
  description: "Using inline CSS overrides",
  css: {
    accentColor: "#7c3aed",
    iconColor: "#7c3aed",
  },
});
```

`accentColor` is a shorthand that sets `--tf-toast-color`, `--tf-toast-title-color`, `--tf-toast-description-color`, and `--tf-toast-progress-bar-bg` at once. Individual properties always override the shorthand:

```ts
toast.custom({
  title: "Fine-grained control",
  description: "Mix shorthand with individual overrides",
  css: {
    accentColor: "#7c3aed",
    descriptionColor: "#a78bfa", // overrides accentColor for description
    bg: "#1e1b4b",
    borderColor: "#4c1d95",
  },
});
```

`color` also cascades to `titleColor` and `descriptionColor` when those are not explicitly set. This is needed because each toast type accent class pins those variables to type-specific values — without the cascade, a plain `color` override would not affect the title or description:

```ts
toast.info({
  title: "Branded info",
  description: "Title and description inherit from color.",
  css: {
    bg: "#c33232",
    color: "#fff7f2",         // → also sets titleColor + descriptionColor
    descriptionColor: "#fdeae2", // explicit override for description only
  },
});
```

- Every property maps 1:1 to a CSS custom property (e.g. `bg` → `--tf-toast-bg`).
- Works with any toast type, not just `custom`.
- When both `theme` (CSS class) and `css` (inline) are set, inline values take precedence.

## Hiding The Icon

Use `showIcon: false` to hide the icon for a specific toast or globally.

```ts
toast.info({
  title: "No icon",
  showIcon: false,
});
```

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

| Group          | Examples                                                                |
| -------------- | ----------------------------------------------------------------------- |
| Layout         | `--tf-toast-padding`, `--tf-toast-gap`, `--tf-toast-border-radius`      |
| Stack          | `--tf-toast-stack-padding-top`, `--tf-toast-stack-padding-right`        |
| Typography     | `--tf-toast-title-font-size`, `--tf-toast-description-line-height`      |
| Close button   | `--tf-toast-close-size`, `--tf-toast-close-icon-size`                   |
| Action buttons | `--tf-toast-button-*`                                                   |
| Progress       | `--tf-toast-progress-height`, `--tf-toast-progress-duration`            |
| Motion         | `--tf-toast-animation-in-duration`, `--tf-toast-animation-out-duration` |

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
