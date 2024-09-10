import InvoiceModel from 'src/Backend/schemas/invoice'

export default async function handler(req, res) {
  const { email_id } = req.query

  // Find the invoice by email_id and mark the email as opened
  await InvoiceModel.findByIdAndUpdate(email_id, { emailOpened: true })

  // Return a tiny transparent pixel
  res.setHeader('Content-Type', 'image/gif')
  res.send(
    Buffer.from(
      'R0lGODlhAQABAIAAAAUEBAUAAAAwAAAoAAAAUAAACAAQAAKQAAgAAAAAAAAAAACH5BAkAAAEALAAAAAABAAEAAAICRAEAOw==',
      'base64'
    )
  )
}
