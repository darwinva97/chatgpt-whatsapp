import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

import { Low } from "lowdb";
import { JSONFile } from "lowdb/node";

import { TConversation, TData } from "./types";
import { OWN_REMOTEJID } from "./config";

// db.json file path
const __dirname = dirname(fileURLToPath(import.meta.url));
const file = join(__dirname, "..", "db.json");

const adapter = new JSONFile<TData>(file);
const defaultData: TData = { conversations: [] };
const db = new Low<TData>(adapter, defaultData);

export const getDB = async () => {
  await db.read();
  return db;
};

export const detectOnlyPersonalChat = (remoteJid: string) => {
  return remoteJid.includes("s.whatsapp.net") || remoteJid !== OWN_REMOTEJID;
};

export const getConversation = async ({
  remoteJid,
  pushName,
}: {
  remoteJid: string;
  pushName: string;
}) => {
  const db = await getDB();
  const existConversation = db.data.conversations.find(
    (c) => c.remoteJid === remoteJid
  );
  if (existConversation) return existConversation;

  const conversation: TConversation = {
    remoteJid,
    pushName,
    messages: [],
  };
  db.data.conversations.push(conversation);
  await db.write();
  return conversation;
};

export const addMessage = async ({
  conversation,
  ...message
}: {
  conversation: TConversation;
  pushName: string;
  content: string;
  messageTimestamp: number;
}) => {
  const db = await getDB();
  const c = db.data.conversations.find(
    (c) => c.remoteJid === conversation.remoteJid
  );
  if (!c) return;
  c.messages.push(message);
  await db.write();
};
