<script setup lang="ts">
import { ref, computed } from "vue";

const dizzinessTab = ref<"vertigo" | "dhi">("vertigo");

// ══════════════════════════════════════════════════════════════════
// VERTIGO EVALUATOR
// ══════════════════════════════════════════════════════════════════
type vertigo_MainTab = "triage" | "hints" | "bppv" | "auvp" | "vmmd";
type vertigo_Ans = "yes" | "no" | null;
type vertigo_HintsAns = "central" | "peripheral" | null;
type vertigo_VmMdMode = "vm" | "definite_md" | "probable_md";

const vertigo_activeTab = ref<vertigo_MainTab>("triage");
const vertigo_showResults = ref(false);
const vertigo_copied = ref(false);

function vertigo_switchTab(t: vertigo_MainTab) {
  vertigo_activeTab.value = t;
  vertigo_showResults.value = false;
}

const vertigo_isTabTriage = computed(
  () => vertigo_activeTab.value === "triage",
);
const vertigo_isTabHints = computed(() => vertigo_activeTab.value === "hints");
const vertigo_isTabBppv = computed(() => vertigo_activeTab.value === "bppv");
const vertigo_isTabAuvp = computed(() => vertigo_activeTab.value === "auvp");
const vertigo_isTabVmmd = computed(() => vertigo_activeTab.value === "vmmd");

const vertigo_hintsBadgeClass = computed(() => {
  if (!vertigo_hintsComplete.value) return "tbb-nd";
  return vertigo_hintsResult.value.screen ? "tbb-central" : "tbb-periph";
});
const vertigo_hintsBadgeText = computed(() => {
  if (!vertigo_hintsComplete.value) return vertigo_hintsAnswered.value + "/3";
  return vertigo_hintsResult.value.screen ? "中樞" : "周圍";
});
const vertigo_auvpBadgeClass = computed(() => {
  if (!vertigo_auvpAllComplete.value) return "tbb-nd";
  return vertigo_auvpMetCount.value >= 4 ? "tbb-teal" : "tbb-nd";
});
const vertigo_auvpBadgeText = computed(() => {
  if (!vertigo_auvpAllComplete.value) return vertigo_auvpAnswered.value + "/13";
  return vertigo_auvpMetCount.value + "/5";
});
const vertigo_vmmdBadgeClass = computed(() => {
  if (vertigo_vmmdStrip.value === "purple") return "tbb-purple";
  if (vertigo_vmmdStrip.value === "amber") return "tbb-amber";
  return "tbb-nd";
});
const vertigo_vmmdBadgeText = computed(() => {
  if (vertigo_vmAllComplete.value && vertigo_vmMetCount.value >= 3)
    return vertigo_vmMetCount.value + "/4";
  if (vertigo_mdAllComplete.value && vertigo_mdMetCount.value >= 3)
    return vertigo_mdMetCount.value + "/4";
  if (vertigo_pmAllComplete.value && vertigo_pmMetCount.value === 3)
    return "3/3";
  return "待填";
});

function vertigo_setVmmdMode(m: vertigo_VmMdMode) {
  vertigo_vmmdMode.value = m;
}

const vertigo_vmBadgeClass = computed(() =>
  vertigo_vmAllComplete.value && vertigo_vmMetCount.value >= 3
    ? "tbb-purple"
    : "tbb-nd",
);
const vertigo_vmBadgeText = computed(() =>
  vertigo_vmAllComplete.value
    ? vertigo_vmMetCount.value + "/4"
    : vertigo_vmAns.value + "/8",
);
const vertigo_mdBadgeClass = computed(() =>
  vertigo_mdAllComplete.value && vertigo_mdMetCount.value >= 3
    ? "tbb-amber"
    : "tbb-nd",
);
const vertigo_mdBadgeText = computed(() =>
  vertigo_mdAllComplete.value
    ? vertigo_mdMetCount.value + "/4"
    : vertigo_mdAllAns.value + "/9",
);
const vertigo_pmBadgeClass = computed(() =>
  vertigo_pmAllComplete.value && vertigo_pmMetCount.value === 3
    ? "tbb-amber"
    : "tbb-nd",
);
const vertigo_pmBadgeText = computed(() =>
  vertigo_pmAllComplete.value
    ? vertigo_pmMetCount.value + "/3"
    : vertigo_pmAllAns.value + "/4",
);

// ─────────────────────────────────────────────────────────────────
// TAB 1 · TRIAGE
// ─────────────────────────────────────────────────────────────────
const vertigo_vertigoType = ref<"avs" | "positional" | "episodic" | null>(null);

function vertigo_selectType(t: "avs" | "positional" | "episodic") {
  vertigo_vertigoType.value = t;
  if (t === "avs") vertigo_activeTab.value = "hints";
  else if (t === "positional") vertigo_activeTab.value = "bppv";
  else vertigo_activeTab.value = "vmmd";
  vertigo_showResults.value = false;
}

// ─────────────────────────────────────────────────────────────────
// TAB 2 · HINTS
// ─────────────────────────────────────────────────────────────────
const vertigo_hit = ref<vertigo_HintsAns>(null);
const vertigo_nyst = ref<vertigo_HintsAns>(null);
const vertigo_skew = ref<vertigo_HintsAns>(null);
const vertigo_hearing = ref<vertigo_Ans>(null);

const vertigo_hintsComplete = computed(
  () =>
    vertigo_hit.value !== null &&
    vertigo_nyst.value !== null &&
    vertigo_skew.value !== null,
);
const vertigo_hintsAnswered = computed(
  () =>
    [vertigo_hit.value, vertigo_nyst.value, vertigo_skew.value].filter(
      (v) => v !== null,
    ).length,
);
const vertigo_centralCount = computed(
  () =>
    [
      vertigo_hit.value === "central",
      vertigo_nyst.value === "central",
      vertigo_skew.value === "central",
    ].filter(Boolean).length,
);

const vertigo_hintsResult = computed(() => {
  if (!vertigo_hintsComplete.value)
    return { level: "填寫中", color: "filling", screen: false, advice: "" };
  if (vertigo_centralCount.value >= 1)
    return {
      level: "HINTS 中樞性（中風高風險）",
      color: "critical",
      screen: true,
      advice:
        "HINTS 陽性：存在中樞性體徵，敏感性 94–100%。建議立即神經科評估，急診腦部 MRI（含 DWI），啟動急性中風流程。HINTS 準確度優於發病 24–48 小時內的早期 DWI-MRI。",
    };
  return {
    level: "HINTS 周圍性（前庭神經炎可能）",
    color: "normal",
    screen: false,
    advice:
      "HINTS 三項均為周圍性，高度提示周圍性病因（前庭神經炎/迷路炎）。若有新出現單側聽力損失，需考慮 AICA 梗塞（HINTS Plus 陽性）。確認後可進一步以下方 AUVP 標準確立診斷。",
  };
});

const vertigo_hintsPlus = computed(() => {
  if (!vertigo_hintsComplete.value || vertigo_hintsResult.value.screen)
    return null;
  return vertigo_hearing.value === "yes"
    ? "新出現單側聽力損失 → 考慮 AICA 梗塞（HINTS Plus 陽性），建議影像學檢查"
    : null;
});

// ─────────────────────────────────────────────────────────────────
// TAB 3 · BPPV
// ─────────────────────────────────────────────────────────────────
const vertigo_posVert = ref<vertigo_Ans>(null);
const vertigo_latency = ref<vertigo_Ans>(null);
const vertigo_limited = ref<vertigo_Ans>(null);
const vertigo_fatigue = ref<vertigo_Ans>(null);
const vertigo_dhR = ref<vertigo_Ans>(null);
const vertigo_dhL = ref<vertigo_Ans>(null);
const vertigo_nystType = ref<
  "upbeat_torsional" | "downbeat_torsional" | "horizontal" | "none" | null
>(null);
const vertigo_rollTest = ref<"geotropic" | "apogeotropic" | "negative" | null>(
  null,
);
const vertigo_heavierSide = ref<"right" | "left" | null>(null);

const vertigo_bppvStep1Complete = computed(
  () =>
    vertigo_posVert.value !== null &&
    vertigo_latency.value !== null &&
    vertigo_limited.value !== null &&
    vertigo_fatigue.value !== null,
);
const vertigo_isPositional = computed(
  () =>
    vertigo_posVert.value === "yes" &&
    vertigo_latency.value === "yes" &&
    vertigo_limited.value === "yes",
);
const vertigo_dixAnyPos = computed(
  () => vertigo_dhR.value === "yes" || vertigo_dhL.value === "yes",
);
const vertigo_positiveSide = computed(() =>
  vertigo_dhR.value === "yes"
    ? "right"
    : vertigo_dhL.value === "yes"
      ? "left"
      : null,
);

const vertigo_canal = computed(() => {
  if (!vertigo_bppvStep1Complete.value || !vertigo_isPositional.value)
    return null;
  if (vertigo_nystType.value === "upbeat_torsional" && vertigo_dixAnyPos.value)
    return "posterior";
  if (
    vertigo_nystType.value === "downbeat_torsional" &&
    vertigo_dixAnyPos.value
  )
    return "anterior";
  if (
    vertigo_nystType.value === "horizontal" ||
    vertigo_rollTest.value !== null
  )
    return "horizontal";
  if (vertigo_nystType.value === "none") return "unclear";
  return null;
});
const vertigo_subtype = computed(() => {
  if (vertigo_canal.value === "horizontal") {
    if (vertigo_rollTest.value === "geotropic") return "canalolithiasis";
    if (vertigo_rollTest.value === "apogeotropic") return "cupulolithiasis";
  }
  return "canalolithiasis";
});
const vertigo_bppvResult = computed(() => {
  if (!vertigo_bppvStep1Complete.value)
    return { level: "填寫中", color: "filling", dx: "", advice: "" };
  if (!vertigo_isPositional.value)
    return {
      level: "不符合 BPPV 表現",
      color: "normal",
      dx: "",
      advice:
        "症狀特徵不符合 BPPV 診斷標準。請考慮其他眩暈原因（前庭神經炎、梅尼爾氏症、中樞性眩暈等）。",
    };
  if (vertigo_canal.value === "posterior")
    return {
      level: "後半規管 BPPV（PC-BPPV）— 管石症",
      color: "moderate",
      dx: `PC-BPPV（${vertigo_positiveSide.value === "right" ? "右" : "左"}側）`,
      advice: `後半規管 BPPV：${vertigo_positiveSide.value === "right" ? "右側" : "左側"} Dix-Hallpike 陽性，向上跳動兼旋轉性眼振。治療首選：Epley 復位術（患側）。成功率約 90%。`,
    };
  if (vertigo_canal.value === "anterior")
    return {
      level: "前半規管 BPPV（AC-BPPV）— 極罕見",
      color: "moderate",
      dx: "AC-BPPV（罕見）",
      advice:
        "前半規管 BPPV 極罕見（< 1%），出現向下跳動兼旋轉性眼振。需排除小腦梗塞等中樞病變。",
    };
  if (vertigo_canal.value === "horizontal") {
    if (vertigo_subtype.value === "canalolithiasis")
      return {
        level: "水平半規管 BPPV — 管石症（Geotropic）",
        color: "moderate",
        dx: "HC-BPPV（管石症）",
        advice: `HC-BPPV 管石症：地向性雙向水平眼振，眼振較強側（${vertigo_heavierSide.value === "right" ? "右" : vertigo_heavierSide.value === "left" ? "左" : "未確認"}側）為患側。治療：Lempert 360° 滾轉法或 Gufoni 復位術。`,
      };
    return {
      level: "水平半規管 BPPV — 壺腹石症（Apogeotropic）",
      color: "moderate",
      dx: "HC-BPPV（壺腹石症）",
      advice:
        "HC-BPPV 壺腹石症：背地性持續水平眼振。治療：Gufoni 法或強迫體位法（患側朝下）。",
    };
  }
  if (vertigo_canal.value === "unclear")
    return {
      level: "位置性眩暈 — 暫無法確認半規管",
      color: "mild",
      dx: "",
      advice:
        "位置性眩暈特徵符合，但 Dix-Hallpike 未誘發眼振。建議重複測試及 Roll Test，或已自然緩解。",
    };
  return {
    level: "疑似 BPPV — 請完成進一步測試",
    color: "mild",
    dx: "",
    advice: "請完成 Dix-Hallpike 及眼振類型評估。",
  };
});

// ─────────────────────────────────────────────────────────────────
// TAB 4 · AUVP
// ─────────────────────────────────────────────────────────────────
const vertigo_aa1 = ref<vertigo_Ans>(null);
const vertigo_aa2 = ref<vertigo_Ans>(null);
const vertigo_aa3 = ref<vertigo_Ans>(null);

const vertigo_ab1 = ref<vertigo_Ans>(null);
const vertigo_ab2 = ref<vertigo_Ans>(null);
const vertigo_ab3 = ref<vertigo_Ans>(null);
const vertigo_ab4 = ref<vertigo_Ans>(null);

const vertigo_ac1 = ref<vertigo_Ans>(null);
const vertigo_ac2 = ref<vertigo_Ans>(null);

const vertigo_ad1 = ref<vertigo_Ans>(null);
const vertigo_ad2 = ref<vertigo_Ans>(null);
const vertigo_ad3 = ref<vertigo_Ans>(null);

const vertigo_ae1 = ref<vertigo_Ans>(null);

const vertigo_auvpAnswered = computed(
  () =>
    [
      vertigo_aa1,
      vertigo_aa2,
      vertigo_aa3,
      vertigo_ab1,
      vertigo_ab2,
      vertigo_ab3,
      vertigo_ab4,
      vertigo_ac1,
      vertigo_ac2,
      vertigo_ad1,
      vertigo_ad2,
      vertigo_ad3,
      vertigo_ae1,
    ].filter((v) => v.value !== null).length,
);
const vertigo_aAComplete = computed(
  () =>
    vertigo_aa1.value !== null &&
    vertigo_aa2.value !== null &&
    vertigo_aa3.value !== null,
);
const vertigo_aBComplete = computed(
  () =>
    vertigo_ab1.value !== null &&
    vertigo_ab2.value !== null &&
    vertigo_ab3.value !== null &&
    vertigo_ab4.value !== null,
);
const vertigo_aCComplete = computed(
  () => vertigo_ac1.value !== null && vertigo_ac2.value !== null,
);
const vertigo_aDComplete = computed(
  () =>
    vertigo_ad1.value !== null &&
    vertigo_ad2.value !== null &&
    vertigo_ad3.value !== null,
);
const vertigo_aEComplete = computed(() => vertigo_ae1.value !== null);
const vertigo_auvpAllComplete = computed(
  () =>
    vertigo_aAComplete.value &&
    vertigo_aBComplete.value &&
    vertigo_aCComplete.value &&
    vertigo_aDComplete.value &&
    vertigo_aEComplete.value,
);

const vertigo_aAMet = computed(
  () => vertigo_aa1.value === "yes" && vertigo_aa2.value === "yes",
);
const vertigo_aBMet = computed(
  () =>
    vertigo_ab1.value === "yes" &&
    vertigo_ab2.value === "yes" &&
    vertigo_ab3.value === "yes" &&
    vertigo_ab4.value === "yes",
);
const vertigo_aCMet = computed(
  () => vertigo_ac1.value === "yes" && vertigo_ac2.value === "yes",
);
const vertigo_aDMet = computed(
  () =>
    vertigo_ad1.value === "yes" &&
    vertigo_ad2.value === "yes" &&
    vertigo_ad3.value === "yes",
);
const vertigo_aEMet = computed(() => vertigo_ae1.value === "yes");
const vertigo_auvpMetCount = computed(
  () =>
    [
      vertigo_aAMet.value,
      vertigo_aBMet.value,
      vertigo_aCMet.value,
      vertigo_aDMet.value,
      vertigo_aEMet.value,
    ].filter(Boolean).length,
);

const vertigo_auvpResult = computed(() => {
  if (!vertigo_auvpAllComplete.value)
    return { level: "填寫中", color: "filling", dx: "", advice: "" };
  if (
    vertigo_aAMet.value &&
    vertigo_aBMet.value &&
    vertigo_aCMet.value &&
    vertigo_aDMet.value &&
    vertigo_aEMet.value
  )
    return {
      level: "符合確定急性單側前庭病變（Definite AUVP）診斷標準",
      color: "teal",
      dx: "確定 AUVP",
      advice:
        "符合 Bárány Society 確定 AUVP 完整標準。治療：Methylprednisolone 100mg/day 遞減 3 週（可加速恢復）；急性期短程前庭抑制劑（≤3天）；恢復期前庭復健運動。勿過度使用前庭抑制劑以免延遲中樞代償。若有聽力損失則診斷為迷路炎（Labyrinthitis）。",
    };
  const missing = 5 - vertigo_auvpMetCount.value;
  if (missing === 1)
    return {
      level: "可能急性單側前庭病變（Probable AUVP）— 1 項未達標",
      color: "mild",
      dx: "Probable AUVP",
      advice:
        "符合 Probable AUVP（4/5 達標）。建議追蹤，並視臨床演進補充缺乏標準之評估（如 caloric 測試、vHIT）。",
    };
  return {
    level: "不符合急性單側前庭病變診斷標準",
    color: "normal",
    dx: "",
    advice:
      "不符合 AUVP/前庭神經炎。請重新考慮 HINTS（是否已排除中風？）或其他前庭診斷。",
  };
});

// ─────────────────────────────────────────────────────────────────
// TAB 5 · VM / MD
// ─────────────────────────────────────────────────────────────────
const vertigo_vmmdMode = ref<vertigo_VmMdMode>("vm");

// ── Vestibular Migraine ──────────────────────────────────────────
const vertigo_vma1 = ref<vertigo_Ans>(null);
const vertigo_vma2 = ref<vertigo_Ans>(null);
const vertigo_vma3 = ref<vertigo_Ans>(null);
const vertigo_vmb1 = ref<vertigo_Ans>(null);
const vertigo_vmc1 = ref<vertigo_Ans>(null);
const vertigo_vmc2 = ref<vertigo_Ans>(null);
const vertigo_vmc3 = ref<vertigo_Ans>(null);
const vertigo_vmd1 = ref<vertigo_Ans>(null);

const vertigo_vmAns = computed(
  () =>
    [
      vertigo_vma1,
      vertigo_vma2,
      vertigo_vma3,
      vertigo_vmb1,
      vertigo_vmc1,
      vertigo_vmc2,
      vertigo_vmc3,
      vertigo_vmd1,
    ].filter((v) => v.value !== null).length,
);
const vertigo_vmAllComplete = computed(() => vertigo_vmAns.value === 8);
const vertigo_vmAMet = computed(
  () => vertigo_vma1.value === "yes" && vertigo_vma2.value === "yes",
);
const vertigo_vmBMet = computed(() => vertigo_vmb1.value === "yes");
const vertigo_vmCMet = computed(
  () =>
    vertigo_vmc1.value === "yes" ||
    vertigo_vmc2.value === "yes" ||
    vertigo_vmc3.value === "yes",
);
const vertigo_vmDMet = computed(() => vertigo_vmd1.value === "yes");
const vertigo_vmMetCount = computed(
  () =>
    [
      vertigo_vmAMet.value,
      vertigo_vmBMet.value,
      vertigo_vmCMet.value,
      vertigo_vmDMet.value,
    ].filter(Boolean).length,
);

const vertigo_vmResult = computed(() => {
  if (!vertigo_vmAllComplete.value)
    return { level: "填寫中", color: "filling", dx: "", advice: "" };
  if (
    vertigo_vmAMet.value &&
    vertigo_vmBMet.value &&
    vertigo_vmCMet.value &&
    vertigo_vmDMet.value
  )
    return {
      level: "符合前庭性偏頭痛（Vestibular Migraine）診斷標準",
      color: "purple",
      dx: "VM",
      advice:
        "符合 Bárány Society/IHS 完整 VM 診斷標準。急性期：曲坦類（triptans）或止吐藥；預防性：心得安、托吡酯或 Amitriptyline；生活調整：規律作息、避免誘因（睡眠不足、壓力、特定食物）。",
    };
  if (vertigo_vmMetCount.value === 3)
    return {
      level: "可能前庭性偏頭痛（Probable VM）",
      color: "mild",
      dx: "Probable VM",
      advice:
        "符合 Probable VM（3/4 達標）。建議頭痛日誌記錄，神經科追蹤，觀察是否進展至完整 VM。",
    };
  return {
    level: "不符合前庭性偏頭痛診斷標準",
    color: "normal",
    dx: "",
    advice: "請考慮梅尼爾氏症或其他反覆性眩暈病因。",
  };
});

// ── Definite Ménière's Disease ───────────────────────────────────
const vertigo_mda1 = ref<vertigo_Ans>(null);
const vertigo_mda2 = ref<vertigo_Ans>(null);
const vertigo_mdb1 = ref<vertigo_Ans>(null);
const vertigo_mdb2 = ref<vertigo_Ans>(null);
const vertigo_mdb3 = ref<vertigo_Ans>(null);
const vertigo_mdc1 = ref<vertigo_Ans>(null);
const vertigo_mdc2 = ref<vertigo_Ans>(null);
const vertigo_mdc3 = ref<vertigo_Ans>(null);
const vertigo_mdd1 = ref<vertigo_Ans>(null);

const vertigo_mdAllAns = computed(
  () =>
    [
      vertigo_mda1,
      vertigo_mda2,
      vertigo_mdb1,
      vertigo_mdb2,
      vertigo_mdb3,
      vertigo_mdc1,
      vertigo_mdc2,
      vertigo_mdc3,
      vertigo_mdd1,
    ].filter((v) => v.value !== null).length,
);
const vertigo_mdAllComplete = computed(() => vertigo_mdAllAns.value === 9);
const vertigo_mdAMet = computed(
  () => vertigo_mda1.value === "yes" && vertigo_mda2.value === "yes",
);
const vertigo_mdBMet = computed(
  () =>
    vertigo_mdb1.value === "yes" &&
    vertigo_mdb2.value === "yes" &&
    vertigo_mdb3.value === "yes",
);
const vertigo_mdCMet = computed(
  () =>
    vertigo_mdc1.value === "yes" ||
    vertigo_mdc2.value === "yes" ||
    vertigo_mdc3.value === "yes",
);
const vertigo_mdDMet = computed(() => vertigo_mdd1.value === "yes");
const vertigo_mdMetCount = computed(
  () =>
    [
      vertigo_mdAMet.value,
      vertigo_mdBMet.value,
      vertigo_mdCMet.value,
      vertigo_mdDMet.value,
    ].filter(Boolean).length,
);

const vertigo_mdResult = computed(() => {
  if (!vertigo_mdAllComplete.value)
    return { level: "填寫中", color: "filling", dx: "", advice: "" };
  if (
    vertigo_mdAMet.value &&
    vertigo_mdBMet.value &&
    vertigo_mdCMet.value &&
    vertigo_mdDMet.value
  )
    return {
      level: "符合確定梅尼爾氏症（Definite Ménière's Disease）診斷標準",
      color: "amber",
      dx: "確定 MD",
      advice:
        "符合 Bárány Society 確定 MD。建議：低鹽飲食（<1500mg/day）、利尿劑（acetazolamide）；急性期前庭抑制劑；反覆發作考慮鼓室注射 dexamethasone 或 gentamicin；MRI 排除繼發性病因。",
    };
  if (vertigo_mdMetCount.value >= 3)
    return {
      level: "可能確定梅尼爾氏症（1 項未完全達標）",
      color: "mild",
      dx: "可能確定 MD",
      advice:
        "3/4 達標，高度懷疑確定 MD。建議補充純音聽力圖確認低頻 SNHL，耳鼻喉科追蹤。",
    };
  return {
    level: "不符合確定梅尼爾氏症診斷標準",
    color: "normal",
    dx: "",
    advice: "請評估是否符合 Probable MD，或考慮前庭性偏頭痛。",
  };
});

// ── Probable Ménière's Disease ───────────────────────────────────
const vertigo_pma1 = ref<vertigo_Ans>(null);
const vertigo_pma2 = ref<vertigo_Ans>(null);
const vertigo_pmb1 = ref<vertigo_Ans>(null);
const vertigo_pmc1 = ref<vertigo_Ans>(null);

const vertigo_pmAllAns = computed(
  () =>
    [vertigo_pma1, vertigo_pma2, vertigo_pmb1, vertigo_pmc1].filter(
      (v) => v.value !== null,
    ).length,
);
const vertigo_pmAllComplete = computed(() => vertigo_pmAllAns.value === 4);
const vertigo_pmAMet = computed(
  () => vertigo_pma1.value === "yes" && vertigo_pma2.value === "yes",
);
const vertigo_pmBMet = computed(() => vertigo_pmb1.value === "yes");
const vertigo_pmCMet = computed(() => vertigo_pmc1.value === "yes");
const vertigo_pmMetCount = computed(
  () =>
    [vertigo_pmAMet.value, vertigo_pmBMet.value, vertigo_pmCMet.value].filter(
      Boolean,
    ).length,
);

const vertigo_pmResult = computed(() => {
  if (!vertigo_pmAllComplete.value)
    return { level: "填寫中", color: "filling", dx: "", advice: "" };
  if (vertigo_pmAMet.value && vertigo_pmBMet.value && vertigo_pmCMet.value)
    return {
      level: "符合可能梅尼爾氏症（Probable Ménière's Disease）診斷標準",
      color: "amber",
      dx: "Probable MD",
      advice:
        "符合 Probable MD。建議純音聽力圖、耳蝸電圖（ECoG）評估；低鹽飲食；耳鼻喉科追蹤是否進展至 Definite MD。",
    };
  return {
    level: "不符合可能梅尼爾氏症診斷標準",
    color: "normal",
    dx: "",
    advice: "不符合 Probable MD。請考慮前庭性偏頭痛、BPPV 或其他眩暈病因。",
  };
});

// ─────────────────────────────────────────────────────────────────
// Shared helpers
// ─────────────────────────────────────────────────────────────────
function vertigo_reset() {
  vertigo_vertigoType.value = null;
  vertigo_hit.value =
    vertigo_nyst.value =
    vertigo_skew.value =
    vertigo_hearing.value =
      null;
  vertigo_posVert.value =
    vertigo_latency.value =
    vertigo_limited.value =
    vertigo_fatigue.value =
      null;
  vertigo_dhR.value = vertigo_dhL.value = null;
  vertigo_nystType.value = vertigo_rollTest.value = null;
  vertigo_heavierSide.value = null;
  [
    vertigo_aa1,
    vertigo_aa2,
    vertigo_aa3,
    vertigo_ab1,
    vertigo_ab2,
    vertigo_ab3,
    vertigo_ab4,
    vertigo_ac1,
    vertigo_ac2,
    vertigo_ad1,
    vertigo_ad2,
    vertigo_ad3,
    vertigo_ae1,
  ].forEach((v) => {
    v.value = null;
  });
  [
    vertigo_vma1,
    vertigo_vma2,
    vertigo_vma3,
    vertigo_vmb1,
    vertigo_vmc1,
    vertigo_vmc2,
    vertigo_vmc3,
    vertigo_vmd1,
  ].forEach((v) => {
    v.value = null;
  });
  [
    vertigo_mda1,
    vertigo_mda2,
    vertigo_mdb1,
    vertigo_mdb2,
    vertigo_mdb3,
    vertigo_mdc1,
    vertigo_mdc2,
    vertigo_mdc3,
    vertigo_mdd1,
  ].forEach((v) => {
    v.value = null;
  });
  [vertigo_pma1, vertigo_pma2, vertigo_pmb1, vertigo_pmc1].forEach((v) => {
    v.value = null;
  });
  vertigo_activeTab.value = "triage";
  vertigo_showResults.value = false;
  vertigo_vmmdMode.value = "vm";
}

function vertigo_generateMarkdown(): string {
  const lines: string[] = ["# 急性眩暈整合鑑別診斷評估\n"];
  lines.push(
    `## 眩暈分流\n類型：${vertigo_vertigoType.value === "avs" ? "急性持續性（AVS）" : vertigo_vertigoType.value === "positional" ? "位置性" : vertigo_vertigoType.value === "episodic" ? "反覆發作性" : "未選擇"}\n`,
  );
  if (vertigo_hintsComplete.value) {
    lines.push(
      `## HINTS 眼動檢查\n- H 頭部衝擊：${vertigo_hit.value === "central" ? "正常HIT（中樞）" : "異常HIT（周圍）"}\n- I 眼振方向：${vertigo_nyst.value === "central" ? "方向改變（中樞）" : "單一方向（周圍）"}\n- N 斜偏：${vertigo_skew.value === "central" ? "斜偏存在（中樞）" : "無斜偏（周圍）"}\n**結果：${vertigo_hintsResult.value.level}**\n${vertigo_hintsResult.value.advice}\n`,
    );
  }
  if (vertigo_bppvStep1Complete.value) {
    lines.push(
      `## BPPV 評估\n**結果：${vertigo_bppvResult.value.level}**\n${vertigo_bppvResult.value.advice}\n`,
    );
  }
  if (vertigo_auvpAllComplete.value) {
    lines.push(
      `## AUVP/前庭神經炎\n達標：${vertigo_auvpMetCount.value}/5\n**結果：${vertigo_auvpResult.value.level}**\n${vertigo_auvpResult.value.advice}\n`,
    );
  }
  if (vertigo_vmAllComplete.value) {
    lines.push(
      `## 前庭性偏頭痛\n達標：${vertigo_vmMetCount.value}/4\n**結果：${vertigo_vmResult.value.level}**\n${vertigo_vmResult.value.advice}\n`,
    );
  }
  if (vertigo_mdAllComplete.value) {
    lines.push(
      `## 確定梅尼爾氏症\n達標：${vertigo_mdMetCount.value}/4\n**結果：${vertigo_mdResult.value.level}**\n${vertigo_mdResult.value.advice}\n`,
    );
  }
  if (vertigo_pmAllComplete.value) {
    lines.push(
      `## 可能梅尼爾氏症\n達標：${vertigo_pmMetCount.value}/3\n**結果：${vertigo_pmResult.value.level}**\n${vertigo_pmResult.value.advice}\n`,
    );
  }
  return lines.join("\n");
}

async function copyOutput() {
  await navigator.clipboard.writeText(vertigo_generateMarkdown());
  vertigo_copied.value = true;
  setTimeout(() => {
    vertigo_copied.value = false;
  }, 2000);
}

const vertigo_hintsStrip = computed(() =>
  vertigo_hintsComplete.value
    ? vertigo_hintsResult.value.screen
      ? "critical"
      : "ok"
    : "nd",
);
const vertigo_bppvStrip = computed(() => {
  if (!vertigo_bppvStep1Complete.value) return "nd";
  if (!vertigo_isPositional.value) return "fail";
  return vertigo_canal.value ? "bppv" : "ok";
});
const vertigo_auvpStrip = computed(() =>
  vertigo_auvpAllComplete.value
    ? vertigo_auvpMetCount.value >= 4
      ? "teal"
      : "nd"
    : "nd",
);
const vertigo_vmmdStrip = computed(() => {
  if (vertigo_vmAllComplete.value && vertigo_vmMetCount.value >= 3)
    return "purple";
  if (
    (vertigo_mdAllComplete.value && vertigo_mdMetCount.value >= 3) ||
    (vertigo_pmAllComplete.value && vertigo_pmMetCount.value === 3)
  )
    return "amber";
  return "nd";
});

const vertigo_hintsStripClass = computed(
  () => `strip-card sc-${vertigo_hintsStrip.value}`,
);
const vertigo_bppvStripClass = computed(
  () => `strip-card sc-${vertigo_bppvStrip.value}`,
);
const vertigo_auvpStripClass = computed(
  () => `strip-card sc-${vertigo_auvpStrip.value}`,
);
const vertigo_vmmdStripClass = computed(
  () => `strip-card sc-${vertigo_vmmdStrip.value}`,
);

const vertigo_hintsStripVal = computed(() =>
  vertigo_hintsComplete.value
    ? vertigo_hintsResult.value.screen
      ? "⚠"
      : "✓"
    : "—",
);
const vertigo_hintsStripSub = computed(() =>
  vertigo_hintsComplete.value
    ? vertigo_hintsResult.value.screen
      ? "中樞性"
      : "周圍性"
    : "排除中風",
);
const vertigo_bppvStripVal = computed(() => {
  if (!vertigo_bppvStep1Complete.value) return "—";
  if (!vertigo_isPositional.value) return "✗";
  return vertigo_canal.value
    ? vertigo_canal.value.substring(0, 2).toUpperCase()
    : "✓";
});
const vertigo_bppvStripSub = computed(() => {
  if (!vertigo_bppvStep1Complete.value) return "位置性";
  if (!vertigo_isPositional.value) return "不符合";
  return vertigo_canal.value
    ? vertigo_bppvResult.value.dx.substring(0, 6)
    : "符合";
});
const vertigo_auvpStripVal = computed(() =>
  vertigo_auvpAllComplete.value ? vertigo_auvpMetCount.value + "/5" : "—",
);
const vertigo_auvpStripSub = computed(() =>
  vertigo_auvpAllComplete.value
    ? vertigo_auvpResult.value.dx || "未達"
    : "前庭神經炎",
);
const vertigo_vmmdStripVal = computed(() => {
  if (vertigo_vmAllComplete.value && vertigo_vmMetCount.value >= 3)
    return vertigo_vmMetCount.value + "/4";
  if (vertigo_mdAllComplete.value && vertigo_mdMetCount.value >= 3)
    return vertigo_mdMetCount.value + "/4";
  if (vertigo_pmAllComplete.value && vertigo_pmMetCount.value === 3)
    return "3/3";
  return "—";
});
const vertigo_vmmdStripSub = computed(() => {
  if (vertigo_vmAllComplete.value && vertigo_vmMetCount.value >= 3)
    return vertigo_vmResult.value.dx;
  if (vertigo_mdAllComplete.value && vertigo_mdMetCount.value >= 3)
    return vertigo_mdResult.value.dx;
  if (vertigo_pmAllComplete.value && vertigo_pmMetCount.value === 3)
    return vertigo_pmResult.value.dx;
  return "反覆性眩暈";
});

