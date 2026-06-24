🚀 Attendance Management System
<div align="center">
https://img.shields.io/badge/Attendance%2520Management-v2.0-blue
https://img.shields.io/badge/React-18.x-61DAFB?logo=react
https://img.shields.io/badge/Node.js-18.x-339933?logo=node.js
https://img.shields.io/badge/MongoDB-6.x-47A248?logo=mongodb
https://img.shields.io/badge/License-MIT-green

A comprehensive, production-ready attendance management system with AI-powered chatbot assistance

🌐 Live Demo • 📖 Documentation • 🐛 Report Bug • ✨ Request Feature

</div>
📋 Table of Contents
✨ Features

🎯 Problem Solved

🛠️ Tech Stack

📊 Architecture Overview

🚀 Live Demo

📸 Screenshots

⚡ Quick Start

📖 API Documentation

👥 Role-Based Access

🤖 AI Chatbot Assistant

📊 Database Design

🔐 Security Features

📈 Future Roadmap

🤝 Contributing

📄 License

✨ Features
Core Features
<table> <tr> <td width="50%">
👤 User Management
Role-based access (Admin, HR, Employee)

User creation, update, deactivation

Employee ID generation

Role assignment and management

⏰ Attendance Tracking
Clock in/out with timestamps

Today's attendance status

Working hours calculation

Overtime tracking

Late arrival detection

📝 Correction Requests
Submit correction requests

Request status tracking

Approve/Reject workflow

Review comments

</td> <td width="50%">
📊 History & Reports
Comprehensive attendance history

Date range filtering

Export to CSV

Visual analytics dashboard

🔐 Audit Logs
Complete audit trail

Action filtering

Date range search

Export capabilities

🤖 AI Chatbot Assistant
Powered by Groq AI

Attendance-related queries

24/7 availability

Contextual responses

</td> </tr> </table>
Additional Features
🔔 Real-time Notifications

📱 Responsive Design - Works on all devices

🌓 Dark Mode Support

📊 Advanced Analytics - Charts and statistics

🔒 Secure Authentication - JWT-based

📋 Export Reports - CSV format

💡 Quick Actions - Role-based shortcuts

🎯 Problem Solved
Traditional attendance management systems often suffer from:

❌ Manual tracking - Time-consuming and error-prone
❌ Paper-based records - Difficult to search and maintain
❌ No real-time visibility - Managers can't see attendance instantly
❌ Complex correction process - Cumbersome approval workflows
❌ Lack of audit trails - No accountability for changes

Our Solution provides:

✅ Automated tracking - One-click clock in/out
✅ Digital records - Searchable, filterable history
✅ Real-time dashboard - Instant visibility
✅ Streamlined corrections - Simple request and review process
✅ Complete audit trail - Every action logged

🛠️ Tech Stack
Frontend
<table> <tr> <td><img src="https://raw.githubusercontent.com/github/explore/80688e429a7d4ef2fca1e82350fe8e3517d3494d/topics/react/react.png" width="40" height="40"/></td> <td><b>React 18</b></td> <td>UI Library with Hooks & Context</td> </tr> <tr> <td><img src="https://raw.githubusercontent.com/github/explore/80688e429a7d4ef2fca1e82350fe8e3517d3494d/topics/tailwind/tailwind.png" width="40" height="40"/></td> <td><b>Tailwind CSS</b></td> <td>Utility-first CSS framework</td> </tr> <tr> <td><img src="https://camo.githubusercontent.com/00e9d72924ecc55c43d2651cc58442010701564dda04b460f40b32bf37c9058f/68747470733a2f2f6d69726f2e6d656469756d2e636f6d2f76322f726573697a653a6669743a313430302f312a796b4c564f565a35796b774b334f735452544945512e706e67" width="40" height="40"/></td> <td><b>Framer Motion</b></td> <td>Production-ready animations</td> </tr> <tr> <td><img src="https://recharts.org/en-US/favicon.ico" width="40" height="40"/></td> <td><b>Recharts</b></td> <td>Charting library</td> </tr> </table>
Backend
<table> <tr> <td><img src="https://raw.githubusercontent.com/github/explore/80688e429a7d4ef2fca1e82350fe8e3517d3494d/topics/nodejs/nodejs.png" width="40" height="40"/></td> <td><b>Node.js 18</b></td> <td>JavaScript runtime</td> </tr> <tr> <td><img src="https://raw.githubusercontent.com/github/explore/80688e429a7d4ef2fca1e82350fe8e3517d3494d/topics/express/express.png" width="40" height="40"/></td> <td><b>Express.js</b></td> <td>Web framework</td> </tr> <tr> <td><img src="https://raw.githubusercontent.com/github/explore/80688e429a7d4ef2fca1e82350fe8e3517d3494d/topics/mongodb/mongodb.png" width="40" height="40"/></td> <td><b>MongoDB Atlas</b></td> <td>Cloud database</td> </tr> <tr> <td><img src="https://raw.githubusercontent.com/github/explore/80688e429a7d4ef2fca1e82350fe8e3517d3494d/topics/jwt/jwt.png" width="40" height="40"/></td> <td><b>JWT</b></td> <td>Authentication</td> </tr> </table>
AI & DevOps
<table> <tr> <td><img src="https://groq.com/wp-content/uploads/2024/04/groq_logo_black.png" width="40" height="40"/></td> <td><b>Groq AI</b></td> <td>Chatbot intelligence</td> </tr> <tr> <td><img src="https://raw.githubusercontent.com/github/explore/80688e429a7d4ef2fca1e82350fe8e3517d3494d/topics/docker/docker.png" width="40" height="40"/></td> <td><b>Docker</b></td> <td>Containerization</td> </tr> <tr> <td><img src="https://cdn.iconscout.com/icon/free/png-256/vercel-282989.png" width="40" height="40"/></td> <td><b>Vercel</b></td> <td>Frontend hosting</td> </tr> <tr> <td><img src="https://render.com/favicon.ico" width="40" height="40"/></td> <td><b>Render</b></td> <td>Backend hosting</td> </tr> </table>
📊 Architecture Overview

