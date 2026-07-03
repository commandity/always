<script setup lang="ts">
import { ref, computed } from "vue";

const groups = [
  {
    label: "定向力",
    sub: "Orientation",
    color: "orient",
    icon: "🗓",
    items: [
      { key: "year", name: "今年是哪一年？", sub: "Year", max: 1 },
      { key: "season", name: "現在是什麼季節？", sub: "Season", max: 1 },
      { key: "month", name: "現在是幾月份？", sub: "Month", max: 1 },
      { key: "date", name: "今天是幾號？", sub: "Date", max: 1 },
      { key: "day", name: "今天是星期幾？", sub: "Day of week", max: 1 },
      { key: "country", name: "這是哪個國家／地區？", sub: "Country", max: 1 },
      { key: "city", name: "這是哪個縣市？", sub: "City", max: 1 },
      { key: "district", name: "這是哪個鄉鎮區？", sub: "District", max: 1 },
      {
        key: "place",
        name: "這是什麼地方（醫院／診所）？",
        sub: "Place",
        max: 1,
      },
      { key: "floor", name: "這是幾樓？", sub: "Floor", max: 1 },
    ],
  },
  {
    label: "即時記憶",
    sub: "Registration",
    color: "reg",
    icon: "💬",
    items: [
      { key: "reg1", name: "複述三個詞（第一個）", sub: "Word 1", max: 1 },
      { key: "reg2", name: "複述三個詞（第二個）", sub: "Word 2", max: 1 },
      { key: "reg3", name: "複述三個詞（第三個）", sub: "Word 3", max: 1 },
    ],
  },
  {
    label: "注意力與計算力",
    sub: "Attention & Calculation",
    color: "calc",
    icon: "🔢",
    items: [
      { key: "calc1", name: "100 − 7 = 93", sub: "1st subtraction", max: 1 },
      { key: "calc2", name: "93 − 7 = 86", sub: "2nd subtraction", max: 1 },
      { key: "calc3", name: "86 − 7 = 79", sub: "3rd subtraction", max: 1 },
      { key: "calc4", name: "79 − 7 = 72", sub: "4th subtraction", max: 1 },
      { key: "calc5", name: "72 − 7 = 65", sub: "5th subtraction", max: 1 },
    ],
  },
  {
    label: "延遲記憶",
    sub: "Recall",
    color: "recall",
    icon: "🔁",
    items: [
      { key: "rec1", name: "回憶第一個詞", sub: "Recall word 1", max: 1 },
      { key: "rec2", name: "回憶第二個詞", sub: "Recall word 2", max: 1 },
      { key: "rec3", name: "回憶第三個詞", sub: "Recall word 3", max: 1 },
    ],
  },
  {
    label: "語言能力",
    sub: "Language",
    color: "lang",
    icon: "📝",
    items: [
      { key: "name1", name: "命名：手錶", sub: "Naming — watch", max: 1 },
      { key: "name2", name: "命名：鉛筆", sub: "Naming — pencil", max: 1 },
      {
        key: "repeat",
        name: "複述：「非也，和，但是」",
        sub: "Repetition",
        max: 1,
      },
      {
        key: "cmd1",
        name: "三步驟指令 — 拿起紙",
        sub: "Command step 1",
        max: 1,
      },
      { key: "cmd2", name: "三步驟指令 — 對折", sub: "Command step 2", max: 1 },
      {
        key: "cmd3",
        name: "三步驟指令 — 放到地上",
        sub: "Command step 3",
        max: 1,
      },
      {
        key: "read",
        name: "閱讀並執行：「請閉上眼睛」",
        sub: "Reading",
        max: 1,
      },
      { key: "write", name: "自發書寫一個完整句子", sub: "Writing", max: 1 },
      { key: "copy", name: "臨摹兩個相交的五邊形", sub: "Copying", max: 1 },
    ],
  },
];

const allItems = groups.flatMap((g) => g.items);

const qIndex = (() => {
  const map: Record<string, number> = {};
  let n = 1;
  for (const g of groups)
    for (const item of g.items) {
      map[item.key] = n++;
    }
  return map;
})();

const selections = ref<Record<string, number>>(
  Object.fromEntries(allItems.map((item) => [item.key, -1])),
);
const showResults = ref(false);
const copied = ref(false);

const groupScore = (g: (typeof groups)[0]) =>
  g.items.reduce(
    (sum, item) => sum + Math.max(selections.value[item.key], 0),
    0,
  );