const vertigo_canShowResults = computed(() => {
  if (vertigo_activeTab.value === "hints") return vertigo_hintsComplete.value;
  if (vertigo_activeTab.value === "bppv")
    return vertigo_bppvStep1Complete.value;
  if (vertigo_activeTab.value === "auvp") return vertigo_auvpAllComplete.value;
  if (vertigo_activeTab.value === "vmmd") {
    if (vertigo_vmmdMode.value === "vm") return vertigo_vmAllComplete.value;
    if (vertigo_vmmdMode.value === "definite_md")
      return vertigo_mdAllComplete.value;
    return vertigo_pmAllComplete.value;
  }
  return false;
});
const vertigo_canCopy = computed(() => vertigo_canShowResults.value);

const vertigo_badgeClass = computed(() => {
  if (vertigo_activeTab.value === "triage") return "filling";
  if (vertigo_activeTab.value === "hints")
    return vertigo_hintsResult.value.color;
  if (vertigo_activeTab.value === "bppv") return vertigo_bppvResult.value.color;
  if (vertigo_activeTab.value === "auvp") return vertigo_auvpResult.value.color;
  if (vertigo_vmmdMode.value === "vm") return vertigo_vmResult.value.color;
  if (vertigo_vmmdMode.value === "definite_md")
    return vertigo_mdResult.value.color;
  return vertigo_pmResult.value.color;
});
const vertigo_badgeTop = computed(() => {
  const m: Record<string, string> = {
    triage: "分流",
    hints: "HINTS",
    bppv: "BPPV",
    auvp: "AUVP",
    vmmd: "VM/MD",
  };
  return m[vertigo_activeTab.value] ?? "VM/MD";
});
const vertigo_badgeNum = computed(() => {
  if (vertigo_activeTab.value === "triage")
    return vertigo_vertigoType.value ? "→" : "—";
  if (vertigo_activeTab.value === "hints")
    return vertigo_hintsComplete.value
      ? vertigo_hintsResult.value.screen
        ? "⚠"
        : "✓"
      : "—";
  if (vertigo_activeTab.value === "bppv")
    return vertigo_canal.value
      ? vertigo_canal.value.substring(0, 2).toUpperCase()
      : "—";
  if (vertigo_activeTab.value === "auvp")
    return vertigo_auvpAllComplete.value
      ? String(vertigo_auvpMetCount.value)
      : "—";
  if (vertigo_vmmdMode.value === "vm")
    return vertigo_vmAllComplete.value ? String(vertigo_vmMetCount.value) : "—";
  if (vertigo_vmmdMode.value === "definite_md")
    return vertigo_mdAllComplete.value ? String(vertigo_mdMetCount.value) : "—";
  return vertigo_pmAllComplete.value ? String(vertigo_pmMetCount.value) : "—";
});
const vertigo_badgeUnit = computed(() => {
  if (vertigo_activeTab.value === "auvp" && vertigo_auvpAllComplete.value)
    return "/5";
  if (vertigo_activeTab.value === "vmmd") {
    if (
      vertigo_vmAllComplete.value ||
      vertigo_mdAllComplete.value ||
      vertigo_pmAllComplete.value
    )
      return vertigo_vmmdMode.value === "probable_md" ? "/3" : "/4";
  }
  return "";
});
const vertigo_badgeBot = computed(() => {
  if (vertigo_activeTab.value === "triage") {
    const m: Record<string, string> = {
      avs: "AVS",
      positional: "位置性",
      episodic: "反覆性",
    };
    return vertigo_vertigoType.value
      ? (m[vertigo_vertigoType.value] ?? "待分流")
      : "待分流";
  }
  if (vertigo_activeTab.value === "hints")
    return vertigo_hintsComplete.value
      ? vertigo_hintsResult.value.screen
        ? "中樞性"
        : "周圍性"
      : vertigo_hintsAnswered.value + "/3";
  if (vertigo_activeTab.value === "bppv")
    return vertigo_canal.value
      ? vertigo_bppvResult.value.dx.substring(0, 14)
      : "填寫中";
  if (vertigo_activeTab.value === "auvp")
    return vertigo_auvpAllComplete.value
      ? vertigo_auvpResult.value.dx ||
          vertigo_auvpResult.value.level.substring(0, 10)
      : vertigo_auvpAnswered.value + "/13";
  if (vertigo_vmmdMode.value === "vm")
    return vertigo_vmAllComplete.value
      ? vertigo_vmResult.value.dx || "VM"
      : "填" + vertigo_vmAns.value + "/8";
  if (vertigo_vmmdMode.value === "definite_md")
    return vertigo_mdAllComplete.value
      ? vertigo_mdResult.value.dx || "MD"
      : "填" + vertigo_mdAllAns.value + "/9";
  return vertigo_pmAllComplete.value
    ? vertigo_pmResult.value.dx || "pMD"
    : "填" + vertigo_pmAllAns.value + "/4";
});

// ─────────────────────────────────────────────────────────────────
// Pre-computed for VM sub-score row  ← FIX: no .value in template
// ─────────────────────────────────────────────────────────────────
const vertigo_vmSSA = computed(() =>
  vertigo_vma1.value === null
    ? "ss-nd"
    : vertigo_vmAMet.value
      ? "ss-purple"
      : "ss-fail",
);
const vertigo_vmSSAv = computed(() =>
  vertigo_vma1.value === null ? "—" : vertigo_vmAMet.value ? "✓" : "✗",
);
const vertigo_vmSSB = computed(() =>
  vertigo_vmb1.value === null
    ? "ss-nd"
    : vertigo_vmBMet.value
      ? "ss-purple"
      : "ss-fail",
);
const vertigo_vmSSBv = computed(() =>
  vertigo_vmb1.value === null ? "—" : vertigo_vmBMet.value ? "✓" : "✗",
);
const vertigo_vmSSC = computed(() =>
  vertigo_vmc1.value === null
    ? "ss-nd"
    : vertigo_vmCMet.value
      ? "ss-purple"
      : "ss-fail",
);
const vertigo_vmSSCv = computed(() =>
  vertigo_vmc1.value === null ? "—" : vertigo_vmCMet.value ? "✓" : "✗",
);
const vertigo_vmSSD = computed(() =>
  vertigo_vmd1.value === null
    ? "ss-nd"
    : vertigo_vmDMet.value
      ? "ss-purple"
      : "ss-fail",
);
const vertigo_vmSSDv = computed(() =>
  vertigo_vmd1.value === null ? "—" : vertigo_vmDMet.value ? "✓" : "✗",
);

// Pre-computed for VM group-header tallies
const vertigo_vmATallyClass = computed(() =>
  vertigo_vma1.value !== null &&
  vertigo_vma2.value !== null &&
  vertigo_vma3.value !== null
    ? vertigo_vmAMet.value
      ? "tally-ok"
      : "tally-abn"
    : "tally-nd",
);
const vertigo_vmATallyText = computed(() =>
  vertigo_vma1.value !== null &&
  vertigo_vma2.value !== null &&
  vertigo_vma3.value !== null
    ? vertigo_vmAMet.value
      ? "✓"
      : "✗"
    : "—",
);
const vertigo_vmCTallyClass = computed(() =>
  vertigo_vmc1.value !== null &&
  vertigo_vmc2.value !== null &&
  vertigo_vmc3.value !== null
    ? vertigo_vmCMet.value
      ? "tally-ok"
      : "tally-abn"
    : "tally-nd",
);
const vertigo_vmCTallyText = computed(() =>
  vertigo_vmc1.value !== null &&
  vertigo_vmc2.value !== null &&
  vertigo_vmc3.value !== null
    ? vertigo_vmCMet.value
      ? "✓ ≥1項"
      : "✗"
    : "—",
);

// ─────────────────────────────────────────────────────────────────
// Pre-computed for Definite MD sub-score row  ← FIX: no .value in template
// ─────────────────────────────────────────────────────────────────
const vertigo_mdSSA = computed(() =>
  vertigo_mda1.value === null
    ? "ss-nd"
    : vertigo_mdAMet.value
      ? "ss-amber"
      : "ss-fail",
);
const vertigo_mdSSAv = computed(() =>
  vertigo_mda1.value === null ? "—" : vertigo_mdAMet.value ? "✓" : "✗",
);
const vertigo_mdSSB = computed(() =>
  vertigo_mdb1.value === null
    ? "ss-nd"
    : vertigo_mdBMet.value
      ? "ss-amber"
      : "ss-fail",
);
const vertigo_mdSSBv = computed(() =>
  vertigo_mdb1.value === null ? "—" : vertigo_mdBMet.value ? "✓" : "✗",
);
const vertigo_mdSSC = computed(() =>
  vertigo_mdc1.value === null
    ? "ss-nd"
    : vertigo_mdCMet.value
      ? "ss-amber"
      : "ss-fail",
);
const vertigo_mdSSCv = computed(() =>
  vertigo_mdc1.value === null ? "—" : vertigo_mdCMet.value ? "✓" : "✗",
);
const vertigo_mdSSD = computed(() =>
  vertigo_mdd1.value === null
    ? "ss-nd"
    : vertigo_mdDMet.value
      ? "ss-amber"
      : "ss-fail",
);
const vertigo_mdSSDv = computed(() =>
  vertigo_mdd1.value === null ? "—" : vertigo_mdDMet.value ? "✓" : "✗",
);

// Pre-computed for MD group-header tallies
const vertigo_mdBTallyClass = computed(() =>
  vertigo_mdb1.value !== null &&
  vertigo_mdb2.value !== null &&
  vertigo_mdb3.value !== null
    ? vertigo_mdBMet.value
      ? "tally-ok"
      : "tally-abn"
    : "tally-nd",
);
const vertigo_mdBTallyText = computed(() =>
  vertigo_mdb1.value !== null &&
  vertigo_mdb2.value !== null &&
  vertigo_mdb3.value !== null
    ? vertigo_mdBMet.value
      ? "✓"
      : "✗"
    : "—",
);
const vertigo_mdCTallyClass = computed(() =>
  vertigo_mdc1.value !== null &&
  vertigo_mdc2.value !== null &&
  vertigo_mdc3.value !== null
    ? vertigo_mdCMet.value
      ? "tally-ok"
      : "tally-abn"
    : "tally-nd",
);
const vertigo_mdCTallyText = computed(() =>
  vertigo_mdc1.value !== null &&
  vertigo_mdc2.value !== null &&
  vertigo_mdc3.value !== null
    ? vertigo_mdCMet.value
      ? "✓ ≥1"
      : "✗"
    : "—",
);

// ─────────────────────────────────────────────────────────────────
// Pre-computed for Probable MD sub-score row  ← FIX: no .value in template
// ─────────────────────────────────────────────────────────────────
const vertigo_pmSSA = computed(() =>
  vertigo_pma1.value === null
    ? "ss-nd"
    : vertigo_pmAMet.value
      ? "ss-amber"
      : "ss-fail",
);
const vertigo_pmSSAv = computed(() =>
  vertigo_pma1.value === null ? "—" : vertigo_pmAMet.value ? "✓" : "✗",
);
const vertigo_pmSSB = computed(() =>
  vertigo_pmb1.value === null
    ? "ss-nd"
    : vertigo_pmBMet.value
      ? "ss-amber"
      : "ss-fail",
);
const vertigo_pmSSBv = computed(() =>
  vertigo_pmb1.value === null ? "—" : vertigo_pmBMet.value ? "✓" : "✗",
);
const vertigo_pmSSC = computed(() =>
  vertigo_pmc1.value === null
    ? "ss-nd"
    : vertigo_pmCMet.value
      ? "ss-amber"
      : "ss-fail",
);
const vertigo_pmSSCv = computed(() =>
  vertigo_pmc1.value === null ? "—" : vertigo_pmCMet.value ? "✓" : "✗",
);

// ══════════════════════════════════════════════════════════════════
// DHI CALCULATOR
// ══════════════════════════════════════════════════════════════════
// ── DHI Questions ─────────────────────────────────────────────────
// Jacobson 1991 — 25 items, 3 domains (F/E/P), each scored 4/2/0
// F = Functional, E = Emotional, P = Physical
const dhi_questions = [
  {
    key: "p1",
    domain: "P",
    name: "抬頭向上看時，您的頭暈問題是否加劇？",
    sub: "Does looking up increase your problem?",
    hint: "頭部向上仰視（如取高處物品）時誘發的症狀",
  },
  {
    key: "e2",
    domain: "E",
    name: "您是否因為頭暈感到沮喪？",
    sub: "Do you feel frustrated because of your problem?",
    hint: "頭暈對情緒造成的挫折感與沮喪",
  },
  {
    key: "f3",
    domain: "F",
    name: "您是否因為頭暈而限制商務或休閒旅行？",
    sub: "Do you restrict your travel for business or recreation because of your problem?",
    hint: "頭暈是否影響出差或休閒旅遊的意願",
  },
  {
    key: "p4",
    domain: "P",
    name: "走過超市的走道時，您的頭暈問題是否加劇？",
    sub: "Do you have difficulty walking down the aisle of a supermarket?",
    hint: "在視覺複雜環境（貨架通道）行走時的不適",
  },
  {
    key: "f5",
    domain: "F",
    name: "您因頭暈而在起床或上床時有困難嗎？",
    sub: "Do you have difficulty getting into or out of bed because of your problem?",
    hint: "改變躺臥至站立姿勢時誘發的頭暈",
  },
  {
    key: "f6",
    domain: "F",
    name: "您是否因頭暈而大幅限制社交活動？",
    sub: "Do you restrict your participation in social activities because of your problem?",
    hint: "頭暈對社交聚會、外出活動的限制程度",
  },
  {
    key: "f7",
    domain: "F",
    name: "您是否因頭暈而在閱讀上有困難？",
    sub: "Do you have difficulty reading because of your problem?",
    hint: "閱讀時眼球追蹤動作引起的不適",
  },
  {
    key: "p8",
    domain: "P",
    name: "進行更費力的活動（如運動、跳舞）時，您的頭暈是否加劇？",
    sub: "Do more ambitious activities like sports, dancing, or household chores increase your problem?",
    hint: "激烈活動或家務勞動時誘發的症狀",
  },
  {
    key: "e9",
    domain: "E",
    name: "您是否害怕獨自外出？",
    sub: "Are you afraid to leave your home without having someone accompany you?",
    hint: "對獨自外出的恐懼感，擔心頭暈突然發作",
  },
  {
    key: "e10",
    domain: "E",
    name: "您是否因頭暈而在他人面前感到尷尬？",
    sub: "Have you been embarrassed in front of others because of your problem?",
    hint: "頭暈發作時在社交場合造成的難堪",
  },
  {
    key: "p11",
    domain: "P",
    name: "快速移動頭部時，您的症狀是否加劇？",
    sub: "Do quick movements of your head increase your problem?",
    hint: "頭部快速轉動（搖頭、轉頭）引起的症狀",
  },
  {
    key: "f12",
    domain: "F",
    name: "您是否因頭暈而避免在高處活動？",
    sub: "Do you avoid heights because of your problem?",
    hint: "高處活動（如爬梯、陽台）引起的不適或恐懼",
  },
  {
    key: "p13",
    domain: "P",
    name: "在床上翻身時，您的頭暈是否加劇？",
    sub: "Does turning over in bed increase your problem?",
    hint: "睡眠時翻身姿勢改變誘發的頭暈（常見於 BPPV）",
  },
  {
    key: "f14",
    domain: "F",
    name: "您是否因頭暈而使家務或庭院工作變得困難？",
    sub: "Is it difficult for you to do strenuous housework or yard work because of your problem?",
    hint: "費力的家務或戶外庭院工作時誘發的症狀",
  },
  {
    key: "e15",
    domain: "E",
    name: "您是否害怕別人認為您是酒醉或精神異常？",
    sub: "Are you afraid that people may think you are intoxicated?",
    hint: "對外界誤解的擔憂（步態不穩被誤認為醉酒）",
  },
  {
    key: "f16",
    domain: "F",
    name: "您是否因頭暈而使散步困難？",
    sub: "Is it difficult for you to go for a walk by yourself because of your problem?",
    hint: "獨自散步時對頭暈發作的顧慮與困難",
  },
  {
    key: "p17",
    domain: "P",
    name: "在人行道上走路時，您的頭暈是否加劇？",
    sub: "Does walking down a sidewalk increase your problem?",
    hint: "一般步行（包括不平整路面）時誘發的不適",
  },
  {
    key: "e18",
    domain: "E",
    name: "您是否因頭暈而難以集中注意力？",
    sub: "Is it difficult for you to concentrate because of your problem?",
    hint: "頭暈對專注力與認知功能的干擾",
  },
  {
    key: "f19",
    domain: "F",
    name: "您是否因頭暈而難以在黑暗中於室內行走？",
    sub: "Is it difficult for you to walk around your house in the dark because of your problem?",
    hint: "缺乏視覺輔助（黑暗中）時平衡困難加劇",
  },
  {
    key: "e20",
    domain: "E",
    name: "您是否害怕獨自一人在家？",
    sub: "Are you afraid to stay home alone because of your problem?",
    hint: "對獨處時頭暈發作無人協助的恐懼",
  },
  {
    key: "f21",
    domain: "F",
    name: "您是否因頭暈而感覺殘障？",
    sub: "Do you feel handicapped because of your problem?",
    hint: "頭暈對整體生活功能造成的障礙感",
  },
  {
    key: "e22",
    domain: "E",
    name: "頭暈問題是否讓您感到憂鬱？",
    sub: "Has your problem placed stress on your relationships with members of your family or friends?",
    hint: "頭暈對家庭關係與友誼造成的壓力",
  },
  {
    key: "e23",
    domain: "E",
    name: "頭暈問題是否使您感到焦慮？",
    sub: "Has your problem caused you to feel depressed?",
    hint: "頭暈引起的情緒低落與憂鬱感",
  },
  {
    key: "f24",
    domain: "F",
    name: "您是否因頭暈而影響家庭或工作職責？",
    sub: "Does your problem interfere with your job or household responsibilities?",
    hint: "頭暈對職業表現與家庭責任的干擾程度",
  },
  {
    key: "p25",
    domain: "P",
    name: "彎腰時，您的頭暈問題是否加劇？",
    sub: "Does bending over increase your problem?",
    hint: "身體前屈（如撿物）時誘發的頭暈症狀",
  },
];

const dhi_domainDefs = {
  F: { name: "功能面向", sub: "Functional", color: "func", items: 9, max: 36 },
  E: { name: "情緒面向", sub: "Emotional", color: "emo", items: 9, max: 36 },
  P: { name: "身體面向", sub: "Physical", color: "phys", items: 7, max: 28 },
};

const dhi_scoreOptions = [
  { value: 0, label: "0", desc: "從不" },
  { value: 2, label: "2", desc: "有時" },
  { value: 4, label: "4", desc: "總是" },
];

// ── State ─────────────────────────────────────────────────────────
const dhi_selections = ref<Record<string, number>>(
  Object.fromEntries(dhi_questions.map((q) => [q.key, -1])),
);

const dhi_showResults = ref(false);
const dhi_copied = ref(false);

// ── Computed ──────────────────────────────────────────────────────
const dhi_answeredCount = computed(
  () => dhi_questions.filter((q) => dhi_selections.value[q.key] >= 0).length,
);

const dhi_isComplete = computed(() => dhi_answeredCount.value === 25);

function dhi_domainScore(d: "F" | "E" | "P") {
  return dhi_questions
    .filter((q) => q.domain === d)
    .reduce((sum, q) => sum + Math.max(dhi_selections.value[q.key], 0), 0);
}

const dhi_scoreF = computed(() => dhi_domainScore("F"));
const dhi_scoreE = computed(() => dhi_domainScore("E"));
const dhi_scoreP = computed(() => dhi_domainScore("P"));

const dhi_totalScore = computed(
  () => dhi_scoreF.value + dhi_scoreE.value + dhi_scoreP.value,
);

// DHI: 0–100; ≤ 16 mild; 17–34 mild-moderate warning; ≥ 60 severe
const dhi_severity = computed(() => {
  const s = dhi_totalScore.value;
  if (!dhi_isComplete.value)
    return {
      level: "填寫中",
      color: "filling",
      advice: `已完成 ${dhi_answeredCount.value}/25 題`,
    };
  if (s <= 16)
    return {
      level: "輕微障礙",
      color: "normal",
      advice: "DHI ≤ 16，頭暈對日常生活影響輕微或無顯著障礙",
    };
  if (s <= 34)
    return {
      level: "輕至中度障礙",
      color: "mild",
      advice: "DHI 17–34，頭暈造成輕至中度障礙，建議就醫評估",
    };
  if (s <= 60)
    return {
      level: "中度障礙",
      color: "moderate",
      advice: "DHI 35–60，中度前庭功能障礙，建議積極評估及前庭復健",
    };
  return {
    level: "重度障礙",
    color: "severe",
    advice: "DHI > 60，嚴重頭暈障礙，強烈建議完整前庭評估及復健治療",
  };
});

// ── Functions ─────────────────────────────────────────────────────
function dhi_generateMarkdown() {
  const sections = (["F", "E", "P"] as const)
    .map((d) => {
      const def = dhi_domainDefs[d];
      const lines = dhi_questions
        .filter((q) => q.domain === d)
        .map((q, i) => {
          const v = dhi_selections.value[q.key];
          const opt = dhi_scoreOptions.find((o) => o.value === v);
          return `  - **${q.name}**（${q.sub}）：${v >= 0 ? `${v} — ${opt?.desc}` : "未填"}`;
        })
        .join("\n");
      const ds =
        d === "F"
          ? dhi_scoreF.value
          : d === "E"
            ? dhi_scoreE.value
            : dhi_scoreP.value;
      return `### ${def.name}（${ds} / ${def.max} 分）\n${lines}`;
    })
    .join("\n\n");

  return `# DHI 頭暈障礙量表評估結果\n\n${sections}\n\n---\n\n## 計算結果\n\n- **DHI 總分**：${dhi_totalScore.value} / 100\n- **功能面向（F）**：${dhi_scoreF.value} / 36\n- **情緒面向（E）**：${dhi_scoreE.value} / 36\n- **身體面向（P）**：${dhi_scoreP.value} / 28\n- **嚴重程度**：${dhi_severity.value.level}\n- **臨床建議**：${dhi_severity.value.advice}\n\n> 正常切截值：DHI ≤ 16`;
}

async function copyMarkdown() {
  await navigator.clipboard.writeText(dhi_generateMarkdown());
  dhi_copied.value = true;
  setTimeout(() => (dhi_copied.value = false), 2000);
}

function dhi_reset() {
  dhi_questions.forEach((q) => {
    dhi_selections.value[q.key] = -1;
  });
  dhi_showResults.value = false;
}

// Q-number across all dhi_questions
const dhi_qIndex = (() => {
  const map: Record<string, number> = {};
  dhi_questions.forEach((q, i) => {
    map[q.key] = i + 1;
  });
  return map;
})();
</script>

