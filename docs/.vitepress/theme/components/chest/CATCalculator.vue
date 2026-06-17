<script setup lang="ts">
import { ref, computed } from "vue";

// ── COPD Assessment Test (CAT) ────────────────────────────────────
// 8 items, each scored 0–5, total 0–40
// Jones PW et al. Eur Respir J 2009;34:648-54
//
// Score interpretation:
//   0–9   : Low impact
//   10–20 : Medium impact
//   21–30 : High impact
//   31–40 : Very high impact
//
// GOLD 2023+ ABE framework:
//   CAT ≥ 10 → "More symptoms" → Group B or E
//   CAT < 10 → "Less symptoms" → Group A or E
//   Group E determined by exacerbation history (≥2 moderate OR ≥1 hospitalization)

// ── Question refs (each 0–5) ──────────────────────────────────────
const q1 = ref<number | null>(null); // Cough
const q2 = ref<number | null>(null); // Phlegm
const q3 = ref<number | null>(null); // Chest tightness
const q4 = ref<number | null>(null); // Breathlessness (stairs/hill)
const q5 = ref<number | null>(null); // Activities at home
const q6 = ref<number | null>(null); // Confidence leaving home
const q7 = ref<number | null>(null); // Sleep
const q8 = ref<number | null>(null); // Energy

const copied = ref(false);
const showResults = ref(false);

// ── Completeness ──────────────────────────────────────────────────
const answered = computed(
  () => [q1, q2, q3, q4, q5, q6, q7, q8].filter((q) => q.value !== null).length,
);
const isComplete = computed(() => answered.value === 8);

// ── Total score ───────────────────────────────────────────────────
const total = computed((): number | null => {
  if (!isComplete.value) return null;
  return (
    q1.value! +
    q2.value! +
    q3.value! +
    q4.value! +
    q5.value! +
    q6.value! +
    q7.value! +
    q8.value!
  );
});

// ── Score bar width (0–40 → 0–100%) ──────────────────────────────
const barWidth = computed(() => {
  if (total.value === null) return "0%";
  return ((total.value / 40) * 100).toFixed(1) + "%";
});

// ── Result classification ─────────────────────────────────────────
const result = computed(() => {
  if (total.value === null)
    return {
      level: "填寫中",
      color: "filling",
      impact: "?",
      gold: "?",
      advice: "",
      action: "",
    };

  const s = total.value;

  if (s <= 9)
    return {
      level: "低度影響（Low Impact）",
      color: "normal",
      impact: "低",
      gold: "GOLD Group A（症狀少）",
      advice: `CAT 總分 ${s}，屬低度影響。COPD 症狀對日常生活影響輕微。患者可能偶爾咳嗽或活動時略感喘息，但整體功能狀態良好。`,
      action:
        "維持支氣管擴張劑（SABA 按需或 LAMA/LABA 單藥）；積極戒菸；每年流感疫苗、肺炎鏈球菌疫苗；鼓勵規律身體活動。",
    };

  if (s <= 20)
    return {
      level: "中度影響（Medium Impact）",
      color: "moderate",
      impact: "中",
      gold: "GOLD Group B（症狀多）",
      advice: `CAT 總分 ${s}，屬中度影響。COPD 對日常生活有明顯影響，患者多數日子感到喘息、活動受限，晨起常有胸悶及痰液。`,
      action:
        "建議起始 LABA + LAMA 雙效吸入治療；轉介肺復健（Pulmonary Rehabilitation）；評估吸入器技術及依從性；排除共病（心臟衰竭、憂鬱）。",
    };

  if (s <= 30)
    return {
      level: "高度影響（High Impact）",
      color: "critical",
      impact: "高",
      gold: "GOLD Group B/E（症狀多，評估急性惡化史）",
      advice: `CAT 總分 ${s}，屬高度影響。COPD 嚴重影響日常功能，患者常感疲憊、持續喘息，睡眠及活動均受限。`,
      action:
        "優化 LABA + LAMA；若急性惡化 ≥2 次或住院 ≥1 次，考慮加入 ICS（尤其血液嗜酸性粒細胞 ≥300）；積極轉介肺復健；評估長期氧療適應症。",
    };

  return {
    level: "極高度影響（Very High Impact）",
    color: "critical",
    impact: "極高",
    gold: "GOLD Group B/E（症狀最多，高度懷疑 Group E）",
    advice: `CAT 總分 ${s}，屬極高度影響。COPD 對生活品質造成極嚴重影響，患者幾乎每天受症狀困擾，活動能力極度受限。`,
    action:
      "完整藥物優化（LABA + LAMA ± ICS）；緊急轉介呼吸科；評估長期氧療、非侵入性正壓通氣（NIV）適應症；姑息照護討論；確認疫苗及急性惡化應急計畫。",
  };
});

// ── Per-item severity class helper ───────────────────────────────
function itemClass(val: number | null): string {
  if (val === null) return "";
  if (val <= 1) return "item-low";
  if (val <= 3) return "item-mid";
  return "item-high";
}
function valClass(val: number | null): string {
  if (val === null) return "val-nd";
  if (val <= 1) return "val-low";
  if (val <= 3) return "val-mid";
  return "val-high";
}

