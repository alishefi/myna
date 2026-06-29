import { Extension } from "@tiptap/core"
import { Plugin, PluginKey } from "@tiptap/pm/state"
import { Decoration, DecorationSet } from "@tiptap/pm/view"

export interface BookPaginationOptions {
  pageContentHeight: number
}

const paginationRefreshMeta = "bookPaginationRefresh"

function buildPageBreakDom(pageNumber: number, remaining: number) {
  const el = document.createElement("div")
  el.className = "book-page-break"
  el.contentEditable = "false"
  const spacer = document.createElement("div")
  spacer.style.height = `${remaining}px`
  const footer = document.createElement("div")
  footer.className = "book-page-break-footer"
  footer.textContent = String(pageNumber)
  const gap = document.createElement("div")
  gap.className = "book-page-break-gap"
  el.appendChild(spacer)
  el.appendChild(footer)
  el.appendChild(gap)
  return el
}

function buildFinalFooterDom(pageNumber: number, remaining: number) {
  const el = document.createElement("div")
  el.className = "book-page-final-footer-wrap"
  el.contentEditable = "false"
  const spacer = document.createElement("div")
  spacer.style.height = `${remaining}px`
  const footer = document.createElement("div")
  footer.className = "book-page-final-footer"
  footer.textContent = String(pageNumber)
  el.appendChild(spacer)
  el.appendChild(footer)
  return el
}

export const BookPagination = Extension.create<BookPaginationOptions>({
  name: "bookPagination",

  addOptions() {
    return { pageContentHeight: 934 }
  },

  addProseMirrorPlugins() {
    const pageContentHeight = this.options.pageContentHeight
    let currentDecorations = DecorationSet.empty

    return [
      new Plugin({
        key: new PluginKey("bookPagination"),
        props: {
          decorations() {
            return currentDecorations
          },
        },
        view(view) {
          let scheduled = false
          let lastSig = ""

          const recompute = () => {
            scheduled = false
            const doc = view.state.doc
            let acc = 0
            let pageNumber = 1
            const decos: Decoration[] = []
            const sigParts: string[] = []

            doc.forEach((_node, offset) => {
              const dom = view.nodeDOM(offset)
              const h = dom instanceof HTMLElement ? dom.getBoundingClientRect().height : 24
              if (acc > 0 && acc + h > pageContentHeight) {
                const breakPage = pageNumber
                const remaining = Math.max(0, Math.round(pageContentHeight - acc))
                decos.push(Decoration.widget(offset, () => buildPageBreakDom(breakPage, remaining), { side: -1, key: `pgbreak-${offset}` }))
                sigParts.push(`${offset}:${breakPage}:${remaining}`)
                pageNumber += 1
                acc = 0
              }
              acc += h + 8
            })

            const finalRemaining = Math.max(0, Math.round(pageContentHeight - acc))
            decos.push(Decoration.widget(doc.content.size, () => buildFinalFooterDom(pageNumber, finalRemaining), { side: 1, key: "pgfooter-final" }))
            sigParts.push(`final:${pageNumber}:${finalRemaining}`)

            const sig = sigParts.join("|")
            if (sig === lastSig) return
            lastSig = sig
            currentDecorations = DecorationSet.create(doc, decos)
            view.dispatch(view.state.tr.setMeta(paginationRefreshMeta, true))
          }

          const schedule = () => {
            if (scheduled) return
            scheduled = true
            requestAnimationFrame(recompute)
          }

          schedule()
          return { update: schedule }
        },
      }),
    ]
  },
})
