<script setup lang="ts">
import { ref } from "vue";
import { fetchy } from "../../utils/fetchy";

const goal = ref<string>("");
const isLoading = ref(false);
const message = ref<string | null>(null);

const setGoal = async () => {
  if (!goal.value) {
    message.value = "Please select a goal.";
    return;
  }

  isLoading.value = true;
  try {
    // Send a POST request to set the goal
    const response = await fetchy("/api/tracking/goal",  "POST", {body:{ goal: goal.value }});
    if (response && response.msg) {
      message.value = `Goal set to: ${response.goal}`;
    } else {
      message.value = "An error occurred while setting the goal.";
    }
  } catch (error) {
    message.value = "An error occurred while setting the goal.";
  } finally {
    isLoading.value = false;
  }
};
</script>

<template>
  <div class="create-goal">
    <label for="goal">Select your goal for the week:</label>
    <select id="goal" v-model="goal" :disabled="isLoading">
      <option value="" disabled>Select a goal</option>
      <option value="muscle">Muscle</option>
      <option value="strength">Strength</option>
      <option value="endurance">Endurance</option>
    </select>
    <button @click="setGoal" :disabled="isLoading" class="submit-button">
      {{ isLoading ? "Setting Goal..." : "Set Goal" }}
    </button>
    <p v-if="message" class="message">{{ message }}</p>
  </div>
</template>

<style scoped>
.create-goal {
  text-align: center;
  margin-top: 20px;
}

label {
  font-size: 16px;
  margin-bottom: 8px;
  display: block;
}

select {
  font-size: 16px;
  padding: 8px;
  margin-bottom: 12px;
}

.submit-button {
  background-color: #4caf50;
  color: white;
  padding: 10px 20px;
  font-size: 16px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.submit-button:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

.message {
  margin-top: 10px;
  font-size: 14px;
  color: #333;
}
</style>
