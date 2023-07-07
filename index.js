const { Client, Events, GatewayIntentBits, EmbedBuilder } = require("discord.js");
const { token } = require("./config.json");
const { open } = require("lmdb")

const bot = new Client({ intents: [
  GatewayIntentBits.Guilds,
	GatewayIntentBits.GuildMessages,
	GatewayIntentBits.MessageContent,
	GatewayIntentBits.GuildMembers,
] });

bot.once(Events.ClientReady, c => {
	console.log(`Ready! Logged in as ${c.user.tag}`);
});

let db = open({
	path: 'db',
});

bot.on("messageCreate", msg => {
  if (msg.content.toLowerCase().replace(" ", "") === "t!ping") {
    msg.reply(`Bot latency: ${bot.ws.ping}ms`);
  } else if (msg.content.toLowerCase().replace(" ", "") === "t!help") {
    let helpEmbed = new EmbedBuilder()
      .setColor(0x36393f)
      .setTitle("TestBot - Help")
      .setDescription("Hello I am test bot, here are my commands")
      .addFields(
		    { name: 'Utility', value: "`help`\n`ping`" },
        { name: 'Pets', value: "`newpet <name> <age>`\n`petstats`" }
      )
    msg.reply({ embeds: [helpEmbed] })
  } else if (msg.content.toLowerCase().startsWith("t!newpet")) {
    let exists = true 
    db.ifNoExists(["pet", msg.author.id], () => {
      exists = false
    })    
    if (exists === true) {
      return msg.reply("You already have a pet! You cant have more than one. Run t!petstats to see your pet")
    }
    let args = msg.content.split(" ")
    if (args.length != 3) {
       return msg.reply("Not enough arguments.\nCorrect usage: `t!newpet <name> <age>`")
    }
    let name = args[1]
    let age = args[2]   
    let id = msg.author.id
    db.putSync(["pet", msg.author.id], {
      name: name,
      age: age
    })
    msg.reply(`Created pet with name "${name}" and age "${age}"`)
  } else if (msg.content.toLowerCase().replace(" ", "") === "t!petstats") {
    if (db.doesExist(["pet", msg.author.id]) === false) {
      return msg.reply("You dont have a pet yet! Create one by running t!newpet <name> <age>")  
    }
    let pet = db.get(["pet", msg.author.id])
    let responseEmbed = new EmbedBuilder()  
      .setColor(0x36393f)
      .setTitle(`${msg.author.username}'s pet`)
      .setDescription(`Name: ${pet.name}\nAge: ${pet.age}`)
    msg.reply({ embeds: [responseEmbed] })
  }
});

bot.login(token);