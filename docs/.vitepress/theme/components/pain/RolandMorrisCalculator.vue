<script setup lang="ts">
import { ref, computed } from "vue";

// Roland-Morris Disability Questionnaire (RMDQ)
// 24 items — each checked (1) or unchecked (0)
// Score = number of checked items (0–24)

const items = [
  {
    key: "q01",
    text: "我因為背痛而整天待在家裡",
    en: "I stay at home most of the time because of my back",
  },
  {
    key: "q02",
    text: "我因為背痛而改變體位以舒緩不適",
    en: "I change position frequently to make my back more comfortable",
  },
  {
    key: "q03",
    text: "我因為背痛而比平常走得更慢",
    en: "I walk more slowly than usual because of my back",
  },
  {
    key: "q04",
    text: "我因為背痛而無法做任何平常在家做的事",
    en: "Because of my back, I am not doing any of the jobs that I usually do around the house",
  },
  {
    key: "q05",
    text: "我因為背痛而需要扶著欄桿上樓梯",
    en: "Because of my back, I use a handrail to get upstairs",
  },
  {
    key: "q06",
    text: "我因為背痛而需要頻繁躺下休息",
    en: "Because of my back, I lie down to rest more often",
  },
  {
    key: "q07",
    text: "我因為背痛而必須扶東西才能從椅子站起來",
    en: "Because of my back, I have to hold onto something to get out of an easy chair",
  },
  {
    key: "q08",
    text: "我因為背痛而需要他人協助穿衣",
    en: "Because of my back, I try to get other people to do things for me",
  },
  {
    key: "q09",
    text: "我因為背痛而比平常穿衣更慢",
    en: "I get dressed more slowly than usual because of my back",
  },
  {
    key: "q10",
    text: "我因為背痛而只能站立很短的時間",
    en: "I only stand up for short periods of time because of my back",
  },
  {
    key: "q11",
    text: "我因為背痛而盡量不彎腰或下跪",
    en: "Because of my back, I try not to bend or kneel down",
  },
  {
    key: "q12",
    text: "我因為背痛而很難從椅子起身",
    en: "I find it difficult to get out of a chair because of my back",
  },
  {
    key: "q13",
    text: "我的背部大部分時間都感到疼痛",
    en: "My back is painful almost all the time",
  },
  {
    key: "q14",
    text: "我因為背痛而很難翻身",
    en: "I find it difficult to turn over in bed because of my back",
  },
  {
    key: "q15",
    text: "我因為背痛而食慾不振",
    en: "I have a poor appetite because of my back pain",
  },
  {
    key: "q16",
    text: "我因為背痛而很難穿上襪子或絲襪",
    en: "I have trouble putting on my socks (or stockings) because of the pain in my back",
  },
  {
    key: "q17",
    text: "我因為背痛而只能走很短的距離",
    en: "I only walk short distances because of my back",
  },
  {
    key: "q18",
    text: "我的睡眠品質因為背痛而下降",
    en: "I sleep less well because of my back",
  },
  {
    key: "q19",
    text: "我因為背痛而需要他人協助穿鞋",
    en: "Because of my back pain, I get dressed with help from someone else",
  },
  {
    key: "q20",
    text: "我因為背痛而大部分時間坐著",
    en: "I sit down for most of the day because of my back",
  },
  {
    key: "q21",
    text: "我因為背痛而避免做繁重的家務",
    en: "I avoid heavy jobs around the house because of my back",
  },
  {
    key: "q22",
    text: "我因為背痛而比平常更容易發脾氣或情緒不穩",
    en: "Because of my back pain, I am more irritable and bad tempered with people than usual",
  },
  {
    key: "q23",
    text: "我因為背痛而比平常更緩慢地爬樓梯",
    en: "Because of my back, I go upstairs more slowly than usual",
  },
  {
    key: "q24",
    text: "我因為背痛而大部分時間臥床",
    en: "I stay in bed most of the time because of my back",
  },
];

const checked = ref<Record<string, boolean>>(
  Object.fromEntries(items.map((i) => [i.key, false])),
);
const copied = ref(false);
const showResults = ref(false);

