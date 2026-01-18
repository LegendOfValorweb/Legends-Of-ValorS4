import { accounts, inventoryItems, events, eventRegistrations, challenges, pets, leaderboardCache, quests, questAssignments, guilds, guildMembers, guildInvites, skillAuctions, skillBids, playerSkills, activityFeed, guildBattles, trades, tradeItems, type Account, type InsertAccount, type InventoryItem, type InsertInventoryItem, type PlayerStats, type Equipped, type PlayerRank, type Event, type InsertEvent, type EventRegistration, type InsertEventRegistration, type Challenge, type InsertChallenge, type ChallengeStatus, type Pet, type InsertPet, type PetStats, type PetTier, type LeaderboardCache, type LeaderboardEntry, type Quest, type InsertQuest, type QuestAssignment, type InsertQuestAssignment, type QuestAssignmentStatus, type QuestRewards, type Guild, type InsertGuild, type GuildMember, type InsertGuildMember, type GuildInvite, type InsertGuildInvite, type GuildBank, type SkillAuction, type InsertSkillAuction, type SkillBid, type InsertSkillBid, type PlayerSkill, type InsertPlayerSkill, type ActivityFeed, type InsertActivityFeed, type GuildBattle, type InsertGuildBattle, type GuildBattleStatus, type Trade, type InsertTrade, type TradeItem, type InsertTradeItem, type TradeStatus } from "@shared/schema";
import { db } from "./db";
import { eq, and, or, desc, asc, sql } from "drizzle-orm";
import type { Stats } from "@shared/schema";

export interface IStorage {
  getAccount(id: string): Promise<Account | undefined>;
  getAccountByUsername(username: string): Promise<Account | undefined>;
  createAccount(account: InsertAccount): Promise<Account>;
  updateAccountGold(id: string, gold: number): Promise<Account | undefined>;
  updateAccountStats(id: string, stats: PlayerStats): Promise<Account | undefined>;
  updateAccountEquipped(id: string, equipped: Equipped): Promise<Account | undefined>;
  updateAccountRank(id: string, rank: PlayerRank): Promise<Account | undefined>;
  updateAccountWins(id: string, wins: number): Promise<Account | undefined>;
  updateAccountLosses(id: string, losses: number): Promise<Account | undefined>;
  updateAccountResources(id: string, data: Partial<Pick<Account, "rubies" | "soulShards" | "focusedShards" | "pets">>): Promise<Account | undefined>;
  updateAccount(id: string, data: Partial<Pick<Account, "gold" | "rubies" | "soulShards" | "focusedShards" | "trainingPoints" | "petExp" | "runes" | "pets" | "stats" | "equipped" | "rank" | "wins" | "losses">>): Promise<Account | undefined>;
  capAccountResources(id: string): Promise<void>;
  
  getInventoryByAccount(accountId: string): Promise<InventoryItem[]>;
  getInventoryItem(id: string): Promise<InventoryItem | undefined>;
  updateInventoryItemStats(id: string, stats: Partial<Stats>): Promise<InventoryItem | undefined>;
  addToInventory(item: InsertInventoryItem): Promise<InventoryItem>;
  removeFromInventory(id: string): Promise<void>;
  
  getAllAccounts(): Promise<Account[]>;
  deleteAccount(id: string): Promise<void>;
  
  createEvent(event: InsertEvent): Promise<Event>;
  getEvent(id: string): Promise<Event | undefined>;
  getAllEvents(): Promise<Event[]>;
  deleteEvent(id: string): Promise<void>;
  
  registerForEvent(registration: InsertEventRegistration): Promise<EventRegistration>;
  unregisterFromEvent(eventId: string, accountId: string): Promise<void>;
  getEventRegistrations(eventId: string): Promise<EventRegistration[]>;
  getPlayerEventRegistrations(accountId: string): Promise<EventRegistration[]>;
  isRegisteredForEvent(eventId: string, accountId: string): Promise<boolean>;
  
  createChallenge(challenge: InsertChallenge): Promise<Challenge>;
  getChallenge(id: string): Promise<Challenge | undefined>;
  getChallengesForPlayer(accountId: string): Promise<Challenge[]>;
  getAcceptedChallenges(): Promise<Challenge[]>;
  updateChallengeStatus(id: string, status: ChallengeStatus, acceptedAt?: Date): Promise<Challenge | undefined>;
  setChallengeWinner(id: string, winnerId: string): Promise<Challenge | undefined>;
  
