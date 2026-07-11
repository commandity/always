---
layout: doc
title: SGLT2 抑制劑（排糖藥）臺灣臨床應用與給付 — SGLT2 Inhibitors — Taiwan Clinical Application & Reimbursement
---

# SGLT2 抑制劑（排糖藥）臺灣臨床應用與給付

**SGLT2 抑制劑（排糖藥）臺灣臨床應用與給付 SGLT2 Inhibitors — Taiwan Clinical Application & Reimbursement**

## 概述 Overview

SGLT2 抑制劑（Sodium-Glucose Co-transporter 2 Inhibitors）作用於腎臟近端腎小管，抑制腎絲球過濾之葡萄糖再吸收，增加尿糖排泄，達到降血糖效果。額外具有減重、降血壓、保護心腎等效益。

## 糖尿病腎病變自然病程 Natural History of Diabetic Nephropathy

糖尿病腎病變（Diabetic Kidney Disease, DKD）的進展遵循特定的時序模式：eGFR 與 UACR 的動態變化反映腎絲球血流動力學與結構損傷的累積過程。

### eGFR 與 UACR 隨糖尿病病程的變化

<svg width="100%" viewBox="0 0 700 460" xmlns="http://www.w3.org/2000/svg" role="img" style="font-family:sans-serif">
<title>糖尿病腎病變自然病程 — eGFR 與 UACR 隨病程變化</title>
<desc>顯示 eGFR（藍線）與 UACR（紅線）隨糖尿病病程（年）的動態變化，及白蛋白尿分期標記。藍線呈現早期 hyperfiltration 後緩降再急墜；紅線在 yr15 達巨量蛋白尿峰值後因腎絲球硬化而下降。</desc>

<defs>
  <clipPath id="plot-clip">
    <rect x="72" y="10" width="480" height="340"/>
  </clipPath>
</defs>

<!-- Y scale: eGFR 0–130, plot y=10(130) to y=350(0). y = 350-(val/130)*340
     X scale: 0–22 yr, plot x=72 to x=552. x = 72+(yr/22)*480 -->

<!-- BACKGROUND ZONES (clipped) -->
<g clip-path="url(#plot-clip)">
  <rect x="72" y="10"  width="480" height="183" fill="#FADADD"/>
  <rect x="72" y="193" width="480" height="52"  fill="#FFF3CD"/>
  <rect x="72" y="245" width="480" height="105" fill="#DDEEFF"/>
</g>

<!-- ZONE BOUNDARY LINES -->
<line x1="72" y1="193" x2="552" y2="193" stroke="#ccc" stroke-width="0.8"/>
<line x1="72" y1="245" x2="552" y2="245" stroke="#ccc" stroke-width="0.8"/>

<!-- ZONE LABELS (right margin) -->
<text x="560" y="80"  font-size="12" font-weight="700" fill="#C0392B">Macroalbuminuria</text>
<text x="560" y="96"  font-size="11" fill="#C0392B">(>300 mg/gCr)</text>
<text x="560" y="218" font-size="12" font-weight="700" fill="#8B6914">Microalbuminuria</text>
<text x="560" y="234" font-size="11" fill="#8B6914">(30–300 mg/gCr)</text>
<text x="560" y="288" font-size="12" font-weight="700" fill="#2A5FA5">Normoalbuminuria</text>
<text x="560" y="304" font-size="11" fill="#2A5FA5">(&lt;30 mg/gCr)</text>

<!-- AXES -->
<line x1="72" y1="350" x2="552" y2="350" stroke="#555" stroke-width="1.5"/>
<line x1="72" y1="10"  x2="72"  y2="350" stroke="#555" stroke-width="1.5"/>
<polygon points="552,350 544,346 544,354" fill="#555"/>
<polygon points="72,10 68,18 76,18" fill="#555"/>

<!-- Y AXIS TICKS & LABELS -->
<text x="65" y="355" text-anchor="end" font-size="11" fill="#555">0</text>
<text x="65" y="301" text-anchor="end" font-size="11" fill="#555">20</text>
<line x1="69" y1="297" x2="72" y2="297" stroke="#555" stroke-width="1"/>
<text x="65" y="249" text-anchor="end" font-size="11" fill="#555">40</text>
<line x1="69" y1="245" x2="72" y2="245" stroke="#555" stroke-width="1"/>
<text x="65" y="197" text-anchor="end" font-size="11" fill="#555">60</text>
<line x1="69" y1="193" x2="72" y2="193" stroke="#555" stroke-width="1"/>
<text x="65" y="145" text-anchor="end" font-size="11" fill="#555">80</text>
<line x1="69" y1="141" x2="72" y2="141" stroke="#555" stroke-width="1"/>
<text x="65" y="93"  text-anchor="end" font-size="11" fill="#555">100</text>
<line x1="69" y1="88"  x2="72" y2="88"  stroke="#555" stroke-width="1"/>
<text x="65" y="41"  text-anchor="end" font-size="11" fill="#555">120</text>
<line x1="69" y1="36"  x2="72" y2="36"  stroke="#555" stroke-width="1"/>
<text transform="rotate(-90,14,180)" x="14" y="180" text-anchor="middle" font-size="12" font-weight="600" fill="#333">eGFR (mL/min/1.73 m²)</text>

<!-- X AXIS TICKS & LABELS -->
<line x1="181" y1="350" x2="181" y2="354" stroke="#555" stroke-width="1"/>
<text x="181" y="368" text-anchor="middle" font-size="11" fill="#555">5</text>
<line x1="290" y1="350" x2="290" y2="354" stroke="#555" stroke-width="1"/>
<text x="290" y="368" text-anchor="middle" font-size="11" fill="#555">10</text>
<line x1="399" y1="350" x2="399" y2="354" stroke="#555" stroke-width="1"/>
<text x="399" y="368" text-anchor="middle" font-size="11" fill="#555">15</text>
<line x1="508" y1="350" x2="508" y2="354" stroke="#555" stroke-width="1"/>
<text x="508" y="368" text-anchor="middle" font-size="11" fill="#555">20</text>
<text x="450" y="385" text-anchor="middle" font-size="13" font-weight="600" fill="#333">Duration of diabetes (yr)</text>

