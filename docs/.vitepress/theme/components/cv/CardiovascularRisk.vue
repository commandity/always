<script setup lang="ts">
import { ref, computed } from "vue";

const activeTab = ref<"cha" | "prevent">("cha");

// ══════════════ CHA₂DS₂-VA 中風風險（AF Stroke Risk Score）══════════════

// ── CHA₂DS₂-VA Items ──────────────────────────────────────────────
// Updated 2024 ESC Guidelines — removed sex (female) as independent
// risk factor; now CHA₂DS₂-VA (not VASc)
// C = CHF, H = Hypertension, A₂ = Age ≥ 75, D = Diabetes,
// S₂ = Stroke/TIA, V = Vascular disease, A = Age 65–74
const criteria = [
  {
    key: "chf",
    letter: "C",
    name: "充血性心臟衰竭",
    sub: "Congestive Heart Failure",
    desc: "近期有心衰竭症狀，或左心室收縮功能減退（EF ≤ 40%）的客觀證據",
    hint: "包含心臟超音波確認的收縮性或舒張性心衰竭",
    points: 1,
    badge: "+1",
    color: "c-item",
  },
  {
    key: "hypertension",
    letter: "H",
    name: "高血壓",
    sub: "Hypertension",
    desc: "靜息血壓 > 140/90 mmHg（至少兩次測量），或目前正在接受降壓藥物治療",
    hint: "包含控制良好的高血壓（正在服藥）",
    points: 1,
    badge: "+1",
    color: "h-item",
  },
  {
    key: "age75",
    letter: "A₂",
    name: "年齡 ≥ 75 歲",
    sub: "Age ≥ 75 years",
    desc: "患者年齡達 75 歲或以上（高齡為最強的中風危險因子之一）",
    hint: "注意：此項計 2 分（A₂），與 65–74 歲分開計算",
    points: 2,
    badge: "+2",
    color: "a2-item",
  },
  {
    key: "diabetes",
    letter: "D",
    name: "糖尿病",
    sub: "Diabetes Mellitus",
    desc: "空腹血糖 > 125 mg/dL（7 mmol/L），或目前正在接受口服降糖藥 / 胰島素治療",
    hint: "糖尿病前期不計分",
    points: 1,
    badge: "+1",
    color: "d-item",
  },
  {
    key: "stroke",
    letter: "S₂",
    name: "中風 / TIA / 血栓栓塞病史",
    sub: "Stroke / TIA / Thromboembolism History",
    desc: "曾有缺血性中風、短暫性腦缺血發作（TIA）或周邊動脈栓塞病史",
    hint: "此項計 2 分（S₂），為最重要的中風風險預測因子",
    points: 2,
    badge: "+2",
    color: "s2-item",
  },
  {
    key: "vascular",
    letter: "V",
    name: "血管疾病",
    sub: "Vascular Disease",
    desc: "確診冠狀動脈疾病（CAD）、周邊動脈疾病（PAD）、主動脈斑塊，或過去有心肌梗塞病史",
    hint: "僅動脈粥樣硬化相關疾病；單純靜脈血栓不計",
    points: 1,
    badge: "+1",
    color: "v-item",
  },
  {
    key: "age65",
    letter: "A",
    name: "年齡 65–74 歲",
    sub: "Age 65–74 years",
    desc: "患者年齡介於 65 至 74 歲（若年齡 ≥ 75 歲，請勾選上方 A₂ 項目，不重複計分）",
    hint: "65–74 歲計 +1，75 歲以上計 +2（A₂），兩者不重複",
    points: 1,
    badge: "+1",
    color: "a-item",
  },
];

// ── State ─────────────────────────────────────────────────────────
const selections = ref<Record<string, boolean>>(
  Object.fromEntries(criteria.map((c) => [c.key, false])),
);
const cha_showResults = ref(false);
const cha_copied = ref(false);

// Mutual exclusion: age groups
function toggle(key: string) {
  if (key === "age75" && !selections.value["age75"]) {
    selections.value["age65"] = false;
  }
  if (key === "age65" && !selections.value["age65"]) {
    selections.value["age75"] = false;
  }
  selections.value[key] = !selections.value[key];
}

// ── Computed ──────────────────────────────────────────────────────
const totalScore = computed(() =>
  criteria.reduce(
    (sum, c) => sum + (selections.value[c.key] ? c.points : 0),
    0,
  ),
);

// 2024 ESC Guidelines annual stroke risk estimates (CHA₂DS₂-VA)
const strokeRisk = computed(() => {
  const riskTable: Record<number, string> = {
    0: "0%",
    1: "0.7%",
    2: "1.6%",
    3: "3.2%",
    4: "5.7%",
    5: "9.4%",
    6: "13.6%",
    7: "17.4%",
    8: "21.5%",
    9: "22.4%",
  };
  const s = Math.min(totalScore.value, 9);
  return riskTable[s] ?? "> 22%";
});

const severity = computed(() => {
  const s = totalScore.value;
  if (s === 0)
    return {
      level: "低風險",
      color: "normal",
      advice: "不建議常規抗凝血治療",
      management: "定期追蹤，每年重新評估 CHA₂DS₂-VA 分數",
      tag: "無需抗凝",
      anticoag: false,
    };
  if (s === 1)
    return {
      level: "低至中風險",
      color: "mild",
      advice: "個別化評估，考慮抗凝血治療",
      management:
        "依患者出血風險（HAS-BLED）、偏好及合併症決定是否開始抗凝治療",
      tag: "考慮抗凝",
      anticoag: null,
    };
  return {
    level: "中至高風險",
    color: s <= 3 ? "moderate" : "severe",
    advice: "建議口服抗凝血藥物（OAC）治療",
    management:
      "優先使用非維他命 K 口服抗凝藥（NOAC：Apixaban、Rivaroxaban、Dabigatran、Edoxaban），除非有 NOAC 禁忌才使用 Warfarin",
    tag: "建議抗凝",
    anticoag: true,
  };
});

// ── Functions ─────────────────────────────────────────────────────
function cha_generateMarkdown() {
  const today = new Date();
  const date = `${today.getFullYear()}/${String(today.getMonth() + 1).padStart(2, "0")}/${String(today.getDate()).padStart(2, "0")}`;
  const sv = severity.value;
  const lines = criteria
    .map(
      (c) =>
        `- **${c.letter} — ${c.name}**（${c.sub}）：${selections.value[c.key] ? `是（${c.badge}）` : `否（0）`}`,
    )
    .join("\n");

  return `# CHA₂DS₂-VA 心房顫動中風風險評估結果

## 評估日期：${date}

## 評估項目

${lines}

---

- **CHA₂DS₂-VA 總分**：${totalScore.value} 分
- **預估年中風風險**：${strokeRisk.value}
- **風險等級**：${sv.level}
- **抗凝血建議**：${sv.advice}
- **治療建議**：${sv.management}

> 依據 2024 ESC 心房顫動指引`;
}

async function cha_copyMarkdown() {
  await navigator.clipboard.writeText(cha_generateMarkdown());
  cha_copied.value = true;
  setTimeout(() => (cha_copied.value = false), 2000);
}

function cha_reset() {
  criteria.forEach((c) => {
    selections.value[c.key] = false;
  });
  cha_showResults.value = false;
}

// ══════════════ PREVENT 心血管風險（AHA PREVENT Risk）══════════════

// ── PREVENT-ASCVD Equations (Base Model) ──────────────────────
// Khan SS, Matsushita K, Sang Y, et al. Circulation 2024;149:30–449.
// Updated 2026 ACC/AHA Dyslipidemia Guideline endorses PREVENT-ASCVD
// for 10-y risk estimation in adults aged 30–79 without ASCVD.
//
// Predictors: age, sex, TC, HDL-C, SBP, eGFR, smoking, diabetes,
//            antihypertensive use, statin use
// Non-HDL-C = TC - HDL-C

const units = ref<"us" | "si">("us");

const inputs = ref({
  age: 55,
  sex: "female" as "female" | "male",
  tc: 180,
  hdl: 50,
  sbp: 125,
  egfr: 90,
  bmi: 27,
  smoking: false,
  diabetes: false,
  antihtn: false,
  statin: false,
});

const model = ref<"ascvd" | "cvd" | "hf">("ascvd");

// ── Shared variable transforms ──────────────────────────
function xform(i: typeof inputs.value) {
  const nhdl = i.tc - i.hdl;
  return {
    nhdl_mmol: nhdl * 0.02586 - 3.5,
    hdl_mmol: (i.hdl * 0.02586 - 1.3) / 0.3,
    age_c: (i.age - 55) / 10,
    sbp_lo: Math.min(i.sbp, 110),
    sbp_hi: Math.max(i.sbp, 110),
    gfr_lo: Math.min(i.egfr, 60),
    gfr_hi: Math.max(i.egfr, 60),
    bmi_lo: Math.min(i.bmi, 30),
    bmi_hi: Math.max(i.bmi, 30),
    smk: i.smoking ? 1 : 0,
    dm: i.diabetes ? 1 : 0,
    aht: i.antihtn ? 1 : 0,
    stat: i.statin ? 1 : 0,
  };
}

function risk(lp: number) {
  return Math.round((Math.exp(lp) / (1 + Math.exp(lp))) * 10000) / 100;
}

// ── Linear predictors ──────────────────────────────────
function lpAscvd(m: "female" | "male") {
  const i = inputs.value;
  const x = xform(i);
  if (m === "female") {
    return (
      0.719883 * x.age_c +
      0.1176967 * x.nhdl_mmol +
      -0.151185 * x.hdl_mmol +
      -0.0835358 * ((x.sbp_lo - 110) / 20) +
      0.3592852 * ((x.sbp_hi - 130) / 20) +
      0.8348585 * x.dm +
      0.4831078 * x.smk +
      0.4864619 * ((x.gfr_lo - 60) / -15) +
      0.0397779 * ((x.gfr_hi - 90) / -15) +
      0.2265309 * x.aht +
      -0.0592374 * x.stat +
      -0.0395762 * ((x.sbp_hi - 130) / 20) * x.aht +
      0.0844423 * x.nhdl_mmol * x.stat +
      -0.0567839 * x.age_c * x.nhdl_mmol +
      0.0325692 * x.age_c * x.hdl_mmol +
      -0.1035985 * x.age_c * ((x.sbp_hi - 130) / 20) +
      -0.2417542 * x.age_c * x.dm +
      -0.0791142 * x.age_c * x.smk +
      -0.1671492 * x.age_c * ((x.gfr_lo - 60) / -15) +
      -3.819975
    );
  }
  return (
    0.7099847 * x.age_c +
    0.1658663 * x.nhdl_mmol +
    -0.1144285 * x.hdl_mmol +
    -0.2837212 * ((x.sbp_lo - 110) / 20) +
    0.3239977 * ((x.sbp_hi - 130) / 20) +
    0.7189597 * x.dm +
    0.3956973 * x.smk +
    0.3690075 * ((x.gfr_lo - 60) / -15) +
    0.0203619 * ((x.gfr_hi - 90) / -15) +
    0.2036522 * x.aht +
    -0.0865581 * x.stat +
    -0.0322916 * ((x.sbp_hi - 130) / 20) * x.aht +
    0.114563 * x.nhdl_mmol * x.stat +
    -0.0300005 * x.age_c * x.nhdl_mmol +
    0.0232747 * x.age_c * x.hdl_mmol +
    -0.0927024 * x.age_c * ((x.sbp_hi - 130) / 20) +
    -0.2018525 * x.age_c * x.dm +
    -0.0970527 * x.age_c * x.smk +
    -0.1217081 * x.age_c * ((x.gfr_lo - 60) / -15) +
    -3.500655
  );
}

