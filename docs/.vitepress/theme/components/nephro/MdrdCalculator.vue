<script setup lang="ts">
import { ref, computed, watch } from "vue";

// ── MDRD GFR — Unified Calculator ────────────────────────────────
// Tab A: Greene simplified (4-variable)
//   GFR = 186 × Cr^(-1.154) × Age^(-0.203) × [0.742 F] × [1.212 Black]
// Tab B: Levey original (7-variable)
//   GFR = 170 × Cr^(-0.999) × Age^(-0.176) × BUN^(-0.170) × Alb^(+0.318)
//          × [0.762 F] × [1.180 Black]

const method = ref<"greene" | "levey">("greene");
const crVal = ref("");
const ageVal = ref("");
const gender = ref<"M" | "F">("M");
const african = ref(false);
const albVal = ref("");
const bunVal = ref("");
const copied = ref(false);
const showResults = ref(false);

const Cr = computed(() => {
  const v = parseFloat(crVal.value);
  return isNaN(v) || v <= 0 ? null : v;
});
const Age = computed(() => {
  const v = parseFloat(ageVal.value);
  return isNaN(v) || v <= 0 ? null : v;
});
const Alb = computed(() => {
  const v = parseFloat(albVal.value);
  return isNaN(v) || v <= 0 ? null : v;
});
const BUN = computed(() => {
  const v = parseFloat(bunVal.value);
  return isNaN(v) || v <= 0 ? null : v;
});

const isComplete = computed(() => {
  if (Cr.value === null || Age.value === null) return false;
  if (method.value === "levey") return Alb.value !== null && BUN.value !== null;
  return true;
});

const greeneGfr = computed(() => {
  if (Cr.value === null || Age.value === null) return null;
  let g = 186 * Math.pow(Cr.value, -1.154) * Math.pow(Age.value, -0.203);
  if (gender.value === "F") g *= 0.742;
  if (african.value) g *= 1.212;
  return Math.round(g * 10) / 10;
});

const leveyGfr = computed(() => {
  if (
    Cr.value === null ||
    Age.value === null ||
    Alb.value === null ||
    BUN.value === null
  )
    return null;
  let g =
    170 *
    Math.pow(Cr.value, -0.999) *
    Math.pow(Age.value, -0.176) *
    Math.pow(BUN.value, -0.17) *
    Math.pow(Alb.value, 0.318);
  if (gender.value === "F") g *= 0.762;
  if (african.value) g *= 1.18;
  return Math.round(g * 10) / 10;
});

const gfr = computed(() =>
  method.value === "greene" ? greeneGfr.value : leveyGfr.value,
);

const bothAvailable = computed(
  () => greeneGfr.value !== null && leveyGfr.value !== null,
);
const diff = computed(() =>
  bothAvailable.value
    ? Math.round((leveyGfr.value! - greeneGfr.value!) * 10) / 10
    : null,
);

// bar fill: GFR 0–120 mapped to 0–100%
const barPct = computed(() => {
  if (gfr.value === null) return 0;
  return Math.min((gfr.value / 120) * 100, 100);
});

function getStage(g: number | null) {
  if (g === null)
    return { label: "尚未計算", color: "pending", ckd: "—", action: "" };
  if (g >= 90)
    return {
      label: "正常或偏高",
      color: "normal",
      ckd: "G1",
      action: "每年監測，控制危險因子（血壓、血糖、蛋白尿）",
    };
  if (g >= 60)
    return {
      label: "輕度下降",
      color: "normal",
      ckd: "G2",
      action: "每年監測，評估進展速率",
    };
  if (g >= 45)
    return {
      label: "輕中度下降",
      color: "mild",
      ckd: "G3a",
      action: "每 6 個月監測，轉介腎臟科評估",
    };
  if (g >= 30)
    return {
      label: "中重度下降",
      color: "moderate",
      ckd: "G3b",
      action: "每 3–6 個月監測，準備腎替代療法諮詢",
    };
  if (g >= 15)
    return {
      label: "重度下降",
      color: "severe",
      ckd: "G4",
      action: "每 3 個月監測，積極準備腎替代療法",
    };
  return {
    label: "腎衰竭",
    color: "critical",
    ckd: "G5",
    action: "透析或腎移植評估，腎臟科密切追蹤",
  };
}

const stage = computed(() => getStage(gfr.value));

