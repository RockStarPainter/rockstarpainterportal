import connectDb from 'src/Backend/databaseConnection'
import InvoiceModel from 'src/Backend/schemas/invoice'

const handler = async (req: any, res: any) => {
  if (req.method === 'POST') {
    try {
      const count = await InvoiceModel.countDocuments({})
      const newInvoice = new InvoiceModel({ ...req.body, custom_id: count + 1 })

      const saved = await newInvoice.save()

      if (!saved) {
        return res.status(404).send('Not able to save invoice')
      }

      return res.send({
        message: 'invoice fetched successfully',
        payload: { invoice: saved }
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