function lpCvd(m: "female" | "male") {
  const i = inputs.value;
  const x = xform(i);
  if (m === "female") {
    return (
      0.7939329 * x.age_c +
      0.0305239 * x.nhdl_mmol +
      -0.1606857 * x.hdl_mmol +
      -0.2394003 * ((x.sbp_lo - 110) / 20) +
      0.3600781 * ((x.sbp_hi - 130) / 20) +
      0.8667604 * x.dm +
      0.5360739 * x.smk +
      0.6045917 * ((x.gfr_lo - 60) / -15) +
      0.0433769 * ((x.gfr_hi - 90) / -15) +
      0.3151672 * x.aht +
      -0.1477655 * x.stat +
      -0.0663612 * ((x.sbp_hi - 130) / 20) * x.aht +
      0.1197879 * x.nhdl_mmol * x.stat +
      -0.0819715 * x.age_c * x.nhdl_mmol +
      0.0306769 * x.age_c * x.hdl_mmol +
      -0.0946348 * x.age_c * ((x.sbp_hi - 130) / 20) +
      -0.27057 * x.age_c * x.dm +
      -0.078715 * x.age_c * x.smk +
      -0.1637806 * x.age_c * ((x.gfr_lo - 60) / -15) +
      -3.307728
    );
  }
  return (
    0.7688528 * x.age_c +
    0.0736174 * x.nhdl_mmol +
    -0.0954431 * x.hdl_mmol +
    -0.4347345 * ((x.sbp_lo - 110) / 20) +
    0.3362658 * ((x.sbp_hi - 130) / 20) +
    0.7692857 * x.dm +
    0.4386871 * x.smk +
    0.5378979 * ((x.gfr_lo - 60) / -15) +
    0.0164827 * ((x.gfr_hi - 90) / -15) +
    0.288879 * x.aht +
    -0.1337349 * x.stat +
    -0.0475924 * ((x.sbp_hi - 130) / 20) * x.aht +
    0.150273 * x.nhdl_mmol * x.stat +
    -0.0517874 * x.age_c * x.nhdl_mmol +
    0.0191169 * x.age_c * x.hdl_mmol +
    -0.1049477 * x.age_c * ((x.sbp_hi - 130) / 20) +
    -0.2251948 * x.age_c * x.dm +
    -0.0895067 * x.age_c * x.smk +
    -0.1543702 * x.age_c * ((x.gfr_lo - 60) / -15) +
    -3.031168
  );
}

function lpHf(m: "female" | "male") {
  const i = inputs.value;
  const x = xform(i);
  if (m === "female") {
    return (
      0.8998235 * x.age_c +
      -0.4559771 * ((x.sbp_lo - 110) / 20) +
      0.3576505 * ((x.sbp_hi - 130) / 20) +
      1.038346 * x.dm +
      0.583916 * x.smk +
      -0.0072294 * ((x.bmi_lo - 25) / 5) +
      0.2997706 * ((x.bmi_hi - 30) / 5) +
      0.7451638 * ((x.gfr_lo - 60) / -15) +
      0.0557087 * ((x.gfr_hi - 90) / -15) +
      0.3534442 * x.aht +
      -0.0981511 * ((x.sbp_hi - 130) / 20) * x.aht +
      -0.0946663 * x.age_c * ((x.sbp_hi - 130) / 20) +
      -0.3581041 * x.age_c * x.dm +
      -0.1159453 * x.age_c * x.smk +
      -0.003878 * x.age_c * ((x.bmi_hi - 30) / 5) +
      -0.1884289 * x.age_c * ((x.gfr_lo - 60) / -15) +
      -4.310409
    );
  }
  return (
    0.8972642 * x.age_c +
    -0.6811466 * ((x.sbp_lo - 110) / 20) +
    0.3634461 * ((x.sbp_hi - 130) / 20) +
    0.923776 * x.dm +
    0.5023736 * x.smk +
    -0.0485841 * ((x.bmi_lo - 25) / 5) +
    0.3726929 * ((x.bmi_hi - 30) / 5) +
    0.6926917 * ((x.gfr_lo - 60) / -15) +
    0.0251827 * ((x.gfr_hi - 90) / -15) +
    0.2980922 * x.aht +
    -0.0497731 * ((x.sbp_hi - 130) / 20) * x.aht +
    -0.1289201 * x.age_c * ((x.sbp_hi - 130) / 20) +
    -0.3040924 * x.age_c * x.dm +
    -0.1401688 * x.age_c * x.smk +
    0.0068126 * x.age_c * ((x.bmi_hi - 30) / 5) +
    -0.1797778 * x.age_c * ((x.gfr_lo - 60) / -15) +
    -3.946391
  );
}

const ascvdRisk = computed(() => risk(lpAscvd(inputs.value.sex)));
const cvdRisk = computed(() => risk(lpCvd(inputs.value.sex)));
const hfRisk = computed(() => risk(lpHf(inputs.value.sex)));

const activeRisk = computed(() => {
  if (model.value === "cvd") return cvdRisk.value;
  if (model.value === "hf") return hfRisk.value;
  return ascvdRisk.value;
});

const activeLabel = computed(() => {
  if (model.value === "cvd") return "10y CVD";
  if (model.value === "hf") return "10y HF";
  return "10y ASCVD";
});

// 2026 ACC/AHA Guideline risk categories for ASCVD
const category = computed(() => {
  const r = activeRisk.value;
  if (r < 3) return { label: "低風險", key: "low", en: "Low Risk" };
  if (r < 5)
    return { label: "邊界風險", key: "borderline", en: "Borderline Risk" };
  if (r < 10)
    return { label: "中度風險", key: "intermediate", en: "Intermediate Risk" };
  return { label: "高度風險", key: "high", en: "High Risk" };
});

const ascvdCat = computed(() => {
  const r = ascvdRisk.value;
  if (r < 3) return { label: "低風險", key: "low", en: "Low Risk" };
  if (r < 5)
    return { label: "邊界風險", key: "borderline", en: "Borderline Risk" };
  if (r < 10)
    return { label: "中度風險", key: "intermediate", en: "Intermediate Risk" };
  return { label: "高度風險", key: "high", en: "High Risk" };
});

const management = computed(() => {
  const c = ascvdCat.value.key;
  if (c === "low")
    return {
      advice: "健康行為諮詢",
      tag: "生活方式為主",
      detail:
        "若 LDL-C 160–189 mg/dL 或 30 年風險 ≥10%（30–59 歲），可考慮中等強度史達汀治療。",
    };
  if (c === "borderline")
    return {
      advice: "個別化評估，考慮藥物治療",
      tag: "考慮用藥",
      detail:
        "進行醫病共享決策，考慮風險增強因子。若啟動治療，目標 LDL-C <100 mg/dL、non-HDL-C <130 mg/dL。",
    };
  if (c === "intermediate")
    return {
      advice: "建議中高強度史達汀",
      tag: "建議用藥",
      detail:
        "至少中等強度史達汀，目標 LDL-C 降 ≥30–49%。高值區間可考慮高強度治療。目標 LDL-C <100 mg/dL。",
    };
  return {
    advice: "建議高強度史達汀治療",
    tag: "積極治療",
    detail:
      "高強度史達汀，目標 LDL-C 降 ≥50%。目標 LDL-C <70 mg/dL、non-HDL-C <100 mg/dL。可考慮合併 ezetimibe。",
  };
});

const cprSteps = computed(() => [
  {
    letter: "C",
    label: "Calculate",
    detail: `10-y ASCVD = ${ascvdRisk.value}% · CVD = ${cvdRisk.value}% · HF = ${hfRisk.value}%`,
  },
  {
    letter: "P",
    label: "Personalize",
    detail: "考慮風險增強因子：Lp(a)、hsCRP、生殖風險標誌、CAC",
  },
  { letter: "R", label: "Reclassify", detail: "必要時使用 CAC 積分重新分層" },
]);

const detailRows = computed(() => {
  const i = inputs.value;
  const nhdl = i.tc - i.hdl;
  return [
    { label: "年齡", value: `${i.age} 歲`, flag: false },
    { label: "性別", value: i.sex === "female" ? "女性" : "男性", flag: false },
    { label: "TC", value: `${i.tc} mg/dL`, flag: false },
    { label: "HDL-C", value: `${i.hdl} mg/dL`, flag: false },
    { label: "Non-HDL-C", value: `${nhdl} mg/dL`, flag: nhdl >= 160 },
    { label: "SBP", value: `${i.sbp} mmHg`, flag: i.sbp >= 130 },
    { label: "eGFR", value: `${i.egfr} mL/min/1.73m²`, flag: i.egfr < 60 },
    { label: "BMI", value: `${i.bmi} kg/m²`, flag: i.bmi >= 30 },
    { label: "吸菸", value: i.smoking ? "是" : "否", flag: i.smoking },
    { label: "糖尿病", value: i.diabetes ? "是" : "否", flag: i.diabetes },
    { label: "降壓藥", value: i.antihtn ? "是" : "否", flag: i.antihtn },
    { label: "史達汀", value: i.statin ? "是" : "否", flag: i.statin },
  ];
});

const severityColor = computed(() => {
  const c = ascvdCat.value.key;
  if (c === "low") return "normal";
  if (c === "borderline") return "mild";
  if (c === "intermediate") return "moderate";
  return "severe";
});

