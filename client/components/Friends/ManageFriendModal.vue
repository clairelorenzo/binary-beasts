<template>
  <div v-if="isOpen" class="modal">
    <div class="modal-content">
      <h2>Manage Friends</h2>

      <div class="tabs">
        <button :class="{ active: activeTab === 'friends' }" @click="switchTab('friends')">Friend List</button>
        <button :class="{ active: activeTab === 'requests' }" @click="switchTab('requests')">Manage Requests</button>
        <button :class="{ active: activeTab === 'send' }" @click="switchTab('send')">Send Request</button>
      </div>

      <div v-if="activeTab === 'requests'" class="tab-content">
        <h3>Friend Requests</h3>
        <ul v-if="friendRequests.length">
          <li v-for="request in friendRequests" :key="request.from">
            <span>{{ request.from }}</span>
            <button @click="acceptRequest(request.from)">Accept</button>
            <button @click="rejectRequest(request.from)">Reject</button>
          </li>
        </ul>
        <p v-else>No friend requests at the moment.</p>
      </div>

      <div v-if="activeTab === 'send'" class="tab-content">
        <h3>Send a Friend Request</h3>
        <input v-model="friendUsername" type="text" placeholder="Enter username" />
        <button @click="sendRequest">Send Request</button>
      </div>

      <div v-if="activeTab === 'friends'" class="tab-content">
        <h3>Your Friends</h3>
        <ul v-if="friends.length">
          <li v-for="friend in friends">
            <span>{{ friend }}</span>
            <button @click="removeFriend(friend)">Remove</button>
          </li>
        </ul>
        <p v-else>You currently have no friends.</p>
      </div>

      <p v-if="message" class="message">{{ message }}</p>

      <button @click="closeModal">Close</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { fetchy } from "@/utils/fetchy";
import { ref, watch } from "vue";

const props = defineProps({
  isOpen: {
    type: Boolean,
    required: true,
  },
});

const emit = defineEmits(["close"]);

const activeTab = ref("requests"); // Default tab is Friend Requests
interface Req {
  from: string;
}


const friendRequests = ref<Array<Req>>([]);
const friends = ref([]);
const friendUsername = ref("");
const message = ref("");

// Load friend requests
const loadRequests = async () => {
  try {
    // Fetch the current user's information
    const currentUserResponse = await fetchy("api/session", "GET");
    const currentUsername = currentUserResponse.username;

    // Fetch friend requests
    const response = await fetchy("api/friend/requests", "GET");

    // Filter requests by status and exclude the current user's username
    friendRequests.value = response.filter(
      (req: { status: string; from: string }) =>
        req.status === "pending" && req.from !== currentUsername
    );
    console.log(friendRequests.value);
  } catch (error) {
    console.error("Error loading friend requests:", error);
  }
};



// Load friends
const loadFriends = async () => {
  try {
    const response = await fetchy("api/friends", "GET");
    friends.value = response || [];
  } catch (error) {
    console.error("Error loading friends:", error);
  }
};

// Watch for modal open/close state
watch(
  () => props.isOpen,
  (isOpen) => {
    if (isOpen) {
      activeTab.value = "requests";
      loadRequests();
      loadFriends();
    }
  }
);

// Switch tabs
const switchTab = async (tab: string) => {
  activeTab.value = tab;

  if (tab === "requests") {
    await loadRequests();
  } else if (tab === "friends") {
    await loadFriends();
  }
};

// Send a friend request
const sendRequest = async () => {
  if (!friendUsername.value.trim()) {
    message.value = "Please enter a valid username.";
    return;
  }

  try {
    await fetchy(`api/friend/requests/${friendUsername.value}`, "POST");
    message.value = "Friend request sent!";
    friendUsername.value = ""; // Clear input
  } catch (error) {
    console.error("Error sending friend request:", error);
    message.value = "Failed to send friend request.";
  }
};

// Accept a friend request
const acceptRequest = async (username: string) => {
  try {
    await fetchy(`api/friend/accept/${username}`, "PUT");
    friendRequests.value = friendRequests.value.filter((req) => req.from !== username);
    message.value = `Accepted friend request from ${username}`;
    await loadRequests();
  } catch (error) {
    console.error("Error accepting friend request:", error);
    message.value = "Failed to accept friend request.";
  }
};

// Reject a friend request
const rejectRequest = async (username: string) => {
  try {
    await fetchy(`api/friend/reject/${username}`, "PUT");
    friendRequests.value = friendRequests.value.filter((req) => req.from !== username);
    message.value = `Rejected friend request from ${username}`;
    await loadRequests();
  } catch (error) {
    console.error("Error rejecting friend request:", error);
    message.value = "Failed to reject friend request.";
  }
};

// Remove a friend
const removeFriend = async (username: string) => {
  console.log(username);
  try {
    await fetchy(`api/friends/${username}`, "DELETE");
    friends.value = friends.value.filter((friend) => friend !== username);
    message.value = `Removed friend ${username}`;
    await loadFriends();
  } catch (error) {
    console.error("Error removing friend:", error);
    message.value = "Failed to remove friend.";
  }
};

// Close the modal
const closeModal = () => {
  emit("close");
};
</script>

  
<style>
  .modal {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background-color: white;
    padding: 2em;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    z-index: 1000;
    border-radius: 8px;
    width: 600px;
  }
  
  .modal-content {
    display: flex;
    flex-direction: column;
    gap: 1em;
  }
  
  .tabs {
    display: flex;
    justify-content: center;
    gap: 1em;
    margin-bottom: 1em;
  }
  
  .tabs button {
    padding: 0.5em 1em;
    background-color: #4F70A3;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
  }
  
  .tabs button.active {
    background-color: #4F70A3;
  }
  
  .tab-content {
    display: flex;
    flex-direction: column;
    gap: 1em;
  }
  
  input {
    width: 100%;
    padding: 0.5em;
    margin-bottom: 0.5em;
    border: 1px solid #ccc;
    border-radius: 4px;
  }
  
  button {
    padding: 0.5em 1em;
    background-color: #4F70A3;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
  }
  
  button:hover {
    background-color: #0056b3;
  }
  
  ul {
    list-style: none;
    padding: 0;
  }
  
  ul li {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 0.5em;
  }
  
  .message {
    color: green;
    font-size: 0.9em;
  }
</style>