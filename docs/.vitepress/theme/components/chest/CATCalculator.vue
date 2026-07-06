<script setup lang="ts">
import { ref, computed } from "vue";

// COPD Assessment Test — 8 items, each 0–5, total 0–40.
const questions = [
  { key: "cough", name: "咳嗽", left: "我從不咳嗽", right: "我一直在咳嗽" },
  {
    key: "phlegm",
    name: "痰液",
    left: "我的胸腔完全沒有痰",
    right: "我的胸腔裡全是痰",
  },
  {
    key: "tight",
    name: "胸悶",
    left: "我的胸部完全沒有壓迫感",
    right: "我的胸部有非常嚴重的壓迫感",
  },
  {
    key: "breath",
    name: "爬坡 / 爬樓梯喘息",
    left: "爬坡或爬一層樓梯時，我不會喘",
    right: "爬坡或爬一層樓梯時，我非常喘",
  },
  {
    key: "activity",
    name: "居家活動受限",
    left: "我做家裡的事情不受任何限制",
    right: "我做家裡的事情受到非常大的限制",
  },
  {
    key: "confidence",
    name: "離家信心",
    left: "儘管有肺部疾病，我對出門有信心",
    right: "因為我的肺部疾病，我對離家一點信心都沒有",
  },
  {
    key: "sleep",
    name: "睡眠",
    left: "我睡得很好",
    right: "因為我的肺部疾病，我睡得很差",
  },
  { key: "energy", name: "精力", left: "我精力充沛", right: "我完全沒有精力" },
];

const activeTab = ref<"cat">("cat");
const sel = ref<Record<string, number>>(
  Object.fromEntries(questions.map((q) => [q.key, -1])),
);
const showResults = ref(false);
const copied = ref(false);

const answered = computed(
  () => questions.filter((q) => sel.value[q.key] >= 0).length,
);
const isComplete = computed(() => answered.value === 8);
const total = computed(() =>
  questions.reduce((s, q) => s + Math.max(sel.value[q.key], 0), 0),
);

const result = computed(() => {
  if (!isComplete.value)
    return {
      level: "填寫中",
      color: "filling",
      tag: `${answered.value}/8 題`,
      advice: "請完成全部 8 題以計算 CAT 總分。",
    };
  const s = total.value;
  if (s <= 10)
    return {
      level: "低度影響",
      color: "normal",
      tag: "Low Impact",
      advice:
        "COPD 症狀對日常生活影響輕微。維持戒菸、規律用藥與運動即可，定期追蹤。",
    };
  if (s <= 20)
    return {
      level: "中度影響",
      color: "mild",
      tag: "Medium Impact",
      advice:
        "COPD 對日常生活有明顯影響，多數日子感到喘息、活動受限。應檢視吸入劑技巧與治療是否足夠。",
    };
  if (s <= 30)
    return {
      level: "高度影響",
      color: "moderate",
      tag: "High Impact",
      advice:
        "COPD 嚴重影響日常功能，常感疲憊與持續喘息。建議強化藥物治療並評估肺復原。",
    };
  return {
    level: "極高度影響",
    color: "severe",
    tag: "Very High Impact",
    advice:
      "COPD 對生活品質造成極嚴重影響，幾乎每天受症狀困擾。建議積極治療、肺復原並評估合併症。",
  };
});

const opts = [0, 1, 2, 3, 4, 5];
function reset() {
  questions.forEach((q) => (sel.value[q.key] = -1));
  showResults.value = false;
}
function generateMarkdown() {
  const lines = questions
    .map(
      (q) =>
        `- **${q.name}**：${sel.value[q.key] >= 0 ? sel.value[q.key] : "未填"} / 5`,
    )
    .join("\n");
  return `# CAT 慢性阻塞性肺病評估測試結果\n\n## 各項評分\n\n${lines}\n\n---\n\n## 摘要\n\n- **CAT 總分**：${total.value} / 40\n- **影響程度**：${result.value.level}（${result.value.tag}）\n- **建議**：${result.value.advice}`;
}
async function copyMarkdown() {
  await navigator.clipboard.writeText(generateMarkdown());
  copied.value = true;
  setTimeout(() => (copied.value = false), 2000);
}
</script>

