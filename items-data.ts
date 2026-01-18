import type { Item, ItemTier } from "@shared/schema";

const tier1Items: Omit<Item, "id" | "tier">[] = [
  {"name": "Arcane Staff", "type": "weapon", "stats": {"Int": 20}, "price": 300},
  {"name": "Thunder Hammer", "type": "weapon", "stats": {"Str": 12, "Luck": 5}, "price": 280},
  {"name": "Shadow Cloak", "type": "armor", "stats": {"Spd": 10, "Luck": 5}, "price": 300},
  {"name": "Mystic Robes", "type": "armor", "stats": {"Int": 20}, "price": 300},
  {"name": "Guardian Plate", "type": "armor", "stats": {"Str": 15}, "price": 320},
  {"name": "Frost Dagger", "type": "weapon", "stats": {"Spd": 15}, "special": "Slow", "price": 330},
  {"name": "Ember Wand", "type": "weapon", "stats": {"Int": 18}, "special": "Fire Damage", "price": 340},
  {"name": "Lucky Ring", "type": "accessory", "stats": {"Luck": 20}, "price": 345},
  {"name": "Flame Cloak", "type": "armor", "stats": {"Str": 15}, "special": "Fire Resist", "price": 350},
  {"name": "Swift Helm", "type": "armor", "stats": {"Spd": 12, "Int": 5}, "price": 355},
  {"name": "Thunder Bow", "type": "weapon", "stats": {"Spd": 18}, "special": "Lightning Damage", "price": 360},
  {"name": "Arcane Amulet", "type": "accessory", "stats": {"Int": 20}, "special": "Mana Regen", "price": 365},
  {"name": "Shadow Saber", "type": "weapon", "stats": {"Str": 20}, "special": "Stealth", "price": 370},
  {"name": "Frost Robes", "type": "armor", "stats": {"Int": 18}, "special": "Freeze", "price": 365},
  {"name": "Lucky Pendant", "type": "accessory", "stats": {"Luck": 22, "Str": 6}, "price": 370},
];

const tier2Items: Omit<Item, "id" | "tier">[] = [
  {"name": "Elemental Vest", "type": "armor", "stats": {"Str": 10, "Spd": 10, "Int": 10, "Luck": 10}, "price": 400},
  {"name": "SR Ring of Fortune", "type": "accessory", "stats": {"Luck": 20}, "price": 420},
  {"name": "Frost Bow", "type": "weapon", "stats": {"Spd": 10, "Luck": 10}, "price": 430},
  {"name": "Ember Robes", "type": "armor", "stats": {"Int": 18}, "special": "Fire Damage", "price": 440},
  {"name": "Shadow Fang", "type": "weapon", "stats": {"Str": 20}, "special": "Stealth", "price": 445},
  {"name": "Arcane Sabre", "type": "weapon", "stats": {"Str": 22}, "special": "Mana Regen", "price": 450},
  {"name": "Lightning Dagger", "type": "weapon", "stats": {"Spd": 18}, "special": "Lightning Damage", "price": 455},
  {"name": "SR Ring of Insight", "type": "accessory", "stats": {"Int": 22, "Luck": 10}, "price": 460},
  {"name": "SR Swift Boots", "type": "armor", "stats": {"Spd": 20, "Str": 12}, "price": 465},
  {"name": "SR Ember Staff", "type": "weapon", "stats": {"Int": 25}, "special": "Fire AoE", "price": 470},
  {"name": "SR Frost Fang", "type": "weapon", "stats": {"Str": 25}, "special": "Ice AoE", "price": 470},
  {"name": "SR Lucky Pendant", "type": "accessory", "stats": {"Luck": 25, "Str": 15}, "price": 475},
  {"name": "Shadow Blade", "type": "weapon", "stats": {"Str": 27}, "special": "Stealth", "price": 480},
  {"name": "SR Arcane Mantle", "type": "armor", "stats": {"Int": 27}, "special": "Mana Regen", "price": 480},
  {"name": "Ring of Valor", "type": "accessory", "stats": {"Luck": 28, "Int": 18}, "price": 490},
];