graph TB
    subgraph "Frontend (React + Tailwind)"
        A[User Interface]
        B[State Management]
        C[API Integration]
    end
    
    subgraph "Backend (Node.js + Express)"
        D[API Routes]
        E[Controllers]
        F[Middleware]
        G[Services]
    end
    
    subgraph "Database"
        H[(MongoDB Atlas)]
    end
    
    subgraph "AI Service"
        I[Groq AI]
        J[Chatbot]
    end
    
    A --> C
    C --> D
    D --> E
    E --> F
    E --> G
    G --> H
    E --> I
    I --> J
    J --> A


🚀 Live Demo
🌐 Visit: Attendance Management System
🎮 Test Credentials
Role	Email	Password
👑 Admin	admin@company.com	Admin@123
👔 HR	hr@company.com	Hr@123
👤 Employee 1	employee1@company.com	Emp@123
👤 Employee 2	employee2@company.com	Emp@123
👤 Employee 3	employee3@company.com	Emp@123
💡 Pro Tip: Click on the role buttons on the login page to auto-fill credentials!

📸 Screenshots
🏠 Dashboard
https://via.placeholder.com/800x400.png?text=Dashboard

📊 Attendance History
https://via.placeholder.com/800x400.png?text=History

🤖 AI Chatbot
https://via.placeholder.com/800x400.png?text=Chatbot

👥 Team Management (HR)
https://via.placeholder.com/800x400.png?text=Team+Management

🔐 Audit Logs (Admin)
https://via.placeholder.com/800x400.png?text=Audit+Logs

⚡ Quick Start
Prerequisites
Node.js 18+

MongoDB Atlas account (or local MongoDB)

npm or yarn

1️⃣ Clone the Repository
bash
git clone https://github.com/Aditya7015/attendance_management.git
cd attendance_management
2️⃣ Backend Setup
bash
cd backend
npm install
cp .env.example .env
# Edit .env with your MongoDB URI and JWT secret
npm run seed  # Seed the database with sample data
npm run dev   # Start development server
3️⃣ Frontend Setup
bash
cd frontend
npm install
cp .env.example .env
# Edit .env with your backend API URL
npm start     # Start development server
4️⃣ Access the Application
Frontend: http://localhost:3000

Backend API: http://localhost:5000

🐳 Docker Setup (Alternative)
bash
docker-compose up -d --build
docker exec -it attendance-backend npm run seed
📖 API Documentation
🔑 Authentication
Method	Endpoint	Description	Access
POST	/api/auth/login	Login user	Public
GET	/api/auth/me	Get current user	Private
POST	/api/auth/logout	Logout user	Private
⏰ Attendance
Method	Endpoint	Description	Access
POST	/api/attendance/clock-in	Clock in	Employee
POST	/api/attendance/clock-out	Clock out	Employee
GET	/api/attendance/today-status	Today's status	All
GET	/api/attendance/history	History	All
📝 Corrections
Method	Endpoint	Description	Access
POST	/api/corrections/request	Request correction	Employee
GET	/api/corrections	Get requests	HR/Admin
PUT	/api/corrections/:id/review	Review request	HR/Admin
👥 User Management
Method	Endpoint	Description	Access
GET	/api/users	Get all users	Admin
POST	/api/users	Create user	Admin
PUT	/api/users/:id	Update user	Admin
⚙️ Rules
Method	Endpoint	Description	Access
GET	/api/rules	Get rules	All
POST	/api/rules	Create rule	Admin
PUT	/api/rules/:id	Update rule	Admin
📊 Audit Logs
Method	Endpoint	Description	Access
GET	/api/audit-logs	Get audit logs	Admin
🤖 AI Chatbot
Method	Endpoint	Description	Access
POST	/api/chat	Send message	All
👥 Role-Based Access
👑 Admin
Full System Access

