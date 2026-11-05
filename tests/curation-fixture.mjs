import { createServer } from "vite"

const user = {
  id: "fixture-user",
  username: "Fixture Editor",
  role: process.env.CURATION_FIXTURE_ROLE ?? "editor",
}
const jwt = `fixture.${Buffer.from(JSON.stringify({ exp: Math.floor(Date.now() / 1000) + 3600 })).toString("base64url")}.fixture`
const mentions = {}
const guest = { id: "UC_fixture_guest", name: "Fixture Guest", type: "vtuber" }
const videos = Array.from(
  {
    length: Math.min(
      15,
      Math.max(3, Number(process.env.CURATION_FIXTURE_VIDEOS) || 3)
    ),
  },
  (_, index) => String.fromCharCode(97 + index)
).map((id) => ({
  id: `fixture-${id}`,
  title: `Fixture stream ${id.toUpperCase()}`,
  type: "stream",
  status: "live",
  channel: {
    id: `UC_fixture_${id}`,
    name: `Fixture Host ${id.toUpperCase()}`,
    org: "Hololive",
    type: "vtuber",
  },
  start_actual: new Date(Date.now() - 60_000).toISOString(),
  available_at: new Date(Date.now() - 60_000).toISOString(),
  mentions: [],
}))
mentions[videos[0].id] = [guest]
const topics = ["gaming", "singing", "talk"]
const videoTopics = Object.fromEntries(
  videos.map((video, index) => [
    video.id,
    {
      topic_id: index === 1 ? "talk" : null,
      topic_approver_id: index === 1 ? "another-user" : null,
    },
  ])
)
const relationships = Object.fromEntries(
  videos.map((video) => [
    video.id,
    { sources: [], clips: [], simulcasts: [], refers: [] },
  ])
)
const ref = (id) => ({
  id,
  title: videos.find((video) => video.id === id)?.title,
})

