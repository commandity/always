<script setup lang="ts">
import { ref, computed } from "vue";

const input = ref("");
const result = ref<string | null>(null);
const error = ref(false);

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
          <button class="key key-func" @click="press('(')">(</button>
          <button class="key key-func" @click="press(')')">)</button>
          <button class="key key-action" @click="press('C')">C</button>
          <button class="key key-action" @click="press('⌫')">⌫</button>

          <button class="key key-num" @click="press('7')">7</button>
          <button class="key key-num" @click="press('8')">8</button>
          <button class="key key-num" @click="press('9')">9</button>
          <button class="key key-op" @click="press('÷')">÷</button>

          <button class="key key-num" @click="press('4')">4</button>
          <button class="key key-num" @click="press('5')">5</button>
          <button class="key key-num" @click="press('6')">6</button>
          <button class="key key-op" @click="press('×')">×</button>

          <button class="key key-num" @click="press('1')">1</button>
          <button class="key key-num" @click="press('2')">2</button>
          <button class="key key-num" @click="press('3')">3</button>
          <button class="key key-op" @click="press('−')">−</button>

          <button class="key key-num" @click="press('.')">.</button>
          <button class="key key-num" @click="press('0')">0</button>
          <button class="key key-eq" @click="calc">=</button>
          <button class="key key-op" @click="press('+')">+</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.calc {
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
  max-width: 420px;
  margin: 0 auto;
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
  grid-template-columns: repeat(4, 1fr);
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