const prevent_showResults = ref(false);
const prevent_copied = ref(false);

function prevent_reset() {
  inputs.value = {
    age: 55,
    sex: "female",
    tc: 180,
    hdl: 50,
    sbp: 125,
    egfr: 90,
    bmi: 27,
    smoking: false,
    diabetes: false,
    antihtn: false,
    statin: false,
  };
  model.value = "ascvd";
}

function prevent_generateMarkdown() {
  const d = new Date();
  const date = `${d.getFullYear()}/${String(d.getMonth() + 1).padStart(2, "0")}/${String(d.getDate()).padStart(2, "0")}`;
  const i = inputs.value;
  const mgmt = management.value;

  return `# PREVENT 10 年心血管疾病風險評估結果

## 評估日期：${date}

## 患者資料
- **年齡**：${i.age} 歲
- **性別**：${i.sex === "female" ? "女性" : "男性"}
- **總膽固醇（TC）**：${i.tc} mg/dL
- **HDL 膽固醇**：${i.hdl} mg/dL
- **收縮壓（SBP）**：${i.sbp} mmHg
- **eGFR**：${i.egfr} mL/min/1.73m²
- **BMI**：${i.bmi} kg/m²
- **吸菸**：${i.smoking ? "有" : "無"}
- **糖尿病**：${i.diabetes ? "有" : "無"}
- **服用降壓藥**：${i.antihtn ? "有" : "無"}
- **服用史達汀**：${i.statin ? "有" : "無"}

---
- **10 年 ASCVD 風險**：${ascvdRisk.value}%
- **10 年 Total CVD 風險**：${cvdRisk.value}%
- **10 年心衰竭（HF）風險**：${hfRisk.value}%
- **ASCVD 風險類別**：${ascvdCat.value.label}（${ascvdCat.value.en}）
- **治療建議**：${mgmt.advice}

> 依據 2026 ACC/AHA 血脂管理指引及 PREVENT 方程式（AHA 2024）`;
}

async function prevent_copyMarkdown() {
  await navigator.clipboard.writeText(prevent_generateMarkdown());
  prevent_copied.value = true;
  setTimeout(() => (prevent_copied.value = false), 2000);
}
</script>

