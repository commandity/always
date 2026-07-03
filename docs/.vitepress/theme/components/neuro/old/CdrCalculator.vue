<script setup lang="ts">
import { ref, computed } from "vue";

const domains = [
  {
    key: "memory",
    title: "記憶力",
    sub: "Memory",
    options: [
      {
        score: 0,
        label: "無",
        desc: "沒有記憶力減退或稍微減退，沒有經常性健忘",
      },
      { score: 0.5, label: "可疑", desc: "經常性的輕度遺忘，事情只能部分想起" },
      {
        score: 1,
        label: "輕度",
        desc: "中度記憶減退；最近事件容易忘記，影響日常生活",
      },
      { score: 2, label: "中度", desc: "嚴重記憶力減退；新學習內容很快忘記" },
      { score: 3, label: "重度", desc: "記憶力嚴重減退，只記得片段內容" },
    ],
  },
  {
    key: "orientation",
    title: "定向力",
    sub: "Orientation",
    options: [
      { score: 0, label: "無", desc: "完全定向" },
      { score: 0.5, label: "可疑", desc: "對時間關係有輕微困難" },
      { score: 1, label: "輕度", desc: "對時間關聯性有中度困難" },
      { score: 2, label: "中度", desc: "對時間與地點定向常有困難" },
      { score: 3, label: "重度", desc: "只對人物定向" },
    ],
  },
  {
    key: "judgment",
    title: "判斷力與解決問題能力",
    sub: "Judgment & Problem Solving",
    options: [
      { score: 0, label: "無", desc: "判斷力正常" },
      { score: 0.5, label: "可疑", desc: "輕微問題解決障礙" },
      { score: 1, label: "輕度", desc: "中度困難，但社交判斷力仍可" },
      { score: 2, label: "中度", desc: "問題處理與社交判斷受損" },
      { score: 3, label: "重度", desc: "無法做出判斷或解決問題" },
    ],
  },
  {
    key: "community",
    title: "社區活動能力",
    sub: "Community Affairs",
    options: [
      { score: 0, label: "無", desc: "可獨立處理工作、購物、財務等" },
      { score: 0.5, label: "可疑", desc: "活動略有障礙" },
      { score: 1, label: "輕度", desc: "無法單獨參與部分活動" },
      { score: 2, label: "中度", desc: "無法獨立外出處理事務" },
      { score: 3, label: "重度", desc: "明顯無法在外活動" },
    ],
  },
  {
    key: "home",
    title: "家居生活與嗜好",
    sub: "Home & Hobbies",
    options: [
      { score: 0, label: "無", desc: "家庭生活與興趣維持良好" },
      { score: 0.5, label: "可疑", desc: "家庭生活略有障礙" },
      { score: 1, label: "輕度", desc: "較複雜家事與興趣已放棄" },
      { score: 2, label: "中度", desc: "只剩簡單家事能力" },
      { score: 3, label: "重度", desc: "無法做家事" },
    ],
  },
  {
    key: "care",
    title: "自我照顧能力",
    sub: "Personal Care",
    options: [
      { score: 0, label: "無", desc: "完全能夠自我照顧" },
      { score: 1, label: "輕度", desc: "需旁人提醒" },
      { score: 2, label: "中度", desc: "穿衣與衛生需幫忙" },
      { score: 3, label: "重度", desc: "需要完全照顧" },
    ],
  },
];

const selections = ref<Record<string, number>>({});
const showResults = ref(false);
const copied = ref(false);

function select(key: string, score: number) {
  selections.value[key] = score;
}

function reset() {
  selections.value = {};
  showResults.value = false;
}

const isComplete = computed(() =>
  domains.every((d) => selections.value[d.key] !== undefined),
);

const progress = computed(
  () => domains.filter((d) => selections.value[d.key] !== undefined).length,
);

function calculateCDR(s: Record<string, number>) {
  const mem = s.memory;
  const secondary = [s.orientation, s.judgment, s.community, s.home, s.care];
  const count = (v: number) => secondary.filter((x) => x === v).length;

  if (count(mem) >= 3) return mem;
  if (mem === 0.5 && count(1) + count(2) + count(3) >= 3) return 1;
  if (mem === 0) return secondary.filter((x) => x >= 0.5).length >= 2 ? 0.5 : 0;
  if (mem === 0.5) return 0.5;
  if (mem >= 1) {
    const majority = [0, 0.5, 1, 2, 3].reduce((a, b) =>
      count(b) > count(a) ? b : a,
    );
    return Math.max(0.5, majority);
  }
  return 0;
}

