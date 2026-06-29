import type { MoodValue } from "../types"

export const moodQuotes: Record<MoodValue, { en: string[]; da: string[] }> = {
  great: {
    en: [
      "Savor this. Days like today are worth remembering.",
      "Joy shared is joy doubled — tell someone about it.",
    ],
    da: [
      "این لحظه را با تمام وجود حس کنید. روزهایی مثل امروز ارزش به‌یادماندن دارند.",
      "شادی‌ای که با دیگران شریک شود، دوچندان می‌شود.",
    ],
  },
  good: {
    en: [
      "Good days build good weeks. Notice what worked.",
      "Small wins add up — keep going.",
    ],
    da: [
      "روزهای خوب، هفته‌های خوب می‌سازند. به آنچه خوب پیش رفت توجه کنید.",
      "پیروزی‌های کوچک جمع می‌شوند — ادامه دهید.",
    ],
  },
  okay: {
    en: [
      "Okay is a fine place to be. Not every day needs to be remarkable.",
      "Steady is its own kind of progress.",
    ],
    da: [
      "معمولی بودن هم خوب است. هر روز لازم نیست خاص باشد.",
      "ثبات، خودش نوعی پیشرفت است.",
    ],
  },
  low: {
    en: [
      "This feeling is real, but it isn't permanent.",
      "Be as kind to yourself as you would be to a friend feeling this way.",
      "You don't have to fix it today — just notice it.",
    ],
    da: [
      "این احساس واقعی است، اما همیشگی نیست.",
      "همان‌قدر که با یک دوست مهربان هستید، با خودتان هم مهربان باشید.",
      "لازم نیست امروز حلش کنید — فقط آن را ببینید.",
    ],
  },
  rough: {
    en: [
      "Rough days pass. You have survived hard days before — you will again.",
      "It's okay to ask for help. You don't have to carry this alone.",
      "Breathe. One slow breath. That's enough for now.",
    ],
    da: [
      "روزهای سخت می‌گذرند. شما قبلاً هم روزهای سخت را پشت سر گذاشته‌اید — این‌بار هم می‌گذرانید.",
      "اشکالی ندارد کمک بخواهید. لازم نیست این بار را تنها به دوش بکشید.",
      "نفس بکشید. یک نفس آرام. همین برای الان کافی است.",
    ],
  },
}

export const moodActivities: Record<MoodValue, { en: string[]; da: string[] }> = {
  great: {
    en: ["Write down what made today great so you can return to it later."],
    da: ["بنویسید چه چیزی امروز را عالی ساخت تا بعداً بتوانید به آن برگردید."],
  },
  good: {
    en: ["Send a kind message to someone who helped your day."],
    da: ["یک پیام مهربان به کسی بفرستید که به روزتان کمک کرد."],
  },
  okay: {
    en: ["Step outside for five minutes, even just to look at the sky."],
    da: ["برای پنج دقیقه بیرون بروید، حتی فقط برای نگاه کردن به آسمان."],
  },
  low: {
    en: ["Drink a glass of water, stretch, and write three sentences about today."],
    da: ["یک لیوان آب بنوشید، کمی بدن را بکشید و سه جمله دربارهٔ امروز بنویسید."],
  },
  rough: {
    en: ["Reach out to one person you trust — even just to say hello."],
    da: ["به یک نفر که به او اعتماد دارید پیام بدهید — حتی فقط برای سلام گفتن."],
  },
}

export type PromptCategory = "day" | "personal" | "work" | "gratitude" | "future"

export interface PromptItem {
  en: string
  da: string
  category: PromptCategory
}

