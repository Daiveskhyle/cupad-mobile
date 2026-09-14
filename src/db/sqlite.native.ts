import * as SQLite from 'expo-sqlite';

let db: SQLite.SQLiteDatabase | null = null;

export async function getDb(): Promise<SQLite.SQLiteDatabase> {
  if (db) return db;
  db = await SQLite.openDatabaseAsync('cupad_offline.db');
  await db.execAsync(`
    PRAGMA journal_mode = WAL;
    CREATE TABLE IF NOT EXISTS kv (key TEXT PRIMARY KEY NOT NULL, value TEXT NOT NULL, updated_at INTEGER NOT NULL);
    CREATE TABLE IF NOT EXISTS clients_cache (id TEXT PRIMARY KEY NOT NULL, name TEXT, phone TEXT, email TEXT, status TEXT, branch_id TEXT, officer_username TEXT, raw_json TEXT, updated_at INTEGER NOT NULL);
    CREATE TABLE IF NOT EXISTS activities_cache (id TEXT PRIMARY KEY NOT NULL, type TEXT, client_name TEXT, amount REAL, date TEXT, officer TEXT, raw_json TEXT, updated_at INTEGER NOT NULL);
    CREATE TABLE IF NOT EXISTS pending_ops (id INTEGER PRIMARY KEY AUTOINCREMENT, op_type TEXT NOT NULL, payload TEXT NOT NULL, created_at INTEGER NOT NULL, tries INTEGER DEFAULT 0, last_error TEXT);
  `);
  return db;
}

export async function kvSet(key: string, value: unknown): Promise<void> {
  const database = await getDb();
  await database.runAsync(`INSERT INTO kv (key, value, updated_at) VALUES (?, ?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at`, [key, JSON.stringify(value), Date.now()]);
}

export async function kvGet<T = any>(key: string): Promise<T | null> {
  const database = await getDb();
  const row = await database.getFirstAsync<{ value: string }>('SELECT value FROM kv WHERE key = ?', [key]);
  if (!row?.value) return null;
  try { return JSON.parse(row.value) as T; } catch { return null; }
}

export async function cacheClients(clients: any[]): Promise<void> {
  const database = await getDb();
  const now = Date.now();
  await database.withTransactionAsync(async () => {
    for (const c of clients) {
      await database.runAsync(`INSERT INTO clients_cache (id,name,phone,email,status,branch_id,officer_username,raw_json,updated_at) VALUES (?,?,?,?,?,?,?,?,?) ON CONFLICT(id) DO UPDATE SET name=excluded.name,phone=excluded.phone,email=excluded.email,status=excluded.status,branch_id=excluded.branch_id,officer_username=excluded.officer_username,raw_json=excluded.raw_json,updated_at=excluded.updated_at`, [String(c.id), c.name ?? null, c.phone ?? null, c.email ?? null, c.status ?? null, c.branch_id != null ? String(c.branch_id) : null, c.officer_username ?? null, JSON.stringify(c), now]);
    }
  });
}

export async function searchClientsLocal(q: string, limit = 30): Promise<any[]> {
  const database = await getDb();
  const like = `%${q}%`;
  const rows = await database.getAllAsync<{ raw_json: string }>('SELECT raw_json FROM clients_cache WHERE name LIKE ? OR phone LIKE ? OR id LIKE ? ORDER BY name LIMIT ?', [like, like, like, limit]);
  return rows.map(r => { try { return JSON.parse(r.raw_json); } catch { return null; } }).filter(Boolean);
}

export async function cacheActivities(items: any[]): Promise<void> {
  const database = await getDb();
  const now = Date.now();
  await database.withTransactionAsync(async () => {
    await database.runAsync('DELETE FROM activities_cache');
    for (let i = 0; i < items.length; i++) {
      const a = items[i];
      const id = String(a.transaction_id || a.id || `${a.type}-${a.date}-${i}`);
      await database.runAsync(`INSERT OR REPLACE INTO activities_cache (id,type,client_name,amount,date,officer,raw_json,updated_at) VALUES (?,?,?,?,?,?,?,?)`, [id, a.type ?? null, a.client_name ?? null, Number(a.amount ?? 0), a.date != null ? String(a.date) : null, a.officer ?? null, JSON.stringify(a), now]);
    }
  });
}

export async function getActivitiesLocal(limit = 40): Promise<any[]> {
  const database = await getDb();
  const rows = await database.getAllAsync<{ raw_json: string }>('SELECT raw_json FROM activities_cache ORDER BY date DESC LIMIT ?', [limit]);
  return rows.map(r => { try { return JSON.parse(r.raw_json); } catch { return null; } }).filter(Boolean);
}

export async function enqueueOp(opType: string, payload: object): Promise<void> {
  const database = await getDb();
  await database.runAsync('INSERT INTO pending_ops (op_type,payload,created_at) VALUES (?,?,?)', [opType, JSON.stringify(payload), Date.now()]);
}

export async function listPendingOps(): Promise<{ id: number; op_type: string; payload: string; tries: number }[]> {
  const database = await getDb();
  return database.getAllAsync('SELECT id,op_type,payload,tries FROM pending_ops ORDER BY id ASC LIMIT 50');
}

export async function removePendingOp(id: number): Promise<void> {
  const database = await getDb();
  await database.runAsync('DELETE FROM pending_ops WHERE id = ?', [id]);
}

export async function bumpPendingOp(id: number, error: string): Promise<void> {
  const database = await getDb();
  await database.runAsync('UPDATE pending_ops SET tries = tries + 1, last_error = ? WHERE id = ?', [error.slice(0, 500), id]);
}
