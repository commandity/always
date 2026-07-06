<script setup lang="ts">
import { ref, computed } from "vue";

// ── RFS Items ─────────────────────────────────────────────────────
const rfsItems = [
  {
    key: "subglottic",
    name: "聲門下水腫",
    sub: "Subglottic Edema",
    hint: "假聲帶下方假性聲門下突出（偽裂）",
    scores: [
      { value: 0, desc: "無" },
      { value: 2, desc: "有" },
    ],
  },
  {
    key: "ventricular",
    name: "喉室消失",
    sub: "Ventricular Obliteration",
    hint: "喉室（laryngeal ventricle）因水腫而消失",
    scores: [
      { value: 0, desc: "無" },
      { value: 2, desc: "部分消失" },
      { value: 4, desc: "完全消失" },
    ],
  },
  {
    key: "erythema",
    name: "紅斑／充血",
    sub: "Erythema / Hyperemia",
    hint: "杓狀軟骨或整個喉部的紅斑充血",
    scores: [
      { value: 0, desc: "無" },
      { value: 2, desc: "僅杓狀軟骨" },
      { value: 4, desc: "瀰漫性紅斑" },
    ],
  },
  {
    key: "vocal_fold",
    name: "聲帶水腫",
    sub: "Vocal Fold Edema",
    hint: "聲帶本身的水腫程度",
    scores: [
      { value: 0, desc: "無" },
      { value: 1, desc: "輕度" },
      { value: 2, desc: "中度" },
      { value: 3, desc: "重度" },
      { value: 4, desc: "息肉樣變性" },
    ],
  },
  {
    key: "diffuse",
    name: "瀰漫性喉部水腫",
    sub: "Diffuse Laryngeal Edema",
    hint: "整個喉部黏膜廣泛水腫",
    scores: [
      { value: 0, desc: "無" },
      { value: 1, desc: "輕度" },
      { value: 2, desc: "中度" },
      { value: 3, desc: "重度" },
      { value: 4, desc: "阻塞性水腫" },
    ],
  },
  {
    key: "posterior",
    name: "後壁增生肥厚",
    sub: "Posterior Commissure Hypertrophy",
    hint: "後聯合黏膜增生肥厚的程度",
    scores: [
      { value: 0, desc: "無" },
      { value: 1, desc: "輕度" },
      { value: 2, desc: "中度" },
      { value: 3, desc: "重度" },
      { value: 4, desc: "阻塞性肥厚" },
    ],
  },
  {
    key: "granuloma",
    name: "肉芽腫或肉芽組織",
    sub: "Granuloma / Granulation Tissue",
    hint: "杓狀軟骨處或後聯合的肉芽腫",
    scores: [
      { value: 0, desc: "無" },
      { value: 2, desc: "有" },
    ],
  },
  {
    key: "mucus",
    name: "喉部黏液附著",
    sub: "Thick Endolaryngeal Mucus",
    hint: "喉部黏稠黏液附著或聲帶間黏液絲",
    scores: [
      { value: 0, desc: "無" },
      { value: 2, desc: "有" },
    ],
  },
];

// ── RSI Questions ─────────────────────────────────────────────────
const rsiQuestions = [
  {
    key: "q1",
    name: "聲音嘶啞或其他聲音問題",
    sub: "Hoarseness or a problem with your voice",
    hint: "包含聲音沙啞、音質改變、發聲費力",
  },
  {
    key: "q2",
    name: "清嗓動作",
    sub: "Clearing your throat",
    hint: "需要清嗓子，感覺喉嚨有痰或異物需要清除",
  },
  {
    key: "q3",
    name: "過多的痰或鼻涕倒流",
    sub: "Excess throat mucus or postnasal drip",
    hint: "感覺喉嚨有黏液積聚或鼻涕流入喉嚨",
  },
  {
    key: "q4",
    name: "吞嚥食物、液體或藥丸時有困難",
    sub: "Difficulty swallowing food, liquids, or pills",
    hint: "吞嚥時有阻礙感、需費力或有卡住感",
  },
  {
    key: "q5",
    name: "進食後或躺下後有咳嗽",
    sub: "Coughing after eating or after lying down",
    hint: "飯後或平躺後出現咳嗽反射",
  },
  {
    key: "q6",
    name: "呼吸困難或偶發性窒息感",
    sub: "Breathing difficulties or choking episodes",
    hint: "喉嚨緊縮感、喘不過氣或偶爾有哽住的感覺",
  },
  {
    key: "q7",
    name: "令人煩惱的咳嗽",
    sub: "Troublesome or annoying cough",
    hint: "慢性咳嗽、持續性咳嗽影響日常生活",
  },
  {
    key: "q8",
    name: "喉嚨有異物感或有東西卡住的感覺",
    sub: "Sensations of something sticking in throat or a lump in throat",
    hint: "梅核氣（Globus）感，感覺喉嚨有腫塊或異物",
  },
  {
    key: "q9",
    name: "心灼熱、胸痛、消化不良或胃酸逆流",
    sub: "Heartburn, chest pain, indigestion, or stomach acid coming up",
    hint: "胃酸逆流症狀，包括燒心感、胸口灼熱或酸水逆流",
  },
];

const rsiScoreOptions = [
  { value: 0, label: "0", desc: "沒有問題" },
  { value: 1, label: "1", desc: "極輕微" },
  { value: 2, label: "2", desc: "輕度" },
  { value: 3, label: "3", desc: "中度" },
  { value: 4, label: "4", desc: "重度" },
  { value: 5, label: "5", desc: "最嚴重" },
];

