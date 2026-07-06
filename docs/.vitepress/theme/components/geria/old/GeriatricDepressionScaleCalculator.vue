<script setup lang="ts">
import { ref, computed } from "vue";

// ── GDS — Unified Calculator (4 / 15 / 30 item) ─────────────────
// GDS-30: Yesavage et al., J Psychiatr Res 1983;17:37–49.  Public domain.
// GDS-15: Sheikh & Yesavage, Clin Gerontol 1986;5:165–173.
// GDS-4:  D'Ath et al., Age Ageing 1994;23:360–364.
//
// YES/NO format. Score 1 for the depressive answer per question.

const questions30 = [
  {
    key: "q1",
    text: "您對目前的生活基本上感到滿意嗎？",
    en: "Are you basically satisfied with your life?",
    depressiveAnswer: "no",
  },
  {
    key: "q2",
    text: "您是否已放棄許多原有的活動和興趣？",
    en: "Have you dropped many of your activities and interests?",
    depressiveAnswer: "yes",
  },
  {
    key: "q3",
    text: "您是否覺得生活空虛？",
    en: "Do you feel that your life is empty?",
    depressiveAnswer: "yes",
  },
  {
    key: "q4",
    text: "您是否經常感到無聊？",
    en: "Do you often get bored?",
    depressiveAnswer: "yes",
  },
  {
    key: "q5",
    text: "您對未來是否有希望？",
    en: "Are you hopeful about the future?",
    depressiveAnswer: "no",
  },
  {
    key: "q6",
    text: "您是否因腦中揮之不去的念頭而感到困擾？",
    en: "Are you bothered by thoughts you can't get out of your head?",
    depressiveAnswer: "yes",
  },
  {
    key: "q7",
    text: "您大部分時間情緒是否良好？",
    en: "Are you in good spirits most of the time?",
    depressiveAnswer: "no",
  },
  {
    key: "q8",
    text: "您是否害怕有不好的事情即將發生？",
    en: "Are you afraid that something bad is going to happen to you?",
    depressiveAnswer: "yes",
  },
  {
    key: "q9",
    text: "您是否大部分時間感到快樂？",
    en: "Do you feel happy most of the time?",
    depressiveAnswer: "no",
  },
  {
    key: "q10",
    text: "您是否常常感到無助？",
    en: "Do you often feel helpless?",
    depressiveAnswer: "yes",
  },
  {
    key: "q11",
    text: "您是否經常感到坐立難安、靜不下來？",
    en: "Do you often get restless and fidgety?",
    depressiveAnswer: "yes",
  },
  {
    key: "q12",
    text: "您是否寧願待在家中，不願外出或做新的事？",
    en: "Do you prefer to stay at home rather than going out and doing things?",
    depressiveAnswer: "yes",
  },
  {
    key: "q13",
    text: "您是否經常擔心未來？",
    en: "Do you frequently worry about the future?",
    depressiveAnswer: "yes",
  },
  {
    key: "q14",
    text: "您是否覺得自己的記憶比一般人差？",
    en: "Do you feel you have more problems with memory than most?",
    depressiveAnswer: "yes",
  },
  {
    key: "q15",
    text: "您是否覺得現在還能活著是件很棒的事？",
    en: "Do you think it is wonderful to be alive now?",
    depressiveAnswer: "no",
  },
  {
    key: "q16",
    text: "您是否常常感到沮喪和憂鬱？",
    en: "Do you feel downhearted and blue?",
    depressiveAnswer: "yes",
  },
  {
    key: "q17",
    text: "您是否覺得現在的自己毫無價值？",
    en: "Do you feel pretty worthless the way you are now?",
    depressiveAnswer: "yes",
  },
  {
    key: "q18",
    text: "您是否對過去的事感到懊悔？",
    en: "Do you worry a lot about the past?",
    depressiveAnswer: "yes",
  },
  {
    key: "q19",
    text: "您是否覺得生活令人興奮充實？",
    en: "Do you find life very exciting?",
    depressiveAnswer: "no",
  },
  {
    key: "q20",
    text: "您是否覺得開始新計畫很困難？",
    en: "Is it hard for you to get started on new projects?",
    depressiveAnswer: "yes",
  },
  {
    key: "q21",
    text: "您是否精力充沛？",
    en: "Do you feel full of energy?",
    depressiveAnswer: "no",
  },
  {
    key: "q22",
    text: "您是否覺得自己的處境沒有希望？",
    en: "Do you feel that your situation is hopeless?",
    depressiveAnswer: "yes",
  },
  {
    key: "q23",
    text: "您是否覺得大多數人的狀況比您好？",
    en: "Do you think that most people are better off than you are?",
    depressiveAnswer: "yes",
  },
  {
    key: "q24",
    text: "您是否常常為一點小事就感到心煩？",
    en: "Do you frequently get upset over little things?",
    depressiveAnswer: "yes",
  },
  {
    key: "q25",
    text: "您是否常常想哭？",
    en: "Do you frequently feel like crying?",
    depressiveAnswer: "yes",
  },
  {
    key: "q26",
    text: "您是否難以集中注意力？",
    en: "Do you have trouble concentrating?",
    depressiveAnswer: "yes",
  },
  {
    key: "q27",
    text: "您是否享受早上起床的感覺？",
    en: "Do you enjoy getting up in the morning?",
    depressiveAnswer: "no",
  },
  {
    key: "q28",
    text: "您是否寧願避開社交場合？",
    en: "Do you prefer to avoid social occasions?",
    depressiveAnswer: "yes",
  },
  {
    key: "q29",
    text: "您做決定是否容易？",
    en: "Is it easy for you to make decisions?",
    depressiveAnswer: "no",
  },
  {
    key: "q30",
    text: "您的思緒是否像以前一樣清晰？",
    en: "Is your mind as clear as it used to be?",
    depressiveAnswer: "no",
  },
];