  createPet(pet: InsertPet): Promise<Pet>;
  getPet(id: string): Promise<Pet | undefined>;
  getPetsByAccount(accountId: string): Promise<Pet[]>;
  getAllPets(): Promise<Pet[]>;
  updatePet(id: string, data: Partial<Pick<Pet, "name" | "tier" | "exp" | "stats" | "element" | "elements" | "accountId">>): Promise<Pet | undefined>;
  deletePet(id: string): Promise<void>;
  
  updateLastActive(id: string): Promise<void>;
  updateNpcProgress(id: string, floor: number, level: number): Promise<Account | undefined>;
  
  // Leaderboard methods
  getLeaderboardCache(type: string): Promise<LeaderboardCache | undefined>;
  setLeaderboardCache(type: string, data: LeaderboardEntry[]): Promise<LeaderboardCache>;
  
  // Quest methods
  createQuest(quest: InsertQuest): Promise<Quest>;
  getQuest(id: string): Promise<Quest | undefined>;
  getAllQuests(): Promise<Quest[]>;
  updateQuestStatus(id: string, status: string): Promise<Quest | undefined>;
  deleteQuest(id: string): Promise<void>;
  
  createQuestAssignment(assignment: InsertQuestAssignment): Promise<QuestAssignment>;
  getQuestAssignment(id: string): Promise<QuestAssignment | undefined>;
  getQuestAssignmentsByQuest(questId: string): Promise<QuestAssignment[]>;
  getQuestAssignmentsByAccount(accountId: string): Promise<QuestAssignment[]>;
  updateQuestAssignmentStatus(id: string, status: QuestAssignmentStatus): Promise<QuestAssignment | undefined>;
  applyQuestRewards(accountId: string, rewards: QuestRewards): Promise<Account | undefined>;
  
  // Guild methods
  createGuild(guild: InsertGuild): Promise<Guild>;
  getGuild(id: string): Promise<Guild | undefined>;
  getGuildByName(name: string): Promise<Guild | undefined>;
  getAllGuilds(): Promise<Guild[]>;
  updateGuildBank(id: string, bank: GuildBank): Promise<Guild | undefined>;
  updateGuildDungeonProgress(id: string, floor: number, level: number): Promise<Guild | undefined>;
  deleteGuild(id: string): Promise<void>;
  
  addGuildMember(member: InsertGuildMember): Promise<GuildMember>;
  getGuildMember(accountId: string): Promise<GuildMember | undefined>;
  getGuildMembers(guildId: string): Promise<GuildMember[]>;
  removeGuildMember(accountId: string): Promise<void>;
  
  createGuildInvite(invite: InsertGuildInvite): Promise<GuildInvite>;
  getGuildInvite(id: string): Promise<GuildInvite | undefined>;
  getGuildInvitesByAccount(accountId: string): Promise<GuildInvite[]>;
  getGuildInvitesByGuild(guildId: string): Promise<GuildInvite[]>;
  deleteGuildInvite(id: string): Promise<void>;
  
  // Skill auction methods
  createSkillAuction(auction: InsertSkillAuction): Promise<SkillAuction>;
  getSkillAuction(id: string): Promise<SkillAuction | undefined>;
  getActiveAuction(): Promise<SkillAuction | undefined>;
  getQueuedAuctions(): Promise<SkillAuction[]>;
  updateSkillAuction(id: string, data: Partial<SkillAuction>): Promise<SkillAuction | undefined>;
  deleteSkillAuction(id: string): Promise<void>;
  
  createSkillBid(bid: InsertSkillBid): Promise<SkillBid>;
  getSkillBid(id: string): Promise<SkillBid | undefined>;
  getAuctionBids(auctionId: string): Promise<SkillBid[]>;
  getHighestBid(auctionId: string): Promise<SkillBid | undefined>;
  
  // Player skills methods
  addPlayerSkill(skill: InsertPlayerSkill): Promise<PlayerSkill>;
  getPlayerSkills(accountId: string): Promise<PlayerSkill[]>;
  getPlayerSkill(id: string): Promise<PlayerSkill | undefined>;
  updatePlayerSkill(id: string, data: Partial<PlayerSkill>): Promise<PlayerSkill | undefined>;
  getEquippedSkill(accountId: string): Promise<PlayerSkill | undefined>;
  
