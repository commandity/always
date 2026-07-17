<script setup lang="ts">
import { ref, computed } from "vue";

// ── ASA Physical Status Classes ───────────────────────────────────
const classes = [
  {
    value: 1,
    roman: "I",
    name: "正常健康患者",
    sub: "Normal healthy patient",
    desc: "無器官性、生理性、生化性或精神科疾病的健康患者。",
    examples: ["無系統性疾病", "不吸菸、不飲酒或輕度飲酒", "BMI < 30"],
    mortality: "< 0.1%",
    color: "asa1",
    severity: "normal",
  },
  {
    value: 2,
    roman: "II",
    name: "輕度系統性疾病",
    sub: "Mild systemic disease",
    desc: "有輕度系統性疾病，但無實質功能限制。",
    examples: [
      "控制良好的高血壓或糖尿病",
      "目前吸菸者、社交性飲酒",
      "BMI 30–40、懷孕",
    ],
    mortality: "0.1–0.2%",
    color: "asa2",
    severity: "mild",
  },
  {
    value: 3,
    roman: "III",
    name: "重度系統性疾病",
    sub: "Severe systemic disease",
    desc: "有實質功能限制的嚴重系統性疾病。",
    examples: [
      "控制不良的糖尿病 / 高血壓、COPD",
      "病態性肥胖（BMI ≥ 40）、酒精依賴",
      "> 3 個月的心肌梗塞 / 中風 / TIA / 心臟支架病史",
    ],
    mortality: "1.8–4.0%",
    color: "asa3",
    severity: "moderate",
  },
  {
    value: 4,
    roman: "IV",
    name: "持續危及生命的系統性疾病",
    sub: "Severe disease that is a constant threat to life",
    desc: "有持續危及生命的嚴重系統性疾病。",
    examples: [
      "近 3 個月內心肌梗塞 / 中風 / TIA",
      "持續缺血性心臟病、嚴重瓣膜功能障礙",
      "嚴重心衰（EF < 25%）、敗血症、DIC、末期腎病未透析",
    ],
    mortality: "7.8–23.0%",
    color: "asa4",
    severity: "severe",
  },
  {
    value: 5,
    roman: "V",
    name: "瀕死患者",
    sub: "Moribund patient, not expected to survive without operation",
    desc: "不手術則預期無法存活的瀕死患者，手術為最後手段。",
    examples: [
      "腹主動脈瘤破裂、大量顱內出血伴腦疝",
      "廣泛性腸繫膜缺血、嚴重多重創傷",
      "心因性休克",
    ],
    mortality: "9.4–50.7%",
    color: "asa5",
    severity: "critical",
  },
  {
    value: 6,
    roman: "VI",
    name: "腦死器官捐贈",
    sub: "Brain-dead patient for organ donation",
    desc: "已宣告腦死、準備進行器官捐贈手術的患者。",
    examples: ["腦死確認", "器官捐贈評估中"],
    mortality: "N/A",
    color: "asa6",
    severity: "neutral",
  },
];

// ── State ─────────────────────────────────────────────────────────
const activeTab = ref<"asa">("asa");
const selected = ref<number | null>(null);
const isEmergency = ref<boolean | null>(null);
const showResults = ref(false);
const copied = ref(false);

// ── Computed ──────────────────────────────────────────────────────
const selectedClass = computed(
  () => classes.find((c) => c.value === selected.value) ?? null,
);
const asaLabel = computed(() =>
  selected.value === null
    ? "—"
    : `${selectedClass.value?.roman}${isEmergency.value ? "E" : ""}`,
);
const severity = computed(() => selectedClass.value?.severity ?? "filling");

