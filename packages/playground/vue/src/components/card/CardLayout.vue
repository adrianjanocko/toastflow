<script setup lang="ts">
withDefaults(
  defineProps<{
    wrap?: boolean;
    grid?: boolean;
  }>(),
  {
    wrap: false,
    grid: false,
  },
);
</script>

<template>
  <div
    :class="[
      'flex gap-2',
      wrap ? 'flex-wrap' : 'flex-col',
      grid && 'grid sm:grid-cols-2 lg:grid-cols-1',
    ]"
  >
    <slot />
  </div>
</template>
