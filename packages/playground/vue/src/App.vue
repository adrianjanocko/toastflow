<script setup lang="ts">
import { toast, ToastContainer } from 'vue-toastflow';
import Playground from '@/views/Playground.vue';
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from 'vue';
// @ts-ignore
import { useSnowfall } from 'vue-snowfall';
import { BookOpen, Github, MoonStar, Sparkles, SunMedium } from 'lucide-vue-next';
import Button from './components/Button.vue';
import Badge from './components/Badge.vue';

const SEASONAL_MODE = (import.meta.env.VITE_SEASONAL_MODE ?? 'holiday').toLowerCase();
const THEME_STORAGE_KEY = 'toastflow-playground-theme';
type ThemeMode = 'light' | 'dark';
const hasWindow = typeof window !== 'undefined';
const isHolidayMode = SEASONAL_MODE === 'holiday';
const prefersReducedMotion =
  hasWindow &&
  window.matchMedia &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const showMore = ref(true);
const themeMode = ref<ThemeMode>('light');
const isDarkTheme = computed(function () {
  return themeMode.value === 'dark';
});

function applyTheme(mode: ThemeMode) {
  themeMode.value = mode;
  if (!hasWindow) {
    return;
  }
  document.documentElement.classList.toggle('dark', mode === 'dark');
  document.documentElement.dataset.theme = mode;
}

function setTheme(mode: ThemeMode, persist = true) {
  applyTheme(mode);
  if (!persist || !hasWindow) {
    return;
  }
  window.localStorage.setItem(THEME_STORAGE_KEY, mode);
}

function toggleTheme() {
  setTheme(isDarkTheme.value ? 'light' : 'dark');
}

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

onMounted(function () {
  if (!hasWindow) {
    return;
  }
  const savedTheme = window.localStorage.getItem(THEME_STORAGE_KEY);
  if (savedTheme === 'light' || savedTheme === 'dark') {
    setTheme(savedTheme, false);
  }
});
</script>

