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
    <div v-if="isLoading" class="loading">Loading...</div>
    <div v-if="error" class="error">{{ error }}</div>
    <div v-else>
      <p>
        You've completed <strong>{{ percentage ?? 0 }}%</strong> of your tasks this week!
      </p>
      <div class="progress-bar">
        <div class="progress" :style="{ width: `${percentage ?? 0}%` }" aria-label="Completion progress"></div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.percentage-box {
  margin: 1.5em 0;
  padding: 1.5em;
  border: 2px solid var(--dblue); /* Light Blue */
  border-radius: 12px;
  background-color: var(--sbeige); /* Soft Beige */
  text-align: center;
  font-family: "Arial", sans-serif; /* Sporty font */
  color: var(--dblue); /* Deep Blue */
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

h3 {
  margin-bottom: 1em;
  font-size: 20px;
  color: var(--dblue); /* Deep Blue */
}

.loading,
.error {
  font-size: 16px;
  color: #e57373; /* Soft red for error */
}

.progress-bar {
  margin-top: 1.5em;
  height: 24px;
  background-color: var(--lgreen); /* Light Green */
  border-radius: 12px;
  overflow: hidden;
  position: relative;
}

.progress {
  height: 100%;
  background-color: var(--dblue); /* Deep Blue */
  transition: width 0.4s ease;
}

p {
  font-size: 16px;
}

strong {
  color: var(--dblue); /* Deep Blue */
  font-weight: bold;
}
</style>