const gds15Keys = [
  "q1",
  "q2",
  "q3",
  "q4",
  "q7",
  "q8",
  "q9",
  "q10",
  "q12",
  "q14",
  "q15",
  "q17",
  "q21",
  "q22",
  "q23",
];
const gds4Keys = ["q1", "q2", "q3", "q4"];

// ── Props ────────────────────────────────────────────────────────
// Pass `icope-dep-abn` from a parent/page to light up the ICOPE hint pill.
// e.g. <GDSCalculator :icope-dep-abn="true" />
const props = withDefaults(defineProps<{ icopeDepAbn?: boolean }>(), {
  icopeDepAbn: false,
});

// ── State ────────────────────────────────────────────────────────
type Method = "4" | "15" | "30";
const method = ref<Method>("15");
const selections = ref<Record<string, "yes" | "no" | null>>(
  Object.fromEntries(questions30.map((q) => [q.key, null])),
);
const copied = ref(false);
const showResults = ref(false);

// ── Active question set ──────────────────────────────────────────
const activeKeys = computed(() =>
  method.value === "4"
    ? gds4Keys
    : method.value === "15"
      ? gds15Keys
      : questions30.map((q) => q.key),
);

const activeQuestions = computed(() =>
  activeKeys.value.map((k, i) => ({
    ...questions30.find((q) => q.key === k)!,
    qNum: i + 1,
  })),
);

const maxScore = computed(() => parseInt(method.value));

// ── Scoring ──────────────────────────────────────────────────────
const totalScore = computed(() =>
  activeKeys.value.reduce((sum, k) => {
    const q = questions30.find((q) => q.key === k)!;
    const ans = selections.value[k];
    if (ans === null) return sum;
    return sum + (ans === q.depressiveAnswer ? 1 : 0);
  }, 0),
);

const answeredCount = computed(
  () => activeKeys.value.filter((k) => selections.value[k] !== null).length,
);

const isComplete = computed(
  () => answeredCount.value === activeKeys.value.length,
);

