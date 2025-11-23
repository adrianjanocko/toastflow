import {defineConfig} from "vite";
import vue from "@vitejs/plugin-vue";
import path from "node:path";

export default defineConfig({
    plugins: [vue()],
    build: {
        lib: {
            entry: path.resolve(__dirname, "src/index.ts"),
            name: "Toastflow",
            fileName: (format) => `toastflow.${format}.js`
        },
        rollupOptions: {
            external: ["vue", "toastflow-core"],
            output: {
                globals: {
                    vue: "Vue"
                }
            }
        }
    }
});