// ── Tab state ─────────────────────────────────────────────────────
const activeTab = ref<"rfs" | "rsi">("rfs");

// ── RFS State ─────────────────────────────────────────────────────
const rfsSelections = ref<Record<string, number>>(
  Object.fromEntries(rfsItems.map((item) => [item.key, -1])),
);
const rfsShowResults = ref(false);
const rfsCopied = ref(false);

const rfsAnsweredCount = computed(
  () => rfsItems.filter((item) => rfsSelections.value[item.key] >= 0).length,
);
const rfsIsComplete = computed(() => rfsAnsweredCount.value === 8);
const rfsTotalScore = computed(() =>
  rfsItems.reduce((sum, item) => {
    const v = rfsSelections.value[item.key];
    return sum + (v >= 0 ? v : 0);
  }, 0),
);

const rfsSeverity = computed(() => {
  const s = rfsTotalScore.value;
  if (!rfsIsComplete.value)
    return {
      level: "填寫中",
      color: "filling",
      advice: `已完成 ${rfsAnsweredCount.value}/8 項`,
    };
  if (s <= 7)
    return {
      level: "正常範圍",
      color: "normal",
      advice: "RFS ≤ 7，喉部檢查所見在正常範圍內",
    };
  if (s <= 11)
    return {
      level: "輕度 LPR",
      color: "mild",
      advice: "RFS 8–11，建議配合 RSI 問卷及試驗性 PPI 治療",
    };
  if (s <= 17)
    return {
      level: "中度 LPR",
      color: "moderate",
      advice: "RFS 12–17，建議積極 PPI 治療，考慮 24 小時 pH 監測",
    };
  return {
    level: "重度 LPR",
    color: "severe",
    advice: "RFS ≥ 18，重度喉咽逆流，建議積極治療及密切追蹤",
  };
});

function rfsGenerateMarkdown() {
  const lines = rfsItems
    .map((item, i) => {
      const v = rfsSelections.value[item.key];
      const opt = item.scores.find((o) => o.value === v);
      return `- **F${i + 1} ${item.name}**（${item.sub}）：${v >= 0 ? `${v} — ${opt?.desc}` : "未填"}`;
    })
    .join("\n");
  return `# RFS 逆流表現評分評估結果\n\n## 各項評分\n\n${lines}\n\n---\n\n## 計算結果\n\n- **RFS 總分**：${rfsTotalScore.value} / 26\n- **嚴重程度**：${rfsSeverity.value.level}\n- **臨床建議**：${rfsSeverity.value.advice}\n\n> 正常切截值：RFS ≤ 7（Belafsky 2001）`;
}

async function rfsCopyMarkdown() {
  await navigator.clipboard.writeText(rfsGenerateMarkdown());
  rfsCopied.value = true;
  setTimeout(() => (rfsCopied.value = false), 2000);
}

function rfsReset() {
  rfsItems.forEach((item) => {
    rfsSelections.value[item.key] = -1;
  });
  rfsShowResults.value = false;
}

// ── RSI State ─────────────────────────────────────────────────────
const rsiSelections = ref<Record<string, number>>(
  Object.fromEntries(rsiQuestions.map((q) => [q.key, -1])),
);
const rsiShowResults = ref(false);
const rsiCopied = ref(false);

const rsiAnsweredCount = computed(
  () => rsiQuestions.filter((q) => rsiSelections.value[q.key] >= 0).length,
);
const rsiIsComplete = computed(() => rsiAnsweredCount.value === 9);
const rsiTotalScore = computed(() =>
  rsiQuestions.reduce((sum, q) => {
    const v = rsiSelections.value[q.key];
    return sum + (v >= 0 ? v : 0);
  }, 0),
);

const rsiSeverity = computed(() => {
  const s = rsiTotalScore.value;
  if (!rsiIsComplete.value)
    return {
      level: "填寫中",
      color: "filling",
      advice: `已完成 ${rsiAnsweredCount.value}/9 題`,
    };
  if (s <= 13)
    return {
      level: "正常範圍",
      color: "normal",
      advice: "RSI ≤ 13，喉咽逆流症狀在正常範圍內",
    };
  if (s <= 20)
    return {
      level: "輕至中度 LPR",
      color: "mild",
      advice: "RSI 14–20，建議就醫評估，考慮試驗性治療",
    };
  if (s <= 30)
    return {
      level: "中度 LPR",
      color: "moderate",
      advice: "建議喉鏡評估（RFS），考慮質子幫浦抑制劑（PPI）治療",
    };
  return {
    level: "重度 LPR",
    color: "severe",
    advice: "重度 LPR，建議積極治療並追蹤，考慮 24 小時 pH 監測",
  };
});

function rsiGenerateMarkdown() {
  const lines = rsiQuestions
    .map((q) => {
      const v = rsiSelections.value[q.key];
      const opt = rsiScoreOptions.find((o) => o.value === v);
      return `- **Q${q.key.slice(1)} ${q.name}**（${q.sub}）：${v >= 0 ? `${v} — ${opt?.desc}` : "未填"}`;
    })
    .join("\n");
  return `# RSI 逆流症狀指數評估結果\n\n## 各題評分\n\n${lines}\n\n---\n\n## 計算結果\n\n- **RSI 總分**：${rsiTotalScore.value} / 45\n- **嚴重程度**：${rsiSeverity.value.level}\n- **臨床建議**：${rsiSeverity.value.advice}\n\n> 正常切截值：RSI ≤ 13`;
}

