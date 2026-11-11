// 第 4 區「鏡前的自己」：特質清單（優點與缺點混在一起，畫面上不標示）
// flip：缺點在鏡子裡翻過來的樣子 [新的詞, 一句說明]
export const TRAITS = [
  { id: 'gentle', label: '溫柔' }, { id: 'sensitive', label: '敏感', flip: ['細膩', '你感覺得到別人沒說出口的事。'] },
  { id: 'careful', label: '細心' }, { id: 'overthink', label: '想太多', flip: ['考慮周到', '你總是先替別人想好。'] },
  { id: 'responsible', label: '負責' }, { id: 'unsure', label: '沒自信', flip: ['謙虛', '你從來不把自己的好當作理所當然。'] },
  { id: 'kind', label: '善良' }, { id: 'tough_act', label: '愛逞強', flip: ['負責', '你不想讓在乎的人擔心。'] },
  { id: 'patient', label: '有耐心' }, { id: 'stubborn', label: '固執', flip: ['有原則', '你知道自己在乎的是什麼。'] },
  { id: 'funny', label: '幽默' }, { id: 'anxious', label: '容易焦慮', flip: ['在乎', '因為你很認真看待每一件事。'] },
  { id: 'sincere', label: '真誠' }, { id: 'perfectionist', label: '完美主義', flip: ['用心', '你想把每件事都做到最好。'] },
  { id: 'listener', label: '願意傾聽' }, { id: 'cant_say_no', label: '不會拒絕', flip: ['善良', '你不忍心讓別人失望。'] },
  { id: 'caring', label: '會照顧人' }, { id: 'others_eyes', label: '太在意別人的眼光', flip: ['重視關係', '你希望身邊的人都好好的。'] },
  { id: 'hardworking', label: '努力' }, { id: 'soft_hearted', label: '容易心軟', flip: ['溫柔', '你總是先選擇原諒。'] },
  { id: 'empathy', label: '有同理心' }, { id: 'slow_warm', label: '慢熟', flip: ['真誠', '你只把心交給真正的朋友。'] },
  { id: 'reliable', label: '可靠' }, { id: 'worrier', label: '愛操心', flip: ['照顧', '你把別人的事當成自己的事。'] },
  { id: 'optimistic', label: '樂觀' }, { id: 'emotional', label: '情緒化', flip: ['真實', '你沒有把自己藏起來。'] },
  { id: 'brave', label: '勇敢' }, { id: 'procrastinate', label: '拖延', flip: ['謹慎', '你想等到準備好了再出發。'] },
  { id: 'principled', label: '有原則' }, { id: 'pessimistic', label: '悲觀', flip: ['務實', '你總是先替最壞的情況做好準備。'] },
  { id: 'trustworthy', label: '守信用' }, { id: 'stubborn_mouth', label: '嘴硬', flip: ['堅強', '你不輕易讓人看見你的傷。'] },
  { id: 'considerate', label: '體貼' }, { id: 'tired', label: '容易累', flip: ['盡力', '因為你每一次都用盡了全力。'] },
  { id: 'earnest', label: '認真' }, { id: 'care_too_much', label: '太在乎', flip: ['深情', '你愛得很認真。'] },
  { id: 'independent', label: '獨立' }, { id: 'indecisive', label: '猶豫不決', flip: ['周全', '你想選一個不會傷害任何人的答案。'] },
  { id: 'curious', label: '好奇' }, { id: 'fear_fail', label: '害怕失敗', flip: ['珍惜', '因為你很想把它做好。'] },
  { id: 'creative', label: '有創意' }, { id: 'quiet', label: '不擅表達', flip: ['用行動說話', '你做的，比說的多。'] },
  { id: 'resilient', label: '能吃苦' }, { id: 'high_standard', label: '自我要求高', flip: ['上進', '你一直想成為更好的人。'] },
  { id: 'devoted', label: '重感情' }, { id: 'lonely', label: '怕孤單', flip: ['重視陪伴', '你知道有人在身邊有多珍貴。'] },
  { id: 'tactful', label: '懂分寸' }, { id: 'apologize', label: '常常說對不起', flip: ['體貼', '你總是先想到別人的感受。'] },
];
export const TRAIT_BY_ID = Object.fromEntries(TRAITS.map((t) => [t.id, t]));
