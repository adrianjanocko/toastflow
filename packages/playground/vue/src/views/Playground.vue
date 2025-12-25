<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue';
import { Copy, MessageCircle, Share2, Terminal } from 'lucide-vue-next';
import {
  toast,
  type ToastAlignment,
  type ToastContext,
  type ToastProgressAlignment,
} from 'vue-toastflow';
import Giscus from '@giscus/vue';
import type {
  PauseStrategy,
  ToastButton,
  ToastButtonsAlignment,
  ToastId,
  ToastOptions,
  ToastOrder,
  ToastPosition,
  ToastType,
} from 'toastflow-core';
import ActionsFooter from '../components/ActionsFooter.vue';
import BehaviorCard from '../components/cards/BehaviorCard.vue';
import ContentCard from '../components/card/EventsCard.vue';
import PositionCard from '../components/cards/PositionCard.vue';
import TimingLayoutCard from '../components/cards/TimingLimitsCard.vue';
import Button from '../components/Button.vue';
import Modal from '../components/Modal.vue';
import type { PlaygroundButton } from '../types/playgroundTypes.ts';

type EventLogEntry = {
  id: string;
  label: string;
  timestamp: string;
  detail: string;
  highlighted?: string;
};

const config = toast.getConfig();
const hasWindow = typeof window !== 'undefined';
const MAX_LOG_ENTRIES = 80;

const giscusConfig = {
  repo: import.meta.env.VITE_GISCUS_REPO,
  repoId: import.meta.env.VITE_GISCUS_REPO_ID,
  category: import.meta.env.VITE_GISCUS_CATEGORY,
  categoryId: import.meta.env.VITE_GISCUS_CATEGORY_ID,
  mapping: import.meta.env.VITE_GISCUS_MAPPING,
  theme: import.meta.env.VITE_GISCUS_THEME,
  strict: import.meta.env.VITE_GISCUS_STRICT,
};

const hasGiscusConfig = computed(function () {
  return Boolean(
    giscusConfig.repo && giscusConfig.repoId && giscusConfig.category && giscusConfig.categoryId,
  );
});

/* ----- reactive state ----- */

const position = ref<ToastPosition>(config.position);
const alignment = ref<ToastAlignment>(config.alignment);
const progressAlignment = ref<ToastProgressAlignment>(config.progressAlignment);
const type = ref<ToastType>('success');

const offset = ref(config.offset);
const gap = ref(config.gap);
const zIndex = ref(config.zIndex);
const width = ref(config.width);
const overflowScroll = ref(config.overflowScroll);

const duration = ref(config.duration);
const maxVisible = ref(config.maxVisible);

const preventDuplicates = ref(config.preventDuplicates);
const order = ref<ToastOrder>(config.order);

const progressBar = ref(config.progressBar);
const pauseOnHover = ref(config.pauseOnHover);
const pauseStrategy = ref<PauseStrategy>(config.pauseStrategy);

const closeButton = ref(config.closeButton);
const closeOnClick = ref(config.closeOnClick);

const supportHtml = ref(config.supportHtml);

const showCreatedAt = ref(config.showCreatedAt);

const enableButtons = ref(false);
const buttonsAlignment = ref<ToastButtonsAlignment>('center-right');
const buttonsGap = ref('');
const buttonsContentGap = ref('');

const isLogModalOpen = ref(false);
const eventLog = ref<EventLogEntry[]>([]);
const isFeedbackModalOpen = ref(false);
const copyCodeLabel = ref('Copy code');
const copyShareLabel = ref('Copy share link');
const shortcutKeys = [
  { key: 'T', label: 'Push' },
  { key: 'D', label: 'Dismiss all' },
  { key: 'R', label: 'Reset' },
];
const keycapClass =
  'inline-flex h-6 items-center justify-center rounded-md border border-slate-300 bg-slate-50 px-2 text-[0.7rem] font-semibold text-slate-800';

let buttonCounter = 0;

