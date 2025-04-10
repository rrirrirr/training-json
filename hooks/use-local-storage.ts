"use client"

import { useState, useEffect } from "react"

export function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T) => void] {
  // State to store our value
  const [storedValue, setStoredValue] = useState<T>(initialValue)

  // Initialize on first load
  useEffect(() => {
    try {
      const item = window.localStorage.getItem(key)
      if (item) {
        setStoredValue(JSON.parse(item))
      }
    } catch (error) {
      console.log("Error reading localStorage:", error)
    }
  }, [key])

  // Return a wrapped version of useState's setter function that
  // persists the new value to localStorage
  const setValue = (value: T) => {
    try {
      // Save state and localStorage
      setStoredValue(value)
      window.localStorage.setItem(key, JSON.stringify(value))
    } catch (error) {
      console.log("Error setting localStorage:", error)
    }
  }

  return [storedValue, setValue]
}
