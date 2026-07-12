/**
 * Tracks mounted <ToastContainer> instances by their `id` prop so that
 * misconfigurations (duplicate ids, toasts targeting a container that is not
 * mounted) can be surfaced with a one-shot console warning.
 */
const mountedContainers = new Map<string | undefined, number>();
const warnedKeys = new Set<string>();

function containerLabel(id: string | undefined): string {
  return id === undefined ? "the default container" : `container id "${id}"`;
}

function warnOnce(key: string, message: string): void {
  if (warnedKeys.has(key)) {
    return;
  }
  warnedKeys.add(key);
  console.warn(`[vue-toastflow] ${message}`);
}

export function registerContainer(id: string | undefined): void {
  const count = (mountedContainers.get(id) ?? 0) + 1;
  mountedContainers.set(id, count);

  if (count > 1) {
    warnOnce(
      `duplicate:${id ?? ""}`,
      `Multiple <ToastContainer> instances are mounted for ${containerLabel(id)} — every toast targeting it will render in each of them.`,
    );
  }
}

export function unregisterContainer(id: string | undefined): void {
  const count = (mountedContainers.get(id) ?? 0) - 1;
  if (count <= 0) {
    mountedContainers.delete(id);
  } else {
    mountedContainers.set(id, count);
  }
}

function hasContainer(id: string | undefined): boolean {
  return (mountedContainers.get(id) ?? 0) > 0;
}

export function warnUnmountedTargets(
  toasts: ReadonlyArray<{ containerId?: string }>,
): void {
  for (const toast of toasts) {
    if (hasContainer(toast.containerId)) {
      continue;
    }
    warnOnce(
      `orphan:${toast.containerId ?? ""}`,
      toast.containerId === undefined
        ? `A toast targets the default container, but no <ToastContainer> without an id is mounted.`
        : `A toast targets containerId "${toast.containerId}", but no <ToastContainer id="${toast.containerId}"> is mounted.`,
    );
  }
}