function createPlaygroundButton(partial?: Partial<PlaygroundButton>): PlaygroundButton {
  buttonCounter += 1;
  return {
    id: `playground-button-${buttonCounter}`,
    mode: 'label',
    value: 'Action',
    className: '',
    ariaLabel: '',
    dismissOnClick: false,
    ...partial,
  };
}

const playgroundButtons = ref<PlaygroundButton[]>([
  createPlaygroundButton({ value: 'Undo', dismissOnClick: true }),
  createPlaygroundButton({
    mode: 'html',
    value:
      '<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-info-icon lucide-info"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>',
  }),
]);

const useOnMount = ref(false);
const useOnUnmount = ref(false);
const useOnClick = ref(false);
const useOnClose = ref(false);

const title = ref('');
const description = ref('');
const fallbackTitle = ref(true);
const fallbackDescription = ref(true);

const lastId = ref<ToastId | null>(null);

/* ----- helpers ----- */

function defaultTitleForType(t: ToastType): string {
  if (t === 'loading') {
    return 'Working on it';
  }
  if (t === 'success') {
    return 'Saved';
  }
  if (t === 'error') {
    return 'Something went wrong';
  }
  if (t === 'warning') {
    return 'Heads up';
  }
  return 'Information';
}

function defaultDescriptionForType(t: ToastType): string {
  if (t === 'loading') {
    return 'Hang tight while we finish this task.';
  }
  if (t === 'success') {
    return 'Your changes have been stored.';
  }
  if (t === 'error') {
    return 'Check the console for more details.';
  }
  if (t === 'warning') {
    return 'Please double-check your input.';
  }
  return 'This is just an informational toast.';
}

function resolveContent(value: string, fallback: string, allowFallback: boolean) {
  const trimmed = value.trim();
  if (trimmed) {
    return trimmed;
  }
  return allowFallback ? fallback : '';
}

function ensureContent(
  titleValue: string,
  descriptionValue: string,
  fallbackTitleValue: string,
  fallbackDescriptionValue: string,
) {
  const hasTitle = titleValue.trim().length > 0;
  const hasDescription = descriptionValue.trim().length > 0;

  if (hasTitle || hasDescription) {
    return { title: titleValue, description: descriptionValue };
  }

  console.warn(
    '[toastflow playground] At least one of title/description is required. Applying defaults.',
  );
  return { title: fallbackTitleValue, description: fallbackDescriptionValue };
}

function getContentForType(targetType: ToastType) {
  const resolvedTitle = resolveContent(
    title.value,
    defaultTitleForType(targetType),
    fallbackTitle.value,
  );
  const resolvedDescription = resolveContent(
    description.value,
    defaultDescriptionForType(targetType),
    fallbackDescription.value,
  );

  return ensureContent(
    resolvedTitle,
    resolvedDescription,
    defaultTitleForType(targetType),
    defaultDescriptionForType(targetType),
  );
}

function summarizeClick(ctx: ToastContext, event: MouseEvent) {
  const target = event.target as HTMLElement | null;
  return {
    ctx,
    click: target
      ? { tag: target.tagName, className: target.className, x: event.clientX, y: event.clientY }
      : { x: event.clientX, y: event.clientY },
  };
}

function formatLogDetail(detail: unknown): string {
  if (detail === undefined || detail === null) {
    return '-';
  }
  if (typeof detail === 'string') {
    return detail;
  }
  try {
    return JSON.stringify(detail, null, 2);
  } catch (error) {
    return String(detail);
  }
}

function recordEvent(label: string, detail: unknown) {
  const entry: EventLogEntry = {
    id: `evt-${Date.now()}-${Math.random().toString(16).slice(2)}`,
    label,
    timestamp: new Date().toLocaleTimeString(),
    detail: formatLogDetail(detail),
  };
  eventLog.value = [entry, ...eventLog.value].slice(0, MAX_LOG_ENTRIES);
}

function clearEventLog() {
  eventLog.value = [];
}

/* ----- computed config for show() ----- */

