<script setup lang="ts">
import { ref, computed } from "vue";

// ── Criteria ──────────────────────────────────────────────────────
const biomarkers = [
  {
    key: "eos_tissue",
    name: "組織嗜酸性球",
    sub: "Tissue Eosinophils",
    desc: "組織切片嗜酸性球 ≥ 10/HPF",
  },
  {
    key: "eos_blood",
    name: "血液嗜酸性球",
    sub: "Blood Eosinophils",
    desc: "血液嗜酸性球 ≥ 250 cells/μL 或 ≥ 5%",
  },
  {
    key: "ige",
    name: "總 IgE",
    sub: "Total IgE",
    desc: "總 IgE ≥ 100 IU/mL",
  },
  {
    key: "steroid_need",
    name: "全身性類固醇需求或禁忌",
    sub: "Systemic Corticosteroid",
    desc: "每年需要 ≥ 2 療程（0.5–1 mg/kg × 5天），或長期使用（> 3個月），或有全身性類固醇禁忌症",
  },
  {
    key: "qol",
    name: "生活品質顯著下降",
    sub: "Significant QoL Impairment",
    desc: "SNOT-22 ≥ 40/110 分",
  },
];

const additionalCriteria = [
  {
    key: "anosmia",
    name: "嗅覺明顯喪失",
    sub: "Significant Loss of Smell",
    desc: "嗅覺測試確認嗅覺喪失（anosmia）",
  },
  {
    key: "asthma",
    name: "合併氣喘診斷",
    sub: "Comorbid Asthma",
    desc: "已診斷合併氣喘，且需定期使用吸入性類固醇（ICS）",
  },
];

// ── State ─────────────────────────────────────────────────────────
const biomarkerSelections = ref<Record<string, boolean | null>>(
  Object.fromEntries(biomarkers.map((b) => [b.key, null])),
);
const additionalSelections = ref<Record<string, boolean | null>>(
  Object.fromEntries(additionalCriteria.map((c) => [c.key, null])),
);

const snot22 = ref<string>("");
const showResults = ref(false);
const copied = ref(false);

// ── Computed ──────────────────────────────────────────────────────
const biomarkerCount = computed(
  () =>
    biomarkers.filter((b) => biomarkerSelections.value[b.key] === true).length,
);

const meetsMinCriteria = computed(() => biomarkerCount.value >= 3);

const hasAnosmia = computed(
  () => additionalSelections.value["anosmia"] === true,
);
const hasAsthma = computed(() => additionalSelections.value["asthma"] === true);

const eligibility = computed(() => {
  const count = biomarkerCount.value;
  if (count >= 3)
    return {
      result: "符合適應症",
      color: "eligible",
      detail: `符合 ${count}/5 項第二型發炎生物標記標準（≥ 3/5）`,
    };
  if (count === 2)
    return {
      result: "可能接近門檻",
      color: "borderline",
      detail: `目前符合 ${count}/5 項，仍差 1 項達門檻。請確認是否有其他佐證資料`,
    };
  return {
    result: "尚未符合適應症",
    color: "ineligible",
    detail: `目前僅符合 ${count}/5 項，需達 ≥ 3/5 項才符合第二型發炎標準`,
  };
});

const isComplete = computed(
  () =>
    biomarkers.every((b) => biomarkerSelections.value[b.key] !== null) &&
    additionalCriteria.every((c) => additionalSelections.value[c.key] !== null),
);

function toggle(key: string, type: "bio" | "add", value: boolean) {
  if (type === "bio") {
    biomarkerSelections.value[key] =
      biomarkerSelections.value[key] === value ? null : value;
  } else {
    additionalSelections.value[key] =
      additionalSelections.value[key] === value ? null : value;
  }
}

function generateMarkdown() {
  const bioLines = biomarkers.map((b) => {
    const v = biomarkerSelections.value[b.key];
    return `- **${b.name}**（${b.sub}）：${v === true ? "✓ 符合" : v === false ? "✗ 不符合" : "未評估"}`;
  });
  const addLines = additionalCriteria.map((c) => {
    const v = additionalSelections.value[c.key];
    return `- **${c.name}**（${c.sub}）：${v === true ? "✓ 符合" : v === false ? "✗ 不符合" : "未評估"}`;
  });
  return `# Dupixent（Dupilumab）適應症評估

## 第二型發炎生物標記（需符合 ≥ 3/5 項）

${bioLines.join("\n")}

**符合項目數：${biomarkerCount.value}/5**

## 附加臨床條件

${addLines.join("\n")}
${snot22.value ? `\nSNOT-22 分數：${snot22.value}/110` : ""}

---

## 評估結果

**${eligibility.value.result}**
${eligibility.value.detail}`;
}

