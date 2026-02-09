<script setup lang="ts">
import { ref } from 'vue';
import { Settings } from 'lucide-vue-next';
import type {
  PauseStrategy,
  ToastButtonsAlignment,
  ToastButtonsLayout,
  ToastOrder,
} from 'toastflow-core';

import Button from '../Button.vue';
import Modal from '../Modal.vue';
import InputField from '../InputField.vue';
import type { PlaygroundButton, PlaygroundButtonMode } from '@/types/playgroundTypes.ts';
import Card from '@/components/card/Card.vue';
import SectionHeading from '@/components/SectionHeading.vue';
import CardLayout from '@/components/card/CardLayout.vue';

defineProps<{
  preventDuplicates: boolean;
  progressBar: boolean;
  pauseOnHover: boolean;
  closeButton: boolean;
  closeOnClick: boolean;
  supportHtml: boolean;
  showCreatedAt: boolean;
  queue: boolean;
  enableButtons: boolean;
  buttonsAlignment: ToastButtonsAlignment;
  buttonsLayout: ToastButtonsLayout;
  buttonsGap: string;
  buttonsContentGap: string;
  playgroundButtons: PlaygroundButton[];
  order: ToastOrder;
  pauseStrategy: PauseStrategy;
  overflowScroll: boolean;
}>();

const emit = defineEmits<{
  'update:preventDuplicates': [boolean];
  'update:progressBar': [boolean];
  'update:pauseOnHover': [boolean];
  'update:closeButton': [boolean];
  'update:closeOnClick': [boolean];
  'update:supportHtml': [boolean];
  'update:showCreatedAt': [boolean];
  'update:queue': [boolean];
  'update:enableButtons': [boolean];
  'update:buttonsAlignment': [ToastButtonsAlignment];
  'update:buttonsLayout': [ToastButtonsLayout];
  'update:buttonsGap': [string];
  'update:buttonsContentGap': [string];
  'update:overflowScroll': [boolean];
  'update:order': [ToastOrder];
  'update:pauseStrategy': [PauseStrategy];
  'add-button': [];
  'remove-button': [string];
  'update-button': [string, Partial<PlaygroundButton>];
}>();

const orderOptions: { value: ToastOrder; label: string }[] = [
  { value: 'newest', label: 'Newest' },
  { value: 'oldest', label: 'Oldest' },
];

const pauseStrategyOptions: { value: PauseStrategy; label: string }[] = [
  { value: 'resume', label: 'Resume' },
  { value: 'reset', label: 'Reset' },
];

const alignmentOptions: { value: ToastButtonsAlignment; label: string }[] = [
  { value: 'top-left', label: 'Top left' },
  { value: 'top-right', label: 'Top right' },
  { value: 'center-left', label: 'Center left' },
  { value: 'center-right', label: 'Center right' },
  { value: 'bottom-left', label: 'Bottom left' },
  { value: 'bottom-right', label: 'Bottom right' },
];

const layoutOptions: { value: ToastButtonsLayout; label: string }[] = [
  { value: 'row', label: 'Row' },
  { value: 'column', label: 'Column' },
];

const buttonModeOptions: { value: PlaygroundButtonMode; label: string }[] = [
  { value: 'label', label: 'Text' },
  { value: 'html', label: 'HTML' },
];

const isButtonsModalOpen = ref(false);

function emitButtonUpdate(id: string, updates: Partial<PlaygroundButton>) {
  emit('update-button', id, updates);
}
</script>

