import { atom } from "jotai"
import { atomWithStorage } from "jotai/utils"

export function atomWithStorageBroadcast<Value>(key: string, initialValue: Value) {
  const baseAtom = atomWithStorage(key, initialValue)
  const listeners = new Set<(event: MessageEvent<any>) => void>()
  const channel = new BroadcastChannel(key)
  channel.onmessage = (event) => {
    listeners.forEach((l) => l(event))
  }

  const broadcastAtom = atom<Value, [{ isEvent: boolean; value: Value }], void>(
    (get) => get(baseAtom),
    (get, set, update) => {
      set(baseAtom, update.value)

      if (!update.isEvent) {
        channel.postMessage(get(baseAtom))
      }
    }
  )
  broadcastAtom.onMount = (setAtom) => {
    const listener = (event: MessageEvent<any>) => {
      setAtom({ isEvent: true, value: event.data })
    }
    listeners.add(listener)
    return () => {
      listeners.delete(listener)
    }
  }
  const returnedAtom = atom<Value, [Value], void>(
    (get) => get(broadcastAtom),
    (_, set, update) => {
      set(broadcastAtom, { isEvent: false, value: update })
    }
  )
  return returnedAtom
}