const tier3Items: Omit<Item, "id" | "tier">[] = [
  {"name": "Titan's Hammer", "type": "weapon", "stats": {"Str": 40, "Luck": 20}, "price": 1000},
  {"name": "Infinity Bow", "type": "weapon", "stats": {"Spd": 40, "Luck": 20}, "price": 1000},
  {"name": "Sage's Staff", "type": "weapon", "stats": {"Int": 40}, "price": 1000},
  {"name": "Omniguard Armor", "type": "armor", "stats": {"Str": 35, "Spd": 35, "Int": 35, "Luck": 35}, "price": 1050},
  {"name": "Dragonfang Blade", "type": "weapon", "stats": {"Str": 45, "Spd": 25}, "price": 1100},
  {"name": "Archmage Robes", "type": "armor", "stats": {"Int": 45, "Luck": 25}, "price": 1100},
  {"name": "Shadow Eclipse Cloak", "type": "armor", "stats": {"Spd": 42, "Luck": 30}, "price": 1120},
  {"name": "Phoenix Saber", "type": "weapon", "stats": {"Str": 50}, "special": "Fire Damage", "price": 1150},
  {"name": "Frostbite Bow", "type": "weapon", "stats": {"Spd": 48}, "special": "Ice Damage", "price": 1150},
  {"name": "Orb of Wisdom", "type": "accessory", "stats": {"Int": 45, "Luck": 20}, "price": 1130},
  {"name": "Titan Gauntlets", "type": "armor", "stats": {"Str": 40, "Spd": 20}, "price": 1050},
  {"name": "Lightning Hammer", "type": "weapon", "stats": {"Str": 48}, "special": "Lightning AoE", "price": 1150},
  {"name": "Mystic Staff", "type": "weapon", "stats": {"Int": 50}, "special": "Mana Regen", "price": 1150},
  {"name": "Ring of Omniscience", "type": "accessory", "stats": {"Luck": 45}, "price": 1150},
];

const tier4Items: Omit<Item, "id" | "tier">[] = [
  {"name": "Oblivion Fang", "type": "weapon", "stats": {"Str": 80, "Luck": 50}, "price": 10000},
  {"name": "Eternal Eclipse Blade", "type": "weapon", "stats": {"Str": 85, "Spd": 45}, "price": 10500},
  {"name": "Archmage's Eternal Robe", "type": "armor", "stats": {"Int": 85, "Luck": 50}, "price": 10500},
  {"name": "Shadow Eclipse Mantle", "type": "armor", "stats": {"Spd": 80, "Luck": 50}, "price": 10200},
  {"name": "Phoenix Soul Saber", "type": "weapon", "stats": {"Str": 90}, "special": "Fire AoE 40", "price": 11000},
  {"name": "Frost Reaper Bow", "type": "weapon", "stats": {"Spd": 88}, "special": "Ice Damage 45", "price": 11000},
  {"name": "Orb of Divine Insight", "type": "accessory", "stats": {"Int": 85, "Luck": 45}, "price": 10700},
  {"name": "Titan's Gauntlets", "type": "armor", "stats": {"Str": 80, "Spd": 50}, "price": 10200},
  {"name": "Lightning Devastator", "type": "weapon", "stats": {"Str": 90}, "special": "Lightning AoE", "price": 11000},
  {"name": "Mystic Grand Staff", "type": "weapon", "stats": {"Int": 90}, "special": "Mana Regen", "price": 11000},
  {"name": "Ring of Eternal Omniscience", "type": "accessory", "stats": {"Luck": 90}, "price": 11000},
  {"name": "Pendant of Absolute Luck", "type": "accessory", "stats": {"Luck": 90, "Str": 45}, "price": 11200},
];

const tier5Items: Omit<Item, "id" | "tier">[] = [
  {"name": "Godslayer Blade", "type": "weapon", "stats": {"Str": 150, "Luck": 100}, "price": 100000},
  {"name": "Celestial Bow", "type": "weapon", "stats": {"Spd": 150, "Luck": 100}, "price": 100000},
  {"name": "Divine Staff", "type": "weapon", "stats": {"Int": 150}, "special": "Divine AoE", "price": 100000},
  {"name": "Omnipotent Armor", "type": "armor", "stats": {"Str": 100, "Spd": 100, "Int": 100, "Luck": 100}, "price": 120000},
  {"name": "Crown of the Gods", "type": "accessory", "stats": {"Int": 120, "Luck": 80}, "price": 95000},
  {"name": "Eternal Flame Saber", "type": "weapon", "stats": {"Str": 160}, "special": "Inferno", "price": 110000},
  {"name": "Frostfall Reaper", "type": "weapon", "stats": {"Spd": 155}, "special": "Absolute Zero", "price": 110000},
  {"name": "Amulet of Infinity", "type": "accessory", "stats": {"Luck": 150, "Str": 80}, "price": 115000},
  {"name": "World Ender", "type": "weapon", "stats": {"Str": 200}, "special": "Apocalypse", "price": 150000},
  {"name": "Ethereal Mantle", "type": "armor", "stats": {"Int": 140, "Spd": 60}, "special": "Phase Shift", "price": 125000},
];

