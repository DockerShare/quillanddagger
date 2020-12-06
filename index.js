const Discord = require("discord.js");
const MessageAttachment = require("discord.js");
const config = require("./config.json");
const authorNames = require("./generateAuthorName");
const fs = require('fs');
const https = require('https');

const registeredUsers = {};

const prefix = "!";
const client = new Discord.Client();


const abgabeschluss = new Date('December 31, 2020 23:59:00');
const themaAusgabe = new Date('December 9, 2020 23:59:00');
const bewertungschluss = new Date('January 7, 2021 23:59:00');
const thema = "Jeder Mensch hat bei der Geburt eine Chance von 1:1.000.000 eine Affinität für Magie zu besitzen. Auf Grund der politischen und strategischen Wichtigkeit dieser 'Milos' gennanten Menschen werden sie massiv unter Druck gesetzt und gezwungen ab einem Alter von 12 Jahren in die Streitkräfte ihres jeweiligen Landes einzutreten.";

authorNames.loadUsedNames();
loadRegisteredUsers();

client.on("message", function(message) {
    if (message.author.bot) return;
    if(message.channel.type != 'dm') return;
    if (message.content.startsWith(prefix)){
        const commandBody = message.content.slice(prefix.length);
        const args = commandBody.split(' ');
        const command = args.shift().toLowerCase();
        switch(command){
            case "register":
                if(new Date() > themaAusgabe){
                    message.reply("Die Anmeldezeit ist leider vorbei...")
                }
                if(registeredUsers[message.author.id] != null){
                    message.reply("Du bist schon registriert als: " +registeredUsers[message.author.id] + "!");
                    return;
                }         
    
                let authorID = message.author.id;
                let authorName = authorNames.getName();
                registeredUsers[authorID] = authorName;
                fs.appendFileSync("./Files/authorData.txt", authorID+"="+authorName+"|"+message.author.username);
                message.reply("Registriert als: " + authorName + "!");
                message.reply("Regeln:\n1. Schreibe bis zum 31.12 eine Kurzgeschichte (ca. 3-10 Seiten) und schicke sie im odt-Format an diesen Bot\n2. Die Anmeldung läuft bis zum 09.12 23:59. Am Tag darauf wird das Thema bekanntgegeben. Die Geschichte MUSS sich an dieses Thema halten. Alles was jedoch nicht explizit erwähnt wird, darf durch den Autor individuell interpretiert werden.\n3. Nach dem Einsendeschluss wird deine Geschichte an alle Teilnehmer geschickt und von diesen gelesen und bewertet.\n" 
                + "4. Deine Geschichte braucht eine Titelseite. Auf dieser steht der Titel deiner Kurzgeschichte, sowie dein Alias (WICHTIG: Nur dein Alias! Die Bewertung soll anonym erfolgen. Von wem welche Geschichte ist wird erst bei der Bekanntgabe der Ergebnisse veröffentlicht)\n5. Bis zum Einsendeschluss kannst du beliebig oft abgeben. Deine letzte Abgabe zählt.\n\n##Dies ist der erste Druchlauf. Die Chancen stehen gut, dass nicht alles so funktioniert wie es soll. Bei Fragen melde dich bitte bei CookieJ4R#4781");
                break;
            case "bewertung":
                if(new Date() < abgabeschluss){
                    message.reply("Bitte warte bis die Abgabefrist verstrichen ist...");
                    return;
                }
                if(new Date() > bewertungschluss){
                    message.reply("Die Bewertungszeit ist vorbei");
                    return;
                }
                if(registeredUsers[message.author.id] == null){
                    message.reply("Leider scheinst du diesesmal nicht teilgenommen zu haben.");
                    return;
                }if(message.attachments.size == 0){
                    message.reply("Bitte hänge eine Datei an!");
                    return;
                }
                else if(message.attachments.size > 1){
                    message.reply("Bitte hänge nur eine einzige Datei an!");
                    return;
                }
                if(message.attachments.first().name.split('.').pop() != "odt"){
                    message.reply("Bitte hänge eine odt-Datei an!");
                    return;
                }
                download(message.attachments.first().url, "./Files/Bewertungen/" + registeredUsers[message.author.id] + ".odt")
                message.reply("Bewertung erfolgreich!");
                break;
            case "endcontest":
                if(message.author.id.toString() != "197448955288748032") return;
                var files = fs.readdirSync('./Files/Abgaben');
                Object.keys(registeredUsers).forEach(autor => {
                    var id = autor;
                    var name = registeredUsers[autor];
                    client.users.cache.get(id).send("Die Abgabezeit ist vorbei! Hier sind die Arbeiten der anderen Autoren!\nBitte lese sie gut durch und schreibe in EIN .odt Dokument kleine Kritiken & Bewertungen (0-10) zu den Arbeiten\n")
                    client.users.cache.get(id).send("Beispiel:\nAutor der Geschichte: SleepySquirrel\nStory: Ich und meine Nuss\nDie Arbeit war super. Die Charaktere waren sehr gut durchdacht und lebhaft. Besonders gefallen hat mir die Nuss. Nur die Welt war langweilig aufgebaut. Ich würde vorschlagen, dass die Auswirkungen der Nussokalypse noch mehr verdeutlicht werden.\nBewertung: 8/10");
                    client.users.cache.get(id).send("Abgeben kannst du mit '!bewertung' und der Einsendeschluss für die Bewertungen ist der 07.01.2021 23:59");
                    for(var i = 0; i < files.length; i++){
                        if(files[i].split('.')[0] == name){
                            continue;
                        }
                        let attachment = new Discord.MessageAttachment("./Files/Abgaben/" + files[i]);
                        try{
                        client.users.cache.get(id).send(attachment)
                        }catch(exception){}
                    }
                })
                break;
            case "announcetheme":
                if(message.author.id.toString() != "197448955288748032") return;
                Object.keys(registeredUsers).forEach(autor => {
                    client.users.cache.get(autor).send("Das Thema/Setting der Geschichte ist: " + thema+ "\n");
                })
                break;
            case "getabgaben":
                if(message.author.id.toString() != "197448955288748032") return;
                try{var files = fs.readdirSync('./Files/Abgaben');
                    for(var i = 0; i < files.length; i++){
                        let attachment = new Discord.MessageAttachment("./Files/Abgaben/" + files[i]);
                        try{
                        client.users.cache.get(message.author.id).send(attachment);
                        }catch(exception){}
                    }
                }catch(exception){}
                break;
            case "getbewertungen":
                if(message.author.id.toString() != "197448955288748032") return;
                try{
                var files = fs.readdirSync('./Files/Bewertungen');
                    for(var i = 0; i < files.length; i++){
                        let attachment = new Discord.MessageAttachment("./Files/Bewertungen/" + files[i]);
                        try{
                        client.users.cache.get(message.author.id).send(attachment);
                        }catch(exception){}
                    }
                }catch(exception){}
                break;
            case "getautors":
                if(message.author.id.toString() != "197448955288748032") return;
                let attachment = new Discord.MessageAttachment("./Files/authorData.txt");
                try{
                    client.users.cache.get(message.author.id).send(attachment);
                }catch(exception){}
                break;
        }
    }else if(message.attachments.size > 0){
        if(new Date() > abgabeschluss){
            message.reply("Die Abgabefrist ist leider verstrichen");
            return;
        }
        if(registeredUsers[message.author.id] == null){
            message.reply("Bitte erst registrieren mit !register");
            return;
        }else if(message.attachments.size > 1){
            message.reply("Bitte hänge nur eine einzige Datei an!");
            return;
        }
        if(message.attachments.first().name.split('.').pop() != "odt"){
            message.reply("Bitte hänge eine odt-Datei an!");
            return;
        }
        download(message.attachments.first().url, "./Files/Abgaben/" + registeredUsers[message.author.id] + ".odt")
        message.reply("Abgabe erfolgreich!");
    }
    

  });

client.login(process.env.QAD_BOT);

function download(url, dest) {
    var file = fs.createWriteStream(dest);
    https.get(url, function(response) {
      response.pipe(file);
      file.on('finish', function() {
        file.close();
      });
    });
  }

function loadRegisteredUsers(){
    try{
    var text = fs.readFileSync("./Files/authorData.txt").toString();
    var textByLine = text.split("\n")
    for(var i = 0; i < textByLine.length; i++){
        var userPair = textByLine[i].split("|")[0].split("=");
        console.log(userPair[0] + " " + userPair[1]);
        registeredUsers[userPair[0]] = userPair[1];
    }
    }catch(exception){}
}