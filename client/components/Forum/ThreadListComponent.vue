<script setup lang="ts">
import CreateThreadForm from "./CreateThreadForm.vue";
import EditThreadForm from "./EditThreadForm.vue";
import ThreadShortComponent from "./ThreadShortComponent.vue";
import ThreadComponent from "./ThreadComponent.vue";
import { useUserStore } from "@/stores/user";
import { fetchy } from "@/utils/fetchy";
import { storeToRefs } from "pinia";
import { onBeforeMount, ref } from "vue";
import SearchThreadForm from "./SearchThreadForm.vue";

const { isLoggedIn } = storeToRefs(useUserStore());

const loaded = ref(false);
let posts = ref<Array<Record<string, string>>>([]);
let singlePost = ref<Record<string, string>|undefined>(undefined);
let editing = ref("");
let searchAuthor = ref("");
let creating = ref(false);

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
  singlePost.value = undefined;
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
  <div class="row">
    <h2 v-if="!searchAuthor">Posts:</h2>
    <h2 v-else>Posts by {{ searchAuthor }}:</h2>
    <SearchThreadForm @getPostsByAuthor="getPosts" />
  </div>
  <section class="posts" v-if="loaded && posts.length !== 0">
    <section class="postList">
      <button v-if="isLoggedIn" v-on:click="creating = true">New Thread</button>
      <article v-for="post in posts" :key="post._id" v-on:click="()=>singlePost=post">
        <ThreadShortComponent :post="post" @refreshPosts="getPosts" @editPost="updateEditing" />
      </article>
    </section>
    <article class="singlePost">
      <ThreadComponent v-if="singlePost !== undefined && !creating" :post="singlePost" @refreshPosts="getPosts" @editPost="updateEditing"/>
      <CreateThreadForm v-else-if="creating" @refreshPosts="getPosts" @cancelPost="()=>creating=false"/>
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
}

section,
p,
.row {
  margin: 0 auto;
  max-width: 60em;
}

article {
  background-color: var(--base-bg);
  border-radius: 1em;
  display: flex;
  flex-direction: column;
  gap: 0.5em;
  padding: 1em;
}

.posts {
  padding: 1em;
  flex-direction: row;
  justify-content: flex-start;
  width: 100%;
}

.postList {
  flex-direction: column;
  width: 25%;
  margin: 0;
}

.singlePost {
  flex-grow: 1;
}

.row {
  display: flex;
  justify-content: space-between;
  margin: 0 auto;
  max-width: 60em;
}
</style>
