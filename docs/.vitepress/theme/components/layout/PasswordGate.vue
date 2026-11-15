<script setup lang="ts">
import { ref, watch, onBeforeUnmount } from "vue";
import { useData, useRoute, inBrowser } from "vitepress";

// Rendered into VPDoc's "doc-before" slot (see theme/index.ts), i.e.
// inline with the article body — not a layout-level overlay. Locking
// a page hides only the <main> content via a body class in CSS; the
// nav bar, sidebar, aside and footer are untouched and stay fully
// usable, the way old-school blog platforms (無名小站 etc.) blocked
// just the post body while leaving the rest of the page alone.
const { frontmatter } = useData();
const route = useRoute();

const entered = ref("");
const err = ref(false);
const locked = ref(false);

function check() {
  if (!inBrowser) return;
  const hash = frontmatter.value.password;
  locked.value =
    !!hash &&
    typeof hash === "string" &&
    sessionStorage.getItem("pwd:" + hash) !== "1";
  document.body.classList.toggle("pwd-locked", locked.value);
}

watch(() => route.path, check, { immediate: true });
watch(() => frontmatter.value.password, check);
onBeforeUnmount(() => {
  if (inBrowser) document.body.classList.remove("pwd-locked");
});

async function submit() {
  const hash = frontmatter.value.password;
  if (!hash || typeof hash !== "string") return;
  const hex = await sha256(entered.value);
  if ("sha256:" + hex === hash) {
    sessionStorage.setItem("pwd:" + hash, "1");
    locked.value = false;
    document.body.classList.remove("pwd-locked");
    err.value = false;
  } else {
    err.value = true;
  }
}

async function sha256(s: string): Promise<string> {
  const buf = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(s),
  );
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}
</script>

<template>
  <div v-if="locked" class="pwd-box">
    <h2>Protected Page</h2>
    <p>Enter the password to view this page.</p>
    <input
      v-model="entered"
      type="password"
      :class="{ error: err }"
      @keyup.enter="submit"
      placeholder="Password"
      autofocus
    />
    <button @click="submit">Unlock</button>
    <p v-if="err" class="pwd-error">Incorrect password. Try again.</p>
  </div>
</template>
