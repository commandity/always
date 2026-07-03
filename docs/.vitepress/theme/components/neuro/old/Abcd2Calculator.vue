<script setup lang="ts">
import { ref, computed } from "vue";

const items = [
  {
    id: 0,
    name: "年齡",
    sub: "Age",
    scores: [
      { value: 0, description: "< 60 歲" },
      { value: 1, description: "≥ 60 歲" },
    ],
  },
  {
    id: 1,
    name: "血壓",
    sub: "Blood Pressure",
    scores: [
      { value: 0, description: "< 140/90 mmHg" },
      { value: 1, description: "≥ 140/90 mmHg" },
    ],
  },
  {
    id: 2,
    name: "糖尿病病史",
    sub: "Diabetes Mellitus",
    scores: [
      { value: 0, description: "無" },
      { value: 1, description: "有" },
    ],
  },
  {
    id: 3,
    name: "臨床症狀",
    sub: "Clinical Features",
    scores: [
      { value: 0, description: "其他症狀" },
      { value: 1, description: "語言障礙，無偏癱" },
      { value: 2, description: "單側無力" },
    ],
  },
  {
    id: 4,
    name: "發作持續時間",
    sub: "Duration of Symptoms",
    scores: [
      { value: 0, description: "< 10 分鐘" },
      { value: 1, description: "10–59 分鐘" },
      { value: 2, description: "≥ 60 分鐘" },
    ],
  },
];

const selections = ref<Record<number, number>>(
  Object.fromEntries(items.map((item) => [item.id, 0])),
);

const totalScore = computed(() =>
  items.reduce((sum, item) => sum + selections.value[item.id], 0),
);

const risk = computed(() => {
  const s = totalScore.value;
  if (s <= 3)
    return { level: "低風險", color: "low", advice: "2天內腦中風風險約 1%" };
  if (s <= 5)
    return { level: "中風險", color: "mid", advice: "2天內腦中風風險約 4%" };
  return {
    level: "高風險",
    color: "high",
    advice: "2天內腦中風風險約 8%，建議雙重抗血小板治療",
  };
});

function reset() {
  items.forEach((item) => {
    selections.value[item.id] = 0;
  });
  showResults.value = false;
}

const showResults = ref(false);
const copied = ref(false);

function generateMarkdown() {
  const lines = items.map((item) => {
    const v = selections.value[item.id];
    const desc = item.scores.find((s) => s.value === v)?.description ?? "";
    return `- **${item.name}**：${v} — ${desc}`;
  });
  return `# ABCD-2 評估結果\n\n${lines.join("\n")}\n\n## 總分：${totalScore.value}（${risk.value.level}）\n## ${risk.value.advice}`;
}

async function copyMarkdown() {
  await navigator.clipboard.writeText(generateMarkdown());
  copied.value = true;
  setTimeout(() => (copied.value = false), 2000);
}

const groups = [
  {
    label: "基本資料",
    sub: "Patient Demographics",
    color: "indigo",
    ids: [0, 1, 2],
  },
  {
    label: "神經症狀",
    sub: "Neurological Features",
    color: "orange",
    ids: [3, 4],
  },
];
</script>