<template>
  <div class="cvriskassess">
    <div class="tab-bar">
      <button
        class="tab-btn"
        :class="{ active: activeTab === 'cha' }"
        @click="activeTab = 'cha'"
      >
        <span class="tab-label">CHA₂DS₂-VA 中風風險</span>
        <span class="tab-sub">AF Stroke Risk Score</span>
      </button>
      <button
        class="tab-btn"
        :class="{ active: activeTab === 'prevent' }"
        @click="activeTab = 'prevent'"
      >
        <span class="tab-label">PREVENT 心血管風險</span>
        <span class="tab-sub">AHA PREVENT Risk</span>
      </button>
    </div>

  <div v-show="activeTab === 'cha'" class="cha">
    <!-- Header -->
    <div class="cha-header">
      <div class="header-title">
        <h2 class="title">CHA₂DS₂-VA 評分</h2>
        <p class="subtitle">
          Atrial Fibrillation Stroke Risk · 心房顫動中風風險評估（2024 ESC
          指引）
        </p>
      </div>
      <div class="score-badge" :class="severity.color">
        <span class="score-number">{{ totalScore }}</span>
        <span class="score-label">{{ severity.tag }}</span>
      </div>
    </div>

    <!-- Severity bar — max meaningful is 9 -->
    <div class="severity-bar-wrap">
      <div class="severity-bar">
        <div
          class="severity-fill"
          :class="severity.color"
          :style="{ width: Math.min((totalScore / 9) * 100, 100) + '%' }"
        />
      </div>
      <div class="severity-ticks">
        <span>0</span>
        <span class="tick-threshold">1</span>
        <span>2</span>
        <span>4</span>
        <span>6</span>
        <span>9</span>
      </div>
    </div>

    <!-- Risk strip -->
    <div class="risk-strip">
      <div class="risk-pill" :class="{ 'risk-active': totalScore === 0 }">
        <span class="risk-score">0 分</span>
        <span class="risk-rate normal-risk">年中風率：0%</span>
        <span class="risk-tag">無需抗凝</span>
      </div>
      <div class="risk-pill" :class="{ 'risk-active': totalScore === 1 }">
        <span class="risk-score">1 分</span>
        <span class="risk-rate mild-risk">年中風率：0.7%</span>
        <span class="risk-tag">考慮抗凝</span>
      </div>
      <div
        class="risk-pill"
        :class="{ 'risk-active': totalScore >= 2 && totalScore <= 4 }"
      >
        <span class="risk-score">2–4 分</span>
        <span class="risk-rate moderate-risk">年中風率：1.6–5.7%</span>
        <span class="risk-tag">建議抗凝</span>
      </div>
      <div class="risk-pill" :class="{ 'risk-active': totalScore >= 5 }">
        <span class="risk-score">≥ 5 分</span>
        <span class="risk-rate severe-risk">年中風率：> 9%</span>
        <span class="risk-tag">積極抗凝</span>
      </div>
    </div>

    <!-- Intro -->
    <div class="intro-bar">
      <span class="intro-dot">◉</span>
      <span
        >請評估患者的以下臨床因子。<strong>A₂</strong>（≥ 75 歲）與
        <strong>S₂</strong>（中風史）各計 <strong>2 分</strong>，其餘各計
        <strong>1 分</strong>，總分最高 <strong>9 分</strong>。年齡分組 A₂ 與 A
        不重複計分，請擇一勾選。</span
      >
    </div>

    <!-- ── Criteria group ──────────────────────────────────────── -->
    <div class="cha-group">
      <div class="group-header-bar criteria-bar">
        <span class="group-icon">📋</span>
        <span class="group-label-text">CHA₂DS₂-VA 評估因子</span>
        <span class="group-sub-text">點擊勾選符合項目</span>
        <span
          class="group-score-tally"
          :class="
            totalScore === 0
              ? 'tally-ok'
              : totalScore >= 5
                ? 'tally-abn'
                : 'tally-mid'
          "
        >
          {{ totalScore }} / 9
        </span>
      </div>
      <div class="criteria-list">
        <div
          v-for="c in criteria"
          :key="c.key"
          class="criteria-card"
          :class="{
            selected: selections[c.key],
            [c.color]: true,
            'age-conflict':
              (c.key === 'age65' && selections['age75']) ||
              (c.key === 'age75' && selections['age65']),
          }"
          @click="toggle(c.key)"
        >
          <!-- Left: letter badge -->
          <div class="criteria-badge" :class="c.color + '-badge'">
            <span class="badge-letter">{{ c.letter }}</span>
            <span
              class="badge-pts"
              :class="c.points === 2 ? 'pts-two' : 'pts-one'"
              >{{ c.badge }}</span
            >
          </div>

          <!-- Middle: content -->
          <div class="criteria-content">
            <div class="criteria-name">{{ c.name }}</div>
            <div class="criteria-sub">{{ c.sub }}</div>
            <div class="criteria-desc">{{ c.desc }}</div>
            <div class="criteria-hint">{{ c.hint }}</div>
          </div>

          <!-- Right: toggle -->
          <div class="criteria-toggle">
            <div class="toggle-box" :class="{ 'toggle-on': selections[c.key] }">
              <svg
                v-if="selections[c.key]"
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
              :class="{ 'score-on': selections[c.key] }"
            >
              {{ selections[c.key] ? c.badge : "0" }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- Result card -->
    <div class="cha-result" :class="severity.color">
      <div class="result-left">
        <span class="result-number">{{ totalScore }}</span>
        <span class="result-max">/ 9</span>
      </div>
      <div class="result-right">
        <div class="result-top">
          <span class="result-level">{{ severity.level }}</span>
          <span class="result-risk">年中風率：{{ strokeRisk }}</span>
        </div>
        <span class="result-advice">{{ severity.advice }}</span>
        <span class="result-management">{{ severity.management }}</span>
      </div>
    </div>

    <!-- Anticoag recommendation bar -->
    <div
      class="anticoag-bar"
      :class="{
        'ac-yes': severity.anticoag === true,
        'ac-maybe': severity.anticoag === null,
        'ac-no': severity.anticoag === false,
      }"
    >
      <span class="ac-icon">
        {{
          severity.anticoag === true
            ? "✓"
            : severity.anticoag === null
              ? "△"
              : "○"
        }}
      </span>
      <div class="ac-text">
        <strong>抗凝血治療建議（2024 ESC）：</strong>
        <span v-if="severity.anticoag === true">
          CHA₂DS₂-VA ≥ 2，<strong>建議使用口服抗凝藥（OAC）</strong>。優先選用
          NOAC（Apixaban、Rivaroxaban、Dabigatran 或 Edoxaban）。
        </span>
        <span v-else-if="severity.anticoag === null">
          CHA₂DS₂-VA =
          1，需<strong>個別化評估</strong>出血風險（HAS-BLED）、患者偏好及合併症後決定。
        </span>
        <span v-else>
          CHA₂DS₂-VA =
          0，<strong>通常不建議常規抗凝治療</strong>，定期追蹤並每年重新評估。
        </span>
      </div>
    </div>

    <!-- Results detail -->
    <div v-if="cha_showResults" class="results-detail">
      <div class="results-header">評估明細</div>
      <div v-for="c in criteria" :key="c.key" class="detail-row">
        <span class="detail-letter" :class="c.color + '-letter'">{{
          c.letter
        }}</span>
        <span class="detail-domain">{{ c.name }}</span>
        <span class="detail-score" :class="{ positive: selections[c.key] }">
          {{ selections[c.key] ? c.badge : "0" }}
        </span>
        <span class="detail-desc">{{
          selections[c.key] ? "符合" : "不符合"
        }}</span>
      </div>
      <div class="detail-row total-row">
        <span class="detail-letter brand-ltr">∑</span>
        <span class="detail-domain">CHA₂DS₂-VA 總分</span>
        <span class="detail-score positive">{{ totalScore }}</span>
        <span class="detail-desc">{{ strokeRisk }} / 年</span>
      </div>
    </div>

    <!-- Actions -->
    <div class="cha-actions">
      <button class="btn-view" @click="cha_showResults = !cha_showResults">
        {{ cha_showResults ? "收起明細" : "查看評估結果" }}
      </button>
      <button class="btn-copy" @click="cha_copyMarkdown">
        {{ cha_copied ? "已複製 ✓" : "複製 Markdown 結果" }}
      </button>
      <button class="btn-reset" @click="cha_reset">重置</button>
    </div>
  </div>

  <div v-show="activeTab === 'prevent'" class="prevent">
    <!-- Header -->
    <div class="prevent-header">
      <div class="header-title">
        <h2 class="title">PREVENT 心血管風險評估</h2>
        <p class="subtitle">
          Predicting Risk of cardiovascular disease EVENTs · ASCVD · CVD · HF 10
          年風險預測（AHA 2024 / ACC 2026）
        </p>
        <!-- Model tabs -->
        <div class="model-tabs">
          <button
            class="model-tab"
            :class="{ active: model === 'ascvd' }"
            @click="model = 'ascvd'"
          >
            ASCVD
          </button>
          <button
            class="model-tab"
            :class="{ active: model === 'cvd' }"
            @click="model = 'cvd'"
          >
            Total CVD
          </button>
          <button
            class="model-tab"
            :class="{ active: model === 'hf' }"
            @click="model = 'hf'"
          >
            HF
          </button>
        </div>
      </div>
      <div class="score-badge" :class="severityColor">
        <span class="score-number">{{ activeRisk }}%</span>
        <span class="score-label">{{ activeLabel }}</span>
      </div>
    </div>

    <!-- Severity bar -->
    <div class="severity-bar-wrap">
      <div class="severity-bar">
        <div
          class="severity-fill"
          :class="severityColor"
          :style="{ width: Math.min((activeRisk / 30) * 100, 100) + '%' }"
        />
      </div>
      <div class="severity-ticks">
        <span>0%</span>
        <span class="tick-threshold">3%</span>
        <span>5%</span>
        <span>10%</span>
        <span>20%</span>
        <span>≥30%</span>
      </div>
    </div>

    <!-- Risk strip → 2026 ACC/AHA categories -->
    <div class="risk-strip">
      <div class="risk-pill" :class="{ 'risk-active': ascvdCat.key === 'low' }">
        <span class="risk-score">&lt;3%</span>
        <span class="risk-rate normal-risk">低風險</span>
        <span class="risk-tag">生活方式諮詢</span>
      </div>
      <div
        class="risk-pill"
        :class="{ 'risk-active': ascvdCat.key === 'borderline' }"
      >
        <span class="risk-score">3–&lt;5%</span>
        <span class="risk-rate mild-risk">邊界風險</span>
        <span class="risk-tag">考慮用藥</span>
      </div>
      <div
        class="risk-pill"
        :class="{ 'risk-active': ascvdCat.key === 'intermediate' }"
      >
        <span class="risk-score">5–&lt;10%</span>
        <span class="risk-rate moderate-risk">中度風險</span>
        <span class="risk-tag">建議用藥</span>
      </div>
      <div
        class="risk-pill"
        :class="{ 'risk-active': ascvdCat.key === 'high' }"
      >
        <span class="risk-score">≥10%</span>
        <span class="risk-rate severe-risk">高度風險</span>
        <span class="risk-tag">積極治療</span>
      </div>
    </div>

    <!-- CPR Model -->
    <div class="intro-bar">
      <span class="intro-dot">CPR</span>
      <div class="cpr-list">
        <span v-for="(s, idx) in cprSteps" :key="idx" class="cpr-item">
          <strong>{{ s.letter }}</strong
          >：{{ s.detail }}
        </span>
        <div class="cpr-note">
          <span
            ><strong>CAC</strong>（冠狀動脈鈣化積分，Coronary Artery
            Calcium）：以低劑量心臟電腦斷層測量冠狀動脈鈣化的 Agatston
            分數，用於風險落在中間 /
            不確定時重新分層——CAC = 0 多屬低風險、可考慮暫緩 statin；分數愈高風險愈高。</span
          >
          <span
            ><strong>生殖風險標誌</strong>（reproductive risk
            markers）：與女性心血管風險相關的病史，如子癇前症、妊娠高血壓、妊娠糖尿病、早發停經與多囊性卵巢症候群（PCOS）等，屬風險增強因子。</span
          >
        </div>
      </div>
    </div>

    <!-- Input fields group -->
    <div class="prevent-group">
      <div class="group-header-bar">
        <span class="group-icon">📊</span>
        <span class="group-label-text">臨床變數輸入</span>
        <span class="group-sub-text">於範圍內填寫數值</span>
        <span class="group-score-tally" :class="severityColor">
          {{ activeRisk }}%
        </span>
      </div>

      <div class="field-list">
        <!-- Age -->
        <div class="field-card">
          <div class="field-label">
            <span class="field-name">年齡</span>
            <span class="field-unit">歲</span>
          </div>
          <div class="field-input-wrap">
            <input
              v-model.number="inputs.age"
              type="range"
              min="30"
              max="79"
              step="1"
              class="field-slider"
            />
            <input
              v-model.number="inputs.age"
              type="number"
              min="30"
              max="79"
              class="field-number"
            />
          </div>
          <div class="field-range">30–79 歲</div>
        </div>

        <!-- Sex -->
        <div class="field-card">
          <div class="field-label">
            <span class="field-name">性別</span>
            <span class="field-unit">出生性別</span>
          </div>
          <div class="field-btn-group">
            <button
              class="field-btn"
              :class="{ active: inputs.sex === 'female' }"
              @click="inputs.sex = 'female'"
            >
              女性
            </button>
            <button
              class="field-btn"
              :class="{ active: inputs.sex === 'male' }"
              @click="inputs.sex = 'male'"
            >
              男性
            </button>
          </div>
        </div>

        <!-- TC -->
        <div class="field-card">
          <div class="field-label">
            <span class="field-name">總膽固醇 TC</span>
            <span class="field-unit">mg/dL</span>
          </div>
          <div class="field-input-wrap">
            <input
              v-model.number="inputs.tc"
              type="range"
              min="130"
              max="320"
              step="1"
              class="field-slider"
            />
            <input
              v-model.number="inputs.tc"
              type="number"
              min="130"
              max="320"
              class="field-number"
            />
          </div>
          <div class="field-range">130–320 mg/dL</div>
        </div>

        <!-- HDL -->
        <div class="field-card">
          <div class="field-label">
            <span class="field-name">HDL 膽固醇</span>
            <span class="field-unit">mg/dL</span>
          </div>
          <div class="field-input-wrap">
            <input
              v-model.number="inputs.hdl"
              type="range"
              min="20"
              max="100"
              step="1"
              class="field-slider"
            />
            <input
              v-model.number="inputs.hdl"
              type="number"
              min="20"
              max="100"
              class="field-number"
            />
          </div>
          <div class="field-range">20–100 mg/dL</div>
        </div>

        <!-- SBP -->
        <div class="field-card">
          <div class="field-label">
            <span class="field-name">收縮壓 SBP</span>
            <span class="field-unit">mmHg</span>
          </div>
          <div class="field-input-wrap">
            <input
              v-model.number="inputs.sbp"
              type="range"
              min="90"
              max="200"
              step="1"
              class="field-slider"
            />
            <input
              v-model.number="inputs.sbp"
              type="number"
              min="90"
              max="200"
              class="field-number"
            />
          </div>
          <div class="field-range">90–200 mmHg</div>
        </div>

        <!-- eGFR -->
        <div class="field-card">
          <div class="field-label">
            <span class="field-name">eGFR</span>
            <span class="field-unit">mL/min/1.73m²</span>
          </div>
          <div class="field-input-wrap">
            <input
              v-model.number="inputs.egfr"
              type="range"
              min="15"
              max="150"
              step="1"
              class="field-slider"
            />
            <input
              v-model.number="inputs.egfr"
              type="number"
              min="15"
              max="150"
              class="field-number"
            />
          </div>
          <div class="field-range">15–150 mL/min/1.73m²</div>
        </div>

        <!-- BMI -->
        <div class="field-card">
          <div class="field-label">
            <span class="field-name">BMI</span>
            <span class="field-unit">kg/m²</span>
          </div>
          <div class="field-input-wrap">
            <input
              v-model.number="inputs.bmi"
              type="range"
              min="18.5"
              max="45"
              step="0.1"
              class="field-slider"
            />
            <input
              v-model.number="inputs.bmi"
              type="number"
              min="18.5"
              max="45"
              step="0.1"
              class="field-number"
            />
          </div>
          <div class="field-range">18.5–45 kg/m²</div>
        </div>

        <!-- Binary toggles -->
        <div class="field-card toggle-card">
          <div class="field-label">
            <span class="field-name">吸菸</span>
            <span class="field-unit">過去 30 天內吸菸</span>
          </div>
          <div class="field-btn-group">
            <button
              class="field-btn"
              :class="{ active: !inputs.smoking }"
              @click="inputs.smoking = false"
            >
              否
            </button>
            <button
              class="field-btn"
              :class="{ active: inputs.smoking }"
              @click="inputs.smoking = true"
            >
              是
            </button>
          </div>
        </div>

        <div class="field-card toggle-card">
          <div class="field-label">
            <span class="field-name">糖尿病</span>
            <span class="field-unit">確診第 1 或 2 型糖尿病</span>
          </div>
          <div class="field-btn-group">
            <button
              class="field-btn"
              :class="{ active: !inputs.diabetes }"
              @click="inputs.diabetes = false"
            >
              否
            </button>
            <button
              class="field-btn"
              :class="{ active: inputs.diabetes }"
              @click="inputs.diabetes = true"
            >
              是
            </button>
          </div>
        </div>

        <div class="field-card toggle-card">
          <div class="field-label">
            <span class="field-name">降壓藥</span>
            <span class="field-unit">正在服用抗高血壓藥物</span>
          </div>
          <div class="field-btn-group">
            <button
              class="field-btn"
              :class="{ active: !inputs.antihtn }"
              @click="inputs.antihtn = false"
            >
              否
            </button>
            <button
              class="field-btn"
              :class="{ active: inputs.antihtn }"
              @click="inputs.antihtn = true"
            >
              是
            </button>
          </div>
        </div>

        <div class="field-card toggle-card">
          <div class="field-label">
            <span class="field-name">史達汀</span>
            <span class="field-unit">正在服用史達汀類藥物</span>
          </div>
          <div class="field-btn-group">
            <button
              class="field-btn"
              :class="{ active: !inputs.statin }"
              @click="inputs.statin = false"
            >
              否
            </button>
            <button
              class="field-btn"
              :class="{ active: inputs.statin }"
              @click="inputs.statin = true"
            >
              是
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Result card -->
    <div class="prevent-result" :class="severityColor">
      <div class="result-left">
        <span class="result-number">{{ activeRisk }}</span>
        <span class="result-unit">%</span>
      </div>
      <div class="result-right">
        <div class="result-top">
          <span class="result-level">{{ ascvdCat.label }}</span>
          <span class="result-en">({{ ascvdCat.en }})</span>
        </div>
        <span class="result-advice">{{ management.advice }}</span>
        <span class="result-detail">{{ management.detail }}</span>
      </div>
    </div>

    <!-- Management bar -->
    <div
      class="mgmt-bar"
      :class="{
        'mgmt-low': ascvdCat.key === 'low',
        'mgmt-border': ascvdCat.key === 'borderline',
        'mgmt-mid': ascvdCat.key === 'intermediate',
        'mgmt-high': ascvdCat.key === 'high',
      }"
    >
      <span class="mgmt-icon">
        {{
          ascvdCat.key === "low"
            ? "○"
            : ascvdCat.key === "borderline"
              ? "△"
              : "●"
        }}
      </span>
      <div class="mgmt-text">
        <strong>2026 ACC/AHA 指引建議：</strong>
        <span>{{ management.tag }} — {{ management.detail }}</span>
      </div>
    </div>

    <!-- Results detail -->
    <div v-if="prevent_showResults" class="results-detail">
      <div class="results-header">臨床變數明細</div>
      <div v-for="r in detailRows" :key="r.label" class="detail-row">
        <span class="detail-label">{{ r.label }}</span>
        <span class="detail-value" :class="{ 'value-flag': r.flag }">{{
          r.value
        }}</span>
      </div>
      <div class="detail-row total-row">
        <span class="detail-label brand-lbl">10 年 ASCVD 風險</span>
        <span class="detail-value positive">{{ ascvdRisk }}%</span>
      </div>
      <div class="detail-row">
        <span class="detail-label brand-lbl">10 年 Total CVD 風險</span>
        <span class="detail-value positive">{{ cvdRisk }}%</span>
      </div>
      <div class="detail-row">
        <span class="detail-label brand-lbl">10 年 HF 風險</span>
        <span class="detail-value positive">{{ hfRisk }}%</span>
      </div>
      <div class="detail-row">
        <span class="detail-label brand-lbl">ASCVD 風險類別</span>
        <span class="detail-value positive"
          >{{ ascvdCat.label }}（{{ ascvdCat.en }}）</span
        >
      </div>
      <div class="detail-row">
        <span class="detail-label brand-lbl">治療建議</span>
        <span class="detail-value">{{ management.advice }}</span>
      </div>
    </div>

    <!-- Actions -->
    <div class="prevent-actions">
      <button class="btn-view" @click="prevent_showResults = !prevent_showResults">
        {{ prevent_showResults ? "收起明細" : "查看評估結果" }}
      </button>
      <button class="btn-copy" @click="prevent_copyMarkdown">
        {{ prevent_copied ? "已複製 ✓" : "複製 Markdown 結果" }}
      </button>
      <button class="btn-reset" @click="prevent_reset">重置</button>
    </div>
  </div>
  </div>
