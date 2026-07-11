<script setup lang="ts">
import { ref, computed } from "vue";

const activeTab = ref<"ipss" | "cpsi">("ipss");

// ══════════════ IPSS 攝護腺症狀評分（International Prostate Symptom Score）══════════════

// ── IPSS — International Prostate Symptom Score ───────────────────
// Barry MJ et al. J Urol 1992;148:1549-1557. Public domain.
// 7 symptom questions (Q1-Q7), each scored 0-5
// + 1 quality-of-life question (Q8), scored 0-6, NOT added to IPSS
// Total IPSS: 0-35
// 0-7  = Mild    8-19 = Moderate    20-35 = Severe
// Q8 QoL: 0=Delighted → 6=Terrible

const questions = [
  {
    key: "q1",
    domain: "storage",
    shortLabel: "排尿不盡感",
    zh: "過去一個月，您是否有排尿後仍有膀胱未排空感覺？",
    en: "Incomplete emptying: Over the past month, how often have you had the sensation of not emptying your bladder completely after urinating?",
  },
  {
    key: "q2",
    domain: "storage",
    shortLabel: "頻尿",
    zh: "過去一個月，您是否在排尿後 2 小時內又需再次排尿？",
    en: "Frequency: Over the past month, how often have you had to urinate again less than two hours after you finished urinating?",
  },
  {
    key: "q3",
    domain: "voiding",
    shortLabel: "間歇性排尿",
    zh: "過去一個月，您是否有排尿時，尿流斷斷續續的情形？",
    en: "Intermittency: Over the past month, how often have you found you stopped and started again several times when urinating?",
  },
  {
    key: "q4",
    domain: "storage",
    shortLabel: "尿急感",
    zh: "過去一個月，您是否有難以延遲排尿的情形？",
    en: "Urgency: Over the past month, how difficult have you found it to postpone urination?",
  },
  {
    key: "q5",
    domain: "voiding",
    shortLabel: "尿流無力",
    zh: "過去一個月，您是否有排尿時尿流無力的情形？",
    en: "Weak stream: Over the past month, how often have you had a weak urinary stream?",
  },
  {
    key: "q6",
    domain: "voiding",
    shortLabel: "排尿費力",
    zh: "過去一個月，您是否有需要用力才能開始排尿的情形？",
    en: "Straining: Over the past month, how often have you had to push or strain to begin urination?",
  },
  {
    key: "q7",
    domain: "storage",
    shortLabel: "夜尿次數",
    zh: "過去一個月，您夜間從睡覺到早上起床，通常需要起床排尿幾次？",
    en: "Nocturia: Over the past month, how many times did you most typically get up to urinate from the time you went to bed until the time you got up in the morning?",
    isNocturia: true,
  },
];

// Frequency labels (Q1-Q6)
const freqLabels = [
  { val: 0, zh: "完全沒有", en: "Not at all" },
  { val: 1, zh: "少於 1/5 次", en: "< 1 time in 5" },
  { val: 2, zh: "少於一半次數", en: "< Half the time" },
  { val: 3, zh: "約一半次數", en: "About half the time" },
  { val: 4, zh: "超過一半次數", en: "> Half the time" },
  { val: 5, zh: "幾乎每次", en: "Almost always" },
];

// Nocturia labels (Q7)
const nocturiaLabels = [
  { val: 0, zh: "0 次（不需起床）", en: "None" },
  { val: 1, zh: "1 次", en: "1 time" },
  { val: 2, zh: "2 次", en: "2 times" },
  { val: 3, zh: "3 次", en: "3 times" },
  { val: 4, zh: "4 次", en: "4 times" },
  { val: 5, zh: "5 次以上", en: "5 or more times" },
];

// QoL labels (Q8)
const qolLabels = [
  { val: 0, zh: "非常滿意", en: "Delighted" },
  { val: 1, zh: "滿意", en: "Pleased" },
  { val: 2, zh: "大致滿意", en: "Mostly satisfied" },
  { val: 3, zh: "好壞各半", en: "Mixed" },
  { val: 4, zh: "不滿意", en: "Mostly dissatisfied" },
  { val: 5, zh: "難過", en: "Unhappy" },
  { val: 6, zh: "非常難過", en: "Terrible" },
];

const selections = ref<Record<string, number | null>>(
  Object.fromEntries(questions.map((q) => [q.key, null])),
);
const ipss_qolScore = ref<number | null>(null);
const ipss_copied = ref(false);
const ipss_showResults = ref(false);

const answeredCount = computed(
  () => questions.filter((q) => selections.value[q.key] !== null).length,
);
const ipss_isComplete = computed(() => answeredCount.value === 7);

const ipss_totalScore = computed(() =>
  ipss_isComplete.value
    ? questions.reduce((s, q) => s + (selections.value[q.key] ?? 0), 0)
    : null,
);

const storageDomain = computed(() =>
  ["q1", "q2", "q4", "q7"]
    .filter((k) => selections.value[k] !== null)
    .reduce((s, k) => s + (selections.value[k] ?? 0), 0),
);
const voidingDomain = computed(() =>
  ["q3", "q5", "q6"]
    .filter((k) => selections.value[k] !== null)
    .reduce((s, k) => s + (selections.value[k] ?? 0), 0),
);

const ipss_severity = computed(() => {
  const s = ipss_totalScore.value;
  if (s === null)
    return { level: "填寫中", color: "filling", advice: "", screen: false };
  if (s <= 7)
    return {
      level: "輕度（Mild）",
      color: "normal",
      advice:
        "IPSS 0–7：輕度下泌尿道症狀，可採觀察等待（Watchful waiting）或生活調整。",
      screen: false,
    };
  if (s <= 19)
    return {
      level: "中度（Moderate）",
      color: "moderate",
      advice:
        "IPSS 8–19：中度症狀，建議藥物治療（α 阻斷劑或 5α 還原酶抑制劑），評估影像及尿流動力學檢查。",
      screen: true,
    };
  return {
    level: "重度（Severe）",
    color: "critical",
    advice:
      "IPSS 20–35：重度症狀，建議泌尿科轉介，評估手術治療（TURP 或微創手術）指標。",
    screen: true,
  };
});

const ipss_barPct = computed(() =>
  ipss_totalScore.value !== null ? (ipss_totalScore.value / 35) * 100 : 0,
);

const qolSeverity = computed(() => {
  if (ipss_qolScore.value === null) return "";
  if (ipss_qolScore.value <= 1) return "可接受（Acceptable）";
  if (ipss_qolScore.value <= 3) return "尚可（Tolerable）";
  return "困擾（Bothersome）";
});

function ipss_generateMarkdown(): string {
  const rows = questions
    .map((q) => {
      const v = selections.value[q.key];
      return `- **Q${q.key.slice(1)}. ${q.shortLabel}**：${v !== null ? v + " 分" : "未填"}`;
    })
    .join("\n");
  return (
    `# IPSS 國際攝護腺症狀評分表\n\n` +
    `## 各題作答\n\n${rows}\n\n` +
    `---\n\n` +
    `## 計算結果\n\n` +
    `- **IPSS 總分**：${ipss_totalScore.value ?? "未完成"} / 35\n` +
    `- **症狀嚴重度**：${ipss_severity.value.level}\n` +
    `- **儲尿症狀小計（Q1,Q2,Q4,Q7）**：${storageDomain.value} 分\n` +
    `- **排尿症狀小計（Q3,Q5,Q6）**：${voidingDomain.value} 分\n` +
    (ipss_qolScore.value !== null
      ? `- **生活品質評分（Q8）**：${ipss_qolScore.value} 分（${qolSeverity.value}）\n`
      : "") +
    `\n**臨床建議**：${ipss_severity.value.advice}`
  );
}

async function ipss_copyOutput() {
  await navigator.clipboard.writeText(ipss_generateMarkdown());
  ipss_copied.value = true;
  setTimeout(() => (ipss_copied.value = false), 2000);
}

function ipss_reset() {
  questions.forEach((q) => {
    selections.value[q.key] = null;
  });
  ipss_qolScore.value = null;
  ipss_showResults.value = false;
}

// ══════════════ NIH-CPSI 慢性攝護腺炎（Chronic Prostatitis Symptom Index）══════════════

// ── NIH-CPSI — NIH Chronic Prostatitis Symptom Index ─────────────
// Litwin MS et al. J Urol 1999;162:369-375. Public domain.
// 3 domains:
//   Pain (Q1-Q4):       0-21 pts  (location×4 + frequency + severity)
//   Urinary (Q5-Q6):    0-10 pts
//   QoL impact (Q7-Q9): 0-12 pts
// Total: 0-43 pts
//
// Q1: pain location (4 check-all-that-apply, each 0 or 1) → 0-4
// Q2: ejaculatory pain (0 or 1)
// Q3: pain frequency (0-4)
// Q4: pain severity VAS (0-10)
// Q5: incomplete emptying (0-5)
// Q6: urinary frequency (0-5)
// Q7: interference with activities (0-3)
// Q8: thoughts about symptoms (0-3)
// Q9: QoL if symptoms stayed the same (0-6)

// Q1 pain locations (check all that apply, each worth 1 pt)
const q1Items = [
  {
    key: "q1a",
    zh: "會陰部（肛門與陰囊之間的區域）",
    en: "Perineum (area between rectum and testicles)",
  },
  { key: "q1b", zh: "睪丸", en: "Testicles" },
  {
    key: "q1c",
    zh: "陰莖前端（非排尿時）",
    en: "Tip of the penis (not related to urination)",
  },
  {
    key: "q1d",
    zh: "恥骨或膀胱區域",
    en: "Below your waist, in your pubic or bladder area",
  },
];

const q1Selections = ref<Record<string, boolean>>(
  Object.fromEntries(q1Items.map((i) => [i.key, false])),
);

// Q2 ejaculation pain (0=No, 1=Yes)
const q2 = ref<number | null>(null);

// Q3 pain frequency 0-4
const q3Labels = [
  { val: 0, zh: "從來沒有" },
  { val: 1, zh: "很少" },
  { val: 2, zh: "有時候" },
  { val: 3, zh: "常常" },
  { val: 4, zh: "總是" },
];
const q3 = ref<number | null>(null);

// Q4 pain severity 0-10 (NRS)
const q4 = ref<number | null>(null);

// Q5 incomplete emptying 0-5
const q5Labels = [
  { val: 0, zh: "完全沒有" },
  { val: 1, zh: "少於 1/5 次" },
  { val: 2, zh: "少於一半次數" },
  { val: 3, zh: "約一半次數" },
  { val: 4, zh: "超過一半次數" },
  { val: 5, zh: "幾乎每次" },
];
const q5 = ref<number | null>(null);

// Q6 urinary frequency (void < 2 hrs after last) 0-5
const q6 = ref<number | null>(null);

// Q7 interference with daily activities 0-3
const q7Labels = [
  { val: 0, zh: "完全沒有" },
  { val: 1, zh: "只有一點點" },
  { val: 2, zh: "有些" },
  { val: 3, zh: "很多" },
];
const q7 = ref<number | null>(null);

// Q8 how much do you think about symptoms 0-3
const q8 = ref<number | null>(null);

// Q9 QoL if symptoms stayed same 0-6
const q9Labels = [
  { val: 0, zh: "非常滿意（Delighted）" },
  { val: 1, zh: "滿意（Pleased）" },
  { val: 2, zh: "大致滿意（Mostly satisfied）" },
  { val: 3, zh: "好壞各半（Mixed）" },
  { val: 4, zh: "不滿意（Mostly dissatisfied）" },
  { val: 5, zh: "難過（Unhappy）" },
  { val: 6, zh: "非常難過（Terrible）" },
];
const q9 = ref<number | null>(null);

const cpsi_copied = ref(false);
const cpsi_showResults = ref(false);

// ── Domain scores ─────────────────────────────────────────────────
const q1Score = computed(
  () => Object.values(q1Selections.value).filter(Boolean).length,
);
const q1Done = computed(() => true); // always "done" (0 selected = 0 pts)

const painScore = computed((): number | null => {
  if (q2.value === null || q3.value === null || q4.value === null) return null;
  return q1Score.value + q2.value + q3.value + q4.value;
});

const urinaryScore = computed((): number | null => {
  if (q5.value === null || q6.value === null) return null;
  return q5.value + q6.value;
});

const cpsi_qolScore = computed((): number | null => {
  if (q7.value === null || q8.value === null || q9.value === null) return null;
  return q7.value + q8.value + q9.value;
});

const cpsi_totalScore = computed((): number | null => {
  if (
    painScore.value === null ||
    urinaryScore.value === null ||
    cpsi_qolScore.value === null
  )
    return null;
  return painScore.value + urinaryScore.value + cpsi_qolScore.value;
});

const answeredSections = computed(
  () =>
    [
      painScore.value !== null,
      urinaryScore.value !== null,
      cpsi_qolScore.value !== null,
    ].filter(Boolean).length,
);
const cpsi_isComplete = computed(() => cpsi_totalScore.value !== null);

// ── Interpretation ────────────────────────────────────────────────
const cpsi_severity = computed(() => {
  const s = cpsi_totalScore.value;
  if (s === null)
    return { level: "填寫中", color: "filling", advice: "", screen: false };
  if (s <= 14)
    return {
      level: "輕度",
      color: "normal",
      advice:
        "NIH-CPSI ≤ 14：輕度症狀，建議生活調整、非類固醇消炎藥及追蹤觀察。",
      screen: false,
    };
  if (s <= 29)
    return {
      level: "中度",
      color: "moderate",
      advice:
        "NIH-CPSI 15–29：中度症狀，建議藥物治療（α 阻斷劑、抗生素療程評估）及進一步泌尿科評估。",
      screen: true,
    };
  return {
    level: "重度",
    color: "critical",
    advice:
      "NIH-CPSI ≥ 30：重度症狀，建議泌尿科積極介入，考慮多模態治療（藥物＋物理治療＋心理支持）。",
    screen: true,
  };
});

const painSeverityLabel = computed(() => {
  if (painScore.value === null) return "";
  if (painScore.value <= 7) return "輕度疼痛";
  if (painScore.value <= 13) return "中度疼痛";
  return "重度疼痛";
});

const cpsi_barPct = computed(() =>
  cpsi_totalScore.value !== null ? (cpsi_totalScore.value / 43) * 100 : 0,
);

// ── Markdown ──────────────────────────────────────────────────────
function cpsi_generateMarkdown(): string {
  const locs =
    q1Items
      .filter((i) => q1Selections.value[i.key])
      .map((i) => i.zh)
      .join("、") || "無";
  return (
    `# NIH 慢性攝護腺炎症狀評分（NIH-CPSI）\n\n` +
    `## 各域作答\n\n` +
    `### 疼痛域（Pain Domain, Q1–Q4）\n` +
    `- Q1 疼痛部位：${locs}\n` +
    `- Q2 射精疼痛：${q2.value === 1 ? "有" : "無"}\n` +
    `- Q3 疼痛頻率：${q3.value ?? "未填"} 分\n` +
    `- Q4 疼痛程度（NRS）：${q4.value ?? "未填"} 分\n\n` +
    `### 排尿域（Urinary Domain, Q5–Q6）\n` +
    `- Q5 排尿不盡感：${q5.value ?? "未填"} 分\n` +
    `- Q6 排尿頻率：${q6.value ?? "未填"} 分\n\n` +
    `### 生活品質域（QoL Domain, Q7–Q9）\n` +
    `- Q7 日常活動影響：${q7.value ?? "未填"} 分\n` +
    `- Q8 症狀佔據思緒：${q8.value ?? "未填"} 分\n` +
    `- Q9 生活品質：${q9.value ?? "未填"} 分\n\n` +
    `---\n\n` +
    `## 計算結果\n\n` +
    `- **NIH-CPSI 總分**：${cpsi_totalScore.value ?? "未完成"} / 43\n` +
    `- **疼痛域**：${painScore.value ?? "—"} / 21（${painSeverityLabel.value}）\n` +
    `- **排尿域**：${urinaryScore.value ?? "—"} / 10\n` +
    `- **生活品質域**：${cpsi_qolScore.value ?? "—"} / 12\n` +
    `- **嚴重程度**：${cpsi_severity.value.level}\n` +
    `- **臨床建議**：${cpsi_severity.value.advice}`
  );
}

