# Social / Dating / Chat Backend API

Production-ready Node.js + Express + MySQL backend with JWT auth, realtime chat via Socket.IO, upload support, and Firebase push notification-ready service.

## Quick Start

```bash
npm install
npm run dev
```

## Environment

Copy `.env` and set your own values.

## API Base URL

`http://localhost:5000`

## Core Features
- JWT Authentication
- User profile and discovery APIs
- Like/Match system
- Realtime chat + chat media
- Notifications
- Subscription & payment structure
- Admin dashboard and moderation APIs
- Auto-create SQL tables on startup

## Notes
- All SQL uses prepared statements (`?`) for safety.
- `firebase.js` uses env credentials and gracefully works when Firebase keys are not configured.
