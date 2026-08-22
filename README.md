# Cocokin.ai — Computation Engine (Backend)

> Part of the **Cocokin.ai** vector similarity relationship measurement tool. This repository contains the backend NestJS service.

This NestJS application serves as the computation engine and database layer for Cocokin.ai. It manages authentication, coordinates, submissions, and handles the multi-dimensional vector math calculation to evaluate alignment between users.

---

## 📐 Mathematical Model: Cosine Similarity

The core engine maps answers (ratings 1 to 5) of a quiz into N-dimensional vectors:
*   **Vector A**: Creator's reference preferences: $\mathbf{A} = [a_1, a_2, \dots, a_n]$
*   **Vector B**: Participant's answers: $\mathbf{B} = [b_1, b_2, \dots, b_n]$

The backend computes the normalized dot product to find the cosine of the angle between the two vectors:

$$\text{Cosine Similarity} = \frac{\mathbf{A} \cdot \mathbf{B}}{\|\mathbf{A}\| \|\mathbf{B}\|} = \frac{\sum_{i=1}^n a_i b_i}{\sqrt{\sum_{i=1}^n a_i^2} \sqrt{\sum_{i=1}^n b_i^2}}$$

This yields a score between `0` and `1`, which is formatted as a precise matching percentage `0% - 100%`.

---

## 🛠️ Features

*   **Google OAuth 2.0 & JWT Authentication**: Hybrid passport strategy supporting standard JWT authentication and instant social login via Google.
*   **Vector Math Engine**: Calculates cosine similarity on PostgreSQL database rows and compiles detailed angular offsets.
*   **Geolocation Tracker**: Resolves client IP addresses into real-time cities and countries (using `freeipapi.com` IP lookup) upon quiz submission.
*   **Prisma ORM & PostgreSQL**: Structured relational modeling with automatic cascade deletes (`onDelete: Cascade` on Quiz relationships).

---

## 🚀 Tech Stack

*   **Framework**: NestJS (TypeScript)
*   **Database ORM**: Prisma
*   **Database**: PostgreSQL
*   **Security/Auth**: Passport, JWT, Bcrypt
*   **Third-party strategies**: Google OAuth 2.0

---

## ⚙️ Configuration & Installation

### Prerequisites
Make sure you have Node.js (v18+) and a local PostgreSQL instance running.

### Installation
1. Navigate to the backend directory:
   ```bash
   cd cocokin-backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up environment variables. Create a `.env` file in the root of the backend folder:
   ```env
   # Database connection string
   DATABASE_URL="postgresql://username:password@localhost:5432/cocokin?schema=public"

   # Google Client Credentials (obtained via Google Cloud Console)
   GOOGLE_CLIENT_ID="your_google_client_id"
   GOOGLE_CLIENT_SECRET="your_google_client_secret"
   GOOGLE_CALLBACK_URL="http://localhost:3000/auth/google/callback"
   
   # Frontend redirection URL
   FRONTEND_URL="http://localhost:5173"
   ```
4. Run database migrations to set up schema structures:
   ```bash
   npx prisma db push
   ```
5. Start NestJS in development mode:
   ```bash
   npm run start:dev
   ```

---

## 📁 Endpoints (API Routes)

### Authentication
*   `POST /auth/login` - Standard email/password verification.
*   `GET /auth/google` - Initiates Google Sign-In redirect.
*   `GET /auth/google/callback` - Redirect target from Google, issues JWT and redirects to React.

### Quizzes (Protected routes require `Authorization: Bearer <token>`)
*   `POST /quizzes` [Protected] - Create a new quiz with reference questions.
*   `GET /quizzes/my` [Protected] - Retrieves all quizzes created by the logged-in user.
*   `GET /quizzes/:id/submissions` [Protected] - Lists all resonance submissions for a quiz.
*   `GET /quizzes/:id` [Public] - Gets quiz structure (questions) for participants.
*   `POST /quizzes/:id/submit` [Public] - Submits participant answers, calculates alignment, tracks IP/location, and stores the result.
