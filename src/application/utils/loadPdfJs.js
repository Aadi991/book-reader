
import * as pdfjsLib from 'pdfjs-dist'
import pdfWorker from 'pdfjs-dist/build/pdf.worker.min.js?url'

export async function loadPdfJs() {
  if (typeof window === 'undefined') throw new Error('PDF.js requires browser context')
  if (window.pdfjsLib) {
    window.pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker
    return window.pdfjsLib
  }
  if (pdfJsPromise) return pdfJsPromise

  pdfJsPromise = new Promise((resolve, reject) => {
    const script = document.createElement('script')
    script.src = pdfWorker
    script.async = true
    script.onload = () => {
      if (!window.pdfjsLib) {
        reject(new Error('PDF.js failed to load'))
        return
      }
      window.pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker
      resolve(window.pdfjsLib)
    }
    script.onerror = () => reject(new Error('Could not load PDF.js CDN'))
    document.body.appendChild(script)
  })

  return pdfJsPromise
}