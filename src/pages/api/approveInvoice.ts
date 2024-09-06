// pages/api/approveInvoice.ts

import connectDb from 'src/Backend/databaseConnection'
import InvoiceModel from 'src/Backend/schemas/invoice'

const handler = async (req: any, res: any) => {
  if (req.method === 'POST') {
    const { id, token, status, remarks } = req.body

    try {
      // Find the invoice by id and token
      const invoice = await InvoiceModel.findOne({ custom_id: id, approval_token: token })
      if (!invoice) {
        return res.status(400).json({ success: false, message: 'Invalid token or invoice not found' })
      }

      // Update the approval status and remarks
      invoice.approval_status = status
      if (remarks) {
        invoice.customer_remarks = remarks
      }
      await invoice.save()

      return res.status(200).json({ success: true, message: 'Invoice updated successfully' })
    } catch (error) {
      console.error('Error approving invoice:', error)

      return res.status(500).json({ success: false, message: 'Internal server error' })
    }
  } else {
    res.setHeader('Allow', ['POST'])

    return res.status(405).end(`Method ${req.method} Not Allowed`)
  }
}

export default connectDb(handler)
