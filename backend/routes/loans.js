const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const { db, bot } = require('../../server');
const { notifyAdmin, sendApplicantConfirmation, generateOTP } = require('../services/telegram');

router.post('/submit', (req, res) => {
  try {
    const { name, email, phone, amount, duration, purpose, telegramChatId, userId } = req.body;

    if (!name || !email || !phone || !amount || !duration || !purpose || !telegramChatId) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields'
      });
    }

    if (isNaN(amount) || amount <= 0) {
      return res.status(400).json({ success: false, error: 'Invalid loan amount' });
    }

    if (isNaN(duration) || duration <= 0) {
      return res.status(400).json({ success: false, error: 'Invalid loan duration' });
    }

    const applicationId = uuidv4();

    db.run(
      `INSERT INTO loan_applications (id, user_id, amount, duration, purpose, status, telegram_chat_id)
       VALUES (?, ?, ?, ?, ?, 'pending', ?)`,
      [applicationId, userId || null, amount, duration, purpose, telegramChatId],
      async function(err) {
        if (err) {
          console.error('Database error:', err);
          return res.status(500).json({ success: false, error: 'Failed to submit application' });
        }

        try {
          const loanData = { id: applicationId, name, email, phone, amount, duration, purpose };
          
          if (bot) {
            await notifyAdmin(bot, loanData, telegramChatId);
            await sendApplicantConfirmation(bot, telegramChatId, applicationId);
          }

          const otp = generateOTP();
          const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

          db.run(
            `INSERT INTO otp_verification (loan_application_id, otp_code, expires_at) VALUES (?, ?, ?)`,
            [applicationId, otp, expiresAt.toISOString()]
          );

          res.status(201).json({
            success: true,
            message: 'Application submitted successfully',
            applicationId,
            telegramNotification: 'Confirmation sent to your Telegram'
          });
        } catch (telegramError) {
          console.error('Telegram error:', telegramError);
          res.status(201).json({
            success: true,
            message: 'Application submitted',
            applicationId
          });
        }
      }
    );
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ success: false, error: 'Failed to submit application' });
  }
});

router.get('/:id', (req, res) => {
  db.get('SELECT * FROM loan_applications WHERE id = ?', [req.params.id], (err, row) => {
    if (err) {
      return res.status(500).json({ success: false, error: 'Database error' });
    }
    if (!row) {
      return res.status(404).json({ success: false, error: 'Application not found' });
    }
    res.json({ success: true, data: row });
  });
});

router.get('/', (req, res) => {
  db.all('SELECT * FROM loan_applications ORDER BY created_at DESC', [], (err, rows) => {
    if (err) {
      return res.status(500).json({ success: false, error: 'Database error' });
    }
    res.json({ success: true, count: rows.length, data: rows });
  });
});

module.exports = router;
