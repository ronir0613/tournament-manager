# Tournament Manager - Design Document

## Version 1.0
**Date**: April 2026  
**Status**: Active

---

## 1. Executive Summary

Tournament Manager is a full-stack web application designed to facilitate tournament organization and management. It provides a robust platform for creating tournaments, managing participant registrations, tracking match results, and generating real-time leaderboards.

---

## 2. Architecture Overview

### 2.1 High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                   Frontend (React/Vite)                      │
│  ┌──────────────┬──────────────┬──────────────┐              │
│  │   Pages      │   Services   │   Components │              │
│  └──────────────┴──────────────┴──────────────┘              │
└────────────────────────┬────────────────────────────────────┘
                         │ HTTP/REST
┌────────────────────────▼────────────────────────────────────┐
│            Spring Boot Backend (REST API)                    │
│  ┌──────────────┬──────────────┬──────────────┐              │
│  │ Controllers  │   Services   │ Repositories │              │
│  └──────────────┴──────────────┴──────────────┘              │
│                   Security (JWT)                             │
└────────────────────────┬────────────────────────────────────┘
                         │ JDBC
┌────────────────────────▼────────────────────────────────────┐
│                   SQL Database                               │
└─────────────────────────────────────────────────────────────┘
```

### 2.2 Three-Tier Architecture

**Presentation Layer**: React frontend with Vite build tool  
**Business Logic Layer**: Spring Boot services and controllers  
**Data Layer**: SQL database with repository pattern

---

## 3. Backend Architecture

### 3.1 Package Structure

```
com.project.game/
├── GameApplication.java
├── config/
│   ├── JwtFilter.java
│   └── SecurityConfig.java
├── controllers/
│   ├── AuthController.java
│   ├── MatchController.java
│   ├── TournamentController.java
│   └── UserController.java
├── DTO/
│   ├── AuthResponse.java
│   ├── LeaderboardResponse.java
│   ├── LoginRequest.java
│   ├── RegisterRequest.java
│   └── TournamentRequest.java
├── model/
│   ├── Matches.java
│   ├── Tournament.java
│   ├── TournamentRegistration.java
│   └── User.java
├── repository/
│   ├── MatchRepository.java
│   ├── TournamentRegistrationRepository.java
│   ├── TournamentRepository.java
│   └── UserRepository.java
├── service/
│   ├── AuthService.java
│   ├── MatchService.java
│   ├── TournamentService.java
│   └── UserService.java
└── util/
    └── JwtUtil.java
