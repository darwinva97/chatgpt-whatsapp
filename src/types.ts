export type TMessage = {
  pushName: string;
  messageTimestamp: number;
  content: string;
};

export type TConversation = {
  pushName: string;
  remoteJid: string;
  messages: TMessage[];
};

export type TData = {
  conversations: TConversation[];
  logs: any[];
};
