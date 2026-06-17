---
layout: doc
title: CDAI 臨床疾病活動指數
---

# CDAI 臨床疾病活動指數

**CDAI Clinical Disease Activity Index**

## 概述

**CDAI**（Clinical Disease Activity Index）由 Aletaha 與 Smolen 於 2005 年提出，是類風濕性關節炎（RA）疾病活動度評估工具中**唯一完全不需要實驗室數據**的評分系統。CDAI 由四個純臨床參數組成，總分 0–76 分，可在門診即時完成計算，是繁忙臨床環境下 DAS28 的理想替代工具。

---

<CdaiCalculator />

## 計算公式

```
CDAI = TJC28 + SJC28 + PGA + EGA
```

| 變數      | 全名                        | 說明                          | 範圍    |
| --------- | --------------------------- | ----------------------------- | ------- |
| **TJC28** | Tender Joint Count          | 28 個關節中的觸痛關節數       | 0–28    |
| **SJC28** | Swollen Joint Count         | 28 個關節中的腫脹關節數       | 0–28    |
| **PGA**   | Patient Global Assessment   | 患者自評整體疾病活動度（VAS） | 0–10 cm |
| **EGA**   | Evaluator Global Assessment | 醫師評估整體疾病活動度（VAS） | 0–10 cm |

> **CDAI 最大值 = 28 + 28 + 10 + 10 = 76 分**

## 疾病活動度分類

| CDAI 分數    | 疾病活動度                            | 臨床意義                     |
| ------------ | ------------------------------------- | ---------------------------- |
| **≤ 2.8**    | 緩解（Remission）                     | 治療目標達成，維持現有方案   |
| **> 2.8–10** | 低度活動（Low Disease Activity）      | 接近緩解，維持並密切追蹤     |
| **> 10–22**  | 中度活動（Moderate Disease Activity） | 需考慮強化治療方案           |
| **> 22**     | 高度活動（High Disease Activity）     | 需積極調整治療，評估生物製劑 |

## CDAI、SDAI 與 DAS28 比較

| 比較項目         | CDAI        | SDAI        | DAS28-ESR   | DAS28-CRP   |
| ---------------- | ----------- | ----------- | ----------- | ----------- |
| **需要實驗室**   | ❌ 不需要   | ✓ CRP       | ✓ ESR       | ✓ CRP       |
| **計算複雜度**   | 簡單加法    | 簡單加法    | 需要對數    | 需要對數    |
| **門診即時性**   | ✓ 即時      | 需等 CRP    | 需等 ESR    | 需等 CRP    |
| **評估者**       | 醫師 + 患者 | 醫師 + 患者 | 醫師 + 患者 | 醫師 + 患者 |
| **緩解切截值**   | ≤ 2.8       | ≤ 3.3       | < 2.6       | < 2.6       |
| **高活動度**     | > 22        | > 26        | > 5.1       | > 5.1       |
| **EULAR 認可**   | ✓           | ✓           | ✓           | ✓           |
| **臨床試驗使用** | 廣泛        | 廣泛        | 最廣泛      | 廣泛        |

### CDAI vs SDAI

SDAI（Simplified Disease Activity Index）與 CDAI 幾乎相同，差別只在多加一個 **CRP（mg/dL）**：

```
SDAI = TJC28 + SJC28 + PGA + EGA + CRP (mg/dL)
```

SDAI 緩解切截值為 ≤ 3.3，略嚴於 CDAI（≤ 2.8），因為加入了 CRP。當 CRP 正常（< 5 mg/L = < 0.5 mg/dL）時，SDAI 與 CDAI 的差距極小（< 0.5 分），兩者臨床判斷幾乎等同。

## CDAI 的核心優勢：無需實驗室數據

傳統的 DAS28-ESR 或 DAS28-CRP 需要等待血液報告才能完成計算，在以下情況下尤其不便：

- 患者**當日未抽血**或抽血結果未回
- **緊急**評估是否需要調整治療
- **資源有限**的基層醫療環境
- **反覆追蹤**無需每次送檢
- 臨床研究需要**即時疾病活動度**記錄

CDAI 完全依賴醫師及患者的臨床評估，**在診間當場計算**，不影響治療決策的即時性。

## 四個評估項目的操作細節

### TJC28 — 觸痛關節數

以拇指和食指輕壓各關節，施予等同於使皮膚變白的壓力：

- **計 1**：患者表示疼痛或有防禦性退縮
- **計 0**：無疼痛反應
- 評估 28 個關節：雙側肩 × 2、肘 × 2、腕 × 2、MCP × 10、PIP × 8、膝 × 2 — 每個關節最多計 1 分（不加權）

### SJC28 — 腫脹關節數

視診及觸診評估關節是否有滑液增多：

- **計 1**：可觸及明顯的關節腔積液或軟性腫脹（非骨性腫大）
- **計 0**：無滑液腫脹
- 赫貝登結節（Heberden's nodes）或骨性腫大**不計**

### PGA — 患者整體評估（VAS 0–10 cm）

