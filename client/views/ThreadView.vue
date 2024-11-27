<script setup lang="ts">
import ThreadListComponent from "@/components/Forum/ThreadListComponent.vue";
import { useUserStore } from "@/stores/user";
import { storeToRefs } from "pinia";

const { currentUsername, isLoggedIn } = storeToRefs(useUserStore());
</script>

<template>
  <main>
    <ThreadListComponent />
  </main>
</template>

<style scoped>
h1 {
  text-align: center;
}
</style>
