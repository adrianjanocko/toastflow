import type { Component, CSSProperties, ComputedRef, Ref } from "vue";
import { computed, mergeProps, onUnmounted, ref, watch } from "vue";
import type {
  ToastButton,
  ToastButtonsLayout,
  ToastContext,
  ToastCSSOverrides,
  ToastId,
  ToastInstance,
  ToastStandaloneInstance,
  ToastStore,
  ToastType,
} from "toastflow-core";
import {
  defaultCreatedAtFormatter,
  isNumberFinite,
  VALID_TOAST_TYPES,
} from "toastflow-core";
import ArrowPath from "./components/icons/ArrowPath.vue";
import Bell from "./components/icons/Bell.vue";
import CheckCircle from "./components/icons/CheckCircle.vue";
import InfoCircle from "./components/icons/InfoCircle.vue";
import QuestionMarkCircle from "./components/icons/QuestionMarkCircle.vue";
import XCircle from "./components/icons/XCircle.vue";

type ToastSlotProps = Record<string, unknown>;
type ToastButtonsPlacement = "left" | "right" | "top" | "bottom";

export interface ToastUI {
  wrapperProps: ToastSlotProps;
  rootProps: ToastSlotProps;
  closeProps: ToastSlotProps;
  getWrapperProps: (props?: ToastSlotProps) => ToastSlotProps;
  getRootProps: (props?: ToastSlotProps) => ToastSlotProps;
  getCloseProps: (props?: ToastSlotProps) => ToastSlotProps;
  getButtonProps: (
    button: ToastButton,
    props?: ToastSlotProps,
  ) => ToastSlotProps;
  actions: {
    dismiss: () => void;
    pause: () => void;
    resume: () => void;
    onClick: (event: MouseEvent) => void;
    onCloseClick: () => void;
    onButtonClick: (button: ToastButton, event: MouseEvent) => void;
    onMouseEnter: () => void;
    onMouseLeave: () => void;
    onPointerDown: (event: PointerEvent) => void;
    onPointerMove: (event: PointerEvent) => void;
    onPointerUp: (event: PointerEvent) => void;
    onPointerCancel: (event: PointerEvent) => void;
  };
  a11y: {
    role: string;
    ariaLive: string;
    titleLabel: string;
    descriptionLabel: string;
    toastLabel: string;
    createdAtLabel: string;
  };
  state: {
    isHovered: boolean;
    isBumped: boolean;
    isUpdated: boolean;
    isSwipeEnabled: boolean;
  };
  classes: {
    wrapper: string;
    root: Array<string | false | undefined>;
    accent: string;
    icon: string;
    close: string;
    buttons: Array<string | undefined>;
  };
  styles: {
    wrapper: CSSProperties;
    root: CSSProperties;
    progress: CSSProperties;
  };
  icon: {
    show: boolean;
    component: Component;
    wrapperProps: ToastSlotProps;
    componentProps: ToastSlotProps;
  };
  createdAt: {
    show: boolean;
    inline: boolean;
    floating: boolean;
    formatted: string;
    ariaLabel: string;
  };
  buttons: {
    items: ToastButton[];
    has: boolean;
    placement: ToastButtonsPlacement;
    groupProps: ToastSlotProps;
    getGroupProps: (props?: ToastSlotProps) => ToastSlotProps;
  };
  progress: {
    show: boolean;
    key: number;
    wrapperProps: ToastSlotProps;
    trackProps: ToastSlotProps;
    barProps: ToastSlotProps;
    getWrapperProps: (props?: ToastSlotProps) => ToastSlotProps;
    getTrackProps: (props?: ToastSlotProps) => ToastSlotProps;
    getBarProps: (props?: ToastSlotProps) => ToastSlotProps;
    componentProps: {
      key: number;
      type: ToastType;
      progressAlignment: ToastInstance["progressAlignment"];
    };
  };
  layout: {
    hasOutsideButtons: boolean;
    showMetaLeft: boolean;
    showMetaRight: boolean;
    showMetaTop: boolean;
    showMetaBottom: boolean;
  };
}

interface UseToastUIOptions {
  toast: Ref<ToastStandaloneInstance | ToastInstance>;
  store: ToastStore;
  progressResetKey?: Ref<number | undefined>;
  duplicateKey?: Ref<number | undefined>;
  updateKey?: Ref<number | undefined>;
  onDismiss?: (id: ToastId) => void;
  bumpAnimationClass?: Ref<string | undefined>;
  clearAllAnimationClass?: Ref<string | undefined>;
  updateAnimationClass?: Ref<string | undefined>;
}

const typeMeta: Record<
  ToastType,
  {
    accent: string;
    icon: string;
    close: string;
    component: Component;
  }
