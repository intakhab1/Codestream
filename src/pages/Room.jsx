import { useEffect, useState, useRef } from "react";
import { io } from "socket.io-client";
import { useParams } from "react-router-dom";
import CodeMirror from "@uiw/react-codemirror";
import { javascript } from "@codemirror/lang-javascript";
import { python } from "@codemirror/lang-python";
import { java } from "@codemirror/lang-java";
import { cpp } from "@codemirror/lang-cpp";
import { oneDark } from "@codemirror/theme-one-dark";
import { useNavigate } from "react-router-dom";


const socket = io("http://localhost:5001");

export default function CodeEditor() {
  const navigate = useNavigate();
  const { roomId } = useParams();
  const [code, setCode] = useState("");
  const [language, setLanguage] = useState("javascript");
  const localStream = useRef(null);
  const videoRef = useRef(null);
  const peerConnections = useRef({});
  const [remoteStreams, setRemoteStreams] = useState([]);
  // const [streamInitialized, setStreamInitialized] = useState(false);

  const [videoEnabled, setVideoEnabled] = useState(true);
  const [audioEnabled, setAudioEnabled] = useState(true);

  useEffect(() => {
    if (!roomId) return;

    socket.emit("joinRoom", roomId);

    socket.on("codeUpdate", (newCode) => setCode(newCode));
    socket.on("userJoined", handleUserJoined);
    socket.on("offer", handleReceiveOffer);
    socket.on("answer", handleReceiveAnswer);
    socket.on("iceCandidate", handleNewIceCandidate);
    socket.on("userLeft", handleUserLeft);

    return () => {
      socket.emit("leaveRoom", roomId);
      socket.off("codeUpdate");
      socket.off("userJoined");
      socket.off("offer");
      socket.off("answer");
      socket.off("iceCandidate");
      socket.off("userLeft");
      cleanupConnections();
    };
  }, [roomId]);

  useEffect(() => {
    navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      .then((stream) => {
        localStream.current = stream;
        if (videoRef.current) videoRef.current.srcObject = stream;
        socket.emit("ready", roomId);
      })
      .catch((err) => console.error("Error accessing webcam: ", err));
  }, [roomId]);

  const handleChange = (value) => {
    setCode(value);
    socket.emit("codeUpdate", { roomId, code: value });
  };

  const getLanguageExtension = () => {
    switch (language) {
      case "cpp": return cpp();
      case "java": return java();
      case "python": return python();
      case "javascript": return javascript();
      default: return cpp();
    }
  };

  const createPeerConnection = (userId) => {
    const peerConnection = new RTCPeerConnection();

    localStream.current.getTracks().forEach((track) =>
      peerConnection.addTrack(track, localStream.current)
    );

    peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit("iceCandidate", { candidate: event.candidate, to: userId });
      }
    };

    peerConnection.ontrack = (event) => {
      setRemoteStreams((prevStreams) => {
        if (!prevStreams.some((s) => s.id === event.streams[0].id)) {
          return [...prevStreams, event.streams[0]];
        }
        return prevStreams;
      });
    };

    return peerConnection;
  };

  const handleUserJoined = async (userId) => {
    if (peerConnections.current[userId]) return;

    const peerConnection = createPeerConnection(userId);
    peerConnections.current[userId] = peerConnection;

    const offer = await peerConnection.createOffer();
    await peerConnection.setLocalDescription(offer);

    socket.emit("offer", { offer, to: userId });
  };

  const handleReceiveOffer = async ({ offer, from }) => {
    if (peerConnections.current[from]) return;

    // Ensure localStream is available before proceeding
    if (!localStream.current) {
      try {
        localStream.current = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        if (videoRef.current) videoRef.current.srcObject = localStream.current;
      } catch (err) {
        console.error("Error accessing webcam: ", err);
        return;
      }
    }

    const peerConnection = createPeerConnection(from);
    peerConnections.current[from] = peerConnection;

    await peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
    const answer = await peerConnection.createAnswer();
    await peerConnection.setLocalDescription(answer);

    socket.emit("answer", { answer, to: from });
  };

  const handleReceiveAnswer = ({ answer, from }) => {
    const peerConnection = peerConnections.current[from];
    if (peerConnection) {
      peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
    }
  };

  const handleNewIceCandidate = ({ candidate, from }) => {
    const peerConnection = peerConnections.current[from];
    if (peerConnection) {
      peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
    }
  };

  const handleUserLeft = (userId) => {
    if (peerConnections.current[userId]) {
      peerConnections.current[userId].close();
      delete peerConnections.current[userId];
    }
    setRemoteStreams((prevStreams) => prevStreams.filter((s) => s.id !== userId));
  };

  const cleanupConnections = () => {
    Object.values(peerConnections.current).forEach((peer) => peer.close());
    peerConnections.current = {};
    setRemoteStreams([]);
  };

  const toggleVideo = () => {
    setVideoEnabled((prev) => !prev);
    localStream.current.getVideoTracks().forEach(track => track.enabled = !videoEnabled);
  };

  const toggleAudio = () => {
    setAudioEnabled((prev) => !prev);
    localStream.current.getAudioTracks().forEach(track => track.enabled = !audioEnabled);
  };

  const leaveCall = () => {
    socket.emit("leaveRoom", roomId);
    navigate("/"); // Redirect to home
  };


  return (
    <div className="flex h-screen w-full bg-gray-900 text-white p-4">
      {/* Video Section */}
      <div className="w-1/3 bg-gray-800 p-3 rounded-lg shadow-lg flex flex-col items-center">
        <h2 className="text-lg font-semibold mb-2">Live Video</h2>
        <video ref={videoRef} autoPlay className="w-full h-auto rounded-lg border border-gray-700" />
        {remoteStreams.map((stream, index) => (
          <video key={index} autoPlay className="w-full h-auto mt-2 rounded-lg border border-gray-700" ref={(video) => { if (video) video.srcObject = stream; }} />
        ))}
      </div>
      {/* Video Controls */}
      <div className="flex gap-2 mt-4">
        <button 
          onClick={toggleVideo} 
          className={`p-2 rounded-lg font-bold transition ${videoEnabled ? "bg-red-500 hover:bg-red-600" : "bg-gray-500 hover:bg-gray-600"}`}>
          {videoEnabled ? "Turn Off Video" : "Turn On Video"}
        </button>
        <button 
          onClick={toggleAudio} 
          className={`p-2 rounded-lg font-bold transition ${audioEnabled ? "bg-blue-500 hover:bg-blue-600" : "bg-gray-500 hover:bg-gray-600"}`}>
          {audioEnabled ? "Mute Mic" : "Unmute Mic"}
        </button>
        <button 
          onClick={leaveCall} 
          className="p-2 bg-red-700 hover:bg-red-800 rounded-lg font-bold transition">
          Leave Call
        </button>
      </div>

      {/* Code Editor Section */}
      <div className="w-2/3 flex flex-col ml-4">
        <div className="flex justify-between items-center bg-gray-800 p-3 rounded-md shadow-md">
          <h1 className="text-xl font-bold">Codestream - Room: {roomId}</h1>
          <select 
            className="p-2 bg-gray-700 text-white border border-gray-600 rounded"
            value={language} 
            onChange={(e) => setLanguage(e.target.value)}
          >
            <option value="cpp">C++</option>
            <option value="java">Java</option>
            <option value="python">Python</option>
            <option value="javascript">JavaScript</option>
            
          </select>
        </div>
        <div className="flex-1 mt-4 bg-gray-800 p-3 rounded-lg shadow-lg overflow-hidden">
          <CodeMirror
            value={code}
            height="calc(100vh - 100px)"
            extensions={[getLanguageExtension()]}
            theme={oneDark}
            onChange={handleChange}
            className="border border-gray-700 rounded-lg bg-gray-900"
          />
        </div>
      </div>
    </div>
  );
}



