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

function spellLabel(spell) {
    if (spell.highlight) ctx.fillStyle = 'blue';
    else ctx.fillStyle = 'white';
    ctx.font = "10px Verdana";
    ctx.textAlign = "center";
    if (spell.name.lastIndexOf("<>") < 0) {
        ctx.fillText(spell.name, spell.x, spell.y - 12);
    } else {
        ctx.fillText(spell.name.substr(0, spell.name.lastIndexOf("<>")), spell.x, spell.y - 22);
        ctx.fillText(spell.name.substr(spell.name.lastIndexOf("<>") + 2), spell.x, spell.y - 12);
    }
    ctx.fillText("Lvl: " + spell.level, spell.x, spell.y + 20);
}

var spellX = [
	40, 120, 200, 280, 360, 440, 520, 600, 680, 760, 840, 920, 1000, 1080, 1160,
  40, 120, 200, 280, 360, 440, 520, 600, 680, 760, 840, 920, 1000, 1080, 1160,
  40, 120, 200, 280, 360, 440, 520, 600, 680, 760, 840, 920, 1000, 1080, 1160,
  40, 120, 200, 280, 360, 440, 520, 600, 680, 760, 840, 920, 1000, 1080, 1160
];

var spellY = [
	500, 500, 500, 500, 500, 500, 500, 500, 500, 500, 500, 500, 500, 500, 500,
  560, 560, 560, 560, 560, 560, 560, 560, 560, 560, 560, 560, 560, 560, 560,
  620, 620, 620, 620, 620, 620, 620, 620, 620, 620, 620, 620, 620, 620, 620,
  680, 680, 680, 680, 680, 680, 680, 680, 680, 680, 680, 680, 680, 680, 680
];

var spells = [];

