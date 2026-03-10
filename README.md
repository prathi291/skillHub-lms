# SkillHub LMS

> A modern, full-stack **Learning Management System** built with React, Node.js, Express, and MongoDB Atlas.

![SkillHub Banner](https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&q=80&w=1200&h=400)

---

## 🚀 Live Features

- 🔐 **JWT Authentication** — Secure login, register, forgot/reset password
- 📚 **Course Catalog** — Browse, search, and filter 16+ courses
- 🎬 **Video Player** — YouTube IFrame API with auto-completion detection
- 📊 **Smart Progress Tracking** — Auto-marks lessons complete after 90% watch time
- ❤️ **Wishlist** — Save and manage courses
- 📜 **PDF Certificates** — Auto-generated on course completion
- 🤖 **AI Chat Assistant** — Powered by OpenAI, available on every page
- 🌗 **Light / Dark Mode** — System-wide theme toggle, persisted to localStorage
- 👤 **User Profiles** — Edit name, bio, and avatar
- ⭐ **Course Reviews** — Submit and view ratings

---

## 🧱 Tech Stack

### Frontend
| Tech | Version | Purpose |
|------|---------|---------|
| React | 19.x | UI library |
| Vite | 7.x | Build tool & dev server |
| React Router DOM | 7.x | Client-side routing |
| Framer Motion | 12.x | Animations & page transitions |
| Lucide React | — | Icon library |
| Vanilla CSS | — | Styling with CSS custom properties |

### Backend
| Tech | Version | Purpose |
|------|---------|---------|
| Node.js | 18+ | JavaScript runtime |
| Express.js | 5.x | REST API framework |
| MongoDB Atlas | — | Cloud database |
| Mongoose | 9.x | ODM — schema & queries |
| JWT | — | Authentication tokens |
| bcryptjs | — | Password hashing |
| PDFKit | — | Certificate generation |
| OpenAI SDK | — | AI chat assistant |
| Winston | — | Logging |

---

## 📁 Project Structure

```
skillHub-lms/
├── backend/
│   ├── server.js                 # Express entry point
│   ├── .env.example              # Environment variable template
│   ├── config/
│   │   ├── database.js           # MongoDB Atlas connection
│   │   ├── env.js                # Centralised config
│   │   └── jwt.js                # JWT helpers
│   ├── controllers/              # 11 business logic controllers
│   │   ├── authController.js
│   │   ├── courseController.js
│   │   ├── enrollmentController.js
│   │   ├── lessonController.js
│   │   ├── progressController.js
│   │   ├── reviewController.js
│   │   ├── sectionController.js
│   │   ├── userController.js
│   │   ├── wishlistController.js
│   │   ├── certificateController.js
│   │   └── aiController.js
│   ├── models/                   # 8 Mongoose schemas
│   │   ├── User.js
│   │   ├── Course.js
│   │   ├── Section.js
│   │   ├── Lesson.js
│   │   ├── Enrollment.js
│   │   ├── Progress.js
│   │   ├── Review.js
│   │   └── Wishlist.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   └── index.js              # All protected API routes
│   ├── middlewares/
│   │   ├── authMiddleware.js     # JWT verification
│   │   ├── authorizationMiddleware.js  # Role-based access
│   │   ├── logging.js            # Winston request logger
│   │   └── errorHandling.js     # Global error handler
│   ├── database/
│   │   └── seeders/seed.js       # Auto-seeds 16 courses on first run
│   └── utils/
│       ├── videoFallback.js      # Topic-aware YouTube video picker
│       └── passwordHash.js
│
└── frontend/
    └── src/
        ├── App.jsx               # Root component + routing
        ├── index.css             # Global styles + theme variables
        ├── contexts/
        │   ├── AuthContext.jsx   # Auth state management
        │   ├── CourseContext.jsx # Courses, enrollments, wishlist
        │   └── ThemeContext.jsx  # Light/dark mode
        ├── components/
        │   ├── Navbar.jsx        # Top navigation
        │   ├── Footer.jsx
        │   └── AIChatWidget.jsx  # Floating AI assistant
        └── pages/
            ├── Dashboard.jsx
            ├── Courses.jsx
            ├── CourseDetailsPage.jsx
            ├── CourseVideoPage.jsx
            ├── MyCourses.jsx
            ├── ProfilePage.jsx
            ├── AuthPage.jsx
            └── ResetPasswordPage.jsx
```

---

## ⚙️ Setup & Installation

### Prerequisites
- Node.js 18+
- A MongoDB Atlas account (free tier works)
- An OpenAI API key (optional — for AI chat)