const cdrScore = computed(() =>
  isComplete.value ? calculateCDR(selections.value) : null,
);
const sobScore = computed(() =>
  isComplete.value
    ? Object.values(selections.value).reduce((a, b) => a + b, 0)
    : null,
);

const severity = computed(() => {
  const s = cdrScore.value;
  if (s === null) return { level: "未完成", color: "unset" };
  if (s === 0) return { level: "正常", color: "none" };
  if (s === 0.5) return { level: "可疑失智", color: "mild" };
  if (s === 1) return { level: "輕度失智", color: "mod" };
  if (s === 2) return { level: "中度失智", color: "severe" };
  return { level: "重度失智", color: "crit" };
});

function generateMarkdown() {
  const lines = domains.map((d) => {
    const v = selections.value[d.key];
    const opt = d.options.find((o) => o.score === v);
    return `- **${d.title}**：${v}（${opt?.label}）— ${opt?.desc}`;
  });
  return `# CDR 評估結果\n\n${lines.join("\n")}\n\n## CDR 總分：${cdrScore.value}（${severity.value.level}）\n## CDR-SOB：${sobScore.value}`;
}

async function copyMarkdown() {
  await navigator.clipboard.writeText(generateMarkdown());
  copied.value = true;
  setTimeout(() => (copied.value = false), 2000);
}
</script>