<template>
  <div class="dizziness">
    <!-- Tab bar -->
    <div class="tab-bar">
      <button
        class="tab-btn"
        :class="{ active: dizzinessTab === 'vertigo' }"
        @click="dizzinessTab = 'vertigo'"
      >
        <span class="tab-label">眩暈鑑別診斷工具</span>
        <span class="tab-sub">Vertigo Evaluator</span>
      </button>
      <button
        class="tab-btn"
        :class="{ active: dizzinessTab === 'dhi' }"
        @click="dizzinessTab = 'dhi'"
      >
        <span class="tab-label">DHI 頭暈障礙量表</span>
        <span class="tab-sub">Dizziness Handicap Inventory</span>
      </button>
    </div>

    <!-- ═══════════════════ Vertigo Panel ═══════════════════ -->
    <div v-show="dizzinessTab === 'vertigo'" class="vertigo-panel">
      <div class="vertigo">
        <!-- ══ HEADER ══════════════════════════════════════════════════ -->
        <div class="vertigo-header">
          <div class="header-title">
            <h2 class="title">ACUTE VERTIGO 急性眩暈鑑別診斷整合工具</h2>
            <p class="subtitle">
              HINTS · BPPV · AUVP · Vestibular Migraine · Ménière's Disease
            </p>
            <p class="subtitle-2">
              <span class="hint-tag hint-stroke"
                >🚨 Step 1: HINTS 排除中風</span
              >
              <span class="hint-tag hint-auvp" style="margin-left: 6px"
                >🧠 Step 2: AUVP/前庭神經炎</span
              >
              <span class="hint-tag hint-vmmd" style="margin-left: 6px"
                >🔄 Step 3: VM / MD</span
              >
            </p>
          </div>
          <div class="score-badge" :class="vertigo_badgeClass">
            <span class="badge-top">{{ vertigo_badgeTop }}</span>
            <div class="score-main">
              <span class="score-number">{{ vertigo_badgeNum }}</span>
              <span class="score-unit" v-if="vertigo_badgeUnit">{{
                vertigo_badgeUnit
              }}</span>
            </div>
            <span class="score-bot">{{ vertigo_badgeBot }}</span>
          </div>
        </div>

        <!-- ══ PROGRESS STRIP ══════════════════════════════════════════ -->
        <div class="strip">
          <button
            type="button"
            class="strip-card"
            :class="{
              'sc-ok': vertigo_hintsStrip === 'ok',
              'sc-critical': vertigo_hintsStrip === 'critical',
              'sc-nd': vertigo_hintsStrip === 'nd',
              'sc-active': vertigo_isTabHints,
            }"
            @click="vertigo_switchTab('hints')"
          >
            <span class="sc-icon">🚨</span>
            <span class="sc-label">HINTS</span>
            <span class="sc-val">{{ vertigo_hintsStripVal }}</span>
            <span class="sc-sub">{{ vertigo_hintsStripSub }}</span>
          </button>
          <button
            type="button"
            class="strip-card"
            :class="{
              'sc-bppv': vertigo_bppvStrip === 'bppv',
              'sc-ok': vertigo_bppvStrip === 'ok',
              'sc-fail': vertigo_bppvStrip === 'fail',
              'sc-nd': vertigo_bppvStrip === 'nd',
              'sc-active': vertigo_isTabBppv,
            }"
            @click="vertigo_switchTab('bppv')"
          >
            <span class="sc-icon">🔄</span>
            <span class="sc-label">BPPV</span>
            <span class="sc-val">{{ vertigo_bppvStripVal }}</span>
            <span class="sc-sub">{{ vertigo_bppvStripSub }}</span>
          </button>
          <button
            type="button"
            class="strip-card"
            :class="{
              'sc-teal': vertigo_auvpStrip === 'teal',
              'sc-nd': vertigo_auvpStrip === 'nd',
              'sc-active': vertigo_isTabAuvp,
            }"
            @click="vertigo_switchTab('auvp')"
          >
            <span class="sc-icon">🧠</span>
            <span class="sc-label">AUVP</span>
            <span class="sc-val">{{ vertigo_auvpStripVal }}</span>
            <span class="sc-sub">{{ vertigo_auvpStripSub }}</span>
          </button>
          <button
            type="button"
            class="strip-card"
            :class="{
              'sc-purple': vertigo_vmmdStrip === 'purple',
              'sc-amber': vertigo_vmmdStrip === 'amber',
              'sc-nd': vertigo_vmmdStrip === 'nd',
              'sc-active': vertigo_isTabVmmd,
            }"
            @click="vertigo_switchTab('vmmd')"
          >
            <span class="sc-icon">🔁</span>
            <span class="sc-label">VM / MD</span>
            <span class="sc-val">{{ vertigo_vmmdStripVal }}</span>
            <span class="sc-sub">{{ vertigo_vmmdStripSub }}</span>
          </button>
        </div>

        <!-- ══ TAB NAV ══════════════════════════════════════════════════ -->
        <div class="nihss-group">
          <div class="group-header-bar flow-bar">
            <span class="group-icon">🗂</span>
            <span class="group-label-text">鑑別診斷流程（建議順序）</span>
            <span class="group-sub-text"
              >分流 → HINTS（持續性/排除中風）→ BPPV（位置性）→ AUVP →
              VM/MD</span
            >
          </div>
          <div class="tab-grid">
            <button
              class="tab-btn"
              :class="{ 'tab-triage': vertigo_isTabTriage }"
              @click="vertigo_switchTab('triage')"
            >
              <span class="tb-icon">🔀</span>
              <span class="tb-body">
                <span class="tb-title">Step 0 · 眩暈分流</span>
                <span class="tb-sub">持續性 / 位置性 / 反覆發作性</span>
              </span>
              <span
                class="tb-badge"
                :class="vertigo_vertigoType ? 'tbb-done' : 'tbb-nd'"
                >{{ vertigo_vertigoType || "待填" }}</span
              >
            </button>
            <button
              class="tab-btn"
              :class="{ 'tab-hints': vertigo_isTabHints }"
              @click="vertigo_switchTab('hints')"
            >
              <span class="tb-icon">🚨</span>
              <span class="tb-body">
                <span class="tb-title">Step 1 · HINTS 眼動檢查</span>
                <span class="tb-sub">急性持續性眩暈 · 排除缺血性中風</span>
              </span>
              <span class="tb-badge" :class="vertigo_hintsBadgeClass">{{
                vertigo_hintsBadgeText
              }}</span>
            </button>
            <button
              class="tab-btn"
              :class="{ 'tab-bppv': vertigo_isTabBppv }"
              @click="vertigo_switchTab('bppv')"
            >
              <span class="tb-icon">🔄</span>
              <span class="tb-body">
                <span class="tb-title">Step 2 · BPPV 決策樹</span>
                <span class="tb-sub"
                  >位置性眩暈 · Dix-Hallpike · Roll Test</span
                >
              </span>
              <span
                class="tb-badge"
                :class="
                  vertigo_bppvStep1Complete
                    ? vertigo_isPositional
                      ? 'tbb-bppv'
                      : 'tbb-central'
                    : 'tbb-nd'
                "
                >{{
                  vertigo_bppvStep1Complete
                    ? vertigo_isPositional
                      ? vertigo_canal
                        ? vertigo_bppvResult.dx.substring(0, 6)
                        : "符合"
                      : "不符合"
                    : "待填"
                }}</span
              >
            </button>
            <button
              class="tab-btn"
              :class="{ 'tab-auvp': vertigo_isTabAuvp }"
              @click="vertigo_switchTab('auvp')"
            >
              <span class="tb-icon">🧠</span>
              <span class="tb-body">
                <span class="tb-title">Step 3 · AUVP / 前庭神經炎</span>
                <span class="tb-sub">持續性眩暈 · HINTS 周圍性後確立診斷</span>
              </span>
              <span class="tb-badge" :class="vertigo_auvpBadgeClass">{{
                vertigo_auvpBadgeText
              }}</span>
            </button>
            <button
              class="tab-btn"
              :class="{ 'tab-vmmd': vertigo_isTabVmmd }"
              @click="vertigo_switchTab('vmmd')"
            >
              <span class="tb-icon">🔁</span>
              <span class="tb-body">
                <span class="tb-title">Step 4 · VM / Ménière's</span>
                <span class="tb-sub"
                  >反覆發作性眩暈 · 偏頭痛病史 · 耳部症狀</span
                >
              </span>
              <span class="tb-badge" :class="vertigo_vmmdBadgeClass">{{
                vertigo_vmmdBadgeText
              }}</span>
            </button>
          </div>
        </div>

        <!-- ══════════════ TAB: TRIAGE ══════════════════════════════════ -->
        <template v-if="vertigo_isTabTriage">
          <div class="nihss-group">
            <div class="group-header-bar triage-bar">
              <span class="group-icon">❓</span>
              <span class="group-label-text">眩暈類型：如何分流？</span>
              <span class="group-sub-text">根據發作模式選擇後續評估工具</span>
            </div>
            <div class="triage-grid">
              <button
                class="triage-card"
                :class="{ 'tc-avs': vertigo_vertigoType === 'avs' }"
                @click="vertigo_selectType('avs')"
              >
                <div class="tc-upper">
                  <span class="tc-icon">⏱️</span>
                  <span class="tc-title">急性持續性眩暈（AVS）</span>
                  <span class="tc-desc"
                    >持續數小時至數天，靜止時仍有眩暈，伴自發性眼振、頭動不耐受、噁心嘔吐</span
                  >
                </div>
                <div class="tc-lower">
                  <div class="tc-tags">
                    <span class="tc-tag tc-tag-red">⚠ 需排除中風</span
                    ><span class="tc-tag">→ HINTS Step 1</span>
                  </div>
                  <span class="tc-eg"
                    >代表疾病：前庭神經炎、腦幹/小腦梗塞、迷路炎</span
                  >
                </div>
              </button>
              <button
                class="triage-card"
                :class="{ 'tc-pos': vertigo_vertigoType === 'positional' }"
                @click="vertigo_selectType('positional')"
              >
                <div class="tc-upper">
                  <span class="tc-icon">🔄</span>
                  <span class="tc-title">位置性眩暈（Positional）</span>
                  <span class="tc-desc"
                    >頭部或身體位置改變誘發，持續數秒至 1
                    分鐘，靜止後緩解，潛伏期 5–20 秒</span
                  >
                </div>
                <div class="tc-lower">
                  <div class="tc-tags">
                    <span class="tc-tag tc-tag-blue">Dix-Hallpike</span
                    ><span class="tc-tag">→ BPPV Step 2</span>
                  </div>
                  <span class="tc-eg">代表疾病：BPPV（後/水平/前半規管）</span>
                </div>
              </button>
              <button
                class="triage-card"
                :class="{ 'tc-epi': vertigo_vertigoType === 'episodic' }"
                @click="vertigo_selectType('episodic')"
              >
                <div class="tc-upper">
                  <span class="tc-icon">🔁</span>
                  <span class="tc-title">反覆發作性眩暈（Episodic）</span>
                  <span class="tc-desc"
                    >間歇性眩暈發作，每次數分鐘至數十小時，發作間完全緩解，伴或不伴耳部/頭痛症狀</span
                  >
                </div>
                <div class="tc-lower">
                  <div class="tc-tags">
                    <span class="tc-tag tc-tag-purple">偏頭痛特徵？</span
                    ><span class="tc-tag tc-tag-amber">耳悶/耳鳴？</span>
                  </div>
                  <span class="tc-eg"
                    >代表疾病：前庭性偏頭痛（VM）、梅尼爾氏症（MD）</span
                  >
                </div>
              </button>
            </div>
          </div>
          <div class="triage-flowbox">
            <div class="flow-title">📋 急性眩暈鑑別診斷流程</div>
            <div class="flow-steps">
              <div class="fs-row">
                <div class="fs-box fs-start">眩暈主訴</div>
                <div class="fs-arrow">→</div>
                <div class="fs-box fs-q">持續性？</div>
              </div>
              <div class="fs-branches">
                <div class="fs-branch">
                  <div class="fs-branch-label fs-yes">是（AVS）</div>
                  <div class="fs-box fs-step">HINTS 三步驟</div>
                  <div class="fs-arrow">↓</div>
                  <div class="fs-row-mini">
                    <div class="fs-mini fs-central">中樞性 → 中風評估 MRI</div>
                    <div class="fs-mini fs-periph">周圍性 → AUVP 確認</div>
                  </div>
                </div>
                <div class="fs-branch">
                  <div class="fs-branch-label fs-no">否</div>
                  <div class="fs-box fs-q">位置性誘發？</div>
                  <div class="fs-arrow">↓</div>
                  <div class="fs-row-mini">
                    <div class="fs-mini fs-bppv">是 → BPPV 決策樹</div>
                    <div class="fs-mini fs-epi">否（反覆性）→ VM / MD</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="result-card filling">
            <div class="result-left">
              <span class="result-number" style="font-size: 2rem">{{
                vertigo_vertigoType ? "→" : "—"
              }}</span>
            </div>
            <div class="result-right">
              <span class="result-ver">分流結果</span>
              <span class="result-level">{{
                vertigo_vertigoType === "avs"
                  ? "請繼續 Step 1：HINTS 眼動檢查"
                  : vertigo_vertigoType === "positional"
                    ? "請繼續 Step 2：BPPV 決策樹"
                    : vertigo_vertigoType === "episodic"
                      ? "請繼續 Step 4：前庭性偏頭痛 / 梅尼爾氏症"
                      : "請選擇眩暈類型"
              }}</span>
              <span class="result-advice" v-if="vertigo_vertigoType">{{
                vertigo_vertigoType === "avs"
                  ? "急性持續性眩暈 — 點擊「Step 1 · HINTS」標籤，進行 H、I、N 三步驟眼動檢查以排除中風。"
                  : vertigo_vertigoType === "positional"
                    ? "位置性眩暈 — 點擊「Step 2 · BPPV」標籤，依序確認症狀特徵、Dix-Hallpike 及眼振類型。"
                    : "反覆發作性眩暈 — 點擊「Step 4 · VM/MD」標籤，評估前庭性偏頭痛或梅尼爾氏症。"
              }}</span>
            </div>
          </div>
        </template>

        <!-- ══════════════ TAB: HINTS ════════════════════════════════════ -->
        <template v-else-if="vertigo_isTabHints">
          <div class="prereq-notice">
            <span class="pn-icon">⚠</span>
            <span
              ><strong>適應症（AVS）：</strong
              >持續數小時至數天的眩暈＋自發性眼振＋頭動不耐受，且有 ≥1
              項中風危險因子。<strong
                >不適用於位置性眩暈（BPPV）或間歇性眩暈。</strong
              ></span
            >
          </div>
          <!-- H -->
          <div class="nihss-group">
            <div class="group-header-bar h-bar">
              <span class="group-icon">H</span>
              <span class="group-label-text"
                >頭部衝擊試驗（Head Impulse Test, HIT）</span
              >
              <span class="group-sub-text">評估前庭眼反射（VOR）功能</span>
              <span
                class="group-score-tally"
                :class="
                  vertigo_hit !== null
                    ? vertigo_hit === 'central'
                      ? 'tally-central'
                      : 'tally-periph'
                    : 'tally-nd'
                "
                >{{
                  vertigo_hit !== null
                    ? vertigo_hit === "central"
                      ? "中樞性"
                      : "周圍性"
                    : "—"
                }}</span
              >
            </div>
            <div
              class="hints-item"
              :class="
                vertigo_hit === 'central'
                  ? 'item-central'
                  : vertigo_hit === 'peripheral'
                    ? 'item-periph'
                    : ''
              "
            >
              <div class="item-header">
                <span class="item-qnum q-h">HIT</span>
                <div class="item-name-block">
                  <span class="item-name"
                    >頭部快速轉動後，患者是否需要補正性掃視（corrective
                    saccade）才能維持凝視目標？</span
                  >
                  <span class="item-sub"
                    >患者注視檢查者鼻端，快速向一側轉頭約
                    10–20°，觀察眼球是否出現補正掃視</span
                  >
                </div>
                <span
                  class="item-val"
                  :class="
                    vertigo_hit === 'central'
                      ? 'val-central'
                      : vertigo_hit === 'peripheral'
                        ? 'val-periph'
                        : 'val-nd'
                  "
                  >{{
                    vertigo_hit === null
                      ? "—"
                      : vertigo_hit === "central"
                        ? "正常HIT"
                        : "異常HIT"
                  }}</span
                >
              </div>
              <div class="two-choice-row">
                <button
                  class="choice-btn"
                  :class="{ 'choice-active-c': vertigo_hit === 'central' }"
                  @click="vertigo_hit = 'central'"
                >
                  <span class="choice-badge badge-c">中樞性</span>
                  <span class="choice-title">正常 HIT（無補正掃視）</span>
                  <span class="choice-sub"
                    >眼球自然跟隨頭部 → VOR 正常 → 暗示可能為中樞病變</span
                  >
                </button>
                <button
                  class="choice-btn"
                  :class="{ 'choice-active-p': vertigo_hit === 'peripheral' }"
                  @click="vertigo_hit = 'peripheral'"
                >
                  <span class="choice-badge badge-p">周圍性</span>
                  <span class="choice-title">異常 HIT（有補正掃視）</span>
                  <span class="choice-sub"
                    >頭轉後眼球滑移，需補正掃視 → VOR 受損 → 暗示周圍病變</span
                  >
                </button>
              </div>
            </div>
          </div>

          <!-- I -->
          <div class="nihss-group">
            <div class="group-header-bar i-bar">
              <span class="group-icon">I</span>
              <span class="group-label-text"
                >眼振方向（Nystagmus Direction）</span
              >
              <span class="group-sub-text">觀察不同注視方向下的眼振類型</span>
              <span
                class="group-score-tally"
                :class="
                  vertigo_nyst !== null
                    ? vertigo_nyst === 'central'
                      ? 'tally-central'
                      : 'tally-periph'
                    : 'tally-nd'
                "
                >{{
                  vertigo_nyst !== null
                    ? vertigo_nyst === "central"
                      ? "中樞性"
                      : "周圍性"
                    : "—"
                }}</span
              >
            </div>
            <div
              class="hints-item"
              :class="
                vertigo_nyst === 'central'
                  ? 'item-central'
                  : vertigo_nyst === 'peripheral'
                    ? 'item-periph'
                    : ''
              "
            >
              <div class="item-header">
                <span class="item-qnum q-i">NYS</span>
                <div class="item-name-block">
                  <span class="item-name"
                    >請患者向左看、向右看，眼振快相方向是否改變？</span
                  >
                  <span class="item-sub"
                    >觀察正視前方、注視左側、注視右側時，眼振快相方向是否一致</span
                  >
                </div>
                <span
                  class="item-val"
                  :class="
                    vertigo_nyst === 'central'
                      ? 'val-central'
                      : vertigo_nyst === 'peripheral'
                        ? 'val-periph'
                        : 'val-nd'
                  "
                  >{{
                    vertigo_nyst === null
                      ? "—"
                      : vertigo_nyst === "central"
                        ? "方向改變"
                        : "單一方向"
                  }}</span
                >
              </div>
              <div class="two-choice-row">
                <button
                  class="choice-btn"
                  :class="{ 'choice-active-c': vertigo_nyst === 'central' }"
                  @click="vertigo_nyst = 'central'"
                >
                  <span class="choice-badge badge-c">中樞性</span>
                  <span class="choice-title"
                    >方向改變性眼振（Direction-changing）</span
                  >
                  <span class="choice-sub"
                    >注視不同方向時，眼振快相方向改變 → 中樞病變特徵</span
                  >
                </button>
                <button
                  class="choice-btn"
                  :class="{ 'choice-active-p': vertigo_nyst === 'peripheral' }"
                  @click="vertigo_nyst = 'peripheral'"
                >
                  <span class="choice-badge badge-p">周圍性</span>
                  <span class="choice-title"
                    >單一方向眼振（Unidirectional）</span
                  >
                  <span class="choice-sub"
                    >各注視方向快相方向相同，注視快相方向時增強 → 周圍病變</span
                  >
                </button>
              </div>
            </div>
          </div>

          <!-- N -->
          <div class="nihss-group">
            <div class="group-header-bar n-bar">
              <span class="group-icon">N</span>
              <span class="group-label-text">斜偏測試（Test of Skew）</span>
              <span class="group-sub-text"
                >交替遮眼法（Alternate Cover Test）評估垂直眼位偏移</span
              >
              <span
                class="group-score-tally"
                :class="
                  vertigo_skew !== null
                    ? vertigo_skew === 'central'
                      ? 'tally-central'
                      : 'tally-periph'
                    : 'tally-nd'
                "
                >{{
                  vertigo_skew !== null
                    ? vertigo_skew === "central"
                      ? "中樞性"
                      : "周圍性"
                    : "—"
                }}</span
              >
            </div>
            <div
              class="hints-item"
              :class="
                vertigo_skew === 'central'
                  ? 'item-central'
                  : vertigo_skew === 'peripheral'
                    ? 'item-periph'
                    : ''
              "
            >
              <div class="item-header">
                <span class="item-qnum q-n">SKW</span>
                <div class="item-name-block">
                  <span class="item-name"
                    >交替遮眼時，露出的眼是否出現垂直方向的補正運動（re-fixation
                    movement）？</span
                  >
                  <span class="item-sub"
                    >交替遮蓋左眼、右眼，觀察露出的眼是否有垂直補正運動（vertigo_skew
                    deviation）</span
                  >
                </div>
                <span
                  class="item-val"
                  :class="
                    vertigo_skew === 'central'
                      ? 'val-central'
                      : vertigo_skew === 'peripheral'
                        ? 'val-periph'
                        : 'val-nd'
                  "
                  >{{
                    vertigo_skew === null
                      ? "—"
                      : vertigo_skew === "central"
                        ? "斜偏存在"
                        : "無斜偏"
                  }}</span
                >
              </div>
              <div class="two-choice-row">
                <button
                  class="choice-btn"
                  :class="{ 'choice-active-c': vertigo_skew === 'central' }"
                  @click="vertigo_skew = 'central'"
                >
                  <span class="choice-badge badge-c">中樞性</span>
                  <span class="choice-title"
                    >斜偏存在（Skew Deviation Present）</span
                  >
                  <span class="choice-sub"
                    >遮眼後出現垂直補正運動 → 腦幹病變特徵，高度提示中樞</span
                  >
                </button>
                <button
                  class="choice-btn"
                  :class="{ 'choice-active-p': vertigo_skew === 'peripheral' }"
                  @click="vertigo_skew = 'peripheral'"
                >
                  <span class="choice-badge badge-p">周圍性</span>
                  <span class="choice-title">無斜偏（No Skew Deviation）</span>
                  <span class="choice-sub"
                    >遮眼後無垂直補正運動 → 支持周圍性病因</span
                  >
                </button>
              </div>
            </div>
          </div>
          <div
            v-if="vertigo_hintsComplete && vertigo_hintsResult.screen"
            class="mg-alert alert-critical"
          >
            <span class="alert-icon">🚨</span
            ><span
              ><strong>{{ vertigo_hintsResult.level }}：</strong
              >{{ vertigo_hintsResult.advice }}</span
            >
          </div>
          <div v-if="vertigo_hintsPlus" class="mg-alert alert-moderate">
            <span class="alert-icon">👂</span
            ><span><strong>HINTS Plus：</strong>{{ vertigo_hintsPlus }}</span>
          </div>

          <!-- HINTS Plus -->
          <div class="nihss-group">
            <div class="group-header-bar plus-bar">
              <span class="group-icon">+</span>
              <span class="group-label-text"
                >HINTS Plus：新出現單側聽力損失（選填）</span
              >
              <span class="group-sub-text">AICA 梗塞篩查</span>
              <span
                class="group-score-tally"
                :class="
                  vertigo_hearing !== null
                    ? vertigo_hearing === 'yes'
                      ? 'tally-central'
                      : 'tally-periph'
                    : 'tally-nd'
                "
                >{{
                  vertigo_hearing !== null
                    ? vertigo_hearing === "yes"
                      ? "聽損"
                      : "無"
                    : "—"
                }}</span
              >
            </div>
            <div
              class="hints-item"
              :class="
                vertigo_hearing === 'yes'
                  ? 'item-central'
                  : vertigo_hearing === 'no'
                    ? 'item-periph'
                    : ''
              "
            >
              <div class="item-header">
                <span class="item-qnum q-plus">+</span>
                <div class="item-name-block">
                  <span class="item-name"
                    >是否有新出現的單側聽力損失？（急性發作，同側於前庭症狀）</span
                  >
                  <span class="item-sub"
                    >可用手指摩擦法（finger rub test）測試；單側聽損提示 AICA
                    梗塞可能</span
                  >
                </div>
                <span
                  class="item-val"
                  :class="
                    vertigo_hearing === 'yes'
                      ? 'val-central'
                      : vertigo_hearing === 'no'
                        ? 'val-periph'
                        : 'val-nd'
                  "
                  >{{
                    vertigo_hearing === null
                      ? "—"
                      : vertigo_hearing === "yes"
                        ? "有"
                        : "無"
                  }}</span
                >
              </div>
              <div class="yn-row">
                <button
                  class="btn-yn btn-yn-c"
                  :class="{ 'yn-c-active': vertigo_hearing === 'yes' }"
                  @click="vertigo_hearing = 'yes'"
                >
                  有單側聽力損失
                </button>
                <button
                  class="btn-yn btn-yn-p"
                  :class="{ 'yn-p-active': vertigo_hearing === 'no' }"
                  @click="vertigo_hearing = 'no'"
                >
                  無聽力損失
                </button>
              </div>
            </div>
          </div>

          <!-- Sub-score -->
          <div v-if="vertigo_hintsAnswered > 0" class="sub-score-row">
            <div
              class="sub-score-card"
              :class="
                vertigo_hit === 'central'
                  ? 'ss-central'
                  : vertigo_hit === 'peripheral'
                    ? 'ss-periph'
                    : 'ss-nd'
              "
            >
              <span class="ss-label">H·頭部衝擊</span
              ><span class="ss-val">{{
                vertigo_hit === null
                  ? "—"
                  : vertigo_hit === "central"
                    ? "正常HIT"
                    : "異常HIT"
              }}</span>
            </div>
            <div
              class="sub-score-card"
              :class="
                vertigo_nyst === 'central'
                  ? 'ss-central'
                  : vertigo_nyst === 'peripheral'
                    ? 'ss-periph'
                    : 'ss-nd'
              "
            >
              <span class="ss-label">I·眼振方向</span
              ><span class="ss-val">{{
                vertigo_nyst === null
                  ? "—"
                  : vertigo_nyst === "central"
                    ? "方向改變"
                    : "單一方向"
              }}</span>
            </div>
            <div
              class="sub-score-card"
              :class="
                vertigo_skew === 'central'
                  ? 'ss-central'
                  : vertigo_skew === 'peripheral'
                    ? 'ss-periph'
                    : 'ss-nd'
              "
            >
              <span class="ss-label">N·斜偏測試</span
              ><span class="ss-val">{{
                vertigo_skew === null
                  ? "—"
                  : vertigo_skew === "central"
                    ? "斜偏存在"
                    : "無斜偏"
              }}</span>
            </div>
          </div>

          <div
            v-if="vertigo_hintsComplete && !vertigo_hintsResult.screen"
            class="next-step-box"
          >
            <span class="nsb-icon">✅</span>
            <div>
              <strong>HINTS 周圍性 → 下一步：確立 AUVP / 前庭神經炎診斷</strong>
              <p>
                HINTS 排除中樞性病變後，請點擊上方「Step 3 ·
                AUVP/前庭神經炎」標籤，依 Bárány Society 2022
                五項標準確立診斷。若有聽力損失，請同時考慮迷路炎。
              </p>
            </div>
          </div>

          <div
            v-if="vertigo_showResults && vertigo_hintsComplete"
            class="results-detail"
          >
            <div class="results-header">HINTS 評估明細</div>
            <div class="detail-row">
              <span
                class="detail-qnum"
                :class="vertigo_hit === 'central' ? 'dq-c' : 'dq-p'"
                >H</span
              >
              <span class="detail-domain">頭部衝擊試驗</span>
              <span
                class="detail-score"
                :class="vertigo_hit === 'central' ? 'ds-central' : 'ds-periph'"
                >{{ vertigo_hit === "central" ? "中樞" : "周圍" }}</span
              >
              <span class="detail-desc">{{
                vertigo_hit === "central" ? "正常HIT—中樞性" : "異常HIT—周圍性"
              }}</span>
            </div>
            <div class="detail-row">
              <span
                class="detail-qnum"
                :class="vertigo_nyst === 'central' ? 'dq-c' : 'dq-p'"
                >I</span
              >
              <span class="detail-domain">眼振方向</span>
              <span
                class="detail-score"
                :class="vertigo_nyst === 'central' ? 'ds-central' : 'ds-periph'"
                >{{ vertigo_nyst === "central" ? "中樞" : "周圍" }}</span
              >
              <span class="detail-desc">{{
                vertigo_nyst === "central" ? "方向改變—中樞" : "單一方向—周圍"
              }}</span>
            </div>
            <div class="detail-row">
              <span
                class="detail-qnum"
                :class="vertigo_skew === 'central' ? 'dq-c' : 'dq-p'"
                >N</span
              >
              <span class="detail-domain">斜偏測試</span>
              <span
                class="detail-score"
                :class="vertigo_skew === 'central' ? 'ds-central' : 'ds-periph'"
                >{{ vertigo_skew === "central" ? "中樞" : "周圍" }}</span
              >
              <span class="detail-desc">{{
                vertigo_skew === "central" ? "斜偏存在—中樞" : "無斜偏—周圍"
              }}</span>
            </div>
            <div class="detail-row detail-total">
              <span class="detail-qnum">∑</span>
              <span class="detail-domain">HINTS 判讀</span>
              <span class="detail-score detail-score-brand">{{
                vertigo_centralCount > 0 ? "中樞性" : "周圍性"
              }}</span>
              <span class="detail-desc"
                >{{ vertigo_centralCount }}/3 中樞體徵</span
              >
            </div>
          </div>

          <div class="result-card" :class="vertigo_hintsResult.color">
            <div class="result-left">
              <span class="result-number">{{
                vertigo_hintsComplete
                  ? vertigo_hintsResult.screen
                    ? "⚠"
                    : "✓"
                  : "—"
              }}</span>
            </div>
            <div class="result-right">
              <span class="result-ver"
                >HINTS Exam · Kattah et al. Stroke 2009</span
              >
              <span class="result-level">{{ vertigo_hintsResult.level }}</span>
              <span class="result-advice">{{
                vertigo_hintsResult.advice
              }}</span>
            </div>
          </div>
        </template>

        <!-- ══════════════ TAB: BPPV ═════════════════════════════════════ -->
        <template v-else-if="vertigo_isTabBppv">
          <div class="nihss-group">
            <div class="group-header-bar step-bar-1">
              <span class="group-icon">1️⃣</span>
              <span class="group-label-text">BPPV 步驟 1：位置性眩暈特徵</span>
              <span class="group-sub-text"
                >確認是否符合 BPPV 基本條件（Bárány Society 2015）</span
              >
              <span
                class="group-score-tally"
                :class="
                  vertigo_bppvStep1Complete
                    ? vertigo_isPositional
                      ? 'tally-ok'
                      : 'tally-abn'
                    : 'tally-nd'
                "
                >{{
                  vertigo_bppvStep1Complete
                    ? vertigo_isPositional
                      ? "符合"
                      : "不符合"
                    : "—"
                }}</span
              >
            </div>
            <div class="item-list">
              <div
                class="crit-item"
                :class="
                  vertigo_posVert === 'yes'
                    ? 'item-ok'
                    : vertigo_posVert === 'no'
                      ? 'item-fail'
                      : ''
                "
              >
                <div class="item-header">
                  <span class="item-qnum q-step1">Q1</span>
                  <div class="item-name-block">
                    <span class="item-name"
                      >頭部或身體位置改變時是否誘發短暫眩暈？</span
                    >
                    <span class="item-sub"
                      >Does vertigo occur with head position changes?</span
                    >
                  </div>
                  <span
                    class="item-val"
                    :class="
                      vertigo_posVert === 'yes'
                        ? 'val-ok'
                        : vertigo_posVert === 'no'
                          ? 'val-fail'
                          : 'val-nd'
                    "
                    >{{
                      vertigo_posVert === null
                        ? "—"
                        : vertigo_posVert === "yes"
                          ? "是"
                          : "否"
                    }}</span
                  >
                </div>
                <div class="yn-row">
                  <button
                    class="btn-yn btn-yn-ok"
                    :class="{ 'yn-ok-active': vertigo_posVert === 'yes' }"
                    @click="vertigo_posVert = 'yes'"
                  >
                    是
                  </button>
                  <button
                    class="btn-yn btn-yn-fail"
                    :class="{ 'yn-fail-active': vertigo_posVert === 'no' }"
                    @click="vertigo_posVert = 'no'"
                  >
                    否
                  </button>
                </div>
              </div>
              <div
                class="crit-item"
                :class="
                  vertigo_latency === 'yes'
                    ? 'item-ok'
                    : vertigo_latency === 'no'
                      ? 'item-fail'
                      : ''
                "
              >
                <div class="item-header">
                  <span class="item-qnum q-step1">Q2</span>
                  <div class="item-name-block">
                    <span class="item-name"
                      >眩暈是否在位置改變後 5–20 秒才出現（非即刻發生）？</span
                    >
                    <span class="item-sub"
                      >Is there a latency of 5–20 seconds before
                      vertigo onset?</span
                    >
                  </div>
                  <span
                    class="item-val"
                    :class="
                      vertigo_latency === 'yes'
                        ? 'val-ok'
                        : vertigo_latency === 'no'
                          ? 'val-fail'
                          : 'val-nd'
                    "
                    >{{
                      vertigo_latency === null
                        ? "—"
                        : vertigo_latency === "yes"
                          ? "是"
                          : "否"
                    }}</span
                  >
                </div>
                <div class="yn-row">
                  <button
                    class="btn-yn btn-yn-ok"
                    :class="{ 'yn-ok-active': vertigo_latency === 'yes' }"
                    @click="vertigo_latency = 'yes'"
                  >
                    是
                  </button>
                  <button
                    class="btn-yn btn-yn-fail"
                    :class="{ 'yn-fail-active': vertigo_latency === 'no' }"
                    @click="vertigo_latency = 'no'"
                  >
                    否
                  </button>
                </div>
              </div>
              <div
                class="crit-item"
                :class="
                  vertigo_limited === 'yes'
                    ? 'item-ok'
                    : vertigo_limited === 'no'
                      ? 'item-fail'
                      : ''
                "
              >
                <div class="item-header">
                  <span class="item-qnum q-step1">Q3</span>
                  <div class="item-name-block">
                    <span class="item-name">眩暈是否在 60 秒內自然緩解？</span>
                    <span class="item-sub"
                      >Does vertigo resolve within 60 seconds
                      spontaneously?</span
                    >
                  </div>
                  <span
                    class="item-val"
                    :class="
                      vertigo_limited === 'yes'
                        ? 'val-ok'
                        : vertigo_limited === 'no'
                          ? 'val-fail'
                          : 'val-nd'
                    "
                    >{{
                      vertigo_limited === null
                        ? "—"
                        : vertigo_limited === "yes"
                          ? "是"
                          : "否"
                    }}</span
                  >
                </div>
                <div class="yn-row">
                  <button
                    class="btn-yn btn-yn-ok"
                    :class="{ 'yn-ok-active': vertigo_limited === 'yes' }"
                    @click="vertigo_limited = 'yes'"
                  >
                    是
                  </button>
                  <button
                    class="btn-yn btn-yn-fail"
                    :class="{ 'yn-fail-active': vertigo_limited === 'no' }"
                    @click="vertigo_limited = 'no'"
                  >
                    否
                  </button>
                </div>
              </div>
              <div
                class="crit-item"
                :class="
                  vertigo_fatigue === 'yes'
                    ? 'item-ok'
                    : vertigo_fatigue === 'no'
                      ? 'item-fail'
                      : ''
                "
              >
                <div class="item-header">
                  <span class="item-qnum q-step1">Q4</span>
                  <div class="item-name-block">
                    <span class="item-name"
                      >重複相同頭部動作後，眩暈是否逐漸減弱（疲勞性）？</span
                    >
                    <span class="item-sub"
                      >Does vertigo fatigue with repeated
                      maneuvers?</span
                    >
                  </div>
                  <span
                    class="item-val"
                    :class="
                      vertigo_fatigue === 'yes'
                        ? 'val-ok'
                        : vertigo_fatigue === 'no'
                          ? 'val-fail'
                          : 'val-nd'
                    "
                    >{{
                      vertigo_fatigue === null
                        ? "—"
                        : vertigo_fatigue === "yes"
                          ? "是"
                          : "否"
                    }}</span
                  >
                </div>
                <div class="yn-row">
                  <button
                    class="btn-yn btn-yn-ok"
                    :class="{ 'yn-ok-active': vertigo_fatigue === 'yes' }"
                    @click="vertigo_fatigue = 'yes'"
                  >
                    是
                  </button>
                  <button
                    class="btn-yn btn-yn-fail"
                    :class="{ 'yn-fail-active': vertigo_fatigue === 'no' }"
                    @click="vertigo_fatigue = 'no'"
                  >
                    否
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div
            v-if="vertigo_bppvStep1Complete && !vertigo_isPositional"
            class="not-bppv-notice"
          >
            <span
              >⛔ 症狀特徵不符合 BPPV（需具備：位置性 + 潛伏期 + 持續 &lt; 60
              秒）。請考慮其他前庭疾患，或返回分流改選「急性持續性眩暈」進行
              HINTS 評估。</span
            >
          </div>

          <template v-if="vertigo_bppvStep1Complete && vertigo_isPositional">
            <div class="nihss-group">
              <div class="group-header-bar step-bar-2">
                <span class="group-icon">2️⃣</span>
                <span class="group-label-text"
                  >BPPV 步驟 2：Dix-Hallpike 測試</span
                >
                <span class="group-sub-text"
                  >分別測試右側、左側，觀察是否誘發眩暈及眼振</span
                >
                <span
                  class="group-score-tally"
                  :class="
                    vertigo_dhR !== null && vertigo_dhL !== null
                      ? vertigo_dixAnyPos
                        ? 'tally-ok'
                        : 'tally-nd'
                      : 'tally-nd'
                  "
                  >{{
                    vertigo_dhR !== null && vertigo_dhL !== null
                      ? vertigo_dixAnyPos
                        ? "陽性"
                        : "陰性"
                      : "—"
                  }}</span
                >
              </div>
              <div class="item-list">
                <div
                  class="crit-item"
                  :class="
                    vertigo_dhR === 'yes'
                      ? 'item-ok'
                      : vertigo_dhR === 'no'
                        ? 'item-na'
                        : ''
                  "
                >
                  <div class="item-header">
                    <span class="item-qnum q-step2">右側</span>
                    <div class="item-name-block">
                      <span class="item-name">右側 Dix-Hallpike</span>
                      <span class="item-sub"
                        >頭向右轉 45°，快速向後躺，頭懸垂 30°</span
                      >
                    </div>
                    <span
                      class="item-val"
                      :class="vertigo_dhR === 'yes' ? 'val-ok' : 'val-nd'"
                      >{{
                        vertigo_dhR === null
                          ? "—"
                          : vertigo_dhR === "yes"
                            ? "陽性"
                            : "陰性"
                      }}</span
                    >
                  </div>
                  <div class="yn-row">
                    <button
                      class="btn-yn btn-yn-ok"
                      :class="{ 'yn-ok-active': vertigo_dhR === 'yes' }"
                      @click="vertigo_dhR = 'yes'"
                    >
                      陽性（誘發眩暈+眼振）
                    </button>
                    <button
                      class="btn-yn btn-yn-fail"
                      :class="{ 'yn-fail-active': vertigo_dhR === 'no' }"
                      @click="vertigo_dhR = 'no'"
                    >
                      陰性（無誘發）
                    </button>
                  </div>
                </div>
                <div
                  class="crit-item"
                  :class="
                    vertigo_dhL === 'yes'
                      ? 'item-ok'
                      : vertigo_dhL === 'no'
                        ? 'item-na'
                        : ''
                  "
                >
                  <div class="item-header">
                    <span class="item-qnum q-step2">左側</span>
                    <div class="item-name-block">
                      <span class="item-name">左側 Dix-Hallpike</span>
                      <span class="item-sub"
                        >頭向左轉 45°，快速向後躺，頭懸垂 30°</span
                      >
                    </div>
                    <span
                      class="item-val"
                      :class="vertigo_dhL === 'yes' ? 'val-ok' : 'val-nd'"
                      >{{
                        vertigo_dhL === null
                          ? "—"
                          : vertigo_dhL === "yes"
                            ? "陽性"
                            : "陰性"
                      }}</span
                    >
                  </div>
                  <div class="yn-row">
                    <button
                      class="btn-yn btn-yn-ok"
                      :class="{ 'yn-ok-active': vertigo_dhL === 'yes' }"
                      @click="vertigo_dhL = 'yes'"
                    >
                      陽性（誘發眩暈+眼振）
                    </button>
                    <button
                      class="btn-yn btn-yn-fail"
                      :class="{ 'yn-fail-active': vertigo_dhL === 'no' }"
                      @click="vertigo_dhL = 'no'"
                    >
                      陰性（無誘發）
                    </button>
                  </div>
                </div>
              </div>
            </div>
            <div class="nihss-group">
              <div class="group-header-bar step-bar-3">
                <span class="group-icon">3️⃣</span>
                <span class="group-label-text">BPPV 步驟 3：眼振類型判讀</span>
                <span class="group-sub-text"
                  >Dix-Hallpike 陽性時觀察眼振方向與型態</span
                >
              </div>
              <div class="vertigo_nyst-grid">
                <button
                  class="vertigo_nyst-btn nopt-pc"
                  :class="{
                    'vertigo_nyst-active':
                      vertigo_nystType === 'upbeat_torsional',
                  }"
                  @click="vertigo_nystType = 'upbeat_torsional'"
                >
                  <span class="nopt-label">向上跳動＋旋轉性</span>
                  <span class="nopt-sub"
                    >上極朝患側耳 → 後半規管 BPPV（最常見 85–95%）</span
                  >
                </button>
                <button
                  class="vertigo_nyst-btn nopt-ac"
                  :class="{
                    'vertigo_nyst-active':
                      vertigo_nystType === 'downbeat_torsional',
                  }"
                  @click="vertigo_nystType = 'downbeat_torsional'"
                >
                  <span class="nopt-label">向下跳動＋旋轉性</span>
                  <span class="nopt-sub"
                    >下跳性眼振，少見 → 前半規管 BPPV（需排除小腦梗塞）</span
                  >
                </button>
                <button
                  class="vertigo_nyst-btn nopt-hc"
                  :class="{
                    'vertigo_nyst-active': vertigo_nystType === 'horizontal',
                  }"
                  @click="vertigo_nystType = 'horizontal'"
                >
                  <span class="nopt-label">水平性眼振</span>
                  <span class="nopt-sub"
                    >純水平眼振，無旋轉成分 → 水平半規管 BPPV（需 Roll Test
                    5–15%）</span
                  >
                </button>
                <button
                  class="vertigo_nyst-btn nopt-none"
                  :class="{
                    'vertigo_nyst-active': vertigo_nystType === 'none',
                  }"
                  @click="vertigo_nystType = 'none'"
                >
                  <span class="nopt-label">無眼振誘發</span>
                  <span class="nopt-sub"
                    >Dix-Hallpike 陰性，可能已自行緩解或需 Roll Test</span
                  >
                </button>
              </div>
            </div>
            <div
              v-if="
                vertigo_nystType === 'horizontal' || vertigo_nystType === 'none'
              "
              class="nihss-group"
            >
              <div class="group-header-bar step-bar-4">
                <span class="group-icon">4️⃣</span>
                <span class="group-label-text"
                  >BPPV 步驟 4：Roll Test（Supine Head Roll）</span
                >
                <span class="group-sub-text"
                  >患者平躺，頭部向左右各轉 90°，觀察眼振</span
                >
              </div>
              <div class="vertigo_nyst-grid">
                <button
                  class="vertigo_nyst-btn nopt-hc"
                  :class="{
                    'vertigo_nyst-active': vertigo_rollTest === 'geotropic',
                  }"
                  @click="vertigo_rollTest = 'geotropic'"
                >
                  <span class="nopt-label">地向性（Geotropic）</span>
                  <span class="nopt-sub"
                    >雙側均出現朝地面方向的水平眼振 → HC-BPPV
                    管石症，眼振較強側為患側</span
                  >
                </button>
                <button
                  class="vertigo_nyst-btn nopt-ac"
                  :class="{
                    'vertigo_nyst-active': vertigo_rollTest === 'apogeotropic',
                  }"
                  @click="vertigo_rollTest = 'apogeotropic'"
                >
                  <span class="nopt-label">背地性（Apogeotropic）</span>
                  <span class="nopt-sub"
                    >雙側均出現遠離地面方向的水平眼振 → HC-BPPV 壺腹石症</span
                  >
                </button>
                <button
                  class="vertigo_nyst-btn nopt-none"
                  :class="{
                    'vertigo_nyst-active': vertigo_rollTest === 'negative',
                  }"
                  @click="vertigo_rollTest = 'negative'"
                >
                  <span class="nopt-label">陰性（無眼振）</span>
                  <span class="nopt-sub"
                    >無誘發眼振，考慮 Probable BPPV 或非 BPPV 病因</span
                  >
                </button>
              </div>
              <div
                v-if="vertigo_rollTest === 'geotropic'"
                class="nihss-group"
                style="margin-top: 0.75rem; margin-bottom: 0"
              >
                <div class="group-header-bar step-bar-4">
                  <span class="group-icon">↔</span
                  ><span class="group-label-text"
                    >眼振較強側（Geotropic 患側判斷）</span
                  >
                </div>
                <div
                  class="yn-row"
                  style="
                    border: 1px solid var(--vp-c-divider);
                    border-radius: 10px;
                    overflow: hidden;
                  "
                >
                  <button
                    class="btn-yn btn-yn-ok"
                    :class="{ 'yn-ok-active': vertigo_heavierSide === 'right' }"
                    @click="vertigo_heavierSide = 'right'"
                  >
                    右側眼振較強（右側患側）
                  </button>
                  <button
                    class="btn-yn btn-yn-ok"
                    :class="{ 'yn-ok-active': vertigo_heavierSide === 'left' }"
                    @click="vertigo_heavierSide = 'left'"
                  >
                    左側眼振較強（左側患側）
                  </button>
                </div>
              </div>
            </div>
          </template>

          <div
            v-if="vertigo_showResults && vertigo_bppvStep1Complete"
            class="results-detail"
          >
            <div class="results-header">BPPV 評估明細</div>
            <div class="detail-row">
              <span
                class="detail-qnum"
                :class="vertigo_posVert === 'yes' ? 'dq-p' : 'dq-c'"
                >Q1</span
              >
              <span class="detail-domain">位置性眩暈</span>
              <span
                class="detail-score"
                :class="vertigo_posVert === 'yes' ? 'ds-periph' : 'ds-central'"
                >{{ vertigo_posVert === "yes" ? "是" : "否" }}</span
              >
            </div>
            <div class="detail-row">
              <span
                class="detail-qnum"
                :class="vertigo_latency === 'yes' ? 'dq-p' : 'dq-c'"
                >Q2</span
              >
              <span class="detail-domain">潛伏期 5–20s</span>
              <span
                class="detail-score"
                :class="vertigo_latency === 'yes' ? 'ds-periph' : 'ds-central'"
                >{{ vertigo_latency === "yes" ? "是" : "否" }}</span
              >
            </div>
            <div class="detail-row">
              <span
                class="detail-qnum"
                :class="vertigo_limited === 'yes' ? 'dq-p' : 'dq-c'"
                >Q3</span
              >
              <span class="detail-domain">持續 &lt; 60s</span>
              <span
                class="detail-score"
                :class="vertigo_limited === 'yes' ? 'ds-periph' : 'ds-central'"
                >{{ vertigo_limited === "yes" ? "是" : "否" }}</span
              >
            </div>
            <div class="detail-row">
              <span
                class="detail-qnum"
                :class="vertigo_fatigue === 'yes' ? 'dq-p' : 'dq-c'"
                >Q4</span
              >
              <span class="detail-domain">疲勞性</span>
              <span
                class="detail-score"
                :class="vertigo_fatigue === 'yes' ? 'ds-periph' : 'ds-central'"
                >{{ vertigo_fatigue === "yes" ? "是" : "否" }}</span
              >
            </div>
            <div class="detail-row detail-total">
              <span class="detail-qnum">∑</span>
              <span class="detail-domain">BPPV 診斷</span>
              <span class="detail-score detail-score-brand">{{
                vertigo_canal ? vertigo_canal.toUpperCase() : "N/A"
              }}</span>
              <span class="detail-desc">{{
                vertigo_bppvResult.dx ||
                vertigo_bppvResult.level.substring(0, 10)
              }}</span>
            </div>
          </div>

          <div class="result-card" :class="vertigo_bppvResult.color">
            <div class="result-left">
              <span class="result-number" style="font-size: 2.5rem">{{
                vertigo_canal === "posterior"
                  ? "PC"
                  : vertigo_canal === "horizontal"
                    ? "HC"
                    : vertigo_canal === "anterior"
                      ? "AC"
                      : "—"
              }}</span>
            </div>
            <div class="result-right">
              <span class="result-ver"
                >BPPV Decision Tree · Bárány Society 2015</span
              >
              <span class="result-level">{{ vertigo_bppvResult.level }}</span>
              <span class="result-advice">{{ vertigo_bppvResult.advice }}</span>
            </div>
          </div>
        </template>

        <!-- ══════════════ TAB: AUVP ═════════════════════════════════════ -->
        <template v-else-if="vertigo_isTabAuvp">
          <div class="prereq-notice">
            <span class="pn-icon">🧠</span>
            <span
              ><strong>使用時機：</strong>HINTS
              三項均為周圍性後，或急性持續性眩暈伴自發性眼振但未完成 HINTS
              時。<strong>前提：已排除中樞性病因。</strong>若有急性聽力損失，診斷為迷路炎（Labyrinthitis），非單純
              AUVP。</span
            >
          </div>

          <!-- A -->
          <div class="nihss-group">
            <div class="group-header-bar auvp-bar-a">
              <span class="group-icon">🅐</span>
              <span class="group-label-text">標準 A：急性持續性眩暈發作</span>
              <span class="group-sub-text"
                >持續 ≥24 小時，非位置性，伴步態不穩及噁心</span
              >
              <span
                class="group-score-tally"
                :class="
                  vertigo_aAComplete
                    ? vertigo_aAMet
                      ? 'tally-ok'
                      : 'tally-abn'
                    : 'tally-nd'
                "
                >{{
                  vertigo_aAComplete
                    ? vertigo_aAMet
                      ? "✓ 達標"
                      : "✗ 未達"
                    : "—"
                }}</span
              >
            </div>
            <div class="item-list">
              <div
                class="crit-item"
                :class="
                  vertigo_aa1 === 'yes'
                    ? 'item-ok'
                    : vertigo_aa1 === 'no'
                      ? 'item-fail'
                      : ''
                "
              >
                <div class="item-header">
                  <span class="item-qnum q-a">A1</span>
                  <div class="item-name-block">
                    <span class="item-name"
                      >急性發作的持續性眩暈，持續 ≥24 小時？</span
                    >
                    <span class="item-sub"
                      >Acute onset of sustained vertigo lasting ≥24 hours</span
                    >
                  </div>
                  <span
                    class="item-val"
                    :class="
                      vertigo_aa1 === 'yes'
                        ? 'val-ok'
                        : vertigo_aa1 === 'no'
                          ? 'val-fail'
                          : 'val-nd'
                    "
                    >{{
                      vertigo_aa1 === null
                        ? "—"
                        : vertigo_aa1 === "yes"
                          ? "是"
                          : "否"
                    }}</span
                  >
                </div>
                <div class="yn-row">
                  <button
                    class="btn-yn btn-yn-ok"
                    :class="{ 'yn-ok-active': vertigo_aa1 === 'yes' }"
                    @click="vertigo_aa1 = 'yes'"
                  >
                    是
                  </button>
                  <button
                    class="btn-yn btn-yn-fail"
                    :class="{ 'yn-fail-active': vertigo_aa1 === 'no' }"
                    @click="vertigo_aa1 = 'no'"
                  >
                    否
                  </button>
                </div>
              </div>
              <div
                class="crit-item"
                :class="
                  vertigo_aa2 === 'yes'
                    ? 'item-ok'
                    : vertigo_aa2 === 'no'
                      ? 'item-fail'
                      : ''
                "
              >
                <div class="item-header">
                  <span class="item-qnum q-a">A2</span>
                  <div class="item-name-block">
                    <span class="item-name"
                      >眩暈為非位置性（靜止時仍持續）？</span
                    >
                    <span class="item-sub"
                      >Non-positional: present even at rest</span
                    >
                  </div>
                  <span
                    class="item-val"
                    :class="
                      vertigo_aa2 === 'yes'
                        ? 'val-ok'
                        : vertigo_aa2 === 'no'
                          ? 'val-fail'
                          : 'val-nd'
                    "
                    >{{
                      vertigo_aa2 === null
                        ? "—"
                        : vertigo_aa2 === "yes"
                          ? "是"
                          : "否"
                    }}</span
                  >
                </div>
                <div class="yn-row">
                  <button
                    class="btn-yn btn-yn-ok"
                    :class="{ 'yn-ok-active': vertigo_aa2 === 'yes' }"
                    @click="vertigo_aa2 = 'yes'"
                  >
                    是（靜止時仍有）
                  </button>
                  <button
                    class="btn-yn btn-yn-fail"
                    :class="{ 'yn-fail-active': vertigo_aa2 === 'no' }"
                    @click="vertigo_aa2 = 'no'"
                  >
                    否（僅位置性）
                  </button>
                </div>
              </div>
              <div
                class="crit-item"
                :class="
                  vertigo_aa3 === 'yes'
                    ? 'item-ok'
                    : vertigo_aa3 === 'no'
                      ? 'item-fail'
                      : ''
                "
              >
                <div class="item-header">
                  <span class="item-qnum q-a">A3</span>
                  <div class="item-name-block">
                    <span class="item-name">伴有步態不穩及噁心/嘔吐？</span>
                    <span class="item-sub"
                      >Accompanied by gait instability and nausea/vomiting</span
                    >
                  </div>
                  <span
                    class="item-val"
                    :class="
                      vertigo_aa3 === 'yes'
                        ? 'val-ok'
                        : vertigo_aa3 === 'no'
                          ? 'val-fail'
                          : 'val-nd'
                    "
                    >{{
                      vertigo_aa3 === null
                        ? "—"
                        : vertigo_aa3 === "yes"
                          ? "是"
                          : "否"
                    }}</span
                  >
                </div>
                <div class="yn-row">
                  <button
                    class="btn-yn btn-yn-ok"
                    :class="{ 'yn-ok-active': vertigo_aa3 === 'yes' }"
                    @click="vertigo_aa3 = 'yes'"
                  >
                    是
                  </button>
                  <button
                    class="btn-yn btn-yn-fail"
                    :class="{ 'yn-fail-active': vertigo_aa3 === 'no' }"
                    @click="vertigo_aa3 = 'no'"
                  >
                    否
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- B -->
          <div class="nihss-group">
            <div class="group-header-bar auvp-bar-b">
              <span class="group-icon">🅑</span>
              <span class="group-label-text">標準 B：自發性水平扭轉性眼振</span>
              <span class="group-sub-text"
                >固定方向，去除視覺固定後增強（Frenzel 眼鏡）</span
              >
              <span
                class="group-score-tally"
                :class="
                  vertigo_aBComplete
                    ? vertigo_aBMet
                      ? 'tally-ok'
                      : 'tally-abn'
                    : 'tally-nd'
                "
                >{{
                  vertigo_aBComplete
                    ? vertigo_aBMet
                      ? "✓ 達標"
                      : "✗ 未達"
                    : "—"
                }}</span
              >
            </div>
            <div class="item-list">
              <div
                class="crit-item"
                :class="
                  vertigo_ab1 === 'yes'
                    ? 'item-ok'
                    : vertigo_ab1 === 'no'
                      ? 'item-fail'
                      : ''
                "
              >
                <div class="item-header">
                  <span class="item-qnum q-b">B1</span>
                  <div class="item-name-block">
                    <span class="item-name"
                      >存在自發性眼振（靜止時可見）？</span
                    >
                    <span class="item-sub"
                      >Spontaneous nystagmus present at rest</span
                    >
                  </div>
                  <span
                    class="item-val"
                    :class="
                      vertigo_ab1 === 'yes'
                        ? 'val-ok'
                        : vertigo_ab1 === 'no'
                          ? 'val-fail'
                          : 'val-nd'
                    "
                    >{{
                      vertigo_ab1 === null
                        ? "—"
                        : vertigo_ab1 === "yes"
                          ? "是"
                          : "否"
                    }}</span
                  >
                </div>
                <div class="yn-row">
                  <button
                    class="btn-yn btn-yn-ok"
                    :class="{ 'yn-ok-active': vertigo_ab1 === 'yes' }"
                    @click="vertigo_ab1 = 'yes'"
                  >
                    是
                  </button>
                  <button
                    class="btn-yn btn-yn-fail"
                    :class="{ 'yn-fail-active': vertigo_ab1 === 'no' }"
                    @click="vertigo_ab1 = 'no'"
                  >
                    否
                  </button>
                </div>
              </div>
              <div
                class="crit-item"
                :class="
                  vertigo_ab2 === 'yes'
                    ? 'item-ok'
                    : vertigo_ab2 === 'no'
                      ? 'item-fail'
                      : ''
                "
              >
                <div class="item-header">
                  <span class="item-qnum q-b">B2</span>
                  <div class="item-name-block">
                    <span class="item-name"
                      >眼振為水平扭轉混合性（horizontal-torsional）？</span
                    >
                    <span class="item-sub"
                      >Nystagmus is horizontal-torsional (not purely
                      vertical)</span
                    >
                  </div>
                  <span
                    class="item-val"
                    :class="
                      vertigo_ab2 === 'yes'
                        ? 'val-ok'
                        : vertigo_ab2 === 'no'
                          ? 'val-fail'
                          : 'val-nd'
                    "
                    >{{
                      vertigo_ab2 === null
                        ? "—"
                        : vertigo_ab2 === "yes"
                          ? "是"
                          : "否"
                    }}</span
                  >
                </div>
                <div class="yn-row">
                  <button
                    class="btn-yn btn-yn-ok"
                    :class="{ 'yn-ok-active': vertigo_ab2 === 'yes' }"
                    @click="vertigo_ab2 = 'yes'"
                  >
                    是（水平扭轉）
                  </button>
                  <button
                    class="btn-yn btn-yn-fail"
                    :class="{ 'yn-fail-active': vertigo_ab2 === 'no' }"
                    @click="vertigo_ab2 = 'no'"
                  >
                    否（純垂直或純扭轉）
                  </button>
                </div>
              </div>
              <div
                class="crit-item"
                :class="
                  vertigo_ab3 === 'yes'
                    ? 'item-ok'
                    : vertigo_ab3 === 'no'
                      ? 'item-fail'
                      : ''
                "
              >
                <div class="item-header">
                  <span class="item-qnum q-b">B3</span>
                  <div class="item-name-block">
                    <span class="item-name"
                      >眼振方向固定（快相朝同一側），去除視覺固定後增強？</span
                    >
                    <span class="item-sub"
                      >Unidirectional fast phase, enhanced by removing visual
                      fixation</span
                    >
                  </div>
                  <span
                    class="item-val"
                    :class="
                      vertigo_ab3 === 'yes'
                        ? 'val-ok'
                        : vertigo_ab3 === 'no'
                          ? 'val-fail'
                          : 'val-nd'
                    "
                    >{{
                      vertigo_ab3 === null
                        ? "—"
                        : vertigo_ab3 === "yes"
                          ? "是"
                          : "否"
                    }}</span
                  >
                </div>
                <div class="yn-row">
                  <button
                    class="btn-yn btn-yn-ok"
                    :class="{ 'yn-ok-active': vertigo_ab3 === 'yes' }"
                    @click="vertigo_ab3 = 'yes'"
                  >
                    是
                  </button>
                  <button
                    class="btn-yn btn-yn-fail"
                    :class="{ 'yn-fail-active': vertigo_ab3 === 'no' }"
                    @click="vertigo_ab3 = 'no'"
                  >
                    否
                  </button>
                </div>
              </div>
              <div
                class="crit-item"
                :class="
                  vertigo_ab4 === 'yes'
                    ? 'item-ok'
                    : vertigo_ab4 === 'no'
                      ? 'item-fail'
                      : ''
                "
              >
                <div class="item-header">
                  <span class="item-qnum q-b">B4</span>
                  <div class="item-name-block">
                    <span class="item-name"
                      >眼振非純垂直或純扭轉性？（純垂直/純扭轉 →
                      中樞警訊）</span
                    >
                    <span class="item-sub"
                      >NOT purely vertical or purely torsional (those suggest
                      central)</span
                    >
                  </div>
                  <span
                    class="item-val"
                    :class="
                      vertigo_ab4 === 'yes'
                        ? 'val-ok'
                        : vertigo_ab4 === 'no'
                          ? 'val-fail'
                          : 'val-nd'
                    "
                    >{{
                      vertigo_ab4 === null
                        ? "—"
                        : vertigo_ab4 === "yes"
                          ? "確認"
                          : "警示"
                    }}</span
                  >
                </div>
                <div class="yn-row">
                  <button
                    class="btn-yn btn-yn-ok"
                    :class="{ 'yn-ok-active': vertigo_ab4 === 'yes' }"
                    @click="vertigo_ab4 = 'yes'"
                  >
                    確認（非純垂直/純扭轉）
                  </button>
                  <button
                    class="btn-yn btn-yn-fail"
                    :class="{ 'yn-fail-active': vertigo_ab4 === 'no' }"
                    @click="vertigo_ab4 = 'no'"
                  >
                    警示（純垂直或純扭轉）
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- C -->
          <div class="nihss-group">
            <div class="group-header-bar auvp-bar-c">
              <span class="group-icon">🅒</span>
              <span class="group-label-text">標準 C：患側 VOR 不對稱</span>
              <span class="group-sub-text"
                >HIT 補正掃視（患側朝向）+ caloric 麻痺，或 vHIT
                增益不對稱</span
              >
              <span
                class="group-score-tally"
                :class="
                  vertigo_aCComplete
                    ? vertigo_aCMet
                      ? 'tally-ok'
                      : 'tally-abn'
                    : 'tally-nd'
                "
                >{{
                  vertigo_aCComplete
                    ? vertigo_aCMet
                      ? "✓ 達標"
                      : "✗ 未達"
                    : "—"
                }}</span
              >
            </div>
            <div class="item-list">
              <div
                class="crit-item"
                :class="
                  vertigo_ac1 === 'yes'
                    ? 'item-ok'
                    : vertigo_ac1 === 'no'
                      ? 'item-fail'
                      : ''
                "
              >
                <div class="item-header">
                  <span class="item-qnum q-c">C1</span>
                  <div class="item-name-block">
                    <span class="item-name"
                      >HIT 顯示患側（同側於眼振慢相側）有補正掃視？</span
                    >
                    <span class="item-sub"
                      >Abnormal HIT ipsilesional (corrective saccade toward the
                      affected side)</span
                    >
                  </div>
                  <span
                    class="item-val"
                    :class="
                      vertigo_ac1 === 'yes'
                        ? 'val-ok'
                        : vertigo_ac1 === 'no'
                          ? 'val-fail'
                          : 'val-nd'
                    "
                    >{{
                      vertigo_ac1 === null
                        ? "—"
                        : vertigo_ac1 === "yes"
                          ? "是"
                          : "否"
                    }}</span
                  >
                </div>
                <div class="yn-row">
                  <button
                    class="btn-yn btn-yn-ok"
                    :class="{ 'yn-ok-active': vertigo_ac1 === 'yes' }"
                    @click="vertigo_ac1 = 'yes'"
                  >
                    是（患側補正掃視）
                  </button>
                  <button
                    class="btn-yn btn-yn-fail"
                    :class="{ 'yn-fail-active': vertigo_ac1 === 'no' }"
                    @click="vertigo_ac1 = 'no'"
                  >
                    否
                  </button>
                </div>
              </div>
              <div
                class="crit-item"
                :class="
                  vertigo_ac2 === 'yes'
                    ? 'item-ok'
                    : vertigo_ac2 === 'no'
                      ? 'item-fail'
                      : ''
                "
              >
                <div class="item-header">
                  <span class="item-qnum q-c">C2</span>
                  <div class="item-name-block">
                    <span class="item-name"
                      >VOR 不對稱已確認（caloric CP ≥25% 或 vHIT
                      增益不對稱）？</span
                    >
                    <span class="item-sub"
                      >VOR asymmetry confirmed: caloric vertigo_canal paresis
                      ≥25% or vHIT gain asymmetry</span
                    >
                  </div>
                  <span
                    class="item-val"
                    :class="
                      vertigo_ac2 === 'yes'
                        ? 'val-ok'
                        : vertigo_ac2 === 'no'
                          ? 'val-fail'
                          : 'val-nd'
                    "
                    >{{
                      vertigo_ac2 === null
                        ? "—"
                        : vertigo_ac2 === "yes"
                          ? "是"
                          : "否"
                    }}</span
                  >
                </div>
                <div class="yn-row">
                  <button
                    class="btn-yn btn-yn-ok"
                    :class="{ 'yn-ok-active': vertigo_ac2 === 'yes' }"
                    @click="vertigo_ac2 = 'yes'"
                  >
                    是（VOR 不對稱確認）
                  </button>
                  <button
                    class="btn-yn btn-yn-fail"
                    :class="{ 'yn-fail-active': vertigo_ac2 === 'no' }"
                    @click="vertigo_ac2 = 'no'"
                  >
                    否（未確認/臨床HIT足夠）
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- D -->
          <div class="nihss-group">
            <div class="group-header-bar auvp-bar-d">
              <span class="group-icon">🅓</span>
              <span class="group-label-text">標準 D：排除中樞體徵</span>
              <span class="group-sub-text"
                >無凝視誘發眼振、無顯著斜偏、無急性聽力症狀</span
              >
              <span
                class="group-score-tally"
                :class="
                  vertigo_aDComplete
                    ? vertigo_aDMet
                      ? 'tally-ok'
                      : 'tally-abn'
                    : 'tally-nd'
                "
                >{{
                  vertigo_aDComplete
                    ? vertigo_aDMet
                      ? "✓ 達標"
                      : "✗ 未達"
                    : "—"
                }}</span
              >
            </div>
            <div class="item-list">
              <div
                class="crit-item"
                :class="
                  vertigo_ad1 === 'yes'
                    ? 'item-ok'
                    : vertigo_ad1 === 'no'
                      ? 'item-fail'
                      : ''
                "
              >
                <div class="item-header">
                  <span class="item-qnum q-d">D1</span>
                  <div class="item-name-block">
                    <span class="item-name">無凝視誘發性眼振（GEN）？</span>
                    <span class="item-sub">No gaze-evoked nystagmus (GEN)</span>
                  </div>
                  <span
                    class="item-val"
                    :class="
                      vertigo_ad1 === 'yes'
                        ? 'val-ok'
                        : vertigo_ad1 === 'no'
                          ? 'val-fail'
                          : 'val-nd'
                    "
                    >{{
                      vertigo_ad1 === null
                        ? "—"
                        : vertigo_ad1 === "yes"
                          ? "是"
                          : "否"
                    }}</span
                  >
                </div>
                <div class="yn-row">
                  <button
                    class="btn-yn btn-yn-ok"
                    :class="{ 'yn-ok-active': vertigo_ad1 === 'yes' }"
                    @click="vertigo_ad1 = 'yes'"
                  >
                    是（無 GEN）
                  </button>
                  <button
                    class="btn-yn btn-yn-fail"
                    :class="{ 'yn-fail-active': vertigo_ad1 === 'no' }"
                    @click="vertigo_ad1 = 'no'"
                  >
                    否（有 GEN → 中樞警訊）
                  </button>
                </div>
              </div>
              <div
                class="crit-item"
                :class="
                  vertigo_ad2 === 'yes'
                    ? 'item-ok'
                    : vertigo_ad2 === 'no'
                      ? 'item-fail'
                      : ''
                "
              >
                <div class="item-header">
                  <span class="item-qnum q-d">D2</span>
                  <div class="item-name-block">
                    <span class="item-name"
                      >無顯著斜偏（Skew Deviation）？</span
                    >
                    <span class="item-sub"
                      >No significant vertigo_skew deviation</span
                    >
                  </div>
                  <span
                    class="item-val"
                    :class="
                      vertigo_ad2 === 'yes'
                        ? 'val-ok'
                        : vertigo_ad2 === 'no'
                          ? 'val-fail'
                          : 'val-nd'
                    "
                    >{{
                      vertigo_ad2 === null
                        ? "—"
                        : vertigo_ad2 === "yes"
                          ? "是"
                          : "否"
                    }}</span
                  >
                </div>
                <div class="yn-row">
                  <button
                    class="btn-yn btn-yn-ok"
                    :class="{ 'yn-ok-active': vertigo_ad2 === 'yes' }"
                    @click="vertigo_ad2 = 'yes'"
                  >
                    是（無斜偏）
                  </button>
                  <button
                    class="btn-yn btn-yn-fail"
                    :class="{ 'yn-fail-active': vertigo_ad2 === 'no' }"
                    @click="vertigo_ad2 = 'no'"
                  >
                    否（有斜偏 → 中樞警訊）
                  </button>
                </div>
              </div>
              <div
                class="crit-item"
                :class="
                  vertigo_ad3 === 'yes'
                    ? 'item-ok'
                    : vertigo_ad3 === 'no'
                      ? 'item-fail'
                      : ''
                "
              >
                <div class="item-header">
                  <span class="item-qnum q-d">D3</span>
                  <div class="item-name-block">
                    <span class="item-name"
                      >無急性聽力損失或耳蝸症狀？（有 → 迷路炎，非 AUVP）</span
                    >
                    <span class="item-sub"
                      >No acute vertigo_hearing loss (if present, diagnose
                      Labyrinthitis, not AUVP)</span
                    >
                  </div>
                  <span
                    class="item-val"
                    :class="
                      vertigo_ad3 === 'yes'
                        ? 'val-ok'
                        : vertigo_ad3 === 'no'
                          ? 'val-fail'
                          : 'val-nd'
                    "
                    >{{
                      vertigo_ad3 === null
                        ? "—"
                        : vertigo_ad3 === "yes"
                          ? "是"
                          : "否"
                    }}</span
                  >
                </div>
                <div class="yn-row">
                  <button
                    class="btn-yn btn-yn-ok"
                    :class="{ 'yn-ok-active': vertigo_ad3 === 'yes' }"
                    @click="vertigo_ad3 = 'yes'"
                  >
                    是（無聽損）
                  </button>
                  <button
                    class="btn-yn btn-yn-fail"
                    :class="{ 'yn-fail-active': vertigo_ad3 === 'no' }"
                    @click="vertigo_ad3 = 'no'"
                  >
                    否（有聽損 → 改診迷路炎）
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- E -->
          <div class="nihss-group">
            <div class="group-header-bar auvp-bar-e">
              <span class="group-icon">🅔</span>
              <span class="group-label-text">標準 E：排除其他診斷</span>
              <span class="group-sub-text">不能更好地以其他前庭疾患解釋</span>
              <span
                class="group-score-tally"
                :class="
                  vertigo_aEComplete
                    ? vertigo_aEMet
                      ? 'tally-ok'
                      : 'tally-abn'
                    : 'tally-nd'
                "
                >{{
                  vertigo_aEComplete
                    ? vertigo_aEMet
                      ? "✓ 達標"
                      : "✗ 未達"
                    : "—"
                }}</span
              >
            </div>
            <div
              class="crit-item"
              :class="
                vertigo_ae1 === 'yes'
                  ? 'item-ok'
                  : vertigo_ae1 === 'no'
                    ? 'item-fail'
                    : ''
              "
            >
              <div class="item-header">
                <span class="item-qnum q-e">E</span>
                <div class="item-name-block">
                  <span class="item-name"
                    >症狀無法以其他前庭疾患（BPPV、梅尼爾氏症、VM、中樞病變）更好解釋？</span
                  >
                  <span class="item-sub"
                    >Not better accounted for by another vestibular or central
                    diagnosis</span
                  >
                </div>
                <span
                  class="item-val"
                  :class="
                    vertigo_ae1 === 'yes'
                      ? 'val-ok'
                      : vertigo_ae1 === 'no'
                        ? 'val-fail'
                        : 'val-nd'
                  "
                  >{{
                    vertigo_ae1 === null
                      ? "—"
                      : vertigo_ae1 === "yes"
                        ? "是"
                        : "否"
                  }}</span
                >
              </div>
              <div class="yn-row">
                <button
                  class="btn-yn btn-yn-ok"
                  :class="{ 'yn-ok-active': vertigo_ae1 === 'yes' }"
                  @click="vertigo_ae1 = 'yes'"
                >
                  是（已排除）
                </button>
                <button
                  class="btn-yn btn-yn-fail"
                  :class="{ 'yn-fail-active': vertigo_ae1 === 'no' }"
                  @click="vertigo_ae1 = 'no'"
                >
                  否（尚未排除）
                </button>
              </div>
            </div>
          </div>

          <div v-if="vertigo_auvpAnswered > 0" class="sub-score-row">
            <div
              class="sub-score-card"
              :class="
                !vertigo_aAComplete
                  ? 'ss-nd'
                  : vertigo_aAMet
                    ? 'ss-teal'
                    : 'ss-fail'
              "
            >
              <span class="ss-label">A·持續眩暈</span
              ><span class="ss-val">{{
                !vertigo_aAComplete ? "—" : vertigo_aAMet ? "✓" : "✗"
              }}</span>
            </div>
            <div
              class="sub-score-card"
              :class="
                !vertigo_aBComplete
                  ? 'ss-nd'
                  : vertigo_aBMet
                    ? 'ss-teal'
                    : 'ss-fail'
              "
            >
              <span class="ss-label">B·水平扭轉振</span
              ><span class="ss-val">{{
                !vertigo_aBComplete ? "—" : vertigo_aBMet ? "✓" : "✗"
              }}</span>
            </div>
            <div
              class="sub-score-card"
              :class="
                !vertigo_aCComplete
                  ? 'ss-nd'
                  : vertigo_aCMet
                    ? 'ss-teal'
                    : 'ss-fail'
              "
            >
              <span class="ss-label">C·VOR不對稱</span
              ><span class="ss-val">{{
                !vertigo_aCComplete ? "—" : vertigo_aCMet ? "✓" : "✗"
              }}</span>
            </div>
            <div
              class="sub-score-card"
              :class="
                !vertigo_aDComplete
                  ? 'ss-nd'
                  : vertigo_aDMet
                    ? 'ss-teal'
                    : 'ss-fail'
              "
            >
              <span class="ss-label">D·排除中樞</span
              ><span class="ss-val">{{
                !vertigo_aDComplete ? "—" : vertigo_aDMet ? "✓" : "✗"
              }}</span>
            </div>
            <div
              class="sub-score-card"
              :class="
                !vertigo_aEComplete
                  ? 'ss-nd'
                  : vertigo_aEMet
                    ? 'ss-teal'
                    : 'ss-fail'
              "
            >
              <span class="ss-label">E·排除其他</span
              ><span class="ss-val">{{
                !vertigo_aEComplete ? "—" : vertigo_aEMet ? "✓" : "✗"
              }}</span>
            </div>
          </div>

          <div
            v-if="vertigo_showResults && vertigo_auvpAllComplete"
            class="results-detail"
          >
            <div class="results-header">AUVP 評估明細</div>
            <div
              v-for="row in [
                { q: 'A', label: '持續性眩暈 ≥24h', met: vertigo_aAMet },
                { q: 'B', label: '水平扭轉眼振', met: vertigo_aBMet },
                { q: 'C', label: 'VOR 不對稱', met: vertigo_aCMet },
                { q: 'D', label: '排除中樞體徵', met: vertigo_aDMet },
                { q: 'E', label: '排除其他診斷', met: vertigo_aEMet },
              ]"
              :key="row.q"
              class="detail-row"
            >
              <span class="detail-qnum" :class="row.met ? 'dq-p' : 'dq-c'">{{
                row.q
              }}</span>
              <span class="detail-domain">{{ row.label }}</span>
              <span
                class="detail-score"
                :class="row.met ? 'ds-periph' : 'ds-central'"
                >{{ row.met ? "✓ 達標" : "✗ 未達" }}</span
              >
            </div>
            <div class="detail-row detail-total">
              <span class="detail-qnum">∑</span>
              <span class="detail-domain">AUVP 判讀</span>
              <span class="detail-score detail-score-brand"
                >{{ vertigo_auvpMetCount }}/5</span
              >
              <span class="detail-desc">{{
                vertigo_auvpResult.dx ||
                vertigo_auvpResult.level.substring(0, 8)
              }}</span>
            </div>
          </div>

          <div class="result-card" :class="vertigo_auvpResult.color">
            <div class="result-left">
              <span class="result-number" style="font-size: 2.5rem">{{
                vertigo_auvpAllComplete ? vertigo_auvpMetCount : "—"
              }}</span>
              <span class="result-max" v-if="vertigo_auvpAllComplete">/5</span>
            </div>
            <div class="result-right">
              <span class="result-ver"
                >AUVP / 前庭神經炎 · Strupp et al. J Vestib Res 2022</span
              >
              <span class="result-level">{{ vertigo_auvpResult.level }}</span>
              <span class="result-advice">{{ vertigo_auvpResult.advice }}</span>
            </div>
          </div>
        </template>

        <!-- ══════════════ TAB: VM / MD ══════════════════════════════════ -->
        <template v-else-if="vertigo_isTabVmmd">
          <!-- Sub-mode selector -->
          <div class="nihss-group">
            <div class="group-header-bar vmmd-bar">
              <span class="group-icon">🔁</span>
              <span class="group-label-text">選擇評估疾病</span>
              <span class="group-sub-text"
                >反覆性眩暈：前庭性偏頭痛（VM）· 確定梅尼爾氏症（Definite MD）·
                可能梅尼爾氏症（Probable MD）</span
              >
            </div>
            <div class="vmmd-grid">
              <button
                class="vmmd-btn"
                :class="{ 'vmmd-active-vm': vertigo_vmmdMode === 'vm' }"
                @click="vertigo_setVmmdMode('vm')"
              >
                <span class="vmmd-icon">🧠</span>
                <span class="vmmd-label">前庭性偏頭痛（VM）</span>
                <span class="vmmd-sub"
                  >Bárány/IHS · A+B+C+D · 需偏頭痛病史</span
                >
                <span class="vmmd-badge" :class="vertigo_vmBadgeClass">{{
                  vertigo_vmBadgeText
                }}</span>
              </button>
              <button
                class="vmmd-btn"
                :class="{
                  'vmmd-active-md': vertigo_vmmdMode === 'definite_md',
                }"
                @click="vertigo_setVmmdMode('definite_md')"
              >
                <span class="vmmd-icon">👂</span>
                <span class="vmmd-label">確定梅尼爾氏症（Definite）</span>
                <span class="vmmd-sub">需聽力圖記錄低頻 SNHL · A+B+C+D</span>
                <span class="vmmd-badge" :class="vertigo_mdBadgeClass">{{
                  vertigo_mdBadgeText
                }}</span>
              </button>
              <button
                class="vmmd-btn"
                :class="{
                  'vmmd-active-pmd': vertigo_vmmdMode === 'probable_md',
                }"
                @click="vertigo_setVmmdMode('probable_md')"
              >
                <span class="vmmd-icon">🩺</span>
                <span class="vmmd-label">可能梅尼爾氏症（Probable）</span>
                <span class="vmmd-sub">臨床診斷 · 不需聽力圖 · A+B+C</span>
                <span class="vmmd-badge" :class="vertigo_pmBadgeClass">{{
                  vertigo_pmBadgeText
                }}</span>
              </button>
            </div>
          </div>

          <!-- ── VM ─────────────────────────────────────────────────── -->
          <template v-if="vertigo_vmmdMode === 'vm'">
            <div class="nihss-group">
              <div class="group-header-bar vm-bar-a">
                <span class="group-icon">🅐</span>
                <span class="group-label-text">標準 A：前庭發作次數與特徵</span>
                <span class="group-sub-text"
                  >中重度前庭症狀，持續 5 分鐘至 72 小時，≥5 次</span
                >
                <!-- FIX: use pre-computed computed instead of .value in template -->
                <span
                  class="group-score-tally"
                  :class="vertigo_vmATallyClass"
                  >{{ vertigo_vmATallyText }}</span
                >
              </div>
              <div class="item-list">
                <div
                  class="crit-item"
                  :class="
                    vertigo_vma1 === 'yes'
                      ? 'item-ok'
                      : vertigo_vma1 === 'no'
                        ? 'item-fail'
                        : ''
                  "
                >
                  <div class="item-header">
                    <span class="item-qnum q-vm-a">A1</span>
                    <div class="item-name-block">
                      <span class="item-name"
                        >前庭症狀（眩暈/頭暈/平衡障礙）發作次數 ≥5 次？</span
                      >
                      <span class="item-sub"
                        >At least 5 episodes of vestibular symptoms</span
                      >
                    </div>
                    <span
                      class="item-val"
                      :class="
                        vertigo_vma1 === 'yes'
                          ? 'val-ok'
                          : vertigo_vma1 === 'no'
                            ? 'val-fail'
                            : 'val-nd'
                      "
                      >{{
                        vertigo_vma1 === null
                          ? "—"
                          : vertigo_vma1 === "yes"
                            ? "是"
                            : "否"
                      }}</span
                    >
                  </div>
                  <div class="yn-row">
                    <button
                      class="btn-yn btn-yn-ok"
                      :class="{ 'yn-ok-active': vertigo_vma1 === 'yes' }"
                      @click="vertigo_vma1 = 'yes'"
                    >
                      是（≥5 次）
                    </button>
                    <button
                      class="btn-yn btn-yn-fail"
                      :class="{ 'yn-fail-active': vertigo_vma1 === 'no' }"
                      @click="vertigo_vma1 = 'no'"
                    >
                      否
                    </button>
                  </div>
                </div>
                <div
                  class="crit-item"
                  :class="
                    vertigo_vma2 === 'yes'
                      ? 'item-ok'
                      : vertigo_vma2 === 'no'
                        ? 'item-fail'
                        : ''
                  "
                >
                  <div class="item-header">
                    <span class="item-qnum q-vm-a">A2</span>
                    <div class="item-name-block">
                      <span class="item-name"
                        >每次發作持續 5 分鐘至 72 小時？</span
                      >
                      <span class="item-sub"
                        >Duration of 5 minutes to 72 hours per episode</span
                      >
                    </div>
                    <span
                      class="item-val"
                      :class="
                        vertigo_vma2 === 'yes'
                          ? 'val-ok'
                          : vertigo_vma2 === 'no'
                            ? 'val-fail'
                            : 'val-nd'
                      "
                      >{{
                        vertigo_vma2 === null
                          ? "—"
                          : vertigo_vma2 === "yes"
                            ? "是"
                            : "否"
                      }}</span
                    >
                  </div>
                  <div class="yn-row">
                    <button
                      class="btn-yn btn-yn-ok"
                      :class="{ 'yn-ok-active': vertigo_vma2 === 'yes' }"
                      @click="vertigo_vma2 = 'yes'"
                    >
                      是（5min–72h）
                    </button>
                    <button
                      class="btn-yn btn-yn-fail"
                      :class="{ 'yn-fail-active': vertigo_vma2 === 'no' }"
                      @click="vertigo_vma2 = 'no'"
                    >
                      否
                    </button>
                  </div>
                </div>
                <div
                  class="crit-item"
                  :class="
                    vertigo_vma3 === 'yes'
                      ? 'item-ok'
                      : vertigo_vma3 === 'no'
                        ? 'item-fail'
                        : ''
                  "
                >
                  <div class="item-header">
                    <span class="item-qnum q-vm-a">A3</span>
                    <div class="item-name-block">
                      <span class="item-name"
                        >前庭症狀為中度或重度強度（影響日常活動）？</span
                      >
                      <span class="item-sub"
                        >Moderate or severe intensity affecting daily
                        activities</span
                      >
                    </div>
                    <span
                      class="item-val"
                      :class="
                        vertigo_vma3 === 'yes'
                          ? 'val-ok'
                          : vertigo_vma3 === 'no'
                            ? 'val-fail'
                            : 'val-nd'
                      "
                      >{{
                        vertigo_vma3 === null
                          ? "—"
                          : vertigo_vma3 === "yes"
                            ? "是"
                            : "否"
                      }}</span
                    >
                  </div>
                  <div class="yn-row">
                    <button
                      class="btn-yn btn-yn-ok"
                      :class="{ 'yn-ok-active': vertigo_vma3 === 'yes' }"
                      @click="vertigo_vma3 = 'yes'"
                    >
                      是（中重度）
                    </button>
                    <button
                      class="btn-yn btn-yn-fail"
                      :class="{ 'yn-fail-active': vertigo_vma3 === 'no' }"
                      @click="vertigo_vma3 = 'no'"
                    >
                      否
                    </button>
                  </div>
                </div>
              </div>
            </div>
            <div class="nihss-group">
              <div class="group-header-bar vm-bar-b">
                <span class="group-icon">🅑</span>
                <span class="group-label-text"
                  >標準 B：偏頭痛病史（ICHD-3）</span
                >
                <span class="group-sub-text"
                  >現有或曾有有先兆或無先兆偏頭痛診斷</span
                >
                <span
                  class="group-score-tally"
                  :class="
                    vertigo_vmb1 !== null
                      ? vertigo_vmBMet
                        ? 'tally-ok'
                        : 'tally-abn'
                      : 'tally-nd'
                  "
                  >{{
                    vertigo_vmb1 !== null ? (vertigo_vmBMet ? "✓" : "✗") : "—"
                  }}</span
                >
              </div>
              <div
                class="crit-item"
                :class="
                  vertigo_vmb1 === 'yes'
                    ? 'item-ok'
                    : vertigo_vmb1 === 'no'
                      ? 'item-fail'
                      : ''
                "
              >
                <div class="item-header">
                  <span class="item-qnum q-vm-b">B</span>
                  <div class="item-name-block">
                    <span class="item-name"
                      >現有或曾有符合 ICHD-3
                      標準的有先兆或無先兆偏頭痛診斷？</span
                    >
                    <span class="item-sub"
                      >Current or previous history of migraine with or without
                      aura (ICHD-3)</span
                    >
                  </div>
                  <span
                    class="item-val"
                    :class="
                      vertigo_vmb1 === 'yes'
                        ? 'val-ok'
                        : vertigo_vmb1 === 'no'
                          ? 'val-fail'
                          : 'val-nd'
                    "
                    >{{
                      vertigo_vmb1 === null
                        ? "—"
                        : vertigo_vmb1 === "yes"
                          ? "是"
                          : "否"
                    }}</span
                  >
                </div>
                <div class="yn-row">
                  <button
                    class="btn-yn btn-yn-ok"
                    :class="{ 'yn-ok-active': vertigo_vmb1 === 'yes' }"
                    @click="vertigo_vmb1 = 'yes'"
                  >
                    是（有偏頭痛病史）
                  </button>
                  <button
                    class="btn-yn btn-yn-fail"
                    :class="{ 'yn-fail-active': vertigo_vmb1 === 'no' }"
                    @click="vertigo_vmb1 = 'no'"
                  >
                    否
                  </button>
                </div>
              </div>
            </div>
            <div class="nihss-group">
              <div class="group-header-bar vm-bar-c">
                <span class="group-icon">🅒</span>
                <span class="group-label-text"
                  >標準 C：≥50% 前庭發作伴偏頭痛特徵（≥1 項）</span
                >
                <span class="group-sub-text"
                  >頭痛特徵、畏光+畏聲、或視覺先兆</span
                >
                <!-- FIX: use pre-computed computed instead of .value in template -->
                <span
                  class="group-score-tally"
                  :class="vertigo_vmCTallyClass"
                  >{{ vertigo_vmCTallyText }}</span
                >
              </div>
              <div class="item-list">
                <div
                  class="crit-item"
                  :class="
                    vertigo_vmc1 === 'yes'
                      ? 'item-ok'
                      : vertigo_vmc1 === 'no'
                        ? 'item-fail'
                        : ''
                  "
                >
                  <div class="item-header">
                    <span class="item-qnum q-vm-c">C1</span>
                    <div class="item-name-block">
                      <span class="item-name"
                        >頭痛伴有 ≥2
                        項偏頭痛特徵（單側、搏動、中重度、活動加重）？</span
                      >
                      <span class="item-sub"
                        >Headache with ≥2 migraine characteristics</span
                      >
                    </div>
                    <span
                      class="item-val"
                      :class="
                        vertigo_vmc1 === 'yes'
                          ? 'val-ok'
                          : vertigo_vmc1 === 'no'
                            ? 'val-fail'
                            : 'val-nd'
                      "
                      >{{
                        vertigo_vmc1 === null
                          ? "—"
                          : vertigo_vmc1 === "yes"
                            ? "是"
                            : "否"
                      }}</span
                    >
                  </div>
                  <div class="yn-row">
                    <button
                      class="btn-yn btn-yn-ok"
                      :class="{ 'yn-ok-active': vertigo_vmc1 === 'yes' }"
                      @click="vertigo_vmc1 = 'yes'"
                    >
                      是
                    </button>
                    <button
                      class="btn-yn btn-yn-fail"
                      :class="{ 'yn-fail-active': vertigo_vmc1 === 'no' }"
                      @click="vertigo_vmc1 = 'no'"
                    >
                      否
                    </button>
                  </div>
                </div>
                <div
                  class="crit-item"
                  :class="
                    vertigo_vmc2 === 'yes'
                      ? 'item-ok'
                      : vertigo_vmc2 === 'no'
                        ? 'item-fail'
                        : ''
                  "
                >
                  <div class="item-header">
                    <span class="item-qnum q-vm-c">C2</span>
                    <div class="item-name-block">
                      <span class="item-name"
                        >發作期間同時有畏光（photophobia）且畏聲（phonophobia）？</span
                      >
                      <span class="item-sub"
                        >Photophobia AND phonophobia during vestibular
                        episodes</span
                      >
                    </div>
                    <span
                      class="item-val"
                      :class="
                        vertigo_vmc2 === 'yes'
                          ? 'val-ok'
                          : vertigo_vmc2 === 'no'
                            ? 'val-fail'
                            : 'val-nd'
                      "
                      >{{
                        vertigo_vmc2 === null
                          ? "—"
                          : vertigo_vmc2 === "yes"
                            ? "是"
                            : "否"
                      }}</span
                    >
                  </div>
                  <div class="yn-row">
                    <button
                      class="btn-yn btn-yn-ok"
                      :class="{ 'yn-ok-active': vertigo_vmc2 === 'yes' }"
                      @click="vertigo_vmc2 = 'yes'"
                    >
                      是
                    </button>
                    <button
                      class="btn-yn btn-yn-fail"
                      :class="{ 'yn-fail-active': vertigo_vmc2 === 'no' }"
                      @click="vertigo_vmc2 = 'no'"
                    >
                      否
                    </button>
                  </div>
                </div>
                <div
                  class="crit-item"
                  :class="
                    vertigo_vmc3 === 'yes'
                      ? 'item-ok'
                      : vertigo_vmc3 === 'no'
                        ? 'item-fail'
                        : ''
                  "
                >
                  <div class="item-header">
                    <span class="item-qnum q-vm-c">C3</span>
                    <div class="item-name-block">
                      <span class="item-name"
                        >發作期間有視覺先兆（閃光、暗點、鋸齒形線條等）？</span
                      >
                      <span class="item-sub"
                        >Visual aura (scintillating scotoma, fortification
                        spectra)</span
                      >
                    </div>
                    <span
                      class="item-val"
                      :class="
                        vertigo_vmc3 === 'yes'
                          ? 'val-ok'
                          : vertigo_vmc3 === 'no'
                            ? 'val-fail'
                            : 'val-nd'
                      "
                      >{{
                        vertigo_vmc3 === null
                          ? "—"
                          : vertigo_vmc3 === "yes"
                            ? "是"
                            : "否"
                      }}</span
                    >
                  </div>
                  <div class="yn-row">
                    <button
                      class="btn-yn btn-yn-ok"
                      :class="{ 'yn-ok-active': vertigo_vmc3 === 'yes' }"
                      @click="vertigo_vmc3 = 'yes'"
                    >
                      是
                    </button>
                    <button
                      class="btn-yn btn-yn-fail"
                      :class="{ 'yn-fail-active': vertigo_vmc3 === 'no' }"
                      @click="vertigo_vmc3 = 'no'"
                    >
                      否
                    </button>
                  </div>
                </div>
              </div>
            </div>
            <div class="nihss-group">
              <div class="group-header-bar vm-bar-d">
                <span class="group-icon">🅓</span>
                <span class="group-label-text">標準 D：排除其他診斷</span>
                <span class="group-sub-text"
                  >症狀無法以其他前庭疾患或 ICHD-3 診斷更好解釋</span
                >
                <span
                  class="group-score-tally"
                  :class="
                    vertigo_vmd1 !== null
                      ? vertigo_vmDMet
                        ? 'tally-ok'
                        : 'tally-abn'
                      : 'tally-nd'
                  "
                  >{{
                    vertigo_vmd1 !== null ? (vertigo_vmDMet ? "✓" : "✗") : "—"
                  }}</span
                >
              </div>
              <div
                class="crit-item"
                :class="
                  vertigo_vmd1 === 'yes'
                    ? 'item-ok'
                    : vertigo_vmd1 === 'no'
                      ? 'item-fail'
                      : ''
                "
              >
                <div class="item-header">
                  <span class="item-qnum q-vm-d">D</span>
                  <div class="item-name-block">
                    <span class="item-name"
                      >症狀無法以其他前庭疾患（BPPV、梅尼爾氏症、AUVP）或 ICHD-3
                      診斷更好解釋？</span
                    >
                    <span class="item-sub"
                      >Not better accounted for by another vestibular disorder
                      or ICHD-3 diagnosis</span
                    >
                  </div>
                  <span
                    class="item-val"
                    :class="
                      vertigo_vmd1 === 'yes'
                        ? 'val-ok'
                        : vertigo_vmd1 === 'no'
                          ? 'val-fail'
                          : 'val-nd'
                    "
                    >{{
                      vertigo_vmd1 === null
                        ? "—"
                        : vertigo_vmd1 === "yes"
                          ? "是"
                          : "否"
                    }}</span
                  >
                </div>
                <div class="yn-row">
                  <button
                    class="btn-yn btn-yn-ok"
                    :class="{ 'yn-ok-active': vertigo_vmd1 === 'yes' }"
                    @click="vertigo_vmd1 = 'yes'"
                  >
                    是（已排除）
                  </button>
                  <button
                    class="btn-yn btn-yn-fail"
                    :class="{ 'yn-fail-active': vertigo_vmd1 === 'no' }"
                    @click="vertigo_vmd1 = 'no'"
                  >
                    否
                  </button>
                </div>
              </div>
            </div>
            <!-- FIX: sub-score row uses pre-computed vmSS* instead of vertigo_vma1.value === null etc. -->
            <div v-if="vertigo_vmAns > 0" class="sub-score-row">
              <div class="sub-score-card" :class="vertigo_vmSSA">
                <span class="ss-label">A·前庭發作</span
                ><span class="ss-val">{{ vertigo_vmSSAv }}</span>
              </div>
              <div class="sub-score-card" :class="vertigo_vmSSB">
                <span class="ss-label">B·偏頭痛史</span
                ><span class="ss-val">{{ vertigo_vmSSBv }}</span>
              </div>
              <div class="sub-score-card" :class="vertigo_vmSSC">
                <span class="ss-label">C·偏頭痛特徵</span
                ><span class="ss-val">{{ vertigo_vmSSCv }}</span>
              </div>
              <div class="sub-score-card" :class="vertigo_vmSSD">
                <span class="ss-label">D·排除其他</span
                ><span class="ss-val">{{ vertigo_vmSSDv }}</span>
              </div>
            </div>
            <div
              v-if="vertigo_showResults && vertigo_vmAllComplete"
              class="results-detail"
            >
              <div class="results-header">前庭性偏頭痛 評估明細</div>
              <div
                v-for="row in [
                  {
                    q: 'A',
                    label: '前庭發作 ≥5 次 · 5min–72h',
                    met: vertigo_vmAMet,
                  },
                  {
                    q: 'B',
                    label: '偏頭痛病史（ICHD-3）',
                    met: vertigo_vmBMet,
                  },
                  {
                    q: 'C',
                    label: '≥50% 發作伴偏頭痛特徵',
                    met: vertigo_vmCMet,
                  },
                  { q: 'D', label: '排除其他診斷', met: vertigo_vmDMet },
                ]"
                :key="row.q"
                class="detail-row"
              >
                <span class="detail-qnum" :class="row.met ? 'dq-p' : 'dq-c'">{{
                  row.q
                }}</span>
                <span class="detail-domain">{{ row.label }}</span>
                <span
                  class="detail-score"
                  :class="row.met ? 'ds-periph' : 'ds-central'"
                  >{{ row.met ? "✓" : "✗" }}</span
                >
              </div>
              <div class="detail-row detail-total">
                <span class="detail-qnum">∑</span>
                <span class="detail-domain">VM 判讀</span>
                <span class="detail-score detail-score-brand"
                  >{{ vertigo_vmMetCount }}/4</span
                >
                <span class="detail-desc">{{
                  vertigo_vmResult.dx || vertigo_vmResult.level.substring(0, 8)
                }}</span>
              </div>
            </div>
            <div class="result-card" :class="vertigo_vmResult.color">
              <div class="result-left">
                <span class="result-number" style="font-size: 2.5rem">{{
                  vertigo_vmAllComplete ? vertigo_vmMetCount : "—"
                }}</span>
                <span class="result-max" v-if="vertigo_vmAllComplete">/4</span>
              </div>
              <div class="result-right">
                <span class="result-ver"
                  >Vestibular Migraine · Lempert et al. J Vestib Res 2022</span
                >
                <span class="result-level">{{ vertigo_vmResult.level }}</span>
                <span class="result-advice">{{ vertigo_vmResult.advice }}</span>
              </div>
            </div>
          </template>

          <!-- ── DEFINITE MD ─────────────────────────────────────────── -->
          <template v-else-if="vertigo_vmmdMode === 'definite_md'">
            <div class="nihss-group">
              <div class="group-header-bar md-bar-a">
                <span class="group-icon">🅐</span>
                <span class="group-label-text"
                  >標準 A：自發性陣發性眩暈（≥2 次，20min–12h）</span
                >
                <span
                  class="group-score-tally"
                  :class="
                    vertigo_mda1 !== null && vertigo_mda2 !== null
                      ? vertigo_mdAMet
                        ? 'tally-ok'
                        : 'tally-abn'
                      : 'tally-nd'
                  "
                  >{{
                    vertigo_mda1 !== null && vertigo_mda2 !== null
                      ? vertigo_mdAMet
                        ? "✓"
                        : "✗"
                      : "—"
                  }}</span
                >
              </div>
              <div class="item-list">
                <div
                  class="crit-item"
                  :class="
                    vertigo_mda1 === 'yes'
                      ? 'item-ok'
                      : vertigo_mda1 === 'no'
                        ? 'item-fail'
                        : ''
                  "
                >
                  <div class="item-header">
                    <span class="item-qnum q-md-a">A1</span>
                    <div class="item-name-block">
                      <span class="item-name"
                        >自發性旋轉性眩暈發作次數 ≥2 次？</span
                      >
                      <span class="item-sub"
                        >At least 2 spontaneous episodes of vertigo</span
                      >
                    </div>
                    <span
                      class="item-val"
                      :class="
                        vertigo_mda1 === 'yes'
                          ? 'val-ok'
                          : vertigo_mda1 === 'no'
                            ? 'val-fail'
                            : 'val-nd'
                      "
                      >{{
                        vertigo_mda1 === null
                          ? "—"
                          : vertigo_mda1 === "yes"
                            ? "是"
                            : "否"
                      }}</span
                    >
                  </div>
                  <div class="yn-row">
                    <button
                      class="btn-yn btn-yn-ok"
                      :class="{ 'yn-ok-active': vertigo_mda1 === 'yes' }"
                      @click="vertigo_mda1 = 'yes'"
                    >
                      是（≥2 次）
                    </button>
                    <button
                      class="btn-yn btn-yn-fail"
                      :class="{ 'yn-fail-active': vertigo_mda1 === 'no' }"
                      @click="vertigo_mda1 = 'no'"
                    >
                      否
                    </button>
                  </div>
                </div>
                <div
                  class="crit-item"
                  :class="
                    vertigo_mda2 === 'yes'
                      ? 'item-ok'
                      : vertigo_mda2 === 'no'
                        ? 'item-fail'
                        : ''
                  "
                >
                  <div class="item-header">
                    <span class="item-qnum q-md-a">A2</span>
                    <div class="item-name-block">
                      <span class="item-name"
                        >每次眩暈發作持續 20 分鐘至 12 小時？</span
                      >
                      <span class="item-sub"
                        >Each lasting 20 minutes to 12 hours</span
                      >
                    </div>
                    <span
                      class="item-val"
                      :class="
                        vertigo_mda2 === 'yes'
                          ? 'val-ok'
                          : vertigo_mda2 === 'no'
                            ? 'val-fail'
                            : 'val-nd'
                      "
                      >{{
                        vertigo_mda2 === null
                          ? "—"
                          : vertigo_mda2 === "yes"
                            ? "是"
                            : "否"
                      }}</span
                    >
                  </div>
                  <div class="yn-row">
                    <button
                      class="btn-yn btn-yn-ok"
                      :class="{ 'yn-ok-active': vertigo_mda2 === 'yes' }"
                      @click="vertigo_mda2 = 'yes'"
                    >
                      是（20min–12h）
                    </button>
                    <button
                      class="btn-yn btn-yn-fail"
                      :class="{ 'yn-fail-active': vertigo_mda2 === 'no' }"
                      @click="vertigo_mda2 = 'no'"
                    >
                      否
                    </button>
                  </div>
                </div>
              </div>
            </div>
            <div class="nihss-group">
              <div class="group-header-bar md-bar-b">
                <span class="group-icon">🅑</span>
                <span class="group-label-text"
                  >標準 B：聽力圖記錄的低至中頻 SNHL（患耳）</span
                >
                <span class="group-sub-text"
                  >250–2000 Hz PTA ≥30 dB HL，患側單耳</span
                >
                <!-- FIX: use pre-computed computed -->
                <span
                  class="group-score-tally"
                  :class="vertigo_mdBTallyClass"
                  >{{ vertigo_mdBTallyText }}</span
                >
              </div>
              <div class="item-list">
                <div
                  class="crit-item"
                  :class="
                    vertigo_mdb1 === 'yes'
                      ? 'item-ok'
                      : vertigo_mdb1 === 'no'
                        ? 'item-fail'
                        : ''
                  "
                >
                  <div class="item-header">
                    <span class="item-qnum q-md-b">B1</span>
                    <div class="item-name-block">
                      <span class="item-name"
                        >已有純音聽力圖記錄患耳聽力損失？</span
                      >
                      <span class="item-sub"
                        >Audiometrically documented SNHL in the affected
                        ear</span
                      >
                    </div>
                    <span
                      class="item-val"
                      :class="
                        vertigo_mdb1 === 'yes'
                          ? 'val-ok'
                          : vertigo_mdb1 === 'no'
                            ? 'val-fail'
                            : 'val-nd'
                      "
                      >{{
                        vertigo_mdb1 === null
                          ? "—"
                          : vertigo_mdb1 === "yes"
                            ? "是"
                            : "否"
                      }}</span
                    >
                  </div>
                  <div class="yn-row">
                    <button
                      class="btn-yn btn-yn-ok"
                      :class="{ 'yn-ok-active': vertigo_mdb1 === 'yes' }"
                      @click="vertigo_mdb1 = 'yes'"
                    >
                      是（有聽力圖）
                    </button>
                    <button
                      class="btn-yn btn-yn-fail"
                      :class="{ 'yn-fail-active': vertigo_mdb1 === 'no' }"
                      @click="vertigo_mdb1 = 'no'"
                    >
                      否（未有聽力圖）
                    </button>
                  </div>
                </div>
                <div
                  class="crit-item"
                  :class="
                    vertigo_mdb2 === 'yes'
                      ? 'item-ok'
                      : vertigo_mdb2 === 'no'
                        ? 'item-fail'
                        : ''
                  "
                >
                  <div class="item-header">
                    <span class="item-qnum q-md-b">B2</span>
                    <div class="item-name-block">
                      <span class="item-name"
                        >聽力損失為低至中頻（250–2000 Hz 平均聽閾 ≥30
                        dB）？</span
                      >
                      <span class="item-sub"
                        >Low-to-medium frequency SNHL (250–2000 Hz PTA ≥30 dB
                        HL)</span
                      >
                    </div>
                    <span
                      class="item-val"
                      :class="
                        vertigo_mdb2 === 'yes'
                          ? 'val-ok'
                          : vertigo_mdb2 === 'no'
                            ? 'val-fail'
                            : 'val-nd'
                      "
                      >{{
                        vertigo_mdb2 === null
                          ? "—"
                          : vertigo_mdb2 === "yes"
                            ? "是"
                            : "否"
                      }}</span
                    >
                  </div>
                  <div class="yn-row">
                    <button
                      class="btn-yn btn-yn-ok"
                      :class="{ 'yn-ok-active': vertigo_mdb2 === 'yes' }"
                      @click="vertigo_mdb2 = 'yes'"
                    >
                      是（低頻 SNHL）
                    </button>
                    <button
                      class="btn-yn btn-yn-fail"
                      :class="{ 'yn-fail-active': vertigo_mdb2 === 'no' }"
                      @click="vertigo_mdb2 = 'no'"
                    >
                      否
                    </button>
                  </div>
                </div>
                <div
                  class="crit-item"
                  :class="
                    vertigo_mdb3 === 'yes'
                      ? 'item-ok'
                      : vertigo_mdb3 === 'no'
                        ? 'item-fail'
                        : ''
                  "
                >
                  <div class="item-header">
                    <span class="item-qnum q-md-b">B3</span>
                    <div class="item-name-block">
                      <span class="item-name"
                        >聽力損失為單側，在症狀患耳？</span
                      >
                      <span class="item-sub"
                        >Unilateral, defining the affected ear</span
                      >
                    </div>
                    <span
                      class="item-val"
                      :class="
                        vertigo_mdb3 === 'yes'
                          ? 'val-ok'
                          : vertigo_mdb3 === 'no'
                            ? 'val-fail'
                            : 'val-nd'
                      "
                      >{{
                        vertigo_mdb3 === null
                          ? "—"
                          : vertigo_mdb3 === "yes"
                            ? "是"
                            : "否"
                      }}</span
                    >
                  </div>
                  <div class="yn-row">
                    <button
                      class="btn-yn btn-yn-ok"
                      :class="{ 'yn-ok-active': vertigo_mdb3 === 'yes' }"
                      @click="vertigo_mdb3 = 'yes'"
                    >
                      是（單側患耳）
                    </button>
                    <button
                      class="btn-yn btn-yn-fail"
                      :class="{ 'yn-fail-active': vertigo_mdb3 === 'no' }"
                      @click="vertigo_mdb3 = 'no'"
                    >
                      否
                    </button>
                  </div>
                </div>
              </div>
            </div>
            <div class="nihss-group">
              <div class="group-header-bar md-bar-c">
                <span class="group-icon">🅒</span>
                <span class="group-label-text"
                  >標準 C：患耳波動性耳部症狀（≥1 項）</span
                >
                <!-- FIX: use pre-computed computed -->
                <span
                  class="group-score-tally"
                  :class="vertigo_mdCTallyClass"
                  >{{ vertigo_mdCTallyText }}</span
                >
              </div>
              <div class="item-list">
                <div
                  class="crit-item"
                  :class="
                    vertigo_mdc1 === 'yes'
                      ? 'item-ok'
                      : vertigo_mdc1 === 'no'
                        ? 'item-fail'
                        : ''
                  "
                >
                  <div class="item-header">
                    <span class="item-qnum q-md-c">C1</span>
                    <div class="item-name-block">
                      <span class="item-name"
                        >患耳波動性聽力（發作時或發作後聽力明顯下降）？</span
                      >
                    </div>
                    <span
                      class="item-val"
                      :class="
                        vertigo_mdc1 === 'yes'
                          ? 'val-ok'
                          : vertigo_mdc1 === 'no'
                            ? 'val-fail'
                            : 'val-nd'
                      "
                      >{{
                        vertigo_mdc1 === null
                          ? "—"
                          : vertigo_mdc1 === "yes"
                            ? "是"
                            : "否"
                      }}</span
                    >
                  </div>
                  <div class="yn-row">
                    <button
                      class="btn-yn btn-yn-ok"
                      :class="{ 'yn-ok-active': vertigo_mdc1 === 'yes' }"
                      @click="vertigo_mdc1 = 'yes'"
                    >
                      是
                    </button>
                    <button
                      class="btn-yn btn-yn-fail"
                      :class="{ 'yn-fail-active': vertigo_mdc1 === 'no' }"
                      @click="vertigo_mdc1 = 'no'"
                    >
                      否
                    </button>
                  </div>
                </div>
                <div
                  class="crit-item"
                  :class="
                    vertigo_mdc2 === 'yes'
                      ? 'item-ok'
                      : vertigo_mdc2 === 'no'
                        ? 'item-fail'
                        : ''
                  "
                >
                  <div class="item-header">
                    <span class="item-qnum q-md-c">C2</span>
                    <div class="item-name-block">
                      <span class="item-name"
                        >患耳持續性或波動性耳鳴（tinnitus）？</span
                      >
                    </div>
                    <span
                      class="item-val"
                      :class="
                        vertigo_mdc2 === 'yes'
                          ? 'val-ok'
                          : vertigo_mdc2 === 'no'
                            ? 'val-fail'
                            : 'val-nd'
                      "
                      >{{
                        vertigo_mdc2 === null
                          ? "—"
                          : vertigo_mdc2 === "yes"
                            ? "是"
                            : "否"
                      }}</span
                    >
                  </div>
                  <div class="yn-row">
                    <button
                      class="btn-yn btn-yn-ok"
                      :class="{ 'yn-ok-active': vertigo_mdc2 === 'yes' }"
                      @click="vertigo_mdc2 = 'yes'"
                    >
                      是
                    </button>
                    <button
                      class="btn-yn btn-yn-fail"
                      :class="{ 'yn-fail-active': vertigo_mdc2 === 'no' }"
                      @click="vertigo_mdc2 = 'no'"
                    >
                      否
                    </button>
                  </div>
                </div>
                <div
                  class="crit-item"
                  :class="
                    vertigo_mdc3 === 'yes'
                      ? 'item-ok'
                      : vertigo_mdc3 === 'no'
                        ? 'item-fail'
                        : ''
                  "
                >
                  <div class="item-header">
                    <span class="item-qnum q-md-c">C3</span>
                    <div class="item-name-block">
                      <span class="item-name"
                        >患耳耳悶脹感（aural fullness）？</span
                      >
                    </div>
                    <span
                      class="item-val"
                      :class="
                        vertigo_mdc3 === 'yes'
                          ? 'val-ok'
                          : vertigo_mdc3 === 'no'
                            ? 'val-fail'
                            : 'val-nd'
                      "
                      >{{
                        vertigo_mdc3 === null
                          ? "—"
                          : vertigo_mdc3 === "yes"
                            ? "是"
                            : "否"
                      }}</span
                    >
                  </div>
                  <div class="yn-row">
                    <button
                      class="btn-yn btn-yn-ok"
                      :class="{ 'yn-ok-active': vertigo_mdc3 === 'yes' }"
                      @click="vertigo_mdc3 = 'yes'"
                    >
                      是
                    </button>
                    <button
                      class="btn-yn btn-yn-fail"
                      :class="{ 'yn-fail-active': vertigo_mdc3 === 'no' }"
                      @click="vertigo_mdc3 = 'no'"
                    >
                      否
                    </button>
                  </div>
                </div>
              </div>
            </div>
            <div class="nihss-group">
              <div class="group-header-bar md-bar-d">
                <span class="group-icon">🅓</span>
                <span class="group-label-text">標準 D：排除其他診斷</span>
                <span
                  class="group-score-tally"
                  :class="
                    vertigo_mdd1 !== null
                      ? vertigo_mdDMet
                        ? 'tally-ok'
                        : 'tally-abn'
                      : 'tally-nd'
                  "
                  >{{
                    vertigo_mdd1 !== null ? (vertigo_mdDMet ? "✓" : "✗") : "—"
                  }}</span
                >
              </div>
              <div
                class="crit-item"
                :class="
                  vertigo_mdd1 === 'yes'
                    ? 'item-ok'
                    : vertigo_mdd1 === 'no'
                      ? 'item-fail'
                      : ''
                "
              >
                <div class="item-header">
                  <span class="item-qnum q-md-d">D</span>
                  <div class="item-name-block">
                    <span class="item-name"
                      >症狀無法以其他診斷更好解釋（排除自體免疫性內耳病、前庭性偏頭痛、聽神經瘤）？</span
                    >
                    <span class="item-sub"
                      >Not better accounted for by another vestibular or
                      audiological diagnosis</span
                    >
                  </div>
                  <span
                    class="item-val"
                    :class="
                      vertigo_mdd1 === 'yes'
                        ? 'val-ok'
                        : vertigo_mdd1 === 'no'
                          ? 'val-fail'
                          : 'val-nd'
                    "
                    >{{
                      vertigo_mdd1 === null
                        ? "—"
                        : vertigo_mdd1 === "yes"
                          ? "是"
                          : "否"
                    }}</span
                  >
                </div>
                <div class="yn-row">
                  <button
                    class="btn-yn btn-yn-ok"
                    :class="{ 'yn-ok-active': vertigo_mdd1 === 'yes' }"
                    @click="vertigo_mdd1 = 'yes'"
                  >
                    是（已排除）
                  </button>
                  <button
                    class="btn-yn btn-yn-fail"
                    :class="{ 'yn-fail-active': vertigo_mdd1 === 'no' }"
                    @click="vertigo_mdd1 = 'no'"
                  >
                    否
                  </button>
                </div>
              </div>
            </div>
            <!-- FIX: sub-score row uses pre-computed mdSS* instead of vertigo_mda1.value === null etc. -->
            <div v-if="vertigo_mdAllAns > 0" class="sub-score-row">
              <div class="sub-score-card" :class="vertigo_mdSSA">
                <span class="ss-label">A·陣發眩暈</span
                ><span class="ss-val">{{ vertigo_mdSSAv }}</span>
              </div>
              <div class="sub-score-card" :class="vertigo_mdSSB">
                <span class="ss-label">B·低頻SNHL</span
                ><span class="ss-val">{{ vertigo_mdSSBv }}</span>
              </div>
              <div class="sub-score-card" :class="vertigo_mdSSC">
                <span class="ss-label">C·耳部症狀</span
                ><span class="ss-val">{{ vertigo_mdSSCv }}</span>
              </div>
              <div class="sub-score-card" :class="vertigo_mdSSD">
                <span class="ss-label">D·排除其他</span
                ><span class="ss-val">{{ vertigo_mdSSDv }}</span>
              </div>
            </div>
            <div
              v-if="vertigo_showResults && vertigo_mdAllComplete"
              class="results-detail"
            >
              <div class="results-header">確定梅尼爾氏症 評估明細</div>
              <div
                v-for="row in [
                  {
                    q: 'A',
                    label: '自發眩暈 ≥2 次 · 20min–12h',
                    met: vertigo_mdAMet,
                  },
                  {
                    q: 'B',
                    label: '聽力圖低頻 SNHL（患耳）',
                    met: vertigo_mdBMet,
                  },
                  {
                    q: 'C',
                    label: '波動性耳部症狀 ≥1 項',
                    met: vertigo_mdCMet,
                  },
                  { q: 'D', label: '排除其他診斷', met: vertigo_mdDMet },
                ]"
                :key="row.q"
                class="detail-row"
              >
                <span class="detail-qnum" :class="row.met ? 'dq-p' : 'dq-c'">{{
                  row.q
                }}</span>
                <span class="detail-domain">{{ row.label }}</span>
                <span
                  class="detail-score"
                  :class="row.met ? 'ds-periph' : 'ds-central'"
                  >{{ row.met ? "✓" : "✗" }}</span
                >
              </div>
              <div class="detail-row detail-total">
                <span class="detail-qnum">∑</span>
                <span class="detail-domain">確定 MD 判讀</span>
                <span class="detail-score detail-score-brand"
                  >{{ vertigo_mdMetCount }}/4</span
                >
                <span class="detail-desc">{{
                  vertigo_mdResult.dx || vertigo_mdResult.level.substring(0, 8)
                }}</span>
              </div>
            </div>
            <div class="result-card" :class="vertigo_mdResult.color">
              <div class="result-left">
                <span class="result-number" style="font-size: 2.5rem">{{
                  vertigo_mdAllComplete ? vertigo_mdMetCount : "—"
                }}</span>
                <span class="result-max" v-if="vertigo_mdAllComplete">/4</span>
              </div>
              <div class="result-right">
                <span class="result-ver"
                  >Definite Ménière's Disease · Lopez-Escamez et al. J Vestib
                  Res 2015</span
                >
                <span class="result-level">{{ vertigo_mdResult.level }}</span>
                <span class="result-advice">{{ vertigo_mdResult.advice }}</span>
              </div>
            </div>
          </template>

          <!-- ── PROBABLE MD ─────────────────────────────────────────── -->
          <template v-else>
            <div class="nihss-group">
              <div class="group-header-bar md-bar-a">
                <span class="group-icon">🅐</span>
                <span class="group-label-text"
                  >標準 A：發作性前庭症狀（≥2 次，20min–24h）</span
                >
                <span
                  class="group-score-tally"
                  :class="
                    vertigo_pma1 !== null && vertigo_pma2 !== null
                      ? vertigo_pmAMet
                        ? 'tally-ok'
                        : 'tally-abn'
                      : 'tally-nd'
                  "
                  >{{
                    vertigo_pma1 !== null && vertigo_pma2 !== null
                      ? vertigo_pmAMet
                        ? "✓"
                        : "✗"
                      : "—"
                  }}</span
                >
              </div>
              <div class="item-list">
                <div
                  class="crit-item"
                  :class="
                    vertigo_pma1 === 'yes'
                      ? 'item-ok'
                      : vertigo_pma1 === 'no'
                        ? 'item-fail'
                        : ''
                  "
                >
                  <div class="item-header">
                    <span class="item-qnum q-md-a">A1</span>
                    <div class="item-name-block">
                      <span class="item-name">發作性眩暈或頭暈 ≥2 次？</span>
                    </div>
                    <span
                      class="item-val"
                      :class="
                        vertigo_pma1 === 'yes'
                          ? 'val-ok'
                          : vertigo_pma1 === 'no'
                            ? 'val-fail'
                            : 'val-nd'
                      "
                      >{{
                        vertigo_pma1 === null
                          ? "—"
                          : vertigo_pma1 === "yes"
                            ? "是"
                            : "否"
                      }}</span
                    >
                  </div>
                  <div class="yn-row">
                    <button
                      class="btn-yn btn-yn-ok"
                      :class="{ 'yn-ok-active': vertigo_pma1 === 'yes' }"
                      @click="vertigo_pma1 = 'yes'"
                    >
                      是（≥2 次）
                    </button>
                    <button
                      class="btn-yn btn-yn-fail"
                      :class="{ 'yn-fail-active': vertigo_pma1 === 'no' }"
                      @click="vertigo_pma1 = 'no'"
                    >
                      否
                    </button>
                  </div>
                </div>
                <div
                  class="crit-item"
                  :class="
                    vertigo_pma2 === 'yes'
                      ? 'item-ok'
                      : vertigo_pma2 === 'no'
                        ? 'item-fail'
                        : ''
                  "
                >
                  <div class="item-header">
                    <span class="item-qnum q-md-a">A2</span>
                    <div class="item-name-block">
                      <span class="item-name"
                        >每次持續 20 分鐘至 24 小時？</span
                      >
                    </div>
                    <span
                      class="item-val"
                      :class="
                        vertigo_pma2 === 'yes'
                          ? 'val-ok'
                          : vertigo_pma2 === 'no'
                            ? 'val-fail'
                            : 'val-nd'
                      "
                      >{{
                        vertigo_pma2 === null
                          ? "—"
                          : vertigo_pma2 === "yes"
                            ? "是"
                            : "否"
                      }}</span
                    >
                  </div>
                  <div class="yn-row">
                    <button
                      class="btn-yn btn-yn-ok"
                      :class="{ 'yn-ok-active': vertigo_pma2 === 'yes' }"
                      @click="vertigo_pma2 = 'yes'"
                    >
                      是（20min–24h）
                    </button>
                    <button
                      class="btn-yn btn-yn-fail"
                      :class="{ 'yn-fail-active': vertigo_pma2 === 'no' }"
                      @click="vertigo_pma2 = 'no'"
                    >
                      否
                    </button>
                  </div>
                </div>
              </div>
            </div>
            <div class="nihss-group">
              <div class="group-header-bar md-bar-b">
                <span class="group-icon">🅑</span>
                <span class="group-label-text"
                  >標準 B：波動性耳部症狀（同側，≥1 項）</span
                >
                <span
                  class="group-score-tally"
                  :class="
                    vertigo_pmb1 !== null
                      ? vertigo_pmBMet
                        ? 'tally-ok'
                        : 'tally-abn'
                      : 'tally-nd'
                  "
                  >{{
                    vertigo_pmb1 !== null ? (vertigo_pmBMet ? "✓" : "✗") : "—"
                  }}</span
                >
              </div>
              <div
                class="crit-item"
                :class="
                  vertigo_pmb1 === 'yes'
                    ? 'item-ok'
                    : vertigo_pmb1 === 'no'
                      ? 'item-fail'
                      : ''
                "
              >
                <div class="item-header">
                  <span class="item-qnum q-md-b">B</span>
                  <div class="item-name-block">
                    <span class="item-name"
                      >發作期間同側患耳有波動性聽力、耳鳴或耳悶脹感？</span
                    >
                    <span class="item-sub"
                      >Fluctuating aural symptoms in same ear</span
                    >
                  </div>
                  <span
                    class="item-val"
                    :class="
                      vertigo_pmb1 === 'yes'
                        ? 'val-ok'
                        : vertigo_pmb1 === 'no'
                          ? 'val-fail'
                          : 'val-nd'
                    "
                    >{{
                      vertigo_pmb1 === null
                        ? "—"
                        : vertigo_pmb1 === "yes"
                          ? "是"
                          : "否"
                    }}</span
                  >
                </div>
                <div class="yn-row">
                  <button
                    class="btn-yn btn-yn-ok"
                    :class="{ 'yn-ok-active': vertigo_pmb1 === 'yes' }"
                    @click="vertigo_pmb1 = 'yes'"
                  >
                    是（符合）
                  </button>
                  <button
                    class="btn-yn btn-yn-fail"
                    :class="{ 'yn-fail-active': vertigo_pmb1 === 'no' }"
                    @click="vertigo_pmb1 = 'no'"
                  >
                    否
                  </button>
                </div>
              </div>
            </div>
            <div class="nihss-group">
              <div class="group-header-bar md-bar-d">
                <span class="group-icon">🅒</span>
                <span class="group-label-text">標準 C：排除其他診斷</span>
                <span
                  class="group-score-tally"
                  :class="
                    vertigo_pmc1 !== null
                      ? vertigo_pmCMet
                        ? 'tally-ok'
                        : 'tally-abn'
                      : 'tally-nd'
                  "
                  >{{
                    vertigo_pmc1 !== null ? (vertigo_pmCMet ? "✓" : "✗") : "—"
                  }}</span
                >
              </div>
              <div
                class="crit-item"
                :class="
                  vertigo_pmc1 === 'yes'
                    ? 'item-ok'
                    : vertigo_pmc1 === 'no'
                      ? 'item-fail'
                      : ''
                "
              >
                <div class="item-header">
                  <span class="item-qnum q-md-d">C</span>
                  <div class="item-name-block">
                    <span class="item-name"
                      >症狀無法以其他前庭疾患更好解釋？</span
                    >
                  </div>
                  <span
                    class="item-val"
                    :class="
                      vertigo_pmc1 === 'yes'
                        ? 'val-ok'
                        : vertigo_pmc1 === 'no'
                          ? 'val-fail'
                          : 'val-nd'
                    "
                    >{{
                      vertigo_pmc1 === null
                        ? "—"
                        : vertigo_pmc1 === "yes"
                          ? "是"
                          : "否"
                    }}</span
                  >
                </div>
                <div class="yn-row">
                  <button
                    class="btn-yn btn-yn-ok"
                    :class="{ 'yn-ok-active': vertigo_pmc1 === 'yes' }"
                    @click="vertigo_pmc1 = 'yes'"
                  >
                    是（已排除）
                  </button>
                  <button
                    class="btn-yn btn-yn-fail"
                    :class="{ 'yn-fail-active': vertigo_pmc1 === 'no' }"
                    @click="vertigo_pmc1 = 'no'"
                  >
                    否
                  </button>
                </div>
              </div>
            </div>
            <!-- FIX: sub-score row uses pre-computed pmSS* instead of vertigo_pma1.value === null etc. -->
            <div v-if="vertigo_pmAllAns > 0" class="sub-score-row">
              <div class="sub-score-card" :class="vertigo_pmSSA">
                <span class="ss-label">A·發作性前庭</span
                ><span class="ss-val">{{ vertigo_pmSSAv }}</span>
              </div>
              <div class="sub-score-card" :class="vertigo_pmSSB">
                <span class="ss-label">B·波動耳部症</span
                ><span class="ss-val">{{ vertigo_pmSSBv }}</span>
              </div>
              <div class="sub-score-card" :class="vertigo_pmSSC">
                <span class="ss-label">C·排除其他</span
                ><span class="ss-val">{{ vertigo_pmSSCv }}</span>
              </div>
            </div>
            <div
              v-if="vertigo_showResults && vertigo_pmAllComplete"
              class="results-detail"
            >
              <div class="results-header">可能梅尼爾氏症 評估明細</div>
              <div
                v-for="row in [
                  {
                    q: 'A',
                    label: '發作性前庭症狀 ≥2 次 · 20min–24h',
                    met: vertigo_pmAMet,
                  },
                  {
                    q: 'B',
                    label: '波動性耳部症狀（同側）',
                    met: vertigo_pmBMet,
                  },
                  { q: 'C', label: '排除其他診斷', met: vertigo_pmCMet },
                ]"
                :key="row.q"
                class="detail-row"
              >
                <span class="detail-qnum" :class="row.met ? 'dq-p' : 'dq-c'">{{
                  row.q
                }}</span>
                <span class="detail-domain">{{ row.label }}</span>
                <span
                  class="detail-score"
                  :class="row.met ? 'ds-periph' : 'ds-central'"
                  >{{ row.met ? "✓" : "✗" }}</span
                >
              </div>
              <div class="detail-row detail-total">
                <span class="detail-qnum">∑</span>
                <span class="detail-domain">Probable MD 判讀</span>
                <span class="detail-score detail-score-brand"
                  >{{ vertigo_pmMetCount }}/3</span
                >
                <span class="detail-desc">{{
                  vertigo_pmResult.dx || vertigo_pmResult.level.substring(0, 8)
                }}</span>
              </div>
            </div>
            <div class="result-card" :class="vertigo_pmResult.color">
              <div class="result-left">
                <span class="result-number" style="font-size: 2.5rem">{{
                  vertigo_pmAllComplete ? vertigo_pmMetCount : "—"
                }}</span>
                <span class="result-max" v-if="vertigo_pmAllComplete">/3</span>
              </div>
              <div class="result-right">
                <span class="result-ver"
                  >Probable Ménière's Disease · Lopez-Escamez et al. J Vestib
                  Res 2015</span
                >
                <span class="result-level">{{ vertigo_pmResult.level }}</span>
                <span class="result-advice">{{ vertigo_pmResult.advice }}</span>
              </div>
            </div>
          </template>
        </template>

        <!-- ══ WARN ══════════════════════════════════════════════════════ -->
        <div class="warn-box">
          <span class="warn-icon">⚠</span>
          <span v-if="vertigo_isTabHints"
            >HINTS 僅適用於持續性 AVS
            且存在自發性眼振的患者。下跳性眼振須優先排除小腦/腦幹中樞病變。HINTS
            應由受過訓練的臨床人員執行，不能單獨作為排除中風的唯一依據。</span
          >
          <span v-else-if="vertigo_isTabBppv"
            >前半規管
            BPPV（AC-BPPV）極罕見，下跳性眼振時需排除中樞病變。頸椎不穩者施行
            Dix-Hallpike 前應謹慎評估。急性 BPPV 若未完成 HINTS，應先完成 HINTS
            排除中風。</span
          >
          <span v-else-if="vertigo_isTabAuvp"
            >AUVP
            為排除性診斷，需先排除中風（HINTS）。純垂直/純扭轉性眼振必須排除小腦梗塞。若有急性聽力損失，診斷為迷路炎（Labyrinthitis）而非單純
            AUVP。</span
          >
          <span v-else-if="vertigo_isTabVmmd"
            >前庭性偏頭痛與梅尼爾氏症可合併存在。確定 MD
            需聽力圖文件支持；Probable MD
            為臨床判斷。梅尼爾氏症為排除性診斷，需排除聽神經瘤（MRI）及自體免疫性內耳病。本工具僅供臨床輔助，不取代完整神經耳科評估。</span
          >
          <span v-else
            >此工具整合 HINTS · BPPV · AUVP · VM · MD
            五項眩暈鑑別工具。臨床上急性持續性眩暈應優先排除中樞性病因（HINTS
            Step
            1），方可進行後續評估。本工具供臨床輔助參考，不取代完整神經學評估。</span
          >
        </div>

        <!-- ══ ACTIONS ════════════════════════════════════════════════════ -->
        <div class="vertigo-actions">
          <button
            class="btn-view"
            :disabled="!vertigo_canShowResults"
            @click="vertigo_showResults = !vertigo_showResults"
          >
            {{ vertigo_showResults ? "收起明細" : "查看評估結果" }}
          </button>
          <button
            class="btn-copy"
            :disabled="!vertigo_canCopy"
            @click="copyOutput"
          >
            {{ vertigo_copied ? "已複製 ✓" : "複製 Markdown 結果" }}
          </button>
          <button class="btn-reset" @click="vertigo_reset">重置全部</button>
        </div>
      </div>
    </div>

    <!-- ═══════════════════ DHI Panel ═══════════════════ -->
    <div v-show="dizzinessTab === 'dhi'" class="dhi-panel">
      <div class="dhi">
        <!-- Header -->
        <div class="dhi-header">
          <div class="header-title">
            <h2 class="title">DHI 頭暈障礙量表</h2>
            <p class="subtitle">
              Dizziness Handicap Inventory · 頭暈對日常生活影響評估
            </p>
          </div>
          <div class="score-badge" :class="dhi_severity.color">
            <span class="score-number">{{
              dhi_isComplete ? dhi_totalScore : "—"
            }}</span>
            <span class="score-label">{{
              dhi_isComplete ? dhi_severity.level : `${dhi_answeredCount}/25`
            }}</span>
          </div>
        </div>

        <!-- Severity bar -->
        <div class="dhi_severity-bar-wrap">
          <div class="dhi_severity-bar">
            <div
              class="dhi_severity-fill"
              :class="dhi_severity.color"
              :style="{ width: Math.min(dhi_totalScore, 100) + '%' }"
            />
          </div>
          <div class="dhi_severity-ticks">
            <span class="tk-normal">0</span>
            <span class="tick-threshold">16</span>
            <span class="tk-mild">34</span>
            <span class="tk-moderate">60</span>
            <span class="tk-severe">100</span>
          </div>
        </div>

        <!-- Domain sub-scores -->
        <div class="sub-scores">
          <div class="sub-pill func-pill">
            <span class="sub-label">功能（F）</span>
            <span class="sub-val">{{ dhi_scoreF }} / 36</span>
          </div>
          <div class="sub-pill emo-pill">
            <span class="sub-label">情緒（E）</span>
            <span class="sub-val">{{ dhi_scoreE }} / 36</span>
          </div>
          <div class="sub-pill phys-pill">
            <span class="sub-label">身體（P）</span>
            <span class="sub-val">{{ dhi_scoreP }} / 28</span>
          </div>
        </div>

        <!-- Intro -->
        <div class="intro-bar">
          <span class="intro-dot">◉</span>
          <span
            >請依據頭暈問題對日常生活的影響作答。每題三個選項：<strong>總是（4分）、有時（2分）、從不（0分）</strong>，共
            25 題，總分 0–100 分。<strong>DHI &gt; 16</strong>
            提示頭暈造成顯著障礙。</span
          >
        </div>

        <!-- Three domain groups -->
        <div
          v-for="domainKey in ['F', 'E', 'P'] as const"
          :key="domainKey"
          class="dhi-group"
        >
          <div
            class="group-header"
            :class="dhi_domainDefs[domainKey].color + '-header'"
          >
            <div class="group-label-block">
              <span class="group-label">{{
                dhi_domainDefs[domainKey].name
              }}</span>
              <span class="group-sub"
                >{{ dhi_domainDefs[domainKey].sub }} ·
                {{ dhi_domainDefs[domainKey].items }} 題</span
              >
            </div>
            <div
              class="group-score-pill"
              :class="dhi_domainDefs[domainKey].color + '-pill'"
            >
              {{
                domainKey === "F"
                  ? dhi_scoreF
                  : domainKey === "E"
                    ? dhi_scoreE
                    : dhi_scoreP
              }}
              / {{ dhi_domainDefs[domainKey].max }}
            </div>
          </div>

          <div class="item-list">
            <div
              v-for="q in dhi_questions.filter((q) => q.domain === domainKey)"
              :key="q.key"
              class="dhi-item"
              :class="{
                answered: dhi_selections[q.key] >= 0,
                high: dhi_selections[q.key] === 4,
                [dhi_domainDefs[domainKey].color]: dhi_selections[q.key] >= 0,
              }"
            >
              <div class="item-header">
                <div class="item-meta-row">
                  <span
                    class="item-qnum"
                    :class="dhi_domainDefs[domainKey].color + '-qnum'"
                  >
                    Q{{ dhi_qIndex[q.key] }}
                  </span>
                  <span
                    class="domain-tag"
                    :class="dhi_domainDefs[domainKey].color + '-tag'"
                  >
                    {{ domainKey }}
                  </span>
                </div>
                <div class="item-name-block">
                  <span class="item-name">{{ q.name }}</span>
                  <span class="item-sub">{{ q.sub }}</span>
                  <span class="item-hint">{{ q.hint }}</span>
                </div>
                <span
                  class="item-score"
                  :class="{
                    zero: dhi_selections[q.key] === 0,
                    unanswered: dhi_selections[q.key] < 0,
                    high: dhi_selections[q.key] === 4,
                  }"
                >
                  {{ dhi_selections[q.key] >= 0 ? dhi_selections[q.key] : "—" }}
                </span>
              </div>

              <!-- 3 options: 4 / 2 / 0 -->
              <div class="option-row">
                <label
                  v-for="opt in dhi_scoreOptions"
                  :key="opt.value"
                  class="opt-pill"
                  :class="{
                    active: dhi_selections[q.key] === opt.value,
                    high: opt.value === 4 && dhi_selections[q.key] === 4,
                    ['s' + opt.value]: true,
                  }"
                >
                  <input
                    type="radio"
                    :name="q.key"
                    :value="opt.value"
                    v-model="dhi_selections[q.key]"
                  />
                  <span class="opt-num">{{ opt.label }}</span>
                  <span class="opt-desc">{{ opt.desc }}</span>
                </label>
              </div>
            </div>
          </div>
        </div>

        <!-- Result card -->
        <div class="dhi-result" :class="dhi_severity.color">
          <div class="result-left">
            <span class="result-number">{{
              dhi_isComplete ? dhi_totalScore : "—"
            }}</span>
            <span class="result-max">/ 100</span>
          </div>
          <div class="result-right">
            <span class="result-level">{{ dhi_severity.level }}</span>
            <span class="result-advice">{{ dhi_severity.advice }}</span>
            <div class="result-breakdown">
              <span class="breakdown-pill func-pill-sm"
                >F：{{ dhi_scoreF }}</span
              >
              <span class="breakdown-pill emo-pill-sm"
                >E：{{ dhi_scoreE }}</span
              >
              <span class="breakdown-pill phys-pill-sm"
                >P：{{ dhi_scoreP }}</span
              >
            </div>
            <span class="result-threshold" v-if="dhi_isComplete">
              {{
                dhi_totalScore > 16
                  ? "⚠ DHI > 16，建議就醫評估前庭功能"
                  : "✓ DHI ≤ 16，在正常範圍內"
              }}
            </span>
          </div>
        </div>

        <!-- Results detail -->
        <div v-if="dhi_showResults" class="results-detail">
          <div class="results-header">評估明細</div>
          <div v-for="domainKey in ['F', 'E', 'P'] as const" :key="domainKey">
            <div
              class="detail-section-title"
              :class="dhi_domainDefs[domainKey].color + '-section'"
            >
              {{ dhi_domainDefs[domainKey].name }}（{{
                domainKey === "F"
                  ? dhi_scoreF
                  : domainKey === "E"
                    ? dhi_scoreE
                    : dhi_scoreP
              }}
              / {{ dhi_domainDefs[domainKey].max }} 分）
            </div>
            <div
              v-for="q in dhi_questions.filter((q) => q.domain === domainKey)"
              :key="q.key"
              class="detail-row"
            >
              <span class="detail-qnum">Q{{ dhi_qIndex[q.key] }}</span>
              <span class="detail-domain">{{ q.name }}</span>
              <span
                class="detail-score"
                :class="{
                  zero: dhi_selections[q.key] === 0,
                  high: dhi_selections[q.key] === 4,
                  brand: dhi_selections[q.key] === 2,
                }"
              >
                {{ dhi_selections[q.key] >= 0 ? dhi_selections[q.key] : "—" }}
              </span>
              <span class="detail-desc">
                {{
                  dhi_selections[q.key] >= 0
                    ? dhi_scoreOptions.find(
                        (o) => o.value === dhi_selections[q.key],
                      )?.desc
                    : "未填"
                }}
              </span>
            </div>
          </div>
        </div>

        <!-- Actions -->
        <div class="dhi-actions">
          <button class="btn-view" @click="dhi_showResults = !dhi_showResults">
            {{ dhi_showResults ? "收起明細" : "查看評估結果" }}
          </button>
          <button class="btn-copy" @click="copyMarkdown">
            {{ dhi_copied ? "已複製 ✓" : "複製 Markdown 結果" }}
          </button>
          <button class="btn-reset" @click="dhi_reset">重置</button>
        </div>
        <p v-if="!dhi_isComplete" class="progress-hint">
          已完成 {{ dhi_answeredCount }}/25 題，尚餘
          {{ 25 - dhi_answeredCount }} 題
        </p>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* ==================================================================
   Dizziness Layout & Tab Bar
   ================================================================== */
