# Release Version Control System - Agent Implementation Instructions

Copy this entire block and give it to any AI agent to implement a complete release version tracking system.

---

## TASK: Implement Release Version Control System

Build a release version tracking system that:
- Tracks app versions (beta.0 → v1.0 → v1.1 → v2.0)
- Stores timestamped changelogs with categories
- Shows current version in site footer
- Provides admin UI to create/publish releases

---

## STEP 1: DATABASE SCHEMA

Add this table to your Drizzle schema (shared/schema.ts or equivalent):

```typescript
import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, timestamp, boolean, jsonb, index } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const releases = pgTable("releases", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  version: text("version").notNull().unique(),
  versionType: text("version_type").notNull(),
  versionNumber: integer("version_number").notNull(),
  title: text("title"),
  changelog: jsonb("changelog").notNull(),
  highlights: text("highlights").array(),
  status: text("status").default("draft"),
  publishedAt: timestamp("published_at"),
  isBlockchainVerified: boolean("is_blockchain_verified").default(false),
  blockchainVerificationId: varchar("blockchain_verification_id"),
  createdBy: varchar("created_by"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("IDX_releases_version").on(table.version),
  index("IDX_releases_status").on(table.status),
  index("IDX_releases_published").on(table.publishedAt),
]);

export const insertReleaseSchema = createInsertSchema(releases).omit({ 
  id: true, createdAt: true, updatedAt: true, publishedAt: true,
  isBlockchainVerified: true, blockchainVerificationId: true,
});
export type InsertRelease = z.infer<typeof insertReleaseSchema>;
export type Release = typeof releases.$inferSelect;
```

Run: `npm run db:push` to create the table.

---

## STEP 2: STORAGE INTERFACE

Add to your storage interface (server/storage.ts):

```typescript
import { releases } from "@shared/schema";
import type { Release, InsertRelease } from "@shared/schema";
import { eq, desc, sql } from "drizzle-orm";

// Add to IStorage interface:
getReleases(filters?: { status?: string }): Promise<Release[]>;
getRelease(id: string): Promise<Release | undefined>;
getReleaseByVersion(version: string): Promise<Release | undefined>;
getLatestRelease(): Promise<Release | undefined>;
getNextVersionNumber(): Promise<number>;
createRelease(release: InsertRelease): Promise<Release>;
updateRelease(id: string, updates: Partial<Release>): Promise<Release | undefined>;
publishRelease(id: string): Promise<Release | undefined>;
deleteRelease(id: string): Promise<boolean>;

// Add implementations:
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
    .set({ status: 'published', publishedAt: new Date(), updatedAt: new Date() })
    .where(eq(releases.id, id))
    .returning();
  return release;
}

async deleteRelease(id: string): Promise<boolean> {
  const result = await db.delete(releases).where(eq(releases.id, id));
  return result.rowCount ? result.rowCount > 0 : false;
}
```

---

## STEP 3: API ROUTES

Add to your Express routes (server/routes.ts):

```typescript
// GET all releases
app.get('/api/releases', async (req, res) => {
  try {
    const status = req.query.status as string | undefined;
    const releases = await storage.getReleases(status ? { status } : undefined);
    res.json(releases);
  } catch (error) {
    res.status(500).json({ error: "Failed to get releases" });
  }
});

// GET latest published release
app.get('/api/releases/latest', async (req, res) => {
  try {
    const release = await storage.getLatestRelease();
    res.json(release || null);
  } catch (error) {
    res.status(500).json({ error: "Failed to get latest release" });
  }
});

// GET next version number
app.get('/api/releases/next-version', async (req, res) => {
  try {
    const nextNumber = await storage.getNextVersionNumber();
    res.json({ nextVersionNumber: nextNumber });
  } catch (error) {
    res.status(500).json({ error: "Failed to get next version number" });
  }
});

// GET single release
app.get('/api/releases/:id', async (req, res) => {
  try {
    const release = await storage.getRelease(req.params.id);
    if (!release) return res.status(404).json({ error: "Release not found" });
    res.json(release);
  } catch (error) {
    res.status(500).json({ error: "Failed to get release" });
  }
});

// POST create release
app.post('/api/releases', async (req, res) => {
  try {
    const { version, versionType, title, changelog, highlights, notes, createdBy } = req.body;
    const existing = await storage.getReleaseByVersion(version);
    if (existing) return res.status(400).json({ error: "Version already exists" });
    const versionNumber = await storage.getNextVersionNumber();
    const release = await storage.createRelease({
      version, versionType, versionNumber,
      title: title || null,
      changelog: changelog || [],
      highlights: highlights || null,
      notes: notes || null,
      status: 'draft',
      createdBy: createdBy || null,
    });
    res.status(201).json(release);
  } catch (error) {
    res.status(500).json({ error: "Failed to create release" });
  }
});

// PATCH update release
app.patch('/api/releases/:id', async (req, res) => {
  try {
    const release = await storage.updateRelease(req.params.id, req.body);
    if (!release) return res.status(404).json({ error: "Release not found" });
    res.json(release);
  } catch (error) {
    res.status(500).json({ error: "Failed to update release" });
  }
});

// POST publish release
app.post('/api/releases/:id/publish', async (req, res) => {
  try {
    const release = await storage.publishRelease(req.params.id);
    if (!release) return res.status(404).json({ error: "Release not found" });
    res.json(release);
  } catch (error) {
    res.status(500).json({ error: "Failed to publish release" });
  }
});

// DELETE release (drafts only)
app.delete('/api/releases/:id', async (req, res) => {
  try {
    const release = await storage.getRelease(req.params.id);
    if (!release) return res.status(404).json({ error: "Release not found" });
    if (release.status === 'published') return res.status(400).json({ error: "Cannot delete published releases" });
    const deleted = await storage.deleteRelease(req.params.id);
    res.json({ success: deleted });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete release" });
  }
});
```

