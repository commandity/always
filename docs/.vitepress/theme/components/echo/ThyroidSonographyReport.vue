<script setup lang="ts">
import { ref, computed } from "vue";

// ── Report metadata ──────────────────────────────────────────────
// Today's date in Taiwan time zone (Asia/Taipei, UTC+8), YYYY-MM-DD.
function taiwanToday() {
  return new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Taipei" });
}

const patient = ref({ id: "", name: "", dob: "", refPhysician: "" });
const examDate = ref(taiwanToday());

// ── Gland measurements ───────────────────────────────────────────
const rightLobe = ref({ length: "", width: "", thickness: "" });
const leftLobe = ref({ length: "", width: "", thickness: "" });
const isthmus = ref({ thickness: "" });

function calcVolume(lobe: {
  length: string;
  width: string;
  thickness: string;
}) {
  const l = parseFloat(lobe.length);
  const w = parseFloat(lobe.width);
  const h = parseFloat(lobe.thickness);
  if ([l, w, h].some((v) => isNaN(v))) return "";
  return (l * w * h * 0.524).toFixed(2);
}

const glandOverall = ref({
  size: "normal",
  echogenicity: "normal",
  texture: "normal",
  border: "smooth",
  capsule: "intact",
});
const sizeOptions = [
  { v: "normal", l: "Normal" },
  { v: "enlarged", l: "Enlarged" },
  { v: "atrophic", l: "Atrophic" },
  { v: "partial", l: "Partial/near-total" },
];
const echoOptions = [
  { v: "normal", l: "Normal" },
  { v: "hypoechoic", l: "Hypoechoic" },
  { v: "hyperechoic", l: "Hyperechoic" },
  { v: "heterogeneous", l: "Heterogeneous" },
  { v: "mixed", l: "Mixed" },
];
const textureOptions = [
  { v: "normal", l: "Normal" },
  { v: "coarse", l: "Coarse" },
  { v: "micronodular", l: "Micronodular" },
  { v: "fibrotic", l: "Fibrotic bands" },
];

// ── Nodules ──────────────────────────────────────────────────────
interface Nodule {
  id: number;
  lobe: string;
  location: string;
  size: { l: string; w: string; h: string };
  shape: string;
  margin: string;
  echogenicity: string;
  composition: string;
  calcification: string;
  halo: string;
  vascularity: string;
}
let nid = 0;
const nodules = ref<Nodule[]>([]);
function addNodule() {
  nodules.value.push({
    id: nid++,
    lobe: "right",
    location: "upper",
    size: { l: "", w: "", h: "" },
    shape: "oval",
    margin: "smooth",
    echogenicity: "isoechoic",
    composition: "solid",
    calcification: "none",
    halo: "none",
    vascularity: "none",
  });
}

function calcTirads(n: Nodule) {
  const comp: Record<string, number> = {
    solid: 2,
    "mixed-solid": 1,
    "mixed-cystic": 1,
    cystic: 0,
    spongiform: 0,
  };
  const echo: Record<string, number> = {
    marked: 3,
    hypoechoic: 2,
    isoechoic: 1,
    hyperechoic: 1,
    mixed: 1,
  };
  const margin: Record<string, number> = {
    extrathyroidal: 3,
    lobulated: 2,
    irregular: 2,
  };
  const calc: Record<string, number> = {
    micro: 3,
    punctate: 3,
    peripheral: 2,
    macro: 1,
  };
  const score =
    (comp[n.composition] ?? 0) +
    (echo[n.echogenicity] ?? 0) +
    (n.shape === "taller" ? 3 : 0) +
    (margin[n.margin] ?? 0) +
    (calc[n.calcification] ?? 0);
  let level: string;
  if (score <= 1) level = "TR1";
  else if (score === 2) level = "TR2";
  else if (score === 3) level = "TR3";
  else if (score <= 6) level = "TR4";
  else level = "TR5";
  return { score, level };
}
function removeNodule(id: number) {
  nodules.value = nodules.value.filter((n) => n.id !== id);
}

