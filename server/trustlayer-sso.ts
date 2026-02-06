import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { db } from "@db";
import { chatUsers } from "@shared/schema";
import { eq } from "drizzle-orm";

const SALT_ROUNDS = 12;
const JWT_EXPIRY = "7d";
const PASSWORD_REGEX = /^(?=.*[A-Z])(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,}$/;

function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET || process.env.SESSION_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET or SESSION_SECRET must be set");
  }
  return secret;
}

export function generateTrustLayerId(): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 10);
  return `tl-${timestamp}-${random}`;
}

export function validatePassword(password: string): { valid: boolean; error?: string } {
  if (!password || password.length < 8) {
    return { valid: false, error: "Password must be at least 8 characters" };
  }
  if (!/[A-Z]/.test(password)) {
    return { valid: false, error: "Password must contain at least 1 uppercase letter" };
  }
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    return { valid: false, error: "Password must contain at least 1 special character" };
  }
  return { valid: true };
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function generateToken(userId: string, trustLayerId: string): string {
  return jwt.sign(
    { userId, trustLayerId, iss: "trust-layer-sso" },
    getJwtSecret(),
    { expiresIn: JWT_EXPIRY, algorithm: "HS256" }
  );
}

export function verifyToken(token: string): { userId: string; trustLayerId: string } | null {
  try {
    const decoded = jwt.verify(token, getJwtSecret()) as any;
    if (decoded.iss !== "trust-layer-sso") return null;
    return { userId: decoded.userId, trustLayerId: decoded.trustLayerId };
  } catch {
    return null;
  }
}

function randomAvatarColor(): string {
  const colors = ["#06b6d4", "#8b5cf6", "#f43f5e", "#f97316", "#22c55e", "#3b82f6", "#ec4899", "#eab308"];
  return colors[Math.floor(Math.random() * colors.length)];
}

export async function registerChatUser(data: {
  username: string;
  email: string;
  password: string;
  displayName: string;
}): Promise<{ success: boolean; user?: any; token?: string; error?: string }> {
  const validation = validatePassword(data.password);
  if (!validation.valid) {
    return { success: false, error: validation.error };
  }

  const existing = await db.select().from(chatUsers)
    .where(eq(chatUsers.email, data.email.toLowerCase()))
    .limit(1);
  if (existing.length > 0) {
    return { success: false, error: "Email already registered" };
  }

  const existingUsername = await db.select().from(chatUsers)
    .where(eq(chatUsers.username, data.username.toLowerCase()))
    .limit(1);
  if (existingUsername.length > 0) {
    return { success: false, error: "Username already taken" };
  }

  const passwordHash = await hashPassword(data.password);
  const trustLayerId = generateTrustLayerId();
  const avatarColor = randomAvatarColor();

  const [user] = await db.insert(chatUsers).values({
    username: data.username.toLowerCase(),
    email: data.email.toLowerCase(),
    passwordHash,
    displayName: data.displayName,
    avatarColor,
    role: "member",
    trustLayerId,
    isOnline: false,
  }).returning();

  const token = generateToken(user.id, trustLayerId);

  return {
    success: true,
    user: {
      id: user.id,
      username: user.username,
      displayName: user.displayName,
      email: user.email,
      avatarColor: user.avatarColor,
      role: user.role,
      trustLayerId: user.trustLayerId,
    },
    token,
  };
}

export async function loginChatUser(data: {
  username: string;
  password: string;
}): Promise<{ success: boolean; user?: any; token?: string; error?: string }> {
  const [user] = await db.select().from(chatUsers)
    .where(eq(chatUsers.username, data.username.toLowerCase()))
    .limit(1);

  if (!user) {
    const [userByEmail] = await db.select().from(chatUsers)
      .where(eq(chatUsers.email, data.username.toLowerCase()))
      .limit(1);
    if (!userByEmail) {
      return { success: false, error: "Invalid credentials" };
    }
    const valid = await verifyPassword(data.password, userByEmail.passwordHash);
    if (!valid) {
      return { success: false, error: "Invalid credentials" };
    }
    const token = generateToken(userByEmail.id, userByEmail.trustLayerId || "");
    await db.update(chatUsers).set({ isOnline: true, lastSeen: new Date() }).where(eq(chatUsers.id, userByEmail.id));
    return {
      success: true,
      user: {
        id: userByEmail.id,
        username: userByEmail.username,
        displayName: userByEmail.displayName,
        email: userByEmail.email,
        avatarColor: userByEmail.avatarColor,
        role: userByEmail.role,
        trustLayerId: userByEmail.trustLayerId,
      },
      token,
    };
  }

  const valid = await verifyPassword(data.password, user.passwordHash);
  if (!valid) {
    return { success: false, error: "Invalid credentials" };
  }

  const token = generateToken(user.id, user.trustLayerId || "");
  await db.update(chatUsers).set({ isOnline: true, lastSeen: new Date() }).where(eq(chatUsers.id, user.id));

  return {
    success: true,
    user: {
      id: user.id,
      username: user.username,
      displayName: user.displayName,
      email: user.email,
      avatarColor: user.avatarColor,
      role: user.role,
      trustLayerId: user.trustLayerId,
    },
    token,
  };
}

export async function getChatUserFromToken(token: string): Promise<{ success: boolean; user?: any; error?: string }> {
  const decoded = verifyToken(token);
  if (!decoded) {
    return { success: false, error: "Invalid or expired token" };
  }

  const [user] = await db.select().from(chatUsers)
    .where(eq(chatUsers.id, decoded.userId))
    .limit(1);

  if (!user) {
    return { success: false, error: "User not found" };
  }

  return {
    success: true,
    user: {
      id: user.id,
      username: user.username,
      displayName: user.displayName,
      email: user.email,
      avatarColor: user.avatarColor,
      role: user.role,
      trustLayerId: user.trustLayerId,
    },
  };
}
