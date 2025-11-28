import crypto from "crypto";

const SALT_LENGTH = 16;
const KEY_LENGTH = 32;
const ITERATIONS = 100000;

export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(SALT_LENGTH).toString("hex");
  const hash = crypto.pbkdf2Sync(password, salt, ITERATIONS, KEY_LENGTH, "sha256").toString("hex");
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, storedHash: string): boolean {
  const [salt, hash] = storedHash.split(":");
  if (!salt || !hash) return false;
  const verifyHash = crypto.pbkdf2Sync(password, salt, ITERATIONS, KEY_LENGTH, "sha256").toString("hex");
  return crypto.timingSafeEqual(Buffer.from(hash), Buffer.from(verifyHash));
}

export function hashPin(pin: string): string {
  return hashPassword(pin);
}

export function verifyPin(pin: string, storedHash: string): boolean {
  return verifyPassword(pin, storedHash);
}

export function generateRecoveryCodes(count: number = 8): { codes: string[]; hashedCodes: string[] } {
  const codes: string[] = [];
  const hashedCodes: string[] = [];
  for (let i = 0; i < count; i++) {
    const code = crypto.randomBytes(4).toString("hex").toUpperCase();
    const formattedCode = `${code.slice(0, 4)}-${code.slice(4)}`;
    codes.push(formattedCode);
    hashedCodes.push(hashPassword(formattedCode));
  }
  return { codes, hashedCodes };
}

export function verifyRecoveryCode(code: string, hashedCodesJson: string): { valid: boolean; remainingHashes: string[] } {
  try {
    const hashedCodes: string[] = JSON.parse(hashedCodesJson);
    for (let i = 0; i < hashedCodes.length; i++) {
      if (verifyPassword(code, hashedCodes[i])) {
        const remainingHashes = [...hashedCodes.slice(0, i), ...hashedCodes.slice(i + 1)];
        return { valid: true, remainingHashes };
      }
    }
    return { valid: false, remainingHashes: hashedCodes };
  } catch {
    return { valid: false, remainingHashes: [] };
  }
}

export function generateSessionToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

export function generateSmsCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export function validateUsername(username: string): { valid: boolean; error?: string } {
  if (username.length < 3) {
    return { valid: false, error: "Username must be at least 3 characters" };
  }
  if (username.length > 30) {
    return { valid: false, error: "Username must be 30 characters or less" };
  }
  if (!/^[a-zA-Z0-9_]+$/.test(username)) {
    return { valid: false, error: "Username can only contain letters, numbers, and underscores" };
  }
  return { valid: true };
}

export function validateMainPin(pin: string): { valid: boolean; error?: string } {
  if (pin.length !== 8) {
    return { valid: false, error: "Main PIN must be exactly 8 digits" };
  }
  if (!/^\d+$/.test(pin)) {
    return { valid: false, error: "Main PIN must contain only numbers" };
  }
  return { valid: true };
}

export function validateQuickPin(pin: string): { valid: boolean; error?: string } {
  if (pin.length !== 4) {
    return { valid: false, error: "Quick PIN must be exactly 4 digits" };
  }
  if (!/^\d+$/.test(pin)) {
    return { valid: false, error: "Quick PIN must contain only numbers" };
  }
  return { valid: true };
}

export function validatePhone(phone: string): { valid: boolean; error?: string } {
  const cleaned = phone.replace(/\D/g, "");
  if (cleaned.length < 10 || cleaned.length > 15) {
    return { valid: false, error: "Please enter a valid phone number" };
  }
  return { valid: true };
}
