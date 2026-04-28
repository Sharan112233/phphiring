import { NextRequest, NextResponse } from 'next/server'
import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
})

export async function POST(req: NextRequest) {
  try {
    const { name, email, subject, message } = await req.json()

    if (!name || !email || !subject || !message) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 })
    }

    await transporter.sendMail({
      from: `"PHPhire Contact" <${process.env.GMAIL_USER}>`,
      to: process.env.GMAIL_USER,
      replyTo: email,
      subject: `[PHPhire Contact] ${subject} — from ${name}`,
      html: `
        <div style="font-family:Inter,sans-serif;max-width:560px;margin:0 auto;padding:32px;background:#fff;border:1px solid #e5e7eb;border-radius:12px">
          <h2 style="color:#0F0A1E;margin:0 0 20px 0">New Contact Form Submission</h2>
          <table style="width:100%;border-collapse:collapse;font-size:14px">
            <tr><td style="padding:8px 0;color:#6b7280;width:100px">Name</td><td style="padding:8px 0;font-weight:600;color:#0F0A1E">${name}</td></tr>
            <tr><td style="padding:8px 0;color:#6b7280">Email</td><td style="padding:8px 0;font-weight:600;color:#7C3AED">${email}</td></tr>
            <tr><td style="padding:8px 0;color:#6b7280">Subject</td><td style="padding:8px 0;font-weight:600;color:#0F0A1E">${subject}</td></tr>
          </table>
          <hr style="border:none;border-top:1px solid #e5e7eb;margin:16px 0" />
          <p style="color:#374151;line-height:1.7;font-size:14px;white-space:pre-wrap">${message}</p>
        </div>
      `,
    })

    // Auto-reply to sender
    await transporter.sendMail({
      from: `"PHPhire" <${process.env.GMAIL_USER}>`,
      to: email,
      subject: 'We received your message — PHPhire',
      html: `
        <div style="font-family:Inter,sans-serif;max-width:560px;margin:0 auto;padding:32px;background:#fff;border:1px solid #e5e7eb;border-radius:12px">
          <h2 style="color:#0F0A1E;margin:0 0 12px 0">Thanks for reaching out, ${name}! 👋</h2>
          <p style="color:#6b7280;font-size:14px;line-height:1.7">We've received your message about <strong>${subject}</strong> and will get back to you within 1–2 business days.</p>
          <p style="color:#6b7280;font-size:13px;margin-top:24px">— The PHPhire Team</p>
        </div>
      `,
    })

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Contact form error:', err)
    return NextResponse.json({ error: 'Failed to send message' }, { status: 500 })
  }
}
