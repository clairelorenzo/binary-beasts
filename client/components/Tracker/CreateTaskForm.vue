<script setup lang="ts">
import { ref } from "vue";
import { fetchy } from "../../utils/fetchy";

const taskName = ref("");
const taskDescription = ref("");
const reps = ref()
const sets = ref()
const startingWeight = ref()
const emit = defineEmits(["refreshTasks"]);

const createTask = async (taskName: string, taskDescription: string, reps: number, sets: number, startingWeight: number) => {
  try {
    await fetchy("/api/tracking/tasks", "POST", {
      body: { taskName: taskName, taskDescription: taskDescription, reps: reps, sets: sets, startingWeight: startingWeight},
    });
  } catch (_) {
    return;
  }
  emit("refreshTasks");
  resetForm();
};

const resetForm = () => {
  taskName.value = "";
  taskDescription.value = "";
  reps.value = NaN;
  sets.value = NaN;
  startingWeight.value = NaN;
};
</script>

<template>
  <form @submit.prevent="createTask(taskName, taskDescription, reps, sets, startingWeight)" class="create-task-form">
    <label for="taskName">Task Name:</label>
    <input
      id="taskName"
      type="text"
      v-model="taskName"
      placeholder="Enter task name"
      required
    />
    <label for="taskDescription">Task Description:</label>
    <input
      id="taskDescription"
      type="text"
      v-model="taskDescription"
      placeholder="Enter task description"
      required
    />
    <label for="reps">Num reps:</label>
    <input
      id="reps"
      type="number"
      v-model="reps"
      placeholder="Enter number of reps"
      required
    />
    <label for="sets">Num sets:</label>
    <input
      id="sets"
      type="number"
      v-model="sets"
      placeholder="Enter number of sets"
      required
    />
    <label for="taskName">Starting weight (lbs):</label>
    <input
      id="startingWeight"
      type="number"
      v-model="startingWeight"
      placeholder="Enter starting weight"
      required
    />
    <button type="submit" class="pure-button-primary pure-button">Create Task</button>
  </form>
</template>

<style scoped>
.create-task-form {
  background-color: var(--base-bg);
  border-radius: 1em;
  display: flex;
  flex-direction: column;
  gap: 0.5em;
  padding: 1em;
}

input,
textarea {
  font-family: inherit;
  font-size: inherit;
  padding: 0.5em;
  border-radius: 4px;
  border: 1px solid #ccc;
}

textarea {
  height: 6em;
  resize: none;
}
</style>
