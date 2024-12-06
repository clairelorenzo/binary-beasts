<script setup lang="ts">
import { useUserStore } from "@/stores/user";
import { formatDate } from "@/utils/formatDate";
import { storeToRefs } from "pinia";
import { fetchy } from "../../utils/fetchy";
import { defineProps } from "vue";

const props = defineProps(["post", "upvotes", "alreadyUpvoted"]);
const emit = defineEmits(["editPost", "refreshPosts", "updateUpvotes"]);
const { currentUsername } = storeToRefs(useUserStore());

const deletePost = async () => {
  try {
    await fetchy(`/api/posts/${props.post._id}`, "DELETE");
  } catch {
    return;
  }
  emit("refreshPosts");
};

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
  if (props.alreadyUpvoted) {
    emit("updateUpvotes", props.upvotes - 1);
    emit("updateAlreadyUpvoted", !props.alreadyUpvoted);
    await removeUpvote();
  } else {
    emit("updateUpvotes", props.upvotes + 1);
    emit("updateAlreadyUpvoted", !props.alreadyUpvoted);
    await upvote();
  }
}
</script>

<template>
  <div class="subject-container">
    <p class="subject">{{ props.post.subject }}</p>
    <div class="upvote-container">
      <span class="upvote-count">
        {{ props.upvotes }}
        <span v-if="props.upvotes === 1">upvote</span>
        <span v-else> upvotes</span>
      </span>
      <button class="thumbs-up-button" :class="{ upvoted: props.alreadyUpvoted }" @click="toggleUpvote">👍</button>
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
