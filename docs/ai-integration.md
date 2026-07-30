# AI Integration

**Version:** v0.1.0

**Status:** ✅ Completed

**Last Updated:** 28 July 2026

**Author:** Himalaya Harsh

---

# Overview

The AI module integrates Google's Gemini Large Language Model (LLM) into the HireCoder backend. It enables AI-powered resume analysis by accepting resume content from the client, generating a structured prompt, sending it to Gemini, and returning an AI-generated review.

The implementation follows a modular architecture to keep AI-specific logic isolated from the rest of the application and to support future AI features.

---

# Objectives

- Learn LLM integration using NestJS
- Build a reusable AI module
- Integrate Google Gemini API
- Implement prompt engineering
- Handle model failures gracefully
- Prepare the architecture for future AI features

---

# Current Features

- Resume Review API
- Gemini AI Integration
- Prompt Separation
- Environment Variable Configuration
- AI Model Fallback Strategy
- Error Handling

---

# Technology Stack

Backend

- NestJS
- TypeScript
- Google GenAI SDK
- @nestjs/config

AI

- Google Gemini

---

# Folder Structure

src
└── ai
├── ai.controller.ts
├── ai.service.ts
├── ai.module.ts
├── DTO
│ └── review-resume.dto.ts
├── prompts
│ └── resume-review.prompt.ts
└── config
└── models.ts

---

# Request Flow

React Client

↓

Axios

↓

POST /ai/resume-review

↓

AI Controller

↓

AI Service

↓

Prompt Builder

↓

Gemini API

↓

AI Response

↓

NestJS

↓

React Client

---

# API Endpoint

POST /ai/resume-review

## Request

```json
{
  "resume": "Frontend Developer with 5 years of experience in React..."
}
```

---

# Response

Current Response

```json
{
  "review": "ATS Score: 87\nStrengths...\nWeaknesses..."
}
```

Future Response

```json
{
  "atsScore": 87,
  "strengths": [],
  "weaknesses": [],
  "missingSkills": [],
  "interviewChance": "",
  "summary": ""
}
```

---

# Prompt Engineering

The prompt is separated from the service layer.

Current Location

src/ai/prompts/resume-review.prompt.ts

### Why?

Separating prompts from the service improves:

- Maintainability
- Reusability
- Readability
- Prompt Versioning

Future AI features will simply add new prompt files instead of increasing service complexity.

Example

- resume-review.prompt.ts
- cover-letter.prompt.ts
- interview-feedback.prompt.ts
- job-analysis.prompt.ts

---

# Environment Variables

```env
GEMINI_API_KEY=YOUR_API_KEY
GEMINI_MODEL=gemini-3.5-flash
```

Why?

Sensitive configuration should never be hardcoded into source code.

Benefits

- Better security
- Different configurations per environment
- Easy model switching

---

# AI Model Fallback Strategy

One challenge encountered during development was temporary model unavailability.

Instead of failing immediately, the application attempts multiple supported Gemini models.

Implementation Flow

Request

↓

Gemini Model 1

↓

Failed

↓

Gemini Model 2

↓

Failed

↓

Gemini Model 3

↓

Success

↓

Return Response

Benefits

- Improved Reliability
- Better User Experience
- Reduced Downtime

---

# Error Handling

The AI service handles common runtime failures including:

- Invalid Model
- Model Deprecation
- High Demand (503)
- API Errors

Meaningful exceptions are returned instead of exposing raw provider errors.

---

# Challenges Faced

## Challenge 1

Problem

404 Cannot POST /ai/resume-review

Cause

AiModule was not imported into AppModule.

Solution

Imported AiModule into the application's root module.

---

## Challenge 2

Problem

Model Not Found

Cause

Incorrect model name and deprecated models.

Solution

Used the Gemini SDK to list supported models and updated configuration.

---

## Challenge 3

Problem

503 Service Unavailable

Cause

High demand on Gemini servers.

Solution

Implemented automatic model fallback.

---

# Design Decisions

## Separate AI Module

Reason

AI functionality is independent from authentication and user management.

Benefits

- Better separation of concerns
- Easier maintenance
- Future scalability

---

## Separate Prompt Files

Reason

Business logic should remain independent from prompt design.

Benefits

- Easier prompt updates
- Cleaner service layer
- Better testing

---

## Configurable Model Selection

Reason

Model availability changes over time.

Benefits

- No code changes required when switching models
- Environment-specific configuration

---

# Future Improvements

- JSON Structured Responses
- Resume PDF Upload
- ATS Score Calculation
- AI Cover Letter Generator
- Job Description Analyzer
- Interview Coach
- Streaming Responses
- Conversation History
- Retrieval Augmented Generation (RAG)
- Vector Database Integration
- Multi-Provider Support (OpenAI, Claude, Gemini)

---

# Learning Outcomes

This module introduced the following concepts:

- NestJS Module Design
- Dependency Injection
- Environment Configuration
- LLM Integration
- Prompt Engineering
- AI Service Architecture
- Error Handling
- AI Model Fallback
- Production Debugging
- Separation of Concerns

---

# Version History

## v0.1.0

Added

- AI Module
- Gemini Integration
- Resume Review API
- Prompt Separation
- Model Fallback Strategy
