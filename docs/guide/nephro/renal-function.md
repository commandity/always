---
layout: doc
title: 腎功能評估工具
---

# 腎功能評估工具

**Renal Function Assessment · MDRD eGFR & Bicarbonate Deficit & Delta/Delta & Fractional Excretion**

<RenalFunctionCalculator />

## MDRD 腎絲球過濾率估算

**MDRD**（Modification of Diet in Renal Disease，Levey 1999）為最廣泛使用的 eGFR 估算公式系列。本工具提供兩個版本：**Greene 4 變項簡化公式**（門診快速評估）與 **Levey 7 變項原始公式**（加入 BUN 與白蛋白，低 GFR 或低白蛋白患者更準確）。

```
Greene：eGFR = 186 × Cr^-1.154 × Age^-0.203 × [0.742 女性] × [1.212 非裔]
Levey ：eGFR = 170 × Cr^-0.999 × Age^-0.176 × BUN^-0.170 × Alb^+0.318 × [0.762 女性] × [1.180 非裔]
```

### eGFR 分數解讀（CKD 分期）

| eGFR（mL/min/1.73m²） | CKD 分期 | 意義與建議處置                                 |
| --------------------- | -------- | ---------------------------------------------- |
| ≥ 90                  | G1       | 腎功能正常；若有腎損傷證據仍屬 CKD，需追蹤     |
| 60–89                 | G2       | 輕度下降；控制血壓、血糖等危險因子             |
| 45–59                 | G3a      | 輕中度下降；建議腎臟科評估，篩檢併發症         |
| 30–44                 | G3b      | 中重度下降；積極處理貧血、礦物質骨病變         |
| 15–29                 | G4       | 重度下降；準備腎臟替代治療（透析衛教、血管通路）|
| < 15                  | G5       | 腎衰竭；評估透析或移植時機                     |

> **eGFR < 60 持續 3 個月以上**即符合 CKD 診斷。MDRD 公式在 GFR > 60 時傾向低估，數值僅供分期參考；肌肉量極端（截肢、惡病質、健美）者不準確。

## Bicarbonate Deficit 碳酸氫鈉缺乏量

用於**代謝性酸中毒**患者估算 NaHCO₃ 補充量：

```
HCO₃⁻ Deficit (mEq) = 0.5 × 體重 (kg) × ( 目標 HCO₃⁻ − 實測 HCO₃⁻ )
```

### 嚴重度與補充原則

| HCO₃⁻（mmol/L） | 嚴重度 | 估算 pH   | 意義                           |
| --------------- | ------ | --------- | ------------------------------ |
| 18–22           | 輕度   | 7.30–7.35 | 輕度過度換氣，通常治療原發病即可 |
| 10–17           | 中度   | 7.10–7.30 | Kussmaul 深大呼吸，考慮補充     |
| < 10            | 重度   | < 7.10    | 心律不整、血流動力學不穩，積極矯正 |

> **首次僅給予計算量的 50%（half correction）**，3–4 小時輸注後複查血氣再決定後續；目標 HCO₃⁻ 設在 **18–20 mmol/L** 而非正常化，避免過度矯正造成鹼中毒、低血鉀與反常性中樞酸化。

## Delta/Delta 混合酸鹼分析

用於高陰離子間隙（AG）代謝性酸中毒中，偵測**隱藏的混合酸鹼異常**：

```
AG = Na⁺ − ( Cl⁻ + HCO₃⁻ )　（正常 12）
Δ/Δ = ( AG − 12 ) / ( 24 − HCO₃⁻ )
```

### Δ/Δ 比值解讀

| Δ/Δ   | 酸鹼異常類型                | 臨床舉例                       |
| ----- | --------------------------- | ------------------------------ |
| < 0.4 | 高氯性（非 AG）代謝性酸中毒 | 腹瀉、RTA、大量生理鹽水輸注    |
| 0.4–1 | 混合：AG ＋非 AG 酸中毒     | DKA ＋腹瀉、乳酸中毒＋ RTA     |
| 1–2   | 純 AG 代謝性酸中毒          | 乳酸中毒、DKA、尿毒症          |
| > 2   | AG 酸中毒＋代謝性鹼中毒     | DKA ＋嘔吐、乳酸中毒＋利尿劑   |

> 原理：純 AG 酸中毒時，每 1 單位 AG 上升應對應約 1 單位 HCO₃⁻ 下降（Δ/Δ ≈ 1–2）。HCO₃⁻ 下降「太多」（< 0.4）代表另有非 AG 酸中毒消耗；下降「太少」（> 2）代表另有鹼中毒補回。

## Fractional Excretion 分餾排泄率

評估腎小管重吸收功能，最常用於**急性腎損傷（AKI）腎前性 vs 腎性**鑑別：

```
FE(X) [%] = ( U_X × Se-Cr ) / ( P_X × U-Cr ) × 100
```

### FENa 解讀

| FENa | 診斷       | 意義                                             |
| ---- | ---------- | ------------------------------------------------ |
| < 1% | 腎前性 AKI | 腎小管完整、積極保鈉——低血容量、心衰竭、肝腎症候群 |
| 1–2% | 不確定     | 需結合臨床與其他指標                             |
| > 2% | 腎性 AKI   | 腎小管受損無法重吸收——急性腎小管壞死（ATN）      |

> **使用利尿劑時 FENa 會偽性升高**，應改用 **FEUrea**：< 35% 提示腎前性、> 50% 提示 ATN。FENa 亦不適用於慢性腎臟病基礎上的 AKI 與造影劑腎病變（可 < 1%）。

## 注意事項

::: warning eGFR 為估算值
MDRD 假設肌酸酐處於穩定狀態，AKI 急性期、極端體型、懷孕及高肌肉量者不準確；正式分期建議搭配 CKD-EPI 或實測清除率。
:::

::: warning 酸鹼工具需搭配血液氣體分析
Bicarbonate Deficit 與 Delta/Delta 的解讀均需完整動脈血氣（pH、pCO₂）確認原發性異常與呼吸代償是否適當，不可單獨依據電解質判讀。
:::

::: info 免責聲明
本計算器僅供臨床輔助參考，不能取代完整的腎功能評估與治療決策。
:::

## 參考文獻

1. Levey AS, Bosch JP, Lewis JB, et al. **A more accurate method to estimate glomerular filtration rate from serum creatinine.** _Ann Intern Med._ 1999;130(6):461–470.
2. Sabatini S, Kurtzman NA. **Bicarbonate therapy in severe metabolic acidosis.** _J Am Soc Nephrol._ 2009;20(4):692–695.
3. Rastegar A. **Use of the ΔAG/ΔHCO₃⁻ ratio in the diagnosis of mixed acid-base disorders.** _J Am Soc Nephrol._ 2007;18(9):2429–2431.
4. Espinel CH. **The FENa test: use in the differential diagnosis of acute renal failure.** _JAMA._ 1976;236(6):579–581.
5. Carvounis CP, Nisar S, Guro-Razuman S. **Significance of the fractional excretion of urea in the differential diagnosis of acute renal failure.** _Kidney Int._ 2002;62(6):2223–2229.
