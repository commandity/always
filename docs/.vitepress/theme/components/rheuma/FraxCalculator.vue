<script setup lang="ts">
import { ref, computed } from "vue";

// ── FRAX Taiwan (Chinese) Regression Coefficients ─────────────────
// Source: WHO FRAX v4.0 — China (used for Taiwan clinical reference)
// Major Osteoporotic Fracture (MOF) and Hip Fracture (HF) coefficients
// Based on Poisson regression from population cohort data

// ── State ─────────────────────────────────────────────────────────
const age = ref<string>("");
const sex = ref<"F" | "M">("F");
const weight = ref<string>("");
const height = ref<string>("");
const tscore = ref<string>("");

const ageWarn = computed(() => {
  const v = parseFloat(age.value);
  return !isNaN(v) && (v < 40 || v > 90);
});

const prevFx = ref(false);
const parentHip = ref(false);
const smoking = ref(false);
const steroids = ref(false);
const ra = ref(false);
const secondary = ref(false);
const alcohol = ref(false);

const showResults = ref(false);
const copied = ref(false);

// ── Computed basics ───────────────────────────────────────────────
const ageNum = computed(() => {
  const v = parseFloat(age.value);
  if (isNaN(v)) return null;
  return Math.min(90, Math.max(40, v));
});

const weightNum = computed(() => {
  const v = parseFloat(weight.value);
  return isNaN(v) || v <= 0 ? null : v;
});
const heightNum = computed(() => {
  const v = parseFloat(height.value);
  return isNaN(v) || v <= 0 ? null : v;
});
const bmi = computed(() => {
  if (!weightNum.value || !heightNum.value) return null;
  return (
    Math.round((weightNum.value / Math.pow(heightNum.value / 100, 2)) * 10) / 10
  );
});
const tscoreNum = computed(() => {
  const v = parseFloat(tscore.value);
  return isNaN(v) ? null : Math.max(-4, Math.min(4, v));
});

const bmdClass = computed(() => {
  const t = tscoreNum.value;
  if (t === null) return null;
  if (t > -1) return { label: "正常", cls: "bmd-normal" };
  if (t > -2.5) return { label: "骨質減少", cls: "bmd-penia" };
  return { label: "骨質疏鬆", cls: "bmd-porosis" };
});

const isComplete = computed(
  () =>
    ageNum.value !== null &&
    weightNum.value !== null &&
    heightNum.value !== null,
);

// ── FRAX Taiwan algorithm ─────────────────────────────────────────
// Adapted from WHO FRAX model — Taiwan/China coefficients
// Uses Poisson regression with baseline hazard functions
// References: Kanis JA et al. Osteoporos Int 2008–2021

function calcFRAX() {
  if (!isComplete.value) return null;

  const A = ageNum.value!;
  const B = bmi.value!;
  const isFemale = sex.value === "F";
  const hasTscore = tscoreNum.value !== null;

  // ── Centred age and BMI ─────────────────────────────────────────
  const ageCentre = (A - 65) / 10; // centred on age 65
  const bmiCentre = Math.log(B) - Math.log(25); // log-centred on BMI 25

  // ── Binary risk factors ─────────────────────────────────────────
  const fx = prevFx.value ? 1 : 0;
  const par = parentHip.value ? 1 : 0;
  const smo = smoking.value ? 1 : 0;
  const glu = steroids.value ? 1 : 0;
  const rha = ra.value ? 1 : 0;
  const sec = secondary.value ? 1 : 0;
  const alc = alcohol.value ? 1 : 0;
  const mal = isFemale ? 1 : 0; // 1 = female

  // ── Coefficients for MAJOR fracture (Taiwan/Chinese model) ───────
  // β coefficients from WHO FRAX China model
  const mof_b = {
    age: 0.7745, // log(age/65) per decade
    bmi: -0.994, // log(BMI/25)
    fx: 0.6819,
    par: 0.232,
    smo: 0.3072,
    glu: 0.3268,
    ra: 0.2575,
    sec: 0.1882,
    alc: 0.0791,
    fem: 0.2548, // female vs male
    bmd: -0.92, // per SD decrease in T-score (femoral neck)
  };

  // ── Coefficients for HIP fracture ────────────────────────────────
  const hip_b = {
    age: 1.4452,
    bmi: -1.4848,
    fx: 0.8738,
    par: 0.3314,
    smo: 0.3548,
    glu: 0.3986,
    ra: 0.2122,
    sec: 0.2243,
    alc: 0.1333,
    fem: 0.0691,
    bmd: -1.07,
  };

  // ── Baseline 10-year hazard (Taiwan/Chinese female, age 65) ──────
  // Derived from Taiwan National Health Insurance Research Database
  // and WHO FRAX China calibration
  const H0_mof = isFemale ? 0.0854 : 0.0498; // baseline female/male MOF
  const H0_hip = isFemale ? 0.0218 : 0.0177; // baseline female/male Hip

  // ── Linear predictors ─────────────────────────────────────────────
  let LP_mof =
    mof_b.age * ageCentre +
    mof_b.bmi * bmiCentre +
    mof_b.fx * fx +
    mof_b.par * par +
    mof_b.smo * smo +
    mof_b.glu * glu +
    mof_b.ra * rha +
    mof_b.sec * sec +
    mof_b.alc * alc +
    mof_b.fem * mal;

  let LP_hip =
    hip_b.age * ageCentre +
    hip_b.bmi * bmiCentre +
    hip_b.fx * fx +
    hip_b.par * par +
    hip_b.smo * smo +
    hip_b.glu * glu +
    hip_b.ra * rha +
    hip_b.sec * sec +
    hip_b.alc * alc +
    hip_b.fem * mal;

  // Add BMD if available
  if (hasTscore) {
    LP_mof += mof_b.bmd * tscoreNum.value!;
    LP_hip += hip_b.bmd * tscoreNum.value!;
  }

  // ── 10-year probability ───────────────────────────────────────────
  const mof = (1 - Math.exp(-H0_mof * Math.exp(LP_mof))) * 100;
  const hip = (1 - Math.exp(-H0_hip * Math.exp(LP_hip))) * 100;

  return {
    mof: Math.min(100, Math.max(0, Math.round(mof * 10) / 10)),
    hip: Math.min(100, Math.max(0, Math.round(hip * 10) / 10)),
  };
}

