<script setup lang="ts">
import { ref, computed, type Ref } from "vue";

// ── FIB-4 Index for Liver Fibrosis ───────────────────────────────
// FIB-4 = (Age × AST) / (Platelets × √ALT)
// Platelets in 10⁹/L, AST and ALT in U/L
// Validated in: Sterling RK et al. Hepatology 2006;43:1317-25
// WHO/EASL/AASLD endorsed non-invasive fibrosis assessment
// Original cohort: HIV/HCV co-infected; validated across NAFLD, HBV, alcohol
//
// Thresholds (general population / NAFLD):
//   < 1.30  → Low risk  (F0–F1, NPV 90%)  → advanced fibrosis unlikely
//   1.30–2.67 → Indeterminate   → liver biopsy or elastography may be needed
//   > 2.67  → High risk (F3–F4, PPV 80%)  → advanced fibrosis / cirrhosis likely
//
// Age-adjusted thresholds (≥65 yr):
//   < 2.0  → Low    > 4.0  → High   (reduces false positives in elderly)
//
// NAFLD/MASLD specific (EASL 2023):
//   < 1.30 → Rule out advanced fibrosis
//   > 2.67 → Rule in advanced fibrosis
//   1.30–2.67 → Indeterminate — proceed to elastography (FibroScan)

// ── Inputs ────────────────────────────────────────────────────────
const age = ref<number | null>(null);
const ast = ref<number | null>(null); // U/L
const alt = ref<number | null>(null); // U/L
const platelets = ref<number | null>(null); // 10⁹/L

// ── Etiology context (affects threshold choice) ──────────────────
const etiology = ref<"nafld" | "hcv" | "hbv" | "alcohol" | "general" | null>(
  null,
);

const copied = ref(false);
const showResults = ref(false);

const ageRef = ref<HTMLInputElement>();
const astRef = ref<HTMLInputElement>();
const altRef = ref<HTMLInputElement>();
const pltRef = ref<HTMLInputElement>();

function onEnter(field: "age" | "ast" | "alt") {
  const map: Record<string, Ref<HTMLInputElement | undefined>> = {
    age: astRef,
    ast: altRef,
    alt: pltRef,
  };
  map[field]?.value?.focus();
}

// ── Completeness ─────────────────────────────────────────────────
const isComplete = computed(
  () =>
    age.value !== null &&
    age.value > 0 &&
    ast.value !== null &&
    ast.value > 0 &&
    alt.value !== null &&
    alt.value > 0 &&
    platelets.value !== null &&
    platelets.value > 0 &&
    etiology.value !== null,
);

// ── FIB-4 Calculation ─────────────────────────────────────────────
// FIB-4 = (Age × AST) / (Platelets × √ALT)
const fib4 = computed((): number | null => {
  if (!isComplete.value) return null;
  const a = age.value!;
  const s = ast.value!;
  const l = alt.value!;
  const p = platelets.value!;
  if (l <= 0 || p <= 0) return null;
  return (a * s) / (p * Math.sqrt(l));
});

const fib4Display = computed(() => {
  if (fib4.value === null) return "—";
  return fib4.value.toFixed(2);
});

// ── Age-adjusted thresholds ───────────────────────────────────────
const isElderly = computed(() => (age.value ?? 0) >= 65);

const lowThreshold = computed(() => (isElderly.value ? 2.0 : 1.3));
const highThreshold = computed(() => (isElderly.value ? 4.0 : 2.67));

// ── Risk classification ───────────────────────────────────────────
const riskZone = computed((): "low" | "indeterminate" | "high" | null => {
  if (fib4.value === null) return null;
  if (fib4.value < lowThreshold.value) return "low";
  if (fib4.value > highThreshold.value) return "high";
  return "indeterminate";
});