// import { useEffect, useState, useRef } from "react";
// import { io } from "socket.io-client";
// import { useParams } from "react-router-dom";
// import CodeMirror from "@uiw/react-codemirror";
// import { javascript } from "@codemirror/lang-javascript";
// import { python } from "@codemirror/lang-python";
// import { java } from "@codemirror/lang-java";
// import { cpp } from "@codemirror/lang-cpp";
// import { oneDark } from "@codemirror/theme-one-dark";

// const socket = io("http://localhost:5001");

// export default function CodeEditor() {
//   const { roomId } = useParams();
//   const [code, setCode] = useState("");
//   const [language, setLanguage] = useState("javascript");
//   const videoRef = useRef(null);
//   const peerConnections = useRef({});
//   const remoteVideos = useRef({});
//   const [remoteStreams, setRemoteStreams] = useState([]);

// useEffect(() => {
//     if (!roomId) return;
    
//     socket.emit("joinRoom", roomId);
    
//     socket.on("codeUpdate", (newCode) => setCode(newCode));
//     socket.on("userJoined", handleUserJoined);
//     socket.on("offer", handleReceiveOffer);
//     socket.on("answer", handleReceiveAnswer);
//     socket.on("iceCandidate", handleNewIceCandidate);
    
//     return () => {
//       socket.emit("leaveRoom", roomId);
//       socket.off("codeUpdate");
//       socket.off("userJoined");
//       socket.off("offer");
//       socket.off("answer");
//       socket.off("iceCandidate");
//     };
//   }, [roomId]);
  