async function copyMarkdown() {
  await navigator.clipboard.writeText(generateMarkdown());
  copied.value = true;
  setTimeout(() => (copied.value = false), 2000);
}

function reset() {
  biomarkers.forEach((b) => {
    biomarkerSelections.value[b.key] = null;
  });
  additionalCriteria.forEach((c) => {
    additionalSelections.value[c.key] = null;
  });
  snot22.value = "";
  showResults.value = false;
}
</script>

<template>
  <div class="dupixent">
    <!-- Header -->
    <div class="dup-header">
      <div class="header-title">
        <h2 class="title">Dupixent 杜避炎適應症評估</h2>
        <p class="subtitle">
          Dupilumab（anti-IL-4/IL-13）· 慢性鼻竇炎合併鼻息肉（CRSwNP）
        </p>
      </div>
      <div class="score-badge" :class="eligibility.color">
        <span class="score-number">{{ biomarkerCount }}/5</span>
        <span class="score-label">生物標記</span>
      </div>
    </div>

    <!-- Progress bar -->
    <div class="severity-bar-wrap">
      <div class="severity-bar">
        <div
          class="severity-fill"
          :class="eligibility.color"
          :style="{ width: (biomarkerCount / 5) * 100 + '%' }"
        />
      </div>
      <div class="severity-ticks">
        <span>0</span><span>1</span><span>2</span
        ><span class="tick-threshold">3 ✓</span><span>4</span><span>5</span>
      </div>
    </div>

    <!-- Intro -->
    <div class="intro-bar">
      <span class="intro-dot">◉</span>
      符合 <strong>≥ 3/5</strong> 項第二型發炎生物標記，即達 Dupixent
      的生物標記適應門檻。附加條件可輔助臨床決策。
    </div>

    <!-- Section 1: Biomarkers -->
    <div class="dup-group">
      <div class="group-header criteria">
        <div class="group-label-block">
          <span class="group-label">第二型發炎生物標記</span>
          <span class="group-sub"
            >Type 2 Inflammation Biomarkers · 需符合 ≥ 3/5 項</span
          >
        </div>
        <div class="group-score-pill" :class="meetsMinCriteria ? 'met' : ''">
          {{ biomarkerCount }} / 5 {{ meetsMinCriteria ? "✓" : "" }}
        </div>
      </div>

      <div class="item-list">
        <div
          v-for="b in biomarkers"
          :key="b.key"
          class="dup-item"
          :class="{
            met: biomarkerSelections[b.key] === true,
            unmet: biomarkerSelections[b.key] === false,
          }"
        >
          <div class="item-header">
            <div class="item-name-block">
              <span class="item-name">{{ b.name }}</span>
              <span class="item-sub">{{ b.sub }}</span>
            </div>
            <span class="item-status">
              <template v-if="biomarkerSelections[b.key] === true">✓</template>
              <template v-else-if="biomarkerSelections[b.key] === false"
                >✗</template
              >
              <template v-else>—</template>
            </span>
          </div>
          <div class="item-desc-row">
            <span class="item-desc">{{ b.desc }}</span>
          </div>
          <div class="presence-row">
            <span class="presence-label">是否符合此標準？</span>
            <div class="presence-btns">
              <button
                class="presence-btn yes"
                :class="{ active: biomarkerSelections[b.key] === true }"
                @click="toggle(b.key, 'bio', true)"
              >
                符合
              </button>
              <button
                class="presence-btn no"
                :class="{ active: biomarkerSelections[b.key] === false }"
                @click="toggle(b.key, 'bio', false)"
              >
                不符合
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Section 2: Additional criteria -->
    <div class="dup-group">
      <div class="group-header additional">
        <div class="group-label-block">
          <span class="group-label">附加臨床條件</span>
          <span class="group-sub"
            >Additional Clinical Criteria · 輔助決策參考</span
          >
        </div>
      </div>

      <div class="item-list">
        <!-- SNOT-22 special input -->
        <div
          class="dup-item"
          :class="{
            met: parseFloat(snot22) >= 40,
            unmet: snot22 !== '' && parseFloat(snot22) < 40,
          }"
        >
          <div class="item-header">
            <div class="item-name-block">
              <span class="item-name">生活品質評估（SNOT-22）</span>
              <span class="item-sub">Quality of Life — SNOT-22 Score</span>
            </div>
            <span class="item-status">
              <template v-if="snot22 !== '' && parseFloat(snot22) >= 40"
                >✓</template
              >
              <template v-else-if="snot22 !== '' && parseFloat(snot22) < 40"
                >✗</template
              >
              <template v-else>—</template>
            </span>
          </div>
          <div class="item-desc-row">
            <span class="item-desc"
              >SNOT-22 ≥ 40/110 分，代表生活品質顯著受損</span
            >
          </div>
          <div class="snot-input-row">
            <span class="presence-label">SNOT-22 分數：</span>
            <div
              class="snot-input-wrap"
              :class="{
                filled: snot22 !== '',
                met: parseFloat(snot22) >= 40,
                unmet: snot22 !== '' && parseFloat(snot22) < 40,
              }"
            >
              <input
                type="number"
                min="0"
                max="110"
                placeholder="0–110"
                v-model="snot22"
                class="snot-input"
              />
              <span class="snot-unit">/ 110</span>
            </div>
            <span
              v-if="snot22 !== ''"
              class="snot-hint"
              :class="parseFloat(snot22) >= 40 ? 'hint-met' : 'hint-unmet'"
            >
              {{ parseFloat(snot22) >= 40 ? "≥ 40，符合" : "< 40，不符合" }}
            </span>
          </div>
        </div>

        <!-- Anosmia & Asthma -->
        <div
          v-for="c in additionalCriteria"
          :key="c.key"
          class="dup-item"
          :class="{
            met: additionalSelections[c.key] === true,
            unmet: additionalSelections[c.key] === false,
          }"
        >
          <div class="item-header">
            <div class="item-name-block">
              <span class="item-name">{{ c.name }}</span>
              <span class="item-sub">{{ c.sub }}</span>
            </div>
            <span class="item-status">
              <template v-if="additionalSelections[c.key] === true">✓</template>
              <template v-else-if="additionalSelections[c.key] === false"
                >✗</template
              >
              <template v-else>—</template>
            </span>
          </div>
          <div class="item-desc-row">
            <span class="item-desc">{{ c.desc }}</span>
          </div>
          <div class="presence-row">
            <span class="presence-label">是否符合此條件？</span>
            <div class="presence-btns">
              <button
                class="presence-btn yes"
                :class="{ active: additionalSelections[c.key] === true }"
                @click="toggle(c.key, 'add', true)"
              >
                符合
              </button>
              <button
                class="presence-btn no"
                :class="{ active: additionalSelections[c.key] === false }"
                @click="toggle(c.key, 'add', false)"
              >
                不符合
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Result card -->
    <div class="dup-result" :class="eligibility.color">
      <div class="result-left">
        <span class="result-number">{{ biomarkerCount }}</span>
        <span class="result-max">/ 5</span>
      </div>
      <div class="result-right">
        <span class="result-level">{{ eligibility.result }}</span>
        <span class="result-advice">{{ eligibility.detail }}</span>
        <div class="result-tags">
          <span v-if="hasAnosmia" class="result-tag">嗅覺喪失</span>
          <span v-if="hasAsthma" class="result-tag">合併氣喘</span>
          <span
            v-if="snot22 !== '' && parseFloat(snot22) >= 40"
            class="result-tag"
            >SNOT-22 ≥ 40</span
          >
        </div>
      </div>
    </div>

    <!-- Results detail -->
    <div v-if="showResults" class="results-detail">
      <div class="results-header">評估明細</div>
      <div class="detail-section-title">
        第二型發炎生物標記（{{ biomarkerCount }}/5）
      </div>
      <div v-for="b in biomarkers" :key="b.key" class="detail-row">
        <span class="detail-domain">{{ b.name }}</span>
        <span
          class="detail-score"
          :class="
            biomarkerSelections[b.key] === true ? 'met-color' : 'unmet-color'
          "
        >
          {{
            biomarkerSelections[b.key] === true
              ? "✓"
              : biomarkerSelections[b.key] === false
                ? "✗"
                : "—"
          }}
        </span>
        <span class="detail-desc">{{ b.desc }}</span>
      </div>
      <div class="detail-section-title">附加臨床條件</div>
      <div class="detail-row">
        <span class="detail-domain">SNOT-22</span>
        <span
          class="detail-score"
          :class="parseFloat(snot22) >= 40 ? 'met-color' : 'unmet-color'"
        >
          {{ snot22 || "—" }}
        </span>
        <span class="detail-desc">{{
          snot22
            ? parseFloat(snot22) >= 40
              ? "≥ 40，符合"
              : "< 40，不符合"
            : "未填寫"
        }}</span>
      </div>
      <div v-for="c in additionalCriteria" :key="c.key" class="detail-row">
        <span class="detail-domain">{{ c.name }}</span>
        <span
          class="detail-score"
          :class="
            additionalSelections[c.key] === true ? 'met-color' : 'unmet-color'
          "
        >
          {{
            additionalSelections[c.key] === true
              ? "✓"
              : additionalSelections[c.key] === false
                ? "✗"
                : "—"
          }}
        </span>
        <span class="detail-desc">{{ c.desc }}</span>
      </div>
    </div>

    <!-- Actions -->
    <div class="dup-actions">
      <button class="btn-view" @click="showResults = !showResults">
        {{ showResults ? "收起明細" : "查看評估結果" }}
      </button>
      <button class="btn-copy" @click="copyMarkdown">
        {{ copied ? "已複製 ✓" : "複製 Markdown 結果" }}
      </button>
      <button class="btn-reset" @click="reset">重置</button>
    </div>
  </div>