async function rsiCopyMarkdown() {
  await navigator.clipboard.writeText(rsiGenerateMarkdown());
  rsiCopied.value = true;
  setTimeout(() => (rsiCopied.value = false), 2000);
}

function rsiReset() {
  rsiQuestions.forEach((q) => {
    rsiSelections.value[q.key] = -1;
  });
  rsiShowResults.value = false;
}
</script>

<template>
  <div class="lpr">
    <!-- Tab bar -->
    <div class="tab-bar">
      <button
        class="tab-btn"
        :class="{ active: activeTab === 'rfs' }"
        @click="activeTab = 'rfs'"
      >
        <span class="tab-label">RFS 內視鏡評分</span>
        <span class="tab-sub">Reflux Finding Score</span>
      </button>
      <button
        class="tab-btn"
        :class="{ active: activeTab === 'rsi' }"
        @click="activeTab = 'rsi'"
      >
        <span class="tab-label">RSI 症狀指數</span>
        <span class="tab-sub">Reflux Symptom Index</span>
      </button>
    </div>

    <!-- ═══════════════════ RFS Panel ═══════════════════ -->
    <div v-show="activeTab === 'rfs'" class="rfs">
      <div class="rfs-header">
        <div class="header-title">
          <h2 class="title">RFS 逆流表現評分</h2>
          <p class="subtitle">
            Reflux Finding Score · 喉咽逆流（LPR）喉鏡所見評估
          </p>
        </div>
        <div class="score-badge" :class="rfsSeverity.color">
          <span class="score-number">{{
            rfsIsComplete ? rfsTotalScore : "—"
          }}</span>
          <span class="score-label">{{
            rfsIsComplete ? rfsSeverity.level : `${rfsAnsweredCount}/8`
          }}</span>
        </div>
      </div>

      <div class="severity-bar-wrap">
        <div class="severity-bar">
          <div
            class="severity-fill"
            :class="rfsSeverity.color"
            :style="{ width: Math.min((rfsTotalScore / 26) * 100, 100) + '%' }"
          />
        </div>
        <div class="severity-ticks">
          <span class="tk-normal">0</span>
          <span class="tick-threshold">7</span>
          <span class="tk-mild">11</span>
          <span class="tk-moderate">17</span>
          <span class="tk-severe">26</span>
        </div>
      </div>

      <div class="intro-bar">
        <span class="intro-dot">◉</span>
        <span
          >由耳鼻喉科醫師透過喉鏡檢查評分。共 8 項喉部所見，總分 0–26
          分。<strong>RFS &gt; 7</strong>
          為異常，提示可能有喉咽逆流（LPR）。建議與 RSI 問卷合併判讀。</span
        >
      </div>

      <div class="rfs-group">
        <div class="group-header">
          <div class="group-label-block">
            <span class="group-label">喉鏡所見評估</span>
            <span class="group-sub">Laryngoscopic Findings · 8 項</span>
          </div>
          <div class="group-score-pill">{{ rfsAnsweredCount }}/8 項</div>
        </div>

        <div class="item-list">
          <div
            v-for="(item, idx) in rfsItems"
            :key="item.key"
            class="rfs-item"
            :class="{
              answered: rfsSelections[item.key] >= 0,
              high: rfsSelections[item.key] >= 3,
            }"
          >
            <div class="item-header">
              <div class="item-meta-row">
                <span class="item-qnum">F{{ idx + 1 }}</span>
              </div>
              <div class="item-name-block">
                <span class="item-name">{{ item.name }}</span>
                <span class="item-sub">{{ item.sub }}</span>
                <span class="item-hint">{{ item.hint }}</span>
              </div>
              <span
                class="item-score"
                :class="{
                  zero: rfsSelections[item.key] === 0,
                  unanswered: rfsSelections[item.key] < 0,
                  high: rfsSelections[item.key] >= 3,
                }"
              >
                {{
                  rfsSelections[item.key] >= 0 ? rfsSelections[item.key] : "—"
                }}
              </span>
            </div>

            <div class="sec-options">
              <label
                v-for="opt in item.scores"
                :key="opt.value"
                class="sec-opt"
                :class="{ 'opt-selected': rfsSelections[item.key] === opt.value }"
              >
                <input
                  type="radio"
                  :name="'rfs-' + item.key"
                  :value="opt.value"
                  v-model="rfsSelections[item.key]"
                />
                <div
                  class="opt-radio"
                  :class="{ selected: rfsSelections[item.key] === opt.value }"
                >
                  <div
                    class="opt-dot"
                    v-if="rfsSelections[item.key] === opt.value"
                  />
                </div>
                <div class="opt-content">
                  <span class="opt-score-badge">{{ opt.value }}</span>
                  <span class="opt-text">{{ opt.desc }}</span>
                </div>
              </label>
            </div>
          </div>
        </div>
      </div>

      <div class="rfs-result" :class="rfsSeverity.color">
        <div class="result-left">
          <span class="result-number">{{
            rfsIsComplete ? rfsTotalScore : "—"
          }}</span>
          <span class="result-max">/ 26</span>
        </div>
        <div class="result-right">
          <span class="result-level">{{ rfsSeverity.level }}</span>
          <span class="result-advice">{{ rfsSeverity.advice }}</span>
          <span class="result-threshold" v-if="rfsIsComplete">
            {{
              rfsTotalScore > 7
                ? "⚠ RFS > 7，建議就醫評估 LPR"
                : "✓ RFS ≤ 7，在正常範圍內"
            }}
          </span>
        </div>
      </div>

      <div v-if="rfsShowResults" class="results-detail">
        <div class="results-header">評估明細</div>
        <div v-for="(item, idx) in rfsItems" :key="item.key" class="detail-row">
          <span class="detail-qnum">F{{ idx + 1 }}</span>
          <span class="detail-domain">{{ item.name }}</span>
          <span
            class="detail-score"
            :class="{
              zero: rfsSelections[item.key] === 0,
              high: rfsSelections[item.key] >= 3,
              brand: rfsSelections[item.key] > 0 && rfsSelections[item.key] < 3,
            }"
          >
            {{ rfsSelections[item.key] >= 0 ? rfsSelections[item.key] : "—" }}
          </span>
          <span class="detail-desc">
            {{
              rfsSelections[item.key] >= 0
                ? item.scores.find((o) => o.value === rfsSelections[item.key])
                    ?.desc
                : "未填"
            }}
          </span>
        </div>
        <div class="detail-row total-row">
          <span class="detail-qnum"></span>
          <span class="detail-domain">RFS 總分</span>
          <span class="detail-score brand">{{ rfsTotalScore }} / 26</span>
          <span class="detail-desc">{{ rfsSeverity.level }}</span>
        </div>
      </div>

      <div class="rfs-actions">
        <button class="btn-view" @click="rfsShowResults = !rfsShowResults">
          {{ rfsShowResults ? "收起明細" : "查看評估結果" }}
        </button>
        <button class="btn-copy" @click="rfsCopyMarkdown">
          {{ rfsCopied ? "已複製 ✓" : "複製 Markdown 結果" }}
        </button>
        <button class="btn-reset" @click="rfsReset">重置</button>
      </div>
      <p v-if="!rfsIsComplete" class="progress-hint">
        已完成 {{ rfsAnsweredCount }}/8 項，尚餘 {{ 8 - rfsAnsweredCount }} 項
      </p>
    </div>

    <!-- ═══════════════════ RSI Panel ═══════════════════ -->
    <div v-show="activeTab === 'rsi'" class="rsi">
      <div class="rsi-header">
        <div class="header-title">
          <h2 class="title">RSI 逆流症狀指數</h2>
          <p class="subtitle">Reflux Symptom Index · 喉咽逆流（LPR）症狀評估</p>
        </div>
        <div class="score-badge" :class="rsiSeverity.color">
          <span class="score-number">{{
            rsiIsComplete ? rsiTotalScore : "—"
          }}</span>
          <span class="score-label">{{
            rsiIsComplete ? rsiSeverity.level : `${rsiAnsweredCount}/9`
          }}</span>
        </div>
      </div>

      <div class="severity-bar-wrap">
        <div class="severity-bar">
          <div
            class="severity-fill"
            :class="rsiSeverity.color"
            :style="{ width: Math.min((rsiTotalScore / 45) * 100, 100) + '%' }"
          />
        </div>
        <div class="severity-ticks">
          <span class="tk-normal">0</span>
          <span class="tick-threshold">13</span>
          <span class="tk-mild">20</span>
          <span class="tk-moderate">30</span>
          <span class="tk-severe">45</span>
        </div>
      </div>

      <div class="intro-bar">
        <span class="intro-dot">◉</span>
        <span
          >請依據症狀對您的困擾程度評分。每題 0（沒有問題）至 5（最嚴重），共 9
          題，總分 0–45 分。<strong>RSI &gt; 13</strong>
          分為異常，提示可能有喉咽逆流（LPR）。</span
        >
      </div>

      <div class="rsi-group">
        <div class="group-header">
          <div class="group-label-block">
            <span class="group-label">逆流相關症狀評估</span>
            <span class="group-sub"
              >Laryngopharyngeal Reflux Symptoms · 9 題</span
            >
          </div>
          <div class="group-score-pill">{{ rsiAnsweredCount }}/9 題</div>
        </div>

        <div class="item-list">
          <div
            v-for="q in rsiQuestions"
            :key="q.key"
            class="rsi-item"
            :class="{
              answered: rsiSelections[q.key] >= 0,
              high: rsiSelections[q.key] >= 4,
            }"
          >
            <div class="item-header">
              <div class="item-meta-row">
                <span class="item-qnum">Q{{ q.key.slice(1) }}</span>
              </div>
              <div class="item-name-block">
                <span class="item-name">{{ q.name }}</span>
                <span class="item-sub">{{ q.sub }}</span>
                <span class="item-hint">{{ q.hint }}</span>
              </div>
              <span
                class="item-score"
                :class="{
                  zero: rsiSelections[q.key] === 0,
                  unanswered: rsiSelections[q.key] < 0,
                  high: rsiSelections[q.key] >= 4,
                }"
              >
                {{ rsiSelections[q.key] >= 0 ? rsiSelections[q.key] : "—" }}
              </span>
            </div>

            <div class="sec-options">
                <label
                  v-for="opt in rsiScoreOptions"
                  :key="opt.value"
                  class="sec-opt"
                  :class="{ 'opt-selected': rsiSelections[q.key] === opt.value }"
                >
                  <input
                    type="radio"
                    :name="'rsi-' + q.key"
                    :value="opt.value"
                    v-model="rsiSelections[q.key]"
                  />
                  <div
                    class="opt-radio"
                    :class="{ selected: rsiSelections[q.key] === opt.value }"
                  >
                    <div class="opt-dot" v-if="rsiSelections[q.key] === opt.value" />
                  </div>
                  <div class="opt-content">
                    <span class="opt-score-badge">{{ opt.label }}</span>
                    <span class="opt-text">{{ opt.desc }}</span>
                  </div>
                </label>
              </div>
          </div>
        </div>
      </div>

      <div class="rsi-result" :class="rsiSeverity.color">
        <div class="result-left">
          <span class="result-number">{{
            rsiIsComplete ? rsiTotalScore : "—"
          }}</span>
          <span class="result-max">/ 45</span>
        </div>
        <div class="result-right">
          <span class="result-level">{{ rsiSeverity.level }}</span>
          <span class="result-advice">{{ rsiSeverity.advice }}</span>
          <span class="result-threshold" v-if="rsiIsComplete">
            {{
              rsiTotalScore > 13
                ? "⚠ RSI > 13，建議就醫評估 LPR"
                : "✓ RSI ≤ 13，在正常範圍內"
            }}
          </span>
        </div>
      </div>

      <div v-if="rsiShowResults" class="results-detail">
        <div class="results-header">評估明細</div>
        <div v-for="q in rsiQuestions" :key="q.key" class="detail-row">
          <span class="detail-qnum">Q{{ q.key.slice(1) }}</span>
          <span class="detail-domain">{{ q.name }}</span>
          <span
            class="detail-score"
            :class="{
              zero: rsiSelections[q.key] === 0,
              high: rsiSelections[q.key] >= 4,
              brand: rsiSelections[q.key] > 0 && rsiSelections[q.key] < 4,
            }"
          >
            {{ rsiSelections[q.key] >= 0 ? rsiSelections[q.key] : "—" }}
          </span>
          <span class="detail-desc">
            {{
              rsiSelections[q.key] >= 0
                ? rsiScoreOptions.find((o) => o.value === rsiSelections[q.key])
                    ?.desc
                : "未填"
            }}
          </span>
        </div>
        <div class="detail-row total-row">
          <span class="detail-qnum"></span>
          <span class="detail-domain">RSI 總分</span>
          <span class="detail-score brand">{{ rsiTotalScore }} / 45</span>
          <span class="detail-desc">{{ rsiSeverity.level }}</span>
        </div>
      </div>

      <div class="rsi-actions">
        <button class="btn-view" @click="rsiShowResults = !rsiShowResults">
          {{ rsiShowResults ? "收起明細" : "查看評估結果" }}
        </button>
        <button class="btn-copy" @click="rsiCopyMarkdown">
          {{ rsiCopied ? "已複製 ✓" : "複製 Markdown 結果" }}
        </button>
        <button class="btn-reset" @click="rsiReset">重置</button>
      </div>
      <p v-if="!rsiIsComplete" class="progress-hint">
        已完成 {{ rsiAnsweredCount }}/9 題，尚餘 {{ 9 - rsiAnsweredCount }} 題
      </p>
    </div>
  </div>
