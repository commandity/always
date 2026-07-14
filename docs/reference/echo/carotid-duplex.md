---
layout: doc
title: 頸動脈雙功能暨經顱都卜勒超音波 Carotid Duplex & Transcranial Doppler Ultrasound 
---

# 頸動脈雙功能暨經顱都卜勒超音波
**Carotid Duplex & Transcranial Doppler Ultrasound**

<CarotidDuplexReport />

## 標準檢查流程

### 探頭與擺位

- **經顱探頭（TCD probe）**：2–3 MHz，顱窗（temporal / suboccipital / orbit / foraminal）
- **頸動脈探頭（Carotid probe）**：5–10 MHz，線性陣列
- **彩色都卜勒（Color Doppler）**：評估各血管血流方向及型態
- **脈衝都卜勒（Pulsed-wave Doppler）**：取得 PS / ED / RI / MV 或 FV

### 掃描範圍

1. **經顱**：OA、A1（ACA）、M1（MCA）、P1（PCA）、VA（intracranial）、BA
2. **顱外頸動脈**：CCA、BIF、ICA、ECA、VA（extracranial）
3. **OA 血流方向**：Antegrade（正常）或 Retrograde（逆流，提示近端 ICA/CCA 病變）

## 正常參考值

### 經顱 Doppler 參考值

| 血管                  | PS (cm/s) | ED (cm/s) | RI        |
| --------------------- | --------- | --------- | --------- |
| **OA**                | 30–60     | 5–15      | 0.75–0.85 |
| **A1 (ACA)**          | 80–120    | 35–55     | 0.55–0.70 |
| **M1 (MCA)**          | 80–140    | 35–65     | 0.55–0.70 |
| **P1 (PCA)**          | 50–90     | 20–35     | 0.55–0.70 |
| **VA (intracranial)** | 40–80     | 15–30     | 0.55–0.70 |
| **BA**                | 40–80     | 15–30     | 0.55–0.70 |

### 顱外頸動脈 參考值

| 血管                  | PS (cm/s) | ED (cm/s) | RI        |
| --------------------- | --------- | --------- | --------- |
| **CCA**               | 60–120    | 10–30     | 0.70–0.85 |
| **ICA**               | 60–120    | 15–40     | 0.55–0.70 |
| **ECA**               | 80–150    | 5–15      | 0.80–1.00 |
| **BIF**               | 80–130    | 15–35     | 0.60–0.75 |
| **VA (extracranial)** | 30–70     | 10–25     | 0.60–0.75 |

## 核心計算公式

### Lindegaard Ratio（MCA/ICA mean-V ratio）

```
Lindegaard = MeanV(M1) / MeanV(ICA_extracranial)
```

其中 `MeanV(ICA) = (PSV + 2 × EDV) / 3`

| 數值        | 意義                                                                 |
| ----------- | -------------------------------------------------------------------- |
| **< 3.0**   | 正常（Normal）                                                       |
| **3.0–6.0** | 輕度升高，需排除血管痙攣（Mildly elevated, correlate for vasospasm） |
| **> 6.0**   | 顯著升高，嚴重血管痙攣範圍（Markedly elevated, severe vasospasm）    |

### ICA/CCA PSV Ratio

```
ICA/CCA ratio = PSV(ICA) / PSV(CCA)
```

| 數值        | 意義               |
| ----------- | ------------------ |
| **< 1.5**   | 正常（Normal）     |
| **1.5–2.0** | 可疑（Borderline） |
| **≥ 2.0**   | 提示 50–69% 狹窄   |
| **≥ 4.0**   | 提示 70–99% 狹窄   |

### Bilateral CCA PSV Ratio

```
Bil CCA = PSV(Rt CCA) / PSV(Lt CCA)
```

正常範圍：0.7–1.3。超出此範圍提示不對稱血流。

## ICA Stenosis Grading（NASCET 準則）

| 分級       | PSV(ICA)     | ICA/CCA Ratio |
| ---------- | ------------ | ------------- |
| **0–49%**  | < 125 cm/s   | < 2.0         |
| **50–69%** | 125–249 cm/s | 2.0–3.9       |
| **70–99%** | ≥ 250 cm/s   | ≥ 4.0         |

取 PSV 與 ratio 兩者中較嚴重之分級。

## ICA 阻塞評估

### Pseudo-occlusion

- B-mode 可見血栓，可能仍有狹窄管腔
- String-sign / punctate color flash
- 顯著降低的流速 ± 高阻抗
- 稍微升高的湍流，伴隨延長的加速時間

### Total Occlusion

- B-mode 血栓充滿整個管腔
- 無 color signal（需以 low-flow / high-sensitivity 設定確認）
- 無 Doppler waveform

### Recent Occlusion

- 均勻的新鮮血栓（可能隨脈動移動）
- 近端可能出現自发性 echo contrast
- 可能為低回音（hypoechogenic）
- 無 color signal，無 waveform

## B-mode Plaque Findings

| 項目                    | 描述選項                                                                           |
| ----------------------- | ---------------------------------------------------------------------------------- |
| **Distribution**        | Single / Discrete / Segmental                                                      |
| **Internal Pattern**    | Eccentric / Concentric                                                             |
| **Appearance**          | Homogeneous / Heterogeneous / Ulcerated / Intraplaque hemorrhage / Moving-floating |
| **Area Stenosis Grade** | < 75% → 0–49%; 75–90% → 50–69%; > 90% → 70–99% (area)                              |

## 注意事項

::: warning 本工具為報告模板參考
此模板提供結構化指引，不應取代完整的超音波檢查與臨床判斷。最終報告需由執行檢查之醫師根據實際影像所見判斷並簽署。
:::

::: info Stenosis Grading 注意
ICA 狹窄分級應同時參考 PSV 絕對值與 ICA/CCA ratio，取較嚴重者為準。若 ICA 狀態非 Patent（如 pseudo-occlusion 或 occlusion），則不適用 PSV/ratio 分級。
:::

::: info Lindegaard Ratio 臨床意義
Lindegaard ratio 用於區分 MCA 流速升高之原因：若 ratio < 3，MCA 流速升高可能為全身性因素（如心輸出量增加）；若 ratio ≥ 3，則高度懷疑局部血管痙攣（vasospasm），常見於蛛網膜下腔出血（SAH）患者。
:::

## 參考文獻

1. Grant EG, Benson CB, Moneta GL, et al. Carotid artery stenosis: gray-scale and Doppler ultrasound diagnosis — Society of Radiologists in Ultrasound consensus conference. _Ultrasound Q_. 2003;19(4):190-198.
2. Alexandrov AV, Sloan MA, Tegeler CH, et al. Transcranial Doppler (TCD) for intracranial vasospasm: clinical findings and future directions. _Stroke_. 2002;33(12):2850-2856.
3. Lindegaard KF, Nornes H, Bakke SJ, et al. Cerebral vasospasm diagnosis by means of angiography and blood velocity measurements. _Acta Neurochir (Wien)_. 1989;100(1-2):12-16.
4. North American Symptomatic Carotid Endarterectomy Trial (NASCET) Collaborators. Beneficial effect of carotid endarterectomy in symptomatic patients with high-grade carotid stenosis. _N Engl J Med_. 1991;325(7):445-453.
