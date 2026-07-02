<script setup lang="ts">
import { ref, computed } from "vue";

// ── VHI-10 Questions ──────────────────────────────────────────────
const questions = [
  {
    key: "q1",
    name: "我的嗓音讓別人難以聽清楚我說的話",
    sub: "My voice makes it difficult for people to hear me",
    domain: "F",
  },
  {
    key: "q2",
    name: "在嘈雜環境中，別人很難聽懂我說的話",
    sub: "People have difficulty understanding me in a noisy room",
    domain: "F",
  },
  {
    key: "q3",
    name: "我的家人很難聽到我在另一個房間的聲音",
    sub: "My family has difficulty hearing me when I call them throughout the house",
    domain: "F",
  },
  {
    key: "q4",
    name: "我在工作或社交場合較少使用電話",
    sub: "I use the phone less often than I would like to",
    domain: "F",
  },
  {
    key: "q5",
    name: "因為嗓音問題，我傾向於減少外出",
    sub: "I tend to avoid groups of people because of my voice",
    domain: "E",
  },
  {
    key: "q6",
    name: "我的嗓音問題讓我覺得自己有殘缺",
    sub: "I feel handicapped by my voice problem",
    domain: "E",
  },
  {
    key: "q7",
    name: "當別人請我重複說一次時，我會感到煩躁",
    sub: "I feel annoyed when people ask me to repeat myself",
    domain: "E",
  },
  {
    key: "q8",
    name: "我的聲音讓我在說話時感到焦慮",
    sub: "I feel anxious or tense when talking with others because of my voice",
    domain: "E",
  },
  {
    key: "q9",
    name: "我的嗓音讓我覺得無能為力",
    sub: "My voice problem upsets me",
    domain: "E",
  },
  {
    key: "q10",
    name: "我的嗓音讓我在收入、工作或晉升方面蒙受損失",
    sub: "My voice problem causes me to lose income",
    domain: "F",
  },
];

const scoreOptions = [
  { value: 0, label: "0", desc: "從不" },
  { value: 1, label: "1", desc: "幾乎不" },
  { value: 2, label: "2", desc: "有時" },
  { value: 3, label: "3", desc: "經常" },
  { value: 4, label: "4", desc: "總是" },
];

// ── State ─────────────────────────────────────────────────────────
const selections = ref<Record<string, number>>(
  Object.fromEntries(questions.map((q) => [q.key, -1])),
);

const showResults = ref(false);
const copied = ref(false);

// ── Computed ──────────────────────────────────────────────────────
const answeredCount = computed(
  () => questions.filter((q) => selections.value[q.key] >= 0).length,
);

const isComplete = computed(() => answeredCount.value === 10);

const totalScore = computed(() =>
  questions.reduce((sum, q) => {
    const v = selections.value[q.key];
    return sum + (v >= 0 ? v : 0);
  }, 0),
);

const funcScore = computed(() =>
  questions
    .filter((q) => q.domain === "F")
    .reduce((sum, q) => {
      const v = selections.value[q.key];
      return sum + (v >= 0 ? v : 0);
    }, 0),
);

const emoScore = computed(() =>
  questions
    .filter((q) => q.domain === "E")
    .reduce((sum, q) => {
      const v = selections.value[q.key];
      return sum + (v >= 0 ? v : 0);
    }, 0),
);

const severity = computed(() => {
  const s = totalScore.value;
  if (!isComplete.value)
    return {
      level: "填寫中",
      color: "filling",
      advice: `已完成 ${answeredCount.value}/10 題`,
    };
  if (s <= 10)
    return {
      level: "輕度障礙",
      color: "mild",
      advice: "嗓音問題對生活影響輕微",
    };
  if (s <= 20)
    return {
      level: "中度障礙",
      color: "moderate",
      advice: "嗓音問題對功能與情緒有中等程度影響，建議評估",
    };
  return {
    level: "重度障礙",
    color: "severe",
    advice: "嗓音問題嚴重影響生活與工作，強烈建議嗓音治療或手術評估",
  };
});

