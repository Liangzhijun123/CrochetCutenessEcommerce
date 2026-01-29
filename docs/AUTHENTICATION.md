# Authentication System Documentation

## Overview

The Crochet Community Platform uses a JWT-based authentication system with role-based access control (RBAC). The system supports three user roles: `user`, `creator`, and `admin`, with hierarchical permissions.

## Architecture

### Core Components

1. **JWT Authentication** (`lib/auth.ts`)
   - Password hashing with bcrypt (12 salt rounds)
   - JWT token generation and verification
   - Role-based permission checking

2. **Authentication Middleware** (`lib/auth-middleware.ts`)
   - API route protection
   - Role-based authorization
   - Token validation

3. **Auth Context** (`context/auth-context.tsx`)
   - React context for authentication state
   - Login/logout functionality
   - Token management

4. **Protected Routes** (`components/auth/protected-route.tsx`)
   - Component-level route protection
   - Role-based rendering
   - Automatic redirects

## User Roles

### Role Hierarchy
- **Admin**: Full platform access (can access admin, creator, and user content)
- **Creator**: Can sell patterns and access creator features (can access creator and user content)
- **User**: Basic platform access (can purchase patterns and participate in community)

### Role Permissions
```typescript
const ROLE_HIERARCHY = {
  admin: ['admin', 'creator', 'user'],
  creator: ['creator', 'user'],
  user: ['user']
}
```

## API Endpoints

### Authentication Endpoints

#### POST /api/auth/register
Register a new user account.

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "user"
}
```

**Response:**
```json
{
  "user": {
    "id": "uuid",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user",
    "createdAt": "2024-01-01T00:00:00.000Z"
  },
  "token": "jwt-token-here",
  "message": "Registration successful"
}
```

#### POST /api/auth/login
Authenticate user and receive JWT token.

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "user": {
    "id": "uuid",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user",
    "createdAt": "2024-01-01T00:00:00.000Z"
  },
  "token": "jwt-token-here",
  "message": "Login successful"
}
```

#### GET /api/auth/user
Get current authenticated user (requires JWT token).

**Headers:**
```
Authorization: Bearer jwt-token-here
```

**Response:**
```json
{
  "user": {
    "id": "uuid",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user",
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

#### GET/PUT /api/auth/profile
Get or update current user profile (requires JWT token).

## Frontend Usage

### Using Auth Context

```tsx
import { useAuth } from "@/context/auth-context"

function MyComponent() {
  const { user, isAuthenticated, login, logout } = useAuth()

  if (!isAuthenticated) {
    return <div>Please log in</div>
  }

  return (
    <div>
      <h1>Welcome, {user.name}!</h1>
      <p>Role: {user.role}</p>
      <button onClick={logout}>Logout</button>
    </div>
  )
}
```

### Protected Routes

```tsx
import { ProtectedRoute, AdminRoute, CreatorRoute } from "@/components/auth/protected-route"

// Protect entire component
function UserDashboard() {
  return (
    <ProtectedRoute requiredRole="user">
      <div>User dashboard content</div>
    </ProtectedRoute>
  )
}

// Admin-only content
function AdminPanel() {
  return (
    <AdminRoute>
      <div>Admin panel content</div>
    </AdminRoute>
  )
}

// Creator and admin content
function CreatorDashboard() {
  return (
    <CreatorRoute>
      <div>Creator dashboard content</div>
    </CreatorRoute>
  )
}
```

### Making Authenticated API Calls

```tsx
import { useAuthApi } from "@/hooks/use-auth-fetch"

function MyComponent() {
  const { get, post, put, delete: del } = useAuthApi()

  const fetchUserData = async () => {
    try {
      const data = await get("/api/auth/profile")
      console.log("User data:", data)
    } catch (error) {
      console.error("Failed to fetch user data:", error)
    }
  }

  const updateProfile = async (updates) => {
    try {
      const data = await put("/api/auth/profile", updates)
      console.log("Profile updated:", data)
    } catch (error) {
      console.error("Failed to update profile:", error)
    }
  }

  return (
    <div>
      <button onClick={fetchUserData}>Fetch Profile</button>
      <button onClick={() => updateProfile({ name: "New Name" })}>
        Update Name
      </button>
    </div>
  )
}
```

## Backend Usage

### Protecting API Routes

```typescript
import { withAuth, withAdminAuth, withCreatorAuth } from "@/lib/auth-middleware"

// Protect with any authenticated user
async function handler(request: NextRequest, user: JWTPayload) {
  // user object contains: { userId, email, role }
  return NextResponse.json({ message: "Protected content" })
}

export const GET = withAuth(handler)

// Admin-only endpoint
async function adminHandler(request: NextRequest, user: JWTPayload) {
  return NextResponse.json({ message: "Admin content" })
}

export const POST = withAdminAuth(adminHandler)

// Creator and admin endpoint
async function creatorHandler(request: NextRequest, user: JWTPayload) {
  return NextResponse.json({ message: "Creator content" })
}

export const PUT = withCreatorAuth(creatorHandler)
```

### Custom Authorization

```typescript
import { withAuth } from "@/lib/auth-middleware"

async function handler(request: NextRequest, user: JWTPayload) {
  // Custom authorization logic
  if (user.role !== 'admin' && user.userId !== resourceOwnerId) {
    return NextResponse.json({ error: "Access denied" }, { status: 403 })
  }

  return NextResponse.json({ message: "Authorized" })
}

export const GET = withAuth(handler, { 
  allowedRoles: ['user', 'creator', 'admin'] 
})
```

## Security Features

### Password Security
- Passwords are hashed using bcrypt with 12 salt rounds
- Plain text passwords are never stored
- Password strength validation (minimum 6 characters)

### JWT Security
- Tokens expire after 7 days
- Tokens include user ID, email, and role
- Automatic logout on token expiration
- Secure token storage in localStorage

### API Security
- All protected endpoints require valid JWT tokens
- Role-based access control prevents privilege escalation
- Automatic token validation and user lookup
- Comprehensive error handling

## Test Accounts

For development and testing:

```
User Account:
- Email: user@example.com
- Password: password123
- Role: user

Creator Account:
- Email: seller@example.com
- Password: password123
- Role: creator

Admin Account:
- Email: admin@example.com
- Password: password123
- Role: admin
```

## Environment Variables

```env
JWT_SECRET=your-super-secret-jwt-key-change-in-production
```

**Important:** Always use a strong, unique JWT secret in production!

## Error Handling

### Common Error Responses

```json
// 401 Unauthorized
{
  "error": "Authentication required. Please provide a valid token."
}

// 403 Forbidden
{
  "error": "Access denied. admin role required."
}

// 400 Bad Request
{
  "error": "Email and password are required"
}

// 409 Conflict
{
  "error": "Email already exists"
}
```

## Best Practices

1. **Always validate user input** on both client and server
2. **Use HTTPS in production** to protect tokens in transit
3. **Implement proper error handling** for authentication failures
4. **Store tokens securely** and clear them on logout
5. **Use role-based access control** consistently across the application
6. **Validate JWT tokens** on every protected API request
7. **Implement token refresh** for long-lived sessions (future enhancement)

## Future Enhancements

- [ ] Token refresh mechanism
- [ ] Two-factor authentication (2FA)
- [ ] OAuth integration (Google, Facebook)
- [ ] Session management and concurrent login handling
- [ ] Password reset functionality
- [ ] Account verification via email
- [ ] Rate limiting for authentication endpoints
- [ ] Audit logging for security events