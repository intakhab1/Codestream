# Codestream

**Real-time collaborative IDE with WebRTC peer-to-peer communication and multi-language code execution**

Built with Next.js 15, Express, Socket.io, WebRTC, and MongoDB

[![Next.js](https://img.shields.io/badge/Next.js-15-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-green?style=flat-square&logo=mongodb)](https://www.mongodb.com/)
[![Socket.io](https://img.shields.io/badge/Socket.io-4.0-black?style=flat-square&logo=socket.io)](https://socket.io/)
[![License](https://img.shields.io/badge/License-MIT-yellow?style=flat-square)](LICENSE)

## Features

- **Real-time code sync** — Every keystroke synced instantly across all participants
- **Video chat** — WebRTC peer-to-peer video and audio with toggle controls
- **Live cursor tracking** — See exactly where each collaborator is in the code
- **Multi-language support** — JavaScript, TypeScript, Python, C++, Java
- **Code execution** — Run code directly in the browser via Judge0
- **Persistent rooms** — Code and chat history saved to MongoDB
- **Resizable panels** — Drag to resize editor, chat, and video panels
- **Dark/light mode** — System-aware theme switching

## Tech Stack

### Frontend
| Technology | Purpose |
|---|---|
| Next.js 15 | React framework with App Router |
| TypeScript | Type safety |
| Monaco Editor | VS Code-powered code editor |
| Redux Toolkit | Global state management |
| Socket.io Client | Real-time communication |
| WebRTC | Peer-to-peer video/audio |
| Tailwind CSS | Styling |

### Backend
| Technology | Purpose |
|---|---|
| Express.js | REST API server |
| Socket.io | WebSocket server |
| MongoDB | Database (rooms, messages) |
| Prisma | ORM (PostgreSQL-ready for future migration) |
| Judge0 CE | Code execution engine |

## Getting Started

### Prerequisites
- Node.js 18+
- MongoDB Atlas account (free tier)

### 1. Clone the repository
```bash
git clone https://github.com/intakhab1/Codestream.git
cd Codestream
```

### 2. Set up the backend
```bash
cd backend
npm install
```

Create `backend/.env`:
```env
DATABASE_URL=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/codestream?retryWrites=true&w=majority
CLIENT_URL=http://localhost:3000
PORT=4000
NODE_ENV=development
```

```bash
npm run dev
```

### 3. Set up the frontend
```bash
cd frontend
npm install
```

Create `frontend/.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:4000
```

```bash
npm run dev
```

### 4. Open the app
Go to [http://localhost:3000](http://localhost:3000)

## Project Structure

```
Codestream/
├── frontend/                  # Next.js 15 app
│   ├── app/                   # App Router pages
│   │   ├── page.tsx           # Home / room creation
│   │   └── room/[id]/         # Room page
│   ├── components/
│   │   ├── editor/            # Monaco editor + output panel
│   │   ├── video/             # WebRTC video panel
│   │   ├── chat/              # Chat panel
│   │   └── participants/      # Participants sidebar
│   ├── hooks/
│   │   ├── useSocket.ts       # Socket.io hook
│   │   └── useWebRTC.ts       # WebRTC hook
│   └── store/                 # Redux slices
│
└── backend/                   # Express server
    └── src/
        ├── routes/            # REST API routes
        │   ├── rooms.ts
        │   ├── messages.ts
        │   └── execute.ts     # Code execution via Judge0
        ├── socket/
        │   └── index.ts       # Socket.io handlers
        ├── mongo.ts           # MongoDB layer
        └── index.ts           # Server entry point
```

## Deployment

### Backend → Render
1. Connect your GitHub repo on [render.com](https://render.com)
2. Root Directory: `backend`
3. Build Command: `npm install && npm run build`
4. Start Command: `npm start`
5. Add environment variables:
   ```
   DATABASE_URL=<your MongoDB Atlas URL>
   CLIENT_URL=<your Vercel URL>
   NODE_ENV=production
   ```

### Frontend → Vercel
1. Import your GitHub repo on [vercel.com](https://vercel.com)
2. Root Directory: `frontend`
3. Add environment variables:
   ```
   NEXT_PUBLIC_API_URL=<your Render URL>
   ```

## Environment Variables

### Backend (`backend/.env`)
| Variable | Description |
|---|---|
| `DATABASE_URL` | MongoDB Atlas connection string |
| `CLIENT_URL` | Frontend URL (for CORS) |
| `PORT` | Server port (default: 4000) |
| `NODE_ENV` | `development` or `production` |

### Frontend (`frontend/.env.local`)
| Variable | Description |
|---|---|
| `NEXT_PUBLIC_API_URL` | Backend API URL |


## How It Works

### Real-time Code Sync
1. User types → Monaco `onDidChangeModelContent` fires
2. Code emitted via Socket.io to backend
3. Backend broadcasts to all room participants
4. Remote editors update directly (bypassing Redux to prevent re-renders)

### Video Chat
1. User joins room → Socket.io notifies existing peers
2. Existing peers initiate WebRTC offers
3. ICE candidates exchanged via Socket.io signaling
4. Peer-to-peer video streams established

### Code Execution
1. User clicks Run → POST to `/api/execute`
2. Backend forwards to Judge0 Community Edition
3. Output/stderr returned and displayed in output panel