const score = computed(() => items.filter((i) => checked.value[i.key]).length);

const severity = computed(() => {
  const s = score.value;
  if (s <= 4)
    return {
      label: "輕度障礙",
      color: "normal",
      detail: "功能影響輕微，大多數活動可正常進行",
    };
  if (s <= 8)
    return {
      label: "中度障礙",
      color: "mild",
      detail: "日常活動中等程度受限，建議積極復健",
    };
  if (s <= 14)
    return {
      label: "中重度障礙",
      color: "moderate",
      detail: "顯著功能障礙，影響多項日常活動",
    };
  return {
    label: "重度障礙",
    color: "severe",
    detail: "嚴重功能障礙，需積極多學科介入",
  };
});

function toggleAll(val: boolean) {
  items.forEach((i) => (checked.value[i.key] = val));
}

function generateMarkdown() {
  const checkedItems = items
    .filter((i) => checked.value[i.key])
    .map((i) => `  ✓ ${i.text}`);
  const uncheckedItems = items
    .filter((i) => !checked.value[i.key])
    .map((i) => `  ✗ ${i.text}`);
  return (
    `# Roland-Morris 失能問卷\n\n` +
    `## 選中項目（${score.value} / 24）\n\n${checkedItems.join("\n") || "  無"}\n\n` +
    `## 未選項目\n\n${uncheckedItems.join("\n")}\n\n` +
    `## 結果\n\n` +
    `- **得分 = ${score.value} / 24**\n` +
    `- 障礙程度：${severity.value.label}\n` +
    `- ${severity.value.detail}`
  );
}

async function copyMarkdown() {
  await navigator.clipboard.writeText(generateMarkdown());
  copied.value = true;
  setTimeout(() => (copied.value = false), 2000);
}

function reset() {
  items.forEach((i) => (checked.value[i.key] = false));
  showResults.value = false;
}
</script>