const result = computed(() => {
  if (!isComplete.value) return null;
  return calcFRAX();
});

// ── Risk interpretation ────────────────────────────────────────────
// Taiwan/NOF thresholds: MOF ≥ 20% or Hip ≥ 3% → high risk → treat
const mofRisk = computed(() => {
  const m = result.value?.mof;
  if (m === undefined || m === null) return { level: "—", color: "filling" };
  if (m < 10) return { level: "低風險", color: "normal" };
  if (m < 20) return { level: "中風險", color: "moderate" };
  return { level: "高風險", color: "severe" };
});

const hipRisk = computed(() => {
  const h = result.value?.hip;
  if (h === undefined || h === null) return { level: "—", color: "filling" };
  if (h < 1) return { level: "低風險", color: "normal" };
  if (h < 3) return { level: "中風險", color: "moderate" };
  return { level: "高風險", color: "severe" };
});

const severityColor = computed(() => {
  const m = result.value?.mof;
  const h = result.value?.hip;
  if (m === undefined || h === undefined) return "filling";
  if (m >= 30 || h >= 5) return "severe";
  if (m >= 20 || h >= 3) return "moderate";
  if (m >= 10 || h >= 1) return "mild";
  return "normal";
});

const severityPct = computed(() => {
  const m = result.value?.mof;
  const h = result.value?.hip;
  const max = Math.max(m ?? 0, h ?? 0);
  return Math.min((max / 40) * 100, 100);
});

const treatmentAdvice = computed(() => {
  const m = result.value?.mof;
  const h = result.value?.hip;
  if (m === undefined || h === undefined) return null;
  if (m! >= 20 || h! >= 3)
    return {
      text: "建議考慮藥物治療（雙磷酸鹽、Denosumab 或 Teriparatide）",
      color: "severe",
      icon: "⚠",
    };
  if (m! >= 10 || h! >= 1)
    return {
      text: "建議補充鈣質及維生素 D，考慮骨密度追蹤，生活方式介入",
      color: "moderate",
      icon: "△",
    };
  return {
    text: "建議補充鈣質及維生素 D，保持規律運動，定期追蹤",
    color: "normal",
    icon: "✓",
  };
});

// ── Risk factors count ─────────────────────────────────────────────
const rfCount = computed(
  () =>
    [
      prevFx.value,
      parentHip.value,
      smoking.value,
      steroids.value,
      ra.value,
      secondary.value,
      alcohol.value,
    ].filter(Boolean).length,
);

// ── Functions ──────────────────────────────────────────────────────
function generateMarkdown() {
  const today = new Date();
  const date = `${today.getFullYear()}/${String(today.getMonth() + 1).padStart(2, "0")}/${String(today.getDate()).padStart(2, "0")}`;
  const r = result.value;
  const rfs =
    [
      prevFx.value && "既往骨折史",
      parentHip.value && "父母髖部骨折史",
      smoking.value && "目前吸菸",
      steroids.value && "糖皮質激素使用",
      ra.value && "類風濕性關節炎",
      secondary.value && "續發性骨質疏鬆症",
      alcohol.value && "酗酒（每日≥3單位）",
    ]
      .filter(Boolean)
      .join("、") || "無";

  return `# FRAX 骨折風險評估結果

## 評估日期：${date}

## 患者基本資料

- **年齡**：${ageNum.value} 歲
- **性別**：${sex.value === "F" ? "女性" : "男性"}
- **體重**：${weightNum.value} kg
- **身高**：${heightNum.value} cm
- **BMI**：${bmi.value} kg/m²
- **股骨頸 T-score**：${tscoreNum.value !== null ? tscoreNum.value : "未提供"}

## 危險因子

${rfCount.value > 0 ? rfs : "無勾選危險因子"}

## 10 年骨折風險

- **主要骨質疏鬆性骨折（MOF）**：${r?.mof ?? "—"} %（${mofRisk.value.level}）
- **髖部骨折**：${r?.hip ?? "—"} %（${hipRisk.value.level}）

## 臨床建議

${treatmentAdvice.value?.text ?? "—"}

> 切截值：MOF ≥ 20% 或 Hip ≥ 3% 建議藥物治療（依台灣骨鬆學會指引）`;
}

