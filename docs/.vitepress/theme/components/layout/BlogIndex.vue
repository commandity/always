<script setup lang="ts">
import { useRouter } from "vitepress";
import { data as posts } from "../../posts.data.ts";
import { ref, computed } from "vue";

const router = useRouter();
const selectedTag = ref<string | null>(null);

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

function timeAgo(dateStr: string) {
  const diff = Date.now() - +new Date(dateStr);
  const days = Math.floor(diff / 86400000);
  if (days < 30) return `${days} 天前`;
  if (days < 365) return `${Math.floor(days / 30)} 個月前`;
  return `${Math.floor(days / 365)} 年前`;
}
</script>

<template>
  <div class="blog-home">
    <!-- Hero -->
    <div class="blog-hero">
      <h1>
        <span class="hero-icon">✦</span>
        <span class="hero-text">靜心閣</span>
        <span class="hero-icon">✦</span>
      </h1>
      <p>心得 ✏️ | 日記 📒 | 分享 💡</p>
      <div class="blog-hero__count">{{ posts.length }} 篇文章</div>
    </div>

    <!-- Tag filter -->
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

    <!-- Post grid -->
    <div class="blog-grid">
      <article
        v-for="post in filteredPosts"
        :key="post.url"
        class="blog-card"
        @click="router.go(post.url)"
      >
        <!-- Cover image -->
        <div class="blog-card__cover">
          <img
            v-if="post.cover"
            :src="post.cover"
            :alt="post.title"
            class="cover-img"
          />
          <div v-else class="cover-placeholder">
            <span class="cover-initial">{{ post.title?.charAt(0) }}</span>
          </div>

          <!-- Category badge overlaid on cover -->
          <span v-if="post.category" class="cover-badge">{{
            post.category
          }}</span>
        </div>

        <!-- Card body -->
        <div class="blog-card__body">
          <div class="card-meta">
            <span class="card-date">{{ formatDate(post.date) }}</span>
            <span class="card-ago">{{ timeAgo(post.date) }}</span>
          </div>

          <h2 class="card-title">{{ post.title }}</h2>

          <p v-if="post.excerpt" class="card-excerpt">{{ post.excerpt }}</p>

          <div class="card-footer">
            <div class="card-author">
              <img
                v-if="post.avatar"
                :src="post.avatar"
                :alt="post.author"
                class="author-avatar"
              />
              <span class="author-name">{{ post.author }}</span>
            </div>
            <div class="card-tags">
              <span
                v-for="tag in post.tags"
                :key="tag"
                class="card-tag"
                :class="{ active: selectedTag === tag }"
                @click.stop="selectTag(tag)"
                ># {{ tag }}</span
              >
            </div>
          </div>
        </div>
      </article>
    </div>
  </div>
</template>

<style scoped>
.blog-home {
  max-width: 1152px;
  margin: 0 auto;
  padding: 3rem clamp(56px, 3vw, 134px);
}

/* ── Hero ────────────────────────────────────────────────────── */
.blog-hero {
  text-align: center;
  padding: 1.5rem 0 2rem;
  margin-bottom: 2rem;
  border-bottom: 1px solid var(--vp-c-divider);
}
.blog-hero h1 {
  font-size: 3.5rem;
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

/* ── Tag bar ─────────────────────────────────────────────────── */
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

/* ── Grid ────────────────────────────────────────────────────── */
.blog-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.5rem;
}

@media (max-width: 1152px) {
  .blog-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
@media (max-width: 640px) {
  .blog-grid {
    grid-template-columns: 1fr;
  }
  .blog-home {
    padding: 2rem 1.5rem;
  }
}

/* ── Card ────────────────────────────────────────────────────── */
.blog-card {
  border-radius: 12px;
  border: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg-soft);
  cursor: pointer;
  overflow: hidden;
  transition:
    transform 0.2s,
    box-shadow 0.2s,
    border-color 0.2s;
  display: flex;
  flex-direction: column;
}
.blog-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
  border-color: var(--vp-c-brand-1);
}

/* ── Cover ───────────────────────────────────────────────────── */
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

/* ── Card body ───────────────────────────────────────────────── */
.blog-card__body {
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
  flex: 1;
}

.card-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 0.5rem;
}
.card-date {
  font-size: 0.78rem;
  color: var(--vp-c-text-3);
}
.card-ago {
  font-size: 0.78rem;
  color: var(--vp-c-text-3);
}
.card-ago::before {
  content: "·";
  margin-right: 8px;
}

.card-title {
  font-size: 1.05rem;
  font-weight: 700;
  color: var(--vp-c-text-1);
  margin: 0 0 0.5rem;
  line-height: 1.4;
  transition: color 0.2s;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.blog-card:hover .card-title {
  color: var(--vp-c-brand-1);
}

.card-excerpt {
  font-size: 0.85rem;
  color: var(--vp-c-text-2);
  line-height: 1.6;
  margin: 0 0 1rem;
  flex: 1;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* ── Card footer ─────────────────────────────────────────────── */
.card-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  flex-wrap: wrap;
  margin-top: auto;
  padding-top: 0.75rem;
  border-top: 1px solid var(--vp-c-divider);
}
.card-author {
  display: flex;
  align-items: center;
  gap: 6px;
}
.author-avatar {
  width: 22px;
  height: 22px;
  border-radius: 50%;
  object-fit: cover;
}
.author-name {
  font-size: 0.78rem;
  color: var(--vp-c-text-3);
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
</style>