</template>

<style scoped>
.dupixent {
  max-width: 780px;
  margin: 0 auto;
  padding: 2rem 0 3rem;
  font-size: 0.9rem;
}

/* ── Header ────────────────────────────────────────────────────── */
.dup-header {
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
  min-width: 80px;
  padding: 0.6rem 1rem;
  border-radius: 14px;
  border: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg-soft);
  transition: all 0.3s;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
}
.score-number {
  font-size: 1.8rem;
  font-weight: 800;
  line-height: 1;
  transition: color 0.3s;
}
.score-label {
  font-size: 0.72rem;
  font-weight: 600;
  margin-top: 2px;
}

.score-badge.eligible {
  border-color: #22c55e;
  color: #22c55e;
  box-shadow:
    0 0 0 1px rgba(34, 197, 94, 0.08),
    0 1px 3px rgba(0, 0, 0, 0.04);
}
.score-badge.borderline {
  border-color: #f59e0b;
  color: #f59e0b;
  box-shadow:
    0 0 0 1px rgba(245, 158, 11, 0.08),
    0 1px 3px rgba(0, 0, 0, 0.04);
}
.score-badge.ineligible {
  border-color: var(--vp-c-divider);
  color: var(--vp-c-text-3);
}

/* ── Bar ───────────────────────────────────────────────────────── */
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
.severity-fill.eligible {
  background: linear-gradient(90deg, #22c55e, #16a34a);
}
.severity-fill.borderline {
  background: linear-gradient(90deg, #f59e0b, #d97706);
}
.severity-fill.ineligible {
  background: var(--vp-c-divider);
}

.severity-ticks {
  display: flex;
  justify-content: space-between;
  font-size: 0.68rem;
  color: var(--vp-c-text-3);
  padding: 0 2px;
}
.tick-threshold {
  color: #22c55e;
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
  background: #22c55e;
  border-radius: 1px;
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

/* ── Groups ────────────────────────────────────────────────────── */
.dup-group {
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
  background: linear-gradient(135deg, var(--vp-c-bg-mute), var(--vp-c-bg-soft));
  border: 1px solid var(--vp-c-divider);
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.03);
}
.group-header.criteria {
  border-left: 3px solid #14b8a6;
}
.group-header.additional {
  border-left: 3px solid #6366f1;
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
  padding: 4px 12px;
  border-radius: 999px;
  border: 1px solid var(--vp-c-divider);
  color: var(--vp-c-text-2);
  white-space: nowrap;
  flex-shrink: 0;
  transition: all 0.25s;
}
.group-score-pill.met {
  border-color: #22c55e;
  color: #22c55e;
  background: rgba(34, 197, 94, 0.06);
}

/* ── Item ──────────────────────────────────────────────────────── */
.item-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.dup-item {
  border: 1px solid var(--vp-c-divider);
  border-radius: 10px;
  background: var(--vp-c-bg-soft);
  overflow: hidden;
  transition: all 0.2s;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.03);
}
.dup-item:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}
.dup-item.met {
  border-color: #22c55e;
  box-shadow:
    0 0 0 1px rgba(34, 197, 94, 0.06),
    0 1px 2px rgba(0, 0, 0, 0.03);
}
.dup-item.unmet {
  opacity: 0.65;
}

