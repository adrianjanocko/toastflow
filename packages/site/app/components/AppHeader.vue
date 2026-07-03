<script setup lang="ts">
const appConfig = useAppConfig();
const { forced: forcedColorMode } = useDocusColorMode();
const { isEnabled: isAssistantEnabled } = useAssistant();
const { isEnabled, locales } = useDocusI18n();
const { subNavigationMode } = useSubNavigation();
const colorMode = useColorMode();

const links = computed(() =>
  appConfig.github && appConfig.github.url
    ? [
        {
          icon: "i-simple-icons-github",
          to: appConfig.github.url,
          target: "_blank",
          "aria-label": "GitHub",
        },
      ]
    : [],
);

const isDark = computed(() => colorMode.value === "dark");
const colorModeIcon = computed(() =>
  isDark.value ? "i-lucide-sun" : "i-lucide-moon",
);
const colorModeLabel = computed(() =>
  isDark.value ? "Switch to light mode" : "Switch to dark mode",
);

function toggleColorMode() {
  colorMode.preference = isDark.value ? "light" : "dark";
}
</script>

<template>
  <UHeader
    :ui="{ center: 'flex-1' }"
    :class="{ 'flex flex-col': subNavigationMode === 'header' }"
  >
    <AppHeaderCenter />

    <template #left>
      <AppHeaderLeft />
    </template>

    <template #right>
      <AppHeaderCTA />

      <template v-if="isAssistantEnabled">
        <AssistantChat />
      </template>

      <template v-if="isEnabled && locales.length > 1">
        <ClientOnly>
          <LanguageSelect />

          <template #fallback>
            <div
              class="h-8 w-8 animate-pulse rounded-md bg-neutral-200 dark:bg-neutral-800"
            />
          </template>
        </ClientOnly>

        <USeparator orientation="vertical" class="h-8" />
      </template>

      <UContentSearchButton class="lg:hidden" />

      <UButton
        v-if="!forcedColorMode"
        :icon="colorModeIcon"
        color="neutral"
        variant="ghost"
        :aria-label="colorModeLabel"
        @click="toggleColorMode"
      />

      <template v-if="links?.length">
        <UButton
          v-for="(link, index) of links"
          :key="index"
          v-bind="{ color: 'neutral', variant: 'ghost', ...link }"
        />
      </template>
    </template>

    <template #toggle="{ open, toggle }">
      <IconMenuToggle :open="open" class="lg:hidden" @click="toggle" />
    </template>

    <template #body>
      <AppHeaderBody />
    </template>

    <template v-if="subNavigationMode === 'header'" #bottom>
      <AppHeaderBottom />
    </template>
  </UHeader>
</template>
