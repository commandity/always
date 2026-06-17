<script setup lang="ts">
import { ref, computed } from "vue";

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

const copied = ref(false);
const showResults = ref(false);

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

const qolScore = computed((): number | null => {
  if (q7.value === null || q8.value === null || q9.value === null) return null;
  return q7.value + q8.value + q9.value;
});

const totalScore = computed((): number | null => {
  if (
    painScore.value === null ||
    urinaryScore.value === null ||
    qolScore.value === null
  )
    return null;
  return painScore.value + urinaryScore.value + qolScore.value;
});

const answeredSections = computed(
  () =>
    [
      painScore.value !== null,
      urinaryScore.value !== null,
      qolScore.value !== null,
    ].filter(Boolean).length,
);
const isComplete = computed(() => totalScore.value !== null);

// ── Interpretation ────────────────────────────────────────────────
const severity = computed(() => {
  const s = totalScore.value;
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

const barPct = computed(() =>
  totalScore.value !== null ? (totalScore.value / 43) * 100 : 0,
);

// ── Markdown ──────────────────────────────────────────────────────
function generateMarkdown(): string {
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
    `- **NIH-CPSI 總分**：${totalScore.value ?? "未完成"} / 43\n` +
    `- **疼痛域**：${painScore.value ?? "—"} / 21（${painSeverityLabel.value}）\n` +
    `- **排尿域**：${urinaryScore.value ?? "—"} / 10\n` +
    `- **生活品質域**：${qolScore.value ?? "—"} / 12\n` +
    `- **嚴重程度**：${severity.value.level}\n` +
    `- **臨床建議**：${severity.value.advice}`
  );
}

async function copyOutput() {
  await navigator.clipboard.writeText(generateMarkdown());
  copied.value = true;
  setTimeout(() => (copied.value = false), 2000);
}

function reset() {
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
  showResults.value = false;
}
</script>

<template>
  <div class="cpsi">
    <!-- ── Header ─────────────────────────────────────────────── -->
    <div class="cpsi-header">
      <div class="header-title">
        <h2 class="title">NIH-CPSI 慢性攝護腺炎症狀評分</h2>
        <p class="subtitle">
          NIH Chronic Prostatitis Symptom Index · Litwin 1999 · 3
          大域：疼痛（0–21）+ 排尿（0–10）+ 生活品質（0–12）
        </p>
      </div>
      <div class="score-badge" :class="severity.color">
        <span class="badge-label">NIH-CPSI</span>
        <span class="score-number">{{ totalScore ?? "—" }}</span>
        <span
          class="score-unit"
          :style="{ opacity: totalScore !== null ? 1 : 0 }"
          >/ 43</span
        >
        <span class="score-label">{{
          isComplete ? severity.level : `${answeredSections}/3 域`
        }}</span>
      </div>
    </div>

    <!-- ── Severity bar ────────────────────────────────────────── -->
    <div class="severity-bar-wrap">
      <div class="severity-bar">
        <div
          class="severity-fill"
          :class="severity.color"
          :style="{ width: barPct + '%' }"
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
              >In the last week, have you experienced any pain or discomfort in
              the following areas? (check all that apply)</span
            >
          </div>
          <span class="item-val" :class="q1Score > 0 ? 'val-pain' : 'val-nd'">{{
            q1Score
          }}</span>
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
          <span
            class="item-val"
            :class="q2 !== null ? (q2 === 1 ? 'val-pain' : 'val-ok') : 'val-nd'"
          >
            {{ q2 !== null ? q2 : "—" }}
          </span>
        </div>
        <div class="option-row q2-row">
          <button
            class="opt-pill"
            :class="{ s0: true, active: q2 === 0 }"
            @click="q2 = 0"
          >
            <span class="opt-num">0</span>
            <span class="opt-desc">否（No）</span>
          </button>
          <button
            class="opt-pill"
            :class="{ s5: true, active: q2 === 1 }"
            @click="q2 = 1"
          >
            <span class="opt-num">1</span>
            <span class="opt-desc">是（Yes）</span>
          </button>
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
        <div class="option-row q3-row">
          <button
            v-for="opt in q3Labels"
            :key="opt.val"
            class="opt-pill"
            :class="['s' + opt.val, { active: q3 === opt.val }]"
            @click="q3 = opt.val"
          >
            <span class="opt-num">{{ opt.val }}</span>
            <span class="opt-desc">{{ opt.zh }}</span>
          </button>
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
        <div class="nrs-grid">
          <button
            v-for="n in 11"
            :key="n - 1"
            class="nrs-pill"
            :class="{
              active: q4 === n - 1,
              'nrs-low': q4 === n - 1 && n - 1 <= 3,
              'nrs-mid': q4 === n - 1 && n - 1 >= 4 && n - 1 <= 6,
              'nrs-high': q4 === n - 1 && n - 1 >= 7,
            }"
            @click="q4 = n - 1"
          >
            <span class="nrs-num">{{ n - 1 }}</span>
          </button>
        </div>
        <div class="nrs-labels">
          <span>0 = 完全不痛</span>
          <span>10 = 最嚴重</span>
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
        <div class="option-row">
          <button
            v-for="opt in q5Labels"
            :key="opt.val"
            class="opt-pill"
            :class="['s' + opt.val, { active: q5 === opt.val }]"
            @click="q5 = opt.val"
          >
            <span class="opt-num">{{ opt.val }}</span>
            <span class="opt-desc">{{ opt.zh }}</span>
          </button>
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
              >Over the last week, how often have you had to urinate again less
              than two hours after you finished urinating?</span
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
        <div class="option-row">
          <button
            v-for="opt in q5Labels"
            :key="opt.val"
            class="opt-pill"
            :class="['s' + opt.val, { active: q6 === opt.val }]"
            @click="q6 = opt.val"
          >
            <span class="opt-num">{{ opt.val }}</span>
            <span class="opt-desc">{{ opt.zh }}</span>
          </button>
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
          :class="qolScore !== null ? 'tally-qol' : 'tally-nd'"
        >
          {{ qolScore !== null ? qolScore + " / 12" : "—" }}
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
        <div class="option-row q4-row">
          <button
            v-for="opt in q7Labels"
            :key="opt.val"
            class="opt-pill"
            :class="['s' + opt.val, { active: q7 === opt.val }]"
            @click="q7 = opt.val"
          >
            <span class="opt-num">{{ opt.val }}</span>
            <span class="opt-desc">{{ opt.zh }}</span>
          </button>
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
            <span class="item-name">過去一週，您有多頻繁思考著您的症狀？</span>
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
        <div class="option-row q4-row">
          <button
            v-for="opt in q7Labels"
            :key="opt.val"
            class="opt-pill"
            :class="['s' + opt.val, { active: q8 === opt.val }]"
            @click="q8 = opt.val"
          >
            <span class="opt-num">{{ opt.val }}</span>
            <span class="opt-desc">{{ opt.zh }}</span>
          </button>
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
        <div class="option-row qol-row">
          <button
            v-for="opt in q9Labels"
            :key="opt.val"
            class="opt-pill"
            :class="['s' + opt.val, { active: q9 === opt.val }]"
            @click="q9 = opt.val"
          >
            <span class="opt-num">{{ opt.val }}</span>
            <span class="opt-desc">{{ opt.zh }}</span>
          </button>
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
          qolScore !== null
            ? qolScore >= 8
              ? 'ss-high'
              : qolScore >= 4
                ? 'ss-mid'
                : 'ss-low'
            : 'ss-nd'
        "
      >
        <span class="ss-label">❤️ 生活品質</span>
        <div class="ss-score-row">
          <span class="ss-val">{{ qolScore ?? "—" }}</span>
          <span class="ss-max">/ 12</span>
        </div>
      </div>
      <div
        class="sub-score-card ss-total"
        :class="isComplete ? severity.color : 'ss-nd'"
      >
        <span class="ss-label">總分</span>
        <div class="ss-score-row">
          <span class="ss-val">{{ totalScore ?? "—" }}</span>
          <span class="ss-max">/ 43</span>
        </div>
        <span class="ss-note">{{
          totalScore !== null ? severity.level : ""
        }}</span>
      </div>
    </div>

    <!-- ── Result card ────────────────────────────────────────── -->
    <div class="cpsi-result" :class="severity.color">
      <div class="result-left">
        <span class="result-number">{{ totalScore ?? "—" }}</span>
        <span class="result-max">/ 43</span>
      </div>
      <div class="result-right">
        <span class="result-level">{{ severity.level }}</span>
        <span class="result-advice">{{ severity.advice }}</span>
      </div>
    </div>

    <!-- ── Results detail ─────────────────────────────────────── -->
    <div v-if="showResults && isComplete" class="results-detail">
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
        <span class="detail-score detail-score-brand">{{ totalScore }}</span>
        <div class="detail-desc detail-desc-block">
          <span class="detail-desc-unit">/ 43</span>
          <span class="detail-desc-label">{{ severity.level }}</span>
        </div>
      </div>
    </div>

    <!-- ── Alert ──────────────────────────────────────────────── -->
    <div
      v-if="isComplete && severity.screen"
      class="cpsi-alert"
      :class="`alert-${severity.color}`"
    >
      <span class="alert-icon">⚠</span>
      <span
        ><strong>NIH-CPSI {{ totalScore }} 分（{{ severity.level }}）：</strong
        >{{ severity.advice }}</span
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
      <button class="btn-view" @click="showResults = !showResults">
        {{ showResults ? "收起明細" : "查看評估結果" }}
      </button>
      <button class="btn-copy" :disabled="!isComplete" @click="copyOutput">
        {{ copied ? "已複製 ✓" : "複製 Markdown 結果" }}
      </button>
      <button class="btn-reset" @click="reset">重置</button>
    </div>
    <p v-if="!isComplete" class="progress-hint">
      已完成 {{ answeredSections }}/3 域，疼痛域需完成 Q2–Q4，排尿域需完成
      Q5–Q6，生活品質域需完成 Q7–Q9
    </p>
  </div>
