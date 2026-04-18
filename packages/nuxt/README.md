<p align="center">
  <img src="../../assets/banner.png" alt="Toastflow" width="100%" />
</p>

<h1 align="center">💚 nuxt-toastflow</h1>

<p align="center">
  <strong>Nuxt module for Toastflow</strong> — auto-imports, SSR support, and zero-config setup.
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/nuxt-toastflow"><img src="https://img.shields.io/npm/v/nuxt-toastflow?color=00dc82&style=flat-square" alt="npm version" /></a>
  <a href="https://www.npmjs.com/package/nuxt-toastflow"><img src="https://img.shields.io/npm/dm/nuxt-toastflow?style=flat-square" alt="npm downloads" /></a>
  <a href="../../LICENSE"><img src="https://img.shields.io/github/license/adrianjanocko/toastflow?style=flat-square" alt="License" /></a>
</p>

<p align="center">
  <a href="https://docs.toastflow.top/">📖 Docs</a> · <a href="https://toastflow.top/">🎮 Playground</a> · <a href="https://docs.toastflow.top/comparisons/overview">⚔️ Comparisons</a>
</p>

---

## 🚀 Quick Start

**1. Install**

```bash
pnpm add nuxt-toastflow
```

**2. Add the module**

```ts
// nuxt.config.ts
export default defineNuxtConfig({
  modules: ["nuxt-toastflow"],
  toastflow: {
    config: {
      position: "top-right",
      duration: 5000,
    },
  },
});
```

**3. Toast away 🎉**

```vue
<!-- app.vue -->
<script setup lang="ts">
toast.success({
  title: "Saved",
  description: "Your changes are live.",
});
</script>

<template>
  <ToastContainer />
  <NuxtPage />
</template>
```

> 💡 Both `toast` and `useToast()` are auto-imported — no manual imports needed!

## ⚙️ Module Options

| Option             | Type                   |      Default       | Description                                |
| :----------------- | :--------------------- | :----------------: | :----------------------------------------- |
| 🛠️ `config`        | `Partial<ToastConfig>` |        `{}`        | Toast configuration passed to the plugin   |
| 🎨 `css`           | `boolean`              |       `true`       | Include default styles                     |
| 🧱 `componentName` | `string \| false`      | `"ToastContainer"` | Auto-registered client-only component name |

<details>
<summary>💡 <strong>How does it work under the hood?</strong></summary>

<br />

- `ToastContainer` is auto-registered as a **client-only** component
- `toast` and `useToast()` are **auto-imported** — use either one
- Styles are injected automatically unless `css: false`

</details>

## 📄 License

[MIT](../../LICENSE) — made with ❤️ by [@adrianjanocko](https://github.com/adrianjanocko)
