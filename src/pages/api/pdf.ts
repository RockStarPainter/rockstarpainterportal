// pages/api/generate-pdf.js
import puppeteer from 'puppeteer'

export default async (req, res) => {
  const browser = await puppeteer.launch()
  const page = await browser.newPage()

  // Render the page with your MUI components
  await page.goto('http://localhost:3000/render-pdf', {
    waitUntil: 'networkidle2'
  })

  const pdfBuffer = await page.pdf({ format: 'A4' })

  await browser.close()

  res.setHeader('Content-Type', 'application/pdf')
  res.setHeader('Content-Disposition', 'attachment; filename=document.pdf')
  res.send(pdfBuffer)
}
