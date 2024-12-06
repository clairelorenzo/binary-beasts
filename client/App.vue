<script setup lang="ts">
import ManageFriendsModal from "@/components/Friends/ManageFriendModal.vue";
import PointBoardComponent from "@/components/Points/PointBoardComponent.vue";
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

const hideSide = ["Login", "Messages", "Settings"];

// Make sure to update the session before mounting the app in case the user is already logged in
onBeforeMount(async () => {
  try {
    await userStore.updateSession();
  } catch {
    // User is not logged in
  }
});

const activeStyle = {
  color: "var(--lgreen)",
};

const defaultStyle = {
  color: "var(--sbeige)",
};
</script>

<template>
  <header>
    <nav>
      <div class="title">
        <img class="logo" src="@/assets/images/trace.svg" />
        <RouterLink :to="{ name: 'Home' }">
          <h1>BeFit</h1>
        </RouterLink>
        <div class="friend-button" @click="openManageFriendsModal">
          <img src="@/assets/images/friends.svg" />
        </div>
      </div>
      <ul>
        <li>
          <RouterLink :to="{ name: 'Threads' }" :class="{ underline: currentRouteName == 'Threads' }" :style="currentRouteName === 'Threads' ? activeStyle : defaultStyle"> Threads </RouterLink>
        </li>
        <li style="color: var(--sbeige)">
          <RouterLink :to="{ name: 'Tracker' }" :class="{ underline: currentRouteName == 'Tracker' }" :style="currentRouteName === 'Tracker' ? activeStyle : defaultStyle"> Tracker </RouterLink>
        </li>
        <li>
          <RouterLink :to="{ name: 'Messages' }" :class="{ underline: currentRouteName == 'Messages' }" :style="currentRouteName === 'Messages' ? activeStyle : defaultStyle"> Messages </RouterLink>
        </li>
        <li v-if="isLoggedIn">
          <RouterLink :to="{ name: 'Settings' }" :class="{ underline: currentRouteName == 'Settings' }" :style="currentRouteName === 'Settings' ? activeStyle : defaultStyle"> Settings </RouterLink>
        </li>
        <li v-else>
          <RouterLink :to="{ name: 'Login' }" :class="{ underline: currentRouteName == 'Login' }" :style="currentRouteName === 'Login' ? activeStyle : defaultStyle"> Login </RouterLink>
        </li>
      </ul>
    </nav>
    <article v-if="toast !== null" class="toast" :class="toast.style">
      <p>{{ toast.message }}</p>
    </article>
  </header>

  <!-- Modal for managing friends -->
  <ManageFriendsModal :isOpen="isManageFriendsModalOpen" @close="closeManageFriendsModal" />

  <div class="row">
    <RouterView class="mainContent" />
    <section v-if="currentRouteName" class="sidebar" :class="{ none: hideSide.includes(currentRouteName.toString()) }">
      <PointBoardComponent />
    </section>
  </div>
</template>

<style scoped>
@import "./assets/toast.css";

* {
  font-family: "Arial";
}

nav {
  padding: 1em 2em;
  background-color: var(--dblue);
  display: flex;
  align-items: center;
}
h1 {
  font-size: 2em;
  margin: 0;
  color: var(--sbeige);
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
  /* background-color: #cfe1e7;  */
  padding: 0.5em 1em;
  border-radius: 4px;
  gap: 1em;
}

.friend-button {
  text-align: center;
  position: relative;
  left: 2vw;
  padding: 0.5em 1em;
  border-radius: 4px;
  cursor: pointer;
}

.friend-button:hover {
  background-color: var(--lblue);
}

.underline {
  text-decoration: underline;
}

.row {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
}

.sidebar {
  margin: 1em 0;
  width: 15%;
  height: 100%;
}

.mainContent {
  flex-grow: 1;
}

.none {
  display: none;
}
.logo {
  width: 20%;
  height: 10%;
}
</style>
