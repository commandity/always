<script setup lang="ts">
import { ref, computed } from "vue";

const activeTab = ref<"bee" | "bsa" | "crt" | "cal" | "ibw" | "lbw" | "sco">("bee");

// ── Drag-to-scroll for the wrapper tab bar (mouse) ────────────────
// Taps/clicks pass through; capture only engages past a 4px threshold
// so dragging never triggers an accidental tab switch on release.
const tabBarEl = ref<HTMLElement | null>(null);
let tabDragDown = false;
let tabDragging = false;
let tabDragStartX = 0;
let tabDragScroll = 0;

function tabBarPointerDown(e: PointerEvent) {
  if (e.pointerType !== "mouse" || !tabBarEl.value) return;
  tabDragDown = true;
  tabDragging = false;
  tabDragStartX = e.clientX;
  tabDragScroll = tabBarEl.value.scrollLeft;
}
function tabBarPointerMove(e: PointerEvent) {
  const el = tabBarEl.value;
  if (!el || !tabDragDown) return;
  const dx = e.clientX - tabDragStartX;
  if (!tabDragging && Math.abs(dx) > 4) {
    tabDragging = true;
    el.setPointerCapture(e.pointerId);
  }
  if (tabDragging) el.scrollLeft = tabDragScroll - dx;
}
function tabBarPointerUp(e: PointerEvent) {
  tabDragDown = false;
  if (tabDragging && tabBarEl.value?.hasPointerCapture(e.pointerId)) {
    tabBarEl.value.releasePointerCapture(e.pointerId);
  }
  tabDragging = false;
}

// ══════════════ BEE 基礎能量消耗（Harris-Benedict）══════════════
// Harris-Benedict BEE (1919, revised coefficients):
// Male:   BEE = 66.5 + 13.75×W + 5.003×H − 6.775×Age
// Female: BEE = 655.1 + 9.563×W + 1.850×H − 4.676×Age
// W = kg, H = cm, Age = years
// Total Caloric Req = BEE × Activity Factor
// AF: Sedentary 1.2, Lightly Active 1.375, Moderately Active 1.55, Very Active 1.725, Extra Active 1.9

type bee_Sex = "M" | "F";
type AF = "sedentary" | "light" | "moderate" | "very" | "extra";
const bee_sex = ref<bee_Sex>("M");
const bee_ageVal = ref("");
const bee_weightVal = ref("");
const bee_heightVal = ref("");
const afLevel = ref<AF>("moderate");
const bee_copied = ref(false);
const bee_showResults = ref(false);

const bee_Age = computed(() => {
  const v = parseFloat(bee_ageVal.value);
  return isNaN(v) || v <= 0 ? null : v;
});
const bee_W = computed(() => {
  const v = parseFloat(bee_weightVal.value);
  return isNaN(v) || v <= 0 ? null : v;
});
const bee_H = computed(() => {
  const v = parseFloat(bee_heightVal.value);
  return isNaN(v) || v <= 0 ? null : v;
});
const bee_isComplete = computed(
  () => bee_Age.value !== null && bee_W.value !== null && bee_H.value !== null,
);

const bee = computed(() => {
  if (!bee_isComplete.value) return null;
  let val: number;
  if (bee_sex.value === "M")
    val = 66.5 + 13.75 * bee_W.value! + 5.003 * bee_H.value! - 6.775 * bee_Age.value!;
  else val = 655.1 + 9.563 * bee_W.value! + 1.85 * bee_H.value! - 4.676 * bee_Age.value!;
  return Math.round(val);
});

const afFactors: Record<AF, number> = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  very: 1.725,
  extra: 1.9,
};
const af = computed(() => afFactors[afLevel.value]);
const bee_tee = computed(() =>
  bee.value ? Math.round(bee.value * af.value) : null,
);

const afLabels: Record<AF, string> = {
  sedentary: "久坐（Sedentary）",
  light: "輕度活動（Lightly Active）",
  moderate: "中度活動（Moderately Active）",
  very: "高度活動（Very Active）",
  extra: "極高度活動（Extra Active）",
};
const afDescs: Record<AF, string> = {
  sedentary: "幾乎不運動，辦公桌工作",
  light: "每週 1–3 天輕度運動或體力工作",
  moderate: "每週 3–5 天中等強度運動",
  very: "每週 6–7 天高強度運動",
  extra: "每天劇烈運動或重體力勞動",
};

const bee_severity = computed(() => {
  if (!bee.value) return "pending";
  if (bee.value < 1300) return "mild";
  if (bee.value < 2000) return "normal";
  return "moderate";
});

function bee_generateOutput() {
  return (
    `# 基礎能量消耗（BEE）— Harris-Benedict 公式\n\n` +
    `## 基本資料\n- 性別：${bee_sex.value === "M" ? "男性" : "女性"}\n` +
    `- 年齡：${bee_Age.value ?? "—"} 歲\n- 體重：${bee_W.value ?? "—"} kg\n- 身高：${bee_H.value ?? "—"} cm\n` +
    `- 活動程度：${afLabels[afLevel.value]}（× ${af.value}）\n\n` +
    `## 結果\n` +
    `- **基礎能量消耗（BEE）= ${bee.value ?? "—"} kcal/day**\n` +
    `- 每日總熱量需求（TEE = BEE × ${af.value}）= ${bee_tee.value ?? "—"} kcal/day`
  );
}

async function bee_copyOutput() {
  await navigator.clipboard.writeText(bee_generateOutput());
  bee_copied.value = true;
  setTimeout(() => (bee_copied.value = false), 2000);
}
function bee_reset() {
  bee_ageVal.value = "";
  bee_weightVal.value = "";
  bee_heightVal.value = "";
  bee_sex.value = "M";
  afLevel.value = "moderate";
  bee_showResults.value = false;
}

// ══════════════ BSA 體表面積（Body Surface Area）══════════════
// BSA Formulas (H=cm, W=kg unless noted):
// Mosteller:  BSA = sqrt(H×W / 3600)
// DuBois:     BSA = 0.007184 × H^0.725 × W^0.425
// Haycock:    BSA = 0.024265 × H^0.3964 × W^0.5378
// Gehan-George: BSA = 0.0235 × H^0.42246 × W^0.51456
// Boyd:       BSA = 0.0003207 × H^0.3 × W(g)^(0.7285−0.0188×log10(W(g)))

type Method = "mosteller" | "dubois" | "haycock" | "gehan" | "boyd";

const bsa_heightVal = ref("");
const bsa_weightVal = ref("");
const method = ref<Method>("mosteller");
const bsa_copied = ref(false);
const bsa_showResults = ref(false);

const bsa_H = computed(() => {
  const v = parseFloat(bsa_heightVal.value);
  return isNaN(v) || v <= 0 ? null : v;
});
const bsa_W = computed(() => {
  const v = parseFloat(bsa_weightVal.value);
  return isNaN(v) || v <= 0 ? null : v;
});
const bsa_isComplete = computed(() => bsa_H.value !== null && bsa_W.value !== null);

