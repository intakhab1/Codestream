"use client";

import { useEffect, useRef, useCallback } from "react";
import { io, Socket } from "socket.io-client";
import { useAppDispatch } from "@/hooks/useRedux";
import { setParticipants, updateParticipantCursor, updateParticipantAudio } from "@/store/slices/participantsSlice";
import { setLanguage } from "@/store/slices/roomSlice";
import { addMessage } from "@/store/slices/chatSlice";
import { Language } from "@/types";

const SOCKET_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

export function useSocket(
  roomId: string,
  userName: string,
  onRemoteCodeChange?: (code: string) => void  // direct editor callback, bypasses Redux
) {
  const dispatch = useAppDispatch();
  const socketRef = useRef<Socket | null>(null);
  const onRemoteCodeChangeRef = useRef(onRemoteCodeChange);

  // Keep callback ref fresh without re-running the socket effect
  useEffect(() => {
    onRemoteCodeChangeRef.current = onRemoteCodeChange;
  }, [onRemoteCodeChange]);

  useEffect(() => {
    // Wait for a real name before connecting — fixes Anonymous bug
    if (!roomId || !userName || userName === "Anonymous") return;

    const socket = io(SOCKET_URL, {
      transports: ["websocket"],
      query: { userName },
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      socket.emit("room:join", { roomId });
    });
    // ADD: also re-announce when socket already exists (name update)
    if (socketRef.current?.connected) {
      socketRef.current.emit("room:join", { roomId });
    }

    // Audio-toggle
    socket.on("media:audio-toggle", ({ socketId, isAudioOn }) => {
      dispatch(updateParticipantAudio({ socketId, isAudioOn }));
    });
    // Full participant list broadcast
    socket.on("room:participants", (participants: any[]) => {
      dispatch(setParticipants(participants));
    });


    // Remote code — call editor directly, NO Redux dispatch = no page re-render
    socket.on("code:change", ({ code, from }: { code: string; from: string }) => {
      if (from === socket.id) return;
      onRemoteCodeChangeRef.current?.(code);
    });

    // Remote cursor
    socket.on("code:cursor", ({ socketId, cursor }: {
      socketId: string;
      cursor: { line: number; column: number };
    }) => {
      dispatch(updateParticipantCursor({ socketId, cursor }));
    });

    // Remote language change
    socket.on("code:language", ({ language }: { language: Language }) => {
      dispatch(setLanguage(language));
    });

    // Chat message
    socket.on("chat:message", (message: any) => {
      dispatch(addMessage(message));
    });

    return () => {
      socket.emit("room:leave", { roomId });
      socket.disconnect();
      socketRef.current = null;
    };
  }, [roomId, userName, dispatch]);

  const emitCodeChange = useCallback((code: string) => {
    socketRef.current?.emit("code:change", { roomId, code });
  }, [roomId]);

  const emitCursorChange = useCallback((cursor: { line: number; column: number }) => {
    socketRef.current?.emit("code:cursor", { roomId, cursor });
  }, [roomId]);

  const emitLanguageChange = useCallback((language: Language) => {
    socketRef.current?.emit("code:language", { roomId, language });
  }, [roomId]);

  const sendMessage = useCallback((content: string) => {
    if (content.trim()) {
      socketRef.current?.emit("chat:message", { roomId, content });
    }
  }, [roomId]);

  return { socketRef, emitCodeChange, emitCursorChange, emitLanguageChange, sendMessage };
}