  // Activity feed methods
  createActivityFeed(activity: InsertActivityFeed): Promise<ActivityFeed>;
  getRecentActivities(limit?: number): Promise<ActivityFeed[]>;
  
  // Guild battle methods
  createGuildBattle(battle: InsertGuildBattle): Promise<GuildBattle>;
  getGuildBattle(id: string): Promise<GuildBattle | undefined>;
  getGuildBattlesByGuild(guildId: string): Promise<GuildBattle[]>;
  getPendingGuildBattles(): Promise<GuildBattle[]>;
  getActiveGuildBattles(): Promise<GuildBattle[]>;
  updateGuildBattle(id: string, data: Partial<GuildBattle>): Promise<GuildBattle | undefined>;
  updateGuildWins(id: string, wins: number): Promise<Guild | undefined>;
  
  // Trade methods
  createTrade(trade: InsertTrade): Promise<Trade>;
  getTrade(id: string): Promise<Trade | undefined>;
  getTradesByAccount(accountId: string): Promise<Trade[]>;
  getPendingTradesForAccount(accountId: string): Promise<Trade[]>;
  updateTrade(id: string, data: Partial<Trade>): Promise<Trade | undefined>;
  addTradeItem(item: InsertTradeItem): Promise<TradeItem>;
  getTradeItems(tradeId: string): Promise<TradeItem[]>;
  removeTradeItem(id: string): Promise<void>;
  
  // Guild level methods
  updateGuildLevel(id: string, level: number): Promise<Guild | undefined>;
}

export class DatabaseStorage implements IStorage {
  async getAccount(id: string): Promise<Account | undefined> {
    const [account] = await db.select().from(accounts).where(eq(accounts.id, id));
    return account || undefined;
  }

  async getAccountByUsername(username: string): Promise<Account | undefined> {
    const [account] = await db.select().from(accounts).where(eq(accounts.username, username));
    return account || undefined;
  }

  async createAccount(insertAccount: InsertAccount): Promise<Account> {
    const [account] = await db
      .insert(accounts)
      .values(insertAccount)
      .returning();
    return account;
  }

  async updateAccountGold(id: string, gold: number): Promise<Account | undefined> {
    const [account] = await db
      .update(accounts)
      .set({ gold })
      .where(eq(accounts.id, id))
      .returning();
    return account || undefined;
  }

  async updateAccountStats(id: string, stats: PlayerStats): Promise<Account | undefined> {
    const [account] = await db
      .update(accounts)
      .set({ stats })
      .where(eq(accounts.id, id))
      .returning();
    return account || undefined;
  }

  async updateAccountEquipped(id: string, equipped: Equipped): Promise<Account | undefined> {
    const [account] = await db
      .update(accounts)
      .set({ equipped })
      .where(eq(accounts.id, id))
      .returning();
    return account || undefined;
  }

  async updateAccountRank(id: string, rank: PlayerRank): Promise<Account | undefined> {
    const [account] = await db
      .update(accounts)
      .set({ rank })
      .where(eq(accounts.id, id))
      .returning();
    return account || undefined;
  }

  async updateAccountWins(id: string, wins: number): Promise<Account | undefined> {
    const [account] = await db
      .update(accounts)
      .set({ wins })
      .where(eq(accounts.id, id))
      .returning();
    return account || undefined;
  }

  async updateAccountLosses(id: string, losses: number): Promise<Account | undefined> {
    const [account] = await db
      .update(accounts)
      .set({ losses })
      .where(eq(accounts.id, id))
      .returning();
    return account || undefined;
  }

  async updateAccountResources(id: string, data: Partial<Pick<Account, "rubies" | "soulShards" | "focusedShards" | "pets">>): Promise<Account | undefined> {
    const [account] = await db
      .update(accounts)
      .set(data)
      .where(eq(accounts.id, id))
      .returning();
    return account || undefined;
  }

