<script setup lang="ts">
import { ref, computed } from "vue";

// Kt/V Daugirdas II formula:
// R = PostBUN / PreBUN
// t = dialysis time in HOURS
// Kt/V = -ln(R - 0.008 × t) + (4 - 3.5 × R) × UF / W
// UF = ultrafiltrate removed (L)
// W  = post-dialysis weight (kg)
// Target: Kt/V ≥ 1.2 (KDOQI minimum)

const preBunVal = ref("");
const postBunVal = ref("");
const postWtVal = ref("");
const ufVal = ref("");
const dialTimeVal = ref(""); // minutes
const copied = ref(false);
const showResults = ref(false);

const Pre = computed(() => {
  const v = parseFloat(preBunVal.value);
  return isNaN(v) || v <= 0 ? null : v;
});
const Post = computed(() => {
  const v = parseFloat(postBunVal.value);
  return isNaN(v) || v <= 0 ? null : v;
});
const W = computed(() => {
  const v = parseFloat(postWtVal.value);
  return isNaN(v) || v <= 0 ? null : v;
});
const UF = computed(() => {
  const v = parseFloat(ufVal.value);
  return isNaN(v) || v < 0 ? null : v;
});
const Tmin = computed(() => {
  const v = parseFloat(dialTimeVal.value);
  return isNaN(v) || v <= 0 ? null : v;
});

const isComplete = computed(
  () =>
    Pre.value !== null &&
    Post.value !== null &&
    W.value !== null &&
    UF.value !== null &&
    Tmin.value !== null,
);

const R = computed(() =>
  Pre.value !== null && Post.value !== null ? Post.value / Pre.value : null,
);

const Thr = computed(() => (Tmin.value !== null ? Tmin.value / 60 : null));

const ktv = computed(() => {
  if (!isComplete.value || R.value === null || Thr.value === null) return null;
  const inner = R.value - 0.008 * Thr.value;
  if (inner <= 0) return null;
  const val = -Math.log(inner) + ((4 - 3.5 * R.value) * UF.value!) / W.value!;
  return Math.round(val * 100) / 100;
});

const urr = computed(() => {
  if (Pre.value === null || Post.value === null || Post.value >= Pre.value)
    return null;
  return Math.round(((Pre.value - Post.value) / Pre.value) * 100 * 10) / 10;
});

// bar fill: Kt/V 0–2 mapped to 0–100%
const barPct = computed(() => {
  if (ktv.value === null) return 0;
  return Math.min((ktv.value / 2) * 100, 100);
});

const adequacy = computed(() => {
  const k = ktv.value;
  if (k === null)
    return {
      label: "尚未計算",
      color: "pending",
      advice: "請輸入所有五個數值以計算 Kt/V 透析充分度",
    };
  if (k >= 1.4)
    return {
      label: "充分透析（優良）",
      color: "normal",
      advice: "Kt/V ≥ 1.4：超過 KDOQI 最低標準，透析充足",
    };
  if (k >= 1.2)
    return {
      label: "充分透析（達標）",
      color: "mild",
      advice: "Kt/V ≥ 1.2：達到 KDOQI 最低目標",
    };
  if (k >= 1.0)
    return {
      label: "邊緣不足",
      color: "moderate",
      advice: "Kt/V 1.0–1.2：接近但未達目標，需優化透析處方",
    };
  return {
    label: "透析不足",
    color: "critical",
    advice: "Kt/V < 1.0：嚴重不足，發病率和死亡率顯著增加",
  };
});

function generateOutput() {
  return (
    `# Kt/V 透析充分度（Daugirdas II）\n\n` +
    `## 輸入數值\n\n` +
    `- **透析前 BUN（Pre-BUN）**：${Pre.value ?? "—"} mg/dL\n` +
    `- **透析後 BUN（Post-BUN）**：${Post.value ?? "—"} mg/dL\n` +
    `- **透析後體重（Post-Wt）**：${W.value ?? "—"} kg\n` +
    `- **超濾量（UF）**：${UF.value ?? "—"} L\n` +
    `- **透析時間**：${Tmin.value ?? "—"} 分鐘（${Thr.value?.toFixed(2) ?? "—"} 小時）\n\n` +
    `## 結果\n\n` +
    `- **R = ${R.value?.toFixed(4) ?? "—"}**\n` +
    `- **Kt/V = ${ktv.value ?? "—"}**\n` +
    `- **URR = ${urr.value ?? "—"}%**\n` +
    `- 評估：${adequacy.value.label}\n` +
    `- ${adequacy.value.advice}`
  );
}

