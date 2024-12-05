<script setup lang="ts">
import { storeToRefs } from "pinia";
import { onMounted, ref } from "vue";
import { useUserStore } from "../../stores/user";
import { fetchy } from "../../utils/fetchy";

// Enum for Difficulty
enum Difficulty {
  Difficult = "Difficult",
  JustRight = "JustRight",
  Easy = "Easy",
}

const { currentUsername } = storeToRefs(useUserStore());

const tasks = ref<Array<Record<string, any>>>([]);
const isLoading = ref(true);
const error = ref("");

const fetchTasks = async () => {
  isLoading.value = true;
  error.value = "";
  try {
    const response = await fetchy("/api/tracking/tasks/", "GET", {
      query: { user: currentUsername.value },
    });
    tasks.value = response.tasks || [];
  } catch (e) {
    error.value = "Failed to fetch tasks.";
  } finally {
    isLoading.value = false;
  }
};

const deleteTask = async (taskName: string) => {
  try {
    const response = await fetchy(`/api/tracking/tasks/${taskName}`, "DELETE");
    if (response.msg === "Task deleted successfully!") {
      tasks.value = tasks.value?.filter((task) => task.name !== taskName);
    }
  } catch (e) {
    alert("Failed to delete task.");
  }
};

const toggleTaskCompletion = async (task: Record<string, any>) => {
  try {
    const response = await fetchy(
      `/api/tracking/tasks/${task.name}/completed`,
      "POST",
      {}
    );
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
    const response = await fetchy(
      `/api/tracking/tasks/${taskName}/prompt`,
      "POST",
      {
        body:
        {
        taskName:taskName,
        currentDifficulty: currentDifficulty,
      }
    }
    );
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
    const response = await fetchy(
      `/api/tracking/tasks/${taskName}`,
      "PATCH",
      {
        body:
        {
        reps,
        sets,
        weight,
        difficulty,
        }
      }
    );
    if (response.msg === "Task updated successfully!") {
      // Update the task locally after modification
      const updatedTask = response.task;
      const index = tasks.value.findIndex((task) => task.name === taskName);
      if (index !== -1) {
        tasks.value[index] = updatedTask;
      }
    }
  } catch (e) {
    console.error("Failed to modify task:", e);
    error.value = "Failed to modify task.";
  }
};

const showModifyForm = ref<Record<string, any> | null>(null);

const openModifyForm = (task: Record<string, any>) => {
  showModifyForm.value = { ...task }; // Pre-fill the form with the task's current values
};

const closeModifyForm = () => {
  showModifyForm.value = null;
};

onMounted(fetchTasks);
</script>

<template>
  <div class="">
    <h2>Your Tasks This Week: </h2>
    <div v-if="isLoading">Loading tasks...</div>
    <div v-if="error" class="error">{{ error }}</div>
    <ul v-else class="task-list">
      <li v-for="task in tasks" :key="task.id" class="task-item">
        <div class="task-header">
          <input
            type="checkbox"
            :checked="task.completed === true"
            @change="toggleTaskCompletion(task)"
            class="completion-checkbox"
          />
          <h3 class="task-name">Name: {{ task.name }}</h3>
          <button
            class="delete-task-button"
            @click="deleteTask(task.name)"
            aria-label="Delete task"
          >
          🗑️
          </button>
        </div>
        <p class="task-detail">Description: {{ task.description }}</p>
        <p class="task-detail">Reps: {{ task.reps }}</p>
        <p class="task-detail">Sets: {{ task.sets }}</p>
        <p class="task-detail">Weight: {{ task.weight }}</p>
        <p class="task-detail">
          Difficulty: {{ task.previousDifficulty }}
          <button
            class="prompt-button"
            @click="promptChange(task.name, task.previousDifficulty)"
          >
            Prompt Change
          </button>
        </p>
        <!-- Modify Task Button -->
        <button
          class="modify-task-button"
          @click="openModifyForm(task)"
        >
          Modify Task
        </button>
      </li>
    </ul>

    <!-- Modify Task Form -->
    <div v-if="showModifyForm" class="modify-task-form">
      <h3>Modify Task: {{ showModifyForm.name }}</h3>
      <form @submit.prevent="modifyTask(showModifyForm.name, showModifyForm.reps, showModifyForm.sets, showModifyForm.weight, showModifyForm.difficulty)">
        <div>
          <label for="reps">Reps:</label>
          <input
            v-model="showModifyForm.reps"
            type="number"
            min="0"
            id="reps"
            required
          />
        </div>
        <div>
          <label for="sets">Sets:</label>
          <input
            v-model="showModifyForm.sets"
            type="number"
            min="0"
            id="sets"
            required
          />
        </div>
        <div>
          <label for="weight">Weight:</label>
          <input
            v-model="showModifyForm.weight"
            type="number"
            min="0"
            id="weight"
            required
          />
        </div>
        <div>
          <label for="difficulty">Difficulty:</label>
          <select v-model="showModifyForm.difficulty" id="difficulty" required>
            <option value="Difficult">Difficult</option>
            <option value="JustRight">JustRight</option>
            <option value="Easy">Easy</option>
          </select>
        </div>
        <button type="submit">Save Changes</button>
        <button type="button" @click="closeModifyForm">Cancel</button>
      </form>
    </div>
  </div>