// ── Vascularity ──────────────────────────────────────────────────
const vascularity = ref({
  overall: "normal",
  pattern: "none",
});
const vasOptions = [
  { v: "normal", l: "Normal" },
  { v: "increased", l: "Increased" },
  { v: "decreased", l: "Decreased" },
  { v: "absent", l: "Absent" },
];
const patternOptions = [
  { v: "none", l: "None" },
  { v: "inferno", l: "Thyroid inferno" },
  { v: "peripheral", l: "Peripheral" },
  { v: "central", l: "Central" },
  { v: "mixed", l: "Mixed" },
];

// ── Lymph nodes ──────────────────────────────────────────────────
interface LN {
  id: number;
  level: string;
  side: string;
  size: string;
  shape: string;
  hilum: string;
  cortical: string;
  calcification: string;
  vascularity: string;
}
let lnid = 0;
const lymphNodes = ref<LN[]>([]);
function addLN() {
  lymphNodes.value.push({
    id: lnid++,
    level: "III",
    side: "right",
    size: "",
    shape: "oval",
    hilum: "present",
    cortical: "normal",
    calcification: "none",
    vascularity: "normal",
  });
}
function removeLN(id: number) {
  lymphNodes.value = lymphNodes.value.filter((n) => n.id !== id);
}

// ── Other findings ───────────────────────────────────────────────
const otherFindings = ref("");
const impression = ref("");

// ── Computed ─────────────────────────────────────────────────────
const sectionsComplete = computed(() => {
  const gland = glandOverall.value.size !== "";
  const imp = impression.value.trim().length > 0;
  return { gland, impression: imp };
});