// ── Interpretation ───────────────────────────────────────────────
const severity = computed(() => {
  const s = totalScore.value;
  const m = method.value;

  if (!isComplete.value)
    return {
      level: "填寫中",
      color: "filling",
      advice: `已完成 ${answeredCount.value}/${maxScore.value} 題`,
      screen: false,
    };

  if (m === "4") {
    if (s <= 1)
      return {
        level: "無抑鬱跡象",
        color: "normal",
        advice: "GDS-4 ≤ 1：目前無明顯抑鬱跡象",
        screen: false,
      };
    return {
      level: "疑似抑鬱（建議進一步評估）",
      color: "moderate",
      advice:
        "GDS-4 ≥ 2：疑似有抑鬱症狀，建議使用 GDS-15 或 GDS-30 進行進一步評估",
      screen: true,
    };
  }

  if (m === "15") {
    if (s <= 4)
      return {
        level: "正常（無抑鬱）",
        color: "normal",
        advice: "GDS-15 ≤ 4：無明顯抑鬱症狀",
        screen: false,
      };
    if (s <= 8)
      return {
        level: "輕度抑鬱",
        color: "mild",
        advice: "GDS-15 5–8：輕度抑鬱，建議進一步臨床訪談及追蹤觀察",
        screen: true,
      };
    if (s <= 11)
      return {
        level: "中度抑鬱",
        color: "moderate",
        advice: "GDS-15 9–11：中度抑鬱，建議轉介心理衛生專業人員評估",
        screen: true,
      };
    return {
      level: "重度抑鬱",
      color: "critical",
      advice:
        "GDS-15 12–15：重度抑鬱，需立即進行完整精神科評估，並評估自傷風險",
      screen: true,
    };
  }

  if (s <= 9)
    return {
      level: "正常（無抑鬱）",
      color: "normal",
      advice: "GDS-30 ≤ 9：無明顯抑鬱症狀",
      screen: false,
    };
  if (s <= 19)
    return {
      level: "輕中度抑鬱",
      color: "moderate",
      advice: "GDS-30 10–19：輕至中度抑鬱，建議轉介心理衛生專業人員評估",
      screen: true,
    };
  return {
    level: "重度抑鬱",
    color: "critical",
    advice: "GDS-30 20–30：重度抑鬱，需立即進行完整精神科評估及安全性評估",
    screen: true,
  };
});

const barPct = computed(() =>
  isComplete.value ? (totalScore.value / maxScore.value) * 100 : 0,
);

// ── Markdown output ──────────────────────────────────────────────
function generateMarkdown() {
  const versionLabel = `GDS-${method.value}`;
  const lines = activeQuestions.value
    .map((q) => {
      const ans = selections.value[q.key];
      const isDepressive = ans === q.depressiveAnswer;
      return `- **Q${q.qNum}. ${q.text}**（${q.en}）：${ans === "yes" ? "是 Yes" : ans === "no" ? "否 No" : "未填"} ${isDepressive && ans !== null ? "✓" : ""}`;
    })
    .join("\n");

  return (
    `# ${versionLabel} 老年抑鬱量表評估結果\n\n` +
    `## 各題作答\n\n${lines}\n\n` +
    `---\n\n` +
    `## 計算結果\n\n` +
    `- **${versionLabel} 總分**：${totalScore.value} / ${maxScore.value}\n` +
    `- **嚴重程度**：${severity.value.level}\n` +
    `- **臨床建議**：${severity.value.advice}`
  );
}

async function copyMarkdown() {
  await navigator.clipboard.writeText(generateMarkdown());
  copied.value = true;
  setTimeout(() => (copied.value = false), 2000);
}

function reset() {
  questions30.forEach((q) => {
    selections.value[q.key] = null;
  });
  showResults.value = false;
}

function switchMethod(m: Method) {
  method.value = m;
  reset();
}
</script>