> = {
  success: {
    accent: "tf-toast-accent--success",
    icon: "tf-toast-icon--success",
    close: "tf-toast-close--success",
    component: CheckCircle,
  },
  error: {
    accent: "tf-toast-accent--error",
    icon: "tf-toast-icon--error",
    close: "tf-toast-close--error",
    component: XCircle,
  },
  warning: {
    accent: "tf-toast-accent--warning",
    icon: "tf-toast-icon--warning",
    close: "tf-toast-close--warning",
    component: Bell,
  },
  info: {
    accent: "tf-toast-accent--info",
    icon: "tf-toast-icon--info",
    close: "tf-toast-close--info",
    component: InfoCircle,
  },
  default: {
    accent: "tf-toast-accent--default",
    icon: "tf-toast-icon--default",
    close: "tf-toast-close--default",
    component: QuestionMarkCircle,
  },
  loading: {
    accent: "tf-toast-accent--loading",
    icon: "tf-toast-icon--loading",
    close: "tf-toast-close--loading",
    component: ArrowPath,
  },
  custom: {
    accent: "tf-toast-accent--custom",
    icon: "tf-toast-icon--custom",
    close: "tf-toast-close--custom",
    component: QuestionMarkCircle,
  },
};

const assertiveTypes = new Set<ToastType>(["error", "warning"]);
const SWIPE_START_DISTANCE = 8;
const SWIPE_DISMISS_THRESHOLD_RATIO = 0.35;
const SWIPE_DISMISS_THRESHOLD_MIN = 96;
const SWIPE_SNAP_DURATION = 160;
const SWIPE_DISMISS_DURATION = 140;

/**
 * Maps non-shorthand ToastCSSOverrides keys to their CSS custom property names.
 * `accentColor` is a shorthand handled separately before this map is applied.
 */
const CSS_VAR_MAP: Readonly<Record<string, string>> = {
  iconColor: "--tf-toast-icon-color",
  bg: "--tf-toast-bg",
  color: "--tf-toast-color",
  borderColor: "--tf-toast-border-color",
  borderRadius: "--tf-toast-border-radius",
  borderWidth: "--tf-toast-border-width",
  padding: "--tf-toast-padding",
  fontFamily: "--tf-toast-font-family",
  gap: "--tf-toast-gap",
  titleColor: "--tf-toast-title-color",
  titleFontSize: "--tf-toast-title-font-size",
  titleFontWeight: "--tf-toast-title-font-weight",
  titleLineHeight: "--tf-toast-title-line-height",
  descriptionColor: "--tf-toast-description-color",
  descriptionFontSize: "--tf-toast-description-font-size",
  descriptionLineHeight: "--tf-toast-description-line-height",
  iconSize: "--tf-toast-icon-size",
  progressBarBg: "--tf-toast-progress-bar-bg",
  progressBg: "--tf-toast-progress-bg",
  progressHeight: "--tf-toast-progress-height",
  closeBg: "--tf-toast-close-bg",
  closeColor: "--tf-toast-close-color",
  closeBorderColor: "--tf-toast-close-border-color",
  closeSize: "--tf-toast-close-size",
  closeIconSize: "--tf-toast-close-icon-size",
  buttonBg: "--tf-toast-button-bg",
  buttonColor: "--tf-toast-button-color",
  buttonBorderColor: "--tf-toast-button-border-color",
  createdAtColor: "--tf-toast-created-at-color",
  createdAtBg: "--tf-toast-created-at-bg",
  createdAtBorderColor: "--tf-toast-created-at-border-color",
};

