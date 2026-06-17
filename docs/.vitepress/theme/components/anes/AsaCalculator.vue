<script setup lang="ts">
import { ref, computed } from "vue";

// ── ASA Classes ───────────────────────────────────────────────────
const classes = [
  {
    value: 1,
    name: "ASA I — 正常健康",
    sub: "Normal healthy patient",
    desc: "無器官性、生理性、生化性或精神科疾病的健康患者",
    examples: [
      "無系統性疾病",
      "不吸菸或吸少量菸",
      "不飲酒或輕度飲酒",
      "無肥胖（BMI < 30）",
    ],
    mortality: "< 0.1%",
    color: "asa1",
  },
  {
    value: 2,
    name: "ASA II — 輕度系統疾病",
    sub: "Patient with mild systemic disease",
    desc: "有輕度系統性疾病，但無實質功能限制",
    examples: [
      "控制良好的高血壓或糖尿病",
      "輕度肺部疾病",
      "目前吸菸者",
      "BMI 30–40（肥胖）",
      "懷孕",
      "社交性飲酒",
      "控制良好的癲癇",
    ],
    mortality: "0.1–0.2%",
    color: "asa2",
  },
  {
    value: 3,
    name: "ASA III — 重度系統疾病",
    sub: "Patient with severe systemic disease",
    desc: "有實質功能限制的嚴重系統性疾病",
    examples: [
      "控制不良的糖尿病或高血壓",
      "慢性阻塞性肺病（COPD）",
      "病態性肥胖（BMI ≥ 40）",
      "活動性肝炎",
      "酒精依賴或濫用",
      "植入心律調節器",
      "中等程度腎功能不全",
      "早產兒（< 60 週胎齡後週數）",
      "3 個月以上的心肌梗塞、腦中風、TIA 或心臟支架病史",
    ],
    mortality: "1.8–4.0%",
    color: "asa3",
  },
  {
    value: 4,
    name: "ASA IV — 危及生命的系統疾病",
    sub: "Patient with severe systemic disease that is a constant threat to life",
    desc: "有持續危及生命的嚴重系統性疾病",
    examples: [
      "近期（3個月內）心肌梗塞、腦中風、TIA 或冠狀動脈疾病",
      "持續缺血性心臟病或嚴重心臟瓣膜功能障礙",
      "嚴重心臟衰竭（EF < 25%）",
      "敗血症",
      "DIC（瀰漫性血管內凝血）",
      "ARD（急性呼吸窘迫）或末期期腎臟病（未規律透析）",
    ],
    mortality: "7.8–23.0%",
    color: "asa4",
  },
  {
    value: 5,
    name: "ASA V — 瀕死患者",
    sub: "Moribund patient not expected to survive without the operation",
    desc: "不手術則預期無法存活的瀕死患者，手術為最後手段",
    examples: [
      "腹主動脈瘤破裂",
      "大量顱內出血伴腦疝",
      "廣泛性腸繫膜缺血",
      "嚴重多重創傷",
      "心因性休克",
    ],
    mortality: "9.4–50.7%",
    color: "asa5",
  },
  {
    value: 6,
    name: "ASA VI — 腦死器官捐贈",
    sub: "Brain-dead patient for organ donation",
    desc: "已宣告腦死、準備進行器官捐贈手術的患者",
    examples: ["腦死確認", "器官捐贈評估中"],
    mortality: "N/A",
    color: "asa6",
  },
];

// ── State ─────────────────────────────────────────────────────────
const selected = ref<number | null>(null);
const isEmergency = ref<boolean | null>(null);
const showResults = ref(false);
const copied = ref(false);

// ── Computed ──────────────────────────────────────────────────────
const selectedClass = computed(
  () => classes.find((c) => c.value === selected.value) ?? null,
);

const asaLabel = computed(() => {
  if (selected.value === null) return "—";
  return `ASA ${selected.value}${isEmergency.value ? "E" : ""}`;
});

const severity = computed(() => {
  if (selected.value === null) return "filling";
  return selectedClass.value?.color ?? "filling";
});

