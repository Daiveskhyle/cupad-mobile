# CUPAD Mobile App

Cross-platform (Android + iOS) mobile client for the **CUPAD** Cooperative Union Platform.

Built with **Expo + React Native + TypeScript**.

## Features (v1)

- Secure JWT login against `https://cupad.name.ng/api/v1/auth/login`
- Token stored in Expo SecureStore
- Role-aware dashboard
- Client search
- Client portfolio (savings balance, outstanding loans, transactions)
- Profile + logout

## Prerequisites

- Node.js 18+
- Expo CLI (`npm install -g expo-cli` optional)
- Expo Go app on your phone (for quick testing)

## Quick Start

```bash
cd cupad-mobile
npm install
npx expo start
```

Then:

- Press `a` for Android emulator
- Press `i` for iOS simulator
- Or scan the QR code with **Expo Go** on your physical device

## Project Structure

```
cupad-mobile/
├── app/                    # Expo Router screens
│   ├── (auth)/login.tsx
│   ├── (tabs)/             # Bottom tabs
│   │   ├── index.tsx       # Dashboard
│   │   ├── search.tsx      # Client search
│   │   └── profile.tsx
│   └── client/[id].tsx     # Portfolio detail
├── src/
│   ├── api/client.ts       # Axios + JWT
│   ├── store/auth.ts       # Zustand auth state
│   ├── types/
│   └── constants/
├── app.json
└── package.json
```

## API Endpoints Used

| Method | Endpoint | Auth |
|--------|----------|------|
| POST | `/auth/login` | none |
| GET | `/me` | Bearer JWT |
| GET | `/portfolio/{id}` | Bearer JWT |
| GET | `/clients/{id}/portfolio` | API Key / JWT |
| GET | `/clients/{id}/loans` | API Key / JWT |
| GET | `/clients/{id}/transactions` | API Key / JWT |
| GET | `/clients?q=` | API Key (currently) |

> **Note**: The `/clients` search endpoint currently requires an `X-API-Key` header on the server.  
> For full mobile search you may want to also accept JWT on that route (easy change in `api/v1/index.php`).

## Configuration

Edit `src/constants/config.ts` if the API URL changes.

## Next Steps (recommended)

1. Allow JWT on `/clients` search endpoint (backend)
2. Add biometric / passkey login
3. Offline caching with React Query or SQLite
4. Push notifications
5. Collection forms for field officers
6. App icons & splash assets in `assets/`

## Building for stores

```bash
npx expo prebuild
npx eas build --platform all
```

(Requires an Expo account + EAS setup)
