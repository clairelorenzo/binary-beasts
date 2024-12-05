<template>
  <div class="conversation-content" v-if="conversationId && !loading">
    <div v-if="recipientName" class="recipient-name">
      <h2>Chat with {{ recipientName }}</h2>
    </div>
    <div ref="messageListContainer" class="message-list-container">
      <MessageList
        :conversationId="conversationId"
        :reload="reloadMessages"
        @loaded="onMessagesLoaded"
      />
    </div>
    <MessageInput @send="sendMessage" @sendTask="sendTaskMessage" />
  </div>
  <div v-else-if="loading" class="loading-text">Loading...</div>
  <div v-else class="no-conversation">
    <p class="loading-text">Select a conversation to start chatting!</p>
  </div>
</template>

<script setup lang="ts">
  import { fetchy } from '@/utils/fetchy';
import { nextTick, onMounted, ref, watch } from 'vue';
import MessageInput from './MessageInput.vue';
import MessageList from './MessageList.vue';

  type Task = {
    name: string;
    description: string;
    reps: number;
    sets?: number;
    weight?: number;
    completed: boolean;
    previousDifficulty: string;
  };

  const props = defineProps<{ conversationId: string | null }>();
  const reloadMessages = ref(false);
  const loading = ref(false);
  const messageListContainer = ref<HTMLElement | null>(null);

  const recipientId = ref<string | null>(null);
  const recipientName = ref<string | null>(null);

  // Scroll to the bottom of the message list container
  const scrollToBottom = async () => {
    await nextTick(); // Ensure DOM updates are completed
    if (messageListContainer.value) {
      console.log(messageListContainer.value.scrollTop);
      console.log(messageListContainer.value.scrollHeight);
      messageListContainer.value.scrollTop = messageListContainer.value.scrollHeight;
    } else {
      console.warn("Message list container not found.");
    }
  };

  // Triggered when messages are loaded
  const onMessagesLoaded = async () => {
    console.log("Messages loaded. Scrolling to bottom.");
    await scrollToBottom();
  };

  // Fetch recipient ID and name
  const getRecipientId = async () => {
    if (!props.conversationId) return;

    loading.value = true;

    try {
      const response = await fetchy(`/api/conversations/${props.conversationId}`, "GET");
      const currentUserResponse = await fetchy("/api/session", "GET");
      const currentUserId = currentUserResponse._id;

      recipientId.value = response.conversation.participants.find(
        (id: string) => id !== currentUserId
      );

      const recipientResponse = await fetchy(`/api/users/id/${recipientId.value}`, "GET");
      recipientName.value = recipientResponse.username;
    } catch (error) {
      console.error("Error fetching recipient ID or name:", error);
    } finally {
      loading.value = false;
    }
  };

  // Send a regular message
  const sendMessage = async (content: string) => {
    if (!props.conversationId || !content.trim() || !recipientId.value) return;
    try {
      await fetchy(`/api/conversations/messages`, 'POST', {
        body: {
          conversationId: props.conversationId,
          content,
          recipient: recipientId.value,
        },
      });
      reloadMessages.value = !reloadMessages.value;
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  // Send a task message
  const sendTaskMessage = async (content: string, task: Task) => {
    if (!props.conversationId || !recipientId.value || !task.name) return;

    try {
      console.log("Sending task message to recipient:", recipientId.value);
      await fetchy(`/api/conversations/${props.conversationId}/tasks`, "POST", {
        body: {
          content,
          recipient: recipientId.value,
          task,
        },
      });
      reloadMessages.value = !reloadMessages.value;
    } catch (error) {
      console.error("Error sending task message:", error);
    }
  };

  onMounted(async () => {
    await getRecipientId();
    await scrollToBottom(); // Scroll to bottom on initial load
  });

  watch(
    () => props.conversationId,
    async () => {
      console.log("Conversation ID changed, fetching recipient...");
      await getRecipientId();
      await scrollToBottom();
    }
  );

  watch(
    () => reloadMessages.value,
    async () => {
      console.log("Reload triggered, ensuring scroll to bottom...");
      await nextTick(); // Ensure DOM updates for MessageList
      await scrollToBottom();
    }
  );
</script>

<style>
.conversation-content {
  display: flex;
  flex-direction: column;
  width: 80vw;
  height: 74vh;
  overflow-x: hidden;
}

.recipient-name {
  padding: 1em;
  text-align: center;
  font-weight: bold;
  background-color: #72a1e8;
  border-bottom: 1px solid #ddd;
}

.message-list-container {
  flex-grow: 1;
  overflow-y: auto;
  padding: 1em;
}

.message-input {
  position: sticky;
  bottom: 0;
  width: 100%;
  background-color: white;
  padding: 1em;
  border-top: 1px solid #ccc;
}

.loading-text {
  position: relative;
  left: 20vw;
  bottom: 10vh;
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  font-size: 2em;
  font-weight: bold;
  color: #555;
}
</style>
