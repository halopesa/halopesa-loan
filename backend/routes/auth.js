const express = require('express');
const router = express.Router();
const { db } = require('../../server');

/**
 * POST /api/auth/register
 * Register a new user with phone number and PIN
 */
router.post('/register', (req, res) => {
  try {
    const { phoneNumber, pin, confirmPin } = req.body;

    if (!phoneNumber || !pin || !confirmPin) {
      return res.status(400).json({
        success: false,
        error: 'Phone number and PIN are required'
      });
    }

    if (pin !== confirmPin) {
      return res.status(400).json({
        success: false,
        error: 'PINs do not match'
      });
    }

    if (pin.length !== 4 || !/^\d+$/.test(pin)) {
      return res.status(400).json({
        success: false,
        error: 'PIN must be exactly 4 digits'
      });
    }

    db.get('SELECT id FROM users WHERE phone_number = ?', [phoneNumber], (err, row) => {
      if (err) {
        return res.status(500).json({ success: false, error: 'Database error' });
      }

      if (row) {
        return res.status(409).json({
          success: false,
          error: 'User with this phone number already exists'
        });
      }

      db.run(
        'INSERT INTO users (phone_number, pin) VALUES (?, ?)',
        [phoneNumber, pin],
        function(err) {
          if (err) {
            return res.status(500).json({
              success: false,
              error: 'Failed to register user'
            });
          }

          res.status(201).json({
            success: true,
            message: 'Registration successful',
            userId: this.lastID
          });
        }
      );
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ success: false, error: 'Registration failed' });
  }
});

/**
 * POST /api/auth/login
 * Login user with phone number and PIN
 */
router.post('/login', (req, res) => {
  try {
    const { phoneNumber, pin } = req.body;

    if (!phoneNumber || !pin) {
      return res.status(400).json({
        success: false,
        error: 'Phone number and PIN are required'
      });
    }

    db.get(
      'SELECT id, phone_number FROM users WHERE phone_number = ? AND pin = ?',
      [phoneNumber, pin],
      (err, row) => {
        if (err) {
          return res.status(500).json({ success: false, error: 'Database error' });
        }

        if (!row) {
          return res.status(401).json({
            success: false,
            error: 'Invalid phone number or PIN'
          });
        }

        res.json({
          success: true,
          message: 'Login successful',
          userId: row.id,
          phoneNumber: row.phone_number
        });
      }
    );
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, error: 'Login failed' });
  }
});

module.exports = router;
