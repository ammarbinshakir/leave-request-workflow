# Leave Request Workflow System

A full-stack SaaS HR Leave Request Workflow application built with Node.js/Express backend and React/Next.js frontend.

## 📋 Overview

This application implements a complete leave request management system with role-based access control, allowing employees to submit leave requests and managers to approve or reject them. The system includes validation, balance tracking, and reporting features.

## 🏗️ Architecture

### Backend (Node.js/Express)
- **Framework**: Express.js with middleware for security (Helmet, CORS, rate limiting)
- **Authentication**: Mock JWT-like system using headers (`x-user-id`)
- **Validation**: Joi schemas for request validation
- **Data Storage**: In-memory mock data (JSON objects)
- **Testing**: Jest with Supertest for API testing

### Frontend (React/Next.js)
- **Framework**: Next.js with React 18
- **Styling**: Tailwind CSS for responsive design
- **State Management**: React Context API for authentication
- **API Communication**: Axios for HTTP requests
- **Testing**: Jest with React Testing Library

## 🚀 Features

### Core Features
1. **Employee Leave Requests**
   - Submit leave requests with date validation
   - View leave balance and request history
   - Real-time validation for overlapping dates
   - Automatic leave days calculation

2. **Manager Dashboard**
   - View all pending leave requests
   - Approve or reject requests with comments
   - Monthly summary statistics
   - Bulk processing capabilities

3. **Authentication & Authorization**
   - Role-based access (Employee/Manager)
   - Mock login system with predefined users
   - Protected routes and API endpoints

4. **Validation & Business Logic**
   - Date validation (no past dates, weekends handled)
   - Leave balance checking
   - Overlap detection for existing requests
   - Working days calculation

### Bonus Features
- **Monthly Summary Dashboard**: Statistics and reporting for managers
- **TypeScript Types**: Complete type definitions for API responses
- **Enhanced UI**: Responsive design with loading states and error handling

## 📁 Project Structure

```
leave-request-workflow/
├── backend/
│   ├── src/
│   │   ├── routes/
│   │   │   ├── auth.js          # Authentication endpoints
│   │   │   └── leave.js         # Leave management endpoints
│   │   ├── middleware/
│   │   │   ├── auth.js          # Authentication middleware
│   │   │   └── validation.js    # Request validation middleware
│   │   ├── services/
│   │   │   └── leaveService.js  # Business logic layer
│   │   ├── utils/
│   │   │   └── validation.js    # Validation utilities
│   │   ├── data/
│   │   │   └── mockData.js      # Mock database
│   │   └── server.js            # Express app setup
│   ├── tests/                   # Backend tests
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/          # React components
│   │   ├── contexts/            # React contexts
│   │   ├── lib/                 # API utilities
│   │   ├── types/              # TypeScript definitions
│   │   └── utils/              # Helper functions
│   ├── __tests__/              # Frontend tests
│   └── package.json
└── README.md
```

## 🛠️ Setup Instructions

### Prerequisites
- Node.js (v14 or higher)
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

3. **Run the backend server:**
   ```bash
   npm start
   ```
   The backend will run on `http://localhost:3001`

4. **Run backend tests:**
   ```bash
   npm test
   ```

### Frontend Setup

1. **Navigate to frontend directory:**
   ```bash
   cd frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Run the frontend application:**
   ```bash
   npm run dev
   ```
   The frontend will run on `http://localhost:3000`

4. **Run frontend tests:**
   ```bash
   npm test
   ```

### Running Both Services
To run both backend and frontend simultaneously, open two terminal windows and follow the respective setup instructions above.

## 🧪 Testing

### Backend Tests
- **API Endpoint Tests**: Complete test coverage for all routes
- **Authentication Tests**: Middleware and role validation
- **Business Logic Tests**: Leave service validation
- **Error Handling Tests**: Edge cases and error scenarios

Run backend tests:
```bash
cd backend && npm test
```

### Frontend Tests
- **Component Tests**: All major components tested
- **Integration Tests**: API interaction testing
- **User Flow Tests**: Authentication and form submission
- **Utility Function Tests**: Validation and helper functions