// ── Markdown export ───────────────────────────────────────────────
const qLabels = [
  "咳嗽",
  "痰液",
  "胸悶",
  "爬坡/爬樓梯喘息",
  "居家活動受限",
  "離家信心",
  "睡眠",
  "精力",
];
function generateMarkdown(): string {
  const lines = [
    "# COPD 評估測試（CAT）",
    "",
    "## 各題得分",
    ...[q1, q2, q3, q4, q5, q6, q7, q8].map(
      (q, i) => `- ${qLabels[i]}：${q.value ?? "—"} / 5`,
    ),
    "",
    `## 總分：${total.value ?? "—"} / 40`,
    "",
    `## 臨床判讀`,
    `**${result.value.level}**`,
    `GOLD 分類：${result.value.gold}`,
    "",
    result.value.advice,
    "",
    `**建議：** ${result.value.action}`,
    "",
    "*Reference: Jones PW et al. Eur Respir J 2009;34:648-54*",
  ];
  return lines.join("\n");
}

async function copyOutput() {
  await navigator.clipboard.writeText(generateMarkdown());
  copied.value = true;
  setTimeout(() => (copied.value = false), 2000);
}

function reset() {
  [q1, q2, q3, q4, q5, q6, q7, q8].forEach((q) => {
    q.value = null;
  });
  showResults.value = false;
}
</script>

