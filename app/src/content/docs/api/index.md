---
title: "API Overview"
description: "Overview of the UDX REST API and authentication model."
---

## Overview

The UDX backend exposes a REST API built on **Node.js + Express**, backed by **Supabase** for auth and storage. The base URL for all API requests is:

```
https://your-api.example.com/api
```

## Authentication

All API requests require a valid JWT token issued by Supabase Auth.

Pass the token in the `Authorization` header:

```
Authorization: Bearer <your-token>
```

Tokens are obtained after a successful login via the Supabase client:

```ts
const { data } = await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'password',
});
const token = data.session?.access_token;
```

## Error Responses

All errors follow a consistent format:

```json
{
  "error": "Unauthorized",
  "message": "JWT token is missing or invalid",
  "status": 401
}
```

| Status | Meaning |
|--------|---------|
| `400` | Bad request — invalid parameters |
| `401` | Unauthorized — missing or invalid token |
| `403` | Forbidden — insufficient role |
| `404` | Not found |
| `500` | Internal server error |
