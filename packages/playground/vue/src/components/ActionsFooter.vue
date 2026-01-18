<script setup lang="ts">
import { toRefs } from 'vue';
import Button from './Button.vue';

const props = withDefaults(
  defineProps<{
    queueEnabled?: boolean;
    queuePaused?: boolean;
  }>(),
  { queueEnabled: false, queuePaused: false },
);

const { queueEnabled, queuePaused } = toRefs(props);

const emit = defineEmits<{
  push: [];
  'push-burst': [];
  'update-last': [];
  'dismiss-all': [];
  'stop-queue': [];
  'resume-queue': [];
  reset: [];
}>();

function toggleQueue() {
  if (queuePaused.value) {
    emit('resume-queue');
  } else {
    emit('stop-queue');
  }
}
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
      <Button
        v-if="queueEnabled"
        :variant="queuePaused ? 'primary-muted' : 'outline'"
        :tooltip="
          queuePaused ? 'Resume processing queued toasts' : 'Temporarily pause queue processing'
        "
        @click="toggleQueue"
      >
        {{ queuePaused ? 'Resume queue' : 'Stop queue' }}
      </Button>

      <Button variant="danger" tooltip="Dismiss all toasts" @click="emit('dismiss-all')">
        Dismiss all
      </Button>

      <Button variant="outline" tooltip="Reset playground config" @click="emit('reset')">
        Reset config
      </Button>
    </div>
  </div>
</template>
