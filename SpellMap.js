var canvas = document.getElementById("SpellMap");
var ctx = canvas.getContext("2d");

console.clear();

var mouseX, mouseY;

var createCookie = function(name, value, days) {
    var expires;
    if (days) {
        var date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
        expires = "; expires=" + date.setFullYear(expiration_date.getFullYear() + 1).toGMTString();
    } else {
        expires = "";
    }
    document.cookie = name + "=" + value + expires + "; path=/";
}

function getCookie(c_name) {
    if (document.cookie.length > 0) {
        c_start = document.cookie.indexOf(c_name + "=");
        if (c_start != -1) {
            c_start = c_start + c_name.length + 1;
            c_end = document.cookie.indexOf(";", c_start);
            if (c_end == -1) {
                c_end = document.cookie.length;
            }
            return unescape(document.cookie.substring(c_start, c_end));
        }
    }
    return "";
}

var mode = "move";
var addSelect = "";
var originX = null;
var originY = null;
var xShift = [];
var yShift = [];

var preparedCount = 0;
var cantripCount = 0;
var tokenCount = 0;

var colors = new Map();

colors.set("Abjuration", "deepskyblue");
colors.set("Conjuration", "gold");
colors.set("Divination", "darkgrey");
colors.set("Enchantment", "hotpink");
colors.set("Evocation", "crimson");
colors.set("Illusion", "purple");
colors.set("Necromancy", "green");
colors.set("Transmutation", "tan");

var menuSchool = "Abjuration";

function spell(name, school, level, x, y) {
    this.name = name;
    this.school = school;
    this.level = level;
    this.x = x;
    this.homeX = x;
    this.y = y;
    this.homeY = y;
    this.r = 10;
    this.held = false;
    this.whitelist = [];
    this.token = false;
    this.highlight = false;
}

function spellDraw(spell) {
    ctx.beginPath();
    ctx.arc(spell.x, spell.y, spell.r, 0, 2 * Math.PI, false);
    ctx.fillStyle = colors.get(spell.school);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(spell.x + spell.r / 3, spell.y - spell.r / 3, spell.r / 3, 0, 2 * Math.PI, false);
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.fill();
    ctx.beginPath();
    ctx.arc(spell.x + spell.r / 2, spell.y - spell.r / 2, spell.r / 7, 0, 2 * Math.PI, false);
    ctx.fillStyle = 'white';
    ctx.fill();
    if (spell.token) {
        ctx.fillStyle = "orange";
        ctx.beginPath();
        ctx.moveTo(spell.x, spell.y - 6);
        ctx.lineTo(spell.x + 5, spell.y - 3);
        ctx.lineTo(spell.x + 5, spell.y + 3);
        ctx.lineTo(spell.x, spell.y + 6);
        ctx.lineTo(spell.x - 5, spell.y + 3);
        ctx.lineTo(spell.x - 5, spell.y - 3);
        ctx.fill();
    }
}

function wrapText(context, text, x, y, maxWidth, lineHeight) {
	var words = text.split(' ');
	var line = '';

	for(var n = 0; n < words.length; n++) {
	  var testLine = line + words[n] + ' ';
	  var metrics = context.measureText(testLine);
	  var testWidth = metrics.width;
	  if (testWidth > maxWidth && n > 0) {
	    context.fillText(line, x, y);
	    line = words[n] + ' ';
	    y += lineHeight;
	  }
	  else {
	    line = testLine;
	  }
	}
	context.fillText(line, x, y);
}

function spellLabel(spell) {
	if (spell.highlight) ctx.fillStyle = 'blue';
	else ctx.fillStyle = 'white';
	
	ctx.font = "10px Verdana";
    	ctx.textAlign = "center";
	wrapText(ctx,spell.name,spell.x,spell.y - 20,50,9);
	ctx.fillText("Lvl: " + spell.level, spell.x, spell.y + 20);
}

var spellX = [
	40, 120, 200, 280, 360, 440, 520, 600, 680, 760, 840, 920, 1000, 1080, 1160,
  40, 120, 200, 280, 360, 440, 520, 600, 680, 760, 840, 920, 1000, 1080, 1160,
  40, 120, 200, 280, 360, 440, 520, 600, 680, 760, 840, 920, 1000, 1080, 1160,
  40, 120, 200, 280, 360, 440, 520, 600, 680, 760, 840, 920, 1000, 1080, 1160,
  40, 120, 200, 280, 360, 440, 520, 600, 680, 760, 840, 920, 1000, 1080, 1160
];

