<script setup lang="ts">
import { ref, computed } from "vue";

// ── WHO 近距離視力測試卡 ─────────────────────────────────────────
// WHO Simple Vision Chart — Tumbling E Near Card
// Testing distance: 40 cm · 4 rows × 4 optotypes = 16 symbols
// TWO independent answer sets: Right Eye (OD) / Left Eye (OS)
// Pass criterion: Row 2 (6/18) ≥ 3/4 correct

type Dir = "up" | "down" | "left" | "right";
type RowAns = (Dir | null)[];
type Eye = "right" | "left";

interface Row {
  snellen: string;
  sizeMm: number;
  dirs: Dir[];
  isThreshold: boolean;
}

const rows: Row[] = [
  {
    snellen: "6/36",
    sizeMm: 9.89,
    dirs: ["right", "down", "left", "up"],
    isThreshold: false,
  },
  {
    snellen: "6/18",
    sizeMm: 4.96,
    dirs: ["up", "right", "down", "left"],
    isThreshold: true,
  },
  {
    snellen: "6/12",
    sizeMm: 3.3,
    dirs: ["left", "up", "right", "down"],
    isThreshold: false,
  },
  {
    snellen: "6/6",
    sizeMm: 1.65,
    dirs: ["down", "left", "up", "right"],
    isThreshold: false,
  },
];

// ── Embedded SVG path data (physical mm viewBox from uploaded files) ──
const svgInner: Record<string, string> = {
  "6/36-right": `<g><rect width="9.89" height="1.98"/><rect y="3.96" width="9.89" height="1.98"/><rect y="7.91" width="9.89" height="1.98"/><rect y="1.98" width="1.98" height="1.98"/><rect y="5.94" width="1.98" height="1.98"/></g>`,
  "6/36-left": `<g><rect y="7.91" width="9.89" height="1.98"/><rect y="3.96" width="9.89" height="1.98"/><rect width="9.89" height="1.98"/><rect x="7.91" y="5.94" width="1.98" height="1.98"/><rect x="7.91" y="1.98" width="1.98" height="1.98"/></g>`,
  "6/36-up": `<g><rect width="1.98" height="9.89"/><rect x="3.96" width="1.98" height="9.89"/><rect x="7.91" width="1.98" height="9.89"/><rect x="1.98" y="7.91" width="1.98" height="1.98"/><rect x="5.94" y="7.91" width="1.98" height="1.98"/></g>`,
  "6/36-down": `<g><rect x="7.91" width="1.98" height="9.89"/><rect x="3.96" width="1.98" height="9.89"/><rect width="1.98" height="9.89"/><rect x="5.94" width="1.98" height="1.98"/><rect x="1.98" width="1.98" height="1.98"/></g>`,
  "6/18-right": `<g><rect width="4.96" height=".99"/><rect y="1.98" width="4.96" height=".99"/><rect y="3.97" width="4.96" height=".99"/><rect y=".99" width=".99" height=".99"/><rect y="2.98" width=".99" height=".99"/></g>`,
  "6/18-left": `<g><rect y="3.97" width="4.96" height=".99"/><rect y="1.98" width="4.96" height=".99"/><rect width="4.96" height=".99"/><rect x="3.97" y="2.98" width=".99" height=".99"/><rect x="3.97" y=".99" width=".99" height=".99"/></g>`,
  "6/18-up": `<g><rect width=".99" height="4.96"/><rect x="1.98" width=".99" height="4.96"/><rect x="3.97" width=".99" height="4.96"/><rect x=".99" y="3.97" width=".99" height=".99"/><rect x="2.98" y="3.97" width=".99" height=".99"/></g>`,
  "6/18-down": `<g><rect x="3.97" width=".99" height="4.96"/><rect x="1.98" width=".99" height="4.96"/><rect width=".99" height="4.96"/><rect x="2.98" width=".99" height=".99"/><rect x=".99" width=".99" height=".99"/></g>`,
  "6/12-right": `<g><rect width="3.3" height=".66"/><rect y="1.32" width="3.3" height=".66"/><rect y="2.64" width="3.3" height=".66"/><rect y=".66" width=".66" height=".66"/><rect y="1.98" width=".66" height=".66"/></g>`,
  "6/12-left": `<g><rect y="2.64" width="3.3" height=".66"/><rect y="1.32" width="3.3" height=".66"/><rect width="3.3" height=".66"/><rect x="2.64" y="1.98" width=".66" height=".66"/><rect x="2.64" y=".66" width=".66" height=".66"/></g>`,
  "6/12-up": `<g><rect width=".66" height="3.3"/><rect x="1.32" width=".66" height="3.3"/><rect x="2.64" width=".66" height="3.3"/><rect x=".66" y="2.64" width=".66" height=".66"/><rect x="1.98" y="2.64" width=".66" height=".66"/></g>`,
  "6/12-down": `<g><rect x="2.64" width=".66" height="3.3"/><rect x="1.32" width=".66" height="3.3"/><rect width=".66" height="3.3"/><rect x="1.98" width=".66" height=".66"/><rect x=".66" width=".66" height=".66"/></g>`,
  "6/6-right": `<g><rect width="1.65" height=".33"/><rect y=".66" width="1.65" height=".33"/><rect y="1.32" width="1.65" height=".33"/><rect y=".33" width=".33" height=".33"/><rect y=".99" width=".33" height=".33"/></g>`,
  "6/6-left": `<g><rect y="1.32" width="1.65" height=".33"/><rect y=".66" width="1.65" height=".33"/><rect width="1.65" height=".33"/><rect x="1.32" y=".99" width=".33" height=".33"/><rect x="1.32" y=".33" width=".33" height=".33"/></g>`,
  "6/6-up": `<g><rect width=".33" height="1.65"/><rect x=".66" width=".33" height="1.65"/><rect x="1.32" width=".33" height="1.65"/><rect x=".33" y="1.32" width=".33" height=".33"/><rect x=".99" y="1.32" width=".33" height=".33"/></g>`,
  "6/6-down": `<g><rect x="1.32" width=".33" height="1.65"/><rect x=".66" width=".33" height="1.65"/><rect width=".33" height="1.65"/><rect x=".99" width=".33" height=".33"/><rect x=".33" width=".33" height=".33"/></g>`,
};

function getSvgInner(snellen: string, dir: Dir): string {
  return svgInner[`${snellen}-${dir}`] ?? "";
}

// ── Eye tab state ─────────────────────────────────────────────────
const activeEye = ref<Eye>("right");

// Independent answer arrays — one per eye
const answersOD = ref<RowAns[]>(rows.map(() => [null, null, null, null]));
const answersOS = ref<RowAns[]>(rows.map(() => [null, null, null, null]));

// Proxy: reads/writes the active eye's array
const currentAnswers = computed(() =>
  activeEye.value === "right" ? answersOD.value : answersOS.value,
);

function setAnswer(ri: number, ci: number, dir: Dir) {
  if (activeEye.value === "right") answersOD.value[ri][ci] = dir;
  else answersOS.value[ri][ci] = dir;
}

function switchEye(eye: Eye) {
  activeEye.value = eye;
  showResults.value = false;
}

// ── Per-eye stat helpers ──────────────────────────────────────────
function calcRowStats(ans: RowAns[]) {
  return rows.map((row, ri) => {
    const a = ans[ri];
    const answered = a.filter((v) => v !== null).length;
    const correct = a.filter((v, ci) => v === row.dirs[ci]).length;
    return { answered, correct, done: answered === 4 };
  });
}

function calcSymStatus(ans: RowAns[]) {
  return rows.map((row, ri) =>
    row.dirs.map((dir, ci) => {
      const v = ans[ri][ci];
      return v === null ? "unanswered" : v === dir ? "correct" : "wrong";
    }),
  );
}

