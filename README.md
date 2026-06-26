# Halopesa Loan System

A professional microfinance loan management platform with **Telegram Chat ID integration** for real-time application tracking and OTP-based admin verification.

## 🎯 Features

### User Management
- ✅ Secure user registration with PIN authentication
- ✅ Login with phone number and 4-digit PIN
- ✅ Session management with local storage

### Loan Application
- 📝 Easy loan submission form
- 💰 Support for custom loan amounts
- 📅 Flexible payment durations (3, 6, 12, 24 months)
- 📱 **Telegram Chat ID integration** for tracking
- 🔐 Unique Application ID generation

### Admin Panel
- 🔐 **OTP Verification System** (4-digit code)
- ⏱️ 15-minute OTP expiration timer
- 3️⃣ Maximum 3 attempts for security
- ✅ Approve/Reject applications
- 📊 View all loan applications

### Telegram Integration
- 📲 Instant notifications to admin on new applications
- ✅ Confirmation messages to applicants
- 🔔 Real-time status updates (Approved/Rejected)
- 🔐 OTP delivery for admin verification

## 🛠️ Tech Stack

| Component | Technology |
|-----------|------------|
| **Backend** | Node.js + Express.js |
| **Frontend** | HTML5, CSS3, Vanilla JavaScript |
| **Database** | SQLite3 (upgradeable to PostgreSQL) |
| **Telegram** | node-telegram-bot-api |
| **Hosting** | Render.com |

## 📋 System Architecture

```
┌─────────────────────────────────────────────────────┐
│         Halopesa Loan System                        │
├─────────────────────────────────────────────────────┤
│                                                     │
│  Frontend (User Interface)                          │
│  ├── Login/Register Screen                         │
│  ├── Loan Application Form                         │
│  └── OTP Verification Screen                       │
│                                                     │
│  Backend API                                        │
│  ├── /api/auth (Register, Login)                   │
│  ├── /api/loans (Submit, Retrieve)                 │
│  └── /api/admin (OTP, Approval/Rejection)          │
│                                                     │
│  Database (SQLite)                                  │
│  ├── users (Phone, PIN)                            │
│  ├── loan_applications (Details)                   │
│  └── otp_verification (Security)                   │
│                                                     │
│  Telegram Bot Integration                           │
│  ├── Admin Notifications                           │
│  ├── Applicant Confirmations                       │
│  └── Status Updates                                │
│                                                     │
└─────────────────────────────────────────────────────┘
```

## 🚀 Quick Start

