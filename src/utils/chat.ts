/* eslint-disable */

type CVPair = {
  channelId: string;
  videoId: string;
};
enum B64Type {
  B1 = "b1",
  B2 = "b2",
}

export function replayTimedContinuation(
  origin: CVPair,
  { top = false, seekMs = 0 }: { top?: boolean; seekMs?: number } = {}
): string {
  const chatType = top ? 4 : 1;
  return b64e(
    ld(156074452, [
      ld(3, hdt(origin)),
      vt(8, 1),
      ld(11, vt(2, seekMs)),
      ld(14, vt(1, chatType)),
      vt(15, 1),
    ]),
    B64Type.B1
  );
}

const _atob = globalThis.atob as ((data: string) => string) | undefined;
const _btoa = globalThis.btoa as ((data: string) => string) | undefined;
const b64tou8 = _atob
  ? (data: string) => Uint8Array.from(_atob(data), (c) => c.charCodeAt(0))
  : (data: string) => {
      // @ts-ignore
      const buf = Buffer.from(data, "base64");
      return new Uint8Array(buf.buffer, buf.byteOffset, buf.byteLength);
    };

const u8tob64 = _btoa
  ? (data: Uint8Array) => _btoa(String.fromCharCode.apply(null, data as any))
  : // @ts-ignore
    (data: Uint8Array) => Buffer.from(data).toString("base64");
function urlsafeB64e(payload: Uint8Array): string {
  return encodeURIComponent(u8tob64(payload));
}

function urlsafeB64d(payload: string): Uint8Array {
  return b64tou8(decodeURIComponent(payload));
}
function b64e(payload: Uint8Array, type: B64Type): string {
  switch (type) {
    case B64Type.B1:
      return urlsafeB64e(payload);
    case B64Type.B2:
      const urlsafe = urlsafeB64e(payload);
      const encoded = new TextEncoder().encode(urlsafe);
      return u8tob64(encoded);
    // return u8tob64(new TextEncoder().encode(urlsafeB64e(payload)));
    default:
      throw new Error(`Invalid b64type: ${type}`);
  }
}

function ld(
  fid: bigint | number,
  payload: Uint8Array[] | Uint8Array | string
): Uint8Array {
  const b =
    typeof payload === "string"
      ? new TextEncoder().encode(payload)
      : Array.isArray(payload)
      ? cc(payload)
      : payload;
  const bLen = b.byteLength;
  return cc([bitou8(pbh(fid, 2)), bitou8(encv(BigInt(bLen))), b]);
}

function vt(fid: bigint | number, payload: bigint | number): Uint8Array {
  return cc([bitou8(pbh(fid, 0)), bitou8(payload)]);
}

function pbh(fid: bigint | number, type: number): bigint {
  return encv((BigInt(fid) << BigInt(3)) | BigInt(type));
}

function bitou8(n: bigint | number): Uint8Array {
  let hv = n.toString(16);
  hv = "".padStart(hv.length % 2, "0") + hv;
  return hextou8(hv);
}

function hextou8(data: string): Uint8Array {
  data =
    data.startsWith("0x") || data.startsWith("0X") ? data.substring(2) : data;
  const out = new Uint8Array(data.length / 2);
  for (let i = 0; i < out.length; ++i) {
    out[i] = parseInt(data.substr(i * 2, 2), 16);
  }
  return out;
}

const cc = concatu8;

function concatu8(args: Uint8Array[]): Uint8Array {
  let totalLength = 0;
  for (let i = 0; i < args.length; ++i) {
    totalLength += args[i].length;
  }
  const out = new Uint8Array(totalLength);
  let offset = 0;
  for (let i = 0; i < args.length; ++i) {
    out.set(args[i], offset);
    offset += args[i].length;
  }
  return out;
}
function encv(n: bigint): bigint {
  let s = BigInt(0);
  while (n >> BigInt(7)) {
    s = (s << BigInt(8)) | BigInt(0x80) | (n & BigInt(0x7f));
    n >>= BigInt(7);
  }
  s = (s << BigInt(8)) | n;
  return s;
}

function hdt(tgt: CVPair): string {
  return u8tob64(
    cc([ld(1, cvToken(tgt)), ld(3, ld(48687757, ld(1, tgt.videoId))), vt(4, 1)])
  );
}

function cvToken(p: CVPair) {
  return ld(5, [ld(1, p.channelId), ld(2, p.videoId)]);
}
