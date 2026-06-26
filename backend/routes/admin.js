const express = require('express');
const router = express.Router();
const { db, bot } = require('../../server');
const { sendAdminApprovalNotification } = require('../services/telegram');

router.post('/verify-otp', (req, res) => {
  try {
    const { applicationId, otpCode } = req.body;

    if (!applicationId || !otpCode) {
      return res.status(400).json({
        success: false,
        error: 'Application ID and OTP code are required'
      });
    }

    db.get(
      `SELECT * FROM otp_verification 
       WHERE loan_application_id = ? 
       AND verified = 0
       AND datetime(expires_at) > datetime('now')
       ORDER BY created_at DESC LIMIT 1`,
      [applicationId],
      (err, otpRecord) => {
        if (err) {
          return res.status(500).json({ success: false, error: 'Database error' });
        }

        if (!otpRecord) {
          return res.status(404).json({ success: false, error: 'OTP not found or expired' });
        }

        if (otpRecord.attempts >= 3) {
          return res.status(403).json({ success: false, error: 'Too many attempts' });
        }

        if (otpRecord.otp_code !== otpCode) {
          db.run('UPDATE otp_verification SET attempts = attempts + 1 WHERE id = ?', [otpRecord.id]);
          return res.status(401).json({
            success: false,
            error: 'Invalid OTP code',
            attemptsRemaining: 3 - otpRecord.attempts - 1
          });
        }

        db.run('UPDATE otp_verification SET verified = 1 WHERE id = ?', [otpRecord.id], () => {
          db.run(
            'UPDATE loan_applications SET status = "approved", updated_at = CURRENT_TIMESTAMP WHERE id = ?',
            [applicationId],
            async () => {
              db.get('SELECT * FROM loan_applications WHERE id = ?', [applicationId], async (err, loan) => {
                if (!err && loan && bot) {
                  await sendAdminApprovalNotification(bot, loan.telegram_chat_id, applicationId, 'approved');
                }
                res.json({
                  success: true,
                  message: 'OTP verified successfully',
                  applicationId,
                  status: 'approved'
                });
              });
            }
          );
        });
      }
    );
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ success: false, error: 'OTP verification failed' });
  }
});

router.post('/reject-application', async (req, res) => {
  try {
    const { applicationId, reason } = req.body;

    if (!applicationId) {
      return res.status(400).json({ success: false, error: 'Application ID is required' });
    }

    db.run(
      'UPDATE loan_applications SET status = "rejected", updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [applicationId],
      async function(err) {
        if (err) {
          return res.status(500).json({ success: false, error: 'Failed to reject application' });
        }

        db.get('SELECT * FROM loan_applications WHERE id = ?', [applicationId], async (err, loan) => {
          if (!err && loan && bot) {
            await sendAdminApprovalNotification(bot, loan.telegram_chat_id, applicationId, 'rejected', reason);
          }
          res.json({ success: true, message: 'Application rejected', applicationId });
        });
      }
    );
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ success: false, error: 'Failed to reject application' });
  }
});

module.exports = router;
