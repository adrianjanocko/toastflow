import type {
  ToastConfig,
  ToastContext,
  ToastEvent,
  ToastId,
  ToastInstance,
  ToastOptions,
  ToastOrder,
  ToastState,
  ToastStore,
} from "./types";
import { v4 as uuidv4 } from "uuid";

type Listener = (state: ToastState) => void;
type EventListener = (event: ToastEvent) => void;
type TimeoutHandle = ReturnType<typeof setTimeout>;

interface TimerState {
  timeout: TimeoutHandle | null;
  startTime: number;
  remaining: number;
  paused: boolean;
}

const defaults: ToastConfig = {
  offset: "16px",
  gap: "8px",
  zIndex: 9999,
  width: "350px",
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
  },
  closeButton: true,
  closeOnClick: false,
  supportHtml: false,
};

export function createToastStore(
  globalConfig: Partial<ToastConfig> = {},
): ToastStore {
  let state: ToastState = { toasts: [] };
  const listeners = new Set<Listener>();
  const eventListeners = new Set<EventListener>();
  const timers = new Map<ToastId, TimerState>();

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

  function show(options: ToastOptions): ToastId {
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

    const id = uuidv4();
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

  function update(id: ToastId, options: Partial<ToastOptions>): void {
    const existing = state.toasts.find((t) => t.id === id);
    if (!existing) {
      return;
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
    notify();
  }

  const HIDE_ANIMATION_DURATION = 50;

  function dismiss(id: ToastId): void {
    const toast = state.toasts.find((t) => t.id === id);
    if (!toast) {
      clearAutoDismiss(id);
      return;
    }

    clearAutoDismiss(id);

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
    };
  }

  return {
    getState,
    subscribe,
    subscribeEvents,
    show,
    update,
    dismiss,
    dismissAll,
    pause,
    resume,
    getConfig,
  };
}

// ------------- helpers -------------

function resolveConfig(
  base: ToastConfig,
  overrides: ToastOptions,
): ToastOptions {
  return {
    ...base,
    ...overrides,
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

  if (order === "newest") {
    let oldest = samePos[0];
    for (const t of samePos) {
      if (t.createdAt < oldest.createdAt) {
        oldest = t;
      }
    }
    return oldest;
  }

  let newest = samePos[0];
  for (const t of samePos) {
    if (t.createdAt > newest.createdAt) {
      newest = t;
    }
  }

  return newest;
}
