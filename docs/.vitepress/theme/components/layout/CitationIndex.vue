<script setup lang="ts">
import { data as citations } from "../../citation.data.ts";
import { ref, computed } from "vue";

const selectedTag = ref<string | null>(null);

const allTags = computed(() => {
  const tags = new Set<string>();
  citations.forEach((c) => c.tags?.forEach((t: string) => tags.add(t)));
  return [...tags].sort();
});

const filteredCitations = computed(() =>
  selectedTag.value
    ? citations.filter((c) => c.tags?.includes(selectedTag.value!))
    : citations,
);

function selectTag(tag: string) {
  selectedTag.value = selectedTag.value === tag ? null : tag;
}

function formatDate(dateStr: string) {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleDateString("zh-TW", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}
</script>

<template>
  <div class="citation-home">
    <!-- Hero -->
    <div class="citation-hero">
      <h1>
        <span class="hero-icon">✦</span>
        <span class="hero-text">語錄</span>
        <span class="hero-icon">✦</span>
      </h1>
      <p>收藏值得記錄的一句話</p>
      <div class="citation-hero__count">{{ citations.length }} 則語錄</div>
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

    <!-- Citation list -->
    <div class="citation-list">
      <article
        v-for="(citation, i) in filteredCitations"
        :key="i"
        class="citation-card"
      >
        <div class="card-quote">"</div>
        <blockquote class="card-text" v-html="citation.text"></blockquote>

        <div class="card-footer">
          <div class="card-author-block">
            <span class="card-dash">—</span>
            <span class="card-author">{{ citation.author }}</span>
            <span v-if="citation.source" class="card-source"
              >《{{ citation.source }}》</span
            >
          </div>

          <div class="card-right-meta">
            <div class="card-tags">
              <span
                v-for="tag in citation.tags"
                :key="tag"
                class="card-tag"
                :class="{ active: selectedTag === tag }"
                @click.stop="selectTag(tag)"
                ># {{ tag }}</span
              >
            </div>
            <span v-if="citation.date" class="card-date">{{
              formatDate(citation.date)
            }}</span>
          </div>
        </div>
      </article>

      <div v-if="filteredCitations.length === 0" class="empty-state">
        找不到符合的語錄
      </div>
    </div>
  </div>
</template>

<style scoped>
.citation-home {
  max-width: 1152px;
  margin: 0 auto;
  padding: 3rem clamp(56px, 8vw, 134px);
}

/* ── Hero ─────────────────────────────────────────────────────── */
.citation-hero {
  text-align: center;
  padding: 1.5rem 0 2rem;
  margin-bottom: 2rem;
  border-bottom: 1px solid var(--vp-c-divider);
}

.citation-hero h1 {
  font-size: 3rem;
  font-weight: 800;
  letter-spacing: -0.03em;
  line-height: 1.3;
  margin: 0 0 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.4em;
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

.citation-hero p {
  color: var(--vp-c-text-2);
  font-size: 1rem;
  margin: 0 0 1.25rem;
}

.citation-hero__count {
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

/* ── Citation list ───────────────────────────────────────────── */
.citation-list {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

/* ── Card ────────────────────────────────────────────────────── */
.citation-card {
  position: relative;
  padding: 2rem 2rem 1.5rem 3rem;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.06);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-left: 8px solid var(--vp-c-brand-1);
  transition:
    background 0.25s,
    box-shadow 0.2s,
    border-color 0.2s;
}

:root:not(.dark) .citation-card {
  border: 1px solid rgba(100, 108, 255, 0.3);
  border-left: 15px solid var(--vp-c-brand-1);
}

.citation-card:hover {
  background: rgba(255, 255, 255, 0.11);
  box-shadow: 0 6px 24px rgba(0, 0, 0, 0.12);
  border-top-color: color-mix(in srgb, var(--vp-c-brand-1) 45%, white);
  border-right-color: color-mix(in srgb, var(--vp-c-brand-1) 45%, white);
  border-bottom-color: color-mix(in srgb, var(--vp-c-brand-1) 45%, white);
}

/* Big faint quote mark */
.card-quote {
  position: absolute;
  top: -0.5rem;
  left: 2rem;
  font-size: 5rem;
  line-height: 1;
  color: var(--vp-c-brand-1);
  opacity: 0.3;
  font-family: Georgia, serif;
  user-select: none;
}

.card-text {
  font-size: 1.1rem;
  font-style: italic;
  color: var(--vp-c-text-1);
  line-height: 1.8;
  margin: 0 2rem 1rem;
  border: none !important;
  padding: 0 !important;
}

/* Footer row */
.card-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 8px;
  margin: 0 2rem 0;
}

.card-author-block {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.88rem;
  color: var(--vp-c-text-3);
}

.card-dash {
  color: var(--vp-c-brand-1);
}

.card-author {
  font-weight: 600;
  color: var(--vp-c-text-2);
}

.card-source {
  color: var(--vp-c-text-2);
  font-size: 0.82rem;
}

.card-right-meta {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.card-tags {
  display: flex;
  gap: 4px;
  flex-wrap: wrap;
}

.card-tag {
  font-size: 0.82rem;
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

.card-date {
  font-size: 0.82rem;
  color: var(--vp-c-text-3);
  white-space: nowrap;
}

/* Empty state */
.empty-state {
  text-align: center;
  padding: 3rem;
  color: var(--vp-c-text-3);
  font-size: 0.9rem;
}

@media (max-width: 639px) {
  .citation-home {
    padding: 2rem 1.25rem;
  }
  .citation-card {
    padding: 1.5rem 1rem 1.2rem 1.5rem;
    border-left-width: 8px;
  }
  .card-quote {
    font-size: 3.5rem;
    left: 1rem;
  }
  .card-text {
    margin: 0 0 0.75rem;
    line-height: 1.7;
  }
  .card-footer {
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
    margin: 0;
  }
  .card-author-block {
    flex-wrap: nowrap;
    gap: 4px;
    font-size: 0.82rem;
  }
}

/* Tablet — default 15px border-left reads too heavy at this width. */
@media (min-width: 640px) and (max-width: 960px) {
  .citation-card {
    padding: 2rem 1rem 1.2rem 1.2rem;
    border-left-width: 8px;
  }
}
/* Japanese furigana (ruby) + Chinese translation line */
.card-text :deep(ruby) {
  ruby-align: center;
}
.card-text :deep(rt) {
  font-size: 0.5em;
  font-weight: 600;
  color: var(--vp-c-text-3);
  letter-spacing: 0.02em;
}
.card-text :deep(.cite-zh) {
  display: block;
  margin-top: 0.7rem;
  font-size: 0.86em;
  font-weight: 400;
  color: var(--vp-c-text-2);
  letter-spacing: 0.03em;
}
</style>
