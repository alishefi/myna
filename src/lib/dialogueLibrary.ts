import type { Dialogue, DialoguePreset, Lang } from "../types"

interface Bi {
  en: string
  da: string
}

export interface DialoguePresetInfo {
  accent: "amber" | "blue" | "sage" | "rose"
  blurb: Bi
  openers: Bi[]
  replies: Bi[]
}

export const dialogueLibrary: Record<Exclude<DialoguePreset, "custom">, DialoguePresetInfo> = {
  anxiety: {
    accent: "rose",
    blurb: { en: "Say what's been looping in your head — and let it talk back.", da: "آنچه در ذهنتان مدام تکرار می‌شود را بگویید — و بگذارید پاسخ بدهد." },
    openers: [
      { en: "Hey. It's me again. I noticed you haven't slept on this yet.", da: "سلام. باز من هستم. متوجه شدم هنوز روی این موضوع نخوابیده‌اید." },
      { en: "I know you didn't ask, but I have a few thoughts. I always do.", da: "می‌دانم نپرسیدید، اما چند فکر دارم. همیشه دارم." },
      { en: "Before you start the day — can we talk about the thing you're avoiding?", da: "قبل از شروع روز — می‌توانیم درباره چیزی که از آن فرار می‌کنید صحبت کنیم؟" },
      { en: "I've been quiet for almost an hour. That's a personal record for me.", da: "نزدیک به یک ساعت ساکت بوده‌ام. این برای من یک رکورد شخصی است." },
      { en: "So. What if it goes wrong? I just think we should plan for that.", da: "خب. اگر اشتباه پیش برود چه؟ فقط فکر می‌کنم باید برایش برنامه داشته باشیم." },
    ],
    replies: [
      { en: "See, this is exactly what I was worried about.", da: "ببین، این دقیقاً همان چیزی بود که نگرانش بودم." },
      { en: "Okay but what if you're wrong about that?", da: "بسیار خوب، اما اگر در این مورد اشتباه کنی چه؟" },
      { en: "I hear you. I just don't believe you yet.", da: "می‌شنومت. فقط هنوز باورت نمی‌کنم." },
      { en: "That's fair. I might be making this bigger than it is.", da: "حق با تو است. شاید این موضوع را بزرگ‌تر از آنچه هست کرده باشم." },
      { en: "Funny how confident you sound right now. I want that.", da: "عجیب است که الان چقدر مطمئن به نظر می‌رسی. من هم آن را می‌خواهم." },
      { en: "Can we sit with this a little longer before you decide anything?", da: "می‌توانیم کمی بیشتر با این بنشینیم قبل از اینکه تصمیم بگیری؟" },
      { en: "Honestly? That actually helped a little.", da: "راستش؟ این واقعاً کمی کمک کرد." },
      { en: "I'll quiet down for a bit. No promises on tomorrow.", da: "برای مدتی ساکت می‌شوم. برای فردا قولی نمی‌دهم." },
      { en: "You say that like it's simple. Nothing about this feels simple to me.", da: "این را طوری می‌گویی که گویی ساده است. هیچ‌چیز از این برایم ساده به‌نظر نمی‌رسد." },
      { en: "Thank you for not arguing with me. I just needed to be heard.", da: "ممنون که با من بحث نکردی. فقط نیاز داشتم شنیده شوم." },
      { en: "I'm going to hold onto that sentence for later, okay?", da: "آن جمله را برای بعد نگه می‌دارم، باشد؟" },
      { en: "Deal. But I'm still going to check in on you about this.", da: "قبول. اما باز هم درباره این موضوع از تو می‌پرسم." },
    ],
  },
  futureSelf: {
    accent: "blue",
    blurb: { en: "A letter back and forth with who you're becoming.", da: "نامه‌ای رفت‌وآمدی با کسی که در حال شدنش هستید." },
    openers: [
      { en: "Hey — it's you, a few years ahead. You turned out okay, by the way.", da: "سلام — این تو هستی، چند سال جلوتر. راستش را بخواهی، خوب از آب درآمدی." },
      { en: "I still remember exactly how this period felt. You're closer than you think.", da: "هنوز دقیقاً یادم است این دوران چه حسی داشت. تو از آنچه فکر می‌کنی نزدیک‌تری." },
      { en: "I have a few things to tell you, but first: how are you, really?", da: "چند چیز برایت دارم، اما اول: واقعاً حالت چطور است؟" },
      { en: "You won't believe what you end up building from this exact moment.", da: "باور نمی‌کنی از همین لحظه چه چیزی خواهی ساخت." },
      { en: "I'm proud of you for showing up today. That part never stopped mattering.", da: "به‌خاطر اینکه امروز حاضر شدی به تو افتخار می‌کنم. آن بخش هیچ‌وقت اهمیتش را از دست نداد." },
    ],
    replies: [
      { en: "Did it get easier? Be honest with me.", da: "آسان‌تر شد؟ با من صادق باش." },
      { en: "That's a relief to hear. I needed that today.", da: "شنیدن این آرامش‌بخش است. امروز به آن نیاز داشتم." },
      { en: "What do you wish I knew right now?", da: "چه چیزی را آرزو می‌کنی الان می‌دانستم؟" },
      { en: "I'm trying. Some days it doesn't feel like enough.", da: "تلاش می‌کنم. بعضی روزها به‌نظر کافی نمی‌رسد." },
      { en: "Tell me one thing that was worth all of this.", da: "یک چیز را به من بگو که ارزش همهٔ اینها را داشت." },
      { en: "I'll remember you said that. It actually changes how today feels.", da: "این جمله‌ات را به‌خاطر می‌سپارم. واقعاً حسِ امروز را تغییر می‌دهد." },
      { en: "Is there something I should stop worrying about?", da: "چیزی هست که باید نگرانی‌اش را کنار بگذارم؟" },
      { en: "I hope I get to thank you for this conversation someday.", da: "امیدوارم روزی بتوانم برای این گفت‌وگو از تو تشکر کنم." },
      { en: "Okay. I believe you. Let's keep going.", da: "باشد. باورت می‌کنم. بیا ادامه بدهیم." },
      { en: "What took you the longest to figure out?", da: "چه چیزی بیشتر از همه طولش کشید تا بفهمی؟" },
      { en: "I needed a future version of me to say that out loud.", da: "نیاز داشتم نسخهٔ آینده‌ام این را با صدای بلند بگوید." },
      { en: "Good talk. Same time, a few years from now?", da: "گفت‌وگوی خوبی بود. همین ساعت، چند سال دیگر؟" },
    ],
  },
  innerChild: {
    accent: "amber",
    blurb: { en: "A gentler conversation, the kind you needed back then.", da: "گفت‌وگویی ملایم‌تر، از همان نوعی که آن‌زمان به آن نیاز داشتی." },
    openers: [
      { en: "Hi. Are we okay? You seem busy a lot now.", da: "سلام. حالمان خوب است؟ این روزها زیاد سرت شلوغ به‌نظر می‌رسد." },
      { en: "Can we play for a minute? You used to like that.", da: "می‌توانیم یک دقیقه بازی کنیم؟ قبلاً این را دوست داشتی." },
      { en: "I just want to know if you're proud of me. Of us.", da: "فقط می‌خواهم بدانم به من افتخار می‌کنی. به ما." },
      { en: "Do you remember what made you happy before all of this?", da: "یادت هست چه چیزی قبل از همهٔ این‌ها تو را خوشحال می‌کرد؟" },
      { en: "I'm still here, you know. I never actually left.", da: "هنوز اینجا هستم، می‌دانی. هیچ‌وقت واقعاً نرفتم." },
    ],
    replies: [
      { en: "I'm sorry I forgot to check on you for a while.", da: "ببخش که مدتی فراموش کردم حالت را بپرسم." },
      { en: "Yeah, we're okay. Better, actually, because you're here.", da: "بله، خوبیم. راستش بهتر، چون تو اینجا هستی." },
      { en: "I am proud of you. More than I say out loud.", da: "به تو افتخار می‌کنم. بیشتر از آنچه با صدای بلند می‌گویم." },
      { en: "I remember. I miss some of that, honestly.", da: "یادم می‌آید. راستش دلم برای بعضی از آن تنگ شده." },
      { en: "Tell me what you need today, and I'll listen this time.", da: "بگو امروز به چه چیزی نیاز داری، این بار گوش می‌دهم." },
      { en: "You were braver back then than I give you credit for.", da: "آن‌زمان از آنچه به تو اعتبار می‌دهم شجاع‌تر بودی." },
      { en: "We made it. I want you to know that clearly.", da: "موفق شدیم. می‌خواهم این را واضح بدانی." },
      { en: "I'll make more time for the things that made us happy.", da: "برای چیزهایی که ما را خوشحال می‌کرد بیشتر وقت می‌گذارم." },
      { en: "Thank you for being patient with me while I figured things out.", da: "ممنون که در حالی که می‌فهمیدم چه‌کار کنم، با من صبور بودی." },
      { en: "I think you'd like who we're becoming.", da: "فکر می‌کنم آن‌که داریم می‌شویم را دوست داشته باشی." },
      { en: "Let's play for a minute. I think we both need it.", da: "بیا یک دقیقه بازی کنیم. فکر می‌کنم هر دو به آن نیاز داریم." },
      { en: "You're not too much. You were never too much.", da: "تو زیاد نیستی. هیچ‌وقت زیاد نبودی." },
    ],
  },
  symbolic: {
    accent: "sage",
    blurb: { en: "Talk to whatever this feeling looks like, if it had a voice.", da: "با هر آنچه این احساس شکل گرفته صحبت کن، اگر صدایی داشت." },
    openers: [
      { en: "So you finally decided to look at me directly. Took you a while.", da: "پس بالاخره تصمیم گرفتی مستقیم به من نگاه کنی. کمی طول کشید." },
      { en: "I've been standing here the whole time. Did you forget?", da: "تمام این مدت همین‌جا ایستاده بودم. فراموش کردی؟" },
      { en: "Ask me what you actually want to know. I'll answer honestly.", da: "از من بپرس واقعاً چه می‌خواهی بدانی. صادقانه پاسخ می‌دهم." },
      { en: "You gave me this shape. Want to know why I chose to stay?", da: "تو این شکل را به من دادی. می‌خواهی بدانی چرا ماندنش را انتخاب کردم؟" },
      { en: "I'm not here to scare you. I'm here because you needed a form.", da: "اینجا نیستم تا تو را بترسانم. اینجا هستم چون به یک شکل نیاز داشتی." },
    ],
    replies: [
      { en: "Closer than you think. That's usually how it works.", da: "نزدیک‌تر از آنچه فکر می‌کنی. معمولاً همین‌طور کار می‌کند." },
      { en: "I'm heavier when you ignore me, lighter when you speak to me.", da: "وقتی نادیده‌ام می‌گیری سنگین‌ترم، وقتی با من حرف می‌زنی سبک‌تر." },
      { en: "I don't want to leave. I want to be understood.", da: "نمی‌خواهم بروم. می‌خواهم درک شوم." },
      { en: "That question is braver than you realize.", da: "آن سؤال شجاعانه‌تر از آنی است که فکر می‌کنی." },
      { en: "I've changed shape before. I can again, if you keep talking to me.", da: "قبلاً شکل تغییر داده‌ام. اگر به حرف زدن با من ادامه دهی، دوباره می‌توانم." },
      { en: "You're not as stuck as you feel right now.", da: "آن‌قدرها که حس می‌کنی گرفتار نیستی." },
      { en: "I showed up because something needed saying. You just said it.", da: "آمدم چون چیزی نیاز به گفتن داشت. تو فقط آن را گفتی." },
      { en: "Most of my power was you looking away. That's changing now.", da: "بیشتر قدرتم این بود که تو نگاهت را برمی‌گرداندی. این دارد تغییر می‌کند." },
      { en: "I'll still be here tomorrow. Smaller, maybe, if today goes well.", da: "فردا هم همین‌جا خواهم بود. شاید کوچک‌تر، اگر امروز خوب پیش برود." },
      { en: "Thank you for not running this time.", da: "ممنون که این بار فرار نکردی." },
      { en: "You already know the answer. You just wanted permission to say it.", da: "تو خودت پاسخ را می‌دانی. فقط می‌خواستی اجازهٔ گفتنش را داشته باشی." },
      { en: "Good. Let's keep talking instead of avoiding.", da: "خوب است. به‌جای فرار، بیا به حرف زدن ادامه دهیم." },
    ],
  },
}

