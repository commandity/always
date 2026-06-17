<script setup lang="ts">
import { ref, computed } from "vue";

const groups = [
  {
    label: "鼻部症狀",
    sub: "Rhinological Symptoms",
    color: "nasal",
    icon: "👃",
    items: [
      { key: "q1", name: "需要擤鼻子", sub: "Need to blow nose" },
      { key: "q2", name: "鼻塞", sub: "Nasal blockage" },
      { key: "q3", name: "打噴嚏", sub: "Sneezing" },
      { key: "q4", name: "流鼻水", sub: "Runny nose" },
      { key: "q5", name: "鼻涕倒流", sub: "Post-nasal discharge" },
      { key: "q6", name: "濃稠鼻涕", sub: "Thick nasal discharge" },
      { key: "q7", name: "嗅覺／味覺喪失", sub: "Loss of smell / taste" },
      { key: "q8", name: "咳嗽", sub: "Cough" },
    ],
  },
  {
    label: "耳部與顏面症狀",
    sub: "Otologic / Facial Symptoms",
    color: "ear",
    icon: "👂",
    items: [
      { key: "q9", name: "耳悶塞感", sub: "Ear fullness" },
      { key: "q10", name: "頭暈", sub: "Dizziness" },
      { key: "q11", name: "耳痛／耳壓", sub: "Ear pain / pressure" },
      { key: "q12", name: "臉部疼痛／壓迫感", sub: "Facial pain / pressure" },
    ],
  },
  {
    label: "睡眠功能",
    sub: "Sleep Function",
    color: "sleep",
    icon: "🌙",
    items: [
      { key: "q13", name: "難以入睡", sub: "Difficulty falling asleep" },
      { key: "q14", name: "夜間醒來", sub: "Waking up at night" },
      { key: "q15", name: "睡眠品質不佳", sub: "Lack of good night's sleep" },
      { key: "q16", name: "醒來時感到疲累", sub: "Waking up tired" },
      { key: "q17", name: "白天疲倦", sub: "Fatigue during the day" },
    ],
  },
  {
    label: "心理與情緒功能",
    sub: "Psychological / Emotional Function",
    color: "psych",
    icon: "🧠",
    items: [
      { key: "q18", name: "生產力降低", sub: "Reduced productivity" },
      { key: "q19", name: "注意力下降", sub: "Reduced concentration" },
      {
        key: "q20",
        name: "感到沮喪",
        sub: "Frustrated / restless / irritable",
      },
      { key: "q21", name: "感到悲傷", sub: "Sad" },
      { key: "q22", name: "感到尷尬／羞恥", sub: "Embarrassed" },
    ],
  },
];

const allItems = groups.flatMap((g) => g.items);

const scoreOptions = [
  { value: 0, label: "0", desc: "無問題" },
  { value: 1, label: "1", desc: "極輕微" },
  { value: 2, label: "2", desc: "輕度" },
  { value: 3, label: "3", desc: "中度" },
  { value: 4, label: "4", desc: "重度" },
  { value: 5, label: "5", desc: "最嚴重" },
];

const selections = ref<Record<string, number>>(
  Object.fromEntries(allItems.map((i) => [i.key, -1])),
);
const showResults = ref(false);
const copied = ref(false);

const answeredCount = computed(
  () => allItems.filter((i) => selections.value[i.key] >= 0).length,
);
const isComplete = computed(() => answeredCount.value === 22);

const groupScore = (g: (typeof groups)[0]) =>
  g.items.reduce((sum, i) => {
    const v = selections.value[i.key];
    return sum + (v >= 0 ? v : 0);
  }, 0);

const totalScore = computed(() =>
  allItems.reduce((sum, i) => {
    const v = selections.value[i.key];
    return sum + (v >= 0 ? v : 0);
  }, 0),
);

const severity = computed(() => {
  const s = totalScore.value;
  if (!isComplete.value)
    return {
      level: "填寫中",
      color: "filling",
      advice: `已完成 ${answeredCount.value}/22 題`,
    };
  if (s < 20)
    return { level: "輕微", color: "normal", advice: "鼻竇症狀對生活影響輕微" };
  if (s < 40)
    return {
      level: "中度",
      color: "mild",
      advice: "症狀中度影響生活品質，建議就醫評估",
    };
  if (s < 60)
    return {
      level: "顯著",
      color: "moderate",
      advice: "SNOT-22 ≥ 40，生活品質明顯受損，達 Dupilumab 生物標記門檻",
    };
  return {
    level: "嚴重",
    color: "severe",
    advice: "症狀嚴重，強烈建議積極治療介入",
  };
});