<template>
  <div class="cat">
    <!-- ── Header ─────────────────────────────────────────────── -->
    <div class="cat-header">
      <div class="header-title">
        <h2 class="title">CAT 慢性阻塞性肺病評估測試</h2>
        <p class="subtitle">
          COPD Assessment Test · 8 題 · 每題 0–5 分 · 總分 0–40 · Jones et al.
          Eur Respir J 2009 · GOLD 2023+ ABE 分類
        </p>
        <p class="subtitle-2">
          <span class="hint-tag hint-low">0–9 低度</span>
          <span class="hint-tag hint-mid">10–20 中度</span>
          <span class="hint-tag hint-high">21–30 高度</span>
          <span class="hint-tag hint-vhigh">31–40 極高度</span>
        </p>
      </div>
      <div class="score-badge" :class="result.color">
        <span class="badge-top">CAT</span>
        <span class="score-number">{{ total !== null ? total : "—" }}</span>
        <span class="score-unit" v-if="total !== null">/40</span>
        <span class="score-bot">{{
          total !== null ? result.impact : answered + "/8"
        }}</span>
      </div>
    </div>

    <!-- ── Instruction ────────────────────────────────────────── -->
    <div class="prereq-notice">
      <span class="pn-icon">📋</span>
      <span
        >請在每一題的兩端描述之間，選擇最能代表您<strong>目前</strong>狀況的分數（0–5）。0
        分代表無影響，5 分代表最嚴重影響。</span
      >
    </div>

    <!-- ── Questions ─────────────────────────────────────────── -->
    <div class="nihss-group">
      <div class="group-header-bar q-bar">
        <span class="group-icon">🫁</span>
        <span class="group-label-text">CAT 問卷（8 題）</span>
        <span class="group-sub-text">每題 0–5 分，由患者自行填寫</span>
        <span
          class="group-score-tally"
          :class="isComplete ? 'tally-ok' : 'tally-nd'"
        >
          {{ isComplete ? total + "/40" : answered + "/8 題" }}
        </span>
      </div>
      <div class="item-list">
        <!-- Q1: Cough -->
        <div class="cat-item" :class="itemClass(q1)">
          <div class="item-header">
            <span class="item-qnum q-num">Q1</span>
            <div class="item-name-block">
              <span class="item-name">咳嗽（Cough）</span>
              <span class="item-anchor-row">
                <span class="anchor-left">我從不咳嗽</span>
                <span class="anchor-right">我一直在咳嗽</span>
              </span>
            </div>
            <span class="item-val" :class="valClass(q1)">{{
              q1 !== null ? q1 : "—"
            }}</span>
          </div>
          <div class="score-row">
            <button
              v-for="n in [0, 1, 2, 3, 4, 5]"
              :key="n"
              class="score-btn"
              :class="{ 'score-active': q1 === n, 'score-n-high': n >= 4 }"
              @click="q1 = n"
            >
              {{ n }}
            </button>
          </div>
        </div>

        <!-- Q2: Phlegm -->
        <div class="cat-item" :class="itemClass(q2)">
          <div class="item-header">
            <span class="item-qnum q-num">Q2</span>
            <div class="item-name-block">
              <span class="item-name">痰液（Phlegm）</span>
              <span class="item-anchor-row">
                <span class="anchor-left">我的胸腔完全沒有痰</span>
                <span class="anchor-right">我的胸腔裡全是痰</span>
              </span>
            </div>
            <span class="item-val" :class="valClass(q2)">{{
              q2 !== null ? q2 : "—"
            }}</span>
          </div>
          <div class="score-row">
            <button
              v-for="n in [0, 1, 2, 3, 4, 5]"
              :key="n"
              class="score-btn"
              :class="{ 'score-active': q2 === n, 'score-n-high': n >= 4 }"
              @click="q2 = n"
            >
              {{ n }}
            </button>
          </div>
        </div>

        <!-- Q3: Chest tightness -->
        <div class="cat-item" :class="itemClass(q3)">
          <div class="item-header">
            <span class="item-qnum q-num">Q3</span>
            <div class="item-name-block">
              <span class="item-name">胸悶（Chest Tightness）</span>
              <span class="item-anchor-row">
                <span class="anchor-left">我的胸部完全沒有壓迫感</span>
                <span class="anchor-right">我的胸部有非常嚴重的壓迫感</span>
              </span>
            </div>
            <span class="item-val" :class="valClass(q3)">{{
              q3 !== null ? q3 : "—"
            }}</span>
          </div>
          <div class="score-row">
            <button
              v-for="n in [0, 1, 2, 3, 4, 5]"
              :key="n"
              class="score-btn"
              :class="{ 'score-active': q3 === n, 'score-n-high': n >= 4 }"
              @click="q3 = n"
            >
              {{ n }}
            </button>
          </div>
        </div>

        <!-- Q4: Breathlessness -->
        <div class="cat-item" :class="itemClass(q4)">
          <div class="item-header">
            <span class="item-qnum q-num">Q4</span>
            <div class="item-name-block">
              <span class="item-name">喘息（Breathlessness）</span>
              <span class="item-anchor-row">
                <span class="anchor-left">爬坡或爬一層樓梯時，我不會喘</span>
                <span class="anchor-right">爬坡或爬一層樓梯時，我非常喘</span>
              </span>
            </div>
            <span class="item-val" :class="valClass(q4)">{{
              q4 !== null ? q4 : "—"
            }}</span>
          </div>
          <div class="score-row">
            <button
              v-for="n in [0, 1, 2, 3, 4, 5]"
              :key="n"
              class="score-btn"
              :class="{ 'score-active': q4 === n, 'score-n-high': n >= 4 }"
              @click="q4 = n"
            >
              {{ n }}
            </button>
          </div>
        </div>

        <!-- Q5: Activities at home -->
        <div class="cat-item" :class="itemClass(q5)">
          <div class="item-header">
            <span class="item-qnum q-num">Q5</span>
            <div class="item-name-block">
              <span class="item-name">居家活動（Activities at Home）</span>
              <span class="item-anchor-row">
                <span class="anchor-left">我做家裡的事情不受任何限制</span>
                <span class="anchor-right">我做家裡的事情受到非常大的限制</span>
              </span>
            </div>
            <span class="item-val" :class="valClass(q5)">{{
              q5 !== null ? q5 : "—"
            }}</span>
          </div>
          <div class="score-row">
            <button
              v-for="n in [0, 1, 2, 3, 4, 5]"
              :key="n"
              class="score-btn"
              :class="{ 'score-active': q5 === n, 'score-n-high': n >= 4 }"
              @click="q5 = n"
            >
              {{ n }}
            </button>
          </div>
        </div>

        <!-- Q6: Confidence leaving home -->
        <div class="cat-item" :class="itemClass(q6)">
          <div class="item-header">
            <span class="item-qnum q-num">Q6</span>
            <div class="item-name-block">
              <span class="item-name">外出信心（Confidence Leaving Home）</span>
              <span class="item-anchor-row">
                <span class="anchor-left">儘管有肺部疾病，我對出門有信心</span>
                <span class="anchor-right"
                  >因為我的肺部疾病，我完全沒有信心出門</span
                >
              </span>
            </div>
            <span class="item-val" :class="valClass(q6)">{{
              q6 !== null ? q6 : "—"
            }}</span>
          </div>
          <div class="score-row">
            <button
              v-for="n in [0, 1, 2, 3, 4, 5]"
              :key="n"
              class="score-btn"
              :class="{ 'score-active': q6 === n, 'score-n-high': n >= 4 }"
              @click="q6 = n"
            >
              {{ n }}
            </button>
          </div>
        </div>

        <!-- Q7: Sleep -->
        <div class="cat-item" :class="itemClass(q7)">
          <div class="item-header">
            <span class="item-qnum q-num">Q7</span>
            <div class="item-name-block">
              <span class="item-name">睡眠（Sleep）</span>
              <span class="item-anchor-row">
                <span class="anchor-left">我睡得很好</span>
                <span class="anchor-right">因為我的肺部疾病，我睡得很差</span>
              </span>
            </div>
            <span class="item-val" :class="valClass(q7)">{{
              q7 !== null ? q7 : "—"
            }}</span>
          </div>
          <div class="score-row">
            <button
              v-for="n in [0, 1, 2, 3, 4, 5]"
              :key="n"
              class="score-btn"
              :class="{ 'score-active': q7 === n, 'score-n-high': n >= 4 }"
              @click="q7 = n"
            >
              {{ n }}
            </button>
          </div>
        </div>

        <!-- Q8: Energy -->
        <div class="cat-item" :class="itemClass(q8)">
          <div class="item-header">
            <span class="item-qnum q-num">Q8</span>
            <div class="item-name-block">
              <span class="item-name">精力（Energy）</span>
              <span class="item-anchor-row">
                <span class="anchor-left">我精力充沛</span>
                <span class="anchor-right">我完全沒有精力</span>
              </span>
            </div>
            <span class="item-val" :class="valClass(q8)">{{
              q8 !== null ? q8 : "—"
            }}</span>
          </div>
          <div class="score-row">
            <button
              v-for="n in [0, 1, 2, 3, 4, 5]"
              :key="n"
              class="score-btn"
              :class="{ 'score-active': q8 === n, 'score-n-high': n >= 4 }"
              @click="q8 = n"
            >
              {{ n }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- ── Sub-score summary row ───────────────────────────────── -->
    <div v-if="answered > 0" class="sub-score-row">
      <div
        v-for="(q, i) in [q1, q2, q3, q4, q5, q6, q7, q8]"
        :key="i"
        class="sub-score-card"
        :class="
          q !== null
            ? q <= 1
              ? 'ss-low'
              : q <= 3
                ? 'ss-mid'
                : 'ss-high'
            : 'ss-nd'
        "
      >
        <span class="ss-label">{{
          ["咳嗽", "痰液", "胸悶", "喘息", "活動", "信心", "睡眠", "精力"][i]
        }}</span>
        <span class="ss-val">{{ q !== null ? q : "—" }}</span>
      </div>
    </div>

    <!-- ── Score progress bar ─────────────────────────────────── -->
    <div v-if="total !== null" class="score-bar-wrap">
      <div class="score-bar-track">
        <div class="score-bar-seg seg-low" style="width: 25%"></div>
        <div class="score-bar-seg seg-mid" style="width: 27.5%"></div>
        <div class="score-bar-seg seg-high" style="width: 25%"></div>
        <div class="score-bar-seg seg-vhigh" style="flex: 1"></div>
        <div class="score-bar-needle" :style="{ left: barWidth }"></div>
      </div>
      <div class="score-bar-labels">
        <span>0</span><span>10</span><span>20</span><span>30</span
        ><span>40</span>
      </div>
      <div class="score-bar-legend">
        <span class="sl-low">● 0–9 低度</span>
        <span class="sl-mid">● 10–20 中度</span>
        <span class="sl-high">● 21–30 高度</span>
        <span class="sl-vhigh">● 31–40 極高度</span>
        <span class="sl-needle">▲ 目前：{{ total }}</span>
      </div>
    </div>

    <!-- ── Results detail ─────────────────────────────────────── -->
    <div v-if="showResults && isComplete" class="results-detail">
      <div class="results-header">CAT 評估明細</div>
      <div
        v-for="(q, i) in [q1, q2, q3, q4, q5, q6, q7, q8]"
        :key="i"
        class="detail-row"
      >
        <span
          class="detail-qnum"
          :class="q !== null && q >= 4 ? 'dq-high' : 'dq-neu'"
          >Q{{ i + 1 }}</span
        >
        <span class="detail-domain">{{
          [
            "咳嗽",
            "痰液",
            "胸悶",
            "喘息",
            "居家活動",
            "外出信心",
            "睡眠",
            "精力",
          ][i]
        }}</span>
        <span
          class="detail-score"
          :class="
            q !== null && q >= 4
              ? 'ds-high'
              : q !== null && q >= 2
                ? 'ds-mid'
                : 'ds-low'
          "
          >{{ q }} / 5</span
        >
        <span class="detail-desc">{{
          q === 0
            ? "無影響"
            : q === 1
              ? "輕微"
              : q === 2
                ? "輕至中"
                : q === 3
                  ? "中度"
                  : q === 4
                    ? "嚴重"
                    : "極嚴重"
        }}</span>
      </div>
      <div class="detail-row detail-total">
        <span class="detail-qnum">∑</span>
        <span class="detail-domain">CAT 總分</span>
        <span class="detail-score detail-score-brand">{{ total }} / 40</span>
        <span class="detail-desc">{{ result.impact }}度影響</span>
      </div>
    </div>

    <!-- ── Result card ────────────────────────────────────────── -->
    <div class="cat-result" :class="result.color">
      <div class="result-left">
        <span class="result-score">{{ total !== null ? total : "—" }}</span>
        <span class="result-score-label">/ 40</span>
        <span class="result-impact" v-if="total !== null"
          >{{ result.impact }}度</span
        >
      </div>
      <div class="result-right">
        <span class="result-ver"
          >Jones PW et al. Eur Respir J 2009 · GOLD 2023+</span
        >
        <span class="result-level">{{ result.level }}</span>
        <span class="result-gold" v-if="total !== null">{{ result.gold }}</span>
        <span class="result-advice">{{ result.advice }}</span>
        <span v-if="result.action" class="result-action"
          >💡 {{ result.action }}</span
        >
      </div>
    </div>

    <!-- ── Warn ───────────────────────────────────────────────── -->
    <div class="warn-box">
      <span class="warn-icon">⚠</span>
      <span
        >CAT 為患者自評工具，不能用於 COPD 診斷（需肺功能確認 FEV1/FVC &lt;
        0.70）。GOLD ABE 分類需同時考量急性惡化史（過去一年是否有 ≥2
        次中度急性惡化或 ≥1 次住院）；CAT ≥10
        僅反映症狀負擔，不代表急性惡化風險。CAT 建議每 2–3
        個月複評一次，分數變化 ≥2
        分具臨床意義。本工具僅供輔助評估，治療決策需由醫師整合完整臨床資訊。</span
      >
    </div>

    <!-- ── Actions ────────────────────────────────────────────── -->
    <div class="cat-actions">
      <button
        class="btn-view"
        :disabled="!isComplete"
        @click="showResults = !showResults"
      >
        {{ showResults ? "收起明細" : "查看評估明細" }}
      </button>
      <button class="btn-copy" :disabled="!isComplete" @click="copyOutput">
        {{ copied ? "已複製 ✓" : "複製 Markdown 結果" }}
      </button>
      <button class="btn-reset" @click="reset">重置</button>
    </div>
    <p v-if="!isComplete" class="progress-hint">
      已完成 {{ answered }}/8 題，尚餘 {{ 8 - answered }} 題
    </p>
  </div>
</template>

<style scoped>
.cat {
  max-width: 780px;
  margin: 0 auto;
  padding: 2rem 0 3rem;
  font-size: 0.9rem;
}

/* ── Header ─────────────────────────────────────────────────────── */
.cat-header {
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
  margin: 0 0 0.3rem;
  line-height: 1.6;
}
.subtitle-2 {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
}
.hint-tag {
  display: inline-block;
  font-size: 0.68rem;
  font-weight: 700;
  padding: 2px 9px;
  border-radius: 999px;
}
.hint-low {
  background: rgba(34, 197, 94, 0.12);
  color: #16a34a;
}
.hint-mid {
  background: rgba(245, 158, 11, 0.12);
  color: #d97706;
}
.hint-high {
  background: rgba(239, 68, 68, 0.12);
  color: #dc2626;
}
.hint-vhigh {
  background: rgba(139, 0, 0, 0.12);
  color: #991b1b;
}

/* ── Badge ───────────────────────────────────────────────────────── */
.score-badge {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-width: 88px;
  min-height: 88px;
  flex-shrink: 0;
  padding: 0.6rem 0.75rem;
  border-radius: 14px;
  border: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg-soft);
  transition: all 0.3s;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
}
.badge-top {
  font-size: 0.55rem;
  font-weight: 700;
  color: var(--vp-c-text-3);
}
.score-number {
  font-size: 1.9rem;
  font-weight: 800;
  line-height: 1;
  text-align: center;
}
.score-unit {
  font-size: 0.62rem;
  font-weight: 600;
}
.score-bot {
  font-size: 0.55rem;
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
.score-badge.moderate {
  border-color: #f59e0b;
  color: #f59e0b;
  box-shadow:
    0 0 0 1px rgba(245, 158, 11, 0.08),
    0 1px 3px rgba(0, 0, 0, 0.04);
}
.score-badge.critical {
  border-color: #ef4444;
  color: #ef4444;
  box-shadow:
    0 0 0 1px rgba(239, 68, 68, 0.08),
    0 1px 3px rgba(0, 0, 0, 0.04);
}

/* ── Groups ──────────────────────────────────────────────────────── */
.nihss-group {
  margin-bottom: 1.25rem;
}
.prereq-notice {
  display: flex;
  align-items: flex-start;
  gap: 0.6rem;
  padding: 0.75rem 1rem;
  border-radius: 10px;
  background: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-divider);
  border-left: 3px solid var(--vp-c-brand-1);
  font-size: 0.78rem;
  color: var(--vp-c-text-2);
  line-height: 1.6;
  margin-bottom: 1.5rem;
}
.pn-icon {
  flex-shrink: 0;
  color: var(--vp-c-brand-1);
}
.group-header-bar {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.55rem 0.85rem;
  border-radius: 10px;
  background: linear-gradient(
    135deg,
    rgba(59, 130, 246, 0.08),
    var(--vp-c-bg-mute),
    var(--vp-c-bg-soft)
  );
  border: 1px solid var(--vp-c-divider);
  border-left: 4px solid #dc2626;
  margin-bottom: 0.5rem;
  box-shadow: 0 1px 3px rgba(59, 130, 246, 0.06);
}
.q-bar {
  border-left: 4px solid #3b82f6;
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
  font-size: 0.72rem;
  font-weight: 700;
  padding: 2px 8px;
  border-radius: 999px;
  flex-shrink: 0;
  min-width: 52px;
  text-align: center;
  border: 1px solid transparent;
}
.tally-ok {
  color: #22c55e;
  background: rgba(34, 197, 94, 0.12);
  border-color: rgba(34, 197, 94, 0.25);
}
.tally-nd {
  color: var(--vp-c-text-3);
  background: var(--vp-c-bg-soft);
  border-color: var(--vp-c-divider);
}