  async updateAccount(id: string, data: Partial<Pick<Account, "gold" | "rubies" | "soulShards" | "focusedShards" | "trainingPoints" | "petExp" | "runes" | "pets" | "stats" | "equipped" | "rank" | "wins" | "losses">>): Promise<Account | undefined> {
    const cap = (val: number | undefined) => val !== undefined ? Math.min(val, Number.MAX_SAFE_INTEGER) : undefined;
    const cappedData = {
      ...data,
      gold: cap(data.gold),
      rubies: cap(data.rubies),
      soulShards: cap(data.soulShards),
      focusedShards: cap(data.focusedShards),
      trainingPoints: cap(data.trainingPoints),
      petExp: cap(data.petExp),
      runes: cap(data.runes),
    };
    // Remove undefined values
    Object.keys(cappedData).forEach(key => cappedData[key as keyof typeof cappedData] === undefined && delete cappedData[key as keyof typeof cappedData]);
    
    const [account] = await db
      .update(accounts)
      .set(cappedData)
      .where(eq(accounts.id, id))
      .returning();
    return account || undefined;
  }

  async capAccountResources(id: string): Promise<void> {
    const MAX_SAFE = 9007199254740991;
    await db.execute(sql`
      UPDATE accounts SET
        gold = LEAST(gold, ${MAX_SAFE}),
        rubies = LEAST(rubies, ${MAX_SAFE}),
        soul_shards = LEAST(soul_shards, ${MAX_SAFE}),
        focused_shards = LEAST(focused_shards, ${MAX_SAFE}),
        training_points = LEAST(training_points, ${MAX_SAFE}),
        pet_exp = LEAST(pet_exp, ${MAX_SAFE}),
        runes = LEAST(runes, ${MAX_SAFE})
      WHERE id = ${id}
    `);
  }

  async getInventoryByAccount(accountId: string): Promise<InventoryItem[]> {
    return db.select().from(inventoryItems).where(eq(inventoryItems.accountId, accountId));
  }

  async getInventoryItem(id: string): Promise<InventoryItem | undefined> {
    const [item] = await db.select().from(inventoryItems).where(eq(inventoryItems.id, id));
    return item || undefined;
  }

  async updateInventoryItemStats(id: string, stats: Partial<Stats>): Promise<InventoryItem | undefined> {
    const [item] = await db
      .update(inventoryItems)
      .set({ stats })
      .where(eq(inventoryItems.id, id))
      .returning();
    return item || undefined;
  }

  async addToInventory(insertItem: InsertInventoryItem): Promise<InventoryItem> {
    const [item] = await db
      .insert(inventoryItems)
      .values(insertItem)
      .returning();
    return item;
  }

  async removeFromInventory(id: string): Promise<void> {
    await db.delete(inventoryItems).where(eq(inventoryItems.id, id));
  }

  async getAllAccounts(): Promise<Account[]> {
    return db.select().from(accounts);
  }

  async deleteAccount(id: string): Promise<void> {
    await db.delete(accounts).where(eq(accounts.id, id));
  }

  async createEvent(event: InsertEvent): Promise<Event> {
    const [newEvent] = await db.insert(events).values(event).returning();
    return newEvent;
  }

  async getEvent(id: string): Promise<Event | undefined> {
    const [event] = await db.select().from(events).where(eq(events.id, id));
    return event || undefined;
  }

  async getAllEvents(): Promise<Event[]> {
    return db.select().from(events);
  }

  async deleteEvent(id: string): Promise<void> {
    await db.delete(events).where(eq(events.id, id));
  }

  async registerForEvent(registration: InsertEventRegistration): Promise<EventRegistration> {
    const [newRegistration] = await db.insert(eventRegistrations).values(registration).returning();
    return newRegistration;
  }

  async unregisterFromEvent(eventId: string, accountId: string): Promise<void> {
    await db.delete(eventRegistrations).where(
      and(
        eq(eventRegistrations.eventId, eventId),
        eq(eventRegistrations.accountId, accountId)
      )
    );
  }

  async getEventRegistrations(eventId: string): Promise<EventRegistration[]> {
    return db.select().from(eventRegistrations).where(eq(eventRegistrations.eventId, eventId));
  }

  async getPlayerEventRegistrations(accountId: string): Promise<EventRegistration[]> {
    return db.select().from(eventRegistrations).where(eq(eventRegistrations.accountId, accountId));
  }

  async isRegisteredForEvent(eventId: string, accountId: string): Promise<boolean> {
    const [registration] = await db.select().from(eventRegistrations).where(
      and(
        eq(eventRegistrations.eventId, eventId),
        eq(eventRegistrations.accountId, accountId)
      )
    );
    return !!registration;
  }

