export type SkillRarity = "common" | "uncommon" | "rare" | "epic" | "legendary" | "mythic";

export type SkillEffect = {
  type: "stat_boost" | "damage" | "heal" | "shield" | "lifesteal" | "critical" | "dodge" | "reflect" | "burn" | "freeze" | "stun" | "buff" | "debuff";
  stat?: "STR" | "INT" | "AGI" | "VIT" | "Luck" | "all";
  value: number;
  duration?: number;
  chance?: number;
};

export type SkillDefinition = {
  id: string;
  name: string;
  description: string;
  rarity: SkillRarity;
  effects: SkillEffect[];
  cooldown: number;
  manaCost: number;
  icon: string;
};

export const ALL_SKILLS: SkillDefinition[] = [
  { id: "skill_001", name: "Flame Strike", description: "Unleash a devastating fire attack that burns enemies", rarity: "common", effects: [{ type: "damage", value: 150 }, { type: "burn", value: 30, duration: 3 }], cooldown: 5, manaCost: 20, icon: "flame" },
  { id: "skill_002", name: "Frost Nova", description: "Freeze nearby enemies with an icy blast", rarity: "common", effects: [{ type: "damage", value: 120 }, { type: "freeze", value: 2, duration: 2 }], cooldown: 6, manaCost: 25, icon: "snowflake" },
  { id: "skill_003", name: "Thunder Bolt", description: "Call down lightning to strike your foes", rarity: "common", effects: [{ type: "damage", value: 180 }, { type: "stun", chance: 25, value: 1 }], cooldown: 4, manaCost: 18, icon: "zap" },
  { id: "skill_004", name: "Healing Light", description: "Restore health with divine energy", rarity: "common", effects: [{ type: "heal", value: 200 }], cooldown: 8, manaCost: 30, icon: "heart" },
  { id: "skill_005", name: "Iron Skin", description: "Harden your body to reduce incoming damage", rarity: "common", effects: [{ type: "shield", value: 150, duration: 5 }], cooldown: 10, manaCost: 25, icon: "shield" },
  { id: "skill_006", name: "Quick Strike", description: "A swift attack that increases agility", rarity: "common", effects: [{ type: "damage", value: 100 }, { type: "stat_boost", stat: "AGI", value: 10, duration: 3 }], cooldown: 3, manaCost: 12, icon: "sword" },
  { id: "skill_007", name: "Power Surge", description: "Boost your strength temporarily", rarity: "common", effects: [{ type: "stat_boost", stat: "STR", value: 20, duration: 5 }], cooldown: 12, manaCost: 20, icon: "trending-up" },
  { id: "skill_008", name: "Mind Focus", description: "Sharpen your intellect for better spells", rarity: "common", effects: [{ type: "stat_boost", stat: "INT", value: 20, duration: 5 }], cooldown: 12, manaCost: 20, icon: "brain" },
  { id: "skill_009", name: "Lucky Charm", description: "Increase your fortune temporarily", rarity: "common", effects: [{ type: "stat_boost", stat: "Luck", value: 15, duration: 10 }], cooldown: 15, manaCost: 15, icon: "clover" },
  { id: "skill_010", name: "Vitality Boost", description: "Enhance your life force", rarity: "common", effects: [{ type: "stat_boost", stat: "VIT", value: 25, duration: 5 }], cooldown: 12, manaCost: 22, icon: "heart-pulse" },
  { id: "skill_011", name: "Shadow Step", description: "Evade attacks with shadow magic", rarity: "uncommon", effects: [{ type: "dodge", value: 30, duration: 3 }], cooldown: 8, manaCost: 28, icon: "ghost" },
  { id: "skill_012", name: "Blood Drain", description: "Steal life from your enemies", rarity: "uncommon", effects: [{ type: "damage", value: 130 }, { type: "lifesteal", value: 40 }], cooldown: 7, manaCost: 32, icon: "droplet" },
  { id: "skill_013", name: "Mirror Shield", description: "Reflect damage back at attackers", rarity: "uncommon", effects: [{ type: "reflect", value: 25, duration: 4 }], cooldown: 10, manaCost: 35, icon: "layers" },
  { id: "skill_014", name: "Critical Eye", description: "Increase critical hit chance", rarity: "uncommon", effects: [{ type: "critical", value: 20, duration: 5 }], cooldown: 9, manaCost: 25, icon: "eye" },
  { id: "skill_015", name: "Earthquake", description: "Shake the ground to damage all enemies", rarity: "uncommon", effects: [{ type: "damage", value: 200 }, { type: "stun", chance: 15, value: 1 }], cooldown: 8, manaCost: 40, icon: "mountain" },
  { id: "skill_016", name: "Wind Slash", description: "Cut through enemies with razor wind", rarity: "uncommon", effects: [{ type: "damage", value: 160 }, { type: "stat_boost", stat: "AGI", value: 5, duration: 2 }], cooldown: 4, manaCost: 22, icon: "wind" },
  { id: "skill_017", name: "Poison Cloud", description: "Create a toxic cloud that damages over time", rarity: "uncommon", effects: [{ type: "damage", value: 80 }, { type: "burn", value: 50, duration: 5 }], cooldown: 7, manaCost: 30, icon: "cloud" },
  { id: "skill_018", name: "Stone Armor", description: "Encase yourself in protective stone", rarity: "uncommon", effects: [{ type: "shield", value: 250, duration: 6 }], cooldown: 12, manaCost: 35, icon: "brick-wall" },
  { id: "skill_019", name: "Light Beam", description: "Channel pure light energy", rarity: "uncommon", effects: [{ type: "damage", value: 170 }, { type: "heal", value: 50 }], cooldown: 6, manaCost: 28, icon: "sun" },
  { id: "skill_020", name: "Dark Pulse", description: "Emit waves of darkness", rarity: "uncommon", effects: [{ type: "damage", value: 190 }, { type: "debuff", stat: "all", value: -5, duration: 3 }], cooldown: 7, manaCost: 32, icon: "moon" },
  { id: "skill_021", name: "Berserker Rage", description: "Enter a furious state of combat", rarity: "rare", effects: [{ type: "stat_boost", stat: "STR", value: 50, duration: 8 }, { type: "stat_boost", stat: "AGI", value: 30, duration: 8 }], cooldown: 20, manaCost: 50, icon: "angry" },
  { id: "skill_022", name: "Arcane Barrier", description: "Create a magical shield that absorbs damage", rarity: "rare", effects: [{ type: "shield", value: 400, duration: 8 }], cooldown: 15, manaCost: 45, icon: "sparkles" },
  { id: "skill_023", name: "Phoenix Fire", description: "Rise from the ashes with burning fury", rarity: "rare", effects: [{ type: "damage", value: 300 }, { type: "heal", value: 150 }, { type: "burn", value: 40, duration: 4 }], cooldown: 12, manaCost: 55, icon: "bird" },
  { id: "skill_024", name: "Ice Prison", description: "Trap enemies in unbreakable ice", rarity: "rare", effects: [{ type: "freeze", value: 4, duration: 4 }, { type: "damage", value: 180 }], cooldown: 14, manaCost: 48, icon: "box" },
  { id: "skill_025", name: "Soul Harvest", description: "Consume souls to restore health and power", rarity: "rare", effects: [{ type: "lifesteal", value: 60 }, { type: "damage", value: 250 }], cooldown: 10, manaCost: 42, icon: "ghost" },
  { id: "skill_026", name: "Thunder Storm", description: "Summon a devastating electrical storm", rarity: "rare", effects: [{ type: "damage", value: 280 }, { type: "stun", chance: 40, value: 2 }], cooldown: 15, manaCost: 52, icon: "cloud-lightning" },
  { id: "skill_027", name: "Nature's Blessing", description: "Channel the power of nature to heal and protect", rarity: "rare", effects: [{ type: "heal", value: 350 }, { type: "stat_boost", stat: "VIT", value: 30, duration: 10 }], cooldown: 18, manaCost: 48, icon: "leaf" },
  { id: "skill_028", name: "Assassin's Mark", description: "Mark a target for critical damage", rarity: "rare", effects: [{ type: "critical", value: 50, duration: 3 }, { type: "damage", value: 220 }], cooldown: 11, manaCost: 38, icon: "crosshair" },
  { id: "skill_029", name: "Dragon Breath", description: "Breathe fire like a mighty dragon", rarity: "rare", effects: [{ type: "damage", value: 320 }, { type: "burn", value: 60, duration: 5 }], cooldown: 14, manaCost: 55, icon: "flame" },
  { id: "skill_030", name: "Time Warp", description: "Slow down time around you", rarity: "rare", effects: [{ type: "stat_boost", stat: "AGI", value: 60, duration: 5 }, { type: "dodge", value: 25, duration: 5 }], cooldown: 16, manaCost: 50, icon: "clock" },
  { id: "skill_031", name: "Meteor Strike", description: "Call down a meteor from the heavens", rarity: "epic", effects: [{ type: "damage", value: 500 }, { type: "burn", value: 80, duration: 4 }, { type: "stun", chance: 30, value: 2 }], cooldown: 20, manaCost: 70, icon: "star" },
  { id: "skill_032", name: "Divine Protection", description: "Invoke the gods for absolute protection", rarity: "epic", effects: [{ type: "shield", value: 600, duration: 10 }, { type: "heal", value: 200 }], cooldown: 25, manaCost: 65, icon: "shield-check" },
  { id: "skill_033", name: "Void Walker", description: "Phase through reality to avoid all damage", rarity: "epic", effects: [{ type: "dodge", value: 80, duration: 3 }, { type: "damage", value: 300 }], cooldown: 18, manaCost: 60, icon: "circle-dot" },
  { id: "skill_034", name: "Plague Touch", description: "Inflict a devastating plague on enemies", rarity: "epic", effects: [{ type: "damage", value: 200 }, { type: "burn", value: 100, duration: 8 }, { type: "debuff", stat: "all", value: -15, duration: 5 }], cooldown: 22, manaCost: 68, icon: "skull" },
  { id: "skill_035", name: "Celestial Strike", description: "Channel the power of the stars", rarity: "epic", effects: [{ type: "damage", value: 450 }, { type: "stat_boost", stat: "INT", value: 40, duration: 6 }], cooldown: 16, manaCost: 62, icon: "sparkle" },
  { id: "skill_036", name: "Blood Pact", description: "Sacrifice health for immense power", rarity: "epic", effects: [{ type: "stat_boost", stat: "STR", value: 80, duration: 8 }, { type: "stat_boost", stat: "AGI", value: 60, duration: 8 }], cooldown: 24, manaCost: 75, icon: "droplets" },
  { id: "skill_037", name: "Absolute Zero", description: "Freeze everything to absolute zero", rarity: "epic", effects: [{ type: "damage", value: 380 }, { type: "freeze", value: 5, duration: 5 }], cooldown: 20, manaCost: 65, icon: "thermometer-snowflake" },
  { id: "skill_038", name: "Spirit Link", description: "Link your spirit to heal and protect allies", rarity: "epic", effects: [{ type: "heal", value: 500 }, { type: "shield", value: 300, duration: 6 }], cooldown: 22, manaCost: 70, icon: "link" },
  { id: "skill_039", name: "Chain Lightning", description: "Lightning that jumps between enemies", rarity: "epic", effects: [{ type: "damage", value: 350 }, { type: "stun", chance: 50, value: 1 }], cooldown: 14, manaCost: 55, icon: "zap" },
  { id: "skill_040", name: "Shadow Clone", description: "Create a shadow clone to confuse enemies", rarity: "epic", effects: [{ type: "dodge", value: 50, duration: 6 }, { type: "damage", value: 280 }], cooldown: 18, manaCost: 58, icon: "copy" },
  { id: "skill_041", name: "Apocalypse", description: "Bring about the end of all things", rarity: "legendary", effects: [{ type: "damage", value: 800 }, { type: "burn", value: 120, duration: 6 }, { type: "stun", chance: 60, value: 3 }], cooldown: 30, manaCost: 100, icon: "bomb" },
  { id: "skill_042", name: "Immortal's Blessing", description: "Become temporarily unkillable", rarity: "legendary", effects: [{ type: "shield", value: 1000, duration: 8 }, { type: "heal", value: 500 }, { type: "stat_boost", stat: "all", value: 30, duration: 8 }], cooldown: 35, manaCost: 95, icon: "infinity" },
  { id: "skill_043", name: "Dimensional Rift", description: "Tear open a rift in space-time", rarity: "legendary", effects: [{ type: "damage", value: 700 }, { type: "dodge", value: 60, duration: 5 }, { type: "critical", value: 40, duration: 5 }], cooldown: 28, manaCost: 90, icon: "orbit" },
  { id: "skill_044", name: "Soul Reaper", description: "Reap the souls of all nearby enemies", rarity: "legendary", effects: [{ type: "damage", value: 600 }, { type: "lifesteal", value: 100 }], cooldown: 25, manaCost: 85, icon: "ghost" },
  { id: "skill_045", name: "Primal Fury", description: "Unleash your primal beast form", rarity: "legendary", effects: [{ type: "stat_boost", stat: "STR", value: 100, duration: 10 }, { type: "stat_boost", stat: "AGI", value: 80, duration: 10 }, { type: "critical", value: 35, duration: 10 }], cooldown: 32, manaCost: 92, icon: "paw-print" },
  { id: "skill_046", name: "Cosmic Ray", description: "Channel energy from distant galaxies", rarity: "legendary", effects: [{ type: "damage", value: 750 }, { type: "stat_boost", stat: "INT", value: 70, duration: 6 }], cooldown: 26, manaCost: 88, icon: "rocket" },
  { id: "skill_047", name: "Eternal Frost", description: "Summon never-melting ice to entomb enemies", rarity: "legendary", effects: [{ type: "damage", value: 550 }, { type: "freeze", value: 8, duration: 8 }], cooldown: 30, manaCost: 95, icon: "snowflake" },
  { id: "skill_048", name: "Life Steal Ultimate", description: "Drain massive life from all enemies", rarity: "legendary", effects: [{ type: "damage", value: 650 }, { type: "lifesteal", value: 150 }, { type: "heal", value: 300 }], cooldown: 28, manaCost: 90, icon: "heart" },
  { id: "skill_049", name: "Titan's Might", description: "Gain the strength of ancient titans", rarity: "legendary", effects: [{ type: "stat_boost", stat: "STR", value: 150, duration: 12 }, { type: "shield", value: 500, duration: 12 }], cooldown: 35, manaCost: 98, icon: "dumbbell" },
  { id: "skill_050", name: "Oracle's Vision", description: "See the future to dodge all attacks", rarity: "legendary", effects: [{ type: "dodge", value: 100, duration: 4 }, { type: "critical", value: 50, duration: 4 }], cooldown: 30, manaCost: 85, icon: "eye" },
  { id: "skill_051", name: "Genesis", description: "Create life from nothing to heal massively", rarity: "mythic", effects: [{ type: "heal", value: 1000 }, { type: "shield", value: 800, duration: 10 }, { type: "stat_boost", stat: "all", value: 50, duration: 10 }], cooldown: 45, manaCost: 120, icon: "sparkles" },
  { id: "skill_052", name: "Armageddon", description: "Bring total destruction upon all enemies", rarity: "mythic", effects: [{ type: "damage", value: 1200 }, { type: "burn", value: 200, duration: 8 }, { type: "stun", chance: 80, value: 4 }], cooldown: 50, manaCost: 150, icon: "flame" },
  { id: "skill_053", name: "Transcendence", description: "Transcend mortal limits temporarily", rarity: "mythic", effects: [{ type: "stat_boost", stat: "all", value: 100, duration: 15 }, { type: "dodge", value: 50, duration: 15 }, { type: "critical", value: 60, duration: 15 }], cooldown: 60, manaCost: 140, icon: "sunrise" },
  { id: "skill_054", name: "Oblivion", description: "Send enemies into the void of oblivion", rarity: "mythic", effects: [{ type: "damage", value: 1000 }, { type: "debuff", stat: "all", value: -50, duration: 8 }], cooldown: 45, manaCost: 130, icon: "circle-off" },
  { id: "skill_055", name: "Eternity's Embrace", description: "Embrace the power of eternity itself", rarity: "mythic", effects: [{ type: "shield", value: 1500, duration: 12 }, { type: "heal", value: 800 }, { type: "reflect", value: 50, duration: 12 }], cooldown: 55, manaCost: 145, icon: "hourglass" },
  { id: "skill_056", name: "Ember Slash", description: "A fiery blade technique", rarity: "common", effects: [{ type: "damage", value: 140 }, { type: "burn", value: 25, duration: 2 }], cooldown: 4, manaCost: 18, icon: "sword" },
  { id: "skill_057", name: "Aqua Shield", description: "A water barrier that absorbs damage", rarity: "common", effects: [{ type: "shield", value: 120, duration: 4 }], cooldown: 8, manaCost: 20, icon: "droplet" },
  { id: "skill_058", name: "Stone Throw", description: "Hurl a heavy rock at enemies", rarity: "common", effects: [{ type: "damage", value: 130 }, { type: "stun", chance: 10, value: 1 }], cooldown: 5, manaCost: 15, icon: "circle" },
  { id: "skill_059", name: "Gust", description: "A quick burst of wind", rarity: "common", effects: [{ type: "damage", value: 90 }, { type: "stat_boost", stat: "AGI", value: 8, duration: 2 }], cooldown: 3, manaCost: 10, icon: "wind" },
  { id: "skill_060", name: "Spark", description: "A small electrical shock", rarity: "common", effects: [{ type: "damage", value: 110 }], cooldown: 2, manaCost: 8, icon: "zap" },
  { id: "skill_061", name: "Mend", description: "Minor healing spell", rarity: "common", effects: [{ type: "heal", value: 150 }], cooldown: 6, manaCost: 22, icon: "bandage" },
  { id: "skill_062", name: "Toughness", description: "Temporarily increase defense", rarity: "common", effects: [{ type: "stat_boost", stat: "VIT", value: 15, duration: 4 }], cooldown: 10, manaCost: 18, icon: "shield" },
  { id: "skill_063", name: "Focus", description: "Concentrate to boost intellect", rarity: "common", effects: [{ type: "stat_boost", stat: "INT", value: 12, duration: 4 }], cooldown: 10, manaCost: 16, icon: "target" },
  { id: "skill_064", name: "Might", description: "Increase physical power briefly", rarity: "common", effects: [{ type: "stat_boost", stat: "STR", value: 12, duration: 4 }], cooldown: 10, manaCost: 16, icon: "swords" },
  { id: "skill_065", name: "Swift Feet", description: "Move faster for a short time", rarity: "common", effects: [{ type: "stat_boost", stat: "AGI", value: 12, duration: 4 }], cooldown: 10, manaCost: 16, icon: "footprints" },
  { id: "skill_066", name: "Lava Burst", description: "Erupt with molten lava", rarity: "uncommon", effects: [{ type: "damage", value: 200 }, { type: "burn", value: 45, duration: 4 }], cooldown: 8, manaCost: 35, icon: "mountain" },
  { id: "skill_067", name: "Tidal Wave", description: "Summon a massive wave", rarity: "uncommon", effects: [{ type: "damage", value: 180 }, { type: "stat_boost", stat: "INT", value: 15, duration: 3 }], cooldown: 9, manaCost: 38, icon: "waves" },
  { id: "skill_068", name: "Rock Slide", description: "Cause rocks to fall on enemies", rarity: "uncommon", effects: [{ type: "damage", value: 220 }, { type: "stun", chance: 20, value: 1 }], cooldown: 10, manaCost: 40, icon: "mountain-snow" },
  { id: "skill_069", name: "Tornado", description: "Create a small tornado", rarity: "uncommon", effects: [{ type: "damage", value: 175 }, { type: "dodge", value: 20, duration: 2 }], cooldown: 8, manaCost: 34, icon: "tornado" },
  { id: "skill_070", name: "Static Field", description: "Create an electrical field", rarity: "uncommon", effects: [{ type: "damage", value: 160 }, { type: "stun", chance: 30, value: 1 }], cooldown: 7, manaCost: 32, icon: "radio" },
  { id: "skill_071", name: "Regenerate", description: "Heal over time", rarity: "uncommon", effects: [{ type: "heal", value: 100 }, { type: "heal", value: 50 }], cooldown: 12, manaCost: 30, icon: "refresh-cw" },
  { id: "skill_072", name: "Barrier", description: "Create a protective barrier", rarity: "uncommon", effects: [{ type: "shield", value: 220, duration: 5 }], cooldown: 11, manaCost: 33, icon: "square" },
  { id: "skill_073", name: "Precision", description: "Boost critical hit rate", rarity: "uncommon", effects: [{ type: "critical", value: 25, duration: 4 }], cooldown: 10, manaCost: 28, icon: "crosshair" },
  { id: "skill_074", name: "Evasion", description: "Increase dodge chance", rarity: "uncommon", effects: [{ type: "dodge", value: 35, duration: 3 }], cooldown: 9, manaCost: 26, icon: "move" },
  { id: "skill_075", name: "Vampiric Strike", description: "Drain life with each hit", rarity: "uncommon", effects: [{ type: "damage", value: 150 }, { type: "lifesteal", value: 50 }], cooldown: 8, manaCost: 35, icon: "droplet" },
  { id: "skill_076", name: "Inferno", description: "Create a massive fire explosion", rarity: "rare", effects: [{ type: "damage", value: 350 }, { type: "burn", value: 70, duration: 5 }], cooldown: 14, manaCost: 52, icon: "flame" },
  { id: "skill_077", name: "Blizzard", description: "Summon a freezing blizzard", rarity: "rare", effects: [{ type: "damage", value: 300 }, { type: "freeze", value: 3, duration: 3 }], cooldown: 15, manaCost: 55, icon: "cloud-snow" },
  { id: "skill_078", name: "Quake", description: "Shake the very earth", rarity: "rare", effects: [{ type: "damage", value: 330 }, { type: "stun", chance: 35, value: 2 }], cooldown: 16, manaCost: 58, icon: "activity" },
  { id: "skill_079", name: "Cyclone", description: "Create a powerful cyclone", rarity: "rare", effects: [{ type: "damage", value: 280 }, { type: "stat_boost", stat: "AGI", value: 40, duration: 4 }], cooldown: 13, manaCost: 48, icon: "loader" },
  { id: "skill_080", name: "Overcharge", description: "Overload with electrical power", rarity: "rare", effects: [{ type: "damage", value: 360 }, { type: "stun", chance: 45, value: 2 }], cooldown: 15, manaCost: 54, icon: "battery-charging" },
  { id: "skill_081", name: "Divine Heal", description: "Powerful holy healing", rarity: "rare", effects: [{ type: "heal", value: 450 }], cooldown: 16, manaCost: 50, icon: "cross" },
  { id: "skill_082", name: "Fortress", description: "Become an immovable fortress", rarity: "rare", effects: [{ type: "shield", value: 450, duration: 7 }, { type: "stat_boost", stat: "VIT", value: 35, duration: 7 }], cooldown: 18, manaCost: 55, icon: "castle" },
  { id: "skill_083", name: "Deadly Precision", description: "Guarantee critical hits", rarity: "rare", effects: [{ type: "critical", value: 60, duration: 4 }], cooldown: 14, manaCost: 45, icon: "target" },
  { id: "skill_084", name: "Phase Shift", description: "Phase through attacks", rarity: "rare", effects: [{ type: "dodge", value: 60, duration: 4 }], cooldown: 12, manaCost: 42, icon: "git-branch" },
  { id: "skill_085", name: "Soul Drain", description: "Drain souls for massive healing", rarity: "rare", effects: [{ type: "damage", value: 270 }, { type: "lifesteal", value: 80 }], cooldown: 13, manaCost: 48, icon: "ghost" },
  { id: "skill_086", name: "Supernova", description: "Explode like a dying star", rarity: "epic", effects: [{ type: "damage", value: 550 }, { type: "burn", value: 100, duration: 5 }], cooldown: 22, manaCost: 75, icon: "sun" },
  { id: "skill_087", name: "Glacier", description: "Summon an entire glacier", rarity: "epic", effects: [{ type: "damage", value: 480 }, { type: "freeze", value: 6, duration: 6 }], cooldown: 24, manaCost: 78, icon: "mountain-snow" },
  { id: "skill_088", name: "Cataclysm", description: "Cause a massive earthquake", rarity: "epic", effects: [{ type: "damage", value: 520 }, { type: "stun", chance: 55, value: 3 }], cooldown: 25, manaCost: 80, icon: "trending-down" },
  { id: "skill_089", name: "Hurricane", description: "Summon a devastating hurricane", rarity: "epic", effects: [{ type: "damage", value: 450 }, { type: "dodge", value: 45, duration: 5 }], cooldown: 20, manaCost: 70, icon: "wind" },
  { id: "skill_090", name: "Lightning Storm", description: "Call down continuous lightning", rarity: "epic", effects: [{ type: "damage", value: 500 }, { type: "stun", chance: 60, value: 2 }], cooldown: 22, manaCost: 72, icon: "cloud-lightning" },
  { id: "skill_091", name: "Resurrection", description: "Bring yourself back from near death", rarity: "epic", effects: [{ type: "heal", value: 800 }, { type: "shield", value: 400, duration: 5 }], cooldown: 30, manaCost: 85, icon: "sunrise" },
  { id: "skill_092", name: "Impenetrable", description: "Become completely impenetrable", rarity: "epic", effects: [{ type: "shield", value: 700, duration: 8 }], cooldown: 28, manaCost: 80, icon: "shield-check" },
  { id: "skill_093", name: "Massacre", description: "Deal massive critical damage", rarity: "epic", effects: [{ type: "damage", value: 420 }, { type: "critical", value: 70, duration: 3 }], cooldown: 18, manaCost: 65, icon: "swords" },
  { id: "skill_094", name: "Phantom", description: "Become a phantom to avoid all", rarity: "epic", effects: [{ type: "dodge", value: 90, duration: 4 }], cooldown: 20, manaCost: 68, icon: "ghost" },
  { id: "skill_095", name: "Life Siphon", description: "Siphon all life from enemies", rarity: "epic", effects: [{ type: "damage", value: 400 }, { type: "lifesteal", value: 120 }], cooldown: 19, manaCost: 66, icon: "heart" },
  { id: "skill_096", name: "World Breaker", description: "Shatter the world itself", rarity: "legendary", effects: [{ type: "damage", value: 900 }, { type: "stun", chance: 70, value: 4 }], cooldown: 35, manaCost: 110, icon: "globe" },
  { id: "skill_097", name: "Absolute Defense", description: "Achieve perfect defense", rarity: "legendary", effects: [{ type: "shield", value: 1200, duration: 10 }, { type: "reflect", value: 40, duration: 10 }], cooldown: 40, manaCost: 105, icon: "shield" },
  { id: "skill_098", name: "Execution", description: "Execute enemies with low health", rarity: "legendary", effects: [{ type: "damage", value: 850 }, { type: "critical", value: 80, duration: 2 }], cooldown: 28, manaCost: 95, icon: "skull" },
  { id: "skill_099", name: "Ethereal Form", description: "Become completely ethereal", rarity: "legendary", effects: [{ type: "dodge", value: 100, duration: 5 }, { type: "stat_boost", stat: "AGI", value: 100, duration: 5 }], cooldown: 35, manaCost: 100, icon: "sparkles" },
  { id: "skill_100", name: "Divine Retribution", description: "Unleash the wrath of the gods", rarity: "mythic", effects: [{ type: "damage", value: 1500 }, { type: "heal", value: 500 }, { type: "stat_boost", stat: "all", value: 80, duration: 10 }], cooldown: 60, manaCost: 200, icon: "crown" },
  // Common Tier Expansion (Novice/Apprentice)
  { id: "skill_101", name: "Woodland Spirit", description: "Small forest spirit heals your wounds", rarity: "common", effects: [{ type: "heal", value: 120 }], cooldown: 7, manaCost: 15, icon: "leaf" },
  { id: "skill_102", name: "Sharp Edge", description: "Hone your blade for extra bite", rarity: "common", effects: [{ type: "damage", value: 110 }, { type: "stat_boost", stat: "STR", value: 5, duration: 2 }], cooldown: 4, manaCost: 10, icon: "knife" },
  { id: "skill_103", name: "Static Shock", description: "Zaps attacker when hit", rarity: "common", effects: [{ type: "reflect", value: 10, duration: 3 }], cooldown: 8, manaCost: 12, icon: "bolt" },
  { id: "skill_104", name: "Focus Breath", description: "Recover a small amount of focus", rarity: "common", effects: [{ type: "stat_boost", stat: "INT", value: 15, duration: 3 }], cooldown: 15, manaCost: 5, icon: "wind" },
  { id: "skill_105", name: "Dirty Kick", description: "Stun the enemy briefly with a low blow", rarity: "common", effects: [{ type: "damage", value: 50 }, { type: "stun", chance: 20, value: 1 }], cooldown: 10, manaCost: 15, icon: "footprints" },
  
  // Uncommon Tier Expansion (Warrior/Knight)
  { id: "skill_106", name: "Whirlwind", description: "Spinning attack hitting all around", rarity: "uncommon", effects: [{ type: "damage", value: 180 }, { type: "dodge", value: 10, duration: 2 }], cooldown: 6, manaCost: 25, icon: "rotate-cw" },
  { id: "skill_107", name: "Ice Shield", description: "Barrier of frost that slows attackers", rarity: "uncommon", effects: [{ type: "shield", value: 180, duration: 4 }, { type: "freeze", value: 1, duration: 1 }], cooldown: 12, manaCost: 30, icon: "shield-half" },
  { id: "skill_108", name: "Venom Strike", description: "Poisoned blade deals damage over time", rarity: "uncommon", effects: [{ type: "damage", value: 100 }, { type: "burn", value: 40, duration: 4 }], cooldown: 7, manaCost: 22, icon: "skull-2" },
  { id: "skill_109", name: "War Cry", description: "Boost morale and strength", rarity: "uncommon", effects: [{ type: "stat_boost", stat: "STR", value: 25, duration: 6 }, { type: "stat_boost", stat: "VIT", value: 10, duration: 6 }], cooldown: 15, manaCost: 28, icon: "mic-2" },
  { id: "skill_110", name: "Fleet Foot", description: "Incredible burst of speed", rarity: "uncommon", effects: [{ type: "stat_boost", stat: "AGI", value: 35, duration: 4 }], cooldown: 14, manaCost: 20, icon: "zap" },

  // Rare Tier Expansion (Master/Grandmaster)
  { id: "skill_111", name: "Dragon Scale", description: "Skin as tough as a dragon's", rarity: "rare", effects: [{ type: "shield", value: 400, duration: 6 }, { type: "reflect", value: 20, duration: 6 }], cooldown: 18, manaCost: 45, icon: "shield-alert" },
  { id: "skill_112", name: "Ethereal Blade", description: "Bypasses armor with magical energy", rarity: "rare", effects: [{ type: "damage", value: 320 }, { type: "stat_boost", stat: "Luck", value: 20, duration: 3 }], cooldown: 10, manaCost: 40, icon: "sparkles" },
  { id: "skill_113", name: "Lunar Eclipse", description: "Darkness covers the battlefield", rarity: "rare", effects: [{ type: "dodge", value: 40, duration: 5 }, { type: "debuff", stat: "all", value: -10, duration: 5 }], cooldown: 20, manaCost: 50, icon: "moon" },
  { id: "skill_114", name: "Heavenly Rain", description: "Healing rain restores health", rarity: "rare", effects: [{ type: "heal", value: 400 }], cooldown: 15, manaCost: 55, icon: "cloud-rain" },
  { id: "skill_115", name: "Soul Bind", description: "Tethers enemy life force", rarity: "rare", effects: [{ type: "damage", value: 200 }, { type: "lifesteal", value: 70 }], cooldown: 12, manaCost: 45, icon: "link-2" },

  // Epic Tier Expansion (Legend/Elite)
  { id: "skill_116", name: "Solar Flare", description: "Blinding light burns and stuns", rarity: "epic", effects: [{ type: "damage", value: 450 }, { type: "burn", value: 90, duration: 5 }, { type: "stun", chance: 40, value: 2 }], cooldown: 22, manaCost: 70, icon: "sun" },
  { id: "skill_117", name: "Diamond Body", description: "Ultimate defense against physical hits", rarity: "epic", effects: [{ type: "shield", value: 800, duration: 8 }, { type: "stat_boost", stat: "VIT", value: 50, duration: 8 }], cooldown: 25, manaCost: 80, icon: "gem" },
  { id: "skill_118", name: "Void Rip", description: "Pull enemies into the void", rarity: "epic", effects: [{ type: "damage", value: 500 }, { type: "freeze", value: 3, duration: 3 }], cooldown: 18, manaCost: 65, icon: "hole" },
  { id: "skill_119", name: "Blood Lust", description: "Every hit restores health", rarity: "epic", effects: [{ type: "lifesteal", value: 100, duration: 6 }, { type: "stat_boost", stat: "AGI", value: 40, duration: 6 }], cooldown: 24, manaCost: 75, icon: "droplet" },
  { id: "skill_120", name: "Arcane Mastery", description: "Peak magical understanding", rarity: "epic", effects: [{ type: "stat_boost", stat: "INT", value: 100, duration: 8 }, { type: "critical", value: 30, duration: 8 }], cooldown: 20, manaCost: 90, icon: "book-open" },

  // Legendary Tier Expansion (Ascended/Divine)
  { id: "skill_121", name: "Black Hole", description: "Gravity crushes all in its path", rarity: "legendary", effects: [{ type: "damage", value: 1000 }, { type: "stun", chance: 100, value: 3 }], cooldown: 40, manaCost: 120, icon: "circle-dot" },
  { id: "skill_122", name: "Aegis of Light", description: "Holy shield that reflects all", rarity: "legendary", effects: [{ type: "shield", value: 1200, duration: 10 }, { type: "reflect", value: 60, duration: 10 }], cooldown: 45, manaCost: 110, icon: "shield-check" },
  { id: "skill_123", name: "Rebirth", description: "Die and return stronger", rarity: "legendary", effects: [{ type: "heal", value: 1000 }, { type: "stat_boost", stat: "all", value: 50, duration: 15 }], cooldown: 60, manaCost: 150, icon: "refresh-cw" },
  { id: "skill_124", name: "Final Judgment", description: "The end of the line for foes", rarity: "legendary", effects: [{ type: "damage", value: 950 }, { type: "critical", value: 100, duration: 1 }], cooldown: 30, manaCost: 100, icon: "gavel" },
  { id: "skill_125", name: "Reality Warp", description: "Change the rules of engagement", rarity: "legendary", effects: [{ type: "dodge", value: 100, duration: 5 }, { type: "stat_boost", stat: "Luck", value: 200, duration: 5 }], cooldown: 50, manaCost: 130, icon: "layers" },

  // Mythic Tier Expansion (Transcendent/Godly)
  { id: "skill_126", name: "God Slayer", description: "Technique that brought down gods", rarity: "mythic", effects: [{ type: "damage", value: 2000 }, { type: "critical", value: 50, duration: 5 }], cooldown: 70, manaCost: 250, icon: "sword" },
  { id: "skill_127", name: "Omnipotence", description: "A glimpse of absolute power", rarity: "mythic", effects: [{ type: "stat_boost", stat: "all", value: 200, duration: 20 }], cooldown: 90, manaCost: 300, icon: "crown" },
  { id: "skill_128", name: "Universal Reset", description: "Return everything to the beginning", rarity: "mythic", effects: [{ type: "heal", value: 2000 }, { type: "debuff", stat: "all", value: -100, duration: 10 }], cooldown: 120, manaCost: 400, icon: "history" },
  { id: "skill_129", name: "Void Dragon Form", description: "Transform into a creature of the void", rarity: "mythic", effects: [{ type: "stat_boost", stat: "STR", value: 300, duration: 15 }, { type: "shield", value: 2000, duration: 15 }], cooldown: 80, manaCost: 280, icon: "bird" },
  { id: "skill_130", name: "Creation's Breath", description: "The breath that started the universe", rarity: "mythic", effects: [{ type: "heal", value: 1500 }, { type: "damage", value: 1500 }, { type: "stat_boost", stat: "all", value: 100, duration: 10 }], cooldown: 100, manaCost: 350, icon: "wind" },

  // Additional Skills for Mid-Tier Progression (Expert/Grandmaster)
  { id: "skill_131", name: "Steel Resolve", description: "Ignore pain to keep fighting", rarity: "rare", effects: [{ type: "stat_boost", stat: "VIT", value: 60, duration: 10 }, { type: "shield", value: 200, duration: 10 }], cooldown: 25, manaCost: 45, icon: "shield-half" },
  { id: "skill_132", name: "Flowing Water", description: "Move like water to avoid hits", rarity: "rare", effects: [{ type: "dodge", value: 50, duration: 4 }, { type: "stat_boost", stat: "AGI", value: 30, duration: 4 }], cooldown: 15, manaCost: 35, icon: "waves" },
  { id: "skill_133", name: "Lava Skin", description: "Burns those who touch you", rarity: "rare", effects: [{ type: "reflect", value: 30, duration: 5 }, { type: "burn", value: 20, duration: 5 }], cooldown: 20, manaCost: 40, icon: "thermometer-sun" },
  { id: "skill_134", name: "Eagle Eye", description: "Perfect focus for critical strikes", rarity: "rare", effects: [{ type: "critical", value: 45, duration: 5 }, { type: "stat_boost", stat: "Luck", value: 30, duration: 5 }], cooldown: 18, manaCost: 38, icon: "eye" },
  { id: "skill_135", name: "Nature's Wrath", description: "Thorns entangle and damage", rarity: "rare", effects: [{ type: "damage", value: 250 }, { type: "freeze", value: 2, duration: 2 }], cooldown: 14, manaCost: 42, icon: "sprout" },

  // End-Game Skill Expansion
  { id: "skill_136", name: "Final Hour", description: "Massive boost when near death", rarity: "legendary", effects: [{ type: "stat_boost", stat: "all", value: 150, duration: 8 }, { type: "critical", value: 70, duration: 8 }], cooldown: 45, manaCost: 110, icon: "hourglass-end" },
  { id: "skill_137", name: "Galaxy Crush", description: "Collapse a mini-galaxy on foes", rarity: "legendary", effects: [{ type: "damage", value: 1100 }, { type: "stun", chance: 80, value: 3 }], cooldown: 38, manaCost: 115, icon: "milestone" },
  { id: "skill_138", name: "Life Bloom", description: "Explosive healing burst", rarity: "legendary", effects: [{ type: "heal", value: 1200 }, { type: "shield", value: 400, duration: 5 }], cooldown: 32, manaCost: 105, icon: "flower-2" },
  { id: "skill_139", name: "Shadow Realm", description: "Drag enemies into your domain", rarity: "legendary", effects: [{ type: "debuff", stat: "all", value: -40, duration: 6 }, { type: "damage", value: 400 }], cooldown: 28, manaCost: 95, icon: "ghost" },
  { id: "skill_140", name: "Titan's Roar", description: "Stuns all enemies with sheer volume", rarity: "legendary", effects: [{ type: "stun", chance: 100, value: 2 }, { type: "debuff", stat: "STR", value: -50, duration: 5 }], cooldown: 35, manaCost: 100, icon: "megaphone" },

  // Mythic Pinnacle
  { id: "skill_141", name: "Genesis Wave", description: "The wave that created existence", rarity: "mythic", effects: [{ type: "heal", value: 2500 }, { type: "stat_boost", stat: "all", value: 150, duration: 12 }], cooldown: 150, manaCost: 500, icon: "waves" },
  { id: "skill_142", name: "Entropy", description: "The heat death of the universe", rarity: "mythic", effects: [{ type: "damage", value: 3000 }, { type: "burn", value: 300, duration: 10 }], cooldown: 180, manaCost: 600, icon: "flame" },
  { id: "skill_143", name: "Divine Form", description: "Assume your true celestial self", rarity: "mythic", effects: [{ type: "stat_boost", stat: "all", value: 500, duration: 30 }, { type: "shield", value: 5000, duration: 30 }], cooldown: 300, manaCost: 1000, icon: "sun" },
  { id: "skill_144", name: "Singularity", description: "Everything becomes one point", rarity: "mythic", effects: [{ type: "damage", value: 5000 }], cooldown: 600, manaCost: 2000, icon: "circle-dot" },
  { id: "skill_145", name: "Eternal Peace", description: "The end of all conflict", rarity: "mythic", effects: [{ type: "heal", value: 9999 }, { type: "shield", value: 9999, duration: 60 }], cooldown: 1200, manaCost: 5000, icon: "heart" },
];

export const getSkillById = (id: string): SkillDefinition | undefined => {
  return ALL_SKILLS.find(skill => skill.id === id);
};

export const getSkillsByRarity = (rarity: SkillRarity): SkillDefinition[] => {
  return ALL_SKILLS.filter(skill => skill.rarity === rarity);
};