async function cpsi_copyOutput() {
  await navigator.clipboard.writeText(cpsi_generateMarkdown());
  cpsi_copied.value = true;
  setTimeout(() => (cpsi_copied.value = false), 2000);
}

function cpsi_reset() {
  q1Items.forEach((i) => {
    q1Selections.value[i.key] = false;
  });
  q2.value = null;
  q3.value = null;
  q4.value = null;
  q5.value = null;
  q6.value = null;
  q7.value = null;
  q8.value = null;
  q9.value = null;
  cpsi_showResults.value = false;
}
</script>

<template>
  <div class="prostateassess">
    <div class="tab-bar">
      <button
        class="tab-btn"
        :class="{ active: activeTab === 'ipss' }"
        @click="activeTab = 'ipss'"
      >
        <span class="tab-label">IPSS 攝護腺症狀評分</span>
        <span class="tab-sub">International Prostate Symptom Score</span>
      </button>
      <button
        class="tab-btn"
        :class="{ active: activeTab === 'cpsi' }"
        @click="activeTab = 'cpsi'"
      >
        <span class="tab-label">NIH-CPSI 慢性攝護腺炎</span>
        <span class="tab-sub">Chronic Prostatitis Symptom Index</span>
      </button>
    </div>

    <div v-show="activeTab === 'ipss'" class="ipss">
      <!-- ── Header ─────────────────────────────────────────────── -->
      <div class="ipss-header">
        <div class="header-title">
          <h2 class="title">IPSS 國際攝護腺症狀評分表</h2>
          <p class="subtitle">
            International Prostate Symptom Score · Barry 1992 · 7 題症狀 + 1
            題生活品質（Q8 不計入總分）
          </p>
        </div>
        <div class="score-badge" :class="ipss_severity.color">
          <span class="badge-label">IPSS</span>
          <span class="score-number">{{ ipss_totalScore ?? "—" }}</span>
          <span
            class="score-unit"
            :style="{ opacity: ipss_totalScore !== null ? 1 : 0 }"
            >/ 35</span
          >
          <span class="score-label">{{
            ipss_isComplete
              ? ipss_severity.level.split("（")[0]
              : `${answeredCount}/7 題`
          }}</span>
        </div>
      </div>

      <!-- ── Severity bar ────────────────────────────────────────── -->
      <div class="severity-bar-wrap">
        <div class="severity-bar">
          <div
            class="severity-fill"
            :class="ipss_severity.color"
            :style="{ width: ipss_barPct + '%' }"
          />
        </div>
        <div class="severity-ticks-abs">
          <span class="tick-abs" style="left: 0%">0</span>
          <span class="tick-abs tick-yellow" style="left: 22.9%">8 ▾</span>
          <span class="tick-abs tick-red" style="left: 57.1%">20 ▾</span>
          <span class="tick-abs tick-red" style="left: 100%">35</span>
        </div>
        <div class="severity-labels-abs">
          <span class="label-abs" style="left: 0%">輕度</span>
          <span class="label-abs tick-yellow" style="left: 22.9%">中度</span>
          <span class="label-abs tick-red" style="left: 57.1%">重度</span>
          <span class="tick-abs tick-red" style="left: 100%">重度</span>
        </div>
      </div>

      <!-- ── Q1–Q7 symptom questions ────────────────────────────── -->
      <div class="nihss-group">
        <div class="group-header-bar q-bar">
          <span class="group-icon">🔍</span>
          <span class="group-label-text">症狀評估（Q1–Q7）</span>
          <span class="group-sub-text"
            >依過去一個月的症狀頻率作答 · 每題 0–5 分</span
          >
          <span
            class="group-score-tally"
            :class="ipss_isComplete ? 'tally-scored' : 'tally-nd'"
          >
            {{
              ipss_isComplete
                ? ipss_totalScore + " / 35"
                : answeredCount + "/7 題"
            }}
          </span>
        </div>

        <div class="item-list">
          <div
            v-for="(q, idx) in questions"
            :key="q.key"
            class="ipss-item"
            :class="
              selections[q.key] !== null
                ? selections[q.key]! >= 4
                  ? 'item-high'
                  : selections[q.key]! >= 2
                    ? 'item-mid'
                    : 'item-low'
                : ''
            "
          >
            <div class="item-header">
              <div class="item-meta-row">
                <span
                  class="item-qnum"
                  :class="q.domain === 'storage' ? 'q-storage' : 'q-voiding'"
                  >Q{{ idx + 1 }}</span
                >
              </div>
              <div class="item-name-block">
                <span class="item-name">{{ q.zh }}</span>
                <span class="item-sub">{{ q.en }}</span>
              </div>
              <span
                class="item-val"
                :class="
                  selections[q.key] !== null
                    ? selections[q.key]! >= 4
                      ? 'val-high'
                      : selections[q.key]! >= 2
                        ? 'val-mid'
                        : 'val-low'
                    : 'val-nd'
                "
              >
                {{ selections[q.key] !== null ? selections[q.key] : "—" }}
              </span>
            </div>
            <div class="sec-options">
              <div
                v-for="opt in q.isNocturia ? nocturiaLabels : freqLabels"
                :key="opt.val"
                class="sec-opt"
                :class="{ 'opt-selected': selections[q.key] === opt.val }"
                @click="selections[q.key] = opt.val"
              >
                <div
                  class="opt-radio"
                  :class="{ selected: selections[q.key] === opt.val }"
                >
                  <div class="opt-dot" v-if="selections[q.key] === opt.val" />
                </div>
                <div class="opt-content">
                  <span class="opt-score-badge">{{ opt.val }}</span>
                  <span class="opt-text">{{ opt.zh }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- ── Q8 Quality of Life ─────────────────────────────────── -->
      <div class="nihss-group">
        <div class="group-header-bar qol-bar">
          <span class="group-icon">❤️</span>
          <span class="group-label-text">生活品質評估（Q8）</span>
          <span class="group-sub-text"
            >此題不計入 IPSS 總分，但為重要的治療決策依據</span
          >
          <span
            class="group-score-tally"
            :class="ipss_qolScore !== null ? 'tally-qol' : 'tally-nd'"
          >
            {{ ipss_qolScore !== null ? ipss_qolScore + " / 6" : "—" }}
          </span>
        </div>
        <div
          class="ipss-item"
          :class="ipss_qolScore !== null ? 'item-mid' : ''"
        >
          <div class="item-header">
            <div class="item-meta-row">
              <span class="item-qnum q-qol">Q8</span>
            </div>
            <div class="item-name-block">
              <span class="item-name"
                >如果您必須在餘生中，都保持現在的泌尿狀況，您的感受如何？</span
              >
              <span class="item-sub"
                >If you were to spend the rest of your life with your urinary
                condition just the way it is now, how would you feel about
                that?</span
              >
            </div>
            <span
              class="item-val"
              :class="
                ipss_qolScore !== null
                  ? ipss_qolScore >= 4
                    ? 'val-high'
                    : ipss_qolScore >= 2
                      ? 'val-mid'
                      : 'val-low'
                  : 'val-nd'
              "
            >
              {{ ipss_qolScore !== null ? ipss_qolScore : "—" }}
            </span>
          </div>
          <div class="sec-options">
            <div
              v-for="opt in qolLabels"
              :key="opt.val"
              class="sec-opt"
              :class="{ 'opt-selected': ipss_qolScore === opt.val }"
              @click="ipss_qolScore = opt.val"
            >
              <div
                class="opt-radio"
                :class="{ selected: ipss_qolScore === opt.val }"
              >
                <div class="opt-dot" v-if="ipss_qolScore === opt.val" />
              </div>
              <div class="opt-content">
                <span class="opt-score-badge">{{ opt.val }}</span>
                <span class="opt-text">{{ opt.zh }}</span>
              </div>
            </div>
          </div>
          <div v-if="ipss_qolScore !== null" class="qol-note">
            Q8 = {{ ipss_qolScore }} 分 → {{ qolSeverity }}
            <template v-if="ipss_qolScore >= 4"
              >（症狀明顯困擾，強烈建議積極介入治療）</template
            >
          </div>
        </div>
      </div>

      <!-- ── Sub-score summary ──────────────────────────────────── -->
      <div v-if="answeredCount > 0" class="sub-score-row">
        <div
          class="sub-score-card"
          :class="
            storageDomain >= 8
              ? 'ss-high'
              : storageDomain >= 4
                ? 'ss-mid'
                : 'ss-low'
          "
        >
          <span class="ss-label">💧 儲尿症狀</span>
          <div class="ss-score-row">
            <span class="ss-val">{{ storageDomain }}</span>
            <span class="ss-max">/ 20</span>
          </div>
          <span class="ss-note">Q1,Q2,Q4,Q7</span>
        </div>
        <div
          class="sub-score-card"
          :class="
            voidingDomain >= 6
              ? 'ss-high'
              : voidingDomain >= 3
                ? 'ss-mid'
                : 'ss-low'
          "
        >
          <span class="ss-label">🌊 排尿症狀</span>
          <div class="ss-score-row">
            <span class="ss-val">{{ voidingDomain }}</span>
            <span class="ss-max">/ 15</span>
          </div>
          <span class="ss-note">Q3,Q5,Q6</span>
        </div>
        <div class="sub-score-card ss-total" :class="ipss_severity.color">
          <span class="ss-label">總分</span>
          <div class="ss-score-row">
            <span class="ss-val">{{ ipss_totalScore ?? "—" }}</span>
            <span class="ss-max">/ 35</span>
          </div>
          <span class="ss-note">{{
            ipss_totalScore !== null ? ipss_severity.level.split("（")[0] : ""
          }}</span>
        </div>
      </div>

      <!-- ── Result card ────────────────────────────────────────── -->
      <div class="ipss-result" :class="ipss_severity.color">
        <div class="result-left">
          <span class="result-number">{{ ipss_totalScore ?? "—" }}</span>
          <span class="result-max">/ 35</span>
        </div>
        <div class="result-right">
          <span class="result-ver">IPSS</span>
          <span class="result-level">{{ ipss_severity.level }}</span>
          <span class="result-advice">{{ ipss_severity.advice }}</span>
        </div>
      </div>

      <!-- ── Results detail ─────────────────────────────────────── -->
      <div v-if="ipss_showResults && ipss_isComplete" class="results-detail">
        <div class="results-header">評估明細</div>
        <div v-for="(q, idx) in questions" :key="q.key" class="detail-row">
          <span class="detail-qnum">Q{{ idx + 1 }}</span>
          <span class="detail-domain">{{ q.shortLabel }}</span>
          <span
            class="detail-score"
            :class="
              (selections[q.key] ?? 0) >= 4
                ? 'ds-high'
                : (selections[q.key] ?? 0) >= 2
                  ? 'ds-mid'
                  : 'ds-low'
            "
            >{{ selections[q.key] }}</span
          >
          <span class="detail-desc">{{
            q.domain === "storage" ? "儲尿" : "排尿"
          }}</span>
        </div>
        <div v-if="ipss_qolScore !== null" class="detail-row">
          <span class="detail-qnum">Q8</span>
          <span class="detail-domain">生活品質（不計入總分）</span>
          <span class="detail-score ds-mid">{{ ipss_qolScore }}</span>
          <span class="detail-desc">{{ qolSeverity }}</span>
        </div>
        <div class="detail-row detail-total">
          <span class="detail-qnum">∑</span>
          <span class="detail-domain">IPSS 總分</span>
          <span class="detail-score detail-score-brand">{{
            ipss_totalScore
          }}</span>
          <div class="detail-desc detail-desc-block">
            <span class="detail-desc-unit">/ 35</span>
            <span class="detail-desc-label">{{ ipss_severity.level }}</span>
          </div>
        </div>
      </div>

      <!-- ── Alert ──────────────────────────────────────────────── -->
      <div
        v-if="ipss_isComplete && ipss_severity.screen"
        class="ipss-alert"
        :class="`alert-${ipss_severity.color}`"
      >
        <span class="alert-icon">⚠</span>
        <span
          ><strong
            >IPSS {{ ipss_totalScore }} 分（{{
              ipss_severity.level
            }}）：</strong
          >{{ ipss_severity.advice }}</span
        >
      </div>

      <!-- ── Clinical note ──────────────────────────────────────── -->
      <div class="warn-box">
        <span class="warn-icon">⚠</span>
        <span
          >IPSS 為症狀評估工具，不能取代泌尿科完整評估，亦不能診斷 BPH。Q8
          生活品質評分是治療決策的重要依據，即使 IPSS 分數偏低，若 Q8 ≥ 4
          仍建議積極介入。IPSS 與尿流速、殘尿量及攝護腺體積相關性有限。</span
        >
      </div>

      <!-- ── Actions ────────────────────────────────────────────── -->
      <div class="ipss-actions">
        <button class="btn-view" @click="ipss_showResults = !ipss_showResults">
          {{ ipss_showResults ? "收起明細" : "查看評估結果" }}
        </button>
        <button
          class="btn-copy"
          :disabled="!ipss_isComplete"
          @click="ipss_copyOutput"
        >
          {{ ipss_copied ? "已複製 ✓" : "複製 Markdown 結果" }}
        </button>
        <button class="btn-reset" @click="ipss_reset">重置</button>
      </div>
      <p v-if="!ipss_isComplete" class="progress-hint">
        已完成 {{ answeredCount }}/7 題，尚餘 {{ 7 - answeredCount }} 題
      </p>
    </div>

    <div v-show="activeTab === 'cpsi'" class="cpsi">
      <!-- ── Header ─────────────────────────────────────────────── -->
      <div class="cpsi-header">
        <div class="header-title">
          <h2 class="title">NIH-CPSI 慢性攝護腺炎症狀評分</h2>
          <p class="subtitle">
            NIH Chronic Prostatitis Symptom Index · Litwin 1999 · 3
            大域：疼痛（0–21）+ 排尿（0–10）+ 生活品質（0–12）
          </p>
        </div>
        <div class="score-badge" :class="cpsi_severity.color">
          <span class="badge-label">NIH-CPSI</span>
          <span class="score-number">{{ cpsi_totalScore ?? "—" }}</span>
          <span
            class="score-unit"
            :style="{ opacity: cpsi_totalScore !== null ? 1 : 0 }"
            >/ 43</span
          >
          <span class="score-label">{{
            cpsi_isComplete ? cpsi_severity.level : `${answeredSections}/3 域`
          }}</span>
        </div>
      </div>

      <!-- ── Severity bar ────────────────────────────────────────── -->
      <div class="severity-bar-wrap">
        <div class="severity-bar">
          <div
            class="severity-fill"
            :class="cpsi_severity.color"
            :style="{ width: cpsi_barPct + '%' }"
          />
        </div>
        <div class="severity-ticks-abs">
          <span class="tick-abs" style="left: 0%">0</span>
          <span class="tick-abs tick-yellow" style="left: 34.9%">15 ▾</span>
          <span class="tick-abs tick-red" style="left: 69.8%">30 ▾</span>
          <span class="tick-abs tick-red" style="left: 100%">43</span>
        </div>
        <div class="severity-labels-abs">
          <span class="label-abs" style="left: 0%">輕度</span>
          <span class="label-abs tick-yellow" style="left: 34.9%">中度</span>
          <span class="label-abs tick-red" style="left: 69.8%">重度</span>
        </div>
      </div>

      <!-- ══════════════════════════════════════════════════════════
         域 1：疼痛域 Pain Domain
    ══════════════════════════════════════════════════════════ -->
      <div class="nihss-group">
        <div class="group-header-bar pain-bar">
          <span class="group-icon">🔴</span>
          <span class="group-label-text">疼痛域 Pain Domain（Q1–Q4）</span>
          <span class="group-sub-text"
            >疼痛部位 + 射精疼痛 + 頻率 + 程度 · 最高 21 分</span
          >
          <span
            class="group-score-tally"
            :class="painScore !== null ? 'tally-pain' : 'tally-nd'"
          >
            {{ painScore !== null ? painScore + " / 21" : "—" }}
          </span>
        </div>

        <!-- Q1 Pain locations (checkboxes) -->
        <div class="cpsi-item">
          <div class="item-header">
            <div class="item-meta-row">
              <span class="item-qnum q-pain">Q1</span>
            </div>
            <div class="item-name-block">
              <span class="item-name"
                >過去一週，您是否曾在下列部位感覺疼痛或不舒服？（可複選）</span
              >
              <span class="item-sub"
                >In the last week, have you experienced any pain or discomfort
                in the following areas? (check all that apply)</span
              >
            </div>
            <span
              class="item-val"
              :class="q1Score > 0 ? 'val-pain' : 'val-nd'"
              >{{ q1Score }}</span
            >
          </div>
          <div class="checkbox-grid">
            <label
              v-for="item in q1Items"
              :key="item.key"
              class="check-item"
              :class="{ 'check-active': q1Selections[item.key] }"
            >
              <input type="checkbox" v-model="q1Selections[item.key]" />
              <span class="check-label">{{ item.zh }}</span>
            </label>
          </div>
        </div>

        <!-- Q2 Ejaculatory pain -->
        <div
          class="cpsi-item"
          :class="q2 !== null ? (q2 === 1 ? 'item-pain' : 'item-ok') : ''"
        >
          <div class="item-header">
            <div class="item-meta-row">
              <span class="item-qnum q-pain">Q2</span>
            </div>
            <div class="item-name-block">
              <span class="item-name"
                >過去一週，您是否曾在射精時或射精後感覺疼痛或不舒服？</span
              >
              <span class="item-sub"
                >In the last week, have you experienced any pain or discomfort
                during or after sexual climax (ejaculation)?</span
              >
            </div>
            <div class="yn-row">
              <button
                class="yn-btn"
                :class="{ 'yn-green': q2 === 0 }"
                @click="q2 = 0"
              >
                否
              </button>
              <button
                class="yn-btn"
                :class="{ 'yn-red': q2 === 1 }"
                @click="q2 = 1"
              >
                是
              </button>
            </div>
          </div>
        </div>

        <!-- Q3 Pain frequency -->
        <div
          class="cpsi-item"
          :class="
            q3 !== null
              ? q3 >= 3
                ? 'item-high'
                : q3 >= 1
                  ? 'item-mid'
                  : 'item-low'
              : ''
          "
        >
          <div class="item-header">
            <div class="item-meta-row">
              <span class="item-qnum q-pain">Q3</span>
            </div>
            <div class="item-name-block">
              <span class="item-name"
                >過去一週，您在這些部位有多頻繁感覺到疼痛或不舒服？</span
              >
              <span class="item-sub"
                >How often have you had pain or discomfort in any of these areas
                over the last week?</span
              >
            </div>
            <span
              class="item-val"
              :class="
                q3 !== null
                  ? q3 >= 3
                    ? 'val-high'
                    : q3 >= 1
                      ? 'val-mid'
                      : 'val-low'
                  : 'val-nd'
              "
            >
              {{ q3 !== null ? q3 : "—" }}
            </span>
          </div>
          <div class="sec-options">
            <div
              v-for="opt in q3Labels"
              :key="opt.val"
              class="sec-opt"
              :class="{ 'opt-selected': q3 === opt.val }"
              @click="q3 = opt.val"
            >
              <div class="opt-radio" :class="{ selected: q3 === opt.val }">
                <div class="opt-dot" v-if="q3 === opt.val" />
              </div>
              <div class="opt-content">
                <span class="opt-score-badge">{{ opt.val }}</span>
                <span class="opt-text">{{ opt.zh }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Q4 Pain severity NRS 0-10 -->
        <div
          class="cpsi-item"
          :class="
            q4 !== null
              ? q4 >= 7
                ? 'item-high'
                : q4 >= 4
                  ? 'item-mid'
                  : 'item-low'
              : ''
          "
        >
          <div class="item-header">
            <div class="item-meta-row">
              <span class="item-qnum q-pain">Q4</span>
            </div>
            <div class="item-name-block">
              <span class="item-name"
                >過去一週，下列哪個數字最能代表您在最嚴重時的疼痛程度？（0 =
                完全不痛，10 = 您能想像最嚴重的疼痛）</span
              >
              <span class="item-sub"
                >Which number best describes your AVERAGE pain or discomfort on
                the days that you had it, over the last week? (0 = no pain, 10 =
                pain as bad as you can imagine)</span
              >
            </div>
            <span
              class="item-val"
              :class="
                q4 !== null
                  ? q4 >= 7
                    ? 'val-high'
                    : q4 >= 4
                      ? 'val-mid'
                      : 'val-low'
                  : 'val-nd'
              "
            >
              {{ q4 !== null ? q4 : "—" }}
            </span>
          </div>
          <div class="field-input-wrap">
            <div class="slider-col">
              <div class="item-anchor-row">
                <span class="anchor-left">完全不痛</span>
                <span class="anchor-right">最嚴重</span>
              </div>
              <div class="slider-track-wrap">
                <div class="slider-track">
                  <div
                    class="slider-fill fill-q4"
                    :style="{
                      width: ((q4 !== null ? q4 : 0) / 10) * 100 + '%',
                    }"
                  />
                </div>
                <input
                  type="range"
                  min="0"
                  max="10"
                  step="1"
                  class="field-slider"
                  :value="q4 !== null ? q4 : 0"
                  @input="
                    q4 = parseInt(($event.target as HTMLInputElement).value)
                  "
                />
              </div>
              <div class="field-ticks">
                <span v-for="n in 11" :key="n">{{ n - 1 }}</span>
              </div>
            </div>
            <input
              type="number"
              min="0"
              max="10"
              class="field-number"
              placeholder="—"
              :value="q4 !== null ? q4 : ''"
              @input="
                q4 =
                  ($event.target as HTMLInputElement).value === ''
                    ? null
                    : Math.max(
                        0,
                        Math.min(
                          10,
                          parseInt(($event.target as HTMLInputElement).value),
                        ),
                      )
              "
            />
          </div>
        </div>
      </div>

      <!-- ══════════════════════════════════════════════════════════
         域 2：排尿域 Urinary Domain
    ══════════════════════════════════════════════════════════ -->
      <div class="nihss-group">
        <div class="group-header-bar urinary-bar">
          <span class="group-icon">💧</span>
          <span class="group-label-text">排尿域 Urinary Domain（Q5–Q6）</span>
          <span class="group-sub-text">排尿不盡 + 排尿頻率 · 最高 10 分</span>
          <span
            class="group-score-tally"
            :class="urinaryScore !== null ? 'tally-urinary' : 'tally-nd'"
          >
            {{ urinaryScore !== null ? urinaryScore + " / 10" : "—" }}
          </span>
        </div>

        <!-- Q5 Incomplete emptying -->
        <div
          class="cpsi-item"
          :class="
            q5 !== null
              ? q5 >= 4
                ? 'item-high'
                : q5 >= 2
                  ? 'item-mid'
                  : 'item-low'
              : ''
          "
        >
          <div class="item-header">
            <div class="item-meta-row">
              <span class="item-qnum q-urinary">Q5</span>
            </div>
            <div class="item-name-block">
              <span class="item-name"
                >過去一週，您排尿後有多頻繁感覺膀胱仍未完全排空？</span
              >
              <span class="item-sub"
                >Over the last week, how often have you had the sensation of not
                emptying your bladder completely after you finished
                urinating?</span
              >
            </div>
            <span
              class="item-val"
              :class="
                q5 !== null
                  ? q5 >= 4
                    ? 'val-high'
                    : q5 >= 2
                      ? 'val-mid'
                      : 'val-low'
                  : 'val-nd'
              "
            >
              {{ q5 !== null ? q5 : "—" }}
            </span>
          </div>
          <div class="sec-options">
            <div
              v-for="opt in q5Labels"
              :key="opt.val"
              class="sec-opt"
              :class="{ 'opt-selected': q5 === opt.val }"
              @click="q5 = opt.val"
            >
              <div class="opt-radio" :class="{ selected: q5 === opt.val }">
                <div class="opt-dot" v-if="q5 === opt.val" />
              </div>
              <div class="opt-content">
                <span class="opt-score-badge">{{ opt.val }}</span>
                <span class="opt-text">{{ opt.zh }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Q6 Urinary frequency -->
        <div
          class="cpsi-item"
          :class="
            q6 !== null
              ? q6 >= 4
                ? 'item-high'
                : q6 >= 2
                  ? 'item-mid'
                  : 'item-low'
              : ''
          "
        >
          <div class="item-header">
            <div class="item-meta-row">
              <span class="item-qnum q-urinary">Q6</span>
            </div>
            <div class="item-name-block">
              <span class="item-name"
                >過去一週，您有多頻繁在排尿後 2 小時內又必須再次排尿？</span
              >
              <span class="item-sub"
                >Over the last week, how often have you had to urinate again
                less than two hours after you finished urinating?</span
              >
            </div>
            <span
              class="item-val"
              :class="
                q6 !== null
                  ? q6 >= 4
                    ? 'val-high'
                    : q6 >= 2
                      ? 'val-mid'
                      : 'val-low'
                  : 'val-nd'
              "
            >
              {{ q6 !== null ? q6 : "—" }}
            </span>
          </div>
          <div class="sec-options">
            <div
              v-for="opt in q5Labels"
              :key="opt.val"
              class="sec-opt"
              :class="{ 'opt-selected': q6 === opt.val }"
              @click="q6 = opt.val"
            >
              <div class="opt-radio" :class="{ selected: q6 === opt.val }">
                <div class="opt-dot" v-if="q6 === opt.val" />
              </div>
              <div class="opt-content">
                <span class="opt-score-badge">{{ opt.val }}</span>
                <span class="opt-text">{{ opt.zh }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- ══════════════════════════════════════════════════════════
         域 3：生活品質域 QoL Impact Domain
    ══════════════════════════════════════════════════════════ -->
      <div class="nihss-group">
        <div class="group-header-bar qol-bar">
          <span class="group-icon">❤️</span>
          <span class="group-label-text"
            >生活品質域 QoL Impact Domain（Q7–Q9）</span
          >
          <span class="group-sub-text"
            >日常影響 + 思緒佔據 + 整體生活品質 · 最高 12 分</span
          >
          <span
            class="group-score-tally"
            :class="cpsi_qolScore !== null ? 'tally-qol' : 'tally-nd'"
          >
            {{ cpsi_qolScore !== null ? cpsi_qolScore + " / 12" : "—" }}
          </span>
        </div>

        <!-- Q7 Interference with activities -->
        <div
          class="cpsi-item"
          :class="
            q7 !== null
              ? q7 >= 2
                ? 'item-high'
                : q7 >= 1
                  ? 'item-mid'
                  : 'item-low'
              : ''
          "
        >
          <div class="item-header">
            <div class="item-meta-row">
              <span class="item-qnum q-qol">Q7</span>
            </div>
            <div class="item-name-block">
              <span class="item-name"
                >過去一週，您的症狀有多少程度妨礙了您的日常活動？</span
              >
              <span class="item-sub"
                >How much have your symptoms kept you from doing the kinds of
                things you would usually do, over the last week?</span
              >
            </div>
            <span
              class="item-val"
              :class="
                q7 !== null
                  ? q7 >= 2
                    ? 'val-high'
                    : q7 >= 1
                      ? 'val-mid'
                      : 'val-low'
                  : 'val-nd'
              "
            >
              {{ q7 !== null ? q7 : "—" }}
            </span>
          </div>
          <div class="sec-options">
            <div
              v-for="opt in q7Labels"
              :key="opt.val"
              class="sec-opt"
              :class="{ 'opt-selected': q7 === opt.val }"
              @click="q7 = opt.val"
            >
              <div class="opt-radio" :class="{ selected: q7 === opt.val }">
                <div class="opt-dot" v-if="q7 === opt.val" />
              </div>
              <div class="opt-content">
                <span class="opt-score-badge">{{ opt.val }}</span>
                <span class="opt-text">{{ opt.zh }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Q8 Thoughts about symptoms -->
        <div
          class="cpsi-item"
          :class="
            q8 !== null
              ? q8 >= 2
                ? 'item-high'
                : q8 >= 1
                  ? 'item-mid'
                  : 'item-low'
              : ''
          "
        >
          <div class="item-header">
            <div class="item-meta-row">
              <span class="item-qnum q-qol">Q8</span>
            </div>
            <div class="item-name-block">
              <span class="item-name"
                >過去一週，您有多頻繁思考著您的症狀？</span
              >
              <span class="item-sub"
                >How much did you think about your symptoms, over the last
                week?</span
              >
            </div>
            <span
              class="item-val"
              :class="
                q8 !== null
                  ? q8 >= 2
                    ? 'val-high'
                    : q8 >= 1
                      ? 'val-mid'
                      : 'val-low'
                  : 'val-nd'
              "
            >
              {{ q8 !== null ? q8 : "—" }}
            </span>
          </div>
          <div class="sec-options">
            <div
              v-for="opt in q7Labels"
              :key="opt.val"
              class="sec-opt"
              :class="{ 'opt-selected': q8 === opt.val }"
              @click="q8 = opt.val"
            >
              <div class="opt-radio" :class="{ selected: q8 === opt.val }">
                <div class="opt-dot" v-if="q8 === opt.val" />
              </div>
              <div class="opt-content">
                <span class="opt-score-badge">{{ opt.val }}</span>
                <span class="opt-text">{{ opt.zh }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Q9 QoL overall -->
        <div
          class="cpsi-item"
          :class="
            q9 !== null
              ? q9 >= 4
                ? 'item-high'
                : q9 >= 2
                  ? 'item-mid'
                  : 'item-low'
              : ''
          "
        >
          <div class="item-header">
            <div class="item-meta-row">
              <span class="item-qnum q-qol">Q9</span>
            </div>
            <div class="item-name-block">
              <span class="item-name"
                >如果您必須在餘生中都保持過去一週的症狀，您的感受如何？</span
              >
              <span class="item-sub"
                >If you were to spend the rest of your life with your symptoms
                just the way they have been during the last week, how would you
                feel about that?</span
              >
            </div>
            <span
              class="item-val"
              :class="
                q9 !== null
                  ? q9 >= 4
                    ? 'val-high'
                    : q9 >= 2
                      ? 'val-mid'
                      : 'val-low'
                  : 'val-nd'
              "
            >
              {{ q9 !== null ? q9 : "—" }}
            </span>
          </div>
          <div class="sec-options">
            <div
              v-for="opt in q9Labels"
              :key="opt.val"
              class="sec-opt"
              :class="{ 'opt-selected': q9 === opt.val }"
              @click="q9 = opt.val"
            >
              <div class="opt-radio" :class="{ selected: q9 === opt.val }">
                <div class="opt-dot" v-if="q9 === opt.val" />
              </div>
              <div class="opt-content">
                <span class="opt-score-badge">{{ opt.val }}</span>
                <span class="opt-text">{{ opt.zh }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- ── Domain sub-score row ───────────────────────────────── -->
      <div v-if="answeredSections > 0" class="sub-score-row">
        <div
          class="sub-score-card"
          :class="
            painScore !== null
              ? painScore >= 14
                ? 'ss-high'
                : painScore >= 8
                  ? 'ss-mid'
                  : 'ss-low'
              : 'ss-nd'
          "
        >
          <span class="ss-label">🔴 疼痛</span>
          <div class="ss-score-row">
            <span class="ss-val">{{ painScore ?? "—" }}</span>
            <span class="ss-max">/ 21</span>
          </div>
        </div>
        <div
          class="sub-score-card"
          :class="
            urinaryScore !== null
              ? urinaryScore >= 6
                ? 'ss-high'
                : urinaryScore >= 3
                  ? 'ss-mid'
                  : 'ss-low'
              : 'ss-nd'
          "
        >
          <span class="ss-label">💧 排尿</span>
          <div class="ss-score-row">
            <span class="ss-val">{{ urinaryScore ?? "—" }}</span>
            <span class="ss-max">/ 10</span>
          </div>
        </div>
        <div
          class="sub-score-card"
          :class="
            cpsi_qolScore !== null
              ? cpsi_qolScore >= 8
                ? 'ss-high'
                : cpsi_qolScore >= 4
                  ? 'ss-mid'
                  : 'ss-low'
              : 'ss-nd'
          "
        >
          <span class="ss-label">❤️ 生活品質</span>
          <div class="ss-score-row">
            <span class="ss-val">{{ cpsi_qolScore ?? "—" }}</span>
            <span class="ss-max">/ 12</span>
          </div>
        </div>
        <div
          class="sub-score-card ss-total"
          :class="cpsi_isComplete ? cpsi_severity.color : 'ss-nd'"
        >
          <span class="ss-label">總分</span>
          <div class="ss-score-row">
            <span class="ss-val">{{ cpsi_totalScore ?? "—" }}</span>
            <span class="ss-max">/ 43</span>
          </div>
          <span class="ss-note">{{
            cpsi_totalScore !== null ? cpsi_severity.level : ""
          }}</span>
        </div>
      </div>

      <!-- ── Result card ────────────────────────────────────────── -->
      <div class="cpsi-result" :class="cpsi_severity.color">
        <div class="result-left">
          <span class="result-number">{{ cpsi_totalScore ?? "—" }}</span>
          <span class="result-max">/ 43</span>
        </div>
        <div class="result-right">
          <span class="result-level">{{ cpsi_severity.level }}</span>
          <span class="result-advice">{{ cpsi_severity.advice }}</span>
        </div>
      </div>

      <!-- ── Results detail ─────────────────────────────────────── -->
      <div v-if="cpsi_showResults && cpsi_isComplete" class="results-detail">
        <div class="results-header">評估明細</div>
        <div class="detail-row">
          <span class="detail-qnum">Q1</span>
          <span class="detail-domain">疼痛部位</span>
          <span class="detail-score ds-mid">{{ q1Score }}</span>
          <span class="detail-desc">/ 4</span>
        </div>
        <div class="detail-row">
          <span class="detail-qnum">Q2</span>
          <span class="detail-domain">射精疼痛</span>
          <span class="detail-score" :class="q2 === 1 ? 'ds-high' : 'ds-low'">{{
            q2
          }}</span>
          <span class="detail-desc">/ 1</span>
        </div>
        <div class="detail-row">
          <span class="detail-qnum">Q3</span>
          <span class="detail-domain">疼痛頻率</span>
          <span
            class="detail-score"
            :class="
              (q3 ?? 0) >= 3 ? 'ds-high' : (q3 ?? 0) >= 1 ? 'ds-mid' : 'ds-low'
            "
            >{{ q3 }}</span
          >
          <span class="detail-desc">/ 4</span>
        </div>
        <div class="detail-row">
          <span class="detail-qnum">Q4</span>
          <span class="detail-domain">疼痛程度（NRS）</span>
          <span
            class="detail-score"
            :class="
              (q4 ?? 0) >= 7 ? 'ds-high' : (q4 ?? 0) >= 4 ? 'ds-mid' : 'ds-low'
            "
            >{{ q4 }}</span
          >
          <span class="detail-desc">/ 10</span>
        </div>
        <div class="detail-row">
          <span class="detail-qnum">Pain</span>
          <span class="detail-domain">疼痛域小計</span>
          <span class="detail-score ds-brand">{{ painScore }}</span>
          <span class="detail-desc">/ 21 · {{ painSeverityLabel }}</span>
        </div>
        <div class="detail-row">
          <span class="detail-qnum">Q5</span>
          <span class="detail-domain">排尿不盡感</span>
          <span
            class="detail-score"
            :class="
              (q5 ?? 0) >= 4 ? 'ds-high' : (q5 ?? 0) >= 2 ? 'ds-mid' : 'ds-low'
            "
            >{{ q5 }}</span
          >
          <span class="detail-desc">/ 5</span>
        </div>
        <div class="detail-row">
          <span class="detail-qnum">Q6</span>
          <span class="detail-domain">排尿頻率</span>
          <span
            class="detail-score"
            :class="
              (q6 ?? 0) >= 4 ? 'ds-high' : (q6 ?? 0) >= 2 ? 'ds-mid' : 'ds-low'
            "
            >{{ q6 }}</span
          >
          <span class="detail-desc">/ 5</span>
        </div>
        <div class="detail-row">
          <span class="detail-qnum">Q7</span>
          <span class="detail-domain">日常活動影響</span>
          <span
            class="detail-score"
            :class="(q7 ?? 0) >= 2 ? 'ds-high' : 'ds-mid'"
            >{{ q7 }}</span
          >
          <span class="detail-desc">/ 3</span>
        </div>
        <div class="detail-row">
          <span class="detail-qnum">Q8</span>
          <span class="detail-domain">症狀佔據思緒</span>
          <span
            class="detail-score"
            :class="(q8 ?? 0) >= 2 ? 'ds-high' : 'ds-mid'"
            >{{ q8 }}</span
          >
          <span class="detail-desc">/ 3</span>
        </div>
        <div class="detail-row">
          <span class="detail-qnum">Q9</span>
          <span class="detail-domain">生活品質</span>
          <span
            class="detail-score"
            :class="(q9 ?? 0) >= 4 ? 'ds-high' : 'ds-mid'"
            >{{ q9 }}</span
          >
          <span class="detail-desc">/ 6</span>
        </div>
        <div class="detail-row detail-total">
          <span class="detail-qnum">∑</span>
          <span class="detail-domain">NIH-CPSI 總分</span>
          <span class="detail-score detail-score-brand">{{
            cpsi_totalScore
          }}</span>
          <div class="detail-desc detail-desc-block">
            <span class="detail-desc-unit">/ 43</span>
            <span class="detail-desc-label">{{ cpsi_severity.level }}</span>
          </div>
        </div>
      </div>

      <!-- ── Alert ──────────────────────────────────────────────── -->
      <div
        v-if="cpsi_isComplete && cpsi_severity.screen"
        class="cpsi-alert"
        :class="`alert-${cpsi_severity.color}`"
      >
        <span class="alert-icon">⚠</span>
        <span
          ><strong
            >NIH-CPSI {{ cpsi_totalScore }} 分（{{
              cpsi_severity.level
            }}）：</strong
          >{{ cpsi_severity.advice }}</span
        >
      </div>

      <!-- ── Clinical note ──────────────────────────────────────── -->
      <div class="warn-box">
        <span class="warn-icon">⚠</span>
        <span
          >NIH-CPSI
          適用於評估慢性攝護腺炎／慢性骨盆疼痛症候群（CP/CPPS），不能取代完整泌尿科評估。疼痛域對生活品質的影響（r=0.678）顯著高於排尿域（r=0.320）。治療反應評估時，總分下降
          ≥ 6 分（或疼痛域下降 ≥ 25%）視為有臨床意義的改善。</span
        >
      </div>

      <!-- ── Actions ────────────────────────────────────────────── -->
      <div class="cpsi-actions">
        <button class="btn-view" @click="cpsi_showResults = !cpsi_showResults">
          {{ cpsi_showResults ? "收起明細" : "查看評估結果" }}
        </button>
        <button
          class="btn-copy"
          :disabled="!cpsi_isComplete"
          @click="cpsi_copyOutput"
        >
          {{ cpsi_copied ? "已複製 ✓" : "複製 Markdown 結果" }}
        </button>
        <button class="btn-reset" @click="cpsi_reset">重置</button>
      </div>
      <p v-if="!cpsi_isComplete" class="progress-hint">
        已完成 {{ answeredSections }}/3 域，疼痛域需完成 Q2–Q4，排尿域需完成
        Q5–Q6，生活品質域需完成 Q7–Q9
      </p>
    </div>
  </div>
</template>

<style scoped>
.prostateassess {
  max-width: 820px;
  margin: 0 auto;
}

.prostateassess > .tab-bar {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
  background: var(--vp-c-bg-mute);
  padding: 4px;
  border-radius: 10px;
  border: 1px solid var(--vp-c-divider);
}
.prostateassess > .tab-bar .tab-btn {
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
.prostateassess > .tab-bar .tab-btn:hover {
  color: var(--vp-c-text-1);
  border-color: var(--vp-c-divider);
}
.prostateassess > .tab-bar .tab-btn.active {
  color: var(--vp-c-brand-1);
  background: color-mix(in srgb, var(--vp-c-brand-1) 12%, transparent);
  border-color: color-mix(in srgb, var(--vp-c-brand-1) 35%, transparent);
  box-shadow: 0 0 0 1px color-mix(in srgb, var(--vp-c-brand-1) 8%, transparent);
}
.prostateassess > .tab-bar .tab-label {
  display: block;
  font-size: 1rem;
  font-weight: 800;
  line-height: 1.3;
  letter-spacing: 0.02em;
}
.prostateassess > .tab-bar .tab-sub {
  display: block;
  font-size: 0.78rem;
  font-weight: 600;
  color: var(--vp-c-text-3);
  margin-top: 2px;
}
.prostateassess > .tab-bar .tab-btn.active .tab-sub {
  color: var(--vp-c-brand-1);
  opacity: 0.85;
}

/* ══ IPSS 攝護腺症狀評分 ══ */

.ipss {
  max-width: 780px;
  margin: 0 auto;
  padding: 2rem 0 3rem;
  font-size: 0.9rem;
}
.ipss /* ── Header ─────────────────────────────────────────────────────── */
.ipss-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 1.25rem;
  flex-wrap: nowrap;
}
.ipss .header-title {
  flex: 1;
  min-width: 0;
}
.ipss .title {
  font-size: 24px;
  font-weight: 600;
  color: var(--vp-c-text-1);
  margin: 0 0 0.2rem;
  border: none !important;
  padding: 0 !important;
}
.ipss .subtitle {
  font-size: 0.78rem;
  color: var(--vp-c-text-3);
  margin: 0;
  line-height: 1.6;
}
.ipss /* ── Score badge ─────────────────────────────────────────────────── */
.score-badge {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-width: 88px;
  min-height: 88px;
  flex-shrink: 0;
  padding: 0.6rem 1rem;
  border-radius: 14px;
  border: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg-soft);
  transition: all 0.3s;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
}
.ipss .badge-label {
  font-size: 0.62rem;
  font-weight: 700;
  letter-spacing: 0.06em;
  color: var(--vp-c-text-3);
}
.ipss .score-number {
  font-size: 2rem;
  font-weight: 800;
  line-height: 1;
}
.ipss .score-unit {
  font-size: 0.65rem;
  font-weight: 600;
  margin-top: 1px;
}
.ipss .score-label {
  font-size: 0.62rem;
  font-weight: 600;
  margin-top: 3px;
  text-align: center;
}
.ipss .score-badge.filling {
  color: var(--vp-c-text-3);
}
.ipss .score-badge.normal {
  border-color: #22c55e;
  color: #22c55e;
  box-shadow:
    0 0 0 1px rgba(34, 197, 94, 0.08),
    0 1px 3px rgba(0, 0, 0, 0.04);
}
.ipss .score-badge.moderate {
  border-color: #f97316;
  color: #f97316;
  box-shadow:
    0 0 0 1px rgba(249, 115, 22, 0.08),
    0 1px 3px rgba(0, 0, 0, 0.04);
}
.ipss .score-badge.critical {
  border-color: #ef4444;
  color: #ef4444;
  box-shadow:
    0 0 0 1px rgba(239, 68, 68, 0.08),
    0 1px 3px rgba(0, 0, 0, 0.04);
}
.ipss /* ── Severity bar ────────────────────────────────────────────────── */
.severity-bar-wrap {
  margin-bottom: 2.5rem;
}
.ipss .severity-bar {
  position: relative;
  height: 8px;
  border-radius: 999px;
  background: var(--vp-c-bg-mute);
  overflow: hidden;
  margin-bottom: 4px;
  box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.08);
}
.ipss .severity-fill {
  height: 100%;
  border-radius: 999px;
  transition:
    width 0.5s cubic-bezier(0.22, 1, 0.36, 1),
    background 0.3s;
}
.ipss .severity-fill.filling {
  background: var(--vp-c-divider);
}
.ipss .severity-fill.normal {
  background: linear-gradient(90deg, #22c55e, #4ade80);
}
.ipss .severity-fill.moderate {
  background: linear-gradient(90deg, #f97316, #fb923c);
}
.ipss .severity-fill.critical {
  background: linear-gradient(90deg, #ef4444, #f87171);
}
.ipss .severity-ticks-abs,
.ipss .severity-labels-abs {
  position: relative;
  height: 14px;
  margin-top: 2px;
}
.ipss .severity-labels-abs {
  height: 13px;
  margin-top: 0;
}
.ipss .tick-abs {
  position: absolute;
  transform: translateX(-50%);
  font-size: 0.65rem;
  color: var(--vp-c-text-3);
  white-space: nowrap;
}
.ipss .tick-abs[style*="left: 0%"] {
  transform: translateX(0);
}
.ipss .tick-abs[style*="left: 100%"] {
  transform: translateX(-100%);
}
.ipss .label-abs {
  position: absolute;
  transform: translateX(-50%);
  font-size: 0.63rem;
  color: var(--vp-c-text-3);
  white-space: nowrap;
}
.ipss .label-abs[style*="left: 0%"] {
  transform: translateX(0);
}
.ipss .label-abs[style*="left: 100%"] {
  transform: translateX(-100%);
}
.ipss .tick-yellow {
  color: #f97316;
  font-weight: 700;
}
.ipss .tick-red {
  color: #ef4444;
  font-weight: 700;
}
.ipss /* ── Alert ───────────────────────────────────────────────────────── */
.ipss-alert {
  display: flex;
  align-items: flex-start;
  gap: 0.6rem;
  padding: 0.75rem 1rem;
  border-radius: 10px;
  font-size: 0.82rem;
  color: var(--vp-c-text-2);
  line-height: 1.6;
  margin-bottom: 1rem;
  box-shadow: 0 1px 3px rgba(239, 68, 68, 0.06);
}
.ipss .alert-moderate {
  background: rgba(249, 115, 22, 0.06);
  border: 1px solid rgba(249, 115, 22, 0.35);
}
.ipss .alert-critical {
  background: rgba(239, 68, 68, 0.06);
  border: 1px solid rgba(239, 68, 68, 0.35);
}
.ipss .alert-icon {
  color: #ef4444;
  flex-shrink: 0;
}
.ipss /* ── Groups ──────────────────────────────────────────────────────── */
.nihss-group {
  margin-bottom: 1.5rem;
}
.ipss .group-header-bar {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.65rem 0.85rem;
  border-radius: 10px;
  background: linear-gradient(
    135deg,
    rgba(59, 130, 246, 0.08),
    var(--vp-c-bg-mute),
    var(--vp-c-bg-soft)
  );
  border: 1px solid var(--vp-c-divider);
  border-left: 4px solid #dc2626;
  margin-bottom: 0.6rem;
  box-shadow: 0 1px 3px rgba(59, 130, 246, 0.06);
}
.ipss .q-bar {
  border-left: 4px solid #3b82f6;
}
.ipss .qol-bar {
  border-left: 4px solid #e879f9;
}
.ipss .group-icon {
  font-size: 1rem;
  flex-shrink: 0;
}
.ipss .group-label-text {
  font-size: 0.88rem;
  font-weight: 800;
  color: var(--vp-c-text-1);
}
.ipss .group-sub-text {
  font-size: 0.7rem;
  color: var(--vp-c-text-3);
  flex: 1;
}
.ipss .group-score-tally {
  font-size: 0.75rem;
  font-weight: 700;
  padding: 2px 8px;
  border-radius: 999px;
  flex-shrink: 0;
  min-width: 60px;
  text-align: center;
  border: 1px solid transparent;
  box-sizing: border-box;
}
.ipss .tally-scored {
  color: #3b82f6;
  background: rgba(59, 130, 246, 0.12);
  border-color: rgba(59, 130, 246, 0.25);
}
.ipss .tally-qol {
  color: #e879f9;
  background: rgba(232, 121, 249, 0.12);
  border-color: rgba(232, 121, 249, 0.25);
}
.ipss .tally-nd {
  color: var(--vp-c-text-3);
  background: var(--vp-c-bg-soft);
  border-color: var(--vp-c-divider);
}
.ipss /* ── Item cards ──────────────────────────────────────────────────── */
.item-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
.ipss .ipss-item {
  border: 1px solid var(--vp-c-divider);
  border-radius: 10px;
  background: var(--vp-c-bg-soft);
  overflow: hidden;
  transition: all 0.25s;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.03);
}
.ipss .ipss-item:hover {
  box-shadow: 0 3px 12px rgba(0, 0, 0, 0.06);
  border-color: var(--vp-c-divider);
}
.ipss .ipss-item.item-low {
  border-color: #22c55e;
}
.ipss .ipss-item.item-mid {
  border-color: #f97316;
}
.ipss .ipss-item.item-high {
  border-color: #ef4444;
}
.ipss .item-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  padding: 0.6rem 0.9rem;
  background: var(--vp-c-bg-mute);
  border-bottom: 1px solid var(--vp-c-divider);
  gap: 0.75rem;
}
.ipss .item-meta-row {
  display: flex;
  align-items: center;
  flex-shrink: 0;
  padding-top: 3px;
}
.ipss .item-qnum {
  font-size: 0.72rem;
  font-weight: 800;
  padding: 1px 7px;
  border-radius: 999px;
  white-space: nowrap;
}
.ipss .q-storage {
  color: #3b82f6;
  background: rgba(59, 130, 246, 0.12);
}
.ipss .q-voiding {
  color: #8b5cf6;
  background: rgba(139, 92, 246, 0.12);
}
.ipss .q-qol {
  color: #e879f9;
  background: rgba(232, 121, 249, 0.12);
}
.ipss .item-name-block {
  display: flex;
  flex-direction: column;
  gap: 2px;
  flex: 1;
}
.ipss .item-name {
  font-size: 0.88rem;
  font-weight: 600;
  color: var(--vp-c-text-1);
}
.ipss .item-sub {
  font-size: 0.68rem;
  color: var(--vp-c-text-3);
  line-height: 1.5;
}
.ipss .item-val {
  font-size: 0.85rem;
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
.ipss .val-low {
  color: #22c55e;
  border-color: rgba(34, 197, 94, 0.3);
  background: rgba(34, 197, 94, 0.06);
}
.ipss .val-mid {
  color: #f97316;
  border-color: rgba(249, 115, 22, 0.3);
  background: rgba(249, 115, 22, 0.06);
}
.ipss .val-high {
  color: #ef4444;
  border-color: rgba(239, 68, 68, 0.3);
  background: rgba(239, 68, 68, 0.06);
}
.ipss .val-nd {
  color: var(--vp-c-text-3);
  background: transparent;
  border-color: var(--vp-c-divider);
}
.ipss /* ── Option buttons — pill grid ─────────────────────────────────── */
.option-row {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 2px;
  padding: 3px;
  background: var(--vp-c-bg-mute);
}
.ipss .qol-row {
  grid-template-columns: repeat(7, 1fr);
}
.ipss .opt-pill {
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
  font-family: inherit;
  font-size: 0.72rem;
  font-weight: 600;
  line-height: 1.3;
}
.ipss .opt-pill:hover {
  border-color: var(--vp-c-divider);
  background: var(--vp-c-bg-soft);
}
.ipss .opt-num {
  font-size: 1rem;
  font-weight: 900;
  transition: color 0.2s;
}
.ipss .opt-desc {
  font-size: 0.7rem;
  font-weight: 700;
  line-height: 1.3;
  transition: color 0.2s;
}
.ipss /* s0 */
.opt-pill.s0 {
  border-color: rgba(34, 197, 94, 0.15);
}
.ipss .opt-pill.s0:hover:not(.active) {
  border-color: rgba(34, 197, 94, 0.35);
  background: rgba(34, 197, 94, 0.04);
}
.ipss .opt-pill.s0.active {
  border-color: #22c55e;
  background: linear-gradient(
    180deg,
    rgba(34, 197, 94, 0.12),
    rgba(34, 197, 94, 0.06)
  );
  box-shadow: 0 0 0 1px rgba(34, 197, 94, 0.08);
}
.ipss .opt-pill.s0 .opt-num {
  color: rgba(34, 197, 94, 0.5);
}
.ipss .opt-pill.s0.active .opt-num {
  color: #22c55e;
}
.ipss .opt-pill.s0 .opt-desc {
  color: rgba(34, 197, 94, 0.4);
}
.ipss .opt-pill.s0.active .opt-desc {
  color: rgba(34, 197, 94, 0.7);
}
.ipss /* s1 */
.opt-pill.s1 {
  border-color: rgba(132, 204, 22, 0.15);
}
.ipss .opt-pill.s1:hover:not(.active) {
  border-color: rgba(132, 204, 22, 0.35);
  background: rgba(132, 204, 22, 0.04);
}
.ipss .opt-pill.s1.active {
  border-color: #84cc16;
  background: linear-gradient(
    180deg,
    rgba(132, 204, 22, 0.12),
    rgba(132, 204, 22, 0.06)
  );
  box-shadow: 0 0 0 1px rgba(132, 204, 22, 0.08);
}
.ipss .opt-pill.s1 .opt-num {
  color: rgba(132, 204, 22, 0.5);
}
.ipss .opt-pill.s1.active .opt-num {
  color: #84cc16;
}
.ipss .opt-pill.s1 .opt-desc {
  color: rgba(132, 204, 22, 0.4);
}
.ipss .opt-pill.s1.active .opt-desc {
  color: rgba(132, 204, 22, 0.7);
}
.ipss /* s2 */
.opt-pill.s2 {
  border-color: rgba(234, 179, 8, 0.15);
}
.ipss .opt-pill.s2:hover:not(.active) {
  border-color: rgba(234, 179, 8, 0.35);
  background: rgba(234, 179, 8, 0.04);
}
.ipss .opt-pill.s2.active {
  border-color: #eab308;
  background: linear-gradient(
    180deg,
    rgba(234, 179, 8, 0.12),
    rgba(234, 179, 8, 0.06)
  );
  box-shadow: 0 0 0 1px rgba(234, 179, 8, 0.08);
}
.ipss .opt-pill.s2 .opt-num {
  color: rgba(234, 179, 8, 0.5);
}
.ipss .opt-pill.s2.active .opt-num {
  color: #eab308;
}
.ipss .opt-pill.s2 .opt-desc {
  color: rgba(234, 179, 8, 0.4);
}
.ipss .opt-pill.s2.active .opt-desc {
  color: rgba(234, 179, 8, 0.7);
}
.ipss /* s3 */
.opt-pill.s3 {
  border-color: rgba(245, 158, 11, 0.15);
}
.ipss .opt-pill.s3:hover:not(.active) {
  border-color: rgba(245, 158, 11, 0.35);
  background: rgba(245, 158, 11, 0.04);
}
.ipss .opt-pill.s3.active {
  border-color: #f59e0b;
  background: linear-gradient(
    180deg,
    rgba(245, 158, 11, 0.12),
    rgba(245, 158, 11, 0.06)
  );
  box-shadow: 0 0 0 1px rgba(245, 158, 11, 0.08);
}
.ipss .opt-pill.s3 .opt-num {
  color: rgba(245, 158, 11, 0.5);
}
.ipss .opt-pill.s3.active .opt-num {
  color: #f59e0b;
}
.ipss .opt-pill.s3 .opt-desc {
  color: rgba(245, 158, 11, 0.4);
}
.ipss .opt-pill.s3.active .opt-desc {
  color: rgba(245, 158, 11, 0.7);
}
.ipss /* s4 */
.opt-pill.s4 {
  border-color: rgba(249, 115, 22, 0.15);
}
.ipss .opt-pill.s4:hover:not(.active) {
  border-color: rgba(249, 115, 22, 0.35);
  background: rgba(249, 115, 22, 0.04);
}
.ipss .opt-pill.s4.active {
  border-color: #f97316;
  background: linear-gradient(
    180deg,
    rgba(249, 115, 22, 0.12),
    rgba(249, 115, 22, 0.06)
  );
  box-shadow: 0 0 0 1px rgba(249, 115, 22, 0.08);
}
.ipss .opt-pill.s4 .opt-num {
  color: rgba(249, 115, 22, 0.5);
}
.ipss .opt-pill.s4.active .opt-num {
  color: #f97316;
}
.ipss .opt-pill.s4 .opt-desc {
  color: rgba(249, 115, 22, 0.4);
}
.ipss .opt-pill.s4.active .opt-desc {
  color: rgba(249, 115, 22, 0.7);
}
.ipss /* s5 */
.opt-pill.s5 {
  border-color: rgba(239, 68, 68, 0.15);
}
.ipss .opt-pill.s5:hover:not(.active) {
  border-color: rgba(239, 68, 68, 0.35);
  background: rgba(239, 68, 68, 0.04);
}
.ipss .opt-pill.s5.active {
  border-color: #ef4444;
  background: linear-gradient(
    180deg,
    rgba(239, 68, 68, 0.12),
    rgba(239, 68, 68, 0.06)
  );
  box-shadow: 0 0 0 1px rgba(239, 68, 68, 0.08);
}
.ipss .opt-pill.s5 .opt-num {
  color: rgba(239, 68, 68, 0.5);
}
.ipss .opt-pill.s5.active .opt-num {
  color: #ef4444;
}
.ipss .opt-pill.s5 .opt-desc {
  color: rgba(239, 68, 68, 0.4);
}
.ipss .opt-pill.s5.active .opt-desc {
  color: rgba(239, 68, 68, 0.7);
}
.ipss /* s6 for QoL */
.opt-pill.s6 {
  border-color: rgba(220, 38, 38, 0.15);
}
.ipss .opt-pill.s6:hover:not(.active) {
  border-color: rgba(220, 38, 38, 0.35);
  background: rgba(220, 38, 38, 0.04);
}
.ipss .opt-pill.s6.active {
  border-color: #dc2626;
  background: linear-gradient(
    180deg,
    rgba(220, 38, 38, 0.12),
    rgba(220, 38, 38, 0.06)
  );
  box-shadow: 0 0 0 1px rgba(220, 38, 38, 0.08);
}
.ipss .opt-pill.s6 .opt-num {
  color: rgba(220, 38, 38, 0.5);
}
.ipss .opt-pill.s6.active .opt-num {
  color: #dc2626;
}
.ipss .opt-pill.s6 .opt-desc {
  color: rgba(220, 38, 38, 0.4);
}
.ipss .opt-pill.s6.active .opt-desc {
  color: rgba(220, 38, 38, 0.7);
}
.ipss /* ── QoL note ────────────────────────────────────────────────────── */
.qol-note {
  padding: 0.4rem 0.9rem;
  font-size: 0.78rem;
  color: var(--vp-c-text-2);
  background: rgba(232, 121, 249, 0.06);
  border-top: 1px solid var(--vp-c-divider);
}
.ipss /* ── Sub-score row ───────────────────────────────────────────────── */
.sub-score-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
  flex-wrap: wrap;
}
.ipss .sub-score-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 3px;
  padding: 0.55rem 0.6rem;
  border-radius: 10px;
  border: 1.5px solid var(--vp-c-divider);
  background: var(--vp-c-bg-soft);
  min-width: 80px;
  flex: 1;
  max-width: 130px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.03);
}
.ipss .ss-score-row {
  display: flex;
  align-items: baseline;
  gap: 3px;
}
.ipss .sub-score-card.ss-low {
  background: color-mix(in srgb, rgb(34, 197, 94) 8%, var(--vp-c-bg-soft));
  border-color: rgba(34, 197, 94, 0.35);
}
.ipss .sub-score-card.ss-mid {
  background: color-mix(in srgb, rgb(249, 115, 22) 8%, var(--vp-c-bg-soft));
  border-color: rgba(249, 115, 22, 0.35);
}
.ipss .sub-score-card.ss-high {
  background: color-mix(in srgb, rgb(239, 68, 68) 8%, var(--vp-c-bg-soft));
  border-color: rgba(239, 68, 68, 0.35);
}
.ipss .ss-total {
  max-width: 120px;
  min-width: 90px;
}
.ipss .sub-score-card.normal {
  background: color-mix(in srgb, rgb(34, 197, 94) 9%, var(--vp-c-bg-soft));
  border-color: rgba(34, 197, 94, 0.4);
}
.ipss .sub-score-card.moderate {
  background: color-mix(in srgb, rgb(249, 115, 22) 9%, var(--vp-c-bg-soft));
  border-color: rgba(249, 115, 22, 0.4);
}
.ipss .sub-score-card.critical {
  background: color-mix(in srgb, rgb(239, 68, 68) 9%, var(--vp-c-bg-soft));
  border-color: rgba(239, 68, 68, 0.4);
}
.ipss .ss-label {
  font-size: 0.65rem;
  color: var(--vp-c-text-3);
  font-weight: 600;
}
.ipss .ss-val {
  font-size: 1.5rem;
  font-weight: 800;
  color: var(--vp-c-text-1);
  line-height: 1;
}
.ipss .ss-max {
  font-size: 0.62rem;
  color: var(--vp-c-text-3);
}
.ipss .ss-note {
  font-size: 0.6rem;
  color: var(--vp-c-text-3);
}
.ipss .sub-score-card.ss-low .ss-val {
  color: #22c55e;
}
.ipss .sub-score-card.ss-mid .ss-val {
  color: #f97316;
}
.ipss .sub-score-card.ss-high .ss-val {
  color: #ef4444;
}
.ipss .ss-total .ss-val {
  font-size: 1.8rem;
}
.ipss .sub-score-card.normal .ss-val {
  color: #22c55e;
}
.ipss .sub-score-card.moderate .ss-val {
  color: #f97316;
}
.ipss .sub-score-card.critical .ss-val {
  color: #ef4444;
}
.ipss /* ── Result card ─────────────────────────────────────────────────── */
.ipss-result {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  padding: 1.25rem 1.5rem;
  border-radius: 14px;
  border: 1px solid var(--vp-c-divider);
  background: linear-gradient(135deg, var(--vp-c-bg-soft), var(--vp-c-bg-mute));
  margin-bottom: 1rem;
  height: 130px;
  box-sizing: border-box;
  transition: all 0.3s;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
}
.ipss .ipss-result.normal {
  border-color: #22c55e;
  box-shadow:
    0 0 0 1px rgba(34, 197, 94, 0.06),
    0 1px 3px rgba(0, 0, 0, 0.04);
}
.ipss .ipss-result.moderate {
  border-color: #f97316;
  box-shadow:
    0 0 0 1px rgba(249, 115, 22, 0.06),
    0 1px 3px rgba(0, 0, 0, 0.04);
}
.ipss .ipss-result.critical {
  border-color: #ef4444;
  box-shadow:
    0 0 0 1px rgba(239, 68, 68, 0.06),
    0 1px 3px rgba(0, 0, 0, 0.04);
}
.ipss .result-left {
  display: flex;
  align-items: baseline;
  gap: 4px;
  flex-shrink: 0;
}
.ipss .result-number {
  font-size: 3.5rem;
  font-weight: 800;
  line-height: 1;
  color: var(--vp-c-text-3);
  transition: color 0.3s;
}
.ipss .ipss-result.normal .result-number {
  color: #22c55e;
}
.ipss .ipss-result.moderate .result-number {
  color: #f97316;
}
.ipss .ipss-result.critical .result-number {
  color: #ef4444;
}
.ipss .result-max {
  font-size: 1rem;
  color: var(--vp-c-text-3);
}
.ipss .result-right {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.ipss .result-ver {
  font-size: 0.72rem;
  font-weight: 700;
  color: var(--vp-c-text-3);
}
.ipss .result-level {
  font-size: 1rem;
  font-weight: 700;
  color: var(--vp-c-text-1);
}
.ipss .result-advice {
  font-size: 0.83rem;
  color: var(--vp-c-text-2);
  line-height: 1.5;
}
.ipss /* ── Results detail ──────────────────────────────────────────────── */
.results-detail {
  border: 1px solid var(--vp-c-divider);
  border-radius: 10px;
  overflow: hidden;
  margin-bottom: 1rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.03);
}
.ipss .results-header {
  padding: 0.5rem 0.9rem;
  font-size: 0.72rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--vp-c-text-3);
  background: var(--vp-c-bg-mute);
  border-bottom: 1px solid var(--vp-c-divider);
}
.ipss .detail-row {
  display: flex;
  align-items: flex-start;
  gap: 0.6rem;
  padding: 0.5rem 0.9rem;
  border-bottom: 1px solid var(--vp-c-divider);
}
.ipss .detail-row:last-child {
  border-bottom: none;
}
.ipss .detail-total {
  background: linear-gradient(135deg, var(--vp-c-bg-mute), var(--vp-c-bg-soft));
}
.ipss .detail-qnum {
  font-size: 0.7rem;
  font-weight: 800;
  color: #3b82f6;
  flex-shrink: 0;
  width: 32px;
  padding-top: 1px;
}
.ipss .detail-domain {
  font-size: 0.78rem;
  font-weight: 700;
  color: var(--vp-c-text-1);
  flex: 1;
  line-height: 1.5;
}
.ipss .detail-score {
  font-size: 0.82rem;
  font-weight: 800;
  flex-shrink: 0;
  width: 52px;
  text-align: right;
  color: var(--vp-c-text-3);
}
.ipss .ds-low {
  color: #22c55e;
}
.ipss .ds-mid {
  color: #f97316;
}
.ipss .ds-high {
  color: #ef4444;
}
.ipss .detail-score-brand {
  color: var(--vp-c-brand-1);
}
.ipss .detail-desc {
  font-size: 0.75rem;
  color: var(--vp-c-text-2);
  flex-shrink: 0;
  width: 100px;
}
.ipss .detail-desc-block {
  display: flex;
  flex-direction: column;
  gap: 1px;
  width: 100px;
  flex-shrink: 0;
}
.ipss .detail-desc-unit {
  font-size: 0.75rem;
  color: var(--vp-c-text-2);
}
.ipss .detail-desc-label {
  font-size: 0.73rem;
  font-weight: 700;
  color: var(--vp-c-brand-1);
  white-space: normal;
}
.ipss /* ── Warn box ────────────────────────────────────────────────────── */
.warn-box {
  display: flex;
  gap: 0.6rem;
  padding: 0.75rem 1rem;
  border-radius: 10px;
  background: rgba(249, 115, 22, 0.06);
  border: 1px solid rgba(249, 115, 22, 0.3);
  font-size: 0.8rem;
  color: var(--vp-c-text-2);
  line-height: 1.6;
  margin-bottom: 1rem;
}
.ipss .warn-icon {
  color: #f97316;
  flex-shrink: 0;
}
.ipss /* ── Actions ─────────────────────────────────────────────────────── */
.ipss-actions {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
}
.ipss .btn-view,
.ipss .btn-copy,
.ipss .btn-reset {
  padding: 9px 22px;
  border-radius: 8px;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  font-family: inherit;
  transition: all 0.2s;
}
.ipss .btn-view {
  border: none;
  background: linear-gradient(135deg, var(--vp-c-brand-1), #4f46e5);
  color: #fff;
  box-shadow: 0 2px 8px rgba(99, 102, 241, 0.3);
}
.ipss .btn-view:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 14px rgba(99, 102, 241, 0.4);
}
.ipss .btn-view:active {
  transform: translateY(0);
}
.ipss .btn-copy {
  border: 1.5px solid var(--vp-c-brand-1);
  background: transparent;
  color: var(--vp-c-brand-1);
}
.ipss .btn-copy:hover:not(:disabled) {
  background: var(--vp-c-brand-soft);
}
.ipss .btn-copy:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}
.ipss .btn-reset {
  border: 1px solid var(--vp-c-divider);
  background: transparent;
  color: var(--vp-c-text-2);
}
.ipss .btn-reset:hover {
  border-color: #ef4444;
  color: #ef4444;
  background: rgba(239, 68, 68, 0.04);
}
.ipss .progress-hint {
  font-size: 0.75rem;
  color: var(--vp-c-text-3);
  margin: 0.4rem 0 0;
}

@media (max-width: 640px) {
  .ipss .ipss-header {
    flex-wrap: wrap;
  }
  .ipss .score-badge {
    align-self: flex-start;
  }
  .ipss .score-number {
    font-size: 1.5rem;
  }
  .ipss .ipss-result {
    flex-direction: column;
    gap: 0.75rem;
    height: auto;
  }
  .ipss .option-row {
    grid-template-columns: repeat(3, 1fr);
  }
  .ipss .sub-score-row {
    gap: 0.3rem;
  }
}
/* ══ NIH-CPSI 慢性攝護腺炎 ══ */

.cpsi {
  max-width: 780px;
  margin: 0 auto;
  padding: 2rem 0 3rem;
  font-size: 0.9rem;
}
.cpsi /* ── Header ─────────────────────────────────────────────────────── */
.cpsi-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 1.25rem;
  flex-wrap: nowrap;
}
.cpsi .header-title {
  flex: 1;
  min-width: 0;
}
.cpsi .title {
  font-size: 24px;
  font-weight: 600;
  color: var(--vp-c-text-1);
  margin: 0 0 0.2rem;
  border: none !important;
  padding: 0 !important;
}
.cpsi .subtitle {
  font-size: 0.75rem;
  color: var(--vp-c-text-3);
  margin: 0;
  line-height: 1.6;
}
.cpsi /* ── Score badge ─────────────────────────────────────────────────── */
.score-badge {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 130px;
  padding: 0.6rem 1rem;
  border-radius: 14px;
  border: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg-soft);
  transition: all 0.3s;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
}
.cpsi .badge-label {
  font-size: 0.55rem;
  font-weight: 700;
  letter-spacing: 0.04em;
  color: var(--vp-c-text-3);
}
.cpsi .score-number {
  font-size: 2rem;
  font-weight: 800;
  line-height: 1;
  transition: color 0.3s;
}
.cpsi .score-unit {
  font-size: 0.65rem;
  font-weight: 600;
  margin-top: 1px;
}
.cpsi .score-label {
  font-size: 0.62rem;
  font-weight: 600;
  margin-top: 3px;
  text-align: center;
}
.cpsi .score-badge.filling {
  color: var(--vp-c-text-3);
}
.cpsi .score-badge.normal {
  border-color: #22c55e;
  color: #22c55e;
  box-shadow:
    0 0 0 1px rgba(34, 197, 94, 0.08),
    0 1px 3px rgba(0, 0, 0, 0.04);
}
.cpsi .score-badge.moderate {
  border-color: #f97316;
  color: #f97316;
  box-shadow:
    0 0 0 1px rgba(249, 115, 22, 0.08),
    0 1px 3px rgba(0, 0, 0, 0.04);
}
.cpsi .score-badge.critical {
  border-color: #ef4444;
  color: #ef4444;
  box-shadow:
    0 0 0 1px rgba(239, 68, 68, 0.08),
    0 1px 3px rgba(0, 0, 0, 0.04);
}
.cpsi /* ── Severity bar ────────────────────────────────────────────────── */
.severity-bar-wrap {
  margin-bottom: 2.5rem;
}
.cpsi .severity-bar {
  position: relative;
  height: 8px;
  border-radius: 999px;
  background: var(--vp-c-bg-mute);
  overflow: visible;
  margin-bottom: 4px;
  box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.08);
}
.cpsi .severity-fill {
  height: 100%;
  border-radius: 999px;
  transition:
    width 0.5s cubic-bezier(0.22, 1, 0.36, 1),
    background 0.3s;
}
.cpsi .severity-fill.filling {
  background: var(--vp-c-divider);
}
.cpsi .severity-fill.normal {
  background: linear-gradient(90deg, #22c55e, #4ade80);
}
.cpsi .severity-fill.moderate {
  background: linear-gradient(90deg, #f97316, #fb923c);
}
.cpsi .severity-fill.critical {
  background: linear-gradient(90deg, #ef4444, #f87171);
}
.cpsi .severity-ticks-abs,
.cpsi .severity-labels-abs {
  position: relative;
  height: 14px;
  margin-top: 2px;
}
.cpsi .severity-labels-abs {
  height: 13px;
  margin-top: 0;
}
.cpsi .tick-abs {
  position: absolute;
  transform: translateX(-50%);
  font-size: 0.65rem;
  color: var(--vp-c-text-3);
  white-space: nowrap;
}
.cpsi .tick-abs[style*="left: 0%"] {
  transform: translateX(0);
}
.cpsi .tick-abs[style*="left: 100%"] {
  transform: translateX(-100%);
}
.cpsi .label-abs {
  position: absolute;
  transform: translateX(-50%);
  font-size: 0.63rem;
  color: var(--vp-c-text-3);
  white-space: nowrap;
}
.cpsi .label-abs[style*="left: 0%"] {
  transform: translateX(0);
}
.cpsi .label-abs[style*="left: 100%"] {
  transform: translateX(-100%);
}
.cpsi .tick-yellow {
  color: #f97316;
  font-weight: 700;
}
.cpsi .tick-red {
  color: #ef4444;
  font-weight: 700;
}
.cpsi /* ── Alert ───────────────────────────────────────────────────────── */
.cpsi-alert {
  display: flex;
  align-items: flex-start;
  gap: 0.6rem;
  padding: 0.75rem 1rem;
  border-radius: 10px;
  font-size: 0.82rem;
  color: var(--vp-c-text-2);
  line-height: 1.6;
  margin-bottom: 1rem;
  box-shadow: 0 1px 3px rgba(239, 68, 68, 0.06);
}
.cpsi .alert-moderate {
  background: rgba(249, 115, 22, 0.06);
  border: 1px solid rgba(249, 115, 22, 0.35);
}
.cpsi .alert-critical {
  background: rgba(239, 68, 68, 0.06);
  border: 1px solid rgba(239, 68, 68, 0.35);
}
.cpsi .alert-icon {
  color: #ef4444;
  flex-shrink: 0;
}
.cpsi /* ── Groups ──────────────────────────────────────────────────────── */
.nihss-group {
  margin-bottom: 1.5rem;
}
.cpsi .group-header-bar {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.65rem 0.85rem 0.65rem 1.5rem;
  border-radius: 10px;
  background: linear-gradient(
    135deg,
    rgba(239, 68, 68, 0.08),
    var(--vp-c-bg-mute),
    var(--vp-c-bg-soft)
  );
  border: 1px solid var(--vp-c-divider);
  border-left: 4px solid #ef4444;
  box-shadow: 0 1px 3px rgba(239, 68, 68, 0.06);
  margin-bottom: 0.6rem;
}
.cpsi .pain-bar {
  border-left-color: #ef4444;
  background: linear-gradient(
    135deg,
    rgba(239, 68, 68, 0.08),
    var(--vp-c-bg-mute),
    var(--vp-c-bg-soft)
  );
  box-shadow: 0 1px 3px rgba(239, 68, 68, 0.06);
}
.cpsi .urinary-bar {
  border-left-color: #3b82f6;
  background: linear-gradient(
    135deg,
    rgba(59, 130, 246, 0.08),
    var(--vp-c-bg-mute),
    var(--vp-c-bg-soft)
  );
  box-shadow: 0 1px 3px rgba(59, 130, 246, 0.06);
}
.cpsi .qol-bar {
  border-left-color: #a855f7;
  background: linear-gradient(
    135deg,
    rgba(168, 85, 247, 0.08),
    var(--vp-c-bg-mute),
    var(--vp-c-bg-soft)
  );
  box-shadow: 0 1px 3px rgba(168, 85, 247, 0.06);
}
.cpsi .group-icon {
  font-size: 1rem;
  flex-shrink: 0;
}
.cpsi .group-label-text {
  font-size: 0.88rem;
  font-weight: 800;
  color: var(--vp-c-text-1);
}
.cpsi .group-sub-text {
  font-size: 0.7rem;
  color: var(--vp-c-text-3);
  flex: 1;
}
.cpsi .group-score-tally {
  font-size: 0.75rem;
  font-weight: 700;
  padding: 2px 8px;
  border-radius: 999px;
  flex-shrink: 0;
  min-width: 60px;
  text-align: center;
  border: 1px solid transparent;
  box-sizing: border-box;
}
.cpsi .tally-pain {
  color: #ef4444;
  background: rgba(239, 68, 68, 0.12);
  border-color: rgba(239, 68, 68, 0.25);
}
.cpsi .tally-urinary {
  color: #3b82f6;
  background: rgba(59, 130, 246, 0.12);
  border-color: rgba(59, 130, 246, 0.25);
}
.cpsi .tally-qol {
  color: #e879f9;
  background: rgba(232, 121, 249, 0.12);
  border-color: rgba(232, 121, 249, 0.25);
}
.cpsi .tally-nd {
  color: var(--vp-c-text-3);
  background: var(--vp-c-bg-soft);
  border-color: var(--vp-c-divider);
}
.cpsi /* ── Item cards ──────────────────────────────────────────────────── */
.cpsi-item {
  border: 1px solid var(--vp-c-divider);
  border-radius: 10px;
  background: var(--vp-c-bg-soft);
  overflow: hidden;
  transition: all 0.25s;
  margin-bottom: 0.5rem;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.03);
}
.cpsi .cpsi-item:hover {
  box-shadow: 0 3px 12px rgba(0, 0, 0, 0.06);
  border-color: var(--vp-c-divider);
}
.cpsi .cpsi-item.item-ok {
  border-color: #22c55e;
  background: color-mix(in srgb, rgb(34, 197, 94) 6%, var(--vp-c-bg));
}
.cpsi .cpsi-item.item-ok .item-header {
  background: transparent;
}
.cpsi .cpsi-item.item-low {
  border-color: #22c55e;
}
.cpsi .cpsi-item.item-mid {
  border-color: #f97316;
}
.cpsi .cpsi-item.item-high {
  border-color: #ef4444;
}
.cpsi .cpsi-item.item-pain {
  border-color: #ef4444;
  background: color-mix(in srgb, rgb(239, 68, 68) 6%, var(--vp-c-bg));
}
.cpsi .cpsi-item.item-pain .item-header {
  background: transparent;
}
.cpsi .item-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  padding: 0.6rem 0.9rem;
  background: var(--vp-c-bg-mute);
  border-bottom: 1px solid var(--vp-c-divider);
  gap: 0.75rem;
}
.cpsi .item-meta-row {
  display: flex;
  align-items: center;
  flex-shrink: 0;
  padding-top: 3px;
}
.cpsi .item-qnum {
  font-size: 0.72rem;
  font-weight: 800;
  color: #fff;
  padding: 1px 9px;
  border-radius: 999px;
  letter-spacing: 0.04em;
  box-shadow: 0 1px 3px rgba(239, 68, 68, 0.2);
  white-space: nowrap;
}
.cpsi .q-pain {
  background: linear-gradient(135deg, #ef4444, #dc2626);
}
.cpsi .q-urinary {
  background: linear-gradient(135deg, #3b82f6, #2563eb);
  box-shadow: 0 1px 3px rgba(59, 130, 246, 0.2);
}
.cpsi .q-qol {
  background: linear-gradient(135deg, #a855f7, #7c3aed);
  box-shadow: 0 1px 3px rgba(168, 85, 247, 0.2);
}
.cpsi .item-name-block {
  display: flex;
  flex-direction: column;
  gap: 2px;
  flex: 1;
}
.cpsi .item-name {
  font-size: 0.88rem;
  font-weight: 600;
  color: var(--vp-c-text-1);
}
.cpsi .item-sub {
  font-size: 0.68rem;
  color: var(--vp-c-text-3);
  line-height: 1.5;
}
.cpsi .item-val {
  font-size: 0.85rem;
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
.cpsi .val-ok {
  color: #22c55e;
  border-color: rgba(34, 197, 94, 0.3);
  background: rgba(34, 197, 94, 0.06);
}
.cpsi .val-low {
  color: #22c55e;
  border-color: rgba(34, 197, 94, 0.3);
  background: rgba(34, 197, 94, 0.06);
}
.cpsi .val-mid {
  color: #f97316;
  border-color: rgba(249, 115, 22, 0.3);
  background: rgba(249, 115, 22, 0.06);
}
.cpsi .val-high {
  color: #ef4444;
  border-color: rgba(239, 68, 68, 0.3);
  background: rgba(239, 68, 68, 0.06);
}
.cpsi .val-pain {
  color: #ef4444;
  border-color: rgba(239, 68, 68, 0.3);
  background: rgba(239, 68, 68, 0.06);
}
.cpsi .val-nd {
  color: var(--vp-c-text-3);
  background: transparent;
  border-color: var(--vp-c-divider);
}
.cpsi /* ── Checkbox grid ───────────────────────────────────────────────── */
.checkbox-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.4rem;
  padding: 0.65rem 0.9rem;
}
.cpsi .check-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.4rem 0.6rem;
  border-radius: 8px;
  border: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg-soft);
  cursor: pointer;
  font-size: 0.8rem;
  color: var(--vp-c-text-2);
  transition: all 0.15s;
}
.cpsi .check-item.check-active {
  border-color: #ef4444;
  background: rgba(239, 68, 68, 0.07);
  color: #ef4444;
}
.cpsi .check-item input[type="checkbox"] {
  cursor: pointer;
  accent-color: #ef4444;
}
.cpsi .check-label {
  flex: 1;
}
.cpsi /* ── Option pills (grid) ─────────────────────────────────────────── */
.option-row {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 2px;
  padding: 3px;
  background: var(--vp-c-bg-mute);
  border-top: 1px solid var(--vp-c-divider);
}
.cpsi .opt-pill {
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
.cpsi .opt-pill:hover {
  border-color: var(--vp-c-divider);
  background: var(--vp-c-bg-soft);
}
.cpsi .opt-num {
  font-size: 1rem;
  font-weight: 900;
  transition: color 0.2s;
}
.cpsi .opt-desc {
  font-size: 0.7rem;
  font-weight: 700;
  line-height: 1.3;
  transition: color 0.2s;
}
.cpsi /* Score-specific colors — s0 through s6 */
.opt-pill.s0 {
  border-color: rgba(34, 197, 94, 0.15);
}
.cpsi .opt-pill.s0:hover:not(.active) {
  border-color: rgba(34, 197, 94, 0.35);
  background: rgba(34, 197, 94, 0.04);
}
.cpsi .opt-pill.s0.active {
  border-color: #22c55e;
  background: linear-gradient(
    180deg,
    rgba(34, 197, 94, 0.12),
    rgba(34, 197, 94, 0.06)
  );
  box-shadow: 0 0 0 1px rgba(34, 197, 94, 0.08);
}
.cpsi .opt-pill.s0 .opt-num {
  color: rgba(34, 197, 94, 0.5);
}
.cpsi .opt-pill.s0.active .opt-num {
  color: #22c55e;
}
.cpsi .opt-pill.s0 .opt-desc {
  color: rgba(34, 197, 94, 0.4);
}
.cpsi .opt-pill.s0.active .opt-desc {
  color: rgba(34, 197, 94, 0.7);
}
.cpsi .opt-pill.s1 {
  border-color: rgba(132, 204, 22, 0.15);
}
.cpsi .opt-pill.s1:hover:not(.active) {
  border-color: rgba(132, 204, 22, 0.35);
  background: rgba(132, 204, 22, 0.04);
}
.cpsi .opt-pill.s1.active {
  border-color: #84cc16;
  background: linear-gradient(
    180deg,
    rgba(132, 204, 22, 0.12),
    rgba(132, 204, 22, 0.06)
  );
  box-shadow: 0 0 0 1px rgba(132, 204, 22, 0.08);
}
.cpsi .opt-pill.s1 .opt-num {
  color: rgba(132, 204, 22, 0.5);
}
.cpsi .opt-pill.s1.active .opt-num {
  color: #84cc16;
}
.cpsi .opt-pill.s1 .opt-desc {
  color: rgba(132, 204, 22, 0.4);
}
.cpsi .opt-pill.s1.active .opt-desc {
  color: rgba(132, 204, 22, 0.7);
}
.cpsi .opt-pill.s2 {
  border-color: rgba(234, 179, 8, 0.15);
}
.cpsi .opt-pill.s2:hover:not(.active) {
  border-color: rgba(234, 179, 8, 0.35);
  background: rgba(234, 179, 8, 0.04);
}
.cpsi .opt-pill.s2.active {
  border-color: #eab308;
  background: linear-gradient(
    180deg,
    rgba(234, 179, 8, 0.12),
    rgba(234, 179, 8, 0.06)
  );
  box-shadow: 0 0 0 1px rgba(234, 179, 8, 0.08);
}
.cpsi .opt-pill.s2 .opt-num {
  color: rgba(234, 179, 8, 0.5);
}
.cpsi .opt-pill.s2.active .opt-num {
  color: #eab308;
}
.cpsi .opt-pill.s2 .opt-desc {
  color: rgba(234, 179, 8, 0.4);
}
.cpsi .opt-pill.s2.active .opt-desc {
  color: rgba(234, 179, 8, 0.7);
}
.cpsi .opt-pill.s3 {
  border-color: rgba(245, 158, 11, 0.15);
}
.cpsi .opt-pill.s3:hover:not(.active) {
  border-color: rgba(245, 158, 11, 0.35);
  background: rgba(245, 158, 11, 0.04);
}
.cpsi .opt-pill.s3.active {
  border-color: #f59e0b;
  background: linear-gradient(
    180deg,
    rgba(245, 158, 11, 0.12),
    rgba(245, 158, 11, 0.06)
  );
  box-shadow: 0 0 0 1px rgba(245, 158, 11, 0.08);
}
.cpsi .opt-pill.s3 .opt-num {
  color: rgba(245, 158, 11, 0.5);
}
.cpsi .opt-pill.s3.active .opt-num {
  color: #f59e0b;
}
.cpsi .opt-pill.s3 .opt-desc {
  color: rgba(245, 158, 11, 0.4);
}
.cpsi .opt-pill.s3.active .opt-desc {
  color: rgba(245, 158, 11, 0.7);
}
.cpsi .opt-pill.s4 {
  border-color: rgba(249, 115, 22, 0.15);
}
.cpsi .opt-pill.s4:hover:not(.active) {
  border-color: rgba(249, 115, 22, 0.35);
  background: rgba(249, 115, 22, 0.04);
}
.cpsi .opt-pill.s4.active {
  border-color: #f97316;
  background: linear-gradient(
    180deg,
    rgba(249, 115, 22, 0.12),
    rgba(249, 115, 22, 0.06)
  );
  box-shadow: 0 0 0 1px rgba(249, 115, 22, 0.08);
}
.cpsi .opt-pill.s4 .opt-num {
  color: rgba(249, 115, 22, 0.5);
}
.cpsi .opt-pill.s4.active .opt-num {
  color: #f97316;
}
.cpsi .opt-pill.s4 .opt-desc {
  color: rgba(249, 115, 22, 0.4);
}
.cpsi .opt-pill.s4.active .opt-desc {
  color: rgba(249, 115, 22, 0.7);
}
.cpsi .opt-pill.s5 {
  border-color: rgba(239, 68, 68, 0.15);
}
.cpsi .opt-pill.s5:hover:not(.active) {
  border-color: rgba(239, 68, 68, 0.35);
  background: rgba(239, 68, 68, 0.04);
}
.cpsi .opt-pill.s5.active {
  border-color: #ef4444;
  background: linear-gradient(
    180deg,
    rgba(239, 68, 68, 0.12),
    rgba(239, 68, 68, 0.06)
  );
  box-shadow: 0 0 0 1px rgba(239, 68, 68, 0.08);
}
.cpsi .opt-pill.s5 .opt-num {
  color: rgba(239, 68, 68, 0.5);
}
.cpsi .opt-pill.s5.active .opt-num {
  color: #ef4444;
}
.cpsi .opt-pill.s5 .opt-desc {
  color: rgba(239, 68, 68, 0.4);
}
.cpsi .opt-pill.s5.active .opt-desc {
  color: rgba(239, 68, 68, 0.7);
}
.cpsi .opt-pill.s6 {
  border-color: rgba(220, 38, 38, 0.15);
}
.cpsi .opt-pill.s6:hover:not(.active) {
  border-color: rgba(220, 38, 38, 0.35);
  background: rgba(220, 38, 38, 0.04);
}
.cpsi .opt-pill.s6.active {
  border-color: #dc2626;
  background: linear-gradient(
    180deg,
    rgba(220, 38, 38, 0.12),
    rgba(220, 38, 38, 0.06)
  );
  box-shadow: 0 0 0 1px rgba(220, 38, 38, 0.08);
}
.cpsi .opt-pill.s6 .opt-num {
  color: rgba(220, 38, 38, 0.5);
}
.cpsi .opt-pill.s6.active .opt-num {
  color: #dc2626;
}
.cpsi .opt-pill.s6 .opt-desc {
  color: rgba(220, 38, 38, 0.4);
}
.cpsi .opt-pill.s6.active .opt-desc {
  color: rgba(220, 38, 38, 0.7);
}
.cpsi /* Grid column variants */
.q2-row {
  grid-template-columns: repeat(2, 1fr);
}
.cpsi .q3-row {
  grid-template-columns: repeat(5, 1fr);
}
.cpsi .q4-row {
  grid-template-columns: repeat(4, 1fr);
}
.cpsi .qol-row {
  grid-template-columns: repeat(7, 1fr);
}
.cpsi /* ── NRS grid (Q4,
.cpsi 11 cols) ───────────────────────────────────────── */
.nrs-grid {
  display: grid;
  grid-template-columns: repeat(11, 1fr);
  gap: 2px;
  padding: 3px;
  background: var(--vp-c-bg-mute);
  border-top: 1px solid var(--vp-c-divider);
}
.cpsi .nrs-pill {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.55rem 0;
  cursor: pointer;
  transition: all 0.2s;
  text-align: center;
  border-radius: 6px;
  background: var(--vp-c-bg);
  border: 1.5px solid transparent;
}
.cpsi .nrs-pill:hover {
  border-color: var(--vp-c-divider);
  background: var(--vp-c-bg-soft);
}
.cpsi .nrs-num {
  font-size: 0.95rem;
  font-weight: 800;
  transition: color 0.2s;
}
.cpsi .nrs-pill.active {
  border-color: #f97316;
  box-shadow: 0 0 0 1px rgba(249, 115, 22, 0.08);
}
.cpsi .nrs-pill.nrs-low.active {
  border-color: #22c55e;
  background: rgba(34, 197, 94, 0.06);
  box-shadow: 0 0 0 1px rgba(34, 197, 94, 0.08);
}
.cpsi .nrs-pill.nrs-low.active .nrs-num {
  color: #22c55e;
}
.cpsi .nrs-pill.nrs-mid.active {
  border-color: #f97316;
  background: rgba(249, 115, 22, 0.06);
}
.cpsi .nrs-pill.nrs-mid.active .nrs-num {
  color: #f97316;
}
.cpsi .nrs-pill.nrs-high.active {
  border-color: #ef4444;
  background: rgba(239, 68, 68, 0.06);
  box-shadow: 0 0 0 1px rgba(239, 68, 68, 0.08);
}
.cpsi .nrs-pill.nrs-high.active .nrs-num {
  color: #ef4444;
}
.cpsi .nrs-pill .nrs-num {
  color: var(--vp-c-text-3);
}
.cpsi .nrs-labels {
  display: flex;
  justify-content: space-between;
  padding: 0.25rem 0.9rem;
  font-size: 0.65rem;
  color: var(--vp-c-text-3);
  border-top: 1px dashed var(--vp-c-divider);
}
.cpsi /* ── Sub-score row ───────────────────────────────────────────────── */
.sub-score-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
  flex-wrap: wrap;
}
.cpsi .sub-score-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0.5rem 0.75rem;
  border-radius: 10px;
  border: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg-soft);
  min-width: 68px;
  flex: 1;
  max-width: 110px;
  transition: all 0.3s;
}
.cpsi .ss-low {
  border-color: #22c55e;
  background: color-mix(in srgb, rgb(34, 197, 94) 7%, var(--vp-c-bg-soft));
}
.cpsi .ss-mid {
  border-color: #f97316;
  background: color-mix(in srgb, rgb(249, 115, 22) 7%, var(--vp-c-bg-soft));
}
.cpsi .ss-high {
  border-color: #ef4444;
  background: color-mix(in srgb, rgb(239, 68, 68) 7%, var(--vp-c-bg-soft));
}
.cpsi .ss-nd {
  opacity: 0.5;
}
.cpsi .ss-total {
  max-width: 100px;
}
.cpsi .sub-score-card.normal {
  border-color: #22c55e;
  background: color-mix(in srgb, rgb(34, 197, 94) 7%, var(--vp-c-bg-soft));
}
.cpsi .sub-score-card.moderate {
  border-color: #f97316;
  background: color-mix(in srgb, rgb(249, 115, 22) 7%, var(--vp-c-bg-soft));
}
.cpsi .sub-score-card.critical {
  border-color: #ef4444;
  background: color-mix(in srgb, rgb(239, 68, 68) 7%, var(--vp-c-bg-soft));
}
.cpsi .ss-label {
  font-size: 0.63rem;
  color: var(--vp-c-text-3);
  font-weight: 600;
}
.cpsi .ss-score-row {
  display: flex;
  align-items: baseline;
  gap: 2px;
  line-height: 1;
}
.cpsi .ss-val {
  font-size: 1.5rem;
  font-weight: 800;
  color: var(--vp-c-text-1);
  line-height: 1;
}
.cpsi .ss-max {
  font-size: 0.6rem;
  color: var(--vp-c-text-3);
}
.cpsi .ss-note {
  font-size: 0.55rem;
  color: var(--vp-c-text-3);
  font-weight: 600;
  margin-top: 2px;
}
.cpsi .ss-low .ss-val {
  color: #22c55e;
}
.cpsi .ss-mid .ss-val {
  color: #f97316;
}
.cpsi .ss-high .ss-val {
  color: #ef4444;
}
.cpsi .sub-score-card.normal .ss-val {
  color: #22c55e;
}
.cpsi .sub-score-card.moderate .ss-val {
  color: #f97316;
}
.cpsi .sub-score-card.critical .ss-val {
  color: #ef4444;
}
.cpsi /* ── Result card ─────────────────────────────────────────────────── */
.cpsi-result {
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
.cpsi .cpsi-result.normal {
  border-color: #22c55e;
  box-shadow:
    0 0 0 1px rgba(34, 197, 94, 0.06),
    0 1px 3px rgba(0, 0, 0, 0.04);
}
.cpsi .cpsi-result.moderate {
  border-color: #f97316;
  box-shadow:
    0 0 0 1px rgba(249, 115, 22, 0.06),
    0 1px 3px rgba(0, 0, 0, 0.04);
}
.cpsi .cpsi-result.critical {
  border-color: #ef4444;
  box-shadow:
    0 0 0 1px rgba(239, 68, 68, 0.06),
    0 1px 3px rgba(0, 0, 0, 0.04);
}
.cpsi .result-left {
  display: flex;
  align-items: baseline;
  gap: 4px;
  flex-shrink: 0;
}
.cpsi .result-number {
  font-size: 3.5rem;
  font-weight: 800;
  line-height: 1;
  color: var(--vp-c-text-3);
  transition: color 0.3s;
}
.cpsi .cpsi-result.normal .result-number {
  color: #22c55e;
}
.cpsi .cpsi-result.moderate .result-number {
  color: #f97316;
}
.cpsi .cpsi-result.critical .result-number {
  color: #ef4444;
}
.cpsi .result-max {
  font-size: 1rem;
  color: var(--vp-c-text-3);
}
.cpsi .result-right {
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: 1;
}
.cpsi .result-level {
  font-size: 1rem;
  font-weight: 700;
  color: var(--vp-c-text-1);
}
.cpsi .result-advice {
  font-size: 0.83rem;
  color: var(--vp-c-text-2);
  line-height: 1.5;
}
.cpsi /* ── Results detail ──────────────────────────────────────────────── */
.results-detail {
  border: 1px solid var(--vp-c-divider);
  border-radius: 10px;
  overflow: hidden;
  margin-bottom: 1rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.03);
}
.cpsi .results-header {
  padding: 0.5rem 0.9rem;
  font-size: 0.72rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--vp-c-text-3);
  background: var(--vp-c-bg-mute);
  border-bottom: 1px solid var(--vp-c-divider);
}
.cpsi .detail-row {
  display: flex;
  align-items: flex-start;
  gap: 0.6rem;
  padding: 0.5rem 0.9rem;
  border-bottom: 1px solid var(--vp-c-divider);
}
.cpsi .detail-row:last-child {
  border-bottom: none;
}
.cpsi .detail-total {
  background: linear-gradient(135deg, var(--vp-c-bg-mute), var(--vp-c-bg-soft));
}
.cpsi .detail-qnum {
  font-size: 0.68rem;
  font-weight: 800;
  color: #ef4444;
  flex-shrink: 0;
  width: 40px;
  padding-top: 1px;
}
.cpsi .detail-domain {
  font-size: 0.78rem;
  font-weight: 700;
  color: var(--vp-c-text-1);
  flex: 1;
  line-height: 1.5;
}
.cpsi .detail-score {
  font-size: 0.82rem;
  font-weight: 800;
  flex-shrink: 0;
  width: 52px;
  text-align: right;
  color: var(--vp-c-text-3);
}
.cpsi .ds-low {
  color: #22c55e;
}
.cpsi .ds-mid {
  color: #f97316;
}
.cpsi .ds-high {
  color: #ef4444;
}
.cpsi .ds-brand {
  color: var(--vp-c-brand-1);
}
.cpsi .detail-score-brand {
  color: var(--vp-c-brand-1);
}
.cpsi .detail-desc {
  font-size: 0.75rem;
  color: var(--vp-c-text-2);
  flex-shrink: 0;
  width: 82px;
  white-space: normal;
}
.cpsi .detail-desc-block {
  display: flex;
  flex-direction: column;
  gap: 1px;
  width: 82px;
  flex-shrink: 0;
}
.cpsi .detail-desc-unit {
  font-size: 0.75rem;
  color: var(--vp-c-text-2);
}
.cpsi .detail-desc-label {
  font-size: 0.73rem;
  font-weight: 700;
  color: var(--vp-c-brand-1);
  white-space: normal;
}
.cpsi /* ── Warn box / Actions ──────────────────────────────────────────── */
.warn-box {
  display: flex;
  gap: 0.6rem;
  padding: 0.75rem 1rem;
  border-radius: 10px;
  background: rgba(249, 115, 22, 0.06);
  border: 1px solid rgba(249, 115, 22, 0.3);
  font-size: 0.8rem;
  color: var(--vp-c-text-2);
  line-height: 1.6;
  margin-bottom: 1rem;
}
.cpsi .warn-icon {
  color: #f97316;
  flex-shrink: 0;
}
.cpsi .cpsi-actions {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}
.cpsi .btn-view,
.cpsi .btn-copy,
.cpsi .btn-reset {
  padding: 9px 22px;
  border-radius: 8px;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  font-family: inherit;
  transition: all 0.2s;
}
.cpsi .btn-view {
  border: none;
  background: linear-gradient(135deg, var(--vp-c-brand-1), #4f46e5);
  color: #fff;
  box-shadow: 0 2px 8px rgba(99, 102, 241, 0.3);
}
.cpsi .btn-view:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 14px rgba(99, 102, 241, 0.4);
}
.cpsi .btn-view:active {
  transform: translateY(0);
}
.cpsi .btn-copy {
  border: 1.5px solid var(--vp-c-brand-1);
  background: transparent;
  color: var(--vp-c-brand-1);
}
.cpsi .btn-copy:hover:not(:disabled) {
  background: var(--vp-c-brand-soft);
}
.cpsi .btn-copy:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}
.cpsi .btn-reset {
  border: 1px solid var(--vp-c-divider);
  background: transparent;
  color: var(--vp-c-text-2);
}
.cpsi .btn-reset:hover {
  border-color: #ef4444;
  color: #ef4444;
  background: rgba(239, 68, 68, 0.04);
}
.cpsi .progress-hint {
  font-size: 0.75rem;
  color: var(--vp-c-text-3);
  margin: 0.4rem 0 0;
}

