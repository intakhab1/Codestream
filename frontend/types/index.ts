export interface Room {
  id: string;
  name: string;
  language: Language;
  code: string;
  createdAt: string;
  updatedAt: string;
}

export interface Message {
  id: string;
  content: string;
  roomId: string;
  userName: string;
  createdAt: string;
}

export interface Participant {
  userName: string;
  socketId: string;
  color: string;
  cursor?: { line: number; column: number };
  isVideoOn?: boolean;
  isAudioOn?: boolean;
}

export type Language = "javascript" | "typescript" | "python" | "cpp" | "java";

export const LANGUAGES: { value: Language; label: string; monacoId: string }[] = [
  { value: "javascript", label: "JavaScript", monacoId: "javascript" },
  { value: "typescript", label: "TypeScript", monacoId: "typescript" },
  { value: "python", label: "Python", monacoId: "python" },
  { value: "cpp", label: "C++", monacoId: "cpp" },
  { value: "java", label: "Java", monacoId: "java" },
];