// src/lib/send-email.js
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export const sendEmail = async ({ to, subject, text, html, from }) => {
    try {
        // Use Resend's test domain as default
        const fromEmail = from || process.env.EMAIL_FROM || 'onboarding@resend.dev';
        
        console.log(`📧 Sending email via Resend test domain...`);
        console.log(`📨 From: ${fromEmail}`);
        console.log(`📨 To: ${to}`);
        
        const { data, error } = await resend.emails.send({
            from: fromEmail,
            to: to,
            subject: subject,
            text: text || html?.replace(/<[^>]*>/g, ''),
            html: html,
        });

        if (error) {
            console.error('❌ Resend error:', error);
            throw new Error(error.message);
        }

        console.log(`✅ Email sent successfully!`);
        console.log(`📨 Email ID: ${data.id}`);
        console.log(`📨 Check your inbox at: ${to}`);
        
        return data;
    } catch (error) {
        console.error('❌ Failed to send email:', error);
        throw error;
    }
};