export function useToastUI({
  toast: toastProp,
  store,
  progressResetKey,
  duplicateKey,
  updateKey,
  onDismiss,
  bumpAnimationClass,
  clearAllAnimationClass,
  updateAnimationClass,
}: UseToastUIOptions) {
  const toast = computed<ToastInstance>(function () {
    const createdAt = isNumberFinite(toastProp.value.createdAt)
      ? toastProp.value.createdAt
      : Date.now();
    const baseConfig = store.getConfig();

    return {
      ...baseConfig,
      ...toastProp.value,
      createdAt,
      id: toastProp.value.id ?? `toast-${createdAt}`,
      type: resolveToastType(toastProp.value.type),
      title: toastProp.value.title ?? "",
      description: toastProp.value.description ?? "",
      progressBar: toastProp.value.progressBar ?? false,
      duration: toastProp.value.duration ?? Infinity,
    } as ToastInstance;
  });

  const {
    accentClass,
    iconWrapperClass,
    closeWrapperClass,
    defaultIconComponent,
  } = useTypeMeta(toast);
  const {
    role,
    ariaLive,
    hasCreatedAt,
    createdAtText,
    createdAtAriaLabel,
    titleAriaLabel,
    descriptionAriaLabel,
    toastAriaLabel,
  } = useAria(toast);
  const { duration, progressStyle, showProgressBar, progressKeyLocal } =
    useProgress(toast, progressResetKey, duplicateKey);
  const { isBumped, isUpdated } = useAnimations(duplicateKey, updateKey);
  const {
    isHovered,
    pause,
    resume,
    handleMouseEnter,
    handleMouseLeave,
    handlePointerDown: handlePausePointerDown,
    handlePointerUp: handlePausePointerUp,
  } = useHoverPause(toast, store, duration);

  function dismissCurrent() {
    if (onDismiss) {
      onDismiss(toast.value.id);
      return;
    }

    store.dismiss(toast.value.id);
  }

  const {
    isSwipeEnabled,
    swipeStyle,
    handlePointerDown: handleSwipePointerDown,
    handlePointerMove: handleSwipePointerMove,
    handlePointerUp: handleSwipePointerUp,
    handlePointerCancel: handleSwipePointerCancel,
    consumeSuppressedClick,
  } = useSwipeDismiss(toast, dismissCurrent);
  const { handleClick, handleCloseClick } = useClickHandlers(
    toast,
    dismissCurrent,
    consumeSuppressedClick,
  );
  const {
    hasButtons,
    buttons,
    buttonsPlacement,
    buttonsClasses,
    buttonsVarsStyle,
    handleButtonClick,
  } = useButtons(toast, dismissCurrent);

  const toastStyle = computed<CSSProperties>(function () {
    const style: Record<string, string> = {};

    const buttonVars = buttonsVarsStyle.value as Record<
      string,
      string | undefined
    >;
    for (const key of Object.keys(buttonVars)) {
      const value = buttonVars[key];
      if (value != null) {
        style[key] = value;
      }
    }

    const css = toast.value.css;
    if (!css) {
      return style as CSSProperties;
    }

    if (css.accentColor) {
      const accent = css.accentColor;
      style["--tf-toast-accent-color"] = accent;
      style["--tf-toast-color"] = accent;
      style["--tf-toast-title-color"] = accent;
      style["--tf-toast-description-color"] = accent;
      style["--tf-toast-progress-bar-bg"] = accent;
    }

    if (css.color) {
      if (!css.titleColor) {
        style["--tf-toast-title-color"] = css.color;
      }
      if (!css.descriptionColor) {
        style["--tf-toast-description-color"] = css.color;
      }
    }

    for (const [key, varName] of Object.entries(CSS_VAR_MAP)) {
      const value = css[key as keyof ToastCSSOverrides];
      if (value != null) {
        style[varName] = value;
      }
    }

    return style as CSSProperties;
  });

  const showIconElement = computed(function () {
    return toast.value.showIcon !== false;
  });

  // HTML passed through the configured sanitizer, ready for v-html when
  // supportHtml is enabled.
  const sanitizedTitle = computed(function () {
    return applySanitizer(toast.value, toast.value.title);
  });

  const sanitizedDescription = computed(function () {
    return applySanitizer(toast.value, toast.value.description);
  });

  function handlePointerDown(event: PointerEvent) {
    handlePausePointerDown(event);
    handleSwipePointerDown(event);
  }

  function handlePointerMove(event: PointerEvent) {
    handleSwipePointerMove(event);
  }

  function handlePointerUp(event: PointerEvent) {
    handleSwipePointerUp(event);
    handlePausePointerUp(event);
  }

  function handlePointerCancel(event: PointerEvent) {
    handleSwipePointerCancel(event);
    handlePausePointerUp(event);
  }

  const showMetaLeft = computed(function () {
    return hasButtons.value && buttonsPlacement.value === "left";
  });

  const showMetaRight = computed(function () {
    return hasButtons.value && buttonsPlacement.value === "right";
  });

  const showMetaTop = computed(function () {
    return hasButtons.value && buttonsPlacement.value === "top";
  });

  const showMetaBottom = computed(function () {
    return hasButtons.value && buttonsPlacement.value === "bottom";
  });

  const hasOutsideButtons = computed(function () {
    return showMetaTop.value || showMetaBottom.value;
  });

  const showInlineCreatedAt = computed(function () {
    return hasCreatedAt.value && !hasButtons.value;
  });

  const showFloatingCreatedAt = computed(function () {
    return hasCreatedAt.value && hasButtons.value;
  });

  const rootClasses = computed<Array<string | false | undefined>>(function () {
    return [
      "tf-toast",
      accentClass.value,
      isBumped.value &&
        toast.value.phase !== "leaving" &&
        toast.value.phase !== "clear-all" &&
        bumpAnimationClass?.value,
      isUpdated.value &&
        toast.value.phase !== "leaving" &&
        toast.value.phase !== "clear-all" &&
        updateAnimationClass?.value,
      toast.value.phase === "clear-all" && clearAllAnimationClass?.value,
      isHovered.value && "tf-toast--paused",
      isSwipeEnabled.value && "tf-toast--swipe-enabled",
    ];
  });

  const wrapperProps = computed<ToastSlotProps>(function () {
    return {
      role: role.value,
      "aria-live": ariaLive.value,
      class: "tf-toast-wrapper",
      style: swipeStyle.value,
    };
  });

  const rootProps = computed<ToastSlotProps>(function () {
    return {
      class: rootClasses.value,
      "aria-label": toastAriaLabel.value || undefined,
      "data-align": toast.value.alignment,
      style: toastStyle.value,
      onClick: handleClick,
      onKeydown: handleKeydown,
      onMouseenter: handleMouseEnter,
      onMouseleave: handleMouseLeave,
      onPointerdown: handlePointerDown,
      onPointermove: handlePointerMove,
      onPointerup: handlePointerUp,
      onPointercancel: handlePointerCancel,
    };
  });

  // Escape dismisses the toast when focus is inside it (e.g. on a button).
  function handleKeydown(event: KeyboardEvent) {
    if (event.key !== "Escape") {
      return;
    }
    event.stopPropagation();
    handleCloseClick();
  }

  const closeProps = computed<ToastSlotProps>(function () {
    return {
      type: "button",
      class: ["tf-toast-close", closeWrapperClass.value],
      "aria-label": "Close notification",
      onClick: function (event: MouseEvent) {
        event.stopPropagation();
        handleCloseClick();
      },
    };
  });

  const buttonsGroupProps = computed<ToastSlotProps>(function () {
    return {
      class: buttonsClasses.value,
    };
  });

  const progressWrapperProps = computed<ToastSlotProps>(function () {
    return {
      class: "tf-toast-progress-wrapper",
      style: progressStyle.value,
    };
  });

  const progressTrackProps = computed<ToastSlotProps>(function () {
    return {
      class: "tf-toast-progress",
      "data-align": toast.value.progressAlignment,
      style: progressStyle.value,
    };
  });

  const progressBarProps = computed<ToastSlotProps>(function () {
    return {
      class: [
        "tf-toast-progress-bar",
        `tf-toast-progress-bar--${toast.value.type}`,
      ],
    };
  });

  const iconWrapperProps = computed<ToastSlotProps>(function () {
    return {
      class: ["tf-toast-icon", iconWrapperClass.value],
      "aria-hidden": "true",
    };
  });

  const iconComponentProps = computed<ToastSlotProps>(function () {
    return {
      class: [
        "tf-toast-icon-svg",
        toast.value.type === "loading" && "tf-toast-icon-spin",
      ],
      "aria-hidden": true,
    };
  });

  function getWrapperProps(props?: ToastSlotProps): ToastSlotProps {
    return mergeProps(wrapperProps.value, props ?? {});
  }

  function getRootProps(props?: ToastSlotProps): ToastSlotProps {
    return mergeProps(rootProps.value, props ?? {});
  }

  function getCloseProps(props?: ToastSlotProps): ToastSlotProps {
    return mergeProps(closeProps.value, props ?? {});
  }

  function getButtonsGroupProps(props?: ToastSlotProps): ToastSlotProps {
    return mergeProps(buttonsGroupProps.value, props ?? {});
  }

  function getButtonProps(
    button: ToastButton,
    props?: ToastSlotProps,
  ): ToastSlotProps {
    return mergeProps(
      {
        type: "button",
        class: ["tf-toast-button", button.className],
        "aria-label": button.ariaLabel || undefined,
        onClick: function (event: MouseEvent) {
          event.stopPropagation();
          handleButtonClick(button, event);
        },
        onPointerdown: function (event: PointerEvent) {
          event.stopPropagation();
        },
        onPointerup: function (event: PointerEvent) {
          event.stopPropagation();
        },
        onPointercancel: function (event: PointerEvent) {
          event.stopPropagation();
        },
      },
      props ?? {},
    );
  }

  function getProgressWrapperProps(props?: ToastSlotProps): ToastSlotProps {
    return mergeProps(progressWrapperProps.value, props ?? {});
  }

  function getProgressTrackProps(props?: ToastSlotProps): ToastSlotProps {
    return mergeProps(progressTrackProps.value, props ?? {});
  }

  function getProgressBarProps(props?: ToastSlotProps): ToastSlotProps {
    return mergeProps(progressBarProps.value, props ?? {});
  }

  const ui: ComputedRef<ToastUI> = computed(function () {
    return {
      wrapperProps: wrapperProps.value,
      rootProps: rootProps.value,
      closeProps: closeProps.value,
      getWrapperProps,
      getRootProps,
      getCloseProps,
      getButtonProps,
      actions: {
        dismiss: dismissCurrent,
        pause,
        resume,
        onClick: handleClick,
        onCloseClick: handleCloseClick,
        onButtonClick: handleButtonClick,
        onMouseEnter: handleMouseEnter,
        onMouseLeave: handleMouseLeave,
        onPointerDown: handlePointerDown,
        onPointerMove: handlePointerMove,
        onPointerUp: handlePointerUp,
        onPointerCancel: handlePointerCancel,
      },
      a11y: {
        role: role.value,
        ariaLive: ariaLive.value,
        titleLabel: titleAriaLabel.value,
        descriptionLabel: descriptionAriaLabel.value,
        toastLabel: toastAriaLabel.value,
        createdAtLabel: createdAtAriaLabel.value,
      },
      state: {
        isHovered: isHovered.value,
        isBumped: isBumped.value,
        isUpdated: isUpdated.value,
        isSwipeEnabled: isSwipeEnabled.value,
      },
      classes: {
        wrapper: "tf-toast-wrapper",
        root: rootClasses.value,
        accent: accentClass.value,
        icon: iconWrapperClass.value,
        close: closeWrapperClass.value,
        buttons: buttonsClasses.value,
      },
      styles: {
        wrapper: swipeStyle.value,
        root: toastStyle.value,
        progress: progressStyle.value,
      },
      icon: {
        show: showIconElement.value,
        component: defaultIconComponent.value,
        wrapperProps: iconWrapperProps.value,
        componentProps: iconComponentProps.value,
      },
      createdAt: {
        show: hasCreatedAt.value,
        inline: showInlineCreatedAt.value,
        floating: showFloatingCreatedAt.value,
        formatted: createdAtText.value,
        ariaLabel: createdAtAriaLabel.value,
      },
      buttons: {
        items: buttons.value,
        has: hasButtons.value,
        placement: buttonsPlacement.value,
        groupProps: buttonsGroupProps.value,
        getGroupProps: getButtonsGroupProps,
      },
      progress: {
        show: showProgressBar.value,
        key: progressKeyLocal.value,
        wrapperProps: progressWrapperProps.value,
        trackProps: progressTrackProps.value,
        barProps: progressBarProps.value,
        getWrapperProps: getProgressWrapperProps,
        getTrackProps: getProgressTrackProps,
        getBarProps: getProgressBarProps,
        componentProps: {
          key: progressKeyLocal.value,
          type: toast.value.type,
          progressAlignment: toast.value.progressAlignment,
        },
      },
      layout: {
        hasOutsideButtons: hasOutsideButtons.value,
        showMetaLeft: showMetaLeft.value,
        showMetaRight: showMetaRight.value,
        showMetaTop: showMetaTop.value,
        showMetaBottom: showMetaBottom.value,
      },
    };
  });

  return {
    toast,
    accentClass,
    iconWrapperClass,
    closeWrapperClass,
    defaultIconComponent,
    role,
    ariaLive,
    hasCreatedAt,
    createdAtText,
    createdAtAriaLabel,
    titleAriaLabel,
    descriptionAriaLabel,
    toastAriaLabel,
    sanitizedTitle,
    sanitizedDescription,
    duration,
    progressStyle,
    showProgressBar,
    progressKeyLocal,
    isBumped,
    isUpdated,
    isHovered,
    handleMouseEnter,
    handleMouseLeave,
    handlePointerDown,
    handlePointerMove,
    handlePointerUp,
    handlePointerCancel,
    isSwipeEnabled,
    swipeStyle,
    handleClick,
    handleCloseClick,
    dismissCurrent,
    pause,
    resume,
    hasButtons,
    buttons,
    buttonsPlacement,
    buttonsClasses,
    buttonsVarsStyle,
    handleButtonClick,
    toastStyle,
    showIconElement,
    showMetaLeft,
    showMetaRight,
    showMetaTop,
    showMetaBottom,
    hasOutsideButtons,
    showInlineCreatedAt,
    showFloatingCreatedAt,
    ui,
  };
}