.item-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.65rem 0.9rem;
  background: var(--vp-c-bg-mute);
  border-bottom: 1px solid var(--vp-c-divider);
}

.item-name-block {
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.item-name {
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--vp-c-text-1);
}
.item-sub {
  font-size: 0.7rem;
  color: var(--vp-c-text-3);
}

.item-status {
  font-size: 1.1rem;
  font-weight: 800;
  min-width: 28px;
  text-align: right;
  transition: all 0.2s;
}
.dup-item.met .item-status {
  color: #22c55e;
  transform: scale(1.1);
}
.dup-item.unmet .item-status {
  color: #ef4444;
}

.item-desc-row {
  padding: 0.55rem 0.9rem 0;
}
.item-desc {
  font-size: 0.78rem;
  color: var(--vp-c-text-2);
  line-height: 1.5;
}

/* ── Presence toggle ───────────────────────────────────────────── */
.presence-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.6rem 0.9rem 0.65rem;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.presence-label {
  font-size: 0.75rem;
  color: var(--vp-c-text-3);
  font-weight: 500;
}

.presence-btns {
  display: flex;
  gap: 4px;
  border-radius: 8px;
  background: var(--vp-c-bg-mute);
  padding: 3px;
}

.presence-btn {
  padding: 5px 18px;
  border-radius: 6px;
  border: 1.5px solid var(--vp-c-divider);
  background: transparent;
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  font-family: inherit;
  transition: all 0.15s;
  color: var(--vp-c-text-3);
}
.presence-btn.yes {
  border-color: rgba(34, 197, 94, 0.2);
  color: rgba(34, 197, 94, 0.5);
}
.presence-btn.yes.active {
  background: #22c55e;
  border-color: #22c55e;
  color: #fff;
  box-shadow: 0 1px 3px rgba(34, 197, 94, 0.25);
}
.presence-btn.no {
  border-color: rgba(239, 68, 68, 0.2);
  color: rgba(239, 68, 68, 0.5);
}
.presence-btn.no.active {
  background: #ef4444;
  border-color: #ef4444;
  color: #fff;
  box-shadow: 0 1px 3px rgba(239, 68, 68, 0.25);
}
.presence-btn:hover:not(.active) {
  background: var(--vp-c-bg-soft);
}
.presence-btn.yes:hover:not(.active) {
  border-color: #22c55e;
  color: #22c55e;
}
.presence-btn.no:hover:not(.active) {
  border-color: #ef4444;
  color: #ef4444;
}
.presence-btn.yes.active {
  background: #22c55e;
  color: #fff;
  box-shadow: 0 1px 3px rgba(34, 197, 94, 0.25);
}
.presence-btn.no.active {
  background: #ef4444;
  color: #fff;
  box-shadow: 0 1px 3px rgba(239, 68, 68, 0.25);
}
.presence-btn:hover:not(.active) {
  color: var(--vp-c-text-1);
  background: var(--vp-c-bg-soft);
}

