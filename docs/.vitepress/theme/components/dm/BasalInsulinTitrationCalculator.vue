<script setup lang="ts">
import { ref, computed } from "vue";

type InsulinMode = "basal-only" | "basal-bolus" | "premixed" | "split-mixed";
const mode = ref<InsulinMode>("basal-only");
const modeOpts: {
  value: InsulinMode;
  label: string;
  desc: string;
  icon: string;
}[] = [
  {
    value: "basal-only",
    label: "基礎胰島素",
    desc: "Basal-Only (Glargine/Detemir/Degludec)",
    icon: "🌙",
  },
  {
    value: "basal-bolus",
    label: "基礎-餐食胰島素",
    desc: "Basal-Bolus (基礎 + 速效)",
    icon: "🍽",
  },
  {
    value: "premixed",
    label: "預混型胰島素",
    desc: "Pre-mixed (NovoMix/Humalog Mix/Ryzodeg)",
    icon: "🔀",
  },
  {
    value: "split-mixed",
    label: "分次混合療法",
    desc: "Split-Mixed (NPH + Regular)",
    icon: "⚗",
  },
];

// ── Shared inputs ─────────────────────────────────────────────────
const weightInput = ref("");
const weight = computed(() => {
  const v = parseFloat(weightInput.value);
  return isNaN(v) || v <= 0 ? null : v;
});

const currentDoseInput = ref("");
const currentDose = computed(() => {
  const d = parseFloat(currentDoseInput.value);
  return isNaN(d) || d <= 0 ? null : d;
});

const avgFBGInput = ref("");
const avgFBG = computed(() => {
  const f = parseFloat(avgFBGInput.value);
  return isNaN(f) || f <= 0 ? null : f;
});

const hadHypo = ref(false);
const copied = ref(false);

// ── Basal-only ────────────────────────────────────────────────────
const basalStartDose = computed(() => {
  if (weight.value === null) return null;
  return Math.max(10, Math.round(weight.value * 0.2));
});

const basalStopThreshold = computed(() => {
  if (weight.value === null) return null;
  return Math.round(weight.value * 0.5);
});

const basalIntensify = computed(() => {
  if (weight.value === null || currentDose.value === null) return null;
  return currentDose.value >= basalStopThreshold.value;
});

const basalCurrentDose = computed(() => {
  if (currentDose.value !== null) return currentDose.value;
  if (basalStartDose.value !== null) return basalStartDose.value;
  return null;
});

// ── Basal-bolus inputs ────────────────────────────────────────────
const preMealBGInput = ref("");
const preMealBG = computed(() => {
  const v = parseFloat(preMealBGInput.value);
  return isNaN(v) || v <= 0 ? null : v;
});

const preMealTargetInput = ref("140");
const preMealTarget = computed(() => {
  const v = parseFloat(preMealTargetInput.value);
  return isNaN(v) || v <= 0 ? 140 : v;
});

// ── Premixed inputs ────────────────────────────────────────────────
type PremixType = "novomix30" | "humalog25" | "humalog50" | "ryzodeg";
const premixType = ref<PremixType>("novomix30");
const premixOpts: {
  value: PremixType;
  label: string;
  rapid: string;
  basal: string;
  note: string;
}[] = [
  {
    value: "novomix30",
    label: "NovoMix 30",
    rapid: "30% Aspart",
    basal: "70% Protamine Aspart",
    note: "餐前立即注射",
  },
  {
    value: "humalog25",
    label: "Humalog Mix 25",
    rapid: "25% Lispro",
    basal: "75% Lispro Protamine",
    note: "餐前15分鐘注射",
  },
  {
    value: "humalog50",
    label: "Humalog Mix 50",
    rapid: "50% Lispro",
    basal: "50% Lispro Protamine",
    note: "餐前立即注射，適合高碳水化合物餐",
  },
  {
    value: "ryzodeg",
    label: "Ryzodeg",
    rapid: "30% Aspart",
    basal: "70% Degludec",
    note: "QD 最大餐注射 or BID 早晚餐前（視方便性選擇）",
  },
];

// ── Split-mixed inputs ────────────────────────────────────────────
const preLunchBGInput = ref("");
const preLunchBG = computed(() => {
  const v = parseFloat(preLunchBGInput.value);
  return isNaN(v) || v <= 0 ? null : v;
});

const preDinnerBGInput = ref("");
const preDinnerBG = computed(() => {
  const v = parseFloat(preDinnerBGInput.value);
  return isNaN(v) || v <= 0 ? null : v;
});

const bedtimeBGInput = ref("");
const bedtimeBG = computed(() => {
  const v = parseFloat(bedtimeBGInput.value);
  return isNaN(v) || v <= 0 ? null : v;
});

// ── Titration result type ─────────────────────────────────────────
type TitrationStatus = "increase" | "decrease" | "hold" | "hypo";

type TitrationResult = {
  adjustment: number;
  newDose: number;
  reason: string;
  status: TitrationStatus;
};

// ── Taiwan Method 1: 依FBG每3天調整 ─────────────────────────────
// 起始: 10 U/day 或 0.1–0.2 U/kg/day
// 每3天: FBG > 130 增 10–15% 或 2–4 U; 低血糖減 4 U 或 10–20%
const taiwanMethod1 = computed<TitrationResult | null>(() => {
  if (basalCurrentDose.value === null || avgFBG.value === null) return null;
  const dose = basalCurrentDose.value;
  const fbg = avgFBG.value;

  if (hadHypo.value || fbg < 70) {
    const reduction = Math.max(4, Math.round(dose * 0.15));
    return {
      adjustment: -reduction,
      newDose: Math.max(0, dose - reduction),
      reason:
        "低血糖（< 70 mg/dL）：減少 4 units 或 10–20%（取較大值），並查明原因",
      status: "hypo",
    };
  }
  if (fbg > 180) {
    const inc = Math.max(4, Math.round(dose * 0.15));
    return {
      adjustment: inc,
      newDose: dose + inc,
      reason: `FBG > 180 mg/dL：增加 ${inc} units（15% 或 4 U，取較大值）`,
      status: "increase",
    };
  }
  if (fbg > 130) {
    const inc = Math.max(2, Math.round(dose * 0.1));
    return {
      adjustment: inc,
      newDose: dose + inc,
      reason: `FBG 130–180 mg/dL：增加 ${inc} units（10% 或 2 U，取較大值）`,
      status: "increase",
    };
  }
  return {
    adjustment: 0,
    newDose: dose,
    reason: "FBG 80–130 mg/dL，已達目標，劑量不變",
    status: "hold",
  };
});

// ── Taiwan Method 2: 每天增加1單位 ───────────────────────────────
// 起始後每天+1U 直至 FBG 達 80–130
const taiwanMethod2 = computed<TitrationResult | null>(() => {
  if (basalCurrentDose.value === null || avgFBG.value === null) return null;
  const dose = basalCurrentDose.value;
  const fbg = avgFBG.value;

  if (hadHypo.value || fbg < 70) {
    const reduction = Math.max(4, Math.round(dose * 0.15));
    return {
      adjustment: -reduction,
      newDose: Math.max(0, dose - reduction),
      reason: "低血糖（< 70 mg/dL）：減少 4 units 或 10–20%，並查明原因",
      status: "hypo",
    };
  }
  if (fbg > 130) {
    return {
      adjustment: 1,
      newDose: dose + 1,
      reason: "FBG > 130 mg/dL（未達標）：每天增加 1 unit 直至目標",
      status: "increase",
    };
  }
  return {
    adjustment: 0,
    newDose: dose,
    reason: "FBG 80–130 mg/dL，已達目標",
    status: "hold",
  };
});

type Algorithm = {
  key: string;
  name: string;
  sub: string;
  frequency: string;
  result: TitrationResult | null;
};
const algorithms = computed<Algorithm[]>(() => [
  {
    key: "m1",
    name: "方法一：依 FBG 每 3 天調整",
    sub: "10–15% 或 2–4 U，臺灣糖尿病指引",
    frequency: "每 3 天",
    result: taiwanMethod1.value,
  },
  {
    key: "m2",
    name: "方法二：每天加 1 單位",
    sub: "+1 U/day 直至達標",
    frequency: "每天",
    result: taiwanMethod2.value,
  },
]);

const OAD_RECOMMEND = [
  { drug: "Metformin", rec: "繼續合併使用（除非有禁忌）" },
  {
    drug: "Pioglitazone",
    rec: "考量胰島素阻抗時可使用；注意體液滯留與體重增加風險",
  },
  {
    drug: "SUs / Glinides",
    rec: "Basal-Plus 治療時可續用（減少 BI 劑量），但低血糖及體重增加風險較高",
  },
  { drug: "DPP-4i", rec: "可繼續使用" },
  {
    drug: "SGLT2i",
    rec: "可持續使用；心腎共病或減重可考慮加上；注意 euglycemic DKA",
  },
  {
    drug: "GLP-1 RA",
    rec: "ADA 優先選擇之注射藥物；依臺灣健保規範，可考慮 OADs+GLP-1 RA 或 OADs+BI+GLP-1 RA",
  },
];

