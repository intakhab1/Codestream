import { MongoClient, ObjectId, Db } from "mongodb";

let client: MongoClient;
let db: Db;

export async function connectMongo(): Promise<void> {
  if (db) return;
  client = new MongoClient(process.env.DATABASE_URL!);
  await client.connect();
  db = client.db("codestream");
  await db.collection("rooms").createIndex({ createdAt: -1 });
  await db.collection("messages").createIndex({ roomId: 1, createdAt: 1 });
  console.log("✅ MongoDB connected");
}

// ─── Types ────────────────────────────────────────────────────────────────────

export interface Room {
  id: string;
  name: string;
  code: string;
  language: string;
  createdAt: Date;
}

export interface Message {
  id: string;
  roomId: string;
  userName: string;
  content: string;
  createdAt: Date;
}

// ─── Room ─────────────────────────────────────────────────────────────────────

export const roomsDb = {
  async findUnique(id: string): Promise<Room | null> {
    if (!ObjectId.isValid(id)) return null;
    const doc = await db.collection("rooms").findOne({ _id: new ObjectId(id) });
    if (!doc) return null;
    return { id: doc._id.toString(), name: doc.name, code: doc.code, language: doc.language, createdAt: doc.createdAt };
  },

  async create(data: { name: string; language?: string }): Promise<Room> {
    const doc = {
      name: data.name,
      code: "// Start coding here...",
      language: data.language || "javascript",
      createdAt: new Date(),
    };
    const result = await db.collection("rooms").insertOne(doc);
    return { id: result.insertedId.toString(), ...doc };
  },

  async update(id: string, data: Partial<{ code: string; language: string; name: string }>): Promise<Room | null> {
    if (!ObjectId.isValid(id)) return null;
    const result = await db.collection("rooms").findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: data },
      { returnDocument: "after" }
    );
    if (!result) return null;
    return { id: result._id.toString(), name: result.name, code: result.code, language: result.language, createdAt: result.createdAt };
  },

  async delete(id: string): Promise<void> {
    if (!ObjectId.isValid(id)) return;
    await db.collection("rooms").deleteOne({ _id: new ObjectId(id) });
  },
};

// ─── Messages ─────────────────────────────────────────────────────────────────

export const messagesDb = {
  async findMany(roomId: string): Promise<Message[]> {
    const docs = await db.collection("messages")
      .find({ roomId })
      .sort({ createdAt: 1 })
      .limit(50)
      .toArray();
    return docs.map((doc) => ({
      id: doc._id.toString(),
      roomId: doc.roomId,
      userName: doc.userName,
      content: doc.content,
      createdAt: doc.createdAt,
    }));
  },

  async create(data: { roomId: string; userName: string; content: string }): Promise<Message> {
    const doc = { ...data, createdAt: new Date() };
    const result = await db.collection("messages").insertOne(doc);
    return { id: result.insertedId.toString(), ...doc };
  },
};