const buttonsConfig = computed(function (): ToastOptions['buttons'] | undefined {
  if (!enableButtons.value) {
    return undefined;
  }

  const buttons = playgroundButtons.value
    .filter((button) => button.value.trim().length > 0)
    .map(function (button): ToastButton {
      const base = {
        id: button.id,
        className: button.className.trim() || undefined,
        ariaLabel: button.ariaLabel.trim() || undefined,
        onClick(ctx: ToastContext) {
          console.log('[vue-toastflow] button.onClick', ctx);
          recordEvent('button.onClick', ctx);
          if (button.dismissOnClick) {
            toast.dismiss(ctx.id);
          }
        },
      };

      if (button.mode === 'html') {
        return { ...base, html: button.value };
      }

      return { ...base, label: button.value };
    });

  if (!buttons.length) {
    return undefined;
  }

  return {
    alignment: buttonsAlignment.value,
    buttons,
    gap: buttonsGap.value.trim() || undefined,
    contentGap: buttonsContentGap.value.trim() || undefined,
  };
});

const baseConfig = computed<Partial<ToastOptions>>(function () {
  const reactiveConfig: Partial<ToastOptions> = {
    offset: offset.value,
    gap: gap.value,
    zIndex: zIndex.value,
    width: width.value,
    overflowScroll: overflowScroll.value,

    duration: duration.value,
    maxVisible: maxVisible.value,
    position: position.value,
    alignment: alignment.value,
    progressAlignment: progressAlignment.value,

    preventDuplicates: preventDuplicates.value,
    order: order.value,

    progressBar: progressBar.value,
    pauseOnHover: pauseOnHover.value,
    pauseStrategy: pauseStrategy.value,

    animation: {
      name: config.animation.name,
      bump: config.animation.bump,
      clearAll: config.animation.clearAll,
    },

    closeButton: closeButton.value,
    closeOnClick: closeOnClick.value,

    supportHtml: supportHtml.value,

    showCreatedAt: showCreatedAt.value,
  };

  if (buttonsConfig.value) {
    reactiveConfig.buttons = buttonsConfig.value;
  }

  if (useOnMount.value) {
    reactiveConfig.onMount = function (ctx: ToastContext) {
      console.log('[vue-toastflow] onMount', ctx);
      recordEvent('onMount', ctx);
    };
  }

  if (useOnUnmount.value) {
    reactiveConfig.onUnmount = function (ctx: ToastContext) {
      console.log('[vue-toastflow] onUnmount', ctx);
      recordEvent('onUnmount', ctx);
    };
  }

  if (useOnClick.value) {
    reactiveConfig.onClick = function (ctx: ToastContext, event: MouseEvent) {
      console.log('[vue-toastflow] onClick', ctx, event);
      recordEvent('onClick', summarizeClick(ctx, event));
    };
  }

  if (useOnClose.value) {
    reactiveConfig.onClose = function (ctx: ToastContext) {
      console.log('[vue-toastflow] onClose', ctx);
      recordEvent('onClose', ctx);
    };
  }

  return reactiveConfig;
});

/* ----- actions ----- */

function pushLoading() {
  const loadingContent = getContentForType('loading');
  const successContent = getContentForType('success');
  const errorContent = getContentForType('error');

  const task = new Promise<string>(function (resolve, reject) {
    setTimeout(function () {
      if (Math.random() > 0.35) {
        resolve('done');
      } else {
        reject(new Error('Promise rejected'));
      }
    }, 1500);
  });

  const pending = toast.loading(task, {
    loading: {
      ...baseConfig.value,
      ...loadingContent,
    },
    success() {
      return {
        ...baseConfig.value,
        ...successContent,
      };
    },
    error(error: unknown) {
      const message =
        error instanceof Error && error.message ? error.message : errorContent.description;
      return {
        ...baseConfig.value,
        ...errorContent,
        description: message,
      };
    },
  });

  lastId.value = pending.toastId;
  recordEvent('toast.loading', { id: pending.toastId });
}

