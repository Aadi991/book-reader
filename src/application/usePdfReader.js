// /application/usePdfReader.js
import { useEffect, useRef, useState } from 'react'
import * as pdfjsLib from 'pdfjs-dist'

export function usePdfReader({ url, initialPage = 1, onPageChange }) {
  const [pdf, setPdf] = useState(null)
  const [currentPage, setCurrentPage] = useState(initialPage)
  const [pageInput, setPageInput] = useState(String(initialPage))

  const containerRef = useRef(null)
  const pagesRef = useRef(null)
  const pageRefs = useRef([])

  const isJumping = useRef(false)
  const suppressScroll = useRef(false)
  const lastReportedPage = useRef(1)

  // ---------------- LOAD PDF ----------------
  useEffect(() => {
    if (!url) return

    let cancelled = false

    async function load() {
      const doc = await pdfjsLib.getDocument(url).promise
      if (cancelled) return

      setPdf(doc)
      setCurrentPage(initialPage)
      setPageInput(String(initialPage))
    }

    load()
    return () => (cancelled = true)
  }, [url, initialPage])

  // ---------------- CREATE ALL PAGES (IMPORTANT FIX) ----------------
  useEffect(() => {
    if (!pdf || !pagesRef.current) return

    const container = pagesRef.current
    container.innerHTML = ''
    pageRefs.current = []

    for (let i = 1; i <= pdf.numPages; i++) {
      const wrapper = document.createElement('div')
      wrapper.dataset.page = String(i)
      wrapper.className = 'bg-white shadow-lg mb-4'

      const canvas = document.createElement('canvas')
      wrapper.appendChild(canvas)

      container.appendChild(wrapper)

      pageRefs.current[i - 1] = {
        wrapper,
        canvas,
        rendered: false
      }
    }
  }, [pdf])

  // ---------------- LAZY RENDER ----------------
  useEffect(() => {
    if (!pdf || !containerRef.current) return

    const observer = new IntersectionObserver(
      async (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue

          const pageNum = Number(entry.target.dataset.page)
          const ref = pageRefs.current[pageNum - 1]

          if (!ref || ref.rendered) continue

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
        rootMargin: '800px 0px',
        threshold: 0.01
      }
    )

    pageRefs.current.forEach(p => {
      if (p?.wrapper) observer.observe(p.wrapper)
    })

    return () => observer.disconnect()
  }, [pdf])

  // ---------------- SCROLL TRACKING ----------------
  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    function onScroll() {
      if (!pdf || isJumping.current || suppressScroll.current) return

      const center = container.scrollTop + container.clientHeight / 2

      let closest = 1
      let best = Infinity

      pageRefs.current.forEach((el, i) => {
        if (!el?.wrapper) return

        const top = el.wrapper.offsetTop
        const height = el.wrapper.offsetHeight
        const mid = top + height / 2

        const dist = Math.abs(center - mid)

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

    container.addEventListener('scroll', onScroll, { passive: true })
    return () => container.removeEventListener('scroll', onScroll)
  }, [pdf, onPageChange])

  // ---------------- GUARANTEED JUMP (FIXED) ----------------
  function jumpToPage(page) {
    if (!pdf) return
    if (page < 1 || page > pdf.numPages) return

    const target = pageRefs.current[page - 1]
    if (!target?.wrapper) return

    isJumping.current = true
    suppressScroll.current = true

    target.wrapper.scrollIntoView({
      behavior: 'auto',
      block: 'start'
    })

    setCurrentPage(page)
    setPageInput(String(page))

    setTimeout(() => {
      isJumping.current = false
      suppressScroll.current = false
    }, 250)

    onPageChange?.(page)
  }

  return {
    pdf,
    containerRef,
    pagesRef,
    currentPage,
    pageInput,
    setPageInput,
    jumpToPage
  }
}