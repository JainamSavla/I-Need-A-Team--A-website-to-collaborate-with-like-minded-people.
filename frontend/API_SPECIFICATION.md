# API Specification

## Authentication
- `POST /auth/register`: Register a new user (email, password, name)
- `POST /auth/login`: Login user (email, password)
- `POST /auth/refresh`: Refresh JWT tokens
- `GET /auth/me`: Get current user profile (Authenticated)

## Openings
- `GET /openings`: List all openings (with filters)
- `GET /openings/:id`: Get opening details
- `POST /openings`: Create a new opening (Authenticated)
- `PATCH /openings/:id`: Update an opening (Authenticated, Owner only)
- `DELETE /openings/:id`: Delete an opening (Authenticated, Owner only)

## Applications
- `POST /openings/:id/apply`: Apply to an opening (Authenticated)
- `GET /openings/:id/applications`: List applications for an opening (Authenticated, Owner only)
- `PATCH /applications/:id/status`: Accept/Reject application (Authenticated, Owner only)

## Users
- `GET /users/:id`: Get user profile
- `PATCH /users/me`: Update current user profile (Authenticated)
- `GET /users/me/applications`: Get current user's applications (Authenticated)

## Teams
- `GET /teams`: List user's teams (Authenticated)
- `GET /teams/:id/members`: List team members (Authenticated, Member only)
- GET /teams/:id/chat: Get team chat messages (Authenticated, Member only)
- POST /teams/:id/chat: Send a message (Authenticated, Member only)

## Direct Messages
- GET /chat/direct/:userId: Get direct messages with a specific user (Authenticated)
- POST /chat/direct/:userId: Send a direct message to a user (Authenticated)
- GET /chat/conversations: List all users I have conversations with (Authenticated)
