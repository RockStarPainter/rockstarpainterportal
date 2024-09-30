import connectDb from 'src/Backend/databaseConnection'
import InvoiceModel from 'src/Backend/schemas/invoice'
import UserModel from 'src/Backend/schemas/user' // Assuming you have a UserModel

const handler = async (req: any, res: any) => {
  if (req.method === 'GET') {
    try {
      const { role, userId } = req.query // Get role and userId from query params

      let invoices

      if (role === 'Admin') {
        // Admins get all invoices
        invoices = await InvoiceModel.find({}).populate({
          path: 'employee', // The field in Invoice that holds the employee's ObjectId
          select: 'user_name' // Only select the user_name field
        })
      } else if (role === 'Employee') {
        // Employees get only their invoices
        invoices = await InvoiceModel.find({ employee: userId }).populate({
          path: 'employee',
          select: 'user_name'
        })
      } else {
        return res.status(403).json({ message: 'Forbidden' })
      }

      return res.send({
        message: 'Invoices fetched successfully',
        payload: { invoices }
      })
    } catch (error) {
      res.status(500).send('Something went wrong')
    }
  } else {
    res.status(405).send('Only GET requests are allowed')
  }
}

export default connectDb(handler)