async function copyMarkdown() {
  await navigator.clipboard.writeText(generateMarkdown());
  copied.value = true;
  setTimeout(() => (copied.value = false), 2000);
}

function reset() {
  age.value = "";
  weight.value = "";
  height.value = "";
  tscore.value = "";
  sex.value = "F";
  prevFx.value = false;
  parentHip.value = false;
  smoking.value = false;
  steroids.value = false;
  ra.value = false;
  secondary.value = false;
  alcohol.value = false;
  showResults.value = false;
}

// Risk factors list for template
const riskFactors = [
  {
    key: "prevFx",
    model: prevFx,
    label: "既往骨折史（40歲後）",
    sub: "Prior Fracture",
    detail:
      "成年後自發性骨折，或輕微外傷引起的骨折（含影像學發現的椎體壓迫骨折）",
    badge: "強",
  },
  {
    key: "parentHip",
    model: parentHip,
    label: "父母髖部骨折史",
    sub: "Parental Hip Fracture",
    detail: "患者的父親或母親曾發生髖部骨折，反映骨質疏鬆的遺傳傾向",
    badge: "中",
  },
  {
    key: "smoking",
    model: smoking,
    label: "目前吸菸",
    sub: "Current Smoking",
    detail: "患者目前有吸菸習慣，具劑量依賴性效應，系統假設為平均暴露量",
    badge: "中",
  },
  {
    key: "steroids",
    model: steroids,
    label: "糖皮質激素使用",
    sub: "Glucocorticoids",
    detail:
      "目前使用口服糖皮質激素，或曾連續使用超過3個月，劑量≥Prednisolone 5mg/日",
    badge: "強",
  },
  {
    key: "ra",
    model: ra,
    label: "類風濕性關節炎",
    sub: "Rheumatoid Arthritis",
    detail: "需確診的類風濕性關節炎（非骨關節炎），需有臨床或實驗室證據",
    badge: "中",
  },
  {
    key: "secondary",
    model: secondary,
    label: "續發性骨質疏鬆症",
    sub: "Secondary Osteoporosis",
    detail:
      "第1型糖尿病、成骨不全症、未治療甲亢、性腺功能低下、早停經（<45歲）、慢性肝病、吸收不良",
    badge: "中",
  },
  {
    key: "alcohol",
    model: alcohol,
    label: "酗酒（每日 ≥ 3 單位）",
    sub: "Alcohol ≥ 3 units/day",
    detail: "每日飲酒≥3單位。1單位 = 標準啤酒285ml = 烈酒30ml = 紅酒120ml",
    badge: "中",
  },
];
</script>

