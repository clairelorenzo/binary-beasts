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
    <div class="top-section">
      <div class="task-list-container">
        <CreateGoalComponent />
      </div>
      <div class="task-list-container">
      <CompletionPercentageComponent />
    </div>
    </div>
    
    <div class="top-section">
      <div class="form-container">
        <CreateTaskForm @refreshTasks="refreshTasks" />
      </div>
      <div class="task-list-container">
        <TaskListComponent ref="taskListRef" />
      </div>
    </div>
    <div class="bottom-section">
      
      
      <ResetTasksComponent />
      <TrackingGraphComponent />
    </div>
  </div>
</template>

<style scoped>
.tracker-view {
  padding: 1em;
  display: flex;
  flex-direction: column;
  gap: 1em;
}

h1 {
  text-align: center;
  color: #4e70a3;
}

.top-section {
  display: flex;
  gap: 1em;
  justify-content: space-between;
}

.form-container,
.task-list-container {
  flex: 1;
}

.form-container {
  background-color: #f1efeb;
  padding: 1em;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.task-list-container {
  /* background-color: #cbdcf5; */
  padding: 1em;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.bottom-section {
  display: flex;
  flex-direction: column;
  gap: 1em;
  margin-top: 1em;
}
</style>
