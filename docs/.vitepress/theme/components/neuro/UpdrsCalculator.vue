<script setup lang="ts">
import { ref, computed } from "vue";

const part1 = [
  {
    key: "q1",
    name: "智能障礙",
    scores: [
      { value: 0, description: "沒有" },
      {
        value: 1,
        description: "輕微，常遺忘事情，經過思考可以想起來，無其他困難",
      },
      {
        value: 2,
        description: "中度記憶喪失，處理複雜問題有中度困難，有時需要提示",
      },
      {
        value: 3,
        description: "重度記憶力喪失，時間與地點容易混淆，處理問題有重度困難",
      },
      {
        value: 4,
        description: "嚴重記憶力喪失，只能辨別特定人物，沒有判斷能力，不能獨處",
      },
    ],
  },
  {
    key: "q2",
    name: "思想錯亂",
    scores: [
      { value: 0, description: "沒有" },
      { value: 1, description: "鮮明的夢" },
      { value: 2, description: "良性幻覺，自己會知道" },
      {
        value: 3,
        description: "不時陷入幻覺或妄想而無法自覺，日常生活會被干擾",
      },
      { value: 4, description: "持續性的幻覺、妄想、精神錯亂，無法照顧自己" },
    ],
  },
  {
    key: "q3",
    name: "沮喪",
    scores: [
      { value: 0, description: "沒有" },
      {
        value: 1,
        description:
          "不時會有超出正常人該有的哀傷或罪惡感，但不會持續數天或數週",
      },
      { value: 2, description: "持續性沮喪（一週以上）" },
      {
        value: 3,
        description: "持續性沮喪伴隨活動力減退之症狀（如失眠、厭食、體重減輕）",
      },
      {
        value: 4,
        description: "持續性沮喪伴隨活動力減退之症狀，有自殺的念頭或行動",
      },
    ],
  },
  {
    key: "q4",
    name: "動機",
    scores: [
      { value: 0, description: "正常" },
      { value: 1, description: "不如平常積極，比較被動" },
      { value: 2, description: "對非例行需做選擇的活動缺乏主動或沒有興趣" },
      { value: 3, description: "對日常例行的活動缺乏主動或沒有興趣" },
      { value: 4, description: "退縮，完全喪失動機" },
    ],
  },
];

const part2 = [
  {
    key: "q5",
    name: "語言能力",
    scores: [
      { value: 0, description: "正常" },
      { value: 1, description: "輕微影響，但可了解" },
      { value: 2, description: "中度影響，但有時需要重複述說一遍" },
      { value: 3, description: "重度影響，常常需要重複述說一遍" },
      { value: 4, description: "大半無法瞭解" },
    ],
  },
  {
    key: "q6",
    name: "唾液分泌",
    scores: [
      { value: 0, description: "正常" },
      { value: 1, description: "少許過量的唾液在口中，晚上可能會流出來" },
      { value: 2, description: "中度" },
      { value: 3, description: "嚴重" },
      { value: 4, description: "嚴重垂涎，一直需要紙巾或手帕擦拭" },
    ],
  },
  {
    key: "q7",
    name: "吞嚥",
    scores: [
      { value: 0, description: "正常" },
      { value: 1, description: "很少嗆住" },
      { value: 2, description: "偶爾嗆住" },
      { value: 3, description: "需要進食半流質食物" },
      { value: 4, description: "需插鼻胃管或做胃造口手術" },
    ],
  },
  {
    key: "q8",
    name: "寫字",
    scores: [
      { value: 0, description: "正常" },
      { value: 1, description: "有點遲緩或字體小" },
      { value: 2, description: "中度遲緩或字體小，但是可以辨認所有字體" },
      { value: 3, description: "嚴重遲緩，無法辨認所有字體" },
      { value: 4, description: "大部分字體無法辨認" },
    ],
  },
  {
    key: "q9",
    name: "進食能力",
    scores: [
      { value: 0, description: "正常" },
      { value: 1, description: "有點緩慢笨拙，但不需要幫忙" },
      {
        value: 2,
        description: "有點緩慢笨拙，但是可以使用筷子，有時需要別人的幫助",
      },
      { value: 3, description: "必須使用湯匙進食，自己可以緩慢進食" },
      { value: 4, description: "需要別人餵食" },
    ],
  },
  {
    key: "q10",
    name: "穿衣",
    scores: [
      { value: 0, description: "正常" },
      { value: 1, description: "有點緩慢，但不需要幫忙" },
      { value: 2, description: "有時需要幫忙扣釦子、穿袖子" },
      { value: 3, description: "有時需要更多幫助，但是有些事情可以獨自做" },
      { value: 4, description: "需要完全幫助" },
    ],
  },
  {
    key: "q11",
    name: "衛生清潔",
    scores: [
      { value: 0, description: "正常" },
      { value: 1, description: "有點緩慢，但不需要幫忙" },
      { value: 2, description: "洗澡需要幫忙，個人衛生處理很慢" },
      { value: 3, description: "盥洗、刷牙、梳頭、大小便都需要幫助" },
      { value: 4, description: "需要導尿管、或者其他器械幫助" },
    ],
  },
  {
    key: "q12",
    name: "翻身、調整被單",
    scores: [
      { value: 0, description: "正常" },
      { value: 1, description: "有點緩慢，但不需要幫忙" },
      { value: 2, description: "可翻身或調整被單，但是費很多力氣" },
      { value: 3, description: "有企圖心、但不能用自己的力量翻身也拉不動被單" },
      { value: 4, description: "完全沒辦法做" },
    ],
  },
  {
    key: "q13",
    name: "跌倒（與凍僵無關）",
    scores: [
      { value: 0, description: "正常" },
      { value: 1, description: "很少跌倒" },
      { value: 2, description: "很少跌倒，一天少於一次" },
      { value: 3, description: "平均一天跌倒一次" },
      { value: 4, description: "一天跌倒超過一次" },
    ],
  },
  {
    key: "q14",
    name: "走路時出現凍僵現象",
    scores: [
      { value: 0, description: "正常" },
      { value: 1, description: "走路時很少凍僵，起步時有點躊躇" },
      { value: 2, description: "走路時有時候會凍僵" },
      { value: 3, description: "常常凍僵，有時會因此跌倒" },
      { value: 4, description: "常常因為凍僵而跌倒" },
    ],
  },
  {
    key: "q15",
    name: "走路",
    scores: [
      { value: 0, description: "正常" },
      { value: 1, description: "輕度困難，可能不會擺動手臂，或者拖著腳走" },
      { value: 2, description: "中度困難，但是只要一些幫助，或是不需要幫助" },
      { value: 3, description: "嚴重影響走路" },
      { value: 4, description: "即使幫助也無法走路" },
    ],
  },
  {
    key: "q16_right",
    name: "顫抖（右手臂）",
    scores: [
      { value: 0, description: "沒有" },
      { value: 1, description: "輕微，很少出現並不會造成困擾" },
      { value: 2, description: "中度，造成一些困擾" },
      { value: 3, description: "嚴重，許多活動被干擾" },
      { value: 4, description: "非常嚴重，大部份活動被干擾" },
    ],
  },
  {
    key: "q16_left",
    name: "顫抖（左手臂）",
    scores: [
      { value: 0, description: "沒有" },
      { value: 1, description: "輕微，很少出現並不會造成困擾" },
      { value: 2, description: "中度，造成一些困擾" },
      { value: 3, description: "嚴重，許多活動被干擾" },
      { value: 4, description: "非常嚴重，大部份活動被干擾" },
    ],
  },
  {
    key: "q17",
    name: "與巴金森症有關異常感覺",
    scores: [
      { value: 0, description: "沒有" },
      { value: 1, description: "偶而四肢麻木、刺痛、與輕微疼痛" },
      {
        value: 2,
        description: "常常四肢麻木、刺痛、與輕微疼痛，還不致於因此煩惱",
      },
      { value: 3, description: "常有疼痛感覺" },
      { value: 4, description: "非常疼痛" },
    ],
  },
];

