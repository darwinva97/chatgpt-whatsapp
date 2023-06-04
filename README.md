# Pasos

- Ejecutar ``npm install``
- Entrar al server de Discord: Pawan-krd (https://discord.gg/pawan-krd-1055397662976905229)
- Aceptar los términos y dirigirse al canal "Bot"
- Escribir /key para generar el API KEY para tu IP
- Asignar esa API KEY a GPT_API_KEY en el .env
- Asignar "https://api.pawan.krd/v1" a GPT_BASE_PATH en el .env
- Asignar "51${tu_número}@s.whatsapp.net" a OWN_REMOTEJID en el .env
- Asignar tu nombre de WhatsApp de tu aplicativo a OWN_PUSHNAME en el .env
- Ejecutar ``npm run dev``
- Escanear el QR generado en la consola con tu app de WhatsApp

Ejemplo de variables de entorno en el archivo ".env":
``
GPT_API_KEY=pk-***********
GPT_BASE_PATH=https://api.pawan.krd/v1
OWN_REMOTEJID=51987654321@s.whatsapp.net
OWN_PUSHNAME=randym
``