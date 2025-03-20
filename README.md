# Codestream - Real-time Collaborative Code Editor & Video Chat

## Overview

Codestream is a real-time collaborative code editor integrated with live video chat. It allows multiple users to join a shared room where they can write, edit, and share code in different programming languages while communicating via live video.

## Features

- **Real-time Code Collaboration**: Edit code with multiple users simultaneously.
- **Multiple Language Support**: Supports JavaScript, Python, Java, and C++.
- **Live Video Chat**: WebRTC-based video chat for seamless communication.
- **WebSocket-based Synchronization**: Uses `Socket.io` to synchronize code and video chat events.
- **User-friendly UI**: Responsive and minimal design with Tailwind CSS.

## Tech Stack

### Frontend

- **React.js (Vite)**: For a fast and efficient user interface.
- **CodeMirror**: For syntax highlighting and rich code editing experience.
- **Tailwind CSS**: For responsive and modern UI design.
- **WebRTC**: For live video streaming.
- **Socket.io**: For real-time communication.

### Backend

- **Node.js (Express.js)**: Handles WebSocket connections.
- **Socket.io**: Manages room-based real-time communication.

## Installation & Setup

### Prerequisites

- Node.js installed 
- npm or yarn package manager

### Steps

1. **Clone the repository**:

   ```bash
   git clone https://github.com/your-repo/codestream.git
   cd codestream
   ```

2. **Install dependencies**:

   ```bash
   npm install
   ```

3. **Start the server**:

   ```bash
   cd server
   node index.js
   ```

4. **Start the frontend**:

   ```bash
   npm run dev
   ```

5. **Open in browser**: Visit `http://localhost:5173` and enter a room ID to start collaborating.

## Usage

1. **Enter a Room ID**: Join an existing room or create a new one.
2. **Write & Edit Code**: Select a programming language and start coding.
3. **Communicate via Video Chat**: Enable video/audio for live discussion.
4. **Collaborate in Real-time**: See updates instantly from all participants.

## Contributing

Pull requests are welcome! Please follow these steps:

1. Fork the repository.
2. Create a new branch (`feature-new-feature`).
3. Commit changes and push.
4. Submit a pull request.

## License

This project is licensed under the MIT License.

## Contact

For any issues or suggestions, please open an issue on GitHub or contact `intakhab087@gmail.com`.