const part3 = [
  {
    key: "q18",
    name: "語言",
    scores: [
      { value: 0, description: "正常" },
      { value: 1, description: "表情、用字、音量有一點減弱" },
      { value: 2, description: "中度障礙，發音含糊單調，但是可以了解" },
      { value: 3, description: "重度障礙，很難了解" },
      { value: 4, description: "完全不了解" },
    ],
  },
  {
    key: "q19",
    name: "面部表情",
    scores: [
      { value: 0, description: "正常" },
      { value: 1, description: "輕微面無表情，可以是正常人的「撲克臉」" },
      { value: 2, description: "面部表情輕微地減少，並確定是不正常減少" },
      { value: 3, description: "中度面無表情，嘴巴有時微張" },
      {
        value: 4,
        description: "臉部僵硬、固定、表情全無、嘴巴張開超過半公分以上",
      },
    ],
  },
  {
    key: "q20_face",
    name: "靜止型顫抖（臉、唇、頰）",
    scores: [
      { value: 0, description: "沒有" },
      { value: 1, description: "輕微顫抖，很少出現" },
      { value: 2, description: "持續性的輕微顫抖或間續性的中度顫抖" },
      { value: 3, description: "中度顫抖，常常出現" },
      { value: 4, description: "抖動幅度很大，並且經常出現" },
    ],
  },
  {
    key: "q20_ru",
    name: "靜止型顫抖（右上肢）",
    scores: [
      { value: 0, description: "沒有" },
      { value: 1, description: "輕微顫抖，很少出現" },
      { value: 2, description: "持續性的輕微顫抖或間續性的中度顫抖" },
      { value: 3, description: "中度顫抖，常常出現" },
      { value: 4, description: "抖動幅度很大，並且經常出現" },
    ],
  },
  {
    key: "q20_lu",
    name: "靜止型顫抖（左上肢）",
    scores: [
      { value: 0, description: "沒有" },
      { value: 1, description: "輕微顫抖，很少出現" },
      { value: 2, description: "持續性的輕微顫抖或間續性的中度顫抖" },
      { value: 3, description: "中度顫抖，常常出現" },
      { value: 4, description: "抖動幅度很大，並且經常出現" },
    ],
  },
  {
    key: "q20_rl",
    name: "靜止型顫抖（右下肢）",
    scores: [
      { value: 0, description: "沒有" },
      { value: 1, description: "輕微顫抖，很少出現" },
      { value: 2, description: "持續性的輕微顫抖或間續性的中度顫抖" },
      { value: 3, description: "中度顫抖，常常出現" },
      { value: 4, description: "抖動幅度很大，並且經常出現" },
    ],
  },
  {
    key: "q20_ll",
    name: "靜止型顫抖（左下肢）",
    scores: [
      { value: 0, description: "沒有" },
      { value: 1, description: "輕微顫抖，很少出現" },
      { value: 2, description: "持續性的輕微顫抖或間續性的中度顫抖" },
      { value: 3, description: "中度顫抖，常常出現" },
      { value: 4, description: "抖動幅度很大，並且經常出現" },
    ],
  },
  {
    key: "q21_right",
    name: "動作型或姿勢型顫抖（右上肢）",
    scores: [
      { value: 0, description: "沒有" },
      { value: 1, description: "輕微，只有動作時才發生" },
      { value: 2, description: "中度，只有動作時才發生" },
      { value: 3, description: "中度，在動作及維持姿勢時皆發生" },
      { value: 4, description: "重度，會干擾進食" },
    ],
  },
  {
    key: "q21_left",
    name: "動作型或姿勢型顫抖（左上肢）",
    scores: [
      { value: 0, description: "沒有" },
      { value: 1, description: "輕微，只有動作時才發生" },
      { value: 2, description: "中度，只有動作時才發生" },
      { value: 3, description: "中度，在動作及維持姿勢時皆發生" },
      { value: 4, description: "重度，會干擾進食" },
    ],
  },
  {
    key: "q22_neck",
    name: "僵硬（頸部）",
    scores: [
      { value: 0, description: "沒有" },
      { value: 1, description: "極輕微，或只有在其他肢體做動作時才可測到" },
      { value: 2, description: "輕微至中度" },
      { value: 3, description: "明顯，但是範圍內動作可完成" },
      { value: 4, description: "嚴重，範圍內動作完成困難" },
    ],
  },
  {
    key: "q22_ru",
    name: "僵硬（右上肢）",
    scores: [
      { value: 0, description: "沒有" },
      { value: 1, description: "極輕微，或只有在其他肢體做動作時才可測到" },
      { value: 2, description: "輕微至中度" },
      { value: 3, description: "明顯，但是範圍內動作可完成" },
      { value: 4, description: "嚴重，範圍內動作完成困難" },
    ],
  },
  {
    key: "q22_lu",
    name: "僵硬（左上肢）",
    scores: [
      { value: 0, description: "沒有" },
      { value: 1, description: "極輕微，或只有在其他肢體做動作時才可測到" },
      { value: 2, description: "輕微至中度" },
      { value: 3, description: "明顯，但是範圍內動作可完成" },
      { value: 4, description: "嚴重，範圍內動作完成困難" },
    ],
  },
  {
    key: "q22_rl",
    name: "僵硬（右下肢）",
    scores: [
      { value: 0, description: "沒有" },
      { value: 1, description: "極輕微，或只有在其他肢體做動作時才可測到" },
      { value: 2, description: "輕微至中度" },
      { value: 3, description: "明顯，但是範圍內動作可完成" },
      { value: 4, description: "嚴重，範圍內動作完成困難" },
    ],
  },
  {
    key: "q22_ll",
    name: "僵硬（左下肢）",
    scores: [
      { value: 0, description: "沒有" },
      { value: 1, description: "極輕微，或只有在其他肢體做動作時才可測到" },
      { value: 2, description: "輕微至中度" },
      { value: 3, description: "明顯，但是範圍內動作可完成" },
      { value: 4, description: "嚴重，範圍內動作完成困難" },
    ],
  },
  {
    key: "q23_right",
    name: "手指打拍（右手）",
    scores: [
      { value: 0, description: "正常（≥15下/5秒）" },
      { value: 1, description: "有點緩慢，幅度減少（11–14下/5秒）" },
      {
        value: 2,
        description: "中度障礙，容易疲勞，有時動作會中斷（7–10下/5秒）",
      },
      {
        value: 3,
        description: "重度障礙，啟動動作很慢，或動作時常會中斷（3–6下/5秒）",
      },
      { value: 4, description: "幾乎無法動作（0–2下/5秒）" },
    ],
  },
  {
    key: "q23_left",
    name: "手指打拍（左手）",
    scores: [
      { value: 0, description: "正常（≥15下/5秒）" },
      { value: 1, description: "有點緩慢，幅度減少（11–14下/5秒）" },
      {
        value: 2,
        description: "中度障礙，容易疲勞，有時動作會中斷（7–10下/5秒）",
      },
      {
        value: 3,
        description: "重度障礙，啟動動作很慢，或動作時常會中斷（3–6下/5秒）",
      },
      { value: 4, description: "幾乎無法動作（0–2下/5秒）" },
    ],
  },
  {
    key: "q24_right",
    name: "手掌握合（右手）",
    scores: [
      { value: 0, description: "正常" },
      { value: 1, description: "有點緩慢，或手掌張開的幅度稍微減小" },
      { value: 2, description: "中度障礙，容易疲勞，有時動作會中斷" },
      { value: 3, description: "重度障礙，動作開始很吃力，或動作常常會中斷" },
      { value: 4, description: "幾乎無法動作" },
    ],
  },
  {
    key: "q24_left",
    name: "手掌握合（左手）",
    scores: [
      { value: 0, description: "正常" },
      { value: 1, description: "有點緩慢，或手掌張開的幅度稍微減小" },
      { value: 2, description: "中度障礙，容易疲勞，有時動作會中斷" },
      { value: 3, description: "重度障礙，動作開始很吃力，或動作常常會中斷" },
      { value: 4, description: "幾乎無法動作" },
    ],
  },
  {
    key: "q25",
    name: "前臂迴旋",
    scores: [
      { value: 0, description: "正常" },
      { value: 1, description: "有點遲緩，旋轉的幅度稍微減小" },
      { value: 2, description: "中度遲緩，容易疲勞，有時動作會中斷" },
      { value: 3, description: "重度遲緩，動作開始很吃力，或動作常常會中斷" },
      { value: 4, description: "幾乎無法動作" },
    ],
  },
  {
    key: "q26_right",
    name: "兩腳靈敏度測試（右下肢）",
    scores: [
      { value: 0, description: "正常" },
      { value: 1, description: "有點遲緩，幅度稍微減小" },
      { value: 2, description: "中度遲緩，容易疲勞，有時動作會中斷" },
      { value: 3, description: "重度遲緩，動作開始很吃力，或動作常常會中斷" },
      { value: 4, description: "幾乎無法動作" },
    ],
  },
  {
    key: "q26_left",
    name: "兩腳靈敏度測試（左下肢）",
    scores: [
      { value: 0, description: "正常" },
      { value: 1, description: "有點遲緩，幅度稍微減小" },
      { value: 2, description: "中度遲緩，容易疲勞，有時動作會中斷" },
      { value: 3, description: "重度遲緩，動作開始很吃力，或動作常常會中斷" },
      { value: 4, description: "幾乎無法動作" },
    ],
  },
  {
    key: "q27",
    name: "從椅子上站起來",
    scores: [
      { value: 0, description: "正常" },
      { value: 1, description: "遲緩，或需要試好多次" },
      { value: 2, description: "可自己推把手站起來" },
      {
        value: 3,
        description: "容易向後跌回，需要多試幾次，但仍可靠自己站起來",
      },
      { value: 4, description: "必須要人幫助才能從椅子上起來" },
    ],
  },
  {
    key: "q28",
    name: "姿勢",
    scores: [
      { value: 0, description: "正常挺直" },
      { value: 1, description: "不是很挺，輕微駝背，對老人可算是正常" },
      { value: 2, description: "中度駝背，明顯異常，有輕度側彎" },
      { value: 3, description: "中度駝背，中度側彎" },
      { value: 4, description: "嚴重前屈，姿勢極端不正確" },
    ],
  },
  {
    key: "q29",
    name: "步態",
    scores: [
      { value: 0, description: "正常" },
      { value: 1, description: "步態遲緩、拖步，但是不會急步或向前衝" },
      {
        value: 2,
        description:
          "走路困難，不需要幫助或只需要一點幫助，有時步伐急促、碎步、或向前衝",
      },
      { value: 3, description: "走路極端困難，需要幫助" },
      { value: 4, description: "即使有幫助，仍不能走路" },
    ],
  },
  {
    key: "q30",
    name: "姿勢平穩度",
    scores: [
      { value: 0, description: "正常" },
      { value: 1, description: "後退，但不需要幫助，可自行平衡" },
      { value: 2, description: "沒有平衡反應，若沒有檢查人員抓住，病人會摔倒" },
      { value: 3, description: "非常不穩，即使在自然狀態也有失去平衡的傾向" },
      { value: 4, description: "需要幫助才能站穩" },
    ],
  },
  {
    key: "q31",
    name: "全身動作遲緩",
    scores: [
      { value: 0, description: "正常" },
      {
        value: 1,
        description: "稍微變慢，給人小心翼翼的感覺，動作幅度可能減小",
      },
      {
        value: 2,
        description: "輕度變慢或動作減少，確實是不正常的，或者動作幅度稍微減小",
      },
      { value: 3, description: "中度變慢或動作減少，或者動作幅度減小" },
      { value: 4, description: "重度變慢或動作減少" },
    ],
  },
];