// ── Generate report ──────────────────────────────────────────────
function generateReport() {
  const lines: string[] = [];
  lines.push("# 甲狀腺及頸部超音波檢查報告");
  lines.push(`**Thyroid & Neck Sonography Report**`);
  lines.push("");
  lines.push(`**檢查日期 (Exam Date):** ${examDate.value}`);
  if (patient.value.id) lines.push(`**病歷號 (MRN):** ${patient.value.id}`);
  if (patient.value.name) lines.push(`**姓名 (Name):** ${patient.value.name}`);
  if (patient.value.refPhysician)
    lines.push(
      `**轉介醫師 (Referring Physician):** ${patient.value.refPhysician}`,
    );
  lines.push("");
  lines.push("---");
  lines.push("");

  // Thyroid gland
  lines.push("## 甲狀腺 (Thyroid Gland)");
  lines.push("");
  const sz = sizeOptions.find((o) => o.v === glandOverall.value.size);
  const ec = echoOptions.find((o) => o.v === glandOverall.value.echogenicity);
  const tx = textureOptions.find((o) => o.v === glandOverall.value.texture);
  lines.push(`- **Size:** ${sz?.l ?? glandOverall.value.size}`);
  lines.push(`- **Echogenicity:** ${ec?.l ?? glandOverall.value.echogenicity}`);
  lines.push(`- **Texture:** ${tx?.l ?? glandOverall.value.texture}`);

  // Measurements
  if (rightLobe.value.length || leftLobe.value.length) {
    lines.push("");
    lines.push("### 各葉測量值 (Lobe Measurements)");
    const rl = rightLobe.value;
    const ll = leftLobe.value;
    if (rl.length || rl.width || rl.thickness) {
      const rv = calcVolume(rl);
      lines.push(
        `- **Right lobe:** ${rl.length || "—"} × ${rl.width || "—"} × ${rl.thickness || "—"} cm` +
          (rv ? ` (vol: ${rv} mL)` : ""),
      );
    }
    if (ll.length || ll.width || ll.thickness) {
      const lv = calcVolume(ll);
      lines.push(
        `- **Left lobe:** ${ll.length || "—"} × ${ll.width || "—"} × ${ll.thickness || "—"} cm` +
          (lv ? ` (vol: ${lv} mL)` : ""),
      );
    }
    if (isthmus.value.thickness)
      lines.push(`- **Isthmus:** ${isthmus.value.thickness} cm`);
  }

  // Nodules
  if (nodules.value.length > 0) {
    lines.push("");
    lines.push("### 結節 (Nodules)");
    nodules.value.forEach((n, i) => {
      lines.push(`**Nodule ${i + 1}** (${n.lobe} lobe, ${n.location}):`);
      const dims = [n.size.l, n.size.w, n.size.h].filter(Boolean).join(" × ");
      if (dims) lines.push(`  - Size: ${dims} cm`);
      lines.push(`  - Shape: ${n.shape}, Margin: ${n.margin}`);
      lines.push(
        `  - Composition: ${n.composition}, Echogenicity: ${n.echogenicity}`,
      );
      if (n.calcification !== "none")
        lines.push(`  - Calcification: ${n.calcification}`);
      if (n.halo !== "none") lines.push(`  - Halo: ${n.halo}`);
      const tr = calcTirads(n);
      lines.push(`  - TI-RADS: ${tr.level} (${tr.score} pts)`);
      lines.push("");
    });
  }

  // Vascularity
  const vas = vasOptions.find((o) => o.v === vascularity.value.overall);
  const pat = patternOptions.find((o) => o.v === vascularity.value.pattern);
  lines.push("### 血管分布 (Vascularity)");
  lines.push(`- **Overall:** ${vas?.l ?? vascularity.value.overall}`);
  lines.push(`- **Pattern:** ${pat?.l ?? vascularity.value.pattern}`);
  lines.push("");

  // Lymph nodes
  if (lymphNodes.value.length > 0) {
    lines.push("### 頸部淋巴結 (Cervical Lymph Nodes)");
    lymphNodes.value.forEach((n, i) => {
      lines.push(
        `**LN ${i + 1}:** Level ${n.level} ${n.side} — ${n.size || "—"} cm, shape: ${n.shape}, hilum: ${n.hilum}, cortex: ${n.cortical}` +
          (n.calcification !== "none"
            ? `, calcification: ${n.calcification}`
            : ""),
      );
    });
    lines.push("");
  }

  // Other findings
  if (otherFindings.value.trim()) {
    lines.push("### Other Findings (其他發現)");
    lines.push(otherFindings.value.trim());
    lines.push("");
  }

  // Impression
  lines.push("---");
  lines.push("## Impression (印象)");
  lines.push(impression.value.trim());
  lines.push("");
  lines.push("---");
  lines.push("*Report generated by Thyroid Sonography Template tool*");

  return lines.join("\n");
}

const showResults = ref(false);
const copied = ref(false);

async function copyReport() {
  await navigator.clipboard.writeText(generateReport());
  copied.value = true;
  setTimeout(() => (copied.value = false), 2000);
}

function reset() {
  patient.value = { id: "", name: "", dob: "", refPhysician: "" };
  examDate.value = taiwanToday();
  rightLobe.value = { length: "", width: "", thickness: "" };
  leftLobe.value = { length: "", width: "", thickness: "" };
  isthmus.value = { thickness: "" };
  glandOverall.value = {
    size: "normal",
    echogenicity: "normal",
    texture: "normal",
    border: "smooth",
    capsule: "intact",
  };
  nodules.value = [];
  vascularity.value = { overall: "normal", pattern: "none" };
  lymphNodes.value = [];
  otherFindings.value = "";
  impression.value = "";
  showResults.value = false;
}
</script>

