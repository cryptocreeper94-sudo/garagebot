# Release Version Control System - Implementation Guide

A copy-pasteable implementation for tracking app releases with timestamps, changelogs, and optional blockchain verification. Perfect for marketing scheduled updates.

## Overview

This system provides:
- Version numbering (beta.0 → v1.0 → v1.1 → v2.0)
- Timestamped releases with EST/local timezone display
- Categorized changelogs (Features, Fixes, Improvements)
- Draft → Published workflow
- Optional blockchain verification for tamper-proof records
- Dev Portal UI for managing releases

---

## 1. Database Schema

Add to your `shared/schema.ts`:

```typescript
import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, timestamp, boolean, jsonb, index } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// ============================================
// RELEASE VERSION CONTROL SYSTEM
// ============================================

export const releases = pgTable("releases", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  
  // Version info
  version: text("version").notNull().unique(), // 'beta.0', 'v1.0', 'v1.1', 'v2.0', etc.
  versionType: text("version_type").notNull(), // 'beta' | 'stable' | 'hotfix' | 'major'
  versionNumber: integer("version_number").notNull(), // Sequential for ordering (1, 2, 3...)
  
  // Release details
  title: text("title"), // Optional release title/codename
  changelog: jsonb("changelog").notNull(), // Array of { category: string, changes: string[] }
  highlights: text("highlights").array(), // Key features for marketing
  
  // Status
  status: text("status").default("draft"), // 'draft' | 'published' | 'archived'
  publishedAt: timestamp("published_at"),
  
  // Blockchain verification (optional - ties to hallmark system)
  isBlockchainVerified: boolean("is_blockchain_verified").default(false),
  blockchainVerificationId: varchar("blockchain_verification_id"),
  
  // Metadata
  createdBy: varchar("created_by"), // Reference to users table if needed
  notes: text("notes"), // Internal dev notes
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("IDX_releases_version").on(table.version),
  index("IDX_releases_status").on(table.status),
  index("IDX_releases_published").on(table.publishedAt),
]);

// Schema exports
export const insertReleaseSchema = createInsertSchema(releases).omit({ 
  id: true, 
  createdAt: true, 
  updatedAt: true,
  publishedAt: true,
  isBlockchainVerified: true,
  blockchainVerificationId: true,
});
export type InsertRelease = z.infer<typeof insertReleaseSchema>;
export type Release = typeof releases.$inferSelect;
```

Run database migration:
```bash
npm run db:push
```

---

## 2. Storage Interface

Add to your `server/storage.ts`:

### Import the table and types:
```typescript
import { releases } from "@shared/schema";
import type { Release, InsertRelease } from "@shared/schema";
```

### Add to IStorage interface:
```typescript
export interface IStorage {
  // ... existing methods ...

  // Release Version Control
  getReleases(filters?: { status?: string }): Promise<Release[]>;
  getRelease(id: string): Promise<Release | undefined>;
  getReleaseByVersion(version: string): Promise<Release | undefined>;
  getLatestRelease(): Promise<Release | undefined>;
  getNextVersionNumber(): Promise<number>;
  createRelease(release: InsertRelease): Promise<Release>;
  updateRelease(id: string, updates: Partial<Release>): Promise<Release | undefined>;
  publishRelease(id: string): Promise<Release | undefined>;
  deleteRelease(id: string): Promise<boolean>;
}
```