<template>
  <div class="rm">
    <!-- ── Header ─────────────────────────────────────────────── -->
    <div class="rm-header">
      <div class="header-title">
        <h2 class="title">Roland-Morris 失能問卷</h2>
        <p class="subtitle">
          Roland-Morris Disability Questionnaire · 腰痛功能障礙評估 · 24 題
        </p>
      </div>
      <div class="score-badge" :class="severity.color">
        <span class="sb-val">{{ score }}</span>
        <span class="sb-max">/ 24</span>
        <span class="sb-label">{{ severity.label }}</span>
      </div>
    </div>

    <!-- ── Progress bar ───────────────────────────────────────── -->
    <div class="rm-bar-wrap">
      <div class="rm-bar">
        <div
          class="rm-bar-fill"
          :class="severity.color"
          :style="{ width: (score / 24) * 100 + '%' }"
        />
      </div>
      <div class="rm-ticks">
        <span>0</span>
        <span class="t-g">4</span>
        <span class="t-y">8</span>
        <span class="t-o">14</span>
        <span>24</span>
      </div>
    </div>

    <!-- ── Instruction ────────────────────────────────────────── -->
    <div class="instruction">
      <span class="inst-icon">📋</span>
      <span
        >請根據<strong>今天</strong>的身體狀況，勾選所有描述符合您情況的項目。每勾選一項得
        1 分，分數越高代表障礙越嚴重。</span
      >
    </div>

    <!-- ── Quick actions ──────────────────────────────────────── -->
    <div class="quick-row">
      <span class="q-label">快速操作：</span>
      <button class="q-btn" @click="toggleAll(true)">全選</button>
      <button class="q-btn" @click="toggleAll(false)">全清</button>
      <span class="q-checked">已勾選：{{ score }} 項</span>
    </div>

    <!-- ── Checklist ──────────────────────────────────────────── -->
    <div class="rm-list">
      <label
        v-for="(item, idx) in items"
        :key="item.key"
        class="rm-item"
        :class="{ 'rm-checked': checked[item.key] }"
      >
        <input
          type="checkbox"
          v-model="checked[item.key]"
          class="rm-checkbox"
        />
        <div class="rm-check-box" :class="{ checked: checked[item.key] }">
          <svg
            v-if="checked[item.key]"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="3.5"
            class="check-svg"
          >
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
        <div class="rm-item-content">
          <span class="rm-num">{{
            (idx + 1).toString().padStart(2, "0")
          }}</span>
          <span class="rm-text">{{ item.text }}</span>
        </div>
      </label>
    </div>

    <!-- ── Result card ────────────────────────────────────────── -->
    <div class="rm-result" :class="severity.color">
      <div class="rr-left">
        <span class="rr-n">{{ score }}</span>
        <span class="rr-u">/ 24</span>
      </div>
      <div class="rr-right">
        <span class="rr-level">{{ severity.label }}</span>
        <span class="rr-detail">{{ severity.detail }}</span>
      </div>
    </div>

    <!-- ── Reference table ───────────────────────────────────── -->
    <div class="ref-table">
      <div class="rt-row rt-header">
        <span>分數</span><span>障礙程度</span><span>建議</span>
      </div>
      <div class="rt-row" :class="{ 'rt-active': score <= 4 }">
        <span class="rt-s normal-t">0–4</span><span>輕度</span
        ><span class="rt-sm">自我管理、運動</span>
      </div>
      <div class="rt-row" :class="{ 'rt-active': score >= 5 && score <= 8 }">
        <span class="rt-s mild-t">5–8</span><span>中度</span
        ><span class="rt-sm">物理治療</span>
      </div>
      <div class="rt-row" :class="{ 'rt-active': score >= 9 && score <= 14 }">
        <span class="rt-s moderate-t">9–14</span><span>中重度</span
        ><span class="rt-sm">多學科介入</span>
      </div>
      <div class="rt-row" :class="{ 'rt-active': score >= 15 }">
        <span class="rt-s severe-t">15–24</span><span>重度</span
        ><span class="rt-sm">積極多學科治療</span>
      </div>
    </div>

    <!-- ── Results detail ─────────────────────────────────────── -->
    <div v-if="showResults" class="results-detail">
      <div class="results-header">評估明細</div>
      <div v-for="(item, idx) in items" :key="item.key" class="detail-row">
        <span class="detail-qnum">{{
          (idx + 1).toString().padStart(2, "0")
        }}</span>
        <span class="detail-domain">{{ item.text }}</span>
        <span
          class="detail-score"
          :class="checked[item.key] ? 'score-yes' : 'score-no'"
        >
          {{ checked[item.key] ? "✓ 是" : "✗ 否" }}
        </span>
        <span class="detail-desc">{{
          checked[item.key] ? "1 分" : "0 分"
        }}</span>
      </div>
      <div class="detail-row detail-total">
        <span class="detail-qnum">∑</span>
        <span class="detail-domain">總得分</span>
        <span class="detail-score brand">{{ score }}</span>
        <span class="detail-desc">{{ severity.label }}</span>
      </div>
    </div>

    <!-- ── Actions ────────────────────────────────────────────── -->
    <div class="actions">
      <button class="btn-view" @click="showResults = !showResults">
        {{ showResults ? "收起明細" : "查看評估結果" }}
      </button>
      <button class="btn-copy" @click="copyMarkdown">
        {{ copied ? "已複製 ✓" : "複製 Markdown 結果" }}
      </button>
      <button class="btn-reset" @click="reset">重置</button>
    </div>
  </div>
</template>

<style scoped>
.rm {
  max-width: 720px;
  margin: 0 auto;
  padding: 2rem 0 3rem;
  font-size: 0.9rem;
}

/* ── Header ────────────────────────────────────────────────────── */
.rm-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 1.25rem;
  flex-wrap: wrap;
}
.title {
  font-size: 24px;
  font-weight: 600;
  color: var(--vp-c-text-1);
  margin: 0 0 0.2rem;
  border: none !important;
  padding: 0 !important;
}
.subtitle {
  font-size: 0.75rem;
  color: var(--vp-c-text-3);
  margin: 0;
}