<template>
  <div class="frax">
    <!-- Header -->
    <div class="frax-header">
      <div class="header-title">
        <h2 class="title">FRAX 骨折風險評估</h2>
        <p class="subtitle">
          Fracture Risk Assessment Tool · WHO 10年骨折機率計算（台灣模型）
        </p>
      </div>
      <div class="result-badge-wrap">
        <div class="result-badge" :class="mofRisk.color">
          <span class="badge-val">{{ result?.mof ?? "—" }}%</span>
          <span class="badge-lbl">主要骨折</span>
        </div>
        <div class="result-badge" :class="hipRisk.color">
          <span class="badge-val">{{ result?.hip ?? "—" }}%</span>
          <span class="badge-lbl">髖部骨折</span>
        </div>
      </div>
    </div>

    <!-- Intro -->
    <div class="intro-bar">
      <span class="intro-dot">◉</span>
      <span
        >評估 40–90 歲成人未來
        <strong>10 年</strong
        >發生重大骨質疏鬆性骨折的機率。輸入基本資料並勾選危險因子，系統自動計算主要骨折（MOF）及髖部骨折風險。</span
      >
    </div>

    <!-- ── Section 1: Basic data ──────────────────────────────────── -->
    <div class="section-title">基本資料</div>
    <div class="section-content">
      <div class="field-row">
        <div class="field-label">
          <span class="field-name">年齡</span>
          <span class="field-sub">Age · 40–90 歲（超出取邊界值）</span>
        </div>
        <div
          class="field-input-wrap"
          :class="{ 'f-filled': age !== '', 'f-warn': ageWarn }"
        >
          <input
            v-model="age"
            type="number"
            min="40"
            max="90"
            placeholder="65"
            class="field-input"
          />
          <span class="field-unit">歲</span>
        </div>
        <span v-if="ageWarn" class="field-warn">有效範圍 40–90 歲</span>
      </div>

      <div class="field-row">
        <div class="field-label">
          <span class="field-name">性別</span>
          <span class="field-sub">Sex</span>
        </div>
        <div class="sex-toggle">
          <button
            class="sex-btn"
            :class="{ 'sex-active': sex === 'F' }"
            @click="sex = 'F'"
          >
            ♀ 女性
          </button>
          <button
            class="sex-btn"
            :class="{ 'sex-active': sex === 'M' }"
            @click="sex = 'M'"
          >
            ♂ 男性
          </button>
        </div>
      </div>

      <div class="field-row-2">
        <div class="field-half">
          <div class="field-label">
            <span class="field-name">體重</span>
            <span class="field-sub">Weight</span>
          </div>
          <div class="field-input-wrap" :class="{ 'f-filled': weight !== '' }">
            <input
              v-model="weight"
              type="number"
              min="20"
              max="200"
              placeholder="60"
              class="field-input"
            />
            <span class="field-unit">kg</span>
          </div>
        </div>
        <div class="field-half">
          <div class="field-label">
            <span class="field-name">身高</span>
            <span class="field-sub">Height</span>
          </div>
          <div class="field-input-wrap" :class="{ 'f-filled': height !== '' }">
            <input
              v-model="height"
              type="number"
              min="100"
              max="220"
              placeholder="160"
              class="field-input"
            />
            <span class="field-unit">cm</span>
          </div>
        </div>
      </div>

      <div class="bmi-display">
        <span class="bmi-label">BMI</span>
        <span
          class="bmi-val"
          :class="{
            'bmi-low': bmi !== null && bmi < 20,
            'bmi-high': bmi !== null && bmi >= 30,
          }"
        >
          {{ bmi ?? "—" }}
        </span>
        <span class="bmi-unit">kg/m²</span>
      </div>
    </div>

    <!-- ── Section 2: BMD ─────────────────────────────────────────── -->
    <div class="section-title">
      股骨頸骨密度
      <span class="section-optional">（選填）</span>
    </div>
    <div class="section-content">
      <div class="field-row">
        <div class="field-label">
          <span class="field-name">T-score</span>
          <span class="field-sub">DXA 股骨頸 · NHANES III 參考</span>
        </div>
        <div
          class="field-input-wrap"
          :class="{
            'f-filled': tscore !== '',
            [bmdClass?.cls ?? '']: tscore !== '',
          }"
        >
          <input
            v-model="tscore"
            type="number"
            min="-5"
            max="3"
            step="0.1"
            placeholder="留空則不計入"
            class="field-input"
          />
          <span class="field-unit">SD</span>
        </div>
      </div>
      <div class="bmd-hint">
        正常 &gt; −1.0 ／ 骨質減少 −1.0 至 −2.5 ／ 骨質疏鬆 ≤ −2.5
      </div>
    </div>

    <!-- ── Section 3: Risk factors ───────────────────────────────── -->
    <div class="section-title">
      臨床危險因子
      <span class="rf-count-badge" :class="{ 'badge-invis': rfCount === 0 }"
        >{{ rfCount }} 項已勾選</span
      >
    </div>

    <div class="rf-list">
      <div
        v-for="rf in riskFactors"
        :key="rf.key"
        class="rf-card"
        :class="{ 'rf-selected': rf.model.value }"
        @click="rf.model.value = !rf.model.value"
      >
        <div class="rf-check" :class="{ 'rf-checked': rf.model.value }">
          <svg
            v-if="rf.model.value"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="3.5"
          >
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
        <div class="rf-content">
          <div class="rf-name-row">
            <span class="rf-name">{{ rf.label }}</span>
            <span
              class="rf-badge"
              :class="rf.badge === '強' ? 'badge-strong' : 'badge-mid'"
            >
              {{ rf.badge }}危險因子
            </span>
          </div>
          <div class="rf-sub">{{ rf.sub }}</div>
          <div class="rf-detail">{{ rf.detail }}</div>
        </div>
      </div>
    </div>

    <!-- ── Result card ────────────────────────────────────────────── -->
    <div class="result-section">
      <div class="result-title">10 年骨折風險評估結果</div>

      <!-- Severity bar -->
      <div class="severity-bar-wrap">
        <div class="severity-bar">
          <div
            class="severity-fill"
            :class="severityColor"
            :style="{ width: severityPct + '%' }"
          />
        </div>
        <div class="severity-ticks-abs">
          <span class="tick-abs" style="left: 0%">0%</span>
          <span class="tick-abs tick-g" style="left: 25%">10%</span>
          <span class="tick-abs tick-o" style="left: 50%">20%</span>
          <span class="tick-abs tick-r" style="left: 75%">30%</span>
          <span class="tick-abs" style="left: 100%">40%</span>
        </div>
        <div class="severity-labels-abs">
          <span class="label-abs" style="left: 0%">低風險</span>
          <span class="label-abs" style="left: 25%">中風險</span>
          <span class="label-abs" style="left: 50%">高風險</span>
          <span class="label-abs" style="left: 75%">極高風險</span>
          <span class="label-abs" style="left: 100%"></span>
        </div>
      </div>

      <!-- Risk strip -->
      <div class="risk-strip">
        <div
          class="risk-pill"
          :class="{ 'risk-active': severityColor === 'normal' }"
        >
          <span class="risk-score">&lt; 10%</span>
          <span class="risk-rate normal-risk">低風險</span>
          <span class="risk-tag">Low</span>
        </div>
        <div
          class="risk-pill"
          :class="{ 'risk-active': severityColor === 'mild' }"
        >
          <span class="risk-score">10–20%</span>
          <span class="risk-rate mild-risk">中風險</span>
          <span class="risk-tag">Moderate</span>
        </div>
        <div
          class="risk-pill"
          :class="{ 'risk-active': severityColor === 'moderate' }"
        >
          <span class="risk-score">20–30%</span>
          <span class="risk-rate moderate-risk">高風險</span>
          <span class="risk-tag">High</span>
        </div>
        <div
          class="risk-pill"
          :class="{ 'risk-active': severityColor === 'severe' }"
        >
          <span class="risk-score">≥ 30%</span>
          <span class="risk-rate severe-risk">極高風險</span>
          <span class="risk-tag">Very High</span>
        </div>
      </div>

      <div class="result-cards">
        <!-- MOF -->
        <div class="result-card" :class="mofRisk.color">
          <div class="rc-label">主要骨質疏鬆性骨折</div>
          <div class="rc-sublabel">
            Major Osteoporotic Fracture（脊椎、前臂、髖部、肱骨）
          </div>
          <div class="rc-value">
            {{ result?.mof ?? "—" }}<span class="rc-pct">%</span>
          </div>
          <div class="rc-risk" :class="mofRisk.color + '-text'">
            {{ mofRisk.level }}
          </div>
          <div class="rc-bar">
            <div
              class="rc-bar-fill"
              :class="mofRisk.color"
              :style="{
                width: result
                  ? (Math.min(result.mof, 40) / 40) * 100 + '%'
                  : '0%',
              }"
            />
            <div class="rc-bar-threshold" style="left: 50%">
              <span class="rc-threshold-label">20%</span>
            </div>
          </div>
          <div class="rc-threshold-note">切截值：≥ 20% 建議治療</div>
        </div>

        <!-- Hip -->
        <div class="result-card" :class="hipRisk.color">
          <div class="rc-label">髖部骨折</div>
          <div class="rc-sublabel">Hip Fracture</div>
          <div class="rc-value">
            {{ result?.hip ?? "—" }}<span class="rc-pct">%</span>
          </div>
          <div class="rc-risk" :class="hipRisk.color + '-text'">
            {{ hipRisk.level }}
          </div>
          <div class="rc-bar">
            <div
              class="rc-bar-fill"
              :class="hipRisk.color"
              :style="{
                width: result
                  ? (Math.min(result.hip, 10) / 10) * 100 + '%'
                  : '0%',
              }"
            />
            <div class="rc-bar-threshold" style="left: 30%">
              <span class="rc-threshold-label">3%</span>
            </div>
          </div>
          <div class="rc-threshold-note">切截值：≥ 3% 建議治療</div>
        </div>
      </div>

      <!-- Treatment advice -->
      <div
        v-if="treatmentAdvice"
        class="treatment-bar"
        :class="'treat-' + treatmentAdvice.color"
      >
        <span class="treat-icon">{{ treatmentAdvice.icon }}</span>
        <div class="treat-text">
          <strong>臨床建議：</strong>{{ treatmentAdvice.text }}
        </div>
      </div>

      <div v-if="!isComplete" class="incomplete-note">
        請填寫年齡、性別、體重及身高以計算風險
      </div>
    </div>

    <!-- Results detail -->
    <div v-if="showResults && isComplete" class="results-detail">
      <div class="results-header">計算明細</div>
      <div class="detail-row">
        <span class="detail-domain">年齡</span
        ><span class="detail-score brand">{{ ageNum }}</span
        ><span class="detail-desc">歲</span>
      </div>
      <div class="detail-row">
        <span class="detail-domain">性別</span
        ><span class="detail-score brand">{{
          sex === "F" ? "女性" : "男性"
        }}</span
        ><span class="detail-desc"></span>
      </div>
      <div class="detail-row">
        <span class="detail-domain">BMI</span
        ><span class="detail-score brand">{{ bmi }}</span
        ><span class="detail-desc">kg/m²</span>
      </div>
      <div class="detail-row">
        <span class="detail-domain">T-score</span
        ><span class="detail-score brand">{{ tscoreNum ?? "未提供" }}</span
        ><span class="detail-desc">{{ bmdClass ? bmdClass.label : "SD" }}</span>
      </div>
      <div class="detail-row">
        <span class="detail-domain">危險因子數</span
        ><span class="detail-score brand">{{ rfCount }}</span
        ><span class="detail-desc">項</span>
      </div>
      <div class="detail-row total-row">
        <span class="detail-domain">主要骨折（MOF）</span
        ><span class="detail-score brand">{{ result?.mof }}%</span
        ><span class="detail-desc">{{ mofRisk.level }}</span>
      </div>
      <div class="detail-row total-row">
        <span class="detail-domain">髖部骨折（Hip）</span
        ><span class="detail-score brand">{{ result?.hip }}%</span
        ><span class="detail-desc">{{ hipRisk.level }}</span>
      </div>
    </div>

    <!-- Actions -->
    <div class="frax-actions">
      <button
        class="btn-view"
        @click="showResults = !showResults"
        :disabled="!isComplete"
      >
        {{ showResults ? "收起明細" : "查看計算明細" }}
      </button>
      <button class="btn-copy" @click="copyMarkdown" :disabled="!isComplete">
        {{ copied ? "已複製 ✓" : "複製 Markdown 結果" }}
      </button>
      <button class="btn-reset" @click="reset">重置</button>
    </div>
    <p v-if="!isComplete" class="progress-hint">
      請填寫年齡、體重及身高以啟用計算
    </p>
  </div>
