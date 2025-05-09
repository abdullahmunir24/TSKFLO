# TSKFLO Testing Documentation

This document provides an overview of the testing infrastructure for both the backend and frontend components of the TSKFLO application.

## Backend Testing

The backend testing uses Jest and Supertest to implement integration tests for the API endpoints.

### Backend Test Structure

Tests are organized by feature area in the `__tests__` directory:

- `admin.tasks.test.js` - Admin task management endpoints
- `admin.users.test.js` - Admin user management endpoints
- `auth.test.js` - Authentication endpoints (login, register, refresh token)
- `conversations.test.js` - Messaging and conversations
- `tasks.test.js` - Task management endpoints
- `users.test.js` - User management endpoints

### Backend Test Components

1. **Mock Implementation**

   - The backend uses Jest mocks to replace database models and external services
   - Mock files are located in `__mocks__/` directory
   - Key mock components include:
     - Database models (User, Task, Message, Conversation, Invitation)
     - External services (bcrypt, jsonwebtoken, email)

2. **Test Setup**
   - Tests use a custom Jest setup file (`jest.setup.js`) that configures mongoose mocks
   - Each test file has proper setup

### Running Backend Tests

To run the backend tests:

```bash
# Navigate to the backend directory
cd backend

# Run all tests
npm test

# Run all tests and generate a coverage report
npm test -- --coverage

# Run a specific test file
npm test -- __tests__/auth.test.js
```

A coverage report can be seen in the terminal or in the `coverage/` folder created locally when a user runs `npm test -- --coverage`

## Frontend Testing

The frontend testing uses Vitest (a Vite-native testing framework) and React Testing Library to test React components and utilities.

### Frontend Test Structure

Tests are organized to mirror the structure of the source code in the `src/__tests__` directory:

- `components/` - Tests for React components (like LoginPage, RegisterPage, ProtectedRoute)
- `services/` - Tests for services like API calls and Redux slices
- `utils/` - Tests for utility functions

### Frontend Test Components

1. **Mock Implementation**

   - The frontend uses Vitest mocks for external dependencies
   - Mock files are located in `src/__mocks__/` directory
   - Common mocked elements include:
     - API responses
     - Redux store
     - React Router components

2. **Test Tools**
   - React Testing Library for component rendering and interactions
   - Vitest for test execution and assertions
   - Custom test utilities in `src/__tests__/utils/test-utils.jsx`

### Running Frontend Tests

To run the frontend tests:

```bash
# Navigate to the frontend directory
cd frontend

# Run all tests
npm test

# Run all tests and generate a coverage report
npm test -- --coverage

# Run a specific test file
npm test -- path_to_file
```

Note:

Frontend Tests are minimal since we only test pure js functionality like state management and API handling
