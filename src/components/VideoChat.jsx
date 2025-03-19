import React, { useEffect, useRef } from "react";

const VideoChat = () => {
  const videoRef = useRef(null);

  useEffect(() => {
    navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      .then((stream) => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      })
      .catch((err) => console.error("Error accessing webcam: ", err));
  }, []);

  return (
    <div className="w-1/3 bg-gray-800 p-3 rounded-lg shadow-lg flex flex-col items-center">
      <h2 className="text-lg font-semibold mb-2">Live Video</h2>
      <video ref={videoRef} autoPlay className="w-full h-auto rounded-lg border border-gray-700" />
    </div>
  );
};
export default VideoChat;