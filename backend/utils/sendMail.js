import nodemailer from 'nodemailer';

const sendEmail = async (options) => {
  // Create a transporter
  const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
   });

  // Send the email
  const info = await transporter.sendMail({
    from: process.env.SMTP_FROM,
    to: options.to,
    subject: options.subject,
    html: options.html,
  });
};

export const sendOtopEmail = async (to, otp) => {
    try {
        await sendEmail({
            to,
            subject: 'Your OTP Code',
            html: `<p>Your OTP code is: <strong>${otp}</strong></p><p>This code will expire in 3 minutes.</p>`,
        });
    } catch (error) {
        console.error('Error sending OTP email:', error);
        return false;
    }

    return true;
};

export const sendRegistrationEmail = async (to, pgcode, dashboard_url) => {
    try {
        await sendEmail({
            to,
            subject: "🎉 Registration Successful",
            html: `
            <div style="font-family: Arial, sans-serif; background-color: #f9f9f9; padding: 20px;">
                <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width:600px;margin:auto;background:#ffffff;border-radius:10px;box-shadow:0 2px 6px rgba(0,0,0,0.1);">
                    <tr>
                        <td style="text-align:center;padding:20px;background:#4f46e5;border-top-left-radius:10px;border-top-right-radius:10px;">
                            <h1 style="color:#ffffff;margin:0;font-size:24px;">Welcome to Our Pgsphere 🎉</h1>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding:30px 20px;text-align:left;color:#333333;">
                            <p style="font-size:16px;">Hello,</p>
                            <p style="font-size:16px;">Your registration was successful! We're excited to have you onboard.</p>
                            <p style="font-size:16px;">Here is your PG Code:</p>
                            <div style="text-align:center;margin:20px 0;">
                                <span style="display:inline-block;padding:12px 24px;background:#4f46e5;color:#ffffff;font-size:20px;border-radius:8px;font-weight:bold;">
                                    ${pgcode}
                                </span>
                            </div>
                            <p style="font-size:16px;">You can access your dashboard by clicking the button below:</p>
                            <div style="text-align:center;margin:25px 0;">
                                <a href="${dashboard_url}" style="background:#10b981;color:#ffffff;padding:12px 24px;text-decoration:none;font-size:16px;border-radius:8px;font-weight:bold;">
                                    Go to Dashboard
                                </a>
                            </div>
                            <p style="font-size:14px;color:#666666;">If the button above doesn’t work, copy and paste this link into your browser:</p>
                            <p style="word-break:break-all;color:#4f46e5;font-size:14px;">${dashboard_url}</p>
                            <hr style="border:none;border-top:1px solid #eeeeee;margin:30px 0;">
                            <p style="font-size:12px;color:#888888;text-align:center;">This is an automated message. Please do not reply.</p>
                        </td>
                    </tr>
                </table>
            </div>
            `,
        });
    } catch (error) {
        console.error("Error sending registration email:", error);
        return false;
    }

    return true;
};
