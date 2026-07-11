<script setup lang="ts">
import { ref, computed, watch } from "vue";

// ── Drug Data ─────────────────────────────────────────────────────
const drugs = [
  {
    id: "lidocaine",
    name: "Lidocaine",
    nameZh: "利多卡因",
    class: "Amide",
    classZh: "醯胺型",
    onset: "快 (1-3 min)",
    duration: "短-中 (60-120 min)",
    conc: [1, 1.5, 2, 4],
    defaultConc: 2,
    doseEpi: 7,
    doseNoEpi: 4.5,
    toxicDose: "7 mg/kg",
    color: "lido",
    notes: "最常用，中樞神經毒性較低",
  },
  {
    id: "bupivacaine",
    name: "Bupivacaine",
    nameZh: "布比卡因",
    class: "Amide",
    classZh: "醯胺型",
    onset: "慢 (5-10 min)",
    duration: "長 (4-8 hr)",
    conc: [0.25, 0.5, 0.75],
    defaultConc: 0.5,
    doseEpi: 3,
    doseNoEpi: 2,
    toxicDose: "2.5 mg/kg",
    color: "bupi",
    notes: "心臟毒性較高，需謹慎",
  },
  {
    id: "mepivacaine",
    name: "Mepivacaine",
    nameZh: "甲哌卡因",
    class: "Amide",
    classZh: "醯胺型",
    onset: "快 (1-3 min)",
    duration: "中 (60-180 min)",
    conc: [1, 1.5, 2, 3],
    defaultConc: 1.5,
    doseEpi: 7,
    doseNoEpi: 4.5,
    toxicDose: "7 mg/kg",
    color: "mepi",
    notes: "作用與 Lidocaine 相似",
  },
  {
    id: "ropivacaine",
    name: "Ropivacaine",
    nameZh: "羅哌卡因",
    class: "Amide",
    classZh: "醯胺型",
    onset: "中 (3-5 min)",
    duration: "中-長 (4-8 hr)",
    conc: [0.2, 0.5, 0.75, 1],
    defaultConc: 0.5,
    doseEpi: 3,
    doseNoEpi: 3,
    toxicDose: "3 mg/kg",
    color: "ropi",
    notes: "感覺-運動分離較好，心臟毒性較低",
  },
];

// ── State ─────────────────────────────────────────────────────────
const selectedDrug = ref(drugs[0]);
const weight = ref<number>(70);
const withEpi = ref(false);
const selectedConc = ref<number>(drugs[0].defaultConc);
const showResults = ref(false);
const copied = ref(false);

watch(selectedDrug, (d) => {
  selectedConc.value = d.defaultConc;
  showResults.value = false;
});

// ── Computed ──────────────────────────────────────────────────────
const maxDoseMg = computed(() => {
  const d = withEpi.value
    ? selectedDrug.value.doseEpi
    : selectedDrug.value.doseNoEpi;
  return Math.round(weight.value * d);
});

const maxVolumeMl = computed(() => {
  const mgPerMl = selectedConc.value * 10;
  return Math.round((maxDoseMg.value / mgPerMl) * 100) / 100;
});

const dosePerKg = computed(() =>
  withEpi.value ? selectedDrug.value.doseEpi : selectedDrug.value.doseNoEpi,
);

const weightValColor = computed(() => {
  if (weight.value < 50) return "wt-light";
  if (weight.value < 90) return "wt-normal";
  return "wt-heavy";
});

const riskLevel = computed(() => {
  if (maxVolumeMl.value < 15) return "low";
  if (maxVolumeMl.value < 35) return "moderate";
  return "high";
});

// ── Functions ─────────────────────────────────────────────────────
function selectDrug(drug: (typeof drugs)[0]) {
  selectedDrug.value = drug;
}

