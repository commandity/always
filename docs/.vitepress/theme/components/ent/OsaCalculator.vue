<script setup lang="ts">
import { ref, computed } from "vue";

const activeTab = ref<"stopbang" | "ess">("stopbang");

// ── STOP-BANG ───────────────────────────────────────────────────
const sbItems = [
  {
    key: "snoring",
    letter: "S",
    name: "打鼾",
    sub: "Snoring",
    question: "您打鼾的聲音很大嗎？",
    detail: "聲音響到可從關著的門外聽到，或大到讓床伴受到困擾",
    hint: "由床伴或家人確認更為準確",
    color: "stop",
  },
  {
    key: "tired",
    letter: "T",
    name: "疲倦",
    sub: "Tired",
    question: "您白天是否常常感到疲倦、疲乏或昏昏欲睡？",
    detail:
      "即使夜間睡眠時數足夠，仍感到日間過度嗜睡（Excessive Daytime Sleepiness）",
    hint: "參考 Epworth 嗜睡量表評估日間嗜睡程度",
    color: "stop",
  },
  {
    key: "observed",
    letter: "O",
    name: "被觀察到呼吸中止",
    sub: "Observed Apnea",
    question: "有人觀察到您睡眠中停止呼吸嗎？",
    detail: "床伴、家人或室友曾觀察到您在睡眠中有呼吸暫停的情況",
    hint: "需由他人（通常為床伴）提供資訊",
    color: "stop",
  },
  {
    key: "pressure",
    letter: "P",
    name: "高血壓",
    sub: "Pressure (High Blood Pressure)",
    question: "您有高血壓病史，或目前正在接受高血壓治療嗎？",
    detail: "包含已診斷高血壓並服藥治療，或未治療但已知有高血壓",
    hint: "高血壓與 OSA 雙向相關，互為危險因子",
    color: "stop",
  },
  {
    key: "bmi",
    letter: "B",
    name: "BMI > 35",
    sub: "BMI > 35 kg/m²",
    question: "您的身體質量指數（BMI）是否超過 35 kg/m²？",
    detail:
      "BMI = 體重（kg）÷ 身高（m）²。BMI > 35 為第二級肥胖，OSA 風險顯著增加",
    hint: "BMI = 體重(kg) ÷ 身高(m)²，可自行計算",
    color: "bang",
  },
  {
    key: "age",
    letter: "A",
    name: "年齡 > 50 歲",
    sub: "Age > 50 years",
    question: "您的年齡是否超過 50 歲？",
    detail: "隨年齡增長，上呼吸道肌肉張力降低，OSA 發生率顯著上升",
    hint: "50 歲以上 OSA 患病率約為年輕族群的 2–3 倍",
    color: "bang",
  },
  {
    key: "neck",
    letter: "N",
    name: "頸圍 > 40 cm",
    sub: "Neck Circumference > 40 cm",
    question: "您的頸圍是否超過 40 公分？",
    detail:
      "頸圍測量位置：甲狀軟骨下緣（喉結下方）水平繞頸一圈。頸部脂肪堆積壓迫上呼吸道是 OSA 重要機制",
    hint: "男性正常頸圍 ≤ 38 cm，女性 ≤ 35 cm；> 40 cm 為高風險",
    color: "bang",
  },
  {
    key: "gender",
    letter: "G",
    name: "男性",
    sub: "Gender (Male)",
    question: "您的性別是男性嗎？",
    detail:
      "男性罹患 OSA 的風險是女性的 2–3 倍，主要因脂肪分布模式、氣道解剖及荷爾蒙差異",
    hint: "女性在停經後 OSA 風險顯著上升，接近男性水準",
    color: "bang",
  },
];

const sbStopItems = sbItems.filter((i) => i.color === "stop");
const sbBangItems = sbItems.filter((i) => i.color === "bang");

const sbSel = ref<Record<string, boolean>>(
  Object.fromEntries(sbItems.map((i) => [i.key, false])),
);
const sbShowResults = ref(false);
const sbCopied = ref(false);

const sbTotal = computed(
  () => Object.values(sbSel.value).filter(Boolean).length,
);
const sbStopScore = computed(
  () => sbStopItems.filter((i) => sbSel.value[i.key]).length,
);
const sbBangScore = computed(
  () => sbBangItems.filter((i) => sbSel.value[i.key]).length,
);
const sbHighRisk = computed(() => {
  const s = sbTotal.value;
  const male = sbSel.value["gender"];
  const bmi = sbSel.value["bmi"];
  const neck = sbSel.value["neck"];
  return s >= 5 || (s >= 2 && male) || (s >= 2 && bmi) || (s >= 2 && neck);
});
const sbSeverity = computed(() => {
  const s = sbTotal.value;
  if (s <= 2)
    return {
      level: "低風險",
      color: "normal",
      probability: "低度 OSA 可能性",
      advice: "低風險，通常不需進一步睡眠評估",
      management: "衛教睡眠衛生，若有明顯症狀可考慮進一步評估",
      tag: "低風險",
      ahi: "AHI ≥ 5 機率：約 17%",
    };
  if (s <= 4)
    return {
      level: "中等風險",
      color: "moderate",
      probability: "中度 OSA 可能性",
      advice: "中等風險，建議就醫評估，考慮多道睡眠生理檢查（PSG）",
      management: "轉介睡眠醫學評估，考慮居家睡眠呼吸監測（HSAT）或 PSG",
      tag: "建議評估",
      ahi: "AHI ≥ 5 機率：約 50%",
    };
  return {
    level: "高風險",
    color: "severe",
    probability: "高度 OSA 可能性",
    advice: "高風險，強烈建議睡眠專科評估及多道睡眠生理檢查",
    management: "優先安排 PSG 或 HSAT，確診後評估 CPAP 或其他治療",
    tag: "高風險",
    ahi: "AHI ≥ 5 機率：> 70%",
  };
});