function calcBSA(m: Method): number | null {
  if (!bsa_H.value || !bsa_W.value) return null;
  let val: number;
  switch (m) {
    case "mosteller":
      val = Math.sqrt((bsa_H.value * bsa_W.value) / 3600);
      break;
    case "dubois":
      val = 0.007184 * Math.pow(bsa_H.value, 0.725) * Math.pow(bsa_W.value, 0.425);
      break;
    case "haycock":
      val = 0.024265 * Math.pow(bsa_H.value, 0.3964) * Math.pow(bsa_W.value, 0.5378);
      break;
    case "gehan":
      val = 0.0235 * Math.pow(bsa_H.value, 0.42246) * Math.pow(bsa_W.value, 0.51456);
      break;
    case "boyd": {
      const Wg = bsa_W.value * 1000;
      val =
        0.0003207 *
        Math.pow(bsa_H.value, 0.3) *
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
const bsa_bmi = computed(() =>
  bsa_W.value && bsa_H.value
    ? Math.round((bsa_W.value / (bsa_H.value / 100) ** 2) * 10) / 10
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

const bsa_severity = computed(() => {
  if (!bsa.value) return "pending";
  if (bsa.value < 1.5) return "mild";
  if (bsa.value < 2.2) return "normal";
  return "moderate";
});

function bsa_generateOutput() {
  return (
    `# 體表面積（BSA）計算 — 多公式比較\n\n` +
    `## 輸入資料\n- 身高：${bsa_H.value ?? "—"} cm\n- 體重：${bsa_W.value ?? "—"} kg\n- BMI：${bsa_bmi.value ?? "—"} kg/m²\n\n` +
    `## 各公式結果\n` +
    `- **Mosteller = ${bsaMosteller.value ?? "—"} m²**（首選）\n` +
    `- DuBois = ${bsaDuBois.value ?? "—"} m²\n` +
    `- Haycock = ${bsaHaycock.value ?? "—"} m²\n` +
    `- Gehan & George = ${bsaGehan.value ?? "—"} m²\n` +
    `- Boyd = ${bsaBoyd.value ?? "—"} m²`
  );
}

async function bsa_copyOutput() {
  await navigator.clipboard.writeText(bsa_generateOutput());
  bsa_copied.value = true;
  setTimeout(() => (bsa_copied.value = false), 2000);
}
function bsa_reset() {
  bsa_heightVal.value = "";
  bsa_weightVal.value = "";
  method.value = "mosteller";
  bsa_showResults.value = false;
}

// ══════════════ 每日熱量參考表（Calorie Requirements）══════════════

type crt_Sex = "M" | "F";
type crt_PAL = "sedentary" | "moderate" | "active";

const crt_sex = ref<crt_Sex>("M");
const crt_copied = ref(false);
const crt_showResults = ref(false);

const maleTable: {
  age: string;
  ageMin: number;
  ageMax: number;
  sed: number;
  mod: number;
  act: number;
}[] = [
  { age: "19–20", ageMin: 19, ageMax: 20, sed: 2600, mod: 2800, act: 3000 },
  { age: "21–25", ageMin: 21, ageMax: 25, sed: 2400, mod: 2800, act: 3000 },
  { age: "26–30", ageMin: 26, ageMax: 30, sed: 2400, mod: 2600, act: 3000 },
  { age: "31–35", ageMin: 31, ageMax: 35, sed: 2400, mod: 2600, act: 3000 },
  { age: "36–40", ageMin: 36, ageMax: 40, sed: 2400, mod: 2600, act: 2800 },
  { age: "41–45", ageMin: 41, ageMax: 45, sed: 2200, mod: 2600, act: 2800 },
  { age: "46–50", ageMin: 46, ageMax: 50, sed: 2200, mod: 2400, act: 2800 },
  { age: "51–55", ageMin: 51, ageMax: 55, sed: 2200, mod: 2400, act: 2800 },
  { age: "56–60", ageMin: 56, ageMax: 60, sed: 2200, mod: 2400, act: 2600 },
  { age: "61–65", ageMin: 61, ageMax: 65, sed: 2000, mod: 2400, act: 2600 },
  { age: "66–70", ageMin: 66, ageMax: 70, sed: 2000, mod: 2200, act: 2600 },
  { age: "71–75", ageMin: 71, ageMax: 75, sed: 2000, mod: 2200, act: 2600 },
  { age: "76+", ageMin: 76, ageMax: 120, sed: 2000, mod: 2200, act: 2400 },
];

const femaleTable: {
  age: string;
  ageMin: number;
  ageMax: number;
  sed: number;
  mod: number;
  act: number;
}[] = [
  { age: "19–20", ageMin: 19, ageMax: 20, sed: 2000, mod: 2200, act: 2400 },
  { age: "21–25", ageMin: 21, ageMax: 25, sed: 2000, mod: 2200, act: 2400 },
  { age: "26–30", ageMin: 26, ageMax: 30, sed: 1800, mod: 2000, act: 2400 },
  { age: "31–35", ageMin: 31, ageMax: 35, sed: 1800, mod: 2000, act: 2200 },
  { age: "36–40", ageMin: 36, ageMax: 40, sed: 1800, mod: 2000, act: 2200 },
  { age: "41–45", ageMin: 41, ageMax: 45, sed: 1800, mod: 2000, act: 2200 },
  { age: "46–50", ageMin: 46, ageMax: 50, sed: 1800, mod: 2000, act: 2200 },
  { age: "51–55", ageMin: 51, ageMax: 55, sed: 1600, mod: 1800, act: 2200 },
  { age: "56–60", ageMin: 56, ageMax: 60, sed: 1600, mod: 1800, act: 2200 },
  { age: "61–65", ageMin: 61, ageMax: 65, sed: 1600, mod: 1800, act: 2000 },
  { age: "66–70", ageMin: 66, ageMax: 70, sed: 1600, mod: 1800, act: 2000 },
  { age: "71–75", ageMin: 71, ageMax: 75, sed: 1600, mod: 1800, act: 2000 },
  { age: "76+", ageMin: 76, ageMax: 120, sed: 1600, mod: 1800, act: 2000 },
];

const activeTable = computed(() =>
  crt_sex.value === "M" ? maleTable : femaleTable,
);
const minFloor = computed(() => (crt_sex.value === "M" ? 1500 : 1200));

const crt_palLabels: Record<crt_PAL, string> = {
  sedentary: "久坐 Sedentary",
  moderate: "中度活動 Moderately Active",
  active: "活動 Active",
};
const crt_palDescs: Record<crt_PAL, string> = {
  sedentary: "僅有日常生活的輕度活動，無規律運動",
  moderate: "相當於每日步行 2.4–4.8 km（1.5–3 英里），時速 4.8–6.4 km/hr",
  active: "相當於每日步行超過 4.8 km（> 3 英里），時速 4.8–6.4 km/hr",
};

function applyFloor(val: number, floor: number): number {
  return Math.max(val, floor);
}
function loss500(maint: number): number {
  return applyFloor(maint - 500, minFloor.value);
}
function loss1000(maint: number): number {
  return applyFloor(maint - 1000, minFloor.value);
}
function palVal(row: (typeof maleTable)[0], pal: crt_PAL): number {
  return pal === "sedentary" ? row.sed : pal === "moderate" ? row.mod : row.act;
}

const selectedAge = ref<number | null>(null);
const selectedPAL = ref<crt_PAL>("moderate");

const selectedRow = computed(() =>
  selectedAge.value !== null
    ? (activeTable.value.find(
        (r) => selectedAge.value! >= r.ageMin && selectedAge.value! <= r.ageMax,
      ) ?? null)
    : null,
);
const maintenance = computed(() =>
  selectedRow.value ? palVal(selectedRow.value, selectedPAL.value) : null,
);
const wl500 = computed(() =>
  maintenance.value ? loss500(maintenance.value) : null,
);
const wl1000 = computed(() =>
  maintenance.value ? loss1000(maintenance.value) : null,
);

const crt_isComplete = computed(() => selectedRow.value !== null);

function crt_generateOutput() {
  if (!selectedRow.value || !maintenance.value) return "請先選擇年齡與活動程度";
  return (
    `# 成人熱量需求參考表（${crt_sex.value === "M" ? "男性" : "女性"}）\n\n` +
    `## 選擇條件\n- 性別：${crt_sex.value === "M" ? "男性" : "女性"}\n` +
    `- 年齡組別：${selectedRow.value.age} 歲\n` +
    `- 活動程度：${crt_palLabels[selectedPAL.value]}\n\n` +
    `## 熱量目標\n` +
    `- **維持體重：${maintenance.value} kcal/day**\n` +
    `- 每週減重 0.5 kg（−500 kcal）：${wl500.value} kcal/day\n` +
    `- 每週減重 1.0 kg（−1000 kcal）：${wl1000.value} kcal/day\n\n` +
    `*資料來源：USDA 膳食指南 2020–2025 附錄 2 · IOM EER 方程式*`
  );
}

async function crt_copyOutput() {
  await navigator.clipboard.writeText(crt_generateOutput());
  crt_copied.value = true;
  setTimeout(() => (crt_copied.value = false), 2000);
}

function crt_reset() {
  selectedAge.value = null;
  selectedPAL.value = "moderate";
  crt_showResults.value = false;
}

// ══════════════ EER 熱量需求（Estimated Energy Requirement）══════════════

// IOM EER Adult equations (2002/2005 DRI, used by MedCentral)
// Male:   EER = 662 − 9.53×Age + PA×(15.91×Wt[kg] + 539.6×Ht[m])
// Female: EER = 354 − 6.91×Age + PA×(9.36×Wt[kg]  + 726×Ht[m])
// PA coefficients:
//   Sedentary  M:1.00 F:1.00
//   Low Active M:1.11 F:1.12
//   Active     M:1.25 F:1.27
//   Very Active M:1.48 F:1.45

type cal_Sex = "M" | "F";
type PALevel = "sedentary" | "low" | "active" | "veryActive";

const cal_sex = ref<cal_Sex>("M");
const cal_ageVal = ref("");
const cal_weightVal = ref(""); // kg
const cal_heightVal = ref(""); // cm
const cal_palLevel = ref<PALevel>("low");
const cal_copied = ref(false);
const cal_showResults = ref(false);

const cal_Age = computed(() => {
  const v = parseFloat(cal_ageVal.value);
  return isNaN(v) || v < 19 || v > 100 ? null : v;
});
const cal_W = computed(() => {
  const v = parseFloat(cal_weightVal.value);
  return isNaN(v) || v <= 0 ? null : v;
});
const cal_H = computed(() => {
  const v = parseFloat(cal_heightVal.value);
  return isNaN(v) || v <= 0 ? null : v;
});

const cal_isComplete = computed(
  () => cal_Age.value !== null && cal_W.value !== null && cal_H.value !== null,
);

const cal_Hm = computed(() => (cal_H.value ? cal_H.value / 100 : null));

const paCoeff = computed(() => {
  const tbl: Record<PALevel, Record<cal_Sex, number>> = {
    sedentary: { M: 1.0, F: 1.0 },
    low: { M: 1.11, F: 1.12 },
    active: { M: 1.25, F: 1.27 },
    veryActive: { M: 1.48, F: 1.45 },
  };
  return tbl[cal_palLevel.value][cal_sex.value];
});

const eer = computed(() => {
  if (!cal_isComplete.value || !cal_Hm.value) return null;
  let val: number;
  if (cal_sex.value === "M")
    val =
      662 -
      9.53 * cal_Age.value! +
      paCoeff.value * (15.91 * cal_W.value! + 539.6 * cal_Hm.value);
  else
    val =
      354 -
      6.91 * cal_Age.value! +
      paCoeff.value * (9.36 * cal_W.value! + 726 * cal_Hm.value);
  return Math.round(val);
});

// Weight loss targets
const loss05 = computed(() =>
  eer.value ? Math.max(eer.value - 500, 1200) : null,
);
const loss10 = computed(() =>
  eer.value ? Math.max(eer.value - 1000, 1200) : null,
);

const cal_bmi = computed(() =>
  cal_W.value && cal_Hm.value
    ? Math.round((cal_W.value / (cal_Hm.value * cal_Hm.value)) * 10) / 10
    : null,
);

const cal_palLabels: Record<PALevel, string> = {
  sedentary: "久坐（Sedentary）",
  low: "低度活動（Low Active）",
  active: "中度活動（Active）",
  veryActive: "非常活動（Very Active）",
};
const cal_palDescs: Record<PALevel, string> = {
  sedentary: "僅有日常生活的輕度活動",
  low: "每日步行約 1.5–3 英里，或每週 1–2 次中等強度運動",
  active: "每日步行超過 3 英里，或每週 3–5 次中等強度運動",
  veryActive: "高強度體力勞動或每日超過 1 小時劇烈運動",
};

const eerSeverity = computed(() => {
  if (!eer.value) return "pending";
  if (eer.value < 1500) return "mild";
  if (eer.value < 2500) return "normal";
  return "moderate";
});

function cal_generateOutput() {
  return (
    `# 成人熱量需求計算（IOM EER）\n\n` +
    `## 基本資料\n\n` +
    `- 性別：${cal_sex.value === "M" ? "男性" : "女性"}\n` +
    `- 年齡：${cal_Age.value ?? "—"} 歲\n` +
    `- 體重：${cal_W.value ?? "—"} kg\n` +
    `- 身高：${cal_H.value ?? "—"} cm（${cal_Hm.value ?? "—"} m）\n` +
    `- BMI：${cal_bmi.value ?? "—"} kg/m²\n` +
    `- 活動程度：${cal_palLabels[cal_palLevel.value]}（PA = ${paCoeff.value}）\n\n` +
    `## 結果\n\n` +
    `- **維持體重所需熱量（EER）：${eer.value ?? "—"} kcal/day**\n` +
    `- 每週減重 0.5 kg（−500 kcal/day）：${loss05.value ?? "—"} kcal/day\n` +
    `- 每週減重 1.0 kg（−1000 kcal/day）：${loss10.value ?? "—"} kcal/day`
  );
}

async function cal_copyOutput() {
  await navigator.clipboard.writeText(cal_generateOutput());
  cal_copied.value = true;
  setTimeout(() => (cal_copied.value = false), 2000);
}
function cal_reset() {
  cal_ageVal.value = "";
  cal_weightVal.value = "";
  cal_heightVal.value = "";
  cal_sex.value = "M";
  cal_palLevel.value = "low";
  cal_showResults.value = false;
}

// ══════════════ 理想體重（Ideal Body Weight）══════════════

// Devine IBW:
// Male:   IBW(kg) = 50 + 2.3 × (height_inches − 60)
// Female: IBW(kg) = 45.5 + 2.3 × (height_inches − 60)
// Only valid for height ≥ 60 inches (152.4 cm)
//
// Adjusted Body Weight (ABW) for obesity (ABW > 130% IBW):
// ABW = IBW + 0.4 × (Actual BW − IBW)
//
// Robinson formula (alternative):
// Male:   IBW(kg) = 52 + 1.9 × (height_inches − 60)
// Female: IBW(kg) = 49 + 1.7 × (height_inches − 60)
//
// Miller formula:
// Male:   IBW(kg) = 56.2 + 1.41 × (height_inches − 60)
// Female: IBW(kg) = 53.1 + 1.36 × (height_inches − 60)

type ibw_Sex = "M" | "F";

const ibw_sex = ref<ibw_Sex>("M");
const ibw_heightVal = ref(""); // cm
const ibw_weightVal = ref(""); // kg (actual body weight)
const ibw_copied = ref(false);
const ibw_showResults = ref(false);

const Hcm = computed(() => {
  const v = parseFloat(ibw_heightVal.value);
  return isNaN(v) || v < 100 ? null : v;
});
const ABW = computed(() => {
  const v = parseFloat(ibw_weightVal.value);
  return isNaN(v) || v <= 0 ? null : v;
});

const Hin = computed(() => (Hcm.value ? Hcm.value / 2.54 : null));
const inchesOver60 = computed(() =>
  Hin.value ? Math.max(Hin.value - 60, 0) : null,
);

const ibw_isComplete = computed(() => Hcm.value !== null && ABW.value !== null);
const heightOk = computed(() => Hcm.value !== null && Hcm.value >= 152.4);

// Devine IBW
const ibwDevine = computed(() => {
  if (!heightOk.value || inchesOver60.value === null) return null;
  const base = ibw_sex.value === "M" ? 50 : 45.5;
  return Math.round((base + 2.3 * inchesOver60.value) * 10) / 10;
});

// Robinson IBW
const ibwRobinson = computed(() => {
  if (!heightOk.value || inchesOver60.value === null) return null;
  const base = ibw_sex.value === "M" ? 52 : 49;
  const k = ibw_sex.value === "M" ? 1.9 : 1.7;
  return Math.round((base + k * inchesOver60.value) * 10) / 10;
});

// Miller IBW
const ibwMiller = computed(() => {
  if (!heightOk.value || inchesOver60.value === null) return null;
  const base = ibw_sex.value === "M" ? 56.2 : 53.1;
  const k = ibw_sex.value === "M" ? 1.41 : 1.36;
  return Math.round((base + k * inchesOver60.value) * 10) / 10;
});

// BMI
const ibw_bmi = computed(() => {
  if (!ABW.value || !Hcm.value) return null;
  const hm = Hcm.value / 100;
  return Math.round((ABW.value / (hm * hm)) * 10) / 10;
});

// Obesity check: ABW > 130% of IBW
const isObese130 = computed(() => {
  if (!ibwDevine.value || !ABW.value) return false;
  return ABW.value > 1.3 * ibwDevine.value;
});

const pctIBW = computed(() => {
  if (!ibwDevine.value || !ABW.value) return null;
  return Math.round((ABW.value / ibwDevine.value) * 100);
});

// ABW (Adjusted Body Weight) — for obese patients
const adjBW = computed(() => {
  if (!ibwDevine.value || !ABW.value || !isObese130.value) return null;
  return (
    Math.round((ibwDevine.value + 0.4 * (ABW.value - ibwDevine.value)) * 10) /
    10
  );
});

const ibw_severity = computed(() => {
  if (!ibwDevine.value) return "pending";
  if (pctIBW.value !== null && pctIBW.value <= 100) return "normal";
  if (pctIBW.value !== null && pctIBW.value <= 130) return "mild";
  return "moderate";
});

function ibw_generateOutput() {
  return (
    `# 理想體重（Devine 法）及調整體重計算\n\n` +
    `## 輸入資料\n- 性別：${ibw_sex.value === "M" ? "男性" : "女性"}\n` +
    `- 身高：${Hcm.value ?? "—"} cm（${Hin.value?.toFixed(1) ?? "—"} 英寸）\n` +
    `- 實際體重（ABW）：${ABW.value ?? "—"} kg\n- BMI：${ibw_bmi.value ?? "—"} kg/m²\n\n` +
    `## 結果\n` +
    `- **IBW（Devine）= ${ibwDevine.value ?? "—"} kg**\n` +
    `- IBW（Robinson）= ${ibwRobinson.value ?? "—"} kg\n` +
    `- IBW（Miller）= ${ibwMiller.value ?? "—"} kg\n` +
    `- 實際體重為 IBW 的 ${pctIBW.value ?? "—"}%\n` +
    (adjBW.value
      ? `- **調整體重（ABW）= ${adjBW.value} kg**（肥胖：ABW > 130% IBW）`
      : `- 無需計算調整體重（ABW ≤ 130% IBW）`)
  );
}

async function ibw_copyOutput() {
  await navigator.clipboard.writeText(ibw_generateOutput());
  ibw_copied.value = true;
  setTimeout(() => (ibw_copied.value = false), 2000);
}
function ibw_reset() {
  ibw_heightVal.value = "";
  ibw_weightVal.value = "";
  ibw_sex.value = "M";
  ibw_showResults.value = false;
}

// ══════════════ 瘦體重（Lean Body Weight）══════════════
// Hume formula (W=kg, H=cm):
//   Male:   LBW = 0.32810×W + 0.33929×H − 29.5336
//   Female: LBW = 0.29569×W + 0.41813×H − 43.2933
// Boer formula:
//   Male:   LBW = 0.407×W + 0.267×H − 19.2
//   Female: LBW = 0.252×W + 0.473×H − 48.3
// James formula (pharmacokinetic, BMI-based):
//   Male:   LBW = 1.10×W − 0.0128×BMI×W
//   Female: LBW = 1.07×W − 0.0148×BMI×W
// Peters (children ≤14): LBW = 3.8 × 0.0215 × W^0.6469 × H^0.7236

type lbw_Sex = "M" | "F";
const lbw_sex = ref<lbw_Sex>("M");
const lbw_weightVal = ref("");
const lbw_heightVal = ref("");
const lbw_copied = ref(false);
const lbw_showResults = ref(false);

const lbw_W = computed(() => {
  const v = parseFloat(lbw_weightVal.value);
  return isNaN(v) || v <= 0 ? null : v;
});
const lbw_H = computed(() => {
  const v = parseFloat(lbw_heightVal.value);
  return isNaN(v) || v <= 0 ? null : v;
});
const lbw_isComplete = computed(() => lbw_W.value !== null && lbw_H.value !== null);
const lbw_Hm = computed(() => (lbw_H.value ? lbw_H.value / 100 : null));
const lbw_bmi = computed(() =>
  lbw_W.value && lbw_Hm.value
    ? Math.round((lbw_W.value / (lbw_Hm.value * lbw_Hm.value)) * 10) / 10
    : null,
);

const humeRaw = computed(() => {
  if (!lbw_W.value || !lbw_H.value) return null;
  if (lbw_sex.value === "M") return 0.3281 * lbw_W.value + 0.33929 * lbw_H.value - 29.5336;
  return 0.29569 * lbw_W.value + 0.41813 * lbw_H.value - 43.2933;
});
const lbwHume = computed(() =>
  humeRaw.value !== null ? Math.round(humeRaw.value * 10) / 10 : null,
);

const boerRaw = computed(() => {
  if (!lbw_W.value || !lbw_H.value) return null;
  if (lbw_sex.value === "M") return 0.407 * lbw_W.value + 0.267 * lbw_H.value - 19.2;
  return 0.252 * lbw_W.value + 0.473 * lbw_H.value - 48.3;
});
const lbwBoer = computed(() =>
  boerRaw.value !== null ? Math.round(boerRaw.value * 10) / 10 : null,
);

const jamesRaw = computed(() => {
  if (!lbw_W.value || !lbw_bmi.value) return null;
  if (lbw_sex.value === "M") return 1.1 * lbw_W.value - 0.0128 * lbw_bmi.value * lbw_W.value;
  return 1.07 * lbw_W.value - 0.0148 * lbw_bmi.value * lbw_W.value;
});
const lbwJames = computed(() =>
  jamesRaw.value !== null ? Math.round(jamesRaw.value * 10) / 10 : null,
);

// Body fat % derived from Hume LBW
const fatPct = computed(() => {
  if (!lbwHume.value || !lbw_W.value) return null;
  return Math.round((1 - lbwHume.value / lbw_W.value) * 100 * 10) / 10;
});

const lbw_severity = computed(() => {
  if (!lbwHume.value) return "pending";
  if (fatPct.value === null) return "normal";
  if (lbw_sex.value === "M") {
    if (fatPct.value <= 17) return "normal";
    if (fatPct.value <= 24) return "mild";
    return "moderate";
  } else {
    if (fatPct.value <= 24) return "normal";
    if (fatPct.value <= 31) return "mild";
    return "moderate";
  }
});

function lbw_generateOutput() {
  return (
    `# 瘦體重（Lean Body Weight）計算\n\n` +
    `## 輸入資料\n- 性別：${lbw_sex.value === "M" ? "男性" : "女性"}\n` +
    `- 體重：${lbw_W.value ?? "—"} kg\n- 身高：${lbw_H.value ?? "—"} cm\n- BMI：${lbw_bmi.value ?? "—"} kg/m²\n\n` +
    `## 結果\n` +
    `- **LBW（Hume）= ${lbwHume.value ?? "—"} kg**\n` +
    `- LBW（Boer）= ${lbwBoer.value ?? "—"} kg\n` +
    `- LBW（James）= ${lbwJames.value ?? "—"} kg\n` +
    `- 估算體脂率（Hume）= ${fatPct.value ?? "—"}%`
  );
}

async function lbw_copyOutput() {
  await navigator.clipboard.writeText(lbw_generateOutput());
  lbw_copied.value = true;
  setTimeout(() => (lbw_copied.value = false), 2000);
}
function lbw_reset() {
  lbw_weightVal.value = "";
  lbw_heightVal.value = "";
  lbw_sex.value = "M";
  lbw_showResults.value = false;
}

// ══════════════ Schofield BMR（Basal Metabolic Rate）══════════════

type sco_Sex = "M" | "F";
type sco_PAL = "sedentary" | "light" | "moderate" | "very";
type BracketKey = "lt3" | "3to10" | "10to18" | "18to30" | "30to60" | "gt60";

const sco_sex = ref<sco_Sex>("M");
const sco_ageVal = ref("");
const sco_weightVal = ref("");
const sco_palLevel = ref<sco_PAL>("moderate");
const sco_copied = ref(false);
const sco_showResults = ref(false);

const sco_Age = computed(() => {
  const v = parseFloat(sco_ageVal.value);
  return isNaN(v) || v < 0 ? null : v;
});
const sco_W = computed(() => {
  const v = parseFloat(sco_weightVal.value);
  return isNaN(v) || v <= 0 ? null : v;
});
const sco_isComplete = computed(() => sco_Age.value !== null && sco_W.value !== null);

const bracket = computed(() => {
  const a = sco_Age.value;
  if (a === null) return null;
  if (a < 3) return "lt3";
  if (a < 10) return "3to10";
  if (a < 18) return "10to18";
  if (a < 30) return "18to30";
  if (a < 60) return "30to60";
  return "gt60";
});

const coefs: Record<sco_Sex, Record<BracketKey, [number, number]>> = {
  M: {
    lt3: [59.512, -30.4],
    "3to10": [22.706, 504.3],
    "10to18": [17.686, 658.2],
    "18to30": [15.057, 692.2],
    "30to60": [11.472, 873.1],
    gt60: [11.711, 587.7],
  },
  F: {
    lt3: [58.317, -31.1],
    "3to10": [20.315, 485.9],
    "10to18": [13.384, 692.6],
    "18to30": [14.818, 486.6],
    "30to60": [8.126, 845.6],
    gt60: [9.082, 658.5],
  },
};

const bmr = computed(() => {
  if (!sco_isComplete.value || !bracket.value) return null;
  const [a, b] = coefs[sco_sex.value][bracket.value as BracketKey];
  return Math.round((a * sco_W.value! + b) * 10) / 10;
});

const palFactors: Record<sco_Sex, Record<sco_PAL, number>> = {
  M: { sedentary: 1.3, light: 1.6, moderate: 1.7, very: 2.1 },
  F: { sedentary: 1.3, light: 1.5, moderate: 1.6, very: 1.9 },
};
const pal = computed(() => palFactors[sco_sex.value][sco_palLevel.value]);
const sco_tee = computed(() =>
  bmr.value ? Math.round(bmr.value * pal.value) : null,
);

const sco_palLabels: Record<sco_PAL, string> = {
  sedentary: "久坐 Sedentary",
  light: "輕度活動 Lightly Active",
  moderate: "中度活動 Moderate Activity",
  very: "非常活動 Very Active",
};
const sco_palDescs: Record<sco_PAL, string> = {
  sedentary: "非常低度身體活動，久坐且休閒活動極少",
  light: "每日例行活動包含步行，或每週 1–2 次輕至中等強度運動",
  moderate: "每週至少 3 次 20–45 分鐘中高強度運動，或需要體力勞動的工作",
  very: "每日 1 小時以上高強度運動，或重體力勞動職業（農業、建築等）",
};

const bracketLabels: Record<BracketKey, string> = {
  lt3: "< 3 歲",
  "3to10": "3–10 歲",
  "10to18": "10–18 歲",
  "18to30": "18–30 歲",
  "30to60": "30–60 歲",
  gt60: "> 60 歲",
};

const sco_severity = computed(() => {
  if (!bmr.value) return "pending";
  if (bmr.value < 900) return "mild";
  if (bmr.value < 1800) return "normal";
  return "moderate";
});

function sco_generateOutput() {
  const bk = bracket.value as BracketKey | null;
  return (
    `# Schofield BMR 計算\n\n` +
    `## 基本資料\n- 性別：${sco_sex.value === "M" ? "男性" : "女性"}\n` +
    `- 年齡：${sco_Age.value ?? "—"} 歲（年齡組別：${bk ? bracketLabels[bk] : "—"}）\n` +
    `- 體重：${sco_W.value ?? "—"} kg\n` +
    `- 活動程度：${sco_palLabels[sco_palLevel.value]}（PAL = ${pal.value}）\n\n` +
    `## 結果\n` +
    `- **BMR（Schofield）= ${bmr.value ?? "—"} kcal/day**\n` +
    `- 每日總能量消耗（TEE = BMR × PAL）= ${sco_tee.value ?? "—"} kcal/day`
  );
}

async function sco_copyOutput() {
  await navigator.clipboard.writeText(sco_generateOutput());
  sco_copied.value = true;
  setTimeout(() => (sco_copied.value = false), 2000);
}
function sco_reset() {
  sco_ageVal.value = "";
  sco_weightVal.value = "";
  sco_sex.value = "M";
  sco_palLevel.value = "moderate";
  sco_showResults.value = false;
}
</script>

<template>
  <div class="metabolism">
    <!-- Tab bar -->
    <div
      class="tab-bar"
      ref="tabBarEl"
      @pointerdown="tabBarPointerDown"
      @pointermove="tabBarPointerMove"
      @pointerup="tabBarPointerUp"
      @pointercancel="tabBarPointerUp"
    >
      <button
        class="tab-btn"
        :class="{ active: activeTab === 'bee' }"
        @click="activeTab = 'bee'"
      >
        <span class="tab-label">BEE 基礎能量消耗</span>
        <span class="tab-sub">Harris-Benedict</span>
      </button>
      <button
        class="tab-btn"
        :class="{ active: activeTab === 'bsa' }"
        @click="activeTab = 'bsa'"
      >
        <span class="tab-label">BSA 體表面積</span>
        <span class="tab-sub">Body Surface Area</span>
      </button>
      <button
        class="tab-btn"
        :class="{ active: activeTab === 'crt' }"
        @click="activeTab = 'crt'"
      >
        <span class="tab-label">每日熱量參考表</span>
        <span class="tab-sub">Calorie Requirements</span>
      </button>
      <button
        class="tab-btn"
        :class="{ active: activeTab === 'cal' }"
        @click="activeTab = 'cal'"
      >
        <span class="tab-label">EER 熱量需求</span>
        <span class="tab-sub">Estimated Energy Requirement</span>
      </button>
      <button
        class="tab-btn"
        :class="{ active: activeTab === 'ibw' }"
        @click="activeTab = 'ibw'"
      >
        <span class="tab-label">理想體重</span>
        <span class="tab-sub">Ideal Body Weight</span>
      </button>
      <button
        class="tab-btn"
        :class="{ active: activeTab === 'lbw' }"
        @click="activeTab = 'lbw'"
      >
        <span class="tab-label">瘦體重</span>
        <span class="tab-sub">Lean Body Weight</span>
      </button>
      <button
        class="tab-btn"
        :class="{ active: activeTab === 'sco' }"
        @click="activeTab = 'sco'"
      >
        <span class="tab-label">Schofield BMR</span>
        <span class="tab-sub">Basal Metabolic Rate</span>
      </button>
    </div>

  <div v-show="activeTab === 'bee'" class="bee">
    <div class="bee-header">
      <div class="header-title">
        <h2 class="title">BEE 基礎能量消耗</h2>
        <p class="subtitle">
          Basal Energy Expenditure · Harris-Benedict Estimation (1919) · W = kg
          · H = cm
        </p>
      </div>
      <div class="score-badge" :class="bee_severity">
        <span class="badge-label">BEE</span>
        <span class="score-number">{{ bee ?? "—" }}</span>
        <span class="score-unit" :style="{ opacity: bee ? 1 : 0 }">kcal/d</span>
        <span class="score-label">TEE {{ bee_tee ?? "—" }} kcal</span>
      </div>
    </div>

    <!-- Sex tab -->
    <div class="nihss-group">
      <div class="group-header-bar sex-bar">
        <span class="group-icon">👤</span>
        <span class="group-label-text">性別選擇</span>
        <span class="group-sub-text">Harris-Benedict 公式男女方程式不同</span>
      </div>
      <div class="tab-toggle">
        <button
          class="tab-btn"
          :class="{ 'tab-active-m': bee_sex === 'M' }"
          @click="bee_sex = 'M'"
        >
          <span class="tab-title">♂ 男性（Male）</span>
          <span class="tab-sub">BEE = 66.5 + 13.75W + 5.003H − 6.775Age</span>
        </button>
        <button
          class="tab-btn"
          :class="{ 'tab-active-f': bee_sex === 'F' }"
          @click="bee_sex = 'F'"
        >
          <span class="tab-title">♀ 女性（Female）</span>
          <span class="tab-sub">BEE = 655.1 + 9.563W + 1.850H − 4.676Age</span>
        </button>
      </div>
    </div>

    <!-- Inputs -->
    <div class="nihss-group">
      <div class="group-header-bar input-bar">
        <span class="group-icon">📏</span>
        <span class="group-label-text">身體數值輸入</span>
        <span class="group-sub-text">年齡、體重、身高</span>
        <span
          class="group-score-tally"
          :class="bee_sex === 'M' ? 'male-tally' : 'female-tally'"
          >{{ bee ? bee + " kcal" : "—" }}</span
        >
      </div>
      <div class="group-items">
        <div class="ens-item" :class="{ answered: bee_Age !== null }">
          <div class="item-header">
            <div class="item-meta-row"><span class="item-qnum">Age</span></div>
            <div class="item-name-block">
              <span class="item-name">年齡 Age</span>
              <span class="item-sub"
                >隨年齡增加，基礎代謝率逐年下降（每歲約 6.775 kcal，男性）</span
              >
            </div>
            <span class="item-score" :class="{ zero: bee_Age === null }"
              >{{ bee_Age ?? "—" }}<small v-if="bee_Age"> 歲</small></span
            >
          </div>
          <div class="input-row">
            <input
              v-model="bee_ageVal"
              type="number"
              min="1"
              max="120"
              step="1"
              placeholder="歲"
              class="bee-input"
            />
            <span class="input-unit">歲</span>
          </div>
        </div>
        <div class="ens-item" :class="{ answered: bee_W !== null }">
          <div class="item-header">
            <div class="item-meta-row"><span class="item-qnum">Wt</span></div>
            <div class="item-name-block">
              <span class="item-name">體重 Weight</span>
              <span class="item-sub"
                >實際體重（kg）。肌肉量高者可能低估；肥胖者可考慮使用調整體重</span
              >
            </div>
            <span class="item-score" :class="{ zero: bee_W === null }"
              >{{ bee_W ?? "—" }}<small v-if="bee_W"> kg</small></span
            >
          </div>
          <div class="input-row">
            <input
              v-model="bee_weightVal"
              type="number"
              min="10"
              max="400"
              step="0.1"
              placeholder="kg"
              class="bee-input"
            />
            <span class="input-unit">kg</span>
          </div>
        </div>
        <div class="ens-item" :class="{ answered: bee_H !== null }">
          <div class="item-header">
            <div class="item-meta-row"><span class="item-qnum">Ht</span></div>
            <div class="item-name-block">
              <span class="item-name">身高 Height</span>
              <span class="item-sub"
                >身高（公分）直接代入公式（不需換算為公尺）</span
              >
            </div>
            <span class="item-score" :class="{ zero: bee_H === null }"
              >{{ bee_H ?? "—" }}<small v-if="bee_H"> cm</small></span
            >
          </div>
          <div class="input-row">
            <input
              v-model="bee_heightVal"
              type="number"
              min="50"
              max="250"
              step="0.1"
              placeholder="cm"
              class="bee-input"
            />
            <span class="input-unit">cm</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Activity factor -->
    <div class="nihss-group">
      <div class="group-header-bar act-bar">
        <span class="group-icon">🏃</span>
        <span class="group-label-text">活動係數（Activity Factor）</span>
        <span class="group-sub-text">TEE = BEE × AF</span>
        <span class="group-score-tally act-tally">AF = {{ af }}</span>
      </div>
      <div class="af-grid">
        <button
          v-for="(desc, key) in afDescs"
          :key="key"
          class="af-btn"
          :class="{ 'af-active': afLevel === key }"
          @click="afLevel = key as AF"
        >
          <span class="af-name">{{ afLabels[key as AF] }}</span>
          <span class="af-factor">× {{ afFactors[key as AF] }}</span>
          <span class="af-desc">{{ desc }}</span>
        </button>
      </div>
    </div>

    <!-- Formula -->
    <div class="formula-box" v-if="bee_isComplete && bee">
      <span class="formula-label">計算過程：</span>
      <span class="formula-text">
        BEE = {{ bee_sex === "M" ? "66.5" : "655.1" }} +
        {{ bee_sex === "M" ? "13.75" : "9.563" }}×{{ bee_W }} +
        {{ bee_sex === "M" ? "5.003" : "1.850" }}×{{ bee_H }} −
        {{ bee_sex === "M" ? "6.775" : "4.676" }}×{{ bee_Age }} = {{ bee }} kcal ；TEE =
        {{ bee }} × {{ af }} = <strong>{{ bee_tee }} kcal/day</strong>
      </span>
    </div>

    <!-- Result card -->
    <div class="ens-result" :class="bee_severity">
      <div class="result-left">
        <span class="result-number">{{ bee ?? "—" }}</span>
        <span class="result-max" v-if="bee">kcal/d</span>
      </div>
      <div class="result-right">
        <span class="result-level">基礎能量消耗（BEE）</span>
        <span class="result-advice" v-if="bee_tee">
          每日總熱量需求（TEE）= {{ bee }} × {{ af }} =
          <strong>{{ bee_tee }} kcal/day</strong>
        </span>
        <span class="result-sub" v-if="bee_tee">{{ afLabels[afLevel] }}</span>
      </div>
    </div>

    <!-- TEE table -->
    <div class="tee-table" v-if="bee">
      <div class="tt-header">各活動程度下每日總熱量需求（TEE = BEE × AF）</div>
      <div
        v-for="(fac, key) in afFactors"
        :key="key"
        class="tt-row"
        :class="{ 'tt-active': afLevel === key }"
      >
        <span class="tt-level">{{ afLabels[key as AF] }}</span>
        <span class="tt-af">× {{ fac }}</span>
        <span class="tt-val">{{ Math.round(bee! * fac) }} kcal/day</span>
      </div>
    </div>

    <div class="warn-box">
      <span class="warn-icon">⚠</span>
      <span
        >Harris-Benedict 公式（1919 年）可能高估現代人的 BEE 約
        5%。肥胖患者建議使用實際體重或 Mifflin-St Jeor
        公式。不適用於嚴重疾病、大面積燒傷或代謝極端異常的患者；此時應使用間接熱量測定（Indirect
        Calorimetry）。</span
      >
    </div>

    <div v-if="bee_showResults" class="results-detail">
      <div class="results-header">評估明細</div>
      <div class="detail-row">
        <span class="detail-qnum">Sex</span
        ><span class="detail-domain">性別</span
        ><span class="detail-score">—</span
        ><span class="detail-desc">{{ bee_sex === "M" ? "男性" : "女性" }}</span>
      </div>
      <div class="detail-row">
        <span class="detail-qnum">Age</span
        ><span class="detail-domain">年齡</span
        ><span class="detail-score">{{ bee_Age ?? "—" }}</span
        ><span class="detail-desc">歲</span>
      </div>
      <div class="detail-row">
        <span class="detail-qnum">Wt</span
        ><span class="detail-domain">體重</span
        ><span class="detail-score">{{ bee_W ?? "—" }}</span
        ><span class="detail-desc">kg</span>
      </div>
      <div class="detail-row">
        <span class="detail-qnum">Ht</span
        ><span class="detail-domain">身高</span
        ><span class="detail-score">{{ bee_H ?? "—" }}</span
        ><span class="detail-desc">cm</span>
      </div>
      <div class="detail-row">
        <span class="detail-qnum">AF</span
        ><span class="detail-domain">活動係數</span
        ><span class="detail-score">{{ af }}</span
        ><span class="detail-desc">{{ afLevel }}</span>
      </div>
      <div class="detail-row">
        <span class="detail-qnum">TEE</span
        ><span class="detail-domain">每日總熱量需求</span
        ><span class="detail-score">{{ bee_tee ?? "—" }}</span
        ><span class="detail-desc">kcal/d</span>
      </div>
      <div class="detail-row detail-total">
        <span class="detail-qnum">BEE</span>
        <span class="detail-domain">基礎能量消耗（最終結果）</span>
        <span class="detail-score detail-score-brand">{{ bee ?? "—" }}</span>
        <div class="detail-desc detail-desc-block">
          <span class="detail-desc-unit">kcal/d</span>
          <span class="detail-desc-label">Harris-Benedict</span>
        </div>
      </div>
    </div>

    <div class="ens-actions">
      <button class="btn-view" @click="bee_showResults = !bee_showResults">
        {{ bee_showResults ? "收起明細" : "查看評估結果" }}
      </button>
      <button class="btn-copy" :disabled="!bee_isComplete" @click="bee_copyOutput">
        {{ bee_copied ? "已複製 ✓" : "複製 Markdown 結果" }}
      </button>
      <button class="btn-reset" @click="bee_reset">重置</button>
    </div>
    <p v-if="!bee_isComplete" class="progress-hint">請輸入年齡、體重及身高</p>
  </div>

  <div v-show="activeTab === 'bsa'" class="bsa">
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
        :class="bsa_severity"
        :style="{ '--accent': methodColors[method] }"
      >
        <span class="badge-label">{{ method.toUpperCase() }}</span>
        <span class="score-number">{{ bsa ?? "—" }}</span>
        <span class="score-unit" :style="{ opacity: bsa ? 1 : 0 }">m²</span>
        <span class="score-label">{{ bsa_bmi ? "BMI " + bsa_bmi : "—" }}</span>
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
        <div class="ens-item" :class="{ answered: bsa_H !== null }">
          <div class="item-header">
            <div class="item-meta-row"><span class="item-qnum">Ht</span></div>
            <div class="item-name-block">
              <span class="item-name">身高 Height</span>
              <span class="item-sub"
                >所有公式均以公分（cm）輸入，Boyd 公式對身高使用
                H^0.3，非線性影響較小</span
              >
            </div>
            <span class="item-score" :class="{ zero: bsa_H === null }"
              >{{ bsa_H ?? "—" }}<small v-if="bsa_H"> cm</small></span
            >
          </div>
          <div class="input-row">
            <input
              v-model="bsa_heightVal"
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
        <div class="ens-item" :class="{ answered: bsa_W !== null }">
          <div class="item-header">
            <div class="item-meta-row"><span class="item-qnum">Wt</span></div>
            <div class="item-name-block">
              <span class="item-name">體重 Weight</span>
              <span class="item-sub"
                >使用實際體重（kg）。化療藥物劑量建議使用實際體重計算
                BSA（含肥胖患者）</span
              >
            </div>
            <span class="item-score" :class="{ zero: bsa_W === null }"
              >{{ bsa_W ?? "—" }}<small v-if="bsa_W"> kg</small></span
            >
          </div>
          <div class="input-row">
            <input
              v-model="bsa_weightVal"
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
        <div class="ens-item derived-item" v-if="bsa_bmi">
          <div class="item-header">
            <div class="item-meta-row">
              <span class="item-qnum bmi-q">BMI</span>
            </div>
            <div class="item-name-block">
              <span class="item-name">身體質量指數（自動計算）</span>
              <span class="item-sub"
                >BMI = {{ bsa_W }} ÷ {{ ((bsa_H! / 100) ** 2).toFixed(4) }} =
                {{ bsa_bmi }} kg/m²</span
              >
            </div>
            <span class="item-score" style="color: #06b6d4">{{ bsa_bmi }}</span>
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
    <div class="bsa-table" v-if="bsa_isComplete">
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
    <div class="formula-box" v-if="bsa_isComplete && bsa">
      <span class="formula-label"
        >計算過程（{{ methodLabels[method] }}）：</span
      >
      <span class="formula-text">
        <template v-if="method === 'mosteller'"
          >BSA = √({{ bsa_H }}×{{ bsa_W }} / 3600) = √{{
            ((bsa_H! * bsa_W!) / 3600).toFixed(4)
          }}
          = <strong>{{ bsa }} m²</strong></template
        >
        <template v-else-if="method === 'dubois'"
          >BSA = 0.007184×{{ bsa_H }}^0.725×{{ bsa_W }}^0.425 =
          <strong>{{ bsa }} m²</strong></template
        >
        <template v-else-if="method === 'haycock'"
          >BSA = 0.024265×{{ bsa_H }}^0.3964×{{ bsa_W }}^0.5378 =
          <strong>{{ bsa }} m²</strong></template
        >
        <template v-else-if="method === 'gehan'"
          >BSA = 0.0235×{{ bsa_H }}^0.42246×{{ bsa_W }}^0.51456 =
          <strong>{{ bsa }} m²</strong></template
        >
        <template v-else
          >BSA = 0.0003207×{{ bsa_H }}^0.3×{{
            bsa_W ? bsa_W * 1000 : "?"
          }}(g)^(0.7285−0.0188×log₁₀{{ bsa_W ? bsa_W * 1000 : "" }}) =
          <strong>{{ bsa }} m²</strong></template
        >
      </span>
    </div>

    <!-- Result card -->
    <div class="ens-result" :class="bsa_severity">
      <div class="result-left">
        <span class="result-number">{{ bsa ?? "—" }}</span>
        <span class="result-max" v-if="bsa">m²</span>
      </div>
      <div class="result-right">
        <span class="result-level">{{ methodLabels[method] }}</span>
        <span class="result-advice" v-if="bsa">
          參考值：成人正常範圍約 1.6–2.0 m²（平均 1.73 m²）
        </span>
        <span class="result-sub" v-if="bsa_bmi">BMI {{ bsa_bmi }} kg/m²</span>
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

    <div v-if="bsa_showResults" class="results-detail">
      <div class="results-header">評估明細</div>
      <div class="detail-row">
        <span class="detail-qnum">Ht</span
        ><span class="detail-domain">身高</span
        ><span class="detail-score">{{ bsa_H ?? "—" }}</span
        ><span class="detail-desc">cm</span>
      </div>
      <div class="detail-row">
        <span class="detail-qnum">Wt</span
        ><span class="detail-domain">體重</span
        ><span class="detail-score">{{ bsa_W ?? "—" }}</span
        ><span class="detail-desc">kg</span>
      </div>
      <div class="detail-row">
        <span class="detail-qnum">BMI</span
        ><span class="detail-domain">身體質量指數</span
        ><span class="detail-score">{{ bsa_bmi ?? "—" }}</span
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
      <button class="btn-view" @click="bsa_showResults = !bsa_showResults">
        {{ bsa_showResults ? "收起明細" : "查看評估結果" }}
      </button>
      <button class="btn-copy" :disabled="!bsa_isComplete" @click="bsa_copyOutput">
        {{ bsa_copied ? "已複製 ✓" : "複製 Markdown 結果" }}
      </button>
      <button class="btn-reset" @click="bsa_reset">重置</button>
    </div>
    <p v-if="!bsa_isComplete" class="progress-hint">請輸入身高及體重</p>
  </div>

  <div v-show="activeTab === 'crt'" class="crt">
    <!-- ── Header ─────────────────────────────────────────────── -->
    <div class="crt-header">
      <div class="header-title">
        <h2 class="title">Calorie Requirements Table 成人每日熱量需求參考表</h2>
        <!-- ✦ subtitle split into two lines so it never crowds the badge ✦ -->
        <p class="subtitle">
          Calorie Requirements for Weight Maintenance &amp; Weight Loss
        </p>
        <p class="subtitle subtitle-2">
          USDA DGA 2020–2025 · 依年齡、性別及活動程度
        </p>
      </div>
      <div
        class="score-badge"
        :class="
          maintenance
            ? crt_sex === 'M'
              ? 'badge-male'
              : 'badge-female'
            : 'pending'
        "
      >
        <span class="badge-sex">{{ crt_sex === "M" ? "♂ 男性" : "♀ 女性" }}</span>
        <span class="score-number">{{ maintenance ?? "—" }}</span>
        <span class="score-unit" :style="{ opacity: maintenance ? 1 : 0 }"
          >kcal/d</span
        >
        <span class="score-label">維持體重</span>
      </div>
    </div>

    <!-- ── Sex tab ─────────────────────────────────────────────── -->
    <div class="nihss-group">
      <div class="group-header-bar sex-bar">
        <span class="group-icon">👤</span>
        <span class="group-label-text">性別選擇</span>
        <span class="group-sub-text"
          >男女因體型、激素及肌肉量差異，熱量需求不同</span
        >
      </div>
      <div class="tab-toggle">
        <button
          class="tab-btn"
          :class="{ 'tab-active-m': crt_sex === 'M' }"
          @click="
            crt_sex = 'M';
            selectedAge = null;
          "
        >
          <span class="tab-title">♂ 男性（Male）</span>
          <span class="tab-sub">參考身高 178 cm · 每日 2,000–3,000 kcal</span>
        </button>
        <button
          class="tab-btn"
          :class="{ 'tab-active-f': crt_sex === 'F' }"
          @click="
            crt_sex = 'F';
            selectedAge = null;
          "
        >
          <span class="tab-title">♀ 女性（Female）</span>
          <span class="tab-sub">參考身高 163 cm · 每日 1,600–2,400 kcal</span>
        </button>
      </div>
    </div>

    <!-- ── Activity level ─────────────────────────────────────── -->
    <div class="nihss-group">
      <div class="group-header-bar act-bar">
        <span class="group-icon">🏃</span>
        <span class="group-label-text">身體活動程度</span>
        <span class="group-sub-text">選擇最符合日常活動量的程度</span>
        <span class="group-score-tally act-tally">{{
          crt_palLabels[selectedPAL]
        }}</span>
      </div>
      <div class="pal-grid">
        <button
          v-for="(desc, key) in crt_palDescs"
          :key="key"
          class="pal-btn"
          :class="{ 'pal-active': selectedPAL === key }"
          @click="selectedPAL = key as crt_PAL"
        >
          <span class="pal-name">{{ crt_palLabels[key as crt_PAL] }}</span>
          <span class="pal-desc">{{ desc }}</span>
        </button>
      </div>
    </div>

    <!-- ── Age group selector ─────────────────────────────────── -->
    <div class="nihss-group">
      <div class="group-header-bar age-bar">
        <span class="group-icon">📅</span>
        <span class="group-label-text">年齡組別選擇</span>
        <span class="group-sub-text">點選對應年齡區間查看熱量目標</span>
        <span class="group-score-tally age-tally">
          {{ selectedRow ? selectedRow.age + " 歲" : "請選擇" }}
        </span>
      </div>
      <div class="age-grid">
        <button
          v-for="row in activeTable"
          :key="row.age"
          class="age-btn"
          :class="{
            'age-active': selectedRow?.age === row.age,
            'age-male': crt_sex === 'M' && selectedRow?.age === row.age,
            'age-female': crt_sex === 'F' && selectedRow?.age === row.age,
          }"
          @click="selectedAge = row.ageMin"
        >
          <span class="age-label">{{ row.age }}</span>
          <span class="age-val">{{ palVal(row, selectedPAL) }}</span>
          <span class="age-unit">kcal</span>
        </button>
      </div>
    </div>

    <!-- ── Full reference table ───────────────────────────────── -->
    <div class="nihss-group">
      <div class="group-header-bar table-bar">
        <span class="group-icon">📊</span>
        <span class="group-label-text"
          >完整熱量參考表（{{ crt_sex === "M" ? "男性" : "女性" }}）</span
        >
        <span class="group-sub-text"
          >含維持、減重 0.5 kg、減重 1.0 kg 三欄目標</span
        >
      </div>
      <div class="ref-table">
        <div class="rt-row rt-header">
          <span>年齡</span>
          <span>久坐</span>
          <span>中度活動</span>
          <span>活動</span>
          <span>−500 kcal</span>
          <span>−1000 kcal</span>
        </div>
        <div
          v-for="row in activeTable"
          :key="row.age"
          class="rt-row"
          :class="{
            'rt-active': selectedRow?.age === row.age,
            'rt-male': crt_sex === 'M' && selectedRow?.age === row.age,
            'rt-female': crt_sex === 'F' && selectedRow?.age === row.age,
          }"
        >
          <span class="rt-age">{{ row.age }}</span>
          <span
            :class="
              selectedPAL === 'sedentary' && selectedRow?.age === row.age
                ? 'rt-highlight'
                : ''
            "
            >{{ row.sed }}</span
          >
          <span
            :class="
              selectedPAL === 'moderate' && selectedRow?.age === row.age
                ? 'rt-highlight'
                : ''
            "
            >{{ row.mod }}</span
          >
          <span
            :class="
              selectedPAL === 'active' && selectedRow?.age === row.age
                ? 'rt-highlight'
                : ''
            "
            >{{ row.act }}</span
          >
          <span class="rt-loss">{{ loss500(palVal(row, selectedPAL)) }}</span>
          <span class="rt-loss">{{ loss1000(palVal(row, selectedPAL)) }}</span>
        </div>
      </div>
      <p class="table-note">
        ⓘ −500/−1000 kcal 欄依目前選擇的活動程度（{{
          crt_palLabels[selectedPAL]
        }}）計算。 最低熱量下限：{{ crt_sex === "M" ? "男性 1,500" : "女性 1,200" }}
        kcal/day。
      </p>
    </div>

    <!-- ── Result card ────────────────────────────────────────── -->
    <div
      v-if="crt_isComplete"
      class="ens-result"
      :class="crt_sex === 'M' ? 'result-male' : 'result-female'"
    >
      <div class="result-left">
        <span class="result-number">{{ maintenance }}</span>
        <span class="result-max">kcal/d</span>
      </div>
      <div class="result-right">
        <span class="result-level"
          >{{ selectedRow?.age }} 歲 · {{ crt_palLabels[selectedPAL] }}</span
        >
        <span class="result-advice"
          >每週減 0.5 kg：<strong>{{ wl500 }} kcal/day</strong>（每日少 500
          kcal）</span
        >
        <span class="result-advice"
          >每週減 1.0 kg：<strong>{{ wl1000 }} kcal/day</strong>（每日少 1,000
          kcal）</span
        >
        <span class="result-sub"
          >最低熱量下限 {{ minFloor }} kcal/day · 每減 7,700 kcal ≈ 減少 1 kg
          體重</span
        >
      </div>
    </div>

    <!-- ── Weight loss summary ────────────────────────────────── -->
    <div v-if="crt_isComplete" class="loss-cards">
      <div
        class="loss-card loss-maintain"
        :class="crt_sex === 'M' ? 'lc-male' : 'lc-female'"
      >
        <span class="lc-icon">⚖️</span>
        <span class="lc-val">{{ maintenance }}</span>
        <span class="lc-unit">kcal/day</span>
        <span class="lc-label">維持體重</span>
      </div>
      <div class="loss-card loss-05">
        <span class="lc-icon">📉</span>
        <span class="lc-val">{{ wl500 }}</span>
        <span class="lc-unit">kcal/day</span>
        <span class="lc-label">每週減 0.5 kg</span>
      </div>
      <div class="loss-card loss-10">
        <span class="lc-icon">📉📉</span>
        <span class="lc-val">{{ wl1000 }}</span>
        <span class="lc-unit">kcal/day</span>
        <span class="lc-label">每週減 1.0 kg</span>
      </div>
    </div>

    <!-- ── Clinical note ──────────────────────────────────────── -->
    <div class="warn-box">
      <span class="warn-icon">⚠</span>
      <span>
        表格數值使用 USDA 參考體型（男性 5'10" 178 cm、女性 5'4" 163
        cm）推算，適用於體型接近參考值的一般成人。
        個人實際需求受身高、體重及體型組成影響，建議使用個人化 EER 公式（IOM
        方程式）精確計算。 熱量不應低於女性 1,200 kcal/day 或男性 1,500
        kcal/day，以避免營養不足。
        孕婦、哺乳婦女及有特殊醫療狀況者請諮詢醫師或註冊營養師。
      </span>
    </div>

    <!-- ── Results detail ─────────────────────────────────────── -->
    <div v-if="crt_showResults && crt_isComplete" class="results-detail">
      <div class="results-header">評估明細</div>
      <div class="detail-row">
        <span class="detail-qnum">性別</span>
        <span class="detail-domain">Sex</span>
        <span class="detail-score">{{ crt_sex === "M" ? "♂" : "♀" }}</span>
        <span class="detail-desc">{{ crt_sex === "M" ? "男性" : "女性" }}</span>
      </div>
      <div class="detail-row">
        <span class="detail-qnum">年齡</span>
        <span class="detail-domain">Age Group</span>
        <span class="detail-score" style="font-size: 0.75rem">{{
          selectedRow?.age
        }}</span>
        <span class="detail-desc">歲</span>
      </div>
      <div class="detail-row">
        <span class="detail-qnum">活動</span>
        <span class="detail-domain">Physical Activity Level</span>
        <span class="detail-score" style="font-size: 0.68rem; width: 52px">{{
          selectedPAL
        }}</span>
        <span class="detail-desc">{{ crt_palLabels[selectedPAL] }}</span>
      </div>
      <div class="detail-row">
        <span class="detail-qnum">−500</span>
        <span class="detail-domain">每週減 0.5 kg（−500 kcal/day）</span>
        <span class="detail-score">{{ wl500 }}</span>
        <span class="detail-desc">kcal/day</span>
      </div>
      <div class="detail-row">
        <span class="detail-qnum">−1000</span>
        <span class="detail-domain">每週減 1.0 kg（−1000 kcal/day）</span>
        <span class="detail-score">{{ wl1000 }}</span>
        <span class="detail-desc">kcal/day</span>
      </div>
      <div class="detail-row detail-total">
        <span class="detail-qnum">EER</span>
        <span class="detail-domain">維持體重每日熱量需求</span>
        <span class="detail-score detail-score-brand">{{ maintenance }}</span>
        <div class="detail-desc detail-desc-block">
          <span class="detail-desc-unit">kcal/d</span>
          <span class="detail-desc-label">維持體重</span>
        </div>
      </div>
    </div>

    <!-- ── Actions ────────────────────────────────────────────── -->
    <div class="ens-actions">
      <button class="btn-view" @click="crt_showResults = !crt_showResults">
        {{ crt_showResults ? "收起明細" : "查看評估結果" }}
      </button>
      <button class="btn-copy" :disabled="!crt_isComplete" @click="crt_copyOutput">
        {{ crt_copied ? "已複製 ✓" : "複製 Markdown 結果" }}
      </button>
      <button class="btn-reset" @click="crt_reset">重置</button>
    </div>
    <p v-if="!crt_isComplete" class="progress-hint">
      請點選上方年齡組別以查看熱量目標
    </p>
  </div>

  <div v-show="activeTab === 'cal'" class="cal">
    <!-- Header -->
    <div class="cal-header">
      <div class="header-title">
        <h2 class="title">EER 成人熱量需求估算</h2>
        <p class="subtitle">
          Calorie Requirements for Weight Maintenance & Weight Loss · IOM EER
          Adult Equations
        </p>
      </div>
      <div class="score-badge" :class="eerSeverity">
        <span class="badge-label">{{
          cal_sex === "M" ? "♂ 男性" : "♀ 女性"
        }}</span>
        <span class="score-number">{{ eer ?? "—" }}</span>
        <span class="score-unit" :style="{ opacity: eer ? 1 : 0 }"
          >kcal/day</span
        >
        <span class="score-label">維持體重</span>
      </div>
    </div>

    <!-- Sex tab -->
    <div class="nihss-group">
      <div class="group-header-bar sex-bar">
        <span class="group-icon">👤</span>
        <span class="group-label-text">性別選擇</span>
        <span class="group-sub-text">EER 方程式因性別而異</span>
      </div>
      <div class="tab-toggle">
        <button
          class="tab-btn"
          :class="{ 'tab-active-m': cal_sex === 'M' }"
          @click="cal_sex = 'M'"
        >
          <span class="tab-title">♂ 男性（Male）</span>
          <span class="tab-sub"
            >EER = 662 − 9.53×Age + PA×(15.91×W + 539.6×H)</span
          >
        </button>
        <button
          class="tab-btn"
          :class="{ 'tab-active-f': cal_sex === 'F' }"
          @click="cal_sex = 'F'"
        >
          <span class="tab-title">♀ 女性（Female）</span>
          <span class="tab-sub"
            >EER = 354 − 6.91×Age + PA×(9.36×W + 726×H)</span
          >
        </button>
      </div>
    </div>

    <!-- Inputs -->
    <div class="nihss-group">
      <div class="group-header-bar input-bar">
        <span class="group-icon">📏</span>
        <span class="group-label-text">身體數值輸入</span>
        <span class="group-sub-text">適用於 19 歲以上成人</span>
        <span
          class="group-score-tally"
          :class="cal_sex === 'M' ? 'male-tally' : 'female-tally'"
          >{{ eer ? eer + " kcal" : "—" }}</span
        >
      </div>
      <div class="group-items">
        <div class="ens-item" :class="{ answered: cal_Age !== null }">
          <div class="item-header">
            <div class="item-meta-row"><span class="item-qnum">Age</span></div>
            <div class="item-name-block">
              <span class="item-name">年齡 Age</span>
              <span class="item-sub"
                >適用範圍 19–100 歲。年齡影響基礎代謝率（每歲約減少 5–10
                kcal）</span
              >
            </div>
            <span class="item-score" :class="{ zero: cal_Age === null }"
              >{{ cal_Age ?? "—" }}<small v-if="cal_Age"> 歲</small></span
            >
          </div>
          <div class="input-row">
            <input
              v-model="cal_ageVal"
              type="number"
              min="19"
              max="100"
              step="1"
              placeholder="歲"
              class="cal-input"
            />
            <span class="input-unit">歲</span>
          </div>
        </div>
        <div class="ens-item" :class="{ answered: cal_W !== null }">
          <div class="item-header">
            <div class="item-meta-row"><span class="item-qnum">Wt</span></div>
            <div class="item-name-block">
              <span class="item-name">體重 Body Weight</span>
              <span class="item-sub"
                >實際體重（公斤）。此計算不區分肥胖類別，直接使用實際體重</span
              >
            </div>
            <span class="item-score" :class="{ zero: cal_W === null }"
              >{{ cal_W ?? "—" }}<small v-if="cal_W"> kg</small></span
            >
          </div>
          <div class="input-row">
            <input
              v-model="cal_weightVal"
              type="number"
              min="20"
              max="300"
              step="0.1"
              placeholder="kg"
              class="cal-input"
            />
            <span class="input-unit">kg</span>
          </div>
        </div>
        <div class="ens-item" :class="{ answered: cal_H !== null }">
          <div class="item-header">
            <div class="item-meta-row"><span class="item-qnum">Ht</span></div>
            <div class="item-name-block">
              <span class="item-name">身高 Height</span>
              <span class="item-sub"
                >身高（公分）。公式中自動轉換為公尺（÷ 100）進行計算</span
              >
            </div>
            <span class="item-score" :class="{ zero: cal_H === null }"
              >{{ cal_H ?? "—" }}<small v-if="cal_H"> cm</small></span
            >
          </div>
          <div class="input-row">
            <input
              v-model="cal_heightVal"
              type="number"
              min="100"
              max="250"
              step="0.1"
              placeholder="cm"
              class="cal-input"
            />
            <span class="input-unit">cm</span>
          </div>
        </div>
        <!-- BMI derived -->
        <div class="ens-item derived-item" v-if="cal_bmi">
          <div class="item-header">
            <div class="item-meta-row">
              <span class="item-qnum bmi-q">BMI</span>
            </div>
            <div class="item-name-block">
              <span class="item-name">身體質量指數（自動計算）</span>
              <span class="item-sub"
                >BMI = 體重(kg) ÷ 身高(m)² = {{ cal_W }} ÷ {{ cal_Hm?.toFixed(2) }}² =
                {{ cal_bmi }} kg/m²</span
              >
            </div>
            <span class="item-score" style="color: #06b6d4">{{ cal_bmi }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Activity level -->
    <div class="nihss-group">
      <div class="group-header-bar act-bar">
        <span class="group-icon">🏃</span>
        <span class="group-label-text">身體活動程度（PAL）</span>
        <span class="group-sub-text">PA 係數影響最終熱量估算</span>
        <span class="group-score-tally act-tally">PA = {{ paCoeff }}</span>
      </div>
      <div class="pal-grid">
        <button
          v-for="(desc, key) in cal_palDescs"
          :key="key"
          class="pal-btn"
          :class="{ 'pal-active': cal_palLevel === key }"
          @click="cal_palLevel = key as PALevel"
        >
          <span class="pal-name">{{ cal_palLabels[key as PALevel] }}</span>
          <span class="pal-pa"
            >PA =
            {{
              {
                sedentary: { M: 1.0, F: 1.0 },
                low: { M: 1.11, F: 1.12 },
                active: { M: 1.25, F: 1.27 },
                veryActive: { M: 1.48, F: 1.45 },
              }[key as PALevel][cal_sex]
            }}</span
          >
          <span class="pal-desc">{{ desc }}</span>
        </button>
      </div>
    </div>

    <!-- Formula box -->
    <div class="formula-box" v-if="cal_isComplete && eer">
      <span class="formula-label">計算過程：</span>
      <span class="formula-text">
        EER = {{ cal_sex === "M" ? "662" : "354" }} −
        {{ cal_sex === "M" ? "9.53" : "6.91" }}×{{ cal_Age }} + {{ paCoeff }}×({{
          cal_sex === "M" ? "15.91" : "9.36"
        }}×{{ cal_W }} + {{ cal_sex === "M" ? "539.6" : "726" }}×{{ cal_Hm?.toFixed(2) }}) =
        <strong>{{ eer }} kcal/day</strong>
      </span>
    </div>

    <!-- Result card -->
    <div class="ens-result" :class="eerSeverity">
      <div class="result-left">
        <span class="result-number">{{ eer ?? "—" }}</span>
        <span class="result-max" v-if="eer">kcal/day</span>
      </div>
      <div class="result-right">
        <span class="result-level">維持體重每日熱量需求</span>
        <span class="result-advice" v-if="eer">
          {{ cal_palLabels[cal_palLevel] }}，PA = {{ paCoeff }}
        </span>
        <span class="result-sub" v-if="eer"> BMI {{ cal_bmi }} kg/m² </span>
      </div>
    </div>

    <!-- Weight loss table -->
    <div class="loss-table" v-if="eer">
      <div class="lt-header">熱量目標</div>
      <div class="lt-row lt-main">
        <span class="lt-label">維持體重</span>
        <span class="lt-val">{{ eer }} kcal/day</span>
        <span class="lt-note">EER（能量平衡）</span>
      </div>
      <div class="lt-row">
        <span class="lt-label">每週減 0.5 kg</span>
        <span class="lt-val">{{ loss05 }} kcal/day</span>
        <span class="lt-note">EER − 500 kcal</span>
      </div>
      <div class="lt-row">
        <span class="lt-label">每週減 1.0 kg</span>
        <span class="lt-val">{{ loss10 }} kcal/day</span>
        <span class="lt-note">EER − 1000 kcal（最低 1200 kcal）</span>
      </div>
    </div>

    <!-- Warn -->
    <div class="warn-box">
      <span class="warn-icon">⚠</span>
      <span
        >EER
        為估算值，適用於維持健康體重的一般成人。不適用於孕婦、哺乳婦女、極端體型者或急性疾病患者。每日熱量攝取不應低於女性
        1200 kcal 或男性 1500 kcal，以避免營養不足。</span
      >
    </div>

    <!-- Detail -->
    <div v-if="cal_showResults" class="results-detail">
      <div class="results-header">評估明細</div>
      <div class="detail-row">
        <span class="detail-qnum">Sex</span
        ><span class="detail-domain">性別</span
        ><span class="detail-score">{{ cal_sex === "M" ? "♂" : "♀" }}</span
        ><span class="detail-desc">{{ cal_sex === "M" ? "男性" : "女性" }}</span>
      </div>
      <div class="detail-row">
        <span class="detail-qnum">Age</span
        ><span class="detail-domain">年齡</span
        ><span class="detail-score">{{ cal_Age ?? "—" }}</span
        ><span class="detail-desc">歲</span>
      </div>
      <div class="detail-row">
        <span class="detail-qnum">Wt</span
        ><span class="detail-domain">體重</span
        ><span class="detail-score">{{ cal_W ?? "—" }}</span
        ><span class="detail-desc">kg</span>
      </div>
      <div class="detail-row">
        <span class="detail-qnum">Ht</span
        ><span class="detail-domain">身高</span
        ><span class="detail-score">{{ cal_H ?? "—" }}</span
        ><span class="detail-desc">cm</span>
      </div>
      <div class="detail-row">
        <span class="detail-qnum">BMI</span
        ><span class="detail-domain">身體質量指數</span
        ><span class="detail-score">{{ cal_bmi ?? "—" }}</span
        ><span class="detail-desc">kg/m²</span>
      </div>
      <div class="detail-row">
        <span class="detail-qnum">PA</span
        ><span class="detail-domain">活動係數</span
        ><span class="detail-score">{{ paCoeff }}</span
        ><span class="detail-desc">{{ cal_palLevel }}</span>
      </div>
      <div class="detail-row detail-total">
        <span class="detail-qnum">EER</span>
        <span class="detail-domain">維持體重熱量需求</span>
        <span class="detail-score detail-score-brand">{{ eer ?? "—" }}</span>
        <div class="detail-desc detail-desc-block">
          <span class="detail-desc-unit">kcal/d</span>
          <span class="detail-desc-label">維持體重</span>
        </div>
      </div>
    </div>

    <!-- Actions -->
    <div class="ens-actions">
      <button class="btn-view" @click="cal_showResults = !cal_showResults">
        {{ cal_showResults ? "收起明細" : "查看評估結果" }}
      </button>
      <button class="btn-copy" :disabled="!cal_isComplete" @click="cal_copyOutput">
        {{ cal_copied ? "已複製 ✓" : "複製 Markdown 結果" }}
      </button>
      <button class="btn-reset" @click="cal_reset">重置</button>
    </div>
    <p v-if="!cal_isComplete" class="progress-hint">請輸入年齡、體重及身高</p>
  </div>

  <div v-show="activeTab === 'ibw'" class="ibw">
    <div class="ibw-header">
      <div class="header-title">
        <h2 class="title">Ideal Body Weight 理想體重及調整體重</h2>
        <p class="subtitle">
          Ideal Body Weight（Devine 法）& Adjusted Body Weight for Obesity
        </p>
      </div>
      <div class="score-badge" :class="ibw_severity">
        <span class="badge-label">Devine IBW</span>
        <span class="score-number">{{ ibwDevine ?? "—" }}</span>
        <span class="score-unit" :style="{ opacity: ibwDevine ? 1 : 0 }"
          >kg</span
        >
        <span class="score-label">{{
          pctIBW !== null ? pctIBW + "% of IBW" : "—"
        }}</span>
      </div>
    </div>

    <!-- Sex tab -->
    <div class="nihss-group">
      <div class="group-header-bar sex-bar">
        <span class="group-icon">👤</span>
        <span class="group-label-text">性別選擇</span>
        <span class="group-sub-text">Devine 公式男女基準值不同</span>
      </div>
      <div class="tab-toggle">
        <button
          class="tab-btn"
          :class="{ 'tab-active-m': ibw_sex === 'M' }"
          @click="ibw_sex = 'M'"
        >
          <span class="tab-title">♂ 男性（Male）</span>
          <span class="tab-sub">IBW = 50 + 2.3 × (英寸 − 60)</span>
        </button>
        <button
          class="tab-btn"
          :class="{ 'tab-active-f': ibw_sex === 'F' }"
          @click="ibw_sex = 'F'"
        >
          <span class="tab-title">♀ 女性（Female）</span>
          <span class="tab-sub">IBW = 45.5 + 2.3 × (英寸 − 60)</span>
        </button>
      </div>
    </div>

    <!-- Inputs -->
    <div class="nihss-group">
      <div class="group-header-bar input-bar">
        <span class="group-icon">📏</span>
        <span class="group-label-text">輸入數值</span>
        <span class="group-sub-text">身高需 ≥ 152.4 cm（5 英尺）</span>
      </div>
      <div class="group-items">
        <div
          class="ens-item"
          :class="{
            answered: Hcm !== null,
            'warn-border': Hcm !== null && !heightOk,
          }"
        >
          <div class="item-header">
            <div class="item-meta-row"><span class="item-qnum">Ht</span></div>
            <div class="item-name-block">
              <span class="item-name">身高 Height</span>
              <span class="item-sub"
                >Devine 公式適用於身高 ≥ 152.4 cm（5
                英尺）。公式中自動轉換為英寸（÷ 2.54）</span
              >
            </div>
            <span class="item-score" :class="{ zero: Hcm === null }">
              {{ Hcm ?? "—"
              }}<small v-if="Hcm"> cm（{{ Hin?.toFixed(1) }}" )</small>
            </span>
          </div>
          <div class="input-row">
            <input
              v-model="ibw_heightVal"
              type="number"
              min="100"
              max="250"
              step="0.1"
              placeholder="cm"
              class="ibw-input"
            />
            <span class="input-unit">cm</span>
          </div>
          <div class="warn-note" v-if="Hcm !== null && !heightOk">
            ⚠ 身高 &lt; 152.4 cm（5 英尺）：Devine 公式不適用，IBW
            估算可能不準確
          </div>
        </div>
        <div class="ens-item" :class="{ answered: ABW !== null }">
          <div class="item-header">
            <div class="item-meta-row"><span class="item-qnum">ABW</span></div>
            <div class="item-name-block">
              <span class="item-name">實際體重 Actual Body Weight</span>
              <span class="item-sub"
                >用於計算 %IBW 及判斷是否需要計算調整體重（ABW）</span
              >
            </div>
            <span class="item-score" :class="{ zero: ABW === null }"
              >{{ ABW ?? "—" }}<small v-if="ABW"> kg</small></span
            >
          </div>
          <div class="input-row">
            <input
              v-model="ibw_weightVal"
              type="number"
              min="20"
              max="400"
              step="0.1"
              placeholder="kg"
              class="ibw-input"
            />
            <span class="input-unit">kg</span>
          </div>
        </div>
        <!-- BMI -->
        <div class="ens-item derived-item" v-if="ibw_bmi">
          <div class="item-header">
            <div class="item-meta-row">
              <span class="item-qnum bmi-q">BMI</span>
            </div>
            <div class="item-name-block">
              <span class="item-name">身體質量指數（自動計算）</span>
              <span class="item-sub"
                >BMI = {{ ABW }} ÷ {{ (Hcm! / 100).toFixed(2) }}² =
                {{ ibw_bmi }} kg/m²</span
              >
            </div>
            <span class="item-score" style="color: #06b6d4">{{ ibw_bmi }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Results table -->
    <div class="ibw-table" v-if="ibwDevine || ibwRobinson || ibwMiller">
      <div class="it-header">IBW 各公式比較</div>
      <div class="it-row it-main">
        <span class="it-method">Devine（首選）</span>
        <span class="it-formula"
          >{{ ibw_sex === "M" ? "50" : "45.5" }} + 2.3 ×
          {{ inchesOver60?.toFixed(1) }}</span
        >
        <span class="it-result">{{ ibwDevine ?? "—" }} kg</span>
      </div>
      <div class="it-row">
        <span class="it-method">Robinson</span>
        <span class="it-formula"
          >{{ ibw_sex === "M" ? "52" : "49" }} + {{ ibw_sex === "M" ? "1.9" : "1.7" }} ×
          {{ inchesOver60?.toFixed(1) }}</span
        >
        <span class="it-result">{{ ibwRobinson ?? "—" }} kg</span>
      </div>
      <div class="it-row">
        <span class="it-method">Miller</span>
        <span class="it-formula"
          >{{ ibw_sex === "M" ? "56.2" : "53.1" }} +
          {{ ibw_sex === "M" ? "1.41" : "1.36" }} ×
          {{ inchesOver60?.toFixed(1) }}</span
        >
        <span class="it-result">{{ ibwMiller ?? "—" }} kg</span>
      </div>
      <div class="it-row it-abw" v-if="pctIBW !== null">
        <span class="it-method">%IBW</span>
        <span class="it-formula">{{ ABW }} ÷ {{ ibwDevine }} × 100</span>
        <span class="it-result" :class="isObese130 ? 'obese-text' : 'ok-text'"
          >{{ pctIBW }}%</span
        >
      </div>
      <div class="it-row it-adj" v-if="adjBW">
        <span class="it-method">ABW（調整體重）</span>
        <span class="it-formula"
          >{{ ibwDevine }} + 0.4 × ({{ ABW }} − {{ ibwDevine }})</span
        >
        <span class="it-result adj-color">{{ adjBW }} kg</span>
      </div>
    </div>

    <!-- Obese alert -->
    <div class="obese-alert" v-if="ibw_isComplete && isObese130">
      <span class="alert-icon">⚠</span>
      <span>
        <strong>實際體重超過 IBW 的 130%（{{ pctIBW }}%）：</strong>
        建議使用<strong>調整體重（ABW = {{ adjBW }} kg）</strong
        >進行藥物劑量計算（如胺基糖苷類抗生素、Vancomycin 等）。 ABW = IBW + 0.4
        × (ABW − IBW)
      </span>
    </div>

    <div class="warn-box">
      <span class="warn-icon">⚠</span>
      <span
        >Devine 公式原為 1974
        年藥物劑量計算設計，非用於美學體重管理。不適用於身高 &lt; 152.4 cm（60
        英寸）者；此情況下公式可能低估理想體重，尤其對矮個子女性。ABW
        調整僅適用於 ABW &gt; 130% IBW 的肥胖患者。</span
      >
    </div>

    <div v-if="ibw_showResults" class="results-detail">
      <div class="results-header">評估明細</div>
      <div class="detail-row">
        <span class="detail-qnum">Sex</span
        ><span class="detail-domain">性別</span
        ><span class="detail-score">{{ ibw_sex === "M" ? "♂" : "♀" }}</span
        ><span class="detail-desc">{{ ibw_sex === "M" ? "男性" : "女性" }}</span>
      </div>
      <div class="detail-row">
        <span class="detail-qnum">Ht</span
        ><span class="detail-domain">身高</span
        ><span class="detail-score">{{ Hcm ?? "—" }}</span
        ><span class="detail-desc">cm</span>
      </div>
      <div class="detail-row">
        <span class="detail-qnum">Hin</span
        ><span class="detail-domain">身高（英寸）</span
        ><span class="detail-score">{{ Hin?.toFixed(1) ?? "—" }}</span
        ><span class="detail-desc">inches</span>
      </div>
      <div class="detail-row">
        <span class="detail-qnum">ABW</span
        ><span class="detail-domain">實際體重</span
        ><span class="detail-score">{{ ABW ?? "—" }}</span
        ><span class="detail-desc">kg</span>
      </div>
      <div class="detail-row">
        <span class="detail-qnum">BMI</span
        ><span class="detail-domain">身體質量指數</span
        ><span class="detail-score">{{ ibw_bmi ?? "—" }}</span
        ><span class="detail-desc">kg/m²</span>
      </div>
      <div class="detail-row">
        <span class="detail-qnum">%IBW</span
        ><span class="detail-domain">實際體重佔 IBW %</span
        ><span class="detail-score">{{ pctIBW ?? "—" }}</span
        ><span class="detail-desc">%</span>
      </div>
      <div class="detail-row detail-total">
        <span class="detail-qnum">IBW</span>
        <span class="detail-domain">理想體重（Devine）</span>
        <span class="detail-score detail-score-brand">{{
          ibwDevine ?? "—"
        }}</span>
        <div class="detail-desc detail-desc-block">
          <span class="detail-desc-unit">kg</span>
          <span class="detail-desc-label">{{
            adjBW ? "有調整體重" : "無需調整"
          }}</span>
        </div>
      </div>
    </div>

    <div class="ens-actions">
      <button class="btn-view" @click="ibw_showResults = !ibw_showResults">
        {{ ibw_showResults ? "收起明細" : "查看評估結果" }}
      </button>
      <button class="btn-copy" :disabled="!ibw_isComplete" @click="ibw_copyOutput">
        {{ ibw_copied ? "已複製 ✓" : "複製 Markdown 結果" }}
      </button>
      <button class="btn-reset" @click="ibw_reset">重置</button>
    </div>
    <p v-if="!ibw_isComplete" class="progress-hint">請輸入身高及實際體重</p>
  </div>

  <div v-show="activeTab === 'lbw'" class="lbw">
    <div class="lbw-header">
      <div class="header-title">
        <h2 class="title">Lean Body Weight 瘦體重計算</h2>
        <p class="subtitle">
          Lean Body Weight · Hume / Boer / James 三公式比較 · 用於藥物劑量計算
        </p>
      </div>
      <div class="score-badge" :class="lbw_severity">
        <span class="badge-label">LBW (Hume)</span>
        <span class="score-number">{{ lbwHume ?? "—" }}</span>
        <span class="score-unit" :style="{ opacity: lbwHume ? 1 : 0 }">kg</span>
        <span class="score-label">{{
          fatPct !== null ? "體脂 " + fatPct + "%" : "—"
        }}</span>
      </div>
    </div>

    <!-- Sex tab -->
    <div class="nihss-group">
      <div class="group-header-bar sex-bar">
        <span class="group-icon">👤</span>
        <span class="group-label-text">性別選擇</span>
        <span class="group-sub-text">各公式係數因性別而異</span>
      </div>
      <div class="tab-toggle">
        <button
          class="tab-btn"
          :class="{ 'tab-active-m': lbw_sex === 'M' }"
          @click="lbw_sex = 'M'"
        >
          <span class="tab-title">♂ 男性（Male）</span>
          <span class="tab-sub">Hume: 0.328W + 0.339H − 29.53</span>
        </button>
        <button
          class="tab-btn"
          :class="{ 'tab-active-f': lbw_sex === 'F' }"
          @click="lbw_sex = 'F'"
        >
          <span class="tab-title">♀ 女性（Female）</span>
          <span class="tab-sub">Hume: 0.296W + 0.418H − 43.29</span>
        </button>
      </div>
    </div>

    <!-- Inputs -->
    <div class="nihss-group">
      <div class="group-header-bar input-bar">
        <span class="group-icon">📏</span>
        <span class="group-label-text">身體數值輸入</span>
        <span class="group-sub-text">W = kg · H = cm</span>
        <span
          class="group-score-tally"
          :class="lbw_sex === 'M' ? 'male-tally' : 'female-tally'"
          >{{ lbwHume ? lbwHume + " kg" : "—" }}</span
        >
      </div>
      <div class="group-items">
        <div class="ens-item" :class="{ answered: lbw_W !== null }">
          <div class="item-header">
            <div class="item-meta-row"><span class="item-qnum">Wt</span></div>
            <div class="item-name-block">
              <span class="item-name">體重 Body Weight</span>
              <span class="item-sub"
                >使用實際體重（Actual Body Weight）。Hume 與 Boer
                公式使用體重與身高；James 公式使用體重與 BMI</span
              >
            </div>
            <span class="item-score" :class="{ zero: lbw_W === null }"
              >{{ lbw_W ?? "—" }}<small v-if="lbw_W"> kg</small></span
            >
          </div>
          <div class="input-row">
            <input
              v-model="lbw_weightVal"
              type="number"
              min="20"
              max="400"
              step="0.1"
              placeholder="kg"
              class="lbw-input"
            />
            <span class="input-unit">kg</span>
          </div>
        </div>
        <div class="ens-item" :class="{ answered: lbw_H !== null }">
          <div class="item-header">
            <div class="item-meta-row"><span class="item-qnum">Ht</span></div>
            <div class="item-name-block">
              <span class="item-name">身高 Height</span>
              <span class="item-sub"
                >Hume 和 Boer 公式需要身高（公分）。James 公式僅使用體重與
                BMI</span
              >
            </div>
            <span class="item-score" :class="{ zero: lbw_H === null }"
              >{{ lbw_H ?? "—" }}<small v-if="lbw_H"> cm</small></span
            >
          </div>
          <div class="input-row">
            <input
              v-model="lbw_heightVal"
              type="number"
              min="100"
              max="250"
              step="0.1"
              placeholder="cm"
              class="lbw-input"
            />
            <span class="input-unit">cm</span>
          </div>
        </div>
        <div class="ens-item derived-item" v-if="lbw_bmi">
          <div class="item-header">
            <div class="item-meta-row">
              <span class="item-qnum bmi-q">BMI</span>
            </div>
            <div class="item-name-block">
              <span class="item-name">身體質量指數（自動計算）</span>
              <span class="item-sub"
                >BMI = {{ lbw_W }} ÷ {{ lbw_Hm?.toFixed(2) }}² =
                {{ lbw_bmi }} kg/m²　→　用於 James 公式</span
              >
            </div>
            <span class="item-score" style="color: #06b6d4">{{ lbw_bmi }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Results comparison table -->
    <div class="lbw-table" v-if="lbwHume || lbwBoer || lbwJames">
      <div class="lt-header">三公式比較結果</div>
      <div class="lt-row lt-main">
        <span class="lt-method">Hume（首選）</span>
        <span class="lt-formula"
          >{{ lbw_sex === "M" ? "0.328" : "0.296" }}×{{ lbw_W }} +
          {{ lbw_sex === "M" ? "0.339" : "0.418" }}×{{ lbw_H }} −
          {{ lbw_sex === "M" ? "29.53" : "43.29" }}</span
        >
        <span class="lt-result">{{ lbwHume ?? "—" }} kg</span>
        <span class="lt-note">臨床最廣泛使用</span>
      </div>
      <div class="lt-row">
        <span class="lt-method">Boer</span>
        <span class="lt-formula"
          >{{ lbw_sex === "M" ? "0.407" : "0.252" }}×{{ lbw_W }} +
          {{ lbw_sex === "M" ? "0.267" : "0.473" }}×{{ lbw_H }} −
          {{ lbw_sex === "M" ? "19.2" : "48.3" }}</span
        >
        <span class="lt-result">{{ lbwBoer ?? "—" }} kg</span>
        <span class="lt-note">CT 顯影劑劑量</span>
      </div>
      <div class="lt-row">
        <span class="lt-method">James</span>
        <span class="lt-formula"
          >{{ lbw_sex === "M" ? "1.10" : "1.07" }}×{{ lbw_W }} −
          {{ lbw_sex === "M" ? "0.0128" : "0.0148" }}×{{ lbw_bmi ?? "—" }}×{{ lbw_W }}</span
        >
        <span class="lt-result">{{ lbwJames ?? "—" }} kg</span>
        <span class="lt-note">藥代動力學</span>
      </div>
      <div class="lt-row lt-fat" v-if="fatPct !== null">
        <span class="lt-method">體脂率估算</span>
        <span class="lt-formula">1 − ({{ lbwHume }} ÷ {{ lbw_W }}) × 100</span>
        <span class="lt-result" :class="lbw_severity">{{ fatPct }}%</span>
        <span class="lt-note">基於 Hume LBW</span>
      </div>
    </div>

    <!-- Result card -->
    <div class="ens-result" :class="lbw_severity">
      <div class="result-left">
        <span class="result-number">{{ lbwHume ?? "—" }}</span>
        <span class="result-max" v-if="lbwHume">kg</span>
      </div>
      <div class="result-right">
        <span class="result-level">瘦體重（Hume 公式）</span>
        <span class="result-advice" v-if="lbwHume">
          Boer = {{ lbwBoer }} kg · James = {{ lbwJames }} kg
        </span>
        <span class="result-sub" v-if="fatPct !== null"
          >估算體脂率 {{ fatPct }}%（基於 Hume）</span
        >
      </div>
    </div>

    <div class="warn-box">
      <span class="warn-icon">⚠</span>
      <span
        >James 公式在 BMI &gt; 30（男性）或 &gt;
        35（女性）的肥胖患者中可能出現異常值（LBW 接近或超過
        TBW）；此情況建議改用 Boer
        公式。瘦體重估算值僅供藥物劑量計算參考，不能取代 DEXA
        等客觀測量方式。</span
      >
    </div>

    <div v-if="lbw_showResults" class="results-detail">
      <div class="results-header">評估明細</div>
      <!-- FIXED: detail-score now shows ♂/♀ symbol; detail-desc shows 男性/女性 label -->
      <div class="detail-row">
        <span class="detail-qnum">Sex</span>
        <span class="detail-domain">性別</span>
        <span class="detail-score">{{ lbw_sex === "M" ? "♂" : "♀" }}</span>
        <span class="detail-desc">{{ lbw_sex === "M" ? "男性" : "女性" }}</span>
      </div>
      <div class="detail-row">
        <span class="detail-qnum">Wt</span
        ><span class="detail-domain">體重</span
        ><span class="detail-score">{{ lbw_W ?? "—" }}</span
        ><span class="detail-desc">kg</span>
      </div>
      <div class="detail-row">
        <span class="detail-qnum">Ht</span
        ><span class="detail-domain">身高</span
        ><span class="detail-score">{{ lbw_H ?? "—" }}</span
        ><span class="detail-desc">cm</span>
      </div>
      <div class="detail-row">
        <span class="detail-qnum">BMI</span
        ><span class="detail-domain">身體質量指數</span
        ><span class="detail-score">{{ lbw_bmi ?? "—" }}</span
        ><span class="detail-desc">kg/m²</span>
      </div>
      <div class="detail-row">
        <span class="detail-qnum">Boer</span
        ><span class="detail-domain">LBW（Boer 公式）</span
        ><span class="detail-score">{{ lbwBoer ?? "—" }}</span
        ><span class="detail-desc">kg</span>
      </div>
      <div class="detail-row">
        <span class="detail-qnum">James</span
        ><span class="detail-domain">LBW（James 公式）</span
        ><span class="detail-score">{{ lbwJames ?? "—" }}</span
        ><span class="detail-desc">kg</span>
      </div>
      <div class="detail-row detail-total">
        <span class="detail-qnum">Hume</span>
        <span class="detail-domain">瘦體重（Hume — 主要結果）</span>
        <span class="detail-score detail-score-brand">{{
          lbwHume ?? "—"
        }}</span>
        <div class="detail-desc detail-desc-block">
          <span class="detail-desc-unit">kg</span>
          <span class="detail-desc-label">體脂 {{ fatPct ?? "—" }}%</span>
        </div>
      </div>
    </div>

    <div class="ens-actions">
      <button class="btn-view" @click="lbw_showResults = !lbw_showResults">
        {{ lbw_showResults ? "收起明細" : "查看評估結果" }}
      </button>
      <button class="btn-copy" :disabled="!lbw_isComplete" @click="lbw_copyOutput">
        {{ lbw_copied ? "已複製 ✓" : "複製 Markdown 結果" }}
      </button>
      <button class="btn-reset" @click="lbw_reset">重置</button>
    </div>
    <p v-if="!lbw_isComplete" class="progress-hint">請輸入體重及身高</p>
  </div>

  <div v-show="activeTab === 'sco'" class="sco">
    <div class="sco-header">
      <div class="header-title">
        <h2 class="title">Schofield 基礎代謝率</h2>
        <p class="subtitle">
          Basal Metabolic Rate · Schofield 1985 · WHO/FAO/UNU 官方標準 ·
          全年齡適用
        </p>
      </div>
      <div class="score-badge" :class="sco_severity">
        <span class="badge-label">{{
          bracket ? bracketLabels[bracket as BracketKey] : "BMR"
        }}</span>
        <span class="score-number">{{ bmr ?? "—" }}</span>
        <span class="score-unit" :style="{ opacity: bmr ? 1 : 0 }">kcal/d</span>
        <span class="score-label">TEE {{ sco_tee ?? "—" }} kcal</span>
      </div>
    </div>

    <!-- Sex tab -->
    <div class="nihss-group">
      <div class="group-header-bar sex-bar">
        <span class="group-icon">👤</span>
        <span class="group-label-text">性別選擇</span>
        <span class="group-sub-text">Schofield 公式男女各有獨立係數</span>
      </div>
      <div class="tab-toggle">
        <button
          class="tab-btn"
          :class="{ 'tab-active-m': sco_sex === 'M' }"
          @click="sco_sex = 'M'"
        >
          <span class="tab-title">♂ 男性（Male）</span>
          <span class="tab-sub"
            >3–10歲：22.706W + 504.3　10–18歲：17.686W + 658.2</span
          >
        </button>
        <button
          class="tab-btn"
          :class="{ 'tab-active-f': sco_sex === 'F' }"
          @click="sco_sex = 'F'"
        >
          <span class="tab-title">♀ 女性（Female）</span>
          <span class="tab-sub"
            >3–10歲：20.315W + 485.9　10–18歲：13.384W + 692.6</span
          >
        </button>
      </div>
    </div>

    <!-- Inputs -->
    <div class="nihss-group">
      <div class="group-header-bar input-bar">
        <span class="group-icon">📏</span>
        <span class="group-label-text">年齡與體重</span>
        <span class="group-sub-text">Schofield 方程式僅需體重（不需身高）</span>
        <span
          class="group-score-tally"
          :class="sco_sex === 'M' ? 'male-tally' : 'female-tally'"
          >{{ bmr ? bmr + " kcal" : "—" }}</span
        >
      </div>
      <div class="group-items">
        <div class="ens-item" :class="{ answered: sco_Age !== null }">
          <div class="item-header">
            <div class="item-meta-row"><span class="item-qnum">Age</span></div>
            <div class="item-name-block">
              <span class="item-name">年齡 Age</span>
              <span class="item-sub">
                Schofield 公式涵蓋全年齡（0 歲至 60
                歲以上），自動選擇對應年齡組別
                <span v-if="bracket" class="bracket-badge"
                  >→ {{ bracketLabels[bracket as BracketKey] }}</span
                >
              </span>
            </div>
            <span class="item-score" :class="{ zero: sco_Age === null }"
              >{{ sco_Age ?? "—" }}<small v-if="sco_Age"> 歲</small></span
            >
          </div>
          <div class="input-row">
            <input
              v-model="sco_ageVal"
              type="number"
              min="0"
              max="120"
              step="0.5"
              placeholder="歲"
              class="sco-input"
            />
            <span class="input-unit">歲</span>
          </div>
        </div>
        <div class="ens-item" :class="{ answered: sco_W !== null }">
          <div class="item-header">
            <div class="item-meta-row"><span class="item-qnum">Wt</span></div>
            <div class="item-name-block">
              <span class="item-name">體重 Weight</span>
              <span class="item-sub"
                >Schofield
                公式僅使用體重（kg），不需身高。嬰幼兒使用實際體重</span
              >
            </div>
            <span class="item-score" :class="{ zero: sco_W === null }"
              >{{ sco_W ?? "—" }}<small v-if="sco_W"> kg</small></span
            >
          </div>
          <div class="input-row">
            <input
              v-model="sco_weightVal"
              type="number"
              min="2"
              max="300"
              step="0.1"
              placeholder="kg"
              class="sco-input"
            />
            <span class="input-unit">kg</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Schofield reference table — FIXED: (label, bk) not (bk, label) -->
    <div class="sco-table">
      <div class="st-header">
        Schofield 方程式參考表（{{ sco_sex === "M" ? "男性" : "女性" }}）
      </div>
      <div
        v-for="(label, bk) in bracketLabels"
        :key="bk"
        class="st-row"
        :class="{ 'st-active': bracket === bk }"
      >
        <span class="st-age" :class="bracket === bk ? 'active-age' : ''">{{
          label
        }}</span>
        <span class="st-eq"
          >BMR = {{ coefs[sco_sex][bk as BracketKey][0] }}W
          {{ coefs[sco_sex][bk as BracketKey][1] >= 0 ? "+" : ""
          }}{{ coefs[sco_sex][bk as BracketKey][1] }}</span
        >
        <span class="st-result" v-if="bracket === bk && bmr"
          >{{ bmr }} kcal/d</span
        >
        <span class="st-result" v-else>—</span>
      </div>
    </div>

    <!-- PAL selector -->
    <div class="nihss-group">
      <div class="group-header-bar pal-bar">
        <span class="group-icon">🏃</span>
        <span class="group-label-text">身體活動程度（PAL）</span>
        <span class="group-sub-text">TEE = BMR × PAL</span>
        <span class="group-score-tally pal-tally">PAL = {{ pal }}</span>
      </div>
      <div class="pal-grid">
        <button
          v-for="(desc, key) in sco_palDescs"
          :key="key"
          class="pal-btn"
          :class="{ 'pal-active': sco_palLevel === key }"
          @click="sco_palLevel = key as sco_PAL"
        >
          <span class="pal-name">{{ sco_palLabels[key as sco_PAL] }}</span>
          <span class="pal-factor"
            >{{ sco_sex === "M" ? "♂" : "♀" }} PAL =
            {{ palFactors[sco_sex][key as sco_PAL] }}</span
          >
          <span class="pal-desc">{{ desc }}</span>
        </button>
      </div>
    </div>

    <!-- Formula -->
    <div class="formula-box" v-if="sco_isComplete && bmr && bracket">
      <span class="formula-label">計算過程：</span>
      <span class="formula-text">
        BMR ({{ bracketLabels[bracket as BracketKey] }}) =
        {{ coefs[sco_sex][bracket as BracketKey][0] }}×{{ sco_W }}
        {{ coefs[sco_sex][bracket as BracketKey][1] >= 0 ? "+" : ""
        }}{{ coefs[sco_sex][bracket as BracketKey][1] }} = {{ bmr }} kcal ；TEE =
        {{ bmr }} × {{ pal }} = <strong>{{ sco_tee }} kcal/day</strong>
      </span>
    </div>

    <!-- Result card -->
    <div class="ens-result" :class="sco_severity">
      <div class="result-left">
        <span class="result-number">{{ bmr ?? "—" }}</span>
        <span class="result-max" v-if="bmr">kcal/d</span>
      </div>
      <div class="result-right">
        <span class="result-level">基礎代謝率（Schofield BMR）</span>
        <span class="result-advice" v-if="sco_tee"
          >TEE = {{ bmr }} × {{ pal }} =
          <strong>{{ sco_tee }} kcal/day</strong></span
        >
        <span class="result-sub" v-if="bracket"
          >年齡組別：{{ bracketLabels[bracket as BracketKey] }}</span
        >
      </div>
    </div>

    <div class="warn-box">
      <span class="warn-icon">⚠</span>
      <span
        >Schofield 公式為 WHO/FAO/UNU
        官方推薦標準，適用於一般健康人群。以歐洲人群為主要研究對象，對於非歐裔族群（如亞洲人）可能高估
        BMR 約
        5–10%。急性疾病、大面積燒傷或代謝異常患者不適用，建議使用間接熱量測定。</span
      >
    </div>

    <div v-if="sco_showResults" class="results-detail">
      <div class="results-header">評估明細</div>
      <div class="detail-row">
        <span class="detail-qnum">Sex</span
        ><span class="detail-domain">性別</span
        ><span class="detail-score">{{ sco_sex === "M" ? "♂" : "♀" }}</span
        ><span class="detail-desc">{{ sco_sex === "M" ? "男性" : "女性" }}</span>
      </div>
      <div class="detail-row">
        <span class="detail-qnum">Age</span
        ><span class="detail-domain">年齡</span
        ><span class="detail-score">{{ sco_Age ?? "—" }}</span
        ><span class="detail-desc">歲</span>
      </div>
      <div class="detail-row">
        <span class="detail-qnum">Grp</span
        ><span class="detail-domain">年齡組別</span
        ><span class="detail-score" style="font-size: 0.7rem">{{
          bracket ? bracketLabels[bracket as BracketKey] : "—"
        }}</span
        ><span class="detail-desc">Schofield</span>
      </div>
      <div class="detail-row">
        <span class="detail-qnum">Wt</span
        ><span class="detail-domain">體重</span
        ><span class="detail-score">{{ sco_W ?? "—" }}</span
        ><span class="detail-desc">kg</span>
      </div>
      <div class="detail-row">
        <span class="detail-qnum">PAL</span
        ><span class="detail-domain">身體活動程度</span
        ><span class="detail-score">{{ pal }}</span
        ><span class="detail-desc">{{ sco_palLevel }}</span>
      </div>
      <div class="detail-row">
        <span class="detail-qnum">TEE</span
        ><span class="detail-domain">每日總能量消耗</span
        ><span class="detail-score">{{ sco_tee ?? "—" }}</span
        ><span class="detail-desc">kcal/d</span>
      </div>
      <div class="detail-row detail-total">
        <span class="detail-qnum">BMR</span>
        <span class="detail-domain">基礎代謝率（最終結果）</span>
        <span class="detail-score detail-score-brand">{{ bmr ?? "—" }}</span>
        <div class="detail-desc detail-desc-block">
          <span class="detail-desc-unit">kcal/d</span>
          <span class="detail-desc-label">Schofield</span>
        </div>
      </div>
    </div>

    <div class="ens-actions">
      <button class="btn-view" @click="sco_showResults = !sco_showResults">
        {{ sco_showResults ? "收起明細" : "查看評估結果" }}
      </button>
      <button class="btn-copy" :disabled="!sco_isComplete" @click="sco_copyOutput">
        {{ sco_copied ? "已複製 ✓" : "複製 Markdown 結果" }}
      </button>
      <button class="btn-reset" @click="sco_reset">重置</button>
    </div>
    <p v-if="!sco_isComplete" class="progress-hint">請輸入年齡及體重</p>
  </div>
  </div>
</template>

<style scoped>
.metabolism {
  max-width: 820px;
  margin: 0 auto;
}

/* Wrapper tab bar — single row with horizontal scroll; scoped with `>` so
   these rules never leak into the tools' internal tab bars */
.metabolism > .tab-bar {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
  background: var(--vp-c-bg-mute);
  padding: 4px;
  border-radius: 10px;
  border: 1px solid var(--vp-c-divider);
  flex-wrap: nowrap;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: thin;
  scrollbar-color: var(--vp-c-text-3) transparent;
  cursor: grab;
  user-select: none;
}
.metabolism > .tab-bar:active {
  cursor: grabbing;
}
.metabolism > .tab-bar::-webkit-scrollbar {
  height: 10px;
}
.metabolism > .tab-bar::-webkit-scrollbar-thumb {
  background: var(--vp-c-text-3);
  border-radius: 5px;
  border: 2px solid var(--vp-c-bg-mute);
}
.metabolism > .tab-bar::-webkit-scrollbar-thumb:hover {
  background: var(--vp-c-text-2);
}
.metabolism > .tab-bar::-webkit-scrollbar-track {
  background: transparent;
}

.metabolism > .tab-bar .tab-btn {
  flex: 0 0 auto;
  min-width: 128px;
  white-space: nowrap;
  padding: 0.65rem 1rem;
  background: transparent;
  border: 1.5px solid transparent;
  cursor: pointer;
  font-family: inherit;
  color: var(--vp-c-text-3);
  border-radius: 8px;
  transition: all 0.2s;
}
.metabolism > .tab-bar .tab-btn:hover {
  color: var(--vp-c-text-1);
  border-color: var(--vp-c-divider);
}
.metabolism > .tab-bar .tab-btn.active {
  color: var(--vp-c-brand-1);
  background: color-mix(in srgb, var(--vp-c-brand-1) 12%, transparent);
  border-color: color-mix(in srgb, var(--vp-c-brand-1) 35%, transparent);
  box-shadow: 0 0 0 1px color-mix(in srgb, var(--vp-c-brand-1) 8%, transparent);
}

.metabolism > .tab-bar .tab-label {
  display: block;
  font-size: 1rem;
  font-weight: 800;
  line-height: 1.3;
  letter-spacing: 0.02em;
}

.metabolism > .tab-bar .tab-sub {
  display: block;
  font-size: 0.78rem;
  font-weight: 600;
  color: var(--vp-c-text-3);
  margin-top: 2px;
  letter-spacing: 0.01em;
}

.metabolism > .tab-bar .tab-btn.active .tab-sub {
  color: var(--vp-c-brand-1);
  opacity: 0.7;
}

@media (max-width: 640px) {
  .metabolism > .tab-bar .tab-btn {
    padding: 0.5rem 0.65rem;
    min-width: 112px;
  }
  .metabolism > .tab-bar .tab-label {
    font-size: 0.9rem;
  }
  .metabolism > .tab-bar .tab-sub {
    font-size: 0.72rem;
  }
}

/* ══════════════ BEE 基礎能量消耗（Harris-Benedict）══════════════ */

.bee {
  max-width: 780px;
  margin: 0 auto;
  padding: 2rem 0 3rem;
  font-size: 0.9rem;
}
.bee .bee-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 1.25rem;
  flex-wrap: nowrap;
}
.bee .header-title {
  flex: 1;
  min-width: 0;
}
.bee .title {
  font-size: 24px;
  font-weight: 600;
  color: var(--vp-c-text-1);
  margin: 0 0 0.2rem;
  border: none !important;
  padding: 0 !important;
}
.bee .subtitle {
  font-size: 0.75rem;
  color: var(--vp-c-text-3);
  margin: 0;
  line-height: 1.6;
}
.bee .score-badge {
  display: flex;
  flex-shrink: 0;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-width: 90px;
  min-height: 88px;
  padding: 0.6rem 1rem;
  border-radius: 12px;
  border: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg-soft);
  transition: all 0.3s;
}
.bee .badge-label {
  font-size: 0.65rem;
  font-weight: 700;
  color: var(--vp-c-text-3);
}
.bee .score-number {
  font-size: 1.7rem;
  font-weight: 800;
  line-height: 1;
}
.bee .score-unit {
  font-size: 0.62rem;
  font-weight: 600;
  margin-top: 1px;
}
.bee .score-label {
  font-size: 0.62rem;
  font-weight: 600;
  margin-top: 2px;
}
.bee .score-badge.pending {
  color: var(--vp-c-text-3);
}
.bee .score-badge.normal {
  border-color: #f59e0b;
  color: #f59e0b;
}
.bee .score-badge.mild {
  border-color: #3b82f6;
  color: #3b82f6;
}
.bee .score-badge.moderate {
  border-color: #22c55e;
  color: #22c55e;
}
.bee .nihss-group {
  margin-bottom: 1.5rem;
}
.bee .group-header-bar {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.55rem 0.85rem;
  border-radius: 8px;
  background: var(--vp-c-bg-mute);
  border: 1px solid var(--vp-c-divider);
  border-left: 3px solid #a855f7;
  margin-bottom: 0.6rem;
}
.bee .sex-bar {
  border-left: 3px solid #6366f1;
}
.bee .input-bar {
  border-left: 3px solid #f59e0b;
}
.bee .act-bar {
  border-left: 3px solid #22c55e;
}
.bee .group-icon {
  font-size: 1rem;
  flex-shrink: 0;
}
.bee .group-label-text {
  font-size: 0.88rem;
  font-weight: 800;
  color: var(--vp-c-text-1);
}
.bee .group-sub-text {
  font-size: 0.7rem;
  color: var(--vp-c-text-3);
  flex: 1;
}
.bee .group-score-tally {
  font-size: 0.75rem;
  font-weight: 700;
  padding: 2px 8px;
  border-radius: 999px;
  flex-shrink: 0;
}
.bee .male-tally {
  color: #38bdf8;
  background: rgba(56, 189, 248, 0.12);
}
.bee .female-tally {
  color: #f472b6;
  background: rgba(244, 114, 182, 0.12);
}
.bee .act-tally {
  color: #22c55e;
  background: rgba(34, 197, 94, 0.12);
}
.bee .tab-toggle {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}
.bee .tab-btn {
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
.bee .tab-btn.tab-active {
  border-color: #6366f1;
  background: rgba(99, 102, 241, 0.06);
}
.bee .tab-btn.tab-active-m {
  border-color: #38bdf8;
  background: rgba(56, 189, 248, 0.06);
}
.bee .tab-btn.tab-active-f {
  border-color: #f472b6;
  background: rgba(244, 114, 182, 0.06);
}
.bee .tab-title {
  font-size: 0.9rem;
  font-weight: 700;
  color: var(--vp-c-text-1);
}
.bee .tab-sub {
  font-size: 0.62rem;
  color: var(--vp-c-text-3);
  font-family: monospace;
}
.bee .tab-btn.tab-active .tab-title {
  color: #6366f1;
}
.bee .group-items {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
.bee .ens-item {
  border: 1px solid var(--vp-c-divider);
  border-radius: 10px;
  background: var(--vp-c-bg-soft);
  overflow: hidden;
  transition: border-color 0.2s;
}
.bee .ens-item.answered {
  border-color: #f59e0b;
}
.bee .item-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  padding: 0.6rem 0.9rem;
  background: var(--vp-c-bg-mute);
  border-bottom: 1px solid var(--vp-c-divider);
  gap: 0.75rem;
}
.bee .item-meta-row {
  display: flex;
  align-items: center;
  flex-shrink: 0;
  padding-top: 3px;
}
.bee .item-qnum {
  font-size: 0.68rem;
  font-weight: 800;
  color: #f59e0b;
  background: rgba(245, 158, 11, 0.12);
  padding: 1px 6px;
  border-radius: 999px;
}
.bee .item-name-block {
  display: flex;
  flex-direction: column;
  gap: 2px;
  flex: 1;
}
.bee .item-name {
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--vp-c-text-1);
}
.bee .item-sub {
  font-size: 0.72rem;
  color: var(--vp-c-text-3);
}
.bee .item-score {
  font-size: 0.9rem;
  font-weight: 800;
  color: #f59e0b;
  min-width: 28px;
  text-align: right;
  white-space: normal;
}
.bee .item-score.zero {
  color: var(--vp-c-text-3);
}
.bee .input-row {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.65rem 0.9rem;
}
.bee .bee-input {
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
.bee .bee-input::-webkit-outer-spin-button,
.bee .bee-input::-webkit-inner-spin-button {
  -webkit-appearance: none;
}
.bee .bee-input:focus {
  border-color: #f59e0b;
}
.bee .bee-input::placeholder {
  color: var(--vp-c-text-3);
  font-size: 0.82rem;
}
.bee .input-unit {
  font-size: 0.78rem;
  font-weight: 600;
  color: var(--vp-c-text-3);
  flex-shrink: 0;
}
.bee .af-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.5rem;
}
.bee .af-btn {
  display: flex;
  flex-direction: column;
  gap: 3px;
  padding: 0.65rem 0.85rem;
  border-radius: 10px;
  border: 1.5px solid var(--vp-c-divider);
  background: var(--vp-c-bg-soft);
  cursor: pointer;
  font-family: inherit;
  text-align: left;
  transition: all 0.18s;
}
.bee .af-btn.af-active {
  border-color: #22c55e;
  background: rgba(34, 197, 94, 0.06);
}
.bee .af-name {
  font-size: 0.8rem;
  font-weight: 700;
  color: var(--vp-c-text-1);
}
.bee .af-factor {
  font-size: 0.72rem;
  font-weight: 700;
  color: #22c55e;
  font-family: monospace;
}
.bee .af-desc {
  font-size: 0.67rem;
  color: var(--vp-c-text-3);
}
.bee .af-btn.af-active .af-name {
  color: #22c55e;
}
.bee .formula-box {
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
.bee .formula-label {
  font-weight: 700;
  color: var(--vp-c-text-2);
  flex-shrink: 0;
}
.bee .formula-text {
  color: var(--vp-c-text-2);
  font-family: monospace;
  line-height: 1.7;
}
.bee .ens-result {
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
.bee .ens-result.normal {
  border-color: #f59e0b;
}
.bee .ens-result.mild {
  border-color: #3b82f6;
}
.bee .ens-result.moderate {
  border-color: #22c55e;
}
.bee .result-left {
  display: flex;
  align-items: baseline;
  gap: 4px;
  flex-shrink: 0;
}
.bee .result-number {
  font-size: 3.2rem;
  font-weight: 800;
  line-height: 1;
  color: var(--vp-c-text-3);
  transition: color 0.3s;
}
.bee .ens-result.normal .result-number {
  color: #f59e0b;
}
.bee .ens-result.mild .result-number {
  color: #3b82f6;
}
.bee .ens-result.moderate .result-number {
  color: #22c55e;
}
.bee .result-max {
  font-size: 1rem;
  color: var(--vp-c-text-3);
}
.bee .result-right {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.bee .result-level {
  font-size: 1rem;
  font-weight: 700;
  color: var(--vp-c-text-1);
}
.bee .result-advice {
  font-size: 0.85rem;
  color: var(--vp-c-text-2);
  line-height: 1.5;
}
.bee .result-sub {
  font-size: 0.78rem;
  color: var(--vp-c-brand-1);
}
.bee .tee-table {
  border: 1px solid var(--vp-c-divider);
  border-radius: 10px;
  overflow: hidden;
  margin-bottom: 1rem;
}
.bee .tt-header {
  padding: 0.4rem 0.9rem;
  font-size: 0.7rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--vp-c-text-3);
  background: var(--vp-c-bg-mute);
  border-bottom: 1px solid var(--vp-c-divider);
}
.bee .tt-row {
  display: grid;
  grid-template-columns: 1fr 60px 100px;
  gap: 0.5rem;
  padding: 0.42rem 0.9rem;
  border-bottom: 1px solid var(--vp-c-divider);
  font-size: 0.78rem;
  align-items: center;
}
.bee .tt-row:last-child {
  border-bottom: none;
}
.bee .tt-active {
  background: var(--vp-c-brand-soft);
}
.bee .tt-level {
  color: var(--vp-c-text-1);
  font-weight: 600;
}
.bee .tt-af {
  font-family: monospace;
  font-size: 0.75rem;
  color: var(--vp-c-text-3);
}
.bee .tt-val {
  font-weight: 800;
  color: var(--vp-c-brand-1);
  text-align: right;
}
.bee .warn-box {
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
.bee .warn-icon {
  color: #f97316;
  flex-shrink: 0;
}
.bee .results-detail {
  border: 1px solid var(--vp-c-divider);
  border-radius: 10px;
  overflow: hidden;
  margin-bottom: 1rem;
}
.bee .results-header {
  padding: 0.5rem 0.9rem;
  font-size: 0.72rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--vp-c-text-3);
  background: var(--vp-c-bg-mute);
  border-bottom: 1px solid var(--vp-c-divider);
}
.bee .detail-row {
  display: flex;
  align-items: flex-start;
  gap: 0.6rem;
  padding: 0.5rem 0.9rem;
  border-bottom: 1px solid var(--vp-c-divider);
}
.bee .detail-row:last-child {
  border-bottom: none;
}
.bee .detail-total {
  background: var(--vp-c-bg-mute);
}
.bee .detail-qnum {
  font-size: 0.7rem;
  font-weight: 800;
  color: #f59e0b;
  flex-shrink: 0;
  width: 44px;
  padding-top: 1px;
}
.bee .detail-domain {
  font-size: 0.78rem;
  font-weight: 700;
  color: var(--vp-c-text-1);
  flex: 1;
  line-height: 1.5;
}
.bee .detail-score {
  font-size: 0.82rem;
  font-weight: 800;
  color: var(--vp-c-brand-1);
  flex-shrink: 0;
  width: 52px;
  text-align: right;
  white-space: normal;
}
.bee .detail-score-brand {
  color: var(--vp-c-brand-1);
}
.bee .detail-desc {
  font-size: 0.75rem;
  color: var(--vp-c-text-2);
  flex-shrink: 0;
  width: 120px;
  text-align: left;
  white-space: normal;
}
.bee .detail-desc-block {
  display: flex;
  flex-direction: column;
  gap: 1px;
  width: 120px;
  flex-shrink: 0;
}
.bee .detail-desc-unit {
  font-size: 0.75rem;
  color: var(--vp-c-text-2);
}
.bee .detail-desc-label {
  font-size: 0.73rem;
  font-weight: 700;
  color: var(--vp-c-brand-1);
  white-space: normal;
}
/* ── Actions ───────────────────────────────────────────────────── */
.bee .ens-actions {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
}
.bee .btn-view,
.bee .btn-copy,
.bee .btn-reset {
  padding: 9px 22px;
  border-radius: 8px;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  font-family: inherit;
  transition: all 0.2s;
}
.bee .btn-view {
  border: none;
  background: linear-gradient(135deg, var(--vp-c-brand-1), #4f46e5);
  color: #fff;
  box-shadow: 0 2px 8px rgba(99, 102, 241, 0.3);
}
.bee .btn-view:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 14px rgba(99, 102, 241, 0.4);
}
.bee .btn-view:active:not(:disabled) {
  transform: translateY(0);
}
.bee .btn-view:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}
.bee .btn-copy {
  border: 1.5px solid var(--vp-c-brand-1);
  background: transparent;
  color: var(--vp-c-brand-1);
}
.bee .btn-copy:hover:not(:disabled) {
  background: var(--vp-c-brand-soft);
}
.bee .btn-copy:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}
.bee .btn-reset {
  border: 1px solid var(--vp-c-divider);
  background: transparent;
  color: var(--vp-c-text-2);
}
.bee .btn-reset:hover {
  border-color: #ef4444;
  color: #ef4444;
  background: rgba(239, 68, 68, 0.04);
}
.bee .progress-hint {
  font-size: 0.75rem;
  color: var(--vp-c-text-3);
  margin: 0.4rem 0 0;
}
@media (max-width: 640px) {
.bee .bee-header {
    flex-direction: column;
  }
.bee .tab-toggle,
.bee .af-grid {
    flex-direction: column;
  }
.bee .ens-result {
    flex-direction: column;
    gap: 0.75rem;
  }
.bee .tt-row {
    grid-template-columns: 1fr 50px 90px;
  }
}
/* ══════════════ BSA 體表面積（Body Surface Area）══════════════ */

.bsa {
  max-width: 780px;
  margin: 0 auto;
  padding: 2rem 0 3rem;
  font-size: 0.9rem;
}
.bsa .bsa-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 1.25rem;
  flex-wrap: nowrap;
}
.bsa .header-title {
  flex: 1;
  min-width: 0;
}
.bsa .title {
  font-size: 24px;
  font-weight: 600;
  color: var(--vp-c-text-1);
  margin: 0 0 0.2rem;
  border: none !important;
  padding: 0 !important;
}
.bsa .subtitle {
  font-size: 0.75rem;
  color: var(--vp-c-text-3);
  margin: 0;
  line-height: 1.6;
}
.bsa .score-badge {
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
.bsa .badge-label {
  font-size: 0.65rem;
  font-weight: 700;
}
.bsa .score-number {
  font-size: 1.9rem;
  font-weight: 800;
  line-height: 1;
}
.bsa .score-unit {
  font-size: 0.65rem;
  font-weight: 600;
  margin-top: 1px;
}
.bsa .score-label {
  font-size: 0.65rem;
  font-weight: 600;
  margin-top: 2px;
}
.bsa .score-badge.pending {
  color: var(--vp-c-text-3);
  border-color: var(--vp-c-divider);
}
.bsa .nihss-group {
  margin-bottom: 1.5rem;
}
.bsa .group-header-bar {
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
.bsa .input-bar {
  border-left: 3px solid #3b82f6;
}
.bsa .method-bar {
  border-left: 3px solid #8b5cf6;
}
.bsa .group-icon {
  font-size: 1rem;
  flex-shrink: 0;
}
.bsa .group-label-text {
  font-size: 0.88rem;
  font-weight: 800;
  color: var(--vp-c-text-1);
}
.bsa .group-sub-text {
  font-size: 0.7rem;
  color: var(--vp-c-text-3);
  flex: 1;
}
.bsa .group-score-tally {
  font-size: 0.72rem;
  font-weight: 700;
  padding: 2px 8px;
  border-radius: 999px;
  flex-shrink: 0;
}
.bsa .bsa-tally {
  color: #3b82f6;
  background: rgba(59, 130, 246, 0.12);
}
.bsa .method-tally {
  color: #8b5cf6;
  background: rgba(139, 92, 246, 0.12);
  max-width: 140px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.bsa .group-items {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
.bsa .ens-item {
  border: 1px solid var(--vp-c-divider);
  border-radius: 10px;
  background: var(--vp-c-bg-soft);
  overflow: hidden;
  transition: border-color 0.2s;
}
.bsa .ens-item.answered {
  border-color: #3b82f6;
}
.bsa .ens-item.derived-item {
  border-color: #06b6d4;
  opacity: 0.85;
}
.bsa .item-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  padding: 0.6rem 0.9rem;
  background: var(--vp-c-bg-mute);
  border-bottom: 1px solid var(--vp-c-divider);
  gap: 0.75rem;
}
.bsa .derived-item .item-header {
  border-bottom: none;
}
.bsa .item-meta-row {
  display: flex;
  align-items: center;
  flex-shrink: 0;
  padding-top: 3px;
}
.bsa .item-qnum {
  font-size: 0.68rem;
  font-weight: 800;
  color: #3b82f6;
  background: rgba(59, 130, 246, 0.12);
  padding: 1px 6px;
  border-radius: 999px;
}
.bsa .bmi-q {
  color: #06b6d4;
  background: rgba(6, 182, 212, 0.12);
}
.bsa .item-name-block {
  display: flex;
  flex-direction: column;
  gap: 2px;
  flex: 1;
}
.bsa .item-name {
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--vp-c-text-1);
}
.bsa .item-sub {
  font-size: 0.72rem;
  color: var(--vp-c-text-3);
}
.bsa .item-score {
  font-size: 0.9rem;
  font-weight: 800;
  color: #3b82f6;
  min-width: 28px;
  text-align: right;
  white-space: nowrap;
}
.bsa .item-score.zero {
  color: var(--vp-c-text-3);
}
.bsa .input-row {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.65rem 0.9rem;
}
.bsa .bsa-input {
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
.bsa .bsa-input::-webkit-outer-spin-button,
.bsa .bsa-input::-webkit-inner-spin-button {
  -webkit-appearance: none;
}
.bsa .bsa-input:focus {
  border-color: #3b82f6;
}
.bsa .bsa-input::placeholder {
  color: var(--vp-c-text-3);
  font-size: 0.82rem;
}
.bsa .input-unit {
  font-size: 0.78rem;
  font-weight: 600;
  color: var(--vp-c-text-3);
  flex-shrink: 0;
}
.bsa .method-grid {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
.bsa .method-btn {
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
.bsa .method-btn.method-active {
  border-color: var(--btn-color, var(--vp-c-brand-1));
  background: rgba(99, 102, 241, 0.05);
}
.bsa .mb-name {
  font-size: 0.82rem;
  font-weight: 700;
  color: var(--vp-c-text-1);
  flex-shrink: 0;
  width: 140px;
}
.bsa .mb-formula {
  font-size: 0.68rem;
  font-family: monospace;
  color: var(--vp-c-text-3);
  flex: 1;
}
.bsa .mb-note {
  font-size: 0.68rem;
  color: var(--vp-c-text-3);
  flex-shrink: 0;
  width: 140px;
  text-align: right;
  display: none;
}
.bsa .mb-result {
  font-size: 0.82rem;
  font-weight: 800;
  color: var(--vp-c-brand-1);
  flex-shrink: 0;
  min-width: 70px;
  text-align: right;
}
.bsa .method-btn.method-active .mb-name {
  color: var(--btn-color, var(--vp-c-brand-1));
}
.bsa .bsa-table {
  border: 1px solid var(--vp-c-divider);
  border-radius: 10px;
  overflow: hidden;
  margin-bottom: 1rem;
}
.bsa .bt-header {
  padding: 0.4rem 0.9rem;
  font-size: 0.7rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--vp-c-text-3);
  background: var(--vp-c-bg-mute);
  border-bottom: 1px solid var(--vp-c-divider);
}
.bsa .bt-row {
  display: grid;
  grid-template-columns: 160px 1fr 80px;
  gap: 0.5rem;
  padding: 0.42rem 0.9rem;
  border-bottom: 1px solid var(--vp-c-divider);
  font-size: 0.78rem;
  align-items: center;
}
.bsa .bt-row:last-child {
  border-bottom: none;
}
.bsa .bt-active {
  background: var(--vp-c-brand-soft);
}
.bsa .bt-name {
  font-weight: 700;
}
.bsa .bt-formula {
  font-family: monospace;
  font-size: 0.68rem;
  color: var(--vp-c-text-3);
}
.bsa .bt-result {
  font-weight: 800;
  color: var(--vp-c-text-2);
  text-align: right;
}
.bsa .bt-primary {
  color: var(--vp-c-brand-1);
}
.bsa .formula-box {
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
.bsa .formula-label {
  font-weight: 700;
  color: var(--vp-c-text-2);
  flex-shrink: 0;
}
.bsa .formula-text {
  color: var(--vp-c-text-2);
  font-family: monospace;
  line-height: 1.7;
}
.bsa .ens-result {
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
.bsa .ens-result.normal {
  border-color: #3b82f6;
}
.bsa .ens-result.mild {
  border-color: #f59e0b;
}
.bsa .ens-result.moderate {
  border-color: #22c55e;
}
.bsa .result-left {
  display: flex;
  align-items: baseline;
  gap: 4px;
  flex-shrink: 0;
}
.bsa .result-number {
  font-size: 3.2rem;
  font-weight: 800;
  line-height: 1;
  color: var(--vp-c-text-3);
  transition: color 0.3s;
}
.bsa .ens-result.normal .result-number {
  color: #3b82f6;
}
.bsa .ens-result.mild .result-number {
  color: #f59e0b;
}
.bsa .ens-result.moderate .result-number {
  color: #22c55e;
}
.bsa .result-max {
  font-size: 1rem;
  color: var(--vp-c-text-3);
}
.bsa .result-right {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.bsa .result-level {
  font-size: 1rem;
  font-weight: 700;
  color: var(--vp-c-text-1);
}
.bsa .result-advice {
  font-size: 0.85rem;
  color: var(--vp-c-text-2);
}
.bsa .result-sub {
  font-size: 0.78rem;
  color: var(--vp-c-brand-1);
}
.bsa .warn-box {
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
.bsa .warn-icon {
  color: #f97316;
  flex-shrink: 0;
}
.bsa .results-detail {
  border: 1px solid var(--vp-c-divider);
  border-radius: 10px;
  overflow: hidden;
  margin-bottom: 1rem;
}
.bsa .results-header {
  padding: 0.5rem 0.9rem;
  font-size: 0.72rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--vp-c-text-3);
  background: var(--vp-c-bg-mute);
  border-bottom: 1px solid var(--vp-c-divider);
}
.bsa .detail-row {
  display: flex;
  align-items: flex-start;
  gap: 0.6rem;
  padding: 0.5rem 0.9rem;
  border-bottom: 1px solid var(--vp-c-divider);
}
.bsa .detail-row:last-child {
  border-bottom: none;
}
.bsa .detail-total {
  background: var(--vp-c-bg-mute);
}
.bsa .detail-qnum {
  font-size: 0.7rem;
  font-weight: 800;
  color: #3b82f6;
  flex-shrink: 0;
  width: 44px;
  padding-top: 1px;
}
.bsa .detail-domain {
  font-size: 0.78rem;
  font-weight: 700;
  color: var(--vp-c-text-1);
  flex: 1;
  line-height: 1.5;
}
.bsa .detail-score {
  font-size: 0.82rem;
  font-weight: 800;
  color: var(--vp-c-brand-1);
  flex-shrink: 0;
  width: 52px;
  text-align: right;
  white-space: nowrap;
}
.bsa .detail-score-brand {
  color: var(--vp-c-brand-1);
}
.bsa .detail-desc {
  font-size: 0.75rem;
  color: var(--vp-c-text-2);
  flex-shrink: 0;
  width: 80px;
  text-align: left;
  white-space: nowrap;
}
.bsa .detail-desc-block {
  display: flex;
  flex-direction: column;
  gap: 1px;
  width: 80px;
  flex-shrink: 0;
}
.bsa .detail-desc-unit {
  font-size: 0.75rem;
  color: var(--vp-c-text-2);
}
.bsa .detail-desc-label {
  font-size: 0.73rem;
  font-weight: 700;
  color: var(--vp-c-brand-1);
  white-space: normal;
}
/* ── Actions ───────────────────────────────────────────────────── */
.bsa .ens-actions {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
}
.bsa .btn-view,
.bsa .btn-copy,
.bsa .btn-reset {
  padding: 9px 22px;
  border-radius: 8px;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  font-family: inherit;
  transition: all 0.2s;
}
.bsa .btn-view {
  border: none;
  background: linear-gradient(135deg, var(--vp-c-brand-1), #4f46e5);
  color: #fff;
  box-shadow: 0 2px 8px rgba(99, 102, 241, 0.3);
}
.bsa .btn-view:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 14px rgba(99, 102, 241, 0.4);
}
.bsa .btn-view:active:not(:disabled) {
  transform: translateY(0);
}
.bsa .btn-view:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}
.bsa .btn-copy {
  border: 1.5px solid var(--vp-c-brand-1);
  background: transparent;
  color: var(--vp-c-brand-1);
}
.bsa .btn-copy:hover:not(:disabled) {
  background: var(--vp-c-brand-soft);
}
.bsa .btn-copy:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}
.bsa .btn-reset {
  border: 1px solid var(--vp-c-divider);
  background: transparent;
  color: var(--vp-c-text-2);
}
.bsa .btn-reset:hover {
  border-color: #ef4444;
  color: #ef4444;
  background: rgba(239, 68, 68, 0.04);
}
.bsa .progress-hint {
  font-size: 0.75rem;
  color: var(--vp-c-text-3);
  margin: 0.4rem 0 0;
}
@media (max-width: 640px) {
.bsa .bsa-header {
    flex-direction: column;
  }
.bsa .ens-result {
    flex-direction: column;
    gap: 0.75rem;
  }
.bsa .bt-row {
    grid-template-columns: 120px 1fr 70px;
  }
.bsa .method-btn {
    flex-direction: column;
    align-items: flex-start;
  }
.bsa .mb-name {
    width: auto;
  }
.bsa .mb-result {
    text-align: left;
  }
}
/* ══════════════ 每日熱量參考表（Calorie Requirements）══════════════ */

.crt {
  max-width: 780px;
  margin: 0 auto;
  padding: 2rem 0 3rem;
  font-size: 0.9rem;
}
/* ── Header ────────────────────────────────────────────────────── */
.crt .crt-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 1.25rem;
  flex-wrap: nowrap; /* ✦ never wrap — badge always stays right */
}
.crt .header-title {
  flex: 1;
  min-width: 0; /* ✦ allows text to shrink/wrap inside flex */
}
.crt .title {
  font-size: 24px;
  font-weight: 600;
  color: var(--vp-c-text-1);
  margin: 0 0 0.2rem;
  border: none !important;
  padding: 0 !important;
}
.crt .subtitle {
  font-size: 0.75rem;
  color: var(--vp-c-text-3);
  margin: 0;
  line-height: 1.6;
  white-space: normal; /* ✦ allow natural wrapping */
}
.crt .subtitle-2 {
  margin-top: 1px;
}
/* ── Score badge ─────────────────────────────────────────────────── */
.crt .score-badge {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-width: 90px;
  flex-shrink: 0;
  min-height: 88px; /* ✦ badge never shrinks */
  padding: 0.6rem 1rem;
  border-radius: 12px;
  border: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg-soft);
  transition: all 0.3s;
}
.crt .badge-sex {
  font-size: 0.65rem;
  font-weight: 700;
  color: var(--vp-c-text-3);
}
.crt .score-number {
  font-size: 1.8rem;
  font-weight: 800;
  line-height: 1;
}
.crt .score-unit {
  font-size: 0.65rem;
  font-weight: 600;
  margin-top: 1px;
}
.crt .score-label {
  font-size: 0.65rem;
  font-weight: 600;
  margin-top: 2px;
}
.crt .score-badge.pending {
  color: var(--vp-c-text-3);
}
.crt .score-badge.badge-male {
  border-color: #38bdf8;
  color: #38bdf8;
}
.crt .score-badge.badge-female {
  border-color: #f472b6;
  color: #f472b6;
}
/* ── Groups ────────────────────────────────────────────────────── */
.crt .nihss-group {
  margin-bottom: 1.5rem;
}
.crt .group-header-bar {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.55rem 0.85rem;
  border-radius: 8px;
  background: var(--vp-c-bg-mute);
  border: 1px solid var(--vp-c-divider);
  border-left: 3px solid #8b5cf6;
  margin-bottom: 0.6rem;
}
.crt .sex-bar {
  border-left: 3px solid #6366f1;
}
.crt .act-bar {
  border-left: 3px solid #22c55e;
}
.crt .age-bar {
  border-left: 3px solid #f59e0b;
}
.crt .table-bar {
  border-left: 3px solid #06b6d4;
}
.crt .group-icon {
  font-size: 1rem;
  flex-shrink: 0;
}
.crt .group-label-text {
  font-size: 0.88rem;
  font-weight: 800;
  color: var(--vp-c-text-1);
}
.crt .group-sub-text {
  font-size: 0.7rem;
  color: var(--vp-c-text-3);
  flex: 1;
}
.crt .group-score-tally {
  font-size: 0.72rem;
  font-weight: 700;
  padding: 2px 8px;
  border-radius: 999px;
  flex-shrink: 0;
}
.crt .act-tally {
  color: #22c55e;
  background: rgba(34, 197, 94, 0.12);
}
.crt .age-tally {
  color: #f59e0b;
  background: rgba(245, 158, 11, 0.12);
}
/* ── Sex tab toggle ────────────────────────────────────────────── */
.crt .tab-toggle {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}
.crt .tab-btn {
  flex: 1;
  min-width: 140px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 3px;
  padding: 0.7rem 1rem;
  border-radius: 10px;
  border: 1.5px solid var(--vp-c-divider);
  background: var(--vp-c-bg-soft);
  cursor: pointer;
  font-family: inherit;
  transition: all 0.18s;
}
.crt .tab-btn.tab-active-m {
  border-color: #38bdf8;
  background: rgba(56, 189, 248, 0.06);
}
.crt .tab-btn.tab-active-f {
  border-color: #f472b6;
  background: rgba(244, 114, 182, 0.06);
}
.crt .tab-title {
  font-size: 0.9rem;
  font-weight: 700;
  color: var(--vp-c-text-1);
}
.crt .tab-sub {
  font-size: 0.68rem;
  color: var(--vp-c-text-3);
}
.crt .tab-btn.tab-active-m .tab-title {
  color: #38bdf8;
}
.crt .tab-btn.tab-active-f .tab-title {
  color: #f472b6;
}
/* ── PAL grid ──────────────────────────────────────────────────── */
.crt .pal-grid {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 0.5rem;
}
.crt .pal-btn {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 0.7rem 0.85rem;
  border-radius: 10px;
  border: 1.5px solid var(--vp-c-divider);
  background: var(--vp-c-bg-soft);
  cursor: pointer;
  font-family: inherit;
  text-align: left;
  transition: all 0.18s;
}
.crt .pal-btn.pal-active {
  border-color: #22c55e;
  background: rgba(34, 197, 94, 0.06);
}
.crt .pal-name {
  font-size: 0.78rem;
  font-weight: 700;
  color: var(--vp-c-text-1);
}
.crt .pal-desc {
  font-size: 0.67rem;
  color: var(--vp-c-text-3);
  line-height: 1.4;
}
.crt .pal-btn.pal-active .pal-name {
  color: #22c55e;
}
/* ── Age grid ──────────────────────────────────────────────────── */
.crt .age-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 0.4rem;
}
.crt .age-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  padding: 0.6rem 0.4rem;
  border-radius: 9px;
  border: 1.5px solid var(--vp-c-divider);
  background: var(--vp-c-bg-soft);
  cursor: pointer;
  font-family: inherit;
  transition: all 0.15s;
}
.crt .age-btn:hover {
  border-color: var(--vp-c-brand-1);
}
.crt .age-btn.age-active {
  border-color: #f59e0b;
  background: rgba(245, 158, 11, 0.07);
}
.crt .age-btn.age-male {
  border-color: #38bdf8;
  background: rgba(56, 189, 248, 0.07);
}
.crt .age-btn.age-female {
  border-color: #f472b6;
  background: rgba(244, 114, 182, 0.07);
}
.crt .age-label {
  font-size: 0.72rem;
  font-weight: 700;
  color: var(--vp-c-text-1);
}
.crt .age-val {
  font-size: 0.95rem;
  font-weight: 800;
  color: var(--vp-c-brand-1);
  line-height: 1;
}
.crt .age-unit {
  font-size: 0.6rem;
  color: var(--vp-c-text-3);
}
.crt .age-btn.age-male .age-val {
  color: #38bdf8;
}
.crt .age-btn.age-female .age-val {
  color: #f472b6;
}
/* ── Reference table ───────────────────────────────────────────── */
.crt .ref-table {
  border: 1px solid var(--vp-c-divider);
  border-radius: 10px;
  overflow: hidden;
  font-size: 0.88rem;
}
.crt .rt-row {
  display: grid;
  grid-template-columns: 60px 1fr 1fr 1fr 1fr 1fr;
  gap: 0.3rem;
  padding: 0.38rem 0.8rem;
  border-bottom: 1px solid var(--vp-c-divider);
  align-items: center;
  transition: background 0.15s;
}
.crt .rt-row:last-child {
  border-bottom: none;
}
.crt .rt-header {
  background: var(--vp-c-bg-mute);
  font-size: 0.78rem;
  font-weight: 700;
  color: var(--vp-c-text-3);
  text-transform: uppercase;
  letter-spacing: 0.04em;
}
.crt .rt-active {
  background: var(--vp-c-bg-soft);
  font-weight: 600;
}
.crt .rt-male {
  border-left: 3px solid #38bdf8;
  background: rgba(56, 189, 248, 0.06);
}
.crt .rt-female {
  border-left: 3px solid #f472b6;
  background: rgba(244, 114, 182, 0.06);
}
.crt .rt-age {
  font-weight: 700;
  color: var(--vp-c-text-1);
}
.crt .rt-highlight {
  font-weight: 900;
  color: var(--vp-c-brand-1);
}
.crt .rt-loss {
  color: var(--vp-c-text-3);
  font-size: 0.84rem;
}
.crt .table-note {
  font-size: 0.72rem;
  color: var(--vp-c-text-3);
  margin: 0.5rem 0 0;
  line-height: 1.5;
}
/* ── Result card ───────────────────────────────────────────────── */
.crt .ens-result {
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
.crt .result-male {
  border-color: #38bdf8;
}
.crt .result-female {
  border-color: #f472b6;
}
.crt .result-left {
  display: flex;
  align-items: baseline;
  gap: 4px;
  flex-shrink: 0;
}
.crt .result-number {
  font-size: 3.5rem;
  font-weight: 800;
  line-height: 1;
  color: var(--vp-c-text-3);
  transition: color 0.3s;
}
.crt .result-male .result-number {
  color: #38bdf8;
}
.crt .result-female .result-number {
  color: #f472b6;
}
.crt .result-max {
  font-size: 1rem;
  color: var(--vp-c-text-3);
}
.crt .result-right {
  display: flex;
  flex-direction: column;
  gap: 5px;
}
.crt .result-level {
  font-size: 0.9rem;
  font-weight: 700;
  color: var(--vp-c-text-1);
}
.crt .result-advice {
  font-size: 0.82rem;
  color: var(--vp-c-text-2);
  line-height: 1.5;
}
.crt .result-sub {
  font-size: 0.72rem;
  color: var(--vp-c-text-3);
}
/* ── Weight loss cards ─────────────────────────────────────────── */
.crt .loss-cards {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 0.6rem;
  margin-bottom: 1rem;
}
.crt .loss-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 3px;
  padding: 0.8rem 0.5rem;
  border-radius: 10px;
  border: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg-soft);
  text-align: center;
}
.crt .lc-male {
  border-color: #38bdf8;
  background: rgba(56, 189, 248, 0.06);
}
.crt .lc-female {
  border-color: #f472b6;
  background: rgba(244, 114, 182, 0.06);
}
.crt .loss-05 {
  border-color: #f59e0b;
  background: rgba(245, 158, 11, 0.06);
}
.crt .loss-10 {
  border-color: #f97316;
  background: rgba(249, 115, 22, 0.06);
}
.crt .lc-icon {
  font-size: 1.1rem;
}
.crt .lc-val {
  font-size: 1.5rem;
  font-weight: 800;
  color: var(--vp-c-brand-1);
  line-height: 1;
}
.crt .lc-male .lc-val {
  color: #38bdf8;
}
.crt .lc-female .lc-val {
  color: #f472b6;
}
.crt .loss-05 .lc-val {
  color: #f59e0b;
}
.crt .loss-10 .lc-val {
  color: #f97316;
}
.crt .lc-unit {
  font-size: 0.62rem;
  color: var(--vp-c-text-3);
}
.crt .lc-label {
  font-size: 0.7rem;
  font-weight: 700;
  color: var(--vp-c-text-2);
}
/* ── Warning box ───────────────────────────────────────────────── */
.crt .warn-box {
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
.crt .warn-icon {
  color: #f97316;
  flex-shrink: 0;
}
/* ── Results detail ────────────────────────────────────────────── */
.crt .results-detail {
  border: 1px solid var(--vp-c-divider);
  border-radius: 10px;
  overflow: hidden;
  margin-bottom: 1rem;
}
.crt .results-header {
  padding: 0.5rem 0.9rem;
  font-size: 0.72rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--vp-c-text-3);
  background: var(--vp-c-bg-mute);
  border-bottom: 1px solid var(--vp-c-divider);
}
.crt .detail-row {
  display: flex;
  align-items: flex-start;
  gap: 0.6rem;
  padding: 0.5rem 0.9rem;
  border-bottom: 1px solid var(--vp-c-divider);
}
.crt .detail-row:last-child {
  border-bottom: none;
}
.crt .detail-total {
  background: var(--vp-c-bg-mute);
}
.crt .detail-qnum {
  font-size: 0.68rem;
  font-weight: 800;
  color: #f59e0b;
  flex-shrink: 0;
  width: 44px;
  padding-top: 1px;
}
.crt .detail-domain {
  font-size: 0.78rem;
  font-weight: 700;
  color: var(--vp-c-text-1);
  flex: 1;
  line-height: 1.5;
}
.crt .detail-score {
  font-size: 0.82rem;
  font-weight: 800;
  color: var(--vp-c-brand-1);
  flex-shrink: 0;
  width: 52px;
  text-align: right;
  white-space: normal;
}
.crt .detail-score-brand {
  color: var(--vp-c-brand-1);
}
.crt .detail-desc {
  font-size: 0.75rem;
  color: var(--vp-c-text-2);
  flex-shrink: 0;
  width: 100px;
  text-align: left;
  white-space: normal;
}
.crt .detail-desc-block {
  display: flex;
  flex-direction: column;
  gap: 1px;
  width: 100px;
  flex-shrink: 0;
}
.crt .detail-desc-unit {
  font-size: 0.75rem;
  color: var(--vp-c-text-2);
}
.crt .detail-desc-label {
  font-size: 0.73rem;
  font-weight: 700;
  color: var(--vp-c-brand-1);
  white-space: normal;
}
/* ── Actions ───────────────────────────────────────────────────── */
.crt .ens-actions {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
}
.crt .btn-view,
.crt .btn-copy,
.crt .btn-reset {
  padding: 9px 22px;
  border-radius: 8px;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  font-family: inherit;
  transition: all 0.2s;
}
.crt .btn-view {
  border: none;
  background: linear-gradient(135deg, var(--vp-c-brand-1), #4f46e5);
  color: #fff;
  box-shadow: 0 2px 8px rgba(99, 102, 241, 0.3);
}
.crt .btn-view:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 14px rgba(99, 102, 241, 0.4);
}
.crt .btn-view:active:not(:disabled) {
  transform: translateY(0);
}
.crt .btn-view:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}
.crt .btn-copy {
  border: 1.5px solid var(--vp-c-brand-1);
  background: transparent;
  color: var(--vp-c-brand-1);
}
.crt .btn-copy:hover:not(:disabled) {
  background: var(--vp-c-brand-soft);
}
.crt .btn-copy:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}
.crt .btn-reset {
  border: 1px solid var(--vp-c-divider);
  background: transparent;
  color: var(--vp-c-text-2);
}
.crt .btn-reset:hover {
  border-color: #ef4444;
  color: #ef4444;
  background: rgba(239, 68, 68, 0.04);
}
.crt .progress-hint {
  font-size: 0.75rem;
  color: var(--vp-c-text-3);
  margin: 0.4rem 0 0;
}

