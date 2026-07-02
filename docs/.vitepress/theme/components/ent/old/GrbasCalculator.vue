<script setup lang="ts">
import { ref, computed } from "vue";

// ── GRBAS Parameters ──────────────────────────────────────────────
const parameters = [
  {
    key: "G",
    name: "整體嘶啞度",
    sub: "Grade — Overall dysphonia",
    desc: "評估嗓音整體偏離正常的程度，為嗓音障礙的總體嚴重度指標",
    color: "purple",
  },
  {
    key: "R",
    name: "粗糙度",
    sub: "Roughness — Irregular voice quality",
    desc: "由聲帶不規則振動產生的嗓音不穩定感，常見於聲帶息肉、腫瘤或聲帶麻痺",
    color: "orange",
  },
  {
    key: "B",
    name: "氣息聲",
    sub: "Breathiness — Air leakage component",
    desc: "源於聲門閉合不全的漏氣聲，常見於聲帶麻痺、萎縮或聲帶溝",
    color: "blue",
  },
  {
    key: "A",
    name: "無力感",
    sub: "Asthenia — Weak voice quality",
    desc: "聲音微弱無力，音量小且音調偏低，常見於肌肉張力性發聲障礙或系統性疾病",
    color: "green",
  },
  {
    key: "S",
    name: "緊縮感",
    sub: "Strain — Hyperfunctional effort",
    desc: "聲音過度用力或緊繃感，常見於過度功能性發聲障礙或痙攣性發聲障礙",
    color: "red",
  },
];

const scoreOptions = [
  { value: 0, label: "0", desc: "正常" },
  { value: 1, label: "1", desc: "輕度" },
  { value: 2, label: "2", desc: "中度" },
  { value: 3, label: "3", desc: "重度" },
];

// ── State ─────────────────────────────────────────────────────────
const selections = ref<Record<string, number>>(
  Object.fromEntries(parameters.map((p) => [p.key, -1])),
);

const showResults = ref(false);
const copied = ref(false);

// ── Computed ──────────────────────────────────────────────────────
const answeredCount = computed(
  () => parameters.filter((p) => selections.value[p.key] >= 0).length,
);

const isComplete = computed(() => answeredCount.value === 5);

const gradeG = computed(() => selections.value["G"]);

const severity = computed(() => {
  const g = gradeG.value;
  if (g < 0)
    return {
      level: "未評分",
      color: "filling",
      advice: "請評估 G（整體嘶啞度）",
    };
  if (g === 0)
    return {
      level: "正常嗓音",
      color: "normal",
      advice: "嗓音品質在正常範圍內",
    };
  if (g === 1)
    return {
      level: "輕度嘶啞",
      color: "mild",
      advice: "輕度嗓音障礙，建議語言治療師評估",
    };
  if (g === 2)
    return {
      level: "中度嘶啞",
      color: "moderate",
      advice: "中度嗓音障礙，建議嗓音治療或進一步喉鏡評估",
    };
  return {
    level: "重度嘶啞",
    color: "severe",
    advice: "重度嗓音障礙，需積極喉科評估與介入",
  };
});

function getLabel(key: string): string {
  const v = selections.value[key];
  if (v < 0) return "—";
  return scoreOptions.find((o) => o.value === v)?.desc ?? "—";
}

function generateMarkdown() {
  const lines = parameters
    .map((p) => {
      const v = selections.value[p.key];
      return `- **${p.key} — ${p.name}**（${p.sub}）：${v >= 0 ? `${v} — ${getLabel(p.key)}` : "未評分"}`;
    })
    .join("\n");

  const grbaseStr = parameters
    .map((p) => {
      const v = selections.value[p.key];
      return v >= 0 ? `${p.key}${v}` : `${p.key}?`;
    })
    .join(" ");

  return `# GRBAS 嗓音品質評估結果\n\n## 各參數評分\n\n${lines}\n\n---\n\n## 評分摘要\n\n**GRBAS：${grbaseStr}**\n\n- **G（整體嘶啞度）**：${selections.value["G"] >= 0 ? selections.value["G"] : "—"} — ${getLabel("G")}\n- **整體嚴重程度**：${severity.value.level}\n- **臨床建議**：${severity.value.advice}`;
}