// ── Basal-bolus calculations ──────────────────────────────────────
const bbTDD = computed(() => {
  if (weight.value === null) return null;
  if (currentDose.value !== null) {
    // Already on basal, estimate TDD from current basal (basal ~50% of TDD)
    return Math.round(currentDose.value * 2);
  }
  return Math.round(weight.value * 0.5);
});

const bbBasal = computed(() => {
  if (bbTDD.value === null) return null;
  return Math.round(bbTDD.value * 0.5);
});

const bbBolusPerMeal = computed(() => {
  if (bbTDD.value === null) return null;
  return Math.max(2, Math.round((bbTDD.value * 0.5) / 3));
});

const bbISF = computed(() => {
  if (bbTDD.value === null) return null;
  return Math.round(1800 / bbTDD.value);
});

const bbISFReg = computed(() => {
  if (bbTDD.value === null) return null;
  return Math.round(1500 / bbTDD.value);
});

const bbCarbRatio = computed(() => {
  if (bbTDD.value === null) return null;
  const ratio = Math.round(500 / bbTDD.value);
  return ratio < 5 ? 5 : ratio;
});

const bbPreMealAdjustment = computed(() => {
  if (
    preMealBG.value === null ||
    bbISF.value === null ||
    preMealTarget.value === null
  )
    return null;
  const diff = preMealBG.value - preMealTarget.value;
  if (diff <= 0) return 0;
  return Math.round(diff / bbISF.value);
});

const bbBolusPerMealAdjusted = computed(() => {
  if (bbBolusPerMeal.value === null) return null;
  if (bbPreMealAdjustment.value === null || bbPreMealAdjustment.value === 0)
    return bbBolusPerMeal.value;
  return bbBolusPerMeal.value + bbPreMealAdjustment.value;
});

// ── Premixed calculations ─────────────────────────────────────────
const premixTDD = computed(() => {
  if (weight.value === null) return null;
  return Math.round(weight.value * 0.3); // 0.3 units/kg as starting dose
});

const premixMorning = computed(() => {
  if (premixTDD.value === null) return null;
  const total = premixTDD.value;
  if (premixType.value === "ryzodeg") return total; // QD at largest meal
  return Math.round((total * 2) / 3);
});

const premixEvening = computed(() => {
  if (premixTDD.value === null) return null;
  const total = premixTDD.value;
  if (premixType.value === "ryzodeg") return 0; // QD only
  return Math.round((total * 1) / 3);
});

const premixTitrateMorning = computed(() => {
  if (preDinnerBG.value === null || premixMorning.value === null) return null;
  if (hadHypo.value) {
    const adj = Math.max(2, Math.round(premixMorning.value * 0.1));
    return {
      adj: -adj,
      newDose: Math.max(0, premixMorning.value - adj),
      reason: "曾發生低血糖：減少早餐前劑量",
    };
  }
  if (preDinnerBG.value > 180)
    return {
      adj: 2,
      newDose: premixMorning.value + 2,
      reason: "晚餐前血糖 > 180 mg/dL：增加早餐前劑量 2 units",
    };
  if (preDinnerBG.value > 130)
    return {
      adj: 2,
      newDose: premixMorning.value + 2,
      reason: "晚餐前血糖 > 130 mg/dL（未達標）：可考慮增加早餐前劑量 2 units",
    };
  return {
    adj: 0,
    newDose: premixMorning.value,
    reason: "晚餐前血糖 80–130 mg/dL，已達標",
  };
});

const premixTitrateEvening = computed(() => {
  if (avgFBG.value === null || premixEvening.value === null) return null;
  if (hadHypo.value) {
    const adj = Math.max(2, Math.round(premixEvening.value * 0.1));
    return {
      adj: -adj,
      newDose: Math.max(0, premixEvening.value - adj),
      reason: "曾發生低血糖：減少晚餐前劑量",
    };
  }
  if (avgFBG.value > 180)
    return {
      adj: 2,
      newDose: premixEvening.value + 2,
      reason: "空腹血糖 > 180 mg/dL：增加晚餐前劑量 2 units",
    };
  if (avgFBG.value > 130)
    return {
      adj: 2,
      newDose: premixEvening.value + 2,
      reason: "空腹血糖 > 130 mg/dL（未達標）：可考慮增加晚餐前劑量 2 units",
    };
  return {
    adj: 0,
    newDose: premixEvening.value,
    reason: "空腹血糖 80–130 mg/dL，已達標",
  };
});

// ── Split-mixed calculations ──────────────────────────────────────
const smTDD = computed(() => {
  if (weight.value === null) return null;
  return Math.round(weight.value * 0.4);
});

const smMorningTotal = computed(() => {
  if (smTDD.value === null) return null;
  return Math.round((smTDD.value * 2) / 3);
});

const smEveningTotal = computed(() => {
  if (smTDD.value === null) return null;
  return Math.max(0, smTDD.value - (smMorningTotal.value ?? 0));
});

const smMorningNPH = computed(() => {
  if (smMorningTotal.value === null) return null;
  return Math.round((smMorningTotal.value * 2) / 3);
});

const smMorningReg = computed(() => {
  if (smMorningTotal.value === null || smMorningNPH.value === null) return null;
  return Math.max(0, smMorningTotal.value - smMorningNPH.value);
});

const smEveningNPH = computed(() => {
  if (smEveningTotal.value === null) return null;
  return Math.round((smEveningTotal.value * 1) / 2);
});

const smEveningReg = computed(() => {
  if (smEveningTotal.value === null || smEveningNPH.value === null) return null;
  return Math.max(0, smEveningTotal.value - smEveningNPH.value);
});

const smISF = computed(() => {
  if (smTDD.value === null) return null;
  return Math.round(1500 / smTDD.value);
});

// ── Reset ─────────────────────────────────────────────────────────
function reset() {
  mode.value = "basal-only";
  weightInput.value = "";
  currentDoseInput.value = "";
  avgFBGInput.value = "";
  hadHypo.value = false;
  preMealBGInput.value = "";
  preMealTargetInput.value = "140";
  premixType.value = "novomix30";
  preLunchBGInput.value = "";
  preDinnerBGInput.value = "";
  bedtimeBGInput.value = "";
}