const part4a = [
  {
    key: "q32",
    name: "異動症出現時段",
    scores: [
      { value: 0, description: "無" },
      { value: 1, description: "佔清醒時段的 1%–25%" },
      { value: 2, description: "佔清醒時段的 26%–50%" },
      { value: 3, description: "佔清醒時段的 51%–75%" },
      { value: 4, description: "佔清醒時段的 76%–100%" },
    ],
  },
  {
    key: "q33",
    name: "異動症殘障程度",
    scores: [
      { value: 0, description: "無殘障" },
      { value: 1, description: "輕度殘障" },
      { value: 2, description: "中度殘障" },
      { value: 3, description: "重度殘障" },
      { value: 4, description: "完全殘障" },
    ],
  },
  {
    key: "q34",
    name: "疼痛性異動症",
    scores: [
      { value: 0, description: "不痛" },
      { value: 1, description: "輕度" },
      { value: 2, description: "中度" },
      { value: 3, description: "重度" },
      { value: 4, description: "極嚴重" },
    ],
  },
  {
    key: "q35",
    name: "清晨肌張力異常",
    scores: [
      { value: 0, description: "無" },
      { value: 1, description: "有" },
    ],
  },
];

const part4b = [
  {
    key: "q36",
    name: "可預測的「無效期」",
    scores: [
      { value: 0, description: "無" },
      { value: 1, description: "有" },
    ],
  },
  {
    key: "q37",
    name: "不可預測的「無效期」",
    scores: [
      { value: 0, description: "沒有" },
      { value: 1, description: "有" },
    ],
  },
  {
    key: "q38",
    name: "忽然出現的「無效期」",
    scores: [
      { value: 0, description: "沒有" },
      { value: 1, description: "有" },
    ],
  },
  {
    key: "q39",
    name: "「無效期」佔清醒時段比率",
    scores: [
      { value: 0, description: "無" },
      { value: 1, description: "佔清醒時段的 1%–25%" },
      { value: 2, description: "佔清醒時段的 26%–50%" },
      { value: 3, description: "佔清醒時段的 51%–75%" },
      { value: 4, description: "佔清醒時段的 76%–100%" },
    ],
  },
];