function generateMarkdown() {
  const d = selectedDrug.value;
  const epi = withEpi.value ? "含 Epinephrine" : "不含 Epinephrine";
  return (
    `# Local Anesthetics Total Dose 計算結果\n\n` +
    `## 藥物資訊\n\n` +
    `- **藥物**：${d.nameZh}（${d.name}）\n` +
    `- **分類**：${d.classZh}（${d.class}）\n` +
    `- **起始時間**：${d.onset}\n` +
    `- **持續時間**：${d.duration}\n\n` +
    `## 計算結果\n\n` +
    `- **患者體重**：${weight.value} kg\n` +
    `- **Epinephrine**：${epi}\n` +
    `- **每公斤最大劑量**：${dosePerKg.value} mg/kg\n` +
    `- **最大總劑量**：${maxDoseMg.value} mg\n` +
    `- **使用濃度**：${selectedConc.value}%\n` +
    `- **最大注射體積**：${maxVolumeMl.value} mL\n\n` +
    `## 臨床備註\n\n${d.notes}\n\n---\n\n` +
    `> 免責聲明：本工具僅供臨床輔助與教學參考，實際劑量應由麻醉專科醫師依個案情況判定。`
  );
}

async function copyMarkdown() {
  await navigator.clipboard.writeText(generateMarkdown());
  copied.value = true;
  setTimeout(() => (copied.value = false), 2000);
}

function reset() {
  selectedDrug.value = drugs[0];
  weight.value = 70;
  withEpi.value = false;
}
</script>