function sbToggle(key: string) {
  sbSel.value[key] = !sbSel.value[key];
}
function sbReset() {
  sbItems.forEach((i) => {
    sbSel.value[i.key] = false;
  });
  sbShowResults.value = false;
}

function sbMarkdown() {
  const lines = sbItems
    .map(
      (i) =>
        `- **${i.letter} — ${i.name}**（${i.sub}）：${sbSel.value[i.key] ? "是（+1）" : "否（0）"}`,
    )
    .join("\n");
  return `# STOP-BANG 睡眠呼吸中止症篩查結果\n\n## 評估項目\n\n${lines}\n\n---\n- **STOP-BANG 總分**：${sbTotal.value} / 8\n- **STOP 分組**：${sbStopScore.value} / 4\n- **BANG 分組**：${sbBangScore.value} / 4\n- **風險等級**：${sbSeverity.value.level}（${sbSeverity.value.probability}）\n- **${sbSeverity.value.ahi}**\n- **高風險進階標準（Chung 2012）**：${sbHighRisk.value ? "符合高風險條件" : "不符合高風險條件"}\n- **建議處置**：${sbSeverity.value.advice}\n- **治療建議**：${sbSeverity.value.management}`;
}
async function sbCopy() {
  await navigator.clipboard.writeText(sbMarkdown());
  sbCopied.value = true;
  setTimeout(() => (sbCopied.value = false), 2000);
}

// ── ESS ─────────────────────────────────────────────────────────
const essQuestions = [
  { key: "q1", name: "坐著閱讀時", sub: "Sitting and reading" },
  { key: "q2", name: "看電視時", sub: "Watching TV" },
  {
    key: "q3",
    name: "在公共場所靜坐時（如劇院或會議中）",
    sub: "Sitting inactive in a public place",
  },
  {
    key: "q4",
    name: "連續乘車超過一小時（無中途休息）",
    sub: "As a passenger in a car for an hour without a break",
  },
  {
    key: "q5",
    name: "下午躺下休息時",
    sub: "Lying down to rest in the afternoon",
  },
  { key: "q6", name: "坐著與人交談時", sub: "Sitting and talking to someone" },
  {
    key: "q7",
    name: "午飯後安靜坐著時（未飲酒）",
    sub: "Sitting quietly after lunch without alcohol",
  },
  {
    key: "q8",
    name: "駕車時遇到紅燈停車等待時",
    sub: "In a car, while stopped for a few minutes in traffic",
  },
];
const essOpts = [
  { value: 0, label: "0", desc: "從不打瞌睡" },
  { value: 1, label: "1", desc: "輕微可能" },
  { value: 2, label: "2", desc: "中等可能" },
  { value: 3, label: "3", desc: "高度可能" },
];
const essSel = ref<Record<string, number>>(
  Object.fromEntries(essQuestions.map((q) => [q.key, -1])),
);
const essShowResults = ref(false);
const essCopied = ref(false);

const essTotal = computed(() =>
  essQuestions.reduce((s, q) => {
    const v = essSel.value[q.key];
    return s + (v >= 0 ? v : 0);
  }, 0),
);
const essAnswered = computed(
  () => essQuestions.filter((q) => essSel.value[q.key] >= 0).length,
);
const essComplete = computed(() => essAnswered.value === 8);
const essSeverity = computed(() => {
  const s = essTotal.value;
  if (!essComplete.value)
    return {
      level: "填寫中",
      color: "filling",
      advice: `已完成 ${essAnswered.value}/8 題`,
    };
  if (s <= 10)
    return {
      level: "正常嗜睡",
      color: "normal",
      advice: "日間嗜睡程度在正常範圍，無需特別處置",
    };
  if (s <= 12)
    return {
      level: "輕度嗜睡",
      color: "mild",
      advice: "輕度日間嗜睡，建議檢視睡眠習慣與睡眠衛生",
    };
  if (s <= 15)
    return {
      level: "中度嗜睡",
      color: "moderate",
      advice: "中度日間嗜睡，建議就醫評估，排除睡眠呼吸障礙",
    };
  if (s <= 17)
    return {
      level: "重度嗜睡",
      color: "severe",
      advice: "重度日間嗜睡，建議積極就醫，可能需要多項睡眠生理檢查（PSG）",
    };
  return {
    level: "極重度嗜睡",
    color: "critical",
    advice: "極重度嗜睡，強烈建議睡眠專科評估，可能有嗜睡症或嚴重 OSA",
  };
});

function essReset() {
  essQuestions.forEach((q) => {
    essSel.value[q.key] = -1;
  });
  essShowResults.value = false;
}

function essMarkdown() {
  const lines = essQuestions
    .map((q) => {
      const v = essSel.value[q.key];
      const opt = essOpts.find((o) => o.value === v);
      return `- **${q.name}**（${q.sub}）：${v >= 0 ? `${v} — ${opt?.desc}` : "未填"}`;
    })
    .join("\n");
  return `# ESS 愛普沃斯嗜睡量表評估結果\n\n## 各題評分\n\n${lines}\n\n---\n## 計算結果\n- **ESS 總分**：${essTotal.value} / 24\n- **嚴重程度**：${essSeverity.value.level}\n- **臨床建議**：${essSeverity.value.advice}`;
}
async function essCopy() {
  await navigator.clipboard.writeText(essMarkdown());
  essCopied.value = true;
  setTimeout(() => (essCopied.value = false), 2000);
}
</script>