async function copyOutput() {
  await navigator.clipboard.writeText(generateOutput());
  copied.value = true;
  setTimeout(() => (copied.value = false), 2000);
}

function reset() {
  preBunVal.value = "";
  postBunVal.value = "";
  postWtVal.value = "";
  ufVal.value = "";
  dialTimeVal.value = "";
  showResults.value = false;
}
</script>

<template>
  <div class="ktv">
    <!-- ── Header ─────────────────────────────────────────────── -->
    <div class="ktv-header">
      <div class="header-title">
        <h2 class="title">Kt/V 透析充分度</h2>
        <p class="subtitle">
          Daugirdas II · Hemodialysis Adequacy · KDOQI 標準評估 · 目標 Kt/V ≥
          1.2
        </p>
      </div>
      <div class="score-badge" :class="adequacy.color">
        <span class="score-number">{{ ktv !== null ? ktv : "—" }}</span>
        <span class="score-unit" v-if="ktv !== null">Kt/V</span>
        <span class="score-label">{{ adequacy.label }}</span>
      </div>
    </div>

    <!-- ── Severity bar ───────────────────────────────────────── -->
    <div class="severity-bar-wrap">
      <div class="severity-bar">
        <div
          class="severity-fill"
          :class="adequacy.color"
          :style="{ width: barPct + '%' }"
        />
        <!-- KDOQI target marker at 1.2 → aligns with tick -->
        <div class="bar-target-line" />
      </div>
      <div class="severity-ticks-abs">
        <span class="tick-abs" style="left: 0%">0</span>
        <span class="tick-abs red" style="left: 50%">1.0</span>
        <span class="tick-abs yellow" style="left: 60%">1.2 ▾</span>
        <span class="tick-abs green" style="left: 70%">1.4</span>
        <span class="tick-abs" style="left: 100%">2.0+</span>
      </div>
      <div class="severity-labels-abs">
        <span class="label-abs" style="left: 0%"></span>
        <span class="label-abs red" style="left: 50%">邊緣</span>
        <span class="label-abs yellow" style="left: 60%">達標</span>
        <span class="label-abs green" style="left: 70%">優良</span>
        <span class="label-abs" style="left: 100%"></span>
      </div>
    </div>

    <!-- ── Input Group ────────────────────────────────────────── -->
    <div class="nihss-group">
      <div class="group-header-bar ktv-bar">
        <span class="group-icon">💉</span>
        <span class="group-label-text">數值輸入</span>
        <span class="group-sub-text"
          >BUN — mg/dL · Weight — kg · UF — L · Time — min</span
        >
        <span class="group-score-tally ktv-tally">
          {{ ktv !== null ? "Kt/V = " + ktv : "—" }}
        </span>
      </div>

      <div class="group-items">
        <!-- Pre-BUN -->
        <div
          class="nihss-item"
          :class="{ scored: Pre !== null, 'ktv-scored': Pre !== null }"
        >
          <div class="item-header">
            <div class="item-meta-row">
              <span class="item-qnum ktv-qnum">Pre</span>
            </div>
            <div class="item-name-block">
              <span class="item-name">透析前 BUN（Pre-dialysis BUN）</span>
              <span class="item-sub"
                >透析開始前抽血，代表未清除的尿素氮基線值</span
              >
            </div>
            <span class="item-score" :class="{ zero: Pre === null }">
              {{ Pre !== null ? Pre + " mg/dL" : "—" }}
            </span>
          </div>
          <div class="input-row">
            <input
              v-model="preBunVal"
              type="number"
              min="1"
              max="300"
              step="0.1"
              placeholder="mg/dL"
              class="ktv-input"
            />
            <span class="input-unit">mg/dL</span>
          </div>
        </div>

        <!-- Post-BUN -->
        <div
          class="nihss-item"
          :class="{ scored: Post !== null, 'ktv-scored': Post !== null }"
        >
          <div class="item-header">
            <div class="item-meta-row">
              <span class="item-qnum ktv-qnum">Post</span>
            </div>
            <div class="item-name-block">
              <span class="item-name">透析後 BUN（Post-dialysis BUN）</span>
              <span class="item-sub"
                >透析結束後 30 秒–1 分鐘抽血，避免再循環干擾</span
              >
            </div>
            <span class="item-score" :class="{ zero: Post === null }">
              {{ Post !== null ? Post + " mg/dL" : "—" }}
            </span>
          </div>
          <div class="input-row">
            <input
              v-model="postBunVal"
              type="number"
              min="1"
              max="300"
              step="0.1"
              placeholder="mg/dL"
              class="ktv-input"
            />
            <span class="input-unit">mg/dL</span>
          </div>
        </div>

        <!-- Post-Weight -->
        <div
          class="nihss-item"
          :class="{ scored: W !== null, 'ktv-scored': W !== null }"
        >
          <div class="item-header">
            <div class="item-meta-row">
              <span class="item-qnum ktv-qnum">Wt</span>
            </div>
            <div class="item-name-block">
              <span class="item-name">透析後體重（Post-dialysis Weight）</span>
              <span class="item-sub"
                >透析結束後測量的乾體重，用於計算分佈容積</span
              >
            </div>
            <span class="item-score" :class="{ zero: W === null }">
              {{ W !== null ? W + " kg" : "—" }}
            </span>
          </div>
          <div class="input-row">
            <input
              v-model="postWtVal"
              type="number"
              min="20"
              max="200"
              step="0.1"
              placeholder="kg"
              class="ktv-input"
            />
            <span class="input-unit">kg</span>
          </div>
        </div>

        <!-- UF Volume -->
        <div
          class="nihss-item"
          :class="{ scored: UF !== null, 'ktv-scored': UF !== null }"
        >
          <div class="item-header">
            <div class="item-meta-row">
              <span class="item-qnum ktv-qnum">UF</span>
            </div>
            <div class="item-name-block">
              <span class="item-name">超濾量（Ultrafiltrate Removed）</span>
              <span class="item-sub"
                >本次透析移除的液體總量，由透析機記錄取得</span
              >
            </div>
            <span class="item-score" :class="{ zero: UF === null }">
              {{ UF !== null ? UF + " L" : "—" }}
            </span>
          </div>
          <div class="input-row">
            <input
              v-model="ufVal"
              type="number"
              min="0"
              max="10"
              step="0.1"
              placeholder="L"
              class="ktv-input"
            />
            <span class="input-unit">L</span>
          </div>
        </div>

        <!-- Dial Time -->
        <div
          class="nihss-item"
          :class="{ scored: Tmin !== null, 'ktv-scored': Tmin !== null }"
        >
          <div class="item-header">
            <div class="item-meta-row">
              <span class="item-qnum ktv-qnum">Time</span>
            </div>
            <div class="item-name-block">
              <span class="item-name">透析時間（Dialysis Duration）</span>
              <span class="item-sub"
                >實際有效透析時間，輸入分鐘，公式內自動轉換為小時</span
              >
            </div>
            <span class="item-score" :class="{ zero: Tmin === null }">
              {{ Tmin !== null ? Tmin + " min" : "—" }}
            </span>
          </div>
          <div class="input-row">
            <input
              v-model="dialTimeVal"
              type="number"
              min="60"
              max="480"
              step="1"
              placeholder="分鐘"
              class="ktv-input"
            />
            <span class="input-unit">分鐘</span>
          </div>
        </div>

        <!-- URR (derived, read-only) -->
        <div class="nihss-item ktv-derived-item" v-if="urr !== null">
          <div class="item-header">
            <div class="item-meta-row">
              <span class="item-qnum ktv-qnum">URR</span>
            </div>
            <div class="item-name-block">
              <span class="item-name"
                >尿素降低率 Urea Reduction Ratio（自動計算）</span
              >
              <span class="item-sub"
                >URR = (Pre − Post) / Pre × 100，KDOQI 目標 ≥ 65%</span
              >
            </div>
            <span class="item-score" :class="{ zero: urr === null }">
              {{ urr !== null ? urr + "%" : "—" }}
              <span class="urr-tag" :class="urr >= 65 ? 'urr-ok' : 'urr-low'">
                {{ urr >= 65 ? "達標" : "未達標" }}
              </span>
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- ── Formula display ────────────────────────────────────── -->
    <div class="formula-box" v-if="isComplete && ktv !== null">
      <span class="formula-label">計算過程：</span>
      <span class="formula-text">
        R = {{ Post }} / {{ Pre }} = {{ R?.toFixed(4) }} ； t = {{ Tmin }} / 60
        = {{ Thr?.toFixed(4) }} hr ； Kt/V = −ln({{ R?.toFixed(4) }} − 0.008 ×
        {{ Thr?.toFixed(4) }}) + (4 − 3.5 × {{ R?.toFixed(4) }}) × {{ UF }} /
        {{ W }} = <strong>{{ ktv }}</strong>
      </span>
    </div>

    <!-- ── Reference table ───────────────────────────────────── -->
    <div class="ref-table">
      <div class="rt-row rt-header">
        <span>Kt/V</span><span>評估</span><span>對應 URR</span>
      </div>
      <div class="rt-row" :class="{ 'rt-active': ktv !== null && ktv >= 1.4 }">
        <span class="rt-s normal-t">≥ 1.4</span>
        <span>充分透析（優良）</span>
        <span class="rt-sm">≥ 72%</span>
      </div>
      <div
        class="rt-row"
        :class="{ 'rt-active': ktv !== null && ktv >= 1.2 && ktv < 1.4 }"
      >
        <span class="rt-s mild-t">1.2–1.4</span>
        <span>充分透析（KDOQI 達標）</span>
        <span class="rt-sm">65–72%</span>
      </div>
      <div
        class="rt-row"
        :class="{ 'rt-active': ktv !== null && ktv >= 1.0 && ktv < 1.2 }"
      >
        <span class="rt-s moderate-t">1.0–1.2</span>
        <span>邊緣不足</span>
        <span class="rt-sm">58–65%</span>
      </div>
      <div class="rt-row" :class="{ 'rt-active': ktv !== null && ktv < 1.0 }">
        <span class="rt-s critical-t">&lt; 1.0</span>
        <span>嚴重透析不足</span>
        <span class="rt-sm">&lt; 58%</span>
      </div>
    </div>

    <!-- ── Result card ────────────────────────────────────────── -->
    <div class="nihss-result" :class="adequacy.color">
      <div class="result-left">
        <span class="result-number">{{ ktv !== null ? ktv : "—" }}</span>
        <span class="result-max" v-if="ktv !== null">Kt/V</span>
      </div>
      <div class="result-right">
        <span class="result-level">{{ adequacy.label }}</span>
        <span class="result-advice">{{ adequacy.advice }}</span>
        <span class="result-sub" v-if="urr !== null">
          URR = <strong>{{ urr }}%</strong>（{{
            urr >= 65 ? "✓ 達標" : "✗ 未達標，目標 ≥ 65%"
          }}）
        </span>
      </div>
    </div>

    <!-- ── Clinical note ──────────────────────────────────────── -->
    <div class="warn-box">
      <span class="warn-icon">⚠</span>
      <span
        >Daugirdas II 公式適用於每週三次血液透析患者。透析後 BUN 應在血流停止 30
        秒後採樣以避免再循環干擾。單獨 Kt/V
        不能完全反映透析充分度，需結合臨床症狀及血磷、血鉀控制情況評估。</span
      >
    </div>

    <!-- ── Results detail ─────────────────────────────────────── -->
    <div v-if="showResults" class="results-detail">
      <div class="results-header">評估明細</div>

      <div class="detail-row">
        <span class="detail-qnum">Pre</span>
        <span class="detail-domain">透析前 BUN（Pre-dialysis BUN）</span>
        <span class="detail-score">{{ Pre !== null ? Pre : "—" }}</span>
        <span class="detail-desc">mg/dL</span>
      </div>

      <div class="detail-row">
        <span class="detail-qnum">Post</span>
        <span class="detail-domain">透析後 BUN（Post-dialysis BUN）</span>
        <span class="detail-score">{{ Post !== null ? Post : "—" }}</span>
        <span class="detail-desc">mg/dL</span>
      </div>

      <div class="detail-row">
        <span class="detail-qnum">Wt</span>
        <span class="detail-domain">透析後體重（Post-dialysis Weight）</span>
        <span class="detail-score">{{ W !== null ? W : "—" }}</span>
        <span class="detail-desc">kg</span>
      </div>

      <div class="detail-row">
        <span class="detail-qnum">UF</span>
        <span class="detail-domain">超濾量（Ultrafiltrate Removed）</span>
        <span class="detail-score">{{ UF !== null ? UF : "—" }}</span>
        <span class="detail-desc">L</span>
      </div>

      <div class="detail-row">
        <span class="detail-qnum">Time</span>
        <span class="detail-domain">透析時間（Dialysis Duration）</span>
        <span class="detail-score">{{ Tmin !== null ? Tmin : "—" }}</span>
        <span class="detail-desc">分鐘</span>
      </div>

      <div class="detail-row">
        <span class="detail-qnum">R</span>
        <span class="detail-domain">BUN 比值（R = Post/Pre）</span>
        <span class="detail-score">{{ R !== null ? R.toFixed(3) : "—" }}</span>
        <span class="detail-desc">ratio</span>
      </div>

      <div class="detail-row">
        <span class="detail-qnum">URR</span>
        <span class="detail-domain">尿素降低率（Urea Reduction Ratio）</span>
        <span class="detail-score">{{ urr !== null ? urr : "—" }}</span>
        <span class="detail-desc">%</span>
      </div>

      <div class="detail-row detail-total">
        <span class="detail-qnum">Kt/V</span>
        <span class="detail-domain">透析充分度（最終結果）</span>
        <span class="detail-score detail-score-brand">{{
          ktv !== null ? ktv : "—"
        }}</span>
        <div class="detail-desc detail-desc-block">
          <span class="detail-desc-unit">Kt/V</span>
          <span class="detail-desc-label">{{ adequacy.label }}</span>
        </div>
      </div>
    </div>

    <!-- ── Actions ────────────────────────────────────────────── -->
    <div class="nihss-actions">
      <button class="btn-view" @click="showResults = !showResults">
        {{ showResults ? "收起明細" : "查看評估結果" }}
      </button>
      <button class="btn-copy" :disabled="!isComplete" @click="copyOutput">
        {{ copied ? "已複製 ✓" : "複製 Markdown 結果" }}
      </button>
      <button class="btn-reset" @click="reset">重置</button>
    </div>
  </div>