export const promptLibrary: PromptItem[] = [
  // day — what happened today
  { en: "How was your day, really?", da: "امروز واقعاً چطور بود؟", category: "day" },
  { en: "What challenged you today?", da: "امروز چه چیزی برایتان چالش‌برانگیز بود؟", category: "day" },
  { en: "What made you smile today?", da: "امروز چه چیزی شما را لبخند زد؟", category: "day" },
  { en: "Who made a difference in your day?", da: "چه کسی در روز شما تفاوتی ایجاد کرد؟", category: "day" },
  { en: "What surprised you today?", da: "امروز چه چیزی شما را شگفت‌زده کرد؟", category: "day" },
  { en: "What's one moment from today you want to remember?", da: "چه لحظه‌ای از امروز را می‌خواهید به‌خاطر بسپارید؟", category: "day" },
  { en: "What did you eat, see, or hear today that stuck with you?", da: "امروز چه چیزی خوردید، دیدید یا شنیدید که در ذهنتان ماند؟", category: "day" },
  { en: "If today had a title, what would it be?", da: "اگر امروز یک عنوان داشت، چه می‌بود؟", category: "day" },
  { en: "What's something you said today that you keep thinking about?", da: "امروز چه چیزی گفتید که هنوز به آن فکر می‌کنید؟", category: "day" },
  { en: "What energy did you bring into the world today?", da: "امروز چه انرژی‌ای به دنیا بخشیدید؟", category: "day" },

  // personal — inner life, feelings, relationships
  { en: "What is one thing you'd like to let go of?", da: "یک چیزی که می‌خواهید رهایش کنید چیست؟", category: "personal" },
  { en: "What does your inner voice sound like right now?", da: "صدای درونتان الان چه می‌گوید؟", category: "personal" },
  { en: "Who do you miss, and why?", da: "دلتان برای چه کسی تنگ شده و چرا؟", category: "personal" },
  { en: "What's a fear you've been carrying lately?", da: "این روزها چه ترسی را با خود حمل می‌کنید؟", category: "personal" },
  { en: "When did you last feel truly at peace?", da: "آخرین بار چه زمانی واقعاً آرام بودید؟", category: "personal" },
  { en: "What part of yourself are you still getting to know?", da: "هنوز در حال شناختن چه بخشی از خودتان هستید؟", category: "personal" },
  { en: "What boundary do you need to set, with someone or with yourself?", da: "چه مرزی نیاز است تعیین کنید، با دیگران یا با خودتان؟", category: "personal" },
  { en: "What would you tell yourself from five years ago?", da: "به خودِ پنج سال پیشتان چه می‌گفتید؟", category: "personal" },
  { en: "What's something you've never told anyone?", da: "چیزی هست که هیچ‌وقت به کسی نگفته‌اید؟", category: "personal" },
  { en: "What does rest actually look like for you?", da: "استراحت واقعی برای شما چه شکلی است؟", category: "personal" },

  // work — career, projects, focus
  { en: "What did you work on today?", da: "امروز روی چه چیزی کار کردید؟", category: "work" },
  { en: "What's the hardest part of your work right now?", da: "سخت‌ترین بخش کار شما در حال حاضر چیست؟", category: "work" },
  { en: "What would make tomorrow's work easier?", da: "چه چیزی کار فردا را آسان‌تر می‌کند؟", category: "work" },
  { en: "What's a small win at work you haven't celebrated yet?", da: "موفقیت کوچکی در کار که هنوز جشن نگرفته‌اید چیست؟", category: "work" },
  { en: "Who at work do you wish you understood better?", da: "در محل کار، می‌خواهید چه کسی را بهتر بشناسید؟", category: "work" },
  { en: "What skill do you want to get better at this month?", da: "این ماه می‌خواهید در چه مهارتی بهتر شوید؟", category: "work" },
  { en: "What task have you been avoiding, and why?", da: "از انجام چه کاری طفره رفته‌اید و چرا؟", category: "work" },
  { en: "What does a good day at work feel like for you?", da: "یک روز خوب در محل کار برای شما چه حسی دارد؟", category: "work" },

  // gratitude / reflection
  { en: "What's something you're looking forward to?", da: "چه چیزی هست که منتظرش هستید؟", category: "gratitude" },
  { en: "What's a small comfort you're grateful for right now?", da: "چه آرامش کوچکی را در حال حاضر قدردانید؟", category: "gratitude" },
  { en: "Who has shaped who you are, in a way they don't know?", da: "چه کسی شما را شکل داده، بدون آنکه خودش بداند؟", category: "gratitude" },
  { en: "What's something ordinary that you'd miss if it were gone?", da: "چه چیز معمولی‌ای هست که اگر نبود دلتنگش می‌شدید؟", category: "gratitude" },

  // future / creative
  { en: "What does a good year from now look like?", da: "یک سال خوب از الان به بعد چه شکلی است؟", category: "future" },
  { en: "If you could start over on one thing, what would it be?", da: "اگر می‌توانستید یک چیز را از نو شروع کنید، چه بود؟", category: "future" },
  { en: "What's a dream you haven't said out loud yet?", da: "رویایی که هنوز با صدای بلند نگفته‌اید چیست؟", category: "future" },
  { en: "What would you do this week if you weren't afraid?", da: "اگر نمی‌ترسیدید، این هفته چه می‌کردید؟", category: "future" },
]

export const dailyPrompts: { en: string; da: string }[] = promptLibrary.map(({ en, da }) => ({ en, da }))

export const writeIdeas: { en: string; da: string }[] = [
  { en: "story", da: "داستان" },
  { en: "memory", da: "خاطره" },
  { en: "letter", da: "نامه" },
  { en: "poem", da: "شعر" },
  { en: "plan", da: "برنامه" },
  { en: "list", da: "فهرست" },
  { en: "reflection", da: "تأمل" },
  { en: "dream", da: "رویا" },
  { en: "scene", da: "صحنه" },
  { en: "song", da: "ترانه" },
  { en: "thank-you note", da: "یادداشت سپاسگزاری" },
  { en: "confession", da: "اعتراف" },
]

export function pickOfTheDay<T>(list: T[]): T {
  const day = Math.floor(Date.now() / 86400000)
  return list[day % list.length]
}
