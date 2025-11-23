import type {App, Plugin} from "vue";
import {createToastStore, type ToastConfig} from "toastflow-core";
import {toastStoreKey} from "./symbols";

export function createToastflow(config: Partial<ToastConfig> = {}): Plugin {
    return {
        install(app: App) {
            const store = createToastStore(config);
            app.provide(toastStoreKey, store);
        }
    };
}