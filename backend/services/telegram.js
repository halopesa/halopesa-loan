function generateOTP() {
  return Math.floor(1000 + Math.random() * 9000).toString();
}

async function notifyAdmin(bot, loanData, userChatId) {
  const adminChatId = process.env.TELEGRAM_ADMIN_CHAT_ID;
  const message = `
📋 <b>New Loan Application</b>

<b>Applicant Info:</b>
• Name: ${loanData.name}
• Email: ${loanData.email}
• Phone: ${loanData.phone}
• Telegram Chat ID: <code>${userChatId}</code>

<b>Loan Details:</b>
• Amount: TZS ${loanData.amount.toLocaleString()}
• Duration: ${loanData.duration} months
• Purpose: ${loanData.purpose}

<b>Application ID:</b> <code>${loanData.id}</code>
<b>Status:</b> ⏳ Pending Review
  `;

  try {
    await bot.sendMessage(adminChatId, message, { parse_mode: 'HTML' });
  } catch (error) {
    console.error('Admin notification error:', error);
  }
}

async function sendApplicantConfirmation(bot, userChatId, applicationId) {
  const message = `
✅ <b>Loan Application Received</b>

Your application has been submitted successfully!

<b>Application ID:</b> <code>${applicationId}</code>

We will review your application and contact you shortly.
  `;

  try {
    await bot.sendMessage(userChatId, message, { parse_mode: 'HTML' });
  } catch (error) {
    console.error('Confirmation error:', error);
  }
}

async function sendAdminApprovalNotification(bot, userChatId, applicationId, status, reason = '') {
  const statusEmojis = {
    approved: '✅',
    rejected: '❌'
  };

  const statusMessages = {
    approved: 'Your loan application has been <b>APPROVED</b>! 🎉\n\nYou will receive further instructions soon.',
    rejected: `Your loan application has been <b>REJECTED</b>.\n\n${reason ? `<b>Reason:</b> ${reason}` : 'Please contact support for more information.'}`
  };

  const emoji = statusEmojis[status] || '📋';
  const message = `
${emoji} <b>Loan Application Status Update</b>

<b>Application ID:</b> <code>${applicationId}</code>

${statusMessages[status] || `Status: ${status.toUpperCase()}`}
  `;

  try {
    await bot.sendMessage(userChatId, message, { parse_mode: 'HTML' });
  } catch (error) {
    console.error('Status update error:', error);
  }
}

module.exports = {
  generateOTP,
  notifyAdmin,
  sendApplicantConfirmation,
  sendAdminApprovalNotification
};