<template>
  <Card>
    <div>
      <SectionHeading text="Behavior" />
      <CardLayout>
        <Button
          variant="toggle"
          :model-value="preventDuplicates"
          tooltip="No duplicates"
          @update:model-value="emit('update:preventDuplicates', $event)"
        >
          <span>No duplicates</span>
        </Button>

        <Button
          variant="toggle"
          :model-value="progressBar"
          tooltip="Progress bar"
          @update:model-value="emit('update:progressBar', $event)"
        >
          <span>Progress bar</span>
        </Button>

        <Button
          variant="toggle"
          :model-value="pauseOnHover"
          tooltip="Pause on hover"
          @update:model-value="emit('update:pauseOnHover', $event)"
        >
          <span>Pause on hover</span>
        </Button>

        <Button
          variant="toggle"
          :model-value="closeButton"
          tooltip="Close button"
          @update:model-value="emit('update:closeButton', $event)"
        >
          <span>Close button</span>
        </Button>

        <Button
          variant="toggle"
          :model-value="closeOnClick"
          tooltip="Close on click"
          @update:model-value="emit('update:closeOnClick', $event)"
        >
          <span>Close on click</span>
        </Button>

        <Button
          variant="toggle"
          :model-value="supportHtml"
          tooltip="Support HTML"
          @update:model-value="emit('update:supportHtml', $event)"
        >
          <span>Support HTML</span>
        </Button>

        <Button
          variant="toggle"
          :model-value="showCreatedAt"
          tooltip="Created at"
          @update:model-value="emit('update:showCreatedAt', $event)"
        >
          <span>Created at</span>
        </Button>

        <div
          :class="
            enableButtons
              ? 'grid w-full grid-cols-[1fr_auto] items-center gap-2'
              : 'flex w-full items-center gap-2'
          "
        >
          <Button
            variant="toggle"
            :model-value="enableButtons"
            is-new
            tooltip="Enable toast action buttons"
            @update:model-value="emit('update:enableButtons', $event)"
          >
            Buttons
          </Button>
          <Button
            v-if="enableButtons"
            variant="ghost"
            icon-only
            tooltip="Configure buttons"
            @click="isButtonsModalOpen = true"
          >
            <Settings class="size-4" />
          </Button>
        </div>

        <Button
          variant="toggle"
          :model-value="overflowScroll"
          @update:model-value="emit('update:overflowScroll', $event)"
          is-new
          tooltip="Overflow scroll"
        >
          Overflow scroll
        </Button>

        <Button
          variant="toggle"
          :model-value="queue"
          @update:model-value="emit('update:queue', $event)"
          is-new
          tooltip="Queue over maxVisible"
        >
          Queue
        </Button>
      </CardLayout>
    </div>

    <div>
      <SectionHeading text="Order &amp; Pause" />
      <CardLayout wrap>
        <Button
          v-for="o in orderOptions"
          :key="o.value"
          variant="pill"
          :model-value="order === o.value"
          @click="emit('update:order', o.value)"
          :tooltip="o.label"
        >
          {{ o.label }}
        </Button>

        <Button
          v-for="ps in pauseStrategyOptions"
          :key="ps.value"
          variant="pill"
          :model-value="pauseStrategy === ps.value"
          @click="emit('update:pauseStrategy', ps.value)"
          :tooltip="`Pause: ${ps.label}`"
        >
          Pause: {{ ps.label }}
        </Button>
      </CardLayout>
    </div>

    <Modal v-if="enableButtons" v-model="isButtonsModalOpen" title="Buttons configuration">
      <CardLayout class="gap-3">
        <InputField
          label="Buttons alignment"
          :model-value="buttonsAlignment"
          :options="alignmentOptions"
          @update:model-value="emit('update:buttonsAlignment', $event as ToastButtonsAlignment)"
        />

        <InputField
          label="Buttons layout"
          :model-value="buttonsLayout"
          :options="layoutOptions"
          @update:model-value="emit('update:buttonsLayout', $event as ToastButtonsLayout)"
        />

        <div class="grid grid-cols-2 gap-2">
          <InputField
            label="Buttons gap"
            :model-value="buttonsGap"
            placeholder="e.g. 6px…"
            @update:model-value="emit('update:buttonsGap', String($event))"
          />
          <InputField
            label="Content gap"
            :model-value="buttonsContentGap"
            placeholder="e.g. 10px…"
            @update:model-value="emit('update:buttonsContentGap', String($event))"
          />
        </div>

        <CardLayout>
          <div class="flex items-center justify-between">
            <SectionHeading text="Buttons list" class="!mb-0" />
            <Button variant="pill" tooltip="Add button" @click="emit('add-button')">Add</Button>
          </div>

          <CardLayout>
            <div
              v-for="(button, index) in playgroundButtons"
              :key="button.id"
              class="space-y-3 rounded-2xl border border-slate-200 bg-white p-3"
            >
              <div
                class="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-2"
              >
                <div class="flex items-center gap-2">
                  <span
                    class="rounded-lg bg-slate-100 px-2 py-1 text-[0.7rem] font-semibold text-slate-700"
                  >
                    Button {{ index + 1 }}
                  </span>
                  <span class="rounded-lg bg-slate-50 px-2 py-1 text-[0.7rem] text-slate-600">
                    {{ button.mode === 'html' ? 'HTML' : 'Text' }}
                  </span>
                </div>

                <div class="flex flex-wrap items-center gap-2">
                  <Button
                    variant="toggle"
                    :model-value="button.dismissOnClick"
                    tooltip="Toggle dismiss on click"
                    @update:model-value="emitButtonUpdate(button.id, { dismissOnClick: $event })"
                    class="!px-2 !py-0.5"
                  >
                    Dismiss on click
                  </Button>

                  <Button
                    variant="danger"
                    tooltip="Remove button"
                    @click="emit('remove-button', button.id)"
                    class="!px-2 !py-0.5"
                  >
                    Remove
                  </Button>
                </div>
              </div>

              <div class="grid gap-2 sm:grid-cols-3">
                <InputField
                  label="Content type"
                  :model-value="button.mode"
                  :options="buttonModeOptions"
                  class="sm:col-span-1"
                  @update:model-value="
                    emitButtonUpdate(button.id, { mode: $event as PlaygroundButtonMode })
                  "
                />

                <InputField
                  class="min-w-0 flex-1 sm:col-span-2"
                  :label="button.mode === 'html' ? 'HTML content' : 'Button label'"
                  :model-value="button.value"
                  :placeholder="
                    button.mode === 'html' ? '<strong>Details</strong>…' : 'Button label…'
                  "
                  @update:model-value="emitButtonUpdate(button.id, { value: String($event) })"
                />
              </div>

              <div class="grid grid-cols-1 gap-2 sm:grid-cols-2">
                <InputField
                  label="className (optional)"
                  :model-value="button.className"
                  placeholder="e.g. btn-primary…"
                  @update:model-value="emitButtonUpdate(button.id, { className: String($event) })"
                />
                <InputField
                  label="ariaLabel (optional)"
                  :model-value="button.ariaLabel"
                  placeholder="e.g. Open details…"
                  @update:model-value="emitButtonUpdate(button.id, { ariaLabel: String($event) })"
                />
              </div>
            </div>
          </CardLayout>
        </CardLayout>
      </CardLayout>
    </Modal>
  </Card>
</template>