// ── Copy markdown ─────────────────────────────────────────────────
function generateMarkdown() {
  const today = new Date();
  const date = `${today.getFullYear()}/${String(today.getMonth() + 1).padStart(2, "0")}/${String(today.getDate()).padStart(2, "0")}`;
  const m = modeOpts.find((o) => o.value === mode.value)!;
  let body = `# T2DM 胰島素治療建議\n\n## 評估日期：${date}\n\n## 選擇模式：${m.label}（${m.desc}）\n`;

  if (mode.value === "basal-only") {
    body += `\n## 患者資料\n- 體重：${weight.value} kg\n- 建議起始劑量：${basalStartDose.value} units/day\n`;
    if (currentDose.value !== null)
      body += `- 目前基礎胰島素劑量：${currentDose.value} units/day\n`;
    body += `- 平均空腹血糖：${avgFBG.value} mg/dL\n- 過去一週是否曾發生低血糖：${hadHypo.value ? "是" : "否"}\n`;
    if (basalStopThreshold.value !== null)
      body += `- 強化治療閾值：> ${basalStopThreshold.value} units/day（若劑量超過此值仍控制不佳，應考慮加入餐時胰島素）\n`;
    body += `\n## 調整建議\n`;
    for (const a of algorithms.value) {
      if (!a.result) continue;
      const r = a.result;
      const sign = r.adjustment > 0 ? "+" : "";
      body += `- **${a.name}**（${a.frequency}）：${sign}${r.adjustment} units → 新劑量 **${r.newDose} units/day**\n  - ${r.reason}\n`;
    }
  }

  if (mode.value === "basal-bolus") {
    body += `\n## 患者資料\n- 體重：${weight.value} kg\n`;
    if (currentDose.value !== null)
      body += `- 目前基礎胰島素：${currentDose.value} units/day\n`;
    if (preMealBG.value !== null)
      body += `- 餐前血糖：${preMealBG.value} mg/dL（目標 ${preMealTarget.value} mg/dL）\n`;
    body += `\n## 建議處方\n`;
    body += `- 總每日劑量（TDD）：**${bbTDD.value} units/day**\n`;
    body += `- 基礎胰島素：**${bbBasal.value} units/day**\n`;
    body += `- 餐食胰島素（每餐）：**${bbBolusPerMeal.value} units**（三餐前速效胰島素）\n`;
    body += `- 胰島素敏感因子（ISF，1800 法則）：1 unit 速效胰島素可降 **${bbISF.value} mg/dL**\n`;
    if (bbISFReg.value)
      body += `- Regular胰島素敏感因子（1500 法則）：1 unit Regular 可降 **${bbISFReg.value} mg/dL**\n`;
    body += `- 碳水化合物比值（500 法則）：1 unit 速效胰島素可代謝 **${bbCarbRatio.value} g** 碳水化合物\n`;
    if (bbPreMealAdjustment.value !== null && bbPreMealAdjustment.value > 0)
      body += `- 餐前矯正追加：**+${bbPreMealAdjustment.value} units**（血糖 ${preMealBG.value} → ${preMealTarget.value} mg/dL）\n`;
    body += `\n##  titration 指引\n- 每 2–3 天依空腹血糖調整基礎胰島素（目標 FBG 80–130 mg/dL）\n- 每 2–3 天依餐後 2 小時血糖調整餐食胰島素（目標 < 180 mg/dL）\n- 低血糖（< 70 mg/dL）時減少相對應劑量 10–20%\n`;
  }

  if (mode.value === "premixed") {
    const p = premixOpts.find((o) => o.value === premixType.value)!;
    body += `\n## 患者資料\n- 體重：${weight.value} kg\n- 選擇藥物：${p.label}（${p.rapid} / ${p.basal}）\n- 平均空腹血糖：${avgFBG.value} mg/dL\n`;
    if (preDinnerBG.value !== null)
      body += `- 晚餐前血糖：${preDinnerBG.value} mg/dL\n`;
    body += `\n## 建議起始處方\n`;
    body += `- 總每日劑量（TDD）：**${premixTDD.value} units/day**\n`;
    if (premixType.value === "ryzodeg") {
      const bidAM = Math.round((premixTDD.value * 2) / 3);
      const bidPM = premixTDD.value - bidAM;
      body += `- Ryzodeg QD：**${premixMorning.value} units** 最大餐注射（單純、順從性佳）\n`;
      body += `- 或 BID 早晚分次：早餐前 **${bidAM} units**，晚餐前 **${bidPM} units**（餐後血糖控制更佳）\n`;
    } else {
      body += `- 早餐前：**${premixMorning.value} units**\n`;
      body += `- 晚餐前：**${premixEvening.value} units**\n`;
    }
    if (weight.value !== null) {
      const altTDD = Math.round(weight.value * 0.5);
      const altBasal = Math.round(altTDD * 0.5);
      const altBolus = Math.max(2, Math.round((altTDD * 0.5) / 3));
      const altISF = Math.round(1800 / altTDD);
      const altCarb = Math.max(5, Math.round(500 / altTDD));
      body += `\n## 次要處方（basal-bolus 方案）\n`;
      body += `若預混胰島素控制不佳（HbA1c 仍不達標）、餐後血糖波動大，或需更彈性調整劑量，建議轉換為基礎‑餐食胰島素方案：\n`;
      body += `- 總每日劑量（TDD）：**${altTDD} units/day**（體重 × 0.5 units/kg）\n`;
      body += `- 基礎胰島素：**${altBasal} units/day**（50% TDD）\n`;
      body += `- 餐食胰島素（每餐）：**${altBolus} units**（三餐前速效，剩餘 50% ÷ 3）\n`;
      body += `- 胰島素敏感因子（ISF，1800 法則）：1 unit 速效可降 **${altISF} mg/dL**\n`;
      body += `- 碳水化合物比值（500 法則）：1 unit 速效可代謝 **${altCarb} g** CHO\n`;
    }
    body += `\n## titration 指引\n`;
    if (premixTitrateMorning.value)
      body += `- 早餐前劑量：${premixTitrateMorning.value.reason}（→ ${premixTitrateMorning.value.newDose} units）\n`;
    if (premixTitrateEvening.value)
      body += `- 晚餐前劑量：${premixTitrateEvening.value.reason}（→ ${premixTitrateEvening.value.newDose} units）\n`;
    body += `- 調整頻率：每 3–5 天調整一次\n- 低血糖（< 70 mg/dL）時減少相對應劑量 10–20%\n`;
  }

  if (mode.value === "split-mixed") {
    body += `\n## 患者資料\n- 體重：${weight.value} kg\n- 平均空腹血糖：${avgFBG.value} mg/dL\n`;
    if (preLunchBG.value !== null)
      body += `- 午餐前血糖：${preLunchBG.value} mg/dL\n`;
    if (preDinnerBG.value !== null)
      body += `- 晚餐前血糖：${preDinnerBG.value} mg/dL\n`;
    if (bedtimeBG.value !== null)
      body += `- 睡前血糖：${bedtimeBG.value} mg/dL\n`;
    body += `\n## 建議處方\n`;
    body += `- 總每日劑量（TDD）：**${smTDD.value} units/day**\n`;
    body += `- 早餐前：NPH **${smMorningNPH.value} units** + Regular **${smMorningReg.value} units**（2:1 比例）\n`;
    body += `- 晚餐前：NPH **${smEveningNPH.value} units** + Regular **${smEveningReg.value} units**（1:1 比例）\n`;
    body += `- Regular 胰島素敏感因子（1500 法則）：1 unit Regular 可降 **${smISF.value} mg/dL**\n`;
    body += `\n## titration 指引\n`;
    body += `- 早餐前 Regular → 依午餐前血糖調整（目標 < 140 mg/dL）\n`;
    body += `- 早餐前 NPH → 依晚餐前血糖調整（目標 80–130 mg/dL）\n`;
    body += `- 晚餐前 Regular → 依睡前血糖調整（目標 < 140 mg/dL）\n`;
    body += `- 晚餐前 NPH → 依空腹血糖調整（目標 80–130 mg/dL）\n`;
    body += `- 調整頻率：每 3–5 天調整一次，每次增減 2–4 units\n`;
    body += `- 低血糖（< 70 mg/dL）時減少相對應劑量 10–20%\n`;
  }

  body += `\n> 劑量調整建議僅供臨床參考，請依個別病人狀況、低血糖風險及醫囑調整。`;
  return body;
}

async function copyMarkdown() {
  const md = generateMarkdown();
  if (!md) return;
  await navigator.clipboard.writeText(md);
  copied.value = true;
  setTimeout(() => (copied.value = false), 2000);
}
</script>

