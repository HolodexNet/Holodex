import { decodeLayout, encodeRect } from "./codec.ts"
import { directorRects } from "./director.ts"
import type { DecodedLayout, NamedLayout } from "./types.ts"

export interface PresetDefinition {
  layout: string
  name: string
  /** Video count this preset is the auto-layout choice for. */
  default?: number
  portrait?: boolean
}

/** A director layout as a preset string, for this many videos and chats. */
function encodeDirector(videos: number, chats = 0): string | null {
  const rects = directorRects(videos - 1, chats)
  return (
    rects &&
    [
      encodeRect(rects.center),
      ...rects.row.map(encodeRect),
      ...rects.chats.map((rect, index) => `${encodeRect(rect)}chat${index}`),
    ].join(",")
  )
}

const directorDefinition = (videos: number, chats = 0): PresetDefinition => ({
  layout: encodeDirector(videos, chats)!,
  name: `Director ${videos}${chats ? " 💬" : ""}`,
})

const DESKTOP_DEFINITIONS: readonly PresetDefinition[] = [
  { layout: "AAYY", name: "1🎞️" },
  { layout: "AAUY,UAEYchat0", name: "Side Chat 1", default: 1 },
  { layout: "AAMY,MAMY", name: "2🎞️", default: 2 },
  { layout: "AARM,AMRM,RAHYchat", name: "Side Chat 2" },
  { layout: "AAOM,AMOM,OAFYchat,TAFYchat", name: "2🎞️, 2💬" },
  { layout: "AAMY,MAMM,MMMM", name: "1🎞️+2", default: 3 },
  { layout: "AAMM,AMMM,MAMM,MMGMchat,SMGMchat", name: "3🎞️, 2💬" },
  { layout: "AAMM,AMMM,MAMM,MMMM", name: "2x2🎞️" },
  {
    layout: "AAKM,KAKM,UAEMchat0,AMKM,KMKM,UMEMchat0",
    name: "2x2🎞️ 2💬",
    default: 4,
  },
  {
    layout: "PAJM,AAJM,AMJM,PMJM,JADMchat0,JMDMchat0,MADMchat0,MMDMchat0",
    name: "2x2🎞️ 4💬",
  },
  { layout: "SAGYchat,AAJM,AMJM,JAJM,JMJM", name: "2x2🎞️ 1💬" },
  { layout: "AAMP,APIJ,IPIJ,MAMP,QPIJ", name: "5🎞️", default: 5 },
  {
    layout: "AAIM,AMIM,IAIM,QMIM,QAIM,MMEMchat0,IMEMchat0",
    name: "5🎞️ 2💬",
    default: 5,
  },
  { layout: "AAIM,AMIM,IAIM,IMIM,QAIM,QMIM", name: "2x3🎞️", default: 6 },
  { layout: "AAQQ,AQII,IQII,QAII,QIII,QQII", name: "p1s5" },
  { layout: "AAJM,AMJM,JAJM,JMJM,SAGI,SIGI,SQGI", name: "7🎞️", default: 7 },
  {
    layout: "AAKM,AMKM,RAHI,KAHI,RQHI,KQHI,KIHI,RIHI",
    name: "8🎞️",
    default: 8,
  },
  {
    layout: "AAII,AIII,AQII,IAII,IIII,IQII,QAII,QIII,QQII",
    name: "3 x 3🎞️",
    default: 9,
  },
  {
    layout: "AAGI,GAGI,MAGI,AIGI,GIGI,MIGI,AQGI,GQGI,MQGI,SAGYchat",
    name: "3x3🎞️ 1💬",
  },
  {
    layout:
      "AAHI,AQHI,AIHI,HAHI,HIHI,HQHI,OAHI,OIHI,OQHI,VIDIchat0,VADIchat0,VQDIchat0",
    name: "3x3🎞️ 3💬",
  },
  {
    layout: "AAML,MAML,ALGH,GLGH,MLGH,SLGH,ASGG,GSGG,MSGG,SSGG",
    name: "Among Us 1",
    default: 10,
  },
  {
    layout: "AAKL,KAKL,UAEYchat,ALFH,FLFH,KLFH,PLFH,ASFG,FSFG,KSFG,PSFG",
    name: "Among Us 2",
  },
  { layout: "AASR,SAGYchat,ARGH,GRGH,MRGH", name: "Sports Fes 1" },
  {
    layout: "AAMM,SAGYchat,AMGG,ASGG,GMGG,GSGG,MAGG,MGGG,MMGG,MSGG",
    name: "Sports Fes 2",
  },
  {
    layout: "GAMM,GMMM,AAGG,AGGG,AMGG,ASGG,SAGG,SGGG,SMGG,SSGG",
    name: "Sports Fes 3",
  },
  {
    layout: "AAIK,IAIK,QAIK,AKGH,GKGH,MKGH,SKGH,SRGH,ARGH,MRGH,GRGH",
    name: "Among Us 3",
    default: 11,
  },
  {
    layout: "AAGI,GAGI,MAGI,AIGI,GIGI,MIGI,SIGI,SQGI,AQGI,MQGI,GQGI,SAGI",
    name: "4x3",
    default: 12,
  },
  {
    layout: "AAMM,MMGG,AMGG,GMGG,MGGG,SSGG,MSGG,MAGG,SMGG,SGGG,SAGG,ASGG,GSGG",
    name: "13🎞️",
    default: 13,
  },
  {
    layout:
      "AMJM,OMFG,OGFG,TGFG,JMFG,AAJM,OAFG,TMFG,JAFG,TSFG,OSFG,JGFG,TAFG,JSFG",
    name: "14🎞️",
    default: 14,
  },
  {
    layout:
      "AGGG,MMGG,MGGG,SGGG,GMGG,AAGG,MAGG,SMGG,GAGG,SSGG,MSGG,GGGG,SAGG,GSGG,AMGG,ASGG",
    name: "4x4",
    default: 16,
  },
  { layout: "AAHY,HAHY,OAFYchat,TAFYchat", name: "2📱 2💬" },
  { layout: "AAGY,GAGY,MAGY,SAGYchat", name: "3📱 1💬" },
  { layout: "AAMM,AMMM,MAHY,TAFYchat2", name: "2🎞️ 1📱 1💬" },
  ...[2, 3, 4, 5, 6, 7, 8, 9].map((videos) => directorDefinition(videos)),
  ...[2, 3, 4, 5, 6].map((videos) => directorDefinition(videos, 1)),
]

