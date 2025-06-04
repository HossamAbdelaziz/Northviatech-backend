const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
const fetch = require('node-fetch');
require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.json());

app.post('/send-email', async (req, res) => {
  const {
    from_name,
    from_email,
    phone_number,
    message,
    best_time,
    token,
  } = req.body;

  // 🐛 Log the incoming request
  console.log('📩 Incoming form data:', {
    from_name,
    from_email,
    phone_number,
    message,
    best_time,
    token,
  });

  // ✅ Verify reCAPTCHA token
  const verifyUrl = `https://www.google.com/recaptcha/api/siteverify?secret=${process.env.RECAPTCHA_SECRET}&response=${token}`;
  try {
    const response = await fetch('https://www.google.com/recaptcha/api/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `secret=${process.env.RECAPTCHA_SECRET}&response=${token}`,
    });
    const data = await response.json();

    // 🐛 Log the reCAPTCHA verification response
    console.log('🔐 reCAPTCHA verification response:', data);

    if (!data.success || data.score < 0.5) {
      console.warn('⚠️ reCAPTCHA verification failed.');
      return res.status(400).json({ success: false, message: 'reCAPTCHA failed. Try again.' });
    }
  } catch (err) {
    console.error('❌ Error verifying reCAPTCHA:', err);
    return res.status(500).json({ success: false, message: 'Error verifying reCAPTCHA' });
  }

  // ✅ Setup transporter
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: 465,
    secure: true,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  // ✅ Internal lead email (to you)
  const leadMail = {
    from: `"${from_name}" <${from_email}>`,
    to: process.env.RECEIVER_EMAIL,
    subject: `New Quote Request from ${from_name}`,
    html: `
            <h2>New Quote Request</h2>
            <p><strong>Name:</strong> ${from_name}</p>
            <p><strong>Email:</strong> ${from_email}</p>
            <p><strong>Phone:</strong> ${phone_number}</p>
            <p><strong>Best Time to Reach:</strong> ${best_time}</p>
            <p><strong>Message:</strong><br>${message}</p>
        `,
  };

  // ✅ Auto-reply email to client
  const autoReply = {
    from: `"NorthViaTech" <${process.env.SMTP_USER}>`,
    to: from_email,
    subject: 'Thank you for contacting NorthViaTech',
    html: `
  <!DOCTYPE html>
  <html lang="en" style="margin: 0; padding: 0;">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
      <title>NorthViaTech Auto Reply</title>
    </head>
    <body style="margin: 0; padding: 0; background-color: #f8f9fa; font-family: Arial, sans-serif; color: #333;">
      <table width="100%" cellspacing="0" cellpadding="0" style="padding: 30px 0; background-color: #f8f9fa;">
        <tr>
          <td align="center">
            <table width="600" cellpadding="0" cellspacing="0" style="background: #ffffff; border-radius: 8px; box-shadow: 0 0 15px rgba(0,0,0,0.05); overflow: hidden;">
              <!-- Logo -->
              <tr>
                <td align="center" style="padding: 30px 20px 10px;">
                  <img src="cid:northvia-logo" alt="NorthViaTech Logo" style="max-height: 50px;" />
                </td>
              </tr>

              <!-- Header -->
              <tr>
                <td align="center" style="padding: 10px 20px 0;">
                  <h2 style="margin: 0; font-size: 22px; color: #222;">Your Workflow, Automated</h2>
                  <p style="margin: 10px 0 0; font-size: 16px; color: #555;">
                    Thanks for reaching out to NorthViaTech
                  </p>
                </td>
              </tr>

              <!-- Message -->
              <tr>
                <td style="padding: 30px 40px 10px;">
                  <p style="font-size: 16px; line-height: 1.6; color: #333;">
                    Hi <strong>${from_name}</strong>,
                    <br><br>
                    We’re excited to explore how we can help your business simplify operations and reduce up to <strong>40% of your manual tasks</strong> using smart tools and automation.
                    <br><br>
                    Whether it’s dashboards, reminders, CRM systems, or fully custom software — we build solutions tailored to your workflow.
                    <br><br>
                    We’re a <strong>100% Canadian</strong> team focused on clean, scalable, and reliable systems built around your needs.
                    <br><br>
                    We’ll follow up soon during your preferred time: <strong>${best_time}</strong>.
                    <br><br>
                    If you have more details or would like to get started sooner, feel free to reply to this email directly.
                  </p>
                </td>
              </tr>

              <!-- Footer -->
              <tr>
                <td style="padding: 30px 40px 10px;">
                  <hr style="border: none; border-top: 1px solid #ddd; margin-bottom: 20px;" />
                  <p style="font-size: 14px; color: #777; line-height: 1.6; margin: 0;">
                    Hossam Abdelaziz<br/>
                    Founder — NorthViaTech<br/>
                    📞 (647) 675-3343<br/>
                    ✉️ info@northviatech.com<br/>
                    🌐 <a href="https://northviatech.com" style="color: #00b894;">northviatech.com</a><br/>
                    🗺️ <em>(Google Business link coming soon)</em>
                  </p>

                  <!-- Social Media Icons -->
                  <div style="margin-top: 25px; text-align: center;">
                    <a href="https://www.facebook.com/people/Northviatech/61576781919009/" style="margin: 0 6px;">
                      <img src="https://cdn-icons-png.flaticon.com/24/733/733547.png" alt="Facebook" style="width: 24px;" />
                    </a>
                    <a href="https://www.instagram.com/northviatech/" style="margin: 0 6px;">
                      <img src="https://cdn-icons-png.flaticon.com/24/2111/2111463.png" alt="Instagram" style="width: 24px;" />
                    </a>
                    <a href="https://www.linkedin.com/company/north-via-tech/" style="margin: 0 6px;">
                      <img src="https://cdn-icons-png.flaticon.com/24/145/145807.png" alt="LinkedIn" style="width: 24px;" />
                    </a>
                    <a href="https://dribbble.com/NorthViaTech" style="margin: 0 6px;">
                      <img src="https://cdn-icons-png.flaticon.com/24/145/145802.png" alt="Dribbble" style="width: 24px;" />
                    </a>
                    <a href="https://x.com/NorthViatech" style="margin: 0 6px;">
                      <img src="https://cdn-icons-png.flaticon.com/24/733/733579.png" alt="Twitter / X" style="width: 24px;" />
                    </a>
                  </div>
                </td>
              </tr>

              <tr>
                <td style="text-align: center; padding: 10px; font-size: 12px; color: #aaa;">
                  &copy; ${new Date().getFullYear()
      } NorthViaTech.All rights reserved.
                </td >
              </tr >
            </table >
          </td >
        </tr >
      </table >
    </body >
  </html >
    `,
    attachments: [
      {
        filename: 'logo.png',
        path: './logo.png',
        cid: 'northvia-logo'
      }
    ]
  };



  try {
    await transporter.sendMail(leadMail);
    await transporter.sendMail(autoReply);
    console.log('✅ Emails sent successfully.');
    res.status(200).json({ success: true, message: 'Email sent successfully' });
  } catch (error) {
    console.error('❌ Error sending email:', error);
    res.status(500).json({ success: false, message: 'Email failed to send' });
  }
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`✅ Email server running on http://localhost:${PORT}`);
});
