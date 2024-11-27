<script setup lang="ts">
import { ref } from "vue";
import { fetchy } from "../../utils/fetchy";

const content = ref("");
const subject = ref("");
const emit = defineEmits(["refreshPosts", "cancelPost"]);

const createPost = async (content: string) => {
  try {
    await fetchy("/api/posts", "POST", {
      body: { content:content, subject:subject.value },
    });
  } catch (_) {
    return;
  }
  emit("cancelPost");
  emit("refreshPosts");
  emptyForm();
};

const cancel = () => {
  emit('cancelPost');
  emptyForm();
}

const emptyForm = () => {
  content.value = "";
  subject.value = ""
};
</script>

<template>
  <form @submit.prevent="createPost(content)">
    <label for="subject">Post Subject:</label>
    <textarea id="subject" v-model="subject" placeholder="Name a post!" required> </textarea>
    <label for="content">Post Contents:</label>
    <textarea id="content" v-model="content" placeholder="Create a post!" required> </textarea>
    <div class="row button-area">
      <button class="button-error btn-small pure-button" v-on:click="cancel()">Cancel</button>
      <button type="submit" class="pure-button-primary btn-small pure-button">Create Post</button>
    </div>
  </form>
</template>

<style scoped>
form {
  background-color: var(--base-bg);
  border-radius: 1em;
  display: flex;
  flex-direction: column;
  gap: 0.5em;
  padding: 1em;
}

textarea {
  font-family: inherit;
  font-size: inherit;
  height: 6em;
  padding: 0.5em;
  border-radius: 4px;
  resize: none;
}

.button-area > * {
  margin-right: 1vw;
}
</style>
