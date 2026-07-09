# Blossom Backend API Documentation

## Overview

Blossom is an Arabic AI-powered Android app builder backend. It allows users to create Android applications using natural Arabic language commands.

**Base URL:** `http://localhost:3001/api`

## Authentication

All protected endpoints require a Bearer token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

---

## Endpoints

### Authentication

#### Register User
```
POST /api/auth/register
```

**Body:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "displayName": "User Name"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": { "id": "...", "email": "..." },
    "session": { "access_token": "...", "refresh_token": "..." }
  }
}
```

#### Login
```
POST /api/auth/login
```

#### Logout
```
POST /api/auth/logout
Authorization: Bearer <token>
```

#### Get Current User
```
GET /api/auth/me
Authorization: Bearer <token>
```

---

### Projects

#### Create Project
```
POST /api/projects
Authorization: Bearer <token>
```

**Body:**
```json
{
  "name": "My App",
  "description": "App description",
  "packageName": "com.example.myapp",
  "config": { "theme": "light" }
}
```

#### List Projects
```
GET /api/projects?status=active&limit=50&offset=0
Authorization: Bearer <token>
```

#### Get/Update/Delete Project
```
GET /api/projects/:projectId
PUT /api/projects/:projectId
DELETE /api/projects/:projectId
```

---

### Files

#### List Project Files
```
GET /api/projects/:projectId/files
Authorization: Bearer <token>
```

#### Get File Tree
```
GET /api/projects/:projectId/files/tree
Authorization: Bearer <token>
```

#### Create File
```
POST /api/projects/:projectId/files
Authorization: Bearer <token>
```

**Body:**
```json
{
  "path": "res/layout/activity_main.xml",
  "content": "<?xml ...?>",
  "language": "xml"
}
```

#### Batch Upsert Files
```
POST /api/projects/:projectId/files/batch
Authorization: Bearer <token>
```

---

### AI Commands

#### Process Arabic Command
```
POST /api/ai/projects/:projectId/commands
Authorization: Bearer <token>
```

**Body:**
```json
{
  "command": "أنشئ شاشة باسم \"الرئيسية\""
}
```

#### Supported Arabic Commands

| Arabic Command | Description |
|----------------|-------------|
| `أنشئ شاشة باسم "X"` | Create a screen named "X" |
| `أضف زر باسم "X" يقول "Y" في شاشة "Z"` | Add a button to screen |
| `أضف نص باسم "X" محتواه "Y" في شاشة "Z"` | Add text to screen |
| `أضف صورة بمعرف "X" في شاشة "Y"` | Add image to screen |
| `غيّر لون "X" إلى Y` | Change element color |
| `غيّر الثيم إلى X` | Set app theme |
| `سمّي التطبيق إلى "X"` | Set app name |
| `أضف تنقل بين شاشتي "X" و "Y"` | Add navigation |
| `ابني التطبيق` | Build APK |

---

### Builds

#### Start Build
```
POST /api/builds/projects/:projectId/build
Authorization: Bearer <token>
```

#### List Builds
```
GET /api/builds/projects/:projectId/builds
```

#### Get Build Status
```
GET /api/builds/:buildId
```

---

## Error Responses

```json
{
  "success": false,
  "error": "Error message"
}
```

---

## Health Check

```
GET /health
```

---

## Running

```bash
npm install
npm run dev
```

Or with Docker:
```bash
docker-compose up -d
```
