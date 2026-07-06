<script setup lang="ts">
import { ref, computed } from "vue";

const activeTab = ref<"mg">("mg");

// ══════════════ 偏頭痛篩查與診斷（Migraine Screen & ICHD-3）══════════════

type MainTab = "screen" | "without" | "with";
const mainTab = ref<MainTab>("screen");
type Ans = "yes" | "no" | null;

// ── Tab 1: ID Migraine Screener ───────────────────────────────────
const q1 = ref<Ans>(null); // nausea
const q2 = ref<Ans>(null); // photophobia
const q3 = ref<Ans>(null); // disability

const scrScore = computed(
  () => [q1, q2, q3].filter((v) => v.value === "yes").length,
);
const scrComplete = computed(() => [q1, q2, q3].every((v) => v.value !== null));
const scrAnswered = computed(
  () => [q1, q2, q3].filter((v) => v.value !== null).length,
);
const scrResult = computed(() => {
  if (!scrComplete.value)
    return { level: "填寫中", color: "filling", advice: "", screen: false };
  if (scrScore.value >= 2)
    return {
      level: "偏頭痛篩查陽性（Positive Screen）",
      color: "critical",
      screen: true,
      advice: `ID Migraine 陽性（${scrScore.value}/3 項符合）：建議進行完整頭痛評估，參考 ICHD-3 偏頭痛診斷標準，考慮神經科轉介及特異性治療（triptans）。`,
    };
  return {
    level: "偏頭痛篩查陰性（Negative Screen）",
    color: "normal",
    screen: false,
    advice: `ID Migraine 陰性（${scrScore.value}/3 項符合）：不符合偏頭痛篩查陽性標準，但仍需排除其他頭痛類型（緊張型頭痛、叢發性頭痛）及繼發性頭痛病因。`,
  };
});
const scrBarPct = computed(() =>
  scrComplete.value
    ? (scrScore.value / 3) * 100
    : (scrAnswered.value / 3) * 100 * 0.3,
);

// ── Tab 2: Without Aura (ICHD-3 1.1) ────────────────────────────
const wa_a = ref<Ans>(null);
const wa_b = ref<Ans>(null);
const wa_c1 = ref<Ans>(null);
const wa_c2 = ref<Ans>(null);
const wa_c3 = ref<Ans>(null);
const wa_c4 = ref<Ans>(null);
const wa_d1 = ref<Ans>(null);
const wa_d2 = ref<Ans>(null);
const wa_e = ref<Ans>(null);

const wa_c_score = computed(
  () => [wa_c1, wa_c2, wa_c3, wa_c4].filter((v) => v.value === "yes").length,
);
const wa_d_met = computed(() => wa_d1.value === "yes" || wa_d2.value === "yes");
const wa_complete = computed(() =>
  [wa_a, wa_b, wa_c1, wa_c2, wa_c3, wa_c4, wa_d1, wa_d2, wa_e].every(
    (v) => v.value !== null,
  ),
);
const wa_answered = computed(
  () =>
    [wa_a, wa_b, wa_c1, wa_c2, wa_c3, wa_c4, wa_d1, wa_d2, wa_e].filter(
      (v) => v.value !== null,
    ).length,
);
const wa_result = computed(() => {
  if (!wa_complete.value)
    return { met: false, level: "填寫中", color: "filling" };
  const A = wa_a.value === "yes";
  const B = wa_b.value === "yes";
  const C = wa_c_score.value >= 2;
  const D = wa_d_met.value;
  const E = wa_e.value === "yes";
  if (A && B && C && D && E)
    return {
      met: true,
      level: "符合無先兆偏頭痛診斷標準（ICHD-3 1.1）",
      color: "critical",
    };
  if ([!A, !B, !C, !D, !E].filter(Boolean).length === 1)
    return {
      met: false,
      level: "可能無先兆偏頭痛（Probable Migraine，1 項未達標）",
      color: "moderate",
    };
  return {
    met: false,
    level: "不符合無先兆偏頭痛診斷標準",
    color: "normal",
  };
});

// ── Tab 3: With Aura (ICHD-3 1.2) ───────────────────────────────
const aw_a = ref<Ans>(null);
const aw_b1 = ref<Ans>(null);
const aw_b2 = ref<Ans>(null);
const aw_b3 = ref<Ans>(null);
const aw_b4 = ref<Ans>(null);
const aw_b5 = ref<Ans>(null);
const aw_b6 = ref<Ans>(null);
const aw_c1 = ref<Ans>(null);
const aw_c2 = ref<Ans>(null);
const aw_c3 = ref<Ans>(null);
const aw_c4 = ref<Ans>(null);
const aw_c5 = ref<Ans>(null);
const aw_c6 = ref<Ans>(null);
const aw_d = ref<Ans>(null);

const aw_b_met = computed(() =>
  [aw_b1, aw_b2, aw_b3, aw_b4, aw_b5, aw_b6].some((v) => v.value === "yes"),
);
const aw_c_score = computed(
  () =>
    [aw_c1, aw_c2, aw_c3, aw_c4, aw_c5, aw_c6].filter((v) => v.value === "yes")
      .length,
);
const aw_complete = computed(() =>
  [
    aw_a,
    aw_b1,
    aw_b2,
    aw_b3,
    aw_b4,
    aw_b5,
    aw_b6,
    aw_c1,
    aw_c2,
    aw_c3,
    aw_c4,
    aw_c5,
    aw_c6,
    aw_d,
  ].every((v) => v.value !== null),
);
const aw_answered = computed(
  () =>
    [
      aw_a,
      aw_b1,
      aw_b2,
      aw_b3,
      aw_b4,
      aw_b5,
      aw_b6,
      aw_c1,
      aw_c2,
      aw_c3,
      aw_c4,
      aw_c5,
      aw_c6,
      aw_d,
    ].filter((v) => v.value !== null).length,
);
const aw_result = computed(() => {
  if (!aw_complete.value)
    return { met: false, level: "填寫中", color: "filling" };
  const A = aw_a.value === "yes";
  const B = aw_b_met.value;
  const C = aw_c_score.value >= 3;
  const D = aw_d.value === "yes";
  if (A && B && C && D)
    return {
      met: true,
      level: "符合有先兆偏頭痛診斷標準（ICHD-3 1.2）",
      color: "critical",
    };
  if ([!A, !B, !C, !D].filter(Boolean).length === 1)
    return {
      met: false,
      level: "可能有先兆偏頭痛（Probable Migraine with Aura）",
      color: "moderate",
    };
  return {
    met: false,
    level: "不符合有先兆偏頭痛診斷標準",
    color: "normal",
  };
});

// ── Shared ────────────────────────────────────────────────────────
const copied = ref(false);
const showResults = ref(false);

const currentResult = computed(() =>
  mainTab.value === "screen"
    ? scrResult.value
    : mainTab.value === "without"
      ? wa_result.value
      : aw_result.value,
);
const currentComplete = computed(() =>
  mainTab.value === "screen"
    ? scrComplete.value
    : mainTab.value === "without"
      ? wa_complete.value
      : aw_complete.value,
);
const currentAnswered = computed(() =>
  mainTab.value === "screen"
    ? scrAnswered.value
    : mainTab.value === "without"
      ? wa_answered.value
      : aw_answered.value,
);
const totalQ = computed(() =>
  mainTab.value === "screen" ? 3 : mainTab.value === "without" ? 9 : 14,
);

function switchTab(t: MainTab) {
  mainTab.value = t;
  showResults.value = false;
}

function generateMarkdown(): string {
  if (mainTab.value === "screen") {
    return (
      `# ID Migraine 偏頭痛篩查結果\n\n` +
      `- 噁心：${q1.value === "yes" ? "✅ 是" : "否"}\n` +
      `- 畏光：${q2.value === "yes" ? "✅ 是" : "否"}\n` +
      `- 失能：${q3.value === "yes" ? "✅ 是" : "否"}\n\n` +
      `- **分數**：${scrScore.value}/3\n- **結果**：${scrResult.value.level}\n- **建議**：${scrResult.value.advice}`
    );
  }
  if (mainTab.value === "without") {
    return (
      `# 無先兆偏頭痛 ICHD-3 診斷標準評估\n\n` +
      `- A（≥5 次發作）：${wa_a.value === "yes" ? "✓" : "✗"}\n` +
      `- B（4–72 hr）：${wa_b.value === "yes" ? "✓" : "✗"}\n` +
      `- C（疼痛特徵 ${wa_c_score.value}/4）：${wa_c_score.value >= 2 ? "✓" : "✗"}\n` +
      `- D（相關症狀）：${wa_d_met.value ? "✓" : "✗"}\n` +
      `- E（排除其他）：${wa_e.value === "yes" ? "✓" : "✗"}\n\n**結果：${wa_result.value.level}**`
    );
  }
  return (
    `# 有先兆偏頭痛 ICHD-3 診斷標準評估\n\n` +
    `- A（≥2 次發作）：${aw_a.value === "yes" ? "✓" : "✗"}\n` +
    `- B（先兆類型 ≥1）：${aw_b_met.value ? "✓" : "✗"}\n` +
    `- C（先兆特徵 ${aw_c_score.value}/6）：${aw_c_score.value >= 3 ? "✓" : "✗"}\n` +
    `- D（排除其他）：${aw_d.value === "yes" ? "✓" : "✗"}\n\n**結果：${aw_result.value.level}**`
  );
}

