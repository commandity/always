<script setup lang="ts">
import { ref, computed } from "vue";

const input = ref("");
const result = ref<string | null>(null);
const error = ref(false);
const copied = ref(false);
const showDetail = ref(false);

const keys = [
  { label: "C", type: "action" },
  { label: "(", type: "func" },
  { label: ")", type: "func" },
  { label: "⌫", type: "action" },
  { label: "7", type: "num" },
  { label: "8", type: "num" },
  { label: "9", type: "num" },
  { label: "÷", type: "op" },
  { label: "4", type: "num" },
  { label: "5", type: "num" },
  { label: "6", type: "num" },
  { label: "×", type: "op" },
  { label: "1", type: "num" },
  { label: "2", type: "num" },
  { label: "3", type: "num" },
  { label: "−", type: "op" },
  { label: ".", type: "num" },
  { label: "0", type: "num" },
  { label: "±", type: "func" },
  { label: "+", type: "op" },
];

const displayFormatted = computed(() => {
  return input.value.replace(/\*/g, "×").replace(/\//g, "÷").replace(/-/g, "−");
});

function press(key: string) {
  error.value = false;
  if (key === "C") {
    input.value = "";
    result.value = null;
    return;
  }
  if (key === "⌫") {
    input.value = input.value.slice(0, -1);
    return;
  }
  if (key === "±") {
    if (input.value.startsWith("-")) {
      input.value = input.value.slice(1);
    } else {
      input.value = "-" + input.value;
    }
    return;
  }
  const op = key === "×" ? "*" : key === "÷" ? "/" : key === "−" ? "-" : key;
  input.value += op;
}

function calc() {
  if (!input.value.trim()) return;
  try {
    const expr = input.value
      .replace(/×/g, "*")
      .replace(/÷/g, "/")
      .replace(/−/g, "-");
    const safe = expr.replace(/[^0-9+\-*/.() ]/g, "");
    if (!safe) {
      error.value = true;
      result.value = null;
      return;
    }
    const val = Function(`"use strict"; return (${safe})`)();
    if (typeof val !== "number" || !isFinite(val)) {
      error.value = true;
      result.value = null;
      return;
    }
    result.value = String(Math.round(val * 1e10) / 1e10);
    error.value = false;
  } catch {
    error.value = true;
    result.value = null;
  }
}

function onKeydown(e: KeyboardEvent) {
  if (e.key === "Enter") {
    e.preventDefault();
    calc();
  }
  if (e.key === "Escape") {
    input.value = "";
    result.value = null;
    error.value = false;
  }
}

function generateMarkdown() {
  return (
    `# 計算結果\n\n` +
    `- **算式**: ${displayFormatted.value || "—"}\n` +
    `- **結果**: **${result.value ?? "—"}**\n`
  );
}

async function copyMarkdown() {
  await navigator.clipboard.writeText(generateMarkdown());
  copied.value = true;
  setTimeout(() => (copied.value = false), 2000);
}

function reset() {
  input.value = "";
  result.value = null;
  error.value = false;
  showDetail.value = false;
}
</script>

<template>
  <div class="calc">
    <div class="tab-bar">
      <button class="tab-btn active">
        <span class="tab-label">Simple Calculator 簡易計算機</span>
        <span class="tab-sub">支援鍵盤輸入與點擊按鍵</span>
      </button>
    </div>

    <div class="panel">
      <div class="sb-header">
        <div class="header-title">
          <h2 class="title">簡易計算機</h2>
          <p class="subtitle">Simple Calculator</p>
        </div>
      </div>

      <div class="intro-bar">
        <span class="intro-dot">◆</span>
        <span
          >直接<strong>鍵盤輸入</strong>算式，或點擊<strong>按鍵</strong>輸入，按
          <strong>Enter</strong> 或 <strong>=</strong> 計算結果。</span
        >
      </div>

      <div class="calc-body">
        <div class="display-card">
          <div class="display-expr">{{ displayFormatted || "&nbsp;" }}</div>
          <div
            class="display-result"
            :class="{ 'is-error': error, 'has-val': result !== null }"
          >
            <template v-if="error">算式有誤</template>
            <template v-else-if="result !== null">= {{ result }}</template>
            <template v-else>&nbsp;</template>
          </div>
        </div>

        <input
          :value="input"
          type="text"
          class="calc-input"
          placeholder="輸入算式，如 25 * 3 / 8"
          @input="(e) => (input = (e.target as HTMLInputElement).value)"
          @keydown="onKeydown"
          autofocus
        />

        <div class="keypad">
          <button
            v-for="k in keys"
            :key="k.label"
            class="key"
            :class="'key-' + k.type"
            @click="press(k.label)"
          >
            {{ k.label }}
          </button>
          <button class="key key-eq" @click="calc">=</button>
        </div>
      </div>

      <div v-if="showDetail" class="results-detail">
        <div class="results-header">計算明細</div>
        <div class="detail-row">
          <span class="detail-letter">◆</span>
          <span class="detail-domain">算式</span>
          <span class="detail-score">{{ displayFormatted || "—" }}</span>
        </div>
        <div class="detail-row total-row">
          <span class="detail-letter brand-sm">∑</span>
          <span class="detail-domain">結果</span>
          <span class="detail-score positive">{{ result ?? "—" }}</span>
        </div>
      </div>

      <div class="sb-actions">
        <button class="btn-view" @click="showDetail = !showDetail">
          {{ showDetail ? "收起明細" : "查看評估結果" }}
        </button>
        <button class="btn-copy" @click="copyMarkdown">
          {{ copied ? "已複製 ✓" : "複製 Markdown 結果" }}
        </button>
        <button class="btn-reset" @click="reset">重置</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.calc {
  max-width: 480px;
  margin: 0 auto;
}

/* ── Tab bar ─────────────────────────────────── */
.tab-bar {
  display: flex;
  margin-bottom: 1.5rem;
  background: var(--vp-c-bg-mute);
  padding: 4px;
  border-radius: 10px;
  border: 1px solid var(--vp-c-divider);
}
.tab-btn {
  flex: 1;
  padding: 0.6rem 1rem;
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
}
.tab-label {
  display: block;
  font-size: 0.95rem;
  font-weight: 800;
  line-height: 1.3;
}
.tab-sub {
  display: block;
  font-size: 0.72rem;
  font-weight: 600;
  color: var(--vp-c-text-3);
  margin-top: 2px;
}
.tab-btn.active .tab-sub {
  color: var(--vp-c-brand-1);
  opacity: 0.85;
}

/* ── Panel ───────────────────────────────────── */
.panel {
  padding: 0 0 2rem;
  font-size: 0.9rem;
}
.sb-header {
  margin-bottom: 1rem;
}
.title {
  font-size: 22px;
  font-weight: 600;
  color: var(--vp-c-text-1);
  margin: 0 0 0.15rem;
  border: none !important;
  padding: 0 !important;
}
.subtitle {
  font-size: 0.75rem;
  color: var(--vp-c-text-3);
  margin: 0;
}

.intro-bar {
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
  padding: 0.65rem 0.85rem;
  border-radius: 8px;
  background: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-divider);
  border-left: 3px solid var(--vp-c-brand-1);
  font-size: 0.78rem;
  color: var(--vp-c-text-2);
  margin-bottom: 1.25rem;
  line-height: 1.5;
}
.intro-dot {
  color: var(--vp-c-brand-1);
  flex-shrink: 0;
}