<template>
  <div class="la-calc">
    <!-- Tab bar -->
    <div class="tab-bar">
      <button class="tab-btn active">
        <span class="tab-label">Local Anesthetics 劑量計算</span>
        <span class="tab-sub">Total Dose Calculator</span>
      </button>
    </div>

    <div class="panel">
      <!-- ── Header ─────────────────────────────────── -->
      <div class="sb-header">
        <div class="header-title">
          <h2 class="title">麻醉藥物最大劑量計算</h2>
          <p class="subtitle">Local Anesthetic Maximum Dose Calculator</p>
        </div>
        <div class="score-badge" :class="riskLevel">
          <span class="score-number">{{ maxDoseMg }}</span>
          <span class="score-label">mg（最大劑量）</span>
          <span class="score-volume">{{ maxVolumeMl }} mL</span>
        </div>
      </div>

      <div class="severity-bar-wrap">
        <div class="severity-bar">
          <div
            class="severity-fill"
            :class="riskLevel"
            :style="{
              width:
                maxVolumeMl > 0
                  ? Math.min((maxVolumeMl / 60) * 100, 100) + '%'
                  : '0%',
            }"
          />
        </div>
        <div class="severity-ticks">
          <span>0</span><span>10</span><span>20</span><span>30</span
          ><span>40</span><span>50</span><span>60 mL</span>
        </div>
      </div>

      <div class="intro-bar">
        <span class="intro-dot">◆</span>
        <span
          >輸入<strong>患者體重</strong>、選擇<strong>麻醉藥物</strong>及<strong>濃度</strong>，計算不含/含
          Epinephrine 時的最大安全劑量（mg）與注射體積（mL）。Epinephrine
          可延長作用時間並減少全身吸收，提高安全上限。</span
        >
      </div>

      <!-- ── Weight Input ────────────────────────────── -->
      <div class="sb-group">
        <div class="group-header">
          <div class="group-label-block">
            <span class="group-label">患者體重</span>
            <span class="group-sub">Patient Weight · kg</span>
          </div>
          <div class="group-score-pill">{{ weight }} kg</div>
        </div>
        <div class="weight-card">
          <div class="weight-row">
            <span class="weight-val" :class="weightValColor">{{ weight }}</span>
            <span class="weight-unit-lg">kg</span>
          </div>
          <div class="slider-track-wrap">
            <div class="slider-track">
              <div
                class="slider-fill"
                :class="weightValColor"
                :style="{ width: ((weight - 30) / 90) * 100 + '%' }"
              />
            </div>
            <input
              v-model.number="weight"
              type="range"
              min="30"
              max="120"
              step="1"
              class="weight-slider"
            />
            <div class="weight-ticks">
              <span style="left: 0%">30</span><span style="left: 16.7%">45</span
              ><span style="left: 33.3%">60</span
              ><span style="left: 50%">75</span
              ><span style="left: 66.7%">90</span
              ><span style="left: 83.3%">105</span
              ><span style="left: 100%">120</span>
            </div>
          </div>
        </div>
      </div>

      <!-- ── Drug Selection ─────────────────────────── -->
      <div class="sb-group">
        <div class="group-header">
          <div class="group-label-block">
            <span class="group-label">選擇麻醉藥物</span>
            <span class="group-sub">Local Anesthetic · 點選藥物</span>
          </div>
          <div class="group-score-pill">{{ selectedDrug.nameZh }}</div>
        </div>
        <div class="item-list">
          <div
            v-for="d in drugs"
            :key="d.id"
            class="sb-item"
            :class="[d.color, { selected: selectedDrug.id === d.id }]"
            @click="selectDrug(d)"
          >
            <div class="item-letter" :class="d.color + '-letter'">
              {{ d.name.charAt(0) }}
            </div>
            <div class="item-content">
              <div class="item-question">{{ d.nameZh }}（{{ d.name }}）</div>
              <div class="item-name">{{ d.classZh }} · {{ d.class }}</div>
              <div class="item-detail">
                起始：{{ d.onset }} ｜ 持續：{{ d.duration }}
              </div>
              <div class="item-hint">
                無 Epi：{{ d.doseNoEpi }} mg/kg ｜ 有 Epi：{{ d.doseEpi }} mg/kg
              </div>
            </div>
            <div class="item-toggle">
              <div
                class="toggle-box radio-box"
                :class="[
                  d.color + '-radio',
                  { 'radio-on': selectedDrug.id === d.id },
                ]"
              >
                <span v-if="selectedDrug.id === d.id" class="radio-dot" />
              </div>
              <span class="toggle-score">{{ d.doseEpi }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- ── Epinephrine Toggle ──────────────────────── -->
      <div class="la-emergency">
        <span class="em-label">Epinephrine 添加</span>
        <div class="em-btns">
          <button
            class="em-btn"
            :class="{ 'em-active-e': withEpi === false }"
            @click="withEpi = false"
          >
            不含 Epi
          </button>
          <button
            class="em-btn"
            :class="{ 'em-active': withEpi === true }"
            @click="withEpi = true"
          >
            含 Epi (1:200,000)
          </button>
        </div>
      </div>

      <!-- ── Concentration Selection ──────────────────── -->
      <div class="sb-group">
        <div class="group-header">
          <div class="group-label-block">
            <span class="group-label">選擇濃度</span>
            <span class="group-sub">Concentration · %</span>
          </div>
          <div class="group-score-pill">{{ selectedConc }}%</div>
        </div>
        <div class="conc-btns">
          <button
            v-for="c in selectedDrug.conc"
            :key="c"
            class="conc-btn"
            :class="{ active: selectedConc === c }"
            @click="selectedConc = c"
          >
            {{ c }}%
          </button>
        </div>
      </div>

      <!-- ── Result card ──────────────────────────────── -->
      <div class="sb-result" :class="riskLevel">
        <div class="result-left">
          <div class="result-vol">
            <span class="result-number result-ml">{{ maxVolumeMl }}</span>
            <span class="result-unit">mL</span>
          </div>
          <div class="result-divider-v" />
          <div class="result-dose">
            <span class="result-number">{{ maxDoseMg }}</span>
            <span class="result-unit">mg</span>
          </div>
        </div>
        <div class="result-right">
          <div class="result-top">
            <span class="result-level"
              >{{ selectedDrug.nameZh }} {{ selectedDrug.name }}</span
            >
          </div>
          <span class="result-ahi">
            {{ dosePerKg }} mg/kg × {{ weight }} kg = {{ maxDoseMg }} mg
          </span>
          <span class="result-ahi">
            {{ maxDoseMg }} mg ÷ {{ selectedConc }}%（×10）=
            {{ maxVolumeMl }} mL
          </span>
          <div class="result-sub-scores">
            <span class="sub-pill-sm la-sm">
              {{ withEpi ? "含 Epinephrine" : "不含 Epinephrine" }}
            </span>
            <span class="sub-pill-sm conc-sm">{{ selectedConc }}%</span>
            <span class="sub-pill-sm class-sm">{{ selectedDrug.classZh }}</span>
          </div>
        </div>
      </div>

      <!-- ── Detail Table ─────────────────────────────── -->
      <div v-if="showResults" class="results-detail">
        <div class="results-header">計算明細</div>
        <div class="detail-section-title la-section">劑量計算</div>
        <div class="detail-row">
          <span class="detail-letter">◆</span>
          <span class="detail-domain"
            >每公斤最大劑量（{{ withEpi ? "含" : "不含" }} Epi）</span
          >
          <span class="detail-score">{{ dosePerKg }} mg/kg</span>
        </div>
        <div class="detail-row">
          <span class="detail-letter">◆</span>
          <span class="detail-domain">患者體重</span>
          <span class="detail-score">{{ weight }} kg</span>
        </div>
        <div class="detail-row">
          <span class="detail-letter">◆</span>
          <span class="detail-domain">最大總劑量</span>
          <span class="detail-score">{{ maxDoseMg }} mg</span>
        </div>
        <div class="detail-row">
          <span class="detail-letter">◆</span>
          <span class="detail-domain">溶液濃度</span>
          <span class="detail-score">{{ selectedConc }}%</span>
        </div>
        <div class="detail-row total-row">
          <span class="detail-letter brand-sm">∑</span>
          <span class="detail-domain">最大注射體積</span>
          <span class="detail-score positive">{{ maxVolumeMl }} mL</span>
          <span class="detail-desc">{{ selectedDrug.notes }}</span>
        </div>

        <div class="detail-section-title la-section" style="margin-top: 0.5rem">
          各藥物比較（{{ weight }} kg 患者）
        </div>
        <div class="compare-table">
          <div class="compare-header">
            <span>藥物</span>
            <span>無 Epi</span>
            <span>有 Epi</span>
          </div>
          <div
            v-for="d in drugs"
            :key="d.id"
            class="compare-row"
            :class="{ 'compare-active': selectedDrug.id === d.id }"
          >
            <span>{{ d.nameZh }}</span>
            <span
              >{{ Math.round(weight * d.doseNoEpi) }} mg /
              {{
                Math.round(
                  ((weight * d.doseNoEpi) / (d.defaultConc * 10)) * 100,
                ) / 100
              }}
              mL</span
            >
            <span
              >{{ Math.round(weight * d.doseEpi) }} mg /
              {{
                Math.round(
                  ((weight * d.doseEpi) / (d.defaultConc * 10)) * 100,
                ) / 100
              }}
              mL</span
            >
          </div>
        </div>
      </div>

      <!-- ── Actions ──────────────────────────────────── -->
      <div class="sb-actions">
        <button class="btn-view" @click="showResults = !showResults">
          {{ showResults ? "收起明細" : "查看評估結果" }}
        </button>
        <button class="btn-copy" @click="copyMarkdown">
          {{ copied ? "已複製 ✓" : "複製 Markdown 結果" }}
        </button>
        <button class="btn-reset" @click="reset">重置</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* ── Layout ────────────────────────────────────────────────────── */
.la-calc {
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
}
.tab-btn.active .tab-sub {
  color: var(--vp-c-brand-1);
  opacity: 0.85;
}

/* ── Panel ─────────────────────────────────────────────────────── */
.panel {
  max-width: 780px;
  margin: 0 auto;
  padding: 2rem 0 3rem;
  font-size: 0.9rem;
}

/* ── Header ────────────────────────────────────────────────────── */
.sb-header {
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

/* ── Score Badge ───────────────────────────────────────────────── */
.score-badge {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-width: 100px;
  padding: 0.6rem 1rem;
  border-radius: 14px;
  border: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg-soft);
  transition: all 0.3s;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
}
.score-number {
  font-size: 2rem;
  font-weight: 800;
  line-height: 1;
  transition: color 0.3s;
}
.score-label {
  font-size: 0.66rem;
  font-weight: 700;
  margin-top: 3px;
  text-align: center;
  color: var(--vp-c-text-3);
}
.score-volume {
  font-size: 0.82rem;
  font-weight: 800;
  margin-top: 2px;
  opacity: 0.85;
}
.score-badge.low {
  border-color: #22c55e;
  color: #22c55e;
}
.score-badge.moderate {
  border-color: #f59e0b;
  color: #f59e0b;
}
.score-badge.high {
  border-color: #ef4444;
  color: #ef4444;
}

/* ── Severity Bar ──────────────────────────────────────────────── */
.severity-bar-wrap {
  margin-bottom: 1.5rem;
}
.severity-bar {
  height: 8px;
  border-radius: 999px;
  background: var(--vp-c-bg-mute);
  overflow: hidden;
  margin-bottom: 4px;
  box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.04);
}
.severity-fill {
  height: 100%;
  border-radius: 999px;
  transition:
    width 0.5s cubic-bezier(0.22, 1, 0.36, 1),
    background 0.3s;
}
.severity-fill.low {
  background: #22c55e;
}
.severity-fill.moderate {
  background: #f59e0b;
}
.severity-fill.high {
  background: #ef4444;
}
.severity-ticks {
  display: flex;
  justify-content: space-between;
  font-size: 0.68rem;
  color: var(--vp-c-text-3);
  padding: 0 2px;
  font-weight: 700;
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

/* ── Group ─────────────────────────────────────────────────────── */
.sb-group {
  margin-bottom: 1.5rem;
}
.group-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  margin-bottom: 0.5rem;
  padding: 0.65rem 0.85rem 0.65rem 1.5rem;
  border-radius: 10px;
  border: 1px solid var(--vp-c-divider);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.03);
  border-left: 4px solid var(--vp-c-brand-1);
}
.group-label-block {
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.group-label {
  font-size: 0.92rem;
  font-weight: 800;
  color: var(--vp-c-text-1);
}
.group-sub {
  font-size: 0.78rem;
  font-weight: 600;
  color: var(--vp-c-text-2);
}
.group-score-pill {
  font-size: 0.78rem;
  font-weight: 700;
  padding: 4px 14px;
  border-radius: 999px;
  white-space: nowrap;
  flex-shrink: 0;
  border: 1px solid color-mix(in srgb, var(--vp-c-brand-1) 30%, transparent);
  color: var(--vp-c-brand-1);
  background: color-mix(in srgb, var(--vp-c-brand-1) 6%, transparent);
}

/* ── Weight Input (TFI-style slider) ───────────────────────────── */
.weight-card {
  border: 1px solid var(--vp-c-divider);
  border-radius: 10px;
  background: var(--vp-c-bg-soft);
  padding: 0.75rem 1rem 1.8rem;
}
.weight-row {
  display: flex;
  align-items: baseline;
  justify-content: center;
  gap: 4px;
  margin-bottom: 0.5rem;
}
.weight-val {
  font-size: 2.2rem;
  font-weight: 800;
  line-height: 1;
  transition: color 0.3s;
}
.weight-val.wt-light {
  color: #22c55e;
}
.weight-val.wt-normal {
  color: #6366f1;
}
.weight-val.wt-heavy {
  color: #ef4444;
}
.weight-unit-lg {
  font-size: 0.85rem;
  font-weight: 700;
  color: var(--vp-c-text-3);
}
.slider-track-wrap {
  position: relative;
  height: 32px;
  display: flex;
  align-items: center;
}
.slider-track {
  position: absolute;
  top: 50%;
  left: 11px;
  right: 11px;
  height: 8px;
  border-radius: 999px;
  background: var(--vp-c-bg-mute);
  transform: translateY(-50%);
  overflow: hidden;
  box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.08);
  pointer-events: none;
}
.slider-fill {
  height: 100%;
  border-radius: 999px;
  transition:
    width 0.15s ease,
    background 0.3s;
}
.slider-fill.wt-light {
  background: linear-gradient(90deg, #22c55e, #84cc16);
}
.slider-fill.wt-normal {
  background: linear-gradient(90deg, #6366f1, #818cf8);
}
.slider-fill.wt-heavy {
  background: linear-gradient(90deg, #f97316, #ef4444);
}
.weight-slider {
  position: relative;
  width: 100%;
  -webkit-appearance: none;
  appearance: none;
  height: 32px;
  background: transparent;
  cursor: pointer;
  z-index: 1;
}
.weight-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: var(--vp-c-bg);
  border: 2.5px solid var(--vp-c-brand-1);
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.15);
  transition:
    transform 0.15s,
    box-shadow 0.15s;
}
.weight-slider::-webkit-slider-thumb:hover {
  transform: scale(1.15);
  box-shadow: 0 2px 8px rgba(99, 102, 241, 0.35);
}
.weight-slider::-moz-range-thumb {
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: var(--vp-c-bg);
  border: 2.5px solid var(--vp-c-brand-1);
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.15);
}
.weight-ticks {
  position: absolute;
  left: 11px;
  right: 11px;
  top: 100%;
  height: 1.2em;
  font-size: 0.68rem;
  font-weight: 700;
  color: var(--vp-c-text-3);
}
.weight-ticks span {
  position: absolute;
  transform: translateX(-50%);
}
.weight-ticks span:first-child {
  transform: none;
}
.weight-ticks span:last-child {
  transform: translateX(-100%);
}

