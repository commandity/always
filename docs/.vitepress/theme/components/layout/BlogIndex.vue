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

function fmtDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("zh-TW", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function setRef(url: string, el: HTMLElement | null) {
  if (el) contentRefs.value.set(url, el);
}

function stripH1(html: string) {
  return html.replace(/<h1[^>]*>[\s\S]*?<\/h1>/, "");
}

onMounted(async () => {
  await nextTick();
  for (const p of filteredPosts.value) {
    const el = contentRefs.value.get(p.url);
    if (el && el.scrollHeight > el.clientHeight) truncated.value.add(p.url);
  }
});
</script>

<template>
  <div class="blog-home">
    <div class="hero">
      <h1>
        <span class="hero-icon">✦</span>
        <span class="hero-text">靜心閣</span>
        <span class="hero-icon">✦</span>
      </h1>
      <p>心得 ✏️ | 日記 📒 | 分享 💡</p>
      <span class="hero-count">{{ posts.length }} 篇文章</span>
    </div>

    <div class="tags">
      <button
        class="tag"
        :class="{ on: selectedTag === null }"
        @click="selectedTag = null"
      >
        全部
      </button>
      <button
        v-for="t in allTags"
        :key="t"
        class="tag"
        :class="{ on: selectedTag === t }"
        @click="selectTag(t)"
      >
        {{ t }}
      </button>
    </div>

    <div class="stack">
      <article v-for="post in filteredPosts" :key="post.url" class="entry">
        <time class="entry-date">{{ fmtDate(post.date) }}</time>
        <h2 class="entry-title">
          <a :href="post.url" class="entry-link">{{ post.title }}</a>
        </h2>
        <div
          :ref="(el: any) => setRef(post.url, el as HTMLElement | null)"
          class="entry-body"
          :class="{ truncated: truncated.has(post.url) }"
          v-html="stripH1(post.html)"
        />
        <div class="entry-foot">
          <span class="entry-meta">
            <template v-if="post.category">
              <span class="entry-cat">{{ post.category }}</span>
              <template v-if="post.tags.length"> · </template>
            </template>
            <span
              v-for="(t, i) in post.tags"
              :key="t"
              class="entry-tag"
              :class="{ on: selectedTag === t }"
              @click="selectTag(t)"
              >{{ i ? ", " : "" }}{{ t }}</span
            >
          </span>
          <a :href="post.url" class="entry-more">繼續閱讀 →</a>
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

.hero {
  text-align: center;
  padding: 1.5rem 0 2rem;
  margin-bottom: 2rem;
  border-bottom: 1px solid var(--vp-c-divider);
}

.hero h1 {
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
.hero p {
  color: var(--vp-c-text-2);
  font-size: 1.1rem;
  margin: 0 0 1.25rem;
}
.hero-count {
  display: inline-block;
  border: 1px solid var(--vp-c-divider);
  border-radius: 999px;
  padding: 3px 14px;
  font-size: 0.82rem;
  color: var(--vp-c-text-3);
}

.tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 2.5rem;
}

.tag {
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

.tag:hover {
  border-color: var(--vp-c-brand-1);
  color: var(--vp-c-brand-1);
}
.tag.on {
  background: var(--vp-c-brand-1);
  border-color: var(--vp-c-brand-1);
  color: #fff;
  font-weight: 600;
}

.stack {
  display: flex;
  flex-direction: column;
  gap: 3.5rem;
}

.entry {
  border-bottom: 1px solid var(--vp-c-divider);
  padding-bottom: 3rem;
}

.entry:last-child {
  border-bottom: none;
}

.entry-date {
  display: block;
  font-size: 0.78rem;
  color: var(--vp-c-text-3);
  text-transform: uppercase;
  letter-spacing: 0.06em;
  margin-bottom: 0.5rem;
}

.entry-title {
  font-size: 1.4rem;
  font-weight: 700;
  margin: 0 0 1rem;
  line-height: 1.35;
}

.entry-link {
  color: var(--vp-c-text-1);
  text-decoration: none;
  transition: color 0.2s;
}

.entry-link:hover {
  color: var(--vp-c-brand-1);
}

.entry-body {
  max-height: 600px;
  overflow: hidden;
  position: relative;
  line-height: 1.7;
}

.entry-body.truncated::after {
  content: "";
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 120px;
  background: linear-gradient(transparent, var(--vp-c-bg));
  pointer-events: none;
}

.entry-body :deep(img) {
  max-width: 100%;
  border-radius: 8px;
  margin: 1rem 0;
}
.entry-body :deep(blockquote) {
  border-left: 3px solid var(--vp-c-brand-1);
  margin: 1rem 0;
  padding: 0.5rem 1rem;
  color: var(--vp-c-text-2);
  background: var(--vp-c-bg-soft);
  border-radius: 0 6px 6px 0;
}
.entry-body :deep(p) {
  margin: 0.75rem 0;
}
.entry-body :deep(h2),
.entry-body :deep(h3) {
  margin: 1.5rem 0 0.75rem;
}
.entry-body :deep(ul),
.entry-body :deep(ol) {
  padding-left: 1.5rem;
}
.entry-body :deep(a) {
  color: var(--vp-c-brand-1);
}

.entry-foot {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 12px;
  margin-top: 1.25rem;
  flex-wrap: wrap;
}

.entry-meta {
  font-size: 0.78rem;
  color: var(--vp-c-text-3);
}

.entry-cat {
  font-weight: 600;
  color: var(--vp-c-text-2);
}

.entry-tag {
  cursor: pointer;
  transition: color 0.2s;
}

.entry-tag.on,
.entry-tag:hover {
  color: var(--vp-c-brand-1);
}

.entry-more {
  font-size: 0.82rem;
  color: var(--vp-c-brand-1);
  text-decoration: none;
  font-weight: 600;
  transition: opacity 0.2s;
  white-space: nowrap;
}

.entry-more:hover {
  opacity: 0.7;
}

@media (max-width: 767px) {
  .entry-title {
    font-size: 1.15rem;
  }
}
</style>