<template>
  <div class="ins">
    <!-- Mode Selection -->
    <div class="mode-section">
      <div class="group-header-bar mode-bar">
        <span class="group-icon">🎯</span>
        <span class="group-label-text">Step 1 · 選擇胰島素治療模式</span>
        <span class="group-sub-text">請選擇適合病人的 T2DM 胰島素方案</span>
      </div>
      <div class="mode-grid">
        <button
          v-for="opt in modeOpts"
          :key="opt.value"
          class="mode-card"
          :class="{ active: mode === opt.value }"
          @click="mode = opt.value"
        >
          <span class="mode-icon">{{ opt.icon }}</span>
          <div class="item-name-block">
            <span class="item-name">{{ opt.label }}</span>
            <span class="item-sub">{{ opt.desc }}</span>
          </div>
        </button>
      </div>
    </div>

    <!-- Step 2: Inputs -->
    <div class="input-section">
      <div class="group-header-bar input-bar">
        <span class="group-icon">📝</span>
        <span class="group-label-text">Step 2 · 病人參數輸入</span>
        <span class="group-sub-text">依所選模式填寫對應資料</span>
      </div>

      <!-- Shared: Weight -->
      <div class="input-row">
        <label class="input-label">體重 Body Weight</label>
        <div class="input-wrap" :class="{ 'input-filled': weightInput !== '' }">
          <input
            v-model="weightInput"
            type="number"
            min="20"
            max="300"
            step="0.1"
            placeholder="例如：70"
            class="num-input"
          />
          <span class="input-unit">kg</span>
        </div>
      </div>

      <!-- Basal-only -->
      <template v-if="mode === 'basal-only'">
        <div class="input-row">
          <label class="input-label"
            >目前劑量
            <span class="opt-tag">選填 — 留空則以體重估算起始劑量</span></label
          >
          <div
            class="input-wrap"
            :class="{ 'input-filled': currentDoseInput !== '' }"
          >
            <input
              v-model="currentDoseInput"
              type="number"
              min="0"
              step="1"
              placeholder="留空以體重估算"
              class="num-input"
            />
            <span class="input-unit">units/day</span>
          </div>
        </div>
        <div class="input-row">
          <label class="input-label">平均空腹血糖（FBG）</label>
          <div
            class="input-wrap"
            :class="{ 'input-filled': avgFBGInput !== '' }"
          >
            <input
              v-model="avgFBGInput"
              type="number"
              min="0"
              step="1"
              placeholder="例如：145"
              class="num-input"
            />
            <span class="input-unit">mg/dL</span>
          </div>
        </div>
        <label class="hypo-check">
          <input type="checkbox" v-model="hadHypo" />
          <span>過去一週內曾發生低血糖（血糖 &lt; 70 mg/dL）或低血糖症狀</span>
        </label>
      </template>

      <!-- Basal-bolus -->
      <template v-if="mode === 'basal-bolus'">
        <div class="input-row">
          <label class="input-label"
            >目前基礎胰島素劑量
            <span class="opt-tag">選填（已用藥者）</span></label
          >
          <div
            class="input-wrap"
            :class="{ 'input-filled': currentDoseInput !== '' }"
          >
            <input
              v-model="currentDoseInput"
              type="number"
              min="0"
              step="1"
              placeholder="留空則以體重估算"
              class="num-input"
            />
            <span class="input-unit">units/day</span>
          </div>
        </div>
        <div class="input-row">
          <label class="input-label"
            >餐前血糖 <span class="opt-tag">選填</span></label
          >
          <div
            class="input-wrap"
            :class="{ 'input-filled': preMealBGInput !== '' }"
          >
            <input
              v-model="preMealBGInput"
              type="number"
              min="0"
              step="1"
              placeholder="例如：160"
              class="num-input"
            />
            <span class="input-unit">mg/dL</span>
          </div>
        </div>
        <div class="input-row">
          <label class="input-label">餐前血糖目標</label>
          <div class="input-wrap input-filled-shim">
            <input
              v-model="preMealTargetInput"
              type="number"
              min="80"
              max="180"
              step="5"
              placeholder="140"
              class="num-input"
            />
            <span class="input-unit">mg/dL</span>
          </div>
        </div>
      </template>

      <!-- Premixed -->
      <template v-if="mode === 'premixed'">
        <div class="premix-select">
          <span
            class="input-label"
            style="margin-bottom: 0.4rem; display: block"
            >選擇預混型胰島素</span
          >
          <div class="premix-grid">
            <button
              v-for="p in premixOpts"
              :key="p.value"
              class="premix-card"
              :class="{ active: premixType === p.value }"
              @click="premixType = p.value"
            >
              <span class="premix-name">{{ p.label }}</span>
              <span class="premix-composition"
                >{{ p.rapid }} / {{ p.basal }}</span
              >
              <span class="premix-note">{{ p.note }}</span>
            </button>
          </div>
        </div>
        <div class="input-row">
          <label class="input-label">平均空腹血糖（FBG）</label>
          <div
            class="input-wrap"
            :class="{ 'input-filled': avgFBGInput !== '' }"
          >
            <input
              v-model="avgFBGInput"
              type="number"
              min="0"
              step="1"
              placeholder="例如：145"
              class="num-input"
            />
            <span class="input-unit">mg/dL</span>
          </div>
        </div>
        <div class="input-row">
          <label class="input-label"
            >晚餐前血糖 <span class="opt-tag">選填</span></label
          >
          <div
            class="input-wrap"
            :class="{ 'input-filled': preDinnerBGInput !== '' }"
          >
            <input
              v-model="preDinnerBGInput"
              type="number"
              min="0"
              step="1"
              placeholder="例如：160"
              class="num-input"
            />
            <span class="input-unit">mg/dL</span>
          </div>
        </div>
        <label class="hypo-check">
          <input type="checkbox" v-model="hadHypo" />
          <span>過去一週內曾發生低血糖（血糖 &lt; 70 mg/dL）</span>
        </label>
      </template>

      <!-- Split-mixed -->
      <template v-if="mode === 'split-mixed'">
        <div class="input-row">
          <label class="input-label">平均空腹血糖（FBG）</label>
          <div
            class="input-wrap"
            :class="{ 'input-filled': avgFBGInput !== '' }"
          >
            <input
              v-model="avgFBGInput"
              type="number"
              min="0"
              step="1"
              placeholder="例如：145"
              class="num-input"
            />
            <span class="input-unit">mg/dL</span>
          </div>
        </div>
        <div class="input-row">
          <label class="input-label"
            >午餐前血糖 <span class="opt-tag">選填</span></label
          >
          <div
            class="input-wrap"
            :class="{ 'input-filled': preLunchBGInput !== '' }"
          >
            <input
              v-model="preLunchBGInput"
              type="number"
              min="0"
              step="1"
              placeholder="例如：150"
              class="num-input"
            />
            <span class="input-unit">mg/dL</span>
          </div>
        </div>
        <div class="input-row">
          <label class="input-label"
            >晚餐前血糖 <span class="opt-tag">選填</span></label
          >
          <div
            class="input-wrap"
            :class="{ 'input-filled': preDinnerBGInput !== '' }"
          >
            <input
              v-model="preDinnerBGInput"
              type="number"
              min="0"
              step="1"
              placeholder="例如：160"
              class="num-input"
            />
            <span class="input-unit">mg/dL</span>
          </div>
        </div>
        <div class="input-row">
          <label class="input-label"
            >睡前血糖 <span class="opt-tag">選填</span></label
          >
          <div
            class="input-wrap"
            :class="{ 'input-filled': bedtimeBGInput !== '' }"
          >
            <input
              v-model="bedtimeBGInput"
              type="number"
              min="0"
              step="1"
              placeholder="例如：140"
              class="num-input"
            />
            <span class="input-unit">mg/dL</span>
          </div>
        </div>
      </template>
    </div>

    <!-- Step 3: Results -->
    <div class="results-section">
      <div class="group-header-bar result-bar">
        <span class="group-icon">💡</span>
        <span class="group-label-text">Step 3 · 建議與調整指引</span>
      </div>

      <!-- Basal-only results -->
      <template v-if="mode === 'basal-only'">
        <div v-if="!weight" class="progress-hint">
          請輸入體重以計算建議起始劑量
        </div>
        <div v-else class="bo-start-card">
          <div class="bo-start-header">🌙 建議起始處方</div>
          <div class="bo-start-body">
            <div class="bo-start-stat">
              <span class="bo-start-val">{{ basalStartDose }}</span>
              <span class="bo-start-unit">units/day</span>
            </div>
            <div class="bo-start-detail">
              <div>
                體重 <strong>{{ weight }} kg</strong>，建議起始
                <strong>{{ basalStartDose }} units/day</strong>（10 units 或 0.2
                × {{ weight }} =
                {{ Math.round(weight * 0.2) }} units，取較大值）
              </div>
              <div class="bo-start-sub">
                亦可按 0.1–0.2 units/kg/day 起始（即
                {{ Math.round(weight * 0.1) }}–{{ Math.round(weight * 0.2) }}
                units/day）
              </div>
              <div class="bo-start-sub">
                可選藥物：Glargine（U-100/U-300）、Detemir、Degludec（Tresiba），每日一次固定時間注射
              </div>
              <div class="bo-start-sub toujeo-note" v-if="basalStartDose">
                ⚠ Toujeo（Glargine U-300）濃度 300 U/mL = U-100 的 3 倍。<br />
                <strong>{{ basalStartDose }} units</strong> × 體積/unit：<br />
                ・Toujeo（U-300）=
                {{ (basalStartDose / 300).toFixed(3) }} mL（每 1 unit = 0.00333
                mL）<br />
                ・U-100 胰島素 = {{ (basalStartDose / 100).toFixed(3) }} mL（每
                1 unit = 0.01 mL）<br />
                → 相同單位數，Toujeo 注射體積僅 U-100 的
                <strong>1/3</strong>，病人感覺「打更少」。<br />
                轉換：建議 1:1 起始，未達標可調至
                <strong
                  >{{ Math.round(basalStartDose * 1.15) }}–{{
                    Math.round(basalStartDose * 1.2)
                  }}
                  units/day</strong
                >（+15–20%）。<br />
                僅有預填筆（SoloStar / Max SoloStar），不可用 U-100
                空針抽取（濃度不同會導致 3 倍 overdose）。
              </div>
            </div>
          </div>
        </div>

        <!-- OADs co-administration -->
        <details class="oad-ref">
          <summary class="oad-ref-summary">💊 OADs 合併使用建議</summary>
          <div class="oad-table">
            <div class="oad-row oad-row-header">
              <span class="oad-rowhead">口服藥</span>
              <span class="oad-rowhead">建議</span>
            </div>
            <div class="oad-row" v-for="r in OAD_RECOMMEND" :key="r.drug">
              <span class="oad-drug">{{ r.drug }}</span>
              <span class="oad-rec">{{ r.rec }}</span>
            </div>
          </div>
          <div class="ref-note">
            參照 2022 ADA 指引、臺灣健保給付規範及糖尿病學會建議
          </div>
        </details>

        <div v-if="!avgFBG" class="progress-hint" style="margin-top: 0.5rem">
          請輸入平均空腹血糖以查看滴定建議
        </div>
        <template v-if="basalCurrentDose && avgFBG">
          <div class="algo-list">
            <div
              v-for="a in algorithms"
              :key="a.key"
              class="algo-card"
              :class="a.result?.status"
            >
              <div class="algo-header">
                <div class="algo-name-block">
                  <div class="algo-name">{{ a.name }}</div>
                  <div class="algo-sub">{{ a.sub }}</div>
                </div>
                <div class="algo-freq">{{ a.frequency }}</div>
              </div>
              <div class="algo-result" v-if="a.result">
                <div class="algo-dose">
                  <span class="dose-from">{{ basalCurrentDose }}</span>
                  <span class="dose-arrow">→</span>
                  <span class="dose-to" :class="a.result.status">{{
                    a.result.newDose
                  }}</span>
                  <span class="dose-unit-label">units/day</span>
                  <span class="dose-adj" :class="a.result.status"
                    >({{ a.result.adjustment > 0 ? "+" : ""
                    }}{{ a.result.adjustment }})</span
                  >
                </div>
                <div class="algo-reason">{{ a.result.reason }}</div>
              </div>
            </div>
          </div>
          <details class="algo-ref">
            <summary class="algo-ref-summary">📊 兩種調整方法說明</summary>
            <div class="ref-table">
              <div class="ref-row ref-row-header">
                <span class="ref-rowhead">項目</span>
                <span
                  v-for="a in algorithms"
                  :key="a.key"
                  class="ref-col-title"
                  >{{ a.name }}</span
                >
              </div>
              <div class="ref-row">
                <span class="ref-rowhead">起始劑量</span>
                <span>10 units 或 0.1–0.2 units/kg/day</span>
                <span>同方法一</span>
              </div>
              <div class="ref-row">
                <span class="ref-rowhead">調整頻率</span>
                <span>每 3 天</span>
                <span>每天</span>
              </div>
              <div class="ref-row">
                <span class="ref-rowhead">血糖目標</span>
                <span>FBG 80–130 mg/dL</span>
                <span>FBG 80–130 mg/dL</span>
              </div>
              <div class="ref-row">
                <span class="ref-rowhead">增量規則</span>
                <span>FBG > 130：+10–15% 或 2–4 U</span>
                <span>FBG > 130：+1 U/day</span>
              </div>
              <div class="ref-row">
                <span class="ref-rowhead">低血糖處置</span>
                <span>減 4 U 或 10–20%</span>
                <span>減 4 U 或 10–20%</span>
              </div>
            </div>
            <div class="ref-note">
              參考：2022 ADA 治療指引、臺灣糖尿病學會（2024）
            </div>
          </details>

          <!-- Stop / intensify threshold -->
          <div class="bo-threshold">
            <div class="bo-thresh-header">🛑 何時停止增加基礎胰島素？</div>
            <ul class="guide-list">
              <li>
                <strong>已達標：</strong>FBG 持續在 80–130 mg/dL，不需再調整
              </li>
              <li>
                <strong>低血糖：</strong>發生低血糖（&lt; 70
                mg/dL）時依演算法減量
              </li>
              <li>
                <strong
                  >基礎劑量 > {{ basalStopThreshold }} units/day（0.5
                  units/kg/day）</strong
                >
                且 FBG 已達標但 A1C 仍未達標 → 應評估加入
                <strong>餐時胰島素（Bolus）</strong> 或 GLP-1
                RA，不應繼續增加基礎劑量
              </li>
            </ul>
          </div>
        </template>
      </template>

      <!-- Basal-bolus results -->
      <template v-if="mode === 'basal-bolus'">
        <p v-if="!weight" class="progress-hint">請輸入體重以開始計算</p>
        <div v-else class="bb-results">
          <div class="result-card">
            <div class="rc-title">📐 建議處方參數</div>
            <div class="bb-grid">
              <div class="bb-stat">
                <span class="bb-stat-val">{{ bbTDD }}</span>
                <span class="bb-stat-label">TDD (units/day)</span>
              </div>
              <div class="bb-stat">
                <span class="bb-stat-val basal-val">{{ bbBasal }}</span>
                <span class="bb-stat-label">基礎胰島素 (units/day)</span>
              </div>
              <div class="bb-stat">
                <span class="bb-stat-val bolus-val">{{
                  bbBolusPerMealAdjusted
                }}</span>
                <span class="bb-stat-label">餐食胰島素 (units/餐)</span>
                <span
                  v-if="bbPreMealAdjustment && bbPreMealAdjustment > 0"
                  class="bb-stat-sub"
                  >基礎 {{ bbBolusPerMeal }} + 矯正
                  {{ bbPreMealAdjustment }}</span
                >
              </div>
              <div class="bb-stat">
                <span class="bb-stat-val carb-val">{{ bbCarbRatio }}</span>
                <span class="bb-stat-label">碳水化合物比值 (g/unit)</span>
              </div>
              <div class="bb-stat">
                <span class="bb-stat-val isf-val">{{ bbISF }}</span>
                <span class="bb-stat-label">ISF 速效 (mg/dL per unit)</span>
              </div>
              <div class="bb-stat" v-if="bbISFReg">
                <span class="bb-stat-val isf-reg-val">{{ bbISFReg }}</span>
                <span class="bb-stat-label">ISF 短效 (mg/dL per unit)</span>
              </div>
            </div>
          </div>

          <div
            class="bb-correction"
            v-if="preMealBG !== null && bbPreMealAdjustment !== null"
          >
            <span v-if="bbPreMealAdjustment > 0" class="corr-need">
              ⚡ 餐前血糖 {{ preMealBG }} mg/dL（目標
              {{ preMealTarget }} mg/dL）， 建議追加
              <strong>+{{ bbPreMealAdjustment }} units</strong> 速效胰島素
            </span>
            <span v-else class="corr-ok">✅ 餐前血糖已達標，不需矯正追加</span>
          </div>

          <div class="guide-card">
            <div class="guide-title">
              📋 起始與 titration 指引（臺灣糖尿病學會）
            </div>
            <ul class="guide-list">
              <li>
                <strong>起始策略：</strong>需 2–3
                天記錄三餐前後血糖，挑選餐後血糖增加最多的餐次作為第一次加打餐前胰島素的時間點（Basal-Plus
                +1）
              </li>
              <li>
                <strong>起始劑量選項：</strong>① 0.1–0.15 units/kg/餐 ② 固定 4
                units 起 ③ 血糖值（mg/dL）÷ 36 ④ 基礎胰島素劑量 × 10% ⑤ 每 1
                unit 涵蓋 10–15 g 醣類估算
              </li>
              <li>
                <strong>基礎調整：</strong>每 2–3 天依 FBG 調整（目標 80–130
                mg/dL），方法同 basal-only 模式
              </li>
              <li>
                <strong>餐食調整：</strong>每週調整 1–2 次，每次 1–2 units 或
                10–15%，依餐後 2h 血糖（目標 &lt; 180 mg/dL）或下一餐前血糖調整
              </li>
              <li>
                <strong>ISF（1800 法則，速效）：</strong>1 unit &asymp;
                {{ bbISF }} mg/dL；<span v-if="bbISFReg"
                  ><strong>ISF（1500 法則，短效 Regular）：</strong>1 unit
                  &asymp; {{ bbISFReg }} mg/dL</span
                >
              </li>
              <li>
                <strong>碳水化合物比值：</strong>速效用 500 法則 → 1 unit :
                {{ bbCarbRatio }} g CHO；短效 Regular 用 450 法則
              </li>
              <li>
                <strong>低血糖：</strong>&lt; 70 mg/dL 時減 2–4 units 或
                10–20%，並查明原因
              </li>
              <li>
                <strong>Basal-Plus 進階：</strong>需加打第 2
                針餐前胰島素（+2）時，建議停用 SUs/Glinides，DPP-4i 視情況停用
              </li>
              <li>
                <strong>替代方案：</strong>亦可選 Ryzodeg（70% Degludec + 30%
                Aspart）於最大餐注射，必要時改 BID
              </li>
              <li>
                <strong>固定劑型合併：</strong>iDegLira（Degludec +
                Liraglutide）、iGlarLixi（Glargine + Lixisenatide）亦可考慮
              </li>
            </ul>
          </div>
        </div>
      </template>

      <!-- Premixed results -->
      <template v-if="mode === 'premixed'">
        <p v-if="!weight" class="progress-hint">請輸入體重以開始計算</p>
        <div v-else class="pm-results">
          <div class="result-card">
            <div class="rc-title">
              🔀 建議起始處方 —
              {{ premixOpts.find((o) => o.value === premixType)?.label }}
            </div>
            <div class="bb-grid">
              <div class="bb-stat">
                <span class="bb-stat-val">{{ premixTDD }}</span>
                <span class="bb-stat-label">TDD (units/day)</span>
              </div>
              <template v-if="premixType === 'ryzodeg'">
                <div class="bb-stat">
                  <span class="bb-stat-val basal-val">{{ premixMorning }}</span>
                  <span class="bb-stat-label">QD 最大餐 (units)</span>
                </div>
                <div class="bb-stat alt-bid">
                  <span class="bb-stat-label alt-label">或 BID</span>
                </div>
                <div class="bb-stat">
                  <span class="bb-stat-val basal-val">{{
                    Math.round((premixTDD * 2) / 3)
                  }}</span>
                  <span class="bb-stat-label">早餐前 (units)</span>
                </div>
                <div class="bb-stat">
                  <span class="bb-stat-val bolus-val">{{
                    premixTDD - Math.round((premixTDD * 2) / 3)
                  }}</span>
                  <span class="bb-stat-label">晚餐前 (units)</span>
                </div>
              </template>
              <template v-else>
                <div class="bb-stat">
                  <span class="bb-stat-val basal-val">{{ premixMorning }}</span>
                  <span class="bb-stat-label">早餐前 (units)</span>
                </div>
                <div class="bb-stat" v-if="premixEvening !== null">
                  <span class="bb-stat-val bolus-val">{{ premixEvening }}</span>
                  <span class="bb-stat-label">晚餐前 (units)</span>
                </div>
              </template>
            </div>
            <div class="pm-comp">
              <span class="pm-comp-label">組成：</span>
              <span class="pm-comp-val"
                >{{ premixOpts.find((o) => o.value === premixType)?.rapid }} /
                {{
                  premixOpts.find((o) => o.value === premixType)?.basal
                }}</span
              >
            </div>
          </div>

          <div class="guide-card">
            <div class="guide-title">📋 titration 指引（臺灣糖尿病學會）</div>
            <ul class="guide-list">
              <li v-if="premixTitrateMorning">
                <strong>早餐前劑量调整：</strong
                >{{ premixTitrateMorning.reason }}（建議 →
                {{ premixTitrateMorning.newDose }} units）
              </li>
              <li v-if="premixTitrateEvening">
                <strong>晚餐前劑量调整：</strong
                >{{ premixTitrateEvening.reason }}（建議 →
                {{ premixTitrateEvening.newDose }} units）
              </li>
              <li>
                <strong>起始劑量：</strong>以基礎胰島素劑量分成 2/3 早餐前、1/3
                晚餐前，或早晚餐前各一半；亦可以 0.2–0.4 units/kg/day 估算
              </li>
              <li>
                <strong>調整頻率：</strong>每週調整 1–2 次，每次 1–2 units 或
                10–15%
              </li>
              <li>
                <strong>低血糖處理：</strong>血糖 &lt; 70 mg/dL 時減 2–4 units
                或 10–20%，並查明原因
              </li>
              <li>
                <strong>每日 3 次注射：</strong
                >若早晚餐前預混仍無法達標，可考慮中午加打一針；仍無法達標則改
                basal-bolus
              </li>
              <li>
                <strong>NovoMix 30 / Humalog Mix 25：</strong>30%
                速效成分，適合常規亞洲飲食
              </li>
              <li>
                <strong>Humalog Mix 50：</strong>50%
                速效成分，適合早餐/晚餐碳水化合物比例高的患者
              </li>
              <li>
                <strong>Ryzodeg（70% Degludec + 30% Aspart）：</strong>QD
                最大餐注射，方便或控制不佳可改 BID 早晚餐前
              </li>
            </ul>
          </div>
        </div>
      </template>

      <!-- Split-mixed results -->
      <template v-if="mode === 'split-mixed'">
        <p v-if="!weight" class="progress-hint">請輸入體重以開始計算</p>
        <div v-else class="sm-results">
          <div class="result-card">
            <div class="rc-title">⚗ 建議處方 — NPH + Regular 分次混合</div>
            <div class="sm-schedule">
              <div class="sm-time">
                <span class="sm-time-label">🌅 早餐前</span>
                <span class="sm-dose"
                  ><strong>{{ smMorningNPH }}</strong> units NPH</span
                >
                <span class="sm-plus">+</span>
                <span class="sm-dose"
                  ><strong>{{ smMorningReg }}</strong> units Regular</span
                >
                <span class="sm-ratio">(2:1)</span>
                <span class="sm-unit">units</span>
              </div>
              <div class="sm-time">
                <span class="sm-time-label">🌆 晚餐前</span>
                <span class="sm-dose"
                  ><strong>{{ smEveningNPH }}</strong> units NPH</span
                >
                <span class="sm-plus">+</span>
                <span class="sm-dose"
                  ><strong>{{ smEveningReg }}</strong> units Regular</span
                >
                <span class="sm-ratio">(1:1)</span>
                <span class="sm-unit">units</span>
              </div>
              <div class="sm-total">
                <span
                  >總計：<strong>{{ smTDD }}</strong> units/day</span
                >
                <span class="sm-isf"
                  >ISF（Regular，1500 法則）：1 unit →
                  <strong>{{ smISF }}</strong> mg/dL</span
                >
              </div>
            </div>
          </div>

          <div class="guide-card">
            <div class="guide-title">
              📋 titration 指引（依血糖監測模式調整，臺灣糖尿病學會）
            </div>
            <ul class="guide-list">
              <li>
                <strong>早餐前 Regular</strong> → 依
                <strong>午餐前血糖</strong>（目標 &lt; 140 mg/dL），每次 ±2
                units
              </li>
              <li>
                <strong>早餐前 NPH</strong> → 依
                <strong>晚餐前血糖</strong>（目標 80–130 mg/dL），每次 ±2–4
                units
              </li>
              <li>
                <strong>晚餐前 Regular</strong> → 依
                <strong>睡前血糖</strong>（目標 &lt; 140 mg/dL），每次 ±2 units
              </li>
              <li>
                <strong>晚餐前 NPH</strong> → 依 <strong>空腹血糖</strong>（目標
                80–130 mg/dL），每次 ±2–4 units
              </li>
              <li>
                調整頻率：每週調整 1–2 次，每次 1–2 units 或
                10–15%；僅調整一個時間點，避免同時多點調整
              </li>
              <li>
                低血糖（&lt; 70 mg/dL）時減 2–4 units 或 10–20%，並查明原因
              </li>
            </ul>
            <div
              class="guide-sub"
              style="
                margin-top: 0.5rem;
                padding-top: 0.5rem;
                border-top: 1px solid var(--vp-c-divider);
              "
            >
              <div class="guide-sub-title">⚠ 胰島素混合注意事項：</div>
              <ul class="guide-list">
                <li>抽藥順序：先抽速效或短效（澄清），再抽中效 NPH（混濁）</li>
                <li>
                  Glargine（U-100/U-300）、Detemir、Degludec：不可與其他胰島素混合
                </li>
                <li>Glargine U-300 不可用傳統 U-100 空針抽取，以免劑量錯誤</li>
              </ul>
            </div>
          </div>
        </div>
      </template>
    </div>

    <!-- Safety notes -->
    <div class="safety-notes">
      <div class="notes-header">⚠ 安全注意事項</div>
      <ul class="note-list">
        <li>低血糖定義：血糖 &lt; 70 mg/dL，嚴重低血糖需立即處理</li>
        <li>
          空腹血糖目標：80–130 mg/dL（ADA），餐後 2h 血糖目標 &lt; 180 mg/dL
        </li>
        <li>每次僅依一種演算法調整，避免重複疊加；調整頻率不應超過建議區間</li>
        <li>
          基礎胰島素劑量 &gt; 0.5 units/kg/day 但 FBG 已達標、A1C
          仍未達標時，應評估加入餐時胰島素或 GLP-1RA
        </li>
        <li>
          所有起始劑量建議均應減量 20–50%
          用於老年人、腎功能不全或低血糖高風險族群
        </li>
      </ul>
    </div>

    <!-- Actions -->
    <div class="ins-actions">
      <button
        class="btn-copy"
        @click="copyMarkdown"
        :disabled="mode === 'basal-only' && (!weight || !avgFBG)"
      >
        {{ copied ? "已複製 ✓" : "複製 Markdown 結果" }}
      </button>
      <button class="btn-reset" @click="reset">重置</button>
    </div>
  </div>