</template>

<style scoped>
.cvriskassess { max-width: 820px; margin: 0 auto; }
.cvriskassess > .tab-bar {
  display: flex; gap: 0.5rem; margin-bottom: 1.5rem; background: var(--vp-c-bg-mute);
  padding: 4px; border-radius: 10px; border: 1px solid var(--vp-c-divider);
}
.cvriskassess > .tab-bar .tab-btn {
  flex: 1; padding: 0.65rem 1rem; background: transparent; border: 1.5px solid transparent;
  cursor: pointer; font-family: inherit; color: var(--vp-c-text-3); border-radius: 8px; transition: all 0.2s;
}
.cvriskassess > .tab-bar .tab-btn:hover { color: var(--vp-c-text-1); border-color: var(--vp-c-divider); }
.cvriskassess > .tab-bar .tab-btn.active {
  color: var(--vp-c-brand-1); background: color-mix(in srgb, var(--vp-c-brand-1) 12%, transparent);
  border-color: color-mix(in srgb, var(--vp-c-brand-1) 35%, transparent);
  box-shadow: 0 0 0 1px color-mix(in srgb, var(--vp-c-brand-1) 8%, transparent);
}
.cvriskassess > .tab-bar .tab-label { display: block; font-size: 1rem; font-weight: 800; line-height: 1.3; letter-spacing: 0.02em; }
.cvriskassess > .tab-bar .tab-sub { display: block; font-size: 0.78rem; font-weight: 600; color: var(--vp-c-text-3); margin-top: 2px; }
.cvriskassess > .tab-bar .tab-btn.active .tab-sub { color: var(--vp-c-brand-1); opacity: 0.85; }

/* ══ CHA₂DS₂-VA 中風風險 ══ */

