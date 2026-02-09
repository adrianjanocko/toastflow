<script setup lang="ts">
import type { ToastButton } from "toastflow-core";

const props = defineProps<{
  buttons: ToastButton[];
  classes: Array<string | undefined>;
  onButtonClick: (button: ToastButton, event: MouseEvent) => void;
}>();

function handleClick(button: ToastButton, event: MouseEvent) {
  props.onButtonClick(button, event);
}
</script>

<template>
  <div :class="classes">
    <button
      v-for="(button, index) in buttons"
      :key="button.id ?? index"
      type="button"
      class="tf-toast-button"
      :class="button.className"
      :aria-label="button.ariaLabel || undefined"
      @click.stop="handleClick(button, $event)"
      @pointerdown.stop
      @pointerup.stop
      @pointercancel.stop
    >
      <span v-if="button.label">{{ button.label }}</span>
      <span v-else-if="button.html" v-html="button.html"></span>
    </button>
  </div>
</template>
