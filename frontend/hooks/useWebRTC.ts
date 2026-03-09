"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { Socket } from "socket.io-client";
import type { MutableRefObject } from "react";

const ICE_SERVERS = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" },
  ],
};

function createBlankVideoTrack(): MediaStreamTrack {
  const canvas = document.createElement("canvas");
  canvas.width = 640;
  canvas.height = 480;
  const ctx = canvas.getContext("2d")!;
  ctx.fillStyle = "#1a1a2e";
  ctx.fillRect(0, 0, 640, 480);
  // Person icon circle (head)
  ctx.fillStyle = "#4a4a6a";
  ctx.beginPath();
  ctx.arc(320, 180, 80, 0, Math.PI * 2);
  ctx.fill();
  // Person icon body
  ctx.beginPath();
  ctx.ellipse(320, 400, 130, 100, 0, 0, Math.PI * 2);
  ctx.fill();
  const stream = canvas.captureStream(1);
  return stream.getVideoTracks()[0];
}

export function useWebRTC(socketRef: MutableRefObject<Socket | null>) {
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStreams, setRemoteStreams] = useState<Map<string, MediaStream>>(new Map());
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isAudioOn, setIsAudioOn] = useState(true);

  const localStreamRef = useRef<MediaStream | null>(null);
  const peerConnections = useRef<Map<string, RTCPeerConnection>>(new Map());
  const [remoteNames, setRemoteNames] = useState<Map<string, string>>(new Map());

  const startLocalMedia = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      localStreamRef.current = stream;

      const savedVideo = sessionStorage.getItem("videoOn");
      const savedAudio = sessionStorage.getItem("audioOn");

      if (savedVideo === "false") {
        stream.getVideoTracks().forEach((t) => (t.enabled = false));
        setIsVideoOn(false);
      } else {
        setIsVideoOn(true);
      }

      if (savedAudio === "false") {
        stream.getAudioTracks().forEach((t) => (t.enabled = false));
        setIsAudioOn(false);
      } else {
        setIsAudioOn(true);
      }

      setLocalStream(stream);
    } catch (err) {
      console.error("Media error:", err);
    }
  }, []);

  function createPeerConnection(targetSocketId: string): RTCPeerConnection {
    const pc = new RTCPeerConnection(ICE_SERVERS);

    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => {
        pc.addTrack(track, localStreamRef.current!);
      });
    }

    pc.ontrack = (event) => {
      const stream = event.streams[0];
      setRemoteStreams((prev) => new Map(prev).set(targetSocketId, stream));
    };

    pc.onicecandidate = (event) => {
      if (event.candidate && socketRef.current) {
        socketRef.current.emit("webrtc:ice-candidate", {
          targetSocketId,
          candidate: event.candidate,
        });
      }
    };

    pc.onconnectionstatechange = () => {
      if (pc.connectionState === "disconnected" || pc.connectionState === "failed") {
        pc.close();
        peerConnections.current.delete(targetSocketId);
        setRemoteStreams((prev) => {
          const next = new Map(prev);
          next.delete(targetSocketId);
          return next;
        });
      }
    };

    peerConnections.current.set(targetSocketId, pc);
    return pc;
  }

  useEffect(() => {
    if (!socketRef.current) return;

    socketRef.current.on("webrtc:new-peer", async ({ socketId, userName }: { socketId: string; userName: string }) => {
      setRemoteNames((prev) => new Map(prev).set(socketId, userName));
      await new Promise((r) => setTimeout(r, 500));
      const pc = createPeerConnection(socketId);
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      socketRef.current?.emit("webrtc:offer", { targetSocketId: socketId, offer });
    });

    socketRef.current.on("webrtc:offer", async ({ from, offer }: { from: string; offer: RTCSessionDescriptionInit }) => {
      const pc = createPeerConnection(from);
      await pc.setRemoteDescription(new RTCSessionDescription(offer));
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      socketRef.current?.emit("webrtc:answer", { targetSocketId: from, answer });
    });

    socketRef.current.on("webrtc:answer", async ({ from, answer }: { from: string; answer: RTCSessionDescriptionInit }) => {
      const pc = peerConnections.current.get(from);
      if (pc) await pc.setRemoteDescription(new RTCSessionDescription(answer));
    });

    socketRef.current.on("webrtc:ice-candidate", async ({ from, candidate }: { from: string; candidate: RTCIceCandidateInit }) => {
      const pc = peerConnections.current.get(from);
      if (pc) {
        try { await pc.addIceCandidate(new RTCIceCandidate(candidate)); } catch (e) {}
      }
    });

    socketRef.current.on("webrtc:peer-left", ({ socketId }: { socketId: string }) => {
      setRemoteNames((prev) => { const next = new Map(prev); next.delete(socketId); return next; });
      const pc = peerConnections.current.get(socketId);
      if (pc) { pc.close(); peerConnections.current.delete(socketId); }
      setRemoteStreams((prev) => { const next = new Map(prev); next.delete(socketId); return next; });
    });

    return () => {
      socketRef.current?.off("webrtc:new-peer");
      socketRef.current?.off("webrtc:offer");
      socketRef.current?.off("webrtc:answer");
      socketRef.current?.off("webrtc:ice-candidate");
      socketRef.current?.off("webrtc:peer-left");
    };
  }, [socketRef.current]);

  useEffect(() => {
    return () => {
      peerConnections.current.forEach((pc) => pc.close());
      localStreamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  const toggleVideo = useCallback(async () => {
    if (!localStreamRef.current) return;

    const videoTrack = localStreamRef.current.getVideoTracks()[0];

    if (videoTrack && videoTrack.readyState === "live") {
      videoTrack.stop();
      setIsVideoOn(false);
      sessionStorage.setItem("videoOn", "false");

      const blankTrack = createBlankVideoTrack();
      for (const pc of Array.from(peerConnections.current.values())) {
        const sender = pc.getSenders().find((s) => s.track?.kind === "video");
        if (sender) await sender.replaceTrack(blankTrack);
      }
      return;
    }

    try {
      const newStream = await navigator.mediaDevices.getUserMedia({ video: true });
      const newTrack = newStream.getVideoTracks()[0];

      const oldTracks = localStreamRef.current.getVideoTracks();
      oldTracks.forEach((t) => localStreamRef.current?.removeTrack(t));
      localStreamRef.current.addTrack(newTrack);

      for (const pc of Array.from(peerConnections.current.values())) {
        const sender = pc.getSenders().find((s) => s.track?.kind === "video");
        if (sender) await sender.replaceTrack(newTrack);
      }

      setIsVideoOn(true);
      sessionStorage.setItem("videoOn", "true");
    } catch (err) {
      console.error("Camera restart failed:", err);
    }
  }, []);

  const toggleAudio = useCallback(() => {
    if (!localStreamRef.current) return;

    const audioTrack = localStreamRef.current.getAudioTracks()[0];
    if (!audioTrack) return;

    if (isAudioOn) {
      audioTrack.enabled = false;
      setIsAudioOn(false);
      sessionStorage.setItem("audioOn", "false");
      socketRef.current?.emit("media:audio-toggle", { isAudioOn: false });
    } else {
      audioTrack.enabled = true;
      setIsAudioOn(true);
      sessionStorage.setItem("audioOn", "true");
      socketRef.current?.emit("media:audio-toggle", { isAudioOn: true });
    }
  }, [isAudioOn, socketRef]);

  return {
    localStream,
    remoteStreams,
    remoteNames,
    isVideoOn,
    isAudioOn,
    startLocalMedia,
    toggleVideo,
    toggleAudio,
  };
}