<template>
  <div class="thyro-report">
    <!-- Header -->
    <!-- <div class="tr-header">
      <div class="header-title">
        <h2 class="title">甲狀腺及頸部超音波檢查報告</h2>
        <p class="subtitle">Thyroid &amp; Neck Sonography Report Template</p>
      </div>
    </div> -->

    <!-- Intro -->
    <div class="intro-bar">
      <span class="intro-dot">◉</span>
      <span>填寫各項檢查所見，點擊「產生報告」生成結構化超音波報告。</span>
    </div>

    <!-- ======================== SECTION: Patient ======================== -->
    <div class="tr-section">
      <div class="section-header">
        <span class="section-label">Patient Info（病患資料）</span>
      </div>
      <div class="patient-grid">
        <label class="field">
          <span class="field-label">MRN（病歷號）</span>
          <input v-model="patient.id" placeholder="e.g. 123456" />
        </label>
        <label class="field">
          <span class="field-label">Name（姓名）</span>
          <input v-model="patient.name" placeholder="e.g. WANG, DA-MING" />
        </label>
        <label class="field">
          <span class="field-label">Referring Physician（轉介醫師）</span>
          <input v-model="patient.refPhysician" placeholder="e.g. Dr. Chen" />
        </label>
        <label class="field">
          <span class="field-label">Exam Date（檢查日期）</span>
          <input type="date" v-model="examDate" />
        </label>
      </div>
    </div>

    <!-- ======================== SECTION: Gland ======================== -->
    <div class="tr-section">
      <div class="section-header">
        <span class="section-label">Thyroid Gland（甲狀腺）</span>
      </div>

      <div class="field-row">
        <label class="field">
          <span class="field-label">Size（大小）</span>
          <select v-model="glandOverall.size">
            <option v-for="o in sizeOptions" :key="o.v" :value="o.v">
              {{ o.l }}
            </option>
          </select>
        </label>
        <label class="field">
          <span class="field-label">Echogenicity（回音度）</span>
          <select v-model="glandOverall.echogenicity">
            <option v-for="o in echoOptions" :key="o.v" :value="o.v">
              {{ o.l }}
            </option>
          </select>
        </label>
        <label class="field">
          <span class="field-label">Texture（質地）</span>
          <select v-model="glandOverall.texture">
            <option v-for="o in textureOptions" :key="o.v" :value="o.v">
              {{ o.l }}
            </option>
          </select>
        </label>
      </div>

      <div class="sub-section-label">Lobe Measurements（各葉測量）</div>
      <div class="lobe-grid">
        <div class="lobe-block">
          <span class="lobe-title">Right Lobe（右葉）</span>
          <div class="lobe-dims">
            <label
              >L <input v-model="rightLobe.length" placeholder="cm"
            /></label>
            <label
              >W <input v-model="rightLobe.width" placeholder="cm"
            /></label>
            <label
              >H <input v-model="rightLobe.thickness" placeholder="cm"
            /></label>
            <label
              >Vol
              <input :value="calcVolume(rightLobe)" placeholder="mL" readonly
            /></label>
          </div>
        </div>
        <div class="lobe-block">
          <span class="lobe-title">Left Lobe（左葉）</span>
          <div class="lobe-dims">
            <label
              >L <input v-model="leftLobe.length" placeholder="cm"
            /></label>
            <label>W <input v-model="leftLobe.width" placeholder="cm" /></label>
            <label
              >H <input v-model="leftLobe.thickness" placeholder="cm"
            /></label>
            <label
              >Vol
              <input :value="calcVolume(leftLobe)" placeholder="mL" readonly
            /></label>
          </div>
        </div>
        <div class="lobe-block isthmus-block">
          <span class="lobe-title">Isthmus（峽部）</span>
          <label class="isthmus-field">
            Thickness <input v-model="isthmus.thickness" placeholder="cm" />
          </label>
        </div>
      </div>
    </div>

    <!-- ======================== SECTION: Nodules ======================== -->
    <div class="tr-section">
      <div class="section-header section-header-row">
        <span class="section-label">Nodules（結節）</span>
        <button class="btn-add" @click="addNodule">+ Add Nodule</button>
      </div>

      <div v-for="n in nodules" :key="n.id" class="nodule-card">
        <div class="nodule-header">
          <span class="nodule-title">Nodule {{ nodules.indexOf(n) + 1 }}</span>
          <button class="btn-remove" @click="removeNodule(n.id)">✕</button>
        </div>
        <div class="nodule-grid">
          <label class="field">
            <span class="field-label">Lobe</span>
            <select v-model="n.lobe">
              <option value="right">Right</option>
              <option value="left">Left</option>
              <option value="isthmus">Isthmus</option>
            </select>
          </label>
          <label class="field">
            <span class="field-label">Location</span>
            <select v-model="n.location">
              <option value="upper">Upper</option>
              <option value="mid">Mid</option>
              <option value="lower">Lower</option>
              <option value="isthmus">Isthmus</option>
            </select>
          </label>
          <label class="field">
            <span class="field-label">Size (cm) L</span>
            <input v-model="n.size.l" placeholder="0.0" />
          </label>
          <label class="field">
            <span class="field-label">W</span>
            <input v-model="n.size.w" placeholder="0.0" />
          </label>
          <label class="field">
            <span class="field-label">H</span>
            <input v-model="n.size.h" placeholder="0.0" />
          </label>
          <label class="field">
            <span class="field-label">Shape</span>
            <select v-model="n.shape">
              <option value="oval">Oval/wider-than-tall</option>
              <option value="round">Round</option>
              <option value="taller">Taller-than-wide</option>
              <option value="irregular">Irregular</option>
            </select>
          </label>
          <label class="field">
            <span class="field-label">Margin</span>
            <select v-model="n.margin">
              <option value="smooth">Smooth</option>
              <option value="ill-defined">Ill-defined</option>
              <option value="lobulated">Lobulated</option>
              <option value="irregular">Irregular</option>
              <option value="extrathyroidal">Extrathyroidal extension</option>
            </select>
          </label>
          <label class="field">
            <span class="field-label">Echogenicity</span>
            <select v-model="n.echogenicity">
              <option value="isoechoic">Isoechoic</option>
              <option value="hypoechoic">Hypoechoic</option>
              <option value="hyperechoic">Hyperechoic</option>
              <option value="marked">Marked hypoechoic</option>
              <option value="mixed">Mixed</option>
            </select>
          </label>
          <label class="field">
            <span class="field-label">Composition</span>
            <select v-model="n.composition">
              <option value="solid">Solid</option>
              <option value="cystic">Cystic</option>
              <option value="mixed-solid">Mixed (solid predominant)</option>
              <option value="mixed-cystic">Mixed (cystic predominant)</option>
              <option value="spongiform">Spongiform</option>
            </select>
          </label>
          <label class="field">
            <span class="field-label">Calcification</span>
            <select v-model="n.calcification">
              <option value="none">None</option>
              <option value="micro">Microcalcifications</option>
              <option value="macro">Macrocalcifications</option>
              <option value="peripheral">Peripheral/rim</option>
              <option value="punctate">Punctate</option>
            </select>
          </label>
          <label class="field">
            <span class="field-label">Halo</span>
            <select v-model="n.halo">
              <option value="none">None</option>
              <option value="thin">Thin (<2mm)</option>
              <option value="thick">Thick (≥2mm)</option>
              <option value="irregular">Irregular</option>
            </select>
          </label>
          <label class="field">
            <span class="field-label">Vascularity</span>
            <select v-model="n.vascularity">
              <option value="none">None</option>
              <option value="peripheral">Peripheral only</option>
              <option value="central">Central only</option>
              <option value="mixed">Mixed (peripheral + central)</option>
            </select>
          </label>
          <label class="field">
            <span class="field-label">TI-RADS</span>
            <input
              :value="
                calcTirads(n).level + ' (' + calcTirads(n).score + ' pts)'
              "
              readonly
              class="tirads-output"
            />
          </label>
        </div>
      </div>
    </div>

    <!-- ======================== SECTION: Vascularity ======================== -->
    <div class="tr-section">
      <div class="section-header">
        <span class="section-label">Vascularity（血管分布）</span>
      </div>
      <div class="field-row">
        <label class="field">
          <span class="field-label">Overall</span>
          <select v-model="vascularity.overall">
            <option v-for="o in vasOptions" :key="o.v" :value="o.v">
              {{ o.l }}
            </option>
          </select>
        </label>
        <label class="field">
          <span class="field-label">Pattern</span>
          <select v-model="vascularity.pattern">
            <option v-for="o in patternOptions" :key="o.v" :value="o.v">
              {{ o.l }}
            </option>
          </select>
        </label>
      </div>
    </div>

    <!-- ======================== SECTION: Lymph Nodes ======================== -->
    <div class="tr-section">
      <div class="section-header section-header-row">
        <span class="section-label">Cervical Lymph Nodes（頸部淋巴結）</span>
        <button class="btn-add" @click="addLN">+ Add LN</button>
      </div>

      <div v-for="n in lymphNodes" :key="n.id" class="ln-card">
        <div class="nodule-header">
          <span class="nodule-title">LN {{ lymphNodes.indexOf(n) + 1 }}</span>
          <button class="btn-remove" @click="removeLN(n.id)">✕</button>
        </div>
        <div class="ln-grid">
          <label class="field">
            <span class="field-label">Level</span>
            <select v-model="n.level">
              <option value="I">Level I (Submental/Submandibular)</option>
              <option value="II">Level II (Upper jugular)</option>
              <option value="III">Level III (Mid jugular)</option>
              <option value="IV">Level IV (Lower jugular)</option>
              <option value="V">Level V (Posterior triangle)</option>
              <option value="VI">Level VI (Central/paratracheal)</option>
              <option value="VII">Level VII (Superior mediastinal)</option>
            </select>
          </label>
          <label class="field">
            <span class="field-label">Side</span>
            <select v-model="n.side">
              <option value="right">Right</option>
              <option value="left">Left</option>
              <option value="midline">Midline</option>
            </select>
          </label>
          <label class="field">
            <span class="field-label">Size (cm)</span>
            <input v-model="n.size" placeholder="0.0" />
          </label>
          <label class="field">
            <span class="field-label">Shape</span>
            <select v-model="n.shape">
              <option value="oval">Oval (fusiform)</option>
              <option value="round">Round</option>
              <option value="irregular">Irregular</option>
            </select>
          </label>
          <label class="field">
            <span class="field-label">Hilum</span>
            <select v-model="n.hilum">
              <option value="present">Present (preserved)</option>
              <option value="absent">Absent (effaced)</option>
              <option value="eccentric">Eccentric</option>
            </select>
          </label>
          <label class="field">
            <span class="field-label">Cortical thickening</span>
            <select v-model="n.cortical">
              <option value="normal">Normal</option>
              <option value="diffuse">Diffuse thickening</option>
              <option value="focal">Focal thickening</option>
              <option value="absent">Absent</option>
            </select>
          </label>
          <label class="field">
            <span class="field-label">Calcification</span>
            <select v-model="n.calcification">
              <option value="none">None</option>
              <option value="micro">Microcalcifications</option>
              <option value="macro">Macrocalcifications</option>
              <option value="peripheral">Peripheral</option>
            </select>
          </label>
          <label class="field">
            <span class="field-label">Vascularity</span>
            <select v-model="n.vascularity">
              <option value="normal">Normal (hilar)</option>
              <option value="peripheral">Peripheral/mixed</option>
              <option value="absent">Absent</option>
            </select>
          </label>
        </div>
      </div>
    </div>

    <!-- ======================== SECTION: Other Findings ======================== -->
    <div class="tr-section">
      <div class="section-header">
        <span class="section-label">Other Findings（其他發現）</span>
      </div>
      <textarea
        v-model="otherFindings"
        placeholder="Any additional findings (e.g., trachea deviation, surrounding soft tissue, parathyroid glands, salivary glands)..."
        rows="3"
      ></textarea>
    </div>

    <!-- ======================== SECTION: Impression ======================== -->
    <div class="tr-section">
      <div class="section-header">
        <span class="section-label">Impression（印象／結論）</span>
      </div>
      <textarea
        v-model="impression"
        placeholder="e.g., 1. Diffuse hypoechoic thyroid parenchyma consistent with Hashimoto's thyroiditis. 2. TR3 nodule right mid lobe, 1.2 cm — recommend FNA..."
        rows="4"
      ></textarea>
    </div>

    <!-- ======================== ACTIONS ======================== -->
    <div class="tr-actions">
      <button class="btn-view" @click="showResults = !showResults">
        {{ showResults ? "收起報告" : "產生報告" }}
      </button>
      <button
        class="btn-copy"
        @click="copyReport"
        :disabled="!impression.trim()"
      >
        {{ copied ? "已複製 ✓" : "複製 Markdown 報告" }}
      </button>
      <button class="btn-reset" @click="reset">重置</button>
    </div>

    <!-- ======================== REPORT OUTPUT ======================== -->
    <div v-if="showResults" class="report-output">
      <div class="output-header">報告內容 (Report Output)</div>
      <pre class="output-body">{{ generateReport() }}</pre>
    </div>
  </div>
