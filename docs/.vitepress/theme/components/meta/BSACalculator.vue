<script setup lang="ts">
import { ref, computed } from "vue";
// BSA Formulas (H=cm, W=kg unless noted):
// Mosteller:  BSA = sqrt(H×W / 3600)
// DuBois:     BSA = 0.007184 × H^0.725 × W^0.425
// Haycock:    BSA = 0.024265 × H^0.3964 × W^0.5378
// Gehan-George: BSA = 0.0235 × H^0.42246 × W^0.51456
// Boyd:       BSA = 0.0003207 × H^0.3 × W(g)^(0.7285−0.0188×log10(W(g)))

type Method = "mosteller" | "dubois" | "haycock" | "gehan" | "boyd";

const heightVal = ref("");
const weightVal = ref("");
const method = ref<Method>("mosteller");
const copied = ref(false);
const showResults = ref(false);

const H = computed(() => {
  const v = parseFloat(heightVal.value);
  return isNaN(v) || v <= 0 ? null : v;
});
const W = computed(() => {
  const v = parseFloat(weightVal.value);
  return isNaN(v) || v <= 0 ? null : v;
});
const isComplete = computed(() => H.value !== null && W.value !== null);

function calcBSA(m: Method): number | null {
  if (!H.value || !W.value) return null;
  let val: number;
  switch (m) {
    case "mosteller":
      val = Math.sqrt((H.value * W.value) / 3600);
      break;
    case "dubois":
      val = 0.007184 * Math.pow(H.value, 0.725) * Math.pow(W.value, 0.425);
      break;
    case "haycock":
      val = 0.024265 * Math.pow(H.value, 0.3964) * Math.pow(W.value, 0.5378);
      break;
    case "gehan":
      val = 0.0235 * Math.pow(H.value, 0.42246) * Math.pow(W.value, 0.51456);
      break;
    case "boyd": {
      const Wg = W.value * 1000;
      val =
        0.0003207 *
        Math.pow(H.value, 0.3) *
        Math.pow(Wg, 0.7285 - 0.0188 * Math.log10(Wg));
      break;
    }
    default:
      return null;
  }
  return Math.round(val * 1000) / 1000;
}

const bsaMosteller = computed(() => calcBSA("mosteller"));
const bsaDuBois = computed(() => calcBSA("dubois"));
const bsaHaycock = computed(() => calcBSA("haycock"));
const bsaGehan = computed(() => calcBSA("gehan"));
const bsaBoyd = computed(() => calcBSA("boyd"));

const bsa = computed(() => calcBSA(method.value));
const bmi = computed(() =>
  W.value && H.value
    ? Math.round((W.value / (H.value / 100) ** 2) * 10) / 10
    : null,
);

const methodLabels: Record<Method, string> = {
  mosteller: "Mosteller（1987）",
  dubois: "DuBois（1916）",
  haycock: "Haycock（1978）",
  gehan: "Gehan & George（1970）",
  boyd: "Boyd（1935）",
};
const methodFormulas: Record<Method, string> = {
  mosteller: "√(H×W / 3600)",
  dubois: "0.007184 × H^0.725 × W^0.425",
  haycock: "0.024265 × H^0.3964 × W^0.5378",
  gehan: "0.0235 × H^0.42246 × W^0.51456",
  boyd: "0.0003207 × H^0.3 × W(g)^(0.7285−0.0188×log₁₀W(g))",
};
const methodColors: Record<Method, string> = {
  mosteller: "#3b82f6",
  dubois: "#8b5cf6",
  haycock: "#10b981",
  gehan: "#f59e0b",
  boyd: "#ef4444",
};
const methodNotes: Record<Method, string> = {
  mosteller: "最簡便，廣泛用於臨床及藥物劑量計算",
  dubois: "歷史最古老（1916），僅基於 9 名受試者，仍廣泛引用",
  haycock: "兒科最常用，1978 年以幾何法驗證於嬰兒至成人",
  gehan: "1970 年化療劑量研究廣泛使用，包含較大樣本",
  boyd: "最早的全面公式（1935），使用體重的對數項校正非線性關係",
};

