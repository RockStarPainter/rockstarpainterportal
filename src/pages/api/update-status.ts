import connectDb from 'src/Backend/databaseConnection'
import InvoiceModel from 'src/Backend/schemas/invoice'

const handler = async (req: any, res: any) => {
  if (req.method === 'POST') {
    try {
      const { value, invoiceId } = req.body
      const newInvoice = await InvoiceModel.findByIdAndUpdate(invoiceId, { $set: { status: value } })

      if (!newInvoice) {
        return res.status(404).send('Not able to update invoice')
      }

      return res.send({
        message: 'invoice fetched successfully',
        payload: {}
      })
    } catch (error) {
      console.log(error)
      res.status(500).send('something went wrong')
    }
  } else {
    res.status(500).send('this is a post request')
  }
}

export default connectDb(handler)
