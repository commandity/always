<script setup lang="ts">
import { ref, computed } from "vue";

// ── SF-36 Question definitions ────────────────────────────────────
// Each question: key, text, options, domain mapping, scoring direction
// All questions: value 1 = best, value N = worst; reverse=true for standard 0-100 transform

const questions = [
  // Q1 — General Health perception (GH)
  {
    key: "q1",
    domain: "GH",
    text: "整體來說，您認為您目前的健康狀況是？",
    sub: "General health self-rating",
    options: [
      { label: "極佳", value: 1 },
      { label: "很好", value: 2 },
      { label: "好", value: 3 },
      { label: "普通", value: 4 },
      { label: "差", value: 5 },
    ],
    reverse: true,
  },
  // Q2 — Health Transition (not scored in 8 domains, standalone)
  {
    key: "q2",
    domain: "HT",
    text: "與一年前相比，您認為您現在的健康狀況如何？",
    sub: "Health transition",
    options: [
      { label: "好多了", value: 1 },
      { label: "好一點", value: 2 },
      { label: "差不多", value: 3 },
      { label: "差一點", value: 4 },
      { label: "差多了", value: 5 },
    ],
    reverse: true,
  },
  // Q3a–Q3j — Physical Functioning (PF) — 10 items
  {
    key: "q3a",
    domain: "PF",
    text: "劇烈運動，如跑步、搬重物、激烈運動",
    sub: "Vigorous activities",
    options: [
      { label: "不受限", value: 1 },
      { label: "受限一點", value: 2 },
      { label: "受限很大", value: 3 },
    ],
    reverse: true,
  },
  {
    key: "q3b",
    domain: "PF",
    text: "中度活動，如搬桌子、掃地、打保齡球、打太極拳",
    sub: "Moderate activities",
    options: [
      { label: "不受限", value: 1 },
      { label: "受限一點", value: 2 },
      { label: "受限很大", value: 3 },
    ],
    reverse: true,
  },
  {
    key: "q3c",
    domain: "PF",
    text: "提或攜帶購物袋",
    sub: "Lifting or carrying groceries",
    options: [
      { label: "不受限", value: 1 },
      { label: "受限一點", value: 2 },
      { label: "受限很大", value: 3 },
    ],
    reverse: true,
  },
  {
    key: "q3d",
    domain: "PF",
    text: "爬幾層樓梯",
    sub: "Climbing several flights of stairs",
    options: [
      { label: "不受限", value: 1 },
      { label: "受限一點", value: 2 },
      { label: "受限很大", value: 3 },
    ],
    reverse: true,
  },
  {
    key: "q3e",
    domain: "PF",
    text: "爬一層樓梯",
    sub: "Climbing one flight of stairs",
    options: [
      { label: "不受限", value: 1 },
      { label: "受限一點", value: 2 },
      { label: "受限很大", value: 3 },
    ],
    reverse: true,
  },
  {
    key: "q3f",
    domain: "PF",
    text: "彎腰、跪下或蹲下",
    sub: "Bending, kneeling, or stooping",
    options: [
      { label: "不受限", value: 1 },
      { label: "受限一點", value: 2 },
      { label: "受限很大", value: 3 },
    ],
    reverse: true,
  },
  {
    key: "q3g",
    domain: "PF",
    text: "步行超過1.5公里",
    sub: "Walking more than a mile",
    options: [
      { label: "不受限", value: 1 },
      { label: "受限一點", value: 2 },
      { label: "受限很大", value: 3 },
    ],
    reverse: true,
  },
  {
    key: "q3h",
    domain: "PF",
    text: "步行幾個街口",
    sub: "Walking several blocks",
    options: [
      { label: "不受限", value: 1 },
      { label: "受限一點", value: 2 },
      { label: "受限很大", value: 3 },
    ],
    reverse: true,
  },
  {
    key: "q3i",
    domain: "PF",
    text: "步行一個街口",
    sub: "Walking one block",
    options: [
      { label: "不受限", value: 1 },
      { label: "受限一點", value: 2 },
      { label: "受限很大", value: 3 },
    ],
    reverse: true,
  },
  {
    key: "q3j",
    domain: "PF",
    text: "自己洗澡或穿衣",
    sub: "Bathing or dressing yourself",
    options: [
      { label: "不受限", value: 1 },
      { label: "受限一點", value: 2 },
      { label: "受限很大", value: 3 },
    ],
    reverse: true,
  },
  // Q4a–Q4d — Role Physical (RP)
  {
    key: "q4a",
    domain: "RP",
    text: "在過去4週內，您在工作或日常活動上，因為身體健康而減少了工作量",
    sub: "Cut down time due to physical health",
    options: [
      { label: "否", value: 1 },
      { label: "是", value: 2 },
    ],
    reverse: true,
  },
  {
    key: "q4b",
    domain: "RP",
    text: "在過去4週內，您完成的工作比您想要完成的少，因為身體健康",
    sub: "Accomplished less due to physical health",
    options: [
      { label: "否", value: 1 },
      { label: "是", value: 2 },
    ],
    reverse: true,
  },
  {
    key: "q4c",
    domain: "RP",
    text: "在過去4週內，您受限於某些工作或活動的種類，因為身體健康",
    sub: "Limited in kind of work due to physical health",
    options: [
      { label: "否", value: 1 },
      { label: "是", value: 2 },
    ],
    reverse: true,
  },
  {
    key: "q4d",
    domain: "RP",
    text: "在過去4週內，您在完成工作或其他活動時有困難，因為身體健康",
    sub: "Had difficulty performing due to physical health",
    options: [
      { label: "否", value: 1 },
      { label: "是", value: 2 },
    ],
    reverse: true,
  },
  // Q5a–Q5c — Role Emotional (RE)
  {
    key: "q5a",
    domain: "RE",
    text: "在過去4週內，您減少了工作或活動時間，因為情緒問題（如感到沮喪或焦慮）",
    sub: "Cut down time due to emotional problems",
    options: [
      { label: "否", value: 1 },
      { label: "是", value: 2 },
    ],
    reverse: true,
  },
  {
    key: "q5b",
    domain: "RE",
    text: "在過去4週內，您完成的工作比您想要完成的少，因為情緒問題",
    sub: "Accomplished less due to emotional problems",
    options: [
      { label: "否", value: 1 },
      { label: "是", value: 2 },
    ],
    reverse: true,
  },
  {
    key: "q5c",
    domain: "RE",
    text: "在過去4週內，您在工作或其他活動時不如往常謹慎，因為情緒問題",
    sub: "Did not work as carefully due to emotional problems",
    options: [
      { label: "否", value: 1 },
      { label: "是", value: 2 },
    ],
    reverse: true,
  },
  // Q6 — Social Functioning (SF)
  {
    key: "q6",
    domain: "SF",
    text: "在過去4週內，您的身體健康或情緒問題，在多大程度上影響了您與家人、朋友、鄰居或其他社會團體的正常社交活動？",
    sub: "Extent health interfered with social activities",
    options: [
      { label: "完全沒有", value: 1 },
      { label: "輕微", value: 2 },
      { label: "中等程度", value: 3 },
      { label: "相當程度", value: 4 },
      { label: "極大程度", value: 5 },
    ],
    reverse: true,
  },
  // Q7 — Bodily Pain (BP)
  {
    key: "q7",
    domain: "BP",
    text: "在過去4週內，您的身體有多少疼痛？",
    sub: "Bodily pain intensity",
    options: [
      { label: "完全沒有", value: 1 },
      { label: "非常輕微", value: 2 },
      { label: "輕微", value: 3 },
      { label: "中等程度", value: 4 },
      { label: "嚴重", value: 5 },
      { label: "非常嚴重", value: 6 },
    ],
    reverse: true,
  },
  // Q8 — Bodily Pain (BP)
  {
    key: "q8",
    domain: "BP",
    text: "在過去4週內，疼痛影響您的工作（包括在家中的工作）到何種程度？",
    sub: "Pain interference with work",
    options: [
      { label: "完全沒有", value: 1 },
      { label: "輕微", value: 2 },
      { label: "中等程度", value: 3 },
      { label: "相當程度", value: 4 },
      { label: "極大程度", value: 5 },
    ],
    reverse: true,
  },
  // Q9a–Q9i — Vitality (VT) + Mental Health (MH) + Social Functioning (SF)
  {
    key: "q9a",
    domain: "VT",
    text: "在過去4週內，您是否覺得充滿活力？",
    sub: "Feel full of pep / vitality",
    options: [
      { label: "一直", value: 1 },
      { label: "大部分時間", value: 2 },
      { label: "相當時間", value: 3 },
      { label: "有時", value: 4 },
      { label: "偶爾", value: 5 },
      { label: "從不", value: 6 },
    ],
    reverse: true,
  },
  {
    key: "q9b",
    domain: "MH",
    text: "在過去4週內，您是否覺得非常緊張？",
    sub: "Been a nervous person",
    options: [
      { label: "從不", value: 1 },
      { label: "偶爾", value: 2 },
      { label: "有時", value: 3 },
      { label: "相當時間", value: 4 },
      { label: "大部分時間", value: 5 },
      { label: "一直", value: 6 },
    ],
    reverse: true,
  },
  {
    key: "q9c",
    domain: "MH",
    text: "在過去4週內，您是否感到心情低落，沒有什麼事能讓您開心？",
    sub: "Felt downhearted and blue",
    options: [
      { label: "從不", value: 1 },
      { label: "偶爾", value: 2 },
      { label: "有時", value: 3 },
      { label: "相當時間", value: 4 },
      { label: "大部分時間", value: 5 },
      { label: "一直", value: 6 },
    ],
    reverse: true,
  },
  {
    key: "q9d",
    domain: "SF",
    text: "在過去4週內，您是否感到平靜與安詳？",
    sub: "Felt calm and peaceful",
    options: [
      { label: "一直", value: 1 },
      { label: "大部分時間", value: 2 },
      { label: "相當時間", value: 3 },
      { label: "有時", value: 4 },
      { label: "偶爾", value: 5 },
      { label: "從不", value: 6 },
    ],
    reverse: true,
  },
  {
    key: "q9e",
    domain: "VT",
    text: "在過去4週內，您是否擁有充沛的精力？",
    sub: "Have a lot of energy",
    options: [
      { label: "一直", value: 1 },
      { label: "大部分時間", value: 2 },
      { label: "相當時間", value: 3 },
      { label: "有時", value: 4 },
      { label: "偶爾", value: 5 },
      { label: "從不", value: 6 },
    ],
    reverse: true,
  },
  {
    key: "q9f",
    domain: "MH",
    text: "在過去4週內，您是否感到心情低落和憂鬱？",
    sub: "Felt downhearted and depressed",
    options: [
      { label: "從不", value: 1 },
      { label: "偶爾", value: 2 },
      { label: "有時", value: 3 },
      { label: "相當時間", value: 4 },
      { label: "大部分時間", value: 5 },
      { label: "一直", value: 6 },
    ],
    reverse: true,
  },
  {
    key: "q9g",
    domain: "SF",
    text: "在過去4週內，您是否感到精疲力竭？",
    sub: "Felt worn out",
    options: [
      { label: "從不", value: 1 },
      { label: "偶爾", value: 2 },
      { label: "有時", value: 3 },
      { label: "相當時間", value: 4 },
      { label: "大部分時間", value: 5 },
      { label: "一直", value: 6 },
    ],
    reverse: true,
  },
  {
    key: "q9h",
    domain: "MH",
    text: "在過去4週內，您是否覺得快樂？",
    sub: "Been a happy person",
    options: [
      { label: "一直", value: 1 },
      { label: "大部分時間", value: 2 },
      { label: "相當時間", value: 3 },
      { label: "有時", value: 4 },
      { label: "偶爾", value: 5 },
      { label: "從不", value: 6 },
    ],
    reverse: true,
  },
  {
    key: "q9i",
    domain: "VT",
    text: "在過去4週內，您是否感到疲倦？",
    sub: "Felt tired",
    options: [
      { label: "從不", value: 1 },
      { label: "偶爾", value: 2 },
      { label: "有時", value: 3 },
      { label: "相當時間", value: 4 },
      { label: "大部分時間", value: 5 },
      { label: "一直", value: 6 },
    ],
    reverse: true,
  },
  {
    key: "q10",
    domain: "SF",
    text: "在過去4週內，您的身體健康或情緒問題，干擾您的社交活動（如探訪朋友、親戚等）有多頻繁？",
    sub: "Frequency social activities interfered",
    options: [
      { label: "從不", value: 1 },
      { label: "偶爾", value: 2 },
      { label: "有時", value: 3 },
      { label: "大部分時間", value: 4 },
      { label: "一直", value: 5 },
    ],
    reverse: true,
  },
  // Q11a–Q11d — General Health (GH)
  {
    key: "q11a",
    domain: "GH",
    text: "我好像比別人更容易生病",
    sub: "I seem to get sick a little easier",
    options: [
      { label: "非常不正確", value: 1 },
      { label: "大部分不正確", value: 2 },
      { label: "不確定", value: 3 },
      { label: "大部分正確", value: 4 },
      { label: "非常正確", value: 5 },
    ],
    reverse: true,
  },
  {
    key: "q11b",
    domain: "GH",
    text: "我和我認識的任何人一樣健康",
    sub: "I am as healthy as anybody I know",
    options: [
      { label: "非常正確", value: 1 },
      { label: "大部分正確", value: 2 },
      { label: "不確定", value: 3 },
      { label: "大部分不正確", value: 4 },
      { label: "非常不正確", value: 5 },
    ],
    reverse: true,
  },
  {
    key: "q11c",
    domain: "GH",
    text: "我預期我的健康會變差",
    sub: "I expect my health to get worse",
    options: [
      { label: "非常不正確", value: 1 },
      { label: "大部分不正確", value: 2 },
      { label: "不確定", value: 3 },
      { label: "大部分正確", value: 4 },
      { label: "非常正確", value: 5 },
    ],
    reverse: true,
  },
  {
    key: "q11d",
    domain: "GH",
    text: "我的健康狀況非常好",
    sub: "My health is excellent",
    options: [
      { label: "非常正確", value: 1 },
      { label: "大部分正確", value: 2 },
      { label: "不確定", value: 3 },
      { label: "大部分不正確", value: 4 },
      { label: "非常不正確", value: 5 },
    ],
    reverse: true,
  },
];