//Abjuration
var abjuration = [
	["Blade Ward", 0],
	["Absorb Elements", 1],
	["Alarm", 1],
	["Mage Armor", 1],
	["Protection from<>Evil and Good", 1],
	["Shield", 1],
	["Snare", 1],
	["Arcane Lock", 2],
	["Counterspell", 3],
	["Dispel Magic", 3],
	["Glyph of<>Warding", 3],
	["Magic Circle", 3],
	["Nondetection", 3],
	["Protection from<>Energy", 3],
	["Remove Curse", 3],
	["Banishment", 4],
	["Mordenkainen's<>Private Sanctum", 4],
	["Stoneskin", 4],
	["Planar Binding", 5],
	["Globe of<>Invulnerability", 6],
	["Guards and<>Wards", 6],
	["Symbol", 7],
	["Antimagic<>Field", 8],
	["Mind Blank", 8],
	["Imprisonment", 9],
	["Invulnerability", 9],
	["Prismatic<>Wall", 9]
];
for(i = 0; i < abjuration.length; i++) {
	spells[spells.length] = new spell(abjuration[i][0], "Abjuration", abjuration[i][1], spellX[i], spellY[i]);
}
//Conjuration
var conjuration = [
	["Acid Splash", 0],
	["Create Bonfire", 0],
	["Infestation", 0],
	["Mage Hand", 0],
	["Poison Spray", 0],
	["Sword Burst", 0],
	["Find Familiar", 1],
	["Fog Cloud", 1],
	["Grease", 1],
	["Ice Knife", 1],
	["Tenser's Floating<>Disk", 1],
	["Unseen<>Servent", 1],
	["Cloud of<>Daggers", 2],
	["Dust Devil", 2],
	["Flaming<>Sphere", 2],
	["Flock of Familiars", 2],
	["Misty Step", 2],
	["Web", 2],
	["Galder's Tower", 2],
	["Leomund's<>Tiny Hut", 3],
	["Sleet Storm", 3],
	["Stinking Cloud", 3],
	["Summon Lesser Demon", 3],
	["Thunder Step", 3],
	["Tidal Wave", 3],
	["Conjure Minor<>Elementals", 4],
	["Dimension Door", 4],
	["Evard's Black<>Tentacles", 4],
	["Faithful Hound", 4],
	["Galder's Speedy Courier", 4],
	["Leomund's<>Secret Chest", 4],
	["Mordenkainen's<>Faithful Hound", 4],
	["Secret Chest", 4],
	["Summon Greater Demon", 4],
	["Watery<>Sphere", 4],
	["Cloud Kill", 5],
	["Conjure<>Elemental", 5],
	["Far Step", 5],
	["Infernal Calling", 5],
	["Steel Wind Strike", 5],
	["Teleportation<>Circle", 5],
	["Arcane Gate", 6],
	["Instant<>Summons", 6],
	["Scatter", 6],
	["Mordenkainen's<>Magnificent Mansion", 7],
	["Plane Shift", 7],
	["Teleport", 7],
	["Demiplane", 8],
	["Incendiary<>Cloud", 8],
	["Mighty Fortress", 8],
	["Maze", 8],
	["Gate", 9],
	["Wish", 9]
];
for(i = 0; i < conjuration.length; i++) {
	spells[spells.length] = new spell(conjuration[i][0], "Conjuration", conjuration[i][1], spellX[i], spellY[i]);
}
//Divination
var divination = [
	["True Strike", 0],
	["Comprehend<>Languages", 1],
	["Detect Magic", 1],
	["Identify", 1],
	["Detect<>Thoughts", 2],
	["Locate Object", 2],
	["See<>Invisibility", 2],
	["Clairvoyance", 3],
	["Tongues", 3],
	["Arcane Eye", 4],
	["Locate Creature", 4],
	["Contact Other<>Plane", 5],
	["Legend Lore", 5],
	["Rary's Telepathic<>Bond", 5],
	["Scrying", 5],
	["True Seeing", 5],
	["Forsight", 9]
];
for(i = 0; i < divination.length; i++) {
	spells[spells.length] = new spell(divination[i][0], "Divination", divination[i][1], spellX[i], spellY[i]);
}
//Enchantment 
var enchantment = [
	["Friends", 0],
	["Charm Person", 1],
	["Sleep", 1],
	["Tasha's Hideous<>Laughter", 1],
	["Crown of<>Madness", 2],
	["Hold Person", 2],
	["Sugguestion", 2],
	["Confusion", 4],
	["Dominate Person", 5],
	["Geas", 5],
	["Hold Monster", 5],
	["Modify Memory", 5],
	["Mass<>Suggestion", 6],
	["Otto's Irresistible<>Dance", 6],
	["Antipathy/<>Sympathy", 8],
	["Dominate<>Monster", 8],
	["Feeblemind", 8],
	["Power Word<>Stun", 8],
	["Power Word<>Kill", 9]
];
for(i = 0; i < enchantment.length; i++) {
	spells[spells.length] = new spell(enchantment[i][0], "Enchantment", enchantment[i][1], spellX[i], spellY[i]);
}
//Evocation
var evocation = [
	["Booming<>Blade", 0],
  ["Dancing Lights", 0],
  ["Fire Bolt", 0],
  ["Frostbite", 0],
  ["Green-Flame<>Blade", 0],
  ["Light", 0],
  ["Lightning Lure", 0],
  ["Ray of Frost", 0],
  ["Shocking<>Grasp", 0],
  ["Thunderclap", 0],
  ["Burning<>Hands", 1],
  ["Chromatic Orb", 1],
  ["Earth Tremor", 1],
  ["Magic Missile", 1],
  ["Thunderwave", 1],
  ["Witch<>Bolt", 1],
  ["Aganazzar’s<>Scorcher", 2],
  ["Continual<>Flame", 2],
  ["Darkness", 2],
  ["Gust of<>Wind", 2],
  ["Melf’s Acid<>Arrow", 2],
  ["Scorching<>Ray", 2],
  ["Shatter", 2],
  ["Snilloc’s Snowball<>Swarm", 2],
  ["Fireball", 3],
  ["Lightning Bolt", 3],
  ["Melf's Minute<>Meteors", 3],
  ["Sending", 3],
  ["Wall of Sand", 3],
  ["Wall of Water", 3],
  ["Fire Shield", 4],
  ["Ice Storm", 4],
  ["Otiluke’s<>Resilient Sphere", 4],
  ["Storm<>Sphere", 4],
  ["Vitriolic Sphere", 4],
  ["Wall of Fire", 4],
  ["Bigby's Hand", 5],
  ["Cone of Cold", 5],
  ["Immolation", 5],
  ["Wall of Force", 5],
  ["Wall of Stone", 5],
  ["Chain<>Lightning", 6],
  [],
  [],
  [],
  [],
  [],
  [],
  [],
  [],
  [],
  []
];
/*for(i = 0; i < evocation.length; i++) {
	spells[spells.length] = new spell(evocation[i][0], "Evocation", evocation[i][1], spellX[i], spellY[i]);
}*/

