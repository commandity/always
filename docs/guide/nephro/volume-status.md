---
layout: doc
title: 體液狀態評估工具
---

# 體液狀態評估工具

**Volume Status Assessment · Free Water Deficit & IVC/BSA Ratio**

<VolumeStatusCalculator />

## H₂O Deficit 自由水缺乏量

**自由水缺乏量**（Free Water Deficit, FWD）用於**高血鈉症**的補液治療，估算需補充多少純水才能將血鈉矯正至 140 mEq/L：

```
FWD (L) = TBW × ( Na / 140 − 1 )
TBW = 去脂體重 × 0.6（男）/ 0.5（女）
```

### 高血鈉嚴重度與矯正原則

| 血鈉（mEq/L） | 嚴重度 | 意義與建議處置                             |
| ------------- | ------ | ------------------------------------------ |
| 145–150       | 輕度   | 鼓勵飲水、處理誘因（攝水不足、輕度脫水）   |
| 151–160       | 中度   | 依 FWD 規劃補液，密切監測血鈉              |
| > 160         | 重度   | 意識障礙、抽搐風險高，住院靜脈補充自由水   |

> **矯正速率是安全關鍵**：慢性（> 48 小時）高血鈉降鈉速率不可超過 **0.5 mEq/L/hr（每日 ≤ 10–12 mEq/L）**，過快矯正會造成腦水腫。FWD 只是「水的赤字」——尚需加上持續流失量（尿液、不感性流失約 30–40 mL/hr）才是實際補液計畫。

## IVC/BSA 比值

**下腔靜脈直徑／體表面積比值**是血液透析患者**乾體重（dry weight）**評估的超音波輔助工具：

```
BSA (m²) = √( 身高 cm × 體重 kg / 3600 )　（Mosteller）
IVC/BSA = 呼氣末 IVC 直徑 (mm) / BSA (m²)
CI (%) = ( IVC呼氣 − IVC吸氣 ) / IVC呼氣 × 100
```

### IVC/BSA 解讀

| IVC/BSA（mm/m²） | 體積狀態 | 意義與建議處置                       |
| ---------------- | -------- | ------------------------------------ |
| < 8              | 低血容量 | 乾體重設定過低，降低超濾量、上調乾體重 |
| 8–11.5           | 正常容積 | 乾體重適當，維持現行透析處方         |
| > 11.5           | 體液過載 | 加強超濾、下調乾體重，注意心衰竭表現 |

### 塌陷指數（CI）輔助判讀

| CI    | 意義                             |
| ----- | -------------------------------- |
| > 50% | 前負荷不足／低血容量             |
| 15–50%| 正常範圍                         |
| < 15% | 體積過載（IVC 飽滿、變異度消失） |

> IVC/BSA 與 CI 需**合併判讀**：透析後 IVC/BSA 降至 8 以下且 CI > 50%，提示超濾過度（易發生透析中低血壓）；透析前 IVC/BSA > 11.5 且 CI < 15%，提示乾體重應下修。量測時機以透析後 30 分鐘（體液再分佈完成）較具代表性。

## 注意事項

::: warning 超音波量測有操作者依賴性
IVC 直徑受呼吸配合、量測位置（肝靜脈匯入口下方 1–2 cm）與探頭角度影響，建議由固定人員以一致條件追蹤趨勢，而非單次數值。
:::

::: warning 高血鈉矯正需反覆監測
FWD 為單一時間點估算，補液過程中應每 4–6 小時追蹤血鈉，依實際下降速率調整輸液速度與成分。
:::

::: info 免責聲明
本計算器僅供臨床輔助參考，體液治療決策需由臨床醫師綜合病史、理學檢查及檢驗結果判斷。
:::

## 參考文獻

1. Adrogué HJ, Madias NE. **Hypernatremia.** _N Engl J Med._ 2000;342(20):1493–1499.
2. Cheriex EC, Leunissen KM, Janssen JH, Mooy JM, van Hooff JP. **Echography of the inferior vena cava is a simple and reliable tool for estimation of "dry weight" in haemodialysis patients.** _Nephrol Dial Transplant._ 1989;4(6):563–568.
3. Mosteller RD. **Simplified calculation of body-surface area.** _N Engl J Med._ 1987;317(17):1098.
