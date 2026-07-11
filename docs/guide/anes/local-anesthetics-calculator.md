---
layout: doc
title: Local Anesthetics 劑量計算
---

# Local Anesthetics 劑量計算

**Local Anesthetic Maximum Dose Calculator · 麻醉藥物最大安全劑量計算**

<LocalAnestheticsCalculator />

## 常用醯胺型局部麻醉藥物比較

| 藥物                 | 濃度選項              | 無 Epi (mg/kg) | 有 Epi (mg/kg) | 起始時間      | 持續時間           | 特性                          |
| -------------------- | --------------------- | -------------- | -------------- | ------------- | ------------------ | ----------------------------- |
| Lidocaine 利多卡因   | 1%, 1.5%, 2%, 4%      | 4.5            | 7              | 快 (1-3 min)  | 短-中 (60-120 min) | 最常用，中樞神經毒性較低      |
| Bupivacaine 布比卡因 | 0.25%, 0.5%, 0.75%    | 2.0            | 3              | 慢 (5-10 min) | 長 (4-8 hr)        | 心臟毒性較高，需謹慎          |
| Mepivacaine 甲哌卡因 | 1%, 1.5%, 2%, 3%      | 4.5            | 7              | 快 (1-3 min)  | 中 (60-180 min)    | 作用與 Lidocaine 相似         |
| Ropivacaine 羅哌卡因 | 0.2%, 0.5%, 0.75%, 1% | 3.0            | 3              | 中 (3-5 min)  | 中-長 (4-8 hr)     | 感覺-運動分離佳，心臟毒性較低 |

## 體重選擇依據

MDCalc 與 ASRA/SOBA 建議：

- **一般患者**：使用實際體重（Actual Body Weight）
- **肥胖患者**：建議使用瘦體重（Lean Body Weight, LBW）計算，避免過量
- **極端體重**（過輕或過重）：體重異常者為劑量誤差高風險族群，應特別審慎

## Epinephrine 的作用

Epinephrine（1:200,000 或 1:100,000）加入局部麻醉藥中可：

- **血管收縮**：減緩藥物全身吸收，延長作用時間
- **提高安全上限**：最高可增加 30–50% 的最大劑量
- **減少手術出血**：局部止血效果

::: warning 注意
最新版 Goldfrank's 已不再特別調整含 Epinephrine 之最大劑量，但臨床上仍普遍認為含 Epi 可提高安全上限。本計算器同時提供兩種數據供參考。
:::

### 禁忌部位

Epinephrine **不適用於**末梢血管供應區域（手指、腳趾、陰莖、鼻子、耳朵），因可能造成缺血性壞死。

## 臨床注意事項

::: warning 最大劑量
計算最大劑量時應考慮患者體重、肝腎功能、心臟疾病等共病因素。老年、肝病、心衰竭患者應酌減劑量。
:::

::: warning LAST 監測
局部麻醉藥全身毒性（LAST）的早期徵兆包括：口周麻木、金屬味覺、焦慮、視覺改變、肌肉顫搐。應隨時準備 Intralipid 以緊急處置。
:::

::: info 免責聲明
本工具僅供臨床輔助與教學參考，實際劑量應由麻醉專科醫師依個案情況判定。
:::

## 參考文獻

1. MDCalc — Local Anesthetic Dosing Calculator. https://www.mdcalc.com/calc/10205
2. Butterworth JF, Mackey DC, Wasnick JD. **Morgan & Mikhail's Clinical Anesthesiology.** 7th ed. McGraw-Hill; 2023.
3. ASRA Pain Medicine. **Local Anesthetic Systemic Toxicity (LAST).** 2017.
4. Striker TE, et al. **Local Anesthetics.** In: Basics of Anesthesia. 8th ed. Elsevier; 2023.