spells[spells.length] = new spell("Booming<>Blade", "Evocation", 0, 40, 500);
spells[spells.length] = new spell("Dancing Lights", "Evocation", 0, 120, 500);
spells[spells.length] = new spell("Fire Bolt", "Evocation", 0, 200, 500);
spells[spells.length] = new spell("Frostbite", "Evocation", 0, 280, 500);
spells[spells.length] = new spell("Green-Flame<>Blade", "Evocation", 0, 360, 500);
spells[spells.length] = new spell("Light", "Evocation", 0, 440, 500);
spells[spells.length] = new spell("Lightning Lure", "Evocation", 0, 520, 500);
spells[spells.length] = new spell("Ray of Frost", "Evocation", 0, 600, 500);
spells[spells.length] = new spell("Shocking<>Grasp", "Evocation", 0, 680, 500);
spells[spells.length] = new spell("Burning<>Hands", "Evocation", 1, 760, 500);
spells[spells.length] = new spell("Chromatic Orb", "Evocation", 1, 840, 500);
spells[spells.length] = new spell("Earth Tremor", "Evocation", 1, 920, 500);
spells[spells.length] = new spell("Magic Missile", "Evocation", 1, 1000, 500);
spells[spells.length] = new spell("Thunderclap", "Evocation", 0, 1080, 500);
spells[spells.length] = new spell("Thunderwave", "Evocation", 1, 1160, 500);
spells[spells.length] = new spell("Witch<>Bolt", "Evocation", 1, 40, 560);
spells[spells.length] = new spell("Aganazzar’s<>Scorcher", "Evocation", 2, 120, 560);
spells[spells.length] = new spell("Continual<>Flame", "Evocation", 2, 200, 560);
spells[spells.length] = new spell("Darkness", "Evocation", 2, 280, 560);
spells[spells.length] = new spell("Gust of<>Wind", "Evocation", 2, 360, 560);
spells[spells.length] = new spell("Melf’s Acid<>Arrow", "Evocation", 2, 440, 560);
spells[spells.length] = new spell("Scorching<>Ray", "Evocation", 2, 520, 560);
spells[spells.length] = new spell("Shatter", "Evocation", 2, 600, 560);
spells[spells.length] = new spell("Snilloc’s Snowball<>Swarm", "Evocation", 2, 680, 560);
spells[spells.length] = new spell("Fireball", "Evocation", 3, 760, 560);
spells[spells.length] = new spell("Lightning Bolt", "Evocation", 3, 840, 560);
spells[spells.length] = new spell("Melf's Minute<>Meteors", "Evocation", 3, 920, 560);
spells[spells.length] = new spell("Sending", "Evocation", 3, 1000, 560);
spells[spells.length] = new spell("Wall of Sand", "Evocation", 3, 1080, 560);
spells[spells.length] = new spell("Wall of Water", "Evocation", 3, 1160, 560);
spells[spells.length] = new spell("Fire Shield", "Evocation", 4, 40, 620);
spells[spells.length] = new spell("Ice Storm", "Evocation", 4, 120, 620);
spells[spells.length] = new spell("Otiluke’s<>Resilient Sphere", "Evocation", 4, 200, 620);
spells[spells.length] = new spell("Storm<>Sphere", "Evocation", 4, 280, 620);
spells[spells.length] = new spell("Vitriolic Sphere", "Evocation", 4, 360, 620);
spells[spells.length] = new spell("Wall of Fire", "Evocation", 4, 440, 620);
spells[spells.length] = new spell("Bigby's Hand", "Evocation", 5, 520, 620);
spells[spells.length] = new spell("Cone of Cold", "Evocation", 5, 600, 620);
spells[spells.length] = new spell("Immolation", "Evocation", 5, 680, 620);
spells[spells.length] = new spell("Wall of Force", "Evocation", 5, 760, 620);
spells[spells.length] = new spell("Wall of Stone", "Evocation", 5, 840, 620);
spells[spells.length] = new spell("Chain<>Lightning", "Evocation", 6, 920, 620);
spells[spells.length] = new spell("Contingency", "Evocation", 6, 1000, 620);
spells[spells.length] = new spell("Otiluke's Freezing<>Sphere", "Evocation", 6, 1080, 620);
spells[spells.length] = new spell("Sunbeam", "Evocation", 6, 1160, 620);
spells[spells.length] = new spell("Wall of Ice", "Evocation", 6, 40, 680);
spells[spells.length] = new spell("Delayed Blast<>Fireball", "Evocation", 7, 120, 680);
spells[spells.length] = new spell("Forcecage", "Evocation", 7, 200, 680);
spells[spells.length] = new spell("Mordenkainen’s<>Sword", "Evocation", 7, 280, 680);
spells[spells.length] = new spell("Prismatic Spray", "Evocation", 7, 360, 680);
spells[spells.length] = new spell("Wirlwind", "Evocation", 7, 440, 680);
spells[spells.length] = new spell("Sunburst", "Evocation", 8, 520, 680);
spells[spells.length] = new spell("Telepathy", "Evocation", 8, 600, 680);
spells[spells.length] = new spell("Meteor Swarm", "Evocation", 9, 680, 680);
//Illusion
spells[spells.length] = new spell("Minor Illusion", "Illusion", 0, 40, 500);
spells[spells.length] = new spell("Color Spray", "Illusion", 1, 120, 500);
spells[spells.length] = new spell("Disguise Self", "Illusion", 1, 200, 500);
spells[spells.length] = new spell("Illusory Script", "Illusion", 1, 280, 500);
spells[spells.length] = new spell("Silent Image", "Illusion", 1, 360, 500);
spells[spells.length] = new spell("Arcanist's<>Magic Aura", "Illusion", 2, 440, 500);
spells[spells.length] = new spell("Blur", "Illusion", 2, 520, 500);
spells[spells.length] = new spell("Invisibility", "Illusion", 2, 600, 500);
spells[spells.length] = new spell("Magic Mouth", "Illusion", 2, 680, 500);
spells[spells.length] = new spell("Mirror Image", "Illusion", 2, 760, 500);
spells[spells.length] = new spell("Nystul’s Magic<>Aura", "Illusion", 2, 840, 500);
spells[spells.length] = new spell("Phantasmal<>Force", "Illusion", 2, 920, 500);
spells[spells.length] = new spell("Fear", "Illusion", 3, 1000, 500);
spells[spells.length] = new spell("Hypnotic<>Pattern", "Illusion", 3, 1080, 500);
spells[spells.length] = new spell("Major Image", "Illusion", 3, 1160, 500);
spells[spells.length] = new spell("Phantom<>Steed", "Illusion", 3, 40, 560);
spells[spells.length] = new spell("Greater<>Invisibility", "Illusion", 4, 120, 560);
spells[spells.length] = new spell("Hallucinatory<>Terrain", "Illusion", 4, 200, 560);
spells[spells.length] = new spell("Phantasmal<>Killer", "Illusion", 4, 280, 560);
spells[spells.length] = new spell("Creation", "Illusion", 5, 360, 560);
spells[spells.length] = new spell("Dream", "Illusion", 5, 440, 560);
spells[spells.length] = new spell("Mislead", "Illusion", 5, 520, 560);
spells[spells.length] = new spell("Seeming", "Illusion", 5, 600, 560);
spells[spells.length] = new spell("Programmed<>Illusion", "Illusion", 6, 680, 560);
spells[spells.length] = new spell("Mirage Arcane", "Illusion", 7, 760, 560);
spells[spells.length] = new spell("Project Image", "Illusion", 7, 840, 560);
spells[spells.length] = new spell("Simulacrum", "Illusion", 7, 920, 560);
spells[spells.length] = new spell("Weird", "Illusion", 9, 1000, 560);
//Necromancy
spells[spells.length] = new spell("Chill Touch", "Necromancy", 0, 40, 500);
spells[spells.length] = new spell("False Life", "Necromancy", 1, 120, 500);
spells[spells.length] = new spell("Ray of Sickness", "Necromancy", 1, 200, 500);
spells[spells.length] = new spell("Blindness/<>Deafness", "Necromancy", 2, 280, 500);
spells[spells.length] = new spell("Gentle Repose", "Necromancy", 2, 360, 500);
spells[spells.length] = new spell("Ray of<>Enfeeblement", "Necromancy", 2, 440, 500);
spells[spells.length] = new spell("Animate Dead", "Necromancy", 3, 520, 500);
spells[spells.length] = new spell("Bestow Curse", "Necromancy", 3, 600, 500);
spells[spells.length] = new spell("Feign Death", "Necromancy", 3, 680, 500);
spells[spells.length] = new spell("Vampiric Touch", "Necromancy", 3, 760, 500);
spells[spells.length] = new spell("Blight", "Necromancy", 4, 840, 500);
//Transmutation
spells[spells.length] = new spell("Control<>Flames", "Transmutation", 0, 40, 500);
spells[spells.length] = new spell("Gust", "Transmutation", 0, 120, 500);
spells[spells.length] = new spell("Mending", "Transmutation", 0, 200, 500);
spells[spells.length] = new spell("Message", "Transmutation", 0, 280, 500);
spells[spells.length] = new spell("Mold Earth", "Transmutation", 0, 360, 500);
spells[spells.length] = new spell("Prestidigitation", "Transmutation", 0, 440, 500);
spells[spells.length] = new spell("Shape Water", "Transmutation", 0, 520, 500);
spells[spells.length] = new spell("Catapult", "Transmutation", 1, 600, 500);
spells[spells.length] = new spell("Expeditious<>Retreat", "Transmutation", 1, 680, 500);
spells[spells.length] = new spell("Feather Fall", "Transmutation", 1, 760, 500);
spells[spells.length] = new spell("Jump", "Transmutation", 1, 840, 500);
spells[spells.length] = new spell("Longstrider", "Transmutation", 1, 920, 500);
spells[spells.length] = new spell("Altar Self", "Transmutation", 2, 1000, 500);
spells[spells.length] = new spell("Darkvision", "Transmutation", 2, 1080, 500);
spells[spells.length] = new spell("Earthbind", "Transmutation", 2, 1160, 500);
spells[spells.length] = new spell("Enlarge/<>Reduce", "Transmutation", 2, 40, 560);
spells[spells.length] = new spell("Knock", "Transmutation", 2, 120, 560);
spells[spells.length] = new spell("Levitate", "Transmutation", 2, 200, 560);
spells[spells.length] = new spell("Magic Weapon", "Transmutation", 2, 280, 560);
spells[spells.length] = new spell("Maximilian’s<>Earthen Grasp", "Transmutation", 2, 360, 560);
spells[spells.length] = new spell("Pyrotechnics", "Transmutation", 2, 440, 560);
spells[spells.length] = new spell("Rope Trick", "Transmutation", 2, 520, 560);
spells[spells.length] = new spell("Skywrite", "Transmutation", 2, 600, 560);
spells[spells.length] = new spell("Spider Climb", "Transmutation", 2, 680, 560);
spells[spells.length] = new spell("Blink", "Transmutation", 3, 760, 560);
spells[spells.length] = new spell("Erupting Earth", "Transmutation", 3, 840, 560);
spells[spells.length] = new spell("Flame Arrows", "Transmutation", 3, 920, 560);
spells[spells.length] = new spell("Fly", "Transmutation", 3, 1000, 560);
spells[spells.length] = new spell("Gaseous Form", "Transmutation", 3, 1080, 560);
spells[spells.length] = new spell("Haste", "Transmutation", 3, 1160, 560);
spells[spells.length] = new spell("Slow", "Transmutation", 3, 40, 620);
spells[spells.length] = new spell("Water<>Breathing", "Transmutation", 3, 120, 620);
spells[spells.length] = new spell("Control Water", "Transmutation", 4, 200, 620);
spells[spells.length] = new spell("Elemental Bane", "Transmutation", 4, 280, 620);
spells[spells.length] = new spell("Fabricate", "Transmutation", 4, 360, 620);
spells[spells.length] = new spell("Polymorph", "Transmutation", 4, 440, 620);
spells[spells.length] = new spell("Stone Shape", "Transmutation", 4, 520, 620);

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
buttons[buttons.length] = new button(0, 440, 150, 25, "Abjuration");
buttons[buttons.length] = new button(150, 440, 150, 25, "Conjuration");
buttons[buttons.length] = new button(300, 440, 150, 25, "Divination");
buttons[buttons.length] = new button(450, 440, 150, 25, "Enchantment");
buttons[buttons.length] = new button(600, 440, 150, 25, "Evocation");
buttons[buttons.length] = new button(750, 440, 150, 25, "Illusion");
buttons[buttons.length] = new button(900, 440, 150, 25, "Necromancy");
buttons[buttons.length] = new button(1050, 440, 150, 25, "Transmutation");