.cha {
  max-width: 780px;
  margin: 0 auto;
  padding: 2rem 0 3rem;
  font-size: 0.9rem;
}
.cha /* ── Header ────────────────────────────────────────────────────── */
.cha-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 1.25rem;
  flex-wrap: wrap;
}
.cha .header-title {
  flex: 1;
  min-width: 0;
}
.cha .title {
  font-size: 24px;
  font-weight: 600;
  color: var(--vp-c-text-1);
  margin: 0 0 0.2rem;
  border: none !important;
  padding: 0 !important;
}
.cha .subtitle {
  font-size: 0.78rem;
  color: var(--vp-c-text-3);
  margin: 0;
  overflow-wrap: break-word;
  word-break: break-word;
}
.cha .score-badge {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-width: 110px;
  flex-shrink: 0;
  padding: 0.6rem 1rem;
  border-radius: 14px;
  border: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg-soft);
  transition: all 0.3s;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
}
.cha .score-number {
  font-size: 2.2rem;
  font-weight: 800;
  line-height: 1;
}
.cha .score-label {
  font-size: 0.68rem;
  font-weight: 700;
  margin-top: 2px;
  white-space: nowrap;
}
.cha .score-badge.normal {
  border-color: #22c55e;
  color: #22c55e;
  box-shadow:
    0 0 0 1px rgba(34, 197, 94, 0.08),
    0 1px 3px rgba(0, 0, 0, 0.04);
}
.cha .score-badge.mild {
  border-color: #f59e0b;
  color: #f59e0b;
  box-shadow:
    0 0 0 1px rgba(245, 158, 11, 0.08),
    0 1px 3px rgba(0, 0, 0, 0.04);
}
.cha .score-badge.moderate {
  border-color: #f97316;
  color: #f97316;
  box-shadow:
    0 0 0 1px rgba(249, 115, 22, 0.08),
    0 1px 3px rgba(0, 0, 0, 0.04);
}
.cha .score-badge.severe {
  border-color: #ef4444;
  color: #ef4444;
  box-shadow:
    0 0 0 1px rgba(239, 68, 68, 0.08),
    0 1px 3px rgba(0, 0, 0, 0.04);
}
.cha /* ── Severity bar ──────────────────────────────────────────────── */
.severity-bar-wrap {
  margin-bottom: 1rem;
}
.cha .severity-bar {
  position: relative;
  height: 8px;
  border-radius: 999px;
  background: var(--vp-c-bg-mute);
  overflow: visible;
  margin-bottom: 4px;
  box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.08);
}
.cha .severity-fill {
  height: 100%;
  border-radius: 999px;
  transition:
    width 0.5s cubic-bezier(0.22, 1, 0.36, 1),
    background 0.3s;
}
.cha .severity-fill.normal {
  background: linear-gradient(90deg, #22c55e, #4ade80);
}
.cha .severity-fill.mild {
  background: linear-gradient(90deg, #f59e0b, #fbbf24);
}
.cha .severity-fill.moderate {
  background: linear-gradient(90deg, #f97316, #fb923c);
}
.cha .severity-fill.severe {
  background: linear-gradient(90deg, #ef4444, #f87171);
}
.cha .severity-ticks {
  display: flex;
  justify-content: space-between;
  font-size: 0.68rem;
  color: var(--vp-c-text-3);
  padding: 0 2px;
}
.cha .tick-threshold {
  color: #f59e0b;
  font-weight: 700;
}
.cha /* ── Risk strip ────────────────────────────────────────────────── */
.risk-strip {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 0.4rem;
  margin-bottom: 1.25rem;
}
.cha .risk-pill {
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
.cha .risk-pill.risk-active {
  border-color: var(--vp-c-brand-1);
  background: var(--vp-c-brand-soft);
}
.cha .risk-score {
  font-size: 0.82rem;
  font-weight: 800;
  color: var(--vp-c-text-1);
}
.cha .risk-rate {
  font-size: 0.8rem;
  font-weight: 600;
}
.cha .risk-tag {
  font-size: 0.8rem;
  color: var(--vp-c-text-3);
}
.cha .normal-risk {
  color: #22c55e;
}
.cha .mild-risk {
  color: #f59e0b;
}
.cha .moderate-risk {
  color: #f97316;
}
.cha .severe-risk {
  color: #ef4444;
}
.cha /* ── Intro ─────────────────────────────────────────────────────── */
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
.cha .intro-dot {
  color: var(--vp-c-brand-1);
  flex-shrink: 0;
}
.cha /* ── Group header ─────────────────────────────────────────────────── */
.cha-group {
  margin-bottom: 1.25rem;
}
.cha .group-header-bar {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.65rem 0.85rem 0.65rem 1.5rem;
  border-radius: 10px;
  background: linear-gradient(
    135deg,
    rgba(99, 102, 241, 0.08),
    var(--vp-c-bg-mute),
    var(--vp-c-bg-soft)
  );
  border: 1px solid var(--vp-c-divider);
  border-left: 4px solid #6366f1;
  box-shadow: 0 1px 3px rgba(99, 102, 241, 0.06);
  margin-bottom: 0.6rem;
}
.cha .group-icon {
  font-size: 1rem;
  flex-shrink: 0;
}
.cha .group-label-text {
  font-size: 0.88rem;
  font-weight: 800;
  color: var(--vp-c-text-1);
}
.cha .group-sub-text {
  font-size: 0.7rem;
  color: var(--vp-c-text-3);
  flex: 1;
}
.cha .group-score-tally {
  font-size: 0.72rem;
  font-weight: 700;
  padding: 2px 8px;
  border-radius: 999px;
  flex-shrink: 0;
  min-width: 52px;
  text-align: center;
  border: 1px solid transparent;
}
.cha .tally-ok {
  color: #22c55e;
  background: rgba(34, 197, 94, 0.12);
  border-color: rgba(34, 197, 94, 0.25);
}
.cha .tally-abn {
  color: #ef4444;
  background: rgba(239, 68, 68, 0.12);
  border-color: rgba(239, 68, 68, 0.25);
}
.cha .tally-mid {
  color: #f59e0b;
  background: rgba(245, 158, 11, 0.12);
  border-color: rgba(245, 158, 11, 0.25);
}
.cha /* ── Criteria cards ────────────────────────────────────────────── */
.criteria-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
.cha .criteria-card {
  display: flex;
  align-items: flex-start;
  gap: 0.85rem;
  padding: 0.85rem 1rem;
  border: 1px solid var(--vp-c-divider);
  border-radius: 10px;
  background: var(--vp-c-bg-soft);
  cursor: pointer;
  transition: all 0.25s;
  user-select: none;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.03);
}
.cha .criteria-card:hover {
  box-shadow: 0 3px 12px rgba(0, 0, 0, 0.06);
  border-color: var(--vp-c-divider);
}
.cha .criteria-card.selected {
  border-color: var(--vp-c-brand-1);
  background: var(--vp-c-brand-soft);
}
.cha .criteria-card.age-conflict {
  opacity: 0.45;
  pointer-events: none;
}
.cha /* Colour accents per criterion */
.c-item.selected {
  border-color: #3b82f6;
  background: rgba(59, 130, 246, 0.07);
}
.cha .h-item.selected {
  border-color: #ef4444;
  background: rgba(239, 68, 68, 0.07);
}
.cha .a2-item.selected {
  border-color: #7c3aed;
  background: rgba(124, 58, 237, 0.07);
}
.cha .d-item.selected {
  border-color: #f59e0b;
  background: rgba(245, 158, 11, 0.07);
}
.cha .s2-item.selected {
  border-color: #ef4444;
  background: rgba(239, 68, 68, 0.09);
}
.cha .v-item.selected {
  border-color: #f97316;
  background: rgba(249, 115, 22, 0.07);
}
.cha .a-item.selected {
  border-color: #8b5cf6;
  background: rgba(139, 92, 246, 0.07);
}
.cha /* Badge */
.criteria-badge {
  flex-shrink: 0;
  width: 48px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 3px;
  padding: 6px 4px;
  border-radius: 8px;
  background: var(--vp-c-bg-mute);
  border: 1px solid var(--vp-c-divider);
  transition: all 0.2s;
  margin-top: 1px;
}
.cha .badge-letter {
  font-size: 0.82rem;
  font-weight: 900;
  color: var(--vp-c-text-2);
  letter-spacing: -0.02em;
}
.cha .badge-pts {
  font-size: 0.72rem;
  font-weight: 800;
  color: var(--vp-c-text-3);
}
.cha .pts-two {
  color: #ef4444 !important;
}
.cha .pts-one {
  color: var(--vp-c-brand-1);
}
.cha /* Active badge colours */
.c-item-badge {
}
.cha /* handled by selected above */
.selected .criteria-badge {
  border-color: var(--vp-c-brand-1);
}
.cha .c-item.selected .criteria-badge {
  border-color: #3b82f6;
  background: rgba(59, 130, 246, 0.12);
}
.cha .h-item.selected .criteria-badge {
  border-color: #ef4444;
  background: rgba(239, 68, 68, 0.12);
}
.cha .a2-item.selected .criteria-badge {
  border-color: #7c3aed;
  background: rgba(124, 58, 237, 0.12);
}
.cha .d-item.selected .criteria-badge {
  border-color: #f59e0b;
  background: rgba(245, 158, 11, 0.12);
}
.cha .s2-item.selected .criteria-badge {
  border-color: #ef4444;
  background: rgba(239, 68, 68, 0.14);
}
.cha .v-item.selected .criteria-badge {
  border-color: #f97316;
  background: rgba(249, 115, 22, 0.12);
}
.cha .a-item.selected .criteria-badge {
  border-color: #8b5cf6;
  background: rgba(139, 92, 246, 0.12);
}
.cha .criteria-content {
  flex: 1;
  min-width: 0;
}
.cha .criteria-name {
  font-size: 0.9rem;
  font-weight: 700;
  color: var(--vp-c-text-1);
  margin-bottom: 2px;
}
.cha .criteria-sub {
  font-size: 0.68rem;
  color: var(--vp-c-text-3);
  margin-bottom: 4px;
}
.cha .criteria-desc {
  font-size: 0.8rem;
  color: var(--vp-c-text-2);
  line-height: 1.5;
  margin-bottom: 3px;
}
.cha .criteria-hint {
  font-size: 0.7rem;
  color: var(--vp-c-text-3);
  font-style: italic;
}
.cha .criteria-toggle {
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding-top: 2px;
}
.cha .toggle-box {
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
.cha .toggle-box svg {
  width: 13px;
  height: 13px;
  color: #fff;
}
.cha .toggle-on {
  background: var(--vp-c-brand-1);
  border-color: var(--vp-c-brand-1);
}
.cha .toggle-score {
  font-size: 0.78rem;
  font-weight: 800;
  color: var(--vp-c-text-3);
}
.cha .score-on {
  color: var(--vp-c-brand-1);
}
.cha /* ── Result card ───────────────────────────────────────────────── */
.cha-result {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  padding: 1.25rem 1.5rem;
  border-radius: 14px;
  border: 1px solid var(--vp-c-divider);
  background: linear-gradient(135deg, var(--vp-c-bg-soft), var(--vp-c-bg-mute));
  margin-bottom: 0.75rem;
  flex-wrap: wrap;
  transition: all 0.3s;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
}
.cha .cha-result.normal {
  border-color: #22c55e;
  box-shadow:
    0 0 0 1px rgba(34, 197, 94, 0.06),
    0 1px 3px rgba(0, 0, 0, 0.04);
}
.cha .cha-result.mild {
  border-color: #f59e0b;
  box-shadow:
    0 0 0 1px rgba(245, 158, 11, 0.06),
    0 1px 3px rgba(0, 0, 0, 0.04);
}
.cha .cha-result.moderate {
  border-color: #f97316;
  box-shadow:
    0 0 0 1px rgba(249, 115, 22, 0.06),
    0 1px 3px rgba(0, 0, 0, 0.04);
}
.cha .cha-result.severe {
  border-color: #ef4444;
  box-shadow:
    0 0 0 1px rgba(239, 68, 68, 0.06),
    0 1px 3px rgba(0, 0, 0, 0.04);
}
.cha .result-left {
  display: flex;
  align-items: baseline;
  gap: 4px;
  flex-shrink: 0;
}
.cha .result-number {
  font-size: 3.5rem;
  font-weight: 800;
  line-height: 1;
  color: var(--vp-c-text-3);
  transition: color 0.3s;
}
.cha .cha-result.normal .result-number {
  color: #22c55e;
}
.cha .cha-result.mild .result-number {
  color: #f59e0b;
}
.cha .cha-result.moderate .result-number {
  color: #f97316;
}
.cha .cha-result.severe .result-number {
  color: #ef4444;
}
.cha .result-max {
  font-size: 1rem;
  color: var(--vp-c-text-3);
}
.cha .result-right {
  display: flex;
  flex-direction: column;
  gap: 5px;
  flex: 1;
}
.cha .result-top {
  display: flex;
  align-items: baseline;
  gap: 0.75rem;
  flex-wrap: wrap;
}
.cha .result-level {
  font-size: 1.05rem;
  font-weight: 700;
  color: var(--vp-c-text-1);
}
.cha .result-risk {
  font-size: 0.78rem;
  font-weight: 600;
  color: var(--vp-c-brand-1);
}
.cha .result-advice {
  font-size: 0.85rem;
  color: var(--vp-c-text-2);
  font-weight: 600;
}
.cha .result-management {
  font-size: 0.78rem;
  color: var(--vp-c-text-2);
  line-height: 1.55;
}
.cha /* ── Anticoag bar ──────────────────────────────────────────────── */
.anticoag-bar {
  display: flex;
  align-items: center;
  gap: 0.7rem;
  padding: 0.85rem 1rem;
  border-radius: 10px;
  font-size: 0.82rem;
  color: var(--vp-c-text-2);
  margin-bottom: 1rem;
  line-height: 1.6;
  border: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg-soft);
  transition: all 0.3s;
}
.cha .ac-yes {
  border-color: rgba(239, 68, 68, 0.4);
  background: rgba(239, 68, 68, 0.05);
}
.cha .ac-maybe {
  border-color: rgba(245, 158, 11, 0.4);
  background: rgba(245, 158, 11, 0.05);
}
.cha .ac-no {
  border-color: rgba(34, 197, 94, 0.3);
  background: rgba(34, 197, 94, 0.04);
}
.cha .ac-icon {
  font-size: 1.1rem;
  font-weight: 700;
  flex-shrink: 0;
  line-height: 1.6;
}
.cha .ac-yes .ac-icon {
  color: #ef4444;
}
.cha .ac-maybe .ac-icon {
  color: #f59e0b;
}
.cha .ac-no .ac-icon {
  color: #22c55e;
}
.cha /* ── Results detail ────────────────────────────────────────────── */
.results-detail {
  border: 1px solid var(--vp-c-divider);
  border-radius: 10px;
  overflow: hidden;
  margin-bottom: 1rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.03);
}
.cha .results-header {
  padding: 0.5rem 0.9rem;
  font-size: 0.72rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--vp-c-text-3);
  background: var(--vp-c-bg-mute);
  border-bottom: 1px solid var(--vp-c-divider);
}
.cha .detail-row {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.45rem 0.9rem;
  border-bottom: 1px solid var(--vp-c-divider);
}
.cha .detail-row:last-child {
  border-bottom: none;
}
.cha .total-row {
  background: linear-gradient(135deg, var(--vp-c-bg-mute), var(--vp-c-bg-soft));
  font-weight: 800;
}
.cha .detail-letter {
  font-size: 0.7rem;
  font-weight: 900;
  flex-shrink: 0;
  width: 28px;
  color: var(--vp-c-text-3);
}
.cha .brand-ltr {
  color: var(--vp-c-brand-1);
}
.cha .detail-domain {
  font-size: 0.78rem;
  font-weight: 700;
  color: var(--vp-c-text-1);
  flex: 1;
}
.cha .detail-score {
  font-size: 0.82rem;
  font-weight: 800;
  flex-shrink: 0;
  width: 52px;
  text-align: right;
  color: var(--vp-c-text-3);
}
.cha .detail-score.positive {
  color: var(--vp-c-brand-1);
}
.cha .detail-desc {
  font-size: 0.75rem;
  color: var(--vp-c-text-2);
  flex-shrink: 0;
  width: 60px;
  text-align: left;
}
.cha /* ── Actions ───────────────────────────────────────────────────── */
.cha-actions {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}
.cha .btn-view,
.cha .btn-copy,
.cha .btn-reset {
  padding: 9px 22px;
  border-radius: 8px;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  font-family: inherit;
  transition: all 0.2s;
}
.cha .btn-view {
  border: none;
  background: linear-gradient(135deg, var(--vp-c-brand-1), #4f46e5);
  color: #fff;
  box-shadow: 0 2px 8px rgba(99, 102, 241, 0.3);
}
.cha .btn-view:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 14px rgba(99, 102, 241, 0.4);
}
.cha .btn-view:active {
  transform: translateY(0);
}
.cha .btn-view:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}
.cha .btn-copy {
  border: 1.5px solid var(--vp-c-brand-1);
  background: transparent;
  color: var(--vp-c-brand-1);
}
.cha .btn-copy:hover:not(:disabled) {
  background: var(--vp-c-brand-soft);
}
.cha .btn-copy:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}
.cha .btn-reset {
  border: 1px solid var(--vp-c-divider);
  background: transparent;
  color: var(--vp-c-text-2);
}
.cha .btn-reset:hover {
  border-color: #ef4444;
  color: #ef4444;
  background: rgba(239, 68, 68, 0.04);
}

