// Example serverless function to generate a thumbnail from a PDF page.
// This uses Puppeteer to render the PDF page headlessly and produce a JPEG buffer.
// Deploy this on a serverless platform that supports Node and has enough memory.

const puppeteer = require('puppeteer')
const fetch = require('node-fetch')

module.exports = async function (req, res) {
  try {
    const { pdfUrl, page = 1 } = req.body || {}
    if (!pdfUrl) return res.status(400).send({ error: 'pdfUrl required' })

    const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] })
    const pageHandle = await browser.newPage()
    // Load PDF data as a blob URL in a basic HTML viewer
    const html = `<!doctype html><html><body style="margin:0"><embed src="${pdfUrl}#page=${page}" type="application/pdf" width="100%" height="100%"/></body></html>`
    await pageHandle.setContent(html, { waitUntil: 'networkidle0' })
    // give embed time to render
    await pageHandle.waitForTimeout(1000)
    const screenshotBuffer = await pageHandle.screenshot({ type: 'jpeg', quality: 85 })
    await browser.close()

    res.setHeader('Content-Type', 'image/jpeg')
    return res.status(200).send(screenshotBuffer)
  } catch (err) {
    console.error('Thumbnail generation error', err)
    return res.status(500).send({ error: String(err) })
  }
}
