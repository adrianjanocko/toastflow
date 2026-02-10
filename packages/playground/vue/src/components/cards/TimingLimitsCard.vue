<script setup lang="ts">
import InputField from '../InputField.vue';
import NumericSelectControl from '../NumericSelectControl.vue';
import SectionHeading from '@/components/SectionHeading.vue';
import Card from '@/components/card/Card.vue';
import CardLayout from '@/components/card/CardLayout.vue';

defineProps<{
  duration: number;
  maxVisible: number;
  offset: string;
  gap: string;
  width: string;
  zIndex: number;
}>();

const emit = defineEmits<{
  'update:duration': [number];
  'update:maxVisible': [number];
  'update:offset': [string];
  'update:gap': [string];
  'update:width': [string];
  'update:zIndex': [number];
}>();

const durationOptions = [1000, 2000, 3000, 5000, 8000, 10000];
const maxVisibleOptions = [0, 1, 2, 3, 5, 10];
</script>

<template>
  <Card>
    <div>
      <SectionHeading text="Timing &amp; limits" />
      <CardLayout>
        <NumericSelectControl
          label="Duration (ms)"
          :value="duration"
          :options="durationOptions"
          :step="250"
          :min="0"
          @update:value="emit('update:duration', $event)"
        />

        <NumericSelectControl
          label="Max visible"
          :value="maxVisible"
          :options="maxVisibleOptions"
          :step="1"
          :min="0"
          @update:value="emit('update:maxVisible', $event)"
        />
      </CardLayout>
    </div>

    <div>
      <SectionHeading text="Layout (global)" />
      <CardLayout grid>
        <InputField
          label="Offset"
          :model-value="offset"
          placeholder="e.g. 16px…"
          @update:model-value="emit('update:offset', $event as string)"
        />

        <InputField
          label="Gap"
          :model-value="gap"
          placeholder="e.g. 8px…"
          @update:model-value="emit('update:gap', $event as string)"
        />

        <InputField
          label="Width"
          :model-value="width"
          placeholder="e.g. 350px…"
          @update:model-value="emit('update:width', $event as string)"
        />

        <InputField
          label="z-index"
          :model-value="zIndex"
          type="number"
          @update:model-value="emit('update:zIndex', Number($event))"
        />
      </CardLayout>
    </div>
  </Card>
</template>
