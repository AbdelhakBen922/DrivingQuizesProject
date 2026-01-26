# API Integration Guide

## Setup

1. **Environment Variables**
   ```bash
   cp .env.example .env
   ```
   Update `VITE_API_BASE_URL` with your backend URL (default: `http://localhost:8000/api`)

2. **Import the API Service**
   ```typescript
   import * as api from '../services/api';
   ```

## Authentication

### Login
```typescript
try {
  const response = await api.login({
    email: "user@example.com",
    password: "password123"
  });
  // Token is automatically stored
  console.log("Logged in:", response.access_token);
} catch (error) {
  console.error("Login failed:", error.message);
}
```

### Logout
```typescript
api.logout(); // Clears stored token
```

## API Usage Examples

### Dashboard Stats
```typescript
const stats = await api.getDashboardStats();
// Returns: { total_rooms, total_students, upcoming_quizzes, active_quizzes }
```

### Rooms/Groups

#### List Rooms
```typescript
const rooms = await api.getRooms();
```

#### Get Room Detail
```typescript
const roomDetail = await api.getRoomDetail(roomId);
// Includes students and quizzes
```

#### Create Room
```typescript
const newRoom = await api.createRoom({
  name: "المجموعة 01",
  description: "مجموعة صباحية"
});
```

#### Update Room
```typescript
const updated = await api.updateRoom(roomId, {
  name: "Updated Name"
});
```

#### Delete Room
```typescript
await api.deleteRoom(roomId);
```

#### Add Student to Room
```typescript
await api.addStudentToRoom(roomId, studentId);
```

#### Remove Student from Room
```typescript
await api.removeStudentFromRoom(roomId, membershipId);
```

### Students

#### List Students
```typescript
const students = await api.getStudents();
```

#### Create Student
```typescript
const newStudent = await api.createStudent({
  school_id: 1,
  first_name: "أحمد",
  last_name: "محمد",
  email: "student@example.com",
  phone: "+213123456789"
});
```

#### Update Student
```typescript
const updated = await api.updateStudent(studentId, {
  first_name: "محمد",
  email: "newemail@example.com"
});
```

### Quizzes/Exams

#### List Quizzes
```typescript
const quizzes = await api.getQuizzes();
```

#### Create Quiz
```typescript
const newQuiz = await api.createQuiz({
  title: "امتحان الأسبوع الأول",
  school_id: 1,
  template_id: 5,
  room_id: 3,
  setting_id: 1,
  starts_at: "2025-01-15T09:00:00Z",
  ends_at: "2025-01-15T10:30:00Z"
});
```

#### Assign Quiz to Room
```typescript
const quiz = await api.assignQuizToRoom(roomId, quizId);
```

### Settings

#### Get Settings
```typescript
const settings = await api.getDashboardSettings();
// Returns: { school: {...}, owner: {...} }
```

#### Update School Info
```typescript
const updated = await api.updateSchoolSettings({
  name: "مدرسة سيدي عبد الله",
  email: "info@school.com",
  address: "العاصمة",
  phone: "+213123456789"
});
```

#### Update Owner Info
```typescript
const updated = await api.updateOwnerSettings({
  first_name: "علاء",
  last_name: "سليماني",
  email: "owner@school.com",
  phone: "+966501234567"
});
```

#### Upload Owner Avatar
```typescript
const file = event.target.files[0];
const result = await api.uploadOwnerAvatar(file);
console.log("Avatar URL:", result.avatar_url);
```

## Error Handling

All API functions throw errors that should be caught:

```typescript
try {
  const rooms = await api.getRooms();
} catch (error) {
  console.error("Failed to fetch rooms:", error.message);
  // Show error toast to user
}
```

## Replacing Mock Data

To switch from mock data to real API:

### Before (mockData):
```typescript
import { getGroups, createGroup } from '../data/mockData';

const groups = getGroups();
const newGroup = createGroup({ name: "Group 1", description: "..." });
```

### After (API):
```typescript
import * as api from '../services/api';

const groups = await api.getRooms();
const newGroup = await api.createRoom({ name: "Group 1", description: "..." });
```

## Data Model Mapping

### Frontend (mockData) → Backend (API)
- `Group` → `Room`
- `groupId` → `room_id`
- `examName` → `quiz_title` / `title`
- `Template` → `QuizTemplate`
- `Exam` → `Quiz`

### Key Differences
1. **Room Code**: Backend auto-generates `room_code` on creation
2. **IDs**: Backend uses numeric IDs instead of string UUIDs
3. **Timestamps**: Backend uses ISO 8601 format with timezone
4. **Deleted Items**: Backend uses soft deletes (`deleted_at` field)

## Component Integration Example

```typescript
import { useState, useEffect } from 'react';
import * as api from '../services/api';

function GroupsPage() {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadRooms();
  }, []);

  async function loadRooms() {
    try {
      setLoading(true);
      const data = await api.getRooms();
      setRooms(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateRoom(formData) {
    try {
      const newRoom = await api.createRoom(formData);
      setRooms([...rooms, newRoom]);
      // Show success message
    } catch (err) {
      // Show error message
      console.error(err);
    }
  }

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      {rooms.map(room => (
        <div key={room.id}>{room.name}</div>
      ))}
    </div>
  );
}
```

## Notes

1. **Authentication Required**: All dashboard endpoints require authentication token
2. **CORS**: Ensure backend CORS settings allow your frontend origin
3. **Error Messages**: Backend returns Arabic/French error messages based on Accept-Language header
4. **Pagination**: Some endpoints support pagination (to be implemented)
5. **File Uploads**: Use FormData for file uploads (e.g., avatar)
