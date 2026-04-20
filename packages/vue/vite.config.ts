import {defineConfig} from "vite";
import vue from "@vitejs/plugin-vue";
import dts from "vite-plugin-dts";
import path from "node:path";
import { ModuleFormat } from "rolldown";

export default defineConfig(async () => {
    const { default: cssInjectedByJs } = await import("vite-plugin-css-injected-by-js");
    return {
        plugins: [vue(), dts({ tsconfigPath: "./tsconfig.json", exclude: ["vite.config.ts"], entryRoot: "src" }), cssInjectedByJs()],
        build: {
            lib: {
                entry: path.resolve(__dirname, "src/index.ts"),
                name: "Toastflow",
                fileName: (format: ModuleFormat) => `toastflow.${format}.js`
            },
            rollupOptions: {
                external: ["vue", "toastflow-core"],
                output: {
                    globals: {
                        vue: "Vue",
                        "toastflow-core": "ToastflowCore"
                    }
                }
            }
        }
    };
});