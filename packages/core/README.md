<h1 align="center">⚙️ toastflow-core</h1>

<p align="center">
  <strong>Framework-agnostic core engine</strong> for Toastflow — store, timers, queue, and events.
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/toastflow-core"><img src="https://img.shields.io/npm/v/toastflow-core?color=888&style=flat-square" alt="npm version" /></a>
  <a href="https://www.npmjs.com/package/toastflow-core"><img src="https://img.shields.io/npm/dm/toastflow-core?style=flat-square" alt="npm downloads" /></a>
  <a href="../../LICENSE"><img src="https://img.shields.io/github/license/adrianjanocko/toastflow?style=flat-square" alt="License" /></a>
</p>

<p align="center">
  <a href="https://docs.toastflow.top/">📖 Docs</a> · <a href="https://toastflow.top/">🎮 Playground</a>
</p>

---

> 🧩 This is the **headless core** — no UI, no framework dependency. Use [`vue-toastflow`](https://www.npmjs.com/package/vue-toastflow) or [`nuxt-toastflow`](https://www.npmjs.com/package/nuxt-toastflow) for a ready-to-use solution.

## 📦 What's Included

|     | Feature                                |
| :-: | :------------------------------------- |
| 🏪  | Typed toast store (`createToastStore`) |
| 📡  | State & event subscriptions            |
| 📚  | Queue management & `maxVisible`        |
| ⏱️  | Timer controls & progress tracking     |

## 🚀 Quick Start

**1. Install**

```bash
pnpm add toastflow-core
```

**2. Create a store and go 🎯**

```ts
import { createToastStore } from "toastflow-core";

const store = createToastStore({ position: "top-right", duration: 5000 });

// Show → Update → Dismiss
const id = store.show({ type: "info", title: "Core toast" });
store.update(id, { type: "success", title: "Updated!" });
store.dismiss(id);
```

## 📄 License

[MIT](../../LICENSE) — made with ❤️ by [@adrianjanocko](https://github.com/adrianjanocko)