const totalScore = computed(() =>
  allItems.reduce(
    (sum, item) => sum + Math.max(selections.value[item.key], 0),
    0,
  ),
);

const answeredCount = computed(
  () => allItems.filter((item) => selections.value[item.key] >= 0).length,
);

const isComplete = computed(() => answeredCount.value === allItems.length);

const severity = computed(() => {
  const s = totalScore.value;
  if (s >= 27) return { level: "正常", color: "normal" };
  if (s >= 21) return { level: "輕度障礙", color: "mild" };
  if (s >= 10) return { level: "中度障礙", color: "moderate" };
  return { level: "重度障礙", color: "severe" };
});

function generateMarkdown() {
  const lines = groups
    .map((g) => {
      const itemLines = g.items
        .map((item) => {
          const v = selections.value[item.key];
          return `  - **${item.name}**：${v >= 0 ? v : "未填"} / ${item.max}`;
        })
        .join("\n");
      return `### ${g.label}（${groupScore(g)} 分）\n${itemLines}`;
    })
    .join("\n\n");
  return `# MMSE 評估結果\n\n${lines}\n\n---\n## 總分：${totalScore.value} / 30（${severity.value.level}）`;
}

async function copyMarkdown() {
  await navigator.clipboard.writeText(generateMarkdown());
  copied.value = true;
  setTimeout(() => (copied.value = false), 2000);
}

function reset() {
  allItems.forEach((item) => {
    selections.value[item.key] = -1;
  });
  showResults.value = false;
}
</script>

<template>
  <div class="mmse">
    <!-- ── Header ─────────────────────────────────────────────── -->
    <div class="mmse-header">
      <div class="header-title">
        <h2 class="title">MMSE 簡易心智狀態評估</h2>
        <p class="subtitle">Mini-Mental State Examination · 認知功能篩檢</p>
      </div>
      <div class="score-badge" :class="severity.color">
        <span class="score-number">{{ totalScore }}</span>
        <span class="score-label">{{ severity.level }}</span>
      </div>
    </div>

    <!-- ── Severity bar ───────────────────────────────────────── -->
    <div class="severity-bar-wrap">
      <div class="severity-bar">
        <div
          class="severity-fill"
          :class="severity.color"
          :style="{ width: (totalScore / 30) * 100 + '%' }"
        />
      </div>
      <div class="severity-ticks-abs">
        <span class="tick-abs t-severe" style="left: 0%">0</span>
        <span class="tick-abs t-moderate" style="left: 33.3%">10</span>
        <span class="tick-abs t-mild" style="left: 70%">21</span>
        <!-- <span class="tick-abs t-normal" style="left: 90%">27</span> -->
        <span class="tick-abs t-normal" style="left: 100%">30</span>
      </div>
      <div class="severity-labels-abs">
        <span class="label-abs lbl-severe" style="left: 0%">重度</span>
        <span class="label-abs lbl-moderate" style="left: 33.3%">中度</span>
        <span class="label-abs lbl-mild" style="left: 70%">輕度</span>
        <span class="label-abs lbl-normal" style="left: 100%">正常</span>
      </div>
    </div>

    <!-- ── Intro ──────────────────────────────────────────────── -->
    <div class="intro-bar">
      <span class="intro-dot">◉</span>
      <span>
        每題回答「正確（1 分）」或「錯誤（0 分）」。總分 30 分，
        <strong>≥ 27 分</strong>為正常。
      </span>
    </div>

    <!-- ── Groups ─────────────────────────────────────────────── -->
    <div v-for="group in groups" :key="group.label" class="mmse-group">
      <div class="group-header" :class="group.color + '-header'">
        <div class="group-label-block">
          <span class="group-icon">{{ group.icon }}</span>
          <div class="group-text-block">
            <span class="group-label">{{ group.label }}</span>
            <span class="group-sub">{{ group.sub }}</span>
          </div>
        </div>
        <span class="group-score-pill" :class="group.color + '-pill'">
          {{ groupScore(group) }} /
          {{ group.items.reduce((s, i) => s + i.max, 0) }}
        </span>
      </div>

      <div class="item-list">
        <div
          v-for="item in group.items"
          :key="item.key"
          class="mmse-item"
          :class="{
            answered: selections[item.key] >= 0,
          }"
        >
          <div class="item-header">
            <div class="item-meta-row">
              <span class="item-qnum" :class="group.color + '-qnum'"
                >Q{{ qIndex[item.key] }}</span
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
                high: selections[item.key] === 1,
                unanswered: selections[item.key] < 0,
              }"
            >
              {{ selections[item.key] >= 0 ? selections[item.key] : "—" }}
            </span>
          </div>

          <div class="option-row">
            <label
              class="opt-pill s1"
              :class="{ active: selections[item.key] === 1 }"
            >
              <input
                type="radio"
                :name="item.key"
                :value="1"
                v-model="selections[item.key]"
              />
              <span class="opt-num">1</span>
              <span class="opt-desc">正確</span>
            </label>
            <label
              class="opt-pill s0"
              :class="{ active: selections[item.key] === 0 }"
            >
              <input
                type="radio"
                :name="item.key"
                :value="0"
                v-model="selections[item.key]"
              />
              <span class="opt-num">0</span>
              <span class="opt-desc">錯誤</span>
            </label>
          </div>
        </div>
      </div>
    </div>

    <!-- ── Result card ────────────────────────────────────────── -->
    <div class="mmse-result" :class="severity.color">
      <div class="result-left">
        <span class="result-number">{{ totalScore }}</span>
        <span class="result-max">/ 30</span>
      </div>
      <div class="result-right">
        <span class="result-level">{{ severity.level }}</span>
        <span class="result-advice">
          <template v-if="totalScore >= 27">認知功能正常範圍</template>
          <template v-else-if="totalScore >= 21"
            >輕度認知障礙，建議進一步評估</template
          >
          <template v-else-if="totalScore >= 10"
            >中度認知障礙，建議積極就醫</template
          >
          <template v-else>重度認知障礙，需全面性照護</template>
        </span>
        <span class="result-progress">已完成 {{ answeredCount }} / 30 題</span>
      </div>
    </div>

    <!-- ── Results detail ─────────────────────────────────────── -->
    <div v-if="showResults" class="results-detail">
      <div class="results-header">評估明細</div>
      <div v-for="group in groups" :key="group.label">
        <div class="detail-section-title" :class="group.color + '-section'">
          {{ group.icon }} {{ group.label }}（{{ groupScore(group) }} /
          {{ group.items.reduce((s, i) => s + i.max, 0) }} 分）
        </div>
        <div v-for="item in group.items" :key="item.key" class="detail-row">
          <span class="detail-qnum" :class="group.color + '-qnum-sm'"
            >Q{{ qIndex[item.key] }}</span
          >
          <span class="detail-domain">{{ item.name }}</span>
          <span
            class="detail-score"
            :class="{ zero: selections[item.key] === 0 }"
          >
            {{ selections[item.key] >= 0 ? selections[item.key] : "—" }}
          </span>
          <span class="detail-desc">
            {{
              selections[item.key] === 1
                ? "正確"
                : selections[item.key] === 0
                  ? "錯誤"
                  : "未填"
            }}
          </span>
        </div>
      </div>
    </div>

    <!-- ── Actions ────────────────────────────────────────────── -->
    <div class="mmse-actions">
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
.mmse {
  max-width: 780px;
  margin: 0 auto;
  padding: 2rem 0 3rem;
  font-size: 0.9rem;
}