const severity = computed(() => {
  if (!bsa.value) return "pending";
  if (bsa.value < 1.5) return "mild";
  if (bsa.value < 2.2) return "normal";
  return "moderate";
});

function generateOutput() {
  return (
    `# 體表面積（BSA）計算 — 多公式比較\n\n` +
    `## 輸入資料\n- 身高：${H.value ?? "—"} cm\n- 體重：${W.value ?? "—"} kg\n- BMI：${bmi.value ?? "—"} kg/m²\n\n` +
    `## 各公式結果\n` +
    `- **Mosteller = ${bsaMosteller.value ?? "—"} m²**（首選）\n` +
    `- DuBois = ${bsaDuBois.value ?? "—"} m²\n` +
    `- Haycock = ${bsaHaycock.value ?? "—"} m²\n` +
    `- Gehan & George = ${bsaGehan.value ?? "—"} m²\n` +
    `- Boyd = ${bsaBoyd.value ?? "—"} m²`
  );
}

async function copyOutput() {
  await navigator.clipboard.writeText(generateOutput());
  copied.value = true;
  setTimeout(() => (copied.value = false), 2000);
}
function reset() {
  heightVal.value = "";
  weightVal.value = "";
  method.value = "mosteller";
  showResults.value = false;
}
</script>

<template>
  <div class="bsa">
    <div class="bsa-header">
      <div class="header-title">
        <h2 class="title">BSA 體表面積計算</h2>
        <p class="subtitle">
          Body Surface Area · 5 公式比較 · Mosteller / DuBois / Haycock / Gehan
          / Boyd
        </p>
      </div>
      <div
        class="score-badge"
        :class="severity"
        :style="{ '--accent': methodColors[method] }"
      >
        <span class="badge-label">{{ method.toUpperCase() }}</span>
        <span class="score-number">{{ bsa ?? "—" }}</span>
        <span class="score-unit" :style="{ opacity: bsa ? 1 : 0 }">m²</span>
        <span class="score-label">{{ bmi ? "BMI " + bmi : "—" }}</span>
      </div>
    </div>

    <!-- Inputs -->
    <div class="nihss-group">
      <div class="group-header-bar input-bar">
        <span class="group-icon">📏</span>
        <span class="group-label-text">身高與體重</span>
        <span class="group-sub-text"
          >H = cm · W = kg（Boyd 公式內部自動轉換為 g）</span
        >
        <span class="group-score-tally bsa-tally">{{
          bsa ? bsa + " m²" : "—"
        }}</span>
      </div>
      <div class="group-items">
        <div class="ens-item" :class="{ answered: H !== null }">
          <div class="item-header">
            <div class="item-meta-row"><span class="item-qnum">Ht</span></div>
            <div class="item-name-block">
              <span class="item-name">身高 Height</span>
              <span class="item-sub"
                >所有公式均以公分（cm）輸入，Boyd 公式對身高使用
                H^0.3，非線性影響較小</span
              >
            </div>
            <span class="item-score" :class="{ zero: H === null }"
              >{{ H ?? "—" }}<small v-if="H"> cm</small></span
            >
          </div>
          <div class="input-row">
            <input
              v-model="heightVal"
              type="number"
              min="30"
              max="250"
              step="0.1"
              placeholder="cm"
              class="bsa-input"
            />
            <span class="input-unit">cm</span>
          </div>
        </div>
        <div class="ens-item" :class="{ answered: W !== null }">
          <div class="item-header">
            <div class="item-meta-row"><span class="item-qnum">Wt</span></div>
            <div class="item-name-block">
              <span class="item-name">體重 Weight</span>
              <span class="item-sub"
                >使用實際體重（kg）。化療藥物劑量建議使用實際體重計算
                BSA（含肥胖患者）</span
              >
            </div>
            <span class="item-score" :class="{ zero: W === null }"
              >{{ W ?? "—" }}<small v-if="W"> kg</small></span
            >
          </div>
          <div class="input-row">
            <input
              v-model="weightVal"
              type="number"
              min="2"
              max="400"
              step="0.1"
              placeholder="kg"
              class="bsa-input"
            />
            <span class="input-unit">kg</span>
          </div>
        </div>
        <div class="ens-item derived-item" v-if="bmi">
          <div class="item-header">
            <div class="item-meta-row">
              <span class="item-qnum bmi-q">BMI</span>
            </div>
            <div class="item-name-block">
              <span class="item-name">身體質量指數（自動計算）</span>
              <span class="item-sub"
                >BMI = {{ W }} ÷ {{ ((H! / 100) ** 2).toFixed(4) }} =
                {{ bmi }} kg/m²</span
              >
            </div>
            <span class="item-score" style="color: #06b6d4">{{ bmi }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Method selector -->
    <div class="nihss-group">
      <div class="group-header-bar method-bar">
        <span class="group-icon">🔢</span>
        <span class="group-label-text">公式選擇</span>
        <span class="group-sub-text">選擇主要顯示的 BSA 公式</span>
        <span class="group-score-tally method-tally">{{
          methodLabels[method]
        }}</span>
      </div>
      <div class="method-grid">
        <button
          v-for="m in [
            'mosteller',
            'dubois',
            'haycock',
            'gehan',
            'boyd',
          ] as Method[]"
          :key="m"
          class="method-btn"
          :class="{ 'method-active': method === m }"
          :style="method === m ? { '--btn-color': methodColors[m] } : {}"
          @click="method = m"
        >
          <span class="mb-name">{{ methodLabels[m] }}</span>
          <span class="mb-formula">{{ methodFormulas[m] }}</span>
          <span class="mb-note">{{ methodNotes[m] }}</span>
          <span class="mb-result" v-if="calcBSA(m)">= {{ calcBSA(m) }} m²</span>
        </button>
      </div>
    </div>

    <!-- Comparison table -->
    <div class="bsa-table" v-if="isComplete">
      <div class="bt-header">各公式 BSA 計算結果比較</div>
      <div
        v-for="m in [
          'mosteller',
          'dubois',
          'haycock',
          'gehan',
          'boyd',
        ] as Method[]"
        :key="m"
        class="bt-row"
        :class="{ 'bt-active': method === m }"
      >
        <span class="bt-name" :style="{ color: methodColors[m] }">{{
          methodLabels[m]
        }}</span>
        <span class="bt-formula">{{ methodFormulas[m] }}</span>
        <span class="bt-result" :class="method === m ? 'bt-primary' : ''"
          >{{ calcBSA(m) ?? "—" }} m²</span
        >
      </div>
    </div>

    <!-- Formula display -->
    <div class="formula-box" v-if="isComplete && bsa">
      <span class="formula-label"
        >計算過程（{{ methodLabels[method] }}）：</span
      >
      <span class="formula-text">
        <template v-if="method === 'mosteller'"
          >BSA = √({{ H }}×{{ W }} / 3600) = √{{
            ((H! * W!) / 3600).toFixed(4)
          }}
          = <strong>{{ bsa }} m²</strong></template
        >
        <template v-else-if="method === 'dubois'"
          >BSA = 0.007184×{{ H }}^0.725×{{ W }}^0.425 =
          <strong>{{ bsa }} m²</strong></template
        >
        <template v-else-if="method === 'haycock'"
          >BSA = 0.024265×{{ H }}^0.3964×{{ W }}^0.5378 =
          <strong>{{ bsa }} m²</strong></template
        >
        <template v-else-if="method === 'gehan'"
          >BSA = 0.0235×{{ H }}^0.42246×{{ W }}^0.51456 =
          <strong>{{ bsa }} m²</strong></template
        >
        <template v-else
          >BSA = 0.0003207×{{ H }}^0.3×{{
            W ? W * 1000 : "?"
          }}(g)^(0.7285−0.0188×log₁₀{{ W ? W * 1000 : "" }}) =
          <strong>{{ bsa }} m²</strong></template
        >
      </span>
    </div>

    <!-- Result card -->
    <div class="ens-result" :class="severity">
      <div class="result-left">
        <span class="result-number">{{ bsa ?? "—" }}</span>
        <span class="result-max" v-if="bsa">m²</span>
      </div>
      <div class="result-right">
        <span class="result-level">{{ methodLabels[method] }}</span>
        <span class="result-advice" v-if="bsa">
          參考值：成人正常範圍約 1.6–2.0 m²（平均 1.73 m²）
        </span>
        <span class="result-sub" v-if="bmi">BMI {{ bmi }} kg/m²</span>
      </div>
    </div>

    <div class="warn-box">
      <span class="warn-icon">⚠</span>
      <span
        >BSA 為估算值，不同公式結果差異通常在 2–5%
        以內。化療藥物劑量建議使用單一機構統一採用的公式（最常用 Mosteller 或
        DuBois）。兒科常用 Haycock
        公式。計算結果需結合臨床情境與個別用藥指引判斷。</span
      >
    </div>

    <div v-if="showResults" class="results-detail">
      <div class="results-header">評估明細</div>
      <div class="detail-row">
        <span class="detail-qnum">Ht</span
        ><span class="detail-domain">身高</span
        ><span class="detail-score">{{ H ?? "—" }}</span
        ><span class="detail-desc">cm</span>
      </div>
      <div class="detail-row">
        <span class="detail-qnum">Wt</span
        ><span class="detail-domain">體重</span
        ><span class="detail-score">{{ W ?? "—" }}</span
        ><span class="detail-desc">kg</span>
      </div>
      <div class="detail-row">
        <span class="detail-qnum">BMI</span
        ><span class="detail-domain">身體質量指數</span
        ><span class="detail-score">{{ bmi ?? "—" }}</span
        ><span class="detail-desc">kg/m²</span>
      </div>
      <div class="detail-row">
        <span class="detail-qnum">Most</span
        ><span class="detail-domain">Mosteller BSA</span
        ><span class="detail-score">{{ bsaMosteller ?? "—" }}</span
        ><span class="detail-desc">m²</span>
      </div>
      <div class="detail-row">
        <span class="detail-qnum">DuB</span
        ><span class="detail-domain">DuBois BSA</span
        ><span class="detail-score">{{ bsaDuBois ?? "—" }}</span
        ><span class="detail-desc">m²</span>
      </div>
      <div class="detail-row">
        <span class="detail-qnum">Hay</span
        ><span class="detail-domain">Haycock BSA</span
        ><span class="detail-score">{{ bsaHaycock ?? "—" }}</span
        ><span class="detail-desc">m²</span>
      </div>
      <div class="detail-row">
        <span class="detail-qnum">Geh</span
        ><span class="detail-domain">Gehan & George BSA</span
        ><span class="detail-score">{{ bsaGehan ?? "—" }}</span
        ><span class="detail-desc">m²</span>
      </div>
      <div class="detail-row detail-total">
        <span class="detail-qnum">BSA</span>
        <span class="detail-domain">選用公式（{{ method }}）</span>
        <span class="detail-score detail-score-brand">{{ bsa ?? "—" }}</span>
        <div class="detail-desc detail-desc-block">
          <span class="detail-desc-unit">m²</span>
          <span class="detail-desc-label">{{
            methodLabels[method].split("（")[0]
          }}</span>
        </div>
      </div>
    </div>

    <div class="ens-actions">
      <button class="btn-view" @click="showResults = !showResults">
        {{ showResults ? "收起明細" : "查看評估結果" }}
      </button>
      <button class="btn-copy" :disabled="!isComplete" @click="copyOutput">
        {{ copied ? "已複製 ✓" : "複製 Markdown 結果" }}
      </button>
      <button class="btn-reset" @click="reset">重置</button>
    </div>
    <p v-if="!isComplete" class="progress-hint">請輸入身高及體重</p>
  </div>
