<template>
  <div class="conversation-selector">
    <input
      type="text"
      v-model="recipientUsername"
      placeholder="Enter username"
    />
    <button @click="startConversation">Start New Conversation</button>
    <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>
  </div>
</template>

<script setup lang="ts">
import { fetchy } from '@/utils/fetchy';
import { defineEmits, ref } from 'vue';

// Define a ref for the recipient's username
const recipientUsername = ref('');
const errorMessage = ref(''); // Error message for display

// Define an emit for when a conversation is selected
const emit = defineEmits(['conversationSelected']);

// Start a new conversation
const startConversation = async () => {
  errorMessage.value = ''; // Reset error message

  if (!recipientUsername.value.trim()) {
    errorMessage.value = 'Please enter a valid username.';
    return;
  }

  try {
    // Fetch the recipient's user data

    const userData = await fetchy(`/api/users/${recipientUsername.value}`, 'GET');
    
    if (!userData) {
      errorMessage.value = 'User not found.';
      return;
    }

    const recipientId = userData._id;
    console.log(recipientId);
    // Create a new conversation
    const conversationResponse = await fetchy('/api/conversations', 'POST', {
      body: { recipientId: recipientId },
    });

    if (conversationResponse?.conversationId) {
      emit('conversationSelected', conversationResponse.conversationId);
    } else {
      errorMessage.value = 'Failed to start a conversation.';
    }
  } catch (error) {
    console.error('Error starting conversation:', error);
    errorMessage.value = 'An error occurred. Please try again.';
  }
};
</script>

<style scoped>
.conversation-selector {
  padding: 1em;
  background-color: #e7e4e4;
  border: 1px solid #ccc;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  gap: 0.5em;
}

.conversation-selector input {
  padding: 0.5em;
  border: 1px solid #ccc;
  /* border-radius: 4px; */
}

.conversation-selector button {
  padding: 0.5em;
  border: none;
  background-color: #c4c1c1;
  letter-spacing: 2px;
  border-radius: 4px;
  cursor: pointer;
}

.conversation-selector button:hover {
  background-color: #72a1e8;
}

.error-message {
  color: red;
  font-size: 0.9em;
}
</style>
