# AI-Solutions — MERN Assessment Project

A full-stack MERN (MongoDB, Express, React, Node.js) web application for AI-Solutions, a fictitious company providing AI-powered software solutions, virtual assistants, and customer engagement systems.

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Setup & Installation](#setup--installation)
- [Running Locally](#running-locally)
- [API Documentation](#api-documentation)
- [Admin Dashboard](#admin-dashboard)
- [Deployment Guide](#deployment-guide)
- [Security Features](#security-features)
- [Testing](#testing)
- [Future Improvements](#future-improvements)

---

## Features

### Public Features
- **Responsive Homepage** — Hero section showcasing AI solutions with gradient design
- **Why Choose AI-Solutions** — 6-card section with requirement specifications:
  - 🤖 AI Virtual Assistants
  - 📊 Customer Engagement Systems
  - ⚡ Rapid Prototyping
  - 🔒 Enterprise Security
  - 🌍 Global Scale
  - 📈 Analytics & Insights
- **AI Virtual Assistant Chatbot** — Interactive chatbot with automated responses (bottom-right floating widget)
- **Three Contact Forms** — Direct user engagement without login/registration:
  - 📅 Schedule Demo (name, email, phone, company, country, service interest)
  - 📧 Contact Us (full name, email, phone, company, country, job title, job details)
  - 🎯 Join Event (name, email, phone, company, country, event interest)
- **Articles/Blog Section** — Latest news and resources with cover images, excerpts, tags, authors
- **Photo Gallery** — Project showcase with hover effects and image details
- **Customer Feedback & Ratings** — Star ratings display with customer testimonials and service tags
- **Direct Homepage Access** — No login/registration required for users to view and submit forms

### Admin Features
- **Secure Authentication** — JWT tokens + bcrypt password hashing (HTTP-only cookies)
- **Protected Dashboard** — Admin-only analytics and management interface
- **Analytics Cards** — Real-time stats display:
  - 📊 Total Inquiries (Contact form submissions)
  - 🎯 Demo Requests
  - 🎪 Event Registrations
  - 💬 Chat Interactions
- **Tabbed Data Management** — 5 tabs for comprehensive data control:
  - STATS — Dashboard overview
  - CONTACTS — Contact inquiries (view, edit, delete)
  - DEMOS — Demo requests (view, edit, delete)
  - EVENTS — Event registrations (view, edit, delete)
  - FEEDBACK — Customer feedback with ratings (view, delete)
- **Search & Filter** — Real-time text search across all fields in tables
- **Inline Editing** — Click Edit to modify any record inline with Save/Cancel options
- **CRUD Operations** — Full Create, Read, Update, Delete functionality
- **Notifications** — Toast alerts for all actions (success/error) with 3-second duration
- **Secure Logout** — Clears JWT tokens and redirects to login

---

## Tech Stack

### Frontend
- **React 18** — UI library
- **Vite 5** — Fast build tool
- **Tailwind CSS 3** — Utility-first styling
- **Axios** — HTTP client
- **React Router DOM 6** — Client-side routing

### Backend
- **Node.js 24** — Runtime
- **Express.js 4** — Web framework
- **MongoDB 5.0+** — NoSQL database
- **Mongoose 7** — ODM for MongoDB
- **JWT** — JSON Web Tokens for auth
- **bcrypt** — Password hashing
- **Express Validator** — Input validation
- **CORS** — Cross-origin support

---

## Project Structure

```
AI-Solutions/
├── backend/
│   ├── config/
│   │   └── db.js                    # MongoDB connection
│   ├── middleware/
│   │   └── auth.js                  # JWT protection middleware
│   ├── models/
│   │   ├── Admin.js                 # Admin user schema
│   │   ├── ContactMessage.js
│   │   ├── DemoRequest.js
│   │   ├── EventRegistration.js
│   │   ├── Article.js
│   │   ├── Feedback.js
│   │   ├── GalleryImage.js
│   │   └── ChatMessage.js
│   ├── routes/
│   │   ├── auth.js                  # Admin login/register/logout
│   │   ├── contacts.js              # Contact CRUD (protected)
│   │   ├── demos.js                 # Demo CRUD (protected)
│   │   ├── events.js                # Event CRUD (protected)
│   │   ├── articles.js              # Article CRUD
│   │   ├── feedback.js              # Feedback management
│   │   ├── gallery.js               # Gallery management
│   │   ├── chat.js                  # Chatbot messages
│   │   └── admin.js                 # Stats endpoint
│   ├── scripts/
│   │   └── seed.js                  # Create default admin
│   ├── .env.example                 # Environment template
│   ├── package.json
│   └── server.js                    # Express app entry
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Chatbot.jsx          # AI assistant component
│   │   │   ├── ContactForm.jsx
│   │   │   ├── DemoForm.jsx
│   │   │   └── EventForm.jsx
│   │   ├── config/
│   │   │   └── api.js               # Axios instance with credentials
│   │   ├── pages/
│   │   │   ├── Home.jsx             # Public homepage
│   │   │   ├── AdminLogin.jsx       # Admin login page
│   │   │   └── AdminDashboard.jsx   # Admin dashboard (protected)
│   │   ├── App.jsx                  # Root component with routes
│   │   ├── main.jsx                 # React entry point
│   │   └── index.css                # Tailwind directives
│   ├── index.html
│   ├── package.json
│   └── tailwind.config.cjs
│
└── README.md
```

---

## Setup & Installation

### Prerequisites
- Node.js v20+ and npm v10+
- MongoDB 5.0+ (local or MongoDB Atlas)
- Git

### 1. Clone & Navigate

```bash
cd AI-Solutions
```

### 2. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Edit .env with your MongoDB URI and JWT secret
# Example:
# PORT=5000
# MONGO_URI=mongodb://localhost:27017/ai_solutions_db
# JWT_SECRET=your_super_secret_key_here
# CLIENT_URL=http://localhost:5173
```

### 3. Frontend Setup

```bash
cd ../frontend

# Install dependencies
npm install

# Frontend will automatically connect to backend at http://localhost:5000
```

### 4. Create Default Admin Account

```bash
cd ../backend

# Seed a default admin user
node scripts/seed.js

# Output will show:
# Email: admin@ai-solutions.com
# Password: Admin@123
# ⚠️  CHANGE THIS PASSWORD IN PRODUCTION
```

---

## Running Locally

### Terminal 1 — Backend (API Server)

```bash
cd backend
npm run dev
```

Server starts at `http://localhost:5000`
Logs will show "Server running on port 5000" and "MongoDB connected"

### Terminal 2 — Frontend (Vite Dev Server)

```bash
cd frontend
npm run dev
```

Frontend starts at `http://localhost:5173` (or auto-assigns if ports are in use)
Vite will display the local URL in the console

### Access the Application

- **Public Site**: http://localhost:5173
  - View homepage, submit contact/demo/event forms
  - Interact with AI chatbot
  
- **Admin Dashboard**: http://localhost:5173/admin/login
  - Email: `admin@ai-solutions.com`
  - Password: `Admin@123`
  - View analytics, manage inquiries, CRUD operations

---

## API Documentation

### Authentication Endpoints

#### Admin Register
```bash
POST /api/auth/register
Content-Type: application/json

{
  "name": "New Admin",
  "email": "admin2@example.com",
  "password": "SecurePass123"
}
```

#### Admin Login
```bash
POST /api/auth/login
Content-Type: application/json
Cookie: token=<jwt>

{
  "email": "admin@ai-solutions.com",
  "password": "Admin@123"
}
```

#### Admin Logout
```bash
POST /api/auth/logout
```

### Contact Messages (CRUD)

#### Submit Contact Form
```bash
POST /api/contacts
{
  "fullName": "John Doe",
  "email": "john@example.com",
  "phone": "1234567890",
  "company": "Acme Corp",
  "country": "USA",
  "jobTitle": "Manager",
  "jobDetails": "Looking for AI solutions"
}
```

#### Get All Contacts (Admin Only)
```bash
GET /api/contacts
Authorization: Bearer <jwt_token>
```

#### Update Contact
```bash
PUT /api/contacts/:id
Authorization: Bearer <jwt_token>
{
  "fullName": "Jane Doe"
}
```

#### Delete Contact
```bash
DELETE /api/contacts/:id
Authorization: Bearer <jwt_token>
```

### Demo Requests
```bash
# Submit demo request
POST /api/demos
{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "phone": "9876543210",
  "company": "Tech Inc",
  "country": "Canada",
  "interestedService": "Virtual Assistant"
}

# Get all demos (admin)
GET /api/demos

# Update/Delete
PUT /api/demos/:id
DELETE /api/demos/:id
```

### Admin Stats
```bash
GET /api/admin/stats
Authorization: Bearer <jwt_token>

Response:
{
  "totalContacts": 15,
  "totalDemos": 8,
  "totalEvents": 12,
  "totalChats": 45
}
```

### Chatbot Messages
```bash
POST /api/chat
{
  "sessionId": "user-session-123",
  "user": "visitor",
  "message": "How can you help me?"
}

Response:
{
  "_id": "...",
  "message": "How can you help me?",
  "response": "Thanks for your message. Our AI Assistant suggests booking a demo..."
}
```

---

## Admin Dashboard

### Features

1. **Analytics Cards** — Real-time stats with gradient colors
2. **Tabbed Interface**:
   - **STATS** — Overview of all metrics
   - **CONTACTS** — Searchable table with inline edit/delete
   - **DEMOS** — Manage demo requests
   - **EVENTS** — Event registrations
   - **FEEDBACK** — Star ratings and testimonials

3. **Search & Filter** — Find records across all fields
4. **Inline Editing** — Click Edit to modify, Save to persist
5. **Delete Records** — Remove unwanted entries
6. **Notifications** — Toast feedback on success/error
7. **Responsive Design** — Works on desktop and mobile

### Sample Workflow

1. Navigate to `/admin/login`
2. Enter credentials (admin@ai-solutions.com / Admin@123)
3. View analytics on STATS tab
4. Switch to CONTACTS tab to see inquiries
5. Use search box to filter by name/email
6. Click Edit to modify a contact
7. Click Delete to remove entries
8. Logout when done

---

## Deployment Guide

### Deploy Backend (Heroku)

1. **Create Heroku Account** — https://heroku.com

2. **Install Heroku CLI** — Download from https://devcenter.heroku.com/articles/heroku-cli

3. **Setup**
```bash
cd backend

# Login to Heroku
heroku login

# Create app
heroku create ai-solutions-api

# Set environment variables
heroku config:set MONGO_URI="mongodb+srv://user:pass@cluster.mongodb.net/ai_solutions_db"
heroku config:set JWT_SECRET="your_secure_secret_key"
heroku config:set CLIENT_URL="https://your-frontend-url.vercel.app"

# Deploy
git push heroku main
```

### Deploy Frontend (Vercel)

1. **Create Vercel Account** — https://vercel.com

2. **Install Vercel CLI**
```bash
npm install -g vercel
```

3. **Deploy**
```bash
cd frontend

# Create .env.production.local
echo "VITE_API_URL=https://ai-solutions-api.herokuapp.com/api" > .env.production.local

# Deploy
vercel --prod
```

4. **Configure Environment** — Set `VITE_API_URL` in Vercel dashboard

### MongoDB Atlas (Recommended)

1. Create cluster at https://www.mongodb.com/cloud/atlas
2. Create database user and IP whitelist
3. Get connection string (looks like: `mongodb+srv://user:pass@cluster.mongodb.net/dbname`)
4. Set as `MONGO_URI` in Heroku config

---

## Security Features

✅ **Implemented**
- JWT authentication with 7-day expiry
- bcrypt password hashing (10 salt rounds)
- HTTP-only secure cookies
- CORS protection (localhost dev, configurable for production)
- Input validation via express-validator
- Protected admin routes (401 redirect if not authenticated)
- Password field excluded from API responses

🔒 **Recommended for Production**
- Enable HTTPS/SSL certificates
- Implement rate limiting on auth endpoints
- Add request logging and monitoring
- Use environment secrets manager (AWS Secrets, Vault)
- Enable MongoDB IP whitelist
- Implement refresh token rotation
- Add 2FA for admin accounts
- Set secure CORS origins (not wildcard)

---

## Testing

### Manual API Testing with curl

```bash
# Register admin
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Admin","email":"admin@test.com","password":"Pass123"}'

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -c cookies.txt \
  -d '{"email":"admin@ai-solutions.com","password":"Admin@123"}'

# Get contacts (using token from login response)
curl -X GET http://localhost:5000/api/contacts \
  -b cookies.txt

# Submit contact form
curl -X POST http://localhost:5000/api/contacts \
  -H "Content-Type: application/json" \
  -d '{
    "fullName":"Test User",
    "email":"test@example.com",
    "phone":"1234567890",
    "company":"Test Corp",
    "country":"USA",
    "jobTitle":"Developer",
    "jobDetails":"Interested in AI solutions"
  }'

# Get admin stats
curl -X GET http://localhost:5000/api/admin/stats \
  -b cookies.txt
```

### Frontend Manual Testing

1. **Home Page**
   - Fill and submit all three forms
   - Verify success notifications
   - Check Admin Dashboard to see submitted data

2. **Admin Login**
   - Try wrong credentials (should fail)
   - Login with correct credentials
   - Verify redirect to dashboard

3. **Admin Dashboard**
   - View analytics cards
   - Search in tables
   - Edit and delete records
   - Switch between tabs
   - Logout and verify redirect to login

4. **Chatbot**
   - Type messages
   - Verify responses appear
   - Try keywords like "human" (should offer escalation)

---

## Future Improvements

### Phase 2
- [ ] Add password reset functionality
- [ ] Implement article management (create, edit, publish)
- [ ] Build photo gallery upload feature
- [ ] Add email notifications for inquiries
- [ ] Implement advanced analytics with charts (Chart.js/Recharts)
- [ ] Add two-factor authentication (2FA)
- [ ] Create email templates and SMTP integration

### Phase 3
- [ ] Integration with real AI API (OpenAI GPT, Claude)
- [ ] Event calendar with RSVPs
- [ ] Automated email workflows
- [ ] Advanced search with full-text indexing
- [ ] Admin user roles and permissions
- [ ] Audit logs for all admin actions
- [ ] API rate limiting and throttling

### Phase 4
- [ ] Mobile app (React Native)
- [ ] Real-time notifications (WebSocket)
- [ ] Internationalization (i18n)
- [ ] Payment integration (Stripe)
- [ ] Advanced reporting and exports (PDF/CSV)
- [ ] Analytics dashboard with graphs and trends
- [ ] CRM system integration

---

## License

MIT License - Use freely for educational purposes

## Support

For issues or questions:
1. Check the API documentation above
2. Review error logs in browser console (F12)
3. Check backend logs in terminal
4. Verify MongoDB connection in `.env`

---

**Last Updated**: June 1, 2026  
**Version**: 1.0.0  
**Status**: Complete and Functional

