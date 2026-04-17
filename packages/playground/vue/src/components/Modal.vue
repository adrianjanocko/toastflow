<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import Button from '@/components/Button.vue';
import { X } from 'lucide-vue-next';

const props = withDefaults(
  defineProps<{
    modelValue: boolean;
    title?: string;
  }>(),
  {
    title: '',
  },
);

const emit = defineEmits<{
  'update:modelValue': [boolean];
}>();

const COMPACT_MODAL_BREAKPOINT = 1024;
const hasWindow = typeof window !== 'undefined';
const offsetX = ref(0);
const offsetY = ref(0);
const dragging = ref(false);
const modalRef = ref<HTMLElement | null>(null);
const dragHandleRef = ref<HTMLElement | null>(null);
const isCompactModal = ref(false);
let startPointer = { x: 0, y: 0 };
let startOffset = { x: 0, y: 0 };
let activePointerId: number | null = null;
let bodyScrollLockApplied = false;
let lockedScrollY = 0;
let previousBodyOverflow = '';
let previousBodyPosition = '';
let previousBodyTop = '';
let previousBodyWidth = '';
let previousBodyLeft = '';
let previousBodyRight = '';
let previousHtmlOverflow = '';

const modalStyle = computed(function () {
  if (isCompactModal.value) {
    return undefined;
  }
  return {
    transform: `translate(${offsetX.value}px, ${offsetY.value}px)`,
  };
});

const containerClass = computed(function () {
  if (isCompactModal.value) {
    return 'fixed inset-0 z-40 flex items-start justify-stretch p-0 pointer-events-auto';
  }
  return 'fixed inset-0 z-40 flex items-center justify-center p-4 pointer-events-none';
});

const panelClass = computed(function () {
  if (isCompactModal.value) {
    return 'relative h-dvh w-dvw max-w-none rounded-none bg-white/95 p-4 pt-3 ring-0 shadow-none pointer-events-auto overscroll-contain transition-colors duration-300 dark:bg-slate-900/95';
  }
  return 'relative w-full max-w-xl rounded-2xl bg-white/95 p-5 shadow-2xl ring-1 ring-slate-200 pointer-events-auto overscroll-contain transition-colors duration-300 dark:bg-slate-900/95 dark:ring-slate-700';
});

const headerClass = computed(function () {
  if (isCompactModal.value) {
    return 'mb-3 flex items-center justify-between gap-3 select-none';
  }
  return 'mb-4 flex items-center justify-between gap-3 cursor-move select-none touch-none';
});

const bodyClass = computed(function () {
  if (isCompactModal.value) {
    return 'h-[calc(100dvh-4rem)] overflow-auto pr-1 pb-28';
  }
  return 'max-h-[50vh] overflow-auto';
});

function close() {
  emit('update:modelValue', false);
}

function onPointerDown(event: PointerEvent) {
  if (isCompactModal.value) {
    return;
  }
  if (event.pointerType === 'mouse' && event.button !== 0) {
    return;
  }
  const target = event.target as HTMLElement | null;
  if (target && target.closest('button')) {
    return;
  }

  event.preventDefault();
  dragging.value = true;
  activePointerId = event.pointerId;
  startPointer = { x: event.clientX, y: event.clientY };
  startOffset = { x: offsetX.value, y: offsetY.value };

  const dragHandle = dragHandleRef.value;
  if (dragHandle && typeof dragHandle.setPointerCapture === 'function') {
    try {
      dragHandle.setPointerCapture(event.pointerId);
    } catch {
      // ignore capture failures
    }
  }
}

function onPointerMove(event: PointerEvent) {
  if (activePointerId !== null && event.pointerId !== activePointerId) {
    return;
  }
  if (!dragging.value) {
    return;
  }
  const nextX = startOffset.x + (event.clientX - startPointer.x);
  const nextY = startOffset.y + (event.clientY - startPointer.y);
  const clamped = clampOffset(nextX, nextY);
  offsetX.value = clamped.x;
  offsetY.value = clamped.y;
}

function onPointerUp() {
  if (activePointerId !== null) {
    const dragHandle = dragHandleRef.value;
    if (dragHandle && typeof dragHandle.releasePointerCapture === 'function') {
      try {
        dragHandle.releasePointerCapture(activePointerId);
      } catch {
        // ignore release failures
      }
    }
  }
  dragging.value = false;
  activePointerId = null;
}

function onPointerCancel() {
  onPointerUp();
}

function onKeyDown(event: KeyboardEvent) {
  if (event.key === 'Escape' && props.modelValue) {
    close();
  }
}

