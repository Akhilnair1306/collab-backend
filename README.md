# Project Name - collab-backend

A robust RESTful API built with Express.js and PostgreSQL, designed for scalability and maintainability.

## 🎯 Overview

This backend service provides a comprehensive API for a collaboration based notes application. It handles authentication, data management, and business logic with a focus on security and performance.

## 🛠 Tech Stack

- **Runtime**: Node.js (v18.x or higher)
- **Framework**: Express.js (v4.x)
- **Database**: PostgreSQL (v14.x or higher)
- **ORM**: Prisma 
- **Authentication**: JWT (jsonwebtoken)

## 📦 Prerequisites

Before you begin, ensure you have the following installed:

- Node.js (v18.x or higher)
- npm or yarn
- PostgreSQL (v14.x or higher)
- Git

## 🚀 Installation

1. Clone the repository:

```bash
git clone https://github.com/Akhilnair1306/collab-backend.git
cd collab-backend
```

2. Install dependencies:

```bash
npm install
# or
yarn install
```

3. Copy the environment variables file:

```bash
cp .env
```

## 🔐 Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
PORT = 5000
DATABASE_URL = your_database_url
JWT_SECRET = your_jwt_secret
JWT_EXPIRES_IN = your_jwt_expire_time
FRONTEND_URL = your_frontend_url
```

## 💾 Database Setup

1. Create a PostgreSQL database:

```bash
createdb your_database_name
```

2. Run migrations:

```bash
npx prisma migrate dev
```

## 🏃 Running the Application

### Development Mode

```bash
npm run dev
```

The server will start on `http://localhost:5000` with hot-reloading enabled.

### Production Mode

```bash
npm run build
npm start
```

### Key Endpoints

#### Authentication
- `POST /api/users/signup` - Register a new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get User Roles


#### NOTES
- `POST /api/notes/` - Create Notes
- `GET /api/notes/` - Get all Notes of User
- `GET /api/notes/:noteId` - Get Note by ID
- `PUT /api/notes/:noteId` - Update resource
- `DELETE /api/notes/:noteId` - Delete resource

#### COLLABORATOR
- `POST /api/notes/:noteId/collaborator` - Create Notes Collaborator
- `GET /api/notes/:noteId/collaborator` - Get all Collaborator of the Note
- `DELETE /api/notes/:noteId/collaborator/:collaboratorId` - Delete Collaborator of a particular Note

#### SHARE
- `POST /api/notes/:noteId/share` - Generate Publicly Share Link
- `GET /api/notes/share/:token` - Get Note detail on publicly shared Link

#### ADMIN ONLY API ROUTES
- `GET /api/admin/` - Get All Notes of All Users
- `DELETE /api/admin/:noteId` - Delete Note of a particular User

## 🔒 Security

- All passwords are hashed using bcrypt
- JWT tokens for authentication
- CORS configured for specific origins