<template>
  <div class="catassess">
    <div class="tab-bar">
      <button
        class="tab-btn"
        :class="{ active: activeTab === 'cat' }"
        @click="activeTab = 'cat'"
      >
        <span class="tab-label">CAT 慢性阻塞性肺病評估</span>
        <span class="tab-sub">COPD Assessment Test</span>
      </button>
    </div>

    <div v-show="activeTab === 'cat'" class="cat">
      <div class="sb-header">
        <div class="header-title">
          <h2 class="title">CAT 評估</h2>
          <p class="subtitle">
            COPD Assessment Test · 慢性阻塞性肺病症狀影響量表（8 題 · 0–40）
          </p>
        </div>
        <div class="score-badge" :class="result.color">
          <span class="score-number">{{ isComplete ? total : "—" }}</span>
          <span class="score-label">{{ result.tag }}</span>
        </div>
      </div>

      <div class="severity-bar-wrap">
        <div class="severity-bar">
          <div
            class="severity-fill"
            :class="result.color"
            :style="{ width: isComplete ? (total / 40) * 100 + '%' : '0%' }"
          />
        </div>
        <div class="severity-ticks">
          <span class="tk-normal">0</span><span class="tk-mild">10</span
          ><span class="tk-moderate">20</span><span class="tk-severe">30</span
          ><span class="tk-severe">40</span>
        </div>
      </div>

      <div class="intro-bar">
        <span class="intro-dot">◆</span>
        <span
          >每項描述請依當前狀況於 <strong>0–5</strong> 之間評分（0
          為完全沒有、5
          為極嚴重），共 8 題。CAT 反映 COPD 對日常生活的整體影響，適合門診追蹤症狀變化與治療反應。</span
        >
      </div>

      <div class="sb-group">
        <div class="group-header cat-group-header">
          <div class="group-label-block">
            <span class="group-label">CAT 症狀量表</span>
            <span class="group-sub">8 項 · 每項 0–5</span>
          </div>
          <div class="group-score-pill cat-pill">{{ answered }} / 8 題</div>
        </div>
        <div class="item-list">
          <div
            v-for="(q, idx) in questions"
            :key="q.key"
            class="cat-item"
            :class="{ answered: sel[q.key] >= 0, high: sel[q.key] >= 4 }"
          >
            <div class="item-header">
              <div class="item-meta-row">
                <span class="item-qnum">Q{{ idx + 1 }}</span>
              </div>
              <div class="item-name-block">
                <span class="item-name">{{ q.name }}</span>
              </div>
              <span
                class="item-score"
                :class="{
                  zero: sel[q.key] === 0,
                  high: sel[q.key] >= 4,
                  unanswered: sel[q.key] < 0,
                }"
                >{{ sel[q.key] >= 0 ? sel[q.key] : "—" }}</span
              >
            </div>
            <div class="field-input-wrap">
              <div class="slider-col">
                <div class="item-anchor-row">
                  <span class="anchor-left">{{ q.left }}</span>
                  <span class="anchor-right">{{ q.right }}</span>
                </div>
                <input type="range" min="0" max="5" step="1" class="field-slider" :value="sel[q.key] >= 0 ? sel[q.key] : 0" @input="sel[q.key] = parseInt(($event.target as HTMLInputElement).value)" />
                <div class="field-ticks"><span v-for="n in 6" :key="n">{{ n - 1 }}</span></div>
              </div>
              <input type="number" min="0" max="5" class="field-number" placeholder="—" :value="sel[q.key] >= 0 ? sel[q.key] : ''" @input="sel[q.key] = ($event.target as HTMLInputElement).value === '' ? -1 : Math.max(0, Math.min(5, parseInt(($event.target as HTMLInputElement).value)))" />
            </div>
          </div>
        </div>
      </div>

      <div class="sb-result" :class="result.color">
        <div class="result-left">
          <span class="result-number">{{ isComplete ? total : "—" }}</span>
          <span class="result-max">/ 40</span>
        </div>
        <div class="result-right">
          <div class="result-top">
            <span class="result-level">{{ result.level }}</span>
          </div>
          <span class="result-ahi">{{ result.tag }}</span>
          <span class="result-advice">{{ result.advice }}</span>
        </div>
      </div>

      <div v-if="showResults && isComplete" class="results-detail">
        <div class="results-header">評估明細</div>
        <div v-for="(q, idx) in questions" :key="q.key" class="detail-row">
          <span class="detail-letter">Q{{ idx + 1 }}</span>
          <span class="detail-domain">{{ q.name }}</span>
          <span class="detail-score" :class="{ positive: sel[q.key] >= 4 }"
            >{{ sel[q.key] }} / 5</span
          >
        </div>
        <div class="detail-row total-row">
          <span class="detail-letter brand-sm">∑</span>
          <span class="detail-domain">CAT 總分</span>
          <span class="detail-score positive">{{ total }} / 40</span>
          <span class="detail-desc">{{ result.level }}</span>
        </div>
      </div>

      <div class="sb-actions">
        <button
          class="btn-view"
          :disabled="!isComplete"
          @click="showResults = !showResults"
        >
          {{ showResults ? "收起明細" : "查看評估結果" }}
        </button>
        <button class="btn-copy" :disabled="!isComplete" @click="copyMarkdown">
          {{ copied ? "已複製 ✓" : "複製 Markdown 結果" }}
        </button>
        <button class="btn-reset" @click="reset">重置</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.catassess {
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
  font-weight: 400;
  color: var(--vp-c-text-3);
  margin-top: 2px;
}
.tab-btn.active .tab-sub {
  color: var(--vp-c-brand-1);
  opacity: 0.85;
}
.cat {
  max-width: 780px;
  margin: 0 auto;
  padding: 2rem 0 3rem;
  font-size: 0.9rem;
}
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
  font-size: 2.2rem;
  font-weight: 800;
  line-height: 1;
}
.score-label {
  font-size: 0.64rem;
  font-weight: 700;
  margin-top: 3px;
  text-align: center;
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
.score-badge.filling {
  color: var(--vp-c-text-3);
}
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
.cat-group-header {
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
  font-weight: 400;
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
.cat-pill {
  border: 1px solid color-mix(in srgb, var(--vp-c-brand-1) 30%, transparent);
  color: var(--vp-c-brand-1);
  background: color-mix(in srgb, var(--vp-c-brand-1) 6%, transparent);
}
.item-list {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
}
.cat-item {
  border: 1px solid var(--vp-c-divider);
  border-radius: 12px;
  background: var(--vp-c-bg-soft);
  overflow: hidden;
  transition: all 0.25s;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.03);
}
.cat-item.answered {
  border-color: color-mix(in srgb, #22c55e 45%, var(--vp-c-divider));
  background: color-mix(in srgb, rgb(34, 197, 94) 5%, var(--vp-c-bg-soft));
}
.cat-item.answered .item-header {
  background: color-mix(in srgb, rgb(34, 197, 94) 6%, var(--vp-c-bg-mute));
}
.cat-item.high {
  border-color: #ef4444;
  background: color-mix(in srgb, rgb(239, 68, 68) 5%, var(--vp-c-bg-soft));
}
.cat-item.high .item-header {
  background: color-mix(in srgb, rgb(239, 68, 68) 6%, var(--vp-c-bg-mute));
}
.cat-item.high .vas-fill-bar,
.cat-item.high .vas-thumb {
  background: #ef4444;
}
.item-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.6rem 0.9rem 0.55rem;
  background: var(--vp-c-bg-mute);
  border-bottom: 1px solid var(--vp-c-divider);
  gap: 0.75rem;
}
.item-meta-row {
  display: flex;
  align-items: center;
  flex-shrink: 0;
}
.item-qnum {
  font-size: 0.7rem;
  font-weight: 800;
  color: #fff;
  background: var(--vp-c-brand-1);
  padding: 2px 9px;
  border-radius: 999px;
  letter-spacing: 0.04em;
}
.item-name-block {
  display: flex;
  flex-direction: column;
  gap: 2px;
  flex: 1;
}
.item-name {
  font-size: 0.92rem;
  font-weight: 700;
  color: var(--vp-c-text-1);
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
  color: var(--vp-c-text-1);
  transition: all 0.25s;
}
.item-score.zero {
  color: #22c55e;
  border-color: rgba(34, 197, 94, 0.25);
  background: rgba(34, 197, 94, 0.06);
}
.item-score.high {
  color: #ef4444;
  border-color: rgba(239, 68, 68, 0.3);
  background: rgba(239, 68, 68, 0.08);
}
.item-score.unanswered {
  color: var(--vp-c-text-3);
  background: transparent;
}
.item-anchor-row {
  display: flex;
  justify-content: space-between;
  gap: 0.75rem;
  padding: 0.55rem 0.9rem 0.15rem;
  font-size: 0.78rem;
  font-weight: 400;
  color: var(--vp-c-text-3);
  line-height: 1.4;
}
.anchor-left {
  text-align: left;
}
.anchor-right {
  text-align: right;
}
/* ── BASDAI / TFI-style VAS slider + number input ── */
.vas-row {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 0.9rem 0.4rem;
}
.vas-track-wrap {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.vas-track {
  position: relative;
  height: 8px;
  background: var(--vp-c-bg-mute);
  border-radius: 999px;
}
.vas-fill-bar {
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  border-radius: 999px;
  background: var(--vp-c-brand-1);
  transition: width 0.2s;
  pointer-events: none;
}
.vas-thumb {
  position: absolute;
  top: 50%;
  transform: translate(-50%, -50%);
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: var(--vp-c-brand-1);
  border: 2px solid #fff;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.25);
  pointer-events: none;
  transition: left 0.15s;
}
.vas-thumb-unset {
  background: var(--vp-c-bg);
  border: 2.5px solid var(--vp-c-brand-1);
  box-shadow: 0 1px 4px color-mix(in srgb, var(--vp-c-brand-1) 30%, transparent);
}
.vas-range {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  opacity: 0;
  cursor: pointer;
  margin: 0;
}
.vas-ticks {
  display: flex;
  justify-content: space-between;
  font-size: 0.72rem;
  color: var(--vp-c-text-2);
  padding: 0 10px;
}
.vas-ticks span {
  width: 0;
  display: flex;
  justify-content: center;
  overflow: visible;
  white-space: nowrap;
}
.num-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.4rem 0.9rem 0.6rem;
  border-top: 1px solid var(--vp-c-divider);
}
.num-hint {
  font-size: 0.7rem;
  color: var(--vp-c-text-3);
  flex-shrink: 0;
}
.num-input-wrap {
  border: 1.5px solid var(--vp-c-divider);
  border-radius: 7px;
  background: var(--vp-c-bg-soft);
  padding: 2px 8px;
  transition: all 0.25s;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.03);
  width: 72px;
}
.num-input-wrap.ni-filled {
  border-color: color-mix(in srgb, var(--vp-c-brand-1) 45%, transparent);
}
.num-input {
  width: 52px;
  border: none;
  background: transparent;
  font-size: 0.95rem;
  font-weight: 700;
  color: var(--vp-c-text-1);
  outline: none;
  font-family: inherit;
  -moz-appearance: textfield;
  text-align: center;
}
.num-input::placeholder {
  font-weight: 400;
  color: var(--vp-c-text-3);
  font-size: 0.8rem;
}
.num-input::-webkit-outer-spin-button,
.num-input::-webkit-inner-spin-button {
  -webkit-appearance: none;
}
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
.result-max {
  font-size: 1rem;
  color: var(--vp-c-text-3);
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
  font-weight: 400;
  color: var(--vp-c-brand-1);
}
.result-advice {
  font-size: 0.83rem;
  color: var(--vp-c-text-2);
  line-height: 1.5;
}
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
  width: 30px;
  text-align: center;
  font-weight: 800;
  color: var(--vp-c-brand-1);
}
.detail-domain {
  flex: 1;
  color: var(--vp-c-text-2);
}
.detail-score {
  font-weight: 800;
  color: var(--vp-c-text-3);
}
.detail-score.positive {
  color: var(--vp-c-brand-1);
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
  background: var(--vp-c-brand-1);
  color: #fff;
  box-shadow: 0 2px 8px rgba(99, 102, 241, 0.3);
}
.btn-view:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 14px rgba(99, 102, 241, 0.4);
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
  .result-number {
    font-size: 2.6rem;
  }
}
.field-input-wrap {
  display: flex;
  align-items: center;
  gap: 0.85rem;
  padding: 0.5rem 0.9rem 0.7rem;
}
.field-slider {
  width: 100%;
  accent-color: var(--vp-c-brand-1);
  cursor: pointer;
  height: 6px;
}
.slider-col {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 5px;
}
.field-ticks {
  display: flex;
  justify-content: space-between;
  font-size: 0.72rem;
  font-weight: 600;
  color: var(--vp-c-text-2);
  padding: 0 8px;
}
.field-ticks span {
  width: 0;
  display: flex;
  justify-content: center;
  overflow: visible;
  white-space: nowrap;
}
.field-number {
  width: 66px;
  padding: 5px 8px;
  border: 1.5px solid var(--vp-c-divider);
  border-radius: 7px;
  font-size: 0.95rem;
  font-weight: 700;
  text-align: center;
  background: var(--vp-c-bg);
  color: var(--vp-c-text-1);
  font-family: inherit;
  -moz-appearance: textfield;
}
.field-number::-webkit-outer-spin-button,
.field-number::-webkit-inner-spin-button {
  -webkit-appearance: none;
}
.field-number:focus {
  outline: none;
  border-color: var(--vp-c-brand-1);
  box-shadow: 0 0 0 2px var(--vp-c-brand-soft);
}
.field-number::placeholder {
  color: var(--vp-c-text-3);
  font-weight: 400;
}
.slider-col .item-anchor-row {
  padding: 0 6px 3px;
}
</style>
