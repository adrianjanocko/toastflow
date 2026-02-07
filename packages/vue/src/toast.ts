import type {
  ToastConfig,
  ToastContentInput,
  ToastEvent,
  ToastId,
  ToastLoadingConfig,
  ToastLoadingInput,
  ToastLoadingResult,
  ToastShowInput,
  ToastShowOptions,
  ToastState,
  ToastStore,
  ToastTextInput,
  ToastType,
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

type TypedToastShowOptions = Omit<ToastShowOptions, "type">;

function createToastCaller<T extends Exclude<ToastType, "loading"> | undefined>(
  type?: T,
) {
  type Options = T extends undefined ? ToastShowOptions : TypedToastShowOptions;

  function showTypedToast(
    options: T extends undefined ? ToastShowInput : ToastContentInput,
  ): ToastId;
  function showTypedToast(
    content: string | ToastTextInput,
    options?: Options,
  ): ToastId;
  function showTypedToast(
    arg1: ToastShowInput | ToastContentInput | ToastTextInput | string,
    arg2?: Options,
  ): ToastId {
    if (typeof arg1 === "string" || arg2 !== undefined) {
      const merged =
        type === undefined
          ? (arg2 as ToastShowOptions | undefined)
          : ({ ...(arg2 ?? {}), type } as ToastShowOptions);

      return getToastStore().show(arg1 as string | ToastTextInput, merged);
    }

    if (type === undefined) {
      return getToastStore().show(arg1 as ToastShowInput);
    }

    return getToastStore().show({
      ...(arg1 as ToastContentInput),
      type,
    });
  }

  return showTypedToast;
}

export const toast = {
  getState(): ToastState {
    return getToastStore().getState();
  },
  subscribe(listener: (state: ToastState) => void): () => void {
    return getToastStore().subscribe(listener);
  },
  subscribeEvents(listener: (event: ToastEvent) => void): () => void {
    return getToastStore().subscribeEvents(listener);
  },
  show: createToastCaller(),
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
  pauseQueue(): void {
    return getToastStore().pauseQueue();
  },
  resumeQueue(): void {
    return getToastStore().resumeQueue();
  },
  getConfig(): ToastConfig {
    return getToastStore().getConfig();
  },

  default: createToastCaller("default"),
  success: createToastCaller("success"),
  error: createToastCaller("error"),
  info: createToastCaller("info"),
  warning: createToastCaller("warning"),
};