const tier6Items: Omit<Item, "id" | "tier">[] = [
  {"name": "Primordial Void Blade", "type": "weapon", "stats": {"Str": 300, "Luck": 200}, "special": "Reality Rend", "price": 500000},
  {"name": "Astral Annihilator Bow", "type": "weapon", "stats": {"Spd": 300, "Luck": 200}, "special": "Cosmic Arrow", "price": 500000},
  {"name": "Staff of Infinite Cosmos", "type": "weapon", "stats": {"Int": 350}, "special": "Dimensional Rift", "price": 550000},
  {"name": "Armor of the First Light", "type": "armor", "stats": {"Str": 200, "Spd": 200, "Int": 200, "Luck": 200}, "special": "Divine Shield", "price": 650000},
  {"name": "Crown of Eternal Dominion", "type": "accessory", "stats": {"Int": 250, "Luck": 180}, "special": "Mind Control", "price": 480000},
  {"name": "Blade of Shattered Realities", "type": "weapon", "stats": {"Str": 350, "Spd": 150}, "special": "Dimension Slash", "price": 580000},
  {"name": "Frostfire Extinction", "type": "weapon", "stats": {"Spd": 320, "Int": 100}, "special": "Elemental Oblivion", "price": 560000},
  {"name": "Ring of Omnipotence", "type": "accessory", "stats": {"Luck": 300, "Str": 150}, "special": "Fate Manipulation", "price": 600000},
  {"name": "The Oblivion Hammer", "type": "weapon", "stats": {"Str": 400}, "special": "Extinction Event", "price": 750000},
  {"name": "Vestments of Creation", "type": "armor", "stats": {"Int": 280, "Spd": 120}, "special": "Genesis Barrier", "price": 620000},
  {"name": "Pendant of Primordial Power", "type": "accessory", "stats": {"Str": 200, "Int": 200, "Luck": 100}, "special": "Power Surge", "price": 550000},
  {"name": "Gauntlets of the Divine", "type": "armor", "stats": {"Str": 250, "Spd": 180}, "special": "Crushing Divinity", "price": 580000},
];

const journeymanItems: Omit<Item, "id" | "tier">[] = [
  {"name": "Journeyman's Warblade", "type": "weapon", "stats": {"Str": 500, "Luck": 300}, "special": "Veteran Strike", "price": 1500000},
  {"name": "Wanderer's Longbow", "type": "weapon", "stats": {"Spd": 500, "Luck": 300}, "special": "Precision Shot", "price": 1500000},
  {"name": "Staff of Learned Wisdom", "type": "weapon", "stats": {"Int": 550}, "special": "Knowledge Burst", "price": 1600000},
  {"name": "Traveler's Plate", "type": "armor", "stats": {"Str": 350, "Spd": 350, "Int": 200, "Luck": 200}, "special": "Road Ward", "price": 1800000},
  {"name": "Medallion of Experience", "type": "accessory", "stats": {"Int": 400, "Luck": 280}, "special": "Wisdom Aura", "price": 1400000},
  {"name": "Blade of Many Battles", "type": "weapon", "stats": {"Str": 550, "Spd": 200}, "special": "War Memory", "price": 1700000},
  {"name": "Cloak of the Traveler", "type": "armor", "stats": {"Spd": 450, "Luck": 300}, "special": "Swift Passage", "price": 1550000},
  {"name": "Ring of Earned Glory", "type": "accessory", "stats": {"Luck": 450, "Str": 200}, "special": "Glory Surge", "price": 1650000},
];

