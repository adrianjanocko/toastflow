import { createToastStore as at } from "toastflow-core";
export * from "toastflow-core";
import { defineComponent as G, createElementBlock as l, openBlock as r, createElementVNode as u, normalizeClass as k, inject as st, ref as y, computed as d, watch as E, createCommentVNode as Z, renderSlot as K, createBlock as X, resolveDynamicComponent as it, toDisplayString as U, normalizeStyle as W, withModifiers as rt, createVNode as Y, onMounted as lt, onUnmounted as ct, Fragment as Q, renderList as J, TransitionGroup as ut, withCtx as dt } from "vue";
const _ = Symbol("toast-store");
let q = null;
function ft(t) {
  q = t;
}
function c() {
  if (!q)
    throw new Error(
      "[vue-toastflow] Toast store not initialized. Did you install the plugin?"
    );
  return q;
}
const le = {
  getState() {
    return c().getState();
  },
  subscribeEvents(t) {
    return c().subscribeEvents(t);
  },
  show(t) {
    return c().show(t);
  },
  loading(t, o) {
    return c().loading(t, o);
  },
  update(t, o) {
    return c().update(t, o);
  },
  dismiss(t) {
    return c().dismiss(t);
  },
  dismissAll() {
    return c().dismissAll();
  },
  pause(t) {
    return c().pause(t);
  },
  resume(t) {
    return c().resume(t);
  },
  getConfig() {
    return c().getConfig();
  },
  toast(t) {
    return c().show({ ...t, type: "default" });
  },
  success(t) {
    return c().show({ ...t, type: "success" });
  },
  error(t) {
    return c().show({ ...t, type: "error" });
  },
  info(t) {
    return c().show({ ...t, type: "info" });
  },
  warning(t) {
    return c().show({ ...t, type: "warning" });
  }
};
function ce(t = {}) {
  const o = at(t);
  return ft(o), {
    install(f) {
      f.provide(_, o);
    }
  };
}
const mt = { class: "tf-toast-progress" }, vt = /* @__PURE__ */ G({
  __name: "ToastProgress",
  props: {
    type: {}
  },
  setup(t) {
    return (o, f) => (r(), l("div", mt, [
      u("div", {
        class: k(["tf-toast-progress-bar", `tf-toast-progress-bar--${t.type}`])
      }, null, 2)
    ]));
  }
}), h = (t, o) => {
  const f = t.__vccOpts || t;
  for (const [v, g] of o)
    f[v] = g;
  return f;
}, ht = /* @__PURE__ */ h(vt, [["__scopeId", "data-v-ca0da064"]]), gt = {}, yt = {
  xmlns: "http://www.w3.org/2000/svg",
  viewBox: "0 0 24 24",
  fill: "currentColor"
};
function pt(t, o) {
  return r(), l("svg", yt, [...o[0] || (o[0] = [
    u("path", {
      "fill-rule": "evenodd",
      d: "M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12Zm13.36-1.814a.75.75 0 1 0-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 0 0-1.06 1.06l2.25 2.25a.75.75 0 0 0 1.14-.094l3.75-5.25Z",
      "clip-rule": "evenodd"
    }, null, -1)
  ])]);
}
const wt = /* @__PURE__ */ h(gt, [["render", pt]]), bt = {}, Ct = {
  xmlns: "http://www.w3.org/2000/svg",
  viewBox: "0 0 24 24",
  fill: "currentColor"
};
function At(t, o) {
  return r(), l("svg", Ct, [...o[0] || (o[0] = [
    u("path", {
      "fill-rule": "evenodd",
      d: "M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25Zm-1.72 6.97a.75.75 0 1 0-1.06 1.06L10.94 12l-1.72 1.72a.75.75 0 1 0 1.06 1.06L12 13.06l1.72 1.72a.75.75 0 1 0 1.06-1.06L13.06 12l1.72-1.72a.75.75 0 1 0-1.06-1.06L12 10.94l-1.72-1.72Z",
      "clip-rule": "evenodd"
    }, null, -1)
  ])]);
}
const kt = /* @__PURE__ */ h(bt, [["render", At]]), xt = {}, $t = {
  xmlns: "http://www.w3.org/2000/svg",
  viewBox: "0 0 24 24",
  fill: "currentColor"
};
function Mt(t, o) {
  return r(), l("svg", $t, [...o[0] || (o[0] = [
    u("path", {
      "fill-rule": "evenodd",
      d: "M5.25 9a6.75 6.75 0 0 1 13.5 0v.75c0 2.123.8 4.057 2.118 5.52a.75.75 0 0 1-.297 1.206c-1.544.57-3.16.99-4.831 1.243a3.75 3.75 0 1 1-7.48 0 24.585 24.585 0 0 1-4.831-1.244.75.75 0 0 1-.298-1.205A8.217 8.217 0 0 0 5.25 9.75V9Zm4.502 8.9a2.25 2.25 0 1 0 4.496 0 25.057 25.057 0 0 1-4.496 0Z",
      "clip-rule": "evenodd"
    }, null, -1)
  ])]);
}
const Lt = /* @__PURE__ */ h(xt, [["render", Mt]]), Tt = {}, Kt = {
  xmlns: "http://www.w3.org/2000/svg",
  viewBox: "0 0 24 24",
  fill: "currentColor"
};
function St(t, o) {
  return r(), l("svg", Kt, [...o[0] || (o[0] = [
    u("path", {
      "fill-rule": "evenodd",
      d: "M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12Zm8.706-1.442c1.146-.573 2.437.463 2.126 1.706l-.709 2.836.042-.02a.75.75 0 0 1 .67 1.34l-.04.022c-1.147.573-2.438-.463-2.127-1.706l.71-2.836-.042.02a.75.75 0 1 1-.671-1.34l.041-.022ZM12 9a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Z",
      "clip-rule": "evenodd"
    }, null, -1)
  ])]);
}
const Ht = /* @__PURE__ */ h(Tt, [["render", St]]), Bt = {}, Zt = {
  xmlns: "http://www.w3.org/2000/svg",
  viewBox: "0 0 24 24",
  fill: "currentColor"
};
function Wt(t, o) {
  return r(), l("svg", Zt, [...o[0] || (o[0] = [
    u("path", {
      "fill-rule": "evenodd",
      d: "M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12Zm11.378-3.917c-.89-.777-2.366-.777-3.255 0a.75.75 0 0 1-.988-1.129c1.454-1.272 3.776-1.272 5.23 0 1.513 1.324 1.513 3.518 0 4.842a3.75 3.75 0 0 1-.837.552c-.676.328-1.028.774-1.028 1.152v.75a.75.75 0 0 1-1.5 0v-.75c0-1.279 1.06-2.107 1.875-2.502.182-.088.351-.199.503-.331.83-.727.83-1.857 0-2.584ZM12 18a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Z",
      "clip-rule": "evenodd"
    }, null, -1)
  ])]);
}
const Et = /* @__PURE__ */ h(Bt, [["render", Wt]]), It = {}, Ft = {
  xmlns: "http://www.w3.org/2000/svg",
  viewBox: "0 0 24 24",
  fill: "currentColor"
};
function Ot(t, o) {
  return r(), l("svg", Ft, [...o[0] || (o[0] = [
    u("path", {
      "fill-rule": "evenodd",
      d: "M4.755 10.059a7.5 7.5 0 0 1 12.548-3.364l1.903 1.903h-3.183a.75.75 0 1 0 0 1.5h4.992a.75.75 0 0 0 .75-.75V4.356a.75.75 0 0 0-1.5 0v3.18l-1.9-1.9A9 9 0 0 0 3.306 9.67a.75.75 0 1 0 1.45.388Zm15.408 3.352a.75.75 0 0 0-.919.53 7.5 7.5 0 0 1-12.548 3.364l-1.902-1.903h3.183a.75.75 0 0 0 0-1.5H2.984a.75.75 0 0 0-.75.75v4.992a.75.75 0 0 0 1.5 0v-3.18l1.9 1.9a9 9 0 0 0 15.059-4.035.75.75 0 0 0-.53-.918Z",
      "clip-rule": "evenodd"
    }, null, -1)
  ])]);
}
const Rt = /* @__PURE__ */ h(It, [["render", Ot]]), jt = {}, zt = {
  xmlns: "http://www.w3.org/2000/svg",
  viewBox: "0 0 24 24",
  fill: "currentColor"
};
function Dt(t, o) {
  return r(), l("svg", zt, [...o[0] || (o[0] = [
    u("path", {
      "fill-rule": "evenodd",
      d: "M5.47 5.47a.75.75 0 0 1 1.06 0L12 10.94l5.47-5.47a.75.75 0 1 1 1.06 1.06L13.06 12l5.47 5.47a.75.75 0 1 1-1.06 1.06L12 13.06l-5.47 5.47a.75.75 0 0 1-1.06-1.06L10.94 12 5.47 6.53a.75.75 0 0 1 0-1.06Z",
      "clip-rule": "evenodd"
    }, null, -1)
  ])]);
}
const Pt = /* @__PURE__ */ h(jt, [["render", Dt]]), Vt = ["role", "aria-live"], Nt = ["aria-label"], Ut = { class: "tf-toast-surface" }, Xt = { class: "tf-toast-main" }, qt = { class: "tf-toast-body" }, Gt = { class: "tf-toast-text" }, Qt = ["aria-label"], Jt = ["aria-label", "innerHTML"], Yt = ["aria-label"], _t = ["aria-label", "innerHTML"], te = {
  key: 0,
  class: "tf-toast-created-at"
}, ee = ["aria-label"], ne = /* @__PURE__ */ G({
  __name: "Toast",
  props: {
    toast: {},
    progressResetKey: {},
    duplicateKey: {},
    updateKey: {},
    bumpAnimationClass: {},
    clearAllAnimationClass: {},
    updateAnimationClass: {}
  },
  emits: ["dismiss"],
  setup(t, { emit: o }) {
    const f = o, v = st(_, null);
    if (!v)
      throw new Error("[vue-toastflow] Plugin not installed");
    const g = v, p = y(!1), w = y(!1), A = y(!1), b = {
      success: {
        accent: "tf-toast-accent--success",
        icon: "tf-toast-icon--success",
        close: "tf-toast-close--success",
        component: wt
      },
      error: {
        accent: "tf-toast-accent--error",
        icon: "tf-toast-icon--error",
        close: "tf-toast-close--error",
        component: kt
      },
      warning: {
        accent: "tf-toast-accent--warning",
        icon: "tf-toast-icon--warning",
        close: "tf-toast-close--warning",
        component: Lt
      },
      info: {
        accent: "tf-toast-accent--info",
        icon: "tf-toast-icon--info",
        close: "tf-toast-close--info",
        component: Ht
      },
      default: {
        accent: "tf-toast-accent--default",
        icon: "tf-toast-icon--default",
        close: "tf-toast-close--default",
        component: Et
      },
      loading: {
        accent: "tf-toast-accent--loading",
        icon: "tf-toast-icon--loading",
        close: "tf-toast-close--loading",
        component: Rt
      }
    }, I = d(function() {
      return j.has(t.toast.type) ? "alert" : "status";
    }), F = d(function() {
      return j.has(t.toast.type) ? "assertive" : "polite";
    }), O = d(function() {
      return b[t.toast.type].accent;
    }), R = d(function() {
      return b[t.toast.type].icon;
    }), m = d(function() {
      return b[t.toast.type].close;
    }), S = d(function() {
      return b[t.toast.type].component;
    }), j = /* @__PURE__ */ new Set(["error", "warning"]), H = d(function() {
      return {
        "--tf-toast-progress-duration": `${t.toast.duration}ms`
      };
    }), z = function(i) {
      return new Date(i).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit"
      });
    }, B = d(function() {
      return !!(t.toast.showCreatedAt && Number.isFinite(t.toast.createdAt));
    }), x = d(function() {
      if (!B.value)
        return "";
      const i = typeof t.toast.createdAtFormatter == "function" ? t.toast.createdAtFormatter : z;
      try {
        return i(t.toast.createdAt);
      } catch {
        return z(t.toast.createdAt);
      }
    }), $ = d(function() {
      return x.value ? `Sent at ${x.value}` : "";
    }), M = d(function() {
      return e(t.toast.title);
    }), L = d(function() {
      return e(t.toast.description);
    }), C = d(function() {
      const i = [];
      return M.value && i.push(M.value), L.value && i.push(L.value), B.value && $.value && i.push($.value), i.length || i.push(`${t.toast.type} notification`), i.join(". ");
    });
    function e(i) {
      return i ? s(i) : "";
    }
    function s(i) {
      const T = n(i.replace(/<[^>]*>/g, " "));
      if (typeof window > "u" || !window.document)
        return T;
      try {
        const N = window.document.createElement("div");
        return N.innerHTML = i, n(N.textContent ?? "");
      } catch {
        return T;
      }
    }
    function n(i) {
      return i.replace(/\s+/g, " ").trim();
    }
    function a() {
      return {
        id: t.toast.id,
        position: t.toast.position,
        type: t.toast.type,
        title: t.toast.title,
        description: t.toast.description,
        createdAt: t.toast.createdAt
      };
    }
    function D(i) {
      const T = a();
      t.toast.onClick && t.toast.onClick(T, i), t.toast.closeOnClick && f("dismiss", t.toast.id);
    }
    function P() {
      f("dismiss", t.toast.id);
    }
    function tt() {
      t.toast.pauseOnHover && (p.value = !0, g.pause(t.toast.id));
    }
    function et() {
      t.toast.pauseOnHover && (p.value = !1, g.resume(t.toast.id));
    }
    const V = y(0);
    E(
      () => t.progressResetKey,
      function() {
        t.progressResetKey != null && (V.value += 1);
      }
    ), E(
      () => t.duplicateKey,
      function() {
        t.duplicateKey != null && (V.value += 1, nt());
      }
    ), E(
      () => t.updateKey,
      function() {
        t.updateKey != null && ot();
      }
    );
    function nt() {
      w.value = !1, requestAnimationFrame(function() {
        w.value = !0;
      });
    }
    function ot() {
      A.value = !1, requestAnimationFrame(function() {
        A.value = !0;
      });
    }
    return (i, T) => (r(), l("div", {
      role: I.value,
      "aria-live": F.value,
      class: "tf-toast-wrapper"
    }, [
      u("div", {
        class: k(["tf-toast", [
          O.value,
          w.value && t.toast.phase !== "leaving" && t.toast.phase !== "clear-all" && t.bumpAnimationClass,
          A.value && t.toast.phase !== "leaving" && t.toast.phase !== "clear-all" && t.updateAnimationClass,
          t.toast.phase === "clear-all" && t.clearAllAnimationClass,
          p.value && "tf-toast--paused"
        ]]),
        "aria-label": C.value || void 0,
        onClick: D,
        onMouseenter: tt,
        onMouseleave: et
      }, [
        u("div", Ut, [
          u("div", Xt, [
            u("div", {
              class: k(["tf-toast-icon", R.value]),
              "aria-hidden": "true"
            }, [
              K(i.$slots, "icon", { toast: t.toast }, () => [
                (r(), X(it(S.value), {
                  class: k(["tf-toast-icon-svg", [t.toast.type === "loading" && "tf-toast-icon-spin"]]),
                  "aria-hidden": "true"
                }, null, 8, ["class"]))
              ], !0)
            ], 2),
            u("div", qt, [
              u("div", Gt, [
                t.toast.title && !t.toast.supportHtml ? (r(), l("p", {
                  key: 0,
                  "aria-label": M.value || void 0,
                  class: "tf-toast-title"
                }, U(t.toast.title), 9, Qt)) : t.toast.title && t.toast.supportHtml ? (r(), l("p", {
                  key: 1,
                  class: "tf-toast-title",
                  "aria-label": M.value || void 0,
                  innerHTML: t.toast.title
                }, null, 8, Jt)) : Z("", !0),
                t.toast.description && !t.toast.supportHtml ? (r(), l("p", {
                  key: 2,
                  "aria-label": L.value || void 0,
                  class: "tf-toast-description"
                }, U(t.toast.description), 9, Yt)) : t.toast.description && t.toast.supportHtml ? (r(), l("p", {
                  key: 3,
                  class: "tf-toast-description",
                  "aria-label": L.value || void 0,
                  innerHTML: t.toast.description
                }, null, 8, _t)) : Z("", !0)
              ]),
              K(i.$slots, "default", { toast: t.toast }, void 0, !0),
              B.value ? (r(), l("div", te, [
                K(i.$slots, "created-at", {
                  toast: t.toast,
                  formatted: x.value
                }, () => [
                  u("span", {
                    "aria-label": $.value || void 0
                  }, U(x.value), 9, ee)
                ], !0)
              ])) : Z("", !0)
            ])
          ]),
          t.toast.progressBar ? (r(), l("div", {
            key: 0,
            class: "tf-toast-progress-wrapper",
            style: W(H.value)
          }, [
            K(i.$slots, "progress", { toast: t.toast }, () => [
              (r(), X(ht, {
                key: V.value,
                type: t.toast.type
              }, null, 8, ["type"]))
            ], !0)
          ], 4)) : Z("", !0)
        ]),
        t.toast.closeButton ? (r(), l("button", {
          key: 0,
          type: "button",
          class: k(["tf-toast-close", m.value]),
          "aria-label": "Close notification",
          onClick: rt(P, ["stop"])
        }, [
          K(i.$slots, "close-icon", { toast: t.toast }, () => [
            Y(Pt, {
              class: "tf-toast-close-icon",
              "aria-hidden": "true"
            })
          ], !0)
        ], 2)) : Z("", !0)
      ], 42, Nt)
    ], 8, Vt));
  }
}), oe = /* @__PURE__ */ h(ne, [["__scopeId", "data-v-edee5727"]]), ae = ["data-position"], se = /* @__PURE__ */ G({
  __name: "ToastContainer",
  setup(t) {
    const o = [
      "top-left",
      "top-center",
      "top-right",
      "bottom-left",
      "bottom-center",
      "bottom-right"
    ], f = c(), v = y([]), g = y({}), p = y({}), w = y({});
    let A = null, b = null;
    lt(function() {
      A = f.subscribe(function(e) {
        v.value = e.toasts;
      }), b = f.subscribeEvents(function(e) {
        e.kind === "timer-reset" && (g.value[e.id] = Math.random()), e.kind === "duplicate" && (p.value[e.id] = Math.random()), e.kind === "update" && (w.value[e.id] = Math.random());
      });
    }), ct(function() {
      A && A(), b && b();
    });
    function I(e) {
      return g.value[e] ?? 0;
    }
    function F(e) {
      return p.value[e] ?? 0;
    }
    function O(e) {
      return w.value[e] ?? 0;
    }
    const R = d(function() {
      const e = {
        "top-left": [],
        "top-center": [],
        "top-right": [],
        "bottom-left": [],
        "bottom-center": [],
        "bottom-right": []
      };
      for (const s of v.value)
        e[s.position].push(s);
      return e;
    }), m = f.getConfig(), S = y({
      "top-left": { ...m, position: "top-left" },
      "top-center": { ...m, position: "top-center" },
      "top-right": { ...m, position: "top-right" },
      "bottom-left": { ...m, position: "bottom-left" },
      "bottom-center": { ...m, position: "bottom-center" },
      "bottom-right": { ...m, position: "bottom-right" }
    }), j = d(function() {
      return v.value.length ? Math.max(...v.value.map((e) => e.zIndex)) : m.zIndex;
    });
    function H(e) {
      return S.value[e] ?? { ...m, position: e };
    }
    function z(e) {
      const { offset: s, width: n } = H(e), a = { width: n, maxWidth: "100%" };
      return e.startsWith("top-") && (a.top = s), e.startsWith("bottom-") && (a.bottom = s), e.endsWith("left") ? a.left = s : e.endsWith("right") ? a.right = s : e.endsWith("center") && (a.left = "50%", a.transform = "translateX(-50%)"), a;
    }
    function B(e) {
      return e.endsWith("left") ? "tf-toast-stack--left" : e.endsWith("center") ? "tf-toast-stack--center" : "tf-toast-stack--right";
    }
    function x(e) {
      return e.startsWith("bottom-") ? "tf-toast-stack-inner--bottom" : null;
    }
    function $(e) {
      f.dismiss(e);
    }
    function M(e) {
      const s = e, n = s.parentElement;
      if (!n || n.children.length <= 1)
        return;
      const a = s.offsetTop, D = n.clientHeight, P = n.clientWidth;
      n.style.minHeight = `${D}px`, s.style.position = "absolute", s.style.width = `${P}px`, s.style.left = "0", s.style.right = "0", s.style.top = `${a}px`;
    }
    function L(e) {
      const s = e, n = s.parentElement;
      n && (n.style.minHeight = ""), s.style.position = "", s.style.width = "", s.style.left = "", s.style.right = "", s.style.top = "";
    }
    E(
      v,
      function(e) {
        const s = new Set(
          e.map(function(n) {
            return n.id;
          })
        );
        for (const n of Object.keys(g.value))
          s.has(n) || delete g.value[n];
        for (const n of Object.keys(p.value))
          s.has(n) || delete p.value[n];
        for (const n of Object.keys(w.value))
          s.has(n) || delete w.value[n];
      },
      { deep: !1 }
    );
    function C(e) {
      return {
        ...m.animation,
        ...e.animation
      };
    }
    return E(
      R,
      function(e) {
        const s = { ...S.value };
        Object.keys(e).forEach(function(n) {
          const a = e[n][0];
          a && (s[n] = {
            ...m,
            ...a,
            position: n,
            animation: {
              ...m.animation,
              ...a.animation
            }
          });
        }), S.value = s;
      },
      { deep: !1 }
    ), (e, s) => (r(), l("div", {
      class: "tf-toast-root",
      style: W({ zIndex: j.value })
    }, [
      (r(), l(Q, null, J(o, (n) => u("div", {
        key: n,
        class: k(["tf-toast-stack", B(n)]),
        style: W(z(n))
      }, [
        Y(ut, {
          name: H(n).animation.name,
          onBeforeLeave: M,
          onAfterLeave: L,
          tag: "div",
          class: k(["tf-toast-stack-inner", x(n)]),
          style: W({ gap: H(n).gap })
        }, {
          default: dt(() => [
            (r(!0), l(Q, null, J(R.value[n], (a) => (r(), l("div", {
              key: a.id,
              class: "tf-toast-item",
              style: W({ width: a.width, maxWidth: "100%" }),
              "data-position": a.position
            }, [
              e.$slots.default ? K(e.$slots, "default", {
                key: 0,
                toast: a,
                progressResetKey: I(a.id),
                duplicateKey: F(a.id),
                updateKey: O(a.id),
                bumpAnimationClass: C(a).bump,
                clearAllAnimationClass: C(a).clearAll,
                updateAnimationClass: C(a).update,
                dismiss: $
              }, void 0, !0) : (r(), X(oe, {
                key: 1,
                toast: a,
                progressResetKey: I(a.id),
                duplicateKey: F(a.id),
                updateKey: O(a.id),
                bumpAnimationClass: C(a).bump,
                clearAllAnimationClass: C(a).clearAll,
                updateAnimationClass: C(a).update,
                onDismiss: $
              }, null, 8, ["toast", "progressResetKey", "duplicateKey", "updateKey", "bumpAnimationClass", "clearAllAnimationClass", "updateAnimationClass"]))
            ], 12, ae))), 128))
          ]),
          _: 2
        }, 1032, ["name", "class", "style"])
      ], 6)), 64))
    ], 4));
  }
}), ue = /* @__PURE__ */ h(se, [["__scopeId", "data-v-b00384d2"]]);
export {
  Rt as ArrowPath,
  Lt as Bell,
  wt as CheckCircle,
  Ht as InfoCircle,
  Et as QuestionMarkCircle,
  oe as Toast,
  ue as ToastContainer,
  ht as ToastProgress,
  kt as XCircle,
  Pt as XMark,
  ce as createToastflow,
  c as getToastStore,
  ft as setToastStore,
  le as toast
};
