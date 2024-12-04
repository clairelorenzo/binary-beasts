<script setup lang="ts">
import { useUserStore } from "@/stores/user";
import { fetchy } from "@/utils/fetchy";
import { storeToRefs } from "pinia";
import { onBeforeMount, ref } from "vue";

const { currentUsername, isLoggedIn } = storeToRefs(useUserStore());

const loaded = ref(false);
const topPoints = ref<Array<Record<string, string>>>();
const currentPoints = ref(0);

async function getBoard() {
  let postResults;
  try {
    postResults = await fetchy("/api/pointing/top", "GET");
  } catch (_) {
    return;
  }
  topPoints.value = postResults;
}

async function getPoints() {
  let pointsResult;
  try {
    pointsResult = await fetchy("/api/pointing", "GET");
  } catch (_) {
    return;
  }
  currentPoints.value = pointsResult.points;
}

onBeforeMount(async () => {
  await getBoard();
  await getPoints();
  loaded.value = true;
});
</script>

<template>
  <section>
    <h3>Current Points: {{ currentPoints }}</h3>
  </section>
  <section class="board" v-if="loaded">
    <article class="boardRow" v-for="point in topPoints">
      <h2>{{ point.owner }}</h2>
      <p>{{ point.points }}</p>
    </article>
  </section>
</template>

<style scoped>
* {
  display: flex;
}

section,
article,
p {
  margin: 0 1em;
}

.board {
  flex-direction: column;
  background-color: var(--base-bg);
  border-radius: 1em;
}

.row,
.boardRow {
  flex-direction: row;
  align-items: baseline;
}

.boardRow {
  justify-content: space-between;
  border-bottom: solid;
}

.boardRow:last-child {
  border: none;
}
</style>
