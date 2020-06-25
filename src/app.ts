import discord from 'discord.js';
// import path from 'path';
// import opus from 'opusscript';
import fs from 'fs-extra';
import {
  VoiceText
} from 'voice-text';
import dotenv from 'dotenv';
dotenv.config()
const {
  DISCORD_TOKEN,
  VOICE_TEXT_API_KEY,
  PREFIX
} = process.env as {
  [key: string]: string
};
const VoiceTextClient = new VoiceText(VOICE_TEXT_API_KEY);
const client = new discord.Client();
let voiceConnects = {};
let voiceStatus = {};
client.on("ready", () => {
  // This event will run if the bot starts, and logs in, successfully.
  console.log(`Bot is start`);
  // Example of changing the bot's playing game to something useful. `client.user` is what the
  // docs refer to as the "ClientUser".
  client.user.setActivity(`Serving ${client.guilds} servers`);
});
client.on("message", async message => {
  const args = message.content.slice(PREFIX.length).trim().split(/ +/g);
  const command = args.shift().toLowerCase();
  if (command === "summon") {
    if (message.member.voice.channel) {
      //botに適切な権限があった場合コマンドを削除する
      message.delete().catch(O_o => { });
      message.channel.send("ボイスチャンネルに参加しています");
      const connection = await message.member.voice.channel.join();
      voiceConnects[message.guild.id] = connection;
    } else {
      const sayMessage = args.join(" ");
      //botに適切な権限があった場合コマンドを削除する
      message.delete().catch(O_o => { });
      message.channel.send("ボイスチャンネルに参加していません");
    }
  } else if (command === "leave") {
    if (voiceConnects[message.guild.id]) {
      //botに適切な権限があった場合コマンドを削除する
      message.delete().catch(O_o => { });
      voiceConnects[message.guild.id].then(connection => {
        connection.disconnect()
      });
      voiceStatus[message.guild.id] = false;
      message.channel.send("ボイスチャンネルから抜けました");
    } else {
      //botに適切な権限があった場合コマンドを削除する
      message.delete().catch(O_o => { });
      message.channel.send("ボイスチャンネルに参加していません");
    }
  } else if (command === "say" && voiceConnects[message.guild.id] && message.content.length > 0) {
    const filePath = await downloadVoice(message.content);
    setTimeout(async () => {
      const connection = await voiceConnects[message.guild.id];
      const dispatcher = await connection.play(filePath);
      console.log('done')
      dispatcher.on('end', reason => {
        //再生済みの音を削除
        fs.unlink(filePath);
      });
    }, 0);
  }
});
client.login(DISCORD_TOKEN);
async function downloadVoice(text) {
  const result = await VoiceTextClient.fetchBuffer(text, {
    format: 'ogg'
  })
  const filePath = `./tmp/${create_privateid(10)}.ogg`
  await fs.writeFile(filePath, result);
  console.log(filePath)
  return filePath;
}

function create_privateid(n) {
  var CODE_TABLE = "0123456789" + "ABCDEFGHIJKLMNOPQRSTUVWXYZ" + "abcdefghijklmnopqrstuvwxyz";
  var r = "";
  for (var i = 0, k = CODE_TABLE.length; i < n; i++) {
    r += CODE_TABLE.charAt(Math.floor(k * Math.random()));
  }
  return r;
}