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
 * Supported toast data alignments.
 */
export type ToastAlignment = "left" | "right";
/**
 * Supported toast progress alignments.
 */
export type ToastProgressAlignment = "left-to-right" | "right-to-left";
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
 * Supported alignments for in-toast button groups.
 */
export type ToastButtonsAlignment =
  | "top-left"
  | "top-right"
  | "center-left"
  | "center-right"
  | "bottom-left"
  | "bottom-right";

/**
 * Layout direction for action buttons.
 */
export type ToastButtonsLayout = "row" | "column";

/**
 * Single action button rendered inside a toast.
 * Use `label` for plain text or `html`.
 */
export type ToastButton = ToastButtonText | ToastButtonHtml;

interface ToastButtonBase {
  /**
   * Optional identifier you can use as a stable key in renderers.
   */
  id?: string;
  /**
   * Accessible label for icon-only buttons or custom HTML.
   */
  ariaLabel?: string;
  /**
   * Optional CSS class.
   */
  className?: string;

  /**
   * Called when the button is clicked.
   */
  onClick?(ctx: ToastContext, event: MouseEvent): void;
}

export interface ToastButtonText extends ToastButtonBase {
  label: string;
  html?: never;
}

export interface ToastButtonHtml extends ToastButtonBase {
  html: string;
  label?: never;
}

/**
 * Button group configuration for a toast.
 */
export interface ToastButtonsConfig {
  alignment: ToastButtonsAlignment;
  /**
   * Button stack direction. (Default: "row")
   */
  layout?: ToastButtonsLayout;
  buttons: ToastButton[];
  /**
   * Gap between individual buttons. (Default: "calc(var(--tf-toast-gap) / 2)")
   */
  gap?: string;
  /**
   * Spacing between the button group and the toast content. (Default: "calc(var(--tf-toast-gap) / 2)")
   */
  contentGap?: string;
}

/**
 * Global configuration that shapes how toasts look and behave.
 */
export interface ToastConfig {
  /**
   * Distance from the viewport edge where toasts start. (Default: "16px")
   */
  offset: string;
  /**
   * Gap between toasts stacked at the same position. (Default: "8px")
   */
  gap: string;
  /**
   * z-index applied to the toast container. (Default: 9999)
   */
  zIndex: number;
  /**
   * Fixed width applied to each toast. (Default: "350px")
   */
  width: string;
  /**
   * Beta: enable scrolling when a stack overflows; currently only works for top-* positions. (Default: false)
   */
  overflowScroll: boolean;

  /**
   * Time in milliseconds before a toast auto-dismisses.
   * Use Infinity or 0 to keep it visible until manually dismissed.
   * (Default: 5000)
   */
  duration: number;
  /**
   * Maximum number of visible toasts per position; extra items are evicted. (Default: 5)
   */
  maxVisible: number;
  /**
   * When true, overflowed toasts are queued and shown when space frees up instead of evicting. (Default: false)
   */
  queue: boolean;
  /**
   * Default stack position used when none is provided. (Default: "top-right")
   */
  position: ToastPosition;
  /**
   * Alignment of data in the toast. (Default: "left")
   */
  alignment: ToastAlignment;
  /**
   * Alignment of toast progress. (Default: "right-to-left")
   */
  progressAlignment: ToastProgressAlignment;

  /**
   * When true, skip showing identical toasts that are still visible. (Default: false)
   */
  preventDuplicates: boolean;
  /**
   * Controls whether new toasts appear before or after older ones. (Default: "newest")
   */
  order: ToastOrder;

  /**
   * When enabled, render a progress bar for finite durations. (Default: true)
   */
  progressBar: boolean;
  /**
   * Pause the timer while the toast is hovered. (Default: true)
   */
  pauseOnHover: boolean;
  /**
   * Whether resuming should continue the remaining time or restart it. (Default: "resume")
   */
  pauseStrategy: PauseStrategy;

  /**
   * CSS animation class overrides for various toast transitions.
   * (Default: { name: "Toastflow__animation", bump: "Toastflow__animation-bump", clearAll: "Toastflow__animation-clearAll", update: "Toastflow__animation-update" })
   */
  animation: Partial<ToastAnimation>;

  /**
   * Show a close button inside each toast. (Default: true)
   */
  closeButton: boolean;
  /**
   * Allow closing a toast by clicking anywhere on it. (Default: false)
   */
  closeOnClick: boolean;

  /**
   * Optional action buttons rendered inside a toast.
   */
  buttons?: ToastButtonsConfig;

  /**
   * When true, title/description may contain HTML. (Default: false)
   */
  supportHtml: boolean;

  /**
   * Show the createdAt timestamp in the rendered toast. (Default: false)
   */
  showCreatedAt: boolean;
  /**
   * Format the createdAt timestamp when displayed.
   * (Default: locale time formatter with ISO fallback)
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
  /**
   * Custom accent theme applied by the renderer (e.g. "my-theme" -> "tf-toast-accent--my-theme").
   */
  theme?: string;
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
 * Options accepted when calling the show helper with text provided separately.
 */
export type ToastShowOptions = Partial<
  Omit<ToastOptions, "title" | "description">
> &
  Partial<ToastTextInput> & { type?: ToastType };

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
 * Standalone shape matching ToastContext but with optional id/type/createdAt and the remaining ToastInstance fields available.
 */
export type ToastStandaloneInstance = {
  id?: ToastId;
  title: string;
  description: string;
  type?: ToastType;
  createdAt?: number;
} & Partial<
  Omit<ToastInstance, "id" | "title" | "description" | "type" | "createdAt">
>;

/**
 * Shape of the store's current state.
 */
export interface ToastState {
  toasts: ToastInstance[];
  queue: ToastInstance[];
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

  show(content: string | ToastTextInput, options?: ToastShowOptions): ToastId;

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
   * Pause queue processing so queued toasts remain pending until resumed.
   */
  pauseQueue(): void;

  /**
   * Resume queue processing so queued toasts can appear again.
   */
  resumeQueue(): void;

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
