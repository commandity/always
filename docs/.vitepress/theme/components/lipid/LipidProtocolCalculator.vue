<script setup lang="ts">
import { ref, computed, watch } from "vue";

type Category = "acs" | "cvd" | "rf2" | "rf1" | "rf0";
type Sex = "M" | "F";

const hasACS = ref(false);
const hasCVD = ref(false);
const hasDM = ref(false);

const sex = ref<Sex>("M");
const age = ref("");
const hasHTN = ref(false);
const hasFamCAD = ref(false);
const isSmoker = ref(false);

const TC = ref("");
const LDL = ref("");
const HDL = ref("");
const TG = ref("");

const tc = computed(() => {
  const v = parseFloat(TC.value);
  return isNaN(v) ? null : v;
});
const ldl = computed(() => {
  const v = parseFloat(LDL.value);
  return isNaN(v) ? null : v;
});
const hdl = computed(() => {
  const v = parseFloat(HDL.value);
  return isNaN(v) ? null : v;
});
const tg = computed(() => {
  const v = parseFloat(TG.value);
  return isNaN(v) ? null : v;
});

const autoField = ref<"TC" | "LDL" | "HDL" | "TG" | null>(null);

const entered = computed(
  () =>
    [tc.value, ldl.value, hdl.value, tg.value].filter((x) => x !== null).length,
);

function calcMissing() {
  const fields = [
    { ref: TC, key: "TC" as const, v: parseFloat(TC.value) },
    { ref: LDL, key: "LDL" as const, v: parseFloat(LDL.value) },
    { ref: HDL, key: "HDL" as const, v: parseFloat(HDL.value) },
    { ref: TG, key: "TG" as const, v: parseFloat(TG.value) },
  ];
  const filled = fields.filter((f) => !isNaN(f.v));
  const empty = fields.find((f) => isNaN(f.v));
  if (filled.length === 3 && empty) {
    const vals = fields.map((f) => f.v);
    const [t, l, h, tgv] = vals;
    autoField.value = empty.key;
    if (empty.key === "TC") {
      if (tgv >= 400 || h === null || l === null) return;
      empty.ref.value = String(Math.round((l + h + tgv / 5) * 10) / 10);
    } else if (empty.key === "LDL") {
      if (tgv >= 400 || t === null || h === null) return;
      empty.ref.value = String(Math.round((t - h - tgv / 5) * 10) / 10);
    } else if (empty.key === "HDL") {
      if (tgv >= 400 || t === null || l === null) return;
      empty.ref.value = String(Math.round((t - l - tgv / 5) * 10) / 10);
    } else if (empty.key === "TG") {
      if (t === null || l === null || h === null) return;
      const v = (t - l - h) * 5;
      if (v <= 0) return;
      empty.ref.value = String(Math.round(v * 10) / 10);
    }
  } else if (filled.length === 4 && autoField.value) {
    const auto = fields.find((f) => f.key === autoField.value);
    if (!auto) return;
    const vals = fields.map((f) => f.v);
    const [t, l, h, tgv] = vals;
    if (auto.key === "TC") {
      if (tgv >= 400 || h === null || l === null) return;
      const nv = Math.round((l + h + tgv / 5) * 10) / 10;
      if (parseFloat(auto.ref.value) !== nv) auto.ref.value = String(nv);
    } else if (auto.key === "LDL") {
      if (tgv >= 400 || t === null || h === null) return;
      const nv = Math.round((t - h - tgv / 5) * 10) / 10;
      if (parseFloat(auto.ref.value) !== nv) auto.ref.value = String(nv);
    } else if (auto.key === "HDL") {
      if (tgv >= 400 || t === null || l === null) return;
      const nv = Math.round((t - l - tgv / 5) * 10) / 10;
      if (parseFloat(auto.ref.value) !== nv) auto.ref.value = String(nv);
    } else if (auto.key === "TG") {
      if (t === null || l === null || h === null) return;
      const v = (t - l - h) * 5;
      if (v <= 0) return;
      const nv = Math.round(v * 10) / 10;
      if (parseFloat(auto.ref.value) !== nv) auto.ref.value = String(nv);
    }
  } else if (filled.length <= 2) {
    autoField.value = null;
  }
}

watch([TC, LDL, HDL, TG], calcMissing, { deep: true });

const ageNum = computed(() => {
  const v = parseFloat(age.value);
  return isNaN(v) ? null : v;
});

const rfAge = computed(() => {
  if (ageNum.value === null) return false;
  return sex.value === "M" ? ageNum.value >= 45 : ageNum.value >= 55;
});

const rfHDL = computed(() => hdl.value !== null && hdl.value < 40);

const isElderly = computed(() => ageNum.value !== null && ageNum.value >= 75);

const rfCount = computed(() => {
  let n = 0;
  if (hasHTN.value) n++;
  if (rfAge.value) n++;
  if (hasFamCAD.value) n++;
  if (isSmoker.value) n++;
  if (rfHDL.value) n++;
  return Math.min(n, 2) as 0 | 1 | 2;
});

const rfDetailList = computed(() => {
  const items: { label: string; met: boolean }[] = [];
  items.push({ label: "高血壓", met: hasHTN.value });
  items.push({
    label: sex.value === "M" ? "年齡 ≥ 45" : "年齡 ≥ 55 / 停經",
    met: rfAge.value,
  });
  items.push({ label: "早發性冠心病家族史", met: hasFamCAD.value });
  items.push({ label: "吸菸", met: isSmoker.value });
  items.push({ label: "HDL-C < 40 mg/dL", met: rfHDL.value });
  return items;
});