function calcSeverity(stats: ReturnType<typeof calcRowStats>) {
  const done = stats.every((s) => s.done);
  if (!done)
    return { level: "填寫中", color: "filling", advice: "", screen: false };
  const c18 = stats[1].correct;
  const c12 = stats[2].correct;
  const c6 = stats[3].correct;
  if (c18 < 3)
    return {
      level: "視力受損（6/18 未通過）",
      color: "critical",
      advice:
        "6/18 行辨識 < 3/4，依 WHO 標準建議視為近距視力受損，請轉介眼科（屈光、白內障、青光眼及視網膜篩查）。",
      screen: true,
    };
  if (c12 < 3)
    return {
      level: "輕度視力障礙（6/12 未通過）",
      color: "moderate",
      advice: "6/18 通過但 6/12 未通過，建議轉介眼科評估，考慮老花眼鏡。",
      screen: true,
    };
  if (c6 < 3)
    return {
      level: "視力尚可（6/6 未通過）",
      color: "mild",
      advice:
        "6/18、6/12 均通過，但 6/6 未達標。近距視力可接受，建議 6–12 個月後追蹤。",
      screen: false,
    };
  return {
    level: "視力正常（6/6 通過）",
    color: "normal",
    advice: "所有列均通過，近距視力良好。建議每 6–12 個月定期追蹤。",
    screen: false,
  };
}

// ── Active-eye computed ───────────────────────────────────────────
const rowStats = computed(() => calcRowStats(currentAnswers.value));
const symStatus = computed(() => calcSymStatus(currentAnswers.value));
const severity = computed(() => calcSeverity(rowStats.value));
const row18 = computed(() => rowStats.value[1]);
const pass18 = computed(() =>
  row18.value.done ? row18.value.correct >= 3 : null,
);
const isComplete = computed(() => rowStats.value.every((s) => s.done));
const answeredTotal = computed(
  () => currentAnswers.value.flat().filter((a) => a !== null).length,
);
const barPct = computed(() =>
  row18.value.done
    ? (row18.value.correct / 4) * 100
    : (answeredTotal.value / 16) * 25,
);

// ── Both-eye summaries (for header strip) ─────────────────────────
const statsOD = computed(() => calcRowStats(answersOD.value));
const statsOS = computed(() => calcRowStats(answersOS.value));
const severityOD = computed(() => calcSeverity(statsOD.value));
const severityOS = computed(() => calcSeverity(statsOS.value));
const row18OD = computed(() => statsOD.value[1]);
const row18OS = computed(() => statsOS.value[1]);
const doneOD = computed(() => statsOD.value.every((s) => s.done));
const doneOS = computed(() => statsOS.value.every((s) => s.done));
const bothDone = computed(() => doneOD.value && doneOS.value);

const alertCombined = computed(() => {
  if (bothDone.value) {
    const od = severityOD.value.screen;
    const os = severityOS.value.screen;
    if (!od && !os) return null;
    const level = [
      od ? severityOD.value.level : null,
      os ? severityOS.value.level : null,
    ]
      .filter(Boolean)
      .join("；");
    const adv =
      od && os
        ? `${severityOD.value.advice} 左眼亦同，需雙眼評估。`
        : od
          ? severityOD.value.advice
          : severityOS.value.advice;
    const worst =
      od && os
        ? "critical"
        : od
          ? severityOD.value.color
          : severityOS.value.color;
    return { level, advice: adv, color: worst };
  }
  if (isComplete.value && severity.value.screen)
    return {
      level: severity.value.level,
      advice: severity.value.advice,
      color: severity.value.color,
    };
  return null;
});

// ── Direction helpers ─────────────────────────────────────────────
const dirArrow: Record<Dir, string> = {
  up: "↑",
  down: "↓",
  left: "←",
  right: "→",
};
const dirZh: Record<Dir, string> = {
  up: "↑ 上",
  down: "↓ 下",
  left: "← 左",
  right: "→ 右",
};
const allDirs: Dir[] = ["up", "down", "left", "right"];

// ── Markdown export ───────────────────────────────────────────────
const copied = ref(false);
const showResults = ref(false);

function eyeLines(ans: RowAns[], stats: ReturnType<typeof calcRowStats>) {
  return rows
    .map((row, ri) => {
      const s = stats[ri];
      const detail = row.dirs
        .map((d, ci) => {
          const a = ans[ri][ci];
          return !a
            ? `(${ci + 1})未填`
            : a === d
              ? `(${ci + 1})✓`
              : `(${ci + 1})✗答${dirArrow[a]}`;
        })
        .join(" ");
      return `- **${row.snellen}**${row.isThreshold ? "【臨界值】" : ""}：${s.correct}/4 正確 ${detail}`;
    })
    .join("\n");
}

function generateMarkdown(): string {
  const svOD = severityOD.value;
  const svOS = severityOS.value;
  const r18od = row18OD.value;
  const r18os = row18OS.value;
  return (
    `# WHO 近距離視力測試結果（測試距離 40 cm）\n\n` +
    `## 右眼（OD）\n\n` +
    eyeLines(answersOD.value, statsOD.value) +
    "\n\n" +
    `- 6/18 臨界行：${r18od.correct}/4 → ${doneOD.value ? (r18od.correct >= 3 ? "✅ 通過" : "⚠️ 未通過") : "未完成"}\n` +
    `- 判讀：${svOD.level}\n\n` +
    `## 左眼（OS）\n\n` +
    eyeLines(answersOS.value, statsOS.value) +
    "\n\n" +
    `- 6/18 臨界行：${r18os.correct}/4 → ${doneOS.value ? (r18os.correct >= 3 ? "✅ 通過" : "⚠️ 未通過") : "未完成"}\n` +
    `- 判讀：${svOS.level}\n\n---\n\n` +
    `## 雙眼摘要\n\n` +
    `| 眼別 | 6/36 | 6/18（臨界）| 6/12 | 6/6 | 判讀 |\n` +
    `|------|------|------------|------|-----|------|\n` +
    `| 右眼 OD | ${statsOD.value[0].correct}/4 | **${r18od.correct}/4** | ${statsOD.value[2].correct}/4 | ${statsOD.value[3].correct}/4 | ${svOD.level} |\n` +
    `| 左眼 OS | ${statsOS.value[0].correct}/4 | **${r18os.correct}/4** | ${statsOS.value[2].correct}/4 | ${statsOS.value[3].correct}/4 | ${svOS.level} |`
  );
}

async function copyOutput() {
  await navigator.clipboard.writeText(generateMarkdown());
  copied.value = true;
  setTimeout(() => (copied.value = false), 2000);
}

function resetCurrentEye() {
  if (activeEye.value === "right")
    answersOD.value = rows.map(() => [null, null, null, null]);
  else answersOS.value = rows.map(() => [null, null, null, null]);
  showResults.value = false;
}

function resetAll() {
  answersOD.value = rows.map(() => [null, null, null, null]);
  answersOS.value = rows.map(() => [null, null, null, null]);
  showResults.value = false;
}
</script>