function applySanitizer(toast: ToastInstance, html: string): string {
  const sanitizer = toast.sanitizer;
  if (typeof sanitizer !== "function") {
    return html;
  }

  try {
    return sanitizer(html);
  } catch (error) {
    console.error("[vue-toastflow] Something failed in sanitizer", error);
    // Fail closed: dropping the content beats rendering it unsanitized.
    return "";
  }
}

function resolveToastType(value: unknown): ToastType {
  if (typeof value === "string" && VALID_TOAST_TYPES.has(value as ToastType)) {
    return value as ToastType;
  }
  return "default";
}

function useTypeMeta(toast: Ref<ToastInstance>) {
  const accentClass = computed(function () {
    if (toast.value.theme) {
      return toast.value.theme.startsWith("tf-toast-accent--")
        ? toast.value.theme
        : `tf-toast-accent--${toast.value.theme}`;
    }
    return typeMeta[toast.value.type].accent;
  });

  const iconWrapperClass = computed(function () {
    return typeMeta[toast.value.type].icon;
  });

  const closeWrapperClass = computed(function () {
    return typeMeta[toast.value.type].close;
  });

  const defaultIconComponent = computed(function () {
    return typeMeta[toast.value.type].component;
  });

  return {
    accentClass,
    iconWrapperClass,
    closeWrapperClass,
    defaultIconComponent,
  };
}

