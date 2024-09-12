import type { NextApiRequest, NextApiResponse } from 'next/types'
import connectDb from 'src/Backend/databaseConnection'
import InvoiceModel from 'src/Backend/schemas/invoice'
import uploadFiles from 'src/Backend/middlewares/multer/uploadFiles'

export const config = {
  api: {
    bodyParser: false // Disable body parsing as multer handles it
  }
}

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === 'POST') {
    const { custom_id } = req.query

    if (!custom_id) {
      return res.status(400).json({ error: 'Missing custom_id in query' })
    }

    try {

      await uploadFilesAsync(req, res)

      // Find the invoice by custom_id and mark the email as opened
      const updatedInvoice = await InvoiceModel.findOneAndUpdate(
        { custom_id: custom_id },
        { $set: { email_opened: true } },
        { new: true }
      )

      if (!updatedInvoice) {
        return res.status(404).json({ error: 'Invoice not found' })
      }

      console.log(`Email opened logged for custom_id: ${custom_id}`)

      return res.status(200).json({ message: 'Email opened logged successfully' })
    } catch (error) {
      console.error('Error logging email open event:', error)

      return res.status(500).json({ error: 'Internal server error' })
    }
  } else {
    res.setHeader('Allow', ['POST'])

    return res.status(405).send(`Method ${req.method} Not Allowed`)
  }
}

// Helper function to promisify the multer upload
function uploadFilesAsync(req: any, res: any) {
  return new Promise((resolve, reject) => {
    uploadFiles(req, res, (err: any) => (err ? reject(err) : resolve()))
  })
}

export default connectDb(handler)
