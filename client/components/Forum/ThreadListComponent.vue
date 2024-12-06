<script setup lang="ts">
import { useUserStore } from "@/stores/user";
import { fetchy } from "@/utils/fetchy";
import { storeToRefs } from "pinia";
import { onBeforeMount, ref } from "vue";
import CreateThreadForm from "./CreateThreadForm.vue";
import EditThreadForm from "./EditThreadForm.vue";
import SearchThreadForm from "./SearchThreadForm.vue";
import ThreadComponent from "./ThreadComponent.vue";
import ThreadShortComponent from "./ThreadShortComponent.vue";

const { isLoggedIn } = storeToRefs(useUserStore());

const loaded = ref(false);
let posts = ref<Array<Record<string, string>>>([]);
let singlePost = ref<Record<string, string> | undefined>(undefined);
let editing = ref(false);
let searchAuthor = ref("");
let creating = ref(false);
const numUpvotes = ref<number>(0);
const isUpvoted = ref<boolean>(false);

async function getNumUpvotes(post: string) {
  let query: Record<string, string> = { post: post };
  try {
    return await fetchy(`/api/upvotes/numUpvotes`, "GET", { query });
  } catch (error) {
    console.error("Error getting the number of upvotes for this post", error);
  }
}

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

async function fullRefresh(author?: string) {
  await getPosts(author);
  singlePost.value = undefined;
}

function updateEditing() {
  editing.value = !editing.value;
}

function updateUpvotes(newUpvotes: number) {
  numUpvotes.value = newUpvotes;
}

function updateAlreadyUpvoted(newVal: boolean) {
  isUpvoted.value = newVal;
}

async function checkUserAlreadyUpvoted(post: string) {
  let query: Record<string, string> = { post: post };
  try {
    // isUpvoted.value = await fetchy(`/api/upvotes/user`, "GET", { query });
    return await fetchy(`/api/upvotes/user`, "GET", { query });
  } catch (error) {
    console.error("Error checking if user already upvoted", error);
  }
}

onBeforeMount(async () => {
  await getPosts();
  loaded.value = true;
});
</script>

<template>
  <div class="row">
    <p class="subject">{{ "singlePost._id" }}</p>
    <h2 v-if="!searchAuthor">Posts:</h2>
    <h2 v-else>Posts by {{ searchAuthor }}:</h2>
    <SearchThreadForm @getPostsByAuthor="fullRefresh" />
  </div>
  <section class="posts" v-if="loaded">
    <section class="postList">
      <button class="pure-button-primary pure-button" v-if="isLoggedIn" v-on:click="creating = true">New Thread</button>
      <article
        v-for="post in posts"
        :key="post._id"
        v-on:click="
          async () => {
            singlePost = post;
            numUpvotes = await getNumUpvotes(singlePost._id);
            isUpvoted = await checkUserAlreadyUpvoted(singlePost._id);
          }
        "
      >
        <ThreadShortComponent :post="post" @editPost="updateEditing" />
      </article>
    </section>
    <article class="singlePost">
      <ThreadComponent
        v-if="singlePost !== undefined && !creating && !editing && posts.length > 0"
        :post="singlePost"
        :upvotes="numUpvotes"
        :alreadyUpvoted="isUpvoted"
        @refreshPosts="fullRefresh"
        @editPost="updateEditing"
        @updateUpvotes="updateUpvotes"
        @updateAlreadyUpvoted="updateAlreadyUpvoted"
      />
      <CreateThreadForm v-else-if="creating" @refreshPosts="getPosts" @cancelPost="() => (creating = false)" />
      <EditThreadForm v-else-if="editing && posts.length > 0" :post="singlePost" @refreshPosts="getPosts" @editPost="updateEditing" />
    </article>
  </section>
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
  margin: 0 1em;
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
  margin: 0 1em;
  flex-direction: row;
  justify-content: space-between;
  height: 70vh;
}

.postList {
  flex-direction: column;
  width: 25%;
  flex-shrink: 0;
  margin: 0;
  overflow-y: auto;
}

.singlePost {
  flex-grow: 1;
  padding: 1em;
}

.row {
  display: flex;
  justify-content: space-between;
}
</style>
