<script setup lang="ts">
import { toast, ToastContainer } from 'vue-toastflow';
import Playground from '@/views/Playground.vue';
import { nextTick, onBeforeUnmount, onMounted, ref } from 'vue';
// @ts-ignore
import { useSnowfall } from 'vue-snowfall';
import { BookOpen, Github } from 'lucide-vue-next';
import Button from './components/Button.vue';

const SEASONAL_MODE = (import.meta.env.VITE_SEASONAL_MODE ?? 'holiday').toLowerCase();
const isHolidayMode = SEASONAL_MODE === 'holiday';
const prefersReducedMotion =
  typeof window !== 'undefined' &&
  window.matchMedia &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const showMore = ref(false);

if (isHolidayMode && !prefersReducedMotion) {
  const snowfall = useSnowfall({
    container: '#snow-container',
  });

  onMounted(() => {
    snowfall.startSnowflakes();
    toast.show({
      type: 'info',
      title: 'Merry Christmas!',
      description: 'Have a cozy holiday.',
      theme: 'merry-christmas',
      duration: 3000,
      position: 'top-left',
    });
    setTimeout(() => {
      toast.show({
        type: 'success',
        title: 'Happy New Year!',
        description: 'Wishing you a joyful year ahead.',
        theme: 'happy-new-year',
        duration: 3000,
        position: 'top-right',
      });
    }, 1000);
  });

  onBeforeUnmount(() => {
    snowfall.stopSnowflakes();
  });
}

function openMore(targetId = 'more-info', offsetPx = 20) {
  showMore.value = true;

  if (!targetId) {
    return;
  }

  nextTick(() => {
    const el = document.getElementById(targetId);
    if (!el) {
      return;
    }
    const y = el.getBoundingClientRect().top + window.scrollY - offsetPx;
    window.scrollTo({ top: y, behavior: 'smooth' });
  });
}
</script>

