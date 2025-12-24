<script setup lang="ts">
import { toast, ToastContainer } from 'vue-toastflow';
import Playground from '@/views/Playground.vue';
import { onBeforeUnmount, onMounted } from 'vue';
// @ts-ignore
import { useSnowfall } from 'vue-snowfall';

const SEASONAL_MODE = (import.meta.env.VITE_SEASONAL_MODE ?? 'holiday').toLowerCase();
const isHolidayMode = SEASONAL_MODE === 'holiday';

if (isHolidayMode) {
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
</script>

<template>
  <div
    class="relative min-h-screen bg-gradient-to-b from-sky-100 to-sky-200 text-slate-900 overflow-hidden"
  >
    <div
      v-if="isHolidayMode"
      id="snow-container"
      class="pointer-events-none fixed inset-0 z-0"
      aria-hidden="true"
    />

    <div class="relative z-10 mx-auto flex min-h-screen max-w-6xl flex-col gap-8 px-4 py-8">
      <header class="flex items-center justify-between">
        <div class="flex items-center gap-2">
          <h1 class="text-lg font-semibold tracking-tight text-slate-900">Toastflow</h1>
          <span
            class="rounded-full border border-sky-100 bg-sky-50 px-3 py-0.5 text-[0.65rem] font-bold uppercase tracking-[0.18em] text-sky-600"
          >
            Playground
          </span>
        </div>

        <a
          href="https://github.com/adrianjanocko/toastflow"
          target="_blank"
          class="text-xs text-slate-500 hover:text-slate-900"
          >GitHub</a
        >
      </header>

      <main class="flex flex-1 gap-6 flex-col items-center justify-center">
        <section class="max-w-2xl text-center text-sm text-slate-600 grid gap-2">
          <h2 class="text-2xl font-semibold text-slate-900">Vue toast notifications playground</h2>
          <p>
            Explore Toastflow, a Vue toast library for fast, accessible notifications. Adjust
            placement, timing, and behaviors to see how Vue toasts feel before shipping them to
            production.
          </p>
        </section>
        <Playground />
      </main>
    </div>

    <div class="relative z-10">
      <ToastContainer />
    </div>
  </div>
</template>

<style>
.tf-toast-accent--merry-christmas {
  --tf-toast-bg: #c33232;
  --tf-toast-border-color: #f7ede2;
  --tf-toast-color: #fff7f2;
  --tf-toast-description-color: #fdeae2;
  --tf-toast-progress-bg: color-mix(in srgb, #f7ede2 20%, transparent);

  --tf-toast-accent-info: white;
  --tf-toast-icon-info: #fff;
}

.tf-toast-accent--happy-new-year {
  --tf-toast-bg: #1c2133;
  --tf-toast-border-color: #f7ede2;
  --tf-toast-color: #fff8f3;
  --tf-toast-description-color: #f2e6d9;
  --tf-toast-progress-bg: color-mix(in srgb, #f7ede2 22%, transparent);

  --tf-toast-accent-success: #f1c46b;
  --tf-toast-icon-success: #f1c46b;
}
</style>