@media (max-width: 640px) {
.crt .crt-header {
    flex-wrap: wrap;
  }
.crt .score-badge {
    align-self: flex-start;
  }
.crt .score-number {
    font-size: 1.4rem;
  }
.crt .pal-grid {
    grid-template-columns: 1fr;
  }
.crt .age-grid {
    grid-template-columns: repeat(3, 1fr);
  }
.crt .loss-cards {
    grid-template-columns: 1fr;
  }
.crt .ens-result {
    flex-direction: column;
    gap: 0.75rem;
  }
.crt .rt-row {
    grid-template-columns: 50px 1fr 1fr 1fr 1fr;
    font-size: 0.8rem;
  }
.crt .rt-row span:last-child {
    display: none;
  }
.crt .tab-toggle {
    flex-direction: column;
  }
}
/* ══════════════ EER 熱量需求（Estimated Energy Requirement）══════════════ */

.cal {
  max-width: 780px;
  margin: 0 auto;
  padding: 2rem 0 3rem;
  font-size: 0.9rem;
}
.cal .cal-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 1.25rem;
  flex-wrap: nowrap;
}
.cal .header-title {
  flex: 1;
  min-width: 0;
}
.cal .title {
  font-size: 24px;
  font-weight: 600;
  color: var(--vp-c-text-1);
  margin: 0 0 0.2rem;
  border: none !important;
  padding: 0 !important;
}
.cal .subtitle {
  font-size: 0.75rem;
  color: var(--vp-c-text-3);
  margin: 0;
  line-height: 1.6;
}
.cal .score-badge {
  display: flex;
  flex-shrink: 0;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-width: 90px;
  min-height: 88px;
  padding: 0.6rem 1rem;
  border-radius: 12px;
  border: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg-soft);
  transition: all 0.3s;
}
.cal .badge-label {
  font-size: 0.65rem;
  font-weight: 700;
  color: var(--vp-c-text-3);
}
.cal .score-number {
  font-size: 1.6rem;
  font-weight: 800;
  line-height: 1;
}
.cal .score-unit {
  font-size: 0.62rem;
  font-weight: 600;
  margin-top: 1px;
}
.cal .score-label {
  font-size: 0.65rem;
  font-weight: 600;
  margin-top: 2px;
}
.cal .score-badge.pending {
  color: var(--vp-c-text-3);
}
.cal .score-badge.normal {
  border-color: #22c55e;
  color: #22c55e;
}
.cal .score-badge.mild {
  border-color: #f59e0b;
  color: #f59e0b;
}
.cal .score-badge.moderate {
  border-color: #3b82f6;
  color: #3b82f6;
}
.cal .nihss-group {
  margin-bottom: 1.5rem;
}
.cal .group-header-bar {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.55rem 0.85rem;
  border-radius: 8px;
  background: var(--vp-c-bg-mute);
  border: 1px solid var(--vp-c-divider);
  border-left: 3px solid #6366f1;
  margin-bottom: 0.6rem;
}
.cal .sex-bar {
  border-left: 3px solid #6366f1;
}
.cal .input-bar {
  border-left: 3px solid #3b82f6;
}
.cal .act-bar {
  border-left: 3px solid #22c55e;
}
.cal .group-icon {
  font-size: 1rem;
  flex-shrink: 0;
}
.cal .group-label-text {
  font-size: 0.88rem;
  font-weight: 800;
  color: var(--vp-c-text-1);
}
.cal .group-sub-text {
  font-size: 0.7rem;
  color: var(--vp-c-text-3);
  flex: 1;
}
.cal .group-score-tally {
  font-size: 0.75rem;
  font-weight: 700;
  padding: 2px 8px;
  border-radius: 999px;
  flex-shrink: 0;
}
.cal .male-tally {
  color: #38bdf8;
  background: rgba(56, 189, 248, 0.12);
}
.cal .female-tally {
  color: #f472b6;
  background: rgba(244, 114, 182, 0.12);
}
.cal .act-tally {
  color: #22c55e;
  background: rgba(34, 197, 94, 0.12);
}
.cal .tab-toggle {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}
.cal .tab-btn {
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
.cal .tab-btn.tab-active {
  border-color: #6366f1;
  background: rgba(99, 102, 241, 0.06);
}
.cal .tab-btn.tab-active-m {
  border-color: #38bdf8;
  background: rgba(56, 189, 248, 0.06);
}
.cal .tab-btn.tab-active-f {
  border-color: #f472b6;
  background: rgba(244, 114, 182, 0.06);
}
.cal .tab-title {
  font-size: 0.9rem;
  font-weight: 700;
  color: var(--vp-c-text-1);
}
.cal .tab-sub {
  font-size: 0.62rem;
  color: var(--vp-c-text-3);
  font-family: monospace;
}
.cal .tab-btn.tab-active .tab-title {
  color: #6366f1;
}
.cal .group-items {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
.cal .ens-item {
  border: 1px solid var(--vp-c-divider);
  border-radius: 10px;
  background: var(--vp-c-bg-soft);
  overflow: hidden;
  transition: border-color 0.2s;
}
.cal .ens-item.answered {
  border-color: #3b82f6;
}
.cal .ens-item.derived-item {
  border-color: #06b6d4;
  opacity: 0.85;
}
.cal .item-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  padding: 0.6rem 0.9rem;
  background: var(--vp-c-bg-mute);
  border-bottom: 1px solid var(--vp-c-divider);
  gap: 0.75rem;
}
.cal .derived-item .item-header {
  border-bottom: none;
}
.cal .item-meta-row {
  display: flex;
  align-items: center;
  flex-shrink: 0;
  padding-top: 3px;
}
.cal .item-qnum {
  font-size: 0.68rem;
  font-weight: 800;
  color: #3b82f6;
  background: rgba(59, 130, 246, 0.12);
  padding: 1px 6px;
  border-radius: 999px;
}
.cal .bmi-q {
  color: #06b6d4;
  background: rgba(6, 182, 212, 0.12);
}
.cal .item-name-block {
  display: flex;
  flex-direction: column;
  gap: 2px;
  flex: 1;
}
.cal .item-name {
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--vp-c-text-1);
}
.cal .item-sub {
  font-size: 0.72rem;
  color: var(--vp-c-text-3);
}
.cal .item-score {
  font-size: 0.9rem;
  font-weight: 800;
  color: #3b82f6;
  min-width: 28px;
  text-align: right;
  white-space: nowrap;
}
.cal .item-score.zero {
  color: var(--vp-c-text-3);
}
.cal .input-row {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.65rem 0.9rem;
}
.cal .cal-input {
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
.cal .cal-input::-webkit-outer-spin-button,
.cal .cal-input::-webkit-inner-spin-button {
  -webkit-appearance: none;
}
.cal .cal-input:focus {
  border-color: #3b82f6;
}
.cal .cal-input::placeholder {
  color: var(--vp-c-text-3);
  font-size: 0.82rem;
}
.cal .input-unit {
  font-size: 0.78rem;
  font-weight: 600;
  color: var(--vp-c-text-3);
  flex-shrink: 0;
}
.cal .pal-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.5rem;
}
.cal .pal-btn {
  display: flex;
  flex-direction: column;
  gap: 3px;
  padding: 0.7rem 0.85rem;
  border-radius: 10px;
  border: 1.5px solid var(--vp-c-divider);
  background: var(--vp-c-bg-soft);
  cursor: pointer;
  font-family: inherit;
  text-align: left;
  transition: all 0.18s;
}
.cal .pal-btn.pal-active {
  border-color: #22c55e;
  background: rgba(34, 197, 94, 0.06);
}
.cal .pal-name {
  font-size: 0.82rem;
  font-weight: 700;
  color: var(--vp-c-text-1);
}
.cal .pal-pa {
  font-size: 0.7rem;
  font-weight: 700;
  color: #22c55e;
  font-family: monospace;
}
.cal .pal-desc {
  font-size: 0.68rem;
  color: var(--vp-c-text-3);
}
.cal .pal-btn.pal-active .pal-name {
  color: #22c55e;
}
.cal .formula-box {
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
.cal .formula-label {
  font-weight: 700;
  color: var(--vp-c-text-2);
  flex-shrink: 0;
}
.cal .formula-text {
  color: var(--vp-c-text-2);
  font-family: monospace;
  line-height: 1.6;
}
.cal .ens-result {
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
.cal .ens-result.normal {
  border-color: #22c55e;
}
.cal .ens-result.mild {
  border-color: #f59e0b;
}
.cal .ens-result.moderate {
  border-color: #3b82f6;
}
.cal .result-left {
  display: flex;
  align-items: baseline;
  gap: 4px;
  flex-shrink: 0;
}
.cal .result-number {
  font-size: 3.2rem;
  font-weight: 800;
  line-height: 1;
  color: var(--vp-c-text-3);
  transition: color 0.3s;
}
.cal .ens-result.normal .result-number {
  color: #22c55e;
}
.cal .ens-result.mild .result-number {
  color: #f59e0b;
}
.cal .ens-result.moderate .result-number {
  color: #3b82f6;
}
.cal .result-max {
  font-size: 0.9rem;
  color: var(--vp-c-text-3);
}
.cal .result-right {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.cal .result-level {
  font-size: 1rem;
  font-weight: 700;
  color: var(--vp-c-text-1);
}
.cal .result-advice {
  font-size: 0.85rem;
  color: var(--vp-c-text-2);
  line-height: 1.5;
}
.cal .result-sub {
  font-size: 0.78rem;
  color: var(--vp-c-brand-1);
}
.cal .loss-table {
  border: 1px solid var(--vp-c-divider);
  border-radius: 10px;
  overflow: hidden;
  margin-bottom: 1rem;
}
.cal .lt-header {
  padding: 0.4rem 0.9rem;
  font-size: 0.7rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--vp-c-text-3);
  background: var(--vp-c-bg-mute);
  border-bottom: 1px solid var(--vp-c-divider);
}
.cal .lt-row {
  display: grid;
  grid-template-columns: 140px 120px 1fr;
  gap: 0.5rem;
  padding: 0.45rem 0.9rem;
  border-bottom: 1px solid var(--vp-c-divider);
  font-size: 0.8rem;
  align-items: center;
}
.cal .lt-row:last-child {
  border-bottom: none;
}
.cal .lt-main {
  background: var(--vp-c-brand-soft);
}
.cal .lt-label {
  font-weight: 700;
  color: var(--vp-c-text-1);
}
.cal .lt-val {
  font-weight: 800;
  color: var(--vp-c-brand-1);
  font-family: monospace;
}
.cal .lt-note {
  font-size: 0.7rem;
  color: var(--vp-c-text-3);
}
.cal .warn-box {
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
.cal .warn-icon {
  color: #f97316;
  flex-shrink: 0;
}
.cal .results-detail {
  border: 1px solid var(--vp-c-divider);
  border-radius: 10px;
  overflow: hidden;
  margin-bottom: 1rem;
}
.cal .results-header {
  padding: 0.5rem 0.9rem;
  font-size: 0.72rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--vp-c-text-3);
  background: var(--vp-c-bg-mute);
  border-bottom: 1px solid var(--vp-c-divider);
}
.cal .detail-row {
  display: flex;
  align-items: flex-start;
  gap: 0.6rem;
  padding: 0.5rem 0.9rem;
  border-bottom: 1px solid var(--vp-c-divider);
}
.cal .detail-row:last-child {
  border-bottom: none;
}
.cal .detail-total {
  background: var(--vp-c-bg-mute);
}
.cal .detail-qnum {
  font-size: 0.7rem;
  font-weight: 800;
  color: #3b82f6;
  flex-shrink: 0;
  width: 44px;
  padding-top: 1px;
}
.cal .detail-domain {
  font-size: 0.78rem;
  font-weight: 700;
  color: var(--vp-c-text-1);
  flex: 1;
  line-height: 1.5;
}
.cal .detail-score {
  font-size: 0.82rem;
  font-weight: 800;
  color: var(--vp-c-brand-1);
  flex-shrink: 0;
  width: 52px;
  text-align: right;
  white-space: nowrap;
}
.cal .detail-score-brand {
  color: var(--vp-c-brand-1);
}
.cal .detail-desc {
  font-size: 0.75rem;
  color: var(--vp-c-text-2);
  flex-shrink: 0;
  width: 80px;
  text-align: left;
  white-space: normal;
  word-break: break-word;
  line-height: 1.4;
}
.cal .detail-desc-block {
  display: flex;
  flex-direction: column;
  gap: 1px;
  width: 80px;
  flex-shrink: 0;
}
.cal .detail-desc-unit {
  font-size: 0.75rem;
  color: var(--vp-c-text-2);
}
.cal .detail-desc-label {
  font-size: 0.73rem;
  font-weight: 700;
  color: var(--vp-c-brand-1);
  white-space: normal;
}
/* ── Actions ───────────────────────────────────────────────────── */
.cal .ens-actions {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
}
.cal .btn-view,
.cal .btn-copy,
.cal .btn-reset {
  padding: 9px 22px;
  border-radius: 8px;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  font-family: inherit;
  transition: all 0.2s;
}
.cal .btn-view {
  border: none;
  background: linear-gradient(135deg, var(--vp-c-brand-1), #4f46e5);
  color: #fff;
  box-shadow: 0 2px 8px rgba(99, 102, 241, 0.3);
}
.cal .btn-view:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 14px rgba(99, 102, 241, 0.4);
}
.cal .btn-view:active:not(:disabled) {
  transform: translateY(0);
}
.cal .btn-view:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}
.cal .btn-copy {
  border: 1.5px solid var(--vp-c-brand-1);
  background: transparent;
  color: var(--vp-c-brand-1);
}
.cal .btn-copy:hover:not(:disabled) {
  background: var(--vp-c-brand-soft);
}
.cal .btn-copy:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}
.cal .btn-reset {
  border: 1px solid var(--vp-c-divider);
  background: transparent;
  color: var(--vp-c-text-2);
}
.cal .btn-reset:hover {
  border-color: #ef4444;
  color: #ef4444;
  background: rgba(239, 68, 68, 0.04);
}
.cal .progress-hint {
  font-size: 0.75rem;
  color: var(--vp-c-text-3);
  margin: 0.4rem 0 0;
}
@media (max-width: 640px) {
.cal .cal-header {
    flex-direction: column;
  }
.cal .pal-grid {
    grid-template-columns: 1fr;
  }
.cal .tab-toggle {
    flex-direction: column;
  }
.cal .ens-result {
    flex-direction: column;
    gap: 0.75rem;
  }
.cal .lt-row {
    grid-template-columns: 120px 100px 1fr;
  }
}
/* ══════════════ 理想體重（Ideal Body Weight）══════════════ */

