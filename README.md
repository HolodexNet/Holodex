# Holodex
[![MIT License](https://img.shields.io/apm/l/atomic-design-ui.svg?)](https://github.com/RiceCakess/holodex/blob/master/LICENSE)
[![Discord Chat](https://img.shields.io/discord/796190073271353385.svg)](https://discord.gg/)
[![Deploy to Prod](https://github.com/RiceCakess/holoclips/workflows/Deploy%20to%20production/badge.svg)](https://github.com/RiceCakess/holoclips/actions?query=workflow%3A%22Deploy+to+production%22)
[![Crowdin](https://badges.crowdin.net/holodex/localized.svg)](https://crowdin.com/project/holodex)



## Reporting a Bug/Feature Request
* For bugs, please make sure to include a picture describing the issue (if applicable)
* If the bug is urgent, please send us a message in the Discord server
* Check out the [Project Board](https://github.com/RiceCakess/Holodex/projects) for known issues/progress 
## Setup for Development
```
git clone git@github.com:RiceCakess/Holodex.git
npm install
# By default the api url points to localhost, change to "https://holodex.net/api/v2" in util/backend.js if working on frontend only
npm run serve
```

## Building
```
npm run build
# Analyzing build bundle size
npm run analyze-build
```
## Contributing
Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.
Check out the [Project Board](https://github.com/RiceCakess/Holodex/projects) for things being planned

## Project Structure
```
├── components              # Vue components
├── locales                 # UI text translations for each languages
├── plugins                 # Vuetify, i18n and other plugin definitions
├── router                  # Router definitions for path and views
├── store                   # Vuex store modules, each file loosley corresponds to each page. All api calls go through here
├── utils                   # Utility functions
├── views                   # Page defintions
└── App.vue                 # Main entry point, sets up router-view
```

## Suggested VSCode Extensions
```
antfu.i18n-ally
irongeek.vscode-env
jpruliere.env-autocomplete
lukas-tr.materialdesignicons-intellisense
octref.vetur
jcbuisson.vue
dbaeumer.vscode-eslint
intellsmi.comment-translate
```

## Roadmap
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
