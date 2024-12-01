<template>
  <div class="message-list">
    <div v-for="(messageGroup, index) in groupedMessages" :key="index">
      <DateSeparator :date="messageGroup.date" />
      <MessageItem
        v-for="message in messageGroup.messages"
        :key="message._id"
        :message="message"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { fetchy } from '@/utils/fetchy';
import { onMounted, ref, watch } from 'vue';
import DateSeparator from './DateSeparator.vue';
import MessageItem from './MessageItem.vue';

const props = defineProps<{ conversationId: string | null; reload: boolean }>();

interface Message {
  _id: string;
  content: string;
  dateCreated: string;
}

interface MessageGroup {
  date: string;
  messages: Message[];
}

const messages = ref<Message[]>([]);
const groupedMessages = ref<MessageGroup[]>([]);
const loading = ref(false);
const error = ref<string | null>(null);

// Fetch messages from the server
const loadMessages = async () => {
  if (!props.conversationId) return;

  loading.value = true;
  error.value = null;

  try {
    const response = await fetchy(`/api/conversations/${props.conversationId}/messages`, 'GET');
    messages.value = response.messages || [];
    groupMessagesByDate();
  } catch (err) {
    console.error('Error fetching messages:', err);
    error.value = 'Failed to load messages. Please try again.';
  } finally {
    loading.value = false;
  }
};

// Group messages by their creation date
const groupMessagesByDate = () => {
  const groups: Record<string, Message[]> = {};

  messages.value.forEach((message) => {
    const date = new Date(message.dateCreated).toDateString();
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(message);
  });

  groupedMessages.value = Object.keys(groups)
    .sort((a, b) => new Date(a).getTime() - new Date(b).getTime()) // Ensure chronological order
    .map((date) => ({
      date,
      messages: groups[date],
    }));
};

// Load messages when the component is mounted
onMounted(loadMessages);

// Reload messages when conversationId or reload prop changes
watch(
  () => [props.conversationId, props.reload],
  () => {
    if (props.conversationId) {
      loadMessages();
    }
  }
);
</script>

<style scoped>
.message-list {
  flex-grow: 1;
  overflow-y: auto;
  padding: 1em;
}

.message-list div {
  margin-bottom: 1em;
}
</style>