.ibw {
  max-width: 780px;
  margin: 0 auto;
  padding: 2rem 0 3rem;
  font-size: 0.9rem;
}
.ibw .ibw-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 1.25rem;
  flex-wrap: nowrap;
}
.ibw .header-title {
  flex: 1;
  min-width: 0;
}
.ibw .title {
  font-size: 24px;
  font-weight: 600;
  color: var(--vp-c-text-1);
  margin: 0 0 0.2rem;
  border: none !important;
  padding: 0 !important;
}
.ibw .subtitle {
  font-size: 0.75rem;
  color: var(--vp-c-text-3);
  margin: 0;
  line-height: 1.6;
}
.ibw .score-badge {
  display: flex;
  flex-shrink: 0;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-width: 90px;
  min-height: 88px;
  padding: 0.6rem 1rem;
  border-radius: 12px;
  border: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg-soft);
  transition: all 0.3s;
}
.ibw .badge-label {
  font-size: 0.65rem;
  font-weight: 700;
  color: var(--vp-c-text-3);
}
.ibw .score-number {
  font-size: 1.9rem;
  font-weight: 800;
  line-height: 1;
}
.ibw .score-unit {
  font-size: 0.65rem;
  font-weight: 600;
  margin-top: 1px;
}
.ibw .score-label {
  font-size: 0.65rem;
  font-weight: 600;
  margin-top: 2px;
  text-align: center;
}
.ibw .score-badge.pending {
  color: var(--vp-c-text-3);
}
.ibw .score-badge.normal {
  border-color: #22c55e;
  color: #22c55e;
}
.ibw .score-badge.mild {
  border-color: #f59e0b;
  color: #f59e0b;
}
.ibw .score-badge.moderate {
  border-color: #ef4444;
  color: #ef4444;
}
.ibw .nihss-group {
  margin-bottom: 1.5rem;
}
.ibw .group-header-bar {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.55rem 0.85rem;
  border-radius: 8px;
  background: var(--vp-c-bg-mute);
  border: 1px solid var(--vp-c-divider);
  border-left: 3px solid #06b6d4;
  margin-bottom: 0.6rem;
}
.ibw .sex-bar {
  border-left: 3px solid #6366f1;
}
.ibw .input-bar {
  border-left: 3px solid #10b981;
}
.ibw .group-icon {
  font-size: 1rem;
  flex-shrink: 0;
}
.ibw .group-label-text {
  font-size: 0.88rem;
  font-weight: 800;
  color: var(--vp-c-text-1);
}
.ibw .group-sub-text {
  font-size: 0.7rem;
  color: var(--vp-c-text-3);
  flex: 1;
}
.ibw .tab-toggle {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}
.ibw .tab-btn {
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
.ibw .tab-btn.tab-active {
  border-color: #6366f1;
  background: rgba(99, 102, 241, 0.06);
}
.ibw .tab-btn.tab-active-m {
  border-color: #38bdf8;
  background: rgba(56, 189, 248, 0.06);
}
.ibw .tab-btn.tab-active-f {
  border-color: #f472b6;
  background: rgba(244, 114, 182, 0.06);
}
.ibw .tab-title {
  font-size: 0.9rem;
  font-weight: 700;
  color: var(--vp-c-text-1);
}
.ibw .tab-sub {
  font-size: 0.65rem;
  color: var(--vp-c-text-3);
  font-family: monospace;
}
.ibw .tab-btn.tab-active .tab-title {
  color: #6366f1;
}
.ibw .group-items {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
.ibw .ens-item {
  border: 1px solid var(--vp-c-divider);
  border-radius: 10px;
  background: var(--vp-c-bg-soft);
  overflow: hidden;
  transition: border-color 0.2s;
}
.ibw .ens-item.answered {
  border-color: #10b981;
}
.ibw .ens-item.warn-border {
  border-color: #f59e0b !important;
}
.ibw .ens-item.derived-item {
  border-color: #06b6d4;
  opacity: 0.85;
}
.ibw .item-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  padding: 0.6rem 0.9rem;
  background: var(--vp-c-bg-mute);
  border-bottom: 1px solid var(--vp-c-divider);
  gap: 0.75rem;
}
.ibw .derived-item .item-header {
  border-bottom: none;
}
.ibw .item-meta-row {
  display: flex;
  align-items: center;
  flex-shrink: 0;
  padding-top: 3px;
}
.ibw .item-qnum {
  font-size: 0.68rem;
  font-weight: 800;
  color: #10b981;
  background: rgba(16, 185, 129, 0.12);
  padding: 1px 6px;
  border-radius: 999px;
}
.ibw .bmi-q {
  color: #06b6d4;
  background: rgba(6, 182, 212, 0.12);
}
.ibw .item-name-block {
  display: flex;
  flex-direction: column;
  gap: 2px;
  flex: 1;
}
.ibw .item-name {
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--vp-c-text-1);
}
.ibw .item-sub {
  font-size: 0.72rem;
  color: var(--vp-c-text-3);
}
.ibw .item-score {
  font-size: 0.85rem;
  font-weight: 800;
  color: #10b981;
  min-width: 28px;
  text-align: right;
  white-space: nowrap;
}
.ibw .item-score.zero {
  color: var(--vp-c-text-3);
}
.ibw .input-row {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.65rem 0.9rem;
}
.ibw .ibw-input {
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
.ibw .ibw-input::-webkit-outer-spin-button,
.ibw .ibw-input::-webkit-inner-spin-button {
  -webkit-appearance: none;
}
.ibw .ibw-input:focus {
  border-color: #10b981;
}
.ibw .ibw-input::placeholder {
  color: var(--vp-c-text-3);
  font-size: 0.82rem;
}
.ibw .input-unit {
  font-size: 0.78rem;
  font-weight: 600;
  color: var(--vp-c-text-3);
  flex-shrink: 0;
}
.ibw .warn-note {
  padding: 0.4rem 0.9rem;
  font-size: 0.75rem;
  color: #f59e0b;
  background: rgba(245, 158, 11, 0.06);
  border-top: 1px solid var(--vp-c-divider);
}
.ibw .ibw-table {
  border: 1px solid var(--vp-c-divider);
  border-radius: 10px;
  overflow: hidden;
  margin-bottom: 1rem;
}
.ibw .it-header {
  padding: 0.4rem 0.9rem;
  font-size: 0.7rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--vp-c-text-3);
  background: var(--vp-c-bg-mute);
  border-bottom: 1px solid var(--vp-c-divider);
}
.ibw .it-row {
  display: grid;
  grid-template-columns: 140px 1fr 90px;
  gap: 0.5rem;
  padding: 0.45rem 0.9rem;
  border-bottom: 1px solid var(--vp-c-divider);
  font-size: 0.8rem;
  align-items: center;
}
.ibw .it-row:last-child {
  border-bottom: none;
}
.ibw .it-main {
  background: var(--vp-c-brand-soft);
}
.ibw .it-adj {
  background: rgba(239, 68, 68, 0.06);
}
.ibw .it-abw {
  background: var(--vp-c-bg-mute);
}
.ibw .it-method {
  font-weight: 700;
  color: var(--vp-c-text-1);
}
.ibw .it-formula {
  font-family: monospace;
  font-size: 0.75rem;
  color: var(--vp-c-text-3);
}
.ibw .it-result {
  font-weight: 800;
  color: var(--vp-c-brand-1);
  text-align: right;
}
.ibw .obese-text {
  color: #ef4444;
}
.ibw .ok-text {
  color: #22c55e;
}
.ibw .adj-color {
  color: #ef4444;
}
.ibw .obese-alert {
  display: flex;
  align-items: flex-start;
  gap: 0.6rem;
  padding: 0.75rem 1rem;
  border-radius: 10px;
  background: rgba(239, 68, 68, 0.06);
  border: 1px solid rgba(239, 68, 68, 0.35);
  font-size: 0.82rem;
  color: var(--vp-c-text-2);
  line-height: 1.6;
  margin-bottom: 1rem;
}
.ibw .alert-icon {
  color: #ef4444;
  flex-shrink: 0;
}
.ibw .warn-box {
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
.ibw .warn-icon {
  color: #f97316;
  flex-shrink: 0;
}
.ibw .results-detail {
  border: 1px solid var(--vp-c-divider);
  border-radius: 10px;
  overflow: hidden;
  margin-bottom: 1rem;
}
.ibw .results-header {
  padding: 0.5rem 0.9rem;
  font-size: 0.72rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--vp-c-text-3);
  background: var(--vp-c-bg-mute);
  border-bottom: 1px solid var(--vp-c-divider);
}
.ibw .detail-row {
  display: flex;
  align-items: flex-start;
  gap: 0.6rem;
  padding: 0.5rem 0.9rem;
  border-bottom: 1px solid var(--vp-c-divider);
}
.ibw .detail-row:last-child {
  border-bottom: none;
}
.ibw .detail-total {
  background: var(--vp-c-bg-mute);
}
.ibw .detail-qnum {
  font-size: 0.7rem;
  font-weight: 800;
  color: #10b981;
  flex-shrink: 0;
  width: 44px;
  padding-top: 1px;
}
.ibw .detail-domain {
  font-size: 0.78rem;
  font-weight: 700;
  color: var(--vp-c-text-1);
  flex: 1;
  line-height: 1.5;
}
.ibw .detail-score {
  font-size: 0.82rem;
  font-weight: 800;
  color: var(--vp-c-brand-1);
  flex-shrink: 0;
  width: 52px;
  text-align: right;
  white-space: nowrap;
}
.ibw .detail-score-brand {
  color: var(--vp-c-brand-1);
}
.ibw .detail-desc {
  font-size: 0.75rem;
  color: var(--vp-c-text-2);
  flex-shrink: 0;
  width: 80px;
  text-align: left;
  white-space: nowrap;
}
.ibw .detail-desc-block {
  display: flex;
  flex-direction: column;
  gap: 1px;
  width: 80px;
  flex-shrink: 0;
}
.ibw .detail-desc-unit {
  font-size: 0.75rem;
  color: var(--vp-c-text-2);
}
.ibw .detail-desc-label {
  font-size: 0.73rem;
  font-weight: 700;
  color: var(--vp-c-brand-1);
  white-space: normal;
}
.ibw .ens-actions {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
}
.ibw .btn-view,
.ibw .btn-copy,
.ibw .btn-reset {
  padding: 9px 22px;
  border-radius: 8px;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  font-family: inherit;
  transition: all 0.2s;
}
.ibw .btn-view {
  border: none;
  background: linear-gradient(135deg, var(--vp-c-brand-1), #4f46e5);
  color: #fff;
  box-shadow: 0 2px 8px rgba(99, 102, 241, 0.3);
}
.ibw .btn-view:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 14px rgba(99, 102, 241, 0.4);
}
.ibw .btn-view:active:not(:disabled) {
  transform: translateY(0);
}
.ibw .btn-view:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}
.ibw .btn-copy {
  border: 1.5px solid var(--vp-c-brand-1);
  background: transparent;
  color: var(--vp-c-brand-1);
}
.ibw .btn-copy:hover:not(:disabled) {
  background: var(--vp-c-brand-soft);
}
.ibw .btn-copy:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}
.ibw .btn-reset {
  border: 1px solid var(--vp-c-divider);
  background: transparent;
  color: var(--vp-c-text-2);
}
.ibw .btn-reset:hover {
  border-color: #ef4444;
  color: #ef4444;
  background: rgba(239, 68, 68, 0.04);
}
.ibw .progress-hint {
  font-size: 0.75rem;
  color: var(--vp-c-text-3);
  margin: 0.4rem 0 0;
}
@media (max-width: 640px) {
.ibw .ibw-header {
    flex-direction: column;
  }
.ibw .tab-toggle {
    flex-direction: column;
  }
.ibw .it-row {
    grid-template-columns: 110px 1fr 70px;
  }
}
/* ══════════════ 瘦體重（Lean Body Weight）══════════════ */

