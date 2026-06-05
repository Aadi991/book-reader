import { useEffect, useRef, useState } from 'react'
import * as pdfjsLib from 'pdfjs-dist'
import pdfWorker from 'pdfjs-dist/build/pdf.worker.min.js?url'

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker

export default function PdfReader({
  url,
  title,
  onPageChange,
  initialPage = 1
}) {
  const [pdf, setPdf] = useState(null)
  const [currentPage, setCurrentPage] = useState(initialPage)
  const [pageInput, setPageInput] = useState(String(initialPage))

  const containerRef = useRef(null)
  const pagesRef = useRef(null)
  const pageRefs = useRef([])

  const renderJobRef = useRef(0)

  const isReady = useRef(false)
  const isJumping = useRef(false)
  const suppressScroll = useRef(false)

  const lastReportedPage = useRef(1)
  const lastLoadedUrl = useRef(null)
  const hasRestored = useRef(false)

  // -------------------------
  // LOAD PDF (ONLY ONCE PER URL)
  // -------------------------
  useEffect(() => {
    if (!url) return

    if (lastLoadedUrl.current === url) {
      console.log('[PdfReader] SKIP reload (same URL)')
      return
    }

    lastLoadedUrl.current = url

    async function loadPdf() {
      console.log('[PdfReader] LOADING PDF', url)

      const doc = await pdfjsLib.getDocument(url).promise

      setPdf(doc)

      // reset state ONLY on new PDF
      hasRestored.current = false
      isReady.current = false
      isJumping.current = false
      suppressScroll.current = false
      lastReportedPage.current = 1

      setCurrentPage(initialPage)
      setPageInput(String(initialPage))
    }

    loadPdf()
  }, [url, initialPage])

  // -------------------------
  // RENDER PAGES
  // -------------------------
  useEffect(() => {
  if (!pdf) return

  const container = pagesRef.current
  if (!container) return

  console.log('[PdfReader] INIT VIRTUAL RENDER')

  container.innerHTML = ''
  pageRefs.current = []

  const observer = new IntersectionObserver(
    async (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue

        const pageNum = Number(entry.target.dataset.page)
        const ref = pageRefs.current[pageNum - 1]

        if (!ref || ref.rendered) continue

        console.log('[PdfReader] RENDER PAGE', pageNum)

        const page = await pdf.getPage(pageNum)
        const viewport = page.getViewport({ scale: 1.35 })

        const ctx = ref.canvas.getContext('2d')

        ref.canvas.width = viewport.width
        ref.canvas.height = viewport.height

        await page.render({
          canvasContext: ctx,
          viewport
        }).promise

        ref.rendered = true
      }
    },
    {
      root: containerRef.current,
      rootMargin: '600px 0px', // pre-render nearby pages
      threshold: 0.01
    }
  )

  for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
    const wrapper = document.createElement('div')
    wrapper.className = 'bg-white shadow-lg mb-4'
    wrapper.dataset.page = String(pageNum)

    const canvas = document.createElement('canvas')

    wrapper.appendChild(canvas)
    container.appendChild(wrapper)

    pageRefs.current[pageNum - 1] = {
      wrapper,
      canvas,
      rendered: false,
      page: null
    }

    observer.observe(wrapper)
  }

  return () => observer.disconnect()
}, [pdf])

  // -------------------------
  // SCROLL TRACKING
  // -------------------------
  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    function handleScroll() {
      if (!isReady.current) return
      if (isJumping.current) return
      if (suppressScroll.current) return

      const viewportCenter =
        container.scrollTop + container.clientHeight / 2

      let closest = 1
      let best = Infinity

      pageRefs.current.forEach((el, i) => {
        if (!el) return

        const center = el.offsetTop + el.offsetHeight / 2
        const dist = Math.abs(viewportCenter - center)

        if (dist < best) {
          best = dist
          closest = i + 1
        }
      })

      if (closest !== lastReportedPage.current) {
        lastReportedPage.current = closest

        setCurrentPage(closest)
        setPageInput(String(closest))

        onPageChange?.(closest)
      }
    }

    container.addEventListener('scroll', handleScroll, {
      passive: true
    })

    return () => container.removeEventListener('scroll', handleScroll)
  }, [onPageChange])

  // -------------------------
  // SAFE JUMP
  // -------------------------
  function jumpToPage(page, silent = false) {
    if (!pdf) return
    if (page < 1 || page > pdf.numPages) return

    const target = pageRefs.current[page - 1]
    if (!target) return

    isJumping.current = true
    suppressScroll.current = true

    setCurrentPage(page)
    setPageInput(String(page))

    target.scrollIntoView({
      behavior: 'auto',
      block: 'start'
    })

    setTimeout(() => {
      isJumping.current = false
      suppressScroll.current = false
    }, 300)

    if (!silent) {
      onPageChange?.(page)
    }
  }

  if (!url) {
    return (
      <div className="flex items-center justify-center h-screen">
        No PDF selected
      </div>
    )
  }

  return (
    <div className="flex flex-col h-screen">
      <header className="sticky top-0 z-50 h-[68px] flex items-center px-6 border-b">
        <h1 className="truncate font-medium">{title}</h1>

        <div className="ml-auto flex items-center gap-3">
          <span>Page</span>

          <input
            type="number"
            value={pageInput}
            min={1}
            max={pdf?.numPages || 1}
            onChange={e => setPageInput(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter') {
                jumpToPage(Number(pageInput))
              }
            }}
            className="w-12 text-center"
          />

          <span>/ {pdf?.numPages}</span>
        </div>
      </header>

      <main
        ref={containerRef}
        className="flex-1 overflow-y-auto px-6 py-8"
      >
        <div ref={pagesRef} className="flex flex-col items-center" />
      </main>
    </div>
  )
}