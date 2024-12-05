<template>
  <div class="conversation-selector">
    <input
      v-model="typedUsername"
      type="text"
      placeholder="Enter username or select from friends"
      @focus="showDropdown = true"
      @blur="hideDropdown"
    />

    <!-- Dropdown for friends list -->
    <div v-if="showDropdown && friends.length" class="dropdown">
      <ul>
        <li v-for="friend in friends">
          <button @click="selectFriend(friend)">
            {{ friend }}
          </button>
        </li>
      </ul>
    </div>

    <button @click="startConversation">Start a New Conversation</button>
  </div>
</template>

<script setup lang="ts">
import { fetchy } from "@/utils/fetchy";
import { defineEmits, onMounted, ref } from "vue";

const emit = defineEmits(['conversationSelected']);

const friends = ref([]); 
const typedUsername = ref("");
const errorMessage = ref("");
const showDropdown = ref(false);

// Load friends
const loadFriends = async () => {
  try {
    const response = await fetchy("/api/friends", "GET");
    friends.value = response || [];
  } catch (error) {
    console.error("Error loading friends:", error);
  }
};

async function getRecipientId (username:string) {
  let response = await fetchy(`/api/users/${username}`, "GET");
  return response._id;
};

// Select friend from dropdown
const selectFriend = (username: string) => {
  typedUsername.value = username;
  showDropdown.value = false;
};

// Hide dropdown after a delay to allow clicks
const hideDropdown = () => {
  setTimeout(() => {
    showDropdown.value = false;
  }, 200);
};

// Start conversation
const startConversation = async () => {
  if (!typedUsername.value.trim()) {
    alert("Please enter or select a username.");
    return;
  }
  const recipientId: string = await getRecipientId(typedUsername.value);
  try {
    let response = await fetchy("/api/conversations", "POST", {
      body: { recipientId: recipientId },
    });
    alert(`Conversation started with ${typedUsername.value}!`);
    emit('conversationSelected', response.conversationId);
    typedUsername.value = "";
  } catch (error) {
    console.error("Error starting conversation:", error);
    alert(`Failed to start conversation with ${typedUsername.value}.`);
  }
};

onMounted(() => {
  loadFriends();
});
</script>

<style scoped>
.conversation-selector {
  display: flex;
  align-items: center;
  padding: 0.5em 1em;
  background-color: #f4f4f4;
  border-bottom: 1px solid #ccc;
  width: 100%;
  box-sizing: border-box;
  position: relative;
}

input {
  max-width: 80vw;
  flex-grow: 1;
  padding: 0.5em;
  margin-right: 0.5em;
  border: 1px solid #ccc;
  border-radius: 4px;
}

button {
  padding: 0.5em 1em;
  background-color: #4F70A3;
  /* color: white; */
  border: none;
  position: relative;
  bottom: .5vh;
  border-radius: 4px;
  cursor: pointer;
}

button:hover {
  background-color: #32496d;
}

.dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  width: 100%;
  background-color: white;
  border: 1px solid #ccc;
  border-radius: 4px;
  z-index: 1000;
  max-height: 100px;
  overflow-y: auto;
}

.dropdown ul {
  list-style: none;
  margin: 0;
  padding: 0;
}

.dropdown li {
  border-bottom: 1px solid #eee;
}

.dropdown li button {
  width: 100%;
  padding: 0.5em;
  text-align: left;
  background: none;
  border: none;
  color: black;
  cursor: pointer;
}

.dropdown li button:hover {
  background-color: #f0f0f0;
}
</style>
