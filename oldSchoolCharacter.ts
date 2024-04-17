import { writableStreamFromWriter } from "https://deno.land/std@0.167.0/streams/mod.ts";
import { Client} from "https://deno.land/x/mysql/mod.ts";
import * as mod from "https://deno.land/std@0.167.0/datetime/mod.ts";
import {
    error,
    success,
    warning,
    errorLog,
    successLog,
    warningLog,
  } from 'https://deno.land/x/colorlog/mod.ts';

//const client = await new Client().connect({});

/**
 * Opens a connection to the mySQL server
 */
const client = await new Client().connect({
    hostname: "localhost",
    username: "root",
    //db: "jcr1046",
    password: "jcr52501",
    //db: "jcr1046",
  });
  //await client.connect();
  //const array_result = await client.query("USE jcr1046;");
  //console.log(array_result.rows);

  //await client.query("USE jcr1046;");
  await client.execute("USE jcr1046");
  //await client.execute("CREATE TABLE test6 (Nums int);");
  //console.log(users);
  //console.log("here");

/**
 * This is a program which simulates a player of Old School Runescape.
 * This program is a work in progress and will likely become my final project.
 */


/**
 * The following code gets the quest descriptions from the Old School RuneScape wiki.
 */
const fileResponse = await fetch("https://oldschool.runescape.wiki/w/Cook%27s_Assistant");
const fileResponse2 = await fetch("https://oldschool.runescape.wiki/w/Sheep_Shearer");
const fileResponse3 = await fetch("https://oldschool.runescape.wiki/w/Dragon_Slayer_I");

let cookString = "";
let sheepString = "";
let dragonString ="";

//Uses the Fetch API to get a response for Cook's Assistant Quest
if (fileResponse.body) {
    const file = await Deno.open("./Cook's_Assistant", { write: true, create: true });
    const writableStream = writableStreamFromWriter(file);
    await fileResponse.body.pipeTo(writableStream);
    const text:string = await Deno.readTextFile("./Cook's_Assistant");
    ////console.log(text);
    let ind = text.indexOf(">Description</th><td class=\"questdetails-info\">");
    let subText = text.substring(ind);
    let subsubText = subText.substring(47, subText.indexOf("</td></tr><tr><th class=\"questdetails-header\">"));
    //console.log("Cook's Assistant Description: " + subsubText);
    cookString = subsubText;
    await Deno.remove("./Cook's_Assistant");
  }

//Uses the Fetch APU to get a reponse for the description of Sheep Shearer
if (fileResponse2.body) {
    const file = await Deno.open("./Sheep_Shearer", { write: true, create: true });
    const writableStream = writableStreamFromWriter(file);
    await fileResponse2.body.pipeTo(writableStream);
    const text:string = await Deno.readTextFile("./Sheep_Shearer");
    ////console.log(text);
    let ind = text.indexOf(">Description</th><td class=\"questdetails-info\">");
    let subText = text.substring(ind);
    let subsubText = subText.substring(47, subText.indexOf("</td></tr><tr><th class=\"questdetails-header\">"));
   // console.log("Sheep Shearer Description: " + subsubText);
    sheepString = subsubText;
    await Deno.remove("./Sheep_Shearer");
    //file.close();
  }

  //For Dragon Slayer
  if (fileResponse3.body) {
    const file = await Deno.open("./Dragon_Slayer_I", { write: true, create: true });
    const writableStream = writableStreamFromWriter(file);
    await fileResponse3.body.pipeTo(writableStream);
    const text:string = await Deno.readTextFile("./Dragon_Slayer_I");
    ////console.log(text);
    let ind = text.indexOf(">Description</th><td class=\"questdetails-info\">");
    let subText = text.substring(ind);
    let subsubText = subText.substring(47, subText.indexOf("</td></tr><tr><th class=\"questdetails-header\">"));
   // console.log("Sheep Shearer Description: " + subsubText);
    dragonString = subsubText;
    await Deno.remove("./Dragon_Slayer_I");
    //file.close();
  }
  const RegularExpression: RegExp =/cook/;
  //console.log("RegExp Test1: " + RegularExpression.test(cookString));

  const SheepExpression: RegExp =/sheep/;
  //console.log(SheepExpression.exec(sheepString));
  //console.log(sheepString.match(SheepExpression));
  let newSheep = sheepString.replace(SheepExpression, "clams");
  //console.log("New String post replace method: " + newSheep);


