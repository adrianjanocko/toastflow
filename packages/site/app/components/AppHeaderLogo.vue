<script setup lang="ts">
const appConfig = useAppConfig();
const { hasLogo, headerLightUrl, headerDarkUrl, contextMenuItems } =
  useLogoAssets();

const logoFailed = ref(false);
const logoAlt = computed(
  () => appConfig.header?.logo?.alt || appConfig.header?.title || "Toastflow",
);
const logoClass = computed(() => [
  "h-6 w-auto shrink-0",
  appConfig.header?.logo?.class,
]);
const shouldShowLogo = computed(() => hasLogo.value && !logoFailed.value);

function handleLogoError() {
  logoFailed.value = true;
}
</script>

<template>
  <UContextMenu v-if="shouldShowLogo" :items="contextMenuItems">
    <span class="inline-flex h-6 shrink-0 items-center">
      <img
        :src="headerLightUrl"
        :alt="logoAlt"
        :class="[logoClass, 'dark:hidden']"
        decoding="async"
        @error="handleLogoError"
      />
      <img
        :src="headerDarkUrl"
        :alt="logoAlt"
        :class="[logoClass, 'hidden dark:block']"
        decoding="async"
        @error="handleLogoError"
      />
    </span>
  </UContextMenu>
  <span v-else>
    {{ appConfig.header?.title || "Toastflow" }}
  </span>
</template>
