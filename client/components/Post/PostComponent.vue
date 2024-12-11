<script setup lang="ts">
import { useUserStore } from "@/stores/user";
import { formatDate } from "@/utils/formatDate";
import { storeToRefs } from "pinia";
import { onBeforeMount, ref } from "vue";
import { fetchy } from "../../utils/fetchy";

const props = defineProps(["post"]);
const emit = defineEmits(["editPost", "refreshPosts"]);
const { currentUsername } = storeToRefs(useUserStore());
const numUpvotes = ref<number>(0);
const alreadyUpvoted = ref<boolean>(false);

const deletePost = async () => {
  try {
    await fetchy(`/api/posts/${props.post._id}`, "DELETE");
  } catch {
    return;
  }
  emit("refreshPosts");
};

async function getNumUpvotes() {
  let query: Record<string, string> = { post: props.post._id };
  try {
    numUpvotes.value = await fetchy(`/api/upvotes/numUpvotes`, "GET", { query });
  } catch (error) {
    console.error("Error getting the number of upvotes for this post", error);
  }
}

async function upvote() {
  let query: Record<string, string> = { post: props.post._id };
  try {
    await fetchy(`/api/upvotes`, "POST", { query });
  } catch (error) {
    console.error("Error upvoting", error);
  }
}

async function removeUpvote() {
  let query: Record<string, string> = { post: props.post._id };
  try {
    await fetchy(`/api/upvotes`, "DELETE", { query });
  } catch (error) {
    console.error("Error removing upvote", error);
  }
}

async function toggleUpvote() {
  if (alreadyUpvoted.value) {
    alreadyUpvoted.value = !alreadyUpvoted.value;
    numUpvotes.value -= 1;
    await removeUpvote();
  } else {
    alreadyUpvoted.value = !alreadyUpvoted.value;
    numUpvotes.value += 1;
    await upvote();
  }
}

async function checkUserAlreadyUpvoted() {
  let query: Record<string, string> = { post: props.post._id };
  try {
    alreadyUpvoted.value = await fetchy(`/api/upvotes/user`, "GET", { query });
  } catch (error) {
    console.error("Error checking if user already upvoted", error);
  }
}

onBeforeMount(async () => {
  await getNumUpvotes();
  await checkUserAlreadyUpvoted();
});
</script>

<template>
  <div class="author_and_upvotes">
    <p class="author">{{ props.post.author }}</p>
    <div class="upvote-container">
      <span class="upvote-count">
        {{ numUpvotes }}
        <span v-if="numUpvotes === 1">upvote</span>
        <span v-else> upvotes</span>
      </span>
      <button class="thumbs-up-button" :class="{ upvoted: alreadyUpvoted }" @click="toggleUpvote">👍</button>
    </div>
  </div>
  <p>{{ props.post.content }}</p>
  <iframe v-if="props.post.picture" :src="props.post.picture" width="640" height="480"></iframe>
  <div class="base">
    <menu v-if="props.post.author == currentUsername">
      <li><button class="btn-small pure-button" @click="emit('editPost', props.post._id)">Edit</button></li>
      <li><button class="button-error btn-small pure-button" @click="deletePost">Delete</button></li>
    </menu>
    <article class="timestamp">
      <p v-if="props.post.dateCreated !== props.post.dateUpdated">Edited on: {{ formatDate(props.post.dateUpdated) }}</p>
      <p v-else>Created on: {{ formatDate(props.post.dateCreated) }}</p>
    </article>
  </div>
</template>

<style scoped>
p {
  margin: 0em;
}

.author {
  font-weight: bold;
  font-size: 1.2em;
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
  border-radius: 20px;
  padding: 8px 12px;
  font-size: 1.2em;
  cursor: pointer;
  margin-left: auto;
}

.thumbs-up-button:hover {
  background-color: var(--dblue);
}

.thumbs-up-button.upvoted {
  background-color: var(--dblue);
}

.author_and_upvotes {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>
