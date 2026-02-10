<script setup lang="ts">
import { computed } from 'vue';
import NewBadge from './NewBadge.vue';

const props = withDefaults(
  defineProps<{
    modelValue?: boolean;
    variant?:
      | 'primary'
      | 'primary-muted'
      | 'outline'
      | 'danger'
      | 'subtle'
      | 'toggle'
      | 'pill'
      | 'ghost';
    isNew?: boolean;
    tooltip?: string;
    iconOnly?: boolean;
    ariaLabel?: string;
    href?: string;
    target?: string;
    rel?: string;
  }>(),
  {
    variant: 'outline',
    isNew: false,
    iconOnly: false,
  },
);

const emit = defineEmits<{
  'update:modelValue': [boolean];
  click: [MouseEvent];
}>();

const isActive = computed(function () {
  return Boolean(props.modelValue);
});

const sizeClass = computed(function () {
  if (props.iconOnly) {
    return 'size-8 justify-center p-0 text-[0.75rem]';
  }
  return 'px-3 py-1 text-[0.8rem]';
});

const shapeClass = computed(function () {
  if (props.variant === 'pill') {
    return 'rounded-full';
  }
  return 'rounded-xl';
});

const variantClass = computed(function () {
  const activeBase = 'border border-slate-900 bg-slate-900 text-white';
  const inactiveBase =
    'border border-slate-200 bg-slate-50 text-slate-600 hover:border-slate-300 hover:bg-slate-100';

  switch (props.variant) {
    case 'primary':
      return 'bg-slate-900 text-white transition hover:bg-slate-800';
    case 'primary-muted':
      return 'bg-slate-900/80 text-white transition hover:bg-slate-900';
    case 'outline':
      return 'border border-slate-300 bg-white text-slate-700 transition hover:border-slate-400 hover:bg-slate-50';
    case 'danger':
      return 'border border-rose-200 bg-rose-50 text-rose-700 transition hover:border-rose-300 hover:bg-rose-100';
    case 'subtle':
      return 'border border-slate-200 bg-slate-50 text-slate-600 transition hover:border-slate-300 hover:bg-slate-100';
    case 'ghost':
      return 'text-slate-700 transition hover:bg-slate-100';
    case 'pill':
    case 'toggle':
      return isActive.value ? activeBase : inactiveBase;
    default:
      return inactiveBase;
  }
});

const baseClass = computed(function () {
  return 'inline-flex items-center gap-2 font-medium transition-colors duration-200 cursor-pointer shrink-0';
});

const newBadgeClass = computed(function () {
  if (props.isNew) {
    return 'flex w-full items-center justify-between';
  }
  return '';
});

function onClick(event: MouseEvent) {
  if (!props.href && props.modelValue !== undefined) {
    emit('update:modelValue', !props.modelValue);
  }
  emit('click', event);
}

const ariaLabelAttr = computed(function () {
  if (props.ariaLabel) {
    return props.ariaLabel;
  }
  if (props.iconOnly && props.tooltip) {
    return props.tooltip;
  }
  return undefined;
});

const relAttr = computed(function () {
  if (props.rel) {
    return props.rel;
  }
  if (props.target === '_blank') {
    return 'noreferrer noopener';
  }
  return undefined;
});
</script>

<template>
  <component
    :is="props.href ? 'a' : 'button'"
    :type="props.href ? undefined : 'button'"
    :href="props.href"
    :target="props.target"
    :rel="relAttr"
    class="btn"
    :class="[baseClass, sizeClass, shapeClass, variantClass, newBadgeClass]"
    :title="props.tooltip || undefined"
    :aria-label="ariaLabelAttr"
    @click="onClick"
  >
    <slot />
    <NewBadge v-if="isNew" />
  </component>
</template>