.lbw {
  max-width: 780px;
  margin: 0 auto;
  padding: 2rem 0 3rem;
  font-size: 0.9rem;
}
.lbw .lbw-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 1.25rem;
  flex-wrap: nowrap;
}
.lbw .header-title {
  flex: 1;
  min-width: 0;
}
.lbw .title {
  font-size: 24px;
  font-weight: 600;
  color: var(--vp-c-text-1);
  margin: 0 0 0.2rem;
  border: none !important;
  padding: 0 !important;
}
.lbw .subtitle {
  font-size: 0.75rem;
  color: var(--vp-c-text-3);
  margin: 0;
  line-height: 1.6;
}
.lbw .score-badge {
  display: flex;
  flex-shrink: 0;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-width: 90px;
  min-height: 88px;
  padding: 0.6rem 1rem;
  border-radius: 12px;
  border: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg-soft);
  transition: all 0.3s;
}
.lbw .badge-label {
  font-size: 0.65rem;
  font-weight: 700;
  color: var(--vp-c-text-3);
}
.lbw .score-number {
  font-size: 1.9rem;
  font-weight: 800;
  line-height: 1;
}
.lbw .score-unit {
  font-size: 0.65rem;
  font-weight: 600;
  margin-top: 1px;
}
.lbw .score-label {
  font-size: 0.65rem;
  font-weight: 600;
  margin-top: 2px;
}
.lbw .score-badge.pending {
  color: var(--vp-c-text-3);
}
.lbw .score-badge.normal {
  border-color: #22c55e;
  color: #22c55e;
}
.lbw .score-badge.mild {
  border-color: #f59e0b;
  color: #f59e0b;
}
.lbw .score-badge.moderate {
  border-color: #f97316;
  color: #f97316;
}
.lbw .nihss-group {
  margin-bottom: 1.5rem;
}
.lbw .group-header-bar {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.55rem 0.85rem;
  border-radius: 8px;
  background: var(--vp-c-bg-mute);
  border: 1px solid var(--vp-c-divider);
  border-left: 3px solid #3b82f6;
  margin-bottom: 0.6rem;
}
.lbw .sex-bar {
  border-left: 3px solid #6366f1;
}
.lbw .input-bar {
  border-left: 3px solid #a855f7;
}
.lbw .group-icon {
  font-size: 1rem;
  flex-shrink: 0;
}
.lbw .group-label-text {
  font-size: 0.88rem;
  font-weight: 800;
  color: var(--vp-c-text-1);
}
.lbw .group-sub-text {
  font-size: 0.7rem;
  color: var(--vp-c-text-3);
  flex: 1;
}
.lbw .group-score-tally {
  font-size: 0.75rem;
  font-weight: 700;
  padding: 2px 8px;
  border-radius: 999px;
  flex-shrink: 0;
}
.lbw .male-tally {
  color: #38bdf8;
  background: rgba(56, 189, 248, 0.12);
}
.lbw .female-tally {
  color: #f472b6;
  background: rgba(244, 114, 182, 0.12);
}
.lbw .tab-toggle {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}
.lbw .tab-btn {
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
.lbw .tab-btn.tab-active {
  border-color: #6366f1;
  background: rgba(99, 102, 241, 0.06);
}
.lbw .tab-title {
  font-size: 0.9rem;
  font-weight: 700;
  color: var(--vp-c-text-1);
}
.lbw .tab-sub {
  font-size: 0.62rem;
  color: var(--vp-c-text-3);
  font-family: monospace;
}
.lbw .tab-btn.tab-active .tab-title {
  color: #6366f1;
}
.lbw .tab-btn.tab-active-m {
  border-color: #38bdf8;
  background: rgba(56, 189, 248, 0.06);
}
.lbw .tab-btn.tab-active-f {
  border-color: #f472b6;
  background: rgba(244, 114, 182, 0.06);
}
.lbw .tab-btn.tab-active-m .tab-title {
  color: #38bdf8;
}
.lbw .tab-btn.tab-active-f .tab-title {
  color: #f472b6;
}
.lbw .group-items {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
.lbw .ens-item {
  border: 1px solid var(--vp-c-divider);
  border-radius: 10px;
  background: var(--vp-c-bg-soft);
  overflow: hidden;
  transition: border-color 0.2s;
}
.lbw .ens-item.answered {
  border-color: #a855f7;
}
.lbw .ens-item.derived-item {
  border-color: #06b6d4;
  opacity: 0.85;
}
.lbw .item-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  padding: 0.6rem 0.9rem;
  background: var(--vp-c-bg-mute);
  border-bottom: 1px solid var(--vp-c-divider);
  gap: 0.75rem;
}
.lbw .derived-item .item-header {
  border-bottom: none;
}
.lbw .item-meta-row {
  display: flex;
  align-items: center;
  flex-shrink: 0;
  padding-top: 3px;
}
.lbw .item-qnum {
  font-size: 0.68rem;
  font-weight: 800;
  color: #a855f7;
  background: rgba(168, 85, 247, 0.12);
  padding: 1px 6px;
  border-radius: 999px;
}
.lbw .bmi-q {
  color: #06b6d4;
  background: rgba(6, 182, 212, 0.12);
}
.lbw .item-name-block {
  display: flex;
  flex-direction: column;
  gap: 2px;
  flex: 1;
}
.lbw .item-name {
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--vp-c-text-1);
}
.lbw .item-sub {
  font-size: 0.72rem;
  color: var(--vp-c-text-3);
}
.lbw .item-score {
  font-size: 0.9rem;
  font-weight: 800;
  color: #a855f7;
  min-width: 28px;
  text-align: right;
  white-space: nowrap;
}
.lbw .item-score.zero {
  color: var(--vp-c-text-3);
}
.lbw .input-row {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.65rem 0.9rem;
}
.lbw .lbw-input {
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
.lbw .lbw-input::-webkit-outer-spin-button,
.lbw .lbw-input::-webkit-inner-spin-button {
  -webkit-appearance: none;
}
.lbw .lbw-input:focus {
  border-color: #a855f7;
}
.lbw .lbw-input::placeholder {
  color: var(--vp-c-text-3);
  font-size: 0.82rem;
}
.lbw .input-unit {
  font-size: 0.78rem;
  font-weight: 600;
  color: var(--vp-c-text-3);
  flex-shrink: 0;
}
.lbw .lbw-table {
  border: 1px solid var(--vp-c-divider);
  border-radius: 10px;
  overflow: hidden;
  margin-bottom: 1rem;
}
.lbw .lt-header {
  padding: 0.4rem 0.9rem;
  font-size: 0.7rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--vp-c-text-3);
  background: var(--vp-c-bg-mute);
  border-bottom: 1px solid var(--vp-c-divider);
}
.lbw .lt-row {
  display: grid;
  grid-template-columns: 100px 1fr 70px 90px;
  gap: 0.5rem;
  padding: 0.45rem 0.9rem;
  border-bottom: 1px solid var(--vp-c-divider);
  font-size: 0.78rem;
  align-items: center;
}
.lbw .lt-row:last-child {
  border-bottom: none;
}
.lbw .lt-main {
  background: var(--vp-c-brand-soft);
}
.lbw .lt-fat {
  background: var(--vp-c-bg-mute);
}
.lbw .lt-method {
  font-weight: 700;
  color: var(--vp-c-text-1);
}
.lbw .lt-formula {
  font-family: monospace;
  font-size: 0.68rem;
  color: var(--vp-c-text-3);
}
.lbw .lt-result {
  font-weight: 800;
  color: var(--vp-c-brand-1);
}
.lbw .lt-result.normal {
  color: #22c55e;
}
.lbw .lt-result.mild {
  color: #f59e0b;
}
.lbw .lt-result.moderate {
  color: #f97316;
}
.lbw .lt-note {
  font-size: 0.68rem;
  color: var(--vp-c-text-3);
}
.lbw .ens-result {
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
.lbw .ens-result.normal {
  border-color: #22c55e;
}
.lbw .ens-result.mild {
  border-color: #f59e0b;
}
.lbw .ens-result.moderate {
  border-color: #f97316;
}
.lbw .result-left {
  display: flex;
  align-items: baseline;
  gap: 4px;
  flex-shrink: 0;
}
.lbw .result-number {
  font-size: 3.2rem;
  font-weight: 800;
  line-height: 1;
  color: var(--vp-c-text-3);
  transition: color 0.3s;
}
.lbw .ens-result.normal .result-number {
  color: #22c55e;
}
.lbw .ens-result.mild .result-number {
  color: #f59e0b;
}
.lbw .ens-result.moderate .result-number {
  color: #f97316;
}
.lbw .result-max {
  font-size: 1rem;
  color: var(--vp-c-text-3);
}
.lbw .result-right {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.lbw .result-level {
  font-size: 1rem;
  font-weight: 700;
  color: var(--vp-c-text-1);
}
.lbw .result-advice {
  font-size: 0.85rem;
  color: var(--vp-c-text-2);
}
.lbw .result-sub {
  font-size: 0.78rem;
  color: var(--vp-c-brand-1);
}
.lbw .warn-box {
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
.lbw .warn-icon {
  color: #f97316;
  flex-shrink: 0;
}
.lbw .results-detail {
  border: 1px solid var(--vp-c-divider);
  border-radius: 10px;
  overflow: hidden;
  margin-bottom: 1rem;
}
.lbw .results-header {
  padding: 0.5rem 0.9rem;
  font-size: 0.72rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--vp-c-text-3);
  background: var(--vp-c-bg-mute);
  border-bottom: 1px solid var(--vp-c-divider);
}
.lbw .detail-row {
  display: flex;
  align-items: flex-start;
  gap: 0.6rem;
  padding: 0.5rem 0.9rem;
  border-bottom: 1px solid var(--vp-c-divider);
}
.lbw .detail-row:last-child {
  border-bottom: none;
}
.lbw .detail-total {
  background: var(--vp-c-bg-mute);
}
.lbw .detail-qnum {
  font-size: 0.7rem;
  font-weight: 800;
  color: #a855f7;
  flex-shrink: 0;
  width: 44px;
  padding-top: 1px;
}
.lbw .detail-domain {
  font-size: 0.78rem;
  font-weight: 700;
  color: var(--vp-c-text-1);
  flex: 1;
  line-height: 1.5;
}
.lbw .detail-score {
  font-size: 0.82rem;
  font-weight: 800;
  color: var(--vp-c-brand-1);
  flex-shrink: 0;
  width: 52px;
  text-align: right;
  white-space: normal;
}
.lbw .detail-score-brand {
  color: var(--vp-c-brand-1);
}
.lbw .detail-desc {
  font-size: 0.75rem;
  color: var(--vp-c-text-2);
  flex-shrink: 0;
  width: 80px;
  text-align: left;
  white-space: normal;
}
.lbw .detail-desc-block {
  display: flex;
  flex-direction: column;
  gap: 1px;
  width: 80px;
  flex-shrink: 0;
}
.lbw .detail-desc-unit {
  font-size: 0.75rem;
  color: var(--vp-c-text-2);
}
.lbw .detail-desc-label {
  font-size: 0.73rem;
  font-weight: 700;
  color: var(--vp-c-brand-1);
  white-space: normal;
}
.lbw .ens-actions {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
}
.lbw .btn-view,
.lbw .btn-copy,
.lbw .btn-reset {
  padding: 9px 22px;
  border-radius: 8px;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  font-family: inherit;
  transition: all 0.2s;
}
.lbw .btn-view {
  border: none;
  background: linear-gradient(135deg, var(--vp-c-brand-1), #4f46e5);
  color: #fff;
  box-shadow: 0 2px 8px rgba(99, 102, 241, 0.3);
}
.lbw .btn-view:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 14px rgba(99, 102, 241, 0.4);
}
.lbw .btn-view:active:not(:disabled) {
  transform: translateY(0);
}
.lbw .btn-view:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}
.lbw .btn-copy {
  border: 1.5px solid var(--vp-c-brand-1);
  background: transparent;
  color: var(--vp-c-brand-1);
}
.lbw .btn-copy:hover:not(:disabled) {
  background: var(--vp-c-brand-soft);
}
.lbw .btn-copy:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}
.lbw .btn-reset {
  border: 1px solid var(--vp-c-divider);
  background: transparent;
  color: var(--vp-c-text-2);
}
.lbw .btn-reset:hover {
  border-color: #ef4444;
  color: #ef4444;
  background: rgba(239, 68, 68, 0.04);
}
.lbw .progress-hint {
  font-size: 0.75rem;
  color: var(--vp-c-text-3);
  margin: 0.4rem 0 0;
}
@media (max-width: 640px) {
.lbw .lbw-header {
    flex-direction: column;
  }
.lbw .tab-toggle {
    flex-direction: column;
  }
.lbw .ens-result {
    flex-direction: column;
    gap: 0.75rem;
  }
.lbw .lt-row {
    grid-template-columns: 90px 1fr 60px;
  }
.lbw .lt-row span:last-child {
    display: none;
  }
}
/* ══════════════ Schofield BMR（Basal Metabolic Rate）══════════════ */

