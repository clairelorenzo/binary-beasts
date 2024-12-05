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
</template>

<style scoped>
.reset-tasks {
  text-align: center;
  margin-top: 20px;
}

.reset-button {
  background-color: #4e70a3; /* Deep blue */
  color: #f1efeb; /* Soft beige */
  padding: 12px 24px;
  font-size: 18px;
  font-family: 'Arial', sans-serif; /* Sporty font */
  border: none;
  border-radius: 12px;
  cursor: pointer;
  transition: background-color 0.3s, transform 0.2s;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.reset-button:hover {
  background-color: #cbdcf5; /* Light blue */
  transform: scale(1.05);
}

.reset-button:disabled {
  background-color: #cef5cb; /* Light green */
  color: #999;
  cursor: not-allowed;
  box-shadow: none;
}

.message {
  margin-top: 15px;
  font-size: 16px;
  font-family: 'Arial Black', sans-serif; /* Bold font for emphasis */
  color: #4e70a3; /* Deep blue */
}
</style>
