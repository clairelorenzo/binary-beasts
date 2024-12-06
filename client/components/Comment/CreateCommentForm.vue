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
  gap: 0.8em;
  background-color: #CBDCF5; /* Soft beige background */
  padding: 1.5em;
  border-radius: 10px;
  box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.1);
  width: 100%; /* Takes full width */
  margin: 1em 0;
  width: 90%;
  align-items: center;
}

label {
  color: #4E70A3; /* Dark blue for label */
  font-weight: bold;
  font-size: 1.1em;
}

textarea {
  height: 4em;
  resize: none;
  border-radius: 8px;
  border: 1px solid #CBDCF5; /* Light blue border */
  padding: 0.8em;
  font-family: 'Arial', sans-serif;
  background-color: var(--sbeige); /* Light greenish background */
  color: #4E70A3; /* Dark blue text */
  width: 100%;
  transition: border-color 0.3s ease;
}

textarea:focus {
  border-color: #4E70A3; /* Focus border color */
}

button {
  background-color: #4E70A3; /* Blue button background */
  color: #F1EFEB; /* Light text on button */
  border: none;
  border-radius: 8px;
  padding: 0.6em 1.2em;
  cursor: pointer;
  transition: background-color 0.3s;
  font-family: 'Arial', sans-serif;
  font-weight: bold;
}

button:hover {
  background-color: #3D1A52; /* Darker blue on hover */
}

/* Adjustments for responsiveness */
@media (max-width: 768px) {
  form {
    padding: 1em;
  }
}

</style>