const hasNonDrugDone = ref(false);

const canRx = computed(() => !protocol.value.nonDrug || hasNonDrugDone.value);

const isLowRisk = computed(
  () => !hasACS.value && !hasCVD.value && !hasDM.value,
);

const effectiveCat = computed<Category>(() => {
  if (hasACS.value) return "acs";
  if (hasCVD.value || hasDM.value) return "cvd";
  if (rfCount.value === 2) return "rf2";
  if (rfCount.value === 1) return "rf1";
  return "rf0";
});

type ProtocolRow = {
  label: string;
  initiate: string;
  target: string;
  nonDrug: boolean;
};

const protocol = computed<ProtocolRow>(() => {
  switch (effectiveCat.value) {
    case "acs":
      return {
        label: "ACS / PCI/CABG",
        initiate: "LDL-C \u2265 70 mg/dL",
        target: "LDL-C < 70 mg/dL",
        nonDrug: false,
      };
    case "cvd":
      return {
        label: "CVD \u6216 DM",
        initiate: "TC \u2265 160 \u6216 LDL-C \u2265 100 mg/dL",
        target: "TC < 160 \u4E14 LDL-C < 100 mg/dL",
        nonDrug: false,
      };
    case "rf2":
      return {
        label: "\u2265 2 \u500B\u5371\u96AA\u56E0\u5B50",
        initiate: "TC \u2265 200 \u6216 LDL-C \u2265 130 mg/dL",
        target: "TC < 200 \u4E14 LDL-C < 130 mg/dL",
        nonDrug: true,
      };
    case "rf1":
      return {
        label: "1 \u500B\u5371\u96AA\u56E0\u5B50",
        initiate: "TC \u2265 240 \u6216 LDL-C \u2265 160 mg/dL",
        target: "TC < 240 \u4E14 LDL-C < 160 mg/dL",
        nonDrug: true,
      };
    case "rf0":
      return {
        label: "0 \u500B\u5371\u96AA\u56E0\u5B50",
        initiate: "LDL-C \u2265 190 mg/dL",
        target: "LDL-C < 190 mg/dL",
        nonDrug: true,
      };
  }
});

type TGProto = {
  label: string;
  initiateTG: string;
  targetTG: string;
  nonDrugTG: boolean;
} | null;

const tgProtocol = computed<TGProto>(() => {
  if (hasACS.value || hasCVD.value || hasDM.value) {
    return {
      label: "ACS / CVD / DM",
      initiateTG:
        "TG \u2265 200 \u4E14\uFF08TC/HDL-C > 5 \u6216 HDL-C < 40\uFF09",
      targetTG: "TG < 200 mg/dL",
      nonDrugTG: false,
    };
  }
  return {
    label: "\u7121 CVD",
    initiateTG: "TG \u2265 500 mg/dL",
    targetTG: "TG < 500 mg/dL",
    nonDrugTG: true,
  };
});

const initiateMet = computed(() => {
  switch (effectiveCat.value) {
    case "acs":
      return ldl.value !== null && ldl.value >= 70;
    case "cvd":
      return (
        (tc.value !== null && tc.value >= 160) ||
        (ldl.value !== null && ldl.value >= 100)
      );
    case "rf2":
      return (
        (tc.value !== null && tc.value >= 200) ||
        (ldl.value !== null && ldl.value >= 130)
      );
    case "rf1":
      return (
        (tc.value !== null && tc.value >= 240) ||
        (ldl.value !== null && ldl.value >= 160)
      );
    case "rf0":
      return ldl.value !== null && ldl.value >= 190;
    default:
      return false;
  }
});

const targetMet = computed(() => {
  switch (effectiveCat.value) {
    case "acs":
      return ldl.value !== null && ldl.value < 70;
    case "cvd":
      return (
        (tc.value === null || tc.value < 160) &&
        (ldl.value === null || ldl.value < 100)
      );
    case "rf2":
      return (
        (tc.value === null || tc.value < 200) &&
        (ldl.value === null || ldl.value < 130)
      );
    case "rf1":
      return (
        (tc.value === null || tc.value < 240) &&
        (ldl.value === null || ldl.value < 160)
      );
    case "rf0":
      return ldl.value === null || ldl.value < 190;
    default:
      return false;
  }
});

const tgInitiateMet = computed<boolean | null>(() => {
  if (!tgProtocol.value) return null;
  if (hasACS.value || hasCVD.value || hasDM.value) {
    if (tg.value === null) return false;
    const ratioOk =
      (tc.value !== null && hdl.value !== null && tc.value / hdl.value > 5) ||
      (hdl.value !== null && hdl.value < 40);
    return tg.value >= 200 && ratioOk;
  }
  return tg.value !== null && tg.value >= 500;
});

const tgTargetMet = computed<boolean | null>(() => {
  if (!tgProtocol.value) return null;
  const target = hasACS.value || hasCVD.value || hasDM.value ? 200 : 500;
  return tg.value !== null && tg.value < target;
});

const isHighRiskGroup = computed(
  () => hasACS.value || hasCVD.value || hasDM.value,
);

type StatinLevel = "high" | "moderate" | "none";

type StatinRec = {
  level: StatinLevel;
  reasons: string[];
  meds: string[];
};

type StatinIntensityRow = {
  level: "high" | "moderate" | "low";
  label: string;
  ldlReduction: string;
  tgReduction: string;
  meds: string[];
};

