<script setup lang="ts">
import { ref } from "vue";
import CreateGoalComponent from "../components/Tracker/CreateGoalComponent.vue"; // Import the CreateGoalComponent
import CreateTaskForm from "../components/Tracker/CreateTaskForm.vue";
import CompletionPercentageComponent from "../components/Tracker/PercentComponent.vue";
import ResetTasksComponent from "../components/Tracker/ResetTasksComponent.vue";
import TaskListComponent from "../components/Tracker/TaskListComponent.vue";
import TrackingGraphComponent from "../components/Tracker/TrackingGraphComponent.vue";
const taskListRef = ref();

const refreshTasks = () => {
  if (taskListRef.value) {
    taskListRef.value.fetchTasks();
  }
};
</script>

<template>
  <div class="tracker-view">
    <h1>Task Tracker</h1>
    <CreateTaskForm @refreshTasks="refreshTasks" />
    <CompletionPercentageComponent />
    <CreateGoalComponent /> <!-- Add the CreateGoalComponent here -->
    <ResetTasksComponent />
    <TaskListComponent ref="taskListRef" />
    <TrackingGraphComponent></TrackingGraphComponent>
  </div>
</template>

<style scoped>
.tracker-view {
  padding: 1em;
}
</style>