function generateMarkdown() {
  const lines = questions
    .map((q) => {
      const v = selections.value[q.key];
      const opt = scoreOptions.find((o) => o.value === v);
      return `- **Q${q.key.slice(1)} [${q.domain}]** ${q.name}：${v >= 0 ? `${v} — ${opt?.desc}` : "未填"}`;
    })
    .join("\n");

  return `# VHI-10 嗓音障礙指數評估結果\n\n## 各題評分\n\n${lines}\n\n---\n\n## 計算結果\n\n- **VHI-10 總分**：${totalScore.value} / 40\n- **功能面向（F）**：${funcScore.value} / 20\n- **情緒面向（E）**：${emoScore.value} / 20\n- **嚴重程度**：${severity.value.level}\n- **臨床建議**：${severity.value.advice}`;
}

async function copyMarkdown() {
  await navigator.clipboard.writeText(generateMarkdown());
  copied.value = true;
  setTimeout(() => (copied.value = false), 2000);
}

function reset() {
  questions.forEach((q) => {
    selections.value[q.key] = -1;
  });
  showResults.value = false;
}
</script>

<template>
  <div class="vhi">
    <!-- Header -->
    <div class="vhi-header">
      <div class="header-title">
        <h2 class="title">VHI-10 嗓音障礙指數</h2>
        <p class="subtitle">
          Voice Handicap Index–10 · 嗓音問題對生活的主觀影響
        </p>
      </div>
      <div class="score-badge" :class="severity.color">
        <span class="score-number">{{ isComplete ? totalScore : "—" }}</span>
        <span class="score-label">{{
          isComplete ? severity.level : `${answeredCount}/10`
        }}</span>
      </div>
    </div>

    <!-- Severity bar -->
    <div class="severity-bar-wrap">
      <div class="severity-bar">
        <div
          class="severity-fill"
          :class="severity.color"
          :style="{ width: (totalScore / 40) * 100 + '%' }"
        />
      </div>
      <div class="severity-ticks">
        <span>0</span><span>10</span><span>20</span><span>30</span
        ><span>40</span>
      </div>
    </div>

    <!-- Sub-scores -->
    <div class="sub-scores">
      <div class="sub-score-pill func">
        <span class="sub-label">功能（F）</span>
        <span class="sub-val">{{ funcScore }} / 20</span>
      </div>
      <div class="sub-score-pill emo">
        <span class="sub-label">情緒（E）</span>
        <span class="sub-val">{{ emoScore }} / 20</span>
      </div>
    </div>

    <!-- Intro -->
    <div class="intro-bar">
      <span class="intro-dot">◉</span>
      <span
        >請依據嗓音問題對您日常生活的實際影響作答。每題 0（從不）至
        4（總是），共 10 題，總分 0–40
        分。分數越高，嗓音障礙對生活影響越大。</span
      >
    </div>

    <!-- Groups by domain -->
    <div
      v-for="domainInfo in [
        {
          key: 'F',
          label: '功能面向',
          sub: 'Functional Domain',
          color: 'func',
        },
        { key: 'E', label: '情緒面向', sub: 'Emotional Domain', color: 'emo' },
      ]"
      :key="domainInfo.key"
      class="vhi-group"
    >
      <div class="group-header" :class="domainInfo.color + '-header'">
        <div class="group-label-block">
          <span class="group-label">{{ domainInfo.label }}</span>
          <span class="group-sub">{{ domainInfo.sub }}</span>
        </div>
        <div class="group-score-pill" :class="domainInfo.color + '-pill'">
          {{ domainInfo.key === "F" ? funcScore : emoScore }} / 20
        </div>
      </div>

      <div class="item-list">
        <div
          v-for="q in questions.filter((q) => q.domain === domainInfo.key)"
          :key="q.key"
          class="vhi-item"
          :class="{
            answered: selections[q.key] >= 0,
            high: selections[q.key] >= 3,
            [domainInfo.color]: selections[q.key] >= 0,
          }"
        >
          <!-- Item header -->
          <div class="item-header">
            <div class="item-meta-row">
              <span class="item-qnum" :class="domainInfo.color + '-qnum'"
                >Q{{ q.key.slice(1) }}</span
              >
              <span class="domain-tag" :class="domainInfo.color">{{
                domainInfo.key
              }}</span>
            </div>
            <div class="item-name-block">
              <span class="item-name">{{ q.name }}</span>
              <span class="item-sub">{{ q.sub }}</span>
            </div>
            <span
              class="item-score"
              :class="{
                zero: selections[q.key] === 0,
                unanswered: selections[q.key] < 0,
                high: selections[q.key] >= 3,
              }"
            >
              {{ selections[q.key] >= 0 ? selections[q.key] : "—" }}
            </span>
          </div>

          <!-- Score options -->
          <div class="option-row">
            <label
              v-for="opt in scoreOptions"
              :key="opt.value"
              class="opt-pill"
              :class="{
                active: selections[q.key] === opt.value,
                high: opt.value >= 3 && selections[q.key] === opt.value,
                ['s' + opt.value]: true,
              }"
            >
              <input
                type="radio"
                :name="q.key"
                :value="opt.value"
                v-model="selections[q.key]"
              />
              <span class="opt-num">{{ opt.label }}</span>
              <span class="opt-desc">{{ opt.desc }}</span>
            </label>
          </div>
        </div>
      </div>
    </div>

    <!-- Result card -->
    <div class="vhi-result" :class="severity.color">
      <div class="result-left">
        <span class="result-number">{{ isComplete ? totalScore : "—" }}</span>
        <span class="result-max">/ 40</span>
      </div>
      <div class="result-right">
        <span class="result-level">{{ severity.level }}</span>
        <span class="result-advice">{{ severity.advice }}</span>
        <div class="result-breakdown">
          <span class="breakdown-pill func-pill">功能 F：{{ funcScore }}</span>
          <span class="breakdown-pill emo-pill">情緒 E：{{ emoScore }}</span>
        </div>
      </div>
    </div>

    <!-- Results detail -->
    <div v-if="showResults" class="results-detail">
      <div class="results-header">評估明細</div>
      <div class="detail-section-title func-section">
        功能面向（Functional Domain）— {{ funcScore }} / 20
      </div>
      <div
        v-for="q in questions.filter((q) => q.domain === 'F')"
        :key="q.key"
        class="detail-row"
      >
        <span class="detail-qnum">Q{{ q.key.slice(1) }}</span>
        <span class="detail-domain">{{ q.name }}</span>
        <span
          class="detail-score"
          :class="{
            zero: selections[q.key] === 0,
            high: selections[q.key] >= 3,
            brand: selections[q.key] > 0 && selections[q.key] < 3,
          }"
        >
          {{ selections[q.key] >= 0 ? selections[q.key] : "—" }}
        </span>
        <span class="detail-desc">
          {{
            selections[q.key] >= 0
              ? scoreOptions.find((o) => o.value === selections[q.key])?.desc
              : "未填"
          }}
        </span>
      </div>
      <div class="detail-section-title emo-section">
        情緒面向（Emotional Domain）— {{ emoScore }} / 20
      </div>
      <div
        v-for="q in questions.filter((q) => q.domain === 'E')"
        :key="q.key"
        class="detail-row"
      >
        <span class="detail-qnum">Q{{ q.key.slice(1) }}</span>
        <span class="detail-domain">{{ q.name }}</span>
        <span
          class="detail-score"
          :class="{
            zero: selections[q.key] === 0,
            high: selections[q.key] >= 3,
            brand: selections[q.key] > 0 && selections[q.key] < 3,
          }"
        >
          {{ selections[q.key] >= 0 ? selections[q.key] : "—" }}
        </span>
        <span class="detail-desc">
          {{
            selections[q.key] >= 0
              ? scoreOptions.find((o) => o.value === selections[q.key])?.desc
              : "未填"
          }}
        </span>
      </div>
    </div>

    <!-- Actions -->
    <div class="vhi-actions">
      <button class="btn-view" @click="showResults = !showResults">
        {{ showResults ? "收起明細" : "查看評估結果" }}
      </button>
      <button class="btn-copy" @click="copyMarkdown">
        {{ copied ? "已複製 ✓" : "複製 Markdown 結果" }}
      </button>
      <button class="btn-reset" @click="reset">重置</button>
    </div>
    <p v-if="!isComplete" class="progress-hint">
      已完成 {{ answeredCount }}/10 題，尚餘 {{ 10 - answeredCount }} 題
    </p>
  </div>
