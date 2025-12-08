import { createToastStore as xe } from "toastflow-core";
export * from "toastflow-core";
import { defineComponent as se, createElementBlock as f, openBlock as d, createElementVNode as m, normalizeClass as S, toRefs as $e, inject as me, computed as v, ref as k, watch as W, unref as e, createCommentVNode as j, renderSlot as K, createBlock as oe, resolveDynamicComponent as Me, toDisplayString as ne, normalizeStyle as D, withModifiers as Te, createVNode as he, onMounted as Se, onUnmounted as He, Fragment as pe, renderList as ve, TransitionGroup as Be, withCtx as Ke } from "vue";
const re = Symbol.for(
  "vue-toastflow.toast-store"
), ge = "__vue_toastflow_store__";
let R = null;
function We(o) {
  R = o;
  try {
    globalThis[ge] = o;
  } catch {
  }
}
function p() {
  if (R || (R = globalThis[ge] ?? null), !R)
    throw new Error(
      "[vue-toastflow] Toast store not initialized. Did you install the plugin?"
    );
  return R;
}
const St = {
  getState() {
    return p().getState();
  },
  subscribeEvents(o) {
    return p().subscribeEvents(o);
  },
  show(o) {
    return p().show(o);
  },
  loading(o, i) {
    return p().loading(o, i);
  },
  update(o, i) {
    return p().update(o, i);
  },
  dismiss(o) {
    return p().dismiss(o);
  },
  dismissAll() {
    return p().dismissAll();
  },
  pause(o) {
    return p().pause(o);
  },
  resume(o) {
    return p().resume(o);
  },
  getConfig() {
    return p().getConfig();
  },
  toast(o) {
    return p().show({ ...o, type: "default" });
  },
  success(o) {
    return p().show({ ...o, type: "success" });
  },
  error(o) {
    return p().show({ ...o, type: "error" });
  },
  info(o) {
    return p().show({ ...o, type: "info" });
  },
  warning(o) {
    return p().show({ ...o, type: "warning" });
  }
};
function Ht(o = {}) {
  const i = xe(o);
  return We(i), {
    install(L) {
      L.provide(re, i);
    }
  };
}
const Pe = { class: "tf-toast-progress" }, Ee = /* @__PURE__ */ se({
  __name: "ToastProgress",
  props: {
    type: {}
  },
  setup(o) {
    return (i, L) => (d(), f("div", Pe, [
      m("div", {
        class: S(["tf-toast-progress-bar", `tf-toast-progress-bar--${o.type}`])
      }, null, 2)
    ]));
  }
}), b = (o, i) => {
  const L = o.__vccOpts || o;
  for (const [s, C] of i)
    L[s] = C;
  return L;
}, Ze = /* @__PURE__ */ b(Ee, [["__scopeId", "data-v-ca0da064"]]), Oe = {}, Ie = {
  xmlns: "http://www.w3.org/2000/svg",
  viewBox: "0 0 24 24",
  fill: "currentColor"
};
function je(o, i) {
  return d(), f("svg", Ie, [...i[0] || (i[0] = [
    m("path", {
      "fill-rule": "evenodd",
      d: "M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12Zm13.36-1.814a.75.75 0 1 0-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 0 0-1.06 1.06l2.25 2.25a.75.75 0 0 0 1.14-.094l3.75-5.25Z",
      "clip-rule": "evenodd"
    }, null, -1)
  ])]);
}
const De = /* @__PURE__ */ b(Oe, [["render", je]]), Re = {}, Ue = {
  xmlns: "http://www.w3.org/2000/svg",
  viewBox: "0 0 24 24",
  fill: "currentColor"
};
function Fe(o, i) {
  return d(), f("svg", Ue, [...i[0] || (i[0] = [
    m("path", {
      "fill-rule": "evenodd",
      d: "M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25Zm-1.72 6.97a.75.75 0 1 0-1.06 1.06L10.94 12l-1.72 1.72a.75.75 0 1 0 1.06 1.06L12 13.06l1.72 1.72a.75.75 0 1 0 1.06-1.06L13.06 12l1.72-1.72a.75.75 0 1 0-1.06-1.06L12 10.94l-1.72-1.72Z",
      "clip-rule": "evenodd"
    }, null, -1)
  ])]);
}
const ze = /* @__PURE__ */ b(Re, [["render", Fe]]), Ne = {}, Ve = {
  xmlns: "http://www.w3.org/2000/svg",
  viewBox: "0 0 24 24",
  fill: "currentColor"
};
function Xe(o, i) {
  return d(), f("svg", Ve, [...i[0] || (i[0] = [
    m("path", {
      "fill-rule": "evenodd",
      d: "M5.25 9a6.75 6.75 0 0 1 13.5 0v.75c0 2.123.8 4.057 2.118 5.52a.75.75 0 0 1-.297 1.206c-1.544.57-3.16.99-4.831 1.243a3.75 3.75 0 1 1-7.48 0 24.585 24.585 0 0 1-4.831-1.244.75.75 0 0 1-.298-1.205A8.217 8.217 0 0 0 5.25 9.75V9Zm4.502 8.9a2.25 2.25 0 1 0 4.496 0 25.057 25.057 0 0 1-4.496 0Z",
      "clip-rule": "evenodd"
    }, null, -1)
  ])]);
}
const qe = /* @__PURE__ */ b(Ne, [["render", Xe]]), Ge = {}, Qe = {
  xmlns: "http://www.w3.org/2000/svg",
  viewBox: "0 0 24 24",
  fill: "currentColor"
};
function Ye(o, i) {
  return d(), f("svg", Qe, [...i[0] || (i[0] = [
    m("path", {
      "fill-rule": "evenodd",
      d: "M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12Zm8.706-1.442c1.146-.573 2.437.463 2.126 1.706l-.709 2.836.042-.02a.75.75 0 0 1 .67 1.34l-.04.022c-1.147.573-2.438-.463-2.127-1.706l.71-2.836-.042.02a.75.75 0 1 1-.671-1.34l.041-.022ZM12 9a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Z",
      "clip-rule": "evenodd"
    }, null, -1)
  ])]);
}
const Je = /* @__PURE__ */ b(Ge, [["render", Ye]]), et = {}, tt = {
  xmlns: "http://www.w3.org/2000/svg",
  viewBox: "0 0 24 24",
  fill: "currentColor"
};
function nt(o, i) {
  return d(), f("svg", tt, [...i[0] || (i[0] = [
    m("path", {
      "fill-rule": "evenodd",
      d: "M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12Zm11.378-3.917c-.89-.777-2.366-.777-3.255 0a.75.75 0 0 1-.988-1.129c1.454-1.272 3.776-1.272 5.23 0 1.513 1.324 1.513 3.518 0 4.842a3.75 3.75 0 0 1-.837.552c-.676.328-1.028.774-1.028 1.152v.75a.75.75 0 0 1-1.5 0v-.75c0-1.279 1.06-2.107 1.875-2.502.182-.088.351-.199.503-.331.83-.727.83-1.857 0-2.584ZM12 18a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Z",
      "clip-rule": "evenodd"
    }, null, -1)
  ])]);
}
const ot = /* @__PURE__ */ b(et, [["render", nt]]), st = {}, rt = {
  xmlns: "http://www.w3.org/2000/svg",
  viewBox: "0 0 24 24",
  fill: "currentColor"
};
function at(o, i) {
  return d(), f("svg", rt, [...i[0] || (i[0] = [
    m("path", {
      "fill-rule": "evenodd",
      d: "M4.755 10.059a7.5 7.5 0 0 1 12.548-3.364l1.903 1.903h-3.183a.75.75 0 1 0 0 1.5h4.992a.75.75 0 0 0 .75-.75V4.356a.75.75 0 0 0-1.5 0v3.18l-1.9-1.9A9 9 0 0 0 3.306 9.67a.75.75 0 1 0 1.45.388Zm15.408 3.352a.75.75 0 0 0-.919.53 7.5 7.5 0 0 1-12.548 3.364l-1.902-1.903h3.183a.75.75 0 0 0 0-1.5H2.984a.75.75 0 0 0-.75.75v4.992a.75.75 0 0 0 1.5 0v-3.18l1.9 1.9a9 9 0 0 0 15.059-4.035.75.75 0 0 0-.53-.918Z",
      "clip-rule": "evenodd"
    }, null, -1)
  ])]);
}
const it = /* @__PURE__ */ b(st, [["render", at]]), lt = {}, ct = {
  xmlns: "http://www.w3.org/2000/svg",
  viewBox: "0 0 24 24",
  fill: "currentColor"
};
function ut(o, i) {
  return d(), f("svg", ct, [...i[0] || (i[0] = [
    m("path", {
      "fill-rule": "evenodd",
      d: "M5.47 5.47a.75.75 0 0 1 1.06 0L12 10.94l5.47-5.47a.75.75 0 1 1 1.06 1.06L13.06 12l5.47 5.47a.75.75 0 1 1-1.06 1.06L12 13.06l-5.47 5.47a.75.75 0 0 1-1.06-1.06L10.94 12 5.47 6.53a.75.75 0 0 1 0-1.06Z",
      "clip-rule": "evenodd"
    }, null, -1)
  ])]);
}
const dt = /* @__PURE__ */ b(lt, [["render", ut]]), ft = ["role", "aria-live"], pt = ["aria-label"], vt = { class: "tf-toast-surface" }, mt = { class: "tf-toast-main" }, ht = { class: "tf-toast-body" }, gt = { class: "tf-toast-text" }, yt = ["aria-label"], _t = ["aria-label", "innerHTML"], wt = ["aria-label"], bt = ["aria-label", "innerHTML"], Ct = {
  key: 0,
  class: "tf-toast-created-at"
}, At = ["aria-label"], kt = /* @__PURE__ */ se({
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
  setup(o, { emit: i }) {
    const L = o, {
      toast: s,
      progressResetKey: C,
      duplicateKey: M,
      updateKey: H,
      bumpAnimationClass: B,
      clearAllAnimationClass: P,
      updateAnimationClass: E
    } = $e(L), U = i, F = me(re, null) ?? p(), T = {
      success: {
        accent: "tf-toast-accent--success",
        icon: "tf-toast-icon--success",
        close: "tf-toast-close--success",
        component: De
      },
      error: {
        accent: "tf-toast-accent--error",
        icon: "tf-toast-icon--error",
        close: "tf-toast-close--error",
        component: ze
      },
      warning: {
        accent: "tf-toast-accent--warning",
        icon: "tf-toast-icon--warning",
        close: "tf-toast-close--warning",
        component: qe
      },
      info: {
        accent: "tf-toast-accent--info",
        icon: "tf-toast-icon--info",
        close: "tf-toast-close--info",
        component: Je
      },
      default: {
        accent: "tf-toast-accent--default",
        icon: "tf-toast-icon--default",
        close: "tf-toast-close--default",
        component: ot
      },
      loading: {
        accent: "tf-toast-accent--loading",
        icon: "tf-toast-icon--loading",
        close: "tf-toast-close--loading",
        component: it
      }
    }, y = /* @__PURE__ */ new Set(["error", "warning"]), {
      accentClass: Z,
      iconWrapperClass: q,
      closeWrapperClass: O,
      defaultIconComponent: G
    } = we(s), {
      role: Q,
      ariaLive: Y,
      hasCreatedAt: z,
      createdAtText: N,
      createdAtAriaLabel: J,
      titleAriaLabel: A,
      descriptionAriaLabel: n,
      toastAriaLabel: u
    } = be(s), { progressStyle: r, showProgressBar: l, progressKeyLocal: ee } = Ce(
      s,
      C,
      M
    ), { isBumped: te, isUpdated: ye } = Ae(M, H), {
      isHovered: _e,
      handleMouseEnter: ae,
      handleMouseLeave: ie,
      handlePointerDown: le,
      handlePointerUp: V
    } = ke(s, F), { handleClick: ce, handleCloseClick: ue } = Le(s, U);
    function we(t) {
      const c = v(function() {
        return T[t.value.type].accent;
      }), a = v(function() {
        return T[t.value.type].icon;
      }), h = v(function() {
        return T[t.value.type].close;
      }), w = v(function() {
        return T[t.value.type].component;
      });
      return {
        accentClass: c,
        iconWrapperClass: a,
        closeWrapperClass: h,
        defaultIconComponent: w
      };
    }
    function be(t) {
      const c = v(function() {
        return y.has(t.value.type) ? "alert" : "status";
      }), a = v(function() {
        return y.has(t.value.type) ? "assertive" : "polite";
      }), h = v(function() {
        return !!(t.value.showCreatedAt && Number.isFinite(t.value.createdAt));
      }), w = v(function() {
        if (!h.value)
          return "";
        try {
          return t.value.createdAtFormatter(t.value.createdAt);
        } catch ($) {
          console.error(
            "[vue-toastflow] Something failed in createdAtFormatter",
            $
          );
        }
      }), _ = v(function() {
        return w.value ? `Sent at ${w.value}` : "";
      }), g = v(function() {
        return fe(t.value.title);
      }), I = v(function() {
        return fe(t.value.description);
      }), x = v(function() {
        const $ = [];
        return g.value && $.push(g.value), I.value && $.push(I.value), h.value && _.value && $.push(_.value), $.length || $.push(`${t.value.type} notification`), $.join(". ");
      });
      return {
        role: c,
        ariaLive: a,
        hasCreatedAt: h,
        createdAtText: w,
        createdAtAriaLabel: _,
        titleAriaLabel: g,
        descriptionAriaLabel: I,
        toastAriaLabel: x
      };
    }
    function Ce(t, c, a) {
      const h = v(function() {
        return {
          "--tf-toast-progress-duration": `${t.value.duration}ms`
        };
      }), w = v(function() {
        return t.value.progressBar && Number.isFinite(t.value.duration) && t.value.duration > 0;
      }), _ = k(0);
      return W(
        () => c?.value,
        function(g) {
          g != null && (_.value += 1);
        }
      ), W(
        () => a?.value,
        function(g) {
          g != null && (_.value += 1);
        }
      ), {
        progressStyle: h,
        showProgressBar: w,
        progressKeyLocal: _
      };
    }
    function Ae(t, c) {
      const a = k(!1), h = k(!1);
      function w() {
        a.value = !1, requestAnimationFrame(function() {
          a.value = !0;
        });
      }
      function _() {
        h.value = !1, requestAnimationFrame(function() {
          h.value = !0;
        });
      }
      return W(
        () => t?.value,
        function(g) {
          g != null && w();
        }
      ), W(
        () => c?.value,
        function(g) {
          g != null && _();
        }
      ), {
        isBumped: a,
        isUpdated: h
      };
    }
    function ke(t, c) {
      const a = k(!1);
      function h() {
        t.value.pauseOnHover && (a.value = !0, c.pause(t.value.id));
      }
      function w() {
        t.value.pauseOnHover && (a.value = !1, c.resume(t.value.id));
      }
      function _(x) {
        return x.pointerType === "touch" || x.pointerType === "pen";
      }
      function g(x) {
        t.value.pauseOnHover && _(x) && (a.value = !0, c.pause(t.value.id));
      }
      function I(x) {
        t.value.pauseOnHover && _(x) && (a.value = !1, c.resume(t.value.id));
      }
      return {
        isHovered: a,
        handleMouseEnter: h,
        handleMouseLeave: w,
        handlePointerDown: g,
        handlePointerUp: I
      };
    }
    function Le(t, c) {
      function a() {
        return {
          id: t.value.id,
          position: t.value.position,
          type: t.value.type,
          title: t.value.title,
          description: t.value.description,
          createdAt: t.value.createdAt
        };
      }
      function h(_) {
        const g = a();
        t.value.onClick && t.value.onClick(g, _), t.value.closeOnClick && c("dismiss", t.value.id);
      }
      function w() {
        c("dismiss", t.value.id);
      }
      return {
        handleClick: h,
        handleCloseClick: w
      };
    }
    function de(t) {
      return t.replace(/\s+/g, " ").trim();
    }
    function fe(t) {
      if (!t)
        return "";
      const c = de(t.replace(/<[^>]*>/g, " "));
      if (typeof window > "u" || !window.document)
        return c;
      try {
        const a = window.document.createElement("div");
        return a.innerHTML = t, de(a.textContent ?? "");
      } catch {
        return c;
      }
    }
    return (t, c) => (d(), f("div", {
      role: e(Q),
      "aria-live": e(Y),
      class: "tf-toast-wrapper"
    }, [
      m("div", {
        class: S(["tf-toast", [
          e(Z),
          e(te) && e(s).phase !== "leaving" && e(s).phase !== "clear-all" && e(B),
          e(ye) && e(s).phase !== "leaving" && e(s).phase !== "clear-all" && e(E),
          e(s).phase === "clear-all" && e(P),
          e(_e) && "tf-toast--paused"
        ]]),
        "aria-label": e(u) || void 0,
        onClick: c[1] || (c[1] = //@ts-ignore
        (...a) => e(ce) && e(ce)(...a)),
        onMouseenter: c[2] || (c[2] = //@ts-ignore
        (...a) => e(ae) && e(ae)(...a)),
        onMouseleave: c[3] || (c[3] = //@ts-ignore
        (...a) => e(ie) && e(ie)(...a)),
        onPointerdown: c[4] || (c[4] = //@ts-ignore
        (...a) => e(le) && e(le)(...a)),
        onPointerup: c[5] || (c[5] = //@ts-ignore
        (...a) => e(V) && e(V)(...a)),
        onPointercancel: c[6] || (c[6] = //@ts-ignore
        (...a) => e(V) && e(V)(...a))
      }, [
        m("div", vt, [
          m("div", mt, [
            m("div", {
              class: S(["tf-toast-icon", e(q)]),
              "aria-hidden": "true"
            }, [
              K(t.$slots, "icon", { toast: e(s) }, () => [
                (d(), oe(Me(e(G)), {
                  class: S(["tf-toast-icon-svg", [e(s).type === "loading" && "tf-toast-icon-spin"]]),
                  "aria-hidden": "true"
                }, null, 8, ["class"]))
              ], !0)
            ], 2),
            m("div", ht, [
              m("div", gt, [
                e(s).title && !e(s).supportHtml ? (d(), f("p", {
                  key: 0,
                  "aria-label": e(A) || void 0,
                  class: "tf-toast-title"
                }, ne(e(s).title), 9, yt)) : e(s).title && e(s).supportHtml ? (d(), f("p", {
                  key: 1,
                  class: "tf-toast-title",
                  "aria-label": e(A) || void 0,
                  innerHTML: e(s).title
                }, null, 8, _t)) : j("", !0),
                e(s).description && !e(s).supportHtml ? (d(), f("p", {
                  key: 2,
                  "aria-label": e(n) || void 0,
                  class: "tf-toast-description"
                }, ne(e(s).description), 9, wt)) : e(s).description && e(s).supportHtml ? (d(), f("p", {
                  key: 3,
                  class: "tf-toast-description",
                  "aria-label": e(n) || void 0,
                  innerHTML: e(s).description
                }, null, 8, bt)) : j("", !0)
              ]),
              K(t.$slots, "default", { toast: e(s) }, void 0, !0),
              e(z) ? (d(), f("div", Ct, [
                K(t.$slots, "created-at", {
                  toast: e(s),
                  formatted: e(N)
                }, () => [
                  m("span", {
                    "aria-label": e(J) || void 0
                  }, ne(e(N)), 9, At)
                ], !0)
              ])) : j("", !0)
            ])
          ]),
          e(l) ? (d(), f("div", {
            key: 0,
            class: "tf-toast-progress-wrapper",
            style: D(e(r))
          }, [
            K(t.$slots, "progress", { toast: e(s) }, () => [
              (d(), oe(Ze, {
                key: e(ee),
                type: e(s).type
              }, null, 8, ["type"]))
            ], !0)
          ], 4)) : j("", !0)
        ]),
        e(s).closeButton ? (d(), f("button", {
          key: 0,
          type: "button",
          class: S(["tf-toast-close", e(O)]),
          "aria-label": "Close notification",
          onClick: c[0] || (c[0] = Te(
            //@ts-ignore
            (...a) => e(ue) && e(ue)(...a),
            ["stop"]
          ))
        }, [
          K(t.$slots, "close-icon", { toast: e(s) }, () => [
            he(dt, {
              class: "tf-toast-close-icon",
              "aria-hidden": "true"
            })
          ], !0)
        ], 2)) : j("", !0)
      ], 42, pt)
    ], 8, ft));
  }
}), Lt = /* @__PURE__ */ b(kt, [["__scopeId", "data-v-763aeb72"]]), xt = ["data-position"], $t = /* @__PURE__ */ se({
  __name: "ToastContainer",
  setup(o) {
    const i = [
      "top-left",
      "top-center",
      "top-right",
      "bottom-left",
      "bottom-center",
      "bottom-right"
    ], s = me(re, null) ?? p(), C = k([]), M = k({}), H = k({}), B = k({});
    let P = null, E = null;
    Se(function() {
      P = s.subscribe(function(n) {
        C.value = n.toasts;
      }), E = s.subscribeEvents(function(n) {
        n.kind === "timer-reset" && (M.value[n.id] = Math.random()), n.kind === "duplicate" && (H.value[n.id] = Math.random()), n.kind === "update" && (B.value[n.id] = Math.random());
      });
    }), He(function() {
      P && P(), E && E();
    });
    function U(n) {
      return M.value[n] ?? 0;
    }
    function X(n) {
      return H.value[n] ?? 0;
    }
    function F(n) {
      return B.value[n] ?? 0;
    }
    const T = v(function() {
      const n = {
        "top-left": [],
        "top-center": [],
        "top-right": [],
        "bottom-left": [],
        "bottom-center": [],
        "bottom-right": []
      };
      for (const u of C.value)
        n[u.position].push(u);
      return n;
    }), y = s.getConfig(), Z = k({
      "top-left": { ...y, position: "top-left" },
      "top-center": { ...y, position: "top-center" },
      "top-right": { ...y, position: "top-right" },
      "bottom-left": { ...y, position: "bottom-left" },
      "bottom-center": { ...y, position: "bottom-center" },
      "bottom-right": { ...y, position: "bottom-right" }
    }), q = v(function() {
      return C.value.length ? Math.max(...C.value.map((n) => n.zIndex)) : y.zIndex;
    });
    function O(n) {
      return Z.value[n] ?? { ...y, position: n };
    }
    function G(n) {
      const { offset: u, width: r } = O(n), l = { width: r, maxWidth: "100%" };
      return n.startsWith("top-") && (l.top = u), n.startsWith("bottom-") && (l.bottom = u), n.endsWith("left") ? l.left = u : n.endsWith("right") ? l.right = u : n.endsWith("center") && (l.left = "50%", l.transform = "translateX(-50%)"), l;
    }
    function Q(n) {
      return n.endsWith("left") ? "tf-toast-stack--left" : n.endsWith("center") ? "tf-toast-stack--center" : "tf-toast-stack--right";
    }
    function Y(n) {
      return n.startsWith("bottom-") ? "tf-toast-stack-inner--bottom" : null;
    }
    function z(n) {
      s.dismiss(n);
    }
    function N(n) {
      const u = n, r = u.parentElement;
      if (!r || r.children.length <= 1)
        return;
      const l = u.offsetTop, ee = r.clientHeight, te = r.clientWidth;
      r.style.minHeight = `${ee}px`, u.style.position = "absolute", u.style.width = `${te}px`, u.style.left = "0", u.style.right = "0", u.style.top = `${l}px`;
    }
    function J(n) {
      const u = n, r = u.parentElement;
      r && (r.style.minHeight = ""), u.style.position = "", u.style.width = "", u.style.left = "", u.style.right = "", u.style.top = "";
    }
    W(
      C,
      function(n) {
        const u = new Set(
          n.map(function(r) {
            return r.id;
          })
        );
        for (const r of Object.keys(M.value))
          u.has(r) || delete M.value[r];
        for (const r of Object.keys(H.value))
          u.has(r) || delete H.value[r];
        for (const r of Object.keys(B.value))
          u.has(r) || delete B.value[r];
      },
      { deep: !1 }
    );
    function A(n) {
      return {
        ...y.animation,
        ...n.animation
      };
    }
    return W(
      T,
      function(n) {
        const u = { ...Z.value };
        Object.keys(n).forEach(function(r) {
          const l = n[r][0];
          l && (u[r] = {
            ...y,
            ...l,
            position: r,
            animation: {
              ...y.animation,
              ...l.animation
            }
          });
        }), Z.value = u;
      },
      { deep: !1 }
    ), (n, u) => (d(), f("div", {
      class: "tf-toast-root",
      style: D({ zIndex: q.value })
    }, [
      (d(), f(pe, null, ve(i, (r) => m("div", {
        key: r,
        class: S(["tf-toast-stack", Q(r)]),
        style: D(G(r))
      }, [
        he(Be, {
          name: O(r).animation.name,
          onBeforeLeave: N,
          onAfterLeave: J,
          tag: "div",
          class: S(["tf-toast-stack-inner", Y(r)]),
          style: D({ gap: O(r).gap })
        }, {
          default: Ke(() => [
            (d(!0), f(pe, null, ve(T.value[r], (l) => (d(), f("div", {
              key: l.id,
              class: "tf-toast-item",
              style: D({ width: l.width, maxWidth: "100%" }),
              "data-position": l.position
            }, [
              n.$slots.default ? K(n.$slots, "default", {
                key: 0,
                toast: l,
                progressResetKey: U(l.id),
                duplicateKey: X(l.id),
                updateKey: F(l.id),
                bumpAnimationClass: A(l).bump,
                clearAllAnimationClass: A(l).clearAll,
                updateAnimationClass: A(l).update,
                dismiss: z
              }, void 0, !0) : (d(), oe(Lt, {
                key: 1,
                toast: l,
                progressResetKey: U(l.id),
                duplicateKey: X(l.id),
                updateKey: F(l.id),
                bumpAnimationClass: A(l).bump,
                clearAllAnimationClass: A(l).clearAll,
                updateAnimationClass: A(l).update,
                onDismiss: z
              }, null, 8, ["toast", "progressResetKey", "duplicateKey", "updateKey", "bumpAnimationClass", "clearAllAnimationClass", "updateAnimationClass"]))
            ], 12, xt))), 128))
          ]),
          _: 2
        }, 1032, ["name", "class", "style"])
      ], 6)), 64))
    ], 4));
  }
}), Bt = /* @__PURE__ */ b($t, [["__scopeId", "data-v-65f94eb4"]]);
export {
  it as ArrowPath,
  qe as Bell,
  De as CheckCircle,
  Je as InfoCircle,
  ot as QuestionMarkCircle,
  Lt as Toast,
  Bt as ToastContainer,
  Ze as ToastProgress,
  ze as XCircle,
  dt as XMark,
  Ht as createToastflow,
  p as getToastStore,
  We as setToastStore,
  St as toast
};