/* ── Item List ─────────────────────────────────────────────────── */
.item-list {
  display: flex;
  flex-direction: column;
  gap: 0.45rem;
}
.sb-item {
  display: flex;
  align-items: flex-start;
  gap: 0.85rem;
  padding: 0.85rem 1rem;
  border: 1px solid var(--vp-c-divider);
  border-radius: 12px;
  background: var(--vp-c-bg-soft);
  cursor: pointer;
  transition:
    border-color 0.2s,
    background 0.2s;
  user-select: none;
}
.sb-item:hover {
  background: var(--vp-c-bg-mute);
}
.item-letter {
  flex-shrink: 0;
  width: 40px;
  height: 40px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1rem;
  font-weight: 900;
  margin-top: 2px;
}
.item-content {
  flex: 1;
  min-width: 0;
}
.item-question {
  font-size: 0.9rem;
  font-weight: 700;
  color: var(--vp-c-text-1);
  margin-bottom: 3px;
  line-height: 1.4;
}
.item-name {
  font-size: 0.76rem;
  font-weight: 600;
  color: var(--vp-c-text-3);
  font-style: italic;
  margin-bottom: 4px;
}
.item-detail {
  font-size: 0.8rem;
  color: var(--vp-c-text-2);
  line-height: 1.5;
  margin-bottom: 3px;
}
.item-hint {
  font-size: 0.72rem;
  color: var(--vp-c-text-3);
  line-height: 1.5;
}
.item-toggle {
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding-top: 2px;
  width: 52px;
}
.radio-box {
  width: 22px;
  height: 22px;
  border-radius: 50%;
  border: 2px solid var(--vp-c-divider);
  background: var(--vp-c-bg);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.15s;
}
.radio-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: #fff;
}
.toggle-score {
  font-size: 0.72rem;
  font-weight: 800;
  color: var(--vp-c-text-3);
  text-align: center;
  line-height: 1.2;
}

