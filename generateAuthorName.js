const { randomInt } = require("crypto");
const fs = require('fs');
var prefix = ["Sneaky", "Speedy", "Slow", "Creepy", "Sad", "Brave", "Crazy", "Primitive", "Spoiled", "Charming", "Old"];
var suffix = ["Horse", "Lizard", "Ape", "Maggot", "Pirate", "Shark", "Sponge", "Crab", "Pizza", "Chicken", "Bread", "Robot"];

var usedNames = [];

function loadUsedNames(){
    try{
    var text = fs.readFileSync("./Files/authorData.txt").toString();
    usedNames = text.split(",");
    }catch(exception){}
}

function getName(){
    var nameUsed = false;
    do {
        nameUsed = false;
        var prefixID = Math.floor(Math.random() * prefix.length);
        var suffixID = Math.floor(Math.random() * suffix.length);
        var AuthorName = prefix[prefixID] + suffix[suffixID];
        console.log(prefixID + " " + suffixID + " " + AuthorName);
        for(var i = 0; i < usedNames.length; i++){
            if(AuthorName == usedNames[i]){
                nameUsed = true;
                break;
            }
        }
    } while (nameUsed);
    usedNames.push(AuthorName);
    var names = "";
    for(var i = 0; i < usedNames.length; i++){
        names = usedNames[i] + ",";
    }
    names = names.slice(0, names.length - 1);
    fs.writeFileSync("./Files/usedNames.txt", names);
    return AuthorName;
    
}

module.exports.loadUsedNames = loadUsedNames;
module.exports.getName = getName;