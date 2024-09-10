import InvoiceModel from 'src/Backend/schemas/invoice'

export default async function handler(req, res) {
  const { email_id, redirect } = req.query

  // Find the invoice by email_id and mark the email as clicked
  await InvoiceModel.findByIdAndUpdate(email_id, { linkClicked: true })

  // Redirect to the original link
  res.redirect(redirect)
}
