import {inject} from "vue";
import type {ToastId, ToastOptions, ToastStore} from "toastflow-core";
import {toastStoreKey} from "./symbols";

export function useToast() {
    const injectedStore = inject<ToastStore | null>(toastStoreKey, null);

    if (!injectedStore) {
        throw new Error("[vue-toastflow] Plugin not installed");
    }

    const store: ToastStore = injectedStore;

    function show(options: Partial<ToastOptions>): ToastId {
        return store.show(options);
    }

    function toast(
        options: Partial<ToastOptions>
    ): ToastId {
        return store.show({...options, type: "default"});
    }

    function success(
        options: Partial<ToastOptions>
    ): ToastId {
        return store.show({...options, type: "success"});
    }

    function error(
        options: Partial<ToastOptions>
    ): ToastId {
        return store.show({...options, type: "error"});
    }

    function info(
        options: Partial<ToastOptions>
    ): ToastId {
        return store.show({...options, type: "info"});
    }

    function warning(
        options: Partial<ToastOptions>
    ): ToastId {
        return store.show({...options, type: "warning"});
    }

    const update = (id: ToastId, options: Partial<ToastOptions>) => {
        store.update(id, options);
    };

    const dismiss = (id: ToastId) => {
        store.dismiss(id);
    };

    const dismissAll = () => {
        store.dismissAll();
    };

    return {
        show,
        toast,
        success,
        error,
        info,
        warning,
        update,
        dismiss,
        dismissAll
    };
}