</template>

<style scoped>
.thyro-report {
  max-width: 880px;
  margin: 0 auto;
  padding: 2rem 0 3rem;
  font-size: 0.9rem;
}

/* ── Header ─────────────────────────────────────────────────── */
.tr-header {
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
  font-size: 0.78rem;
  color: var(--vp-c-text-3);
  margin: 0;
}

/* ── Intro ──────────────────────────────────────────────────── */
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

/* ── Section ────────────────────────────────────────────────── */
.tr-section {
  margin-bottom: 1.25rem;
}
.section-header {
  padding: 0.65rem 0.85rem 0.65rem 1.5rem;
  border-radius: 10px;
  border: 1px solid var(--vp-c-divider);
  border-left: 4px solid var(--vp-c-brand-1);
  margin-bottom: 0.75rem;
}
.section-header-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.section-label {
  font-size: 0.85rem;
  font-weight: 700;
  color: var(--vp-c-text-1);
}
.sub-section-label {
  font-size: 0.78rem;
  font-weight: 700;
  color: var(--vp-c-text-2);
  margin: 0.75rem 0 0.4rem;
}

/* ── Patient grid ───────────────────────────────────────────── */
.patient-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.6rem;
}

/* ── Field ──────────────────────────────────────────────────── */
.field {
  display: flex;
  flex-direction: column;
  gap: 3px;
}
.field-label {
  font-size: 0.85rem;
  font-weight: 700;
  color: var(--vp-c-text-2);
  letter-spacing: 0.02em;
}
.field input,
.field select {
  padding: 7px 10px;
  border-radius: 6px;
  border: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg-soft);
  color: var(--vp-c-text-1);
  font-size: 0.85rem;
  font-family: inherit;
  transition: border-color 0.2s;
}
.field input:focus,
.field select:focus {
  outline: none;
  border-color: var(--vp-c-brand-1);
}
.field select {
  cursor: pointer;
}

