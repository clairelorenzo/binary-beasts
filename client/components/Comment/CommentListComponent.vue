<script setup lang="ts">
import { onBeforeMount, ref } from "vue";
import { fetchy } from "../../utils/fetchy";
const props = defineProps(["postId"]);
const comments = ref<Array<Record<string,string>>>([]);

const loadComments = async () => {
  try {
    comments.value = await fetchy(`/api/comments/`, "GET", { query: { postId: props.postId } });
  } catch (e) {
    console.error("Error loading comments", e);
  }
};

onBeforeMount(loadComments);
</script>

<template>
  <section class="comments-section">
    <h3>Comments</h3>
    <div v-if="comments.length">
      <article v-for="comment in comments" :key="comment._id">
        <p class="comment-container"><strong>{{ comment.author }}:</strong> {{ comment.content }}</p>
      </article>
    </div>
    <p v-else>No comments yet.</p>
  </section>
</template>

<style scoped>
.comments-section {
  margin-top: 1em;
}

article {
  background-color: #e8d3f7; /* Softer purple for comment backgrounds */
  border-radius: 4px;
  padding: 0.5em; /* Padding for comments */
  margin-bottom: 0.5em; /* Margin for spacing */
}

/* Comment styling */
.comment-container {
  background-color: #f7f2fc; /* Lightest purple for comments */
  padding: 0.4em 0.6em; /* Reduced padding for tighter spacing */
  margin: 0.3em 0; /* Reduced margin between comments */
  border-radius: 5px;
  font-size: 0.85em;
  color: #3d1a52; /* Deep purple text color */
  text-align: left; /* Left-aligned comments */
}

/* Heading styling */
h3 {
  color: #4b2e67; /* Deep purple for heading */
}
</style>
