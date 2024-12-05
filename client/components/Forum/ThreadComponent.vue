<script setup lang="ts">
import { useUserStore } from "@/stores/user";
import { formatDate } from "@/utils/formatDate";
import { storeToRefs } from "pinia";
import { fetchy } from "../../utils/fetchy";
import { defineProps, onBeforeMount, ref } from "vue";

const props = defineProps(["post"]);
const emit = defineEmits(["editPost", "refreshPosts"]);
const { currentUsername } = storeToRefs(useUserStore());
const numUpvotes = ref<number>(0);
const isUpvoted = ref<boolean>(false);
// const alreadyUpvoted = ref<boolean>(false);

const deletePost = async () => {
  try {
    await fetchy(`/api/posts/${props.post._id}`, "DELETE");
  } catch {
    return;
  }
  emit("refreshPosts");
};

async function getNumUpvotes() {
  let query: Record<string, string> = { postId: props.post._id };
  try {
    const count = await fetchy(`/api/upvotes`, "GET", { query });
    return count;
  } catch (error) {
    console.error("Error getting the number of upvotes for this post", error);
  }
}

async function upvote() {
  let query: Record<string, string> = { postAuthor: props.post.author, postId: props.post._id };
  try {
    await fetchy(`/api/upvotes`, "POST", { query });
    isUpvoted.value = true;
  } catch (error) {
    console.error("Error upvoting", error);
  }
  await getNumUpvotes();
}

async function removeUpvote() {
  let query: Record<string, string> = { postAuthor: props.post.author, postId: props.post._id };
  try {
    await fetchy(`/api/upvotes`, "DELETE", { query });
    isUpvoted.value = false;
  } catch (error) {
    console.error("Error removing upvote", error);
  }
  await getNumUpvotes();
}

async function toggleUpvote() {
  if (isUpvoted.value) {
    numUpvotes.value -= 1;
    await removeUpvote();
  } else {
    numUpvotes.value += 1;
    await upvote();
  }
}

// async function userAlreadyUpvoted() {
//   let userIdQuery: Record<string, string> = { username: currentUsername };
//   try {
//     const userId = await fetchy(`/api/users/${currentUsername}`, "GET", { userIdQuery });
//     let query: Record<string, string> = { upvoter: userId, post: props.post._id };
//     try {
//       alreadyUpvoted.value = await fetchy(`/api/upvotes/limitUpvotes`, "GET", { query });
//     } catch (error) {
//       console.error("Error checking if user already upvoted", error);
//     }
//   } catch (error) {
//     console.error("Error retrieving user ID", error);
//   }
// }

onBeforeMount(async () => {
  numUpvotes.value = await getNumUpvotes();
  // await userAlreadyUpvoted();
});
</script>

<template>
  <!-- <p class="subject">{{ props.post.subject }}</p> -->
  <div class="subject-container">
    <p class="subject">{{ props.post.subject }}</p>
    <div class="upvote-container">
      <span class="upvote-count">
        {{ numUpvotes }}
        <span v-if="numUpvotes === 1">upvote</span>
        <span v-else>upvotes</span>
      </span>
      <button class="thumbs-up-button" :class="{ upvoted: isUpvoted }" @click="toggleUpvote">👍</button>
    </div>
  </div>
  <hr />
  <div class="row">
    <p class="author">{{ props.post.author }}</p>
    <p v-if="props.post.dateCreated !== props.post.dateUpdated">Edited on: {{ formatDate(props.post.dateUpdated) }}</p>
    <p v-else>Created on: {{ formatDate(props.post.dateCreated) }}</p>
  </div>
  <p>{{ props.post.content }}</p>
  <div class="base">
    <menu v-if="props.post.author == currentUsername">
      <li><button class="btn-small pure-button" @click="emit('editPost', props.post._id)">Edit</button></li>
      <li><button class="button-error btn-small pure-button" @click="deletePost">Delete</button></li>
    </menu>
    <article class="timestamp"></article>
  </div>
</template>

<style scoped>
p {
  margin: 0em;
}

hr {
  stroke: black;
  width: 100%;
  margin: 0;
}

.author {
  font-weight: bold;
  font-size: 1.2em;
}

.subject {
  font-weight: bold;
  font-size: 2em;
  margin: 0;
}

menu {
  list-style-type: none;
  display: flex;
  flex-direction: row;
  gap: 1em;
  padding: 0;
  margin: 0;
}

.timestamp {
  display: flex;
  justify-content: flex-end;
  font-size: 0.9em;
  font-style: italic;
}

.base {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.base article:only-child {
  margin-left: auto;
}

.row {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: flex-end;
}

.subject-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.upvote-container {
  display: flex;
  align-items: center;
  gap: 10px;
}

.upvote-count {
  font-size: 0.9em;
  color: #555;
}

.thumbs-up-button {
  background-color: #9bc0f6;
  border: 1.5px solid black;
  border-radius: 20px;
  padding: 8px 12px;
  font-size: 1.2em;
  cursor: pointer;
}

.thumbs-up-button:hover {
  background-color: #4e70a3;
  border: 1.5px solid black;
}

.thumbs-up-button.upvoted {
  background-color: #4e70a3;
}
</style>