const formulaText = computed(() => {
  if (method.value === "greene") {
    let f = "186 × Cr⁻¹·¹⁵⁴ × Age⁻⁰·²⁰³";
    if (gender.value === "F") f += " × 0.742";
    if (african.value) f += " × 1.212";
    return f;
  } else {
    let f = "170 × Cr⁻⁰·⁹⁹⁹ × Age⁻⁰·¹⁷⁶ × BUN⁻⁰·¹⁷⁰ × Alb⁺⁰·³¹⁸";
    if (gender.value === "F") f += " × 0.762";
    if (african.value) f += " × 1.180";
    return f;
  }
});

function generateOutput() {
  const label =
    method.value === "greene"
      ? "Greene 簡化公式（4變項）"
      : "Levey 原始公式（7變項）";
  let out = `# MDRD 腎絲球過濾率估算\n\n## 使用公式\n${label}\n\n## 輸入數值\n\n`;
  out += `- **血清肌酸酐（Cr）**：${Cr.value ?? "—"} mg/dL\n`;
  out += `- **年齡（Age）**：${Age.value ?? "—"} 歲\n`;
  out += `- **性別**：${gender.value === "M" ? "男性" : "女性"}\n`;
  out += `- **非洲裔**：${african.value ? "是（× 1.212）" : "否"}\n`;
  if (method.value === "levey") {
    out += `- **白蛋白（Alb）**：${Alb.value ?? "—"} g/dL\n`;
    out += `- **BUN**：${BUN.value ?? "—"} mg/dL\n`;
  }
  out += `\n## 結果\n\n- **eGFR = ${gfr.value ?? "—"} mL/min/1.73m²**\n`;
  out += `- CKD 分期：${stage.value.ckd}（${stage.value.label}）\n`;
  out += `- 建議：${stage.value.action}`;
  if (bothAvailable.value) {
    out += `\n\n## 兩公式比較\n- Greene = ${greeneGfr.value} | Levey = ${leveyGfr.value} | 差值 = ${diff.value}`;
  }
  return out;
}

async function copyOutput() {
  await navigator.clipboard.writeText(generateOutput());
  copied.value = true;
  setTimeout(() => (copied.value = false), 2000);
}

function reset() {
  crVal.value = "";
  ageVal.value = "";
  albVal.value = "";
  bunVal.value = "";
  gender.value = "M";
  african.value = false;
  showResults.value = false;
}

watch(method, () => {
  /* fields preserved intentionally */
});
</script>