async function copyMarkdown() {
  await navigator.clipboard.writeText(generateMarkdown());
  copied.value = true;
  setTimeout(() => (copied.value = false), 2000);
}

function reset() {
  parameters.forEach((p) => {
    selections.value[p.key] = -1;
  });
  showResults.value = false;
}
</script>

<template>
  <div class="grbas">
    <!-- Header -->
    <div class="grbas-header">
      <div class="header-title">
        <h2 class="title">GRBAS 嗓音品質評估</h2>
        <p class="subtitle">Voice Quality Assessment · 聽知覺嗓音分析</p>
      </div>
      <div class="score-badge" :class="severity.color">
        <span class="score-number grbas-label">
          <span
            v-for="p in parameters"
            :key="p.key"
            class="grbas-letter"
            :class="[p.color, { scored: selections[p.key] >= 0 }]"
          >
            {{ p.key
            }}<sub v-if="selections[p.key] >= 0">{{ selections[p.key] }}</sub>
          </span>
        </span>
        <span class="score-label">{{ severity.level }}</span>
      </div>
    </div>

    <!-- G severity bar -->
    <div class="severity-bar-wrap">
      <div class="severity-bar">
        <div
          class="severity-fill"
          :class="severity.color"
          :style="{ width: gradeG >= 0 ? (gradeG / 3) * 100 + '%' : '0%' }"
        />
      </div>
      <div class="severity-ticks">
        <span>G0 正常</span><span>G1 輕度</span><span>G2 中度</span
        ><span>G3 重度</span>
      </div>
    </div>

    <!-- Intro -->
    <div class="intro-bar">
      <span class="intro-dot">◉</span>
      <span
        >GRBAS
        由有經驗的臨床醫師或語言治療師依據<strong>聽知覺評估</strong>評分。每個參數
        0（正常）至 3（重度），五個參數均需獨立評分。</span
      >
    </div>

    <!-- Parameters -->
    <div class="grbas-group">
      <div class="group-header">
        <div class="group-label-block">
          <span class="group-label">嗓音品質五參數</span>
          <span class="group-sub"
            >Five Perceptual Parameters of Voice Quality</span
          >
        </div>
        <div class="group-score-pill">{{ answeredCount }}/5 項</div>
      </div>

      <div class="item-list">
        <div
          v-for="p in parameters"
          :key="p.key"
          class="grbas-item"
          :class="{
            answered: selections[p.key] >= 0,
            high: selections[p.key] >= 2,
          }"
        >
          <!-- Item header -->
          <div class="item-header">
            <div class="item-left">
              <span class="param-key" :class="p.color">{{ p.key }}</span>
              <div class="item-name-block">
                <span class="item-name">{{ p.name }}</span>
                <span class="item-sub">{{ p.sub }}</span>
              </div>
            </div>
            <span
              class="item-score"
              :class="{
                zero: selections[p.key] === 0,
                unanswered: selections[p.key] < 0,
                high: selections[p.key] >= 2,
              }"
            >
              {{ selections[p.key] >= 0 ? selections[p.key] : "—" }}
            </span>
          </div>

          <!-- Description -->
          <div class="item-desc-row">
            <span class="item-desc">{{ p.desc }}</span>
          </div>

          <!-- Score options — horizontal 4-option row -->
          <div class="option-row">
            <label
              v-for="opt in scoreOptions"
              :key="opt.value"
              class="opt-pill"
              :class="{
                active: selections[p.key] === opt.value,
                high: opt.value >= 2 && selections[p.key] === opt.value,
                ['s' + opt.value]: true,
              }"
            >
              <input
                type="radio"
                :name="p.key"
                :value="opt.value"
                v-model="selections[p.key]"
              />
              <span class="opt-num">{{ opt.label }}</span>
              <span class="opt-desc">{{ opt.desc }}</span>
            </label>
          </div>
        </div>
      </div>
    </div>

    <!-- GRBAS summary string -->
    <div class="grbas-summary-card">
      <div class="summary-label">GRBAS 評分摘要</div>
      <div class="summary-string">
        <span v-for="p in parameters" :key="p.key" class="summary-param">
          <span class="sp-key" :class="p.color">{{ p.key }}</span>
          <span class="sp-val" :class="{ unset: selections[p.key] < 0 }">
            {{ selections[p.key] >= 0 ? selections[p.key] : "?" }}
          </span>
        </span>
      </div>
      <div class="summary-advice">{{ severity.advice }}</div>
    </div>

    <!-- Results detail -->
    <div v-if="showResults" class="results-detail">
      <div class="results-header">評估明細</div>
      <div v-for="p in parameters" :key="p.key" class="detail-row">
        <span class="detail-key" :class="p.color">{{ p.key }}</span>
        <span class="detail-domain">{{ p.name }}</span>
        <span
          class="detail-score"
          :class="{
            zero: selections[p.key] === 0,
            high: selections[p.key] >= 2,
            brand: selections[p.key] === 1,
          }"
        >
          {{ selections[p.key] >= 0 ? selections[p.key] : "—" }}
        </span>
        <span class="detail-desc">{{ getLabel(p.key) }}</span>
      </div>
    </div>

    <!-- Actions -->
    <div class="grbas-actions">
      <button class="btn-view" @click="showResults = !showResults">
        {{ showResults ? "收起明細" : "查看評估結果" }}
      </button>
      <button class="btn-copy" @click="copyMarkdown">
        {{ copied ? "已複製 ✓" : "複製 Markdown 結果" }}
      </button>
      <button class="btn-reset" @click="reset">重置</button>
    </div>
    <p v-if="!isComplete" class="progress-hint">
      已完成 {{ answeredCount }}/5 項
    </p>
  </div>