<template>
  <div class="cdr">
    <!-- ── Header ─────────────────────────────────────────────── -->
    <div class="cdr-header">
      <div class="header-title">
        <h2 class="title">CDR 臨床失智評量表</h2>
        <p class="subtitle">Clinical Dementia Rating Scale</p>
      </div>
      <div class="score-badge" :class="severity.color">
        <span class="score-number">{{ cdrScore ?? "—" }}</span>
        <span class="score-label">{{ severity.level }}</span>
      </div>
    </div>

    <!-- ── Severity bar ───────────────────────────────────────── -->
    <div class="severity-bar-wrap">
      <div class="severity-bar">
        <div
          class="severity-fill"
          :class="severity.color"
          :style="{
            width: cdrScore !== null ? (cdrScore / 3) * 100 + '%' : '0%',
          }"
        />
      </div>
      <div class="severity-ticks-abs">
        <span class="tick-abs t-none" style="left: 0%">0</span>
        <span class="tick-abs t-mild" style="left: 16.7%">0.5</span>
        <span class="tick-abs t-mod" style="left: 33.3%">1</span>
        <span class="tick-abs t-severe" style="left: 66.7%">2</span>
        <span class="tick-abs t-crit" style="left: 100%">3</span>
      </div>
      <div class="severity-labels-abs">
        <span class="label-abs lbl-none" style="left: 0%">正常</span>
        <span class="label-abs lbl-mild" style="left: 16.7%">可疑</span>
        <span class="label-abs lbl-mod" style="left: 33.3%">輕度</span>
        <span class="label-abs lbl-severe" style="left: 66.7%">中度</span>
        <span class="label-abs lbl-crit" style="left: 100%">重度</span>
      </div>
    </div>

    <!-- ── Intro ──────────────────────────────────────────────── -->
    <div class="intro-bar">
      <span class="intro-dot">◉</span>
      <span>
        請選取每個領域最符合患者當前狀態的描述（<strong
          >{{ progress }}/{{ domains.length }}</strong
        >
        已完成）
      </span>
    </div>

    <!-- ── Domains ────────────────────────────────────────────── -->
    <div
      v-for="(domain, domainIdx) in domains"
      :key="domain.key"
      class="cdr-domain"
    >
      <div class="group-header">
        <div class="group-label-block">
          <span class="group-label">{{ domain.title }}</span>
          <span class="group-sub">{{ domain.sub }}</span>
        </div>
      </div>

      <div class="cdr-item">
        <div class="item-header">
          <div class="item-meta-row">
            <span class="item-qnum">Q{{ domainIdx + 1 }}</span>
          </div>
          <div class="item-name-block">
            <span class="item-name">{{ domain.title }}</span>
            <span class="item-sub">{{ domain.sub }}</span>
          </div>
          <span
            class="item-score"
            :class="{
              unanswered: selections[domain.key] === undefined,
              selected: selections[domain.key] !== undefined,
            }"
          >
            {{
              selections[domain.key] !== undefined
                ? selections[domain.key]
                : "—"
            }}
          </span>
        </div>

        <div class="option-row">
          <label
            v-for="opt in domain.options"
            :key="opt.score"
            class="opt-pill"
            :class="{
              active: selections[domain.key] === opt.score,
              ['s' + (opt.score === 0.5 ? 'half' : opt.score)]: true,
            }"
          >
            <input
              type="radio"
              :name="domain.key"
              :value="opt.score"
              @change="select(domain.key, opt.score)"
            />
            <span class="opt-num">{{ opt.score }}</span>
            <span class="opt-desc">{{ opt.label }}</span>
          </label>
        </div>
      </div>
    </div>

    <!-- ── Result card ────────────────────────────────────────── -->
    <div class="cdr-result" :class="severity.color">
      <div class="result-left">
        <span class="result-number">{{ cdrScore ?? "—" }}</span>
        <span class="result-max">CDR</span>
      </div>
      <div class="result-right">
        <span class="result-level">{{ severity.level }}</span>
        <span class="result-sob" v-if="sobScore !== null"
          >CDR-SOB：{{ sobScore }}</span
        >
        <span class="result-advice" v-else>請完成所有領域以計算分數</span>
      </div>
    </div>

    <!-- ── Results detail ─────────────────────────────────────── -->
    <div v-if="showResults && isComplete" class="results-detail">
      <div class="results-header">評估明細</div>
      <div v-for="domain in domains" :key="domain.key" class="detail-row">
        <span class="detail-domain">{{ domain.title }}</span>
        <span class="detail-score">{{ selections[domain.key] }}</span>
        <span class="detail-desc">
          {{
            domain.options.find((o) => o.score === selections[domain.key])
              ?.label
          }}
          —
          {{
            domain.options.find((o) => o.score === selections[domain.key])?.desc
          }}
        </span>
      </div>
    </div>

    <!-- ── Actions ────────────────────────────────────────────── -->
    <div class="cdr-actions">
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
      <button class="btn-reset" @click="reset">重新填寫</button>
    </div>
    <p v-if="!isComplete" class="incomplete-hint">
      請完成所有 {{ domains.length }} 個領域以啟用功能
    </p>
  </div>
</template>

<style scoped>
.cdr {
  max-width: 780px;
  margin: 0 auto;
  padding: 2rem 0 3rem;
  font-size: 0.9rem;
}

/* ── Header ────────────────────────────────────────────────────── */
.cdr-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 1.25rem;
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
  font-size: 2rem;
  font-weight: 800;
  line-height: 1;
  transition: color 0.3s;
}
.score-label {
  font-size: 0.68rem;
  font-weight: 600;
  margin-top: 2px;
  letter-spacing: 0.02em;
  text-align: center;
}
.score-badge.unset {
  color: var(--vp-c-text-3);
}
.score-badge.none {
  border-color: #22c55e;
  color: #22c55e;
  box-shadow:
    0 0 0 1px rgba(34, 197, 94, 0.08),
    0 1px 3px rgba(0, 0, 0, 0.04);
}
.score-badge.mild {
  border-color: #84cc16;
  color: #84cc16;
  box-shadow:
    0 0 0 1px rgba(132, 204, 22, 0.08),
    0 1px 3px rgba(0, 0, 0, 0.04);
}
.score-badge.mod {
  border-color: #f59e0b;
  color: #f59e0b;
  box-shadow:
    0 0 0 1px rgba(245, 158, 11, 0.08),
    0 1px 3px rgba(0, 0, 0, 0.04);
}
.score-badge.severe {
  border-color: #f97316;
  color: #f97316;
  box-shadow:
    0 0 0 1px rgba(249, 115, 22, 0.08),
    0 1px 3px rgba(0, 0, 0, 0.04);
}
.score-badge.crit {
  border-color: #ef4444;
  color: #ef4444;
  box-shadow:
    0 0 0 1px rgba(239, 68, 68, 0.08),
    0 1px 3px rgba(0, 0, 0, 0.04);
}