<template>
  <div class="mdrd">
    <!-- ── Header ─────────────────────────────────────────────── -->
    <div class="mdrd-header">
      <div class="header-title">
        <h2 class="title">MDRD 腎絲球過濾率</h2>
        <p class="subtitle">
          Modification of Diet in Renal Disease · eGFR 估算 · Greene 4-var /
          Levey 7-var
        </p>
      </div>
      <div class="score-badge" :class="stage.color">
        <span class="badge-label">{{
          method === "greene" ? "Greene" : "Levey"
        }}</span>
        <span class="score-number">{{ gfr !== null ? gfr : "—" }}</span>
        <span class="score-unit" v-if="gfr !== null">mL/min/1.73m²</span>
        <span class="score-label">{{ stage.ckd }} · {{ stage.label }}</span>
      </div>
    </div>

    <!-- ── Severity bar ───────────────────────────────────────── -->
    <div class="severity-bar-wrap">
      <div class="severity-bar">
        <div
          class="severity-fill"
          :class="stage.color"
          :style="{ width: barPct + '%' }"
        />
      </div>
      <div class="severity-ticks-abs">
        <span class="tick-abs" style="left: 0%">0</span>
        <span class="tick-abs red" style="left: 12.5%">15</span>
        <span class="tick-abs orange" style="left: 25%">30</span>
        <span class="tick-abs yellow" style="left: 37.5%">45</span>
        <span class="tick-abs yellow" style="left: 50%">60</span>
        <span class="tick-abs green" style="left: 75%">90</span>
        <span class="tick-abs" style="left: 100%">120+</span>
      </div>
      <div class="severity-labels-abs">
        <span class="label-abs" style="left: 0%"></span>
        <span class="label-abs red" style="left: 12.5%">Stage V</span>
        <span class="label-abs orange" style="left: 25%">Stage IV</span>
        <span class="label-abs yellow" style="left: 37.5%">Stage IIIB</span>
        <span class="label-abs yellow" style="left: 50%">Stage IIIA</span>
        <span class="label-abs green" style="left: 75%">Stage II</span>
        <span class="label-abs" style="left: 100%">Stage I</span>
      </div>
    </div>

    <!-- ── Formula tab switch ─────────────────────────────────── -->
    <div class="nihss-group">
      <div class="group-header-bar method-bar">
        <span class="group-icon">🔢</span>
        <span class="group-label-text">公式選擇</span>
        <span class="group-sub-text">切換計算方法</span>
      </div>
      <div class="tab-toggle">
        <button
          class="tab-btn"
          :class="{ 'tab-active': method === 'greene' }"
          @click="method = 'greene'"
        >
          <span class="tab-title">Greene 簡化公式</span>
          <span class="tab-sub">4 個變項 · 無需 BUN / Albumin</span>
        </button>
        <button
          class="tab-btn"
          :class="{ 'tab-active': method === 'levey' }"
          @click="method = 'levey'"
        >
          <span class="tab-title">Levey 原始公式</span>
          <span class="tab-sub">7 個變項 · 需 BUN + Albumin</span>
        </button>
      </div>
      <div
        class="method-note"
        :class="method === 'greene' ? 'note-greene' : 'note-levey'"
      >
        <template v-if="method === 'greene'">
          <strong>Greene 簡化 MDRD（4 變項）：</strong>
          僅需肌酸酐、年齡、性別與種族，無需 BUN 或白蛋白。適合門診快速評估。在
          GFR &gt; 60 時傾向低估，此時建議改用 CKD-EPI。
        </template>
        <template v-else>
          <strong>Levey 原始 MDRD（7 變項）：</strong>
          加入白蛋白（Alb）和血尿素氮（BUN），在低 GFR 族群（&lt;
          60）準確度優於簡化版，適合腎臟科詳細評估。
        </template>
      </div>
    </div>

    <!-- ── Shared inputs ──────────────────────────────────────── -->
    <div class="nihss-group">
      <div class="group-header-bar shared-bar">
        <span class="group-icon">🩺</span>
        <span class="group-label-text">基本資料</span>
        <span class="group-sub-text">兩版公式共用</span>
        <span class="group-score-tally shared-tally">
          {{ gfr !== null ? gfr + " mL/min/1.73m²" : "—" }}
        </span>
      </div>

      <div class="group-items">
        <!-- Creatinine -->
        <div
          class="nihss-item"
          :class="{ scored: Cr !== null, 'mdrd-scored': Cr !== null }"
        >
          <div class="item-header">
            <div class="item-meta-row">
              <span class="item-qnum mdrd-qnum">Cr</span>
            </div>
            <div class="item-name-block">
              <span class="item-name">血清肌酸酐 Serum Creatinine</span>
              <span class="item-sub"
                >由血液生化報告取得，正常值男 0.7–1.2 mg/dL、女 0.5–1.0
                mg/dL</span
              >
            </div>
            <span class="item-score" :class="{ zero: Cr === null }">
              {{ Cr !== null ? Cr + " mg/dL" : "—" }}
            </span>
          </div>
          <div class="input-row">
            <input
              v-model="crVal"
              type="number"
              min="0.1"
              max="30"
              step="0.1"
              placeholder="mg/dL"
              class="mdrd-input"
            />
            <span class="input-unit">mg/dL</span>
          </div>
        </div>

        <!-- Age -->
        <div
          class="nihss-item"
          :class="{ scored: Age !== null, 'mdrd-scored': Age !== null }"
        >
          <div class="item-header">
            <div class="item-meta-row">
              <span class="item-qnum mdrd-qnum">Age</span>
            </div>
            <div class="item-name-block">
              <span class="item-name">年齡 Age</span>
              <span class="item-sub"
                >MDRD 公式適用於 18 歲以上成人，不適用於兒童</span
              >
            </div>
            <span class="item-score" :class="{ zero: Age === null }">
              {{ Age !== null ? Age + " 歲" : "—" }}
            </span>
          </div>
          <div class="input-row">
            <input
              v-model="ageVal"
              type="number"
              min="18"
              max="100"
              step="1"
              placeholder="歲"
              class="mdrd-input"
            />
            <span class="input-unit">歲</span>
          </div>
        </div>

        <!-- Gender -->
        <div class="nihss-item mdrd-toggle-item">
          <div class="item-header">
            <div class="item-meta-row">
              <span class="item-qnum mdrd-qnum">Sex</span>
            </div>
            <div class="item-name-block">
              <span class="item-name">性別 Gender</span>
              <span class="item-sub"
                >女性係數：Greene × 0.742，Levey × 0.762</span
              >
            </div>
            <span class="item-score">{{
              gender === "M" ? "♂ 男性" : "♀ 女性"
            }}</span>
          </div>
          <div class="toggle-row">
            <button
              class="btn-male"
              :class="{ 'active-m': gender === 'M' }"
              @click="gender = 'M'"
            >
              ♂ 男性
            </button>
            <button
              class="btn-female"
              :class="{ 'active-f': gender === 'F' }"
              @click="gender = 'F'"
            >
              ♀ 女性
            </button>
          </div>
        </div>

        <!-- African -->
        <div class="nihss-item mdrd-toggle-item">
          <div class="item-header">
            <div class="item-meta-row">
              <span class="item-qnum mdrd-qnum">Race</span>
            </div>
            <div class="item-name-block">
              <span class="item-name">非洲裔 African Origin</span>
              <span class="item-sub"
                >非洲裔係數：Greene × 1.212，Levey × 1.180</span
              >
            </div>
            <span class="item-score">{{ african ? "是" : "否" }}</span>
          </div>
          <div class="toggle-row">
            <button
              class="btn-race-yes"
              :class="{ 'active-race-yes': african }"
              @click="african = true"
            >
              是
            </button>
            <button
              class="btn-race-no"
              :class="{ 'active-race-no': !african }"
              @click="african = false"
            >
              否
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- ── Levey-only inputs ──────────────────────────────────── -->
    <transition name="slide-down">
      <div v-if="method === 'levey'" class="nihss-group">
        <div class="group-header-bar levey-bar">
          <span class="group-icon">🧫</span>
          <span class="group-label-text">Levey 公式額外輸入</span>
          <span class="group-sub-text">僅 Levey 7-var 需要</span>
        </div>

        <div class="group-items">
          <!-- Albumin -->
          <div
            class="nihss-item"
            :class="{ scored: Alb !== null, 'mdrd-scored': Alb !== null }"
          >
            <div class="item-header">
              <div class="item-meta-row">
                <span class="item-qnum levey-qnum">Alb</span>
              </div>
              <div class="item-name-block">
                <span class="item-name">白蛋白 Serum Albumin</span>
                <span class="item-sub">血清白蛋白，正常值 3.5–5.0 g/dL</span>
              </div>
              <span class="item-score" :class="{ zero: Alb === null }">
                {{ Alb !== null ? Alb + " g/dL" : "—" }}
              </span>
            </div>
            <div class="input-row">
              <input
                v-model="albVal"
                type="number"
                min="0.1"
                max="10"
                step="0.1"
                placeholder="g/dL"
                class="mdrd-input"
              />
              <span class="input-unit">g/dL</span>
            </div>
          </div>

          <!-- BUN -->
          <div
            class="nihss-item"
            :class="{ scored: BUN !== null, 'mdrd-scored': BUN !== null }"
          >
            <div class="item-header">
              <div class="item-meta-row">
                <span class="item-qnum levey-qnum">BUN</span>
              </div>
              <div class="item-name-block">
                <span class="item-name">血尿素氮 Blood Urea Nitrogen</span>
                <span class="item-sub"
                  >由血液生化報告取得，正常值 7–20 mg/dL</span
                >
              </div>
              <span class="item-score" :class="{ zero: BUN === null }">
                {{ BUN !== null ? BUN + " mg/dL" : "—" }}
              </span>
            </div>
            <div class="input-row">
              <input
                v-model="bunVal"
                type="number"
                min="1"
                max="200"
                step="0.1"
                placeholder="mg/dL"
                class="mdrd-input"
              />
              <span class="input-unit">mg/dL</span>
            </div>
          </div>
        </div>
      </div>
    </transition>

    <!-- ── Formula display ────────────────────────────────────── -->
    <div class="formula-box">
      <span class="formula-label">公式：</span>
      <span class="formula-text">GFR = {{ formulaText }}</span>
    </div>

    <!-- ── Reference table ───────────────────────────────────── -->
    <div class="ref-table">
      <div class="rt-row rt-header">
        <span>分期</span><span>eGFR</span><span>描述</span><span>追蹤頻率</span>
      </div>
      <div
        class="rt-row"
        v-for="s in [
          {
            ckd: 'G1',
            range: '≥ 90',
            label: '正常或偏高',
            color: 'normal',
            freq: '每年',
          },
          {
            ckd: 'G2',
            range: '60–89',
            label: '輕度下降',
            color: 'normal',
            freq: '每年',
          },
          {
            ckd: 'G3a',
            range: '45–59',
            label: '輕中度下降',
            color: 'mild',
            freq: '每 6 個月',
          },
          {
            ckd: 'G3b',
            range: '30–44',
            label: '中重度下降',
            color: 'moderate',
            freq: '每 3–6 個月',
          },
          {
            ckd: 'G4',
            range: '15–29',
            label: '重度下降',
            color: 'severe',
            freq: '每 3 個月',
          },
          {
            ckd: 'G5',
            range: '< 15',
            label: '腎衰竭',
            color: 'critical',
            freq: '腎替代療法',
          },
        ]"
        :key="s.ckd"
        :class="{ 'rt-active': stage.ckd === s.ckd && gfr !== null }"
      >
        <span class="rt-s" :class="s.color + '-t'">{{ s.ckd }}</span>
        <span class="rt-range">{{ s.range }}</span>
        <span>{{ s.label }}</span>
        <span class="rt-sm">{{ s.freq }}</span>
      </div>
    </div>

    <!-- ── Result card ────────────────────────────────────────── -->
    <div class="nihss-result" :class="stage.color">
      <div class="result-left">
        <span class="result-number">{{ gfr !== null ? gfr : "—" }}</span>
        <span class="result-max" v-if="gfr !== null">mL/min/1.73m²</span>
      </div>
      <div class="result-right">
        <span class="result-ckd">CKD {{ stage.ckd }}</span>
        <span class="result-level">{{ stage.label }}</span>
        <span class="result-advice" v-if="stage.action">{{
          stage.action
        }}</span>
      </div>
    </div>

    <!-- ── Comparison card ────────────────────────────────────── -->
    <div class="compare-card" v-if="bothAvailable">
      <div class="compare-header">兩公式結果比較</div>
      <div class="compare-row">
        <div
          class="compare-item"
          :class="{ 'compare-active': method === 'greene' }"
        >
          <span class="ci-name">Greene（4-var）</span>
          <span class="ci-val">{{ greeneGfr }}</span>
          <span class="ci-unit">mL/min/1.73m²</span>
          <span class="ci-ckd">{{ getStage(greeneGfr).ckd }}</span>
        </div>
        <div class="compare-divider">
          <span
            class="diff-val"
            :class="diff! > 0 ? 'diff-pos' : diff! < 0 ? 'diff-neg' : ''"
          >
            {{ diff! > 0 ? "+" : "" }}{{ diff }}
          </span>
          <span class="diff-label">差值</span>
        </div>
        <div
          class="compare-item"
          :class="{ 'compare-active': method === 'levey' }"
        >
          <span class="ci-name">Levey（7-var）</span>
          <span class="ci-val">{{ leveyGfr }}</span>
          <span class="ci-unit">mL/min/1.73m²</span>
          <span class="ci-ckd">{{ getStage(leveyGfr).ckd }}</span>
        </div>
      </div>
    </div>

    <!-- ── Clinical note ──────────────────────────────────────── -->
    <div class="warn-box">
      <span class="warn-icon">⚠</span>
      <span
        >MDRD 公式在 GFR &gt; 60 時傾向低估，此時建議改用 CKD-EPI 公式。MDRD
        不適用於孕婦、兒童、極端體型或急性腎損傷患者。</span
      >
    </div>

    <!-- ── Results detail ─────────────────────────────────────── -->
    <div v-if="showResults" class="results-detail">
      <div class="results-header">評估明細</div>

      <div class="detail-row">
        <span class="detail-qnum">Cr</span>
        <span class="detail-domain">血清肌酸酐（Serum Creatinine）</span>
        <span class="detail-score">{{ Cr !== null ? Cr : "—" }}</span>
        <span class="detail-desc">mg/dL</span>
      </div>

      <div class="detail-row">
        <span class="detail-qnum">Age</span>
        <span class="detail-domain">年齡（Age）</span>
        <span class="detail-score">{{ Age !== null ? Age : "—" }}</span>
        <span class="detail-desc">歲</span>
      </div>

      <div class="detail-row">
        <span class="detail-qnum">Sex</span>
        <span class="detail-domain">性別係數</span>
        <span class="detail-score">{{
          gender === "M" ? "1.000" : method === "greene" ? "0.742" : "0.762"
        }}</span>
        <span class="detail-desc">{{ gender === "M" ? "男性" : "女性" }}</span>
      </div>

      <div class="detail-row">
        <span class="detail-qnum">Race</span>
        <span class="detail-domain">種族係數</span>
        <span class="detail-score">{{
          african ? (method === "greene" ? "1.212" : "1.180") : "1.000"
        }}</span>
        <span class="detail-desc">{{ african ? "非洲裔" : "非非洲裔" }}</span>
      </div>

      <template v-if="method === 'levey'">
        <div class="detail-row">
          <span class="detail-qnum">Alb</span>
          <span class="detail-domain">白蛋白（Serum Albumin）</span>
          <span class="detail-score">{{ Alb !== null ? Alb : "—" }}</span>
          <span class="detail-desc">g/dL</span>
        </div>

        <div class="detail-row">
          <span class="detail-qnum">BUN</span>
          <span class="detail-domain">血尿素氮（Blood Urea Nitrogen）</span>
          <span class="detail-score">{{ BUN !== null ? BUN : "—" }}</span>
          <span class="detail-desc">mg/dL</span>
        </div>
      </template>

      <div class="detail-row">
        <span class="detail-qnum">方法</span>
        <span class="detail-domain">使用公式</span>
        <span class="detail-score" style="width: 80px; font-size: 0.7rem">{{
          method === "greene" ? "Greene" : "Levey"
        }}</span>
        <span class="detail-desc">{{
          method === "greene" ? "4-var" : "7-var"
        }}</span>
      </div>

      <div class="detail-row detail-total">
        <span class="detail-qnum">eGFR</span>
        <span class="detail-domain">腎絲球過濾率（最終結果）</span>
        <span class="detail-score detail-score-brand">{{
          gfr !== null ? gfr : "—"
        }}</span>
        <div class="detail-desc detail-desc-block">
          <span class="detail-desc-unit">mL/min</span>
          <span class="detail-desc-label">CKD {{ stage.ckd }}</span>
        </div>
      </div>
    </div>

    <!-- ── Actions ────────────────────────────────────────────── -->
    <div class="nihss-actions">
      <button class="btn-view" @click="showResults = !showResults">
        {{ showResults ? "收起明細" : "查看評估結果" }}
      </button>
      <button class="btn-copy" :disabled="!isComplete" @click="copyOutput">
        {{ copied ? "已複製 ✓" : "複製 Markdown 結果" }}
      </button>
      <button class="btn-reset" @click="reset">重置</button>
    </div>
  </div>