</template>

<style scoped>
.bsa {
  max-width: 780px;
  margin: 0 auto;
  padding: 2rem 0 3rem;
  font-size: 0.9rem;
}
.bsa-header {
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
.score-badge {
  display: flex;
  flex-shrink: 0;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-width: 90px;
  min-height: 88px;
  padding: 0.6rem 1rem;
  border-radius: 12px;
  border: 1px solid var(--accent, var(--vp-c-divider));
  background: var(--vp-c-bg-soft);
  transition: all 0.3s;
  color: var(--accent, var(--vp-c-text-3));
}
.badge-label {
  font-size: 0.65rem;
  font-weight: 700;
}
.score-number {
  font-size: 1.9rem;
  font-weight: 800;
  line-height: 1;
}
.score-unit {
  font-size: 0.65rem;
  font-weight: 600;
  margin-top: 1px;
}
.score-label {
  font-size: 0.65rem;
  font-weight: 600;
  margin-top: 2px;
}
.score-badge.pending {
  color: var(--vp-c-text-3);
  border-color: var(--vp-c-divider);
}
.nihss-group {
  margin-bottom: 1.5rem;
}
.group-header-bar {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.55rem 0.85rem;
  border-radius: 8px;
  background: var(--vp-c-bg-mute);
  border: 1px solid var(--vp-c-divider);
  border-left: 3px solid #0ea5e9;
  margin-bottom: 0.6rem;
}
.input-bar {
  border-left: 3px solid #3b82f6;
}
.method-bar {
  border-left: 3px solid #8b5cf6;
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
}
.bsa-tally {
  color: #3b82f6;
  background: rgba(59, 130, 246, 0.12);
}
.method-tally {
  color: #8b5cf6;
  background: rgba(139, 92, 246, 0.12);
  max-width: 140px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.group-items {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
.ens-item {
  border: 1px solid var(--vp-c-divider);
  border-radius: 10px;
  background: var(--vp-c-bg-soft);
  overflow: hidden;
  transition: border-color 0.2s;
}
.ens-item.answered {
  border-color: #3b82f6;
}
.ens-item.derived-item {
  border-color: #06b6d4;
  opacity: 0.85;
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
.derived-item .item-header {
  border-bottom: none;
}
.item-meta-row {
  display: flex;
  align-items: center;
  flex-shrink: 0;
  padding-top: 3px;
}
.item-qnum {
  font-size: 0.68rem;
  font-weight: 800;
  color: #3b82f6;
  background: rgba(59, 130, 246, 0.12);
  padding: 1px 6px;
  border-radius: 999px;
}
.bmi-q {
  color: #06b6d4;
  background: rgba(6, 182, 212, 0.12);
}
.item-name-block {
  display: flex;
  flex-direction: column;
  gap: 2px;
  flex: 1;
}
.item-name {
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--vp-c-text-1);
}
.item-sub {
  font-size: 0.72rem;
  color: var(--vp-c-text-3);
}
.item-score {
  font-size: 0.9rem;
  font-weight: 800;
  color: #3b82f6;
  min-width: 28px;
  text-align: right;
  white-space: nowrap;
}
.item-score.zero {
  color: var(--vp-c-text-3);
}
.input-row {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.65rem 0.9rem;
}
.bsa-input {
  flex: 1;
  border: 1.5px solid var(--vp-c-divider);
  border-radius: 8px;
  background: var(--vp-c-bg);
  color: var(--vp-c-text-1);
  font-size: 0.9rem;
  font-family: inherit;
  padding: 0.45rem 0.75rem;
  outline: none;
  transition: border-color 0.2s;
  -moz-appearance: textfield;
}
.bsa-input::-webkit-outer-spin-button,
.bsa-input::-webkit-inner-spin-button {
  -webkit-appearance: none;
}
.bsa-input:focus {
  border-color: #3b82f6;
}
.bsa-input::placeholder {
  color: var(--vp-c-text-3);
  font-size: 0.82rem;
}
.input-unit {
  font-size: 0.78rem;
  font-weight: 600;
  color: var(--vp-c-text-3);
  flex-shrink: 0;
}
.method-grid {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
.method-btn {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 0.75rem;
  padding: 0.6rem 0.9rem;
  border-radius: 10px;
  border: 1.5px solid var(--vp-c-divider);
  background: var(--vp-c-bg-soft);
  cursor: pointer;
  font-family: inherit;
  text-align: left;
  transition: all 0.18s;
}
.method-btn.method-active {
  border-color: var(--btn-color, var(--vp-c-brand-1));
  background: rgba(99, 102, 241, 0.05);
}
.mb-name {
  font-size: 0.82rem;
  font-weight: 700;
  color: var(--vp-c-text-1);
  flex-shrink: 0;
  width: 140px;
}
.mb-formula {
  font-size: 0.68rem;
  font-family: monospace;
  color: var(--vp-c-text-3);
  flex: 1;
}
.mb-note {
  font-size: 0.68rem;
  color: var(--vp-c-text-3);
  flex-shrink: 0;
  width: 140px;
  text-align: right;
  display: none;
}
.mb-result {
  font-size: 0.82rem;
  font-weight: 800;
  color: var(--vp-c-brand-1);
  flex-shrink: 0;
  min-width: 70px;
  text-align: right;
}
.method-btn.method-active .mb-name {
  color: var(--btn-color, var(--vp-c-brand-1));
}
.bsa-table {
  border: 1px solid var(--vp-c-divider);
  border-radius: 10px;
  overflow: hidden;
  margin-bottom: 1rem;
}
.bt-header {
  padding: 0.4rem 0.9rem;
  font-size: 0.7rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--vp-c-text-3);
  background: var(--vp-c-bg-mute);
  border-bottom: 1px solid var(--vp-c-divider);
}
.bt-row {
  display: grid;
  grid-template-columns: 160px 1fr 80px;
  gap: 0.5rem;
  padding: 0.42rem 0.9rem;
  border-bottom: 1px solid var(--vp-c-divider);
  font-size: 0.78rem;
  align-items: center;
}
.bt-row:last-child {
  border-bottom: none;
}
.bt-active {
  background: var(--vp-c-brand-soft);
}
.bt-name {
  font-weight: 700;
}
.bt-formula {
  font-family: monospace;
  font-size: 0.68rem;
  color: var(--vp-c-text-3);
}
.bt-result {
  font-weight: 800;
  color: var(--vp-c-text-2);
  text-align: right;
}
.bt-primary {
  color: var(--vp-c-brand-1);
}
.formula-box {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
  padding: 0.6rem 0.9rem;
  border-radius: 8px;
  background: var(--vp-c-bg-mute);
  border: 1px solid var(--vp-c-divider);
  margin-bottom: 1rem;
  font-size: 0.78rem;
}
.formula-label {
  font-weight: 700;
  color: var(--vp-c-text-2);
  flex-shrink: 0;
}
.formula-text {
  color: var(--vp-c-text-2);
  font-family: monospace;
  line-height: 1.7;
}
.ens-result {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  padding: 1.25rem 1.5rem;
  border-radius: 12px;
  border: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg-soft);
  margin-bottom: 1rem;
  flex-wrap: wrap;
  transition: border-color 0.3s;
}
.ens-result.normal {
  border-color: #3b82f6;
}
.ens-result.mild {
  border-color: #f59e0b;
}
.ens-result.moderate {
  border-color: #22c55e;
}
.result-left {
  display: flex;
  align-items: baseline;
  gap: 4px;
  flex-shrink: 0;
}
.result-number {
  font-size: 3.2rem;
  font-weight: 800;
  line-height: 1;
  color: var(--vp-c-text-3);
  transition: color 0.3s;
}
.ens-result.normal .result-number {
  color: #3b82f6;
}
.ens-result.mild .result-number {
  color: #f59e0b;
}
.ens-result.moderate .result-number {
  color: #22c55e;
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
  font-size: 0.85rem;
  color: var(--vp-c-text-2);
}
.result-sub {
  font-size: 0.78rem;
  color: var(--vp-c-brand-1);
}
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
.results-detail {
  border: 1px solid var(--vp-c-divider);
  border-radius: 10px;
  overflow: hidden;
  margin-bottom: 1rem;
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
  width: 44px;
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
  color: var(--vp-c-brand-1);
  flex-shrink: 0;
  width: 52px;
  text-align: right;
  white-space: nowrap;
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
  white-space: nowrap;
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
/* ── Actions ───────────────────────────────────────────────────── */
.ens-actions {
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
@media (max-width: 640px) {
  .bsa-header {
    flex-direction: column;
  }
  .ens-result {
    flex-direction: column;
    gap: 0.75rem;
  }
  .bt-row {
    grid-template-columns: 120px 1fr 70px;
  }
  .method-btn {
    flex-direction: column;
    align-items: flex-start;
  }
  .mb-name {
    width: auto;
  }
  .mb-result {
    text-align: left;
  }
}
</style>
