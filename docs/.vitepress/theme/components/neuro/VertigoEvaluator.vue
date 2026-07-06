<script setup lang="ts">
import { ref, computed } from "vue";

type MainTab = "triage" | "hints" | "bppv" | "auvp" | "vmmd";
type Ans = "yes" | "no" | null;
type HintsAns = "central" | "peripheral" | null;
type VmMdMode = "vm" | "definite_md" | "probable_md";

const activeTab = ref<MainTab>("triage");
const showResults = ref(false);
const copied = ref(false);

function switchTab(t: MainTab) {
  activeTab.value = t;
  showResults.value = false;
}

const isTabTriage = computed(() => activeTab.value === "triage");
const isTabHints = computed(() => activeTab.value === "hints");
const isTabBppv = computed(() => activeTab.value === "bppv");
const isTabAuvp = computed(() => activeTab.value === "auvp");
const isTabVmmd = computed(() => activeTab.value === "vmmd");

const hintsBadgeClass = computed(() => {
  if (!hintsComplete.value) return "tbb-nd";
  return hintsResult.value.screen ? "tbb-central" : "tbb-periph";
});
const hintsBadgeText = computed(() => {
  if (!hintsComplete.value) return hintsAnswered.value + "/3";
  return hintsResult.value.screen ? "中樞" : "周圍";
});
const auvpBadgeClass = computed(() => {
  if (!auvpAllComplete.value) return "tbb-nd";
  return auvpMetCount.value >= 4 ? "tbb-teal" : "tbb-nd";
});
const auvpBadgeText = computed(() => {
  if (!auvpAllComplete.value) return auvpAnswered.value + "/13";
  return auvpMetCount.value + "/5";
});
const vmmdBadgeClass = computed(() => {
  if (vmmdStrip.value === "purple") return "tbb-purple";
  if (vmmdStrip.value === "amber") return "tbb-amber";
  return "tbb-nd";
});
const vmmdBadgeText = computed(() => {
  if (vmAllComplete.value && vmMetCount.value >= 3)
    return vmMetCount.value + "/4";
  if (mdAllComplete.value && mdMetCount.value >= 3)
    return mdMetCount.value + "/4";
  if (pmAllComplete.value && pmMetCount.value === 3) return "3/3";
  return "待填";
});

function setVmmdMode(m: VmMdMode) {
  vmmdMode.value = m;
}

const vmBadgeClass = computed(() =>
  vmAllComplete.value && vmMetCount.value >= 3 ? "tbb-purple" : "tbb-nd",
);
const vmBadgeText = computed(() =>
  vmAllComplete.value ? vmMetCount.value + "/4" : vmAns.value + "/8",
);
const mdBadgeClass = computed(() =>
  mdAllComplete.value && mdMetCount.value >= 3 ? "tbb-amber" : "tbb-nd",
);
const mdBadgeText = computed(() =>
  mdAllComplete.value ? mdMetCount.value + "/4" : mdAllAns.value + "/9",
);
const pmBadgeClass = computed(() =>
  pmAllComplete.value && pmMetCount.value === 3 ? "tbb-amber" : "tbb-nd",
);
const pmBadgeText = computed(() =>
  pmAllComplete.value ? pmMetCount.value + "/3" : pmAllAns.value + "/4",
);

// ─────────────────────────────────────────────────────────────────
// TAB 1 · TRIAGE
// ─────────────────────────────────────────────────────────────────
const vertigoType = ref<"avs" | "positional" | "episodic" | null>(null);

function selectType(t: "avs" | "positional" | "episodic") {
  vertigoType.value = t;
  if (t === "avs") activeTab.value = "hints";
  else if (t === "positional") activeTab.value = "bppv";
  else activeTab.value = "vmmd";
  showResults.value = false;
}

// ─────────────────────────────────────────────────────────────────
// TAB 2 · HINTS
// ─────────────────────────────────────────────────────────────────
const hit = ref<HintsAns>(null);
const nyst = ref<HintsAns>(null);
const skew = ref<HintsAns>(null);
const hearing = ref<Ans>(null);

const hintsComplete = computed(
  () => hit.value !== null && nyst.value !== null && skew.value !== null,
);
const hintsAnswered = computed(
  () => [hit.value, nyst.value, skew.value].filter((v) => v !== null).length,
);
const centralCount = computed(
  () =>
    [
      hit.value === "central",
      nyst.value === "central",
      skew.value === "central",
    ].filter(Boolean).length,
);