@media (max-width: 640px) {
.cha .cha-header {
    flex-wrap: wrap;
  }
.cha .score-badge {
    align-self: flex-start;
  }
.cha .score-number {
    font-size: 1.5rem;
  }
.cha .risk-strip {
    grid-template-columns: repeat(2, 1fr);
  }
.cha .cha-result {
    flex-direction: column;
    gap: 0.75rem;
  }
}
/* ══ PREVENT 心血管風險 ══ */

.prevent {
  max-width: 780px;
  margin: 0 auto;
  padding: 2rem 0 3rem;
  font-size: 0.9rem;
}
.prevent /* ── Header ──────────────────────────────────────────────────── */
.prevent-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 1.25rem;
  flex-wrap: wrap;
}
.prevent .header-title {
  flex: 1;
  min-width: 0;
}
.prevent .title {
  font-size: 24px;
  font-weight: 600;
  color: var(--vp-c-text-1);
  margin: 0 0 0.2rem;
  border: none !important;
  padding: 0 !important;
}
.prevent .subtitle {
  font-size: 0.78rem;
  color: var(--vp-c-text-3);
  margin: 0 0 0.5rem;
  overflow-wrap: break-word;
  word-break: break-word;
}
.prevent .model-tabs {
  display: flex;
  gap: 4px;
}
.prevent .model-tab {
  padding: 4px 14px;
  border: 1.5px solid var(--vp-c-divider);
  border-radius: 999px;
  background: transparent;
  color: var(--vp-c-text-2);
  font-size: 0.75rem;
  font-weight: 700;
  cursor: pointer;
  font-family: inherit;
  transition: all 0.15s;
}
.prevent .model-tab.active {
  border-color: var(--vp-c-brand-1);
  background: var(--vp-c-brand-soft);
  color: var(--vp-c-brand-1);
}
.prevent .model-tab:hover:not(.active) {
  border-color: var(--vp-c-text-3);
}
.prevent .score-badge {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-width: 110px;
  flex-shrink: 0;
  padding: 0.6rem 1rem;
  border-radius: 14px;
  border: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg-soft);
  transition: all 0.3s;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
}
.prevent .score-number {
  font-size: 2.2rem;
  font-weight: 800;
  line-height: 1;
}
.prevent .score-label {
  font-size: 0.68rem;
  font-weight: 700;
  margin-top: 2px;
  white-space: nowrap;
}
.prevent .score-badge.normal {
  border-color: #22c55e;
  color: #22c55e;
}
.prevent .score-badge.mild {
  border-color: #f59e0b;
  color: #f59e0b;
}
.prevent .score-badge.moderate {
  border-color: #f97316;
  color: #f97316;
}
.prevent .score-badge.severe {
  border-color: #ef4444;
  color: #ef4444;
}
.prevent /* ── Severity bar ─────────────────────────────────────────────── */
.severity-bar-wrap {
  margin-bottom: 1rem;
}
.prevent .severity-bar {
  position: relative;
  height: 8px;
  border-radius: 999px;
  background: var(--vp-c-bg-mute);
  overflow: visible;
  margin-bottom: 4px;
  box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.08);
}
.prevent .severity-fill {
  height: 100%;
  border-radius: 999px;
  transition:
    width 0.5s cubic-bezier(0.22, 1, 0.36, 1),
    background 0.3s;
}
.prevent .severity-fill.normal {
  background: linear-gradient(90deg, #22c55e, #4ade80);
}
.prevent .severity-fill.mild {
  background: linear-gradient(90deg, #f59e0b, #fbbf24);
}
.prevent .severity-fill.moderate {
  background: linear-gradient(90deg, #f97316, #fb923c);
}
.prevent .severity-fill.severe {
  background: linear-gradient(90deg, #ef4444, #f87171);
}
.prevent .severity-ticks {
  display: flex;
  justify-content: space-between;
  font-size: 0.68rem;
  color: var(--vp-c-text-3);
  padding: 0 2px;
}
.prevent .tick-threshold {
  color: #f59e0b;
  font-weight: 700;
}
.prevent /* ── Risk strip ────────────────────────────────────────────────── */
.risk-strip {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 0.4rem;
  margin-bottom: 1.25rem;
}
.prevent .risk-pill {
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
.prevent .risk-pill.risk-active {
  border-color: var(--vp-c-brand-1);
  background: var(--vp-c-brand-soft);
}
.prevent .risk-score {
  font-size: 0.82rem;
  font-weight: 800;
  color: var(--vp-c-text-1);
}
.prevent .risk-rate {
  font-size: 0.8rem;
  font-weight: 600;
}
.prevent .risk-tag {
  font-size: 0.8rem;
  color: var(--vp-c-text-3);
}
.prevent .normal-risk {
  color: #22c55e;
}
.prevent .mild-risk {
  color: #f59e0b;
}
.prevent .moderate-risk {
  color: #f97316;
}
.prevent .severe-risk {
  color: #ef4444;
}
.prevent /* ── Intro (CPR) ─────────────────────────────────────────────── */
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
.prevent .intro-dot {
  color: var(--vp-c-brand-1);
  flex-shrink: 0;
  font-weight: 900;
  font-size: 1rem;
}
.prevent .cpr-list {
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.prevent /* ── Group header ────────────────────────────────────────────── */
.prevent-group {
  margin-bottom: 1.25rem;
}
.prevent .group-header-bar {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.65rem 0.85rem 0.65rem 1.5rem;
  border-radius: 10px;
  background: linear-gradient(
    135deg,
    rgba(99, 102, 241, 0.08),
    var(--vp-c-bg-mute),
    var(--vp-c-bg-soft)
  );
  border: 1px solid var(--vp-c-divider);
  border-left: 4px solid #6366f1;
  box-shadow: 0 1px 3px rgba(99, 102, 241, 0.06);
  margin-bottom: 0.6rem;
}
.prevent .group-icon {
  font-size: 1rem;
  flex-shrink: 0;
}
.prevent .group-label-text {
  font-size: 0.88rem;
  font-weight: 800;
  color: var(--vp-c-text-1);
}
.prevent .group-sub-text {
  font-size: 0.7rem;
  color: var(--vp-c-text-3);
  flex: 1;
}
.prevent .group-score-tally {
  font-size: 0.72rem;
  font-weight: 700;
  padding: 2px 8px;
  border-radius: 999px;
  flex-shrink: 0;
  min-width: 52px;
  text-align: center;
  border: 1px solid transparent;
}
.prevent .group-score-tally.normal {
  color: #22c55e;
  background: rgba(34, 197, 94, 0.12);
  border-color: rgba(34, 197, 94, 0.25);
}
.prevent .group-score-tally.mild {
  color: #f59e0b;
  background: rgba(245, 158, 11, 0.12);
  border-color: rgba(245, 158, 11, 0.25);
}
.prevent .group-score-tally.moderate {
  color: #f97316;
  background: rgba(249, 115, 22, 0.12);
  border-color: rgba(249, 115, 22, 0.25);
}
.prevent .group-score-tally.severe {
  color: #ef4444;
  background: rgba(239, 68, 68, 0.12);
  border-color: rgba(239, 68, 68, 0.25);
}
.prevent /* ── Fields ────────────────────────────────────────────────────── */
.field-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
.prevent .field-card {
  padding: 0.75rem 1rem;
  border: 1px solid var(--vp-c-divider);
  border-radius: 10px;
  background: var(--vp-c-bg-soft);
}
.prevent .field-label {
  display: flex;
  align-items: baseline;
  gap: 0.5rem;
  margin-bottom: 0.4rem;
}
.prevent .field-name {
  font-size: 0.88rem;
  font-weight: 700;
  color: var(--vp-c-text-1);
}
.prevent .field-unit {
  font-size: 0.68rem;
  color: var(--vp-c-text-3);
}
.prevent .field-input-wrap {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}
.prevent .field-slider {
  flex: 1;
  accent-color: var(--vp-c-brand-1);
  cursor: pointer;
}
.prevent .field-number {
  width: 72px;
  padding: 4px 8px;
  border: 1.5px solid var(--vp-c-divider);
  border-radius: 6px;
  font-size: 0.85rem;
  font-weight: 600;
  text-align: center;
  background: var(--vp-c-bg);
  color: var(--vp-c-text-1);
  font-family: inherit;
}
.prevent .field-number:focus {
  outline: none;
  border-color: var(--vp-c-brand-1);
  box-shadow: 0 0 0 2px var(--vp-c-brand-soft);
}
.prevent .field-range {
  font-size: 0.68rem;
  color: var(--vp-c-text-3);
  margin-top: 4px;
}
.prevent .field-btn-group {
  display: flex;
  gap: 0.4rem;
}
.prevent .field-btn {
  flex: 1;
  padding: 6px 12px;
  border: 1.5px solid var(--vp-c-divider);
  border-radius: 8px;
  background: transparent;
  color: var(--vp-c-text-2);
  font-size: 0.82rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s;
  font-family: inherit;
}
.prevent .field-btn.active {
  border-color: var(--vp-c-brand-1);
  background: var(--vp-c-brand-soft);
  color: var(--vp-c-brand-1);
}
.prevent .field-btn:hover:not(.active) {
  border-color: var(--vp-c-text-3);
}
.prevent .toggle-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 0.5rem;
}
.prevent .toggle-card .field-label {
  margin-bottom: 0;
}
.prevent .toggle-card .field-btn-group {
  min-width: 120px;
}
.prevent /* ── Result ────────────────────────────────────────────────────── */
.prevent-result {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  padding: 1.25rem 1.5rem;
  border-radius: 14px;
  border: 1px solid var(--vp-c-divider);
  background: linear-gradient(135deg, var(--vp-c-bg-soft), var(--vp-c-bg-mute));
  margin-bottom: 0.75rem;
  flex-wrap: wrap;
  transition: all 0.3s;
}
.prevent .prevent-result.normal {
  border-color: #22c55e;
}
.prevent .prevent-result.mild {
  border-color: #f59e0b;
}
.prevent .prevent-result.moderate {
  border-color: #f97316;
}
.prevent .prevent-result.severe {
  border-color: #ef4444;
}
.prevent .result-left {
  display: flex;
  align-items: baseline;
  gap: 4px;
  flex-shrink: 0;
}
.prevent .result-number {
  font-size: 3.5rem;
  font-weight: 800;
  line-height: 1;
  color: var(--vp-c-text-3);
  transition: color 0.3s;
}
.prevent .prevent-result.normal .result-number {
  color: #22c55e;
}
.prevent .prevent-result.mild .result-number {
  color: #f59e0b;
}
.prevent .prevent-result.moderate .result-number {
  color: #f97316;
}
.prevent .prevent-result.severe .result-number {
  color: #ef4444;
}
.prevent .result-unit {
  font-size: 1rem;
  color: var(--vp-c-text-3);
}
.prevent .result-right {
  display: flex;
  flex-direction: column;
  gap: 5px;
  flex: 1;
}
.prevent .result-top {
  display: flex;
  align-items: baseline;
  gap: 0.75rem;
  flex-wrap: wrap;
}
.prevent .result-level {
  font-size: 1.05rem;
  font-weight: 700;
  color: var(--vp-c-text-1);
}
.prevent .result-en {
  font-size: 0.78rem;
  font-weight: 600;
  color: var(--vp-c-brand-1);
}
.prevent .result-advice {
  font-size: 0.85rem;
  color: var(--vp-c-text-2);
  font-weight: 600;
}
.prevent .result-detail {
  font-size: 0.78rem;
  color: var(--vp-c-text-2);
  line-height: 1.55;
}
.prevent /* ── Management bar ─────────────────────────────────────────── */
.mgmt-bar {
  display: flex;
  align-items: center;
  gap: 0.7rem;
  padding: 0.85rem 1rem;
  border-radius: 10px;
  font-size: 0.82rem;
  color: var(--vp-c-text-2);
  margin-bottom: 1rem;
  line-height: 1.6;
  border: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg-soft);
  transition: all 0.3s;
}
.prevent .mgmt-low {
  border-color: rgba(34, 197, 94, 0.3);
  background: rgba(34, 197, 94, 0.04);
}
.prevent .mgmt-border {
  border-color: rgba(245, 158, 11, 0.4);
  background: rgba(245, 158, 11, 0.05);
}
.prevent .mgmt-mid {
  border-color: rgba(249, 115, 22, 0.4);
  background: rgba(249, 115, 22, 0.05);
}
.prevent .mgmt-high {
  border-color: rgba(239, 68, 68, 0.4);
  background: rgba(239, 68, 68, 0.05);
}
.prevent .mgmt-icon {
  font-size: 1.1rem;
  font-weight: 700;
  flex-shrink: 0;
  line-height: 1.6;
}
.prevent .mgmt-low .mgmt-icon {
  color: #22c55e;
}
.prevent .mgmt-border .mgmt-icon {
  color: #f59e0b;
}
.prevent .mgmt-mid .mgmt-icon {
  color: #f97316;
}
.prevent .mgmt-high .mgmt-icon {
  color: #ef4444;
}
.prevent /* ── Results detail ────────────────────────────────────────── */
.results-detail {
  border: 1px solid var(--vp-c-divider);
  border-radius: 10px;
  overflow: hidden;
  margin-bottom: 1rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.03);
}
.prevent .results-header {
  padding: 0.5rem 0.9rem;
  font-size: 0.72rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--vp-c-text-3);
  background: var(--vp-c-bg-mute);
  border-bottom: 1px solid var(--vp-c-divider);
}
.prevent .detail-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.6rem;
  padding: 0.45rem 0.9rem;
  border-bottom: 1px solid var(--vp-c-divider);
}
.prevent .detail-row:last-child {
  border-bottom: none;
}
.prevent .total-row {
  background: linear-gradient(135deg, var(--vp-c-bg-mute), var(--vp-c-bg-soft));
  font-weight: 800;
}
.prevent .detail-label {
  font-size: 0.78rem;
  color: var(--vp-c-text-2);
  width: 120px;
  flex-shrink: 0;
}
.prevent .detail-value {
  font-size: 0.82rem;
  font-weight: 70 0;
  color: var(--vp-c-text-1);
  width: 135px;
  flex-shrink: 0;
  text-align: left;
}
.prevent .value-flag {
  color: #ef4444;
}
.prevent .positive {
  color: var(--vp-c-brand-1);
}
.prevent .brand-lbl {
  font-weight: 700;
  color: var(--vp-c-text-1);
}
.prevent /* ── Actions ─────────────────────────────────────────────────── */
.prevent-actions {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}
.prevent .btn-view,
.prevent .btn-copy,
.prevent .btn-reset {
  padding: 9px 22px;
  border-radius: 8px;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  font-family: inherit;
  transition: all 0.2s;
}
.prevent .btn-view {
  border: none;
  background: linear-gradient(135deg, var(--vp-c-brand-1), #4f46e5);
  color: #fff;
  box-shadow: 0 2px 8px rgba(99, 102, 241, 0.3);
}
.prevent .btn-view:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 14px rgba(99, 102, 241, 0.4);
}
.prevent .btn-view:active {
  transform: translateY(0);
}
.prevent .btn-copy {
  border: 1.5px solid var(--vp-c-brand-1);
  background: transparent;
  color: var(--vp-c-brand-1);
}
.prevent .btn-copy:hover:not(:disabled) {
  background: var(--vp-c-brand-soft);
}
.prevent .btn-copy:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}
.prevent .btn-reset {
  border: 1px solid var(--vp-c-divider);
  background: transparent;
  color: var(--vp-c-text-2);
}
.prevent .btn-reset:hover {
  border-color: #ef4444;
  color: #ef4444;
  background: rgba(239, 68, 68, 0.04);
}

