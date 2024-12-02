<template>
  <div v-if="isLoaded" :class="['task-message', isMine ? 'mine' : '']">
    <div class="message-content">
      <p><b>Task Name:</b> {{ message.task.name }}</p>
      <p><b>Description:</b> {{ message.task.description }}</p>
      <div class="task-details">
        <p><strong>Reps:</strong> {{ message.task.reps }}</p>
        <p v-if="message.task.sets"><strong>Sets:</strong> {{ message.task.sets }}</p>
        <p v-if="message.task.weight"><strong>Weight:</strong> {{ message.task.weight }} lbs</p>
      </div>

      <!-- Add to Weekly Tasks Button -->
      <div v-if="isRecipient" class="add-task-section">
        <button @click="addToWeeklyTasks">Add to My Regimen</button>
      </div>
    </div>
    <div class="message-meta">
      <span class="message-time">{{ formattedTime }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { fetchy } from '@/utils/fetchy';
import { computed, onMounted, ref } from 'vue';

const props = defineProps<{ message: any }>();

const isMine = ref(false); // True if the current user is the sender
const isRecipient = ref(false); // True if the current user is the recipient
const isLoaded = ref(false); // Controls initial rendering

// Format message creation time
const formattedTime = computed(() => {
  return new Date(props.message.dateCreated).toLocaleTimeString();
});

// Determine if the message belongs to the current user
const checkIfMine = async () => {
  try {
    const userResponse = await fetchy('/api/session', 'GET');
    const currentUserId = userResponse._id;

    isMine.value = props.message.sender === currentUserId;
    isRecipient.value = props.message.recipient === currentUserId;

    isLoaded.value = true; // Mark as loaded once all checks are complete
  } catch (error) {
    console.error('Error checking if message is mine:', error);
    isLoaded.value = true; // Mark as loaded even if there's an error
  }
};

// Add the task to the recipient's regimen
const addToWeeklyTasks = async () => {
  try {
    const { name, description, reps, sets, weight } = props.message.task;

    const response = await fetchy('/api/tracking/tasks', 'POST', {
      body: {
        taskName: name,
        taskDescription: description,
        reps,
        sets: sets || undefined,
        startingWeight: weight || undefined,
      },
    });

    console.log('Task added to regimen:', response.msg);
    alert(response.msg); // Notify the user
  } catch (error) {
    console.error('Error adding task to regimen:', error);
    alert('Failed to add task to regimen.');
  }
};

onMounted(checkIfMine);
</script>

<style scoped>
.task-message {
  display: flex;
  flex-direction: column;
  max-width: 70%;
  margin: 0.5em;
  transition: left 0.3s ease;
  text-align: center;
}

.task-message.mine {
  position: relative;
  left: 22vw;
  align-self: flex-end;
  text-align: center;
}

.task-message.mine > .message-content {
  background-color: #a8bfe1;
}

.task-message .message-content {
  background-color: #d2d1d1;
  padding: 1em;
  border-radius: 8px;
  border: 1px solid #ccc;
}

.task-message .message-meta {
  font-size: 0.8em;
  color: #888;
  margin-top: 0.5em;
}

.add-task-section {
  margin-top: 0.5em;
  text-align: center;
}

.add-task-section button {
  padding: 0.5em 1em;
  border: none;
  background-color: #28a745;
  color: white;
  border-radius: 4px;
  cursor: pointer;
}

.task-message .message-meta {
  font-size: 0.8em;
  color: #888;
  margin-top: 0.5em;
  text-align: left; /* Default for non-mine messages */
}

.task-message.mine .message-meta {
  text-align: right; /* Right-align for mine messages */
}

.add-task-section button:hover {
  background-color: #218838;
}
</style>