async function copyOutput() {
  await navigator.clipboard.writeText(generateMarkdown());
  copied.value = true;
  setTimeout(() => (copied.value = false), 2000);
}

function reset() {
  [
    q1,
    q2,
    q3,
    wa_a,
    wa_b,
    wa_c1,
    wa_c2,
    wa_c3,
    wa_c4,
    wa_d1,
    wa_d2,
    wa_e,
    aw_a,
    aw_b1,
    aw_b2,
    aw_b3,
    aw_b4,
    aw_b5,
    aw_b6,
    aw_c1,
    aw_c2,
    aw_c3,
    aw_c4,
    aw_c5,
    aw_c6,
    aw_d,
  ].forEach((v) => {
    v.value = null;
  });
  showResults.value = false;
}
</script>

<template>
  <div class="migraineassess">
    <!-- Tab bar -->
    <div class="tab-bar">
      <button
        class="tab-btn"
        :class="{ active: activeTab === 'mg' }"
        @click="activeTab = 'mg'"
      >
        <span class="tab-label">偏頭痛篩查與診斷</span>
        <span class="tab-sub">Migraine Screen & ICHD-3</span>
      </button>
    </div>

  <div v-show="activeTab === 'mg'" class="mg">
    <!-- ── Header ─────────────────────────────────────────────── -->
    <div class="mg-header">
      <div class="header-title">
        <h2 class="title">MIGRAINE 偏頭痛篩查與診斷標準</h2>
        <p class="subtitle">
          ID Migraine 篩查 · ICHD-3 無先兆（1.1）· ICHD-3 有先兆（1.2）·
          三合一工具
        </p>
        <p class="subtitle-2">
          <span class="hint-tag hint-mg"
            >🧠 偏頭痛三步驟評估：初步篩查 → 無先兆診斷 → 有先兆診斷</span
          >
        </p>
      </div>
      <div class="score-badge" :class="currentResult.color">
        <span class="badge-top">
          {{
            mainTab === "screen"
              ? "ID Migraine"
              : mainTab === "without"
                ? "無先兆 1.1"
                : "有先兆 1.2"
          }}
        </span>
        <span class="score-number">
          {{
            mainTab === "screen"
              ? scrComplete
                ? scrScore
                : "—"
              : currentComplete
                ? currentResult.met
                  ? "✓"
                  : "✗"
                : "—"
          }}<span
            v-if="mainTab === 'screen'"
            class="score-unit"
            :style="{ opacity: scrComplete ? 1 : 0 }"
            >/3</span
          >
        </span>
        <span class="score-bot">
          {{
            currentComplete
              ? mainTab === "screen"
                ? scrScore >= 2
                  ? "陽性"
                  : "陰性"
                : currentResult.met
                  ? "診斷成立"
                  : "不符合"
              : currentAnswered + "/" + totalQ
          }}
        </span>
      </div>
    </div>

    <!-- ── Tab selector group ─────────────────────────────────── -->
    <div class="nihss-group">
      <div class="group-header-bar tab-bar">
        <span class="group-icon">📋</span>
        <span class="group-label-text">工具選擇</span>
        <span class="group-sub-text"
          >依臨床情境選擇：初步篩查 → 無先兆診斷 → 有先兆診斷</span
        >
      </div>
      <div class="tab-row">
        <button
          class="tab-btn"
          :class="{ 'tab-scr': mainTab === 'screen' }"
          @click="switchTab('screen')"
        >
          <span class="tb-icon">🔍</span>
          <span class="tb-body">
            <span class="tb-title">ID Migraine 篩查</span>
            <span class="tb-sub">3 題快速篩查 · 陽性標準 ≥ 2/3</span>
          </span>
          <span
            class="tb-score"
            :class="
              scrComplete ? (scrScore >= 2 ? 'tbs-pos' : 'tbs-neg') : 'tbs-nd'
            "
          >
            {{ scrComplete ? scrScore + "/3" : "—" }}
          </span>
        </button>
        <button
          class="tab-btn"
          :class="{ 'tab-wo': mainTab === 'without' }"
          @click="switchTab('without')"
        >
          <span class="tb-icon">🧠</span>
          <span class="tb-body">
            <span class="tb-title">無先兆偏頭痛（1.1）</span>
            <span class="tb-sub">ICHD-3 · ≥5 次發作 · A+B+C+D+E</span>
          </span>
          <span
            class="tb-score"
            :class="
              wa_complete ? (wa_result.met ? 'tbs-pos' : 'tbs-neg') : 'tbs-nd'
            "
          >
            {{ wa_complete ? (wa_result.met ? "✓" : "✗") : "—" }}
          </span>
        </button>
        <button
          class="tab-btn"
          :class="{ 'tab-wi': mainTab === 'with' }"
          @click="switchTab('with')"
        >
          <span class="tb-icon">✨</span>
          <span class="tb-body">
            <span class="tb-title">有先兆偏頭痛（1.2）</span>
            <span class="tb-sub">ICHD-3 · ≥2 次發作 · A+B+C+D</span>
          </span>
          <span
            class="tb-score"
            :class="
              aw_complete ? (aw_result.met ? 'tbs-pos' : 'tbs-neg') : 'tbs-nd'
            "
          >
            {{ aw_complete ? (aw_result.met ? "✓" : "✗") : "—" }}
          </span>
        </button>
      </div>
    </div>

    <!-- ══ TAB 1: ID MIGRAINE SCREENER ═══════════════════════════ -->
    <template v-if="mainTab === 'screen'">
      <!-- Severity bar -->
      <div class="severity-bar-wrap">
        <div class="severity-bar">
          <div
            class="severity-fill"
            :class="scrResult.color"
            :style="{ width: scrBarPct + '%' }"
          />
        </div>
        <div class="severity-ticks-abs">
          <span class="tick-abs" style="left: 0%">0</span>
          <span class="tick-abs tick-yellow" style="left: 33.3%">1/3</span>
          <span class="tick-abs tick-red" style="left: 66.6%">2/3 ▾ 陽性</span>
          <span class="tick-abs" style="left: 100%">3/3</span>
        </div>
      </div>

      <div
        v-if="scrComplete && scrResult.screen"
        class="mg-alert alert-critical"
      >
        <span class="alert-icon">⚠</span>
        <span
          ><strong>{{ scrResult.level }}：</strong>{{ scrResult.advice }}</span
        >
      </div>

      <!-- Questions -->
      <div class="nihss-group">
        <div class="group-header-bar q-bar">
          <span class="group-icon">🧠</span>
          <span class="group-label-text">篩查問題（過去 3 個月）</span>
          <span class="group-sub-text">任何 2 項回答「是」→ 篩查陽性</span>
          <span
            class="group-score-tally"
            :class="
              scrComplete
                ? scrScore >= 2
                  ? 'tally-abn'
                  : 'tally-ok'
                : 'tally-nd'
            "
          >
            {{ scrComplete ? scrScore + "/3 陽性" : scrAnswered + "/3 題" }}
          </span>
        </div>
        <div class="item-list">
          <!-- Q1 Nausea -->
          <div
            class="crit-item"
            :class="q1 === null ? '' : q1 === 'yes' ? 'item-yes' : 'item-no'"
          >
            <div class="item-header">
              <span class="item-qnum q-nausea">噁心（Nausea）</span>
              <div class="item-name-block">
                <span class="item-name"
                  >過去三個月內，頭痛發作時是否有噁心或嘔吐的感覺？</span
                >
              </div>
              <div class="yn-row">
              <button
                class="btn-yn btn-yn-yes"
                :class="{ 'yn-yes-active': q1 === 'yes' }"
                @click="q1 = 'yes'"
              >
                是
              </button>
              <button
                class="btn-yn btn-yn-no"
                :class="{ 'yn-no-active': q1 === 'no' }"
                @click="q1 = 'no'"
              >
                否
              </button>
            </div>
            </div>
          </div>
          <!-- Q2 Photophobia -->
          <div
            class="crit-item"
            :class="q2 === null ? '' : q2 === 'yes' ? 'item-yes' : 'item-no'"
          >
            <div class="item-header">
              <span class="item-qnum q-photo">畏光（Photophobia）</span>
              <div class="item-name-block">
                <span class="item-name"
                  >過去三個月內，頭痛發作時光線是否令您感到困擾？</span
                >
              </div>
              <div class="yn-row">
              <button
                class="btn-yn btn-yn-yes"
                :class="{ 'yn-yes-active': q2 === 'yes' }"
                @click="q2 = 'yes'"
              >
                是
              </button>
              <button
                class="btn-yn btn-yn-no"
                :class="{ 'yn-no-active': q2 === 'no' }"
                @click="q2 = 'no'"
              >
                否
              </button>
            </div>
            </div>
          </div>
          <!-- Q3 Disability -->
          <div
            class="crit-item"
            :class="q3 === null ? '' : q3 === 'yes' ? 'item-yes' : 'item-no'"
          >
            <div class="item-header">
              <span class="item-qnum q-dis">失能（Disability）</span>
              <div class="item-name-block">
                <span class="item-name"
                  >過去三個月內，頭痛是否讓您至少有一天無法進行正常工作、學習或日常活動？</span
                >
              </div>
              <div class="yn-row">
              <button
                class="btn-yn btn-yn-yes"
                :class="{ 'yn-yes-active': q3 === 'yes' }"
                @click="q3 = 'yes'"
              >
                是
              </button>
              <button
                class="btn-yn btn-yn-no"
                :class="{ 'yn-no-active': q3 === 'no' }"
                @click="q3 = 'no'"
              >
                否
              </button>
            </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Sub-score row -->
      <div v-if="scrAnswered > 0" class="sub-score-row">
        <div
          v-for="(item, idx) in [
            { label: '噁心', val: q1, key: 'q1' },
            { label: '畏光', val: q2, key: 'q2' },
            { label: '失能', val: q3, key: 'q3' },
          ]"
          :key="idx"
          class="sub-score-card"
          :class="
            item.val === null
              ? 'ss-nd'
              : item.val === 'yes'
                ? 'ss-pos'
                : 'ss-neg'
          "
        >
          <span class="ss-label">{{ item.label }}</span>
          <span class="ss-val">{{
            item.val === null ? "—" : item.val === "yes" ? "+1" : "0"
          }}</span>
          <span class="ss-max">分</span>
        </div>
      </div>

      <!-- Result detail (toggled) -->
      <div v-if="showResults && scrComplete" class="results-detail">
        <div class="results-header">評估明細</div>
        <div class="detail-row">
          <span class="detail-qnum" style="color: #f97316">1</span>
          <span class="detail-domain">噁心（Nausea）</span>
          <span
            class="detail-score"
            :class="q1 === 'yes' ? 'ds-abn' : 'ds-ok'"
            >{{ q1 === "yes" ? "是" : "否" }}</span
          >
          <span class="detail-desc">{{ q1 === "yes" ? "+1 分" : "0 分" }}</span>
        </div>
        <div class="detail-row">
          <span class="detail-qnum" style="color: #f97316">2</span>
          <span class="detail-domain">畏光（Photophobia）</span>
          <span
            class="detail-score"
            :class="q2 === 'yes' ? 'ds-abn' : 'ds-ok'"
            >{{ q2 === "yes" ? "是" : "否" }}</span
          >
          <span class="detail-desc">{{ q2 === "yes" ? "+1 分" : "0 分" }}</span>
        </div>
        <div class="detail-row">
          <span class="detail-qnum" style="color: #f97316">3</span>
          <span class="detail-domain">失能（Disability）</span>
          <span
            class="detail-score"
            :class="q3 === 'yes' ? 'ds-abn' : 'ds-ok'"
            >{{ q3 === "yes" ? "是" : "否" }}</span
          >
          <span class="detail-desc">{{ q3 === "yes" ? "+1 分" : "0 分" }}</span>
        </div>
        <div class="detail-row detail-total">
          <span class="detail-qnum" style="color: #f97316">∑</span>
          <span class="detail-domain">ID Migraine 總分</span>
          <span class="detail-score detail-score-brand">{{ scrScore }}/3</span>
          <span class="detail-desc">{{ scrScore >= 2 ? "陽性" : "陰性" }}</span>
        </div>
      </div>

      <!-- Result card -->
      <div class="result-card" :class="scrResult.color">
        <div class="result-left">
          <span class="result-number">{{ scrComplete ? scrScore : "—" }}</span>
          <span class="result-max" :style="{ opacity: scrComplete ? 1 : 0 }"
            >/3</span
          >
        </div>
        <div class="result-right">
          <span class="result-ver">ID Migraine 篩查</span>
          <span class="result-level">{{ scrResult.level }}</span>
          <span class="result-advice">{{ scrResult.advice }}</span>
        </div>
      </div>
    </template>

    <!-- ══ TAB 2: WITHOUT AURA ════════════════════════════════════ -->
    <template v-else-if="mainTab === 'without'">
      <!-- Criterion A -->
      <div class="nihss-group">
        <div class="group-header-bar crit-bar-a">
          <span class="group-icon">🅐</span>
          <span class="group-label-text">標準 A：發作次數</span>
          <span class="group-sub-text"
            >需有至少 5 次符合 B–D 標準的頭痛發作</span
          >
          <span
            class="group-score-tally"
            :class="
              wa_a !== null
                ? wa_a === 'yes'
                  ? 'tally-ok'
                  : 'tally-abn'
                : 'tally-nd'
            "
          >
            {{ wa_a !== null ? (wa_a === "yes" ? "✓ 達標" : "✗ 未達") : "—" }}
          </span>
        </div>
        <div
          class="crit-item"
          :class="wa_a === null ? '' : wa_a === 'yes' ? 'item-ok' : 'item-fail'"
        >
          <div class="item-header">
            <span class="item-qnum q-a">A</span>
            <div class="item-name-block">
              <span class="item-name">頭痛發作次數是否 ≥ 5 次？</span>
            </div>
            <div class="yn-row">
            <button
              class="btn-yn btn-yn-ok"
              :class="{ 'yn-ok-active': wa_a === 'yes' }"
              @click="wa_a = 'yes'"
            >
              是
            </button>
            <button
              class="btn-yn btn-yn-fail"
              :class="{ 'yn-fail-active': wa_a === 'no' }"
              @click="wa_a = 'no'"
            >
              否
            </button>
          </div>
            </div>
        </div>
      </div>

      <!-- Criterion B -->
      <div class="nihss-group">
        <div class="group-header-bar crit-bar-b">
          <span class="group-icon">🅑</span>
          <span class="group-label-text">標準 B：頭痛持續時間</span>
          <span class="group-sub-text">未治療或治療無效時，持續 4–72 小時</span>
          <span
            class="group-score-tally"
            :class="
              wa_b !== null
                ? wa_b === 'yes'
                  ? 'tally-ok'
                  : 'tally-abn'
                : 'tally-nd'
            "
          >
            {{ wa_b !== null ? (wa_b === "yes" ? "✓ 達標" : "✗ 未達") : "—" }}
          </span>
        </div>
        <div
          class="crit-item"
          :class="wa_b === null ? '' : wa_b === 'yes' ? 'item-ok' : 'item-fail'"
        >
          <div class="item-header">
            <span class="item-qnum q-b">B</span>
            <div class="item-name-block">
              <span class="item-name"
                >未治療或治療無效時，頭痛持續 4–72 小時？</span
              >
            </div>
            <div class="yn-row">
            <button
              class="btn-yn btn-yn-ok"
              :class="{ 'yn-ok-active': wa_b === 'yes' }"
              @click="wa_b = 'yes'"
            >
              是
            </button>
            <button
              class="btn-yn btn-yn-fail"
              :class="{ 'yn-fail-active': wa_b === 'no' }"
              @click="wa_b = 'no'"
            >
              否
            </button>
          </div>
            </div>
        </div>
      </div>

      <!-- Criterion C -->
      <div class="nihss-group">
        <div class="group-header-bar crit-bar-c">
          <span class="group-icon">🅒</span>
          <span class="group-label-text">標準 C：頭痛特徵（≥ 2/4）</span>
          <span class="group-sub-text">以下 4 項疼痛特徵，至少符合 2 項</span>
          <span
            class="group-score-tally"
            :class="
              [wa_c1, wa_c2, wa_c3, wa_c4].every((v) => v !== null)
                ? wa_c_score >= 2
                  ? 'tally-ok'
                  : 'tally-abn'
                : 'tally-nd'
            "
          >
            {{ wa_c_score }}/4
            {{
              [wa_c1, wa_c2, wa_c3, wa_c4].every((v) => v !== null)
                ? wa_c_score >= 2
                  ? "✓"
                  : "✗"
                : ""
            }}
          </span>
        </div>
        <div class="item-list">
          <div
            v-for="(item, idx) in [
              {
                ref: wa_c1,
                setter: (v: Ans) => (wa_c1 = v),
                id: 'C1',
                zh: '單側頭痛',
                en: 'Unilateral location',
              },
              {
                ref: wa_c2,
                setter: (v: Ans) => (wa_c2 = v),
                id: 'C2',
                zh: '搏動性頭痛',
                en: 'Pulsating quality',
              },
              {
                ref: wa_c3,
                setter: (v: Ans) => (wa_c3 = v),
                id: 'C3',
                zh: '中度或重度疼痛',
                en: 'Moderate or severe pain intensity',
              },
              {
                ref: wa_c4,
                setter: (v: Ans) => (wa_c4 = v),
                id: 'C4',
                zh: '日常活動使頭痛加重',
                en: 'Aggravation by or causing avoidance of routine physical activity',
              },
            ]"
            :key="idx"
            class="crit-item"
            :class="
              item.ref === null
                ? ''
                : item.ref === 'yes'
                  ? 'item-ok'
                  : 'item-fail'
            "
          >
            <div class="item-header">
              <span class="item-qnum q-c">{{ item.id }}</span>
              <div class="item-name-block">
                <span class="item-name">{{ item.zh }}</span>
              </div>
              <div class="yn-row">
              <button
                class="btn-yn btn-yn-ok"
                :class="{ 'yn-ok-active': item.ref === 'yes' }"
                @click="item.setter('yes')"
              >
                是
              </button>
              <button
                class="btn-yn btn-yn-fail"
                :class="{ 'yn-fail-active': item.ref === 'no' }"
                @click="item.setter('no')"
              >
                否
              </button>
            </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Criterion D -->
      <div class="nihss-group">
        <div class="group-header-bar crit-bar-d">
          <span class="group-icon">🅓</span>
          <span class="group-label-text">標準 D：相關症狀（≥ 1 項）</span>
          <span class="group-sub-text">頭痛期間至少符合以下 1 項</span>
          <span
            class="group-score-tally"
            :class="
              [wa_d1, wa_d2].every((v) => v !== null)
                ? wa_d_met
                  ? 'tally-ok'
                  : 'tally-abn'
                : 'tally-nd'
            "
          >
            {{
              [wa_d1, wa_d2].every((v) => v !== null)
                ? wa_d_met
                  ? "✓ 達標"
                  : "✗ 未達"
                : "—"
            }}
          </span>
        </div>
        <div class="item-list">
          <div
            class="crit-item"
            :class="
              wa_d1 === null ? '' : wa_d1 === 'yes' ? 'item-ok' : 'item-fail'
            "
          >
            <div class="item-header">
              <span class="item-qnum q-d">D1</span>
              <div class="item-name-block">
                <span class="item-name">噁心和/或嘔吐</span>
              </div>
              <div class="yn-row">
              <button
                class="btn-yn btn-yn-ok"
                :class="{ 'yn-ok-active': wa_d1 === 'yes' }"
                @click="wa_d1 = 'yes'"
              >
                是
              </button>
              <button
                class="btn-yn btn-yn-fail"
                :class="{ 'yn-fail-active': wa_d1 === 'no' }"
                @click="wa_d1 = 'no'"
              >
                否
              </button>
            </div>
            </div>
          </div>
          <div
            class="crit-item"
            :class="
              wa_d2 === null ? '' : wa_d2 === 'yes' ? 'item-ok' : 'item-fail'
            "
          >
            <div class="item-header">
              <span class="item-qnum q-d">D2</span>
              <div class="item-name-block">
                <span class="item-name"
                  >畏光（photophobia）且畏聲（phonophobia）</span
                >
              </div>
              <div class="yn-row">
              <button
                class="btn-yn btn-yn-ok"
                :class="{ 'yn-ok-active': wa_d2 === 'yes' }"
                @click="wa_d2 = 'yes'"
              >
                是
              </button>
              <button
                class="btn-yn btn-yn-fail"
                :class="{ 'yn-fail-active': wa_d2 === 'no' }"
                @click="wa_d2 = 'no'"
              >
                否
              </button>
            </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Criterion E -->
      <div class="nihss-group">
        <div class="group-header-bar crit-bar-e">
          <span class="group-icon">🅔</span>
          <span class="group-label-text">標準 E：排除其他診斷</span>
          <span class="group-sub-text">頭痛不能以其他 ICHD-3 診斷更好解釋</span>
          <span
            class="group-score-tally"
            :class="
              wa_e !== null
                ? wa_e === 'yes'
                  ? 'tally-ok'
                  : 'tally-abn'
                : 'tally-nd'
            "
          >
            {{ wa_e !== null ? (wa_e === "yes" ? "✓ 達標" : "✗ 未達") : "—" }}
          </span>
        </div>
        <div
          class="crit-item"
          :class="wa_e === null ? '' : wa_e === 'yes' ? 'item-ok' : 'item-fail'"
        >
          <div class="item-header">
            <span class="item-qnum q-e">E</span>
            <div class="item-name-block">
              <span class="item-name"
                >頭痛不能更好地以其他 ICHD-3 診斷解釋？</span
              >
            </div>
            <div class="yn-row">
            <button
              class="btn-yn btn-yn-ok"
              :class="{ 'yn-ok-active': wa_e === 'yes' }"
              @click="wa_e = 'yes'"
            >
              是
            </button>
            <button
              class="btn-yn btn-yn-fail"
              :class="{ 'yn-fail-active': wa_e === 'no' }"
              @click="wa_e = 'no'"
            >
              否
            </button>
          </div>
            </div>
        </div>
      </div>

      <!-- Results detail (toggled) -->
      <div v-if="showResults && wa_complete" class="results-detail">
        <div class="results-header">ICHD-3 1.1 評估明細</div>
        <div
          v-for="(row, idx) in [
            { label: 'A', desc: '發作次數 ≥5 次', met: wa_a === 'yes' },
            { label: 'B', desc: '持續 4–72 小時', met: wa_b === 'yes' },
            {
              label: 'C',
              desc: `疼痛特徵 ${wa_c_score}/4`,
              met: wa_c_score >= 2,
            },
            { label: 'D', desc: '相關症狀 ≥1 項', met: wa_d_met },
            { label: 'E', desc: '排除其他診斷', met: wa_e === 'yes' },
          ]"
          :key="idx"
          class="detail-row"
          :class="idx === 4 ? 'detail-total' : ''"
        >
          <span class="detail-qnum" style="color: #3b82f6">{{
            row.label
          }}</span>
          <span class="detail-domain">{{ row.desc }}</span>
          <span class="detail-score" :class="row.met ? 'ds-ok' : 'ds-abn'">{{
            row.met ? "✓ 達標" : "✗ 未達"
          }}</span>
        </div>
        <div class="detail-row detail-total">
          <span class="detail-qnum" style="color: #3b82f6">∑</span>
          <span class="detail-domain">ICHD-3 1.1 總判讀</span>
          <span class="detail-score detail-score-brand">{{
            wa_result.met ? "符合" : "不符合"
          }}</span>
          <span class="detail-desc">{{
            wa_result.level.substring(0, 12)
          }}</span>
        </div>
      </div>

      <!-- Result card -->
      <div class="result-card" :class="wa_result.color">
        <div class="result-left">
          <span class="result-number">{{
            wa_complete ? (wa_result.met ? "✓" : "✗") : "—"
          }}</span>
        </div>
        <div class="result-right">
          <span class="result-ver">ICHD-3 1.1 無先兆偏頭痛</span>
          <span class="result-level">{{ wa_result.level }}</span>
          <span class="result-advice" v-if="wa_complete">
            {{
              wa_result.met
                ? "符合 ICHD-3 診斷標準。建議神經科確認診斷，並討論急性期治療（triptans、NSAIDs）及預防性治療（β 阻斷劑、CGRP 單抗等）。"
                : "尚不符合完整診斷標準。可記錄為 Probable Migraine，建議頭痛日誌追蹤及神經科評估。"
            }}
          </span>
        </div>
      </div>
    </template>

    <!-- ══ TAB 3: WITH AURA ═══════════════════════════════════════ -->
    <template v-else>
      <!-- Criterion A -->
      <div class="nihss-group">
        <div class="group-header-bar crit-bar-a">
          <span class="group-icon">🅐</span>
          <span class="group-label-text">標準 A：發作次數</span>
          <span class="group-sub-text">需有至少 2 次符合 B–C 標準的發作</span>
          <span
            class="group-score-tally"
            :class="
              aw_a !== null
                ? aw_a === 'yes'
                  ? 'tally-ok'
                  : 'tally-abn'
                : 'tally-nd'
            "
          >
            {{ aw_a !== null ? (aw_a === "yes" ? "✓ 達標" : "✗ 未達") : "—" }}
          </span>
        </div>
        <div
          class="crit-item"
          :class="aw_a === null ? '' : aw_a === 'yes' ? 'item-ok' : 'item-fail'"
        >
          <div class="item-header">
            <span class="item-qnum q-a">A</span>
            <div class="item-name-block">
              <span class="item-name"
                >符合 B–C 標準的發作次數是否 ≥ 2 次？</span
              >
            </div>
            <div class="yn-row">
            <button
              class="btn-yn btn-yn-ok"
              :class="{ 'yn-ok-active': aw_a === 'yes' }"
              @click="aw_a = 'yes'"
            >
              是
            </button>
            <button
              class="btn-yn btn-yn-fail"
              :class="{ 'yn-fail-active': aw_a === 'no' }"
              @click="aw_a = 'no'"
            >
              否
            </button>
          </div>
            </div>
        </div>
      </div>

      <!-- Criterion B: Aura types -->
      <div class="nihss-group">
        <div class="group-header-bar crit-bar-b">
          <span class="group-icon">🅑</span>
          <span class="group-label-text"
            >標準 B：先兆類型（≥1 種，完全可逆）</span
          >
          <span class="group-sub-text">以下至少 1 種完全可逆的先兆症狀</span>
          <span
            class="group-score-tally"
            :class="
              [aw_b1, aw_b2, aw_b3, aw_b4, aw_b5, aw_b6].every(
                (v) => v !== null,
              )
                ? aw_b_met
                  ? 'tally-ok'
                  : 'tally-abn'
                : 'tally-nd'
            "
          >
            {{
              [aw_b1, aw_b2, aw_b3, aw_b4, aw_b5, aw_b6].every(
                (v) => v !== null,
              )
                ? aw_b_met
                  ? "✓ ≥1 種"
                  : "✗ 無"
                : "—"
            }}
          </span>
        </div>
        <div class="item-list">
          <div
            v-for="(item, idx) in [
              {
                ref: aw_b1,
                setter: (v: Ans) => (aw_b1 = v),
                id: 'B1',
                zh: '視覺先兆（閃光、暗點、鋸齒形線條等）',
                en: 'Visual symptoms',
              },
              {
                ref: aw_b2,
                setter: (v: Ans) => (aw_b2 = v),
                id: 'B2',
                zh: '感覺先兆（麻木、針刺感）',
                en: 'Sensory symptoms',
              },
              {
                ref: aw_b3,
                setter: (v: Ans) => (aw_b3 = v),
                id: 'B3',
                zh: '語言/言語先兆（失語、找詞困難）',
                en: 'Speech and/or language symptoms',
              },
              {
                ref: aw_b4,
                setter: (v: Ans) => (aw_b4 = v),
                id: 'B4',
                zh: '運動先兆（肢體無力 — 偏癱型偏頭痛）',
                en: 'Motor symptoms',
              },
              {
                ref: aw_b5,
                setter: (v: Ans) => (aw_b5 = v),
                id: 'B5',
                zh: '腦幹先兆（暈眩、構音障礙、複視、共濟失調）',
                en: 'Brainstem symptoms',
              },
              {
                ref: aw_b6,
                setter: (v: Ans) => (aw_b6 = v),
                id: 'B6',
                zh: '視網膜先兆（單眼視覺症狀）',
                en: 'Retinal symptoms',
              },
            ]"
            :key="idx"
            class="crit-item"
            :class="
              item.ref === null
                ? ''
                : item.ref === 'yes'
                  ? 'item-ok'
                  : 'item-na'
            "
          >
            <div class="item-header">
              <span class="item-qnum q-b">{{ item.id }}</span>
              <div class="item-name-block">
                <span class="item-name">{{ item.zh }}</span>
              </div>
              <div class="yn-row">
              <button
                class="btn-yn btn-yn-ok"
                :class="{ 'yn-ok-active': item.ref === 'yes' }"
                @click="item.setter('yes')"
              >
                是
              </button>
              <button
                class="btn-yn btn-yn-fail"
                :class="{ 'yn-fail-active': item.ref === 'no' }"
                @click="item.setter('no')"
              >
                否
              </button>
            </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Criterion C: Aura characteristics -->
      <div class="nihss-group">
        <div class="group-header-bar crit-bar-c">
          <span class="group-icon">🅒</span>
          <span class="group-label-text">標準 C：先兆特徵（≥ 3/6）</span>
          <span class="group-sub-text">以下 6 項先兆特徵，至少符合 3 項</span>
          <span
            class="group-score-tally"
            :class="
              [aw_c1, aw_c2, aw_c3, aw_c4, aw_c5, aw_c6].every(
                (v) => v !== null,
              )
                ? aw_c_score >= 3
                  ? 'tally-ok'
                  : 'tally-abn'
                : 'tally-nd'
            "
          >
            {{ aw_c_score }}/6
            {{
              [aw_c1, aw_c2, aw_c3, aw_c4, aw_c5, aw_c6].every(
                (v) => v !== null,
              )
                ? aw_c_score >= 3
                  ? "✓"
                  : "✗"
                : ""
            }}
          </span>
        </div>
        <div class="item-list">
          <div
            v-for="(item, idx) in [
              {
                ref: aw_c1,
                setter: (v: Ans) => (aw_c1 = v),
                id: 'C1',
                zh: '至少 1 種先兆逐漸擴展（spreading）≥ 5 分鐘',
                en: 'At least one aura symptom spreads gradually over ≥5 minutes',
              },
              {
                ref: aw_c2,
                setter: (v: Ans) => (aw_c2 = v),
                id: 'C2',
                zh: '≥ 2 種先兆症狀連續出現',
                en: 'Two or more aura symptoms occur in succession',
              },
              {
                ref: aw_c3,
                setter: (v: Ans) => (aw_c3 = v),
                id: 'C3',
                zh: '每種先兆症狀持續 5–60 分鐘',
                en: 'Each individual aura symptom lasts 5–60 minutes',
              },
              {
                ref: aw_c4,
                setter: (v: Ans) => (aw_c4 = v),
                id: 'C4',
                zh: '至少 1 種先兆症狀為單側（unilateral）',
                en: 'At least one aura symptom is unilateral',
              },
              {
                ref: aw_c5,
                setter: (v: Ans) => (aw_c5 = v),
                id: 'C5',
                zh: '至少 1 種先兆症狀為陽性症狀（閃光、針刺感等）',
                en: 'At least one aura symptom is positive (scintillations, pins and needles)',
              },
              {
                ref: aw_c6,
                setter: (v: Ans) => (aw_c6 = v),
                id: 'C6',
                zh: '先兆伴隨或在 60 分鐘內出現頭痛',
                en: 'The aura is accompanied or followed within 60 minutes by headache',
              },
            ]"
            :key="idx"
            class="crit-item"
            :class="
              item.ref === null
                ? ''
                : item.ref === 'yes'
                  ? 'item-ok'
                  : 'item-fail'
            "
          >
            <div class="item-header">
              <span class="item-qnum q-c">{{ item.id }}</span>
              <div class="item-name-block">
                <span class="item-name">{{ item.zh }}</span>
              </div>
              <div class="yn-row">
              <button
                class="btn-yn btn-yn-ok"
                :class="{ 'yn-ok-active': item.ref === 'yes' }"
                @click="item.setter('yes')"
              >
                是
              </button>
              <button
                class="btn-yn btn-yn-fail"
                :class="{ 'yn-fail-active': item.ref === 'no' }"
                @click="item.setter('no')"
              >
                否
              </button>
            </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Criterion D -->
      <div class="nihss-group">
        <div class="group-header-bar crit-bar-d">
          <span class="group-icon">🅓</span>
          <span class="group-label-text">標準 D：排除其他診斷</span>
          <span class="group-sub-text"
            >症狀不能更好地以其他 ICHD-3 診斷解釋（特別須排除 TIA）</span
          >
          <span
            class="group-score-tally"
            :class="
              aw_d !== null
                ? aw_d === 'yes'
                  ? 'tally-ok'
                  : 'tally-abn'
                : 'tally-nd'
            "
          >
            {{ aw_d !== null ? (aw_d === "yes" ? "✓ 達標" : "✗ 未達") : "—" }}
          </span>
        </div>
        <div
          class="crit-item"
          :class="aw_d === null ? '' : aw_d === 'yes' ? 'item-ok' : 'item-fail'"
        >
          <div class="item-header">
            <span class="item-qnum q-e">D</span>
            <div class="item-name-block">
              <span class="item-name"
                >已排除 TIA 及其他可能導致類似先兆症狀的疾病？</span
              >
            </div>
            <div class="yn-row">
            <button
              class="btn-yn btn-yn-ok"
              :class="{ 'yn-ok-active': aw_d === 'yes' }"
              @click="aw_d = 'yes'"
            >
              是
            </button>
            <button
              class="btn-yn btn-yn-fail"
              :class="{ 'yn-fail-active': aw_d === 'no' }"
              @click="aw_d = 'no'"
            >
              否
            </button>
          </div>
            </div>
        </div>
      </div>

      <!-- Results detail (toggled) -->
      <div v-if="showResults && aw_complete" class="results-detail">
        <div class="results-header">ICHD-3 1.2 評估明細</div>
        <div
          v-for="(row, idx) in [
            { label: 'A', desc: '發作次數 ≥2 次', met: aw_a === 'yes' },
            { label: 'B', desc: `先兆類型 ≥1 種`, met: aw_b_met },
            {
              label: 'C',
              desc: `先兆特徵 ${aw_c_score}/6`,
              met: aw_c_score >= 3,
            },
            { label: 'D', desc: '排除 TIA 及其他', met: aw_d === 'yes' },
          ]"
          :key="idx"
          class="detail-row"
        >
          <span class="detail-qnum" style="color: #ef4444">{{
            row.label
          }}</span>
          <span class="detail-domain">{{ row.desc }}</span>
          <span class="detail-score" :class="row.met ? 'ds-ok' : 'ds-abn'">{{
            row.met ? "✓ 達標" : "✗ 未達"
          }}</span>
        </div>
        <div class="detail-row detail-total">
          <span class="detail-qnum" style="color: #ef4444">∑</span>
          <span class="detail-domain">ICHD-3 1.2 總判讀</span>
          <span class="detail-score detail-score-brand">{{
            aw_result.met ? "符合" : "不符合"
          }}</span>
          <span class="detail-desc">{{
            aw_result.level.substring(0, 12)
          }}</span>
        </div>
      </div>

      <!-- Result card -->
      <div class="result-card" :class="aw_result.color">
        <div class="result-left">
          <span class="result-number">{{
            aw_complete ? (aw_result.met ? "✓" : "✗") : "—"
          }}</span>
        </div>
        <div class="result-right">
          <span class="result-ver">ICHD-3 1.2 有先兆偏頭痛</span>
          <span class="result-level">{{ aw_result.level }}</span>
          <span class="result-advice" v-if="aw_complete">
            {{
              aw_result.met
                ? "符合 ICHD-3 診斷標準。有先兆偏頭痛需特別排除 TIA。建議神經科確認診斷。"
                : "尚不符合完整診斷標準。可記錄為 Probable Migraine with Aura，建議頭痛日誌追蹤及神經科評估。"
            }}
          </span>
        </div>
      </div>
    </template>

    <!-- ── Warning box ────────────────────────────────────────── -->
    <div class="warn-box">
      <span class="warn-icon">⚠</span>
      <span v-if="mainTab === 'screen'">
        ID Migraine 為初步篩查工具（敏感性 81%，特異性
        75%），不能取代完整病史詢問及 ICHD-3
        診斷標準。篩查陽性需排除繼發性頭痛紅旗徵兆。
      </span>
      <span v-else>
        ICHD-3
        診斷標準為臨床診斷工具，偏頭痛的診斷仍需依賴完整病史詢問。有先兆偏頭痛需特別排除
        TIA，尤其是首次出現神經學症狀的患者。
      </span>
    </div>

    <!-- ── Actions ────────────────────────────────────────────── -->
    <div class="mg-actions">
      <button class="btn-view" @click="showResults = !showResults">
        {{ showResults ? "收起明細" : "查看評估結果" }}
      </button>
      <button class="btn-copy" :disabled="!currentComplete" @click="copyOutput">
        {{ copied ? "已複製 ✓" : "複製 Markdown 結果" }}
      </button>
      <button class="btn-reset" @click="reset">重置</button>
    </div>
    <p v-if="!currentComplete" class="progress-hint">
      已完成 {{ currentAnswered }}/{{ totalQ }} 題
    </p>
  </div>
  </div>