/* ── Calculator body ─────────────────────────── */
.calc-body {
  border: 1px solid var(--vp-c-divider);
  border-radius: 14px;
  background: var(--vp-c-bg-soft);
  overflow: hidden;
}

/* ── Display ─────────────────────────────────── */
.display-card {
  padding: 1.2rem 1.25rem 0.9rem;
  background: var(--vp-c-bg-mute);
  border-bottom: 1px solid var(--vp-c-divider);
  min-height: 6rem;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
}
.display-expr {
  font-family: "SF Mono", "Fira Code", "Cascadia Code", monospace;
  font-size: 1.05rem;
  font-weight: 500;
  color: var(--vp-c-text-2);
  word-break: break-all;
  line-height: 1.4;
  min-height: 1.4em;
  overflow-y: auto;
  max-height: 5.6em;
}
.display-result {
  font-family: "SF Mono", "Fira Code", "Cascadia Code", monospace;
  font-size: 2rem;
  font-weight: 800;
  color: var(--vp-c-text-1);
  line-height: 1.2;
  margin-top: 0.4rem;
  text-align: right;
  transition: color 0.2s;
}
.display-result.has-val {
  color: #22c55e;
}
.display-result.is-error {
  color: #ef4444;
  font-size: 1rem;
  font-weight: 600;
  text-align: center;
}

