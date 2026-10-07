/**
 * System Settings Repository
 * 
 * Interacts with system_settings table via dbAdapter
 */

import { dbAdapter } from '../db/adapter';

export class SettingsRepository {
  /**
   * Retrieves all technical settings from the database
   */
  public async getAllSettings(): Promise<Record<string, any>> {
    try {
      const sql = `SELECT "key", value FROM system_settings;`;
      const res = await dbAdapter.query(sql);
      const settings: Record<string, any> = {};
      for (const row of res.rows) {
        let val = row.value;
        if (typeof val === 'string') {
          try { val = JSON.parse(val); } catch { /* keep string */ }
        }
        settings[row.key] = val;
      }
      return settings;
    } catch {
      return {};
    }
  }

  /**
   * Updates or inserts a technical setting
   */
  public async setSetting(category: string, key: string, value: any): Promise<boolean> {
    const isMysql = dbAdapter.getEngine() === 'mysql';
    const jsonVal = typeof value === 'string' ? value : JSON.stringify(value);
    const id = `setting-${category}-${key}`;

    const upsertSql = isMysql
      ? `INSERT INTO system_settings (id, category, \`key\`, value, updated_at) 
         VALUES (?, ?, ?, ?, NOW())
         ON DUPLICATE KEY UPDATE value = ?, updated_at = NOW();`
      : `INSERT INTO "system_settings" ("id", "category", "key", "value", "updated_at")
         VALUES ($1, $2, $3, $4, NOW())
         ON CONFLICT ("id") DO UPDATE SET "value" = $5, "updated_at" = NOW();`;

    await dbAdapter.query(upsertSql, isMysql ? [id, category, key, jsonVal, jsonVal] : [id, category, key, jsonVal, jsonVal]);
    return true;
  }
}

export const settingsRepository = new SettingsRepository();