function clampOffset(nextX: number, nextY: number) {
  if (isCompactModal.value) {
    return { x: 0, y: 0 };
  }
  if (!modalRef.value) {
    return { x: nextX, y: nextY };
  }

  const viewportMargin = 16;
  const modalWidth = modalRef.value.offsetWidth;
  const modalHeight = modalRef.value.offsetHeight;

  const maxX = Math.max(0, (window.innerWidth - modalWidth) / 2 - viewportMargin);
  const maxY = Math.max(0, (window.innerHeight - modalHeight) / 2 - viewportMargin);

  return {
    x: Math.min(maxX, Math.max(-maxX, nextX)),
    y: Math.min(maxY, Math.max(-maxY, nextY)),
  };
}

function clampCurrentOffset() {
  if (isCompactModal.value) {
    offsetX.value = 0;
    offsetY.value = 0;
    return;
  }
  const clamped = clampOffset(offsetX.value, offsetY.value);
  offsetX.value = clamped.x;
  offsetY.value = clamped.y;
}

function syncCompactModal() {
  isCompactModal.value = window.innerWidth < COMPACT_MODAL_BREAKPOINT;
  if (isCompactModal.value) {
    dragging.value = false;
    offsetX.value = 0;
    offsetY.value = 0;
  } else {
    clampCurrentOffset();
  }
}

function onViewportResize() {
  syncCompactModal();
}

function lockPageScroll() {
  if (!hasWindow || bodyScrollLockApplied) {
    return;
  }

  const body = document.body;
  const html = document.documentElement;

  lockedScrollY = window.scrollY;
  previousBodyOverflow = body.style.overflow;
  previousBodyPosition = body.style.position;
  previousBodyTop = body.style.top;
  previousBodyWidth = body.style.width;
  previousBodyLeft = body.style.left;
  previousBodyRight = body.style.right;
  previousHtmlOverflow = html.style.overflow;

  html.style.overflow = 'hidden';
  body.style.overflow = 'hidden';
  body.style.position = 'fixed';
  body.style.top = `-${lockedScrollY}px`;
  body.style.width = '100%';
  body.style.left = '0';
  body.style.right = '0';
  bodyScrollLockApplied = true;
}

function unlockPageScroll() {
  if (!hasWindow || !bodyScrollLockApplied) {
    return;
  }

  const body = document.body;
  const html = document.documentElement;

  html.style.overflow = previousHtmlOverflow;
  body.style.overflow = previousBodyOverflow;
  body.style.position = previousBodyPosition;
  body.style.top = previousBodyTop;
  body.style.width = previousBodyWidth;
  body.style.left = previousBodyLeft;
  body.style.right = previousBodyRight;
  bodyScrollLockApplied = false;
  window.scrollTo(0, lockedScrollY);
}

function syncPageScrollLock() {
  if (props.modelValue && isCompactModal.value) {
    lockPageScroll();
  } else {
    unlockPageScroll();
  }
}

onMounted(function () {
  offsetX.value = 0;
  offsetY.value = 0;
  syncCompactModal();
  syncPageScrollLock();
  window.addEventListener('pointermove', onPointerMove);
  window.addEventListener('pointerup', onPointerUp);
  window.addEventListener('pointercancel', onPointerCancel);
  window.addEventListener('keydown', onKeyDown);
  window.addEventListener('resize', onViewportResize);
});

watch(
  function () {
    return props.modelValue;
  },
  function (isOpen) {
    syncPageScrollLock();
    if (isOpen) {
      nextTick(function () {
        offsetX.value = 0;
        offsetY.value = 0;
        syncCompactModal();
        syncPageScrollLock();
      });
    }
  },
);

watch(isCompactModal, function () {
  syncPageScrollLock();
});

onBeforeUnmount(function () {
  unlockPageScroll();
  window.removeEventListener('pointermove', onPointerMove);
  window.removeEventListener('pointerup', onPointerUp);
  window.removeEventListener('pointercancel', onPointerCancel);
  window.removeEventListener('keydown', onKeyDown);
  window.removeEventListener('resize', onViewportResize);
});
</script>

<template>
  <teleport to="body">
    <div v-if="modelValue" :class="containerClass">
      <div ref="modalRef" :class="panelClass" :style="modalStyle">
        <header ref="dragHandleRef" :class="headerClass" @pointerdown="onPointerDown">
          <h3 class="text-sm font-semibold text-slate-800 dark:text-slate-100">
            {{ title }}
          </h3>
          <Button variant="ghost" icon-only tooltip="Close" @click="close">
            <X class="size-4" />
          </Button>
        </header>

        <div :class="bodyClass">
          <slot />
        </div>
      </div>
    </div>
  </teleport>
</template>
