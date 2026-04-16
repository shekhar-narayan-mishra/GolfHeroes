import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY || 're_dummy_key_for_dev');

// Utility to catch missing API keys gracefully in development
const isConfigured = !!process.env.RESEND_API_KEY;

export const sendEmail = async ({ to, subject, html }) => {
  if (!isConfigured) {
    console.log(`📧 [Development] Email stub: to=${to}, subject=${subject}`);
    return { id: 'dev-mode' };
  }

  try {
    const data = await resend.emails.send({
      from: 'Digital Heroes <hello@digitalheroes.example.com>',
      to,
      subject,
      html,
    });
    return data;
  } catch (error) {
    console.error('Error sending email:', error);
    return null;
  }
};

export const sendWelcomeEmail = async (user) => {
  return sendEmail({
    to: user.email,
    subject: 'Welcome to Digital Heroes! 🏌️‍♂️',
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #1e293b;">
        <h1 style="color: #0f172a;">Welcome, ${user.name.split(' ')[0]}!</h1>
        <p>Thank you for joining Digital Heroes.</p>
        <p>You've taken the first step towards better golf, exciting prizes, and making a real difference through charity.</p>
        <p><strong>Next steps:</strong></p>
        <ul>
          <li>Start tracking your Stableford scores</li>
          <li>Choose your supported charity from your dashboard</li>
        </ul>
        <p>If you have any questions, simply reply to this email.</p>
      </div>
    `,
  });
};

export const sendDrawPublishedEmail = async (user, drawResult = null) => {
  const isWinner = !!drawResult;
  let html = `<div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #1e293b;">
    <h1 style="color: #0f172a;">The latest draw results are in! 🎰</h1>
    <p>Hi ${user.name.split(' ')[0]},</p>
    <p>The numbers for this month's draw have been published.</p>`;
  
  if (isWinner) {
    html += `
      <div style="background-color: #f0fdf4; border-left: 4px solid #22c55e; padding: 16px; margin: 24px 0;">
        <h2 style="color: #166534; margin-top: 0;">🎉 You matched ${drawResult.matchTier} numbers!</h2>
        <p>Congratulations! You've successfully landed a prize tier.</p>
        <p>Please log in to your dashboard to upload your scorecard proof and claim your prize.</p>
        <a href="${process.env.CLIENT_URL || 'http://localhost:5173'}/dashboard" style="display: inline-block; background-color: #0ea5e9; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; margin-top: 12px;">Go to Dashboard</a>
      </div>
    `;
  } else {
    html += `
      <p>Unfortunately, your numbers didn't match the winning combination this time.</p>
      <p>Don't worry – your subscription continues to support your chosen charity, and there's always next month!</p>
      <p>Keep entering those scores.</p>
      <a href="${process.env.CLIENT_URL || 'http://localhost:5173'}/scores" style="display: inline-block; background-color: #0ea5e9; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; margin-top: 12px;">Track New Scores</a>
    `;
  }

  html += `</div>`;

  return sendEmail({
    to: user.email,
    subject: isWinner ? '🎉 You won! Digital Heroes draw results' : 'Digital Heroes: Draw results published',
    html,
  });
};

export const sendWinnerProofAlert = async (winner) => {
  // Can be used to manually alert a winner if they haven't uploaded proof
  return sendEmail({
    to: winner.userId.email,
    subject: 'Action Required: Upload your scorecard proof',
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Hi ${winner.userId.name.split(' ')[0]},</h2>
        <p>You have an unclaimed prize waiting!</p>
        <p>In order to process your payout, we need you to upload a clear photo of your scorecard.</p>
        <a href="${process.env.CLIENT_URL || 'http://localhost:5173'}/dashboard">Upload Proof Here</a>
      </div>
    `
  });
};

export const sendVerificationApproved = async (winner) => {
  return sendEmail({
    to: winner.userId.email,
    subject: '🎉 Your proof has been approved! — Digital Heroes',
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Hi ${winner.userId.name.split(' ')[0]},</h2>
        <p>Great news! Your scorecard proof has been successfully verified.</p>
        <p>Your payout is currently being processed and will be sent to your account shortly. We will notify you once it's complete.</p>
        <p>Thank you for playing, and keep up the great golf!</p>
      </div>
    `
  });
};

export const sendPayoutConfirmed = async (winner) => {
  return sendEmail({
    to: winner.userId.email,
    subject: '💰 Payout sent! — Digital Heroes',
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Hi ${winner.userId.name.split(' ')[0]},</h2>
        <p>Your prize payout has been successfully processed and sent to your account.</p>
        <p>Enjoy your winnings, and thank you for being a hero for your charity!</p>
      </div>
    `
  });
};