.score-badge {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-width: 80px;
  padding: 0.6rem 1rem;
  border-radius: 14px;
  border: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg-soft);
  transition: all 0.3s;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
}
.sb-val {
  font-size: 2rem;
  font-weight: 800;
  line-height: 1;
  transition: color 0.3s;
}
.sb-max {
  display: none;
}
.sb-label {
  font-size: 0.68rem;
  font-weight: 600;
  margin-top: 2px;
  letter-spacing: 0.02em;
  text-align: center;
}
.score-badge.filling {
  color: var(--vp-c-text-3);
}
.score-badge.normal {
  border-color: #22c55e;
  color: #22c55e;
  box-shadow:
    0 0 0 1px rgba(34, 197, 94, 0.08),
    0 1px 3px rgba(0, 0, 0, 0.04);
}
.score-badge.mild {
  border-color: #f59e0b;
  color: #f59e0b;
  box-shadow:
    0 0 0 1px rgba(245, 158, 11, 0.08),
    0 1px 3px rgba(0, 0, 0, 0.04);
}
.score-badge.moderate {
  border-color: #f97316;
  color: #f97316;
  box-shadow:
    0 0 0 1px rgba(249, 115, 22, 0.08),
    0 1px 3px rgba(0, 0, 0, 0.04);
}
.score-badge.severe {
  border-color: #ef4444;
  color: #ef4444;
  box-shadow:
    0 0 0 1px rgba(239, 68, 68, 0.08),
    0 1px 3px rgba(0, 0, 0, 0.04);
}

/* ── Progress bar ──────────────────────────────────────────────── */
.rm-bar-wrap {
  margin-bottom: 2.5rem;
}
.rm-bar {
  position: relative;
  height: 8px;
  border-radius: 999px;
  background: var(--vp-c-bg-mute);
  overflow: visible;
  margin-bottom: 4px;
  box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.08);
}
.rm-bar-fill {
  height: 100%;
  border-radius: 999px;
  transition:
    width 0.5s cubic-bezier(0.22, 1, 0.36, 1),
    background 0.3s;
}
.rm-bar-fill.filling {
  background: var(--vp-c-divider);
}
.rm-bar-fill.normal {
  background: linear-gradient(90deg, #22c55e, #4ade80);
}
.rm-bar-fill.mild {
  background: linear-gradient(90deg, #f59e0b, #fbbf24);
}
.rm-bar-fill.moderate {
  background: linear-gradient(90deg, #f97316, #fb923c);
}
.rm-bar-fill.severe {
  background: linear-gradient(90deg, #ef4444, #f87171);
}
.rm-ticks {
  display: flex;
  justify-content: space-between;
  font-size: 0.65rem;
  color: var(--vp-c-text-3);
}
.t-g {
  color: #22c55e;
  font-weight: 700;
}
.t-y {
  color: #f59e0b;
  font-weight: 700;
}
.t-o {
  color: #f97316;
  font-weight: 700;
}

/* ── Instruction ───────────────────────────────────────────────── */
.instruction {
  display: flex;
  align-items: flex-start;
  gap: 0.6rem;
  padding: 0.75rem 1rem;
  border-radius: 10px;
  background: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-divider);
  border-left: 3px solid var(--vp-c-brand-1);
  font-size: 0.82rem;
  color: var(--vp-c-text-2);
  margin-bottom: 1.5rem;
  line-height: 1.6;
}
.inst-icon {
  flex-shrink: 0;
}

/* ── Quick row ─────────────────────────────────────────────────── */
.quick-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
  flex-wrap: wrap;
}
.q-label {
  font-size: 0.75rem;
  color: var(--vp-c-text-3);
}
.q-btn {
  padding: 3px 12px;
  border-radius: 6px;
  border: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg-soft);
  font-size: 0.78rem;
  cursor: pointer;
  font-family: inherit;
  color: var(--vp-c-text-2);
  transition: all 0.15s;
}
.q-btn:hover {
  border-color: var(--vp-c-brand-1);
  color: var(--vp-c-brand-1);
}
.q-checked {
  font-size: 0.78rem;
  font-weight: 700;
  color: var(--vp-c-brand-1);
  margin-left: auto;
}

/* ── Checklist ─────────────────────────────────────────────────── */
.rm-list {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
  margin-bottom: 1.25rem;
}
.rm-item {
  display: flex;
  align-items: center;
  gap: 0.65rem;
  padding: 0.6rem 0.85rem;
  border-radius: 9px;
  border: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg-soft);
  cursor: pointer;
  transition: all 0.15s;
  user-select: none;
}
.rm-item:hover {
  background: var(--vp-c-bg-mute);
}
.rm-item.rm-checked {
  border-color: var(--vp-c-brand-1);
  background: var(--vp-c-brand-soft);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
}
.rm-checkbox {
  display: none;
}
.rm-check-box {
  width: 20px;
  height: 20px;
  border-radius: 5px;
  flex-shrink: 0;
  border: 1.5px solid var(--vp-c-divider);
  background: var(--vp-c-bg);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.15s;
}
.rm-check-box.checked {
  background: var(--vp-c-brand-1);
  border-color: var(--vp-c-brand-1);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}