const expertItems: Omit<Item, "id" | "tier">[] = [
  {"name": "Expert's Decimator", "type": "weapon", "stats": {"Str": 800, "Luck": 500}, "special": "Mastered Blow", "price": 5000000},
  {"name": "Precision Destroyer Bow", "type": "weapon", "stats": {"Spd": 800, "Luck": 500}, "special": "Perfect Aim", "price": 5000000},
  {"name": "Arcane Mastery Staff", "type": "weapon", "stats": {"Int": 900}, "special": "Spell Mastery", "price": 5500000},
  {"name": "Expert Battlewear", "type": "armor", "stats": {"Str": 550, "Spd": 550, "Int": 400, "Luck": 400}, "special": "Combat Mastery", "price": 6000000},
  {"name": "Amulet of Expertise", "type": "accessory", "stats": {"Int": 650, "Luck": 450}, "special": "Expert Knowledge", "price": 4800000},
  {"name": "Blade of a Thousand Cuts", "type": "weapon", "stats": {"Str": 850, "Spd": 400}, "special": "Flurry Master", "price": 5800000},
  {"name": "Expert's Aegis", "type": "armor", "stats": {"Spd": 700, "Int": 500}, "special": "Perfect Defense", "price": 5200000},
  {"name": "Ring of True Skill", "type": "accessory", "stats": {"Luck": 700, "Str": 350}, "special": "Skill Enhancement", "price": 5500000},
];

const masterItems: Omit<Item, "id" | "tier">[] = [
  {"name": "Master's Worldbreaker", "type": "weapon", "stats": {"Str": 1200, "Luck": 800}, "special": "Continental Slash", "price": 15000000},
  {"name": "Bow of the Grandmaster", "type": "weapon", "stats": {"Spd": 1200, "Luck": 800}, "special": "Instant Kill Shot", "price": 15000000},
  {"name": "Staff of Supreme Sorcery", "type": "weapon", "stats": {"Int": 1400}, "special": "Ultimate Arcana", "price": 16000000},
  {"name": "Master's Transcendent Armor", "type": "armor", "stats": {"Str": 900, "Spd": 900, "Int": 700, "Luck": 700}, "special": "Absolute Defense", "price": 18000000},
  {"name": "Crown of Mastery", "type": "accessory", "stats": {"Int": 1000, "Luck": 700}, "special": "Mind Dominion", "price": 14000000},
  {"name": "Blade of Utter Devastation", "type": "weapon", "stats": {"Str": 1350, "Spd": 600}, "special": "Annihilate", "price": 17000000},
  {"name": "Master's Shroud", "type": "armor", "stats": {"Spd": 1100, "Int": 800}, "special": "Shadow Master", "price": 15500000},
  {"name": "Ring of Absolute Power", "type": "accessory", "stats": {"Luck": 1100, "Str": 550}, "special": "Power Unlimited", "price": 16000000},
];

const grandmasterItems: Omit<Item, "id" | "tier">[] = [
  {"name": "Grandmaster's Galaxy Edge", "type": "weapon", "stats": {"Str": 1800, "Luck": 1200}, "special": "Cosmic Cleave", "price": 50000000},
  {"name": "Bow of Stellar Destruction", "type": "weapon", "stats": {"Spd": 1800, "Luck": 1200}, "special": "Star Piercer", "price": 50000000},
  {"name": "Staff of Universal Law", "type": "weapon", "stats": {"Int": 2200}, "special": "Reality Warp", "price": 55000000},
  {"name": "Grandmaster's Cosmic Plate", "type": "armor", "stats": {"Str": 1400, "Spd": 1400, "Int": 1100, "Luck": 1100}, "special": "Cosmic Shield", "price": 60000000},
  {"name": "Pendant of the Cosmos", "type": "accessory", "stats": {"Int": 1600, "Luck": 1100}, "special": "Universal Wisdom", "price": 48000000},
  {"name": "Blade of Infinite Stars", "type": "weapon", "stats": {"Str": 2000, "Spd": 1000}, "special": "Supernova Strike", "price": 58000000},
  {"name": "Grandmaster's Void Cloak", "type": "armor", "stats": {"Spd": 1700, "Int": 1300}, "special": "Void Walk", "price": 52000000},
  {"name": "Ring of Cosmic Authority", "type": "accessory", "stats": {"Luck": 1700, "Str": 900}, "special": "Cosmic Command", "price": 54000000},
];