var spellY = [
	640, 640, 640, 640, 640, 640, 640, 640, 640, 640, 640, 640, 640, 640, 640,
  700, 700, 700, 700, 700, 700, 700, 700, 700, 700, 700, 700, 700, 700, 700,
  760, 760, 760, 760, 760, 760, 760, 760, 760, 760, 760, 760, 760, 760, 760,
  820, 820, 820, 820, 820, 820, 820, 820, 820, 820, 820, 820, 820, 820, 820, 
    880, 880, 880, 880, 880, 880, 880, 880, 880, 880, 880, 880, 880, 880, 880,
    940, 940, 940, 940, 940, 940, 940, 940, 940, 940, 940, 940, 940, 940, 940 
];

var spells = [];

//Abjuration
var abjuration = [
	["Blade Ward",0],
	["Absorb Elements",1],
	["Alarm",1],
	["Mage Armor",1],
	["Protection from Evil and Good",1],
	["Shield",1],
	["Snare",1],
	["Arcane Lock",2],
	["Counterspell",3],
	["Dispel Magic",3],
	["Glyph of Warding",3],
	["Intellect Fortress",3],
	["Magic Circle",3],
	["Nondetection",3],
	["Protection from Energy",3],
	["Remove Curse",3],
	["Banishment",4],
	["Mordenkainens Private Sanctum",4],
	["Stoneskin",4],
	["Planar Binding",5],
	["Globe of Invulnerability",6],
	["Guards and Wards",6],
	["Symbol",7],
	["Antimagic Field",8],
	["Mind Blank",8],
	["Imprisonment",9],
	["Invulnerability",9],
	["Prismatic Wall",9]
];
for(i = 0; i < abjuration.length; i++) {
	spells[spells.length] = new spell(abjuration[i][0], "Abjuration", abjuration[i][1], spellX[i], spellY[i]);
}
//Conjuration
var conjuration = [
	["Acid Splash",0],
	["Create Bonfire",0],
	["Infestation",0],
	["Mage Hand",0],
	["Poison Spray",0],
	["Sword Burst",0],
    ["Conjure Elemental Mote",1],
    ["Find Familiar",1],
	["Fog Cloud",1],
	["Grease",1],
	["Ice Knife",1],
	["Tensers Floating Disk",1],
	["Unseen Servant",1],
	["Cloud of Daggers",2],
	["Dust Devil",2],
	["Flaming Sphere",2],
	["Flock of Familiars",2],
	["Misty Step",2],
	["Web",2],
    ["Wristpocket",2],
		["Galder's Tower",3],
	["Sleet Storm",3],
	["Stinking Cloud",3],
	["Summon Fey",3],
	["Summon Lesser Demons",3],
	["Summon Shadowspawn",3],
	["Thunder Step",3],
	["Tidal Wave",3],
	["Conjure Minor Elementals",4],
	["Dimension Door",4],
	["Evards Black Tentacles",4],
	["Galders Speedy Courier",4],
	["Leomunds Secret Chest",4],
	["Mordenkainens Faithful Hound",4],
	["Summon Aberration",4],
	["Summon Construct",4],
	["Summon Elemental",4],
	["Summon Greater Demon",4],
	["Watery Sphere",4],
	["Cloudkill",5],
	["Conjure Elemental",5],
	["Far Step",5],
	["Infernal Calling",5],
	["Steel Wind Strike",5],
	["Teleportation Circle",5],
	["Arcane Gate",6],
	["Drawmijs Instant Summons",6],
	["Dream of the Blue Veil", 6],
	["Scatter",6],
	["Summon Fiend",6],
	["Mordenkainens Magnificent Mansion",7],
	["Plane Shift",7],
	["Teleport",7],
	["Demiplane",8],
	  ["Incendiary Cloud",8],
    ["Reality Break",8],
	["Maze",8],
	["Mighty Fortress",8],
	["Blade of Disaster",9],
	["Gate",9],
	["Wish",9]
];
for(i = 0; i < conjuration.length; i++) {
	spells[spells.length] = new spell(conjuration[i][0], "Conjuration", conjuration[i][1], spellX[i], spellY[i]);
}
//Divination
var divination = [
    ["Magecraft",0],
	["True Strike",0],
	["Comprehend Languages",1],
	  ["Detect Magic",1],
    ["Gift of Alacrity",1],
	["Identify",1],
    ["Magewrights Incantation",1],
	["Augury",2],
	  ["Detect Thoughts",2],
    ["Fortunes Favor",2],
	["Locate Object",2],
	["Mind Spike",2],
	["See invisibility",2],
	["Clairvoyance",3],
	["Tongues",3],
	["Arcane Eye",4],
	["Divination",4],
	["Locate Creature",4],
	["Contact Other Plane",5],
	["Legend Lore",5],
	["Rarys Telepathic Bond",5],
	["Scrying",5],
	["True Seeing",6],
	["Foresight",9]
];
for(i = 0; i < divination.length; i++) {
	spells[spells.length] = new spell(divination[i][0], "Divination", divination[i][1], spellX[i], spellY[i]);
}
//Enchantment 
var enchantment = [
	["Encode Thoughts",0],
	["Friends",0],
	["Mind Sliver",0],
	["Charm Person",1],
	["Sleep",1],
	["Tashas Hideous Laughter",1],
	["Crown of Madness",2],
	["Gift of Gab",2],
	["Hold Person",2],
	["Jims Glowing Coin",2],
	["Suggestion",2],
	["Tashas Mind Whip",2],
	["Catnap",3],
	["Enemies Abound",3],
	["Fast Friends",3],
	["Incite Greed",3],
	["Charm Monster",4],
	["Confusion",4],
	["Dominate Person",5],
	["Geas",5],
	["Hold Monster",5],
	["Modify Memory",5],
	["Synaptic Static",5],
	["Mass Suggestion",6],
	["Ottos Irresistible Dance",6],
	["Power Word Pain",7],
	["Antipathy/Sympathy",8],
	["Dominate Monster",8],
	["Feeblemind",8],
	["Power Word Stun",8],
	["Power Word Kill",9],
	["Psychic Scream",9]
];
for(i = 0; i < enchantment.length; i++) {
	spells[spells.length] = new spell(enchantment[i][0], "Enchantment", enchantment[i][1], spellX[i], spellY[i]);
}
//Evocation
var evocation = [
	["Booming Blade",0],
	["Dancing Lights",0],
	  ["Fire Bolt",0],
    ["Force Blast",0],
	["Frostbite",0],
	["Green-Flame Blade",0],
	["Light",0],
	["Lightning Lure",0],
	["Ray of Frost",0],
	["Shocking Grasp",0],
	["Thunderclap",0],
	["Burning Hands",1],
	  ["Chromatic Orb",1],
    ["Concussive Burst",1],
	["Earth Tremor",1],
	["Frost Fingers",1],
	["Jims Magic Missile",1],
	["Magic Missile",1],
	["Tashas Caustic Brew",1],
	["Thunderwave",1],
	["Witch Bolt",1],
	["Aganazzars Scorcher",2],
	["Continual Flame",2],
	["Darkness",2],
	["Gust of Wind",2],
	["Melfs Acid Arrow",2],
	["Scorching Ray",2],
	["Shatter",2],
	["Snillocs Snowball Swarm",2],
	["Warding Wind",2],
	["Fireball",3],
	["Leomunds Tiny Hut",3],
	["Lightning Bolt",3],
	  ["Melfs Minute Meteors",3],
    ["Pulse Wave",3],
	["Sending",3],
	["Wall of Sand",3],
	["Wall of Water",3],
	  ["Fire Shield",4],
    ["Gravity Sinkhole",4],
	["Ice Storm",4],
	["Otilukes Resilient Sphere",4],
	["Sickening Radiance",4],
	["Storm Sphere",4],
	["Vitriolic Sphere",4],
	["Wall of Fire",4],
	["Bigbys Hand",5],
	["Cone of Cold",5],
	["Dawn",5],
	["Immolation",5],
	["Wall of Force",5],
	["Wall of Light",5],
	["Wall of Stone",5],
	["Chain Lightning",6],
	  ["Contingency",6],
    ["Gravity Fissure",6],
	["Otilukes Freezing Sphere",6],
	["Sunbeam",6],
	["Wall of Ice",6],
	["Crown of Stars",7],
	["Delayed Blast Fireball",7],
	["Forcecage",7],
	["Mordenkainens Sword",7],
	["Prismatic Spray",7],
	  ["Whirlwind",7],
    ["Dark Star",8],
	["Maddening Darkness",8],
	["Sunburst",8],
	["Telepathy",8],
	  ["Meteor Swarm",9],
    ["Ravenous Void",9]
];

