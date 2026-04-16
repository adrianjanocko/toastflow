---
title: Introduction
description: Overview of Toastflow — a typed toast engine for Vue 3 and Nuxt with CSS-first theming and full layout control.
outline: deep
---

# Introduction

Toastflow is a toast notification system with a typed core (`toastflow-core`), a Vue 3 renderer (`vue-toastflow`), and a
Nuxt module wrapper (`nuxt-toastflow`).

## ⚡ Key Features

<div class="tf-feature-list">
  <div class="tf-feature-item">
    <p class="tf-feature-title"><span class="tf-feature-icon">🎯</span>Seamless Setup</p>
    <p class="tf-feature-text">Install the plugin, render one <code>&lt;ToastContainer /&gt;</code>, and start calling <code>toast.*</code> from anywhere.</p>
  </div>
  <div class="tf-feature-item">
    <p class="tf-feature-title"><span class="tf-feature-icon">🧩</span>Customizable</p>
    <p class="tf-feature-text">Tune layout, behavior, timers, queueing, and rendering with typed options and per-toast overrides.</p>
  </div>
  <div class="tf-feature-item">
    <p class="tf-feature-title"><span class="tf-feature-icon">⚙️</span>Deterministic Runtime</p>
    <p class="tf-feature-text">Predictable rules for duplicates, timer reset, queue processing, and clear-all transitions.</p>
  </div>
  <div class="tf-feature-item">
    <p class="tf-feature-title"><span class="tf-feature-icon">🎨</span>CSS-First Theming</p>
    <p class="tf-feature-text">Control the look with CSS variables and animation class names without rewriting runtime logic.</p>
  </div>
</div>

## 📦 Package Overview

<table>
  <colgroup>
    <col style="width: 150px;" />
    <col />
  </colgroup>
  <thead>
    <tr>
      <th>Package</th>
      <th>What it gives you</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><code>toastflow-core</code></td>
      <td><code>createToastStore</code>, all core types, loading helper, state subscriptions, event subscriptions</td>
    </tr>
    <tr>
      <td><code>vue-toastflow</code></td>
      <td><code>createToastflow</code>, <code>toast</code> helper, <code>&lt;ToastContainer /&gt;</code>, <code>&lt;Toast /&gt;</code>, <code>&lt;ToastProgress /&gt;</code>, icon components, default CSS</td>
    </tr>
    <tr>
      <td><code>nuxt-toastflow</code></td>
      <td>Nuxt module wrapper for <code>vue-toastflow</code>, auto-registered <code>ToastContainer</code>, auto-imported <code>toast</code> and optional <code>useToast</code></td>
    </tr>
  </tbody>
</table>

## 🔍 Runtime Model

1. A toast is created with `show` (or typed helpers like `toast.success`).
2. It enters state with `phase: "enter"`.
3. A timer is scheduled for finite durations.
4. Dismiss sets `phase: "leaving"` (or `"clear-all"`) and removes the toast after leave delay.
5. Queue processing fills empty visible slots when `queue: true`.

## 🧰 Additional Components

- `📦` [ToastContainer](/components/toast-container): stack renderer and slot entry-point.
- `🃏` [Toast](/components/toast): card UI with progress, actions, and accessibility logic.
- `📈` [ToastProgress](/components/toast-progress): animated progress strip.
- `🧭` [Icons](/components/icons): default type icon set.

## Read Next

- Setup and first toast: [Getting Started](/guide/getting-started)
- Live interactive snippets: [Live Examples](/guide/live-examples)
- Compare with other Vue toast options: [Comparisons](/comparisons/overview)
- Full runtime options: [Configuration](/api/configuration)
