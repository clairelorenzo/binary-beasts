<script setup lang="ts">
import { ref } from "vue";
import { fetchy } from "../../utils/fetchy";

const props = defineProps(["postId"]); // Pass post ID to associate the comment with the post
const content = ref("");
const emit = defineEmits(["refreshComments"]);

const createComment = async (content: string) => {
  try {
    await fetchy(`/api/comments/`, "POST", {
      body: { postId: props.postId, content: content },
    });
  } catch (_) {
    return;
  }
  emit("refreshComments", props.postId);
  emptyForm();
};

const emptyForm = () => {
  content.value = "";
};
</script>

<template>
  <form @submit.prevent="createComment(content)">
    <label for="content">Comment:</label>
    <textarea id="content" v-model="content" placeholder="Add a comment" required></textarea>
    <button type="submit" class="pure-button-primary pure-button">Comment</button>
  </form>
</template>

<style scoped>
form {
  display: flex;
  flex-direction: column;
  gap: 0.5em;
  background-color: #fff;
  padding: 1.5em;
  border-radius: 10px;
  box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.1);
  width: 100%; /* Takes full width */
  margin: 1em 0;
}

label {
  color: #4a2c6e;
  font-weight: bold;
}

textarea {
  height: 4em;
  resize: none;
  border-radius: 5px;
  border: 1px solid #b385d2;
  padding: 0.5em;
  font-family: 'Arial', sans-serif;
  background-color: #f3e8fd;
  color: #4a2c6e;
  width: 100%; /* Makes textarea full width */
}

button {
  background-color: #b385d2; /* Calming purple button */
  color: white;
  border: none;
  border-radius: 5px;
  padding: 0.5em 1em;
  cursor: pointer;
  transition: background-color 0.3s;
  font-family: 'Arial', sans-serif;
}

button:hover {
  background-color: #8e65b7; /* Darker purple on hover */
}
</style>
