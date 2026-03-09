"use client";

import { useEffect, useRef, useCallback, useState, MutableRefObject } from "react";
import { Socket } from "socket.io-client";

const ICE_SERVERS = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" },
  ],
};

export function useWebRTC(socketRef: MutableRefObject<Socket | null>) {
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStreams, setRemoteStreams] = useState<Map<string, MediaStream>>(new Map());
  const [remoteNames, setRemoteNames] = useState<Map<string, string>>(new Map());
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isAudioOn, setIsAudioOn] = useState(true);

  const localStreamRef = useRef<MediaStream | null>(null);
  const peerConnections = useRef<Map<string, RTCPeerConnection>>(new Map());

  // ─── Start local camera/mic ───────────────────────────────────────────────
  const startLocalMedia = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      localStreamRef.current = stream;

      // Restore previous toggle states from sessionStorage (per-tab)
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

  // ─── Create peer connection ───────────────────────────────────────────────
  const createPeerConnection = useCallback((socketId: string): RTCPeerConnection => {
    const pc = new RTCPeerConnection(ICE_SERVERS);

    // Add local tracks
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => {
        pc.addTrack(track, localStreamRef.current!);
      });
    }

    // ICE candidates
    pc.onicecandidate = (event) => {
      if (event.candidate && socketRef.current) {
        socketRef.current.emit("webrtc:ice-candidate", {
          targetSocketId: socketId,
          candidate: event.candidate,
        });
      }
    };

    // Remote stream
    pc.ontrack = (event) => {
      const [remoteStream] = event.streams;
      setRemoteStreams((prev) => new Map(prev).set(socketId, remoteStream));
    };

    peerConnections.current.set(socketId, pc);
    return pc;
  }, [socketRef]);

  // ─── Socket event listeners ───────────────────────────────────────────────
  useEffect(() => {
    const interval = setInterval(() => {
      const socket = socketRef.current;
      if (!socket) return;

      clearInterval(interval);

      // Existing peer joins → we create offer
      socket.on("webrtc:new-peer", async ({ socketId, userName }: { socketId: string; userName: string }) => {
        setRemoteNames((prev) => new Map(prev).set(socketId, userName));
        await new Promise((r) => setTimeout(r, 500));
        const pc = createPeerConnection(socketId);
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        socket.emit("webrtc:offer", { targetSocketId: socketId, offer });
      });

      // Receive offer → send answer
      socket.on("webrtc:offer", async ({ from, offer, userName }: {
        from: string;
        offer: RTCSessionDescriptionInit;
        userName: string;
      }) => {
        setRemoteNames((prev) => new Map(prev).set(from, userName));
        const pc = createPeerConnection(from);
        await pc.setRemoteDescription(new RTCSessionDescription(offer));
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        socket.emit("webrtc:answer", { targetSocketId: from, answer });
      });

      // Receive answer
      socket.on("webrtc:answer", async ({ from, answer, userName }: {
        from: string;
        answer: RTCSessionDescriptionInit;
        userName: string;
      }) => {
        setRemoteNames((prev) => new Map(prev).set(from, userName));
        const pc = peerConnections.current.get(from);
        if (pc) await pc.setRemoteDescription(new RTCSessionDescription(answer));
      });

      // ICE candidate
      socket.on("webrtc:ice-candidate", async ({ from, candidate }: {
        from: string;
        candidate: RTCIceCandidateInit;
      }) => {
        const pc = peerConnections.current.get(from);
        if (pc) await pc.addIceCandidate(new RTCIceCandidate(candidate));
      });

      // Peer left
      socket.on("webrtc:peer-left", ({ socketId }: { socketId: string }) => {
        const pc = peerConnections.current.get(socketId);
        if (pc) { pc.close(); peerConnections.current.delete(socketId); }
        setRemoteStreams((prev) => { const next = new Map(prev); next.delete(socketId); return next; });
        setRemoteNames((prev) => { const next = new Map(prev); next.delete(socketId); return next; });
      });

      // Audio toggle from remote
      socket.on("media:audio-toggle", ({ socketId, isAudioOn: remoteAudio }: {
        socketId: string;
        isAudioOn: boolean;
      }) => {
        // UI update if needed — currently handled by stream state
        console.log(`${socketId} audio: ${remoteAudio}`);
      });
    }, 100);

    return () => clearInterval(interval);
  }, [socketRef, createPeerConnection]);

  // ─── Toggle video ─────────────────────────────────────────────────────────
  const toggleVideo = useCallback(async () => {
    if (!localStreamRef.current) return;

    if (isVideoOn) {
      // Turn OFF — stop track and replace with null in peers
      const videoTrack = localStreamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.stop();
        localStreamRef.current.removeTrack(videoTrack);
      }
      for (const pc of Array.from(peerConnections.current.values())) {
        const sender = pc.getSenders().find((s) => s.track?.kind === "video");
        if (sender) await sender.replaceTrack(null);
      }
      setIsVideoOn(false);
      sessionStorage.setItem("videoOn", "false");
    } else {
      // Turn ON — get new camera track
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        const newTrack = stream.getVideoTracks()[0];
        localStreamRef.current.addTrack(newTrack);
        for (const pc of Array.from(peerConnections.current.values())) {
          const sender = pc.getSenders().find((s) => s.track === null || s.track?.kind === "video");
          if (sender) await sender.replaceTrack(newTrack);
          else pc.addTrack(newTrack, localStreamRef.current);
        }
        setIsVideoOn(true);
        sessionStorage.setItem("videoOn", "true");
      } catch (err) {
        console.error("Camera restart failed:", err);
      }
    }
  }, [isVideoOn]);

  // ─── Toggle audio — simple enable/disable, no stop/remove ────────────────
  const toggleAudio = useCallback(async () => {
    if (!localStreamRef.current) return;

    const audioTrack = localStreamRef.current.getAudioTracks()[0];
    if (!audioTrack) return;

    if (isAudioOn) {
      // MUTE — just disable, keep the track alive
      audioTrack.enabled = false;
      setIsAudioOn(false);
      sessionStorage.setItem("audioOn", "false");
      socketRef.current?.emit("media:audio-toggle", { isAudioOn: false });
    } else {
      // UNMUTE — just re-enable
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