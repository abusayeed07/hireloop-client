// // src/lib/email-server.js
// import { Resend } from 'resend';

// const resend = new Resend(process.env.RESEND_API_KEY);

// export async function sendEmail({ to, subject, text, html }) {
//   try {
//     console.log("📧 Sending email to:", to);
//     console.log("📧 Using from:", process.env.EMAIL_FROM || 'onboarding@resend.dev');
    
//     const { data, error } = await resend.emails.send({
//       from: process.env.EMAIL_FROM || 'onboarding@resend.dev',
//       to: to,
//       subject: subject,
//       text: text,
//       html: html,
//     });

//     if (error) {
//       console.error('❌ Resend error:', error);
//       throw new Error(error.message);
//     }

//     console.log('✅ Email sent successfully:', data);
//     return { success: true, data };
//   } catch (error) {
//     console.error('❌ Failed to send email:', error);
//     throw error; // Re-throw so it's caught by the parent
//   }
// }