/* ── Severity bar ──────────────────────────────────────────────── */
.severity-bar-wrap {
  margin-bottom: 2.5rem;
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
    width 0.5s cubic-bezier(0.22, 1, 0.36, 1),
    background 0.3s;
}
.severity-fill.none {
  background: linear-gradient(90deg, #22c55e, #4ade80);
}
.severity-fill.mild {
  background: linear-gradient(90deg, #84cc16, #a3e635);
}
.severity-fill.mod {
  background: linear-gradient(90deg, #f59e0b, #fbbf24);
}
.severity-fill.severe {
  background: linear-gradient(90deg, #f97316, #fb923c);
}
.severity-fill.crit {
  background: linear-gradient(90deg, #ef4444, #f87171);
}
.severity-fill.unset {
  background: var(--vp-c-divider);
}

.severity-ticks-abs,
.severity-labels-abs {
  position: relative;
  height: 14px;
  margin-top: 2px;
}
.severity-labels-abs {
  margin-top: 0;
  height: 13px;
}
.tick-abs {
  position: absolute;
  transform: translateX(-50%);
  font-size: 0.65rem;
  color: var(--vp-c-text-3);
  white-space: nowrap;
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
.lbl-none {
  color: #22c55e;
}
.lbl-mild {
  color: #84cc16;
}
.lbl-mod {
  color: #f59e0b;
}
.lbl-severe {
  color: #f97316;
}
.lbl-crit {
  color: #ef4444;
}
.t-none {
  color: #22c55e;
}
.t-mild {
  color: #84cc16;
}
.t-mod {
  color: #f59e0b;
}
.t-severe {
  color: #f97316;
}
.t-crit {
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

/* ── Domain group ──────────────────────────────────────────────── */
.cdr-domain {
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
  background: linear-gradient(
    135deg,
    rgba(99, 102, 241, 0.08),
    var(--vp-c-bg-mute),
    var(--vp-c-bg-soft)
  );
  border: 1px solid var(--vp-c-divider);
  border-left: 4px solid var(--vp-c-brand-1);
  box-shadow: 0 1px 3px rgba(99, 102, 241, 0.06);
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

/* ── Item ──────────────────────────────────────────────────────── */
.cdr-item {
  border: 1px solid var(--vp-c-divider);
  border-radius: 10px;
  background: var(--vp-c-bg-soft);
  overflow: hidden;
  transition:
    border-color 0.25s,
    box-shadow 0.25s;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.03);
}
.cdr-item:hover {
  box-shadow: 0 3px 12px rgba(0, 0, 0, 0.06);
}

.item-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  padding: 0.6rem 0.9rem;
  border-bottom: 1px solid var(--vp-c-divider);
  gap: 0.75rem;
}
.item-meta-row {
  display: flex;
  align-items: center;
  flex-shrink: 0;
  padding-top: 3px;
}
.item-qnum {
  font-size: 0.72rem;
  font-weight: 800;
  color: #fff;
  background: linear-gradient(135deg, var(--vp-c-brand-1), #4f46e5);
  padding: 1px 9px;
  border-radius: 999px;
  letter-spacing: 0.04em;
  box-shadow: 0 1px 3px rgba(99, 102, 241, 0.2);
}
.item-name-block {
  display: flex;
  flex-direction: column;
  gap: 2px;
  flex: 1;
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
  min-width: 40px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  background: var(--vp-c-bg);
  border: 1px solid var(--vp-c-divider);
  transition: all 0.25s;
}
.item-score.unanswered {
  color: var(--vp-c-text-3);
  border-color: var(--vp-c-divider);
  background: transparent;
}
.item-score.selected {
  color: var(--vp-c-brand-1);
  border-color: rgba(99, 102, 241, 0.3);
  background: rgba(99, 102, 241, 0.08);
}

/* ── Option pills (ENS6Q style) ────────────────────────────────── */
.option-row {
  display: flex;
  flex-wrap: wrap;
  gap: 3px;
  padding: 4px;
  background: var(--vp-c-bg-mute);
}

.opt-pill {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex: 1;
  min-width: 80px;
  padding: 0.6rem 0.4rem;
  cursor: pointer;
  transition: all 0.2s;
  text-align: center;
  gap: 6px;
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
.opt-num {
  font-size: 0.95rem;
  font-weight: 900;
  transition: color 0.2s;
  color: var(--vp-c-text-3);
}
.opt-desc {
  font-size: 0.7rem;
  font-weight: 700;
  line-height: 1.35;
  transition: color 0.2s;
  color: var(--vp-c-text-3);
}

/* Score colors — 0 (green) */
.opt-pill.s0 {
  border-color: rgba(34, 197, 94, 0.15);
}
.opt-pill.s0:hover:not(.active),
.opt-pill.s0:focus-within {
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
.opt-pill.s0 .opt-num {
  color: rgba(34, 197, 94, 0.5);
}
.opt-pill.s0.active .opt-num {
  color: #22c55e;
}
.opt-pill.s0 .opt-desc {
  color: rgba(34, 197, 94, 0.4);
}
.opt-pill.s0.active .opt-desc {
  color: rgba(34, 197, 94, 0.7);
}

/* 0.5 → shalf (lime) */
.opt-pill.shalf {
  border-color: rgba(132, 204, 22, 0.15);
}
.opt-pill.shalf:hover:not(.active),
.opt-pill.shalf:focus-within {
  border-color: rgba(132, 204, 22, 0.35);
  background: rgba(132, 204, 22, 0.04);
}
.opt-pill.shalf.active {
  border-color: #84cc16;
  background: linear-gradient(
    180deg,
    rgba(132, 204, 22, 0.12),
    rgba(132, 204, 22, 0.06)
  );
  box-shadow: 0 0 0 1px rgba(132, 204, 22, 0.08);
}
.opt-pill.shalf .opt-num {
  color: rgba(132, 204, 22, 0.5);
}
.opt-pill.shalf.active .opt-num {
  color: #84cc16;
}
.opt-pill.shalf .opt-desc {
  color: rgba(132, 204, 22, 0.4);
}
.opt-pill.shalf.active .opt-desc {
  color: rgba(132, 204, 22, 0.7);
}

/* 1 (yellow) */
.opt-pill.s1 {
  border-color: rgba(234, 179, 8, 0.15);
}
.opt-pill.s1:hover:not(.active),
.opt-pill.s1:focus-within {
  border-color: rgba(234, 179, 8, 0.35);
  background: rgba(234, 179, 8, 0.04);
}
.opt-pill.s1.active {
  border-color: #eab308;
  background: linear-gradient(
    180deg,
    rgba(234, 179, 8, 0.12),
    rgba(234, 179, 8, 0.06)
  );
  box-shadow: 0 0 0 1px rgba(234, 179, 8, 0.08);
}
.opt-pill.s1 .opt-num {
  color: rgba(234, 179, 8, 0.5);
}
.opt-pill.s1.active .opt-num {
  color: #eab308;
}
.opt-pill.s1 .opt-desc {
  color: rgba(234, 179, 8, 0.4);
}
.opt-pill.s1.active .opt-desc {
  color: rgba(234, 179, 8, 0.7);
}

/* 2 (orange) */
.opt-pill.s2 {
  border-color: rgba(249, 115, 22, 0.15);
}
.opt-pill.s2:hover:not(.active),
.opt-pill.s2:focus-within {
  border-color: rgba(249, 115, 22, 0.35);
  background: rgba(249, 115, 22, 0.04);
}
.opt-pill.s2.active {
  border-color: #f97316;
  background: linear-gradient(
    180deg,
    rgba(249, 115, 22, 0.12),
    rgba(249, 115, 22, 0.06)
  );
  box-shadow: 0 0 0 1px rgba(249, 115, 22, 0.08);
}
.opt-pill.s2 .opt-num {
  color: rgba(249, 115, 22, 0.5);
}
.opt-pill.s2.active .opt-num {
  color: #f97316;
}
.opt-pill.s2 .opt-desc {
  color: rgba(249, 115, 22, 0.4);
}
.opt-pill.s2.active .opt-desc {
  color: rgba(249, 115, 22, 0.7);
}

/* 3 (red) */
.opt-pill.s3 {
  border-color: rgba(239, 68, 68, 0.15);
}
.opt-pill.s3:hover:not(.active),
.opt-pill.s3:focus-within {
  border-color: rgba(239, 68, 68, 0.35);
  background: rgba(239, 68, 68, 0.04);
}
.opt-pill.s3.active {
  border-color: #ef4444;
  background: linear-gradient(
    180deg,
    rgba(239, 68, 68, 0.12),
    rgba(239, 68, 68, 0.06)
  );
  box-shadow: 0 0 0 1px rgba(239, 68, 68, 0.08);
}
.opt-pill.s3 .opt-num {
  color: rgba(239, 68, 68, 0.5);
}
.opt-pill.s3.active .opt-num {
  color: #ef4444;
}
.opt-pill.s3 .opt-desc {
  color: rgba(239, 68, 68, 0.4);
}
.opt-pill.s3.active .opt-desc {
  color: rgba(239, 68, 68, 0.7);
}

/* ── Result card ───────────────────────────────────────────────── */
.cdr-result {
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
.cdr-result.none {
  border-color: #22c55e;
  box-shadow:
    0 0 0 1px rgba(34, 197, 94, 0.06),
    0 1px 3px rgba(0, 0, 0, 0.04);
}
.cdr-result.mild {
  border-color: #84cc16;
  box-shadow:
    0 0 0 1px rgba(132, 204, 22, 0.06),
    0 1px 3px rgba(0, 0, 0, 0.04);
}
.cdr-result.mod {
  border-color: #f59e0b;
  box-shadow:
    0 0 0 1px rgba(245, 158, 11, 0.06),
    0 1px 3px rgba(0, 0, 0, 0.04);
}
.cdr-result.severe {
  border-color: #f97316;
  box-shadow:
    0 0 0 1px rgba(249, 115, 22, 0.06),
    0 1px 3px rgba(0, 0, 0, 0.04);
}
.cdr-result.crit {
  border-color: #ef4444;
  box-shadow:
    0 0 0 1px rgba(239, 68, 68, 0.06),
    0 1px 3px rgba(0, 0, 0, 0.04);
}

.result-left {
  display: flex;
  align-items: baseline;
  gap: 6px;
  flex-shrink: 0;
}
.result-number {
  font-size: 3.5rem;
  font-weight: 800;
  line-height: 1;
  color: var(--vp-c-text-3);
  transition: color 0.3s;
}
.cdr-result.none .result-number {
  color: #22c55e;
}
.cdr-result.mild .result-number {
  color: #84cc16;
}
.cdr-result.mod .result-number {
  color: #f59e0b;
}
.cdr-result.severe .result-number {
  color: #f97316;
}
.cdr-result.crit .result-number {
  color: #ef4444;
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
.result-level {
  font-size: 1rem;
  font-weight: 700;
  color: var(--vp-c-text-1);
}
.result-sob {
  font-size: 0.85rem;
  color: var(--vp-c-text-2);
}
.result-advice {
  font-size: 0.82rem;
  color: var(--vp-c-text-3);
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
  gap: 0.6rem;
  padding: 0.55rem 0.9rem;
  border-bottom: 1px solid var(--vp-c-divider);
}
.detail-row:last-child {
  border-bottom: none;
}
.detail-domain {
  font-size: 0.8rem;
  font-weight: 700;
  color: var(--vp-c-text-1);
  flex: 1;
}
.detail-score {
  font-size: 0.82rem;
  font-weight: 800;
  color: var(--vp-c-brand-1);
  flex-shrink: 0;
  width: 28px;
  text-align: center;
}
.detail-desc {
  font-size: 0.78rem;
  color: var(--vp-c-text-2);
  flex: 1;
  text-align: left;
}

/* ── Actions ───────────────────────────────────────────────────── */
.cdr-actions {
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

.incomplete-hint {
  font-size: 0.78rem;
  color: var(--vp-c-text-3);
  margin: 0.5rem 0 0;
}

@media (max-width: 640px) {
  .cdr-header {
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
  .cdr-result {
    flex-direction: column;
    gap: 0.75rem;
  }
}
</style>
