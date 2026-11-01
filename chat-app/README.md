# React Chat App

Single page chat built with React + Vite.

## Features
- Text box and Send button (Enter also sends); new messages appear in the thread above the box
- Each message gets a random username from `["Alan", "Bob", "Carol", "Dean", "Elin"]`
- Like button on the right of every message with a running count
- Stretch goals: emoji picker, `@` mentions (type `@` to list users), socket.io + express server

## Run
```bash
npm install
npm run dev        # http://localhost:5173
```
Optional real-time server (second terminal):
```bash
npm run server     # http://localhost:4000
```
With the server running, the badge shows "Live" and messages/likes sync across browser tabs.
Without it the app works standalone ("Offline mode").
