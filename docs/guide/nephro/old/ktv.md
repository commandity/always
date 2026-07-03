---
layout: doc
title: Kt/V 透析充分度
---

# Kt/V 透析充分度（Daugirdas II）

**Kt/V Dialysis Adequacy (Daugirdas II)**

## 概述

**Kt/V** 是血液透析充分度的國際標準指標，由 KDOQI 推薦使用 Daugirdas 第二代對數公式計算。Kt/V 整合透析劑量（K × t）與分佈容積（V），提供比 URR 更準確的透析效率評估。

---

<KtvCalculator />

## 計算公式（Daugirdas II）

```
Kt/V = −ln( R − 0.008 × t ) + ( 4 − 3.5 × R ) × UF / W
```

| 變項 | 說明                            | 單位   |
| ---- | ------------------------------- | ------ |
| R    | Post-BUN / Pre-BUN（尿素比值）  | 無單位 |
| t    | 透析時間                        | 小時   |
| UF   | 超濾量（Ultrafiltrate removed） | 公升   |
| W    | 透析後體重                      | 公斤   |

**公式解讀：**

- `−ln(R − 0.008t)`：前段修正殘餘尿素清除（末段效應）
- `(4 − 3.5R) × UF/W`：超濾對尿素濃縮效應的修正

## KDOQI 充分度標準

| Kt/V      | 評估               | 建議     |
| --------- | ------------------ | -------- |
| ≥ 1.4     | 優良               | 維持處方 |
| **≥ 1.2** | **KDOQI 最低目標** | 達標     |
| 1.0–1.2   | 邊緣不足           | 優化處方 |
| < 1.0     | 嚴重不足           | 立即評估 |

## Kt/V 各字母的意義

- **K**（Clearance）：透析器對尿素的清除率（mL/min）
- **t**（Time）：透析時間（min 或 hr）
- **V**（Volume）：尿素分佈容積 ≈ 總體水量 TBW（L）

**Kt** = 透析劑量（Dialysis Dose）= 清除體積
**Kt/V** = 相對於分佈容積的清除比例

## 提升 Kt/V 的策略

| 方法                 | 機制       | 效果                                |
| -------------------- | ---------- | ----------------------------------- |
| **延長透析時間**     | 增加 t     | 最有效，每延 30 分 ≈ +0.10–0.15     |
| 增加血流量（Qb）     | 增加 K     | 受通路限制，> 400 mL/min 邊際效益低 |
| 增加透析液流量（Qd） | 增加 K     | > 500 mL/min 效益有限               |
| 高通量透析膜         | 增加 K     | 小分子效果有限，中分子改善          |
| 改善通路再循環       | 恢復有效 K | 再循環 > 10% 顯著影響 Kt/V          |

## spKt/V 與 eKt/V

**spKt/V（single-pool）：** Daugirdas 公式計算的是單池模型，透析後尿素會從組織「回跳」（rebound）。

**eKt/V（equilibrated，平衡後）：**

```
eKt/V ≈ spKt/V − ( 0.6 × spKt/V / t ) + 0.03
```

KDOQI 建議 eKt/V ≥ 1.05（相當於 spKt/V ≥ 1.2）。

## 透析不足的後果

| Kt/V    | 相對死亡風險  |
| ------- | ------------- |
| ≥ 1.4   | 最低          |
| 1.2–1.4 | 中等（基準）  |
| 1.0–1.2 | 升高 ~20%     |
| < 1.0   | 升高 ~50–100% |

::: warning Kt/V 僅反映小分子（尿素）清除，忽略中大分子毒素
Daugirdas Kt/V 以尿素作為代表性溶質，但透析毒素包含中分子（β₂-microglobulin、PTH）和蛋白結合毒素（indoxyl sulfate）等，這些物質的清除效率與 Kt/V 無關。高通量透析膜、血液透析濾過（HDF）或延長透析時間可改善中大分子清除，應結合臨床症狀綜合評估。
:::

::: warning 透析不足時勿只調整 BUN 採血時間
Kt/V 偏低時，應從根本解決透析劑量不足問題（延長時間、增加血流量、改善通路），而非調整透析後 BUN 的採血時間點（如縮短停機後等待時間）。BUN 回跳（rebound）應反映在 eKt/V 計算中，不應人為迴避。
:::

::: warning 殘餘腎功能顯著者，Kt/V 目標可適度調整
仍有顯著殘餘腎功能（殘餘 GFR > 3 mL/min/1.73m²）的患者，殘餘腎功能對總透析充分度有貢獻，Kt/V 目標可由腎臟科醫師個別化調整，不必強求單次透析 Kt/V ≥ 1.2。但殘餘腎功能需定期重新評估（尿量、24 小時尿液肌酸酐清除率）。
:::

::: info 免責聲明
本計算器僅供透析充分度評估參考，不能取代完整的透析處方評估與定期通路監測。Kt/V 未達標時的處方調整應由腎臟科醫師根據患者個別狀況（體型、通路功能、殘餘腎功能）綜合判斷。
:::

## 參考文獻

1. Daugirdas JT. **Second generation logarithmic estimates of single-pool variable volume Kt/V.** _J Am Soc Nephrol._ 1993;4(5):1205–1213.
2. KDOQI. **Clinical Practice Guidelines for Hemodialysis Adequacy, 2006.** _Am J Kidney Dis._ 2006;48(Suppl 1):S2–S90.
3. Eknoyan G, et al. **Effect of dialysis dose and membrane flux in maintenance hemodialysis (HEMO Study).** _N Engl J Med._ 2002;347(25):2010–2019.