// ── Functions ─────────────────────────────────────────────────────
function generateMarkdown() {
  const c = selectedClass.value;
  if (!c) return "# ASA 評估結果\n\n尚未選擇等級";
  const emergency =
    isEmergency.value === true
      ? "（緊急手術，加註 E）"
      : isEmergency.value === false
        ? "（擇期手術）"
        : "（未評估緊急程度）";
  return `# ASA 麻醉風險分級評估結果\n\n## 評估等級\n\n**${asaLabel.value} — ${c.name.split("—")[1].trim()}**\n\n${c.desc}\n\n## 臨床範例\n\n${c.examples.map((e) => `- ${e}`).join("\n")}\n\n---\n\n## 摘要\n\n- **ASA 等級**：${asaLabel.value} ${emergency}\n- **手術死亡率參考**：${c.mortality}\n- **說明**：${c.sub}`;
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
  <div class="asa">
    <!-- Header -->
    <div class="asa-header">
      <div class="header-title">
        <h2 class="title">ASA 麻醉風險分級</h2>
        <p class="subtitle">
          American Society of Anesthesiologists Physical Status Classification
        </p>
      </div>
      <div class="score-badge" :class="severity">
        <span class="score-number">{{ asaLabel }}</span>
        <span class="score-label">{{
          selectedClass
            ? selectedClass.name
                .split("—")[1]
                .trim()
                .replace("（", "")
                .replace("）", "")
            : "未選擇"
        }}</span>
      </div>
    </div>

    <!-- Visual class bar -->
    <div class="asa-bar-wrap">
      <div class="asa-bar">
        <div
          v-for="c in classes"
          :key="c.value"
          class="asa-segment"
          :class="[c.color, { active: selected === c.value }]"
          @click="selected = c.value"
        >
          {{ c.value }}
        </div>
      </div>
      <div class="asa-bar-labels">
        <span class="label-low">低風險 →</span>
        <span class="label-high">← 高風險</span>
      </div>
    </div>

    <!-- Intro -->
    <div class="intro-bar">
      <span class="intro-dot">◉</span>
      <span
        >請依據患者術前健康狀況選擇最符合的 ASA
        等級（1–6）。若為<strong>緊急手術</strong>，在等級後加註「E」（如 ASA
        3E）。</span
      >
    </div>

    <!-- ASA class cards -->
    <div class="group-header">
      <div class="group-label-block">
        <span class="group-label">術前身體狀況分級</span>
        <span class="group-sub"
          >Preoperative Physical Status · 請選擇一個等級</span
        >
      </div>
      <div
        v-if="selected"
        class="group-score-pill"
        :class="selectedClass?.color + '-pill'"
      >
        已選 {{ asaLabel }}
      </div>
    </div>

    <div class="item-list">
      <div
        v-for="c in classes"
        :key="c.value"
        class="asa-item"
        :class="[c.color, { selected: selected === c.value }]"
        @click="selected = c.value"
      >
        <div class="item-header">
          <span
            class="selected-indicator"
            :class="{ visible: selected === c.value }"
            >✓</span
          >
          <div class="asa-num" :class="c.color">{{ c.value }}</div>
          <div class="item-name-block">
            <span class="item-name">{{ c.name }}</span>
            <span class="item-sub">{{ c.sub }}</span>
          </div>
          <div class="item-right">
            <span class="mortality-badge" :class="c.color">{{
              c.mortality
            }}</span>
          </div>
        </div>

        <div class="item-body">
          <p class="item-desc">{{ c.desc }}</p>
          <div class="examples">
            <span class="examples-label">臨床範例：</span>
            <span v-for="(ex, i) in c.examples" :key="i" class="example-tag">{{
              ex
            }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Emergency modifier -->
    <div class="emergency-section">
      <div class="emergency-header">緊急手術加註（E modifier）</div>
      <div class="emergency-body">
        <p class="emergency-desc">
          若為<strong>緊急手術</strong>，在 ASA
          等級後加註「E」，表示手術風險高於擇期手術。緊急手術通常將死亡率提高
          2–4 倍。
        </p>
        <div class="emergency-btns">
          <button
            class="emergency-btn"
            :class="{ active: isEmergency === false }"
            @click="isEmergency = false"
          >
            擇期手術（Elective）
          </button>
          <button
            class="emergency-btn emergency"
            :class="{ active: isEmergency === true }"
            @click="isEmergency = true"
          >
            緊急手術（Emergency · +E）
          </button>
        </div>
      </div>
    </div>

    <!-- Result card -->
    <div v-if="selectedClass" class="asa-result" :class="selectedClass.color">
      <div class="result-left">
        <span class="result-label-text">ASA</span>
        <span class="result-number">{{ selected }}</span>
        <span v-if="isEmergency" class="result-e">E</span>
      </div>
      <div class="result-right">
        <span class="result-level">{{
          selectedClass.name.split("—")[1].trim()
        }}</span>
        <span class="result-sub">{{ selectedClass.sub }}</span>
        <span class="result-mortality">
          術中死亡率參考：<strong>{{ selectedClass.mortality }}</strong>
          <template v-if="isEmergency"> （緊急手術約 2–4 倍）</template>
        </span>
      </div>
    </div>
    <div v-else class="asa-result-placeholder">
      請點選上方等級卡片以選擇 ASA 等級
    </div>

    <!-- Results detail -->
    <div v-if="showResults && selectedClass" class="results-detail">
      <div class="results-header">分級一覽</div>
      <div
        v-for="c in classes"
        :key="c.value"
        class="detail-row"
        :class="{ 'selected-row': c.value === selected }"
      >
        <span class="detail-level" :class="c.color">{{ c.value }}</span>
        <span class="detail-domain">{{ c.name }}</span>
        <span class="detail-check" v-if="c.value === selected">✓</span>
        <span class="detail-mortality" :class="c.color">{{ c.mortality }}</span>
      </div>
    </div>

    <!-- Actions -->
    <div class="asa-actions">
      <button
        class="btn-view"
        @click="showResults = !showResults"
        :disabled="!selected"
      >
        {{ showResults ? "收起明細" : "查看評估結果" }}
      </button>
      <button class="btn-copy" @click="copyMarkdown" :disabled="!selected">
        {{ copied ? "已複製 ✓" : "複製 Markdown 結果" }}
      </button>
      <button class="btn-reset" @click="reset">重置</button>
    </div>
    <p v-if="!selected" class="progress-hint">請選擇一個 ASA 等級</p>
  </div>
</template>

<style scoped>
.asa {
  max-width: 780px;
  margin: 0 auto;
  padding: 2rem 0 3rem;
  font-size: 0.9rem;
}

/* ── Color palette ─────────────────────────────────────────────── */
/* asa1=green asa2=lime asa3=amber asa4=orange asa5=red asa6=purple */

/* ── Header ────────────────────────────────────────────────────── */
.asa-header {
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
  font-size: 0.75rem;
  color: var(--vp-c-text-3);
  margin: 0;
}

.score-badge {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-width: 88px;
  padding: 0.6rem 1rem;
  border-radius: 12px;
  border: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg-soft);
  transition: all 0.3s;
}
.score-number {
  font-size: 1.6rem;
  font-weight: 800;
  line-height: 1;
}
.score-label {
  font-size: 0.65rem;
  font-weight: 600;
  margin-top: 2px;
  text-align: center;
}

.score-badge.filling {
  color: var(--vp-c-text-3);
}
.score-badge.asa1 {
  border-color: #22c55e;
  color: #22c55e;
}
.score-badge.asa2 {
  border-color: #84cc16;
  color: #84cc16;
}
.score-badge.asa3 {
  border-color: #f59e0b;
  color: #f59e0b;
}
.score-badge.asa4 {
  border-color: #f97316;
  color: #f97316;
}
.score-badge.asa5 {
  border-color: #ef4444;
  color: #ef4444;
}
.score-badge.asa6 {
  border-color: #8b5cf6;
  color: #8b5cf6;
}

/* ── ASA bar ───────────────────────────────────────────────────── */
.asa-bar-wrap {
  margin-bottom: 1.5rem;
}

.asa-bar {
  display: flex;
  border-radius: 8px;
  overflow: hidden;
  margin-bottom: 6px;
  height: 36px;
}

.asa-segment {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.95rem;
  font-weight: 800;
  cursor: pointer;
  transition: all 0.15s;
  border-right: 1px solid rgba(255, 255, 255, 0.15);
  color: rgba(255, 255, 255, 0.4);
}
.asa-segment:last-child {
  border-right: none;
}
.asa-segment:hover {
  opacity: 0.8;
  color: #fff;
}

.asa-segment.asa1 {
  background: rgba(34, 197, 94, 0.2);
}
.asa-segment.asa2 {
  background: rgba(132, 204, 22, 0.2);
}
.asa-segment.asa3 {
  background: rgba(245, 158, 11, 0.2);
}
.asa-segment.asa4 {
  background: rgba(249, 115, 22, 0.2);
}
.asa-segment.asa5 {
  background: rgba(239, 68, 68, 0.2);
}
.asa-segment.asa6 {
  background: rgba(139, 92, 246, 0.2);
}

.asa-segment.active.asa1 {
  background: #22c55e;
  color: #fff;
}
.asa-segment.active.asa2 {
  background: #84cc16;
  color: #fff;
}
.asa-segment.active.asa3 {
  background: #f59e0b;
  color: #fff;
}
.asa-segment.active.asa4 {
  background: #f97316;
  color: #fff;
}
.asa-segment.active.asa5 {
  background: #ef4444;
  color: #fff;
}
.asa-segment.active.asa6 {
  background: #8b5cf6;
  color: #fff;
}

.asa-bar-labels {
  display: flex;
  justify-content: space-between;
  font-size: 0.65rem;
  padding: 0 2px;
}
.label-low {
  color: #22c55e;
}
.label-high {
  color: #ef4444;
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

/* ── Group header ──────────────────────────────────────────────── */
.group-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  margin-bottom: 0.75rem;
  padding: 0.55rem 0.75rem;
  border-radius: 8px;
  background: var(--vp-c-bg-mute);
  border: 1px solid var(--vp-c-divider);
  border-left: 3px solid #a855f7;
}
.group-label-block {
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.group-label {
  font-size: 0.85rem;
  font-weight: 700;
  color: var(--vp-c-text-1);
}
.group-sub {
  font-size: 0.7rem;
  color: var(--vp-c-text-3);
}

.group-score-pill {
  font-size: 0.78rem;
  font-weight: 700;
  padding: 3px 10px;
  border-radius: 999px;
  border: 1px solid;
  white-space: nowrap;
  flex-shrink: 0;
}
.asa1-pill {
  color: #22c55e;
  border-color: #22c55e;
}
.asa2-pill {
  color: #84cc16;
  border-color: #84cc16;
}
.asa3-pill {
  color: #f59e0b;
  border-color: #f59e0b;
}
.asa4-pill {
  color: #f97316;
  border-color: #f97316;
}
.asa5-pill {
  color: #ef4444;
  border-color: #ef4444;
}
.asa6-pill {
  color: #8b5cf6;
  border-color: #8b5cf6;
}

/* ── Item cards ────────────────────────────────────────────────── */
.item-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
}

.asa-item {
  border: 1px solid var(--vp-c-divider);
  /* border-left: 3px solid var(--vp-c-brand-1); */
  border-radius: 10px;
  background: var(--vp-c-bg-soft);
  overflow: hidden;
  cursor: pointer;
  transition: all 0.18s;
}
.asa-item:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.asa-item.selected.asa1 {
  border-color: #22c55e;
  background: rgba(34, 197, 94, 0.04);
}
.asa-item.selected.asa2 {
  border-color: #84cc16;
  background: rgba(132, 204, 22, 0.04);
}
.asa-item.selected.asa3 {
  border-color: #f59e0b;
  background: rgba(245, 158, 11, 0.04);
}
.asa-item.selected.asa4 {
  border-color: #f97316;
  background: rgba(249, 115, 22, 0.04);
}
.asa-item.selected.asa5 {
  border-color: #ef4444;
  background: rgba(239, 68, 68, 0.04);
}
.asa-item.selected.asa6 {
  border-color: #8b5cf6;
  background: rgba(139, 92, 246, 0.04);
}

.item-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.65rem 0.9rem;
  background: var(--vp-c-bg-mute);
  border-bottom: 1px solid var(--vp-c-divider);
}

