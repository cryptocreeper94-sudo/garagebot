import { db } from "@db";
import { users, vehicles, deals, hallmarks } from "@shared/schema";
import type { User, UpsertUser, Vehicle, InsertVehicle, Deal, InsertDeal, Hallmark, InsertHallmark } from "@shared/schema";
import { eq, and, desc } from "drizzle-orm";

export interface IStorage {
  // Users
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  updateUser(id: string, updates: Partial<User>): Promise<User | undefined>;

  // Vehicles
  getVehiclesByUserId(userId: string): Promise<Vehicle[]>;
  getVehicle(id: string): Promise<Vehicle | undefined>;
  createVehicle(vehicle: InsertVehicle): Promise<Vehicle>;
  updateVehicle(id: string, updates: Partial<Vehicle>): Promise<Vehicle | undefined>;
  deleteVehicle(id: string): Promise<boolean>;
  setPrimaryVehicle(userId: string, vehicleId: string): Promise<void>;

  // Deals
  getActiveDeals(): Promise<Deal[]>;
  getDeal(id: string): Promise<Deal | undefined>;
  createDeal(deal: InsertDeal): Promise<Deal>;
  updateDeal(id: string, updates: Partial<Deal>): Promise<Deal | undefined>;

  // Hallmarks
  getHallmarkByUserId(userId: string): Promise<Hallmark | undefined>;
  createHallmark(hallmark: InsertHallmark): Promise<Hallmark>;
}

export class DatabaseStorage implements IStorage {
  // Users
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User | undefined> {
    const [user] = await db.update(users).set(updates).where(eq(users.id, id)).returning();
    return user;
  }

  // Vehicles
  async getVehiclesByUserId(userId: string): Promise<Vehicle[]> {
    return await db.select().from(vehicles).where(eq(vehicles.userId, userId)).orderBy(desc(vehicles.isPrimary));
  }

  async getVehicle(id: string): Promise<Vehicle | undefined> {
    const [vehicle] = await db.select().from(vehicles).where(eq(vehicles.id, id));
    return vehicle;
  }

  async createVehicle(insertVehicle: InsertVehicle): Promise<Vehicle> {
    const [vehicle] = await db.insert(vehicles).values(insertVehicle).returning();
    return vehicle;
  }

  async updateVehicle(id: string, updates: Partial<Vehicle>): Promise<Vehicle | undefined> {
    const [vehicle] = await db.update(vehicles).set(updates).where(eq(vehicles.id, id)).returning();
    return vehicle;
  }

  async deleteVehicle(id: string): Promise<boolean> {
    const result = await db.delete(vehicles).where(eq(vehicles.id, id));
    return result.rowCount ? result.rowCount > 0 : false;
  }

  async setPrimaryVehicle(userId: string, vehicleId: string): Promise<void> {
    await db.update(vehicles).set({ isPrimary: false }).where(eq(vehicles.userId, userId));
    await db.update(vehicles).set({ isPrimary: true }).where(eq(vehicles.id, vehicleId));
  }

  // Deals
  async getActiveDeals(): Promise<Deal[]> {
    return await db.select().from(deals).where(eq(deals.isActive, true)).orderBy(desc(deals.createdAt));
  }

  async getDeal(id: string): Promise<Deal | undefined> {
    const [deal] = await db.select().from(deals).where(eq(deals.id, id));
    return deal;
  }

  async createDeal(insertDeal: InsertDeal): Promise<Deal> {
    const [deal] = await db.insert(deals).values(insertDeal).returning();
    return deal;
  }

  async updateDeal(id: string, updates: Partial<Deal>): Promise<Deal | undefined> {
    const [deal] = await db.update(deals).set(updates).where(eq(deals.id, id)).returning();
    return deal;
  }

  // Hallmarks
  async getHallmarkByUserId(userId: string): Promise<Hallmark | undefined> {
    const [hallmark] = await db.select().from(hallmarks).where(eq(hallmarks.userId, userId));
    return hallmark;
  }

  async createHallmark(insertHallmark: InsertHallmark): Promise<Hallmark> {
    const [hallmark] = await db.insert(hallmarks).values(insertHallmark).returning();
    return hallmark;
  }
}

export const storage = new DatabaseStorage();