.field-row {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.6rem;
}

/* ── Lobe grid ──────────────────────────────────────────────── */
.lobe-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.6rem;
}
.lobe-block {
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  padding: 0.6rem 0.8rem;
  background: var(--vp-c-bg-soft);
}
.lobe-title {
  font-size: 0.8rem;
  font-weight: 700;
  color: var(--vp-c-text-1);
  display: block;
  margin-bottom: 0.4rem;
}
.lobe-dims {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.4rem;
}
.lobe-dims label {
  display: grid;
  grid-template-columns: 28px 1fr;
  align-items: center;
  font-size: 0.72rem;
  font-weight: 700;
  color: var(--vp-c-text-2);
}
.lobe-dims input {
  width: 100%;
  padding: 5px 7px;
  border-radius: 4px;
  border: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg);
  color: var(--vp-c-text-1);
  font-size: 0.82rem;
  font-family: inherit;
}
.lobe-dims input:focus {
  outline: none;
  border-color: var(--vp-c-brand-1);
}
.lobe-dims input[readonly] {
  background: var(--vp-c-bg-mute);
  color: var(--vp-c-text-2);
  cursor: default;
}
.isthmus-block {
  grid-column: 1 / -1;
}
.isthmus-field {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.78rem;
  font-weight: 700;
  color: var(--vp-c-text-2);
}
.isthmus-field input {
  width: 100px;
  padding: 5px 7px;
  border-radius: 4px;
  border: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg);
  color: var(--vp-c-text-1);
  font-size: 0.82rem;
  font-family: inherit;
}