function generateMarkdown() {
  const lines = groups
    .map((g) => {
      const itemLines = g.items
        .map((i) => {
          const v = selections.value[i.key];
          const opt = scoreOptions.find((o) => o.value === v);
          return `  - **${i.name}**（${i.sub}）：${v >= 0 ? `${v} — ${opt?.desc}` : "未填"}`;
        })
        .join("\n");
      return `### ${g.label}（${groupScore(g)} 分）\n${itemLines}`;
    })
    .join("\n\n");
  return `# SNOT-22 評估結果\n\n${lines}\n\n---\n## 總分：${totalScore.value} / 110（${severity.value.level}）\n${severity.value.advice}`;
}

async function copyMarkdown() {
  await navigator.clipboard.writeText(generateMarkdown());
  copied.value = true;
  setTimeout(() => (copied.value = false), 2000);
}

function reset() {
  allItems.forEach((i) => {
    selections.value[i.key] = -1;
  });
  showResults.value = false;
}
</script>

<template>
  <div class="snot">
    <div class="snot-header">
      <div class="header-title">
        <h2 class="title">SNOT-22 鼻竇生活品質量表</h2>
        <p class="subtitle">Sino-Nasal Outcome Test · 過去兩週的症狀評估</p>
      </div>
      <div class="score-badge" :class="severity.color">
        <span class="score-number">{{ totalScore }}</span>
        <span class="score-label">{{
          isComplete ? severity.level : `${answeredCount}/22`
        }}</span>
      </div>
    </div>

    <div class="severity-bar-wrap">
      <div class="severity-bar">
        <div
          class="severity-fill"
          :class="severity.color"
          :style="{ width: Math.min((totalScore / 110) * 100, 100) + '%' }"
        />
      </div>
      <div class="severity-ticks">
        <span>0</span><span>20</span><span class="tick-threshold">40</span
        ><span>60</span><span>110</span>
      </div>
    </div>

    <div class="intro-bar">
      <span class="intro-dot">◉</span>
      <span
        >請根據<strong>過去兩週</strong>您的實際感受評分。每題 0（無問題）至
        5（最嚴重）分，共 22 題，總分 0–110 分。</span
      >
    </div>

    <div v-for="group in groups" :key="group.label" class="snot-group">
      <div class="group-header" :class="group.color + '-header'">
        <div class="group-label-block">
          <span class="group-icon">{{ group.icon }}</span>
          <div class="group-text-block">
            <span class="group-label">{{ group.label }}</span>
            <span class="group-sub">{{ group.sub }}</span>
          </div>
        </div>
        <div class="group-score-pill" :class="group.color + '-pill'">
          {{ groupScore(group) }} 分
        </div>
      </div>

      <div class="item-list">
        <div
          v-for="item in group.items"
          :key="item.key"
          class="snot-item"
          :class="{
            high: selections[item.key] >= 4,
            answered: selections[item.key] >= 0,
          }"
          :style="{
            '--group-color':
              group.color === 'nasal'
                ? '#3b82f6'
                : group.color === 'ear'
                  ? '#f59e0b'
                  : group.color === 'sleep'
                    ? '#8b5cf6'
                    : '#14b8a6',
          }"
        >
          <div class="item-header">
            <div class="item-meta-row">
              <span class="item-qnum" :class="group.color + '-qnum'"
                >Q{{ item.key.slice(1) }}</span
              >
            </div>
            <div class="item-name-block">
              <span class="item-name">{{ item.name }}</span>
              <span class="item-sub">{{ item.sub }}</span>
            </div>
            <span
              class="item-score"
              :class="{
                zero: selections[item.key] === 0,
                unanswered: selections[item.key] < 0,
                high: selections[item.key] >= 4,
              }"
            >
              {{ selections[item.key] >= 0 ? selections[item.key] : "—" }}
            </span>
          </div>

          <div class="option-row">
            <label
              v-for="opt in scoreOptions"
              :key="opt.value"
              class="opt-pill"
              :class="{
                active: selections[item.key] === opt.value,
                high: opt.value >= 4 && selections[item.key] === opt.value,
                ['s' + opt.value]: true,
              }"
            >
              <input
                type="radio"
                :name="item.key"
                :value="opt.value"
                v-model="selections[item.key]"
              />
              <span class="opt-num">{{ opt.label }}</span>
              <span class="opt-desc">{{ opt.desc }}</span>
            </label>
          </div>
        </div>
      </div>
    </div>

    <div class="snot-result" :class="severity.color">
      <div class="result-left">
        <span class="result-number">{{ totalScore }}</span>
        <span class="result-max">/ 110</span>
      </div>
      <div class="result-right">
        <span class="result-level">{{ severity.level }}</span>
        <span class="result-advice">{{ severity.advice }}</span>
        <div class="result-breakdown">
          <span
            v-for="g in groups"
            :key="g.label"
            class="breakdown-pill"
            :class="g.color + '-pill-sm'"
          >
            {{ g.icon }} {{ g.label.split("與")[0].split("功能")[0] }}：{{
              groupScore(g)
            }}
          </span>
        </div>
      </div>
    </div>

    <div v-if="showResults" class="results-detail">
      <div class="results-header">評估明細</div>
      <div v-for="group in groups" :key="group.label">
        <div class="detail-section-title" :class="group.color + '-section'">
          {{ group.icon }} {{ group.label }}（{{ groupScore(group) }} 分）
        </div>
        <div v-for="item in group.items" :key="item.key" class="detail-row">
          <span class="detail-qnum">{{ item.key.toUpperCase() }}</span>
          <span class="detail-domain">{{ item.name }}</span>
          <span
            class="detail-score"
            :class="{
              zero: selections[item.key] === 0,
              high: selections[item.key] >= 4,
            }"
          >
            {{ selections[item.key] >= 0 ? selections[item.key] : "—" }}
          </span>
          <span class="detail-desc">
            {{
              selections[item.key] >= 0
                ? scoreOptions.find((o) => o.value === selections[item.key])
                    ?.desc
                : "未填"
            }}
          </span>
        </div>
      </div>
    </div>

    <div class="snot-actions">
      <button class="btn-view" @click="showResults = !showResults">
        {{ showResults ? "收起明細" : "查看評估結果" }}
      </button>
      <button class="btn-copy" @click="copyMarkdown">
        {{ copied ? "已複製 ✓" : "複製 Markdown 結果" }}
      </button>
      <button class="btn-reset" @click="reset">重置</button>
    </div>
    <p v-if="!isComplete" class="progress-hint">
      已完成 {{ answeredCount }}/22 題，尚餘 {{ 22 - answeredCount }} 題
    </p>
  </div>
