<script setup lang="ts">
import { ref } from "vue";
import { fetchy } from "../../utils/fetchy";

const content = ref("");
const picture = ref("");
const emit = defineEmits(["refreshPosts"]);

const createPost = async (content: string, picture: string) => {
  try {
    await fetchy("/api/posts", "POST", {
      body: { content, picture },
    });
  } catch (_) {
    return;
  }
  emit("refreshPosts");
  emptyForm();
};

const emptyForm = () => {
  content.value = "";
  picture.value = "";
};
</script>

<template>
  <form @submit.prevent="createPost(content, picture)">
    <label for="content">Post Contents:</label>
    <textarea id="content" v-model="content" placeholder="Add a caption!" required> </textarea>
    <textarea id="picture" v-model="picture" placeholder="Add a google drive link to your picture!" required> </textarea>
    <button type="submit" class="pure-button-primary pure-button">Create Post</button>
  </form>
</template>

<style scoped>
form {
  background-color: var(--sbeige);
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

#content, #picture{
  height: 2vh;
}
</style>
