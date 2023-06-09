import { Configuration, OpenAIApi } from "openai";
import { GPT_API_KEY, GPT_BASE_PATH, OWN_PUSHNAME } from "./config";
import { addMessage, detectOnlyPersonalChat, getConversation } from "./db";
import { proto } from "@whiskeysockets/baileys";
import { TConversation } from "./types";

const configuration = new Configuration({
  apiKey: GPT_API_KEY,
  basePath: GPT_BASE_PATH,
});

const openai = new OpenAIApi(configuration);

export const chat = async (messages: proto.IWebMessageInfo[]) => {
  const remoteJid = messages[0].key.remoteJid;
  const pushName = messages[0].pushName || OWN_PUSHNAME;
  const messageTimestamp = messages[0].messageTimestamp;
  const content =
    messages[0].message?.conversation ||
    messages[0].message?.extendedTextMessage?.text;
  const fromMe = messages[0].key.fromMe;

  if (!remoteJid || !pushName || !messageTimestamp || !content) return;

  const isPersonalChat = remoteJid && detectOnlyPersonalChat(remoteJid);

  if (!isPersonalChat) return;

  let conversation: TConversation | undefined = await getConversation({
    remoteJid,
    pushName,
  });

  conversation = await addMessage({
    conversation,
    content,
    pushName,
    messageTimestamp,
  });

  if (!fromMe && conversation) {
    const response = await getResponse(conversation);
    return response;
  }

  return false;
};

export const getResponse = async (conversation: TConversation) => {
  const now = new Date();
  const date =
    now.getFullYear() +
    "-" +
    (now.getMonth() + 1) +
    "-" +
    now.getDate() +
    " " +
    now.getHours() +
    ":" +
    now.getMinutes() +
    ":" +
    now.getSeconds();
  // let prompt = `(Actualmente es ${date} y estamos en Perú)\n`;
  let prompt = ``;

  prompt += conversation.messages
    .map((m) => `${m.pushName}:${m.content}`)
    .join("\n");

  prompt += `\n${OWN_PUSHNAME}:`;

  const response = await openai.createCompletion({
    model: "text-davinci-003",
    prompt,
    temperature: 0.7,
    max_tokens: 256,
    top_p: 1,
    frequency_penalty: 0,
    presence_penalty: 0,
    stop: [`${conversation.pushName}:`, `${OWN_PUSHNAME}:`],
  });

  const data = response.data;
  return { data, prompt }
};