  async createChallenge(challenge: InsertChallenge): Promise<Challenge> {
    const [newChallenge] = await db.insert(challenges).values(challenge).returning();
    return newChallenge;
  }

  async getChallenge(id: string): Promise<Challenge | undefined> {
    const [challenge] = await db.select().from(challenges).where(eq(challenges.id, id));
    return challenge || undefined;
  }

  async getChallengesForPlayer(accountId: string): Promise<Challenge[]> {
    return db.select().from(challenges).where(
      or(
        eq(challenges.challengerId, accountId),
        eq(challenges.challengedId, accountId)
      )
    );
  }

  async getAcceptedChallenges(): Promise<Challenge[]> {
    return db.select().from(challenges).where(eq(challenges.status, "accepted"));
  }

  async updateChallengeStatus(id: string, status: ChallengeStatus, acceptedAt?: Date): Promise<Challenge | undefined> {
    const updateData: Partial<Challenge> = { status };
    if (acceptedAt) {
      updateData.acceptedAt = acceptedAt;
    }
    const [challenge] = await db.update(challenges).set(updateData).where(eq(challenges.id, id)).returning();
    return challenge || undefined;
  }

  async setChallengeWinner(id: string, winnerId: string): Promise<Challenge | undefined> {
    const [challenge] = await db.update(challenges).set({ 
      winnerId, 
      status: "completed" as ChallengeStatus,
      completedAt: new Date()
    }).where(eq(challenges.id, id)).returning();
    return challenge || undefined;
  }

  async createPet(pet: InsertPet): Promise<Pet> {
    const [newPet] = await db.insert(pets).values(pet).returning();
    return newPet;
  }

  async getPet(id: string): Promise<Pet | undefined> {
    const [pet] = await db.select().from(pets).where(eq(pets.id, id));
    return pet || undefined;
  }

  async getPetsByAccount(accountId: string): Promise<Pet[]> {
    return db.select().from(pets).where(eq(pets.accountId, accountId));
  }

  async getAllPets(): Promise<Pet[]> {
    return db.select().from(pets);
  }

  async updatePet(id: string, data: Partial<Pick<Pet, "name" | "tier" | "exp" | "stats" | "element" | "elements" | "accountId">>): Promise<Pet | undefined> {
    const [pet] = await db.update(pets).set(data).where(eq(pets.id, id)).returning();
    return pet || undefined;
  }

  async deletePet(id: string): Promise<void> {
    await db.delete(pets).where(eq(pets.id, id));
  }

  async updateLastActive(id: string): Promise<void> {
    await db.update(accounts).set({ lastActive: new Date() }).where(eq(accounts.id, id));
  }

  async updateNpcProgress(id: string, floor: number, level: number): Promise<Account | undefined> {
    const [account] = await db
      .update(accounts)
      .set({ npcFloor: floor, npcLevel: level })
      .where(eq(accounts.id, id))
      .returning();
    return account || undefined;
  }

  // Leaderboard methods
  async getLeaderboardCache(type: string): Promise<LeaderboardCache | undefined> {
    const [cache] = await db.select().from(leaderboardCache).where(eq(leaderboardCache.type, type));
    return cache || undefined;
  }

  async setLeaderboardCache(type: string, data: LeaderboardEntry[]): Promise<LeaderboardCache> {
    // Delete existing cache for this type
    await db.delete(leaderboardCache).where(eq(leaderboardCache.type, type));
    // Insert new cache
    const [cache] = await db.insert(leaderboardCache).values({
      type,
      data,
      refreshedAt: new Date(),
    }).returning();
    return cache;
  }

  // Quest methods
  async createQuest(quest: InsertQuest): Promise<Quest> {
    const [newQuest] = await db.insert(quests).values(quest).returning();
    return newQuest;
  }

  async getQuest(id: string): Promise<Quest | undefined> {
    const [quest] = await db.select().from(quests).where(eq(quests.id, id));
    return quest || undefined;
  }

  async getAllQuests(): Promise<Quest[]> {
    return db.select().from(quests).orderBy(desc(quests.createdAt));
  }

  async updateQuestStatus(id: string, status: string): Promise<Quest | undefined> {
    const [quest] = await db.update(quests).set({ status: status as any }).where(eq(quests.id, id)).returning();
    return quest || undefined;
  }