const part4 = [...part4a, ...part4b];

const sections = [
  {
    label: "第一部份：智能、行為、情緒",
    sub: "Mentation, Behavior & Mood",
    items: part1,
    max: 16,
    color: "mental",
  },
  {
    label: "第二部份：日常生活能力",
    sub: "Activities of Daily Living",
    items: part2,
    max: 52,
    color: "daily",
  },
  {
    label: "第三部份：動作能力之檢查",
    sub: "Motor Examination",
    items: part3,
    max: 56,
    color: "motor",
  },
  {
    label: "第四部份 A：異動症",
    sub: "Dyskinesias",
    items: part4a,
    max: 13,
    color: "compla",
  },
  {
    label: "第四部份 B：臨床藥波動現象",
    sub: "Clinical Fluctuations",
    items: part4b,
    max: 10,
    color: "complb",
  },
];

const allItems = [...part1, ...part2, ...part3, ...part4];

const qIndex = (() => {
  const map: Record<string, number> = {};
  allItems.forEach((item, i) => {
    map[item.key] = i + 1;
  });
  return map;
})();

const selections = ref<Record<string, number>>(
  Object.fromEntries(allItems.map((item) => [item.key, 0])),
);
const showResults = ref(false);
const copied = ref(false);

const sectionScores = computed(() =>
  sections.map((s) =>
    s.items.reduce((sum, item) => sum + (selections.value[item.key] ?? 0), 0),
  ),
);

const totalScore = computed(() =>
  sectionScores.value.reduce((a, b) => a + b, 0),
);

const severity = computed(() => {
  const s = totalScore.value;
  if (s === 0) return { level: "正常", color: "normal" };
  if (s <= 20) return { level: "輕度障礙", color: "mild" };
  if (s <= 50) return { level: "中度障礙", color: "moderate" };
  if (s <= 80) return { level: "重度障礙", color: "severe" };
  return { level: "極重度", color: "critical" };
});

function generateMarkdown() {
  const lines = sections
    .map((s, i) => {
      const itemLines = s.items
        .map((item) => {
          const v = selections.value[item.key];
          const desc =
            item.scores.find((o) => o.value === v)?.description ?? "";
          return `  - **${item.name}**：${v} — ${desc}`;
        })
        .join("\n");
      return `### ${s.label}（${sectionScores.value[i]} 分）\n${itemLines}`;
    })
    .join("\n\n");
  return `# UPDRS 評估結果\n\n${lines}\n\n---\n## 總分：${totalScore.value}（${severity.value.level}）`;
}

async function copyMarkdown() {
  await navigator.clipboard.writeText(generateMarkdown());
  copied.value = true;
  setTimeout(() => (copied.value = false), 2000);
}

function reset() {
  allItems.forEach((item) => {
    selections.value[item.key] = 0;
  });
  showResults.value = false;
}
</script>

<template>
  <div class="updrs">
    <!-- ── Header ─────────────────────────────────────────────── -->
    <div class="updrs-header">
      <div class="header-title">
        <h2 class="title">UPDRS 巴金森症狀衡量表</h2>
        <p class="subtitle">Unified Parkinson's Disease Rating Scale</p>
      </div>
      <div class="score-badge" :class="'sb-' + severity.color">
        <span class="score-number">{{ totalScore }}</span>
        <span class="score-label">{{ severity.level }}</span>
      </div>
    </div>

    <!-- ── Severity bar ───────────────────────────────────────── -->
    <div class="severity-bar-wrap">
      <div class="severity-bar">
        <div
          class="severity-fill"
          :class="'sf-' + severity.color"
          :style="{ width: Math.min((totalScore / 147) * 100, 100) + '%' }"
        />
      </div>
      <div class="severity-ticks-abs">
        <span class="tick-abs" style="left: 0%">0</span>
        <span class="tick-abs t-mid" style="left: 13.6%">20</span>
        <span class="tick-abs t-mid" style="left: 34%">50</span>
        <span class="tick-abs t-high" style="left: 54.4%">80</span>
        <span class="tick-abs t-high" style="left: 100%">147</span>
      </div>
      <div class="severity-labels-abs">
        <span class="label-abs lbl-low" style="left: 0%">正常</span>
        <span class="label-abs lbl-mid" style="left: 13.6%">輕度</span>
        <span class="label-abs lbl-mid" style="left: 34%">中度</span>
        <span class="label-abs lbl-high" style="left: 54.4%">重度</span>
        <span class="label-abs lbl-high" style="left: 100%">極重度</span>
      </div>
    </div>

    <!-- ── Intro ──────────────────────────────────────────────── -->
    <div class="intro-bar">
      <span class="intro-dot">◉</span>
      <span
        >評估巴金森氏症患者在智能、日常生活、動作功能、藥物併發症等方面的嚴重程度。每題
        0–4 分，共 39 題，總分 0–147 分，分數越高代表症狀越嚴重。</span
      >
    </div>

    <!-- ── Sections ───────────────────────────────────────────── -->
    <div
      v-for="(section, si) in sections"
      :key="section.label"
      class="updrs-section"
    >
      <div class="group-header" :class="section.color + '-header'">
        <div class="group-label-block">
          <span class="group-label">{{ section.label }}</span>
          <span class="group-sub">{{ section.sub }}</span>
        </div>
        <span class="group-score-pill" :class="section.color + '-pill'">
          {{ sectionScores[si] }} / {{ section.max }}
        </span>
      </div>

      <div class="item-list">
        <div
          v-for="item in section.items"
          :key="item.key"
          class="updrs-item"
          :class="{ answered: selections[item.key] > 0 }"
        >
          <div class="item-header">
            <div class="item-meta-row">
              <span class="item-qnum" :class="section.color + '-qnum'"
                >Q{{ qIndex[item.key] }}</span
              >
            </div>
            <div class="item-name-block">
              <span class="item-name">{{ item.name }}</span>
            </div>
            <span
              class="item-score"
              :class="{
                zero: selections[item.key] === 0,
                high: selections[item.key] >= 3,
              }"
            >
              {{ selections[item.key] }}
            </span>
          </div>

          <template
            v-if="
              item.scores.length === 5 &&
              !['q32', 'q33', 'q34', 'q39'].includes(item.key)
            "
          >
            <div class="option-row-5">
              <div class="opt-row-5-top">
                <label
                  v-for="score in item.scores.slice(0, 3)"
                  :key="score.value"
                  class="opt-pill"
                  :class="{
                    active: selections[item.key] === score.value,
                    ['s' + score.value]: true,
                    'opt-wide': score.value === 0,
                  }"
                >
                  <input
                    type="radio"
                    :name="item.key"
                    :value="score.value"
                    v-model="selections[item.key]"
                  />
                  <span class="opt-num">{{ score.value }}</span>
                  <span class="opt-desc">{{ score.description }}</span>
                </label>
              </div>
              <div class="opt-row-5-bot">
                <label
                  v-for="score in item.scores.slice(3)"
                  :key="score.value"
                  class="opt-pill"
                  :class="{
                    active: selections[item.key] === score.value,
                    ['s' + score.value]: true,
                  }"
                >
                  <input
                    type="radio"
                    :name="item.key"
                    :value="score.value"
                    v-model="selections[item.key]"
                  />
                  <span class="opt-num">{{ score.value }}</span>
                  <span class="opt-desc">{{ score.description }}</span>
                </label>
              </div>
            </div>
          </template>
          <div
            v-else
            class="option-row"
            :style="{
              gridTemplateColumns: 'repeat(' + item.scores.length + ', 1fr)',
            }"
          >
            <label
              v-for="score in item.scores"
              :key="score.value"
              class="opt-pill"
              :class="{
                active: selections[item.key] === score.value,
                ['s' + score.value]: true,
              }"
            >
              <input
                type="radio"
                :name="item.key"
                :value="score.value"
                v-model="selections[item.key]"
              />
              <span class="opt-num">{{ score.value }}</span>
              <span class="opt-desc">{{ score.description }}</span>
            </label>
          </div>
        </div>
      </div>
    </div>

    <!-- ── Result card ────────────────────────────────────────── -->
    <div class="updrs-result" :class="'res-' + severity.color">
      <div class="result-left">
        <span class="result-number">{{ totalScore }}</span>
        <span class="result-max">/ 147</span>
      </div>
      <div class="result-right">
        <span class="result-level">{{ severity.level }}</span>
        <div class="result-breakdown">
          <span
            v-for="(s, i) in sections"
            :key="s.label"
            class="breakdown-pill"
            :class="s.color + '-pill-sm'"
          >
            {{ ["I", "II", "III", "IVa", "IVb"][i] }}: {{ sectionScores[i] }}
          </span>
        </div>
      </div>
    </div>

    <!-- ── Results detail ─────────────────────────────────────── -->
    <div v-if="showResults" class="results-detail">
      <div class="results-header">評估明細</div>
      <div v-for="(section, si) in sections" :key="section.label">
        <div class="detail-section-title" :class="section.color + '-section'">
          {{ section.label }}（{{ sectionScores[si] }} 分）
        </div>
        <div v-for="item in section.items" :key="item.key" class="detail-row">
          <span class="detail-qnum">Q{{ qIndex[item.key] }}</span>
          <span class="detail-domain">{{ item.name }}</span>
          <span
            class="detail-score"
            :class="{
              zero: selections[item.key] === 0,
              high: selections[item.key] >= 3,
              brand: selections[item.key] > 0 && selections[item.key] < 3,
            }"
          >
            {{ selections[item.key] }}
          </span>
          <span class="detail-desc">{{
            item.scores.find((s) => s.value === selections[item.key])
              ?.description
          }}</span>
        </div>
      </div>
      <div class="detail-row total-row">
        <span class="detail-qnum"></span>
        <span class="detail-domain">UPDRS 總分</span>
        <span class="detail-score brand">{{ totalScore }} / 147</span>
        <span class="detail-desc">{{ severity.level }}</span>
      </div>
    </div>

    <!-- ── Actions ────────────────────────────────────────────── -->
    <div class="updrs-actions">
      <button class="btn-view" @click="showResults = !showResults">
        {{ showResults ? "收起明細" : "查看評估結果" }}
      </button>
      <button class="btn-copy" @click="copyMarkdown">
        {{ copied ? "已複製 ✓" : "複製 Markdown 結果" }}
      </button>
      <button class="btn-reset" @click="reset">重置</button>
    </div>
  </div>
