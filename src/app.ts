import discord from 'discord.js';
// import path from 'path';
// import opus from 'opusscript';
import fs from 'fs-extra';
import {VoiceText} from 'voice-text';
import dotenv from 'dotenv';

dotenv.config()

const {
    DISCORD_TOKEN,
    VOICE_TEXT_API_KEY,
    PREFIX
} = process.env as { [key: string]: string };

const VoiceTextClient = new VoiceText(VOICE_TEXT_API_KEY);
const client = new discord.Client();
let voiceConnects = {};
let voiceQueue = {};
let voiceStatus = {};
client.on("ready", () => {
  // This event will run if the bot starts, and logs in, successfully.
  console.log(`Bot has started, with ${client.users.size} users, in ${client.channels.size} channels of ${client.guilds.size} guilds.`);
  // Example of changing the bot's playing game to something useful. `client.user` is what the
  // docs refer to as the "ClientUser".
  client.user.setActivity(`Serving ${client.guilds.size} servers`);
});
client.on("message", async message => {
  const args = message.content.slice(PREFIX.length).trim().split(/ +/g);
  const command = args.shift().toLowerCase();
  if (command === "ping") {
    const m = await message.channel.send("Ping?") as any;
    m.edit(`Pong! Latency is ${m.createdTimestamp - message.createdTimestamp}ms. API Latency is ${Math.round(client.ping)}ms`);
  } else if (command === "summon") {
    if (message.member.voiceChannelID) {
      const sayMessage = args.join(" ");
      //botに適切な権限があった場合コマンドを削除する
      message.delete().catch(O_o => {});
      message.channel.send("ボイスチャンネルに参加しています");
      voiceConnects[message.guild.id] = message.member.voiceChannel.join();
    } else {
      const sayMessage = args.join(" ");
      //botに適切な権限があった場合コマンドを削除する
      message.delete().catch(O_o => {});
      message.channel.send("ボイスチャンネルに参加していません");
    }
  } else if (command === "leave") {
    if (voiceConnects[message.guild.id]) {
      //botに適切な権限があった場合コマンドを削除する
      message.delete().catch(O_o => {});
      voiceConnects[message.guild.id].then(connection => {
        connection.disconnect()
      });
      voiceStatus[message.guild.id] = false;
      message.channel.send("ボイスチャンネルから抜けました");
    } else {
      //botに適切な権限があった場合コマンドを削除する
      message.delete().catch(O_o => {});
      message.channel.send("ボイスチャンネルに参加していません");
    }
  } else if (command === "play") {
    if (voiceConnects[message.guild.id]) {
      
    } else {
      //botに適切な権限があった場合コマンドを削除する
      message.delete().catch(O_o => {});
      message.channel.send("ボイスチャンネルに参加していません");
    }

  //コマンドではなかった場合
  }else if(voiceConnects[message.guild.id] && message.content.length > 0)
  {
  	const filePath = await downloadVoice(message.content);
  	if (!voiceQueue[message.guild.id]) {
        voiceQueue[message.guild.id] = [];
      }
      voiceQueue[message.guild.id].push(filePath)
      if (!voiceStatus[message.guild.id]) {
        voiceStatus[message.guild.id] = true;
        playVoice(message.guild.id);
      }
  }
});
client.login(DISCORD_TOKEN);
async function playVoice(id) {
	console	.log(voiceQueue)
  //再生リストをとりだす
  for (let i in voiceQueue[id]) {
    const connection = await voiceConnects[id];
    //ファイルを再生
    const dispatcher = await connection.playFile(voiceQueue[id][i]);
    //終わった時の処理
    dispatcher.on('end', reason => {
      //再生済みの音を削除
      fs.unlink( voiceQueue[id][i]);
      voiceQueue[id].shift();
      //リストが空になったら再生をやめる
      if (voiceQueue[id].length <= 0) {
        voiceStatus[id] = false;
        //リストに音がのここっていたら継続
      } else {
        playVoice(id)
      }
    });
    break;
  }
}
async function downloadVoice(text) {
  const result = await VoiceTextClient.fetchBuffer(text, {
    format: 'ogg'
  })
  const filePath = `./tmp/${create_privateid(10)}.ogg`
  await fs.writeFile(filePath, result);
  return	filePath;
}

function create_privateid(n) {
  var CODE_TABLE = "0123456789" + "ABCDEFGHIJKLMNOPQRSTUVWXYZ" + "abcdefghijklmnopqrstuvwxyz";
  var r = "";
  for (var i = 0, k = CODE_TABLE.length; i < n; i++) {
    r += CODE_TABLE.charAt(Math.floor(k * Math.random()));
  }
  return r;
}