@media (max-width: 640px) {
  .cpsi .cpsi-header {
    flex-wrap: wrap;
  }
  .cpsi .score-badge {
    align-self: flex-start;
  }
  .cpsi .score-number {
    font-size: 1.5rem;
  }
  .cpsi .cpsi-result {
    flex-direction: column;
    gap: 0.5rem;
  }
  .cpsi .result-number {
    font-size: 2rem;
  }
  .cpsi .checkbox-grid {
    grid-template-columns: 1fr;
  }
  .cpsi .option-row {
    grid-template-columns: repeat(3, 1fr);
  }
  .cpsi .option-row.q3-row {
    grid-template-columns: repeat(3, 1fr);
  }
  .cpsi .option-row.qol-row {
    grid-template-columns: repeat(4, 1fr);
  }
  .cpsi .nrs-grid {
    grid-template-columns: repeat(6, 1fr);
  }
}
/* ══════════════ Shared score badge（各工具統一樣式）══════════════ */
.prostateassess .score-badge {
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
.prostateassess .score-number {
  font-size: 1.7rem;
  font-weight: 800;
  line-height: 1;
  transition: color 0.3s;
}
.prostateassess .score-unit {
  font-size: 0.66rem;
  font-weight: 700;
  margin-top: 2px;
  opacity: 0.75;
}
.prostateassess .score-label {
  font-size: 0.66rem;
  font-weight: 600;
  margin-top: 3px;
  letter-spacing: 0.01em;
  text-align: center;
  line-height: 1.25;
  word-break: break-word;
  max-width: 100%;
}
.prostateassess .score-badge.pending {
  border-color: var(--vp-c-divider);
  color: var(--vp-c-text-3);
}
.prostateassess .score-badge.normal {
  border-color: #22c55e;
  color: #22c55e;
}
.prostateassess .score-badge.mild {
  border-color: #f59e0b;
  color: #f59e0b;
}
.prostateassess .score-badge.moderate {
  border-color: #f97316;
  color: #f97316;
}
.prostateassess .score-badge.badge-male {
  border-color: #38bdf8;
  color: #38bdf8;
}
.prostateassess .score-badge.badge-female {
  border-color: #f472b6;
  color: #f472b6;
}
@media (max-width: 640px) {
  .prostateassess .score-badge {
    width: auto;
    height: auto;
    min-width: 0;
    min-height: 0;
    padding: 0.5rem 0.9rem;
  }
}

/* ── CPSI VAS slider + number input (0–10 score inputs) ── */
.cpsi .vas-row {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 0.9rem 0.4rem;
}
.cpsi .vas-track-wrap {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.cpsi .vas-track {
  position: relative;
  height: 8px;
  background: var(--vp-c-bg-mute);
  border-radius: 999px;
}
.cpsi .vas-fill-bar {
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  border-radius: 999px;
  background: var(--vp-c-brand-1);
  transition: width 0.2s;
  pointer-events: none;
}
.cpsi .vas-thumb {
  position: absolute;
  top: 50%;
  transform: translate(-50%, -50%);
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: var(--vp-c-brand-1);
  border: 2px solid #fff;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.25);
  pointer-events: none;
  transition: left 0.15s;
}
.cpsi .vas-thumb.vas-thumb-unset {
  background: var(--vp-c-bg);
  border: 2.5px solid var(--vp-c-brand-1);
  box-shadow: 0 1px 4px color-mix(in srgb, var(--vp-c-brand-1) 30%, transparent);
}
.cpsi .vas-range {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  opacity: 0;
  cursor: pointer;
  margin: 0;
}
.cpsi .vas-ticks {
  display: flex;
  justify-content: space-between;
  font-size: 0.72rem;
  color: var(--vp-c-text-2);
  padding: 0 10px;
}
.cpsi .vas-ticks span {
  width: 0;
  display: flex;
  justify-content: center;
  overflow: visible;
  white-space: nowrap;
}
.cpsi .num-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.4rem 0.9rem 0.6rem;
}
.cpsi .num-hint {
  font-size: 0.7rem;
  color: var(--vp-c-text-3);
  flex-shrink: 0;
}
.cpsi .num-input-wrap {
  border: 1.5px solid var(--vp-c-divider);
  border-radius: 7px;
  background: var(--vp-c-bg-soft);
  padding: 2px 8px;
  transition: all 0.25s;
  width: 72px;
}
.cpsi .num-input-wrap.ni-filled {
  border-color: color-mix(in srgb, var(--vp-c-brand-1) 45%, transparent);
}
.cpsi .num-input {
  width: 52px;
  border: none;
  background: transparent;
  font-size: 0.95rem;
  font-weight: 700;
  color: var(--vp-c-text-1);
  outline: none;
  font-family: inherit;
  -moz-appearance: textfield;
  text-align: center;
}
.cpsi .num-input::placeholder {
  font-weight: 400;
  color: var(--vp-c-text-3);
  font-size: 0.8rem;
}
.cpsi .num-input::-webkit-outer-spin-button,
.cpsi .num-input::-webkit-inner-spin-button {
  -webkit-appearance: none;
}
/* sub-score-card: flat fill + larger fonts */
.ipss .ss-label,
.cpsi .ss-label {
  font-size: 0.8rem !important;
  font-weight: 700;
}
.ipss .ss-val,
.cpsi .ss-val {
  font-size: 1.8rem !important;
}
.ipss .ss-max,
.cpsi .ss-max {
  font-size: 0.75rem !important;
  font-weight: 600;
}
.ipss .ss-total .ss-val,
.cpsi .ss-total .ss-val {
  font-size: 2rem !important;
}
/* Q4 slider anchors above the track (CAT style) + Q2 in-header yn-row */
.cpsi .item-anchor-row {
  display: flex;
  justify-content: space-between;
  gap: 0.75rem;
  padding: 0.55rem 0.9rem 0.15rem;
  font-size: 0.78rem;
  font-weight: 400;
  color: var(--vp-c-text-3);
}
.cpsi .anchor-right {
  text-align: right;
}
.cpsi .item-header {
  align-items: center;
}
.cpsi .item-header .yn-row {
  flex: 0 0 auto;
  justify-content: flex-end;
}
/* CPSI slider question cards fill by severity (TFI-style) */
.cpsi .cpsi-item.item-low {
  border-color: #22c55e;
  background: color-mix(in srgb, rgb(34, 197, 94) 5%, var(--vp-c-bg));
}
.cpsi .cpsi-item.item-mid {
  border-color: #f97316;
  background: color-mix(in srgb, rgb(249, 115, 22) 5%, var(--vp-c-bg));
}
.cpsi .cpsi-item.item-high {
  border-color: #ef4444;
  background: color-mix(in srgb, rgb(239, 68, 68) 5%, var(--vp-c-bg));
}
.cpsi .cpsi-item.item-low .item-header,
.cpsi .cpsi-item.item-mid .item-header,
.cpsi .cpsi-item.item-high .item-header {
  background: transparent;
}
.cpsi .field-input-wrap {
  display: flex;
  align-items: center;
  gap: 0.85rem;
  padding: 0.5rem 0.9rem 0.7rem;
}
.cpsi .field-slider {
  position: relative;
  width: 100%;
  -webkit-appearance: none;
  appearance: none;
  height: 32px;
  background: transparent;
  cursor: pointer;
  z-index: 1;
}
.cpsi .field-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: var(--vp-c-bg);
  border: 2.5px solid var(--vp-c-brand-1);
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.15);
  transition:
    transform 0.15s,
    box-shadow 0.15s;
}
.cpsi .field-slider::-webkit-slider-thumb:hover {
  transform: scale(1.15);
  box-shadow: 0 2px 8px rgba(99, 102, 241, 0.35);
}
.cpsi .field-slider::-moz-range-thumb {
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: var(--vp-c-bg);
  border: 2.5px solid var(--vp-c-brand-1);
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.15);
}
.cpsi .slider-track-wrap {
  position: relative;
  height: 32px;
  display: flex;
  align-items: center;
}
.cpsi .slider-track {
  position: absolute;
  top: 50%;
  left: 11px;
  right: 11px;
  height: 8px;
  border-radius: 999px;
  background: var(--vp-c-bg-mute);
  transform: translateY(-50%);
  overflow: hidden;
  box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.08);
  pointer-events: none;
}
.cpsi .slider-fill {
  height: 100%;
  border-radius: 999px;
  transition:
    width 0.15s ease,
    background 0.3s;
}
.cpsi .slider-fill.fill-q4 {
  background: linear-gradient(90deg, #ef4444, #f97316);
}
.cpsi .slider-col {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 5px;
}
.cpsi .field-ticks {
  display: flex;
  justify-content: space-between;
  font-size: 0.72rem;
  font-weight: 600;
  color: var(--vp-c-text-2);
  padding: 0 11px;
  margin-top: 2px;
}
.cpsi .field-ticks span {
  width: 0;
  display: flex;
  justify-content: center;
  overflow: visible;
  white-space: nowrap;
}
.cpsi .field-number {
  width: 66px;
  padding: 5px 8px;
  border: 1.5px solid var(--vp-c-divider);
  border-radius: 7px;
  font-size: 0.95rem;
  font-weight: 700;
  text-align: center;
  background: var(--vp-c-bg);
  color: var(--vp-c-text-1);
  font-family: inherit;
  -moz-appearance: textfield;
}
.cpsi .field-number::-webkit-outer-spin-button,
.cpsi .field-number::-webkit-inner-spin-button {
  -webkit-appearance: none;
}
.cpsi .field-number:focus {
  outline: none;
  border-color: var(--vp-c-brand-1);
  box-shadow: 0 0 0 2px var(--vp-c-brand-soft);
}
.cpsi .field-number::placeholder {
  color: var(--vp-c-text-3);
  font-weight: 400;
}
.cpsi .slider-col .item-anchor-row {
  padding: 0 6px 3px;
}
</style>
