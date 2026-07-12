<script setup lang="ts">
import type { ContentNavigationItem, PageCollections } from "@nuxt/content";
import * as nuxtUiLocales from "@nuxt/ui/locale";
import { ToastContainer } from "vue-toastflow";

type ToastflowSeoConfig = {
  title?: string;
  titleTemplate?: string;
  description?: string;
  image?: string;
  imageAlt?: string;
  url?: string;
  keywords?: string;
};

function transformNavigation(
  data: ContentNavigationItem[],
  isI18nEnabled: boolean,
  locale?: string,
): ContentNavigationItem[] {
  if (isI18nEnabled && locale) {
    const localeResult =
      data.find((item) => item.path === `/${locale}`)?.children || data;

    return (
      localeResult.find((item) => item.path === `/${locale}/docs`)?.children ||
      localeResult
    );
  }

  return data.find((item) => item.path === "/docs")?.children || data;
}

function normalizeSiteUrl(value: string) {
  return value.replace(/\/+$/, "");
}

function absoluteUrl(value: string, baseUrl: string) {
  if (/^https?:\/\//i.test(value)) {
    return value;
  }

  return new URL(value, `${baseUrl}/`).href;
}

const appConfig = useAppConfig();
const seo = appConfig.seo as ToastflowSeoConfig;
const forcedColorMode = (appConfig.docus as { colorMode?: string } | undefined)
  ?.colorMode;
const faviconHref = computed(
  () => appConfig.header?.logo?.favicon || "/favicon.svg",
);
const site = useSiteConfig();
const route = useRoute();
const { locale, locales, isEnabled, switchLocalePath } = useDocusI18n();
const {
  isEnabled: isAssistantEnabled,
  panelWidth: assistantPanelWidth,
  shouldPushContent,
} = useAssistant();

const nuxtUiLocale = computed(
  () =>
    nuxtUiLocales[locale.value as keyof typeof nuxtUiLocales] ||
    nuxtUiLocales.en,
);
const lang = computed(() => nuxtUiLocale.value.code);
const dir = computed(() => nuxtUiLocale.value.dir);
const collectionName = computed(() =>
  isEnabled.value ? `docs_${locale.value}` : "docs",
);
const isDocsRoute = computed(() => route.meta.layout === "docs");
const siteUrl = computed(() =>
  normalizeSiteUrl(seo.url || site.url || "https://www.toastflow.top"),
);
const canonicalUrl = computed(() =>
  route.path === "/" ? `${siteUrl.value}/` : `${siteUrl.value}${route.path}`,
);
const seoTitle = computed(() => seo.title || site.name || "Toastflow");
const seoDescription = computed(
  () =>
    seo.description ||
    "Accessible toast notifications for Vue, Nuxt, and headless apps.",
);
const seoImage = computed(() =>
  absoluteUrl(seo.image || "/banner.png", siteUrl.value),
);
const seoImageAlt = computed(
  () => seo.imageAlt || "Toastflow toast notification preview",
);
const umamiWebsiteId = String(
  useRuntimeConfig().public.umamiWebsiteId ?? "",
).trim();

useHead({
  script: umamiWebsiteId
    ? [
        {
          defer: true,
          src: "https://cloud.umami.is/script.js",
          "data-website-id": umamiWebsiteId,
        },
      ]
    : [],
  titleTemplate(titleChunk) {
    if (!titleChunk || titleChunk === seoTitle.value) {
      return seoTitle.value;
    }

    return (seo.titleTemplate || "%s | Toastflow").replace("%s", titleChunk);
  },
  meta: [{ name: "viewport", content: "width=device-width, initial-scale=1" }],
  link: computed(() => [
    {
      key: "icon-svg",
      rel: "icon",
      href: faviconHref.value,
      type: faviconHref.value.endsWith(".svg") ? "image/svg+xml" : undefined,
    },
    {
      key: "icon-png",
      rel: "icon",
      type: "image/png",
      href: "/favicon-96x96.png",
      sizes: "96x96",
    },
    { key: "shortcut-icon", rel: "shortcut icon", href: "/favicon.ico" },
    {
      key: "apple-touch-icon",
      rel: "apple-touch-icon",
      sizes: "180x180",
      href: "/apple-touch-icon.png",
    },
    { key: "manifest", rel: "manifest", href: "/site.webmanifest" },
    ...(isDocsRoute.value
      ? []
      : [{ key: "canonical", rel: "canonical", href: canonicalUrl.value }]),
  ]),
  htmlAttrs: {
    lang,
    dir,
  },
});

