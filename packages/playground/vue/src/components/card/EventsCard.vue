<script setup lang="ts">
import { Terminal } from 'lucide-vue-next';
import Button from '../Button.vue';
import InputField from '../InputField.vue';
import Card from '@/components/card/Card.vue';
import SectionHeading from '@/components/SectionHeading.vue';
import CardLayout from '@/components/card/CardLayout.vue';

defineProps<{
  useOnMount: boolean;
  useOnUnmount: boolean;
  useOnClick: boolean;
  useOnClose: boolean;
  title: string;
  description: string;
  fallbackTitle: boolean;
  fallbackDescription: boolean;
}>();

const emit = defineEmits<{
  'update:useOnMount': [boolean];
  'update:useOnUnmount': [boolean];
  'update:useOnClick': [boolean];
  'update:useOnClose': [boolean];
  'update:title': [string];
  'update:description': [string];
  'update:fallbackTitle': [boolean];
  'update:fallbackDescription': [boolean];
  'open-log': [];
}>();
</script>

<template>
  <Card>
    <div>
      <div class="flex items-center justify-between gap-2">
        <SectionHeading text="Events (console.log)">
          <Button variant="ghost" icon-only tooltip="Open log" @click="emit('open-log')">
            <Terminal class="size-4" />
          </Button>
        </SectionHeading>
      </div>
      <CardLayout wrap>
        <Button
          variant="pill"
          :model-value="useOnMount"
          tooltip="Enable onMount handler"
          @update:model-value="emit('update:useOnMount', $event)"
        >
          onMount
        </Button>

        <Button
          variant="pill"
          :model-value="useOnUnmount"
          tooltip="Enable onUnmount handler"
          @update:model-value="emit('update:useOnUnmount', $event)"
        >
          onUnmount
        </Button>

        <Button
          variant="pill"
          :model-value="useOnClick"
          tooltip="Enable onClick handler"
          @update:model-value="emit('update:useOnClick', $event)"
        >
          onClick
        </Button>

        <Button
          variant="pill"
          :model-value="useOnClose"
          tooltip="Enable onClose handler"
          @update:model-value="emit('update:useOnClose', $event)"
        >
          onClose
        </Button>
      </CardLayout>
    </div>

    <div>
      <SectionHeading text="Content" />
      <CardLayout grid>
        <InputField
          label="Title"
          :model-value="title"
          placeholder="e.g. Saved…"
          @update:model-value="emit('update:title', $event as string)"
        />

        <InputField
          label="Description"
          :model-value="description"
          placeholder="e.g. Your changes have been stored…"
          @update:model-value="emit('update:description', $event as string)"
        />
      </CardLayout>

      <CardLayout wrap class="py-2">
        <Button
          variant="pill"
          :model-value="fallbackTitle"
          tooltip="Auto-fill default title when empty"
          @update:model-value="emit('update:fallbackTitle', $event)"
        >
          Fallback title
        </Button>

        <Button
          variant="pill"
          :model-value="fallbackDescription"
          tooltip="Auto-fill default description when empty"
          @update:model-value="emit('update:fallbackDescription', $event)"
        >
          Fallback description
        </Button>
      </CardLayout>
      <p class="text-[0.65rem] text-slate-400">
        At least one of title/description is required. Leave one empty if you want, but if both are
        blank we will auto-fill defaults (logging a warning).
      </p>
    </div>
  </Card>
</template>