for(i = 0; i < evocation.length; i++) {
	spells[spells.length] = new spell(evocation[i][0], "Evocation", evocation[i][1], spellX[i], spellY[i]);
}

//Illusion
var illusion = [
    ["Aundairs Silent Sanctum",0],
	["Minor Illusion",0],
	["Color Spray",1],
	["Disguise Self",1],
	["Distort Value",1],
	["Illusory Script",1],
	["Silent Image",1],
	["Blur",2],
	["Invisibility",2],
	["Magic Mouth",2],
	["Mirror Image",2],
	["Nystuls Magic Aura",2],
	["Phantasmal Force",2],
	["Shadow Blade",2],
	["Fear",3],
	["Hypnotic Pattern",3],
	["Major Image",3],
	["Phantom Steed",3],
	["Greater Invisibility",4],
	["Hallucinatory Terrain",4],
	["Phantasmal Killer",4],
	["Creation",5],
	["Dream",5],
	["Mislead",5],
	["Seeming",5],
	["Mental Prison",6],
	["Programmed Illusion",6],
	["Mirage Arcane",7],
	["Project Image",7],
	["Simulacrum",7],
	["Illusory Dragon",8],
	["Weird",9]
];
for(i = 0; i < illusion.length; i++) {
	spells[spells.length] = new spell(illusion[i][0], "Illusion", illusion[i][1], spellX[i], spellY[i]);
}