</template>

<style scoped>
.grbas {
  max-width: 780px;
  margin: 0 auto;
  padding: 2rem 0 3rem;
  font-size: 0.9rem;
}

/* ── Header ────────────────────────────────────────────────────── */
.grbas-header {
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

.score-badge {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-width: 120px;
  padding: 0.6rem 1rem;
  border-radius: 14px;
  border: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg-soft);
  transition: all 0.3s;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
}

.score-badge.normal {
  border-color: #22c55e;
  box-shadow:
    0 0 0 1px rgba(34, 197, 94, 0.08),
    0 1px 3px rgba(0, 0, 0, 0.04);
}
.score-badge.mild {
  border-color: #f59e0b;
  box-shadow:
    0 0 0 1px rgba(245, 158, 11, 0.08),
    0 1px 3px rgba(0, 0, 0, 0.04);
}
.score-badge.moderate {
  border-color: #f97316;
  box-shadow:
    0 0 0 1px rgba(249, 115, 22, 0.08),
    0 1px 3px rgba(0, 0, 0, 0.04);
}
.score-badge.severe {
  border-color: #ef4444;
  box-shadow:
    0 0 0 1px rgba(239, 68, 68, 0.08),
    0 1px 3px rgba(0, 0, 0, 0.04);
}
.score-badge.filling {
  border-color: var(--vp-c-divider);
}

.grbas-label {
  display: flex;
  gap: 4px;
  align-items: baseline;
  font-size: 1.3rem;
  font-weight: 800;
  line-height: 1;
}

.grbas-letter {
  font-weight: 800;
  transition: color 0.2s;
  color: var(--vp-c-text-3);
}
.grbas-letter sub {
  font-size: 0.55em;
}
.grbas-letter.scored.purple {
  color: #8b5cf6;
}
.grbas-letter.scored.orange {
  color: #f97316;
}
.grbas-letter.scored.blue {
  color: #3b82f6;
}
.grbas-letter.scored.green {
  color: #22c55e;
}
.grbas-letter.scored.red {
  color: #ef4444;
}

.score-label {
  font-size: 0.68rem;
  font-weight: 600;
  margin-top: 4px;
  color: var(--vp-c-text-3);
  transition: color 0.3s;
}
.score-badge.normal .score-label {
  color: #22c55e;
}
.score-badge.mild .score-label {
  color: #f59e0b;
}
.score-badge.moderate .score-label {
  color: #f97316;
}
.score-badge.severe .score-label {
  color: #ef4444;
}

