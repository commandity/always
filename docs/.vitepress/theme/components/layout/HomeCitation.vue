<script setup lang="ts">
import { useRouter } from "vitepress";
import { data as citations } from "../../citation.data.ts";

const router = useRouter();
const latest = citations[0];
</script>

<template>
  <div class="home-citation-wrap">
    <div
      class="home-citation"
      @click="router.go('/citation')"
      role="link"
      tabindex="0"
      @keydown.enter="router.go('/citation')"
    >
      <div class="citation-card">
        <div class="citation-quote">"</div>
        <blockquote class="citation-text">{{ latest.text }}</blockquote>
        <div class="citation-footer">
          <div class="citation-author">
            <span class="citation-dash">—</span>
            <span class="citation-name">{{ latest.author }}</span>
            <span v-if="latest.source" class="citation-source"
              >《{{ latest.source }}》</span
            >
          </div>
          <span class="citation-link-hint"></span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.home-citation-wrap {
  padding: 0 24px;
  box-sizing: border-box;
}

@media (min-width: 640px) {
  .home-citation-wrap {
    padding: 0 48px;
  }
}

@media (min-width: 960px) {
  .home-citation-wrap {
    padding: 0 64px;
  }
}

.home-citation {
  max-width: 1152px;
  margin: 0 auto;
  cursor: pointer;
  box-sizing: border-box;
}

.citation-card {
  position: relative;
  padding: 2rem 2rem 1.5rem 3rem;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.06);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.12);
  margin: 3rem 0;
  /* border: 1px solid var(--vp-c-divider); */
  border-left: 15px solid var(--vp-c-brand-1);
  transition:
    transform 0.2s,
    box-shadow 0.2s,
    border-color 0.2s;
}

:root:not(.dark) .citation-card {
  border: 1px solid rgba(100, 108, 255, 0.3);
  border-left: 15px solid var(--vp-c-brand-1);
}

.home-citation:hover .citation-card {
  transform: translateY(-3px);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.1);
  border-color: var(--vp-c-brand-1);
}

.citation-quote {
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

.citation-text {
  font-size: 1.1rem;
  font-style: italic;
  color: var(--vp-c-text-1);
  line-height: 1.8;
  margin: 0 2rem 1rem;
  border: none !important;
  padding: 0 !important;
}

.citation-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: 0 2rem 0;
}

.citation-author {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.88rem;
  color: var(--vp-c-text-3);
}

.citation-dash {
  color: var(--vp-c-brand-1);
}

.citation-name {
  font-weight: 600;
  color: var(--vp-c-text-2);
}

.citation-source {
  font-size: 0.82rem;
  color: var(--vp-c-text-2);
}

.citation-link-hint {
  font-size: 0.8rem;
  color: var(--vp-c-brand-1);
  opacity: 0.7;
  transition: opacity 0.2s;
}

.home-citation:hover .citation-link-hint {
  opacity: 1;
}

/* ── HomeCitation mobile fixes ──────────────────────────────────── */
@media (max-width: 430px) {
  .citation-card {
    padding: 1.5rem 1rem 1.2rem 1.5rem;
    border-left-width: 6px;
    margin: 1.5rem 0;
  }

  .citation-quote {
    font-size: 3.5rem;
    left: 1rem;
  }

  .citation-text {
    font-size: 0.95rem;
    margin: 0 0 0.75rem;
    line-height: 1.7;
  }

  .citation-footer {
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
    margin: 0;
  }

  .citation-author {
    flex-wrap: nowrap;
    gap: 4px;
    font-size: 0.82rem;
  }
}
</style>