//   useEffect(() => {
//     navigator.mediaDevices.getUserMedia({ video: true, audio: false })
//       .then((stream) => {
//         if (videoRef.current) videoRef.current.srcObject = stream;
//         socket.emit("ready", roomId);
//       })
//       .catch((err) => console.error("Error accessing webcam: ", err));
//   }, [roomId]);

//   const handleChange = (value) => {
//     setCode(value);
//     socket.emit("codeUpdate", { roomId, code: value });
//   };

//   const getLanguageExtension = () => {
//     switch (language) {
//       case "javascript": return javascript();
//       case "python": return python();
//       case "java": return java();
//       case "cpp": return cpp();
//       default: return javascript();
//     }
//   };

//   const handleUserJoined = (userId) => {
//     const peerConnection = new RTCPeerConnection();
//     peerConnections.current[userId] = peerConnection;
    
//     navigator.mediaDevices.getUserMedia({ video: true, audio: true })
//       .then((stream) => {
//         stream.getTracks().forEach((track) => peerConnection.addTrack(track, stream));
//       });
    
//     peerConnection.onicecandidate = (event) => {
//       if (event.candidate) {
//         socket.emit("iceCandidate", { candidate: event.candidate, to: userId });
//       }
//     };
    
//     peerConnection.ontrack = (event) => {
//       setRemoteStreams((prev) => [...prev, event.streams[0]]);
//     };
//   };

//   const handleReceiveOffer = async ({ offer, from }) => {
//     const peerConnection = new RTCPeerConnection();
//     peerConnections.current[from] = peerConnection;
    
//     navigator.mediaDevices.getUserMedia({ video: true, audio: true })
//       .then((stream) => {
//         stream.getTracks().forEach((track) => peerConnection.addTrack(track, stream));
//       });
    
//     peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
//     const answer = await peerConnection.createAnswer();
//     await peerConnection.setLocalDescription(answer);
    
//     socket.emit("answer", { answer, to: from });
//   };

//   const handleReceiveAnswer = ({ answer, from }) => {
//     const peerConnection = peerConnections.current[from];
//     if (peerConnection) {
//       peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
//     }
//   };

//   const handleNewIceCandidate = ({ candidate, from }) => {
//     const peerConnection = peerConnections.current[from];
//     if (peerConnection) {
//       peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
//     }
//   };

//   return (
//     <div className="flex h-screen w-full bg-gray-900 text-white p-4">
//       {/* Video Section */}
//       <div className="w-1/3 bg-gray-800 p-3 rounded-lg shadow-lg flex flex-col items-center">
//         <h2 className="text-lg font-semibold mb-2">Live Video</h2>
//         <video ref={videoRef} autoPlay className="w-full h-auto rounded-lg border border-gray-700" />
//         {remoteStreams.map((stream, index) => (
//           <video key={index} autoPlay className="w-full h-auto mt-2 rounded-lg border border-gray-700" ref={(video) => { if (video) video.srcObject = stream; }} />
//         ))}
//       </div>

//       {/* Code Editor Section */}
//       <div className="w-2/3 flex flex-col ml-4">
//         <div className="flex justify-between items-center bg-gray-800 p-3 rounded-md shadow-md">
//           <h1 className="text-xl font-bold">Codestream - Room: {roomId}</h1>
//           <select 
//             className="p-2 bg-gray-700 text-white border border-gray-600 rounded"
//             value={language} 
//             onChange={(e) => setLanguage(e.target.value)}
//           >
//             <option value="javascript">JavaScript</option>
//             <option value="python">Python</option>
//             <option value="java">Java</option>
//             <option value="cpp">C++</option>
//           </select>
//         </div>
//         <div className="flex-1 mt-4 bg-gray-800 p-3 rounded-lg shadow-lg overflow-hidden">
//           <CodeMirror
//             value={code}
//             height="calc(100vh - 100px)"
//             extensions={[getLanguageExtension()]}
//             theme={oneDark}
//             onChange={handleChange}
//             className="border border-gray-700 rounded-lg bg-gray-900"
//           />
//         </div>
//       </div>
//     </div>
//   );
// }