</template>

<style scoped>
.updrs {
  max-width: 780px;
  margin: 0 auto;
  padding: 2rem 0 3rem;
  font-size: 0.9rem;
}

/* ── Header ────────────────────────────────────────────────────── */
.updrs-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 1.25rem;
  flex-wrap: wrap;
}
.header-title {
  flex: 1;
  min-width: 0;
}
.title {
  font-size: 24px;
  font-weight: 600;
  color: var(--vp-c-text-1);
  margin: 0 0 0.2rem;
  border: none !important;
  padding: 0 !important;
}
.subtitle {
  font-size: 0.78rem;
  color: var(--vp-c-text-3);
  margin: 0;
}

.score-badge {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-width: 80px;
  padding: 0.6rem 1rem;
  border-radius: 14px;
  border: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg-soft);
  transition: all 0.3s;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
}
.score-number {
  font-size: 2rem;
  font-weight: 800;
  line-height: 1;
  transition: color 0.3s;
}
.score-label {
  font-size: 0.68rem;
  font-weight: 600;
  margin-top: 2px;
  letter-spacing: 0.02em;
  text-align: center;
}
.sb-normal {
  border-color: #22c55e;
  color: #22c55e;
  box-shadow:
    0 0 0 1px rgba(34, 197, 94, 0.08),
    0 1px 3px rgba(0, 0, 0, 0.04);
}
.sb-mild {
  border-color: #84cc16;
  color: #84cc16;
  box-shadow:
    0 0 0 1px rgba(132, 204, 22, 0.08),
    0 1px 3px rgba(0, 0, 0, 0.04);
}
.sb-moderate {
  border-color: #f59e0b;
  color: #f59e0b;
  box-shadow:
    0 0 0 1px rgba(245, 158, 11, 0.08),
    0 1px 3px rgba(0, 0, 0, 0.04);
}
.sb-severe {
  border-color: #f97316;
  color: #f97316;
  box-shadow:
    0 0 0 1px rgba(249, 115, 22, 0.08),
    0 1px 3px rgba(0, 0, 0, 0.04);
}
.sb-critical {
  border-color: #ef4444;
  color: #ef4444;
  box-shadow:
    0 0 0 1px rgba(239, 68, 68, 0.08),
    0 1px 3px rgba(0, 0, 0, 0.04);
}