.dizziness {
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
  display: flex;
  flex-direction: column;
  align-items: center;
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
   Vertigo Styles
   ================================================================== */
.vertigo {
  max-width: 780px;
  margin: 0 auto;
  padding: 2rem 0 3rem;
  font-size: 0.9rem;
}
.vertigo-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 1rem;
}
.vertigo .header-title {
  flex: 1;
  min-width: 0;
}
.vertigo .title {
  font-size: 24px;
  font-weight: 600;
  color: var(--vp-c-text-1);
  margin: 0 0 0.2rem;
  border: none !important;
  padding: 0 !important;
}
.vertigo .subtitle {
  font-size: 0.82rem;
  color: var(--vp-c-text-3);
  margin: 0;
  line-height: 1.6;
}
.vertigo .subtitle-2 {
  margin: 0.3rem 0 0;
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}
.vertigo .hint-tag {
  display: inline-block;
  font-size: 0.78rem;
  font-weight: 700;
  padding: 4px 10px;
  border-radius: 999px;
  white-space: nowrap;
}
.vertigo .hint-stroke {
  background: rgba(239, 68, 68, 0.12);
  color: #dc2626;
}
.vertigo .hint-auvp {
  background: rgba(6, 182, 212, 0.12);
  color: #0891b2;
}
.vertigo .hint-vmmd {
  background: rgba(139, 92, 246, 0.12);
  color: #7c3aed;
}
.vertigo .score-badge {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2px;
  width: 120px;
  height: 95px;
  flex-shrink: 0;
  padding: 0.6rem 0.4rem;
  border-radius: 14px;
  border: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg-soft);
  transition: all 0.3s;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
  box-sizing: border-box;
}
.vertigo .score-main {
  display: flex;
  align-items: baseline;
  justify-content: center;
  gap: 2px;
}
.vertigo .badge-top {
  font-size: 0.75rem;
  font-weight: 700;
  color: var(--vp-c-text-3);
  text-align: center;
  white-space: nowrap;
}
.vertigo .score-number {
  font-size: 1.8rem;
  font-weight: 800;
  line-height: 1;
  text-align: center;
}
.vertigo .score-unit {
  font-size: 0.85rem;
  font-weight: 700;
  text-align: center;
}
.vertigo .score-bot {
  font-size: 0.7rem;
  font-weight: 600;
  text-align: center;
  max-width: 110px;
}
.vertigo .score-badge.filling {
  color: var(--vp-c-text-3);
}
.vertigo .score-badge.normal {
  border-color: #22c55e;
  color: #22c55e;
  box-shadow:
    0 0 0 1px rgba(34, 197, 94, 0.08),
    0 1px 3px rgba(0, 0, 0, 0.04);
}
.vertigo .score-badge.mild {
  border-color: #f59e0b;
  color: #f59e0b;
  box-shadow:
    0 0 0 1px rgba(245, 158, 11, 0.08),
    0 1px 3px rgba(0, 0, 0, 0.04);
}
.vertigo .score-badge.moderate {
  border-color: #3b82f6;
  color: #3b82f6;
  box-shadow:
    0 0 0 1px rgba(59, 130, 246, 0.08),
    0 1px 3px rgba(0, 0, 0, 0.04);
}
.vertigo .score-badge.critical {
  border-color: #ef4444;
  color: #ef4444;
  box-shadow:
    0 0 0 1px rgba(239, 68, 68, 0.08),
    0 1px 3px rgba(0, 0, 0, 0.04);
}
.vertigo .score-badge.teal {
  border-color: #06b6d4;
  color: #06b6d4;
  box-shadow:
    0 0 0 1px rgba(6, 182, 212, 0.08),
    0 1px 3px rgba(0, 0, 0, 0.04);
}
.vertigo .score-badge.purple {
  border-color: #8b5cf6;
  color: #8b5cf6;
  box-shadow:
    0 0 0 1px rgba(139, 92, 246, 0.08),
    0 1px 3px rgba(0, 0, 0, 0.04);
}
.vertigo .score-badge.amber {
  border-color: #f59e0b;
  color: #f59e0b;
  box-shadow:
    0 0 0 1px rgba(245, 158, 11, 0.08),
    0 1px 3px rgba(0, 0, 0, 0.04);
}
.vertigo .strip {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.45rem;
  margin-bottom: 1.25rem;
}
.vertigo .strip-card {
  min-width: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2px;
  padding: 0.5rem 0.3rem;
  min-height: 76px;
  border-radius: 10px;
  cursor: pointer;
  text-align: center;
  border: 2px solid var(--vp-c-divider);
  background: var(--vp-c-bg-soft);
  transition:
    background 0.15s,
    border-color 0.15s;
  font-family: inherit;
  appearance: none;
  -webkit-appearance: none;
  box-sizing: border-box;
}
.vertigo .strip-card:hover {
  border-color: var(--vp-c-brand-1);
  background: rgba(128, 128, 128, 0.15);
}
.vertigo .sc-active {
  box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.18);
  border-color: #8b5cf6;
}
.vertigo .sc-nd {
  border-color: var(--vp-c-divider);
}
.vertigo .sc-ok {
  border-color: #22c55e;
}
.vertigo .sc-fail {
  border-color: #ef4444;
}
.vertigo .sc-critical {
  border-color: #ef4444;
}
.vertigo .sc-bppv {
  border-color: #3b82f6;
}
.vertigo .sc-teal {
  border-color: #06b6d4;
}
.vertigo .sc-purple {
  border-color: #8b5cf6;
}
.vertigo .sc-amber {
  border-color: #f59e0b;
}
.vertigo .sc-icon {
  font-size: 1.1rem;
}
.vertigo .sc-label {
  font-size: 0.9rem;
  font-weight: 900;
  color: var(--vp-c-text-3);
  white-space: nowrap;
}
.vertigo .sc-val {
  font-size: 1.3rem;
  font-weight: 900;
  color: var(--vp-c-text-1);
  line-height: 1;
}
.vertigo .sc-ok .sc-val {
  color: #22c55e;
}
.vertigo .sc-fail .sc-val {
  color: #ef4444;
}
.vertigo .sc-critical .sc-val {
  color: #ef4444;
}
.vertigo .sc-bppv .sc-val {
  color: #3b82f6;
}
.vertigo .sc-teal .sc-val {
  color: #06b6d4;
}
.vertigo .sc-purple .sc-val {
  color: #8b5cf6;
}
.vertigo .sc-amber .sc-val {
  color: #f59e0b;
}
.vertigo .sc-sub {
  font-size: 0.88rem;
  color: var(--vp-c-text-3);
  font-weight: 800;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;
}
.vertigo .tab-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.45rem;
}
.vertigo .tab-btn {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 0.5rem;
  padding: 0.6rem 0.75rem;
  border-radius: 10px;
  border: 1.5px solid var(--vp-c-divider);
  background: var(--vp-c-bg-soft);
  cursor: pointer;
  font-family: inherit;
  transition:
    background 0.15s,
    border-color 0.15s;
  text-align: left;
  width: 100%;
  box-sizing: border-box;
  min-height: 56px;
}
.vertigo .tab-btn:hover {
  border-color: var(--vp-c-brand-1);
  background: rgba(128, 128, 128, 0.15);
}
/* .tab-grid .tab-btn:last-child { grid-column: 1 / -1; } */
.vertigo button.tab-btn.tab-triage {
  border-color: #8b5cf6;
  background: rgba(139, 92, 246, 0.14);
}
.vertigo button.tab-btn.tab-hints {
  border-color: #ef4444;
  background: rgba(239, 68, 68, 0.14);
}
.vertigo button.tab-btn.tab-bppv {
  border-color: #3b82f6;
  background: rgba(59, 130, 246, 0.14);
}
.vertigo button.tab-btn.tab-auvp {
  border-color: #06b6d4;
  background: rgba(6, 182, 212, 0.14);
}
.vertigo button.tab-btn.tab-vmmd {
  border-color: #8b5cf6;
  background: rgba(139, 92, 246, 0.14);
}
.vertigo button.tab-btn.tab-triage:hover {
  background: rgba(139, 92, 246, 0.24);
}
.vertigo button.tab-btn.tab-hints:hover {
  background: rgba(239, 68, 68, 0.24);
}
.vertigo button.tab-btn.tab-bppv:hover {
  background: rgba(59, 130, 246, 0.24);
}
.vertigo button.tab-btn.tab-auvp:hover {
  background: rgba(6, 182, 212, 0.24);
}
.vertigo button.tab-btn.tab-vmmd:hover {
  background: rgba(139, 92, 246, 0.24);
}
.vertigo .tb-icon {
  font-size: 0.95rem;
  flex-shrink: 0;
}
.vertigo .tb-body {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-width: 0;
}
.vertigo .tb-title {
  font-size: 0.88rem;
  font-weight: 700;
  color: var(--vp-c-text-1);
}
.vertigo .tb-sub {
  font-size: 0.7rem;
  color: var(--vp-c-text-3);
}
.vertigo .tab-triage .tb-title {
  color: #7c3aed;
}
.vertigo .tab-hints .tb-title {
  color: #dc2626;
}
.vertigo .tab-bppv .tb-title {
  color: #2563eb;
}
.vertigo .tab-auvp .tb-title {
  color: #0891b2;
}
.vertigo .tab-vmmd .tb-title {
  color: #7c3aed;
}
.vertigo .tb-badge {
  font-size: 0.74rem;
  font-weight: 800;
  padding: 2px 6px;
  border-radius: 999px;
  flex-shrink: 0;
  white-space: nowrap;
}
.vertigo .tbb-nd {
  color: var(--vp-c-text-3);
  background: var(--vp-c-bg-mute);
}
.vertigo .tbb-done {
  color: #8b5cf6;
  background: rgba(139, 92, 246, 0.12);
}
.vertigo .tbb-central {
  color: #ef4444;
  background: rgba(239, 68, 68, 0.12);
}
.vertigo .tbb-periph {
  color: #22c55e;
  background: rgba(34, 197, 94, 0.12);
}
.vertigo .tbb-bppv {
  color: #3b82f6;
  background: rgba(59, 130, 246, 0.12);
}
.vertigo .tbb-teal {
  color: #06b6d4;
  background: rgba(6, 182, 212, 0.12);
}
.vertigo .tbb-purple {
  color: #8b5cf6;
  background: rgba(139, 92, 246, 0.12);
}
.vertigo .tbb-amber {
  color: #f59e0b;
  background: rgba(245, 158, 11, 0.12);
}
.vertigo .tbb-ok {
  color: #22c55e;
  background: rgba(34, 197, 94, 0.12);
}
.vertigo .nihss-group {
  margin-bottom: 1.25rem;
}
.vertigo .group-header-bar {
  display: flex;
  align-items: center;
  gap: 0.55rem;
  padding: 0.5rem 0.8rem;
  border-radius: 10px;
  background: linear-gradient(
    135deg,
    rgba(20, 184, 166, 0.08),
    var(--vp-c-bg-mute),
    var(--vp-c-bg-soft)
  );
  border: 1px solid var(--vp-c-divider);
  border-left: 4px solid #14b8a6;
  margin-bottom: 0.5rem;
  box-shadow: 0 1px 3px rgba(20, 184, 166, 0.06);
}
.vertigo .flow-bar {
  border-left: 4px solid #8b5cf6;
  background: linear-gradient(
    135deg,
    rgba(139, 92, 246, 0.08),
    var(--vp-c-bg-mute),
    var(--vp-c-bg-soft)
  );
  box-shadow: 0 1px 3px rgba(139, 92, 246, 0.06);
}
.vertigo .triage-bar {
  border-left: 4px solid #8b5cf6;
  background: linear-gradient(
    135deg,
    rgba(139, 92, 246, 0.08),
    var(--vp-c-bg-mute),
    var(--vp-c-bg-soft)
  );
  box-shadow: 0 1px 3px rgba(139, 92, 246, 0.06);
}
.vertigo .h-bar {
  border-left: 4px solid #3b82f6;
  background: linear-gradient(
    135deg,
    rgba(59, 130, 246, 0.08),
    var(--vp-c-bg-mute),
    var(--vp-c-bg-soft)
  );
  box-shadow: 0 1px 3px rgba(59, 130, 246, 0.06);
}
.vertigo .i-bar {
  border-left: 4px solid #8b5cf6;
  background: linear-gradient(
    135deg,
    rgba(139, 92, 246, 0.08),
    var(--vp-c-bg-mute),
    var(--vp-c-bg-soft)
  );
  box-shadow: 0 1px 3px rgba(139, 92, 246, 0.06);
}
.vertigo .n-bar {
  border-left: 4px solid #f97316;
  background: linear-gradient(
    135deg,
    rgba(249, 115, 22, 0.08),
    var(--vp-c-bg-mute),
    var(--vp-c-bg-soft)
  );
  box-shadow: 0 1px 3px rgba(249, 115, 22, 0.06);
}
.vertigo .plus-bar {
  border-left: 4px solid #06b6d4;
  background: linear-gradient(
    135deg,
    rgba(6, 182, 212, 0.08),
    var(--vp-c-bg-mute),
    var(--vp-c-bg-soft)
  );
  box-shadow: 0 1px 3px rgba(6, 182, 212, 0.06);
}
.vertigo .step-bar-1 {
  border-left: 4px solid #3b82f6;
  background: linear-gradient(
    135deg,
    rgba(59, 130, 246, 0.08),
    var(--vp-c-bg-mute),
    var(--vp-c-bg-soft)
  );
  box-shadow: 0 1px 3px rgba(59, 130, 246, 0.06);
}
.vertigo .step-bar-2 {
  border-left: 4px solid #8b5cf6;
  background: linear-gradient(
    135deg,
    rgba(139, 92, 246, 0.08),
    var(--vp-c-bg-mute),
    var(--vp-c-bg-soft)
  );
  box-shadow: 0 1px 3px rgba(139, 92, 246, 0.06);
}
.vertigo .step-bar-3 {
  border-left: 4px solid #f97316;
  background: linear-gradient(
    135deg,
    rgba(249, 115, 22, 0.08),
    var(--vp-c-bg-mute),
    var(--vp-c-bg-soft)
  );
  box-shadow: 0 1px 3px rgba(249, 115, 22, 0.06);
}
.vertigo .step-bar-4 {
  border-left: 4px solid #06b6d4;
  background: linear-gradient(
    135deg,
    rgba(6, 182, 212, 0.08),
    var(--vp-c-bg-mute),
    var(--vp-c-bg-soft)
  );
  box-shadow: 0 1px 3px rgba(6, 182, 212, 0.06);
}
.vertigo .auvp-bar-a {
  border-left: 4px solid #3b82f6;
  background: linear-gradient(
    135deg,
    rgba(59, 130, 246, 0.08),
    var(--vp-c-bg-mute),
    var(--vp-c-bg-soft)
  );
  box-shadow: 0 1px 3px rgba(59, 130, 246, 0.06);
}
.vertigo .auvp-bar-b {
  border-left: 4px solid #06b6d4;
  background: linear-gradient(
    135deg,
    rgba(6, 182, 212, 0.08),
    var(--vp-c-bg-mute),
    var(--vp-c-bg-soft)
  );
  box-shadow: 0 1px 3px rgba(6, 182, 212, 0.06);
}
.vertigo .auvp-bar-c {
  border-left: 4px solid #8b5cf6;
  background: linear-gradient(
    135deg,
    rgba(139, 92, 246, 0.08),
    var(--vp-c-bg-mute),
    var(--vp-c-bg-soft)
  );
  box-shadow: 0 1px 3px rgba(139, 92, 246, 0.06);
}
.vertigo .auvp-bar-d {
  border-left: 4px solid #22c55e;
  background: linear-gradient(
    135deg,
    rgba(34, 197, 94, 0.08),
    var(--vp-c-bg-mute),
    var(--vp-c-bg-soft)
  );
  box-shadow: 0 1px 3px rgba(34, 197, 94, 0.06);
}
.vertigo .auvp-bar-e {
  border-left: 4px solid #a855f7;
  background: linear-gradient(
    135deg,
    rgba(168, 85, 247, 0.08),
    var(--vp-c-bg-mute),
    var(--vp-c-bg-soft)
  );
  box-shadow: 0 1px 3px rgba(168, 85, 247, 0.06);
}
.vertigo .vmmd-bar {
  border-left: 4px solid #8b5cf6;
  background: linear-gradient(
    135deg,
    rgba(139, 92, 246, 0.08),
    var(--vp-c-bg-mute),
    var(--vp-c-bg-soft)
  );
  box-shadow: 0 1px 3px rgba(139, 92, 246, 0.06);
}
.vertigo .vm-bar-a {
  border-left: 4px solid #3b82f6;
  background: linear-gradient(
    135deg,
    rgba(59, 130, 246, 0.08),
    var(--vp-c-bg-mute),
    var(--vp-c-bg-soft)
  );
  box-shadow: 0 1px 3px rgba(59, 130, 246, 0.06);
}
.vertigo .vm-bar-b {
  border-left: 4px solid #8b5cf6;
  background: linear-gradient(
    135deg,
    rgba(139, 92, 246, 0.08),
    var(--vp-c-bg-mute),
    var(--vp-c-bg-soft)
  );
  box-shadow: 0 1px 3px rgba(139, 92, 246, 0.06);
}
.vertigo .vm-bar-c {
  border-left: 4px solid #f97316;
  background: linear-gradient(
    135deg,
    rgba(249, 115, 22, 0.08),
    var(--vp-c-bg-mute),
    var(--vp-c-bg-soft)
  );
  box-shadow: 0 1px 3px rgba(249, 115, 22, 0.06);
}
.vertigo .vm-bar-d {
  border-left: 4px solid #22c55e;
  background: linear-gradient(
    135deg,
    rgba(34, 197, 94, 0.08),
    var(--vp-c-bg-mute),
    var(--vp-c-bg-soft)
  );
  box-shadow: 0 1px 3px rgba(34, 197, 94, 0.06);
}
.vertigo .md-bar-a {
  border-left: 4px solid #f59e0b;
  background: linear-gradient(
    135deg,
    rgba(245, 158, 11, 0.08),
    var(--vp-c-bg-mute),
    var(--vp-c-bg-soft)
  );
  box-shadow: 0 1px 3px rgba(245, 158, 11, 0.06);
}
.vertigo .md-bar-b {
  border-left: 4px solid #f97316;
  background: linear-gradient(
    135deg,
    rgba(249, 115, 22, 0.08),
    var(--vp-c-bg-mute),
    var(--vp-c-bg-soft)
  );
  box-shadow: 0 1px 3px rgba(249, 115, 22, 0.06);
}
.vertigo .md-bar-c {
  border-left: 4px solid #eab308;
  background: linear-gradient(
    135deg,
    rgba(234, 179, 8, 0.08),
    var(--vp-c-bg-mute),
    var(--vp-c-bg-soft)
  );
  box-shadow: 0 1px 3px rgba(234, 179, 8, 0.06);
}
.vertigo .md-bar-d {
  border-left: 4px solid #22c55e;
  background: linear-gradient(
    135deg,
    rgba(34, 197, 94, 0.08),
    var(--vp-c-bg-mute),
    var(--vp-c-bg-soft)
  );
  box-shadow: 0 1px 3px rgba(34, 197, 94, 0.06);
}
.vertigo .group-icon {
  font-size: 0.95rem;
  font-weight: 900;
  flex-shrink: 0;
  width: 18px;
  text-align: center;
}
.vertigo .group-label-text {
  font-size: 0.95rem;
  font-weight: 800;
  color: var(--vp-c-text-1);
}
.vertigo .group-sub-text {
  font-size: 0.76rem;
  color: var(--vp-c-text-3);
  flex: 1;
}
.vertigo .group-score-tally {
  font-size: 0.7rem;
  font-weight: 700;
  padding: 2px 7px;
  border-radius: 999px;
  flex-shrink: 0;
  min-width: 50px;
  text-align: center;
  border: 1px solid transparent;
  margin-left: auto;
}
.vertigo .tally-ok {
  color: #22c55e;
  background: rgba(34, 197, 94, 0.12);
  border-color: rgba(34, 197, 94, 0.25);
}
.vertigo .tally-abn {
  color: #ef4444;
  background: rgba(239, 68, 68, 0.12);
  border-color: rgba(239, 68, 68, 0.25);
}
.vertigo .tally-nd {
  color: var(--vp-c-text-3);
  background: var(--vp-c-bg-soft);
  border-color: var(--vp-c-divider);
}
.vertigo .tally-central {
  color: #ef4444;
  background: rgba(239, 68, 68, 0.12);
  border-color: rgba(239, 68, 68, 0.25);
}
.vertigo .tally-periph {
  color: #22c55e;
  background: rgba(34, 197, 94, 0.12);
  border-color: rgba(34, 197, 94, 0.25);
}
.vertigo .triage-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.6rem;
  margin-bottom: 1rem;
}
.vertigo .triage-card {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
  padding: 0.8rem 0.85rem;
  border-radius: 12px;
  border: 2px solid var(--vp-c-divider);
  background: var(--vp-c-bg-soft);
  cursor: pointer;
  font-family: inherit;
  text-align: left;
  transition: all 0.2s;
}
.vertigo .triage-card:hover {
  border-color: var(--vp-c-brand-1);
  background: rgba(128, 128, 128, 0.15);
}
.vertigo button.triage-card.tc-avs {
  border-color: #ef4444;
  background: rgba(239, 68, 68, 0.12);
}
.vertigo button.triage-card.tc-pos {
  border-color: #3b82f6;
  background: rgba(59, 130, 246, 0.12);
}
.vertigo button.triage-card.tc-epi {
  border-color: #8b5cf6;
  background: rgba(139, 92, 246, 0.12);
}
.vertigo button.triage-card.tc-avs:hover {
  background: rgba(239, 68, 68, 0.22);
  border-color: #ef4444;
}
.vertigo button.triage-card.tc-pos:hover {
  background: rgba(59, 130, 246, 0.22);
  border-color: #3b82f6;
}
.vertigo button.triage-card.tc-epi:hover {
  background: rgba(139, 92, 246, 0.22);
  border-color: #8b5cf6;
}
.vertigo .tc-icon {
  font-size: 1.3rem;
}
.vertigo .tc-title {
  font-size: 0.85rem;
  font-weight: 800;
  color: var(--vp-c-text-1);
}
.vertigo .tc-avs .tc-title {
  color: #dc2626;
}
.vertigo .tc-pos .tc-title {
  color: #2563eb;
}
.vertigo .tc-epi .tc-title {
  color: #7c3aed;
}
.vertigo .tc-desc {
  font-size: 0.72rem;
  color: var(--vp-c-text-2);
  line-height: 1.5;
}
.vertigo .tc-tags {
  display: flex;
  gap: 0.3rem;
  flex-wrap: wrap;
}
.vertigo .tc-tag {
  font-size: 0.7rem;
  font-weight: 700;
  padding: 1px 6px;
  border-radius: 999px;
  background: var(--vp-c-bg-mute);
  color: var(--vp-c-text-2);
}
.vertigo .tc-tag-red {
  background: rgba(239, 68, 68, 0.12);
  color: #dc2626;
}
.vertigo .tc-tag-blue {
  background: rgba(59, 130, 246, 0.12);
  color: #2563eb;
}
.vertigo .tc-tag-purple {
  background: rgba(139, 92, 246, 0.12);
  color: #7c3aed;
}
.vertigo .tc-tag-amber {
  background: rgba(245, 158, 11, 0.12);
  color: #d97706;
}
.vertigo .tc-upper {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
}
.vertigo .tc-lower {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
  margin-top: 0.25rem;
}
.vertigo .tc-eg {
  font-size: 0.72rem;
  color: var(--vp-c-text-3);
  font-style: italic;
}
.vertigo .triage-flowbox {
  background: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-divider);
  border-radius: 12px;
  padding: 0.85rem 1rem;
  margin-bottom: 1rem;
  font-size: 0.85rem;
}
.vertigo .flow-title {
  font-size: 0.92rem;
  font-weight: 800;
  color: var(--vp-c-text-1);
  margin-bottom: 0.6rem;
}
.vertigo .flow-steps {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}
.vertigo .fs-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  justify-content: center;
}
.vertigo .fs-row-mini {
  display: flex;
  gap: 0.4rem;
  flex-wrap: wrap;
  justify-content: center;
}
.vertigo .fs-box {
  padding: 0.3rem 0.7rem;
  border-radius: 8px;
  font-weight: 700;
  text-align: center;
}
.vertigo .fs-start {
  background: var(--vp-c-bg-mute);
  color: var(--vp-c-text-1);
  border: 1px solid var(--vp-c-divider);
}
.vertigo .fs-q {
  background: rgba(139, 92, 246, 0.1);
  color: #7c3aed;
  border: 1px solid rgba(139, 92, 246, 0.25);
}
.vertigo .fs-step {
  background: rgba(239, 68, 68, 0.08);
  color: #dc2626;
  border: 1px solid rgba(239, 68, 68, 0.25);
}
.vertigo .fs-mini {
  padding: 0.3rem 0.7rem;
  border-radius: 8px;
  font-weight: 600;
  font-size: 0.78rem;
  text-align: center;
}
.vertigo .fs-central {
  background: rgba(239, 68, 68, 0.08);
  color: #dc2626;
  border: 1px solid rgba(239, 68, 68, 0.2);
}
.vertigo .fs-periph {
  background: rgba(6, 182, 212, 0.08);
  color: #0891b2;
  border: 1px solid rgba(6, 182, 212, 0.2);
}
.vertigo .fs-bppv {
  background: rgba(59, 130, 246, 0.08);
  color: #2563eb;
  border: 1px solid rgba(59, 130, 246, 0.2);
}
.vertigo .fs-epi {
  background: rgba(139, 92, 246, 0.08);
  color: #7c3aed;
  border: 1px solid rgba(139, 92, 246, 0.2);
}
.vertigo .fs-branches {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.6rem;
  margin-top: 0.4rem;
}
.vertigo .fs-branch {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
  padding: 0.5rem 0.4rem;
  border-radius: 8px;
  border: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg-mute);
}
.vertigo .fs-branch-label {
  font-size: 0.78rem;
  font-weight: 700;
  text-align: center;
}
.vertigo .fs-yes {
  color: #dc2626;
}
.vertigo .fs-no {
  color: #2563eb;
}
.vertigo .fs-arrow {
  font-size: 0.85rem;
  color: var(--vp-c-text-3);
}
.vertigo .prereq-notice {
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
  padding: 0.6rem 0.9rem;
  border-radius: 8px;
  background: rgba(245, 158, 11, 0.07);
  border: 1px solid rgba(245, 158, 11, 0.3);
  border-left: 3px solid #f59e0b;
  font-size: 0.85rem;
  color: var(--vp-c-text-2);
  line-height: 1.6;
  margin-bottom: 1rem;
}
.vertigo .pn-icon {
  flex-shrink: 0;
}
.vertigo .mg-alert {
  display: flex;
  align-items: flex-start;
  gap: 0.55rem;
  padding: 0.7rem 0.9rem;
  border-radius: 10px;
  font-size: 0.88rem;
  color: var(--vp-c-text-2);
  line-height: 1.6;
  margin-bottom: 1rem;
}
.vertigo .alert-critical {
  background: rgba(239, 68, 68, 0.06);
  border: 1px solid rgba(239, 68, 68, 0.35);
}
.vertigo .alert-moderate {
  background: rgba(249, 115, 22, 0.06);
  border: 1px solid rgba(249, 115, 22, 0.35);
}
.vertigo .alert-icon {
  flex-shrink: 0;
}
.vertigo .next-step-box {
  display: flex;
  align-items: flex-start;
  gap: 0.55rem;
  padding: 0.7rem 0.9rem;
  border-radius: 8px;
  background: rgba(34, 197, 94, 0.06);
  border: 1px solid rgba(34, 197, 94, 0.3);
  border-left: 3px solid #22c55e;
  font-size: 0.85rem;
  color: var(--vp-c-text-2);
  line-height: 1.6;
  margin-bottom: 1rem;
}
.vertigo .next-step-box p {
  margin: 0.2rem 0 0;
  font-size: 0.82rem;
}
.vertigo .nsb-icon {
  flex-shrink: 0;
  margin-top: 1px;
}
.vertigo .item-list {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}
.vertigo .crit-item,
.vertigo .hints-item {
  border: 1px solid var(--vp-c-divider);
  border-radius: 10px;
  background: var(--vp-c-bg-soft);
  overflow: hidden;
  transition: border-color 0.2s;
}
.vertigo .item-ok,
.vertigo .item-periph {
  border-color: #22c55e;
}
.vertigo .item-fail,
.vertigo .item-central {
  border-color: #ef4444;
}
.vertigo .item-na {
  border-color: #3b82f6;
}
.vertigo .item-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  padding: 0.55rem 0.8rem;
  background: var(--vp-c-bg-mute);
  border-bottom: 1px solid var(--vp-c-divider);
  gap: 0.65rem;
}
.vertigo .item-qnum {
  font-size: 0.72rem;
  font-weight: 800;
  padding: 1px 6px 2px;
  border-radius: 999px;
  flex-shrink: 0;
  white-space: nowrap;
}
.vertigo .q-step1 {
  color: #3b82f6;
  background: rgba(59, 130, 246, 0.12);
}
.vertigo .q-step2 {
  color: #8b5cf6;
  background: rgba(139, 92, 246, 0.12);
}
.vertigo .q-h {
  color: #3b82f6;
  background: rgba(59, 130, 246, 0.12);
}
.vertigo .q-i {
  color: #8b5cf6;
  background: rgba(139, 92, 246, 0.12);
}
.vertigo .q-n {
  color: #f97316;
  background: rgba(249, 115, 22, 0.12);
}
.vertigo .q-plus {
  color: #06b6d4;
  background: rgba(6, 182, 212, 0.12);
}
.vertigo .q-a {
  color: #3b82f6;
  background: rgba(59, 130, 246, 0.12);
}
.vertigo .q-b {
  color: #06b6d4;
  background: rgba(6, 182, 212, 0.12);
}
.vertigo .q-c {
  color: #8b5cf6;
  background: rgba(139, 92, 246, 0.12);
}
.vertigo .q-d {
  color: #22c55e;
  background: rgba(34, 197, 94, 0.12);
}
.vertigo .q-e {
  color: #a855f7;
  background: rgba(168, 85, 247, 0.12);
}
.vertigo .q-vm-a {
  color: #3b82f6;
  background: rgba(59, 130, 246, 0.12);
}
.vertigo .q-vm-b {
  color: #8b5cf6;
  background: rgba(139, 92, 246, 0.12);
}
.vertigo .q-vm-c {
  color: #f97316;
  background: rgba(249, 115, 22, 0.12);
}
.vertigo .q-vm-d {
  color: #22c55e;
  background: rgba(34, 197, 94, 0.12);
}
.vertigo .q-md-a {
  color: #f59e0b;
  background: rgba(245, 158, 11, 0.12);
}
.vertigo .q-md-b {
  color: #f97316;
  background: rgba(249, 115, 22, 0.12);
}
.vertigo .q-md-c {
  color: #eab308;
  background: rgba(234, 179, 8, 0.12);
}
.vertigo .q-md-d {
  color: #22c55e;
  background: rgba(34, 197, 94, 0.12);
}
.vertigo .item-name-block {
  display: flex;
  flex-direction: column;
  gap: 2px;
  flex: 1;
}
.vertigo .item-name {
  font-size: 0.92rem;
  font-weight: 600;
  color: var(--vp-c-text-1);
}
.vertigo .item-sub {
  font-size: 0.72rem;
  color: var(--vp-c-text-3);
  line-height: 1.5;
}
.vertigo .item-val {
  font-size: 0.85rem;
  font-weight: 800;
  flex-shrink: 0;
  min-width: 48px;
  text-align: right;
}
.vertigo .val-ok,
.vertigo .val-periph {
  color: #22c55e;
}
.vertigo .val-fail,
.vertigo .val-central {
  color: #ef4444;
}
.vertigo .val-nd {
  color: var(--vp-c-text-3);
}
.vertigo .two-choice-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2px;
  padding: 3px;
  background: var(--vp-c-bg-mute);
  border-top: 1px solid var(--vp-c-divider);
}
.vertigo .choice-btn {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 0.6rem 0.4rem;
  cursor: pointer;
  font-family: inherit;
  border: 1.5px solid transparent;
  border-radius: 6px;
  background: var(--vp-c-bg);
  color: var(--vp-c-text-2);
  transition: all 0.2s;
  text-align: center;
  align-items: center;
}
.vertigo .choice-btn:hover {
  border-color: var(--vp-c-divider);
  background: var(--vp-c-bg-soft);
}
.vertigo button.choice-btn.choice-active-c {
  border-color: #ef4444;
  background: linear-gradient(
    180deg,
    rgba(239, 68, 68, 0.12),
    rgba(239, 68, 68, 0.06)
  );
  box-shadow: 0 0 0 1px rgba(239, 68, 68, 0.08);
}
.vertigo button.choice-btn.choice-active-p {
  border-color: #22c55e;
  background: linear-gradient(
    180deg,
    rgba(34, 197, 94, 0.12),
    rgba(34, 197, 94, 0.06)
  );
  box-shadow: 0 0 0 1px rgba(34, 197, 94, 0.08);
}
.vertigo button.choice-btn.choice-active-c:hover {
  background: linear-gradient(
    180deg,
    rgba(239, 68, 68, 0.18),
    rgba(239, 68, 68, 0.1)
  );
}
.vertigo button.choice-btn.choice-active-p:hover {
  background: linear-gradient(
    180deg,
    rgba(34, 197, 94, 0.18),
    rgba(34, 197, 94, 0.1)
  );
}
.vertigo .choice-badge {
  display: inline-block;
  font-size: 0.6rem;
  font-weight: 800;
  padding: 1px 5px;
  border-radius: 999px;
  margin-bottom: 2px;
}
.vertigo .badge-c {
  background: rgba(239, 68, 68, 0.15);
  color: #dc2626;
}
.vertigo .badge-p {
  background: rgba(34, 197, 94, 0.15);
  color: #16a34a;
}
.vertigo .choice-title {
  font-size: 0.95rem;
  font-weight: 700;
  color: var(--vp-c-text-1);
}
.vertigo .choice-sub {
  font-size: 0.82rem;
  color: var(--vp-c-text-2);
  line-height: 1.4;
}
.vertigo .yn-row {
  display: flex;
  gap: 2px;
  padding: 3px;
  background: var(--vp-c-bg-mute);
  border-top: 1px solid var(--vp-c-divider);
}
.vertigo .btn-yn {
  flex: 1;
  padding: 0.6rem 0.15rem;
  font-size: 0.8rem;
  font-weight: 700;
  cursor: pointer;
  font-family: inherit;
  border: 1.5px solid transparent;
  border-radius: 6px;
  background: var(--vp-c-bg);
  color: var(--vp-c-text-2);
  transition: all 0.2s;
  text-align: center;
}
.vertigo .btn-yn:hover {
  border-color: var(--vp-c-divider);
  background: var(--vp-c-bg-soft);
}
.vertigo button.btn-yn.yn-ok-active,
.vertigo button.btn-yn.yn-p-active {
  border-color: #22c55e;
  background: linear-gradient(
    180deg,
    rgba(34, 197, 94, 0.12),
    rgba(34, 197, 94, 0.06)
  );
  box-shadow: 0 0 0 1px rgba(34, 197, 94, 0.08);
  color: #22c55e;
}
.vertigo button.btn-yn.yn-fail-active,
.vertigo button.btn-yn.yn-c-active {
  border-color: #ef4444;
  background: linear-gradient(
    180deg,
    rgba(239, 68, 68, 0.12),
    rgba(239, 68, 68, 0.06)
  );
  box-shadow: 0 0 0 1px rgba(239, 68, 68, 0.08);
  color: #ef4444;
}
.vertigo button.btn-yn.yn-ok-active:hover,
.vertigo button.btn-yn.yn-p-active:hover {
  background: linear-gradient(
    180deg,
    rgba(34, 197, 94, 0.18),
    rgba(34, 197, 94, 0.1)
  );
}
.vertigo button.btn-yn.yn-fail-active:hover,
.vertigo button.btn-yn.yn-c-active:hover {
  background: linear-gradient(
    180deg,
    rgba(239, 68, 68, 0.18),
    rgba(239, 68, 68, 0.1)
  );
}
.vertigo .vertigo_nyst-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.4rem;
}
.vertigo .vertigo_nyst-btn {
  display: flex;
  flex-direction: column;
  gap: 3px;
  padding: 0.58rem 0.75rem;
  border-radius: 10px;
  border: 1.5px solid var(--vp-c-divider);
  background: var(--vp-c-bg-soft);
  cursor: pointer;
  font-family: inherit;
  text-align: left;
  transition: all 0.15s;
}
.vertigo .vertigo_nyst-btn:hover {
  background: rgba(128, 128, 128, 0.15);
}
.vertigo .nopt-label {
  font-size: 0.78rem;
  font-weight: 700;
  color: var(--vp-c-text-1);
}
.vertigo .nopt-sub {
  font-size: 0.62rem;
  color: var(--vp-c-text-3);
  line-height: 1.4;
}
.vertigo button.vertigo_nyst-btn.nopt-pc.vertigo_nyst-active {
  border-color: #8b5cf6;
  background: rgba(139, 92, 246, 0.18);
}
.vertigo button.vertigo_nyst-btn.nopt-pc.vertigo_nyst-active .nopt-label {
  color: #8b5cf6;
}
.vertigo button.vertigo_nyst-btn.nopt-pc.vertigo_nyst-active:hover {
  background: rgba(139, 92, 246, 0.28);
}
.vertigo button.vertigo_nyst-btn.nopt-ac.vertigo_nyst-active {
  border-color: #f97316;
  background: rgba(249, 115, 22, 0.18);
}
.vertigo button.vertigo_nyst-btn.nopt-ac.vertigo_nyst-active .nopt-label {
  color: #f97316;
}
.vertigo button.vertigo_nyst-btn.nopt-ac.vertigo_nyst-active:hover {
  background: rgba(249, 115, 22, 0.28);
}
.vertigo button.vertigo_nyst-btn.nopt-hc.vertigo_nyst-active {
  border-color: #06b6d4;
  background: rgba(6, 182, 212, 0.18);
}
.vertigo button.vertigo_nyst-btn.nopt-hc.vertigo_nyst-active .nopt-label {
  color: #06b6d4;
}
.vertigo button.vertigo_nyst-btn.nopt-hc.vertigo_nyst-active:hover {
  background: rgba(6, 182, 212, 0.28);
}
.vertigo button.vertigo_nyst-btn.nopt-none.vertigo_nyst-active {
  border-color: var(--vp-c-text-3);
  background: rgba(128, 128, 128, 0.18);
}
.vertigo .not-bppv-notice {
  padding: 0.7rem 0.9rem;
  border-radius: 10px;
  background: rgba(239, 68, 68, 0.06);
  border: 1px solid rgba(239, 68, 68, 0.25);
  font-size: 0.8rem;
  color: var(--vp-c-text-2);
  margin-bottom: 1rem;
}
.vertigo .sub-score-row {
  display: flex;
  gap: 0.4rem;
  margin-bottom: 1rem;
  flex-wrap: wrap;
}
.vertigo .sub-score-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0.45rem 0.55rem;
  border-radius: 10px;
  border: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg-soft);
  flex: 1;
  min-width: 64px;
}
.vertigo .ss-ok {
  border-color: #22c55e;
}
.vertigo .ss-fail {
  border-color: #ef4444;
}
.vertigo .ss-central {
  border-color: #ef4444;
}
.vertigo .ss-periph {
  border-color: #22c55e;
}
.vertigo .ss-teal {
  border-color: #06b6d4;
}
.vertigo .ss-purple {
  border-color: #8b5cf6;
}
.vertigo .ss-amber {
  border-color: #f59e0b;
}
.vertigo .ss-nd {
  opacity: 0.5;
}
.vertigo .ss-label {
  font-size: 0.78rem;
  color: var(--vp-c-text-3);
  font-weight: 700;
  text-align: center;
}
.vertigo .ss-val {
  font-size: 1.1rem;
  font-weight: 900;
  font-weight: 800;
  color: var(--vp-c-text-1);
}
.vertigo .ss-ok .ss-val,
.vertigo .ss-periph .ss-val {
  color: #22c55e;
}
.vertigo .ss-fail .ss-val,
.vertigo .ss-central .ss-val {
  color: #ef4444;
}
.vertigo .ss-teal .ss-val {
  color: #06b6d4;
}
.vertigo .ss-purple .ss-val {
  color: #8b5cf6;
}
.vertigo .ss-amber .ss-val {
  color: #f59e0b;
}
.vertigo .vmmd-grid {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 0.45rem;
}
.vertigo .vmmd-btn {
  display: flex;
  flex-direction: column;
  gap: 3px;
  padding: 0.65rem 0.8rem;
  border-radius: 10px;
  border: 1.5px solid var(--vp-c-divider);
  background: var(--vp-c-bg-soft);
  cursor: pointer;
  font-family: inherit;
  text-align: left;
  transition: all 0.18s;
  width: 100%;
  box-sizing: border-box;
}
.vertigo .vmmd-btn:hover {
  border-color: var(--vp-c-brand-1);
  background: rgba(128, 128, 128, 0.15);
}
.vertigo button.vmmd-btn.vmmd-active-vm {
  border-color: #8b5cf6;
  background: rgba(139, 92, 246, 0.14);
}
.vertigo button.vmmd-btn.vmmd-active-md {
  border-color: #f59e0b;
  background: rgba(245, 158, 11, 0.14);
}
.vertigo button.vmmd-btn.vmmd-active-pmd {
  border-color: #f97316;
  background: rgba(249, 115, 22, 0.14);
}
.vertigo button.vmmd-btn.vmmd-active-vm:hover {
  background: rgba(139, 92, 246, 0.24);
}
.vertigo button.vmmd-btn.vmmd-active-md:hover {
  background: rgba(245, 158, 11, 0.24);
}
.vertigo button.vmmd-btn.vmmd-active-pmd:hover {
  background: rgba(249, 115, 22, 0.24);
}
.vertigo .vmmd-icon {
  font-size: 1.1rem;
}
.vertigo .vmmd-label {
  font-size: 0.95rem;
  font-weight: 700;
  color: var(--vp-c-text-1);
}
.vertigo .vmmd-active-vm .vmmd-label {
  color: #7c3aed;
}
.vertigo .vmmd-active-md .vmmd-label {
  color: #d97706;
}
.vertigo .vmmd-active-pmd .vmmd-label {
  color: #ea580c;
}
.vertigo .vmmd-sub {
  font-size: 0.75rem;
  color: var(--vp-c-text-3);
}
.vertigo .vmmd-badge {
  font-size: 0.78rem;
  font-weight: 800;
  padding: 2px 6px;
  border-radius: 999px;
  align-self: flex-start;
  margin-top: 2px;
}
.vertigo .result-card {
  display: flex;
  align-items: center;
  gap: 1.25rem;
  padding: 1.1rem 1.3rem;
  border-radius: 14px;
  border: 1px solid var(--vp-c-divider);
  background: linear-gradient(135deg, var(--vp-c-bg-soft), var(--vp-c-bg-mute));
  margin-bottom: 1rem;
  flex-wrap: wrap;
  transition: all 0.3s;
  min-height: 88px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
}
.vertigo .result-card.filling {
  border-color: var(--vp-c-divider);
}
.vertigo .result-card.normal {
  border-color: #22c55e;
  box-shadow:
    0 0 0 1px rgba(34, 197, 94, 0.06),
    0 1px 3px rgba(0, 0, 0, 0.04);
}
.vertigo .result-card.mild {
  border-color: #f59e0b;
  box-shadow:
    0 0 0 1px rgba(245, 158, 11, 0.06),
    0 1px 3px rgba(0, 0, 0, 0.04);
}
.vertigo .result-card.moderate {
  border-color: #3b82f6;
  box-shadow:
    0 0 0 1px rgba(59, 130, 246, 0.06),
    0 1px 3px rgba(0, 0, 0, 0.04);
}
.vertigo .result-card.critical {
  border-color: #ef4444;
  box-shadow:
    0 0 0 1px rgba(239, 68, 68, 0.06),
    0 1px 3px rgba(0, 0, 0, 0.04);
}
.vertigo .result-card.teal {
  border-color: #06b6d4;
  box-shadow:
    0 0 0 1px rgba(6, 182, 212, 0.06),
    0 1px 3px rgba(0, 0, 0, 0.04);
}
.vertigo .result-card.purple {
  border-color: #8b5cf6;
  box-shadow:
    0 0 0 1px rgba(139, 92, 246, 0.06),
    0 1px 3px rgba(0, 0, 0, 0.04);
}
.vertigo .result-card.amber {
  border-color: #f59e0b;
  box-shadow:
    0 0 0 1px rgba(245, 158, 11, 0.06),
    0 1px 3px rgba(0, 0, 0, 0.04);
}
.vertigo .result-left {
  display: flex;
  align-items: baseline;
  gap: 3px;
  flex-shrink: 0;
}
.vertigo .result-number {
  font-size: 3rem;
  font-weight: 800;
  line-height: 1;
  color: var(--vp-c-text-3);
  transition: color 0.3s;
}
.vertigo .result-card.normal .result-number {
  color: #22c55e;
}
.vertigo .result-card.mild .result-number {
  color: #f59e0b;
}
.vertigo .result-card.moderate .result-number {
  color: #3b82f6;
}
.vertigo .result-card.critical .result-number {
  color: #ef4444;
}
.vertigo .result-card.teal .result-number {
  color: #06b6d4;
}
.vertigo .result-card.purple .result-number {
  color: #8b5cf6;
}
.vertigo .result-card.amber .result-number {
  color: #f59e0b;
}
.vertigo .result-max {
  font-size: 0.9rem;
  color: var(--vp-c-text-3);
}
.vertigo .result-right {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.vertigo .result-ver {
  font-size: 0.76rem;
  font-weight: 700;
  color: var(--vp-c-text-3);
}
.vertigo .result-level {
  font-size: 0.9rem;
  font-weight: 700;
  color: var(--vp-c-text-1);
}
.vertigo .result-advice {
  font-size: 0.8rem;
  color: var(--vp-c-text-2);
  line-height: 1.5;
}
.vertigo .results-detail {
  border: 1px solid var(--vp-c-divider);
  border-radius: 10px;
  overflow: hidden;
  margin-bottom: 1rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.03);
}
.vertigo .results-header {
  padding: 0.45rem 0.85rem;
  font-size: 0.68rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--vp-c-text-3);
  background: var(--vp-c-bg-mute);
  border-bottom: 1px solid var(--vp-c-divider);
}
.vertigo .detail-row {
  display: flex;
  align-items: flex-start;
  gap: 0.55rem;
  padding: 0.45rem 0.85rem;
  border-bottom: 1px solid var(--vp-c-divider);
}
.vertigo .detail-row:last-child {
  border-bottom: none;
}
.vertigo .detail-total {
  background: linear-gradient(135deg, var(--vp-c-bg-mute), var(--vp-c-bg-soft));
}
.vertigo .detail-qnum {
  font-size: 0.66rem;
  font-weight: 800;
  flex-shrink: 0;
  width: 28px;
}
.vertigo .dq-c {
  color: #ef4444;
}
.vertigo .dq-p {
  color: #22c55e;
}
.vertigo .detail-domain {
  font-size: 0.75rem;
  font-weight: 700;
  color: var(--vp-c-text-1);
  flex: 1;
}
.vertigo .detail-score {
  font-size: 0.78rem;
  font-weight: 800;
  flex-shrink: 0;
  width: 70px;
  text-align: right;
}
.vertigo .ds-central {
  color: #ef4444;
}
.vertigo .ds-periph {
  color: #22c55e;
}
.vertigo .detail-score-brand {
  color: var(--vp-c-brand-1);
}
.vertigo .detail-desc {
  font-size: 0.68rem;
  color: var(--vp-c-text-2);
  flex-shrink: 0;
  width: 110px;
}
.vertigo .warn-box {
  display: flex;
  gap: 0.55rem;
  padding: 0.7rem 0.9rem;
  border-radius: 10px;
  background: rgba(249, 115, 22, 0.06);
  border: 1px solid rgba(249, 115, 22, 0.3);
  font-size: 0.78rem;
  color: var(--vp-c-text-2);
  line-height: 1.6;
  margin-bottom: 1rem;
}
.vertigo .warn-icon {
  color: #f97316;
  flex-shrink: 0;
}
.vertigo-actions {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
}
.vertigo .btn-view,
.vertigo .btn-copy,
.vertigo .btn-reset {
  padding: 9px 22px;
  border-radius: 8px;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  font-family: inherit;
  transition: all 0.2s;
}
.vertigo .btn-view {
  border: none;
  background: linear-gradient(135deg, var(--vp-c-brand-1), #4f46e5);
  color: #fff;
  box-shadow: 0 2px 8px rgba(99, 102, 241, 0.3);
}
.vertigo .btn-view:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 14px rgba(99, 102, 241, 0.4);
}
.vertigo .btn-view:active {
  transform: translateY(0);
}
.vertigo .btn-copy {
  border: 1.5px solid var(--vp-c-brand-1);
  background: transparent;
  color: var(--vp-c-brand-1);
}
.vertigo .btn-copy:hover {
  background: var(--vp-c-brand-soft);
}
.vertigo .btn-reset {
  border: 1px solid var(--vp-c-divider);
  background: transparent;
  color: var(--vp-c-text-2);
}
.vertigo .btn-reset:hover {
  border-color: #ef4444;
  color: #ef4444;
  background: rgba(239, 68, 68, 0.04);
}
@media (max-width: 640px) {
  .vertigo-header {
    flex-wrap: wrap;
  }
  .vertigo .score-badge {
    align-self: flex-start;
  }
  .vertigo .strip {
    grid-template-columns: 1fr 1fr;
  }
  .vertigo .tab-grid {
    grid-template-columns: 1fr;
  }
  .vertigo .triage-grid {
    grid-template-columns: 1fr;
  }
  .vertigo .two-choice-row,
  .vertigo .vertigo_nyst-grid {
    grid-template-columns: 1fr;
  }
  .vertigo .result-card {
    flex-direction: column;
    gap: 0.75rem;
  }
  .vertigo .vmmd-grid {
    grid-template-columns: 1fr;
  }
  .vertigo .fs-branches {
    grid-template-columns: 1fr;
  }
}

