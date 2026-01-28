/**
 * Comprehensive caching system for CinemaFlix
 * Handles API responses, user data, and application state
 */

import { get, set, del, keys } from 'idb-keyval';

// Cache configuration
export const CACHE_CONFIG = {
  // Time-to-live in milliseconds
  API_CACHE_TTL: 24 * 60 * 60 * 1000, // 24 hours
  USER_DATA_TTL: 7 * 24 * 60 * 60 * 1000, // 7 days
  IMAGES_TTL: 30 * 24 * 60 * 60 * 1000, // 30 days
  PREFERENCES_TTL: 365 * 24 * 60 * 60 * 1000, // 1 year

  // Cache keys
  API_PREFIX: 'api:',
  USER_PREFIX: 'user:',
  IMAGE_PREFIX: 'image:',
  PREF_PREFIX: 'pref:',
  LIST_PREFIX: 'list:',
};

export interface CacheEntry<T = any> {
  data: T;
  timestamp: number;
  ttl: number;
  key: string;
}

/**
 * Generic cache class with TTL support
 */
export class CacheManager {
  private storage: typeof import('idb-keyval');

  constructor() {
    this.storage = { get, set, del, keys } as typeof import('idb-keyval');
  }

  /**
   * Get cached data if not expired
   */
  async get<T>(key: string): Promise<T | null> {
    try {
      const entry: CacheEntry<T> | undefined = await this.storage.get(key);

      if (!entry) return null;

      const now = Date.now();
      const isExpired = now - entry.timestamp > entry.ttl;

      if (isExpired) {
        await this.delete(key);
        return null;
      }

      return entry.data;
    } catch (error) {
      console.warn('Cache get error:', error);
      return null;
    }
  }

  /**
   * Set data in cache with TTL
   */
  async set<T>(key: string, data: T, ttl: number): Promise<void> {
    try {
      const entry: CacheEntry<T> = {
        data,
        timestamp: Date.now(),
        ttl,
        key,
      };

      await this.storage.set(key, entry);
    } catch (error) {
      console.warn('Cache set error:', error);
    }
  }

  /**
   * Delete cached data
   */
  async delete(key: string): Promise<void> {
    try {
      await this.storage.del(key);
    } catch (error) {
      console.warn('Cache delete error:', error);
    }
  }

  /**
   * Clear all cached data with specific prefix
   */
  async clear(prefix?: string): Promise<void> {
    try {
      const allKeys = await this.storage.keys();
      const keysToDelete = prefix
        ? allKeys.filter(key => typeof key === 'string' && key.startsWith(prefix))
        : allKeys;

      await Promise.all(keysToDelete.map(key => this.storage.del(key)));
    } catch (error) {
      console.warn('Cache clear error:', error);
    }
  }

  /**
   * Get cache statistics
   */
  async getStats(): Promise<{ total: number; expired: number; size: string }> {
    try {
      const allKeys = await this.storage.keys();
      let expired = 0;
      let totalSize = 0;

      for (const key of allKeys) {
        try {
          const entry = await this.storage.get(key);
          if (entry && Date.now() - entry.timestamp > entry.ttl) {
            expired++;
          }
          // Estimate size (rough approximation)
          totalSize += JSON.stringify(entry).length;
        } catch (e) {
          // Skip problematic entries
        }
      }

      return {
        total: allKeys.length,
        expired,
        size: `${(totalSize / 1024 / 1024).toFixed(2)} MB`,
      };
    } catch (error) {
      console.warn('Cache stats error:', error);
      return { total: 0, expired: 0, size: '0 MB' };
    }
  }
}

// Create singleton instance
export const cacheManager = new CacheManager();

/**
 * API Response Cache
 */
export class APICache {
  private cache = cacheManager;

  async get<T>(endpoint: string, params?: Record<string, any>): Promise<T | null> {
    const key = this.generateKey(endpoint, params);
    return this.cache.get<T>(key);
  }

  async set<T>(endpoint: string, data: T, params?: Record<string, any>): Promise<void> {
    const key = this.generateKey(endpoint, params);
    await this.cache.set(key, data, CACHE_CONFIG.API_CACHE_TTL);
  }

  private generateKey(endpoint: string, params?: Record<string, any>): string {
    const paramString = params ? `?${new URLSearchParams(params).toString()}` : '';
    return `${CACHE_CONFIG.API_PREFIX}${endpoint}${paramString}`;
  }

  async clear(): Promise<void> {
    await this.cache.clear(CACHE_CONFIG.API_PREFIX);
  }
}

export const apiCache = new APICache();

/**
 * User Data Persistence
 */
export class UserDataCache {
  private cache = cacheManager;

  async getUserData<T>(userId: string, key: string): Promise<T | null> {
    const cacheKey = `${CACHE_CONFIG.USER_PREFIX}${userId}:${key}`;
    return this.cache.get<T>(cacheKey);
  }

  async setUserData<T>(userId: string, key: string, data: T): Promise<void> {
    const cacheKey = `${CACHE_CONFIG.USER_PREFIX}${userId}:${key}`;
    await this.cache.set(cacheKey, data, CACHE_CONFIG.USER_DATA_TTL);
  }

  async clearUserData(userId: string): Promise<void> {
    await this.cache.clear(`${CACHE_CONFIG.USER_PREFIX}${userId}`);
  }

  // Specific user data methods
  async getWatchHistory(userId: string) {
    return this.getUserData(userId, 'watchHistory');
  }

  async setWatchHistory(userId: string, history: any[]) {
    return this.setUserData(userId, 'watchHistory', history);
  }

  async getBookmarks(userId: string) {
    return this.getUserData(userId, 'bookmarks');
  }

