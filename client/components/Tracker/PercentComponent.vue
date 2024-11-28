<script setup lang="ts">
import { storeToRefs } from "pinia";
import { onMounted, ref } from "vue";
import { useUserStore } from "../../stores/user";
import { fetchy } from "../../utils/fetchy";

const { currentUsername } = storeToRefs(useUserStore());

const percentage = ref<number | null>(null);
const isLoading = ref(true);
const error = ref("");

const fetchPercentage = async () => {
  isLoading.value = true;
  error.value = "";
  try {
    const response = await fetchy("/api/tracking/percentage", "GET");
    percentage.value = response.percentage ?? 0;
  } catch (e) {
    error.value = "Failed to fetch completion percentage.";
  } finally {
    isLoading.value = false;
  }
};

onMounted(fetchPercentage);
</script>

<template>
  <div class="percentage-box">
    <h3>Task Completion Progress</h3>
    <div v-if="isLoading">Loading...</div>
    <div v-if="error" class="error">{{ error }}</div>
    <div v-else>
      <p>
        You've completed <strong>{{ percentage ?? 0 }}%</strong> of your tasks this week!
      </p>
      <div class="progress-bar">
        <div
          class="progress"
          :style="{ width: `${percentage ?? 0}%` }"
          aria-label="Completion progress"
        ></div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.percentage-box {
  margin: 1em 0;
  padding: 1em;
  border: 1px solid #ccc;
  border-radius: 8px;
  background-color: var(--secondary-bg);
  text-align: center;
}

.progress-bar {
  margin-top: 1em;
  height: 20px;
  background-color: #e0e0e0;
  border-radius: 10px;
  overflow: hidden;
  position: relative;
}

.progress {
  height: 100%;
  background-color: #76c7c0;
  transition: width 0.4s ease;
}
</style>