/* ── SNOT-22 input ─────────────────────────────────────────────── */
.snot-input-row {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.6rem 0.9rem 0.65rem;
  flex-wrap: wrap;
}

.snot-input-wrap {
  display: flex;
  align-items: center;
  gap: 4px;
  border: 1.5px solid var(--vp-c-divider);
  border-radius: 8px;
  padding: 0 10px;
  background: var(--vp-c-bg);
  transition: all 0.15s;
}
.snot-input-wrap:focus-within {
  border-color: var(--vp-c-brand-1);
  box-shadow: 0 0 0 3px rgba(var(--vp-c-brand-rgb), 0.08);
}
.snot-input-wrap.met {
  border-color: #22c55e;
}
.snot-input-wrap.unmet {
  border-color: #ef4444;
}

.snot-input {
  width: 60px;
  border: none;
  background: transparent;
  font-size: 0.9rem;
  font-weight: 700;
  color: var(--vp-c-text-1);
  padding: 0.45rem 0;
  outline: none;
  font-family: inherit;
  -moz-appearance: textfield;
}
.snot-input::-webkit-outer-spin-button,
.snot-input::-webkit-inner-spin-button {
  -webkit-appearance: none;
}

.snot-unit {
  font-size: 0.75rem;
  color: var(--vp-c-text-3);
}

