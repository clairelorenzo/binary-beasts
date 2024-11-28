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
  background-color: #4caf50;
  color: white;
  padding: 10px 20px;
  font-size: 16px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.reset-button:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

.message {
  margin-top: 10px;
  font-size: 14px;
  color: #333;
}
</style>