/* ── Drug Colors ───────────────────────────────────────────────── */
.lido-letter {
  color: #2563eb;
  background: rgba(37, 99, 235, 0.12);
}
.bupi-letter {
  color: #7c3aed;
  background: rgba(124, 58, 237, 0.12);
}
.ropi-letter {
  color: #0891b2;
  background: rgba(8, 145, 178, 0.12);
}
.mepi-letter {
  color: #059669;
  background: rgba(5, 150, 105, 0.12);
}

.sb-item.lido.selected {
  border-color: #2563eb;
  background: color-mix(in srgb, rgb(37, 99, 235) 12%, var(--vp-c-bg));
}
.sb-item.bupi.selected {
  border-color: #7c3aed;
  background: color-mix(in srgb, rgb(124, 58, 237) 12%, var(--vp-c-bg));
}
.sb-item.ropi.selected {
  border-color: #0891b2;
  background: color-mix(in srgb, rgb(8, 145, 178) 12%, var(--vp-c-bg));
}
.sb-item.mepi.selected {
  border-color: #059669;
  background: color-mix(in srgb, rgb(5, 150, 105) 12%, var(--vp-c-bg));
}

.lido-radio.radio-on {
  background: #2563eb;
  border-color: #2563eb;
}
.bupi-radio.radio-on {
  background: #7c3aed;
  border-color: #7c3aed;
}
.ropi-radio.radio-on {
  background: #0891b2;
  border-color: #0891b2;
}
.mepi-radio.radio-on {
  background: #059669;
  border-color: #059669;
}