// ── Domain definitions ────────────────────────────────────────────
const domainDefs: Record<
  string,
  { name: string; sub: string; group: "PCS" | "MCS" | "HT" }
> = {
  PF: { name: "身體功能", sub: "Physical Functioning", group: "PCS" },
  RP: { name: "生理角色功能", sub: "Role–Physical", group: "PCS" },
  BP: { name: "身體疼痛", sub: "Bodily Pain", group: "PCS" },
  GH: { name: "整體健康", sub: "General Health", group: "PCS" },
  VT: { name: "活力", sub: "Vitality", group: "MCS" },
  SF: { name: "社會功能", sub: "Social Functioning", group: "MCS" },
  RE: { name: "情緒角色功能", sub: "Role–Emotional", group: "MCS" },
  MH: { name: "心理健康", sub: "Mental Health", group: "MCS" },
  HT: { name: "健康變化", sub: "Health Transition", group: "HT" },
};

const groups = [
  {
    key: "general",
    label: "整體健康評估",
    color: "general",
    icon: "🌡",
    domains: ["GH"],
    qkeys: ["q1", "q2", "q11a", "q11b", "q11c", "q11d"],
  },
  {
    key: "physical",
    label: "身體健康領域",
    color: "pcs",
    icon: "💪",
    domains: ["PF", "RP", "BP"],
    qkeys: [
      "q3a",
      "q3b",
      "q3c",
      "q3d",
      "q3e",
      "q3f",
      "q3g",
      "q3h",
      "q3i",
      "q3j",
      "q4a",
      "q4b",
      "q4c",
      "q4d",
      "q7",
      "q8",
    ],
  },
  {
    key: "mental",
    label: "心理健康領域",
    color: "mcs",
    icon: "🧘",
    domains: ["VT", "SF", "RE", "MH"],
    qkeys: [
      "q5a",
      "q5b",
      "q5c",
      "q6",
      "q9a",
      "q9b",
      "q9c",
      "q9d",
      "q9e",
      "q9f",
      "q9g",
      "q9h",
      "q9i",
      "q10",
    ],
  },
];