### Add implementation to DatabaseStorage class:
```typescript
export class DatabaseStorage implements IStorage {
  // ... existing methods ...

  // Release Version Control
  async getReleases(filters?: { status?: string }): Promise<Release[]> {
    if (filters?.status) {
      return await db.select().from(releases)
        .where(eq(releases.status, filters.status))
        .orderBy(desc(releases.versionNumber));
    }
    return await db.select().from(releases).orderBy(desc(releases.versionNumber));
  }

  async getRelease(id: string): Promise<Release | undefined> {
    const [release] = await db.select().from(releases).where(eq(releases.id, id));
    return release;
  }

  async getReleaseByVersion(version: string): Promise<Release | undefined> {
    const [release] = await db.select().from(releases).where(eq(releases.version, version));
    return release;
  }

  async getLatestRelease(): Promise<Release | undefined> {
    const [release] = await db.select().from(releases)
      .where(eq(releases.status, 'published'))
      .orderBy(desc(releases.versionNumber))
      .limit(1);
    return release;
  }

  async getNextVersionNumber(): Promise<number> {
    const [result] = await db.select({ 
      maxVersion: sql<number>`COALESCE(MAX(${releases.versionNumber}), 0)` 
    }).from(releases);
    return (result?.maxVersion || 0) + 1;
  }

  async createRelease(release: InsertRelease): Promise<Release> {
    const [newRelease] = await db.insert(releases).values(release).returning();
    return newRelease;
  }

  async updateRelease(id: string, updates: Partial<Release>): Promise<Release | undefined> {
    const [release] = await db.update(releases)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(releases.id, id))
      .returning();
    return release;
  }

  async publishRelease(id: string): Promise<Release | undefined> {
    const [release] = await db.update(releases)
      .set({ 
        status: 'published', 
        publishedAt: new Date(),
        updatedAt: new Date() 
      })
      .where(eq(releases.id, id))
      .returning();
    return release;
  }

  async deleteRelease(id: string): Promise<boolean> {
    const result = await db.delete(releases).where(eq(releases.id, id));
    return result.rowCount ? result.rowCount > 0 : false;
  }
}
```

---

## 3. API Routes

Add to your `server/routes.ts`:

```typescript
// ============================================
// RELEASE VERSION CONTROL ROUTES
// ============================================

// Get all releases (optionally filter by status)
app.get('/api/releases', async (req, res) => {
  try {
    const status = req.query.status as string | undefined;
    const releases = await storage.getReleases(status ? { status } : undefined);
    res.json(releases);
  } catch (error) {
    console.error("Get releases error:", error);
    res.status(500).json({ error: "Failed to get releases" });
  }
});

// Get latest published release
app.get('/api/releases/latest', async (req, res) => {
  try {
    const release = await storage.getLatestRelease();
    res.json(release || null);
  } catch (error) {
    console.error("Get latest release error:", error);
    res.status(500).json({ error: "Failed to get latest release" });
  }
});

// Get next version number
app.get('/api/releases/next-version', async (req, res) => {
  try {
    const nextNumber = await storage.getNextVersionNumber();
    res.json({ nextVersionNumber: nextNumber });
  } catch (error) {
    console.error("Get next version error:", error);
    res.status(500).json({ error: "Failed to get next version number" });
  }
});

// Get single release by ID
app.get('/api/releases/:id', async (req, res) => {
  try {
    const release = await storage.getRelease(req.params.id);
    if (!release) {
      return res.status(404).json({ error: "Release not found" });
    }
    res.json(release);
  } catch (error) {
    console.error("Get release error:", error);
    res.status(500).json({ error: "Failed to get release" });
  }
});

// Create new release
app.post('/api/releases', async (req, res) => {
  try {
    const { version, versionType, title, changelog, highlights, notes, createdBy } = req.body;
    
    // Check if version already exists
    const existing = await storage.getReleaseByVersion(version);
    if (existing) {
      return res.status(400).json({ error: "Version already exists" });
    }
    
    // Get next version number
    const versionNumber = await storage.getNextVersionNumber();
    
    const release = await storage.createRelease({
      version,
      versionType,
      versionNumber,
      title: title || null,
      changelog: changelog || [],
      highlights: highlights || null,
      notes: notes || null,
      status: 'draft',
      createdBy: createdBy || null,
    });
    
    res.status(201).json(release);
  } catch (error) {
    console.error("Create release error:", error);
    res.status(500).json({ error: "Failed to create release" });
  }
});

// Update release
app.patch('/api/releases/:id', async (req, res) => {
  try {
    const release = await storage.updateRelease(req.params.id, req.body);
    if (!release) {
      return res.status(404).json({ error: "Release not found" });
    }
    res.json(release);
  } catch (error) {
    console.error("Update release error:", error);
    res.status(500).json({ error: "Failed to update release" });
  }
});

// Publish a release
app.post('/api/releases/:id/publish', async (req, res) => {
  try {
    const release = await storage.publishRelease(req.params.id);
    if (!release) {
      return res.status(404).json({ error: "Release not found" });
    }
    res.json(release);
  } catch (error) {
    console.error("Publish release error:", error);
    res.status(500).json({ error: "Failed to publish release" });
  }
});

// Delete release (drafts only)
app.delete('/api/releases/:id', async (req, res) => {
  try {
    const release = await storage.getRelease(req.params.id);
    if (!release) {
      return res.status(404).json({ error: "Release not found" });
    }
    if (release.status === 'published') {
      return res.status(400).json({ error: "Cannot delete published releases" });
    }
    
    const deleted = await storage.deleteRelease(req.params.id);
    res.json({ success: deleted });
  } catch (error) {
    console.error("Delete release error:", error);
    res.status(500).json({ error: "Failed to delete release" });
  }
});
```

