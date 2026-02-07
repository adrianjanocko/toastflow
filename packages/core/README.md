# @toastflow-core

Framework-agnostic core engine for Toastflow

## 📚 Documentation

- Docs: https://docs.toastflow.top/
- Playground: https://toastflow.top/
- npm: https://www.npmjs.com/package/toastflow-core

## 📦 Includes

- typed toast store (`createToastStore`)
- state subscriptions
- event subscriptions
- queue and timer controls

## 🚀 Quick Start

```bash
pnpm add toastflow-core
```

```ts
import { createToastStore } from "toastflow-core";

const store = createToastStore({ position: "top-right", duration: 5000 });
const id = store.show({ type: "info", title: "Core toast" });

store.update(id, { type: "success", title: "Updated" });
store.dismiss(id);
```

## 📄 License

MIT

