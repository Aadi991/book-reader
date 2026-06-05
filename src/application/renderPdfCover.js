import { loadPdfJs } from './utils/loadPdfJs'

export async function renderPdfCover(file, pageNumber = 1) {
  const pdfjsLib = await loadPdfJs()

  const data = await file.arrayBuffer()

  const pdf = await pdfjsLib.getDocument({
    data
  }).promise

  const safePage = Math.min(
    Math.max(1, pageNumber),
    pdf.numPages
  )

  const page = await pdf.getPage(safePage)

  const viewport = page.getViewport({
    scale: 1.2
  })

  const canvas = document.createElement('canvas')

  const ctx = canvas.getContext('2d')

  canvas.width = Math.floor(viewport.width)
  canvas.height = Math.floor(viewport.height)

  await page.render({
    canvasContext: ctx,
    viewport
  }).promise

  return new Promise(resolve => {
    canvas.toBlob(
      blob => {
        resolve({
          blob,
          pageCount: pdf.numPages,
          coverPage: safePage
        })
      },
      'image/jpeg',
      0.9
    )
  })
}