<template>
  <div class="osa">
    <!-- Pill-style tab bar -->
    <div class="tab-bar">
      <button
        class="tab-btn"
        :class="{ active: activeTab === 'stopbang' }"
        @click="activeTab = 'stopbang'"
      >
        <span class="tab-label">STOP-BANG 睡眠呼吸中止量表</span>
        <span class="tab-sub">OSA Screening Tool</span>
      </button>
      <button
        class="tab-btn"
        :class="{ active: activeTab === 'ess' }"
        @click="activeTab = 'ess'"
      >
        <span class="tab-label">ESS 嗜睡量表</span>
        <span class="tab-sub">Epworth Sleepiness Scale</span>
      </button>
    </div>

    <!-- ════════════ STOP-BANG Panel ════════════ -->
    <div v-show="activeTab === 'stopbang'" class="stopbang">
      <div class="sb-header">
        <div class="header-title">
          <h2 class="title">STOP-BANG 量表</h2>
          <p class="subtitle">
            Obstructive Sleep Apnea Screening · 阻塞性睡眠呼吸中止症篩查工具
          </p>
        </div>
        <div class="score-badge" :class="sbSeverity.color">
          <span class="score-number">{{ sbTotal }}</span>
          <span class="score-label">{{ sbSeverity.tag }}</span>
        </div>
      </div>

      <div class="severity-bar-wrap">
        <div class="severity-bar">
          <div
            class="severity-fill"
            :class="sbSeverity.color"
            :style="{ width: (sbTotal / 8) * 100 + '%' }"
          />
        </div>
        <div class="severity-ticks">
          <span class="tk-normal">0</span><span class="tk-normal">1</span
          ><span class="tick-threshold">3</span
          ><span class="tk-moderate">5</span><span class="tk-severe">8</span>
        </div>
      </div>

      <div class="risk-strip">
        <div class="risk-pill" :class="{ 'risk-active': sbTotal <= 2 }">
          <span class="risk-score">0–2 分</span>
          <span class="risk-rate normal-risk">AHI ≥ 5：約 17%</span>
          <span class="risk-tag">低風險</span>
        </div>
        <div
          class="risk-pill"
          :class="{ 'risk-active': sbTotal >= 3 && sbTotal <= 4 }"
        >
          <span class="risk-score">3–4 分</span>
          <span class="risk-rate moderate-risk">AHI ≥ 5：約 50%</span>
          <span class="risk-tag">中等風險</span>
        </div>
        <div class="risk-pill" :class="{ 'risk-active': sbTotal >= 5 }">
          <span class="risk-score">5–8 分</span>
          <span class="risk-rate severe-risk">AHI ≥ 5：> 70%</span>
          <span class="risk-tag">高風險</span>
        </div>
        <div class="risk-pill" :class="{ 'risk-active': sbHighRisk }">
          <span class="risk-score">進階高風險</span>
          <span class="risk-rate severe-risk">Chung 2012</span>
          <span class="risk-tag">{{ sbHighRisk ? "符合" : "不符合" }}</span>
        </div>
      </div>

      <div class="intro-bar">
        <span class="intro-dot">◉</span>
        <span
          >請依據過去一個月的狀況回答以下 8 個是 / 否問題。每個「是」計
          <strong>1 分</strong>，總分 0–8 分。STOP-BANG 為廣泛使用的 OSA
          術前篩查工具，亦適用於一般門診篩查。</span
        >
      </div>

      <div class="sb-group">
        <div class="group-header stop-header stop-gradient">
          <div class="group-label-block">
            <span class="group-label">STOP</span>
            <span class="group-sub">症狀評估 · 4 項</span>
          </div>
          <div class="group-score-pill stop-pill">{{ sbStopScore }} / 4</div>
        </div>
        <div class="item-list">
          <div
            v-for="item in sbStopItems"
            :key="item.key"
            class="sb-item"
            :class="{ selected: sbSel[item.key] }"
            @click="sbToggle(item.key)"
          >
            <div class="item-letter stop-letter">{{ item.letter }}</div>
            <div class="item-content">
              <div class="item-question">{{ item.question }}</div>
              <div class="item-name">{{ item.name }}（{{ item.sub }}）</div>
              <div class="item-detail">{{ item.detail }}</div>
              <div class="item-hint">{{ item.hint }}</div>
            </div>
            <div class="item-toggle">
              <div
                class="toggle-box"
                :class="{
                  'toggle-on': sbSel[item.key],
                  'stop-on': sbSel[item.key],
                }"
              >
                <svg
                  v-if="sbSel[item.key]"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="3.5"
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
              <span
                class="toggle-score"
                :class="{ 'score-on': sbSel[item.key] }"
                >{{ sbSel[item.key] ? "+1" : "0" }}</span
              >
            </div>
          </div>
        </div>
      </div>

      <div class="sb-group">
        <div class="group-header bang-header bang-gradient">
          <div class="group-label-block">
            <span class="group-label">BANG</span>
            <span class="group-sub">解剖與人口學特徵 · 4 項</span>
          </div>
          <div class="group-score-pill bang-pill">{{ sbBangScore }} / 4</div>
        </div>
        <div class="item-list">
          <div
            v-for="item in sbBangItems"
            :key="item.key"
            class="sb-item"
            :class="{ selected: sbSel[item.key] }"
            @click="sbToggle(item.key)"
          >
            <div class="item-letter bang-letter">{{ item.letter }}</div>
            <div class="item-content">
              <div class="item-question">{{ item.question }}</div>
              <div class="item-name">{{ item.name }}（{{ item.sub }}）</div>
              <div class="item-detail">{{ item.detail }}</div>
              <div class="item-hint">{{ item.hint }}</div>
            </div>
            <div class="item-toggle">
              <div
                class="toggle-box"
                :class="{
                  'toggle-on': sbSel[item.key],
                  'bang-on': sbSel[item.key],
                }"
              >
                <svg
                  v-if="sbSel[item.key]"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="3.5"
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
              <span
                class="toggle-score"
                :class="{ 'score-on': sbSel[item.key] }"
                >{{ sbSel[item.key] ? "+1" : "0" }}</span
              >
            </div>
          </div>
        </div>
      </div>

      <div class="sb-result" :class="sbSeverity.color">
        <div class="result-left">
          <span class="result-number">{{ sbTotal }}</span>
          <span class="result-max">/ 8</span>
        </div>
        <div class="result-right">
          <div class="result-top">
            <span class="result-level">{{ sbSeverity.level }}</span>
          </div>
          <span class="result-ahi">{{ sbSeverity.ahi }}</span>
          <span class="result-advice">{{ sbSeverity.advice }}</span>
          <div class="result-sub-scores">
            <span class="sub-pill-sm stop-sm">STOP：{{ sbStopScore }} / 4</span>
            <span class="sub-pill-sm bang-sm">BANG：{{ sbBangScore }} / 4</span>
            <span v-if="sbHighRisk" class="sub-pill-sm high-sm"
              >⚠ 進階高風險</span
            >
          </div>
        </div>
      </div>

      <div class="high-risk-note" :class="{ 'high-active': sbHighRisk }">
        <span class="note-icon">{{ sbHighRisk ? "⚠" : "ℹ" }}</span>
        <div>
          <strong>Chung 2012 進階高風險標準：</strong>
          符合以下任一項視為高風險：總分 ≥ 5、或總分 ≥ 2 且為男性、或總分 ≥ 2 且
          BMI &gt; 35、或總分 ≥ 2 且頸圍 &gt; 40 cm。目前：<strong>{{
            sbHighRisk ? "符合高風險條件" : "不符合高風險條件"
          }}</strong
          >。
        </div>
      </div>

      <div v-if="sbShowResults" class="results-detail">
        <div class="results-header">評估明細</div>
        <div class="detail-section-title stop-section">STOP — 症狀評估</div>
        <div v-for="item in sbStopItems" :key="item.key" class="detail-row">
          <span class="detail-letter stop-letter-sm">{{ item.letter }}</span>
          <span class="detail-domain">{{ item.name }}</span>
          <span class="detail-score" :class="{ positive: sbSel[item.key] }">{{
            sbSel[item.key] ? "+1" : "0"
          }}</span>
          <span class="detail-desc">{{ sbSel[item.key] ? "是" : "否" }}</span>
        </div>
        <div class="detail-section-title bang-section">BANG — 解剖與人口學</div>
        <div v-for="item in sbBangItems" :key="item.key" class="detail-row">
          <span class="detail-letter bang-letter-sm">{{ item.letter }}</span>
          <span class="detail-domain">{{ item.name }}</span>
          <span class="detail-score" :class="{ positive: sbSel[item.key] }">{{
            sbSel[item.key] ? "+1" : "0"
          }}</span>
          <span class="detail-desc">{{ sbSel[item.key] ? "是" : "否" }}</span>
        </div>
        <div class="detail-row total-row">
          <span class="detail-letter brand-sm">∑</span>
          <span class="detail-domain">STOP-BANG 總分</span>
          <span class="detail-score positive">{{ sbTotal }} / 8</span>
          <span class="detail-desc">{{ sbSeverity.level }}</span>
        </div>
      </div>

      <div class="sb-actions">
        <button class="btn-view" @click="sbShowResults = !sbShowResults">
          {{ sbShowResults ? "收起明細" : "查看評估結果" }}
        </button>
        <button class="btn-copy" @click="sbCopy">
          {{ sbCopied ? "已複製 ✓" : "複製 Markdown 結果" }}
        </button>
        <button class="btn-reset" @click="sbReset">重置</button>
      </div>
    </div>

    <!-- ════════════ ESS Panel ════════════ -->
    <div v-show="activeTab === 'ess'" class="ess">
      <div class="ess-header">
        <div class="header-title">
          <h2 class="title">ESS 愛普沃斯嗜睡量表</h2>
          <p class="subtitle">Epworth Sleepiness Scale · 日間嗜睡程度評估</p>
        </div>
        <div class="score-badge" :class="essSeverity.color">
          <span class="score-number">{{ essComplete ? essTotal : "—" }}</span>
          <span class="score-label">{{
            essComplete ? essSeverity.level : `${essAnswered}/8`
          }}</span>
        </div>
      </div>

      <div class="severity-bar-wrap">
        <div class="severity-bar">
          <div
            class="severity-fill"
            :class="essSeverity.color"
            :style="{ width: (essTotal / 24) * 100 + '%' }"
          />
        </div>
        <div class="severity-ticks">
          <span class="tk-normal">0</span><span class="tick-threshold">10</span
          ><span class="tk-mild">12</span><span class="tk-moderate">15</span
          ><span class="tk-severe">17</span><span class="tk-critical">24</span>
        </div>
      </div>

      <div class="intro-bar">
        <span class="intro-dot">◉</span>
        <span
          >請評估在以下<strong>日常情境</strong>中，您打瞌睡或入睡的可能性。即使您近期未遇到這些情境，也請想像若遇到時的狀況。每題
          0（從不）至 3（高度可能），共 8 題，總分 0–24 分。</span
        >
      </div>

      <div class="ess-group">
        <div class="group-header">
          <div class="group-label-block">
            <span class="group-label">日間嗜睡情境評估</span>
            <span class="group-sub"
              >Daytime Sleepiness in Various Situations · 8 題</span
            >
          </div>
          <div class="group-score-pill">{{ essAnswered }}/8 題</div>
        </div>

        <div class="item-list">
          <div
            v-for="q in essQuestions"
            :key="q.key"
            class="ess-item"
            :class="{ answered: essSel[q.key] >= 0, high: essSel[q.key] >= 2 }"
          >
            <div class="item-header">
              <div class="item-meta-row">
                <span class="item-qnum">Q{{ q.key.slice(1) }}</span>
              </div>
              <div class="item-name-block">
                <span class="item-name">{{ q.name }}</span>
                <span class="item-sub">{{ q.sub }}</span>
              </div>
              <span
                class="item-score"
                :class="{
                  zero: essSel[q.key] === 0,
                  unanswered: essSel[q.key] < 0,
                  high: essSel[q.key] >= 2,
                }"
                >{{ essSel[q.key] >= 0 ? essSel[q.key] : "—" }}</span
              >
            </div>
            <div class="option-row">
              <label
                v-for="opt in essOpts"
                :key="opt.value"
                class="opt-pill"
                :class="{
                  active: essSel[q.key] === opt.value,
                  ['s' + opt.value]: true,
                }"
              >
                <input
                  type="radio"
                  :name="q.key"
                  :value="opt.value"
                  v-model="essSel[q.key]"
                />
                <span class="opt-num">{{ opt.label }}</span>
                <span class="opt-desc">{{ opt.desc }}</span>
              </label>
            </div>
          </div>
        </div>
      </div>

      <div class="ess-result" :class="essSeverity.color">
        <div class="result-left">
          <span class="result-number">{{ essComplete ? essTotal : "—" }}</span>
          <span class="result-max">/ 24</span>
        </div>
        <div class="result-right">
          <span class="result-level">{{ essSeverity.level }}</span>
          <span class="result-advice">{{ essSeverity.advice }}</span>
        </div>
      </div>

      <div v-if="essShowResults" class="results-detail">
        <div class="results-header">評估明細</div>
        <div v-for="q in essQuestions" :key="q.key" class="detail-row">
          <span class="detail-qnum">Q{{ q.key.slice(1) }}</span>
          <span class="detail-domain">{{ q.name }}</span>
          <span
            class="detail-score"
            :class="{
              zero: essSel[q.key] === 0,
              high: essSel[q.key] >= 2,
              brand: essSel[q.key] === 1,
            }"
            >{{ essSel[q.key] >= 0 ? essSel[q.key] : "—" }}</span
          >
          <span class="detail-desc">{{
            essSel[q.key] >= 0
              ? essOpts.find((o) => o.value === essSel[q.key])?.desc
              : "未填"
          }}</span>
        </div>
        <div class="detail-row total-row">
          <span class="detail-qnum" />
          <span class="detail-domain">ESS 總分</span>
          <span class="detail-score brand">{{ essTotal }} / 24</span>
          <span class="detail-desc">{{ essSeverity.level }}</span>
        </div>
      </div>

      <div class="ess-actions">
        <button class="btn-view" @click="essShowResults = !essShowResults">
          {{ essShowResults ? "收起明細" : "查看評估結果" }}
        </button>
        <button class="btn-copy" @click="essCopy">
          {{ essCopied ? "已複製 ✓" : "複製 Markdown 結果" }}
        </button>
        <button class="btn-reset" @click="essReset">重置</button>
      </div>
      <p v-if="!essComplete" class="progress-hint">
        已完成 {{ essAnswered }}/8 題，尚餘 {{ 8 - essAnswered }} 題
      </p>
    </div>
  </div>
