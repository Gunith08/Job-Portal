# 💼 Job Portal Backend REST API
### MastersCoding • Backend Development Mini Project (Node.js + Express.js + MongoDB)

A complete, secure, role-based REST API for a real-world **Job Portal** where **Job Seekers** can discover and apply for jobs, **Employers** can create and manage job postings, and **Admins** can maintain and moderate the platform.

Built by **Chigulla Gunith Sai Anjaneya** (2nd Year B.Tech CSE, VNRVJIET).

---

## 📋 Table of Contents
1. [Project Overview](#-project-overview)
2. [Technology Stack](#-technology-stack)
3. [User Roles & Access Matrix](#-user-roles--access-matrix)
4. [Database Design & Architecture (Design Exercise)](#-database-design--architecture-design-exercise)
5. [Authentication & Security Implementation](#-authentication--security-implementation)
6. [API Endpoints Reference](#-api-endpoints-reference)
7. [Installation & Setup](#-installation--setup)
8. [Database Seeder & Test Credentials](#-database-seeder--test-credentials)
9. [Postman API Testing Guide](#-postman-api-testing-guide)
10. [Submission Checklist](#-submission-checklist)

---

## 🎯 Project Overview

This is a backend-only REST API system that connects Job Seekers, Employers, and Administrators through a secure architecture.

### Core Application Flow:
1. A new user registers with the appropriate role (`job_seeker` or `employer`).
2. The user logs in and receives a JWT stored in an `httpOnly` cookie.
3. Authentication middleware (`protect`) verifies the JWT before protected operations.
4. Role-verification middleware (`authorize`) ensures each user can only perform actions allowed for their role.
5. Employers create, update, and manage their job postings.
6. Job Seekers browse open jobs, apply with resumes, and track their application statuses.
7. Employers review candidate applications received for their job postings and update statuses (e.g., Shortlisted, Interviewing, Accepted, Rejected).
8. Admins inspect platform statistics, moderate user accounts, and remove inappropriate job postings.

---

## 🛠️ Technology Stack

| Component | Technology | Purpose |
|---|---|---|
| **Runtime** | Node.js (v18+) | JavaScript execution engine |
| **Backend Framework** | Express.js | Routing, middleware, RESTful API architecture |
| **Database** | MongoDB | Document-oriented NoSQL database |
| **ODM** | Mongoose (v8.x) | Data schemas, validations, subdocuments, and relationships |
| **Authentication** | JSON Web Tokens (`jsonwebtoken`) | Stateless token-based user verification |
| **Password Security** | `bcryptjs` | Salted password hashing (10 salt rounds) |
| **Authentication Storage** | `httpOnly` Cookies (`cookie-parser`) | Secure cookie storage immune to XSS attacks |
| **API Testing** | Postman | End-to-end testing with pre-built test assertions |
| **Configuration** | `dotenv` | Environment variables management (`.env`) |

---

## 👥 User Roles & Access Matrix

| Capabilities | Job Seeker | Employer | Admin |
|---|:---:|:---:|:---:|
| Register / Login / Logout | ✅ | ✅ | ✅ (Login/Logout) |
| View & Update Own Profile | ✅ | ✅ (Company profile) | ❌ |
| View All Available Jobs (Public) | ✅ | ✅ | ✅ |
| View Single Job by ID (Public) | ✅ | ✅ | ✅ |
| Create New Job Postings | ❌ | ✅ | ❌ |
| View Own Job Postings | ❌ | ✅ | ❌ |
| Update & Delete Own Job Postings | ❌ | ✅ | ✅ (Any Job) |
| Apply for Jobs | ✅ | ❌ | ❌ |
| Prevent Duplicate Applications to Same Job | ✅ (Enforced) | — | — |
| View My Submitted Applications & Status | ✅ | ❌ | ❌ |
| Withdraw Application | ✅ | ❌ | ❌ |
| View Applications for Posted Jobs | ❌ | ✅ (Own jobs) | ✅ (All jobs) |
| Update Applicant Status (Shortlist/Reject) | ❌ | ✅ (Own jobs) | ✅ |
| View Platform Analytics & Metrics | ❌ | ❌ | ✅ |
| View All Users & View User by ID | ❌ | ❌ | ✅ |
| Update User Status (Active/Inactive/Role) | ❌ | ❌ | ✅ |
| Delete User (Cascade cleanup) | ❌ | ❌ | ✅ |

---

## 💡 Database Design & Architecture (Design Exercise)

> ### 🧠 Design Exercise Rationale: Embedded vs. Referenced Documents
> **Architecture Principle applied**:
> *“Choose embedding when the data belongs naturally to its parent and is usually read or updated together. Choose references when the related data has its own identity, lifecycle, or is shared across multiple documents.”*

### 1. `User` Model
- **Account & Security (Root)**: `name`, `email` (unique, lowercase), `password` (hashed with bcryptjs, `select: false`), `role` (`job_seeker`, `employer`, `admin`), `phone`, `isActive`.
- **Embedded `profile` (Job Seeker)**:
  - `skills`: String array `[String]`
  - `education`: `[{ institution, degree, yearOfPassing, gradeOrPercentage }]`
  - `experience`: `[{ company, position, years, description }]`
  - `resumeUrl`, `headline`, `bio`, `githubUrl`, `linkedinUrl`
  - *Decision*: Embedded because a seeker's skills and education naturally belong to their profile and are always fetched and displayed together with their account.
- **Embedded `companyDetails` (Employer)**:
  - `companyName`, `website`, `industry`, `location`, `aboutCompany`
  - *Decision*: Embedded because an employer's company description belongs directly to their profile.

### 2. `Job` Model
- **Fields**: `title`, `company`, `description`, `location`, `employmentType` (`Full-time`, `Part-time`, `Contract`, `Internship`, `Remote`), `salary` (embedded `{ min, max, currency, period }`), `requiredSkills`, `experienceRequirement`, `postedDate`, `applicationDeadline`, `jobStatus` (`Open`, `Closed`), `openings`, `applicantsCount`.
- **Reference Relationship**:
  - `employer` &rarr; References `User` (`ObjectId`).
  - *Decision*: Reference because each job has its own independent lifecycle, can receive hundreds of applications, and needs to be queried and filtered platform-wide.

### 3. `Application` Model
- **Reference Relationships**:
  - `job` &rarr; References `Job` (`ObjectId`).
  - `applicant` &rarr; References `User` (Job Seeker `ObjectId`).
  - `employer` &rarr; References `User` (Employer `ObjectId`).
- **Embedded Data**:
  - `applicantSnapshot`: `{ name, email, phone, headline, skills }` &mdash; Preserves the applicant's profile data at the time of application even if they edit their profile later!
  - `statusHistory`: `[{ status, note, changedAt }]` &mdash; Audit trail of status transitions (e.g. Pending &rarr; Under Review &rarr; Shortlisted).
- **Compound Unique Index**:
  - `{ job: 1, applicant: 1 }` with `{ unique: true }` ensures a Job Seeker cannot apply for the same job multiple times.

---

## 🔒 Authentication & Security Implementation

1. **Password Hashing**:
   - Mongoose `pre('save')` hook automatically generates a salt and hashes user passwords using `bcryptjs` before persisting to MongoDB.
   - `matchPassword()` instance method performs secure timing-safe password comparison.
   - Password fields use `select: false` so hashes are never exposed in API responses.
2. **JWT Authentication & httpOnly Cookies**:
   - `sendTokenResponse` utility signs a JWT containing the user's `id` and `role`.
   - The token is placed into an `httpOnly: true` cookie (with `secure: true` in production) to prevent access from client-side JavaScript, protecting against XSS attacks.
   - In addition, the token is returned in the response body to allow flexible testing in Postman using `Authorization: Bearer <token>`.
3. **Role-Based Access Control Middleware**:
   - `protect`: Extracts the token from cookies or the `Authorization` header, verifies validity with `jwt.verify`, checks if the user account is active, and attaches `req.user`.
   - `authorize(...roles)`: Verifies if `req.user.role` is included in the allowed roles list; returns `403 Forbidden` if unauthorized.
4. **Ownership Verification**:
   - Employers can update or delete only their own job postings (`job.employer.toString() === req.user.id`).
   - Employers can view applications only for jobs they own.
   - Job Seekers can view and withdraw only their own applications.

---

## 📡 API Endpoints Reference

### 🔐 1. Authentication Routes (`/api/auth`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/auth/register` | Public | Register new Job Seeker or Employer |
| `POST` | `/api/auth/login` | Public | Authenticate user & receive JWT httpOnly cookie |
| `POST` | `/api/auth/logout` | Private | Clear httpOnly authentication cookie |
| `GET` | `/api/auth/me` | Private | Get currently logged-in user profile |

### 👤 2. User Profile Routes (`/api/users`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/users/profile` | Private | View own profile |
| `PUT` | `/api/users/profile` | Job Seeker | Update skills, education, experience, resume link |
| `PUT` | `/api/users/company` | Employer | Update company details (name, website, location, about) |
| `PUT` | `/api/users/change-password` | Private | Update account password (validates current password) |

### 💼 3. Job Posting Routes (`/api/jobs`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/jobs` | Public | Search & filter jobs (keyword, category, location, salary) |
| `GET` | `/api/jobs/:id` | Public | View a specific job posting by ID |
| `GET` | `/api/jobs/my/listings` | Employer | View all jobs posted by the logged-in employer |
| `POST` | `/api/jobs` | Employer | Create a new job posting |
| `PUT` | `/api/jobs/:id` | Employer (owner) / Admin | Update own job posting |
| `DELETE` | `/api/jobs/:id` | Employer (owner) / Admin | Delete own job posting and associated applications |

### 📝 4. Job Application Routes (`/api/applications`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/applications/apply/:jobId` | Job Seeker | Apply for a job with resume URL and cover letter |
| `GET` | `/api/applications/my` | Job Seeker | View my submitted applications and status |
| `DELETE` | `/api/applications/:id` | Job Seeker | Withdraw a submitted application |
| `GET` | `/api/applications/job/:jobId` | Employer (owner) / Admin | View applications received for a specific job |
| `PUT` | `/api/applications/:id/status` | Employer (owner) / Admin | Update application status (Shortlist, Reject, etc.) |

### 🛡️ 5. Admin Management Routes (`/api/admin`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/admin/stats` | Admin | Review platform metrics (users, jobs, applications) |
| `GET` | `/api/admin/users` | Admin | View all registered users (with role filters) |
| `GET` | `/api/admin/users/:id` | Admin | View a single user by ID |
| `PUT` | `/api/admin/users/:id/status` | Admin | Update user status (active/inactive or change role) |
| `DELETE` | `/api/admin/users/:id` | Admin | Delete a user when required |
| `GET` | `/api/admin/jobs` | Admin | View all job postings platform-wide |
| `GET` | `/api/admin/jobs/:id` | Admin | View a job posting by ID |
| `DELETE` | `/api/admin/jobs/:id` | Admin | Remove inappropriate or invalid job postings |

---

## 💻 Installation & Setup

### Prerequisites
- Node.js (v18.0.0 or higher)
- MongoDB instance (Local MongoDB or MongoDB Atlas URI)

### Step 1: Clone the repository
```bash
git clone https://github.com/Gunith08/Job-Portal.git
cd Job-Portal
```

### Step 2: Install dependencies
```bash
npm install
```

### Step 3: Configure Environment Variables
Create a `.env` file in the root folder (or copy from `.env.example`):
```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://127.0.0.1:27017/jobportal
JWT_SECRET=jobportal_supersecret_jwt_key_2026_dev
JWT_EXPIRE=7d
COOKIE_EXPIRE=7
CLIENT_URL=http://localhost:3000
```

### Step 4: Seed the Database with Sample Data
Populate the database with pre-configured Admins, Employers, Job Seekers, Jobs, and Applications:
```bash
npm run seed
```

### Step 5: Start the Server
For development with auto-reload:
```bash
npm run dev
```
For production:
```bash
npm start
```
The server will start listening on `http://localhost:5000`.

---

## 🔑 Database Seeder & Test Credentials

| Role | Name | Email | Password |
|---|---|---|---|
| **Admin** | Platform Administrator | `admin@jobportal.com` | `adminPassword123` |
| **Employer** | Vikram Mehta (TechCorp) | `recruiter@techcorp.in` | `employerPassword123` |
| **Employer** | Pooja Sundaram (CloudScale) | `hr@cloudscale.io` | `employerPassword123` |
| **Job Seeker** | Chigulla Gunith Sai Anjaneya | `gunith.cse@gmail.com` | `seekerPassword123` |
| **Job Seeker** | Ananya Verma | `ananya.verma@example.com` | `seekerPassword123` |

---

## 📮 Postman API Testing Guide

The repository includes a ready-to-test Postman collection: **`Job_Portal_API.postman_collection.json`**.

### How to test:
1. Open **Postman**.
2. Click **Import** and select `Job_Portal_API.postman_collection.json`.
3. The collection is organized into 5 structured folders matching Section 9 of the project brief:
   - **`1. Authentication & Session`**: Test registration, login for all 3 roles, session check (`/me`), and logout cookie removal.
   - **`2. Security & Edge Case Tests (Section 9)`**:
     - Test request without authentication (`401 Unauthorized`).
     - Test request with invalid / expired token (`401 Unauthorized`).
     - Test Job Seeker attempting to post a job (`403 Forbidden`).
     - Test Employer attempting to apply for a job (`403 Forbidden`).
     - Test Non-admin attempting to access admin analytics (`403 Forbidden`).
     - Test invalid input and validation errors (`400 Bad Request`).
   - **`3. Job Seeker Features`**: Profile viewing/updating, job search/filter, job application, duplicate application prevention (`400`), application tracking, and withdrawal.
   - **`4. Employer Features`**: Company details update, creating job listings, viewing own jobs, updating job details, viewing applicants, updating applicant status (Shortlist/Reject), and deleting job listings.
   - **`5. Admin Features`**: Platform statistics, viewing all users, user status update, user deletion, viewing all jobs, and removing inappropriate job postings.
4. **Automated Token Management**: The login tests include test scripts that automatically save tokens into collection variables (`{{seekerToken}}`, `{{employerToken}}`, `{{adminToken}}`), eliminating manual copy/pasting!

---

## ✅ Submission Checklist (Section 10)

- [x] Complete Express.js backend source code.
- [x] MongoDB database with appropriate Mongoose schemas and models.
- [x] Environment configuration using `.env` (secrets safely excluded via `.gitignore`).
- [x] Postman collection containing all required API tests (`Job_Portal_API.postman_collection.json`).
- [x] Comprehensive README with setup instructions, API overview, roles, and design exercise explanations.
- [x] Pushed to GitHub repository: [https://github.com/Gunith08/Job-Portal.git](https://github.com/Gunith08/Job-Portal.git)