.check-svg {
  width: 12px;
  height: 12px;
  color: #fff;
}
.rm-item-content {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex: 1;
}
.rm-num {
  font-size: 0.68rem;
  font-weight: 800;
  color: var(--vp-c-text-3);
  flex-shrink: 0;
}
.rm-text {
  font-size: 0.85rem;
  font-weight: 400;
  color: var(--vp-c-text-1);
  line-height: 1.4;
}
.rm-item.rm-checked .rm-text {
  font-weight: 700;
  color: var(--vp-c-brand-1);
}

/* ── Result card ───────────────────────────────────────────────── */
.rm-result {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  padding: 1.25rem 1.5rem;
  border-radius: 14px;
  border: 1px solid var(--vp-c-divider);
  background: linear-gradient(135deg, var(--vp-c-bg-soft), var(--vp-c-bg-mute));
  margin-bottom: 1rem;
  flex-wrap: wrap;
  transition: all 0.3s;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
}
.rm-result.normal {
  border-color: #22c55e;
  box-shadow:
    0 0 0 1px rgba(34, 197, 94, 0.06),
    0 1px 3px rgba(0, 0, 0, 0.04);
}
.rm-result.mild {
  border-color: #f59e0b;
  box-shadow:
    0 0 0 1px rgba(245, 158, 11, 0.06),
    0 1px 3px rgba(0, 0, 0, 0.04);
}
.rm-result.moderate {
  border-color: #f97316;
  box-shadow:
    0 0 0 1px rgba(249, 115, 22, 0.06),
    0 1px 3px rgba(0, 0, 0, 0.04);
}
.rm-result.severe {
  border-color: #ef4444;
  box-shadow:
    0 0 0 1px rgba(239, 68, 68, 0.06),
    0 1px 3px rgba(0, 0, 0, 0.04);
}
.rr-left {
  display: flex;
  align-items: baseline;
  gap: 4px;
  flex-shrink: 0;
}
.rr-n {
  font-size: 3.5rem;
  font-weight: 800;
  line-height: 1;
  color: var(--vp-c-text-3);
  transition: color 0.3s;
}
.rm-result.normal .rr-n {
  color: #22c55e;
}
.rm-result.mild .rr-n {
  color: #f59e0b;
}
.rm-result.moderate .rr-n {
  color: #f97316;
}
.rm-result.severe .rr-n {
  color: #ef4444;
}
.rr-u {
  font-size: 0.75rem;
  color: var(--vp-c-text-3);
}
.rr-right {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.rr-level {
  font-size: 1rem;
  font-weight: 700;
  color: var(--vp-c-text-1);
}
.rr-detail {
  font-size: 0.83rem;
  color: var(--vp-c-text-2);
  line-height: 1.5;
}

/* ── Reference table ───────────────────────────────────────────── */
.ref-table {
  border: 1px solid var(--vp-c-divider);
  border-radius: 10px;
  overflow: hidden;
  margin-bottom: 1rem;
}
.rt-row {
  display: grid;
  grid-template-columns: 70px 1fr 1fr;
  gap: 0.5rem;
  padding: 0.4rem 0.9rem;
  border-bottom: 1px solid var(--vp-c-divider);
  font-size: 0.78rem;
  align-items: center;
}
.rt-row:last-child {
  border-bottom: none;
}
.rt-header {
  background: var(--vp-c-bg-mute);
  font-size: 0.7rem;
  font-weight: 700;
  color: var(--vp-c-text-3);
  text-transform: uppercase;
}
.rt-active {
  background: var(--vp-c-brand-soft);
}
.rt-s {
  font-weight: 800;
  font-family: monospace;
}
.normal-t {
  color: #22c55e;
}
.mild-t {
  color: #f59e0b;
}
.moderate-t {
  color: #f97316;
}
.severe-t {
  color: #ef4444;
}
.rt-sm {
  font-size: 0.7rem;
  color: var(--vp-c-text-3);
}

/* ── Results detail (NIHSS pattern) ───────────────────────────── */
.results-detail {
  border: 1px solid var(--vp-c-divider);
  border-radius: 10px;
  overflow: hidden;
  margin-bottom: 1rem;
}
.results-header {
  padding: 0.5rem 0.9rem;
  font-size: 0.72rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--vp-c-text-3);
  background: var(--vp-c-bg-mute);
  border-bottom: 1px solid var(--vp-c-divider);
}
.detail-row {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.45rem 0.9rem;
  border-bottom: 1px solid var(--vp-c-divider);
}
.detail-row:last-child {
  border-bottom: none;
}
.detail-total {
  background: var(--vp-c-bg-mute);
}
.detail-qnum {
  font-size: 0.7rem;
  font-weight: 800;
  color: var(--vp-c-brand-1);
  flex-shrink: 0;
  width: 28px;
}
.detail-domain {
  font-size: 0.78rem;
  font-weight: 600;
  color: var(--vp-c-text-1);
  flex: 1;
}
.detail-score {
  font-size: 0.82rem;
  font-weight: 800;
  flex-shrink: 0;
  width: 52px;
  text-align: right;
}
.detail-score.score-yes {
  color: #22c55e;
}
.detail-score.score-no {
  color: var(--vp-c-text-3);
}
.detail-score.brand {
  color: var(--vp-c-brand-1);
}
.detail-desc {
  font-size: 0.72rem;
  color: var(--vp-c-text-2);
  flex-shrink: 0;
  width: 64px;
  text-align: left;
}

