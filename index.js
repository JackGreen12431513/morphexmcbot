const discord = require('discord.js');
var client = new discord.Client();
const fs = require('fs')
var request = require('request');
const repeat = require('repeat');
require('dotenv').config();

var prefix = "m!"
const marrData = JSON.parse(fs.readFileSync("marriageData.json", "utf8"));

const config = process.env.botToken;

var usersPlaying = [];
var noMentionArray = [];

client.login(config);

function checkIfOnline(){
    request(url, function(err, response, body) {
        if(err) {
            console.log(err);
            return message.reply('Error getting Minecraft server status...');
        }
        body = JSON.parse(body);
        var status = '*Minecraft server is currently offline*';
        if(body.online) {
            status = '**Minecraft** server is **online**  -  ';
            if(body.players.now) {
                status += '**' + body.players.now + '/' + body.players.max + '** people are playing! - MOTD: ' + body.motd;
            } else {
                status += '*Nobody is playing!*';
            }
        }
        message.reply(status);
});
  }

  setInterval(checkIfOnline, 3.6e+6);

  
  var statusPlay = 0;

client.on('ready', none => {
    var datetime = new Date();
    console.log("Ready! - " + datetime)
    repeat(changePlaying());
})

client.on('guildCreate', joinedGuild => {
    console.log(`Joined ${joinedGuild}`)
})