.asa-num {
  font-size: 1.5rem;
  font-weight: 900;
  flex-shrink: 0;
  width: 32px;
  text-align: center;
}
.asa-num.asa1 {
  color: #22c55e;
}
.asa-num.asa2 {
  color: #84cc16;
}
.asa-num.asa3 {
  color: #f59e0b;
}
.asa-num.asa4 {
  color: #f97316;
}
.asa-num.asa5 {
  color: #ef4444;
}
.asa-num.asa6 {
  color: #8b5cf6;
}

.item-name-block {
  display: flex;
  flex-direction: column;
  gap: 2px;
  flex: 1;
}
.item-name {
  font-size: 0.88rem;
  font-weight: 700;
  color: var(--vp-c-text-1);
}
.item-sub {
  font-size: 0.68rem;
  color: var(--vp-c-text-3);
}

.item-right {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-shrink: 0;
}

.mortality-badge {
  font-size: 0.68rem;
  font-weight: 700;
  padding: 2px 8px;
  border-radius: 999px;
  background: var(--vp-c-bg);
  border: 1px solid var(--vp-c-divider);
  /* border-left: 3px solid var(--vp-c-brand-1); */
}
.mortality-badge.asa1 {
  color: #22c55e;
  border-color: rgba(34, 197, 94, 0.3);
}
.mortality-badge.asa2 {
  color: #84cc16;
  border-color: rgba(132, 204, 22, 0.3);
}
.mortality-badge.asa3 {
  color: #f59e0b;
  border-color: rgba(245, 158, 11, 0.3);
}
.mortality-badge.asa4 {
  color: #f97316;
  border-color: rgba(249, 115, 22, 0.3);
}
.mortality-badge.asa5 {
  color: #ef4444;
  border-color: rgba(239, 68, 68, 0.3);
}
.mortality-badge.asa6 {
  color: #8b5cf6;
  border-color: rgba(139, 92, 246, 0.3);
}

