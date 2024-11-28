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

.delete-task-button {
  background: none;
  border: none;
  color: red;
  font-size: 1.2rem;
  cursor: pointer;
}

.delete-task-button:hover {
  color: darkred;
}

.prompt-button {
  margin-left: 10px;
  background-color: #6a5acd;
  color: white;
  border: none;
  padding: 5px 10px;
  cursor: pointer;
  font-size: 0.8rem;
  border-radius: 5px;
}

.prompt-button:hover {
  background-color: #5a4b8d;
}

.modify-task-button {
  margin-left: 10px;
  background-color: #32cd32;
  color: white;
  border: none;
  padding: 5px 10px;
  cursor: pointer;
  font-size: 0.8rem;
  border-radius: 5px;
}

.modify-task-button:hover {
  background-color: #28a628;
}

.modify-task-form {
  margin-top: 20px;
  padding: 1em;
  background-color: #f0f0f0;
  border-radius: 8px;
}

.modify-task-form label {
  display: block;
  margin-bottom: 0.5em;
}

.modify-task-form input,
.modify-task-form select {
  padding: 0.5em;
  margin-bottom: 1em;
  width: 100%;
}

.modify-task-form button {
  margin-top: 10px;
  padding: 0.7em
}
</style>