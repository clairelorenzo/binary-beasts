<script setup lang="ts">
import { onMounted, ref } from "vue";
import CreateGoalComponent from "../components/Tracker/CreateGoalComponent.vue";
import CreateTaskForm from "../components/Tracker/CreateTaskForm.vue";
import CompletionPercentageComponent from "../components/Tracker/PercentComponent.vue";
import ResetTasksComponent from "../components/Tracker/ResetTasksComponent.vue";
import TaskListComponent from "../components/Tracker/TaskListComponent.vue";
import TrackingGraphComponent from "../components/Tracker/TrackingGraphComponent.vue";
import { fetchy } from "../utils/fetchy";

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

const tasks = ref<Task[]>(Array<Task>()); 
const percentage = ref<number | null>(null);
const loading = ref(false);

const fetchTasks = async () => {
  loading.value = true;
  try {
    const response = await fetchy("/api/tracking/tasks", "GET"); 
    tasks.value = response.tasks || [];
  } catch (error) {
    console.error("Failed to fetch tasks:", error);
  } finally {
    loading.value = false;
  }
};

const fetchPercentage = async () => {
  try {
    const response = await fetchy("/api/tracking/percentage", "GET");
    percentage.value = response.percentage ?? 0;
  } catch (e) {
    console.log("Failed to fetch percentage", e);
  }
};

onMounted(fetchTasks);
onMounted(fetchPercentage);

const refreshTasks = () => {
  fetchTasks(); 
  fetchPercentage();
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
        <CompletionPercentageComponent :percentage="percentage" />
      </div>
    </div>

    <div class="top-section">
      <div class="form-container">
        <CreateTaskForm @refreshTasks="refreshTasks" />
      </div>
      <div class="task-list-container">
        <TaskListComponent @refreshTasks="refreshTasks" :tasks="tasks" />
      </div>
    </div>

    <div class="bottom-section">
      <ResetTasksComponent />
      <TrackingGraphComponent class="graph" />
    </div>
  </div>
</template>

<style scoped>
.tracker-view {
  padding: 1em;
  display: flex;
  width: 20vw;
  flex-direction: column;
  gap: 1em;
}

h1 {
  text-align: center;
  color: var(--dblue);
}

.top-section {
  display: flex;
  gap: 1em;
  justify-content: space-between;
  width: 90%;
  align-items: center;
}

.form-container,
.task-list-container {
  flex: 1;
}

.form-container {
  background-color: white;
  padding: 1em;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.task-list-container {
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
