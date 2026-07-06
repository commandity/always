<script setup lang="ts">
import { ref, computed } from "vue";

// Centor 1981 (4 criteria) + McIsaac 1998 age modifier.
const criteria = [
  {
    key: "exudate",
    num: "1",
    name: "扁桃體滲出物或腫脹",
    sub: "Tonsillar exudate / swelling",
    detail: "扁桃體上可見白色或黃色膿性分泌物，或扁桃體明顯腫脹",
    hint: "需在良好光線及壓舌板輔助下檢查",
  },
  {
    key: "nodes",
    num: "2",
    name: "前頸淋巴結腫大且壓痛",
    sub: "Tender anterior cervical nodes",
    detail: "頸前淋巴結（胸鎖乳突肌前方）可觸及腫大且按壓有疼痛感",
    hint: "需雙手觸診比較，壓痛是重要條件",
  },
  {
    key: "fever",
    num: "3",
    name: "發燒（體溫 > 38°C）",
    sub: "Fever > 38°C",
    detail: "就診時體溫超過 38°C，或病史中有發燒紀錄",
    hint: "以就診時測量或近期病史為準",
  },
  {
    key: "nocough",
    num: "4",
    name: "無咳嗽",
    sub: "Absence of cough",
    detail: "患者目前無咳嗽症狀（咳嗽的出現反而提示病毒性病因）",
    hint: "咳嗽的存在使化膿性鏈球菌感染可能性降低",
  },
];
const ageOptions = [
  { key: "age3_14", label: "3–14 歲", sub: "+1", points: 1 },
  { key: "age15_44", label: "15–44 歲", sub: "0", points: 0 },
  { key: "age45p", label: "≥ 45 歲", sub: "−1", points: -1 },
];

const activeTab = ref<"centor">("centor");
const selections = ref<Record<string, boolean>>(
  Object.fromEntries(criteria.map((c) => [c.key, false])),
);
const selectedAge = ref<string | null>(null);
const showResults = ref(false);
const copied = ref(false);

const clinicalScore = computed(
  () => criteria.filter((c) => selections.value[c.key]).length,
);
const agePoints = computed(
  () => ageOptions.find((a) => a.key === selectedAge.value)?.points ?? 0,
);
const totalScore = computed(() => clinicalScore.value + agePoints.value);
const isComplete = computed(() => selectedAge.value !== null);

const severity = computed(() => {
  if (!isComplete.value)
    return {
      level: "填寫中",
      color: "filling",
      tag: "選擇年齡",
      probability: "—",
      advice: "請選擇年齡分組以完成 McIsaac 校正評估。",
    };
  const s = totalScore.value;
  if (s <= 0)
    return {
      level: "極低風險",
      color: "normal",
      tag: "無需抗生素",
      probability: "1–2.5%",
      advice: "不建議咽喉拭子培養或抗生素治療。",
    };
  if (s === 1)
    return {
      level: "低風險",
      color: "normal",
      tag: "症狀治療",
      probability: "5–10%",
      advice: "不建議常規培養或抗生素，以症狀治療為主。",
    };
  if (s === 2)
    return {
      level: "中等風險",
      color: "mild",
      tag: "建議 RADT",
      probability: "11–17%",
      advice: "考慮快速抗原檢測（RADT）或咽喉培養，陽性者給予抗生素。",
    };
  if (s === 3)
    return {
      level: "中高風險",
      color: "moderate",
      tag: "建議培養或治療",
      probability: "28–35%",
      advice: "建議 RADT 或咽喉培養，陽性者給予抗生素。",
    };
  return {
    level: "高風險",
    color: "severe",
    tag: "考慮經驗性治療",
    probability: "51–53%",
    advice: "強烈考慮抗生素治療，可考慮不等待培養結果。",
  };
});

function toggle(key: string) {
  selections.value[key] = !selections.value[key];
}
function reset() {
  criteria.forEach((c) => (selections.value[c.key] = false));
  selectedAge.value = null;
  showResults.value = false;
}
function generateMarkdown() {
  const lines = criteria
    .map(
      (c) =>
        `- **${c.name}**（${c.sub}）：${selections.value[c.key] ? "是（+1）" : "否（0）"}`,
    )
    .join("\n");
  const ageLabel =
    ageOptions.find((a) => a.key === selectedAge.value)?.label ?? "未選擇";
  return `# Centor Score（McIsaac 校正）鏈球菌咽喉炎風險評估結果\n\n## 評估項目\n\n${lines}\n- **年齡分組**：${ageLabel}（${agePoints.value >= 0 ? "+" : ""}${agePoints.value}）\n\n---\n\n## 摘要\n\n- **總分**：${totalScore.value}（臨床 ${clinicalScore.value} + 年齡 ${agePoints.value >= 0 ? "+" : ""}${agePoints.value}）\n- **風險等級**：${severity.value.level}\n- **A 群鏈球菌機率**：${severity.value.probability}\n- **建議處置**：${severity.value.advice}`;
}
async function copyMarkdown() {
  await navigator.clipboard.writeText(generateMarkdown());
  copied.value = true;
  setTimeout(() => (copied.value = false), 2000);
}
</script>

