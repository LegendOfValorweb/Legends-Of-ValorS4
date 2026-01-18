import { sql, relations } from "drizzle-orm";
import { pgTable, text, varchar, integer, bigint, timestamp, jsonb, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const itemTiers = ["normal", "super_rare", "x_tier", "umr", "ssumr", "divine", "journeyman", "expert", "master", "grandmaster", "legend", "elite"] as const;
export type ItemTier = typeof itemTiers[number];

export const itemTypes = ["weapon", "armor", "accessory"] as const;
export type ItemType = typeof itemTypes[number];

export const statsSchema = z.object({
  Str: z.number().optional(),
  Int: z.number().optional(),
  Spd: z.number().optional(),
  Luck: z.number().optional(),
  Pot: z.number().optional(),
});

export type Stats = z.infer<typeof statsSchema>;

export const itemSchema = z.object({
  id: z.string(),
  name: z.string(),
  type: z.enum(itemTypes),
  stats: statsSchema,
  special: z.string().optional(),
  price: z.number(),
  tier: z.enum(itemTiers),
});

export type Item = z.infer<typeof itemSchema>;

export const accountRoles = ["player", "admin"] as const;
export type AccountRole = typeof accountRoles[number];

export const playerRanks = ["Novice", "Apprentice", "Journeyman", "Expert", "Master", "Grandmaster", "Legend", "Elite"] as const;
export type PlayerRank = typeof playerRanks[number];

export const playerStatsSchema = z.object({
  Str: z.number().default(10),
  Spd: z.number().default(10),
  Int: z.number().default(10),
  Luck: z.number().default(10),
  Pot: z.number().default(0),
});

export type PlayerStats = z.infer<typeof playerStatsSchema>;

export const equippedSchema = z.object({
  weapon: z.string().nullable(),
  armor: z.string().nullable(),
  accessory1: z.string().nullable(),
  accessory2: z.string().nullable(),
});

export type Equipped = z.infer<typeof equippedSchema>;

export const accounts = pgTable("accounts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  role: text("role").notNull().$type<AccountRole>(),
  gold: bigint("gold", { mode: "number" }).notNull().default(10000),
  rubies: bigint("rubies", { mode: "number" }).notNull().default(0),
  soulShards: bigint("soul_shards", { mode: "number" }).notNull().default(0),
  focusedShards: bigint("focused_shards", { mode: "number" }).notNull().default(0),
  trainingPoints: bigint("training_points", { mode: "number" }).notNull().default(0),
  petExp: bigint("pet_exp", { mode: "number" }).notNull().default(0),
  runes: bigint("runes", { mode: "number" }).notNull().default(0),
  pets: jsonb("pets").notNull().default([]).$type<string[]>(),
  rank: text("rank").notNull().default("Novice").$type<PlayerRank>(),
  wins: integer("wins").notNull().default(0),
  losses: integer("losses").notNull().default(0),
  stats: jsonb("stats").notNull().default({ Str: 10, Spd: 10, Int: 10, Luck: 10, Pot: 0 }).$type<PlayerStats>(),
  equipped: jsonb("equipped").notNull().default({ weapon: null, armor: null, accessory1: null, accessory2: null }).$type<Equipped>(),
  npcFloor: integer("npc_floor").notNull().default(1),
  npcLevel: integer("npc_level").notNull().default(1),
  equippedPetId: varchar("equipped_pet_id"),
  lastActive: timestamp("last_active").defaultNow(),
});

export const inventoryItems = pgTable("inventory_items", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  accountId: varchar("account_id").notNull().references(() => accounts.id),
  itemId: text("item_id").notNull(),
  stats: jsonb("stats").notNull().default({}).$type<Partial<Stats>>(),
  purchasedAt: timestamp("purchased_at").notNull().defaultNow(),
});

export const accountsRelations = relations(accounts, ({ many }) => ({
  inventory: many(inventoryItems),
}));

export const inventoryItemsRelations = relations(inventoryItems, ({ one }) => ({
  account: one(accounts, {
    fields: [inventoryItems.accountId],
    references: [accounts.id],
  }),
}));

export const insertAccountSchema = createInsertSchema(accounts).omit({ id: true });
export type InsertAccount = z.infer<typeof insertAccountSchema>;
export type Account = typeof accounts.$inferSelect;