/* ==================================================================
   DHI Styles
   ================================================================== */
.dhi {
  max-width: 780px;
  margin: 0 auto;
  padding: 2rem 0 3rem;
  font-size: 0.9rem;
}

/* ── Header ────────────────────────────────────────────────────── */
.dhi-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 1.25rem;
  flex-wrap: wrap;
}

.dhi .title {
  font-size: 24px;
  font-weight: 600;
  color: var(--vp-c-text-1);
  margin: 0 0 0.2rem;
  border: none !important;
  padding: 0 !important;
}

.dhi .subtitle {
  font-size: 0.78rem;
  color: var(--vp-c-text-3);
  margin: 0;
}

.dhi .score-badge {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-width: 80px;
  padding: 0.6rem 1rem;
  border-radius: 14px;
  border: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg-soft);
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.06);
  transition: all 0.3s;
}
.dhi .score-number {
  font-size: 2rem;
  font-weight: 800;
  line-height: 1;
}
.dhi .score-label {
  font-size: 0.68rem;
  font-weight: 600;
  margin-top: 2px;
  text-align: center;
}

.dhi .score-badge.filling {
  color: var(--vp-c-text-3);
}
.dhi .score-badge.normal {
  border-color: #22c55e;
  color: #22c55e;
}
.dhi .score-badge.mild {
  border-color: #84cc16;
  color: #84cc16;
}
.dhi .score-badge.moderate {
  border-color: #f59e0b;
  color: #f59e0b;
}
.dhi .score-badge.severe {
  border-color: #f97316;
  color: #f97316;
}