//Necromancy
var necromancy = [
	  ["Chill Touch",0],
    ["Sapping Sting",0],
	["Toll the Dead",0],
	["Cause Fear",1],
	["False Life",1],
	["Ray of Sickness",1],
	["Blindness/Deafness",2],
	["Gentle Repose",2],
	["Ray of Enfeeblement",2],
	["Animate Dead",3],
	["Bestow Curse",3],
	["Feign Death",3],
	["Life Transference",3],
	["Speak with Dead",3],
	["Spirit Shroud",3],
	["Summon Undead",3],
	["Vampiric Touch",3],
	["Blight",4],
	["Danse Macabre",5],
	["Enervation",5],
	["Negative Energy Flood",5],
	["Circle of Death",6],
	["Create Undead",6],
	["Eyebite",6],
	["Magic Jar",6],
	["Soul Cage",6],
	  ["Finger of Death",7],
    ["Tether Essence",7],
	["Abi-Dalzims Horrid Wilting",8],
	["Clone",8],
	  ["Astral Projection",9],
    ["Time Ravage",9]
];
for(i = 0; i < necromancy.length; i++) {
	spells[spells.length] = new spell(necromancy[i][0], "Necromancy", necromancy[i][1], spellX[i], spellY[i]);
}
//Transmutation
var transmutation = [
	["Control Flames",0],
	["Gust",0],
	["Mending",0],
	["Message",0],
	["Mold Earth",0],
	["Prestidigitation",0],
	["Shape Water",0],
	  ["Catapult",1],
    ["Cause Damage",1],
    ["Emergency Repair",1],
	["Expeditious Retreat",1],
	["Feather Fall",1],
	["Jump",1],
	  ["Longstrider",1],
    ["Magnify Gravity",1],
    ["Repair Damage",1],
	["Alter Self",2],
	["Darkvision",2],
	["Dragons Breath",2],
	["Earthbind",2],
	["Enhance Ability",2],
	  ["Enlarge/Reduce",2],
    ["Immovable Object",2],
	["Knock",2],
	["Levitate",2],
	["Magic Weapon",2],
	["Maximilians Earthen Grasp",2],
	["Pyrotechnics",2],
	["Rope Trick",2],
	["Skywrite",2],
	["Spider Climb",2],
	["Blink",3],
	["Erupting Earth",3],
	["Flame Arrows",3],
	["Fly",3],
	["Gaseous Form",3],
	  ["Haste",3],
    ["Mass Emergency Repairs",3],
	  ["Slow",3],
    ["Transmute Weapon",3],
	["Tiny Servant",3],
	["Water Breathing",3],
	["Control Water",4],
	["Elemental Bane",4],
	["Fabricate",4],
	["Polymorph",4],
	["Stone Shape",4],
	["Animate Objects",5],
	  ["Control Winds",5],
    ["Mass Repair Damage",5],
	["Passwall",5],
	["Skill Empowerment",5],
	  ["Telekinesis",5],
    ["Temporal Shunt",5],
	["Transmute Rock",5],
	["Create Homunculus",6],
	  ["Disintegrate",6],
    ["Fix",6],
	["Flesh to Stone",6],
	["Investiture of Flame",6],
	["Investiture of Ice",6],
	["Investiture of Stone",6],
	["Investiture of Wind",6],
	["Move Earth",6],
	["Tashas Otherworldly Guise",6],
	  ["Tensers Transformation",6],
    ["Wreck",6],
	["Create Magen",7],
	["Etherealness",7],
	["Reverse Gravity",7],
	["Sequester",7],
	  ["Control Weather",8],
    ["Mass Fix",9],
	["Mass Polymorph",9],
	["Shapechange",9],
	["Time Stop",9],
	["True Polymorph",9]
];
for(i = 0; i < transmutation.length; i++) {
	spells[spells.length] = new spell(transmutation[i][0], "Transmutation", transmutation[i][1], spellX[i], spellY[i]);
}


