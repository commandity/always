<script setup lang="ts">
import { data as posts } from "../../posts.data.ts";
import { ref, computed, watch, nextTick, onMounted } from "vue";

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
  else contentRefs.value.delete(url);
}

function stripH1(html: string) {
  return html.replace(/<h1[^>]*>[\s\S]*?<\/h1>/, "");
}

function stripCoverImg(html: string, cover: string) {
  if (!cover) return html;
  return html.replace(
    /(<p>\s*)?<img[^>]*src="([^"]*)"[^>]*>(\s*<\/p>)?/,
    (match, _pOpen, src, _pClose) => (src === cover ? "" : match),
  );
}

function detect() {
  truncated.value = new Set();
  nextTick().then(() => {
    const posts = filteredPosts.value;
    for (const p of posts) {
      if (p.abstract) continue;
      const el = contentRefs.value.get(p.url);
      if (!el) continue;
      const lh = parseFloat(getComputedStyle(el).lineHeight);
      const th = (isNaN(lh) ? 27 : lh) * 10;
      if (el.scrollHeight > th) truncated.value.add(p.url);
    }
  });
}

onMounted(detect);
watch(filteredPosts, detect);
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

    <div class="blog-grid">
      <article v-for="post in filteredPosts" :key="post.url" class="blog-card">
        <div v-if="post.cover" class="blog-card__cover">
          <img :src="post.cover" :alt="post.title" class="cover-img" />
        </div>

        <div class="blog-card__body" :class="{ 'no-cover': !post.cover }">
          <div class="card-meta">
            <span class="card-date">{{ formatDate(post.date) }}</span>
            <span v-if="post.category" class="meta-category">{{
              post.category
            }}</span>
          </div>

          <h2 class="card-title">{{ post.title }}</h2>

          <template v-if="post.abstract">
            <div class="card-body-abstract">
              <p>{{ post.abstract }}</p>
            </div>
          </template>
          <template v-else>
            <div class="card-body-content">
              <div
                class="card-body-text"
                :class="{ truncated: truncated.has(post.url) }"
                :ref="
                  (el: any) => setContentRef(post.url, el as HTMLElement | null)
                "
                v-html="stripCoverImg(stripH1(post.html), post.cover)"
              />
              <div v-if="truncated.has(post.url)" class="card-body-more">
                ......
              </div>
            </div>
          </template>

          <div class="card-footer">
            <div class="card-tags">
              <span
                v-for="tag in post.tags"
                :key="tag"
                class="card-tag"
                :class="{ active: selectedTag === tag }"
                @click.stop="selectTag(tag)"
                >#{{ tag }}</span
              >
            </div>
            <a :href="post.url" class="card-read-more" @click.stop
              >繼續閱讀 →</a
            >
          </div>
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
    padding: 48px 32px 96px;
    max-width: 880px;
  }
}
@media (min-width: 1440px) {
  .blog-home {
    max-width: 960px;
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

.blog-grid {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.blog-card {
  border-radius: 12px;
  border: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg-soft);
  overflow: hidden;
  transition:
    background 0.25s,
    box-shadow 0.2s,
    border-color 0.2s;
  display: flex;
  flex-direction: column;
}
.blog-card:hover {
  background: var(--vp-c-bg-mute);
  box-shadow: 0 6px 22px rgba(0, 0, 0, 0.1);
  border-color: color-mix(in srgb, var(--vp-c-brand-1) 45%, white);
}

.blog-card__cover {
  position: relative;
  width: 100%;
  aspect-ratio: 16 / 9;
  overflow: hidden;
  background: var(--vp-c-bg-mute);
}
.cover-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.4s;
}
.blog-card:hover .cover-img {
  transform: scale(1.05);
}
.cover-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(
    135deg,
    var(--vp-c-brand-soft),
    var(--vp-c-bg-mute)
  );
}
.cover-initial {
  font-size: 4rem;
  font-weight: 800;
  color: var(--vp-c-brand-1);
  opacity: 0.4;
}
.cover-badge {
  position: absolute;
  bottom: 10px;
  right: 10px;
  font-size: 0.72rem;
  font-weight: 700;
  padding: 3px 10px;
  border-radius: 6px;
  background: var(--vp-c-brand-1);
  color: #fff;
  letter-spacing: 0.04em;
}

.blog-card__body {
  padding: 1.25rem 2rem;
  display: flex;
  flex-direction: column;
  flex: 1;
}

.card-meta {
  margin-bottom: 0.5rem;
  display: flex;
  align-items: center;
  gap: 10px;
}
.card-date {
  font-size: 0.78rem;
  color: var(--vp-c-text-3);
}
.meta-category {
  font-size: 0.7rem;
  font-weight: 700;
  padding: 2px 10px;
  border-radius: 6px;
  background: var(--vp-c-brand-1);
  color: #fff;
  letter-spacing: 0.04em;
}
.blog-card__body.no-cover {
  padding-top: 1.5rem;
}

.card-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--vp-c-text-1);
  margin: 0 0 0.75rem;
  line-height: 1.4;
  transition: color 0.2s;
}
.blog-card:hover .card-title {
  color: var(--vp-c-brand-1);
}

.card-body-content {
  line-height: 1.7;
  max-height: calc(1.7em * 11);
  overflow: hidden;
  flex: 1;
  display: grid;
  grid-template-rows: 1fr auto;
}
.card-body-text {
  overflow: hidden;
}
.card-body-text.truncated {
  display: -webkit-box;
  -webkit-line-clamp: 10;
  -webkit-box-orient: vertical;
}
.card-body-more {
  line-height: 1.7;
  color: var(--vp-c-text-3);
  text-align: center;
  letter-spacing: 0.1em;
}

.card-body-abstract {
  flex: 1;
}
.card-body-abstract p {
  margin: 0.6rem 0;
  line-height: 1.7;
}

.card-body-content :deep(img) {
  max-width: 100%;
  border-radius: 6px;
  margin: 0.75rem 0;
}
.card-body-content :deep(p) {
  margin: 0.6rem 0;
}
.card-body-content :deep(blockquote) {
  border-left: 3px solid var(--vp-c-brand-1);
  margin: 0.75rem 0;
  padding: 0.4rem 0.75rem;
  color: var(--vp-c-text-2);
  background: var(--vp-c-bg);
  border-radius: 0 4px 4px 0;
}
.card-body-content :deep(h2),
.card-body-content :deep(h3) {
  margin: 1.25rem 0 0.6rem;
}
.card-body-content :deep(ul),
.card-body-content :deep(ol) {
  padding-left: 1.5rem;
}
.card-body-content :deep(a) {
  color: var(--vp-c-brand-1);
}
.card-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-top: 0.75rem;
  padding-top: 0.75rem;
  border-top: 1px solid var(--vp-c-divider);
  flex-wrap: wrap;
}
.card-tags {
  display: flex;
  gap: 4px;
  flex-wrap: wrap;
}
.card-tag {
  font-size: 0.72rem;
  color: var(--vp-c-text-3);
  cursor: pointer;
  padding: 2px 6px;
  border-radius: 4px;
  transition: all 0.2s;
}
.card-tag:hover,
.card-tag.active {
  color: var(--vp-c-brand-1);
  background: var(--vp-c-brand-soft);
}
.card-read-more {
  font-size: 0.82rem;
  color: var(--vp-c-brand-1);
  text-decoration: none;
  font-weight: 600;
  white-space: nowrap;
  transition: opacity 0.2s;
}
.card-read-more:hover {
  opacity: 0.7;
}

@media (max-width: 767px) {
  .card-title {
    font-size: 1.1rem;
  }
}
</style>
