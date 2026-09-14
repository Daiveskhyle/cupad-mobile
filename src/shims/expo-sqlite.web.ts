// Web-only shim for expo-sqlite.
// Expo SQLite is native-only in this project; web uses src/db/sqlite.web.ts.
export async function openDatabaseAsync() {
  return {
    async execAsync() {},
    async runAsync() { return { changes: 0, lastInsertRowId: 0 }; },
    async getFirstAsync() { return null; },
    async getAllAsync() { return []; },
    async withTransactionAsync(callback: () => Promise<void>) { await callback(); },
  } as any;
}
