# Server-Driven UI Website Builder - Backend

Backend API for the AI-Assisted Server-Driven Dynamic Website Builder.

## Tech Stack

- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose
- **Cache**: Redis
- **File Storage**: Cloudinary
- **AI**: Anthropic Claude AI
- **Authentication**: JWT (Access & Refresh Tokens)

## Prerequisites

- Node.js 18+ 
- MongoDB Atlas account or local MongoDB
- Redis server
- Cloudinary account
- Anthropic API key

## Installation

1. Install dependencies:
```bash
npm install
```

2. Copy `.env.example` to `.env` and fill in your credentials:
```bash
cp .env.example .env
```

3. Configure environment variables in `.env`:
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=your_mongodb_connection_string
REDIS_URL=redis://localhost:6379
JWT_SECRET=your_jwt_secret
JWT_REFRESH_SECRET=your_refresh_secret
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
ANTHROPIC_API_KEY=your_anthropic_key
ALLOWED_ORIGINS=http://localhost:3000
```

## Development

Start development server with hot reload:
```bash
npm run dev
```

## Build

Compile TypeScript to JavaScript:
```bash
npm run build
```

## Production

Run production server:
```bash
npm start
```

## API Documentation

### Base URL
```
http://localhost:5000/api
```

### Authentication Endpoints

#### Register Institution
```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "ABC College",
  "email": "admin@abccollege.edu",
  "password": "password123",
  "subdomain": "abc-college"
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "admin@abccollege.edu",
  "password": "password123"
}
```

#### Refresh Token
```http
POST /api/auth/refresh
Content-Type: application/json

{
  "refreshToken": "your_refresh_token"
}
```

### Page Endpoints (Protected)

#### Get All Pages
```http
GET /api/pages
Authorization: Bearer <access_token>
```

#### Create Page
```http
POST /api/pages
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "name": "Homepage",
  "slug": "home"
}
```

#### Update Page
```http
PUT /api/pages/:id
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "jsonConfig": {
    "components": [...],
    "meta": {...}
  },
  "changes": "Updated hero section"
}
```

#### Publish Page
```http
POST /api/pages/:id/publish
Authorization: Bearer <access_token>
```

### AI Endpoints (Protected)

#### Process Command
```http
POST /api/ai/command
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "command": "Add an events section to the homepage",
  "context": {...}
}
```

#### Generate Content
```http
POST /api/ai/generate-content
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "type": "department",
  "params": {
    "departmentName": "Computer Science",
    "collegeName": "ABC College",
    "programs": ["BE", "ME", "PhD"]
  }
}
```

### Media Endpoints (Protected)

#### Upload File
```http
POST /api/media/upload
Authorization: Bearer <access_token>
Content-Type: multipart/form-data

file: <binary>
```

#### Get All Media
```http
GET /api/media
Authorization: Bearer <access_token>
```

### Public Endpoints (No Auth)

#### Get Published Pages
```http
GET /api/public/pages?institutionId=<id>
```

#### Get Published Page by Slug
```http
GET /api/public/pages/:slug?institutionId=<id>
```

## Project Structure

```
backend/
├── src/
│   ├── config/           # Configuration files
│   ├── models/           # MongoDB schemas
│   ├── controllers/      # Route controllers
│   ├── services/         # Business logic
│   ├── routes/           # API routes
│   ├── middleware/       # Custom middleware
│   ├── types/            # TypeScript types
│   ├── utils/            # Utility functions
│   └── server.ts         # Entry point
├── package.json
├── tsconfig.json
└── .env.example
```

## Features

- ✅ JWT Authentication with refresh tokens
- ✅ Role-based access control (Super Admin, Editor, Viewer)
- ✅ Rate limiting for API protection
- ✅ AI-powered command processing
- ✅ AI content generation
- ✅ File upload to Cloudinary
- ✅ Page version control
- ✅ Template system
- ✅ Input validation
- ✅ Error handling
- ✅ Logging

## Security

- Helmet.js for security headers
- CORS configuration
- Rate limiting
- Input validation and sanitization
- Password hashing with bcrypt
- JWT token authentication

## License

MIT
# sdui-backend