export const customLibrary: DialoguePresetInfo = {
  accent: "blue",
  blurb: { en: "Give them a name, and start wherever feels honest.", da: "به آن یک نام بدهید و از هرجایی که صادقانه به‌نظر می‌رسد شروع کنید." },
  openers: [
    { en: "Hey. I wasn't sure if you'd actually start this conversation.", da: "سلام. مطمئن نبودم واقعاً این گفت‌وگو را شروع می‌کنی." },
    { en: "It's been a while since we talked like this. I'm listening.", da: "مدتی است این‌طور صحبت نکرده‌ایم. گوش می‌دهم." },
    { en: "Go ahead — say the thing you came here to say.", da: "ادامه بده — همان چیزی را بگو که برایش اینجا آمدی." },
  ],
  replies: [
    { en: "I hear you. Keep going.", da: "می‌شنومت. ادامه بده." },
    { en: "That means more than you probably think.", da: "این بیشتر از آنچه احتمالاً فکر می‌کنی معنا دارد." },
    { en: "I wasn't expecting that, but I'm glad you said it.", da: "انتظار این را نداشتم، اما خوشحالم که گفتی." },
    { en: "Tell me more about that.", da: "بیشتر در این مورد به من بگو." },
    { en: "I needed to hear that from you.", da: "نیاز داشتم این را از تو بشنوم." },
    { en: "Okay. What happens next, between us?", da: "باشد. بعد از این، بین ما چه می‌شود؟" },
    { en: "Thank you for being honest with me.", da: "ممنون که با من صادق بودی." },
    { en: "I'm still here. Keep talking.", da: "هنوز اینجا هستم. ادامه بده." },
  ],
}