// ── Result object ─────────────────────────────────────────────────
const result = computed(() => {
  if (fib4.value === null)
    return {
      level: "填寫中",
      color: "filling",
      fibrosis: "?",
      npv: "?",
      ppv: "?",
      advice: "",
      action: "",
    };

  const f = fib4.value;
  const elderly = isElderly.value;
  const etio = etiology.value;

  if (riskZone.value === "low") {
    const threshold = elderly ? "< 2.0（年齡校正）" : "< 1.30";
    return {
      level: "低風險 — 晚期纖維化不太可能",
      color: "normal",
      fibrosis: "F0–F1",
      npv: "90%",
      ppv: "—",
      advice: `FIB-4 ${f.toFixed(2)}，低於低風險閾值（${threshold}）。晚期纖維化（F3–F4）陰性預測值約 90%。`,
      action:
        etio === "nafld"
          ? "建議每 1–2 年以 FIB-4 重新評估；若有代謝危險因子惡化，提早複查。無需立即肝臟切片或彈性成像。"
          : "可常規追蹤，無需立即進一步肝纖維化評估。若臨床情況改變（轉氨酶上升、血小板下降）則重新計算。",
    };
  }

  if (riskZone.value === "high") {
    const threshold = elderly ? "> 4.0（年齡校正）" : "> 2.67";
    return {
      level: "高風險 — 晚期纖維化 / 肝硬化可能性高",
      color: "critical",
      fibrosis: "F3–F4",
      npv: "—",
      ppv: "80%",
      advice: `FIB-4 ${f.toFixed(2)}，超過高風險閾值（${threshold}）。晚期纖維化陽性預測值約 80%，應高度警惕肝硬化可能。`,
      action:
        "建議轉介肝臟專科。進一步以瞬態彈性成像（FibroScan）或 MR-elastography 確認纖維化分期；必要時考慮肝臟切片。評估肝硬化併發症（靜脈曲張、HCC 篩查）。",
    };
  }

  // indeterminate
  const lo = elderly ? "2.0" : "1.30";
  const hi = elderly ? "4.0" : "2.67";
  return {
    level: "不確定區間 — 需要進一步評估",
    color: "moderate",
    fibrosis: "F1–F3",
    npv: "~70%",
    ppv: "~50%",
    advice: `FIB-4 ${f.toFixed(2)}，落在不確定區間（${lo}–${hi}）。`,
    action:
      "建議以瞬態彈性成像（FibroScan，LSM）或血清纖維化標記（ELF、Pro-C3）進行第二層評估，以釐清纖維化分期。",
  };
});

// ── Severity bar fill width ───────────────────────────────────────
// Map FIB-4 0–6+ to 0–100%
const barWidth = computed(() => {
  if (fib4.value === null) return "0%";
  const pct = Math.min((fib4.value / 6) * 100, 100);
  return pct.toFixed(1) + "%";
});

// ── Badge display ─────────────────────────────────────────────────
const badgeNum = computed(() =>
  fib4.value !== null ? fib4Display.value : "—",
);
const badgeBot = computed(() => {
  if (fib4.value === null) return isComplete.value ? "計算中" : "請填入數值";
  if (riskZone.value === "low") return "低風險";
  if (riskZone.value === "high") return "高風險";
  return "不確定";
});

// ── Etiology label ────────────────────────────────────────────────
const etiologyLabel: Record<string, string> = {
  nafld: "NAFLD / MASLD",
  hcv: "慢性 C 型肝炎（HCV）",
  hbv: "慢性 B 型肝炎（HBV）",
  alcohol: "酒精性肝病",
  general: "其他 / 一般",
};

// ── Markdown export ───────────────────────────────────────────────
function generateMarkdown(): string {
  return (
    `# FIB-4 肝纖維化指數評估\n\n` +
    `## 輸入數值\n` +
    `- 年齡：${age.value} 歲${isElderly.value ? "（≥65 歲，使用年齡校正閾值）" : ""}\n` +
    `- AST：${ast.value} U/L\n` +
    `- ALT：${alt.value} U/L\n` +
    `- 血小板：${platelets.value} × 10⁹/L\n` +
    `- 病因：${etiology.value ? etiologyLabel[etiology.value] : "未選擇"}\n\n` +
    `## 計算結果\n` +
    `- **FIB-4 指數：${fib4Display.value}**\n` +
    `- 低風險閾值：< ${lowThreshold.value}\n` +
    `- 高風險閾值：> ${highThreshold.value}\n\n` +
    `## 臨床判讀\n` +
    `**${result.value.level}**\n\n` +
    `預測纖維化分期：${result.value.fibrosis}\n\n` +
    `${result.value.advice}\n\n` +
    `**建議行動：** ${result.value.action}\n\n` +
    `*FIB-4 = (Age × AST) / (Platelets × √ALT)*\n` +
    `*Reference: Sterling RK et al. Hepatology 2006;43:1317–25*`
  );
}

async function copyOutput() {
  await navigator.clipboard.writeText(generateMarkdown());
  copied.value = true;
  setTimeout(() => (copied.value = false), 2000);
}

function reset() {
  age.value = null;
  ast.value = null;
  alt.value = null;
  platelets.value = null;
  etiology.value = null;
  showResults.value = false;
}

// ── Input validation helpers ──────────────────────────────────────
function setAge(e: Event) {
  const v = +(e.target as HTMLInputElement).value;
  age.value = v > 0 ? v : null;
}
function setAST(e: Event) {
  const v = +(e.target as HTMLInputElement).value;
  ast.value = v > 0 ? v : null;
}
function setALT(e: Event) {
  const v = +(e.target as HTMLInputElement).value;
  alt.value = v > 0 ? v : null;
}
function setPlatelets(e: Event) {
  const v = +(e.target as HTMLInputElement).value;
  platelets.value = v > 0 ? v : null;
}
</script>

