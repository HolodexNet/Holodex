import { yaml } from "@x18n/builtins/formats/yaml"
import {
  applyTextEdits,
  definePlugin,
  diffText,
  errors,
  isMessageLeaf,
  pathId,
  type MessageTree,
  type NodeRange,
} from "@x18n/core"
import { isMap, isScalar, isSeq, parseDocument, stringify } from "yaml"

const base = yaml().formats![0]

/** x18n 0.1.x skips sequences and rejects a document containing only `---`. */
export default definePlugin({
  name: "holodex-yaml",
  formats: [
    {
      ...base,
      id: "holodex-yaml",
      extensions: [],
      parse(text, ctx) {
        const doc = parseDocument(text, { uniqueKeys: false })
        if (doc.errors.length) {
          throw errors.X18N2002({
            path: ctx.path,
            reason: doc.errors[0].message,
          })
        }
        const ranges = new Map<string, NodeRange>()
        function read(node: unknown, path: string[]): MessageTree[string] {
          if (isScalar(node)) {
            if (isMessageLeaf(node.value)) return node.value
            throw errors.X18N2003({ path: ctx.path })
          }
          if (!isMap(node) && !isSeq(node)) return null
          const tree: Record<string, MessageTree[string]> = {}
          const entries = isMap(node)
            ? node.items.map((pair) => [pair.key, pair.value] as const)
            : node.items.map((value, index) => [index, value] as const)
          for (const [key, value] of entries) {
            const segment = String(isScalar(key) ? key.value : key)
            const childPath = [...path, segment]
            const keyRange = isScalar(key) ? key.range : undefined
            const valueRange =
              isScalar(value) || isMap(value) || isSeq(value)
                ? value.range
                : undefined
            const range = keyRange ?? valueRange
            if (range) {
              ranges.set(pathId(childPath), {
                key: { start: range[0], end: range[1] },
                value: {
                  start: valueRange?.[0] ?? range[0],
                  end: valueRange?.[1] ?? range[1],
                },
              })
            }
            tree[segment] = read(value, childPath)
          }
          return tree
        }
        if (
          doc.contents === null ||
          (isScalar(doc.contents) && doc.contents.value === null)
        ) {
          return { tree: {}, ranges }
        }
        if (!isMap(doc.contents)) throw errors.X18N2003({ path: ctx.path })
        return { tree: read(doc.contents, []) as MessageTree, ranges }
      },
      // The built-in editor uses YAML AST paths and preserves sequences when
      // editing individual items. Restore sequences when creating whole files.
      edit(text, ops, ctx) {
        const doc = parseDocument(text)
        if (isScalar(doc.contents) && doc.contents.value === null) {
          const empty = "{}\n"
          return diffText(
            text,
            applyTextEdits(empty, base.edit!(empty, ops, ctx))
          )
        }
        return base.edit!(text, ops, ctx)
      },
      serialize(tree) {
        function restore(value: MessageTree[string]): unknown {
          if (value === null || typeof value !== "object") return value
          const keys = Object.keys(value)
          if (
            keys.length &&
            keys.every((key, index) => key === String(index))
          ) {
            return keys.map((key) => restore(value[key]))
          }
          return Object.fromEntries(
            keys.map((key) => [key, restore(value[key])])
          )
        }
        return stringify(restore(tree), { lineWidth: 0 })
      },
    },
  ],
})