/* ── Epinephrine Toggle ────────────────────────────────────────── */
.la-emergency {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  flex-wrap: wrap;
  padding: 0.75rem 1rem;
  border-radius: 10px;
  border: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg-soft);
  margin-bottom: 1.5rem;
}
.em-label {
  font-size: 0.85rem;
  font-weight: 700;
  color: var(--vp-c-text-1);
}
.em-btns {
  display: flex;
  gap: 0.5rem;
}
.em-btn {
  padding: 0.5rem 1rem;
  border: 1.5px solid var(--vp-c-divider);
  border-radius: 8px;
  background: var(--vp-c-bg);
  color: var(--vp-c-text-2);
  font-size: 0.82rem;
  font-weight: 700;
  cursor: pointer;
  font-family: inherit;
  transition: all 0.2s;
}
.em-btn:hover {
  border-color: var(--vp-c-text-3);
}
.em-btn.em-active {
  border-color: #22c55e;
  color: #16a34a;
  background: color-mix(in srgb, rgb(34, 197, 94) 12%, var(--vp-c-bg));
}
.em-btn.em-active-e {
  border-color: var(--vp-c-brand-1);
  color: var(--vp-c-brand-1);
  background: color-mix(in srgb, var(--vp-c-brand-1) 10%, var(--vp-c-bg));
}

