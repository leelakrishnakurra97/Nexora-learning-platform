# Nexora Learning Platform - Key System Workflows

This document outlines the core workflows inside the Nexora codebase. Use this to walk your team through how frontend interactions, backend services, and databases interact to power these features.

---

## 1. Authentication & OTP Reset Workflow

```mermaid
sequenceDiagram
    participant User as Student Client
    participant API as Express API
    participant DB as PostgreSQL (Prisma)
    participant SMTP as Nodemailer SMTP

    User->>API: Forgot Password? Submit Email
    API->>DB: Check if email exists
    DB-->>API: Yes
    API->>API: Generate 6-digit OTP & Expiry (10m)
    API->>SMTP: Send OTP email to student
    API-->>User: Show OTP verification form
    User->>API: Submit 6-digit OTP
    API->>API: Verify OTP value & Expiry
    API-->>User: OTP valid, show New Password Form
    User->>API: Submit New Password
    API->>API: Hash password (Bcrypt)
    API->>DB: Update user password record
    API-->>User: Password reset successful! Redirect to login.
```

---

## 2. Dynamic Quiz Generation Workflow

When a student clicks "Topic Quiz" for the first time, this flow generates questions dynamically.

```mermaid
sequenceDiagram
    participant User as Student Client
    participant API as Express API
    participant AI as Gemini / Pollinations
    participant DB as PostgreSQL (Prisma)

    User->>API: GET /topics/:topicId/quizzes
    API->>DB: Fetch quiz for topicId
    
    alt Quiz exists with >= 10 questions
        DB-->>API: Return quiz
        API-->>User: Render Quiz (10 Questions)
    else Quiz does not exist or has < 10 questions
        API->>DB: Delete legacy quiz (Cascade delete)
        API->>AI: Generate 10 MCQs for topicName (strictly formatted JSON)
        
        alt AI Success
            AI-->>API: Return JSON list of 10 MCQs
        else AI Throttled / Fails
            API->>API: Read fallback from local question-bank.json (slice & pad to 10)
        end
        
        API->>DB: Save new Quiz, QuizQuestions, and QuizOptions
        API-->>User: Render freshly generated Quiz (10 Questions)
    end
```

---

## 3. WebRTC Live Classroom Workflow

How teachers host and students securely join live classes.

```mermaid
sequenceDiagram
    participant Teacher as Teacher Portal
    participant Student as Student Portal
    participant API as Express API
    participant LK as LiveKit Cloud (SFU)
    participant DB as PostgreSQL (Prisma)

    Teacher->>API: Create Live Class (Room code, scheduled time)
    API->>DB: Save meeting with status "UPCOMING"
    
    Note over Teacher, API: Teacher starts meeting
    Teacher->>API: Launch Meeting (host)
    API->>LK: Generate host connection token
    API->>DB: Update meeting status to "LIVE"
    API-->>Teacher: Load LiveKit Room (host controls)

    Note over Student, API: Student joins meeting
    Student->>API: Click "Join Live Meeting"
    API-->>Student: Redirect to code verification lobby (/webrtc-live)
    Student->>API: Enter Meeting Room Code
    API->>DB: Verify code is active and student is enrolled in classId
    API->>LK: Generate participant connection token
    API-->>Student: Connect to LiveKit SFU (render audio/video streams)
```

---

## 4. Secure Notes & Document Workflow

Explains the upload, preview, and download flow.

```mermaid
sequenceDiagram
    participant Teacher as Teacher Portal
    participant Student as Student Portal
    participant API as Express API
    participant MinIO as MinIO Object Storage
    participant Vite as Vite Proxy / Static Server

    Teacher->>API: Upload Notes PDF
    API->>MinIO: Save file to "lms-files" bucket
    API->>API: Create CourseNote database entry

    Note over Student, MinIO: Notes viewing
    Student->>Vite: Request Note PDF (Embed)
    Vite->>Vite: pdfRedirectPlugin checks URL
    alt URL contains download=true
        Vite-->>Student: Bypass preview redirect, download PDF to disk
    else URL lacks download parameter
        Vite-->>Student: Redirect to secure PDF viewer frame (protected preview)
    end
```