const legendItems: Omit<Item, "id" | "tier">[] = [
  {"name": "Legendary Realm Splitter", "type": "weapon", "stats": {"Str": 2800, "Luck": 1800}, "special": "Dimension Breaker", "price": 150000000},
  {"name": "Bow of Mythic Legends", "type": "weapon", "stats": {"Spd": 2800, "Luck": 1800}, "special": "Legend's Arrow", "price": 150000000},
  {"name": "Staff of Eternal Myth", "type": "weapon", "stats": {"Int": 3400}, "special": "Mythic Storm", "price": 165000000},
  {"name": "Legendary Hero's Armor", "type": "armor", "stats": {"Str": 2200, "Spd": 2200, "Int": 1700, "Luck": 1700}, "special": "Heroic Aura", "price": 180000000},
  {"name": "Heart of Legends", "type": "accessory", "stats": {"Int": 2500, "Luck": 1700}, "special": "Legendary Will", "price": 140000000},
  {"name": "Blade of Ancient Heroes", "type": "weapon", "stats": {"Str": 3100, "Spd": 1500}, "special": "Hero's Legacy", "price": 175000000},
  {"name": "Legendary Shadowweave", "type": "armor", "stats": {"Spd": 2600, "Int": 2000}, "special": "Legend's Cloak", "price": 158000000},
  {"name": "Ring of Timeless Glory", "type": "accessory", "stats": {"Luck": 2600, "Str": 1400}, "special": "Eternal Fame", "price": 162000000},
];

const eliteItems: Omit<Item, "id" | "tier">[] = [
  {"name": "Elite Omega Destroyer", "type": "weapon", "stats": {"Str": 5000, "Luck": 3000}, "special": "Omega Strike", "price": 500000000},
  {"name": "Bow of Ultimate Annihilation", "type": "weapon", "stats": {"Spd": 5000, "Luck": 3000}, "special": "Total Erasure", "price": 500000000},
  {"name": "Staff of Absolute Infinity", "type": "weapon", "stats": {"Int": 6000}, "special": "Infinity Cascade", "price": 550000000},
  {"name": "Elite Transcendence Armor", "type": "armor", "stats": {"Str": 4000, "Spd": 4000, "Int": 3000, "Luck": 3000}, "special": "Transcendent Shield", "price": 600000000},
  {"name": "Crown of the Elite", "type": "accessory", "stats": {"Int": 4500, "Luck": 3000}, "special": "Elite Dominion", "price": 480000000},
  {"name": "Blade of Final Reckoning", "type": "weapon", "stats": {"Str": 5500, "Spd": 2800}, "special": "Armageddon", "price": 580000000},
  {"name": "Elite Voidweave Mantle", "type": "armor", "stats": {"Spd": 4700, "Int": 3500}, "special": "Void Mastery", "price": 520000000},
  {"name": "Ring of Ultimate Supremacy", "type": "accessory", "stats": {"Luck": 4700, "Str": 2500}, "special": "Supreme Authority", "price": 540000000},
];

function generateItems(items: Omit<Item, "id" | "tier">[], tier: ItemTier): Item[] {
  return items.map((item, index) => ({
    ...item,
    id: `${tier}-${index}`,
    tier,
  }));
}

export const ALL_ITEMS: Item[] = [
  ...generateItems(tier1Items, "normal"),
  ...generateItems(tier2Items, "super_rare"),
  ...generateItems(tier3Items, "x_tier"),
  ...generateItems(tier4Items, "umr"),
  ...generateItems(tier5Items, "ssumr"),
  ...generateItems(tier6Items, "divine"),
  ...generateItems(journeymanItems, "journeyman"),
  ...generateItems(expertItems, "expert"),
  ...generateItems(masterItems, "master"),
  ...generateItems(grandmasterItems, "grandmaster"),
  ...generateItems(legendItems, "legend"),
  ...generateItems(eliteItems, "elite"),
];

export function getItemsByTier(tier: ItemTier): Item[] {
  return ALL_ITEMS.filter((item) => item.tier === tier);
}

export function getItemById(id: string): Item | undefined {
  return ALL_ITEMS.find((item) => item.id === id);
}

export const TIER_LABELS: Record<ItemTier, string> = {
  normal: "Normal / Rare",
  super_rare: "Super Rare",
  x_tier: "X-Tier",
  umr: "Ultra Mythic Rare",
  ssumr: "SSUMR",
  divine: "Divine",
  journeyman: "Journeyman",
  expert: "Expert",
  master: "Master",
  grandmaster: "Grandmaster",
  legend: "Legend",
  elite: "Elite",
};
