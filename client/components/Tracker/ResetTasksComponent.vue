<script setup lang="ts">
import { ref } from "vue";
import { fetchy } from "../../utils/fetchy";

const isLoading = ref(false);
const message = ref<string | null>(null);

const resetTasks = async () => {
  isLoading.value = true;
  try {
    const response = await fetchy("/api/tracking/tasks/reset", "POST");
    if (response && response.msg) {
      message.value = response.msg;
    } else {
      message.value = "An error occurred while resetting tasks.";
    }
  } catch (error) {
    message.value = "An error occurred while resetting tasks.";
  } finally {
    isLoading.value = false;
  }
};
</script>

<template>
  <div class="reset-tasks">
    <button @click="resetTasks" :disabled="isLoading" class="reset-button">
      {{ isLoading ? "Resetting..." : "Reset All Tasks" }}
    </button>
    <p v-if="message" class="message">{{ message }}</p>
  </div>
  <h2> Make sure to reset all tasks at the end of each day to log your workout of the day and add to your history!</h2>
</template>

<style scoped>
.reset-tasks {
  text-align: center;
  margin-top: 20px;
}

.reset-button {
  background-color: var(--dblue);
  color: var(--sbeige);
  padding: 12px 24px;
  font-size: 18px;
  font-family: "Arial", sans-serif;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  transition:
    background-color 0.3s,
    transform 0.2s;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.reset-button:hover {
  background-color: var(--lblue);
  transform: scale(1.05);
}

.reset-button:disabled {
  background-color: var(--lgreen); /* Light green */
  color: #999;
  cursor: not-allowed;
  box-shadow: none;
}

.message {
  margin-top: 15px;
  font-size: 16px;
  font-family: "Arial Black", sans-serif; /* Bold font for emphasis */
  color: var(--dblue); /* Deep blue */
}

h2 {
  color: var(--dblue);
  font-family: "Arial", sans-serif;
  font-size: small;
  text-align: center;
}
</style>