</template>

<style scoped>
.ktv {
  max-width: 780px;
  margin: 0 auto;
  padding: 2rem 0 3rem;
  font-size: 0.9rem;
}

/* ── Header ────────────────────────────────────────────────────── */
.ktv-header {
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
  line-height: 1.6;
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
  font-size: 2rem;
  font-weight: 800;
  line-height: 1;
}
.score-unit {
  font-size: 0.72rem;
  font-weight: 600;
  margin-top: 1px;
}
.score-label {
  font-size: 0.65rem;
  font-weight: 600;
  margin-top: 3px;
  letter-spacing: 0.02em;
  text-align: center;
}

.score-badge.pending {
  border-color: var(--vp-c-divider);
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
  border-color: #f97316;
  color: #f97316;
  box-shadow:
    0 0 0 1px rgba(249, 115, 22, 0.08),
    0 1px 3px rgba(0, 0, 0, 0.04);
}
.score-badge.critical {
  border-color: #ef4444;
  color: #ef4444;
  box-shadow:
    0 0 0 1px rgba(239, 68, 68, 0.08),
    0 1px 3px rgba(0, 0, 0, 0.04);
}

/* ── Severity bar ──────────────────────────────────────────────── */
.severity-bar-wrap {
  margin-bottom: 2rem;
}

