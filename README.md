# HireCoder Backend

A production-ready backend application built with **NestJS**, **TypeScript**, and **Google Gemini AI**. The project is being developed to simulate a real-world recruitment platform while learning backend development, authentication, AI integration, and scalable software architecture.

---

# Project Goals

- Learn NestJS from fundamentals to production
- Build a scalable backend architecture
- Implement secure authentication
- Integrate Large Language Models (LLMs)
- Build AI-powered recruitment features
- Follow software engineering best practices

---

# Tech Stack

## Backend

- NestJS
- TypeScript
- Node.js

## Validation

- class-validator
- class-transformer

## Authentication

- bcrypt

## AI

- Google Gemini
- Google GenAI SDK

## Configuration

- @nestjs/config

---

# Current Features

## Authentication

- User Registration
- DTO Validation
- Password Validation
- Custom Password Matching Decorator
- Password Hashing using bcrypt

---

## AI

- Resume Review API
- Gemini Integration
- Prompt Separation
- Environment Variable Configuration
- Automatic AI Model Fallback

---

# Project Structure

```
src
│
├── auth
├── ai
├── common
│
└── app.module.ts

docs
├── authentication.md
├── ai-integration.md
└── architecture.md
```

---

# Architecture

```
React

↓

Axios

↓

NestJS

↓

Controllers

↓

Services

↓

Gemini AI

↓

Prisma (Upcoming)

↓

PostgreSQL (Upcoming)
```

---

# API Endpoints

## Authentication

### Register

```
POST /auth/register
```

---

## AI

### Resume Review

```
POST /ai/resume-review
```

---

# Environment Variables

Create a `.env` file.

```env
GEMINI_API_KEY=YOUR_API_KEY
GEMINI_MODEL=gemini-3.5-flash
```

---

# Getting Started

Install dependencies

```bash
npm install
```

Start development server

```bash
npm run start:dev
```

---

# Upcoming Features

## Authentication

- Login
- JWT Authentication
- Refresh Tokens
- Forgot Password
- Email Verification

---

## User

- Profile
- Resume Upload
- Profile Management

---

## AI

- Resume PDF Analysis
- ATS Score
- Cover Letter Generator
- Job Description Analyzer
- Interview Coach
- Streaming AI Responses

---

## Database

- Prisma ORM
- PostgreSQL
- Migrations

---

# Documentation

Detailed documentation is available inside the `docs` directory.

- Authentication Module
- AI Integration
- Architecture

---

# Author

**Himalaya Harsh**

Frontend Developer transitioning into Full Stack & AI Engineering.

---

# License

This project is developed for learning and portfolio purposes.