function push(typeOverride?: ToastType) {
  const toastType = typeOverride ?? type.value;

  if (toastType === 'loading') {
    pushLoading();
    return;
  }

  const content = getContentForType(toastType);

  lastId.value = toast.show({
    ...baseConfig.value,
    type: toastType,
    ...content,
  });
  recordEvent('toast.show', { id: lastId.value, type: toastType });
}

function pushBurst() {
  for (let i = 0; i < 5; i += 1) {
    push(type.value);
  }
}

function updateLast() {
  if (!lastId.value) {
    return;
  }

  const updatedTitle = resolveContent(title.value, 'Updated toast', fallbackTitle.value);
  const updatedDescription = resolveContent(
    description.value,
    'This toast was updated from the Toastflow playground.',
    fallbackDescription.value,
  );

  toast.update(lastId.value, {
    title: updatedTitle ? `${updatedTitle} (updated)` : '',
    description: updatedDescription,
  });
  recordEvent('toast.update', { id: lastId.value });
}

function resetToDefaults() {
  position.value = 'top-right';
  alignment.value = 'left';
  progressAlignment.value = 'right-to-left';
  type.value = 'success';

  offset.value = '16px';
  gap.value = '8px';
  zIndex.value = 9999;
  width.value = '350px';
  overflowScroll.value = false;

  duration.value = 5000;
  maxVisible.value = 5;

  preventDuplicates.value = false;
  order.value = 'newest';

  progressBar.value = true;
  pauseOnHover.value = true;
  pauseStrategy.value = 'resume';

  closeButton.value = true;
  closeOnClick.value = false;

  supportHtml.value = false;

  showCreatedAt.value = false;

  enableButtons.value = false;
  buttonsAlignment.value = 'bottom-right';
  buttonsGap.value = '';
  buttonsContentGap.value = '';
  playgroundButtons.value = [
    createPlaygroundButton({ value: 'Undo', dismissOnClick: true }),
    createPlaygroundButton({
      mode: 'html',
      value:
        '<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-info-icon lucide-info"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>',
    }),
  ];

  useOnMount.value = false;
  useOnUnmount.value = false;
  useOnClick.value = false;
  useOnClose.value = false;

  title.value = '';
  description.value = '';
  fallbackTitle.value = true;
  fallbackDescription.value = true;
}

function addPlaygroundButton() {
  playgroundButtons.value = [...playgroundButtons.value, createPlaygroundButton()];
}

function removePlaygroundButton(id: string) {
  playgroundButtons.value = playgroundButtons.value.filter((button) => button.id !== id);
}

function updatePlaygroundButton(id: string, updates: Partial<PlaygroundButton>) {
  playgroundButtons.value = playgroundButtons.value.map((button) =>
    button.id === id ? { ...button, ...updates } : button,
  );
}

/* ----- query params / sharing ----- */

const shareableState = computed(function () {
  return {
    position: position.value,
    alignment: alignment.value,
    progressAlignment: progressAlignment.value,
    type: type.value,
    offset: offset.value,
    gap: gap.value,
    zIndex: zIndex.value,
    width: width.value,
    overflowScroll: overflowScroll.value,
    duration: duration.value,
    maxVisible: maxVisible.value,
    preventDuplicates: preventDuplicates.value,
    order: order.value,
    progressBar: progressBar.value,
    pauseOnHover: pauseOnHover.value,
    pauseStrategy: pauseStrategy.value,
    closeButton: closeButton.value,
    closeOnClick: closeOnClick.value,
    supportHtml: supportHtml.value,
    showCreatedAt: showCreatedAt.value,
    enableButtons: enableButtons.value,
    buttonsAlignment: buttonsAlignment.value,
    buttonsGap: buttonsGap.value,
    buttonsContentGap: buttonsContentGap.value,
    buttons: playgroundButtons.value,
    title: title.value,
    description: description.value,
    fallbackTitle: fallbackTitle.value,
    fallbackDescription: fallbackDescription.value,
  };
});

const shareLink = computed(function () {
  if (!hasWindow) {
    return '';
  }
  const params = new URLSearchParams();
  params.set('state', JSON.stringify(shareableState.value));
  return `${window.location.origin}${window.location.pathname}?${params.toString()}`;
});

