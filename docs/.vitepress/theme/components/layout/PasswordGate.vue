<script setup lang="ts">
import { ref, watch } from "vue";
import { useData, useRoute } from "vitepress";

const { frontmatter } = useData();
const route = useRoute();

const entered = ref("");
const err = ref(false);
const unlocked = ref(false);

function check() {
  const hash = frontmatter.value.password;
  if (!hash || typeof hash !== "string") {
    unlocked.value = true;
    return;
  }
  unlocked.value = sessionStorage.getItem("pwd:" + hash) === "1";
}

watch(() => route.path, check, { immediate: true });
watch(() => frontmatter.value.password, check);

async function submit() {
  const hash = frontmatter.value.password;
  if (!hash || typeof hash !== "string") return;
  const hex = await sha256(entered.value);
  if ("sha256:" + hex === hash) {
    sessionStorage.setItem("pwd:" + hash, "1");
    unlocked.value = true;
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
  <template v-if="unlocked">
    <slot />
  </template>
  <div v-else class="pwd-overlay">
    <div class="pwd-dialog">
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
  </div>
</template>
