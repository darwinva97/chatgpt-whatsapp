import makeWASocket, {
  DisconnectReason,
  useMultiFileAuthState,
} from "@whiskeysockets/baileys";
import { Boom } from "@hapi/boom";
import { chat } from "./gpt";
import { getDB } from "./db";

async function connectToWhatsApp() {
  const { state, saveCreds } = await useMultiFileAuthState("auth_info_baileys");

  const sock = makeWASocket({
    printQRInTerminal: true,
    auth: state,
  });
  sock.ev.on("creds.update", saveCreds);

  sock.ev.on("connection.update", (update) => {
    const { connection, lastDisconnect } = update;
    if (connection === "close") {
      const shouldReconnect =
        (lastDisconnect?.error as Boom)?.output?.statusCode !==
        DisconnectReason.loggedOut;
      console.log(
        "connection closed due to ",
        lastDisconnect?.error,
        ", reconnecting ",
        shouldReconnect
      );
      // reconnect if not logged out
      if (shouldReconnect) {
        connectToWhatsApp();
      }
    } else if (connection === "open") {
      console.log("opened connection");
    }
  });

  sock.ev.on("messages.upsert", async (m) => {
    const db = await getDB();
    db.data.logs.push(m);
    await db.write();
    let { data: response, prompt } = await chat(m.messages);

    if (!response) return;

    const text = response.choices[0].text?.trim();

    if (!text) {
      console.log(response, prompt);
      return;
    }

    // console.log("replying to", m.messages[0].key.remoteJid);

    await sock.sendMessage(m.messages[0].key.remoteJid!, {
      text,
    });
  });
}

connectToWhatsApp();