使用視覺類比量表（VAS），患者自行標記：

- **詢問方式**：「過去一週，您的關節炎整體活動程度如何？」
- 0 分：完全無活動（無症狀）
- 10 分：關節炎極度活躍（難以忍受）

### EGA — 醫師整體評估（VAS 0–10 cm）

醫師根據本次診療的完整臨床印象評估：

- **評估依據**：關節腫脹、觸痛、活動度、功能狀態、患者外觀等整體臨床判斷
- 0 分：緩解（無疾病活動跡象）
- 10 分：極重度活動（嚴重多關節炎症）

> **PGA vs EGA 的差距**：研究顯示患者通常比醫師給出更高的整體評分，這種「患者-醫師不一致（patient-physician discordance）」本身具有臨床意義，分數差異 > 3 分時應進一步探討原因（如疼痛覆蓋感、憂鬱、纖維肌痛合併症等）。

## CDAI 與 DAS28 的近似換算

以下換算公式僅供參考，**不可取代直接計算**，追蹤時應固定使用同一工具：

**DAS28 ≈ 0.0554 × CDAI + 2.213**

| CDAI  | 近似 DAS28 | 活動度       |
| ----- | ---------- | ------------ |
| ≤ 2.8 | ≈ 2.4      | 緩解         |
| 5     | ≈ 2.5      | 低活動度邊界 |
| 10    | ≈ 2.8      | 低活動度上限 |
| 22    | ≈ 3.4      | 中活動度上限 |
| 40    | ≈ 4.4      | 高活動度     |
| 76    | ≈ 6.4      | 極高活動度   |

## 治療目標策略（Treat-to-Target）

CDAI 是 2022 EULAR RA 指引中明確認可的疾病活動度評估工具，適用於 Treat-to-Target（T2T）策略：

| CDAI 分數      | 建議策略                              |
| -------------- | ------------------------------------- |
| ≤ 2.8（緩解）  | 維持現有 DMARD，每 6 個月追蹤         |
| > 2.8–10（低） | 維持治療，每 3 個月評估，目標達到緩解 |
| > 10–22（中）  | 強化 csDMARD 或考慮生物製劑           |
| > 22（高）     | 積極使用生物製劑或 JAK 抑制劑         |

## 注意事項

::: warning CDAI 不能完全取代含發炎指標的評分工具
CDAI 無法偵測到**亞臨床（subclinical）發炎**——即關節影像學仍有進行性骨侵蝕但臨床症狀已緩解的情況。研究顯示部分 CDAI 緩解（≤ 2.8）的患者，超音波或 MRI 仍可見滑膜炎。若患者達到臨床緩解但 ESR/CRP 仍升高，建議補充 DAS28-ESR/CRP 或影像學評估。
:::

::: warning 纖維肌痛症合併症可能高估 CDAI
合併纖維肌痛症（fibromyalgia）的 RA 患者，TJC 和 PGA 可能因廣泛疼痛敏感而偏高，導致 CDAI 高估疾病活動度。此類患者應結合客觀發炎指標（ESR/CRP）及影像學來綜合判斷。
:::

::: warning 追蹤時應固定評估工具
CDAI、SDAI、DAS28-ESR 及 DAS28-CRP 的切截值和分數範圍不同，在同一患者的縱向追蹤中應**固定使用同一工具**，切勿混用不同版本，否則會造成疾病活動度判斷的混淆。
:::

::: info 免責聲明
本計算器僅供臨床評估參考，不能取代完整的臨床評估及必要的實驗室和影像學檢查。RA 的治療決策應由風濕科醫師根據患者完整的臨床狀況及個別因素綜合判斷。
:::

## 參考文獻

1. Aletaha D, Smolen J. **The Simplified Disease Activity Index (SDAI) and the Clinical Disease Activity Index (CDAI): a review of their usefulness and validity in rheumatoid arthritis.** _Clin Exp Rheumatol._ 2005;23(5 Suppl 39):S100–S108.
2. Aletaha D, Ward MM, Machold KP, Nell VPK, Stamm T, Smolen JS. **Remission and active disease in rheumatoid arthritis: defining criteria for disease activity states.** _Arthritis Rheum._ 2005;52(9):2625–2636.
3. Smolen JS, Landewé RBM, Bijlsma JWJ, et al. **EULAR recommendations for the management of rheumatoid arthritis with synthetic and biological disease-modifying antirheumatic drugs: 2022 update.** _Ann Rheum Dis._ 2023;82(1):3–18.
4. Felson DT, Smolen JS, Wells G, et al. **American College of Rheumatology/European League Against Rheumatism provisional definition of remission in rheumatoid arthritis for clinical trials.** _Arthritis Rheum._ 2011;63(3):573–586.
5. Studenic P, Smolen JS, Aletaha D. **Near misses of ACR/EULAR criteria for remission: effects of patient global assessment in Boolean and index-based definitions.** _Ann Rheum Dis._ 2012;71(10):1702–1705.