/* ── Severity bar ──────────────────────────────────────────────── */
.dhi_severity-bar-wrap {
  margin-bottom: 0.75rem;
}

.dhi_severity-bar {
  height: 8px;
  border-radius: 999px;
  background: var(--vp-c-bg-mute);
  overflow: hidden;
  margin-bottom: 4px;
  box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.08);
}
.dhi_severity-fill {
  height: 100%;
  border-radius: 999px;
  transition:
    width 0.4s cubic-bezier(0.22, 1, 0.36, 1),
    background 0.3s cubic-bezier(0.22, 1, 0.36, 1);
}
.dhi_severity-fill.filling {
  background: var(--vp-c-divider);
}
.dhi_severity-fill.normal {
  background: linear-gradient(90deg, #22c55e, #4ade80);
}
.dhi_severity-fill.mild {
  background: linear-gradient(90deg, #84cc16, #a3e635);
}
.dhi_severity-fill.moderate {
  background: linear-gradient(90deg, #f59e0b, #fbbf24);
}
.dhi_severity-fill.severe {
  background: linear-gradient(90deg, #f97316, #fb923c);
}

.dhi_severity-ticks {
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

.dhi_severity-ticks .tk-normal {
  color: #22c55e;
  font-weight: 700;
}
.dhi_severity-ticks .tk-mild {
  color: #84cc16;
  font-weight: 700;
}
.dhi_severity-ticks .tk-moderate {
  color: #f59e0b;
  font-weight: 700;
}
.dhi_severity-ticks .tk-severe {
  color: #f97316;
  font-weight: 700;
}

/* ── Sub-scores ────────────────────────────────────────────────── */
.dhi .sub-scores {
  display: flex;
  gap: 0.6rem;
  margin-bottom: 1.25rem;
  flex-wrap: wrap;
}
.dhi .sub-pill {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 4px 12px;
  border-radius: 8px;
  border: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg-soft);
}
.dhi .sub-label {
  font-size: 0.72rem;
  font-weight: 700;
  color: var(--vp-c-text-2);
}
.dhi .sub-val {
  font-size: 0.82rem;
  font-weight: 800;
}

.dhi .func-pill {
  border-color: rgba(99, 102, 241, 0.3);
}
.dhi .func-pill .sub-val {
  color: #6366f1;
}
.dhi .emo-pill {
  border-color: rgba(20, 184, 166, 0.3);
}
.dhi .emo-pill .sub-val {
  color: #14b8a6;
}
.dhi .phys-pill {
  border-color: rgba(249, 115, 22, 0.3);
}
.dhi .phys-pill .sub-val {
  color: #f97316;
}

/* ── Intro ─────────────────────────────────────────────────────── */
.dhi .intro-bar {
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
.dhi .intro-dot {
  color: var(--vp-c-brand-1);
  flex-shrink: 0;
}

/* ── Group ─────────────────────────────────────────────────────── */
.dhi-group {
  margin-bottom: 1.75rem;
}

.dhi .group-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  margin-bottom: 0.5rem;
  padding: 0.55rem 0.75rem 0.55rem 1rem;
  border-radius: 8px;
  background: var(--vp-c-bg-mute);
  border: 1px solid var(--vp-c-divider);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
}
.dhi .group-header.func-header {
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.08), transparent);
  border-left: 4px solid #6366f1;
}
.dhi .group-header.emo-header {
  background: linear-gradient(135deg, rgba(20, 184, 166, 0.08), transparent);
  border-left: 4px solid #14b8a6;
}
.dhi .group-header.phys-header {
  background: linear-gradient(135deg, rgba(249, 115, 22, 0.08), transparent);
  border-left: 4px solid #f97316;
}

.dhi .group-label-block {
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.dhi .group-label {
  font-size: 0.85rem;
  font-weight: 700;
  color: var(--vp-c-text-1);
}
.dhi .group-sub {
  font-size: 0.7rem;
  color: var(--vp-c-text-3);
}

.dhi .group-score-pill {
  font-size: 0.78rem;
  font-weight: 700;
  padding: 3px 10px;
  border-radius: 999px;
  white-space: nowrap;
  flex-shrink: 0;
  border: 1px solid var(--vp-c-divider);
}
.dhi .group-score-pill.func-pill {
  color: #6366f1;
  border-color: rgba(99, 102, 241, 0.3);
}
.dhi .group-score-pill.emo-pill {
  color: #14b8a6;
  border-color: rgba(20, 184, 166, 0.3);
}
.dhi .group-score-pill.phys-pill {
  color: #f97316;
  border-color: rgba(249, 115, 22, 0.3);
}

/* ── Item ──────────────────────────────────────────────────────── */
.dhi .item-list {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.dhi-item {
  border: 1px solid var(--vp-c-divider);
  border-radius: 10px;
  background: var(--vp-c-bg-soft);
  overflow: hidden;
  transition: border-color 0.2s;
}
.dhi-item.answered.func {
  background: linear-gradient(135deg, rgba(34, 197, 94, 0.04), transparent);
}
.dhi-item.answered.emo {
  background: linear-gradient(135deg, rgba(34, 197, 94, 0.04), transparent);
}
.dhi-item.answered.phys {
  background: linear-gradient(135deg, rgba(34, 197, 94, 0.04), transparent);
}
.dhi-item.high {
  background: linear-gradient(135deg, rgba(249, 115, 22, 0.04), transparent);
  border-color: #ef4444 !important;
}

.dhi .item-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  padding: 0.6rem 0.9rem;
  background: var(--vp-c-bg-mute);
  border-bottom: 1px solid var(--vp-c-divider);
  gap: 0.75rem;
}

.dhi .item-meta-row {
  display: flex;
  align-items: center;
  flex-shrink: 0;
  padding-top: 3px;
  gap: 4px;
}

.dhi .item-qnum {
  font-size: 0.7rem;
  font-weight: 800;
  padding: 1px 7px;
  border-radius: 999px;
  letter-spacing: 0.04em;
  flex-shrink: 0;
}
.dhi .item-qnum.func-qnum {
  color: #6366f1;
  background: rgba(99, 102, 241, 0.12);
}
.dhi .item-qnum.emo-qnum {
  color: #14b8a6;
  background: rgba(20, 184, 166, 0.12);
}
.dhi .item-qnum.phys-qnum {
  color: #f97316;
  background: rgba(249, 115, 22, 0.12);
}

.dhi .domain-tag {
  font-size: 0.62rem;
  font-weight: 700;
  padding: 1px 6px;
  border-radius: 4px;
}
.dhi .domain-tag.func-tag {
  background: rgba(99, 102, 241, 0.12);
  color: #6366f1;
}
.dhi .domain-tag.emo-tag {
  background: rgba(20, 184, 166, 0.12);
  color: #14b8a6;
}
.dhi .domain-tag.phys-tag {
  background: rgba(249, 115, 22, 0.12);
  color: #f97316;
}

.dhi .item-name-block {
  display: flex;
  flex-direction: column;
  gap: 2px;
  flex: 1;
}
.dhi .item-name {
  font-size: 0.88rem;
  font-weight: 600;
  color: var(--vp-c-text-1);
  line-height: 1.4;
}
.dhi .item-sub {
  font-size: 0.7rem;
  color: var(--vp-c-text-3);
}
.dhi .item-hint {
  font-size: 0.72rem;
  color: var(--vp-c-text-2);
  font-style: italic;
}

.dhi .item-score {
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
.dhi .item-score.zero {
  color: #22c55e;
  border-color: rgba(34, 197, 94, 0.3);
  background: rgba(34, 197, 94, 0.06);
}
.dhi .item-score.unanswered {
  color: var(--vp-c-text-3);
  background: transparent;
  border-color: var(--vp-c-divider);
}
.dhi .item-score.high {
  color: #ef4444;
  border-color: rgba(239, 68, 68, 0.3);
  background: rgba(239, 68, 68, 0.06);
}

/* ── Option row — 3 columns ────────────────────────────────────── */
.dhi .option-row {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 2px;
  padding: 3px;
  background: var(--vp-c-bg-mute);
}

.dhi .opt-pill {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 0.65rem 0.2rem;
  cursor: pointer;
  transition: all 0.2s;
  text-align: center;
  gap: 4px;
  border-radius: 6px;
  background: var(--vp-c-bg);
  border: 1.5px solid transparent;
}
.dhi .opt-pill:hover {
  border-color: var(--vp-c-divider);
  background: var(--vp-c-bg-soft);
}
.dhi .opt-pill input[type="radio"] {
  display: none;
}

/* s0 */
.dhi .opt-pill.s0 {
  border-color: rgba(34, 197, 94, 0.15);
}
.dhi .opt-pill.s0:hover:not(.active),
.dhi .opt-pill.s0:focus-within {
  border-color: rgba(34, 197, 94, 0.35);
  background: rgba(34, 197, 94, 0.04);
}
.dhi .opt-pill.s0.active {
  border-color: #22c55e;
  background: color-mix(in srgb, rgb(34, 197, 94) 18%, var(--vp-c-bg));
  box-shadow: 0 0 0 1px rgba(34, 197, 94, 0.08);
}
.dhi .opt-pill.s0 .opt-num {
  color: rgba(34, 197, 94, 0.5);
}
.dhi .opt-pill.s0.active .opt-num {
  color: #22c55e;
}
.dhi .opt-pill.s0 .opt-desc {
  color: rgba(34, 197, 94, 0.4);
}
.dhi .opt-pill.s0.active .opt-desc {
  color: rgba(34, 197, 94, 0.7);
}

/* s2 */
.dhi .opt-pill.s2 {
  border-color: rgba(234, 179, 8, 0.15);
}
.dhi .opt-pill.s2:hover:not(.active),
.dhi .opt-pill.s2:focus-within {
  border-color: rgba(234, 179, 8, 0.35);
  background: rgba(234, 179, 8, 0.04);
}
.dhi .opt-pill.s2.active {
  border-color: #eab308;
  background: color-mix(in srgb, rgb(234, 179, 8) 18%, var(--vp-c-bg));
  box-shadow: 0 0 0 1px rgba(234, 179, 8, 0.08);
}
.dhi .opt-pill.s2 .opt-num {
  color: rgba(234, 179, 8, 0.85);
}
.dhi .opt-pill.s2.active .opt-num {
  color: #eab308;
}
.dhi .opt-pill.s2 .opt-desc {
  color: rgba(234, 179, 8, 0.7);
}
.dhi .opt-pill.s2.active .opt-desc {
  color: rgba(234, 179, 8, 0.7);
}

/* s4 */
.dhi .opt-pill.s4 {
  border-color: rgba(249, 115, 22, 0.15);
}
.dhi .opt-pill.s4:hover:not(.active),
.dhi .opt-pill.s4:focus-within {
  border-color: rgba(249, 115, 22, 0.35);
  background: rgba(249, 115, 22, 0.04);
}
.dhi .opt-pill.s4.active {
  border-color: #f97316;
  background: color-mix(in srgb, rgb(249, 115, 22) 18%, var(--vp-c-bg));
  box-shadow: 0 0 0 1px rgba(249, 115, 22, 0.08);
}
.dhi .opt-pill.s4 .opt-num {
  color: rgba(249, 115, 22, 0.85);
}
.dhi .opt-pill.s4.active .opt-num {
  color: #f97316;
}
.dhi .opt-pill.s4 .opt-desc {
  color: rgba(249, 115, 22, 0.7);
}
.dhi .opt-pill.s4.active .opt-desc {
  color: rgba(249, 115, 22, 0.7);
}

.dhi .opt-pill input[type="radio"] {
  display: none;
}

.dhi .opt-num {
  font-size: 1.05rem;
  font-weight: 900;
  transition: color 0.2s;
}

.dhi .opt-desc {
  font-size: 0.7rem;
  font-weight: 700;
  line-height: 1.3;
  transition: color 0.2s;
}

/* ── Result card ───────────────────────────────────────────────── */
.dhi-result {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  padding: 1.25rem 1.5rem;
  border-radius: 14px;
  border: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg-soft);
  margin-bottom: 1rem;
  flex-wrap: wrap;
  transition: border-color 0.3s;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}
.dhi-result.normal {
  background: linear-gradient(135deg, rgba(34, 197, 54, 0.06), transparent);
  border-color: #22c55e;
}
.dhi-result.mild {
  background: linear-gradient(135deg, rgba(132, 204, 22, 0.06), transparent);
  border-color: #84cc16;
}
.dhi-result.moderate {
  background: linear-gradient(135deg, rgba(245, 158, 11, 0.06), transparent);
  border-color: #f59e0b;
}
.dhi-result.severe {
  background: linear-gradient(135deg, rgba(249, 115, 22, 0.06), transparent);
  border-color: #f97316;
}

.dhi .result-left {
  display: flex;
  align-items: baseline;
  gap: 4px;
  flex-shrink: 0;
}
.dhi .result-number {
  font-size: 3.5rem;
  font-weight: 800;
  line-height: 1;
  color: var(--vp-c-text-3);
  transition: color 0.3s;
}
.dhi-result.normal .result-number {
  color: #22c55e;
}
.dhi-result.mild .result-number {
  color: #84cc16;
}
.dhi-result.moderate .result-number {
  color: #f59e0b;
}
.dhi-result.severe .result-number {
  color: #f97316;
}

.dhi .result-max {
  font-size: 1rem;
  color: var(--vp-c-text-3);
}
.dhi .result-right {
  display: flex;
  flex-direction: column;
  gap: 5px;
  flex: 1;
}
.dhi .result-level {
  font-size: 1rem;
  font-weight: 700;
  color: var(--vp-c-text-1);
}
.dhi .result-advice {
  font-size: 0.83rem;
  color: var(--vp-c-text-2);
  line-height: 1.5;
}

.dhi .result-breakdown {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
  margin-top: 2px;
}
.dhi .breakdown-pill {
  font-size: 0.72rem;
  font-weight: 700;
  padding: 2px 10px;
  border-radius: 999px;
}
.dhi .func-pill-sm {
  background: rgba(99, 102, 241, 0.1);
  color: #6366f1;
  border: 1px solid rgba(99, 102, 241, 0.3);
}
.dhi .emo-pill-sm {
  background: rgba(20, 184, 166, 0.1);
  color: #14b8a6;
  border: 1px solid rgba(20, 184, 166, 0.3);
}
.dhi .phys-pill-sm {
  background: rgba(249, 115, 22, 0.1);
  color: #f97316;
  border: 1px solid rgba(249, 115, 22, 0.3);
}

.dhi .result-threshold {
  font-size: 0.78rem;
  font-weight: 600;
}
.dhi-result.normal .result-threshold {
  color: #22c55e;
}
.dhi-result.mild .result-threshold,
.dhi-result.moderate .result-threshold,
.dhi-result.severe .result-threshold {
  color: #f97316;
}

/* ── Results detail ────────────────────────────────────────────── */
.dhi .results-detail {
  border: 1px solid var(--vp-c-divider);
  border-radius: 10px;
  overflow: hidden;
  margin-bottom: 1rem;
}
.dhi .results-header {
  padding: 0.5rem 0.9rem;
  font-size: 0.72rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--vp-c-text-3);
  background: var(--vp-c-bg-mute);
  border-bottom: 1px solid var(--vp-c-divider);
}

.dhi .detail-section-title {
  padding: 0.4rem 0.9rem;
  font-size: 0.75rem;
  font-weight: 700;
  border-bottom: 1px solid var(--vp-c-divider);
}
.dhi .func-section {
  color: #6366f1;
  background: rgba(99, 102, 241, 0.06);
}
.dhi .emo-section {
  color: #14b8a6;
  background: rgba(20, 184, 166, 0.06);
}
.dhi .phys-section {
  color: #f97316;
  background: rgba(249, 115, 22, 0.06);
}

.dhi .detail-row {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.45rem 0.9rem;
  border-bottom: 1px solid var(--vp-c-divider);
}
.dhi .detail-row:last-child {
  border-bottom: none;
}

.dhi .detail-qnum {
  font-size: 0.7rem;
  font-weight: 800;
  color: var(--vp-c-brand-1);
  flex-shrink: 0;
  width: 32px;
}
.dhi .detail-domain {
  font-size: 0.78rem;
  font-weight: 700;
  color: var(--vp-c-text-1);
  flex: 1;
}
.dhi .detail-score {
  font-size: 0.82rem;
  font-weight: 800;
  flex-shrink: 0;
  width: 52px;
  text-align: right;
}
.dhi .detail-score.zero {
  color: #22c55e;
}
.dhi .detail-score.high {
  color: #ef4444;
}
.dhi .detail-score.brand {
  color: var(--vp-c-brand-1);
}
.dhi .detail-desc {
  font-size: 0.75rem;
  color: var(--vp-c-text-2);
  flex-shrink: 0;
  width: 90px;
  text-align: left;
  text-align: left;
}

/* ── Actions ───────────────────────────────────────────────────── */
.dhi-actions {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.dhi .btn-view,
.dhi .btn-copy,
.dhi .btn-reset {
  padding: 9px 22px;
  border-radius: 8px;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  font-family: inherit;
  transition: all 0.2s;
}
.dhi .btn-view {
  border: none;
  background: linear-gradient(135deg, var(--vp-c-brand-1), #4f46e5);
  color: #fff;
  box-shadow: 0 2px 8px rgba(99, 102, 241, 0.3);
}
.dhi .btn-view:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 14px rgba(99, 102, 241, 0.4);
}
.dhi .btn-view:active {
  transform: translateY(0);
}
.dhi .btn-copy {
  border: 1.5px solid var(--vp-c-brand-1);
  background: transparent;
  color: var(--vp-c-brand-1);
}
.dhi .btn-copy:hover {
  background: var(--vp-c-brand-soft);
}
.dhi .btn-reset {
  border: 1px solid var(--vp-c-divider);
  background: transparent;
  color: var(--vp-c-text-2);
}
.dhi .btn-reset:hover {
  border-color: #ef4444;
  color: #ef4444;
  background: rgba(239, 68, 68, 0.04);
}

.dhi .progress-hint {
  font-size: 0.75rem;
  color: var(--vp-c-text-3);
  margin: 0.4rem 0 0;
}

@media (max-width: 640px) {
  .dhi-header {
    flex-direction: column;
  }
  .dhi .score-badge {
    flex-direction: row;
    gap: 0.5rem;
    align-self: flex-start;
  }
  .dhi .score-number {
    font-size: 1.5rem;
  }
  .dhi-result {
    flex-direction: column;
    gap: 0.75rem;
  }
  .dhi .detail-desc {
    width: 40px;
  }
}
</style>