<template>
  <div class="abcd2">
    <!-- ── Header ─────────────────────────────────────────────── -->
    <div class="abcd2-header">
      <div class="header-title">
        <h2 class="title">ABCD-2 TIA 風險評估</h2>
        <p class="subtitle">TIA 後腦中風風險評估</p>
      </div>
      <div class="score-badge" :class="'sb-' + risk.color">
        <span class="score-number">{{ totalScore }}</span>
        <span class="score-label">{{ risk.level }}</span>
      </div>
    </div>

    <!-- ── Severity bar ───────────────────────────────────────── -->
    <div class="severity-bar-wrap">
      <div class="severity-bar">
        <div
          class="severity-fill"
          :class="'sf-' + risk.color"
          :style="{ width: (totalScore / 7) * 100 + '%' }"
        />
      </div>
      <div class="severity-ticks-abs">
        <span class="tick-abs t-low" style="left: 0%">0</span>
        <span class="tick-abs t-mid" style="left: 42.9%">3</span>
        <span class="tick-abs t-mid" style="left: 71.4%">5</span>
        <span class="tick-abs t-high" style="left: 100%">7</span>
      </div>
      <div class="severity-labels-abs">
        <span class="label-abs lbl-low" style="left: 0%">低風險</span>
        <span class="label-abs lbl-mid" style="left: 57%">中風險</span>
        <span class="label-abs lbl-high" style="left: 100%">高風險</span>
      </div>
    </div>

    <!-- ── Intro ──────────────────────────────────────────────── -->
    <div class="intro-bar">
      <span class="intro-dot">◉</span>
      <span>
        評估短暫性腦缺血發作（TIA）後 2 天內發生腦中風的風險。 總分 0–7
        分，分數越高風險越高。
      </span>
    </div>

    <!-- ── Groups ─────────────────────────────────────────────── -->
    <div v-for="group in groups" :key="group.label" class="abcd2-group">
      <div class="group-header" :class="group.color + '-header'">
        <div class="group-label-block">
          <span class="group-label">{{ group.label }}</span>
          <span class="group-sub">{{ group.sub }}</span>
        </div>
        <span class="group-score-pill" :class="group.color + '-pill'">
          {{ group.ids.reduce((s, id) => s + selections[id], 0) }} 分
        </span>
      </div>

      <div class="item-list">
        <div
          v-for="id in group.ids"
          :key="id"
          class="abcd2-item"
          :class="{ answered: selections[id] > 0 }"
        >
          <div class="item-header">
            <div class="item-meta-row">
              <span class="item-qnum" :class="group.color + '-qnum'"
                >Q{{ id + 1 }}</span
              >
            </div>
            <div class="item-name-block">
              <span class="item-name">{{ items[id].name }}</span>
              <span class="item-sub">{{ items[id].sub }}</span>
            </div>
            <span
              class="item-score"
              :class="{ zero: selections[id] === 0, high: selections[id] > 0 }"
            >
              +{{ selections[id] }}
            </span>
          </div>

          <div class="option-row">
            <label
              v-for="score in items[id].scores"
              :key="score.value"
              class="opt-pill"
              :class="{
                active: selections[id] === score.value,
                ['s' + score.value]: true,
              }"
            >
              <input
                type="radio"
                :name="`abcd2-${id}`"
                :value="score.value"
                v-model="selections[id]"
              />
              <span class="opt-num">{{ score.value }}</span>
              <span class="opt-desc">{{ score.description }}</span>
            </label>
          </div>
        </div>
      </div>
    </div>

    <!-- ── Result card ────────────────────────────────────────── -->
    <div class="abcd2-result" :class="'res-' + risk.color">
      <div class="result-left">
        <span class="result-number">{{ totalScore }}</span>
        <span class="result-max">/ 7</span>
      </div>
      <div class="result-right">
        <span class="result-level">{{ risk.level }}</span>
        <span class="result-advice">{{ risk.advice }}</span>
      </div>
      <span v-show="totalScore >= 4" class="result-alert">
        ⚠️ ≥ 4 建議 雙抗血小板治療（DAPT）
      </span>
    </div>

    <!-- ── Results detail ─────────────────────────────────────── -->
    <div v-if="showResults" class="results-detail">
      <div class="results-header">評估明細</div>
      <div v-for="item in items" :key="item.id" class="detail-row">
        <span class="detail-qnum">Q{{ item.id + 1 }}</span>
        <span class="detail-domain">{{ item.name }}</span>
        <span
          class="detail-score"
          :class="{
            zero: selections[item.id] === 0,
            high: selections[item.id] > 0,
          }"
        >
          {{ selections[item.id] }}
        </span>
        <span class="detail-desc">{{
          item.scores.find((s) => s.value === selections[item.id])?.description
        }}</span>
      </div>
      <div class="detail-row total-row">
        <span class="detail-qnum"></span>
        <span class="detail-domain">ABCD-2 總分</span>
        <span class="detail-score brand">{{ totalScore }} / 7</span>
        <span class="detail-desc">{{ risk.level }}</span>
      </div>
    </div>

    <!-- ── Actions ────────────────────────────────────────────── -->
    <div class="abcd2-actions">
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
.abcd2 {
  max-width: 780px;
  margin: 0 auto;
  padding: 2rem 0 3rem;
  font-size: 0.9rem;
}