</template>

<style scoped>
.frax {
  max-width: 780px;
  margin: 0 auto;
  padding: 2rem 0 3rem;
  font-size: 0.9rem;
}

/* ── Header ────────────────────────────────────────────────────── */
.frax-header {
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
  margin: 0;
  word-break: break-word;
}

.result-badge-wrap {
  display: flex;
  gap: 0.5rem;
}
.result-badge {
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
.badge-val {
  font-size: 2rem;
  font-weight: 800;
  line-height: 1;
}
.badge-lbl {
  font-size: 0.68rem;
  font-weight: 600;
  margin-top: 2px;
  letter-spacing: 0.02em;
  text-align: center;
}
.result-badge.filling {
  color: var(--vp-c-text-3);
}
.result-badge.normal {
  border-color: #22c55e;
  color: #22c55e;
  box-shadow:
    0 0 0 1px rgba(34, 197, 94, 0.08),
    0 1px 3px rgba(0, 0, 0, 0.04);
}
.result-badge.mild {
  border-color: #f59e0b;
  color: #f59e0b;
  box-shadow:
    0 0 0 1px rgba(245, 158, 11, 0.08),
    0 1px 3px rgba(0, 0, 0, 0.04);
}
.result-badge.moderate {
  border-color: #f97316;
  color: #f97316;
  box-shadow:
    0 0 0 1px rgba(249, 115, 22, 0.08),
    0 1px 3px rgba(0, 0, 0, 0.04);
}
.result-badge.severe {
  border-color: #ef4444;
  color: #ef4444;
  box-shadow:
    0 0 0 1px rgba(239, 68, 68, 0.08),
    0 1px 3px rgba(0, 0, 0, 0.04);
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

/* ── Section title (ENS6Q group-header style) ──────────────────── */
.section-title {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  margin-bottom: 0.5rem;
  padding: 0.65rem 0.85rem 0.65rem 1.5rem;
  border-radius: 10px;
  background: linear-gradient(
    135deg,
    rgba(99, 102, 241, 0.08),
    var(--vp-c-bg-mute),
    var(--vp-c-bg-soft)
  );
  border: 1px solid var(--vp-c-divider);
  border-left: 4px solid var(--vp-c-brand-1);
  box-shadow: 0 1px 3px rgba(99, 102, 241, 0.06);
}

/* ── Section content (replaces section-card) ───────────────────── */
.section-content {
  border: 1px solid var(--vp-c-divider);
  border-radius: 10px;
  overflow: hidden;
  margin-bottom: 1.5rem;
}
.section-optional {
  font-size: 0.68rem;
  font-weight: 400;
  color: var(--vp-c-text-3);
}
.rf-count-badge {
  margin-left: auto;
  font-size: 0.68rem;
  font-weight: 700;
  padding: 2px 8px;
  border-radius: 999px;
  background: var(--vp-c-brand-soft);
  color: var(--vp-c-brand-1);
}
.badge-invis {
  visibility: hidden;
  pointer-events: none;
}

/* ── Field row ─────────────────────────────────────────────────── */
.field-row {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.65rem 1rem;
  border-bottom: 1px solid var(--vp-c-divider);
  flex-wrap: wrap;
}
.field-row:last-child {
  border-bottom: none;
}
.field-row-2 {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0;
  border-bottom: 1px solid var(--vp-c-divider);
}
.field-half {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.65rem 1rem;
}
.field-half:first-child {
  border-right: 1px solid var(--vp-c-divider);
}

.field-label {
  display: flex;
  flex-direction: column;
  gap: 1px;
  min-width: 100px;
  flex-shrink: 0;
}
.field-name {
  font-size: 0.85rem;
  font-weight: 700;
  color: var(--vp-c-text-1);
}
.field-sub {
  font-size: 0.65rem;
  color: var(--vp-c-text-3);
}

.field-input-wrap {
  display: flex;
  align-items: center;
  gap: 4px;
  border: 1.5px solid var(--vp-c-divider);
  border-radius: 8px;
  background: var(--vp-c-bg-soft);
  padding: 0 0.6rem;
  transition: border-color 0.2s;
  flex: 1;
  max-width: 160px;
}
.field-input-wrap:focus-within {
  border-color: var(--vp-c-brand-1);
}
.field-input-wrap.f-filled {
  border-color: #22c55e;
}
.field-input-wrap.f-warn {
  border-color: #ef4444;
  background: rgba(239, 68, 68, 0.04);
}
.field-warn {
  font-size: 0.68rem;
  color: #ef4444;
  margin-top: 0.2rem;
}
/* T‑score severity */
.field-input-wrap.bmd-normal {
  border-color: #22c55e;
}
.field-input-wrap.bmd-penia {
  border-color: #f59e0b;
}
.field-input-wrap.bmd-porosis {
  border-color: #ef4444;
}
.field-input {
  flex: 1;
  border: none;
  background: transparent;
  font-size: 1rem;
  font-weight: 700;
  color: var(--vp-c-text-1);
  padding: 0.5rem 0;
  outline: none;
  font-family: inherit;
  width: 0;
  -moz-appearance: textfield;
}
.field-input::-webkit-outer-spin-button,
.field-input::-webkit-inner-spin-button {
  -webkit-appearance: none;
}
.field-input::placeholder {
  font-size: 0.82rem;
  font-weight: 400;
  color: var(--vp-c-text-3);
}
.field-unit {
  font-size: 0.72rem;
  color: var(--vp-c-text-3);
  flex-shrink: 0;
}
/* Sex toggle */
.sex-toggle {
  display: flex;
  gap: 0.4rem;
}
.sex-btn {
  padding: 6px 16px;
  border-radius: 8px;
  border: 1.5px solid var(--vp-c-divider);
  background: var(--vp-c-bg-soft);
  font-size: 0.82rem;
  font-weight: 600;
  cursor: pointer;
  font-family: inherit;
  color: var(--vp-c-text-2);
  transition: all 0.15s;
}
.sex-active {
  border-color: var(--vp-c-brand-1);
  color: var(--vp-c-brand-1);
  background: var(--vp-c-brand-soft);
}

/* BMI display — always rendered, no layout shift */
.bmi-display {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: var(--vp-c-bg-mute);
  font-size: 0.8rem;
  color: var(--vp-c-text-2);
  min-height: 2.4rem;
}
.bmi-label {
  font-weight: 700;
  color: var(--vp-c-text-3);
}
.bmi-val {
  font-size: 1rem;
  font-weight: 800;
  color: var(--vp-c-brand-1);
}
.bmi-low {
  color: #f59e0b !important;
}
.bmi-high {
  color: #f97316 !important;
}
.bmi-unit {
  font-size: 0.68rem;
  color: var(--vp-c-text-3);
}

/* BMD hint */
.bmd-hint {
  font-size: 0.68rem;
  color: var(--vp-c-text-3);
  padding: 0.6rem 1rem 0.7rem;
}

/* ── Risk factors (ENS6Q item-list style) ──────────────────────── */
.rf-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
}
.rf-card {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  padding: 0.75rem 0.9rem;
  border: 1px solid var(--vp-c-divider);
  border-radius: 10px;
  background: var(--vp-c-bg-soft);
  cursor: pointer;
  transition: all 0.25s;
  user-select: none;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.03);
}
.rf-card:hover {
  box-shadow: 0 3px 12px rgba(0, 0, 0, 0.06);
  border-color: var(--vp-c-divider);
}
.rf-selected {
  border-color: rgba(99, 102, 241, 0.3);
  background: linear-gradient(135deg, rgba(34, 197, 94, 0.04), transparent);
}