/* ── Actions ───────────────────────────────────────────────────── */
.actions {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
}
.btn-view,
.btn-copy,
.btn-reset {
  padding: 9px 22px;
  border-radius: 8px;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  font-family: inherit;
  transition: all 0.2s;
}
.btn-view {
  border: none;
  background: linear-gradient(135deg, var(--vp-c-brand-1), #4f46e5);
  color: #fff;
  box-shadow: 0 2px 8px rgba(99, 102, 241, 0.3);
}
.btn-view:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 14px rgba(99, 102, 241, 0.4);
}
.btn-view:active {
  transform: translateY(0);
}
.btn-copy {
  border: 1.5px solid var(--vp-c-brand-1);
  background: transparent;
  color: var(--vp-c-brand-1);
}
.btn-copy:hover {
  background: var(--vp-c-brand-soft);
}
.btn-reset {
  border: 1px solid var(--vp-c-divider);
  background: transparent;
  color: var(--vp-c-text-2);
}
.btn-reset:hover {
  border-color: #ef4444;
  color: #ef4444;
  background: rgba(239, 68, 68, 0.04);
}

@media (max-width: 640px) {
  .rm-header {
    flex-direction: column;
  }
  .score-badge {
    flex-direction: row;
    gap: 0.5rem;
    align-self: flex-start;
  }
  .sb-val {
    font-size: 1.5rem;
  }
  .rm-result {
    flex-direction: column;
    gap: 0.75rem;
  }
}
</style>
