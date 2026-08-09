# SocialHub — GitHub Pages Starter

A mobile-friendly Instagram-style social web app starter.

## Included now
- Demo login
- Home feed
- Stories UI
- Create post
- Likes
- Search
- Reels-style screen
- Demo chat
- Profile
- Camera/microphone controls
- Browser screen-share preview
- LocalStorage persistence
- Responsive mobile UI

## Important limitations
GitHub Pages hosts static HTML/CSS/JavaScript. It does **not** itself provide a database,
authentication server, realtime messaging server, or call signaling server.

The included login/chat/post data is demo/local-device data. For a real multi-user app:
- Connect Supabase (Auth + Postgres + Realtime + Storage).
- Connect LiveKit (voice/video call + screen sharing).
- Generate LiveKit access tokens on a secure backend/serverless function. Never put signing secrets in this repository.

## Deploy on GitHub Pages
1. Create a GitHub repository.
2. Upload `index.html`, `style.css`, `app.js`, and this README.md to the repository root.
3. Open repository **Settings → Pages**.
4. Under **Build and deployment**, choose **Deploy from a branch**.
5. Choose your main branch and `/ (root)`, then Save.
6. Open the GitHub Pages URL after deployment.

## Screen sharing
The browser asks the user to choose what to share. Screen capture requires HTTPS and browser support.
GitHub Pages provides HTTPS for its hosted site.

## Next production step
Replace demo localStorage logic with Supabase and wire the Call page to LiveKit.
