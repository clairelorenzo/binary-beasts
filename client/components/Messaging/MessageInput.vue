<template>
  <div class="message-input">
    <input
      v-if="!isTask"
      type="text"
      v-model="content"
      @keydown.enter="onSend"
      placeholder="Type a message"
    />

    <!-- Task input fields -->
    <div v-else class="task-inputs">
      <input type="text" v-model="taskName" placeholder="Task Name" />
      <input type="text" v-model="taskDescription" placeholder="Description" />
      <input type="number" v-model="taskReps" placeholder="Reps" />
      <input type="number" v-model="taskSets" placeholder="Sets (optional)" />
      <input type="number" v-model="taskWeight" placeholder="Weight (optional)" />
    </div>

    <div class="button-group">
      <button @click="toggleTask">{{ isTask ? "Cancel Task" : "Add Task" }}</button>
      <button @click="onSend">Send</button>
    </div>

    <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>
  </div>
</template>

<script setup lang="ts">
import { defineEmits, ref } from 'vue';

const emit = defineEmits(['send', 'sendTask']);
const content = ref('');
const isTask = ref(false);

// Individual task fields
const taskName = ref('');
const taskDescription = ref('');
const taskReps = ref<number | null>(null);
const taskSets = ref<number | null>(null);
const taskWeight = ref<number | null>(null);

const errorMessage = ref<string | null>(null);

const toggleTask = () => {
  isTask.value = !isTask.value;
  if (!isTask.value) {
    clearTaskFields();
  }
};

const clearTaskFields = () => {
  taskName.value = '';
  taskDescription.value = '';
  taskReps.value = null;
  taskSets.value = null;
  taskWeight.value = null;
};

// Emit a send event for regular messages or sendTask event for task messages
const onSend = () => {
  errorMessage.value = null;

  if (isTask.value) {
    if (!taskName.value || !taskDescription.value || !taskReps.value || taskReps.value <= 0) {
      errorMessage.value = 'Please fill out all required task fields correctly.';
      return;
    }

    const task = {
      name: taskName.value,
      description: taskDescription.value,
      reps: taskReps.value,
      sets: taskSets.value || undefined,
      weight: taskWeight.value || undefined,
      completed: false,
      previousDifficulty: "JustRight", // Default value
    };

    console.log('Emitting sendTask with:', content.value, task);
    emit('sendTask', content.value, task);

    // Clear fields
    clearTaskFields();
  } else {
    if (!content.value.trim()) {
      errorMessage.value = 'Message content cannot be empty.';
      return;
    }

    console.log('Emitting send with:', content.value);
    emit('send', content.value);
  }

  content.value = '';
};
</script>

<style scoped>
.message-input {
  display: flex;
  flex-direction: column;
  padding: 0.5em;
  width: 77vw;
  border-top: 1px solid #ccc;
}

.message-input input {
  margin: 0.25em 0;
  padding: 0.5em;
  border: 1px solid #ccc;
  border-radius: 4px;
}

.task-inputs {
  margin: 0.5em 0;
}

.button-group {
  display: flex;
  justify-content: space-between;
  margin-top: 0.5em;
}

.button-group button {
  padding: 0.5em 1em;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.button-group button:first-child {
  background-color: #c4c1c1;
  color: white;
}

.button-group button:last-child {
  background-color: #4f70a3;
  color: white;
}

.button-group button:hover {
  opacity: 0.9;
}

.error-message {
  margin-top: 0.5em;
  color: red;
  font-size: 0.9em;
}
</style>
