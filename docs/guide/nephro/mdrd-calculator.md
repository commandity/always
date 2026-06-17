---
layout: doc
title: MDRD 腎絲球過濾率估算
---

# MDRD 腎絲球過濾率估算

**MDRD Estimated Glomerular Filtration Rate**

## 概述

**MDRD**（Modification of Diet in Renal Disease）是最廣泛使用的腎絲球過濾率（eGFR）估算公式系列，源自 1999 年 Levey 等人發表的研究。本工具整合兩個版本：**Greene 4 變項簡化公式**（門診快速評估）和 **Levey 7 變項原始公式**（低 GFR 患者更精確評估），可用 Tab 切換選擇。

---

<MdrdCalculator />

## 兩個公式版本

### Greene 簡化公式（4 變項）

```
eGFR = 186 × Cr^-1.154 × Age^-0.203 × [0.742 女性] × [1.212 非裔]
```

**特點：** 僅需肌酸酐、年齡、性別、種族，無需 BUN 或白蛋白。適合門診快速評估，對 GFR > 60 時傾向低估。

### Levey 原始公式（7 變項）

```
eGFR = 170 × Cr^-0.999 × Age^-0.176 × BUN^-0.170 × Alb^+0.318 × [0.762 女性] × [1.180 非裔]
```

**特點：** 加入白蛋白和 BUN，在 GFR < 60 族群準確度更高，適合低白蛋白血症或需要更精確評估的患者。

### 兩版本比較

| 特性            | Greene（4-var） | Levey（7-var） |
| --------------- | --------------- | -------------- |
| 變項數          | 4               | 7              |
| 需要 BUN        | ❌              | ✓              |
| 需要 Albumin    | ❌              | ✓              |
| 門診適用性      | ✓ 優            | 中             |
| GFR > 60 準確度 | 中（偏低估）    | 中             |
| GFR < 60 準確度 | 中              | 較好           |
| 低白蛋白患者    | 可能高估        | 更準確         |

## 變項的生物學意義

**肌酸酐（Creatinine）的負指數（−0.999 / −1.154）：**
血清肌酸酐與 GFR 呈反比關係。GFR 每下降 50%，肌酸酐約上升一倍。

**年齡的負指數（−0.176 / −0.203）：**
即使肌酸酐相同，年長者的 GFR 通常較低，因為腎元數隨年齡減少（每 10 年約喪失 10 mL/min/1.73m²）。

**白蛋白的正指數（+0.318）：**
低白蛋白血症患者（肝硬化、腎病症候群）若僅用 4 變項公式，可能**低估** GFR。

**BUN 的負指數（−0.170）：**
BUN 升高代表含氮廢物排泄受損，是腎功能下降的標誌。

## CKD 分期（KDIGO 2012）

| 分期    | eGFR（mL/min/1.73m²） | 描述           | 追蹤頻率    | 主要處置           |
| ------- | --------------------- | -------------- | ----------- | ------------------ |
| **G1**  | ≥ 90                  | 正常或偏高     | 每年        | 控制危險因子       |
| **G2**  | 60–89                 | 輕度下降       | 每年        | 監測進展           |
| **G3a** | 45–59                 | 輕中度下降     | 每 6 個月   | 腎臟科轉介         |
| **G3b** | 30–44                 | 中重度下降     | 每 3–6 個月 | 準備腎替代療法諮詢 |
| **G4**  | 15–29                 | 重度下降       | 每 3 個月   | 積極腎替代療法準備 |
| **G5**  | < 15                  | 腎衰竭（ESKD） | 密切追蹤    | 透析或腎移植       |

**雙重判斷原則（KDIGO）：** CKD 定義需腎功能異常或腎臟損傷標誌持續 **≥ 3 個月**。

## GFR 估算公式演進

| 公式                 | 年代     | 特點                   | 建議使用         |
| -------------------- | -------- | ---------------------- | ---------------- |
| Cockcroft-Gault      | 1976     | 估算 CrCl，需體重      | 藥物劑量調整     |
| MDRD Greene（4-var） | 1999     | 快速估算，無需 BUN/Alb | 一般篩查         |
| MDRD Levey（7-var）  | 1999     | 更精確，低 GFR         | 低 GFR 族群      |
| CKD-EPI 2009         | 2009     | 高 GFR 準確度更佳      | 多數臨床情境     |
| **CKD-EPI 2021**     | **2021** | **去除種族係數**       | **目前建議首選** |
| BIS（柏林公式）      | 2012     | 專為 70 歲以上設計     | 老年族群         |

## 臨床應用

### 藥物劑量調整

| eGFR  | 藥物調整原則                             |
| ----- | ---------------------------------------- |
| > 60  | 一般正常劑量                             |
| 30–60 | 部分藥物需減量（NSAID 謹慎）             |
| 15–30 | 多數腎排泄藥物需顯著調整                 |
| < 15  | 嚴格避免腎毒性藥物，透析患者劑量特別調整 |

### 何時選擇哪個公式？

```
患者需要快速 eGFR 評估，無 BUN/Albumin？
    → Greene 4-var MDRD

患者有低白蛋白血症（< 3.5 g/dL）或 GFR < 60？
    → Levey 7-var MDRD（更準確）

患者 GFR > 60，需要更精確評估？
    → CKD-EPI 2021（推薦）

患者 70 歲以上，需要精確評估？
    → Berlin Initiative Study（BIS）公式
```

::: warning MDRD 公式在 GFR > 60 時系統性低估
MDRD 兩版本均在 eGFR > 60 mL/min/1.73m² 的族群中傾向低估真實 GFR，可能將部分腎功能正常或輕度下降的患者錯誤歸類為 G2 或 G3a。此範圍建議改用 CKD-EPI 2021 公式以提高準確度。
:::

::: warning 非裔係數具有科學爭議，建議謹慎使用
MDRD 的非裔係數（Greene × 1.212；Levey × 1.180）源自 1990 年代有限的研究樣本，其科學有效性及系統性種族偏差問題已受廣泛批評。2021 年 CKD-EPI 新公式已刪除種族係數，建議新評估採用 CKD-EPI 2021。
:::

::: warning 急性腎損傷期間不適用任何 eGFR 估算公式
所有 eGFR 公式（包括 MDRD）均假設腎功能處於**穩定狀態**，血清肌酸酐反映真實的腎功能。急性腎損傷（AKI）期間肌酸酐持續上升，尚未達到穩態，此時估算的 eGFR 嚴重低估真實 GFR，不可用於 AKI 的腎功能評估或分期。
:::

::: info 免責聲明
本計算工具僅供臨床 eGFR 參考，不能取代完整的腎功能評估。eGFR 公式均為估算值，存在個體差異（特別是極端體型、素食者、截肢者、孕婦）。最終臨床決策應由醫師根據患者完整狀況綜合判斷。
:::

## 參考文獻

1. Levey AS, et al. **A more accurate method to estimate glomerular filtration rate from serum creatinine.** _Ann Intern Med._ 1999;130(6):461–470.
2. Stevens LA, et al. **Assessing kidney function — measured and estimated glomerular filtration rate.** _N Engl J Med._ 2006;354(23):2473–2483.
3. Inker LA, et al. **New Creatinine- and Cystatin C–Based Equations to Estimate GFR without Race (CKD-EPI 2021).** _N Engl J Med._ 2021;385(19):1737–1749.
4. KDIGO 2012. **Clinical Practice Guideline for the Evaluation and Management of Chronic Kidney Disease.** _Kidney Int Suppl._ 2013;3(1):1–150.