/* ── CAT items ───────────────────────────────────────────────────── */
.item-list {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}
.cat-item {
  border: 1px solid var(--vp-c-divider);
  border-radius: 10px;
  background: var(--vp-c-bg-soft);
  overflow: hidden;
  transition: all 0.25s;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.03);
}
.cat-item:hover {
  box-shadow: 0 3px 12px rgba(0, 0, 0, 0.06);
  border-color: var(--vp-c-divider);
}
.cat-item.item-low {
  border-color: #22c55e;
}
.cat-item.item-mid {
  border-color: #f59e0b;
}
.cat-item.item-high {
  border-color: #ef4444;
}
.item-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  padding: 0.5rem 0.85rem;
  background: var(--vp-c-bg-mute);
  border-bottom: 1px solid var(--vp-c-divider);
  gap: 0.65rem;
}
.item-qnum {
  font-size: 0.65rem;
  font-weight: 800;
  padding: 1px 6px;
  border-radius: 999px;
  flex-shrink: 0;
  margin-top: 2px;
}
.q-num {
  color: #3b82f6;
  background: rgba(59, 130, 246, 0.12);
}
.item-name-block {
  display: flex;
  flex-direction: column;
  gap: 3px;
  flex: 1;
  min-width: 0;
}
.item-name {
  font-size: 0.85rem;
  font-weight: 700;
  color: var(--vp-c-text-1);
}
.item-anchor-row {
  display: flex;
  justify-content: space-between;
  gap: 0.5rem;
}
.anchor-left {
  font-size: 0.62rem;
  color: #16a34a;
  font-weight: 600;
}
.anchor-right {
  font-size: 0.62rem;
  color: #dc2626;
  font-weight: 600;
  text-align: right;
}
.item-val {
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
.val-nd {
  color: var(--vp-c-text-3);
  background: transparent;
  border-color: var(--vp-c-divider);
}
.val-low {
  color: #22c55e;
  border-color: rgba(34, 197, 94, 0.3);
  background: rgba(34, 197, 94, 0.06);
}
.val-mid {
  color: #f59e0b;
  border-color: rgba(245, 158, 11, 0.3);
  background: rgba(245, 158, 11, 0.06);
}
.val-high {
  color: #ef4444;
  border-color: rgba(239, 68, 68, 0.3);
  background: rgba(239, 68, 68, 0.06);
}

/* ── Score buttons (0–5) — ENS6Q pill style ──────────────────────── */
.score-row {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 2px;
  padding: 3px;
  background: var(--vp-c-bg-mute);
}
.score-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 0.6rem 0.15rem;
  cursor: pointer;
  font-family: inherit;
  transition: all 0.2s;
  text-align: center;
  gap: 4px;
  border-radius: 6px;
  background: var(--vp-c-bg);
  border: 1.5px solid transparent;
  font-size: 1rem;
  font-weight: 900;
  color: rgba(107, 114, 128, 0.5);
}
.score-btn:hover {
  border-color: var(--vp-c-divider);
  background: var(--vp-c-bg-soft);
}
.score-btn.score-active {
  font-weight: 900;
  box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.06);
}
.score-btn:nth-child(1) {
  border-color: rgba(34, 197, 94, 0.15);
  color: rgba(34, 197, 94, 0.5);
}
.score-btn:nth-child(1):hover:not(.score-active) {
  border-color: rgba(34, 197, 94, 0.35);
  background: rgba(34, 197, 94, 0.04);
}
.score-btn:nth-child(1).score-active {
  border-color: #22c55e;
  color: #22c55e;
  background: linear-gradient(
    180deg,
    rgba(34, 197, 94, 0.12),
    rgba(34, 197, 94, 0.06)
  );
  box-shadow: 0 0 0 1px rgba(34, 197, 94, 0.08);
}
.score-btn:nth-child(2) {
  border-color: rgba(132, 204, 22, 0.15);
  color: rgba(132, 204, 22, 0.5);
}
.score-btn:nth-child(2):hover:not(.score-active) {
  border-color: rgba(132, 204, 22, 0.35);
  background: rgba(132, 204, 22, 0.04);
}
.score-btn:nth-child(2).score-active {
  border-color: #84cc16;
  color: #84cc16;
  background: linear-gradient(
    180deg,
    rgba(132, 204, 22, 0.12),
    rgba(132, 204, 22, 0.06)
  );
  box-shadow: 0 0 0 1px rgba(132, 204, 22, 0.08);
}
.score-btn:nth-child(3) {
  border-color: rgba(234, 179, 8, 0.15);
  color: rgba(234, 179, 8, 0.5);
}
.score-btn:nth-child(3):hover:not(.score-active) {
  border-color: rgba(234, 179, 8, 0.35);
  background: rgba(234, 179, 8, 0.04);
}
.score-btn:nth-child(3).score-active {
  border-color: #eab308;
  color: #eab308;
  background: linear-gradient(
    180deg,
    rgba(234, 179, 8, 0.12),
    rgba(234, 179, 8, 0.06)
  );
  box-shadow: 0 0 0 1px rgba(234, 179, 8, 0.08);
}
.score-btn:nth-child(4) {
  border-color: rgba(245, 158, 11, 0.15);
  color: rgba(245, 158, 11, 0.5);
}
.score-btn:nth-child(4):hover:not(.score-active) {
  border-color: rgba(245, 158, 11, 0.35);
  background: rgba(245, 158, 11, 0.04);
}
.score-btn:nth-child(4).score-active {
  border-color: #f59e0b;
  color: #f59e0b;
  background: linear-gradient(
    180deg,
    rgba(245, 158, 11, 0.12),
    rgba(245, 158, 11, 0.06)
  );
  box-shadow: 0 0 0 1px rgba(245, 158, 11, 0.08);
}
.score-btn:nth-child(5) {
  border-color: rgba(249, 115, 22, 0.15);
  color: rgba(249, 115, 22, 0.5);
}
.score-btn:nth-child(5):hover:not(.score-active) {
  border-color: rgba(249, 115, 22, 0.35);
  background: rgba(249, 115, 22, 0.04);
}
.score-btn:nth-child(5).score-active {
  border-color: #f97316;
  color: #f97316;
  background: linear-gradient(
    180deg,
    rgba(249, 115, 22, 0.12),
    rgba(249, 115, 22, 0.06)
  );
  box-shadow: 0 0 0 1px rgba(249, 115, 22, 0.08);
}
.score-btn:nth-child(6) {
  border-color: rgba(239, 68, 68, 0.15);
  color: rgba(239, 68, 68, 0.5);
}
.score-btn:nth-child(6):hover:not(.score-active) {
  border-color: rgba(239, 68, 68, 0.35);
  background: rgba(239, 68, 68, 0.04);
}
.score-btn:nth-child(6).score-active {
  border-color: #ef4444;
  color: #ef4444;
  background: linear-gradient(
    180deg,
    rgba(239, 68, 68, 0.12),
    rgba(239, 68, 68, 0.06)
  );
  box-shadow: 0 0 0 1px rgba(239, 68, 68, 0.08);
}