function useAria(toast: Ref<ToastInstance>) {
  const role = computed(function () {
    return assertiveTypes.has(toast.value.type) ? "alert" : "status";
  });

  const ariaLive = computed(function () {
    return assertiveTypes.has(toast.value.type) ? "assertive" : "polite";
  });

  const hasCreatedAt = computed(function () {
    return Boolean(
      toast.value.showCreatedAt && isNumberFinite(toast.value.createdAt),
    );
  });

  const createdAtText = computed(function () {
    if (!hasCreatedAt.value) {
      return "";
    }

    const formatter = toast.value.createdAtFormatter;

    if (typeof formatter !== "function") {
      return defaultCreatedAtFormatter(toast.value.createdAt);
    }

    try {
      return formatter(toast.value.createdAt);
    } catch (error) {
      console.error(
        "[vue-toastflow] Something failed in createdAtFormatter",
        error,
      );
    }

    return defaultCreatedAtFormatter(toast.value.createdAt);
  });

  const createdAtAriaLabel = computed(function () {
    if (!createdAtText.value) {
      return "";
    }
    return `Sent at ${createdAtText.value}`;
  });

  const titleAriaLabel = computed(function () {
    return stripHtmlToText(toast.value.title);
  });

  const descriptionAriaLabel = computed(function () {
    return stripHtmlToText(toast.value.description);
  });

  const toastAriaLabel = computed(function () {
    const parts = [];

    if (titleAriaLabel.value) {
      parts.push(titleAriaLabel.value);
    }

    if (descriptionAriaLabel.value) {
      parts.push(descriptionAriaLabel.value);
    }

    if (hasCreatedAt.value && createdAtAriaLabel.value) {
      parts.push(createdAtAriaLabel.value);
    }

    if (!parts.length) {
      parts.push(`${toast.value.type} notification`);
    }

    return parts.join(". ");
  });

  return {
    role,
    ariaLive,
    hasCreatedAt,
    createdAtText,
    createdAtAriaLabel,
    titleAriaLabel,
    descriptionAriaLabel,
    toastAriaLabel,
  };
}