.calc-input {
  width: 100%;
  padding: 0.65rem 1rem;
  border: none;
  border-bottom: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg);
  font-size: 0.85rem;
  font-family: "SF Mono", "Fira Code", monospace;
  font-weight: 500;
  color: var(--vp-c-text-2);
  outline: none;
  box-sizing: border-box;
}
.calc-input::placeholder {
  color: var(--vp-c-text-3);
  font-weight: 400;
}

/* ── Keypad ──────────────────────────────────── */
.keypad {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 1px;
  padding: 1px;
  background: var(--vp-c-divider);
}
.key {
  padding: 0.85rem 0;
  border: none;
  background: var(--vp-c-bg-soft);
  font-size: 1.05rem;
  font-weight: 600;
  font-family: "SF Mono", "Fira Code", monospace;
  color: var(--vp-c-text-1);
  cursor: pointer;
  transition: background 0.1s;
  user-select: none;
}
.key:hover {
  background: var(--vp-c-bg-mute);
}
.key:active {
  background: color-mix(in srgb, var(--vp-c-brand-1) 15%, var(--vp-c-bg-soft));
}

.key-num {
  font-weight: 700;
  font-size: 1.1rem;
}
.key-op {
  color: var(--vp-c-brand-1);
  font-size: 1.15rem;
  font-weight: 700;
}
.key-func {
  color: var(--vp-c-text-2);
  font-size: 0.95rem;
}
.key-action {
  color: #ef4444;
  font-weight: 700;
  font-size: 0.95rem;
}
.key-eq {
  background: linear-gradient(135deg, var(--vp-c-brand-1), #4f46e5);
  color: #fff;
  font-size: 1.25rem;
  font-weight: 800;
}
.key-eq:hover {
  background: linear-gradient(135deg, #4f46e5, var(--vp-c-brand-1));
}

/* ── Detail panel ────────────────────────────── */
.results-detail {
  border: 1px solid var(--vp-c-divider);
  border-radius: 12px;
  overflow: hidden;
  margin-top: 1rem;
  margin-bottom: 0.75rem;
}
.results-header {
  padding: 0.55rem 0.85rem;
  background: var(--vp-c-bg-mute);
  font-size: 0.78rem;
  font-weight: 800;
  color: var(--vp-c-text-1);
  border-bottom: 1px solid var(--vp-c-divider);
}
.detail-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.4rem 0.85rem;
  border-top: 1px solid var(--vp-c-divider);
  font-size: 0.8rem;
}
.detail-letter {
  flex-shrink: 0;
  width: 20px;
  text-align: center;
  font-size: 0.7rem;
  font-weight: 800;
  color: var(--vp-c-text-3);
}
.detail-domain {
  flex: 1;
  color: var(--vp-c-text-2);
}
.detail-score {
  font-weight: 700;
  color: var(--vp-c-text-1);
  font-family: "SF Mono", "Fira Code", monospace;
  font-size: 0.82rem;
}
.total-row {
  background: var(--vp-c-bg-mute);
}
.positive {
  color: #22c55e;
}
.brand-sm {
  color: var(--vp-c-brand-1);
}

/* ── Action buttons ──────────────────────────── */
.sb-actions {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}
.btn-view,
.btn-copy,
.btn-reset {
  padding: 8px 18px;
  border-radius: 8px;
  font-size: 0.82rem;
  font-weight: 600;
  cursor: pointer;
  font-family: inherit;
  transition: all 0.15s;
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
  .calc {
    max-width: 100%;
  }
  .tab-label {
    font-size: 0.85rem;
  }
  .tab-sub {
    font-size: 0.68rem;
  }
  .display-expr {
    font-size: 0.95rem;
  }
  .display-result {
    font-size: 1.7rem;
  }
  .display-card {
    padding: 1rem 1rem 0.75rem;
    min-height: 5rem;
  }
  .key {
    padding: 0.75rem 0;
    font-size: 1rem;
  }
  .key-eq {
    font-size: 1.1rem;
  }
}
</style>