function button(x, y, w, h, school) {
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
    this.school = school;
}

button.prototype.draw = function() {
    ctx.fillStyle = colors.get(this.school);
    ctx.fillRect(this.x, this.y, this.w, this.h);
    ctx.textAlign = "center";
    ctx.font = "bold 15px Verdana";
    ctx.fillStyle = "white";
    if (this.school == menuSchool) {
        ctx.font = "bold italic 15px Verdana";
    }
    ctx.fillText(this.school, this.x + this.w / 2, this.y + this.h * 3 / 4);
}

var buttons = [];
buttons[buttons.length] = new button(0, 575, 150, 25, "Abjuration");
buttons[buttons.length] = new button(150, 575, 150, 25, "Conjuration");
buttons[buttons.length] = new button(300, 575, 150, 25, "Divination");
buttons[buttons.length] = new button(450, 575, 150, 25, "Enchantment");
buttons[buttons.length] = new button(600, 575, 150, 25, "Evocation");
buttons[buttons.length] = new button(750, 575, 150, 25, "Illusion");
buttons[buttons.length] = new button(900, 575, 150, 25, "Necromancy");
buttons[buttons.length] = new button(1050, 575, 150, 25, "Transmutation");

setInterval(draw, 1);

function draw() {
    ctx.fillStyle = "#555";
    ctx.fillRect(0, 0, 1200, 900);

    ctx.fillStyle = "#888";
    ctx.fillRect(0, 900, 900, 300);
    
	ctx.fillStyle = "#333";
    for (i = 0; i < 9; i++) {
    	ctx.beginPath();
    	if (i % 2 == 0) {
			for (j = 0; j < 15; j++) { 
				ctx.arc(j * 80 + 40, i * 70 + 35, 2, 0, 2 * Math.PI, false);
			}
    	} else {
			for (j = 0; j < 14; j++) { 
    			ctx.arc(j * 80 + 80, i * 70 + 35, 2, 0, 2 * Math.PI, false);
    		}
    	}
    	ctx.fill();
    }

    ctx.globalAlpha = 0.1;
    ctx.fillStyle = colors.get(menuSchool);
    ctx.fillRect(0, 900, 900, 300);
    ctx.globalAlpha = 1;

    ctx.fillStyle = "orange";
    ctx.fillRect(1145, 5, 50, 50);
    ctx.lineWidth = 5;
    ctx.strokeStyle = "red";
    ctx.beginPath();
    ctx.moveTo(1150, 10);
    ctx.lineTo(1190, 50);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(1150, 50);
    ctx.lineTo(1190, 10);
    ctx.stroke();
    ctx.lineWidth = 1;
    ctx.strokeStyle = "black";

    preparedCount = 0;
    cantripCount = 0;
    tokenCount = 0;

    for (i = 0; i < spells.length; i++) {
        if (spells[i].y < 600) {
            if (spells[i].level > 0) preparedCount++;
            else cantripCount++;
            if (spells[i].token) tokenCount++;
            for (j = 0; j < spells.length; j++) {
                if (spells[j].y < 600 && ((spells[i].level == spells[j].level && spells[i].whitelist.indexOf(spells[j].name) >= 0) || (spells[i].school == spells[j].school && Math.abs(spells[i].level - spells[j].level) == 1))) {
                    ctx.beginPath();
                    ctx.moveTo(spells[i].x, spells[i].y);
                    ctx.lineTo(spells[j].x, spells[j].y);
                    ctx.stroke();
                }
            }
        }
    }


    for (i = 0; i < spells.length; i++) {
        if (spells[i].name == addSelect) {
            ctx.strokeStyle = "forestgreen";
            ctx.beginPath();
            ctx.moveTo(spells[i].x, spells[i].y);
            ctx.lineTo(mouseX, mouseY);
            ctx.stroke();
            ctx.strokeStyle = "black";
        }
    }

    ctx.fillStyle = "white";
    ctx.font = "bold 12px Verdana";
    ctx.textAlign = "left";
    ctx.fillText("Spells prepared: " + preparedCount, 5, 15);
    ctx.fillText("Cantrips known: " + cantripCount, 5, 30);
    ctx.fillText("Token Count: " + tokenCount, 5, 45);

    for (i = 0; i < buttons.length; i++) {
        buttons[i].draw();
    }

    for (i = 0; i < spells.length; i++) {
    	if (spells[i].y < 600 && !spells[i].held) {
			spells[i].y = Math.round((spells[i].y - 17) / 70) * 70 + 35;
			if (Math.round((spells[i].y - 17) / 70) % 2 == 0) spells[i].x = Math.round((spells[i].x - 40) / 80) * 80 + 40;
			else spells[i].x = Math.round((spells[i].x - 20) / 80) * 80;
    	}
        if (spells[i].y < 600 || spells[i].school == menuSchool || spells[i].held || spells[i].highlight) spellDraw(spells[i]);
    }

    for (i = 0; i < spells.length; i++) {
        if (spells[i].y < 600 || spells[i].school == menuSchool || spells[i].held || spells[i].highlight) spellLabel(spells[i]);
    }

    if (mode == "move") {
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(mouseX - 6, mouseY - 6);
        ctx.lineTo(mouseX + 6, mouseY + 6);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(mouseX + 6, mouseY - 6);
        ctx.lineTo(mouseX - 6, mouseY + 6);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(mouseX - 1, mouseY - 6);
        ctx.lineTo(mouseX - 6, mouseY - 6);
        ctx.lineTo(mouseX - 6, mouseY - 1);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(mouseX + 1, mouseY - 6);
        ctx.lineTo(mouseX + 6, mouseY - 6);
        ctx.lineTo(mouseX + 6, mouseY - 1);
        ctx.stroke();
        ctx.moveTo(mouseX - 1, mouseY + 6);
        ctx.lineTo(mouseX - 6, mouseY + 6);
        ctx.lineTo(mouseX - 6, mouseY + 1);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(mouseX + 1, mouseY + 6);
        ctx.lineTo(mouseX + 6, mouseY + 6);
        ctx.lineTo(mouseX + 6, mouseY + 1);
        ctx.stroke();
        ctx.lineWidth = 1;
    } else if (mode == "highlight") {
        ctx.strokeStyle = "blue";
        if (originX != null) {
            ctx.fillStyle = "rgba(0,0,255,0.25)";
            ctx.fillRect(originX, originY, mouseX - originX, mouseY - originY);
            ctx.beginPath();
            ctx.moveTo(originX, originY);
            ctx.lineTo(originX, mouseY);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(originX, originY);
            ctx.lineTo(mouseX, originY);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(mouseX, originY);
            ctx.lineTo(mouseX, mouseY);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(originX, mouseY);
            ctx.lineTo(mouseX, mouseY);
            ctx.stroke();
        }
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(mouseX - 6, mouseY - 6);
        ctx.lineTo(mouseX + 6, mouseY + 6);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(mouseX + 6, mouseY - 6);
        ctx.lineTo(mouseX - 6, mouseY + 6);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(mouseX - 1, mouseY - 6);
        ctx.lineTo(mouseX - 6, mouseY - 6);
        ctx.lineTo(mouseX - 6, mouseY - 1);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(mouseX + 1, mouseY - 6);
        ctx.lineTo(mouseX + 6, mouseY - 6);
        ctx.lineTo(mouseX + 6, mouseY - 1);
        ctx.stroke();
        ctx.moveTo(mouseX - 1, mouseY + 6);
        ctx.lineTo(mouseX - 6, mouseY + 6);
        ctx.lineTo(mouseX - 6, mouseY + 1);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(mouseX + 1, mouseY + 6);
        ctx.lineTo(mouseX + 6, mouseY + 6);
        ctx.lineTo(mouseX + 6, mouseY + 1);
        ctx.stroke();
        ctx.lineWidth = 1;
    } else if (mode == "add") {
        ctx.strokeStyle = "forestgreen";
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(mouseX, mouseY - 7);
        ctx.lineTo(mouseX, mouseY + 7);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(mouseX + 7, mouseY);
        ctx.lineTo(mouseX - 7, mouseY);
        ctx.stroke();
        ctx.lineWidth = 1;
        ctx.strokeStyle = "black";
    } else {
        ctx.fillStyle = "orange";
        ctx.beginPath();
        ctx.moveTo(mouseX, mouseY - 5);
        ctx.lineTo(mouseX, mouseY - 7);
        ctx.lineTo(mouseX + 6, mouseY - 4);
        ctx.lineTo(mouseX + 6, mouseY + 4);
        ctx.lineTo(mouseX, mouseY + 7);
        ctx.lineTo(mouseX, mouseY + 5);
        ctx.lineTo(mouseX + 4, mouseY + 3);
        ctx.lineTo(mouseX + 4, mouseY - 3);
        ctx.fill();

        ctx.moveTo(mouseX, mouseY - 5);
        ctx.lineTo(mouseX, mouseY - 7);
        ctx.lineTo(mouseX - 6, mouseY - 4);
        ctx.lineTo(mouseX - 6, mouseY + 4);
        ctx.lineTo(mouseX, mouseY + 7);
        ctx.lineTo(mouseX, mouseY + 5);
        ctx.lineTo(mouseX - 4, mouseY + 3);
        ctx.lineTo(mouseX - 4, mouseY - 3);
        ctx.fill();
    }
}