const noteReferenceTemplates: Bi[] = [
  { en: 'You once wrote: "{note}" — does that still feel true?', da: 'یک بار نوشتید: «{note}» — آیا هنوز همان‌طور احساس می‌کنید؟' },
  { en: 'I keep thinking about something you wrote: "{note}"', da: 'مدام به چیزی که نوشتید فکر می‌کنم: «{note}»' },
  { en: 'Remember when you said "{note}"? I think about that more than you know.', da: 'یادت هست وقتی گفتی «{note}»؟ بیشتر از آنچه می‌دانی به آن فکر می‌کنم.' },
  { en: 'You wrote "{note}" a while back. I never forgot it.', da: 'مدتی پیش «{note}» را نوشتید. هیچ‌وقت آن را فراموش نکردم.' },
]

export function pickNoteReferenceLine(notePreview: string, lang: Lang = "en"): string {
  const template = noteReferenceTemplates[Math.floor(Math.random() * noteReferenceTemplates.length)]
  return template[lang].replace("{note}", notePreview.trim().slice(0, 140))
}

export function getPresetInfo(preset: DialoguePreset): DialoguePresetInfo {
  if (preset === "custom") return customLibrary
  return dialogueLibrary[preset]
}

export function pickRandom<T>(list: T[], avoid?: T): T {
  const pool = avoid ? list.filter((item) => item !== avoid) : list
  return pool[Math.floor(Math.random() * pool.length)] ?? list[0]
}