  async setBookmarks(userId: string, bookmarks: any[]) {
    return this.setUserData(userId, 'bookmarks', bookmarks);
  }

  async getPreferences(userId: string) {
    return this.getUserData(userId, 'preferences');
  }

  async setPreferences(userId: string, preferences: any) {
    return this.setUserData(userId, 'preferences', preferences);
  }
}

export const userDataCache = new UserDataCache();

/**
 * Image Cache for offline support
 */
export class ImageCache {
  private cache = cacheManager;

  async get(imageUrl: string): Promise<string | null> {
    const key = `${CACHE_CONFIG.IMAGE_PREFIX}${btoa(imageUrl)}`;
    return this.cache.get<string>(key);
  }

  async set(imageUrl: string, base64Data: string): Promise<void> {
    const key = `${CACHE_CONFIG.IMAGE_PREFIX}${btoa(imageUrl)}`;
    await this.cache.set(key, base64Data, CACHE_CONFIG.IMAGES_TTL);
  }

  async preloadImage(imageUrl: string): Promise<void> {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const base64 = await this.blobToBase64(blob);
      await this.set(imageUrl, base64);
    } catch (error) {
      console.warn('Failed to preload image:', imageUrl, error);
    }
  }

  private blobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }

  async clear(): Promise<void> {
    await this.cache.clear(CACHE_CONFIG.IMAGE_PREFIX);
  }
}

export const imageCache = new ImageCache();

/**
 * Preferences Cache (persistent across sessions)
 */
export class PreferencesCache {
  private cache = cacheManager;

  async get<T>(key: string, defaultValue?: T): Promise<T | null> {
    const cacheKey = `${CACHE_CONFIG.PREF_PREFIX}${key}`;
    const value = await this.cache.get<T>(cacheKey);
    return value !== null ? value : defaultValue || null;
  }

  async set<T>(key: string, value: T): Promise<void> {
    const cacheKey = `${CACHE_CONFIG.PREF_PREFIX}${key}`;
    await this.cache.set(cacheKey, value, CACHE_CONFIG.PREFERENCES_TTL);
  }

  async getTheme(): Promise<'light' | 'dark' | 'system'> {
    const value = await this.get<'light' | 'dark' | 'system'>('theme', 'dark');
    return value || 'dark';
  }

  async setTheme(theme: 'light' | 'dark' | 'system'): Promise<void> {
    return this.set('theme', theme);
  }

  async getLanguage(): Promise<string> {
    const value = await this.get<string>('language', 'en');
    return value || 'en';
  }

  async setLanguage(language: string): Promise<void> {
    return this.set('language', language);
  }

  async getQuality(): Promise<'low' | 'medium' | 'high'> {
    const value = await this.get<'low' | 'medium' | 'high'>('quality', 'high');
    return value || 'high';
  }

  async setQuality(quality: 'low' | 'medium' | 'high'): Promise<void> {
    return this.set('quality', quality);
  }
}

export const preferencesCache = new PreferencesCache();

/**
 * List Data Cache for pagination support
 */
export class ListCache {
  private cache = cacheManager;

  async getList<T>(
    listKey: string,
    page: number,
    pageSize: number = 20
  ): Promise<{ items: T[]; totalPages: number; hasMore: boolean } | null> {
    const key = `${CACHE_CONFIG.LIST_PREFIX}${listKey}:page_${page}:size_${pageSize}`;
    return this.cache.get(key);
  }

  async setList<T>(
    listKey: string,
    page: number,
    items: T[],
    totalPages: number,
    hasMore: boolean,
    pageSize: number = 20
  ): Promise<void> {
    const key = `${CACHE_CONFIG.LIST_PREFIX}${listKey}:page_${page}:size_${pageSize}`;
    const data = { items, totalPages, hasMore };
    await this.cache.set(key, data, CACHE_CONFIG.API_CACHE_TTL);
  }

  async getAllCachedPages(listKey: string): Promise<number[]> {
    const allKeys = await this.cache['storage'].keys();
    const pageNumbers: number[] = [];

    for (const key of allKeys) {
      if (typeof key === 'string' && key.startsWith(`${CACHE_CONFIG.LIST_PREFIX}${listKey}:page_`)) {
        const pageMatch = key.match(/page_(\d+):/);
        if (pageMatch) {
          pageNumbers.push(parseInt(pageMatch[1]));
        }
      }
    }

    return pageNumbers.sort((a, b) => a - b);
  }

  async clearList(listKey: string): Promise<void> {
    await this.cache.clear(`${CACHE_CONFIG.LIST_PREFIX}${listKey}`);
  }
}

export const listCache = new ListCache();

/**
 * Cache utilities
 */
export const cacheUtils = {
  /**
   * Get cache statistics
   */
  async getStats() {
    return cacheManager.getStats();
  },

  /**
   * Clear all caches
   */
  async clearAll() {
    await cacheManager.clear();
  },

  /**
   * Clear expired entries
   */
  async cleanup() {
    const allKeys = await cacheManager['storage'].keys();

    for (const key of allKeys) {
      try {
        const entry = await cacheManager['storage'].get(key);
        if (entry && Date.now() - entry.timestamp > entry.ttl) {
          await cacheManager['storage'].del(key);
        }
      } catch (error) {
        // Skip problematic entries
      }
    }
  },

  /**
   * Initialize cache cleanup on app start
   */
  init() {
    // Run cleanup every hour
    if (typeof window !== 'undefined') {
      setInterval(() => {
        cacheUtils.cleanup();
      }, 60 * 60 * 1000);

      // Run cleanup on page load
      cacheUtils.cleanup();
    }
  },
};

export default cacheManager;