<template>
  <div class="gds">
    <!-- ── Header ─────────────────────────────────────────────── -->
    <div class="gds-header">
      <div class="header-title">
        <h2 class="title">GDS 老年抑鬱量表</h2>
        <p class="subtitle">
          Geriatric Depression Scale · Yesavage 1983 ·
          請依據<strong>過去一週</strong>的感受作答
        </p>
        <!-- ✦ ICOPE 憂鬱初評複評提示 pill ✦ -->
        <p class="subtitle-hint">
          <span
            class="hint-tag"
            :class="icopeDepAbn ? 'hint-tag--active' : 'hint-tag--inactive'"
          >
            <span v-if="icopeDepAbn"
              >💬 ICOPE 憂鬱初評異常 請使用本量表複評</span
            >
            <span v-else>💬 ICOPE 憂鬱症狀複評工具（GDS-15）</span>
          </span>
        </p>
      </div>
      <div class="score-badge" :class="severity.color">
        <span class="badge-ver">GDS-{{ method }}</span>
        <span class="score-number">{{ isComplete ? totalScore : "—" }}</span>
        <span class="score-label">{{
          isComplete ? severity.level : `${answeredCount}/${maxScore}`
        }}</span>
      </div>
    </div>

    <!-- ── Severity bar ───────────────────────────────────────── -->
    <div class="severity-bar-wrap">
      <div class="severity-bar">
        <div
          class="severity-fill"
          :class="severity.color"
          :style="{ width: barPct + '%' }"
        />
      </div>
      <template v-if="method === '4'">
        <div class="severity-ticks-abs">
          <span class="tick-abs" style="left: 0%">0</span>
          <span class="tick-abs tick-orange" style="left: 50%">2 ▾</span>
          <span class="tick-abs tick-red" style="left: 100%">4</span>
        </div>
        <div class="severity-labels-abs">
          <span class="label-abs" style="left: 0%">正常</span>
          <span class="label-abs tick-orange" style="left: 50%">疑似陽性</span>
          <span class="label-abs tick-red" style="left: 100%">重度</span>
        </div>
      </template>
      <template v-else-if="method === '15'">
        <div class="severity-ticks-abs">
          <span class="tick-abs" style="left: 0%">0</span>
          <span class="tick-abs tick-yellow" style="left: 33.3%">5 ▾</span>
          <span class="tick-abs tick-orange" style="left: 60%">9</span>
          <span class="tick-abs tick-red" style="left: 80%">12</span>
          <span class="tick-abs tick-red" style="left: 100%">15</span>
        </div>
        <div class="severity-labels-abs">
          <span class="label-abs" style="left: 0%">正常</span>
          <span class="label-abs tick-yellow" style="left: 33.3%">輕度</span>
          <span class="label-abs tick-orange" style="left: 60%">中度</span>
          <span class="label-abs tick-red" style="left: 80%">重度</span>
          <span class="label-abs tick-red" style="left: 100%">重度</span>
        </div>
      </template>
      <template v-else>
        <div class="severity-ticks-abs">
          <span class="tick-abs" style="left: 0%">0</span>
          <span class="tick-abs tick-yellow" style="left: 33.3%">10 ▾</span>
          <span class="tick-abs tick-red" style="left: 66.7%">20 ▾</span>
          <span class="tick-abs tick-red" style="left: 100%">30</span>
        </div>
        <div class="severity-labels-abs">
          <span class="label-abs" style="left: 0%">正常</span>
          <span class="label-abs tick-yellow" style="left: 33.3%">輕中度</span>
          <span class="label-abs tick-red" style="left: 66.7%">重度</span>
          <span class="label-abs tick-red" style="left: 100%">重度</span>
        </div>
      </template>
    </div>

    <!-- ── Depression alert ───────────────────────────────────── -->
    <div v-if="isComplete && severity.screen" class="gds-alert">
      <span class="alert-icon">⚠</span>
      <span>
        <strong
          >GDS-{{ method }} 陽性篩查（總分 {{ totalScore }}/{{
            maxScore
          }}）：</strong
        >
        {{ severity.advice }}
      </span>
    </div>

    <!-- ── Version tab selector ───────────────────────────────── -->
    <div class="nihss-group">
      <div class="group-header-bar tab-bar">
        <span class="group-icon">📋</span>
        <span class="group-label-text">版本選擇</span>
        <span class="group-sub-text">依情境選擇適合的量表版本</span>
      </div>
      <div class="tab-toggle">
        <button
          class="tab-btn"
          :class="{ 'tab-active': method === '4' }"
          @click="switchMethod('4')"
        >
          <span class="tab-title">GDS-4</span>
          <span class="tab-sub">4 題 · 快速篩查 · 1–2 分鐘</span>
        </button>
        <button
          class="tab-btn"
          :class="{ 'tab-active': method === '15' }"
          @click="switchMethod('15')"
        >
          <span class="tab-title">GDS-15</span>
          <span class="tab-sub">15 題 · 標準版 · 5–7 分鐘</span>
        </button>
        <button
          class="tab-btn"
          :class="{ 'tab-active': method === '30' }"
          @click="switchMethod('30')"
        >
          <span class="tab-title">GDS-30</span>
          <span class="tab-sub">30 題 · 完整版 · 10–15 分鐘</span>
        </button>
      </div>
      <div class="method-note" :class="`note-${method}`">
        <template v-if="method === '4'">
          <strong>GDS-4（4 題快速版）：</strong>取自 GDS-30 前 4
          題。適合急診、門診或行動不便的患者快速篩查。≥ 2
          分為陽性，建議進一步使用 GDS-15 評估。敏感性約 72%、特異性約 90%。
        </template>
        <template v-else-if="method === '15'">
          <strong>GDS-15（15 題短版）：</strong
          >最常用版本，涵蓋正向情緒與負向情緒兩個次量表。適合門診、社區及住院老年患者。≥
          5 分提示抑鬱，需進一步臨床訪談。敏感性 92%、特異性 89%。<br />
          評分方式：所有題目採是/否作答。<strong>正向題（Q1、Q5、Q7、Q11、Q13）</strong>先行篩查——任一題回答「否」（即憂鬱方向）即為陽性，再接續完成其餘題目。每道題依據憂鬱相關答案計
          1 分，非憂鬱方向計 0 分。
        </template>
        <template v-else>
          <strong>GDS-30（30 題完整版）：</strong
          >原版量表，評估最全面。適合認知功能未受損（MMSE ≥
          15）的老年患者進行詳細評估。正常：0–9；輕中度：10–19；重度：20–30。
        </template>
      </div>
    </div>

    <!-- ── Question items ─────────────────────────────────────── -->
    <div class="nihss-group">
      <div class="group-header-bar gds-bar">
        <span class="group-icon">🧠</span>
        <span class="group-label-text">GDS-{{ method }} 題目</span>
        <span class="group-sub-text">請根據過去一週的感受作答（是 / 否）</span>
        <span class="group-score-tally gds-tally">
          {{ answeredCount }}/{{ maxScore }} 題 ·
          {{ isComplete ? totalScore + "分" : "—" }}
        </span>
      </div>

      <div class="item-list">
        <div
          v-for="q in activeQuestions"
          :key="q.key"
          class="gds-item"
          :class="{
            'item-healthy':
              selections[q.key] !== null &&
              selections[q.key] !== q.depressiveAnswer,
            'item-depressive':
              selections[q.key] !== null &&
              selections[q.key] === q.depressiveAnswer,
          }"
        >
          <div class="item-header">
            <div class="item-meta-row">
              <span class="item-qnum">Q{{ q.qNum }}</span>
            </div>
            <div class="item-name-block">
              <span class="item-name">{{ q.text }}</span>
              <span class="item-sub">{{ q.en }}</span>
            </div>
            <span
              class="item-score"
              :class="{
                depressive:
                  selections[q.key] !== null &&
                  selections[q.key] === q.depressiveAnswer,
                zero:
                  selections[q.key] !== null &&
                  selections[q.key] !== q.depressiveAnswer,
                unanswered: selections[q.key] === null,
              }"
            >
              {{
                selections[q.key] === null
                  ? "—"
                  : selections[q.key] === q.depressiveAnswer
                    ? "1"
                    : "0"
              }}
            </span>
          </div>
          <div class="yn-row">
            <button
              class="yn-btn btn-yes"
              :class="{
                'active-depressive':
                  selections[q.key] === 'yes' && q.depressiveAnswer === 'yes',
                'active-healthy':
                  selections[q.key] === 'yes' && q.depressiveAnswer !== 'yes',
              }"
              @click="selections[q.key] = 'yes'"
            >
              是（Yes）
            </button>
            <button
              class="yn-btn btn-no"
              :class="{
                'active-depressive':
                  selections[q.key] === 'no' && q.depressiveAnswer === 'no',
                'active-healthy':
                  selections[q.key] === 'no' && q.depressiveAnswer !== 'no',
              }"
              @click="selections[q.key] = 'no'"
            >
              否（No）
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- ── Result card ────────────────────────────────────────── -->
    <div class="gds-result" :class="severity.color">
      <div class="result-left">
        <span class="result-number">{{ isComplete ? totalScore : "—" }}</span>
        <span class="result-max" v-if="isComplete">/ {{ maxScore }}</span>
      </div>
      <div class="result-right">
        <span class="result-ver">GDS-{{ method }}</span>
        <span class="result-level">{{ severity.level }}</span>
        <span class="result-advice">{{ severity.advice }}</span>
      </div>
    </div>

    <!-- ── Results detail ─────────────────────────────────────── -->
    <div v-if="showResults" class="results-detail">
      <div class="results-header">評估明細</div>
      <div v-for="q in activeQuestions" :key="q.key" class="detail-row">
        <span class="detail-qnum">Q{{ q.qNum }}</span>
        <span class="detail-domain">{{ q.text }}</span>
        <span
          class="detail-score"
          :class="{
            depressive:
              selections[q.key] === q.depressiveAnswer &&
              selections[q.key] !== null,
            zero:
              selections[q.key] !== null &&
              selections[q.key] !== q.depressiveAnswer,
          }"
        >
          {{
            selections[q.key] === null
              ? "—"
              : selections[q.key] === q.depressiveAnswer
                ? "1"
                : "0"
          }}
        </span>
        <span class="detail-desc">
          {{
            selections[q.key] === "yes"
              ? "是"
              : selections[q.key] === "no"
                ? "否"
                : "未填"
          }}
        </span>
      </div>
      <div class="detail-row detail-total">
        <span class="detail-qnum">∑</span>
        <span class="detail-domain">GDS-{{ method }} 總分</span>
        <span class="detail-score detail-score-brand">{{ totalScore }}</span>
        <div class="detail-desc detail-desc-block">
          <span class="detail-desc-unit">/ {{ maxScore }}</span>
          <span class="detail-desc-label">{{ severity.level }}</span>
        </div>
      </div>
    </div>

    <!-- ── Clinical note ──────────────────────────────────────── -->
    <div class="warn-box">
      <span class="warn-icon">⚠</span>
      <span
        >GDS
        為篩查工具，不能取代完整的精神科診斷訪談。任何陽性結果均應安排進一步臨床評估。GDS
        不包含自殺意念評估項目，陽性個案須另行評估安全風險。認知嚴重受損者（MMSE
        &lt; 15）不建議使用 GDS。</span
      >
    </div>

    <!-- ── Actions ────────────────────────────────────────────── -->
    <div class="gds-actions">
      <button class="btn-view" @click="showResults = !showResults">
        {{ showResults ? "收起明細" : "查看評估結果" }}
      </button>
      <button class="btn-copy" @click="copyMarkdown">
        {{ copied ? "已複製 ✓" : "複製 Markdown 結果" }}
      </button>
      <button class="btn-reset" @click="reset">重置</button>
    </div>
    <p v-if="!isComplete" class="progress-hint">
      已完成 {{ answeredCount }}/{{ maxScore }} 題，尚餘
      {{ maxScore - answeredCount }} 題
    </p>
  </div>