// ── State ─────────────────────────────────────────────────────────
const selections = ref<Record<string, number>>(
  Object.fromEntries(questions.map((q) => [q.key, -1])),
);

const showResults = ref(false);
const copied = ref(false);

// ── Scoring ───────────────────────────────────────────────────────
// SF-36 domain scores: transform raw to 0–100
// For each domain: collect items, recode if needed, average, scale to 0–100

function getRecoded(key: string): number | null {
  const q = questions.find((q) => q.key === key);
  if (!q) return null;
  const raw = selections.value[key];
  if (raw < 0) return null;

  const maxVal = Math.max(...q.options.map((o) => o.value));
  const minVal = Math.min(...q.options.map((o) => o.value));

  if (q.reverse) {
    // Reverse: higher raw = lower score
    return ((maxVal - raw) / (maxVal - minVal)) * 100;
  } else {
    // Direct: higher raw = higher score
    return ((raw - minVal) / (maxVal - minVal)) * 100;
  }
}

const domainScores = computed(() => {
  const scores: Record<string, number | null> = {};
  const domains = ["PF", "RP", "BP", "GH", "VT", "SF", "RE", "MH", "HT"];

  domains.forEach((domain) => {
    const domainQs = questions.filter((q) => q.domain === domain);
    const recoded = domainQs.map((q) => getRecoded(q.key));
    if (recoded.some((v) => v === null)) {
      scores[domain] = null;
    } else {
      const avg = recoded.reduce((s, v) => s! + v!, 0)! / recoded.length;
      scores[domain] = Math.round(avg);
    }
  });
  return scores;
});

