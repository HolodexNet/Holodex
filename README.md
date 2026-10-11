# Holodex

[![MIT License](https://img.shields.io/github/license/RiceCakess/Holodex)](https://github.com/RiceCakess/Holodex/blob/HEAD/LICENSE)
[![Discord Chat](https://img.shields.io/discord/796190073271353385.svg)](https://discord.gg/jctkgHBt4b)
[![Deploy to Prod](https://github.com/RiceCakess/holoclips/workflows/Deploy%20to%20production/badge.svg)](https://github.com/RiceCakess/holoclips/actions?query=workflow%3A%22Deploy+to+production%22)
[![Crowdin](https://badges.crowdin.net/holodex/localized.svg)](https://crowdin.com/project/holodex)
[![Twitter Follow](https://img.shields.io/twitter/follow/holodex?style=social)](https://twitter.com/holodex)

![holodex](https://github.com/RiceCakess/Holodex/blob/dev/public/img/intro-promo.jpg)

## [Changelog](https://github.com/HolodexNet/Holodex/blob/dev/docs/CHANGELOG.md)

## Reporting a Bug/Feature Request

- For bugs, please make sure to include a picture describing the issue (if applicable)
- If the bug is urgent, please send us a message in the Discord server
- Check out the [Project Board](https://github.com/RiceCakess/Holodex/projects) for what we're working on!

## Setup for Development

The active frontend uses React, Vite, TypeScript, Tailwind CSS, and shadcn/ui. Use Node 22.12+ or Node 24+. The backend defaults to `http://localhost:2434`; see [the UI migration guide](docs/ui-rewrite.md) for API configuration, implemented features, and remaining migrations.

```
git clone git@github.com:HolodexNet/Holodex.git
npm ci
npm run dev
# Open http://127.0.0.1:8080
```

## Building

```
npm run build
npm run lint:check
# No tests are required for this UI rewrite.
```

## Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.
Check out the [Project Board](https://github.com/RiceCakess/Holodex/projects) for things being planned

## Project Structure

```
dev-docs-handoff            # Backend integration contracts
docs                       # Migration notes and historical changelog
legacy                     # Previous Vue/Vuetify source, outside the active build
public                     # Static assets
src
├── components/ui          # shadcn / Base UI primitives
├── components/icons       # Iconx-generated Phosphor and Ionicons
├── components             # App shell, cards, shared controls
├── lib                    # API client, types, persisted preferences, theme algorithm
├── pages                  # React route views
├── app.tsx                # Router and providers
└── main.tsx               # Entry point
```

## Historical roadmap

The list below describes the previous application. See [the UI migration guide](docs/ui-rewrite.md) for the scope of the current React frontend.

- [x] Watch Page refresh
- [x] Make repo public
- [x] Add user logins
  - save favorites to database
  - add video commenting??
- [x] Add multi language support
  - Use tagging system?? or maybe just have a row indicating language
- [x] Expand vtuber list
- [ ] Updated tagging system
  - User contributed tagging
  - Tag aliasing
  - Tag categories
- [ ] public API / API key for user account
- [x] live chat features / TL transcript
- [x] music player / radio / tagging songs in singing streams
