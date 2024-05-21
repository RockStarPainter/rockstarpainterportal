import connectDb from 'src/Backend/databaseConnection'
import InvoiceModel from 'src/Backend/schemas/invoice'

const handler = async (req: any, res: any) => {
  if (req.method === 'GET') {
    try {
      const data = await InvoiceModel.find({})
      return res.send({
        message: 'invoice fetched successfully',
        payload: { data }
      })
    } catch (error) {
      // console.log(error)
      res.status(500).send('something went wrong')
    }
  } else {
    res.status(500).send('this is a get request')
  }
}

export default connectDb(handler)
