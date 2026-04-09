import nodemailer from 'nodemailer';

/**
 * Mail Service for Liceo Resource Hub
 * Handles the dispatch of OTPs and Password Reset links with a scholarly aesthetic.
 */

// Configure transporter (Using Ethereal for testing if no env vars)
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.ethereal.email',
  port: Number(process.env.SMTP_PORT) || 587,
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER || 'ethereal_user', 
    pass: process.env.SMTP_PASS || 'ethereal_pass',
  },
});

export const sendOTPEmail = async (email: string, code: string) => {
  const mailOptions = {
    from: `"Liceo Hub Curator" <${process.env.SMTP_USER || 'noreply@liceo.edu.ph'}>`,
    to: email,
    subject: 'Academic Access Code: Verification Required',
    html: `
      <div style="font-family: 'Georgia', serif; max-width: 600px; margin: 0 auto; border: 1px solid #570000; border-radius: 8px; overflow: hidden;">
        <div style="background-color: #570000; padding: 20px; text-align: center;">
          <h1 style="color: #c5a021; margin: 0; font-style: italic;">The Academic Curator</h1>
        </div>
        <div style="padding: 30px; background-color: #ffffff; color: #191c1d;">
          <h2 style="color: #570000; border-bottom: 2px solid #c5a021; padding-bottom: 10px;">Verification Identity</h2>
          <p>Esteemed Scholar,</p>
          <p>To finalize your registration at the <strong>Liceo Resource Hub</strong>, please utilize the following single-use access code:</p>
          <div style="background-color: #f8f9fa; border: 1px dashed #c5a021; padding: 20px; text-align: center; margin: 25px 0;">
            <span style="font-size: 32px; letter-spacing: 8px; font-weight: bold; color: #570000;">${code}</span>
          </div>
          <p style="font-size: 14px; color: #666;">This code will expire in 2 hours. If you did not initiate this request, no further action is required.</p>
        </div>
        <div style="background-color: #f8f9fa; padding: 15px; text-align: center; font-size: 12px; color: #9c7c00; border-top: 1px solid #eee;">
          &copy; 2026 Liceo de Cagayan University - Academic Resource Hub
        </div>
      </div>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`[MAIL] OTP dispatched to ${email}: ${info.messageId}`);
    return info;
  } catch (error) {
    console.error('[MAIL] Error sending OTP:', error);
    throw error;
  }
};

export const sendPasswordResetEmail = async (email: string, token: string) => {
  // In a real app, this would be a link to your frontend reset page
  const resetLink = `http://localhost:4200/auth/reset-password?token=${token}`;

  const mailOptions = {
    from: `"Liceo Hub Curator" <${process.env.SMTP_USER || 'noreply@liceo.edu.ph'}>`,
    to: email,
    subject: 'Archival Restoration: Password Reset Request',
    html: `
      <div style="font-family: 'Georgia', serif; max-width: 600px; margin: 0 auto; border: 1px solid #570000; border-radius: 8px; overflow: hidden;">
        <div style="background-color: #570000; padding: 20px; text-align: center;">
          <h1 style="color: #c5a021; margin: 0; font-style: italic;">The Academic Curator</h1>
        </div>
        <div style="padding: 30px; background-color: #ffffff; color: #191c1d;">
          <h2 style="color: #570000; border-bottom: 2px solid #c5a021; padding-bottom: 10px;">Credential Recovery</h2>
          <p>Esteemed Scholar,</p>
          <p>We received a request to restore access to your account. Please click the button below to establish a new password:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetLink}" style="background-color: #570000; color: #c5a021; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold; display: inline-block;">Reset Password</a>
          </div>
          <p style="font-size: 14px; color: #666;">If the button above does not work, copy and paste this URL into your browser:</p>
          <p style="font-size: 12px; word-break: break-all; color: #9c7c00;">${resetLink}</p>
        </div>
        <div style="background-color: #f8f9fa; padding: 15px; text-align: center; font-size: 12px; color: #9c7c00; border-top: 1px solid #eee;">
          &copy; 2026 Liceo de Cagayan University - Academic Resource Hub
        </div>
      </div>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`[MAIL] Reset link dispatched to ${email}: ${info.messageId}`);
    return info;
  } catch (error) {
    console.error('[MAIL] Error sending Reset Email:', error);
    throw error;
  }
};