</template>

<style scoped>
.mdrd {
  max-width: 780px;
  margin: 0 auto;
  padding: 2rem 0 3rem;
  font-size: 0.9rem;
}

/* ── Header ────────────────────────────────────────────────────── */
.mdrd-header {
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
  font-size: 0.75rem;
  color: var(--vp-c-text-3);
  margin: 0;
  line-height: 1.6;
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
.badge-label {
  font-size: 0.62rem;
  font-weight: 700;
  letter-spacing: 0.06em;
  color: var(--vp-c-text-3);
  margin-bottom: 1px;
}
.score-number {
  font-size: 1.9rem;
  font-weight: 800;
  line-height: 1;
}
.score-unit {
  font-size: 0.6rem;
  font-weight: 600;
  margin-top: 1px;
}
.score-label {
  font-size: 0.65rem;
  font-weight: 600;
  margin-top: 3px;
  text-align: center;
}

.score-badge.pending {
  border-color: var(--vp-c-divider);
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
.score-badge.critical {
  border-color: #ef4444;
  color: #ef4444;
  box-shadow:
    0 0 0 1px rgba(239, 68, 68, 0.08),
    0 1px 3px rgba(0, 0, 0, 0.04);
}

/* ── Severity bar ──────────────────────────────────────────────── */
.severity-bar-wrap {
  margin-bottom: 2rem;
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
    width 0.4s ease,
    background 0.3s;
}
.severity-fill.pending {
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
.severity-fill.severe {
  background: linear-gradient(90deg, #ef4444, #f87171);
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
  margin-top: 0px;
  height: 13px;
}

.tick-abs {
  position: absolute;
  transform: translateX(-50%);
  font-size: 0.65rem;
  color: var(--vp-c-text-3);
  white-space: nowrap;
  font-weight: 700;
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

.tick-abs.red,
.label-abs.red {
  color: #ef4444;
}
.tick-abs.orange,
.label-abs.orange {
  color: #f97316;
}
.tick-abs.yellow,
.label-abs.yellow {
  color: #f59e0b;
}
.tick-abs.green,
.label-abs.green {
  color: #22c55e;
}

/* ── Groups ────────────────────────────────────────────────────── */
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
  border-left: 3px solid #eab308;
  margin-bottom: 0.6rem;
}
.method-bar {
  border-left: 3px solid #6366f1;
}
.shared-bar {
  border-left: 3px solid #3b82f6;
}
.levey-bar {
  border-left: 3px solid #14b8a6;
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
.shared-tally {
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
  min-width: 140px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 3px;
  padding: 0.65rem 1rem;
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
  font-size: 0.88rem;
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
  color: rgba(99, 102, 241, 0.65);
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
.note-greene {
  background: rgba(99, 102, 241, 0.04);
  border-color: rgba(99, 102, 241, 0.2);
}
.note-levey {
  background: rgba(20, 184, 166, 0.04);
  border-color: rgba(20, 184, 166, 0.2);
}

/* ── Group items ───────────────────────────────────────────────── */
.group-items {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

/* ── Item card ─────────────────────────────────────────────────── */
.nihss-item {
  border: 1px solid var(--vp-c-divider);
  border-radius: 10px;
  background: var(--vp-c-bg-soft);
  overflow: hidden;
  transition: all 0.25s;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.03);
}
.nihss-item:hover {
  box-shadow: 0 3px 12px rgba(0, 0, 0, 0.06);
  border-color: var(--vp-c-divider);
}
.nihss-item.mdrd-scored {
  border-color: #3b82f6;
}
.mdrd-toggle-item {
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
.mdrd-toggle-item .item-header {
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
  padding: 1px 6px;
  border-radius: 999px;
  letter-spacing: 0.03em;
  white-space: nowrap;
}
.mdrd-qnum {
  color: #3b82f6;
  background: rgba(59, 130, 246, 0.12);
}
.levey-qnum {
  color: #14b8a6;
  background: rgba(20, 184, 166, 0.12);
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
  font-size: 0.85rem;
  font-weight: 800;
  color: #3b82f6;
  min-width: 28px;
  text-align: right;
  white-space: nowrap;
}
.item-score.zero {
  color: var(--vp-c-text-3);
}

/* ── Toggle rows inside items ──────────────────────────────────── */
.toggle-row {
  display: flex;
  gap: 0.4rem;
  padding: 0.5rem 0.9rem;
  flex-wrap: wrap;
}

.toggle-row button {
  padding: 5px 16px;
  border-radius: 7px;
  border: 1.5px solid var(--vp-c-divider);
  background: var(--vp-c-bg-soft);
  font-size: 0.82rem;
  font-weight: 600;
  cursor: pointer;
  font-family: inherit;
  color: var(--vp-c-text-2);
  transition: all 0.15s;
}

.btn-male.active-m {
  border-color: #38bdf8;
  color: #38bdf8;
  background: rgba(56, 189, 248, 0.07);
}
.btn-female.active-f {
  border-color: #f472b6;
  color: #f472b6;
  background: rgba(244, 114, 182, 0.07);
}
.btn-race-yes.active-race-yes {
  border-color: #f97316;
  color: #f97316;
  background: rgba(249, 115, 22, 0.07);
}
.btn-race-no.active-race-no {
  border-color: #6366f1;
  color: #6366f1;
  background: rgba(99, 102, 241, 0.07);
}

/* ── Input row ─────────────────────────────────────────────────── */
.input-row {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.65rem 0.9rem;
}
.mdrd-input {
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
.mdrd-input::-webkit-outer-spin-button,
.mdrd-input::-webkit-inner-spin-button {
  -webkit-appearance: none;
}
.mdrd-input:focus {
  border-color: #3b82f6;
}
.mdrd-input::placeholder {
  color: var(--vp-c-text-3);
  font-size: 0.82rem;
}

.input-unit {
  font-size: 0.78rem;
  font-weight: 600;
  color: var(--vp-c-text-3);
  flex-shrink: 0;
}

/* ── Slide animation for Levey section ─────────────────────────── */
.slide-down-enter-active,
.slide-down-leave-active {
  transition: all 0.25s ease;
  overflow: hidden;
}
.slide-down-enter-from,
.slide-down-leave-to {
  opacity: 0;
  transform: translateY(-8px);
  max-height: 0;
}
.slide-down-enter-to,
.slide-down-leave-from {
  opacity: 1;
  transform: translateY(0);
  max-height: 400px;
}

/* ── Formula box ───────────────────────────────────────────────── */
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
  font-size: 0.8rem;
}
.formula-label {
  font-weight: 700;
  color: var(--vp-c-text-2);
  flex-shrink: 0;
}
.formula-text {
  color: var(--vp-c-text-2);
  font-family: monospace;
  line-height: 1.6;
}

/* ── Reference table ───────────────────────────────────────────── */
.ref-table {
  border: 1px solid var(--vp-c-divider);
  border-radius: 10px;
  overflow: hidden;
  margin-bottom: 1rem;
}
.rt-row {
  display: grid;
  grid-template-columns: 50px 70px 1fr 90px;
  gap: 0.5rem;
  padding: 0.4rem 0.9rem;
  border-bottom: 1px solid var(--vp-c-divider);
  font-size: 0.78rem;
  align-items: center;
}
.rt-row:last-child {
  border-bottom: none;
}
.rt-header {
  background: var(--vp-c-bg-mute);
  font-size: 0.7rem;
  font-weight: 700;
  color: var(--vp-c-text-3);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}
.rt-active {
  background: var(--vp-c-brand-soft);
}
.rt-s {
  font-weight: 800;
  font-family: monospace;
}
.rt-range {
  font-size: 0.72rem;
  font-family: monospace;
  color: var(--vp-c-text-2);
}
.rt-sm {
  font-size: 0.7rem;
  color: var(--vp-c-text-3);
}
.normal-t {
  color: #22c55e;
}
.mild-t {
  color: #f59e0b;
}
.moderate-t {
  color: #f97316;
}
.severe-t {
  color: #ef4444;
}
.critical-t {
  color: #ef4444;
}

/* ── Result card ───────────────────────────────────────────────── */
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
.nihss-result.pending {
  border-color: var(--vp-c-divider);
}
.nihss-result.normal {
  border-color: #22c55e;
  box-shadow:
    0 0 0 1px rgba(34, 197, 94, 0.06),
    0 1px 3px rgba(0, 0, 0, 0.04);
}
.nihss-result.mild {
  border-color: #f59e0b;
  box-shadow:
    0 0 0 1px rgba(245, 158, 11, 0.06),
    0 1px 3px rgba(0, 0, 0, 0.04);
}
.nihss-result.moderate {
  border-color: #f97316;
  box-shadow:
    0 0 0 1px rgba(249, 115, 22, 0.06),
    0 1px 3px rgba(0, 0, 0, 0.04);
}
.nihss-result.severe {
  border-color: #ef4444;
  box-shadow:
    0 0 0 1px rgba(239, 68, 68, 0.06),
    0 1px 3px rgba(0, 0, 0, 0.04);
}
.nihss-result.critical {
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
.nihss-result.normal .result-number {
  color: #22c55e;
}
.nihss-result.mild .result-number {
  color: #f59e0b;
}
.nihss-result.moderate .result-number {
  color: #f97316;
}
.nihss-result.severe .result-number {
  color: #ef4444;
}
.nihss-result.critical .result-number {
  color: #ef4444;
}

.result-max {
  font-size: 0.8rem;
  color: var(--vp-c-text-3);
}
.result-right {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.result-ckd {
  font-size: 1rem;
  font-weight: 800;
  color: var(--vp-c-text-1);
}
.result-level {
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--vp-c-text-1);
}
.result-advice {
  font-size: 0.82rem;
  color: var(--vp-c-text-2);
  line-height: 1.5;
}

/* ── Comparison card ───────────────────────────────────────────── */
.compare-card {
  border: 1px solid var(--vp-c-divider);
  border-radius: 12px;
  overflow: hidden;
  margin-bottom: 1rem;
  background: var(--vp-c-bg-soft);
}
.compare-header {
  padding: 0.4rem 0.9rem;
  font-size: 0.7rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--vp-c-text-3);
  background: var(--vp-c-bg-mute);
  border-bottom: 1px solid var(--vp-c-divider);
}
.compare-row {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  padding: 0.9rem;
  gap: 0.75rem;
}
.compare-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 3px;
  padding: 0.65rem;
  border-radius: 9px;
  border: 1.5px solid var(--vp-c-divider);
  transition: all 0.2s;
}
.compare-item.compare-active {
  border-color: var(--vp-c-brand-1);
  background: var(--vp-c-brand-soft);
}
.ci-name {
  font-size: 0.7rem;
  font-weight: 700;
  color: var(--vp-c-text-2);
}
.ci-val {
  font-size: 1.5rem;
  font-weight: 800;
  color: var(--vp-c-text-1);
  line-height: 1;
}
.compare-item.compare-active .ci-val {
  color: var(--vp-c-brand-1);
}
.ci-unit {
  font-size: 0.6rem;
  color: var(--vp-c-text-3);
}
.ci-ckd {
  font-size: 0.72rem;
  font-weight: 700;
  color: var(--vp-c-brand-1);
  margin-top: 2px;
}
.compare-divider {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 3px;
}
.diff-val {
  font-size: 1rem;
  font-weight: 800;
}
.diff-pos {
  color: #22c55e;
}
.diff-neg {
  color: #ef4444;
}
.diff-label {
  font-size: 0.6rem;
  color: var(--vp-c-text-3);
}

/* ── Warning / clinical note ───────────────────────────────────── */
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
  font-size: 0.9rem;
}

/* ── Results detail ────────────────────────────────────────────── */
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
  white-space: normal;
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

/* ── Actions ───────────────────────────────────────────────────── */
.nihss-actions {
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

@media (max-width: 640px) {
  .mdrd-header {
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
  .nihss-result {
    flex-direction: column;
    gap: 0.75rem;
  }
  .tab-toggle {
    flex-direction: column;
  }
  .compare-row {
    grid-template-columns: 1fr;
  }
  .compare-divider {
    flex-direction: row;
    gap: 0.5rem;
  }
  .rt-row {
    grid-template-columns: 46px 60px 1fr;
  }
  .rt-row span:last-child {
    display: none;
  }
}
</style>
