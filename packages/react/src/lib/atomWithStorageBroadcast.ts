import { atom } from "jotai"
import { atomWithStorage } from "jotai/utils"

export function atomWithStorageBroadcast<Value>(key: string, initialValue: Value) {
  const baseAtom = atomWithStorage(key, initialValue)
  const listeners = new Set<(event: MessageEvent<Value>) => void>()
  if (!window.BroadcastChannel) {
    return baseAtom;
  }
  const channel = new BroadcastChannel("hd_" + key)
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
    const listener = (event: MessageEvent<Value>) => {
      setAtom({ isEvent: true, value: event.data })
    }
    listeners.add(listener)
    return () => {
      listeners.delete(listener)
    }
  }
  const returnedAtom = atom(
    (get) => get(broadcastAtom),
    (_, set, update: Value) => {
      set(broadcastAtom, { isEvent: false, value: update })
    }
  )
  return returnedAtom
}