const pcsScore = computed(() => {
  const pcs = ["PF", "RP", "BP", "GH"].map((d) => domainScores.value[d]);
  if (pcs.some((v) => v === null)) return null;
  return Math.round(pcs.reduce((s, v) => s! + v!, 0)! / 4);
});

const mcsScore = computed(() => {
  const mcs = ["VT", "SF", "RE", "MH"].map((d) => domainScores.value[d]);
  if (mcs.some((v) => v === null)) return null;
  return Math.round(mcs.reduce((s, v) => s! + v!, 0)! / 4);
});

const answeredCount = computed(
  () => questions.filter((q) => selections.value[q.key] >= 0).length,
);

const isComplete = computed(() => answeredCount.value === 36);

const groupAnswered = (g: (typeof groups)[0]) =>
  g.qkeys.filter((k) => selections.value[k] >= 0).length;

// ── Display helpers ───────────────────────────────────────────────
function scoreColor(score: number | null) {
  if (score === null) return "unset";
  if (score >= 75) return "good";
  if (score >= 50) return "fair";
  if (score >= 25) return "poor";
  return "bad";
}

function optClass(q: (typeof questions)[0], v: number) {
  const maxVal = Math.max(...q.options.map((o) => o.value));
  const goodness = (maxVal - v) / (maxVal - 1);
  const idx = Math.round(goodness * 5);
  return "s" + Math.min(5, Math.max(0, idx));
}