const MOBILE_DEFINITIONS: readonly PresetDefinition[] = [
  { layout: "AAYI,AIYQchat0", name: "Mobile 1", portrait: true },
  { layout: "AOYKchat,AAYH,AHYH", name: "Mobile 2", portrait: true },
  { layout: "AAYI,AIYI,AQYI", name: "Mobile 3", portrait: true },
  { layout: "MAMY,AAMM,AMMM", name: "Mobile 3L" },
  { layout: "AAMM,AMMM,MAMM,MMMM", name: "Mobile 4" },
]

const toNamed = ({ layout, name, portrait }: PresetDefinition): NamedLayout => {
  const decoded = decodeLayout(layout)
  // The tables above are fixed, so this can only fail during development.
  if (!decoded) throw new Error(`Invalid multiview preset: ${layout}`)
  return { ...decoded, name, portrait }
}

export const DESKTOP_PRESETS: readonly NamedLayout[] =
  DESKTOP_DEFINITIONS.map(toNamed)
export const MOBILE_PRESETS: readonly NamedLayout[] =
  MOBILE_DEFINITIONS.map(toNamed)

/** Far more than fit in a row; `directorRects` says where to stop. */
const MOST_DIRECTOR_VIDEOS = 16

/**
 * What auto-layout grows and shrinks through in Director Mode, so that adding a
 * video does not throw away the big screen. Sized for the chats already there.
 */
export function directorAutoPresets(chats: number): DecodedLayout[] {
  return Array.from({ length: MOST_DIRECTOR_VIDEOS }, (_, index) =>
    encodeDirector(index + 1, chats)
  ).flatMap((encoded) => {
    const decoded = encoded ? decodeLayout(encoded) : null
    return decoded ? [decoded] : []
  })
}

export interface SavedPreset {
  name: string
  layout: string
}

/** Video count -> encoded layout auto-layout picks for it. Sparse by design. */
export type AutoLayoutTable = (string | null | undefined)[]

export function defaultAutoLayout(): AutoLayoutTable {
  const table: AutoLayoutTable = []
  for (const preset of DESKTOP_DEFINITIONS) {
    if (preset.default) table[preset.default] = preset.layout
  }
  return table
}

export function decodeSavedPresets(
  saved: readonly SavedPreset[]
): NamedLayout[] {
  return saved.flatMap(({ name, layout }) => {
    const decoded = decodeLayout(layout)
    return decoded ? [{ ...decoded, name }] : []
  })
}

export function decodeAutoLayout(table: AutoLayoutTable): DecodedLayout[] {
  return table.flatMap((encoded) => {
    const decoded = encoded ? decodeLayout(encoded) : null
    return decoded ? [decoded] : []
  })
}

export interface PresetGroup {
  videoCount: number
  presets: (NamedLayout & { custom: boolean })[]
}

/** Saved layouts and the built-ins grouped by size, saved ones winning a tie. */
export function groupPresets(
  custom: readonly NamedLayout[],
  builtin: readonly NamedLayout[] = DESKTOP_PRESETS
): PresetGroup[] {
  const customIds = new Set(custom.map((preset) => preset.id))
  const seen = new Set<string>()
  const groups = new Map<number, PresetGroup>()
  for (const preset of [...custom, ...builtin]) {
    if (seen.has(preset.id)) continue
    seen.add(preset.id)
    const group = groups.get(preset.videoCellCount) ?? {
      videoCount: preset.videoCellCount,
      presets: [],
    }
    group.presets.push({ ...preset, custom: customIds.has(preset.id) })
    groups.set(preset.videoCellCount, group)
  }
  return [...groups.values()].sort((a, b) => a.videoCount - b.videoCount)
}
