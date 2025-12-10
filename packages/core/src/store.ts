import type {
  ToastConfig,
  ToastContext,
  ToastEvent,
  ToastId,
  ToastInstance,
  ToastLoadingConfig,
  ToastLoadingInput,
  ToastLoadingResult,
  ToastOptions,
  ToastOrder,
  ToastShowInput,
  ToastState,
  ToastStore,
  ToastType,
  ToastUpdateInput,
} from "./types";

type Listener = (state: ToastState) => void;
type EventListener = (event: ToastEvent) => void;
type TimeoutHandle = ReturnType<typeof setTimeout>;

interface TimerState {
  timeout: TimeoutHandle | null;
  startTime: number;
  remaining: number;
  paused: boolean;
}

const defaultCreatedAtFormatter = function (createdAt: number): string {
  try {
    return new Date(createdAt).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch (error) {
    return new Date(createdAt).toISOString();
  }
};

const defaults: ToastConfig = {
  offset: "16px",
  gap: "8px",
  zIndex: 9999,
  width: "350px",
  overflowScroll: false,
  duration: 5000,
  maxVisible: 5,
  position: "top-right",
  preventDuplicates: false,
  order: "newest",
  progressBar: true,
  pauseOnHover: true,
  pauseStrategy: "resume",
  animation: {
    name: "Toastflow__animation",
    bump: "Toastflow__animation-bump",
    clearAll: "Toastflow__animation-clearAll",
    update: "Toastflow__animation-update",
  },
  closeButton: true,
  closeOnClick: false,
  supportHtml: false,
  showCreatedAt: false,
  createdAtFormatter: defaultCreatedAtFormatter,
};

const HIDE_ANIMATION_DURATION = 50;

export function createToastStore(
  globalConfig: Partial<ToastConfig> = {},
): ToastStore {
  let state: ToastState = { toasts: [] };
  const listeners = new Set<Listener>();
  const eventListeners = new Set<EventListener>();
  const timers = new Map<ToastId, TimerState>();
  const promiseRuns = new Map<ToastId, symbol>();

  const resolvedGlobalConfig: ToastConfig = getConfig();

  function notify() {
    for (const listener of listeners) {
      listener(state);
    }
  }

  function emitEvent(event: ToastEvent) {
    for (const listener of eventListeners) {
      listener(event);
    }
  }

  function getState(): ToastState {
    return state;
  }

  function subscribe(listener: Listener): () => void {
    listeners.add(listener);
    listener(state);
    return () => {
      listeners.delete(listener);
    };
  }

  function subscribeEvents(listener: EventListener): () => void {
    eventListeners.add(listener);
    return () => {
      eventListeners.delete(listener);
    };
  }

  function show(options: ToastShowInput): ToastId {
    assertShowInput(options, "show");

    const toast = resolveConfig(resolvedGlobalConfig, options);

    if (toast.preventDuplicates) {
      const duplicate = state.toasts.find(function (t) {
        return (
          t.position === toast.position &&
          t.type === toast.type &&
          t.title === toast.title &&
          t.description === toast.description &&
          t.phase !== "leaving" &&
          t.phase !== "clear-all"
        );
      });

      if (duplicate) {
        const updated: ToastInstance = {
          ...duplicate,
          ...toast,
          id: duplicate.id,
          createdAt: duplicate.createdAt,
        };

        clearAutoDismiss(duplicate.id);
        scheduleAutoDismiss(updated);

        state = {
          toasts: state.toasts.map(function (t) {
            return t.id === updated.id ? updated : t;
          }),
        };

        emitEvent({ id: updated.id, kind: "duplicate" });
        notify();

        return duplicate.id;
      }
    }

    const id = crypto.randomUUID();
    const createdAt = Date.now();

    const toastInstance: ToastInstance = {
      ...toast,
      id,
      createdAt,
      phase: "enter",
    };

    const samePos = state.toasts.filter(function (t) {
      return (
        t.position === toastInstance.position &&
        t.phase !== "leaving" &&
        t.phase !== "clear-all"
      );
    });

    if (
      toastInstance.maxVisible > 0 &&
      samePos.length >= toastInstance.maxVisible
    ) {
      const toEvict = pickOverflowToast(samePos, toastInstance.order);
      if (toEvict) {
        dismiss(toEvict.id);
      }
    }

    state = {
      toasts: insertToast(state.toasts, toastInstance),
    };

    if (toastInstance.onMount) {
      toastInstance.onMount({
        id,
        position: toastInstance.position,
        type: toastInstance.type,
        title: toastInstance.title,
        description: toastInstance.description,
        createdAt: toastInstance.createdAt,
      });
    }

    scheduleAutoDismiss(toastInstance);
    notify();

    return id;
  }

  function loading<T>(
    input: ToastLoadingInput<T>,
    config: ToastLoadingConfig<T>,
  ): ToastLoadingResult<T> {
    const loadingOptions: ToastShowInput = {
      ...config.loading,
      type: "loading",
      duration: Infinity,
      progressBar: false,
    };

    assertShowInput(loadingOptions, "loading.loading");

    const runToken = Symbol("toastflow-loading-run");
    const toastId = show(loadingOptions);
    promiseRuns.set(toastId, runToken);

    function successOptions(value: T): ToastShowInput {
      const resolved =
        typeof config.success === "function"
          ? config.success(value)
          : config.success;

      assertContentFields(resolved, "loading.success");

      return {
        ...resolvedGlobalConfig,
        ...resolved,
        type: "success",
      };
    }

    function errorOptions(error: unknown): ToastShowInput {
      const resolved =
        typeof config.error === "function" ? config.error(error) : config.error;

      assertContentFields(resolved, "loading.error");

      return {
        ...resolvedGlobalConfig,
        ...resolved,
        type: "error",
      };
    }

    function applyIfActive(options: ToastShowInput) {
      if (promiseRuns.get(toastId) !== runToken) {
        return;
      }
      promiseRuns.delete(toastId);
      update(toastId, options);
    }

    function handleSuccess(value: T): T {
      applyIfActive(successOptions(value));
      return value;
    }

    function handleError(error: unknown): never {
      applyIfActive(errorOptions(error));
      throw error;
    }

    let task: Promise<T>;
    try {
      task = typeof input === "function" ? input() : input;
    } catch (error) {
      applyIfActive(errorOptions(error));
      const rejected = Promise.reject(error) as ToastLoadingResult<T>;
      rejected.toastId = toastId;
      return rejected;
    }

    const result = task.then(
      handleSuccess,
      handleError,
    ) as ToastLoadingResult<T>;
    result.toastId = toastId;
    return result;
  }

  function update(id: ToastId, options: ToastUpdateInput): void {
    const existing = state.toasts.find((t) => t.id === id);
    if (!existing) {
      return;
    }

    assertUpdateInput(options);

    if (options.type) {
      assertToastType(options.type, "update");
    }

    const merged: ToastOptions = {
      ...existing,
      ...options,
    };

    const resolved = resolveConfig(resolvedGlobalConfig, merged);

    const updated: ToastInstance = {
      ...existing,
      ...resolved,
      id: existing.id,
      createdAt: existing.createdAt,
    };

    clearAutoDismiss(id);
    scheduleAutoDismiss(updated);

    state = {
      toasts: state.toasts.map((t) => (t.id === id ? updated : t)),
    };

    emitEvent({ id, kind: "timer-reset" });
    emitEvent({ id, kind: "update" });
    notify();
  }

  function dismiss(id: ToastId): void {
    const toast = state.toasts.find((t) => t.id === id);
    if (!toast) {
      clearAutoDismiss(id);
      return;
    }

    clearAutoDismiss(id);
    promiseRuns.delete(id);

    const context: ToastContext = {
      id,
      position: toast.position,
      type: toast.type,
      title: toast.title,
      description: toast.description,
      createdAt: toast.createdAt,
    };

    if (toast.onClose) {
      toast.onClose(context);
    }

    state = {
      toasts: state.toasts.map(function (t) {
        if (t.id !== id) {
          return t;
        }
        return {
          ...t,
          phase: "leaving",
        };
      }),
    };

    notify();

    setTimeout(function () {
      const still = state.toasts.find((t) => t.id === id);
      if (!still) {
        return;
      }

      state = {
        toasts: state.toasts.filter((t) => t.id !== id),
      };

      if (toast.onUnmount) {
        toast.onUnmount(context);
      }

      notify();
    }, HIDE_ANIMATION_DURATION);
  }

  function dismissAll(): void {
    if (!state.toasts.length) {
      return;
    }

    const current = state.toasts;

    for (const toast of current) {
      clearAutoDismiss(toast.id);
      promiseRuns.delete(toast.id);

      const context: ToastContext = {
        id: toast.id,
        position: toast.position,
        type: toast.type,
        title: toast.title,
        description: toast.description,
        createdAt: toast.createdAt,
      };

      if (toast.onClose) {
        toast.onClose(context);
      }
    }

    state = {
      toasts: state.toasts.map(function (t) {
        return {
          ...t,
          phase: "clear-all",
        };
      }),
    };

    notify();

    setTimeout(function () {
      for (const toast of current) {
        const context: ToastContext = {
          id: toast.id,
          position: toast.position,
          type: toast.type,
          title: toast.title,
          description: toast.description,
          createdAt: toast.createdAt,
        };

        if (toast.onUnmount) {
          toast.onUnmount(context);
        }
      }

      state = { toasts: [] };
      notify();
    }, HIDE_ANIMATION_DURATION);
  }

  function scheduleAutoDismiss(toastInstance: ToastInstance) {
    if (
      !Number.isFinite(toastInstance.duration) ||
      toastInstance.duration <= 0
    ) {
      timers.delete(toastInstance.id);
      return;
    }

    const now = Date.now();
    const duration = toastInstance.duration;

    const handle: TimeoutHandle = setTimeout(() => {
      dismiss(toastInstance.id);
    }, duration);

    timers.set(toastInstance.id, {
      timeout: handle,
      startTime: now,
      remaining: duration,
      paused: false,
    });
  }

  function clearAutoDismiss(id: ToastId) {
    const timer = timers.get(id);
    if (timer && timer.timeout) {
      clearTimeout(timer.timeout);
    }
    timers.delete(id);
  }

  function pause(id: ToastId): void {
    const timer = timers.get(id);
    if (!timer || timer.paused) {
      return;
    }

    const now = Date.now();
    const elapsed = now - timer.startTime;
    const remaining = Math.max(timer.remaining - elapsed, 0);

    if (timer.timeout) {
      clearTimeout(timer.timeout);
    }

    timers.set(id, {
      timeout: null,
      startTime: now,
      remaining,
      paused: true,
    });
  }

  function resume(id: ToastId): void {
    const timer = timers.get(id);
    const toastInstance = state.toasts.find((t) => t.id === id);

    if (!toastInstance) {
      timers.delete(id);
      return;
    }

    if (
      toastInstance.duration === 0 ||
      !Number.isFinite(toastInstance.duration)
    ) {
      timers.delete(id);
      return;
    }

    const strategy = toastInstance.pauseStrategy;

    let remaining: number;

    if (!timer || !timer.paused) {
      remaining = toastInstance.duration;
      if (strategy === "reset") {
        emitEvent({ id, kind: "timer-reset" });
      }
    } else {
      if (strategy === "reset") {
        remaining = toastInstance.duration;
        emitEvent({ id, kind: "timer-reset" });
      } else {
        remaining = timer.remaining;
      }
    }

    if (remaining <= 0) {
      dismiss(id);
      return;
    }

    const now = Date.now();
    const handle: TimeoutHandle = setTimeout(() => {
      dismiss(id);
    }, remaining);

    timers.set(id, {
      timeout: handle,
      startTime: now,
      remaining,
      paused: false,
    });
  }

  function getConfig(): ToastConfig {
    return {
      ...defaults,
      ...globalConfig,
      animation: {
        ...defaults.animation,
        ...(globalConfig.animation ?? {}),
      },
    };
  }

  return {
    getState,
    subscribe,
    subscribeEvents,
    show,
    loading,
    update,
    dismiss,
    dismissAll,
    pause,
    resume,
    getConfig,
  };
}

// ------------- helpers -------------

const VALID_TYPES = new Set<ToastType>([
  "loading",
  "default",
  "success",
  "error",
  "info",
  "warning",
]);

function assertToastType(type: ToastType, caller: string) {
  if (!VALID_TYPES.has(type)) {
    throw new Error(`[toastflow-core] ${caller} requires a valid toast type.`);
  }
}

function assertContentFields(
  options: { title?: unknown; description?: unknown },
  caller: string,
): asserts options is { title?: string; description?: string } {
  const hasTitle = isNonEmptyString(options.title);
  const hasDescription = isNonEmptyString(options.description);

  if (!hasTitle && !hasDescription) {
    throw new Error(
      `[toastflow-core] ${caller} requires a non-empty title or description.`,
    );
  }
}

function assertShowInput(options: ToastShowInput, caller: string) {
  assertToastType(options.type, caller);
  assertContentFields(options, caller);
}

function assertUpdateInput(options: ToastUpdateInput) {
  assertContentFields(options, "update");
}

function isNonEmptyString(value: unknown): boolean {
  return typeof value === "string" && value.trim().length > 0;
}

function resolveConfig(
  base: ToastConfig,
  overrides: ToastOptions | ToastShowInput | ToastUpdateInput,
): ToastOptions {
  const {
    type,
    title,
    description,
    animation: animationOverride,
    ...restOverrides
  } = overrides as Partial<ToastOptions>;

  const animation = {
    ...base.animation,
    ...(animationOverride ?? {}),
  };

  return {
    ...base,
    ...restOverrides,
    animation,
    type: type ?? "default",
    title: title ?? "",
    description: description ?? "",
  };
}

function insertToast(
  existing: ToastInstance[],
  next: ToastInstance,
): ToastInstance[] {
  if (next.duration === 0 || !Number.isFinite(next.duration)) {
    next.progressBar = false;
  }

  const position = next.position;
  const order = next.order;

  const others = existing.filter((t) => t.position !== position);
  const samePos = existing.filter((t) => t.position === position);

  const isTop = position.startsWith("top-");

  if (order === "newest") {
    if (isTop) {
      return [...others, next, ...samePos];
    } else {
      return [...others, ...samePos, next];
    }
  }

  if (isTop) {
    return [...others, ...samePos, next];
  } else {
    return [...others, next, ...samePos];
  }
}

function pickOverflowToast(
  samePos: ToastInstance[],
  order: ToastOrder,
): ToastInstance | null {
  if (!samePos.length) {
    return null;
  }

  const first = samePos[0];
  if (!first) {
    return null;
  }

  if (order === "newest") {
    return samePos.slice(1).reduce((oldest, toast) => {
      return toast.createdAt < oldest.createdAt ? toast : oldest;
    }, first);
  }

  return samePos.slice(1).reduce((newest, toast) => {
    return toast.createdAt > newest.createdAt ? toast : newest;
  }, first);
}
