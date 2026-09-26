# 💼 Job Portal Backend REST API

A full-fledged, real-world Job Portal Backend REST API built using the **MERN** backend stack (**Node.js**, **Express.js**, **MongoDB**, and **Mongoose**).

This project was built from scratch to demonstrate production-grade backend engineering concepts: **RESTful architecture**, **JWT Authentication** with **httpOnly cookies**, **password hashing with bcryptjs**, **Role-Based Access Control (RBAC)** across three user roles (**Job Seeker**, **Employer**, and **Admin**), **Embedded & Referenced Mongoose document models**, and **Postman API testing**.

---

## 🚀 Key Features & Concepts Covered

1. **RESTful API Design**: Clean URL conventions, standard HTTP status codes (`200`, `201`, `400`, `401`, `403`, `404`, `500`), resource-oriented routing.
2. **MongoDB & Mongoose**:
   - **Referenced Documents**: `Job` references `User` (Employer), `Application` references `Job`, `User` (Applicant), and `User` (Employer).
   - **Embedded Documents**:
     - Job Seeker's skills, education history, and experience details are embedded subdocuments in the `User` schema.
     - Recruiter's company details are embedded in the `User` schema.
     - `Application` stores an embedded `applicantSnapshot` (preserving applicant data at the time of application) and an embedded `statusHistory` array tracking every stage transition.
   - **Compound Indexes**: Unique compound index `{ job: 1, applicant: 1 }` prevents candidates from applying multiple times to the same job listing.
3. **Authentication & Security**:
   - Password hashing with **`bcryptjs`** using salt rounds in a Mongoose `pre('save')` middleware hook.
   - **JSON Web Tokens (JWT)** generated on register/login and sent via **`httpOnly` secure cookies** (mitigating XSS attacks).
   - Fallback support for `Authorization: Bearer <token>` header for convenient Postman and mobile client testing.
4. **Role-Based Access Control (RBAC)**:
   - Three distinct roles: `job_seeker`, `employer`, and `admin`.
   - Granular middleware `protect` and `authorize('employer', 'admin')` protecting sensitive endpoints.
5. **Search, Filtering & Pagination**:
   - Filter jobs by keyword, category, job type (Full-time, Internship, Remote, etc.), location, and salary range.
   - Sort by newest, oldest, highest salary, and lowest salary with page-based pagination.
6. **Postman API Collection**:
   - Ready-to-import Postman collection with automatic token capture scripts for seamless testing.

---

## 👥 User Roles & Permissions Matrix

| Feature / Action | Job Seeker | Employer | Admin |
|---|:---:|:---:|:---:|
| Register / Login / Logout | ✅ | ✅ | ✅ (Login/Logout) |
| Manage Personal Profile & Resume | ✅ | ❌ | ❌ |
| Manage Company Profile | ❌ | ✅ | ❌ |
| Search & Browse Open Jobs | ✅ | ✅ | ✅ |
| Post New Job Listings | ❌ | ✅ | ❌ |
| Edit / Delete Own Job Listings | ❌ | ✅ | ✅ (Any job) |
| Apply for Jobs with Resume | ✅ | ❌ | ❌ |
| Track My Applications & Withdraw | ✅ | ❌ | ❌ |
| View Applicants for Posted Jobs | ❌ | ✅ | ✅ |
| Update Applicant Status (Shortlist/Reject) | ❌ | ✅ | ✅ |
| View Platform Analytics & Stats | ❌ | ❌ | ✅ |
| Moderation: Manage/Delete Users | ❌ | ❌ | ✅ |

---

## 📁 Project Architecture & Folder Structure

```
Job-Portal/
├── config/
│   └── db.js                        # MongoDB Mongoose connection setup
├── controllers/
│   ├── authController.js            # Register, login, logout, getMe
│   ├── userController.js            # Seeker profile & employer company updates
│   ├── jobController.js             # Job CRUD, search, filter, pagination
│   ├── applicationController.js     # Job applications & status pipeline
│   └── adminController.js           # Platform metrics & user moderation
├── middleware/
│   ├── authMiddleware.js            # JWT verification & RBAC authorization
│   └── errorMiddleware.js           # Centralized 404 & error handlers
├── models/
│   ├── User.js                      # User model with embedded profile & companyDetails
│   ├── Job.js                       # Job model referencing User (employer)
│   └── Application.js               # Application model with embedded snapshot & history
├── routes/
│   ├── authRoutes.js                # /api/auth
│   ├── userRoutes.js                # /api/users
│   ├── jobRoutes.js                 # /api/jobs
│   ├── applicationRoutes.js         # /api/applications
│   └── adminRoutes.js               # /api/admin
├── utils/
│   └── generateToken.js             # JWT signer & httpOnly cookie dispatcher
├── .env.example                     # Sample environment variable template
├── .gitignore                       # Ignored files (node_modules, .env)
├── Job_Portal_API.postman_collection.json # Ready-to-test Postman collection
├── package.json                     # Project manifest and scripts
├── seeder.js                        # Demo data populator script
└── server.js                        # Express server entry point
```

---

## 🛠️ Tech Stack

