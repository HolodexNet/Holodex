/**
 * The continuation token YouTube expects to open a replay chat, as a hand-built
 * protobuf. Ported from the previous UI.
 */
type ChatOrigin = { channelId: string; videoId: string }

export function replayTimedContinuation(
  origin: ChatOrigin,
  { top = false, seekMs = 0 }: { top?: boolean; seekMs?: number } = {}
): string {
  const chatType = top ? 4 : 1
  return encodeURIComponent(
    toBase64(
      field(156074452, [
        field(3, header(origin)),
        varint(8, 1),
        field(11, varint(2, seekMs)),
        field(14, varint(1, chatType)),
        varint(15, 1),
      ])
    )
  )
}

function toBase64(payload: Uint8Array): string {
  return btoa(String.fromCharCode(...payload))
}

function concat(parts: Uint8Array[]): Uint8Array {
  const out = new Uint8Array(parts.reduce((sum, p) => sum + p.length, 0))
  let offset = 0
  for (const part of parts) {
    out.set(part, offset)
    offset += part.length
  }
  return out
}

/** Length-delimited field. */
function field(id: number, payload: Uint8Array[] | Uint8Array | string) {
  const body =
    typeof payload === "string"
      ? new TextEncoder().encode(payload)
      : Array.isArray(payload)
        ? concat(payload)
        : payload
  return concat([
    bytes(tag(id, 2)),
    bytes(encodeVarint(BigInt(body.byteLength))),
    body,
  ])
}

/** Varint field; the value is written as-is, matching the original encoder. */
function varint(id: number, value: number): Uint8Array {
  return concat([bytes(tag(id, 0)), bytes(value)])
}

function tag(id: number, type: number): bigint {
  return encodeVarint((BigInt(id) << 3n) | BigInt(type))
}

function encodeVarint(value: bigint): bigint {
  let n = value
  let out = 0n
  while (n >> 7n) {
    out = (out << 8n) | 0x80n | (n & 0x7fn)
    n >>= 7n
  }
  return (out << 8n) | n
}

function bytes(value: bigint | number): Uint8Array {
  let hex = value.toString(16)
  if (hex.length % 2) hex = `0${hex}`
  const out = new Uint8Array(hex.length / 2)
  for (let i = 0; i < out.length; i++) {
    out[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16)
  }
  return out
}

function header(origin: ChatOrigin): string {
  return toBase64(
    concat([
      field(
        1,
        field(5, [field(1, origin.channelId), field(2, origin.videoId)])
      ),
      field(3, field(48687757, field(1, origin.videoId))),
      varint(4, 1),
    ])
  )
}
