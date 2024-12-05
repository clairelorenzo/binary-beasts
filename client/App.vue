<script setup lang="ts">
import ManageFriendsModal from "@/components/Friends/ManageFriendModal.vue";
import { useToastStore } from "@/stores/toast";
import { useUserStore } from "@/stores/user";
import { storeToRefs } from "pinia";
import { computed, onBeforeMount, ref } from "vue";
import { RouterLink, RouterView, useRoute } from "vue-router";

const currentRoute = useRoute();
const currentRouteName = computed(() => currentRoute.name);
const userStore = useUserStore();
const { isLoggedIn } = storeToRefs(userStore);
const { toast } = storeToRefs(useToastStore());

// Ref to control modal visibility
const isManageFriendsModalOpen = ref(false);

// Function to open the modal
const openManageFriendsModal = () => {
  isManageFriendsModalOpen.value = true;
};

// Function to close the modal
const closeManageFriendsModal = () => {
  isManageFriendsModalOpen.value = false;
};

// Update session before mounting
onBeforeMount(async () => {
  try {
    await userStore.updateSession();
  } catch {
    // User is not logged in
  }
});
</script>

<template>
  <header>
    <nav>
      <div class="title">
        <img src="@/assets/images/logo.svg" />
        <RouterLink :to="{ name: 'Threads' }">
          <h1>BeFit</h1>
        </RouterLink>
        <div class="friend-button" @click="openManageFriendsModal">Manage Friends</div>
      </div>
      <ul>
        <li>
          <RouterLink :to="{ name: 'Threads' }" :class="{ underline: currentRouteName == 'Threads' }"> Threads </RouterLink>
        </li>
        <li>
          <RouterLink :to="{ name: 'Tracker' }" :class="{ underline: currentRouteName == 'Tracker' }"> Tracker </RouterLink>
        </li>
        <li>
          <RouterLink :to="{ name: 'Messages' }" :class="{ underline: currentRouteName == 'Messages' }"> Messages </RouterLink>
        </li>
        <li v-if="isLoggedIn">
          <RouterLink :to="{ name: 'Settings' }" :class="{ underline: currentRouteName == 'Settings' }"> Settings </RouterLink>
        </li>
        <li v-else>
          <RouterLink :to="{ name: 'Login' }" :class="{ underline: currentRouteName == 'Login' }"> Login </RouterLink>
        </li>
      </ul>
    </nav>
    <article v-if="toast !== null" class="toast" :class="toast.style">
      <p>{{ toast.message }}</p>
    </article>
  </header>

  <!-- Modal for managing friends -->
  <ManageFriendsModal
    :isOpen="isManageFriendsModalOpen"
    @close="closeManageFriendsModal"
  />

  <RouterView />
</template>

<style scoped>
@import "./assets/toast.css";

nav {
  padding: 1em 2em;
  background-color: #4f70a3;
  display: flex;
  align-items: center;
}

h1 {
  font-size: 2em;
  margin: 0;
}

.title {
  display: flex;
  align-items: center;
  gap: 0.5em;
}

img {
  height: 2em;
}

a {
  font-size: large;
  color: black;
  text-decoration: none;
}

ul {
  list-style-type: none;
  margin-left: auto;
  display: flex;
  align-items: center;
  flex-direction: row;
  gap: 1em;
}

ul li {
  background-color: #cfe1e7; 
  padding: 0.5em 1em;
  border-radius: 4px; 
  gap: 1em;
}

.friend-button {
  text-align: center;
  position: relative;
  left: 2vw;
  background-color: #6FC5D6;
  padding: 0.5em 1em;
  border-radius: 4px; 
  cursor: pointer;
}

.friend-button:hover {
  background-color: #5bb3c4;
}

.underline {
  text-decoration: underline;
}
</style>
