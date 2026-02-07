---
title: Redirecting
outline: false
---

<script setup lang="ts">
import { onMounted } from "vue";
import { useRouter, withBase } from "vitepress";

const target = withBase("/guide/introduction");
const router = useRouter();

onMounted(() => {
  router.go(target);
});
</script>

# Redirecting To Introduction

If you are not redirected automatically, open [Introduction](/guide/introduction).
