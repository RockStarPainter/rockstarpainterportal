import connectDb from 'src/Backend/databaseConnection'
import AppointmentModel from 'src/Backend/schemas/appointment'

import { MailerSend, EmailParams, Sender, Recipient } from 'mailersend'
import { AppointmentType } from 'src/Backend/constants'
import dayjs from 'dayjs'

const mailerSend = new MailerSend({
  apiKey: 'mlsn.544897ec14ebe9d972a8d04b94822641ebf83adeb29ba8554f9afa351c38f516'
})

const handler = async (req, res) => {
  if (req.method === 'POST') {
    try {
      const { appointmentId } = req.body
      const appointment = await AppointmentModel.findById(appointmentId)

      if (!appointment) {
        return res.status(404).send('Appointment not found')
      }

      if (appointment.status === AppointmentType.UP_COMING) {
        const currentDate = new Date()
        const appointmentDate = new Date(appointment.appointment_date)
        const time = appointment.appointment_time
        const [hours, minutes] = time.split(':').map(Number)

        appointmentDate.setHours(hours)
        appointmentDate.setMinutes(minutes)

        const twoHoursBeforeDate = new Date(appointmentDate)
        twoHoursBeforeDate.setHours(twoHoursBeforeDate.getHours() - 2)

        const twelveHoursBeforeDate = new Date(appointmentDate)
        twelveHoursBeforeDate.setHours(twelveHoursBeforeDate.getHours() - 12)

        const currentTimestamp = Math.floor(currentDate.getTime() / 1000)
        const twoHoursBeforeTimestamp = Math.floor(twoHoursBeforeDate.getTime() / 1000)
        const twelveHoursBeforeTimestamp = Math.floor(twelveHoursBeforeDate.getTime() / 1000)

        const sentFrom = new Sender('info@rockstarpainting.us', 'RockStar Paints')
        const recipients = [new Recipient(appointment.client_email, appointment.client_name)]
        const html = `<!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Appointment Reminder</title>
            <style>
                body {
                    font-family: 'Arial', sans-serif;
                    background-color: #f4f4f4;
                    margin: 0;
                    padding: 0;
                    color: #333;
                }
                .container {
                    width: 100%;
                    max-width: 600px;
                    margin: 20px auto;
                    background-color: #ffffff;
                    padding: 20px;
                    border-radius: 8px;
                    box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
                }
                .header {
                    text-align: center;
                    padding: 20px 0;
                    background-color: #0073e6;
                    color: #ffffff;
                    border-radius: 8px 8px 0 0;
                }
                .header h1 {
                    margin: 0;
                    font-size: 24px;
                }
                .content {
                    padding: 20px;
                }
                .content p {
                    margin: 10px 0;
                    line-height: 1.6;
                }
                .content strong {
                    color: #0073e6;
                }
                .appointment-details {
                    background-color: #f9f9f9;
                    border: 1px solid #e0e0e0;
                    border-radius: 8px;
                    padding: 15px;
                    margin: 15px 0;
                }
                .appointment-details p {
                    margin: 8px 0;
                }
                .footer {
                    text-align: center;
                    padding: 10px 0;
                    background-color: #0073e6;
                    color: black;
                    font-size: 12px;
                    border-radius: 0 0 8px 8px;
                }
                .footer p {
                    margin: 0;
                }
                a {
                    color: #0073e6;
                    text-decoration: none;
                }
                a:hover {
                    text-decoration: underline;
                }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>Appointment Reminder</h1>
                </div>
                <div class="content">
                    <p>Dear <strong>${appointment.client_name}</strong>,</p>
                    <p>This is a reminder email for your appointment:</p>
                    <div class="appointment-details">
                        <p><strong>Date:</strong> ${dayjs(appointment.appointment_date).format('D-MMMM-YYYY')}</p>
                        <p><strong>Time:</strong> ${appointment.appointment_time}</p>
                    </div>
                    <p>If you have any questions or need to reschedule, please contact us at <a href="mailto:info@rockstarpaints.us">info@rockstarpaints.us</a> or call us at <a href="tel:+17207715791">(720) 771-5791</a>.</p>
                    <p>Thank you for choosing our services. We look forward to seeing you!</p>
                    <p>Best regards,</p>
                    <p><strong><a href="https://rockstarpaintingdenver.com/" target="_blank">RockStar Paints</a></strong></p>
                </div>
                <div class="footer">
                    <a href="https://rockstarpaintingdenver.com/"
                    <p>&copy; 2024 RockStar Paints. All rights reserved.</p>
                    </a>
                </div>
            </div>
        </body>
        </html>
        `

        let emailScheduled = false

        if (twelveHoursBeforeTimestamp > currentTimestamp) {
          const emailParams12Hours = new EmailParams()
            .setFrom(sentFrom)
            .setTo(recipients)
            .setReplyTo(sentFrom)
            .setSubject('Appointment Reminder')
            .setHtml(html)
            .setText('This is a scheduled text content')
            .setSendAt(twelveHoursBeforeTimestamp)

          await mailerSend.email.send(emailParams12Hours)
          emailScheduled = true
        }

        if (twoHoursBeforeTimestamp > currentTimestamp) {
          const emailParams2Hours = new EmailParams()
            .setFrom(sentFrom)
            .setTo(recipients)
            .setReplyTo(sentFrom)
            .setSubject('Appointment Reminder')
            .setHtml(html)
            .setText('This is a scheduled text content')
            .setSendAt(twoHoursBeforeTimestamp)

          await mailerSend.email.send(emailParams2Hours)
          emailScheduled = true
        }

        if (emailScheduled) {
          return res.send({
            message: 'Reminders scheduled successfully'
          })
        } else {
          return res.send({
            message: 'No reminders scheduled as the appointment is too close.'
          })
        }
      }
    } catch (error) {
      console.error('Error scheduling reminders:', error)
      res.status(500).send('Something went wrong')
    }
  } else {
    res.status(405).send('Method Not Allowed')
  }
}

