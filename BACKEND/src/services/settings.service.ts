/**
 * Settings Service
 * 
 * Manages system configuration and technical environment status.
 * All settings are backed by real database records and server environment.
 */

import { settingsRepository } from '../repositories/settings.repository';
import { dbAdapter } from '../db/adapter';
import { getSystemDataConfig } from '../config/database.config';

export class SettingsService {
  /**
   * Retrieves all real technical system settings and database engine status
   */
  public async getAllSettings(): Promise<Record<string, any>> {
    const dbSettings = await settingsRepository.getAllSettings();
    const dataConfig = await this.getDataConfiguration();

    return {
      ...dbSettings,
      dataConfiguration: dataConfig,
      databaseEngine: dbAdapter.getEngine(),
      databaseConnected: dbAdapter.isHealthy(),
      databaseConfig: dbAdapter.getConfig(),
    };
  }

  /**
   * Retrieves data configuration strictly adhering to environment capabilities
   */
  public async getDataConfiguration() {
    const envConfig = getSystemDataConfig();
    const dbSettings = await settingsRepository.getAllSettings();

    // The administrator can only enable runtime demo/dummy functionality if the corresponding .env capability is enabled.
    // If ENABLE_DEMO_DATA=false in .env, runtimeDemoData is forced to false.
    const runtimeDemo = envConfig.enableDemoData ? Boolean(dbSettings.runtime_demo_data) : false;
    const runtimeDummy = envConfig.enableDummyData ? Boolean(dbSettings.runtime_dummy_data) : false;

    return {
      currentDatabase: envConfig.currentDatabase,
      enableDemoData: envConfig.enableDemoData,
      enableDummyData: envConfig.enableDummyData,
      demoDataStatus: envConfig.enableDemoData ? (runtimeDemo ? 'Enabled' : 'Disabled') : 'Disabled',
      dummyDataStatus: envConfig.enableDummyData ? (runtimeDummy ? 'Enabled' : 'Disabled') : 'Disabled',
      runtimeDemoData: runtimeDemo,
      runtimeDummyData: runtimeDummy,
      canToggleDemo: envConfig.enableDemoData,
      canToggleDummy: envConfig.enableDummyData,
      demoDisabledReason: !envConfig.enableDemoData
        ? 'System configuration (.env ENABLE_DEMO_DATA=false) prevents enabling demo data'
        : null,
      dummyDisabledReason: !envConfig.enableDummyData
        ? 'System configuration (.env ENABLE_DUMMY_DATA=false) prevents enabling dummy data'
        : null,
    };
  }

  /**
   * Updates runtime demo / dummy setting ONLY if allowed by environment
   */
  public async updateDataConfiguration(updates: { runtimeDemoData?: boolean; runtimeDummyData?: boolean }) {
    const envConfig = getSystemDataConfig();

    if (updates.runtimeDemoData && !envConfig.enableDemoData) {
      throw new Error('System configuration prevents enabling demo data. ENABLE_DEMO_DATA is set to false in the environment.');
    }

    if (updates.runtimeDummyData && !envConfig.enableDummyData) {
      throw new Error('System configuration prevents enabling dummy data. ENABLE_DUMMY_DATA is set to false in the environment.');
    }

    if (updates.runtimeDemoData !== undefined) {
      await settingsRepository.setSetting('system', 'runtime_demo_data', updates.runtimeDemoData);
    }
    if (updates.runtimeDummyData !== undefined) {
      await settingsRepository.setSetting('system', 'runtime_dummy_data', updates.runtimeDummyData);
    }

    return this.getDataConfiguration();
  }
}

export const settingsService = new SettingsService();