---

## STEP 4: FOOTER VERSION BADGE

Add to your site footer component:

```tsx
import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";

// Inside component:
const { data: latestRelease } = useQuery<{ version: string } | null>({
  queryKey: ['latestRelease'],
  queryFn: async () => {
    const res = await fetch('/api/releases/latest');
    if (!res.ok) return null;
    return res.json();
  },
  staleTime: 1000 * 60 * 5,
});

// In JSX:
{latestRelease?.version && (
  <Badge variant="outline" className="text-xs font-mono">
    {latestRelease.version}
  </Badge>
)}
```

---

## STEP 5: ADMIN UI (Optional - Add to Dev Portal or Admin Page)

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
  status: string;
  publishedAt: string | null;
  createdAt: string;
}

export function ReleaseManager() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    version: "",
    versionType: "stable",
    title: "",
    changelog: [{ category: "Features", changes: [""] }],
  });

  const { data: releases = [] } = useQuery<Release[]>({
    queryKey: ['releases'],
    queryFn: async () => (await fetch('/api/releases')).json(),
  });

  const { data: latest } = useQuery<Release | null>({
    queryKey: ['latestRelease'],
    queryFn: async () => (await fetch('/api/releases/latest')).json(),
  });

  const createMutation = useMutation({
    mutationFn: async (data: typeof form) => {
      const res = await fetch('/api/releases', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error((await res.json()).error);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['releases'] });
      setShowForm(false);
      setForm({ version: "", versionType: "stable", title: "", changelog: [{ category: "Features", changes: [""] }] });
    },
  });

  const publishMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/releases/${id}/publish`, { method: 'POST' });
      if (!res.ok) throw new Error('Failed');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['releases'] });
      queryClient.invalidateQueries({ queryKey: ['latestRelease'] });
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2>Current: {latest?.version || "No releases"}</h2>
        <button onClick={() => setShowForm(true)}>New Release</button>
      </div>

      {showForm && (
        <form onSubmit={(e) => { e.preventDefault(); createMutation.mutate(form); }}>
          <input placeholder="Version (v1.0)" value={form.version} 
            onChange={(e) => setForm(p => ({ ...p, version: e.target.value }))} />
          <select value={form.versionType} 
            onChange={(e) => setForm(p => ({ ...p, versionType: e.target.value }))}>
            <option value="beta">Beta</option>
            <option value="stable">Stable</option>
            <option value="hotfix">Hotfix</option>
            <option value="major">Major</option>
          </select>
          <button type="submit">Save Draft</button>
        </form>
      )}

      <div className="space-y-4">
        {releases.map((r) => (
          <div key={r.id} className="border p-4 rounded">
            <h3>{r.version} {r.title && `- ${r.title}`}</h3>
            <span>{r.versionType} | {r.status}</span>
            {r.status === 'draft' && (
              <button onClick={() => publishMutation.mutate(r.id)}>Publish</button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
```

---

## VERSION NAMING CONVENTION

| Type | Format | Use Case |
|------|--------|----------|
| Beta | beta.0, beta.1 | Pre-release testing |
| Stable | v1.0, v1.1 | Normal releases |
| Hotfix | v1.0.1 | Bug fixes |
| Major | v2.0, v3.0 | Breaking changes |

---

## CHANGELOG CATEGORIES

- Features - New functionality
- Improvements - Enhancements
- Fixes - Bug fixes
- Performance - Speed improvements
- Security - Security patches
- UI/UX - Visual changes

---

## WORKFLOW

1. Create draft release with version and changelog
2. Review and edit as needed
3. Click Publish to timestamp and make live
4. Version appears in site footer automatically

---

## COMPLETE - Test by:
1. Go to your admin/dev portal
2. Create a new release (e.g., "v1.0")
3. Add some changelog items
4. Click Publish
5. Check footer - version badge should appear
