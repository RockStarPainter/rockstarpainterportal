import { MailerSend, EmailParams, Recipient, Scheduling, SmsParams } from 'mailersend'

const mailerSend = new MailerSend({
  api_key: process.env.MAILERSEND_API_KEY // Ensure you have this in your .env.local
})

const sendEmail = async (to, subject, text) => {
  const emailParams = new EmailParams()
    .setFrom('info@rockstarpaintingdenver.com')
    .setTo([new Recipient(to)])
    .setSubject(subject)
    .setHtml(text)

  try {
    await mailerSend.email.send(emailParams)
    console.log('Email sent successfully')
  } catch (error) {
    console.error('Error sending email:', error.response ? error.response.data : error)
    throw error
  }
}

const scheduleEmail = async (to, subject, text, sendAt) => {
  const scheduling = new Scheduling().setSendAt(sendAt)

  const emailParams = new EmailParams()
    .setFrom('info@rockstarpaintingdenver.com')
    .setTo([new Recipient(to)])
    .setSubject(subject)
    .setHtml(text)
    .setScheduling(scheduling)

  try {
    await mailerSend.email.send(emailParams)
    console.log('Scheduled email successfully')
  } catch (error) {
    console.error('Error scheduling email:', error.response ? error.response.data : error)
    throw error
  }
}

const sendSMS = async (to, text) => {
  const smsParams = new SmsParams()
    .setFrom('+18448975791') // Replace with your MailerSend virtual number
    .setRecipients([to])
    .setText(text)

  try {
    await mailerSend.sms.send(smsParams)
    console.log('SMS sent successfully')
  } catch (error) {
    console.error('Error sending SMS:', error.response ? error.response.data : error)
    throw error
  }
}

export { sendEmail, scheduleEmail, sendSMS }