<template>
  <div class="fib4">
    <!-- ── Header ─────────────────────────────────────────────── -->
    <div class="fib4-header">
      <div class="header-title">
        <h2 class="title">FIB-4 肝纖維化指數計算器</h2>
        <p class="subtitle">
          Fibrosis-4 Index · 非侵入性肝纖維化評估 · Sterling et al. Hepatology
          2006 · EASL / AASLD / WHO 推薦
        </p>
        <p class="subtitle-2">
          <span class="hint-tag hint-formula"
            >FIB-4 = (年齡 × AST) / (血小板 × √ALT)</span
          >
        </p>
      </div>
      <div class="score-badge" :class="result.color">
        <span class="badge-top">FIB-4</span>
        <span class="score-number">{{ badgeNum }}</span>
        <span class="score-bot">{{ badgeBot }}</span>
      </div>
    </div>

    <!-- ── Etiology selector ──────────────────────────────────── -->
    <div class="nihss-group">
      <div class="group-header-bar etio-bar">
        <span class="group-icon">🫀</span>
        <span class="group-label-text">肝病病因（選擇適用閾值）</span>
        <span class="group-sub-text"
          >不同病因的 FIB-4 閾值略有差異；選擇後提供對應建議</span
        >
        <span
          class="group-score-tally"
          :class="etiology !== null ? 'tally-ok' : 'tally-nd'"
        >
          {{ etiology !== null ? etiologyLabel[etiology] : "未選擇" }}
        </span>
      </div>
      <div class="etio-grid">
        <button
          class="etio-btn e-nafld"
          :class="{ 'etio-active': etiology === 'nafld' }"
          @click="etiology = 'nafld'"
        >
          <span class="etio-icon">🫙</span>
          <span class="etio-label">NAFLD / MASLD</span>
          <span class="etio-sub">非酒精性/代謝相關脂肪肝病 · 最常用情境</span>
        </button>
        <button
          class="etio-btn e-hcv"
          :class="{ 'etio-active': etiology === 'hcv' }"
          @click="etiology = 'hcv'"
        >
          <span class="etio-icon">🔬</span>
          <span class="etio-label">慢性 C 型肝炎（HCV）</span>
          <span class="etio-sub">原始驗證族群 · Sterling 2006</span>
        </button>
        <button
          class="etio-btn e-hbv"
          :class="{ 'etio-active': etiology === 'hbv' }"
          @click="etiology = 'hbv'"
        >
          <span class="etio-icon">🧬</span>
          <span class="etio-label">慢性 B 型肝炎（HBV）</span>
          <span class="etio-sub">已在 HBV 族群驗證，臺灣常見</span>
        </button>
        <button
          class="etio-btn e-alc"
          :class="{ 'etio-active': etiology === 'alcohol' }"
          @click="etiology = 'alcohol'"
        >
          <span class="etio-icon">🍺</span>
          <span class="etio-label">酒精性肝病</span>
          <span class="etio-sub">AST/ALT 比值常 > 2，需謹慎解讀</span>
        </button>
        <button
          class="etio-btn e-gen"
          :class="{ 'etio-active': etiology === 'general' }"
          @click="etiology = 'general'"
        >
          <span class="etio-icon">📋</span>
          <span class="etio-label">其他 / 一般</span>
          <span class="etio-sub">使用標準通用閾值（1.30 / 2.67）</span>
        </button>
      </div>
    </div>

    <!-- ── Numeric inputs ─────────────────────────────────────── -->
    <div class="nihss-group">
      <div class="group-header-bar input-bar">
        <span class="group-icon">🔢</span>
        <span class="group-label-text">檢驗數值輸入</span>
        <span class="group-sub-text">輸入最近一次的實驗室檢查結果</span>
        <span
          class="group-score-tally"
          :class="
            fib4 !== null
              ? riskZone === 'high'
                ? 'tally-abn'
                : riskZone === 'low'
                  ? 'tally-ok'
                  : 'tally-mid'
              : 'tally-nd'
          "
        >
          {{ fib4 !== null ? fib4Display : "待輸入" }}
        </span>
      </div>
      <div class="input-grid">
        <!-- Age -->
        <div class="input-card" :class="age !== null ? 'input-filled' : ''">
          <div class="input-header">
            <span class="input-qnum q-age">年齡</span>
            <div class="input-name-block">
              <span class="input-name">年齡（Age）</span>
              <span class="input-sub">歲 · ≥65 歲自動套用年齡校正閾值</span>
            </div>
            <span
              class="input-val"
              :class="
                age !== null ? (isElderly ? 'val-warn' : 'val-ok') : 'val-nd'
              "
            >
              {{ age !== null ? age + " 歲" : "—" }}
              <span v-if="isElderly" class="elderly-tag">≥65</span>
            </span>
          </div>
          <div class="input-row">
            <input
              ref="ageRef"
              class="num-input"
              type="number"
              min="18"
              max="120"
              step="1"
              placeholder="例：52"
              :value="age ?? ''"
              @input="setAge"
              @keypress.enter="onEnter('age')"
            />
            <span class="input-unit">歲</span>
          </div>
        </div>

        <!-- AST -->
        <div class="input-card" :class="ast !== null ? 'input-filled' : ''">
          <div class="input-header">
            <span class="input-qnum q-ast">AST</span>
            <div class="input-name-block">
              <span class="input-name">AST（天門冬氨酸轉氨酶）</span>
              <span class="input-sub"
                >U/L · 正常參考值 &lt; 40 U/L · FIB-4 分子項</span
              >
            </div>
            <span
              class="input-val"
              :class="
                ast !== null ? (ast > 40 ? 'val-warn' : 'val-ok') : 'val-nd'
              "
            >
              {{ ast !== null ? ast + " U/L" : "—" }}
            </span>
          </div>
          <div class="input-row">
            <input
              ref="astRef"
              class="num-input"
              type="number"
              min="1"
              max="9999"
              step="1"
              placeholder="例：45"
              :value="ast ?? ''"
              @input="setAST"
              @keypress.enter="onEnter('ast')"
            />
            <span class="input-unit">U/L</span>
          </div>
        </div>

        <!-- ALT -->
        <div class="input-card" :class="alt !== null ? 'input-filled' : ''">
          <div class="input-header">
            <span class="input-qnum q-alt">ALT</span>
            <div class="input-name-block">
              <span class="input-name">ALT（丙氨酸轉氨酶）</span>
              <span class="input-sub"
                >U/L · 正常參考值 &lt; 40 U/L · FIB-4 分母開根號項</span
              >
            </div>
            <span
              class="input-val"
              :class="
                alt !== null ? (alt > 40 ? 'val-warn' : 'val-ok') : 'val-nd'
              "
            >
              {{ alt !== null ? alt + " U/L" : "—" }}
            </span>
          </div>
          <div class="input-row">
            <input
              ref="altRef"
              class="num-input"
              type="number"
              min="1"
              max="9999"
              step="1"
              placeholder="例：38"
              :value="alt ?? ''"
              @input="setALT"
              @keypress.enter="onEnter('alt')"
            />
            <span class="input-unit">U/L</span>
          </div>
        </div>

        <!-- Platelets -->
        <div
          class="input-card"
          :class="platelets !== null ? 'input-filled' : ''"
        >
          <div class="input-header">
            <span class="input-qnum q-plt">PLT</span>
            <div class="input-name-block">
              <span class="input-name">血小板計數（Platelet Count）</span>
              <span class="input-sub"
                >× 10⁹/L · 正常 150–400 · 肝硬化常 &lt; 150</span
              >
            </div>
            <span
              class="input-val"
              :class="
                platelets !== null
                  ? platelets < 150
                    ? 'val-warn'
                    : 'val-ok'
                  : 'val-nd'
              "
            >
              {{ platelets !== null ? platelets + " ×10⁹/L" : "—" }}
            </span>
          </div>
          <div class="input-row">
            <input
              ref="pltRef"
              class="num-input"
              type="number"
              min="1"
              max="999"
              step="1"
              placeholder="例：180"
              :value="platelets ?? ''"
              @input="setPlatelets"
            />
            <span class="input-unit">×10⁹/L</span>
          </div>
        </div>
      </div>
    </div>

    <!-- ── Threshold display ──────────────────────────────────── -->
    <div v-if="etiology !== null" class="threshold-box">
      <div class="threshold-row thr-head">
        <span></span>
        <span>使用閾值</span>
        <span>{{ isElderly ? "年齡校正（≥65 歲）" : "標準閾值" }}</span>
      </div>
      <div class="threshold-row">
        <span class="thr-zone thr-low">低風險（F0–F1）</span>
        <span class="thr-cut">FIB-4 &lt; {{ lowThreshold }}</span>
        <span class="thr-stat">NPV ~90%</span>
      </div>
      <div class="threshold-row">
        <span class="thr-zone thr-mid">不確定區間</span>
        <span class="thr-cut">{{ lowThreshold }} – {{ highThreshold }}</span>
        <span class="thr-stat">需進一步評估</span>
      </div>
      <div class="threshold-row">
        <span class="thr-zone thr-high">高風險（F3–F4）</span>
        <span class="thr-cut">FIB-4 &gt; {{ highThreshold }}</span>
        <span class="thr-stat">PPV ~80%</span>
      </div>
    </div>

    <!-- ── Visual score bar ───────────────────────────────────── -->
    <div v-if="fib4 !== null" class="score-bar-wrap">
      <div class="score-bar-track">
        <div
          class="score-bar-zone zone-low"
          :style="{ width: ((lowThreshold / 6) * 100).toFixed(1) + '%' }"
        ></div>
        <div
          class="score-bar-zone zone-mid"
          :style="{
            width:
              (((highThreshold - lowThreshold) / 6) * 100).toFixed(1) + '%',
          }"
        ></div>
        <div
          class="score-bar-zone zone-high"
          :style="{ width: (((6 - highThreshold) / 6) * 100).toFixed(1) + '%' }"
        ></div>
        <div class="score-bar-needle" :style="{ left: barWidth }"></div>
      </div>
      <div class="score-bar-labels">
        <span>0</span>
        <span>{{ lowThreshold }}</span>
        <span>{{ highThreshold }}</span>
        <span>6+</span>
      </div>
      <div class="score-bar-legend">
        <span class="legend-low">● 低風險</span>
        <span class="legend-mid">● 不確定</span>
        <span class="legend-high">● 高風險</span>
        <span class="legend-needle">▲ 當前 FIB-4: {{ fib4Display }}</span>
      </div>
    </div>

    <!-- ── Results detail ─────────────────────────────────────── -->
    <div v-if="showResults && fib4 !== null" class="results-detail">
      <div class="results-header">計算明細</div>
      <div class="detail-row">
        <span class="detail-qnum dq-neu">年齡</span>
        <span class="detail-domain">Age</span>
        <span class="detail-score ds-neu">{{ age }}</span>
        <span class="detail-desc"
          >歲{{ isElderly ? " · 年齡校正閾值" : "" }}</span
        >
      </div>
      <div class="detail-row">
        <span class="detail-qnum" :class="ast! > 40 ? 'dq-pos' : 'dq-neu'"
          >AST</span
        >
        <span class="detail-domain">天門冬氨酸轉氨酶</span>
        <span class="detail-score" :class="ast! > 40 ? 'ds-pos' : 'ds-neu'">{{
          ast
        }}</span>
        <span class="detail-desc">U/L{{ ast! > 40 ? " · 偏高" : "" }}</span>
      </div>
      <div class="detail-row">
        <span class="detail-qnum" :class="alt! > 40 ? 'dq-pos' : 'dq-neu'"
          >ALT</span
        >
        <span class="detail-domain">丙氨酸轉氨酶</span>
        <span class="detail-score" :class="alt! > 40 ? 'ds-pos' : 'ds-neu'">{{
          alt
        }}</span>
        <span class="detail-desc"
          >U/L · √ALT = {{ Math.sqrt(alt!).toFixed(2) }}</span
        >
      </div>
      <div class="detail-row">
        <span
          class="detail-qnum"
          :class="platelets! < 150 ? 'dq-pos' : 'dq-neu'"
          >PLT</span
        >
        <span class="detail-domain">血小板計數</span>
        <span
          class="detail-score"
          :class="platelets! < 150 ? 'ds-pos' : 'ds-neu'"
          >{{ platelets }}</span
        >
        <span class="detail-desc"
          >×10⁹/L{{ platelets! < 150 ? " · 偏低" : "" }}</span
        >
      </div>
      <div class="detail-row detail-formula">
        <span class="detail-qnum dq-brand">=</span>
        <span class="detail-domain">FIB-4 公式</span>
        <span class="detail-score ds-brand">{{ fib4Display }}</span>
        <span class="detail-desc"
          >({{ age }}×{{ ast }}) / ({{ platelets }}×{{
            Math.sqrt(alt!).toFixed(2)
          }})</span
        >
      </div>
      <div class="detail-row detail-total">
        <span class="detail-qnum">∑</span>
        <span class="detail-domain">風險分層</span>
        <span class="detail-score detail-score-brand">{{
          riskZone === "low"
            ? "低風險"
            : riskZone === "high"
              ? "高風險"
              : "不確定"
        }}</span>
        <span class="detail-desc"
          >{{ result.fibrosis }} ·
          {{
            result.npv !== "—" ? "NPV " + result.npv : "PPV " + result.ppv
          }}</span
        >
      </div>
    </div>

    <!-- ── Result card ────────────────────────────────────────── -->
    <div class="fib4-result" :class="result.color">
      <div class="result-left">
        <span class="result-score">{{
          fib4 !== null ? fib4Display : "—"
        }}</span>
        <span class="result-score-label">FIB-4</span>
        <span class="result-fibrosis" v-if="fib4 !== null">{{
          result.fibrosis
        }}</span>
      </div>
      <div class="result-right">
        <span class="result-ver"
          >Sterling et al. Hepatology 2006 · EASL 2023</span
        >
        <span class="result-level">{{ result.level }}</span>
        <span class="result-advice">{{ result.advice }}</span>
        <span class="result-action" v-if="result.action"
          >💡 {{ result.action }}</span
        >
      </div>
    </div>

    <!-- ── Warn ───────────────────────────────────────────────── -->
    <div class="warn-box">
      <span class="warn-icon">⚠</span>
      <span
        >FIB-4
        為非侵入性纖維化篩查工具，不能取代肝臟切片的組織學診斷。酒精性肝病患者因
        AST/ALT &gt; 2，FIB-4
        可能高估纖維化程度。急性肝炎（轉氨酶急性上升）或血液病（血小板異常）時，數值可能失真。年齡
        &lt; 35 歲或 &gt; 65
        歲時建議使用年齡校正閾值。不確定區間（1.30–2.67）患者需進一步以
        FibroScan 或血清彈性標記（ELF、Pro-C3）評估。</span
      >
    </div>

    <!-- ── Actions ────────────────────────────────────────────── -->
    <div class="fib4-actions">
      <button
        class="btn-view"
        :disabled="fib4 === null"
        @click="showResults = !showResults"
      >
        {{ showResults ? "收起明細" : "查看評估結果" }}
      </button>
      <button class="btn-copy" :disabled="!isComplete" @click="copyOutput">
        {{ copied ? "已複製 ✓" : "複製 Markdown 結果" }}
      </button>
      <button class="btn-reset" @click="reset">重置</button>
    </div>
    <p v-if="!isComplete" class="progress-hint">
      請完整填入：年齡、AST、ALT、血小板計數，並選擇病因
    </p>
  </div>