export default connectDb(handler)

// import connectDb from 'src/Backend/databaseConnection'
// import AppointmentModel from 'src/Backend/schemas/appointment'

// import { MailerSend, EmailParams, Sender, Recipient } from 'mailersend'
// import { AppointmentType } from 'src/Backend/constants'
// import dayjs from 'dayjs'

// const mailerSend = new MailerSend({
//   apiKey: 'mlsn.544897ec14ebe9d972a8d04b94822641ebf83adeb29ba8554f9afa351c38f516'
// })

// const handler = async (req, res) => {
//   if (req.method === 'POST') {
//     try {
//       const { appointmentId } = req.body
//       const appointment = await AppointmentModel.findById(appointmentId)

//       if (!appointment) {
//         return res.status(404).send('Appointment not found')
//       }

//       if (appointment.status === AppointmentType.UP_COMING) {
//         const currentDate = new Date(appointment.appointment_date)
//         const time = appointment.appointment_time

//         const [hours, minutes] = time.split(':').map(Number)

//         currentDate.setHours(hours)
//         currentDate.setMinutes(minutes)

//         const twoHoursBeforeDate = new Date(currentDate)
//         twoHoursBeforeDate.setHours(twoHoursBeforeDate.getHours() - 2)
//         const twoHoursBeforeTimestamp = Math.floor(twoHoursBeforeDate.getTime() / 1000)

//         const twelveHoursBeforeDate = new Date(currentDate)
//         twelveHoursBeforeDate.setHours(twelveHoursBeforeDate.getHours() - 12)
//         const twelveHoursBeforeTimestamp = Math.floor(twelveHoursBeforeDate.getTime() / 1000)

//         const sentFrom = new Sender('info@rockstarpainting.us', 'RockStar Paints')

//         const recipients = [new Recipient(appointment.client_email, appointment.client_name)]