</template>

<style scoped>
.cpsi {
  max-width: 780px;
  margin: 0 auto;
  padding: 2rem 0 3rem;
  font-size: 0.9rem;
}

/* ── Header ─────────────────────────────────────────────────────── */
.cpsi-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 1.25rem;
  flex-wrap: nowrap;
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
  font-size: 0.75rem;
  color: var(--vp-c-text-3);
  margin: 0;
  line-height: 1.6;
}

/* ── Score badge ─────────────────────────────────────────────────── */
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
.badge-label {
  font-size: 0.55rem;
  font-weight: 700;
  letter-spacing: 0.04em;
  color: var(--vp-c-text-3);
}
.score-number {
  font-size: 2rem;
  font-weight: 800;
  line-height: 1;
  transition: color 0.3s;
}
.score-unit {
  font-size: 0.65rem;
  font-weight: 600;
  margin-top: 1px;
}
.score-label {
  font-size: 0.62rem;
  font-weight: 600;
  margin-top: 3px;
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
.score-badge.moderate {
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

/* ── Severity bar ────────────────────────────────────────────────── */
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
.severity-fill.filling {
  background: var(--vp-c-divider);
}
.severity-fill.normal {
  background: linear-gradient(90deg, #22c55e, #4ade80);
}
.severity-fill.moderate {
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
  height: 13px;
  margin-top: 0;
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
.tick-yellow {
  color: #f97316;
  font-weight: 700;
}
.tick-red {
  color: #ef4444;
  font-weight: 700;
}

/* ── Alert ───────────────────────────────────────────────────────── */
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
.alert-moderate {
  background: rgba(249, 115, 22, 0.06);
  border: 1px solid rgba(249, 115, 22, 0.35);
}
.alert-critical {
  background: rgba(239, 68, 68, 0.06);
  border: 1px solid rgba(239, 68, 68, 0.35);
}
.alert-icon {
  color: #ef4444;
  flex-shrink: 0;
}

/* ── Groups ──────────────────────────────────────────────────────── */
.nihss-group {
  margin-bottom: 1.5rem;
}
.group-header-bar {
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
.pain-bar {
  border-left-color: #ef4444;
  background: linear-gradient(
    135deg,
    rgba(239, 68, 68, 0.08),
    var(--vp-c-bg-mute),
    var(--vp-c-bg-soft)
  );
  box-shadow: 0 1px 3px rgba(239, 68, 68, 0.06);
}
.urinary-bar {
  border-left-color: #3b82f6;
  background: linear-gradient(
    135deg,
    rgba(59, 130, 246, 0.08),
    var(--vp-c-bg-mute),
    var(--vp-c-bg-soft)
  );
  box-shadow: 0 1px 3px rgba(59, 130, 246, 0.06);
}
.qol-bar {
  border-left-color: #a855f7;
  background: linear-gradient(
    135deg,
    rgba(168, 85, 247, 0.08),
    var(--vp-c-bg-mute),
    var(--vp-c-bg-soft)
  );
  box-shadow: 0 1px 3px rgba(168, 85, 247, 0.06);
}
.group-icon {
  font-size: 1rem;
  flex-shrink: 0;
}
.group-label-text {
  font-size: 0.88rem;
  font-weight: 800;
  color: var(--vp-c-text-1);
}
.group-sub-text {
  font-size: 0.7rem;
  color: var(--vp-c-text-3);
  flex: 1;
}
.group-score-tally {
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
.tally-pain {
  color: #ef4444;
  background: rgba(239, 68, 68, 0.12);
  border-color: rgba(239, 68, 68, 0.25);
}
.tally-urinary {
  color: #3b82f6;
  background: rgba(59, 130, 246, 0.12);
  border-color: rgba(59, 130, 246, 0.25);
}
.tally-qol {
  color: #e879f9;
  background: rgba(232, 121, 249, 0.12);
  border-color: rgba(232, 121, 249, 0.25);
}
.tally-nd {
  color: var(--vp-c-text-3);
  background: var(--vp-c-bg-soft);
  border-color: var(--vp-c-divider);
}

/* ── Item cards ──────────────────────────────────────────────────── */
.cpsi-item {
  border: 1px solid var(--vp-c-divider);
  border-radius: 10px;
  background: var(--vp-c-bg-soft);
  overflow: hidden;
  transition: all 0.25s;
  margin-bottom: 0.5rem;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.03);
}
.cpsi-item:hover {
  box-shadow: 0 3px 12px rgba(0, 0, 0, 0.06);
  border-color: var(--vp-c-divider);
}
.cpsi-item.item-ok {
  border-color: #22c55e;
}
.cpsi-item.item-low {
  border-color: #22c55e;
}
.cpsi-item.item-mid {
  border-color: #f97316;
}
.cpsi-item.item-high {
  border-color: #ef4444;
}
.cpsi-item.item-pain {
  border-color: #ef4444;
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
  color: #fff;
  padding: 1px 9px;
  border-radius: 999px;
  letter-spacing: 0.04em;
  box-shadow: 0 1px 3px rgba(239, 68, 68, 0.2);
  white-space: nowrap;
}
.q-pain {
  background: linear-gradient(135deg, #ef4444, #dc2626);
}
.q-urinary {
  background: linear-gradient(135deg, #3b82f6, #2563eb);
  box-shadow: 0 1px 3px rgba(59, 130, 246, 0.2);
}
.q-qol {
  background: linear-gradient(135deg, #a855f7, #7c3aed);
  box-shadow: 0 1px 3px rgba(168, 85, 247, 0.2);
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
  font-size: 0.68rem;
  color: var(--vp-c-text-3);
  line-height: 1.5;
}
.item-val {
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
.val-ok {
  color: #22c55e;
  border-color: rgba(34, 197, 94, 0.3);
  background: rgba(34, 197, 94, 0.06);
}
.val-low {
  color: #22c55e;
  border-color: rgba(34, 197, 94, 0.3);
  background: rgba(34, 197, 94, 0.06);
}
.val-mid {
  color: #f97316;
  border-color: rgba(249, 115, 22, 0.3);
  background: rgba(249, 115, 22, 0.06);
}
.val-high {
  color: #ef4444;
  border-color: rgba(239, 68, 68, 0.3);
  background: rgba(239, 68, 68, 0.06);
}
.val-pain {
  color: #ef4444;
  border-color: rgba(239, 68, 68, 0.3);
  background: rgba(239, 68, 68, 0.06);
}
.val-nd {
  color: var(--vp-c-text-3);
  background: transparent;
  border-color: var(--vp-c-divider);
}

/* ── Checkbox grid ───────────────────────────────────────────────── */
.checkbox-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.4rem;
  padding: 0.65rem 0.9rem;
}
.check-item {
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
.check-item.check-active {
  border-color: #ef4444;
  background: rgba(239, 68, 68, 0.07);
  color: #ef4444;
}
.check-item input[type="checkbox"] {
  cursor: pointer;
  accent-color: #ef4444;
}
.check-label {
  flex: 1;
}

/* ── Option pills (grid) ─────────────────────────────────────────── */
.option-row {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 2px;
  padding: 3px;
  background: var(--vp-c-bg-mute);
  border-top: 1px solid var(--vp-c-divider);
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

/* Score-specific colors — s0 through s6 */
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

.opt-pill.s5 {
  border-color: rgba(239, 68, 68, 0.15);
}
.opt-pill.s5:hover:not(.active) {
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

.opt-pill.s6 {
  border-color: rgba(220, 38, 38, 0.15);
}
.opt-pill.s6:hover:not(.active) {
  border-color: rgba(220, 38, 38, 0.35);
  background: rgba(220, 38, 38, 0.04);
}
.opt-pill.s6.active {
  border-color: #dc2626;
  background: linear-gradient(
    180deg,
    rgba(220, 38, 38, 0.12),
    rgba(220, 38, 38, 0.06)
  );
  box-shadow: 0 0 0 1px rgba(220, 38, 38, 0.08);
}
.opt-pill.s6 .opt-num {
  color: rgba(220, 38, 38, 0.5);
}
.opt-pill.s6.active .opt-num {
  color: #dc2626;
}
.opt-pill.s6 .opt-desc {
  color: rgba(220, 38, 38, 0.4);
}
.opt-pill.s6.active .opt-desc {
  color: rgba(220, 38, 38, 0.7);
}

/* Grid column variants */
.q2-row {
  grid-template-columns: repeat(2, 1fr);
}
.q3-row {
  grid-template-columns: repeat(5, 1fr);
}
.q4-row {
  grid-template-columns: repeat(4, 1fr);
}
.qol-row {
  grid-template-columns: repeat(7, 1fr);
}

/* ── NRS grid (Q4, 11 cols) ───────────────────────────────────────── */
.nrs-grid {
  display: grid;
  grid-template-columns: repeat(11, 1fr);
  gap: 2px;
  padding: 3px;
  background: var(--vp-c-bg-mute);
  border-top: 1px solid var(--vp-c-divider);
}
.nrs-pill {
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
.nrs-pill:hover {
  border-color: var(--vp-c-divider);
  background: var(--vp-c-bg-soft);
}
.nrs-num {
  font-size: 0.95rem;
  font-weight: 800;
  transition: color 0.2s;
}
.nrs-pill.active {
  border-color: #f97316;
  box-shadow: 0 0 0 1px rgba(249, 115, 22, 0.08);
}
.nrs-pill.nrs-low.active {
  border-color: #22c55e;
  background: rgba(34, 197, 94, 0.06);
  box-shadow: 0 0 0 1px rgba(34, 197, 94, 0.08);
}
.nrs-pill.nrs-low.active .nrs-num {
  color: #22c55e;
}
.nrs-pill.nrs-mid.active {
  border-color: #f97316;
  background: rgba(249, 115, 22, 0.06);
}
.nrs-pill.nrs-mid.active .nrs-num {
  color: #f97316;
}
.nrs-pill.nrs-high.active {
  border-color: #ef4444;
  background: rgba(239, 68, 68, 0.06);
  box-shadow: 0 0 0 1px rgba(239, 68, 68, 0.08);
}
.nrs-pill.nrs-high.active .nrs-num {
  color: #ef4444;
}
.nrs-pill .nrs-num {
  color: var(--vp-c-text-3);
}

.nrs-labels {
  display: flex;
  justify-content: space-between;
  padding: 0.25rem 0.9rem;
  font-size: 0.65rem;
  color: var(--vp-c-text-3);
  border-top: 1px dashed var(--vp-c-divider);
}

/* ── Sub-score row ───────────────────────────────────────────────── */
.sub-score-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
  flex-wrap: wrap;
}
.sub-score-card {
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
.ss-low {
  border-color: #22c55e;
  background: linear-gradient(
    180deg,
    rgba(34, 197, 94, 0.06),
    var(--vp-c-bg-soft)
  );
}
.ss-mid {
  border-color: #f97316;
  background: linear-gradient(
    180deg,
    rgba(249, 115, 22, 0.06),
    var(--vp-c-bg-soft)
  );
}
.ss-high {
  border-color: #ef4444;
  background: linear-gradient(
    180deg,
    rgba(239, 68, 68, 0.06),
    var(--vp-c-bg-soft)
  );
}
.ss-nd {
  opacity: 0.5;
}
.ss-total {
  max-width: 100px;
}
.sub-score-card.normal {
  border-color: #22c55e;
  background: linear-gradient(
    180deg,
    rgba(34, 197, 94, 0.06),
    var(--vp-c-bg-soft)
  );
}
.sub-score-card.moderate {
  border-color: #f97316;
  background: linear-gradient(
    180deg,
    rgba(249, 115, 22, 0.06),
    var(--vp-c-bg-soft)
  );
}
.sub-score-card.critical {
  border-color: #ef4444;
  background: linear-gradient(
    180deg,
    rgba(239, 68, 68, 0.06),
    var(--vp-c-bg-soft)
  );
}
.ss-label {
  font-size: 0.63rem;
  color: var(--vp-c-text-3);
  font-weight: 600;
}
.ss-score-row {
  display: flex;
  align-items: baseline;
  gap: 2px;
  line-height: 1;
}
.ss-val {
  font-size: 1.5rem;
  font-weight: 800;
  color: var(--vp-c-text-1);
  line-height: 1;
}
.ss-max {
  font-size: 0.6rem;
  color: var(--vp-c-text-3);
}
.ss-note {
  font-size: 0.55rem;
  color: var(--vp-c-text-3);
  font-weight: 600;
  margin-top: 2px;
}
.ss-low .ss-val {
  color: #22c55e;
}
.ss-mid .ss-val {
  color: #f97316;
}
.ss-high .ss-val {
  color: #ef4444;
}
.sub-score-card.normal .ss-val {
  color: #22c55e;
}
.sub-score-card.moderate .ss-val {
  color: #f97316;
}
.sub-score-card.critical .ss-val {
  color: #ef4444;
}

/* ── Result card ─────────────────────────────────────────────────── */
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
.cpsi-result.normal {
  border-color: #22c55e;
  box-shadow:
    0 0 0 1px rgba(34, 197, 94, 0.06),
    0 1px 3px rgba(0, 0, 0, 0.04);
}
.cpsi-result.moderate {
  border-color: #f97316;
  box-shadow:
    0 0 0 1px rgba(249, 115, 22, 0.06),
    0 1px 3px rgba(0, 0, 0, 0.04);
}
.cpsi-result.critical {
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
.cpsi-result.normal .result-number {
  color: #22c55e;
}
.cpsi-result.moderate .result-number {
  color: #f97316;
}
.cpsi-result.critical .result-number {
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

/* ── Results detail ──────────────────────────────────────────────── */
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
  align-items: flex-start;
  gap: 0.6rem;
  padding: 0.5rem 0.9rem;
  border-bottom: 1px solid var(--vp-c-divider);
}
.detail-row:last-child {
  border-bottom: none;
}
.detail-total {
  background: linear-gradient(135deg, var(--vp-c-bg-mute), var(--vp-c-bg-soft));
}
.detail-qnum {
  font-size: 0.68rem;
  font-weight: 800;
  color: #ef4444;
  flex-shrink: 0;
  width: 40px;
  padding-top: 1px;
}
.detail-domain {
  font-size: 0.78rem;
  font-weight: 700;
  color: var(--vp-c-text-1);
  flex: 1;
  line-height: 1.5;
}
.detail-score {
  font-size: 0.82rem;
  font-weight: 800;
  flex-shrink: 0;
  width: 52px;
  text-align: right;
  color: var(--vp-c-text-3);
}
.ds-low {
  color: #22c55e;
}
.ds-mid {
  color: #f97316;
}
.ds-high {
  color: #ef4444;
}
.ds-brand {
  color: var(--vp-c-brand-1);
}
.detail-score-brand {
  color: var(--vp-c-brand-1);
}
.detail-desc {
  font-size: 0.75rem;
  color: var(--vp-c-text-2);
  flex-shrink: 0;
  width: 82px;
  white-space: normal;
}
.detail-desc-block {
  display: flex;
  flex-direction: column;
  gap: 1px;
  width: 82px;
  flex-shrink: 0;
}
.detail-desc-unit {
  font-size: 0.75rem;
  color: var(--vp-c-text-2);
}
.detail-desc-label {
  font-size: 0.73rem;
  font-weight: 700;
  color: var(--vp-c-brand-1);
  white-space: normal;
}

/* ── Warn box / Actions ──────────────────────────────────────────── */
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
.warn-icon {
  color: #f97316;
  flex-shrink: 0;
}
.cpsi-actions {
  display: flex;
  gap: 8px;
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
.btn-copy:hover:not(:disabled) {
  background: var(--vp-c-brand-soft);
}
.btn-copy:disabled {
  opacity: 0.4;
  cursor: not-allowed;
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
  .cpsi-header {
    flex-wrap: wrap;
  }
  .score-badge {
    align-self: flex-start;
  }
  .score-number {
    font-size: 1.5rem;
  }
  .cpsi-result {
    flex-direction: column;
    gap: 0.5rem;
  }
  .result-number {
    font-size: 2rem;
  }
  .checkbox-grid {
    grid-template-columns: 1fr;
  }
  .option-row {
    grid-template-columns: repeat(3, 1fr);
  }
  .option-row.q3-row {
    grid-template-columns: repeat(3, 1fr);
  }
  .option-row.qol-row {
    grid-template-columns: repeat(4, 1fr);
  }
  .nrs-grid {
    grid-template-columns: repeat(6, 1fr);
  }
}
</style>