</template>

<style scoped>
/* ==================================================================
   LPR Layout & Tab Bar
   ================================================================== */
.lpr {
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
  opacity: 0.7;
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

/* ==================================================================
   Shared — RFS & RSI panels
   ================================================================== */
.rfs,
.rsi {
  max-width: 780px;
  margin: 0 auto;
  padding: 2rem 0 3rem;
  font-size: 0.9rem;
}

/* Header */
.rfs-header,
.rsi-header {
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

/* Severity bar */
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

.severity-ticks {
  display: flex;
  justify-content: space-between;
  font-size: 0.68rem;
  color: var(--vp-c-text-3);
  padding: 0 2px;
}

.tick-threshold {
  color: #f59e0b;
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
  background: #f59e0b;
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

/* Intro */
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

/* Group */
.rfs-group,
.rsi-group {
  margin-bottom: 1.25rem;
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

/* RFS group — amber accent */
.rfs-group .group-header {
  border-left: 4px solid #f59e0b;
  box-shadow: 0 1px 3px rgba(245, 158, 11, 0.06);
}

/* RSI group — teal accent */
.rsi-group .group-header {
  border-left: 4px solid #14b8a6;
  box-shadow: 0 1px 3px rgba(20, 184, 166, 0.06);
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
.rfs-group .group-score-pill {
  border: 1px solid rgba(245, 158, 11, 0.25);
  color: #f59e0b;
  background: rgba(245, 158, 11, 0.06);
}
.rsi-group .group-score-pill {
  border: 1px solid rgba(20, 184, 166, 0.25);
  color: #14b8a6;
  background: rgba(20, 184, 166, 0.06);
}

/* ── Item list ──────────────────────────────────────────────────── */
.item-list {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
}

/* Items (common) */
.rfs-item,
.rsi-item {
  border: 1px solid var(--vp-c-divider);
  border-radius: 10px;
  background: var(--vp-c-bg-soft);
  overflow: hidden;
  transition: all 0.25s;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.03);
}
.rfs-item:hover,
.rsi-item:hover {
  box-shadow: 0 3px 12px rgba(0, 0, 0, 0.06);
  border-color: var(--vp-c-divider);
}
.rfs-item.answered,
.rsi-item.answered {
  border-color: rgba(34, 197, 94, 0.2);
  background: linear-gradient(
    135deg,
    var(--vp-c-bg-soft),
    rgba(34, 197, 94, 0.03)
  );
}
.rfs-item.high,
.rsi-item.high {
  border-color: rgba(249, 115, 22, 0.25);
  background: linear-gradient(
    135deg,
    var(--vp-c-bg-soft),
    rgba(249, 115, 22, 0.04)
  );
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

.item-meta-row {
  display: flex;
  align-items: center;
  flex-shrink: 0;
}

/* item-qnum — different accent per calculator */
.item-qnum {
  font-size: 0.7rem;
  font-weight: 800;
  color: #fff;
  padding: 2px 9px;
  border-radius: 999px;
  letter-spacing: 0.04em;
}
.rfs-item .item-qnum {
  background: linear-gradient(135deg, var(--vp-c-brand-1), #6366f1);
  box-shadow: 0 1px 3px rgba(99, 102, 241, 0.2);
}
.rfs-item.high .item-qnum {
  background: linear-gradient(135deg, #f97316, #ef4444);
  box-shadow: 0 1px 3px rgba(249, 115, 22, 0.3);
}
.rsi-item .item-qnum {
  background: linear-gradient(135deg, #14b8a6, #0d9488);
  box-shadow: 0 1px 3px rgba(20, 184, 166, 0.2);
}
.rsi-item.high .item-qnum {
  background: linear-gradient(135deg, #f97316, #ef4444);
  box-shadow: 0 1px 3px rgba(249, 115, 22, 0.3);
}

.item-name-block {
  display: flex;
  flex-direction: column;
  gap: 2px;
  flex: 1;
}

.item-name {
  font-size: 0.95rem;
  font-weight: 700;
  color: var(--vp-c-text-1);
  line-height: 1.4;
}

.item-sub {
  font-size: 0.82rem;
  color: var(--vp-c-text-2);
}

.item-hint {
  font-size: 0.82rem;
  color: var(--vp-c-text-1);
  font-style: italic;
  opacity: 0.9;
}

.item-score {
  font-size: 1.25rem;
  font-weight: 900;
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
.item-score.unanswered {
  color: var(--vp-c-text-3);
  border-color: var(--vp-c-divider);
  background: transparent;
}

/* ── Option row ─────────────────────────────────────────────────── */
.option-row {
  display: grid;
  gap: 2px;
  padding: 3px;
  background: var(--vp-c-bg-mute);
}

.rsi-option-row {
  grid-template-columns: repeat(6, 1fr);
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
.rsi .opt-pill {
  padding: 0.55rem 0.1rem;
  gap: 3px;
}
.opt-pill:hover {
  border-color: var(--vp-c-divider);
  background: var(--vp-c-bg-soft);
}
.opt-pill input[type="radio"] {
  display: none;
}

/* ── Opt-pill score colors — RFS ───────────────────────────────── */
.rfs .opt-pill.s0 {
  border-color: rgba(34, 197, 94, 0.15);
}
.rfs .opt-pill.s0:hover:not(.active),
.rfs .opt-pill.s0:focus-within {
  border-color: rgba(34, 197, 94, 0.35);
  background: rgba(34, 197, 94, 0.04);
}
.rfs .opt-pill.s0.active {
  border-color: #22c55e;
  background: color-mix(in srgb, rgb(34, 197, 94) 18%, var(--vp-c-bg));
  box-shadow: 0 0 0 1px rgba(34, 197, 94, 0.08);
}

.rfs .opt-pill.s1 {
  border-color: rgba(234, 179, 8, 0.15);
}
.rfs .opt-pill.s1:hover:not(.active),
.rfs .opt-pill.s1:focus-within {
  border-color: rgba(234, 179, 8, 0.35);
  background: rgba(234, 179, 8, 0.04);
}
.rfs .opt-pill.s1.active {
  border-color: #eab308;
  background: color-mix(in srgb, rgb(234, 179, 8) 18%, var(--vp-c-bg));
  box-shadow: 0 0 0 1px rgba(234, 179, 8, 0.08);
}

.rfs .opt-pill.s2 {
  border-color: rgba(245, 158, 11, 0.15);
}
.rfs .opt-pill.s2:hover:not(.active),
.rfs .opt-pill.s2:focus-within {
  border-color: rgba(245, 158, 11, 0.35);
  background: rgba(245, 158, 11, 0.04);
}
.rfs .opt-pill.s2.active {
  border-color: #f59e0b;
  background: color-mix(in srgb, rgb(245, 158, 11) 18%, var(--vp-c-bg));
  box-shadow: 0 0 0 1px rgba(245, 158, 11, 0.08);
}

.rfs .opt-pill.s3 {
  border-color: rgba(249, 115, 22, 0.15);
}
.rfs .opt-pill.s3:hover:not(.active),
.rfs .opt-pill.s3:focus-within {
  border-color: rgba(249, 115, 22, 0.35);
  background: rgba(249, 115, 22, 0.04);
}
.rfs .opt-pill.s3.active {
  border-color: #f97316;
  background: color-mix(in srgb, rgb(249, 115, 22) 18%, var(--vp-c-bg));
  box-shadow: 0 0 0 1px rgba(249, 115, 22, 0.08);
}

.rfs .opt-pill.s4 {
  border-color: rgba(239, 68, 68, 0.15);
}
.rfs .opt-pill.s4:hover:not(.active),
.rfs .opt-pill.s4:focus-within {
  border-color: rgba(239, 68, 68, 0.35);
  background: rgba(239, 68, 68, 0.04);
}
.rfs .opt-pill.s4.active {
  border-color: #ef4444;
  background: color-mix(in srgb, rgb(239, 68, 68) 18%, var(--vp-c-bg));
  box-shadow: 0 0 0 1px rgba(239, 68, 68, 0.08);
}

/* ── Opt-pill score colors — RSI ───────────────────────────────── */
.rsi .opt-pill.s0 {
  border-color: rgba(34, 197, 94, 0.15);
}
.rsi .opt-pill.s0:hover:not(.active) {
  border-color: rgba(34, 197, 94, 0.35);
  background: rgba(34, 197, 94, 0.04);
}
.rsi .opt-pill.s0.active {
  border-color: #22c55e;
  background: color-mix(in srgb, rgb(34, 197, 94) 18%, var(--vp-c-bg));
  box-shadow: 0 0 0 1px rgba(34, 197, 94, 0.08);
}

.rsi .opt-pill.s1 {
  border-color: rgba(132, 204, 22, 0.15);
}
.rsi .opt-pill.s1:hover:not(.active) {
  border-color: rgba(132, 204, 22, 0.35);
  background: rgba(132, 204, 22, 0.04);
}
.rsi .opt-pill.s1.active {
  border-color: #84cc16;
  background: color-mix(in srgb, rgb(132, 204, 22) 18%, var(--vp-c-bg));
  box-shadow: 0 0 0 1px rgba(132, 204, 22, 0.08);
}

.rsi .opt-pill.s2 {
  border-color: rgba(234, 179, 8, 0.15);
}
.rsi .opt-pill.s2:hover:not(.active) {
  border-color: rgba(234, 179, 8, 0.35);
  background: rgba(234, 179, 8, 0.04);
}
.rsi .opt-pill.s2.active {
  border-color: #eab308;
  background: color-mix(in srgb, rgb(234, 179, 8) 18%, var(--vp-c-bg));
  box-shadow: 0 0 0 1px rgba(234, 179, 8, 0.08);
}

.rsi .opt-pill.s3 {
  border-color: rgba(245, 158, 11, 0.15);
}
.rsi .opt-pill.s3:hover:not(.active) {
  border-color: rgba(245, 158, 11, 0.35);
  background: rgba(245, 158, 11, 0.04);
}
.rsi .opt-pill.s3.active {
  border-color: #f59e0b;
  background: color-mix(in srgb, rgb(245, 158, 11) 18%, var(--vp-c-bg));
  box-shadow: 0 0 0 1px rgba(245, 158, 11, 0.08);
}

.rsi .opt-pill.s4 {
  border-color: rgba(249, 115, 22, 0.15);
}
.rsi .opt-pill.s4:hover:not(.active) {
  border-color: rgba(249, 115, 22, 0.35);
  background: rgba(249, 115, 22, 0.04);
}
.rsi .opt-pill.s4.active {
  border-color: #f97316;
  background: color-mix(in srgb, rgb(249, 115, 22) 18%, var(--vp-c-bg));
  box-shadow: 0 0 0 1px rgba(249, 115, 22, 0.08);
}

.rsi .opt-pill.s5 {
  border-color: rgba(239, 68, 68, 0.15);
}
.rsi .opt-pill.s5:hover:not(.active) {
  border-color: rgba(239, 68, 68, 0.35);
  background: rgba(239, 68, 68, 0.04);
}
.rsi .opt-pill.s5.active {
  border-color: #ef4444;
  background: color-mix(in srgb, rgb(239, 68, 68) 18%, var(--vp-c-bg));
  box-shadow: 0 0 0 1px rgba(239, 68, 68, 0.08);
}

/* ── Opt-num — RFS ──────────────────────────────────────────────── */
.rfs .opt-num {
  font-size: 1.15rem;
  font-weight: 900;
  transition: color 0.2s;
}
.rfs .opt-pill.s0 .opt-num {
  color: rgba(34, 197, 94, 0.85);
}
.rfs .opt-pill.s0.active .opt-num {
  color: #22c55e;
}
.rfs .opt-pill.s1 .opt-num {
  color: rgba(234, 179, 8, 0.85);
}
.rfs .opt-pill.s1.active .opt-num {
  color: #eab308;
}
.rfs .opt-pill.s2 .opt-num {
  color: rgba(245, 158, 11, 0.85);
}
.rfs .opt-pill.s2.active .opt-num {
  color: #f59e0b;
}
.rfs .opt-pill.s3 .opt-num {
  color: rgba(249, 115, 22, 0.85);
}
.rfs .opt-pill.s3.active .opt-num {
  color: #f97316;
}
.rfs .opt-pill.s4 .opt-num {
  color: rgba(239, 68, 68, 0.85);
}
.rfs .opt-pill.s4.active .opt-num {
  color: #ef4444;
}

/* ── Opt-num — RSI ──────────────────────────────────────────────── */
.rsi .opt-num {
  font-size: 1.1rem;
  font-weight: 900;
  transition: color 0.2s;
}
.rsi .opt-pill.s0 .opt-num {
  color: rgba(34, 197, 94, 0.85);
}
.rsi .opt-pill.s0.active .opt-num {
  color: #22c55e;
}
.rsi .opt-pill.s1 .opt-num {
  color: rgba(132, 204, 22, 0.85);
}
.rsi .opt-pill.s1.active .opt-num {
  color: #84cc16;
}
.rsi .opt-pill.s2 .opt-num {
  color: rgba(234, 179, 8, 0.85);
}
.rsi .opt-pill.s2.active .opt-num {
  color: #eab308;
}
.rsi .opt-pill.s3 .opt-num {
  color: rgba(245, 158, 11, 0.85);
}
.rsi .opt-pill.s3.active .opt-num {
  color: #f59e0b;
}
.rsi .opt-pill.s4 .opt-num {
  color: rgba(249, 115, 22, 0.85);
}
.rsi .opt-pill.s4.active .opt-num {
  color: #f97316;
}
.rsi .opt-pill.s5 .opt-num {
  color: rgba(239, 68, 68, 0.85);
}
.rsi .opt-pill.s5.active .opt-num {
  color: #ef4444;
}

/* ── Opt-desc ────────────────────────────────────────────────────── */
.opt-desc {
  font-size: 0.78rem;
  font-weight: 700;
  line-height: 1.3;
  transition: color 0.2s;
}
.rfs .opt-desc {
  line-height: 1.3;
}
.rsi .opt-desc {
  line-height: 1.2;
}

.rfs .opt-pill.s0 .opt-desc,
.rsi .opt-pill.s0 .opt-desc {
  color: rgba(34, 197, 94, 0.7);
}
.rfs .opt-pill.s0.active .opt-desc,
.rsi .opt-pill.s0.active .opt-desc {
  color: rgba(34, 197, 94, 0.9);
}

.rfs .opt-pill.s1 .opt-desc {
  color: rgba(234, 179, 8, 0.7);
}
.rfs .opt-pill.s1.active .opt-desc {
  color: rgba(234, 179, 8, 0.9);
}
.rsi .opt-pill.s1 .opt-desc {
  color: rgba(132, 204, 22, 0.7);
}
.rsi .opt-pill.s1.active .opt-desc {
  color: rgba(132, 204, 22, 0.9);
}

.rfs .opt-pill.s2 .opt-desc,
.rsi .opt-pill.s2 .opt-desc {
  color: rgba(234, 179, 8, 0.7);
}
.rfs .opt-pill.s2.active .opt-desc,
.rsi .opt-pill.s2.active .opt-desc {
  color: rgba(234, 179, 8, 0.9);
}

.rfs .opt-pill.s3 .opt-desc,
.rsi .opt-pill.s3 .opt-desc {
  color: rgba(245, 158, 11, 0.7);
}
.rfs .opt-pill.s3.active .opt-desc,
.rsi .opt-pill.s3.active .opt-desc {
  color: rgba(245, 158, 11, 0.9);
}

.rfs .opt-pill.s4 .opt-desc,
.rsi .opt-pill.s4 .opt-desc {
  color: rgba(249, 115, 22, 0.7);
}
.rfs .opt-pill.s4.active .opt-desc,
.rsi .opt-pill.s4.active .opt-desc {
  color: rgba(249, 115, 22, 0.9);
}

.rsi .opt-pill.s5 .opt-desc {
  color: rgba(239, 68, 68, 0.7);
}
.rsi .opt-pill.s5.active .opt-desc {
  color: rgba(239, 68, 68, 0.9);
}

/* ── Result card ────────────────────────────────────────────────── */
.rfs-result,
.rsi-result {
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

.rfs-result.normal,
.rsi-result.normal {
  border-color: #22c55e;
  box-shadow:
    0 0 0 1px rgba(34, 197, 94, 0.06),
    0 1px 3px rgba(0, 0, 0, 0.04);
}
.rfs-result.mild,
.rsi-result.mild {
  border-color: #f59e0b;
  box-shadow:
    0 0 0 1px rgba(245, 158, 11, 0.06),
    0 1px 3px rgba(0, 0, 0, 0.04);
}
.rfs-result.moderate,
.rsi-result.moderate {
  border-color: #f97316;
  box-shadow:
    0 0 0 1px rgba(249, 115, 22, 0.06),
    0 1px 3px rgba(0, 0, 0, 0.04);
}
.rfs-result.severe,
.rsi-result.severe {
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
  font-size: 4rem;
  font-weight: 900;
  line-height: 1;
  color: var(--vp-c-text-3);
  transition: color 0.3s;
}
.rfs-result.normal .result-number,
.rsi-result.normal .result-number {
  color: #22c55e;
}
.rfs-result.mild .result-number,
.rsi-result.mild .result-number {
  color: #f59e0b;
}
.rfs-result.moderate .result-number,
.rsi-result.moderate .result-number {
  color: #f97316;
}
.rfs-result.severe .result-number,
.rsi-result.severe .result-number {
  color: #ef4444;
}

.result-max {
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--vp-c-text-3);
}

.result-right {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.result-level {
  font-size: 1.1rem;
  font-weight: 800;
  color: var(--vp-c-text-1);
}

.result-advice {
  font-size: 0.9rem;
  font-weight: 500;
  color: var(--vp-c-text-1);
  line-height: 1.5;
}

.result-threshold {
  font-size: 0.85rem;
  font-weight: 700;
}
.rfs-result.normal .result-threshold,
.rsi-result.normal .result-threshold {
  color: #22c55e;
}
.rfs-result.mild .result-threshold,
.rfs-result.moderate .result-threshold,
.rfs-result.severe .result-threshold,
.rsi-result.mild .result-threshold,
.rsi-result.moderate .result-threshold,
.rsi-result.severe .result-threshold {
  color: #f97316;
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
  padding: 0.55rem 0.9rem;
  font-size: 0.7rem;
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
  width: 90px;
  text-align: left;
}

/* ── Actions ────────────────────────────────────────────────────── */
.rfs-actions,
.rsi-actions {
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

/* ── Responsive ─────────────────────────────────────────────────── */
@media (max-width: 640px) {
  .rfs-header,
  .rsi-header {
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
  .rfs-result,
  .rsi-result {
    flex-direction: column;
    gap: 0.75rem;
  }
  .detail-desc {
    width: 48px;
  }
}
</style>