User management

Role management

Rule configuration

Audit logs view

All HR permissions

👔 HR
Team Management

View all attendance

Review correction requests

Team attendance view

User view access

👤 Employee
Personal Management

Clock in/out

View own history

Request corrections

View own corrections

🤖 AI Chatbot Assistant
Features
24/7 Availability - Always ready to help

Attendance Support - Get answers about attendance

System Guidance - Learn how to use features

Quick Answers - Instant responses to common queries

How to Use
Click the 🤖 robot icon in the bottom-right corner

Type your question

Get instant AI-powered responses

Sample Questions
"How do I clock in?"

"How to request a correction?"

"What are the attendance rules?"

"How to view my attendance history?"

Powered By
Groq AI - Fast and efficient AI model

llama-3.1-8b-instant - Optimized for quick responses

📊 Database Design
Collections




erDiagram
    User ||--o{ Attendance : has
    User ||--o{ CorrectionRequest : requests
    User ||--o{ AuditLog : generates
    Attendance ||--o{ CorrectionRequest : references
    Admin ||--o{ AttendanceRule : creates
    
    User {
        ObjectId _id
        string email
        string passwordHash
        string fullName
        enum role
        string employeeId
        boolean isActive
    }
    
    Attendance {
        ObjectId _id
        ObjectId userId
        string date
        object clockIn
        object clockOut
        float workingHours
        enum status
        boolean isLate
    }
    
    CorrectionRequest {
        ObjectId _id
        ObjectId userId
        string requestedDate
        string requestedClockIn
        string requestedClockOut
        string reason
        enum status
    }
    
    AuditLog {
        ObjectId _id
        ObjectId userId
        string action
        string resource
        object details
        date timestamp
    }
    
    AttendanceRule {
        ObjectId _id
        string ruleKey
        string ruleName
        mixed ruleValue
        enum category
        boolean isActive
    }




🔐 Security Features
Authentication & Authorization
JWT Authentication - Secure token-based auth

Role-Based Access - Granular permissions

Password Hashing - Bcrypt encryption

Session Management - Token expiration

Data Protection
Input Validation - Express-validator

CORS Protection - Controlled origins

Helmet.js - Security headers

Rate Limiting - Prevent abuse

Audit & Compliance
Complete Audit Trail - All actions logged

IP Tracking - Request source tracking

User Agent Logging - Browser/device tracking

Error Logging - Detailed error capture

📈 Future Roadmap
Phase 1: Enhancements
Email notifications for approvals

Mobile responsive PWA

Advanced reporting dashboard

Export to PDF/Excel

Phase 2: Features
Leave management integration

Shift management

Biometric integration

Geolocation check-in

Phase 3: AI & Automation
Smart attendance predictions

Automatic shift scheduling

Voice commands

Advanced chatbot capabilities

🤝 Contributing
We welcome contributions! Here's how you can help:

🍴 Fork the repository

🌿 Create a feature branch: git checkout -b feature/AmazingFeature

💻 Commit your changes: git commit -m 'Add some AmazingFeature'

📤 Push to the branch: git push origin feature/AmazingFeature

🔄 Open a Pull Request

Development Guidelines
Follow ESLint rules

Write meaningful commit messages

Add tests for new features

Update documentation

📄 License
This project is licensed under the MIT License - see the LICENSE file for details.

🙏 Acknowledgments
React - Amazing UI library

Node.js - Powerful runtime

MongoDB - Flexible database

Groq - AI capabilities

All Contributors - Making this project awesome

📞 Contact & Support
Links
🌐 Live Demo: attendance-management-beta-rose.vercel.app

🐙 GitHub: github.com/Aditya7015/attendance_management

📡 Backend API: attendance-management-1dmo.onrender.com

Support
For support, email 📧 adityatiwari7553@gmail.com or create an issue on GitHub.

<div align="center">
⭐ If you found this project useful, please give it a star! ⭐

Made with ❤️ by Aditya Tiwari

</div>
