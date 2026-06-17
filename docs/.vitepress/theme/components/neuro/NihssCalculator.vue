<script setup lang="ts">
import { ref, computed } from "vue";

const nihssItems = [
  {
    id: 0,
    name: "意識水平",
    sub: "Level of Consciousness",
    scores: [
      { value: 0, description: "清醒：反應敏銳" },
      { value: 1, description: "嗜睡：經輕微刺激喚醒，回答問題，反應皆正常" },
      { value: 2, description: "渾沌（半昏迷）：對重覆或強烈疼痛刺激才有反應" },
      { value: 3, description: "昏迷：僅有反射性反應" },
    ],
  },
  {
    id: 1,
    name: "意識問答",
    sub: "LOC Questions",
    scores: [
      { value: 0, description: "答對兩個" },
      { value: 1, description: "答對一個（或 on endo, dysarthria）" },
      { value: 2, description: "兩個都答錯（或 aphasia, stupor）" },
    ],
  },
  {
    id: 2,
    name: "意識指令",
    sub: "LOC Commands",
    scores: [
      { value: 0, description: "兩個都做對" },
      { value: 1, description: "只做對一個" },
      { value: 2, description: "兩個都做錯" },
    ],
  },
  {
    id: 3,
    name: "凝視",
    sub: "Best Gaze",
    scores: [
      { value: 0, description: "正常" },
      { value: 1, description: "部分麻痺（或 CN3,4,6 麻痺）" },
      { value: 2, description: "完全偏向一邊：頭眼運動反射時仍完全偏向一側" },
    ],
  },
  {
    id: 4,
    name: "視野",
    sub: "Visual Fields",
    scores: [
      { value: 0, description: "正常" },
      { value: 1, description: "部分偏盲" },
      {
        value: 2,
        description: "完全偏盲：兩眼同側視野5度以上，看不見手指運動",
      },
      { value: 3, description: "兩側完全偏盲" },
    ],
  },
  {
    id: 5,
    name: "面部麻痺",
    sub: "Facial Palsy",
    scores: [
      { value: 0, description: "正常" },
      { value: 1, description: "輕度麻痺：鼻唇溝皺折消失" },
      { value: 2, description: "部分麻痺：下臉面完全癱瘓" },
      { value: 3, description: "半側完全麻痺：上下臉面完全癱瘓" },
    ],
  },
  {
    id: 6,
    name: "左側上肢運動",
    sub: "Motor Arm — Left",
    scores: [
      { value: 0, description: "正常：上抬達10秒以上" },
      { value: 1, description: "輕度無力：上抬未達10秒" },
      { value: 2, description: "無法抵抗加重力" },
      { value: 3, description: "無法抵抗重力" },
      { value: 4, description: "無法動彈" },
      { value: 96, description: "UN 不計分（截肢、關節融合）" },
    ],
  },
  {
    id: 7,
    name: "右側上肢運動",
    sub: "Motor Arm — Right",
    scores: [
      { value: 0, description: "正常：上抬達10秒以上" },
      { value: 1, description: "輕度無力：上抬未達10秒" },
      { value: 2, description: "無法抵抗加重力" },
      { value: 3, description: "無法抵抗重力" },
      { value: 4, description: "無法動彈" },
      { value: 96, description: "UN 不計分（截肢、關節融合）" },
    ],
  },
  {
    id: 8,
    name: "左側下肢運動",
    sub: "Motor Leg — Left",
    scores: [
      { value: 0, description: "正常：平躺時上抬30度，達5秒以上" },
      { value: 1, description: "輕度無力：平躺時上抬30度，未達5秒" },
      { value: 2, description: "無法抵抗加重力" },
      { value: 3, description: "無法抵抗重力" },
      { value: 4, description: "無法動彈" },
      { value: 96, description: "UN 不計分（截肢、關節融合）" },
    ],
  },
  {
    id: 9,
    name: "右側下肢運動",
    sub: "Motor Leg — Right",
    scores: [
      { value: 0, description: "正常：平躺時上抬30度，達5秒以上" },
      { value: 1, description: "輕度無力：平躺時上抬30度，未達5秒" },
      { value: 2, description: "無法抵抗加重力" },
      { value: 3, description: "無法抵抗重力" },
      { value: 4, description: "無法動彈" },
      { value: 96, description: "UN 不計分（截肢、關節融合）" },
    ],
  },
  {
    id: 10,
    name: "肢體協調",
    sub: "Limb Ataxia",
    scores: [
      { value: 0, description: "正常" },
      { value: 1, description: "僅有上肢或下肢有協調障礙" },
      { value: 2, description: "上下肢或兩側均有協調障礙" },
    ],
  },
  {
    id: 11,
    name: "感覺",
    sub: "Sensory",
    scores: [
      { value: 0, description: "正常；無感覺喪失" },
      { value: 1, description: "輕度至中度感覺喪失" },
      { value: 2, description: "完全喪失感覺：完全無感覺，coma 病人" },
    ],
  },
  {
    id: 12,
    name: "語言",
    sub: "Best Language",
    scores: [
      { value: 0, description: "無失語症；正常" },
      { value: 1, description: "輕至中度障礙" },
      { value: 2, description: "嚴重障礙：完全運動性或感覺性失語症" },
      { value: 3, description: "完全無法言語：包括意識昏迷無反應者" },
    ],
  },
  {
    id: 13,
    name: "構音障礙",
    sub: "Dysarthria",
    scores: [
      { value: 0, description: "正常" },
      { value: 1, description: "輕至中度障礙：某些字發音不清楚，但能理解" },
      { value: 2, description: "完全無法構音：發音皆不清楚且無法理解" },
      { value: 96, description: "on endo tube（不計分）" },
    ],
  },
  {
    id: 14,
    name: "忽視",
    sub: "Extinction and Inattention",
    scores: [
      { value: 0, description: "無障礙" },
      { value: 1, description: "部分忽視：患側其中一項感覺反應消失" },
      { value: 2, description: "完全忽視：患側兩項以上感覺反應消失" },
    ],
  },
];

