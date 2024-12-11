<script setup lang="ts">
import CreatePostForm from "@/components/Post/CreatePostForm.vue";
import EditPostForm from "@/components/Post/EditPostForm.vue";
import PostComponent from "@/components/Post/PostComponent.vue";
import { useUserStore } from "@/stores/user";
import { fetchy } from "@/utils/fetchy";
import { storeToRefs } from "pinia";
import { onBeforeMount, ref } from "vue";
import CommentListComponent from "../Comment/CommentListComponent.vue";
import CreateCommentForm from "../Comment/CreateCommentForm.vue";
import SearchPostForm from "./SearchPostForm.vue";

const { isLoggedIn } = storeToRefs(useUserStore());

const loaded = ref(false);
let posts = ref<Array<Record<string, string>>>([]);
let editing = ref("");
let searchAuthor = ref("");

async function getPosts(author?: string) {
  let query: Record<string, string> = author !== undefined ? { author } : {};
  let postResults;
  try {
    postResults = await fetchy("/api/posts", "GET", { query });
  } catch (_) {
    return;
  }
  searchAuthor.value = author ? author : "";
  posts.value = postResults;
}

const comments = ref<Array<Record<string,string>>>([]);

async function loadComments(postId: string) {
  let commentResults;
  try {
    commentResults = await fetchy("/api/comments/", "GET", {body: {postId:postId}});
  } catch (_) {
    return;
  }
  comments.value = commentResults;
  
}

function updateEditing(id: string) {
  editing.value = id;
}

onBeforeMount(async () => {
  await getPosts();
  loaded.value = true;
});
</script>

<template>
  <section v-if="isLoggedIn">
    <CreatePostForm @refreshPosts="getPosts" />
  </section>
  <div class="row">
    <h2 v-if="!searchAuthor">Posts:</h2>
    <h2 v-else>Posts by {{ searchAuthor }}:</h2>
    <SearchPostForm @getPostsByAuthor="getPosts" />
  </div>
  <section class="posts" v-if="loaded && posts.length !== 0">
    <article v-for="post in posts.filter(post => post.picture !== null)" :key="post._id">
      
      <PostComponent class="post-container" v-if="editing !== post._id" :post="post" @refreshPosts="getPosts" @editPost="updateEditing" showComments/>
      <EditPostForm v-else :post="post" @refreshPosts="getPosts" @editPost="updateEditing" />
      <CommentListComponent :postId="post._id" />
      <CreateCommentForm :postId="post._id" @refresh-comments="loadComments" />

    </article>
  </section>
  <p v-else-if="loaded">No posts found</p>
  <p v-else>Loading...</p>
</template>

<style scoped>
section {
  display: flex;
  flex-direction: column;
  gap: 1em;
  background-color: var(--sbeige);
  padding: 1.5em;
  border-radius: 15px;
  box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.1); /* Shadow for depth */
}

section,
p,
.row {
  margin: 0 auto;
  max-width: 60em;
}

article {
  background-color: white;
  border-radius: 1em;
  display: flex;
  flex-direction: column;
  gap: 0.5em;
  padding: 1em;
  box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.1); /* Soft shadow for depth */
}

.posts {
  padding: 1em;
}

/* Header Section */
h2 {
  color: #4E70A3; /* Dark blue for headers */
  font-size: 3vw;
  font-weight: bold;
  margin-bottom: 1em;
}

/* Row styling for the search and filter */
.row {
  display: flex;
  justify-content: space-between;
  margin: 0 auto;
  max-width: 60em;
}

/* Post styling */
.post-container {
  background-color: #CBDCF5; /* Soft blue background for posts */
  padding: 1.2em;
  margin: 0.8em 0;
  border-radius: 8px;
  box-shadow: 0px 2px 5px rgba(0, 0, 0, 0.08);
  font-size: 1em;
  color: #3D1A52; /* Deep purple text for contrast */
  font-weight: bold;
  transition: background-color 0.3s ease;
}

.post-container:hover {
  background-color: #4E70A3; /* Hover effect to a deeper blue */
  color: #F1EFEB; /* Change text color on hover */
}

.post-container .post-title {
  font-size: 1.2em;
  margin-bottom: 0.5em;
  font-weight: bold;
}

/* Edit post form and create post form styling */
input, textarea, button {
  border-radius: 8px;
  border: 1px solid #CBDCF5; /* Border to match the light blue theme */
  padding: 0.8em;
  font-size: 1em;
  margin-bottom: 1em;
}

button {
  background-color: #4E70A3; /* Blue button for actions */
  color: #F1EFEB; /* Light text on button */
  font-weight: bold;
  cursor: pointer;
}

button:hover {
  background-color: #3D1A52; /* Darker blue on hover */
}

/* Comment styling */
.comment-container {
  padding: 0.8em;
  margin: 0.5em 0;
  border-radius: 5px;
  font-size: 0.9em;
  color: #3D1A52; /* Matching deep purple text */
  transition: background-color 0.3s ease;
}

.comment-container:hover {
  background-color: #CBDCF5; /* Soft blue hover effect */
}

/* Search bar styling */
input[type="text"] {
  padding: 1em;
  border-radius: 8px;
  border: 1px solid #CBDCF5;
  font-size: 1em;
  margin-top: 1em;
  width: 100%;
  box-sizing: border-box;
  transition: border-color 0.3s ease;
}

input[type="text"]:focus {
  border-color: #4E70A3; /* Focus effect for the search bar */
}

/* Adjustments for mobile responsiveness */
@media (max-width: 768px) {
  .row {
    flex-direction: column;
    align-items: center;
  }

  section {
    padding: 1em;
  }
}

</style>