<template>
  <div
    class="ui-canvas relative min-h-screen overflow-hidden transition-colors duration-300"
  >
    <a
      href="#main-content"
      class="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-white focus:px-3 focus:py-2 focus:text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-600 dark:focus:bg-slate-900 dark:focus:text-slate-100 dark:focus:ring-slate-300"
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
      <header class="flex flex-col sm:flex-row gap-2 items-center justify-between">
        <div class="flex items-center gap-2">
          <h1 class="text-lg font-semibold tracking-tight text-slate-900 dark:text-slate-100">
            Toastflow
            <span class="sr-only">— Toast Notifications for Vue and Nuxt</span>
          </h1>
          <Badge variant="brand">
            <template #icon>
              <Sparkles class="ui-brand-pill-icon size-3" />
            </template>
            Playground
          </Badge>
        </div>

        <div class="flex items-center gap-2">
          <Button
            variant="outline"
            :tooltip="isDarkTheme ? 'Switch to light mode' : 'Switch to dark mode'"
            icon-only
            @click="toggleTheme"
          >
            <SunMedium v-if="isDarkTheme" class="size-4" />
            <MoonStar v-else class="size-4" />
          </Button>

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
        <section class="max-w-3xl text-center text-base text-slate-500/90 grid gap-5 dark:text-slate-400">
          <h2 class="text-[2.5rem] leading-[1.1] font-bold tracking-tight text-slate-950 dark:text-white">
            Toast notifications playground
          </h2>
          <p class="mx-auto max-w-2xl mb-1">
            Explore Toastflow — an accessible, lightweight toast notification library for Vue 3 and
            Nuxt. Configure positions, timing, animations, and behaviors in this interactive
            playground, then copy the generated code straight into your project.
          </p>
          <p class="text-[0.8rem] font-medium tracking-wide text-slate-400/80 uppercase dark:text-slate-500/80">
            TypeScript-first · CSS-first theming · headless mode · SSR-ready · MIT licensed
          </p>
          <div class="flex flex-wrap items-center justify-center gap-2 text-xs">
            <Button
              variant="primary"
              href="https://www.npmjs.com/package/vue-toastflow"
              target="_blank"
              tooltip="View Toastflow npm package for Vue"
            >
              Install for Vue
            </Button>
            <Button
              variant="primary"
              href="https://www.npmjs.com/package/nuxt-toastflow"
              target="_blank"
              tooltip="View Toastflow npm package for Nuxt"
            >
              Install for Nuxt
            </Button>
          </div>
        </section>
        <Playground :theme-mode="themeMode" />

        <div class="w-full max-w-5xl grid gap-4">
          <div class="flex justify-center">
            <Button
              variant="primary"
              :aria-expanded="showMore"
              aria-controls="more-info"
              @click="showMore ? (showMore = false) : openMore()"
            >
              {{ showMore ? 'Hide details' : 'Show details' }}
            </Button>
          </div>

          <div id="more-info" v-show="showMore" class="grid gap-6">
            <section
              class="grid gap-5 rounded-3xl border border-slate-200/80 bg-white/95 p-8 text-sm text-slate-700 shadow-xl shadow-slate-200/30 backdrop-blur-md w-full dark:border-slate-700/40 dark:bg-slate-900/80 dark:shadow-none dark:text-slate-200 transition-colors"
            >
              <div class="grid gap-2 text-left">
                <h2 class="text-xl font-semibold text-slate-900 dark:text-slate-100">
                  Why Toastflow for Vue and Nuxt
                </h2>
                <p class="text-slate-600 dark:text-slate-300">
                  Toastflow ships sensible defaults for accessibility, queue management, and
                  keyboard shortcuts. It is a typed core with a Vue renderer, Nuxt wrapper,
                  CSS-first theming, and headless hooks so you can render the same store logic with
                  your own UI. The library weighs under 5 kB gzipped, has zero runtime
                  dependencies, and supports Vue 3.5+ with full TypeScript inference.
                </p>
              </div>

              <div class="grid gap-4 md:grid-cols-3">
                <div class="rounded-2xl border border-slate-200/60 bg-slate-50/60 p-4 dark:border-white/5 dark:bg-slate-800/65">
                  <h3 class="text-base font-semibold text-slate-900 dark:text-slate-100">
                    Accessible toast notifications
                  </h3>
                  <p class="text-slate-600 dark:text-slate-300">
                    ARIA live-region toasts with focus management, pause-on-hover, keyboard
                    shortcuts, and a prefers-reduced-motion media query — ready for WCAG out of the
                    box.
                  </p>
                </div>
                <div class="rounded-2xl border border-slate-200/60 bg-slate-50/60 p-4 dark:border-white/5 dark:bg-slate-800/65">
                  <h3 class="text-base font-semibold text-slate-900 dark:text-slate-100">
                    Flexible and customizable UI
                  </h3>
                  <p class="text-slate-600 dark:text-slate-300">
                    Configure placement, alignment, width, action buttons, and HTML support.
                    Override CSS variables, swap animation classes, or use the headless slot to render
                    a fully custom toast card while keeping core behaviors.
                  </p>
                </div>
                <div class="rounded-2xl border border-slate-200/60 bg-slate-50/60 p-4 dark:border-white/5 dark:bg-slate-800/65">
                  <h3 class="text-base font-semibold text-slate-900 dark:text-slate-100">
                    Lightweight and SSR-ready
                  </h3>
                  <p class="text-slate-600 dark:text-slate-300">
                    Minimal bundle with zero runtime dependencies, SSR-safe guards, and CSS-only
                    animations. Works with Vite, Nuxt SSR, and edge runtimes without extra
                    configuration.
                  </p>
                </div>
              </div>
            </section>

            <section
              id="install"
              class="grid gap-4 rounded-3xl border border-slate-200/80 bg-white/95 p-8 text-sm text-slate-700 shadow-xl shadow-slate-200/30 backdrop-blur-md w-full dark:border-slate-700/40 dark:bg-slate-900/80 dark:shadow-none dark:text-slate-200 transition-colors"
            >
              <div class="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 class="text-xl font-semibold text-slate-900 dark:text-slate-100">
                    Install Toastflow for Vue and Nuxt
                  </h2>
                  <p class="text-slate-600 dark:text-slate-300">
                    Works with Vue 3.5+ and Nuxt 3/4. Install the Vue plugin or the Nuxt module and start
                    showing toast notifications in minutes.
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
                    tooltip="Open Vue npm package"
                  >
                    vue npm
                  </Button>
                  <Button
                    variant="outline"
                    href="https://www.npmjs.com/package/nuxt-toastflow"
                    target="_blank"
                    tooltip="Open Nuxt npm package"
                  >
                    nuxt npm
                  </Button>
                </div>
              </div>

              <div class="rounded-2xl border border-slate-200/60 bg-slate-50/60 p-4 dark:border-white/5 dark:bg-slate-800/65">
                <p class="text-[0.9rem] font-semibold text-slate-900 mb-2 dark:text-slate-100">Install</p>
                <pre
                  class="code-block bg-slate-900 text-slate-100 p-3"
                ><code>npm install vue-toastflow<br/>npm install nuxt-toastflow</code></pre>
              </div>

              <div class="grid gap-3">
                <p class="text-[0.9rem] font-semibold text-slate-900 dark:text-slate-100">
                  Common use cases
                </p>
                <ul class="grid gap-2 list-disc list-inside text-slate-600 dark:text-slate-300">
                  <li>Product launches that need reliable, branded toast notifications</li>
                  <li>Dashboards and admin panels that queue multiple events without overlap</li>
                  <li>Nuxt SSR apps that require server-safe notification components</li>
                  <li>Teams looking for a typed, accessible Vue toast library with headless support</li>
                </ul>
              </div>
            </section>

            <section
              class="grid gap-4 rounded-3xl border border-slate-200/80 bg-white/95 p-8 text-sm text-slate-700 shadow-xl shadow-slate-200/30 backdrop-blur-md w-full dark:border-slate-700/40 dark:bg-slate-900/80 dark:shadow-none dark:text-slate-200 transition-colors"
            >
              <div class="grid gap-2">
                <h2 class="text-xl font-semibold text-slate-900 dark:text-slate-100">
                  Frequently asked questions
                </h2>
                <p class="text-slate-600 dark:text-slate-300">
                  Quick answers for developers and teams evaluating Toastflow as their Vue or Nuxt
                  toast notification solution.
                </p>
              </div>
              <div class="grid gap-3">
                <div class="rounded-xl border border-slate-200/60 bg-slate-50/60 p-3 dark:border-white/5 dark:bg-slate-800/65">
                  <h3 class="font-semibold text-slate-900 dark:text-slate-100">Is Toastflow accessible?</h3>
                  <p class="text-slate-600 dark:text-slate-300">
                    Yes. Toasts use alert/status live regions, ARIA labels (even for HTML titles), a
                    built-in pause-on-hover, and a prefers-reduced-motion media query to keep
                    animations gentle.
                  </p>
                </div>
                <div class="rounded-xl border border-slate-200/60 bg-slate-50/60 p-3 dark:border-white/5 dark:bg-slate-800/65">
                  <h3 class="font-semibold text-slate-900 dark:text-slate-100">Does it support SSR?</h3>
                  <p class="text-slate-600 dark:text-slate-300">
                    The core store is isomorphic, the Vue renderer defers DOM access until mounted,
                    and the playground guards window usage, so Nuxt/Vite SSR works out of the box.
                  </p>
                </div>
                <div class="rounded-xl border border-slate-200/60 bg-slate-50/60 p-3 dark:border-white/5 dark:bg-slate-800/65">
                  <h3 class="font-semibold text-slate-900 dark:text-slate-100">Can I use it outside Vue components?</h3>
                  <p class="text-slate-600 dark:text-slate-300">
                    Yes. Install the plugin once, then call <code>toast.*</code> from stores or
                    services. In Nuxt, use <code>nuxt-toastflow</code> and call auto-imported
                    <code>toast</code> (or <code>useToast()</code>). For non-Vue apps, use the
                    headless <code>toastflow-core</code> store and render your own UI.
                  </p>
                </div>
                <div class="rounded-xl border border-slate-200/60 bg-slate-50/60 p-3 dark:border-white/5 dark:bg-slate-800/65">
                  <h3 class="font-semibold text-slate-900 dark:text-slate-100">How do I style it to match my brand?</h3>
                  <p class="text-slate-600 dark:text-slate-300">
                    Override CSS variables or animation class names, pass a <code>theme</code> /
                    <code>animation</code> override, or use the headless slot to ship a fully custom
                    card with the same store logic.
                  </p>
                </div>
                <div class="rounded-xl border border-slate-200/60 bg-slate-50/60 p-3 dark:border-white/5 dark:bg-slate-800/65">
                  <h3 class="font-semibold text-slate-900 dark:text-slate-100">
                    How do I log or react to toast events?
                  </h3>
                  <p class="text-slate-600 dark:text-slate-300">
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
          <span class="font-medium text-slate-800 dark:text-slate-200">Built by</span>
          <Button
            variant="ghost"
            href="https://www.linkedin.com/in/adrianjanocko"
            target="_blank"
            tooltip="Open LinkedIn profile"
            class="p-0! bg-transparent! text-slate-600! hover:text-slate-900! dark:text-slate-300! dark:hover:text-slate-100!"
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