client.on('message', message => {

    var sender = message.author;

    for (var i = 0; i < noMentionArray.length; i++) {
        if (message.content.includes(noMentionArray[i])) {
            message.delete(1, 1)
          break;
        }
      }

    if(!marrData[sender.id]) marrData[sender.id] = {
        partner: "",
        wins: 0,
        coins: 0,
        realName: sender.username,
        profileBio: "",
        pickaxe: "Rusty Pickaxe",
        emojis: 0,
        timeoutDuration: 10000,
        pickDura: 100
      }

      marrData[sender.id].coins++;

      fs.writeFile('marriageData.json', JSON.stringify(marrData), (err) => {
        if (err) console.log(err);
      })

      if (message.content.includes("morphex") || message.content.includes("Morphex") == true) {
          message.react("❤");
      }
    
    if(message.author.equals(client.user) || !message.content.startsWith(prefix)) return;
    var args = message.content.substring(prefix.length).split(" ")

    function clean(text) {
        if (typeof(text) === "string")
          return text.replace(/`/g, "`" + String.fromCharCode(8203)).replace(/@/g, "@" + String.fromCharCode(8203));
        else
            return text;
      }

    switch(args[0]) {

        case "ping":
        message.channel.send(`Pong! Time Taken: \`${client.ping}ms\``)
        break;

        case "dc":
        if (sender.id != "412268614696304642") {
            return;
        } else {
            message.delete()
            message.channel.send("@everyone All data is going to be reset.")
        }
        break;

        case "eval":
        if (sender.id == "412268614696304642") {
            try {
                const code = message.content.replace("m!eval", "").replace(" ", "");
                let evaled = eval(code);
          
                if (typeof evaled !== "string")
                  evaled = require("util").inspect(evaled);
          
                message.channel.send(clean(evaled), {code:"xl"});
              } catch (err) {
                message.channel.send(`\`ERROR\` \`\`\`xl\n${clean(err)}\n\`\`\``);
              }
        } else {
            return;
        }
        break;

        case "kiss":
        if (marrData[sender.id].partner != "") {
            client.users.get(marrData[sender.id].partner).send("❤ Your partner has kissed you!");
        } else {
            message.reply("you do not have a partner!")
        }
        break;

        case "help":
        let helpCommand = message.content.replace("m!help", "").replace(" ", "")
        if (helpCommand == null || helpCommand == "") {
            var cmdsEmb = new discord.RichEmbed()
            .setTitle("Morphex Commands")
            .setDescription("Run `m!help <command> to learn more!`")
            .addField("📰 Basic Commands:", "`online` `profile`", true)
            .addField("💍 Roleplay Commands:", "`marry` `divorce` `kiss` `gift`", true)
            .addField("🎪 Fun Commands:", "`chatgame` `tord` `mine`", true)
            .addField("🔨 Utilities:", "`uuid` `afk`", true)
            .addField("✏ Moderation Commands:", "`none`", true)
            .addField("⚙ Settings:", "`prefix` `setbio`", true)
            .setColor(0x06B4B5)
            message.channel.send(cmdsEmb)
        }
        else {
            if (helpCommand == "online") {
                message.reply("checks if the server is online")
            } else if (helpCommand == "profile") { 
                message.reply("checks mentioned users profile card - `m!profile @user`")
            } else if (helpCommand == "marry") {
                message.reply("propose to mentioned user - `m!marry @user`")
            } else if (helpCommand == "divorce") {
                message.reply("divorce to currently married user")
            } else if (helpCommand == "prefix") {
                message.reply("change the bots prefix - Kyon Only")
            } else if (helpCommand == "chatgame") {
                message.reply("starts a chatgame, where you have to guess the emoji")
            } else if (helpCommand == "tord") {
                message.reply("starts a game of truth or dare - Subcommands: \`m!tord join\` \`m!tord leave\` \`m!tord lobby\` \`m!tord spin\`")
            } else if (helpCommand == "uuid") {
                message.reply("get minecraft players UUID")
            } else if (helpCommand == "setbio") {
                message.reply("set your bio - Shows up on `m!profile`")
            } else if (helpCommand == "mine") {
                message.reply("mine coins, buy pickaxes and trade emojis! - Subcommands: \`m!mine start\` \`m!mine market\` \`m!mine deposit\` \`m!mine stats\` \`m!mine sell\`")
            } else if (helpCommand == "afk") {
                message.reply("stops anyone from mentioning you!")
            }
        }
        break;

        case "setbio":
        let bioToSet = message.content.replace("m!setbio", "").replace(" ", "")
        if (bioToSet == "") {
            marrData[sender.id].profileBio = "N/A"; 
            writeToMarr();
        } else {
            marrData[sender.id].profileBio = bioToSet;
            message.reply("Bio set to: " + bioToSet)
            writeToMarr();
        }
        break;

        case "uuid":
        let usernameToSearch = message.content.replace("m!uuid", "").replace(" ", "");
        request('https://api.mojang.com/users/profiles/minecraft/' + usernameToSearch, function(err, response, body) {
            if (err) console.log(err);
            else {
                var obj = JSON.parse(body);
                var id = obj.id;
                message.channel.send(`${usernameToSearch}'s ID: ${id}`)
            }
        })
        break;

        case "profile":
        //💸
        let userProfile = message.mentions.members.first();
        if (userProfile == "" || userProfile == null) {
            message.reply("Please mention a user!")
        } else {
            if (marrData[userProfile.id] != null) {
                if (marrData[userProfile.id].partner != "") {
                    var profileEmb = new discord.RichEmbed()
                    .setTitle("Profile for " + userProfile.user.username)
                    .setDescription(`Bio: ${marrData[userProfile.id].profileBio}`)
                    .addField("📜 Roles:", userProfile.roles.map(role => role.name).join(", "))
                    .addField("💍 Relationship:", "Married to: <@" + marrData[userProfile.id].partner + ">")
                    .addField("⛏ Mining Stats:", `Pickaxe: ${marrData[userProfile.id].pickaxe}\nEmojis: ${marrData[userProfile.id].emojis}`)
                    .addField("🏆 Stats:", `Wins: ${marrData[userProfile.id].wins}\nCoins: ${marrData[userProfile.id].coins}`)
                    .addField("🕙 Joined Guild:", `User joined: ${userProfile.joinedAt}`)
                    .setThumbnail(userProfile.user.avatarURL)
                    .setColor(0x06B4B5)
                    message.channel.send(profileEmb)
                } else {
                    var profileEmb3 = new discord.RichEmbed()
                    .setTitle("Profile for " + userProfile.user.username)
                    .setDescription(`Bio: '${marrData[userProfile.id].profileBio}'`)
                    .addField("📜Roles:", userProfile.roles.map(role => role.name).join(", "))
                    .addField("💍Relationship:", "Married to: no-one!")
                    .addField("⛏ Mining Stats:", `Pickaxe: ${marrData[userProfile.id].pickaxe}\nEmojis: ${marrData[userProfile.id].emojis}`)
                    .addField("🏆 Stats:", `Wins: ${marrData[userProfile.id].wins}\nCoins: ${marrData[userProfile.id].coins}`)
                    .addField("🕙 Joined Guild:", `User joined: ${userProfile.joinedAt}`)
                    .setThumbnail(userProfile.user.avatarURL)
                    .setColor(0x06B4B5)
                    message.channel.send(profileEmb3)
                }
            } else {
                var profileEmb2 = new discord.RichEmbed()
                .setTitle("Profile for " + userProfile.user.username)
                .addField("Roles:", userProfile.roles.map(role => role.name).join(", "))
                .addField("Joined Guild:", `User joined: ${userProfile.joinedAt}`)
                .setThumbnail(userProfile.user.avatarURL)
                .setColor(0x06B4B5)
                message.channel.send(profileEmb2)
            }
        }
        break;

        case "online": 
        var url = 'http://mcapi.us/server/status?ip=Morphex.aternos.me';
        request(url, function(err, response, body) {
            if(err) {
                console.log(err);
                return message.reply('Error getting Minecraft server status...');
            }
            body = JSON.parse(body);
            var status = '*Minecraft server is currently offline*';
            if(body.online) {
                status = '**Minecraft** server is **online**  -  ';
                if(body.players.now) {
                    status += '**' + body.players.now + '/' + body.players.max + '** people are playing! - MOTD: ' + body.motd;
                } else {
                    status += '*Nobody is playing!* **MOTD: ' + body.motd + '**';
                }
            }
            message.reply(status);
});
break;

case "marry":
let userMarry = message.mentions.members.first();
if (marrData[sender.id].partner !== "") {
    message.channel.send(`${message.author}, you are married already!`)
} else {
userMarry.send(`💍 ${message.author} has just proposed to you!\nReact with either ✅ or 🚫!`);
client.on('messageReactionAdd', (reaction, user) => {
    if(reaction.emoji.name === "✅") {
        userMarry.send(`Congratulations! You have now married ${message.author}`);
        message.author.send(`You are now married to ${userMarry}`)
        marrData[sender.id].partner = userMarry.id;
        marrData[userMarry.id].partner = message.author.id;
        writeToMarr();
    } else  if(reaction.emoji.name === "🚫") {
        message.userMarry.send(`You rejected ${message.author}!`);
        message.author.send(`${userMarry} declined your proposal!`)
    }
})
}
break;

case "divorce":
let userMarried = marrData[sender.id].partner;
if (marrData[sender.id].partner != "") {
    message.author.send("Are you sure you would like to divorce <@" + userMarried + ">?\nReact with either ✅ or 🚫!")
    client.on('messageReactionAdd', (reaction, user) => {
    if(reaction.emoji.name === "✅") {
        message.author.send(`You have left your partner!`)
        marrData[sender.id].partner = "";
        marrData[userMarried].partner = "";
        writeToMarr();
    } else  if(reaction.emoji.name === "🚫") {
        message.author.send(`You did not leave your partner!`)
    }
})
} else {
    message.channel.send("No partner!")
}
break;

case "prefix":
if (message.author.id === "321992720040329216") {
    let prefixNew = message.content.replace("m!prefix", "").replace(" ", "");
    prefix = prefixNew;
} else {
    message.channel.send("This command is for <@321992720040329216> only")
}
break;

case "chatgame":
var sent = 0;
var emojisToChoose = ["💩", "⚙"]
var emojiChosen = emojisToChoose[Math.floor(Math.random()*emojisToChoose.length)];
if (emojiChosen == "💩") {
    message.channel.send("this emoji's description is: `brown,ew, eyes, produced by living creatures`")
    client.on('messageReactionAdd', (reaction, user) => {
        if (!sent < 1) {

        } else {
            if(reaction.emoji.name === "💩") {
            sent += 1;
            message.channel.send("Correct! +50 coins!")
            marrData[sender.id].coins += 50;
            marrData[sender.id].wins++;
            writeToMarr();
        }
    }
})
} else if (emojiChosen == "⚙") {
    message.channel.send("this emoji's description is: `used for mechanisms in real life, seen in toy cars or toy choppers`")
    client.on('messageReactionAdd', (reaction, user) => {
        if (!sent < 1) {

        }
        else {
            if(reaction.emoji.name === "⚙") {
                sent += 1;
                message.channel.send("Correct! +50 coins!")
                marrData[sender.id].coins += 50;
                marrData[sender.id].wins++;
                writeToMarr();
            }
        }
    })
}
break;

case "tord":
let subcmd = message.content.replace("m!tord", "").replace(" ", "");
if (subcmd == "lobby") {
    var tordLobbyEmb = new discord.RichEmbed()
    .addField("Users playing:", usersPlaying.join("\n"))
    .setColor(0x06B4B5)
    message.channel.send(tordLobbyEmb)
} else if (subcmd == "join") {
    if (usersPlaying.includes("<@" + sender.id + ">")) message.channel.send("You are already in the lobby!");
    else {
        userPlayingAdd("<@" + sender.id + ">")
        message.reply("joined!")
        console.log(usersPlaying);
    }
} else if (subcmd == "leave") {
    if (usersPlaying.includes("<@" + sender.id + ">")) message.channel.send("You are not in the lobby!");
    else {
        message.reply("left!")
        userPlayingRemove("<@" + sender.id + ">")
    }
} else if (subcmd == "spin") {
    if (!usersPlaying.includes("<@" + sender.id + ">")) message.channel.send("You are not in the lobby!");
    else {
        if (usersPlaying.length >= 2) {
            var tordArr = ["truth", "dare"];
            var firstUser = usersPlaying[Math.floor(Math.random()*usersPlaying.length)];
            var secondUser = usersPlaying[Math.floor(Math.random()*usersPlaying.length)];
            var realTord = tordArr[Math.floor(Math.random()*tordArr.length)];
            if (firstUser == secondUser) return;
            else {
                message.channel.send(`${firstUser} will be giving ${secondUser} a ${realTord}!`)
            }
        } else {
            message.channel.send(`1 more player needed!`)
        }
    }
}
break;

case "mine":
let subCmdMine = message.content.replace("m!mine", "").replace(" ", "")
if (subCmdMine == "start") {
    if (marrData[sender.id].pickDura >= 1) {
        message.channel.send(`You started to mine with ${JSON.stringify(marrData[sender.id].pickaxe)}`)
        setTimeout(function(){
            var coins = Math.floor(Math.random() * 20 ) + 1;
            var duraTakeaway = Math.floor(Math.random() * 15 ) + 1;
            message.channel.send(`You mined ${coins} coins, but your pickaxe durability went down ${duraTakeaway}!`);
            marrData[sender.id].pickDura -= duraTakeaway
            marrData[sender.id].coins += coins;
        }, marrData[sender.id].timeoutDuration)
    } else {
        message.reply("Your pickaxe is broken! Would you like to repair it for `M$50` (✅ or 🚫)")
        client.on('messageReactionAdd', (reaction, user) => {
            if(reaction.emoji.name === "✅") {
                if (marrData[sender.id].coins >= 50) {
                    message.channel.send(`Repairing your pickaxe!`)
                    marrData[sender.id].coins -= 50;
                    marrData[sender.id].pickDura += 100;
                    writeToMarr();
                } else {
                    message.reply("You do not have enough coins!")
                }
            } else  if(reaction.emoji.name === "🚫") {
                message.channel.send(`Your pickaxe has not been repaired!`)
            }
        })

    }
} else if (subCmdMine == "market") {
    var mineMarketEmb = new discord.RichEmbed()
    .setTitle("⛏ Mine Marketplace")
    .addField("Rusty Pickaxe", "Price: Free\nTimeout: 10s")
    .addField("Stone Pickaxe", "Price: M$500\nTimeout: 9s\nEmoji: 🕐")
    .addField("Iron Pickaxe", "Price: M$1000z\nTimeout: 8s\nEmoji: 🕑")
    .setColor(0x06B4B5)
    message.channel.send(mineMarketEmb);
    client.on('messageReactionAdd', (reaction, user) => {
    if(reaction.emoji.name === "🕐") {
        if (marrData[sender.id].coins >= 500) {
            message.channel.send("Bought `Stone Pickaxe`")
            marrData[sender.id].coins -= 500;
            marrData[sender.id].pickaxe = "Stone Pickaxe";
            marrData[sender.id].timeoutDuration = "9000";
            writeToMarr();
            return;
        } else {
            message.channel.send("Not enough coins!")
        }
    } else if(reaction.emoji.name === "🕑") {
        if (marrData[sender.id].coins >= 1000) {
            message.channel.send("Bought `Iron Pickaxe`")
            marrData[sender.id].coins -= 1000;
            marrData[sender.id].pickaxe = "Iron Pickaxe";
            marrData[sender.id].timeoutDuration = "8000";
            writeToMarr();
            return;
        } else {
            message.channel.send("Not enough coins!")
        }
    }
})
} else if (subCmdMine == "deposit") {
    if (marrData[sender.id].coins >= 100) {
        marrData[sender.id].coins -= 100;
        marrData[sender.id].emojis += 1;
        message.channel.send("You now have " + marrData[sender.id].emojis + " emojis!")
    } else {
        message.reply("You do not have enought to deposit!")
    }
} else if (subCmdMine == "stats") {
    var statsEmb = new discord.RichEmbed()
    .setTitle(`Mine stats for ${sender.username}`)
    .addField(`Pickaxe:`, `Pickaxe: ${marrData[sender.id].pickaxe}\nDurability: ${marrData[sender.id].pickDura}/100\nTimeout: ${marrData[sender.id].timeoutDuration}ms`)
    .addField(`Currency:`, `Coins: M$${marrData[sender.id].coins}\nEmojis: ${marrData[sender.id].emojis}`)
    .setColor(0x06B4B5)
    message.channel.send(statsEmb);
} else if (subCmdMine == "sell") {
    var sellPrices = [100,250,200,500,100,100,100,200,300,400,330,1000,100,250,200]
    var realSellPrice = sellPrices[Math.floor(Math.random()*sellPrices.length)];
    if (marrData[sender.id].emojis >= 1) {
        message.channel.send(`Selling 1 emoji for M$${realSellPrice}`);
        marrData[sender.id].emojis -= 1;
        marrData[sender.id].coins += realSellPrice;
        writeToMarr();
    } else {
        message.reply("not enough emojis!")
    }
}
break;

case "afk":
if (noMentionArray.includes("<@"+ sender.id + ">")) {
    afkRemove("<@"+ sender.id + ">");
    console.log(noMentionArray)
} else {
    afkAdd("<@"+ sender.id + ">");
    console.log(noMentionArray)
}
break;
    }
});

var afkAdd = function(id){
    noMentionArray.push(`${id}`);
 }
 
 var afkRemove = function(id){
    noMentionArray.pop(`${id}`);
 }
 

var userPlayingAdd = function(id){
   usersPlaying.push(`${id}`);
}

var userPlayingRemove = function(id){
    usersPlaying.pop(`${id}`);
}

function writeToMarr() {
    fs.writeFile('marriageData.json', JSON.stringify(marrData), (err) => {
        if (err) console.log(err);
      })
}

function givePick(id, pickName) {
    marrData[id].pickaxe = pickName
    writeToMarr();
}

function setPickData(id, timeout, dura) {
    marrData[id].timeoutDuration = timeout;
    marrData[id].pickDura = dura
    writeToMarr();
}

function setUserCurrency(id, coins, wins, emojis) {
    marrData[id].emojis = emojis;
    marrData[id].wins = wins;
    marrData[id].coins = coins;
    writeToMarr();
}

function setPartner(id1, id2) {
    marrData[id1].partner = id2;
    marrData[id2].partner = id1;
    writeToMarr();
}

function setBio(id, newBio) {
    marrData[id].profileBio = newBio;
}

function changePlaying() {
    console.dir(statusPlay);
        setInterval(function(){
            if (statusPlay > 0) {
                statusPlay -= 1;
                client.user.setActivity("on morphex.aternos.me!")
            } else {
                statusPlay += 1;
                client.user.setActivity("m!help")
            }
        }, 10000)
}

/*
How to commit and update real app:
1: git status
1: git add . && git commit -m "Commit title"
2. git push origin master
3. heroku local
4. git push heroku master
*/