const server = await createServer({
  server: {
    port: Number(process.env.CURATION_FIXTURE_PORT) || 8091,
    strictPort: true,
    host: "localhost",
  },
  plugins: [
    {
      name: "curation-fixtures",
      transformIndexHtml() {
        return [
          {
            tag: "script",
            injectTo: "head-prepend",
            children: `localStorage.setItem("holodex-v3/auth", ${JSON.stringify(JSON.stringify({ state: { user, jwt }, version: 1 }))});`,
          },
        ]
      },
      configureServer(vite) {
        vite.middlewares.use(async (request, response, next) => {
          const path = new URL(request.url, "http://localhost").pathname
          if (!path.startsWith("/api/") && !path.startsWith("/statics/"))
            return next()
          const chunks = []
          for await (const chunk of request) chunks.push(chunk)
          const text = Buffer.concat(chunks).toString()
          const body = text ? JSON.parse(text) : {}
          response.setHeader("Content-Type", "application/json")
          const send = (data) => response.end(JSON.stringify(data))
          if (path === "/api/v2/user/refresh") return send({ user, jwt })
          if (path === "/api/v2/users/favorites")
            return send(videos.map((video) => video.channel))
          if (path === "/api/v3/live") return send({ items: videos })
          if (path === "/api/v2/users/live") return send(videos)
          if (path === "/statics/orgsV2.json")
            return send([{ name: "Hololive" }])
          if (path === "/statics/topics.json") return send([])
          if (path === "/api/v2/topics")
            return send(topics.map((id) => ({ id, count: 1 })))
          const topic = /^\/api\/v2\/videos\/([^/]+)\/topic$/.exec(path)
          if (topic) return send(videoTopics[topic[1]] ?? {})
          if (path === "/api/v2/topics/videos" && request.method === "POST") {
            const editor = ["editor", "admin"].includes(user.role)
            if (
              !Array.isArray(body.videoIds) ||
              !body.videoIds.length ||
              body.videoIds.some(
                (id) => typeof id !== "string" || !id.trim()
              ) ||
              new Set(body.videoIds).size > 2000 ||
              (!editor && body.topicId == null) ||
              (body.topicId != null && !topics.includes(body.topicId))
            ) {
              response.statusCode = 400
              return send({ message: "Invalid topic edit" })
            }
            const updated_video_ids = [],
              skipped_video_ids = []
            for (const id of new Set(body.videoIds)) {
              const row = videoTopics[id]
              if (
                !row ||
                (!editor && row.topic_id && row.topic_approver_id !== user.id)
              )
                skipped_video_ids.push(id)
              else {
                row.topic_id = body.topicId ?? null
                row.topic_approver_id = user.id
                videos.find((video) => video.id === id).topic_id = row.topic_id
                updated_video_ids.push(id)
              }
            }
            return send({ updated_video_ids, skipped_video_ids })
          }
          if (path.startsWith("/statics/channel/"))
            return send(
              videos
                .map((video) => video.channel)
                .find((channel) => path.endsWith(`/${channel.id}.json`)) ??
                guest
            )
          if (path === "/api/v3/search/autocomplete")
            return send({ vtuber: [guest] })
          if (path === "/api/v3/mentions/get")
            return send(
              Object.fromEntries(
                body.ids
                  .filter((id) => mentions[id]?.length)
                  .map((id) => [id, mentions[id]])
              )
            )
          const match = /^\/api\/v2\/videos\/([^/]+)\/mentions$/.exec(path)
          if (match && request.method === "GET")
            return send(mentions[match[1]] ?? [])
          if (match && request.method === "POST") {
            const rows = (mentions[match[1]] ??= [])
            if (!rows.some((channel) => channel.id === body.channel_id))
              rows.push(guest)
            return send(1)
          }
          const detail = /^\/api\/v2\/videos\/([^/]+)$/.exec(path)
          if (detail) {
            const video = videos.find((entry) => entry.id === detail[1])
            if (video)
              return send({
                ...video,
                ...relationships[video.id],
                mentions: mentions[video.id] ?? [],
              })
          }
          if (path.startsWith("/api/v3/smart/")) {
            if (!["editor", "admin"].includes(user.role)) {
              response.statusCode = 403
              return send({ message: "Insufficient permissions" })
            }
            const selected = videos.filter((video) =>
              body.videoIds?.includes(video.id)
            )
            if (!selected.length || selected.length !== body.videoIds.length) {
              response.statusCode = 400
              return send({ message: "Invalid videos" })
            }
            const action = path.split("/").at(-1)
            let result
            if (action === "merge-participants") {
              const participants = new Map(
                selected
                  .flatMap((video) => [
                    ...(mentions[video.id] ?? []),
                    video.channel,
                  ])
                  .filter((channel) => channel.type === "vtuber")
                  .map((channel) => [channel.id, channel])
              )
              for (const video of selected)
                mentions[video.id] = [
                  ...new Map(
                    [
                      ...(mentions[video.id] ?? []),
                      ...participants.values(),
                    ].map((channel) => [channel.id, channel])
                  ).values(),
                ]
              result = {
                updated_video_ids: selected.map((video) => video.id),
                participants: [...participants.values()].map((channel) => ({
                  channel_id: channel.id,
                  name: channel.name,
                })),
              }
            } else if (action === "make-simulcast" || action === "make-refer") {
              const field =
                action === "make-simulcast" ? "simulcasts" : "refers"
              for (const video of selected)
                relationships[video.id][field] = [
                  ...new Map(
                    [
                      ...relationships[video.id][field],
                      ...selected
                        .filter((other) => other.id !== video.id)
                        .map((other) => ref(other.id)),
                    ].map((reference) => [reference.id, reference])
                  ).values(),
                ]
              result =
                action === "make-simulcast"
                  ? {
                      simulcast_group_id: selected[0].id,
                      group_size: selected.length,
                    }
                  : { links_created: selected.length * (selected.length - 1) }
            } else if (action === "dissociate-video") {
              if (!relationships[body.targetVideoId]) {
                response.statusCode = 400
                return send({ message: "Target missing" })
              }
              let removed = 0
              for (const video of selected)
                for (const field of ["sources", "refers", "simulcasts"]) {
                  const before = relationships[video.id][field]
                  relationships[video.id][field] = before.filter(
                    (reference) => reference.id !== body.targetVideoId
                  )
                  removed +=
                    before.length - relationships[video.id][field].length
                }
              for (const field of ["clips", "simulcasts"])
                relationships[body.targetVideoId][field] = relationships[
                  body.targetVideoId
                ][field].filter(
                  (reference) => !body.videoIds.includes(reference.id)
                )
              result = {
                removed_count: removed,
                target_video_id: body.targetVideoId,
              }
            } else if (
              action === "remove-mentions" ||
              action === "dissociate-channel"
            ) {
              let removed = 0
              for (const video of selected) {
                const before = mentions[video.id] ?? []
                mentions[video.id] =
                  action === "remove-mentions"
                    ? []
                    : before.filter((channel) => channel.id !== body.channelId)
                removed += before.length - mentions[video.id].length
              }
              result =
                action === "remove-mentions"
                  ? {
                      processed_count: selected.length,
                      mentions_removed_count: removed,
                    }
                  : { updated_video_count: removed, channel_id: body.channelId }
            }
            if (result) return send({ success: true, result })
          }
          response.statusCode = 404
          send({ message: "No external API is connected in this fixture." })
        })
      },
    },
  ],
})
await server.listen()
server.printUrls()
