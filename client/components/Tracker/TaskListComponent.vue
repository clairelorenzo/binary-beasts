<script setup lang="ts">
import { ref } from "vue";
import { fetchy } from "../../utils/fetchy";

// Enum for Difficulty
enum Difficulty {
  Difficult = "Difficult",
  JustRight = "JustRight",
  Easy = "Easy",
}

const emit = defineEmits(["refreshTasks"]);

interface Task {
  id: string;
  name: string;
  description: string;
  reps: number;
  sets: number;
  weight: number;
  completed: boolean;
  previousDifficulty: string;
}

const props = defineProps<{
  tasks: Task[];
}>();

const isLoading = ref(false);
const error = ref("");

const deleteTask = async (taskName: string) => {
  try {
    const response = await fetchy(`/api/tracking/tasks/${taskName}`, "DELETE");
    emit("refreshTasks");
  } catch (e) {
    alert("Failed to delete task.");
  }
};

const toggleTaskCompletion = async (task: Record<string, any>) => {
  try {
    const response = await fetchy(`/api/tracking/tasks/${task.name}/completed`, "POST", {});
    emit("refreshTasks");
    if (response.msg === "Success") {
      task.completed = task.completed === "true" ? false : true;
    }
  } catch (e) {
    console.error("Failed to toggle task completion:", e);
    error.value = "Could not update task status.";
  }
};

const promptChange = async (taskName: string, currentDifficulty: string) => {
  try {
    const response = await fetchy(`/api/tracking/tasks/${taskName}/prompt`, "POST", {
      body: {
        taskName: taskName,
        currentDifficulty: currentDifficulty,
      },
    });
    if (response.msg === "Success") {
      alert(`Suggestion for task "${taskName}": ${response.suggestion}`);
    }
  } catch (e) {
    console.error("Failed to prompt change:", e);
    error.value = "Failed to prompt change.";
  }
};

const modifyTask = async (taskName: string, reps: number, sets: number, weight: number, difficulty: string) => {
  try {
    const response = await fetchy(`/api/tracking/tasks/${taskName}`, "PATCH", {
      body: {
        reps,
        sets,
        weight,
        difficulty,
      },
    });
    emit("refreshTasks");
  } catch (e) {
    console.error("Failed to modify task:", e);
    error.value = "Failed to modify task.";
  }
};

const showModifyForm = ref<Record<string, any> | null>(null);

const openModifyForm = (task: Record<string, any>) => {
  showModifyForm.value = { ...task };
};

const closeModifyForm = () => {
  showModifyForm.value = null;
};

</script>

<template>
  <div class="container">
    <h2>Your Tasks This Week:</h2>
    <div v-if="isLoading">Loading tasks...</div>
    <div v-if="error" class="error">{{ error }}</div>
    <ul v-else class="task-list">
      <li v-for="task in tasks" :key="task.id" class="task-item">
        <div class="task-row">
          <div class="task-info">
            <h3 class="task-name">{{ task.name }}</h3>
            <p class="task-description">{{ task.description }}</p>
          </div>
          <input
            type="checkbox"
            :checked="task.completed"
            @change="toggleTaskCompletion(task)"
            class="completion-checkbox"
          />
          <div class="task-details">
            <div class="task-detail">
              <span class="bold">{{ task.reps }} reps x {{ task.sets }} sets</span>
            </div>
            <div class="task-detail">
              <span class="bold">Weight: {{ task.weight }} lbs</span>
            </div>
            <div class="task-detail">
              <label>Difficulty:</label>
              <span class="bold">{{ task.previousDifficulty }}</span>
            </div>
          </div>
          <div class="task-actions">
            <button class="delete-task-button" @click="deleteTask(task.name)" aria-label="Delete task">🗑️</button>
            <button @click="promptChange(task.name, task.previousDifficulty)">Prompt Change</button>
            <button @click="openModifyForm(task)" style="background-color: #cef5cb">Modify Task</button>
          </div>
        </div>
      </li>
    </ul>

    <!-- Modal for Modifying Task -->
    <div v-if="showModifyForm" class="modal-overlay">
      <div class="modal">
        <h3>Modify Task: {{ showModifyForm.name }}</h3>
        <form
          @submit.prevent="modifyTask(showModifyForm.name, showModifyForm.reps, showModifyForm.sets, showModifyForm.weight, showModifyForm.difficulty)"
        >
          <div>
            <label for="reps">Reps:</label>
            <input v-model="showModifyForm.reps" type="number" id="reps" required />
          </div>
          <div>
            <label for="sets">Sets:</label>
            <input v-model="showModifyForm.sets" type="number" id="sets" required />
          </div>
          <div>
            <label for="weight">Weight:</label>
            <input v-model="showModifyForm.weight" type="number" id="weight" required />
          </div>
          <div>
            <label for="difficulty">Difficulty:</label>
            <select v-model="showModifyForm.difficulty" id="difficulty" required>
              <option value="Difficult">Difficult</option>
              <option value="JustRight">JustRight</option>
              <option value="Easy">Easy</option>
            </select>
          </div>
          <div class="button-container">
            <button type="submit">Save Changes</button>
            <button type="button" @click="closeModifyForm">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<style scoped>

.container{
  overflow-y: scroll;
  height: 81vh;
}
h2 {
  color: var(--dblue);
}
.task-list {
  list-style: none;
  padding: 0;
}

.task-item {
  padding: 1em;
  border-radius: 10px;
  background-color: var(--sbeige); 
  border: 2px solid #4e70a3; /* Blue accent */
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  font-size: 1rem;
  transition:
    transform 0.2s ease-in-out,
    box-shadow 0.2s ease-in-out;
}

.task-item:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
}

.task-row {
  display: flex;
  justify-content: space-between;
  width: 100%;
}

.task-info {
  flex: 1;
}

.task-name {
  font-size: 1.2rem;
  margin: 0;
  color: var(--dblue);
}

.task-description {
  font-size: 0.9rem;
  color: #555;
  margin-top: 0.2em;
}

.task-details {
  display: flex;
  flex-direction: column;
  gap: 1em;
}

.task-detail {
  text-align: left;
}

.task-detail label {
  font-size: 0.9rem;
  display: block;
}

.bold {
  font-weight: bold;
}

.task-actions {
  margin-top: 1em;
  display: flex;
  /* flex-direction: column; */
  gap: 0.5em;
  align-items:flex-end;
}

.modify-task-form {
  margin-top: 1em;
}

button[type="submit"] {
  background-color: var(--lgreen);
  padding: 0.5em 1em;
  border: none;
  cursor: pointer;
}

button[type="button"] {
  background-color: red;
  padding: 0.5em 1em;
  border: none;
  cursor: pointer;
}

button[type="submit"]:hover,
button[type="button"]:hover {
  opacity: 0.8;
}

.button-container {
  display: flex;
  justify-content: flex-end;
  gap: 1em;
  margin-top: 1em;
}

.delete-task-button {
  background: none;
  border: none;
  background-color: rgb(199, 93, 93);
  font-size: 1.2rem;
  cursor: pointer;
}

.delete-task-button:hover {
  background-color: darkred;
}
input {
  height: 20%;
  width: 5%
}
</style>