</template>

<style scoped>
/* ── Container ── */
.snot {
  max-width: 780px;
  margin: 0 auto;
  padding: 2rem 0 3rem;
  font-size: 0.9rem;
}

/* ── Header ── */
.snot-header {
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

/* ── Score Badge ── */
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
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  transition: all 0.3s;
}
.score-number {
  font-size: 2rem;
  font-weight: 800;
  line-height: 1;
}
.score-label {
  font-size: 0.72rem;
  font-weight: 600;
  margin-top: 2px;
}
.score-badge.filling {
  color: var(--vp-c-text-3);
}
.score-badge.normal {
  border-color: #22c55e;
  color: #22c55e;
}
.score-badge.mild {
  border-color: #f59e0b;
  color: #f59e0b;
}
.score-badge.moderate {
  border-color: #f97316;
  color: #f97316;
}
.score-badge.severe {
  border-color: #ef4444;
  color: #ef4444;
}

/* ── Severity Bar ── */
.severity-bar-wrap {
  margin-bottom: 1.5rem;
}
.severity-bar {
  height: 8px;
  border-radius: 999px;
  background: var(--vp-c-bg-mute);
  overflow: hidden;
  margin-bottom: 4px;
  box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.08);
}
.severity-fill {
  height: 100%;
  border-radius: 999px;
  transition:
    width 0.4s ease,
    background 0.3s;
}
.severity-fill.filling {
  background: var(--vp-c-divider);
}
.severity-fill.normal {
  background: linear-gradient(90deg, #22c55e, #84cc16);
}
.severity-fill.mild {
  background: linear-gradient(90deg, #eab308, #f59e0b);
}
.severity-fill.moderate {
  background: linear-gradient(90deg, #f59e0b, #f97316);
}
.severity-fill.severe {
  background: linear-gradient(90deg, #f97316, #ef4444);
}
.severity-ticks {
  display: flex;
  justify-content: space-between;
  font-size: 0.68rem;
  color: var(--vp-c-text-3);
  padding: 0 2px;
}
.tick-threshold {
  color: #f97316;
  font-weight: 700;
}

/* ── Intro Bar ── */
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

/* ── Group ── */
.snot-group {
  margin-bottom: 1.75rem;
}

.group-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  margin-bottom: 0.5rem;
  padding: 0.55rem 0.85rem;
  border-radius: 8px;
  border: 1px solid var(--vp-c-divider);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
}
.group-header.nasal-header {
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.08), transparent);
  border-left: 4px solid #3b82f6;
}
.group-header.ear-header {
  background: linear-gradient(135deg, rgba(245, 158, 11, 0.08), transparent);
  border-left: 4px solid #f59e0b;
}
.group-header.sleep-header {
  background: linear-gradient(135deg, rgba(139, 92, 246, 0.08), transparent);
  border-left: 4px solid #8b5cf6;
}
.group-header.psych-header {
  background: linear-gradient(135deg, rgba(20, 184, 166, 0.08), transparent);
  border-left: 4px solid #14b8a6;
}

.group-label-block {
  display: flex;
  align-items: center;
  gap: 0.6rem;
}
.group-icon {
  font-size: 1.1rem;
  flex-shrink: 0;
}
.group-text-block {
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.group-label {
  font-size: 0.88rem;
  font-weight: 800;
  color: var(--vp-c-text-1);
}
.group-sub {
  font-size: 0.7rem;
  color: var(--vp-c-text-3);
}

/* ── Group Score Pill ── */
.group-score-pill {
  font-size: 0.78rem;
  font-weight: 700;
  padding: 3px 10px;
  border-radius: 999px;
  border: 1px solid var(--vp-c-divider);
  white-space: nowrap;
  flex-shrink: 0;
}
.group-score-pill.nasal-pill {
  color: #3b82f6;
  border-color: rgba(59, 130, 246, 0.35);
}
.group-score-pill.ear-pill {
  color: #f59e0b;
  border-color: rgba(245, 158, 11, 0.35);
}
.group-score-pill.sleep-pill {
  color: #8b5cf6;
  border-color: rgba(139, 92, 246, 0.35);
}
.group-score-pill.psych-pill {
  color: #14b8a6;
  border-color: rgba(20, 184, 166, 0.35);
}

/* ── Item ── */
.item-list {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}
.snot-item {
  border: 1px solid var(--vp-c-divider);
  border-radius: 10px;
  background: var(--vp-c-bg-soft);
  overflow: hidden;
  transition:
    border-color 0.2s,
    background 0.2s;
}
.snot-item.answered {
  background: linear-gradient(135deg, rgba(34, 197, 94, 0.04), transparent);
  border-color: var(--group-color, var(--vp-c-divider));
}
.snot-item.high {
  background: linear-gradient(
    135deg,
    rgba(249, 115, 22, 0.06),
    rgba(249, 115, 22, 0.02)
  );
  border-color: #f97316 !important;
}

.item-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  padding: 0.6rem 0.9rem;
  background: var(--vp-c-bg-mute);
  border-bottom: 1px solid var(--vp-c-divider);
  gap: 0.75rem;
}
.item-meta-row {
  display: flex;
  align-items: center;
  flex-shrink: 0;
  padding-top: 3px;
}
.item-qnum {
  font-size: 0.72rem;
  font-weight: 800;
  padding: 1px 7px;
  border-radius: 999px;
  letter-spacing: 0.04em;
  flex-shrink: 0;
}
.item-qnum.nasal-qnum {
  color: #3b82f6;
  background: rgba(59, 130, 246, 0.12);
}
.item-qnum.ear-qnum {
  color: #f59e0b;
  background: rgba(245, 158, 11, 0.12);
}
.item-qnum.sleep-qnum {
  color: #8b5cf6;
  background: rgba(139, 92, 246, 0.12);
}
.item-qnum.psych-qnum {
  color: #14b8a6;
  background: rgba(20, 184, 166, 0.12);
}
.item-name-block {
  display: flex;
  flex-direction: column;
  gap: 2px;
  flex: 1;
}
.item-name {
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--vp-c-text-1);
}
.item-sub {
  font-size: 0.7rem;
  color: var(--vp-c-text-3);
}
.item-score {
  font-size: 0.95rem;
  font-weight: 800;
  flex-shrink: 0;
  min-width: 32px;
  height: 32px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  border: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg);
  transition: all 0.25s;
}
.item-score.zero {
  color: #22c55e;
  border-color: rgba(34, 197, 94, 0.3);
  background: rgba(34, 197, 94, 0.06);
}
.item-score.unanswered {
  color: var(--vp-c-text-3);
  background: transparent;
  border-color: var(--vp-c-divider);
}
.item-score.high {
  color: #f97316;
  border-color: rgba(249, 115, 22, 0.3);
  background: rgba(249, 115, 22, 0.06);
}