<template>
  <div class="vis">
    <!-- ── Header ─────────────────────────────────────────────── -->
    <div class="vis-header">
      <div class="header-title">
        <h2 class="title">WHO 近距離視力測試卡</h2>
        <p class="subtitle">
          WHO Simple Vision Chart · Tumbling E · 測試距離 40 cm ·
          分別記錄右眼（OD）與左眼（OS）
        </p>
        <p class="subtitle-2">
          <span class="hint-tag hint-vis"
            >👁️ ICOPE 視力初評異常 請使用本量表複評</span
          >
        </p>
      </div>
      <div class="score-badge" :class="severity.color">
        <span class="badge-top"
          >{{ activeEye === "right" ? "右眼 OD" : "左眼 OS" }} · 6/18</span
        >
        <span class="score-number">{{ row18.done ? row18.correct : "—" }}</span>
        <span class="score-unit" :style="{ opacity: row18.done ? 1 : 0 }"
          >/4</span
        >
        <span class="score-bot">
          {{
            isComplete ? (pass18 ? "通過" : "未通過") : `${answeredTotal}/16`
          }}
        </span>
      </div>
    </div>

    <!-- ── Both-eye summary strip ─────────────────────────────── -->
    <div class="eye-strip">
      <div
        v-for="eye in ['right', 'left'] as Eye[]"
        :key="eye"
        class="eye-strip-card"
        :class="[
          eye === 'right'
            ? doneOD
              ? severityOD.color
              : 'eye-nd'
            : doneOS
              ? severityOS.color
              : 'eye-nd',
          activeEye === eye ? 'eye-active' : '',
        ]"
        @click="switchEye(eye)"
      >
        <span class="esc-label">{{
          eye === "right" ? "右眼 OD" : "左眼 OS"
        }}</span>
        <span class="esc-val">
          {{
            eye === "right"
              ? row18OD.done
                ? row18OD.correct + "/4"
                : "—"
              : row18OS.done
                ? row18OS.correct + "/4"
                : "—"
          }}
        </span>
        <span class="esc-sub">6/18 臨界行</span>
        <span class="esc-status">
          {{
            eye === "right"
              ? doneOD
                ? severityOD.level.split("（")[0]
                : "填寫中…"
              : doneOS
                ? severityOS.level.split("（")[0]
                : "填寫中…"
          }}
        </span>
      </div>
    </div>

    <!-- ── Eye tab selector ───────────────────────────────────── -->
    <div class="nihss-group">
      <div class="group-header-bar eye-bar">
        <span class="group-icon">👁️</span>
        <span class="group-label-text">眼別選擇</span>
        <span class="group-sub-text"
          >遮蓋一眼後選擇目前測試的眼睛，雙眼各測一次</span
        >
      </div>
      <div class="eye-tab-row">
        <button
          class="eye-tab"
          :class="{ 'eye-tab-r': activeEye === 'right' }"
          @click="switchEye('right')"
        >
          <span class="et-icon">👁️</span>
          <span class="et-body">
            <span class="et-title">右眼（OD）</span>
            <span class="et-sub">遮蓋左眼，測試右眼</span>
          </span>
          <span
            class="et-score"
            :class="
              row18OD.done
                ? row18OD.correct >= 3
                  ? 'ets-pass'
                  : 'ets-fail'
                : 'ets-nd'
            "
          >
            {{ row18OD.done ? row18OD.correct + "/4" : "—" }}
          </span>
        </button>
        <button
          class="eye-tab"
          :class="{ 'eye-tab-l': activeEye === 'left' }"
          @click="switchEye('left')"
        >
          <span class="et-icon">👁️</span>
          <span class="et-body">
            <span class="et-title">左眼（OS）</span>
            <span class="et-sub">遮蓋右眼，測試左眼</span>
          </span>
          <span
            class="et-score"
            :class="
              row18OS.done
                ? row18OS.correct >= 3
                  ? 'ets-pass'
                  : 'ets-fail'
                : 'ets-nd'
            "
          >
            {{ row18OS.done ? row18OS.correct + "/4" : "—" }}
          </span>
        </button>
      </div>
    </div>

    <!-- ── Severity bar (active eye) ─────────────────────────── -->
    <div class="severity-bar-wrap">
      <div class="severity-bar">
        <div
          class="severity-fill"
          :class="severity.color"
          :style="{ width: barPct + '%' }"
        />
      </div>
      <div class="severity-ticks-abs">
        <span class="tick-abs" style="left: 0%">0</span>
        <span class="tick-abs tick-red" style="left: 50%">2/4 ▾</span>
        <span class="tick-abs tick-ok" style="left: 75%">3/4 ▾</span>
        <span class="tick-abs tick-ok" style="left: 100%">4/4</span>
      </div>
      <div class="severity-labels-abs">
        <span class="label-abs tick-red" style="left: 0%">不通過</span>
        <span class="label-abs tick-ok" style="left: 75%">通過標準 ≥ 3/4</span>
      </div>
    </div>

    <!-- ── ICOPE notice ───────────────────────────────────────── -->
    <div class="icope-notice">
      <span class="notice-icon">📋</span>
      <span>
        本工具用於 <strong>ICOPE 視力初評異常</strong>後的複評。
        <span class="notice-sep">·</span>
        <strong class="vis-cross"
          >其他初評異常請使用：認知 → BHT/AD8、行動 → SPPB、憂鬱 →
          GDS-15。</strong
        >
      </span>
    </div>

    <!-- ── 施測說明 ────────────────────────────────────────────── -->
    <div class="nihss-group">
      <div class="group-header-bar inst-bar">
        <span class="group-icon">📏</span>
        <span class="group-label-text">施測說明</span>
        <span class="group-sub-text"
          >測試距離 40 cm · 遮蓋一眼 · 配戴眼鏡者於戴鏡狀態下測試</span
        >
      </div>
      <div class="inst-grid">
        <div class="inst-card">
          <span class="inst-num">1</span>
          <span
            >光線充足的環境下，手持本卡距患者眼睛正好
            <strong>40 cm</strong>（可用繩子量距）。</span
          >
        </div>
        <div class="inst-card">
          <span class="inst-num">2</span>
          <span
            >遮蓋左眼，於上方切換至「右眼」，從第一列（最大字）開始，請患者指出
            E 字缺口方向：<strong>↑上 / ↓下 / ←左 / →右</strong>。</span
          >
        </div>
        <div class="inst-card">
          <span class="inst-num">3</span>
          <span
            ><strong>第 2 列（6/18）</strong>為判讀關鍵：答對
            <strong>≥ 3/4</strong> 通過；< 3/4 建議轉介眼科。</span
          >
        </div>
        <div class="inst-card">
          <span class="inst-num">4</span>
          <span
            >右眼記錄完畢後，切換至「左眼」，遮蓋右眼，同法測試。分別記錄矯正（CC）及未矯正（SC）視力。</span
          >
        </div>
      </div>
    </div>

    <!-- ══ 視力測試圖 ══════════════════════════════════════════ -->
    <div class="nihss-group">
      <div class="group-header-bar chart-bar">
        <span class="group-icon">🖨️</span>
        <span class="group-label-text">視力測試圖</span>
        <span class="group-sub-text"
          >實際列印尺寸（1:1）— 列印時請選「實際大小」，勿縮放</span
        >
        <span class="group-score-tally tally-print">40 cm</span>
      </div>
      <div class="chart-card">
        <div class="chart-header-line">
          <span class="chart-card-title">WHO 簡單視力圖　近距離視力測試卡</span>
          <span class="chart-dist">測試距離 40 cm</span>
        </div>
        <div class="chart-body">
          <div
            v-for="(row, ri) in rows"
            :key="ri"
            class="chart-row"
            :class="row.isThreshold ? 'chart-row-threshold' : ''"
          >
            <span class="chart-label">{{ row.snellen }}</span>
            <div class="chart-syms">
              <div
                v-for="(dir, ci) in row.dirs"
                :key="ci"
                class="chart-sym-wrap"
                :class="{
                  'sym-ok': symStatus[ri][ci] === 'correct',
                  'sym-err': symStatus[ri][ci] === 'wrong',
                }"
              >
                <svg
                  :width="row.sizeMm + 'mm'"
                  :height="row.sizeMm + 'mm'"
                  :viewBox="'0 0 ' + row.sizeMm + ' ' + row.sizeMm"
                  xmlns="http://www.w3.org/2000/svg"
                  class="e-glyph"
                  :aria-label="'E開口朝' + dirZh[dir]"
                  v-html="getSvgInner(row.snellen, dir)"
                />
                <span
                  v-if="symStatus[ri][ci] === 'correct'"
                  class="sym-dot dot-ok"
                  >✓</span
                >
                <span
                  v-if="symStatus[ri][ci] === 'wrong'"
                  class="sym-dot dot-err"
                  >✗</span
                >
              </div>
            </div>
            <div class="chart-row-score">
              <span
                v-if="rowStats[ri].done"
                class="row-score-pill"
                :class="rowStats[ri].correct >= 3 ? 'pill-pass' : 'pill-fail'"
              >
                {{ rowStats[ri].correct }}/4
              </span>
              <span v-else class="row-score-pill pill-nd"
                >{{ rowStats[ri].answered }}/4</span
              >
              <span v-if="row.isThreshold" class="threshold-flag"
                >← 臨界值</span
              >
            </div>
          </div>
        </div>
        <div class="chart-footer">
          <span>⚠ 列印時請選「實際大小」，不可縮放</span>
          <span>通過標準：6/18 行答對 ≥ 3/4</span>
        </div>
      </div>
    </div>

    <!-- ══ 記錄患者回答 ═════════════════════════════════════════ -->
    <div class="nihss-group">
      <div class="group-header-bar rec-bar">
        <span class="group-icon">📝</span>
        <span class="group-label-text">
          記錄患者回答 —
          {{ activeEye === "right" ? "右眼（OD）" : "左眼（OS）" }}
        </span>
        <span class="group-sub-text"
          >點選患者指出的方向 · 綠色 = 正確 · 紅色 = 錯誤</span
        >
        <span
          class="group-score-tally"
          :class="
            isComplete
              ? severity.color === 'normal' || severity.color === 'mild'
                ? 'tally-ok'
                : 'tally-abn'
              : 'tally-nd'
          "
        >
          {{ answeredTotal }}/16
        </span>
      </div>

      <!-- Current-eye indicator band -->
      <div
        class="eye-indicator"
        :class="activeEye === 'right' ? 'ei-r' : 'ei-l'"
      >
        <span
          >👁️ 目前記錄：<strong>{{
            activeEye === "right"
              ? "右眼（OD）— 遮蓋左眼"
              : "左眼（OS）— 遮蓋右眼"
          }}</strong></span
        >
        <button
          class="ei-switch"
          @click="switchEye(activeEye === 'right' ? 'left' : 'right')"
        >
          切換至{{ activeEye === "right" ? "左眼" : "右眼" }} →
        </button>
      </div>

      <div class="item-list">
        <div
          v-for="(row, ri) in rows"
          :key="ri"
          class="vis-item"
          :class="{
            'item-pass': rowStats[ri].done && rowStats[ri].correct >= 3,
            'item-fail': rowStats[ri].done && rowStats[ri].correct < 3,
          }"
        >
          <div class="item-header">
            <div class="item-meta-row">
              <span
                class="item-qnum"
                :class="row.isThreshold ? 'q-threshold' : 'q-row'"
              >
                {{ row.snellen }}
              </span>
            </div>
            <div class="item-name-block">
              <span class="item-name">
                第 {{ ri + 1 }} 列
                <span v-if="row.isThreshold" class="threshold-badge"
                  >臨界值</span
                >
              </span>
              <span class="item-sub">
                符號實際方向：
                <strong
                  v-for="(d, ci) in row.dirs"
                  :key="ci"
                  class="correct-dir"
                  >{{ dirArrow[d] }}</strong
                >
                · 字符高度 {{ row.sizeMm }} mm
              </span>
            </div>
            <span
              class="item-val"
              :class="
                rowStats[ri].done
                  ? rowStats[ri].correct >= 3
                    ? 'val-ok'
                    : 'val-abn'
                  : 'val-nd'
              "
            >
              {{ rowStats[ri].done ? rowStats[ri].correct + "/4" : "—" }}
            </span>
          </div>

          <div class="sym-cols">
            <div
              v-for="(dir, ci) in row.dirs"
              :key="ci"
              class="sym-col"
              :class="{
                'col-ok': symStatus[ri][ci] === 'correct',
                'col-err': symStatus[ri][ci] === 'wrong',
              }"
            >
              <div class="sym-col-head">
                <span class="sym-idx">{{ ci + 1 }}</span>
                <span class="sym-answer">{{ dirArrow[dir] }}</span>
              </div>
              <div class="dir-grid">
                <button
                  v-for="d in allDirs"
                  :key="d"
                  class="dir-btn"
                  :class="{
                    'dir-correct': currentAnswers[ri][ci] === d && d === dir,
                    'dir-wrong': currentAnswers[ri][ci] === d && d !== dir,
                  }"
                  @click="setAnswer(ri, ci, d)"
                >
                  {{ dirArrow[d] }}
                </button>
              </div>
              <div class="sym-verdict">
                <span
                  v-if="currentAnswers[ri][ci] !== null"
                  :class="currentAnswers[ri][ci] === dir ? 'v-ok' : 'v-err'"
                >
                  {{ currentAnswers[ri][ci] === dir ? "✓" : "✗" }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ── Sub-score row (active eye) ────────────────────────── -->
    <div v-if="answeredTotal > 0" class="sub-score-row">
      <div
        v-for="(row, ri) in rows"
        :key="ri"
        class="sub-score-card"
        :class="{
          'ss-pass': rowStats[ri].done && rowStats[ri].correct >= 3,
          'ss-fail': rowStats[ri].done && rowStats[ri].correct < 3,
          'ss-nd': !rowStats[ri].done,
        }"
      >
        <span class="ss-label">{{ row.snellen }}</span>
        <span class="ss-val">{{
          rowStats[ri].answered > 0 ? rowStats[ri].correct : "—"
        }}</span>
        <span class="ss-max">/ 4</span>
        <span v-if="row.isThreshold" class="ss-threshold">臨界</span>
        <span v-else class="ss-threshold-placeholder"></span>
      </div>
    </div>

    <!-- ── Result card (active eye) ──────────────────────────── -->
    <div class="vis-result" :class="severity.color">
      <div class="result-left">
        <span class="result-number">{{
          row18.done ? row18.correct : "—"
        }}</span>
        <span class="result-max" :style="{ opacity: row18.done ? 1 : 0 }"
          >/4</span
        >
      </div>
      <div class="result-right">
        <span class="result-ver"
          >{{ activeEye === "right" ? "右眼 OD" : "左眼 OS" }} · 6/18
          臨界行</span
        >
        <span class="result-level">{{ severity.level }}</span>
        <span class="result-advice">{{ severity.advice }}</span>
      </div>
    </div>

    <!-- ── Dual comparison card (shown when both done) ─────────── -->
    <div v-if="bothDone" class="dual-card">
      <div class="dual-header">雙眼比較摘要</div>
      <div class="dual-grid">
        <div
          v-for="eye in ['right', 'left'] as Eye[]"
          :key="eye"
          class="dual-eye"
          :class="eye === 'right' ? severityOD.color : severityOS.color"
        >
          <span class="de-label">{{
            eye === "right" ? "右眼 OD" : "左眼 OS"
          }}</span>
          <span class="de-score">
            {{ eye === "right" ? row18OD.correct : row18OS.correct
            }}<small>/4</small>
          </span>
          <span class="de-sub">6/18 臨界行</span>
          <span
            class="de-verdict"
            :class="
              (eye === 'right' ? row18OD.correct : row18OS.correct) >= 3
                ? 'dv-pass'
                : 'dv-fail'
            "
          >
            {{
              (eye === "right" ? row18OD.correct : row18OS.correct) >= 3
                ? "✅ 通過"
                : "⚠️ 未通過"
            }}
          </span>
          <span class="de-level">
            {{
              (eye === "right" ? severityOD : severityOS).level.split("（")[0]
            }}
          </span>
        </div>
      </div>
    </div>

    <!-- ── Results detail — both eyes ───────────────────────── -->
    <div v-if="showResults && (doneOD || doneOS)" class="results-detail">
      <!-- Column header row -->
      <div class="results-header">
        <span class="rh-col-label">視力列</span>
        <span class="rh-col-od">右眼 OD</span>
        <span class="rh-col-os">左眼 OS</span>
      </div>

      <!-- One row per Snellen level -->
      <div
        v-for="(row, ri) in rows"
        :key="ri"
        class="detail-row detail-row-both"
        :class="row.isThreshold ? 'detail-row-threshold' : ''"
      >
        <!-- Row label -->
        <div class="drb-label">
          <span
            class="detail-qnum"
            :class="row.isThreshold ? 'dq-threshold' : 'dq-row'"
          >
            {{ row.snellen }}
          </span>
          <span class="drb-desc"
            >第 {{ ri + 1 }} 列{{ row.isThreshold ? "（臨界值）" : "" }}</span
          >
        </div>
        <!-- Right eye cell -->
        <div class="drb-cell">
          <span
            v-if="statsOD[ri].done"
            class="drb-score"
            :class="statsOD[ri].correct >= 3 ? 'ds-ok' : 'ds-abn'"
          >
            {{ statsOD[ri].correct }}/4
          </span>
          <span v-else class="drb-score drb-nd">—</span>
          <span
            v-if="statsOD[ri].done"
            class="drb-verdict"
            :class="statsOD[ri].correct >= 3 ? 'dv-pass' : 'dv-fail'"
          >
            {{ statsOD[ri].correct >= 3 ? "通過" : "未通過" }}
          </span>
        </div>
        <!-- Left eye cell -->
        <div class="drb-cell">
          <span
            v-if="statsOS[ri].done"
            class="drb-score"
            :class="statsOS[ri].correct >= 3 ? 'ds-ok' : 'ds-abn'"
          >
            {{ statsOS[ri].correct }}/4
          </span>
          <span v-else class="drb-score drb-nd">—</span>
          <span
            v-if="statsOS[ri].done"
            class="drb-verdict"
            :class="statsOS[ri].correct >= 3 ? 'dv-pass' : 'dv-fail'"
          >
            {{ statsOS[ri].correct >= 3 ? "通過" : "未通過" }}
          </span>
        </div>
      </div>

      <!-- Summary / verdict row -->
      <div class="detail-row detail-row-both detail-total">
        <div class="drb-label">
          <span class="detail-qnum dq-threshold">總判讀</span>
          <span class="drb-desc">6/18 臨界行</span>
        </div>
        <!-- Right eye verdict -->
        <div class="drb-cell drb-verdict-cell">
          <template v-if="doneOD">
            <span class="drb-score detail-score-brand"
              >{{ row18OD.correct }}/4</span
            >
            <span
              class="drb-verdict"
              :class="row18OD.correct >= 3 ? 'dv-pass' : 'dv-fail'"
            >
              {{ row18OD.correct >= 3 ? "✅ 通過" : "⚠️ 未通過" }}
            </span>
            <span class="drb-level">{{ severityOD.level.split("（")[0] }}</span>
          </template>
          <span v-else class="drb-nd">未完成</span>
        </div>
        <!-- Left eye verdict -->
        <div class="drb-cell drb-verdict-cell">
          <template v-if="doneOS">
            <span class="drb-score detail-score-brand"
              >{{ row18OS.correct }}/4</span
            >
            <span
              class="drb-verdict"
              :class="row18OS.correct >= 3 ? 'dv-pass' : 'dv-fail'"
            >
              {{ row18OS.correct >= 3 ? "✅ 通過" : "⚠️ 未通過" }}
            </span>
            <span class="drb-level">{{ severityOS.level.split("（")[0] }}</span>
          </template>
          <span v-else class="drb-nd">未完成</span>
        </div>
      </div>
    </div>

    <!-- ── Alert (combined when both done) ────────────────────── -->
    <div
      v-if="alertCombined"
      class="vis-alert"
      :class="'alert-' + alertCombined.color"
    >
      <span class="alert-icon">⚠</span>
      <span>
        <strong>{{ alertCombined.level }}：</strong>
        {{ alertCombined.advice }}
      </span>
    </div>

    <!-- ── Warn ───────────────────────────────────────────────── -->
    <div class="warn-box">
      <span class="warn-icon">⚠</span>
      <span
        >本測試為近距視力篩查工具，不能取代眼科完整評估。必須分別遮蓋雙眼各測一次；雙眼同時測試無效。配戴眼鏡者應在戴鏡狀態下測試。6/18
        未通過者建議轉介眼科排除白內障、青光眼、糖尿病視網膜病變等。本視力卡須以原尺寸（100%）列印，否則通過標準失效。</span
      >
    </div>

    <!-- ── Actions ────────────────────────────────────────────── -->
    <div class="vis-actions">
      <button class="btn-view" @click="showResults = !showResults">
        {{ showResults ? "收起明細" : "查看評估結果" }}
      </button>
      <button class="btn-copy" :disabled="!isComplete" @click="copyOutput">
        {{ copied ? "已複製 ✓" : "複製 Markdown 結果" }}
      </button>
      <button class="btn-reset-eye" @click="resetCurrentEye">
        重置{{ activeEye === "right" ? "右眼" : "左眼" }}
      </button>
      <button class="btn-reset" @click="resetAll">重置雙眼</button>
    </div>
    <p v-if="!isComplete" class="progress-hint">
      {{ activeEye === "right" ? "右眼" : "左眼" }} 已記錄
      {{ answeredTotal }}/16 個回答
    </p>
    <p v-if="isComplete && !bothDone" class="progress-hint eye-prompt">
      ✅
      {{
        activeEye === "right"
          ? "右眼已完成，請切換至左眼繼續記錄"
          : "左眼已完成，請切換至右眼繼續記錄"
      }}
    </p>
  </div>