</template>

<style scoped>
.migraineassess {
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
  flex-wrap: wrap;
}

.tab-btn {
  flex: 1;
  min-width: 140px;
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
  opacity: 0.7;
}

@media (max-width: 640px) {
  .tab-btn {
    padding: 0.5rem 0.65rem;
    min-width: 45%;
  }
  .tab-label {
    font-size: 0.9rem;
  }
  .tab-sub {
    font-size: 0.72rem;
  }
}

/* ══════════════ 偏頭痛篩查與診斷（Migraine Screen & ICHD-3）══════════════ */

.mg /* ── Root ─────────────────────────────────────────────────────── */
.mg {
  max-width: 780px;
  margin: 0 auto;
  padding: 2rem 0 3rem;
  font-size: 0.9rem;
}
.mg /* ── Header ──────────────────────────────────────────────────── */
.mg-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 1rem;
  flex-wrap: nowrap;
}
.mg .header-title {
  flex: 1;
  min-width: 0;
}
.mg .title {
  font-size: 24px;
  font-weight: 600;
  color: var(--vp-c-text-1);
  margin: 0 0 0.2rem;
  border: none !important;
  padding: 0 !important;
}
.mg .subtitle {
  font-size: 0.75rem;
  color: var(--vp-c-text-3);
  margin: 0;
  line-height: 1.6;
}
.mg .subtitle-2 {
  margin: 0.25rem 0 0;
}
.mg .hint-tag {
  display: inline-block;
  font-size: 0.72rem;
  font-weight: 700;
  padding: 2px 10px;
  border-radius: 999px;
  white-space: nowrap;
}
.mg .hint-mg {
  background: rgba(139, 92, 246, 0.12);
  color: #7c3aed;
}
.mg /* ── Score badge ─────────────────────────────────────────────── */
.score-badge {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-width: 96px;
  min-height: 88px;
  flex-shrink: 0;
  padding: 0.6rem 1rem;
  border-radius: 14px;
  border: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg-soft);
  transition: all 0.3s;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
}
.mg .badge-top {
  font-size: 0.58rem;
  font-weight: 700;
  color: var(--vp-c-text-3);
  text-align: center;
  white-space: nowrap;
}
.mg .score-number {
  font-size: 2rem;
  font-weight: 800;
  line-height: 1;
  min-width: 2ch;
  text-align: center;
}
.mg .score-number .score-unit {
  font-size: 0.65rem;
  font-weight: 600;
  vertical-align: super;
  transition: opacity 0.2s;
}
.mg .score-bot {
  font-size: 0.62rem;
  font-weight: 600;
  margin-top: 3px;
  text-align: center;
}
.mg .score-badge.filling {
  color: var(--vp-c-text-3);
}
.mg .score-badge.normal {
  border-color: #22c55e;
  color: #22c55e;
  box-shadow:
    0 0 0 1px rgba(34, 197, 94, 0.08),
    0 1px 3px rgba(0, 0, 0, 0.04);
}
.mg .score-badge.moderate {
  border-color: #f97316;
  color: #f97316;
  box-shadow:
    0 0 0 1px rgba(249, 115, 22, 0.08),
    0 1px 3px rgba(0, 0, 0, 0.04);
}
.mg .score-badge.critical {
  border-color: #ef4444;
  color: #ef4444;
  box-shadow:
    0 0 0 1px rgba(239, 68, 68, 0.08),
    0 1px 3px rgba(0, 0, 0, 0.04);
}
.mg /* ── Summary strip ───────────────────────────────────────────── */
.tab-strip {
  display: flex;
  gap: 0.65rem;
  margin-bottom: 1.25rem;
}
.mg .tab-strip-card {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  padding: 0.65rem 0.5rem;
  border-radius: 10px;
  cursor: pointer;
  text-align: center;
  border: 2px solid var(--vp-c-divider);
  background: var(--vp-c-bg-soft);
  transition: all 0.2s;
}
.mg .tab-strip-card:hover {
  border-color: var(--vp-c-brand-1);
}
.mg .tab-strip-card.tab-active {
  box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.18);
  border-color: #8b5cf6;
}
.mg .tab-strip-card.tab-nd {
  border-color: var(--vp-c-divider);
}
.mg .tab-strip-card.normal {
  border-color: #22c55e;
}
.mg .tab-strip-card.moderate {
  border-color: #f97316;
}
.mg .tab-strip-card.critical {
  border-color: #ef4444;
}
.mg .tsc-icon {
  font-size: 1.1rem;
}
.mg .tsc-label {
  font-size: 0.7rem;
  font-weight: 800;
  color: var(--vp-c-text-2);
}
.mg .tsc-val {
  font-size: 1.7rem;
  font-weight: 900;
  color: var(--vp-c-text-1);
  line-height: 1;
}
.mg .tab-strip-card.normal .tsc-val {
  color: #22c55e;
}
.mg .tab-strip-card.moderate .tsc-val {
  color: #f97316;
}
.mg .tab-strip-card.critical .tsc-val {
  color: #ef4444;
}
.mg .tsc-sub {
  font-size: 0.62rem;
  color: var(--vp-c-text-3);
  font-weight: 600;
}
.mg /* ── Tab row ─────────────────────────────────────────────────── */
.tab-row {
  display: flex;
  gap: 0.4rem;
  flex-wrap: wrap;
}
.mg .tab-btn {
  flex: 1;
  min-width: 150px;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.6rem 0.75rem;
  border-radius: 10px;
  border: 1.5px solid var(--vp-c-divider);
  background: var(--vp-c-bg-soft);
  cursor: pointer;
  font-family: inherit;
  transition: all 0.18s;
  text-align: left;
}
.mg .tab-btn:hover {
  border-color: var(--vp-c-brand-1);
}
.mg .tab-scr {
  border-color: #f97316;
  background: rgba(249, 115, 22, 0.06);
}
.mg .tab-wo {
  border-color: #3b82f6;
  background: rgba(59, 130, 246, 0.06);
}
.mg .tab-wi {
  border-color: #ef4444;
  background: rgba(239, 68, 68, 0.06);
}
.mg .tb-icon {
  font-size: 1.1rem;
  flex-shrink: 0;
}
.mg .tb-body {
  display: flex;
  flex-direction: column;
  flex: 1;
}
.mg .tb-title {
  font-size: 0.84rem;
  font-weight: 700;
  color: var(--vp-c-text-1);
}
.mg .tb-sub {
  font-size: 0.63rem;
  color: var(--vp-c-text-3);
}
.mg .tab-scr .tb-title {
  color: #f97316;
}
.mg .tab-wo .tb-title {
  color: #3b82f6;
}
.mg .tab-wi .tb-title {
  color: #ef4444;
}
.mg .tb-score {
  font-size: 0.8rem;
  font-weight: 800;
  padding: 2px 7px;
  border-radius: 999px;
  flex-shrink: 0;
}
.mg .tbs-pos {
  color: #ef4444;
  background: rgba(239, 68, 68, 0.12);
}
.mg .tbs-neg {
  color: #22c55e;
  background: rgba(34, 197, 94, 0.12);
}
.mg .tbs-nd {
  color: var(--vp-c-text-3);
  background: var(--vp-c-bg-mute);
}
.mg /* ── Severity bar ────────────────────────────────────────────── */
.severity-bar-wrap {
  margin-bottom: 2rem;
}
.mg .severity-bar {
  position: relative;
  height: 8px;
  border-radius: 999px;
  background: var(--vp-c-bg-mute);
  overflow: visible;
  margin-bottom: 4px;
  box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.08);
}
.mg .severity-fill {
  height: 100%;
  border-radius: 999px;
  transition:
    width 0.5s cubic-bezier(0.22, 1, 0.36, 1),
    background 0.3s;
}
.mg .severity-fill.filling {
  background: var(--vp-c-divider);
}
.mg .severity-fill.normal {
  background: linear-gradient(90deg, #22c55e, #4ade80);
}
.mg .severity-fill.moderate {
  background: linear-gradient(90deg, #f97316, #fb923c);
}
.mg .severity-fill.critical {
  background: linear-gradient(90deg, #ef4444, #f87171);
}
.mg .severity-ticks-abs {
  position: relative;
  height: 14px;
  margin-top: 2px;
}
.mg .tick-abs {
  position: absolute;
  transform: translateX(-50%);
  font-size: 0.65rem;
  color: var(--vp-c-text-3);
  white-space: nowrap;
}
.mg .tick-abs[style*="left:0%"] {
  transform: translateX(0);
}
.mg .tick-abs[style*="left:100%"] {
  transform: translateX(-100%);
}
.mg .tick-yellow {
  color: #f59e0b;
  font-weight: 700;
}
.mg .tick-red {
  color: #ef4444;
  font-weight: 700;
}
.mg /* ── Alert ───────────────────────────────────────────────────── */
.mg-alert {
  display: flex;
  align-items: flex-start;
  gap: 0.6rem;
  padding: 0.75rem 1rem;
  border-radius: 10px;
  font-size: 0.82rem;
  color: var(--vp-c-text-2);
  line-height: 1.6;
  margin-bottom: 1rem;
}
.mg .alert-critical {
  background: rgba(239, 68, 68, 0.06);
  border: 1px solid rgba(239, 68, 68, 0.35);
}
.mg .alert-icon {
  color: #ef4444;
  flex-shrink: 0;
}
.mg /* ── Groups ──────────────────────────────────────────────────── */
.nihss-group {
  margin-bottom: 1.25rem;
}
.mg .group-header-bar {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.65rem 0.85rem 0.65rem 1.5rem;
  border-radius: 10px;
  border: 1px solid var(--vp-c-divider);
  border-left: 4px solid #06b6d4;
  margin-bottom: 0.5rem;
  box-shadow: 0 1px 3px rgba(6, 182, 212, 0.06);
}
.mg .tab-bar {
  border-left-color: #8b5cf6;
  background: linear-gradient(
    135deg,
    rgba(139, 92, 246, 0.08),
    var(--vp-c-bg-mute),
    var(--vp-c-bg-soft)
  );
  box-shadow: 0 1px 3px rgba(139, 92, 246, 0.06);
}
.mg .q-bar {
  border-left-color: #f97316;
  box-shadow: 0 1px 3px rgba(249, 115, 22, 0.06);
}
.mg .crit-bar-a {
  border-left-color: #3b82f6;
  background: linear-gradient(
    135deg,
    rgba(59, 130, 246, 0.08),
    var(--vp-c-bg-mute),
    var(--vp-c-bg-soft)
  );
  box-shadow: 0 1px 3px rgba(59, 130, 246, 0.06);
}
.mg .crit-bar-b {
  border-left-color: #06b6d4;
  background: linear-gradient(
    135deg,
    rgba(6, 182, 212, 0.08),
    var(--vp-c-bg-mute),
    var(--vp-c-bg-soft)
  );
  box-shadow: 0 1px 3px rgba(6, 182, 212, 0.06);
}
.mg .crit-bar-c {
  border-left-color: #f97316;
  background: linear-gradient(
    135deg,
    rgba(249, 115, 22, 0.08),
    var(--vp-c-bg-mute),
    var(--vp-c-bg-soft)
  );
  box-shadow: 0 1px 3px rgba(249, 115, 22, 0.06);
}
.mg .crit-bar-d {
  border-left-color: #22c55e;
  background: linear-gradient(
    135deg,
    rgba(34, 197, 94, 0.08),
    var(--vp-c-bg-mute),
    var(--vp-c-bg-soft)
  );
  box-shadow: 0 1px 3px rgba(34, 197, 94, 0.06);
}
.mg .crit-bar-e {
  border-left-color: #a855f7;
  background: linear-gradient(
    135deg,
    rgba(168, 85, 247, 0.08),
    var(--vp-c-bg-mute),
    var(--vp-c-bg-soft)
  );
  box-shadow: 0 1px 3px rgba(168, 85, 247, 0.06);
}
.mg .group-icon {
  font-size: 1rem;
  flex-shrink: 0;
}
.mg .group-label-text {
  font-size: 0.88rem;
  font-weight: 800;
  color: var(--vp-c-text-1);
}
.mg .group-sub-text {
  font-size: 0.7rem;
  color: var(--vp-c-text-3);
  flex: 1;
}
.mg .group-score-tally {
  font-size: 0.78rem;
  font-weight: 700;
  padding: 4px 14px;
  border-radius: 999px;
  flex-shrink: 0;
  white-space: nowrap;
  text-align: center;
  border: 1px solid transparent;
  box-sizing: border-box;
}
.mg .tally-ok {
  color: #22c55e;
  background: rgba(34, 197, 94, 0.06);
  border-color: rgba(34, 197, 94, 0.25);
}
.mg .tally-abn {
  color: #ef4444;
  background: rgba(239, 68, 68, 0.06);
  border-color: rgba(239, 68, 68, 0.25);
}
.mg .tally-nd {
  color: var(--vp-c-text-3);
  background: var(--vp-c-bg-soft);
  border-color: var(--vp-c-divider);
}
.mg /* ── Items ───────────────────────────────────────────────────── */
.item-list {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}
.mg .crit-item {
  border: 1px solid var(--vp-c-divider);
  border-radius: 10px;
  background: var(--vp-c-bg-soft);
  overflow: hidden;
  transition: border-color 0.2s;
}
.mg .item-yes,
.mg .item-ok {
  border-color: #ef4444;
}
.mg .item-no,
.mg .item-fail {
  border-color: #22c55e;
}
.mg .item-na {
  border-color: var(--vp-c-divider);
  opacity: 0.65;
}
.mg .item-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  padding: 0.55rem 0.9rem;
  background: var(--vp-c-bg-mute);
  border-bottom: 1px solid var(--vp-c-divider);
  gap: 0.75rem;
}
.mg .item-qnum {
  font-size: 0.72rem;
  font-weight: 800;
  padding: 1px 8px;
  border-radius: 999px;
  flex-shrink: 0;
  padding-top: 3px;
  white-space: nowrap;
}
.mg .q-nausea {
  color: #f97316;
  background: rgba(249, 115, 22, 0.12);
}
.mg .q-photo {
  color: #f59e0b;
  background: rgba(245, 158, 11, 0.12);
}
.mg .q-dis {
  color: #ef4444;
  background: rgba(239, 68, 68, 0.12);
}
.mg .q-a {
  color: #3b82f6;
  background: rgba(59, 130, 246, 0.12);
}
.mg .q-b {
  color: #06b6d4;
  background: rgba(6, 182, 212, 0.12);
}
.mg .q-c {
  color: #f97316;
  background: rgba(249, 115, 22, 0.12);
}
.mg .q-d {
  color: #22c55e;
  background: rgba(34, 197, 94, 0.12);
}
.mg .q-e {
  color: #a855f7;
  background: rgba(168, 85, 247, 0.12);
}
.mg .item-name-block {
  display: flex;
  flex-direction: column;
  gap: 2px;
  flex: 1;
}
.mg .item-name {
  font-size: 0.87rem;
  font-weight: 600;
  color: var(--vp-c-text-1);
}
.mg .item-sub {
  font-size: 0.68rem;
  color: var(--vp-c-text-3);
  line-height: 1.5;
}
.mg .item-val {
  font-size: 0.85rem;
  font-weight: 800;
  flex-shrink: 0;
  min-width: 30px;
  text-align: right;
}
.mg .val-yes,
.mg .val-ok {
  color: #ef4444;
}
.mg .val-no,
.mg .val-fail {
  color: #22c55e;
}
.mg .val-nd {
  color: var(--vp-c-text-3);
}
/* ── Yes/No buttons ── */
.mg .yn-row {
  display: flex;
  gap: 2px;
  padding: 3px;
  background: var(--vp-c-bg-mute);
  border-top: 1px solid var(--vp-c-divider);
}
.mg .btn-yn {
  flex: 1;
  padding: 0.6rem 0.15rem;
  font-size: 0.84rem;
  font-weight: 700;
  cursor: pointer;
  font-family: inherit;
  border: 1.5px solid transparent;
  border-radius: 6px;
  background: var(--vp-c-bg);
  color: var(--vp-c-text-2);
  transition: all 0.2s;
  text-align: center;
}
.mg .btn-yn:hover {
  border-color: var(--vp-c-divider);
  background: var(--vp-c-bg-soft);
}
.mg .btn-yn-yes.yn-yes-active,
.mg .btn-yn-ok.yn-ok-active {
  border-color: #ef4444;
  background: color-mix(in srgb, rgb(239, 68, 68) 18%, var(--vp-c-bg));
  box-shadow: 0 0 0 1px rgba(239, 68, 68, 0.08);
  color: #ef4444;
}
.mg .btn-yn-no.yn-no-active,
.mg .btn-yn-fail.yn-fail-active {
  border-color: #22c55e;
  background: color-mix(in srgb, rgb(34, 197, 94) 18%, var(--vp-c-bg));
  box-shadow: 0 0 0 1px rgba(34, 197, 94, 0.08);
  color: #22c55e;
}
.mg /* ── Sub-score row ───────────────────────────────────────────── */
.sub-score-row {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
  flex-wrap: wrap;
}
.mg .sub-score-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0.5rem 0.75rem;
  border-radius: 10px;
  border: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg-soft);
  min-width: 72px;
  flex: 1;
  max-width: 110px;
  transition: border-color 0.3s;
}
.mg .ss-pos {
  border-color: #ef4444;
}
.mg .ss-neg {
  border-color: #22c55e;
}
.mg .ss-nd {
  opacity: 0.5;
}
.mg .ss-label {
  font-size: 0.65rem;
  color: var(--vp-c-text-3);
  font-weight: 600;
}
.mg .ss-val {
  font-size: 1.5rem;
  font-weight: 800;
  color: var(--vp-c-text-1);
  line-height: 1;
}
.mg .ss-pos .ss-val {
  color: #ef4444;
}
.mg .ss-neg .ss-val {
  color: #22c55e;
}
.mg .ss-max {
  font-size: 0.6rem;
  color: var(--vp-c-text-3);
}
.mg /* ── Result card ─────────────────────────────────────────────── */
.result-card {
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
  min-height: 96px;
  box-sizing: border-box;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
}
.mg .result-card.filling {
  border-color: var(--vp-c-divider);
}
.mg .result-card.normal {
  border-color: #22c55e;
  box-shadow:
    0 0 0 1px rgba(34, 197, 94, 0.06),
    0 1px 3px rgba(0, 0, 0, 0.04);
}
.mg .result-card.moderate {
  border-color: #f97316;
  box-shadow:
    0 0 0 1px rgba(249, 115, 22, 0.06),
    0 1px 3px rgba(0, 0, 0, 0.04);
}
.mg .result-card.critical {
  border-color: #ef4444;
  box-shadow:
    0 0 0 1px rgba(239, 68, 68, 0.06),
    0 1px 3px rgba(0, 0, 0, 0.04);
}
.mg .result-left {
  display: flex;
  align-items: baseline;
  gap: 4px;
  flex-shrink: 0;
}
.mg .result-number {
  font-size: 3.5rem;
  font-weight: 800;
  line-height: 1;
  color: var(--vp-c-text-3);
  transition: color 0.3s;
  min-width: 2ch;
  text-align: right;
}
.mg .result-card.normal .result-number {
  color: #22c55e;
}
.mg .result-card.moderate .result-number {
  color: #f97316;
}
.mg .result-card.critical .result-number {
  color: #ef4444;
}
.mg .result-max {
  font-size: 1rem;
  color: var(--vp-c-text-3);
  min-width: 2ch;
  transition: opacity 0.2s;
}
.mg .result-right {
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: 1;
}
.mg .result-ver {
  font-size: 0.72rem;
  font-weight: 700;
  color: var(--vp-c-text-3);
}
.mg .result-level {
  font-size: 1rem;
  font-weight: 700;
  color: var(--vp-c-text-1);
}
.mg .result-advice {
  font-size: 0.83rem;
  color: var(--vp-c-text-2);
  line-height: 1.5;
}
.mg /* ── Results detail ──────────────────────────────────────────── */
.results-detail {
  border: 1px solid var(--vp-c-divider);
  border-radius: 10px;
  overflow: hidden;
  margin-bottom: 1rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.03);
}
.mg .results-header {
  padding: 0.5rem 0.9rem;
  font-size: 0.72rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--vp-c-text-3);
  background: var(--vp-c-bg-mute);
  border-bottom: 1px solid var(--vp-c-divider);
}
.mg .detail-row {
  display: flex;
  align-items: flex-start;
  gap: 0.6rem;
  padding: 0.5rem 0.9rem;
  border-bottom: 1px solid var(--vp-c-divider);
}
.mg .detail-row:last-child {
  border-bottom: none;
}
.mg .detail-total {
  background: linear-gradient(135deg, var(--vp-c-bg-mute), var(--vp-c-bg-soft));
  font-weight: 800;
}
.mg .detail-qnum {
  font-size: 0.7rem;
  font-weight: 800;
  flex-shrink: 0;
  width: 32px;
  padding-top: 1px;
}
.mg .detail-domain {
  font-size: 0.78rem;
  font-weight: 700;
  color: var(--vp-c-text-1);
  flex: 1;
}
.mg .detail-score {
  font-size: 0.82rem;
  font-weight: 800;
  flex-shrink: 0;
  width: 64px;
  text-align: right;
  color: var(--vp-c-text-3);
}
.mg .ds-ok {
  color: #22c55e;
}
.mg .ds-abn {
  color: #ef4444;
}
.mg .detail-score-brand {
  color: var(--vp-c-brand-1);
}
.mg .detail-desc {
  font-size: 0.75rem;
  color: var(--vp-c-text-2);
  flex-shrink: 0;
}
.mg /* ── Warn / Actions ──────────────────────────────────────────── */
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
.mg .warn-icon {
  color: #f97316;
  flex-shrink: 0;
}
.mg .mg-actions {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}
.mg .btn-view,
.mg .btn-copy,
.mg .btn-reset {
  padding: 9px 22px;
  border-radius: 8px;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  font-family: inherit;
  transition: all 0.2s;
}
.mg .btn-view {
  border: none;
  background: linear-gradient(135deg, var(--vp-c-brand-1), #4f46e5);
  color: #fff;
  box-shadow: 0 2px 8px rgba(99, 102, 241, 0.3);
}
.mg .btn-view:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 14px rgba(99, 102, 241, 0.4);
}
.mg .btn-view:active {
  transform: translateY(0);
}
.mg .btn-copy {
  border: 1.5px solid var(--vp-c-brand-1);
  background: transparent;
  color: var(--vp-c-brand-1);
}
.mg .btn-copy:hover:not(:disabled) {
  background: var(--vp-c-brand-soft);
}
.mg .btn-copy:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}
.mg .btn-reset {
  border: 1px solid var(--vp-c-divider);
  background: transparent;
  color: var(--vp-c-text-2);
}
.mg .btn-reset:hover {
  border-color: #ef4444;
  color: #ef4444;
  background: rgba(239, 68, 68, 0.04);
}
.mg .progress-hint {
  font-size: 0.75rem;
  color: var(--vp-c-text-3);
  margin: 0.4rem 0 0;
}

@media (max-width: 640px) {
.mg .mg-header {
    flex-wrap: wrap;
  }
.mg .score-badge {
    align-self: flex-start;
  }
.mg .result-card {
    flex-direction: column;
    gap: 0.75rem;
  }
.mg .tab-row {
    flex-direction: column;
  }
.mg .tab-strip {
    flex-direction: column;
  }
}
/* ── ID Migraine / criteria: options in the same row as the question (ICOPE style) ── */
.mg .item-header {
  align-items: center;
}
.mg .item-header .yn-row {
  flex: 0 0 auto;
  justify-content: flex-end;
  background: none;
  border-top: none;
  padding: 0;
  margin-top: 0;
  gap: 0.4rem;
}
.mg .item-header .yn-row .btn-yn {
  flex: 0 0 auto;
  min-width: 58px;
  padding: 0.5rem 0.9rem;
}
</style>