/* ── Severity bar ──────────────────────────────────────────────── */
.severity-bar-wrap {
  margin-bottom: 2.5rem;
}
.severity-bar {
  position: relative;
  height: 8px;
  border-radius: 999px;
  background: var(--vp-c-bg-mute);
  overflow: visible;
  margin-bottom: 4px;
  box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.08);
}
.severity-fill {
  height: 100%;
  border-radius: 999px;
  transition:
    width 0.5s cubic-bezier(0.22, 1, 0.36, 1),
    background 0.3s;
}
.sf-normal {
  background: linear-gradient(90deg, #22c55e, #4ade80);
}
.sf-mild {
  background: linear-gradient(90deg, #84cc16, #a3e635);
}
.sf-moderate {
  background: linear-gradient(90deg, #f59e0b, #fbbf24);
}
.sf-severe {
  background: linear-gradient(90deg, #f97316, #fb923c);
}
.sf-critical {
  background: linear-gradient(90deg, #ef4444, #f87171);
}

.severity-ticks-abs,
.severity-labels-abs {
  position: relative;
  height: 14px;
  margin-top: 2px;
}
.severity-labels-abs {
  margin-top: 0;
  height: 13px;
}
.tick-abs {
  position: absolute;
  transform: translateX(-50%);
  font-size: 0.65rem;
  color: var(--vp-c-text-3);
  white-space: nowrap;
}
.tick-abs[style*="left: 0%"] {
  transform: translateX(0);
}
.tick-abs[style*="left: 100%"] {
  transform: translateX(-100%);
}
.label-abs {
  position: absolute;
  transform: translateX(-50%);
  font-size: 0.63rem;
  color: var(--vp-c-text-3);
  white-space: nowrap;
}
.label-abs[style*="left: 0%"] {
  transform: translateX(0);
}
.label-abs[style*="left: 100%"] {
  transform: translateX(-100%);
}
.lbl-low {
  color: #22c55e;
}
.lbl-mid {
  color: #f59e0b;
}
.lbl-high {
  color: #ef4444;
}
.t-mid {
  color: #f59e0b;
  font-weight: 700;
}
.t-high {
  color: #ef4444;
  font-weight: 700;
}

/* ── Intro ─────────────────────────────────────────────────────── */
.intro-bar {
  display: flex;
  align-items: flex-start;
  gap: 0.6rem;
  padding: 0.75rem 1rem;
  border-radius: 10px;
  background: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-divider);
  border-left: 3px solid var(--vp-c-brand-1);
  font-size: 0.82rem;
  color: var(--vp-c-text-2);
  margin-bottom: 1.5rem;
  line-height: 1.6;
}
.intro-dot {
  color: var(--vp-c-brand-1);
  flex-shrink: 0;
}

/* ── Group ─────────────────────────────────────────────────────── */
.updrs-section {
  margin-bottom: 1.5rem;
}

.group-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  margin-bottom: 0.5rem;
  padding: 0.65rem 0.85rem 0.65rem 1.5rem;
  border-radius: 10px;
  background: linear-gradient(
    135deg,
    rgba(99, 102, 241, 0.08),
    var(--vp-c-bg-mute),
    var(--vp-c-bg-soft)
  );
  border: 1px solid var(--vp-c-divider);
  border-left: 4px solid var(--vp-c-brand-1);
  box-shadow: 0 1px 3px rgba(99, 102, 241, 0.06);
}
.mental-header {
  border-left-color: #8b5cf6;
  background: linear-gradient(
    135deg,
    rgba(139, 92, 246, 0.08),
    var(--vp-c-bg-mute),
    var(--vp-c-bg-soft)
  );
  box-shadow: 0 1px 3px rgba(139, 92, 246, 0.06);
}
.daily-header {
  border-left-color: #f59e0b;
  background: linear-gradient(
    135deg,
    rgba(245, 158, 11, 0.08),
    var(--vp-c-bg-mute),
    var(--vp-c-bg-soft)
  );
  box-shadow: 0 1px 3px rgba(245, 158, 11, 0.06);
}
.motor-header {
  border-left-color: #3b82f6;
  background: linear-gradient(
    135deg,
    rgba(59, 130, 246, 0.08),
    var(--vp-c-bg-mute),
    var(--vp-c-bg-soft)
  );
  box-shadow: 0 1px 3px rgba(59, 130, 246, 0.06);
}
.compla-header {
  border-left-color: #ef4444;
  background: linear-gradient(
    135deg,
    rgba(239, 68, 68, 0.08),
    var(--vp-c-bg-mute),
    var(--vp-c-bg-soft)
  );
  box-shadow: 0 1px 3px rgba(239, 68, 68, 0.06);
}
.complb-header {
  border-left-color: #f97316;
  background: linear-gradient(
    135deg,
    rgba(249, 115, 22, 0.08),
    var(--vp-c-bg-mute),
    var(--vp-c-bg-soft)
  );
  box-shadow: 0 1px 3px rgba(249, 115, 22, 0.06);
}

.group-label-block {
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.group-label {
  font-size: 0.85rem;
  font-weight: 700;
  color: var(--vp-c-text-1);
}
.group-sub {
  font-size: 0.7rem;
  color: var(--vp-c-text-3);
}

.group-score-pill {
  font-size: 0.78rem;
  font-weight: 700;
  padding: 4px 14px;
  border-radius: 999px;
  border: 1px solid rgba(99, 102, 241, 0.25);
  color: var(--vp-c-brand-1);
  background: rgba(99, 102, 241, 0.06);
  white-space: nowrap;
  flex-shrink: 0;
}
.mental-pill.group-score-pill {
  border-color: rgba(139, 92, 246, 0.25);
  color: #8b5cf6;
  background: rgba(139, 92, 246, 0.06);
}
.daily-pill.group-score-pill {
  border-color: rgba(245, 158, 11, 0.25);
  color: #f59e0b;
  background: rgba(245, 158, 11, 0.06);
}
.motor-pill.group-score-pill {
  border-color: rgba(59, 130, 246, 0.25);
  color: #3b82f6;
  background: rgba(59, 130, 246, 0.06);
}
.compla-pill.group-score-pill {
  border-color: rgba(239, 68, 68, 0.25);
  color: #ef4444;
  background: rgba(239, 68, 68, 0.06);
}
.complb-pill.group-score-pill {
  border-color: rgba(249, 115, 22, 0.25);
  color: #f97316;
  background: rgba(249, 115, 22, 0.06);
}

/* ── Item ──────────────────────────────────────────────────────── */
.item-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.updrs-item {
  border: 1px solid var(--vp-c-divider);
  border-radius: 10px;
  background: var(--vp-c-bg-soft);
  overflow: hidden;
  transition:
    border-color 0.25s,
    box-shadow 0.25s;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.03);
}
.updrs-item:hover {
  box-shadow: 0 3px 12px rgba(0, 0, 0, 0.06);
  border-color: var(--vp-c-divider);
}
.updrs-item.answered {
  border-color: rgba(99, 102, 241, 0.3);
}

.item-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  padding: 0.6rem 0.9rem;
  border-bottom: 1px solid var(--vp-c-divider);
  gap: 0.75rem;
}
.item-meta-row {
  display: flex;
  align-items: center;
  flex-shrink: 0;
  padding-top: 3px;
}

.item-qnum {
  font-size: 0.72rem;
  font-weight: 800;
  color: #fff;
  background: linear-gradient(135deg, var(--vp-c-brand-1), #4f46e5);
  padding: 1px 9px;
  border-radius: 999px;
  letter-spacing: 0.04em;
  box-shadow: 0 1px 3px rgba(99, 102, 241, 0.2);
}
.mental-qnum {
  background: linear-gradient(135deg, #8b5cf6, #7c3aed);
  box-shadow: 0 1px 3px rgba(139, 92, 246, 0.2);
}
.daily-qnum {
  background: linear-gradient(135deg, #f59e0b, #d97706);
  box-shadow: 0 1px 3px rgba(245, 158, 11, 0.2);
}
.motor-qnum {
  background: linear-gradient(135deg, #3b82f6, #2563eb);
  box-shadow: 0 1px 3px rgba(59, 130, 246, 0.2);
}
.compla-qnum {
  background: linear-gradient(135deg, #ef4444, #dc2626);
  box-shadow: 0 1px 3px rgba(239, 68, 68, 0.2);
}
.complb-qnum {
  background: linear-gradient(135deg, #f97316, #ea580c);
  box-shadow: 0 1px 3px rgba(249, 115, 22, 0.2);
}

.item-name-block {
  display: flex;
  flex-direction: column;
  gap: 2px;
  flex: 1;
}
.item-name {
  font-size: 0.88rem;
  font-weight: 600;
  color: var(--vp-c-text-1);
}

.item-score {
  font-size: 1.1rem;
  font-weight: 800;
  flex-shrink: 0;
  min-width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  background: var(--vp-c-bg);
  border: 1px solid var(--vp-c-divider);
  transition: all 0.25s;
}
.item-score.zero {
  color: #22c55e;
  border-color: rgba(34, 197, 94, 0.25);
  background: rgba(34, 197, 94, 0.06);
}
.item-score.high {
  color: #ef4444;
  border-color: rgba(239, 68, 68, 0.3);
  background: rgba(239, 68, 68, 0.08);
}

/* ── Option row — dynamic columns ──────────────────────────────── */
.option-row {
  display: grid;
  gap: 2px;
  padding: 3px;
  background: var(--vp-c-bg-mute);
}

.option-row-5 {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 3px;
  background: var(--vp-c-bg-mute);
}

.opt-row-5-top {
  display: grid;
  grid-template-columns: 130px 1fr 1fr;
  gap: 2px;
}

.opt-row-5-bot {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2px;
}

.opt-wide {
  grid-column: 1;
}

.opt-pill {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 0.5rem 0.15rem;
  cursor: pointer;
  transition: all 0.2s;
  text-align: center;
  gap: 4px;
  border-radius: 6px;
  background: var(--vp-c-bg);
  border: 1.5px solid transparent;
}
.opt-pill:hover {
  border-color: var(--vp-c-divider);
  background: var(--vp-c-bg-soft);
}
.opt-pill input[type="radio"] {
  display: none;
}
.opt-num {
  font-size: 0.9rem;
  font-weight: 900;
  transition: color 0.2s;
}
.opt-desc {
  font-size: 0.7rem;
  font-weight: 700;
  line-height: 1.3;
  padding: 0 0.5rem;
  transition: color 0.2s;
}

/* Score-specific colors — s0 through s4 */
.opt-pill.s0 {
  border-color: rgba(34, 197, 94, 0.15);
}
.opt-pill.s0:hover:not(.active),
.opt-pill.s0:focus-within {
  border-color: rgba(34, 197, 94, 0.35);
  background: rgba(34, 197, 94, 0.04);
}
.opt-pill.s0.active {
  border-color: #22c55e;
  background: linear-gradient(
    180deg,
    rgba(34, 197, 94, 0.12),
    rgba(34, 197, 94, 0.06)
  );
  box-shadow: 0 0 0 1px rgba(34, 197, 94, 0.08);
}

.opt-pill.s1 {
  border-color: rgba(132, 204, 22, 0.15);
}
.opt-pill.s1:hover:not(.active),
.opt-pill.s1:focus-within {
  border-color: rgba(132, 204, 22, 0.35);
  background: rgba(132, 204, 22, 0.04);
}
.opt-pill.s1.active {
  border-color: #84cc16;
  background: linear-gradient(
    180deg,
    rgba(132, 204, 22, 0.12),
    rgba(132, 204, 22, 0.06)
  );
  box-shadow: 0 0 0 1px rgba(132, 204, 22, 0.08);
}

.opt-pill.s2 {
  border-color: rgba(234, 179, 8, 0.15);
}
.opt-pill.s2:hover:not(.active),
.opt-pill.s2:focus-within {
  border-color: rgba(234, 179, 8, 0.35);
  background: rgba(234, 179, 8, 0.04);
}
.opt-pill.s2.active {
  border-color: #eab308;
  background: linear-gradient(
    180deg,
    rgba(234, 179, 8, 0.12),
    rgba(234, 179, 8, 0.06)
  );
  box-shadow: 0 0 0 1px rgba(234, 179, 8, 0.08);
}

.opt-pill.s3 {
  border-color: rgba(245, 158, 11, 0.15);
}
.opt-pill.s3:hover:not(.active),
.opt-pill.s3:focus-within {
  border-color: rgba(245, 158, 11, 0.35);
  background: rgba(245, 158, 11, 0.04);
}
.opt-pill.s3.active {
  border-color: #f59e0b;
  background: linear-gradient(
    180deg,
    rgba(245, 158, 11, 0.12),
    rgba(245, 158, 11, 0.06)
  );
  box-shadow: 0 0 0 1px rgba(245, 158, 11, 0.08);
}

.opt-pill.s4 {
  border-color: rgba(239, 68, 68, 0.15);
}
.opt-pill.s4:hover:not(.active),
.opt-pill.s4:focus-within {
  border-color: rgba(239, 68, 68, 0.35);
  background: rgba(239, 68, 68, 0.04);
}
.opt-pill.s4.active {
  border-color: #ef4444;
  background: linear-gradient(
    180deg,
    rgba(239, 68, 68, 0.12),
    rgba(239, 68, 68, 0.06)
  );
  box-shadow: 0 0 0 1px rgba(239, 68, 68, 0.08);
}

.opt-pill.s0 .opt-num {
  color: rgba(34, 197, 94, 0.5);
}
.opt-pill.s0.active .opt-num {
  color: #22c55e;
}
.opt-pill.s0 .opt-desc {
  color: rgba(34, 197, 94, 0.4);
}
.opt-pill.s0.active .opt-desc {
  color: rgba(34, 197, 94, 0.7);
}

.opt-pill.s1 .opt-num {
  color: rgba(132, 204, 22, 0.5);
}
.opt-pill.s1.active .opt-num {
  color: #84cc16;
}
.opt-pill.s1 .opt-desc {
  color: rgba(132, 204, 22, 0.4);
}
.opt-pill.s1.active .opt-desc {
  color: rgba(132, 204, 22, 0.7);
}

.opt-pill.s2 .opt-num {
  color: rgba(234, 179, 8, 0.5);
}
.opt-pill.s2.active .opt-num {
  color: #eab308;
}
.opt-pill.s2 .opt-desc {
  color: rgba(234, 179, 8, 0.4);
}
.opt-pill.s2.active .opt-desc {
  color: rgba(234, 179, 8, 0.7);
}

.opt-pill.s3 .opt-num {
  color: rgba(245, 158, 11, 0.5);
}
.opt-pill.s3.active .opt-num {
  color: #f59e0b;
}
.opt-pill.s3 .opt-desc {
  color: rgba(245, 158, 11, 0.4);
}
.opt-pill.s3.active .opt-desc {
  color: rgba(245, 158, 11, 0.7);
}

.opt-pill.s4 .opt-num {
  color: rgba(239, 68, 68, 0.5);
}
.opt-pill.s4.active .opt-num {
  color: #ef4444;
}
.opt-pill.s4 .opt-desc {
  color: rgba(239, 68, 68, 0.4);
}
.opt-pill.s4.active .opt-desc {
  color: rgba(239, 68, 68, 0.7);
}

/* ── Result card ───────────────────────────────────────────────── */
.updrs-result {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  padding: 1.25rem 1.5rem;
  border-radius: 14px;
  border: 1px solid var(--vp-c-divider);
  background: linear-gradient(135deg, var(--vp-c-bg-soft), var(--vp-c-bg-mute));
  margin-bottom: 1rem;
  flex-wrap: wrap;
  transition: all 0.3s;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
}
.res-normal {
  border-color: #22c55e;
  box-shadow:
    0 0 0 1px rgba(34, 197, 94, 0.06),
    0 1px 3px rgba(0, 0, 0, 0.04);
}
.res-mild {
  border-color: #84cc16;
  box-shadow:
    0 0 0 1px rgba(132, 204, 22, 0.06),
    0 1px 3px rgba(0, 0, 0, 0.04);
}
.res-moderate {
  border-color: #f59e0b;
  box-shadow:
    0 0 0 1px rgba(245, 158, 11, 0.06),
    0 1px 3px rgba(0, 0, 0, 0.04);
}
.res-severe {
  border-color: #f97316;
  box-shadow:
    0 0 0 1px rgba(249, 115, 22, 0.06),
    0 1px 3px rgba(0, 0, 0, 0.04);
}
.res-critical {
  border-color: #ef4444;
  box-shadow:
    0 0 0 1px rgba(239, 68, 68, 0.06),
    0 1px 3px rgba(0, 0, 0, 0.04);
}

.result-left {
  display: flex;
  align-items: baseline;
  gap: 4px;
  flex-shrink: 0;
}
.result-number {
  font-size: 3.5rem;
  font-weight: 800;
  line-height: 1;
  color: var(--vp-c-text-3);
  transition: color 0.3s;
}
.res-normal .result-number {
  color: #22c55e;
}
.res-mild .result-number {
  color: #84cc16;
}
.res-moderate .result-number {
  color: #f59e0b;
}
.res-severe .result-number {
  color: #f97316;
}
.res-critical .result-number {
  color: #ef4444;
}

.result-max {
  font-size: 1rem;
  color: var(--vp-c-text-3);
}
.result-right {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.result-level {
  font-size: 1rem;
  font-weight: 700;
  color: var(--vp-c-text-1);
}

.result-breakdown {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}
.breakdown-pill {
  font-size: 0.72rem;
  font-weight: 700;
  padding: 2px 10px;
  border-radius: 999px;
}
.mental-pill-sm {
  background: rgba(139, 92, 246, 0.1);
  color: #8b5cf6;
  border: 1px solid rgba(139, 92, 246, 0.3);
}
.daily-pill-sm {
  background: rgba(245, 158, 11, 0.1);
  color: #f59e0b;
  border: 1px solid rgba(245, 158, 11, 0.3);
}
.motor-pill-sm {
  background: rgba(59, 130, 246, 0.1);
  color: #3b82f6;
  border: 1px solid rgba(59, 130, 246, 0.3);
}
.compla-pill-sm {
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
  border: 1px solid rgba(239, 68, 68, 0.3);
}
.complb-pill-sm {
  background: rgba(249, 115, 22, 0.1);
  color: #f97316;
  border: 1px solid rgba(249, 115, 22, 0.3);
}

/* ── Results detail ────────────────────────────────────────────── */
.results-detail {
  border: 1px solid var(--vp-c-divider);
  border-radius: 10px;
  overflow: hidden;
  margin-bottom: 1rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.03);
}
.results-header {
  padding: 0.5rem 0.9rem;
  font-size: 0.72rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--vp-c-text-3);
  background: var(--vp-c-bg-mute);
  border-bottom: 1px solid var(--vp-c-divider);
}
.detail-section-title {
  padding: 0.4rem 0.9rem;
  font-size: 0.75rem;
  font-weight: 700;
  border-bottom: 1px solid var(--vp-c-divider);
}
.mental-section {
  color: #8b5cf6;
  background: rgba(139, 92, 246, 0.06);
}
.daily-section {
  color: #f59e0b;
  background: rgba(245, 158, 11, 0.06);
}
.motor-section {
  color: #3b82f6;
  background: rgba(59, 130, 246, 0.06);
}
.compla-section {
  color: #ef4444;
  background: rgba(239, 68, 68, 0.06);
}
.complb-section {
  color: #f97316;
  background: rgba(249, 115, 22, 0.06);
}

.detail-row {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.5rem 0.9rem;
  border-bottom: 1px solid var(--vp-c-divider);
}
.detail-row:last-child {
  border-bottom: none;
}
.total-row {
  background: linear-gradient(135deg, var(--vp-c-bg-mute), var(--vp-c-bg-soft));
  font-weight: 800;
}

.detail-qnum {
  font-size: 0.7rem;
  font-weight: 800;
  color: var(--vp-c-brand-1);
  flex-shrink: 0;
  width: 32px;
}
.detail-domain {
  font-size: 0.8rem;
  font-weight: 700;
  color: var(--vp-c-text-1);
  flex: 1;
}
.detail-score {
  font-size: 0.82rem;
  font-weight: 800;
  flex-shrink: 0;
  width: 48px;
  text-align: right;
}
.detail-score.zero {
  color: var(--vp-c-text-3);
}
.detail-score.high {
  color: #ef4444;
}
.detail-score.brand {
  color: var(--vp-c-brand-1);
}
.detail-desc {
  font-size: 0.75rem;
  color: var(--vp-c-text-2);
  flex: 1;
  text-align: left;
}

/* ── Actions ───────────────────────────────────────────────────── */
.updrs-actions {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
}
.btn-view,
.btn-copy,
.btn-reset {
  padding: 9px 22px;
  border-radius: 8px;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  font-family: inherit;
  transition: all 0.2s;
}
.btn-view {
  border: none;
  background: linear-gradient(135deg, var(--vp-c-brand-1), #4f46e5);
  color: #fff;
  box-shadow: 0 2px 8px rgba(99, 102, 241, 0.3);
}
.btn-view:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 14px rgba(99, 102, 241, 0.4);
}
.btn-view:active {
  transform: translateY(0);
}
.btn-copy {
  border: 1.5px solid var(--vp-c-brand-1);
  background: transparent;
  color: var(--vp-c-brand-1);
}
.btn-copy:hover {
  background: var(--vp-c-brand-soft);
}
.btn-reset {
  border: 1px solid var(--vp-c-divider);
  background: transparent;
  color: var(--vp-c-text-2);
}
.btn-reset:hover {
  border-color: #ef4444;
  color: #ef4444;
  background: rgba(239, 68, 68, 0.04);
}

@media (max-width: 640px) {
  .updrs-header {
    flex-direction: column;
  }
  .score-badge {
    flex-direction: row;
    gap: 0.5rem;
    align-self: flex-start;
  }
  .score-number {
    font-size: 1.5rem;
  }
  .updrs-result {
    flex-direction: column;
    gap: 0.75rem;
  }
  .severity-labels-abs {
    display: none;
  }
  .detail-desc {
    width: 52px;
  }
  .option-row {
    grid-template-columns: repeat(3, 1fr) !important;
  }
  .opt-pill:nth-child(3) {
    border-right: none;
  }
  .opt-pill:nth-child(3) ~ .opt-pill {
    border-top: 1px solid var(--vp-c-divider);
  }
}
</style>
