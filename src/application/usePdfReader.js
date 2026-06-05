import { useEffect, useRef, useState, useCallback } from 'react'
import * as pdfjsLib from 'pdfjs-dist'

import pdfWorker from 'pdfjs-dist/build/pdf.worker.min.js?url'
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker

export function usePdfReader({ url, initialPage = 1, onPageChange }) {
  const [pdf, setPdf] = useState(null)
  const [pageInput, setPageInput] = useState(String(initialPage))
  const [pagesReady, setPagesReady] = useState(false)

  const containerRef = useRef(null)
  const pagesRef = useRef(null)

  const pageRefs = useRef([])
  const observerRef = useRef(null)
  const renderQueue = useRef(new Map())

  const isJumping = useRef(false)

  // ---------------- STABLE CONTROL FLAGS ----------------
  const didInitialJump = useRef(false)
  const lastReportedPage = useRef(initialPage)

  const saveTimer = useRef(null)
  const pendingSave = useRef(null)

  // ---------------- LOAD PDF ----------------
  useEffect(() => {
    if (!url) return

    let cancelled = false

    async function load() {
      const doc = await pdfjsLib.getDocument(url).promise
      if (cancelled) return

      setPdf(doc)
      setPageInput(String(initialPage))

      // reset per document
      didInitialJump.current = false
      lastReportedPage.current = initialPage
    }

    load()
    return () => (cancelled = true)
  }, [url])

  // ---------------- BUILD PAGES ----------------
  useEffect(() => {
    if (!pdf || !pagesRef.current) return

    const container = pagesRef.current
    container.innerHTML = ''
    pageRefs.current = []

    for (let i = 1; i <= pdf.numPages; i++) {
      const wrapper = document.createElement('div')
      wrapper.dataset.page = String(i)
      wrapper.style.marginBottom = '16px'

      const canvas = document.createElement('canvas')

      wrapper.appendChild(canvas)
      container.appendChild(wrapper)

      pageRefs.current[i - 1] = {
        wrapper,
        canvas,
        rendered: false,
        rendering: false
      }
    }

    setPagesReady(true)
  }, [pdf])

  // ---------------- INITIAL RESTORE (ONCE ONLY) ----------------
  useEffect(() => {
    if (!pagesReady) return
    if (didInitialJump.current) return

    didInitialJump.current = true

    requestAnimationFrame(() => {
      jumpToPage(initialPage)
    })
  }, [pagesReady, initialPage])

  // ---------------- RENDER PAGE ----------------
  async function renderPage(pdf, pageNum) {
    const ref = pageRefs.current[pageNum - 1]
    if (!ref || ref.rendered || ref.rendering) return

    ref.rendering = true

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
    ref.rendering = false
  }

  // ---------------- INTERSECTION OBSERVER (RENDER ONLY) ----------------
  useEffect(() => {
    if (!pdf || !containerRef.current || !pagesReady) return

    observerRef.current?.disconnect()

    observerRef.current = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue

          const pageNum = Number(entry.target.dataset.page)

          if (!renderQueue.current.has(pageNum)) {
            renderQueue.current.set(pageNum, true)

            requestAnimationFrame(async () => {
              await renderPage(pdf, pageNum)
              renderQueue.current.delete(pageNum)
            })
          }
        }
      },
      {
        root: containerRef.current,
        rootMargin: '1000px 0px',
        threshold: 0.01
      }
    )

    pageRefs.current.forEach(p => {
      if (p?.wrapper) observerRef.current.observe(p.wrapper)
    })

    return () => observerRef.current?.disconnect()
  }, [pdf, pagesReady])

  // ---------------- SCROLL TRACKING (UI ONLY, NO STATE AUTHORITY) ----------------
  useEffect(() => {
    const container = containerRef.current
    if (!container || !pagesReady) return

    let ticking = false

    function onScroll() {
      if (!pdf || isJumping.current) return

      if (ticking) return
      ticking = true

      requestAnimationFrame(() => {
        ticking = false

        const center = container.scrollTop + container.clientHeight / 2

        let closest = 1
        let best = Infinity

        pageRefs.current.forEach((el, i) => {
          if (!el?.wrapper) return

          const top = el.wrapper.offsetTop
          const mid = top + el.wrapper.offsetHeight / 2

          const dist = Math.abs(center - mid)

          if (dist < best) {
            best = dist
            closest = i + 1
          }
        })

        // UI only
        setPageInput(String(closest))

        // ---------------- SAFE SAVE (DEBOUNCED + NON-JUMPING) ----------------
        if (closest !== lastReportedPage.current) {
          lastReportedPage.current = closest

          pendingSave.current = closest

          clearTimeout(saveTimer.current)

          saveTimer.current = setTimeout(() => {
            onPageChange?.(pendingSave.current)
          }, 1200)
        }
      })
    }

    container.addEventListener('scroll', onScroll, { passive: true })
    return () => container.removeEventListener('scroll', onScroll)
  }, [pdf, pagesReady, onPageChange])

  // ---------------- JUMP (ONLY CONTROLLED PROGRAMMATIC SCROLL) ----------------
  const jumpToPage = useCallback((page) => {
    if (!pdf || !pagesReady) return
    if (page < 1 || page > pdf.numPages) return

    const target = pageRefs.current[page - 1]
    if (!target?.wrapper) return

    isJumping.current = true

    target.wrapper.scrollIntoView({
      behavior: 'auto',
      block: 'start'
    })

    setPageInput(String(page))

    lastReportedPage.current = page

    setTimeout(() => {
      isJumping.current = false
    }, 250)
  }, [pdf, pagesReady])

  return {
    pdf,
    containerRef,
    pagesRef,
    pageInput,
    setPageInput,
    jumpToPage
  }
}