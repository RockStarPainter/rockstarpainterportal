import connectDb from 'src/Backend/databaseConnection'
import InvoiceModel from 'src/Backend/schemas/invoice'
import { NextApiRequest, NextApiResponse } from 'next/types'

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === 'GET') {
    try {
      const { custom_id, pdfUrl } = req.query

      if (!custom_id || !pdfUrl) {
        return res.status(400).json({ error: 'Missing required parameters' })
      }

      // Update the `email_opened` status for the specific invoice
      const updatedInvoice = await InvoiceModel.findOneAndUpdate(
        { custom_id: custom_id },
        { $set: { email_opened: true } },
        { new: true } // This returns the updated document
      )

      if (!updatedInvoice) {
        return res.status(404).json({ error: 'Invoice not found or update failed' })
      }

      // Redirect to the Cloudinary PDF URL after updating the status
      return res.redirect(302, pdfUrl as string)
    } catch (error) {
      console.error('Error updating invoice status:', error)

      return res.status(500).json({ error: 'Internal server error' })
    }
  } else {
    return res.status(405).json({ error: 'Method not allowed, use GET' })
  }
}

export default connectDb(handler)
