# ⬡ PortfolioBuilder

> A full-stack web application to create, manage, and share a professional developer portfolio.  
> **Web Technology Mini Project** | Node.js + Express.js + MongoDB + EJS

---

## 🚀 Quick Start

### Prerequisites
- **Node.js** v18+ (https://nodejs.org)
- **MongoDB** running locally on port 27017  
  *(Install from https://www.mongodb.com/try/download/community)*

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment
The `.env` file is pre-configured for local development:
```
PORT=3000
MONGO_URI=mongodb://localhost:27017/portfoliodb
SESSION_SECRET=portfoliobuilder_secret_key_wt2024
NODE_ENV=development
```

### 3. Start MongoDB
Make sure MongoDB is running:
```bash
# Windows (if installed as a service)
net start MongoDB

# Or start manually
mongod
```

### 4. Run the Application
```bash
# Development (with auto-restart)
npm run dev

# Production
npm start
```

### 5. Open in Browser
Visit: **http://localhost:3000**

---

## 📁 Project Structure

```
portfoliobuilder/
├── server.js              # Express app entry point
├── .env                   # Environment variables (gitignored)
├── .env.example           # Template for environment variables
├── package.json           # Dependencies and scripts
│
├── config/
│   └── db.js              # MongoDB connection setup (Mongoose)
│
├── models/
│   ├── User.js            # User schema (auth data)
│   └── Portfolio.js       # Portfolio schema (profile data)
│
├── routes/
│   ├── auth.js            # /register, /login, /logout
│   ├── dashboard.js       # /dashboard, /dashboard/save (protected)
│   └── portfolio.js       # /u/:username (public)
│
├── middleware/
│   └── auth.js            # requireAuth middleware
│
├── views/
│   ├── partials/
│   │   ├── header.ejs     # HTML head + navbar
│   │   └── footer.ejs     # Footer + global scripts
│   ├── home.ejs           # Landing page
│   ├── register.ejs       # Registration form
│   ├── login.ejs          # Login form
│   ├── dashboard.ejs      # Portfolio editor (protected)
│   └── portfolio.ejs      # Public portfolio page
│
└── public/
    └── css/
        └── style.css      # Complete stylesheet (plain CSS, no frameworks)
```

---

## ✨ Features

| Feature | Details |
|---|---|
| 🔐 Authentication | Register/Login with bcrypt password hashing + express-session |
| 📝 Portfolio Editor | Full dashboard to edit name, bio, skills, projects, social links |
| ⚡ Dynamic Projects | Add/remove projects dynamically via JavaScript (no page reload) |
| 🎨 3 Themes | Minimal (light), Dark, Vibrant — applied on the public page |
| 🔗 Shareable URL | Every user gets `yoursite.com/u/username` |
| 📋 Copy to Clipboard | One-click copy of the public portfolio URL |
| 📱 Responsive | Mobile-friendly layout with CSS media queries |
| 🛡️ Route Protection | `requireAuth` middleware blocks unauthenticated access |

---

## 🌐 Routes

| Method | Route | Access | Description |
|---|---|---|---|
| GET | `/` | Public | Landing page |
| GET | `/register` | Public | Registration form |
| POST | `/register` | Public | Create new account |
| GET | `/login` | Public | Login form |
| POST | `/login` | Public | Authenticate user |
| GET | `/logout` | Auth | Destroy session |
| GET | `/dashboard` | 🔒 Auth | Portfolio editor |
| POST | `/dashboard/save` | 🔒 Auth | Save/update portfolio |
| GET | `/u/:username` | Public | Public portfolio page |

---

## 🗃️ Database Schemas

### User
```js
{ username, email, password (hashed), createdAt }
```

### Portfolio
```js
{
  user (ref),
  name, tagline, about, email, github, linkedin,
  skills: [String],
  projects: [{ title, description, techStack, link }],
  theme: 'minimal' | 'dark' | 'vibrant',
  published: Boolean,
  updatedAt
}
```

---

## 🛠️ Tech Stack

- **Backend**: Node.js + Express.js
- **Frontend**: HTML5, CSS3 (Vanilla), Vanilla JavaScript
- **Templating**: EJS (Embedded JavaScript)
- **Database**: MongoDB + Mongoose ODM
- **Auth**: bcryptjs + express-session + connect-mongo
- **Fonts**: Google Fonts (Inter, Fira Code)

---

## 📸 Pages

1. **Home** — Landing page with hero section, features, and CTA
2. **Register** — Account creation with live username validation
3. **Login** — Secure login with bcrypt comparison
4. **Dashboard** — Protected portfolio editor with real-time preview tools
5. **Portfolio (`/u/:username`)** — Professional public profile with 3 themes

---

*Built for Web Technology (WT) Mini Project*