@media (max-width: 640px) {
.prevent .prevent-header {
    flex-wrap: wrap;
  }
.prevent .score-badge {
    align-self: flex-start;
  }
.prevent .score-number {
    font-size: 1.5rem;
  }
.prevent .risk-strip {
    grid-template-columns: repeat(2, 1fr);
  }
.prevent .prevent-result {
    flex-direction: column;
    gap: 0.75rem;
  }
}
/* ══════════════ Shared score badge（各工具統一樣式）══════════════ */
.cvriskassess .score-badge {
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
.cvriskassess .score-number {
  font-size: 1.7rem;
  font-weight: 800;
  line-height: 1;
  transition: color 0.3s;
}
.cvriskassess .score-unit {
  font-size: 0.66rem;
  font-weight: 700;
  margin-top: 2px;
  opacity: 0.75;
}
.cvriskassess .score-label {
  font-size: 0.66rem;
  font-weight: 600;
  margin-top: 3px;
  letter-spacing: 0.01em;
  text-align: center;
  line-height: 1.25;
  word-break: break-word;
  max-width: 100%;
}
.cvriskassess .score-badge.pending {
  border-color: var(--vp-c-divider);
  color: var(--vp-c-text-3);
}
.cvriskassess .score-badge.normal {
  border-color: #22c55e;
  color: #22c55e;
}
.cvriskassess .score-badge.mild {
  border-color: #f59e0b;
  color: #f59e0b;
}
.cvriskassess .score-badge.moderate {
  border-color: #f97316;
  color: #f97316;
}
.cvriskassess .score-badge.badge-male {
  border-color: #38bdf8;
  color: #38bdf8;
}
.cvriskassess .score-badge.badge-female {
  border-color: #f472b6;
  color: #f472b6;
}
@media (max-width: 640px) {
  .cvriskassess .score-badge {
    width: auto;
    height: auto;
    min-width: 0;
    min-height: 0;
    padding: 0.5rem 0.9rem;
  }
}

/* ══ Unified consensus font sizes ══ */
.cvriskassess .subtitle { font-size: 0.82rem !important; color: var(--vp-c-text-2) !important; }
.cvriskassess .group-label { font-size: 0.92rem !important; font-weight: 700 !important; }
.cvriskassess .group-sub { font-size: 0.78rem !important; color: var(--vp-c-text-2) !important; }
.cvriskassess .group-label-text { font-size: 0.92rem !important; font-weight: 800 !important; }
.cvriskassess .item-qnum { font-size: 0.72rem !important; font-weight: 800 !important; }
.cvriskassess .item-score { font-size: 1rem !important; font-weight: 800 !important; }
.cvriskassess .results-header { font-size: 0.74rem !important; font-weight: 700 !important; }
.cvriskassess .detail-qnum { font-size: 0.74rem !important; }
.cvriskassess .detail-domain { font-size: 0.82rem !important; }
.cvriskassess .detail-desc { font-size: 0.78rem !important; }

/* ══ Enlarged / rearranged score badge ══ */
.cvriskassess .score-badge {
  width: 134px !important;
  min-width: 134px !important;
  height: 110px !important;
  min-height: 110px !important;
  border-width: 1.5px;
}
.cvriskassess .score-number {
  font-size: 2.1rem !important;
}
.cvriskassess .score-label {
  font-size: 0.74rem !important;
  font-weight: 700 !important;
  margin-top: 5px;
  padding: 1px 10px;
  border-radius: 999px;
  background: color-mix(in srgb, currentColor 12%, transparent);
}
/* CPR footnote: CAC / reproductive risk marker definitions */
.prevent .cpr-note {
  display: flex;
  flex-direction: column;
  gap: 5px;
  margin-top: 8px;
  padding-top: 8px;
  border-top: 1px dashed var(--vp-c-divider);
  font-size: 0.76rem;
  line-height: 1.55;
  color: var(--vp-c-text-3);
}
.prevent .cpr-note strong {
  color: var(--vp-c-text-2);
}
</style>