<template>
  <div class="centorassess">
    <div class="tab-bar">
      <button
        class="tab-btn"
        :class="{ active: activeTab === 'centor' }"
        @click="activeTab = 'centor'"
      >
        <span class="tab-label">Centor Score 鏈球菌咽喉炎風險</span>
        <span class="tab-sub">Modified Centor (McIsaac) Score</span>
      </button>
    </div>

    <div v-show="activeTab === 'centor'" class="centor">
      <div class="sb-header">
        <div class="header-title">
          <h2 class="title">Centor 評分</h2>
          <p class="subtitle">
            Group A Streptococcal Pharyngitis Risk · A 群鏈球菌咽喉炎機率（McIsaac
            校正）
          </p>
        </div>
        <div class="score-badge" :class="severity.color">
          <span class="score-number">{{ isComplete ? totalScore : "—" }}</span>
          <span class="score-label">{{ severity.tag }}</span>
        </div>
      </div>

      <div class="severity-bar-wrap">
        <div class="severity-bar">
          <div
            class="severity-fill"
            :class="severity.color"
            :style="{
              width: isComplete
                ? (Math.max(0, Math.min(5, totalScore + 1)) / 6) * 100 + '%'
                : '0%',
            }"
          />
        </div>
        <div class="severity-ticks">
          <span class="tk-normal">≤0</span><span class="tk-normal">1</span
          ><span class="tk-mild">2</span><span class="tk-moderate">3</span
          ><span class="tk-severe">≥4</span>
        </div>
      </div>

      <div class="intro-bar">
        <span class="intro-dot">◆</span>
        <span
          >勾選符合的臨床項目（每項 +1），並選擇年齡分組（McIsaac
          校正）。總分用於估計 A 群鏈球菌（GAS）咽喉炎機率，指引是否需檢測或抗生素。</span
        >
      </div>

      <div class="sb-group">
        <div class="group-header centor-group-header">
          <div class="group-label-block">
            <span class="group-label">臨床項目</span>
            <span class="group-sub">Centor Criteria · 4 項</span>
          </div>
          <div class="group-score-pill centor-pill">{{ clinicalScore }} / 4</div>
        </div>
        <div class="item-list">
          <div
            v-for="c in criteria"
            :key="c.key"
            class="sb-item"
            :class="{ selected: selections[c.key] }"
            @click="toggle(c.key)"
          >
            <div class="item-letter">{{ c.num }}</div>
            <div class="item-content">
              <div class="item-question">{{ c.name }}</div>
              <div class="item-name">{{ c.sub }}</div>
              <div class="item-detail">{{ c.detail }}</div>
              <div class="item-hint">{{ c.hint }}</div>
            </div>
            <div class="item-toggle">
              <div class="toggle-box" :class="{ 'toggle-on': selections[c.key] }">
                <svg
                  v-if="selections[c.key]"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="3.5"
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
              <span
                class="toggle-score"
                :class="{ 'score-on': selections[c.key] }"
                >{{ selections[c.key] ? "+1" : "0" }}</span
              >
            </div>
          </div>
        </div>
      </div>

      <!-- Age modifier -->
      <div class="age-group">
        <span class="age-label">年齡分組（McIsaac 校正）</span>
        <div class="age-btns">
          <button
            v-for="a in ageOptions"
            :key="a.key"
            class="age-btn"
            :class="{ 'age-active': selectedAge === a.key }"
            @click="selectedAge = a.key"
          >
            <span class="age-btn-label">{{ a.label }}</span>
            <span class="age-btn-pts">{{ a.sub }}</span>
          </button>
        </div>
      </div>

      <div class="sb-result" :class="severity.color">
        <div class="result-left">
          <span class="result-number">{{ isComplete ? totalScore : "—" }}</span>
        </div>
        <div class="result-right">
          <div class="result-top">
            <span class="result-level">{{ severity.level }}</span>
          </div>
          <span class="result-ahi"
            >GAS 咽喉炎機率：{{ severity.probability }}</span
          >
          <span class="result-advice">{{ severity.advice }}</span>
          <div class="result-sub-scores">
            <span class="sub-pill-sm centor-sm"
              >臨床 {{ clinicalScore }} · 年齡 {{ agePoints >= 0 ? "+" : ""
              }}{{ agePoints }}</span
            >
            <span class="sub-pill-sm centor-sm">{{ severity.tag }}</span>
          </div>
        </div>
      </div>

      <div v-if="showResults && isComplete" class="results-detail">
        <div class="results-header">評估明細</div>
        <div v-for="c in criteria" :key="c.key" class="detail-row">
          <span class="detail-letter">{{ c.num }}</span>
          <span class="detail-domain">{{ c.name }}</span>
          <span class="detail-score" :class="{ positive: selections[c.key] }">{{
            selections[c.key] ? "+1" : "0"
          }}</span>
        </div>
        <div class="detail-row">
          <span class="detail-letter">歲</span>
          <span class="detail-domain">年齡分組校正</span>
          <span class="detail-score positive"
            >{{ agePoints >= 0 ? "+" : "" }}{{ agePoints }}</span
          >
        </div>
        <div class="detail-row total-row">
          <span class="detail-letter brand-sm">∑</span>
          <span class="detail-domain">Centor 總分</span>
          <span class="detail-score positive">{{ totalScore }}</span>
          <span class="detail-desc">{{ severity.probability }}</span>
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
.centorassess {
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
.centor {
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
  min-width: 88px;
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
  font-size: 0.66rem;
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
.centor-group-header {
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
.centor-pill {
  border: 1px solid color-mix(in srgb, var(--vp-c-brand-1) 30%, transparent);
  color: var(--vp-c-brand-1);
  background: color-mix(in srgb, var(--vp-c-brand-1) 6%, transparent);
}
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
.sb-item.selected {
  border-color: var(--vp-c-brand-1);
  background: color-mix(in srgb, var(--vp-c-brand-1) 12%, var(--vp-c-bg));
}
.item-letter {
  flex-shrink: 0;
  width: 40px;
  height: 40px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.05rem;
  font-weight: 900;
  margin-top: 2px;
  color: var(--vp-c-brand-1);
  background: color-mix(in srgb, var(--vp-c-brand-1) 12%, transparent);
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
  gap: 5px;
  padding-top: 2px;
}
.toggle-box {
  width: 24px;
  height: 24px;
  border-radius: 7px;
  border: 1.5px solid var(--vp-c-divider);
  background: var(--vp-c-bg);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.15s;
}
.toggle-box svg {
  width: 14px;
  height: 14px;
  color: #fff;
}
.toggle-on {
  background: var(--vp-c-brand-1);
  border-color: var(--vp-c-brand-1);
}
.toggle-score {
  font-size: 0.78rem;
  font-weight: 800;
  color: var(--vp-c-text-3);
}
.score-on {
  color: var(--vp-c-brand-1);
}
.age-group {
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
.age-label {
  font-size: 0.85rem;
  font-weight: 700;
  color: var(--vp-c-text-1);
}
.age-btns {
  display: flex;
  gap: 0.5rem;
}
.age-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1px;
  padding: 0.45rem 0.9rem;
  border: 1.5px solid var(--vp-c-divider);
  border-radius: 8px;
  background: var(--vp-c-bg);
  color: var(--vp-c-text-2);
  cursor: pointer;
  font-family: inherit;
  transition: all 0.2s;
}
.age-btn:hover {
  border-color: var(--vp-c-text-3);
}
.age-btn.age-active {
  border-color: var(--vp-c-brand-1);
  color: var(--vp-c-brand-1);
  background: color-mix(in srgb, var(--vp-c-brand-1) 12%, var(--vp-c-bg));
}
.age-btn-label {
  font-size: 0.82rem;
  font-weight: 700;
}
.age-btn-pts {
  font-size: 0.7rem;
  font-weight: 800;
  color: var(--vp-c-text-3);
}
.age-btn.age-active .age-btn-pts {
  color: var(--vp-c-brand-1);
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
  min-width: 60px;
  justify-content: center;
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
.centor-sm {
  background: color-mix(in srgb, var(--vp-c-brand-1) 10%, transparent);
  color: var(--vp-c-brand-1);
  border: 1px solid color-mix(in srgb, var(--vp-c-brand-1) 30%, transparent);
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
  width: 26px;
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
</style>
