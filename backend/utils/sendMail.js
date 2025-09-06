import nodemailer from 'nodemailer';

const sendEmail = async (options) => {
  // Create a transporter
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
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
            subject: 'Registration Successful',
            html: `<p>Your registration was successful!</p><p>Your PG Code is: <strong>${pgcode}</strong></p><p>You can access your dashboard <a href="${dashboard_url}">here</a>.</p>`,
        });
    } catch (error) {
        console.error('Error sending registration email:', error);
        return false;
    }

    return true;
};
