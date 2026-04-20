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
3. Global color overrides via `--tf-toast-bg`, `--tf-toast-color`, `--tf-toast-border-color`, `--tf-toast-accent-color`, `--tf-toast-icon-color` on `:root` or `body`.
4. Per-toast custom theme class via `theme` field can override token set on a single toast.
5. Per-toast `css` object for inline CSS variable overrides from code.

## Quick Global Override

```css
:root {
  --tf-toast-font-family: "Plus Jakarta Sans", sans-serif;
  --tf-toast-border-radius: 14px;
  --tf-toast-padding: 14px;
  --tf-toast-progress-height: 3px;

  /* Override colors for all toasts regardless of type */
  --tf-toast-bg: #1e1b4b;
  --tf-toast-color: #e0e7ff;
  --tf-toast-border-color: #4c1d95;

  /* Or override per-type presets */
  --tf-toast-success-bg-default: #e8fff1;
  --tf-toast-success-border-default: #b8f4cf;
  --tf-toast-success-text-default: #0a7a43;
}
```

### Color Override Priority

Color-related vars (`--tf-toast-bg`, `--tf-toast-color`, etc.) follow this resolution order:

1. **Per-toast `css` prop** (inline style on the toast element)
2. **Global override** (`--tf-toast-bg` on `:root` or `body`)
3. **Accent class** (set by the toast type, e.g. success, error)
4. **Default preset** (`--tf-toast-normal-bg-default`)

`--tf-toast-color` also cascades to title and description colors — setting it globally overrides both unless `--tf-toast-title-color` or `--tf-toast-description-color` is explicitly set.

`--tf-toast-accent-color` is a CSS shorthand that sets `color`, `titleColor`, `descriptionColor`, and `progressBarBg` at once when set on `:root` or `body`.

`--tf-toast-icon-color` overrides the icon color for all toast types when set globally.

::: tip Reference
Global defaults that can also be configured in code: [Configuration](/api/configuration).
:::

### Tailwind CSS v4

Use `@layer base` to override Toastflow tokens in Tailwind v4:

```css
@layer base {
  :root {
    --tf-toast-bg: var(--color-background-subtle);
    --tf-toast-color: var(--color-foreground);
    --tf-toast-border-color: var(--color-border);
    --tf-toast-border-radius: var(--radius-lg);
  }
}
```

> `@theme` won't work for Toastflow overrides — Tailwind wraps `@theme` in `@layer theme`, which has lower priority than Toastflow's unlayered styles.

## Per-Type Color Override

Override colors for a specific toast type by changing its preset tokens:

```css
:root {
  --tf-toast-success-bg-default: #e8fff1;
  --tf-toast-success-border-default: #b8f4cf;
  --tf-toast-success-color-default: #0a7a43;
  --tf-toast-success-title-color-default: #065f30;
  --tf-toast-success-description-color-default: #0a7a43;
  --tf-toast-success-progress-bg-default: color-mix(
    in srgb,
    #22c55e 20%,
    transparent
  );
  --tf-toast-success-progress-bar-bg-default: #22c55e;
}
```

The same pattern works for all types — replace `success` with `error`, `info`, `warning`, `loading`, or `normal` (default).

> This changes the **default palette** for that type. Global overrides (`--tf-toast-bg`, etc.) and per-toast `css` still take priority.

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
    color: "#fff7f2", // → also sets titleColor + descriptionColor
    descriptionColor: "#fdeae2", // explicit override for description only
  },
});
```

- Every property maps 1:1 to a CSS custom property (e.g. `bg` → `--tf-toast-bg`).
- Works with any toast type, not just `custom`.
- When both `theme` (CSS class) and `css` (inline) are set, inline values take precedence.
- Values can reference CSS custom properties: `bg: "var(--color-background-subtle)"`. This lets you connect Toastflow to your existing design tokens from code.

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
| Color          | `--tf-toast-bg`, `--tf-toast-color`, `--tf-toast-border-color`          |
| Shorthands     | `--tf-toast-accent-color`, `--tf-toast-icon-color`                      |
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