const hintsResult = computed(() => {
  if (!hintsComplete.value)
    return { level: "填寫中", color: "filling", screen: false, advice: "" };
  if (centralCount.value >= 1)
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

const hintsPlus = computed(() => {
  if (!hintsComplete.value || hintsResult.value.screen) return null;
  return hearing.value === "yes"
    ? "新出現單側聽力損失 → 考慮 AICA 梗塞（HINTS Plus 陽性），建議影像學檢查"
    : null;
});

// ─────────────────────────────────────────────────────────────────
// TAB 3 · BPPV
// ─────────────────────────────────────────────────────────────────
const posVert = ref<Ans>(null);
const latency = ref<Ans>(null);
const limited = ref<Ans>(null);
const fatigue = ref<Ans>(null);
const dhR = ref<Ans>(null);
const dhL = ref<Ans>(null);
const nystType = ref<
  "upbeat_torsional" | "downbeat_torsional" | "horizontal" | "none" | null
>(null);
const rollTest = ref<"geotropic" | "apogeotropic" | "negative" | null>(null);
const heavierSide = ref<"right" | "left" | null>(null);

const bppvStep1Complete = computed(
  () =>
    posVert.value !== null &&
    latency.value !== null &&
    limited.value !== null &&
    fatigue.value !== null,
);
const isPositional = computed(
  () =>
    posVert.value === "yes" &&
    latency.value === "yes" &&
    limited.value === "yes",
);
const dixAnyPos = computed(() => dhR.value === "yes" || dhL.value === "yes");
const positiveSide = computed(() =>
  dhR.value === "yes" ? "right" : dhL.value === "yes" ? "left" : null,
);

const canal = computed(() => {
  if (!bppvStep1Complete.value || !isPositional.value) return null;
  if (nystType.value === "upbeat_torsional" && dixAnyPos.value)
    return "posterior";
  if (nystType.value === "downbeat_torsional" && dixAnyPos.value)
    return "anterior";
  if (nystType.value === "horizontal" || rollTest.value !== null)
    return "horizontal";
  if (nystType.value === "none") return "unclear";
  return null;
});
const subtype = computed(() => {
  if (canal.value === "horizontal") {
    if (rollTest.value === "geotropic") return "canalolithiasis";
    if (rollTest.value === "apogeotropic") return "cupulolithiasis";
  }
  return "canalolithiasis";
});
const bppvResult = computed(() => {
  if (!bppvStep1Complete.value)
    return { level: "填寫中", color: "filling", dx: "", advice: "" };
  if (!isPositional.value)
    return {
      level: "不符合 BPPV 表現",
      color: "normal",
      dx: "",
      advice:
        "症狀特徵不符合 BPPV 診斷標準。請考慮其他眩暈原因（前庭神經炎、梅尼爾氏症、中樞性眩暈等）。",
    };
  if (canal.value === "posterior")
    return {
      level: "後半規管 BPPV（PC-BPPV）— 管石症",
      color: "moderate",
      dx: `PC-BPPV（${positiveSide.value === "right" ? "右" : "左"}側）`,
      advice: `後半規管 BPPV：${positiveSide.value === "right" ? "右側" : "左側"} Dix-Hallpike 陽性，向上跳動兼旋轉性眼振。治療首選：Epley 復位術（患側）。成功率約 90%。`,
    };
  if (canal.value === "anterior")
    return {
      level: "前半規管 BPPV（AC-BPPV）— 極罕見",
      color: "moderate",
      dx: "AC-BPPV（罕見）",
      advice:
        "前半規管 BPPV 極罕見（< 1%），出現向下跳動兼旋轉性眼振。需排除小腦梗塞等中樞病變。",
    };
  if (canal.value === "horizontal") {
    if (subtype.value === "canalolithiasis")
      return {
        level: "水平半規管 BPPV — 管石症（Geotropic）",
        color: "moderate",
        dx: "HC-BPPV（管石症）",
        advice: `HC-BPPV 管石症：地向性雙向水平眼振，眼振較強側（${heavierSide.value === "right" ? "右" : heavierSide.value === "left" ? "左" : "未確認"}側）為患側。治療：Lempert 360° 滾轉法或 Gufoni 復位術。`,
      };
    return {
      level: "水平半規管 BPPV — 壺腹石症（Apogeotropic）",
      color: "moderate",
      dx: "HC-BPPV（壺腹石症）",
      advice:
        "HC-BPPV 壺腹石症：背地性持續水平眼振。治療：Gufoni 法或強迫體位法（患側朝下）。",
    };
  }
  if (canal.value === "unclear")
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
const aa1 = ref<Ans>(null);
const aa2 = ref<Ans>(null);
const aa3 = ref<Ans>(null);

const ab1 = ref<Ans>(null);
const ab2 = ref<Ans>(null);
const ab3 = ref<Ans>(null);
const ab4 = ref<Ans>(null);

const ac1 = ref<Ans>(null);
const ac2 = ref<Ans>(null);

const ad1 = ref<Ans>(null);
const ad2 = ref<Ans>(null);
const ad3 = ref<Ans>(null);

const ae1 = ref<Ans>(null);

const auvpAnswered = computed(
  () =>
    [aa1, aa2, aa3, ab1, ab2, ab3, ab4, ac1, ac2, ad1, ad2, ad3, ae1].filter(
      (v) => v.value !== null,
    ).length,
);
const aAComplete = computed(
  () => aa1.value !== null && aa2.value !== null && aa3.value !== null,
);
const aBComplete = computed(
  () =>
    ab1.value !== null &&
    ab2.value !== null &&
    ab3.value !== null &&
    ab4.value !== null,
);
const aCComplete = computed(() => ac1.value !== null && ac2.value !== null);
const aDComplete = computed(
  () => ad1.value !== null && ad2.value !== null && ad3.value !== null,
);
const aEComplete = computed(() => ae1.value !== null);
const auvpAllComplete = computed(
  () =>
    aAComplete.value &&
    aBComplete.value &&
    aCComplete.value &&
    aDComplete.value &&
    aEComplete.value,
);

const aAMet = computed(() => aa1.value === "yes" && aa2.value === "yes");
const aBMet = computed(
  () =>
    ab1.value === "yes" &&
    ab2.value === "yes" &&
    ab3.value === "yes" &&
    ab4.value === "yes",
);
const aCMet = computed(() => ac1.value === "yes" && ac2.value === "yes");
const aDMet = computed(
  () => ad1.value === "yes" && ad2.value === "yes" && ad3.value === "yes",
);
const aEMet = computed(() => ae1.value === "yes");
const auvpMetCount = computed(
  () =>
    [aAMet.value, aBMet.value, aCMet.value, aDMet.value, aEMet.value].filter(
      Boolean,
    ).length,
);

const auvpResult = computed(() => {
  if (!auvpAllComplete.value)
    return { level: "填寫中", color: "filling", dx: "", advice: "" };
  if (aAMet.value && aBMet.value && aCMet.value && aDMet.value && aEMet.value)
    return {
      level: "符合確定急性單側前庭病變（Definite AUVP）診斷標準",
      color: "teal",
      dx: "確定 AUVP",
      advice:
        "符合 Bárány Society 確定 AUVP 完整標準。治療：Methylprednisolone 100mg/day 遞減 3 週（可加速恢復）；急性期短程前庭抑制劑（≤3天）；恢復期前庭復健運動。勿過度使用前庭抑制劑以免延遲中樞代償。若有聽力損失則診斷為迷路炎（Labyrinthitis）。",
    };
  const missing = 5 - auvpMetCount.value;
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
const vmmdMode = ref<VmMdMode>("vm");

// ── Vestibular Migraine ──────────────────────────────────────────
const vma1 = ref<Ans>(null);
const vma2 = ref<Ans>(null);
const vma3 = ref<Ans>(null);
const vmb1 = ref<Ans>(null);
const vmc1 = ref<Ans>(null);
const vmc2 = ref<Ans>(null);
const vmc3 = ref<Ans>(null);
const vmd1 = ref<Ans>(null);

const vmAns = computed(
  () =>
    [vma1, vma2, vma3, vmb1, vmc1, vmc2, vmc3, vmd1].filter(
      (v) => v.value !== null,
    ).length,
);
const vmAllComplete = computed(() => vmAns.value === 8);
const vmAMet = computed(() => vma1.value === "yes" && vma2.value === "yes");
const vmBMet = computed(() => vmb1.value === "yes");
const vmCMet = computed(
  () => vmc1.value === "yes" || vmc2.value === "yes" || vmc3.value === "yes",
);
const vmDMet = computed(() => vmd1.value === "yes");
const vmMetCount = computed(
  () =>
    [vmAMet.value, vmBMet.value, vmCMet.value, vmDMet.value].filter(Boolean)
      .length,
);

const vmResult = computed(() => {
  if (!vmAllComplete.value)
    return { level: "填寫中", color: "filling", dx: "", advice: "" };
  if (vmAMet.value && vmBMet.value && vmCMet.value && vmDMet.value)
    return {
      level: "符合前庭性偏頭痛（Vestibular Migraine）診斷標準",
      color: "purple",
      dx: "VM",
      advice:
        "符合 Bárány Society/IHS 完整 VM 診斷標準。急性期：曲坦類（triptans）或止吐藥；預防性：心得安、托吡酯或 Amitriptyline；生活調整：規律作息、避免誘因（睡眠不足、壓力、特定食物）。",
    };
  if (vmMetCount.value === 3)
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
const mda1 = ref<Ans>(null);
const mda2 = ref<Ans>(null);
const mdb1 = ref<Ans>(null);
const mdb2 = ref<Ans>(null);
const mdb3 = ref<Ans>(null);
const mdc1 = ref<Ans>(null);
const mdc2 = ref<Ans>(null);
const mdc3 = ref<Ans>(null);
const mdd1 = ref<Ans>(null);

const mdAllAns = computed(
  () =>
    [mda1, mda2, mdb1, mdb2, mdb3, mdc1, mdc2, mdc3, mdd1].filter(
      (v) => v.value !== null,
    ).length,
);
const mdAllComplete = computed(() => mdAllAns.value === 9);
const mdAMet = computed(() => mda1.value === "yes" && mda2.value === "yes");
const mdBMet = computed(
  () => mdb1.value === "yes" && mdb2.value === "yes" && mdb3.value === "yes",
);
const mdCMet = computed(
  () => mdc1.value === "yes" || mdc2.value === "yes" || mdc3.value === "yes",
);
const mdDMet = computed(() => mdd1.value === "yes");
const mdMetCount = computed(
  () =>
    [mdAMet.value, mdBMet.value, mdCMet.value, mdDMet.value].filter(Boolean)
      .length,
);

const mdResult = computed(() => {
  if (!mdAllComplete.value)
    return { level: "填寫中", color: "filling", dx: "", advice: "" };
  if (mdAMet.value && mdBMet.value && mdCMet.value && mdDMet.value)
    return {
      level: "符合確定梅尼爾氏症（Definite Ménière's Disease）診斷標準",
      color: "amber",
      dx: "確定 MD",
      advice:
        "符合 Bárány Society 確定 MD。建議：低鹽飲食（<1500mg/day）、利尿劑（acetazolamide）；急性期前庭抑制劑；反覆發作考慮鼓室注射 dexamethasone 或 gentamicin；MRI 排除繼發性病因。",
    };
  if (mdMetCount.value >= 3)
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
const pma1 = ref<Ans>(null);
const pma2 = ref<Ans>(null);
const pmb1 = ref<Ans>(null);
const pmc1 = ref<Ans>(null);

const pmAllAns = computed(
  () => [pma1, pma2, pmb1, pmc1].filter((v) => v.value !== null).length,
);
const pmAllComplete = computed(() => pmAllAns.value === 4);
const pmAMet = computed(() => pma1.value === "yes" && pma2.value === "yes");
const pmBMet = computed(() => pmb1.value === "yes");
const pmCMet = computed(() => pmc1.value === "yes");
const pmMetCount = computed(
  () => [pmAMet.value, pmBMet.value, pmCMet.value].filter(Boolean).length,
);

const pmResult = computed(() => {
  if (!pmAllComplete.value)
    return { level: "填寫中", color: "filling", dx: "", advice: "" };
  if (pmAMet.value && pmBMet.value && pmCMet.value)
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
function reset() {
  vertigoType.value = null;
  hit.value = nyst.value = skew.value = hearing.value = null;
  posVert.value = latency.value = limited.value = fatigue.value = null;
  dhR.value = dhL.value = null;
  nystType.value = rollTest.value = null;
  heavierSide.value = null;
  [aa1, aa2, aa3, ab1, ab2, ab3, ab4, ac1, ac2, ad1, ad2, ad3, ae1].forEach(
    (v) => {
      v.value = null;
    },
  );
  [vma1, vma2, vma3, vmb1, vmc1, vmc2, vmc3, vmd1].forEach((v) => {
    v.value = null;
  });
  [mda1, mda2, mdb1, mdb2, mdb3, mdc1, mdc2, mdc3, mdd1].forEach((v) => {
    v.value = null;
  });
  [pma1, pma2, pmb1, pmc1].forEach((v) => {
    v.value = null;
  });
  activeTab.value = "triage";
  showResults.value = false;
  vmmdMode.value = "vm";
}

function generateMarkdown(): string {
  const lines: string[] = ["# 急性眩暈整合鑑別診斷評估\n"];
  lines.push(
    `## 眩暈分流\n類型：${vertigoType.value === "avs" ? "急性持續性（AVS）" : vertigoType.value === "positional" ? "位置性" : vertigoType.value === "episodic" ? "反覆發作性" : "未選擇"}\n`,
  );
  if (hintsComplete.value) {
    lines.push(
      `## HINTS 眼動檢查\n- H 頭部衝擊：${hit.value === "central" ? "正常HIT（中樞）" : "異常HIT（周圍）"}\n- I 眼振方向：${nyst.value === "central" ? "方向改變（中樞）" : "單一方向（周圍）"}\n- N 斜偏：${skew.value === "central" ? "斜偏存在（中樞）" : "無斜偏（周圍）"}\n**結果：${hintsResult.value.level}**\n${hintsResult.value.advice}\n`,
    );
  }
  if (bppvStep1Complete.value) {
    lines.push(
      `## BPPV 評估\n**結果：${bppvResult.value.level}**\n${bppvResult.value.advice}\n`,
    );
  }
  if (auvpAllComplete.value) {
    lines.push(
      `## AUVP/前庭神經炎\n達標：${auvpMetCount.value}/5\n**結果：${auvpResult.value.level}**\n${auvpResult.value.advice}\n`,
    );
  }
  if (vmAllComplete.value) {
    lines.push(
      `## 前庭性偏頭痛\n達標：${vmMetCount.value}/4\n**結果：${vmResult.value.level}**\n${vmResult.value.advice}\n`,
    );
  }
  if (mdAllComplete.value) {
    lines.push(
      `## 確定梅尼爾氏症\n達標：${mdMetCount.value}/4\n**結果：${mdResult.value.level}**\n${mdResult.value.advice}\n`,
    );
  }
  if (pmAllComplete.value) {
    lines.push(
      `## 可能梅尼爾氏症\n達標：${pmMetCount.value}/3\n**結果：${pmResult.value.level}**\n${pmResult.value.advice}\n`,
    );
  }
  return lines.join("\n");
}

async function copyOutput() {
  await navigator.clipboard.writeText(generateMarkdown());
  copied.value = true;
  setTimeout(() => {
    copied.value = false;
  }, 2000);
}

const hintsStrip = computed(() =>
  hintsComplete.value ? (hintsResult.value.screen ? "critical" : "ok") : "nd",
);
const bppvStrip = computed(() => {
  if (!bppvStep1Complete.value) return "nd";
  if (!isPositional.value) return "fail";
  return canal.value ? "bppv" : "ok";
});
const auvpStrip = computed(() =>
  auvpAllComplete.value ? (auvpMetCount.value >= 4 ? "teal" : "nd") : "nd",
);
const vmmdStrip = computed(() => {
  if (vmAllComplete.value && vmMetCount.value >= 3) return "purple";
  if (
    (mdAllComplete.value && mdMetCount.value >= 3) ||
    (pmAllComplete.value && pmMetCount.value === 3)
  )
    return "amber";
  return "nd";
});

const hintsStripClass = computed(() => `strip-card sc-${hintsStrip.value}`);
const bppvStripClass = computed(() => `strip-card sc-${bppvStrip.value}`);
const auvpStripClass = computed(() => `strip-card sc-${auvpStrip.value}`);
const vmmdStripClass = computed(() => `strip-card sc-${vmmdStrip.value}`);

const hintsStripVal = computed(() =>
  hintsComplete.value ? (hintsResult.value.screen ? "⚠" : "✓") : "—",
);
const hintsStripSub = computed(() =>
  hintsComplete.value
    ? hintsResult.value.screen
      ? "中樞性"
      : "周圍性"
    : "排除中風",
);
const bppvStripVal = computed(() => {
  if (!bppvStep1Complete.value) return "—";
  if (!isPositional.value) return "✗";
  return canal.value ? canal.value.substring(0, 2).toUpperCase() : "✓";
});
const bppvStripSub = computed(() => {
  if (!bppvStep1Complete.value) return "位置性";
  if (!isPositional.value) return "不符合";
  return canal.value ? bppvResult.value.dx.substring(0, 6) : "符合";
});
const auvpStripVal = computed(() =>
  auvpAllComplete.value ? auvpMetCount.value + "/5" : "—",
);
const auvpStripSub = computed(() =>
  auvpAllComplete.value ? auvpResult.value.dx || "未達" : "前庭神經炎",
);
const vmmdStripVal = computed(() => {
  if (vmAllComplete.value && vmMetCount.value >= 3)
    return vmMetCount.value + "/4";
  if (mdAllComplete.value && mdMetCount.value >= 3)
    return mdMetCount.value + "/4";
  if (pmAllComplete.value && pmMetCount.value === 3) return "3/3";
  return "—";
});
const vmmdStripSub = computed(() => {
  if (vmAllComplete.value && vmMetCount.value >= 3) return vmResult.value.dx;
  if (mdAllComplete.value && mdMetCount.value >= 3) return mdResult.value.dx;
  if (pmAllComplete.value && pmMetCount.value === 3) return pmResult.value.dx;
  return "反覆性眩暈";
});

const canShowResults = computed(() => {
  if (activeTab.value === "hints") return hintsComplete.value;
  if (activeTab.value === "bppv") return bppvStep1Complete.value;
  if (activeTab.value === "auvp") return auvpAllComplete.value;
  if (activeTab.value === "vmmd") {
    if (vmmdMode.value === "vm") return vmAllComplete.value;
    if (vmmdMode.value === "definite_md") return mdAllComplete.value;
    return pmAllComplete.value;
  }
  return false;
});
const canCopy = computed(() => canShowResults.value);

const badgeClass = computed(() => {
  if (activeTab.value === "triage") return "filling";
  if (activeTab.value === "hints") return hintsResult.value.color;
  if (activeTab.value === "bppv") return bppvResult.value.color;
  if (activeTab.value === "auvp") return auvpResult.value.color;
  if (vmmdMode.value === "vm") return vmResult.value.color;
  if (vmmdMode.value === "definite_md") return mdResult.value.color;
  return pmResult.value.color;
});
const badgeTop = computed(() => {
  const m: Record<string, string> = {
    triage: "分流",
    hints: "HINTS",
    bppv: "BPPV",
    auvp: "AUVP",
    vmmd: "VM/MD",
  };
  return m[activeTab.value] ?? "VM/MD";
});
const badgeNum = computed(() => {
  if (activeTab.value === "triage") return vertigoType.value ? "→" : "—";
  if (activeTab.value === "hints")
    return hintsComplete.value ? (hintsResult.value.screen ? "⚠" : "✓") : "—";
  if (activeTab.value === "bppv")
    return canal.value ? canal.value.substring(0, 2).toUpperCase() : "—";
  if (activeTab.value === "auvp")
    return auvpAllComplete.value ? String(auvpMetCount.value) : "—";
  if (vmmdMode.value === "vm")
    return vmAllComplete.value ? String(vmMetCount.value) : "—";
  if (vmmdMode.value === "definite_md")
    return mdAllComplete.value ? String(mdMetCount.value) : "—";
  return pmAllComplete.value ? String(pmMetCount.value) : "—";
});
const badgeUnit = computed(() => {
  if (activeTab.value === "auvp" && auvpAllComplete.value) return "/5";
  if (activeTab.value === "vmmd") {
    if (vmAllComplete.value || mdAllComplete.value || pmAllComplete.value)
      return vmmdMode.value === "probable_md" ? "/3" : "/4";
  }
  return "";
});
const badgeBot = computed(() => {
  if (activeTab.value === "triage") {
    const m: Record<string, string> = {
      avs: "AVS",
      positional: "位置性",
      episodic: "反覆性",
    };
    return vertigoType.value ? (m[vertigoType.value] ?? "待分流") : "待分流";
  }
  if (activeTab.value === "hints")
    return hintsComplete.value
      ? hintsResult.value.screen
        ? "中樞性"
        : "周圍性"
      : hintsAnswered.value + "/3";
  if (activeTab.value === "bppv")
    return canal.value ? bppvResult.value.dx.substring(0, 8) : "填寫中";
  if (activeTab.value === "auvp")
    return auvpAllComplete.value
      ? auvpResult.value.dx || auvpResult.value.level.substring(0, 6)
      : auvpAnswered.value + "/13";
  if (vmmdMode.value === "vm")
    return vmAllComplete.value
      ? vmResult.value.dx || "VM"
      : "填" + vmAns.value + "/8";
  if (vmmdMode.value === "definite_md")
    return mdAllComplete.value
      ? mdResult.value.dx || "MD"
      : "填" + mdAllAns.value + "/9";
  return pmAllComplete.value
    ? pmResult.value.dx || "pMD"
    : "填" + pmAllAns.value + "/4";
});

// ─────────────────────────────────────────────────────────────────
// Pre-computed for VM sub-score row  ← FIX: no .value in template
// ─────────────────────────────────────────────────────────────────
const vmSSA = computed(() =>
  vma1.value === null ? "ss-nd" : vmAMet.value ? "ss-purple" : "ss-fail",
);
const vmSSAv = computed(() =>
  vma1.value === null ? "—" : vmAMet.value ? "✓" : "✗",
);
const vmSSB = computed(() =>
  vmb1.value === null ? "ss-nd" : vmBMet.value ? "ss-purple" : "ss-fail",
);
const vmSSBv = computed(() =>
  vmb1.value === null ? "—" : vmBMet.value ? "✓" : "✗",
);
const vmSSC = computed(() =>
  vmc1.value === null ? "ss-nd" : vmCMet.value ? "ss-purple" : "ss-fail",
);
const vmSSCv = computed(() =>
  vmc1.value === null ? "—" : vmCMet.value ? "✓" : "✗",
);
const vmSSD = computed(() =>
  vmd1.value === null ? "ss-nd" : vmDMet.value ? "ss-purple" : "ss-fail",
);
const vmSSDv = computed(() =>
  vmd1.value === null ? "—" : vmDMet.value ? "✓" : "✗",
);

// Pre-computed for VM group-header tallies
const vmATallyClass = computed(() =>
  vma1.value !== null && vma2.value !== null && vma3.value !== null
    ? vmAMet.value
      ? "tally-ok"
      : "tally-abn"
    : "tally-nd",
);
const vmATallyText = computed(() =>
  vma1.value !== null && vma2.value !== null && vma3.value !== null
    ? vmAMet.value
      ? "✓"
      : "✗"
    : "—",
);
const vmCTallyClass = computed(() =>
  vmc1.value !== null && vmc2.value !== null && vmc3.value !== null
    ? vmCMet.value
      ? "tally-ok"
      : "tally-abn"
    : "tally-nd",
);
const vmCTallyText = computed(() =>
  vmc1.value !== null && vmc2.value !== null && vmc3.value !== null
    ? vmCMet.value
      ? "✓ ≥1項"
      : "✗"
    : "—",
);

// ─────────────────────────────────────────────────────────────────
// Pre-computed for Definite MD sub-score row  ← FIX: no .value in template
// ─────────────────────────────────────────────────────────────────
const mdSSA = computed(() =>
  mda1.value === null ? "ss-nd" : mdAMet.value ? "ss-amber" : "ss-fail",
);
const mdSSAv = computed(() =>
  mda1.value === null ? "—" : mdAMet.value ? "✓" : "✗",
);
const mdSSB = computed(() =>
  mdb1.value === null ? "ss-nd" : mdBMet.value ? "ss-amber" : "ss-fail",
);
const mdSSBv = computed(() =>
  mdb1.value === null ? "—" : mdBMet.value ? "✓" : "✗",
);
const mdSSC = computed(() =>
  mdc1.value === null ? "ss-nd" : mdCMet.value ? "ss-amber" : "ss-fail",
);
const mdSSCv = computed(() =>
  mdc1.value === null ? "—" : mdCMet.value ? "✓" : "✗",
);
const mdSSD = computed(() =>
  mdd1.value === null ? "ss-nd" : mdDMet.value ? "ss-amber" : "ss-fail",
);
const mdSSDv = computed(() =>
  mdd1.value === null ? "—" : mdDMet.value ? "✓" : "✗",
);

// Pre-computed for MD group-header tallies
const mdBTallyClass = computed(() =>
  mdb1.value !== null && mdb2.value !== null && mdb3.value !== null
    ? mdBMet.value
      ? "tally-ok"
      : "tally-abn"
    : "tally-nd",
);
const mdBTallyText = computed(() =>
  mdb1.value !== null && mdb2.value !== null && mdb3.value !== null
    ? mdBMet.value
      ? "✓"
      : "✗"
    : "—",
);
const mdCTallyClass = computed(() =>
  mdc1.value !== null && mdc2.value !== null && mdc3.value !== null
    ? mdCMet.value
      ? "tally-ok"
      : "tally-abn"
    : "tally-nd",
);
const mdCTallyText = computed(() =>
  mdc1.value !== null && mdc2.value !== null && mdc3.value !== null
    ? mdCMet.value
      ? "✓ ≥1"
      : "✗"
    : "—",
);

// ─────────────────────────────────────────────────────────────────
// Pre-computed for Probable MD sub-score row  ← FIX: no .value in template
// ─────────────────────────────────────────────────────────────────
const pmSSA = computed(() =>
  pma1.value === null ? "ss-nd" : pmAMet.value ? "ss-amber" : "ss-fail",
);
const pmSSAv = computed(() =>
  pma1.value === null ? "—" : pmAMet.value ? "✓" : "✗",
);
const pmSSB = computed(() =>
  pmb1.value === null ? "ss-nd" : pmBMet.value ? "ss-amber" : "ss-fail",
);
const pmSSBv = computed(() =>
  pmb1.value === null ? "—" : pmBMet.value ? "✓" : "✗",
);
const pmSSC = computed(() =>
  pmc1.value === null ? "ss-nd" : pmCMet.value ? "ss-amber" : "ss-fail",
);
const pmSSCv = computed(() =>
  pmc1.value === null ? "—" : pmCMet.value ? "✓" : "✗",
);
</script>

<template>
  <div class="vt">
    <!-- ══ HEADER ══════════════════════════════════════════════════ -->
    <div class="vt-header">
      <div class="header-title">
        <h2 class="title">ACUTE VERTIGO 急性眩暈鑑別診斷整合工具</h2>
        <p class="subtitle">
          HINTS · BPPV · AUVP · Vestibular Migraine · Ménière's Disease
        </p>
        <p class="subtitle-2">
          <span class="hint-tag hint-stroke">🚨 Step 1: HINTS 排除中風</span>
          <span class="hint-tag hint-auvp" style="margin-left: 6px"
            >🧠 Step 2: AUVP/前庭神經炎</span
          >
          <span class="hint-tag hint-vmmd" style="margin-left: 6px"
            >🔄 Step 3: VM / MD</span
          >
        </p>
      </div>
      <div class="score-badge" :class="badgeClass">
        <span class="badge-top">{{ badgeTop }}</span>
        <span class="score-number">{{ badgeNum }}</span>
        <span class="score-unit" v-if="badgeUnit">{{ badgeUnit }}</span>
        <span class="score-bot">{{ badgeBot }}</span>
      </div>
    </div>

    <!-- ══ PROGRESS STRIP ══════════════════════════════════════════ -->
    <div class="strip">
      <button
        type="button"
        class="strip-card"
        :class="{
          'sc-ok': hintsStrip === 'ok',
          'sc-critical': hintsStrip === 'critical',
          'sc-nd': hintsStrip === 'nd',
          'sc-active': isTabHints,
        }"
        @click="switchTab('hints')"
      >
        <span class="sc-icon">🚨</span>
        <span class="sc-label">HINTS</span>
        <span class="sc-val">{{ hintsStripVal }}</span>
        <span class="sc-sub">{{ hintsStripSub }}</span>
      </button>
      <button
        type="button"
        class="strip-card"
        :class="{
          'sc-bppv': bppvStrip === 'bppv',
          'sc-ok': bppvStrip === 'ok',
          'sc-fail': bppvStrip === 'fail',
          'sc-nd': bppvStrip === 'nd',
          'sc-active': isTabBppv,
        }"
        @click="switchTab('bppv')"
      >
        <span class="sc-icon">🔄</span>
        <span class="sc-label">BPPV</span>
        <span class="sc-val">{{ bppvStripVal }}</span>
        <span class="sc-sub">{{ bppvStripSub }}</span>
      </button>
      <button
        type="button"
        class="strip-card"
        :class="{
          'sc-teal': auvpStrip === 'teal',
          'sc-nd': auvpStrip === 'nd',
          'sc-active': isTabAuvp,
        }"
        @click="switchTab('auvp')"
      >
        <span class="sc-icon">🧠</span>
        <span class="sc-label">AUVP</span>
        <span class="sc-val">{{ auvpStripVal }}</span>
        <span class="sc-sub">{{ auvpStripSub }}</span>
      </button>
      <button
        type="button"
        class="strip-card"
        :class="{
          'sc-purple': vmmdStrip === 'purple',
          'sc-amber': vmmdStrip === 'amber',
          'sc-nd': vmmdStrip === 'nd',
          'sc-active': isTabVmmd,
        }"
        @click="switchTab('vmmd')"
      >
        <span class="sc-icon">🔁</span>
        <span class="sc-label">VM / MD</span>
        <span class="sc-val">{{ vmmdStripVal }}</span>
        <span class="sc-sub">{{ vmmdStripSub }}</span>
      </button>
    </div>

    <!-- ══ TAB NAV ══════════════════════════════════════════════════ -->
    <div class="nihss-group">
      <div class="group-header-bar flow-bar">
        <span class="group-icon">🗂</span>
        <span class="group-label-text">鑑別診斷流程（建議順序）</span>
        <span class="group-sub-text"
          >分流 → HINTS（持續性/排除中風）→ BPPV（位置性）→ AUVP → VM/MD</span
        >
      </div>
      <div class="tab-grid">
        <button
          class="tab-btn"
          :class="{ 'tab-triage': isTabTriage }"
          @click="switchTab('triage')"
        >
          <span class="tb-icon">🔀</span>
          <span class="tb-body">
            <span class="tb-title">Step 0 · 眩暈分流</span>
            <span class="tb-sub">持續性 / 位置性 / 反覆發作性</span>
          </span>
          <span class="tb-badge" :class="vertigoType ? 'tbb-done' : 'tbb-nd'">{{
            vertigoType || "待填"
          }}</span>
        </button>
        <button
          class="tab-btn"
          :class="{ 'tab-hints': isTabHints }"
          @click="switchTab('hints')"
        >
          <span class="tb-icon">🚨</span>
          <span class="tb-body">
            <span class="tb-title">Step 1 · HINTS 眼動檢查</span>
            <span class="tb-sub">急性持續性眩暈 · 排除缺血性中風</span>
          </span>
          <span class="tb-badge" :class="hintsBadgeClass">{{
            hintsBadgeText
          }}</span>
        </button>
        <button
          class="tab-btn"
          :class="{ 'tab-bppv': isTabBppv }"
          @click="switchTab('bppv')"
        >
          <span class="tb-icon">🔄</span>
          <span class="tb-body">
            <span class="tb-title">Step 2 · BPPV 決策樹</span>
            <span class="tb-sub">位置性眩暈 · Dix-Hallpike · Roll Test</span>
          </span>
          <span
            class="tb-badge"
            :class="
              bppvStep1Complete
                ? isPositional
                  ? 'tbb-bppv'
                  : 'tbb-central'
                : 'tbb-nd'
            "
            >{{
              bppvStep1Complete
                ? isPositional
                  ? canal
                    ? bppvResult.dx.substring(0, 6)
                    : "符合"
                  : "不符合"
                : "待填"
            }}</span
          >
        </button>
        <button
          class="tab-btn"
          :class="{ 'tab-auvp': isTabAuvp }"
          @click="switchTab('auvp')"
        >
          <span class="tb-icon">🧠</span>
          <span class="tb-body">
            <span class="tb-title">Step 3 · AUVP / 前庭神經炎</span>
            <span class="tb-sub">持續性眩暈 · HINTS 周圍性後確立診斷</span>
          </span>
          <span class="tb-badge" :class="auvpBadgeClass">{{
            auvpBadgeText
          }}</span>
        </button>
        <button
          class="tab-btn"
          :class="{ 'tab-vmmd': isTabVmmd }"
          @click="switchTab('vmmd')"
        >
          <span class="tb-icon">🔁</span>
          <span class="tb-body">
            <span class="tb-title">Step 4 · VM / Ménière's</span>
            <span class="tb-sub">反覆發作性眩暈 · 偏頭痛病史 · 耳部症狀</span>
          </span>
          <span class="tb-badge" :class="vmmdBadgeClass">{{
            vmmdBadgeText
          }}</span>
        </button>
      </div>
    </div>

    <!-- ══════════════ TAB: TRIAGE ══════════════════════════════════ -->
    <template v-if="isTabTriage">
      <div class="nihss-group">
        <div class="group-header-bar triage-bar">
          <span class="group-icon">❓</span>
          <span class="group-label-text">眩暈類型：如何分流？</span>
          <span class="group-sub-text">根據發作模式選擇後續評估工具</span>
        </div>
        <div class="triage-grid">
          <button
            class="triage-card"
            :class="{ 'tc-avs': vertigoType === 'avs' }"
            @click="selectType('avs')"
          >
            <span class="tc-icon">⏱️</span>
            <span class="tc-title">急性持續性眩暈（AVS）</span>
            <span class="tc-desc"
              >持續數小時至數天，靜止時仍有眩暈，伴自發性眼振、頭動不耐受、噁心嘔吐</span
            >
            <div class="tc-tags">
              <span class="tc-tag tc-tag-red">⚠ 需排除中風</span
              ><span class="tc-tag">→ HINTS Step 1</span>
            </div>
            <span class="tc-eg"
              >代表疾病：前庭神經炎、腦幹/小腦梗塞、迷路炎</span
            >
          </button>
          <button
            class="triage-card"
            :class="{ 'tc-pos': vertigoType === 'positional' }"
            @click="selectType('positional')"
          >
            <span class="tc-icon">🔄</span>
            <span class="tc-title">位置性眩暈（Positional）</span>
            <span class="tc-desc"
              >頭部或身體位置改變誘發，持續數秒至 1 分鐘，靜止後緩解，潛伏期
              5–20 秒</span
            >
            <div class="tc-tags">
              <span class="tc-tag tc-tag-blue">Dix-Hallpike</span
              ><span class="tc-tag">→ BPPV Step 2</span>
            </div>
            <span class="tc-eg">代表疾病：BPPV（後/水平/前半規管）</span>
          </button>
          <button
            class="triage-card"
            :class="{ 'tc-epi': vertigoType === 'episodic' }"
            @click="selectType('episodic')"
          >
            <span class="tc-icon">🔁</span>
            <span class="tc-title">反覆發作性眩暈（Episodic）</span>
            <span class="tc-desc"
              >間歇性眩暈發作，每次數分鐘至數十小時，發作間完全緩解，伴或不伴耳部/頭痛症狀</span
            >
            <div class="tc-tags">
              <span class="tc-tag tc-tag-purple">偏頭痛特徵？</span
              ><span class="tc-tag tc-tag-amber">耳悶/耳鳴？</span>
            </div>
            <span class="tc-eg"
              >代表疾病：前庭性偏頭痛（VM）、梅尼爾氏症（MD）</span
            >
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
            vertigoType ? "→" : "—"
          }}</span>
        </div>
        <div class="result-right">
          <span class="result-ver">分流結果</span>
          <span class="result-level">{{
            vertigoType === "avs"
              ? "請繼續 Step 1：HINTS 眼動檢查"
              : vertigoType === "positional"
                ? "請繼續 Step 2：BPPV 決策樹"
                : vertigoType === "episodic"
                  ? "請繼續 Step 4：前庭性偏頭痛 / 梅尼爾氏症"
                  : "請選擇眩暈類型"
          }}</span>
          <span class="result-advice" v-if="vertigoType">{{
            vertigoType === "avs"
              ? "急性持續性眩暈 — 點擊「Step 1 · HINTS」標籤，進行 H、I、N 三步驟眼動檢查以排除中風。"
              : vertigoType === "positional"
                ? "位置性眩暈 — 點擊「Step 2 · BPPV」標籤，依序確認症狀特徵、Dix-Hallpike 及眼振類型。"
                : "反覆發作性眩暈 — 點擊「Step 4 · VM/MD」標籤，評估前庭性偏頭痛或梅尼爾氏症。"
          }}</span>
        </div>
      </div>
    </template>

    <!-- ══════════════ TAB: HINTS ════════════════════════════════════ -->
    <template v-else-if="isTabHints">
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
      <div
        v-if="hintsComplete && hintsResult.screen"
        class="mg-alert alert-critical"
      >
        <span class="alert-icon">🚨</span
        ><span
          ><strong>{{ hintsResult.level }}：</strong
          >{{ hintsResult.advice }}</span
        >
      </div>
      <div v-if="hintsPlus" class="mg-alert alert-moderate">
        <span class="alert-icon">👂</span
        ><span><strong>HINTS Plus：</strong>{{ hintsPlus }}</span>
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
              hit !== null
                ? hit === 'central'
                  ? 'tally-central'
                  : 'tally-periph'
                : 'tally-nd'
            "
            >{{
              hit !== null ? (hit === "central" ? "中樞性" : "周圍性") : "—"
            }}</span
          >
        </div>
        <div
          class="hints-item"
          :class="
            hit === 'central'
              ? 'item-central'
              : hit === 'peripheral'
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
                hit === 'central'
                  ? 'val-central'
                  : hit === 'peripheral'
                    ? 'val-periph'
                    : 'val-nd'
              "
              >{{
                hit === null ? "—" : hit === "central" ? "正常HIT" : "異常HIT"
              }}</span
            >
          </div>
          <div class="two-choice-row">
            <button
              class="choice-btn"
              :class="{ 'choice-active-c': hit === 'central' }"
              @click="hit = 'central'"
            >
              <span class="choice-badge badge-c">中樞性</span>
              <span class="choice-title">正常 HIT（無補正掃視）</span>
              <span class="choice-sub"
                >眼球自然跟隨頭部 → VOR 正常 → 暗示可能為中樞病變</span
              >
            </button>
            <button
              class="choice-btn"
              :class="{ 'choice-active-p': hit === 'peripheral' }"
              @click="hit = 'peripheral'"
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
          <span class="group-label-text">眼振方向（Nystagmus Direction）</span>
          <span class="group-sub-text">觀察不同注視方向下的眼振類型</span>
          <span
            class="group-score-tally"
            :class="
              nyst !== null
                ? nyst === 'central'
                  ? 'tally-central'
                  : 'tally-periph'
                : 'tally-nd'
            "
            >{{
              nyst !== null ? (nyst === "central" ? "中樞性" : "周圍性") : "—"
            }}</span
          >
        </div>
        <div
          class="hints-item"
          :class="
            nyst === 'central'
              ? 'item-central'
              : nyst === 'peripheral'
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
                nyst === 'central'
                  ? 'val-central'
                  : nyst === 'peripheral'
                    ? 'val-periph'
                    : 'val-nd'
              "
              >{{
                nyst === null
                  ? "—"
                  : nyst === "central"
                    ? "方向改變"
                    : "單一方向"
              }}</span
            >
          </div>
          <div class="two-choice-row">
            <button
              class="choice-btn"
              :class="{ 'choice-active-c': nyst === 'central' }"
              @click="nyst = 'central'"
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
              :class="{ 'choice-active-p': nyst === 'peripheral' }"
              @click="nyst = 'peripheral'"
            >
              <span class="choice-badge badge-p">周圍性</span>
              <span class="choice-title">單一方向眼振（Unidirectional）</span>
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
              skew !== null
                ? skew === 'central'
                  ? 'tally-central'
                  : 'tally-periph'
                : 'tally-nd'
            "
            >{{
              skew !== null ? (skew === "central" ? "中樞性" : "周圍性") : "—"
            }}</span
          >
        </div>
        <div
          class="hints-item"
          :class="
            skew === 'central'
              ? 'item-central'
              : skew === 'peripheral'
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
                >交替遮蓋左眼、右眼，觀察露出的眼是否有垂直補正運動（skew
                deviation）</span
              >
            </div>
            <span
              class="item-val"
              :class="
                skew === 'central'
                  ? 'val-central'
                  : skew === 'peripheral'
                    ? 'val-periph'
                    : 'val-nd'
              "
              >{{
                skew === null ? "—" : skew === "central" ? "斜偏存在" : "無斜偏"
              }}</span
            >
          </div>
          <div class="two-choice-row">
            <button
              class="choice-btn"
              :class="{ 'choice-active-c': skew === 'central' }"
              @click="skew = 'central'"
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
              :class="{ 'choice-active-p': skew === 'peripheral' }"
              @click="skew = 'peripheral'"
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
              hearing !== null
                ? hearing === 'yes'
                  ? 'tally-central'
                  : 'tally-periph'
                : 'tally-nd'
            "
            >{{
              hearing !== null ? (hearing === "yes" ? "聽損" : "無") : "—"
            }}</span
          >
        </div>
        <div
          class="hints-item"
          :class="
            hearing === 'yes'
              ? 'item-central'
              : hearing === 'no'
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
                hearing === 'yes'
                  ? 'val-central'
                  : hearing === 'no'
                    ? 'val-periph'
                    : 'val-nd'
              "
              >{{
                hearing === null ? "—" : hearing === "yes" ? "有" : "無"
              }}</span
            >
          </div>
          <div class="yn-row">
            <button
              class="btn-yn btn-yn-c"
              :class="{ 'yn-c-active': hearing === 'yes' }"
              @click="hearing = 'yes'"
            >
              有單側聽力損失
            </button>
            <button
              class="btn-yn btn-yn-p"
              :class="{ 'yn-p-active': hearing === 'no' }"
              @click="hearing = 'no'"
            >
              無聽力損失
            </button>
          </div>
        </div>
      </div>

      <!-- Sub-score -->
      <div v-if="hintsAnswered > 0" class="sub-score-row">
        <div
          class="sub-score-card"
          :class="
            hit === 'central'
              ? 'ss-central'
              : hit === 'peripheral'
                ? 'ss-periph'
                : 'ss-nd'
          "
        >
          <span class="ss-label">H·頭部衝擊</span
          ><span class="ss-val">{{
            hit === null ? "—" : hit === "central" ? "正常HIT" : "異常HIT"
          }}</span>
        </div>
        <div
          class="sub-score-card"
          :class="
            nyst === 'central'
              ? 'ss-central'
              : nyst === 'peripheral'
                ? 'ss-periph'
                : 'ss-nd'
          "
        >
          <span class="ss-label">I·眼振方向</span
          ><span class="ss-val">{{
            nyst === null ? "—" : nyst === "central" ? "方向改變" : "單一方向"
          }}</span>
        </div>
        <div
          class="sub-score-card"
          :class="
            skew === 'central'
              ? 'ss-central'
              : skew === 'peripheral'
                ? 'ss-periph'
                : 'ss-nd'
          "
        >
          <span class="ss-label">N·斜偏測試</span
          ><span class="ss-val">{{
            skew === null ? "—" : skew === "central" ? "斜偏存在" : "無斜偏"
          }}</span>
        </div>
      </div>

      <div v-if="hintsComplete && !hintsResult.screen" class="next-step-box">
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

      <div v-if="showResults && hintsComplete" class="results-detail">
        <div class="results-header">HINTS 評估明細</div>
        <div class="detail-row">
          <span class="detail-qnum" :class="hit === 'central' ? 'dq-c' : 'dq-p'"
            >H</span
          >
          <span class="detail-domain">頭部衝擊試驗</span>
          <span
            class="detail-score"
            :class="hit === 'central' ? 'ds-central' : 'ds-periph'"
            >{{ hit === "central" ? "中樞" : "周圍" }}</span
          >
          <span class="detail-desc">{{
            hit === "central" ? "正常HIT—中樞性" : "異常HIT—周圍性"
          }}</span>
        </div>
        <div class="detail-row">
          <span
            class="detail-qnum"
            :class="nyst === 'central' ? 'dq-c' : 'dq-p'"
            >I</span
          >
          <span class="detail-domain">眼振方向</span>
          <span
            class="detail-score"
            :class="nyst === 'central' ? 'ds-central' : 'ds-periph'"
            >{{ nyst === "central" ? "中樞" : "周圍" }}</span
          >
          <span class="detail-desc">{{
            nyst === "central" ? "方向改變—中樞" : "單一方向—周圍"
          }}</span>
        </div>
        <div class="detail-row">
          <span
            class="detail-qnum"
            :class="skew === 'central' ? 'dq-c' : 'dq-p'"
            >N</span
          >
          <span class="detail-domain">斜偏測試</span>
          <span
            class="detail-score"
            :class="skew === 'central' ? 'ds-central' : 'ds-periph'"
            >{{ skew === "central" ? "中樞" : "周圍" }}</span
          >
          <span class="detail-desc">{{
            skew === "central" ? "斜偏存在—中樞" : "無斜偏—周圍"
          }}</span>
        </div>
        <div class="detail-row detail-total">
          <span class="detail-qnum">∑</span>
          <span class="detail-domain">HINTS 判讀</span>
          <span class="detail-score detail-score-brand">{{
            centralCount > 0 ? "中樞性" : "周圍性"
          }}</span>
          <span class="detail-desc">{{ centralCount }}/3 中樞體徵</span>
        </div>
      </div>

      <div class="result-card" :class="hintsResult.color">
        <div class="result-left">
          <span class="result-number">{{
            hintsComplete ? (hintsResult.screen ? "⚠" : "✓") : "—"
          }}</span>
        </div>
        <div class="result-right">
          <span class="result-ver">HINTS Exam · Kattah et al. Stroke 2009</span>
          <span class="result-level">{{ hintsResult.level }}</span>
          <span class="result-advice">{{ hintsResult.advice }}</span>
        </div>
      </div>
    </template>

    <!-- ══════════════ TAB: BPPV ═════════════════════════════════════ -->
    <template v-else-if="isTabBppv">
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
              bppvStep1Complete
                ? isPositional
                  ? 'tally-ok'
                  : 'tally-abn'
                : 'tally-nd'
            "
            >{{
              bppvStep1Complete ? (isPositional ? "符合" : "不符合") : "—"
            }}</span
          >
        </div>
        <div class="item-list">
          <div
            class="crit-item"
            :class="
              posVert === 'yes'
                ? 'item-ok'
                : posVert === 'no'
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
                  posVert === 'yes'
                    ? 'val-ok'
                    : posVert === 'no'
                      ? 'val-fail'
                      : 'val-nd'
                "
                >{{
                  posVert === null ? "—" : posVert === "yes" ? "是" : "否"
                }}</span
              >
            </div>
            <div class="yn-row">
              <button
                class="btn-yn btn-yn-ok"
                :class="{ 'yn-ok-active': posVert === 'yes' }"
                @click="posVert = 'yes'"
              >
                是
              </button>
              <button
                class="btn-yn btn-yn-fail"
                :class="{ 'yn-fail-active': posVert === 'no' }"
                @click="posVert = 'no'"
              >
                否
              </button>
            </div>
          </div>
          <div
            class="crit-item"
            :class="
              latency === 'yes'
                ? 'item-ok'
                : latency === 'no'
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
                  >Is there a latency of 5–20 seconds before onset?</span
                >
              </div>
              <span
                class="item-val"
                :class="
                  latency === 'yes'
                    ? 'val-ok'
                    : latency === 'no'
                      ? 'val-fail'
                      : 'val-nd'
                "
                >{{
                  latency === null ? "—" : latency === "yes" ? "是" : "否"
                }}</span
              >
            </div>
            <div class="yn-row">
              <button
                class="btn-yn btn-yn-ok"
                :class="{ 'yn-ok-active': latency === 'yes' }"
                @click="latency = 'yes'"
              >
                是
              </button>
              <button
                class="btn-yn btn-yn-fail"
                :class="{ 'yn-fail-active': latency === 'no' }"
                @click="latency = 'no'"
              >
                否
              </button>
            </div>
          </div>
          <div
            class="crit-item"
            :class="
              limited === 'yes'
                ? 'item-ok'
                : limited === 'no'
                  ? 'item-fail'
                  : ''
            "
          >
            <div class="item-header">
              <span class="item-qnum q-step1">Q3</span>
              <div class="item-name-block">
                <span class="item-name">眩暈是否在 60 秒內自然緩解？</span>
                <span class="item-sub"
                  >Does vertigo resolve within 60 seconds spontaneously?</span
                >
              </div>
              <span
                class="item-val"
                :class="
                  limited === 'yes'
                    ? 'val-ok'
                    : limited === 'no'
                      ? 'val-fail'
                      : 'val-nd'
                "
                >{{
                  limited === null ? "—" : limited === "yes" ? "是" : "否"
                }}</span
              >
            </div>
            <div class="yn-row">
              <button
                class="btn-yn btn-yn-ok"
                :class="{ 'yn-ok-active': limited === 'yes' }"
                @click="limited = 'yes'"
              >
                是
              </button>
              <button
                class="btn-yn btn-yn-fail"
                :class="{ 'yn-fail-active': limited === 'no' }"
                @click="limited = 'no'"
              >
                否
              </button>
            </div>
          </div>
          <div
            class="crit-item"
            :class="
              fatigue === 'yes'
                ? 'item-ok'
                : fatigue === 'no'
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
                  >Does vertigo fatigue with repeated maneuvers?</span
                >
              </div>
              <span
                class="item-val"
                :class="
                  fatigue === 'yes'
                    ? 'val-ok'
                    : fatigue === 'no'
                      ? 'val-fail'
                      : 'val-nd'
                "
                >{{
                  fatigue === null ? "—" : fatigue === "yes" ? "是" : "否"
                }}</span
              >
            </div>
            <div class="yn-row">
              <button
                class="btn-yn btn-yn-ok"
                :class="{ 'yn-ok-active': fatigue === 'yes' }"
                @click="fatigue = 'yes'"
              >
                是
              </button>
              <button
                class="btn-yn btn-yn-fail"
                :class="{ 'yn-fail-active': fatigue === 'no' }"
                @click="fatigue = 'no'"
              >
                否
              </button>
            </div>
          </div>
        </div>
      </div>

      <div v-if="bppvStep1Complete && !isPositional" class="not-bppv-notice">
        <span
          >⛔ 症狀特徵不符合 BPPV（需具備：位置性 + 潛伏期 + 持續 &lt; 60
          秒）。請考慮其他前庭疾患，或返回分流改選「急性持續性眩暈」進行 HINTS
          評估。</span
        >
      </div>

      <template v-if="bppvStep1Complete && isPositional">
        <div class="nihss-group">
          <div class="group-header-bar step-bar-2">
            <span class="group-icon">2️⃣</span>
            <span class="group-label-text">BPPV 步驟 2：Dix-Hallpike 測試</span>
            <span class="group-sub-text"
              >分別測試右側、左側，觀察是否誘發眩暈及眼振</span
            >
            <span
              class="group-score-tally"
              :class="
                dhR !== null && dhL !== null
                  ? dixAnyPos
                    ? 'tally-ok'
                    : 'tally-nd'
                  : 'tally-nd'
              "
              >{{
                dhR !== null && dhL !== null
                  ? dixAnyPos
                    ? "陽性"
                    : "陰性"
                  : "—"
              }}</span
            >
          </div>
          <div class="item-list">
            <div
              class="crit-item"
              :class="dhR === 'yes' ? 'item-ok' : dhR === 'no' ? 'item-na' : ''"
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
                  :class="dhR === 'yes' ? 'val-ok' : 'val-nd'"
                  >{{
                    dhR === null ? "—" : dhR === "yes" ? "陽性" : "陰性"
                  }}</span
                >
              </div>
              <div class="yn-row">
                <button
                  class="btn-yn btn-yn-ok"
                  :class="{ 'yn-ok-active': dhR === 'yes' }"
                  @click="dhR = 'yes'"
                >
                  陽性（誘發眩暈+眼振）
                </button>
                <button
                  class="btn-yn btn-yn-fail"
                  :class="{ 'yn-fail-active': dhR === 'no' }"
                  @click="dhR = 'no'"
                >
                  陰性（無誘發）
                </button>
              </div>
            </div>
            <div
              class="crit-item"
              :class="dhL === 'yes' ? 'item-ok' : dhL === 'no' ? 'item-na' : ''"
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
                  :class="dhL === 'yes' ? 'val-ok' : 'val-nd'"
                  >{{
                    dhL === null ? "—" : dhL === "yes" ? "陽性" : "陰性"
                  }}</span
                >
              </div>
              <div class="yn-row">
                <button
                  class="btn-yn btn-yn-ok"
                  :class="{ 'yn-ok-active': dhL === 'yes' }"
                  @click="dhL = 'yes'"
                >
                  陽性（誘發眩暈+眼振）
                </button>
                <button
                  class="btn-yn btn-yn-fail"
                  :class="{ 'yn-fail-active': dhL === 'no' }"
                  @click="dhL = 'no'"
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
          <div class="nyst-grid">
            <button
              class="nyst-btn nopt-pc"
              :class="{ 'nyst-active': nystType === 'upbeat_torsional' }"
              @click="nystType = 'upbeat_torsional'"
            >
              <span class="nopt-label">向上跳動＋旋轉性</span>
              <span class="nopt-sub"
                >上極朝患側耳 → 後半規管 BPPV（最常見 85–95%）</span
              >
            </button>
            <button
              class="nyst-btn nopt-ac"
              :class="{ 'nyst-active': nystType === 'downbeat_torsional' }"
              @click="nystType = 'downbeat_torsional'"
            >
              <span class="nopt-label">向下跳動＋旋轉性</span>
              <span class="nopt-sub"
                >下跳性眼振，少見 → 前半規管 BPPV（需排除小腦梗塞）</span
              >
            </button>
            <button
              class="nyst-btn nopt-hc"
              :class="{ 'nyst-active': nystType === 'horizontal' }"
              @click="nystType = 'horizontal'"
            >
              <span class="nopt-label">水平性眼振</span>
              <span class="nopt-sub"
                >純水平眼振，無旋轉成分 → 水平半規管 BPPV（需 Roll Test
                5–15%）</span
              >
            </button>
            <button
              class="nyst-btn nopt-none"
              :class="{ 'nyst-active': nystType === 'none' }"
              @click="nystType = 'none'"
            >
              <span class="nopt-label">無眼振誘發</span>
              <span class="nopt-sub"
                >Dix-Hallpike 陰性，可能已自行緩解或需 Roll Test</span
              >
            </button>
          </div>
        </div>
        <div
          v-if="nystType === 'horizontal' || nystType === 'none'"
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
          <div class="nyst-grid">
            <button
              class="nyst-btn nopt-hc"
              :class="{ 'nyst-active': rollTest === 'geotropic' }"
              @click="rollTest = 'geotropic'"
            >
              <span class="nopt-label">地向性（Geotropic）</span>
              <span class="nopt-sub"
                >雙側均出現朝地面方向的水平眼振 → HC-BPPV
                管石症，眼振較強側為患側</span
              >
            </button>
            <button
              class="nyst-btn nopt-ac"
              :class="{ 'nyst-active': rollTest === 'apogeotropic' }"
              @click="rollTest = 'apogeotropic'"
            >
              <span class="nopt-label">背地性（Apogeotropic）</span>
              <span class="nopt-sub"
                >雙側均出現遠離地面方向的水平眼振 → HC-BPPV 壺腹石症</span
              >
            </button>
            <button
              class="nyst-btn nopt-none"
              :class="{ 'nyst-active': rollTest === 'negative' }"
              @click="rollTest = 'negative'"
            >
              <span class="nopt-label">陰性（無眼振）</span>
              <span class="nopt-sub"
                >無誘發眼振，考慮 Probable BPPV 或非 BPPV 病因</span
              >
            </button>
          </div>
          <div
            v-if="rollTest === 'geotropic'"
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
                :class="{ 'yn-ok-active': heavierSide === 'right' }"
                @click="heavierSide = 'right'"
              >
                右側眼振較強（右側患側）
              </button>
              <button
                class="btn-yn btn-yn-ok"
                :class="{ 'yn-ok-active': heavierSide === 'left' }"
                @click="heavierSide = 'left'"
              >
                左側眼振較強（左側患側）
              </button>
            </div>
          </div>
        </div>
      </template>

      <div v-if="showResults && bppvStep1Complete" class="results-detail">
        <div class="results-header">BPPV 評估明細</div>
        <div class="detail-row">
          <span class="detail-qnum" :class="posVert === 'yes' ? 'dq-p' : 'dq-c'"
            >Q1</span
          >
          <span class="detail-domain">位置性眩暈</span>
          <span
            class="detail-score"
            :class="posVert === 'yes' ? 'ds-periph' : 'ds-central'"
            >{{ posVert === "yes" ? "是" : "否" }}</span
          >
        </div>
        <div class="detail-row">
          <span class="detail-qnum" :class="latency === 'yes' ? 'dq-p' : 'dq-c'"
            >Q2</span
          >
          <span class="detail-domain">潛伏期 5–20s</span>
          <span
            class="detail-score"
            :class="latency === 'yes' ? 'ds-periph' : 'ds-central'"
            >{{ latency === "yes" ? "是" : "否" }}</span
          >
        </div>
        <div class="detail-row">
          <span class="detail-qnum" :class="limited === 'yes' ? 'dq-p' : 'dq-c'"
            >Q3</span
          >
          <span class="detail-domain">持續 &lt; 60s</span>
          <span
            class="detail-score"
            :class="limited === 'yes' ? 'ds-periph' : 'ds-central'"
            >{{ limited === "yes" ? "是" : "否" }}</span
          >
        </div>
        <div class="detail-row">
          <span class="detail-qnum" :class="fatigue === 'yes' ? 'dq-p' : 'dq-c'"
            >Q4</span
          >
          <span class="detail-domain">疲勞性</span>
          <span
            class="detail-score"
            :class="fatigue === 'yes' ? 'ds-periph' : 'ds-central'"
            >{{ fatigue === "yes" ? "是" : "否" }}</span
          >
        </div>
        <div class="detail-row detail-total">
          <span class="detail-qnum">∑</span>
          <span class="detail-domain">BPPV 診斷</span>
          <span class="detail-score detail-score-brand">{{
            canal ? canal.toUpperCase() : "N/A"
          }}</span>
          <span class="detail-desc">{{
            bppvResult.dx || bppvResult.level.substring(0, 10)
          }}</span>
        </div>
      </div>

      <div class="result-card" :class="bppvResult.color">
        <div class="result-left">
          <span class="result-number" style="font-size: 2.5rem">{{
            canal === "posterior"
              ? "PC"
              : canal === "horizontal"
                ? "HC"
                : canal === "anterior"
                  ? "AC"
                  : "—"
          }}</span>
        </div>
        <div class="result-right">
          <span class="result-ver"
            >BPPV Decision Tree · Bárány Society 2015</span
          >
          <span class="result-level">{{ bppvResult.level }}</span>
          <span class="result-advice">{{ bppvResult.advice }}</span>
        </div>
      </div>
    </template>

    <!-- ══════════════ TAB: AUVP ═════════════════════════════════════ -->
    <template v-else-if="isTabAuvp">
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
              aAComplete ? (aAMet ? 'tally-ok' : 'tally-abn') : 'tally-nd'
            "
            >{{ aAComplete ? (aAMet ? "✓ 達標" : "✗ 未達") : "—" }}</span
          >
        </div>
        <div class="item-list">
          <div
            class="crit-item"
            :class="aa1 === 'yes' ? 'item-ok' : aa1 === 'no' ? 'item-fail' : ''"
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
                  aa1 === 'yes'
                    ? 'val-ok'
                    : aa1 === 'no'
                      ? 'val-fail'
                      : 'val-nd'
                "
                >{{ aa1 === null ? "—" : aa1 === "yes" ? "是" : "否" }}</span
              >
            </div>
            <div class="yn-row">
              <button
                class="btn-yn btn-yn-ok"
                :class="{ 'yn-ok-active': aa1 === 'yes' }"
                @click="aa1 = 'yes'"
              >
                是
              </button>
              <button
                class="btn-yn btn-yn-fail"
                :class="{ 'yn-fail-active': aa1 === 'no' }"
                @click="aa1 = 'no'"
              >
                否
              </button>
            </div>
          </div>
          <div
            class="crit-item"
            :class="aa2 === 'yes' ? 'item-ok' : aa2 === 'no' ? 'item-fail' : ''"
          >
            <div class="item-header">
              <span class="item-qnum q-a">A2</span>
              <div class="item-name-block">
                <span class="item-name">眩暈為非位置性（靜止時仍持續）？</span>
                <span class="item-sub"
                  >Non-positional: present even at rest</span
                >
              </div>
              <span
                class="item-val"
                :class="
                  aa2 === 'yes'
                    ? 'val-ok'
                    : aa2 === 'no'
                      ? 'val-fail'
                      : 'val-nd'
                "
                >{{ aa2 === null ? "—" : aa2 === "yes" ? "是" : "否" }}</span
              >
            </div>
            <div class="yn-row">
              <button
                class="btn-yn btn-yn-ok"
                :class="{ 'yn-ok-active': aa2 === 'yes' }"
                @click="aa2 = 'yes'"
              >
                是（靜止時仍有）
              </button>
              <button
                class="btn-yn btn-yn-fail"
                :class="{ 'yn-fail-active': aa2 === 'no' }"
                @click="aa2 = 'no'"
              >
                否（僅位置性）
              </button>
            </div>
          </div>
          <div
            class="crit-item"
            :class="aa3 === 'yes' ? 'item-ok' : aa3 === 'no' ? 'item-fail' : ''"
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
                  aa3 === 'yes'
                    ? 'val-ok'
                    : aa3 === 'no'
                      ? 'val-fail'
                      : 'val-nd'
                "
                >{{ aa3 === null ? "—" : aa3 === "yes" ? "是" : "否" }}</span
              >
            </div>
            <div class="yn-row">
              <button
                class="btn-yn btn-yn-ok"
                :class="{ 'yn-ok-active': aa3 === 'yes' }"
                @click="aa3 = 'yes'"
              >
                是
              </button>
              <button
                class="btn-yn btn-yn-fail"
                :class="{ 'yn-fail-active': aa3 === 'no' }"
                @click="aa3 = 'no'"
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
              aBComplete ? (aBMet ? 'tally-ok' : 'tally-abn') : 'tally-nd'
            "
            >{{ aBComplete ? (aBMet ? "✓ 達標" : "✗ 未達") : "—" }}</span
          >
        </div>
        <div class="item-list">
          <div
            class="crit-item"
            :class="ab1 === 'yes' ? 'item-ok' : ab1 === 'no' ? 'item-fail' : ''"
          >
            <div class="item-header">
              <span class="item-qnum q-b">B1</span>
              <div class="item-name-block">
                <span class="item-name">存在自發性眼振（靜止時可見）？</span>
                <span class="item-sub"
                  >Spontaneous nystagmus present at rest</span
                >
              </div>
              <span
                class="item-val"
                :class="
                  ab1 === 'yes'
                    ? 'val-ok'
                    : ab1 === 'no'
                      ? 'val-fail'
                      : 'val-nd'
                "
                >{{ ab1 === null ? "—" : ab1 === "yes" ? "是" : "否" }}</span
              >
            </div>
            <div class="yn-row">
              <button
                class="btn-yn btn-yn-ok"
                :class="{ 'yn-ok-active': ab1 === 'yes' }"
                @click="ab1 = 'yes'"
              >
                是
              </button>
              <button
                class="btn-yn btn-yn-fail"
                :class="{ 'yn-fail-active': ab1 === 'no' }"
                @click="ab1 = 'no'"
              >
                否
              </button>
            </div>
          </div>
          <div
            class="crit-item"
            :class="ab2 === 'yes' ? 'item-ok' : ab2 === 'no' ? 'item-fail' : ''"
          >
            <div class="item-header">
              <span class="item-qnum q-b">B2</span>
              <div class="item-name-block">
                <span class="item-name"
                  >眼振為水平扭轉混合性（horizontal-torsional）？</span
                >
                <span class="item-sub"
                  >Nystagmus is horizontal-torsional (not purely vertical)</span
                >
              </div>
              <span
                class="item-val"
                :class="
                  ab2 === 'yes'
                    ? 'val-ok'
                    : ab2 === 'no'
                      ? 'val-fail'
                      : 'val-nd'
                "
                >{{ ab2 === null ? "—" : ab2 === "yes" ? "是" : "否" }}</span
              >
            </div>
            <div class="yn-row">
              <button
                class="btn-yn btn-yn-ok"
                :class="{ 'yn-ok-active': ab2 === 'yes' }"
                @click="ab2 = 'yes'"
              >
                是（水平扭轉）
              </button>
              <button
                class="btn-yn btn-yn-fail"
                :class="{ 'yn-fail-active': ab2 === 'no' }"
                @click="ab2 = 'no'"
              >
                否（純垂直或純扭轉）
              </button>
            </div>
          </div>
          <div
            class="crit-item"
            :class="ab3 === 'yes' ? 'item-ok' : ab3 === 'no' ? 'item-fail' : ''"
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
                  ab3 === 'yes'
                    ? 'val-ok'
                    : ab3 === 'no'
                      ? 'val-fail'
                      : 'val-nd'
                "
                >{{ ab3 === null ? "—" : ab3 === "yes" ? "是" : "否" }}</span
              >
            </div>
            <div class="yn-row">
              <button
                class="btn-yn btn-yn-ok"
                :class="{ 'yn-ok-active': ab3 === 'yes' }"
                @click="ab3 = 'yes'"
              >
                是
              </button>
              <button
                class="btn-yn btn-yn-fail"
                :class="{ 'yn-fail-active': ab3 === 'no' }"
                @click="ab3 = 'no'"
              >
                否
              </button>
            </div>
          </div>
          <div
            class="crit-item"
            :class="ab4 === 'yes' ? 'item-ok' : ab4 === 'no' ? 'item-fail' : ''"
          >
            <div class="item-header">
              <span class="item-qnum q-b">B4</span>
              <div class="item-name-block">
                <span class="item-name"
                  >眼振非純垂直或純扭轉性？（純垂直/純扭轉 → 中樞警訊）</span
                >
                <span class="item-sub"
                  >NOT purely vertical or purely torsional (those suggest
                  central)</span
                >
              </div>
              <span
                class="item-val"
                :class="
                  ab4 === 'yes'
                    ? 'val-ok'
                    : ab4 === 'no'
                      ? 'val-fail'
                      : 'val-nd'
                "
                >{{
                  ab4 === null ? "—" : ab4 === "yes" ? "確認" : "警示"
                }}</span
              >
            </div>
            <div class="yn-row">
              <button
                class="btn-yn btn-yn-ok"
                :class="{ 'yn-ok-active': ab4 === 'yes' }"
                @click="ab4 = 'yes'"
              >
                確認（非純垂直/純扭轉）
              </button>
              <button
                class="btn-yn btn-yn-fail"
                :class="{ 'yn-fail-active': ab4 === 'no' }"
                @click="ab4 = 'no'"
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
            >HIT 補正掃視（患側朝向）+ caloric 麻痺，或 vHIT 增益不對稱</span
          >
          <span
            class="group-score-tally"
            :class="
              aCComplete ? (aCMet ? 'tally-ok' : 'tally-abn') : 'tally-nd'
            "
            >{{ aCComplete ? (aCMet ? "✓ 達標" : "✗ 未達") : "—" }}</span
          >
        </div>
        <div class="item-list">
          <div
            class="crit-item"
            :class="ac1 === 'yes' ? 'item-ok' : ac1 === 'no' ? 'item-fail' : ''"
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
                  ac1 === 'yes'
                    ? 'val-ok'
                    : ac1 === 'no'
                      ? 'val-fail'
                      : 'val-nd'
                "
                >{{ ac1 === null ? "—" : ac1 === "yes" ? "是" : "否" }}</span
              >
            </div>
            <div class="yn-row">
              <button
                class="btn-yn btn-yn-ok"
                :class="{ 'yn-ok-active': ac1 === 'yes' }"
                @click="ac1 = 'yes'"
              >
                是（患側補正掃視）
              </button>
              <button
                class="btn-yn btn-yn-fail"
                :class="{ 'yn-fail-active': ac1 === 'no' }"
                @click="ac1 = 'no'"
              >
                否
              </button>
            </div>
          </div>
          <div
            class="crit-item"
            :class="ac2 === 'yes' ? 'item-ok' : ac2 === 'no' ? 'item-fail' : ''"
          >
            <div class="item-header">
              <span class="item-qnum q-c">C2</span>
              <div class="item-name-block">
                <span class="item-name"
                  >VOR 不對稱已確認（caloric CP ≥25% 或 vHIT
                  增益不對稱）？</span
                >
                <span class="item-sub"
                  >VOR asymmetry confirmed: caloric canal paresis ≥25% or vHIT
                  gain asymmetry</span
                >
              </div>
              <span
                class="item-val"
                :class="
                  ac2 === 'yes'
                    ? 'val-ok'
                    : ac2 === 'no'
                      ? 'val-fail'
                      : 'val-nd'
                "
                >{{ ac2 === null ? "—" : ac2 === "yes" ? "是" : "否" }}</span
              >
            </div>
            <div class="yn-row">
              <button
                class="btn-yn btn-yn-ok"
                :class="{ 'yn-ok-active': ac2 === 'yes' }"
                @click="ac2 = 'yes'"
              >
                是（VOR 不對稱確認）
              </button>
              <button
                class="btn-yn btn-yn-fail"
                :class="{ 'yn-fail-active': ac2 === 'no' }"
                @click="ac2 = 'no'"
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
              aDComplete ? (aDMet ? 'tally-ok' : 'tally-abn') : 'tally-nd'
            "
            >{{ aDComplete ? (aDMet ? "✓ 達標" : "✗ 未達") : "—" }}</span
          >
        </div>
        <div class="item-list">
          <div
            class="crit-item"
            :class="ad1 === 'yes' ? 'item-ok' : ad1 === 'no' ? 'item-fail' : ''"
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
                  ad1 === 'yes'
                    ? 'val-ok'
                    : ad1 === 'no'
                      ? 'val-fail'
                      : 'val-nd'
                "
                >{{ ad1 === null ? "—" : ad1 === "yes" ? "是" : "否" }}</span
              >
            </div>
            <div class="yn-row">
              <button
                class="btn-yn btn-yn-ok"
                :class="{ 'yn-ok-active': ad1 === 'yes' }"
                @click="ad1 = 'yes'"
              >
                是（無 GEN）
              </button>
              <button
                class="btn-yn btn-yn-fail"
                :class="{ 'yn-fail-active': ad1 === 'no' }"
                @click="ad1 = 'no'"
              >
                否（有 GEN → 中樞警訊）
              </button>
            </div>
          </div>
          <div
            class="crit-item"
            :class="ad2 === 'yes' ? 'item-ok' : ad2 === 'no' ? 'item-fail' : ''"
          >
            <div class="item-header">
              <span class="item-qnum q-d">D2</span>
              <div class="item-name-block">
                <span class="item-name">無顯著斜偏（Skew Deviation）？</span>
                <span class="item-sub">No significant skew deviation</span>
              </div>
              <span
                class="item-val"
                :class="
                  ad2 === 'yes'
                    ? 'val-ok'
                    : ad2 === 'no'
                      ? 'val-fail'
                      : 'val-nd'
                "
                >{{ ad2 === null ? "—" : ad2 === "yes" ? "是" : "否" }}</span
              >
            </div>
            <div class="yn-row">
              <button
                class="btn-yn btn-yn-ok"
                :class="{ 'yn-ok-active': ad2 === 'yes' }"
                @click="ad2 = 'yes'"
              >
                是（無斜偏）
              </button>
              <button
                class="btn-yn btn-yn-fail"
                :class="{ 'yn-fail-active': ad2 === 'no' }"
                @click="ad2 = 'no'"
              >
                否（有斜偏 → 中樞警訊）
              </button>
            </div>
          </div>
          <div
            class="crit-item"
            :class="ad3 === 'yes' ? 'item-ok' : ad3 === 'no' ? 'item-fail' : ''"
          >
            <div class="item-header">
              <span class="item-qnum q-d">D3</span>
              <div class="item-name-block">
                <span class="item-name"
                  >無急性聽力損失或耳蝸症狀？（有 → 迷路炎，非 AUVP）</span
                >
                <span class="item-sub"
                  >No acute hearing loss (if present, diagnose Labyrinthitis,
                  not AUVP)</span
                >
              </div>
              <span
                class="item-val"
                :class="
                  ad3 === 'yes'
                    ? 'val-ok'
                    : ad3 === 'no'
                      ? 'val-fail'
                      : 'val-nd'
                "
                >{{ ad3 === null ? "—" : ad3 === "yes" ? "是" : "否" }}</span
              >
            </div>
            <div class="yn-row">
              <button
                class="btn-yn btn-yn-ok"
                :class="{ 'yn-ok-active': ad3 === 'yes' }"
                @click="ad3 = 'yes'"
              >
                是（無聽損）
              </button>
              <button
                class="btn-yn btn-yn-fail"
                :class="{ 'yn-fail-active': ad3 === 'no' }"
                @click="ad3 = 'no'"
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
              aEComplete ? (aEMet ? 'tally-ok' : 'tally-abn') : 'tally-nd'
            "
            >{{ aEComplete ? (aEMet ? "✓ 達標" : "✗ 未達") : "—" }}</span
          >
        </div>
        <div
          class="crit-item"
          :class="ae1 === 'yes' ? 'item-ok' : ae1 === 'no' ? 'item-fail' : ''"
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
                ae1 === 'yes' ? 'val-ok' : ae1 === 'no' ? 'val-fail' : 'val-nd'
              "
              >{{ ae1 === null ? "—" : ae1 === "yes" ? "是" : "否" }}</span
            >
          </div>
          <div class="yn-row">
            <button
              class="btn-yn btn-yn-ok"
              :class="{ 'yn-ok-active': ae1 === 'yes' }"
              @click="ae1 = 'yes'"
            >
              是（已排除）
            </button>
            <button
              class="btn-yn btn-yn-fail"
              :class="{ 'yn-fail-active': ae1 === 'no' }"
              @click="ae1 = 'no'"
            >
              否（尚未排除）
            </button>
          </div>
        </div>
      </div>

      <div v-if="auvpAnswered > 0" class="sub-score-row">
        <div
          class="sub-score-card"
          :class="!aAComplete ? 'ss-nd' : aAMet ? 'ss-teal' : 'ss-fail'"
        >
          <span class="ss-label">A·持續眩暈</span
          ><span class="ss-val">{{
            !aAComplete ? "—" : aAMet ? "✓" : "✗"
          }}</span>
        </div>
        <div
          class="sub-score-card"
          :class="!aBComplete ? 'ss-nd' : aBMet ? 'ss-teal' : 'ss-fail'"
        >
          <span class="ss-label">B·水平扭轉振</span
          ><span class="ss-val">{{
            !aBComplete ? "—" : aBMet ? "✓" : "✗"
          }}</span>
        </div>
        <div
          class="sub-score-card"
          :class="!aCComplete ? 'ss-nd' : aCMet ? 'ss-teal' : 'ss-fail'"
        >
          <span class="ss-label">C·VOR不對稱</span
          ><span class="ss-val">{{
            !aCComplete ? "—" : aCMet ? "✓" : "✗"
          }}</span>
        </div>
        <div
          class="sub-score-card"
          :class="!aDComplete ? 'ss-nd' : aDMet ? 'ss-teal' : 'ss-fail'"
        >
          <span class="ss-label">D·排除中樞</span
          ><span class="ss-val">{{
            !aDComplete ? "—" : aDMet ? "✓" : "✗"
          }}</span>
        </div>
        <div
          class="sub-score-card"
          :class="!aEComplete ? 'ss-nd' : aEMet ? 'ss-teal' : 'ss-fail'"
        >
          <span class="ss-label">E·排除其他</span
          ><span class="ss-val">{{
            !aEComplete ? "—" : aEMet ? "✓" : "✗"
          }}</span>
        </div>
      </div>

      <div v-if="showResults && auvpAllComplete" class="results-detail">
        <div class="results-header">AUVP 評估明細</div>
        <div
          v-for="row in [
            { q: 'A', label: '持續性眩暈 ≥24h', met: aAMet },
            { q: 'B', label: '水平扭轉眼振', met: aBMet },
            { q: 'C', label: 'VOR 不對稱', met: aCMet },
            { q: 'D', label: '排除中樞體徵', met: aDMet },
            { q: 'E', label: '排除其他診斷', met: aEMet },
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
            >{{ auvpMetCount }}/5</span
          >
          <span class="detail-desc">{{
            auvpResult.dx || auvpResult.level.substring(0, 8)
          }}</span>
        </div>
      </div>

      <div class="result-card" :class="auvpResult.color">
        <div class="result-left">
          <span class="result-number" style="font-size: 2.5rem">{{
            auvpAllComplete ? auvpMetCount : "—"
          }}</span>
          <span class="result-max" v-if="auvpAllComplete">/5</span>
        </div>
        <div class="result-right">
          <span class="result-ver"
            >AUVP / 前庭神經炎 · Strupp et al. J Vestib Res 2022</span
          >
          <span class="result-level">{{ auvpResult.level }}</span>
          <span class="result-advice">{{ auvpResult.advice }}</span>
        </div>
      </div>
    </template>

    <!-- ══════════════ TAB: VM / MD ══════════════════════════════════ -->
    <template v-else-if="isTabVmmd">
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
            :class="{ 'vmmd-active-vm': vmmdMode === 'vm' }"
            @click="setVmmdMode('vm')"
          >
            <span class="vmmd-icon">🧠</span>
            <span class="vmmd-label">前庭性偏頭痛（VM）</span>
            <span class="vmmd-sub">Bárány/IHS · A+B+C+D · 需偏頭痛病史</span>
            <span class="vmmd-badge" :class="vmBadgeClass">{{
              vmBadgeText
            }}</span>
          </button>
          <button
            class="vmmd-btn"
            :class="{ 'vmmd-active-md': vmmdMode === 'definite_md' }"
            @click="setVmmdMode('definite_md')"
          >
            <span class="vmmd-icon">👂</span>
            <span class="vmmd-label">確定梅尼爾氏症（Definite MD）</span>
            <span class="vmmd-sub">需聽力圖記錄低頻 SNHL · A+B+C+D</span>
            <span class="vmmd-badge" :class="mdBadgeClass">{{
              mdBadgeText
            }}</span>
          </button>
          <button
            class="vmmd-btn"
            :class="{ 'vmmd-active-pmd': vmmdMode === 'probable_md' }"
            @click="setVmmdMode('probable_md')"
          >
            <span class="vmmd-icon">🩺</span>
            <span class="vmmd-label">可能梅尼爾氏症（Probable MD）</span>
            <span class="vmmd-sub">臨床診斷 · 不需聽力圖 · A+B+C</span>
            <span class="vmmd-badge" :class="pmBadgeClass">{{
              pmBadgeText
            }}</span>
          </button>
        </div>
      </div>

      <!-- ── VM ─────────────────────────────────────────────────── -->
      <template v-if="vmmdMode === 'vm'">
        <div class="nihss-group">
          <div class="group-header-bar vm-bar-a">
            <span class="group-icon">🅐</span>
            <span class="group-label-text">標準 A：前庭發作次數與特徵</span>
            <span class="group-sub-text"
              >中重度前庭症狀，持續 5 分鐘至 72 小時，≥5 次</span
            >
            <!-- FIX: use pre-computed computed instead of .value in template -->
            <span class="group-score-tally" :class="vmATallyClass">{{
              vmATallyText
            }}</span>
          </div>
          <div class="item-list">
            <div
              class="crit-item"
              :class="
                vma1 === 'yes' ? 'item-ok' : vma1 === 'no' ? 'item-fail' : ''
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
                    vma1 === 'yes'
                      ? 'val-ok'
                      : vma1 === 'no'
                        ? 'val-fail'
                        : 'val-nd'
                  "
                  >{{
                    vma1 === null ? "—" : vma1 === "yes" ? "是" : "否"
                  }}</span
                >
              </div>
              <div class="yn-row">
                <button
                  class="btn-yn btn-yn-ok"
                  :class="{ 'yn-ok-active': vma1 === 'yes' }"
                  @click="vma1 = 'yes'"
                >
                  是（≥5 次）
                </button>
                <button
                  class="btn-yn btn-yn-fail"
                  :class="{ 'yn-fail-active': vma1 === 'no' }"
                  @click="vma1 = 'no'"
                >
                  否
                </button>
              </div>
            </div>
            <div
              class="crit-item"
              :class="
                vma2 === 'yes' ? 'item-ok' : vma2 === 'no' ? 'item-fail' : ''
              "
            >
              <div class="item-header">
                <span class="item-qnum q-vm-a">A2</span>
                <div class="item-name-block">
                  <span class="item-name">每次發作持續 5 分鐘至 72 小時？</span>
                  <span class="item-sub"
                    >Duration of 5 minutes to 72 hours per episode</span
                  >
                </div>
                <span
                  class="item-val"
                  :class="
                    vma2 === 'yes'
                      ? 'val-ok'
                      : vma2 === 'no'
                        ? 'val-fail'
                        : 'val-nd'
                  "
                  >{{
                    vma2 === null ? "—" : vma2 === "yes" ? "是" : "否"
                  }}</span
                >
              </div>
              <div class="yn-row">
                <button
                  class="btn-yn btn-yn-ok"
                  :class="{ 'yn-ok-active': vma2 === 'yes' }"
                  @click="vma2 = 'yes'"
                >
                  是（5min–72h）
                </button>
                <button
                  class="btn-yn btn-yn-fail"
                  :class="{ 'yn-fail-active': vma2 === 'no' }"
                  @click="vma2 = 'no'"
                >
                  否
                </button>
              </div>
            </div>
            <div
              class="crit-item"
              :class="
                vma3 === 'yes' ? 'item-ok' : vma3 === 'no' ? 'item-fail' : ''
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
                    vma3 === 'yes'
                      ? 'val-ok'
                      : vma3 === 'no'
                        ? 'val-fail'
                        : 'val-nd'
                  "
                  >{{
                    vma3 === null ? "—" : vma3 === "yes" ? "是" : "否"
                  }}</span
                >
              </div>
              <div class="yn-row">
                <button
                  class="btn-yn btn-yn-ok"
                  :class="{ 'yn-ok-active': vma3 === 'yes' }"
                  @click="vma3 = 'yes'"
                >
                  是（中重度）
                </button>
                <button
                  class="btn-yn btn-yn-fail"
                  :class="{ 'yn-fail-active': vma3 === 'no' }"
                  @click="vma3 = 'no'"
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
            <span class="group-label-text">標準 B：偏頭痛病史（ICHD-3）</span>
            <span class="group-sub-text"
              >現有或曾有有先兆或無先兆偏頭痛診斷</span
            >
            <span
              class="group-score-tally"
              :class="
                vmb1 !== null ? (vmBMet ? 'tally-ok' : 'tally-abn') : 'tally-nd'
              "
              >{{ vmb1 !== null ? (vmBMet ? "✓" : "✗") : "—" }}</span
            >
          </div>
          <div
            class="crit-item"
            :class="
              vmb1 === 'yes' ? 'item-ok' : vmb1 === 'no' ? 'item-fail' : ''
            "
          >
            <div class="item-header">
              <span class="item-qnum q-vm-b">B</span>
              <div class="item-name-block">
                <span class="item-name"
                  >現有或曾有符合 ICHD-3 標準的有先兆或無先兆偏頭痛診斷？</span
                >
                <span class="item-sub"
                  >Current or previous history of migraine with or without aura
                  (ICHD-3)</span
                >
              </div>
              <span
                class="item-val"
                :class="
                  vmb1 === 'yes'
                    ? 'val-ok'
                    : vmb1 === 'no'
                      ? 'val-fail'
                      : 'val-nd'
                "
                >{{ vmb1 === null ? "—" : vmb1 === "yes" ? "是" : "否" }}</span
              >
            </div>
            <div class="yn-row">
              <button
                class="btn-yn btn-yn-ok"
                :class="{ 'yn-ok-active': vmb1 === 'yes' }"
                @click="vmb1 = 'yes'"
              >
                是（有偏頭痛病史）
              </button>
              <button
                class="btn-yn btn-yn-fail"
                :class="{ 'yn-fail-active': vmb1 === 'no' }"
                @click="vmb1 = 'no'"
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
            <span class="group-sub-text">頭痛特徵、畏光+畏聲、或視覺先兆</span>
            <!-- FIX: use pre-computed computed instead of .value in template -->
            <span class="group-score-tally" :class="vmCTallyClass">{{
              vmCTallyText
            }}</span>
          </div>
          <div class="item-list">
            <div
              class="crit-item"
              :class="
                vmc1 === 'yes' ? 'item-ok' : vmc1 === 'no' ? 'item-fail' : ''
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
                    vmc1 === 'yes'
                      ? 'val-ok'
                      : vmc1 === 'no'
                        ? 'val-fail'
                        : 'val-nd'
                  "
                  >{{
                    vmc1 === null ? "—" : vmc1 === "yes" ? "是" : "否"
                  }}</span
                >
              </div>
              <div class="yn-row">
                <button
                  class="btn-yn btn-yn-ok"
                  :class="{ 'yn-ok-active': vmc1 === 'yes' }"
                  @click="vmc1 = 'yes'"
                >
                  是
                </button>
                <button
                  class="btn-yn btn-yn-fail"
                  :class="{ 'yn-fail-active': vmc1 === 'no' }"
                  @click="vmc1 = 'no'"
                >
                  否
                </button>
              </div>
            </div>
            <div
              class="crit-item"
              :class="
                vmc2 === 'yes' ? 'item-ok' : vmc2 === 'no' ? 'item-fail' : ''
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
                    vmc2 === 'yes'
                      ? 'val-ok'
                      : vmc2 === 'no'
                        ? 'val-fail'
                        : 'val-nd'
                  "
                  >{{
                    vmc2 === null ? "—" : vmc2 === "yes" ? "是" : "否"
                  }}</span
                >
              </div>
              <div class="yn-row">
                <button
                  class="btn-yn btn-yn-ok"
                  :class="{ 'yn-ok-active': vmc2 === 'yes' }"
                  @click="vmc2 = 'yes'"
                >
                  是
                </button>
                <button
                  class="btn-yn btn-yn-fail"
                  :class="{ 'yn-fail-active': vmc2 === 'no' }"
                  @click="vmc2 = 'no'"
                >
                  否
                </button>
              </div>
            </div>
            <div
              class="crit-item"
              :class="
                vmc3 === 'yes' ? 'item-ok' : vmc3 === 'no' ? 'item-fail' : ''
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
                    vmc3 === 'yes'
                      ? 'val-ok'
                      : vmc3 === 'no'
                        ? 'val-fail'
                        : 'val-nd'
                  "
                  >{{
                    vmc3 === null ? "—" : vmc3 === "yes" ? "是" : "否"
                  }}</span
                >
              </div>
              <div class="yn-row">
                <button
                  class="btn-yn btn-yn-ok"
                  :class="{ 'yn-ok-active': vmc3 === 'yes' }"
                  @click="vmc3 = 'yes'"
                >
                  是
                </button>
                <button
                  class="btn-yn btn-yn-fail"
                  :class="{ 'yn-fail-active': vmc3 === 'no' }"
                  @click="vmc3 = 'no'"
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
                vmd1 !== null ? (vmDMet ? 'tally-ok' : 'tally-abn') : 'tally-nd'
              "
              >{{ vmd1 !== null ? (vmDMet ? "✓" : "✗") : "—" }}</span
            >
          </div>
          <div
            class="crit-item"
            :class="
              vmd1 === 'yes' ? 'item-ok' : vmd1 === 'no' ? 'item-fail' : ''
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
                  >Not better accounted for by another vestibular disorder or
                  ICHD-3 diagnosis</span
                >
              </div>
              <span
                class="item-val"
                :class="
                  vmd1 === 'yes'
                    ? 'val-ok'
                    : vmd1 === 'no'
                      ? 'val-fail'
                      : 'val-nd'
                "
                >{{ vmd1 === null ? "—" : vmd1 === "yes" ? "是" : "否" }}</span
              >
            </div>
            <div class="yn-row">
              <button
                class="btn-yn btn-yn-ok"
                :class="{ 'yn-ok-active': vmd1 === 'yes' }"
                @click="vmd1 = 'yes'"
              >
                是（已排除）
              </button>
              <button
                class="btn-yn btn-yn-fail"
                :class="{ 'yn-fail-active': vmd1 === 'no' }"
                @click="vmd1 = 'no'"
              >
                否
              </button>
            </div>
          </div>
        </div>
        <!-- FIX: sub-score row uses pre-computed vmSS* instead of vma1.value === null etc. -->
        <div v-if="vmAns > 0" class="sub-score-row">
          <div class="sub-score-card" :class="vmSSA">
            <span class="ss-label">A·前庭發作</span
            ><span class="ss-val">{{ vmSSAv }}</span>
          </div>
          <div class="sub-score-card" :class="vmSSB">
            <span class="ss-label">B·偏頭痛史</span
            ><span class="ss-val">{{ vmSSBv }}</span>
          </div>
          <div class="sub-score-card" :class="vmSSC">
            <span class="ss-label">C·偏頭痛特徵</span
            ><span class="ss-val">{{ vmSSCv }}</span>
          </div>
          <div class="sub-score-card" :class="vmSSD">
            <span class="ss-label">D·排除其他</span
            ><span class="ss-val">{{ vmSSDv }}</span>
          </div>
        </div>
        <div v-if="showResults && vmAllComplete" class="results-detail">
          <div class="results-header">前庭性偏頭痛 評估明細</div>
          <div
            v-for="row in [
              { q: 'A', label: '前庭發作 ≥5 次 · 5min–72h', met: vmAMet },
              { q: 'B', label: '偏頭痛病史（ICHD-3）', met: vmBMet },
              { q: 'C', label: '≥50% 發作伴偏頭痛特徵', met: vmCMet },
              { q: 'D', label: '排除其他診斷', met: vmDMet },
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
              >{{ vmMetCount }}/4</span
            >
            <span class="detail-desc">{{
              vmResult.dx || vmResult.level.substring(0, 8)
            }}</span>
          </div>
        </div>
        <div class="result-card" :class="vmResult.color">
          <div class="result-left">
            <span class="result-number" style="font-size: 2.5rem">{{
              vmAllComplete ? vmMetCount : "—"
            }}</span>
            <span class="result-max" v-if="vmAllComplete">/4</span>
          </div>
          <div class="result-right">
            <span class="result-ver"
              >Vestibular Migraine · Lempert et al. J Vestib Res 2022</span
            >
            <span class="result-level">{{ vmResult.level }}</span>
            <span class="result-advice">{{ vmResult.advice }}</span>
          </div>
        </div>
      </template>

      <!-- ── DEFINITE MD ─────────────────────────────────────────── -->
      <template v-else-if="vmmdMode === 'definite_md'">
        <div class="nihss-group">
          <div class="group-header-bar md-bar-a">
            <span class="group-icon">🅐</span>
            <span class="group-label-text"
              >標準 A：自發性陣發性眩暈（≥2 次，20min–12h）</span
            >
            <span
              class="group-score-tally"
              :class="
                mda1 !== null && mda2 !== null
                  ? mdAMet
                    ? 'tally-ok'
                    : 'tally-abn'
                  : 'tally-nd'
              "
              >{{
                mda1 !== null && mda2 !== null ? (mdAMet ? "✓" : "✗") : "—"
              }}</span
            >
          </div>
          <div class="item-list">
            <div
              class="crit-item"
              :class="
                mda1 === 'yes' ? 'item-ok' : mda1 === 'no' ? 'item-fail' : ''
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
                    mda1 === 'yes'
                      ? 'val-ok'
                      : mda1 === 'no'
                        ? 'val-fail'
                        : 'val-nd'
                  "
                  >{{
                    mda1 === null ? "—" : mda1 === "yes" ? "是" : "否"
                  }}</span
                >
              </div>
              <div class="yn-row">
                <button
                  class="btn-yn btn-yn-ok"
                  :class="{ 'yn-ok-active': mda1 === 'yes' }"
                  @click="mda1 = 'yes'"
                >
                  是（≥2 次）
                </button>
                <button
                  class="btn-yn btn-yn-fail"
                  :class="{ 'yn-fail-active': mda1 === 'no' }"
                  @click="mda1 = 'no'"
                >
                  否
                </button>
              </div>
            </div>
            <div
              class="crit-item"
              :class="
                mda2 === 'yes' ? 'item-ok' : mda2 === 'no' ? 'item-fail' : ''
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
                    mda2 === 'yes'
                      ? 'val-ok'
                      : mda2 === 'no'
                        ? 'val-fail'
                        : 'val-nd'
                  "
                  >{{
                    mda2 === null ? "—" : mda2 === "yes" ? "是" : "否"
                  }}</span
                >
              </div>
              <div class="yn-row">
                <button
                  class="btn-yn btn-yn-ok"
                  :class="{ 'yn-ok-active': mda2 === 'yes' }"
                  @click="mda2 = 'yes'"
                >
                  是（20min–12h）
                </button>
                <button
                  class="btn-yn btn-yn-fail"
                  :class="{ 'yn-fail-active': mda2 === 'no' }"
                  @click="mda2 = 'no'"
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
            <span class="group-score-tally" :class="mdBTallyClass">{{
              mdBTallyText
            }}</span>
          </div>
          <div class="item-list">
            <div
              class="crit-item"
              :class="
                mdb1 === 'yes' ? 'item-ok' : mdb1 === 'no' ? 'item-fail' : ''
              "
            >
              <div class="item-header">
                <span class="item-qnum q-md-b">B1</span>
                <div class="item-name-block">
                  <span class="item-name"
                    >已有純音聽力圖記錄患耳聽力損失？</span
                  >
                  <span class="item-sub"
                    >Audiometrically documented SNHL in the affected ear</span
                  >
                </div>
                <span
                  class="item-val"
                  :class="
                    mdb1 === 'yes'
                      ? 'val-ok'
                      : mdb1 === 'no'
                        ? 'val-fail'
                        : 'val-nd'
                  "
                  >{{
                    mdb1 === null ? "—" : mdb1 === "yes" ? "是" : "否"
                  }}</span
                >
              </div>
              <div class="yn-row">
                <button
                  class="btn-yn btn-yn-ok"
                  :class="{ 'yn-ok-active': mdb1 === 'yes' }"
                  @click="mdb1 = 'yes'"
                >
                  是（有聽力圖）
                </button>
                <button
                  class="btn-yn btn-yn-fail"
                  :class="{ 'yn-fail-active': mdb1 === 'no' }"
                  @click="mdb1 = 'no'"
                >
                  否（未有聽力圖）
                </button>
              </div>
            </div>
            <div
              class="crit-item"
              :class="
                mdb2 === 'yes' ? 'item-ok' : mdb2 === 'no' ? 'item-fail' : ''
              "
            >
              <div class="item-header">
                <span class="item-qnum q-md-b">B2</span>
                <div class="item-name-block">
                  <span class="item-name"
                    >聽力損失為低至中頻（250–2000 Hz 平均聽閾 ≥30 dB）？</span
                  >
                  <span class="item-sub"
                    >Low-to-medium frequency SNHL (250–2000 Hz PTA ≥30 dB
                    HL)</span
                  >
                </div>
                <span
                  class="item-val"
                  :class="
                    mdb2 === 'yes'
                      ? 'val-ok'
                      : mdb2 === 'no'
                        ? 'val-fail'
                        : 'val-nd'
                  "
                  >{{
                    mdb2 === null ? "—" : mdb2 === "yes" ? "是" : "否"
                  }}</span
                >
              </div>
              <div class="yn-row">
                <button
                  class="btn-yn btn-yn-ok"
                  :class="{ 'yn-ok-active': mdb2 === 'yes' }"
                  @click="mdb2 = 'yes'"
                >
                  是（低頻 SNHL）
                </button>
                <button
                  class="btn-yn btn-yn-fail"
                  :class="{ 'yn-fail-active': mdb2 === 'no' }"
                  @click="mdb2 = 'no'"
                >
                  否
                </button>
              </div>
            </div>
            <div
              class="crit-item"
              :class="
                mdb3 === 'yes' ? 'item-ok' : mdb3 === 'no' ? 'item-fail' : ''
              "
            >
              <div class="item-header">
                <span class="item-qnum q-md-b">B3</span>
                <div class="item-name-block">
                  <span class="item-name">聽力損失為單側，在症狀患耳？</span>
                  <span class="item-sub"
                    >Unilateral, defining the affected ear</span
                  >
                </div>
                <span
                  class="item-val"
                  :class="
                    mdb3 === 'yes'
                      ? 'val-ok'
                      : mdb3 === 'no'
                        ? 'val-fail'
                        : 'val-nd'
                  "
                  >{{
                    mdb3 === null ? "—" : mdb3 === "yes" ? "是" : "否"
                  }}</span
                >
              </div>
              <div class="yn-row">
                <button
                  class="btn-yn btn-yn-ok"
                  :class="{ 'yn-ok-active': mdb3 === 'yes' }"
                  @click="mdb3 = 'yes'"
                >
                  是（單側患耳）
                </button>
                <button
                  class="btn-yn btn-yn-fail"
                  :class="{ 'yn-fail-active': mdb3 === 'no' }"
                  @click="mdb3 = 'no'"
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
            <span class="group-score-tally" :class="mdCTallyClass">{{
              mdCTallyText
            }}</span>
          </div>
          <div class="item-list">
            <div
              class="crit-item"
              :class="
                mdc1 === 'yes' ? 'item-ok' : mdc1 === 'no' ? 'item-fail' : ''
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
                    mdc1 === 'yes'
                      ? 'val-ok'
                      : mdc1 === 'no'
                        ? 'val-fail'
                        : 'val-nd'
                  "
                  >{{
                    mdc1 === null ? "—" : mdc1 === "yes" ? "是" : "否"
                  }}</span
                >
              </div>
              <div class="yn-row">
                <button
                  class="btn-yn btn-yn-ok"
                  :class="{ 'yn-ok-active': mdc1 === 'yes' }"
                  @click="mdc1 = 'yes'"
                >
                  是
                </button>
                <button
                  class="btn-yn btn-yn-fail"
                  :class="{ 'yn-fail-active': mdc1 === 'no' }"
                  @click="mdc1 = 'no'"
                >
                  否
                </button>
              </div>
            </div>
            <div
              class="crit-item"
              :class="
                mdc2 === 'yes' ? 'item-ok' : mdc2 === 'no' ? 'item-fail' : ''
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
                    mdc2 === 'yes'
                      ? 'val-ok'
                      : mdc2 === 'no'
                        ? 'val-fail'
                        : 'val-nd'
                  "
                  >{{
                    mdc2 === null ? "—" : mdc2 === "yes" ? "是" : "否"
                  }}</span
                >
              </div>
              <div class="yn-row">
                <button
                  class="btn-yn btn-yn-ok"
                  :class="{ 'yn-ok-active': mdc2 === 'yes' }"
                  @click="mdc2 = 'yes'"
                >
                  是
                </button>
                <button
                  class="btn-yn btn-yn-fail"
                  :class="{ 'yn-fail-active': mdc2 === 'no' }"
                  @click="mdc2 = 'no'"
                >
                  否
                </button>
              </div>
            </div>
            <div
              class="crit-item"
              :class="
                mdc3 === 'yes' ? 'item-ok' : mdc3 === 'no' ? 'item-fail' : ''
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
                    mdc3 === 'yes'
                      ? 'val-ok'
                      : mdc3 === 'no'
                        ? 'val-fail'
                        : 'val-nd'
                  "
                  >{{
                    mdc3 === null ? "—" : mdc3 === "yes" ? "是" : "否"
                  }}</span
                >
              </div>
              <div class="yn-row">
                <button
                  class="btn-yn btn-yn-ok"
                  :class="{ 'yn-ok-active': mdc3 === 'yes' }"
                  @click="mdc3 = 'yes'"
                >
                  是
                </button>
                <button
                  class="btn-yn btn-yn-fail"
                  :class="{ 'yn-fail-active': mdc3 === 'no' }"
                  @click="mdc3 = 'no'"
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
                mdd1 !== null ? (mdDMet ? 'tally-ok' : 'tally-abn') : 'tally-nd'
              "
              >{{ mdd1 !== null ? (mdDMet ? "✓" : "✗") : "—" }}</span
            >
          </div>
          <div
            class="crit-item"
            :class="
              mdd1 === 'yes' ? 'item-ok' : mdd1 === 'no' ? 'item-fail' : ''
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
                  mdd1 === 'yes'
                    ? 'val-ok'
                    : mdd1 === 'no'
                      ? 'val-fail'
                      : 'val-nd'
                "
                >{{ mdd1 === null ? "—" : mdd1 === "yes" ? "是" : "否" }}</span
              >
            </div>
            <div class="yn-row">
              <button
                class="btn-yn btn-yn-ok"
                :class="{ 'yn-ok-active': mdd1 === 'yes' }"
                @click="mdd1 = 'yes'"
              >
                是（已排除）
              </button>
              <button
                class="btn-yn btn-yn-fail"
                :class="{ 'yn-fail-active': mdd1 === 'no' }"
                @click="mdd1 = 'no'"
              >
                否
              </button>
            </div>
          </div>
        </div>
        <!-- FIX: sub-score row uses pre-computed mdSS* instead of mda1.value === null etc. -->
        <div v-if="mdAllAns > 0" class="sub-score-row">
          <div class="sub-score-card" :class="mdSSA">
            <span class="ss-label">A·陣發眩暈</span
            ><span class="ss-val">{{ mdSSAv }}</span>
          </div>
          <div class="sub-score-card" :class="mdSSB">
            <span class="ss-label">B·低頻SNHL</span
            ><span class="ss-val">{{ mdSSBv }}</span>
          </div>
          <div class="sub-score-card" :class="mdSSC">
            <span class="ss-label">C·耳部症狀</span
            ><span class="ss-val">{{ mdSSCv }}</span>
          </div>
          <div class="sub-score-card" :class="mdSSD">
            <span class="ss-label">D·排除其他</span
            ><span class="ss-val">{{ mdSSDv }}</span>
          </div>
        </div>
        <div v-if="showResults && mdAllComplete" class="results-detail">
          <div class="results-header">確定梅尼爾氏症 評估明細</div>
          <div
            v-for="row in [
              { q: 'A', label: '自發眩暈 ≥2 次 · 20min–12h', met: mdAMet },
              { q: 'B', label: '聽力圖低頻 SNHL（患耳）', met: mdBMet },
              { q: 'C', label: '波動性耳部症狀 ≥1 項', met: mdCMet },
              { q: 'D', label: '排除其他診斷', met: mdDMet },
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
              >{{ mdMetCount }}/4</span
            >
            <span class="detail-desc">{{
              mdResult.dx || mdResult.level.substring(0, 8)
            }}</span>
          </div>
        </div>
        <div class="result-card" :class="mdResult.color">
          <div class="result-left">
            <span class="result-number" style="font-size: 2.5rem">{{
              mdAllComplete ? mdMetCount : "—"
            }}</span>
            <span class="result-max" v-if="mdAllComplete">/4</span>
          </div>
          <div class="result-right">
            <span class="result-ver"
              >Definite Ménière's Disease · Lopez-Escamez et al. J Vestib Res
              2015</span
            >
            <span class="result-level">{{ mdResult.level }}</span>
            <span class="result-advice">{{ mdResult.advice }}</span>
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
                pma1 !== null && pma2 !== null
                  ? pmAMet
                    ? 'tally-ok'
                    : 'tally-abn'
                  : 'tally-nd'
              "
              >{{
                pma1 !== null && pma2 !== null ? (pmAMet ? "✓" : "✗") : "—"
              }}</span
            >
          </div>
          <div class="item-list">
            <div
              class="crit-item"
              :class="
                pma1 === 'yes' ? 'item-ok' : pma1 === 'no' ? 'item-fail' : ''
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
                    pma1 === 'yes'
                      ? 'val-ok'
                      : pma1 === 'no'
                        ? 'val-fail'
                        : 'val-nd'
                  "
                  >{{
                    pma1 === null ? "—" : pma1 === "yes" ? "是" : "否"
                  }}</span
                >
              </div>
              <div class="yn-row">
                <button
                  class="btn-yn btn-yn-ok"
                  :class="{ 'yn-ok-active': pma1 === 'yes' }"
                  @click="pma1 = 'yes'"
                >
                  是（≥2 次）
                </button>
                <button
                  class="btn-yn btn-yn-fail"
                  :class="{ 'yn-fail-active': pma1 === 'no' }"
                  @click="pma1 = 'no'"
                >
                  否
                </button>
              </div>
            </div>
            <div
              class="crit-item"
              :class="
                pma2 === 'yes' ? 'item-ok' : pma2 === 'no' ? 'item-fail' : ''
              "
            >
              <div class="item-header">
                <span class="item-qnum q-md-a">A2</span>
                <div class="item-name-block">
                  <span class="item-name">每次持續 20 分鐘至 24 小時？</span>
                </div>
                <span
                  class="item-val"
                  :class="
                    pma2 === 'yes'
                      ? 'val-ok'
                      : pma2 === 'no'
                        ? 'val-fail'
                        : 'val-nd'
                  "
                  >{{
                    pma2 === null ? "—" : pma2 === "yes" ? "是" : "否"
                  }}</span
                >
              </div>
              <div class="yn-row">
                <button
                  class="btn-yn btn-yn-ok"
                  :class="{ 'yn-ok-active': pma2 === 'yes' }"
                  @click="pma2 = 'yes'"
                >
                  是（20min–24h）
                </button>
                <button
                  class="btn-yn btn-yn-fail"
                  :class="{ 'yn-fail-active': pma2 === 'no' }"
                  @click="pma2 = 'no'"
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
                pmb1 !== null ? (pmBMet ? 'tally-ok' : 'tally-abn') : 'tally-nd'
              "
              >{{ pmb1 !== null ? (pmBMet ? "✓" : "✗") : "—" }}</span
            >
          </div>
          <div
            class="crit-item"
            :class="
              pmb1 === 'yes' ? 'item-ok' : pmb1 === 'no' ? 'item-fail' : ''
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
                  pmb1 === 'yes'
                    ? 'val-ok'
                    : pmb1 === 'no'
                      ? 'val-fail'
                      : 'val-nd'
                "
                >{{ pmb1 === null ? "—" : pmb1 === "yes" ? "是" : "否" }}</span
              >
            </div>
            <div class="yn-row">
              <button
                class="btn-yn btn-yn-ok"
                :class="{ 'yn-ok-active': pmb1 === 'yes' }"
                @click="pmb1 = 'yes'"
              >
                是（符合）
              </button>
              <button
                class="btn-yn btn-yn-fail"
                :class="{ 'yn-fail-active': pmb1 === 'no' }"
                @click="pmb1 = 'no'"
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
                pmc1 !== null ? (pmCMet ? 'tally-ok' : 'tally-abn') : 'tally-nd'
              "
              >{{ pmc1 !== null ? (pmCMet ? "✓" : "✗") : "—" }}</span
            >
          </div>
          <div
            class="crit-item"
            :class="
              pmc1 === 'yes' ? 'item-ok' : pmc1 === 'no' ? 'item-fail' : ''
            "
          >
            <div class="item-header">
              <span class="item-qnum q-md-d">C</span>
              <div class="item-name-block">
                <span class="item-name">症狀無法以其他前庭疾患更好解釋？</span>
              </div>
              <span
                class="item-val"
                :class="
                  pmc1 === 'yes'
                    ? 'val-ok'
                    : pmc1 === 'no'
                      ? 'val-fail'
                      : 'val-nd'
                "
                >{{ pmc1 === null ? "—" : pmc1 === "yes" ? "是" : "否" }}</span
              >
            </div>
            <div class="yn-row">
              <button
                class="btn-yn btn-yn-ok"
                :class="{ 'yn-ok-active': pmc1 === 'yes' }"
                @click="pmc1 = 'yes'"
              >
                是（已排除）
              </button>
              <button
                class="btn-yn btn-yn-fail"
                :class="{ 'yn-fail-active': pmc1 === 'no' }"
                @click="pmc1 = 'no'"
              >
                否
              </button>
            </div>
          </div>
        </div>
        <!-- FIX: sub-score row uses pre-computed pmSS* instead of pma1.value === null etc. -->
        <div v-if="pmAllAns > 0" class="sub-score-row">
          <div class="sub-score-card" :class="pmSSA">
            <span class="ss-label">A·發作性前庭</span
            ><span class="ss-val">{{ pmSSAv }}</span>
          </div>
          <div class="sub-score-card" :class="pmSSB">
            <span class="ss-label">B·波動耳部症</span
            ><span class="ss-val">{{ pmSSBv }}</span>
          </div>
          <div class="sub-score-card" :class="pmSSC">
            <span class="ss-label">C·排除其他</span
            ><span class="ss-val">{{ pmSSCv }}</span>
          </div>
        </div>
        <div v-if="showResults && pmAllComplete" class="results-detail">
          <div class="results-header">可能梅尼爾氏症 評估明細</div>
          <div
            v-for="row in [
              {
                q: 'A',
                label: '發作性前庭症狀 ≥2 次 · 20min–24h',
                met: pmAMet,
              },
              { q: 'B', label: '波動性耳部症狀（同側）', met: pmBMet },
              { q: 'C', label: '排除其他診斷', met: pmCMet },
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
              >{{ pmMetCount }}/3</span
            >
            <span class="detail-desc">{{
              pmResult.dx || pmResult.level.substring(0, 8)
            }}</span>
          </div>
        </div>
        <div class="result-card" :class="pmResult.color">
          <div class="result-left">
            <span class="result-number" style="font-size: 2.5rem">{{
              pmAllComplete ? pmMetCount : "—"
            }}</span>
            <span class="result-max" v-if="pmAllComplete">/3</span>
          </div>
          <div class="result-right">
            <span class="result-ver"
              >Probable Ménière's Disease · Lopez-Escamez et al. J Vestib Res
              2015</span
            >
            <span class="result-level">{{ pmResult.level }}</span>
            <span class="result-advice">{{ pmResult.advice }}</span>
          </div>
        </div>
      </template>
    </template>

    <!-- ══ WARN ══════════════════════════════════════════════════════ -->
    <div class="warn-box">
      <span class="warn-icon">⚠</span>
      <span v-if="isTabHints"
        >HINTS 僅適用於持續性 AVS
        且存在自發性眼振的患者。下跳性眼振須優先排除小腦/腦幹中樞病變。HINTS
        應由受過訓練的臨床人員執行，不能單獨作為排除中風的唯一依據。</span
      >
      <span v-else-if="isTabBppv"
        >前半規管
        BPPV（AC-BPPV）極罕見，下跳性眼振時需排除中樞病變。頸椎不穩者施行
        Dix-Hallpike 前應謹慎評估。急性 BPPV 若未完成 HINTS，應先完成 HINTS
        排除中風。</span
      >
      <span v-else-if="isTabAuvp"
        >AUVP
        為排除性診斷，需先排除中風（HINTS）。純垂直/純扭轉性眼振必須排除小腦梗塞。若有急性聽力損失，診斷為迷路炎（Labyrinthitis）而非單純
        AUVP。</span
      >
      <span v-else-if="isTabVmmd"
        >前庭性偏頭痛與梅尼爾氏症可合併存在。確定 MD 需聽力圖文件支持；Probable
        MD
        為臨床判斷。梅尼爾氏症為排除性診斷，需排除聽神經瘤（MRI）及自體免疫性內耳病。本工具僅供臨床輔助，不取代完整神經耳科評估。</span
      >
      <span v-else
        >此工具整合 HINTS · BPPV · AUVP · VM · MD
        五項眩暈鑑別工具。臨床上急性持續性眩暈應優先排除中樞性病因（HINTS Step
        1），方可進行後續評估。本工具供臨床輔助參考，不取代完整神經學評估。</span
      >
    </div>

    <!-- ══ ACTIONS ════════════════════════════════════════════════════ -->
    <div class="vt-actions">
      <button
        class="btn-view"
        :disabled="!canShowResults"
        @click="showResults = !showResults"
      >
        {{ showResults ? "收起明細" : "查看評估結果" }}
      </button>
      <button class="btn-copy" :disabled="!canCopy" @click="copyOutput">
        {{ copied ? "已複製 ✓" : "複製 Markdown 結果" }}
      </button>
      <button class="btn-reset" @click="reset">重置全部</button>
    </div>
  </div>
</template>

<style scoped>
.vt {
  max-width: 780px;
  margin: 0 auto;
  padding: 2rem 0 3rem;
  font-size: 0.9rem;
}
.vt-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 1rem;
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
  font-size: 0.72rem;
  color: var(--vp-c-text-3);
  margin: 0;
  line-height: 1.6;
}
.subtitle-2 {
  margin: 0.3rem 0 0;
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}
.hint-tag {
  display: inline-block;
  font-size: 0.68rem;
  font-weight: 700;
  padding: 2px 8px;
  border-radius: 999px;
  white-space: nowrap;
}
.hint-stroke {
  background: rgba(239, 68, 68, 0.12);
  color: #dc2626;
}
.hint-auvp {
  background: rgba(6, 182, 212, 0.12);
  color: #0891b2;
}
.hint-vmmd {
  background: rgba(139, 92, 246, 0.12);
  color: #7c3aed;
}
.score-badge {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-width: 88px;
  min-height: 84px;
  flex-shrink: 0;
  padding: 0.55rem 0.75rem;
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
  text-align: center;
  white-space: nowrap;
}
.score-number {
  font-size: 1.9rem;
  font-weight: 800;
  line-height: 1;
  min-width: 2ch;
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
  max-width: 80px;
  word-break: break-all;
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
.score-badge.mild {
  border-color: #f59e0b;
  color: #f59e0b;
  box-shadow:
    0 0 0 1px rgba(245, 158, 11, 0.08),
    0 1px 3px rgba(0, 0, 0, 0.04);
}
.score-badge.moderate {
  border-color: #3b82f6;
  color: #3b82f6;
  box-shadow:
    0 0 0 1px rgba(59, 130, 246, 0.08),
    0 1px 3px rgba(0, 0, 0, 0.04);
}
.score-badge.critical {
  border-color: #ef4444;
  color: #ef4444;
  box-shadow:
    0 0 0 1px rgba(239, 68, 68, 0.08),
    0 1px 3px rgba(0, 0, 0, 0.04);
}
.score-badge.teal {
  border-color: #06b6d4;
  color: #06b6d4;
  box-shadow:
    0 0 0 1px rgba(6, 182, 212, 0.08),
    0 1px 3px rgba(0, 0, 0, 0.04);
}
.score-badge.purple {
  border-color: #8b5cf6;
  color: #8b5cf6;
  box-shadow:
    0 0 0 1px rgba(139, 92, 246, 0.08),
    0 1px 3px rgba(0, 0, 0, 0.04);
}
.score-badge.amber {
  border-color: #f59e0b;
  color: #f59e0b;
  box-shadow:
    0 0 0 1px rgba(245, 158, 11, 0.08),
    0 1px 3px rgba(0, 0, 0, 0.04);
}
.strip {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.45rem;
  margin-bottom: 1.25rem;
}
.strip-card {
  min-width: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  padding: 0.6rem 0.4rem;
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
}
.strip-card:hover {
  border-color: var(--vp-c-brand-1);
  background: rgba(128, 128, 128, 0.15);
}
.sc-active {
  box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.18);
  border-color: #8b5cf6;
}
.sc-nd {
  border-color: var(--vp-c-divider);
}
.sc-ok {
  border-color: #22c55e;
}
.sc-fail {
  border-color: #ef4444;
}
.sc-critical {
  border-color: #ef4444;
}
.sc-bppv {
  border-color: #3b82f6;
}
.sc-teal {
  border-color: #06b6d4;
}
.sc-purple {
  border-color: #8b5cf6;
}
.sc-amber {
  border-color: #f59e0b;
}
.sc-icon {
  font-size: 0.9rem;
}
.sc-label {
  font-size: 0.56rem;
  font-weight: 800;
  color: var(--vp-c-text-3);
  white-space: nowrap;
}
.sc-val {
  font-size: 1.3rem;
  font-weight: 900;
  color: var(--vp-c-text-1);
  line-height: 1;
}
.sc-ok .sc-val {
  color: #22c55e;
}
.sc-fail .sc-val {
  color: #ef4444;
}
.sc-critical .sc-val {
  color: #ef4444;
}
.sc-bppv .sc-val {
  color: #3b82f6;
}
.sc-teal .sc-val {
  color: #06b6d4;
}
.sc-purple .sc-val {
  color: #8b5cf6;
}
.sc-amber .sc-val {
  color: #f59e0b;
}
.sc-sub {
  font-size: 0.54rem;
  color: var(--vp-c-text-3);
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;
}
.tab-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.45rem;
}
.tab-btn {
  display: flex;
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
.tab-btn:hover {
  border-color: var(--vp-c-brand-1);
  background: rgba(128, 128, 128, 0.15);
}
/* .tab-grid .tab-btn:last-child { grid-column: 1 / -1; } */
button.tab-btn.tab-triage {
  border-color: #8b5cf6;
  background: rgba(139, 92, 246, 0.14);
}
button.tab-btn.tab-hints {
  border-color: #ef4444;
  background: rgba(239, 68, 68, 0.14);
}
button.tab-btn.tab-bppv {
  border-color: #3b82f6;
  background: rgba(59, 130, 246, 0.14);
}
button.tab-btn.tab-auvp {
  border-color: #06b6d4;
  background: rgba(6, 182, 212, 0.14);
}
button.tab-btn.tab-vmmd {
  border-color: #8b5cf6;
  background: rgba(139, 92, 246, 0.14);
}
button.tab-btn.tab-triage:hover {
  background: rgba(139, 92, 246, 0.24);
}
button.tab-btn.tab-hints:hover {
  background: rgba(239, 68, 68, 0.24);
}
button.tab-btn.tab-bppv:hover {
  background: rgba(59, 130, 246, 0.24);
}
button.tab-btn.tab-auvp:hover {
  background: rgba(6, 182, 212, 0.24);
}
button.tab-btn.tab-vmmd:hover {
  background: rgba(139, 92, 246, 0.24);
}
.tb-icon {
  font-size: 0.95rem;
  flex-shrink: 0;
}
.tb-body {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-width: 0;
}
.tb-title {
  font-size: 0.78rem;
  font-weight: 700;
  color: var(--vp-c-text-1);
}
.tb-sub {
  font-size: 0.58rem;
  color: var(--vp-c-text-3);
}
.tab-triage .tb-title {
  color: #7c3aed;
}
.tab-hints .tb-title {
  color: #dc2626;
}
.tab-bppv .tb-title {
  color: #2563eb;
}
.tab-auvp .tb-title {
  color: #0891b2;
}
.tab-vmmd .tb-title {
  color: #7c3aed;
}
.tb-badge {
  font-size: 0.66rem;
  font-weight: 800;
  padding: 2px 6px;
  border-radius: 999px;
  flex-shrink: 0;
  white-space: nowrap;
}
.tbb-nd {
  color: var(--vp-c-text-3);
  background: var(--vp-c-bg-mute);
}
.tbb-done {
  color: #8b5cf6;
  background: rgba(139, 92, 246, 0.12);
}
.tbb-central {
  color: #ef4444;
  background: rgba(239, 68, 68, 0.12);
}
.tbb-periph {
  color: #22c55e;
  background: rgba(34, 197, 94, 0.12);
}
.tbb-bppv {
  color: #3b82f6;
  background: rgba(59, 130, 246, 0.12);
}
.tbb-teal {
  color: #06b6d4;
  background: rgba(6, 182, 212, 0.12);
}
.tbb-purple {
  color: #8b5cf6;
  background: rgba(139, 92, 246, 0.12);
}
.tbb-amber {
  color: #f59e0b;
  background: rgba(245, 158, 11, 0.12);
}
.tbb-ok {
  color: #22c55e;
  background: rgba(34, 197, 94, 0.12);
}
.nihss-group {
  margin-bottom: 1.25rem;
}
.group-header-bar {
  display: flex;
  align-items: center;
  gap: 0.55rem;
  padding: 0.5rem 0.8rem;
  border-radius: 10px;
  border: 1px solid var(--vp-c-divider);
  border-left: 4px solid #14b8a6;
  margin-bottom: 0.5rem;
  box-shadow: 0 1px 3px rgba(20, 184, 166, 0.06);
}
.flow-bar {
  border-left: 4px solid #8b5cf6;
  box-shadow: 0 1px 3px rgba(139, 92, 246, 0.06);
}
.triage-bar {
  border-left: 4px solid #8b5cf6;
  box-shadow: 0 1px 3px rgba(139, 92, 246, 0.06);
}
.h-bar {
  border-left: 4px solid #3b82f6;
  box-shadow: 0 1px 3px rgba(59, 130, 246, 0.06);
}
.i-bar {
  border-left: 4px solid #8b5cf6;
  box-shadow: 0 1px 3px rgba(139, 92, 246, 0.06);
}
.n-bar {
  border-left: 4px solid #f97316;
  box-shadow: 0 1px 3px rgba(249, 115, 22, 0.06);
}
.plus-bar {
  border-left: 4px solid #06b6d4;
  box-shadow: 0 1px 3px rgba(6, 182, 212, 0.06);
}
.step-bar-1 {
  border-left: 4px solid #3b82f6;
  background: linear-gradient(
    135deg,
    rgba(59, 130, 246, 0.08),
    var(--vp-c-bg-mute),
    var(--vp-c-bg-soft)
  );
  box-shadow: 0 1px 3px rgba(59, 130, 246, 0.06);
}
.step-bar-2 {
  border-left: 4px solid #8b5cf6;
  background: linear-gradient(
    135deg,
    rgba(139, 92, 246, 0.08),
    var(--vp-c-bg-mute),
    var(--vp-c-bg-soft)
  );
  box-shadow: 0 1px 3px rgba(139, 92, 246, 0.06);
}
.step-bar-3 {
  border-left: 4px solid #f97316;
  background: linear-gradient(
    135deg,
    rgba(249, 115, 22, 0.08),
    var(--vp-c-bg-mute),
    var(--vp-c-bg-soft)
  );
  box-shadow: 0 1px 3px rgba(249, 115, 22, 0.06);
}
.step-bar-4 {
  border-left: 4px solid #06b6d4;
  background: linear-gradient(
    135deg,
    rgba(6, 182, 212, 0.08),
    var(--vp-c-bg-mute),
    var(--vp-c-bg-soft)
  );
  box-shadow: 0 1px 3px rgba(6, 182, 212, 0.06);
}
.auvp-bar-a {
  border-left: 4px solid #3b82f6;
  background: linear-gradient(
    135deg,
    rgba(59, 130, 246, 0.08),
    var(--vp-c-bg-mute),
    var(--vp-c-bg-soft)
  );
  box-shadow: 0 1px 3px rgba(59, 130, 246, 0.06);
}
.auvp-bar-b {
  border-left: 4px solid #06b6d4;
  background: linear-gradient(
    135deg,
    rgba(6, 182, 212, 0.08),
    var(--vp-c-bg-mute),
    var(--vp-c-bg-soft)
  );
  box-shadow: 0 1px 3px rgba(6, 182, 212, 0.06);
}
.auvp-bar-c {
  border-left: 4px solid #8b5cf6;
  background: linear-gradient(
    135deg,
    rgba(139, 92, 246, 0.08),
    var(--vp-c-bg-mute),
    var(--vp-c-bg-soft)
  );
  box-shadow: 0 1px 3px rgba(139, 92, 246, 0.06);
}
.auvp-bar-d {
  border-left: 4px solid #22c55e;
  background: linear-gradient(
    135deg,
    rgba(34, 197, 94, 0.08),
    var(--vp-c-bg-mute),
    var(--vp-c-bg-soft)
  );
  box-shadow: 0 1px 3px rgba(34, 197, 94, 0.06);
}
.auvp-bar-e {
  border-left: 4px solid #a855f7;
  background: linear-gradient(
    135deg,
    rgba(168, 85, 247, 0.08),
    var(--vp-c-bg-mute),
    var(--vp-c-bg-soft)
  );
  box-shadow: 0 1px 3px rgba(168, 85, 247, 0.06);
}
.vmmd-bar {
  border-left: 4px solid #8b5cf6;
  box-shadow: 0 1px 3px rgba(139, 92, 246, 0.06);
}
.vm-bar-a {
  border-left: 4px solid #3b82f6;
  background: linear-gradient(
    135deg,
    rgba(59, 130, 246, 0.08),
    var(--vp-c-bg-mute),
    var(--vp-c-bg-soft)
  );
  box-shadow: 0 1px 3px rgba(59, 130, 246, 0.06);
}
.vm-bar-b {
  border-left: 4px solid #8b5cf6;
  background: linear-gradient(
    135deg,
    rgba(139, 92, 246, 0.08),
    var(--vp-c-bg-mute),
    var(--vp-c-bg-soft)
  );
  box-shadow: 0 1px 3px rgba(139, 92, 246, 0.06);
}
.vm-bar-c {
  border-left: 4px solid #f97316;
  background: linear-gradient(
    135deg,
    rgba(249, 115, 22, 0.08),
    var(--vp-c-bg-mute),
    var(--vp-c-bg-soft)
  );
  box-shadow: 0 1px 3px rgba(249, 115, 22, 0.06);
}
.vm-bar-d {
  border-left: 4px solid #22c55e;
  background: linear-gradient(
    135deg,
    rgba(34, 197, 94, 0.08),
    var(--vp-c-bg-mute),
    var(--vp-c-bg-soft)
  );
  box-shadow: 0 1px 3px rgba(34, 197, 94, 0.06);
}
.md-bar-a {
  border-left: 4px solid #f59e0b;
  background: linear-gradient(
    135deg,
    rgba(245, 158, 11, 0.08),
    var(--vp-c-bg-mute),
    var(--vp-c-bg-soft)
  );
  box-shadow: 0 1px 3px rgba(245, 158, 11, 0.06);
}
.md-bar-b {
  border-left: 4px solid #f97316;
  background: linear-gradient(
    135deg,
    rgba(249, 115, 22, 0.08),
    var(--vp-c-bg-mute),
    var(--vp-c-bg-soft)
  );
  box-shadow: 0 1px 3px rgba(249, 115, 22, 0.06);
}
.md-bar-c {
  border-left: 4px solid #eab308;
  background: linear-gradient(
    135deg,
    rgba(234, 179, 8, 0.08),
    var(--vp-c-bg-mute),
    var(--vp-c-bg-soft)
  );
  box-shadow: 0 1px 3px rgba(234, 179, 8, 0.06);
}
.md-bar-d {
  border-left: 4px solid #22c55e;
  background: linear-gradient(
    135deg,
    rgba(34, 197, 94, 0.08),
    var(--vp-c-bg-mute),
    var(--vp-c-bg-soft)
  );
  box-shadow: 0 1px 3px rgba(34, 197, 94, 0.06);
}
.group-icon {
  font-size: 0.95rem;
  font-weight: 900;
  flex-shrink: 0;
  width: 18px;
  text-align: center;
}
.group-label-text {
  font-size: 0.84rem;
  font-weight: 800;
  color: var(--vp-c-text-1);
}
.group-sub-text {
  font-size: 0.66rem;
  color: var(--vp-c-text-3);
  flex: 1;
}
.group-score-tally {
  font-size: 0.7rem;
  font-weight: 700;
  padding: 2px 7px;
  border-radius: 999px;
  flex-shrink: 0;
  min-width: 50px;
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
.tally-nd {
  color: var(--vp-c-text-3);
  background: var(--vp-c-bg-soft);
  border-color: var(--vp-c-divider);
}
.tally-central {
  color: #ef4444;
  background: rgba(239, 68, 68, 0.12);
  border-color: rgba(239, 68, 68, 0.25);
}
.tally-periph {
  color: #22c55e;
  background: rgba(34, 197, 94, 0.12);
  border-color: rgba(34, 197, 94, 0.25);
}
.triage-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.6rem;
  margin-bottom: 1rem;
}
.triage-card {
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
.triage-card:hover {
  border-color: var(--vp-c-brand-1);
  background: rgba(128, 128, 128, 0.15);
}
button.triage-card.tc-avs {
  border-color: #ef4444;
  background: rgba(239, 68, 68, 0.12);
}
button.triage-card.tc-pos {
  border-color: #3b82f6;
  background: rgba(59, 130, 246, 0.12);
}
button.triage-card.tc-epi {
  border-color: #8b5cf6;
  background: rgba(139, 92, 246, 0.12);
}
button.triage-card.tc-avs:hover {
  background: rgba(239, 68, 68, 0.22);
  border-color: #ef4444;
}
button.triage-card.tc-pos:hover {
  background: rgba(59, 130, 246, 0.22);
  border-color: #3b82f6;
}
button.triage-card.tc-epi:hover {
  background: rgba(139, 92, 246, 0.22);
  border-color: #8b5cf6;
}
.tc-icon {
  font-size: 1.3rem;
}
.tc-title {
  font-size: 0.85rem;
  font-weight: 800;
  color: var(--vp-c-text-1);
}
.tc-avs .tc-title {
  color: #dc2626;
}
.tc-pos .tc-title {
  color: #2563eb;
}
.tc-epi .tc-title {
  color: #7c3aed;
}
.tc-desc {
  font-size: 0.72rem;
  color: var(--vp-c-text-2);
  line-height: 1.5;
}
.tc-tags {
  display: flex;
  gap: 0.3rem;
  flex-wrap: wrap;
}
.tc-tag {
  font-size: 0.6rem;
  font-weight: 700;
  padding: 1px 6px;
  border-radius: 999px;
  background: var(--vp-c-bg-mute);
  color: var(--vp-c-text-2);
}
.tc-tag-red {
  background: rgba(239, 68, 68, 0.12);
  color: #dc2626;
}
.tc-tag-blue {
  background: rgba(59, 130, 246, 0.12);
  color: #2563eb;
}
.tc-tag-purple {
  background: rgba(139, 92, 246, 0.12);
  color: #7c3aed;
}
.tc-tag-amber {
  background: rgba(245, 158, 11, 0.12);
  color: #d97706;
}
.tc-eg {
  font-size: 0.62rem;
  color: var(--vp-c-text-3);
  font-style: italic;
}
.triage-flowbox {
  background: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-divider);
  border-radius: 12px;
  padding: 0.85rem 1rem;
  margin-bottom: 1rem;
  font-size: 0.75rem;
}
.flow-title {
  font-size: 0.8rem;
  font-weight: 800;
  color: var(--vp-c-text-1);
  margin-bottom: 0.6rem;
}
.flow-steps {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}
.fs-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  justify-content: center;
}
.fs-row-mini {
  display: flex;
  gap: 0.4rem;
  flex-wrap: wrap;
  justify-content: center;
}
.fs-box {
  padding: 0.3rem 0.7rem;
  border-radius: 8px;
  font-weight: 700;
  text-align: center;
}
.fs-start {
  background: var(--vp-c-bg-mute);
  color: var(--vp-c-text-1);
  border: 1px solid var(--vp-c-divider);
}
.fs-q {
  background: rgba(139, 92, 246, 0.1);
  color: #7c3aed;
  border: 1px solid rgba(139, 92, 246, 0.25);
}
.fs-step {
  background: rgba(239, 68, 68, 0.08);
  color: #dc2626;
  border: 1px solid rgba(239, 68, 68, 0.25);
}
.fs-mini {
  padding: 0.25rem 0.6rem;
  border-radius: 8px;
  font-weight: 600;
  font-size: 0.68rem;
  text-align: center;
}
.fs-central {
  background: rgba(239, 68, 68, 0.08);
  color: #dc2626;
  border: 1px solid rgba(239, 68, 68, 0.2);
}
.fs-periph {
  background: rgba(6, 182, 212, 0.08);
  color: #0891b2;
  border: 1px solid rgba(6, 182, 212, 0.2);
}
.fs-bppv {
  background: rgba(59, 130, 246, 0.08);
  color: #2563eb;
  border: 1px solid rgba(59, 130, 246, 0.2);
}
.fs-epi {
  background: rgba(139, 92, 246, 0.08);
  color: #7c3aed;
  border: 1px solid rgba(139, 92, 246, 0.2);
}
.fs-branches {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.6rem;
  margin-top: 0.4rem;
}
.fs-branch {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
  padding: 0.5rem 0.4rem;
  border-radius: 8px;
  border: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg-mute);
}
.fs-branch-label {
  font-size: 0.66rem;
  font-weight: 700;
  text-align: center;
}
.fs-yes {
  color: #dc2626;
}
.fs-no {
  color: #2563eb;
}
.fs-arrow {
  font-size: 0.7rem;
  color: var(--vp-c-text-3);
}
.prereq-notice {
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
  padding: 0.6rem 0.9rem;
  border-radius: 8px;
  background: rgba(245, 158, 11, 0.07);
  border: 1px solid rgba(245, 158, 11, 0.3);
  border-left: 3px solid #f59e0b;
  font-size: 0.78rem;
  color: var(--vp-c-text-2);
  line-height: 1.6;
  margin-bottom: 1rem;
}
.pn-icon {
  flex-shrink: 0;
}
.mg-alert {
  display: flex;
  align-items: flex-start;
  gap: 0.55rem;
  padding: 0.7rem 0.9rem;
  border-radius: 10px;
  font-size: 0.8rem;
  color: var(--vp-c-text-2);
  line-height: 1.6;
  margin-bottom: 1rem;
}
.alert-critical {
  background: rgba(239, 68, 68, 0.06);
  border: 1px solid rgba(239, 68, 68, 0.35);
}
.alert-moderate {
  background: rgba(249, 115, 22, 0.06);
  border: 1px solid rgba(249, 115, 22, 0.35);
}
.alert-icon {
  flex-shrink: 0;
}
.next-step-box {
  display: flex;
  align-items: flex-start;
  gap: 0.55rem;
  padding: 0.7rem 0.9rem;
  border-radius: 8px;
  background: rgba(34, 197, 94, 0.06);
  border: 1px solid rgba(34, 197, 94, 0.3);
  border-left: 3px solid #22c55e;
  font-size: 0.78rem;
  color: var(--vp-c-text-2);
  line-height: 1.6;
  margin-bottom: 1rem;
}
.next-step-box p {
  margin: 0.2rem 0 0;
  font-size: 0.75rem;
}
.nsb-icon {
  flex-shrink: 0;
  margin-top: 1px;
}
.item-list {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}
.crit-item,
.hints-item {
  border: 1px solid var(--vp-c-divider);
  border-radius: 10px;
  background: var(--vp-c-bg-soft);
  overflow: hidden;
  transition: border-color 0.2s;
}
.item-ok,
.item-periph {
  border-color: #22c55e;
}
.item-fail,
.item-central {
  border-color: #ef4444;
}
.item-na {
  border-color: #3b82f6;
}
.item-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  padding: 0.55rem 0.8rem;
  background: var(--vp-c-bg-mute);
  border-bottom: 1px solid var(--vp-c-divider);
  gap: 0.65rem;
}
.item-qnum {
  font-size: 0.65rem;
  font-weight: 800;
  padding: 1px 6px 2px;
  border-radius: 999px;
  flex-shrink: 0;
  white-space: nowrap;
}
.q-step1 {
  color: #3b82f6;
  background: rgba(59, 130, 246, 0.12);
}
.q-step2 {
  color: #8b5cf6;
  background: rgba(139, 92, 246, 0.12);
}
.q-h {
  color: #3b82f6;
  background: rgba(59, 130, 246, 0.12);
}
.q-i {
  color: #8b5cf6;
  background: rgba(139, 92, 246, 0.12);
}
.q-n {
  color: #f97316;
  background: rgba(249, 115, 22, 0.12);
}
.q-plus {
  color: #06b6d4;
  background: rgba(6, 182, 212, 0.12);
}
.q-a {
  color: #3b82f6;
  background: rgba(59, 130, 246, 0.12);
}
.q-b {
  color: #06b6d4;
  background: rgba(6, 182, 212, 0.12);
}
.q-c {
  color: #8b5cf6;
  background: rgba(139, 92, 246, 0.12);
}
.q-d {
  color: #22c55e;
  background: rgba(34, 197, 94, 0.12);
}
.q-e {
  color: #a855f7;
  background: rgba(168, 85, 247, 0.12);
}
.q-vm-a {
  color: #3b82f6;
  background: rgba(59, 130, 246, 0.12);
}
.q-vm-b {
  color: #8b5cf6;
  background: rgba(139, 92, 246, 0.12);
}
.q-vm-c {
  color: #f97316;
  background: rgba(249, 115, 22, 0.12);
}
.q-vm-d {
  color: #22c55e;
  background: rgba(34, 197, 94, 0.12);
}
.q-md-a {
  color: #f59e0b;
  background: rgba(245, 158, 11, 0.12);
}
.q-md-b {
  color: #f97316;
  background: rgba(249, 115, 22, 0.12);
}
.q-md-c {
  color: #eab308;
  background: rgba(234, 179, 8, 0.12);
}
.q-md-d {
  color: #22c55e;
  background: rgba(34, 197, 94, 0.12);
}
.item-name-block {
  display: flex;
  flex-direction: column;
  gap: 2px;
  flex: 1;
}
.item-name {
  font-size: 0.84rem;
  font-weight: 600;
  color: var(--vp-c-text-1);
}
.item-sub {
  font-size: 0.64rem;
  color: var(--vp-c-text-3);
  line-height: 1.5;
}
.item-val {
  font-size: 0.78rem;
  font-weight: 800;
  flex-shrink: 0;
  min-width: 48px;
  text-align: right;
}
.val-ok,
.val-periph {
  color: #22c55e;
}
.val-fail,
.val-central {
  color: #ef4444;
}
.val-nd {
  color: var(--vp-c-text-3);
}
.two-choice-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2px;
  padding: 3px;
  background: var(--vp-c-bg-mute);
  border-top: 1px solid var(--vp-c-divider);
}
.choice-btn {
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
.choice-btn:hover {
  border-color: var(--vp-c-divider);
  background: var(--vp-c-bg-soft);
}
button.choice-btn.choice-active-c {
  border-color: #ef4444;
  background: linear-gradient(
    180deg,
    rgba(239, 68, 68, 0.12),
    rgba(239, 68, 68, 0.06)
  );
  box-shadow: 0 0 0 1px rgba(239, 68, 68, 0.08);
}
button.choice-btn.choice-active-p {
  border-color: #22c55e;
  background: linear-gradient(
    180deg,
    rgba(34, 197, 94, 0.12),
    rgba(34, 197, 94, 0.06)
  );
  box-shadow: 0 0 0 1px rgba(34, 197, 94, 0.08);
}
button.choice-btn.choice-active-c:hover {
  background: linear-gradient(
    180deg,
    rgba(239, 68, 68, 0.18),
    rgba(239, 68, 68, 0.1)
  );
}
button.choice-btn.choice-active-p:hover {
  background: linear-gradient(
    180deg,
    rgba(34, 197, 94, 0.18),
    rgba(34, 197, 94, 0.1)
  );
}
.choice-badge {
  display: inline-block;
  font-size: 0.6rem;
  font-weight: 800;
  padding: 1px 5px;
  border-radius: 999px;
  margin-bottom: 2px;
}
.badge-c {
  background: rgba(239, 68, 68, 0.15);
  color: #dc2626;
}
.badge-p {
  background: rgba(34, 197, 94, 0.15);
  color: #16a34a;
}
.choice-title {
  font-size: 0.78rem;
  font-weight: 700;
  color: var(--vp-c-text-1);
}
.choice-sub {
  font-size: 0.63rem;
  color: var(--vp-c-text-3);
  line-height: 1.4;
}
.yn-row {
  display: flex;
  gap: 2px;
  padding: 3px;
  background: var(--vp-c-bg-mute);
  border-top: 1px solid var(--vp-c-divider);
}
.btn-yn {
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
.btn-yn:hover {
  border-color: var(--vp-c-divider);
  background: var(--vp-c-bg-soft);
}
button.btn-yn.yn-ok-active,
button.btn-yn.yn-p-active {
  border-color: #22c55e;
  background: linear-gradient(
    180deg,
    rgba(34, 197, 94, 0.12),
    rgba(34, 197, 94, 0.06)
  );
  box-shadow: 0 0 0 1px rgba(34, 197, 94, 0.08);
  color: #22c55e;
}
button.btn-yn.yn-fail-active,
button.btn-yn.yn-c-active {
  border-color: #ef4444;
  background: linear-gradient(
    180deg,
    rgba(239, 68, 68, 0.12),
    rgba(239, 68, 68, 0.06)
  );
  box-shadow: 0 0 0 1px rgba(239, 68, 68, 0.08);
  color: #ef4444;
}
button.btn-yn.yn-ok-active:hover,
button.btn-yn.yn-p-active:hover {
  background: linear-gradient(
    180deg,
    rgba(34, 197, 94, 0.18),
    rgba(34, 197, 94, 0.1)
  );
}
button.btn-yn.yn-fail-active:hover,
button.btn-yn.yn-c-active:hover {
  background: linear-gradient(
    180deg,
    rgba(239, 68, 68, 0.18),
    rgba(239, 68, 68, 0.1)
  );
}
.nyst-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.4rem;
}
.nyst-btn {
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
.nyst-btn:hover {
  background: rgba(128, 128, 128, 0.15);
}
.nopt-label {
  font-size: 0.78rem;
  font-weight: 700;
  color: var(--vp-c-text-1);
}
.nopt-sub {
  font-size: 0.62rem;
  color: var(--vp-c-text-3);
  line-height: 1.4;
}
button.nyst-btn.nopt-pc.nyst-active {
  border-color: #8b5cf6;
  background: rgba(139, 92, 246, 0.18);
}
button.nyst-btn.nopt-pc.nyst-active .nopt-label {
  color: #8b5cf6;
}
button.nyst-btn.nopt-pc.nyst-active:hover {
  background: rgba(139, 92, 246, 0.28);
}
button.nyst-btn.nopt-ac.nyst-active {
  border-color: #f97316;
  background: rgba(249, 115, 22, 0.18);
}
button.nyst-btn.nopt-ac.nyst-active .nopt-label {
  color: #f97316;
}
button.nyst-btn.nopt-ac.nyst-active:hover {
  background: rgba(249, 115, 22, 0.28);
}
button.nyst-btn.nopt-hc.nyst-active {
  border-color: #06b6d4;
  background: rgba(6, 182, 212, 0.18);
}
button.nyst-btn.nopt-hc.nyst-active .nopt-label {
  color: #06b6d4;
}
button.nyst-btn.nopt-hc.nyst-active:hover {
  background: rgba(6, 182, 212, 0.28);
}
button.nyst-btn.nopt-none.nyst-active {
  border-color: var(--vp-c-text-3);
  background: rgba(128, 128, 128, 0.18);
}
.not-bppv-notice {
  padding: 0.7rem 0.9rem;
  border-radius: 10px;
  background: rgba(239, 68, 68, 0.06);
  border: 1px solid rgba(239, 68, 68, 0.25);
  font-size: 0.8rem;
  color: var(--vp-c-text-2);
  margin-bottom: 1rem;
}
.sub-score-row {
  display: flex;
  gap: 0.4rem;
  margin-bottom: 1rem;
  flex-wrap: wrap;
}
.sub-score-card {
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
.ss-ok {
  border-color: #22c55e;
}
.ss-fail {
  border-color: #ef4444;
}
.ss-central {
  border-color: #ef4444;
}
.ss-periph {
  border-color: #22c55e;
}
.ss-teal {
  border-color: #06b6d4;
}
.ss-purple {
  border-color: #8b5cf6;
}
.ss-amber {
  border-color: #f59e0b;
}
.ss-nd {
  opacity: 0.5;
}
.ss-label {
  font-size: 0.56rem;
  color: var(--vp-c-text-3);
  font-weight: 600;
  text-align: center;
}
.ss-val {
  font-size: 0.85rem;
  font-weight: 800;
  color: var(--vp-c-text-1);
}
.ss-ok .ss-val,
.ss-periph .ss-val {
  color: #22c55e;
}
.ss-fail .ss-val,
.ss-central .ss-val {
  color: #ef4444;
}
.ss-teal .ss-val {
  color: #06b6d4;
}
.ss-purple .ss-val {
  color: #8b5cf6;
}
.ss-amber .ss-val {
  color: #f59e0b;
}
.vmmd-grid {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 0.45rem;
}
.vmmd-btn {
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
.vmmd-btn:hover {
  border-color: var(--vp-c-brand-1);
  background: rgba(128, 128, 128, 0.15);
}
button.vmmd-btn.vmmd-active-vm {
  border-color: #8b5cf6;
  background: rgba(139, 92, 246, 0.14);
}
button.vmmd-btn.vmmd-active-md {
  border-color: #f59e0b;
  background: rgba(245, 158, 11, 0.14);
}
button.vmmd-btn.vmmd-active-pmd {
  border-color: #f97316;
  background: rgba(249, 115, 22, 0.14);
}
button.vmmd-btn.vmmd-active-vm:hover {
  background: rgba(139, 92, 246, 0.24);
}
button.vmmd-btn.vmmd-active-md:hover {
  background: rgba(245, 158, 11, 0.24);
}
button.vmmd-btn.vmmd-active-pmd:hover {
  background: rgba(249, 115, 22, 0.24);
}
.vmmd-icon {
  font-size: 1.1rem;
}
.vmmd-label {
  font-size: 0.82rem;
  font-weight: 700;
  color: var(--vp-c-text-1);
}
.vmmd-active-vm .vmmd-label {
  color: #7c3aed;
}
.vmmd-active-md .vmmd-label {
  color: #d97706;
}
.vmmd-active-pmd .vmmd-label {
  color: #ea580c;
}
.vmmd-sub {
  font-size: 0.62rem;
  color: var(--vp-c-text-3);
}
.vmmd-badge {
  font-size: 0.68rem;
  font-weight: 800;
  padding: 2px 6px;
  border-radius: 999px;
  align-self: flex-start;
  margin-top: 2px;
}
.result-card {
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
.result-card.filling {
  border-color: var(--vp-c-divider);
}
.result-card.normal {
  border-color: #22c55e;
  box-shadow:
    0 0 0 1px rgba(34, 197, 94, 0.06),
    0 1px 3px rgba(0, 0, 0, 0.04);
}
.result-card.mild {
  border-color: #f59e0b;
  box-shadow:
    0 0 0 1px rgba(245, 158, 11, 0.06),
    0 1px 3px rgba(0, 0, 0, 0.04);
}
.result-card.moderate {
  border-color: #3b82f6;
  box-shadow:
    0 0 0 1px rgba(59, 130, 246, 0.06),
    0 1px 3px rgba(0, 0, 0, 0.04);
}
.result-card.critical {
  border-color: #ef4444;
  box-shadow:
    0 0 0 1px rgba(239, 68, 68, 0.06),
    0 1px 3px rgba(0, 0, 0, 0.04);
}
.result-card.teal {
  border-color: #06b6d4;
  box-shadow:
    0 0 0 1px rgba(6, 182, 212, 0.06),
    0 1px 3px rgba(0, 0, 0, 0.04);
}
.result-card.purple {
  border-color: #8b5cf6;
  box-shadow:
    0 0 0 1px rgba(139, 92, 246, 0.06),
    0 1px 3px rgba(0, 0, 0, 0.04);
}
.result-card.amber {
  border-color: #f59e0b;
  box-shadow:
    0 0 0 1px rgba(245, 158, 11, 0.06),
    0 1px 3px rgba(0, 0, 0, 0.04);
}
.result-left {
  display: flex;
  align-items: baseline;
  gap: 3px;
  flex-shrink: 0;
}
.result-number {
  font-size: 3rem;
  font-weight: 800;
  line-height: 1;
  color: var(--vp-c-text-3);
  transition: color 0.3s;
}
.result-card.normal .result-number {
  color: #22c55e;
}
.result-card.mild .result-number {
  color: #f59e0b;
}
.result-card.moderate .result-number {
  color: #3b82f6;
}
.result-card.critical .result-number {
  color: #ef4444;
}
.result-card.teal .result-number {
  color: #06b6d4;
}
.result-card.purple .result-number {
  color: #8b5cf6;
}
.result-card.amber .result-number {
  color: #f59e0b;
}
.result-max {
  font-size: 0.9rem;
  color: var(--vp-c-text-3);
}
.result-right {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.result-ver {
  font-size: 0.66rem;
  font-weight: 700;
  color: var(--vp-c-text-3);
}
.result-level {
  font-size: 0.9rem;
  font-weight: 700;
  color: var(--vp-c-text-1);
}
.result-advice {
  font-size: 0.8rem;
  color: var(--vp-c-text-2);
  line-height: 1.5;
}
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
  align-items: flex-start;
  gap: 0.55rem;
  padding: 0.45rem 0.85rem;
  border-bottom: 1px solid var(--vp-c-divider);
}
.detail-row:last-child {
  border-bottom: none;
}
.detail-total {
  background: linear-gradient(135deg, var(--vp-c-bg-mute), var(--vp-c-bg-soft));
}
.detail-qnum {
  font-size: 0.66rem;
  font-weight: 800;
  flex-shrink: 0;
  width: 28px;
}
.dq-c {
  color: #ef4444;
}
.dq-p {
  color: #22c55e;
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
.ds-central {
  color: #ef4444;
}
.ds-periph {
  color: #22c55e;
}
.detail-score-brand {
  color: var(--vp-c-brand-1);
}
.detail-desc {
  font-size: 0.68rem;
  color: var(--vp-c-text-2);
  flex-shrink: 0;
  width: 110px;
}
.warn-box {
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
.warn-icon {
  color: #f97316;
  flex-shrink: 0;
}
.vt-actions {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}
.btn-view,
.btn-copy,
.btn-reset {
  padding: 7px 16px;
  border-radius: 8px;
  font-size: 0.82rem;
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
@media (max-width: 640px) {
  .vt-header {
    flex-wrap: wrap;
  }
  .score-badge {
    align-self: flex-start;
  }
  .strip {
    grid-template-columns: 1fr 1fr;
  }
  .tab-grid {
    grid-template-columns: 1fr;
  }
  .triage-grid {
    grid-template-columns: 1fr;
  }
  .two-choice-row,
  .nyst-grid {
    grid-template-columns: 1fr;
  }
  .result-card {
    flex-direction: column;
    gap: 0.75rem;
  }
  .vmmd-grid {
    grid-template-columns: 1fr;
  }
  .fs-branches {
    grid-template-columns: 1fr;
  }
}
</style>
