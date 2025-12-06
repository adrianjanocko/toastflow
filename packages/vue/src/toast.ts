import {
  ToastConfig,
  ToastContentInput,
  ToastEvent,
  ToastId,
  ToastLoadingConfig,
  ToastLoadingInput,
  ToastLoadingResult,
  ToastShowInput,
  ToastState,
  ToastStore,
  ToastUpdateInput,
} from "toastflow-core";

const GLOBAL_STORE_KEY = "__vue_toastflow_store__";
type GlobalWithStore = typeof globalThis & { [GLOBAL_STORE_KEY]?: ToastStore };

let globalStore: ToastStore | null = null;

export function setToastStore(store: ToastStore) {
  globalStore = store;
  try {
    (globalThis as GlobalWithStore)[GLOBAL_STORE_KEY] = store;
  } catch {
    // ignore if globalThis is not writable
  }
}

export function getToastStore(): ToastStore {
  if (!globalStore) {
    globalStore = (globalThis as GlobalWithStore)[GLOBAL_STORE_KEY] ?? null;
  }
  if (!globalStore) {
    throw new Error(
      "[vue-toastflow] Toast store not initialized. Did you install the plugin?",
    );
  }
  return globalStore;
}

export const toast = {
  getState(): ToastState {
    return getToastStore().getState();
  },
  subscribeEvents(listener: (event: ToastEvent) => void): () => void {
    return getToastStore().subscribeEvents(listener);
  },
  show(options: ToastShowInput): ToastId {
    return getToastStore().show(options);
  },
  loading<T>(
    input: ToastLoadingInput<T>,
    config: ToastLoadingConfig<T>,
  ): ToastLoadingResult<T> {
    return getToastStore().loading(input, config);
  },
  update(id: ToastId, options: ToastUpdateInput): void {
    return getToastStore().update(id, options);
  },
  dismiss(id: ToastId): void {
    return getToastStore().dismiss(id);
  },
  dismissAll(): void {
    return getToastStore().dismissAll();
  },
  pause(id: ToastId): void {
    return getToastStore().pause(id);
  },
  resume(id: ToastId): void {
    return getToastStore().resume(id);
  },
  getConfig(): ToastConfig {
    return getToastStore().getConfig();
  },

  toast(options: ToastContentInput): ToastId {
    return getToastStore().show({ ...options, type: "default" });
  },
  success(options: ToastContentInput): ToastId {
    return getToastStore().show({ ...options, type: "success" });
  },
  error(options: ToastContentInput): ToastId {
    return getToastStore().show({ ...options, type: "error" });
  },
  info(options: ToastContentInput): ToastId {
    return getToastStore().show({ ...options, type: "info" });
  },
  warning(options: ToastContentInput): ToastId {
    return getToastStore().show({ ...options, type: "warning" });
  },
};
