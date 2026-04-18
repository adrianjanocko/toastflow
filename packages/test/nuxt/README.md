# 🧪 Nuxt Toastflow — Test App

> Local smoke test for [`nuxt-toastflow`](../../packages/nuxt). Exercises `useToast()` across multiple scenarios.

### 🎯 Test Scenarios

- ✅ Basic type toasts (`success`, `error`, `warning`, `info`)
- 🔄 `show` → `update` flows
- ⏳ `loading` → success / error flows
- 📚 Queue & `maxVisible` behavior
- 🚫 Duplicate prevention
- 🗑️ Dismiss single / dismiss all

---

### 📥 Setup

```bash
pnpm install                              # from monorepo root
```

### 🖥️ Dev

```bash
pnpm --filter test-nuxt-toastflow dev     # http://localhost:3000
```

### 🔨 Build & Preview

```bash
pnpm --filter test-nuxt-toastflow build
pnpm --filter test-nuxt-toastflow preview
```