/* ── Concentration Buttons ─────────────────────────────────────── */
.conc-btns {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}
.conc-btn {
  padding: 0.45rem 1rem;
  border: 1.5px solid var(--vp-c-divider);
  border-radius: 8px;
  background: var(--vp-c-bg);
  color: var(--vp-c-text-2);
  font-size: 0.82rem;
  font-weight: 700;
  cursor: pointer;
  font-family: inherit;
  transition: all 0.2s;
}
.conc-btn:hover {
  border-color: var(--vp-c-text-3);
}
.conc-btn.active {
  border-color: var(--vp-c-brand-1);
  color: var(--vp-c-brand-1);
  background: color-mix(in srgb, var(--vp-c-brand-1) 12%, var(--vp-c-bg));
}

/* ── Result Card ───────────────────────────────────────────────── */
.sb-result {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  padding: 1.25rem 1.5rem;
  border-radius: 14px;
  border: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg-soft);
  margin-bottom: 1rem;
  flex-wrap: wrap;
  transition: all 0.3s;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
}
.sb-result.low {
  border-color: #22c55e;
}
.sb-result.moderate {
  border-color: #f59e0b;
}
.sb-result.high {
  border-color: #ef4444;
}
.result-left {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  flex-shrink: 0;
  min-width: 100px;
}
.result-dose,
.result-vol {
  display: flex;
  align-items: baseline;
  gap: 4px;
}
.result-divider-v {
  width: 120px;
  height: 2.5px;
  background: var(--vp-c-divider);
}
.result-number {
  font-size: 2.4rem;
  font-weight: 800;
  line-height: 1;
  color: var(--vp-c-text-3);
  transition: color 0.3s;
}
.result-number.result-ml {
  font-size: 1.8rem;
}
.result-unit {
  font-size: 0.85rem;
  font-weight: 700;
  color: var(--vp-c-text-3);
}
.sb-result.low .result-number {
  color: #22c55e;
}
.sb-result.moderate .result-number {
  color: #f59e0b;
}
.sb-result.high .result-number {
  color: #ef4444;
}
.sb-result.low .result-unit {
  color: #22c55e;
}
.sb-result.moderate .result-unit {
  color: #f59e0b;
}
.sb-result.high .result-unit {
  color: #ef4444;
}
.result-right {
  display: flex;
  flex-direction: column;
  gap: 5px;
  flex: 1;
}
.result-top {
  display: flex;
  align-items: baseline;
  gap: 0.5rem;
}
.result-level {
  font-size: 1.05rem;
  font-weight: 700;
  color: var(--vp-c-text-1);
}
.result-ahi {
  font-size: 0.78rem;
  font-weight: 600;
  color: var(--vp-c-brand-1);
}
.result-sub-scores {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
  margin-top: 2px;
}
.sub-pill-sm {
  font-size: 0.75rem;
  font-weight: 700;
  padding: 2px 10px;
  border-radius: 999px;
}
.la-sm {
  background: color-mix(in srgb, var(--vp-c-brand-1) 10%, transparent);
  color: var(--vp-c-brand-1);
  border: 1px solid color-mix(in srgb, var(--vp-c-brand-1) 30%, transparent);
}
.conc-sm {
  background: rgba(124, 58, 237, 0.1);
  color: #7c3aed;
  border: 1px solid rgba(124, 58, 237, 0.3);
}
.class-sm {
  background: rgba(100, 116, 139, 0.1);
  color: #64748b;
  border: 1px solid rgba(100, 116, 139, 0.3);
}

