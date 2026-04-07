# Tournament Manager

A comprehensive tournament management application with role-based access control, real-time match tracking, and automated leaderboard generation.

## Overview

Tournament Manager is a full-stack application designed to organize and manage gaming tournaments. It provides features for tournament creation, user registration, match management, and dynamic leaderboard updates.

## Tech Stack

### Backend
- **Framework**: Spring Boot 3.x
- **Language**: Java
- **Authentication**: JWT (JSON Web Tokens)
- **Database**: SQL (configured via application.properties)
- **Build Tool**: Maven

### Frontend
- **Framework**: React 18+
- **Build Tool**: Vite
- **Styling**: CSS3
- **HTTP Client**: Axios

## Features

- **User Management**: Registration, login, and role-based access control (Admin/User)
- **Tournament Management**: Create, list, and manage tournaments
- **Tournament Registration**: Users can register for tournaments
- **Match Management**: Create and track match results
- **Leaderboard**: Real-time leaderboard generation based on match results
- **Authentication**: Secure JWT-based authentication with Spring Security

## Project Structure

```
tournament-manager/
├── backend/                 # Spring Boot REST API
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/       # Java source code
│   │   │   └── resources/  # Configuration files
│   │   └── test/           # Unit tests
│   └── pom.xml             # Maven configuration
└── frontend/               # React application
    ├── src/
    │   ├── pages/          # Page components
    │   ├── services/       # API services
    │   └── assets/         # Static assets
    └── vite.config.js      # Vite configuration
```

## Getting Started

### Prerequisites
- Java 11+
- Node.js 16+
- Maven 3.6+
- npm or yarn

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Configure the database in `src/main/resources/application.properties`

3. Build the project:
   ```bash
   mvn clean package
   ```

4. Run the application:
   ```bash
   mvn spring-boot:run
   ```

The API will be available at `http://localhost:8080`

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

The application will be available at `http://localhost:5173`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - User login

### Users
- `GET /api/users` - Get all users
- `GET /api/users/{id}` - Get user by ID

### Tournaments
- `GET /api/tournaments` - Get all tournaments
- `POST /api/tournaments` - Create a new tournament
- `GET /api/tournaments/{id}` - Get tournament by ID
- `GET /api/tournaments/{id}/leaderboard` - Get tournament leaderboard

### Matches
- `GET /api/matches` - Get all matches
- `POST /api/matches` - Create a new match
- `GET /api/matches/{id}` - Get match by ID

### Tournament Registration
- `POST /api/registrations` - Register for a tournament
- `GET /api/registrations/{tournamentId}` - Get registrations for a tournament

## Security

- JWT tokens are used for authentication
- Requests are validated using `JwtFilter`
- Spring Security is configured with role-based access control
- Sensitive endpoints require authentication

## Development

### Backend Testing
- Run tests with Maven: `mvn test`

### Frontend Testing
- Run tests with npm: `npm run test`

### Code Quality
- Follow Spring Boot best practices
- Use meaningful variable and method names
- Keep services decoupled from controllers
- Write unit tests for critical functionality

## License

This project is provided as-is for educational and tournament management purposes.

## Support

For issues or questions, please refer to the project documentation or contact the development team.
