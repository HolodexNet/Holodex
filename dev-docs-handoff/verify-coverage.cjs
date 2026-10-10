// Read-only source inspection; does not import/start the API or contact services.
const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');
const root = path.resolve(__dirname, '..');
const join = (a,b) => (a + '/' + b).replace(/\/{2,}/g,'/').replace(/\/$/,'') || '/';
function resolveImport(file, spec) {
  if (!spec.startsWith('.')) return null;
  const base = path.resolve(path.dirname(file), spec);
  return [base+'.ts', path.join(base,'index.ts')].find(p => fs.existsSync(p));
}
const routes = [];
function scan(file, prefix) {
  const source = ts.createSourceFile(file,fs.readFileSync(file,'utf8'),ts.ScriptTarget.Latest,true);
  const imports = new Map();
  for (const stmt of source.statements) {
    if (ts.isImportDeclaration(stmt) && stmt.importClause?.name) imports.set(stmt.importClause.name.text,resolveImport(file,stmt.moduleSpecifier.text));
  }
  // Only top-level route declarations, not commented examples or callback code.
  for (const stmt of source.statements) {
    if (!ts.isExpressionStatement(stmt) || !ts.isCallExpression(stmt.expression)) continue;
    const call = stmt.expression;
    if (!ts.isPropertyAccessExpression(call.expression)) continue;
    const receiver = call.expression.expression;
    if (!ts.isIdentifier(receiver) || !['router','placeholder'].includes(receiver.text)) continue;
    const method = call.expression.name.text;
    if (!['get','post','put','patch','delete','use'].includes(method)) continue;
    const first = call.arguments[0];
    if (!first || !ts.isStringLiteral(first)) continue;
    const url = join(prefix,first.text).replace('/(.*)','/*');
    if (method === 'use') {
      const target = call.arguments[1];
      const imported = target && ts.isIdentifier(target) && imports.get(target.text);
      if (imported && /\bRouter\s*\(/.test(fs.readFileSync(imported,'utf8'))) scan(imported,url);
      else if (first.text) routes.push({method:'GET',path:url});
    } else routes.push({method:method.toUpperCase(),path:url});
  }
}
const base = path.join(root,'src/apps/client-api/routes');
for (const [file,prefix] of [['calendar.ts',''],['statics/index.ts',''],['v2/index.ts','/v2'],['v3/index.ts','/v3'],['channel-redirect.ts','']]) scan(path.join(base,file),prefix);
routes.push({method:'GET',path:'/clusterMetrics'});
function documentFor(p) {
  if (p.startsWith('/v2/musicdex') || p.startsWith('/v2/songs')) return 'musicdex.md';
  if (/^\/v2\/videos\/placeholder/.test(p)) return 'placeholders.md';
  if (/chats|scripteditor|\/script$|^\/v2\/tlutil/.test(p)) return 'translations.md';
  if (/mentions|^\/v3\/smart|^\/v2\/topics|\/topic$/.test(p)) return 'curation.md';
  if (/^\/v[23]\/search|^\/v2\/comments|\/comments$|^\/v2\/videos\/es/.test(p)) return 'search-and-comments.md';
  if (/^\/v2\/(playlist|video-playlist)|^\/v2\/users\/playlists/.test(p)) return 'video-playlists.md';
  if (/^\/v2\/user/.test(p)) return 'auth-and-favorites.md';
  if (/^\/v2\/channels/.test(p)) return 'channels.md';
  if (/^\/v[23]\/(videos|live)/.test(p)) return 'videos-and-live.md';
  if (/^\/v2\/(reports|external|debug|multiview)|^\/clusterMetrics$/.test(p)) return 'reports-and-utilities.md';
  return 'static-feeds.md';
}
const inventory = routes.map(r=>({...r,document:documentFor(r.path)}));
if (process.argv.includes('--write-index')) {
  const features = [
    ['conventions.md','Shared contract','Transport, API access, JWT, rate limits, errors, caching, wire types'],
    ['videos-and-live.md','Videos and schedules','v2/v3 lists and detail, live/upcoming, pagination and includes'],
    ['channels.md','Channels','Directory, handles, uploads, clips, collaborations, recrawl'],
    ['auth-and-favorites.md','Accounts and favorites','Provider login/linking, JWT refresh, keys, favorites and personalized schedules'],
    ['video-playlists.md','Saved video playlists','Create/save/delete, ordered videos and membership'],
    ['search-and-comments.md','Search and comments','v2/v3 search, autocomplete, raw/connector search, saved comments and renew'],
    ['curation.md','Curation','Mentions, topics, approvals, smart relationship actions'],
    ['placeholders.md','Placeholders','Events, external/scheduled streams, metadata and management auth'],
    ['translations.md','Translations','Archived/live chat, script edits/uploads, migration and Socket.IO'],
    ['musicdex.md','Songs and Musicdex','Song curation, playlists/radio, discovery, likes, stars, history and search'],
    ['reports-and-utilities.md','Reports and utilities','Moderation/contact, external notice, multiview tracking, debug and metrics'],
    ['static-feeds.md','Public feeds and media','Organizations/stats/topics, images, oEmbed, calendars and redirects'],
  ];
  let out = '# Holodex API handoff index\n\nGenerated from the current local holoapi backend on 2026-10-08. This directory documents the mounted client API, including local uncommitted changes. Examples are illustrative; no live requests or database mutations were performed. Read [conventions.md](conventions.md) first for access, response decoding, wire types, limits, and caching.\n\n## Feature documents\n\n| Feature | Handoff | Coverage |\n|---|---|---|\n';
  for (const [doc,feature,scope] of features) out += `| ${feature} | [${doc}](${doc}) | ${scope} |\n`;
  out += `\n## Route coverage\n\n${inventory.length} explicit HTTP method/path registrations are covered below. Paths are relative to the API origin; trailing slashes are ignored. Auth/payload/response details belong to the linked feature document. Socket.IO subscriptions/events are covered by [translations.md](translations.md), separate from this HTTP inventory.\n\n| Method | Mounted path | Handoff |\n|---|---|---|\n`;
  for (const r of inventory) out += `| ${r.method} | \`${r.path}\` | [${r.document}](${r.document}) |\n`;
  out += '\n## Scope and known gaps\n\n- Covered: every explicit registration reachable from the client API calendar/statics/v2/v3/redirect roots, plus the directly registered cluster metrics route. Framework-generated HEAD/OPTIONS and Socket.IO transport internals are not separate product contracts.\n- Not mounted: tag/rotation routes, bot routes, and commented-out v3 comment search. Their source presence does not make them available endpoints.\n- Other backend processes (image service, Discord bot, crawlers, scheduler) are outside this frontend client-API handoff. Deployment proxy prefixes, ingress restrictions, provider configuration and upstream service schemas require environment-specific verification.\n- Important current-code limitations: bulk mentions edits only the first video; favorite discovery caching can bypass JWT and cross user boundaries; empty favorite video filters can broaden results; playlist saves have inconsistent concurrency handling; several GET routes mutate state. These are documented as existing behavior, not fixed by this documentation change.\n- The checked-in OpenAPI inventory is not a payload schema and can lag local routes (including cluster metrics). The mounted source graph is authoritative for this handoff.\n\n## Refresh and verification\n\nRun `node handoff/verify-coverage.cjs` from the repository root to verify local links, route mapping, and documented route names against source without starting the server. After updating feature contracts, run `node handoff/verify-coverage.cjs --write-index` to regenerate the route table. Re-review auth, DTOs, handlers, controller behavior, and caches on backend changes; inventory verification alone does not validate payload correctness.\n';
  fs.writeFileSync(path.join(__dirname,'index.md'),out);
}
const failures=[];
const indexPath=path.join(__dirname,'index.md');
const index=fs.existsSync(indexPath)?fs.readFileSync(indexPath,'utf8'):'';
for (const r of inventory) {
  const doc=path.join(__dirname,r.document);
  if (!index.includes(`| ${r.method} | \`${r.path}\` | [${r.document}]`)) failures.push(`Index missing ${r.method} ${r.path}`);
  if (!fs.existsSync(doc)) failures.push(`Missing ${r.document}`);
  else {
    const body=fs.readFileSync(doc,'utf8');
    // Musicdex paths are documented relative to their explicit shared prefix.
    const relative=r.path.replace(/^\/v2\/musicdex/,'');
    if (!body.includes(r.path) && !(r.path.startsWith('/v2/musicdex') && body.includes('`'+relative+'`'))) failures.push(`Feature doc missing path ${r.path}`);
  }
}
for (const name of fs.readdirSync(__dirname).filter(x=>x.endsWith('.md'))) {
  const body=fs.readFileSync(path.join(__dirname,name),'utf8');
  for (const match of body.matchAll(/\]\(([^)]+\.md)\)/g)) if (!fs.existsSync(path.resolve(__dirname,match[1]))) failures.push(`Broken link ${name}: ${match[1]}`);
  if ((body.match(/^```/gm)||[]).length%2) failures.push(`Unbalanced fence ${name}`);
  for (const match of body.matchAll(/```json\r?\n([\s\S]*?)\r?\n```/g)) {
    try { JSON.parse(match[1]); } catch (error) { failures.push(`Invalid JSON example ${name}: ${error.message}`); }
  }
}
if (failures.length) { console.error(failures.join('\n')); process.exitCode=1; }
else console.log(`Verified ${inventory.length} mounted routes, feature mappings, Markdown links and code fences.`);