/* ── Header ────────────────────────────────────────────────────── */
.abcd2-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 1.25rem;
}
.header-title {
  flex: 1;
  min-width: 0;
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
  font-size: 0.78rem;
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
.score-number {
  font-size: 2rem;
  font-weight: 800;
  line-height: 1;
  transition: color 0.3s;
}
.score-label {
  font-size: 0.68rem;
  font-weight: 600;
  margin-top: 2px;
  letter-spacing: 0.02em;
  text-align: center;
}
.sb-low {
  border-color: #22c55e;
  color: #22c55e;
  box-shadow:
    0 0 0 1px rgba(34, 197, 94, 0.08),
    0 1px 3px rgba(0, 0, 0, 0.04);
}
.sb-mid {
  border-color: #f59e0b;
  color: #f59e0b;
  box-shadow:
    0 0 0 1px rgba(245, 158, 11, 0.08),
    0 1px 3px rgba(0, 0, 0, 0.04);
}
.sb-high {
  border-color: #ef4444;
  color: #ef4444;
  box-shadow:
    0 0 0 1px rgba(239, 68, 68, 0.08),
    0 1px 3px rgba(0, 0, 0, 0.04);
}

/* ── Severity bar ──────────────────────────────────────────────── */
.severity-bar-wrap {
  margin-bottom: 2.5rem;
}
.severity-bar {
  position: relative;
  height: 8px;
  border-radius: 999px;
  background: var(--vp-c-bg-mute);
  overflow: visible;
  margin-bottom: 4px;
  box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.08);
}
.severity-fill {
  height: 100%;
  border-radius: 999px;
  transition:
    width 0.5s cubic-bezier(0.22, 1, 0.36, 1),
    background 0.3s;
}
.sf-low {
  background: linear-gradient(90deg, #22c55e, #4ade80);
}
.sf-mid {
  background: linear-gradient(90deg, #f59e0b, #fbbf24);
}
.sf-high {
  background: linear-gradient(90deg, #ef4444, #f87171);
}
.severity-ticks-abs,
.severity-labels-abs {
  position: relative;
  height: 14px;
  margin-top: 2px;
}
.severity-labels-abs {
  margin-top: 0;
  height: 13px;
}
.tick-abs {
  position: absolute;
  transform: translateX(-50%);
  font-size: 0.65rem;
  color: var(--vp-c-text-3);
  white-space: nowrap;
}
.tick-abs[style*="left: 0%"] {
  transform: translateX(0);
}
.tick-abs[style*="left: 100%"] {
  transform: translateX(-100%);
}
.label-abs {
  position: absolute;
  transform: translateX(-50%);
  font-size: 0.63rem;
  color: var(--vp-c-text-3);
  white-space: nowrap;
}
.label-abs[style*="left: 0%"] {
  transform: translateX(0);
}
.label-abs[style*="left: 100%"] {
  transform: translateX(-100%);
}
.lbl-low {
  color: #22c55e;
}
.lbl-mid {
  color: #f59e0b;
}
.lbl-high {
  color: #ef4444;
}
.t-low {
  color: #22c55e;
}
.t-mid {
  color: #f59e0b;
}
.t-high {
  color: #ef4444;
}

/* ── Intro ─────────────────────────────────────────────────────── */
.intro-bar {
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
.intro-dot {
  color: var(--vp-c-brand-1);
  flex-shrink: 0;
}

/* ── Group ─────────────────────────────────────────────────────── */
.abcd2-group {
  margin-bottom: 1.5rem;
}
.group-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  margin-bottom: 0.5rem;
  padding: 0.65rem 0.85rem 0.65rem 1.5rem;
  border-radius: 10px;
  background: linear-gradient(
    135deg,
    rgba(99, 102, 241, 0.08),
    var(--vp-c-bg-mute),
    var(--vp-c-bg-soft)
  );
  border: 1px solid var(--vp-c-divider);
  border-left: 4px solid var(--vp-c-brand-1);
  box-shadow: 0 1px 3px rgba(99, 102, 241, 0.06);
}
.group-header.indigo-header {
  border-left-color: #6366f1;
  box-shadow: 0 1px 3px rgba(99, 102, 241, 0.06);
}
.group-header.orange-header {
  border-left-color: #f97316;
  background: linear-gradient(
    135deg,
    rgba(249, 115, 22, 0.08),
    var(--vp-c-bg-mute),
    var(--vp-c-bg-soft)
  );
  box-shadow: 0 1px 3px rgba(249, 115, 22, 0.06);
}

.group-label-block {
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.group-label {
  font-size: 0.85rem;
  font-weight: 700;
  color: var(--vp-c-text-1);
}
.group-sub {
  font-size: 0.7rem;
  color: var(--vp-c-text-3);
}
.group-score-pill {
  font-size: 0.78rem;
  font-weight: 700;
  padding: 4px 14px;
  border-radius: 999px;
  border: 1px solid rgba(99, 102, 241, 0.25);
  color: var(--vp-c-brand-1);
  background: rgba(99, 102, 241, 0.06);
  white-space: nowrap;
  flex-shrink: 0;
}
.group-score-pill.indigo-pill {
  border-color: rgba(99, 102, 241, 0.25);
  color: #6366f1;
  background: rgba(99, 102, 241, 0.06);
}
.group-score-pill.orange-pill {
  border-color: rgba(249, 115, 22, 0.25);
  color: #f97316;
  background: rgba(249, 115, 22, 0.06);
}

/* ── Item ──────────────────────────────────────────────────────── */
.item-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
.abcd2-item {
  border: 1px solid var(--vp-c-divider);
  border-radius: 10px;
  background: var(--vp-c-bg-soft);
  overflow: hidden;
  transition:
    border-color 0.25s,
    box-shadow 0.25s;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.03);
}
.abcd2-item:hover {
  box-shadow: 0 3px 12px rgba(0, 0, 0, 0.06);
  border-color: var(--vp-c-divider);
}
.abcd2-item.answered {
  border-color: rgba(99, 102, 241, 0.3);
}

.item-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  padding: 0.6rem 0.9rem;
  border-bottom: 1px solid var(--vp-c-divider);
  gap: 0.75rem;
}
.item-meta-row {
  display: flex;
  align-items: center;
  flex-shrink: 0;
  padding-top: 3px;
}
.item-badge {
  font-size: 0.72rem;
  font-weight: 800;
  color: #fff;
  background: linear-gradient(135deg, var(--vp-c-brand-1), #4f46e5);
  padding: 1px 9px;
  border-radius: 999px;
  letter-spacing: 0.04em;
  box-shadow: 0 1px 3px rgba(99, 102, 241, 0.2);
}
.item-badge.indigo-qnum {
  background: linear-gradient(135deg, #6366f1, #4f46e5);
  box-shadow: 0 1px 3px rgba(99, 102, 241, 0.2);
}
.item-badge.orange-qnum {
  background: linear-gradient(135deg, #f97316, #ea580c);
  box-shadow: 0 1px 3px rgba(249, 115, 22, 0.2);
}

.item-name-block {
  display: flex;
  flex-direction: column;
  gap: 2px;
  flex: 1;
}
.item-name {
  font-size: 0.88rem;
  font-weight: 600;
  color: var(--vp-c-text-1);
}
.item-sub {
  font-size: 0.7rem;
  color: var(--vp-c-text-3);
}

.item-score {
  font-size: 1.1rem;
  font-weight: 800;
  flex-shrink: 0;
  min-width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  background: var(--vp-c-bg);
  border: 1px solid var(--vp-c-divider);
  transition: all 0.25s;
}
.item-score.zero {
  color: #22c55e;
  border-color: rgba(34, 197, 94, 0.25);
  background: rgba(34, 197, 94, 0.06);
}
.item-score.high {
  color: #f97316;
  border-color: rgba(249, 115, 22, 0.3);
  background: rgba(249, 115, 22, 0.08);
}

/* ── Option pills (ENS6Q style) ────────────────────────────────── */
.option-row {
  display: flex;
  flex-wrap: wrap;
  gap: 3px;
  padding: 4px;
  background: var(--vp-c-bg-mute);
}

.opt-pill {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex: 1;
  min-width: 60px;
  padding: 0.6rem 0.4rem;
  cursor: pointer;
  transition: all 0.2s;
  text-align: center;
  gap: 6px;
  border-radius: 6px;
  background: var(--vp-c-bg);
  border: 1.5px solid transparent;
}
.opt-pill:hover {
  border-color: var(--vp-c-divider);
  background: var(--vp-c-bg-soft);
}
.opt-pill input[type="radio"] {
  display: none;
}
.opt-num {
  font-size: 0.95rem;
  font-weight: 900;
  transition: color 0.2s;
  color: var(--vp-c-text-3);
}
.item-desc {
  font-size: 0.7rem;
  font-weight: 700;
  line-height: 1.35;
  transition: color 0.2s;
  color: var(--vp-c-text-3);
}

/* Score colors */
.opt-pill.s0 {
  border-color: rgba(34, 197, 94, 0.15);
}
.opt-pill.s0:hover:not(.active),
.opt-pill.s0:focus-within {
  border-color: rgba(34, 197, 94, 0.35);
  background: rgba(34, 197, 94, 0.04);
}
.opt-pill.s0.active {
  border-color: #22c55e;
  background: linear-gradient(
    180deg,
    rgba(34, 197, 94, 0.12),
    rgba(34, 197, 94, 0.06)
  );
  box-shadow: 0 0 0 1px rgba(34, 197, 94, 0.08);
}
.opt-pill.s0 .opt-num {
  color: rgba(34, 197, 94, 0.5);
}
.opt-pill.s0.active .opt-num {
  color: #22c55e;
}
.opt-pill.s0 .item-desc {
  color: rgba(34, 197, 94, 0.4);
}
.opt-pill.s0.active .item-desc {
  color: rgba(34, 197, 94, 0.7);
}

.opt-pill.s1 {
  border-color: rgba(245, 158, 11, 0.15);
}
.opt-pill.s1:hover:not(.active),
.opt-pill.s1:focus-within {
  border-color: rgba(245, 158, 11, 0.35);
  background: rgba(245, 158, 11, 0.04);
}
.opt-pill.s1.active {
  border-color: #f59e0b;
  background: linear-gradient(
    180deg,
    rgba(245, 158, 11, 0.12),
    rgba(245, 158, 11, 0.06)
  );
  box-shadow: 0 0 0 1px rgba(245, 158, 11, 0.08);
}
.opt-pill.s1 .opt-num {
  color: rgba(245, 158, 11, 0.5);
}
.opt-pill.s1.active .opt-num {
  color: #f59e0b;
}
.opt-pill.s1 .item-desc {
  color: rgba(245, 158, 11, 0.4);
}
.opt-pill.s1.active .item-desc {
  color: rgba(245, 158, 11, 0.7);
}

.opt-pill.s2 {
  border-color: rgba(239, 68, 68, 0.15);
}
.opt-pill.s2:hover:not(.active),
.opt-pill.s2:focus-within {
  border-color: rgba(239, 68, 68, 0.35);
  background: rgba(239, 68, 68, 0.04);
}
.opt-pill.s2.active {
  border-color: #ef4444;
  background: linear-gradient(
    180deg,
    rgba(239, 68, 68, 0.12),
    rgba(239, 68, 68, 0.06)
  );
  box-shadow: 0 0 0 1px rgba(239, 68, 68, 0.08);
}
.opt-pill.s2 .opt-num {
  color: rgba(239, 68, 68, 0.5);
}
.opt-pill.s2.active .opt-num {
  color: #ef4444;
}
.opt-pill.s2 .item-desc {
  color: rgba(239, 68, 68, 0.4);
}
.opt-pill.s2.active .item-desc {
  color: rgba(239, 68, 68, 0.7);
}

/* ── Result card ───────────────────────────────────────────────── */
.abcd2-result {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  padding: 1.25rem 1.5rem;
  border-radius: 14px;
  border: 1px solid var(--vp-c-divider);
  background: linear-gradient(135deg, var(--vp-c-bg-soft), var(--vp-c-bg-mute));
  margin-bottom: 1rem;
  flex-wrap: wrap;
  position: relative;
  transition: all 0.3s;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
}
.res-low {
  border-color: #22c55e;
  box-shadow:
    0 0 0 1px rgba(34, 197, 94, 0.06),
    0 1px 3px rgba(0, 0, 0, 0.04);
}
.res-mid {
  border-color: #f59e0b;
  box-shadow:
    0 0 0 1px rgba(245, 158, 11, 0.06),
    0 1px 3px rgba(0, 0, 0, 0.04);
}
.res-high {
  border-color: #ef4444;
  box-shadow:
    0 0 0 1px rgba(239, 68, 68, 0.06),
    0 1px 3px rgba(0, 0, 0, 0.04);
}

.result-left {
  display: flex;
  align-items: baseline;
  gap: 4px;
  flex-shrink: 0;
}
.result-number {
  font-size: 3.5rem;
  font-weight: 800;
  line-height: 1;
  color: var(--vp-c-text-3);
  transition: color 0.3s;
}
.res-low .result-number {
  color: #22c55e;
}
.res-mid .result-number {
  color: #f59e0b;
}
.res-high .result-number {
  color: #ef4444;
}

.result-max {
  font-size: 1rem;
  color: var(--vp-c-text-3);
}
.result-right {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.result-level {
  font-size: 1rem;
  font-weight: 700;
  color: var(--vp-c-text-1);
}
.result-advice {
  font-size: 0.83rem;
  color: var(--vp-c-text-2);
  line-height: 1.5;
}
.result-alert {
  position: absolute;
  right: 1.5rem;
  top: 50%;
  transform: translateY(-50%);
  font-size: 0.82rem;
  font-weight: 600;
  color: #ef4444;
  padding: 6px 10px;
  background: rgba(239, 68, 68, 0.08);
  border: 1px solid rgba(239, 68, 68, 0.25);
  border-radius: 6px;
  white-space: nowrap;
}

/* ── Results detail ────────────────────────────────────────────── */
.results-detail {
  border: 1px solid var(--vp-c-divider);
  border-radius: 10px;
  overflow: hidden;
  margin-bottom: 1rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.03);
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
  padding: 0.5rem 0.9rem;
  border-bottom: 1px solid var(--vp-c-divider);
}
.detail-row:last-child {
  border-bottom: none;
}
.total-row {
  background: linear-gradient(135deg, var(--vp-c-bg-mute), var(--vp-c-bg-soft));
  font-weight: 800;
}
.detail-qnum {
  font-size: 0.7rem;
  font-weight: 800;
  color: var(--vp-c-brand-1);
  flex-shrink: 0;
  width: 32px;
}
.detail-domain {
  font-size: 0.8rem;
  font-weight: 700;
  color: var(--vp-c-text-1);
  flex: 1;
}
.detail-score {
  font-size: 0.82rem;
  font-weight: 800;
  flex-shrink: 0;
  width: 60px;
  text-align: right;
}
.detail-score.zero {
  color: #22c55e;
}
.detail-score.high {
  color: #f97316;
}
.detail-score.brand {
  color: var(--vp-c-brand-1);
}
.detail-desc {
  font-size: 0.75rem;
  color: var(--vp-c-text-2);
  flex-shrink: 0;
  width: 108px;
  text-align: left;
}

/* ── Actions ───────────────────────────────────────────────────── */
.abcd2-actions {
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
  .abcd2-header {
    flex-direction: column;
  }
  .score-badge {
    flex-direction: row;
    gap: 0.5rem;
    align-self: flex-start;
  }
  .score-number {
    font-size: 1.5rem;
  }
  .abcd2-result {
    flex-direction: column;
    gap: 0.75rem;
  }
  .result-alert {
    position: static;
    transform: none;
    align-self: flex-start;
    white-space: normal;
  }
}
</style>
