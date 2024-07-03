import mongoose from 'mongoose'
import { Status } from 'src/enums'
import { FormTypes, InvoiceTypes } from 'src/enums/FormTypes'

const Schema = mongoose.Schema

const invoiceSchema = new Schema(
  {
    status: { type: String, enum: Status, required: false },
    custom_id: { type: Number, required: true, unique: true },
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
    customer_name: { type: String, required: true },
    phone_number: { type: String, required: false },
    email: { type: String, required: true },

    address: { type: String, required: false },
    city: { type: String, required: false },
    state: { type: String, required: false },

    zip_code: { type: String, required: false },
    total_cost: { type: Number, required: false },
    notes: { type: String, required: false },
    balance_due: { type: Number, required: false },
    down_payment: { type: Number, required: false },
    pay_link: { type: String, required: false },
    issue_date: { type: Date, required: false },
    interiorData: {},
    exteriorData: {},
    sherwin_paints: [],
    benjamin_paints: [],
    other_paints: { type: String, required: false }
  },
  { timestamps: true }
)

const InvoiceModel = mongoose.models.Invoice || mongoose.model('Invoice', invoiceSchema)
export default InvoiceModel
