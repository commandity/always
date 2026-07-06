---
layout: doc
title: FIB-4 肝纖維化指數
---

# FIB-4 肝纖維化指數

**Fibrosis-4 Index · 非侵入性肝纖維化篩查**

<FIB4Calculator />

## FIB-4 指數

**FIB-4**（Sterling 2006）以年齡與 3 項常規檢驗估計晚期肝纖維化（F3–F4）風險，不需影像或切片，適合初級照護與慢性肝病族群的第一線分層。

> **FIB-4 =（年齡 × AST）÷（血小板 × √ALT）**

| 輸入項目 | 單位       |
| -------- | ---------- |
| 年齡     | 歲         |
| AST      | U/L        |
| ALT      | U/L        |
| 血小板   | ×10⁹/L     |

### 分數意義與處置

| FIB-4       | 風險分層 | 意義與建議處置                                 |
| ----------- | -------- | ---------------------------------------------- |
| < 1.30      | 低風險   | 晚期纖維化不太可能（NPV 90%），暫不需侵入性檢查 |
| 1.30–2.67   | 不確定   | 建議肝彈性造影（FibroScan）或進一步評估         |
| > 2.67      | 高風險   | 晚期纖維化 / 肝硬化可能（PPV 80%），轉介肝膽科  |

### 年齡校正閾值（≥ 65 歲）

| 年齡     | 低風險閾值 | 高風險閾值 |
| -------- | ---------- | ---------- |
| < 65 歲  | < 1.30     | > 2.67     |
| ≥ 65 歲  | < 2.00     | > 4.00     |

> **≥ 65 歲須採用較高閾值**：老化本身會使 FIB-4 上升，若沿用 1.30 會造成大量偽陽性。FIB-4 的最大價值在**排除**晚期纖維化——低風險者陰性預測值高、可安心追蹤；不確定區間應以肝彈性造影（VCTE）或 ELF 等第二線工具再分層，而非直接切片。酒精性肝病者 AST/ALT 常 > 2，判讀需更謹慎。

## 注意事項

::: warning 篩查非診斷
FIB-4 為分層工具，不能取代肝彈性造影或肝切片的組織學診斷；急性肝炎、溶血或血小板異常時結果可能失真。
:::

::: info 免責聲明
本工具僅供臨床輔助與教學參考，最終診斷與處置應由醫師依完整評估判定。
:::

## 參考文獻

1. Sterling RK, Lissen E, Clumeck N, et al. **Development of a simple noninvasive index to predict significant fibrosis in patients with HIV/HCV coinfection.** _Hepatology._ 2006;43(6):1317–1325.
2. McPherson S, Hardy T, Dufour JF, et al. **Age as a confounding factor for the accurate non-invasive diagnosis of advanced NAFLD fibrosis.** _Am J Gastroenterol._ 2017;112(5):740–751.