/* ── Option Row / Pills ── */
.option-row {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 2px;
  padding: 3px;
  background: var(--vp-c-bg-mute);
}
.opt-pill {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 0.5rem 0.15rem;
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

/* s0 */
.opt-pill.s0 {
  border-color: rgba(34, 197, 94, 0.15);
}
.opt-pill.s0:not(.active):hover,
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
.opt-pill.s0 .opt-desc {
  color: rgba(34, 197, 94, 0.4);
}
.opt-pill.s0.active .opt-desc {
  color: rgba(34, 197, 94, 0.7);
}

/* s1 */
.opt-pill.s1 {
  border-color: rgba(132, 204, 22, 0.15);
}
.opt-pill.s1:not(.active):hover,
.opt-pill.s1:focus-within {
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
.opt-pill.s1 .opt-num {
  color: rgba(132, 204, 22, 0.5);
}
.opt-pill.s1.active .opt-num {
  color: #84cc16;
}
.opt-pill.s1 .opt-desc {
  color: rgba(132, 204, 22, 0.4);
}
.opt-pill.s1.active .opt-desc {
  color: rgba(132, 204, 22, 0.7);
}

/* s2 */
.opt-pill.s2 {
  border-color: rgba(234, 179, 8, 0.15);
}
.opt-pill.s2:not(.active):hover,
.opt-pill.s2:focus-within {
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
.opt-pill.s2 .opt-num {
  color: rgba(234, 179, 8, 0.5);
}
.opt-pill.s2.active .opt-num {
  color: #eab308;
}
.opt-pill.s2 .opt-desc {
  color: rgba(234, 179, 8, 0.4);
}
.opt-pill.s2.active .opt-desc {
  color: rgba(234, 179, 8, 0.7);
}

/* s3 */
.opt-pill.s3 {
  border-color: rgba(245, 158, 11, 0.15);
}
.opt-pill.s3:not(.active):hover,
.opt-pill.s3:focus-within {
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
.opt-pill.s3 .opt-num {
  color: rgba(245, 158, 11, 0.5);
}
.opt-pill.s3.active .opt-num {
  color: #f59e0b;
}
.opt-pill.s3 .opt-desc {
  color: rgba(245, 158, 11, 0.4);
}
.opt-pill.s3.active .opt-desc {
  color: rgba(245, 158, 11, 0.7);
}

/* s4 */
.opt-pill.s4 {
  border-color: rgba(249, 115, 22, 0.15);
}
.opt-pill.s4:not(.active):hover,
.opt-pill.s4:focus-within {
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
.opt-pill.s4 .opt-num {
  color: rgba(249, 115, 22, 0.5);
}
.opt-pill.s4.active .opt-num {
  color: #f97316;
}
.opt-pill.s4 .opt-desc {
  color: rgba(249, 115, 22, 0.4);
}
.opt-pill.s4.active .opt-desc {
  color: rgba(249, 115, 22, 0.7);
}

/* s5 */
.opt-pill.s5 {
  border-color: rgba(239, 68, 68, 0.15);
}
.opt-pill.s5:not(.active):hover,
.opt-pill.s5:focus-within {
  border-color: rgba(239, 68, 68, 0.35);
  background: rgba(239, 68, 68, 0.04);
}
.opt-pill.s5.active {
  border-color: #ef4444;
  background: linear-gradient(
    180deg,
    rgba(239, 68, 68, 0.12),
    rgba(239, 68, 68, 0.06)
  );
  box-shadow: 0 0 0 1px rgba(239, 68, 68, 0.08);
}
.opt-pill.s5 .opt-num {
  color: rgba(239, 68, 68, 0.5);
}
.opt-pill.s5.active .opt-num {
  color: #ef4444;
}
.opt-pill.s5 .opt-desc {
  color: rgba(239, 68, 68, 0.4);
}
.opt-pill.s5.active .opt-desc {
  color: rgba(239, 68, 68, 0.7);
}

.opt-num {
  font-size: 1rem;
  font-weight: 900;
  transition: color 0.2s;
}
.opt-desc {
  font-size: 0.7rem;
  font-weight: 700;
  line-height: 1.3;
  transition: color 0.2s;
}

/* ── Result Card ── */
.snot-result {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  padding: 1.25rem 1.5rem;
  border-radius: 14px;
  border: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg-soft);
  margin-bottom: 1rem;
  flex-wrap: wrap;
  transition:
    border-color 0.3s,
    background 0.3s;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}
.snot-result.normal {
  border-color: #22c55e;
  background: linear-gradient(135deg, rgba(34, 197, 94, 0.06), transparent);
}
.snot-result.mild {
  border-color: #f59e0b;
  background: linear-gradient(135deg, rgba(245, 158, 11, 0.06), transparent);
}
.snot-result.moderate {
  border-color: #f97316;
  background: linear-gradient(135deg, rgba(249, 115, 22, 0.06), transparent);
}
.snot-result.severe {
  border-color: #ef4444;
  background: linear-gradient(135deg, rgba(239, 68, 68, 0.06), transparent);
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
.snot-result.normal .result-number {
  color: #22c55e;
}
.snot-result.mild .result-number {
  color: #f59e0b;
}
.snot-result.moderate .result-number {
  color: #f97316;
}
.snot-result.severe .result-number {
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
  font-size: 0.82rem;
  color: var(--vp-c-text-2);
  line-height: 1.5;
}
.result-breakdown {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
  margin-top: 2px;
}
.breakdown-pill {
  font-size: 0.7rem;
  font-weight: 600;
  padding: 2px 9px;
  border-radius: 999px;
  border: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg-mute);
}
.breakdown-pill.nasal-pill-sm {
  color: #3b82f6;
  border-color: rgba(59, 130, 246, 0.35);
  background: rgba(59, 130, 246, 0.06);
}
.breakdown-pill.ear-pill-sm {
  color: #f59e0b;
  border-color: rgba(245, 158, 11, 0.35);
  background: rgba(245, 158, 11, 0.06);
}
.breakdown-pill.sleep-pill-sm {
  color: #8b5cf6;
  border-color: rgba(139, 92, 246, 0.35);
  background: rgba(139, 92, 246, 0.06);
}
.breakdown-pill.psych-pill-sm {
  color: #14b8a6;
  border-color: rgba(20, 184, 166, 0.35);
  background: rgba(20, 184, 166, 0.06);
}

/* ── Results Detail ── */
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
.detail-section-title {
  padding: 0.4rem 0.9rem;
  font-size: 0.75rem;
  font-weight: 700;
  border-bottom: 1px solid var(--vp-c-divider);
}
.detail-section-title.nasal-section {
  color: #3b82f6;
  background: rgba(59, 130, 246, 0.06);
}
.detail-section-title.ear-section {
  color: #f59e0b;
  background: rgba(245, 158, 11, 0.06);
}
.detail-section-title.sleep-section {
  color: #8b5cf6;
  background: rgba(139, 92, 246, 0.06);
}
.detail-section-title.psych-section {
  color: #14b8a6;
  background: rgba(20, 184, 166, 0.06);
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
  color: var(--vp-c-brand-1);
  flex-shrink: 0;
  width: 28px;
  text-align: center;
}
.detail-score.zero {
  color: #22c55e;
}
.detail-score.high {
  color: #f97316;
}
.detail-desc {
  font-size: 0.75rem;
  color: var(--vp-c-text-2);
  flex-shrink: 0;
  width: 52px;
  text-align: left;
}

/* ── Actions ── */
.snot-actions {
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

/* ── Responsive ── */
@media (max-width: 640px) {
  .snot-header {
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
  .snot-result {
    flex-direction: column;
    gap: 0.75rem;
  }
  .option-row {
    grid-template-columns: repeat(3, 1fr);
  }
  .opt-pill:nth-child(3) {
    border-right: none;
  }
  .opt-pill:nth-child(4),
  .opt-pill:nth-child(5),
  .opt-pill:nth-child(6) {
    border-top: 1px solid var(--vp-c-divider);
  }
  .detail-desc {
    width: 40px;
  }
}
</style>
