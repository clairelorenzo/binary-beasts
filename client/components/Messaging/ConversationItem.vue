<template>
  <div class="conversation-item" @click="$emit('click')">
    <h4>{{ otherParticipantName }}</h4>
    <p>{{ lastMessagePreview }}</p>
  </div>
</template>

<script setup lang="ts">
import { fetchy } from "@/utils/fetchy";
import { defineProps, onMounted, ref } from "vue";

const props = defineProps<{ conversation: any }>();

const otherParticipantName = ref("Unknown");
const lastMessagePreview = ref("");

// Fetch the name of the other participant in the conversation
const getOtherParticipantName = async () => {
  try {
    const currentUserResponse = await fetchy("/api/session", "GET");
    const currentUserId = currentUserResponse._id;

    // Identify the other participant
    const otherParticipantId = props.conversation.participants.find(
      (id: string) => id !== currentUserId
    );

    if (!otherParticipantId) {
      otherParticipantName.value = "Unknown";
      return;
    }

    // Fetch the name of the other participant
    const userResponse = await fetchy(`/api/users/id/${otherParticipantId}`, "GET");
    otherParticipantName.value = userResponse.username || "Unknown";
  } catch (error) {
    console.error("Error fetching participant name:", error);
    otherParticipantName.value = "Error";
  }
};

// Get a preview of the last message in the conversation
const getLastMessagePreview = () => {
  const messages = props.conversation.messages;

  if (messages && messages.length > 0) {
    const lastMessage = messages[messages.length - 1];
    lastMessagePreview.value = lastMessage.content || "Task attachment";
  } else {
    lastMessagePreview.value = "[No messages yet]";
  }
};

onMounted(() => {
  getOtherParticipantName();
  getLastMessagePreview();
});
</script>

<style scoped>
.conversation-item {
  padding: 1em;
  border-bottom: 1px solid #eee;
  cursor: pointer;
  border-radius: 1px;
}
</style>