const groups = [
  {
    label: "意識",
    sub: "Consciousness",
    color: "conscious",
    ids: [0, 1, 2],
  },
  { label: "眼部", sub: "Eyes", color: "eye", ids: [3, 4] },
  {
    label: "運動",
    sub: "Motor",
    color: "motor",
    ids: [5, 6, 7, 8, 9],
  },
  {
    label: "協調與感覺",
    sub: "Coordination & Sensory",
    color: "coord",
    ids: [10, 11],
  },
  {
    label: "語言與認知",
    sub: "Language & Cognition",
    color: "lang",
    ids: [12, 13, 14],
  },
];

// running Q-number map
const qIndex = (() => {
  const map: Record<number, number> = {};
  let n = 1;
  for (const g of groups)
    for (const id of g.ids) {
      map[id] = n++;
    }
  return map;
})();

const selections = ref<Record<number, number>>(
  Object.fromEntries(nihssItems.map((item) => [item.id, 0])),
);

const totalScore = computed(() =>
  nihssItems.reduce((sum, item) => {
    const v = selections.value[item.id];
    return v === 96 ? sum : sum + v;
  }, 0),
);

const answeredCount = computed(
  () =>
    nihssItems.filter(
      (item) =>
        selections.value[item.id] > 0 && selections.value[item.id] !== 96,
    ).length,
);

const totalMax = computed(() =>
  nihssItems.reduce((sum, item) => {
    const max = Math.max(...item.scores.map((s) => s.value));
    return max === 96 ? sum : sum + max;
  }, 0),
);

const severity = computed(() => {
  const s = totalScore.value;
  if (s === 0)
    return { level: "正常", color: "normal", advice: "無神經功能缺損" };
  if (s <= 4)
    return {
      level: "輕微中風",
      color: "mild",
      advice: "輕微神經功能缺損，預後通常良好",
    };
  if (s <= 15)
    return {
      level: "中度中風",
      color: "moderate",
      advice: "中度缺損，建議積極評估與治療",
    };
  if (s <= 20)
    return {
      level: "中重度中風",
      color: "severe",
      advice: "中重度神經功能缺損，需密切監測",
    };
  return {
    level: "重度中風",
    color: "critical",
    advice: "重度神經功能缺損，預後較差",
  };
});