.snot-hint {
  font-size: 0.75rem;
  font-weight: 600;
}
.hint-met {
  color: #22c55e;
}
.hint-unmet {
  color: #ef4444;
}

/* ── Result card ───────────────────────────────────────────────── */
.dup-result {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  padding: 1.25rem 1.5rem;
  border-radius: 14px;
  border: 1px solid var(--vp-c-divider);
  background: linear-gradient(135deg, var(--vp-c-bg-soft), var(--vp-c-bg-mute));
  margin-bottom: 1rem;
  flex-wrap: wrap;
  transition: all 0.3s;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
}

.dup-result.eligible {
  border-color: #22c55e;
  box-shadow:
    0 0 0 1px rgba(34, 197, 94, 0.06),
    0 1px 3px rgba(0, 0, 0, 0.04);
}
.dup-result.borderline {
  border-color: #f59e0b;
  box-shadow:
    0 0 0 1px rgba(245, 158, 11, 0.06),
    0 1px 3px rgba(0, 0, 0, 0.04);
}
.dup-result.ineligible {
  border-color: var(--vp-c-divider);
}

.result-left {
  display: flex;
  align-items: baseline;
  gap: 4px;
  flex-shrink: 0;
}

.result-number {
  font-size: 3.5rem;
  font-weight: 800;
  line-height: 1;
  color: var(--vp-c-text-3);
  transition: all 0.3s;
}
.dup-result.eligible .result-number {
  color: #22c55e;
}
.dup-result.borderline .result-number {
  color: #f59e0b;
}

.result-max {
  font-size: 1.2rem;
  color: var(--vp-c-text-3);
}

.result-right {
  display: flex;
  flex-direction: column;
  gap: 5px;
  flex: 1;
}
.result-level {
  font-size: 1rem;
  font-weight: 700;
  color: var(--vp-c-text-1);
}
.result-advice {
  font-size: 0.82rem;
  color: var(--vp-c-text-2);
  line-height: 1.5;
}

.result-tags {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
  margin-top: 2px;
}
.result-tag {
  font-size: 0.7rem;
  font-weight: 600;
  padding: 3px 10px;
  border-radius: 999px;
  background: rgba(99, 102, 241, 0.08);
  color: #6366f1;
  border: 1px solid rgba(99, 102, 241, 0.2);
  transition: all 0.15s;
}
.result-tag:hover {
  background: rgba(99, 102, 241, 0.14);
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

.detail-section-title {
  padding: 0.45rem 0.9rem;
  font-size: 0.75rem;
  font-weight: 700;
  color: var(--vp-c-brand-1);
  background: var(--vp-c-brand-soft);
  border-bottom: 1px solid var(--vp-c-divider);
}

.detail-row {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.5rem 0.9rem;
  border-bottom: 1px solid var(--vp-c-divider);
  transition: background 0.1s;
}
.detail-row:hover {
  background: var(--vp-c-bg-soft);
}
.detail-row:last-child {
  border-bottom: none;
}

.detail-domain {
  font-size: 0.8rem;
  font-weight: 700;
  color: var(--vp-c-text-1);
  flex-shrink: 0;
  width: 130px;
}
.detail-score {
  font-size: 0.85rem;
  font-weight: 800;
  flex-shrink: 0;
  width: 28px;
  text-align: center;
}
.detail-desc {
  font-size: 0.75rem;
  color: var(--vp-c-text-2);
  line-height: 1.5;
  flex: 1;
  text-align: left;
}

.met-color {
  color: #22c55e;
}
.unmet-color {
  color: #ef4444;
}

/* ── Actions ───────────────────────────────────────────────────── */
.dup-actions {
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
  .dup-header {
    flex-direction: column;
  }
  .score-badge {
    flex-direction: row;
    gap: 0.5rem;
    align-self: flex-start;
  }
  .score-number {
    font-size: 1.4rem;
  }
  .dup-result {
    flex-direction: column;
    gap: 0.75rem;
  }
  .detail-domain {
    width: 90px;
  }
}
</style>