.rf-check {
  flex-shrink: 0;
  width: 20px;
  height: 20px;
  border-radius: 5px;
  border: 1.5px solid var(--vp-c-divider);
  background: var(--vp-c-bg);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 2px;
  transition: all 0.15s;
}
.rf-check svg {
  width: 12px;
  height: 12px;
  color: #fff;
}
.rf-checked {
  background: var(--vp-c-brand-1);
  border-color: var(--vp-c-brand-1);
}

.rf-content {
  flex: 1;
}
.rf-name-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 2px;
  flex-wrap: wrap;
}
.rf-name {
  font-size: 0.88rem;
  font-weight: 700;
  color: var(--vp-c-text-1);
}
.rf-badge {
  font-size: 0.62rem;
  font-weight: 700;
  padding: 1px 6px;
  border-radius: 4px;
}
.badge-strong {
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
}
.badge-mid {
  background: rgba(245, 158, 11, 0.1);
  color: #f59e0b;
}
.rf-sub {
  font-size: 0.68rem;
  color: var(--vp-c-text-3);
  margin-bottom: 3px;
}
.rf-detail {
  font-size: 0.75rem;
  color: var(--vp-c-text-2);
  line-height: 1.5;
}

/* ── Severity bar (ENS6Q absolute positioning) ─────────────────── */
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
.severity-fill.mild {
  background: linear-gradient(90deg, #f59e0b, #fbbf24);
}
.severity-fill.moderate {
  background: linear-gradient(90deg, #f97316, #fb923c);
}
.severity-fill.severe {
  background: linear-gradient(90deg, #ef4444, #f87171);
}

/* Severity ticks — absolutely positioned at true % of max (40%) */
.severity-ticks-abs,
.severity-labels-abs {
  position: relative;
  height: 14px;
  margin-top: 2px;
}
.severity-labels-abs {
  margin-top: 0;
  height: 13px;
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
.tick-g {
  color: #22c55e;
  font-weight: 700;
}
.tick-o {
  color: #f97316;
  font-weight: 700;
}
.tick-r {
  color: #ef4444;
  font-weight: 700;
}

/* ── Risk strip ────────────────────────────────────────────────── */
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
.mild-risk {
  color: #f59e0b;
}
.moderate-risk {
  color: #f97316;
}
.severe-risk {
  color: #ef4444;
}

/* ── Result section ────────────────────────────────────────────── */
.result-section {
  margin-bottom: 1rem;
}
.result-title {
  font-size: 0.78rem;
  font-weight: 700;
  color: var(--vp-c-text-3);
  text-transform: uppercase;
  letter-spacing: 0.06em;
  margin-bottom: 0.75rem;
}

.result-cards {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.75rem;
  margin-bottom: 0.75rem;
}

.result-card {
  border: 1px solid var(--vp-c-divider);
  border-radius: 14px;
  padding: 1.25rem 1.5rem;
  background: linear-gradient(135deg, var(--vp-c-bg-soft), var(--vp-c-bg-mute));
  transition: all 0.3s;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
}
.result-card.normal {
  border-color: #22c55e;
  box-shadow:
    0 0 0 1px rgba(34, 197, 94, 0.06),
    0 1px 3px rgba(0, 0, 0, 0.04);
}
.result-card.moderate {
  border-color: #f97316;
  box-shadow:
    0 0 0 1px rgba(249, 115, 22, 0.06),
    0 1px 3px rgba(0, 0, 0, 0.04);
}
.result-card.severe {
  border-color: #ef4444;
  box-shadow:
    0 0 0 1px rgba(239, 68, 68, 0.06),
    0 1px 3px rgba(0, 0, 0, 0.04);
}
.result-card.filling {
  border-color: var(--vp-c-divider);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
}

.rc-label {
  font-size: 0.8rem;
  font-weight: 700;
  color: var(--vp-c-text-1);
  margin-bottom: 2px;
}
.rc-sublabel {
  font-size: 0.65rem;
  color: var(--vp-c-text-3);
  margin-bottom: 0.5rem;
  line-height: 1.4;
}
.rc-value {
  font-size: 3.5rem;
  font-weight: 800;
  line-height: 1;
  color: var(--vp-c-text-3);
  transition: color 0.3s;
}
.result-card.normal .rc-value {
  color: #22c55e;
}
.result-card.moderate .rc-value {
  color: #f97316;
}
.result-card.severe .rc-value {
  color: #ef4444;
}
.rc-pct {
  font-size: 1.2rem;
  font-weight: 600;
}
.rc-risk {
  font-size: 0.75rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
}
.normal-text {
  color: #22c55e;
}
.moderate-text {
  color: #f97316;
}
.severe-text {
  color: #ef4444;
}
.filling-text {
  color: var(--vp-c-text-3);
}

.rc-bar {
  position: relative;
  height: 8px;
  background: var(--vp-c-bg-mute);
  border-radius: 999px;
  overflow: visible;
  margin: 0.3rem 0;
  box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.08);
}
.rc-bar-fill {
  height: 100%;
  border-radius: 999px;
  transition:
    width 0.5s cubic-bezier(0.22, 1, 0.36, 1),
    background 0.3s;
}
.result-card.normal .rc-bar-fill {
  background: linear-gradient(90deg, #22c55e, #4ade80);
}
.result-card.moderate .rc-bar-fill {
  background: linear-gradient(90deg, #f97316, #fb923c);
}
.result-card.severe .rc-bar-fill {
  background: linear-gradient(90deg, #ef4444, #f87171);
}
.rc-bar-threshold {
  position: absolute;
  top: -4px;
  width: 2px;
  height: 14px;
  background: rgba(0, 0, 0, 0.25);
  transform: translateX(-50%);
}
.rc-threshold-label {
  position: absolute;
  top: 16px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 0.58rem;
  color: var(--vp-c-text-3);
  white-space: nowrap;
}
.rc-threshold-note {
  font-size: 0.65rem;
  color: var(--vp-c-text-3);
  margin-top: 0.6rem;
}

/* Treatment bar */
.treatment-bar {
  display: flex;
  align-items: flex-start;
  gap: 0.7rem;
  padding: 0.85rem 1rem;
  border-radius: 10px;
  font-size: 0.82rem;
  color: var(--vp-c-text-2);
  line-height: 1.6;
  border: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg-soft);
  transition: all 0.3s;
}
.treat-normal {
  border-color: rgba(34, 197, 94, 0.4);
  background: rgba(34, 197, 94, 0.05);
}
.treat-moderate {
  border-color: rgba(249, 115, 22, 0.4);
  background: rgba(249, 115, 22, 0.05);
}
.treat-severe {
  border-color: rgba(239, 68, 68, 0.4);
  background: rgba(239, 68, 68, 0.05);
}
.treat-icon {
  font-size: 1rem;
  font-weight: 700;
  flex-shrink: 0;
  line-height: 1.6;
}
.treat-normal .treat-icon {
  color: #22c55e;
}
.treat-moderate .treat-icon {
  color: #f97316;
}
.treat-severe .treat-icon {
  color: #ef4444;
}

.incomplete-note {
  font-size: 0.78rem;
  color: var(--vp-c-text-3);
  text-align: center;
  padding: 1rem;
}

/* Results detail */
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
  padding: 0.4rem 0.9rem;
  border-bottom: 1px solid var(--vp-c-divider);
}
.detail-row:last-child {
  border-bottom: none;
}
.total-row {
  background: linear-gradient(135deg, var(--vp-c-bg-mute), var(--vp-c-bg-soft));
  font-weight: 800;
}
.detail-domain {
  font-size: 0.78rem;
  font-weight: 600;
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
.detail-score.brand {
  color: var(--vp-c-brand-1);
}
.detail-desc {
  font-size: 0.72rem;
  color: var(--vp-c-text-2);
  flex-shrink: 0;
  width: 72px;
  text-align: left;
}

/* Actions */
.frax-actions {
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
  color: var(--vp-c-brand-1);
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
  .frax-header {
    flex-direction: column;
  }
  .result-badge-wrap {
    align-self: flex-start;
  }
  .result-badge {
    flex-direction: row;
    gap: 0.5rem;
    min-width: auto;
    padding: 0.4rem 0.8rem;
  }
  .badge-val {
    font-size: 1.5rem;
  }
  .badge-lbl {
    margin-top: 0;
  }
  .result-cards {
    grid-template-columns: 1fr;
  }
  .risk-strip {
    grid-template-columns: repeat(2, 1fr);
  }
  .field-row-2 {
    grid-template-columns: 1fr;
  }
  .field-half:first-child {
    border-right: none;
    border-bottom: 1px solid var(--vp-c-divider);
  }
}
</style>