</template>

<style scoped>
.ins {
  max-width: 820px;
  margin: 0 auto;
  font-size: 0.9rem;
}

/* ── Shared section bar ─────────────────────────────────────────── */
.group-header-bar {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.55rem 0.85rem;
  border-radius: 8px;
  background: var(--vp-c-bg-mute);
  border: 1px solid var(--vp-c-divider);
  border-left: 3px solid #0ea5e9;
  margin-bottom: 0.75rem;
}
.mode-bar {
  border-left-color: #8b5cf6;
}
.input-bar {
  border-left-color: #10b981;
}
.result-bar {
  border-left-color: #f97316;
}
.group-icon {
  font-size: 1rem;
  flex-shrink: 0;
}
/* .group-label-text / .group-sub-text fonts unified globally in custom.css */
.group-sub-text {
  flex: 1;
}

/* ── Mode selector ──────────────────────────────────────────────── */
.mode-section {
  margin-bottom: 1.5rem;
}
.mode-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.6rem;
}
.mode-card {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.7rem 0.85rem;
  border-radius: 10px;
  border: 1.5px solid var(--vp-c-divider);
  background: var(--vp-c-bg-soft);
  cursor: pointer;
  transition: all 0.18s;
  font-family: inherit;
  text-align: left;
  width: 100%;
}
.mode-card:hover {
  border-color: var(--vp-c-text-3);
}
.mode-card.active {
  border-color: #8b5cf6;
  background: rgba(139, 92, 246, 0.06);
}
.mode-icon {
  font-size: 1.4rem;
  flex-shrink: 0;
}
.item-name-block {
  display: flex;
  flex-direction: column;
  gap: 1px;
}
/* .item-name / .item-sub fonts unified globally in custom.css */