const STATIN_INTENSITY_TABLE: StatinIntensityRow[] = [
  {
    level: "high",
    label: "高強度 High Intensity",
    ldlReduction: "≥ 50%",
    tgReduction: "約 25–35%",
    meds: ["Atorvastatin 40–80 mg QD", "Rosuvastatin 20–40 mg QD"],
  },
  {
    level: "moderate",
    label: "中強度 Moderate Intensity",
    ldlReduction: "30%–49%",
    tgReduction: "約 15–25%",
    meds: [
      "Atorvastatin 10–20 mg QD",
      "Rosuvastatin 5–10 mg QD",
      "Simvastatin 20–40 mg QD",
      "Pravastatin 40–80 mg QD",
      "Lovastatin 40 mg QD",
      "Fluvastatin XL 80 mg QD",
      "Fluvastatin 40 mg BID",
      "Pitavastatin 1–4 mg QD",
    ],
  },
  {
    level: "low",
    label: "低強度 Low Intensity",
    ldlReduction: "< 30%",
    tgReduction: "約 < 15%",
    meds: [
      "Simvastatin 10 mg QD",
      "Pravastatin 10–20 mg QD",
      "Lovastatin 20 mg QD",
      "Fluvastatin 20–40 mg QD",
    ],
  },
];

const HIGH_INTENSITY_MEDS = STATIN_INTENSITY_TABLE[0].meds;
const MODERATE_INTENSITY_MEDS = STATIN_INTENSITY_TABLE[1].meds;

const statinRecommendation = computed<StatinRec | null>(() => {
  if (ldl.value === null) return null;
  const reasons: string[] = [];

  // ≥ 75 歲 secondary prevention → moderate (avoid high-intensity risk)
  if (isElderly.value && isHighRiskGroup.value && ldl.value >= 100) {
    reasons.push(
      hasACS.value
        ? "ACS / PCI/CABG（≥ 75 歲次級預防，建議中強度 Statin）"
        : "CVD 或 DM（≥ 75 歲次級預防，建議中強度 Statin）",
    );
    reasons.push("注意衰弱、腎功能、藥物交互作用");
    return { level: "moderate", reasons, meds: MODERATE_INTENSITY_MEDS };
  }

  if (isHighRiskGroup.value && ldl.value >= 100) {
    reasons.push(
      hasACS.value
        ? "ACS / PCI/CABG（次級預防，目標 LDL-C < 70）"
        : "CVD 或 DM（次級預防，目標 LDL-C < 100）",
    );
  }
  if (ldl.value >= 190) {
    reasons.push("LDL-C ≥ 190 mg/dL");
  }
  if (reasons.length > 0) {
    return { level: "high", reasons, meds: HIGH_INTENSITY_MEDS };
  }

  const risk = isHighRiskGroup.value ? 0 : rfCount.value;
  if (risk === 2 && ldl.value >= 130) {
    const r = isElderly.value
      ? [
          "≥ 2 個危險因子且 LDL-C ≥ 130 mg/dL（≥ 75 歲一級預防證據較弱，需個別化評估）",
        ]
      : ["≥ 2 個危險因子且 LDL-C ≥ 130 mg/dL"];
    return {
      level: "moderate",
      reasons: r,
      meds: MODERATE_INTENSITY_MEDS,
    };
  }
  if (risk === 1 && ldl.value >= 160) {
    const r = isElderly.value
      ? [
          "1 個危險因子且 LDL-C ≥ 160 mg/dL（≥ 75 歲一級預防證據較弱，需個別化評估）",
        ]
      : ["1 個危險因子且 LDL-C ≥ 160 mg/dL"];
    return {
      level: "moderate",
      reasons: r,
      meds: MODERATE_INTENSITY_MEDS,
    };
  }
  return { level: "none", reasons: [], meds: [] };
});

type TGRecType =
  | "fibrate-residual"
  | "fibrate-pancreatitis"
  | "lifestyle"
  | "normal";

type TGRec = {
  type: TGRecType;
  meds: string[];
  lifestyle: string[];
};

const tgRecommendation = computed<TGRec | null>(() => {
  if (tg.value === null) return null;
  if (isHighRiskGroup.value) {
    if (tgInitiateMet.value) {
      return {
        type: "fibrate-residual",
        meds: ["Fenofibrate 145–160 mg QD", "Omega-3 fatty acids 2–4 g/day"],
        lifestyle: [],
      };
    }
    return { type: "normal", meds: [], lifestyle: [] };
  }
  if (tgInitiateMet.value) {
    return {
      type: "fibrate-pancreatitis",
      meds: [
        "Fenofibrate 145–160 mg QD",
        "Gemfibrozil 600 mg BID",
        "Omega-3 fatty acids 2–4 g/day",
      ],
      lifestyle: [],
    };
  }
  return {
    type: "lifestyle",
    meds: [],
    lifestyle: ["減少精緻澱粉", "禁酒", "減重", "運動"],
  };
});

const catColors: Record<Category, string> = {
  acs: "#ef4444",
  cvd: "#f59e0b",
  rf2: "#3b82f6",
  rf1: "#10b981",
  rf0: "#6b7280",
};

function reset() {
  hasACS.value = false;
  hasCVD.value = false;
  hasDM.value = false;
  sex.value = "M";
  age.value = "";
  hasHTN.value = false;
  hasFamCAD.value = false;
  isSmoker.value = false;
  hasNonDrugDone.value = false;
  TC.value = "";
  LDL.value = "";
  HDL.value = "";
  TG.value = "";
}
</script>