.sco {
  max-width: 780px;
  margin: 0 auto;
  padding: 2rem 0 3rem;
  font-size: 0.9rem;
}
.sco .sco-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 1.25rem;
  flex-wrap: nowrap;
}
.sco .header-title {
  flex: 1;
  min-width: 0;
}
.sco .title {
  font-size: 24px;
  font-weight: 600;
  color: var(--vp-c-text-1);
  margin: 0 0 0.2rem;
  border: none !important;
  padding: 0 !important;
}
.sco .subtitle {
  font-size: 0.75rem;
  color: var(--vp-c-text-3);
  margin: 0;
  line-height: 1.6;
}
.sco .score-badge {
  display: flex;
  flex-shrink: 0;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-width: 90px;
  min-height: 88px;
  padding: 0.6rem 1rem;
  border-radius: 12px;
  border: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg-soft);
  transition: all 0.3s;
}
.sco .badge-label {
  font-size: 0.62rem;
  font-weight: 700;
  color: var(--vp-c-text-3);
  text-align: center;
}
.sco .score-number {
  font-size: 1.7rem;
  font-weight: 800;
  line-height: 1;
}
.sco .score-unit {
  font-size: 0.62rem;
  font-weight: 600;
  margin-top: 1px;
}
.sco .score-label {
  font-size: 0.62rem;
  font-weight: 600;
  margin-top: 2px;
}
.sco .score-badge.pending {
  color: var(--vp-c-text-3);
}
.sco .score-badge.normal {
  border-color: #14b8a6;
  color: #14b8a6;
}
.sco .score-badge.mild {
  border-color: #3b82f6;
  color: #3b82f6;
}
.sco .score-badge.moderate {
  border-color: #22c55e;
  color: #22c55e;
}
.sco .nihss-group {
  margin-bottom: 1.5rem;
}
.sco .group-header-bar {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.55rem 0.85rem;
  border-radius: 8px;
  background: var(--vp-c-bg-mute);
  border: 1px solid var(--vp-c-divider);
  border-left: 3px solid #ef4444;
  margin-bottom: 0.6rem;
}
.sco .sex-bar {
  border-left: 3px solid #6366f1;
}
.sco .input-bar {
  border-left: 3px solid #14b8a6;
}
.sco .pal-bar {
  border-left: 3px solid #22c55e;
}
.sco .group-icon {
  font-size: 1rem;
  flex-shrink: 0;
}
.sco .group-label-text {
  font-size: 0.88rem;
  font-weight: 800;
  color: var(--vp-c-text-1);
}
.sco .group-sub-text {
  font-size: 0.7rem;
  color: var(--vp-c-text-3);
  flex: 1;
}
.sco .group-score-tally {
  font-size: 0.75rem;
  font-weight: 700;
  padding: 2px 8px;
  border-radius: 999px;
  flex-shrink: 0;
}
.sco .male-tally {
  color: #38bdf8;
  background: rgba(56, 189, 248, 0.12);
}
.sco .female-tally {
  color: #f472b6;
  background: rgba(244, 114, 182, 0.12);
}
.sco .pal-tally {
  color: #22c55e;
  background: rgba(34, 197, 94, 0.12);
}
.sco .tab-toggle {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}
.sco .tab-btn {
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
.sco .tab-btn.tab-active-m {
  border-color: #38bdf8;
  background: rgba(56, 189, 248, 0.06);
}
.sco .tab-btn.tab-active-f {
  border-color: #f472b6;
  background: rgba(244, 114, 182, 0.06);
}
.sco .tab-title {
  font-size: 0.9rem;
  font-weight: 700;
  color: var(--vp-c-text-1);
}
.sco .tab-sub {
  font-size: 0.62rem;
  color: var(--vp-c-text-3);
  font-family: monospace;
}
.sco .tab-btn.tab-active-m .tab-title {
  color: #38bdf8;
}
.sco .tab-btn.tab-active-f .tab-title {
  color: #f472b6;
}
.sco .group-items {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
.sco .ens-item {
  border: 1px solid var(--vp-c-divider);
  border-radius: 10px;
  background: var(--vp-c-bg-soft);
  overflow: hidden;
  transition: border-color 0.2s;
}
.sco .ens-item.answered {
  border-color: #14b8a6;
}
.sco .item-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  padding: 0.6rem 0.9rem;
  background: var(--vp-c-bg-mute);
  border-bottom: 1px solid var(--vp-c-divider);
  gap: 0.75rem;
}
.sco .item-meta-row {
  display: flex;
  align-items: center;
  flex-shrink: 0;
  padding-top: 3px;
}
.sco .item-qnum {
  font-size: 0.68rem;
  font-weight: 800;
  color: #14b8a6;
  background: rgba(20, 184, 166, 0.12);
  padding: 1px 6px;
  border-radius: 999px;
}
.sco .item-name-block {
  display: flex;
  flex-direction: column;
  gap: 2px;
  flex: 1;
}
.sco .item-name {
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--vp-c-text-1);
}
.sco .item-sub {
  font-size: 0.72rem;
  color: var(--vp-c-text-3);
}
.sco .bracket-badge {
  color: #14b8a6;
  font-weight: 700;
}
.sco .item-score {
  font-size: 0.9rem;
  font-weight: 800;
  color: #14b8a6;
  min-width: 28px;
  text-align: right;
  white-space: nowrap;
}
.sco .item-score.zero {
  color: var(--vp-c-text-3);
}
.sco .input-row {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.65rem 0.9rem;
}
.sco .sco-input {
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
.sco .sco-input::-webkit-outer-spin-button,
.sco .sco-input::-webkit-inner-spin-button {
  -webkit-appearance: none;
}
.sco .sco-input:focus {
  border-color: #14b8a6;
}
.sco .sco-input::placeholder {
  color: var(--vp-c-text-3);
  font-size: 0.82rem;
}
.sco .input-unit {
  font-size: 0.78rem;
  font-weight: 600;
  color: var(--vp-c-text-3);
  flex-shrink: 0;
}
.sco .sco-table {
  border: 1px solid var(--vp-c-divider);
  border-radius: 10px;
  overflow: hidden;
  margin-bottom: 1.5rem;
}
.sco .st-header {
  padding: 0.4rem 0.9rem;
  font-size: 0.7rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--vp-c-text-3);
  background: var(--vp-c-bg-mute);
  border-bottom: 1px solid var(--vp-c-divider);
}
.sco .st-row {
  display: grid;
  grid-template-columns: 90px 1fr 90px;
  gap: 0.5rem;
  padding: 0.42rem 0.9rem;
  border-bottom: 1px solid var(--vp-c-divider);
  font-size: 0.78rem;
  align-items: center;
}
.sco .st-row:last-child {
  border-bottom: none;
}
.sco .st-active {
  background: var(--vp-c-brand-soft);
}
.sco .st-age {
  font-weight: 700;
  color: var(--vp-c-text-1);
}
.sco .active-age {
  color: #14b8a6;
}
.sco .st-eq {
  font-family: monospace;
  font-size: 0.75rem;
  color: var(--vp-c-text-3);
}
.sco .st-result {
  font-weight: 800;
  color: var(--vp-c-brand-1);
  text-align: right;
}
.sco .pal-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.5rem;
}
.sco .pal-btn {
  display: flex;
  flex-direction: column;
  gap: 3px;
  padding: 0.65rem 0.85rem;
  border-radius: 10px;
  border: 1.5px solid var(--vp-c-divider);
  background: var(--vp-c-bg-soft);
  cursor: pointer;
  font-family: inherit;
  text-align: left;
  transition: all 0.18s;
}
.sco .pal-btn.pal-active {
  border-color: #22c55e;
  background: rgba(34, 197, 94, 0.06);
}
.sco .pal-name {
  font-size: 0.8rem;
  font-weight: 700;
  color: var(--vp-c-text-1);
}
.sco .pal-factor {
  font-size: 0.7rem;
  font-weight: 700;
  color: #22c55e;
  font-family: monospace;
}
.sco .pal-desc {
  font-size: 0.67rem;
  color: var(--vp-c-text-3);
}
.sco .pal-btn.pal-active .pal-name {
  color: #22c55e;
}
.sco .formula-box {
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
.sco .formula-label {
  font-weight: 700;
  color: var(--vp-c-text-2);
  flex-shrink: 0;
}
.sco .formula-text {
  color: var(--vp-c-text-2);
  font-family: monospace;
  line-height: 1.7;
}
.sco .ens-result {
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
.sco .ens-result.normal {
  border-color: #14b8a6;
}
.sco .ens-result.mild {
  border-color: #3b82f6;
}
.sco .ens-result.moderate {
  border-color: #22c55e;
}
.sco .result-left {
  display: flex;
  align-items: baseline;
  gap: 4px;
  flex-shrink: 0;
}
.sco .result-number {
  font-size: 3.2rem;
  font-weight: 800;
  line-height: 1;
  color: var(--vp-c-text-3);
  transition: color 0.3s;
}
.sco .ens-result.normal .result-number {
  color: #14b8a6;
}
.sco .ens-result.mild .result-number {
  color: #3b82f6;
}
.sco .ens-result.moderate .result-number {
  color: #22c55e;
}
.sco .result-max {
  font-size: 1rem;
  color: var(--vp-c-text-3);
}
.sco .result-right {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.sco .result-level {
  font-size: 1rem;
  font-weight: 700;
  color: var(--vp-c-text-1);
}
.sco .result-advice {
  font-size: 0.85rem;
  color: var(--vp-c-text-2);
  line-height: 1.5;
}
.sco .result-sub {
  font-size: 0.78rem;
  color: var(--vp-c-brand-1);
}
.sco .warn-box {
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
.sco .warn-icon {
  color: #f97316;
  flex-shrink: 0;
}
.sco .results-detail {
  border: 1px solid var(--vp-c-divider);
  border-radius: 10px;
  overflow: hidden;
  margin-bottom: 1rem;
}
.sco .results-header {
  padding: 0.5rem 0.9rem;
  font-size: 0.72rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--vp-c-text-3);
  background: var(--vp-c-bg-mute);
  border-bottom: 1px solid var(--vp-c-divider);
}
.sco .detail-row {
  display: flex;
  align-items: flex-start;
  gap: 0.6rem;
  padding: 0.5rem 0.9rem;
  border-bottom: 1px solid var(--vp-c-divider);
}
.sco .detail-row:last-child {
  border-bottom: none;
}
.sco .detail-total {
  background: var(--vp-c-bg-mute);
}
.sco .detail-qnum {
  font-size: 0.7rem;
  font-weight: 800;
  color: #14b8a6;
  flex-shrink: 0;
  width: 44px;
  padding-top: 1px;
}
.sco .detail-domain {
  font-size: 0.78rem;
  font-weight: 700;
  color: var(--vp-c-text-1);
  flex: 1;
  line-height: 1.5;
}
.sco .detail-score {
  font-size: 0.82rem;
  font-weight: 800;
  color: var(--vp-c-brand-1);
  flex-shrink: 0;
  width: 52px;
  text-align: right;
  white-space: nowrap;
}
.sco .detail-score-brand {
  color: var(--vp-c-brand-1);
}
.sco .detail-desc {
  font-size: 0.75rem;
  color: var(--vp-c-text-2);
  flex-shrink: 0;
  width: 80px;
  text-align: left;
  white-space: nowrap;
}
.sco .detail-desc-block {
  display: flex;
  flex-direction: column;
  gap: 1px;
  width: 80px;
  flex-shrink: 0;
}
.sco .detail-desc-unit {
  font-size: 0.75rem;
  color: var(--vp-c-text-2);
}
.sco .detail-desc-label {
  font-size: 0.73rem;
  font-weight: 700;
  color: var(--vp-c-brand-1);
  white-space: normal;
}
.sco .ens-actions {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
}
.sco .btn-view,
.sco .btn-copy,
.sco .btn-reset {
  padding: 9px 22px;
  border-radius: 8px;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  font-family: inherit;
  transition: all 0.2s;
}
.sco .btn-view {
  border: none;
  background: linear-gradient(135deg, var(--vp-c-brand-1), #4f46e5);
  color: #fff;
  box-shadow: 0 2px 8px rgba(99, 102, 241, 0.3);
}
.sco .btn-view:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 14px rgba(99, 102, 241, 0.4);
}
.sco .btn-view:active:not(:disabled) {
  transform: translateY(0);
}
.sco .btn-view:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}
.sco .btn-copy {
  border: 1.5px solid var(--vp-c-brand-1);
  background: transparent;
  color: var(--vp-c-brand-1);
}
.sco .btn-copy:hover:not(:disabled) {
  background: var(--vp-c-brand-soft);
}
.sco .btn-copy:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}
.sco .btn-reset {
  border: 1px solid var(--vp-c-divider);
  background: transparent;
  color: var(--vp-c-text-2);
}
.sco .btn-reset:hover {
  border-color: #ef4444;
  color: #ef4444;
  background: rgba(239, 68, 68, 0.04);
}
.sco .progress-hint {
  font-size: 0.75rem;
  color: var(--vp-c-text-3);
  margin: 0.4rem 0 0;
}
@media (max-width: 640px) {
.sco .sco-header {
    flex-direction: column;
  }
.sco .tab-toggle,
.sco .pal-grid {
    flex-direction: column;
  }
.sco .ens-result {
    flex-direction: column;
    gap: 0.75rem;
  }
.sco .st-row {
    grid-template-columns: 80px 1fr 70px;
  }
}
/* ══════════════ Shared score badge（各工具統一樣式）══════════════ */
.metabolism .score-badge {
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
.metabolism .score-number {
  font-size: 1.7rem;
  font-weight: 800;
  line-height: 1;
  transition: color 0.3s;
}
.metabolism .score-unit {
  font-size: 0.66rem;
  font-weight: 700;
  margin-top: 2px;
  opacity: 0.75;
}
.metabolism .score-label {
  font-size: 0.66rem;
  font-weight: 600;
  margin-top: 3px;
  letter-spacing: 0.01em;
  text-align: center;
  line-height: 1.25;
  word-break: break-word;
  max-width: 100%;
}
.metabolism .score-badge.pending {
  border-color: var(--vp-c-divider);
  color: var(--vp-c-text-3);
}
.metabolism .score-badge.normal {
  border-color: #22c55e;
  color: #22c55e;
  background: color-mix(in srgb, rgb(34, 197, 94) 10%, var(--vp-c-bg));
}
.metabolism .score-badge.mild {
  border-color: #f59e0b;
  color: #f59e0b;
  background: color-mix(in srgb, rgb(245, 158, 11) 10%, var(--vp-c-bg));
}
.metabolism .score-badge.moderate {
  border-color: #f97316;
  color: #f97316;
  background: color-mix(in srgb, rgb(249, 115, 22) 10%, var(--vp-c-bg));
}
.metabolism .score-badge.badge-male {
  border-color: #38bdf8;
  color: #38bdf8;
  background: color-mix(in srgb, rgb(56, 189, 248) 10%, var(--vp-c-bg));
}
.metabolism .score-badge.badge-female {
  border-color: #f472b6;
  color: #f472b6;
  background: color-mix(in srgb, rgb(244, 114, 182) 10%, var(--vp-c-bg));
}
@media (max-width: 640px) {
  .metabolism .score-badge {
    width: auto;
    height: auto;
    min-width: 0;
    min-height: 0;
    padding: 0.5rem 0.9rem;
  }
}

/* ══════════════ Shared typography（七工具字級統一）══════════════
   custom.css already normalizes item/opt/result classes globally; this block
   unifies and enlarges the remaining classes that diverged between the merged
   tools or were too small to read. !important guards against deeper-nested
   per-tool selectors of higher specificity. */
.metabolism .formula-box {
  font-size: 0.85rem !important;
}
.metabolism .pal-name {
  font-size: 0.85rem !important;
}
.metabolism .pal-desc,
.metabolism .pal-factor,
.metabolism .pal-pa {
  font-size: 0.76rem !important;
}
.metabolism .lt-row {
  font-size: 0.82rem !important;
}
.metabolism .lt-note,
.metabolism .mb-note,
.metabolism .table-note {
  font-size: 0.76rem !important;
}
.metabolism .item-score {
  font-size: 0.9rem !important;
}
.metabolism .detail-qnum {
  font-size: 0.74rem !important;
}
.metabolism .group-score-tally {
  font-size: 0.8rem !important;
}
.metabolism .badge-label {
  font-size: 0.7rem !important;
}
.metabolism .badge-sex {
  font-size: 0.72rem !important;
}
/* activity factor / PA selectors */
.metabolism .af-desc {
  font-size: 0.85rem !important;
}
.metabolism .af-factor {
  font-size: 0.9rem !important;
}
.metabolism .af-name {
  font-size: 0.95rem !important;
}
/* BEE sex-selector tab buttons */
.metabolism .bee .tab-title {
  font-size: 1rem !important;
}
.metabolism .bee .tab-sub {
  font-size: 0.74rem !important;
}
/* 公式選擇 group header sub text */
.metabolism .group-sub-text {
  font-size: 0.78rem !important;
}
/* age selectors */
.metabolism .age-label {
  font-size: 0.78rem !important;
}
.metabolism .age-unit {
  font-size: 0.7rem !important;
}
/* weight-loss cards (crt) */
.metabolism .lc-label {
  font-size: 0.78rem !important;
}
.metabolism .lc-unit {
  font-size: 0.7rem !important;
}
.metabolism .rt-loss {
  font-size: 0.9rem !important;
}
.metabolism .rt-row {
  font-size: 0.88rem !important;
}
/* formula rows and table headers */
.metabolism .bt-formula,
.metabolism .lt-formula,
.metabolism .mb-formula {
  font-size: 0.76rem !important;
}
.metabolism .bt-header,
.metabolism .lt-header,
.metabolism .it-header,
.metabolism .st-header,
.metabolism .tt-header,
.metabolism .rt-header {
  font-size: 0.85rem !important;
}
.metabolism .results-header {
  font-size: 0.76rem !important;
}
.metabolism .detail-desc-label {
  font-size: 0.78rem !important;
}
.metabolism .item-qnum {
  font-size: 0.72rem !important;
}

/* ══ Calorie Requirements Table（crt）字級調整 ══ */
.metabolism .crt .tab-title {
  font-size: 1rem !important;
}
.metabolism .crt .tab-sub {
  font-size: 0.76rem !important;
}
.metabolism .crt .pal-name {
  font-size: 0.92rem !important;
}
.metabolism .crt .pal-desc {
  font-size: 0.82rem !important;
  color: var(--vp-c-text-2) !important;
}
.metabolism .crt .age-label {
  font-size: 0.85rem !important;
}
.metabolism .crt .age-val {
  font-size: 1.05rem !important;
  font-weight: 800 !important;
}
.metabolism .crt .age-unit {
  font-size: 0.72rem !important;
}

/* ══════════════ 統一選擇按鈕樣式（以 Calorie Requirements Table 為準）══════════════
   Applies crt's sex-tab / PAL-button look to every metabolism sub-tool.
   Scoped to .tab-toggle so it never touches the wrapper tab bar. */
.metabolism .tab-toggle {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}
.metabolism .tab-toggle .tab-btn {
  flex: 1;
  min-width: 140px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 3px;
  padding: 0.7rem 1rem;
  border-radius: 10px;
  border: 1.5px solid var(--vp-c-divider);
  background: var(--vp-c-bg-soft);
  cursor: pointer;
  font-family: inherit;
  transition: all 0.18s;
}
.metabolism .tab-toggle .tab-btn.tab-active-m {
  border-color: #38bdf8 !important;
  background: rgba(56, 189, 248, 0.06) !important;
}
.metabolism .tab-toggle .tab-btn.tab-active-f {
  border-color: #f472b6 !important;
  background: rgba(244, 114, 182, 0.06) !important;
}
.metabolism .tab-toggle .tab-title {
  font-size: 1rem !important;
  font-weight: 700 !important;
  color: var(--vp-c-text-1);
}
.metabolism .tab-toggle .tab-sub {
  font-size: 0.76rem !important;
  color: var(--vp-c-text-3);
}
.metabolism .tab-toggle .tab-btn.tab-active-m .tab-title {
  color: #38bdf8 !important;
}
.metabolism .tab-toggle .tab-btn.tab-active-f .tab-title {
  color: #f472b6 !important;
}

.metabolism .pal-grid {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 0.5rem;
}
.metabolism .pal-btn {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 0.7rem 0.85rem;
  border-radius: 10px;
  border: 1.5px solid var(--vp-c-divider);
  background: var(--vp-c-bg-soft);
  cursor: pointer;
  font-family: inherit;
  text-align: left;
  transition: all 0.18s;
}
.metabolism .pal-btn.pal-active {
  border-color: #22c55e !important;
  background: rgba(34, 197, 94, 0.06) !important;
}
.metabolism .pal-name {
  font-size: 0.92rem !important;
  font-weight: 700 !important;
  color: var(--vp-c-text-1);
}
.metabolism .pal-desc {
  font-size: 0.82rem !important;
  color: var(--vp-c-text-2) !important;
  line-height: 1.4;
}
.metabolism .pal-btn.pal-active .pal-name {
  color: #22c55e !important;
}
.metabolism .pal-pa {
  font-size: 0.82rem !important;
  color: var(--vp-c-text-2) !important;
}

/* EER 與 Schofield BMR：PAL 卡片改為每列 2 個 */
.metabolism .cal .pal-grid,
.metabolism .sco .pal-grid {
  grid-template-columns: 1fr 1fr;
}
</style>