</template>

<style scoped>
.gds {
  max-width: 780px;
  margin: 0 auto;
  padding: 2rem 0 3rem;
  font-size: 0.9rem;
}

/* ── Header ────────────────────────────────────────────────────── */
.gds-header {
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
  margin: 0 0 0.3rem;
}

/* ── ICOPE hint pill ────────────────────────────────────────────── */
.subtitle-hint {
  margin: 0.25rem 0 0;
}
.hint-tag {
  display: inline-block;
  font-size: 0.72rem;
  font-weight: 700;
  padding: 2px 10px;
  border-radius: 999px;
  white-space: nowrap;
  cursor: default;
  user-select: none;
}
/* Active — ICOPE dep screen positive: matches SPPB orange style */
.hint-tag--active {
  background: rgba(232, 121, 249, 0.12);
  color: #a21caf;
}
/* Inactive — always visible as a passive guide */
.hint-tag--inactive {
  background: rgba(249, 115, 22, 0.08);
  color: #c2410c;
}

.score-badge {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-width: 84px;
  padding: 0.6rem 1rem;
  border-radius: 14px;
  border: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg-soft);
  transition: all 0.3s;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
}
.badge-ver {
  font-size: 0.62rem;
  font-weight: 700;
  letter-spacing: 0.06em;
  color: var(--vp-c-text-3);
  margin-bottom: 1px;
}
.score-number {
  font-size: 2rem;
  font-weight: 800;
  line-height: 1;
}
.score-label {
  font-size: 0.65rem;
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
  height: 8px;
  border-radius: 999px;
  background: var(--vp-c-bg-mute);
  overflow: hidden;
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
.severity-fill.mild {
  background: linear-gradient(90deg, #f59e0b, #fbbf24);
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
  color: #f59e0b;
  font-weight: 700;
}
.tick-orange {
  color: #f97316;
  font-weight: 700;
}
.tick-red {
  color: #ef4444;
  font-weight: 700;
}

/* ── Alert ─────────────────────────────────────────────────────── */
.gds-alert {
  display: flex;
  align-items: flex-start;
  gap: 0.6rem;
  padding: 0.75rem 1rem;
  border-radius: 10px;
  background: rgba(239, 68, 68, 0.06);
  border: 1px solid rgba(239, 68, 68, 0.35);
  font-size: 0.82rem;
  color: var(--vp-c-text-2);
  line-height: 1.6;
  margin-bottom: 1rem;
}
.alert-icon {
  color: #ef4444;
  flex-shrink: 0;
}

/* ── Groups ────────────────────────────────────────────────────── */
.nihss-group {
  margin-bottom: 1.5rem;
}
.group-header-bar {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.55rem 0.85rem 0.55rem 1.2rem;
  border-radius: 10px;
  background: linear-gradient(
    135deg,
    rgba(245, 158, 11, 0.08),
    var(--vp-c-bg-mute),
    var(--vp-c-bg-soft)
  );
  border: 1px solid var(--vp-c-divider);
  border-left: 4px solid #f59e0b;
  margin-bottom: 0.6rem;
  box-shadow: 0 1px 3px rgba(245, 158, 11, 0.06);
}
.tab-bar {
  border-left: 4px solid #6366f1;
  background: linear-gradient(
    135deg,
    rgba(99, 102, 241, 0.08),
    var(--vp-c-bg-mute),
    var(--vp-c-bg-soft)
  );
  box-shadow: 0 1px 3px rgba(99, 102, 241, 0.06);
}
.gds-bar {
  border-left: 4px solid #3b82f6;
  background: linear-gradient(
    135deg,
    rgba(59, 130, 246, 0.08),
    var(--vp-c-bg-mute),
    var(--vp-c-bg-soft)
  );
  box-shadow: 0 1px 3px rgba(59, 130, 246, 0.06);
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
}
.gds-tally {
  color: #3b82f6;
  background: rgba(59, 130, 246, 0.12);
}

/* ── Tab toggle ────────────────────────────────────────────────── */
.tab-toggle {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
  flex-wrap: wrap;
}
.tab-btn {
  flex: 1;
  min-width: 100px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 3px;
  padding: 0.65rem 0.75rem;
  border-radius: 10px;
  border: 1.5px solid var(--vp-c-divider);
  background: var(--vp-c-bg-soft);
  cursor: pointer;
  font-family: inherit;
  transition: all 0.18s;
}
.tab-btn.tab-active {
  border-color: #6366f1;
  background: rgba(99, 102, 241, 0.06);
}
.tab-title {
  font-size: 0.9rem;
  font-weight: 700;
  color: var(--vp-c-text-1);
}
.tab-sub {
  font-size: 0.68rem;
  color: var(--vp-c-text-3);
}
.tab-btn.tab-active .tab-title {
  color: #6366f1;
}
.tab-btn.tab-active .tab-sub {
  color: rgba(99, 102, 241, 0.6);
}

/* ── Method note ───────────────────────────────────────────────── */
.method-note {
  padding: 0.6rem 0.9rem;
  border-radius: 8px;
  font-size: 0.8rem;
  color: var(--vp-c-text-2);
  line-height: 1.6;
  border: 1px solid var(--vp-c-divider);
}
.note-4 {
  background: rgba(99, 102, 241, 0.04);
  border-color: rgba(99, 102, 241, 0.2);
}
.note-15 {
  background: rgba(59, 130, 246, 0.04);
  border-color: rgba(59, 130, 246, 0.2);
}
.note-30 {
  background: rgba(20, 184, 166, 0.04);
  border-color: rgba(20, 184, 166, 0.2);
}

/* ── Item list ─────────────────────────────────────────────────── */
.item-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
.gds-item {
  border: 1px solid var(--vp-c-divider);
  border-radius: 10px;
  background: var(--vp-c-bg-soft);
  overflow: hidden;
  transition: all 0.25s;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.03);
}
.gds-item:hover {
  box-shadow: 0 3px 12px rgba(0, 0, 0, 0.06);
  border-color: var(--vp-c-divider);
}
.gds-item.item-healthy {
  border-color: #22c55e;
}
.gds-item.item-depressive {
  border-color: #ef4444;
  background: linear-gradient(135deg, rgba(239, 68, 68, 0.04), transparent);
  box-shadow: 0 2px 10px rgba(239, 68, 68, 0.08);
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
  color: var(--vp-c-brand-1);
  background: var(--vp-c-brand-soft);
  padding: 1px 7px;
  border-radius: 999px;
  letter-spacing: 0.04em;
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
  font-size: 1rem;
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
.item-score.depressive {
  color: #ef4444;
  border-color: rgba(239, 68, 68, 0.3);
  background: rgba(239, 68, 68, 0.06);
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

/* ── Yes / No buttons ──────────────────────────────────────────── */
.yn-row {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 2px;
  padding: 3px;
  background: var(--vp-c-bg-mute);
}
.yn-btn {
  padding: 0.6rem;
  font-size: 0.85rem;
  font-weight: 700;
  cursor: pointer;
  font-family: inherit;
  border: 1.5px solid transparent;
  background: var(--vp-c-bg);
  color: var(--vp-c-text-2);
  transition: all 0.2s;
  border-radius: 6px;
}
.yn-btn:hover {
  border-color: var(--vp-c-divider);
  background: var(--vp-c-bg-soft);
}
.active-depressive {
  border-color: #ef4444 !important;
  color: #ef4444 !important;
  background: linear-gradient(
    180deg,
    rgba(239, 68, 68, 0.12),
    rgba(239, 68, 68, 0.06)
  ) !important;
  box-shadow: 0 0 0 1px rgba(239, 68, 68, 0.08) !important;
}
.active-healthy {
  border-color: #22c55e;
  color: #22c55e;
  background: linear-gradient(
    180deg,
    rgba(34, 197, 94, 0.12),
    rgba(34, 197, 94, 0.06)
  );
  box-shadow: 0 0 0 1px rgba(34, 197, 94, 0.08);
}

/* ── Result card ───────────────────────────────────────────────── */
.gds-result {
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
.gds-result.normal {
  border-color: #22c55e;
  box-shadow:
    0 0 0 1px rgba(34, 197, 94, 0.06),
    0 1px 3px rgba(0, 0, 0, 0.04);
}
.gds-result.mild {
  border-color: #f59e0b;
  box-shadow:
    0 0 0 1px rgba(245, 158, 11, 0.06),
    0 1px 3px rgba(0, 0, 0, 0.04);
}
.gds-result.moderate {
  border-color: #f97316;
  box-shadow:
    0 0 0 1px rgba(249, 115, 22, 0.06),
    0 1px 3px rgba(0, 0, 0, 0.04);
}
.gds-result.critical {
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
.gds-result.normal .result-number {
  color: #22c55e;
}
.gds-result.mild .result-number {
  color: #f59e0b;
}
.gds-result.moderate .result-number {
  color: #f97316;
}
.gds-result.critical .result-number {
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
.result-ver {
  font-size: 0.72rem;
  font-weight: 700;
  color: var(--vp-c-text-3);
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
  align-items: flex-start;
  gap: 0.6rem;
  padding: 0.5rem 0.9rem;
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
  color: #3b82f6;
  flex-shrink: 0;
  width: 32px;
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
  color: var(--vp-c-text-3);
  flex-shrink: 0;
  width: 52px;
  text-align: right;
  white-space: normal;
}
.detail-score.depressive {
  color: #ef4444;
}
.detail-score.zero {
  color: #22c55e;
}
.detail-score-brand {
  color: var(--vp-c-brand-1);
}
.detail-desc {
  font-size: 0.75rem;
  color: var(--vp-c-text-2);
  flex-shrink: 0;
  width: 80px;
  text-align: left;
  white-space: normal;
}
.detail-desc-block {
  display: flex;
  flex-direction: column;
  gap: 1px;
  width: 80px;
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

/* ── Warning box ───────────────────────────────────────────────── */
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

/* ── Actions ───────────────────────────────────────────────────── */
.gds-actions {
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
  .gds-header {
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
  .gds-result {
    flex-direction: column;
    gap: 0.75rem;
  }
  .tab-toggle {
    flex-direction: column;
  }
  .hint-tag {
    white-space: normal;
  }
}
</style>
