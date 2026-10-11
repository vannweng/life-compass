/**
 * @description 每日一問題庫：以低門檻問題引導使用者覺察自己
 * @module models/DailyQuestionModel
 */

/** @description 問題主題 */
export type QuestionTheme = 'energy' | 'values' | 'curiosity' | 'reflection' | 'time';

/**
 * @description 每日一問
 */
export interface DailyQuestion {
  id: string;
  text: string;
  /** 歷史紀錄中顯示的精簡問句 */
  shortText: string;
  theme: QuestionTheme;
}

/** @description 主題中文標籤 */
export const QUESTION_THEME_LABELS: Record<QuestionTheme, string> = {
  energy: '能量',
  values: '價值',
  curiosity: '好奇',
  reflection: '反思',
  time: '時間',
};

/** @description 每日一問題庫 */
export const DAILY_QUESTIONS: readonly DailyQuestion[] = [
  { id: 'q01', theme: 'energy', text: '今天哪個時刻，你忘記了看時間？', shortText: '忘記時間的時刻？' },
  { id: 'q02', theme: 'energy', text: '今天做的哪件事，讓你覺得被消耗？', shortText: '今天什麼最耗能？' },
  { id: 'q03', theme: 'energy', text: '今天和誰相處後，你感覺比較有精神？', shortText: '和誰相處更有精神？' },
  { id: 'q04', theme: 'energy', text: '如果明天可以只做一件事，你會選什麼？', shortText: '明天只做一件事？' },
  { id: 'q05', theme: 'values', text: '今天有什麼事讓你覺得「這樣做是對的」？', shortText: '今天什麼事做對了？' },
  { id: 'q06', theme: 'values', text: '最近你羨慕過誰？你羨慕的是他的什麼？', shortText: '最近羨慕誰的什麼？' },
  { id: 'q07', theme: 'values', text: '今天有沒有一刻，你在做違心的事？', shortText: '今天有做違心的事嗎？' },
  { id: 'q08', theme: 'values', text: '你希望別人在你背後怎麼形容你？', shortText: '希望別人怎麼形容你？' },
  { id: 'q09', theme: 'curiosity', text: '今天有什麼東西讓你想多查一下？', shortText: '今天想多了解什麼？' },
  { id: 'q10', theme: 'curiosity', text: '小時候你最常玩什麼？現在還想玩嗎？', shortText: '小時候最愛玩什麼？' },
  { id: 'q11', theme: 'curiosity', text: '有沒有一個工作或生活方式，你一直好奇但沒試過？', shortText: '有什麼生活想試試？' },
  { id: 'q12', theme: 'curiosity', text: '如果有一年不用為錢工作，你會怎麼過？', shortText: '不用為錢工作會怎麼過？' },
  { id: 'q13', theme: 'reflection', text: '今天你做得不錯的一件小事是什麼？', shortText: '今天做得不錯的小事？' },
  { id: 'q14', theme: 'reflection', text: '今天你在逃避什麼？', shortText: '今天在逃避什麼？' },
  { id: 'q15', theme: 'reflection', text: '一年前的你，會對今天的你說什麼？', shortText: '一年前的你會說什麼？' },
  { id: 'q16', theme: 'reflection', text: '今天有什麼值得感謝的人或事？', shortText: '今天感謝什麼？' },
  { id: 'q17', theme: 'time', text: '今天的時間，有多少是你自己選擇怎麼用的？', shortText: '今天多少時間自己作主？' },
  { id: 'q18', theme: 'time', text: '如果只剩一年，今天的哪件事你還會做？', shortText: '只剩一年還會做什麼？' },
  { id: 'q19', theme: 'time', text: '你最近一次「期待明天」是什麼時候？', shortText: '最近何時期待明天？' },
  { id: 'q20', theme: 'time', text: '十年後回想今天，你希望記得什麼？', shortText: '十年後希望記得什麼？' },
  { id: 'q21', theme: 'energy', text: '今天身體最舒服的時刻是在做什麼？', shortText: '身體最舒服的時刻？' },
  { id: 'q22', theme: 'values', text: '有什麼事情就算沒人看到，你也想做好？', shortText: '沒人看到也想做好什麼？' },
  { id: 'q23', theme: 'curiosity', text: '最近收藏或存起來的內容，大多和什麼有關？', shortText: '最近收藏都關於什麼？' },
  { id: 'q24', theme: 'reflection', text: '今天有沒有哪個瞬間，你覺得「這就是我」？', shortText: '今天哪一刻最像自己？' },
];
