---
layout: doc
title: CDR 臨床失智評量表
---

# CDR 臨床失智評量表

**CDR Clinical Dementia Rating**

## 概述

**臨床失智評量表**（Clinical Dementia Rating Scale，CDR）由 Charles Hughes 於 1982 年在華盛頓大學阿茲海默症研究中心開發，是目前國際上應用最廣泛的失智症嚴重度分期工具。CDR 不依賴單一認知測驗，而是透過半結構式訪談，整合**認知功能**與**日常生活功能**兩大面向，全面評估患者的整體失能程度。

---

<CdrCalculator />

## 評估領域

CDR 涵蓋以下 **6 個領域**，各領域分別評分後整合為 CDR 總分：

| 領域                 | 英文                       | 評估重點                     |
| -------------------- | -------------------------- | ---------------------------- |
| 記憶力               | Memory                     | 近期記憶、學習新事物的能力   |
| 定向力               | Orientation                | 時間、地點、人物辨認         |
| 判斷力與解決問題能力 | Judgment & Problem Solving | 財務管理、危機應對、社交判斷 |
| 社區活動能力         | Community Affairs          | 購物、外出、工作參與         |
| 家居生活與嗜好       | Home & Hobbies             | 家事處理、興趣維持           |
| 自我照顧能力         | Personal Care              | 穿衣、盥洗、如廁             |

> **記憶力**是 CDR 評分中的**核心領域（primary category）**，其分數對 CDR 總分的影響權重最大。

## CDR 分級說明

### CDR Global Score（總分）

CDR 總分採用特定演算規則計算，並非六個領域的平均值。主要依據記憶力分數，並參考其餘五個領域的多數表現進行整合判定。

| CDR 總分 | 失智程度 | 臨床描述                                 |
| -------- | -------- | ---------------------------------------- |
| 0        | 無失智   | 認知與日常功能正常，無記憶力問題         |
| 0.5      | 可疑失智 | 輕微記憶遺忘，他人不易察覺，尚不影響生活 |
| 1        | 輕度失智 | 中度記憶減退，複雜日常活動開始受影響     |
| 2        | 中度失智 | 明顯功能退化，需要他人協助日常事務       |
| 3        | 重度失智 | 嚴重認知與功能障礙，需全面性照護         |

### CDR-SOB（Sum of Boxes，六格總分）

CDR-SOB 為六個領域分數直接加總，數值範圍 0–18 分。相較於 CDR 總分的五級分類，CDR-SOB 提供更細緻的連續性評估，對於偵測早期或輕微的病程變化特別敏感，在臨床試驗與療效追蹤中廣泛使用。

| CDR-SOB     | 對應嚴重程度   |
| ----------- | -------------- |
| 0           | 正常           |
| 0.5 – 4.0   | 極輕度認知障礙 |
| 4.5 – 9.0   | 輕度失智       |
| 9.5 – 15.5  | 中度失智       |
| 16.0 – 18.0 | 重度失智       |

## CDR 總分計算規則

CDR 總分並非簡單平均，而是遵循以下**Morris（1993）演算法**：

1. 若三個以上次要領域（M 以外）分數與記憶力分數相同 → CDR 總分 = 記憶力分數
2. 若次要領域中多數高於或低於記憶力分數 → CDR 總分取次要領域的多數值
3. 若次要領域分數平均分散於記憶力兩側 → CDR 總分 = 記憶力分數

> 本計算器已內建此演算法，結果自動計算，無需手動判斷。

## 評估方式與原則

CDR 的準確性高度依賴訪談品質，建議遵循以下原則：

- **雙來源訪談**：分別對患者及主要照顧者（或家屬）進行訪談，兩者資訊互補
- **以近期為主**：評估應聚焦於患者過去數週至數個月的實際功能表現
- **功能影響為準**：認知改變需達到影響日常生活的程度，才具臨床評分意義
- **排除急性因素**：譫妄、急性感染、重度憂鬱等可逆性因素應先排除

## 臨床應用

CDR 在臨床照護與學術研究上均有廣泛應用：

- **失智症嚴重度分期**：協助確立患者目前的疾病階段
- **照護需求規劃**：依分期評估居家、日照或機構照護需求
- **病程追蹤**：定期施測以監測認知功能變化速度
- **療效評估**：藥物或非藥物介入前後的功能變化比較
- **臨床試驗**：作為阿茲海默症及其他失智症研究的標準化評估工具
- **醫病溝通**：以具體數字協助向患者及家屬說明病情與預後

## 注意事項

::: warning 評估結果可能受多重因素影響
下列情況可能影響 CDR 評估準確性，應由專業醫療人員審慎判斷：

- 譫妄、急性感染或代謝異常等可逆性病因
- 重度憂鬱或其他精神疾病
- 視力、聽力等感官障礙
- 教育程度過低或語言溝通困難
- 文化背景差異導致的測驗偏差
  :::

::: info 免責聲明
本計算器僅供臨床參考與初步評估使用，不能取代正式醫療診斷及完整神經心理評估。若患者出現記憶力下降、行為改變、定向力障礙或疑似失智症狀，請諮詢神經內科、精神科或失智症專科醫療人員進行完整評估。
:::

## 參考文獻

1. Hughes CP, Berg L, Danziger WL, Coben LA, Martin RL. **A new clinical scale for the staging of dementia.** _Br J Psychiatry._ 1982;140:566–572.
2. Morris JC. **The Clinical Dementia Rating (CDR): current version and scoring rules.** _Neurology._ 1993;43(11):2412–2414.
3. Berg L, McKeel DW Jr, Miller JP, et al. **Clinicopathologic studies in cognitively healthy aging and Alzheimer's disease: relation of histologic markers to dementia severity, age, sex, and apolipoprotein E genotype.** _Arch Neurol._ 1998;55(3):326–335.
4. O'Bryant SE, Waring SC, Cullum CM, et al. **Staging dementia using Clinical Dementia Rating Scale Sum of Boxes scores: a Texas Alzheimer's Research Consortium study.** _Arch Neurol._ 2008;65(8):1091–1095.
