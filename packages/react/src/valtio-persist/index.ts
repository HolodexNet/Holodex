import { proxy, subscribe } from 'valtio'

const pick = <T extends {}, K extends keyof T>(obj: T, ...keys: K[]) => (
  Object.fromEntries(
    keys
      .filter(key => key in obj)
      .map(key => [key, obj[key]])
  ) as Pick<T, K>
);

/**
 * Creates a proxy object with persistence, allowing you to store and retrieve data from local storage.
 */
export function proxyWithPersist<T extends object>(key: string, initialObject: T, persistFields: (keyof T)[]): T {
  if (typeof window === "undefined") return proxy(initialObject);
  const storageItem = localStorage.getItem(key);

  const state = proxy<T>({
    initialObject,
    // ...(storageItem !== null ? JSON.parse(storageItem) : {})
  } as T);

  state

  subscribe(state, () => {
    const subobject = pick(initialObject, ...persistFields)
    localStorage.setItem(key, JSON.stringify(subobject))
  });

  return state;
}