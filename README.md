# Dairy Farmer Mobile App (React Native / Expo)

React Native mobile app for the **Task Management Portal** — same features as the web frontend: social feed, marketplace, messaging, and full farm management.

## Features

### Community (Social)
- **Feed** — posts, likes, comments, replies, create posts with photos
- **Explore** — trending hashtags, suggested farmers, search, listings
- **Marketplace** — browse listings, chat with seller
- **Messages** — conversations, real-time chat UI
- **Profile** — view/edit profile, follow, message farmers
- **Notifications** & **Settings**

### Farm Management
- **Dashboard** — stats overview
- **Cows** — list, add, edit, delete (admin)
- **Health Records** — log and view health data
- **Heat Cycles** — track and confirm heat alerts
- **Tasks** — admin create / developer update status
- **Users** — admin user management

## Prerequisites

- Node.js 18+
- Expo Go app on your phone **or** Android Studio emulator
- Backend running at `Task_Management_Portal-be` (port 5000)

## Setup

```bash
cd Task_Management_Portal-mobile
cp .env.example .env
# Edit EXPO_PUBLIC_API_URL — see below
npm install
npm start
```

### API URL

Both apps use the **Vercel production backend** by default:

```text
https://task-management-portal-be.vercel.app/api
```

For local backend development, set in `.env`:

```text
EXPO_PUBLIC_API_URL=http://YOUR_LAN_IP:5000/api
```

## Run

```bash
npm start          # Expo dev server — scan QR with Expo Go
npm run android    # Android emulator
npm run ios        # iOS simulator (macOS only)
```

## Test login (seed data)

```
Email: ramesh_dairy@seed-feed.test
Password: password123
```

## Project structure

```
src/
  api/           Axios client
  store/         Redux store + AsyncStorage auth
  navigation/    Bottom tabs + stacks
  features/      Screens & slices (mirrors web app)
  components/    Shared UI
  theme/         Colors & spacing
```

## How to message someone

1. **Explore** → tap a farmer → **Message**
2. **Marketplace** → open listing → **Chat with Seller**
3. **Messages** tab shows all conversations

Built with **Expo 54**, **React Navigation 7**, **Redux Toolkit**, same backend API as the web app.

## Deploy APK (GitHub + auto-build)

Every push to `master` triggers a cloud build on [Expo EAS](https://expo.dev) and produces a new APK.

### One-time setup

1. **Create a GitHub repo** and push this project:
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/Task_Management_Portal-mobile.git
   git push -u origin master
   ```

2. **Create an Expo access token** at [expo.dev/settings/access-tokens](https://expo.dev/settings/access-tokens).

3. **Add the token to GitHub** → repo → Settings → Secrets and variables → Actions → New secret:
   - Name: `EXPO_TOKEN`
   - Value: your Expo token

4. **Link GitHub in Expo** (optional but recommended): [expo.dev](https://expo.dev) → your project → GitHub → connect the repo.

### Manual build (without waiting for CI)

```bash
npm run eas:login
npm run build:apk
```

Download the APK from the build page on expo.dev and share it with farmers (WhatsApp / Drive).

### After you push code

GitHub Actions runs `eas build` automatically. Open **Actions** tab on GitHub or [expo.dev builds](https://expo.dev/accounts/vijayshagara/projects/dairy-farmer-portal/builds) to download the latest APK.
