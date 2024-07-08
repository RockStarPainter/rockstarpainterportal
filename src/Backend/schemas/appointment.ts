import mongoose from 'mongoose'
import { AppointmentType } from '../constants'

const appointmentSchema = new mongoose.Schema(
  {
    client_name: { type: String, required: true },
    client_email: { type: String, required: true },
    client_phone: { type: String, required: false },
    appointment_date: { type: Date, required: true },
    appointment_time: { type: String, required: true },
    details: { type: String, required: false },
    status: { type: String, default: AppointmentType.UP_COMING }
  },
  { timestamps: true }
)

const AppointmentModel = mongoose.models.Appointment || mongoose.model('Appointment', appointmentSchema)

export default AppointmentModel