/* ── Inputs ─────────────────────────────────────────────────────── */
.input-section {
  margin-bottom: 1.5rem;
}
.input-row {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  margin-bottom: 0.65rem;
}
.input-label {
  font-size: 0.82rem;
  font-weight: 700;
  color: var(--vp-c-text-1);
}
.opt-tag {
  font-weight: 400;
  font-size: 0.72rem;
  color: var(--vp-c-text-3);
}
.input-wrap {
  display: flex;
  align-items: center;
  border: 1.5px solid var(--vp-c-divider);
  border-radius: 10px;
  background: var(--vp-c-bg-soft);
  padding: 0 1rem;
  transition: border-color 0.2s;
}
.input-wrap:focus-within {
  border-color: var(--vp-c-brand-1);
}
.input-wrap.input-filled,
.input-wrap.input-filled-shim {
  border-color: #22c55e;
}
.num-input {
  flex: 1;
  border: none;
  background: transparent;
  font-size: 1.2rem;
  font-weight: 800;
  color: var(--vp-c-text-1);
  padding: 0.6rem 0;
  outline: none;
  font-family: inherit;
  -moz-appearance: textfield;
  width: 0;
}
.num-input::-webkit-outer-spin-button,
.num-input::-webkit-inner-spin-button {
  -webkit-appearance: none;
}
.num-input::placeholder {
  font-size: 0.95rem;
  font-weight: 400;
  color: var(--vp-c-text-3);
}
.input-unit {
  font-size: 0.8rem;
  font-weight: 700;
  color: var(--vp-c-text-3);
  padding-left: 0.5rem;
  white-space: nowrap;
}
.hypo-check {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.8rem;
  color: var(--vp-c-text-2);
  cursor: pointer;
  user-select: none;
  margin-top: 0.2rem;
}
.hypo-check input {
  width: 16px;
  height: 16px;
  cursor: pointer;
  accent-color: var(--vp-c-brand-1);
}

