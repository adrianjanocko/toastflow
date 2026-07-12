import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createToastStore } from "./store";
import type { ToastEvent, ToastStore } from "./types";

function visibleToasts(store: ToastStore) {
  return store
    .getState()
    .toasts.filter((t) => t.phase !== "leaving" && t.phase !== "clear-all");
}

describe("createToastStore", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe("show", () => {
    it("adds a toast with phase 'enter' and returns its id", () => {
      const store = createToastStore();
      const id = store.show("Hello");

      const { toasts } = store.getState();
      expect(toasts).toHaveLength(1);
      expect(toasts[0]!.id).toBe(id);
      expect(toasts[0]!.title).toBe("Hello");
      expect(toasts[0]!.phase).toBe("enter");
    });

    it("throws on empty content", () => {
      const store = createToastStore();
      expect(() => store.show("")).toThrow(/non-empty title or description/);
    });

    it("notifies subscribers immediately and on changes", () => {
      const store = createToastStore();
      const listener = vi.fn();
      store.subscribe(listener);
      expect(listener).toHaveBeenCalledTimes(1);

      store.show("Hello");
      expect(listener).toHaveBeenCalledTimes(2);
    });
  });

  describe("auto-dismiss", () => {
    it("dismisses after the configured duration (leaving phase, then removal)", () => {
      const store = createToastStore({ duration: 1000 });
      const id = store.show("Hello");

      vi.advanceTimersByTime(999);
      expect(visibleToasts(store)).toHaveLength(1);

      vi.advanceTimersByTime(1);
      const leaving = store.getState().toasts.find((t) => t.id === id);
      expect(leaving?.phase).toBe("leaving");

      vi.runOnlyPendingTimers();
      expect(store.getState().toasts).toHaveLength(0);
    });

    it("never auto-dismisses toasts with Infinity duration", () => {
      const store = createToastStore({ duration: Infinity });
      store.show("Sticky");

      vi.advanceTimersByTime(1_000_000);
      expect(visibleToasts(store)).toHaveLength(1);
    });
  });

  describe("maxVisible eviction", () => {
    it("evicts the oldest toast when capacity is exceeded", () => {
      const store = createToastStore({ maxVisible: 2, duration: Infinity });
      const first = store.show("one");
      store.show("two");
      store.show("three");

      // Evicted toast stays one frame with phase "leaving".
      const evicted = store.getState().toasts.find((t) => t.id === first);
      expect(evicted?.phase).toBe("leaving");
      expect(visibleToasts(store)).toHaveLength(2);

      vi.advanceTimersByTime(0);
      const titles = store.getState().toasts.map((t) => t.title);
      expect(titles).toHaveLength(2);
      expect(titles).not.toContain("one");
    });

    it("keeps evicting FIFO across bursts", () => {
      const store = createToastStore({ maxVisible: 2, duration: Infinity });
      store.show("one");
      store.show("two");
      store.show("three");
      store.show("four");
      vi.advanceTimersByTime(0);

      const titles = store.getState().toasts.map((t) => t.title);
      expect(titles.sort()).toEqual(["four", "three"]);
    });
  });

  describe("queue", () => {
    it("queues toasts over capacity instead of evicting", () => {
      const store = createToastStore({
        maxVisible: 1,
        queue: true,
        duration: Infinity,
      });
      store.show("visible");
      store.show("queued");

      expect(visibleToasts(store)).toHaveLength(1);
      expect(store.getState().queue).toHaveLength(1);
      expect(store.getState().queue[0]!.title).toBe("queued");
    });

    it("promotes the next queued toast when a slot frees up", () => {
      const store = createToastStore({
        maxVisible: 1,
        queue: true,
        duration: Infinity,
      });
      const first = store.show("visible");
      store.show("queued");

      store.dismiss(first);
      vi.advanceTimersByTime(0);

      expect(store.getState().queue).toHaveLength(0);
      const titles = store.getState().toasts.map((t) => t.title);
      expect(titles).toEqual(["queued"]);
    });

    it("holds queued toasts while the queue is paused", () => {
      const store = createToastStore({
        maxVisible: 1,
        queue: true,
        duration: Infinity,
      });
      const first = store.show("visible");
      store.show("queued");

      store.pauseQueue();
      store.dismiss(first);
      vi.advanceTimersByTime(0);
      expect(store.getState().queue).toHaveLength(1);
      expect(visibleToasts(store)).toHaveLength(0);

      store.resumeQueue();
      expect(store.getState().queue).toHaveLength(0);
      expect(visibleToasts(store)).toHaveLength(1);
    });

    it("dismissing a queued toast removes it without showing it", () => {
      const store = createToastStore({
        maxVisible: 1,
        queue: true,
        duration: Infinity,
      });
      store.show("visible");
      const queued = store.show("queued");

      store.dismiss(queued);
      expect(store.getState().queue).toHaveLength(0);
      expect(visibleToasts(store)).toHaveLength(1);
    });
  });

  describe("pause / resume", () => {
    it("resume strategy continues with the remaining time", () => {
      const store = createToastStore({
        duration: 1000,
        pauseStrategy: "resume",
      });
      const id = store.show("Hello");

      vi.advanceTimersByTime(400);
      store.pause(id);
      vi.advanceTimersByTime(10_000);
      expect(visibleToasts(store)).toHaveLength(1);

      store.resume(id);
      vi.advanceTimersByTime(599);
      expect(visibleToasts(store)).toHaveLength(1);
      vi.advanceTimersByTime(1);
      vi.runOnlyPendingTimers();
      expect(store.getState().toasts).toHaveLength(0);
    });

    it("reset strategy restarts the full duration and emits timer-reset", () => {
      const store = createToastStore({
        duration: 1000,
        pauseStrategy: "reset",
      });
      const events: ToastEvent[] = [];
      store.subscribeEvents((event) => events.push(event));

      const id = store.show("Hello");
      vi.advanceTimersByTime(900);
      store.pause(id);
      store.resume(id);

      expect(events).toContainEqual({ id, kind: "timer-reset" });

      vi.advanceTimersByTime(999);
      expect(visibleToasts(store)).toHaveLength(1);
      vi.advanceTimersByTime(1);
      vi.runOnlyPendingTimers();
      expect(store.getState().toasts).toHaveLength(0);
    });
  });

  describe("preventDuplicates", () => {
    it("reuses the existing toast and emits a duplicate event", () => {
      const store = createToastStore({
        preventDuplicates: true,
        duration: Infinity,
      });
      const events: ToastEvent[] = [];
      store.subscribeEvents((event) => events.push(event));

      const first = store.show("Same");
      const second = store.show("Same");

      expect(second).toBe(first);
      expect(store.getState().toasts).toHaveLength(1);
      expect(events).toContainEqual({ id: first, kind: "duplicate" });
    });

    it("treats different content as distinct toasts", () => {
      const store = createToastStore({
        preventDuplicates: true,
        duration: Infinity,
      });
      store.show("One");
      store.show("Two");
      expect(store.getState().toasts).toHaveLength(2);
    });
  });

  describe("update", () => {
    it("merges options, resets the timer, and emits timer-reset", () => {
      const store = createToastStore({ duration: 1000 });
      const events: ToastEvent[] = [];
      store.subscribeEvents((event) => events.push(event));

      const id = store.show("Before");
      vi.advanceTimersByTime(900);

      store.update(id, { title: "After" });
      expect(events).toContainEqual({ id, kind: "timer-reset" });
      expect(store.getState().toasts[0]!.title).toBe("After");

      // Timer restarted: the original deadline must not fire.
      vi.advanceTimersByTime(999);
      expect(visibleToasts(store)).toHaveLength(1);
      vi.advanceTimersByTime(1);
      vi.runOnlyPendingTimers();
      expect(store.getState().toasts).toHaveLength(0);
    });
  });

  describe("dismiss", () => {
    it("runs onClose and onUnmount callbacks", () => {
      const onClose = vi.fn();
      const onUnmount = vi.fn();
      const store = createToastStore({ duration: Infinity });
      const id = store.show({
        type: "default",
        title: "Hello",
        onClose,
        onUnmount,
      });

      store.dismiss(id);
      expect(onClose).toHaveBeenCalledTimes(1);

      vi.advanceTimersByTime(0);
      expect(onUnmount).toHaveBeenCalledTimes(1);
    });

    it("is a no-op for unknown ids", () => {
      const store = createToastStore();
      expect(() => store.dismiss("missing")).not.toThrow();
    });
  });

  describe("dismissAll", () => {
    it("marks all toasts as clear-all, then empties state and queue", () => {
      const store = createToastStore({
        maxVisible: 1,
        queue: true,
        duration: Infinity,
      });
      store.show("visible");
      store.show("queued");

      store.dismissAll();
      expect(
        store.getState().toasts.every((t) => t.phase === "clear-all"),
      ).toBe(true);
      expect(store.getState().queue).toHaveLength(0);

      vi.advanceTimersByTime(50);
      expect(store.getState().toasts).toHaveLength(0);
    });
  });

  describe("container scoping", () => {
    function visibleIn(store: ToastStore, containerId?: string) {
      return visibleToasts(store).filter((t) => t.containerId === containerId);
    }

    it("tracks capacity per (containerId, position)", () => {
      const store = createToastStore({ maxVisible: 2, duration: Infinity });
      store.show("d1");
      store.show("d2");
      store.show("a1", { containerId: "a" });
      store.show("a2", { containerId: "a" });

      expect(visibleToasts(store)).toHaveLength(4);
      expect(visibleIn(store)).toHaveLength(2);
      expect(visibleIn(store, "a")).toHaveLength(2);
    });

    it("evicts only within the same container", () => {
      const store = createToastStore({ maxVisible: 2, duration: Infinity });
      store.show("d1");
      store.show("d2");
      store.show("a1", { containerId: "a" });
      store.show("a2", { containerId: "a" });
      store.show("a3", { containerId: "a" });
      vi.advanceTimersByTime(0);

      expect(visibleIn(store).map((t) => t.title)).toEqual(["d2", "d1"]);
      expect(
        visibleIn(store, "a")
          .map((t) => t.title)
          .sort(),
      ).toEqual(["a2", "a3"]);
    });

    it("queues per container and promotes only when its own slot frees up", () => {
      const store = createToastStore({
        maxVisible: 1,
        queue: true,
        duration: Infinity,
      });
      const defaultVisible = store.show("d-visible");
      store.show("a-visible", { containerId: "a" });
      store.show("a-queued", { containerId: "a" });

      expect(store.getState().queue).toHaveLength(1);

      // Freeing a default-container slot must not promote container "a".
      store.dismiss(defaultVisible);
      vi.advanceTimersByTime(0);
      expect(store.getState().queue).toHaveLength(1);

      const aVisible = visibleIn(store, "a")[0]!;
      store.dismiss(aVisible.id);
      vi.advanceTimersByTime(0);
      expect(store.getState().queue).toHaveLength(0);
      expect(visibleIn(store, "a").map((t) => t.title)).toEqual(["a-queued"]);
    });

    it("scopes duplicate detection per container", () => {
      const store = createToastStore({
        preventDuplicates: true,
        duration: Infinity,
      });
      const first = store.show("Same");
      const other = store.show("Same", { containerId: "a" });
      const repeat = store.show("Same", { containerId: "a" });

      expect(other).not.toBe(first);
      expect(repeat).toBe(other);
      expect(store.getState().toasts).toHaveLength(2);
    });

    it("dismissAll({ containerId }) clears only that container (visible + queued)", () => {
      const store = createToastStore({
        maxVisible: 1,
        queue: true,
        duration: Infinity,
      });
      store.show("d-visible");
      store.show("d-queued");
      store.show("a-visible", { containerId: "a" });
      store.show("a-queued", { containerId: "a" });

      store.dismissAll({ containerId: "a" });
      vi.advanceTimersByTime(50);

      expect(visibleIn(store, "a")).toHaveLength(0);
      expect(visibleIn(store)).toHaveLength(1);
      expect(store.getState().queue.map((t) => t.title)).toEqual(["d-queued"]);
    });

    it("dismissAll({ containerId: undefined }) clears only the default container", () => {
      const store = createToastStore({ duration: Infinity });
      store.show("default");
      store.show("scoped", { containerId: "a" });

      store.dismissAll({ containerId: undefined });
      vi.advanceTimersByTime(50);

      expect(visibleIn(store)).toHaveLength(0);
      expect(visibleIn(store, "a")).toHaveLength(1);
    });

    it("bare dismissAll() still clears every container", () => {
      const store = createToastStore({ duration: Infinity });
      store.show("default");
      store.show("scoped", { containerId: "a" });

      store.dismissAll();
      vi.advanceTimersByTime(50);
      expect(store.getState().toasts).toHaveLength(0);
    });

    it("update and dismiss by id work across containers", () => {
      const store = createToastStore({ duration: Infinity });
      const scoped = store.show("scoped", { containerId: "a" });

      store.update(scoped, { title: "updated" });
      expect(store.getState().toasts[0]!.title).toBe("updated");
      expect(store.getState().toasts[0]!.containerId).toBe("a");

      store.dismiss(scoped);
      vi.advanceTimersByTime(0);
      expect(store.getState().toasts).toHaveLength(0);
    });
  });

  describe("loading", () => {
    it("shows a loading toast and updates it on success", async () => {
      const store = createToastStore({ duration: Infinity });
      let resolve!: (value: string) => void;
      const task = new Promise<string>((r) => {
        resolve = r;
      });

      const result = store.loading(task, {
        loading: { title: "Loading..." },
        success: (value) => ({ title: `Done: ${value}` }),
        error: { title: "Failed" },
      });

      expect(store.getState().toasts[0]!.type).toBe("loading");

      resolve("ok");
      await expect(result).resolves.toBe("ok");

      const toast = store.getState().toasts[0]!;
      expect(toast.id).toBe(result.toastId);
      expect(toast.type).toBe("success");
      expect(toast.title).toBe("Done: ok");
    });

    it("updates to the error toast and rejects on failure", async () => {
      const store = createToastStore({ duration: Infinity });
      const failure = new Error("boom");

      const result = store.loading(Promise.reject(failure), {
        loading: { title: "Loading..." },
        success: { title: "Done" },
        error: (error) => ({ title: `Failed: ${(error as Error).message}` }),
      });

      await expect(result).rejects.toBe(failure);

      const toast = store.getState().toasts[0]!;
      expect(toast.type).toBe("error");
      expect(toast.title).toBe("Failed: boom");
    });
  });

  describe("destroy", () => {
    it("cancels pending timers and stops notifying listeners", () => {
      const store = createToastStore({ duration: 1000 });
      const listener = vi.fn();
      store.subscribe(listener);

      const id = store.show("Hello");
      store.dismiss(id);
      const callsBefore = listener.mock.calls.length;

      store.destroy();
      vi.advanceTimersByTime(10_000);

      expect(listener.mock.calls.length).toBe(callsBefore);
      expect(store.getState().toasts).toHaveLength(0);
      expect(store.getState().queue).toHaveLength(0);
    });
  });
});