Run frontend tests:
```bash
cd frontend && npm test
```

## 🔐 API Endpoints

### Authentication
- `POST /api/auth/login` - Mock user login

### Leave Management
- `POST /api/leave/apply` - Submit leave request
- `GET /api/leave/pending` - Get pending requests (managers)
- `POST /api/leave/approve/:id` - Approve/reject request
- `GET /api/leave/balance` - Get user's leave balance
- `GET /api/leave/summary` - Monthly summary statistics

## 👥 Mock Users

The system includes 5 predefined users for testing:

### Employees
1. **John Doe** - `john.doe@company.com` (Manager: Alice Manager)
2. **Jane Smith** - `jane.smith@company.com` (Manager: Alice Manager)  
3. **Bob Johnson** - `bob.johnson@company.com` (Manager: Charlie Boss)

### Managers
4. **Alice Manager** - `alice.manager@company.com`
5. **Charlie Boss** - `charlie.boss@company.com`

## 🎯 Key Design Decisions

### 1. Mock Authentication
- **Decision**: Use header-based authentication (`x-user-id`) instead of full JWT implementation
- **Rationale**: Simplifies testing and demo setup while maintaining role-based security patterns
- **Implementation**: Middleware validates user existence and role permissions

### 2. In-Memory Data Storage
- **Decision**: Use JavaScript objects instead of database
- **Rationale**: Eliminates database setup complexity for screening test
- **Implementation**: Structured mock data with helper functions for CRUD operations

### 3. Date Validation Strategy
- **Decision**: Client-side and server-side validation with business rules
- **Rationale**: Ensures data integrity and good user experience
- **Implementation**: Prevents past dates, weekend handling, overlap detection

### 4. Component Architecture
- **Decision**: Separate components for different user roles
- **Rationale**: Clear separation of concerns and easier maintenance
- **Implementation**: Role-based routing with shared utilities

### 5. Error Handling
- **Decision**: Comprehensive error handling with user-friendly messages
- **Rationale**: Production-ready error experience
- **Implementation**: Try-catch blocks with formatted error responses

## 🔮 Future Enhancements

### Scalability Improvements
1. **Database Integration**: Replace mock data with PostgreSQL/MongoDB
2. **Real Authentication**: Implement JWT with refresh tokens
3. **Caching**: Add Redis for session management and data caching
4. **API Versioning**: Implement versioned APIs for backward compatibility

### Feature Additions
1. **Email Notifications**: Automated emails for request status changes
2. **Calendar Integration**: Sync with Google Calendar/Outlook
3. **Advanced Reporting**: Detailed analytics and export capabilities
4. **Multi-tenancy**: Support for multiple organizations

### Technical Improvements
1. **TypeScript Migration**: Full TypeScript implementation
2. **API Documentation**: Swagger/OpenAPI integration
3. **Deployment**: Docker containers and CI/CD pipelines
4. **Monitoring**: APM and logging integration

## 🛡️ Security Considerations

### Current Implementation
- CORS protection for cross-origin requests
- Helmet.js for security headers
- Rate limiting to prevent abuse
- Input validation and sanitization
- Role-based access control

### Production Recommendations
1. **Authentication**: Implement proper JWT with secure storage
2. **HTTPS**: Enforce SSL/TLS in production
3. **Environment Variables**: Secure configuration management
4. **Audit Logging**: Track all user actions
5. **Data Encryption**: Encrypt sensitive data at rest

## 📊 Performance Considerations

### Current Optimizations
- Minimal API calls with efficient data fetching
- Component-level loading states
- Input debouncing for real-time validation
- Efficient date calculations

### Scalability Patterns
- Pagination for large datasets
- Caching strategies for frequently accessed data
- Database indexing for common queries
- Background job processing for notifications

## 🤝 Contributing

This is a screening test project, but the code follows standard practices:

1. **Code Style**: ESLint and Prettier configurations
2. **Testing**: Comprehensive test coverage required
3. **Documentation**: Inline comments for complex logic
4. **Git Workflow**: Feature branches and descriptive commits