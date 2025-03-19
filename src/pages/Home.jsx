import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Home() {
  const [roomId, setRoomId] = useState("");
  const navigate = useNavigate();

  const createRoom = () => {
    const newRoomId = Math.random().toString(36).substring(2, 8);
    navigate(`/room/${newRoomId}`);
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-900 text-white">
      <h1 className="text-3xl font-bold mb-4">Codestream</h1>
      <button onClick={createRoom} className="px-4 py-2 bg-blue-600 rounded-lg">
        Create Room
      </button>
      <div className="mt-4 flex">
        <input
          type="text"
          placeholder="Enter Room ID"
          value={roomId}
          onChange={(e) => setRoomId(e.target.value)}
          className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg"
        />
        <button onClick={() => navigate(`/room/${roomId}`)} className="px-4 py-2 bg-green-600 ml-2 rounded-lg">
          Join Room
        </button>
      </div>
    </div>
  );
}