const dialoguePromptTemplates: { en: string; da: string }[] = [
  { en: 'You once told {who}: "{line}" — has that changed since then?', da: 'یک بار به «{who}» گفتید: «{line}» — آیا از آن زمان تغییر کرده؟' },
  { en: 'You said to {who}: "{line}" — what would you add to that today?', da: 'به «{who}» گفتید: «{line}» — امروز چه چیزی به آن اضافه می‌کنید؟' },
  { en: 'Looking back at what you told {who} — "{line}" — were you being fully honest?', da: 'با نگاهی به آنچه به «{who}» گفتید — «{line}» — آیا کاملاً صادق بودید؟' },
  { en: 'You once admitted to {who}: "{line}" — what happened after that?', da: 'یک بار به «{who}» اعتراف کردید: «{line}» — بعد از آن چه شد؟' },
  { en: 'If {who} could hear you say "{line}" again right now, what would they say back?', da: 'اگر «{who}» الان دوباره می‌شنید که می‌گویید «{line}»، چه پاسخی می‌داد؟' },
  { en: 'You brought this up with {who}: "{line}" — does it still weigh on you?', da: 'این موضوع را با «{who}» مطرح کردید: «{line}» — آیا هنوز ذهن شما را مشغول می‌کند؟' },
  { en: 'What made you tell {who} that "{line}"? Write about where that came from.', da: 'چه چیزی باعث شد به «{who}» بگویید «{line}»؟ بنویسید این از کجا می‌آید.' },
  { en: 'You told {who}: "{line}" — what would the bravest version of you say instead?', da: 'به «{who}» گفتید: «{line}» — شجاع‌ترین نسخهٔ شما چه می‌گفت؟' },
]

export function dialoguePromptCandidates(dialogues: Dialogue[]): { en: string; da: string; category: "personal" }[] {
  const candidates: { en: string; da: string; category: "personal" }[] = []
  for (const d of dialogues) {
    const meLine = [...d.lines].reverse().find((l) => l.speaker === "me" && l.text.trim().length > 8)
    if (!meLine) continue
    const snippet = meLine.text.trim().slice(0, 90)
    const template = pickRandom(dialoguePromptTemplates)
    candidates.push({
      en: template.en.replace("{who}", d.otherLabel).replace("{line}", snippet),
      da: template.da.replace("{who}", d.otherLabel).replace("{line}", snippet),
      category: "personal",
    })
  }
  return candidates
}