<!-- eGFR CURVE (BLUE)
     yr0 →105→y=75 | yr3→108→y=67(hyperfiltration) | yr7→104→y=77
     yr10→93→y=107 | yr13→82→y=135 | yr15→72→y=162
     yr17→52→y=214 | yr19→25→y=285 | yr21→8→y=329 -->
<path d="M72,75 C88,70 100,64 105,67 C118,72 148,73 175,74 C215,76 260,88 290,107 C322,127 362,148 399,162 C418,172 432,190 443,214 C455,240 470,268 487,285 C500,296 515,314 530,329"
  fill="none" stroke="#2563EB" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round" clip-path="url(#plot-clip)"/>
<line x1="530" y1="329" x2="530" y2="348" stroke="#2563EB" stroke-width="3.5"/>
<polygon points="530,352 524,341 536,341" fill="#2563EB"/>
<text x="98" y="60" font-size="13" font-weight="700" fill="#2563EB">eGFR</text>

<!-- UACR CURVE (RED)
     yr0→18→y=303 | yr5→25→y=285 | yr8→45→y=232
     yr10→58→y=198 | yr13→92→y=109 | yr15→115→y=49(peak)
     yr16→108→y=67 | yr17→88→y=120 | yr18→65→y=180
     yr19→48→y=225 | yr20.5→36→y=256 -->
<path d="M72,303 C110,298 148,288 181,278 C210,270 248,248 268,225 C280,210 290,198 316,168 C345,136 375,108 399,49 C406,38 413,33 421,60 C428,88 436,110 443,120 C451,130 458,158 465,180 C473,205 480,218 487,225 C496,238 503,247 510,256"
  fill="none" stroke="#DC2626" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round" clip-path="url(#plot-clip)"/>
<line x1="510" y1="256" x2="510" y2="275" stroke="#DC2626" stroke-width="3.5"/>
<polygon points="510,279 504,268 516,268" fill="#DC2626"/>
<text x="235" y="270" font-size="13" font-weight="700" fill="#DC2626">UACR</text>

<!-- KEY ANNOTATION: eGFR ~50% decline at macroalbuminuria onset
     eGFR 52 → y=214, at yr17 x=443
     Box sits at y=400–448, below all x-axis labels (y=368) and Duration title (y=385) -->
<line x1="72" y1="214" x2="443" y2="214" stroke="#7C3AED" stroke-width="1.3" stroke-dasharray="5 3"/>
<circle cx="443" cy="214" r="5" fill="#7C3AED" stroke="white" stroke-width="1.5"/>
<text x="65" y="212" text-anchor="end" font-size="10" font-weight="700" fill="#7C3AED">~52</text>
<text x="65" y="224" text-anchor="end" font-size="9" fill="#7C3AED">(50%↓)</text>
<path d="M443,219 L443,415 L323,415" fill="none" stroke="#7C3AED" stroke-width="1" stroke-dasharray="4 2"/>
<rect x="80" y="400" width="242" height="48" fill="#F5F0FF" stroke="#7C3AED" stroke-width="1.2" rx="4"/>
<text x="201" y="413" text-anchor="middle" font-size="10" font-weight="700" fill="#5B21B6">當 UACR > 300 mg/24h（巨量蛋白尿）</text>
<text x="201" y="426" text-anchor="middle" font-size="10" fill="#6D28D9">eGFR 已較基礎值下降約 50%</text>
<text x="201" y="439" text-anchor="middle" font-size="9" fill="#7C3AED">腎功能不可逆喪失明顯加速</text>

<!-- PLOT BORDER -->
<rect x="72" y="10" width="480" height="340" fill="none" stroke="#888" stroke-width="1"/>
</svg>

### 病程解讀與臨床意義 Interpretation & Clinical Significance

糖尿病腎病變依 Mogensen 分期，腎功能與蛋白尿的動態關係可分為三個階段：

**早期（病程 0–10 年）**：腎絲球高過濾（hyperfiltration）使 eGFR 初期略高於正常（可達 110–120 mL/min/1.73 m²），此時 UACR 仍在正常範圍或輕度升高（正常白蛋白尿 → 微量白蛋白尿），腎臟結構損傷尚可逆。

**中期（病程 10–17 年）**：UACR 持續上升，進入微量白蛋白尿期（30–300 mg/gCr）並逐漸達巨量白蛋白尿（＞300 mg/gCr）；eGFR 開始明顯下降，腎絲球硬化（glomerulosclerosis）加速進行。

**晚期（病程 ≥ 17–20 年）— 臨床關鍵節點**：當 UACR 超過 300 mg/24h（巨量蛋白尿 / macroalbuminuria），eGFR 通常已較起始值下降約 **50%**，進入 G3b–G4 範圍（30–44 mL/min/1.73 m²）。此後蛋白尿可能因腎絲球大量硬化而「假性降低」，但腎功能持續急速惡化，ESRD 風險極高。

> **臨床重點**：巨量蛋白尿（UACR ＞ 300 mg/g 或 ＞ 300 mg/24h）的出現，是 eGFR 已實質性下滑 50% 的訊號，並非病程起點。此時若尚未啟動腎保護治療（ACEi/ARB + SGLT2i），腎功能惡化速率可達每年下降 10–15 mL/min/1.73 m²，遠快於一般 CKD 的自然病程（每年約 1–3 mL/min/1.73 m²）。

> **SGLT2i 介入時機**：依 DAPA-CKD 與 EMPA-KIDNEY 試驗結果，在蛋白尿出現後（uACR ≥ 200 mg/g）、eGFR 仍在 25–60 mL/min/1.73 m² 的窗口期早期介入，可顯著延緩腎功能惡化速率（eGFR 斜率改善），部分病人甚至可見 eGFR 穩定化。

## 臺灣上市單方藥品 Single-Agent Products in Taiwan

| 成分              | 商品名    | 中文名 | 劑量          | 藥廠                 |
| ----------------- | --------- | ------ | ------------- | -------------------- |
| **Dapagliflozin** | Forxiga   | 福適佳 | 5 mg / 10 mg  | AstraZeneca          |
| **Empagliflozin** | Jardiance | 恩排糖 | 10 mg / 25 mg | Boehringer Ingelheim |
| **Canagliflozin** | Canaglu   | 可拿糖 | 100 mg        | 台田                 |
| **Ertugliflozin** | Steglatro | 穩適妥 | 5 mg / 15 mg  | MSD                  |

## 臺灣 TFDA 核准適應症

| 適應症                       | Dapagliflozin | Empagliflozin 10 mg | Empagliflozin 25 mg | Canagliflozin | Ertugliflozin |
| ---------------------------- | :-----------: | :-----------------: | :-----------------: | :-----------: | :-----------: |
| 第二型糖尿病                 |       ✅       |          ✅          |          ✅          |       ✅       |       ✅       |
| 心臟衰竭（HFrEF/HFmrEF）     |       ✅       |          ✅          |          ❌          |       ❌       |       ❌       |
| 慢性腎臟病（CKD）            |       ✅       |          ✅          |          ❌          |       ❌       |       ❌       |
| 糖尿病腎病變（巨量蛋白尿）   |       ❌       |          ❌          |          ❌          |       ✅       |       ❌       |
| 預防心血管事件（T2DM + CVD） |       ✅       |          ✅          |          ✅          |       —       |       —       |

> Empagliflozin **25 mg** 僅取得糖尿病適應症；心衰竭與慢性腎臟病適應症限 **10 mg**。

## 用法用量 Dosage & Administration

### Dapagliflozin（Forxiga）

| 適應症        | 起始劑量 | 最大劑量 | 腎功能限制                                          |
| ------------- | -------- | -------- | --------------------------------------------------- |
| T2DM 血糖控制 | 5 mg QD  | 10 mg QD | eGFR ≥ 45 始可起始                                  |
| 心衰竭 / CKD  | 10 mg QD | 10 mg QD | eGFR ≥ 25 可起始；< 25 不建議起始，治療後下降可續用 |

### Empagliflozin（Jardiance）

| 適應症        | 劑量                    | 腎功能限制             |
| ------------- | ----------------------- | ---------------------- |
| T2DM 血糖控制 | 10 mg QD → 可增至 25 mg | eGFR ≥ 30 可增至 25 mg |
| 心衰竭        | 10 mg QD                | 不限（透析不建議起始） |
| CKD           | 10 mg QD                | 不限（透析不建議起始） |

### Canagliflozin（Canaglu）

| 適應症              | 劑量               | 腎功能限制                   |
| ------------------- | ------------------ | ---------------------------- |
| T2DM / 糖尿病腎病變 | 100 mg QD 早餐前後 | eGFR ≥ 30；< 30 不建議新開立 |

### Ertugliflozin（Steglatro）

| 適應症 | 起始劑量 | 最大劑量 | 腎功能限制 |
| ------ | -------- | -------- | ---------- |
| T2DM   | 5 mg QD  | 15 mg QD | eGFR ≥ 45  |

## 慢性腎臟病風險分層矩陣 CKD Risk Stratification Matrix

依據 KDIGO 2024 指引，eGFR 與 uACR 為預測 CKD 預後（住院、全因死亡、心血管事件）的獨立危險因子，二維矩陣可用於風險分層與治療決策。斜線區域標示臺灣健保 SGLT2i CKD 給付適應症範圍。

<svg width="100%" viewBox="0 0 680 510" xmlns="http://www.w3.org/2000/svg" role="img">
<title>CKD 風險分層矩陣 — eGFR × uACR（含 SGLT2i 給付適應症標記）</title>
<desc>依據 KDIGO 指引之 CKD 預後風險矩陣，標示 Forxiga 與 Jardiance 健保 CKD 給付適應症範圍</desc>
<defs>
  <marker id="arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
    <path d="M2 1L8 5L2 9" fill="none" stroke="context-stroke" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
  </marker>
  <pattern id="hatch-blue" patternUnits="userSpaceOnUse" width="9" height="9" patternTransform="rotate(45)">
    <line x1="0" y1="0" x2="0" y2="9" stroke="rgba(255,255,255,0.5)" stroke-width="3"/>
  </pattern>
  <pattern id="hatch-green" patternUnits="userSpaceOnUse" width="9" height="9" patternTransform="rotate(45)">
    <line x1="0" y1="0" x2="0" y2="9" stroke="rgba(255,255,255,0.5)" stroke-width="3"/>
  </pattern>
</defs>

<!-- ── HEADER ROW 1 ── -->
<rect x="162" y="0"  width="390" height="28" fill="#1A6B5A"/>
<text font-family="sans-serif" font-size="13" font-weight="600" x="357" y="19" text-anchor="middle" fill="#E1F5EE">uACR 分類（白蛋白尿程度）</text>

<!-- ── HEADER ROW 2 ── -->
<rect x="0"   y="28" width="162" height="50" fill="#1A6B5A"/>
<text font-family="sans-serif" font-size="11" font-weight="600" x="81" y="47" text-anchor="middle" fill="#E1F5EE">eGFR 分期</text>
<text font-family="sans-serif" font-size="10" x="81" y="63" text-anchor="middle" fill="#9FE1CB">（mL/min/1.73 m²）</text>

<rect x="162" y="28" width="130" height="50" fill="#2D8B72"/>
<text font-family="sans-serif" font-size="11" font-weight="500" x="227" y="46" text-anchor="middle" fill="#E1F5EE">正常至輕度升高</text>
<text font-family="sans-serif" font-size="10" x="227" y="63" text-anchor="middle" fill="#C0EDDA">&lt;30 mg/g（A1）</text>

<rect x="292" y="28" width="130" height="50" fill="#2D8B72"/>
<text font-family="sans-serif" font-size="11" font-weight="500" x="357" y="46" text-anchor="middle" fill="#E1F5EE">中度升高</text>
<text font-family="sans-serif" font-size="10" x="357" y="63" text-anchor="middle" fill="#C0EDDA">30–300 mg/g（A2）</text>

<rect x="422" y="28" width="130" height="50" fill="#2D8B72"/>
<text font-family="sans-serif" font-size="11" font-weight="500" x="487" y="46" text-anchor="middle" fill="#E1F5EE">嚴重升高</text>
<text font-family="sans-serif" font-size="10" x="487" y="63" text-anchor="middle" fill="#C0EDDA">&gt;300 mg/g（A3）</text>

<!-- ── DATA ROW 1: G1 ≥90  y=78 ── -->
<rect x="0"   y="78" width="162" height="52" fill="#F4F3EF"/>
<text font-family="sans-serif" font-size="11" x="8" y="99"  fill="#444">G1　正常或增高</text>
<text font-family="sans-serif" font-size="10" x="8" y="114" fill="#777">≥ 90</text>
<rect x="162" y="78" width="130" height="52" fill="#4CAF6E"/>
<text font-family="sans-serif" font-size="12" font-weight="600" x="227" y="109" text-anchor="middle" fill="#1B4D28">低風險</text>
<rect x="292" y="78" width="130" height="52" fill="#F5C842"/>
<text font-family="sans-serif" font-size="12" font-weight="600" x="357" y="109" text-anchor="middle" fill="#5C3D06">中度風險</text>
<rect x="422" y="78" width="130" height="52" fill="#E07A30"/>
<text font-family="sans-serif" font-size="12" font-weight="600" x="487" y="109" text-anchor="middle" fill="#4A1E06">高風險</text>

<!-- ── DATA ROW 2: G2 60-89  y=130 ── -->
<rect x="0"   y="130" width="162" height="52" fill="#EEECEA"/>
<text font-family="sans-serif" font-size="11" x="8" y="151" fill="#444">G2　輕度降低</text>
<text font-family="sans-serif" font-size="10" x="8" y="166" fill="#777">60–89</text>
<rect x="162" y="130" width="130" height="52" fill="#4CAF6E"/>
<text font-family="sans-serif" font-size="12" font-weight="600" x="227" y="161" text-anchor="middle" fill="#1B4D28">低風險</text>
<rect x="292" y="130" width="130" height="52" fill="#F5C842"/>
<text font-family="sans-serif" font-size="12" font-weight="600" x="357" y="161" text-anchor="middle" fill="#5C3D06">中度風險</text>
<rect x="422" y="130" width="130" height="52" fill="#E07A30"/>
<text font-family="sans-serif" font-size="12" font-weight="600" x="487" y="161" text-anchor="middle" fill="#4A1E06">高風險</text>

<!-- ── DATA ROW 3: G3a 45-59  y=182 ── -->
<rect x="0"   y="182" width="162" height="52" fill="#F4F3EF"/>
<text font-family="sans-serif" font-size="11" x="8" y="203" fill="#444">G3a　輕至中度降低</text>
<text font-family="sans-serif" font-size="10" x="8" y="218" fill="#777">45–59</text>
<rect x="162" y="182" width="130" height="52" fill="#F5C842"/>
<text font-family="sans-serif" font-size="12" font-weight="600" x="227" y="213" text-anchor="middle" fill="#5C3D06">中度風險</text>
<rect x="292" y="182" width="130" height="52" fill="#E07A30"/>
<text font-family="sans-serif" font-size="12" font-weight="600" x="357" y="213" text-anchor="middle" fill="#4A1E06">高風險</text>
<rect x="422" y="182" width="130" height="52" fill="#C8311E"/>
<text font-family="sans-serif" font-size="12" font-weight="600" x="487" y="213" text-anchor="middle" fill="#FFD5CF">極高風險</text>

<!-- ── DATA ROW 4: G3b 30-44  y=234 ── -->
<rect x="0"   y="234" width="162" height="52" fill="#EEECEA"/>
<text font-family="sans-serif" font-size="11" x="8" y="255" fill="#444">G3b　中至重度降低</text>
<text font-family="sans-serif" font-size="10" x="8" y="270" fill="#777">30–44</text>
<rect x="162" y="234" width="130" height="52" fill="#E07A30"/>
<text font-family="sans-serif" font-size="12" font-weight="600" x="227" y="265" text-anchor="middle" fill="#4A1E06">高風險</text>
<rect x="292" y="234" width="130" height="52" fill="#C8311E"/>
<text font-family="sans-serif" font-size="12" font-weight="600" x="357" y="265" text-anchor="middle" fill="#FFD5CF">極高風險</text>
<rect x="422" y="234" width="130" height="52" fill="#8C1710"/>
<text font-family="sans-serif" font-size="12" font-weight="600" x="487" y="265" text-anchor="middle" fill="#FFD5CF">極高風險</text>

<!-- ── DATA ROW 5: G4 15-29  y=286 ── -->
<rect x="0"   y="286" width="162" height="52" fill="#F4F3EF"/>
<text font-family="sans-serif" font-size="11" x="8" y="307" fill="#444">G4　重度降低</text>
<text font-family="sans-serif" font-size="10" x="8" y="322" fill="#777">15–29</text>
<rect x="162" y="286" width="130" height="52" fill="#C8311E"/>
<text font-family="sans-serif" font-size="12" font-weight="600" x="227" y="317" text-anchor="middle" fill="#FFD5CF">極高風險</text>
<rect x="292" y="286" width="130" height="52" fill="#8C1710"/>
<text font-family="sans-serif" font-size="12" font-weight="600" x="357" y="317" text-anchor="middle" fill="#FFD5CF">極高風險</text>
<rect x="422" y="286" width="130" height="52" fill="#8C1710"/>
<text font-family="sans-serif" font-size="12" font-weight="600" x="487" y="317" text-anchor="middle" fill="#FFD5CF">極高風險</text>

<!-- ── DATA ROW 6: G5 <15  y=338 ── -->
<rect x="0"   y="338" width="162" height="52" fill="#EEECEA"/>
<text font-family="sans-serif" font-size="11" x="8" y="359" fill="#444">G5　腎衰竭</text>
<text font-family="sans-serif" font-size="10" x="8" y="374" fill="#777">&lt; 15</text>
<rect x="162" y="338" width="130" height="52" fill="#8C1710"/>
<text font-family="sans-serif" font-size="12" font-weight="600" x="227" y="369" text-anchor="middle" fill="#FFD5CF">極高風險</text>
<rect x="292" y="338" width="130" height="52" fill="#8C1710"/>
<text font-family="sans-serif" font-size="12" font-weight="600" x="357" y="369" text-anchor="middle" fill="#FFD5CF">極高風險</text>
<rect x="422" y="338" width="130" height="52" fill="#8C1710"/>
<text font-family="sans-serif" font-size="12" font-weight="600" x="487" y="369" text-anchor="middle" fill="#FFD5CF">極高風險</text>

<!-- ── GRID BORDER & DIVIDERS ── -->
<rect x="0" y="0" width="552" height="390" fill="none" stroke="#1A6B5A" stroke-width="1.5"/>
<line x1="162" y1="0"  x2="162" y2="390" stroke="#1A6B5A" stroke-width="0.8"/>
<line x1="292" y1="78" x2="292" y2="390" stroke="#1A6B5A" stroke-width="0.5" stroke-dasharray="3 2"/>
<line x1="422" y1="78" x2="422" y2="390" stroke="#1A6B5A" stroke-width="0.5" stroke-dasharray="3 2"/>
<line x1="0"   y1="28" x2="552" y2="28"  stroke="#1A6B5A" stroke-width="0.8"/>
<line x1="0"   y1="78" x2="552" y2="78"  stroke="#1A6B5A" stroke-width="0.8"/>

<!-- ── HATCH OVERLAY 1: NHI CKD indication ── -->
<rect x="292" y="182" width="260" height="104" fill="url(#hatch-blue)" stroke="#1255B0" stroke-width="2.2" stroke-dasharray="7 3"/>

<!-- ── HATCH OVERLAY 2: EMPA-KIDNEY extension ── -->
<rect x="162" y="234" width="130" height="52" fill="url(#hatch-green)" stroke="#0B6644" stroke-width="1.8" stroke-dasharray="5 3"/>

<!-- CALLOUT 1: NHI indication -->
<line x1="552" y1="229" x2="556" y2="229" stroke="#1255B0" stroke-width="1.2" marker-end="url(#arrow)"/>
<rect x="556" y="186" width="122" height="77" fill="#EAF2FC" stroke="#1255B0" stroke-width="1.2" rx="4"/>
<text font-family="sans-serif" font-size="10" font-weight="700" x="617" y="201" text-anchor="middle" fill="#0C3C80">健保給付區</text>
<text font-family="sans-serif" font-size="9"  x="617" y="215" text-anchor="middle" fill="#1255B0">Forxiga / Jardiance</text>
<text font-family="sans-serif" font-size="9"  x="617" y="229" text-anchor="middle" fill="#1255B0">CKD 適應症</text>
<text font-family="sans-serif" font-size="9"  x="617" y="243" text-anchor="middle" fill="#4477BB">eGFR 25–60</text>
<text font-family="sans-serif" font-size="9"  x="617" y="257" text-anchor="middle" fill="#4477BB">uACR 200–5000 mg/g</text>

<!-- CALLOUT 2: EMPA-KIDNEY -->
<path d="M292 260 L540 260 L540 319 L556 319" fill="none" stroke="#0B6644" stroke-width="1.2" marker-end="url(#arrow)" stroke-dasharray="4 2"/>
<rect x="558" y="293" width="116" height="52" fill="#E1F5EE" stroke="#0B6644" stroke-width="1.2" rx="4"/>
<text font-family="sans-serif" font-size="9" font-weight="700" x="616" y="311" text-anchor="middle" fill="#064D2E">EMPA-KIDNEY</text>
<text font-family="sans-serif" font-size="9" x="616" y="325" text-anchor="middle" fill="#0B6644">試驗納入族群</text>
<text font-family="sans-serif" font-size="8" x="616" y="338" text-anchor="middle" fill="#3A8A5A">eGFR 20–45（±蛋白尿）</text>

<!-- LEGEND BLOCK -->
<text font-family="sans-serif" font-size="11" font-weight="600" x="0" y="414" fill="#333">風險程度</text>

<rect x="0"   y="420" width="14" height="12" fill="#4CAF6E"/>
<text font-family="sans-serif" font-size="10" x="18" y="431" fill="#444">低風險</text>

<rect x="66"  y="420" width="14" height="12" fill="#F5C842"/>
<text font-family="sans-serif" font-size="10" x="84" y="431" fill="#444">中度風險</text>

<rect x="146" y="420" width="14" height="12" fill="#E07A30"/>
<text font-family="sans-serif" font-size="10" x="164" y="431" fill="#444">高風險</text>

<rect x="206" y="420" width="14" height="12" fill="#C8311E"/>
<text font-family="sans-serif" font-size="10" x="224" y="431" fill="#444">極高風險</text>

<rect x="286" y="420" width="14" height="12" fill="#8C1710"/>
<text font-family="sans-serif" font-size="10" x="304" y="431" fill="#444">最高風險</text>

<text font-family="sans-serif" font-size="11" font-weight="600" x="0" y="452" fill="#333">適應症標記</text>

<rect x="0" y="458" width="20" height="13" fill="#EAF2FC" stroke="#1255B0" stroke-width="1.5" stroke-dasharray="4 2"/>
<rect x="0" y="458" width="20" height="13" fill="url(#hatch-blue)"/>
<text font-family="sans-serif" font-size="10" x="26" y="469" fill="#444">健保 CKD 給付（eGFR 25–60，uACR 200–5000 mg/g）— Forxiga + Jardiance</text>

<rect x="0" y="478" width="20" height="13" fill="#E1F5EE" stroke="#0B6644" stroke-width="1.5" stroke-dasharray="3 2"/>
<rect x="0" y="478" width="20" height="13" fill="url(#hatch-green)"/>
<text font-family="sans-serif" font-size="10" x="26" y="489" fill="#444">EMPA-KIDNEY 試驗延伸族群（eGFR 20–45，uACR &lt; 200 mg/g 亦納入）</text>

</svg>

> **心血管事件**定義包含：因冠狀動脈疾病、心臟衰竭、腦中風或周邊動脈疾病住院。

> **健保 CKD 給付附加條件**：需參加 Early-CKD 或 Pre-ESRD 照護計畫，並已穩定使用最大耐受劑量 ACEi/ARB ≥ 4 週。eGFR < 15 應停藥。

### Forxiga 與 Jardiance 各適應症腎功能使用範圍

| 適應症                 | Forxiga（Dapagliflozin）                   | Jardiance（Empagliflozin）                     |
| ---------------------- | ------------------------------------------ | ---------------------------------------------- |
| **T2DM 血糖控制**      | eGFR ≥ 45 可起始                           | eGFR ≥ 30 可使用 10 mg；eGFR ≥ 30 可增至 25 mg |
| **心臟衰竭（HF）**     | eGFR ≥ 25 可起始；治療後降至 < 25 仍可續用 | **無 eGFR 下限**（透析不建議起始）             |
| **慢性腎臟病（健保）** | eGFR 25–60 可起始；eGFR < 15 停藥          | eGFR 25–60 可起始；eGFR < 15 停藥              |
| **試驗實證下限**       | DAPA-CKD：eGFR ≥ 25                        | EMPA-KIDNEY：eGFR ≥ 20                         |

**臨床重點差異：**

> 心臟衰竭方面，Jardiance 無 eGFR 起始門檻，即使 eGFR < 25 仍可開立，心臟保護效益不受腎功能限制；Forxiga 則需 eGFR ≥ 25 才可起始，但起始後若 eGFR 下滑至 25 以下仍可續用。

> CKD 方面，兩藥健保給付條件相同（eGFR 25–60），但試驗實證基礎略有不同：EMPA-KIDNEY 納入 eGFR 低至 20 的族群，顯示 Jardiance 在更嚴重 CKD 的潛在效益，而健保給付尚未反映此延伸範圍。

## 臺灣健保給付規定（2025.03.01 更新） Taiwan NHI Reimbursement Criteria

### 1. 第二型糖尿病（全部 SGLT2i 通用）

優先使用 metformin，控制不佳方可考慮 SGLT2i。限用於已接受最大耐受劑量 metformin 仍血糖控制不佳之 T2DM 病人。SGLT2i 與 DPP-4i 宜二擇一使用。每日最多處方 1 粒。

### 2. 心臟衰竭（限 Dapagliflozin / Empagliflozin 10 mg）

**HFrEF（LVEF ≤ 40%）**

NYHA Fc II–IV，LVEF ≤ 40%（一年內心臟檢查報告），經 ACEi/ARB + β-blocker 穩定治療 ≥ 4 週，每日最多 1 粒。

**HFmrEF（LVEF 41–49%）— 2025.03.01 新增**

NYHA Fc II–IV，LVEF 41–49%，經 ACEi/ARB + β-blocker 最大可耐受劑量 ≥ 4 週，曾有 HF 住院史或心臟專科診斷，每日最多 1 粒。

### 3. 慢性腎臟病（限 Dapagliflozin / Empagliflozin 10 mg）

需參加 **Early-CKD 照護整合方案** 或 **Pre-ESRD 照護計畫**，並已穩定接受最大耐受劑量 ACEi/ARB ≥ 4 週。

起始治療條件：eGFR ≥ 25 且 ≤ 60 mL/min/1.73 m²，uACR ≥ 200 且 ≤ 5000 mg/g。

排除條件：T1DM、多囊腎、SLE 腎病、ANCA 血管炎、近期化療或免疫抑制、器官移植史、近期心血管事件（12 週內 AMI/CVA/PCI/CABG）。

**eGFR < 15 應停藥。每日最多 1 粒。**

## 糖心腎保護臨床證據 Glycemic–Cardio–Renal Protection Evidence

| 試驗              | 藥物          | 族群         | 主要結果                        |
| ----------------- | ------------- | ------------ | ------------------------------- |
| EMPA-REG OUTCOME  | Empagliflozin | T2DM + CVD   | CV 死亡 ↓ 38%，腎病惡化 ↓ 39%   |
| CANVAS / CREDENCE | Canagliflozin | T2DM + CKD   | 腎臟複合終點 ↓ 34%，CV 事件 ↓   |
| DAPA-HF           | Dapagliflozin | HFrEF（±DM） | HF 住院 ↓ 30%，CV 死亡 ↓ 18%    |
| DAPA-CKD          | Dapagliflozin | CKD（±DM）   | 腎功能惡化 ↓ 44%，HF 住院 ↓ 29% |
| EMPEROR-Reduced   | Empagliflozin | HFrEF（±DM） | CV 死亡 + HF 住院 ↓ 25%         |
| EMPEROR-Preserved | Empagliflozin | HFpEF（±DM） | CV 死亡 + HF 住院 ↓ 21%         |
| EMPA-KIDNEY       | Empagliflozin | CKD（±DM）   | 腎病進展 ↓ 28%，提早結束        |
| DELIVER           | Dapagliflozin | HFmrEF/HFpEF | HF 住院 ↓ 21%，CV 死亡 ↓ 12%    |

## 各藥品臨床試驗解讀 Interpretation of Key Trials

### Empagliflozin

| 試驗                          | 對象                     | N     | 主要終點              | 關鍵結果                                       |
| ----------------------------- | ------------------------ | ----- | --------------------- | ---------------------------------------------- |
| **EMPA-REG OUTCOME**（2015）  | T2DM + CVD               | 7,020 | 3-P MACE              | ↓ 14%（HR 0.86）；CV 死亡 ↓ 38%；HF 住院 ↓ 35% |
| **EMPEROR-Reduced**（2020）   | HFrEF（LVEF ≤ 40%），±DM | 3,730 | CV 死亡 + HF 住院     | ↓ 25%（HR 0.75）；HF 住院 ↓ 31%                |
| **EMPEROR-Preserved**（2021） | HFpEF（LVEF > 40%），±DM | 5,988 | CV 死亡 + HF 住院     | ↓ 21%（HR 0.79）；HF 住院 ↓ 29%                |
| **EMPA-KIDNEY**（2023）       | CKD（eGFR 20–45），±DM   | 6,609 | ESKD + eGFR↓ + 腎死亡 | ↓ 28%（HR 0.72）；全因住院 ↓ 14%               |

> EMPA-REG 是唯一顯示 CV 死亡率獨立顯著降低的 SGLT2i 試驗。EMPEROR-Preserved 為首個證實 HFpEF 獲益的 HF 試驗之一。EMPA-KIDNEY 放寬至 eGFR ≥ 20，納入最廣泛 CKD 族群。

#### EMPA-REG OUTCOME（2015，NEJM）

納入 7,020 名 T2DM + 已有 CVD 病人，Empagliflozin 10 mg / 25 mg vs 安慰劑。主要結果：3-P MACE ↓ 14%（HR 0.86），CV 死亡 ↓ 38%（HR 0.62），全因死亡 ↓ 32%。腎臟次要終點：腎病惡化 ↓ 39%，顯著蛋白尿發生 ↓ 38%。心衰竭住院 ↓ 35% — 此為意料外的強烈訊號，開啟 HF 適應症之路。

#### EMPEROR-Reduced（2020，NEJM）

納入 3,730 名 HFrEF（LVEF ≤ 40%）病人，無論有無糖尿病。Empagliflozin 10 mg vs 安慰劑。主要複合終點（CV 死亡 + HF 住院）↓ 25%（HR 0.75）。HF 住院 ↓ 31%，eGFR 下降斜率減緩。首次證明 SGLT2i 在非糖尿病 HF 病人的效益。

#### EMPEROR-Preserved（2021，NEJM）

納入 5,988 名 HFpEF（LVEF > 40%）病人。Empagliflozin 10 mg vs 安慰劑。主要複合終點 ↓ 21%（HR 0.79）。HF 住院 ↓ 29%，但 CV 死亡未達統計顯著。首個對 HFpEF 族群有明確療效的 HF 藥物之一。

#### EMPA-KIDNEY（2023，NEJM）

納入 6,609 名 CKD（eGFR 20–45，或 eGFR 45–90 且 uACR ≥ 200）病人，無論有無糖尿病。Empagliflozin 10 mg vs 安慰劑，因顯著效益提前結束。主要複合終點（ESKD + eGFR 持續下降 + 腎因死亡）↓ 28%（HR 0.72）。全因住院 ↓ 14%，HF 住院 ↓ 27%。安全性與安慰劑相當。

### Dapagliflozin

| 試驗                 | 對象                                  | N     | 主要終點                          | 關鍵結果                                       |
| -------------------- | ------------------------------------- | ----- | --------------------------------- | ---------------------------------------------- |
| **DAPA-HF**（2019）  | HFrEF（LVEF ≤ 40%），±DM              | 4,744 | CV 死亡 + HF 住院 + 緊急就醫      | ↓ 26%（HR 0.74）；HF 住院 ↓ 30%；CV 死亡 ↓ 18% |
| **DAPA-CKD**（2020） | CKD（eGFR 25–75，uACR 200–5000），±DM | 4,304 | eGFR↓ ≥ 50% + ESKD + 腎因/CV 死亡 | ↓ 39%（HR 0.61）；全因死亡 ↓ 31%；提前結束     |
| **DELIVER**（2022）  | HFmrEF/HFpEF（LVEF > 40%），±DM       | 6,263 | CV 死亡 + HF 住院 + 緊急就醫      | ↓ 18%（HR 0.82）；HF 住院 ↓ 21%                |

> DAPA-CKD 為首個在非糖尿病 CKD 病人顯示腎臟保護的 SGLT2i 試驗，直接促使 TFDA 核准 CKD 適應症。DELIVER 與 EMPEROR-Preserved 結果一致，鞏固全 LVEF 範圍 HF 治療角色。

#### DAPA-HF（2019，NEJM）

納入 4,744 名 HFrEF（LVEF ≤ 40%）病人，46% 無糖尿病 — 首個 SGLT2i HFrEF 試驗納入非糖尿病病人。Dapagliflozin 10 mg vs 安慰劑。主要複合終點（CV 死亡 + HF 住院 + 緊急 HF 就醫）↓ 26%（HR 0.74）。HF 住院 ↓ 30%，CV 死亡 ↓ 18%（nominal），全因死亡 ↓ 17%。安全性：低血糖、低血壓與安慰劑無差異，生殖器感染增加。

#### DAPA-CKD（2020，NEJM）

納入 4,304 名 CKD（eGFR 25–75，uACR 200–5000）病人，68% 有糖尿病，32% 無糖尿病。Dapagliflozin 10 mg vs 安慰劑，皆在 ACEi/ARB 背景治療上。主要複合終點（eGFR 持續下降 ≥ 50% + ESKD + 腎因/CV 死亡）↓ 39%（HR 0.61）。全因死亡 ↓ 31%（HR 0.69）— 在腎臟試驗中罕見的全因死亡率降低。因顯著效益提前結束。

#### DELIVER（2022，NEJM）

納入 6,263 名 HFmrEF/HFpEF（LVEF > 40%）病人。Dapagliflozin 10 mg vs 安慰劑。主要複合終點（CV 死亡 + HF 住院 + 緊急 HF 就醫）↓ 18%（HR 0.82）。HF 住院 ↓ 21%，CV 死亡 ↓ 12%（未達統計顯著）。預先指定統合分析（DELIVER + DAPA-HF）：HF 住院 ↓ 29%，全 LVEF 範圍一致效益。

### Canagliflozin

| 試驗                       | 對象                                    | N      | 主要終點                      | 關鍵結果                                              |
| -------------------------- | --------------------------------------- | ------ | ----------------------------- | ----------------------------------------------------- |
| **CANVAS Program**（2017） | T2DM + 高 CVD 風險                      | 10,142 | 3-P MACE                      | ↓ 14%（HR 0.86）；HF 住院 ↓ 33%；白蛋白尿 ↓ 27%       |
| **CREDENCE**（2019）       | T2DM + CKD（eGFR 30–90，uACR 300–5000） | 4,401  | ESKD + Cr 倍增 + 腎因/CV 死亡 | ↓ 30%（HR 0.70）；ESKD ↓ 32%；HF 住院 ↓ 39%；提前結束 |

> CREDENCE 為 SGLT2i 首個陽性腎臟硬終點試驗。注意 CANVAS 中截肢風險升高（每 1000 人-年 5.9 vs 2.6）— FDA 黑框警告。

### Ertugliflozin

| 試驗                  | 對象       | N     | 主要終點 | 關鍵結果                                                    |
| --------------------- | ---------- | ----- | -------- | ----------------------------------------------------------- |
| **VERTIS CV**（2020） | T2DM + CVD | 8,238 | 3-P MACE | HR 0.97（非劣性達成，未達優越性）；HF 住院 ↓ 30%（HR 0.70） |

> VERTIS 確認 CV 安全性，HF 住院獲益與 class 一致，但 CV 死亡與腎臟獲益不明確。

### 各藥品臨床定位比較 Clinical Positioning Comparison

| 面向            | Empagliflozin       | Dapagliflozin | Canagliflozin       | Ertugliflozin |
| --------------- | :------------------ | :------------ | :------------------ | :------------ |
| CV 死亡率降低   | ✅ 最強              | ✅             | ✅                   | ❌             |
| HF 住院降低     | ✅ 30–35%            | ✅ 30%         | ✅ 33–39%            | ✅ 30%         |
| HFpEF 證據      | ✅ EMPEROR-Preserved | ✅ DELIVER     | ❌                   | ❌             |
| CKD 證據（±DM） | ✅ EMPA-KIDNEY       | ✅ DAPA-CKD    | ✅ CREDENCE（僅 DM） | ❌             |
| 截肢風險警示    | ❌                   | ❌             | ⚠️ 有                | ❌             |
| 健保給付 HF/CKD | ✅ 2025.03           | ✅ 2025.03     | ❌                   | ❌             |

> **共同特徵**：心衰竭住院在所有試驗一致下降約 30%，為 SGLT2i 最一致的 class effect。

## 副作用與注意事項 Adverse Effects & Precautions

| 副作用                     | 發生率 | 說明                          |
| -------------------------- | ------ | ----------------------------- |
| 泌尿道感染                 | ↑      | 排糖增加 UTI 風險，建議多喝水 |
| 生殖器黴菌感染             | ↑↑     | 女性陰道炎、男性龜頭包皮炎    |
| 低血壓 / 脫水              | ↑      | 老年人、利尿劑併用者風險高    |
| 酮酸中毒（euglycemic DKA） | 罕見   | 血糖可正常，術前應停藥 3 天   |
| 急性腎損傷                 | 罕見   | 脫水病人風險增加              |
| Fournier 壞死性筋膜炎      | 極罕見 | 生殖器區域感染，需緊急處理    |

## 禁忌症 Contraindications

第一型糖尿病（T1DM），eGFR 過低（依各藥品規範），透析病人（禁止起始），重度肝功能不全，懷孕及哺乳。

## 複方製劑（僅糖尿病適應症） Combination Products (Diabetes Only)

| 複方組合                    | 商品名        | 中文名 |
| --------------------------- | ------------- | ------ |
| Dapagliflozin / Metformin   | Xigduo XR     | 釋多糖 |
| Empagliflozin / Metformin   | Jardiance Duo | 恩美糖 |
| Dapagliflozin / Saxagliptin | Qtern         | 控糖穩 |
| Empagliflozin / Linagliptin | Glyxambi      | 糖順平 |
| Ertugliflozin / Sitagliptin | Steglujan     | 釋糖健 |

> 以上複方目前健保僅給付於第二型糖尿病。

## 參考資料 References

1. 衛生福利部中央健康保險署. 健保給付規定 2.16 SGLT-2 抑制劑（114/3/1）
2. 小涵藥師研究室. 2025/2 起 SGLT2 抑制劑增加心衰竭與慢性腎臟病健保給付
3. TFDA 臺灣藥品仿單查詢平台
4. 各藥品仿單（Forxiga, Jardiance, Canaglu, Steglatro）
5. KDIGO 2024 CKD Guideline
6. 2022 AHA/ACC/HFSA Heart Failure Guideline
7. EMPA-REG OUTCOME, CANVAS, CREDENCE, DAPA-HF, DAPA-CKD, EMPEROR-Reduced, EMPEROR-Preserved, DELIVER, EMPA-KIDNEY 臨床試驗
8. Mogensen CE. Microalbuminuria predicts clinical proteinuria and early mortality in maturity-onset diabetes. *N Engl J Med*. 1984;310(6):356-360.