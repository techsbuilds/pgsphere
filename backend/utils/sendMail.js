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

export const sendContctEmail = async (data) => {
    try {
        const { name, email, mobile_no, message } = data;

        await sendEmail({
            to:"techsbuilds@gmail.com",
            subject: "New Contact Form Details from Pgsphere Website",
            html: `
            < !DOCTYPE html>
            <html lang="en">
                <head>
                    <meta charset="UTF-8" />
                    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
                    <title>New Contact Form Submission</title>
                </head>
                <body style="font-family: Arial, sans-serif; background-color: #f4f6f9; padding: 20px;">
                    <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: auto; background: #ffffff; border-radius: 10px; box-shadow: 0px 4px 10px rgba(0,0,0,0.1); overflow: hidden;">
                        <tr>
                            <td style="background: #4f46e5; padding: 20px; text-align: center; color: white; font-size: 20px; font-weight: bold;">
                                📩 New Contact Details From Pgsphere-Website
                            </td>
                        </tr>
                        <tr>
                            <td style="padding: 20px; color: #333;">
                                <p style="font-size: 16px;">You have received a new contact form submission. Here are the details:</p>

                                <table width="100%" cellpadding="8" cellspacing="0" style="border-collapse: collapse; margin-top: 10px;">
                                    <tr style="background: #f9fafb;">
                                        <td style="font-weight: bold; width: 120px;">👤 Name:</td>
                                        <td> ${name} </td>
                                    </tr>
                                    <tr>
                                        <td style="font-weight: bold;">📧 Email:</td>
                                        <td>${email}</td>
                                    </tr>
                                    <tr style="background: #f9fafb;">
                                        <td style="font-weight: bold;">📱 Mobile:</td>
                                        <td>${mobile_no}</td>
                                    </tr>
                                    <tr>
                                        <td style="font-weight: bold;">💬 Message:</td>
                                        <td>${message}</td>
                                    </tr>
                                </table>

                                <p style="margin-top: 20px; font-size: 14px; color: #666;">
                                    🚀 This message was automatically generated by your website’s contact form.
                                </p>
                            </td>
                        </tr>
                        <tr>
                            <td style="background: #f3f4f6; padding: 15px; text-align: center; font-size: 12px; color: #888;">
                                © 2025 Your Company. All rights reserved.
                            </td>
                        </tr>
                    </table>
                </body>
            </html>`

        })
    } catch (error) {
        console.error("Error sending contact email:", error);
        return false
    }
    return true
}