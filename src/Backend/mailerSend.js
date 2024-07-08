import { MailerSend, EmailParams, Recipient, Scheduling } from 'mailersend'

const mailerSend = new MailerSend({
  api_key: process.env.MAILERSEND_API_KEY // Ensure you have this in your .env.local
})
console.log('MailerSend API Key:', process.env.MAILERSEND_API_KEY) // Add this line

const sendEmail = async (to, subject, text) => {
  const emailParams = new EmailParams()
    .setFrom('info@rockstarpaintingdenver.com')

    // .setFromName('Rockstar Painting')
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

    // .setFromName('Rockstar Painting')
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

export { sendEmail, scheduleEmail }
