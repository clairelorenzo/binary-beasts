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
    const response = await fetchy("/api/tracking/goal", "POST", { body: { goal: goal.value } });
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
    <h3 class="message">Select a goal (muscle gain, working on endurance, or building up strength) to focus on this week! Your goal will affect the workout change prompts given by BeFit</h3>
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
  background-color: var(--sbeige); /* Soft beige */
  padding: 20px;
  border-radius: 12px;
  border: 2px solid var(--dblue); /* Light blue */
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.message {
  font-size: 10px;
  font-family: "Arial";
  font-weight: lighter;
  color: #000000;
}

label {
  font-size: 18px;
  color: var(--dblue); /* Deep blue */
  margin-bottom: 12px;
  display: block;
  font-family: "Arial"; /* Playful font */
  font-weight: bold;
}

select {
  font-size: 16px;
  padding: 10px;
  margin-bottom: 12px;
  border: 2px solid var(--lgreen); /* Light green */
  border-radius: 8px;
  background-color: #fff;
  outline: none;
  transition: box-shadow 0.3s;
}

select:focus {
  box-shadow: 0 0 8px var(--lgreen);
}

.submit-button {
  background-color: var(--dblue);
  color: white;
  padding: 10px 20px;
  font-size: 16px;
  font-family: "Arial";
  border: none;
  border-radius: 10px;
  cursor: pointer;
  transition:
    background-color 0.3s,
    transform 0.2s;
}

.submit-button:hover {
  background-color: var(--lblue);
  transform: scale(1.05);
}

.submit-button:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

.message {
  margin-top: 10px;
  font-size: 14px;
  color: var(--dblue);
  font-family: "Arial";
}
</style>