function useProgress(
  toast: Ref<ToastInstance>,
  progressResetKey?: Ref<number | undefined>,
  duplicateKey?: Ref<number | undefined>,
) {
  const duration = computed<number | undefined>(function () {
    if (!isNumberFinite(toast.value.duration)) {
      return undefined;
    }
    return toast.value.duration;
  });

  const progressStyle = computed(function (): CSSProperties {
    if (!duration.value) {
      return {};
    }
    return {
      "--tf-toast-progress-duration": `${duration.value}ms`,
    };
  });

  const showProgressBar = computed(function () {
    return toast.value.progressBar && Boolean(duration.value);
  });

  const progressKeyLocal = ref(0);

  watch(
    () => progressResetKey?.value,
    function (value) {
      if (value == null) {
        return;
      }
      progressKeyLocal.value += 1;
    },
  );

  watch(
    () => duplicateKey?.value,
    function (value) {
      if (value == null) {
        return;
      }
      progressKeyLocal.value += 1;
    },
  );

  return {
    duration,
    progressStyle,
    showProgressBar,
    progressKeyLocal,
  };
}

function useAnimations(
  duplicateKey?: Ref<number | undefined>,
  updateKey?: Ref<number | undefined>,
) {
  const isBumped = ref(false);
  const isUpdated = ref(false);

  function triggerBump() {
    isBumped.value = false;
    requestAnimationFrame(function () {
      isBumped.value = true;
    });
  }

  function triggerUpdate() {
    isUpdated.value = false;
    requestAnimationFrame(function () {
      isUpdated.value = true;
    });
  }

  watch(
    () => duplicateKey?.value,
    function (value) {
      if (value == null) {
        return;
      }
      triggerBump();
    },
  );

  watch(
    () => updateKey?.value,
    function (value) {
      if (value == null) {
        return;
      }
      triggerUpdate();
    },
  );

  return {
    isBumped,
    isUpdated,
  };
}

function useHoverPause(
  toast: Ref<ToastInstance>,
  store: ToastStore,
  duration: Ref<number | undefined>,
) {
  const isHovered = ref(false);
  let lastPointerType = "";

  function handleMouseEnter() {
    if (!canUseMouseHover()) {
      return;
    }
    if (lastPointerType === "touch" || lastPointerType === "pen") {
      return;
    }
    if (!canPause()) {
      return;
    }
    pause();
  }

  function handleMouseLeave() {
    if (!canUseMouseHover()) {
      return;
    }
    if (lastPointerType === "touch" || lastPointerType === "pen") {
      lastPointerType = "";
      return;
    }
    if (!canPause()) {
      return;
    }
    resume();
  }

  function handlePointerDown(event: PointerEvent) {
    lastPointerType = event.pointerType;
    if (!canPause(event, true)) {
      return;
    }
    pause();
  }

  function handlePointerUp(event: PointerEvent) {
    if (!canPause(event, true)) {
      return;
    }
    resume();
  }

  function canPause(event?: PointerEvent, requireTouch = false) {
    if (!duration.value) {
      return false;
    }
    if (!toast.value.pauseOnHover) {
      return false;
    }
    return !(requireTouch && event && !isTouchLike(event));
  }

  function isTouchLike(event: PointerEvent) {
    return event.pointerType === "touch" || event.pointerType === "pen";
  }

  function canUseMouseHover() {
    if (typeof window === "undefined" || !window.matchMedia) {
      return true;
    }

    return window.matchMedia(
      "(hover: hover), (any-hover: hover) and (any-pointer: fine)",
    ).matches;
  }

  function pause() {
    isHovered.value = true;
    store.pause(toast.value.id);
  }

  function resume() {
    isHovered.value = false;
    store.resume(toast.value.id);
  }

  return {
    isHovered,
    pause,
    resume,
    handleMouseEnter,
    handleMouseLeave,
    handlePointerDown,
    handlePointerUp,
  };
}