  async deleteQuest(id: string): Promise<void> {
    await db.delete(quests).where(eq(quests.id, id));
  }

  async createQuestAssignment(assignment: InsertQuestAssignment): Promise<QuestAssignment> {
    const [newAssignment] = await db.insert(questAssignments).values(assignment).returning();
    return newAssignment;
  }

  async getQuestAssignment(id: string): Promise<QuestAssignment | undefined> {
    const [assignment] = await db.select().from(questAssignments).where(eq(questAssignments.id, id));
    return assignment || undefined;
  }

  async getQuestAssignmentsByQuest(questId: string): Promise<QuestAssignment[]> {
    return db.select().from(questAssignments).where(eq(questAssignments.questId, questId));
  }

  async getQuestAssignmentsByAccount(accountId: string): Promise<QuestAssignment[]> {
    return db.select().from(questAssignments).where(eq(questAssignments.accountId, accountId));
  }

  async updateQuestAssignmentStatus(id: string, status: QuestAssignmentStatus): Promise<QuestAssignment | undefined> {
    const updateData: any = { status };
    if (status === "accepted") updateData.acceptedAt = new Date();
    if (status === "completed") updateData.completedAt = new Date();
    if (status === "rewarded") updateData.rewardedAt = new Date();
    
    const [assignment] = await db.update(questAssignments).set(updateData).where(eq(questAssignments.id, id)).returning();
    return assignment || undefined;
  }

  async applyQuestRewards(accountId: string, rewards: QuestRewards): Promise<Account | undefined> {
    const account = await this.getAccount(accountId);
    if (!account) return undefined;

    const cap = (val: number) => Math.min(val, Number.MAX_SAFE_INTEGER);

    const updateData: any = {};
    if (rewards.gold) updateData.gold = cap(account.gold + rewards.gold);
    if (rewards.rubies) updateData.rubies = cap((account.rubies || 0) + rewards.rubies);
    if (rewards.soulShards) updateData.soulShards = cap((account.soulShards || 0) + rewards.soulShards);
    if (rewards.focusedShards) updateData.focusedShards = cap((account.focusedShards || 0) + rewards.focusedShards);
    if (rewards.trainingPoints) updateData.trainingPoints = cap((account.trainingPoints || 0) + rewards.trainingPoints);
    if (rewards.runes) updateData.runes = cap((account.runes || 0) + rewards.runes);
    if (rewards.petExp) updateData.petExp = cap((account.petExp || 0) + rewards.petExp);

    if (Object.keys(updateData).length === 0) return account;

    const [updated] = await db.update(accounts).set(updateData).where(eq(accounts.id, accountId)).returning();
    return updated || undefined;
  }

  // Guild methods
  async createGuild(guild: InsertGuild): Promise<Guild> {
    const [newGuild] = await db.insert(guilds).values(guild).returning();
    return newGuild;
  }

  async getGuild(id: string): Promise<Guild | undefined> {
    const [guild] = await db.select().from(guilds).where(eq(guilds.id, id));
    return guild || undefined;
  }

  async getGuildByName(name: string): Promise<Guild | undefined> {
    const [guild] = await db.select().from(guilds).where(eq(guilds.name, name));
    return guild || undefined;
  }

  async getAllGuilds(): Promise<Guild[]> {
    return db.select().from(guilds).orderBy(desc(guilds.createdAt));
  }

  async updateGuildBank(id: string, bank: GuildBank): Promise<Guild | undefined> {
    const [guild] = await db.update(guilds).set({ bank }).where(eq(guilds.id, id)).returning();
    return guild || undefined;
  }

  async updateGuildDungeonProgress(id: string, floor: number, level: number): Promise<Guild | undefined> {
    const [guild] = await db.update(guilds).set({ dungeonFloor: floor, dungeonLevel: level }).where(eq(guilds.id, id)).returning();
    return guild || undefined;
  }

  async deleteGuild(id: string): Promise<void> {
    await db.delete(guilds).where(eq(guilds.id, id));
  }

  async addGuildMember(member: InsertGuildMember): Promise<GuildMember> {
    const [newMember] = await db.insert(guildMembers).values(member).returning();
    return newMember;
  }

