# Holodex

## Reporting a Bug/Feature Request
* For bugs, please make sure to include a picture describing the issue (if applicable)
* If the bug is urgent, please send us a message in the Discord server

## Setup for Development
```
git clone git@github.com:RiceCakess/holoclips.git
npm install
npm run serve
```

## Suggested VSCode Extensions
```
formulahendry.auto-close-tag
antfu.i18n-ally
irongeek.vscode-env
jpruliere.env-autocomplete
lukas-tr.materialdesignicons-intellisense
octref.vetur
jcbuisson.vue
dbaeumer.vscode-eslint
intellsmi.comment-translate
```

## Contributing
Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change. 

## Project Structure
```
├── components              # Vue components
├── locales                 # UI text translations for each languages
├── plugins                 # Vuetify and other plugin files
├── router                  # Router definitions for path and views
├── store                   # Vuex store modules, each file loosley corresponds to each page. All api calls go through here
├── utils                   # Utility functions
├── views                   # Page defintions
└── App.vue                 # Main entry point, sets up router-view
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
- [ ] live chat features / TL transcript 
- [ ] music player / radio / tagging songs in singing streams
