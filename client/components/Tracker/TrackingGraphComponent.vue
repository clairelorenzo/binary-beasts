<script setup lang = 'ts'>
import { BarElement, CategoryScale, Chart as ChartJS, Legend, LinearScale, Title, Tooltip } from 'chart.js';
import { onMounted, ref } from 'vue';
import { Bar } from 'vue-chartjs';
import { fetchy } from "../../utils/fetchy"; // Assuming fetchy is imported from utils


ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale)
  

const progressHistory = ref<Array<{ weekStart: string, completedTasks: number }>>([]);
const xVals = ref<Array<string>>([]);
const yVals = ref<Array<number>>([]);


  onMounted(async () => {
  try {
    const response = await fetchy("/api/tracking/history", "GET");
    if (response.history) {
      const formattedHistory = response.history.map((entry: { weekStart: Date; completedTasks: any[] }) => ({
        weekStart: new Date(entry.weekStart).toLocaleDateString(),  // Convert date to a readable string
        completedTasks: entry.completedTasks.length,  // Count of completed tasks
      }));
      
      // Update progressHistory
      progressHistory.value = formattedHistory;
      xVals.value = progressHistory.value.map(entry => entry.weekStart)
      yVals.value = progressHistory.value.map(entry => entry.completedTasks)
      console.log(xVals, yVals)
    }}
    catch (error) {
    console.error("Error fetching progress history:", error);}});

  const Data =   {
    name: 'BarChart',
    components: { Bar },
    data() {
      return {
        chartData: {
          labels: xVals.value,
          datasets: [ 
            { data: yVals.value,
                backgroundColor: "rgba(78, 112, 163, 0.6)",
            borderColor: "rgba(203, 220, 245, 1)",
            borderWidth: 2,
            label: "Num Tasks Completed"
         } ]
        },
        chartOptions: {
          responsive: true,
          plugins:{
            title:{
                display: true,
                text: "Number of Tasks Completed per Day",
                font: {
                    size: 22,
                    family: 'Arial, sans-serif',
                },
                padding: {
                    top: 20,
                    bottom: 30,
                },
            },
          }
        }
      }
    }
  }
  </script>

<template>
    <Bar
      id="tracking-chart"
      :options="Data.data().chartOptions"
      :data="Data.data().chartData"
    />
  </template>
  

  <style scoped>
#tracking-chart {
  /* margin: 3em auto;
  max-width: 800px; */
  background-color: #faf9f7;
  border-radius: 15px;
  padding: 2em;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);  /* Sporty shadow for depth */
}
</style>