---
layout: doc
title: 臨床工具
aside: false
prev: false
next: false
---

<div class="tool-welcome">

<div class="tw-hero">
  <div class="tw-icon">🖌️</div>
  <h1 class="tw-title">臨床工具</h1>
  <p class="tw-subtitle">Clinical Tools · 評估量表 · 風險計算器 · 診斷輔助</p>
</div>

<div class="tw-card tw-welcome">
  <div class="tw-card-icon">👋</div>
  <div class="tw-card-body">
    <h2 class="tw-card-title">歡迎使用本站工具</h2>
    <p>本站收錄各科常用臨床評估量表與風險計算器，涵蓋耳鼻喉科、神經科、風濕免疫科、身心科等領域，持續更新中。所有工具均可在線上即時計算，並支援複製 Markdown 格式結果供病歷記錄使用。</p>
  </div>
</div>

<div class="tw-card tw-how">
  <div class="tw-card-icon">📋</div>
  <div class="tw-card-body">
    <h2 class="tw-card-title">如何使用</h2>
    <p>請點選<strong>左側工具清單</strong>尋找您需要的評估工具。工具依科別分類排列，您也可以使用頁面頂端的<strong>搜尋功能（⌘+K / Ctrl+K）</strong>直接輸入工具名稱快速定位。</p>
  </div>
</div>

<div class="tw-card tw-copyright">
  <div class="tw-card-icon">©</div>
  <div class="tw-card-body">
    <h2 class="tw-card-title">版權聲明</h2>
    <p>本站所有工具之介面設計、程式碼及說明文字之著作權均歸 <strong>neo jerzy</strong> 所有，未經授權不得轉載、複製或作為商業用途。各工具所依據之臨床評分系統版權歸屬原作者及出版機構。</p>
  </div>
</div>

<div class="tw-card tw-disclaimer">
  <div class="tw-card-icon">⚠️</div>
  <div class="tw-card-body">
    <h2 class="tw-card-title">免責聲明</h2>
    <p>本站工具<strong>僅供臨床參考輔助使用，不能取代專業醫師的完整臨床評估與判斷</strong>。計算結果僅作為輔助參考依據，最終診斷與治療決策應由具執照之合格醫師負責。</p>
    <p>如對工具內容有任何疑問、發現數據錯誤或需要補充說明，歡迎透過<strong>聯絡方式</strong>頁面回報，或直接諮詢相關科別的專科醫師。</p>
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