setInterval(draw, 1);

function draw() {
    ctx.fillStyle = "#555";
    ctx.fillRect(0, 0, 1200, 720);

    ctx.fillStyle = "#888";
    ctx.fillRect(0, 465, 1200, 255);
    
	ctx.fillStyle = "#333";
    for (i = 0; i < 6; i++) {
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
    ctx.fillRect(0, 465, 1200, 255);
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
        if (spells[i].y < 440) {
            if (spells[i].level > 0) preparedCount++;
            else cantripCount++;
            if (spells[i].token) tokenCount++;
            for (j = 0; j < spells.length; j++) {
                if (spells[j].y < 440 && ((spells[i].level == spells[j].level && spells[i].whitelist.indexOf(spells[j].name) >= 0) || (spells[i].school == spells[j].school && Math.abs(spells[i].level - spells[j].level) == 1))) {
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
    	if (spells[i].y < 440 && !spells[i].held) {
			spells[i].y = Math.round((spells[i].y - 17) / 70) * 70 + 35;
			if (Math.round((spells[i].y - 17) / 70) % 2 == 0) spells[i].x = Math.round((spells[i].x - 40) / 80) * 80 + 40;
			else spells[i].x = Math.round((spells[i].x - 20) / 80) * 80;
    	}
        if (spells[i].y < 440 || spells[i].school == menuSchool || spells[i].held || spells[i].highlight) spellDraw(spells[i]);
    }

    for (i = 0; i < spells.length; i++) {
        if (spells[i].y < 440 || spells[i].school == menuSchool || spells[i].held || spells[i].highlight) spellLabel(spells[i]);
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
            } else if (mode == "add" && spells[i].y < 440) {
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
            } else if (mode == "token" && spells[i].y < 440) {
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
                    if (spells[k].y > 440) {
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
            } else if (spells[i].y > 440) {
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