function generateMarkdown() {
  const domainLines = Object.entries(domainDefs)
    .filter(([k]) => k !== "HT")
    .map(([k, d]) => {
      const s = domainScores.value[k];
      return `- **${d.name}**（${d.sub}）：${s !== null ? s + " / 100" : "未完成"}`;
    })
    .join("\n");

  return `# SF-36 健康狀況調查評估結果

## 各領域分數

${domainLines}

## 綜合指標

- **身體健康總分（PCS）**：${pcsScore.value !== null ? pcsScore.value + " / 100" : "未完成"}
- **心理健康總分（MCS）**：${mcsScore.value !== null ? mcsScore.value + " / 100" : "未完成"}
- **健康變化**：${domainScores.value["HT"] !== null ? domainScores.value["HT"] + " / 100" : "未完成"}

## 完成狀況

已完成 ${answeredCount.value}/36 題`;
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
  <div class="sf36assess">
    <div class="tab-bar">
      <button class="tab-btn active">
        <span class="tab-label">SF-36 健康狀況調查</span>
        <span class="tab-sub">36-Item Short Form Health Survey</span>
      </button>
    </div>
    <div class="sf36">
    <!-- Header -->
    <div class="sf36-header">
      <div class="header-title">
        <h2 class="title">SF-36 健康狀況調查</h2>
        <p class="subtitle">
          36-Item Short Form Health Survey · 過去四週的健康感受
        </p>
      </div>
      <div class="summary-badges">
        <div class="score-badge" :class="scoreColor(pcsScore)">
          <span class="score-number">{{ pcsScore ?? "—" }}</span>
          <span class="score-label">PCS 身體</span>
        </div>
        <div class="score-badge" :class="scoreColor(mcsScore)">
          <span class="score-number">{{ mcsScore ?? "—" }}</span>
          <span class="score-label">MCS 心理</span>
        </div>
      </div>
    </div>

    <!-- Progress bar -->
    <div class="severity-bar-wrap">
      <div class="severity-bar">
        <div
          class="severity-fill progress-fill"
          :style="{ width: (answeredCount / 36) * 100 + '%' }"
        />
      </div>
      <div class="severity-ticks">
        <span>已完成 {{ answeredCount }}/36 題</span>
        <span v-if="isComplete" class="tick-complete">✓ 完成</span>
      </div>
    </div>

    <!-- Intro -->
    <div class="intro-bar">
      <span class="intro-dot">◉</span>
      <span
        >請依據<strong>過去四週</strong>的健康狀況與感受作答。SF-36 共 36
        題，分數越高代表健康狀況越好（0–100 分）。</span
      >
    </div>

    <!-- Domain score preview -->
    <div class="domain-preview">
      <div
        v-for="(def, key) in domainDefs"
        :key="key"
        v-if="key !== 'HT'"
        class="domain-chip"
      >
        <span class="chip-label">{{ def.name }}</span>
        <span
          class="chip-score"
          :class="scoreColor(domainScores[key as string])"
        >
          {{
            domainScores[key as string] !== null
              ? domainScores[key as string]
              : "—"
          }}
        </span>
        <span class="chip-group" :class="def.group === 'PCS' ? 'pcs' : 'mcs'">{{
          def.group
        }}</span>
      </div>
    </div>

    <!-- Question groups -->
    <div v-for="group in groups" :key="group.key" class="sf36-group">
      <div class="group-header-bar" :class="group.color + '-bar'">
        <div class="group-label-block">
          <span class="group-icon">{{ group.icon }}</span>
          <div class="group-text-block">
            <span class="group-label">{{ group.label }}</span>
            <span class="group-sub">{{
              group.domains.map((d) => domainDefs[d].sub).join(" · ")
            }}</span>
          </div>
        </div>
        <div class="group-score-pill" :class="group.color + '-pill'">
          {{ groupAnswered(group) }}/{{ group.qkeys.length }}
        </div>
      </div>

      <div class="item-list">
        <div
          v-for="q in questions.filter((q) => group.qkeys.includes(q.key))"
          :key="q.key"
          class="sf36-item"
          :class="{
            answered: selections[q.key] >= 0,
            [group.color + '-answered']: selections[q.key] >= 0,
          }"
        >
          <div class="item-header">
            <div class="item-name-block">
              <span class="item-name">{{ q.text }}</span>
              <span class="item-sub"
                >{{ q.sub }} ·
                <span class="domain-tag" :class="q.domain.toLowerCase()">{{
                  domainDefs[q.domain]?.name
                }}</span></span
              >
            </div>
            <span
              class="item-score"
              :class="{ unanswered: selections[q.key] < 0 }"
            >
              {{ selections[q.key] >= 0 ? selections[q.key] : "—" }}
            </span>
          </div>

          <div class="sec-options">
            <label
              v-for="opt in q.options"
              :key="opt.value"
              class="sec-opt"
              :class="{ 'opt-selected': selections[q.key] === opt.value }"
            >
              <input
                type="radio"
                :name="q.key"
                :value="opt.value"
                v-model="selections[q.key]"
              />
              <div
                class="opt-radio"
                :class="{ selected: selections[q.key] === opt.value }"
              >
                <div class="opt-dot" v-if="selections[q.key] === opt.value" />
              </div>
              <div class="opt-content">
                <span class="opt-score-badge">{{ opt.value }}</span>
                <span class="opt-text">{{ opt.label }}</span>
              </div>
            </label>
          </div>
        </div>
      </div>
    </div>

    <!-- Result card -->
    <div class="sf36-result">
      <div class="result-summary">
        <div class="result-component pcs-card">
          <div class="rc-label">身體健康總分（PCS）</div>
          <div class="rc-score" :class="scoreColor(pcsScore)">
            {{ pcsScore ?? "—" }}<span class="rc-max">/100</span>
          </div>
          <div class="rc-domains">
            <span
              v-for="d in ['PF', 'RP', 'BP', 'GH']"
              :key="d"
              class="rc-domain-pill"
            >
              {{ domainDefs[d].name }}：{{ domainScores[d] ?? "—" }}
            </span>
          </div>
        </div>
        <div class="result-component mcs-card">
          <div class="rc-label">心理健康總分（MCS）</div>
          <div class="rc-score" :class="scoreColor(mcsScore)">
            {{ mcsScore ?? "—" }}<span class="rc-max">/100</span>
          </div>
          <div class="rc-domains">
            <span
              v-for="d in ['VT', 'SF', 'RE', 'MH']"
              :key="d"
              class="rc-domain-pill"
            >
              {{ domainDefs[d].name }}：{{ domainScores[d] ?? "—" }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- Results detail -->
    <div v-if="showResults" class="results-detail">
      <div class="results-header">各領域評分明細</div>
      <div
        v-for="(def, key) in domainDefs"
        :key="key"
        v-if="key !== 'HT'"
        class="detail-row"
      >
        <span class="detail-domain">{{ def.name }}</span>
        <span
          class="detail-score"
          :class="scoreColor(domainScores[key as string])"
        >
          {{
            domainScores[key as string] !== null
              ? domainScores[key as string] + " / 100"
              : "未完成"
          }}
        </span>
        <span class="detail-desc">{{ def.sub }} · {{ def.group }}</span>
      </div>
      <div class="detail-row">
        <span class="detail-domain">健康變化</span>
        <span class="detail-score">{{
          domainScores["HT"] !== null ? domainScores["HT"] + " / 100" : "未完成"
        }}</span>
        <span class="detail-desc"
          >Health Transition（不納入 PCS/MCS 計算）</span
        >
      </div>
    </div>

    <!-- Actions -->
    <div class="sf36-actions">
      <button class="btn-view" @click="showResults = !showResults">
        {{ showResults ? "收起明細" : "查看評估結果" }}
      </button>
      <button class="btn-copy" @click="copyMarkdown">
        {{ copied ? "已複製 ✓" : "複製 Markdown 結果" }}
      </button>
      <button class="btn-reset" @click="reset">重置</button>
    </div>
    <p v-if="!isComplete" class="progress-hint">
      已完成 {{ answeredCount }}/36 題，尚餘 {{ 36 - answeredCount }} 題
    </p>
    </div>
  </div>
</template>

<style scoped>
.sf36 {
  max-width: 780px;
  margin: 0 auto;
  padding: 2rem 0 3rem;
  font-size: 0.9rem;
}

/* ── Header ────────────────────────────────────────────────────── */
.sf36-header {
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

.summary-badges {
  display: flex;
  gap: 0.5rem;
}

.score-badge {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 110px;
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

.score-badge.unset {
  color: var(--vp-c-text-3);
}
.score-badge.good {
  border-color: #22c55e;
  color: #22c55e;
  box-shadow:
    0 0 0 1px rgba(34, 197, 94, 0.08),
    0 1px 3px rgba(0, 0, 0, 0.04);
}
.score-badge.fair {
  border-color: #f59e0b;
  color: #f59e0b;
  box-shadow:
    0 0 0 1px rgba(245, 158, 11, 0.08),
    0 1px 3px rgba(0, 0, 0, 0.04);
}
.score-badge.poor {
  border-color: #f97316;
  color: #f97316;
  box-shadow:
    0 0 0 1px rgba(249, 115, 22, 0.08),
    0 1px 3px rgba(0, 0, 0, 0.04);
}
.score-badge.bad {
  border-color: #ef4444;
  color: #ef4444;
  box-shadow:
    0 0 0 1px rgba(239, 68, 68, 0.08),
    0 1px 3px rgba(0, 0, 0, 0.04);
}

/* ── Progress bar ──────────────────────────────────────────────── */
.severity-bar-wrap {
  margin-bottom: 1.5rem;
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
  transition: width 0.5s cubic-bezier(0.22, 1, 0.36, 1);
}
.progress-fill {
  background: linear-gradient(90deg, var(--vp-c-brand-1), #4f46e5);
}

.severity-ticks {
  display: flex;
  justify-content: space-between;
  font-size: 0.68rem;
  color: var(--vp-c-text-3);
}
.tick-complete {
  color: #22c55e;
  font-weight: 700;
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
  margin-bottom: 1.25rem;
  line-height: 1.6;
}
.intro-dot {
  color: var(--vp-c-brand-1);
  flex-shrink: 0;
}

/* ── Domain preview ────────────────────────────────────────────── */
.domain-preview {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
}

.domain-chip {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px;
  border-radius: 8px;
  border: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg-soft);
}

.chip-label {
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--vp-c-text-1);
}

.chip-score {
  font-size: 0.82rem;
  font-weight: 800;
}
.chip-score.unset {
  color: var(--vp-c-text-3);
}
.chip-score.good {
  color: #22c55e;
}
.chip-score.fair {
  color: #f59e0b;
}
.chip-score.poor {
  color: #f97316;
}
.chip-score.bad {
  color: #ef4444;
}

.chip-group {
  font-size: 0.6rem;
  font-weight: 700;
  padding: 1px 5px;
  border-radius: 4px;
}
.chip-group.pcs {
  background: rgba(99, 102, 241, 0.12);
  color: #6366f1;
}
.chip-group.mcs {
  background: rgba(20, 184, 166, 0.12);
  color: #14b8a6;
}

/* ── Group ─────────────────────────────────────────────────────── */
.sf36-group {
  margin-bottom: 1.75rem;
}

.group-header-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  margin-bottom: 0.5rem;
  padding: 0.65rem 0.85rem 0.65rem 1rem;
  border-radius: 10px;
  border: 1px solid var(--vp-c-divider);
  border-left: 4px solid;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
}
.group-header-bar.general-bar {
  background: linear-gradient(
    135deg,
    rgba(245, 158, 11, 0.08),
    var(--vp-c-bg-mute),
    var(--vp-c-bg-soft)
  );
  border-left-color: #f59e0b;
}
.group-header-bar.pcs-bar {
  background: linear-gradient(
    135deg,
    rgba(99, 102, 241, 0.08),
    var(--vp-c-bg-mute),
    var(--vp-c-bg-soft)
  );
  border-left-color: #6366f1;
}
.group-header-bar.mcs-bar {
  background: linear-gradient(
    135deg,
    rgba(20, 184, 166, 0.08),
    var(--vp-c-bg-mute),
    var(--vp-c-bg-soft)
  );
  border-left-color: #14b8a6;
}

.group-label-block {
  display: flex;
  align-items: center;
  gap: 0.6rem;
}
.group-icon {
  font-size: 1rem;
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
  white-space: nowrap;
  flex-shrink: 0;
}
.general-pill {
  border: 1px solid rgba(245, 158, 11, 0.25);
  color: #f59e0b;
  background: rgba(245, 158, 11, 0.06);
}
.pcs-pill {
  border: 1px solid rgba(99, 102, 241, 0.25);
  color: #6366f1;
  background: rgba(99, 102, 241, 0.06);
}
.mcs-pill {
  border: 1px solid rgba(20, 184, 166, 0.25);
  color: #14b8a6;
  background: rgba(20, 184, 166, 0.06);
}

/* ── Item ──────────────────────────────────────────────────────── */
.item-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.sf36-item {
  border: 1px solid var(--vp-c-divider);
  border-radius: 10px;
  background: var(--vp-c-bg-soft);
  overflow: hidden;
  transition: all 0.25s;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.03);
}
.sf36-item:hover {
  box-shadow: 0 3px 12px rgba(0, 0, 0, 0.06);
}
.sf36-item.general-answered {
  border-color: rgba(245, 158, 11, 0.3);
  background: linear-gradient(135deg, rgba(245, 158, 11, 0.04), transparent);
}
.sf36-item.pcs-answered {
  border-color: rgba(99, 102, 241, 0.3);
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.04), transparent);
}
.sf36-item.mcs-answered {
  border-color: rgba(20, 184, 166, 0.3);
  background: linear-gradient(135deg, rgba(20, 184, 166, 0.04), transparent);
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

.item-name-block {
  display: flex;
  flex-direction: column;
  gap: 2px;
  flex: 1;
}
.item-name {
  font-size: 0.83rem;
  font-weight: 600;
  color: var(--vp-c-text-1);
  line-height: 1.4;
}
.item-sub {
  font-size: 0.68rem;
  color: var(--vp-c-text-3);
}

.domain-tag {
  font-weight: 700;
  font-size: 0.68rem;
  padding: 1px 5px;
  border-radius: 4px;
  background: var(--vp-c-bg);
  border: 1px solid var(--vp-c-divider);
  color: var(--vp-c-text-2);
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
.item-score.unanswered {
  color: var(--vp-c-text-3);
  border-color: var(--vp-c-divider);
  background: transparent;
}

/* ── Option row ────────────────────────────────────────────────── */
.option-row {
  display: grid;
  grid-template-columns: repeat(var(--cols, 3), 1fr);
  gap: 2px;
  padding: 3px;
  background: var(--vp-c-bg-mute);
}

.opt-pill {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 0.6rem 0.15rem;
  cursor: pointer;
  transition: all 0.2s;
  text-align: center;
  gap: 4px;
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

/* s0–s5 per-value pill colors (reversed: low value = worse = red) */
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

.opt-pill.s1 {
  border-color: rgba(249, 115, 22, 0.15);
}
.opt-pill.s1:hover:not(.active),
.opt-pill.s1:focus-within {
  border-color: rgba(249, 115, 22, 0.35);
  background: rgba(249, 115, 22, 0.04);
}
.opt-pill.s1.active {
  border-color: #f97316;
  background: linear-gradient(
    180deg,
    rgba(249, 115, 22, 0.12),
    rgba(249, 115, 22, 0.06)
  );
  box-shadow: 0 0 0 1px rgba(249, 115, 22, 0.08);
}

.opt-pill.s2 {
  border-color: rgba(245, 158, 11, 0.15);
}
.opt-pill.s2:hover:not(.active),
.opt-pill.s2:focus-within {
  border-color: rgba(245, 158, 11, 0.35);
  background: rgba(245, 158, 11, 0.04);
}
.opt-pill.s2.active {
  border-color: #f59e0b;
  background: linear-gradient(
    180deg,
    rgba(245, 158, 11, 0.12),
    rgba(245, 158, 11, 0.06)
  );
  box-shadow: 0 0 0 1px rgba(245, 158, 11, 0.08);
}

.opt-pill.s3 {
  border-color: rgba(234, 179, 8, 0.15);
}
.opt-pill.s3:hover:not(.active),
.opt-pill.s3:focus-within {
  border-color: rgba(234, 179, 8, 0.35);
  background: rgba(234, 179, 8, 0.04);
}
.opt-pill.s3.active {
  border-color: #eab308;
  background: linear-gradient(
    180deg,
    rgba(234, 179, 8, 0.12),
    rgba(234, 179, 8, 0.06)
  );
  box-shadow: 0 0 0 1px rgba(234, 179, 8, 0.08);
}

.opt-pill.s4 {
  border-color: rgba(132, 204, 22, 0.15);
}
.opt-pill.s4:hover:not(.active),
.opt-pill.s4:focus-within {
  border-color: rgba(132, 204, 22, 0.35);
  background: rgba(132, 204, 22, 0.04);
}
.opt-pill.s4.active {
  border-color: #84cc16;
  background: linear-gradient(
    180deg,
    rgba(132, 204, 22, 0.12),
    rgba(132, 204, 22, 0.06)
  );
  box-shadow: 0 0 0 1px rgba(132, 204, 22, 0.08);
}

.opt-pill.s5 {
  border-color: rgba(34, 197, 94, 0.15);
}
.opt-pill.s5:hover:not(.active),
.opt-pill.s5:focus-within {
  border-color: rgba(34, 197, 94, 0.35);
  background: rgba(34, 197, 94, 0.04);
}
.opt-pill.s5.active {
  border-color: #22c55e;
  background: linear-gradient(
    180deg,
    rgba(34, 197, 94, 0.12),
    rgba(34, 197, 94, 0.06)
  );
  box-shadow: 0 0 0 1px rgba(34, 197, 94, 0.08);
}

/* ── opt-num ──────────────────────────────────────────────────── */
.opt-num {
  font-size: 1rem;
  font-weight: 900;
  transition: color 0.2s;
}
.opt-pill.s0 .opt-num {
  color: rgba(239, 68, 68, 0.5);
}
.opt-pill.s0.active .opt-num {
  color: #ef4444;
}
.opt-pill.s1 .opt-num {
  color: rgba(249, 115, 22, 0.5);
}
.opt-pill.s1.active .opt-num {
  color: #f97316;
}
.opt-pill.s2 .opt-num {
  color: rgba(245, 158, 11, 0.5);
}
.opt-pill.s2.active .opt-num {
  color: #f59e0b;
}
.opt-pill.s3 .opt-num {
  color: rgba(234, 179, 8, 0.5);
}
.opt-pill.s3.active .opt-num {
  color: #eab308;
}
.opt-pill.s4 .opt-num {
  color: rgba(132, 204, 22, 0.5);
}
.opt-pill.s4.active .opt-num {
  color: #84cc16;
}
.opt-pill.s5 .opt-num {
  color: rgba(34, 197, 94, 0.5);
}
.opt-pill.s5.active .opt-num {
  color: #22c55e;
}

/* ── opt-desc ─────────────────────────────────────────────────── */
.opt-desc {
  font-size: 0.7rem;
  font-weight: 700;
  line-height: 1.3;
  transition: color 0.2s;
}
.opt-pill.s0 .opt-desc {
  color: rgba(239, 68, 68, 0.4);
}
.opt-pill.s0.active .opt-desc {
  color: rgba(239, 68, 68, 0.7);
}
.opt-pill.s1 .opt-desc {
  color: rgba(249, 115, 22, 0.4);
}
.opt-pill.s1.active .opt-desc {
  color: rgba(249, 115, 22, 0.7);
}
.opt-pill.s2 .opt-desc {
  color: rgba(245, 158, 11, 0.4);
}
.opt-pill.s2.active .opt-desc {
  color: rgba(245, 158, 11, 0.7);
}
.opt-pill.s3 .opt-desc {
  color: rgba(234, 179, 8, 0.4);
}
.opt-pill.s3.active .opt-desc {
  color: rgba(234, 179, 8, 0.7);
}
.opt-pill.s4 .opt-desc {
  color: rgba(132, 204, 22, 0.4);
}
.opt-pill.s4.active .opt-desc {
  color: rgba(132, 204, 22, 0.7);
}
.opt-pill.s5 .opt-desc {
  color: rgba(34, 197, 94, 0.4);
}
.opt-pill.s5.active .opt-desc {
  color: rgba(34, 197, 94, 0.7);
}

/* ── Result card ───────────────────────────────────────────────── */
.sf36-result {
  margin-bottom: 1rem;
}

.result-summary {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.75rem;
}

.result-component {
  padding: 1.25rem;
  border-radius: 14px;
  border: 1px solid var(--vp-c-divider);
  background: linear-gradient(135deg, var(--vp-c-bg-soft), var(--vp-c-bg-mute));
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  box-shadow:
    0 0 0 1px rgba(99, 102, 241, 0.06),
    0 1px 3px rgba(0, 0, 0, 0.04);
}
.pcs-card {
  border-color: rgba(99, 102, 241, 0.3);
}
.mcs-card {
  border-color: rgba(20, 184, 166, 0.3);
}

.rc-label {
  font-size: 0.75rem;
  font-weight: 700;
  color: var(--vp-c-text-2);
}

.rc-score {
  font-size: 2.5rem;
  font-weight: 800;
  line-height: 1;
  color: var(--vp-c-text-3);
  transition: color 0.3s;
}
.rc-score.good {
  color: #22c55e;
}
.rc-score.fair {
  color: #f59e0b;
}
.rc-score.poor {
  color: #f97316;
}
.rc-score.bad {
  color: #ef4444;
}

.rc-max {
  font-size: 0.9rem;
  color: var(--vp-c-text-3);
  margin-left: 2px;
}

.rc-domains {
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.rc-domain-pill {
  font-size: 0.72rem;
  color: var(--vp-c-text-2);
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

.detail-domain {
  font-size: 0.8rem;
  font-weight: 700;
  color: var(--vp-c-text-1);
  flex-shrink: 0;
  width: 100px;
}
.detail-score {
  font-size: 0.8rem;
  font-weight: 800;
  flex-shrink: 0;
  width: 72px;
  text-align: center;
}
.detail-score.good {
  color: #22c55e;
}
.detail-score.fair {
  color: #f59e0b;
}
.detail-score.poor {
  color: #f97316;
}
.detail-score.bad {
  color: #ef4444;
}
.detail-desc {
  font-size: 0.75rem;
  color: var(--vp-c-text-2);
  flex: 1;
}

/* ── Actions ───────────────────────────────────────────────────── */
.sf36-actions {
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

/* ── Mobile ────────────────────────────────────────────────────── */
@media (max-width: 640px) {
  .sf36-header {
    flex-direction: column;
  }
  .summary-badges {
    align-self: flex-start;
  }
  .score-badge {
    flex-direction: row;
    gap: 0.5rem;
  }
  .score-number {
    font-size: 1.5rem;
  }
  .result-summary {
    grid-template-columns: 1fr;
  }
  .option-row {
    grid-template-columns: repeat(var(--cols, 2), 1fr);
  }
  .detail-domain {
    width: 80px;
  }
}
/* ══ Single-tab bar wrapper ══ */
.sf36assess {
  max-width: 820px;
  margin: 0 auto;
}
.sf36assess > .tab-bar {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
  background: var(--vp-c-bg-mute);
  padding: 4px;
  border-radius: 10px;
  border: 1px solid var(--vp-c-divider);
}
.sf36assess > .tab-bar .tab-btn {
  flex: 1;
  padding: 0.65rem 1rem;
  background: transparent;
  border: 1.5px solid transparent;
  cursor: pointer;
  font-family: inherit;
  color: var(--vp-c-text-3);
  border-radius: 8px;
  transition: all 0.2s;
}
.sf36assess > .tab-bar .tab-btn.active {
  color: var(--vp-c-brand-1);
  background: color-mix(in srgb, var(--vp-c-brand-1) 12%, transparent);
  border-color: color-mix(in srgb, var(--vp-c-brand-1) 35%, transparent);
  box-shadow: 0 0 0 1px color-mix(in srgb, var(--vp-c-brand-1) 8%, transparent);
}
.sf36assess > .tab-bar .tab-label {
  display: block;
  font-size: 1rem;
  font-weight: 800;
  line-height: 1.3;
  letter-spacing: 0.02em;
}
.sf36assess > .tab-bar .tab-sub {
  display: block;
  font-size: 0.78rem;
  font-weight: 600;
  color: var(--vp-c-brand-1);
  opacity: 0.85;
  margin-top: 2px;
}
/* ══ Enlarged / rearranged score badges ══ */
.sf36 .summary-badges {
  display: flex;
  gap: 0.6rem;
}
.sf36 .score-badge {
  width: 104px !important;
  min-width: 104px !important;
  height: 96px !important;
  border-width: 1.5px;
}
.sf36 .score-badge .score-number {
  font-size: 2rem !important;
  font-weight: 800 !important;
}
.sf36 .score-badge .score-label {
  font-size: 0.72rem !important;
  font-weight: 700 !important;
  margin-top: 4px;
}
/* ══ Unified consensus font sizes ══ */
.sf36 .subtitle {
  font-size: 0.82rem !important;
  color: var(--vp-c-text-2) !important;
}
.sf36 .group-label-text {
  font-size: 0.92rem !important;
  font-weight: 800 !important;
}
.sf36 .item-name {
  font-size: 0.95rem !important;
  font-weight: 700 !important;
}
.sf36 .item-score {
  font-size: 1rem !important;
  font-weight: 800 !important;
}
.sf36 .results-header,
.sf36 .result-title {
  font-size: 0.74rem !important;
  font-weight: 700 !important;
}
</style>
