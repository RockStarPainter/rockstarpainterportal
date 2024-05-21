import mongoose from 'mongoose'
import { FormTypes, InvoiceTypes } from 'src/enums/FormTypes'
const Schema = mongoose.Schema

const invoiceSchema = new Schema({
  interiorRows: [
    {
      name: { type: String, required: true },
      columns: [
        {
          value: { type: Boolean, required: true }
        }
      ]
    }
  ],
  exteriorRows: [
    {
      name: { type: String, required: true },
      columns: [
        {
          value: { type: Boolean, required: true }
        }
      ]
    }
  ],
  form_type: { type: String, enum: FormTypes, required: true },
  invoice_type: { type: String, required: true, enum: InvoiceTypes },
  customer_name: { type: String, required: false },
  phone_number: { type: String, required: false },
  email: { type: String, required: false },

  address: { type: String, required: false },
  city: { type: String, required: false },
  state: { type: String, required: false },

  zip_code: { type: String, required: false },
  interiorData: {}
})

const InvoiceModel = mongoose.models.Invoice || mongoose.model('Invoice', invoiceSchema)
export default InvoiceModel