// ── Functions ─────────────────────────────────────────────────────
function generateMarkdown() {
  const c = selectedClass.value;
  if (!c) return "# ASA 麻醉風險分級評估\n\n尚未選擇等級。";
  const em =
    isEmergency.value === true
      ? "緊急手術（加註 E）"
      : isEmergency.value === false
        ? "擇期手術"
        : "未評估緊急程度";
  return (
    `# ASA 麻醉風險分級評估結果\n\n` +
    `## 評估等級\n\n**ASA ${asaLabel.value} — ${c.name}**（${c.sub}）\n\n${c.desc}\n\n` +
    `## 臨床範例\n\n${c.examples.map((e) => `- ${e}`).join("\n")}\n\n---\n\n` +
    `## 摘要\n\n- **ASA 等級**：ASA ${asaLabel.value}\n` +
    `- **手術性質**：${em}\n` +
    `- **圍術期死亡率參考**：${c.mortality}`
  );
}
async function copyMarkdown() {
  await navigator.clipboard.writeText(generateMarkdown());
  copied.value = true;
  setTimeout(() => (copied.value = false), 2000);
}
function reset() {
  selected.value = null;
  isEmergency.value = null;
  showResults.value = false;
}
</script>

<template>
  <div class="asaassess">
    <!-- Tab bar (single tool) -->
    <div class="tab-bar">
      <button
        class="tab-btn"
        :class="{ active: activeTab === 'asa' }"
        @click="activeTab = 'asa'"
      >
        <span class="tab-label">ASA 麻醉風險分級</span>
        <span class="tab-sub">Physical Status Classification</span>
      </button>
    </div>

    <!-- ════════════ ASA Panel ════════════ -->
    <div v-show="activeTab === 'asa'" class="asa">
      <div class="sb-header">
        <div class="header-title">
          <h2 class="title">ASA 分級</h2>
          <p class="subtitle">
            ASA Physical Status Classification · 美國麻醉醫師學會身體狀態分級
          </p>
        </div>
        <div class="score-badge" :class="severity">
          <span class="score-number">{{ asaLabel }}</span>
          <span class="score-label">{{
            selectedClass ? selectedClass.mortality : "選擇等級"
          }}</span>
        </div>
      </div>

      <div class="severity-bar-wrap">
        <div class="severity-bar">
          <div
            class="severity-fill"
            :class="severity"
            :style="{ width: selected ? (selected / 6) * 100 + '%' : '0%' }"
          />
        </div>
        <div class="severity-ticks">
          <span class="tk-normal">I</span><span class="tk-mild">II</span
          ><span class="tk-moderate">III</span><span class="tk-severe">IV</span
          ><span class="tk-critical">V</span><span>VI</span>
        </div>
      </div>

      <div class="intro-bar">
        <span class="intro-dot">◆</span>
        <span
          >依患者<strong>術前整體健康狀態</strong>選擇單一等級（I–VI）；等級愈高，圍術期併發症與死亡風險愈高。若為<strong>緊急手術</strong>，於等級後加註「E」。此分級為主觀臨床判斷，非精確風險計算。</span
        >
      </div>

      <!-- ── Class selection ────────────────────────────────── -->
      <div class="sb-group">
        <div class="group-header asa-group-header">
          <div class="group-label-block">
            <span class="group-label">選擇 ASA 等級</span>
            <span class="group-sub">Physical Status · 單選 I–VI</span>
          </div>
          <div class="group-score-pill asa-pill">
            {{ selected ? "ASA " + selectedClass?.roman : "—" }}
          </div>
        </div>
        <div class="item-list">
          <div
            v-for="c in classes"
            :key="c.value"
            class="sb-item"
            :class="[c.color, { selected: selected === c.value }]"
            @click="selected = c.value"
          >
            <div class="item-letter" :class="c.color + '-letter'">
              {{ c.roman }}
            </div>
            <div class="item-content">
              <div class="item-question">ASA {{ c.roman }} — {{ c.name }}</div>
              <div class="item-name">{{ c.sub }}</div>
              <div class="item-detail">{{ c.desc }}</div>
              <div class="item-hint">例：{{ c.examples.join("、") }}</div>
            </div>
            <div class="item-toggle">
              <div
                class="toggle-box radio-box"
                :class="[
                  c.color + '-radio',
                  { 'radio-on': selected === c.value },
                ]"
              >
                <span v-if="selected === c.value" class="radio-dot" />
              </div>
              <span class="toggle-score" :class="c.color + '-mort'">{{
                c.mortality
              }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- ── Emergency modifier ─────────────────────────────── -->
      <div class="asa-emergency">
        <span class="em-label">手術性質（E 修飾詞）</span>
        <div class="em-btns">
          <button
            class="em-btn"
            :class="{ 'em-active': isEmergency === false }"
            @click="isEmergency = false"
          >
            擇期手術
          </button>
          <button
            class="em-btn em-e"
            :class="{ 'em-active-e': isEmergency === true }"
            @click="isEmergency = true"
          >
            緊急手術（E）
          </button>
        </div>
      </div>

      <!-- ── Result card ────────────────────────────────────── -->
      <div v-if="selectedClass" class="sb-result" :class="severity">
        <div class="result-left">
          <span class="result-number">{{ asaLabel }}</span>
        </div>
        <div class="result-right">
          <div class="result-top">
            <span class="result-level"
              >ASA {{ selectedClass.roman }} — {{ selectedClass.name }}</span
            >
          </div>
          <span class="result-ahi"
            >圍術期死亡率參考：{{ selectedClass.mortality }}</span
          >
          <span class="result-advice">{{ selectedClass.desc }}</span>
          <div class="result-sub-scores">
            <span class="sub-pill-sm asa-sm">{{ selectedClass.sub }}</span>
            <span v-if="isEmergency === true" class="sub-pill-sm high-sm"
              >⚠ 緊急手術（E）</span
            >
            <span
              v-else-if="isEmergency === false"
              class="sub-pill-sm elective-sm"
              >擇期手術</span
            >
          </div>
        </div>
      </div>
      <div v-else class="empty-note">
        <span class="note-icon">◆</span>
        <span>請選擇一個 ASA 等級以檢視評估結果。</span>
      </div>

      <!-- ── Detail ─────────────────────────────────────────── -->
      <div v-if="showResults && selectedClass" class="results-detail">
        <div class="results-header">評估明細</div>
        <div class="detail-section-title asa-section">臨床範例</div>
        <div
          v-for="(e, i) in selectedClass.examples"
          :key="i"
          class="detail-row"
        >
          <span class="detail-letter asa-letter-sm">◆</span>
          <span class="detail-domain">{{ e }}</span>
        </div>
        <div class="detail-row total-row">
          <span class="detail-letter brand-sm">∑</span>
          <span class="detail-domain">ASA 等級</span>
          <span class="detail-score positive">ASA {{ asaLabel }}</span>
          <span class="detail-desc">{{ selectedClass.mortality }}</span>
        </div>
      </div>

      <div class="sb-actions">
        <button
          class="btn-view"
          :disabled="!selectedClass"
          @click="showResults = !showResults"
        >
          {{ showResults ? "收起明細" : "查看評估結果" }}
        </button>
        <button
          class="btn-copy"
          :disabled="!selectedClass"
          @click="copyMarkdown"
        >
          {{ copied ? "已複製 ✓" : "複製 Markdown 結果" }}
        </button>
        <button class="btn-reset" @click="reset">重置</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* ── Layout & Tab Bar ──────────────────────────────────────────── */
.asaassess {
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

/* ── Panel ─────────────────────────────────────────────────────── */
.asa {
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
  min-width: 92px;
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
.score-badge.normal {
  border-color: #22c55e;
  color: #22c55e;
}
.score-badge.mild {
  border-color: #f59e0b;
  color: #f59e0b;
}
.score-badge.moderate {
  border-color: #f97316;
  color: #f97316;
}
.score-badge.severe {
  border-color: #ef4444;
  color: #ef4444;
}
.score-badge.critical {
  border-color: #dc2626;
  color: #dc2626;
}
.score-badge.neutral {
  border-color: #64748b;
  color: #64748b;
}
.score-badge.filling {
  color: var(--vp-c-text-3);
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
.severity-fill.filling {
  background: var(--vp-c-divider);
}
.severity-fill.normal {
  background: #22c55e;
}
.severity-fill.mild {
  background: #f59e0b;
}
.severity-fill.moderate {
  background: #f97316;
}
.severity-fill.severe {
  background: #ef4444;
}
.severity-fill.critical {
  background: #dc2626;
}
.severity-fill.neutral {
  background: #64748b;
}
.severity-ticks {
  display: flex;
  justify-content: space-between;
  font-size: 0.68rem;
  color: var(--vp-c-text-3);
  padding: 0 2px;
  font-weight: 700;
}
.severity-ticks .tk-normal {
  color: #22c55e;
}
.severity-ticks .tk-mild {
  color: #f59e0b;
}
.severity-ticks .tk-moderate {
  color: #f97316;
}
.severity-ticks .tk-severe {
  color: #ef4444;
}
.severity-ticks .tk-critical {
  color: #dc2626;
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
}
.asa-group-header {
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
}
.asa-pill {
  border: 1px solid color-mix(in srgb, var(--vp-c-brand-1) 30%, transparent);
  color: var(--vp-c-brand-1);
  background: color-mix(in srgb, var(--vp-c-brand-1) 6%, transparent);
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
  letter-spacing: 0.02em;
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
.sb-item .item-name {
  font-size: 0.76rem !important;
  font-weight: 600 !important;
  color: var(--vp-c-text-3) !important;
  font-style: italic;
  margin-bottom: 4px;
}
.sb-item .item-detail {
  font-size: 0.8rem !important;
  color: var(--vp-c-text-2) !important;
  line-height: 1.5;
  margin-bottom: 3px;
}
.sb-item .item-hint {
  font-size: 0.72rem !important;
  color: var(--vp-c-text-3) !important;
  line-height: 1.5;
}
.item-toggle {
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding-top: 2px;
  width: 62px;
}
.radio-box {
  width: 22px;
  height: 22px;
  box-sizing: border-box;
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
  box-sizing: border-box;
  border-radius: 50%;
  background: #fff;
  flex-shrink: 0;
}
.toggle-score {
  font-size: 0.72rem;
  font-weight: 800;
  color: var(--vp-c-text-3);
  text-align: center;
  line-height: 1.2;
}

/* ── Per-class colors (letter chip · selected border/fill · radio · mortality) ── */
.asa1-letter {
  color: #16a34a;
  background: rgba(34, 197, 94, 0.12);
}
.asa2-letter {
  color: #d97706;
  background: rgba(245, 158, 11, 0.12);
}
.asa3-letter {
  color: #ea580c;
  background: rgba(249, 115, 22, 0.12);
}
.asa4-letter {
  color: #dc2626;
  background: rgba(239, 68, 68, 0.12);
}
.asa5-letter {
  color: #b91c1c;
  background: rgba(220, 38, 38, 0.14);
}
.asa6-letter {
  color: #475569;
  background: rgba(100, 116, 139, 0.14);
}

.sb-item.asa1.selected {
  border-color: #22c55e;
  background: color-mix(in srgb, rgb(34, 197, 94) 12%, var(--vp-c-bg));
}
.sb-item.asa2.selected {
  border-color: #f59e0b;
  background: color-mix(in srgb, rgb(245, 158, 11) 12%, var(--vp-c-bg));
}
.sb-item.asa3.selected {
  border-color: #f97316;
  background: color-mix(in srgb, rgb(249, 115, 22) 12%, var(--vp-c-bg));
}
.sb-item.asa4.selected {
  border-color: #ef4444;
  background: color-mix(in srgb, rgb(239, 68, 68) 12%, var(--vp-c-bg));
}
.sb-item.asa5.selected {
  border-color: #dc2626;
  background: color-mix(in srgb, rgb(220, 38, 38) 12%, var(--vp-c-bg));
}
.sb-item.asa6.selected {
  border-color: #64748b;
  background: color-mix(in srgb, rgb(100, 116, 139) 12%, var(--vp-c-bg));
}

.asa1-radio.radio-on {
  background: #22c55e;
  border-color: #22c55e;
}
.asa2-radio.radio-on {
  background: #f59e0b;
  border-color: #f59e0b;
}
.asa3-radio.radio-on {
  background: #f97316;
  border-color: #f97316;
}
.asa4-radio.radio-on {
  background: #ef4444;
  border-color: #ef4444;
}
.asa5-radio.radio-on {
  background: #dc2626;
  border-color: #dc2626;
}
.asa6-radio.radio-on {
  background: #64748b;
  border-color: #64748b;
}

/* ── Emergency modifier ────────────────────────────────────────── */
.asa-emergency {
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
  background: color-mix(in srgb, rgb(34, 197, 94) 15%, var(--vp-c-bg));
}
.em-btn.em-active-e {
  border-color: #ef4444;
  color: #dc2626;
  background: color-mix(in srgb, rgb(239, 68, 68) 15%, var(--vp-c-bg));
}

/* ── Result card ───────────────────────────────────────────────── */
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
.sb-result.normal {
  border-color: #22c55e;
}
.sb-result.mild {
  border-color: #f59e0b;
}
.sb-result.moderate {
  border-color: #f97316;
}
.sb-result.severe {
  border-color: #ef4444;
}
.sb-result.critical {
  border-color: #dc2626;
}
.sb-result.neutral {
  border-color: #64748b;
}
.result-left {
  display: flex;
  align-items: baseline;
  gap: 4px;
  flex-shrink: 0;
  min-width: 70px;
  justify-content: center;
}
.result-number {
  font-size: 3rem;
  font-weight: 800;
  line-height: 1;
  color: var(--vp-c-text-3);
  transition: color 0.3s;
}
.sb-result.normal .result-number {
  color: #22c55e;
}
.sb-result.mild .result-number {
  color: #f59e0b;
}
.sb-result.moderate .result-number {
  color: #f97316;
}
.sb-result.severe .result-number {
  color: #ef4444;
}
.sb-result.critical .result-number {
  color: #dc2626;
}
.sb-result.neutral .result-number {
  color: #64748b;
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
.result-advice {
  font-size: 0.83rem;
  color: var(--vp-c-text-2);
  line-height: 1.5;
}
.result-sub-scores {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
  margin-top: 2px;
}
.sub-pill-sm {
  font-size: 0.72rem;
  font-weight: 700;
  padding: 2px 10px;
  border-radius: 999px;
}
.asa-sm {
  background: color-mix(in srgb, var(--vp-c-brand-1) 10%, transparent);
  color: var(--vp-c-brand-1);
  border: 1px solid color-mix(in srgb, var(--vp-c-brand-1) 30%, transparent);
}
.high-sm {
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
  border: 1px solid rgba(239, 68, 68, 0.3);
}
.elective-sm {
  background: rgba(34, 197, 94, 0.1);
  color: #16a34a;
  border: 1px solid rgba(34, 197, 94, 0.3);
}

.empty-note {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: 1rem 1.25rem;
  border-radius: 12px;
  border: 1px dashed var(--vp-c-divider);
  background: var(--vp-c-bg-soft);
  color: var(--vp-c-text-3);
  font-size: 0.85rem;
  margin-bottom: 1rem;
}
.note-icon {
  color: var(--vp-c-brand-1);
}

/* ── Results detail ────────────────────────────────────────────── */
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
  min-width: 60px;
  text-align: right;
}
.total-row {
  background: var(--vp-c-bg-mute);
  font-weight: 700;
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
.btn-view:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 14px rgba(99, 102, 241, 0.4);
}
.btn-view:active:not(:disabled) {
  transform: translateY(0);
}
.btn-copy {
  border: 1.5px solid var(--vp-c-brand-1);
  background: transparent;
  color: var(--vp-c-brand-1);
}
.btn-copy:hover:not(:disabled) {
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
.btn-view:disabled,
.btn-copy:disabled {
  opacity: 0.5;
  cursor: not-allowed;
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
    font-size: 2.4rem;
  }
  .item-toggle {
    width: 52px;
  }
}
</style>
