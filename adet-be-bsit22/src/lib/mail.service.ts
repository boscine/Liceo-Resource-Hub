import * as postmark from 'postmark';

// Production Postmark Configuration (Following Postmark Skills Template)
const postmarkToken = process.env.POSTMARK_SERVER_TOKEN;
const client = postmarkToken ? new postmark.ServerClient(postmarkToken) : null;

/**
 * Institutional Mail Service - Postmark Skill Edition
 * Dispatches scholarly credentials using Postmark's high-fidelity delivery infrastructure.
 * This implementation follows the ActiveCampaign/postmark-skills patterns for production-ready code.
 */

const SCHOLARLY_THEME = {
  maroon: '#570000',
  gold: '#c5a021',
  goldLight: '#e4c666',
  cream: '#fcfbf7', // Refined archival cream
  text: '#1a1a1a',
  muted: '#6b7280'
};

const generateHtmlTemplate = (title: string, subtitle: string, content: string, footer: string) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700&display=swap');
    body { font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif; background-color: #f3f4f6; color: ${SCHOLARLY_THEME.text}; margin: 0; padding: 40px 20px; -webkit-font-smoothing: antialiased; }
    .email-wrapper { max-width: 600px; margin: 0 auto; background: ${SCHOLARLY_THEME.cream}; border-radius: 12px; overflow: hidden; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04); border: 1px solid #e5e7eb; }
    .institutional-banner { background: linear-gradient(135deg, ${SCHOLARLY_THEME.maroon} 0%, #800000 100%); padding: 8px; text-align: center; }
    .header { padding: 50px 40px 30px; text-align: center; }
    .logo-text { font-size: 28px; font-weight: 800; color: ${SCHOLARLY_THEME.maroon}; letter-spacing: -0.5px; line-height: 1; }
    .logo-sub { font-size: 11px; font-weight: 700; color: ${SCHOLARLY_THEME.gold}; letter-spacing: 4px; text-transform: uppercase; margin-top: 10px; }
    .content-area { padding: 20px 40px 40px; text-align: center; }
    .badge { display: inline-block; padding: 6px 12px; background: #fee2e2; color: ${SCHOLARLY_THEME.maroon}; border-radius: 9999px; font-size: 11px; font-weight: 700; text-transform: uppercase; margin-bottom: 30px; letter-spacing: 1px; }
    .main-title { font-size: 24px; font-weight: 800; color: #111827; margin-bottom: 12px; line-height: 1.2; }
    .description { font-size: 16px; color: ${SCHOLARLY_THEME.muted}; line-height: 1.6; margin-bottom: 32px; }
    
    /* Option A: The Link Button */
    .btn-action { 
      display: inline-block; 
      padding: 16px 36px; 
      background: linear-gradient(to bottom right, ${SCHOLARLY_THEME.maroon}, #800000); 
      color: #ffffff !important; 
      text-decoration: none; 
      font-weight: 700; 
      font-size: 15px;
      border-radius: 8px;
      border: 1px solid ${SCHOLARLY_THEME.gold};
      box-shadow: 0 4px 6px -1px rgba(87, 0, 0, 0.2);
      transition: transform 0.2s;
    }
    
    /* Option B: The Code Box */
    .restoration-code { 
      background: linear-gradient(135deg, #fefce8 0%, #fef9c3 100%);
      border: 2px dashed ${SCHOLARLY_THEME.gold};
      border-radius: 12px;
      padding: 24px;
      margin: 20px 0;
      display: inline-block;
    }
    .code-text { 
      font-family: 'Courier New', monospace; 
      font-size: 42px; 
      font-weight: 800; 
      color: ${SCHOLARLY_THEME.maroon}; 
      letter-spacing: 8px;
      line-height: 1;
    }

    .footer { background: #f9fafb; padding: 32px 40px; text-align: center; border-top: 1px solid #f3f4f6; }
    .footer-text { font-size: 12px; color: #9ca3af; line-height: 1.5; }
    .security-note { font-size: 11px; color: ${SCHOLARLY_THEME.maroon}; font-weight: 600; margin-top: 20px; font-style: italic; }
  </style>
</head>
<body>
  <div class="email-wrapper">
    <div class="institutional-banner"></div>
    <div class="header">
      <div class="logo-text">LICEO HUB</div>
      <div class="logo-sub">The Academic Curator</div>
    </div>
    <div class="content-area">
      <div class="badge">Institutional Security Protocol</div>
      <div class="main-title">${title}</div>
      <p class="description">${subtitle}</p>
      <div style="margin: 32px 0;">
        ${content}
      </div>
      <p class="security-note">This request expires in 60 minutes for your archival protection.</p>
    </div>
    <div class="footer">
      <div class="footer-text">
        Liceo de Cagayan University — Scholarly Repository Services<br>
        This is an automated dispatch. Please do not reply to this archive.
      </div>
      <div style="margin-top: 16px; font-size: 10px; color: #d1d5db;">
        © 2026 Liceo de Cagayan University. All rights reserved.
      </div>
    </div>
  </div>
</body>
</html>
`;

export const sendOTPEmail = async (email: string, code: string) => {
  const html = generateHtmlTemplate(
    'Identity Verification',
    'To complete your registration in the Liceo Resource Hub, please use the following access code.',
    `<div class="restoration-code"><span class="code-text">${code}</span></div>`,
    'Institutional Registration Protocol'
  );

  if (!client) {
    console.warn('[POSTMARK] Client not initialized. Verify POSTMARK_SERVER_TOKEN.');
    return { success: false, error: 'CLIENT_MISSING' };
  }

  try {
    const response = await client.sendEmail({
      From: process.env.POSTMARK_FROM || 'noreply@liceo.edu.ph',
      To: email,
      Subject: 'Institutional Access Code - Liceo Hub',
      HtmlBody: html,
      MessageStream: 'outbound' // Recommended practice for transactional traffic
    });

    return { success: response.ErrorCode === 0, messageId: response.MessageID };
  } catch (err: any) {
    // Error Handling following Postmark Skills (interpreting HTTP 422, etc.)
    console.error(`[POSTMARK_ERROR] Code ${err.code}: ${err.message}`);
    return { success: false, error: err.message };
  }
};

export const sendPasswordResetEmail = async (email: string, name: string, url: string) => {
  const html = generateHtmlTemplate(
    'Credential Restoration',
    'The Registry has received a request to restore your scholarly credentials. Please follow the secure link below to reset your password.',
    `<a href="${url}" class="btn-action" target="_blank">Restore Credentials</a>
     <p style="font-size: 12px; color: #9ca3af; margin-top: 30px; word-break: break-all;">
       If the button above does not work, copy and paste this URL into your browser:<br>
       <a href="${url}" style="color: ${SCHOLARLY_THEME.maroon};">${url}</a>
     </p>`,
    'Institutional Password Restoration Portal'
  );

  if (!client) {
    console.warn('[POSTMARK] Client not initialized. Verify POSTMARK_SERVER_TOKEN.');
    return { success: false, error: 'CLIENT_MISSING' };
  }

  try {
    const response = await client.sendEmail({
      From: process.env.POSTMARK_FROM || 'noreply@liceo.edu.ph',
      To: email,
      Subject: 'Restore your Liceo Hub password',
      HtmlBody: html,
      MessageStream: 'outbound'
    });

    return { success: response.ErrorCode === 0, messageId: response.MessageID };
  } catch (err: any) {
    console.error(`[POSTMARK_ERROR] Code ${err.code}: ${err.message}`);
    return { success: false, error: err.message };
  }
};
