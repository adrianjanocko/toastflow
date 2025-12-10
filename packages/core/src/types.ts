/**
 * Unique identifier assigned to each toast instance.
 */
export type ToastId = string;

/**
 * Supported viewport anchors where toasts can stack.
 */
export type ToastPosition =
  | "top-left"
  | "top-center"
  | "top-right"
  | "bottom-left"
  | "bottom-center"
  | "bottom-right";
/**
 * Order to display and evict toasts in a stack.
 */
export type ToastOrder = "newest" | "oldest";
/**
 * Determines how the timer behaves after an interaction pause.
 */
export type PauseStrategy = "resume" | "reset";
/**
 * Semantic type that controls the toast's appearance.
 */
export type ToastType =
  | "loading"
  | "default"
  | "success"
  | "error"
  | "info"
  | "warning";
/**
 * Internal lifecycle markers used for animations and cleanup.
 */
export type ToastPhase = "enter" | "leaving" | "clear-all";
/**
 * Event kinds emitted to event subscribers.
 */
export type ToastEventKind = "duplicate" | "timer-reset" | "update";

/**
 * Payload emitted whenever the store dispatches a toast event.
 */
export interface ToastEvent {
  id: ToastId;
  kind: ToastEventKind;
}

/**
 * Async work passed to the loading helper.
 */
export type ToastLoadingInput<T> = Promise<T> | (() => Promise<T>);

/**
 * Text and rendering options for the loading helper phases.
 */
export interface ToastLoadingConfig<T> {
  loading: ToastContentInput;
  success: ToastLoadingRender<T>;
  error: ToastLoadingRender<unknown>;
}

/**
 * CSS class names used to animate toasts.
 */
export interface ToastAnimation {
  name: string;
  bump: string;
  clearAll: string;
  update: string;
}

/**
 * Minimal context shared with lifecycle and click callbacks.
 */
export interface ToastContext {
  id: ToastId;
  position: ToastPosition;
  type: ToastType;
  title: string;
  description: string;
  createdAt: number;
}

/**
 * Global configuration that shapes how toasts look and behave.
 */
export interface ToastConfig {
  /**
   * Distance from the viewport edge where toasts start.
   */
  offset: string;
  /**
   * Gap between toasts stacked at the same position.
   */
  gap: string;
  /**
   * z-index applied to the toast container.
   */
  zIndex: number;
  /**
   * Fixed width applied to each toast.
   */
  width: string;
  /**
   * Beta: enable scrolling when a stack overflows; currently only works for top-* positions.
   */
  overflowScroll: boolean;

  /**
   * Time in milliseconds before a toast auto-dismisses.
   * Use Infinity or 0 to keep it visible until manually dismissed.
   */
  duration: number;
  /**
   * Maximum number of visible toasts per position; extra items are evicted.
   */
  maxVisible: number;
  /**
   * Default stack position used when none is provided.
   */
  position: ToastPosition;

  /**
   * When true, skip showing identical toasts that are still visible.
   */
  preventDuplicates: boolean;
  /**
   * Controls whether new toasts appear before or after older ones.
   */
  order: ToastOrder;

  /**
   * When enabled, render a progress bar for finite durations.
   */
  progressBar: boolean;
  /**
   * Pause the timer while the toast is hovered.
   */
  pauseOnHover: boolean;
  /**
   * Whether resuming should continue the remaining time or restart it.
   */
  pauseStrategy: PauseStrategy;

  /**
   * CSS animation class overrides for various toast transitions.
   */
  animation: Partial<ToastAnimation>;

  /**
   * Show a close button inside each toast.
   */
  closeButton: boolean;
  /**
   * Allow closing a toast by clicking anywhere on it.
   */
  closeOnClick: boolean;

  /**
   * When true, title/description may contain HTML.
   */
  supportHtml: boolean;

  /**
   * Show the createdAt timestamp in the rendered toast.
   */
  showCreatedAt: boolean;
  /**
   * Format the createdAt timestamp when displayed.
   */
  createdAtFormatter: (createdAt: number) => string;

  /**
   * Called after the toast is added to state.
   */
  onMount?(ctx: ToastContext): void;

  /**
   * Called after the toast is removed from state.
   */
  onUnmount?(ctx: ToastContext): void;

  /**
   * Called when the toast is clicked.
   */
  onClick?(ctx: ToastContext, event: MouseEvent): void;

  /**
   * Called right before a toast starts leaving.
   */
  onClose?(ctx: ToastContext): void;
}

/**
 * Fully resolved options applied to a toast instance.
 */
export interface ToastOptions extends ToastConfig {
  type: ToastType;
  title: string;
  description: string;
}

/**
 * Minimal text payload required to render a toast.
 */
export type ToastTextInput =
  | { title: string; description?: string }
  | { title?: string; description: string };

/**
 * Text payload with optional configuration overrides.
 */
export type ToastContentInput = ToastTextInput &
  Partial<Omit<ToastOptions, "type" | "title" | "description">>;

/**
 * Payload required to create a toast.
 */
export type ToastShowInput = { type: ToastType } & ToastContentInput;

/**
 * Allowed fields when updating an existing toast.
 */
export type ToastUpdateInput = ToastContentInput &
  Partial<Omit<ToastOptions, "title" | "description">>;

/**
 * Render instructions for the loading helper's success/error states.
 */
export type ToastLoadingRender<T> =
  | ToastContentInput
  | ((value: T) => ToastContentInput);

/**
 * Promise returned from the loading helper that also exposes the toast id.
 */
export type ToastLoadingResult<T> = Promise<T> & { toastId: ToastId };

/**
 * Concrete toast stored in state, including timing metadata.
 */
export interface ToastInstance extends ToastOptions {
  id: ToastId;
  createdAt: number;
  phase?: ToastPhase;
}

/**
 * Shape of the store's current state.
 */
export interface ToastState {
  toasts: ToastInstance[];
}

/**
 * Public API for interacting with the toast store.
 */
export interface ToastStore {
  /**
   * Return the current toast state snapshot.
   */
  getState(): ToastState;

  /**
   * Subscribe to state changes; immediately emits the current state.
   */
  subscribe(listener: (state: ToastState) => void): () => void;

  /**
   * Subscribe to one-off toast events such as duplicates or timer resets.
   */
  subscribeEvents(listener: (event: ToastEvent) => void): () => void;

  /**
   * Create and show a toast; returns its id.
   */
  show(options: ToastShowInput): ToastId;

  /**
   * Update an existing toast by id.
   */
  update(id: ToastId, options: ToastUpdateInput): void;

  /**
   * Dismiss a single toast by id.
   */
  dismiss(id: ToastId): void;

  /**
   * Dismiss all toasts at once.
   */
  dismissAll(): void;

  /**
   * Pause the auto-dismiss timer for a toast.
   */
  pause(id: ToastId): void;

  /**
   * Resume the auto-dismiss timer using the configured strategy.
   */
  resume(id: ToastId): void;

  /**
   * Return the resolved global configuration.
   */
  getConfig(): ToastConfig;

  /**
   * Wrap an async task with a loading toast that updates on completion.
   */
  loading<T>(
    input: ToastLoadingInput<T>,
    config: ToastLoadingConfig<T>,
  ): ToastLoadingResult<T>;
}