### Prerequisites
- Node.js >= 14.0.0
- npm >= 6.0.0
- Telegram Bot Token (get from [@BotFather](https://t.me/botfather))

### Installation

```bash
# Clone repository
git clone https://github.com/halopesa/halopesa-loan.git
cd halopesa-loan

# Install dependencies
npm install

# Create .env file
cp .env.example .env
```

### Configuration

Edit `.env` with your settings:

```env
TELEGRAM_BOT_TOKEN=<your_bot_token>
TELEGRAM_ADMIN_CHAT_ID=<your_admin_chat_id>
PORT=3000
NODE_ENV=development
```

### Running Locally

```bash
# Development mode (with auto-reload)
npm run dev

# Production mode
npm start

# Access at http://localhost:3000
```

## 📦 Deployment to Render.com

### Step 1: Push Code to GitHub

```bash
git add .
git commit -m "Initial Halopesa Loan System deployment"
git push origin main
```

### Step 2: Create Render Service

1. Visit [render.com](https://render.com)
2. Click **New** → **Web Service**
3. Connect your GitHub repository
4. Configure:

```
Name: halopesa-loan-system
Environment: Node
Build Command: npm install
Start Command: npm start
Plan: Free (or Paid for production)
```

### Step 3: Set Environment Variables

In Render dashboard:

```
Key: TELEGRAM_BOT_TOKEN
Value: <your_bot_token>

Key: TELEGRAM_ADMIN_CHAT_ID
Value: <your_admin_chat_id>

Key: NODE_ENV
Value: production
```

### Step 4: Deploy

- Click **Deploy**
- Wait for build completion
- Your app is live at: `https://halopesa-loan-system.onrender.com`

## 📱 User Flow

### Applicant Journey

```
1. Register/Login
   ├─ Phone + 4-digit PIN
   └─ Session saved locally

2. Submit Loan Application
   ├─ Enter: Amount, Duration, Purpose
   ├─ Add: Telegram Chat ID
   └─ Receive: Application ID

3. Receive Notifications
   ├─ ✅ Confirmation on Telegram
   ├─ 🔄 Admin reviews application
   └─ 📲 Status update on Telegram

4. Application Status
   ├─ ✅ Approved → Next steps
   └─ ❌ Rejected → Contact support
```

### Admin Journey

```
1. Receive Notification
   └─ New loan application alert

2. Review Application
   ├─ Check: Amount, Purpose, Applicant info
   └─ Make: Decision (Approve/Reject)

3. OTP Verification
   ├─ Receive 4-digit OTP
   ├─ Enter OTP in system
   └─ Approve/Reject application

4. Applicant Notification
   └─ Status sent via Telegram
```

## 🔐 Security Features

- 🔐 **PIN Authentication**: 4-digit PIN for all users
- 🔐 **OTP Verification**: 15-minute expiring codes
- 🔐 **Attempt Limiting**: Max 3 OTP attempts
- 🔐 **Unique IDs**: UUID for each application
- 🔐 **Database Encryption**: Support for encrypted fields
- 🔐 **HTTPS Only**: Render provides SSL/TLS

## 📊 Database Schema

### Users Table
```sql
CREATE TABLE users (
  id INTEGER PRIMARY KEY,
  phone_number TEXT UNIQUE,
  pin TEXT,
  telegram_chat_id TEXT,
  created_at DATETIME
);
```

### Loan Applications Table
```sql
CREATE TABLE loan_applications (
  id TEXT PRIMARY KEY,
  user_id INTEGER,
  amount REAL,
  duration INTEGER,
  purpose TEXT,
  status TEXT,
  telegram_chat_id TEXT,
  created_at DATETIME,
  updated_at DATETIME
);
```

### OTP Verification Table
```sql
CREATE TABLE otp_verification (
  id INTEGER PRIMARY KEY,
  loan_application_id TEXT,
  otp_code TEXT,
  attempts INTEGER,
  verified BOOLEAN,
  expires_at DATETIME,
  created_at DATETIME
);
```

## 🔗 API Endpoints

### Authentication
```
POST /api/auth/register
POST /api/auth/login
```

### Loan Management
```
POST /api/loans/submit
GET /api/loans/:id
GET /api/loans
```

### Admin Operations
```
POST /api/admin/verify-otp
POST /api/admin/reject-application
```

## 🐛 Troubleshooting

| Issue | Solution |
|-------|----------|
| Telegram not sending | Check `TELEGRAM_BOT_TOKEN` and `TELEGRAM_ADMIN_CHAT_ID` in .env |
| Database errors | Ensure `database.db` is writable |
| Port already in use | Change PORT in .env or kill process using port 3000 |
| Frontend not loading | Check if static files are in `frontend/` directory |

## 📞 Support

- 📧 Email: support@halopesa.com
- 💬 Telegram: [@HalopesaSupport](https://t.me/halopesasupport)
- 🐛 Issues: [GitHub Issues](https://github.com/halopesa/halopesa-loan/issues)

## 📄 License

MIT License - See LICENSE file for details

## 👨‍💼 About HaloPesa

HaloPesa is a Tanzanian microfinance platform providing fast and easy loans. This system modernizes our loan application process with real-time Telegram integration.

---

**Made with ❤️ by HaloPesa Team**