/**
 * Keeps track of the player's skills
 */
class Skill {
    skillName: string;
    level: number;
    xp: number
    constructor(name:string) {
        this.level = 1;
        this.xp = 0;
        this.skillName = name;
    }

    /**
     * Gets the level of a player's skill
     * @returns Skill Level
     */
    getLevel() {
        return this.level;
    }

    /**
     * returns the XP held by a skill
     * @returns XP Level
     */
    getXP() {
        return this.xp;
    }

    /**
     * Returns the skill name
     * @returns Skill Name
     */
    getName() {
        return this.skillName;
    }

    /**
     * Increases the XP of the skill, and also increases the skill's level
     * @param amount 
     */
    increaseXP(amount: number) {
        this.xp += amount;
        this.level = this.xp/100;
    }
}

/**
 * Hold's information on Quests
 */
class Quest {
    xpGranted: number;
    questName: string;
    status: boolean;
    description: string;
    

    constructor(name: string, xp: number, description: string) {
        this.xpGranted = xp;
        this.questName = name;
        this.status = false; //true for complete, false for incomplete;
        this.description = description;
        
    }

    //completes the quest
    questComplete(skill: Skill) {
        successLog("QUEST COMPLETE - " + this.questName);
        skill.increaseXP(this.xpGranted);
        this.status = true;
    }

    startQuest() {
        console.log(this.questName + " Started!");
        console.log(this.description);
        if (this.questName == "Cook's Assistant") {
            startCook(currentPlayer);
        }
        if (this.questName == "Sheep Shearer") {
            startSheep(currentPlayer);
        }
        

    }
}

/**
 * Hold information on the player
 */
class Player {
    questsCompleted: Array<Quest>;
    questsOngoing:number
    attack: Skill;
    inventory: Array<Item>
    username: string;

    constructor(username: string) {
        this.attack = new Skill("Attack");
        this.questsCompleted = [];
        this.questsOngoing = 0;
        this.inventory = new Array<Item>;
        this.username = username;
    }

    getName() {
        return this.username;
    }

    //Starts a quest
    startQuest(testQuest: Quest) {
        testQuest.startQuest();
        this.questsOngoing++;
    }

    //completes a quest
    completeQuest(testQuest:Quest) {
        testQuest.questComplete(this.attack);
        this.questsCompleted.push(testQuest);
    }

    //adds an item to players inventory
    addToInventory(demoItem: Item) {
        this.inventory.push(demoItem);
    }

    //drops an item from the inventory
    drop(demoItem: Item) {
        for (let i =0; i < this.inventory.length; i++) {
            if (this.inventory[i].itemName == demoItem.itemName) {
                this.inventory.splice(i);
                break;
            }
        }
    }

    //returns the inventory
    getInventory() {
        return this.inventory;
    }
}

interface Item {
    itemName: string;
    itemValue: number;
}

class QuestItems implements Item {
    itemName: string;
    itemValue:number;

    constructor(name:string) {
        this.itemName = name;
        this.itemValue = 0;
    }
}

class Weapon implements Item {
    itemName: string;
    itemValue: number;

    constructor(name: string) {
        this.itemName = name;
        this.itemValue = 0;
    }
}

interface Spell {
    magicSkillRequired: number;
    runesRequired: Array<string> 
    spellName: string;
}

class TeleportSpell implements Spell {
    magicSkillRequired: number;
    runesRequired:Array<string>
    spellName: string;
    constructor(spellName: string, skillRequired: number, runesRequired: Array<string>) {
        this.magicSkillRequired = skillRequired;
        this.runesRequired = runesRequired;
        this.spellName = spellName;
    }
}

enum Rune {
    Fire = "Fire", Air = "Air", Water = "Water", Nature= "Nature", Chaos = "Chaos", Mind = "Mind"
}


/**
 * This starts the cook's assistant quest and outputs everything to the console.
 * @param player 
 */