export const insertInventoryItemSchema = createInsertSchema(inventoryItems).omit({ id: true });
export type InsertInventoryItem = z.infer<typeof insertInventoryItemSchema>;
export type InventoryItem = typeof inventoryItems.$inferSelect;

export const events = pgTable("events", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  description: text("description").notNull(),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date"),
  isMandatory: boolean("is_mandatory").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  createdBy: varchar("created_by").notNull().references(() => accounts.id),
});

export const eventRegistrations = pgTable("event_registrations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  eventId: varchar("event_id").notNull().references(() => events.id, { onDelete: "cascade" }),
  accountId: varchar("account_id").notNull().references(() => accounts.id, { onDelete: "cascade" }),
  registeredAt: timestamp("registered_at").notNull().defaultNow(),
  isAutoRegistered: boolean("is_auto_registered").notNull().default(false),
});

export const eventsRelations = relations(events, ({ many, one }) => ({
  registrations: many(eventRegistrations),
  creator: one(accounts, {
    fields: [events.createdBy],
    references: [accounts.id],
  }),
}));

export const eventRegistrationsRelations = relations(eventRegistrations, ({ one }) => ({
  event: one(events, {
    fields: [eventRegistrations.eventId],
    references: [events.id],
  }),
  account: one(accounts, {
    fields: [eventRegistrations.accountId],
    references: [accounts.id],
  }),
}));

export const insertEventSchema = createInsertSchema(events).omit({ id: true, createdAt: true });
export type InsertEvent = z.infer<typeof insertEventSchema>;
export type Event = typeof events.$inferSelect;

export const insertEventRegistrationSchema = createInsertSchema(eventRegistrations).omit({ id: true, registeredAt: true });
export type InsertEventRegistration = z.infer<typeof insertEventRegistrationSchema>;
export type EventRegistration = typeof eventRegistrations.$inferSelect;

export const challengeStatuses = ["pending", "accepted", "declined", "completed", "cancelled"] as const;
export type ChallengeStatus = typeof challengeStatuses[number];

export const petTiers = ["egg", "baby", "teen", "adult", "legend", "mythic"] as const;
export type PetTier = typeof petTiers[number];

export const petElements = ["Fire", "Water", "Earth", "Air", "Lightning", "Ice", "Nature", "Dark", "Light", "Arcana", "Chrono", "Plasma", "Void", "Aether", "Hybrid", "Elemental Convergence", "Time", "Space", "Soul", "Mind"] as const;
export type PetElement = typeof petElements[number];

export const petStatsSchema = z.object({
  Str: z.number().default(1),
  Spd: z.number().default(1),
  Luck: z.number().default(1),
  ElementalPower: z.number().default(1),
});

export type PetStats = z.infer<typeof petStatsSchema>;

export const petTierConfig = {
  egg: { maxExp: 100, evolutionCost: 10000, statMultiplier: 1 },
  baby: { maxExp: 500, evolutionCost: 50000, statMultiplier: 2 },
  teen: { maxExp: 2500, evolutionCost: 250000, statMultiplier: 4 },
  adult: { maxExp: 10000, evolutionCost: 1000000, statMultiplier: 8 },
  legend: { maxExp: 100000, evolutionCost: 100000000, statMultiplier: 16 },
  mythic: { maxExp: null, evolutionCost: null, statMultiplier: 32 },
} as const;