### 1. Clone the repository
```bash
git clone https://github.com/prathi291/skillHub-lms.git
cd skillHub-lms
```

### 2. Backend Setup
```bash
cd backend
npm install
```

Copy the environment template and fill in your values:
```bash
cp .env.example .env
```

Edit `backend/.env`:
```env
NODE_ENV=development
PORT=5000

# MongoDB Atlas connection string
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/skillhub

# JWT
JWT_SECRET=your_super_secret_key_at_least_32_chars
JWT_EXPIRATION=24h

# CORS
CORS_ORIGIN=http://localhost:5173

# OpenAI (optional)
OPENAI_API_KEY=sk-...
```

Start the backend:
```bash
npm run dev
# Server runs on http://localhost:5000
```

> **First run:** The server auto-seeds 16 courses and 3 lessons per course into your Atlas database. No manual setup needed.

### 3. Frontend Setup
```bash
cd ../frontend
npm install
npm run dev
# App runs on http://localhost:5173
```

---

## 🌐 API Reference

### Authentication — `/api/auth`
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login, returns JWT cookie |
| POST | `/api/auth/logout` | Logout |
| POST | `/api/auth/forgot-password` | Send reset email |
| POST | `/api/auth/reset-password/:token` | Reset password |

### Courses — `/api/courses`
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/courses` | — | Get all courses (supports `?search=`) |
| GET | `/api/courses/:id` | — | Get course with lessons & progress |
| POST | `/api/courses` | Instructor | Create course |
| PUT | `/api/courses/:id` | Instructor | Update course |
| DELETE | `/api/courses/:id` | Admin | Delete course |

### Progress — `/api/progress`
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/progress` | ✅ | Mark lesson complete |
| GET | `/api/progress/:courseId` | ✅ | Get course progress + completed lesson IDs |

### Other Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/enroll/:courseId` | Enroll in a course |
| GET | `/api/enrollments` | Get user's enrollments |
| POST/GET | `/api/wishlist` | Toggle / get wishlist |
| POST/GET | `/api/reviews` | Submit / get reviews |
| GET | `/api/certificates/:courseId` | Download PDF certificate |
| POST | `/api/ai/chat` | AI assistant chat |
| GET | `/api/health` | Health check |

---

## 🔐 Authentication Flow

```
1. User submits email + password
2. POST /api/auth/login
3. bcrypt.compare(password, hash)
4. JWT signed → sent as HTTP-only cookie
5. All protected routes: authMiddleware verifies JWT
6. Role-based routes: authorizationMiddleware checks user.role
   └── Roles: student | instructor | admin
```

---

## 🎬 Auto-Progress System

The video player uses the **YouTube IFrame Player API** — not a plain `<iframe>`.

```
User watches video
      ↓
YT.Player tracks playback state
      ↓
Poll every 2 seconds: getCurrentTime() / getDuration()
      ↓
watchPercent = currentTime / duration × 100
      ↓
watchPercent ≥ 90%?
   ├── YES → POST /api/progress → lesson marked complete
   └── NO  → update live watch bar, keep polling
```

- Progress bar updates instantly (optimistic UI)
- Lesson list shows ✅ green checkmarks on completed lessons
- 🎉 Celebration banner appears when a course hits 100%
- All progress persists to MongoDB Atlas

---

## 🎨 Design System

- **Theme:** CSS custom properties for full light/dark mode
- **Fonts:** Modern sans-serif from Google Fonts
- **Animations:** Framer Motion page transitions + micro-animations
- **Icons:** Lucide React
- **Brand:** SkillHub logo with gradient "Hub" highlight

---

## 👥 Default Accounts (after first seed)

| Role | Email | Password |
|------|-------|---------|
| Instructor | `academy@lms.com` | `Instructor@123` |

> Register normally to create a student account.

---

## 📦 Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `MONGO_URI` | ✅ | MongoDB Atlas connection string |
| `JWT_SECRET` | ✅ | Min 32 character secret key |
| `JWT_EXPIRATION` | — | Token expiry (default: `24h`) |
| `PORT` | — | Server port (default: `5000`) |
| `CORS_ORIGIN` | — | Frontend URL for CORS |
| `OPENAI_API_KEY` | — | Enables AI chat widget |
| `LOG_LEVEL` | — | Winston log level (default: `debug`) |

---

## 📜 License

MIT — free to use for learning and course projects.

---

<p align="center">Built with ❤️ as a full-stack course project &nbsp;|&nbsp; SkillHub LMS 2026</p>
