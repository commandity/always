---
layout: doc
title: 代謝評估工具
---

# 代謝評估工具

**Metabolism Assessment · BEE & BSA & Calorie Requirements & EER & IBW & LBW & Schofield BMR**

<MetabolismCalculator />

## BEE 基礎能量消耗

**Harris-Benedict 方程式**（Roza & Shizgal 1984 修訂版）估算靜息狀態下的基礎能量消耗：

```
男：BEE = 66.5 + 13.75 × W + 5.003 × H − 6.775 × Age
女：BEE = 655.1 + 9.563 × W + 1.850 × H − 4.676 × Age
TEE = BEE × 活動係數（AF 1.2–1.9）
```

> **臨床意義**：BEE 是營養支持處方的起點——住院患者每日熱量目標常設為 BEE × 1.2–1.3（臥床）至 × 1.5（復健期）；重症急性期反而建議略低於計算值（permissive underfeeding），避免過度餵食。

## BSA 體表面積

**Mosteller 公式**：

```
BSA (m²) = √( 身高 cm × 體重 kg / 3600 )
```

> **臨床意義**：BSA 是化療劑量（mg/m²）、心臟指數（CI = CO/BSA）與 eGFR 標準化（/1.73m²）的分母。成人參考值約 1.6–2.0 m²；極端體型（BMI > 40 或惡病質）時各公式間差異可達 5–10%，高劑量化療建議與其他公式交叉核對。

## 每日熱量參考表

依性別、年齡層與活動程度查表估算每日熱量需求（衛福部國民飲食指標），提供快速床邊參考，不需輸入身高體重。

> **與 EER 的分工**：參考表適合衛教與快速估算；需要精確個別化數值（如營養處方）時，改用下方 EER 方程式。

## EER 成人熱量需求估算

**DRI（Dietary Reference Intakes）EER 方程式**：

```
男：EER = 662 − 9.53 × Age + PA × (15.91 × Wt + 539.6 × Ht)
女：EER = 354 − 6.91 × Age + PA × (9.36 × Wt + 726 × Ht)
```

### PA 活動係數解讀

| 活動程度 | PA（男 / 女）  | 對應生活型態               |
| -------- | -------------- | -------------------------- |
| 久坐     | 1.00 / 1.00    | 僅日常活動                 |
| 低活動   | 1.11 / 1.12    | 每日步行 30–60 分鐘        |
| 活躍     | 1.25 / 1.27    | 每日運動 ≥ 60 分鐘         |
| 非常活躍 | 1.48 / 1.45    | 體力勞動或高強度訓練       |

## Ideal Body Weight 理想體重

**Devine 公式**（僅適用身高 ≥ 152.4 cm）：

```
男：IBW = 50 + 2.3 × (身高吋 − 60)
女：IBW = 45.5 + 2.3 × (身高吋 − 60)
ABW（調整體重）= IBW + 0.4 × (實際體重 − IBW)
```

> **臨床意義**：IBW 是呼吸器潮氣容積（6–8 mL/kg **IBW**）與多數親水性藥物的劑量基礎。實際體重 **> 130% IBW** 時改用調整體重（ABW）計算劑量（如 aminoglycosides），避免肥胖患者過量。

## Lean Body Weight 瘦體重

**Hume 公式**（1966，臨床首選）：

```
男：LBW = 0.32810 × W + 0.33929 × H − 29.5336
女：LBW = 0.29569 × W + 0.41813 × H − 43.2933
```

> **臨床意義**：瘦體重約佔健康成人體重的 70–90%，是 CT 對比劑（Boer 公式版本適用 BMI 35–40）、麻醉誘導藥物（propofol 誘導劑量）等以去脂組織分佈為主之藥物的劑量基礎。

## Schofield BMR 基礎代謝率

**Schofield 方程式**（WHO 採用）僅需體重即可分年齡層估算 BMR，涵蓋小兒至老年（< 3 歲至 > 60 歲共 6 個年齡組），適合兒科與無法測量身高的臥床患者：

```
例：男 18–30 歲 BMR = 15.057 × W + 692.2
　　女 18–30 歲 BMR = 14.818 × W + 486.6
```

> **與 Harris-Benedict 的分工**：Schofield 有小兒年齡層且不需身高，是 WHO／兒科營養的標準；Harris-Benedict 納入身高與年齡連續變化，成人精確度略佳。兩者在成人差異通常 < 10%。

## 注意事項

::: warning 公式皆為估算值
所有能量與體重公式均基於群體回歸，個別誤差可達 ±10–15%；重症、燒燙傷、懷孕等特殊族群建議以間接熱量測定（indirect calorimetry）為準。
:::

::: info 免責聲明
本計算器僅供臨床輔助參考，營養處方與藥物劑量需由臨床醫師或營養師綜合評估決定。
:::

## 參考文獻

1. Roza AM, Shizgal HM. **The Harris Benedict equation reevaluated: resting energy requirements and the body cell mass.** _Am J Clin Nutr._ 1984;40(1):168–182.
2. Mosteller RD. **Simplified calculation of body-surface area.** _N Engl J Med._ 1987;317(17):1098.
3. Institute of Medicine. **Dietary Reference Intakes for Energy, Carbohydrate, Fiber, Fat, Fatty Acids, Cholesterol, Protein, and Amino Acids.** National Academies Press; 2005.
4. Devine BJ. **Gentamicin therapy.** _Drug Intell Clin Pharm._ 1974;8:650–655.
5. Hume R. **Prediction of lean body mass from height and weight.** _J Clin Pathol._ 1966;19(4):389–391.
6. Schofield WN. **Predicting basal metabolic rate, new standards and review of previous work.** _Hum Nutr Clin Nutr._ 1985;39 Suppl 1:5–41.