/* ── Header ────────────────────────────────────────────────────── */
.mmse-header {
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
.severity-fill.normal {
  background: linear-gradient(90deg, #22c55e, #4ade80);
}
.severity-fill.mild {
  background: linear-gradient(90deg, #f59e0b, #fbbf24);
}
.severity-fill.moderate {
  background: linear-gradient(90deg, #f97316, #fb923c);
}
.severity-fill.severe {
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
.lbl-normal {
  color: #22c55e;
}
.lbl-mild {
  color: #f59e0b;
}
.lbl-moderate {
  color: #f97316;
}
.lbl-severe {
  color: #ef4444;
}
.t-normal {
  color: #22c55e;
}
.t-mild {
  color: #f59e0b;
}
.t-moderate {
  color: #f97316;
}
.t-severe {
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
.mmse-group {
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
.group-header.orient-header {
  border-left-color: #3b82f6;
  background: linear-gradient(
    135deg,
    rgba(59, 130, 246, 0.08),
    var(--vp-c-bg-mute),
    var(--vp-c-bg-soft)
  );
  box-shadow: 0 1px 3px rgba(59, 130, 246, 0.06);
}
.group-header.reg-header {
  border-left-color: #8b5cf6;
  background: linear-gradient(
    135deg,
    rgba(139, 92, 246, 0.08),
    var(--vp-c-bg-mute),
    var(--vp-c-bg-soft)
  );
  box-shadow: 0 1px 3px rgba(139, 92, 246, 0.06);
}
.group-header.calc-header {
  border-left-color: #f59e0b;
  background: linear-gradient(
    135deg,
    rgba(245, 158, 11, 0.08),
    var(--vp-c-bg-mute),
    var(--vp-c-bg-soft)
  );
  box-shadow: 0 1px 3px rgba(245, 158, 11, 0.06);
}
.group-header.recall-header {
  border-left-color: #14b8a6;
  background: linear-gradient(
    135deg,
    rgba(20, 184, 166, 0.08),
    var(--vp-c-bg-mute),
    var(--vp-c-bg-soft)
  );
  box-shadow: 0 1px 3px rgba(20, 184, 166, 0.06);
}
.group-header.lang-header {
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
.group-score-pill.orient-pill {
  border-color: rgba(59, 130, 246, 0.25);
  color: #3b82f6;
  background: rgba(59, 130, 246, 0.06);
}
.group-score-pill.reg-pill {
  border-color: rgba(139, 92, 246, 0.25);
  color: #8b5cf6;
  background: rgba(139, 92, 246, 0.06);
}
.group-score-pill.calc-pill {
  border-color: rgba(245, 158, 11, 0.25);
  color: #f59e0b;
  background: rgba(245, 158, 11, 0.06);
}
.group-score-pill.recall-pill {
  border-color: rgba(20, 184, 166, 0.25);
  color: #14b8a6;
  background: rgba(20, 184, 166, 0.06);
}
.group-score-pill.lang-pill {
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

.mmse-item {
  border: 1px solid var(--vp-c-divider);
  border-radius: 10px;
  background: var(--vp-c-bg-soft);
  overflow: hidden;
  transition:
    border-color 0.25s,
    box-shadow 0.25s;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.03);
}
.mmse-item:hover {
  box-shadow: 0 3px 12px rgba(0, 0, 0, 0.06);
  border-color: var(--vp-c-divider);
}
.mmse-item.answered {
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
.item-qnum {
  font-size: 0.72rem;
  font-weight: 800;
  color: #fff;
  background: linear-gradient(135deg, var(--vp-c-brand-1), #4f46e5);
  padding: 1px 9px;
  border-radius: 999px;
  letter-spacing: 0.04em;
  box-shadow: 0 1px 3px rgba(99, 102, 241, 0.2);
}
.item-qnum.orient-qnum {
  background: linear-gradient(135deg, #3b82f6, #2563eb);
  box-shadow: 0 1px 3px rgba(59, 130, 246, 0.2);
}
.item-qnum.reg-qnum {
  background: linear-gradient(135deg, #8b5cf6, #7c3aed);
  box-shadow: 0 1px 3px rgba(139, 92, 246, 0.2);
}
.item-qnum.calc-qnum {
  background: linear-gradient(135deg, #f59e0b, #d97706);
  box-shadow: 0 1px 3px rgba(245, 158, 11, 0.2);
}
.item-qnum.recall-qnum {
  background: linear-gradient(135deg, #14b8a6, #0d9488);
  box-shadow: 0 1px 3px rgba(20, 184, 166, 0.2);
}
.item-qnum.lang-qnum {
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
  color: #ef4444;
  border-color: rgba(239, 68, 68, 0.25);
  background: rgba(239, 68, 68, 0.06);
}
.item-score.high {
  color: #22c55e;
  border-color: rgba(34, 197, 94, 0.25);
  background: rgba(34, 197, 94, 0.06);
}
.item-score.unanswered {
  color: var(--vp-c-text-3);
  border-color: var(--vp-c-divider);
  background: transparent;
}

/* ── Option pills (ENS6Q style) ────────────────────────────────── */
.option-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 3px;
  padding: 4px;
  background: var(--vp-c-bg-mute);
}

.opt-pill {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
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
  font-size: 1rem;
  font-weight: 900;
  transition: color 0.2s;
  color: var(--vp-c-text-3);
}
.opt-desc {
  font-size: 0.7rem;
  font-weight: 700;
  line-height: 1.35;
  transition: color 0.2s;
  color: var(--vp-c-text-3);
}

/* s1 = correct (green) */
.opt-pill.s1 {
  border-color: rgba(34, 197, 94, 0.15);
}
.opt-pill.s1:hover:not(.active),
.opt-pill.s1:focus-within {
  border-color: rgba(34, 197, 94, 0.35);
  background: rgba(34, 197, 94, 0.04);
}
.opt-pill.s1.active {
  border-color: #22c55e;
  background: linear-gradient(
    180deg,
    rgba(34, 197, 94, 0.12),
    rgba(34, 197, 94, 0.06)
  );
  box-shadow: 0 0 0 1px rgba(34, 197, 94, 0.08);
}
.opt-pill.s1 .opt-num {
  color: rgba(34, 197, 94, 0.5);
}
.opt-pill.s1.active .opt-num {
  color: #22c55e;
}
.opt-pill.s1 .opt-desc {
  color: rgba(34, 197, 94, 0.4);
}
.opt-pill.s1.active .opt-desc {
  color: rgba(34, 197, 94, 0.7);
}

/* s0 = wrong (red) */
.opt-pill.s0 {
  border-color: rgba(239, 68, 68, 0.15);
}
.opt-pill.s0:hover:not(.active),
.opt-pill.s0:focus-within {
  border-color: rgba(239, 68, 68, 0.35);
  background: rgba(239, 68, 68, 0.04);
}
.opt-pill.s0.active {
  border-color: #ef4444;
  background: linear-gradient(
    180deg,
    rgba(239, 68, 68, 0.12),
    rgba(239, 68, 68, 0.06)
  );
  box-shadow: 0 0 0 1px rgba(239, 68, 68, 0.08);
}
.opt-pill.s0 .opt-num {
  color: rgba(239, 68, 68, 0.5);
}
.opt-pill.s0.active .opt-num {
  color: #ef4444;
}
.opt-pill.s0 .opt-desc {
  color: rgba(239, 68, 68, 0.4);
}
.opt-pill.s0.active .opt-desc {
  color: rgba(239, 68, 68, 0.7);
}

/* ── Result card ───────────────────────────────────────────────── */
.mmse-result {
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
.mmse-result.normal {
  border-color: #22c55e;
  box-shadow:
    0 0 0 1px rgba(34, 197, 94, 0.06),
    0 1px 3px rgba(0, 0, 0, 0.04);
}
.mmse-result.mild {
  border-color: #f59e0b;
  box-shadow:
    0 0 0 1px rgba(245, 158, 11, 0.06),
    0 1px 3px rgba(0, 0, 0, 0.04);
}
.mmse-result.moderate {
  border-color: #f97316;
  box-shadow:
    0 0 0 1px rgba(249, 115, 22, 0.06),
    0 1px 3px rgba(0, 0, 0, 0.04);
}
.mmse-result.severe {
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
.mmse-result.normal .result-number {
  color: #22c55e;
}
.mmse-result.mild .result-number {
  color: #f59e0b;
}
.mmse-result.moderate .result-number {
  color: #f97316;
}
.mmse-result.severe .result-number {
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
.result-progress {
  font-size: 0.72rem;
  color: var(--vp-c-text-3);
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

.detail-section-title {
  padding: 0.4rem 0.9rem;
  font-size: 0.75rem;
  font-weight: 700;
  border-bottom: 1px solid var(--vp-c-divider);
}
.detail-section-title.orient-section {
  color: #3b82f6;
  background: rgba(59, 130, 246, 0.06);
}
.detail-section-title.reg-section {
  color: #8b5cf6;
  background: rgba(139, 92, 246, 0.06);
}
.detail-section-title.calc-section {
  color: #f59e0b;
  background: rgba(245, 158, 11, 0.06);
}
.detail-section-title.recall-section {
  color: #14b8a6;
  background: rgba(20, 184, 166, 0.06);
}
.detail-section-title.lang-section {
  color: #f97316;
  background: rgba(249, 115, 22, 0.06);
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
  flex-shrink: 0;
  width: 32px;
}
.detail-qnum.orient-qnum-sm {
  color: #3b82f6;
}
.detail-qnum.reg-qnum-sm {
  color: #8b5cf6;
}
.detail-qnum.calc-qnum-sm {
  color: #f59e0b;
}
.detail-qnum.recall-qnum-sm {
  color: #14b8a6;
}
.detail-qnum.lang-qnum-sm {
  color: #f97316;
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
  color: #22c55e;
  flex-shrink: 0;
  width: 20px;
  text-align: center;
}
.detail-score.zero {
  color: #ef4444;
}
.detail-desc {
  font-size: 0.75rem;
  color: var(--vp-c-text-2);
  flex-shrink: 0;
  width: 52px;
}

/* ── Actions ───────────────────────────────────────────────────── */
.mmse-actions {
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
  .mmse-header {
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
  .mmse-result {
    flex-direction: column;
    gap: 0.75rem;
  }
}
</style>