document.onmousemove = function(e) {
    e = window.event || e;

    rect = canvas.getBoundingClientRect();
    mouseX = Math.round((e.clientX - rect.left));
    mouseY = Math.round((e.clientY - rect.top));

    for (i = 0; i < spells.length; i++) {
        if (spells[i].held) {
            var highlightMoved = 0;
            if (spells[i].highlight) {
                for (j = spells.length - 1; j >= 0; j--) {
                    if (spells[j].highlight) {
                        spells[j].x = mouseX + xShift[highlightMoved];
                        spells[j].y = mouseY + yShift[highlightMoved];
                        highlightMoved++;
                        if (highlightMoved == xShift.length) break;
                    }
                }
            } else {
                spells[i].x = mouseX;
                spells[i].y = mouseY;
            }
            break;
        }
        if (mode == "highlight" && originX != null) {
            var x1 = Math.min(originX, mouseX);
            var y1 = Math.min(originY, mouseY);
            var x2 = Math.max(originX, mouseX);
            var y2 = Math.max(originY, mouseY);
            if (spells[i].x > x1 && spells[i].x < x2 && spells[i].y > y1 && spells[i].y < y2 && (spells[i].y < 440 || spells[i].school == menuSchool)) spells[i].highlight = true;
            else spells[i].highlight = false;
        }
    }
}

