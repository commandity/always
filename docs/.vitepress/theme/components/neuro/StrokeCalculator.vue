<script setup lang="ts">
import { ref, computed } from "vue";

const activeTab = ref<"nihss" | "abcd2">("nihss");

// ══════════════ NIHSS 中風量表（NIH Stroke Scale）══════════════

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

const nihss_groups = [
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
  for (const g of nihss_groups)
    for (const id of g.ids) {
      map[id] = n++;
    }
  return map;
})();

const nihss_selections = ref<Record<number, number>>(
  Object.fromEntries(nihssItems.map((item) => [item.id, 0])),
);

const nihss_totalScore = computed(() =>
  nihssItems.reduce((sum, item) => {
    const v = nihss_selections.value[item.id];
    return v === 96 ? sum : sum + v;
  }, 0),
);

const answeredCount = computed(
  () =>
    nihssItems.filter(
      (item) =>
        nihss_selections.value[item.id] > 0 && nihss_selections.value[item.id] !== 96,
    ).length,
);

const totalMax = computed(() =>
  nihssItems.reduce((sum, item) => {
    const max = Math.max(...item.scores.map((s) => s.value));
    return max === 96 ? sum : sum + max;
  }, 0),
);

const severity = computed(() => {
  const s = nihss_totalScore.value;
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
    const v = nihss_selections.value[item.id];
    const desc = getDescription(item, v);
    const scoreLabel = v === 96 ? "UN" : String(v);
    return `- **${item.name}**：${scoreLabel} - ${desc}`;
  });
  return `# NIHSS 評估結果\n\n${lines.join("\n")}\n\n## 總分：${nihss_totalScore.value}（${severity.value.level}）`;
}

const nihss_showResults = ref(false);
const nihss_copied = ref(false);
async function copyOutput() {
  await navigator.clipboard.writeText(generateOutput());
  nihss_copied.value = true;
  setTimeout(() => (nihss_copied.value = false), 2000);
}

function nihss_reset() {
  nihssItems.forEach((item) => {
    nihss_selections.value[item.id] = 0;
  });
}

// ══════════════ ABCD² TIA 風險（TIA Risk Score）══════════════

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

const abcd2_selections = ref<Record<number, number>>(
  Object.fromEntries(items.map((item) => [item.id, 0])),
);

const abcd2_totalScore = computed(() =>
  items.reduce((sum, item) => sum + abcd2_selections.value[item.id], 0),
);

