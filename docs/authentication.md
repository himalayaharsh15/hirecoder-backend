# Authentication Module

## Overview

The Authentication module is responsible for handling user registration and forms the foundation of the authentication system for HireCoder.

Current implementation focuses on secure user registration, request validation and password hashing.

---

# Features

- User Registration API
- DTO Validation
- Custom Password Confirmation Validator
- Password Hashing using bcrypt
- Global Validation Pipeline

---

# Folder Structure

src
└── auth
├── auth.controller.ts
├── auth.service.ts
├── auth.module.ts
└── dto
└── register-user.dto.ts

src
└── common
└── validators
└── password-match.validator.ts

---

# Registration API

POST /auth/register

## Request

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "Password@123",
  "confirmPassword": "Password@123"
}
```
