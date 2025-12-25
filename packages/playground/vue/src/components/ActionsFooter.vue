<script setup lang="ts">
import Button from './Button.vue';

const emit = defineEmits<{
  push: [];
  'push-burst': [];
  'update-last': [];
  'dismiss-all': [];
  reset: [];
}>();
</script>

<template>
  <div
    class="p-5 flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 text-xs md:text-sm"
  >
    <div class="flex flex-wrap gap-2">
      <Button variant="primary" tooltip="Push a toast" @click="emit('push')"> Push toast</Button>

      <Button variant="primary-muted" tooltip="Push five toasts" @click="emit('push-burst')">
        Push 5
      </Button>

      <Button variant="outline" tooltip="Update last toast" @click="emit('update-last')">
        Update last
      </Button>
    </div>

    <div class="flex flex-wrap gap-2">
      <Button variant="danger" tooltip="Dismiss all toasts" @click="emit('dismiss-all')">
        Dismiss all
      </Button>

      <Button variant="outline" tooltip="Reset playground config" @click="emit('reset')">
        Reset config
      </Button>
    </div>
  </div>
</template>
