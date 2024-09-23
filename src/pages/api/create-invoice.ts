import connectDb from 'src/Backend/databaseConnection'
import InvoiceModel from 'src/Backend/schemas/invoice'
import crypto from 'crypto'


// Function to generate a random token
const generateToken = () => {
  return crypto.randomBytes(16).toString('hex')
}

const generateUniqueCustomId = async () => {
  const customId = Math.floor(10000 + Math.random() * 90000) // Generates a random 5-digit number

  return customId
}
const handler = async (req: any, res: any) => {
  if (req.method === 'POST') {
    try {

      const { userId } = req.query // Get role and userId from query params


      const customId = await generateUniqueCustomId()
      const approvalToken = await generateToken() // Generate a secure token
      console.log('approvalToken', approvalToken)

      const newInvoice = new InvoiceModel({
        ...req.body,
        custom_id: customId,
        approval_token: approvalToken, // Save the token to the invoice,
        employee: userId
      })
      console.log('Generated Invoice - custom_id:', customId, 'approval_token:', approvalToken)

      const saved = await newInvoice.save()

      if (!saved) {
        return res.status(404).send('Not able to save invoice')
      }

      return res.status(201).send({
        message: 'Invoice created successfully',
        payload: { invoice: saved }
      })
    } catch (error) {
      console.error('Error saving invoice:', error)

      return res.status(500).send('Something went wrong')
    }
  } else {
    res.setHeader('Allow', ['POST'])

    return res.status(405).end(`Method ${req.method} Not Allowed`)
  }
}



export default connectDb(handler)
