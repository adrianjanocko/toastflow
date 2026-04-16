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
  ToastPosition,
  ToastShowInput,
  ToastShowOptions,
  ToastState,
  ToastStore,
  ToastTextInput,
  ToastType,
  ToastUpdateInput,
} from "./types";
import { defaultCreatedAtFormatter, generateUuid, isNumberFinite, VALID_TOAST_TYPES, } from "./util";

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
  overflowScroll: false,
  duration: 5000,
  maxVisible: 5,
  queue: false,
  position: "top-right",
  alignment: "left",
  progressAlignment: "right-to-left",
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
  showIcon: true,
  closeOnClick: false,
  swipeToDismiss: false,
  supportHtml: false,
  showCreatedAt: false,
  createdAtFormatter: defaultCreatedAtFormatter,
};

// delay before removing clear-all toasts from state (lets the CSS animation start)
const CLEAR_ALL_DELAY = 50;

export function createToastStore(
  globalConfig: Partial<ToastConfig> = {},
): ToastStore {
  let state: ToastState = { toasts: [], queue: [] };
  const listeners = new Set<Listener>();
  const eventListeners = new Set<EventListener>();
  const timers = new Map<ToastId, TimerState>();
  const promiseRuns = new Map<ToastId, symbol>();
  const queueByPosition = new Map<ToastPosition, ToastInstance[]>();
  let queuePaused = false;

  const resolvedGlobalConfig: ToastConfig = getConfig();

  function flattenQueue(): ToastInstance[] {
    const items: ToastInstance[] = [];
    for (const queued of queueByPosition.values()) {
      items.push(...queued);
    }
    return items;
  }

  function syncState(nextToasts: ToastInstance[] = state.toasts): void {
    state = {
      toasts: nextToasts,
      queue: flattenQueue(),
    };
  }

  function getVisibleAt(position: ToastPosition): ToastInstance[] {
    return state.toasts.filter(function (t) {
      return (
        t.position === position &&
        t.phase !== "leaving" &&
        t.phase !== "clear-all"
      );
    });
  }

  type LocatedToast =
    | { location: "visible"; toast: ToastInstance }
    | {
        location: "queue";
        toast: ToastInstance;
        position: ToastPosition;
        index: number;
      };

  function findToastById(id: ToastId): LocatedToast | null {
    const visible = state.toasts.find((t) => t.id === id);
    if (visible) {
      return { location: "visible", toast: visible };
    }

    for (const [position, queued] of queueByPosition.entries()) {
      const index = queued.findIndex((t) => t.id === id);
      if (index !== -1) {
        const toastAtIndex = queued[index];
        if (!toastAtIndex) {
          continue;
        }
        return {
          location: "queue",
          toast: toastAtIndex,
          position,
          index,
        };
      }
    }

    return null;
  }

  function findDuplicateToast(toast: ToastInstance): LocatedToast | null {
    const predicate = function (t: ToastInstance) {
      return (
        t.position === toast.position &&
        t.type === toast.type &&
        t.title === toast.title &&
        t.description === toast.description &&
        t.phase !== "leaving" &&
        t.phase !== "clear-all"
      );
    };

    const visible = state.toasts.find(predicate);
    if (visible) {
      return { location: "visible", toast: visible };
    }

    for (const [position, queued] of queueByPosition.entries()) {
      const index = queued.findIndex(predicate);
      if (index !== -1) {
        const toastAtIndex = queued[index];
        if (!toastAtIndex) {
          continue;
        }
        return {
          location: "queue",
          toast: toastAtIndex,
          position,
          index,
        };
      }
    }

    return null;
  }

  function replaceQueuedToast(
    position: ToastPosition,
    index: number,
    toast: ToastInstance,
  ): void {
    const queued = queueByPosition.get(position);
    if (!queued) {
      return;
    }
    queued[index] = toast;
    queueByPosition.set(position, queued);
    syncState();
  }

  function removeQueuedToast(
    position: ToastPosition,
    index: number,
  ): ToastInstance | null {
    const queued = queueByPosition.get(position);
    if (!queued || index < 0 || index >= queued.length) {
      return null;
    }

    const [removed] = queued.splice(index, 1);

    if (!queued.length) {
      queueByPosition.delete(position);
    } else {
      queueByPosition.set(position, queued);
    }

    syncState();
    return removed ?? null;
  }

  function enqueueToast(toast: ToastInstance): void {
    const queued = queueByPosition.get(toast.position) ?? [];
    queued.push(toast);
    queueByPosition.set(toast.position, queued);
    syncState();
  }

  function dequeueNext(position: ToastPosition): ToastInstance | null {
    const queued = queueByPosition.get(position);
    if (!queued || !queued.length) {
      return null;
    }
    const next = queued.shift() ?? null;
    if (!queued.length) {
      queueByPosition.delete(position);
    } else {
      queueByPosition.set(position, queued);
    }
    syncState();
    return next;
  }

  function hasCapacityFor(toast: ToastInstance): boolean {
    if (toast.maxVisible <= 0) {
      return true;
    }
    const samePos = getVisibleAt(toast.position);
    return samePos.length < toast.maxVisible;
  }

  function processQueue(position: ToastPosition): void {
    if (queuePaused) {
      return;
    }

    let changed = false;

    while (true) {
      const nextQueued = queueByPosition.get(position)?.[0];
      if (!nextQueued) {
        break;
      }

      if (!hasCapacityFor(nextQueued)) {
        break;
      }

      const next = dequeueNext(position);
      if (!next) {
        break;
      }

      syncState(insertToast(state.toasts, next));

      if (next.onMount) {
        next.onMount(toContext(next));
      }

      scheduleAutoDismiss(next);
      changed = true;
    }

    if (changed) {
      notify();
    }
  }

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

  // Return the current toast state.
  function getState(): ToastState {
    return state;
  }

  // Subscribe to store updates and immediately receive the current state.
  function subscribe(listener: Listener): () => void {
    listeners.add(listener);
    listener(state);
    return () => {
      listeners.delete(listener);
    };
  }

  // Subscribe to toast lifecycle events only.
  function subscribeEvents(listener: EventListener): () => void {
    eventListeners.add(listener);
    return () => {
      eventListeners.delete(listener);
    };
  }

  // Show a toast, handling duplicates and auto-dismiss scheduling.
  function show(options: ToastShowInput): ToastId;
  function show(
    content: string | ToastTextInput,
    options?: ToastShowOptions,
  ): ToastId;
  function show(
    arg1: ToastShowInput | ToastTextInput | string,
    arg2?: ToastShowOptions,
  ): ToastId {
    const options = normalizeShowArgs(arg1, arg2);

    assertShowInput(options, "show");

    const toast = resolveConfig(resolvedGlobalConfig, options);
    const id = generateUuid();
    const createdAt = Date.now();

    const toastInstance: ToastInstance = {
      ...toast,
      id,
      createdAt,
      phase: "enter",
    };

    if (toastInstance.preventDuplicates) {
      const duplicate = findDuplicateToast(toastInstance);

      if (duplicate) {
        const updated: ToastInstance = {
          ...duplicate.toast,
          ...toastInstance,
          id: duplicate.toast.id,
          createdAt: duplicate.toast.createdAt,
        };

        clearAutoDismiss(duplicate.toast.id);

        if (duplicate.location === "visible") {
          scheduleAutoDismiss(updated);
          syncState(
            state.toasts.map(function (t) {
              return t.id === updated.id ? updated : t;
            }),
          );
        } else {
          replaceQueuedToast(duplicate.position, duplicate.index, updated);
        }

        emitEvent({ id: updated.id, kind: "duplicate" });
        notify();

        return duplicate.toast.id;
      }
    }

    if (!hasCapacityFor(toastInstance)) {
      if (toastInstance.queue) {
        enqueueToast(toastInstance);
        notify();
        return toastInstance.id;
      }

      const toEvict = pickOverflowToast(
        getVisibleAt(toastInstance.position),
        toastInstance.order,
        toastInstance.position,
      );
      if (toEvict) {
        dismiss(toEvict.id);
      }
    }

    syncState(insertToast(state.toasts, toastInstance));

    if (toastInstance.onMount) {
      toastInstance.onMount(toContext(toastInstance));
    }

    scheduleAutoDismiss(toastInstance);
    notify();

    return id;
  }

  // Wrap a promise with loading/success/error toast states.
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

  // Update an existing toast and reset its timer.
  function update(id: ToastId, options: ToastUpdateInput): void {
    const located = findToastById(id);
    if (!located) {
      return;
    }

    if (options.type) {
      assertToastType(options.type, "update");
    }

    // Deep-merge nested objects so partial updates don't lose existing sub-fields
    const merged: ToastOptions = {
      ...located.toast,
      ...options,
      animation: {
        ...located.toast.animation,
        ...(options.animation ?? {}),
      },
      buttons:
        located.toast.buttons || options.buttons
          ? {
              ...(located.toast.buttons ?? {}),
              ...(options.buttons ?? {}),
            }
          : undefined,
      css:
        located.toast.css || options.css
          ? {
              ...(located.toast.css ?? {}),
              ...(options.css ?? {}),
            }
          : undefined,
    };

    // Validate the merged result (not the raw input) has content
    assertContentFields(merged, "update");

    const updated: ToastInstance = {
      ...located.toast,
      ...merged,
      id: located.toast.id,
      createdAt: located.toast.createdAt,
    };

    if (located.location === "visible") {
      clearAutoDismiss(id);
      scheduleAutoDismiss(updated);
      syncState(state.toasts.map((t) => (t.id === id ? updated : t)));
      emitEvent({ id, kind: "timer-reset" });
    } else {
      replaceQueuedToast(located.position, located.index, updated);
    }

    emitEvent({ id, kind: "update" });
    notify();
  }

  // Hide a toast, run lifecycle callbacks, and let the renderer handle leave animation.
  function dismiss(id: ToastId): void {
    const located = findToastById(id);
    if (!located) {
      clearAutoDismiss(id);
      promiseRuns.delete(id);
      return;
    }

    clearAutoDismiss(id);
    promiseRuns.delete(id);

    const toast = located.toast;
    const context = toContext(toast);

    if (toast.onClose) {
      toast.onClose(context);
    }

    if (located.location === "queue") {
      removeQueuedToast(located.position, located.index);
      notify();
      return;
    }

    // Phase 1: mark as leaving so getVisibleAt frees the slot,
    // but keep in the array for one render frame so TransitionGroup
    // can capture the correct visual position.
    syncState(
      state.toasts.map(function (t) {
        if (t.id !== id) {
          return t;
        }
        return { ...t, phase: "leaving" };
      }),
    );

    notify();
    processQueue(toast.position);

    // Phase 2: remove after the current render cycle so the leave
    // animation starts from where the toast was actually visible.
    setTimeout(function () {
      const still = state.toasts.find(function (t) {
        return t.id === id;
      });
      if (!still) {
        return;
      }

      syncState(
        state.toasts.filter(function (t) {
          return t.id !== id;
        }),
      );

      if (toast.onUnmount) {
        toast.onUnmount(context);
      }

      notify();
      processQueue(toast.position);
    }, 0);
  }

  // Clear all toasts in their current positions.
  function dismissAll(): void {
    if (!state.toasts.length && !state.queue.length) {
      return;
    }

    const current = state.toasts;
    const queued = flattenQueue();

    for (const toast of current) {
      clearAutoDismiss(toast.id);
      promiseRuns.delete(toast.id);

      if (toast.onClose) {
        toast.onClose(toContext(toast));
      }
    }

    for (const toast of queued) {
      promiseRuns.delete(toast.id);

      if (toast.onClose) {
        toast.onClose(toContext(toast));
      }
    }

    // Clear queue immediately to prevent processQueue from dequeuing
    // toasts that already had onClose called during the animation delay.
    queueByPosition.clear();

    syncState(
      state.toasts.map(function (t) {
        return {
          ...t,
          phase: "clear-all",
        };
      }),
    );

    notify();

    setTimeout(function () {
      for (const toast of current) {
        if (toast.onUnmount) {
          toast.onUnmount(toContext(toast));
        }
      }

      syncState([]);
      notify();
    }, CLEAR_ALL_DELAY);
  }

  // Pause queue processing; queued toasts stay stored until resumed.
  function pauseQueue(): void {
    queuePaused = true;
  }

  // Resume queue processing and try to render queued toasts.
  function resumeQueue(): void {
    if (!queuePaused) {
      return;
    }
    queuePaused = false;
    for (const position of queueByPosition.keys()) {
      processQueue(position);
    }
  }

  function scheduleAutoDismiss(toastInstance: ToastInstance) {
    if (!isNumberFinite(toastInstance.duration)) {
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

  // Pause a toast timer and capture the remaining time.
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

  // Resume a paused toast timer according to its pause strategy.
  function resume(id: ToastId): void {
    const timer = timers.get(id);
    const toastInstance = state.toasts.find((t) => t.id === id);

    if (!toastInstance) {
      timers.delete(id);
      return;
    }

    if (!isNumberFinite(toastInstance.duration)) {
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

  // Return the resolved global configuration for this store.
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
    pauseQueue,
    resumeQueue,
    pause,
    resume,
    getConfig,
  };
}

// ------------- helpers -------------

function toContext(t: ToastInstance): ToastContext {
  return {
    id: t.id,
    position: t.position,
    type: t.type,
    title: t.title,
    description: t.description,
    createdAt: t.createdAt,
  };
}

function normalizeShowArgs(
  arg1: ToastShowInput | ToastTextInput | string,
  arg2?: ToastShowOptions,
): ToastShowInput {
  if (typeof arg1 === "string") {
    const { type = "default", title: _, description, ...rest } = arg2 ?? {};
    return {
      ...rest,
      type,
      title: arg1,
      description: description ?? "",
    };
  }

  if ("type" in arg1) {
    return arg1;
  }

  const { title: inputTitle, description: inputDescription } = arg1;
  const {
    type = "default",
    title: optionsTitle,
    description: optionsDescription,
    ...rest
  } = arg2 ?? {};

  return {
    ...arg1,
    ...rest,
    type,
    title: inputTitle ?? optionsTitle ?? "",
    description: inputDescription ?? optionsDescription ?? "",
  };
}

function assertToastType(type: ToastType, caller: string) {
  if (!VALID_TOAST_TYPES.has(type)) {
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
    buttons: buttonsOverride,
    css: cssOverride,
    ...restOverrides
  } = overrides as Partial<ToastOptions>;

  const animation = {
    ...base.animation,
    ...(animationOverride ?? {}),
  };

  const buttons =
    base.buttons || buttonsOverride
      ? {
          ...(base.buttons ?? {}),
          ...(buttonsOverride ?? {}),
        }
      : undefined;

  const css =
    base.css || cssOverride
      ? {
          ...(base.css ?? {}),
          ...(cssOverride ?? {}),
        }
      : undefined;

  return {
    ...base,
    ...restOverrides,
    animation,
    buttons,
    css,
    type: type ?? "default",
    title: title ?? "",
    description: description ?? "",
  };
}

function insertToast(
  existing: ToastInstance[],
  next: ToastInstance,
): ToastInstance[] {
  if (!isNumberFinite(next.duration)) {
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
  position: ToastPosition,
): ToastInstance | null {
  if (!samePos.length) {
    return null;
  }

  const isTop = position.startsWith("top-");

  // Always evict the toast that has been visible the longest (FIFO).
  // insertToast places the newest at the start (top) or end (bottom) depending
  // on order + position, so the oldest is always at the opposite end.
  if (order === "newest") {
    return isTop ? samePos[samePos.length - 1]! : samePos[0]!;
  }

  return isTop ? samePos[0]! : samePos[samePos.length - 1]!;
}
