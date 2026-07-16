<script setup lang="ts">
import { ref, computed, nextTick } from "vue";

const display = ref("");
const result = ref<string | null>(null);
const error = ref(false);
const copied = ref(false);
const showDetail = ref(false);

const keys = [
  "7",
  "8",
  "9",
  "÷",
  "4",
  "5",
  "6",
  "×",
  "1",
  "2",
  "3",
  "−",
  "C",
  "0",
  ".",
  "+",
  "⌫",
  "(",
  ")",
  "=",
];

const displayFormatted = computed(() => {
  return display.value
    .replace(/\*/g, "×")
    .replace(/\//g, "÷")
    .replace(/-/g, "−");
});

function input(key: string) {
  error.value = false;
  if (key === "=") {
    calc();
    return;
  }
  if (key === "C") {
    display.value = "";
    result.value = null;
    error.value = false;
    return;
  }
  if (key === "⌫") {
    display.value = display.value.slice(0, -1);
    return;
  }
  const op = key === "×" ? "*" : key === "÷" ? "/" : key === "−" ? "-" : key;
  display.value += op;
}

function onKeydown(e: KeyboardEvent) {
  if (e.key === "Enter") {
    e.preventDefault();
    calc();
  }
  if (e.key === "Escape") {
    display.value = "";
    result.value = null;
    error.value = false;
  }
  if (e.key === "Backspace") {
    display.value = display.value.slice(0, -1);
  }
}

function calc() {
  if (!display.value.trim()) return;
  try {
    const expr = display.value
      .replace(/×/g, "*")
      .replace(/÷/g, "/")
      .replace(/−/g, "-");
    const safe = expr.replace(/[^0-9+\-*/.() ]/g, "");
    if (!safe || /[+\-*/.]{2,}/.test(safe.replace(/\s/g, ""))) {
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

function generateMarkdown() {
  const expr = displayFormatted.value;
  const res = result.value ?? "—";
  return (
    `# 計算結果\n\n` + `- **算式**: ${expr}\n` + `- **結果**: **${res}**\n`
  );
}

async function copyMarkdown() {
  await navigator.clipboard.writeText(generateMarkdown());
  copied.value = true;
  setTimeout(() => (copied.value = false), 2000);
}

function reset() {
  display.value = "";
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

      <div class="input-wrap">
        <input
          v-model="display"
          type="text"
          class="calc-input"
          :class="{ 'has-result': result !== null, 'is-error': error }"
          placeholder="輸入算式，如 25 * 3 / 8"
          @keydown="onKeydown"
          autofocus
        />
      </div>

      <div class="keypad">
        <button
          v-for="k in keys"
          :key="k"
          class="key"
          :class="{
            'key-op': ['+', '−', '×', '÷'].includes(k),
            'key-eq': k === '=',
            'key-clear': k === 'C',
            'key-del': k === '⌫',
            'key-paren': ['(', ')'].includes(k),
          }"
          @click="input(k)"
        >
          {{ k }}
        </button>
      </div>

      <div class="result-bar" :class="{ 'result-error': error }">
        <span v-if="error" class="result-text error-text"
          >算式有誤，請重新輸入</span
        >
        <span v-else-if="result !== null" class="result-text">
          = <strong class="result-num">{{ result }}</strong>
        </span>
        <span v-else class="result-placeholder">等待輸入...</span>
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
}
.tab-label {
  display: block;
  font-size: 1rem;
  font-weight: 800;
  line-height: 1.3;
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

.panel {
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

.input-wrap {
  margin-bottom: 0.75rem;
}
.calc-input {
  width: 100%;
  padding: 0.85rem 1rem;
  border: 1.5px solid var(--vp-c-divider);
  border-radius: 10px;
  background: var(--vp-c-bg-soft);
  font-size: 1.15rem;
  font-family: "SF Mono", "Fira Code", monospace;
  font-weight: 600;
  color: var(--vp-c-text-1);
  outline: none;
  transition: border-color 0.2s;
  box-sizing: border-box;
  letter-spacing: 0.03em;
}
.calc-input:focus {
  border-color: var(--vp-c-brand-1);
}
.calc-input.has-result {
  border-color: color-mix(in srgb, #22c55e 50%, var(--vp-c-divider));
}
.calc-input.is-error {
  border-color: #ef4444;
}
.calc-input::placeholder {
  color: var(--vp-c-text-3);
  font-weight: 400;
}

.keypad {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 6px;
  margin-bottom: 0.75rem;
}
.key {
  padding: 0.7rem 0;
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  background: var(--vp-c-bg-soft);
  font-size: 1rem;
  font-weight: 700;
  font-family: "SF Mono", "Fira Code", monospace;
  color: var(--vp-c-text-1);
  cursor: pointer;
  transition: all 0.12s;
  user-select: none;
}
.key:hover {
  background: var(--vp-c-bg-mute);
  border-color: var(--vp-c-brand-1);
}
.key:active {
  transform: scale(0.95);
}
.key-op {
  color: var(--vp-c-brand-1);
  font-size: 1.15rem;
}
.key-eq {
  background: linear-gradient(135deg, var(--vp-c-brand-1), #4f46e5);
  color: #fff;
  border-color: transparent;
  font-size: 1.15rem;
}
.key-eq:hover {
  opacity: 0.9;
}
.key-clear {
  color: #ef4444;
}
.key-del {
  color: var(--vp-c-text-2);
}
.key-paren {
  color: var(--vp-c-text-2);
  font-size: 1.1rem;
}

.result-bar {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding: 0.85rem 1rem;
  border: 1px solid var(--vp-c-divider);
  border-radius: 10px;
  background: var(--vp-c-bg-soft);
  margin-bottom: 1rem;
  min-height: 3rem;
}
.result-text {
  font-size: 1rem;
  font-weight: 600;
  color: var(--vp-c-text-2);
}
.result-num {
  font-size: 1.4rem;
  color: #22c55e;
  font-family: "SF Mono", "Fira Code", monospace;
}
.error-text {
  color: #ef4444;
}
.result-placeholder {
  color: var(--vp-c-text-3);
  font-size: 0.85rem;
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
  width: 22px;
  text-align: center;
  font-size: 0.74rem;
  font-weight: 800;
  color: var(--vp-c-text-3);
}
.detail-domain {
  flex: 1;
  color: var(--vp-c-text-2);
}
.detail-score {
  font-weight: 800;
  color: var(--vp-c-text-1);
}
.total-row {
  background: var(--vp-c-bg-mute);
  font-weight: 700;
}
.positive {
  color: #22c55e;
}
.brand-sm {
  color: var(--vp-c-brand-1);
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
  .tab-label {
    font-size: 0.9rem;
  }
  .tab-sub {
    font-size: 0.72rem;
  }
  .key {
    padding: 0.6rem 0;
    font-size: 0.92rem;
  }
  .calc-input {
    font-size: 1rem;
    padding: 0.75rem 0.85rem;
  }
}
</style>