function startCook(player: Player) {
    
    //The three items the player needs to collect.
    const flour = new QuestItems("flour");
    const milk = new QuestItems("Bucket of Milk");
    const egg = new QuestItems("egg");

    //The initial quest dialogue
    console.log("Cook:  What am I to do?");
        console.log("Cook: Oh dear, oh dear, oh dear, I'm in a terrible terrible mess! It's the Duke's birthday today, and I should be making him a lovely big birthday cake.\n");
        console.log("Cook: I've forgotten to buy the ingredients. I'll never get them in time now. He'll sack me! What will I do? I have four children and a goat to look after. Would you help me? Please?\n");
        console.log(player.getName() + ": Yes, I'll help you.\n");
        console.log("Cook: Oh thank you, thank you. I need milk, an egg and flour. I'd be very grateful if you can get them for me.\n");
        console.log(player.getName() + ": So where do I find these ingredients then?\n");
        console.log("Cook: There is a Mill fairly close, go North and then West. Mill Lane Mill is just off the road to Draynor. I usually get my flour from there.\n");
        console.log("Cook: There is a cattle field on the other side of the river, just across the road from the Groats' Farm\n");
        console.log("Cook: I normally get my eggs from the Groats' farm, on the other side of the river.\n");
        console.log(player.getName() + ": I've got all the information I need. Thanks.\n");
        let location = "";

        //Starts asking the player for the location that they would like to visit.
        while (1==1) {
            while (1==1) {
                location = prompt("Which location would you like to go to?\n[0] - Mill Lane Mill\n[1] - Cattle Field\n[2] - Groat's Farm\n[3] - Back to the cook\nSelection: ") +"";
                if (!(location == "0" || location == "1" || location == "2" || location == "3")) {
                    errorLog("Input invalid, please select a proper option");
                }
                else {break;}
            }
            if (location == "0") {
                //checks if the player has already gotten the flour
                if (player.getInventory().includes(flour)) {
                    errorLog("You already have the flour!");
                } else {
                console.log("Welcome to Mill Lane Mill...");
                let answer = "";
                    while(1==1) {
                        answer = prompt("Take pot of flour? [y/n]") + "";
                        if (!(answer == "y" || answer == "n")) {
                            errorLog("Input invalid, please select a proper option");
                        } else if (answer == "n") {
                            errorLog("You will need the flour to complete the quest!");
                        } else {console.log("You add the flour to your inventory!")
                            break;
                        } 
                    }
                    player.addToInventory(flour);
                }
            }
            
            if (location == "1") {
                if (player.getInventory().includes(milk)) {
                    errorLog("You already have the milk!");
                }
                else {
                    console.log("Welcome to The Cattle Field...");
                let answer = "";
                while(1==1) {
                    answer = prompt("Milk Cow? [y/n]") + "";
                    if (!(answer == "y" || answer == "n")) {
                        errorLog("Input invalid, please select a proper option");
                    } else if (answer == "n") {
                        errorLog("You will need the milk to complete the quest!");
                    } else {console.log("You add the Bucket of Milk to your inventory!")
                        break;
                    } 
                }
                player.addToInventory(milk);
            }
        }

            if (location == "2") {
                if (player.getInventory().includes(egg)) {
                    errorLog("You already have the egg!");
                } else {
                    console.log("Welcome to Groat's Farm...");
                    let answer = "";
                    while(1==1) {
                        answer = prompt("Kill Chicken? [y/n]") + "";
                        if (!(answer == "y" || answer == "n")) {
                            errorLog("Input invalid, please select a proper option");
                        } else if (answer == "n") {
                            errorLog("You will need the egg to complete the quest!");
                        } else {console.log("You kill the chicken and add an egg to your inventory!")
                            break;
                        } 
                    }
                    player.addToInventory(egg);
                }
            }

            //checks if the player has gotten all three items. If they have, the quest completes. If they have not, the player is forced to go get them.
            if (location == "3") {
                if (player.getInventory().includes(egg) && player.getInventory().includes(flour) && player.getInventory().includes(milk)) {
                    console.log("Cook: Wow You Have Everything!\n");
                    player.completeQuest(cooksAssistant);
                    for (let i =0; i < unfinishedQuests.length; i++) {
                        if (unfinishedQuests[i] == cooksAssistant) {
                            unfinishedQuests.splice(i,1);
                        }
                    }
                    break;
                } else {
                    console.log("Cook: You do not have everything, please go get all of my items\n");
                }
            }
            client.execute("UPDATE " + userName + " SET CooksAssistantCompleted = 1 WHERE CooksAssistantCompleted = 0;");
        }

    /*setTimeout(function(){
        console.log(player +": What's wrong?");
    }, 1000);
    setTimeout(function(){
        console.log(player +": What's wrong?");
    }, 1000);
    setTimeout(function(){
        console.log(player +": What's wrong?");
    }, 1000);
    setTimeout(function(){
        console.log(player +": What's wrong?");
    }, 1000);*/
}