/* ── Premixed selection ─────────────────────────────────────────── */
.premix-select {
  margin-bottom: 0.75rem;
}
.premix-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.5rem;
}
.premix-card {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 0.55rem 0.75rem;
  border-radius: 10px;
  border: 1.5px solid var(--vp-c-divider);
  background: var(--vp-c-bg-soft);
  cursor: pointer;
  font-family: inherit;
  text-align: left;
  transition: all 0.18s;
}
.premix-card:hover {
  border-color: var(--vp-c-text-3);
}
.premix-card.active {
  border-color: #0ea5e9;
  background: rgba(14, 165, 233, 0.06);
}
.premix-name {
  font-size: 0.85rem;
  font-weight: 700;
  color: var(--vp-c-text-1);
}
.premix-composition {
  font-size: 0.7rem;
  color: var(--vp-c-text-2);
}
.premix-note {
  font-size: 0.66rem;
  color: var(--vp-c-text-3);
}

/* ── Basal-only algo cards ──────────────────────────────────────── */
.algo-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-bottom: 1rem;
}
.algo-card {
  border: 1px solid var(--vp-c-divider);
  border-left: 4px solid var(--vp-c-text-3);
  border-radius: 12px;
  padding: 0.85rem 1.1rem;
  background: var(--vp-c-bg-soft);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
}
.algo-card.increase {
  border-left-color: #f97316;
}
.algo-card.hold {
  border-left-color: #22c55e;
}
.algo-card.hypo {
  border-left-color: #ef4444;
}
.algo-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 0.75rem;
  margin-bottom: 0.5rem;
}
.algo-name {
  font-size: 0.88rem;
  font-weight: 700;
  color: var(--vp-c-text-1);
}
.algo-sub {
  font-size: 0.68rem;
  color: var(--vp-c-text-3);
  margin-top: 2px;
}
.algo-freq {
  font-size: 0.7rem;
  font-weight: 700;
  color: var(--vp-c-text-3);
  background: var(--vp-c-bg-mute);
  border: 1px solid var(--vp-c-divider);
  border-radius: 999px;
  padding: 2px 10px;
  white-space: nowrap;
  flex-shrink: 0;
}
.algo-dose {
  display: flex;
  align-items: baseline;
  gap: 0.5rem;
  flex-wrap: wrap;
  margin-bottom: 0.35rem;
}
.dose-from {
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--vp-c-text-3);
}
.dose-arrow {
  font-size: 1rem;
  color: var(--vp-c-text-3);
}
.dose-to {
  font-size: 1.5rem;
  font-weight: 800;
  color: var(--vp-c-text-1);
}
.dose-to.increase {
  color: #f97316;
}
.dose-to.hold {
  color: #22c55e;
}
.dose-to.hypo {
  color: #ef4444;
}
.dose-unit-label {
  font-size: 0.72rem;
  color: var(--vp-c-text-3);
}
.dose-adj {
  font-size: 0.78rem;
  font-weight: 700;
  color: var(--vp-c-text-3);
}
.dose-adj.increase {
  color: #f97316;
}
.dose-adj.hold {
  color: #22c55e;
}
.dose-adj.hypo {
  color: #ef4444;
}
.algo-reason {
  font-size: 0.78rem;
  color: var(--vp-c-text-2);
  line-height: 1.55;
}

/* ── Algorithm reference ────────────────────────────────────────── */
.algo-ref {
  border: 1px solid var(--vp-c-divider);
  border-radius: 12px;
  padding: 0.75rem 1rem;
  margin-bottom: 1rem;
  background: var(--vp-c-bg-soft);
}
.algo-ref-summary {
  font-size: 0.78rem;
  font-weight: 700;
  color: var(--vp-c-text-2);
  cursor: pointer;
}
.ref-table {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
  margin-top: 0.75rem;
  overflow-x: auto;
}
.ref-row {
  display: grid;
  grid-template-columns: 110px repeat(3, minmax(160px, 1fr));
  gap: 0.6rem;
  font-size: 0.84rem;
  align-items: start;
  min-width: 560px;
}
.ref-row-header {
  padding-bottom: 0.4rem;
  border-bottom: 1px solid var(--vp-c-divider);
}
.ref-rowhead {
  font-weight: 700;
  color: var(--vp-c-text-3);
  font-size: 0.76rem;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}
.ref-col-title {
  font-weight: 800;
  color: var(--vp-c-text-1);
}

/* ── Result card shared ─────────────────────────────────────────── */
.result-card {
  border: 1px solid var(--vp-c-divider);
  border-radius: 12px;
  padding: 1rem;
  background: var(--vp-c-bg-soft);
  margin-bottom: 1rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
}
.rc-title {
  font-size: 0.85rem;
  font-weight: 800;
  color: var(--vp-c-text-1);
  margin-bottom: 0.75rem;
}
.bb-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.75rem;
}
.bb-stat {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 0.85rem 0.5rem 0.7rem;
  border-radius: 12px;
  background: var(--vp-c-bg);
  border: 1px solid var(--vp-c-divider);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
  min-height: 85px;
}
.bb-stat-val {
  font-size: 1.6rem;
  font-weight: 800;
  color: var(--vp-c-text-1);
  line-height: 1.2;
}
.bb-stat-val.basal-val {
  color: #3b82f6;
}
.bb-stat-val.bolus-val {
  color: #f97316;
}
.bb-stat-val.isf-val {
  color: #8b5cf6;
}
.bb-stat-val.isf-reg-val {
  color: #06b6d4;
}
.bb-stat-val.carb-val {
  color: #10b981;
}
.alt-bid {
  grid-column: 1 / -1;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.4rem 0.5rem;
  border: none;
  background: transparent;
  box-shadow: none;
  min-height: unset;
  position: relative;
}
.alt-bid::before,
.alt-bid::after {
  content: "";
  flex: 1;
  height: 1px;
  background: var(--vp-c-divider);
}
.alt-label {
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--vp-c-text-3);
  letter-spacing: 0.03em;
  white-space: nowrap;
}
.bb-stat-label {
  font-size: 0.65rem;
  color: var(--vp-c-text-3);
  text-align: center;
  margin-top: 3px;
  line-height: 1.3;
}

.bb-stat-sub {
  font-size: 0.6rem;
  color: var(--vp-c-text-3);
  text-align: center;
  margin-top: 1px;
  opacity: 0.7;
  line-height: 1.2;
}