function getDescription(item: (typeof nihssItems)[0], value: number) {
  return item.scores.find((s) => s.value === value)?.description ?? "";
}

function generateOutput() {
  const lines = nihssItems.map((item) => {
    const v = selections.value[item.id];
    const desc = getDescription(item, v);
    const scoreLabel = v === 96 ? "UN" : String(v);
    return `- **${item.name}**：${scoreLabel} - ${desc}`;
  });
  return `# NIHSS 評估結果\n\n${lines.join("\n")}\n\n## 總分：${totalScore.value}（${severity.value.level}）`;
}

const showResults = ref(false);
const copied = ref(false);
async function copyOutput() {
  await navigator.clipboard.writeText(generateOutput());
  copied.value = true;
  setTimeout(() => (copied.value = false), 2000);
}

function reset() {
  nihssItems.forEach((item) => {
    selections.value[item.id] = 0;
  });
}
</script>

<template>
  <div class="nihss">
    <!-- ── Header ─────────────────────────────────────────────── -->
    <div class="nihss-header">
      <div class="header-title">
        <h2 class="title">NIHSS 中風量表</h2>
        <p class="subtitle">美國國立衛生研究院腦中風量表</p>
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
          :style="{ width: Math.min((totalScore / 42) * 100, 100) + '%' }"
        />
      </div>
      <div class="severity-ticks-abs">
        <span class="tick-abs t-normal" style="left: 0%">0</span>
        <span class="tick-abs t-mild" style="left: 9.5%">4</span>
        <span class="tick-abs t-moderate" style="left: 35.7%">15</span>
        <span class="tick-abs t-severe" style="left: 47.6%">20</span>
        <span class="tick-abs t-critical" style="left: 100%">42</span>
      </div>
      <div class="severity-labels-abs">
        <span class="label-abs lbl-normal" style="left: 0%">正常</span>
        <span class="label-abs lbl-mild" style="left: 9.5%">輕微</span>
        <span class="label-abs lbl-moderate" style="left: 35.7%">中度</span>
        <span class="label-abs lbl-severe" style="left: 47.6%">中重度</span>
        <span class="label-abs lbl-critical" style="left: 100%">重度</span>
      </div>
    </div>

    <!-- ── Intro ──────────────────────────────────────────────── -->
    <div class="intro-bar">
      <span class="intro-dot">◉</span>
      <span>
        評估意識、眼部、運動、協調與感覺、語言與認知五大面向，共 15 項。總分
        0–42 分，分數越高表示神經功能缺損越嚴重。
      </span>
    </div>

    <!-- ── Groups ─────────────────────────────────────────────── -->
    <div v-for="group in groups" :key="group.label" class="nihss-group">
      <div class="group-header" :class="group.color + '-header'">
        <div class="group-label-block">
          <span class="group-label">{{ group.label }}</span>
          <span class="group-sub">{{ group.sub }}</span>
        </div>
        <span class="group-score-pill" :class="group.color + '-pill'">
          {{
            group.ids.reduce((s, id) => {
              const v = selections[id];
              return s + (v === 96 ? 0 : v);
            }, 0)
          }}
          pts
        </span>
      </div>

      <div class="item-list">
        <div
          v-for="id in group.ids"
          :key="id"
          class="nihss-item"
          :class="{
            answered: selections[id] > 0 && selections[id] !== 96,
            un: selections[id] === 96,
          }"
        >
          <div class="item-header">
            <div class="item-meta-row">
              <span class="item-qnum" :class="group.color + '-qnum'"
                >Q{{ qIndex[id] }}</span
              >
            </div>
            <div class="item-name-block">
              <span class="item-name">{{ nihssItems[id].name }}</span>
              <span class="item-sub">{{ nihssItems[id].sub }}</span>
            </div>
            <span
              class="item-score"
              :class="{
                zero: selections[id] === 0,
                un: selections[id] === 96,
                high: selections[id] > 0 && selections[id] !== 96,
              }"
            >
              {{ selections[id] === 96 ? "UN" : selections[id] }}
            </span>
          </div>

          <div class="option-row">
            <label
              v-for="score in nihssItems[id].scores"
              :key="score.value"
              class="opt-pill"
              :class="[
                score.value === 96 ? 'un' : 's' + score.value,
                { active: selections[id] === score.value },
              ]"
            >
              <input
                type="radio"
                :name="`nihss-${id}`"
                :value="score.value"
                v-model="selections[id]"
              />
              <span class="opt-num">{{
                score.value === 96 ? "UN" : score.value
              }}</span>
              <span class="opt-desc">{{ score.description }}</span>
            </label>
          </div>
        </div>
      </div>
    </div>

    <!-- ── Result card ────────────────────────────────────────── -->
    <div class="nihss-result" :class="severity.color">
      <div class="result-left">
        <span class="result-number">{{ totalScore }}</span>
        <span class="result-max">/ 42</span>
      </div>
      <div class="result-right">
        <span class="result-level">{{ severity.level }}</span>
        <span class="result-advice">{{ severity.advice }}</span>
      </div>
    </div>

    <!-- ── Results detail ─────────────────────────────────────── -->
    <div v-if="showResults" class="results-detail">
      <div class="results-header">評估明細</div>
      <div v-for="item in nihssItems" :key="item.id" class="detail-row">
        <span class="detail-qnum">Q{{ qIndex[item.id] }}</span>
        <span class="detail-domain">{{ item.name }}</span>
        <span
          class="detail-score"
          :class="{
            zero: selections[item.id] === 0,
            high: selections[item.id] > 0 && selections[item.id] !== 96,
          }"
        >
          {{ selections[item.id] === 96 ? "UN" : selections[item.id] }}
        </span>
        <span class="detail-desc">{{
          item.scores.find((s) => s.value === selections[item.id])?.description
        }}</span>
      </div>
      <div class="detail-row total-row">
        <span class="detail-qnum"></span>
        <span class="detail-domain">NIHSS 總分</span>
        <span class="detail-score brand">{{ totalScore }} / 42</span>
        <span class="detail-desc">{{ severity.level }}</span>
      </div>
    </div>

    <!-- ── Actions ────────────────────────────────────────────── -->
    <div class="nihss-actions">
      <button class="btn-view" @click="showResults = !showResults">
        {{ showResults ? "收起明細" : "查看評估結果" }}
      </button>
      <button class="btn-copy" @click="copyOutput">
        {{ copied ? "已複製 ✓" : "複製 Markdown 結果" }}
      </button>
      <button class="btn-reset" @click="reset">重置</button>
    </div>
  </div>