document.onmousedown = function(e) {
    e = window.event || e;
    var onSpell = false;
    for (i = spells.length - 1; i >= 0; i--) {
        if (Math.pow(Math.pow(mouseX - spells[i].x, 2) + Math.pow(mouseY - spells[i].y, 2), 0.5) < spells[i].r && (spells[i].y < 500 || spells[i].school == menuSchool)) {
            onSpell = true;
            if (mode == "move") {
                if (spells[i].highlight) {
                    originX = spells[i].x;
                    originY = spells[i].y;
                    for (j = spells.length - 1; j >= 0; j--) {
                        if (spells[j].highlight) {
                            xShift[xShift.length] = spells[j].x - originX;
                            yShift[yShift.length] = spells[j].y - originY;
                        }
                    }
                } else {
                    for (j = spells.length - 1; j >= 0; j--) {
                        spells[j].highlight = false;
                    }
                }
                spells[i].held = true;
            } else if (mode == "add" && spells[i].y < 600) {
                if (addSelect == "") addSelect = spells[i].name;
                else if (spells[i].name == addSelect) addSelect = "";
                else {
                    if (spells[i].whitelist.indexOf(addSelect) < 0) {
                        for (j = spells.length - 1; j >= 0; j--) {
                            if (spells[j].name == addSelect) {
                                if (spells[i].level == spells[j].level && spells[i].whitelist.length < 2 && spells[j].whitelist.length < 2) {
                                    spells[j].whitelist[spells[j].whitelist.length] = spells[i].name;
                                    spells[i].whitelist[spells[i].whitelist.length] = addSelect;
                                    addSelect = spells[i].name;
                                } else {
                                    addSelect = "";
                                }
                                break;
                            }
                        }
                    } else {
                        spells[i].whitelist.splice(spells[i].whitelist.indexOf(addSelect, 1));
                        for (j = spells.length - 1; j >= 0; j--) {
                            if (spells[j].name == addSelect) {
                                spells[j].whitelist.splice(spells[j].whitelist.indexOf(spells[i].name), 1);
                                break;
                            }
                        }
                        addSelect = "";
                    }
                }
            } else if (mode == "token" && spells[i].y < 600) {
                spells[i].token = !spells[i].token;
            }
            break;
        } else {
            if (mode == "highlight") {
                originX = mouseX;
                originY = mouseY;
                for (i = spells.length - 1; i >= 0; i--) {
                    spells[i].highlight = false;
                }
            }
            if (i == 0) {
                addSelect = "";
            }
        }
    }
    if (!onSpell) {
        for (j = spells.length - 1; j >= 0; j--) {
            spells[j].highlight = false;
        }
    }
    for (i = buttons.length - 1; i >= 0; i--) {
        if (mouseX > buttons[i].x && mouseX < buttons[i].x + buttons[i].w && mouseY > buttons[i].y && mouseY < buttons[i].y + buttons[i].h) {
            menuSchool = buttons[i].school
            break;
        }
    }
}


