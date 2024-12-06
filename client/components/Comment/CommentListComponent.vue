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
  background-color: white;
  align-items: left;
}

article {
  border-radius: 4px;
  align-items: left;
}

/* Comment styling */
.comment-container {
  padding: 0.4em 0.6em; 
  margin: 0.3em 0; 
  border-radius: 5px;
  font-size: 0.85em;
  color: var(--dblue); 
  text-align: left;
}

/* Heading styling */
h3 {
  color: #4b2e67; /* Deep purple for heading */
}
</style>
