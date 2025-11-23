<script setup lang="ts">
import type {ToastType} from "toastflow-core";

const {type} = defineProps<{
  type: ToastType;
}>();
</script>

<template>
  <div class="tf-toast-progress">
    <div
        class="tf-toast-progress-bar"
        :class="`tf-toast-progress-bar--${type}`"
    />
  </div>
</template>

<style scoped>
.tf-toast-progress {
  height: var(--tf-toast-progress-height);
  width: 100%;
  border-radius: 0 0 var(--tf-toast-radius) var(--tf-toast-radius);
  background: var(--tf-toast-progress-bg);
}

.tf-toast-progress-bar {
  height: 100%;
  animation-name: tf-toast-progress;
  animation-duration: var(--tf-toast-progress-duration, 5000ms);
  animation-timing-function: linear;
  animation-fill-mode: forwards;
}

.tf-toast-progress-bar--default {
  background: var(--tf-toast-accent-default);
}

.tf-toast-progress-bar--success {
  background: var(--tf-toast-accent-success);
}

.tf-toast-progress-bar--error {
  background: var(--tf-toast-accent-error);
}

.tf-toast-progress-bar--warning {
  background: var(--tf-toast-accent-warning);
}

.tf-toast-progress-bar--info {
  background: var(--tf-toast-accent-info);
}

@keyframes tf-toast-progress {
  from {
    width: 100%;
  }
  to {
    width: 0;
  }
}
</style>
