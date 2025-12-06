<script setup lang="ts">
import { ToastContainer } from 'vue-toastflow';
import Playground from '@/components/Playground.vue';
</script>

<template>
  <div class="min-h-screen bg-gradient-to-b from-sky-100 to-sky-200 text-slate-900">
    <div class="mx-auto flex min-h-screen max-w-6xl flex-col px-4 py-8">
      <header class="mb-8 flex items-center justify-between">
        <div class="flex items-baseline gap-2">
          <h1 class="text-lg font-semibold tracking-tight text-slate-900">Toastflow</h1>
          <span
            class="rounded-full border border-sky-100 bg-sky-50 px-3 py-0.5 text-[0.65rem] font-medium uppercase tracking-[0.18em] text-sky-600"
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

      <main class="flex flex-1 flex-col items-center justify-center">
        <Playground />
      </main>
    </div>

    <!-- toast renderer -->
    <ToastContainer />
  </div>
</template>