.selected-indicator {
  font-size: 0.65rem;
  font-weight: 800;
  color: #fff;
  background: #22c55e;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  opacity: 0;
  transition: opacity 0.2s;
}
.selected-indicator.visible {
  opacity: 1;
}

.item-body {
  padding: 0.6rem 0.9rem 0.6rem 3.25rem;
}
.item-desc {
  font-size: 0.8rem;
  color: var(--vp-c-text-2);
  margin: 0 0 0.6rem;
  line-height: 1.5;
}

.examples {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
  align-items: center;
}
.examples-label {
  font-size: 0.68rem;
  font-weight: 700;
  color: var(--vp-c-text-3);
  flex-shrink: 0;
}
.example-tag {
  font-size: 0.68rem;
  padding: 2px 8px;
  border-radius: 999px;
  background: var(--vp-c-bg-mute);
  border: 1px solid var(--vp-c-divider);
  /* border-left: 3px solid var(--vp-c-brand-1); */
  color: var(--vp-c-text-2);
}

/* ── Emergency section ─────────────────────────────────────────── */
.emergency-section {
  border: 1px solid var(--vp-c-divider);
  /* border-left: 3px solid var(--vp-c-brand-1); */
  border-radius: 10px;
  overflow: hidden;
  margin-bottom: 1.25rem;
}

