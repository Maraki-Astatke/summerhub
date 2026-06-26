import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

transporter.verify((error, success) => {
  if (error) {
    console.error('❌ Email transporter error:', error);
  } else {
    console.log('✅ Email transporter ready to send emails');
  }
});

export async function sendVerificationEmail(to, token) {
  const verificationLink = `http://localhost:5001/api/auth/verify/${token}`;

  const mailOptions = {
    from: `"HobbyHub" <${process.env.EMAIL_USER}>`,
    to: to,
    subject: 'Verify Your HobbyHub Account',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 12px; padding: 20px;">
        <h1 style="color: #4F46E5; text-align: center;">Welcome to HobbyHub! 🎨</h1>
        <p style="font-size: 16px;">Thanks for signing up! Please verify your email address by clicking the button below:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${verificationLink}" 
             style="display: inline-block; background-color: #4F46E5; color: white; padding: 12px 32px; text-decoration: none; border-radius: 8px; font-size: 16px;">
            Verify My Account
          </a>
        </div>
        <p style="font-size: 14px; color: #666;">Or copy and paste this link into your browser:</p>
        <p style="font-size: 14px; background-color: #f5f5f5; padding: 10px; border-radius: 6px; word-break: break-all;">${verificationLink}</p>
        <p style="font-size: 12px; color: #999; text-align: center; margin-top: 30px;">This link expires in 24 hours.</p>
        <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 20px 0;" />
        <p style="font-size: 12px; color: #999; text-align: center;">If you didn't sign up for HobbyHub, please ignore this email.</p>
      </div>
    `
  };

  await transporter.sendMail(mailOptions);
}

export async function sendResetEmail(to, token) {
  const resetLink = `http://localhost:3000/reset-password/${token}`;

  const mailOptions = {
    from: `"HobbyHub" <${process.env.EMAIL_USER}>`,
    to: to,
    subject: 'Reset Your HobbyHub Password',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 12px; padding: 20px;">
        <h1 style="color: #4F46E5; text-align: center;">Reset Your Password</h1>
        <p style="font-size: 16px;">You requested to reset your password. Click the button below:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetLink}" 
             style="display: inline-block; background-color: #4F46E5; color: white; padding: 12px 32px; text-decoration: none; border-radius: 8px; font-size: 16px;">
            Reset Password
          </a>
        </div>
        <p style="font-size: 14px; color: #666;">Or copy this link: ${resetLink}</p>
        <p style="font-size: 12px; color: #999; text-align: center;">This link expires in 1 hour.</p>
        <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 20px 0;" />
        <p style="font-size: 12px; color: #999; text-align: center;">If you didn't request this, please ignore this email.</p>
      </div>
    `
  };

  await transporter.sendMail(mailOptions);
}

export function generateVerificationToken() {
  return Math.random().toString(36).substring(2, 15) +
    Math.random().toString(36).substring(2, 15);
}