</template>

<style scoped>
.vis {
  max-width: 780px;
  margin: 0 auto;
  padding: 2rem 0 3rem;
  font-size: 0.9rem;
}

/* ── Header ──────────────────────────────────────────────────── */
.vis-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 1rem;
  flex-wrap: nowrap;
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
  font-size: 0.75rem;
  color: var(--vp-c-text-3);
  margin: 0;
  line-height: 1.6;
}
.subtitle-2 {
  margin: 0.25rem 0 0;
}
.hint-tag {
  display: inline-block;
  font-size: 0.72rem;
  font-weight: 700;
  padding: 2px 10px;
  border-radius: 999px;
  white-space: nowrap;
}
.hint-vis {
  background: rgba(6, 182, 212, 0.12);
  color: #0e7490;
}

/* ── Score badge ─────────────────────────────────────────────── */
.score-badge {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-width: 96px;
  min-height: 88px;
  flex-shrink: 0;
  padding: 0.6rem 1rem;
  border-radius: 12px;
  border: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg-soft);
  transition: all 0.3s;
}
.badge-top {
  font-size: 0.58rem;
  font-weight: 700;
  color: var(--vp-c-text-3);
  text-align: center;
  white-space: nowrap;
}
.score-number {
  font-size: 2rem;
  font-weight: 800;
  line-height: 1;
  min-width: 2ch;
  text-align: center;
}
.score-unit {
  font-size: 0.65rem;
  font-weight: 600;
  margin-top: 1px;
  min-width: 2ch;
  transition: opacity 0.2s;
}
.score-bot {
  font-size: 0.62rem;
  font-weight: 600;
  margin-top: 3px;
  text-align: center;
}
.score-badge.filling {
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
.score-badge.critical {
  border-color: #ef4444;
  color: #ef4444;
}

/* ── Both-eye summary strip ──────────────────────────────────── */
.eye-strip {
  display: flex;
  gap: 0.75rem;
  margin-bottom: 1.25rem;
}
.eye-strip-card {
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
.eye-strip-card:hover {
  border-color: var(--vp-c-brand-1);
}
.eye-strip-card.eye-active {
  box-shadow: 0 0 0 3px rgba(6, 182, 212, 0.22);
  border-color: #06b6d4;
}
.eye-strip-card.eye-nd {
  border-color: var(--vp-c-divider);
}
.eye-strip-card.normal {
  border-color: #22c55e;
}
.eye-strip-card.mild {
  border-color: #f59e0b;
}
.eye-strip-card.moderate {
  border-color: #f97316;
}
.eye-strip-card.critical {
  border-color: #ef4444;
}
.esc-label {
  font-size: 0.7rem;
  font-weight: 800;
  color: var(--vp-c-text-2);
}
.esc-val {
  font-size: 1.7rem;
  font-weight: 900;
  color: var(--vp-c-text-1);
  line-height: 1;
}
.eye-strip-card.normal .esc-val {
  color: #22c55e;
}
.eye-strip-card.mild .esc-val {
  color: #f59e0b;
}
.eye-strip-card.moderate .esc-val {
  color: #f97316;
}
.eye-strip-card.critical .esc-val {
  color: #ef4444;
}
.esc-sub {
  font-size: 0.58rem;
  color: var(--vp-c-text-3);
}
.esc-status {
  font-size: 0.64rem;
  font-weight: 700;
  color: var(--vp-c-text-2);
}

/* ── Eye tab row ─────────────────────────────────────────────── */
.eye-tab-row {
  display: flex;
  gap: 0.5rem;
}
.eye-tab {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.65rem 0.85rem;
  border-radius: 10px;
  border: 1.5px solid var(--vp-c-divider);
  background: var(--vp-c-bg-soft);
  cursor: pointer;
  font-family: inherit;
  transition: all 0.18s;
  text-align: left;
}
.eye-tab:hover {
  border-color: var(--vp-c-brand-1);
}
.eye-tab.eye-tab-r {
  border-color: #06b6d4;
  background: rgba(6, 182, 212, 0.06);
}
.eye-tab.eye-tab-l {
  border-color: #8b5cf6;
  background: rgba(139, 92, 246, 0.06);
}
.et-icon {
  font-size: 1.2rem;
  flex-shrink: 0;
}
.et-body {
  display: flex;
  flex-direction: column;
  flex: 1;
}
.et-title {
  font-size: 0.9rem;
  font-weight: 700;
  color: var(--vp-c-text-1);
}
.et-sub {
  font-size: 0.68rem;
  color: var(--vp-c-text-3);
}
.eye-tab.eye-tab-r .et-title {
  color: #0e7490;
}
.eye-tab.eye-tab-l .et-title {
  color: #7c3aed;
}
.et-score {
  font-size: 0.85rem;
  font-weight: 800;
  padding: 2px 8px;
  border-radius: 999px;
  flex-shrink: 0;
}
.ets-pass {
  color: #22c55e;
  background: rgba(34, 197, 94, 0.12);
}
.ets-fail {
  color: #ef4444;
  background: rgba(239, 68, 68, 0.12);
}
.ets-nd {
  color: var(--vp-c-text-3);
  background: var(--vp-c-bg-mute);
}

/* ── Severity bar ────────────────────────────────────────────── */
.severity-bar-wrap {
  margin-bottom: 2rem;
}
.severity-bar {
  height: 6px;
  border-radius: 999px;
  background: var(--vp-c-bg-mute);
  overflow: hidden;
  margin-bottom: 4px;
}
.severity-fill {
  height: 100%;
  border-radius: 999px;
  transition:
    width 0.4s ease,
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
.severity-fill.critical {
  background: #ef4444;
}
.severity-ticks-abs,
.severity-labels-abs {
  position: relative;
  height: 14px;
  margin-top: 2px;
}
.severity-labels-abs {
  height: 13px;
  margin-top: 0;
}
.tick-abs {
  position: absolute;
  transform: translateX(-50%);
  font-size: 0.65rem;
  color: var(--vp-c-text-3);
  white-space: nowrap;
}
.tick-abs[style*="left:0%"] {
  transform: translateX(0);
}
.tick-abs[style*="left:100%"] {
  transform: translateX(-100%);
}
.label-abs {
  position: absolute;
  transform: translateX(-50%);
  font-size: 0.63rem;
  color: var(--vp-c-text-3);
  white-space: nowrap;
}
.label-abs[style*="left:0%"] {
  transform: translateX(0);
}
.label-abs[style*="left:100%"] {
  transform: translateX(-100%);
}
.tick-red {
  color: #ef4444;
  font-weight: 700;
}
.tick-ok {
  color: #22c55e;
  font-weight: 700;
}

/* ── Alert ───────────────────────────────────────────────────── */
.vis-alert {
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
.alert-moderate {
  background: rgba(249, 115, 22, 0.06);
  border: 1px solid rgba(249, 115, 22, 0.35);
}
.alert-critical {
  background: rgba(239, 68, 68, 0.06);
  border: 1px solid rgba(239, 68, 68, 0.35);
}
.alert-icon {
  color: #ef4444;
  flex-shrink: 0;
}

/* ── ICOPE notice ────────────────────────────────────────────── */
.icope-notice {
  display: flex;
  align-items: flex-start;
  gap: 0.6rem;
  padding: 0.65rem 1rem;
  border-radius: 8px;
  background: rgba(6, 182, 212, 0.05);
  border: 1px solid rgba(6, 182, 212, 0.25);
  border-left: 3px solid #14b8a6;
  font-size: 0.8rem;
  color: var(--vp-c-text-2);
  line-height: 1.6;
  margin-bottom: 1rem;
}
.notice-icon {
  flex-shrink: 0;
}
.notice-sep {
  margin: 0 6px;
  color: var(--vp-c-text-3);
}
.vis-cross {
  color: #0891b2;
}

/* ── Groups ──────────────────────────────────────────────────── */
.nihss-group {
  margin-bottom: 1.5rem;
}
.group-header-bar {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.55rem 0.85rem;
  border-radius: 8px;
  background: var(--vp-c-bg-mute);
  border: 1px solid var(--vp-c-divider);
  border-left: 3px solid #eab308;
  margin-bottom: 0.6rem;
}
.eye-bar {
  border-left: 3px solid #06b6d4;
}
.inst-bar {
  border-left: 3px solid #06b6d4;
}
.chart-bar {
  border-left: 3px solid #111;
}
.rec-bar {
  border-left: 3px solid #8b5cf6;
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
  min-width: 52px;
  text-align: center;
  border: 1px solid transparent;
  box-sizing: border-box;
}
.tally-print {
  color: #111;
  background: rgba(0, 0, 0, 0.07);
  border-color: rgba(0, 0, 0, 0.18);
}
.tally-ok {
  color: #22c55e;
  background: rgba(34, 197, 94, 0.12);
  border-color: rgba(34, 197, 94, 0.25);
}
.tally-abn {
  color: #ef4444;
  background: rgba(239, 68, 68, 0.12);
  border-color: rgba(239, 68, 68, 0.25);
}
.tally-nd {
  color: var(--vp-c-text-3);
  background: var(--vp-c-bg-soft);
  border-color: var(--vp-c-divider);
}

/* ── Instructions ────────────────────────────────────────────── */
.inst-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.5rem;
}
.inst-card {
  display: flex;
  align-items: flex-start;
  gap: 0.55rem;
  padding: 0.6rem 0.75rem;
  border-radius: 8px;
  border: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg-soft);
  font-size: 0.8rem;
  color: var(--vp-c-text-2);
  line-height: 1.5;
}
.inst-num {
  flex-shrink: 0;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: #0e7490;
  color: #fff;
  font-size: 0.72rem;
  font-weight: 800;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* ── Eye indicator band ──────────────────────────────────────── */
.eye-indicator {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.6rem;
  padding: 0.45rem 0.85rem;
  border-radius: 8px;
  font-size: 0.8rem;
  margin-bottom: 0.6rem;
  border: 1px dashed;
}
.ei-r {
  background: rgba(6, 182, 212, 0.06);
  border-color: rgba(6, 182, 212, 0.4);
  color: var(--vp-c-text-2);
}
.ei-l {
  background: rgba(139, 92, 246, 0.06);
  border-color: rgba(139, 92, 246, 0.4);
  color: var(--vp-c-text-2);
}
.ei-switch {
  padding: 3px 10px;
  border-radius: 6px;
  border: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg-soft);
  font-size: 0.72rem;
  font-weight: 600;
  cursor: pointer;
  font-family: inherit;
  flex-shrink: 0;
  transition: all 0.15s;
  color: var(--vp-c-text-2);
}
.ei-switch:hover {
  border-color: var(--vp-c-brand-1);
  color: var(--vp-c-brand-1);
}

/* ── Chart card ──────────────────────────────────────────────── */
.chart-card {
  background: #fff;
  color: #000;
  border: 2px solid #000;
  border-radius: 8px;
  padding: 1rem 1.25rem 0.75rem;
}
.chart-header-line {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  margin-bottom: 0.75rem;
}
.chart-card-title {
  font-size: 0.72rem;
  font-weight: 700;
  color: #222;
  letter-spacing: 0.04em;
}
.chart-dist {
  font-size: 0.62rem;
  color: #666;
}
.chart-body {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
}
.chart-row {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}
.chart-row-threshold {
  padding: 4px 0;
  border-top: 1px dashed #aaa;
  border-bottom: 1px dashed #aaa;
}
.chart-label {
  width: 32px;
  flex-shrink: 0;
  font-size: 0.58rem;
  font-weight: 700;
  color: #555;
  text-align: right;
}
.chart-syms {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  flex: 1;
  justify-content: center;
}
.chart-sym-wrap {
  position: relative;
  padding: 3px;
  border-radius: 4px;
  line-height: 0;
  transition: background 0.15s;
}
.chart-sym-wrap.sym-ok {
  background: rgba(34, 197, 94, 0.15);
}
.chart-sym-wrap.sym-err {
  background: rgba(239, 68, 68, 0.12);
}
.e-glyph {
  display: block;
  fill: #000;
}
.sym-dot {
  position: absolute;
  top: -4px;
  right: -4px;
  font-size: 0.6rem;
  font-weight: 900;
  width: 13px;
  height: 13px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  line-height: 1;
}
.dot-ok {
  background: #22c55e;
  color: #fff;
}
.dot-err {
  background: #ef4444;
  color: #fff;
}
.chart-row-score {
  width: 68px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 2px;
}
.row-score-pill {
  font-size: 0.68rem;
  font-weight: 800;
  padding: 1px 6px;
  border-radius: 999px;
}
.pill-pass {
  background: rgba(34, 197, 94, 0.15);
  color: #15803d;
}
.pill-fail {
  background: rgba(239, 68, 68, 0.12);
  color: #dc2626;
}
.pill-nd {
  background: rgba(0, 0, 0, 0.06);
  color: #666;
}
.threshold-flag {
  font-size: 0.56rem;
  color: #dc2626;
  font-weight: 700;
}
.chart-footer {
  display: flex;
  justify-content: space-between;
  margin-top: 0.65rem;
  padding-top: 0.45rem;
  border-top: 1px dashed #ccc;
  font-size: 0.6rem;
  color: #888;
}

/* ── Answer items ────────────────────────────────────────────── */
.item-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
.vis-item {
  border: 1px solid var(--vp-c-divider);
  border-radius: 10px;
  background: var(--vp-c-bg-soft);
  overflow: hidden;
  transition: border-color 0.2s;
}
.vis-item.item-pass {
  border-color: #22c55e;
}
.vis-item.item-fail {
  border-color: #ef4444;
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
.item-meta-row {
  display: flex;
  align-items: center;
  flex-shrink: 0;
  padding-top: 3px;
}
.item-qnum {
  font-size: 0.72rem;
  font-weight: 800;
  padding: 1px 8px;
  border-radius: 999px;
  white-space: nowrap;
}
.q-threshold {
  color: #ef4444;
  background: rgba(239, 68, 68, 0.12);
}
.q-row {
  color: #8b5cf6;
  background: rgba(139, 92, 246, 0.12);
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
.threshold-badge {
  display: inline-block;
  margin-left: 6px;
  font-size: 0.62rem;
  font-weight: 700;
  padding: 1px 6px;
  border-radius: 999px;
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
}
.correct-dir {
  font-size: 1rem;
  margin-right: 4px;
  color: var(--vp-c-text-1);
}
.item-val {
  font-size: 0.85rem;
  font-weight: 800;
  flex-shrink: 0;
  min-width: 40px;
  text-align: right;
}
.val-ok {
  color: #22c55e;
}
.val-abn {
  color: #ef4444;
}
.val-nd {
  color: var(--vp-c-text-3);
}

/* ── Symbol columns ──────────────────────────────────────────── */
.sym-cols {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
}
.sym-col {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0.55rem 0.2rem;
  border-right: 1px solid var(--vp-c-divider);
  gap: 4px;
  transition: background 0.15s;
}
.sym-col:last-child {
  border-right: none;
}
.sym-col.col-ok {
  background: rgba(34, 197, 94, 0.06);
}
.sym-col.col-err {
  background: rgba(239, 68, 68, 0.05);
}
.sym-col-head {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1px;
}
.sym-idx {
  font-size: 0.6rem;
  color: var(--vp-c-text-3);
  font-weight: 700;
}
.sym-answer {
  font-size: 1.1rem;
  font-weight: 900;
  color: var(--vp-c-text-1);
  line-height: 1;
}
.dir-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 3px;
  width: 100%;
}
.dir-btn {
  padding: 0.3rem 0;
  font-size: 0.95rem;
  font-weight: 800;
  cursor: pointer;
  font-family: inherit;
  border: 1.5px solid var(--vp-c-divider);
  border-radius: 6px;
  background: var(--vp-c-bg-soft);
  color: var(--vp-c-text-2);
  transition: all 0.12s;
  text-align: center;
}
.dir-btn:hover {
  background: var(--vp-c-bg-mute);
}
.dir-btn.dir-correct {
  background: rgba(34, 197, 94, 0.15);
  border-color: #22c55e;
  color: #16a34a;
}
.dir-btn.dir-wrong {
  background: rgba(239, 68, 68, 0.12);
  border-color: #ef4444;
  color: #dc2626;
}
.sym-verdict {
  font-size: 0.7rem;
  font-weight: 800;
  height: 20px;
  line-height: 14px;
  padding-top: 4px;
}
.v-ok {
  color: #22c55e;
}
.v-err {
  color: #ef4444;
}

/* ── Sub-score row ───────────────────────────────────────────── */
.sub-score-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
  flex-wrap: wrap;
}
.sub-score-card {
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
.ss-pass {
  border-color: #22c55e;
}
.ss-fail {
  border-color: #ef4444;
}
.ss-nd {
  opacity: 0.5;
}
.ss-label {
  font-size: 0.65rem;
  color: var(--vp-c-text-3);
  font-weight: 600;
}
.ss-val {
  font-size: 1.5rem;
  font-weight: 800;
  color: var(--vp-c-text-1);
  line-height: 1;
}
.ss-max {
  font-size: 0.6rem;
  color: var(--vp-c-text-3);
}
.ss-threshold {
  font-size: 0.55rem;
  font-weight: 800;
  color: #ef4444;
  height: 12px;
  line-height: 12px;
}
.ss-threshold-placeholder {
  height: 12px;
  display: block;
}
.ss-pass .ss-val {
  color: #22c55e;
}
.ss-fail .ss-val {
  color: #ef4444;
}

/* ── Result card ─────────────────────────────────────────────── */
.vis-result {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem 1.25rem;
  border-radius: 14px;
  border: 1px solid var(--vp-c-divider);
  background: linear-gradient(135deg, var(--vp-c-bg-soft), var(--vp-c-bg-mute));
  margin-bottom: 1rem;
  flex-wrap: nowrap;
  transition: all 0.3s;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
}
.vis-result.normal {
  border-color: #22c55e;
  box-shadow:
    0 0 0 1px rgba(34, 197, 94, 0.06),
    0 1px 3px rgba(0, 0, 0, 0.04);
}
.vis-result.mild {
  border-color: #f59e0b;
  box-shadow:
    0 0 0 1px rgba(245, 158, 11, 0.06),
    0 1px 3px rgba(0, 0, 0, 0.04);
}
.vis-result.moderate {
  border-color: #f97316;
  box-shadow:
    0 0 0 1px rgba(249, 115, 22, 0.06),
    0 1px 3px rgba(0, 0, 0, 0.04);
}
.vis-result.critical {
  border-color: #ef4444;
  box-shadow:
    0 0 0 1px rgba(239, 68, 68, 0.06),
    0 1px 3px rgba(0, 0, 0, 0.04);
}
.result-left {
  display: flex;
  align-items: baseline;
  gap: 2px;
  flex-shrink: 0;
  min-width: 80px;
  text-align: center;
  flex-direction: column;
  align-items: center;
  border-right: 1px solid var(--vp-c-divider);
  padding-right: 1rem;
}
.result-number {
  font-size: 2.5rem;
  font-weight: 800;
  line-height: 1;
  color: var(--vp-c-text-3);
  transition: color 0.3s;
}
.vis-result.normal .result-number {
  color: #22c55e;
}
.vis-result.mild .result-number {
  color: #f59e0b;
}
.vis-result.moderate .result-number {
  color: #f97316;
}
.vis-result.critical .result-number {
  color: #ef4444;
}
.result-max {
  font-size: 0.85rem;
  color: var(--vp-c-text-3);
  transition: opacity 0.2s;
}
.result-right {
  display: flex;
  flex-direction: column;
  gap: 3px;
  flex: 1;
  min-width: 0;
}
.result-ver {
  font-size: 0.68rem;
  font-weight: 700;
  color: var(--vp-c-text-3);
  letter-spacing: 0.03em;
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

/* ── Dual comparison card ─────────────────────────────────────── */
.dual-card {
  border: 1px solid var(--vp-c-divider);
  border-radius: 12px;
  overflow: hidden;
  margin-bottom: 1rem;
}
.dual-header {
  padding: 0.5rem 0.9rem;
  font-size: 0.72rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--vp-c-text-3);
  background: var(--vp-c-bg-mute);
  border-bottom: 1px solid var(--vp-c-divider);
}
.dual-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
}
.dual-eye {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 3px;
  padding: 1rem 0.75rem;
  text-align: center;
}
.dual-eye:first-child {
  border-right: 1px solid var(--vp-c-divider);
}
.dual-eye.normal {
  background: rgba(34, 197, 94, 0.04);
}
.dual-eye.mild {
  background: rgba(245, 158, 11, 0.04);
}
.dual-eye.moderate {
  background: rgba(249, 115, 22, 0.04);
}
.dual-eye.critical {
  background: rgba(239, 68, 68, 0.04);
}
.de-label {
  font-size: 0.72rem;
  font-weight: 800;
  color: var(--vp-c-text-2);
}
.de-score {
  font-size: 2.5rem;
  font-weight: 900;
  color: var(--vp-c-text-1);
  line-height: 1;
}
.de-score small {
  font-size: 1rem;
  font-weight: 600;
}
.dual-eye.normal .de-score {
  color: #22c55e;
}
.dual-eye.mild .de-score {
  color: #f59e0b;
}
.dual-eye.moderate .de-score {
  color: #f97316;
}
.dual-eye.critical .de-score {
  color: #ef4444;
}
.de-sub {
  font-size: 0.6rem;
  color: var(--vp-c-text-3);
}
.de-verdict {
  font-size: 0.8rem;
  font-weight: 700;
}
.dv-pass {
  color: #22c55e;
}
.dv-fail {
  color: #ef4444;
}
.de-level {
  font-size: 0.67rem;
  color: var(--vp-c-text-2);
  font-weight: 600;
}

/* ── Results detail — both eyes ──────────────────────────────── */
.results-detail {
  border: 1px solid var(--vp-c-divider);
  border-radius: 10px;
  overflow: hidden;
  margin-bottom: 1rem;
}

/* Header row — 3 columns */
.results-header {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  padding: 0.45rem 0.9rem;
  font-size: 0.7rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--vp-c-text-3);
  background: var(--vp-c-bg-mute);
  border-bottom: 1px solid var(--vp-c-divider);
}
.rh-col-label {
  text-align: left;
}
.rh-col-od {
  text-align: center;
  color: #0e7490;
}
.rh-col-os {
  text-align: center;
  color: #7c3aed;
}

/* Data rows */
.detail-row-both {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  align-items: center;
  padding: 0.45rem 0.9rem;
  border-bottom: 1px solid var(--vp-c-divider);
  gap: 0.4rem;
}
.detail-row-both:last-child {
  border-bottom: none;
}
.detail-row-threshold {
  background: rgba(239, 68, 68, 0.03);
}
.detail-total {
  background: var(--vp-c-bg-mute);
}

/* Left column: snellen + description */
.drb-label {
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.detail-qnum {
  font-size: 0.7rem;
  font-weight: 800;
  display: inline-block;
}
.dq-threshold {
  color: #ef4444;
}
.dq-row {
  color: #8b5cf6;
}
.drb-desc {
  font-size: 0.68rem;
  color: var(--vp-c-text-3);
  line-height: 1.3;
}

/* Eye cells (OD / OS columns) */
.drb-cell {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
}
.drb-score {
  font-size: 0.88rem;
  font-weight: 800;
  color: var(--vp-c-text-3);
}
.ds-ok {
  color: #22c55e;
}
.ds-abn {
  color: #ef4444;
}
.drb-nd {
  font-size: 0.78rem;
  color: var(--vp-c-text-3);
  opacity: 0.45;
}
.drb-verdict {
  font-size: 0.68rem;
  font-weight: 700;
}
.dv-pass {
  color: #22c55e;
}
.dv-fail {
  color: #ef4444;
}
.drb-verdict-cell {
  gap: 3px;
}
.drb-level {
  font-size: 0.62rem;
  color: var(--vp-c-text-2);
  font-weight: 600;
  text-align: center;
}
.detail-score-brand {
  color: var(--vp-c-brand-1);
}

/* ── Warn / Actions ──────────────────────────────────────────── */
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
}
.vis-actions {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
}
.btn-view,
.btn-copy,
.btn-reset-eye,
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
.btn-copy:hover:not(:disabled) {
  background: var(--vp-c-brand-soft);
}
.btn-copy:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}
.btn-reset-eye {
  border: 1px solid var(--vp-c-divider);
  background: transparent;
  color: var(--vp-c-text-2);
}
.btn-reset-eye:hover {
  border-color: #f97316;
  color: #f97316;
  background: rgba(249, 115, 22, 0.04);
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
  margin: 0.3rem 0 0;
}
.eye-prompt {
  color: #0891b2;
  font-weight: 600;
}

@media (max-width: 640px) {
  .vis-header {
    flex-wrap: wrap;
  }
  .score-badge {
    align-self: flex-start;
  }
  .vis-result {
    flex-direction: column;
    gap: 0.75rem;
  }
  .inst-grid {
    grid-template-columns: 1fr;
  }
  .sym-cols {
    grid-template-columns: repeat(2, 1fr);
  }
  .eye-tab-row {
    flex-direction: column;
  }
  .dual-grid {
    grid-template-columns: 1fr;
  }
  .dual-eye:first-child {
    border-right: none;
    border-bottom: 1px solid var(--vp-c-divider);
  }
}
</style>
