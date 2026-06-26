require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const TelegramBot = require('node-telegram-bot-api');

const app = express();

// Initialize Database
const db = new sqlite3.Database('./database.db');
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      phone_number TEXT UNIQUE NOT NULL,
      pin TEXT NOT NULL,
      telegram_chat_id TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS loan_applications (
      id TEXT PRIMARY KEY,
      user_id INTEGER,
      amount REAL NOT NULL,
      duration INTEGER NOT NULL,
      purpose TEXT NOT NULL,
      status TEXT DEFAULT 'pending',
      telegram_chat_id TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS otp_verification (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      loan_application_id TEXT NOT NULL,
      otp_code TEXT NOT NULL,
      attempts INTEGER DEFAULT 0,
      verified BOOLEAN DEFAULT 0,
      expires_at DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (loan_application_id) REFERENCES loan_applications(id)
    )
  `);
});

// Middleware
app.use(cors());
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ limit: '10mb', extended: true }));
app.use(express.static('frontend'));

// Telegram Bot Setup
let bot;
if (process.env.TELEGRAM_BOT_TOKEN) {
  bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, { polling: false });
}

// Import routes
const authRoutes = require('./backend/routes/auth');
const loanRoutes = require('./backend/routes/loans');
const adminRoutes = require('./backend/routes/admin');

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/loans', loanRoutes);
app.use('/api/admin', adminRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date(), service: 'Halopesa Loan System' });
});

// API Documentation
app.get('/api', (req, res) => {
  res.json({
    service: 'Halopesa Loan System API',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      loans: '/api/loans',
      admin: '/api/admin'
    }
  });
});

// Serve frontend
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend', 'index.html'));
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`
${'='.repeat(50)}`);
  console.log(`  🚀 Halopesa Loan System`);
  console.log(`  📍 Port: ${PORT}`);
  console.log(`  🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`  📱 Telegram: ${bot ? '✓ Connected' : '✗ Not configured'}`);
  console.log(`${'='.repeat(50)}\n`);
});

module.exports = { db, app, bot };