//         const html = `<!DOCTYPE html>
//       <html lang="en">
//       <head>
//           <meta charset="UTF-8">
//           <meta name="viewport" content="width=device-width, initial-scale=1.0">
//           <title>Appointment Confirmation</title>
//           <style>
//               body {
//                   font-family: 'Arial', sans-serif;
//                   background-color: #f4f4f4;
//                   margin: 0;
//                   padding: 0;
//                   color: #333;
//               }
//               .container {
//                   width: 100%;
//                   max-width: 600px;
//                   margin: 20px auto;
//                   background-color: #ffffff;
//                   padding: 20px;
//                   border-radius: 8px;
//                   box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
//               }
//               .header {
//                   text-align: center;
//                   padding: 20px 0;
//                   background-color: #0073e6;
//                   color: #ffffff;
//                   border-radius: 8px 8px 0 0;
//               }
//               .header h1 {
//                   margin: 0;
//                   font-size: 24px;
//               }
//               .content {
//                   padding: 20px;
//               }
//               .content p {
//                   margin: 10px 0;
//                   line-height: 1.6;
//               }
//               .content strong {
//                   color: #0073e6;
//               }
//               .appointment-details {
//                   background-color: #f9f9f9;
//                   border: 1px solid #e0e0e0;
//                   border-radius: 8px;
//                   padding: 15px;
//                   margin: 15px 0;
//               }
//               .appointment-details p {
//                   margin: 8px 0;
//               }
//               .footer {
//                   text-align: center;
//                   padding: 10px 0;
//                   background-color: #0073e6;
//                   color: black;
//                   font-size: 12px;
//                   border-radius: 0 0 8px 8px;
//               }
//               .footer p {
//                   margin: 0;
//               }
//               a {
//                   color: #0073e6;
//                   text-decoration: none;
//               }
//               a:hover {
//                   text-decoration: underline;
//               }
//           </style>
//       </head>
//       <body>
//           <div class="container">
//               <div class="header">
//                   <h1>Appointment Confirmation</h1>
//               </div>
//               <div class="content">
//                   <p>Dear <strong>${appointment.client_name}</strong>,</p>
//                   <p>We are pleased to confirm your appointment:</p>
//                   <div class="appointment-details">
//                       <p><strong>Date:</strong> ${dayjs(appointment.appointment_date).format('D-MMMM-YYYY')}</p>
//                       <p><strong>Time:</strong> ${appointment.appointment_time}</p>
//                   </div>
//                   <p>If you have any questions or need to reschedule, please contact us at <a href="mailto:info@rockstarpaints.us">info@rockstarpaints.us</a> or call us at <a href="tel:+17207715791">(720) 771-5791</a>.</p>
//                   <p>Thank you for choosing our services. We look forward to seeing you!</p>
//                   <p>Best regards,</p>
//                   <p><strong><a href="https://rockstarpaintingdenver.com/" target="_blank">RockStar Paints</a></strong></p>
//               </div>
//               <div class="footer">
//                   <a href="https://rockstarpaintingdenver.com/"
//                   <p>&copy; 2024 RockStar Paints. All rights reserved.</p>
//                   </a>
//               </div>
//           </div>
//       </body>
//       </html>
//       `

//         const emailParams = new EmailParams()
//           .setFrom(sentFrom)
//           .setTo(recipients)
//           .setReplyTo(sentFrom)
//           .setSubject('Appointment Reminder')
//           .setHtml(html)
//           .setText('This is a scheduled text content')
//           .setSendAt(twelveHoursBeforeTimestamp)

//         await mailerSend.email.send(emailParams)

//         const emailParams1 = new EmailParams()
//           .setFrom(sentFrom)
//           .setTo(recipients)
//           .setReplyTo(sentFrom)
//           .setSubject('Appointment Reminder')
//           .setHtml(html)
//           .setText('This is a scheduled text content')
//           .setSendAt(twoHoursBeforeTimestamp)

//         await mailerSend.email.send(emailParams1)
//       }

//       return res.send({
//         message: 'Reminders scheduled successfully'
//       })
//     } catch (error) {
//       console.error('Error scheduling reminders:', error)
//       res.status(500).send('Something went wrong')
//     }
//   } else {
//     res.status(405).send('Method Not Allowed')
//   }
// }

// export default connectDb(handler)
