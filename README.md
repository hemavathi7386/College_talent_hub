# College Talent Hub

A comprehensive MERN stack application for Centurion University of Technology and Management that connects students, faculty, and recruiters through a unified platform.

## Features

### 🔐 Authentication & Authorization
- **Role-based authentication** (Student, Faculty, Recruiter)
- **Email validation** based on user roles:
  - Students: `rollnumber@cutmap.ac.in`
  - Faculty: `name@cutmap.ac.in`
  - Recruiters: Any valid email
- JWT token-based authentication
- Password hashing with bcrypt

### 👥 User Management
- **Student profiles** with skills, achievements, and department info
- **Faculty profiles** for managing competitions and events
- **Recruiter profiles** for posting job opportunities
- Profile editing and skill management

### 📝 Social Features
- **Post creation** and sharing
- **Like and comment** system
- **Real-time feed** with user interactions
- Achievement showcasing

### 💼 Job & Internship Management
- **Smart job matching** based on student skills
- **Automatic filtering** - students only see eligible opportunities
- **Application tracking** for recruiters
- Support for jobs, internships, and freelance work
- Skill-based recommendations (30% minimum match required)

### 🏆 Competition Management
- **Faculty-only** competition creation
- **Student registration** system
- Competition categories (Technical, Cultural, Sports, Academic, Other)
- Prize management and participant tracking
- Registration deadline enforcement

### 🎯 Smart Matching Algorithm
- **Skill-based job recommendations** for students
- **Automatic student suggestions** for recruiters when posting jobs
- **Eligibility filtering** based on skill match percentage

## Tech Stack

### Backend
- **Node.js** with Express.js
- **MongoDB** with Mongoose ODM
- **JWT** for authentication
- **bcryptjs** for password hashing
- **express-validator** for input validation
- **CORS** enabled for cross-origin requests

### Frontend
- **React.js** with functional components and hooks
- **TailwindCSS** for styling
- **React Router** for navigation
- **Axios** for API calls
- **React Hook Form** for form handling
- **React Hot Toast** for notifications
- **Lucide React** for icons

## Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or cloud instance)
- npm or yarn package manager

### Backend Setup

1. **Navigate to backend directory:**
   ```bash
   cd backend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment variables:**
   - Copy `.env.example` to `.env` (if exists) or create `.env` file
   - Update the following variables:
   ```env
   MONGODB_URI=mongodb://localhost:27017/college_talent_hub
   JWT_SECRET=your_jwt_secret_key_here_change_in_production
   PORT=5000
   NODE_ENV=development
   ```

4. **Start MongoDB:**
   - Make sure MongoDB is running on your system
   - For local MongoDB: `mongod`
   - For MongoDB Atlas: Use your connection string

5. **Start the backend server:**
   ```bash
   npm run dev
   ```
   The backend will run on `http://localhost:5000`

### Frontend Setup

1. **Navigate to frontend directory:**
   ```bash
   cd frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the frontend development server:**
   ```bash
   npm start
   ```
   The frontend will run on `http://localhost:3000`

### Full Application Setup

1. **Install all dependencies at once:**
   ```bash
   npm run install-all
   ```

2. **Run both frontend and backend concurrently:**
   ```bash
   npm run dev
   ```

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user

### Posts
- `GET /api/posts` - Get all posts
- `POST /api/posts` - Create new post
- `PUT /api/posts/:id/like` - Like/unlike post
- `POST /api/posts/:id/comment` - Add comment

### Jobs
- `GET /api/jobs` - Get jobs (filtered by role)
- `POST /api/jobs` - Create job (recruiters only)
- `POST /api/jobs/:id/apply` - Apply for job (students only)
- `PUT /api/jobs/:jobId/applicants/:applicantId` - Update applicant status

### Competitions
- `GET /api/competitions` - Get all competitions
- `POST /api/competitions` - Create competition (faculty only)
- `POST /api/competitions/:id/register` - Register for competition (students only)

### Users
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile
- `GET /api/users/students` - Get students list (faculty/recruiters only)

## User Roles & Permissions

### Students
- ✅ Create and view posts
- ✅ Apply for jobs/internships
- ✅ Register for competitions
- ✅ View other students (limited)
- ✅ Manage personal profile and skills

### Faculty
- ✅ Create and view posts
- ✅ Create and manage competitions
- ✅ View all students
- ✅ Manage personal profile

### Recruiters
- ✅ Create and view posts
- ✅ Post and manage job opportunities
- ✅ View student profiles
- ✅ Manage job applications
- ✅ Get skill-matched student recommendations

## Key Features Explained

### Email Validation System
The application enforces strict email validation:
- **Students** must use their roll number followed by `@cutmap.ac.in`
- **Faculty** must use any valid email ending with `@cutmap.ac.in`
- **Recruiters** can use any valid email address

### Skill Matching Algorithm
- When recruiters post jobs, the system automatically suggests students whose skills match the required skills
- Students only see jobs where they have at least 30% skill match
- Match percentage is calculated based on skill overlap

### Security Features
- JWT tokens with 7-day expiration
- Password hashing with bcrypt
- Role-based route protection
- Input validation and sanitization
- CORS configuration for secure cross-origin requests

## Development

### Project Structure
```
college_talent_hub/
├── backend/
│   ├── models/          # MongoDB schemas
│   ├── routes/          # API routes
│   ├── middleware/      # Authentication middleware
│   ├── .env            # Environment variables
│   └── server.js       # Express server setup
├── frontend/
│   ├── src/
│   │   ├── components/  # React components
│   │   ├── pages/       # Page components
│   │   ├── contexts/    # React contexts
│   │   └── App.js      # Main App component
│   └── public/         # Static files
└── package.json        # Root package.json for scripts
```

### Available Scripts

**Root level:**
- `npm run dev` - Run both frontend and backend
- `npm run server` - Run backend only
- `npm run client` - Run frontend only
- `npm run install-all` - Install all dependencies

**Backend:**
- `npm run dev` - Start with nodemon
- `npm start` - Start production server

**Frontend:**
- `npm start` - Start development server
- `npm run build` - Build for production

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support and questions, please contact the development team or create an issue in the repository.

---

**Centurion University of Technology and Management**  
*Connecting Talent, Creating Opportunities*