<template>
  <div class="lipid-wrap">
    <div class="tab-bar">
      <button class="tab-btn active">
        <span class="tab-label">血脂治療指引</span>
        <span class="tab-sub">Lipid Protocol Calculator</span>
      </button>
    </div>
    <div class="lipid">
      <!-- Step 1: Personal history -->
      <div class="section">
        <div class="group-header-bar cat-bar">
          <span class="group-icon">🫀</span>
          <span class="group-label-text">Step 1 · 個人病史</span>
          <span class="group-sub-text">勾選符合項目（可複選）</span>
        </div>
        <div class="cat-grid">
          <label class="cat-opt" :class="{ active: hasACS }">
            <input type="checkbox" v-model="hasACS" />
            <div class="item-name-block">
              <span class="item-name">ACS / PCI/CABG</span>
              <span class="item-sub"
                >急性冠狀動脈症候群、心導管介入或冠脈繞道術後</span
              >
            </div>
            <span class="badge-init">LDL ≥ 70</span>
          </label>
          <label class="cat-opt" :class="{ active: hasCVD }">
            <input type="checkbox" v-model="hasCVD" />
            <div class="item-name-block">
              <span class="item-name">CVD</span>
              <span class="item-sub"
                >冠狀動脈粥狀硬化、缺血性腦血管疾病、TIA、症狀性頸動脈狹窄</span
              >
            </div>
          </label>
          <label class="cat-opt" :class="{ active: hasDM }">
            <input type="checkbox" v-model="hasDM" />
            <div class="item-name-block">
              <span class="item-name">DM</span>
              <span class="item-sub">糖尿病</span>
            </div>
          </label>
        </div>
      </div>

      <!-- Step 2: Demographics (always visible - age affects all groups) -->
      <div class="section">
        <div class="group-header-bar demo-bar">
          <span class="group-icon">👤</span>
          <span class="group-label-text">Step 2 · 基本資料</span>
          <span class="group-sub-text">年齡影響治療強度選擇</span>
        </div>
        <div class="rf-card">
          <div class="rf-row">
            <span class="rf-q">性別</span>
            <div class="rf-opts">
              <button
                class="opt-btn"
                :class="{ active: sex === 'M' }"
                @click="sex = 'M'"
              >
                男
              </button>
              <button
                class="opt-btn"
                :class="{ active: sex === 'F' }"
                @click="sex = 'F'"
              >
                女
              </button>
            </div>
          </div>
          <div class="rf-row">
            <span class="rf-q">年齡</span>
            <input
              v-model="age"
              type="number"
              min="18"
              max="120"
              placeholder="歲"
              class="rf-input"
            />
            <span class="rf-hint" v-if="ageNum !== null && !isElderly"
              >{{ sex === "M" ? "≥ 45 歲" : "≥ 55 歲" }} →
              {{ rfAge ? "✅ 符合" : "❌ 不符合" }}</span
            >
            <span class="rf-hint elderly-hint" v-else-if="isElderly">
              <template v-if="isHighRiskGroup"
                >≥ 75 歲次級預防 → 建議中強度
                Statin，注意衰弱/腎功能/交互作用</template
              >
              <template v-else
                >≥ 75 歲一級預防 → 證據較弱，需 SDM 個別化評估</template
              >
            </span>
          </div>
        </div>
      </div>

      <!-- Step 3: Risk factors (only when no CVD/DM/ACS) -->
      <div class="section" v-if="isLowRisk">
        <div class="group-header-bar rf-bar">
          <span class="group-icon">📋</span>
          <span class="group-label-text">Step 3 · 危險因子評估</span>
          <span class="group-sub-text"
            >計數 <strong>{{ rfCount }}</strong> / 5 項</span
          >
        </div>
        <div class="rf-card">
          <label class="rf-row rf-label">
            <span class="rf-q">高血壓</span>
            <input type="checkbox" v-model="hasHTN" />
            <span class="rf-check-label">{{ hasHTN ? "有" : "無" }}</span>
          </label>
          <label class="rf-row rf-label">
            <span class="rf-q">早發性冠心病家族史</span>
            <input type="checkbox" v-model="hasFamCAD" />
            <span class="rf-check-label">{{ hasFamCAD ? "有" : "無" }}</span>
          </label>
          <label class="rf-row rf-label">
            <span class="rf-q">吸菸</span>
            <input type="checkbox" v-model="isSmoker" />
            <span class="rf-check-label">{{ isSmoker ? "有" : "無" }}</span>
          </label>
          <div class="rf-row">
            <span class="rf-q">HDL-C</span>
            <span class="rf-hint" v-if="hdl !== null">{{
              hdl < 40 ? "✅ < 40 → 符合危險因子" : "❌ ≥ 40 → 不符合"
            }}</span>
            <span class="rf-hint" v-else>請於 Step 3 輸入檢驗值後自動判定</span>
          </div>
          <div class="rf-summary">
            <span class="rf-count-badge">{{ rfCount }}</span>
            <span>/ 5 項危險因子</span>
            <span class="rf-count-detail"
              >（{{
                rfDetailList
                  .filter((x) => x.met)
                  .map((x) => x.label)
                  .join("、") || "無"
              }}）</span
            >
          </div>
          <div class="rf-note" v-if="isSmoker">
            ⚠ 吸菸者若未戒菸而要求藥物治療，應以自費治療
          </div>
        </div>
      </div>

      <!-- Step 4: Lab data -->
      <div class="section">
        <div class="group-header-bar lab-bar">
          <span class="group-icon">🧪</span>
          <span class="group-label-text">Step 4 · 檢驗值</span>
          <span class="group-sub-text">mg/dL</span>
        </div>
        <div class="lab-grid">
          <div class="lab-item">
            <span class="lab-label">TC</span>
            <input
              v-model="TC"
              type="number"
              step="1"
              min="50"
              max="500"
              placeholder="mg/dL"
              class="lab-input"
            />
          </div>
          <div class="lab-item">
            <span class="lab-label">LDL-C</span>
            <input
              v-model="LDL"
              type="number"
              step="1"
              min="10"
              max="400"
              placeholder="mg/dL"
              class="lab-input"
            />
          </div>
          <div class="lab-item">
            <span class="lab-label">HDL-C</span>
            <input
              v-model="HDL"
              type="number"
              step="1"
              min="5"
              max="150"
              placeholder="mg/dL"
              class="lab-input"
            />
          </div>
          <div class="lab-item">
            <span class="lab-label">TG</span>
            <input
              v-model="TG"
              type="number"
              step="1"
              min="10"
              max="3000"
              placeholder="mg/dL"
              class="lab-input"
            />
          </div>
        </div>
        <div class="calc-note" v-if="autoField">
          Friedewald 公式自動計算（TG < 400 mg/dL 時適用），修改其他值自動更新
        </div>
      </div>

      <!-- Step 5: Non-drug treatment -->
      <div class="section" v-if="initiateMet && protocol.nonDrug">
        <div class="group-header-bar nd-bar">
          <span class="group-icon">📝</span>
          <span class="group-label-text">Step 4 · 非藥物治療評估</span>
          <span class="group-sub-text">尚未達標，給藥前先確認</span>
        </div>
        <div class="nd-card">
          <span class="nd-q"
            >是否已完成 3–6 個月非藥物治療（飲食控制、運動）？</span
          >
          <div class="nd-opts">
            <button
              class="opt-btn"
              :class="{ active: !hasNonDrugDone }"
              @click="hasNonDrugDone = false"
            >
              尚未進行
            </button>
            <button
              class="opt-btn nd-yes"
              :class="{ active: hasNonDrugDone }"
              @click="hasNonDrugDone = true"
            >
              已執行
            </button>
          </div>
        </div>
      </div>

      <!-- Results -->
      <div
        class="group-header-bar rc-header"
        v-if="effectiveCat"
        :style="{ '--accent': catColors[effectiveCat] }"
      >
        <span class="rc-cat">{{ protocol.label }}</span>
        <span
          class="rc-status-badge"
          :style="{
            background: initiateMet
              ? 'rgba(34,197,94,0.15)'
              : 'rgba(239,68,68,0.15)',
            color: initiateMet ? '#16a34a' : '#dc2626',
          }"
        >
          {{
            !initiateMet
              ? "未達給付標準"
              : protocol.nonDrug && !hasNonDrugDone
                ? "需先 3–6 月非藥物治療"
                : "可給付"
          }}
        </span>
      </div>
      <div class="result-card" v-if="effectiveCat">
        <div class="rc-table">
          <div class="rc-row rc-row-header">
            <span class="rc-col-label"></span>
            <span class="rc-col-criterion">起始治療閾值</span>
            <span class="rc-col-status">目前</span>
            <span class="rc-col-target">目標值</span>
            <span class="rc-col-goal">目標達成</span>
          </div>
          <div class="rc-row">
            <span
              class="rc-col-label"
              :style="{ color: catColors[effectiveCat] }"
              >LDL-C</span
            >
            <span class="rc-col-criterion">{{ protocol.initiate }}</span>
            <span class="rc-col-status">{{ ldl ?? "—" }} mg/dL</span>
            <span class="rc-col-target">{{ protocol.target }}</span>
            <span class="rc-col-goal">
              <span
                v-if="ldl !== null && targetMet"
                style="color: #16a34a; font-weight: 800"
                >✅ 已達標</span
              >
              <span
                v-else-if="ldl !== null && canRx"
                style="color: #dc2626; font-weight: 800"
                >❌ 未達標，建議藥物治療</span
              >
              <span
                v-else-if="ldl !== null"
                style="color: #dc2626; font-weight: 800"
                >❌ 未達標</span
              >
              <span v-else>—</span>
            </span>
          </div>
          <div class="rc-row" v-if="tgProtocol">
            <span class="rc-col-label" style="color: #06b6d4">TG</span>
            <span class="rc-col-criterion">{{ tgProtocol.initiateTG }}</span>
            <span class="rc-col-status">{{ tg ?? "—" }} mg/dL</span>
            <span class="rc-col-target">{{ tgProtocol.targetTG }}</span>
            <span class="rc-col-goal">
              <span
                v-if="tg !== null && tgInitiateMet && tgTargetMet"
                style="color: #16a34a; font-weight: 800"
                >✅ 已達標</span
              >
              <span
                v-else-if="tg !== null && tgInitiateMet && !tgTargetMet"
                style="color: #dc2626; font-weight: 800"
                >❌ 未達標，建議藥物治療</span
              >
              <span v-else-if="tg !== null" style="color: #6b7280"
                >未達給付標準</span
              >
              <span v-else>—</span>
            </span>
          </div>
        </div>
        <div class="rc-meds" v-if="statinRecommendation || tgRecommendation">
          <div class="meds-title">
            💊 治療建議（僅供臨床參考，實際處方請依醫囑）
          </div>

          <div class="meds-block" v-if="statinRecommendation">
            <div class="meds-block-title">Statin</div>
            <template v-if="statinRecommendation.level === 'none'">
              <div class="meds-line meds-muted">暫不需 Statin</div>
            </template>
            <template v-else>
              <div class="meds-reasons">
                <span class="meds-tag" :class="statinRecommendation.level">
                  {{
                    statinRecommendation.level === "high"
                      ? "高強度 Statin"
                      : "中強度 Statin"
                  }}
                </span>
                <span
                  class="meds-reason"
                  v-for="r in statinRecommendation.reasons"
                  :key="r"
                  >{{ r }}</span
                >
              </div>
              <ul class="meds-list">
                <li v-for="m in statinRecommendation.meds" :key="m">{{ m }}</li>
              </ul>
            </template>
          </div>

          <div class="meds-block" v-if="tgRecommendation">
            <div class="meds-block-title">TG / Fibrate</div>
            <template v-if="tgRecommendation.type === 'fibrate-residual'">
              <div class="meds-line">
                TG ≥ 200 mg/dL（高心血管殘餘風險），可考慮加藥：
              </div>
              <ul class="meds-list">
                <li v-for="m in tgRecommendation.meds" :key="m">{{ m }}</li>
              </ul>
            </template>
            <template
              v-else-if="tgRecommendation.type === 'fibrate-pancreatitis'"
            >
              <div class="meds-line">
                TG ≥ 500 mg/dL（預防胰臟炎），建議藥物：
              </div>
              <ul class="meds-list">
                <li v-for="m in tgRecommendation.meds" :key="m">{{ m }}</li>
              </ul>
            </template>
            <template v-else-if="tgRecommendation.type === 'lifestyle'">
              <div class="meds-line">建議生活型態調整：</div>
              <ul class="meds-list">
                <li v-for="l in tgRecommendation.lifestyle" :key="l">
                  {{ l }}
                </li>
              </ul>
            </template>
            <template v-else>
              <div class="meds-line meds-muted">
                TG 正常，持續生活型態調整與 statin 治療
              </div>
            </template>
          </div>

          <details class="statin-ref">
            <summary class="statin-ref-summary">
              📊 Statin 強度分類對照表
            </summary>
            <div class="statin-ref-table">
              <div class="statin-ref-row statin-ref-row-header">
                <span></span>
                <span
                  class="statin-ref-level"
                  :class="row.level"
                  v-for="row in STATIN_INTENSITY_TABLE"
                  :key="row.level"
                  >{{ row.label }}</span
                >
              </div>
              <div class="statin-ref-row">
                <span class="statin-ref-rowhead">LDL-C 平均降幅</span>
                <span v-for="row in STATIN_INTENSITY_TABLE" :key="row.level">{{
                  row.ldlReduction
                }}</span>
              </div>
              <div class="statin-ref-row">
                <span class="statin-ref-rowhead">TG 平均降幅*</span>
                <span v-for="row in STATIN_INTENSITY_TABLE" :key="row.level">{{
                  row.tgReduction
                }}</span>
              </div>
              <div class="statin-ref-row">
                <span class="statin-ref-rowhead">藥物（每日劑量）</span>
                <ul
                  class="statin-ref-meds"
                  v-for="row in STATIN_INTENSITY_TABLE"
                  :key="row.level"
                >
                  <li v-for="m in row.meds" :key="m">{{ m }}</li>
                </ul>
              </div>
            </div>
            <div class="statin-ref-note">
              * TG 降幅依基礎值與個體差異甚大，僅供概略參考
            </div>
          </details>
        </div>

        <div class="rc-meta">
          <div class="meta-line">
            📅 第一年每 3–6 個月抽血檢查一次，第二年後至少每 6–12 個月一次
          </div>
          <div class="meta-line">⚠ 注意肝功能異常、橫紋肌溶解症等副作用</div>
          <div class="meta-line" v-if="hasACS">
            💊 ACS / PCI/CABG 族群：LDL-C 目標 < 70 mg/dL，與藥物治療可並行
          </div>
          <div class="meta-line elderly-note" v-if="isElderly">
            🧓 ≥ 75 歲：次級預防建議中強度 Statin（Atorvastatin 10–20 mg /
            Rosuvastatin 5–10
            mg），注意衰弱、腎功能、藥物交互作用，密切監測肌肉症狀
          </div>
        </div>
      </div>

      <div class="warn-box">
        <span class="warn-icon">⚠</span>
        <span
          >本工具依據全民健康保險降血脂藥物給付規定（2.6.1）製作，僅供參考。實際給付以健保署核定為準。CVD
          定義包含冠狀動脈粥狀硬化（心導管證實或缺氧性
          ECG/負荷試驗陽性）、缺血性腦血管疾病（腦梗塞、腦內出血、TIA、症狀性頸動脈狹窄）。</span
        >
      </div>

      <div class="ens-actions">
        <button class="btn-reset" @click="reset">重置</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.lipid-wrap {
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
.lipid {
  max-width: 820px;
  margin: 0 auto;
  padding: 2rem 0 3rem;
  font-size: 0.9rem;
}
.section {
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
.cat-bar {
  border-left-color: #8b5cf6;
}
.demo-bar {
  border-left-color: #6366f1;
}
.rf-bar {
  border-left-color: #10b981;
}
.lab-bar {
  border-left-color: #3b82f6;
}
.group-icon {
  font-size: 1rem;
  flex-shrink: 0;
}
/* .group-label-text / .group-sub-text fonts unified globally in custom.css */
.group-sub-text {
  flex: 1;
}
.cat-grid {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
.cat-opt {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.65rem 0.9rem;
  border-radius: 10px;
  border: 1.5px solid var(--vp-c-divider);
  background: var(--vp-c-bg-soft);
  cursor: pointer;
  transition: all 0.18s;
}
.cat-opt.active {
  border-color: #8b5cf6;
  background: rgba(139, 92, 246, 0.06);
}
.cat-opt input[type="checkbox"] {
  accent-color: #8b5cf6;
  width: 16px;
  height: 16px;
  flex-shrink: 0;
}
.item-name-block {
  display: flex;
  flex-direction: column;
  gap: 2px;
  flex: 1;
}
/* .item-name / .item-sub fonts unified globally in custom.css */
.badge-init {
  font-size: 0.65rem;
  font-weight: 700;
  padding: 2px 8px;
  border-radius: 999px;
  background: rgba(239, 68, 68, 0.12);
  color: #dc2626;
  flex-shrink: 0;
}

.rf-card {
  border: 1px solid var(--vp-c-divider);
  border-radius: 10px;
  background: var(--vp-c-bg-soft);
  overflow: hidden;
}
.rf-row {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.55rem 0.9rem;
  border-bottom: 1px solid var(--vp-c-divider);
}
.rf-row:last-child {
  border-bottom: none;
}
.rf-q {
  font-size: 0.82rem;
  font-weight: 700;
  color: var(--vp-c-text-1);
  width: 130px;
  flex-shrink: 0;
}
.rf-opts {
  display: flex;
  gap: 0.4rem;
}
.opt-btn {
  padding: 4px 16px;
  border-radius: 6px;
  border: 1.5px solid var(--vp-c-divider);
  font-size: 0.8rem;
  font-weight: 700;
  cursor: pointer;
  font-family: inherit;
  background: var(--vp-c-bg);
  color: var(--vp-c-text-2);
  transition: all 0.15s;
}
.opt-btn.active {
  border-color: #10b981;
  color: #10b981;
  background: rgba(16, 185, 129, 0.08);
}
.rf-input {
  width: 80px;
  border: 1.5px solid var(--vp-c-divider);
  border-radius: 8px;
  background: var(--vp-c-bg);
  color: var(--vp-c-text-1);
  font-size: 0.85rem;
  font-family: inherit;
  padding: 0.35rem 0.65rem;
  outline: none;
  -moz-appearance: textfield;
}
.rf-input:focus {
  border-color: #10b981;
}
.rf-input::-webkit-outer-spin-button,
.rf-input::-webkit-inner-spin-button {
  -webkit-appearance: none;
}
.rf-hint {
  font-size: 0.72rem;
  color: var(--vp-c-text-3);
}
.elderly-hint {
  color: #d97706;
  font-weight: 700;
}
.rf-label {
  cursor: pointer;
}
.rf-label input[type="checkbox"] {
  accent-color: #10b981;
  width: 16px;
  height: 16px;
}
.rf-check-label {
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--vp-c-text-2);
  min-width: 24px;
}
.rf-summary {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.6rem 0.9rem;
  background: var(--vp-c-bg-mute);
  font-size: 0.82rem;
  font-weight: 700;
  color: var(--vp-c-text-1);
}
.rf-count-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: #10b981;
  color: #fff;
  font-size: 0.85rem;
  font-weight: 800;
}
.rf-count-detail {
  font-size: 0.72rem;
  font-weight: 400;
  color: var(--vp-c-text-3);
  flex: 1;
}
.rf-note {
  padding: 0.4rem 0.9rem 0.55rem;
  font-size: 0.72rem;
  color: #dc2626;
  font-weight: 600;
}

.lab-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.5rem;
}
.lab-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.9rem;
  border-radius: 10px;
  border: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg-soft);
}
.lab-label {
  font-size: 0.82rem;
  font-weight: 800;
  color: #3b82f6;
  flex-shrink: 0;
  width: 48px;
}
.lab-input {
  flex: 1;
  border: 1.5px solid var(--vp-c-divider);
  border-radius: 8px;
  background: var(--vp-c-bg);
  color: var(--vp-c-text-1);
  font-size: 0.85rem;
  font-family: inherit;
  padding: 0.4rem 0.65rem;
  outline: none;
  transition: border-color 0.2s;
  -moz-appearance: textfield;
  min-width: 0;
}
.lab-input::-webkit-outer-spin-button,
.lab-input::-webkit-inner-spin-button {
  -webkit-appearance: none;
}
.lab-input:focus {
  border-color: #3b82f6;
}
.lab-input::placeholder {
  color: var(--vp-c-text-3);
  font-size: 0.78rem;
}
.calc-note {
  font-size: 0.72rem;
  color: var(--vp-c-text-3);
  margin-top: 0.3rem;
  text-align: center;
}

