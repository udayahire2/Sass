import { useState, useEffect, useCallback } from "react";

export function usePersistentState<T>(
  key: string,
  defaultValue: T
): [T, (value: T | ((prev: T) => T)) => void, boolean] {
  const [state, setState] = useState<T>(() => {
    try {
      const saved = localStorage.getItem(key);
      if (saved !== null) {
        return JSON.parse(saved) as T;
      }
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error);
    }

    return defaultValue;
  });

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(state));
    } catch (error) {
      console.warn(`Error saving to localStorage key "${key}":`, error);
    }
  }, [key, state]);

  const setPersistentState = useCallback(
    (value: T | ((prev: T) => T)) => {
      setState((prev) => (value instanceof Function ? value(prev) : value));
    },
    []
  );

  return [state, setPersistentState, true];
}

export default usePersistentState;
