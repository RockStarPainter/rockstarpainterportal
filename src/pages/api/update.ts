import connectDb from 'src/Backend/databaseConnection'
import InvoiceModel from 'src/Backend/schemas/invoice'

const handler = async (req: any, res: any) => {
  if (req.method === 'POST') {
    try {
      const { payload, invoiceId } = req.body

      // Validate the balance_due before updating
      if (payload.balance_due && typeof payload.balance_due !== 'number') {
        return res.status(400).json({ message: 'Invalid balance due value' })
      }

      const updatedInvoice = await InvoiceModel.findByIdAndUpdate(
        invoiceId,
        { $set: payload },
        { new: true } // Return the updated document
      )

      if (!updatedInvoice) {
        return res.status(404).json({ message: 'Invoice not found or unable to update' })
      }

      return res.status(200).json({
        message: 'Invoice updated successfully',
        payload: updatedInvoice
      })
    } catch (error) {
      console.error('Error updating invoice')

      return res.status(500).json({ message: 'An error occurred while updating the invoice' })
    }
  } else {
    return res.status(405).json({ message: 'Method not allowed, only POST requests are accepted' })
  }
}

export default connectDb(handler)
