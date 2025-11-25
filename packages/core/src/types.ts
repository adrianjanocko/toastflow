export type ToastId = string;

export type ToastPosition =
  | "top-left"
  | "top-center"
  | "top-right"
  | "bottom-left"
  | "bottom-center"
  | "bottom-right";
export type ToastOrder = "newest" | "oldest";
export type PauseStrategy = "resume" | "reset";
export type ToastType = "default" | "success" | "error" | "info" | "warning";
export type ToastPhase = "enter" | "leaving" | "clear-all";
export type ToastEventKind = "duplicate" | "timer-reset";

export interface ToastEvent {
  id: ToastId;
  kind: ToastEventKind;
}

export interface ToastAnimation {
  name: string;
  bump: string;
  clearAll: string;
}

export interface ToastContext {
  id: ToastId;
  position: ToastPosition;
  type: ToastType;
  title: string;
  description: string;
  createdAt: number;
}

export interface ToastConfig {
  offset: string;
  gap: string;
  zIndex: number;
  width: string;

  duration: number;
  maxVisible: number;
  position: ToastPosition;

  preventDuplicates: boolean;
  order: ToastOrder;

  progressBar: boolean;
  pauseOnHover: boolean;
  pauseStrategy: PauseStrategy;

  animation: Partial<ToastAnimation>;

  closeButton: boolean;
  closeOnClick: boolean;

  supportHtml: boolean;

  onMount?(ctx: ToastContext): void;

  onUnmount?(ctx: ToastContext): void;

  onClick?(ctx: ToastContext, event: MouseEvent): void;

  onClose?(ctx: ToastContext): void;
}

export interface ToastOptions extends ToastConfig {
  type: ToastType;
  title: string;
  description: string;
}

export interface ToastInstance extends ToastOptions {
  id: ToastId;
  createdAt: number;
  phase?: ToastPhase;
}

export interface ToastState {
  toasts: ToastInstance[];
}

export interface ToastStore {
  getState(): ToastState;

  subscribe(listener: (state: ToastState) => void): () => void;

  subscribeEvents(listener: (event: ToastEvent) => void): () => void;

  show(options: Partial<ToastOptions>): ToastId;

  update(id: ToastId, options: Partial<ToastOptions>): void;

  dismiss(id: ToastId): void;

  dismissAll(): void;

  pause(id: ToastId): void;

  resume(id: ToastId): void;

  getConfig(): ToastConfig;
}