.result-card {
  border: 1px solid var(--vp-c-divider);
  border-radius: 12px;
  overflow: hidden;
  margin-bottom: 1rem;
}
.rc-header {
  justify-content: space-between;
  border-left-color: var(--accent, var(--vp-c-text-3));
}
.rc-cat {
  font-size: 0.9rem;
  font-weight: 800;
  color: var(--vp-c-text-1);
}
.rc-status-badge {
  font-size: 0.72rem;
  font-weight: 700;
  padding: 3px 10px;
  border-radius: 999px;
  flex-shrink: 0;
}
.rc-table {
  display: flex;
  flex-direction: column;
}
.rc-row {
  display: grid;
  grid-template-columns: 62px 1fr 92px 1fr 168px;
  gap: 0.5rem;
  padding: 0.55rem 0.9rem;
  border-bottom: 1px solid var(--vp-c-divider);
  font-size: 0.86rem;
  align-items: center;
}
.rc-row:last-child {
  border-bottom: none;
}
.rc-row-header {
  font-size: 0.74rem;
  font-weight: 700;
  color: var(--vp-c-text-3);
  background: var(--vp-c-bg-mute);
  text-transform: uppercase;
  letter-spacing: 0.04em;
}
.rc-col-label {
  font-weight: 800;
}
.rc-col-criterion {
  color: var(--vp-c-text-2);
  font-weight: 600;
}
.rc-col-status {
  font-weight: 700;
  color: var(--vp-c-text-1);
  text-align: right;
  font-variant-numeric: tabular-nums;
}
.rc-col-target {
  color: var(--vp-c-text-2);
}
.rc-col-goal {
  text-align: left;
  font-size: 0.84rem;
  white-space: nowrap;
}
.rc-meds {
  padding: 0.75rem 0.9rem;
  border-top: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg-soft);
  display: flex;
  flex-direction: column;
  gap: 0.65rem;
}
.meds-title {
  font-size: 0.78rem;
  font-weight: 800;
  color: var(--vp-c-text-1);
}
.meds-block {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}
.meds-block-title {
  font-size: 0.74rem;
  font-weight: 700;
  color: #06b6d4;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}
.meds-reasons {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.4rem;
}
.meds-tag {
  font-size: 0.68rem;
  font-weight: 800;
  padding: 2px 10px;
  border-radius: 999px;
}
.meds-tag.high {
  background: rgba(239, 68, 68, 0.12);
  color: #dc2626;
}
.meds-tag.moderate {
  background: rgba(245, 158, 11, 0.14);
  color: #d97706;
}
.meds-reason {
  font-size: 0.72rem;
  color: var(--vp-c-text-3);
}
.meds-line {
  font-size: 0.78rem;
  color: var(--vp-c-text-2);
}
.meds-muted {
  color: var(--vp-c-text-3);
}
.meds-list {
  margin: 0;
  padding-left: 1.25rem;
  font-size: 0.78rem;
  color: var(--vp-c-text-1);
  line-height: 1.7;
}

.statin-ref {
  border-top: 1px dashed var(--vp-c-divider);
  padding-top: 0.6rem;
}
.statin-ref-summary {
  font-size: 0.76rem;
  font-weight: 700;
  color: var(--vp-c-text-2);
  cursor: pointer;
}
.statin-ref-table {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
  margin-top: 0.65rem;
  overflow-x: auto;
}
.statin-ref-row {
  display: grid;
  grid-template-columns: 110px repeat(3, minmax(140px, 1fr));
  gap: 0.6rem;
  font-size: 0.74rem;
  align-items: start;
  min-width: 520px;
}
.statin-ref-row-header {
  padding-bottom: 0.4rem;
  border-bottom: 1px solid var(--vp-c-divider);
}
.statin-ref-rowhead {
  font-weight: 700;
  color: var(--vp-c-text-3);
  font-size: 0.66rem;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}
.statin-ref-level {
  font-weight: 800;
}
.statin-ref-level.high {
  color: #dc2626;
}
.statin-ref-level.moderate {
  color: #d97706;
}
.statin-ref-level.low {
  color: #16a34a;
}
.statin-ref-meds {
  margin: 0;
  padding-left: 1.1rem;
  line-height: 1.6;
  color: var(--vp-c-text-1);
}
.statin-ref-note {
  font-size: 0.68rem;
  color: var(--vp-c-text-3);
  margin-top: 0.6rem;
}

.rc-meta {
  padding: 0.65rem 0.9rem;
  font-size: 0.74rem;
  color: var(--vp-c-text-2);
  border-top: 1px solid var(--vp-c-divider);
  line-height: 1.8;
}
.meta-line {
  display: flex;
  align-items: center;
  gap: 6px;
}
.elderly-note {
  color: #d97706;
  font-weight: 700;
}
.nd-bar {
  border-left-color: #f97316;
}
.nd-card {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
  padding: 0.85rem 0.9rem;
  border-radius: 10px;
  border: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg-soft);
}
.nd-q {
  font-size: 0.85rem;
  font-weight: 700;
  color: var(--vp-c-text-1);
}
.nd-opts {
  display: flex;
  gap: 0.5rem;
}
.nd-yes.active {
  border-color: #f97316 !important;
  color: #f97316 !important;
  background: rgba(249, 115, 22, 0.08) !important;
}

.warn-box {
  display: flex;
  gap: 0.6rem;
  padding: 0.75rem 1rem;
  border-radius: 10px;
  background: rgba(249, 115, 22, 0.06);
  border: 1px solid rgba(249, 115, 22, 0.3);
  font-size: 0.78rem;
  color: var(--vp-c-text-2);
  line-height: 1.6;
  margin-bottom: 1rem;
}
.warn-icon {
  color: #f97316;
  flex-shrink: 0;
}
.ens-actions {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
}
.btn-reset {
  padding: 9px 22px;
  border-radius: 8px;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  font-family: inherit;
  transition: all 0.2s;
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
  .lab-grid {
    grid-template-columns: 1fr;
  }
  .rc-row {
    grid-template-columns: 48px 1fr 74px 1fr 140px;
    font-size: 0.78rem;
  }
  .rf-q {
    width: 80px;
    font-size: 0.75rem;
  }
  .statin-ref-row {
    font-size: 0.68rem;
  }
}
</style>