export const pets = pgTable("pets", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  accountId: varchar("account_id").notNull().references(() => accounts.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  element: text("element").notNull().$type<PetElement>().default("Fire"),
  elements: text("elements").array().$type<PetElement[]>().default(sql`ARRAY['Fire']::text[]`),
  tier: text("tier").notNull().$type<PetTier>().default("egg"),
  exp: integer("exp").notNull().default(0),
  stats: jsonb("stats").notNull().default({ Str: 1, Spd: 1, Luck: 1, ElementalPower: 1 }).$type<PetStats>(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const petsRelations = relations(pets, ({ one }) => ({
  account: one(accounts, {
    fields: [pets.accountId],
    references: [accounts.id],
  }),
}));

export const insertPetSchema = createInsertSchema(pets).omit({ id: true, createdAt: true });
export type InsertPet = z.infer<typeof insertPetSchema>;
export type Pet = typeof pets.$inferSelect;

export const challenges = pgTable("challenges", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  challengerId: varchar("challenger_id").notNull().references(() => accounts.id, { onDelete: "cascade" }),
  challengedId: varchar("challenged_id").notNull().references(() => accounts.id, { onDelete: "cascade" }),
  status: text("status").notNull().$type<ChallengeStatus>().default("pending"),
  winnerId: varchar("winner_id").references(() => accounts.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  acceptedAt: timestamp("accepted_at"),
  completedAt: timestamp("completed_at"),
});

export const challengesRelations = relations(challenges, ({ one }) => ({
  challenger: one(accounts, {
    fields: [challenges.challengerId],
    references: [accounts.id],
    relationName: "challenger",
  }),
  challenged: one(accounts, {
    fields: [challenges.challengedId],
    references: [accounts.id],
    relationName: "challenged",
  }),
  winner: one(accounts, {
    fields: [challenges.winnerId],
    references: [accounts.id],
    relationName: "winner",
  }),
}));

export const insertChallengeSchema = createInsertSchema(challenges).omit({ id: true, createdAt: true });
export type InsertChallenge = z.infer<typeof insertChallengeSchema>;
export type Challenge = typeof challenges.$inferSelect;

export type User = Account;
export type InsertUser = InsertAccount;

// Leaderboard cache - stores aggregated leaderboard data that refreshes every 24 hours
export const leaderboardCache = pgTable("leaderboard_cache", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  type: text("type").notNull(), // 'wins', 'losses', 'npc_progress', 'rank'
  data: jsonb("data").notNull().$type<LeaderboardEntry[]>(),
  refreshedAt: timestamp("refreshed_at").notNull().defaultNow(),
});

export type LeaderboardEntry = {
  accountId: string;
  username: string;
  value: number | string;
  rank?: number;
  npcFloor?: number;
  npcLevel?: number;
};

export type LeaderboardCache = typeof leaderboardCache.$inferSelect;

// Quests system
export const questStatuses = ["active", "completed", "expired"] as const;
export type QuestStatus = typeof questStatuses[number];

export const questAssignmentStatuses = ["pending", "accepted", "completed", "rewarded"] as const;
export type QuestAssignmentStatus = typeof questAssignmentStatuses[number];

export const quests = pgTable("quests", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  description: text("description").notNull(),
  rewards: jsonb("rewards").notNull().$type<QuestRewards>(),
  status: text("status").notNull().$type<QuestStatus>().default("active"),
  createdBy: varchar("created_by").notNull().references(() => accounts.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  expiresAt: timestamp("expires_at"),
});

export type QuestRewards = {
  gold?: number;
  rubies?: number;
  soulShards?: number;
  focusedShards?: number;
  trainingPoints?: number;
  runes?: number;
  petExp?: number;
};

export const questAssignments = pgTable("quest_assignments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  questId: varchar("quest_id").notNull().references(() => quests.id, { onDelete: "cascade" }),
  accountId: varchar("account_id").notNull().references(() => accounts.id, { onDelete: "cascade" }),
  status: text("status").notNull().$type<QuestAssignmentStatus>().default("pending"),
  acceptedAt: timestamp("accepted_at"),
  completedAt: timestamp("completed_at"),
  rewardedAt: timestamp("rewarded_at"),
});

export const questsRelations = relations(quests, ({ one, many }) => ({
  createdByAccount: one(accounts, {
    fields: [quests.createdBy],
    references: [accounts.id],
  }),
  assignments: many(questAssignments),
}));

export const questAssignmentsRelations = relations(questAssignments, ({ one }) => ({
  quest: one(quests, {
    fields: [questAssignments.questId],
    references: [quests.id],
  }),
  account: one(accounts, {
    fields: [questAssignments.accountId],
    references: [accounts.id],
  }),
}));

export const insertQuestSchema = createInsertSchema(quests).omit({ id: true, createdAt: true });
export type InsertQuest = z.infer<typeof insertQuestSchema>;
export type Quest = typeof quests.$inferSelect;

export const insertQuestAssignmentSchema = createInsertSchema(questAssignments).omit({ id: true });
export type InsertQuestAssignment = z.infer<typeof insertQuestAssignmentSchema>;
export type QuestAssignment = typeof questAssignments.$inferSelect;

// Guild system
export const guildBankSchema = z.object({
  gold: z.number().default(0),
  rubies: z.number().default(0),
  soulShards: z.number().default(0),
  focusedShards: z.number().default(0),
  runes: z.number().default(0),
  trainingPoints: z.number().default(0),
});

export type GuildBank = z.infer<typeof guildBankSchema>;

export const guilds = pgTable("guilds", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull().unique(),
  masterId: varchar("master_id").notNull().references(() => accounts.id),
  bank: jsonb("bank").notNull().default({ gold: 0, rubies: 0, soulShards: 0, focusedShards: 0, runes: 0, trainingPoints: 0 }).$type<GuildBank>(),
  dungeonFloor: integer("dungeon_floor").notNull().default(1),
  dungeonLevel: integer("dungeon_level").notNull().default(1),
  wins: integer("wins").notNull().default(0),
  level: integer("level").notNull().default(1),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const guildMembers = pgTable("guild_members", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  guildId: varchar("guild_id").notNull().references(() => guilds.id, { onDelete: "cascade" }),
  accountId: varchar("account_id").notNull().references(() => accounts.id, { onDelete: "cascade" }).unique(),
  joinedAt: timestamp("joined_at").notNull().defaultNow(),
});

export const guildInvites = pgTable("guild_invites", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  guildId: varchar("guild_id").notNull().references(() => guilds.id, { onDelete: "cascade" }),
  accountId: varchar("account_id").notNull().references(() => accounts.id, { onDelete: "cascade" }),
  invitedBy: varchar("invited_by").notNull().references(() => accounts.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const guildsRelations = relations(guilds, ({ one, many }) => ({
  master: one(accounts, {
    fields: [guilds.masterId],
    references: [accounts.id],
  }),
  members: many(guildMembers),
  invites: many(guildInvites),
}));

export const guildMembersRelations = relations(guildMembers, ({ one }) => ({
  guild: one(guilds, {
    fields: [guildMembers.guildId],
    references: [guilds.id],
  }),
  account: one(accounts, {
    fields: [guildMembers.accountId],
    references: [accounts.id],
  }),
}));

export const guildInvitesRelations = relations(guildInvites, ({ one }) => ({
  guild: one(guilds, {
    fields: [guildInvites.guildId],
    references: [guilds.id],
  }),
  account: one(accounts, {
    fields: [guildInvites.accountId],
    references: [accounts.id],
  }),
  inviter: one(accounts, {
    fields: [guildInvites.invitedBy],
    references: [accounts.id],
    relationName: "inviter",
  }),
}));

export const insertGuildSchema = createInsertSchema(guilds).omit({ id: true, createdAt: true, bank: true, dungeonFloor: true, dungeonLevel: true });
export type InsertGuild = z.infer<typeof insertGuildSchema>;
export type Guild = typeof guilds.$inferSelect;

export const insertGuildMemberSchema = createInsertSchema(guildMembers).omit({ id: true, joinedAt: true });
export type InsertGuildMember = z.infer<typeof insertGuildMemberSchema>;
export type GuildMember = typeof guildMembers.$inferSelect;

export const insertGuildInviteSchema = createInsertSchema(guildInvites).omit({ id: true, createdAt: true });
export type InsertGuildInvite = z.infer<typeof insertGuildInviteSchema>;
export type GuildInvite = typeof guildInvites.$inferSelect;

// Skill Auction System
export const skillAuctions = pgTable("skill_auctions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  skillId: text("skill_id").notNull(),
  status: text("status").notNull().default("queued"), // queued, active, completed
  startAt: timestamp("start_at"),
  endAt: timestamp("end_at"),
  winningBidId: varchar("winning_bid_id"),
  winnerId: varchar("winner_id"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const skillBids = pgTable("skill_bids", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  auctionId: varchar("auction_id").notNull().references(() => skillAuctions.id, { onDelete: "cascade" }),
  bidderId: varchar("bidder_id").notNull().references(() => accounts.id),
  amount: integer("amount").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const playerSkills = pgTable("player_skills", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  accountId: varchar("account_id").notNull().references(() => accounts.id, { onDelete: "cascade" }),
  skillId: text("skill_id").notNull(),
  isEquipped: boolean("is_equipped").notNull().default(false),
  acquiredAt: timestamp("acquired_at").notNull().defaultNow(),
  source: text("source").notNull().default("auction"), // auction, quest, admin
});

export const activityFeed = pgTable("activity_feed", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  type: text("type").notNull(), // bid_won, pet_acquired, quest_received, quest_completed, item_purchased, etc.
  accountId: varchar("account_id").references(() => accounts.id),
  accountName: text("account_name"),
  message: text("message").notNull(),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const skillAuctionsRelations = relations(skillAuctions, ({ many }) => ({
  bids: many(skillBids),
}));

export const skillBidsRelations = relations(skillBids, ({ one }) => ({
  auction: one(skillAuctions, {
    fields: [skillBids.auctionId],
    references: [skillAuctions.id],
  }),
  bidder: one(accounts, {
    fields: [skillBids.bidderId],
    references: [accounts.id],
  }),
}));

export const playerSkillsRelations = relations(playerSkills, ({ one }) => ({
  account: one(accounts, {
    fields: [playerSkills.accountId],
    references: [accounts.id],
  }),
}));

export const insertSkillAuctionSchema = createInsertSchema(skillAuctions).omit({ id: true, createdAt: true });
export type InsertSkillAuction = z.infer<typeof insertSkillAuctionSchema>;
export type SkillAuction = typeof skillAuctions.$inferSelect;

export const insertSkillBidSchema = createInsertSchema(skillBids).omit({ id: true, createdAt: true });
export type InsertSkillBid = z.infer<typeof insertSkillBidSchema>;
export type SkillBid = typeof skillBids.$inferSelect;

export const insertPlayerSkillSchema = createInsertSchema(playerSkills).omit({ id: true, acquiredAt: true });
export type InsertPlayerSkill = z.infer<typeof insertPlayerSkillSchema>;
export type PlayerSkill = typeof playerSkills.$inferSelect;

export const insertActivityFeedSchema = createInsertSchema(activityFeed).omit({ id: true, createdAt: true });
export type InsertActivityFeed = z.infer<typeof insertActivityFeedSchema>;
export type ActivityFeed = typeof activityFeed.$inferSelect;

// Guild Battles (Guild vs Guild)
export const guildBattleStatuses = ["pending", "accepted", "in_progress", "completed", "declined"] as const;
export type GuildBattleStatus = typeof guildBattleStatuses[number];

export const guildBattles = pgTable("guild_battles", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  challengerGuildId: varchar("challenger_guild_id").notNull().references(() => guilds.id, { onDelete: "cascade" }),
  challengedGuildId: varchar("challenged_guild_id").notNull().references(() => guilds.id, { onDelete: "cascade" }),
  status: text("status").notNull().$type<GuildBattleStatus>().default("pending"),
  challengerFighters: jsonb("challenger_fighters").notNull().default([]).$type<string[]>(),
  challengedFighters: jsonb("challenged_fighters").notNull().default([]).$type<string[]>(),
  currentRound: integer("current_round").notNull().default(0),
  challengerScore: integer("challenger_score").notNull().default(0),
  challengedScore: integer("challenged_score").notNull().default(0),
  challengerCurrentIndex: integer("challenger_current_index").notNull().default(0),
  challengedCurrentIndex: integer("challenged_current_index").notNull().default(0),
  winnerId: varchar("winner_id"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  completedAt: timestamp("completed_at"),
});

export const guildBattlesRelations = relations(guildBattles, ({ one }) => ({
  challengerGuild: one(guilds, {
    fields: [guildBattles.challengerGuildId],
    references: [guilds.id],
    relationName: "challengerGuild",
  }),
  challengedGuild: one(guilds, {
    fields: [guildBattles.challengedGuildId],
    references: [guilds.id],
    relationName: "challengedGuild",
  }),
}));

export const insertGuildBattleSchema = createInsertSchema(guildBattles).omit({ id: true, createdAt: true });
export type InsertGuildBattle = z.infer<typeof insertGuildBattleSchema>;
export type GuildBattle = typeof guildBattles.$inferSelect;

// ==================== PLAYER TRADING SYSTEM ====================
export const tradeStatuses = ["pending", "accepted", "completed", "cancelled", "expired"] as const;
export type TradeStatus = typeof tradeStatuses[number];

export const trades = pgTable("trades", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  initiatorId: varchar("initiator_id").notNull().references(() => accounts.id, { onDelete: "cascade" }),
  recipientId: varchar("recipient_id").notNull().references(() => accounts.id, { onDelete: "cascade" }),
  status: text("status").notNull().$type<TradeStatus>().default("pending"),
  initiatorAccepted: boolean("initiator_accepted").notNull().default(false),
  recipientAccepted: boolean("recipient_accepted").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  completedAt: timestamp("completed_at"),
});

export const tradeItems = pgTable("trade_items", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tradeId: varchar("trade_id").notNull().references(() => trades.id, { onDelete: "cascade" }),
  ownerId: varchar("owner_id").notNull().references(() => accounts.id),
  type: text("type").notNull().$type<"item" | "skill">(),
  refId: varchar("ref_id").notNull(), // inventory item id or player skill id
});

export const tradesRelations = relations(trades, ({ one, many }) => ({
  initiator: one(accounts, {
    fields: [trades.initiatorId],
    references: [accounts.id],
    relationName: "initiator",
  }),
  recipient: one(accounts, {
    fields: [trades.recipientId],
    references: [accounts.id],
    relationName: "recipient",
  }),
  items: many(tradeItems),
}));

export const tradeItemsRelations = relations(tradeItems, ({ one }) => ({
  trade: one(trades, {
    fields: [tradeItems.tradeId],
    references: [trades.id],
  }),
  owner: one(accounts, {
    fields: [tradeItems.ownerId],
    references: [accounts.id],
  }),
}));

export const insertTradeSchema = createInsertSchema(trades).omit({ id: true, createdAt: true });
export type InsertTrade = z.infer<typeof insertTradeSchema>;
export type Trade = typeof trades.$inferSelect;

export const insertTradeItemSchema = createInsertSchema(tradeItems).omit({ id: true });
export type InsertTradeItem = z.infer<typeof insertTradeItemSchema>;
export type TradeItem = typeof tradeItems.$inferSelect;

// ==================== PET FOOD SYSTEM ====================
export const petFoodItems = [
  { id: "basic_treat", name: "Basic Treat", exp: 10, price: 100 },
  { id: "tasty_snack", name: "Tasty Snack", exp: 50, price: 400 },
  { id: "gourmet_meal", name: "Gourmet Meal", exp: 200, price: 1500 },
  { id: "royal_feast", name: "Royal Feast", exp: 1000, price: 6000 },
  { id: "mystic_elixir", name: "Mystic Elixir", exp: 5000, price: 25000 },
  { id: "dragon_essence", name: "Dragon Essence", exp: 25000, price: 100000 },
] as const;

export type PetFoodItem = typeof petFoodItems[number];

// ==================== GUILD LEVEL REQUIREMENTS ====================
export const guildLevelRequirements = [
  { level: 1, minDungeonFloor: 0, goldCost: 0 },
  { level: 2, minDungeonFloor: 1, goldCost: 1_000_000_000 }, // 1 billion
  { level: 3, minDungeonFloor: 5, goldCost: 2_000_000_000 },
  { level: 4, minDungeonFloor: 10, goldCost: 5_000_000_000 },
  { level: 5, minDungeonFloor: 15, goldCost: 10_000_000_000 },
  { level: 6, minDungeonFloor: 20, goldCost: 25_000_000_000 },
  { level: 7, minDungeonFloor: 30, goldCost: 50_000_000_000 },
  { level: 8, minDungeonFloor: 40, goldCost: 100_000_000_000 },
  { level: 9, minDungeonFloor: 50, goldCost: 250_000_000_000 },
  { level: 10, minDungeonFloor: 75, goldCost: 1_000_000_000_000 }, // 1 trillion - requires Demon Lord Dungeon
] as const;

export type GuildLevelRequirement = typeof guildLevelRequirements[number];
