# Attendance Management System

A comprehensive attendance management system for internal HR operations with role-based access control.

## Features

- **Authentication**: Secure JWT-based authentication
- **Role-Based Access**: Employee, HR, and Admin roles with different permissions
- **Attendance Tracking**: Clock in/out with automatic tracking
- **Correction Requests**: Employees can request corrections, HR/Admin can review
- **User Management**: Admin can manage users and roles
- **Rules Configuration**: Admin can configure attendance rules
- **Audit Logs**: Complete audit trail of all actions
- **Reports**: Attendance history and statistics

## Tech Stack

### Backend
- Node.js with Express.js
- MongoDB with Mongoose
- JWT for authentication
- Bcrypt for password hashing
- Express-validator for validation
- Helmet for security
- Morgan for logging

### Frontend
- React with React Router
- Tailwind CSS for styling
- Axios for API calls
- React Hot Toast for notifications
- Recharts for charts
- Moment.js for date handling

## Prerequisites

- Node.js (v16 or higher)
- MongoDB (v4.4 or higher)
- npm or yarn

## Installation

### 1. Clone the repository
```bash
git clone https://github.com/yourusername/attendance-management-system.git
cd attendance-management-system