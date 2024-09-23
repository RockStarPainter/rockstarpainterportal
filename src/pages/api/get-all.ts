import connectDb from 'src/Backend/databaseConnection'
import InvoiceModel from 'src/Backend/schemas/invoice'

const handler = async (req: any, res: any) => {
  if (req.method === 'GET') {
    try {
      const { role, userId } = req.query // Get role and userId from query params

      let invoices

      if (role === 'Admin') {
        // Admins get all invoices
        invoices = await InvoiceModel.find({})
      } else if (role === 'Employee') {
        // Employees get only their invoices
        invoices = await InvoiceModel.find({ employee: userId })
      } else {
        return res.status(403).json({ message: 'Forbidden' })
      }

      // const data = await InvoiceModel.find({}).sort({ createdAt: -1 })

      return res.send({
        message: 'invoice fetched successfully',
        payload: { invoices }
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