- **Runtime Environment**: [Node.js](https://nodejs.org/) (v18+)
- **Web Framework**: [Express.js](https://expressjs.com/) (v4.x)
- **Database**: [MongoDB](https://www.mongodb.com/)
- **Object Data Modeling (ODM)**: [Mongoose](https://mongoosejs.com/) (v8.x)
- **Authentication**: [jsonwebtoken](https://github.com/auth0/node-jsonwebtoken) (JWT)
- **Password Security**: [bcryptjs](https://github.com/dcodeIO/bcrypt.js)
- **Cookie Parsing**: [cookie-parser](https://github.com/expressjs/cookie-parser)
- **Environment Config**: [dotenv](https://github.com/motdotla/dotenv)
- **CORS Handling**: [cors](https://github.com/expressjs/cors)

---

## ⚙️ Installation & Setup

### 1. Clone the repository
```bash
git clone https://github.com/Gunith08/Job-Portal.git
cd Job-Portal
```

### 2. Install dependencies
```bash
npm install
```

### 3. Configure environment variables
Copy the `.env.example` file to `.env`:
```bash
cp .env.example .env
```
Inside `.env`, verify or customize your settings:
```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://127.0.0.1:27017/jobportal
JWT_SECRET=jobportal_supersecret_jwt_key_2026_dev
JWT_EXPIRE=7d
COOKIE_EXPIRE=7
CLIENT_URL=http://localhost:3000
```

### 4. Seed sample data (optional but recommended)
Populate the database with sample Admins, Employers, Job Seekers, Jobs, and Applications:
```bash
npm run seed
```
To wipe all data from the database:
```bash
node seeder.js -d
```

### 5. Start the server
For development with auto-reload:
```bash
npm run dev
```
For production:
```bash
npm start
```
The server will start listening at: `http://localhost:5000`

---

## 🧪 Pre-configured Seed Credentials

| Role | Name | Email | Password |
|---|---|---|---|
| **Admin** | Platform Administrator | `admin@jobportal.com` | `adminPassword123` |
| **Employer** | Vikram Mehta (TechCorp) | `recruiter@techcorp.in` | `employerPassword123` |
| **Employer** | Pooja Sundaram (CloudScale) | `hr@cloudscale.io` | `employerPassword123` |
| **Job Seeker** | Chigulla Gunith Sai Anjaneya | `gunith.cse@gmail.com` | `seekerPassword123` |
| **Job Seeker** | Ananya Verma | `ananya.verma@example.com` | `seekerPassword123` |

---

## 📡 API Endpoints Reference

### 🔐 Authentication (`/api/auth`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/auth/register` | Public | Register new Job Seeker or Employer |
| `POST` | `/api/auth/login` | Public | Authenticate user & receive JWT cookie / token |
| `POST` | `/api/auth/logout` | Private | Clear httpOnly authentication cookie |
| `GET` | `/api/auth/me` | Private | Retrieve logged-in user profile details |

### 👤 User Profiles (`/api/users`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `PUT` | `/api/users/profile` | Job Seeker | Update skills, education, experience, resume link |
| `PUT` | `/api/users/company` | Employer | Update company details (name, website, location, about) |
| `PUT` | `/api/users/change-password` | Private | Change password verifying current password |

### 💼 Job Listings (`/api/jobs`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/jobs` | Public | Search & filter all open jobs with pagination |
| `GET` | `/api/jobs/:id` | Public | Get single job details by ID |
| `GET` | `/api/jobs/my/listings` | Employer | Get all jobs posted by the logged-in employer |
| `POST` | `/api/jobs` | Employer | Post a new job vacancy |
| `PUT` | `/api/jobs/:id` | Employer / Admin | Update a job listing |
| `DELETE` | `/api/jobs/:id` | Employer / Admin | Delete job listing and associated applications |

### 📝 Job Applications (`/api/applications`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/applications/apply/:jobId` | Job Seeker | Submit application with resume & cover letter |
| `GET` | `/api/applications/my` | Job Seeker | View my submitted applications & review status |
| `DELETE` | `/api/applications/:id` | Job Seeker | Withdraw a submitted application |
| `GET` | `/api/applications/job/:jobId` | Employer / Admin | View all candidates who applied for this job |
| `PUT` | `/api/applications/:id/status` | Employer / Admin | Update applicant status (Shortlisted, Interviewing, Accepted, Rejected) |

### 🛡️ Admin Management (`/api/admin`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/admin/stats` | Admin | Get platform metrics (users, jobs, applications breakdown) |
| `GET` | `/api/admin/users` | Admin | List all registered users with role filter & pagination |
| `PUT` | `/api/admin/users/:id/status` | Admin | Activate / deactivate a user account or change role |
| `DELETE` | `/api/admin/users/:id` | Admin | Delete a user and cascade delete their jobs / applications |

---

## 📬 Postman Testing

1. Open Postman.
2. Click **Import** and select the file [`Job_Portal_API.postman_collection.json`](./Job_Portal_API.postman_collection.json) located in the project root.
3. The collection includes pre-configured collection variables:
   - `baseUrl`: `http://localhost:5000/api`
   - `token`: automatically populated whenever you execute any Login request in the **Authentication** folder!
4. Test the flow:
   - Run **Login - Job Seeker** or **Login - Employer**. The test script automatically saves the `token` variable.
   - Run protected requests like **Create Job (Employer)** or **Apply for Job (Job Seeker)** without needing to manually copy/paste tokens!

---

## 📜 License
This project is open-source and available under the [MIT License](LICENSE).