function useSwipeDismiss(toast: Ref<ToastInstance>, dismiss: () => void) {
  const isSwipeEnabled = computed(function () {
    return Boolean(toast.value.swipeToDismiss);
  });
  const swipeOffsetX = ref(0);
  const swipeOpacity = ref(1);
  const isDragging = ref(false);
  const suppressClick = ref(false);
  const activePointerId = ref<number | null>(null);
  const startX = ref(0);
  const startY = ref(0);
  const toastWidth = ref(0);
  const axisLocked = ref(false);
  const blockedByDirection = ref(false);
  const hasMoved = ref(false);

  let dismissTimer: ReturnType<typeof setTimeout> | null = null;

  const swipeStyle = computed<CSSProperties>(function () {
    if (
      !isSwipeEnabled.value &&
      swipeOffsetX.value === 0 &&
      swipeOpacity.value === 1
    ) {
      return {};
    }

    return {
      transform: `translate3d(${swipeOffsetX.value}px, 0, 0)`,
      opacity: swipeOpacity.value,
      transition: isDragging.value
        ? "none"
        : `transform ${SWIPE_SNAP_DURATION}ms ease, opacity ${SWIPE_SNAP_DURATION}ms ease`,
    };
  });

  function clearTimers() {
    if (dismissTimer) {
      clearTimeout(dismissTimer);
      dismissTimer = null;
    }
  }

  function resetPointerState() {
    activePointerId.value = null;
    axisLocked.value = false;
    blockedByDirection.value = false;
    hasMoved.value = false;
    toastWidth.value = 0;
  }

  function restorePosition() {
    isDragging.value = false;

    if (swipeOffsetX.value === 0 && swipeOpacity.value === 1) {
      return;
    }

    swipeOffsetX.value = 0;
    swipeOpacity.value = 1;
  }

  function pointerMatches(event: PointerEvent): boolean {
    return (
      activePointerId.value !== null &&
      activePointerId.value === event.pointerId
    );
  }

  function releaseCapture(event: PointerEvent) {
    const element = event.currentTarget as HTMLElement | null;
    if (!element?.releasePointerCapture) {
      return;
    }

    try {
      element.releasePointerCapture(event.pointerId);
    } catch {}
  }

  function shouldStart(event: PointerEvent): boolean {
    if (!isSwipeEnabled.value) {
      return false;
    }
    if (event.button !== undefined && event.button !== 0) {
      return false;
    }
    return !isInteractiveTarget(event.target);
  }

  function handlePointerDown(event: PointerEvent) {
    if (!shouldStart(event)) {
      return;
    }

    clearTimers();
    suppressClick.value = false;
    isDragging.value = false;
    activePointerId.value = event.pointerId;
    startX.value = event.clientX;
    startY.value = event.clientY;

    const element = event.currentTarget as HTMLElement | null;
    toastWidth.value = element?.getBoundingClientRect().width ?? 0;

    if (element?.setPointerCapture) {
      try {
        element.setPointerCapture(event.pointerId);
      } catch {}
    }
  }

  function handlePointerMove(event: PointerEvent) {
    if (!pointerMatches(event) || blockedByDirection.value) {
      return;
    }

    const deltaX = event.clientX - startX.value;
    const deltaY = event.clientY - startY.value;
    const absX = Math.abs(deltaX);
    const absY = Math.abs(deltaY);

    if (!axisLocked.value) {
      if (absX < SWIPE_START_DISTANCE && absY < SWIPE_START_DISTANCE) {
        return;
      }

      if (deltaX <= 0 || absY > absX) {
        blockedByDirection.value = true;
        restorePosition();
        return;
      }

      axisLocked.value = true;
    }

    event.preventDefault();
    isDragging.value = true;
    hasMoved.value = true;

    const nextOffset = Math.max(0, deltaX);
    const width = toastWidth.value > 0 ? toastWidth.value : 1;
    const progress = Math.min(nextOffset / width, 1);

    swipeOffsetX.value = nextOffset;
    swipeOpacity.value = Math.max(1 - progress * 0.85, 0.15);
  }

  function handlePointerUp(event: PointerEvent) {
    if (!pointerMatches(event)) {
      return;
    }

    releaseCapture(event);

    if (!axisLocked.value || blockedByDirection.value || !hasMoved.value) {
      restorePosition();
      resetPointerState();
      return;
    }

    const width = toastWidth.value > 0 ? toastWidth.value : 1;
    const threshold = Math.max(
      width * SWIPE_DISMISS_THRESHOLD_RATIO,
      SWIPE_DISMISS_THRESHOLD_MIN,
    );

    if (swipeOffsetX.value >= threshold) {
      isDragging.value = false;
      suppressClick.value = true;
      swipeOffsetX.value = width + 24;
      swipeOpacity.value = 0;

      dismissTimer = setTimeout(function () {
        dismiss();
        dismissTimer = null;
      }, SWIPE_DISMISS_DURATION);
    } else {
      if (swipeOffsetX.value > SWIPE_START_DISTANCE) {
        suppressClick.value = true;
      }
      restorePosition();
    }

    resetPointerState();
  }

  function handlePointerCancel(event: PointerEvent) {
    if (!pointerMatches(event)) {
      return;
    }

    releaseCapture(event);
    restorePosition();
    resetPointerState();
  }

  function consumeSuppressedClick(): boolean {
    if (!suppressClick.value) {
      return false;
    }

    suppressClick.value = false;
    return true;
  }

  watch(isSwipeEnabled, function (enabled) {
    if (enabled) {
      return;
    }

    clearTimers();
    restorePosition();
    resetPointerState();
  });

  onUnmounted(function () {
    clearTimers();
  });

  return {
    isSwipeEnabled,
    swipeStyle,
    handlePointerDown,
    handlePointerMove,
    handlePointerUp,
    handlePointerCancel,
    consumeSuppressedClick,
  };
}