document.onmouseup = function(e) {
    e = window.event || e;

    for (i = 0; i < spells.length; i++) {
        if (spells[i].held) {
            spells[i].held = false;
            if (spells[i].highlight) {
                for (k = spells.length - 1; k >= 0; k--) {
                    if (spells[k].y > 600) {
                        spells[k].x = spells[k].homeX;
                        spells[k].y = spells[k].homeY;
                        spells[k].token = false;
                        spells[k].whitelist = [];
                        spells[k].highlight = false;
                        for (j = spells.length - 1; j >= 0; j--) {
                            if (spells[j].whitelist.indexOf(spells[k].name) >= 0) {
                                spells[j].whitelist.splice(spells[j].whitelist.indexOf(spells[k].name), 1);
                            }
                        }
                    }
                }
            } else if (spells[i].y > 600) {
                spells[i].x = spells[i].homeX;
                spells[i].y = spells[i].homeY;
                spells[i].token = false;
                spells[i].whitelist = [];
                for (j = spells.length - 1; j >= 0; j--) {
                    if (spells[j].whitelist.indexOf(spells[i].name) >= 0) {
                        spells[j].whitelist.splice(spells[j].whitelist.indexOf(spells[i].name), 1);
                    }
                }
            }
            break;
        }
    }
    if (mode == "move") {
        if (mouseX > 1145 && mouseX < 1195 && mouseY > 5 && mouseY < 55) {
            for (i = 0; i < spells.length; i++) {
                spells[i].token = false;
            }
        }
    }

    originX = null;
    originY = null;
    xShift = [];
    yShift = [];

}

document.onkeydown = function(e) {
    e = window.event || e;
    var key = e.keyCode;
    e.preventDefault();

    if (mode != "add" && key === 88) { //x
        mode = "add";
    } else if (mode == "add" && key === 88) {
        mode = "move";
        addSelect = "";
    }

    if (mode != "token" && key === 90) { //z
        mode = "token";
        addSelect = "";
    } else if (mode == "token" && key === 90) {
        mode = "move";
        addSelect = "";
    }

    if (mode != "highlight" && key === 67) { //c
        mode = "highlight";
        addSelect = "";
    } else if (mode == "highlight" && key === 67) {
        mode = "move";
        addSelect = "";
    }

    if (key === 83) { //s
        var usedSpells = [];
        for (i = 0; i < spells.length; i++) {
            if (spells[i].y < 440) {
                usedSpells[usedSpells.length] = spells[i];
            }
        }
        createCookie(window.prompt("What would you like to save this arangement as (must use exact name to load)?"), JSON.stringify(usedSpells), false);
    } else if (key === 79) { //o
        usedSpells = JSON.parse(getCookie(window.prompt("What arrangment would you like to load (must use exact name to load)?")));
        for (i = 0; i < spells.length; i++) {
            var isUsed = false;
            for (j = 0; j < usedSpells.length; j++) {
                if (spells[i].name == usedSpells[j].name) {
                    spells[i] = usedSpells[j];
                    isUsed = true;
                    break;
                }
            }
            if (!isUsed) {
                spells[i].x = spells[i].homeX;
                spells[i].y = spells[i].homeY;
                spells[i].token = false;
                spells[i].highlight = false;
            }
        }
    } else if (key === 38) { //up
        for (i = 0; i < spells.length; i++) {
            if (spells[i].highlight) {
                spells[i].y -= 5;
            }
        }
    } else if (key === 40) { //down
        for (i = 0; i < spells.length; i++) {
            if (spells[i].highlight) {
                spells[i].y += 5;
            }
        }
    } else if (key === 37) { //left
        for (i = 0; i < spells.length; i++) {
            if (spells[i].highlight) {
                spells[i].x -= 5;
            }
        }
    } else if (key === 39) { //right
        for (i = 0; i < spells.length; i++) {
            if (spells[i].highlight) {
                spells[i].x += 5;
            }
        }
    }
}

document.onkeyup = function(e) {
    e = window.event || e;
    var key = e.keyCode;
}
