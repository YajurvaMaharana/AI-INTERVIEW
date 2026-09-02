# API Contract — AI Interview Platform

> **Base URL:** `http://localhost:4000/api`
>
> All endpoints require a valid Supabase JWT in the `Authorization` header
> unless noted otherwise.

---

## Authentication

All protected endpoints expect:

```
Authorization: Bearer <supabase_jwt_token>
```

A missing or invalid token returns:

```json
{
  "error": "Unauthorized",
  "message": "Missing or malformed Authorization header. Expected \"Bearer <token>\"."
}
```

---

## Health Check

### `GET /api/health`

**Auth required:** No

Returns the server and database health status.

#### 200 — Healthy

```json
{
  "status": "healthy",
  "timestamp": "2026-08-13T12:00:00.000Z",
  "database": {
    "connected": true,
    "latencyMs": 42
  }
}
```

#### 503 — Unhealthy

```json
{
  "status": "unhealthy",
  "timestamp": "2026-08-13T12:00:00.000Z",
  "database": {
    "connected": false,
    "error": "connection refused"
  }
}
```

---

## Interviews

### `POST /api/interviews`

Create a new interview session. The AI interviewer returns its opening
question.

**Auth required:** Yes

#### Request Body

| Field        | Type     | Required | Description                                      |
|--------------|----------|----------|--------------------------------------------------|
| `type`       | `string` | ✅       | `"technical"` or `"behavioral"`                  |
| `role`       | `string` | ✅       | Target job role, e.g. `"Senior Frontend Dev"`     |
| `difficulty` | `string` | ✅       | `"easy"`, `"medium"`, or `"hard"`                |

#### Example Request

```http
POST /api/interviews HTTP/1.1
Host: localhost:4000
Authorization: Bearer eyJhbGciOiJI...
Content-Type: application/json

{
  "type": "technical",
  "role": "Senior Frontend Developer",
  "difficulty": "medium"
}
```

#### 201 — Created

```json
{
  "sessionId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "message": "Welcome! Let's start with a question about React performance. Can you explain the difference between `useMemo` and `useCallback`, and describe a scenario where choosing the wrong one could cause a performance regression?"
}
```

#### 400 — Bad Request (missing fields)

```json
{
  "error": "Bad Request",
  "message": "Missing required fields: type, difficulty. Expected: type (technical | behavioral), role (string), difficulty (easy | medium | hard)."
}
```

#### 400 — Bad Request (invalid enum value)

```json
{
  "error": "Bad Request",
  "message": "Invalid type \"system_design\". Must be one of: technical, behavioral."
}
```

#### 401 — Unauthorized

```json
{
  "error": "Unauthorized",
  "message": "Missing or malformed Authorization header. Expected \"Bearer <token>\"."
}
```

#### 502 — Bad Gateway (AI service error)

```json
{
  "error": "Bad Gateway",
  "message": "AI service call failed: API key invalid or quota exceeded."
}
```

#### 504 — Gateway Timeout (AI timeout)

```json
{
  "error": "Gateway Timeout",
  "message": "AI service did not respond within 30000ms"
}
```

---

### `POST /api/interviews/:id/message`

Send a candidate message in an existing interview session. The AI
interviewer responds with its next question or follow-up.

**Auth required:** Yes

#### URL Parameters

| Param | Type   | Description                        |
|-------|--------|------------------------------------|
| `id`  | `uuid` | The interview session ID (UUID v4) |

#### Request Body

| Field     | Type     | Required | Description                         |
|-----------|----------|----------|-------------------------------------|
| `message` | `string` | ✅       | The candidate's response / message  |

#### Example Request

```http
POST /api/interviews/a1b2c3d4-e5f6-7890-abcd-ef1234567890/message HTTP/1.1
Host: localhost:4000
Authorization: Bearer eyJhbGciOiJI...
Content-Type: application/json

{
  "message": "useMemo memoises a computed value while useCallback memoises a function reference. If you use useMemo where you need useCallback, you'd be recalculating on every render instead of just keeping a stable reference."
}
```

#### 200 — OK

```json
{
  "message": "Good explanation! You've captured the core distinction well. Now, can you describe a real-world scenario where a missing `useCallback` caused unnecessary re-renders in a child component? Walk me through how you'd identify and fix it."
}
```

#### 400 — Bad Request (missing message)

```json
{
  "error": "Bad Request",
  "message": "Missing or invalid \"message\" field. Must be a non-empty string."
}
```

#### 401 — Unauthorized

```json
{
  "error": "Unauthorized",
  "message": "Invalid or expired token."
}
```

#### 404 — Not Found

```json
{
  "error": "Not Found",
  "message": "Interview session \"nonexistent-uuid\" not found."
}
```

#### 502 — Bad Gateway (AI service error)

```json
{
  "error": "Bad Gateway",
  "message": "AI service call failed: rate limit exceeded."
}
```

#### 504 — Gateway Timeout (AI timeout)

```json
{
  "error": "Gateway Timeout",
  "message": "AI service did not respond within 30000ms"
}
```

---

## Error Response Format

All error responses follow this consistent shape:

```json
{
  "error": "<HTTP Status Text>",
  "message": "<Human-readable description>"
}
```

| Status | Meaning                  | When                                              |
|--------|--------------------------|---------------------------------------------------|
| `400`  | Bad Request              | Missing/invalid request body fields               |
| `401`  | Unauthorized             | Missing, malformed, or expired auth token          |
| `404`  | Not Found                | Resource (e.g. session ID) does not exist          |
| `500`  | Internal Server Error    | Unexpected server-side failure                     |
| `502`  | Bad Gateway              | Upstream AI provider returned an error             |
| `504`  | Gateway Timeout          | Upstream AI provider did not respond in time       |