//Starts the sheep shearer quest, using Regular Expressions!
function startSheep(player:Player) {
    console.log("Fred the Farmer: What are you doing on my land? You're not the one who keeps leaving all my gates open and letting out all my sheep, are you?");
    console.log(userName + ": I'm looking for a quest.");
    console.log("Fred the Farmer: You're after a quest, you say? Actually, I could do with a bit of help.\nFred the Farmer: My sheep are getting mighty woolly. I'd be much obliged if you could shear them. And while you're at it, spin the wool for me too.");
    console.log(userName + ": I will bring you 20 balls of wool.");
    console.log(userName + " goes into the sheep field, solve the puzzle to sheer sheep");
    let puzzleString = "In the beginning when God created the heavens and the earth, the earth was a formless void and darkness covered the face of the deep, while a wind from God swept over the face of the waters. Then God said, \"Let there be light\"; and there was light. And God saw that the light was good; and God separated the light from the darkness.\n";
    let test = false;
    const wool = new QuestItems("wool");
    const ballOfWool = new QuestItems("Ball of Wool");
    
    //This runs the first puzzle, which asks the user to type in a word from the provided text
    while (1==1) {
        console.log(puzzleString);
        let answer = prompt("Type a word from the previous text: ") + "";
        const RegularExpression: RegExp =new RegExp(answer);
        if (RegularExpression.test(puzzleString)) { //Uses regular expressions to match the input with the quote.
            console.log("Correct Answer!");
            break;
        } else {
            console.log("Incorrect answer, please try again");
        }
    }
    for (let i =0; i < 6; i++) {
        player.addToInventory(wool);
    }
    console.log("You have collected 6 pieces of wool");
    
    //puzzle in which the player has to select the right choice to replace music in the John Lennon Quote
    puzzleString = "Music is what happens when you’re busy making other plans. - John Lennon"
    while(1==1) {
        console.log(puzzleString);
        console.log("The above quote is incorrect, replace music with the correct word");
        console.log("(0) - Life, (1) - Water, (2) - Art");
        let answer = prompt("Select the number which corresponds to the correct word: ") + "";
        if (!(answer == "0" || answer == "1" || answer == "2")) {
            console.log("Invalid Input please try again");
        } else {
            const ansNum = parseInt(answer);
            if (ansNum == 0) {
                const RegularExpression: RegExp = new RegExp("Music");
                RegularExpression.exec(puzzleString);
                puzzleString = puzzleString.replace(RegularExpression, "Life"); // replaces music with Life and matches it to the quote.
                if (puzzleString == "Life is what happens when you’re busy making other plans. - John Lennon") {
                    console.log(puzzleString);
                    console.log("Correct Answer!");
                    break;
                }

            }else {
                console.log("Wrong Answer");
            }
        }
    }
    for (let i =0; i < 6; i++) {
        player.addToInventory(wool);
    }
    console.log("You have collected more 6 pieces of wool, you now have 12");

    //puzzleString = "Why she had to go? I don't know, she wouldn't say. I said something wrong. Now I long for yesterday.";

    //This puzzle the user has to type in the word which appears 3 times. The answer is I
    while(1==1) {
        puzzleString = "Why she had to go? I don't know, she wouldn't say. I said something wrong. Now I long for yesterday.";
        console.log(puzzleString);
        let answer = ";"
        answer = prompt("What word appears in the above string 3 times: ") + "";

        //Regular expression takes the users answer, replaces that word in the original text with rainbow, and sees if rainbow appears three times in the quote.
        const RegularExpression:RegExp = new RegExp(answer);
        RegularExpression.exec(puzzleString);
        puzzleString = puzzleString.replace(RegularExpression,"rainbow");
        puzzleString = puzzleString.replace(RegularExpression,"rainbow");
        puzzleString = puzzleString.replace(RegularExpression,"rainbow");
        console.log (puzzleString);
        if (puzzleString.indexOf("rainbow") != -1) {
            puzzleString = puzzleString.substring(puzzleString.indexOf("rainbow") + 1);
            puzzleString = puzzleString.substring(puzzleString.indexOf("rainbow") + 1);
            if (puzzleString.indexOf("rainbow") != -1) {
                break;
            }
        }
        console.log("Wrong Answer!");

    }

    

    for (let i =0; i < 8; i++) {
        player.addToInventory(wool);
    }
    console.log("You have collected more 5 pieces of wool, you now have 20");

    console.log("Complete the puzzle to spin all wool into balls of wool");

    //Asks the user to type one word from the pledge of allegiance.
    while(1==1) {
        puzzleString = "I pledge allegiance to my Flag and to the Republic for which it stands: one Nation indivisible, with Liberty and Justice for all. ";
        puzzleString = puzzleString.toLowerCase();
        let answer = prompt("Type one word from the Pledge of Allegiance: ") + "";
        let RegularExpression = RegExp(answer);
        RegularExpression.exec(puzzleString);
        if (RegularExpression.test(puzzleString)) {
            console.log("Correct Answer!");
            break;
        }
        console.log("Wrong Anwser");
    }

    if (player.inventory.length == 20) {
        for (let i =0; i < player.inventory.length;i++) {
            player.inventory[i] = ballOfWool;
        }
    }

    console.log("Farmer Fred: Thank You for bringing me all 20 balls of wool!");
    player.completeQuest(sheepShearer);
    client.execute("UPDATE " + userName + " SET SheepShearerCompleted = 1 WHERE SheepShearerCompleted = 0;");
    for (let i =0; i < unfinishedQuests.length; i++) {
        if (unfinishedQuests[i] == sheepShearer) {
            unfinishedQuests.splice(i,1);
        }
    }

}

