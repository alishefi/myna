import type { Lang, LetterRecipient, Note } from "../types"

interface Bi {
  en: string
  da: string
}

export const letterPrompts: Record<LetterRecipient, Bi[]> = {
  pastSelf: [
    { en: "What do you wish you'd known back then?", da: "چه چیزی را آرزو می‌کنید آن‌زمان می‌دانستید؟" },
    { en: "What were you most afraid of, and how did it turn out?", da: "از چه چیزی بیشتر از همه می‌ترسیدید، و نتیجه‌اش چه شد؟" },
    { en: "Tell your past self about the day everything started to change.", da: "برای خودِ گذشته‌تان از روزی بگویید که همه‌چیز شروع به تغییر کرد." },
    { en: "What would you forgive yourself for, if you could?", da: "اگر می‌توانستید، خودتان را برای چه چیزی می‌بخشیدید؟" },
    { en: "Describe the version of you that existed before this year.", da: "نسخه‌ای از خودتان را که پیش از این سال وجود داشت توصیف کنید." },
    { en: "What small decision back then changed everything?", da: "چه تصمیم کوچکی در آن‌زمان همه‌چیز را تغییر داد؟" },
    { en: "What do you miss about who you used to be?", da: "دلتان برای چه چیزی از کسی که قبلاً بودید تنگ شده؟" },
    { en: "What were you trying so hard to prove?", da: "می‌خواستید چه چیزی را به‌سختی ثابت کنید؟" },
    { en: "Tell your past self what you know now about love.", da: "آنچه اکنون درباره عشق می‌دانید را به خودِ گذشته‌تان بگویید." },
    { en: "What advice would have actually helped, instead of the advice you got?", da: "به‌جای آن نصیحتی که گرفتید، چه نصیحتی واقعاً کمک می‌کرد؟" },
    { en: "What did you survive that you never talk about?", da: "از چه چیزی جان به‌در بردید که هیچ‌وقت درباره‌اش حرف نمی‌زنید؟" },
    { en: "Write about the last ordinary day before everything shifted.", da: "درباره آخرین روز عادی پیش از تغییر همه‌چیز بنویسید." },
  ],
  futureSelf: [
    { en: "What do you hope is different about your life a year from now?", da: "امیدوارید یک سال دیگر چه چیزی در زندگی‌تان فرق کرده باشد؟" },
    { en: "What are you hoping you'll have let go of by then?", da: "امیدوارید تا آن‌زمان چه چیزی را کنار گذاشته باشید؟" },
    { en: "Describe the morning you want to wake up to someday.", da: "صبحی را که می‌خواهید روزی با آن بیدار شوید توصیف کنید." },
    { en: "What promise do you want to have kept to yourself?", da: "می‌خواهید به چه قولی به خودتان وفا کرده باشید؟" },
    { en: "What do you want future you to remember about this exact moment?", da: "می‌خواهید خودِ آینده‌تان از همین لحظه چه چیزی به‌خاطر بسپارد؟" },
    { en: "What's the bravest thing you hope you've done by then?", da: "شجاعانه‌ترین کاری که امید دارید تا آن‌زمان انجام داده باشید چیست؟" },
    { en: "Tell your future self what you're scared you'll forget.", da: "به خودِ آینده‌تان بگویید از فراموش‌کردن چه چیزی می‌ترسید." },
    { en: "What do you want to ask the version of you who made it through?", da: "از نسخه‌ای از خودتان که از این دوران گذشت چه می‌خواهید بپرسید؟" },
    { en: "Describe the person you're hoping to become.", da: "کسی را که امید دارید بشوید توصیف کنید." },
    { en: "What's one thing you never want future you to stop doing?", da: "چه کاری هست که هیچ‌وقت نمی‌خواهید خودِ آینده‌تان متوقفش کند؟" },
    { en: "What do you want to have learned to stop apologizing for?", da: "می‌خواهید یاد گرفته باشید دیگر برای چه چیزی عذرخواهی نکنید؟" },
    { en: "Write the pep talk you'll need on a hard day ahead.", da: "دلگرمی‌ای را بنویسید که در یک روز سخت پیش‌رو به آن نیاز خواهید داشت." },
  ],
  someoneIMiss: [
    { en: "What's the thing you never got to say to them?", da: "چه چیزی هست که هیچ‌وقت فرصت نکردید به او بگویید؟" },
    { en: "Describe the last good day you remember together.", da: "آخرین روز خوبی را که با هم داشتید توصیف کنید." },
    { en: "What do you wish they knew about how much they mattered?", da: "آرزو می‌کنید چه می‌دانست که چقدر برایتان مهم بود؟" },
    { en: "What small, ordinary memory of them won't leave you?", da: "چه خاطره کوچک و عادی‌ای از او دست از سرتان برنمی‌دارد؟" },
    { en: "Tell them what's changed since they've been gone.", da: "به او بگویید از وقتی نیست چه چیزی تغییر کرده." },
    { en: "What do you want to ask them, even knowing they can't answer?", da: "با اینکه می‌دانید نمی‌تواند پاسخ دهد، چه می‌خواهید از او بپرسید؟" },
    { en: "What did they teach you without knowing they were teaching you?", da: "بدون اینکه بداند، چه چیزی به شما آموخت؟" },
    { en: "Describe their laugh, their voice, the way they said your name.", da: "خندیدنش، صدایش، طرز گفتنِ نامتان را توصیف کنید." },
    { en: "What do you do now that reminds you of them?", da: "الان چه کاری می‌کنید که او را به‌خاطرتان می‌آورد؟" },
    { en: "Tell them about the life update they're missing.", da: "درباره تغییرات زندگی‌ای که از دستش داده برایش بگویید." },
    { en: "What do you wish you'd asked them while you had the chance?", da: "آرزو می‌کنید چه چیزی را وقتی فرصت داشتید از او می‌پرسیدید؟" },
    { en: "Write about the smell, song, or place that brings them back.", da: "درباره بویی، آهنگی یا مکانی بنویسید که او را برمی‌گرداند." },
  ],
  someoneWhoHurtMe: [
    { en: "What did you need to hear from them that you never got?", da: "چه چیزی نیاز داشتید از او بشنوید که هیچ‌وقت نشنیدید؟" },
    { en: "What are you still carrying that belongs to them, not you?", da: "هنوز چه چیزی را حمل می‌کنید که به او تعلق دارد، نه به شما؟" },
    { en: "Tell them exactly what happened, without softening it.", da: "بدون نرم‌کردنش، دقیقاً بگویید چه اتفاقی افتاد." },
    { en: "What do you wish you'd said in the moment instead of staying quiet?", da: "آرزو می‌کنید به‌جای سکوت، در آن لحظه چه می‌گفتید؟" },
    { en: "What would it take for you to actually let this go?", da: "چه چیزی لازم است تا واقعاً این را کنار بگذارید؟" },
    { en: "Describe the version of yourself before they hurt you.", da: "نسخه‌ای از خودتان را پیش از آنکه او شما را آزرده کند توصیف کنید." },
    { en: "What do you want them to understand about the damage?", da: "می‌خواهید درباره آسیبی که زده چه چیزی را بفهمد؟" },
    { en: "What boundary do you wish you'd set sooner?", da: "آرزو می‌کنید چه مرزی را زودتر تعیین کرده بودید؟" },
    { en: "Tell them what you've built despite what they did.", da: "به او بگویید با وجود کاری که کرد، چه چیزی ساخته‌اید." },
    { en: "What would an apology from them even sound like, in your head?", da: "عذرخواهی او در ذهن شما چه شکلی داشت؟" },
    { en: "What are you done waiting for them to say?", da: "از منتظر ماندن برای شنیدن چه چیزی از او خسته شده‌اید؟" },
    { en: "Write the angriest, most honest version of this letter — you don't have to send it.", da: "خشمگین‌ترین و صادقانه‌ترین نسخه این نامه را بنویسید — لازم نیست بفرستیدش." },
  ],
  someoneILove: [
    { en: "What do you love about them that you rarely say out loud?", da: "چه چیزی را درباره او دوست دارید که به‌ندرت با صدای بلند می‌گویید؟" },
    { en: "Describe the moment you knew this mattered.", da: "لحظه‌ای را که فهمیدید این رابطه اهمیت دارد توصیف کنید." },
    { en: "What do you want them to know on an ordinary Tuesday?", da: "می‌خواهید در یک سه‌شنبه عادی چه چیزی را بداند؟" },
    { en: "Tell them about the future you imagine with them in it.", da: "درباره آینده‌ای که با او در آن تصور می‌کنید برایش بگویید." },
    { en: "What's the smallest thing they do that means the most?", da: "کوچک‌ترین کاری که می‌کند و بیشترین معنا دارد چیست؟" },
    { en: "What are you grateful they've never given up on?", da: "برای چه چیزی سپاسگزارید که هیچ‌وقت از آن دست نکشیده؟" },
    { en: "Describe how they make hard days easier.", da: "توصیف کنید چطور روزهای سخت را آسان‌تر می‌کند." },
    { en: "What do you wish you said more often?", da: "آرزو می‌کنید چه چیزی را بیشتر بگویید؟" },
    { en: "Tell them what you noticed about them today.", da: "به او بگویید امروز چه چیزی را در موردش متوجه شدید." },
    { en: "What do you hope they never doubt about how you feel?", da: "امید دارید هیچ‌وقت در چه چیزی درباره احساستان شک نکند؟" },
    { en: "Write about the first time you felt safe with them.", da: "درباره اولین باری که با او احساس امنیت کردید بنویسید." },
    { en: "What promise do you want to make them, even quietly?", da: "حتی به‌آرامی، چه قولی می‌خواهید به او بدهید؟" },
  ],
  closure: [
    { en: "What do you need to say to finally put this down?", da: "برای اینکه بالاخره این را کنار بگذارید، چه چیزی نیاز است بگویید؟" },
    { en: "What part of this are you ready to stop carrying?", da: "آماده‌اید دیگر کدام بخش از این را حمل نکنید؟" },
    { en: "Tell them — or yourself — that it's over now.", da: "به او — یا به خودتان — بگویید که الان تمام شده." },
    { en: "What do you wish had gone differently, and what can you accept instead?", da: "آرزو می‌کنید چه چیزی فرق می‌کرد، و به‌جای آن چه چیزی را می‌توانید بپذیرید؟" },
    { en: "What's the last thing you need to forgive, even if it's yourself?", da: "آخرین چیزی که باید ببخشید چیست، حتی اگر خودتان باشد؟" },
    { en: "Describe what closure would actually feel like in your body.", da: "توصیف کنید پایان‌بندی واقعاً در بدن شما چه حسی دارد." },
    { en: "What question do you need to stop asking because there's no answer?", da: "از پرسیدن چه سؤالی باید دست بکشید چون پاسخی ندارد؟" },
    { en: "Tell this chapter what it taught you before you close it.", da: "پیش از بستن این فصل، به آن بگویید چه چیزی به شما آموخت." },
    { en: "What are you finally ready to let end?", da: "بالاخره آماده‌اید چه چیزی را پایان دهید؟" },
    { en: "Write the goodbye you never got to give.", da: "خداحافظی‌ای را بنویسید که هیچ‌وقت فرصت گفتنش را نداشتید." },
    { en: "What would you tell yourself about moving on, if you believed it?", da: "اگر باورش می‌کردید، درباره ادامه دادن چه به خودتان می‌گفتید؟" },
    { en: "What's one sentence that could finally settle this?", da: "چه یک جمله می‌تواند بالاخره به این پایان دهد؟" },
  ],
}

export function buildNoteLetterPrompt(recipientLabel: string, note: Note, lang: Lang = "en"): string {
  const snippet = note.preview.trim().slice(0, 90)
  if (lang === "da") return `یک بار نوشتید: «${snippet}» — آیا چیزی در آن هست که ${recipientLabel} باید بشنود؟`
  return `You once wrote: "${snippet}" — is there something in there ${recipientLabel} should hear?`
}

export function pickLetterPrompt(recipient: LetterRecipient, recipientLabel: string, notes: Note[], lang: Lang = "en"): string {
  const notesWithPreview = notes.filter((n) => n.preview.trim().length > 6)
  if (notesWithPreview.length > 0 && Math.random() < 0.18) {
    const note = notesWithPreview[Math.floor(Math.random() * notesWithPreview.length)]
    return buildNoteLetterPrompt(recipientLabel, note, lang)
  }
  const pool = letterPrompts[recipient]
  return pool[Math.floor(Math.random() * pool.length)][lang]
}
