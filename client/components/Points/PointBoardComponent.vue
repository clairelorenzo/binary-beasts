<script setup lang="ts">
import { useUserStore } from "@/stores/user";
import { fetchy } from "@/utils/fetchy";
import { storeToRefs } from "pinia";
import { onBeforeMount, onUpdated, ref } from "vue";

const { isLoggedIn } = storeToRefs(useUserStore());

const loaded = ref(false);
const topPoints = ref<Array<Record<string, string>>>();
const currentPoints = ref<number | undefined>(undefined);

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
  loaded.value = true;
});

onUpdated(async () => {
  if (isLoggedIn.value) await getPoints();
});
</script>

<template>
  <section>
    <h3 v-if="isLoggedIn">Current Points: {{ currentPoints }}</h3>
  </section>
  <section class="board" v-if="loaded">
    <article class="boardRow" v-for="point in topPoints" :key="point._id">
      <strong>{{ point.owner }}</strong>
      <h3>{{ point.points }}</h3>
    </article>
  </section>
</template>

<style scoped>
* {
  display: flex;
  color: var(--dblue);
}

section,
article,
p {
  margin: 0 1em;
}

.board {
  flex-direction: column;
  background-color: var(--sbeige);
  border-radius: 1em;
  border: 2px solid var(--dblue);
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

.boardRow > h3 {
  margin-left: 1em;
}

.boardRow:last-child {
  border: none;
}
</style>