.emergency-header {
  padding: 0.5rem 0.9rem;
  font-size: 0.8rem;
  font-weight: 700;
  color: var(--vp-c-text-2);
  background: var(--vp-c-bg-mute);
  border-bottom: 1px solid var(--vp-c-divider);
}

.emergency-body {
  padding: 0.75rem 0.9rem;
}

.emergency-desc {
  font-size: 0.8rem;
  color: var(--vp-c-text-2);
  margin: 0 0 0.75rem;
  line-height: 1.5;
}

.emergency-btns {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.emergency-btn {
  padding: 7px 18px;
  border-radius: 8px;
  border: 1px solid var(--vp-c-divider);
  /* border-left: 3px solid var(--vp-c-brand-1); */
  background: transparent;
  font-size: 0.82rem;
  font-weight: 600;
  cursor: pointer;
  font-family: inherit;
  transition: all 0.15s;
  color: var(--vp-c-text-2);
}
.emergency-btn.active {
  background: var(--vp-c-bg-mute);
  border-color: var(--vp-c-brand-1);
  color: var(--vp-c-brand-1);
}
.emergency-btn.emergency.active {
  background: rgba(239, 68, 68, 0.08);
  border-color: #ef4444;
  color: #ef4444;
}
.emergency-btn:hover:not(.active) {
  border-color: var(--vp-c-text-2);
}

/* ── Result card ───────────────────────────────────────────────── */
.asa-result {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  padding: 1.25rem 1.5rem;
  border-radius: 12px;
  border: 1px solid var(--vp-c-divider);
  /* border-left: 3px solid var(--vp-c-brand-1); */
  background: var(--vp-c-bg-soft);
  margin-bottom: 1rem;
  flex-wrap: wrap;
  transition: border-color 0.3s;
}
.asa-result.asa1 {
  border-color: #22c55e;
}
.asa-result.asa2 {
  border-color: #84cc16;
}
.asa-result.asa3 {
  border-color: #f59e0b;
}
.asa-result.asa4 {
  border-color: #f97316;
}
.asa-result.asa5 {
  border-color: #ef4444;
}
.asa-result.asa6 {
  border-color: #8b5cf6;
}

.result-left {
  display: flex;
  align-items: baseline;
  gap: 2px;
  flex-shrink: 0;
}

.result-label-text {
  font-size: 1.4rem;
  font-weight: 800;
  color: var(--vp-c-text-3);
  line-height: 1;
}

.result-number {
  font-size: 3.5rem;
  font-weight: 900;
  line-height: 1;
  color: var(--vp-c-text-3);
  transition: color 0.3s;
}

.result-e {
  font-size: 2rem;
  font-weight: 900;
  color: #ef4444;
  line-height: 1;
}

.asa-result.asa1 .result-number,
.asa-result.asa1 .result-label-text {
  color: #22c55e;
}
.asa-result.asa2 .result-number,
.asa-result.asa2 .result-label-text {
  color: #84cc16;
}
.asa-result.asa3 .result-number,
.asa-result.asa3 .result-label-text {
  color: #f59e0b;
}
.asa-result.asa4 .result-number,
.asa-result.asa4 .result-label-text {
  color: #f97316;
}
.asa-result.asa5 .result-number,
.asa-result.asa5 .result-label-text {
  color: #ef4444;
}
.asa-result.asa6 .result-number,
.asa-result.asa6 .result-label-text {
  color: #8b5cf6;
}

.result-right {
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: 1;
}
.result-level {
  font-size: 1rem;
  font-weight: 700;
  color: var(--vp-c-text-1);
}
.result-sub {
  font-size: 0.78rem;
  color: var(--vp-c-text-3);
}
.result-mortality {
  font-size: 0.82rem;
  color: var(--vp-c-text-2);
}

.asa-result-placeholder {
  padding: 1.25rem;
  border-radius: 12px;
  border: 1px dashed var(--vp-c-divider);
  background: var(--vp-c-bg-soft);
  margin-bottom: 1rem;
  font-size: 0.82rem;
  color: var(--vp-c-text-3);
  text-align: center;
}

/* ── Results detail ────────────────────────────────────────────── */
.results-detail {
  border: 1px solid var(--vp-c-divider);
  /* border-left: 3px solid var(--vp-c-brand-1); */
  border-radius: 10px;
  overflow: hidden;
  margin-bottom: 1rem;
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
  gap: 0.75rem;
  padding: 0.45rem 0.9rem;
  border-bottom: 1px solid var(--vp-c-divider);
}
.detail-row:last-child {
  border-bottom: none;
}
.selected-row {
  background: var(--vp-c-brand-soft);
}

.detail-level {
  font-size: 0.9rem;
  font-weight: 900;
  flex-shrink: 0;
  min-width: 20px;
}
.detail-level.asa1 {
  color: #22c55e;
}
.detail-level.asa2 {
  color: #84cc16;
}
.detail-level.asa3 {
  color: #f59e0b;
}
.detail-level.asa4 {
  color: #f97316;
}
.detail-level.asa5 {
  color: #ef4444;
}
.detail-level.asa6 {
  color: #8b5cf6;
}

.detail-domain {
  font-size: 0.8rem;
  font-weight: 700;
  color: var(--vp-c-text-1);
  flex: 1;
}
.detail-mortality {
  font-size: 0.72rem;
  font-weight: 800;
  width: 80px;
  flex-shrink: 0;
  color: var(--vp-c-text-3);
}
.detail-check {
  font-size: 0.78rem;
  font-weight: 800;
  color: var(--vp-c-brand-1);
  flex-shrink: 0;
  width: 62px;
  text-align: right;
}

/* ── Actions ───────────────────────────────────────────────────── */
.asa-actions {
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
  opacity: 0.35;
  cursor: not-allowed;
}

.progress-hint {
  font-size: 0.75rem;
  color: var(--vp-c-text-3);
  margin: 0.4rem 0 0;
}

@media (max-width: 640px) {
  .asa-header {
    flex-direction: column;
  }
  .score-badge {
    flex-direction: row;
    gap: 0.5rem;
    align-self: flex-start;
  }
  .score-number {
    font-size: 1.3rem;
  }
  .asa-result {
    flex-direction: column;
    gap: 0.75rem;
  }
  .item-body {
    padding-left: 0.9rem;
  }
}
</style>