</template>

<style scoped>
.nihss {
  max-width: 780px;
  margin: 0 auto;
  padding: 2rem 0 3rem;
  font-size: 0.9rem;
}

/* ── Header ────────────────────────────────────────────────────── */
.nihss-header {
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
  border-color: #84cc16;
  color: #84cc16;
  box-shadow:
    0 0 0 1px rgba(132, 204, 22, 0.08),
    0 1px 3px rgba(0, 0, 0, 0.04);
}
.score-badge.moderate {
  border-color: #f59e0b;
  color: #f59e0b;
  box-shadow:
    0 0 0 1px rgba(245, 158, 11, 0.08),
    0 1px 3px rgba(0, 0, 0, 0.04);
}
.score-badge.severe {
  border-color: #f97316;
  color: #f97316;
  box-shadow:
    0 0 0 1px rgba(249, 115, 22, 0.08),
    0 1px 3px rgba(0, 0, 0, 0.04);
}
.score-badge.critical {
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
  background: linear-gradient(90deg, #84cc16, #a3e635);
}
.severity-fill.moderate {
  background: linear-gradient(90deg, #f59e0b, #fbbf24);
}
.severity-fill.severe {
  background: linear-gradient(90deg, #f97316, #fb923c);
}
.severity-fill.critical {
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
  color: #84cc16;
}
.lbl-moderate {
  color: #f59e0b;
}
.lbl-severe {
  color: #f97316;
}
.lbl-critical {
  color: #ef4444;
}
.t-normal {
  color: #22c55e;
}
.t-mild {
  color: #84cc16;
}
.t-moderate {
  color: #f59e0b;
}
.t-severe {
  color: #f97316;
}
.t-critical {
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
.nihss-group {
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
.group-header.conscious-header {
  border-left-color: #8b5cf6;
  background: linear-gradient(
    135deg,
    rgba(139, 92, 246, 0.08),
    var(--vp-c-bg-mute),
    var(--vp-c-bg-soft)
  );
  box-shadow: 0 1px 3px rgba(139, 92, 246, 0.06);
}
.group-header.eye-header {
  border-left-color: #3b82f6;
  background: linear-gradient(
    135deg,
    rgba(59, 130, 246, 0.08),
    var(--vp-c-bg-mute),
    var(--vp-c-bg-soft)
  );
  box-shadow: 0 1px 3px rgba(59, 130, 246, 0.06);
}
.group-header.motor-header {
  border-left-color: #ef4444;
  background: linear-gradient(
    135deg,
    rgba(239, 68, 68, 0.08),
    var(--vp-c-bg-mute),
    var(--vp-c-bg-soft)
  );
  box-shadow: 0 1px 3px rgba(239, 68, 68, 0.06);
}
.group-header.coord-header {
  border-left-color: #f59e0b;
  background: linear-gradient(
    135deg,
    rgba(245, 158, 11, 0.08),
    var(--vp-c-bg-mute),
    var(--vp-c-bg-soft)
  );
  box-shadow: 0 1px 3px rgba(245, 158, 11, 0.06);
}
.group-header.lang-header {
  border-left-color: #14b8a6;
  background: linear-gradient(
    135deg,
    rgba(20, 184, 166, 0.08),
    var(--vp-c-bg-mute),
    var(--vp-c-bg-soft)
  );
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
  border: 1px solid rgba(99, 102, 241, 0.25);
  color: var(--vp-c-brand-1);
  background: rgba(99, 102, 241, 0.06);
  white-space: nowrap;
  flex-shrink: 0;
}
.group-score-pill.conscious-pill {
  border-color: rgba(139, 92, 246, 0.25);
  color: #8b5cf6;
  background: rgba(139, 92, 246, 0.06);
}
.group-score-pill.eye-pill {
  border-color: rgba(59, 130, 246, 0.25);
  color: #3b82f6;
  background: rgba(59, 130, 246, 0.06);
}
.group-score-pill.motor-pill {
  border-color: rgba(239, 68, 68, 0.25);
  color: #ef4444;
  background: rgba(239, 68, 68, 0.06);
}
.group-score-pill.coord-pill {
  border-color: rgba(245, 158, 11, 0.25);
  color: #f59e0b;
  background: rgba(245, 158, 11, 0.06);
}
.group-score-pill.lang-pill {
  border-color: rgba(20, 184, 166, 0.25);
  color: #14b8a6;
  background: rgba(20, 184, 166, 0.06);
}

/* ── Item ──────────────────────────────────────────────────────── */
.item-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.nihss-item {
  border: 1px solid var(--vp-c-divider);
  border-radius: 10px;
  background: var(--vp-c-bg-soft);
  overflow: hidden;
  transition:
    border-color 0.25s,
    box-shadow 0.25s;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.03);
}
.nihss-item:hover {
  box-shadow: 0 3px 12px rgba(0, 0, 0, 0.06);
  border-color: var(--vp-c-divider);
}
.nihss-item.answered {
  border-color: rgba(99, 102, 241, 0.3);
}
.nihss-item.un {
  border-color: var(--vp-c-text-3);
  opacity: 0.7;
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
.item-qnum.conscious-qnum {
  background: linear-gradient(135deg, #8b5cf6, #7c3aed);
  box-shadow: 0 1px 3px rgba(139, 92, 246, 0.2);
}
.item-qnum.eye-qnum {
  background: linear-gradient(135deg, #3b82f6, #2563eb);
  box-shadow: 0 1px 3px rgba(59, 130, 246, 0.2);
}
.item-qnum.motor-qnum {
  background: linear-gradient(135deg, #ef4444, #dc2626);
  box-shadow: 0 1px 3px rgba(239, 68, 68, 0.2);
}
.item-qnum.coord-qnum {
  background: linear-gradient(135deg, #f59e0b, #d97706);
  box-shadow: 0 1px 3px rgba(245, 158, 11, 0.2);
}
.item-qnum.lang-qnum {
  background: linear-gradient(135deg, #14b8a6, #0d9488);
  box-shadow: 0 1px 3px rgba(20, 184, 166, 0.2);
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
.item-score.un {
  color: var(--vp-c-text-3);
  border-color: var(--vp-c-divider);
  background: transparent;
}

/* ── Option row ────────────────────────────────────────────────── */
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
.opt-desc {
  font-size: 0.7rem;
  font-weight: 700;
  line-height: 1.35;
  transition: color 0.2s;
  color: var(--vp-c-text-3);
}

/* Score-specific colors — severity gradient from green to red */
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
.opt-pill.s0 .opt-desc {
  color: rgba(34, 197, 94, 0.4);
}
.opt-pill.s0.active .opt-desc {
  color: rgba(34, 197, 94, 0.7);
}

.opt-pill.s1 {
  border-color: rgba(132, 204, 22, 0.15);
}
.opt-pill.s1:hover:not(.active),
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

.opt-pill.s2 {
  border-color: rgba(234, 179, 8, 0.15);
}
.opt-pill.s2:hover:not(.active),
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

.opt-pill.s3 {
  border-color: rgba(245, 158, 11, 0.15);
}
.opt-pill.s3:hover:not(.active),
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

.opt-pill.s4 {
  border-color: rgba(249, 115, 22, 0.15);
}
.opt-pill.s4:hover:not(.active),
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

.opt-pill.un {
  border-color: rgba(156, 163, 175, 0.15);
}
.opt-pill.un:hover:not(.active),
.opt-pill.un:focus-within {
  border-color: rgba(156, 163, 175, 0.35);
  background: rgba(156, 163, 175, 0.04);
}
.opt-pill.un.active {
  border-color: #9ca3af;
  background: linear-gradient(
    180deg,
    rgba(156, 163, 175, 0.12),
    rgba(156, 163, 175, 0.06)
  );
  box-shadow: 0 0 0 1px rgba(156, 163, 175, 0.08);
}
.opt-pill.un .opt-num {
  color: rgba(156, 163, 175, 0.5);
}
.opt-pill.un.active .opt-num {
  color: #9ca3af;
}
.opt-pill.un .opt-desc {
  color: rgba(156, 163, 175, 0.4);
}
.opt-pill.un.active .opt-desc {
  color: rgba(156, 163, 175, 0.7);
}

/* ── Result card ───────────────────────────────────────────────── */
.nihss-result {
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
.nihss-result.normal {
  border-color: #22c55e;
  box-shadow:
    0 0 0 1px rgba(34, 197, 94, 0.06),
    0 1px 3px rgba(0, 0, 0, 0.04);
}
.nihss-result.mild {
  border-color: #84cc16;
  box-shadow:
    0 0 0 1px rgba(132, 204, 22, 0.06),
    0 1px 3px rgba(0, 0, 0, 0.04);
}
.nihss-result.moderate {
  border-color: #f59e0b;
  box-shadow:
    0 0 0 1px rgba(245, 158, 11, 0.06),
    0 1px 3px rgba(0, 0, 0, 0.04);
}
.nihss-result.severe {
  border-color: #f97316;
  box-shadow:
    0 0 0 1px rgba(249, 115, 22, 0.06),
    0 1px 3px rgba(0, 0, 0, 0.04);
}
.nihss-result.critical {
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
.nihss-result.normal .result-number {
  color: #22c55e;
}
.nihss-result.mild .result-number {
  color: #84cc16;
}
.nihss-result.moderate .result-number {
  color: #f59e0b;
}
.nihss-result.severe .result-number {
  color: #f97316;
}
.nihss-result.critical .result-number {
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
  width: 72px;
  text-align: left;
}

/* ── Actions ───────────────────────────────────────────────────── */
.nihss-actions {
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
  .nihss-header {
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
  .nihss-result {
    flex-direction: column;
    gap: 0.75rem;
  }
}
</style>