function useClickHandlers(
  toast: Ref<ToastInstance>,
  dismiss: () => void,
  shouldIgnoreClick?: () => boolean,
) {
  function handleClick(event: MouseEvent) {
    if (shouldIgnoreClick && shouldIgnoreClick()) {
      return;
    }

    const context = toToastContext(toast.value);

    if (toast.value.onClick) {
      toast.value.onClick(context, event);
    }

    if (toast.value.closeOnClick) {
      handleCloseClick();
    }
  }

  function handleCloseClick() {
    dismiss();
  }

  return {
    handleClick,
    handleCloseClick,
  };
}

function useButtons(toast: Ref<ToastInstance>, dismiss: () => void) {
  const buttons = computed<ToastButton[]>(function () {
    const items = toast.value.buttons?.buttons ?? [];
    return items.map(function (button) {
      if (!button.html) {
        return button;
      }
      return { ...button, html: applySanitizer(toast.value, button.html) };
    });
  });

  const buttonsLayout = computed<ToastButtonsLayout>(function () {
    return toast.value.buttons?.layout ?? "row";
  });

  const buttonsAlignment = computed<string>(function () {
    const alignment = toast.value.buttons?.alignment ?? "bottom-right";

    if (toast.value.alignment !== "right") {
      return alignment;
    }

    if (alignment.endsWith("-left")) {
      return alignment.replace(/-left$/, "-right");
    }

    if (alignment.endsWith("-right")) {
      return alignment.replace(/-right$/, "-left");
    }

    return alignment;
  });

  const hasButtons = computed(function () {
    return buttons.value.length > 0;
  });

  type ButtonsSide = "left" | "right";
  type ButtonsVertical = "top" | "center" | "bottom";

  const buttonsSide = computed<ButtonsSide>(function () {
    const alignment = buttonsAlignment.value;
    if (alignment.endsWith("-left")) {
      return "left";
    }
    return "right";
  });

  const buttonsVertical = computed<ButtonsVertical>(function () {
    const alignment = buttonsAlignment.value;
    if (alignment.startsWith("top-")) {
      return "top";
    }
    if (alignment.startsWith("bottom-")) {
      return "bottom";
    }
    return "center";
  });

  const buttonsPlacement = computed<ToastButtonsPlacement>(function () {
    if (buttonsLayout.value === "row") {
      return buttonsSide.value;
    }

    const vertical = buttonsVertical.value;
    if (vertical === "top") {
      return "top";
    }
    if (vertical === "bottom") {
      return "bottom";
    }
    return buttonsSide.value;
  });

  const isSidePlacement = computed(function () {
    return (
      buttonsPlacement.value === "left" || buttonsPlacement.value === "right"
    );
  });

  const buttonsJustifyClass = computed(function () {
    if (buttonsSide.value === "left") {
      return "tf-toast-actions--start";
    }
    return "tf-toast-actions--end";
  });

  const buttonsVarsStyle = computed<CSSProperties>(function () {
    return {
      "--tf-toast-buttons-gap": toast.value.buttons?.gap,
      "--tf-toast-buttons-content-gap": toast.value.buttons?.contentGap,
    } as CSSProperties;
  });

  const buttonsVerticalClass = computed(function () {
    if (!isSidePlacement.value) {
      return undefined;
    }

    const vertical = buttonsVertical.value;
    if (vertical === "bottom") {
      return "tf-toast-buttons--bottom";
    }
    if (vertical === "center") {
      return "tf-toast-buttons--center";
    }
    return undefined;
  });

  const buttonsClasses = computed(function () {
    return [
      "tf-toast-actions",
      buttonsJustifyClass.value,
      buttonsVerticalClass.value,
    ];
  });

  function handleButtonClick(button: ToastButton, event: MouseEvent) {
    const context = toToastContext(toast.value);

    if (button.dismissOnClick) {
      dismiss();
    }

    if (button.onClick) {
      button.onClick(context, event);
    }

    if (button.dismissAfterClick) {
      dismiss();
    }
  }

  return {
    hasButtons,
    buttons,
    buttonsPlacement,
    buttonsClasses,
    buttonsVarsStyle,
    handleButtonClick,
  };
}

function isInteractiveTarget(target: EventTarget | null): boolean {
  if (!(target instanceof Element)) {
    return false;
  }

  return Boolean(
    target.closest(
      "button, a, input, textarea, select, option, [role='button'], [contenteditable='true']",
    ),
  );
}

function toToastContext(toast: ToastInstance): ToastContext {
  return {
    id: toast.id,
    position: toast.position,
    type: toast.type,
    title: toast.title,
    description: toast.description,
    createdAt: toast.createdAt,
    containerId: toast.containerId,
  };
}

function normalizeWhitespace(value: string): string {
  return value.replace(/\s+/g, " ").trim();
}

function stripHtmlToText(value: string): string {
  if (!value) {
    return "";
  }

  const fallback = normalizeWhitespace(value.replace(/<[^>]*>/g, " "));

  if (typeof window === "undefined" || !window.DOMParser) {
    return fallback;
  }

  // DOMParser yields an inert document: unlike innerHTML on a detached
  // element, nothing loads or executes (e.g. <img onerror>), so untrusted
  // titles/descriptions are safe to strip even without supportHtml.
  try {
    const doc = new window.DOMParser().parseFromString(value, "text/html");
    return normalizeWhitespace(doc.body.textContent ?? "");
  } catch {
    return fallback;
  }
}