---

## 4. Frontend React Component

Create a releases management component or add to existing dev portal:

```tsx
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

interface Release {
  id: string;
  version: string;
  versionType: string;
  versionNumber: number;
  title: string | null;
  changelog: { category: string; changes: string[] }[];
  highlights: string[] | null;
  status: string;
  publishedAt: string | null;
  isBlockchainVerified: boolean;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export function ReleaseManager() {
  const queryClient = useQueryClient();
  const [showNewRelease, setShowNewRelease] = useState(false);
  const [newRelease, setNewRelease] = useState({
    version: "",
    versionType: "stable" as "beta" | "stable" | "hotfix" | "major",
    title: "",
    changelog: [{ category: "Features", changes: [""] }],
    highlights: [""],
    notes: "",
  });

  // Fetch releases
  const { data: releases = [] } = useQuery<Release[]>({
    queryKey: ['releases'],
    queryFn: async () => {
      const res = await fetch('/api/releases');
      if (!res.ok) throw new Error('Failed to fetch releases');
      return res.json();
    },
  });

  // Get latest release
  const { data: latestRelease } = useQuery<Release | null>({
    queryKey: ['latestRelease'],
    queryFn: async () => {
      const res = await fetch('/api/releases/latest');
      if (!res.ok) throw new Error('Failed to fetch latest release');
      return res.json();
    },
  });

  // Create release mutation
  const createReleaseMutation = useMutation({
    mutationFn: async (release: typeof newRelease) => {
      const res = await fetch('/api/releases', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(release),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to create release');
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['releases'] });
      queryClient.invalidateQueries({ queryKey: ['latestRelease'] });
      setShowNewRelease(false);
      setNewRelease({
        version: "",
        versionType: "stable",
        title: "",
        changelog: [{ category: "Features", changes: [""] }],
        highlights: [""],
        notes: "",
      });
    },
  });

  // Publish release mutation
  const publishReleaseMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/releases/${id}/publish`, { method: 'POST' });
      if (!res.ok) throw new Error('Failed to publish release');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['releases'] });
      queryClient.invalidateQueries({ queryKey: ['latestRelease'] });
    },
  });

  // Delete release mutation
  const deleteReleaseMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/releases/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete release');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['releases'] });
    },
  });

  return (
    <div>
      {/* Current Version Banner */}
      <div className="current-version">
        <h2>Current Version: {latestRelease?.version || "No releases yet"}</h2>
        {latestRelease?.publishedAt && (
          <p>Published {new Date(latestRelease.publishedAt).toLocaleString()}</p>
        )}
        <button onClick={() => setShowNewRelease(true)}>New Release</button>
      </div>

      {/* New Release Form */}
      {showNewRelease && (
        <form onSubmit={(e) => {
          e.preventDefault();
          createReleaseMutation.mutate(newRelease);
        }}>
          <input 
            placeholder="Version (e.g., v1.0)"
            value={newRelease.version}
            onChange={(e) => setNewRelease(prev => ({ ...prev, version: e.target.value }))}
          />
          <select 
            value={newRelease.versionType}
            onChange={(e) => setNewRelease(prev => ({ 
              ...prev, 
              versionType: e.target.value as typeof newRelease.versionType 
            }))}
          >
            <option value="beta">Beta</option>
            <option value="stable">Stable</option>
            <option value="hotfix">Hotfix</option>
            <option value="major">Major</option>
          </select>
          <input 
            placeholder="Title (optional)"
            value={newRelease.title}
            onChange={(e) => setNewRelease(prev => ({ ...prev, title: e.target.value }))}
          />
          <button type="submit" disabled={!newRelease.version}>Save Draft</button>
          <button type="button" onClick={() => setShowNewRelease(false)}>Cancel</button>
        </form>
      )}

      {/* Release History */}
      <div className="release-history">
        <h3>Release History</h3>
        {releases.map((release) => (
          <div key={release.id} className={`release ${release.status}`}>
            <h4>{release.version} {release.title && `— ${release.title}`}</h4>
            <span className="badge">{release.versionType}</span>
            <span className="badge">{release.status}</span>
            <p>
              {release.status === 'published' && release.publishedAt
                ? `Published ${new Date(release.publishedAt).toLocaleString()}`
                : `Created ${new Date(release.createdAt).toLocaleString()}`
              }
            </p>
            
            {/* Changelog */}
            {release.changelog?.map((cat, i) => (
              <div key={i}>
                <strong>{cat.category}</strong>
                <ul>
                  {cat.changes.map((change, j) => (
                    <li key={j}>{change}</li>
                  ))}
                </ul>
              </div>
            ))}

            {/* Actions for drafts */}
            {release.status === 'draft' && (
              <>
                <button onClick={() => publishReleaseMutation.mutate(release.id)}>
                  Publish
                </button>
                <button onClick={() => deleteReleaseMutation.mutate(release.id)}>
                  Delete
                </button>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
```

---

## 5. Version Naming Convention

| Type | Format | When to Use |
|------|--------|-------------|
| Beta | `beta.0`, `beta.1` | Pre-release testing |
| Stable | `v1.0`, `v1.1`, `v1.2` | Normal releases |
| Hotfix | `v1.0.1`, `v1.0.2` | Bug fixes |
| Major | `v2.0`, `v3.0` | Breaking changes / big features |

---

## 6. Changelog Categories

Recommended categories for the `changelog` JSON field:

- **Features** - New functionality
- **Improvements** - Enhancements to existing features
- **Fixes** - Bug fixes
- **Performance** - Speed/optimization improvements
- **Security** - Security patches
- **UI/UX** - Visual and experience changes
- **API** - Backend/API changes
- **Documentation** - Docs updates

---

## 7. Workflow

1. **Create Draft** - Add version, changelog, notes
2. **Review** - Check all changes are documented
3. **Publish** - Click publish to timestamp and make live
4. **Market** - Use the published date/version in marketing

---

## 8. Optional: Blockchain Verification

For tamper-proof release records, integrate with your blockchain verification system:

```typescript
// After publishing a release, optionally verify on blockchain
const verifyOnBlockchain = async (releaseId: string, release: Release) => {
  const dataHash = createHash('sha256')
    .update(JSON.stringify({
      version: release.version,
      changelog: release.changelog,
      publishedAt: release.publishedAt
    }))
    .digest('hex');
  
  // Submit to your blockchain verification service
  const verification = await storage.createBlockchainVerification({
    entityType: 'release',
    entityId: releaseId,
    dataHash,
    // ... other fields
  });
  
  // Update release with verification ID
  await storage.updateRelease(releaseId, {
    isBlockchainVerified: true,
    blockchainVerificationId: verification.id
  });
};
```

---

## Summary

This release version control system gives you:

1. **Structured versioning** - Consistent version numbers
2. **Timestamped history** - Exact publish dates/times
3. **Detailed changelogs** - Categorized changes per release
4. **Draft workflow** - Review before publishing
5. **Marketing ready** - Advertise update schedules
6. **Optional verification** - Blockchain-backed if needed

Perfect for professional app updates and scheduled marketing announcements!