</template>

<style scoped>
/* General Task List Styles */
.task-list {
  margin-top: 1em;
  padding: 0;
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 1em;
}

.task-item {
  padding: 1em;
  border-radius: 10px;
  background-color: #F1EFEB; /* Light cream */
  border: 2px solid #4E70A3; /* Blue accent */
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  font-size: 1rem;
  transition: transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
}

.task-item:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
}

/* Task Header */
.task-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.5em;
}

.completion-checkbox {
  margin-right: 0.5em;
  transform: scale(1.2);
}

.task-name {
  margin: 0;
  font-size: 1.2rem;
  font-weight: bold;
  color: #4E70A3; /* Sporty Blue */
}

.task-detail {
  margin: 0.2em 0;
  font-size: 0.9rem;
  color: #6E6E6E; /* Neutral text */
}

/* Buttons */
button {
  border: none;
  border-radius: 8px;
  padding: 8px 12px;
  font-size: 0.9rem;
  cursor: pointer;
  transition: background-color 0.2s ease, color 0.2s ease;
}

.delete-task-button {
  background-color: #F08080; /* Light Red */
  color: white;
}

.delete-task-button:hover {
  background-color: #D9534F; /* Darker Red */
}

.prompt-button {
  background-color: #4E70A3; /* Sporty Blue */
  color: white;
}

.prompt-button:hover {
  background-color: #3E5B82; /* Darker Blue */
}

.modify-task-button {
  background-color: #CEF5CB; /* Fresh Green */
  color: #3A5F47; /* Dark Green */
}

.modify-task-button:hover {
  background-color: #A3D6A0; /* Darker Green */
}

/* Modify Task Form */
.modify-task-form {
  margin-top: 1em;
  padding: 1.5em;
  border-radius: 10px;
  background-color: #CBDCF5; /* Light Blue */
  border: 2px solid #4E70A3; /* Blue border */
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.modify-task-form h3 {
  margin-bottom: 1em;
  color: #4E70A3; /* Sporty Blue */
}

.modify-task-form label {
  display: block;
  font-size: 0.9rem;
  margin-bottom: 0.5em;
  color: #4E70A3;
}

.modify-task-form input,
.modify-task-form select {
  width: 100%;
  padding: 0.8em;
  margin-bottom: 1em;
  border: 1px solid #A3BFD4; /* Subtle Blue */
  border-radius: 8px;
  background-color: #F1EFEB; /* Light cream */
  font-size: 1rem;
  color: #4E70A3;
}

.modify-task-form button {
  padding: 0.8em 1.2em;
}

.modify-task-form button[type="submit"] {
  background-color: #4E70A3; /* Blue */
  color: white;
}

.modify-task-form button[type="submit"]:hover {
  background-color: #3E5B82; /* Darker Blue */
}

.modify-task-form button[type="button"] {
  background-color: #F1EFEB; /* Light cream */
  color: #4E70A3; /* Blue text */
}

.modify-task-form button[type="button"]:hover {
  background-color: #E5DBD5; /* Subtle Cream */
}
</style>
