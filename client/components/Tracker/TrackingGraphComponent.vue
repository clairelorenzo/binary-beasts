<script setup lang="ts">
import { CategoryScale, Chart as ChartJS, Legend, LineElement, LinearScale, Title, Tooltip } from 'chart.js';
import { onMounted, ref } from 'vue';
import { Line } from 'vue-chartjs';
import { fetchy } from "../../utils/fetchy"; // Assuming fetchy is imported from utils

// Register required Chart.js components
ChartJS.register(Title, Tooltip, Legend, LineElement, CategoryScale, LinearScale);

// Data for the graph
const progressHistory = ref<Array<{ weekStart: string, completedTasks: number }>>([]);
const loading = ref<boolean>(true);

// Define the correct type for chartData
interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    borderColor: string;
    fill: boolean;
    tension: number;
  }[];
}

// Chart data and options
const chartData = ref<ChartData>({
  labels: [],
  datasets: [
    {
      label: "Completed Tasks",
      data: [],
      borderColor: '#6a5acd', // Line color
      fill: false,  // Don't fill the area under the line
      tension: 0.1,  // Line smoothing
    }
  ]
});

const chartOptions = ref({
  responsive: true,
  scales: {
    x: {
      title: {
        display: true,
        text: 'Week Start Date',
      },
    },
    y: {
      title: {
        display: true,
        text: 'Completed Tasks',
      },
      min: 0,
    }
  }
});

// Fetch progress history from backend
onMounted(async () => {
  try {
    const response = await fetchy("/tracking/history", "GET");
    if (response.history) {
      // Process the response data into a format suitable for the graph
      const formattedHistory = response.history.map((entry: { weekStart: Date; completedTasks: any[] }) => ({
        weekStart: new Date(entry.weekStart).toLocaleDateString(),  // Convert date to a readable string
        completedTasks: entry.completedTasks.length,  // Count of completed tasks
      }));
      
      // Update progressHistory
      progressHistory.value = formattedHistory;

      // Update chartData to reflect the fetched data
      chartData.value = {
        labels: progressHistory.value.map(entry => entry.weekStart),
        datasets: [
          {
            label: "Completed Tasks",
            data: progressHistory.value.map(entry => entry.completedTasks),
            borderColor: '#6a5acd', // Line color
            fill: false,  // Don't fill the area under the line
            tension: 0.1,  // Line smoothing
          }
        ]
      };
    }
  } catch (error) {
    console.error("Error fetching progress history:", error);
  } finally {
    loading.value = false;
  }
});
</script>

<template>
  <div class="tracking-graph-component">
    <h2>Task Completion Progress</h2>
    <h3>{{ chartData }}</h3>
    <div v-if="loading">Loading...</div>
    <div v-else>
      <!-- Chart Component -->
      <Line :data="chartData" :options="chartOptions" />
    </div>
  </div>
</template>

<style scoped>
.tracking-graph-component {
  width: 100%;
  max-width: 800px;
  margin: 0 auto;
  padding: 1em;
}

h2 {
  text-align: center;
  font-size: 1.5em;
  margin-bottom: 1em;
}

div {
  margin-bottom: 2em;
}
</style>
