<script setup lang="ts">
import { storeToRefs } from "pinia";
import { onMounted, ref } from "vue";
import { useUserStore } from "../../stores/user";
import { fetchy } from "../../utils/fetchy";

const { currentUsername } = storeToRefs(useUserStore());


const tasks = ref<Array<Record<string, string>>>();
const isLoading = ref(true);
const error = ref("");

const fetchTasks = async () => {
  isLoading.value = true;
  error.value = "";
  try {
    const response = await fetchy("/api/tracking/tasks/", "GET", { query: { user: currentUsername.value } });
    console.log(response)
    tasks.value = await response.tasks;
  } catch (e) {
    error.value = "Failed to fetch tasks.";
  } finally {
    isLoading.value = false;
  }
};

onMounted(fetchTasks);

defineExpose({ fetchTasks });
</script>

<template>
  <div class="">
    <h2>Your Tasks</h2>
    <div v-if="isLoading">Loading tasks...</div>
    <div v-if="error" class="error">{{ error }}</div>
    <ul v-else>
      <li v-for="task in tasks" :key="task.id" class="task-item">
        <div class="task-header">
            <h3> Name: {{task.name}}   </h3>  
            <input
            type="checkbox"
            :checked=true if task.completed="true" else false
            class="completion-checkbox"
        />
        
        </div>
        
        <p class="task-detail">Description: {{ task.description }}</p>
        <p class="task-detail">Reps: {{ task.reps }}</p>
        <p class="task-detail">Sets: {{ task.sets }}</p>
        <p class="task-detail">Weight: {{ task.weight }}</p>
        <p class="task-detail">Difficulty: {{ task.previousDifficulty }}</p>
      </li>
    </ul>
  </div>
</template>

<style scoped>
.task-list {
  margin-top: 1em;
  padding: 0;
  list-style: none;
}

.task-item {
  margin-bottom: 0.5em;
  padding: 0.5em;
  border-radius: 0.5em;
  background-color: var(--secondary-bg);
  font-size: 0.9rem;
}

.task-header {
  display: flex;
  align-items: center;
  margin-bottom: 0.2em;
}

.completion-checkbox {
  margin-right: 0.5em;
}

.task-name {
  margin: 0;
  font-size: 1rem;
}

.task-detail {
  margin: 0.2em 0;
  font-size: 0.8rem;
  color: #555;
}
</style>