function hydrateFromQuery() {
  if (!hasWindow) {
    return;
  }
  const params = new URLSearchParams(window.location.search);
  const raw = params.get('state');
  if (!raw) {
    return;
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch (error) {
    console.warn('[toastflow playground] Failed to parse state query param', error);
    return;
  }

  if (!parsed || typeof parsed !== 'object') {
    return;
  }

  const state = parsed as Record<string, unknown>;

  function applyString(target: { value: string }, key: string) {
    if (typeof state[key] === 'string') {
      target.value = state[key] as string;
    }
  }

  function applyBoolean(target: { value: boolean }, key: string) {
    if (typeof state[key] === 'boolean') {
      target.value = state[key] as boolean;
    }
  }

  function applyNumber(target: { value: number }, key: string) {
    if (typeof state[key] === 'number' && Number.isFinite(state[key])) {
      target.value = state[key] as number;
    }
  }

  applyString(position, 'position');
  applyString(alignment, 'alignment');
  applyString(progressAlignment, 'progressAlignment');
  applyString(type, 'type');

  applyString(offset, 'offset');
  applyString(gap, 'gap');
  applyNumber(zIndex, 'zIndex');
  applyString(width, 'width');
  applyBoolean(overflowScroll, 'overflowScroll');

  applyNumber(duration, 'duration');
  applyNumber(maxVisible, 'maxVisible');

  applyBoolean(preventDuplicates, 'preventDuplicates');
  applyString(order, 'order');

  applyBoolean(progressBar, 'progressBar');
  applyBoolean(pauseOnHover, 'pauseOnHover');
  applyString(pauseStrategy, 'pauseStrategy');

  applyBoolean(closeButton, 'closeButton');
  applyBoolean(closeOnClick, 'closeOnClick');

  applyBoolean(supportHtml, 'supportHtml');
  applyBoolean(showCreatedAt, 'showCreatedAt');

  applyBoolean(enableButtons, 'enableButtons');
  applyString(buttonsAlignment, 'buttonsAlignment');
  applyString(buttonsGap, 'buttonsGap');
  applyString(buttonsContentGap, 'buttonsContentGap');

  if (Array.isArray(state.buttons)) {
    const safeButtons = (state.buttons as PlaygroundButton[])
      .map(function (button) {
        return createPlaygroundButton({
          id: button.id,
          mode: button.mode,
          value: button.value,
          className: button.className,
          ariaLabel: button.ariaLabel,
          dismissOnClick: Boolean(button.dismissOnClick),
        });
      })
      .filter((button) => button.value.length > 0);
    if (safeButtons.length) {
      playgroundButtons.value = safeButtons;
      buttonCounter = safeButtons.length;
    }
  }

  applyString(title, 'title');
  applyString(description, 'description');
  applyBoolean(fallbackTitle, 'fallbackTitle');
  applyBoolean(fallbackDescription, 'fallbackDescription');
}

/* ----- copy helpers ----- */

function setTemporaryLabel(target: { value: string }, next: string) {
  const original = target.value;
  target.value = next;
  setTimeout(function () {
    target.value = original;
  }, 1600);
}

async function copyCodeSnippet() {
  if (!navigator.clipboard) {
    return;
  }
  await navigator.clipboard.writeText(codeSnippet.value);
  setTemporaryLabel(copyCodeLabel, 'Copied!');
}

async function copyShareLink() {
  if (!navigator.clipboard || !shareLink.value) {
    return;
  }
  await navigator.clipboard.writeText(shareLink.value);
  setTemporaryLabel(copyShareLabel, 'Copied!');
}

/* ----- keyboard shortcuts ----- */

function shouldIgnoreShortcut(event: KeyboardEvent) {
  const target = event.target as HTMLElement | null;
  if (!target) {
    return false;
  }
  const tag = target.tagName;
  return tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || target.isContentEditable;
}

function onKeydown(event: KeyboardEvent) {
  if (event.metaKey || event.ctrlKey || event.altKey) {
    return;
  }
  if (shouldIgnoreShortcut(event)) {
    return;
  }

  if (event.key.toLowerCase() === 't') {
    event.preventDefault();
    push();
  } else if (event.key.toLowerCase() === 'd') {
    event.preventDefault();
    toast.dismissAll();
  } else if (event.key.toLowerCase() === 'r') {
    event.preventDefault();
    resetToDefaults();
  }
}

/* ----- code snippet ----- */

function escapeString(value: string) {
  return value.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
}

function formatValue(value: unknown): string {
  if (typeof value === 'string') {
    return `'${escapeString(value)}'`;
  }
  if (typeof value === 'number' || typeof value === 'boolean') {
    return String(value);
  }
  if (Array.isArray(value)) {
    return JSON.stringify(value);
  }
  if (typeof value === 'object' && value !== null) {
    return JSON.stringify(value, null, 2);
  }
  return String(value);
}

function buildButtonsSnippetLines() {
  if (!enableButtons.value) {
    return [];
  }

  const filteredButtons = playgroundButtons.value.filter(
    (button) => button.value.trim().length > 0,
  );
  if (!filteredButtons.length) {
    return [];
  }

  const lines: string[] = [];
  lines.push('buttons: {');
  lines.push(`  alignment: '${buttonsAlignment.value}',`);
  if (buttonsGap.value.trim()) {
    lines.push(`  gap: '${buttonsGap.value.trim()}',`);
  }
  if (buttonsContentGap.value.trim()) {
    lines.push(`  contentGap: '${buttonsContentGap.value.trim()}',`);
  }
  lines.push('  buttons: [');

  filteredButtons.forEach(function (button) {
    lines.push('    {');
    if (button.mode === 'html') {
      lines.push(`      html: '${escapeString(button.value)}',`);
    } else {
      lines.push(`      label: '${escapeString(button.value)}',`);
    }
    if (button.className.trim()) {
      lines.push(`      className: '${escapeString(button.className)}',`);
    }
    if (button.ariaLabel.trim()) {
      lines.push(`      ariaLabel: '${escapeString(button.ariaLabel)}',`);
    }
    lines.push('      onClick(ctx) {');
    lines.push("        console.log('button click', ctx);");
    if (button.dismissOnClick) {
      lines.push('        toast.dismiss(ctx.id);');
    }
    lines.push('      },');
    lines.push('    },');
  });

  lines.push('  ],');
  lines.push('},');
  return lines;
}

function buildOptionsLines(content: { title: string; description: string }, toastType: ToastType) {
  const lines: string[] = [];
  const add = function (key: string, value: unknown) {
    if (value === undefined || value === '') {
      return;
    }
    lines.push(`${key}: ${formatValue(value)},`);
  };

  add('type', toastType);
  add('title', content.title);
  add('description', content.description);
  add('position', position.value);
  add('alignment', alignment.value);
  add('progressAlignment', progressAlignment.value);
  add('offset', offset.value);
  add('gap', gap.value);
  add('width', width.value);
  add('zIndex', zIndex.value);
  add('overflowScroll', overflowScroll.value);
  add('duration', duration.value);
  add('maxVisible', maxVisible.value);
  add('preventDuplicates', preventDuplicates.value);
  add('order', order.value);
  add('progressBar', progressBar.value);
  add('pauseOnHover', pauseOnHover.value);
  add('pauseStrategy', pauseStrategy.value);
  add('closeButton', closeButton.value);
  add('closeOnClick', closeOnClick.value);
  add('supportHtml', supportHtml.value);
  add('showCreatedAt', showCreatedAt.value);

  lines.push(...buildButtonsSnippetLines());

  if (useOnMount.value) {
    lines.push("onMount(ctx) { console.log('onMount', ctx); },");
  }
  if (useOnUnmount.value) {
    lines.push("onUnmount(ctx) { console.log('onUnmount', ctx); },");
  }
  if (useOnClick.value) {
    lines.push("onClick(ctx) { console.log('onClick', ctx); },");
  }
  if (useOnClose.value) {
    lines.push("onClose(ctx) { console.log('onClose', ctx); },");
  }

  return lines;
}

const codeSnippet = computed(function () {
  const targetType = type.value;
  const content = getContentForType(targetType === 'loading' ? 'loading' : targetType);
  const optionLines = buildOptionsLines(content, targetType === 'loading' ? 'loading' : targetType);
  const body = optionLines.map((line) => `  ${line}`).join('\n');

  if (targetType === 'loading') {
    return `import { toast } from 'vue-toastflow';

const task = new Promise((resolve, reject) => {
  resolve('done');
});

const toastConfig = {
${body}
};

toast.loading(task, { loading: toastConfig });
`;
  }

  return `import { toast } from 'vue-toastflow';

const toastConfig = {
${body}
};

toast.show(toastConfig);
`;
});

/* ----- lifecycle ----- */

onMounted(function () {
  hydrateFromQuery();
  if (hasWindow) {
    window.addEventListener('keydown', onKeydown);
  }
});

onBeforeUnmount(function () {
  if (hasWindow) {
    window.removeEventListener('keydown', onKeydown);
  }
});

/* ----- watchers ----- */
</script>

<template>
  <div
    class="w-full max-w-5xl rounded-3xl bg-white/90 p-6 shadow-2xl ring-1 ring-slate-200 backdrop-blur-md grid gap-6 lg:max-h-[45rem] lg:overflow-auto lg:pb-0"
  >
    <div class="flex flex-col gap-3">
      <div class="flex flex-wrap items-center justify-between gap-3">
        <div class="space-y-1">
          <p class="ml-2 text-xs text-slate-500 md:inline">
            Configure options and push toasts to see them in action.
          </p>
        </div>

        <div class="hidden lg:flex flex-wrap items-center gap-2 text-[0.8rem] text-slate-600">
          <div v-for="shortcut in shortcutKeys" :key="shortcut.key" class="flex items-center gap-2">
            <span :class="keycapClass">{{ shortcut.key }}</span>
            <span class="text-[0.75rem] text-slate-600">{{ shortcut.label }}</span>
          </div>
        </div>
      </div>

      <div class="flex flex-wrap items-center justify-between gap-2">
        <div
          class="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-[0.8rem] text-slate-600"
        >
          <span class="text-[0.65rem] uppercase tracking-[0.12em] text-slate-400"
            >Last toast ID</span
          >
          <span class="font-mono text-xs text-slate-800">
            {{ lastId ?? '-' }}
          </span>
        </div>

        <div class="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            class="text-[0.75rem]"
            tooltip="Copy share link"
            @click="copyShareLink"
          >
            <Share2 class="h-4 w-4" />
            {{ copyShareLabel }}
          </Button>
          <Button
            v-if="hasGiscusConfig"
            variant="outline"
            class="text-[0.75rem]"
            tooltip="Open feedback"
            @click="isFeedbackModalOpen = true"
          >
            <MessageCircle class="h-4 w-4" />
            Feedback
          </Button>
        </div>
      </div>
    </div>

    <div class="grid gap-5 text-xs lg:grid-cols-4 md:text-sm">
      <PositionCard
        v-model:position="position"
        v-model:alignment="alignment"
        v-model:progressAlignment="progressAlignment"
        v-model:type="type"
      />

      <BehaviorCard
        v-model:preventDuplicates="preventDuplicates"
        v-model:progressBar="progressBar"
        v-model:pauseOnHover="pauseOnHover"
        v-model:closeButton="closeButton"
        v-model:closeOnClick="closeOnClick"
        v-model:supportHtml="supportHtml"
        v-model:showCreatedAt="showCreatedAt"
        v-model:enableButtons="enableButtons"
        v-model:buttonsAlignment="buttonsAlignment"
        v-model:buttonsGap="buttonsGap"
        v-model:buttonsContentGap="buttonsContentGap"
        v-model:order="order"
        v-model:pauseStrategy="pauseStrategy"
        v-model:overflowScroll="overflowScroll"
        :playground-buttons="playgroundButtons"
        @add-button="addPlaygroundButton"
        @remove-button="removePlaygroundButton"
        @update-button="updatePlaygroundButton"
      />

      <TimingLayoutCard
        v-model:duration="duration"
        v-model:maxVisible="maxVisible"
        v-model:offset="offset"
        v-model:gap="gap"
        v-model:width="width"
        v-model:zIndex="zIndex"
      />

      <ContentCard
        v-model:useOnMount="useOnMount"
        v-model:useOnUnmount="useOnUnmount"
        v-model:useOnClick="useOnClick"
        v-model:useOnClose="useOnClose"
        v-model:title="title"
        v-model:description="description"
        v-model:fallbackTitle="fallbackTitle"
        v-model:fallbackDescription="fallbackDescription"
        @open-log="isLogModalOpen = true"
      />
    </div>

    <section class="rounded-2xl border border-slate-200 bg-slate-50/80 p-4 grid gap-4">
      <div class="flex flex-wrap items-center justify-between gap-2">
        <div class="flex items-center gap-2 text-sm font-semibold text-slate-800">
          <Terminal class="h-4 w-4" />
          Live code (mirrors current config)
        </div>
        <Button
          variant="outline"
          class="text-[0.75rem]"
          tooltip="Copy code"
          @click="copyCodeSnippet"
        >
          <Copy class="h-4 w-4" />
          {{ copyCodeLabel }}
        </Button>
      </div>
      <highlightjs
        class="code-block"
        language="typescript"
        :autodetect="false"
        :code="codeSnippet.trim()"
      />
    </section>

    <div class="hidden lg:block sticky bottom-0 bg-white/90">
      <ActionsFooter
        @push="push()"
        @push-burst="pushBurst"
        @update-last="updateLast"
        @dismiss-all="toast.dismissAll"
        @reset="resetToDefaults"
      />
    </div>
  </div>

  <Teleport to="body">
    <div class="lg:hidden fixed inset-x-0 bottom-0 z-40 w-full bg-white/95 shadow-lg backdrop-blur">
      <ActionsFooter
        @push="push()"
        @push-burst="pushBurst"
        @update-last="updateLast"
        @dismiss-all="toast.dismissAll"
        @reset="resetToDefaults"
      />
    </div>
  </Teleport>

  <Modal v-model="isLogModalOpen" title="Event log">
    <div class="grid gap-4">
      <div class="flex items-center justify-between text-xs text-slate-500">
        <span v-if="eventLog.length">Newest first - {{ eventLog.length }} events</span>
        <span v-else>No events yet</span>
        <Button
          v-if="eventLog.length"
          variant="danger"
          tooltip="Clear event log"
          @click="clearEventLog"
        >
          Clear
        </Button>
      </div>

      <div v-if="eventLog.length" class="max-h-[360px] space-y-3 overflow-auto">
        <div v-for="entry in eventLog" :key="entry.id" class="space-y-2">
          <div class="flex items-center justify-between text-[0.75rem] text-slate-500">
            <span class="font-semibold text-slate-700">{{ entry.label }}</span>
            <span class="text-xs text-slate-400">{{ entry.timestamp }}</span>
          </div>
          <highlightjs
            class="code-block"
            language="json"
            :autodetect="false"
            :code="entry.detail"
          />
        </div>
      </div>
    </div>
  </Modal>

  <Modal v-if="hasGiscusConfig" v-model="isFeedbackModalOpen" title="Feedback">
    <div class="space-y-3 text-sm text-slate-600">
      <div class="rounded-xl border border-slate-200 bg-slate-50 p-2">
        <Giscus
          :repo="giscusConfig.repo"
          :repo-id="giscusConfig.repoId"
          :category="giscusConfig.category"
          :category-id="giscusConfig.categoryId"
          :mapping="giscusConfig.mapping"
          :theme="giscusConfig.theme"
          :strict="giscusConfig.strict"
          input-position="top"
          lang="en"
          loading="lazy"
          class="min-h-[320px]"
        />
      </div>
    </div>
  </Modal>
</template>