/* ── Severity bar (G only) ─────────────────────────────────────── */
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
  background: linear-gradient(90deg, #22c55e, #16a34a);
}
.severity-fill.mild {
  background: linear-gradient(90deg, #f59e0b, #d97706);
}
.severity-fill.moderate {
  background: linear-gradient(90deg, #f97316, #ea580c);
}
.severity-fill.severe {
  background: linear-gradient(90deg, #ef4444, #dc2626);
}

.severity-ticks {
  display: flex;
  justify-content: space-between;
  font-size: 0.68rem;
  color: var(--vp-c-text-3);
  padding: 0 2px;
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
.grbas-group {
  margin-bottom: 1.25rem;
}

.group-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  margin-bottom: 0.5rem;
  padding: 0.65rem 0.85rem 0.65rem 1.5rem;
  border-radius: 10px;
  background: linear-gradient(
    135deg,
    #fff7ed,
    var(--vp-c-bg-mute),
    var(--vp-c-bg-soft)
  );
  border: 1px solid var(--vp-c-divider);
  border-left: 4px solid #f97316;
  box-shadow: 0 1px 3px rgba(249, 115, 22, 0.06);
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
  padding: 4px 14px;
  border-radius: 999px;
  border: 1px solid rgba(249, 115, 22, 0.25);
  color: #f97316;
  background: rgba(249, 115, 22, 0.06);
  white-space: nowrap;
  flex-shrink: 0;
}

/* ── Item ──────────────────────────────────────────────────────── */
.item-list {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
}

.grbas-item {
  border: 1px solid var(--vp-c-divider);
  border-radius: 10px;
  background: var(--vp-c-bg-soft);
  overflow: hidden;
  transition: all 0.25s;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.03);
}
.grbas-item:hover {
  box-shadow: 0 3px 12px rgba(0, 0, 0, 0.06);
  border-color: var(--vp-c-divider);
}
.grbas-item.answered {
  border-color: rgba(34, 197, 94, 0.2);
  background: linear-gradient(
    135deg,
    var(--vp-c-bg-soft),
    rgba(34, 197, 94, 0.03)
  );
}
.grbas-item.high {
  border-color: rgba(249, 115, 22, 0.25) !important;
  background: linear-gradient(
    135deg,
    var(--vp-c-bg-soft),
    rgba(249, 115, 22, 0.04)
  ) !important;
  box-shadow: 0 2px 10px rgba(249, 115, 22, 0.08);
}

.item-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.65rem 0.9rem 0.6rem;
  background: var(--vp-c-bg-mute);
  border-bottom: 1px solid var(--vp-c-divider);
  gap: 0.75rem;
}

.item-left {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex: 1;
}

.param-key {
  font-size: 1.1rem;
  font-weight: 900;
  flex-shrink: 0;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  color: #fff;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.15);
}
.param-key.purple {
  background: linear-gradient(135deg, #8b5cf6, #7c3aed);
}
.param-key.orange {
  background: linear-gradient(135deg, #f97316, #ea580c);
}
.param-key.blue {
  background: linear-gradient(135deg, #3b82f6, #2563eb);
}
.param-key.green {
  background: linear-gradient(135deg, #22c55e, #16a34a);
}
.param-key.red {
  background: linear-gradient(135deg, #ef4444, #dc2626);
}
.grbas-item.high .param-key {
  box-shadow: 0 1px 3px rgba(249, 115, 22, 0.3);
}

.item-name-block {
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.item-name {
  font-size: 0.88rem;
  font-weight: 600;
  color: var(--vp-c-text-1);
}
.item-sub {
  font-size: 0.7rem;
  color: var(--vp-c-text-3);
}

.item-score {
  font-size: 1.1rem;
  font-weight: 800;
  flex-shrink: 0;
  min-width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  background: var(--vp-c-bg);
  border: 1px solid var(--vp-c-divider);
  transition: all 0.25s;
}
.item-score.zero {
  color: #22c55e;
  border-color: rgba(34, 197, 94, 0.25);
  background: rgba(34, 197, 94, 0.06);
}
.item-score.unanswered {
  color: var(--vp-c-text-3);
  border-color: var(--vp-c-divider);
  background: transparent;
}
.item-score.high {
  color: #f97316;
  border-color: rgba(249, 115, 22, 0.3);
  background: rgba(249, 115, 22, 0.08);
}

.item-desc-row {
  padding: 0.5rem 0.9rem 0.2rem 3.5rem;
}
.item-desc {
  font-size: 0.78rem;
  color: var(--vp-c-text-2);
  line-height: 1.5;
}

/* ── Option row — 4 columns ────────────────────────────────────── */
.option-row {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 2px;
  padding: 3px;
  background: var(--vp-c-bg-mute);
}

.opt-pill {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 0.6rem 0.15rem;
  cursor: pointer;
  transition: all 0.2s;
  text-align: center;
  gap: 3px;
  border-radius: 6px;
  background: var(--vp-c-bg);
  border: 1.5px solid transparent;
}
.opt-pill:hover {
  border-color: var(--vp-c-divider);
  background: var(--vp-c-bg-soft);
}
.opt-pill input[type="radio"] {
  display: none;
}

/* Score-specific colors */
.opt-pill.s0 {
  border-color: rgba(34, 197, 94, 0.15);
}
.opt-pill.s0:hover:not(.active) {
  border-color: rgba(34, 197, 94, 0.35);
  background: rgba(34, 197, 94, 0.04);
}
.opt-pill.s0.active {
  border-color: #22c55e;
  background: linear-gradient(
    180deg,
    rgba(34, 197, 94, 0.12),
    rgba(34, 197, 94, 0.06)
  );
  box-shadow: 0 0 0 1px rgba(34, 197, 94, 0.08);
}

.opt-pill.s1 {
  border-color: rgba(132, 204, 22, 0.15);
}
.opt-pill.s1:hover:not(.active) {
  border-color: rgba(132, 204, 22, 0.35);
  background: rgba(132, 204, 22, 0.04);
}
.opt-pill.s1.active {
  border-color: #84cc16;
  background: linear-gradient(
    180deg,
    rgba(132, 204, 22, 0.12),
    rgba(132, 204, 22, 0.06)
  );
  box-shadow: 0 0 0 1px rgba(132, 204, 22, 0.08);
}

.opt-pill.s2 {
  border-color: rgba(234, 179, 8, 0.15);
}
.opt-pill.s2:hover:not(.active) {
  border-color: rgba(234, 179, 8, 0.35);
  background: rgba(234, 179, 8, 0.04);
}
.opt-pill.s2.active {
  border-color: #eab308;
  background: linear-gradient(
    180deg,
    rgba(234, 179, 8, 0.12),
    rgba(234, 179, 8, 0.06)
  );
  box-shadow: 0 0 0 1px rgba(234, 179, 8, 0.08);
}

.opt-pill.s3 {
  border-color: rgba(245, 158, 11, 0.15);
}
.opt-pill.s3:hover:not(.active) {
  border-color: rgba(245, 158, 11, 0.35);
  background: rgba(245, 158, 11, 0.04);
}
.opt-pill.s3.active {
  border-color: #f59e0b;
  background: linear-gradient(
    180deg,
    rgba(245, 158, 11, 0.12),
    rgba(245, 158, 11, 0.06)
  );
  box-shadow: 0 0 0 1px rgba(245, 158, 11, 0.08);
}

.opt-num {
  font-size: 1.05rem;
  font-weight: 900;
  transition: color 0.2s;
}
.opt-pill.s0 .opt-num {
  color: rgba(34, 197, 94, 0.5);
}
.opt-pill.s0.active .opt-num {
  color: #22c55e;
}
.opt-pill.s1 .opt-num {
  color: rgba(132, 204, 22, 0.5);
}
.opt-pill.s1.active .opt-num {
  color: #84cc16;
}
.opt-pill.s2 .opt-num {
  color: rgba(234, 179, 8, 0.5);
}
.opt-pill.s2.active .opt-num {
  color: #eab308;
}
.opt-pill.s3 .opt-num {
  color: rgba(245, 158, 11, 0.5);
}
.opt-pill.s3.active .opt-num {
  color: #f59e0b;
}

.opt-desc {
  font-size: 0.7rem;
  font-weight: 700;
  line-height: 1.3;
  transition: color 0.2s;
}
.opt-pill.s0 .opt-desc {
  color: rgba(34, 197, 94, 0.4);
}
.opt-pill.s0.active .opt-desc {
  color: rgba(34, 197, 94, 0.7);
}
.opt-pill.s1 .opt-desc {
  color: rgba(132, 204, 22, 0.4);
}
.opt-pill.s1.active .opt-desc {
  color: rgba(132, 204, 22, 0.7);
}
.opt-pill.s2 .opt-desc {
  color: rgba(234, 179, 8, 0.4);
}
.opt-pill.s2.active .opt-desc {
  color: rgba(234, 179, 8, 0.7);
}
.opt-pill.s3 .opt-desc {
  color: rgba(245, 158, 11, 0.4);
}
.opt-pill.s3.active .opt-desc {
  color: rgba(245, 158, 11, 0.7);
}

/* ── GRBAS summary card ────────────────────────────────────────── */
.grbas-summary-card {
  display: flex;
  align-items: center;
  gap: 1.25rem;
  padding: 1rem 1.25rem;
  border-radius: 14px;
  border: 1px solid var(--vp-c-divider);
  background: linear-gradient(135deg, var(--vp-c-bg-soft), var(--vp-c-bg-mute));
  margin-bottom: 1rem;
  flex-wrap: wrap;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
}

.summary-label {
  font-size: 0.72rem;
  font-weight: 700;
  color: var(--vp-c-text-3);
  text-transform: uppercase;
  letter-spacing: 0.06em;
  flex-shrink: 0;
}

.summary-string {
  display: flex;
  gap: 0.75rem;
  align-items: baseline;
  flex: 1;
}

.summary-param {
  display: flex;
  align-items: baseline;
  gap: 2px;
}

.sp-key {
  font-size: 1.1rem;
  font-weight: 900;
}
.sp-key.purple {
  color: #8b5cf6;
}
.sp-key.orange {
  color: #f97316;
}
.sp-key.blue {
  color: #3b82f6;
}
.sp-key.green {
  color: #22c55e;
}
.sp-key.red {
  color: #ef4444;
}

.sp-val {
  font-size: 1.1rem;
  font-weight: 800;
  color: var(--vp-c-text-1);
}
.sp-val.unset {
  color: var(--vp-c-text-3);
}

.summary-advice {
  font-size: 0.78rem;
  color: var(--vp-c-text-2);
  flex-shrink: 0;
}

/* ── Results detail ────────────────────────────────────────────── */
.results-detail {
  border: 1px solid var(--vp-c-divider);
  border-radius: 10px;
  overflow: hidden;
  margin-bottom: 1rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.03);
}

.results-header {
  padding: 0.55rem 0.9rem;
  font-size: 0.7rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--vp-c-text-3);
  background: var(--vp-c-bg-mute);
  border-bottom: 1px solid var(--vp-c-divider);
}

.detail-row {
  display: flex;
  align-items: baseline;
  gap: 0.75rem;
  padding: 0.45rem 0.9rem;
  border-bottom: 1px solid var(--vp-c-divider);
  flex-wrap: wrap;
  transition: background 0.1s;
}
.detail-row:hover {
  background: var(--vp-c-bg-soft);
}
.detail-row:last-child {
  border-bottom: none;
}

.detail-key {
  font-size: 1rem;
  font-weight: 900;
  flex-shrink: 0;
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  color: #fff;
}
.detail-key.purple {
  background: linear-gradient(135deg, #8b5cf6, #7c3aed);
}
.detail-key.orange {
  background: linear-gradient(135deg, #f97316, #ea580c);
}
.detail-key.blue {
  background: linear-gradient(135deg, #3b82f6, #2563eb);
}
.detail-key.green {
  background: linear-gradient(135deg, #22c55e, #16a34a);
}
.detail-key.red {
  background: linear-gradient(135deg, #ef4444, #dc2626);
}

.detail-domain {
  font-size: 0.78rem;
  font-weight: 700;
  color: var(--vp-c-text-1);
  flex-shrink: 0;
  min-width: 80px;
}
.detail-score {
  font-size: 0.82rem;
  font-weight: 800;
  flex-shrink: 0;
}
.detail-score.zero {
  color: #22c55e;
}
.detail-score.high {
  color: #f97316;
}
.detail-score.brand {
  color: var(--vp-c-brand-1);
}
.detail-desc {
  font-size: 0.75rem;
  color: var(--vp-c-text-2);
}

/* ── Actions ───────────────────────────────────────────────────── */
.grbas-actions {
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

.progress-hint {
  font-size: 0.75rem;
  color: var(--vp-c-text-3);
  margin: 0.4rem 0 0;
}

@media (max-width: 640px) {
  .grbas-header {
    flex-direction: column;
  }
  .score-badge {
    align-self: flex-start;
  }
  .grbas-summary-card {
    flex-direction: column;
    gap: 0.5rem;
  }
  .detail-domain {
    min-width: unset;
  }
}
</style>
