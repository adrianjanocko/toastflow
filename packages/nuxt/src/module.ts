import type { ToastConfig } from "vue-toastflow";
import {
  addComponent,
  addImports,
  addPluginTemplate,
  addTemplate,
  addTypeTemplate,
  defineNuxtModule,
} from "@nuxt/kit";

export interface NuxtToastflowOptions {
  /**
   * Global Toastflow config passed to createToastflow.
   */
  config: Partial<ToastConfig>;
  /**
   * Automatically include Toastflow CSS.
   */
  css: boolean;
  /**
   * Auto-register ToastContainer under this name. Set false to disable.
   */
  componentName: string | false;
}

function containsFunction(
  value: unknown,
  visited: Set<unknown> = new Set(),
): boolean {
  if (typeof value === "function") {
    return true;
  }

  if (!value || typeof value !== "object") {
    return false;
  }

  if (visited.has(value)) {
    return false;
  }
  visited.add(value);

  if (Array.isArray(value)) {
    return value.some(function (item: unknown): boolean {
      return containsFunction(item, visited);
    });
  }

  const objectValues = Object.values(value as Record<string, unknown>);

  return objectValues.some(function (item: unknown): boolean {
    return containsFunction(item, visited);
  });
}

export default defineNuxtModule<NuxtToastflowOptions>({
  meta: {
    name: "nuxt-toastflow",
    configKey: "toastflow",
    compatibility: {
      nuxt: "^3.0.0 || ^4.0.0",
    },
  },
  defaults: {
    config: {},
    css: true,
    componentName: "ToastContainer",
  },
  setup(options, nuxt) {
    if (containsFunction(options.config)) {
      console.warn(
        "[nuxt-toastflow] Functions in `toastflow.config` are not serializable in nuxt.config and will be omitted.",
      );
    }

    let serializedConfig = "{}";
    try {
      serializedConfig = JSON.stringify(options.config ?? {}, null, 2) ?? "{}";
    } catch {
      throw new Error(
        "[nuxt-toastflow] `toastflow.config` must be JSON-serializable.",
      );
    }

    addPluginTemplate({
      filename: "toastflow.mjs",
      mode: "client",
      getContents: function () {
        return [
          'import { createToastflow, toast } from "vue-toastflow";',
          "",
          "export default defineNuxtPlugin((nuxtApp) => {",
          `  nuxtApp.vueApp.use(createToastflow(${serializedConfig}));`,
          "",
          "  return {",
          "    provide: {",
          "      toast,",
          "    },",
          "  };",
          "});",
          "",
        ].join("\n");
      },
    });

    const toastTemplate = addTemplate({
      filename: "toastflow/toast.ts",
      getContents: function () {
        return [
          'import { useNuxtApp } from "#app";',
          "",
          'type ToastApi = typeof import("vue-toastflow")["toast"];',
          "",
          "export function useToast(): ToastApi {",
          "  return useNuxtApp().$toast;",
          "}",
          "",
          "export const toast: ToastApi = new Proxy({} as ToastApi, {",
          "  get(_target, key) {",
          "    const currentToast = useNuxtApp().$toast as Record<PropertyKey, unknown>;",
          "    const value = currentToast[key];",
          '    if (typeof value === "function") {',
          "      return (value as (...args: unknown[]) => unknown).bind(currentToast);",
          "    }",
          "    return value;",
          "  },",
          "});",
          "",
        ].join("\n");
      },
    });

    addImports({
      name: "useToast",
      from: toastTemplate.dst,
    });

    addImports({
      name: "toast",
      from: toastTemplate.dst,
    });

    addTypeTemplate({
      filename: "types/nuxt-toastflow.d.ts",
      getContents: function () {
        return [
          'type ToastApi = typeof import("vue-toastflow")["toast"];',
          "",
          'declare module "#app" {',
          "  interface NuxtApp {",
          "    $toast: ToastApi;",
          "  }",
          "}",
          "",
          'declare module "vue" {',
          "  interface ComponentCustomProperties {",
          "    $toast: ToastApi;",
          "  }",
          "}",
          "",
          "export {};",
          "",
        ].join("\n");
      },
    });

    if (options.componentName) {
      addComponent({
        name: options.componentName,
        export: "ToastContainer",
        filePath: "vue-toastflow",
        mode: "client",
      });
    }

    if (options.css) {
      const cssEntry = "vue-toastflow/styles.css";
      const hasCssEntry = nuxt.options.css.some(function (entry) {
        if (typeof entry === "string") {
          return entry === cssEntry;
        }

        if (Array.isArray(entry) && typeof entry[0] === "string") {
          return entry[0] === cssEntry;
        }

        return false;
      });

      if (!hasCssEntry) {
        nuxt.options.css.push(cssEntry);
      }
    }
  },
});