const risk = computed(() => {
  const s = abcd2_totalScore.value;
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

function abcd2_reset() {
  items.forEach((item) => {
    abcd2_selections.value[item.id] = 0;
  });
  abcd2_showResults.value = false;
}

const abcd2_showResults = ref(false);
const abcd2_copied = ref(false);

function generateMarkdown() {
  const lines = items.map((item) => {
    const v = abcd2_selections.value[item.id];
    const desc = item.scores.find((s) => s.value === v)?.description ?? "";
    return `- **${item.name}**：${v} — ${desc}`;
  });
  return `# ABCD-2 評估結果\n\n${lines.join("\n")}\n\n## 總分：${abcd2_totalScore.value}（${risk.value.level}）\n## ${risk.value.advice}`;
}

async function copyMarkdown() {
  await navigator.clipboard.writeText(generateMarkdown());
  abcd2_copied.value = true;
  setTimeout(() => (abcd2_copied.value = false), 2000);
}

const abcd2_groups = [
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
  <div class="strokeassess">
    <!-- Tab bar -->
    <div class="tab-bar">
      <button
        class="tab-btn"
        :class="{ active: activeTab === 'nihss' }"
        @click="activeTab = 'nihss'"
      >
        <span class="tab-label">NIHSS 中風量表</span>
        <span class="tab-sub">NIH Stroke Scale</span>
      </button>
      <button
        class="tab-btn"
        :class="{ active: activeTab === 'abcd2' }"
        @click="activeTab = 'abcd2'"
      >
        <span class="tab-label">ABCD² TIA 風險</span>
        <span class="tab-sub">TIA Risk Score</span>
      </button>
    </div>

  <div v-show="activeTab === 'nihss'" class="nihss">
    <!-- ── Header ─────────────────────────────────────────────── -->
    <div class="nihss-header">
      <div class="header-title">
        <h2 class="title">NIHSS 中風量表</h2>
        <p class="subtitle">美國國立衛生研究院腦中風量表</p>
      </div>
      <div class="score-badge" :class="severity.color">
        <span class="score-number">{{ nihss_totalScore }}</span>
        <span class="score-label">{{ severity.level }}</span>
      </div>
    </div>

    <!-- ── Severity bar ───────────────────────────────────────── -->
    <div class="severity-bar-wrap">
      <div class="severity-bar">
        <div
          class="severity-fill"
          :class="severity.color"
          :style="{ width: Math.min((nihss_totalScore / 42) * 100, 100) + '%' }"
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
    <div v-for="group in nihss_groups" :key="group.label" class="nihss-group">
      <div class="group-header" :class="group.color + '-header'">
        <div class="group-label-block">
          <span class="group-label">{{ group.label }}</span>
          <span class="group-sub">{{ group.sub }}</span>
        </div>
        <span class="group-score-pill" :class="group.color + '-pill'">
          {{
            group.ids.reduce((s, id) => {
              const v = nihss_selections[id];
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
            answered: nihss_selections[id] > 0 && nihss_selections[id] !== 96,
            un: nihss_selections[id] === 96,
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
                zero: nihss_selections[id] === 0,
                un: nihss_selections[id] === 96,
                high: nihss_selections[id] > 0 && nihss_selections[id] !== 96,
              }"
            >
              {{ nihss_selections[id] === 96 ? "UN" : nihss_selections[id] }}
            </span>
          </div>

          <div class="option-row">
            <label
              v-for="score in nihssItems[id].scores"
              :key="score.value"
              class="opt-pill"
              :class="[
                score.value === 96 ? 'un' : 's' + score.value,
                { active: nihss_selections[id] === score.value },
              ]"
            >
              <input
                type="radio"
                :name="`nihss-${id}`"
                :value="score.value"
                v-model="nihss_selections[id]"
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
        <span class="result-number">{{ nihss_totalScore }}</span>
        <span class="result-max">/ 42</span>
      </div>
      <div class="result-right">
        <span class="result-level">{{ severity.level }}</span>
        <span class="result-advice">{{ severity.advice }}</span>
      </div>
    </div>

    <!-- ── Results detail ─────────────────────────────────────── -->
    <div v-if="nihss_showResults" class="results-detail">
      <div class="results-header">評估明細</div>
      <div v-for="item in nihssItems" :key="item.id" class="detail-row">
        <span class="detail-qnum">Q{{ qIndex[item.id] }}</span>
        <span class="detail-domain">{{ item.name }}</span>
        <span
          class="detail-score"
          :class="{
            zero: nihss_selections[item.id] === 0,
            high: nihss_selections[item.id] > 0 && nihss_selections[item.id] !== 96,
          }"
        >
          {{ nihss_selections[item.id] === 96 ? "UN" : nihss_selections[item.id] }}
        </span>
        <span class="detail-desc">{{
          item.scores.find((s) => s.value === nihss_selections[item.id])?.description
        }}</span>
      </div>
      <div class="detail-row total-row">
        <span class="detail-qnum"></span>
        <span class="detail-domain">NIHSS 總分</span>
        <span class="detail-score brand">{{ nihss_totalScore }} / 42</span>
        <span class="detail-desc">{{ severity.level }}</span>
      </div>
    </div>

    <!-- ── Actions ────────────────────────────────────────────── -->
    <div class="nihss-actions">
      <button class="btn-view" @click="nihss_showResults = !nihss_showResults">
        {{ nihss_showResults ? "收起明細" : "查看評估結果" }}
      </button>
      <button class="btn-copy" @click="copyOutput">
        {{ nihss_copied ? "已複製 ✓" : "複製 Markdown 結果" }}
      </button>
      <button class="btn-reset" @click="nihss_reset">重置</button>
    </div>
  </div>

  <div v-show="activeTab === 'abcd2'" class="abcd2">
    <!-- ── Header ─────────────────────────────────────────────── -->
    <div class="abcd2-header">
      <div class="header-title">
        <h2 class="title">ABCD-2 TIA 風險評估</h2>
        <p class="subtitle">TIA 後腦中風風險評估</p>
      </div>
      <div class="score-badge" :class="'sb-' + risk.color">
        <span class="score-number">{{ abcd2_totalScore }}</span>
        <span class="score-label">{{ risk.level }}</span>
      </div>
    </div>

    <!-- ── Severity bar ───────────────────────────────────────── -->
    <div class="severity-bar-wrap">
      <div class="severity-bar">
        <div
          class="severity-fill"
          :class="'sf-' + risk.color"
          :style="{ width: (abcd2_totalScore / 7) * 100 + '%' }"
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
    <div v-for="group in abcd2_groups" :key="group.label" class="abcd2-group">
      <div class="group-header" :class="group.color + '-header'">
        <div class="group-label-block">
          <span class="group-label">{{ group.label }}</span>
          <span class="group-sub">{{ group.sub }}</span>
        </div>
        <span class="group-score-pill" :class="group.color + '-pill'">
          {{ group.ids.reduce((s, id) => s + abcd2_selections[id], 0) }} 分
        </span>
      </div>

      <div class="item-list">
        <div
          v-for="id in group.ids"
          :key="id"
          class="abcd2-item"
          :class="{ answered: abcd2_selections[id] > 0 }"
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
              :class="{ zero: abcd2_selections[id] === 0, high: abcd2_selections[id] > 0 }"
            >
              +{{ abcd2_selections[id] }}
            </span>
          </div>

          <div class="option-row">
            <label
              v-for="score in items[id].scores"
              :key="score.value"
              class="opt-pill"
              :class="{
                active: abcd2_selections[id] === score.value,
                ['s' + score.value]: true,
              }"
            >
              <input
                type="radio"
                :name="`abcd2-${id}`"
                :value="score.value"
                v-model="abcd2_selections[id]"
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
        <span class="result-number">{{ abcd2_totalScore }}</span>
        <span class="result-max">/ 7</span>
      </div>
      <div class="result-right">
        <span class="result-level">{{ risk.level }}</span>
        <span class="result-advice">{{ risk.advice }}</span>
      </div>
      <span v-show="abcd2_totalScore >= 4" class="result-alert">
        ⚠️ ≥ 4 建議 雙抗血小板治療（DAPT）
      </span>
    </div>

    <!-- ── Results detail ─────────────────────────────────────── -->
    <div v-if="abcd2_showResults" class="results-detail">
      <div class="results-header">評估明細</div>
      <div v-for="item in items" :key="item.id" class="detail-row">
        <span class="detail-qnum">Q{{ item.id + 1 }}</span>
        <span class="detail-domain">{{ item.name }}</span>
        <span
          class="detail-score"
          :class="{
            zero: abcd2_selections[item.id] === 0,
            high: abcd2_selections[item.id] > 0,
          }"
        >
          {{ abcd2_selections[item.id] }}
        </span>
        <span class="detail-desc">{{
          item.scores.find((s) => s.value === abcd2_selections[item.id])?.description
        }}</span>
      </div>
      <div class="detail-row total-row">
        <span class="detail-qnum"></span>
        <span class="detail-domain">ABCD-2 總分</span>
        <span class="detail-score brand">{{ abcd2_totalScore }} / 7</span>
        <span class="detail-desc">{{ risk.level }}</span>
      </div>
    </div>

    <!-- ── Actions ────────────────────────────────────────────── -->
    <div class="abcd2-actions">
      <button class="btn-view" @click="abcd2_showResults = !abcd2_showResults">
        {{ abcd2_showResults ? "收起明細" : "查看評估結果" }}
      </button>
      <button class="btn-copy" @click="copyMarkdown">
        {{ abcd2_copied ? "已複製 ✓" : "複製 Markdown 結果" }}
      </button>
      <button class="btn-reset" @click="abcd2_reset">重置</button>
    </div>
  </div>
  </div>
</template>

<style scoped>
.strokeassess {
  max-width: 820px;
  margin: 0 auto;
}

.tab-bar {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
  background: var(--vp-c-bg-mute);
  padding: 4px;
  border-radius: 10px;
  border: 1px solid var(--vp-c-divider);
  flex-wrap: wrap;
}

.tab-btn {
  flex: 1;
  min-width: 140px;
  padding: 0.65rem 1rem;
  background: transparent;
  border: 1.5px solid transparent;
  cursor: pointer;
  font-family: inherit;
  color: var(--vp-c-text-3);
  border-radius: 8px;
  transition: all 0.2s;
}
.tab-btn:hover {
  color: var(--vp-c-text-1);
  border-color: var(--vp-c-divider);
}
.tab-btn.active {
  color: var(--vp-c-brand-1);
  background: color-mix(in srgb, var(--vp-c-brand-1) 12%, transparent);
  border-color: color-mix(in srgb, var(--vp-c-brand-1) 35%, transparent);
  box-shadow: 0 0 0 1px color-mix(in srgb, var(--vp-c-brand-1) 8%, transparent);
}

.tab-label {
  display: block;
  font-size: 1rem;
  font-weight: 800;
  line-height: 1.3;
  letter-spacing: 0.02em;
}

.tab-sub {
  display: block;
  font-size: 0.78rem;
  font-weight: 600;
  color: var(--vp-c-text-3);
  margin-top: 2px;
  letter-spacing: 0.01em;
}

.tab-btn.active .tab-sub {
  color: var(--vp-c-brand-1);
  opacity: 0.7;
}

@media (max-width: 640px) {
  .tab-btn {
    padding: 0.5rem 0.65rem;
    min-width: 45%;
  }
  .tab-label {
    font-size: 0.9rem;
  }
  .tab-sub {
    font-size: 0.72rem;
  }
}

/* ══════════════ NIHSS 中風量表（NIH Stroke Scale）══════════════ */

.nihss {
  max-width: 780px;
  margin: 0 auto;
  padding: 2rem 0 3rem;
  font-size: 0.9rem;
}
.nihss /* ── Header ────────────────────────────────────────────────────── */
.nihss-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 1.25rem;
}
.nihss .header-title {
  flex: 1;
  min-width: 0;
}
.nihss .title {
  font-size: 24px;
  font-weight: 600;
  color: var(--vp-c-text-1);
  margin: 0 0 0.2rem;
  border: none !important;
  padding: 0 !important;
}
.nihss .subtitle {
  font-size: 0.78rem;
  color: var(--vp-c-text-3);
  margin: 0;
}
.nihss .score-badge {
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
.nihss .score-number {
  font-size: 2rem;
  font-weight: 800;
  line-height: 1;
  transition: color 0.3s;
}
.nihss .score-label {
  font-size: 0.68rem;
  font-weight: 600;
  margin-top: 2px;
  letter-spacing: 0.02em;
  text-align: center;
}
.nihss .score-badge.normal {
  border-color: #22c55e;
  color: #22c55e;
  box-shadow:
    0 0 0 1px rgba(34, 197, 94, 0.08),
    0 1px 3px rgba(0, 0, 0, 0.04);
}
.nihss .score-badge.mild {
  border-color: #84cc16;
  color: #84cc16;
  box-shadow:
    0 0 0 1px rgba(132, 204, 22, 0.08),
    0 1px 3px rgba(0, 0, 0, 0.04);
}
.nihss .score-badge.moderate {
  border-color: #f59e0b;
  color: #f59e0b;
  box-shadow:
    0 0 0 1px rgba(245, 158, 11, 0.08),
    0 1px 3px rgba(0, 0, 0, 0.04);
}
.nihss .score-badge.severe {
  border-color: #f97316;
  color: #f97316;
  box-shadow:
    0 0 0 1px rgba(249, 115, 22, 0.08),
    0 1px 3px rgba(0, 0, 0, 0.04);
}
.nihss .score-badge.critical {
  border-color: #ef4444;
  color: #ef4444;
  box-shadow:
    0 0 0 1px rgba(239, 68, 68, 0.08),
    0 1px 3px rgba(0, 0, 0, 0.04);
}
.nihss /* ── Severity bar ──────────────────────────────────────────────── */
.severity-bar-wrap {
  margin-bottom: 2.5rem;
}
.nihss .severity-bar {
  position: relative;
  height: 8px;
  border-radius: 999px;
  background: var(--vp-c-bg-mute);
  overflow: visible;
  margin-bottom: 4px;
  box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.08);
}
.nihss .severity-fill {
  height: 100%;
  border-radius: 999px;
  transition:
    width 0.5s cubic-bezier(0.22, 1, 0.36, 1),
    background 0.3s;
}
.nihss .severity-fill.normal {
  background: linear-gradient(90deg, #22c55e, #4ade80);
}
.nihss .severity-fill.mild {
  background: linear-gradient(90deg, #84cc16, #a3e635);
}
.nihss .severity-fill.moderate {
  background: linear-gradient(90deg, #f59e0b, #fbbf24);
}
.nihss .severity-fill.severe {
  background: linear-gradient(90deg, #f97316, #fb923c);
}
.nihss .severity-fill.critical {
  background: linear-gradient(90deg, #ef4444, #f87171);
}
.nihss .severity-ticks-abs,
.nihss .severity-labels-abs {
  position: relative;
  height: 14px;
  margin-top: 2px;
}
.nihss .severity-labels-abs {
  margin-top: 0;
  height: 13px;
}
.nihss .tick-abs {
  position: absolute;
  transform: translateX(-50%);
  font-size: 0.65rem;
  color: var(--vp-c-text-3);
  white-space: nowrap;
}
.nihss .tick-abs[style*="left: 0%"] {
  transform: translateX(0);
}
.nihss .tick-abs[style*="left: 100%"] {
  transform: translateX(-100%);
}
.nihss .label-abs {
  position: absolute;
  transform: translateX(-50%);
  font-size: 0.63rem;
  color: var(--vp-c-text-3);
  white-space: nowrap;
}
.nihss .label-abs[style*="left: 0%"] {
  transform: translateX(0);
}
.nihss .label-abs[style*="left: 100%"] {
  transform: translateX(-100%);
}
.nihss .lbl-normal {
  color: #22c55e;
}
.nihss .lbl-mild {
  color: #84cc16;
}
.nihss .lbl-moderate {
  color: #f59e0b;
}
.nihss .lbl-severe {
  color: #f97316;
}
.nihss .lbl-critical {
  color: #ef4444;
}
.nihss .t-normal {
  color: #22c55e;
}
.nihss .t-mild {
  color: #84cc16;
}
.nihss .t-moderate {
  color: #f59e0b;
}
.nihss .t-severe {
  color: #f97316;
}
.nihss .t-critical {
  color: #ef4444;
}
.nihss /* ── Intro ─────────────────────────────────────────────────────── */
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
.nihss .intro-dot {
  color: var(--vp-c-brand-1);
  flex-shrink: 0;
}
.nihss /* ── Group ─────────────────────────────────────────────────────── */
.nihss-group {
  margin-bottom: 1.5rem;
}
.nihss .group-header {
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
.nihss .group-header.conscious-header {
  border-left-color: #8b5cf6;
  background: linear-gradient(
    135deg,
    rgba(139, 92, 246, 0.08),
    var(--vp-c-bg-mute),
    var(--vp-c-bg-soft)
  );
  box-shadow: 0 1px 3px rgba(139, 92, 246, 0.06);
}
.nihss .group-header.eye-header {
  border-left-color: #3b82f6;
  background: linear-gradient(
    135deg,
    rgba(59, 130, 246, 0.08),
    var(--vp-c-bg-mute),
    var(--vp-c-bg-soft)
  );
  box-shadow: 0 1px 3px rgba(59, 130, 246, 0.06);
}
.nihss .group-header.motor-header {
  border-left-color: #ef4444;
  background: linear-gradient(
    135deg,
    rgba(239, 68, 68, 0.08),
    var(--vp-c-bg-mute),
    var(--vp-c-bg-soft)
  );
  box-shadow: 0 1px 3px rgba(239, 68, 68, 0.06);
}
.nihss .group-header.coord-header {
  border-left-color: #f59e0b;
  background: linear-gradient(
    135deg,
    rgba(245, 158, 11, 0.08),
    var(--vp-c-bg-mute),
    var(--vp-c-bg-soft)
  );
  box-shadow: 0 1px 3px rgba(245, 158, 11, 0.06);
}
.nihss .group-header.lang-header {
  border-left-color: #14b8a6;
  background: linear-gradient(
    135deg,
    rgba(20, 184, 166, 0.08),
    var(--vp-c-bg-mute),
    var(--vp-c-bg-soft)
  );
  box-shadow: 0 1px 3px rgba(20, 184, 166, 0.06);
}
.nihss .group-label-block {
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.nihss .group-label {
  font-size: 0.85rem;
  font-weight: 700;
  color: var(--vp-c-text-1);
}
.nihss .group-sub {
  font-size: 0.7rem;
  color: var(--vp-c-text-3);
}
.nihss .group-score-pill {
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
.nihss .group-score-pill.conscious-pill {
  border-color: rgba(139, 92, 246, 0.25);
  color: #8b5cf6;
  background: rgba(139, 92, 246, 0.06);
}
.nihss .group-score-pill.eye-pill {
  border-color: rgba(59, 130, 246, 0.25);
  color: #3b82f6;
  background: rgba(59, 130, 246, 0.06);
}
.nihss .group-score-pill.motor-pill {
  border-color: rgba(239, 68, 68, 0.25);
  color: #ef4444;
  background: rgba(239, 68, 68, 0.06);
}
.nihss .group-score-pill.coord-pill {
  border-color: rgba(245, 158, 11, 0.25);
  color: #f59e0b;
  background: rgba(245, 158, 11, 0.06);
}
.nihss .group-score-pill.lang-pill {
  border-color: rgba(20, 184, 166, 0.25);
  color: #14b8a6;
  background: rgba(20, 184, 166, 0.06);
}
.nihss /* ── Item ──────────────────────────────────────────────────────── */
.item-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
.nihss .nihss-item {
  border: 1px solid var(--vp-c-divider);
  border-radius: 10px;
  background: var(--vp-c-bg-soft);
  overflow: hidden;
  transition:
    border-color 0.25s,
    box-shadow 0.25s;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.03);
}
.nihss .nihss-item:hover {
  box-shadow: 0 3px 12px rgba(0, 0, 0, 0.06);
  border-color: var(--vp-c-divider);
}
.nihss .nihss-item.answered {
  border-color: rgba(99, 102, 241, 0.3);
}
.nihss .nihss-item.un {
  border-color: var(--vp-c-text-3);
  opacity: 0.7;
}
.nihss .item-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  padding: 0.6rem 0.9rem;
  border-bottom: 1px solid var(--vp-c-divider);
  gap: 0.75rem;
}
.nihss .item-meta-row {
  display: flex;
  align-items: center;
  flex-shrink: 0;
  padding-top: 3px;
}
.nihss .item-qnum {
  font-size: 0.72rem;
  font-weight: 800;
  color: #fff;
  background: linear-gradient(135deg, var(--vp-c-brand-1), #4f46e5);
  padding: 1px 9px;
  border-radius: 999px;
  letter-spacing: 0.04em;
  box-shadow: 0 1px 3px rgba(99, 102, 241, 0.2);
}
.nihss .item-qnum.conscious-qnum {
  background: linear-gradient(135deg, #8b5cf6, #7c3aed);
  box-shadow: 0 1px 3px rgba(139, 92, 246, 0.2);
}
.nihss .item-qnum.eye-qnum {
  background: linear-gradient(135deg, #3b82f6, #2563eb);
  box-shadow: 0 1px 3px rgba(59, 130, 246, 0.2);
}
.nihss .item-qnum.motor-qnum {
  background: linear-gradient(135deg, #ef4444, #dc2626);
  box-shadow: 0 1px 3px rgba(239, 68, 68, 0.2);
}
.nihss .item-qnum.coord-qnum {
  background: linear-gradient(135deg, #f59e0b, #d97706);
  box-shadow: 0 1px 3px rgba(245, 158, 11, 0.2);
}
.nihss .item-qnum.lang-qnum {
  background: linear-gradient(135deg, #14b8a6, #0d9488);
  box-shadow: 0 1px 3px rgba(20, 184, 166, 0.2);
}
.nihss .item-name-block {
  display: flex;
  flex-direction: column;
  gap: 2px;
  flex: 1;
}
.nihss .item-name {
  font-size: 0.88rem;
  font-weight: 600;
  color: var(--vp-c-text-1);
}
.nihss .item-sub {
  font-size: 0.7rem;
  color: var(--vp-c-text-3);
}
.nihss .item-score {
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
.nihss .item-score.zero {
  color: #22c55e;
  border-color: rgba(34, 197, 94, 0.25);
  background: rgba(34, 197, 94, 0.06);
}
.nihss .item-score.high {
  color: #f97316;
  border-color: rgba(249, 115, 22, 0.3);
  background: rgba(249, 115, 22, 0.08);
}
.nihss .item-score.un {
  color: var(--vp-c-text-3);
  border-color: var(--vp-c-divider);
  background: transparent;
}
.nihss /* ── Option row ────────────────────────────────────────────────── */
.option-row {
  display: flex;
  flex-wrap: wrap;
  gap: 3px;
  padding: 4px;
  background: var(--vp-c-bg-mute);
}
.nihss .opt-pill {
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
.nihss .opt-pill:hover {
  border-color: var(--vp-c-divider);
  background: var(--vp-c-bg-soft);
}
.nihss .opt-pill input[type="radio"] {
  display: none;
}
.nihss .opt-num {
  font-size: 0.95rem;
  font-weight: 900;
  transition: color 0.2s;
  color: var(--vp-c-text-3);
}
.nihss .opt-desc {
  font-size: 0.7rem;
  font-weight: 700;
  line-height: 1.35;
  transition: color 0.2s;
  color: var(--vp-c-text-3);
}
.nihss /* Score-specific colors — severity gradient from green to red */
.opt-pill.s0 {
  border-color: rgba(34, 197, 94, 0.15);
}
.nihss .opt-pill.s0:hover:not(.active),
.nihss .opt-pill.s0:focus-within {
  border-color: rgba(34, 197, 94, 0.35);
  background: rgba(34, 197, 94, 0.04);
}
.nihss .opt-pill.s0.active {
  border-color: #22c55e;
  background: color-mix(in srgb, rgb(34, 197, 94) 18%, var(--vp-c-bg));
  box-shadow: 0 0 0 1px rgba(34, 197, 94, 0.08);
}
.nihss .opt-pill.s0 .opt-num {
  color: rgba(34, 197, 94, 0.85);
}
.nihss .opt-pill.s0.active .opt-num {
  color: #22c55e;
}
.nihss .opt-pill.s0 .opt-desc {
  color: rgba(34, 197, 94, 0.7);
}
.nihss .opt-pill.s0.active .opt-desc {
  color: rgba(34, 197, 94, 0.9);
}
.nihss .opt-pill.s1 {
  border-color: rgba(132, 204, 22, 0.15);
}
.nihss .opt-pill.s1:hover:not(.active),
.nihss .opt-pill.s1:focus-within {
  border-color: rgba(132, 204, 22, 0.35);
  background: rgba(132, 204, 22, 0.04);
}
.nihss .opt-pill.s1.active {
  border-color: #84cc16;
  background: color-mix(in srgb, rgb(132, 204, 22) 18%, var(--vp-c-bg));
  box-shadow: 0 0 0 1px rgba(132, 204, 22, 0.08);
}
.nihss .opt-pill.s1 .opt-num {
  color: rgba(132, 204, 22, 0.85);
}
.nihss .opt-pill.s1.active .opt-num {
  color: #84cc16;
}
.nihss .opt-pill.s1 .opt-desc {
  color: rgba(132, 204, 22, 0.7);
}
.nihss .opt-pill.s1.active .opt-desc {
  color: rgba(132, 204, 22, 0.9);
}
.nihss .opt-pill.s2 {
  border-color: rgba(234, 179, 8, 0.15);
}
.nihss .opt-pill.s2:hover:not(.active),
.nihss .opt-pill.s2:focus-within {
  border-color: rgba(234, 179, 8, 0.35);
  background: rgba(234, 179, 8, 0.04);
}
.nihss .opt-pill.s2.active {
  border-color: #eab308;
  background: color-mix(in srgb, rgb(234, 179, 8) 18%, var(--vp-c-bg));
  box-shadow: 0 0 0 1px rgba(234, 179, 8, 0.08);
}
.nihss .opt-pill.s2 .opt-num {
  color: rgba(234, 179, 8, 0.85);
}
.nihss .opt-pill.s2.active .opt-num {
  color: #eab308;
}
.nihss .opt-pill.s2 .opt-desc {
  color: rgba(234, 179, 8, 0.7);
}
.nihss .opt-pill.s2.active .opt-desc {
  color: rgba(234, 179, 8, 0.9);
}
.nihss .opt-pill.s3 {
  border-color: rgba(245, 158, 11, 0.15);
}
.nihss .opt-pill.s3:hover:not(.active),
.nihss .opt-pill.s3:focus-within {
  border-color: rgba(245, 158, 11, 0.35);
  background: rgba(245, 158, 11, 0.04);
}
.nihss .opt-pill.s3.active {
  border-color: #f59e0b;
  background: color-mix(in srgb, rgb(245, 158, 11) 18%, var(--vp-c-bg));
  box-shadow: 0 0 0 1px rgba(245, 158, 11, 0.08);
}
.nihss .opt-pill.s3 .opt-num {
  color: rgba(245, 158, 11, 0.85);
}
.nihss .opt-pill.s3.active .opt-num {
  color: #f59e0b;
}
.nihss .opt-pill.s3 .opt-desc {
  color: rgba(245, 158, 11, 0.7);
}
.nihss .opt-pill.s3.active .opt-desc {
  color: rgba(245, 158, 11, 0.9);
}
.nihss .opt-pill.s4 {
  border-color: rgba(249, 115, 22, 0.15);
}
.nihss .opt-pill.s4:hover:not(.active),
.nihss .opt-pill.s4:focus-within {
  border-color: rgba(249, 115, 22, 0.35);
  background: rgba(249, 115, 22, 0.04);
}
.nihss .opt-pill.s4.active {
  border-color: #f97316;
  background: color-mix(in srgb, rgb(249, 115, 22) 18%, var(--vp-c-bg));
  box-shadow: 0 0 0 1px rgba(249, 115, 22, 0.08);
}
.nihss .opt-pill.s4 .opt-num {
  color: rgba(249, 115, 22, 0.85);
}
.nihss .opt-pill.s4.active .opt-num {
  color: #f97316;
}
.nihss .opt-pill.s4 .opt-desc {
  color: rgba(249, 115, 22, 0.7);
}
.nihss .opt-pill.s4.active .opt-desc {
  color: rgba(249, 115, 22, 0.9);
}
.nihss .opt-pill.un {
  border-color: rgba(156, 163, 175, 0.15);
}
.nihss .opt-pill.un:hover:not(.active),
.nihss .opt-pill.un:focus-within {
  border-color: rgba(156, 163, 175, 0.35);
  background: rgba(156, 163, 175, 0.04);
}
.nihss .opt-pill.un.active {
  border-color: #9ca3af;
  background: color-mix(in srgb, rgb(156, 163, 175) 18%, var(--vp-c-bg));
  box-shadow: 0 0 0 1px rgba(156, 163, 175, 0.08);
}
.nihss .opt-pill.un .opt-num {
  color: rgba(156, 163, 175, 0.85);
}
.nihss .opt-pill.un.active .opt-num {
  color: #9ca3af;
}
.nihss .opt-pill.un .opt-desc {
  color: rgba(156, 163, 175, 0.7);
}
.nihss .opt-pill.un.active .opt-desc {
  color: rgba(156, 163, 175, 0.9);
}
.nihss /* ── Result card ───────────────────────────────────────────────── */
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
.nihss .nihss-result.normal {
  border-color: #22c55e;
  box-shadow:
    0 0 0 1px rgba(34, 197, 94, 0.06),
    0 1px 3px rgba(0, 0, 0, 0.04);
}
.nihss .nihss-result.mild {
  border-color: #84cc16;
  box-shadow:
    0 0 0 1px rgba(132, 204, 22, 0.06),
    0 1px 3px rgba(0, 0, 0, 0.04);
}
.nihss .nihss-result.moderate {
  border-color: #f59e0b;
  box-shadow:
    0 0 0 1px rgba(245, 158, 11, 0.06),
    0 1px 3px rgba(0, 0, 0, 0.04);
}
.nihss .nihss-result.severe {
  border-color: #f97316;
  box-shadow:
    0 0 0 1px rgba(249, 115, 22, 0.06),
    0 1px 3px rgba(0, 0, 0, 0.04);
}
.nihss .nihss-result.critical {
  border-color: #ef4444;
  box-shadow:
    0 0 0 1px rgba(239, 68, 68, 0.06),
    0 1px 3px rgba(0, 0, 0, 0.04);
}
.nihss .result-left {
  display: flex;
  align-items: baseline;
  gap: 4px;
  flex-shrink: 0;
}
.nihss .result-number {
  font-size: 3.5rem;
  font-weight: 800;
  line-height: 1;
  color: var(--vp-c-text-3);
  transition: color 0.3s;
}
.nihss .nihss-result.normal .result-number {
  color: #22c55e;
}
.nihss .nihss-result.mild .result-number {
  color: #84cc16;
}
.nihss .nihss-result.moderate .result-number {
  color: #f59e0b;
}
.nihss .nihss-result.severe .result-number {
  color: #f97316;
}
.nihss .nihss-result.critical .result-number {
  color: #ef4444;
}
.nihss .result-max {
  font-size: 1rem;
  color: var(--vp-c-text-3);
}
.nihss .result-right {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.nihss .result-level {
  font-size: 1rem;
  font-weight: 700;
  color: var(--vp-c-text-1);
}
.nihss .result-advice {
  font-size: 0.83rem;
  color: var(--vp-c-text-2);
  line-height: 1.5;
}
.nihss /* ── Results detail ────────────────────────────────────────────── */
.results-detail {
  border: 1px solid var(--vp-c-divider);
  border-radius: 10px;
  overflow: hidden;
  margin-bottom: 1rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.03);
}
.nihss .results-header {
  padding: 0.5rem 0.9rem;
  font-size: 0.72rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--vp-c-text-3);
  background: var(--vp-c-bg-mute);
  border-bottom: 1px solid var(--vp-c-divider);
}
.nihss .detail-row {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.5rem 0.9rem;
  border-bottom: 1px solid var(--vp-c-divider);
}
.nihss .detail-row:last-child {
  border-bottom: none;
}
.nihss .total-row {
  background: linear-gradient(135deg, var(--vp-c-bg-mute), var(--vp-c-bg-soft));
  font-weight: 800;
}
.nihss .detail-qnum {
  font-size: 0.7rem;
  font-weight: 800;
  color: var(--vp-c-brand-1);
  flex-shrink: 0;
  width: 32px;
}
.nihss .detail-domain {
  font-size: 0.8rem;
  font-weight: 700;
  color: var(--vp-c-text-1);
  flex: 1;
}
.nihss .detail-score {
  font-size: 0.82rem;
  font-weight: 800;
  flex-shrink: 0;
  width: 60px;
  text-align: right;
}
.nihss .detail-score.zero {
  color: #22c55e;
}
.nihss .detail-score.high {
  color: #f97316;
}
.nihss .detail-score.brand {
  color: var(--vp-c-brand-1);
}
.nihss .detail-desc {
  font-size: 0.75rem;
  color: var(--vp-c-text-2);
  flex-shrink: 0;
  width: 72px;
  text-align: left;
}
.nihss /* ── Actions ───────────────────────────────────────────────────── */
.nihss-actions {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
}
.nihss .btn-view,
.nihss .btn-copy,
.nihss .btn-reset {
  padding: 9px 22px;
  border-radius: 8px;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  font-family: inherit;
  transition: all 0.2s;
}
.nihss .btn-view {
  border: none;
  background: linear-gradient(135deg, var(--vp-c-brand-1), #4f46e5);
  color: #fff;
  box-shadow: 0 2px 8px rgba(99, 102, 241, 0.3);
}
.nihss .btn-view:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 14px rgba(99, 102, 241, 0.4);
}
.nihss .btn-view:active {
  transform: translateY(0);
}
.nihss .btn-copy {
  border: 1.5px solid var(--vp-c-brand-1);
  background: transparent;
  color: var(--vp-c-brand-1);
}
.nihss .btn-copy:hover {
  background: var(--vp-c-brand-soft);
}
.nihss .btn-reset {
  border: 1px solid var(--vp-c-divider);
  background: transparent;
  color: var(--vp-c-text-2);
}
.nihss .btn-reset:hover {
  border-color: #ef4444;
  color: #ef4444;
  background: rgba(239, 68, 68, 0.04);
}

@media (max-width: 640px) {
.nihss .nihss-header {
    flex-direction: column;
  }
.nihss .score-badge {
    flex-direction: row;
    gap: 0.5rem;
    align-self: flex-start;
  }
.nihss .score-number {
    font-size: 1.5rem;
  }
.nihss .nihss-result {
    flex-direction: column;
    gap: 0.75rem;
  }
}
/* ══════════════ ABCD² TIA 風險（TIA Risk Score）══════════════ */

.abcd2 {
  max-width: 780px;
  margin: 0 auto;
  padding: 2rem 0 3rem;
  font-size: 0.9rem;
}
.abcd2 /* ── Header ────────────────────────────────────────────────────── */
.abcd2-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 1.25rem;
}
.abcd2 .header-title {
  flex: 1;
  min-width: 0;
}
.abcd2 .title {
  font-size: 24px;
  font-weight: 600;
  color: var(--vp-c-text-1);
  margin: 0 0 0.2rem;
  border: none !important;
  padding: 0 !important;
}
.abcd2 .subtitle {
  font-size: 0.78rem;
  color: var(--vp-c-text-3);
  margin: 0;
}
.abcd2 .score-badge {
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
.abcd2 .score-number {
  font-size: 2rem;
  font-weight: 800;
  line-height: 1;
  transition: color 0.3s;
}
.abcd2 .score-label {
  font-size: 0.68rem;
  font-weight: 600;
  margin-top: 2px;
  letter-spacing: 0.02em;
  text-align: center;
}
.abcd2 .sb-low {
  border-color: #22c55e;
  color: #22c55e;
  box-shadow:
    0 0 0 1px rgba(34, 197, 94, 0.08),
    0 1px 3px rgba(0, 0, 0, 0.04);
}
.abcd2 .sb-mid {
  border-color: #f59e0b;
  color: #f59e0b;
  box-shadow:
    0 0 0 1px rgba(245, 158, 11, 0.08),
    0 1px 3px rgba(0, 0, 0, 0.04);
}
.abcd2 .sb-high {
  border-color: #ef4444;
  color: #ef4444;
  box-shadow:
    0 0 0 1px rgba(239, 68, 68, 0.08),
    0 1px 3px rgba(0, 0, 0, 0.04);
}
.abcd2 /* ── Severity bar ──────────────────────────────────────────────── */
.severity-bar-wrap {
  margin-bottom: 2.5rem;
}
.abcd2 .severity-bar {
  position: relative;
  height: 8px;
  border-radius: 999px;
  background: var(--vp-c-bg-mute);
  overflow: visible;
  margin-bottom: 4px;
  box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.08);
}
.abcd2 .severity-fill {
  height: 100%;
  border-radius: 999px;
  transition:
    width 0.5s cubic-bezier(0.22, 1, 0.36, 1),
    background 0.3s;
}
.abcd2 .sf-low {
  background: linear-gradient(90deg, #22c55e, #4ade80);
}
.abcd2 .sf-mid {
  background: linear-gradient(90deg, #f59e0b, #fbbf24);
}
.abcd2 .sf-high {
  background: linear-gradient(90deg, #ef4444, #f87171);
}
.abcd2 .severity-ticks-abs,
.abcd2 .severity-labels-abs {
  position: relative;
  height: 14px;
  margin-top: 2px;
}
.abcd2 .severity-labels-abs {
  margin-top: 0;
  height: 13px;
}
.abcd2 .tick-abs {
  position: absolute;
  transform: translateX(-50%);
  font-size: 0.65rem;
  color: var(--vp-c-text-3);
  white-space: nowrap;
}
.abcd2 .tick-abs[style*="left: 0%"] {
  transform: translateX(0);
}
.abcd2 .tick-abs[style*="left: 100%"] {
  transform: translateX(-100%);
}
.abcd2 .label-abs {
  position: absolute;
  transform: translateX(-50%);
  font-size: 0.63rem;
  color: var(--vp-c-text-3);
  white-space: nowrap;
}
.abcd2 .label-abs[style*="left: 0%"] {
  transform: translateX(0);
}
.abcd2 .label-abs[style*="left: 100%"] {
  transform: translateX(-100%);
}
.abcd2 .lbl-low {
  color: #22c55e;
}
.abcd2 .lbl-mid {
  color: #f59e0b;
}
.abcd2 .lbl-high {
  color: #ef4444;
}
.abcd2 .t-low {
  color: #22c55e;
}
.abcd2 .t-mid {
  color: #f59e0b;
}
.abcd2 .t-high {
  color: #ef4444;
}
.abcd2 /* ── Intro ─────────────────────────────────────────────────────── */
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
.abcd2 .intro-dot {
  color: var(--vp-c-brand-1);
  flex-shrink: 0;
}
.abcd2 /* ── Group ─────────────────────────────────────────────────────── */
.abcd2-group {
  margin-bottom: 1.5rem;
}
.abcd2 .group-header {
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
.abcd2 .group-header.indigo-header {
  border-left-color: #6366f1;
  box-shadow: 0 1px 3px rgba(99, 102, 241, 0.06);
}
.abcd2 .group-header.orange-header {
  border-left-color: #f97316;
  background: linear-gradient(
    135deg,
    rgba(249, 115, 22, 0.08),
    var(--vp-c-bg-mute),
    var(--vp-c-bg-soft)
  );
  box-shadow: 0 1px 3px rgba(249, 115, 22, 0.06);
}
.abcd2 .group-label-block {
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.abcd2 .group-label {
  font-size: 0.85rem;
  font-weight: 700;
  color: var(--vp-c-text-1);
}
.abcd2 .group-sub {
  font-size: 0.7rem;
  color: var(--vp-c-text-3);
}
.abcd2 .group-score-pill {
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
.abcd2 .group-score-pill.indigo-pill {
  border-color: rgba(99, 102, 241, 0.25);
  color: #6366f1;
  background: rgba(99, 102, 241, 0.06);
}
.abcd2 .group-score-pill.orange-pill {
  border-color: rgba(249, 115, 22, 0.25);
  color: #f97316;
  background: rgba(249, 115, 22, 0.06);
}
.abcd2 /* ── Item ──────────────────────────────────────────────────────── */
.item-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
.abcd2 .abcd2-item {
  border: 1px solid var(--vp-c-divider);
  border-radius: 10px;
  background: var(--vp-c-bg-soft);
  overflow: hidden;
  transition:
    border-color 0.25s,
    box-shadow 0.25s;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.03);
}
.abcd2 .abcd2-item:hover {
  box-shadow: 0 3px 12px rgba(0, 0, 0, 0.06);
  border-color: var(--vp-c-divider);
}
.abcd2 .abcd2-item.answered {
  border-color: rgba(99, 102, 241, 0.3);
}
.abcd2 .item-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  padding: 0.6rem 0.9rem;
  border-bottom: 1px solid var(--vp-c-divider);
  gap: 0.75rem;
}
.abcd2 .item-meta-row {
  display: flex;
  align-items: center;
  flex-shrink: 0;
  padding-top: 3px;
}
.abcd2 .item-badge {
  font-size: 0.72rem;
  font-weight: 800;
  color: #fff;
  background: linear-gradient(135deg, var(--vp-c-brand-1), #4f46e5);
  padding: 1px 9px;
  border-radius: 999px;
  letter-spacing: 0.04em;
  box-shadow: 0 1px 3px rgba(99, 102, 241, 0.2);
}
.abcd2 .item-badge.indigo-qnum {
  background: linear-gradient(135deg, #6366f1, #4f46e5);
  box-shadow: 0 1px 3px rgba(99, 102, 241, 0.2);
}
.abcd2 .item-badge.orange-qnum {
  background: linear-gradient(135deg, #f97316, #ea580c);
  box-shadow: 0 1px 3px rgba(249, 115, 22, 0.2);
}
.abcd2 .item-name-block {
  display: flex;
  flex-direction: column;
  gap: 2px;
  flex: 1;
}
.abcd2 .item-name {
  font-size: 0.88rem;
  font-weight: 600;
  color: var(--vp-c-text-1);
}
.abcd2 .item-sub {
  font-size: 0.7rem;
  color: var(--vp-c-text-3);
}
.abcd2 .item-score {
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
.abcd2 .item-score.zero {
  color: #22c55e;
  border-color: rgba(34, 197, 94, 0.25);
  background: rgba(34, 197, 94, 0.06);
}
.abcd2 .item-score.high {
  color: #f97316;
  border-color: rgba(249, 115, 22, 0.3);
  background: rgba(249, 115, 22, 0.08);
}
.abcd2 /* ── Option pills (ENS6Q style) ────────────────────────────────── */
.option-row {
  display: flex;
  flex-wrap: wrap;
  gap: 3px;
  padding: 4px;
  background: var(--vp-c-bg-mute);
}
.abcd2 .opt-pill {
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
.abcd2 .opt-pill:hover {
  border-color: var(--vp-c-divider);
  background: var(--vp-c-bg-soft);
}
.abcd2 .opt-pill input[type="radio"] {
  display: none;
}
.abcd2 .opt-num {
  font-size: 0.95rem;
  font-weight: 900;
  transition: color 0.2s;
  color: var(--vp-c-text-3);
}
.abcd2 .item-desc {
  font-size: 0.7rem;
  font-weight: 700;
  line-height: 1.35;
  transition: color 0.2s;
  color: var(--vp-c-text-3);
}
.abcd2 /* Score colors */
.opt-pill.s0 {
  border-color: rgba(34, 197, 94, 0.15);
}
.abcd2 .opt-pill.s0:hover:not(.active),
.abcd2 .opt-pill.s0:focus-within {
  border-color: rgba(34, 197, 94, 0.35);
  background: rgba(34, 197, 94, 0.04);
}
.abcd2 .opt-pill.s0.active {
  border-color: #22c55e;
  background: color-mix(in srgb, rgb(34, 197, 94) 18%, var(--vp-c-bg));
  box-shadow: 0 0 0 1px rgba(34, 197, 94, 0.08);
}
.abcd2 .opt-pill.s0 .opt-num {
  color: rgba(34, 197, 94, 0.85);
}
.abcd2 .opt-pill.s0.active .opt-num {
  color: #22c55e;
}
.abcd2 .opt-pill.s0 .item-desc {
  color: rgba(34, 197, 94, 0.4);
}
.abcd2 .opt-pill.s0.active .item-desc {
  color: rgba(34, 197, 94, 0.7);
}
.abcd2 .opt-pill.s1 {
  border-color: rgba(245, 158, 11, 0.15);
}
.abcd2 .opt-pill.s1:hover:not(.active),
.abcd2 .opt-pill.s1:focus-within {
  border-color: rgba(245, 158, 11, 0.35);
  background: rgba(245, 158, 11, 0.04);
}
.abcd2 .opt-pill.s1.active {
  border-color: #f59e0b;
  background: color-mix(in srgb, rgb(245, 158, 11) 18%, var(--vp-c-bg));
  box-shadow: 0 0 0 1px rgba(245, 158, 11, 0.08);
}
.abcd2 .opt-pill.s1 .opt-num {
  color: rgba(245, 158, 11, 0.85);
}
.abcd2 .opt-pill.s1.active .opt-num {
  color: #f59e0b;
}
.abcd2 .opt-pill.s1 .item-desc {
  color: rgba(245, 158, 11, 0.4);
}
.abcd2 .opt-pill.s1.active .item-desc {
  color: rgba(245, 158, 11, 0.7);
}
.abcd2 .opt-pill.s2 {
  border-color: rgba(239, 68, 68, 0.15);
}
.abcd2 .opt-pill.s2:hover:not(.active),
.abcd2 .opt-pill.s2:focus-within {
  border-color: rgba(239, 68, 68, 0.35);
  background: rgba(239, 68, 68, 0.04);
}
.abcd2 .opt-pill.s2.active {
  border-color: #ef4444;
  background: color-mix(in srgb, rgb(239, 68, 68) 18%, var(--vp-c-bg));
  box-shadow: 0 0 0 1px rgba(239, 68, 68, 0.08);
}
.abcd2 .opt-pill.s2 .opt-num {
  color: rgba(239, 68, 68, 0.85);
}
.abcd2 .opt-pill.s2.active .opt-num {
  color: #ef4444;
}
.abcd2 .opt-pill.s2 .item-desc {
  color: rgba(239, 68, 68, 0.4);
}
.abcd2 .opt-pill.s2.active .item-desc {
  color: rgba(239, 68, 68, 0.7);
}
.abcd2 /* ── Result card ───────────────────────────────────────────────── */
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
.abcd2 .res-low {
  border-color: #22c55e;
  box-shadow:
    0 0 0 1px rgba(34, 197, 94, 0.06),
    0 1px 3px rgba(0, 0, 0, 0.04);
}
.abcd2 .res-mid {
  border-color: #f59e0b;
  box-shadow:
    0 0 0 1px rgba(245, 158, 11, 0.06),
    0 1px 3px rgba(0, 0, 0, 0.04);
}
.abcd2 .res-high {
  border-color: #ef4444;
  box-shadow:
    0 0 0 1px rgba(239, 68, 68, 0.06),
    0 1px 3px rgba(0, 0, 0, 0.04);
}
.abcd2 .result-left {
  display: flex;
  align-items: baseline;
  gap: 4px;
  flex-shrink: 0;
}
.abcd2 .result-number {
  font-size: 3.5rem;
  font-weight: 800;
  line-height: 1;
  color: var(--vp-c-text-3);
  transition: color 0.3s;
}
.abcd2 .res-low .result-number {
  color: #22c55e;
}
.abcd2 .res-mid .result-number {
  color: #f59e0b;
}
.abcd2 .res-high .result-number {
  color: #ef4444;
}
.abcd2 .result-max {
  font-size: 1rem;
  color: var(--vp-c-text-3);
}
.abcd2 .result-right {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.abcd2 .result-level {
  font-size: 1rem;
  font-weight: 700;
  color: var(--vp-c-text-1);
}
.abcd2 .result-advice {
  font-size: 0.83rem;
  color: var(--vp-c-text-2);
  line-height: 1.5;
}
.abcd2 .result-alert {
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
.abcd2 /* ── Results detail ────────────────────────────────────────────── */
.results-detail {
  border: 1px solid var(--vp-c-divider);
  border-radius: 10px;
  overflow: hidden;
  margin-bottom: 1rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.03);
}
.abcd2 .results-header {
  padding: 0.5rem 0.9rem;
  font-size: 0.72rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--vp-c-text-3);
  background: var(--vp-c-bg-mute);
  border-bottom: 1px solid var(--vp-c-divider);
}
.abcd2 .detail-row {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.5rem 0.9rem;
  border-bottom: 1px solid var(--vp-c-divider);
}
.abcd2 .detail-row:last-child {
  border-bottom: none;
}
.abcd2 .total-row {
  background: linear-gradient(135deg, var(--vp-c-bg-mute), var(--vp-c-bg-soft));
  font-weight: 800;
}
.abcd2 .detail-qnum {
  font-size: 0.7rem;
  font-weight: 800;
  color: var(--vp-c-brand-1);
  flex-shrink: 0;
  width: 32px;
}
.abcd2 .detail-domain {
  font-size: 0.8rem;
  font-weight: 700;
  color: var(--vp-c-text-1);
  flex: 1;
}
.abcd2 .detail-score {
  font-size: 0.82rem;
  font-weight: 800;
  flex-shrink: 0;
  width: 60px;
  text-align: right;
}
.abcd2 .detail-score.zero {
  color: #22c55e;
}
.abcd2 .detail-score.high {
  color: #f97316;
}
.abcd2 .detail-score.brand {
  color: var(--vp-c-brand-1);
}
.abcd2 .detail-desc {
  font-size: 0.75rem;
  color: var(--vp-c-text-2);
  flex-shrink: 0;
  width: 108px;
  text-align: left;
}
.abcd2 /* ── Actions ───────────────────────────────────────────────────── */
.abcd2-actions {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
}
.abcd2 .btn-view,
.abcd2 .btn-copy,
.abcd2 .btn-reset {
  padding: 9px 22px;
  border-radius: 8px;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  font-family: inherit;
  transition: all 0.2s;
}
.abcd2 .btn-view {
  border: none;
  background: linear-gradient(135deg, var(--vp-c-brand-1), #4f46e5);
  color: #fff;
  box-shadow: 0 2px 8px rgba(99, 102, 241, 0.3);
}
.abcd2 .btn-view:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 14px rgba(99, 102, 241, 0.4);
}
.abcd2 .btn-view:active {
  transform: translateY(0);
}
.abcd2 .btn-copy {
  border: 1.5px solid var(--vp-c-brand-1);
  background: transparent;
  color: var(--vp-c-brand-1);
}
.abcd2 .btn-copy:hover {
  background: var(--vp-c-brand-soft);
}
.abcd2 .btn-reset {
  border: 1px solid var(--vp-c-divider);
  background: transparent;
  color: var(--vp-c-text-2);
}
.abcd2 .btn-reset:hover {
  border-color: #ef4444;
  color: #ef4444;
  background: rgba(239, 68, 68, 0.04);
}

@media (max-width: 640px) {
.abcd2 .abcd2-header {
    flex-direction: column;
  }
.abcd2 .score-badge {
    flex-direction: row;
    gap: 0.5rem;
    align-self: flex-start;
  }
.abcd2 .score-number {
    font-size: 1.5rem;
  }
.abcd2 .abcd2-result {
    flex-direction: column;
    gap: 0.75rem;
  }
.abcd2 .result-alert {
    position: static;
    transform: none;
    align-self: flex-start;
    white-space: normal;
  }
}
/* ══════════════ Shared score badge（各工具統一樣式）══════════════ */
.strokeassess .score-badge {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  /* fixed size so the card doesn't expand when the result appears */
  width: 128px;
  height: 104px;
  min-width: 128px;
  min-height: 104px;
  flex-shrink: 0;
  padding: 0.4rem 0.5rem;
  overflow: hidden;
  border-radius: 14px;
  border: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg-soft);
  transition: all 0.3s;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
}
.strokeassess .score-number {
  font-size: 1.7rem;
  font-weight: 800;
  line-height: 1;
  transition: color 0.3s;
}
.strokeassess .score-unit {
  font-size: 0.66rem;
  font-weight: 700;
  margin-top: 2px;
  opacity: 0.75;
}
.strokeassess .score-label {
  font-size: 0.66rem;
  font-weight: 600;
  margin-top: 3px;
  letter-spacing: 0.01em;
  text-align: center;
  line-height: 1.25;
  word-break: break-word;
  max-width: 100%;
}
.strokeassess .score-badge.pending {
  border-color: var(--vp-c-divider);
  color: var(--vp-c-text-3);
}
.strokeassess .score-badge.normal {
  border-color: #22c55e;
  color: #22c55e;
  background: linear-gradient(180deg, rgba(34, 197, 94, 0.07), transparent);
}
.strokeassess .score-badge.mild {
  border-color: #f59e0b;
  color: #f59e0b;
  background: linear-gradient(180deg, rgba(245, 158, 11, 0.07), transparent);
}
.strokeassess .score-badge.moderate {
  border-color: #f97316;
  color: #f97316;
  background: linear-gradient(180deg, rgba(249, 115, 22, 0.07), transparent);
}
.strokeassess .score-badge.badge-male {
  border-color: #38bdf8;
  color: #38bdf8;
  background: linear-gradient(180deg, rgba(56, 189, 248, 0.07), transparent);
}
.strokeassess .score-badge.badge-female {
  border-color: #f472b6;
  color: #f472b6;
  background: linear-gradient(180deg, rgba(244, 114, 182, 0.07), transparent);
}
@media (max-width: 640px) {
  .strokeassess .score-badge {
    width: auto;
    height: auto;
    min-width: 0;
    min-height: 0;
    padding: 0.5rem 0.9rem;
  }
}

</style>