</template>

<style scoped>
.vhi {
  max-width: 780px;
  margin: 0 auto;
  padding: 2rem 0 3rem;
  font-size: 0.9rem;
}

/* ── Header ────────────────────────────────────────────────────── */
.vhi-header {
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
  text-align: center;
}

.score-badge.filling {
  color: var(--vp-c-text-3);
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

/* ── Severity bar ──────────────────────────────────────────────── */
.severity-bar-wrap {
  margin-bottom: 0.75rem;
}

.severity-bar {
  height: 8px;
  border-radius: 999px;
  background: var(--vp-c-bg-mute);
  overflow: hidden;
  margin-bottom: 4px;
  box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.04);
}

.severity-fill {
  height: 100%;
  border-radius: 999px;
  transition:
    width 0.5s cubic-bezier(0.22, 1, 0.36, 1),
    background 0.3s;
}
.severity-fill.filling {
  background: var(--vp-c-divider);
}
.severity-fill.mild {
  background: linear-gradient(90deg, #f59e0b, #d97706);
}
.severity-fill.moderate {
  background: linear-gradient(90deg, #f97316, #ea580c);
}
.severity-fill.severe {
  background: linear-gradient(90deg, #ef4444, #dc2626);
}

.severity-ticks {
  display: flex;
  justify-content: space-between;
  font-size: 0.68rem;
  color: var(--vp-c-text-3);
  padding: 0 2px;
}

/* ── Sub-scores ────────────────────────────────────────────────── */
.sub-scores {
  display: flex;
  gap: 0.6rem;
  margin-bottom: 1.25rem;
  flex-wrap: wrap;
}

.sub-score-pill {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 5px 14px;
  border-radius: 10px;
  border: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg-soft);
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.03);
}

.sub-score-pill.func {
  border-color: rgba(99, 102, 241, 0.3);
}
.sub-score-pill.emo {
  border-color: rgba(20, 184, 166, 0.3);
}

.sub-label {
  font-size: 0.75rem;
  font-weight: 700;
  color: var(--vp-c-text-2);
}
.sub-val {
  font-size: 0.85rem;
  font-weight: 800;
}
.sub-score-pill.func .sub-val {
  color: #6366f1;
}
.sub-score-pill.emo .sub-val {
  color: #14b8a6;
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
.vhi-group {
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
  border: 1px solid var(--vp-c-divider);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
}
.group-header.func-header {
  background: linear-gradient(
    135deg,
    #eef2ff,
    var(--vp-c-bg-mute),
    var(--vp-c-bg-soft)
  );
  border-left: 4px solid #6366f1;
  box-shadow: 0 1px 3px rgba(99, 102, 241, 0.06);
}
.group-header.emo-header {
  background: linear-gradient(
    135deg,
    #ecfdf5,
    var(--vp-c-bg-mute),
    var(--vp-c-bg-soft)
  );
  border-left: 4px solid #14b8a6;
  box-shadow: 0 1px 3px rgba(20, 184, 166, 0.06);
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
  white-space: nowrap;
  flex-shrink: 0;
}
.group-score-pill.func-pill {
  color: #6366f1;
  border: 1px solid rgba(99, 102, 241, 0.25);
  background: rgba(99, 102, 241, 0.06);
}
.group-score-pill.emo-pill {
  color: #14b8a6;
  border: 1px solid rgba(20, 184, 166, 0.25);
  background: rgba(20, 184, 166, 0.06);
}

/* ── Item ──────────────────────────────────────────────────────── */
.item-list {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
}

.vhi-item {
  border: 1px solid var(--vp-c-divider);
  border-radius: 10px;
  background: var(--vp-c-bg-soft);
  overflow: hidden;
  transition: all 0.25s;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.03);
}
.vhi-item:hover {
  box-shadow: 0 3px 12px rgba(0, 0, 0, 0.06);
  border-color: var(--vp-c-divider);
}
.vhi-item.answered.func {
  border-color: rgba(99, 102, 241, 0.2);
  background: linear-gradient(
    135deg,
    var(--vp-c-bg-soft),
    rgba(99, 102, 241, 0.03)
  );
}
.vhi-item.answered.emo {
  border-color: rgba(20, 184, 166, 0.2);
  background: linear-gradient(
    135deg,
    var(--vp-c-bg-soft),
    rgba(20, 184, 166, 0.03)
  );
}
.vhi-item.high {
  border-color: rgba(249, 115, 22, 0.25) !important;
  background: linear-gradient(
    135deg,
    var(--vp-c-bg-soft),
    rgba(249, 115, 22, 0.04)
  ) !important;
  box-shadow: 0 2px 10px rgba(249, 115, 22, 0.08);
}

.item-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  padding: 0.65rem 0.9rem 0.6rem;
  background: var(--vp-c-bg-mute);
  border-bottom: 1px solid var(--vp-c-divider);
  gap: 0.75rem;
}

