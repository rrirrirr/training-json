// store/session-cache.ts
// Simple in-memory cache that persists only during the current browser session
// Used for caching plan data to avoid frequent database queries without using localStorage

import { TrainingPlanData } from "@/types/training-plan"

// Type for our cache entries
interface CacheEntry<T> {
  data: T
  timestamp: number // When the entry was cached
}

class SessionCache {
  private cache: Map<string, CacheEntry<any>> = new Map()
  private maxAge: number // Maximum age of cache entries in milliseconds
  
  constructor(maxAgeInMinutes: number = 30) {
    this.maxAge = maxAgeInMinutes * 60 * 1000
  }
  
  /**
   * Get an item from the cache
   * @param key Cache key
   * @returns The cached item or null if not found or expired
   */
  get<T>(key: string): T | null {
    const entry = this.cache.get(key)
    if (!entry) return null
    
    // Check if entry has expired
    if (Date.now() - entry.timestamp > this.maxAge) {
      this.cache.delete(key)
      return null
    }
    
    return entry.data as T
  }
  
  /**
   * Store an item in the cache
   * @param key Cache key
   * @param data Data to cache
   */
  set<T>(key: string, data: T): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    })
  }
  
  /**
   * Remove an item from the cache
   * @param key Cache key
   */
  remove(key: string): void {
    this.cache.delete(key)
  }
  
  /**
   * Check if the cache contains a key
   * @param key Cache key
   * @returns True if the key exists and has not expired
   */
  has(key: string): boolean {
    const entry = this.cache.get(key)
    if (!entry) return false
    
    // Check if entry has expired
    if (Date.now() - entry.timestamp > this.maxAge) {
      this.cache.delete(key)
      return false
    }
    
    return true
  }
  
  /**
   * Clear all items from the cache
   */
  clear(): void {
    this.cache.clear()
  }
}

// Create a plans cache instance with 30 minute expiry
export const plansCache = new SessionCache(30)

// Helper functions specific to the plan store
export const getPlanFromCache = (planId: string): TrainingPlanData | null => {
  return plansCache.get<TrainingPlanData>(`plan_${planId}`)
}

export const cachePlan = (planId: string, plan: TrainingPlanData): void => {
  plansCache.set(`plan_${planId}`, plan)
}

export const removePlanFromCache = (planId: string): void => {
  plansCache.remove(`plan_${planId}`)
}

export const hasPlanInCache = (planId: string): boolean => {
  return plansCache.has(`plan_${planId}`)
}
