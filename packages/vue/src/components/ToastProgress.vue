<script setup lang="ts">
import type { ToastProgressAlignment, ToastType } from "toastflow-core";

const props = withDefaults(
  defineProps<{
    type: ToastType;
    progressAlignment?: ToastProgressAlignment;
  }>(),
  {
    progressAlignment: "right-to-left",
  },
);
</script>

<template>
  <div class="tf-toast-progress" :data-align="props.progressAlignment">
    <div
      class="tf-toast-progress-bar"
      :class="`tf-toast-progress-bar--${props.type}`"
    />
  </div>
</template>

<style scoped>
.tf-toast-progress {
  height: var(--tf-toast-progress-height);
  width: 100%;
  border-radius: 0 0 var(--tf-toast-progress-border-radius)
    var(--tf-toast-progress-border-radius);
  background: var(--tf-toast-progress-bg);
}

.tf-toast-progress-bar {
  height: 100%;
  width: 100%;
  background: var(--tf-toast-progress-bar-bg);
  transform-origin: left;
  animation-name: tf-toast-progress-rtl;
  animation-duration: var(--tf-toast-progress-duration, 5000ms);
  animation-timing-function: linear;
  animation-fill-mode: forwards;
  will-change: transform;
}

.tf-toast-progress[data-align="left-to-right"] .tf-toast-progress-bar {
  transform-origin: right;
  animation-name: tf-toast-progress-ltr;
}

@keyframes tf-toast-progress-rtl {
  from {
    transform: scaleX(1);
  }
  to {
    transform: scaleX(0);
  }
}

@keyframes tf-toast-progress-ltr {
  from {
    transform: scaleX(0);
  }
  to {
    transform: scaleX(1);
  }
}
</style>