/* ── Nodule card ────────────────────────────────────────────── */
.nodule-card,
.ln-card {
  border: 1px solid var(--vp-c-divider);
  border-radius: 10px;
  margin-bottom: 0.6rem;
  overflow: hidden;
}
.nodule-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.45rem 0.8rem;
  background: var(--vp-c-bg-mute);
  border-bottom: 1px solid var(--vp-c-divider);
}
.nodule-title {
  font-size: 0.78rem;
  font-weight: 700;
  color: var(--vp-c-text-1);
}
.btn-remove {
  border: none;
  background: transparent;
  color: #ef4444;
  font-size: 1.1rem;
  cursor: pointer;
  padding: 2px 6px;
  border-radius: 4px;
  transition: background 0.15s;
}
.btn-remove:hover {
  background: rgba(239, 68, 68, 0.1);
}

input.tirads-output {
  font-weight: 700;
  letter-spacing: 0.04em;
  background: var(--vp-c-bg-mute) !important;
  color: var(--vp-c-brand-1) !important;
  cursor: default;
}
.nodule-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.5rem;
  padding: 0.7rem;
}

/* ── LN grid ────────────────────────────────────────────────── */
.ln-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.5rem;
  padding: 0.7rem;
}

/* ── Textarea ───────────────────────────────────────────────── */
textarea {
  width: 100%;
  padding: 10px 12px;
  border-radius: 8px;
  border: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg-soft);
  color: var(--vp-c-text-1);
  font-size: 0.85rem;
  font-family: inherit;
  resize: vertical;
  transition: border-color 0.2s;
  box-sizing: border-box;
}
textarea:focus {
  outline: none;
  border-color: var(--vp-c-brand-1);
}

