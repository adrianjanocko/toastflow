export default defineAppConfig({
  seo: {
    title: "Toastflow",
    titleTemplate: "%s | Toastflow",
    description:
      "Accessible toast notifications for Vue, Nuxt, and headless apps.",
    image: "/banner.png",
    imageAlt: "Toastflow toast notification playground preview",
    url: "https://www.toastflow.top",
    keywords:
      "vue toast, nuxt toast, toast notifications, toastflow, vue 3 notifications, nuxt module, headless toast renderer",
  },
  header: {
    title: "Toastflow",
    logo: {
      light: "/favicon.svg",
      dark: "/favicon.svg",
      alt: "Toastflow",
      favicon: "/favicon.svg",
    },
  },
  toc: {
    title: "On this page",
    bottom: {
      title: "Resources",
      links: [
        {
          icon: "i-tabler-player-play",
          label: "Playground",
          to: "/",
          target: "_self",
        },
        {
          icon: "i-simple-icons-github",
          label: "GitHub",
          to: "https://github.com/adrianjanocko/toastflow",
          target: "_blank",
        },
        {
          icon: "i-simple-icons-npm",
          label: "toastflow-core",
          to: "https://www.npmjs.com/package/toastflow-core",
          target: "_blank",
        },
        {
          icon: "i-simple-icons-vuedotjs",
          label: "vue-toastflow",
          to: "https://www.npmjs.com/package/vue-toastflow",
          target: "_blank",
        },
        {
          icon: "i-simple-icons-nuxtdotjs",
          label: "nuxt-toastflow",
          to: "https://www.npmjs.com/package/nuxt-toastflow",
          target: "_blank",
        },
      ],
    },
  },
  github: {
    url: "https://github.com/adrianjanocko/toastflow",
    branch: "main",
    rootDir: "packages/site",
  },
  assistant: {
    floatingInput: true,
    explainWithAi: true,
    faqQuestions: [
      "How do I install Toastflow in Vue?",
      "How do I install Toastflow in Nuxt?",
      "When should I use toast vs useToast() in Nuxt?",
      "How do I disable Toastflow CSS in Nuxt?",
      "How do I import ToastContainer from nuxt-toastflow/runtime?",
      "How do I customize Toastflow styles?",
      "How do I build a headless toast renderer?",
    ],
    icons: {
      trigger: "i-tabler-sparkles",
      explain: "i-tabler-brain",
    },
  },
});
