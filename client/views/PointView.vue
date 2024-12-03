<script setup lang="ts">
import { useUserStore } from "@/stores/user";
import { storeToRefs } from "pinia";
import PointBoardComponent from "@/components/Points/PointBoardComponent.vue";

const { currentUsername, isLoggedIn } = storeToRefs(useUserStore());
</script>

<template>
    <h1>Leaderboard component</h1>
  <PointBoardComponent />
</template>

<style scoped>
h1 {
  margin: 0 1em;
}
</style>