.severity-bar {
  position: relative;
  height: 8px;
  border-radius: 999px;
  background: var(--vp-c-bg-mute);
  overflow: visible;
  margin-bottom: 4px;
  box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.08);
}

.severity-fill {
  height: 100%;
  border-radius: 999px;
  transition:
    width 0.4s ease,
    background 0.3s;
}
.severity-fill.pending {
  background: var(--vp-c-divider);
}
.severity-fill.normal {
  background: linear-gradient(90deg, #22c55e, #4ade80);
}
.severity-fill.mild {
  background: linear-gradient(90deg, #f59e0b, #fbbf24);
}
.severity-fill.moderate {
  background: linear-gradient(90deg, #f97316, #fb923c);
}
.severity-fill.critical {
  background: linear-gradient(90deg, #ef4444, #f87171);
}

/* KDOQI target marker — aligns with the 1.2 ▾ tick at 60% */
.bar-target-line {
  position: absolute;
  top: -3px;
  left: 60%;
  width: 2px;
  height: 12px;
  background: rgba(34, 197, 94, 0.8);
  transform: translateX(-50%);
  border-radius: 1px;
}

.severity-ticks-abs,
.severity-labels-abs {
  position: relative;
  height: 14px;
  margin-top: 2px;
}
.severity-labels-abs {
  margin-top: 0px;
  height: 13px;
}

.tick-abs {
  position: absolute;
  transform: translateX(-50%);
  font-size: 0.65rem;
  color: var(--vp-c-text-3);
  white-space: nowrap;
  font-weight: 700;
}
.tick-abs[style*="left: 0%"] {
  transform: translateX(0);
}
.tick-abs[style*="left: 100%"] {
  transform: translateX(-100%);
}

.label-abs {
  position: absolute;
  transform: translateX(-50%);
  font-size: 0.63rem;
  color: var(--vp-c-text-3);
  white-space: nowrap;
}
.label-abs[style*="left: 0%"] {
  transform: translateX(0);
}
.label-abs[style*="left: 100%"] {
  transform: translateX(-100%);
}

.tick-abs.red,
.label-abs.red {
  color: #ef4444;
}
.tick-abs.yellow,
.label-abs.yellow {
  color: #f59e0b;
}
.tick-abs.green,
.label-abs.green {
  color: #22c55e;
}

/* ── Groups ────────────────────────────────────────────────────── */
.nihss-group {
  margin-bottom: 1.75rem;
}

.group-header-bar {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.55rem 0.85rem;
  border-radius: 8px;
  background: var(--vp-c-bg-mute);
  border: 1px solid var(--vp-c-divider);
  border-left: 3px solid #0d9488;
  margin-bottom: 0.6rem;
}
.ktv-bar {
  border-left: 3px solid #a855f7;
}

.group-icon {
  font-size: 1rem;
  flex-shrink: 0;
}
.group-label-text {
  font-size: 0.88rem;
  font-weight: 800;
  color: var(--vp-c-text-1);
}
.group-sub-text {
  font-size: 0.7rem;
  color: var(--vp-c-text-3);
  flex: 1;
}

.group-score-tally {
  font-size: 0.75rem;
  font-weight: 700;
  padding: 2px 8px;
  border-radius: 999px;
  flex-shrink: 0;
}
.ktv-tally {
  color: #a855f7;
  background: rgba(168, 85, 247, 0.12);
}

.group-items {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

/* ── Item card ─────────────────────────────────────────────────── */
.nihss-item {
  border: 1px solid var(--vp-c-divider);
  border-radius: 10px;
  background: var(--vp-c-bg-soft);
  overflow: hidden;
  transition: all 0.25s;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.03);
}
.nihss-item:hover {
  box-shadow: 0 3px 12px rgba(0, 0, 0, 0.06);
  border-color: var(--vp-c-divider);
}
.nihss-item.ktv-scored {
  border-color: #a855f7;
}
.nihss-item.ktv-derived-item {
  border-color: var(--vp-c-divider);
  opacity: 0.85;
}

.item-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  padding: 0.6rem 0.9rem;
  background: var(--vp-c-bg-mute);
  border-bottom: 1px solid var(--vp-c-divider);
  gap: 0.75rem;
}
.nihss-item.ktv-derived-item .item-header {
  border-bottom: none;
}

.item-meta-row {
  display: flex;
  align-items: center;
  flex-shrink: 0;
  padding-top: 3px;
}

.item-qnum {
  font-size: 0.68rem;
  font-weight: 800;
  padding: 1px 6px;
  border-radius: 999px;
  letter-spacing: 0.03em;
  white-space: nowrap;
}
.ktv-qnum {
  color: #a855f7;
  background: rgba(168, 85, 247, 0.12);
}

.item-name-block {
  display: flex;
  flex-direction: column;
  gap: 2px;
  flex: 1;
}
.item-name {
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--vp-c-text-1);
}
.item-sub {
  font-size: 0.72rem;
  color: var(--vp-c-text-3);
}

.item-score {
  font-size: 0.85rem;
  font-weight: 800;
  color: #a855f7;
  min-width: 28px;
  text-align: right;
  white-space: nowrap;
  display: flex;
  align-items: center;
  gap: 4px;
}
.item-score.zero {
  color: var(--vp-c-text-3);
}

/* URR tag inside item-score */
.urr-tag {
  font-size: 0.62rem;
  font-weight: 700;
  padding: 1px 5px;
  border-radius: 999px;
}
.urr-ok {
  color: #22c55e;
  background: rgba(34, 197, 94, 0.12);
}
.urr-low {
  color: #ef4444;
  background: rgba(239, 68, 68, 0.12);
}

/* ── Input row ─────────────────────────────────────────────────── */
.input-row {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.65rem 0.9rem;
}

.ktv-input {
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
.ktv-input::-webkit-outer-spin-button,
.ktv-input::-webkit-inner-spin-button {
  -webkit-appearance: none;
}
.ktv-input:focus {
  border-color: #a855f7;
}
.ktv-input::placeholder {
  color: var(--vp-c-text-3);
  font-size: 0.82rem;
}

.input-unit {
  font-size: 0.78rem;
  font-weight: 600;
  color: var(--vp-c-text-3);
  flex-shrink: 0;
}

/* ── Formula box ───────────────────────────────────────────────── */
.formula-box {
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
.formula-label {
  font-weight: 700;
  color: var(--vp-c-text-2);
  flex-shrink: 0;
}
.formula-text {
  color: var(--vp-c-text-2);
  font-family: monospace;
  line-height: 1.7;
}

/* ── Reference table ───────────────────────────────────────────── */
.ref-table {
  border: 1px solid var(--vp-c-divider);
  border-radius: 10px;
  overflow: hidden;
  margin-bottom: 1rem;
}
.rt-row {
  display: grid;
  grid-template-columns: 90px 1fr 80px;
  gap: 0.5rem;
  padding: 0.4rem 0.9rem;
  border-bottom: 1px solid var(--vp-c-divider);
  font-size: 0.78rem;
  align-items: center;
}
.rt-row:last-child {
  border-bottom: none;
}
.rt-header {
  background: var(--vp-c-bg-mute);
  font-size: 0.7rem;
  font-weight: 700;
  color: var(--vp-c-text-3);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}
.rt-active {
  background: var(--vp-c-brand-soft);
}
.rt-s {
  font-weight: 800;
  font-family: monospace;
}
.normal-t {
  color: #22c55e;
}
.mild-t {
  color: #f59e0b;
}
.moderate-t {
  color: #f97316;
}
.critical-t {
  color: #ef4444;
}
.rt-sm {
  font-size: 0.7rem;
  color: var(--vp-c-text-3);
}

/* ── Result card ───────────────────────────────────────────────── */
.nihss-result {
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
.nihss-result.pending {
  border-color: var(--vp-c-divider);
}
.nihss-result.normal {
  border-color: #22c55e;
  box-shadow:
    0 0 0 1px rgba(34, 197, 94, 0.06),
    0 1px 3px rgba(0, 0, 0, 0.04);
}
.nihss-result.mild {
  border-color: #f59e0b;
  box-shadow:
    0 0 0 1px rgba(245, 158, 11, 0.06),
    0 1px 3px rgba(0, 0, 0, 0.04);
}
.nihss-result.moderate {
  border-color: #f97316;
  box-shadow:
    0 0 0 1px rgba(249, 115, 22, 0.06),
    0 1px 3px rgba(0, 0, 0, 0.04);
}
.nihss-result.critical {
  border-color: #ef4444;
  box-shadow:
    0 0 0 1px rgba(239, 68, 68, 0.06),
    0 1px 3px rgba(0, 0, 0, 0.04);
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
  transition: color 0.3s;
}
.nihss-result.normal .result-number {
  color: #22c55e;
}
.nihss-result.mild .result-number {
  color: #f59e0b;
}
.nihss-result.moderate .result-number {
  color: #f97316;
}
.nihss-result.critical .result-number {
  color: #ef4444;
}

.result-max {
  font-size: 1rem;
  color: var(--vp-c-text-3);
}
.result-right {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.result-level {
  font-size: 1rem;
  font-weight: 700;
  color: var(--vp-c-text-1);
}
.result-advice {
  font-size: 0.85rem;
  color: var(--vp-c-text-2);
  line-height: 1.5;
}
.result-sub {
  font-size: 0.8rem;
  color: var(--vp-c-brand-1);
}

/* ── Warning / clinical note ───────────────────────────────────── */
.warn-box {
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
.warn-icon {
  color: #f97316;
  flex-shrink: 0;
  font-size: 0.9rem;
}

/* ── Results detail ────────────────────────────────────────────── */
.results-detail {
  border: 1px solid var(--vp-c-divider);
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
  align-items: flex-start;
  gap: 0.6rem;
  padding: 0.5rem 0.9rem;
  border-bottom: 1px solid var(--vp-c-divider);
}
.detail-row:last-child {
  border-bottom: none;
}
.detail-total {
  background: var(--vp-c-bg-mute);
}

.detail-qnum {
  font-size: 0.7rem;
  font-weight: 800;
  color: #a855f7;
  flex-shrink: 0;
  width: 44px;
  padding-top: 1px;
}
.detail-domain {
  font-size: 0.78rem;
  font-weight: 700;
  color: var(--vp-c-text-1);
  flex: 1;
  line-height: 1.5;
}

.detail-score {
  font-size: 0.82rem;
  font-weight: 800;
  color: var(--vp-c-brand-1);
  flex-shrink: 0;
  width: 52px;
  text-align: right;
  white-space: normal;
}
.detail-score-brand {
  color: var(--vp-c-brand-1);
}

.detail-desc {
  font-size: 0.75rem;
  color: var(--vp-c-text-2);
  flex-shrink: 0;
  width: 80px;
  text-align: left;
  white-space: normal;
}

.detail-desc-block {
  display: flex;
  flex-direction: column;
  gap: 1px;
  width: 80px;
  flex-shrink: 0;
}
.detail-desc-unit {
  font-size: 0.75rem;
  color: var(--vp-c-text-2);
}
.detail-desc-label {
  font-size: 0.73rem;
  font-weight: 700;
  color: var(--vp-c-brand-1);
  white-space: normal;
}

/* ── Actions ───────────────────────────────────────────────────── */
.nihss-actions {
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
  .ktv-header {
    flex-direction: column;
  }
  .score-badge {
    flex-direction: row;
    gap: 0.5rem;
    align-self: flex-start;
  }
  .score-number {
    font-size: 1.5rem;
  }
  .nihss-result {
    flex-direction: column;
    gap: 0.75rem;
  }
  .rt-row {
    grid-template-columns: 80px 1fr;
  }
  .rt-row span:last-child {
    display: none;
  }
}
</style>