.item-name-block {
  display: flex;
  flex-direction: column;
  gap: 3px;
  flex: 1;
}

.item-meta-row {
  display: flex;
  align-items: center;
  flex-shrink: 0;
  gap: 6px;
}

.item-qnum {
  font-size: 0.7rem;
  font-weight: 800;
  color: #fff;
  padding: 2px 9px;
  border-radius: 999px;
  letter-spacing: 0.04em;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.15);
}
.item-qnum.func-qnum {
  background: linear-gradient(135deg, #6366f1, #4f46e5);
}
.item-qnum.emo-qnum {
  background: linear-gradient(135deg, #14b8a6, #0d9488);
}
.vhi-item.high .item-qnum {
  background: linear-gradient(135deg, #f97316, #ef4444) !important;
  box-shadow: 0 1px 3px rgba(249, 115, 22, 0.3);
}

.domain-tag {
  font-size: 0.6rem;
  font-weight: 700;
  padding: 1px 7px;
  border-radius: 4px;
}
.domain-tag.func {
  background: rgba(99, 102, 241, 0.12);
  color: #6366f1;
}
.domain-tag.emo {
  background: rgba(20, 184, 166, 0.12);
  color: #14b8a6;
}

.item-name {
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--vp-c-text-1);
  line-height: 1.4;
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
.item-score.unanswered {
  color: var(--vp-c-text-3);
  border-color: var(--vp-c-divider);
  background: transparent;
}
.item-score.high {
  color: #f97316;
  border-color: rgba(249, 115, 22, 0.3);
  background: rgba(249, 115, 22, 0.08);
}

/* ── Option row — 5 columns ────────────────────────────────────── */
.option-row {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 2px;
  padding: 3px;
  background: var(--vp-c-bg-mute);
}

.opt-pill {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 0.55rem 0.1rem;
  cursor: pointer;
  transition: all 0.2s;
  text-align: center;
  gap: 3px;
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

/* Score-specific colors */
.opt-pill.s0 {
  border-color: rgba(34, 197, 94, 0.15);
}
.opt-pill.s0:hover:not(.active) {
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

.opt-pill.s1 {
  border-color: rgba(132, 204, 22, 0.15);
}
.opt-pill.s1:hover:not(.active) {
  border-color: rgba(132, 204, 22, 0.35);
  background: rgba(132, 204, 22, 0.04);
}
.opt-pill.s1.active {
  border-color: #84cc16;
  background: linear-gradient(
    180deg,
    rgba(132, 204, 22, 0.12),
    rgba(132, 204, 22, 0.06)
  );
  box-shadow: 0 0 0 1px rgba(132, 204, 22, 0.08);
}

.opt-pill.s2 {
  border-color: rgba(234, 179, 8, 0.15);
}
.opt-pill.s2:hover:not(.active) {
  border-color: rgba(234, 179, 8, 0.35);
  background: rgba(234, 179, 8, 0.04);
}
.opt-pill.s2.active {
  border-color: #eab308;
  background: linear-gradient(
    180deg,
    rgba(234, 179, 8, 0.12),
    rgba(234, 179, 8, 0.06)
  );
  box-shadow: 0 0 0 1px rgba(234, 179, 8, 0.08);
}

.opt-pill.s3 {
  border-color: rgba(245, 158, 11, 0.15);
}
.opt-pill.s3:hover:not(.active) {
  border-color: rgba(245, 158, 11, 0.35);
  background: rgba(245, 158, 11, 0.04);
}
.opt-pill.s3.active {
  border-color: #f59e0b;
  background: linear-gradient(
    180deg,
    rgba(245, 158, 11, 0.12),
    rgba(245, 158, 11, 0.06)
  );
  box-shadow: 0 0 0 1px rgba(245, 158, 11, 0.08);
}

.opt-pill.s4 {
  border-color: rgba(249, 115, 22, 0.15);
}
.opt-pill.s4:hover:not(.active) {
  border-color: rgba(249, 115, 22, 0.35);
  background: rgba(249, 115, 22, 0.04);
}
.opt-pill.s4.active {
  border-color: #f97316;
  background: linear-gradient(
    180deg,
    rgba(249, 115, 22, 0.12),
    rgba(249, 115, 22, 0.06)
  );
  box-shadow: 0 0 0 1px rgba(249, 115, 22, 0.08);
}

.opt-num {
  font-size: 1rem;
  font-weight: 900;
  transition: color 0.2s;
}
.opt-pill.s0 .opt-num {
  color: rgba(34, 197, 94, 0.5);
}
.opt-pill.s0.active .opt-num {
  color: #22c55e;
}
.opt-pill.s1 .opt-num {
  color: rgba(132, 204, 22, 0.5);
}
.opt-pill.s1.active .opt-num {
  color: #84cc16;
}
.opt-pill.s2 .opt-num {
  color: rgba(234, 179, 8, 0.5);
}
.opt-pill.s2.active .opt-num {
  color: #eab308;
}
.opt-pill.s3 .opt-num {
  color: rgba(245, 158, 11, 0.5);
}
.opt-pill.s3.active .opt-num {
  color: #f59e0b;
}
.opt-pill.s4 .opt-num {
  color: rgba(249, 115, 22, 0.5);
}
.opt-pill.s4.active .opt-num {
  color: #f97316;
}

.opt-desc {
  font-size: 0.7rem;
  font-weight: 700;
  line-height: 1.2;
  transition: color 0.2s;
}
.opt-pill.s0 .opt-desc {
  color: rgba(34, 197, 94, 0.4);
}
.opt-pill.s0.active .opt-desc {
  color: rgba(34, 197, 94, 0.7);
}
.opt-pill.s1 .opt-desc {
  color: rgba(132, 204, 22, 0.4);
}
.opt-pill.s1.active .opt-desc {
  color: rgba(132, 204, 22, 0.7);
}
.opt-pill.s2 .opt-desc {
  color: rgba(234, 179, 8, 0.4);
}
.opt-pill.s2.active .opt-desc {
  color: rgba(234, 179, 8, 0.7);
}
.opt-pill.s3 .opt-desc {
  color: rgba(245, 158, 11, 0.4);
}
.opt-pill.s3.active .opt-desc {
  color: rgba(245, 158, 11, 0.7);
}
.opt-pill.s4 .opt-desc {
  color: rgba(249, 115, 22, 0.4);
}
.opt-pill.s4.active .opt-desc {
  color: rgba(249, 115, 22, 0.7);
}

/* ── Result card ───────────────────────────────────────────────── */
.vhi-result {
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

.vhi-result.mild {
  border-color: #f59e0b;
  box-shadow:
    0 0 0 1px rgba(245, 158, 11, 0.06),
    0 1px 3px rgba(0, 0, 0, 0.04);
}
.vhi-result.moderate {
  border-color: #f97316;
  box-shadow:
    0 0 0 1px rgba(249, 115, 22, 0.06),
    0 1px 3px rgba(0, 0, 0, 0.04);
}
.vhi-result.severe {
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
.vhi-result.mild .result-number {
  color: #f59e0b;
}
.vhi-result.moderate .result-number {
  color: #f97316;
}
.vhi-result.severe .result-number {
  color: #ef4444;
}

.result-max {
  font-size: 1rem;
  color: var(--vp-c-text-3);
}
.result-right {
  display: flex;
  flex-direction: column;
  gap: 5px;
  flex: 1;
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

.result-breakdown {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  margin-top: 2px;
}
.breakdown-pill {
  font-size: 0.72rem;
  font-weight: 700;
  padding: 2px 10px;
  border-radius: 999px;
}
.func-pill {
  background: rgba(99, 102, 241, 0.1);
  color: #6366f1;
  border: 1px solid rgba(99, 102, 241, 0.3);
}
.emo-pill {
  background: rgba(20, 184, 166, 0.1);
  color: #14b8a6;
  border: 1px solid rgba(20, 184, 166, 0.3);
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
  padding: 0.55rem 0.9rem;
  font-size: 0.7rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--vp-c-text-3);
  background: var(--vp-c-bg-mute);
  border-bottom: 1px solid var(--vp-c-divider);
}

.detail-section-title {
  padding: 0.4rem 0.9rem;
  font-size: 0.75rem;
  font-weight: 700;
  border-bottom: 1px solid var(--vp-c-divider);
}
.func-section {
  color: #6366f1;
  background: rgba(99, 102, 241, 0.06);
}
.emo-section {
  color: #14b8a6;
  background: rgba(20, 184, 166, 0.06);
}

.detail-row {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.45rem 0.9rem;
  border-bottom: 1px solid var(--vp-c-divider);
  transition: background 0.1s;
}
.detail-row:hover {
  background: var(--vp-c-bg-soft);
}
.detail-row:last-child {
  border-bottom: none;
}

.detail-qnum {
  font-size: 0.7rem;
  font-weight: 800;
  color: var(--vp-c-brand-1);
  flex-shrink: 0;
  width: 32px;
}
.detail-domain {
  font-size: 0.78rem;
  font-weight: 700;
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
  width: 60px;
  text-align: left;
}

/* ── Actions ───────────────────────────────────────────────────── */
.vhi-actions {
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

.progress-hint {
  font-size: 0.75rem;
  color: var(--vp-c-text-3);
  margin: 0.4rem 0 0;
}

@media (max-width: 640px) {
  .vhi-header {
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
  .vhi-result {
    flex-direction: column;
    gap: 0.75rem;
  }
  .detail-desc {
    width: 48px;
  }
}
</style>
