---
layout: doc
title: 血液透析評估工具
---

# 血液透析評估工具

**Hemodialysis Assessment · Kt/V & URR & Access Recirculation**

<HemodialysisCalculator />

## Kt/V 透析充分度（Daugirdas II）

**Kt/V** 是血液透析充分度的國際標準指標（K＝清除率、t＝時間、V＝尿素分佈容積），KDOQI 建議以 Daugirdas 第二代對數公式計算：

```
Kt/V = −ln( R − 0.008 × t ) + ( 4 − 3.5 × R ) × UF / W
R = Post-BUN / Pre-BUN；t = 透析時數；UF = 超濾量 (L)；W = 透析後體重 (kg)
```

### Kt/V 分數解讀

| Kt/V    | 充分度             | 意義與建議處置                             |
| ------- | ------------------ | ------------------------------------------ |
| ≥ 1.4   | 優良               | 清除充分，維持現行處方                     |
| 1.2–1.4 | 達標               | 符合 KDOQI 最低目標（spKt/V ≥ 1.2）        |
| 1.0–1.2 | 邊緣不足           | 檢視血流量、透析時間、透析器面積並優化     |
| < 1.0   | 嚴重不足           | 立即重新評估處方，排除通路再循環等技術問題 |

> **KDOQI 目標：每週三次透析者 spKt/V ≥ 1.2（目標處方 1.4）**。Kt/V 不足與死亡率上升直接相關；長期未達標時應依序檢查——血流量（Qb）、實際透析時間、透析器凝血、通路再循環（見第三個分頁）。

## URR 尿素減少率

**Urea Reduction Ratio** 是最簡便的透析充分度指標，只需透析前後 BUN：

```
URR [%] = ( Pre-BUN − Post-BUN ) / Pre-BUN × 100
```

### URR 分數解讀

| URR    | 充分度   | 意義與建議處置                     |
| ------ | -------- | ---------------------------------- |
| ≥ 70%  | 優良     | 維持現行透析處方                   |
| 65–70% | 達標     | 符合 KDOQI 最低標準（≥ 65%），持續監測 |
| 55–65% | 邊緣不足 | 延長透析時間或增加血流量           |
| < 55%  | 嚴重不足 | 立即重新評估透析處方與通路功能     |

> **URR ≥ 65% 約等同 spKt/V ≥ 1.2**。URR 未計入超濾的濃縮效應與尿素反彈，會低估實際清除量，適合當快速篩檢；正式充分度評估仍以 Kt/V 為準。

## Access Recirculation 血管通路再循環率

**通路再循環**指已透析的靜脈端血液未回體循環即被動脈端重新抽入，直接稀釋透析效率：

```
Recirculation [%] = ( Systemic BUN − Inlet BUN ) / ( Systemic BUN − Outlet BUN ) × 100
```

### 再循環率解讀

| 再循環率 | 意義     | 建議行動                                   |
| -------- | -------- | ------------------------------------------ |
| < 5%     | 正常     | 定期追蹤                                   |
| 5–10%    | 輕度     | 密切監測，檢視穿刺針位置與方向             |
| 10–20%   | 有臨床意義 | 通路超音波評估，排除靜脈端狹窄           |
| ≥ 20%    | 嚴重     | 立即安排影像學／血管攝影，考慮介入治療     |

> **再循環率 ≥ 10% 即有臨床意義**，是 Kt/V 與 URR 持續未達標時必查的原因之一。最常見機轉為**靜脈端流出道狹窄**（回流受阻迫使血液逆流回動脈針），其次為穿刺針距離過近或反接。早期發現狹窄並以氣球擴張處理，可避免通路血栓與失能。

## 注意事項

::: warning 採血時機影響準確度
Post-BUN 應於透析結束時以慢血流（50–100 mL/min）30 秒後採集，避免通路再循環與心肺再循環造成的偽低值；再循環檢測的周邊血樣需取自非通路側手臂。
:::

::: warning 單一指標不足以代表透析品質
Kt/V 與 URR 僅反映小分子（尿素）清除，不涵蓋中大分子毒素、體液控制、營養與電解質管理；透析處方調整需整體評估。
:::

::: info 免責聲明
本計算器僅供臨床輔助參考，透析處方與通路處置需由腎臟專科醫師決定。
:::

## 參考文獻

1. Daugirdas JT. **Second generation logarithmic estimates of single-pool variable volume Kt/V: an analysis of error.** _J Am Soc Nephrol._ 1993;4(5):1205–1213.
2. National Kidney Foundation. **KDOQI Clinical Practice Guideline for Hemodialysis Adequacy: 2015 Update.** _Am J Kidney Dis._ 2015;66(5):884–930.
3. Owen WF Jr, Lew NL, Liu Y, Lowrie EG, Lazarus JM. **The urea reduction ratio and serum albumin concentration as predictors of mortality in patients undergoing hemodialysis.** _N Engl J Med._ 1993;329(14):1001–1006.
4. Lok CE, Huber TS, Lee T, et al. **KDOQI Clinical Practice Guideline for Vascular Access: 2019 Update.** _Am J Kidney Dis._ 2020;75(4 Suppl 2):S1–S164.