  async getGuildMember(accountId: string): Promise<GuildMember | undefined> {
    const [member] = await db.select().from(guildMembers).where(eq(guildMembers.accountId, accountId));
    return member || undefined;
  }

  async getGuildMembers(guildId: string): Promise<GuildMember[]> {
    return db.select().from(guildMembers).where(eq(guildMembers.guildId, guildId));
  }

  async removeGuildMember(accountId: string): Promise<void> {
    await db.delete(guildMembers).where(eq(guildMembers.accountId, accountId));
  }

  async createGuildInvite(invite: InsertGuildInvite): Promise<GuildInvite> {
    const [newInvite] = await db.insert(guildInvites).values(invite).returning();
    return newInvite;
  }

  async getGuildInvite(id: string): Promise<GuildInvite | undefined> {
    const [invite] = await db.select().from(guildInvites).where(eq(guildInvites.id, id));
    return invite || undefined;
  }

  async getGuildInvitesByAccount(accountId: string): Promise<GuildInvite[]> {
    return db.select().from(guildInvites).where(eq(guildInvites.accountId, accountId));
  }

  async getGuildInvitesByGuild(guildId: string): Promise<GuildInvite[]> {
    return db.select().from(guildInvites).where(eq(guildInvites.guildId, guildId));
  }

  async deleteGuildInvite(id: string): Promise<void> {
    await db.delete(guildInvites).where(eq(guildInvites.id, id));
  }

  // Skill auction methods
  async createSkillAuction(auction: InsertSkillAuction): Promise<SkillAuction> {
    const [newAuction] = await db.insert(skillAuctions).values(auction).returning();
    return newAuction;
  }

  async getSkillAuction(id: string): Promise<SkillAuction | undefined> {
    const [auction] = await db.select().from(skillAuctions).where(eq(skillAuctions.id, id));
    return auction || undefined;
  }

  async getActiveAuction(): Promise<SkillAuction | undefined> {
    const [auction] = await db.select().from(skillAuctions).where(eq(skillAuctions.status, "active"));
    return auction || undefined;
  }

  async getQueuedAuctions(): Promise<SkillAuction[]> {
    return db.select().from(skillAuctions).where(eq(skillAuctions.status, "queued")).orderBy(asc(skillAuctions.createdAt));
  }

  async updateSkillAuction(id: string, data: Partial<SkillAuction>): Promise<SkillAuction | undefined> {
    const [auction] = await db.update(skillAuctions).set(data).where(eq(skillAuctions.id, id)).returning();
    return auction || undefined;
  }

  async deleteSkillAuction(id: string): Promise<void> {
    await db.delete(skillAuctions).where(eq(skillAuctions.id, id));
  }

  async createSkillBid(bid: InsertSkillBid): Promise<SkillBid> {
    const [newBid] = await db.insert(skillBids).values(bid).returning();
    return newBid;
  }

  async getSkillBid(id: string): Promise<SkillBid | undefined> {
    const [bid] = await db.select().from(skillBids).where(eq(skillBids.id, id));
    return bid || undefined;
  }

  async getAuctionBids(auctionId: string): Promise<SkillBid[]> {
    return db.select().from(skillBids).where(eq(skillBids.auctionId, auctionId)).orderBy(desc(skillBids.amount));
  }

  async getHighestBid(auctionId: string): Promise<SkillBid | undefined> {
    const [bid] = await db.select().from(skillBids).where(eq(skillBids.auctionId, auctionId)).orderBy(desc(skillBids.amount)).limit(1);
    return bid || undefined;
  }

  // Player skills methods
  async addPlayerSkill(skill: InsertPlayerSkill): Promise<PlayerSkill> {
    const [newSkill] = await db.insert(playerSkills).values(skill).returning();
    return newSkill;
  }

  async getPlayerSkills(accountId: string): Promise<PlayerSkill[]> {
    return db.select().from(playerSkills).where(eq(playerSkills.accountId, accountId));
  }

  async getPlayerSkill(id: string): Promise<PlayerSkill | undefined> {
    const [skill] = await db.select().from(playerSkills).where(eq(playerSkills.id, id));
    return skill || undefined;
  }

  async updatePlayerSkill(id: string, data: Partial<PlayerSkill>): Promise<PlayerSkill | undefined> {
    const [skill] = await db.update(playerSkills).set(data).where(eq(playerSkills.id, id)).returning();
    return skill || undefined;
  }

