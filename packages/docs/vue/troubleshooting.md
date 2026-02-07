---
title: Troubleshooting
outline: deep
---

# Troubleshooting

## No toast appears

Check all three points:

1. `createToastflow(...)` is called during app setup.
2. `<ToastContainer />` is rendered in active tree.
3. You call `toast.*` after store initialization.

## Error: store not initialized

```text
[vue-toastflow] Toast store not initialized. Did you install the plugin?
```

Cause: helper called before store exists.

Fix: initialize store with `app.use(createToastflow(...))` early in startup.

## Progress bar is missing

Possible reasons:

- `progressBar` is false.
- `duration` is `Infinity` or `0`.
- custom slot replaced progress renderer.

## Toast dismisses too fast or resets

Check:

- `duration`
- `pauseOnHover`
- `pauseStrategy`
- `update(...)` calls (visible update resets timer)
- duplicate behavior with `preventDuplicates: true`

## Duplicate toasts still appear

`preventDuplicates` compares only:

- `position`
- `type`
- `title`
- `description`

If any of these differ, toast is not treated as duplicate.

## Queue looks stuck

Likely causes:

- queue is paused (`pauseQueue` was called)
- no capacity (`maxVisible` still full)
- you are checking a different position stack

Call `resumeQueue()` and confirm current `state.queue` and `state.toasts`.

## `update` throws validation error

`update(id, options)` requires non-empty `title` or `description` in `options`.

Include at least one text field.

## HTML content renders unexpectedly

`supportHtml: true` uses `v-html`. Toastflow does not sanitize.

Use trusted HTML only.

## Animations feel off

Check:

- CSS class overrides in `animation`
- CSS variables `--tf-toast-animation-in-duration` and `--tf-toast-animation-out-duration`
- reduced motion user preference

## Next Diagnostics

- Inspect current state with `toast.getState()`.
- Observe events with `toast.subscribeEvents(...)`.
- Verify effective config with `toast.getConfig()`.
