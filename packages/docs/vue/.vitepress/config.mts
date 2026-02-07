import { defineConfig } from "vitepress";

const DOCS_HOSTNAME = "https://docs.toastflow.top";

function resolveCanonicalUrl(page: string): string {
  const normalizedPage = page.replace(/\\/g, "/");
  const pathname =
    normalizedPage === "index.md"
      ? "/"
      : "/" + normalizedPage.replace(/\.md$/, "");

  return new URL(pathname, DOCS_HOSTNAME).toString();
}

export default defineConfig({
  title: "Toastflow",
  description:
    "Framework-agnostic toast engine with a Vue 3 renderer. Typed core, smooth stack animations, CSS-first theming, and full control over layout and behavior.",
  cleanUrls: true,
  lastUpdated: true,
  sitemap: {
    hostname: DOCS_HOSTNAME,
  },
  head: [
    ["meta", { name: "robots", content: "index,follow" }],
    ["meta", { property: "og:site_name", content: "Toastflow Docs" }],
    ["meta", { property: "og:type", content: "website" }],
    ["meta", { name: "twitter:card", content: "summary_large_image" }],
  ],
  transformHead: (ctx) => {
    const canonicalUrl = resolveCanonicalUrl(ctx.page);

    return [
      ["link", { rel: "canonical", href: canonicalUrl }],
      ["meta", { property: "og:url", content: canonicalUrl }],
      ["meta", { property: "og:title", content: ctx.title }],
      ["meta", { property: "og:description", content: ctx.description }],
      ["meta", { name: "twitter:title", content: ctx.title }],
      ["meta", { name: "twitter:description", content: ctx.description }],
    ];
  },
  vite: {
    optimizeDeps: {
      exclude: ["@vue/repl"],
    },
  },
  themeConfig: {
    siteTitle: "Toastflow",
    nav: [
      { text: "Guide", link: "/guide/introduction" },
      { text: "Examples", link: "/guide/live-examples" },
      { text: "Toastflow API", link: "/api/configuration" },
      { text: "Components", link: "/components/toast-container" },
      { text: "Playground", link: "https://toastflow.top/" },
    ],
    sidebar: [
      {
        text: "Guide",
        collapsed: false,
        items: [
          { text: "Introduction", link: "/guide/introduction" },
          { text: "Getting Started", link: "/guide/getting-started" },
          { text: "Live Examples", link: "/guide/live-examples" },
          { text: "Theming", link: "/guide/theming" },
          { text: "Toasts", link: "/guide/toasts" },
          { text: "Timers and Progress", link: "/guide/timers-and-progress" },
          { text: "Buttons and Actions", link: "/guide/buttons-and-actions" },
          { text: "Programmatic API", link: "/guide/programmatic-api" },
          { text: "Controlled Store", link: "/guide/controlled-store" },
        ],
      },
      {
        text: "Toastflow",
        collapsed: false,
        items: [
          { text: "Configuration", link: "/api/configuration" },
          { text: "State", link: "/api/state" },
          { text: "Events", link: "/api/events" },
          { text: "Actions", link: "/api/actions" },
          { text: "Getters", link: "/api/getters" },
          { text: "Slots", link: "/api/slots" },
          { text: "Utilities", link: "/api/utilities" },
        ],
      },
      {
        text: "Components",
        collapsed: false,
        items: [
          { text: "ToastContainer", link: "/components/toast-container" },
          { text: "Toast", link: "/components/toast" },
          { text: "ToastProgress", link: "/components/toast-progress" },
          { text: "Icons", link: "/components/icons" },
        ],
      },
      {
        text: "Support",
        collapsed: false,
        items: [{ text: "Troubleshooting", link: "/troubleshooting" }],
      },
    ],
    socialLinks: [
      { icon: "github", link: "https://github.com/adrianjanocko/toastflow" },
    ],
    search: {
      provider: "local",
    },
    outline: {
      label: "On this page",
      level: [2, 3],
    },
    docFooter: {
      prev: "Previous",
      next: "Next",
    },
    editLink: {
      pattern:
        "https://github.com/adrianjanocko/toastflow/edit/main/packages/docs/vue/:path",
      text: "Suggest changes to this page",
    },
  },
});