/* ── Sub-score row ───────────────────────────────────────────────── */
.sub-score-row {
  display: flex;
  gap: 0.3rem;
  margin-bottom: 1rem;
  flex-wrap: wrap;
}
.sub-score-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0.4rem 0.5rem;
  border-radius: 10px;
  border: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg-soft);
  flex: 1;
  min-width: 60px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.03);
}
.ss-nd {
  opacity: 0.45;
}
.ss-low {
  border-color: #22c55e;
}
.ss-mid {
  border-color: #f59e0b;
}
.ss-high {
  border-color: #ef4444;
}
.ss-label {
  font-size: 0.54rem;
  color: var(--vp-c-text-3);
  font-weight: 600;
  text-align: center;
}
.ss-val {
  font-size: 0.9rem;
  font-weight: 800;
  color: var(--vp-c-text-1);
}
.ss-low .ss-val {
  color: #22c55e;
}
.ss-mid .ss-val {
  color: #f59e0b;
}
.ss-high .ss-val {
  color: #ef4444;
}

/* ── Score bar ───────────────────────────────────────────────────── */
.score-bar-wrap {
  margin-bottom: 1.25rem;
}
.score-bar-track {
  position: relative;
  height: 18px;
  border-radius: 999px;
  overflow: visible;
  display: flex;
  border: 1px solid var(--vp-c-divider);
  box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.08);
}
.score-bar-seg {
  height: 100%;
}
.seg-low {
  background: rgba(34, 197, 94, 0.25);
  border-radius: 999px 0 0 999px;
}
.seg-mid {
  background: rgba(245, 158, 11, 0.25);
}
.seg-high {
  background: rgba(239, 68, 68, 0.25);
}
.seg-vhigh {
  background: rgba(153, 27, 27, 0.25);
  border-radius: 0 999px 999px 0;
}
.score-bar-needle {
  position: absolute;
  top: -4px;
  width: 4px;
  height: 26px;
  background: #1e293b;
  border-radius: 2px;
  transform: translateX(-50%);
  transition: left 0.4s;
}
.score-bar-labels {
  display: flex;
  justify-content: space-between;
  font-size: 0.62rem;
  color: var(--vp-c-text-3);
  font-family: monospace;
  margin-top: 4px;
}
.score-bar-legend {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
  font-size: 0.65rem;
  margin-top: 4px;
}
.sl-low {
  color: #16a34a;
}
.sl-mid {
  color: #d97706;
}
.sl-high {
  color: #dc2626;
}
.sl-vhigh {
  color: #991b1b;
}
.sl-needle {
  color: var(--vp-c-text-1);
  font-weight: 700;
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
  padding: 0.45rem 0.85rem;
  font-size: 0.68rem;
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
  padding: 0.45rem 0.85rem;
  border-bottom: 1px solid var(--vp-c-divider);
}
.detail-row:last-child {
  border-bottom: none;
}
.detail-total {
  background: linear-gradient(135deg, var(--vp-c-bg-mute), var(--vp-c-bg-soft));
  font-weight: 800;
}
.detail-qnum {
  font-size: 0.66rem;
  font-weight: 800;
  flex-shrink: 0;
  width: 28px;
}
.dq-high {
  color: #ef4444;
}
.dq-neu {
  color: #3b82f6;
}
.detail-domain {
  font-size: 0.75rem;
  font-weight: 700;
  color: var(--vp-c-text-1);
  flex: 1;
}
.detail-score {
  font-size: 0.78rem;
  font-weight: 800;
  flex-shrink: 0;
  width: 60px;
  text-align: right;
}
.ds-high {
  color: #ef4444;
}
.ds-mid {
  color: #f59e0b;
}
.ds-low {
  color: #22c55e;
}
.detail-score-brand {
  color: var(--vp-c-brand-1);
}
.detail-desc {
  font-size: 0.68rem;
  color: var(--vp-c-text-2);
  flex-shrink: 0;
  min-width: 60px;
}

