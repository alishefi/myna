import { useMemo, useRef, useState } from "react"
import { X, RotateCcw } from "lucide-react"
import clsx from "clsx"
import gsap from "gsap"
import { useAppStore } from "../../store/appStore"
import { useI18n } from "../../i18n"
import type { FlashcardRating } from "../../types"

export function FlashcardStudy({ notebookId, onClose }: { notebookId: string; onClose: () => void }) {
  const { t } = useI18n()
  const flashcards = useAppStore((s) => s.flashcards)
  const reviewFlashcard = useAppStore((s) => s.reviewFlashcard)
  const [cursor, setCursor] = useState(0)
  const [flipped, setFlipped] = useState(false)
  const cardRef = useRef<HTMLDivElement>(null)

  const allCards = flashcards.filter((f) => f.notebookId === notebookId)
  const due = useMemo(() => allCards.filter((f) => f.dueAt <= Date.now()), [allCards])
  const card = due[cursor]

  const flip = () => {
    setFlipped((f) => !f)
    if (cardRef.current) gsap.fromTo(cardRef.current, { scale: 0.97 }, { scale: 1, duration: 0.3, ease: "back.out(2)" })
  }

  const rate = (rating: FlashcardRating) => {
    if (!card) return
    reviewFlashcard(card.id, rating)
    setFlipped(false)
    if (cursor < due.length - 1) setCursor((c) => c + 1)
    else setCursor((c) => c + 1) // moves past end -> "all caught up"
  }

  const ratingBtns: { rating: FlashcardRating; label: string; cls: string }[] = [
    { rating: "again", label: t.school.ratingAgain, cls: "bg-rose/15 text-rose hover:bg-rose/25" },
    { rating: "hard", label: t.school.ratingHard, cls: "bg-amber-soft text-amber hover:bg-amber/25" },
    { rating: "good", label: t.school.ratingGood, cls: "bg-sage/15 text-sage hover:bg-sage/25" },
    { rating: "easy", label: t.school.ratingEasy, cls: "bg-blue/15 text-blue hover:bg-blue/25" },
  ]

  return (
    <div className="fixed inset-0 z-50 bg-paper flex flex-col items-center">
      <div className="drag h-9 w-full" />
      <button type="button" title="Close" onClick={onClose} className="no-drag absolute top-3 right-4 text-ink-soft hover:text-ink">
        <X size={18} />
      </button>

      <div className="flex-1 flex flex-col items-center justify-center w-full px-8">
        {card ? (
          <>
            <div className="text-[12px] text-ink-soft mb-4">
              {cursor + 1} {t.school.cardsOf} {due.length}
            </div>
            <div
              ref={cardRef}
              onClick={flip}
              className="no-drag w-full max-w-[520px] min-h-[260px] rounded-3xl border border-line bg-paper-raised p-8 flex flex-col items-center justify-center text-center cursor-pointer select-none"
            >
              <div className={clsx("font-serif text-[20px] text-ink leading-relaxed", flipped && "text-ink-soft text-[15px]")}>
                {flipped ? card.answer : card.question}
              </div>
              {!flipped && <div className="text-[11px] text-ink-soft/60 mt-6">{t.school.flipCard}</div>}
            </div>

            {flipped ? (
              <div className="flex gap-2 mt-6">
                {ratingBtns.map((r) => (
                  <button
                    key={r.rating}
                    type="button"
                    onClick={() => rate(r.rating)}
                    className={clsx("no-drag px-4 py-2 rounded-full text-[13px] font-medium transition-colors", r.cls)}
                  >
                    {r.label}
                  </button>
                ))}
              </div>
            ) : (
              <button
                type="button"
                onClick={flip}
                className="no-drag mt-6 flex items-center gap-1.5 text-[13px] text-ink-soft hover:text-ink"
              >
                <RotateCcw size={13} />
                {t.school.flipCard}
              </button>
            )}
          </>
        ) : (
          <div className="text-center text-ink-soft text-[14px] flex flex-col items-center gap-3">
            <div className="text-3xl">🎉</div>
            {t.school.allCaughtUp}
            <button type="button" onClick={onClose} className="no-drag mt-2 bg-ink text-paper px-5 py-2.5 rounded-full text-[13px] font-medium hover:bg-amber">
              {t.editor.back}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