<template>
  <div
    class="relative min-h-screen bg-linear-to-b from-sky-100 to-sky-200 text-slate-900 overflow-hidden"
  >
    <a
      href="#main-content"
      class="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-white focus:px-3 focus:py-2 focus:text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-600"
    >
      Skip to main content
    </a>

    <div
      v-if="isHolidayMode"
      id="snow-container"
      class="pointer-events-none fixed inset-0 z-0"
      aria-hidden="true"
    />

    <div
      id="main-content"
      class="relative z-10 mx-auto flex min-h-screen max-w-6xl flex-col gap-14 px-4 py-8"
    >
      <header class="flex items-center justify-between">
        <div class="flex items-center gap-2">
          <h1 class="text-lg font-semibold tracking-tight text-slate-900">Toastflow</h1>
          <span
            class="rounded-full border border-sky-100 bg-sky-50 px-3 py-0.5 text-[0.65rem] font-bold uppercase tracking-[0.18em] text-sky-600"
          >
            Playground
          </span>
        </div>

        <div class="flex items-center gap-2">
          <Button
            variant="outline"
            href="https://github.com/adrianjanocko/toastflow"
            target="_blank"
            tooltip="View on GitHub"
          >
            <Github class="size-4" />
            GitHub
          </Button>

          <Button
            variant="primary"
            href="https://docs.toastflow.top/"
            target="_blank"
            tooltip="Open documentation"
          >
            <BookOpen class="size-4" />
            Documentation
          </Button>
        </div>
      </header>

      <main
        class="flex flex-1 flex-col gap-12 items-center justify-start pb-24 lg:pb-0 lg:justify-center"
      >
        <section class="max-w-2xl text-center text-sm text-slate-600 grid gap-3">
          <h2 class="text-2xl font-semibold text-slate-900">Vue toast notifications playground</h2>
          <p>
            Explore Toastflow, a Vue toast library for fast, accessible notifications. Adjust
            placement, timing, and behaviors to see how Vue toasts feel before shipping them to
            production.
          </p>
          <div class="flex flex-wrap items-center justify-center gap-2 text-xs">
            <Button
              variant="primary"
              href="https://www.npmjs.com/package/vue-toastflow"
              target="_blank"
              tooltip="View npm package"
            >
              npm install vue-toastflow
            </Button>
            <Button
              variant="outline"
              tooltip="Jump to install instructions"
              :aria-expanded="showMore"
              aria-controls="more-info"
              @click="openMore()"
            >
              Installation guide
            </Button>
          </div>
        </section>
        <Playground />

        <div class="w-full max-w-5xl grid gap-4">
          <div class="flex justify-center">
            <Button
              variant="primary"
              class="w-full md:w-auto"
              :aria-expanded="showMore"
              aria-controls="more-info"
              @click="showMore ? (showMore = false) : openMore()"
            >
              {{ showMore ? 'Hide information' : 'More information' }}
            </Button>
          </div>

          <div id="more-info" v-show="showMore" class="grid gap-6">
            <section
              class="grid gap-5 rounded-3xl border border-slate-200 bg-white/90 p-6 text-sm text-slate-700 shadow-lg backdrop-blur-md w-full"
            >
              <div class="grid gap-2 text-left">
                <h2 class="text-xl font-semibold text-slate-900">Why Toastflow for Vue</h2>
                <p class="text-slate-600">
                  Toastflow ships sensible defaults for accessibility, queue management, and
                  keyboard shortcuts. It is a typed core with a Vue renderer, CSS-first theming, and
                  headless hooks so you can render the same store logic with your own UI.
                </p>
              </div>

              <div class="grid gap-4 md:grid-cols-3">
                <div class="rounded-2xl border border-slate-200 bg-slate-50/60 p-4">
                  <h3 class="text-base font-semibold text-slate-900">Accessibility-first</h3>
                  <p class="text-slate-600">
                    ARIA-friendly toasts with focus management, pause-on-hover, and screen-reader
                    cues that ship ready for WCAG.
                  </p>
                </div>
                <div class="rounded-2xl border border-slate-200 bg-slate-50/60 p-4">
                  <h3 class="text-base font-semibold text-slate-900">Flexible UI</h3>
                  <p class="text-slate-600">
                    Configure placement, alignment, width, buttons, and HTML support. Use the
                    headless slot to render a custom card while keeping the core behaviors.
                  </p>
                </div>
                <div class="rounded-2xl border border-slate-200 bg-slate-50/60 p-4">
                  <h3 class="text-base font-semibold text-slate-900">Performance-aware</h3>
                  <p class="text-slate-600">
                    Lightweight core with minimal dependencies, SSR-friendly guards, and CSS-only
                    animations to keep bundles small and predictable.
                  </p>
                </div>
              </div>
            </section>

            <section
              id="install"
              class="grid gap-4 rounded-3xl border border-slate-200 bg-white/90 p-6 text-sm text-slate-700 shadow-lg backdrop-blur-md w-full"
            >
              <div class="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 class="text-xl font-semibold text-slate-900">Install Toastflow for Vue</h2>
                  <p class="text-slate-600">
                    Works with Vue 3.5+. Use the shared core to keep React/Vue codebases aligned.
                  </p>
                </div>
                <div class="flex gap-2">
                  <Button
                    variant="primary"
                    href="https://github.com/adrianjanocko/toastflow"
                    target="_blank"
                    tooltip="Read Toastflow docs on GitHub"
                  >
                    Docs
                  </Button>
                  <Button
                    variant="outline"
                    href="https://www.npmjs.com/package/vue-toastflow"
                    target="_blank"
                    tooltip="Open npm package"
                  >
                    npm
                  </Button>
                </div>
              </div>

              <div class="rounded-2xl border border-slate-200 bg-slate-50/60 p-4">
                <p class="text-[0.9rem] font-semibold text-slate-900 mb-2">Install</p>
                <pre
                  class="code-block bg-slate-900 text-slate-100 p-3"
                ><code>npm install vue-toastflow</code></pre>
              </div>

              <div class="grid gap-3">
                <p class="text-[0.9rem] font-semibold text-slate-900">Common use cases</p>
                <ul class="grid gap-2 list-disc list-inside text-slate-600">
                  <li>Product launches that need reliable, branded toasts</li>
                  <li>Dashboards that queue multiple events without overlap</li>
                  <li>Marketing previews where PMs can tune timing without code changes</li>
                </ul>
              </div>
            </section>

            <section
              class="grid gap-4 rounded-3xl border border-slate-200 bg-white/90 p-6 text-sm text-slate-700 shadow-lg backdrop-blur-md w-full"
            >
              <div class="grid gap-2">
                <h2 class="text-xl font-semibold text-slate-900">FAQ</h2>
                <p class="text-slate-600">Quick answers for teams evaluating Toastflow.</p>
              </div>
              <div class="grid gap-3">
                <div class="rounded-xl border border-slate-200 bg-slate-50/60 p-3">
                  <h3 class="font-semibold text-slate-900">Is Toastflow accessible?</h3>
                  <p class="text-slate-600">
                    Yes. Toasts use alert/status live regions, ARIA labels (even for HTML titles), a
                    built-in pause-on-hover, and a prefers-reduced-motion media query to keep
                    animations gentle.
                  </p>
                </div>
                <div class="rounded-xl border border-slate-200 bg-slate-50/60 p-3">
                  <h3 class="font-semibold text-slate-900">Does it support SSR?</h3>
                  <p class="text-slate-600">
                    The core store is isomorphic, the Vue renderer defers DOM access until mounted,
                    and the playground guards window usage, so Nuxt/Vite SSR works out of the box.
                  </p>
                </div>
                <div class="rounded-xl border border-slate-200 bg-slate-50/60 p-3">
                  <h3 class="font-semibold text-slate-900">Can I use it outside Vue components?</h3>
                  <p class="text-slate-600">
                    Yes. Install the plugin once, then call <code>toast.*</code> from stores or
                    services. For non-Vue apps, use the headless <code>toastflow-core</code> store
                    and render your own UI.
                  </p>
                </div>
                <div class="rounded-xl border border-slate-200 bg-slate-50/60 p-3">
                  <h3 class="font-semibold text-slate-900">How do I style it to match my brand?</h3>
                  <p class="text-slate-600">
                    Override CSS variables or animation class names, pass a <code>theme</code> /
                    <code>animation</code> override, or use the headless slot to ship a fully custom
                    card with the same store logic.
                  </p>
                </div>
                <div class="rounded-xl border border-slate-200 bg-slate-50/60 p-3">
                  <h3 class="font-semibold text-slate-900">
                    How do I log or react to toast events?
                  </h3>
                  <p class="text-slate-600">
                    Subscribe to <code>toast.subscribe</code> for state changes or
                    <code>toast.subscribeEvents</code> for duplicate/update/timer-reset signals,
                    wire lifecycle hooks like <code>onMount</code>/<code>onClose</code>, and inspect
                    <code>toast.getState()</code> when you need analytics.
                  </p>
                </div>
              </div>
            </section>
          </div>
        </div>
      </main>

      <footer class="w-full flex justify-center text-[11px]">
        <div class="flex items-center gap-2">
          <span class="font-medium text-slate-800">Built by</span>
          <Button
            variant="ghost"
            href="https://www.linkedin.com/in/adrianjanocko"
            target="_blank"
            tooltip="Open LinkedIn profile"
            class="p-0! text-slate-600! hover:text-slate-900! hover:bg-transparent"
          >
            @adrianjanocko
          </Button>
        </div>
      </footer>
    </div>

    <ToastContainer />
  </div>
</template>

<style>
.tf-toast-accent--merry-christmas {
  --tf-toast-bg: #c33232;
  --tf-toast-border-color: #f7ede2;
  --tf-toast-color: #fff7f2;
  --tf-toast-description-color: #fdeae2;
  --tf-toast-progress-bg: color-mix(in srgb, #f7ede2 20%, transparent);
  --tf-toast-progress-bar-bg: #f7ede2;

  --tf-toast-icon-info: #fff;
}

.tf-toast-accent--happy-new-year {
  --tf-toast-bg: #1c2133;
  --tf-toast-border-color: #f7ede2;
  --tf-toast-color: #fff8f3;
  --tf-toast-description-color: #f2e6d9;
  --tf-toast-progress-bg: color-mix(in srgb, #f7ede2 22%, transparent);
  --tf-toast-progress-bar-bg: #f1c46b;

  --tf-toast-icon-success: #f1c46b;
}
</style>
