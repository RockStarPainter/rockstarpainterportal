import mongoose from 'mongoose'
import { Status } from 'src/enums'
import { FormTypes, InvoiceTypes } from 'src/enums/FormTypes'
const Schema = mongoose.Schema

const invoiceSchema = new Schema(
  {
    payment_link: { type: String, required: false },
    status: { type: String, enum: Status, required: false },
    custom_id: { type: Number, required: true },
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
    form_type: { type: String, enum: FormTypes, required: false },
    invoice_type: { type: String, required: true, enum: InvoiceTypes },
    customer_name: { type: String, required: false },
    phone_number: { type: String, required: false },
    email: { type: String, required: false },

    address: { type: String, required: false },
    city: { type: String, required: false },
    state: { type: String, required: false },

    zip_code: { type: String, required: false },
    total_cost: { type: Number, required: false },
    balance_due: { type: Number, required: false },
    down_payment: { type: Number, required: false },
    issue_date: { type: Date, required: false },
    interiorData: {},
    exteriorData: {}
  },
  { timestamps: true }
)

const InvoiceModel = mongoose.models.Invoice || mongoose.model('Invoice', invoiceSchema)
export default InvoiceModel