  async getEquippedSkill(accountId: string): Promise<PlayerSkill | undefined> {
    const [skill] = await db.select().from(playerSkills).where(and(eq(playerSkills.accountId, accountId), eq(playerSkills.isEquipped, true)));
    return skill || undefined;
  }

  // Activity feed methods
  async createActivityFeed(activity: InsertActivityFeed): Promise<ActivityFeed> {
    const [newActivity] = await db.insert(activityFeed).values(activity).returning();
    return newActivity;
  }

  async getRecentActivities(limit: number = 50): Promise<ActivityFeed[]> {
    return db.select().from(activityFeed).orderBy(desc(activityFeed.createdAt)).limit(limit);
  }

  // Guild battle methods
  async createGuildBattle(battle: InsertGuildBattle): Promise<GuildBattle> {
    const [newBattle] = await db.insert(guildBattles).values(battle).returning();
    return newBattle;
  }

  async getGuildBattle(id: string): Promise<GuildBattle | undefined> {
    const [battle] = await db.select().from(guildBattles).where(eq(guildBattles.id, id));
    return battle || undefined;
  }

  async getGuildBattlesByGuild(guildId: string): Promise<GuildBattle[]> {
    return db.select().from(guildBattles).where(
      or(eq(guildBattles.challengerGuildId, guildId), eq(guildBattles.challengedGuildId, guildId))
    ).orderBy(desc(guildBattles.createdAt));
  }

  async getPendingGuildBattles(): Promise<GuildBattle[]> {
    return db.select().from(guildBattles).where(eq(guildBattles.status, "pending")).orderBy(desc(guildBattles.createdAt));
  }

  async getActiveGuildBattles(): Promise<GuildBattle[]> {
    return db.select().from(guildBattles).where(
      or(eq(guildBattles.status, "accepted"), eq(guildBattles.status, "in_progress"))
    ).orderBy(desc(guildBattles.createdAt));
  }

  async updateGuildBattle(id: string, data: Partial<GuildBattle>): Promise<GuildBattle | undefined> {
    const [battle] = await db.update(guildBattles).set(data).where(eq(guildBattles.id, id)).returning();
    return battle || undefined;
  }

  async updateGuildWins(id: string, wins: number): Promise<Guild | undefined> {
    const [guild] = await db.update(guilds).set({ wins }).where(eq(guilds.id, id)).returning();
    return guild || undefined;
  }

  // Trade methods
  async createTrade(trade: InsertTrade): Promise<Trade> {
    const [newTrade] = await db.insert(trades).values(trade).returning();
    return newTrade;
  }

  async getTrade(id: string): Promise<Trade | undefined> {
    const [trade] = await db.select().from(trades).where(eq(trades.id, id));
    return trade || undefined;
  }

  async getTradesByAccount(accountId: string): Promise<Trade[]> {
    return db.select().from(trades).where(
      or(eq(trades.initiatorId, accountId), eq(trades.recipientId, accountId))
    ).orderBy(desc(trades.createdAt));
  }

  async getPendingTradesForAccount(accountId: string): Promise<Trade[]> {
    return db.select().from(trades).where(
      and(
        or(eq(trades.initiatorId, accountId), eq(trades.recipientId, accountId)),
        eq(trades.status, "pending")
      )
    ).orderBy(desc(trades.createdAt));
  }

  async updateTrade(id: string, data: Partial<Trade>): Promise<Trade | undefined> {
    const [trade] = await db.update(trades).set(data).where(eq(trades.id, id)).returning();
    return trade || undefined;
  }

  async addTradeItem(item: InsertTradeItem): Promise<TradeItem> {
    const [newItem] = await db.insert(tradeItems).values(item).returning();
    return newItem;
  }

  async getTradeItems(tradeId: string): Promise<TradeItem[]> {
    return db.select().from(tradeItems).where(eq(tradeItems.tradeId, tradeId));
  }

  async removeTradeItem(id: string): Promise<void> {
    await db.delete(tradeItems).where(eq(tradeItems.id, id));
  }

  // Guild level methods
  async updateGuildLevel(id: string, level: number): Promise<Guild | undefined> {
    const [guild] = await db.update(guilds).set({ level }).where(eq(guilds.id, id)).returning();
    return guild || undefined;
  }
}

export const storage = new DatabaseStorage();