/* ── Actions ────────────────────────────────────────────────── */
.tr-actions {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
  margin-bottom: 1.25rem;
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
.btn-copy {
  border: 1.5px solid var(--vp-c-brand-1);
  background: transparent;
  color: var(--vp-c-brand-1);
}
.btn-copy:hover {
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

/* ── Add button ─────────────────────────────────────────────── */
.btn-add {
  padding: 5px 14px;
  border: 1.5px solid var(--vp-c-brand-1);
  border-radius: 6px;
  background: transparent;
  color: var(--vp-c-brand-1);
  font-size: 0.78rem;
  font-weight: 600;
  cursor: pointer;
  font-family: inherit;
  transition: all 0.2s;
}
.btn-add:hover {
  background: var(--vp-c-brand-soft);
}

/* ── Report output ──────────────────────────────────────────── */
.report-output {
  border: 1px solid var(--vp-c-divider);
  border-radius: 10px;
  overflow: hidden;
}
.output-header {
  padding: 0.55rem 0.9rem;
  font-size: 0.72rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--vp-c-text-3);
  background: var(--vp-c-bg-mute);
  border-bottom: 1px solid var(--vp-c-divider);
}
.output-body {
  padding: 1rem;
  font-size: 0.78rem;
  line-height: 1.7;
  white-space: pre-wrap;
  word-break: break-word;
  font-family: "SF Mono", "JetBrains Mono", monospace;
  color: var(--vp-c-text-1);
  background: var(--vp-c-bg-soft);
  margin: 0;
}

@media (max-width: 640px) {
  .patient-grid,
  .field-row,
  .lobe-grid,
  .node-grid,
  .ln-grid {
    grid-template-columns: 1fr;
  }
  .nodule-grid,
  .ln-grid {
    grid-template-columns: 1fr 1fr;
  }
}
</style>
