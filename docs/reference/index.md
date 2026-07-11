---
layout: doc
title: 衛教
aside: false
prev: false
next: false
---

<div class="tool-welcome">

<div class="tw-hero">
  <div class="tw-icon">📖</div>
  <h1 class="tw-title">衛教專區</h1>
  <p class="tw-subtitle">Health Education · 用藥須知 · 臨床指引 · 日常保健</p>
</div>

<div class="tw-card tw-welcome">
  <div class="tw-card-icon">👋</div>
  <div class="tw-card-body">
    <h2 class="tw-card-title">歡迎來到衛教專區</h2>
    <p>本區整理各科常見用藥須知、臨床指引摘要與日常保健知識，幫助醫療人員與民眾快速掌握關鍵資訊。內容涵蓋代謝內分泌、疼痛治療等領域，持續更新中。</p>
  </div>
</div>

<div class="tw-card tw-how">
  <div class="tw-card-icon">📋</div>
  <div class="tw-card-body">
    <h2 class="tw-card-title">如何使用</h2>
    <p>請點選<strong>左側文章清單</strong>瀏覽各主題，或使用頁面頂端的<strong>搜尋功能（⌘+K / Ctrl+K）</strong>輸入關鍵字快速查找。文章依科別分類排列，每篇均附有臨床重點整理與實務建議。</p>
  </div>
</div>

<div class="tw-card tw-copyright">
  <div class="tw-card-icon">©</div>
  <div class="tw-card-body">
    <h2 class="tw-card-title">版權聲明</h2>
    <p>本站所有衛教文章之內容、編排及說明文字之著作權均歸 <strong>neo jerzy</strong> 所有，未經授權不得轉載、複製或作為商業用途。各文章所引用之臨床指引與研究文獻版權歸屬原作者及出版機構。</p>
  </div>
</div>

<div class="tw-card tw-disclaimer">
  <div class="tw-card-icon">⚠️</div>
  <div class="tw-card-body">
    <h2 class="tw-card-title">免責聲明</h2>
    <p>本站衛教內容<strong>僅供教育與參考用途，不能取代醫師的專業診斷與治療建議</strong>。如有醫療需求，請務必諮詢合格醫療專業人員。</p>
    <p>如發現內容錯誤或需要補充說明，歡迎透過<strong>聯絡方式</strong>頁面回報。</p>
  </div>
</div>

</div>

<style>
.tool-welcome {
  max-width: 720px;
  margin: 0 auto;
  padding: 1rem 0 3rem;
}

/* ── Hero ────────────────────────────────────────────────────────── */
.tw-hero {
  text-align: center;
  padding: 2rem 0 2.5rem;
  border-bottom: 1px solid var(--vp-c-divider);
  margin-bottom: 1.75rem;
}
.tw-icon {
  font-size: 3rem;
  margin-bottom: 0.75rem;
  line-height: 1;
}
.tw-title {
  font-size: 2rem;
  font-weight: 800;
  color: var(--vp-c-text-1);
  margin: 0 0 0.5rem;
  border: none !important;
  padding: 0 !important;
}
.tw-subtitle {
  font-size: 0.85rem;
  color: var(--vp-c-text-3);
  margin: 0;
  letter-spacing: 0.03em;
}

/* ── Cards ───────────────────────────────────────────────────────── */
.tw-card {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  padding: 1.25rem 1.5rem;
  border-radius: 12px;
  border: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg-soft);
  margin-bottom: 1rem;
  border-left-width: 4px;
}

.tw-welcome  { border-left-color: var(--vp-c-brand-1); }
.tw-how      { border-left-color: #14b8a6; }
.tw-copyright { border-left-color: #6366f1; }
.tw-disclaimer { border-left-color: #f97316; }

.tw-card-icon {
  font-size: 1.5rem;
  flex-shrink: 0;
  line-height: 1;
  margin-top: 2px;
}

.tw-card-body {
  flex: 1;
}

.tw-card-title {
  font-size: 1rem;
  font-weight: 700;
  color: var(--vp-c-text-1);
  margin: 0 0 0.5rem;
  border: none !important;
  padding: 0 !important;
}

.tw-card-body p {
  font-size: 0.88rem;
  color: var(--vp-c-text-2);
  line-height: 1.7;
  margin: 0 0 0.5rem;
}
.tw-card-body p:last-child { margin-bottom: 0; }
</style>
