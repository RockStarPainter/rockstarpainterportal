import mongoose from 'mongoose'
import { Status } from 'src/enums'
import { FormTypes, InvoiceTypes } from 'src/enums/FormTypes'

const Schema = mongoose.Schema

const invoiceSchema = new Schema(
  {
    employee: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // New field
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
    email_opened: { type: Boolean, default: false },
    address: { type: String, required: false },
    city: { type: String, required: false },
    state: { type: String, required: false },
    zip_code: { type: String, required: false },
    total_cost: { type: Number, required: false },
    balance_due: { type: Number, required: false },
    down_payment: { type: Number, required: false },
    notes: { type: String, required: false },
    handyman_notes: { type: String, required: false },
    interior_exterior_commercial_comment: { type: String, required: false },
    interior_commercial_comment: { type: String, required: false },
    exterior_commercial_comment: { type: String, required: false },
    pay_link: { type: String, required: false },
    issue_date: { type: Date, required: false },
    interiorData: {},
    exteriorData: {},
    sherwin_paints: [{ type: String }],
    primer_for_wood: [{ type: String }],
    primer_for_concrete: [{ type: String }],
    caulk_sealant: [{ type: String }],
    benjamin_paints: [
      {
        paint_name: { type: String, required: true }, // The name of the Benjamin Moore paint
        finishing_types: [{ type: String, required: false }] // The selected finishing types
      }
    ],
    other_paints: { type: String, required: false },
    interior_warranty: { type: Number, required: false },
    exterior_warranty: { type: Number, required: false },
    warranty_type: { type: String, enum: ['None', 'Interior', 'Exterior', 'Both'], default: 'None' }, // Add warranty_type field
    warranty_date: { type: Date, required: false },
    handyMan_total_cost: { type: Number, required: false },
    handyMan_balance_due: { type: Number, required: false },
    handyMan_down_payment: { type: Number, required: false },
    grand_total: { type: Number, required: false },
    total_down_payment: { type: Number, required: false },
    work_started_date: { type: Date, required: false },
    work_started_time: { type: String, required: false },
    approval_status: {
      type: String,
      enum: ['Pending', 'Approved', 'Rejected', 'Modification Requested'],
      default: 'Pending'
    },
    customer_remarks: { type: String, required: false },
    approval_token: { type: String, required: false }, // Unique token to track approval requests

    moreDetails: {}
  },
  { timestamps: true }
)

const InvoiceModel = mongoose.models.Invoice || mongoose.model('Invoice', invoiceSchema)
export default InvoiceModel