</template>

<style scoped>
/* ── Layout & Tab Bar ──────────────────────────────────────────── */
.osa {
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
}
.tab-btn {
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
  opacity: 0.85;
}

@media (max-width: 640px) {
  .tab-btn {
    padding: 0.5rem 0.65rem;
  }
  .tab-label {
    font-size: 0.9rem;
  }
  .tab-sub {
    font-size: 0.72rem;
  }
}

/* ── STOP-BANG Panel ────────────────────────────────────────── */
.stopbang {
  max-width: 780px;
  margin: 0 auto;
  padding: 2rem 0 3rem;
  font-size: 0.9rem;
}

/* ── ESS Panel ──────────────────────────────────────────────── */
.ess {
  max-width: 780px;
  margin: 0 auto;
  padding: 2rem 0 3rem;
  font-size: 0.9rem;
}

/* ══════════════════════════════════════════════════════════════════
   Shared Styles (used by both panels)
   ══════════════════════════════════════════════════════════════════ */

/* ── Headers ────────────────────────────────────────────────────── */
.sb-header,
.ess-header {
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

/* ── Score Badge ────────────────────────────────────────────────── */
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
  font-size: 2.2rem;
  font-weight: 800;
  line-height: 1;
  transition: color 0.3s;
}
.score-label {
  font-size: 0.68rem;
  font-weight: 700;
  margin-top: 2px;
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
.score-badge.critical {
  border-color: #ef4444;
  color: #ef4444;
  box-shadow:
    0 0 0 1px rgba(239, 68, 68, 0.08),
    0 1px 3px rgba(0, 0, 0, 0.04);
}
.score-badge.filling {
  color: var(--vp-c-text-3);
}

/* ── Severity Bar ──────────────────────────────────────────────── */
.severity-bar-wrap {
  margin-bottom: 1.5rem;
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
.severity-fill.normal {
  background: linear-gradient(90deg, #22c55e, #16a34a);
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
.severity-fill.critical {
  background: linear-gradient(90deg, #ef4444, #f87171);
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
  position: relative;
}
.tick-threshold::after {
  content: "";
  position: absolute;
  top: -10px;
  left: 50%;
  transform: translateX(-50%);
  width: 2px;
  height: 6px;
  background: #f97316;
  border-radius: 1px;
}

.severity-ticks .tk-normal {
  color: #22c55e;
  font-weight: 700;
}
.severity-ticks .tk-mild {
  color: #84cc16;
  font-weight: 700;
}
.severity-ticks .tk-moderate {
  color: #f59e0b;
  font-weight: 700;
}
.severity-ticks .tk-severe {
  color: #f97316;
  font-weight: 700;
}
.severity-ticks .tk-critical {
  color: #ef4444;
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
  margin-bottom: 1.5rem;
  line-height: 1.6;
}
.intro-dot {
  color: var(--vp-c-brand-1);
  flex-shrink: 0;
}

/* ── Group ─────────────────────────────────────────────────────── */
.sb-group,
.ess-group {
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
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.03);
}

/* Stop-Bang specific group headers */
.stop-header {
  border-left: 4px solid #6366f1;
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.08), transparent);
}
.bang-header {
  border-left: 4px solid #f97316;
  background: linear-gradient(135deg, rgba(249, 115, 22, 0.08), transparent);
}

/* ESS-specific group header */
.ess-group .group-header {
  background: linear-gradient(135deg, rgba(245, 158, 11, 0.08), transparent);
  border-left: 4px solid #f59e0b;
  box-shadow: 0 1px 3px rgba(245, 158, 11, 0.06);
}

.group-label-block {
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.group-label {
  font-size: 0.92rem;
  font-weight: 800;
  color: var(--vp-c-text-1);
}
.group-sub {
  font-size: 0.78rem;
  font-weight: 600;
  color: var(--vp-c-text-2);
}
.group-score-pill {
  font-size: 0.78rem;
  font-weight: 700;
  padding: 4px 14px;
  border-radius: 999px;
  white-space: nowrap;
  flex-shrink: 0;
}
.stop-pill {
  border: 1px solid rgba(99, 102, 241, 0.3);
  color: #6366f1;
  background: rgba(99, 102, 241, 0.06);
}
.bang-pill {
  border: 1px solid rgba(249, 115, 22, 0.3);
  color: #f97316;
  background: rgba(249, 115, 22, 0.06);
}
.ess-group .group-score-pill {
  border: 1px solid rgba(245, 158, 11, 0.25);
  color: #f59e0b;
  background: rgba(245, 158, 11, 0.06);
}

/* ── Item List ─────────────────────────────────────────────────── */
.item-list {
  display: flex;
  flex-direction: column;
  gap: 0.45rem;
}

/* ── STOP-BANG Items (clickable cards with toggle) ────────────── */
.sb-item {
  display: flex;
  align-items: flex-start;
  gap: 0.85rem;
  padding: 0.85rem 1rem;
  border: 1px solid var(--vp-c-divider);
  border-radius: 12px;
  background: var(--vp-c-bg-soft);
  cursor: pointer;
  transition:
    border-color 0.2s,
    background 0.2s;
  user-select: none;
}
.sb-item:hover {
  background: var(--vp-c-bg-mute);
}
.sb-item.selected {
  border-color: var(--vp-c-brand-1);
  background: color-mix(in srgb, rgb(34, 197, 94) 18%, var(--vp-c-bg));
}
.item-letter {
  flex-shrink: 0;
  width: 36px;
  height: 36px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.1rem;
  font-weight: 900;
  margin-top: 2px;
}
.stop-letter {
  color: #6366f1;
  background: rgba(99, 102, 241, 0.12);
}
.bang-letter {
  color: #f97316;
  background: rgba(249, 115, 22, 0.12);
}

.item-content {
  flex: 1;
  min-width: 0;
}
.item-question {
  font-size: 0.9rem;
  font-weight: 700;
  color: var(--vp-c-text-1);
  margin-bottom: 3px;
  line-height: 1.4;
}
/* !important needed: custom.css force-normalizes .item-name/.item-detail/
   .item-hint globally with !important, which beats scoped rules otherwise */
.sb-item .item-name {
  font-size: 0.78rem !important;
  font-weight: 600 !important;
  color: var(--vp-c-text-2) !important;
  margin-bottom: 3px;
}
.sb-item .item-detail {
  font-size: 0.78rem !important;
  color: var(--vp-c-text-3) !important;
  line-height: 1.5;
  margin-bottom: 3px;
}
.sb-item .item-hint {
  font-size: 0.7rem !important;
  color: var(--vp-c-text-3) !important;
  font-style: italic;
}
.item-toggle {
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding-top: 2px;
}
.toggle-box {
  width: 22px;
  height: 22px;
  border-radius: 6px;
  border: 1.5px solid var(--vp-c-divider);
  background: var(--vp-c-bg);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.15s;
}
.toggle-box svg {
  width: 13px;
  height: 13px;
  color: #fff;
}
.stop-on {
  background: #6366f1;
  border-color: #6366f1;
}
.bang-on {
  background: #f97316;
  border-color: #f97316;
}
.toggle-score {
  font-size: 0.78rem;
  font-weight: 800;
  color: var(--vp-c-text-3);
}
.score-on {
  color: var(--vp-c-brand-1);
}

/* ── ESS Items (radio pill grid) ──────────────────────────────── */
.ess-item {
  border: 1px solid var(--vp-c-divider);
  border-radius: 10px;
  background: var(--vp-c-bg-soft);
  overflow: hidden;
  transition: all 0.25s;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.03);
}
.ess-item:hover {
  box-shadow: 0 3px 12px rgba(0, 0, 0, 0.06);
  border-color: var(--vp-c-divider);
}
.ess-item.answered {
  border-color: rgba(34, 197, 94, 0.2);
  background: linear-gradient(135deg, rgba(34, 197, 94, 0.04), transparent);
}
.ess-item.high {
  border-color: rgba(249, 115, 22, 0.25);
  background: linear-gradient(
    135deg,
    rgba(249, 115, 22, 0.04),
    transparent
  ) !important;
  box-shadow: 0 2px 10px rgba(249, 115, 22, 0.08);
}

.ess-item .item-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.65rem 0.9rem 0.6rem;
  background: var(--vp-c-bg-mute);
  border-bottom: 1px solid var(--vp-c-divider);
  gap: 0.75rem;
}
.item-meta-row {
  display: flex;
  align-items: center;
  flex-shrink: 0;
}
.item-qnum {
  font-size: 0.7rem;
  font-weight: 800;
  color: #fff;
  background: linear-gradient(135deg, #f59e0b, #d97706);
  padding: 2px 9px;
  border-radius: 999px;
  letter-spacing: 0.04em;
  box-shadow: 0 1px 3px rgba(245, 158, 11, 0.2);
}
.ess-item.high .item-qnum {
  background: linear-gradient(135deg, #f97316, #ef4444);
  box-shadow: 0 1px 3px rgba(249, 115, 22, 0.3);
}
.ess-item .item-name-block {
  display: flex;
  flex-direction: column;
  gap: 2px;
  flex: 1;
}
.ess-item .item-name {
  font-size: 0.88rem;
  font-weight: 600;
  color: var(--vp-c-text-1);
  line-height: 1.4;
}
.ess-item .item-sub {
  font-size: 0.7rem;
  color: var(--vp-c-text-3);
}
.ess-item .item-score {
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
.ess-item .item-score.zero {
  color: #22c55e;
  border-color: rgba(34, 197, 94, 0.25);
  background: rgba(34, 197, 94, 0.06);
}
.ess-item .item-score.high {
  color: #f97316;
  border-color: rgba(249, 115, 22, 0.3);
  background: rgba(249, 115, 22, 0.08);
}
.ess-item .item-score.unanswered {
  color: var(--vp-c-text-3);
  border-color: var(--vp-c-divider);
  background: transparent;
}

/* ── Option Row / Pills ────────────────────────────────────────── */
.option-row {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 2px;
  padding: 3px;
  background: var(--vp-c-bg-mute);
}
.opt-pill {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 0.65rem 0.15rem;
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

/* ESS opt-pill score colors — s0 (green) through s3 (amber) */
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
  background: color-mix(in srgb, rgb(34, 197, 94) 18%, var(--vp-c-bg));
  box-shadow: 0 0 0 1px rgba(34, 197, 94, 0.08);
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
  background: color-mix(in srgb, rgb(132, 204, 22) 18%, var(--vp-c-bg));
  box-shadow: 0 0 0 1px rgba(132, 204, 22, 0.08);
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
  background: color-mix(in srgb, rgb(234, 179, 8) 18%, var(--vp-c-bg));
  box-shadow: 0 0 0 1px rgba(234, 179, 8, 0.08);
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
  background: color-mix(in srgb, rgb(245, 158, 11) 18%, var(--vp-c-bg));
  box-shadow: 0 0 0 1px rgba(245, 158, 11, 0.08);
}

.opt-num {
  font-size: 1.05rem;
  font-weight: 900;
  transition: color 0.2s;
}
.opt-desc {
  font-size: 0.7rem;
  font-weight: 700;
  line-height: 1.3;
  transition: color 0.2s;
}
.opt-pill.s0 .opt-num {
  color: rgba(34, 197, 94, 0.85);
}
.opt-pill.s0.active .opt-num {
  color: #22c55e;
}
.opt-pill.s0 .opt-desc {
  color: rgba(34, 197, 94, 0.7);
}
.opt-pill.s0.active .opt-desc {
  color: rgba(34, 197, 94, 0.9);
}

.opt-pill.s1 .opt-num {
  color: rgba(132, 204, 22, 0.85);
}
.opt-pill.s1.active .opt-num {
  color: #84cc16;
}
.opt-pill.s1 .opt-desc {
  color: rgba(132, 204, 22, 0.7);
}
.opt-pill.s1.active .opt-desc {
  color: rgba(132, 204, 22, 0.9);
}

.opt-pill.s2 .opt-num {
  color: rgba(234, 179, 8, 0.85);
}
.opt-pill.s2.active .opt-num {
  color: #eab308;
}
.opt-pill.s2 .opt-desc {
  color: rgba(234, 179, 8, 0.7);
}
.opt-pill.s2.active .opt-desc {
  color: rgba(234, 179, 8, 0.9);
}

.opt-pill.s3 .opt-num {
  color: rgba(245, 158, 11, 0.85);
}
.opt-pill.s3.active .opt-num {
  color: #f59e0b;
}
.opt-pill.s3 .opt-desc {
  color: rgba(245, 158, 11, 0.7);
}
.opt-pill.s3.active .opt-desc {
  color: rgba(245, 158, 11, 0.9);
}

/* ── Risk strip (STOP-BANG) ────────────────────────────────────── */
.risk-strip {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 0.4rem;
  margin-bottom: 1.25rem;
}
.risk-pill {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 3px;
  padding: 0.5rem 0.3rem;
  border-radius: 8px;
  border: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg-soft);
  text-align: center;
  transition: all 0.2s;
}
.risk-pill.risk-active {
  border-color: var(--vp-c-brand-1);
  background: var(--vp-c-brand-soft);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}
.risk-score {
  font-size: 0.82rem;
  font-weight: 800;
  color: var(--vp-c-text-1);
}
.risk-rate {
  font-size: 0.8rem;
  font-weight: 600;
}
.risk-tag {
  font-size: 0.8rem;
  color: var(--vp-c-text-3);
}
.normal-risk {
  color: #22c55e;
}
.moderate-risk {
  color: #f97316;
}
.severe-risk {
  color: #ef4444;
}

/* ── Result card ───────────────────────────────────────────────── */
.sb-result,
.ess-result {
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

.sb-result.normal,
.ess-result.normal {
  border-color: #22c55e;
  box-shadow:
    0 0 0 1px rgba(34, 197, 94, 0.06),
    0 1px 3px rgba(0, 0, 0, 0.04);
}
.sb-result.mild,
.ess-result.mild {
  border-color: #f59e0b;
  box-shadow:
    0 0 0 1px rgba(245, 158, 11, 0.06),
    0 1px 3px rgba(0, 0, 0, 0.04);
}
.sb-result.moderate,
.ess-result.moderate {
  border-color: #f97316;
  box-shadow:
    0 0 0 1px rgba(249, 115, 22, 0.06),
    0 1px 3px rgba(0, 0, 0, 0.04);
}
.sb-result.severe,
.ess-result.severe {
  border-color: #ef4444;
  box-shadow:
    0 0 0 1px rgba(239, 68, 68, 0.06),
    0 1px 3px rgba(0, 0, 0, 0.04);
}
.ess-result.critical {
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
.sb-result.normal .result-number,
.ess-result.normal .result-number {
  color: #22c55e;
}
.sb-result.moderate .result-number,
.ess-result.moderate .result-number {
  color: #f97316;
}
.sb-result.severe .result-number,
.ess-result.severe .result-number {
  color: #ef4444;
}
.ess-result.mild .result-number {
  color: #f59e0b;
}
.ess-result.critical .result-number {
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
.result-top {
  display: flex;
  align-items: baseline;
  gap: 0.5rem;
}
.result-level {
  font-size: 1.05rem;
  font-weight: 700;
  color: var(--vp-c-text-1);
}
.result-ahi {
  font-size: 0.78rem;
  font-weight: 600;
  color: var(--vp-c-brand-1);
}
.result-advice {
  font-size: 0.83rem;
  color: var(--vp-c-text-2);
  line-height: 1.5;
}
.result-sub-scores {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
  margin-top: 2px;
}
.sub-pill-sm {
  font-size: 0.72rem;
  font-weight: 700;
  padding: 2px 10px;
  border-radius: 999px;
}
.stop-sm {
  background: rgba(99, 102, 241, 0.1);
  color: #6366f1;
  border: 1px solid rgba(99, 102, 241, 0.3);
}
.bang-sm {
  background: rgba(249, 115, 22, 0.1);
  color: #f97316;
  border: 1px solid rgba(249, 115, 22, 0.3);
}
.high-sm {
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
  border: 1px solid rgba(239, 68, 68, 0.3);
}

/* ── High risk note ────────────────────────────────────────────── */
.high-risk-note {
  display: flex;
  align-items: flex-start;
  gap: 0.6rem;
  padding: 0.75rem 1rem;
  border-radius: 10px;
  background: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-divider);
  font-size: 0.8rem;
  color: var(--vp-c-text-2);
  margin-bottom: 1rem;
  line-height: 1.6;
  transition: all 0.3s;
}
.high-risk-note.high-active {
  border-color: rgba(239, 68, 68, 0.4);
  background: rgba(239, 68, 68, 0.05);
}
.note-icon {
  flex-shrink: 0;
  font-size: 1rem;
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
.stop-section {
  color: #6366f1;
  background: rgba(99, 102, 241, 0.06);
}
.bang-section {
  color: #f97316;
  background: rgba(249, 115, 22, 0.06);
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
.total-row {
  background: linear-gradient(135deg, var(--vp-c-bg-mute), var(--vp-c-bg-soft));
  font-weight: 800;
}

.detail-letter {
  font-size: 0.72rem;
  font-weight: 900;
  flex-shrink: 0;
  width: 20px;
}
.stop-letter-sm {
  color: #6366f1;
}
.bang-letter-sm {
  color: #f97316;
}
.brand-sm {
  color: var(--vp-c-brand-1);
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
  color: var(--vp-c-text-3);
}
.detail-score.positive {
  color: var(--vp-c-brand-1);
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
  width: 52px;
  text-align: left;
}

/* ── Actions ───────────────────────────────────────────────────── */
.sb-actions,
.ess-actions {
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

/* ── Responsive ────────────────────────────────────────────────── */
@media (max-width: 640px) {
  .sb-header,
  .ess-header {
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
  .risk-strip {
    grid-template-columns: repeat(2, 1fr);
  }
  .sb-result,
  .ess-result {
    flex-direction: column;
    gap: 0.75rem;
  }
  .option-row {
    grid-template-columns: repeat(2, 1fr);
  }
  .detail-desc {
    width: 48px;
  }
}
</style>
