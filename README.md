# Video Upload, Sensitivity Processing & Streaming Platform

A full-stack web application for video upload, automated sensitivity analysis, real-time processing progress, secure streaming, and role-based access with multi-tenant isolation.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- MongoDB Atlas account (or local MongoDB)

### 1. Backend Setup

```bash
cd backend
cp ../.env.example .env
# Edit .env with your MongoDB Atlas URI
npm install
npm run dev
```

### 2. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

### 3. Access
- Frontend: http://localhost:5173
- Backend API: http://localhost:5000/api/v1
- Health Check: http://localhost:5000/api/v1/health

## 📡 API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | /api/v1/auth/register | No | Register user |
| POST | /api/v1/auth/login | No | Login |
| POST | /api/v1/auth/refresh | No | Refresh token |
| POST | /api/v1/videos/upload | JWT | Upload video |
| GET | /api/v1/videos | JWT | List videos (paginated) |
| GET | /api/v1/videos/:id | JWT | Get single video |
| DELETE | /api/v1/videos/:id | JWT | Delete video |
| GET | /api/v1/videos/stream/:id | JWT | Stream video (206) |

## 🏗️ Architecture

```
backend/src/
├── config/        # DB, env, socket config
├── constants/     # Roles, status, events, errors
├── controllers/   # Request handlers (no logic)
├── services/      # Business logic
├── repositories/  # Database operations
├── models/        # Mongoose schemas
├── middlewares/    # Auth, role, error
├── routes/        # API routes
├── sockets/       # Socket.io setup
├── utils/         # Logger, upload, response
└── app.js         # Express app

frontend/src/
├── components/    # UploadForm, VideoCard, ProgressBar, VideoPlayer
├── pages/         # Login, Register, Dashboard, VideoLibrary
├── context/       # AuthContext, VideoContext
├── services/      # API, auth, video services
├── sockets/       # Socket.io client
└── App.jsx        # Router & layout
```

## 🔐 Roles
- **Viewer**: View assigned videos
- **Editor**: Upload + manage own videos
- **Admin**: Full system access

## 🏢 Multi-Tenant
Each user belongs to one tenant. Cross-tenant data access is blocked.
