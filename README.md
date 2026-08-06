# 🚀 HireCoder Backend

A production-ready recruitment platform backend built with **NestJS**, **TypeScript**, **Prisma ORM**, and **PostgreSQL**. HireCoder enables recruiters to manage companies and jobs while allowing candidates to discover opportunities, apply for jobs, save favorites, and receive AI-powered resume feedback.

---

# ✨ Features

## 🔐 Authentication

- User Registration
- User Login
- JWT Authentication
- Refresh Token Authentication
- Secure Password Hashing (bcrypt)
- Role-Based Authorization (Candidate / Recruiter)
- Logout

---

## 👤 Profile

- Create Profile
- Update Profile
- View Own Profile
- View Public Profiles

---

## 🏢 Company

- Create Company
- Update Company
- Delete Company
- Get Company Details
- Get Recruiter's Company
- List Company Jobs

---

## 💼 Jobs

### Recruiter

- Create Job
- Update Job
- Delete Job
- Activate / Deactivate Job
- View Own Jobs

### Public

- Browse Jobs
- Search Jobs
- Filter Jobs
- Sort Jobs
- View Job Details

---

## 📄 Applications

### Candidate

- Apply to Jobs
- View My Applications
- Withdraw Application

### Recruiter

- View Job Applicants
- Update Application Status

---

## ⭐ Saved Jobs

- Save Job
- Remove Saved Job
- View Saved Jobs

---

## 📊 Dashboards

### Candidate Dashboard

- Total Applications
- Saved Jobs
- Recent Applications

### Recruiter Dashboard

- Total Jobs
- Active Jobs
- Total Applicants
- Recent Applications

---

## 🤖 AI

- Resume Review using Google Gemini

---

# 🛠 Tech Stack

## Backend

- NestJS
- TypeScript
- Node.js

## Database

- PostgreSQL
- Prisma ORM

## Authentication

- JWT
- Refresh Tokens
- bcrypt

## Validation

- class-validator
- class-transformer

## AI

- Google Gemini
- Google GenAI SDK

## Documentation

- Swagger (OpenAPI)

---

# 📁 Project Structure

```
src/
│
├── auth/
├── profile/
├── company/
├── job/
├── application/
├── saved-job/
├── dashboard/
├── ai/
├── prisma/
└── app.module.ts
```

---

# 📖 API Documentation

After starting the server:

```
http://localhost:3000/api/docs
```

Swagger provides complete API documentation for every endpoint.

---

# ⚙️ Installation

Clone the repository

```bash
git clone https://github.com/<your-username>/hirecoder-backend.git
```

Install dependencies

```bash
npm install
```

Create a `.env` file

```env
DATABASE_URL=
JWT_SECRET=
GEMINI_API_KEY=
```

Run Prisma migrations

```bash
npx prisma migrate dev
```

Generate Prisma Client

```bash
npx prisma generate
```

Start the development server

```bash
npm run start:dev
```

---

# 📚 API Modules

- Authentication
- Profile
- Company
- Jobs
- Applications
- Saved Jobs
- Dashboard
- AI

---

# 🗄 Database

Main entities:

- User
- Profile
- Company
- Job
- Application
- SavedJob

---

# 🔐 Authentication Flow

- Register
- Login
- Access Token
- Refresh Token
- Logout

---

# 🚀 Future Improvements

- Resume PDF Upload
- AI Job Matching
- AI Cover Letter Generator
- AI Interview Preparation
- Email Notifications
- Docker Support
- CI/CD Pipeline
- Unit & Integration Tests

---

# 👨‍💻 Author

**Himalaya Harsh**

Senior Frontend Engineer transitioning into Full Stack & AI Engineering.

---

# 📄 License

This project is intended for educational and portfolio purposes.
