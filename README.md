# Super Admin Dashboard - Full Stack Application

A complete full-stack application featuring a Super Admin Dashboard with user management, permissions system, and comments functionality.

## Quick Start

Prerequisites:
- Python 3.8+
- Node.js 16+
- pip and npm

BACKEND SETUP:

cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
 On Windows: venv\Scripts\activate
 On macOS/Linux: source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Apply migrations
python manage.py makemigrations
python manage.py migrate

# Create super admin user
python manage.py createsuperadmin --email admin@example.com --username superadmin --password YourSecurePassword123!

# Run development server
python manage.py runserver

Backend will run at: http://localhost:8000

FRONTEND SETUP:

# Open new terminal and navigate to frontend
cd frontend

# Install dependencies
npm install

# Run development server
npm run dev

Frontend will run at: http://localhost:3000

## Backend (Django REST API)

Features:
- Multi-role Authentication (Super Admin & Regular Users)
- JWT Token Authentication with Simple JWT
- Role-based Access Control with granular permissions
- User Management with CRUD operations
- Password Reset System with OTP verification
- Comments System with version history tracking
- Email Notifications for user registration

Tech Stack:
- Django 4.2+
- Django REST Framework
- SQLite
- JWT Authentication
- django-cors-headers


User Roles:

Super Admin:
- Full system access
- Create/delete users
- Manage all permissions
- Access to all features

Regular User:
- Limited access based on permissions
- Manage own profile
- Access only to assigned pages

## Frontend (React + Vite)

Features:
- Multi-role Login Portals for Super Admin and Users
- Responsive Dashboard with Tailwind CSS
- User Management Interface for admins
- Permission Management system
- Comments Section with history tracking
- Profile Settings and password management

Tech Stack:
- React 18+
- Vite for build tooling
- Tailwind CSS for styling
- React Context for state management


## Authentication Flow

1. Login: Users login through role-specific portals
2. JWT Tokens: Access and refresh tokens for API calls
3. Role Verification: Backend validates user role for each request
4. Auto-logout: Token expiration handling

## Database Schema

Core Models:
- CustomUser - Extended user model with UUID, roles, OTP fields
- PagePermission - Page-level permissions for users
- Comment - Comment system with content and comment history

## Email Features

- Welcome Emails with login credentials for new users
- Password Reset with OTP verification

## Development Challenges & Solutions

### Challenge 1: Custom User Model Integration
**Problem**: Django's default User model didn't support UUID primary keys and custom role fields needed for the application.

**Solution**: 
- Created CustomUser model extending AbstractUser
- Used UUIDField for primary key instead of auto-increment integer
- Added role field with choices for superadmin and user
- Configured AUTH_USER_MODEL in settings.py
- Updated all references from User to CustomUser
  
### Challenge 2: CORS Configuration for Frontend-Backend Communication
**Problem**: Frontend running on port 3000 couldn't access backend API on port 8000 due to CORS restrictions.

**Solution**:
- Installed and configured django-cors-headers
- Added CORS_ALLOWED_ORIGINS with frontend URL
- Configured CORS settings to allow credentials and necessary headers
- Set up CORS for both development and production environments

## Troubleshooting

Common Backend Issues:

1. Migration errors: 
   cd backend
   python manage.py makemigrations
   python manage.py migrate

2. Authentication issues: Check JWT settings and token expiration

3. CORS errors: Verify CORS settings in Django for frontend domain

Common Frontend Issues:

1. API connection failed: Check backend server is running
2. Build errors: Verify all dependencies are installed

Getting Help:

- Check browser console for frontend errors
- Check Django logs for backend errors
- Verify all environment variables are set
- Ensure CORS is configured for frontend domain

Development Workflow:
- Start backend: cd backend && python manage.py runserver
- Start frontend: cd frontend && npm run dev
- Backend API: http://localhost:8000
- Frontend App: http://localhost:3000

Make sure both servers are running for full functionality.