function startDragon(player:Player) {

}

//Beginning of the program
console.log("Welcome To RuneScape!");
let userName: string = "";
let newUser:string = prompt("New User or Login? (1 for new user, 2 for login)") +"";
let fail = false;
let currentPlayer: Player;
let cooksAssistant: Quest;
let sheepShearer: Quest;
let DragonSlayer:Quest;
let unfinishedQuests: Array<Quest>;
let sheepStatus = 0;
let cookStatus = 0;
let dragonStatus = 0;
let quitBool = false;
//Prompts the user to either login or create a new user
while (1==1) {
    if (newUser == "2") {
        //console.log("This feature is not yet working, please create a new user!");
        let available;
        userName = prompt("Please enter your username: ") + "";

        //Pings the mySQL server to discover if the name is already in use
        available = client.query("CREATE TABLE IF NOT EXISTS " + userName + "(CooksAssistantCompleted int, SheepShearerCompleted int, DragonSlayerCompleted int)");
        let result;
        let userExist = await client.query("select CooksAssistantCompleted from " + userName);
        //let test = JSON.parse(userExist);
        let test = JSON.stringify(userExist).substring(28,29);
        let cookDone;
        let sheepDone;
        let dragonDone;
        console.log(test);
        if (test == "1") {
            cookDone = true;
            cookStatus = 1;
        }
        userExist = await client.query("select SheepShearerCompleted from " + userName);
        test = JSON.stringify(userExist).substring(57,58);
        console.log(test);
        if (test == "1") {
            sheepDone = true
            sheepStatus = 1
        }

        userExist = await client.query("select DragonSlayerCompleted from " + userName);
        test = JSON.stringify(userExist).substring(88,89);
        console.log(test)
        if (test == "1") {
            dragonDone = true;
            dragonStatus = 1;
        }

        if ((!dragonDone && !sheepDone && !cookDone)) {
            console.log("Sorry, this user does not exists. Starting a new account");
            newUser = "1";
            //fail = true;
            break;
        }
        break;
    }
    else if (newUser = "1") {
        //Creates a new user
        console.log("Welcome To RuneScape!");
        userName = prompt("Please pick a username: ") + "";
          //await client.execute("CREATE TABLE test9 (Nums int);");
        
        //SQL
        
        //creates a table with the inputted username.
        let available;
        available = client.query("CREATE TABLE IF NOT EXISTS " + userName + "(CooksAssistantCompleted int, SheepShearerCompleted int, DragonSlayerCompleted int)");
        //let availableCook = client.query("select CooksAssistantCompleted from " + userName);
        //let err: Error = new Error;
        
        //Pulls the information in JSON format, stringifies it, then looks for the correct value at the specified substring
        let result;
        let userExist = await client.query("select CooksAssistantCompleted from " + userName);
        //let test = JSON.parse(userExist);
        let test = JSON.stringify(userExist).substring(28,29);
        let cookDone;
        let sheepDone;
        let dragonDone;
        if (test == "1") {
            cookDone = true;
        }

        //Pulls the information in JSON format, stringifies it, then looks for the correct value at the specified substring
        userExist = await client.query("select SheepShearerCompleted from " + userName);
        test = JSON.stringify(userExist).substring(57,58);
        console.log(test);
        if (test == "1") {
            sheepDone = true
        }

        //Pulls the information in JSON format, stringifies it, then looks for the correct value at the specified substring
        userExist = await client.query("select DragonSlayerCompleted from " + userName);
        test = JSON.stringify(userExist).substring(88,89);
        console.log(test)
        if (test == "1") {
            dragonDone = true;
        }

        if (dragonDone || sheepDone || cookDone) {
            errorLog("Sorry, this user already exists. Please choose a new name or login");
            fail = true;
            break;
        }
        //let result;

        //inserts 0 values for each quest into the table.
        await client.execute("INSERT INTO " + userName + "(CooksAssistantCompleted) VALUES (0)");
        await client.execute("INSERT INTO " + userName + "(SheepShearerCompleted) VALUES (0)");
        await client.execute("INSERT INTO " + userName + "(DragonSlayerCompleted) VALUES (0)");
        
        break;
    }
}