/* ── Results Detail ────────────────────────────────────────────── */
.results-detail {
  border: 1px solid var(--vp-c-divider);
  border-radius: 12px;
  overflow: hidden;
  margin-bottom: 1rem;
}
.results-header {
  padding: 0.6rem 1rem;
  background: var(--vp-c-bg-mute);
  font-size: 0.82rem;
  font-weight: 800;
  color: var(--vp-c-text-1);
  border-bottom: 1px solid var(--vp-c-divider);
}
.detail-section-title {
  padding: 0.5rem 1rem 0.35rem;
  font-size: 0.75rem;
  font-weight: 800;
  color: var(--vp-c-brand-1);
}
.detail-row {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.45rem 1rem;
  border-top: 1px solid var(--vp-c-divider);
  font-size: 0.82rem;
}
.detail-letter {
  flex-shrink: 0;
  width: 22px;
  text-align: center;
  font-size: 0.74rem;
  font-weight: 800;
  color: var(--vp-c-text-3);
}
.detail-domain {
  flex: 1;
  color: var(--vp-c-text-2);
}
.detail-score {
  font-weight: 800;
  color: var(--vp-c-text-1);
}
.detail-desc {
  font-size: 0.78rem;
  color: var(--vp-c-text-3);
  max-width: 200px;
  text-align: right;
}
.total-row {
  background: var(--vp-c-bg-mute);
  font-weight: 700;
}

/* ── Compare Table ─────────────────────────────────────────────── */
.compare-table {
  font-size: 0.82rem;
}
.compare-header {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  padding: 0.45rem 1rem;
  border-top: 1px solid var(--vp-c-divider);
  font-weight: 800;
  color: var(--vp-c-text-1);
  background: var(--vp-c-bg-mute);
}
.compare-row {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  padding: 0.4rem 1rem;
  border-top: 1px solid var(--vp-c-divider);
  color: var(--vp-c-text-2);
}
.compare-row.compare-active {
  color: var(--vp-c-brand-1);
  font-weight: 700;
  background: color-mix(in srgb, var(--vp-c-brand-1) 6%, transparent);
}

/* ── Actions ───────────────────────────────────────────────────── */
.sb-actions {
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
  .tab-label {
    font-size: 0.9rem;
  }
  .tab-sub {
    font-size: 0.72rem;
  }
  .sb-result {
    gap: 1rem;
    padding: 1rem;
  }
  .result-number {
    font-size: 2rem;
  }
  .result-number.result-ml {
    font-size: 1.4rem;
  }
  .result-left {
    min-width: 85px;
  }
  .item-toggle {
    width: 46px;
  }
  .weight-val {
    font-size: 1.8rem;
  }
  .weight-card {
    padding: 0.65rem 0.75rem;
  }
}
</style>