/* ── Result card ─────────────────────────────────────────────────── */
.cat-result {
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
  min-height: 96px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
}
.cat-result.filling {
  border-color: var(--vp-c-divider);
}
.cat-result.normal {
  border-color: #22c55e;
  box-shadow:
    0 0 0 1px rgba(34, 197, 94, 0.06),
    0 1px 3px rgba(0, 0, 0, 0.04);
}
.cat-result.moderate {
  border-color: #f59e0b;
  box-shadow:
    0 0 0 1px rgba(245, 158, 11, 0.06),
    0 1px 3px rgba(0, 0, 0, 0.04);
}
.cat-result.critical {
  border-color: #ef4444;
  box-shadow:
    0 0 0 1px rgba(239, 68, 68, 0.06),
    0 1px 3px rgba(0, 0, 0, 0.04);
}
.result-left {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex-shrink: 0;
  min-width: 68px;
}
.result-score {
  font-size: 2.4rem;
  font-weight: 800;
  line-height: 1;
  color: var(--vp-c-text-3);
  transition: color 0.3s;
}
.cat-result.normal .result-score {
  color: #22c55e;
}
.cat-result.moderate .result-score {
  color: #f59e0b;
}
.cat-result.critical .result-score {
  color: #ef4444;
}
.result-score-label {
  font-size: 0.6rem;
  color: var(--vp-c-text-3);
  font-weight: 700;
}
.result-impact {
  font-size: 0.75rem;
  font-weight: 800;
  margin-top: 2px;
  color: var(--vp-c-text-2);
}
.result-right {
  display: flex;
  flex-direction: column;
  gap: 5px;
  flex: 1;
}
.result-ver {
  font-size: 0.68rem;
  font-weight: 700;
  color: var(--vp-c-text-3);
}
.result-level {
  font-size: 0.95rem;
  font-weight: 700;
  color: var(--vp-c-text-1);
}
.result-gold {
  font-size: 0.78rem;
  font-weight: 700;
  color: var(--vp-c-brand-1);
}
.result-advice {
  font-size: 0.82rem;
  color: var(--vp-c-text-2);
  line-height: 1.5;
}
.result-action {
  position: relative;
  font-size: 0.8rem;
  color: var(--vp-c-text-2);
  line-height: 1.5;
  padding: 0.45rem 0.65rem 0.45rem 0.9rem;
  border-radius: 7px;
  background: var(--vp-c-bg-mute);
}
.result-action::before {
  content: "";
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  width: 3px;
  border-radius: 7px 0 0 7px;
  background: var(--vp-c-brand-1);
}

/* ── Warn / Actions ──────────────────────────────────────────────── */
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
.cat-actions {
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
.btn-view:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 14px rgba(99, 102, 241, 0.4);
}
.btn-view:active:not(:disabled) {
  transform: translateY(0);
}
.btn-view:disabled {
  opacity: 0.4;
  cursor: not-allowed;
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

/* ── Responsive ──────────────────────────────────────────────────── */
@media (max-width: 640px) {
  .cat-header {
    flex-wrap: wrap;
  }
  .score-badge {
    align-self: flex-start;
  }
  .cat-result {
    flex-direction: column;
    gap: 0.75rem;
  }
  .sub-score-row {
    gap: 0.25rem;
  }
  .item-anchor-row {
    flex-direction: column;
    gap: 1px;
  }
  .anchor-right {
    text-align: left;
  }
  .score-row {
    grid-template-columns: repeat(3, 1fr);
  }
  .score-btn:nth-child(3) ~ .score-btn {
    border-top: 1px solid var(--vp-c-divider);
  }
}
</style>