if (fail) {

} else {

cooksAssistant = new Quest("Cook's Assistant", 4, cookString);
sheepShearer = new Quest("Sheep Shearer", 5, sheepString);
DragonSlayer = new Quest("Dragon Slayer", 50, dragonString);

unfinishedQuests = new Array<Quest>;
if (newUser == "1") {
    unfinishedQuests.push(cooksAssistant);
    unfinishedQuests.push(sheepShearer);
    //unfinishedQuests.push(DragonSlayer);
} else {
    if (sheepStatus == 0) {
        unfinishedQuests.push(sheepShearer);
    }
    if (cookStatus == 0) {
        unfinishedQuests.push(cooksAssistant);
    }
    if (dragonStatus == 0) {
        //unfinishedQuests.push(DragonSlayer);
    }
}

//Creates a new player with the specified Username and welcomes the player
currentPlayer = new Player(userName);
console.log("Welcome " + currentPlayer.username +"!");

while (1==1) {
    if (unfinishedQuests.length == 0) {
        break;
    }


//Prints out the quests that are not started
console.log("Quests Not Started: ");
for (let i =0; i < unfinishedQuests.length; i++) {
    console.log("["+i+"]" + " " + unfinishedQuests[i].questName);
}
console.log("[" + "4" + "] - Quit");
let selectedQuest = "";
    while(1==1) {
        selectedQuest = prompt("Select Quest Number to Play: ") + "";
        if(isNaN(parseInt(selectedQuest))) {
            console.log("Invalid Input, please try again!");
        } else if(parseInt(selectedQuest) < unfinishedQuests.length && parseInt(selectedQuest) >= 0) {
            console.log("Selected: " + unfinishedQuests[parseInt(selectedQuest)].questName);
            if(unfinishedQuests[parseInt(selectedQuest)] == cooksAssistant) {
                await client.execute("UPDATE " + userName + " SET CooksAssistantCompleted = 1 WHERE CooksAssistantCompleted = 0;");
                console.log("Saving Data");
            }
            if(unfinishedQuests[parseInt(selectedQuest)] == sheepShearer) {
                await client.execute("UPDATE " + userName + " SET SheepShearerCompleted = 1 WHERE SheepShearerCompleted = 0;");
                console.log("Saving Data");
            }
            if(unfinishedQuests[parseInt(selectedQuest)] == DragonSlayer) {
                await client.execute("UPDATE " + userName + " SET DragonSlayerCompleted = 1 WHERE DragonSlayerCompleted = 0;");
                console.log("Saving Data");
            }
            unfinishedQuests[parseInt(selectedQuest)].startQuest();
            break;
        } else if (selectedQuest == "4"){
            console.log("Thanks for playing, your information has been saved.");
            quitBool = true;
            break;
        }
        else {
            console.log("Invalid Quest, please try again!");
        }
    }
    if (quitBool)
    break;
    
}

//If the user chooses to quit, they are prompted to exit the game.
if (!quitBool) {
    console.log("You have won the game!");
    prompt("Press Enter to Close");
    await client.close();
}
}
//await client.close();


//testing
//startCook(currentPlayer);
//console.log(currentPlayer.getInventory());