useSeoMeta({
  title: () => seoTitle.value,
  description: () => seoDescription.value,
  keywords: () => seo.keywords,
  robots: "index,follow",
  author: "Adrian Janocko",
  ogType: "website",
  ogLocale: "en_US",
  ogUrl: () => canonicalUrl.value,
  ogSiteName: () => site.name || seoTitle.value,
  ogTitle: () => seoTitle.value,
  ogDescription: () => seoDescription.value,
  ogImage: () => seoImage.value,
  ogImageAlt: () => seoImageAlt.value,
  ogImageWidth: 1252,
  ogImageHeight: 679,
  twitterCard: "summary_large_image",
  twitterTitle: () => seoTitle.value,
  twitterDescription: () => seoDescription.value,
  twitterImage: () => seoImage.value,
  twitterImageAlt: () => seoImageAlt.value,
  themeColor: "#0ea5e9",
});

if (isEnabled.value) {
  // Typed only when the docus i18n module is active, hence the cast.
  const i18nConfig = useRuntimeConfig().public.i18n as {
    defaultLocale?: string;
  };
  const defaultLocale = i18nConfig.defaultLocale!;

  onMounted(() => {
    const currentLocale = route.path.split("/")[1];
    if (!locales.some((item) => item.code === currentLocale)) {
      return navigateTo(switchLocalePath(defaultLocale) as string);
    }
  });
}

const { data: navigation } = await useAsyncData(
  () => `navigation_${collectionName.value}`,
  () =>
    queryCollectionNavigation(collectionName.value as keyof PageCollections),
  {
    transform: (data: ContentNavigationItem[]) =>
      transformNavigation(data, isEnabled.value, locale.value),
    watch: [locale],
  },
);

const { data: files } = useLazyAsyncData(
  `search_${collectionName.value}`,
  () =>
    queryCollectionSearchSections(
      collectionName.value as keyof PageCollections,
    ),
  {
    server: false,
    watch: [locale],
  },
);

provide("navigation", navigation);

const { subNavigationMode } = useSubNavigation(navigation);
</script>

<template>
  <UApp :locale="nuxtUiLocale">
    <NuxtLoadingIndicator color="var(--ui-primary)" />

    <div
      :class="[
        isDocsRoute && isAssistantEnabled && shouldPushContent
          ? 'transition-[margin-right] duration-200 ease-linear will-change-[margin-right]'
          : '',
        { 'tf-docs-shell': isDocsRoute },
        { 'docus-sub-header': isDocsRoute && subNavigationMode === 'header' },
      ]"
      :style="{
        marginRight:
          isDocsRoute && isAssistantEnabled && shouldPushContent
            ? `${assistantPanelWidth}px`
            : '0',
      }"
    >
      <AppHeader v-if="isDocsRoute && $route.meta.header !== false" />
      <NuxtLayout>
        <NuxtPage />
      </NuxtLayout>
      <AppFooter v-if="isDocsRoute && $route.meta.footer !== false" />
    </div>

    <ClientOnly>
      <LazyUContentSearch
        v-if="isDocsRoute"
        :files="files"
        :navigation="navigation"
        :color-mode="!forcedColorMode"
      />
      <template v-if="isDocsRoute && isAssistantEnabled">
        <LazyAssistantPanel />
        <LazyAssistantFloatingInput />
      </template>
    </ClientOnly>

    <ToastContainer v-if="isDocsRoute" />
  </UApp>
</template>

<style>
html {
  scrollbar-gutter: stable;
}

@media (min-width: 1024px) {
  .docus-sub-header {
    /* 64px base header + 48px sub-navigation bar */
    --ui-header-height: 112px;
  }

  .tf-docs-shell main > div > [data-slot="root"],
  .tf-docs-shell
    main
    > div
    > [data-slot="root"]
    > [data-slot="center"]
    > [data-slot="root"] {
    display: grid;
    grid-template-columns: repeat(10, minmax(0, 1fr));
    gap: 2.5rem;
    align-items: start;
  }

  .tf-docs-shell main > div > [data-slot="root"] > [data-slot="left"] {
    grid-column: span 2 / span 2;
  }

  .tf-docs-shell main > div > [data-slot="root"] > [data-slot="center"],
  .tf-docs-shell
    main
    > div
    > [data-slot="root"]
    > [data-slot="center"]
    > [data-slot="root"]
    > [data-slot="center"] {
    grid-column: span 8 / span 8;
    min-width: 0;
  }

  .tf-docs-shell
    main
    > div
    > [data-slot="root"]
    > [data-slot="center"]
    > [data-slot="root"]
    > [data-slot="right"] {
    grid-column: span 2 / span 2;
  }
}
</style>