/* ── Correction callout ─────────────────────────────────────────── */
.bb-correction {
  padding: 0.75rem 1rem;
  border-radius: 10px;
  margin-bottom: 1rem;
  font-size: 0.82rem;
  line-height: 1.5;
}
.corr-need {
  display: block;
  padding: 0.6rem 0.85rem;
  background: rgba(249, 115, 22, 0.08);
  border: 1px solid rgba(249, 115, 22, 0.3);
  border-radius: 10px;
  color: var(--vp-c-text-1);
}
.corr-ok {
  display: block;
  padding: 0.6rem 0.85rem;
  background: rgba(34, 197, 94, 0.08);
  border: 1px solid rgba(34, 197, 94, 0.3);
  border-radius: 10px;
  color: #16a34a;
}

/* ── Guide card ─────────────────────────────────────────────────── */
.guide-card {
  border: 1px solid var(--vp-c-divider);
  border-radius: 12px;
  padding: 1rem;
  background: var(--vp-c-bg-soft);
  margin-bottom: 1rem;
}
.guide-title {
  font-size: 0.85rem;
  font-weight: 800;
  color: var(--vp-c-text-1);
  margin-bottom: 0.6rem;
}
.guide-list {
  margin: 0;
  padding-left: 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 5px;
}
.guide-list li {
  font-size: 0.78rem;
  color: var(--vp-c-text-2);
  line-height: 1.6;
}

/* ── Premixed specific ──────────────────────────────────────────── */
.pm-comp {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  margin-top: 0.6rem;
  padding-top: 0.6rem;
  border-top: 1px solid var(--vp-c-divider);
  font-size: 0.78rem;
}
.pm-comp-label {
  font-weight: 700;
  color: var(--vp-c-text-3);
}
.pm-comp-val {
  color: var(--vp-c-text-1);
  font-weight: 600;
}

/* ── Split-mixed specific ───────────────────────────────────────── */
.sm-schedule {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
}
.sm-time {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.55rem 0.75rem;
  border-radius: 8px;
  background: var(--vp-c-bg);
  border: 1px solid var(--vp-c-divider);
  flex-wrap: wrap;
}
.sm-time-label {
  font-size: 0.8rem;
  font-weight: 700;
  color: var(--vp-c-text-1);
  min-width: 70px;
}
.sm-dose {
  font-size: 0.95rem;
  color: var(--vp-c-text-1);
}
.sm-plus {
  color: var(--vp-c-text-3);
  font-weight: 700;
}
.sm-ratio {
  font-size: 0.68rem;
  color: var(--vp-c-text-3);
  font-weight: 600;
}
.sm-unit {
  font-size: 0.68rem;
  color: var(--vp-c-text-3);
}
.sm-total {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 0.75rem;
  background: var(--vp-c-bg-mute);
  border-radius: 8px;
  font-size: 0.78rem;
  color: var(--vp-c-text-2);
  flex-wrap: wrap;
  gap: 0.4rem;
}
.sm-isf {
  color: var(--vp-c-text-3);
}

/* ── Safety notes ───────────────────────────────────────────────── */
.safety-notes {
  border: 1px solid var(--vp-c-divider);
  border-radius: 14px;
  overflow: hidden;
  margin-bottom: 1rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
}
.notes-header {
  padding: 0.6rem 1rem;
  font-size: 0.86rem;
  font-weight: 700;
  color: var(--vp-c-text-2);
  background: var(--vp-c-bg-mute);
  border-bottom: 1px solid var(--vp-c-divider);
}
.note-list {
  margin: 0;
  padding: 0.8rem 1rem 0.8rem 2rem;
  display: flex;
  flex-direction: column;
  gap: 5px;
}
.note-list li {
  font-size: 0.84rem;
  color: var(--vp-c-text-2);
  line-height: 1.6;
}

/* ── Actions ────────────────────────────────────────────────────── */
.ins-actions {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
}
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
  margin: 0.4rem 0;
}

.ref-note {
  font-size: 0.74rem;
  color: var(--vp-c-text-3);
  margin-top: 0.6rem;
  padding: 0.45rem 0.65rem;
  background: var(--vp-c-bg-mute);
  border-radius: 6px;
  border-left: 3px solid var(--vp-c-border, var(--vp-c-divider));
  line-height: 1.55;
}

/* ── OADs reference ─────────────────────────────────────────────── */
.oad-ref {
  border: 1px solid var(--vp-c-divider);
  border-radius: 12px;
  margin-bottom: 0.75rem;
  background: var(--vp-c-bg-soft);
  overflow: hidden;
}
.oad-ref-summary {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.4rem 0.7rem;
  font-size: 0.86rem;
  font-weight: 700;
  color: var(--vp-c-text-1);
  cursor: pointer;
  list-style: none;
  user-select: none;
}
.oad-ref-summary::-webkit-details-marker {
  display: none;
}
.oad-ref-summary::after {
  content: "▾";
  margin-left: auto;
  font-size: 0.85rem;
  color: var(--vp-c-text-3);
  transition: transform 0.2s ease;
}
.oad-ref[open] > .oad-ref-summary {
  border-bottom: 1px solid var(--vp-c-divider);
}
.oad-ref[open] > .oad-ref-summary::after {
  transform: rotate(180deg);
}
.oad-table {
  display: flex;
  flex-direction: column;
  padding: 0 0.7rem 0rem;
  overflow-x: auto;
}
.oad-row {
  display: grid;
  grid-template-columns: 120px 1fr;
  gap: 0.7rem;
  font-size: 0.82rem;
  align-items: baseline;
  padding: 0.3rem 0.1rem;
  border-bottom: 1px solid var(--vp-c-divider);
}
.oad-row:last-child {
  border-bottom: none;
}
.oad-row-header {
  padding-top: 0.5rem;
  font-weight: 700;
  color: var(--vp-c-text-3);
  font-size: 0.72rem;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}
.oad-drug {
  justify-self: start;
  font-weight: 700;
  font-size: 0.78rem;
  color: #0d9488;
  background: rgba(13, 148, 136, 0.1);
  padding: 3px 11px;
  border-radius: 999px;
  white-space: nowrap;
}
.oad-rec {
  color: var(--vp-c-text-2);
  line-height: 1.6;
}
.oad-ref .ref-note {
  margin: 0 0.7rem 0.5rem;
  padding: 0.4rem 0.5rem 0;
  background: none;
  border: none;
  border-top: 1px solid var(--vp-c-divider);
  border-radius: 0;
  font-size: 0.72rem;
  font-style: italic;
  color: var(--vp-c-text-3);
  line-height: 1.5;
}
.oad-ref .ref-note::before {
  content: "※ ";
  font-style: normal;
}

/* ── Basal-only start dose card ─────────────────────────────────── */
.bo-start-card {
  border: 1px solid var(--vp-c-divider);
  border-radius: 12px;
  overflow: hidden;
  margin-bottom: 0.75rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
}
.bo-start-header {
  padding: 0.6rem 1rem;
  font-size: 0.85rem;
  font-weight: 800;
  color: var(--vp-c-text-1);
  background: var(--vp-c-bg-mute);
  border-bottom: 1px solid var(--vp-c-divider);
}
.bo-start-body {
  display: flex;
  align-items: flex-start;
  gap: 1.25rem;
  padding: 1rem;
  background: var(--vp-c-bg-soft);
  font-size: 0.92rem;
}
.bo-start-stat {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  min-width: 120px;
  padding: 0.75rem 1rem;
  background: var(--vp-c-bg);
  border: 1px solid var(--vp-c-divider);
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}
.bo-start-val {
  font-size: 2.4rem;
  font-weight: 800;
  color: #3b82f6;
  line-height: 1.1;
}
.bo-start-unit {
  font-size: 0.72rem;
  color: var(--vp-c-text-3);
  font-weight: 700;
  margin-top: 2px;
}
.bo-start-detail {
  flex: 1;
  min-width: 0;
  color: var(--vp-c-text-1);
  line-height: 1.6;
}
.bo-start-sub {
  font-size: 0.7rem;
  color: var(--vp-c-text-3);
  margin-top: 2px;
}
.toujeo-note {
  margin-top: 0.5rem;
  padding: 0.5rem 0.6rem;
  background: rgba(249, 115, 22, 0.06);
  border-left: 3px solid #f97316;
  border-radius: 6px;
  font-size: 0.68rem;
  line-height: 1.55;
  color: var(--vp-c-text-2);
}

/* ── Basal-only threshold card ──────────────────────────────────── */
.bo-threshold {
  border: 1px solid var(--vp-c-divider);
  border-radius: 12px;
  padding: 0.85rem 1rem;
  background: rgba(249, 115, 22, 0.05);
  border-left: 4px solid #f97316;
  margin-bottom: 1rem;
}
.bo-thresh-header {
  font-size: 0.85rem;
  font-weight: 800;
  color: var(--vp-c-text-1);
  margin-bottom: 0.5rem;
}

@media (max-width: 640px) {
  .mode-grid {
    grid-template-columns: 1fr;
  }
  .premix-grid {
    grid-template-columns: 1fr;
  }
  .bb-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  .dose-to {
    font-size: 1.25rem;
  }
  .ref-row {
    font-size: 0.78rem;
  }
}
</style>
