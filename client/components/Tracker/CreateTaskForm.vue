<script setup lang="ts">
import { ref } from "vue";
import { fetchy } from "../../utils/fetchy";

const taskName = ref("");
const taskDescription = ref("");
const reps = ref();
const sets = ref();
const startingWeight = ref();
const emit = defineEmits(["refreshTasks"]);

const createTask = async (taskName: string, taskDescription: string, reps: number, sets: number, startingWeight: number) => {
  try {
    await fetchy("/api/tracking/tasks", "POST", {
      body: { taskName, taskDescription, reps, sets, startingWeight },
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
    <input id="taskName" type="text" v-model="taskName" placeholder="Enter task name" required />
    <label for="taskDescription">Task Description:</label>
    <input id="taskDescription" type="text" v-model="taskDescription" placeholder="Enter task description" required />
    <label for="reps">Num reps:</label>
    <input id="reps" type="number" v-model="reps" placeholder="Enter number of reps" required />
    <label for="sets">Num sets:</label>
    <input id="sets" type="number" v-model="sets" placeholder="Enter number of sets" required />
    <label for="startingWeight">Starting weight (lbs):</label>
    <input id="startingWeight" type="number" v-model="startingWeight" placeholder="Enter starting weight" required />
    <button type="submit" class="create-task-button">Create Task</button>
  </form>
</template>

<style scoped>
.create-task-form {
  background-color: var(--sbeige);
  border: 2px solid var(--dblue); /* Deep blue */
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  gap: 1em;
  padding: 1.5em;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

label {
  font-family: "Arial";
  font-weight: bold;
  font-size: 18px;
  color: var(--dblue);
  margin-bottom: 0.2em;
}

input {
  font-family: "Arial", sans-serif; /* Bold, sporty font */
  font-size: 16px;
  padding: 0.8em;
  border: 2px solid var(--lgreen); /* Light green */
  border-radius: 8px;
  background-color: #fff;
  transition: box-shadow 0.3s;
  width: 95%;
}

input:focus {
  box-shadow: 0 0 8px var(--lgreen); /* Light green focus effect */
  outline: none;
}

.create-task-button {
  background-color: var(--dblue); /* Deep blue */
  color: var(--sbeige); /* Soft beige text */
  font-family: "Arial", sans-serif; /* Sporty font */
  font-size: 18px;
  padding: 0.8em 1.2em;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  transition:
    background-color 0.3s,
    transform 0.2s;
}

.create-task-button:hover {
  background-color: var(--lblue); /* Light blue */
  transform: scale(1.05);
}

textarea {
  font-family: "Arial", sans-serif;
  font-size: 16px;
  padding: 0.8em;
  border: 2px solid var(--lgreen);
  border-radius: 8px;
  background-color: #fff;
  resize: none;
}

textarea:focus {
  box-shadow: 0 0 8px var(--lgreen);
  outline: none;
}
</style>