```

### 3.2 Core Components

#### Controllers
- **AuthController**: Handles user registration and login
- **UserController**: Manages user operations
- **TournamentController**: Manages tournament CRUD operations
- **MatchController**: Handles match creation and result tracking

#### Services
- **AuthService**: Authentication and authorization logic
- **UserService**: User management
- **TournamentService**: Tournament management and leaderboard generation
- **MatchService**: Match management and result processing

#### Models/Entities
- **User**: Represents system users with roles (Admin/User)
- **Tournament**: Represents tournament events
- **TournamentRegistration**: Links users to tournaments
- **Matches**: Represents individual matches and results

#### Repositories
- Spring Data JPA repositories for database operations
- Enable CRUD operations and custom queries

#### Security
- **JwtUtil**: JWT token generation and validation
- **JwtFilter**: Request interceptor for token validation
- **SecurityConfig**: Spring Security configuration with role-based access control

### 3.3 Data Models

#### User Entity
```
- id (Primary Key)
- username (Unique)
- email (Unique)
- password (Hashed)
- role (ADMIN or USER)
- createdAt
- updatedAt
```

#### Tournament Entity
```
- id (Primary Key)
- name
- description
- startDate
- endDate
- maxParticipants
- createdBy (Foreign Key - User)
- status
- createdAt
- updatedAt
```

#### TournamentRegistration Entity
```
- id (Primary Key)
- userId (Foreign Key - User)
- tournamentId (Foreign Key - Tournament)
- registeredAt
- status
```

#### Matches Entity
```
- id (Primary Key)
- tournamentId (Foreign Key - Tournament)
- player1Id (Foreign Key - User)
- player2Id (Foreign Key - User)
- winnerId (Foreign Key - User)
- score
- matchDate
- createdAt
```

---

## 4. Frontend Architecture

### 4.1 Component Structure

```
src/
├── pages/
│   ├── Admin.jsx           # Admin dashboard
│   ├── Dashboard.jsx       # User dashboard
│   ├── Login.jsx          # Login page
│   ├── Register.jsx       # Registration page
│   └── TournamentDetail.jsx # Tournament details
├── services/
│   ├── api.js             # HTTP client setup
│   ├── authService.js     # Authentication API calls
│   └── tournamentService.js # Tournament API calls
├── App.jsx                 # Main app component
├── main.jsx               # Entry point
└── assets/                # Static files
```

### 4.2 Page Components

- **Login**: User authentication
- **Register**: New user account creation
- **Dashboard**: Main user interface with tournament list and user options
- **TournamentDetail**: Detailed view of a specific tournament with matches and leaderboard
- **Admin**: Administrative panel for system management

### 4.3 Services

- **api.js**: Centralized Axios instance with base URL and interceptors
- **authService.js**: Authentication-related API calls
- **tournamentService.js**: Tournament and match related API calls

---

## 5. Authentication & Authorization

### 5.1 Authentication Flow

1. User submits registration credentials
2. Backend hashes password and creates user account
3. User logs in with credentials
4. Backend validates and generates JWT token
5. Frontend stores token (typically localStorage)
6. Subsequent requests include token in Authorization header

### 5.2 JWT Structure

```
Header: { alg: "HS256", typ: "JWT" }
Payload: { sub: userId, username: string, role: string, iat: number, exp: number }
Signature: HMAC-SHA256(base64(header) + "." + base64(payload), secret)
```

### 5.3 Authorization

- **Public Endpoints**: Registration, Login
- **User Endpoints**: Accessible with valid JWT
- **Admin Endpoints**: Require ADMIN role in JWT
- **JwtFilter** validates token on incoming requests

---

## 6. API Design

### 6.1 RESTful Conventions

- `GET /api/resource` - List all resources
- `GET /api/resource/{id}` - Get specific resource
- `POST /api/resource` - Create new resource
- `PUT /api/resource/{id}` - Update resource
- `DELETE /api/resource/{id}` - Delete resource

### 6.2 Response Format

```json
{
  "success": boolean,
  "data": {},
  "message": "string",
  "timestamp": "ISO-8601"
}
```

### 6.3 Error Handling

- **400**: Bad Request - Invalid input
- **401**: Unauthorized - Missing/invalid token
- **403**: Forbidden - Insufficient permissions
- **404**: Not Found - Resource doesn't exist
- **500**: Internal Server Error - Server-side issue

---

## 7. Database Design

### 7.1 Entity Relationships

```
User (1) ──── (N) Tournament (created by)
User (1) ──── (N) TournamentRegistration (N) ──── (1) Tournament
User (1) ──── (N) Matches (player1)
User (1) ──── (N) Matches (player2)
User (1) ──── (N) Matches (winner)
Tournament (1) ──── (N) Matches
```

### 7.2 Indexing Strategy

- Primary key indexes on all tables
- Unique index on User.username and User.email
- Foreign key indexes for performance
- Index on Matches.tournamentId for leaderboard queries
- Index on TournamentRegistration.userId for user's tournaments

---

## 8. Security Considerations

### 8.1 Implementation Details

- Passwords are hashed using Spring Security (BCryptPasswordEncoder)
- JWT tokens include expiration for session management
- CORS policy should be configured for browser security
- All sensitive endpoints require valid, non-expired tokens
- Role-based access control enforces authorization rules

### 8.2 Best Practices

- Store JWT secret securely (environment variables)
- Token expiration time should be reasonable (typically 1-24 hours)
- Refresh token mechanism (optional for enhanced security)
- Input validation on all endpoints
- SQL injection prevention via parameterized queries (JPA)

---

## 9. Deployment Architecture

### 9.1 Backend Deployment

- Packaged as JAR file via Maven
- Containerization via Docker (optional)
- Database connection via JDBC
- Environment-specific configuration files

### 9.2 Frontend Deployment

- Built artifacts in dist/ folder
- Deployed to static hosting (nginx, Vercel, etc.)
- Environment variables for API endpoints

---

## 10. Scalability Considerations

### 10.1 Current State
- Single backend instance
- Centralized relational database
- Direct database queries via repositories

### 10.2 Future Improvements

- **Caching**: Redis for leaderboard and frequently accessed data
- **Load Balancing**: Multiple backend instances behind load balancer
- **Database Optimization**: Query optimization and connection pooling
- **Message Queue**: Asynchronous processing for heavy operations
- **Microservices**: Separate services for tournaments, matches, users

---

## 11. Development Guidelines

### 11.1 Code Standards

- Follow Spring Boot conventions
- Use dependency injection throughout
- Keep services stateless
- Implement proper exception handling
- Use DTOs for API request/responses
- Write unit tests for critical logic

### 11.2 Git Workflow

- Feature branches for development
- Pull requests for code review
- Main branch for production-ready code

### 11.3 Environment Configuration

- Development, staging, and production profiles
- Sensitive data in environment variables
- Database migrations tracked and versioned

---

## 12. Future Enhancements

1. **Real-time Updates**: WebSocket integration for live match updates
2. **Notifications**: Email/push notifications for tournament events
3. **Analytics**: Tournament statistics and player performance metrics
4. **Payment Integration**: For paid tournaments with prize pools
5. **Social Features**: Comments, ratings, and user profiles
6. **Advanced Scheduling**: Automatic match scheduling algorithms
7. **Mobile App**: Native mobile applications
8. **API Rate Limiting**: Protection against abuse

---

## References

- Spring Boot Documentation: https://spring.io/projects/spring-boot
- React Documentation: https://react.dev
- JWT Introduction: https://jwt.io
- RESTful Web Services: https://restfulapi.net