</template>

<style scoped>
.fib4 {
  max-width: 780px;
  margin: 0 auto;
  padding: 2rem 0 3rem;
  font-size: 0.9rem;
}

/* ── Header ─────────────────────────────────────────────────────── */
.fib4-header {
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
  font-size: 0.75rem;
  color: var(--vp-c-text-3);
  margin: 0;
  line-height: 1.6;
}
.subtitle-2 {
  margin: 0.3rem 0 0;
}
.hint-tag {
  display: inline-block;
  font-size: 0.7rem;
  font-weight: 700;
  padding: 2px 10px;
  border-radius: 999px;
  white-space: nowrap;
}
.hint-formula {
  background: rgba(59, 130, 246, 0.12);
  color: #2563eb;
  font-family: monospace;
}

/* ── Score badge ─────────────────────────────────────────────────── */
.score-badge {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 110px;
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
  font-size: 1.6rem;
  font-weight: 800;
  line-height: 1;
  min-width: 3ch;
  text-align: center;
  transition: color 0.3s;
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
.group-header-bar {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.65rem 0.85rem 0.65rem 1.5rem;
  border-radius: 10px;
  background: linear-gradient(
    135deg,
    rgba(14, 165, 233, 0.08),
    var(--vp-c-bg-mute),
    var(--vp-c-bg-soft)
  );
  border: 1px solid var(--vp-c-divider);
  border-left: 4px solid #0ea5e9;
  box-shadow: 0 1px 3px rgba(14, 165, 233, 0.06);
  margin-bottom: 0.6rem;
}
.etio-bar {
  border-left-color: #f97316;
  background: linear-gradient(
    135deg,
    rgba(249, 115, 22, 0.08),
    var(--vp-c-bg-mute),
    var(--vp-c-bg-soft)
  );
  box-shadow: 0 1px 3px rgba(249, 115, 22, 0.06);
}
.input-bar {
  border-left-color: #3b82f6;
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
.tally-abn {
  color: #ef4444;
  background: rgba(239, 68, 68, 0.12);
  border-color: rgba(239, 68, 68, 0.25);
}
.tally-mid {
  color: #f59e0b;
  background: rgba(245, 158, 11, 0.12);
  border-color: rgba(245, 158, 11, 0.25);
}
.tally-nd {
  color: var(--vp-c-text-3);
  background: var(--vp-c-bg-soft);
  border-color: var(--vp-c-divider);
}

/* ── Etiology grid ───────────────────────────────────────────────── */
.etio-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.4rem;
}
.etio-btn {
  display: flex;
  flex-direction: column;
  gap: 3px;
  padding: 0.6rem 0.8rem;
  border-radius: 10px;
  border: 1.5px solid var(--vp-c-divider);
  background: var(--vp-c-bg-soft);
  cursor: pointer;
  font-family: inherit;
  text-align: left;
  transition: all 0.2s;
}
.etio-btn:last-child {
  grid-column: 1 / -1;
}
.etio-btn:hover {
  background: var(--vp-c-bg-mute);
  border-color: var(--vp-c-brand-1);
}
.etio-icon {
  font-size: 1rem;
}
.etio-label {
  font-size: 0.82rem;
  font-weight: 700;
  color: var(--vp-c-text-1);
}
.etio-sub {
  font-size: 0.64rem;
  color: var(--vp-c-text-3);
  line-height: 1.4;
}
.e-nafld.etio-active {
  border-color: #f59e0b;
  background: linear-gradient(
    180deg,
    rgba(245, 158, 11, 0.12),
    rgba(245, 158, 11, 0.06)
  );
}
.e-nafld.etio-active .etio-label {
  color: #d97706;
}
.e-hcv.etio-active {
  border-color: #ef4444;
  background: linear-gradient(
    180deg,
    rgba(239, 68, 68, 0.12),
    rgba(239, 68, 68, 0.06)
  );
}
.e-hcv.etio-active .etio-label {
  color: #dc2626;
}
.e-hbv.etio-active {
  border-color: #8b5cf6;
  background: linear-gradient(
    180deg,
    rgba(139, 92, 246, 0.12),
    rgba(139, 92, 246, 0.06)
  );
}
.e-hbv.etio-active .etio-label {
  color: #7c3aed;
}
.e-alc.etio-active {
  border-color: #f97316;
  background: linear-gradient(
    180deg,
    rgba(249, 115, 22, 0.12),
    rgba(249, 115, 22, 0.06)
  );
}
.e-alc.etio-active .etio-label {
  color: #ea580c;
}
.e-gen.etio-active {
  border-color: #06b6d4;
  background: linear-gradient(
    180deg,
    rgba(6, 182, 212, 0.12),
    rgba(6, 182, 212, 0.06)
  );
}
.e-gen.etio-active .etio-label {
  color: #0891b2;
}

/* ── Input grid ──────────────────────────────────────────────────── */
.input-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.45rem;
}
.input-card {
  border: 1px solid var(--vp-c-divider);
  border-radius: 10px;
  background: var(--vp-c-bg-soft);
  overflow: hidden;
  transition: all 0.25s;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.03);
}
.input-card:hover {
  box-shadow: 0 3px 12px rgba(0, 0, 0, 0.06);
  border-color: var(--vp-c-divider);
}
.input-card.input-filled {
  border-color: #3b82f6;
}
.input-header {
  display: flex;
  align-items: flex-start;
  gap: 0.6rem;
  padding: 0.5rem 0.75rem;
  background: var(--vp-c-bg-mute);
  border-bottom: 1px solid var(--vp-c-divider);
}
.input-qnum {
  font-size: 0.68rem;
  font-weight: 800;
  color: #fff;
  padding: 1px 8px;
  border-radius: 999px;
  letter-spacing: 0.04em;
  box-shadow: 0 1px 3px rgba(139, 92, 246, 0.2);
  flex-shrink: 0;
  margin-top: 1px;
}
.q-age {
  background: linear-gradient(135deg, #8b5cf6, #7c3aed);
}
.q-ast {
  background: linear-gradient(135deg, #ef4444, #dc2626);
  box-shadow: 0 1px 3px rgba(239, 68, 68, 0.2);
}
.q-alt {
  background: linear-gradient(135deg, #f97316, #ea580c);
  box-shadow: 0 1px 3px rgba(249, 115, 22, 0.2);
}
.q-plt {
  background: linear-gradient(135deg, #06b6d4, #0891b2);
  box-shadow: 0 1px 3px rgba(6, 182, 212, 0.2);
}
.input-name-block {
  display: flex;
  flex-direction: column;
  gap: 2px;
  flex: 1;
  min-width: 0;
}
.input-name {
  font-size: 0.83rem;
  font-weight: 600;
  color: var(--vp-c-text-1);
}
.input-sub {
  font-size: 0.62rem;
  color: var(--vp-c-text-3);
  line-height: 1.4;
}
.input-val {
  font-size: 0.75rem;
  font-weight: 800;
  flex-shrink: 0;
  text-align: right;
  white-space: nowrap;
}
.val-ok {
  color: #22c55e;
}
.val-warn {
  color: #f59e0b;
}
.val-nd {
  color: var(--vp-c-text-3);
}
.elderly-tag {
  font-size: 0.55rem;
  background: rgba(245, 158, 11, 0.15);
  color: #d97706;
  padding: 1px 4px;
  border-radius: 4px;
  margin-left: 3px;
}
.input-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.55rem 0.75rem;
}
.num-input {
  flex: 1;
  min-width: 0;
  padding: 0.45rem 0.6rem;
  border-radius: 7px;
  border: 1.5px solid var(--vp-c-divider);
  background: var(--vp-c-bg);
  color: var(--vp-c-text-1);
  font-size: 1rem;
  font-weight: 700;
  font-family: monospace;
  transition: border-color 0.15s;
  outline: none;
}
.num-input:focus {
  border-color: #3b82f6;
}
.num-input::placeholder {
  color: var(--vp-c-text-3);
  font-weight: 400;
  font-size: 0.85rem;
}
.input-unit {
  font-size: 0.72rem;
  color: var(--vp-c-text-3);
  font-weight: 600;
  flex-shrink: 0;
  white-space: nowrap;
}

/* ── Threshold box ───────────────────────────────────────────────── */
.threshold-box {
  border: 1px solid var(--vp-c-divider);
  border-radius: 10px;
  overflow: hidden;
  margin-bottom: 1rem;
}
.threshold-row {
  display: grid;
  grid-template-columns: 120px 1fr 110px;
  gap: 0.5rem;
  padding: 0.4rem 0.9rem;
  border-bottom: 1px solid var(--vp-c-divider);
  font-size: 0.78rem;
  align-items: center;
}
.threshold-row:last-child {
  border-bottom: none;
}
.thr-head {
  background: var(--vp-c-bg-mute);
  font-size: 0.7rem;
  font-weight: 700;
  color: var(--vp-c-text-3);
}
.thr-head > span:nth-child(2) {
  padding-left: 0.5rem;
}
.thr-zone {
  font-size: 0.7rem;
  font-weight: 700;
  padding: 1px 8px;
  border-radius: 999px;
  text-align: center;
}
.thr-low {
  background: rgba(34, 197, 94, 0.12);
  color: #16a34a;
}
.thr-mid {
  background: rgba(245, 158, 11, 0.12);
  color: #d97706;
}
.thr-high {
  background: rgba(239, 68, 68, 0.12);
  color: #dc2626;
}
.thr-cut {
  font-family: monospace;
  font-weight: 700;
  font-size: 0.78rem;
  color: var(--vp-c-text-1);
  padding-left: 0.5rem;
}
.thr-stat {
  font-size: 0.68rem;
  color: var(--vp-c-text-3);
  text-align: left;
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
}
.score-bar-zone {
  height: 100%;
}
.zone-low {
  background: rgba(34, 197, 94, 0.25);
  border-radius: 999px 0 0 999px;
}
.zone-mid {
  background: rgba(245, 158, 11, 0.25);
}
.zone-high {
  background: rgba(239, 68, 68, 0.25);
  border-radius: 0 999px 999px 0;
  flex: 1;
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
  padding: 0 2px;
}
.score-bar-legend {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  font-size: 0.65rem;
  color: var(--vp-c-text-3);
  margin-top: 4px;
}
.legend-low {
  color: #16a34a;
}
.legend-mid {
  color: #d97706;
}
.legend-high {
  color: #dc2626;
}
.legend-needle {
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
}
.detail-formula {
  background: rgba(59, 130, 246, 0.04);
}
.detail-qnum {
  font-size: 0.66rem;
  font-weight: 800;
  flex-shrink: 0;
  width: 32px;
}
.dq-pos {
  color: #ef4444;
}
.dq-neu {
  color: #3b82f6;
}
.dq-brand {
  color: var(--vp-c-brand-1);
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
  width: 70px;
  text-align: right;
}
.ds-pos {
  color: #ef4444;
}
.ds-neu {
  color: #3b82f6;
}
.ds-brand {
  color: var(--vp-c-brand-1);
}
.detail-score-brand {
  color: var(--vp-c-brand-1);
}
.detail-desc {
  font-size: 0.68rem;
  color: var(--vp-c-text-2);
  flex-shrink: 0;
  min-width: 120px;
}

/* ── Result card ─────────────────────────────────────────────────── */
.fib4-result {
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
.fib4-result.filling {
  border-color: var(--vp-c-divider);
}
.fib4-result.normal {
  border-color: #22c55e;
  box-shadow:
    0 0 0 1px rgba(34, 197, 94, 0.06),
    0 1px 3px rgba(0, 0, 0, 0.04);
}
.fib4-result.moderate {
  border-color: #f59e0b;
  box-shadow:
    0 0 0 1px rgba(245, 158, 11, 0.06),
    0 1px 3px rgba(0, 0, 0, 0.04);
}
.fib4-result.critical {
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
  min-width: 72px;
}
.result-score {
  font-size: 2.2rem;
  font-weight: 800;
  line-height: 1;
  color: var(--vp-c-text-3);
  transition: color 0.3s;
}
.fib4-result.normal .result-score {
  color: #22c55e;
}
.fib4-result.moderate .result-score {
  color: #f59e0b;
}
.fib4-result.critical .result-score {
  color: #ef4444;
}
.result-score-label {
  font-size: 0.6rem;
  color: var(--vp-c-text-3);
  font-weight: 700;
}
.result-fibrosis {
  font-size: 0.7rem;
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
.fib4-actions {
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
.btn-view:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 14px rgba(99, 102, 241, 0.4);
}
.btn-view:active {
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
  .fib4-header {
    flex-wrap: wrap;
  }
  .score-badge {
    align-self: flex-start;
  }
  .etio-grid {
    grid-template-columns: 1fr;
  }
  .etio-btn:last-child {
    grid-column: auto;
  }
  .input-grid {
    grid-template-columns: 1fr;
  }
  .fib4-result {
    flex-direction: column;
    gap: 0.75rem;
  }
}
</style>
