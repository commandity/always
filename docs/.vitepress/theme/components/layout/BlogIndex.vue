<script setup lang="ts">
import { useRouter } from "vitepress";
import { data as posts } from "../../posts.data.ts";
import { ref, computed, onMounted, nextTick } from "vue";

const router = useRouter();
const selectedTag = ref<string | null>(null);
const contentRefs = ref<Map<string, HTMLElement>>(new Map());
const truncated = ref<Set<string>>(new Set());

const allTags = computed(() => {
  const tags = new Set<string>();
  posts.forEach((p) => p.tags?.forEach((t: string) => tags.add(t)));
  return [...tags].sort();
});

const filteredPosts = computed(() =>
  selectedTag.value
    ? posts.filter((p) => p.tags?.includes(selectedTag.value!))
    : posts,
);

function selectTag(tag: string) {
  selectedTag.value = selectedTag.value === tag ? null : tag;
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("zh-TW", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function setContentRef(url: string, el: HTMLElement | null) {
  if (el) contentRefs.value.set(url, el);
}

function withoutTitle(html: string) {
  return html.replace(/<h1[^>]*>[\s\S]*?<\/h1>/, "");
}

onMounted(async () => {
  await nextTick();
  for (const p of filteredPosts.value) {
    const el = contentRefs.value.get(p.url);
    if (el && el.scrollHeight > el.clientHeight) {
      truncated.value.add(p.url);
    }
  }
});
</script>

<template>
  <div class="blog-home">
    <div class="blog-hero">
      <h1>
        <span class="hero-icon">✦</span>
        <span class="hero-text">靜心閣</span>
        <span class="hero-icon">✦</span>
      </h1>
      <p>心得 ✏️ | 日記 📒 | 分享 💡</p>
      <div class="blog-hero__count">{{ posts.length }} 篇文章</div>
    </div>

    <div class="tag-bar">
      <button
        class="tag-btn"
        :class="{ active: selectedTag === null }"
        @click="selectedTag = null"
      >
        全部
      </button>
      <button
        v-for="tag in allTags"
        :key="tag"
        class="tag-btn"
        :class="{ active: selectedTag === tag }"
        @click="selectTag(tag)"
      >
        {{ tag }}
      </button>
    </div>

    <div class="posts-stack">
      <article v-for="post in filteredPosts" :key="post.url" class="post-box">
        <h2 class="post-title">
          <a :href="post.url" class="post-title-link">{{ post.title }}</a>
        </h2>
        <div class="post-meta">
          <time class="post-date">{{ formatDate(post.date) }}</time>
          <span v-if="post.category" class="post-category">{{
            post.category
          }}</span>
        </div>

        <div
          :ref="(el: any) => setContentRef(post.url, el as HTMLElement | null)"
          class="post-content"
          :class="{ truncated: truncated.has(post.url) }"
          v-html="withoutTitle(post.html)"
        />

        <div class="post-foot">
          <span
            v-for="tag in post.tags"
            :key="tag"
            class="post-tag"
            :class="{ active: selectedTag === tag }"
            @click="selectTag(tag)"
            >{{ tag }}</span
          >
          <a :href="post.url" class="post-read-more">繼續閱讀 →</a>
        </div>
      </article>
    </div>
  </div>
</template>

<style scoped>
.blog-home {
  max-width: 752px;
  margin: 0 auto;
  padding: 32px 24px 96px;
  width: 100%;
}

@media (min-width: 768px) {
  .blog-home {
    padding: 48px 32px 128px;
  }
}

@media (min-width: 960px) {
  .blog-home {
    padding: 48px 0 0;
  }
}

@media (min-width: 1440px) {
  .blog-home {
    max-width: 784px;
  }
}

.blog-hero {
  text-align: center;
  padding: 1.5rem 0 2rem;
  margin-bottom: 2rem;
  border-bottom: 1px solid var(--vp-c-divider);
}
.blog-hero h1 {
  font-size: 3rem;
  font-weight: 800;
  letter-spacing: -0.03em;
  line-height: 1.3;
  margin: 0 0 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.3em;
}
.hero-text {
  background: linear-gradient(
    135deg,
    var(--vp-c-brand-1),
    var(--vp-c-brand-2, var(--vp-c-text-1))
  );
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}
.hero-icon {
  font-size: 1.6rem;
  color: var(--vp-c-brand-1);
  opacity: 0.6;
  -webkit-text-fill-color: initial;
}
.blog-hero p {
  color: var(--vp-c-text-2);
  font-size: 1.1rem;
  margin: 0 0 1.25rem;
}
.blog-hero__count {
  display: inline-block;
  border: 1px solid var(--vp-c-divider);
  border-radius: 999px;
  padding: 3px 14px;
  font-size: 0.82rem;
  color: var(--vp-c-text-3);
}

.tag-bar {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 2.5rem;
}
.tag-btn {
  padding: 5px 16px;
  border-radius: 999px;
  border: 1px solid var(--vp-c-divider);
  background: transparent;
  color: var(--vp-c-text-2);
  font-size: 0.82rem;
  cursor: pointer;
  transition: all 0.2s;
  font-family: inherit;
}
.tag-btn:hover {
  border-color: var(--vp-c-brand-1);
  color: var(--vp-c-brand-1);
}
.tag-btn.active {
  background: var(--vp-c-brand-1);
  border-color: var(--vp-c-brand-1);
  color: #fff;
  font-weight: 600;
}

.posts-stack {
  display: flex;
  flex-direction: column;
  gap: 3rem;
}

.post-box {
  border-bottom: 1px solid var(--vp-c-divider);
  padding: 0 0 2.5rem;
}
.post-box:last-child {
  border-bottom: none;
}

.post-title {
  font-size: 1.35rem;
  font-weight: 700;
  margin: 0 0 0.4rem;
  line-height: 1.35;
}
.post-title-link {
  color: var(--vp-c-text-1);
  text-decoration: none;
  transition: color 0.2s;
}
.post-title-link:hover {
  color: var(--vp-c-brand-1);
}

.post-meta {
  font-size: 0.78rem;
  color: var(--vp-c-text-3);
  margin-bottom: 1rem;
}
.post-date + .post-category::before {
  content: " · ";
}
.post-category {
  font-weight: 600;
  color: var(--vp-c-text-2);
}

.post-content {
  max-height: 640px;
  overflow: hidden;
  position: relative;
  line-height: 1.7;
}
.post-content.truncated::after {
  content: "";
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 150px;
  background: linear-gradient(transparent, var(--vp-c-bg));
  pointer-events: none;
}

.post-content :deep(img) {
  max-width: 100%;
  border-radius: 8px;
  margin: 1rem 0;
}
.post-content :deep(blockquote) {
  border-left: 3px solid var(--vp-c-brand-1);
  margin: 1rem 0;
  padding: 0.5rem 1rem;
  color: var(--vp-c-text-2);
  background: var(--vp-c-bg-soft);
  border-radius: 0 6px 6px 0;
}
.post-content :deep(p) {
  margin: 0.75rem 0;
}
.post-content :deep(h1),
.post-content :deep(h2),
.post-content :deep(h3) {
  margin: 1.5rem 0 0.75rem;
}
.post-content :deep(ul),
.post-content :deep(ol) {
  padding-left: 1.5rem;
}
.post-content :deep(a) {
  color: var(--vp-c-brand-1);
}

.post-foot {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 12px;
  margin-top: 0.75rem;
  flex-wrap: wrap;
}
.post-tag {
  font-size: 0.78rem;
  color: var(--vp-c-text-3);
  cursor: pointer;
  transition: color 0.2s;
}
.post-tag:hover,
.post-tag.active {
  color: var(--vp-c-brand-1);
}
.post-tag + .post-tag::before {
  content: ", ";
}
.post-read-more {
  font-size: 0.85rem;
  color: var(--vp-c-brand-1);
  text-decoration: none;
  font-weight: 600;
  transition: opacity 0.2s;
  white-space: nowrap;
}
.post-read-more:hover {
  opacity: 0.7;
}

@media (max-width: 767px) {
  .post-title {
    font-size: 1.15rem;
  }
}
</style>
